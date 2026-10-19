// Turns one element's (or pseudo-element's) computed style into the declarations that make Samsung
// Internet show its authored look. Pure: no DOM access, everything arrives through `Computed`.
//
// What the phone does (measured, Samsung Internet 30), and what each route does about it:
//  - Paint worklet output and <canvas> are not recoloured: backgrounds, gradients and borders are drawn by
//    `public/fdc-paint.js` with the AUTHORED colour (no model). Border: `border-image: paint(bc-border)`.
//  - `color` text is recoloured; a flat fill clipped to the glyphs (`background-clip:text`) is exact, so every
//    text colour darker than LIGHT_KEEP_Y becomes a clip layer (on top of the element's own backgrounds).
//  - <img> is darkened x0.71 and CSS background-image x0.5; `filter: brightness(gain)` restores them
//    (filters run after the dark pass). Images get it from one global rule, background images from a filter on
//    the leaf element, or from a `::before` layer when the element has children.
//  - box-shadow turns grey and text-shadow vanishes; `filter: drop-shadow()` colours are exact.
//  - Without the worklet (old WebView) the fitted model pre-corrects solid colours instead.
import { firstColor, parseColor, parseGradient, parseShadows, splitTop, type Gradient, type GradientStop, type Rgba, type ShadowPart } from './css'
import { LIGHT_KEEP_Y, precorrect, type Rgb, type Role } from './model'

/** Everything the planner reads about one box. Built from getComputedStyle by `readComputed`. */
export interface Computed {
  backgroundColor: string
  backgroundImage: string
  backgroundSize: string
  backgroundPosition: string
  backgroundRepeat: string
  backgroundOrigin: string
  backgroundClip: string
  color: string
  filter: string
  boxShadow: string
  textShadow: string
  position: string
  /** Top, right, bottom, left in px; 0 where the style is none/hidden. */
  borderWidth: number[]
  borderColor: string[]
  /** Top-left, top-right, bottom-right, bottom-left in px. */
  borderRadius: number[]
  hasBorderImage: boolean
  width: number
  height: number
  /** Has a direct, non-blank text node (a pseudo: a string `content`). */
  hasText: boolean
  /** No element children and no text. */
  leaf: boolean
  isImg: boolean
  /** <input>, <textarea>, <select>: text is left to the pre-corrected `color`. */
  isField: boolean
}

/** Measured constants for one Samsung Internet version. */
export const SAMSUNG_30 = {
  id: 'samsung-30',
  /** Lowest luma `color` can show (text role: 252 - Y with Y <= 217). Below it only a clip can show the colour. */
  textMinLuma: 35,
  /** Gain that restores each darkened image source kind (truth = observed * gain). */
  gain: { img: 1.41, bgImage: 2 },
  /** Measured exact on the phone: both default ON. */
  dropShadow: true,
  clipTextPaint: true,
  /** `border-image-source: <webp>` is not used anywhere in the game's CSS (frames are background art), so no
   *  gain is measured for it. A game that adds one must measure it first; until then it is left alone. */
  borderImageGain: null as number | null,
}
export type Model = typeof SAMSUNG_30

export interface PlanEnv {
  model: Model
  /** The paint worklet is registered. */
  paint: boolean
  /** Planning a ::before/::after (declarations go into a stylesheet rule, no ::before layer route). */
  pseudo: boolean
  /** Room left in the filter budget: false drops text-shadow/box-shadow instead of adding a filter. */
  allowShadows: boolean
  /** The ancestor's authored text colour when this box inherited it through a rewritten `color`. */
  inherited: { color: Rgba; route: 'clip' | 'color' } | null
  /** The ancestor's text-shadow signature when this box only inherits it. */
  inheritedShadow: string | null
  /** Which pseudo-element can host the background-image layer ('before' | 'after'), or null when both are taken.
   *  A function: asking costs a computed-style read per pseudo-element, so it is only called when needed. */
  slot: () => 'before' | 'after' | null
}

