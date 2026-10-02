/**
 * ─── Geometry for the control coach's wordless glyphs ────────────────────────
 *
 * The drawings `InputGlyph.vue` puts on screen, as numbers and SVG path data,
 * computed once at import. No DOM here, so the tests can check the geometry
 * itself: where the fingertip is at each moment, that the streak behind it
 * keeps up, that the hand never leaves its box.
 */

// The hold glyph's own clock (seconds): when the ring starts to fill, when it
// is full, and the window in which the finger lets go.
const CHARGE_L1 = 0.45
const CHARGE_L2 = 1.1
const PERFECT_DELAY = 0.15
const PERFECT_LEN = 0.25

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

// ── The mouse: WHICH button, and click or hold ───────────────────────────────
// The developer himself misread the old mouse: its lit half pulsed to a near
// white that matched the other button, the hold ring's filled three quarters
// hugged the RIGHT side with its only gap over the lit LEFT button, and the
// click ripple sat on the seam, over the wheel — a middle-button click. Now
// only the button to press is coloured (solid, never pulsing), a press pushes
// it into a dark well, its ripple starts at its own centre, a click throws
// marks off its outer corner, and a hold ring fills from twelve toward the
// lit side.

export type MouseSide = 'left' | 'right'
export const MOUSE_SIDES: readonly MouseSide[] = ['left', 'right']
/** The body, in the mouse glyph's 140 × 112 box. */
export const MOUSE_BODY = { x: 41, y: 12, width: 58, height: 92, rx: 29 } as const
/** Its centre (the hold ring's). */
export const MOUSE_MID = { x: 70, y: 58 } as const
/** A pressed button sinks this far (under the seam line at y 52). */
export const MOUSE_PRESS = 3

export interface MouseButton {
  /** The button's face: a quarter of the rounded top, down to the seam. */
  d: string
  /** Where its press starts: the face's own centre (the ripple's origin). */
  cx: number
  cy: number
  /** Click marks: three short strokes off the face's outer top corner. */
  marks: string
}

const mouseButton = (s: -1 | 1): MouseButton => {
  const { x, y, width, rx } = MOUSE_BODY
  const mid = x + width / 2
  // The face ends at 50.5, so a press of 3 hides its foot under the seam
  // (stroke 3 at y 52) instead of showing a sliver below it.
  const d = `M${mid} ${y}A${rx} ${rx} 0 0 ${s < 0 ? 0 : 1} ${mid + s * rx} ${y + rx}V50.5H${mid}Z`
  // Centroid of the face (a quarter disc over a strip), rounded.
  const quarter = (Math.PI * rx * rx) / 4
  const strip = rx * (50.5 - (y + rx))
  const off = (4 * rx) / (3 * Math.PI)
  const cx = mid + s * ((quarter * off + strip * (rx / 2)) / (quarter + strip))
  const cy = (quarter * (y + rx - off) + strip * ((y + rx + 50.5) / 2)) / (quarter + strip)
  // Marks at the 45° point of the face's curve, pointing away from the body.
  const base = s < 0 ? 225 : 315
  const marks = [-24, 0, 24].map((da) => {
    const a = ((base + da) * Math.PI) / 180
    const c = Math.cos(a)
    const n = Math.sin(a)
    return `M${r2(mid + c * 35)} ${r2(y + rx + n * 35)}L${r2(mid + c * 43)} ${r2(y + rx + n * 43)}`
  }).join('')
  return { d, cx: r2(cx), cy: r2(cy), marks }
}
export const MOUSE_BUTTONS: Record<MouseSide, MouseButton> = { left: mouseButton(-1), right: mouseButton(1) }

/** A whole ring from twelve o'clock, turning toward `side` first. */
const ringToward = (cx: number, cy: number, r: number, side: MouseSide): string => {
  const f = side === 'left' ? 0 : 1
  return `M${cx} ${cy - r}A${r} ${r} 0 1 ${f} ${cx} ${cy + r}A${r} ${r} 0 1 ${f} ${cx} ${cy - r}`
}

/**
 * The mouse's hold: a faint track with a stopwatch tick at twelve; a fill
 * (`m-fill`, on a navy edge) that sweeps from twelve toward the lit side
 * while the button stays down; and, for reduced motion, the fill standing
 * three quarters round on that same side — its gap over the button NOT
 * pressed.
 */
