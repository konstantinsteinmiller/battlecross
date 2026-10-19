import { bindInput, monsterAt, pickHero, type HeroKind, type MonsterKind } from './logic'

/**
 * The loading-screen clicker: a hero cuts down monsters, one tap / click / key one slash.
 * Everything is drawn here from curves and polygons on one 160x120 canvas (no image files, no
 * text); it keeps no score and writes no storage. The palettes and proportions follow the game's
 * own rigs (rigs/creatures.ts, looks.ts): a big head, a short body, flat cel shading in three
 * tones with a rim light and a highlight, a thick dark outline.
 * `mountClicker` returns its own teardown: the loop, the listeners and the observer go with it.
 */
const W = 160
const H = 120
const GROUND = 106
const HERO_X = 38
const MON_X = 114
const INK = '#1b1530'
const TAU = 6.2832

type Pt = readonly number[]

/** How big each kind stands on the stage. */
const SCALE: Record<MonsterKind, number> = { wolf: 1.35, goblin: 1.5, treant: 1.15, elemental: 1.35, golem: 1.1, dragon: 0.98, demon: 1.12, wraith: 1.25, titan: 0.98 }
/** The themed debris of a kill. */
type Debris = 'fur' | 'coin' | 'leaf' | 'ember' | 'rock' | 'scale' | 'ash' | 'wisp' | 'ice'
const DEBRIS: Record<MonsterKind, readonly [Debris, string, string]> = {
  wolf: ['fur', '#8e98ac', '#e4e8f0'], goblin: ['coin', '#ffd24a', '#7bc74d'], treant: ['leaf', '#4f9a3e', '#8fd45a'],
  elemental: ['ember', '#ff7a1a', '#ffd27a'], golem: ['rock', '#8f9bb0', '#5d6a82'], dragon: ['scale', '#5a3aa8', '#ff9a2a'],
  demon: ['ash', '#3a2a30', '#ff4a3a'], wraith: ['wisp', '#9f7bff', '#d8c8ff'], titan: ['ice', '#9fd4f2', '#e8f4ff']
}

const tones = new Map<string, string>()
/** A colour darker (f < 1, toward violet ink) or lighter (f > 1, toward white). */
const tone = (hex: string, f: number): string => {
  const key = hex + f
  let out = tones.get(key)
  if (!out) {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
    const m = c.map((v, i) => Math.round(f < 1 ? v * f + [24, 16, 48][i]! * (1 - f) : v + (255 - v) * (f - 1)))
    out = `rgb(${m})`
    tones.set(key, out)
  }
  return out
}

/** The running game, if any: the one started on the static splash is handed on to the loader's own canvas, not restarted. */
let live: { stop: () => void, retarget: (c: HTMLCanvasElement) => void } | null = null
export const isRunning = (): boolean => !!live

