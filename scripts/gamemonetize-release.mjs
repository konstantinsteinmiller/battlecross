#!/usr/bin/env node
/**
 * The GameMonetize release gate — run on the BUILT output, before anything is
 * packed for upload. `pnpm build:gamemonetize` runs it after `vite build`.
 *
 *   node scripts/gamemonetize-release.mjs              gates dist/, then packs
 *                                                      dist/Battlecross-gamemonetize.zip
 *   node scripts/gamemonetize-release.mjs --audit-only gates, packs nothing
 *   node scripts/gamemonetize-release.mjs --twin       builds the UNOBFUSCATED twin
 *                                                      into dist-gamemonetize-clear/
 *                                                      and gates that (no zip)
 *   --dist <dir>         gate another folder
 *   --allow-missing-id   gate (and pack) without a game id — for a QA build
 *                        only; the zip is then named `…-NO-GAME-ID.zip`
 *
 * Exit code 1 on any FAIL, so the zip never exists for a build that would be
 * rejected.
 *
 * What it refuses, and why each one is here:
 *
 *   • NO GAME ID. The plugin switches itself off when `VITE_GAME_ID` is blank:
 *     the build boots and plays and never requests an ad, and GameMonetize's
 *     review rejects exactly that ("Ads should be shown the first time after
 *     the game loads"). The id comes from the GameMonetize dashboard after the
 *     game is created there, so this is the gate that stays red until the
 *     owner has done that.
 *   • NOT THIS PLATFORM'S BUILD. `dist/` is shared by every portal build; the
 *     GameMonetize SDK URL must be in it, or this is somebody else's bundle.
 *   • ANOTHER PORTAL'S SDK, a child-directed ad flag, our leaderboard Worker,
 *     an ad-tech probe — strings a reviewer greps for, or requests the
 *     release must not make. On the obfuscated build a MISS proves little (a
 *     literal can sit in the string table); run `--twin` for the audit that
 *     can be believed. A HIT is real either way.
 *   • SOURCE MAPS, absolute asset paths, `index.html` not at the root — the
 *     structural ones.
 *
 * Size: GameMonetize publishes no hard limit that could be verified (2026-10),
 * so the gate reports it and warns past the 50 MB CrazyGames ceiling, the
 * strictest one in the matrix.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { extname, join, relative, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { inspectZip, listZip, zipDir } from '../tools/poki-deploy/lib/zip.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const has = (f) => argv.includes(`--${f}`)
const arg = (f, d) => { const i = argv.indexOf(`--${f}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d }

const TWIN = has('twin')
const AUDIT_ONLY = has('audit-only') || TWIN
const ALLOW_MISSING_ID = has('allow-missing-id')
const DIST = resolve(root, arg('dist', TWIN ? 'dist-gamemonetize-clear' : 'dist'))
const ZIP_NAME = 'Battlecross-gamemonetize'

/** The SDK URL the plugin injects: present in a GameMonetize build only. */
const FINGERPRINT = 'api.gamemonetize.com/sdk.js'

/** Strings that mean another portal's integration survived into this bundle —
 *  each a URL or global the other portal's SDK actually loads or reads, not a
 *  mere mention of a portal name (capability flag names carry those). */
const FOREIGN_MARKERS = [
  'sdk.crazygames.com', 'CrazyGames.SDK',
  'html5.api.gamedistribution.com', 'gdsdk',
  'playgama.com/bridge', 'bridge.playgama.com', '@playgama/bridge',
  'integration.gamepix.com', 'gamepix.com/sdk',
  'game-cdn.poki.com', 'PokiSDK',
  'yandex.ru/games/sdk', 'yandex.ru/ads', 'an.yandex.ru', 'yastatic.net',
  'youtube.com/game_api', 'ytgame',
  'api.glitch.fun', 'WavedashJS', 'convex.cloud',
  'peerjs.com', 'getpantry.cloud', 'jsonbin.io', 'clarity.ms', 'sentry.io'
]

/** Requests this release must not make, and flags it must not carry. */
const FORBIDDEN = [
  { text: 'tagForChildDirectedTreatment', why: 'child-directed ad flags are Tauri / app-store only (owner decision 2026-10-02)' },
  { text: 'workers.dev', why: 'the live leaderboard Worker — the GameMonetize build bakes its board' },
  { text: 'googlesyndication.com', why: 'an ad-tech request of our own (the old ad-block probe)' },
  { text: '2mdn.net', why: 'an ad-tech request of our own (the old ad-block probe)' }
]