const mouseHold = (side: MouseSide): GlyphPath[] => {
  const { x: cx, y: cy } = MOUSE_MID
  const r = 54
  const s = side === 'left' ? -1 : 1
  const arc = `M${cx} ${cy - r}A${r} ${r} 0 1 ${side === 'left' ? 0 : 1} ${cx - s * r} ${cy}`
  const tick = `M${cx} ${cy - r - 9}V${cy - r + 1}`
  const fill = ringToward(cx, cy, r, side)
  return [
    { cls: 'hold-track', d: ringPath(cx, cy, r) },
    { cls: 'hold-edge', d: arc },
    { cls: 'hold-arc', d: arc },
    { cls: 'm-fill-edge', d: fill, len: 100 },
    { cls: 'm-fill', d: fill, len: 100 },
    { cls: 'hold-tick-edge', d: tick },
    { cls: 'hold-tick', d: tick }
  ]
}
/** Round the whole mouse, clear of its body, per lit side. */
export const MOUSE_HOLD: Record<MouseSide, GlyphPath[]> = { left: mouseHold('left'), right: mouseHold('right') }

/** Is (px, py) on a button's face? (Tests: the ripple starts on the lit one.) */
export const onMouseButton = (side: MouseSide, px: number, py: number): boolean => {
  const { x, y, width, rx } = MOUSE_BODY
  const mid = x + width / 2
  const s = side === 'left' ? -1 : 1
  const dx = (px - mid) * s
  if (dx < 0 || dx > rx || py < y || py > 50.5) return false
  // Above the curve's end the face is a quarter disc round (mid, y + rx).
  return py >= y + rx || dx * dx + (py - y - rx) ** 2 <= rx * rx
}

// ── The charge lesson's demo ─────────────────────────────────────────────────
// A looping, wordless film of the charged shot, on the training drone (and the
// lesson crate): a finger presses the play area (or the mouse's left button
// sinks) and stays down; the crosshair's own ring fills round the press point
// in its two stages, with a glow that swells at each; beside it the shot grows
// small → medium → big; the finger lets go, the big shot flies into the
// target and bursts. Stage timings are the game's (`sim/stats.ts`), colours
// the crosshair's and the shots' (`Crosshair.vue`, `sim/combat.ts`), so the
// film shows exactly what the player's own hold will.
//
// The card sits with the SHOT'S column under the drone (above the crate), so
// the shot flies straight into it: the top edge of the card is the bubble's
// lowest point, the bottom edge (plus 15 %) the crate's top.

/** Timing, in seconds from the loop's start. */
export const DEMO_T = (() => {
  const press = 0.3
  const l1 = press + CHARGE_L1
  const l2 = press + CHARGE_L2
  const perfect = l2 + PERFECT_DELAY
  // Let go inside the PERFECT window (three quarters in), as a good player does.
  const release = perfect + PERFECT_LEN * 0.75
  const hit = release + 0.24
  return {
    /** The finger comes down (from `hover`) … */
    hover: 0.12,
    press,
    /** … the inner ring is full (charge level 1) … */
    l1,
    /** … the outer ring is full, and flickers … */
    l2,
    /** … then turns gold: the PERFECT window. */
    perfect,
    release,
    /** The shot meets the target; the burst lasts `burst`. */
    hit,
    burst: 0.34,
    loop: 2.8
  } as const
})()

/** The quick-tap contrast, played once after a wrong try: a tap, a pellet
 *  skips off the target at `bounce` (when the card shakes), gone by `dur`. */
export const DEMO_CLIP = { tap: 0.06, lift: 0.16, fire: 0.1, bounce: 0.3, fade: 0.58, dur: 1 } as const

/** The demo's box: wide enough for the input and the shot beside it. */
export const DEMO_W = 156
export const DEMO_H = { touch: 128, mouse: 100 } as const
/** The press point: the fingertip, or the middle of the mouse. */
export const DEMO_PRESS = { x: 60, y: 50 } as const
/** The two rings, in the crosshair's proportions (r 40 / 46, strokes 6 / 5). */
export const DEMO_R1 = 35
export const DEMO_R2 = 41
/** The hand, drawn smaller, fingertip on the press point. */
export const DEMO_HAND_SCALE = 0.75
/** The finger's height above the glass before it presses. */
export const DEMO_HOVER = 9
/** The mouse, drawn to fit inside the inner ring. */
export const DEMO_MOUSE_SCALE = 0.6
/** The shot's column (the card's anchor on the target) and its three sizes:
 *  core and halo radii, a pellet's, a level-1 and a full charge shot's —
 *  the ratios of the real shots (r 0.085 / 0.15 / 0.24). */
