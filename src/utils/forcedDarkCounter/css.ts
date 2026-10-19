// Parsing of computed CSS values the counter rewrites: colours, gradients, shadow lists.
// Pure string functions, no DOM.
import type { Rgb } from './model'

export interface Rgba {
  rgb: Rgb
  a: number
}

/** A colour-stop position: `f` of the gradient line plus `p` px (so `calc(100% - 7.2px)` survives a resize). */
export interface Pos {
  f: number
  p: number
}

export interface GradientStop extends Pos {
  rgb: Rgb
  a: number
}

export type Gradient =
  | { kind: 'linear'; angle: number; repeating: boolean; stops: GradientStop[] }
  | { kind: 'radial'; shape: 'circle' | 'ellipse'; cx: string; cy: string; size: string[]; stops: GradientStop[] }
  | { kind: 'conic'; from: number; cx: string; cy: string; stops: GradientStop[] }

const alphaOf = (v: string | undefined): number => (v === undefined ? 1 : v.endsWith('%') ? parseFloat(v) / 100 : +v)

/** `rgb()`/`rgba()`, `color(srgb …)` and `#hex` (what getComputedStyle returns, plus authored hex). */
export function parseColor(input: string): Rgba | null {
  const s = input.trim()
  let m = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(s)
  if (m) return { rgb: [+m[1]!, +m[2]!, +m[3]!], a: alphaOf(m[4]) }
  m = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(s)
  if (m) return { rgb: [+m[1]! * 255, +m[2]! * 255, +m[3]! * 255], a: alphaOf(m[4]) }
  m = /^#([0-9a-f]{3,8})$/i.exec(s)
  if (m) {
    let h = m[1]!
    if (h.length <= 4) h = h.split('').map(c => c + c).join('')
    if (h.length === 6 || h.length === 8) {
      return {
        rgb: [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as Rgb,
        a: h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1
      }
    }
  }
  return null
}

/** Split on commas outside parentheses. */
export function splitTop(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

/** Gradient line length for an angle (CSS spec). */
export const gradientLength = (angleDeg: number, w: number, h: number): number => {
  const a = (angleDeg * Math.PI) / 180
  return Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a))
}

const COLOR_TOKEN = /(rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-f]{3,8})/i

/** The first colour inside any gradient string (the fallback for gradients the worklet cannot draw). */
export function firstColor(gradient: string): Rgba | null {
  const m = COLOR_TOKEN.exec(gradient)
  return m ? parseColor(m[1]!) : null
}

/** Hard stops (the game's stepped parchment rims) need every stop; this is only a runaway guard. */
const MAX_STOPS = 32

const POSITION_TOKEN = /calc\((?:[^()]|\([^)]*\))*\)|[-+\d.]+(?:%|px|deg|turn|rad|grad)?/g

/** One length-percentage-angle term as a {fraction, px} pair. Angles count as a fraction of a full turn. */
function term(t: string): Pos | null {
  const m = /^([-+]?[\d.]+)(%|px|deg|turn|rad|grad)?$/.exec(t.trim())
  if (!m) return null
  const v = parseFloat(m[1]!)
  switch (m[2]) {
    case '%': return { f: v / 100, p: 0 }
    case 'px': return { f: 0, p: v }
    case 'deg': return { f: v / 360, p: 0 }
    case 'turn': return { f: v, p: 0 }
    case 'rad': return { f: v / (2 * Math.PI), p: 0 }
    case 'grad': return { f: v / 400, p: 0 }
    default: return v === 0 ? { f: 0, p: 0 } : null
  }
}

/** A colour-stop position: `40%`, `12px`, `90deg` or the `calc(100% - 7.2px)` that getComputedStyle prints for mixed ones. */
export function stopPosition(token: string): Pos | null {
  const m = /^calc\(\s*([-+\d.]+(?:%|px|deg|turn)?)\s*(?:([+-])\s*([-+\d.]+(?:%|px|deg|turn)?))?\s*\)$/.exec(token)
  if (!m) return term(token)
  const a = term(m[1]!)
  if (!a || !m[2]) return a
  const b = term(m[3]!)
  if (!b) return null
  const s = m[2] === '+' ? 1 : -1
  return { f: a.f + s * b.f, p: a.p + s * b.p }
}

/**
 * Colour stops of a gradient (everything after its configuration argument). Missing positions are interpolated,
 * non-monotonic ones pinned to the previous stop. `len` is only used to order px against % positions.
 */