export interface Plan {
  decls: Map<string, string>
  /** `data-bc-bgi` value when the ::before/::after layer route is used. */
  layerSlot: 'before' | 'after' | null
  /** The authored text colour this box rewrote (children that inherit it read it). */
  textColor: { color: Rgba; route: 'clip' | 'color' } | null
  shadowSig: string | null
  /** Whether a filter was added for shadows (the runtime's budget counts them). */
  usesFilterShadow: boolean
}

const luma = (c: Rgb) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]
const round = (v: number) => Math.round(v)
const pick = (list: string[], i: number): string => (list.length ? list[i % list.length]! : '')
/** Hard-coded: the paint layers per box (`--bc-p0 .. --bc-p5`, registered in public/fdc-paint.js). */
export const PAINT_LAYERS = 6
const MAX_TEXT_SHADOWS = 4
const MAX_BOX_SHADOWS = 3
const MAX_RING_BANDS = 4
const OUTLINE_SCALE = 0.85

const preCache = new Map<string, Rgb>()
function pre(role: Role, c: Rgb): Rgb {
  const key = role + c.map(round).join()
  let v = preCache.get(key)
  if (!v) {
    v = precorrect(role, c.map(round) as Rgb).rgb
    preCache.set(key, v)
  }
  return v
}

/** `r,g,b,a` as the css colour the worklet and the fallbacks read. `k` scales rgb (see the brightness-filter routes). */
export const rgbaCss = (c: Rgb, a = 1, k = 1): string => `rgba(${round(c[0] * k)},${round(c[1] * k)},${round(c[2] * k)},${+a.toFixed(3)})`
const rgbaWorklet = (c: Rgb, a: number, k: number): string => `${round(c[0] * k)} ${round(c[1] * k)} ${round(c[2] * k)} ${+a.toFixed(3)}`

interface Layer {
  img: string
  size: string
  pos: string
  rep: string
  orig: string
  clip: string
}

const SOLID_BOX = { size: 'auto', pos: '0% 0%', rep: 'no-repeat', orig: 'border-box', clip: 'border-box' }

/** Hard shadows with an axis-aligned offset approximate a text outline when chained; diagonals are redundant. */
export function pickTextShadows(parts: ShadowPart[]): ShadowPart[] {
  const hard = parts.filter(p => p.blur === 0)
  const soft = parts.filter(p => p.blur > 0)
  const cardinal = hard.filter(p => p.x === 0 || p.y === 0)
  // Chained drop-shadows add up (each shadows the last one's result), so a four-way chain fills the corners that the
  // original eight-way outline only touches: pull its offsets in a little to keep the same stroke weight.
  const outline = cardinal.length >= 3
  const chosen = (cardinal.length ? cardinal : hard).map(p => (outline ? { ...p, x: p.x * OUTLINE_SCALE, y: p.y * OUTLINE_SCALE } : p))
  return [...chosen.slice(0, MAX_TEXT_SHADOWS), ...soft.slice(0, Math.max(0, MAX_TEXT_SHADOWS - chosen.length))].slice(0, MAX_TEXT_SHADOWS)
}

export interface RingBand {
  from: number
  to: number
  color: Rgba
}

/** A zero-offset, zero-blur box-shadow with spread: the game's "ring" (outline, rim, press edge). */
const isRing = (p: ShadowPart): boolean => p.x === 0 && p.y === 0 && p.blur === 0 && p.spread > 0

/**
 * Concentric colour bands for a list of ring shadows (CSS order: the first one is on top). A ring with a larger spread
 * only shows beyond the smaller ones, so each band takes the colour of the topmost ring that reaches its far edge.
 */
export function ringBands(rings: ShadowPart[]): RingBand[] {
  const cuts = [...new Set(rings.map(r => r.spread))].sort((a, b) => a - b)
  const out: RingBand[] = []
  let prev = 0
  for (const cut of cuts) {
    const top = rings.find(r => r.spread >= cut)!
    const last = out[out.length - 1]
    if (last && last.to === prev && last.color.rgb.join() === top.color.rgb.join() && last.color.a === top.color.a) last.to = cut
    else out.push({ from: prev, to: cut, color: top.color })
    prev = cut
  }
  return out.slice(0, MAX_RING_BANDS)
}

