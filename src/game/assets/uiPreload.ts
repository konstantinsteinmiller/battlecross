import { UI_ART } from './overrides'

/**
 * ─── The painted bar frames, in hand before the first loading screen ─────────
 *
 * A painted bar frame is a CSS background that the browser fetches and decodes the first time a bar that wears it is drawn.
 * The travel veil's bar is the first one on screen, so its frame popped in a moment after the bar did. They are fetched
 * and decoded at boot instead, and the images kept (a held image keeps its decoded bitmap and its cache entry), so the
 * frame is there the first time it is drawn, every time.
 */
const FRAMES = ['bar-frame-boss', 'bar-frame-elite', 'bar-frame-champion']
const held: HTMLImageElement[] = []

export const holdUiArt = (): void => {
  if (typeof Image === 'undefined' || held.length) return
  for (const name of FRAMES) {
    const url = UI_ART.get(name)
    if (!url) continue
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    held.push(img)
    void img.decode?.().catch(() => { /* a missing file stays the drawn frame */ })
  }
}
