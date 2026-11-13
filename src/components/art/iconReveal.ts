import { ref } from 'vue'

/**
 * ─── Painted icons arrive together ───────────────────────────────────────────
 *
 * A modal full of painted icons (a shop, the bag, a smith's wares) used to fill in one by one as the files came in. Now an icon
 * that has to be waited for shows a grey box with a white question mark, and every icon of the burst is shown at once, with a small
 * reveal, when the last of them has loaded - as if the reveal were meant. An icon whose file is already in hand when nothing else
 * is loading is simply there (no placeholder, no reveal), so a modal opened a second time is never slower for it.
 *
 * `begin` / `end` count the files in flight; `release` ticks once the count has been zero for a moment, and every icon that was held
 * back lets go on that tick.
 */

const loaded = new Set<string>()
let pending = 0
let timer: ReturnType<typeof setTimeout> | undefined

/** Bumped whenever a burst of loads is over: the held icons show themselves. */
export const release = ref(0)
/** Files in flight right now (an icon that mounts while any are shows its placeholder too, so the burst is one). */
export const inFlight = (): number => pending

/** Is this file already decoded and to hand? */
export const isLoaded = (src: string): boolean => {
  if (loaded.has(src)) return true
  if (typeof Image === 'undefined') return false
  const i = new Image()
  i.src = src
  if (i.complete && i.naturalWidth > 0) { loaded.add(src); return true }
  return false
}

const settle = (): void => {
  clearTimeout(timer)
  timer = setTimeout(() => { if (pending === 0) release.value++ }, 90)
}

/** A file starts loading (or an icon waits on a burst). */
export const begin = (): void => { pending++; clearTimeout(timer) }

/** A file finished (or failed, or was given up on). */
export const end = (src?: string): void => {
  if (src) loaded.add(src)
  pending = Math.max(0, pending - 1)
  if (pending === 0) settle()
}