export const DEMO_ORB = { x: 131, y: 50, core: [5, 9, 13], halo: [8.5, 15, 22] } as const
/** The card's horizontal anchor: the shot's column, as a share of its width. */
export const DEMO_ANCHOR = r4(DEMO_ORB.x / DEMO_W)
/** Crosshair colours: inner ring, outer ring, its full-charge flicker, PERFECT. */
export const DEMO_RING = { l1: '#c8ff7a', l2: '#7ff4ff', full: '#ffffff', full2: '#3cc8ff', perfect: '#ffd84a' } as const
/** The shots' looks (core, glow): a pellet, charge 1, charge 2, a PERFECT crit. */
export const DEMO_SHOT = {
  pellet: ['#fff6b0', '#ffe066'],
  l1: ['#eaffb0', '#9dff5a'],
  l2: ['#e6fbff', '#3ce0ff'],
  perfect: ['#fffbe6', '#ffd84a']
} as const

export type DemoDevice = 'touch' | 'mouse'
export type DemoAim = 'up' | 'down'

/** SMIL attributes for one animated value: keyed (time s, value) pairs. */
export interface DemoAnim {
  values: string
  keyTimes: string
  dur: string
  calcMode: 'linear' | 'discrete'
}
type Key = readonly [number, string | number]
const anim = (keys: readonly Key[], dur: number, calcMode: DemoAnim['calcMode'] = 'linear'): DemoAnim => {
  const ks = [...keys]
  if (ks[0]![0] > 0) ks.unshift([0, ks[0]![1]])
  const last = ks[ks.length - 1]!
  if (calcMode === 'linear' && last[0] < dur) ks.push([dur, last[1]])
  return {
    values: ks.map(k => String(k[1])).join(';'),
    keyTimes: ks.map(k => r4(Math.min(1, k[0] / dur))).join(';'),
    dur: `${dur}s`,
    calcMode
  }
}
/** A ring's dash (`pathLength` 100) and the offset that empties it: the gap
 *  is longer than the path, and the dash ends short of its start, so a round
 *  cap never leaves a dot at twelve. */
export const DEMO_DASH = '100 110'
export const EMPTY = 101
/** A jump at t: the value just before, the new one just after. */
const EPS = 0.004
const step = (t: number, from: string | number, to: string | number): Key[] => [[t - EPS, from], [t, to]]

/** Six short strokes round (0, 0): a burst's sparks (and a pellet's tink). */
export const DEMO_SPARKS = [0, 1, 2, 3, 4, 5].map((i) => {
  const a = ((i * 60 + 30) * Math.PI) / 180
  return `M${r2(Math.cos(a) * 11)} ${r2(Math.sin(a) * 11)}L${r2(Math.cos(a) * 18)} ${r2(Math.sin(a) * 18)}`
}).join('')

/** Where the shot meets the target, in the box's units. */
export const demoTargetY = (device: DemoDevice, aim: DemoAim): number =>
  aim === 'up' ? -6 : r2(DEMO_H[device] * 1.15)

/**
 * Everything the demo binds for one device and aim: its box, the input's
 * placement, and the SMIL tracks of the loop and of the quick-tap clip.
 */
