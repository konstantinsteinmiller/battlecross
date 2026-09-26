/**
 * ─── Geometry for the control coach's wordless glyphs ────────────────────────
 *
 * The drawings `InputGlyph.vue` puts on screen, as numbers and SVG path data,
 * computed once at import. No DOM here, so the tests can check the geometry
 * itself: where the fingertip is at each moment, that the streak behind it
 * keeps up, that the hand never leaves its box.
 */

/** The hand every finger glyph draws, pointing up, in a 140 × 130 box. */
export const HAND = [
  { x: 60, y: 8, width: 20, height: 62, rx: 10 },
  { x: 78, y: 46, width: 17, height: 30, rx: 8.5 },
  { x: 93, y: 54, width: 15, height: 28, rx: 7.5 },
  { x: 48, y: 60, width: 60, height: 52, rx: 18 },
  { x: 32, y: 70, width: 20, height: 34, rx: 10, transform: 'rotate(-32 42 87)' }
]
/** Where the hand touches the glass. */
export const FINGERTIP = { x: 70, y: 14 } as const

const r2 = (v: number): number => Math.round(v * 100) / 100
const r4 = (v: number): number => Math.round(v * 10000) / 10000

// ── Touch move: a finger tracing an ∞ ────────────────────────────────────────
// It replaces a ghost joystick (a dashed circle and a knob) that a playtester
// read as a meaningless icon, in still frames, while the Slide button's arrow
// passed for "walk". A fingertip drawing an ∞ on the left of the screen says
// "drag here, any way you like" in every frame.
//
// The curve is a lemniscate of Bernoulli made 1.25× taller (the pure one is a
// flat bow tie at HUD size), sampled at even steps of its parameter. The
// finger reaches sample i at time i/N, and that parameter eases through the
// crossing and swings round the loop ends, the way a hand draws it. The loop
// starts, and the reduced-motion still rests, at the bottom of the right
// loop: there the hand hangs below the ∞ and hides none of it.

const INF_A = 92
const INF_B = INF_A * 1.25
const INF_CX = 134
const INF_CY = 51
/** Samples round the loop: a polyline this fine is smooth at HUD size. */
export const INF_SAMPLES = 48
/** The hand is drawn smaller here, so that the ∞ stays the bigger shape. */
export const INF_HAND_SCALE = 0.9
/** Share of the loop lit up behind the fingertip. */
const INF_STREAK = 0.24
/** The lowest point of the right loop, where sin²t = 1/3. */
const T0 = Math.asin(1 / Math.sqrt(3))

/** Sample i of the loop, i = 0 being the resting point. */
export const INF_POINTS: ReadonlyArray<readonly [number, number]> = Array.from({ length: INF_SAMPLES }, (_, i) => {
  const t = T0 + (i / INF_SAMPLES) * Math.PI * 2
  const k = 1 + Math.sin(t) ** 2
  return [r2(INF_CX + (INF_A * Math.cos(t)) / k), r2(INF_CY + (INF_B * Math.sin(t) * Math.cos(t)) / k)] as const
})

/** Distance along the closed loop to sample i (entry N: the whole loop). */
const dist: number[] = [0]
for (let i = 1; i <= INF_SAMPLES; i++) {
  const [x0, y0] = INF_POINTS[i - 1]!
  const [x1, y1] = INF_POINTS[i % INF_SAMPLES]!
  dist.push(dist[i - 1]! + Math.hypot(x1 - x0, y1 - y0))
}
const loop = dist[INF_SAMPLES]!
const streak = loop * INF_STREAK
const [restX, restY] = INF_POINTS[0]!
const polyline = (dx: number, dy: number): string =>
  `M${INF_POINTS.map(([x, y]) => `${r2(x - dx)} ${r2(y - dy)}`).join('L')}Z`

/**
 * Everything the ∞ glyph binds. The finger rides the loop by SMIL
 * (`animateMotion`) and the streak by an `animate` of its dash offset, on the
 * same key times: both are linear in distance between two keys, so the
 * streak's head stays under the fingertip for the whole loop, eased or not.
 * Dash lengths are real lengths, not `pathLength` units, so no browser's
 * scaling of the dash offset can put the two out of step.
 */
export const INFINITY = {
  viewBox: '0 0 265 184',
  /** The ∞: the guide, its halo, and the streak's track. */
  d: polyline(0, 0),
  /** The same loop measured from the resting fingertip. The hand's own
   *  transform holds it at rest, so without the animation (reduced motion)
   *  it simply stays there. */
  motion: polyline(restX, restY),
  /** Sample i is reached at time i/N ... */
  keyTimes: dist.map((_, i) => r4(i / INF_SAMPLES)).join(';'),
  /** ... having covered this share of the loop. */
  keyPoints: dist.map(d => r4(d / loop)).join(';'),
  /** The streak: one dash ending at the fingertip. */
  dashArray: `${r2(streak)} ${r2(loop - streak)}`,
  dashOffsets: dist.map(d => r2(streak - d)).join(';'),
  dashRest: r2(streak),
  hand: `translate(${restX} ${restY}) scale(${INF_HAND_SCALE}) translate(${-FINGERTIP.x} ${-FINGERTIP.y})`,
  dur: '2.4s'
} as const

// ── Hold: a timer ring, three quarters full ──────────────────────────────────
// The hold used to live only in a ring filling up, so a still frame showed a
// finger (or a mouse) and nothing else: "tap". The ring now stands three
// quarters full with a tick at twelve, a stopwatch at a glance, and the fill
// still sweeps round it in motion.

export interface GlyphPath {
  /** Class, in draw order. */
  cls: string
  d: string
  /** `pathLength`, for the one path whose dash is animated. */
  len?: number
}

/** A whole ring from twelve o'clock, clockwise. */
const ringPath = (cx: number, cy: number, r: number): string =>
  `M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx} ${cy + r}A${r} ${r} 0 1 1 ${cx} ${cy - r}`

/** The faint track, the 3/4 arc (a navy edge under the cyan), the sweep that
 *  fills in motion, and the tick sitting on the ring at twelve. */
const holdRing = (cx: number, cy: number, r: number): GlyphPath[] => {
  const arc = `M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx - r} ${cy}`
  const tick = `M${cx} ${cy - r - 9}V${cy - r + 1}`
  return [
    { cls: 'hold-track', d: ringPath(cx, cy, r) },
    { cls: 'hold-edge', d: arc },
    { cls: 'hold-arc', d: arc },
    { cls: 'hold-ring', d: ringPath(cx, cy, r), len: 100 },
    { cls: 'hold-tick-edge', d: tick },
    { cls: 'hold-tick', d: tick }
  ]
}
/** Round the fingertip, behind the hand: the finger hides its bottom. */
export const FINGER_HOLD = holdRing(70, 16, 28)
/** Round the whole mouse, clear of its body. */
export const MOUSE_HOLD = holdRing(70, 58, 54)