const BLEND_STEPS = 8

/**
 * CSS blends gradient stops in premultiplied space, a canvas gradient does not: `transparent` (black, alpha 0) to a
 * colour would pass through a dark fringe. Between stops of different alpha, insert premultiplied in-betweens.
 */
export function withPremultipliedBlends(stops: GradientStop[]): GradientStop[] {
  const out: GradientStop[] = []
  stops.forEach((s, i) => {
    out.push(s)
    const next = stops[i + 1]
    if (!next || Math.abs(next.a - s.a) < 0.01 || (next.f === s.f && next.p === s.p)) return
    for (let n = 1; n < BLEND_STEPS; n++) {
      const t = n / BLEND_STEPS
      const a = s.a + (next.a - s.a) * t
      const mix = (c: number, d: number) => (a > 0 ? (c * s.a + (d * next.a - c * s.a) * t) / a : c)
      out.push({
        rgb: [mix(s.rgb[0], next.rgb[0]), mix(s.rgb[1], next.rgb[1]), mix(s.rgb[2], next.rgb[2])],
        a,
        f: s.f + (next.f - s.f) * t,
        p: s.p + (next.p - s.p) * t,
      })
    }
  })
  return out
}

/** The `--bc-pN` value for a gradient layer: `<head> | r g b a f p, ...` (see public/fdc-paint.js). */
export function gradientValue(g: Gradient, k: number): string {
  const stops = withPremultipliedBlends(g.stops).map(s => `${rgbaWorklet(s.rgb, s.a, k)} ${+s.f.toFixed(5)} ${+s.p.toFixed(3)}`).join(', ')
  switch (g.kind) {
    case 'linear':
      return `L ${+g.angle.toFixed(3)} ${g.repeating ? 1 : 0} | ${stops}`
    case 'radial':
      return `R ${g.shape === 'circle' ? 'c' : 'e'} ${g.cx} ${g.cy} ${g.size.join(' ')} | ${stops}`
    case 'conic':
      return `C ${+g.from.toFixed(3)} ${g.cx} ${g.cy} | ${stops}`
  }
}

const bandsValue =(bands: RingBand[], k: number): string =>
  bands.map(b => `${+b.from.toFixed(2)} ${+b.to.toFixed(2)} ${rgbaWorklet(b.color.rgb, b.color.a, k)}`).join(' | ')

const dropShadow = (p: ShadowPart): string =>
  `drop-shadow(${+p.x.toFixed(2)}px ${+p.y.toFixed(2)}px ${+(p.blur / 2).toFixed(2)}px ${rgbaCss(p.color.rgb, p.color.a)})`

