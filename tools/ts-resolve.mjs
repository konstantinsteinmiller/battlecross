/**
 * Run the game's own TypeScript modules under plain Node.
 *
 * Node strips types natively, but its ESM resolver wants explicit extensions
 * and knows nothing about Vite's `@/` alias. This hook fills both gaps for the
 * pure modules a tool needs — the art manifest `src/game/art/artSheet.ts` and
 * the data it reads (`src/game/data/items.ts`, `skills.ts`) — which have no
 * Vue, no `import.meta.env` and no canvas in them.
 *
 *   node --import ./tools/ts-resolve.mjs tools/art-prompts.mjs
 *   node --import ./tools/ts-resolve.mjs tools/art-status.mjs
 *
 * Not part of the app build.
 */
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src')

const withTs = (specifier) => (/\.[cm]?[jt]s$/.test(specifier) ? specifier : `${specifier}.ts`)

// ─── `import.meta.env` for tool runs ────────────────────────────────────────
//
// The art manifest's own chain is env-free and must stay so (the pipeline's
// tests import it under plain Node). This shim is the safety net for the day
// a tool needs a module that is not: a `src/` module that reads
// `import.meta.env` at MODULE level would die on its first line under Node,
// and rewriting those reads as optional would change what Vite inlines and
// dead-code-eliminates in every platform build. So tool runs get an EMPTY env
// instead: every flag reads as unset, which is the build default.
const ENV_SHIM = '({ MODE: "tools", DEV: false, PROD: false, SSR: false, BASE_URL: "/" })'

registerHooks({
  load(url, context, next) {
    const out = next(url, context)
    if (!url.startsWith('file:') || !/\.[cm]?ts$/.test(url) || !url.includes('/src/')) return out
    const src = typeof out.source === 'string' ? out.source : Buffer.from(out.source ?? '').toString('utf8')
    if (!src.includes('import.meta.env')) return out
    return { ...out, source: src.replaceAll('import.meta.env', ENV_SHIM) }
  },
  resolve(specifier, context, next) {
    // `@/game/data/items` → <repo>/src/game/data/items.ts
    if (specifier.startsWith('@/')) {
      const file = resolve(SRC, withTs(specifier.slice(2)))
      if (existsSync(file)) return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    try {
      return next(specifier, context)
    } catch (err) {
      // `../data/items` → `../data/items.ts`
      if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
        return next(withTs(specifier), context)
      }
      throw err
    }
  }
})
