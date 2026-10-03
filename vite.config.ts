import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

import { defineConfig, loadEnv, type Plugin } from 'vite'

// ─── The baked leaderboard ─────────────────────────────────────────────────
//
// Ships a board inside the bundle as `virtual:leaderboard-snapshot`. Every
// build carries one, but not the same one:
//
//   • a build WITH an endpoint bakes `data/leaderboard-snapshot.json`, the live
//     board as last fetched: the bottom rung of `useLeaderboard`'s offline
//     ladder, for a device whose fetch failed and that has no cache yet;
//   • a build WITHOUT one (Poki, Yandex, Playgama: `VITE_LEADERBOARD_URL`
//     empty) can neither read nor write the live board, so it bakes the
//     MODELLED `data/leaderboard-seed.json`, which is the whole board for the
//     life of that build. On those builds the game shows only the rank badge;
//     the top-100 list is hidden, so no invented player is ever shown.
//
// The refresh runs as a CHILD PROCESS of `scripts/leaderboard-snapshot.mjs` —
// the same code path `pnpm leaderboard:snapshot` runs, so the build cannot
// drift from the manual command, and a fetch that hangs or throws cannot take
// the vite process with it. It is allowed to fail: the file is committed, so a
// build with no network bakes the last known board instead of quietly shipping
// without the feature.
const SNAPSHOT_VIRTUAL_ID = 'virtual:leaderboard-snapshot'
const SNAPSHOT_RESOLVED = '\0' + SNAPSHOT_VIRTUAL_ID
const SNAPSHOT_FILE = resolve(
  fileURLToPath(new URL('./data/leaderboard-snapshot.json', import.meta.url))
)
/**
 * The SEEDED board, for builds that can never write to the real one.
 *
 * Poki forbids every external runtime request and Yandex rejects third-party
 * storage URLs, so neither can post a score — their baked copy is not a stale
 * view of a living board, it is the entire board for the life of the build.
 * Seeding those from the live snapshot ranks their players against a 2 422-row
 * sample of everyone who ever opened the game once, 56 % of whom never passed
 * stage 2. `scripts/leaderboard-seed.mjs` builds a modelled retention curve
 * instead; the file it writes is committed and deterministic.
 */
const SEED_FILE = resolve(
  fileURLToPath(new URL('./data/leaderboard-seed.json', import.meta.url))
)
const SNAPSHOT_SCRIPT = resolve(
  fileURLToPath(new URL('./scripts/leaderboard-snapshot.mjs', import.meta.url))
)

interface LeaderboardSnapshotFile {
  /** When this process last pulled it off the Worker — the freshness clock. */
  fetchedAt: number
  updatedAt: number
  total: number
  entries: { rank: number; name: string; score: number; flair: number }[]
  dist: [number, number][]
}

/** How recently the file must have been fetched for the build to accept it as
 *  already current. Long enough that `build:poki`'s own refresh (and a run of
 *  several portal builds back to back) costs the Worker ONE request. */
const SNAPSHOT_FRESH_MS = 10 * 60_000

const readSnapshotFile = (file: string): LeaderboardSnapshotFile | null => {
  if (!existsSync(file)) return null
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf-8')) as Partial<LeaderboardSnapshotFile>
    if (!Array.isArray(parsed.entries) || !Array.isArray(parsed.dist)) return null
    if (!(Number(parsed.total) > 0)) return null
    return {
      fetchedAt: Number(parsed.fetchedAt) || 0,
      updatedAt: Number(parsed.updatedAt) || 0,
      total: Number(parsed.total),
      entries: parsed.entries,
      dist: parsed.dist
    }
  } catch {
    return null
  }
}

/**
 * @param seeded whether this build can never gain a real player (Poki, Yandex —
 *   no endpoint, so no writes). Those bake the modelled board; every other
 *   target bakes the real snapshot as the bottom rung of its offline ladder.
 */