const results = []
const pass = (name, detail) => results.push({ level: 'pass', name, detail })
const fail = (name, detail) => results.push({ level: 'fail', name, detail })
const warn = (name, detail) => results.push({ level: 'warn', name, detail })

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}
const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg', '.webmanifest'])
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`

// ── The twin build ───────────────────────────────────────────────────────────
if (TWIN) {
  console.log(`[gamemonetize] building the unobfuscated twin into ${relative(root, DIST)}/ …`)
  // A child process with the obfuscator switched off through the environment
  // (process env outranks the .env files). Everything else is the release
  // configuration, so the two bundles differ only in readability.
  const r = spawnSync(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build', '--mode', 'gamemonetize', '--base=./', `--outDir=${DIST}`, '--emptyOutDir'], {
    cwd: root, stdio: 'inherit', windowsHide: true,
    env: { ...process.env, VITE_ENABLE_OBFUSCATION: 'false', VITE_GAME_ID: process.env.VITE_GAME_ID || 'twin-audit-placeholder' }
  })
  if (r.status !== 0) { console.error('[gamemonetize] the twin build failed'); process.exit(1) }
}

// ── 0. the game id ───────────────────────────────────────────────────────────
// What the build saw: the env files for this mode, outranked by the process
// environment (as in Vite itself).
const env = { ...loadEnv('gamemonetize', root, ''), ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('VITE_'))) }
const gameId = (env.VITE_GAME_ID ?? '').trim()
if (TWIN) pass('game id', 'not required for the audit twin')
else if (gameId) pass('game id', gameId)
else if (ALLOW_MISSING_ID) warn('game id', 'EMPTY — allowed by --allow-missing-id; this build shows NO ads and must not be uploaded')
else fail('game id', 'VITE_GAME_ID is empty in .env.gamemonetize.local. Create Battlecross on gamemonetize.com, paste its id, rebuild. Without it the build shows no ads and GameMonetize rejects it.')

// ── 1. the build exists, is THIS platform's, index.html at the root ──────────
if (!existsSync(join(DIST, 'index.html'))) {
  fail('built output', `${DIST}/index.html is missing — run the build first`)
} else {
  const files = walk(DIST).filter(f => !f.endsWith('.zip'))
  const html = readFileSync(join(DIST, 'index.html'), 'utf8')
  const texts = files.filter(f => TEXT.has(extname(f))).map(f => [f, readFileSync(f, 'utf8')])

  pass('index.html at the root of the build')
  if (texts.some(([, body]) => body.includes(FINGERPRINT))) pass('this is a GameMonetize build', `the bundle loads ${FINGERPRINT}`)
  else fail('this is a GameMonetize build', `no "${FINGERPRINT}" anywhere in ${relative(root, DIST)}/ — another portal's build? Rebuild with pnpm build:gamemonetize`)

  // ── 2. relative paths (the archive is served from a GameMonetize sub-path) ─
  const absolute = [...html.matchAll(/(?:src|href)=["'](\/[^/"'][^"']*)["']/g)].map(m => m[1])
  if (absolute.length) fail('relative asset paths', `index.html references ${absolute.slice(0, 4).join(', ')} — build with --base=./`)
  else pass('relative asset paths')

  // ── 3. no source maps ──────────────────────────────────────────────────────
  const maps = files.filter(f => f.endsWith('.map'))
  const mapRefs = texts.filter(([, b]) => /\/\/# sourceMappingURL=/.test(b)).length
  if (maps.length || mapRefs) fail('no source maps', `${maps.length} .map files, ${mapRefs} sourceMappingURL comments`)
  else pass('no source maps')

  // ── 4. bundle purity ───────────────────────────────────────────────────────
  const foreign = []
  for (const [f, body] of texts) for (const m of FOREIGN_MARKERS) if (body.includes(m)) foreign.push(`${relative(DIST, f)} → ${m}`)
  if (foreign.length) fail('no other portal\'s SDK or service in the bundle', foreign.slice(0, 8).join('; '))
  else pass('no other portal\'s SDK or service in the bundle', `${FOREIGN_MARKERS.length} markers absent`)

  const forbidden = []
  for (const [f, body] of texts) for (const { text, why } of FORBIDDEN) if (body.includes(text)) forbidden.push(`${relative(DIST, f)} → ${text} (${why})`)
  if (forbidden.length) fail('no forbidden request or flag', forbidden.slice(0, 6).join('; '))
  else pass('no forbidden request or flag', FORBIDDEN.map(f => f.text).join(', '))

  // The CSP meta tag is the one place a whole host list lives: it must name
  // GameMonetize and nobody else.
  const csp = /<meta[^>]+Content-Security-Policy[^>]+content="([^"]*)"/i.exec(html)?.[1] ?? ''
  if (!csp) warn('CSP meta tag', 'none — expected the GameMonetize policy')
  else {
    const others = [...new Set([...csp.matchAll(/https:\/\/(\*\.)?([a-z0-9.-]+)/gi)].map(m => m[2]).filter(h => !/gamemonetize\.com?$/.test(h)))]
    if (others.length) fail('CSP names GameMonetize only', others.join(', '))
    else pass('CSP names GameMonetize only')
  }

  // ── 5. size ────────────────────────────────────────────────────────────────
  const total = files.reduce((n, f) => n + statSync(f).size, 0)
  const backups = files.filter(f => /-original\.(png|jpe?g|webp)$/i.test(f))
  if (backups.length) fail('no compression backups', `${backups.length} *-original.* files would ship`)
  ;(total <= 50 * 1024 * 1024 ? pass : warn)('size', `${mb(total)} across ${files.length} files`)
}

// ── report ───────────────────────────────────────────────────────────────────
const failed = results.filter(r => r.level === 'fail')
for (const r of results) console.log(`  ${r.level === 'pass' ? 'PASS' : r.level === 'fail' ? 'FAIL' : 'WARN'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`)
if (failed.length) {
  console.error(`\n[gamemonetize] ${failed.length} gate(s) failed — NOT packing an upload archive.`)
  process.exit(1)
}
if (AUDIT_ONLY) { console.log('\n[gamemonetize] gates passed (audit only, nothing packed).'); process.exit(0) }

// ── pack ─────────────────────────────────────────────────────────────────────
const out = join(DIST, `${ZIP_NAME}${gameId ? '' : '-NO-GAME-ID'}.zip`)
for (const f of readdirSync(DIST)) if (f.startsWith(ZIP_NAME) && f.endsWith('.zip')) rmSync(join(DIST, f), { force: true })
zipDir(DIST, out, { exclude: n => n.endsWith('.zip') || n.endsWith('.map') })
const info = inspectZip(out)
if (!info.ok) { console.error(`[gamemonetize] ${info.why}`); process.exit(1) }
if (!listZip(out).includes('index.html')) { console.error('[gamemonetize] index.html is not at the archive root'); process.exit(1) }
console.log(`\n[gamemonetize] ${relative(root, out)} (${mb(info.bytes)}, ${info.entries} files) — upload this on gamemonetize.com`)