function parseStops(args: string[], len: number): GradientStop[] | null {
  const raw: { rgb: Rgb; a: number; pos: Pos | null }[] = []
  for (const arg of args) {
    const cm = /^(rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-f]{3,8})\s*(.*)$/i.exec(arg)
    if (!cm) return null
    const col = parseColor(cm[1]!)
    if (!col) return null
    const rest = cm[2]!.trim()
    const tokens = rest.match(POSITION_TOKEN) ?? []
    // Anything left after the positions (a colour hint, a keyword) is beyond this parser.
    if (tokens.length > 2 || rest.replace(POSITION_TOKEN, '').trim() !== '') return null
    if (!tokens.length) {
      raw.push({ ...col, pos: null })
    } else {
      for (const t of tokens) {
        const pos = stopPosition(t)
        if (!pos) return null
        raw.push({ ...col, pos })
      }
    }
  }
  if (raw.length < 2) return null
  if (raw[0]!.pos === null) raw[0]!.pos = { f: 0, p: 0 }
  if (raw[raw.length - 1]!.pos === null) raw[raw.length - 1]!.pos = { f: 1, p: 0 }
  const nominal = (p: Pos) => p.f + p.p / (len || 1)
  for (let i = 1; i < raw.length; i++) {
    const cur = raw[i]!.pos
    if (cur && raw[i - 1]!.pos && nominal(cur) < nominal(raw[i - 1]!.pos!)) raw[i]!.pos = { ...raw[i - 1]!.pos! }
  }
  for (let i = 0; i < raw.length; i++) {
    if (raw[i]!.pos !== null) continue
    let j = i
    while (raw[j]!.pos === null) j++
    const a = raw[i - 1]!.pos!
    const b = raw[j]!.pos!
    for (let k = i; k < j; k++) {
      const t = (k - i + 1) / (j - i + 1)
      raw[k]!.pos = { f: a.f + (b.f - a.f) * t, p: a.p + (b.p - a.p) * t }
    }
    i = j
  }
  let stops: GradientStop[] = raw.map(s => ({ rgb: s.rgb, a: s.a, ...s.pos! }))
  if (stops.length > MAX_STOPS) {
    // Keep the ends, subsample the middle.
    const mid = MAX_STOPS - 2
    const keep = [0, ...Array.from({ length: mid }, (_, i) => Math.round(((i + 1) * (stops.length - 1)) / (mid + 1))), stops.length - 1]
    stops = keep.map(i => stops[i]!)
  }
  return stops
}

/** `left|center|right|top|bottom|N%|Npx` as the percentage/px string the worklet reads. */
function placement(tok: string | undefined, axis: 'x' | 'y'): string | null {
  const t = tok ?? 'center'
  if (t === 'center') return '50%'
  if (t === (axis === 'x' ? 'left' : 'top')) return '0%'
  if (t === (axis === 'x' ? 'right' : 'bottom')) return '100%'
  return /^-?[\d.]+(%|px)$/.test(t) ? t : null
}

/** `at <x> <y>` tail of a radial/conic configuration (absent: the centre). */
function parseAt(words: string[]): { cx: string; cy: string } | null {
  const at = words.indexOf('at')
  if (at < 0) return { cx: '50%', cy: '50%' }
  const pos = words.slice(at + 1)
  // `at top` / `at bottom`: one keyword on the vertical axis, x stays centred.
  if (pos.length === 1 && (pos[0] === 'top' || pos[0] === 'bottom')) return { cx: '50%', cy: placement(pos[0], 'y')! }
  const x = placement(pos[0], 'x')
  const y = placement(pos[1], 'y')
  return x && y ? { cx: x, cy: y } : null
}

const SIZE_KEYWORDS: Record<string, string> = { 'closest-side': 'cs', 'farthest-side': 'fs', 'closest-corner': 'cc', 'farthest-corner': 'fc' }

/**
 * Parse a computed-style gradient: linear (with angle in deg/turn/rad/grad or `to <side|corner>`, repeating or not),
 * radial (shape, size keyword or lengths, `at` position) and conic (`from` angle, `at` position, repeating expanded).
 * Positions normalised to {fraction, px}. `w`/`h` only resolve `to <corner>` and the stop ordering.
 * Null for anything else (repeating radial, colour hints, unknown syntax).
 */
