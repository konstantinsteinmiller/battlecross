import { isRunning, mountClicker } from './index'

/**
 * The mini-game's inline entry: bundled into index.html by `scripts/clickerInline.mjs` and run
 * the moment the parser reaches it, right after the splash's canvas. It draws the first frame at
 * once and exposes a minimal handle on `window`, through which the loader's own canvas takes the
 * running game over (see `mountClicker`) and tears it down.
 */
declare global {
  interface Window { __bcClicker?: { mount: typeof mountClicker, running: () => boolean } }
}

window.__bcClicker = { mount: mountClicker, running: isRunning }
const el = document.getElementById('s-play')
if (el instanceof HTMLCanvasElement && !isRunning()) {
  const nav = performance.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined
  mountClicker(el, { firstLoad: nav?.type !== 'reload' })
  el.classList.add('on')
}
