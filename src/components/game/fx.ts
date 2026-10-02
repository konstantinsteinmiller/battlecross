import { onUnmounted, ref, watch, type Ref } from 'vue'

/**
 * ─── Juice for the big screens ───────────────────────────────────────────────
 *
 * The small flourishes of a deal struck, a piece put on, a skill learned:
 * coins that fly from one purse to the other, a burst of sparks on a socket,
 * a thunk, a number that rolls to its new value. All of it is the Web
 * Animations API on `transform` and `opacity` (the compositor's job, no
 * layout), a handful of short-lived nodes at most, and none of it runs under
 * `prefers-reduced-motion` — the state changes at once instead.
 *
 * The game loop stands still behind a screen; these run on the browser's own
 * clock, so they play while it is paused.
 */

export const prefersReducedMotion = (): boolean => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

const canAnimate = (el: Element | null | undefined): el is HTMLElement =>
  !!el && typeof (el as HTMLElement).animate === 'function' && !prefersReducedMotion()

/** "No": a quick sideways shake (a drop refused, a purse too light). */
export const shake = (el: Element | null | undefined): void => {
  if (!canAnimate(el)) return
  el.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }],
    { duration: 320, easing: 'ease-out' }
  )
}

/** A thunk: the thing squashes as it lands and springs back. */
export const thunk = (el: Element | null | undefined): void => {
  if (!canAnimate(el)) return
  el.animate(
    [{ transform: 'scale(1.28, 1.28)' }, { transform: 'scale(0.9, 1.08)', offset: 0.34 }, { transform: 'scale(1.06, 0.95)', offset: 0.6 }, { transform: 'scale(1, 1)' }],
    { duration: 420, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' }
  )
}

/** A nod: a small hop (the doll, when something is put on him). */
export const hop = (el: Element | null | undefined): void => {
  if (!canAnimate(el)) return
  el.animate(
    [{ transform: 'translateY(0) scale(1, 1)' }, { transform: 'translateY(4%) scale(1.06, 0.92)', offset: 0.18 }, { transform: 'translateY(-9%) scale(0.96, 1.06)', offset: 0.5 }, { transform: 'translateY(0) scale(1.03, 0.97)', offset: 0.8 }, { transform: 'translateY(0) scale(1, 1)' }],
    { duration: 520, easing: 'ease-out' }
  )
}

/** The layer short-lived effect nodes are put in: over every screen. */
const layer = (): HTMLElement => document.body

const centre = (el: Element): { x: number; y: number; r: number } => {
  const b = el.getBoundingClientRect()
  return { x: b.left + b.width / 2, y: b.top + b.height / 2, r: Math.min(b.width, b.height) / 2 }
}

const node = (css: string): HTMLElement => {
  const el = document.createElement('span')
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText = `position:fixed;left:0;top:0;z-index:var(--bc-z-veil);pointer-events:none;will-change:transform,opacity;${css}`
  return el
}

/**
 * A burst of sparks round an element (a piece equipped, a skill learned).
 * `tint` is any CSS colour (a tier's, a class's); `big` is the louder one.
 */
export const burst = (el: Element | null | undefined, tint = 'var(--bc-gold-hi)', big = false): void => {
  if (!canAnimate(el)) return
  const { x, y, r } = centre(el)
  const n = big ? 14 : 9
  const reach = r * (big ? 2.4 : 1.7) + 14
  // A ring that opens out…
  const ring = node(`width:${r * 2}px;height:${r * 2}px;margin:${-r}px 0 0 ${-r}px;border-radius:50%;border:4px solid ${tint};transform:translate(${x}px,${y}px)`)
  layer().appendChild(ring)
  ring.animate(
    [{ transform: `translate(${x}px,${y}px) scale(0.6)`, opacity: 0.95 }, { transform: `translate(${x}px,${y}px) scale(${big ? 2.3 : 1.7})`, opacity: 0 }],
    { duration: big ? 560 : 420, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', fill: 'both' }
  ).onfinish = () => ring.remove()
  // …and the sparks: four-pointed, every other one white.
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (i % 2) * 0.3
    const d = reach * (0.72 + ((i * 37) % 10) / 34)
    const size = (big ? 15 : 11) * (i % 3 === 0 ? 1.35 : 1)
    const s = node(`width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;background:${i % 2 ? 'var(--bc-white)' : tint};clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%)`)
    layer().appendChild(s)
    s.animate(
      [
        { transform: `translate(${x}px,${y}px) scale(0.3) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${x + Math.cos(a) * d}px,${y + Math.sin(a) * d}px) scale(1.15) rotate(90deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${x + Math.cos(a) * d * 1.12}px,${y + Math.sin(a) * d * 1.12 + 10}px) scale(0.2) rotate(160deg)`, opacity: 0 }
      ],
      { duration: (big ? 720 : 520) + (i % 4) * 40, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', fill: 'both' }
    ).onfinish = () => s.remove()
  }
}

/**
 * Coins fly in an arc from one element to another (purse to merchant on a
 * purchase, the other way on a sale). Resolves as the first coin lands, which
 * is when the receiving purse should react.
 */
export const flyCoins = (from: Element | null | undefined, to: Element | null | undefined, count = 6): Promise<void> => {
  if (!from || !to || !canAnimate(from)) return Promise.resolve()
  const a = centre(from)
  const b = centre(to)
  const n = Math.max(3, Math.min(9, count))
  const size = 20
  const lift = Math.max(60, Math.min(190, Math.hypot(b.x - a.x, b.y - a.y) * 0.42))
  // The arc bows toward the middle of the screen: two purses on the top bar
  // throw their coins down across the table, never up off the screen.
  const bow = (a.y + b.y) / 2 < window.innerHeight / 2 ? -1 : 1
  return new Promise((resolve) => {
    for (let i = 0; i < n; i++) {
      const c = node(`width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;border:var(--bc-ol-thin) solid var(--bc-ink);background:radial-gradient(circle at 50% 46%, var(--bc-gold-hi) 0, var(--bc-gold-hi) 42%, var(--bc-gold-lo) 42%);box-shadow:0 2px 0 var(--bc-ink)`)
      layer().appendChild(c)
      // Sampled along a parabola: each coin a little off the last one's line.
      const off = ((i * 53) % 9 - 4) * 5
      const frames: Keyframe[] = []
      const STEPS = 9
      for (let k = 0; k <= STEPS; k++) {
        const t = k / STEPS
        const px = a.x + (b.x - a.x) * t + off * Math.sin(t * Math.PI)
        const py = a.y + (b.y - a.y) * t - bow * lift * 4 * t * (1 - t)
        frames.push({ transform: `translate(${px}px,${py}px) scale(${t < 0.12 ? 0.5 + t * 4 : t > 0.86 ? 1 - (t - 0.86) * 4 : 1}) rotateY(${Math.round(t * 540)}deg)`, opacity: t > 0.94 ? 0.2 : 1 })
      }
      const anim = c.animate(frames, { duration: 560, delay: i * 55, easing: 'linear', fill: 'both' })
      anim.onfinish = () => {
        c.remove()
        if (i === 0) resolve()
      }
    }
  })
}

/**
 * A whole number that ROLLS to its new value (a purse after a deal, a stat
 * after a point). `dir` says which way it is moving while it rolls, so the
 * caller can colour it.
 */
export const useRolling = (source: () => number, ms = 620): { shown: Ref<number>; dir: Ref<-1 | 0 | 1> } => {
  const shown = ref(Math.round(source()))
  const dir = ref<-1 | 0 | 1>(0)
  let raf = 0
  const stop = (): void => { if (raf) cancelAnimationFrame(raf); raf = 0 }
  watch(source, (to) => {
    stop()
    const from = shown.value
    const target = Math.round(to)
    if (from === target) return
    if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function') { shown.value = target; return }
    dir.value = target > from ? 1 : -1
    const t0 = performance.now()
    const step = (now: number): void => {
      const k = Math.min(1, (now - t0) / ms)
      // Fast at first, settling into the last digits.
      const e = 1 - Math.pow(1 - k, 3)
      shown.value = Math.round(from + (target - from) * e)
      if (k < 1) raf = requestAnimationFrame(step)
      else { raf = 0; dir.value = 0 }
    }
    raf = requestAnimationFrame(step)
  })
  onUnmounted(stop)
  return { shown, dir }
}