// ─── Drop-in asset overrides ─────────────────────────────────────────────────
//
// Everything the game draws and plays is procedural (canvas textures, vector
// icons, a synth). A file dropped into one of these folders REPLACES the
// procedural version of the thing it is named after (`art-todo.md`,
// `sound-todo.md` list the names):
//
//   public/audio/sfx/<sfx name>.ogg|mp3|m4a|wav
//   public/audio/music/<track id>.ogg|mp3|m4a
//   public/images/textures/ground.webp|png|jpg
//   public/images/items|skills|portraits|ui|icons/<name>.webp|png|jpg
//   public/audio/voice/<lang>/<dialogue line id>.ogg|mp3|m4a   (one folder per language)
//
// The folders are listed HERE, at build time, into `virtual:asset-overrides`,
// so the game only ever requests files that exist: probing at runtime would
// put a 404 in the console for every missing asset, on every portal, on
// every load. Dev re-scans when a file is added or removed.
const IMAGE_EXTS = ['.webp', '.png', '.jpg']
const OVERRIDE_DIRS = {
  sfx: { dir: 'public/audio/sfx', exts: ['.ogg', '.mp3', '.m4a', '.wav'] },
  music: { dir: 'public/audio/music', exts: ['.ogg', '.mp3', '.m4a'] },
  textures: { dir: 'public/images/textures', exts: IMAGE_EXTS },
  items: { dir: 'public/images/items', exts: IMAGE_EXTS },
  skills: { dir: 'public/images/skills', exts: IMAGE_EXTS },
  portraits: { dir: 'public/images/portraits', exts: IMAGE_EXTS },
  ui: { dir: 'public/images/ui', exts: IMAGE_EXTS },
  // Painted UI icons, status icons, class emblems and marks (`ICON_ART`).
  icons: { dir: 'public/images/icons', exts: IMAGE_EXTS },
  // The painted logo badge and mascot (`LOGO_ART`): the splash shows them when present.
  logo: { dir: 'public/images/logo', exts: IMAGE_EXTS }
} as const
// Spoken dialogue lines: one sub-folder per language, a file per line id
// (`dlg.sunfordSmith.hello.1.ogg`). Listed as `<lang>/<file>`.
const VOICE_DIR = 'public/audio/voice'
const VOICE_EXTS = ['.ogg', '.mp3', '.m4a']
const scanVoice = (): string[] => {
  const abs = fileURLToPath(new URL(`./${VOICE_DIR}`, import.meta.url))
  if (!existsSync(abs)) return []
  const out: string[] = []
  for (const lang of readdirSync(abs, { withFileTypes: true })) {
    if (!lang.isDirectory()) continue
    for (const f of readdirSync(resolve(abs, lang.name))) {
      if (VOICE_EXTS.includes(f.slice(f.lastIndexOf('.')).toLowerCase()) && !/-original\.[a-z0-9]+$/i.test(f)) out.push(`${lang.name}/${f}`)
    }
  }
  return out.sort()
}
const scanOverrides = (): Record<keyof typeof OVERRIDE_DIRS | 'voice', string[]> => {
  const out = { sfx: [] as string[], music: [] as string[], textures: [] as string[], items: [] as string[], skills: [] as string[], portraits: [] as string[], ui: [] as string[], icons: [] as string[], logo: [] as string[], voice: scanVoice() }
  for (const [key, { dir, exts }] of Object.entries(OVERRIDE_DIRS)) {
    const abs = fileURLToPath(new URL(`./${dir}`, import.meta.url))
    if (!existsSync(abs)) continue
    out[key as keyof typeof out] = readdirSync(abs)
      // A compressor's `<name>-original.<ext>` backup is never an asset.
      .filter(f => (exts as readonly string[]).includes(f.slice(f.lastIndexOf('.')).toLowerCase()) && !/-original\.[a-z]+$/i.test(f))
      .sort()
  }
  return out
}
const assetOverridesPlugin = (): Plugin => {
  const ID = 'virtual:asset-overrides'
  const RESOLVED = '\0' + ID
  let base = '/'
  return {
    name: 'asset-overrides',
    resolveId: (id) => (id === ID ? RESOLVED : null),
    load: (id) => (id === RESOLVED ? `export default ${JSON.stringify(scanOverrides())}` : null),
    // The painted logo badge and mascot, written into the static splash when
    // they exist (`src/game/art/splashArt.ts`), under the build's base like
    // LOGO_ART's URLs.
    configResolved: (c) => { base = c.base },
    transformIndexHtml: { order: 'pre', handler: (html) => injectSplashArt(html, scanOverrides().logo, base) },
    configureServer(server) {
      const dirs = [...Object.values(OVERRIDE_DIRS).map(d => d.dir), VOICE_DIR].map(d => fileURLToPath(new URL(`./${d}`, import.meta.url)))
      server.watcher.add(dirs)
      const onChange = (file: string) => {
        if (!dirs.some(d => file.startsWith(d))) return
        const mod = server.moduleGraph.getModuleById(RESOLVED)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', onChange)
      server.watcher.on('unlink', onChange)
    }
  }
}

// ─── The art bench's way into the repo (dev server only) ────────────────────
//
// `/#/art-sheets` (src/views/ArtSheets.vue) draws every reference sheet from
// the game's own vector drawings; this is how they reach `art-sheets/`. A
// browser download would land in Downloads under a name Chrome chose, so the
// bench POSTs here instead: reference PNGs, the index the slicer and the Art
// Desk read, and the prompt documents.
//
// Local only: the dev server's own origin, the bench's own header (which a
// foreign page cannot send without a CORS preflight this never answers), and
// nothing but the file names the pipeline uses, inside `art-sheets/`. Every
// file is written to a temp name and renamed over the real one, so the slicer
// or the desk never reads half a file.
const ART_SHEETS_DIR = fileURLToPath(new URL('./art-sheets', import.meta.url))
const ART_PNG_NAME = /^(?:sheet|single|bg)-[a-z0-9]+(?:-[a-z0-9]+)*\.png$/
const ART_DOC_NAME = /^PROMPTS-[A-Z]+\.md$/
const artSheetsExportPlugin = (): Plugin => ({
  name: 'art-sheets-export',
  apply: 'serve',
  configureServer(server) {
    const put = (name: string, data: string | Buffer): void => {
      mkdirSync(ART_SHEETS_DIR, { recursive: true })
      const file = resolve(ART_SHEETS_DIR, name)
      const tmp = `${file}.${process.pid}.tmp`
      writeFileSync(tmp, data)
      renameSync(tmp, file)
    }
    server.middlewares.use('/__art-sheets', (req, res) => {
      const reply = (code: number, body: unknown): void => {
        res.statusCode = code
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      }
      const host = (req.headers.host ?? '').replace(/:\d+$/, '')
      const origin = req.headers.origin
      const local = ['localhost', '127.0.0.1', '[::1]'].includes(host)
        && (!origin || /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin))
      if (req.method !== 'POST' || req.headers['x-art-sheets'] !== '1' || !local) { reply(403, { error: 'the art bench only' }); return }
      const chunks: Buffer[] = []
      req.on('data', (c: Buffer) => chunks.push(c))
      req.on('end', () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf-8')) as { kind?: string; name?: string; data?: string; text?: string; index?: any }
          if (body.kind === 'png') {
            if (!ART_PNG_NAME.test(body.name ?? '')) throw new Error(`not a sheet name: ${body.name}`)
            const png = Buffer.from(body.data ?? '', 'base64')
            if (png.length < 8 || png.readUInt32BE(0) !== 0x89504e47) throw new Error(`${body.name} is not a PNG`)
            put(body.name!, png)
            reply(200, { ok: true, bytes: png.length })
          } else if (body.kind === 'doc') {
            if (!ART_DOC_NAME.test(body.name ?? '')) throw new Error(`not a prompt document name: ${body.name}`)
            put(body.name!, body.text ?? '')
            reply(200, { ok: true })
          } else if (body.kind === 'index') {
            // MERGE: the bench may have drawn only some sheets (`?only=`). A
            // panel it did not measure this time keeps the fit already on
            // disk; a panel the manifest no longer lists simply is not in the
            // index it sent, so it drops out.
            const next = body.index
            if (!next || !Array.isArray(next.sheets) || !Array.isArray(next.scenery)) throw new Error('not a sheet index')
            const file = resolve(ART_SHEETS_DIR, 'sheet-index.json')
            const old = new Map<string, unknown>()
            if (existsSync(file)) {
              try {
                const prev = JSON.parse(readFileSync(file, 'utf-8'))
                for (const s of prev.sheets ?? []) for (const c of s.cells ?? []) if (c.fit && c.target) old.set(c.target, c.fit)
              } catch { /* a broken index is replaced, not merged */ }
            }
            for (const s of next.sheets) for (const c of s.cells ?? []) if (!c.fit && old.has(c.target)) c.fit = old.get(c.target)
            put('sheet-index.json', `${JSON.stringify(next, null, 2)}\n`)
            reply(200, { ok: true, index: next })
          } else {
            throw new Error(`unknown kind: ${body.kind}`)
          }
        } catch (e) {
          reply(400, { error: e instanceof Error ? e.message : String(e) })
        }
      })
    })
  }
})

// ─── Engine chunk preload ───────────────────────────────────────────────────
//
// The engine (`src/game/boot.ts`: three.js plus the game) and the scene
// route are DYNAMIC imports, so by default their download only starts once
// main.ts has finished its portal-SDK and save init and App has mounted the
// loader — seconds of waiting on a slow network with an idle pipe. These
// `modulepreload` hints start the download alongside the entry chunk. Preload
// only fetches and parses; nothing is evaluated before the app asks for it, so
// the save hydrate still runs before any game module reads state.
const ENGINE_CHUNKS = [/src[\\/]game[\\/]boot\.ts$/, /src[\\/]views[\\/]GameScene\.vue$/]
const preloadEngineChunksPlugin = (): Plugin => {
  let base = '/'
  return {
    name: 'preload-engine-chunks',
    apply: 'build',
    configResolved(c) { base = c.base },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html
        const files = new Set<string>()
        const add = (name: string): void => {
          const c = bundle[name]
          if (!c || c.type !== 'chunk' || files.has(name)) return
          files.add(name)
          c.imports.forEach(add)
        }
        for (const c of Object.values(bundle)) {
          if (c.type === 'chunk' && c.facadeModuleId && ENGINE_CHUNKS.some(r => r.test(c.facadeModuleId!))) add(c.fileName)
        }
        return [...files]
          .filter(f => !html.includes(f))
          .map(f => ({ tag: 'link', attrs: { rel: 'modulepreload', crossorigin: '', href: base + f }, injectTo: 'head' as const }))
      }
    }
  }
}