export const chargeDemo = (device: DemoDevice, aim: DemoAim) => {
  const T = DEMO_T
  const L = T.loop
  const P = DEMO_PRESS
  const O = DEMO_ORB
  const h = DEMO_H[device]
  const ty = demoTargetY(device, aim)
  const dy = r2(ty - O.y)
  const side: MouseSide = 'left'
  const btn = MOUSE_BUTTONS[side]
  const ms = DEMO_MOUSE_SCALE
  // The mouse's button centre, in the demo's box.
  const bx = r2(P.x + (btn.cx - MOUSE_MID.x) * ms)
  const by = r2(P.y + (btn.cy - MOUSE_MID.y) * ms)
  // Touch rings fill clockwise like the crosshair's; the mouse's toward the
  // lit button, as its hold glyph does.
  const ring = (r: number) => device === 'mouse' ? ringToward(P.x, P.y, r, side) : ringPath(P.x, P.y, r)
  const off = T.release + 0.12
  const [core0, core1, core2] = O.core
  const [halo0, halo1, halo2] = O.halo
  const C = DEMO_RING
  const S = DEMO_SHOT
  const hover = `0 ${-DEMO_HOVER}`
  const bounce = aim === 'up' ? 24 : -24
  return {
    viewBox: `0 0 ${DEMO_W} ${h}`,
    /** The edge bubble's cut: the input and its ring only. */
    compactViewBox: `10 0 100 ${h}`,
    press: P,
    ring1: ring(DEMO_R1),
    ring2: ring(DEMO_R2),
    hand: `translate(${P.x} ${P.y}) scale(${DEMO_HAND_SCALE}) translate(${-FINGERTIP.x} ${-FINGERTIP.y})`,
    mouse: `translate(${P.x} ${P.y}) scale(${ms}) translate(${-MOUSE_MID.x} ${-MOUSE_MID.y})`,
    /** The ripple's centre: under the fingertip, or on the lit button. */
    tapAt: device === 'mouse' ? { x: bx, y: by } : { x: P.x, y: P.y },
    orb: { x: O.x, y: O.y },
    target: { x: O.x, y: ty },
    /** The shot's path to the target (its streak rides it). */
    flight: `M${O.x} ${O.y}V${ty}`,
    /** The target's skin where the pellet skips off: the bubble's lowest
     *  curve, or the crate's top edge. */
    rim: aim === 'up'
      ? `M${O.x - 20} ${ty - 8}Q${O.x} ${ty + 8} ${O.x + 20} ${ty - 8}`
      : `M${O.x - 18} ${ty}H${O.x + 18}`,
    /** The loop, on one clock. */
    loop: {
      /** The finger: hovering, down at the press, up at the release. */
      finger: anim([[T.hover, hover], [T.press, '0 0'], [T.release, '0 0'], [T.release + 0.1, hover]], L),
      /** The mouse button: sinks at the press, rises at the release. */
      button: anim([[T.press - 0.06, '0 0'], [T.press, `0 ${MOUSE_PRESS}`], [T.release, `0 ${MOUSE_PRESS}`], [T.release + 0.06, '0 0']], L),
      buttonFill: anim([[0, '#ffd84a'], [T.press - 0.03, '#f0ae22'], [T.release + 0.03, '#ffd84a']], L, 'discrete'),
      /** The press ripple, once, from the press point. */
      rippleR: anim([[T.press - EPS, 4], [T.press, 5], [T.press + 0.45, device === 'mouse' ? 9 : 26], [T.press + 0.46, 4]], L),
      rippleO: anim([[T.press - EPS, 0], [T.press, 0.95], [T.press + 0.45, 0]], L),
      /** The dimple under the fingertip while it is down. */
      dimple: anim([[T.press - 0.02, 0], [T.press + 0.06, 11], [T.release, 11], [T.release + 0.08, 0]], L),
      /** The ring's group: on while held (the crosshair shows it past 12 %
       *  of level 1), off at the release. */
      ringO: anim([[T.press + CHARGE_L1 * 0.12, 0], [T.press + CHARGE_L1 * 0.12 + 0.05, 1], [T.release, 1], [off, 0]], L),
      /** Ring fills (dash offsets on `pathLength` 100, dash array
       *  `DEMO_DASH`): EMPTY past 100, so a round cap never dots it. */
      l1: anim([[T.press, EMPTY], [T.l1, 0], ...step(off + 0.02, 0, EMPTY)], L),
      l2: anim([[T.l1, EMPTY], [T.l2, 0], ...step(off + 0.02, 0, EMPTY)], L),
      l1Color: anim([[0, C.l1], [T.perfect, C.perfect], [off + 0.02, C.l1]], L, 'discrete'),
      // Full: the crosshair's 24 Hz flicker, then PERFECT gold.
      l2Color: anim([[0, C.l2], [T.l2, C.full], [T.l2 + 1 / 24, C.full2], [T.perfect, C.perfect], [off + 0.02, C.l2]], L, 'discrete'),
      /** The glow round the press point: swells, and pops at each stage. */
      glowR: anim([[T.press, 14], [T.l1 - EPS, 28], [T.l1 + 0.08, 36], [T.l2 - EPS, 40], [T.l2 + 0.08, 50], [T.release, 54], [off, 56], [off + 0.02, 14]], L),
      glowO: anim([
        [T.press, 0], [T.press + 0.1, 0.3], ...step(T.l1, 0.4, 0.8), [T.l1 + 0.1, 0.65],
        ...step(T.l2, 0.7, 1), [T.perfect, 0.9], [T.release, 1], [off, 0]
      ], L),
      glowColor: anim([[0, C.l1], [T.l1, C.l2], [T.l2, C.full], [T.perfect, C.perfect], [off + 0.02, C.l1]], L, 'discrete'),
      /** The shot: small, medium at level 1, big at full (a pop at each). */
      core: anim([
        [T.press, 0], [T.press + 0.08, core0], [T.l1 - EPS, core0 + 1], [T.l1 + 0.06, core1 + 2], [T.l1 + 0.12, core1],
        [T.l2 - EPS, core1 + 1], [T.l2 + 0.06, core2 + 2.5], [T.l2 + 0.12, core2], [T.hit, core2], ...step(T.hit + EPS, core2, 0)
      ], L),
      halo: anim([
        [T.press, 0], [T.press + 0.08, halo0], [T.l1 - EPS, halo0 + 1], [T.l1 + 0.12, halo1],
        [T.l2 - EPS, halo1 + 1], [T.l2 + 0.06, halo2], [T.perfect + 0.06, halo2 + 3], [T.hit, halo2 + 3], ...step(T.hit + EPS, halo2 + 3, 0)
      ], L),
      coreColor: anim([[0, S.pellet[0]], [T.l1, S.l1[0]], [T.l2, S.l2[0]], [T.perfect, S.perfect[0]], [T.hit + 0.02, S.pellet[0]]], L, 'discrete'),
      haloColor: anim([[0, S.pellet[1]], [T.l1, S.l1[1]], [T.l2, S.l2[1]], [T.perfect, S.perfect[1]], [T.hit + 0.02, S.pellet[1]]], L, 'discrete'),
      /** Let go: the shot flies to the target … */
      fly: anim([[T.release, '0 0'], [T.hit, `0 ${dy}`], ...step(T.hit + 0.02, `0 ${dy}`, '0 0')], L),
      /** … a streak behind it (a dash whose head rides the shot) … */
      streak: anim([[T.release, 40], [T.hit, -60], ...step(T.hit + 0.02, -60, 40)], L),
      streakO: anim([[T.release - EPS, 0], [T.release, 0.9], [T.hit, 0.9], [T.hit + 0.1, 0]], L),
      /** … and it bursts there: a flash, a ring, sparks. */
      flashR: anim([[T.hit, 5], [T.hit + 0.07, 17], [T.hit + 0.2, 8]], L),
      flashO: anim([[T.hit - EPS, 0], [T.hit, 1], [T.hit + 0.2, 0]], L),
      burstR: anim([[T.hit, 8], [T.hit + T.burst, 26], ...step(T.hit + T.burst + 0.02, 26, 8)], L),
      burstO: anim([[T.hit - EPS, 0], [T.hit, 1], [T.hit + T.burst, 0]], L),
      sparks: anim([[T.hit, '0.7'], [T.hit + 0.3, '1.6'], ...step(T.hit + 0.32, '1.6', '0.7')], L),
      sparksO: anim([[T.hit - EPS, 0], [T.hit, 1], [T.hit + 0.3, 0]], L)
    },
    /** The quick tap (after a wrong try), played once. */
    clip: (() => {
      const K = DEMO_CLIP
      const D = K.dur
      return {
        finger: anim([[0, hover], [K.tap, '0 0'], [K.lift - 0.04, '0 0'], [K.lift, hover]], D),
        button: anim([[0, '0 0'], [K.tap, `0 ${MOUSE_PRESS}`], [K.lift - 0.04, `0 ${MOUSE_PRESS}`], [K.lift, '0 0']], D),
        rippleR: anim([[K.tap, 4], [K.tap + 0.35, device === 'mouse' ? 9 : 22]], D),
        rippleO: anim([[K.tap - EPS, 0], [K.tap, 0.95], [K.tap + 0.35, 0]], D),
        /** The pellet: out at `fire`, skips off the target at `bounce`, fades. */
        pellet: anim([[K.fire, '0 0'], [K.bounce, `0 ${dy}`], [K.fade, `${26} ${r2(dy + bounce)}`]], D),
        pelletO: anim([[K.fire - EPS, 0], [K.fire, 1], [K.fade - 0.12, 1], [K.fade, 0]], D),
        rimO: anim([[K.bounce - EPS, 0], [K.bounce, 1], [K.bounce + 0.22, 0]], D),
        tinkO: anim([[K.bounce - EPS, 0], [K.bounce, 1], [K.bounce + 0.16, 0]], D)
      }
    })()
  }
}
export type ChargeDemoGeometry = ReturnType<typeof chargeDemo>
