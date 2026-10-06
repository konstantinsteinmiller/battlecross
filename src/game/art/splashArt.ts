/**
 * ─── The painted logo on the boot splash ─────────────────────────────────────
 *
 * The static splash in `index.html` paints before any script, so it cannot
 * ask at run time whether the painted badge and mascot exist. The build can:
 * `vite.config.ts` lists `public/images/logo/` and, when the files are there,
 * this writes them into the splash markup — two `<img>` in the lockup's box
 * (positioned over it, so nothing moves when they decode) and a preload for
 * each, high in `<head>`, so they arrive with the HTML rather than after the
 * stylesheet. `FLogoProgress.vue` draws the same two from `LOGO_ART`.
 *
 * Without the files nothing changes: the code-drawn lockup is the splash.
 * The painted WORDMARK (roadmap #76: the title, the shield, the sword and the
 * staff in one painting) replaces the whole drawn lockup when it is there;
 * the badge alone is not shown then, the mascot still is.
 *
 * Pure (strings in, string out), so the splash test can drive it.
 */

/** The painted pieces, by file stem in `public/images/logo/`. */
export const SPLASH_ART = ['emblem', 'mascot', 'wordmark'] as const
export type SplashArt = (typeof SPLASH_ART)[number]

/** Their intrinsic size: the badge and the mascot are written square at 512 by the art pipeline, the wordmark at 1024. */
export const SPLASH_ART_PX = 512
export const WORDMARK_PX = 1024

/** The files of `public/images/logo/` that are splash art, by stem. */
export const splashArtFiles = (files: readonly string[]): Partial<Record<SplashArt, string>> => {
  const out: Partial<Record<SplashArt, string>> = {}
  for (const stem of SPLASH_ART) {
    // A compressor's `<name>-original.<ext>` backup is not the art.
    const f = files.find(x => x.replace(/\.(webp|png|jpg)$/i, '') === stem)
    if (f) out[stem] = f
  }
  return out
}

/**
 * The splash with the painted art written in. `base` is the URL prefix public
 * files are served under ('/' in dev). The lockup's box gets `has-art` (which
 * hides the code-drawn badge) only when the painted badge is there.
 */
export const injectSplashArt = (html: string, files: readonly string[], base = '/'): string => {
  const art = splashArtFiles(files)
  if (!art.emblem && !art.mascot && !art.wordmark) return html
  // The painted wordmark is the whole logo: the badge alone is not needed.
  if (art.wordmark) delete art.emblem
  const url = (f: string): string => `${base}images/logo/${f}`
  const preloads = (Object.values(art) as string[])
    .map(f => `<link rel="preload" as="image" href="${url(f)}" fetchpriority="high">`)
    .join('\n  ')
  const imgs = [
    art.wordmark ? `<img class="s-wordmark" src="${url(art.wordmark)}" width="${WORDMARK_PX}" height="${WORDMARK_PX}" alt="" decoding="async" draggable="false">` : '',
    art.emblem ? `<img class="s-emblem" src="${url(art.emblem)}" width="${SPLASH_ART_PX}" height="${SPLASH_ART_PX}" alt="" decoding="async" draggable="false">` : '',
    art.mascot ? `<img class="s-mascot" src="${url(art.mascot)}" width="${SPLASH_ART_PX}" height="${SPLASH_ART_PX}" alt="" decoding="async" draggable="false">` : ''
  ].join('')
  const box = '<div class="s-logo" role="img" aria-label="Battlecross">'
  if (!html.includes(box)) throw new Error('splashArt: the splash lockup box was not found in index.html')
  return html
    // Right after the charset, before the scripts and the big inline style.
    .replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n  ${preloads}`)
    .replace(box, `<div class="s-logo${art.wordmark ? ' has-wordmark' : art.emblem ? ' has-art' : ''}" role="img" aria-label="Battlecross">${imgs}`)
}