export function parseGradient(input: string, w = 100, h = 100): Gradient | null {
  const m = /^(repeating-)?(linear|radial|conic)-gradient\((.*)\)$/s.exec(input.trim())
  if (!m) return null
  const repeating = !!m[1]
  const kind = m[2]!
  const args = splitTop(m[3]!)
  const startsWithColor = (a: string) => /^(rgba?\(|color\(|#[0-9a-f])/i.test(a)

  if (kind === 'linear') {
    let angle = 180
    const first = args[0]!
    const am = /^(-?[\d.]+)(deg|turn|rad|grad)$/.exec(first)
    if (am) {
      const v = +am[1]!
      angle = am[2] === 'deg' ? v : am[2] === 'turn' ? v * 360 : am[2] === 'rad' ? (v * 180) / Math.PI : v * 0.9
      args.shift()
    } else if (/^to\s/.test(first)) {
      const sides = first.slice(3).trim().split(/\s+/)
      const t = (Math.atan2(w, h) * 180) / Math.PI
      const has = (s: string) => sides.includes(s)
      if (sides.length === 1) angle = has('top') ? 0 : has('right') ? 90 : has('bottom') ? 180 : 270
      else if (has('top') && has('right')) angle = t
      else if (has('bottom') && has('right')) angle = 180 - t
      else if (has('bottom') && has('left')) angle = 180 + t
      else angle = 360 - t
      args.shift()
    }
    const stops = parseStops(args, gradientLength(angle, w, h))
    return stops ? { kind: 'linear', angle, repeating, stops } : null
  }

  if (kind === 'radial') {
    if (repeating) return null
    let shape: 'circle' | 'ellipse' = 'ellipse'
    let size = ['fc']
    let cx = '50%'
    let cy = '50%'
    if (!startsWithColor(args[0]!)) {
      const words = args.shift()!.trim().split(/\s+/)
      const at = parseAt(words)
      if (!at) return null
      ;({ cx, cy } = at)
      const atIdx = words.indexOf('at')
      const head = atIdx >= 0 ? words.slice(0, atIdx) : words
      const lens = head.filter(t => /^-?[\d.]+(%|px)$/.test(t))
      const kw = head.find(t => t in SIZE_KEYWORDS)
      if (head.includes('circle')) shape = 'circle'
      else if (head.includes('ellipse')) shape = 'ellipse'
      else if (lens.length === 1) shape = 'circle'
      if (kw) size = [SIZE_KEYWORDS[kw]!]
      else if (lens.length) size = lens.length === 1 ? [lens[0]!, lens[0]!] : [lens[0]!, lens[1]!]
    }
    const stops = parseStops(args, 100)
    return stops ? { kind: 'radial', shape, cx, cy, size, stops } : null
  }

  // conic
  let from = 0
  let cx = '50%'
  let cy = '50%'
  if (!startsWithColor(args[0]!)) {
    const words = args.shift()!.trim().split(/\s+/)
    const fi = words.indexOf('from')
    if (fi >= 0) {
      const a = term(words[fi + 1] ?? '')
      if (!a) return null
      from = a.f * 360
    }
    const at = parseAt(words)
    if (!at) return null
    ;({ cx, cy } = at)
  }
  let stops = parseStops(args, 1)
  if (!stops) return null
  if (repeating) {
    // Expand the period over the whole turn (angles do not depend on the box).
    const first = stops[0]!.f
    const period = stops[stops.length - 1]!.f - first
    if (!(period > 0.0005)) return null
    const out: GradientStop[] = []
    for (let k = Math.floor((0 - first) / period); first + k * period < 1 && out.length < 256; k++) {
      for (const s of stops) out.push({ ...s, f: s.f + k * period })
    }
    stops = out
  }
  return { kind: 'conic', from, cx, cy, stops }
}

export interface ShadowPart {
  x: number
  y: number
  blur: number
  spread: number
  inset: boolean
  color: Rgba
}

/** Parse a computed `box-shadow` / `text-shadow` list. Unreadable parts are dropped and reported via `lossy`. */
export function parseShadows(value: string): { parts: ShadowPart[]; lossy: boolean } {
  const parts: ShadowPart[] = []
  let lossy = false
  if (!value || value === 'none') return { parts, lossy }
  for (const raw of splitTop(value)) {
    const cm = COLOR_TOKEN.exec(raw)
    const color = cm ? parseColor(cm[1]!) : null
    const rest = raw.replace(cm?.[1] ?? '', '').trim()
    const inset = /\binset\b/.test(rest)
    const n = rest.replace(/\binset\b/, '').trim().split(/\s+/).map(v => parseFloat(v) || 0)
    if (!color || n.length < 2) {
      lossy = true
      continue
    }
    parts.push({ x: n[0]!, y: n[1]!, blur: n[2] ?? 0, spread: n[3] ?? 0, inset, color })
  }
  return { parts, lossy }
}