export const mountClicker = (canvas: HTMLCanvasElement, opts: { firstLoad: boolean, start?: number, hero?: HeroKind }): (() => void) => {
  if (live) { live.retarget(canvas); return live.stop }
  let ctx = canvas.getContext('2d')!
  if (!ctx) return () => {}
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const hero: HeroKind = opts.hero ?? pickHero(opts.firstLoad)

  let n = opts.start ?? 0
  let mon = monsterAt(n)
  let hp = mon.hp
  let flash = 0 // seconds of white left after a hit
  let slash = 0 // seconds of swing left
  let spawn = 0 // 0..1 growth of a new monster
  let dying = 0 // 0 = alive, else seconds since the kill
  let pop = 0 // screen pop left
  let spark = 0
  let t = 0
  let blink = false
  let white = false
  const parts: { x: number, y: number, vx: number, vy: number, life: number, max: number, a: number, spin: number, k: Debris, c: string }[] = []

  // ── shapes: a base tone, a lit step, a highlight blob, a rim light, then the outline ──
  const smooth = (p: Pt): (() => void) => () => {
    const k = p.length / 2
    const mx = (i: number): number => (p[(i % k) * 2]! + p[((i + 1) % k) * 2]!) / 2
    const my = (i: number): number => (p[(i % k) * 2 + 1]! + p[((i + 1) % k) * 2 + 1]!) / 2
    ctx.beginPath()
    ctx.moveTo(mx(k - 1), my(k - 1))
    for (let i = 0; i < k; i++) ctx.quadraticCurveTo(p[i * 2]!, p[i * 2 + 1]!, mx(i), my(i))
    ctx.closePath()
  }
  const straight = (p: Pt): (() => void) => () => {
    ctx.beginPath()
    for (let i = 0; i < p.length; i += 2) i ? ctx.lineTo(p[i]!, p[i + 1]!) : ctx.moveTo(p[0]!, p[1]!)
    ctx.closePath()
  }
  const paint = (build: () => void, c: string, cx: number, cy: number, w: number, h: number, lw: number): void => {
    ctx.lineWidth = lw
    const base = white ? '#fff' : c
    build()
    ctx.fillStyle = white ? '#fff' : tone(c, 0.7)
    ctx.fill()
    if (!white) {
      ctx.save()
      build(); ctx.clip()
      ctx.save()
      ctx.translate(cx - w * 0.07, cy - h * 0.1); ctx.scale(0.9, 0.86); ctx.translate(-cx, -cy)
      build(); ctx.fillStyle = base; ctx.fill()
      ctx.restore()
      ctx.save()
      ctx.translate(cx - w * 0.2, cy - h * 0.26); ctx.scale(0.42, 0.34); ctx.translate(-cx, -cy)
      build(); ctx.fillStyle = tone(c, 1.32); ctx.fill()
      ctx.restore()
      // rim light along the lit edge, a specular fleck
      ctx.save()
      ctx.translate(1.1, 1.1); build()
      ctx.restore()
      ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = lw * 1.6
      ctx.stroke()
      if (w + h > 16) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(cx - w * 0.22, cy - h * 0.3, Math.min(w, h) * 0.07, Math.min(w, h) * 0.04, -0.6, 0, TAU); ctx.fill() }
      ctx.restore()
    }
    build()
    ctx.lineWidth = lw
    ctx.strokeStyle = INK
    ctx.stroke()
  }
  const S = (p: Pt, c: string, lw = 1.7): void => {
    const xs = p.filter((_, i) => i % 2 === 0); const ys = p.filter((_, i) => i % 2 === 1)
    const x0 = Math.min(...xs); const x1 = Math.max(...xs); const y0 = Math.min(...ys); const y1 = Math.max(...ys)
    paint(smooth(p), c, (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0, lw)
  }
  const P = (p: Pt, c: string, lw = 1.5): void => {
    const xs = p.filter((_, i) => i % 2 === 0); const ys = p.filter((_, i) => i % 2 === 1)
    const x0 = Math.min(...xs); const x1 = Math.max(...xs); const y0 = Math.min(...ys); const y1 = Math.max(...ys)
    paint(straight(p), c, (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0, lw)
  }
  const E = (x: number, y: number, rx: number, ry: number, c: string, lw = 1.7): void =>
    paint(() => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU) }, c, x, y, rx * 2, ry * 2, lw)
  const R = (x: number, y: number, w: number, h: number, c: string, lw = 1.5): void =>
    paint(() => { ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(2, w / 3, h / 3)) }, c, x + w / 2, y + h / 2, w, h, lw)
  /** A stroke with an outline: tails, brows, strands, blades' edges. */
  const L = (p: Pt, w: number, c: string, outline = true): void => {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath()
    for (let i = 0; i < p.length; i += 2) i ? ctx.lineTo(p[i]!, p[i + 1]!) : ctx.moveTo(p[0]!, p[1]!)
    if (outline) { ctx.lineWidth = w + 2.2; ctx.strokeStyle = INK; ctx.stroke() }
    ctx.lineWidth = w; ctx.strokeStyle = white ? '#fff' : c; ctx.stroke()
  }
  const dot = (x: number, y: number, r: number, c: string): void => { ctx.fillStyle = white ? '#fff' : c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill() }
  /** An eye: white, iris, pupil, a catch-light; it blinks. Angry ones get a heavy brow slanted `brow` (px, + = inner end down). */
  const eye = (x: number, y: number, r: number, iris: string, look = 0, brow = 0, side = 1): void => {
    if (blink) { L([x - r, y, x + r, y], 1.4, INK, false) } else {
      ctx.lineWidth = 1.1
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.1, 0, 0, TAU); ctx.fillStyle = white ? '#fff' : '#fff'; ctx.fill(); ctx.strokeStyle = INK; ctx.stroke()
      dot(x + look, y + 0.2, r * 0.62, iris); dot(x + look, y + 0.2, r * 0.3, INK)
      dot(x + look - r * 0.2, y - r * 0.25, r * 0.2, '#fff')
    }
    if (brow) L([x - r * 1.4 * side, y - r - brow * side, x + r * 1.2 * side, y - r * 1.3 + brow * side], 1.8, INK, false)
  }
  const glow = (x: number, y: number, r: number, c: string, a: number): void => {
    if (white) return
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, c); g.addColorStop(1, 'transparent')
    ctx.globalAlpha = a; ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill()
    ctx.globalAlpha = 1
  }

  // ── the monsters: origin at their feet, facing left, drawn in the game's colours ──
  const b = (): number => Math.sin(t * 2.4)
  const MONSTERS: Record<MonsterKind, () => void> = {
    wolf: () => {
      const wag = Math.sin(t * 5)
      L([16, -16, 26, -25 + wag * 3, 34, -22 + wag * 4], 7, '#58627a')
      S([28, -26 + wag * 3, 38, -25 + wag * 4, 36, -16 + wag * 3, 30, -17], '#e4e8f0', 1.3)
      P([-2, -14, 5, -14, 4, -2, -3, -2], '#58627a', 1.5); P([15, -14, 22, -14, 21, -2, 14, -2], '#58627a', 1.5); E(0, -1.5, 4.6, 2.2, '#c8ced8', 1.3); E(18, -1.5, 4.6, 2.2, '#c8ced8', 1.3)
      S([-17, -14, -12, -25, 4, -29, 18, -24, 22, -13, 12, -5, -6, -4], '#8e98ac', 2.1)
      S([-10, -8, 4, -6, 15, -9, 8, -3, -6, -3], '#e4e8f0', 1.3)
      S([-9, -26, 4, -30, 18, -25, 5, -25], '#58627a', 1.3)
      P([-15, -14, -8, -14, -9, -2, -14, -2], '#8e98ac', 1.5); P([7, -14, 14, -14, 13, -2, 8, -2], '#8e98ac', 1.5); E(-11.5, -1.5, 4.8, 2.3, '#e4e8f0', 1.3); E(10.5, -1.5, 4.8, 2.3, '#e4e8f0', 1.3)
      for (let i = 0; i < 4; i++) P([-19 + i * 3.4, -22, -17 + i * 3.4, -32 + (i % 2) * 2, -14 + i * 3.4, -22], '#8e98ac', 1.2)
      S([-31, -21, -26, -32, -14, -33, -10, -24, -13, -14, -25, -13], '#8e98ac', 2.1)
      S([-40, -20, -33, -25, -25, -21, -31, -14, -40, -16], '#c8ced8', 1.7)
      E(-40, -19.5, 2.2, 1.7, '#2a2430', 1.1)
      P([-35, -15.5, -33, -10, -31, -15.5], '#fff', 0.9); P([-28, -15, -26, -10.5, -24.5, -15], '#fff', 0.9)
      P([-24, -30, -22, -43, -14, -32], '#58627a', 1.6); P([-22, -31, -21, -39, -17, -32], '#c08a8a', 0.8)
      P([-13, -32, -9, -42, -6, -30], '#58627a', 1.6)
      eye(-23, -24, 2.4, '#ffb02a', -0.4, 1.3)
    },
    goblin: () => {
      const sw = Math.sin(t * 6) * 0.15
      R(-7, -8, 5.5, 8, '#6b4a2c'); R(2, -8, 5.5, 8, '#6b4a2c'); E(-5, -1, 5.5, 2.6, '#4a8a3c', 1.4); E(5, -1, 5.5, 2.6, '#4a8a3c', 1.4)
      S([-9, -9, -9, -21, 0, -24, 9, -21, 10, -9, 0, -6], '#8a5a34', 2)
      P([-9, -9, -3, -6, 3, -9, 9, -9, 10, -5, -9, -5], '#6b4a2c', 1.3)
      R(-9.5, -15, 19, 3.2, '#5a3a22', 1.4); R(-2, -15.2, 4, 3.6, '#ffd24a', 1.2)
      P([-4, -23, 0, -17, 4, -23], '#6b4a2c', 1.1)
      ctx.save(); ctx.translate(11, -14); ctx.rotate(-0.5 + sw)
      R(-1.5, -2, 3, 8, '#a8733f', 1.2); R(-4, -4, 8, 2.6, '#8a6a2a', 1.2); P([-2.2, -4, 2.2, -4, 0, -20], '#b9c4d6', 1.4); L([0, -5, 0, -17], 0.8, '#eef2fa', false)
      ctx.restore()
      R(-14, -19, 6, 4.5, '#7bc74d', 1.2); R(8, -19, 5, 4.5, '#7bc74d', 1.2)
      P([-8, -33, -26, -37 + sw * 8, -10, -27], '#7bc74d', 1.7); P([8, -33, 26, -37 - sw * 8, 10, -27], '#7bc74d', 1.7)
      P([-11, -31, -21, -34, -11, -29], '#b45a6a', 0.7); P([11, -31, 21, -34, 11, -29], '#b45a6a', 0.7)
      E(0, -31, 12.5, 11, '#7bc74d', 2.1)
      S([-3, -32, 0, -27, 3, -32, 0, -29], '#5aa83a', 1.1)
      S([-6, -24, 0, -22, 6, -24, 0, -20], '#2a1420', 1.2)
      P([-4.5, -23.5, -3.3, -20, -2, -23.2], '#fff', 0.8); P([2, -23.2, 3.3, -20, 4.5, -23.5], '#fff', 0.8)
      eye(-4.5, -33, 2.5, '#ffd84a', 0.2, 1.6); eye(4.5, -33, 2.5, '#ffd84a', -0.2, 1.6, -1)
    },
    treant: () => {
      // The game's treant: a barrel of bark, a glare with slit amber eyes and a toothy snarl, a
      // crown of round leaf balls in two greens with bright highlights, thick arms ending in claws.
      const sw = Math.sin(t * 1.6)
      const cd = dying ? Math.min(1, dying / 0.45) : 0
      const BK = '#7a5a3a'; const BD = '#5a4228'; const LF = '#4f9a3e'; const LF2 = '#8fd45a'
      // roots gripping the soil, stones breaking it
      E(-17, -1.5, 6, 2.6, '#6a4a2c', 1.2); E(17, -1.5, 6, 2.6, '#6a4a2c', 1.2); E(-26, -1, 3.2, 2, '#8a8f9c', 1.2); E(24, -1, 2.6, 1.7, '#8a8f9c', 1.1)
      L([-12, -3, -20, -2, -25, -5], 3.4, BD); L([12, -3, 20, -2, 24, -6], 3.4, BD); L([-5, -2, -7, 1, -10, 1.5], 2.4, BD); L([6, -2, 8, 1, 11, 1.5], 2.4, BD)
      for (const [x, y] of [[-19, -4], [-23, -3], [20, -4], [22, -3]] as const) { P([x - 1.4, y, x, y - 3, x + 1.4, y], BK, 0.9) }
      // thick arms with claw fingers and a twig bearing a leaf ball, swaying
      for (const s of [-1, 1]) {
        ctx.save(); ctx.translate(s * 14, -29); ctx.rotate(s * (0.12 + sw * 0.06 * s))
        L([0, 0, s * 8, 7, s * 12, 15], 8.5, BK)
        L([s * 2, 1, s * 9, 7, s * 12, 14], 1, BD, false); L([s * 1, 4, s * 7, 10], 0.8, tone(BK, 1.3), false)
        E(s * 12.5, 17, 5, 4.4, BK, 1.7);
        for (let i = -1; i <= 1; i++) { L([s * 12.5 + i * 2.8, 19, s * 12.5 + i * 3.4, 24 + (i === 0 ? 1.5 : 0)], 2.3, BK); P([s * 12.5 + i * 3.4 - 0.9, 24, s * 12.5 + i * 3.4, 26.5 + (i === 0 ? 1.5 : 0), s * 12.5 + i * 3.4 + 0.9, 24], '#e8d8b0', 0.7) }
        L([s * 7, 6, s * 14, 2, s * 17, -2], 1.8, BD); E(s * 17.5 + sw * s, -4, 3.8, 3.4, LF2, 1.4)
        ctx.restore()
      }
      // the trunk: layered bark plates, deep grooves, knots, moss
      S([-16, 0, -19, -13, -16, -29, -10, -38, 0, -41, 10, -38, 16, -29, 19, -13, 16, 0, 6, -3, -6, -3], BK, 2.5)
      S([-14, -4, -15, -16, -11, -26, -5, -22, -6, -9], tone(BK, 1.12), 1.1); S([14, -4, 15, -16, 11, -26, 5, -22, 6, -9], tone(BK, 0.9), 1.1)
      S([-3, -4, -5, -14, -2, -20, 3, -14, 2, -4], tone(BK, 1.05), 1)
      for (const x of [-12, 9]) L([x, -4, x + (x < 0 ? -1 : 1), -14, x * 0.9, -25], 1.1, '#4a3322', false)
      E(-9, -12, 2.8, 3.6, BD, 1.2); E(-9, -12, 1.3, 1.9, '#3a2818', 0.6); E(10, -17, 2.2, 2.8, BD, 1.1)
      S([-17, -26, -12, -31, -7, -27, -10, -22, -16, -21], LF, 1.2); S([13, -9, 18, -13, 17, -5, 12, -4], LF, 1.1); dot(-12, -27, 1, LF2); dot(15, -9, 0.8, LF2)
      // the face: a heavy brow, slit amber eyes, a root nose, a snarl of teeth, a beard of roots
      S([-12, -29, -6, -34, 0, -31, 6, -34, 12, -29, 9, -26, 0, -28, -9, -26], tone(BK, 0.78), 1.6)
      glow(-5.5, -27.5, 8, '#ffe07a', 0.5 + 0.2 * b()); glow(5.5, -27.5, 8, '#ffe07a', 0.5 + 0.2 * b())
      for (const s of [-1, 1]) { S([s * 1.6, -27.4, s * 5, -29.4, s * 9.4, -28, s * 5.4, -25.4], '#1a1020', 1.1); if (!blink) S([s * 3, -27.4, s * 5.4, -28.5, s * 8, -27.7, s * 5.4, -26.2], '#ffe07a', 0.4); L([s * 2, -31, s * 9, -29.6 + s * 0.2], 1.7, '#2a1a12', false) }
      S([-2, -26, 0, -22, 2, -26, 0, -24], tone(BK, 1.2), 1)
      S([-8, -21, -4, -23, 0, -22, 4, -23, 8, -21, 4, -17, 0, -16, -4, -17], '#1a1020', 1.2)
      for (let i = -3; i <= 3; i++) P([i * 2.2 - 1, -21.6, i * 2.2, -18.6, i * 2.2 + 1, -21.6], '#e8d8b0', 0.5)
      for (let i = -1; i <= 1; i++) L([i * 3, -15, i * 3.4 + sw, -8, i * 3 + sw * 1.6, -5], 1.8, BD)
      // the canopy: three leaf tones in round balls, flowers, acorns, a mushroom, hanging vines
      ctx.save(); ctx.translate(0, cd * 26 - 5); ctx.rotate(cd * 0.5)
      const ball = (x: number, y: number, r: number, c: string, ph: number): void => E(x + Math.sin(t * 1.7 + ph) * 1.1, y + Math.cos(t * 1.3 + ph) * 0.8, r, r * 0.86, c, 2)
      ball(-14, -44, 11, '#3a7f36', 0); ball(14, -44, 11, '#3a7f36', 1.6); ball(0, -50, 14, LF, 0.8)
      ball(-19, -40, 8, LF, 2.2); ball(19, -41, 8, LF, 3.1); ball(-7, -54, 10, LF2, 1.2); ball(9, -53, 9.5, LF2, 2.6); ball(0, -61, 7, '#a8e06a', 0.3)
      L([-21, -35, -23 + sw, -28, -22 + sw * 1.5, -22], 1.5, '#4f9a3e'); L([19, -34, 21 + sw, -27, 20 + sw * 1.5, -21], 1.5, '#4f9a3e')
      for (const [x, y] of [[-22, -21.6], [18, -19.6]] as const) E(x + sw * 1.5, y, 1.6, 1.2, LF2, 0.9)
      for (const [x, y, c] of [[-11, -58, '#ff9ab0'], [5, -62, '#fff0b0'], [-21, -46, '#ffd24a'], [13, -57, '#ff9ab0']] as const) { for (let k = 0; k < 5; k++) dot(x + Math.cos(k * 1.26) * 1.8, y + Math.sin(k * 1.26) * 1.8, 1.1, c); dot(x, y, 1, '#c0643a') }
      for (const [x, y] of [[-16, -34], [17, -33]] as const) { E(x, y + 2.4 + sw * 0.4, 1.7, 2.1, '#a8733f', 1); R(x - 1.1, y - 0.8, 2.2, 1.6, '#6a4a2a', 0.7) }
      S([13, -52, 16, -55, 20, -52, 16, -50], '#d03a3a', 1); R(15, -50, 2, 3, '#e8d8b0', 0.7); dot(16, -53.6, 0.5, '#fff'); dot(18.4, -52.6, 0.5, '#fff')
      ctx.restore()
    },
    elemental: () => {
      const f = (k: number): number => Math.sin(t * 7 + k) * 2.2
      glow(0, -20, 34, '#ff7a1a', 0.22 + 0.1 * b())
      S([-14, 0, -20, -14 + f(0), -12, -26, -15, -42 + f(1), -4, -33, 0, -50 + f(2), 5, -34, 14, -43 + f(3), 12, -27, 21, -15 + f(4), 15, 0, 0, 3], '#d83a10', 2.1)
      S([-9, -1, -13, -13, -7, -24, -8, -34 + f(2), -1, -27, 2, -41 + f(1), 6, -28, 10, -35 + f(0), 9, -22, 14, -12, 10, -1], '#ff7a1a', 1.4)
      S([-5, -1, -7, -10, -2, -19, 0, -26 + f(3), 3, -18, 7, -10, 5, -1], '#ffd27a', 1.1)
      eye(-3.6, -15, 2.3, '#3a1a14', 0, 1.8); eye(3.6, -15, 2.3, '#3a1a14', 0, 1.8, -1)
      S([-3, -8, 0, -6.5, 3, -8, 0, -4.5], '#3a1a14', 1)
    },
    golem: () => {
      const p = 0.5 + 0.5 * b()
      R(-11, -9, 9, 9, '#5d6a82', 1.9); R(2, -9, 9, 9, '#5d6a82', 1.9)
      R(-33, -30, 12, 25, '#5d6a82', 2); R(21, -30, 12, 25, '#5d6a82', 2); E(-27, -6, 7, 6, '#8f9bb0', 1.8); E(27, -6, 7, 6, '#8f9bb0', 1.8)
      S([-19, -10, -21, -32, -10, -40, 10, -40, 21, -32, 19, -10, 0, -6], '#8f9bb0', 2.4)
      S([-20, -34, -10, -42, 0, -38, -4, -30, -18, -29], '#5d6a82', 1.6); S([20, -34, 10, -42, 0, -38, 4, -30, 18, -29], '#5d6a82', 1.6)
      R(-18, -17, 36, 6, '#5d6a82', 1.6)
      glow(0, -25, 14, '#ffb04a', 0.35 + 0.3 * p)
      E(0, -25, 6, 6, '#ffb04a', 1.6); E(0, -25, 3, 3, '#ffe9b0', 0.9)
      L([-11, -36, -7, -30, -11, -26], 1.3, '#ffb04a', false); L([12, -22, 8, -16, 13, -12], 1.3, '#ffb04a', false)
      for (const [x, y] of [[-15, -34], [15, -34], [-15, -14], [15, -14]] as const) dot(x, y, 1.3, '#cdd6e6')
      S([-9, -42, -11, -52, 0, -56, 11, -52, 9, -42], '#8f9bb0', 2)
      R(-8, -51, 16, 5, '#5d6a82', 1.3)
      glow(0, -49, 9, '#ffb04a', 0.4 + 0.3 * p)
      L([-6, -49, -2, -49], 2.2, '#ffd890', false); L([2, -49, 6, -49], 2.2, '#ffd890', false)
      L([-8, -53, -3, -51], 1.6, INK, false); L([8, -53, 3, -51], 1.6, INK, false)
    },
    dragon: () => {
      const fl = Math.sin(t * 3.2)
      ctx.save(); ctx.translate(6, -34); ctx.rotate(-0.15 + fl * 0.14)
      S([0, 0, 6, -26, 18, -34, 24, -22, 34, -24, 30, -12, 38, -10, 24, 4, 8, 6], '#5a32a0', 2)
      L([2, -2, 14, -24], 1.4, '#7a52c0', false); L([6, 2, 28, -12], 1.4, '#7a52c0', false); L([4, 0, 34, -20], 1.4, '#7a52c0', false)
      ctx.restore()
      L([16, -14, 28, -9, 38, -14 + Math.sin(t * 3) * 3, 44, -8 + Math.sin(t * 3) * 3], 8, '#3e2474')
      P([40, -12 + Math.sin(t * 3) * 3, 50, -8, 42, -2 + Math.sin(t * 3) * 3], '#c87aff', 1.2)
      R(-9, -12, 8, 12, '#22113e'); R(7, -12, 8, 12, '#22113e')
      for (const x of [-9, 7]) for (let i = 0; i < 3; i++) P([x + i * 2.6, 0, x + i * 2.6 + 1, -3, x + i * 2.6 + 2, 0], '#efe6f8', 0.8)
      S([-14, -15, -10, -28, 6, -33, 22, -26, 24, -14, 10, -5, -6, -5], '#3e2474', 2.4)
      S([-10, -8, 8, -5, 18, -9, 8, -3, -6, -3], '#7a66a8', 1.3)
      for (let i = 0; i < 4; i++) P([-6 + i * 6, -31 + i, -3 + i * 6, -39 + i, 0 + i * 6, -31 + i], '#c87aff', 1.1)
      S([-20, -18, -22, -34, -17, -50, -3, -52, 0, -38, -2, -22], '#3e2474', 2.2)
      S([-18, -22, -17, -36, -13, -48, -9, -40, -10, -24], '#7a66a8', 1.2)
      for (let i = 0; i < 3; i++) P([-3 - i * 1, -36 - i * 7, 3 - i, -40 - i * 7, 0 - i, -32 - i * 7], '#c87aff', 1)
      S([-38, -52, -30, -62, -14, -62, -6, -53, -10, -44, -34, -44], '#3e2474', 2.4)
      S([-47, -50, -38, -52, -34, -46, -38, -41, -47, -43], '#5a3aa8', 1.7)
      S([-44, -44, -36, -43, -33, -40, -40, -38], '#7a66a8', 1)
      for (let i = 0; i < 3; i++) P([-44 + i * 4, -44, -43 + i * 4, -39.5, -42 + i * 4, -44], '#fff', 0.8)
      P([-34, -61, -41, -77, -24, -63], '#efe6f8', 1.7); P([-18, -62, -14, -77, -8, -61], '#efe6f8', 1.7)
      glow(-25, -54, 9, '#c87aff', 0.35 + 0.2 * b())
      eye(-25, -54, 3, '#c87aff', -0.6, 2)
      dot(-45, -49, 0.9, '#22113e')
    },
    demon: () => {
      const fl = Math.sin(t * 3)
      ctx.save(); ctx.translate(-8, -28); ctx.rotate(-0.1 + fl * 0.08)
      S([0, 0, -12, -16, -26, -20, -22, -6, -30, -2, -14, 6], '#7a1c28', 2); L([-2, -2, -22, -16], 1.2, '#a02838', false); L([-4, 2, -26, -6], 1.2, '#a02838', false)
      ctx.restore()
      ctx.save(); ctx.translate(8, -28); ctx.rotate(0.1 - fl * 0.08)
      S([0, 0, 12, -16, 26, -20, 22, -6, 30, -2, 14, 6], '#7a1c28', 2); L([2, -2, 22, -16], 1.2, '#a02838', false); L([4, 2, 26, -6], 1.2, '#a02838', false)
      ctx.restore()
      L([8, -10, 20, -6, 27, -16 + fl * 2], 3.6, '#b8303a'); P([24, -16 + fl * 2, 32, -20 + fl * 2, 30, -11 + fl * 2], '#b8303a', 1.3)
      R(-9, -12, 7, 12, '#2a141c'); R(2, -12, 7, 12, '#2a141c'); E(-6, -1.5, 5.5, 2.4, '#4a3038', 1.4); E(6, -1.5, 5.5, 2.4, '#4a3038', 1.4)
      S([-13, -10, -14, -26, -6, -32, 6, -32, 14, -26, 13, -10, 0, -8], '#d8404a', 2.2)
      S([-9, -10, 0, -8, 9, -10, 9, -17, -9, -17], '#3a1c24', 1.5); R(-10, -18, 20, 3, '#ffb04a', 1.2); R(-2, -18.4, 4, 4, '#ffd84a', 1)
      E(-14, -26, 5, 5, '#4a3038', 1.6); E(14, -26, 5, 5, '#4a3038', 1.6)
      L([-4, -27, 0, -22, 4, -27], 1.1, '#a02838', false)
      R(-20, -22, 5, 14, '#d8404a'); R(15, -22, 5, 14, '#d8404a')
      S([-9, -34, -8, -43, 0, -46, 8, -43, 9, -34, 0, -31], '#d8404a', 2.2)
      P([-8, -42, -17, -49, -15, -61, -4, -45], '#e8e0f0', 1.6); P([8, -42, 17, -49, 15, -61, 4, -45], '#e8e0f0', 1.6)
      glow(0, -39, 14, '#ffd84a', 0.18 + 0.12 * b())
      eye(-3.8, -39, 2.5, '#ffd84a', 0, 2.2); eye(3.8, -39, 2.5, '#ffd84a', 0, 2.2, -1)
      S([-5, -34, 0, -32.5, 5, -34, 0, -30], '#3a1c24', 1); P([-3.5, -33.5, -2.5, -31, -1.5, -33.2], '#fff', 0.6); P([1.5, -33.2, 2.5, -31, 3.5, -33.5], '#fff', 0.6)
    },
    wraith: () => {
      const f = Math.sin(t * 2.6)
      ctx.save(); ctx.translate(0, f * 3 - 6)
      glow(0, -30, 24, '#9f7bff', 0.2 + 0.08 * b())
      L([-18, -58, -16, -26, -14, -6], 2.2, '#a8733f'); S([-30, -62, -18, -64, -14, -56, -22, -56], '#c8d0e0', 1.6)
      S([0, -52, -15, -34, -20, -8, -12, -11 + f, -7, -3, -1, -10 - f, 6, -3, 12, -11 + f, 19, -6, 15, -34], '#2a2438', 2.2)
      S([0, -49, -10, -33, -11, -18, 0, -16, 11, -18, 10, -33], '#3a3250', 1.4)
      L([-14, -30, -9, -20], 1.2, '#7d5fe0', false); L([14, -30, 9, -20], 1.2, '#7d5fe0', false)
      S([-8, -44, -7, -53, 0, -56, 7, -53, 8, -44, 0, -41], '#2a2438', 2)
      E(0, -36, 7, 8, '#1a1428', 1.4)
      glow(-3, -36, 4, '#9f7bff', 0.8); glow(3, -36, 4, '#9f7bff', 0.8)
      eye(-3, -36, 1.8, '#d8c8ff', 0, 1.6); eye(3, -36, 1.8, '#d8c8ff', 0, 1.6, -1)
      L([-12, -22, -5, -15], 3, '#b8c8b0'); L([12, -22, 6, -16], 3, '#b8c8b0')
      L([-3, -24, 3, -24], 1.2, '#7d5fe0', false)
      ctx.restore()
    },
    titan: () => {
      const sw = Math.sin(t * 2.2) * 0.07
      R(-13, -10, 11, 10, '#3f5a78', 1.9); R(2, -10, 11, 10, '#3f5a78', 1.9)
      ctx.save(); ctx.translate(26, -36); ctx.rotate(0.15 + sw)
      R(-2.4, -12, 5, 34, '#8a6a44', 1.6); S([-7, -12, -9, -24, 0, -30, 9, -24, 7, -12], '#6a4a2a', 1.8)
      for (const [x, y] of [[-6, -20], [6, -20], [0, -27]] as const) P([x - 1.5, y, x, y - 5, x + 1.5, y], '#c9d8e8', 0.9)
      ctx.restore()
      R(-35, -42, 15, 34, '#5a7a9a', 2); E(-27, -7, 8, 6.5, '#9fd4f2', 1.8)
      S([-20, -12, -22, -42, -10, -50, 10, -50, 22, -42, 20, -12, 0, -8], '#5a7a9a', 2.6)
      R(-20, -22, 40, 6, '#3f5a78', 1.5); R(-3, -22.4, 6, 6.8, '#c9d8e8', 1.2)
      S([-22, -44, -10, -52, -4, -46, -12, -40], '#e8f4ff', 1.4); S([22, -44, 10, -52, 4, -46, 12, -40], '#e8f4ff', 1.4)
      L([-14, -36, -9, -30], 1.4, '#8aa6c6', false); L([14, -36, 9, -30], 1.4, '#8aa6c6', false)
      R(15, -42, 14, 11, '#5a7a9a'); E(25, -38, 6, 6, '#9fd4f2', 1.8)
      E(0, -58, 11, 10, '#9fd4f2', 2.2)
      P([-11, -56, -22, -60, -19, -72, -8, -62], '#e8f4ff', 1.6); P([11, -56, 22, -60, 19, -72, 8, -62], '#e8f4ff', 1.6)
      S([-8, -66, 0, -72, 8, -66, 0, -62], '#8aa6c6', 1.3)
      S([-11, -54, -8, -42, 0, -37, 8, -42, 11, -54, 6, -49, 0, -50, -6, -49], '#e8f4ff', 2)
      eye(-4, -59, 2.4, '#2a2340', 0, 2, 1); eye(4, -59, 2.4, '#2a2340', 0, 2, -1)
      S([-3, -53, 0, -52, 3, -53, 0, -50], '#6a4a5a', 1)
    }
  }

  // ── the hero: the game's, facing right ──
  const drawHero = (): void => {
    const sw = slash > 0 ? 1 - slash / 0.24 : 0
    const f = hero === 'female'
    const hair = f ? '#d2762c' : '#8a5230'
    const wv = (k: number): number => Math.sin(t * 3 + k)
    ctx.save()
    ctx.translate(HERO_X + (slash > 0 ? Math.sin(sw * 3.14) * 9 : 0), GROUND)
    ctx.scale(1.5, 1.5 - 0.02 * b())
    // cape, flowing behind
    S([-4, -29, -11 + wv(0), -25, -17 + wv(1) * 2, -14, -16 + wv(2) * 2.4, -6, -10 + wv(3) * 2, -9, -4 + wv(4), -6, 0, -14, 1, -24], '#d03a3a', 1.8)
    L([-8, -26, -12 + wv(1), -12], 0.9, '#9a2424', false)
    R(-6.5, -13, 5.5, 13, '#4a4458'); R(1.5, -13, 5.5, 13, '#4a4458'); R(-7.5, -5, 7.5, 5, '#5a3a22'); R(1, -5, 7.5, 5, '#5a3a22')
    L([-7, -3.5, -1, -3.5], 0.7, '#8a6a4a', false)
    if (f) S([-9, -17, 9, -17, 14, -6, 0, -4, -14, -6], '#3f7fd6', 1.8)
    S([-9, -14, -10, -26, -4, -30, 5, -30, 10, -26, 9, -14, 0, -12], '#3f7fd6', 2)
    R(-9, -18, 18, 3.4, '#5a3a22', 1.3); R(-1.8, -18.2, 3.6, 3.8, '#ffd24a', 1)
    P([-4, -30, 0, -26, 4, -30], '#eef2fa', 1)
    // head
    if (f) { S([-8, -42, -17 + wv(2) * 2, -40, -20 + wv(3) * 2.5, -30, -14, -27, -11 + wv(1), -34], hair, 1.8); P([-14, -42, -19, -46, -16, -38], '#d03a3a', 1.1); P([-14, -42, -9, -47, -12, -38], '#d03a3a', 1.1) }
    E(0, -38, 9.5, 9, '#f2c8a0', 2)
    E(-8.6, -37, 2.2, 2.6, '#e8b890', 1.2)
    S([-10.5, -37, -9, -46, 0, -49.5, 9, -46, 10.5, -39, 6, -43, 0, -41.5, -6, -43], hair, 2)
    for (const x of [-5, -1, 3]) L([x, -47, x + 1.5, -42], 0.8, tone(hair, 1.35), false)
    P([5, -43, 10, -40, 8, -37], hair, 1.1)
    eye(4.2, -37.5, 2.1, '#5a3a22', 0.8, 0.8)
    L([6, -32.5, 8, -32, 9.5, -33], 1, '#a0605a', false)
    // shield on the near arm: boss, rivets, emblem
    S([-11, -27, 3, -27, 3, -17, -4, -8, -11, -17], '#ffd24a', 2)
    S([-9, -25.5, 1, -25.5, 1, -17.5, -4, -11, -9, -17.5], '#2f63b8', 1)
    L([-4, -25, -4, -13], 1.1, '#9ac0f0', false); L([-9, -20, 1, -20], 1.1, '#9ac0f0', false)
    E(-4, -20, 2.4, 2.4, '#ffd24a', 1.1); dot(-4.5, -20.6, 0.8, '#fff')
    for (const [x, y] of [[-8.5, -24], [0.5, -24], [-8.5, -18], [0.5, -18]] as const) dot(x, y, 0.8, '#fff0b0')
    // the sword arm: from the shoulder, raised to cut
    ctx.save(); ctx.translate(6, -25); ctx.rotate(0.5 + sw * 1.95)
    R(-2.4, -1, 4.8, 8, '#3f7fd6', 1.3); E(0, 7.5, 2.7, 2.7, '#f2c8a0', 1.3)
    R(-1.1, 6, 2.4, 7, '#a8733f', 1); E(0, 14.5, 2, 2, '#ffd24a', 1.1); dot(-0.6, 13.9, 0.6, '#fff')
    R(-5.5, 4, 11, 2.6, '#ffd24a', 1.3)
    S([-2.8, 4, 2.8, 4, 2.2, -24, 0, -30, -2.2, -24], '#e6ebf5', 1.7)
    L([0, 3, 0, -22], 0.9, '#9aa4b8', false); L([-1.6, 2, -1.2, -24], 0.7, '#fff', false)
    const g = ((t * 0.7) % 1)
    if (!white) { ctx.globalAlpha = 0.9 * Math.sin(g * 3.14); L([-2.5, -4 - g * 20, 2.5, -4 - g * 20], 0.9, '#fff', false); L([0, -6.5 - g * 20, 0, -1.5 - g * 20], 0.9, '#fff', false); ctx.globalAlpha = 1 }
    ctx.restore()
    ctx.restore()
  }

  // The ground: grass, earth, tufts and stones, drawn once per size and blitted.
  let ground: HTMLCanvasElement | null = null
  const makeGround = (): void => {
    const g = document.createElement('canvas')
    g.width = canvas.width; g.height = canvas.height
    const c = g.getContext('2d')!
    const k = g.width / W
    c.scale(k, k)
    c.lineJoin = 'round'; c.lineCap = 'round'
    const y = GROUND
    const gr = c.createLinearGradient(0, y, 0, H)
    gr.addColorStop(0, '#7a5a3a'); gr.addColorStop(1, 'rgba(60,40,30,0)')
    c.fillStyle = gr; c.fillRect(6, y, W - 12, H - y)
    c.beginPath(); c.moveTo(4, y + 1); c.quadraticCurveTo(80, y - 3, W - 4, y + 1); c.lineTo(W - 4, y + 5); c.lineTo(4, y + 5); c.closePath()
    c.fillStyle = '#4f9a3e'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke()
    c.fillStyle = '#8fd45a'; c.fillRect(8, y + 1, W - 16, 1)
    c.lineWidth = 1.4
    for (let x = 12; x < W - 8; x += 17) {
      c.strokeStyle = INK; c.lineWidth = 2.6
      c.beginPath(); c.moveTo(x, y + 1); c.lineTo(x - 2, y - 4); c.moveTo(x + 1, y + 1); c.lineTo(x + 1, y - 5); c.moveTo(x + 2, y + 1); c.lineTo(x + 4, y - 3); c.stroke()
      c.strokeStyle = '#6fbf4a'; c.lineWidth = 1.1; c.stroke()
    }
    for (const [x, s] of [[24, 2.4], [86, 3], [143, 2.2]] as const) {
      c.beginPath(); c.ellipse(x, y + 8, s * 1.6, s, 0, 0, TAU); c.fillStyle = '#8a8f9c'; c.fill(); c.lineWidth = 1.2; c.stroke()
      c.beginPath(); c.ellipse(x - s * 0.5, y + 7.2, s * 0.6, s * 0.3, 0, 0, TAU); c.fillStyle = '#b4bac6'; c.fill()
    }
    ground = g
  }
  const shadow = (x: number, rx: number): void => {
    ctx.fillStyle = 'rgba(10,8,30,.38)'
    ctx.beginPath(); ctx.ellipse(x, GROUND + 3, rx, 3.2, 0, 0, TAU); ctx.fill()
  }

  let first = true
  let last = performance.now()
  let acc = 0
  const loop = (now: number): void => {
    raf = requestAnimationFrame(loop)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    acc += dt
    // 30 frames a second is plenty for a toy; a weak phone keeps its cores.
    if (acc < 0.032) return
    const d = acc
    acc = 0
    t += d
    flash = Math.max(0, flash - d)
    slash = Math.max(0, slash - d)
    pop = Math.max(0, pop - d)
    spark = Math.max(0, spark - d)
    if (spawn < 1) spawn = Math.min(1, spawn + d * 3.5)
    blink = t % 3.3 < 0.13
    if (dying) {
      dying += d
      if (dying > 0.6) { dying = 0; mon = monsterAt(++n); hp = mon.hp; spawn = 0 }
    }
    for (const p of parts) {
      p.life -= d; p.x += p.vx * d; p.y += p.vy * d; p.a += p.spin * d
      p.vy += (p.k === 'ember' || p.k === 'wisp' ? -30 : p.k === 'leaf' || p.k === 'ash' ? 40 : 260) * d
      if (p.k === 'leaf' || p.k === 'ash') p.vx *= 0.98
    }
    while (parts.length && parts[0]!.life <= 0) parts.shift()

    if (!ground || ground.width !== canvas.width) makeGround()
    if (first) { first = false; performance.mark('clicker:first-frame') }
    // The screen it played on is gone: stop with it.
    if (!canvas.isConnected) { stop(); return }
    const k = canvas.width / W
    ctx.setTransform(k, 0, 0, k, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.lineJoin = 'round'
    if (pop > 0 && !reduced) { const s = 1 + pop * 0.22; ctx.translate(W / 2, GROUND); ctx.scale(s, s); ctx.translate(-W / 2, -GROUND) }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.drawImage(ground!, 0, 0)
    ctx.setTransform(k, 0, 0, k, 0, 0)
    if (pop > 0 && !reduced) { const s = 1 + pop * 0.22; ctx.translate(W / 2, GROUND); ctx.scale(s, s); ctx.translate(-W / 2, -GROUND) }
    shadow(HERO_X, 15)
    white = false
    drawHero()
    if (dying < 0.5) {
      shadow(MON_X, 20 * SCALE[mon.kind] / 1.4)
      const grow = 1 - (1 - spawn) ** 3
      const sq = flash > 0 ? flash / 0.16 : 0
      const col = dying ? Math.min(1, dying / 0.45) : 0
      const s = SCALE[mon.kind] * (1 + Math.min(mon.round, 4) * 0.05) * grow
      ctx.save()
      ctx.translate(MON_X + sq * 5 + (mon.kind === 'wraith' ? 0 : 0), GROUND)
      ctx.scale(s * (1 + sq * 0.1 + col * 0.35), s * (1 - sq * 0.1 - col * 0.8))
      ctx.globalAlpha = 1 - col * 0.9
      white = flash > 0.09
      MONSTERS[mon.kind]()
      white = false
      ctx.restore()
      ctx.globalAlpha = 1
    }
    if (slash > 0) {
      ctx.strokeStyle = `rgba(255,255,255,${slash / 0.24})`
      ctx.lineWidth = 3.4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.arc(HERO_X + 8, GROUND - 38, 44, -1, 0.6)
      ctx.stroke()
      ctx.strokeStyle = `rgba(255,224,130,${slash / 0.24})`
      ctx.lineWidth = 1.4
      ctx.beginPath(); ctx.arc(HERO_X + 8, GROUND - 38, 39, -0.9, 0.5); ctx.stroke()
    }
    if (spark > 0) {
      const a = spark / 0.14
      ctx.save(); ctx.translate(MON_X - 22, GROUND - 38); ctx.rotate(a)
      ctx.strokeStyle = `rgba(255,240,170,${a})`; ctx.lineWidth = 2; ctx.lineCap = 'round'
      ctx.beginPath()
      for (let i = 0; i < 8; i++) { const r = i % 2 ? 7 : 12; ctx.moveTo(Math.cos(i * 0.785) * 3, Math.sin(i * 0.785) * 3); ctx.lineTo(Math.cos(i * 0.785) * r * (1.4 - a * 0.4), Math.sin(i * 0.785) * r * (1.4 - a * 0.4)) }
      ctx.stroke(); ctx.restore()
    }
    for (const p of parts) {
      ctx.globalAlpha = Math.min(1, p.life * 3)
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a)
      ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = 0.9
      const r = 2.2 + (p.max % 1) * 2
      ctx.beginPath()
      if (p.k === 'coin') { ctx.arc(0, 0, r + 0.6, 0, TAU) } else if (p.k === 'leaf') { ctx.ellipse(0, 0, r + 1.4, r * 0.7, 0, 0, TAU) } else if (p.k === 'fur' || p.k === 'wisp' || p.k === 'ember') { ctx.arc(0, 0, r * (p.k === 'ember' ? 0.7 : 1), 0, TAU) } else if (p.k === 'scale' || p.k === 'ice') { ctx.moveTo(0, -r - 1); ctx.lineTo(r, 0); ctx.lineTo(0, r + 1); ctx.lineTo(-r, 0); ctx.closePath() } else { ctx.moveTo(-r, -r * 0.6); ctx.lineTo(r, -r); ctx.lineTo(r * 0.8, r); ctx.lineTo(-r * 0.8, r * 0.7); ctx.closePath() }
      ctx.fill()
      if (p.k !== 'ember' && p.k !== 'wisp') ctx.stroke()
      ctx.restore()
    }
    ctx.globalAlpha = 1
  }

  const hit = (): void => {
    if (dying) return
    slash = 0.24
    flash = 0.16
    spark = 0.14
    hp -= 1
    // a shower of leaves off the crown
    if (mon.kind === 'treant') for (let i = reduced ? 1 : 4; i-- > 0;) parts.push({ x: MON_X + (Math.random() - 0.5) * 24, y: GROUND - 62, vx: (Math.random() - 0.5) * 30, vy: -10 - Math.random() * 20, life: 0.9, max: Math.random() * 2, a: Math.random() * TAU, spin: (Math.random() - 0.5) * 10, k: 'leaf', c: i % 2 ? '#8fd45a' : '#4f9a3e' })
    if (hp > 0) return
    dying = 0.001
    pop = 0.18
    const [k, a, c] = DEBRIS[mon.kind]
    for (let i = reduced ? 6 : 26; i-- > 0;) {
      const ang = Math.random() * TAU
      const v = 30 + Math.random() * 80
      parts.push({ x: MON_X + (Math.random() - 0.5) * 16, y: GROUND - 18 - Math.random() * 20, vx: Math.cos(ang) * v * 0.7 - 10, vy: Math.sin(ang) * v - 40, life: 0.6 + Math.random() * 0.6, max: Math.random() * 2, a: Math.random() * TAU, spin: (Math.random() - 0.5) * 12, k, c: i % 2 ? a : c })
    }
    // splinters of bark
    if (mon.kind === 'treant') for (let i = reduced ? 3 : 12; i-- > 0;) parts.push({ x: MON_X + (Math.random() - 0.5) * 20, y: GROUND - 22, vx: (Math.random() - 0.5) * 110, vy: -20 - Math.random() * 70, life: 0.8, max: 1 + Math.random(), a: Math.random() * TAU, spin: (Math.random() - 0.5) * 14, k: 'rock', c: i % 2 ? '#7a5a3a' : '#c9a070' })
    // the dragon's flame and the demon's sparks ride along
    if (mon.kind === 'dragon' || mon.kind === 'demon') for (let i = reduced ? 3 : 10; i-- > 0;) parts.push({ x: MON_X, y: GROUND - 30, vx: (Math.random() - 0.5) * 70, vy: -30 - Math.random() * 60, life: 0.7, max: Math.random(), a: 0, spin: 0, k: 'ember', c: mon.kind === 'dragon' ? '#ff9a2a' : '#ff4a3a' })
  }

  const size = (): void => {
    const dpr = window.devicePixelRatio || 1
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    if (canvas.width !== w) { canvas.width = w; canvas.height = Math.round(w * H / W) }
  }
  size()
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(size) : null
  ro?.observe(canvas)
  // Any tap, click or key anywhere: only while this screen is up (the teardown removes it).
  const unbind = bindInput(window, hit)
  // The first frame is drawn now, not on the next tick: it is on screen with the page.
  acc = 0.032
  let raf = 0
  loop(last + 1)
  const stop = (): void => {
    cancelAnimationFrame(raf)
    ro?.disconnect()
    unbind()
    ground = null
    live = null
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  live = {
    stop,
    retarget: (c) => {
      ro?.disconnect()
      canvas = c
      ctx = c.getContext('2d')!
      ground = null
      size()
      ro?.observe(c)
      acc = 0.032
    }
  }
  return stop
}