/** Plan the declarations for one box. */
export function planBox(c: Computed, env: PlanEnv): Plan {
  const decls = new Map<string, string>()
  const { model, paint } = env
  const plan: Plan = { decls, layerSlot: null, textColor: null, shadowSig: null, usesFilterShadow: false }
  const filters: string[] = c.filter && c.filter !== 'none' ? [c.filter] : []

  // ---- images: one global rule restores <img>; only an <img> with its own filter needs a composed one ----
  if (c.isImg) {
    const own = `brightness(${+model.gain.img.toFixed(3)})`
    if (c.filter !== own) filters.push(own)
  }

  // ---- background layers (top to bottom) ----
  const bgc = parseColor(c.backgroundColor)
  const layers = c.backgroundImage === 'none' ? [] : splitTop(c.backgroundImage)
  const sizes = splitTop(c.backgroundSize)
  const poss = splitTop(c.backgroundPosition)
  const reps = splitTop(c.backgroundRepeat)
  const origs = splitTop(c.backgroundOrigin)
  const clips = splitTop(c.backgroundClip)
  const hasOwnBg = (!!bgc && bgc.a > 0) || layers.length > 0
  const borders = c.borderWidth.some(v => v > 0)
  const isUrl = (l: string) => /^url\(|^image-set\(|^-webkit-image-set\(/.test(l)
  const urlIdx = layers.map((l, i) => (isUrl(l) ? i : -1)).filter(i => i >= 0)

  // box-shadow, sorted: zero-offset spread rings are painted by the worklet (outer ones as part of the border image,
  // inset ones as a background layer); everything else becomes drop-shadow() further down.
  const box = parseShadows(c.boxShadow)
  const outerBands = paint ? ringBands(box.parts.filter(p => !p.inset && isRing(p))) : []
  const insetBands = paint ? ringBands(box.parts.filter(p => p.inset && isRing(p))) : []
  // Inset shadows with an offset, a blur or a negative spread: drawn by the same layer, a few stacked edges for a blur.
  const insetParts = paint ? box.parts.filter(p => p.inset && !isRing(p) && (p.x || p.y || p.blur || p.spread)).slice(0, MAX_BOX_SHADOWS) : []
  const outset = outerBands.length ? outerBands[outerBands.length - 1]!.to : 0

  // How url layers get their brightness back.
  const leafRoute = c.leaf && !borders && !outerBands.length
  const slot = urlIdx.length && !leafRoute && !env.pseudo ? env.slot() : null
  const bgRoute: 'none' | 'leaf' | 'layer' = !urlIdx.length ? 'none' : leafRoute ? 'leaf' : slot ? 'layer' : 'none'
  const k = bgRoute === 'leaf' ? 1 / model.gain.bgImage : 1 // colour scale under the leaf's brightness filter
  const kOver = 1 / model.gain.bgImage // overlay layers living inside the brightened ::before

  const own: Layer[] = []
  const over: Layer[] = [] // painted inside the ::before layer, above the url layers
  let nextPaint = 0
  const paintLayer = (value: string): string | null => {
    if (nextPaint >= PAINT_LAYERS) return null
    const name = `--bc-p${nextPaint++}`
    decls.set(name, value)
    return `paint(bc-p${nextPaint - 1})`
  }
  let touched = false
  const addTo = (target: Layer[], l: Layer) => target.push(l)

  // Text colour: decided first, because a clip layer sits on top of the stack.
  const textLayer = planText(c, env, plan, paintLayer, k)
  if (textLayer) {
    addTo(own, textLayer)
    touched = true
  }

  // Inset rings sit above every fill of the box (and above the url layer when that rides on ::before).
  if (insetBands.length || insetParts.length) {
    const target = bgRoute === 'layer' ? over : own
    const scale = target === over ? kOver : k
    decls.set('--bc-ins', bandsValue(insetBands, scale))
    decls.set('--bc-insx', insetParts.map(p => `${+p.x.toFixed(2)} ${+p.y.toFixed(2)} ${+p.blur.toFixed(2)} ${+p.spread.toFixed(2)} ${rgbaWorklet(p.color.rgb, p.color.a, scale)}`).join(' | '))
    addTo(target, { img: 'paint(bc-inset)', ...SOLID_BOX })
    touched = true
  }

  layers.forEach((l, i) => {
    const target = bgRoute === 'layer' && urlIdx.length && i < urlIdx[0]! ? over : own
    const scale = target === over ? kOver : k
    const base = { size: pick(sizes, i), pos: pick(poss, i), rep: pick(reps, i), orig: pick(origs, i), clip: pick(clips, i) }
    if (isUrl(l)) {
      if (bgRoute !== 'layer') addTo(own, { img: l, ...base })
      return
    }
    const g = paint ? parseGradient(l, c.width, c.height) : null
    if (paint && g) {
      const img = paintLayer(gradientValue(g, scale))
      if (img) {
        addTo(target, { img, ...base })
        touched = true
        return
      }
    }
    if (/gradient\(/.test(l)) {
      // Radial/conic/repeating/unparseable: the first stop as a flat fill.
      const col = firstColor(l)
      if (!col) {
        addTo(target, { img: l, ...base })
        return
      }
      const img = paint ? paintLayer(rgbaWorklet(col.rgb, col.a, scale)) : null
      if (img) {
        addTo(target, { img, ...base })
      } else if (!paint && !(bgc && bgc.a > 0) && !decls.has('background-color')) {
        decls.set('background-color', rgbaCss(pre('bg', col.rgb), col.a))
      }
      touched = true
      return
    }
    addTo(target, { img: l, ...base })
  })

  // Border and outer rings: drawn by the worklet over the border box (and `border-image-outset` beyond it);
  // pre-corrected colours without it.
  const cols = c.borderColor.map(parseColor)
  const bordersPaintable = cols.every((col, i) => c.borderWidth[i]! === 0 || col)
  const usesBorderImage = paint && !c.hasBorderImage && (borders || outerBands.length > 0) && bordersPaintable
  if (usesBorderImage) {
    decls.set('--bc-bc', cols.map((col, i) => (c.borderWidth[i]! > 0 && col ? rgbaWorklet(col.rgb, col.a, k) : '0 0 0 0')).join(' | '))
    if (outerBands.length) decls.set('--bc-rings', bandsValue(outerBands, k))
    // Half the image on every side: the four corner pieces tile the whole image 1:1, so a ring that curves away from
    // the box edge (a circle, a pill) is not cut off by the usual rim-thin slice. Percentages follow the box's size.
    decls.set('border-image-source', 'paint(bc-border)')
    decls.set('border-image-slice', '50%')
    decls.set('border-image-width', '50%')
    decls.set('border-image-outset', `${outset}px`)
    decls.set('border-image-repeat', 'stretch')
  } else if (!c.hasBorderImage && borders) {
    const names = ['top', 'right', 'bottom', 'left']
    cols.forEach((col, i) => {
      if (c.borderWidth[i]! > 0 && col && col.a > 0) decls.set(`border-${names[i]}-color`, rgbaCss(pre('border', col.rgb), col.a))
    })
  }
  if (usesBorderImage || insetBands.length || insetParts.length) {
    decls.set('--bc-bw', c.borderWidth.join(' '))
    decls.set('--bc-rad', c.borderRadius.map(v => +v.toFixed(2)).join(' '))
  }

  // Solid colour layer (bottom).
  if (bgc && bgc.a > 0) {
    const img = paint ? paintLayer(rgbaWorklet(bgc.rgb, bgc.a, k)) : null
    if (img) {
      addTo(own, { img, ...SOLID_BOX })
      decls.set('background-color', 'transparent')
      touched = true
    } else {
      decls.set('background-color', rgbaCss(pre('bg', bgc.rgb), bgc.a))
    }
  }

  // url layers: restored by brightness.
  if (bgRoute === 'leaf') {
    filters.push(`brightness(${+model.gain.bgImage.toFixed(3)})`)
    touched = true
  } else if (bgRoute === 'layer') {
    const parts = [...over, ...urlIdx.map(i => ({ img: layers[i]!, size: pick(sizes, i), pos: pick(poss, i), rep: pick(reps, i), orig: pick(origs, i), clip: 'border-box' }))]
    decls.set('--bc-bgi', parts.map(p => p.img).join(', '))
    decls.set('--bc-bgs', parts.map(p => p.size).join(', '))
    decls.set('--bc-bgp', parts.map(p => p.pos).join(', '))
    decls.set('--bc-bgr', parts.map(p => p.rep).join(', '))
    decls.set('--bc-gbg', String(+model.gain.bgImage.toFixed(3)))
    // The layer sits where the authored image's origin box is: the border box (inset by minus the border) or the
    // padding box (inset 0, corners shrunk by the border), so tile positions match the authored ones.
    const fromBorderBox = pick(origs, urlIdx[0]!) === 'border-box'
    decls.set('--bc-in', fromBorderBox ? c.borderWidth.map(v => `${-v}px`).join(' ') : '0px')
    decls.set(
      '--bc-prad',
      c.borderRadius
        .map((r, i) => {
          const grow = fromBorderBox ? 0 : Math.max(c.borderWidth[i % 4]!, c.borderWidth[(i + 3) % 4]!)
          return `${+Math.max(0, r - grow).toFixed(2)}px`
        })
        .join(' ')
    )
    if (c.position === 'static') decls.set('position', 'relative')
    plan.layerSlot = slot
    touched = true
  }

  if (touched) {
    decls.set('background-image', own.length ? own.map(l => l.img).join(', ') : 'none')
    if (own.length) {
      decls.set('background-size', own.map(l => l.size).join(', '))
      decls.set('background-position', own.map(l => l.pos).join(', '))
      decls.set('background-repeat', own.map(l => l.rep).join(', '))
      decls.set('background-origin', own.map(l => l.orig).join(', '))
      decls.set('background-clip', own.map(l => l.clip).join(', '))
      decls.set('-webkit-background-clip', own.map(l => l.clip).join(', '))
    }
  }

  // ---- shadows -> drop-shadow ----
  const shadowFilters: string[] = []
  if (!paint) {
    // No worklet: keep box-shadow, but with colours pre-corrected for the shadow role (shadows are not exact).
    if (box.parts.length) {
      decls.set('box-shadow', box.parts.map(p => `${rgbaCss(pre('shadow', p.color.rgb), p.color.a)} ${p.x}px ${p.y}px ${p.blur}px ${p.spread}px${p.inset ? ' inset' : ''}`).join(', '))
    }
  } else if (model.dropShadow) {
    if (box.parts.length || box.lossy) decls.set('box-shadow', 'none') // grey on the phone: gone either way
    if (env.allowShadows) {
      const lit = box.parts.filter(p => !p.inset && !isRing(p)).slice(0, MAX_BOX_SHADOWS)
      shadowFilters.push(...lit.map(dropShadow))
      // text-shadow: a filter shadows the whole box, so only a box without its own paint can use it.
      const sig = c.textShadow
      if (c.hasText && sig !== 'none' && sig !== env.inheritedShadow) {
        const ts = parseShadows(sig)
        if (ts.parts.length && !hasOwnBg && !borders && !c.isImg) {
          shadowFilters.push(...pickTextShadows(ts.parts).map(dropShadow))
          plan.shadowSig = sig
          decls.set('text-shadow', 'none')
        }
      }
    }
  }
  if (shadowFilters.length) {
    filters.push(...shadowFilters)
    plan.usesFilterShadow = true
  }
  if (filters.length && (filters.length > 1 || filters[0] !== c.filter)) decls.set('filter', filters.join(' '))
  return plan
}

/** The text-colour route. Returns the clip layer to put on top of the background stack, or null. */
function planText(c: Computed, env: PlanEnv, plan: Plan, paintLayer: (v: string) => string | null, k: number): Layer | null {
  if (!c.hasText || c.isImg) return null
  const { model, paint } = env
  const own = parseColor(c.color)
  const col = own && own.a === 0 && env.inherited ? env.inherited.color : own
  if (!col || col.a <= 0 || luma(col.rgb) >= LIGHT_KEEP_Y) return null
  // The ancestor already rewrote `color` and this box just inherits the result.
  if (env.inherited && own && env.inherited.route === 'color' && own.a > 0) return null
  const canClip = !c.isField && !c.backgroundClip.includes('text') && (paint ? model.clipTextPaint : luma(col.rgb) < model.textMinLuma)
  if (!canClip) {
    plan.decls.set('color', rgbaCss(pre('text', col.rgb), col.a))
    plan.textColor = { color: col, route: 'color' }
    return null
  }
  let img: string | null
  if (paint) {
    img = paintLayer(rgbaWorklet(col.rgb, col.a, k))
  } else {
    const g = rgbaCss(pre('gradTop', col.rgb), col.a)
    img = `linear-gradient(${g}, ${g})`
  }
  if (!img) {
    plan.decls.set('color', rgbaCss(pre('text', col.rgb), col.a))
    plan.textColor = { color: col, route: 'color' }
    return null
  }
  plan.decls.set('color', 'transparent')
  plan.textColor = { color: col, route: 'clip' }
  return { img, size: 'auto', pos: '0% 0%', rep: 'no-repeat', orig: 'border-box', clip: 'text' }
}