const leaderboardSnapshotPlugin = (seeded: boolean): Plugin => ({
  name: 'leaderboard-snapshot',
  buildStart() {
    if (seeded) {
      // Nothing to fetch: the seed is generated from a curve, committed, and
      // deterministic. Re-running `pnpm leaderboard:seed` reproduces it byte for
      // byte, so a build never needs to and never should.
      const seed = readSnapshotFile(SEED_FILE)
      if (seed) {
        console.log(
          `[leaderboard] baking the SEEDED board — ${seed.total} players / `
          + `${seed.entries.length} rows, top score ${seed.dist[0]?.[0] ?? 0}. `
          + 'This build cannot post scores, so the board is modelled.'
        )
      } else {
        console.warn(
          `[leaderboard] no seed at ${SEED_FILE} — run \`pnpm leaderboard:seed\`. `
          + 'This build has no leaderboard.'
        )
      }
      return
    }

    // The `build:*` scripts refresh it themselves, so the file is usually
    // seconds old by the time this runs. Refetching would be a second round
    // trip for the same bytes — and building five portal targets in a row would
    // be five. This hook is the SAFETY NET for anyone invoking `vite build
    // --mode <x>` directly, which is why it stays.
    const onDisk = readSnapshotFile(SNAPSHOT_FILE)
    const fresh = onDisk !== null && Date.now() - onDisk.fetchedAt < SNAPSHOT_FRESH_MS
    if (!fresh) {
      try {
        execFileSync(process.execPath, [SNAPSHOT_SCRIPT], { stdio: 'inherit', timeout: 60_000 })
      } catch {
        // Offline, or the Worker is down. The committed file stands in.
        console.warn(
          '[leaderboard] could not refresh the snapshot — building with the committed copy.'
        )
      }
    }
    const snap = readSnapshotFile(SNAPSHOT_FILE)
    if (snap) {
      console.log(
        `[leaderboard] baking ${snap.total} players / ${snap.entries.length} rows `
        + `(board of ${new Date(snap.updatedAt).toISOString().slice(0, 10)})`
      )
    } else {
      // Not a build failure. A build WITH an endpoint still has its live
      // board (`leaderboardEnabled` is true on `LIVE` alone); it only lacks the
      // offline fallback, which is normal until a new board has players.
      console.warn(
        `[leaderboard] no usable snapshot at ${SNAPSHOT_FILE} — the live board still works; `
        + 'this build just has no offline fallback yet (a new board with no players).'
      )
    }
  },
  resolveId(id) {
    if (id === SNAPSHOT_VIRTUAL_ID) return SNAPSHOT_RESOLVED
    return null
  },
  load(id) {
    if (id !== SNAPSHOT_RESOLVED) return null
    return `export default ${JSON.stringify(readSnapshotFile(seeded ? SEED_FILE : SNAPSHOT_FILE))}`
  }
})

