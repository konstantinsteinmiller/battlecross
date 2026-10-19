import { ref, watch, type Ref } from 'vue'

/**
 * ─── A panel waits a moment for its pictures (roadmap #142, D149) ────────────
 *
 * A window or a full screen opened before its painted images are in (the
 * close / plus / shield glyphs, the book's portrait, a skill tree's unlearned
 * icons) used to show them fading in where they landed, 1.5–2.5 s late on a
 * phone link. Now a panel is laid out but kept invisible until every image it
 * holds (`<img>` and CSS backgrounds) has decoded, for at most
 * `ART_HOLD_MS`, and then opens regardless: a late image is the exception,
 * never a panel that does not open.
 *
 * The hold is `visibility: hidden`, so the panel is laid out (a 3D doll or a
 * measured header sizes itself as before); a hold that lasted is followed by
 * a short fade, as the panel's own entrance played while it was hidden.
 * Where images cannot be decoded on demand (no `HTMLImageElement.decode`: a
 * test's DOM) nothing is held.
 */

/** The longest a panel waits for its images (ms). */
export const ART_HOLD_MS = 300

/** A hold shorter than this needs no fade of its own (ms): the entrance still plays. */
const FADE_AFTER_MS = 60

const CAN_DECODE = typeof HTMLImageElement !== 'undefined' && typeof HTMLImageElement.prototype.decode === 'function'

/** Background pictures already decoded once (an `<img>` knows it by itself). */
const decodedBg = new Set<string>()

const URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/g

/** What the panel under `root` is still waiting for: one promise per image. */
export const pendingArt = (root: Element): Array<Promise<unknown>> => {
  const out: Array<Promise<unknown>> = []
  if (!CAN_DECODE) return out
  for (const img of root.querySelectorAll('img')) {
    if (!img.getAttribute('src')) continue
    if (img.complete && img.naturalWidth > 0) continue
    out.push(img.decode().catch(() => {}))
  }
  for (const el of [root, ...root.querySelectorAll('*')]) {
    const bg = getComputedStyle(el).backgroundImage
    if (!bg || bg === 'none' || !bg.includes('url(')) continue
    for (const m of bg.matchAll(URL_RE)) {
      const url = m[1]!
      if (url.startsWith('data:') || decodedBg.has(url)) continue
      decodedBg.add(url)
      const img = new Image()
      img.src = url
      out.push(img.decode().catch(() => { decodedBg.delete(url) }))
    }
  }
  return out
}

/** Resolves when every image under `root` has decoded, or after `ms`. */
export const waitForArt = (root: Element, ms = ART_HOLD_MS): Promise<void> => {
  const pending = pendingArt(root)
  if (!pending.length) return Promise.resolve()
  return Promise.race([
    Promise.all(pending).then(() => {}),
    new Promise<void>(resolve => setTimeout(resolve, ms))
  ])
}

const reducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Hold the panel whose root element is `root` while its images decode. Bind
 * the result as `:style="artHold(held)"`; it is true from the moment the
 * element appears (every time it appears: an `FModal` opens and closes) until
 * its images are in or `ms` has passed.
 */
export const useArtGate = (root: Readonly<Ref<HTMLElement | null>>, ms = ART_HOLD_MS): Ref<boolean> => {
  const held = ref(CAN_DECODE)
  let token = 0
  watch(root, (el) => {
    const mine = ++token
    if (!el || !CAN_DECODE) { held.value = CAN_DECODE; return }
    held.value = true
    const t0 = performance.now()
    void waitForArt(el, ms).then(() => {
      if (mine !== token) return
      held.value = false
      if (performance.now() - t0 > FADE_AFTER_MS && !reducedMotion() && typeof el.animate === 'function') {
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' })
      }
    })
  }, { flush: 'post', immediate: true })
  return held
}

/** The style of a held panel (laid out, not shown, not hit). */
export const artHold = (held: boolean): Record<string, string> | undefined =>
  held ? { visibility: 'hidden', pointerEvents: 'none' } : undefined
