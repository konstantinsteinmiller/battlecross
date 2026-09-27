#!/usr/bin/env node
// ─── youtube-fit-audit.mjs ───────────────────────────────────────────────────
//
// The MECHANICAL half of the `youtube-fit` skill: everything about a YouTube
// Playables submission (which IS the Playgama archive) that can be decided by
// reading bytes rather than by playing the game.
//
// It never claims a PASS it cannot prove. A check it cannot evaluate reports
// SKIP with the reason; a requirement that needs a human reports MANUAL. Both
// are carried into the report so the agent has to answer them.
//
// Usage:
//   node youtube-fit-audit.mjs [options]
//
//   --root <dir>            project root                      (default: cwd)
//   --dist <dir>            built archive contents            (default: <root>/dist)
//   --src  <dir>            source tree                       (default: <root>/src)
//   --zip  <file>           the .zip actually uploaded        (default: auto-detect)
//   --initial-extra a,b     dist path PREFIXES the loading screen awaits
//                           (art/audio tiers preloaded before game_ready) —
//                           folded into the initial-payload measurement
//   --json <file>           write machine-readable findings
//   --md   <file>           write the markdown finding table
//   --quiet                 suppress the console table
//
// Exit: 0 = no MUST failure, 1 = at least one MUST failure.
//
// Sources encoded here (full register in ../REQUIREMENTS.md):
//   PG      = wiki.playgama.com/platforms/youtube-playables-requirements-for-games
//   YT-STA  = .../playables/certification/requirements_stability
//   YT-INT  = .../requirements_integration
//   YT-DES  = .../requirements_design
//   YT-MON  = .../requirements_monetization
//   YT-PRV  = .../requirements_privacydata
//   YT-TS   = .../requirements_trustsafety
//   YT-I18N = .../requirements_i18n_l10n
//   YT-A11Y = .../requirements_accessibility
//   YT-FAQ  = .../playables/support/certification_faq
//   KONST   = trap measured on a real submission (see `integrate-playgama`)

import { readFileSync, existsSync, statSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, relative, sep, extname, dirname, resolve } from 'node:path'

// ── args ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const flag = (n) => argv.includes(`--${n}`)
function opt(n, def) {
  const i = argv.indexOf(`--${n}`)
  if (i === -1) return def
  const v = argv[i + 1]
  return v && !v.startsWith('--') ? v : def
}

const ROOT = resolve(opt('root', process.cwd()))
const DIST = resolve(opt('dist', join(ROOT, 'dist')))
const SRC = resolve(opt('src', join(ROOT, 'src')))
const QUIET = flag('quiet')
const INITIAL_EXTRA = String(opt('initial-extra', ''))
  .split(',').map((s) => s.trim().replace(/^\.?\//, '')).filter(Boolean)

// ── limits (every one traceable to a source; change only with a source) ─────
const MiB = 1024 * 1024
const LIMIT = {
  initialMust: 30 * MiB,   // YT-STA
  initialShould: 15 * MiB, // YT-STA
  initialIdeal: 5 * MiB,   // YT-STA
  totalMust: 250 * MiB,    // YT-STA
  zipMust: 200 * MiB,      // PG — "ZIP archive can reach up to 200 MB"
  fileMust: 30 * MiB,      // YT-STA + YT-FAQ — "a hard limit", no exemptions
  fileShould: 512 * 1024,  // YT-STA
  saveMust: 3 * MiB,       // YT-STA
  saveShould: 500 * 1024,  // YT-STA
  saveFlush: 64 * 1024,    // YT-INT — final flush
  fileCount: 8000,         // YT-STA
  heapMust: 512 * MiB,     // YT-STA — peak JS heap; runtime check
  loadShould: 5            // YT-STA — seconds to interactive
}

// ── findings ────────────────────────────────────────────────────────────────
const findings = []
const add = (f) => findings.push({ evidence: [], fix: '', ...f })

const human = (b) =>
  b >= MiB ? `${(b / MiB).toFixed(2)} MiB` : b >= 1024 ? `${(b / 1024).toFixed(1)} KiB` : `${b} B`

// ── file walking ────────────────────────────────────────────────────────────
function walk(dir, base = dir, out = []) {
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, base, out)
    else if (e.isFile()) {
      let size = 0
      try { size = statSync(p).size } catch { /* unreadable — count as 0, still listed */ }
      out.push({ abs: p, rel: relative(base, p).split(sep).join('/'), size })
    }
  }
  return out
}

const TEXT_EXT = new Set([
  '.html', '.htm', '.js', '.mjs', '.cjs', '.css', '.json', '.svg',
  '.webmanifest', '.txt', '.ts', '.tsx', '.vue', '.mts'
])
const MAX_TEXT = 12 * MiB

function loadText(files) {
  const out = []
  for (const f of files) {
    if (!TEXT_EXT.has(extname(f.rel).toLowerCase())) continue
    if (f.rel.endsWith('.map')) continue
    if (f.size > MAX_TEXT) continue
    try { out.push({ ...f, text: readFileSync(f.abs, 'utf8') }) } catch { /* skip */ }
  }
  return out
}

const distFiles = existsSync(DIST) ? walk(DIST) : null
const srcFiles = existsSync(SRC) ? walk(SRC) : null
const distText = distFiles ? loadText(distFiles) : []
const srcText = srcFiles ? loadText(srcFiles) : []

// ── grep helpers ────────────────────────────────────────────────────────────
function snippet(text, index, len = 90) {
  return text.slice(Math.max(0, index - 24), Math.max(0, index - 24) + len).replace(/\s+/g, ' ').trim()
}
function lineOf(text, index) {
  let n = 1
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) n++
  return n
}
// A hit whose own line starts with `*`, `//` or `/*` is almost certainly inside
// a comment. Minified dist chunks have no comments, so this only ever softens
// source-tree noise — and it labels rather than drops, because a commented-out
// `localStorage.getItem` next to a live one still deserves a look.
function inComment(text, index) {
  // Inside an HTML comment? `.vue` files routinely open with a `<!-- … -->`
  // doc block whose prose mentions the very APIs being audited, and its
  // continuation lines start with ordinary words, so the line-prefix test
  // below cannot see them. Compare the nearest opener and closer instead.
  const openHtml = text.lastIndexOf('<!--', index)
  if (openHtml !== -1 && text.lastIndexOf('-->', index) < openHtml) return true

  let start = index
  while (start > 0 && text.charCodeAt(start - 1) !== 10) start--
  const head = text.slice(start, index).trimStart()
  return head.startsWith('*') || head.startsWith('//') || head.startsWith('/*')
}
function grep(pool, re, tag, cap = 40) {
  const hits = []
  for (const f of pool) {
    const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
    let m
    while ((m = rx.exec(f.text)) !== null) {
      const line = lineOf(f.text, m.index)
      const note = inComment(f.text, m.index) ? ' [in a comment]' : ''
      hits.push(`${tag}:${f.rel}${line > 1 ? `:${line}` : ''}${note} — ${snippet(f.text, m.index)}`)
      if (hits.length >= cap) return hits
      if (m.index === rx.lastIndex) rx.lastIndex++
    }
  }
  return hits
}
/** Hits that are NOT inside a comment — for checks where a comment is no finding. */
const live = (hits) => hits.filter((h) => !h.includes('[in a comment]'))
/**
 * Status for a MUST-NOT grep. A live hit is a blocker; a hit that only appears
 * inside a comment is NOT — but it is not nothing either (a commented-out call
 * next to a live one, a doc block describing the very API in question), so it
 * lands in the manual register with the evidence attached rather than passing.
 */
const mustNot = (hits) => (live(hits).length ? 'FAIL' : hits.length ? 'MANUAL' : 'PASS')
/**
 * Status for a MUST-NOT that was greped across BOTH trees.
 *
 * The submitted artefact is `dist/`, so dist decides. A hit that appears only
 * in `src/` means the call exists in the codebase but did not survive into the
 * build — which is exactly what a correct platform guard looks like, and
 * calling that a blocker sends the reader to fix code that already ships
 * clean. It is still not a PASS: the guard has to be READ, because a string
 * the obfuscator hoisted can hide a live call, and `src/` is also where a
 * second, ungated call site would be. So: dist hit -> FAIL, src-only -> MANUAL.
 */
