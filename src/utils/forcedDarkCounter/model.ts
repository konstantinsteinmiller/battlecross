// Samsung Internet 30 (Chrome 143) forced website dark mode: fitted model + inverse.
// Pure, no deps. Fitted from phone screenshots of 19 px swatches (noise about +-3). It is the FALLBACK only:
// big surfaces are darkened differently from the swatches, so with the paint worklet the authored colour is
// drawn as is and this model is not consulted.
//
// Core finding: every role keeps the colour's CHROMA (rgb - luma) and only replaces its LUMA:
//   out = clamp(rgb + (Y' - Y)),  Y = 0.299R + 0.587G + 0.114B   (Rec.601)
// Y' depends on the role and, for bg/text, on a threshold on Y (light colours stay light).

export type Rgb = [number, number, number]
export type Role = 'bg' | 'text' | 'border' | 'shadow' | 'gradTop' | 'gradBottom'

/** Luma above this is left alone (bg: compressed toward white, text: untouched). Measured: 215.0 inverted, 218.5 kept. */
export const LIGHT_KEEP_Y = 217

const luma = (c: Rgb) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]
const clamp = (x: number) => Math.max(0, Math.min(255, x))
const clampRgb = (c: number[]): Rgb => [clamp(c[0]!), clamp(c[1]!), clamp(c[2]!)]

/** Share of chroma (rgb - luma) that survives. Text is a rough fit (thin glyphs, +-9 mean / 50 max); the rest keep all of it. */
const CHROMA_KEEP: Record<Role, number> = { bg: 1, text: 0.7, border: 1, shadow: 1, gradTop: 1, gradBottom: 1 }

/** Observed luma for an input luma. */
export function lumaMap(role: Role, y: number): number {
  switch (role) {
    case 'bg': return y <= LIGHT_KEEP_Y ? 255 - 0.71 * y : 74 + 0.71 * y
    case 'text': return y <= LIGHT_KEEP_Y ? 252 - y : y
    case 'border': return 69.3 + 0.058 * y
    case 'shadow': return 71.5 + 0.057 * y
    case 'gradTop': return 5.1 + 0.102 * y
    case 'gradBottom': return 5.3 + 0.1 * y
  }
}

/** What the browser shows for a CSS colour used in `role`. Gradient bottom takes the already-darkened (-40) colour. */
export function observe(role: Role, rgb: Rgb): Rgb {
  const y = luma(rgb)
  const yp = lumaMap(role, y)
  const s = CHROMA_KEEP[role]
  return clampRgb([yp + s * (rgb[0] - y), yp + s * (rgb[1] - y), yp + s * (rgb[2] - y)])
}

/** Observable luma window per role: what luma a target can have at all. */
export function reachableLuma(role: Role): [number, number] {
  let lo = 255, hi = 0
  for (let y = 0; y <= 255; y += 1) { const v = lumaMap(role, y); lo = Math.min(lo, v); hi = Math.max(hi, v) }
  return [lo, hi]
}

export interface Precorrection { rgb: Rgb; observed: Rgb; error: number; exact: boolean }

/**
 * CSS colour to write so the browser shows `target`. Searches the input luma on a fine grid,
 * keeping the target's chroma, and returns the best candidate (error = max channel miss after observe()).
 * exact = error <= 4 (screenshot noise). For bg/text the "kept" branch (Y > 217) wins ties, so light targets stay as authored.
 * Roles that squash luma (border, shadow, gradients) can only show targets whose luma is inside reachableLuma().
 */
export function precorrect(role: Role, target: Rgb): Precorrection {
  const yt = luma(target)
  let best: Precorrection | null = null
  for (let yv = 255; yv >= 0; yv -= 0.25) {
    const k = 1 / CHROMA_KEEP[role]
    const cand = clampRgb([yv + k * (target[0] - yt), yv + k * (target[1] - yt), yv + k * (target[2] - yt)]).map(Math.round) as Rgb
    const obs = observe(role, cand)
    const err = Math.max(Math.abs(obs[0] - target[0]), Math.abs(obs[1] - target[1]), Math.abs(obs[2] - target[2]))
    if (!best || err < best.error - 0.05) best = { rgb: cand, observed: obs.map(Math.round) as Rgb, error: err, exact: err <= 4 }
  }
  return best!
}

