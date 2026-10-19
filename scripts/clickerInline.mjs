// ─── The loading mini-game, inlined into index.html ─────────────────────────
//
// The mini-game must play from the first paint of a COLD load, with no second request: its code is
// bundled and minified here from the same source the app imports (`src/utils/loadingClicker/`,
// entry `boot.ts`) and written into index.html as one classic inline <script>, right after the
// splash markup. `<!--bc-clicker-->` marks the spot. Used by vite.config.ts (build AND dev) and by
// the test that proves the page carries it.
//
// Inline scripts need a CSP allowance on builds whose policy has no 'unsafe-inline' for scripts:
// the script's sha256 goes into the policy's script-src (see `buildCsp`).
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

export const CLICKER_MARKER = '<!--bc-clicker-->'

const esbuildOf = () => {
  const req = createRequire(import.meta.url)
  // esbuild is vite's own dependency: resolve it from there (no second copy, no new package).
  return createRequire(req.resolve('vite/package.json'))('esbuild')
}

/** `{ code, tag, hash }`: the minified bundle, the whole <script> element, and the CSP source for it. */
export const clickerInline = (root) => {
  const out = esbuildOf().buildSync({
    entryPoints: [resolve(root, 'src/utils/loadingClicker/boot.ts')],
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2019',
    write: false,
    legalComments: 'none'
  })
  // Nothing in the code may close the element early.
  const code = out.outputFiles[0].text.trim().replace(/<\/script/gi, '<\\/script')
  const hash = `'sha256-${createHash('sha256').update(code).digest('base64')}'`
  return { code, tag: `<script>${code}</script>`, hash }
}

/** The page with the mini-game written in at its marker. */
export const injectClicker = (html, inline) => html.replace(CLICKER_MARKER, inline.tag)