const mustNotInDist = (distHits, srcHits) =>
  live(distHits).length ? 'FAIL' : (live(srcHits).length || distHits.length) ? 'MANUAL' : 'PASS'
const grepDist = (re, cap) => grep(distText, re, 'dist', cap)
const grepSrc = (re, cap) => grep(srcText, re, 'src', cap)
const grepBoth = (re, cap) => [...grepDist(re, cap), ...grepSrc(re, cap)]

const indexHtml = distText.find((f) => f.rel === 'index.html')

// ═══ A. BUILD SIZE & FILE HYGIENE ═══════════════════════════════════════════

if (!distFiles) {
  add({
    id: 'YTP-BUILD', title: 'A built archive exists to audit', severity: 'MUST',
    source: 'YT-STA', status: 'SKIP',
    evidence: [`no directory at ${DIST}`],
    fix: 'Run the Playgama build (`pnpm build:playgama`) — that archive IS the Playables submission — then re-run this audit against its dist/.'
  })
} else {
  // A1 — total unpacked size
  const total = distFiles.reduce((n, f) => n + f.size, 0)
  add({
    id: 'YTP-SIZE-TOTAL', title: `Total bundle < ${human(LIMIT.totalMust)}`, severity: 'MUST',
    source: 'YT-STA', status: total < LIMIT.totalMust ? 'PASS' : 'FAIL',
    evidence: [`dist/ unpacked = ${human(total)} across ${distFiles.length} files`],
    fix: 'Move non-launch content out of the bundle. Remote data is NOT an alternative — Playables forbids external calls, so "all game data must be included as part of the game bundle" (YT-FAQ).'
  })

  // A2 — initial payload: everything that loads before game_ready
  let initialSet = null
  let initialBasis = ''
  const mfPath = ['.vite/manifest.json', 'manifest.json']
    .map((p) => join(DIST, p)).find(existsSync)
  if (mfPath) {
    try {
      const mf = JSON.parse(readFileSync(mfPath, 'utf8'))
      const seen = new Set()
      const visit = (k) => {
        if (seen.has(k) || !mf[k]) return
        seen.add(k)
        for (const i of mf[k].imports || []) visit(i)   // STATIC imports only
      }
      Object.entries(mf).filter(([, v]) => v.isEntry).forEach(([k]) => visit(k))
      initialSet = new Set()
      for (const k of seen) {
        const v = mf[k]
        if (v.file) initialSet.add(v.file)
        for (const c of v.css || []) initialSet.add(c)
        for (const a of v.assets || []) initialSet.add(a)
      }
      initialBasis = 'vite manifest entry graph — static imports only, dynamic imports excluded'
    } catch { initialSet = null }
  }
  if (!initialSet) {
    initialSet = new Set()
    if (indexHtml) {
      for (const m of indexHtml.text.matchAll(/(?:src|href)\s*=\s*["']\.?\/?([^"'>]+)["']/g)) {
        const p = m[1].replace(/^\.?\//, '')
        if (!/^(https?:)?\/\//.test(p)) initialSet.add(p)
      }
    }
    initialBasis = 'index.html references only (no vite manifest found) — UNDERSTATES the real payload'
  }
  initialSet.add('index.html')
  for (const f of distFiles) {
    if (INITIAL_EXTRA.some((p) => f.rel === p || f.rel.startsWith(p.endsWith('/') ? p : p + '/'))) {
      initialSet.add(f.rel)
    }
  }
  const byRel = new Map(distFiles.map((f) => [f.rel, f]))
  let initialBytes = 0
  const missing = []
  for (const rel of initialSet) {
    const f = byRel.get(rel)
    if (f) initialBytes += f.size
    else missing.push(rel)
  }
  add({
    id: 'YTP-SIZE-INITIAL',
    title: `Initial load (everything before game_ready) < ${human(LIMIT.initialMust)} — SHOULD < ${human(LIMIT.initialShould)}, ideally ${human(LIMIT.initialIdeal)}`,
    severity: 'MUST', source: 'YT-STA + PG',
    status: initialBytes >= LIMIT.initialMust ? 'FAIL' : initialBytes >= LIMIT.initialShould ? 'WARN' : 'PASS',
    evidence: [
      `measured ${human(initialBytes)} over ${initialSet.size - missing.length} files`,
      `basis: ${initialBasis}`,
      INITIAL_EXTRA.length
        ? `--initial-extra folded in: ${INITIAL_EXTRA.join(', ')}`
        : 'NO --initial-extra given: runtime-loaded art/audio that the loading screen AWAITS is not counted, so this is a FLOOR, not the answer.',
      ...(missing.length ? [`manifest named ${missing.length} file(s) absent from dist (${missing.slice(0, 4).join(', ')})`] : [])
    ],
    fix: 'Cut the pre-game_ready payload: lazy-import everything the first playable frame does not need, and hold late art tiers behind game_ready. Then confirm the real figure with the Playables SDK Test Suite pointed at the uploaded build — it reports the actual measured initial size (from download start until gameReady fires).'
  })

  // A3 — per-file size
  const tooBig = distFiles.filter((f) => f.size >= LIMIT.fileMust)
  const chunky = distFiles.filter((f) => f.size >= LIMIT.fileShould && f.size < LIMIT.fileMust)
    .sort((a, b) => b.size - a.size)
  add({
    id: 'YTP-SIZE-FILE', title: `No single file >= ${human(LIMIT.fileMust)}`, severity: 'MUST',
    source: 'YT-STA + YT-FAQ', status: tooBig.length ? 'FAIL' : 'PASS',
    evidence: tooBig.length ? tooBig.map((f) => `${f.rel} = ${human(f.size)}`) : ['largest file within budget'],
    fix: 'Split the file. YT-FAQ calls the per-file cap "a hard limit" with no exemptions — an atlas or an audio bank over it has to be cut in two.'
  })
  add({
    id: 'YTP-SIZE-FILE-SOFT', title: `Files SHOULD stay under ${human(LIMIT.fileShould)}`, severity: 'SHOULD',
    source: 'YT-STA', status: chunky.length ? 'WARN' : 'PASS',
    evidence: chunky.slice(0, 12).map((f) => `${f.rel} = ${human(f.size)}`),
    fix: 'Run `compress-images-pipeline` over the art and split oversized chunks. Check which of these land before game_ready — those count twice.'
  })

  // A4 — file count
  add({
    id: 'YTP-FILECOUNT', title: `Bundle holds at most ${LIMIT.fileCount} files`, severity: 'MUST',
    source: 'YT-STA', status: distFiles.length <= LIMIT.fileCount ? 'PASS' : 'FAIL',
    evidence: [`${distFiles.length} files`],
    fix: 'Pack loose assets into atlases/sprite sheets or a single JSON bank.'
  })

  // A5 — filename charset
  const badNames = distFiles.filter((f) => /[^A-Za-z0-9_.\-/]/.test(f.rel))
  add({
    id: 'YTP-FILENAME', title: 'File and directory names use only [A-Za-z0-9_.-]', severity: 'MUST',
    source: 'YT-STA', status: badNames.length ? 'FAIL' : 'PASS',
    evidence: badNames.slice(0, 20).map((f) => f.rel),
    fix: 'Rename the offenders (spaces, @, brackets, non-ASCII) and fix every reference. Vite derives asset names from the source filename — rename at the source, not in dist.'
  })

  // A6 — the uploaded zip
  let zipPath = opt('zip', null)
  if (!zipPath) {
    const cands = [
      ...distFiles.filter((f) => f.rel.endsWith('.zip')),
      ...(existsSync(ROOT)
        ? readdirSync(ROOT).filter((n) => n.endsWith('.zip'))
          .map((n) => ({ abs: join(ROOT, n), rel: n, size: statSync(join(ROOT, n)).size }))
        : [])
    ]
    const pg = cands.find((f) => /playgama/i.test(f.rel)) || cands[0]
    if (pg) zipPath = pg.abs
  }
  if (zipPath && existsSync(zipPath)) {
    const zs = statSync(zipPath).size
    add({
      id: 'YTP-ZIP', title: `Uploaded ZIP <= ${human(LIMIT.zipMust)}`, severity: 'MUST',
      source: 'PG', status: zs <= LIMIT.zipMust ? 'PASS' : 'FAIL',
      evidence: [`${relative(ROOT, zipPath).split(sep).join('/')} = ${human(zs)}`],
      fix: 'Shrink the archive — Playgama states the ZIP may reach 200 MB.'
    })
    // Deliberately a WARN, not a blocker. The common build script tars dist/
    // and only THEN moves the zip in, and vite empties outDir on the next run,
    // so the uploaded archive normally does NOT contain itself — checking that
    // claim on a real project is what demoted this from a MUST. What remains is
    // real but smaller: the zip inflates every size measurement taken from
    // dist/, and a manual re-zip of the folder would swallow it.
    const nested = distFiles.filter((f) => f.rel.endsWith('.zip'))
    if (nested.length) {
      add({
        id: 'YTP-ZIP-INSIDE', title: 'A .zip sits inside the directory the archive is built from', severity: 'SHOULD',
        source: 'YT-STA', status: 'WARN',
        evidence: [
          ...nested.map((f) => `${f.rel} = ${human(f.size)}`),
          'size figures measured from dist/ include this file; subtract it'
        ],
        fix: 'Harmless for the artefact itself as long as the zip is created BEFORE it is moved in and the next build empties the folder — confirm both. It still skews every size audit of dist/ and would be swallowed by a manual re-zip, so prefer writing the archive outside the build folder.'
      })
    }
  } else {
    add({
      id: 'YTP-ZIP', title: `Uploaded ZIP <= ${human(LIMIT.zipMust)}`, severity: 'MUST',
      source: 'PG', status: 'SKIP', evidence: ['no .zip found; pass --zip <file>'],
      fix: 'Build the Playgama archive and re-run with --zip.'
    })
  }

  // A7 — pre-compressed payloads
  const precomp = distFiles.filter((f) => /\.(gz|br|zst|unityweb)$/i.test(f.rel))
  add({
    id: 'YTP-PRECOMPRESS', title: 'No pre-compressed payloads without a decompression fallback', severity: 'MUST',
    source: 'PG + YT-FAQ', status: precomp.length ? 'WARN' : 'PASS',
    evidence: precomp.slice(0, 10).map((f) => f.rel),
    fix: 'Playgama: no compression allowed, a decompression fallback is acceptable. YT-FAQ: if you must pre-compress, use zip and decompress manually via the Compression Streams API. HTTP compression is applied by the platform automatically — do not hand-roll it.'
  })

  // A8 — sourcemaps
  const maps = distFiles.filter((f) => f.rel.endsWith('.map'))
  add({
    id: 'YTP-SOURCEMAPS', title: 'No sourcemaps in the submitted archive', severity: 'SHOULD',
    source: 'YT-STA', status: maps.length ? 'WARN' : 'PASS',
    evidence: maps.slice(0, 6).map((f) => `${f.rel} = ${human(f.size)}`),
    fix: 'Sourcemaps are dead weight against the total/per-file budgets and hand over the source. Disable `build.sourcemap` for the playgama mode.'
  })

  // A9 — relative paths only
  if (indexHtml) {
    const abs = [
      ...grep([indexHtml], /(?:src|href)\s*=\s*["']\/(?!\/)[^"']*/g, 'dist'),
      ...grep(distText.filter((f) => f.rel.endsWith('.css')), /url\(\s*["']?\/(?!\/)/g, 'dist')
    ]
    add({
      id: 'YTP-ABSPATH', title: 'All file references are relative (no absolute paths)', severity: 'MUST',
      source: 'YT-STA', status: abs.length ? 'FAIL' : 'PASS',
      evidence: abs.slice(0, 15),
      fix: 'Build with `--base=./` (the playgama script already does) and hunt any hand-written `/foo.png` in index.html, CSS or a web manifest.'
    })
  }
}

// ═══ B. SDK INTEGRATION ═════════════════════════════════════════════════════

if (indexHtml) {
  const hasYt = /youtube\.com\/game_api\/v1/.test(indexHtml.text)
  add({
    id: 'YTP-SDK-TAG', title: "YouTube's own SDK tag is present in index.html", severity: 'MUST',
    source: 'YT-INT + KONST', status: hasYt ? 'PASS' : 'FAIL',
    evidence: hasYt
      ? grep([indexHtml], /<script[^>]*game_api[^>]*>/g, 'dist')
      : ['no <script src="https://www.youtube.com/game_api/v1"> in dist/index.html'],
    fix: 'Add `<script src="https://www.youtube.com/game_api/v1"></script>` to index.html for the playgama build. Load-bearing twice: YT-INT requires the SDK to load before any game code, and the Playgama Bridge\'s `youtube` adapter polls `window.ytgame` with NO timeout — without the tag, bridge.initialize() never settles and the game is a blank screen on Playables.'
  })
  if (hasYt) {
    // Blank out HTML comments before locating tags, keeping length (and so
    // every offset) intact. Without this the check reads documentation ABOUT
    // the tag as a tag: a comment explaining why the SDK must precede the
    // entry module contains the words it is describing, and the audit then
    // reports the very ordering the comment exists to guarantee as broken.
    const html = indexHtml.text.replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length))
    const ytIdx = html.search(/youtube\.com\/game_api\/v1/)
    const firstModule = html.search(/<script[^>]+type\s*=\s*["']module["']/)
    add({
      id: 'YTP-SDK-FIRST', title: 'The Playables SDK loads before any game code', severity: 'MUST',
      source: 'YT-INT', status: firstModule === -1 || ytIdx < firstModule ? 'PASS' : 'FAIL',
      evidence: [`game_api tag at offset ${ytIdx}; first module script at ${firstModule === -1 ? 'none' : firstModule}`],
      fix: 'Move the game_api script tag above the entry module script. Note Vite injects the entry bundle into <head> at build time, so a tag sitting in <body> alongside the other portal SDK tags is too late — it must go in <head>, before anything Vite adds.'
    })
  }

  const cspMeta = /<meta[^>]+http-equiv\s*=\s*["']Content-Security-Policy["']/i.test(indexHtml.text)
  add({
    id: 'YTP-CSP-META', title: 'No self-imposed CSP meta tag in the Playables archive', severity: 'MUST',
    source: 'KONST + YT-FAQ', status: cspMeta ? 'FAIL' : 'PASS',
    evidence: cspMeta ? grep([indexHtml], /<meta[^>]+Content-Security-Policy[^>]*>/gi, 'dist') : ['none'],
    fix: 'Playables serves the game under YouTube\'s own CSP and shares the document with YouTube\'s runtime — a game-authored policy fights it, and CSP violations are a named rejection reason. Skip CSP injection for the playgama mode in vite.config.ts (`buildCsp` already branches per mode).'
  })
}

const gameReadyHits = grepBoth(/game_ready|gameReady\s*\(|ytgame\.game\.gameReady/g, 12)
add({
  id: 'YTP-GAMEREADY', title: 'game_ready / gameReady() is signalled', severity: 'MUST',
  source: 'YT-INT + PG', status: gameReadyHits.length ? 'PASS' : 'FAIL',
  evidence: gameReadyHits.slice(0, 6),
  fix: "Fire `bridge.platform.sendMessage('game_ready')` — the Bridge maps it to the Playables `gameReady()`. YouTube does not remove its loading spinner until this call arrives."
})
add({
  id: 'YTP-GAMEREADY-TIMING', title: 'game_ready fires ONLY when the player can actually interact', severity: 'MUST',
  source: 'YT-INT + PG', status: 'MANUAL',
  evidence: gameReadyHits.slice(0, 6),
  fix: 'Read the call site. It must be after the first playable frame, not after asset load. Firing it while a splash, spinner, countdown or non-interactable intro is on screen is an explicit MUST NOT. Verify in a browser: the YouTube spinner must clear exactly when the game starts accepting input.'
})

const firstFrame = grepBoth(/firstFrameReady/g, 6)
add({
  id: 'YTP-FIRSTFRAME', title: 'firstFrameReady() is called when the game paints its own loading screen', severity: 'SHOULD',
  source: 'YT-INT', status: firstFrame.length ? 'PASS' : 'WARN',
  evidence: firstFrame.length ? firstFrame : ['not found in src or dist'],
  fix: 'If the game draws its own loading/splash screen, call `ytgame.game.firstFrameReady()` the moment that screen is up so YouTube hands the surface over. Only meaningful when the game owns its loader — a game that shows nothing until gameReady can skip it.'
})

const pauseHits = live(grepBoth(/onPause|onResume|EVENT_NAME\.(?:PAUSE|RESUME)|PAUSE_STATE_CHANGED|pause_state_changed/g, 12))
add({
  id: 'YTP-PAUSE', title: 'Pause/resume is driven by the SDK callbacks', severity: 'MUST',
  source: 'YT-INT + PG', status: pauseHits.length ? 'PASS' : 'FAIL',
  evidence: pauseHits.slice(0, 6),
  fix: 'On `onPause` the game MUST stop ALL execution — game loop, audio, input, rendering, network — and MUST resume only from `onResume`. Wire it through the Bridge pause events, never a self-invented heuristic. Playgama restates it: "immediately pause all rendering, sound, and gameplay".'
})

const visApiD = grepDist(/visibilitychange|document\.hidden|document\.visibilityState|["']pagehide["']/g, 20)
const visApiS = grepSrc(/visibilitychange|document\.hidden|document\.visibilityState|["']pagehide["']/g, 20)
const visApi = [...visApiD, ...visApiS]
add({
  id: 'YTP-NO-VISIBILITY-API', title: 'The Page Visibility API is not used', severity: 'MUST',
  source: 'YT-INT', status: mustNotInDist(visApiD, visApiS),
  evidence: visApi.slice(0, 12),
  fix: 'YT-INT: the game MUST NOT use the web Page Visibility API "or similar web APIs" and MUST only use the Playables SDK onPause. Gate every such listener behind `!isPlaygama` or delete it. A `pagehide` save flush counts as "similar" — route that through onPause instead (YT-INT: SHOULD save progress when onPause occurs).'
})

const audioHits = live(grepBoth(/isAudioEnabled|onAudioEnabledChange|AUDIO_STATE_CHANGED|audio_state_changed|EVENT_NAME\.(?:AUDIO|MUTE)/g, 12))
add({
  id: 'YTP-AUDIO-SDK', title: 'Mute follows the platform via isAudioEnabled / onAudioEnabledChange', severity: 'MUST',
  source: 'YT-INT + PG', status: audioHits.length ? 'PASS' : 'FAIL',
  evidence: audioHits.slice(0, 6),
  fix: 'Read the platform mute state at boot AND subscribe to its change event. While YouTube mute is active the game MUST produce no audio and its own controls MUST NOT override it; in-game sliders may only take effect when platform mute is off.'
})
add({
  id: 'YTP-AUDIO-PRIORITY', title: 'In-game sound settings never override the platform setting', severity: 'MUST',
  source: 'PG + YT-INT', status: 'MANUAL',
  evidence: audioHits.slice(0, 4),
  fix: 'Trace the gain path: platform mute must be a hard AND at the output, applied after every in-game volume. A game that restores its own saved volume on resume and forgets the platform flag fails this — and so does one whose ad SDK plays through a channel the mute never touches.'
})
add({
  id: 'YTP-AUDIO-AUTOPLAY', title: 'Audio does not depend on a first tap, and never fires unexpectedly', severity: 'MUST',
  source: 'YT-FAQ + YT-INT', status: 'MANUAL',
  evidence: [],
  fix: 'A named rejection: games that expect user interaction before playback fail, because YouTube may auto-focus the playable. Resume the AudioContext on the SDK ready/resume path as well as on first input. The mirror rule is also a MUST: no sound the player did not ask for.'
})
add({
  id: 'YTP-AUDIO-MUTEBTN', title: 'No overall in-game mute button', severity: 'SHOULD',
  source: 'YT-INT', status: 'MANUAL',
  evidence: grepSrc(/\bmute\b/gi, 8),
  fix: 'YT-INT: SHOULD NOT display an overall mute button in-game — YouTube owns that control, and a second one that disagrees with it reads as a bug. Granular music/SFX sliders are allowed if they still obey platform mute. Hide the master toggle in this build.'
})

const saveApi = grepBoth(/bridge\.storage|saveData\s*\(|loadData\s*\(|STORAGE_TYPE/g, 12)
add({
  id: 'YTP-SAVE-API', title: 'Progress is saved through the platform storage API', severity: 'MUST',
  source: 'YT-INT + PG', status: saveApi.length ? 'PASS' : 'FAIL',
  evidence: saveApi.slice(0, 6),
  fix: 'Use `bridge.storage` (the Bridge maps it to the Playables cloud save). YT-INT: MUST call saveData() after material progress such as a level change, MUST await loadData() before the first saveData(), and MUST NOT use any other save mechanism.'
})
// A try/catch around the access DOES handle the null case — `localStorage` is
// `null`, so the member read throws a TypeError and the catch takes it. So a
// wrapped access is not the bug; an UNWRAPPED one at module scope is, because
// it runs at import time with no error boundary above it. Splitting the two is
// the difference between a report that names one real crash and one that lists
// every storage call in the codebase and gets skimmed.
//
// The heuristic is crude and errs toward reporting: a `try` within the
// preceding ~220 characters counts as wrapped. The window has to be that wide
// because the real shape being matched is a LOOP inside a try — `try{ … for(…
// localStorage.length …){ … } for(… localStorage.getItem …)` puts well over a
// hundred characters of minified preamble between the two. It can still be
// fooled by a `try` that already closed, which is why wrapped hits stay in the
// evidence list rather than being dropped.
const STORAGE_RE = /(?:window\.)?(?:localStorage|sessionStorage)\s*\.\s*(?:getItem|setItem|removeItem|clear|key|length)/g
const storageHits = (pool, tag) => {
  const bare = []
  const wrapped = []
  for (const f of pool) {
    const rx = new RegExp(STORAGE_RE.source, 'g')
    let m
    while ((m = rx.exec(f.text)) !== null) {
      if (inComment(f.text, m.index)) continue
      const before = f.text.slice(Math.max(0, m.index - 220), m.index)
      const line = `${tag}:${f.rel}${lineOf(f.text, m.index) > 1 ? `:${lineOf(f.text, m.index)}` : ''} — ${snippet(f.text, m.index)}`
      ;(/\btry\s*\{/.test(before) ? wrapped : bare).push(line)
      if (bare.length + wrapped.length > 60) break
    }
  }
  return { bare, wrapped }
}
const distStorage = storageHits(distText, 'dist')
const srcStorage = storageHits(srcText, 'src')
const rawStorage = [
  ...distStorage.bare.map((h) => `[UNGUARDED] ${h}`),
  ...srcStorage.bare.map((h) => `[UNGUARDED] ${h}`),
  ...distStorage.wrapped.slice(0, 5).map((h) => `[try/catch — ok] ${h}`)
]
add({
  id: 'YTP-NO-RAW-STORAGE', title: 'No unguarded localStorage / sessionStorage access', severity: 'MUST',
  source: 'YT-INT + KONST',
  status: distStorage.bare.length ? 'FAIL' : srcStorage.bare.length ? 'MANUAL' : 'PASS',
  evidence: rawStorage.slice(0, 15),
  fix: 'On Playables `window.localStorage` and `window.sessionStorage` are **null**, not absent — `typeof x === "undefined"` does NOT catch it (typeof null is "object"), so an unguarded module-scope `localStorage.getItem(...)` throws before bootstrap and the whole game is a blank screen. This exact bug got a 2026-09 submission rejected with every SDK check green. Fix the `[UNGUARDED]` hits by routing them through a null-checking shim that tests the storage OBJECT (`window.localStorage && typeof s.getItem === "function"`), not `typeof`. The `[try/catch — ok]` hits are listed for completeness and need no change: the member read throws and the catch takes it. Watch specifically for the broken guard `typeof localStorage === "undefined"` — it reads as careful and is exactly wrong.'
})
add({
  id: 'YTP-SAVE-SIZE', title: `Save blob < ${human(LIMIT.saveMust)} (SHOULD < ${human(LIMIT.saveShould)}; final flush <= ${human(LIMIT.saveFlush)})`, severity: 'MUST',
  source: 'YT-STA + YT-INT', status: 'MANUAL',
  evidence: [],
  fix: 'Measure at runtime: `JSON.stringify(<game>_state).length` after a long session with everything unlocked. Confirm the blob written on the final flush stays under 64 KiB, and that a save from an OLDER game version still loads without throwing (a separate YT-INT MUST).'
})

const navLangD = grepDist(/navigator\.(?:languages?|userLanguage|browserLanguage)/g, 20)
const navLangS = grepSrc(/navigator\.(?:languages?|userLanguage|browserLanguage)/g, 20)
const navLang = [...navLangD, ...navLangS]
add({
  id: 'YTP-NO-NAVLANG', title: 'navigator.language / navigator.languages is not used', severity: 'MUST',
  source: 'YT-I18N', status: mustNotInDist(navLangD, navLangS),
  evidence: navLang.slice(0, 10),
  fix: 'YT-I18N: MUST NOT use web localization APIs like navigator.languages or navigator.language. Take the locale from the platform (`bridge.platform.language`, which maps to the Playables `getLanguage`) and fall back to English.'
})

// ═══ C. NETWORK ISOLATION ═══════════════════════════════════════════════════

// XML namespaces and licence boilerplate: strings that are never fetched.
const NON_FETCH = /^(?:www\.)?(?:w3\.org|schema\.org|purl\.org|creativecommons\.org|inkscape\.org|sodipodi\.sourceforge\.net|ns\.adobe\.com|xml\.org|json-schema\.org|opensource\.org|unlicense\.org)$/i
// Framework error-reference URLs. Not calls — but they only survive minification
// in a DEV build, so they are reported separately as a build-mode smell.
const DOC_HOST = /(?:^|\.)(?:vuejs\.org|intlify\.dev|reactjs\.org|react\.dev|svelte\.dev|angular\.io|vitejs\.dev|rollupjs\.org|babeljs\.io|webpack\.js\.org|nodejs\.org|npmjs\.com|developer\.mozilla\.org|github\.com|tailwindcss\.com|greensock\.com|threejs\.org|pixijs\.com|chromewebstore\.google\.com|addons\.mozilla\.org|chrome\.google\.com|mathiasbynens\.be|caniuse\.com|stackoverflow\.com)$/i
const ALLOWED_HOST = /(?:^|\.)(?:youtube\.com|youtube-nocookie\.com|ytimg\.com|googlevideo\.com|gstatic\.com)$/i

const hostHits = new Map()
for (const f of distText) {
  for (const m of f.text.matchAll(/https?:\/\/([A-Za-z0-9._-]+)/g)) {
    const host = m[1].toLowerCase()
    if (NON_FETCH.test(host)) continue
    if (!hostHits.has(host)) hostHits.set(host, [])
    const arr = hostHits.get(host)
    if (arr.length < 4) arr.push(`dist:${f.rel} — ${snippet(f.text, m.index)}`)
  }
}
const foreign = [...hostHits.entries()].filter(([h]) => !ALLOWED_HOST.test(h) && !DOC_HOST.test(h))
const docHosts = [...hostHits.entries()].filter(([h]) => DOC_HOST.test(h))
add({
  id: 'YTP-NO-EXTERNAL-CALLS', title: 'The build reaches no host outside YouTube/Google', severity: 'MUST',
  source: 'YT-PRV + PG + YT-FAQ', status: foreign.length ? 'FAIL' : 'PASS',
  evidence: foreign.slice(0, 25).map(([h, ex]) => `${h}  <-  ${ex[0]}`),
  fix: 'YT-PRV: the game MUST NOT make external calls to any URLs or services except where explicitly required by other technical requirements (i.e. APIs owned by Google or YouTube), and MUST NOT attempt to circumvent external-call prevention. That kills third-party analytics, leaderboard workers, font CDNs, remote config and external multiplayer outright, and remote data is refused — all game data must ship in the bundle. Bundle it, gate it behind the platform flag, or remove it. A hit is not automatically a live call, but a string in a dead path still has to be PROVEN dead; and note that Playgama\'s own bridge analytics endpoint is one YouTube has called out.'
})

// ── Is this even the right artefact? ────────────────────────────────────────
// Both of these are operator errors, not game defects, and both silently
// invalidate every other finding — so they lead the report.
// Deliberately narrow. Three markers that were tried and REMOVED because they
// fire on healthy production bundles:
//   • `__vite__mapDeps`      — the dynamic-import preload helper, always emitted
//   • `vuejs.org/error-reference` — Vue >= 3.4 ships this URL in PRODUCTION
//   • framework doc hosts generally — library metadata, not a build mode
// What is left only appears when a dev server or devtools bridge is bundled.
const devSmell = grepDist(/\/@vite\/client|__vite__injectQuery|__VUE_PROD_DEVTOOLS__\s*[:=]\s*(?:!0|true)|process\.env\.NODE_ENV\s*!==\s*["']production["']/g, 10)
add({
  id: 'YTP-DEV-BUILD', title: 'No dev-server or devtools bridge in the bundle', severity: 'SHOULD',
  source: 'YT-STA', status: devSmell.length ? 'WARN' : 'PASS',
  evidence: devSmell.slice(0, 8),
  fix: 'A dev bundle is bigger and slower and can carry dev-only network hooks, which collide with the no-external-calls rule. Rebuild in the platform mode. Note this check is deliberately narrow — it does NOT judge a bundle by framework warning strings, because library dev prose can survive tree-shaking in a perfectly valid production build. If the size budget looks wrong, measure it with the SDK Test Suite rather than inferring a build mode from strings.'
})

const pgMarker = grepDist(/@playgama\/bridge|playgamaBridge|PlaygamaStrategy|jio_games|microsoft_store|bridge-youtube-subscribe/g, 6)
add({
  id: 'YTP-WRONG-BUILD', title: 'The audited dist is the PLAYGAMA build (which is the Playables submission)', severity: 'MUST',
  source: 'KONST', status: distFiles ? (pgMarker.length ? 'PASS' : 'WARN') : 'SKIP',
  evidence: pgMarker.length ? pgMarker.slice(0, 4) : ['no Playgama Bridge marker found in dist/'],
  fix: 'There is no `build:youtube` — `pnpm build:playgama` produces the ONE archive that Playgama forwards to Playables. Auditing the default `pnpm build` output measures a bundle that will never be submitted: different chunks, different flags, different SDKs. Rebuild with `pnpm build:playgama` and re-run against that dist/.'
})

const netApi = grepDist(/\bfetch\s*\(|new\s+XMLHttpRequest|new\s+WebSocket|navigator\.sendBeacon|new\s+EventSource|importScripts\s*\(/g, 30)
add({
  id: 'YTP-NET-API', title: 'Network APIs are only used for same-origin bundle assets', severity: 'MUST',
  source: 'YT-PRV', status: live(netApi).length ? 'MANUAL' : 'PASS',
  evidence: netApi.slice(0, 15),
  fix: 'A same-origin `fetch` of a bundled asset is fine. Audit each call site: anything with an absolute URL, a configurable base, a beacon or a WebSocket is a blocker.'
})

const swD = grepDist(/serviceWorker\s*\.\s*register|navigator\.serviceWorker/g, 8)
const swS = grepSrc(/serviceWorker\s*\.\s*register|navigator\.serviceWorker/g, 8)
const sw = [...swD, ...swS]
add({
  id: 'YTP-NO-SW', title: 'No service worker registration', severity: 'MUST',
  source: 'YT-PRV + YT-STA', status: mustNotInDist(swD, swS),
  evidence: sw.slice(0, 6),
  fix: 'Playables runs the game inside YouTube\'s own document — a service worker is both an external-surface risk and a source of stale-bundle rejections. Drop the PWA plugin from this build mode.'
})

const dynScript = grepDist(/createElement\s*\(\s*["']script["']\s*\)/g, 10)
add({
  id: 'YTP-DYN-SCRIPT', title: 'No dynamically injected <script> tags', severity: 'MUST',
  source: 'YT-FAQ', status: live(dynScript).length ? 'WARN' : 'PASS',
  evidence: dynScript.slice(0, 8),
  fix: 'A named rejection reason: dynamically created script tags lack the nonce YouTube\'s CSP requires, so they are blocked at runtime — the game then fails in a way that no local test reproduces. Every SDK the game injects at runtime (a portal SDK\'s own lazy loader included) must be a static tag in index.html for this build, or provably never reached.'
})

// Host- and API-shaped, deliberately: bare product words ("amplitude") collide
// with SVG attribute tables and minified identifiers, and a false blocker in a
// release audit is worse than a missed one — it teaches the operator to skim.
const analytics = grepDist(/gtag\s*\(|googletagmanager\.com|google-analytics\.com|analytics\.google\.com|api\.mixpanel\.com|api\d*\.amplitude\.com|amplitude\.getInstance|posthog\.(?:com|init)|sentry\.io|hotjar\.com|clarity\.ms|connect\.facebook\.net|fbq\s*\(|mc\.yandex\.ru|metrika/g, 20)
add({
  id: 'YTP-NO-ANALYTICS', title: 'No third-party analytics or telemetry', severity: 'MUST',
  source: 'YT-PRV + PG', status: mustNot(analytics),
  evidence: analytics.slice(0, 12),
  fix: 'Playgama states it plainly: no external analytics reports. Strip every analytics SDK from this build mode — including a portal SDK\'s own event beacon if it posts off-YouTube.'
})

// Hostnames and SDK globals only. A multi-platform codebase is FULL of
// `isGamepix` / `isPlaygama` build flags that are not payloads — matching the
// bare product name flags the architecture instead of the violation.
const otherPortals = grepDist(/googlesyndication\.com|adsbygoogle|imasdk\.googleapis|doubleclick\.net|prebid\.js|aps\.amazon|\.gamemonetize\.com|gamemonetize\.co|\.gamepix\.com|GamePix\s*\.|\.gamedistribution\.com|gdsdk|sdk\.crazygames\.com|game-sdk\.crazygames|\bPokiSDK\b|game\.poki\.io|cdn\.y8\.com|yandex\.ru\/games\/sdk|sdk\.games\.s3\.yandex/gi, 20)
add({
  id: 'YTP-BUNDLE-PURITY', title: "No other portal's SDK or ad stack in the Playables archive", severity: 'MUST',
  source: 'YT-MON + KONST', status: mustNot(otherPortals),
  evidence: otherPortals.slice(0, 12),
  fix: 'YT-MON: MUST NOT display in-game advertising, or monetize, using off-platform services. Another portal\'s SDK riding along in this bundle is exactly that, even if it never fires. Add a bundle-purity test — grep dist for each portal\'s markers, assert zero — so it cannot regress.'
})

// ═══ D. MONETIZATION ════════════════════════════════════════════════════════

const adCalls = grepBoth(/showRewarded|showInterstitial|rewarded|interstitial/gi, 20)
add({
  id: 'YTP-AD-SUPPORT-CHECK', title: 'Every ad call checks placement support first', severity: 'MUST',
  source: 'PG', status: adCalls.length ? 'MANUAL' : 'SKIP',
  evidence: adCalls.slice(0, 8),
  fix: 'Playgama: the code "must always check whether ad placements are supported" before firing. Where rewarded is unsupported the BUTTON must not exist — not fail silently after the player commits. Gate every rewarded surface on "init settled AND placement supported", never on "a provider object exists".'
})
add({
  id: 'YTP-AD-NO-TIMER', title: 'No countdown/timer in front of an interstitial', severity: 'MUST',
  source: 'PG', status: 'MANUAL',
  evidence: grepSrc(/adCountdown|beforeAd|preAdDelay|adTimer/gi, 6),
  fix: 'Playgama: "timers before interstitials are also strictly forbidden." A "your ad starts in 3…" screen is a rejection. Call the break directly.'
})
add({
  id: 'YTP-AD-AUDIO-PAUSE', title: 'Ads keep honouring mute and pause', severity: 'MUST',
  source: 'YT-MON', status: 'MANUAL',
  evidence: [],
  fix: 'YT-MON: with ads enabled the game MUST still handle mute/unmute via isAudioEnabled + onAudioEnabledChange and pause/resume via onPause + onResume. Hard-stop music and kill in-flight one-shot SFX before every ad request (the playbook\'s ad-audio guarantee), and make sure an onPause landing mid-ad still parks the game.'
})
const iap = grepDist(/js\.stripe\.com|Stripe\s*\(|paypal\.com|braintreegateway|xsolla\.com|checkout\.session|in_?app_?purchase/gi, 15)
add({
  id: 'YTP-NO-IAP', title: 'No in-app purchases or off-platform payment', severity: 'MUST',
  source: 'YT-MON + PG', status: mustNot(iap),
  evidence: iap.slice(0, 10),
  fix: 'YT-MON forbids IAP and monetization through off-platform services; Playgama restates it as "no standard in-app purchases". Remove the surface for this build — a disabled shop button that still ships the SDK is still a finding.'
})

// ═══ E. DESIGN / UX / POLICY ════════════════════════════════════════════════

const extLinks = [
  ...grepDist(/<a[^>]+href\s*=\s*["']https?:/gi, 15),
  ...grepBoth(/window\.open\s*\(/g, 10)
]
add({
  id: 'YTP-NO-EXT-LINKS', title: 'No clickable external links', severity: 'MUST',
  source: 'YT-DES', status: mustNot(extLinks),
  evidence: extLinks.slice(0, 12),
  fix: 'YT-DES: MUST NOT display clickable external links. That covers a "more games" strip, a studio site, a privacy-policy link, a Discord badge and every window.open. Hide them behind the platform flag.'
})

const pii = [
  ...grepDist(/<input[^>]+type\s*=\s*["'](?:password|email|tel)["']/gi, 10),
  ...grepSrc(/type\s*=\s*["'](?:password|email|tel)["']/gi, 10),
  ...grepSrc(/\b(?:playerName|nickname|userName|enterName|yourName|displayName)\b/g, 15)
]
add({
  id: 'YTP-NO-PII', title: 'The game never asks for personal information', severity: 'MUST',
  source: 'YT-PRV', status: mustNot(pii),
  evidence: pii.slice(0, 12),
  fix: 'YT-PRV: content MUST NOT prompt the user to enter, or in any way collect, personal information — explicitly including **names, ages, locations, usernames and passwords** — and MUST NOT display anything resembling a login or account-creation screen. A leaderboard name-entry field is the usual offender: for this build the board either goes away or runs on a platform identity with no text input.'
})

const login = grepSrc(/signIn|logIn|createAccount|\bregister\b/gi, 12)
add({
  id: 'YTP-NO-LOGIN-UI', title: 'No login / account-creation screen', severity: 'MUST',
  source: 'YT-PRV', status: live(login).length ? 'MANUAL' : 'PASS',
  evidence: login.slice(0, 8),
  fix: 'Even a cosmetic "sign in to save your progress" panel is a MUST NOT. Confirm every hit is a portal-SDK auth call that renders no UI of its own, and that no such UI is reachable in this build.'
})

const clipboardD = grepDist(/navigator\.clipboard|execCommand\s*\(\s*["']copy["']/g, 8)
const clipboardS = grepSrc(/navigator\.clipboard|execCommand\s*\(\s*["']copy["']/g, 8)
const clipboard = [...clipboardD, ...clipboardS]
add({
  id: 'YTP-NO-CLIPBOARD', title: 'No clipboard access outside an explicit paste', severity: 'MUST',
  source: 'YT-PRV', status: mustNotInDist(clipboardD, clipboardS),
  evidence: clipboard.slice(0, 6),
  fix: 'Only a read in direct response to the player\'s own paste action is allowed. A "copy your score" button is a MUST NOT.'
})

const qrD = grepDist(/qrcode|QRCode|qr-code/gi, 8)
const qrS = grepSrc(/qrcode|QRCode|qr-code/gi, 8)
const qr = [...qrD, ...qrS]
add({
  id: 'YTP-NO-QR', title: 'No QR codes, functional or decorative', severity: 'MUST',
  source: 'YT-PRV', status: mustNotInDist(qrD, qrS),
  evidence: qr.slice(0, 6),
  fix: 'YT-PRV: MUST NOT generate or display graphical content resembling or functioning as a QR code — art that merely looks like one is covered too.'
})

const shareD = grepDist(/navigator\.share|shareScore|shareResult/g, 10)
const shareS = grepSrc(/navigator\.share|shareScore|shareResult/g, 10)
const share = [...shareD, ...shareS]
add({
  id: 'YTP-NO-SHARE', title: 'No in-game sharing prompts', severity: 'MUST',
  source: 'YT-DES', status: mustNotInDist(shareD, shareS),
  evidence: share.slice(0, 8),
  fix: 'YT-DES: MUST NOT display in-game sharing prompts — YouTube owns sharing in its own chrome.'
})

const exitBtn = grepSrc(/\b(?:quit|exitGame|leaveGame|backToSite)\b/gi, 10)
add({
  id: 'YTP-NO-EXIT', title: 'No in-game exit/quit button', severity: 'MUST',
  source: 'YT-DES', status: live(exitBtn).length ? 'MANUAL' : 'PASS',
  evidence: exitBtn.slice(0, 8),
  fix: 'YT-DES: MUST NOT include an in-game exit/quit button, and MUST NOT place icons identical to the platform\'s own buttons next to them. Check the pause menu and the corner HUD.'
})

const orientLock = [
  ...grepBoth(/screen\.orientation\s*\.\s*lock|lockOrientation|["']orientation["']\s*:\s*["'](?:portrait|landscape)/g, 10),
  ...grepSrc(/rotate[- ]?your[- ]?device|rotateDevice|please rotate/gi, 8)
]
add({
  id: 'YTP-NO-ORIENT-LOCK', title: 'Orientation and posture are never locked', severity: 'MUST',
  source: 'YT-DES', status: mustNot(orientLock),
  evidence: orientLock.slice(0, 8),
  fix: 'YT-DES: MUST NOT lock device orientation or posture, and the game MUST be playable at every ratio from 9:32 to 32:9. A "please rotate your device" gate is a lock by another name — the game has to lay out in whatever ratio it is handed.'
})

// The rejection that passes every automated check. Playables serves the game
// from a URL whose shape the developer does not control
// (`e2e.playables.usercontent.goog/<id>/...`), so a router that manipulates or
// asserts its own route path can land on a route that does not exist and render
// nothing — with the SDK contract fully satisfied, which is why YouTube's own
// test suite goes green on it. Memory history is the safe shape for an embedded
// game: it never touches the address bar at all.
// Decided on the BUILT bundle, not the source. A project that selects its
// history mode per platform legitimately keeps `createWebHashHistory` in
// `src/` for every other build, so a source grep condemns the fix along with
// the bug. What matters is whether the shipped code still reads a URL it does
// not own — and after a correct switch to memory history, vue-router's entire
// hash/web-history implementation tree-shakes away, `location.hash` included.
const urlReads = grepDist(/location\.hash|location\.pathname|hash base must end/g, 10)
const hashHistorySrc = grepSrc(/createWebHashHistory|createWebHistory/g, 8)
add({
  id: 'YTP-HASH-HISTORY', title: 'The router does not depend on the page URL', severity: 'MUST',
  source: 'KONST',
  status: live(urlReads).length ? 'FAIL' : live(hashHistorySrc).length ? 'MANUAL' : 'PASS',
  evidence: live(urlReads).length
    ? live(urlReads).slice(0, 6)
    : live(hashHistorySrc).length
      ? [...live(hashHistorySrc).slice(0, 4),
        'NOTE: no URL read found in dist/ — the source mentions a URL history mode, so confirm the platform branch selects memory history for THIS build']
      : ['no URL reads in the built bundle'],
  fix: 'Switch the Playables/Playgama build to `createMemoryHistory()`. Both `createWebHashHistory` and `createWebHistory` read and write a URL that Playables owns and whose shape is not yours — this is how a 2026-09 submission failed with every MUST and SHOULD check in YouTube\'s own test suite passing. A single-scene game loses nothing by holding its route in memory. If the router must stay as-is, prove it by loading the built archive from a deep, unfamiliar path (not `/`) and confirming the game still renders.'
})

const escPrevent = grepSrc(/(?:key|code)\s*===?\s*["'](?:Escape|Esc)["'][^]{0,200}?preventDefault/g, 8)
add({
  id: 'YTP-ESC', title: 'Esc closes modals, and preventDefault() is never called on Esc', severity: 'MUST',
  source: 'YT-DES', status: live(escPrevent).length ? 'FAIL' : 'MANUAL',
  evidence: escPrevent.slice(0, 6),
  fix: 'YT-DES: SHOULD allow closing modals/dialogs with Esc, and MUST NOT call preventDefault() on Esc events — YouTube uses it to leave the playable. Check every global key handler for a blanket preventDefault.'
})

// ═══ F. MANUAL REGISTER — the judgement the bytes cannot make ═══════════════

const MANUAL = [
  ['YTP-ASPECT', 'Renders correctly at 9:32, 9:21, 9:16, 3:4, 1:1, 4:3, 16:9, 21:9, 32:9', 'MUST', 'YT-DES + PG',
    'Playgama singles out 1:1, 16:9 and 9:16; YouTube requires the full ladder. Drive the BUILT game in a browser at each ratio and assert: nothing clipped, text readable, no black bars at the sides (fill the viewport, or centre with a deliberate pillarbox/letterbox), every touch target reachable. Landscape must be a real adaptation, not a stretched portrait.'],
  ['YTP-RESIZE', 'Game state survives a resize, including a zero-size viewport', 'MUST', 'YT-DES + YT-FAQ',
    'A named rejection: games that skip resize events or fail on a zero viewport break the Android/SDK test suite. Resize the window to 0 width and back — the run must continue, not reset.'],
  ['YTP-INPUT', 'Every interaction works with touch AND with mouse', 'MUST', 'YT-DES',
    'Both are MUST. Also MUST NOT unintentionally delay or ignore input, and MUST NOT ship UI components with errors. Keyboard for directional/text input is SHOULD. Haptics are allowed only with an on/off toggle.'],
  ['YTP-RENDER-CLARITY', 'Text and graphics are clear at every resolution and density', 'MUST', 'YT-DES',
    'No blur, pixelation or stretching. Check a 3x-DPR phone and a 1x desktop.'],
  ['YTP-LOAD-5S', 'Loads and becomes interactive in under 5 seconds', 'SHOULD', 'YT-STA',
    'Measure on a throttled connection against the BUILT archive, not the dev server.'],
  ['YTP-HEAP', 'Peak JS heap stays under 512 MB', 'MUST', 'YT-STA',
    'Over it, iPhones crash — YT-STA says so outright. Record performance.memory or a DevTools heap timeline across a long session with everything unlocked.'],
  ['YTP-NO-CRASH', 'No consistently reproducible crash, and nothing that crashes the YouTube app/site', 'MUST', 'YT-STA',
    'Playgama restates it as zero tolerance for bugs affecting gameplay.'],
  ['YTP-BROWSERS', 'Runs on every YouTube-supported browser and both YouTube apps', 'MUST', 'YT-STA',
    'Chrome, Edge, Firefox, plus the YouTube app on Android and iOS. The playbook\'s cross-browser matrix covers the desktop half; iOS/WebKit is the one that finds the real bugs.'],
  ['YTP-GENRE', 'The genre is one Playables actually promotes', 'SHOULD', 'PG',
    'Playgama\'s performers: action (runners, fighting), arcade (.io-likes), racing (obstacle racing), simulation (tycoon, evolution), simple matching or drawing puzzles. Avoid trivia, word, board, RPG, strategy, music/rhythm, and derivative puzzle clones. "Simplicity of gameplay" is the stated golden rule — anything needing significant learning time is out.'],
  ['YTP-PLAYTIME', 'Around 10 minutes average playtime', 'SHOULD', 'PG',
    'Playgama\'s stated bar for a Playables placement. Take the number from a real playtest, not an estimate. If it is short, the fix is progression — a new mechanic every few levels, a steady difficulty ramp — not a longer timer.'],
  ['YTP-PROGRESSION', 'Thought-out progression with new mechanics every few levels', 'SHOULD', 'PG',
    'Gradual difficulty increase with consistent challenge.'],
  ['YTP-VISUALS', 'Vibrant, professional visuals with dynamic animation', 'MUST', 'PG',
    'No visual artifacts, no low-effort assets, a colourful and readable UI. Playgama explicitly rejects AI-generated visual styles.'],
  ['YTP-ORIGINALITY', '100% original or properly licensed assets', 'MUST', 'PG + YT-TS',
    'No characters or skins copied from another franchise; no copyrighted music and none that merely sounds like a known track. YT-TS requires fully cleared third-party IP — trademark, trade dress, copyright, music rights AND personality rights (name, likeness). Sweep every sprite, font, sound and licence, including anything an image model produced from a franchise-shaped prompt.'],
  ['YTP-RATING', 'Suitable for a general audience (13+) and NOT made for kids', 'MUST', 'YT-TS',
    'Both halves are MUST: it must clear the YouTube Community Guidelines for a general audience, and it must NOT specifically target children or be "made for kids".'],
  ['YTP-METADATA', 'Store metadata is complete and unbranded', 'MUST', 'YT-DES',
    'Thumbnails in several aspect ratios, description, title, genre, publisher/developer info — supplied through the Developer Portal. MUST NOT put branding or logos in the thumbnail, title or description, and MUST NOT use any of them to misrepresent the game.'],
  ['YTP-END-OF-CONTENT', 'The game says so when there is no more content', 'MUST', 'YT-DES',
    'A run that silently loops back to level 1, or an endless mode pretending to have an ending, fails this.'],
  ['YTP-NO-AGREEMENTS', 'No additional user agreements shown in-game', 'MUST', 'YT-DES',
    'No EULA, no cookie banner, no age gate, no consent dialog of your own.'],
  ['YTP-SCORE-CONSISTENCY', 'If sendScore() is used, the best score sent matches the save', 'MUST', 'YT-INT',
    'Only applies if the game reports scores. Divergence between the reported best and the saved best is a MUST failure.'],
  ['YTP-SAVE-BACKCOMPAT', 'Cloud saves from previous game versions load without error', 'MUST', 'YT-INT',
    'Load a save written by the previous release into the new build. A migration that throws is a rejection.'],
  ['YTP-A11Y', 'Best effort at WCAG AA; AGI tags chosen honestly', 'SHOULD', 'YT-A11Y',
    'WCAG AA is a SHOULD. The hard rule: MUST NOT select Accessible Gaming Initiative tags that improperly represent the game\'s functionality or content.'],
  ['YTP-GEO', 'The target audience sits inside the Playables footprint', 'INFO', 'PG',
    'Playgama lists the USA, Canada, Australia, the UK, India, Malaysia, Turkey, Japan and some European countries. It shapes localisation priorities and revenue expectations, not eligibility.'],
  ['YTP-DEV-LINKS', 'Staging/dev links are not shared outside certification testing', 'MUST', 'YT-TS',
    'Housekeeping, but a stated MUST NOT.']
]
for (const [id, title, severity, source, fix] of MANUAL) {
  add({ id, title, severity, source, status: 'MANUAL', evidence: [], fix })
}

// ═══ REPORT ═════════════════════════════════════════════════════════════════

const ORDER = { FAIL: 0, WARN: 1, MANUAL: 2, SKIP: 3, PASS: 4 }
findings.sort((a, b) =>
  (ORDER[a.status] - ORDER[b.status]) ||
  (a.severity === b.severity ? 0 : a.severity === 'MUST' ? -1 : 1) ||
  a.id.localeCompare(b.id))

// Two findings invalidate every other number if they trip, so they are pulled
// out of the normal buckets and printed first.
// Only WRONG-BUILD invalidates a run: auditing another platform's archive
// makes every other number meaningless. A dev-bundle suspicion does not — it
// is a finding in its own right, and letting it suppress the verdict would
// hide the blockers the report exists to surface.
const SANITY = new Set(['YTP-WRONG-BUILD'])
const sanity = findings.filter((f) => SANITY.has(f.id) && f.status !== 'PASS')
const rest = findings.filter((f) => !sanity.includes(f))

const blockers = rest.filter((f) => f.status === 'FAIL' && f.severity === 'MUST')
const soft = rest.filter((f) => f.status === 'WARN' || (f.status === 'FAIL' && f.severity !== 'MUST'))
const manual = rest.filter((f) => f.status === 'MANUAL')
const skipped = rest.filter((f) => f.status === 'SKIP')
const passed = rest.filter((f) => f.status === 'PASS')

const verdict = sanity.length
  ? `INVALID RUN — ${sanity.map((f) => f.id).join(' + ')}: this is not the archive that gets submitted, so every finding below is provisional`
  : blockers.length
    ? `NOT ELIGIBLE — ${blockers.length} MUST failure${blockers.length === 1 ? '' : 's'}`
    : skipped.length
      ? 'INCONCLUSIVE — the mechanical checks are clean but some could not be evaluated'
      : 'MECHANICALLY CLEAN — no automated MUST failure; the manual register still decides eligibility'

const ICON = { FAIL: 'X', WARN: '!', MANUAL: '?', SKIP: '-', PASS: 'v' }
const EMOJI = { FAIL: '❌', WARN: '⚠️', MANUAL: '🔍', SKIP: '⏭️', PASS: '✅' }

function mdTable(rows) {
  if (!rows.length) return '_none_\n'
  let s = '| | ID | Requirement | Sev | Source | Evidence |\n|---|---|---|---|---|---|\n'
  for (const f of rows) {
    const ev = f.evidence.length
      ? f.evidence.slice(0, 3).map((e) => '`' + e.replace(/\|/g, '\\|').slice(0, 150) + '`').join('<br>')
        + (f.evidence.length > 3 ? `<br>_+${f.evidence.length - 3} more_` : '')
      : '—'
    s += `| ${EMOJI[f.status]} | ${f.id} | ${f.title.replace(/\|/g, '\\|')} | ${f.severity} | ${f.source} | ${ev} |\n`
  }
  return s
}

let md = '# YouTube Playables fit — mechanical audit\n\n'
md += `**Verdict: ${verdict}**\n\n`
md += `Root \`${ROOT}\` · dist \`${relative(ROOT, DIST).split(sep).join('/') || '.'}\` · ${new Date().toISOString().slice(0, 16).replace('T', ' ')}\n\n`
md += `${blockers.length} blocker · ${soft.length} soft · ${manual.length} manual · ${skipped.length} not evaluated · ${passed.length} pass\n\n`
if (sanity.length) md += `## 🛑 Build sanity — fix these FIRST, they invalidate the rest\n\n${mdTable(sanity)}\n`
md += `## ❌ Blockers — a MUST that fails\n\n${mdTable(blockers)}\n`
md += `## ⚠️ Soft findings — a SHOULD, or a MUST needing a judgement call\n\n${mdTable(soft)}\n`
md += `## 🔍 Manual register — answer these by hand before submitting\n\n${mdTable(manual)}\n`
if (skipped.length) md += `## ⏭️ Not evaluated\n\n${mdTable(skipped)}\n`
md += `## ✅ Passing\n\n${mdTable(passed)}\n`
md += '\n## What to do\n\n'
for (const f of [...sanity, ...blockers, ...soft]) {
  md += `### ${EMOJI[f.status]} ${f.id} — ${f.title}\n\n${f.fix}\n\n`
  if (f.evidence.length) {
    md += '```\n' + f.evidence.slice(0, 12).join('\n')
      + (f.evidence.length > 12 ? `\n… +${f.evidence.length - 12} more` : '') + '\n```\n\n'
  }
}

const mdOut = opt('md', null)
if (mdOut) { mkdirSync(dirname(resolve(mdOut)), { recursive: true }); writeFileSync(resolve(mdOut), md, 'utf8') }
const jsonOut = opt('json', null)
if (jsonOut) {
  mkdirSync(dirname(resolve(jsonOut)), { recursive: true })
  writeFileSync(resolve(jsonOut), JSON.stringify(
    { verdict, root: ROOT, dist: DIST, generated: new Date().toISOString(), limits: LIMIT, findings }, null, 2), 'utf8')
}

if (!QUIET) {
  console.log(`\n  YouTube Playables fit — ${verdict}\n`)
  for (const f of [...sanity, ...rest]) {
    if (f.status === 'PASS') continue
    console.log(`  [${ICON[f.status]}] ${f.severity.padEnd(6)} ${f.id.padEnd(24)} ${f.title}`)
    for (const e of f.evidence.slice(0, 3)) console.log(`               ${e.slice(0, 150)}`)
  }
  console.log(`\n  ${blockers.length} blocker · ${soft.length} soft · ${manual.length} manual · ${skipped.length} not evaluated · ${passed.length} pass`)
  if (mdOut) console.log(`  markdown -> ${mdOut}`)
  if (jsonOut) console.log(`  json     -> ${jsonOut}`)
  console.log('')
}

process.exit(blockers.length ? 1 : 0)