// Read the package version directly so APP_VERSION resolves regardless of
// how vite is invoked. `process.env.npm_package_version` is only set when
// vite runs via `pnpm run <script>` — running `pnpm vite` directly leaves
// it undefined, which makes Vite log the literal define entry as a warning.
const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8')
) as { version?: string }
const appVersion: string = pkg.version ?? '0.0.0'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { buildCsp } from './src/platforms/csp'
import { injectSplashArt } from './src/game/art/splashArt'
import { buildPlaygamaBridgeConfig, playgamaLeaderboardEnv } from './src/platforms/playgama/bridgeConfig'
import { PLAYGAMA_BRIDGE_CHUNK, PLAYGAMA_OUT_DIR } from './src/platforms/playgama/release'
import { devToolAliases, resolvePlatformPolicy } from './src/platforms/policy'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' loads all env vars regardless of VITE_ prefix.
  const env = loadEnv(mode, process.cwd(), '')

  // ─── Exactly ONE platform flag per build ──────────────────────────────
  // Vite MERGES `.env` with `.env.<mode>`, so any platform flag set in the
  // base `.env` stays true for every mode that does not explicitly clear it.
  // That is not cosmetic: `resolveSaveStrategy` and `resolveAdProvider` both
  // take the FIRST matching arm, so an inherited flag silently HIJACKS the
  // build — the portal's own strategy/provider never loads, and on a
  // CrazyGames leak `persistToRaw=false` (CG cloud-only mode) additionally
  // scrubs local state on every boot. Nothing in the build output hints at it.
  // Fail loudly at config time instead: the fix is to set the other flags to
  // `false` in that mode's env file (see `.env.yandex.local` / `.env.poki.local`
  // for the pattern) or to clear them in the base `.env` before building.
  const PLATFORM_FLAGS = [
    'VITE_APP_CRAZY_WEB', 'VITE_APP_WAVEDASH', 'VITE_APP_ITCH', 'VITE_APP_GLITCH',
    'VITE_APP_GAME_DISTRIBUTION', 'VITE_APP_PLAYGAMA', 'VITE_APP_GAMEPIX',
    'VITE_APP_GAME_MONETIZE', 'VITE_APP_YANDEX', 'VITE_APP_POKI'
  ] as const
  const activePlatformFlags = PLATFORM_FLAGS.filter((f) => env[f] === 'true')
  if (activePlatformFlags.length > 1) {
    throw new Error(
      `[vite] ${activePlatformFlags.join(', ')} are ALL true in mode "${mode}". `
      + 'Exactly one platform flag may be set per build — the save strategy and '
      + 'ad provider both take the first matching arm, so the extra flag would '
      + 'hijack this build. Set the others to false in the mode env file.'
    )
  }

  // GameMonetize: the SDK serves nothing without this game's id from the GM
  // dashboard, and its plugin switches itself off when the id is blank — a
  // build that boots, plays, and never shows the moderation-mandated
  // first-load ad. Loud here; `build:gamemonetize` then REFUSES to pack it
  // (`scripts/gamemonetize-release.mjs`).
  if (command === 'build' && env.VITE_APP_GAME_MONETIZE === 'true' && !(env.VITE_GAME_ID ?? '').trim()) {
    console.warn(
      '\n[gamemonetize] VITE_GAME_ID is EMPTY — this build shows no ads at all. '
      + 'Create the game on gamemonetize.com and paste its id into .env.gamemonetize.local.\n'
    )
  }

  // Only obfuscate during a real production build — never during dev,
  // where the obfuscator rewrites dynamic import strings into lookups
  // Vite can no longer transform, breaking module specifiers at runtime.
  const isProduction = (mode === 'production' || env.VITE_NODE_ENV === 'production') && command === 'build'
  const shouldObfuscate = env.VITE_ENABLE_OBFUSCATION === 'true'

  // Initialize plugins array
  const plugins = []

  // Drop-in art/audio overrides (see `assetOverridesPlugin`).
  plugins.push(assetOverridesPlugin())

  // The art bench's export endpoint (dev server only, see the plugin).
  plugins.push(artSheetsExportPlugin())

  // The baked board. EVERY build carries one — but not the same one, and the
  // difference is whether the build can ever write to the real board.
  //
  // Poki and Yandex cannot: they forbid the request outright, which `loadEnv`
  // surfaces here as an empty `VITE_LEADERBOARD_URL`. Their copy is the WHOLE
  // board for the life of the build and no player of theirs will ever join it,
  // so it is the modelled one — see `SEED_FILE`.
  //
  // Every other build bakes the real snapshot as the bottom rung of
  // `useLeaderboard`'s offline ladder: what a player sees when the fetch fails
  // and their device has no cache yet. Not hypothetical — the Worker's D1
  // row-read allowance ran out mid-afternoon and `/top` threw for every live
  // build, which without this shows a first-time player "Couldn't reach the
  // leaderboard". It costs ~2 kB gzipped per build.
  plugins.push(leaderboardSnapshotPlugin((env.VITE_LEADERBOARD_URL ?? '').trim().length === 0))

  // Only push the obfuscator if both conditions are met
  if (isProduction && shouldObfuscate) {
    console.log('--- 🛡️  Obfuscating Production Build ---')
    plugins.push(
      javascriptObfuscator({
        // Exclude files with dynamic imports — the obfuscator's stringArray
        // rewrites import paths into array lookups that Vite can no longer
        // resolve, which breaks code splitting.
        exclude: [
          // FIRST, and not optional: passing ANY `exclude` REPLACES the
          // plugin's default of `[/node_modules/, /\.nuxt/]` — it does not
          // add to it. Without this line every vendor library went through the
          // stringArray pass, three.js included: its shader assembly and
          // per-draw uniform lookups ran through the decoder, costing ~30 % of
          // the boot and ~13 % of every frame on a throttled CPU, for zero
          // protection (it is public code). See PERF-LEDGER.md.
          /node_modules/,
          /router\/index\.ts$/,
          /main\.ts$/,
          // i18n loader uses `import.meta.glob` for per-locale code
          // splitting — the obfuscator's stringArray rewrites those
          // dynamic paths so rollup can no longer produce separate
          // chunks (every locale ends up inlined in index.js).
          /i18n[\\/]index\.ts$/,
          // resolveSaveStrategy uses `await import('@/...')` inside
          // `import.meta.env.VITE_APP_*`-gated branches so Rollup can
          // tree-shake unused platform plugins. Obfuscation would
          // mangle the dynamic-import literals and break runtime
          // module resolution. (resolveAdProvider stays static-import
          // sync, so it doesn't need an exclude.)
          /platforms[\\/]resolveSaveStrategy\.ts$/,
          // useCrazyGames is the CrazyGames save-strategy delegate that
          // resolveSaveStrategy hands off to. It lazy-loads
          // `@/utils/save/CrazyGamesStrategy` via dynamic import. Without
          // this exclude the obfuscator's stringArray rewrite mangles the
          // literal, Vite can't resolve the `@/` alias, and the browser
          // surfaces `Failed to resolve module specifier
          // '@/utils/save/CrazyGamesStrategy'` at runtime (CG QA flagged
          // it 2026-05-20).
          /use[\\/]useCrazyGames\.ts$/,
          // GameDistributionProvider lazy-loads the heavy
          // `@/utils/gameDistributionPlugin` (~500 LOC) via dynamic
          // import so non-GD builds don't ship the GD SDK code.
          // Same obfuscator-vs-dynamic-import constraint as above.
          /use[\\/]ads[\\/]GameDistributionProvider\.ts$/,
          // PlaygamaProvider lazy-loads `@/utils/playgamaPlugin` for the
          // same reason — keeps the ~280 LOC bridge module off non-Playgama
          // builds. The obfuscator would mangle the dynamic-import literal.
          /use[\\/]ads[\\/]PlaygamaProvider\.ts$/,
          // `playgamaBridgeLoader.ts` is the ONE place `@playgama/bridge`
          // (Bridge v2, npm) enters the graph, behind an env-literal ternary
          // around `import('@playgama/bridge')`. Same dynamic-import constraint.
          /utils[\\/]playgamaBridgeLoader\.ts$/,
          // GamepixProvider lazy-loads `@/utils/gamepixPlugin` so the
          // GamePix SDK glue only ships on GamePix builds. Same
          // obfuscator-vs-dynamic-import constraint as the others.
          /use[\\/]ads[\\/]GamepixProvider\.ts$/,
          // FLogoProgress dynamic-imports `@/utils/playgamaPlugin` and
          // `@/utils/gamepixPlugin` to fire the certification-mandatory
          // `game_ready` / `gameLoaded` edges. Without this exclude the
          // obfuscator wraps the string literal in a stringArray-decoder
          // call expression — Rollup can't statically analyse it for
          // alias resolution, so `@/utils/...` survives into the chunk
          // and the browser surfaces `Failed to resolve module specifier
          // '@/utils/gamepixPlugin'` at runtime.
          //
          // NOTE: no `$` end-anchor — Vue SFCs are presented to the
          // obfuscator's transform hook as virtual paths like
          // `FLogoProgress.vue?vue&type=script&setup=true&lang.ts`,
          // which an anchored regex would miss. Match anywhere on the
          // path so both the raw `.vue` file AND the script-block
          // virtual module are excluded.
          /components[\\/]atoms[\\/]FLogoProgress\.vue/,
          // The scene lazy-loads the recorder seam (`?preview=1`, dev only). Same
          // obfuscator-vs-dynamic-import constraint.
          /views[\\/]GameScene\.vue/,
          // The boot's lazy chunks (PERF-LEDGER.md, 2026-10-03 boot entry): the
          // town's view, the full screens and the menu host that opens them.
          // Each holds the dynamic imports and nothing else worth hiding; the
          // stringArray rewrite would inline the chunks back or break the
          // specifiers. No `$` anchor on the .vue one (SFC virtual paths).
          /game[\\/]gfx[\\/]townLoader\.ts$/,
          /components[\\/]screens[\\/]chunks\.ts$/,
          /components[\\/]modals[\\/]GameModals\.vue/,
          // useMawCampaign lazy-loads the heavy `useStageBuilder`
          // chunk via `await import('@/use/useStageBuilder')` so all
          // 20 stage builds stay off the boot critical path. The
          // obfuscator's stringArray rewrite would inline the chunk
          // back into the parent, undoing the split.
          // useAssets.preloadAssets dynamic-imports the campaign module
          // so the gameplay shared-chunk loads in parallel with the
          // splash render instead of blocking the entry parse. Same
          // obfuscator-vs-dynamic-import constraint as above.
          /use[\\/]useAssets\.ts$/,
          // capabilities.ts has per-platform URL-detector helpers (with
          // hostname literals like `'crazygames'`, `'wavedash'`, `'glitch.fun'`,
          // ...) gated by env-literal IFs so Rollup can tree-shake the dead
          // branches per build. The obfuscator's `stringArray` transform runs
          // BEFORE esbuild's constant folding can fold `import.meta.env.X === 'true'`,
          // baking every hostname into the indirection table regardless of
          // which build is active. Excluding capabilities.ts keeps the
          // constant-fold + tree-shake path intact so on a Yandex build the
          // bundle contains no non-Yandex hostnames — required by Yandex's
          // moderator ("Service storage URL detected").
          /platforms[\\/]capabilities\.ts$/,
          // plattformText.ts is the per-build "available on <hostname>" string
          // mapping. Same obfuscator-vs-stringArray issue as capabilities.ts —
          // the ladder needs env-literal DCE to keep non-active hostnames out
          // of the bundle. The file is intentionally tiny so excluding it
          // doesn't meaningfully reduce obfuscation coverage of App.vue (which
          // still gets obfuscated normally and just imports from this helper).
          /platforms[\\/]plattformText\.ts$/,
          // useCheats lazy-loads `@/use/useSurvivalGame` to publish
          // `window.__run` and to drive the stage / damage shortcuts. Without
          // this exclude the stringArray rewrite mangles the literal and the
          // BUILT bundle throws `Failed to resolve module specifier
          // '@/use/useSurvivalGame'` the moment cheats are enabled — which is
          // exactly when someone is trying to debug a built bundle. Found while
          // verifying the CG pre-release build. The cheats self-gate on
          // `localStorage.cheat`, so leaving this file readable grants nothing
          // devtools would not.
          /use[\\/]useCheats\.ts$/,
          // usePlayerIdentity lazy-loads `@/use/useCrazyGames` to read the
          // portal's player name for the leaderboard. Same failure mode, but on
          // a PLAYER-facing path rather than a dev-only one.
          /use[\\/]usePlayerIdentity\.ts$/
        ],
        // ─── Obfuscation profile (tuned 2026-04-30) ─────────────────────
        // The previous profile enabled every aggressive transform the
        // plugin offers — `controlFlowFlattening`, `numbersToExpressions`,
        // `splitStrings`, `unicodeEscapeSequence`. Combined they were
        // inflating the bundle by ~3.4× over the unobfuscated baseline
        // (e.g. 217KB → 768KB on the entry chunk for the CrazyGames
        // build flagged by CG QA on 2026-04-30).
        //
        // The transforms removed below all have the same trade-off:
        // huge bundle / runtime cost for protection that any
        // off-the-shelf deobfuscator strips in seconds. Keeping them on
        // costs real users real download time without preventing a
        // motivated reverse-engineer for more than a coffee break.
        //
        // What stays (cheap, useful):
        //   • compact            — single-line output
        //   • simplify           — CFG simplification
        //   • stringArray        — string indirection table
        //   • stringArrayThreshold 0.6 — moderate coverage
        //
        // What was removed (expensive, low-value):
        //   • unicodeEscapeSequence — every `"foo"` → `"foo"`
        //     ~doubles strings on the wire. Trivially reversed.
        //   • splitStrings          — splits every string into 2-char
        //     pieces concatenated at runtime. Triples string size,
        //     interpretable by any human in <1 minute.
        //   • controlFlowFlattening — wraps every block in a switch
        //     dispatcher. ~30% bundle inflation, ~10% runtime perf hit.
        //   • numbersToExpressions  — every literal `5` becomes
        //     `0x4 + 0x1` etc. Bloats math-heavy modules (the canvas
        //     game loop is full of these).
        //
        // If a tighter profile is needed later, prefer enabling
        // `controlFlowFlattening` selectively on a small allowlist of
        // sensitive files (anti-cheat hot paths, license checks) rather
        // than blanket-enabling everywhere.
        options: {
          compact: true,
          simplify: true,
          stringArray: true,
          stringArrayThreshold: 0.6
        }
      } as any)
    )
  }

  // ─── CSP generation ────────────────────────────────────────────────
  // The whole per-platform CSP shape lives in `src/platforms/csp.ts`
  // — extracted so it's unit-testable. Adding a new platform's CSP
  // contribution = edit that file, not this one.
  //
  // YANDEX EXCEPTION: do NOT inject a CSP meta tag on Yandex builds. The
  // game runs inside Yandex's own iframe wrapper, which injects its own
  // production CSP (that's exactly what `@yandex-games/sdk-dev-proxy --csp`
  // fetches + applies during local testing). Our own meta tag is therefore
  // redundant — AND it's the last place in the bundle that names Yandex
  // service hostnames like `yastatic.net` (Yandex's static-storage CDN),
  // `an.yandex.ru`, `yandexadexchange.net`. Yandex's moderation auto-check
  // flags those as "Service storage URL detected" (requirement: no absolute
  // URLs to Yandex service storage in the game's own code). Omitting the
  // meta tag entirely leaves index.html with ZERO Yandex-service URLs and
  // lets Yandex's wrapper own the security policy. The placeholder comment
  // is simply removed so it doesn't ship either.
  const isYandexBuild = env.VITE_APP_YANDEX === 'true'
  // GamePix, like Yandex, hosts the game in its own environment and applies its
  // own CSP. Our meta tag is redundant there and the GamePix testing toolkit's
  // wrapper surfaced it as a `script-src` "blocks the use of 'eval'" violation
  // (the GamePix SDK + its Google ad-creative chain need `eval`/`Function`).
  // Skipping our meta tag on the GamePix build lets GamePix's environment own
  // the policy — same exception we already make for Yandex.
  const isGamepixBuild = env.VITE_APP_GAMEPIX === 'true'
  // POKI: same exception, stronger reason — and this is the single most
  // important line of the Poki integration. Poki applies a PER-GAME allowlist
  // server-side (P4D -> Settings -> CSP) and its core SDK injects an entire ad
  // stack INTO OUR IFRAME: Google Publisher Tag, IMA, Amazon TAM and a prebid
  // waterfall (securepubads.g.doubleclick.net, imasdk.googleapis.com,
  // prebid.adnxs.com, aax.amazon-adsystem.com, onetag-sys.com, ...). Our own
  // meta tag would block the whole waterfall and report NOTHING: the game runs,
  // `commercialBreak()` resolves, and no ad ever plays. Whitelisting those hosts
  // is the wrong fix too — the list rotates with Poki's ad partners. Emit no
  // meta tag and let P4D own the policy.
  const isPokiBuild = env.VITE_APP_POKI === 'true'
  const isPlaygamaBuild = env.VITE_APP_PLAYGAMA === 'true'
  // Portal rules that decide what ships — resolved ONCE, here, for this build.
  // The dev-tooling aliases below read it, and the app gets the very same
  // object as the `__PLATFORM_POLICY__` constant (see `define`), so the two can
  // never disagree. Poki and Playgama are both clean releases; `VITE_QA_TOOLS`
  // (the Poki-era `VITE_POKI_QA_TOOLS` still works) builds the QA twin that
  // keeps the tooling, which both portals' release gates then refuse.
  const platformPolicy = resolvePlatformPolicy({
    isPoki: isPokiBuild,
    isPlaygama: isPlaygamaBuild,
    qaTools: env.VITE_POKI_QA_TOOLS === 'true' || env.VITE_QA_TOOLS === 'true'
  })
  // PLAYGAMA / YOUTUBE PLAYABLES: same exception again, and the reason is the
  // strongest of the four. This archive is also the YouTube Playables
  // submission, and Playables runs the game under YOUTUBE'S OWN CSP inside a
  // document it shares with YouTube's runtime. A game-authored policy fights
  // the host's, and CSP violations are a named Playables rejection reason
  // (YT-FAQ) — dynamically created script tags that lack YouTube's nonce get
  // blocked at runtime, which is invisible to every local test.
  //
  // It also removes the last place in the bundle that names every OTHER
  // portal's hosts: the meta tag is a single string listing crazygames,
  // gamedistribution, wavedash, clarity.ms, jsonbin.io and the rest, and a
  // reviewer grepping the archive finds all of them there and nowhere else.
  // Dropping the tag takes those strings out with it.
  const skipCspMeta = isYandexBuild || isGamepixBuild || isPokiBuild || isPlaygamaBuild
  const cspValue = buildCsp(env)

  plugins.push({
    name: 'inject-csp',
    transformIndexHtml(html: string) {
      return html.replace(
        '<!-- CSP meta tag injected by vite.config.ts at build time -->',
        skipCspMeta
          ? ''
          : `<meta http-equiv="Content-Security-Policy" content="${cspValue}" />`
      )
    }
  })

  // Strip the CrazyGames SDK <script> tag from index.html for non-CrazyGames builds
  // so it doesn't block or error on other platforms (e.g. Wavedash).
  const isCrazyWeb = env.VITE_APP_CRAZY_WEB === 'true'
  if (!isCrazyWeb) {
    plugins.push({
      name: 'strip-crazygames-sdk',
      transformIndexHtml(html: string) {
        return html.replace(
          /<!-- Load the SDK before your game code -->\s*<script[^>]*sdk\.crazygames\.com[^>]*><\/script>\s*/,
          ''
        )
      }
    })
  }

  // No Playgama <script> tag to strip any more: Bridge v2 is bundled from the
  // `@playgama/bridge` npm package behind a build-gated dynamic import
  // (`src/utils/playgamaBridgeLoader.ts`), so it only exists in this build.
  const isPlaygama = env.VITE_APP_PLAYGAMA === 'true'

  // Strip YouTube's Playables SDK tag from every build EXCEPT Playgama's.
  //
  // This is the inverse of the other strips in spirit: the tag is not a perf
  // shave we can take or leave, it is mandatory on the one build that reaches
  // Playables. `build:playgama` IS the Playables submission — Playgama is an
  // official partner and forwards that single archive to YouTube — so the tag
  // must survive exactly there and nowhere else. On other portals a foreign
  // SDK URL in index.html is at best a stray DNS lookup and at worst a
  // moderation flag (Yandex rejects absolute foreign service URLs outright).
  if (!isPlaygama) {
    plugins.push({
      name: 'strip-youtube-sdk',
      transformIndexHtml(html: string) {
        return html.replace(
          /<!--\s*YouTube Playables SDK[^]*?-->\s*<script[^>]*youtube\.com\/game_api[^>]*><\/script>\s*/,
          ''
        )
      }
    })
  }

  // Strip the GamePix SDK <script> tag from non-GamePix builds. Same reason
  // as the Playgama strip — we don't want an extra DNS lookup to
  // integration.gamepix.com on other portals. The plugin polls for
  // `window.GamePix` after init and stays inert if it never appears.
  const isGamepix = env.VITE_APP_GAMEPIX === 'true'
  if (!isGamepix) {
    plugins.push({
      name: 'strip-gamepix-sdk',
      transformIndexHtml(html: string) {
        return html.replace(
          /<!-- Load the SDK before your game code -->\s*<script[^>]*integration\.gamepix\.com[^>]*><\/script>\s*/,
          ''
        )
      }
    })
  }

  // Strip the Poki SDK <script> tag from non-Poki builds. Same reason as the
  // Playgama / GamePix strips — no extra DNS lookup to game-cdn.poki.com on
  // other portals, and (unlike those two) a foreign SDK URL left in index.html
  // is exactly what Yandex moderation rejects as "Service storage URL detected".
  // The plugin re-injects the tag at runtime if a QA wrapper serves its own
  // index.html, so stripping it here is safe.
  const isPoki = env.VITE_APP_POKI === 'true'
  if (!isPoki) {
    plugins.push({
      name: 'strip-poki-sdk',
      transformIndexHtml(html: string) {
        return html.replace(
          /<!-- Poki SDK[^>]*-->\s*<script[^>]*game-cdn\.poki\.com[^>]*><\/script>\s*/,
          ''
        )
      }
    })
  }

  // ─── GameMonetize: no developer notes in the archive ────────────────────
  // index.html and `public/js/storage-shim.js` ship as written, comments and
  // all — and those comments explain the Playgama Bridge, YouTube Playables'
  // `ytgame` runtime and the other portals' SDK tags. GameMonetize reviews the
  // archive by hand and its release gate (`scripts/gamemonetize-release.mjs`)
  // refuses another portal's SDK name anywhere in it, so the GM build drops
  // the comments from both. Runs last, after the strips and the CSP injection
  // above have used the comment markers they anchor on.
  const isGameMonetizeBuild = env.VITE_APP_GAME_MONETIZE === 'true'
  if (isGameMonetizeBuild) {
    plugins.push({
      name: 'gamemonetize-strip-comments',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler: (html: string) => html.replace(/<!--[\s\S]*?-->\s*/g, '')
      },
      writeBundle(options) {
        const shim = resolve(options.dir ?? 'dist', 'js/storage-shim.js')
        if (!existsSync(shim)) return
        const src = readFileSync(shim, 'utf-8')
        // Block comments, then whole-line `//` comments. The shim holds no
        // string or regex containing either sequence (it is ES5, written by
        // hand), so this cannot cut code.
        writeFileSync(shim, src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\n{2,}/g, '\n'))
      }
    } as Plugin)
  }

  // ─── GamePix single-file bundle ─────────────────────────────────────────
  // The GamePix build CDN serves the root `index.html` (200) but intermittently
  // 403s the hashed `assets/*.js` / `assets/*.css` chunks — the 403 body is XML,
  // so the browser refuses the ES module ("blocked due to MIME application/xml")
  // and the app never finishes loading → dead UI, no ad calls. Verified end-to-
  // end in a real browser that the ad chain itself works when assets load, so
  // this is purely the CDN refusing separate chunks. Inline the ENTIRE app
  // (JS + CSS) into index.html for the GamePix build so there are no separate
  // code chunks to refuse — the one file the CDN already serves carries
  // everything. Runtime-URL assets (`images/`, `audio/`, fetched by string URL,
  // not build-time imports) stay external and load fine. GamePix-only; other
  // platforms keep normal code-splitting. Obfuscation is off for GamePix, and
  // the CSP already allows `'unsafe-inline'` scripts on this ad-waterfall build,
  // so the inlined bundle isn't a CSP regression.
  if (isGamepix) {
    // Cast to `any` — the plugin ships its own (mismatched) Vite Plugin types,
    // same reason the obfuscator plugin above is cast.
    plugins.push(viteSingleFile() as any)
  } else {
    // Everything is inlined on the single-file build; elsewhere the engine
    // chunks start downloading with the entry (see the plugin).
    plugins.push(preloadEngineChunksPlugin())
  }

  // Emit `playgama-bridge-config.json` ONLY for the Playgama mode — into the
  // build, and answered by the dev server under `vite --mode playgama`. NOT
  // served from `public/` because Vite would expose it in every other
  // mode's dev server and `dist/` — which historically baked
  // `forciblySetPlatformId: 'playgama'` and made the bridge hang in
  // localhost / QA-tool contexts (which speak different protocols than
  // the production portal). The config here intentionally OMITS
  // `forciblySetPlatformId` so the bridge auto-detects the right protocol.
  //
  // The config also switches on Playgama's SaaS leaderboard when `.env.playgama`
  // carries both its id and the dashboard's public token — see
  // `src/platforms/playgama/bridgeConfig.ts`.
  if (isPlaygama) {
    const playgamaBoard = playgamaLeaderboardEnv(env)
    if ((playgamaBoard.id.length > 0) !== (playgamaBoard.token.length > 0)) {
      console.warn(
        '[playgama] VITE_PLAYGAMA_LEADERBOARD_ID and PLAYGAMA_SAAS_PUBLIC_TOKEN must be set together — '
        + 'building WITHOUT the Playgama leaderboard.'
      )
    }
    const playgamaBridgeConfigJson = JSON.stringify(buildPlaygamaBridgeConfig(env), null, 2)
    const playgamaBridgeConfigPlugin: Plugin = {
      name: 'emit-playgama-bridge-config',
      // The bridge fetches `./playgama-bridge-config.json` on every boot. With
      // no file there, the dev server's SPA fallback answers with index.html
      // and the bridge logs "Config parsing error. SyntaxError: Unexpected
      // token '<'" and boots on its defaults — so the dev server serves the
      // same bytes the build ships.
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!(req.url ?? '').split('?')[0].endsWith('/playgama-bridge-config.json')) { next(); return }
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(playgamaBridgeConfigJson)
        })
      },
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'playgama-bridge-config.json',
          source: playgamaBridgeConfigJson
        })
      }
    }
    plugins.push(playgamaBridgeConfigPlugin)
  }

  // Foreign-platform code is kept out of the Yandex bundle via `resolve.alias`
  // stubs (see the resolve.alias block below), NOT by deleting emitted chunks.
  //
  // The previous approach — a `generateBundle` hook that DELETED chunks like
  // `gamepixPlugin-*.js` — was fundamentally unsafe: `MawScene.vue` STATICALLY
  // imports `gamePixHappyMoment` from `@/utils/gamepixPlugin`, so Rollup emits
  // gamepixPlugin as a shared chunk that MawScene depends on. Deleting that
  // chunk left MawScene's import dangling → 404 at runtime → "Failed to fetch
  // dynamically imported module: MawScene" → the whole game failed to load on
  // Yandex. Stub-aliasing instead swaps the real module (with its SDK URL) for
  // a tiny no-op module BEFORE bundling, so the URL never enters the build AND
  // the import resolves to a valid chunk. No chunk deletion, no 404.

  return {
    base: '/',
    // A tool that starts a dev server of its own (the video recorder, the art
    // export) points this at its own folder, so it never re-optimises the
    // dependency cache under a dev server somebody already has open.
    cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',
    server: {
      port: 2194,
      watch: {
        // Written BY tools while a page is open: recorded clips, exported
        // reference sheets. Watching them reloads the page that is writing.
        ignored: ['**/preview-videos/**', '**/art-sheets/**']
      }
    },
    define: {
      APP_VERSION: JSON.stringify(appVersion),
      // This build's platform policy as a literal (see `policy.ts`): the app
      // reads the result instead of re-resolving it from the env flags.
      __PLATFORM_POLICY__: JSON.stringify(platformPolicy)
    },
    plugins: [
      tailwindcss(),
      vue(),
      // vueDevTools(),
      VueI18nPlugin({
        // 1. Tell the plugin where your global translation files are
        include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),

        // 2. This allows you to use YAML in the <i18n> block
        // The plugin usually detects yaml automatically, but you can force
        // strict behavior if needed by ensuring the 'yaml' loader is available.
        defaultSFCLang: 'yaml'
      }),
      ...plugins
    ],
    resolve: {
      alias: {
        // On non-CrazyGames builds, redirect `@/use/useCrazyGames` to a
        // no-op stub. The real module contains the literal SDK environment
        // identifier 'crazygames' + `[crazygames]` console log prefixes;
        // many components statically import from it, so its strings end up
        // in the bundle of every build even when the functions are no-ops
        // at runtime. Yandex's moderator flags those non-Yandex identifier
        // strings as "Service storage URL detected", so the alias forces
        // the bundle to use the stub on non-CG builds and the strings stay
        // out entirely. MUST appear BEFORE the `@` / `@/` catch-alls so the
        // more-specific path wins resolution.
        // The other-portal Ad/Save providers are STATICALLY imported by
        // `resolveAdProvider` / `resolveSaveStrategy`. Even on a Yandex build
        // where every `createXxxProvider()` function is dead code (the
        // env-gated arm never executes), the function BODIES — including
        // their `name: 'crazygames'` / `name: 'gamemonetize'` / etc. string
        // literals — live in the chunk. Yandex's moderator flags non-Yandex
        // identifier strings as "Service storage URL detected". Aliasing each
        // foreign-portal provider to a no-op stub on non-active builds keeps
        // the strings out of the bundle entirely. Same pattern for the heavy
        // `useCrazyGames` module which is statically imported by many Vue
        // components for `stopGameplay` / `triggerHappytime` etc.
        ...(env.VITE_APP_CRAZY_WEB === 'true' ? {} : {
          '@/use/useCrazyGames': fileURLToPath(new URL('./src/use/useCrazyGames.stub.ts', import.meta.url)),
          '@/use/ads/CrazyGamesProvider': fileURLToPath(new URL('./src/use/ads/CrazyGamesProvider.stub.ts', import.meta.url))
        }),
        ...(env.VITE_APP_GAME_DISTRIBUTION === 'true' ? {} : {
          '@/use/ads/GameDistributionProvider': fileURLToPath(new URL('./src/use/ads/GameDistributionProvider.stub.ts', import.meta.url))
        }),
        ...(env.VITE_APP_PLAYGAMA === 'true' ? {} : {
          '@/use/ads/PlaygamaProvider': fileURLToPath(new URL('./src/use/ads/PlaygamaProvider.stub.ts', import.meta.url)),
          // The provider stub closes the STATIC path only: `main.ts`,
          // `FLogoProgress.vue` and the gameplay-lifecycle fan-out still
          // `await import('@/utils/playgamaPlugin')`, and each dynamic import is
          // a chunk that ships in every other portal's archive. Same stub-swap
          // as yandexPlugin below.
          '@/utils/playgamaPlugin': fileURLToPath(new URL('./src/utils/playgamaPlugin.stub.ts', import.meta.url))
        }),
        ...(env.VITE_APP_GAMEPIX === 'true' ? {} : {
          '@/use/ads/GamepixProvider': fileURLToPath(new URL('./src/use/ads/GamepixProvider.stub.ts', import.meta.url)),
          // gamepixPlugin is STATICALLY imported by MawScene.vue (for
          // gamePixHappyMoment), so Rollup emits it as a shared chunk MawScene
          // depends on. The real module hardcodes the GamePix SDK URL
          // (integration.gamepix.com) which Yandex moderation flags. Alias to
          // the stub so the URL never enters the bundle AND MawScene's import
          // resolves to a valid no-op chunk (no 404 — the bug that broke game
          // loading when we tried deleting the chunk instead).
          '@/utils/gamepixPlugin': fileURLToPath(new URL('./src/utils/gamepixPlugin.stub.ts', import.meta.url))
        }),
        ...(env.VITE_APP_GAME_MONETIZE === 'true' ? {} : {
          '@/use/ads/GameMonetizeProvider': fileURLToPath(new URL('./src/use/ads/GameMonetizeProvider.stub.ts', import.meta.url)),
          // The provider stub closes the static path only; `main.ts` still
          // `await import('@/utils/gameMonetizePlugin')`s it behind an env `if`
          // that the obfuscator can keep from folding. Same stub-swap as
          // yandexPlugin below, so no other archive names the GM SDK.
          '@/utils/gameMonetizePlugin': fileURLToPath(new URL('./src/utils/gameMonetizePlugin.stub.ts', import.meta.url))
        }),
        ...(env.VITE_APP_YANDEX === 'true' ? {} : {
          // YandexProvider statically imports `@/utils/yandexPlugin`, which
          // hardcodes `an.yandex.ru` / `yandex.ru` ad-system URLs — and
          // `resolveAdProvider` statically imports the provider, so those hosts
          // were landing in EVERY other platform's bundle (found in the Poki
          // entry chunk). Same stub-swap fix as the four providers above.
          '@/use/ads/YandexProvider': fileURLToPath(new URL('./src/use/ads/YandexProvider.stub.ts', import.meta.url)),
          // The provider stub above only closed the STATIC path. `main.ts` and
          // `FLogoProgress.vue` still `await import('@/utils/yandexPlugin')`,
          // and a dynamic import is a chunk — so every build was emitting a
          // `yandexPlugin-*.js` carrying the `yandex.ru/ads/system` URL even
          // though nothing called it. Found in the Playgama archive, which is
          // also the YouTube Playables submission, where another portal's ad
          // stack in the bundle is a certification finding. Same stub-swap.
          '@/utils/yandexPlugin': fileURLToPath(new URL('./src/utils/yandexPlugin.stub.ts', import.meta.url))
        }),
        // INVERTED POLARITY versus every other alias here: this one swaps out
        // ON a platform rather than off it. The analytics probe walks other
        // portals' globals (`PokiSDK`, `GamePix`) plus `gtag` / `dataLayer`,
        // and the Playgama archive is also the YouTube Playables submission —
        // where external analytics are banned outright and those names are
        // precisely what a reviewer greps for. A guard inside the probe was
        // measured and did NOT keep the literals out (stringArray hoists before
        // the env fold), so the whole module is aliased away instead.
        // GameMonetize too: it has no event API, its SDK runs Google's ad
        // stack in our own window (a `gtag` found there is GameMonetize's, not
        // a pipe we were given), and its archive must not name other portals'
        // SDK globals either.
        ...(env.VITE_APP_PLAYGAMA === 'true' || env.VITE_APP_GAME_MONETIZE === 'true' ? {
          '@/use/analyticsSink': fileURLToPath(new URL('./src/use/analyticsSink.stub.ts', import.meta.url))
        } : {}),
        ...(env.VITE_APP_POKI === 'true' ? {} : {
          '@/use/ads/PokiProvider': fileURLToPath(new URL('./src/use/ads/PokiProvider.stub.ts', import.meta.url)),
          // pokiPlugin is STATICALLY imported by `useGameplayLifecycle.ts` (which
          // GameScene depends on) and re-exported by the `platforms/poki` barrel,
          // so it lands in every build's module graph. The real module hardcodes
          // the PokiSDK URL, and the env-literal `if` at the call site is NOT
          // enough to keep it out: the obfuscator's stringArray pass hoists
          // string literals into its indirection table BEFORE esbuild folds the
          // env comparison, so the URL survives DCE. Same mechanism, and the same
          // reason, as the gamepixPlugin alias above.
          '@/utils/pokiPlugin': fileURLToPath(new URL('./src/utils/pokiPlugin.stub.ts', import.meta.url))
        }),
        // Dev tooling OUT of builds whose platform policy forbids it — today the
        // Poki and Playgama releases: "no debug code, no dev artifacts" (see
        // `src/platforms/policy.ts`, the same resolver the app reads). The
        // cheats and the typed "cmarc" debug toggle are swapped for no-op
        // stubs, so their code and labels never enter the bundle. (The hidden
        // 30-tap interstitial is not dev tooling and ships everywhere.)
        // `VITE_QA_TOOLS=true` builds a QA twin that keeps them; the release
        // gates refuse that artifact.
        ...Object.fromEntries(Object.entries(devToolAliases(platformPolicy))
          .map(([id, stub]) => [id, fileURLToPath(new URL(`./${stub}`, import.meta.url))])),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@/': fileURLToPath(new URL('./src/', import.meta.url)),
        '#': fileURLToPath(new URL('./src/assets', import.meta.url))
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    build: {
      minify: 'esbuild',
      // Playgama has its OWN output folder, never `dist/` — Vite empties its
      // outDir on every build, and `dist/` holds the other portals' archives
      // (the Poki upload among them). A CLI `--outDir` still wins, for scratch
      // builds. See `src/platforms/playgama/release.ts`.
      ...(isPlaygama ? { outDir: PLAYGAMA_OUT_DIR } : {}),
      rollupOptions: {
        output: {
          // Playgama only (a group named on every build would be created and
          // then filled with whatever shares its signature — see the playbook):
          // pin the vendored Bridge SDK into ONE honestly named chunk that holds
          // nothing else. The purity gate exempts that chunk and only that one —
          // the npm Bridge carries every portal adapter as dead code by design —
          // which is safe only while no game module can end up inside it.
          //
          // three.js goes into two chunks of its own, along the seam its build
          // ships (`three.core.js` + the renderer/addons that import it). This
          // archive is also the YouTube Playables submission, which asks every
          // file to stay under 512 KiB; with three inside it the boot chunk was
          // ~800 KiB. Both are static imports of the engine chunk, so the
          // modulepreload plugin above fetches them alongside it, and three is
          // reached on every run — a named group here is never an empty one.
          ...(isPlaygama
            ? {
                manualChunks: (id: string) => {
                  if (id.includes('@playgama/bridge')) return PLAYGAMA_BRIDGE_CHUNK
                  if (/node_modules[\\/]three[\\/]build[\\/]three\.core\.js$/.test(id)) return 'three-core'
                  if (/node_modules[\\/]three[\\/]/.test(id)) return 'three'
                  return undefined
                }
              }
            : {})
        }
      },
      // Source maps follow the obfuscator EXCEPT on production platform builds.
      //
      // `!shouldObfuscate` alone conflates two different questions. Turning the
      // obfuscator off for a portal is a QA decision — Playgama and YouTube
      // review by hand, and an obfuscated stack trace cannot be mapped back to
      // a source line — but it must not have the side effect of PUBLISHING the
      // source: a portal build is served from a public URL, so shipping maps
      // hands over the original files and adds megabytes to an archive that is
      // measured against a size budget.
      sourcemap: !shouldObfuscate && !isProduction
    }
  }
})
