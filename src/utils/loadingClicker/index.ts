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
const INK = '#33284a'
const TAU = 6.2832

type Pt = readonly number[]

/** How big each kind stands on the stage. */
const SCALE: Record<MonsterKind, number> = { wolf: 1.15, goblin: 1.5, treant: 1.15, elemental: 1.35, golem: 1.1, dragon: 0.86, demon: 1.12, wraith: 1.25, titan: 0.98 }
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
    lw *= 0.85
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
      ctx.translate(cx - w * 0.16, cy - h * 0.24); ctx.scale(0.5, 0.42); ctx.translate(-cx, -cy)
      build(); ctx.fillStyle = tone(c, 1.16); ctx.fill()
      ctx.restore()
      // a soft rim light along the lit edge
      ctx.save()
      ctx.translate(1.1, 1.1); build()
      ctx.restore()
      ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = lw * 1.6
      ctx.stroke()
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
    if (outline) { ctx.lineWidth = w + 1.9; ctx.strokeStyle = INK; ctx.stroke() }
    ctx.lineWidth = w; ctx.strokeStyle = white ? '#fff' : c; ctx.stroke()
  }
  const dot = (x: number, y: number, r: number, c: string): void => { ctx.fillStyle = white ? '#fff' : c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill() }
  const oval = (x: number, y: number, rx: number, ry: number, c: string): void => { ctx.fillStyle = white ? '#fff' : c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill() }
  /**
   * The game's eye: a big dark gem, its iris lit from below, a catch-light on top; it blinks.
   * `lid`: a foe's scowl, a lid in that colour slanting down to the nose (`side` -1 for the eye on the right).
   */
  const eye = (x: number, y: number, rx: number, ry: number, dark: string, lit: string, lid = '', side = 1): void => {
    if (blink) { L([x - rx, y, x + rx, y], 1.2, INK, false); return }
    oval(x, y, rx, ry, dark)
    oval(x, y + ry * 0.3, rx * 0.8, ry * 0.64, lit)
    oval(x - rx * 0.3, y - ry * 0.38, rx * 0.42, rx * 0.42, '#fff')
    if (lid) { ctx.fillStyle = white ? '#fff' : lid; ctx.beginPath(); ctx.moveTo(x - rx * 1.3, y - ry * 1.25 - side * ry * 0.3); ctx.lineTo(x + rx * 1.3, y - ry * 1.25 + side * ry * 0.3); ctx.lineTo(x + rx * 1.3 * side, y - ry * 0.1); ctx.closePath(); ctx.fill() }
  }
  const glow = (x: number, y: number, r: number, c: string, a: number): void => {
    if (white) return
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, c); g.addColorStop(1, 'transparent')
    ctx.globalAlpha = a; ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill()
    ctx.globalAlpha = 1
  }

  // ── the monsters: origin at their feet, facing left, in the three-quarter view the game shows them in,
  // traced from the game's own rigs (rigs/creatures.ts, looks.ts) and drawn in their colours ──
  const b = (): number => Math.sin(t * 2.4)
  /** Round lumps that read as one mass (a crown of leaves): every outline first, then every fill over them. */
  const blob = (balls: readonly (readonly [number, number, number, string])[]): void => {
    ctx.strokeStyle = INK; ctx.lineWidth = 3.8
    for (const [x, y, r] of balls) { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.92, 0, 0, TAU); ctx.stroke() }
    for (const [x, y, r, c] of balls) E(x, y, r, r * 0.92, c, 0.01)
  }
  /** A tapering, curving horn (or claw, or spike) from a base `w` wide at (x0, y0), bending through (cx, cy) to its tip. */
  const horn = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, w: number, c: string): void => {
    const l = Math.hypot(x1 - x0, y1 - y0) || 1; const nx = (y0 - y1) / l * w / 2; const ny = (x1 - x0) / l * w / 2
    paint(() => { ctx.beginPath(); ctx.moveTo(x0 + nx, y0 + ny); ctx.quadraticCurveTo(cx + nx * 0.6, cy + ny * 0.6, x1, y1); ctx.quadraticCurveTo(cx - nx * 0.6, cy - ny * 0.6, x0 - nx, y0 - ny); ctx.closePath() }, c, (x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) + w, Math.abs(y1 - y0) + w, 1.3)
  }
  const MONSTERS: Record<MonsterKind, () => void> = {
    wolf: () => {
      // The game's wolf: a grey chibi beast, a big head with a long snout, a black nose, a toothy grin and amber
      // eyes under a heavy brow, a fluffy ruff and pale cheeks, a pale chest, a short low barrel with spikes
      // down the back, thick bent legs on paws, the tail curled up and over.
      // Traced from the rig (#160): long and low, the head carried forward at the back's height,
      // the long snout pointing at the hero, the bushy tail streaming out straight behind with a
      // white tip, a row of spikes down the back, four short straight legs under chest and hips.
      const FU = '#8e98ac'; const DK = '#5e6884'; const FAR = '#58607a'; const PA = '#e6eaf2'
      const wag = Math.sin(t * 5) * 0.9
      const st = Math.sin(t * 2.4) * 0.4
      // far legs (front and hind), behind the body
      P([-8.4, -14, -2.4, -14, -3, -2.6, -7.6, -2.6], FAR, 1.2); E(-5.4, -2.2, 3.4, 1.9, FAR, 1.1)
      P([9.6, -14, 15.6, -14, 15, -2.6, 10.4, -2.6], FAR, 1.2); E(12.6, -2.2, 3.4, 1.9, FAR, 1.1)
      ctx.save(); ctx.translate(0, 4)
      // the tail: thick at the rump, out behind and a little up, its tip white
      S([14, -28, 21, -32 + wag * 0.4, 28, -34.4 + wag, 33.4, -31.4 + wag, 32, -25.6 + wag, 25, -23.4 + wag * 0.4, 16, -20], FU, 1.9)
      S([28, -33.6 + wag, 33.4, -31.4 + wag, 32.4, -26.6 + wag, 28.4, -27.4 + wag], '#f4f6fa', 0.01)
      // the body: a long low barrel, the chest deeper than the hips, the belly paler
      S([-12, -26, -6, -31, 4, -31, 13, -29.6, 18, -25, 17.4, -18, 12, -14.4, 2, -14, -6, -13.4, -11.6, -17], FU, 2)
      S([-9, -17, -2, -15.4, 8, -15.4, 13, -16.4, 8, -14.6, -3, -14.2], PA, 0.01)
      for (let i = 0; i < 5; i++) P([-3 + i * 3.6, -30.6 + i * 0.3, -1.6 + i * 3.6, -34.4 + i * 0.3, 0 + i * 3.6, -30.4 + i * 0.3], DK, 0.9)
      ctx.restore()
      // near legs: short straight columns on round paws with white claws, a haunch over the hind one
      P([-11.8, -14, -4.4, -14, -5.2, -2.4, -11, -2.4], FU, 1.5); E(-8, -2, 4, 2.2, '#7a849c', 1.2)
      E(10.6, -16, 5.8, 5.4, FU, 1.6)
      P([6.8, -14, 14.2, -14, 13.6, -2.4, 7.6, -2.4], FU, 1.5); E(10.6, -2, 4, 2.2, '#7a849c', 1.2)
      for (const [x, y] of [[-10.2, -0.6], [-7.6, -0.4], [8, -0.6], [10.6, -0.4]] as const) P([x - 0.6, y - 0.8, x, y + 0.9, x + 0.6, y - 0.8], '#fff', 0.5)
      ctx.save(); ctx.translate(0, 4)
      // the pale ruff at the throat
      S([-15, -24, -10, -26, -7, -21, -9, -16.6, -13, -17.4, -15.4, -20.6], PA, 1.4)
      for (const [x, y] of [[-12, -16.4], [-9, -16], [-15.4, -19]] as const) P([x - 1.4, y - 1.6, x, y + 1.6, x + 1.4, y - 1.6], PA, 0.01)
      // the head, forward and level: ears up, the skull, the long snout with its pale jaw, the black nose
      ctx.save(); ctx.translate(-9, -22 + st + 0.6); ctx.scale(1.2, 1.2); ctx.translate(9, 22)
      P([-18.6, -31, -17.4, -40.6, -13.6, -32], FU, 1.5); P([-17.6, -32, -17, -38, -15, -32.6], '#c08a8a', 0.6)
      P([-13, -32, -10.4, -40, -8.6, -31], FU, 1.5); P([-12, -32.4, -10.4, -37.6, -9.6, -32], '#c08a8a', 0.6)
      S([-21, -27, -19, -33, -12, -34.4, -7, -30, -8, -23, -14, -21, -19.6, -22.6], FU, 2)
      S([-20, -28.4, -26.6, -28, -31.6, -26, -31.4, -21.8, -26, -20.6, -19.6, -21], FU, 1.7)
      S([-30.8, -22.2, -26, -21, -19.6, -21.2, -20.6, -17.8, -25.6, -17.4, -30, -19.6], PA, 1.2)
      L([-30, -22.2, -25, -21.4, -20.6, -21.6], 0.8, INK, false)
      for (const x of [-28.4, -25.6, -23]) P([x - 0.6, -21.8, x, -20.2, x + 0.6, -21.8], '#fff', 0.4)
      E(-31.4, -25.4, 2.2, 1.9, '#1b1626', 0.9)
      eye(-17.4, -28.4, 1.6, 1.8, '#2a2430', '#ff9a1a', FU, 1); eye(-12.6, -28.6, 1.6, 1.7, '#2a2430', '#ff9a1a', FU, -1)
      L([-19.6, -31, -16.4, -30.4], 1.2, '#3a3448', false); L([-14.4, -30.6, -11, -31.4], 1.2, '#3a3448', false)
      ctx.restore()
      ctx.restore()
    },
    goblin: () => {
      // The game's goblin: a bald, round-domed green imp with wide drooping ears, a heavy scowl and fangs, a
      // ragged brown tunic with a gold belt, short bent legs on bare green feet, a dagger held out in the off hand.
      const G = '#7bc74d'; const sw = Math.sin(t * 6) * 0.06
      P([-7, -8, -1.4, -8, -2.2, -5, -2, -2.4, -6.6, -2.4, -7.4, -5], G); E(-5.4, -1.4, 3.4, 1.7, G, 1.3)
      P([1.4, -8, 7, -8, 7.4, -5, 6.6, -2.4, 2, -2.4, 2.2, -5], G); E(4.4, -1.4, 3.4, 1.7, G, 1.3)
      ctx.translate(0, 1.6); ctx.translate(0, -8); ctx.rotate(-0.12); ctx.translate(0, 8)
      P([-5.5, -24.5, 4.5, -24.5, 7, -10, 6.4, -6.4, 4.6, -8.4, 3, -7, 1.4, -9, -0.6, -6.6, -2.6, -8.6, -4, -7.4, -6.2, -8, -7, -10.4], '#8a5a34', 1.6)
      L([-6.2, -12.4, 0, -11.8, 6.4, -12.6], 1.3, '#e0a83a', false)
      L([4.5, -23, 6.5, -19.5], 3, G)
      L([-5, -22.5, -9, -19.8, -10.5, -18.4], 3, G); E(-11.4, -17.8, 2.6, 2.3, G, 1.2)
      // the dagger, held out and up, its blade clear of the body
      ctx.save(); ctx.translate(5.4, -17.6); ctx.rotate(0.06 + sw)
      R(-0.9, -1, 1.8, 4, '#6a4428', 0.8); R(-2.4, -2.4, 4.8, 1.6, '#d9a531', 0.9)
      P([-1.6, -2.4, 1.6, -2.4, 1.3, -11, 0, -13.6, -1.2, -11], '#c4cbe0', 1.2); L([0, -3, 0, -11], 0.6, '#fff', false)
      ctx.restore()
      E(5.4, -17, 2.4, 2.1, G, 1.2)
      ctx.save(); ctx.translate(-3, -22.4); ctx.rotate(-0.16); ctx.scale(0.9, 0.9); ctx.translate(0, 24)
      P([-7.4, -40.4, -13, -39.4 + sw * 10, -8.4, -35.4], G, 1.4); P([-8.4, -39.4, -11.6, -39.4 + sw * 10, -8.8, -36.4], '#d89090', 0.01)
      P([-11.4, -35, -10, -43, -5, -48, 2, -49.4, 9, -48.4, 16, -43, 11, -34, 6.6, -28.6, -2, -24, -7.4, -26, -11, -30], G, 1.9)
      P([7, -43, 23, -42 + sw * 8, 8, -32.6], G, 1.5); P([8.6, -41, 19.6, -41.4 + sw * 8, 9, -35.4], '#d89090', 0.01)
      P([-7.6, -27.8, -4.4, -27.8, -5, -26.4, -7, -26.4], '#3a141c', 0.6)
      P([-7.4, -27.8, -7, -26, -6.6, -27.8], '#f4ecd8', 0.01); P([-5.4, -27.8, -5, -26, -4.6, -27.8], '#f4ecd8', 0.01)
      P([6, -46, 12, -42, 9, -34, 6, -38], '#94d468', 0.01)
      eye(-8.8, -32.6, 1.4, 1.9, '#1e1218', '#7a4a50', '#6cb444', 1); eye(-3.4, -32.6, 2, 2.1, '#1e1218', '#7a4a50', '#6cb444', -1)
      L([-10.8, -37, -8, -35], 1.5, '#2a1a12', false); L([-5.6, -35.2, -0.6, -37.4], 1.8, '#2a1a12', false)
      ctx.restore()
    },
    treant: () => {
      // The game's treant: a tapering barrel of cracked bark under a big crown of rounded leaf clumps with a
      // dark underside and hanging vines, a glare of yellow eyes over a jagged grin, round leaf tufts on the
      // shoulders, long arms hanging to rounded hands of a few thick root claws.
      const sw = Math.sin(t * 1.6)
      const cd = dying ? Math.min(1, dying / 0.45) : 0
      const BK = '#7a5a3a'; const LF = '#4f9a3e'; const LT = '#8fd45a'; const BD = '#5a4228'
      // legs: stumps with root toes
      for (const x of [-5, 5.5]) { P([x - 4.4, -13, x + 4, -13, x + 4.4, -3, x - 4.8, -3], BK, 1.5); for (let i = -1; i <= 1; i++) { ctx.save(); ctx.translate(x, -3); ctx.rotate(i * 0.55); E(0, 2.6, 1.9, 2.6, BK, 1.1); ctx.restore() } }
      // arms hanging low to rounded hands with three thick root claws, a twig with a leaf ball each
      for (const s of [-1, 1]) {
        const x = s * 12
        L([x, -33, x + s * 4, -24, x + s * 5, -18], 5.6, BK)
        L([x + s * 3, -28, x + s * 8 + sw * 0.5, -31], 1.3, BD); E(x + s * 9 + sw * 0.5, -31.6, 2.4, 2.2, LT, 1.2)
        for (let i = 0; i < 3; i++) { horn(x + s * (3 + i * 2.2), -14, x + s * (3 + i * 3.4), -10, x + s * (1.4 + i * 4.4), -7.6 + (i % 2), 2.6, BK); oval(x + s * (1.4 + i * 4.4), -7.8 + (i % 2), 0.9, 0.9, '#a8f070') }
        E(x + s * 5.4, -16, 4.8, 4, BK, 1.6)
      }
      // the trunk, narrowing to the crown, its bark cracks, the face
      P([-6, -42, 5, -42, 10, -36, 11.4, -27, 10, -20, 12, -14, 9.4, -11, 0, -10.4, -10, -11, -12.6, -14, -11, -20, -11.6, -27, -10, -36], BK, 2)
      P([5, -42, 10, -36, 12, -24, 13, -15, 9.4, -11, 7, -24, 5.4, -36], '#4e3820', 0.01); P([-6, -42, -10, -36, -12, -24, -8.6, -24, -6.4, -36], '#94704a', 0.01)
      L([-9, -32, -7.4, -28, -9, -23, -8, -15], 1.5, BD, false); L([8, -33, 9.6, -28, 8.4, -22, 10, -15], 1.5, BD, false); L([-3, -18, -4, -13], 1.3, BD, false); L([1, -19, -0.6, -16, 0.6, -13], 0.9, BD, false); L([-11, -24, -10, -19], 0.8, BD, false); L([4, -36, 5, -33], 0.8, BD, false)
      glow(-6.6, -27, 6, '#ffe07a', 0.55 + 0.15 * b()); glow(0.6, -27, 6, '#ffe07a', 0.55 + 0.15 * b())
      L([-9.6, -30.6, -4.6, -29.4], 1.1, '#3a2818', false); L([-1.6, -29.4, 3.4, -30.6], 1.1, '#3a2818', false); L([-4.2, -32, -3.4, -30], 0.8, '#3a2818', false)
      eye(-6.6, -27, 2.4, 1.7, '#1a1020', '#ffe07a', '#6a4a2c', 1); eye(0.6, -27, 2.4, 1.7, '#1a1020', '#ffe07a', '#6a4a2c', -1)
      P([-7, -22.6, -5.6, -21.4, -4, -22.8, -2.6, -21.6, -1, -22.6, -1.8, -19.6, -3.6, -20.6, -5.2, -19.4, -6.4, -20.6], '#1a1020', 0.8)
      for (let i = 0; i < 3; i++) P([-6.4 + i * 2.2, -22.2, -5.6 + i * 2.2, -20.8, -4.8 + i * 2.2, -22.2], '#d8c090', 0.01)
      L([-3.2, -25, -3.6, -23.4], 0.8, BD, false)
      // the crown: big rounded clumps of leaves over a dark underside, vines hanging, tufts on the shoulders
      ctx.save(); ctx.translate(0, cd * 26); ctx.rotate(cd * 0.5)
      const o = (ph: number): number => Math.sin(t * 1.7 + ph) * 0.6
      blob([[0, -43, 10.6, '#2f6a2a'], [-11 + o(0), -51, 9.6, '#86d058'], [10 + o(1), -49.6, 9.6, '#3f8a36'], [-2 + o(2), -57.6, 9.2, '#9be064'], [8 + o(1), -58, 5.4, '#5aa848']])
      S([-14, -47, -6, -51, 6, -50, 13, -45, 4, -41.6, -10, -42], LF, 0.01)
      for (const [x, l, w] of [[-8.4, 4, 1.1], [4.6, 6, 1]] as const) L([x, -40, x + sw * 0.4, -40 + l * 0.6, x + sw * 0.8 - 0.6, -40 + l], w, LF)
      blob([[-15.5, -33.4, 5.4, '#3f8f38'], [14.6, -32.4, 5.4, '#3f8f38']])
      ctx.restore()
    },
    elemental: () => {
      // The game's fire elemental: a rough lump of dark rock for a head crowned with uneven leaning flames,
      // glaring yellow eyes, on a floating faceted cone of fire burning yellow to red with a glowing core,
      // molten rock fists cracked dark.
      const f = (k: number): number => Math.sin(t * 8 + k) * 1.2
      ctx.translate(0, -2 + b() * 1.5)
      glow(-1, -24, 15, '#ff9a3a', 0.45 + 0.15 * b())
      ctx.save(); ctx.translate(0, -38); ctx.scale(0.9, 0.9); ctx.translate(0, 38)
      for (const [x, h, l] of [[-6, 6, -2], [-3, 13, -1.6], [0, 9, -0.4], [2.4, 15, 0.6], [5.4, 8, 2], [7.6, 11, 3]] as const) { horn(x, -36, x + l, -39 - h / 2, x + l * 1.6 + f(x) * 0.6, -41 - h, 5.4, '#ffc24a'); P([x + l * 0.9 - 1.4, -41 - h * 0.5, x + l * 1.6 + f(x) * 0.6, -41 - h, x + l * 0.9 + 1.4, -41 - h * 0.5], '#ff7a1a', 0.01) }
      ctx.restore()
      // the cone: faceted, a gradient from yellow at the shoulders to red at the point, a lit ridge
      const cone = (): void => { ctx.beginPath(); ctx.moveTo(-11, -27); ctx.quadraticCurveTo(-13, -33, -6, -32.6); ctx.quadraticCurveTo(0, -34, 7, -32.4); ctx.quadraticCurveTo(13, -32, 11.4, -27); ctx.lineTo(0.6, -3); ctx.closePath() }
      cone()
      if (white) ctx.fillStyle = '#fff'
      else { const g = ctx.createLinearGradient(0, -32, 0, -3); g.addColorStop(0, '#ffc040'); g.addColorStop(0.45, '#ff7a1a'); g.addColorStop(1, '#d8381a'); ctx.fillStyle = g }
      ctx.fill()
      if (!white) { ctx.fillStyle = 'rgba(160,30,10,.28)'; ctx.beginPath(); ctx.moveTo(2, -32.6); ctx.lineTo(13, -30.4); ctx.lineTo(0.6, -3); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 0.55; L([-1.4, -32, 0.6, -6], 1.2, '#fff0b0', false); ctx.globalAlpha = 1 }
      if (!white) { const g = ctx.createLinearGradient(-6, -30, 4, -12); g.addColorStop(0, 'rgba(255,240,150,.7)'); g.addColorStop(1, 'rgba(255,240,150,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-7, -30); ctx.lineTo(3, -31); ctx.lineTo(0.6, -8); ctx.closePath(); ctx.fill() }
      cone(); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke()
      glow(-4.4, -21, 5, '#fff4c0', 0.7); oval(-4.4, -21, 1.2, 1.4, '#fffbe8')
      for (const s of [-1, 1]) {
        const x = s === -1 ? -15 : 11
        P([x - 3 * s, -24.5, x - 0.6 * s, -30 + f(s), x + 2 * s, -24], '#ffd27a', 1.1)
        P([x - 5.4, -21, x - 3.6, -25.6, x + 0.4, -26.4, x + 4.6, -24, x + 5.6, -19, x + 2.6, -15, x - 2, -14.6, x - 5, -17], '#f07020', 1.7)
        for (const [dx, dy] of [[-4.6, -4.4], [5, -1.6], [0.4, 5.6]] as const) E(x + dx * s, -20.4 + dy, 1.5, 1.4, '#3a1a14', 0.9)
        oval(x - 1.4 * s, -22.4, 0.6, 0.5, '#ffe080'); oval(x + 1.6 * s, -18.6, 0.5, 0.5, '#ffe080')
      }
      ctx.save(); ctx.translate(0, -38); ctx.scale(0.9, 0.9); ctx.translate(0, 38)
      P([-9.6, -40, -5, -45.4, 2, -46.4, 9.6, -42.4, 11, -35, 7, -30, -3.4, -29.6, -10.4, -34], '#3a1a14', 1.8)
      P([-5, -45.4, 2, -46.4, 9.6, -42.4, 0, -41], '#6e3a28', 0.01); P([-9.6, -40, -5, -45.4, 0, -41, -4, -37], '#52281c', 0.01); P([11, -35, 7, -30, 3, -33, 9.6, -42.4], '#26100c', 0.01)
      P([-6, -43, 0, -44.6, 5, -43.4, 1, -41.4], '#5a2e20', 0.01); P([6, -36, 9.4, -38, 8, -33], '#2a120e', 0.01); P([-9.4, -39, -6.4, -43, -5, -40], '#56281a', 0.01); P([3, -31, 8, -33, 6, -30.4], '#24100c', 0.01)
      if (!blink) { E(-6, -36.2, 1.5, 2.1, '#ffe9a0', 0.8); E(-0.6, -36.1, 2.1, 2.3, '#ffe9a0', 0.8) }
      L([-7.8, -39.6, -5, -38.2], 1.1, '#ffd27a', false); L([-3, -38.4, 1.2, -40.2], 1.1, '#ffd27a', false)
      ctx.restore()
    },
    golem: () => {
      // The game's iron golem: a lumpy hulk of lavender-grey stone in chipped facets, a small head with an ember
      // slit, short chunky boulder legs, boulder shoulders and fists, a rough iron socket round a glowing core.
      const p = 0.5 + 0.5 * b()
      const ST = '#a6a8cc'; const DK = '#3e4268'; const LI = '#c4c6e4'
      // short chunky boulder legs
      P([-15, -18, -5, -18.6, -4, -10, -15.6, -9.4], ST); P([-16.6, -10.6, -3.4, -10.6, -2, -3, -4, -0.6, -15, -0.6, -17.6, -4], ST); P([2.4, -18.6, 13.6, -18, 14.6, -9.4, 3.4, -10], ST); P([1.6, -10.6, 16, -10.6, 17, -4, 15, -0.6, 3, -0.6, 1.4, -4], ST)
      P([-15, -12, -7, -13, -8, -8, -14, -7.6], LI, 0.01); P([4, -13, 12, -12.6, 11.6, -8, 5, -7.6], LI, 0.01)
      L([-16.4, -9, -12, -10.4, -9, -8.4, -3.6, -9.4], 1.2, '#5a5e86', false); L([2.4, -9.4, 8, -8.4, 11, -10.4, 16, -9], 1.2, '#5a5e86', false)
      P([-5, -18, -3.4, -11, -2, -3, -4, -0.6, -6, -0.6, -5.6, -11], '#7c80a8', 0.01); P([14, -17, 16.4, -11, 17, -4, 15, -0.6, 13, -0.6, 13.6, -11], '#7c80a8', 0.01)
      ctx.translate(0, 4)
      // the boulder arms, the lumpy trunk, the fists hanging at the hips, the shoulder slabs
      P([-25, -46, -12, -48, -10, -38, -12, -26, -20, -21, -26, -28, -27, -40], ST, 1.8); P([12, -45, 26, -43, 29, -36, 28, -26, 21, -21, 13, -27, 11, -37], ST, 1.8)
      P([-11, -47, -4, -49, 4, -48, 10, -47, 12.4, -41, 11, -33, 6.6, -26, 4, -21, 3, -17, -2, -17.6, -7, -17, -8.6, -21, -10.6, -26, -13, -35, -14, -41], ST, 2)
      P([-22, -44, -15, -45, -16, -38, -22, -36], LI, 0.01); P([14, -42, 23, -41, 22, -35, 15, -36], LI, 0.01); P([8, -46, 12.4, -41, 11, -33, 6.6, -26, 4, -21, 5, -32], '#5c6088', 0.01)
      P([-30, -25, -25.4, -29, -18.4, -29, -14, -25, -15, -17, -19.4, -13, -26.4, -14, -30, -19], DK, 1.8)
      P([15.6, -28, 21, -31, 28, -29.6, 31, -23, 29, -15.6, 24, -12.6, 18, -14, 15, -20], DK, 1.8)
      P([-30, -17, -24, -15, -19, -13, -27, -12.6], '#3e4266', 0.01); P([16, -14.4, 23, -12.6, 29, -15, 24, -11.6], '#3e4266', 0.01)
      P([-29, -22, -24, -26.6, -18, -25, -24, -21], '#8286aa', 0.01); P([18, -24, 25, -28, 29, -24, 23, -21], '#8286aa', 0.01)
      P([-24, -51, -11, -51.4, -9, -46, -10, -43, -24, -42.6, -25.4, -46], DK, 1.6); P([12, -48, 27, -46.6, 28.6, -42, 27, -39, 12, -40, 10.6, -44], DK, 1.6)
      for (const [x, y] of [[-20, -49], [-16.4, -49.2], [16, -46], [20, -45.6]] as const) oval(x, y, 1, 0.8, LI)
      // the socket: a rough ring of iron round the core
      P([-14.6, -34, -12, -40, -6, -42.6, 1, -41.4, 6.4, -37, 7.6, -30, 5, -23.4, -1, -20, -8, -20.4, -13, -24.4, -15.4, -29], DK, 2)
      P([-11, -33, -8, -37.6, -2, -38.6, 3, -35, 3.6, -28, 0, -23.6, -6, -23.4, -10.4, -27], '#4a4e70', 1)
      glow(-4, -31, 11, '#ff9a2a', 0.45 + 0.25 * p)
      E(-4, -31, 4.6, 5.2, '#ff8f1a', 0.01); oval(-5.2, -33, 1.6, 1.8, '#ffe0a0')
      for (const [x0, y0, x1, y1] of [[-17, -37, -14.6, -34.6], [-1.4, -40, -2, -37], [5, -33, 9, -34], [-7, -21, -7.5, -18]] as const) L([x0, y0, x1, y1], 1.8, '#ffb04a', false)
      P([-7, -55.4, 3, -56.4, 8.4, -53, 9.4, -47, 6, -44, -7, -44.4, -9.6, -48, -9, -52.4], ST, 1.8)
      P([-6, -54, 2, -55, 5, -52.6, -2, -51.6], LI, 0.01)
      glow(-3, -49.5, 5, '#ffb04a', 0.3 + 0.3 * p)
      L([-6.4, -49.8, -0.6, -49.2], 1.8, '#ffb04a', false)
    },
    dragon: () => {
      // The game's void dragon, traced from the rig (#160): a heavy violet body low on short thick
      // legs, lit along its edges in bright purple, a glowing gem on the chest; the head carried
      // forward and level on a short neck, a long flat snout with a pale jaw full of teeth, three
      // pale horns swept back; one bat wing raised high, the other swept back low; a long straight
      // tail streaming out behind, spikes down its length, an arrowhead at its tip.
      const fl = Math.sin(t * 3.2) * 0.05
      const V = '#4a2a8a'; const DV = '#24124a'; const RIM = '#9a4aff'; const MB = '#5a2aa8'
      const sw = Math.sin(t * 2) * 0.8
      // the far wing, swept back low behind the body
      ctx.save(); ctx.translate(4, -36); ctx.rotate(0.06 + fl * 0.5)
      P([0, 0, 20, -6, 42, -8, 38, -2, 31, 2, 22, 1, 12, 5], '#43228a', 1.3)
      L([0, -1, 42, -8], 1.8, DV, false); L([1, -2, 40, -9], 0.8, RIM, false); L([16, -4, 22, 1], 0.8, DV, false); L([30, -6, 31, 2], 0.8, DV, false)
      ctx.restore()
      // the tail: long and straight out behind, a little up, spikes along it, an arrowhead at the tip
      S([12, -30, 24, -34 + sw * 0.3, 40, -38 + sw, 42, -35 + sw, 26, -28 + sw * 0.3, 14, -21], V, 1.8)
      for (let i = 0; i < 4; i++) horn(18 + i * 6, -33 - i * 1.2 + sw * (i / 4), 19 + i * 6, -36 - i * 1.2 + sw * (i / 4), 20 + i * 6, -37.6 - i * 1.2 + sw * (i / 4), 2.4, '#7a4ac8')
      P([39, -40.6 + sw, 49, -37.4 + sw, 40, -32.6 + sw, 42, -36.6 + sw], '#7a4ac8', 1.3)
      // the far legs, behind
      S([-12, -18, -7, -20, -5, -12, -5.6, -1.6, -11, -1.6, -12.4, -10], '#1c0e3a', 1.2)
      S([10, -18, 15, -20, 17, -12, 16.4, -1.6, 11, -1.6, 9.6, -10], '#1c0e3a', 1.2)
      // the body: a heavy low mass, deeper at the chest, darker beneath, lit along the back
      const body = (): void => S([-24, -30, -18, -42, -4, -46, 10, -43, 19, -34, 20, -22, 12, -14, -4, -13, -18, -14, -25, -21], V, 2.2)
      body()
      ctx.save(); body(); ctx.clip()
      if (!white) { ctx.fillStyle = 'rgba(20,8,44,.45)'; ctx.beginPath(); ctx.ellipse(-2, -12, 26, 8, 0, 0, TAU); ctx.fill() }
      L([-24, -24, -21, -38, -8, -45.4, 8, -43.6, 18, -34], 1.3, RIM, false)
      for (let i = 0; i < 4; i++) L([-22 + i * 1.6, -26 + i * 3.4, -14 + i * 2, -25 + i * 3.4], 1.1, '#8a6ac0', false)
      ctx.restore()
      for (let i = 0; i < 6; i++) horn(-12 + i * 4.6, -44.4 + Math.abs(i - 2) * 0.9, -11 + i * 4.6, -47.4 + Math.abs(i - 2) * 0.9, -9.6 + i * 4.6, -49 + Math.abs(i - 2) * 0.9, 2.6, '#7a4ac8')
      glow(-14, -27, 9, '#e8b0ff', 0.8 + 0.2 * b()); E(-14, -27, 3, 3.6, '#d08aff', 0.01); oval(-15, -28.4, 0.9, 1.1, '#f4e0ff')
      // the raised wing, high over the back: a dark leading spar, fingers, the membrane between
      ctx.save(); ctx.translate(-2, -42); ctx.rotate(-fl); ctx.scale(1.3, 1.08)
      P([0, 0, 4, -30, 9, -38, 18, -30, 24, -18, 20, -8, 12, -3], MB, 1.3)
      P([4, -30, 9, -38, 18, -30, 12, -26], '#6a3ab8', 0.01)
      L([0, 0, 4, -30, 9, -38], 2.2, DV, false)
      L([9, -38, 18, -30], 1, DV, false); L([8, -36, 24, -18], 1, DV, false); L([6, -33, 20, -8], 1, DV, false)
      horn(8.4, -37, 9, -40.6, 9.6, -43, 2.6, '#f0eaf8')
      ctx.restore()
      // the near legs: short and thick, a round thigh, claws reaching forward
      for (const [x, k] of [[-16, 0], [8, 1]] as const) {
        S([x - 4, -22, x + 3, -25, x + 9.4, -19, x + 7.4, -9, x + 7, -1, x - 0.4, -1, x - 1.6, -10], '#33205e', 1.4)
        L([x - 1, -19, x + 0.2, -4], 0.9, RIM, false)
        for (let i = 0; i < 3; i++) horn(x + 0.6 + i * 2.4, -1, x - 1 + i * 2.4, -0.4, x - 2.6 + i * 2.4, 0.6, 2, '#f0eaf8')
        void k
      }
      // the head, forward and level on a short neck: three horns swept back, the skull, the long
      // flat snout over a pale toothy jaw, a nostril, a brow over a glowing eye
      S([-26, -38, -20, -42, -14, -38, -14, -28, -22, -26], V, 1.8)
      ctx.save(); ctx.translate(-27, -38); ctx.rotate(-0.03 + fl * 0.4); ctx.scale(1.2, 1.2); ctx.translate(-2, 0)
      horn(2, -6, 8, -13, 19, -15, 5.4, '#eeeaf6'); horn(5, -3, 12, -7, 23, -7, 4.6, '#d8d4e6'); horn(5, 1, 11, 0, 19, 2, 3.6, '#c8c4d8')
      S([-21, -1, -21, -5, -12, -6.6, -6, -9, 2, -10, 8, -6, 8, 2, 2, 6, -8, 6, -20, 3], V, 2)
      S([-21, 2.4, -10, 2.6, 4, 2.6, 2, 7.4, -8, 8, -19, 5.4], '#b8a8d8', 1.4)
      for (let i = 0; i < 6; i++) P([-19 + i * 3.6, 2.4, -18 + i * 3.6, 4.8, -17 + i * 3.6, 2.4], '#fff', 0.01)
      L([-20, -3.4, -10, -5.6, 0, -7.6], 1, RIM, false)
      L([-5, -6.4, 2, -8.2], 1.8, DV, false)
      oval(-19.6, -2.4, 1.3, 0.9, '#1b1626')
      if (!blink) { glow(-1, -3.6, 4, '#e8b0ff', 0.6); oval(-1, -3.6, 1.8, 1.5, '#e8b0ff'); oval(-1.3, -3.9, 0.7, 0.6, '#fff') } else L([-3, -3.6, 1, -3.6], 1, INK, false)
      ctx.restore()
    },
    demon: () => {
      // The game's high demon: a big red chibi with black horns, a broad square-cheeked face with black eye
      // sockets round yellow eyes, fangs, a bare chest tapering to the waist, a gold belt over a black
      // loincloth, wide dark red bat wings and an axe on a wooden haft.
      const fl = Math.sin(t * 3) * 0.08
      const RD = '#e04650'; const WG = '#701a28'
      for (const s of [-1, 1]) {
        ctx.save(); ctx.translate(s < 0 ? -10 : 4, s < 0 ? -33 : -35); ctx.rotate(s * (0.18 + fl)); ctx.scale(s < 0 ? 1.15 : 1.05, s < 0 ? 1.15 : 1.05)
        P([0, -3, s * 6, -9, s * 12, -11, s * 12.6, -2, s * 10.4, 1, s * 10, 5.4, s * 7, 3.4, s * 5, 7, s * 2.6, 3.6, 0, 6], s < 0 ? WG : '#360a12', 1.6)
        for (const [x, y] of [[12, -10], [10.6, 1], [5.4, 6.4]] as const) L([s * 1, -1, s * x, y], 0.9, '#4a0e18', false)
        ctx.restore()
      }
      P([-12, -11, -3.2, -11, -4.6, -3.6, -10.4, -3.6], RD); P([-12.4, -3.6, -3.8, -3.6, -2.6, -0.2, -12.6, -0.2], RD, 1.3)
      P([-3, -11, 5, -11, 3.8, -3.6, -1.6, -3.6], RD); P([-2.2, -3.6, 4.6, -3.6, 6, -0.2, -2.4, -0.2], RD, 1.3)
      ctx.translate(0, -2)
      P([-12, -33, 6, -33, 4, -24, 2.4, -17.6, -9, -17.6, -10.6, -24], RD, 1.9)
      L([-8, -29.4, -4, -27, 0.4, -29.4], 1.1, '#a8243a', false); L([-3.6, -26, -3.6, -19], 1, '#a8243a', false); L([-7, -23, -0.4, -23], 0.9, '#a8243a', false); L([-6.6, -20.4, -0.6, -20.4], 0.9, '#a8243a', false)
      P([-10, -17, 3.6, -17, 4.2, -10, -10.8, -10], '#2a141c', 1.4)
      L([-10, -16.5, -3, -16, 3.6, -16.8], 1.3, '#ffb04a', false)
      L([4, -30, 6.6, -24, 6.4, -21], 5, RD)
      // the axe: a clear wooden haft, a brown iron head with a lit edge
      ctx.save(); ctx.translate(6.4, -19.4); ctx.rotate(-0.12 - fl * 0.5)
      R(-1.1, -12, 2.4, 15, '#a06a3a', 0.9); L([-0.4, -10, -0.4, 1], 0.6, '#d0985a', false)
      P([-1, -17.6, 5.4, -19, 6.6, -12.6, 4.4, -9.4, -1, -10.6], '#6a4030', 1.4); L([5.6, -18, 6.4, -12.6], 0.8, '#c89070', false)
      ctx.restore()
      E(6.4, -19.6, 2.8, 2.8, RD, 1.2)
      L([-10.6, -30, -14, -24, -15.4, -21], 5, RD); E(-15.6, -19.4, 2.8, 2.8, RD, 1.2)
      ctx.save(); ctx.translate(-4, -33); ctx.scale(0.9, 0.9); ctx.translate(4, 33)
      horn(-11, -52, -14.6, -55, -14, -61, 3.6, '#2a1a22'); horn(2.6, -53, 5.6, -56, 5.6, -60.6, 3.4, '#2a1a22')
      S([-16, -44, -14, -52, -5, -55.6, 4, -54, 8.4, -47, 8, -39, 3, -33.4, -5, -31.6, -12, -33.4, -16, -38], RD, 2)
      E(-13.2, -40.5, 2.6, 3.6, '#1b1220', 0.01); E(-5, -40.5, 3.6, 3.8, '#1b1220', 0.01)
      if (!blink) { oval(-13, -40.5, 0.9, 1.6, '#ffd84a'); oval(-4.6, -40.5, 1.3, 1.9, '#ffd84a') }
      L([-14.6, -46, -11.6, -44.4], 1.4, '#2a141c', false); L([-8, -44.4, -3, -46], 1.6, '#2a141c', false)
      P([-9.6, -35.4, -8.8, -32.8, -8, -35.4], '#fff', 0.5); P([-6.8, -35.4, -6, -32.8, -5.2, -35.4], '#fff', 0.5)
      L([-9.6, -35.4, -6, -35.4], 0.6, '#3a141c', false)
      ctx.restore()
    },
    wraith: () => {
      // The game's necromancer: a deep hood with a lit rim shadowing a pale green face, the violet eyes lit, a
      // fang line, a long dark robe from narrow shoulders flaring like a bell to a violet hem, draped sleeves
      // with violet cuffs, pale hands, a long scythe with a broad silver blade held out in the right hand.
      const f = Math.sin(t * 2.6)
      const RB = '#2a2438'; const PU = '#7d5fe0'; const SK = '#c8dcc0'
      ctx.translate(0, f * 1.2)
      S([0, -60, 14, -55, 15.6, -40, 9, -32, -9, -32, -15, -40, -14, -55], RB, 2)
      paint(() => { ctx.beginPath(); ctx.moveTo(-6.6, -34); ctx.quadraticCurveTo(-8.6, -12, -12, -2); ctx.quadraticCurveTo(0, 0.4, 12, -2); ctx.quadraticCurveTo(8, -12, 5.6, -34); ctx.closePath() }, RB, 0, -17, 34, 34, 2)
      paint(() => { ctx.beginPath(); ctx.moveTo(-12, -2); ctx.quadraticCurveTo(0, 0.4, 12, -2); ctx.lineTo(11.4, -5.6); ctx.quadraticCurveTo(0, -3.4, -11.4, -5.6); ctx.closePath() }, PU, 0, -3, 34, 3, 0.01)
      L([-2.6, -28, -2.6, -20], 1.2, PU, false); L([-2.4, -12, -3, -6], 1.2, PU, false); L([-10.6, -16.8, 0, -16, 9.6, -16.8], 1.2, PU, false)
      // draped sleeves, violet cuffs, pale hands
      for (const [x, s] of [[-11, -1], [7.4, 1]] as const) {
        P([x - s * 3, -33, x + s * 2, -32, x + s * 5, -20, x + s * 3, -17.6, x - s * 3.4, -18.4, x - s * 4, -24], RB, 1.4)
        L([x - s * 3.4, -18.6, x + s * 3, -17.8], 1.6, PU, false)
        E(x + s * 0.4, -16.4, 2.3, 2.1, SK, 1.1)
      }
      // the face deep in the hood: shadowed at the brow, the eyes lit
      P([-10, -47, -2, -50, 7, -46, 8, -40, 4, -36, -4, -35.5, -9, -38], SK, 1.4)
      if (!white) { const g = ctx.createLinearGradient(0, -51, 0, -40); g.addColorStop(0, 'rgba(20,14,34,.8)'); g.addColorStop(1, 'rgba(20,14,34,0)'); ctx.fillStyle = g; ctx.fillRect(-11, -51, 20, 11) }
      const hood = (): void => { ctx.beginPath(); ctx.moveTo(-15, -42); ctx.quadraticCurveTo(-12, -58, 0, -59); ctx.quadraticCurveTo(13, -57, 13, -44); ctx.quadraticCurveTo(8, -50, 0, -51); ctx.quadraticCurveTo(-10, -50, -15, -42) }
      hood(); ctx.fillStyle = white ? '#fff' : '#5e5684'; ctx.fill()
      ctx.beginPath(); ctx.moveTo(-15, -42); ctx.quadraticCurveTo(-10, -50, 0, -51); ctx.quadraticCurveTo(8, -50, 13, -44); ctx.lineWidth = 1.1; ctx.strokeStyle = white ? '#fff' : '#5a4e7a'; ctx.stroke()
      glow(-8.6, -42.4, 4.4, '#9f7bff', 0.5); glow(-1.4, -42.4, 4.4, '#9f7bff', 0.5)
      oval(-8.6, -42.4, 2.6, 2.9, '#1b1626'); oval(-1.4, -42.4, 3, 3.1, '#1b1626'); oval(-8.6, -42.4, 2, 2.3, '#9f7bff'); oval(-1.4, -42.4, 2.4, 2.5, '#9f7bff'); oval(-8.6, -42.4, 1.3, 1.5, '#1b1626'); oval(-1.4, -42.4, 1.6, 1.7, '#1b1626')
      if (!blink) { oval(-8.9, -42.8, 0.5, 0.5, '#e8dcff'); oval(-1.8, -42.8, 0.6, 0.6, '#e8dcff') }
      L([-7.2, -38.2, -3.2, -38.2], 0.7, '#3a2a3a', false)
      P([-6.6, -38.3, -6.2, -36.8, -5.8, -38.3], '#fff', 0.01); P([-4.6, -38.3, -4.2, -36.8, -3.8, -38.3], '#fff', 0.01)
      // the scythe held out to the side: the shaft from the right hand up and out, a broad silver blade over
      ctx.save(); ctx.translate(7.4, -17); ctx.rotate(-0.26 + f * 0.02)
      R(-0.8, -32, 1.6, 42, '#a8733f', 0.9)
      horn(0.6, -31, -4, -41, -13, -38.6, 7.6, '#e4eaf2'); L([0, -33, -4.4, -40.6, -12.4, -38.6], 0.8, '#fff', false)
      ctx.restore()
      E(7.4, -16.4, 2.3, 2.1, SK, 1.1)
    },
    titan: () => {
      // The game's frost giant: an ice-blue brute with a round head under a heavy brow, frosty eyes, white horns,
      // a shaggy white beard, a ragged slate tunic tied with a rope, chunky legs, a big spiked wooden club held
      // forward in the right hand.
      const sw = Math.sin(t * 2.2) * 0.04
      const SK = '#94c8ea'; const TU = '#4a6a8c'
      S([-11.6, -14, -3.6, -14, -3.4, -2, -6, -0.4, -12.4, -0.6, -12, -3], SK, 1.6)
      S([0.6, -14, 8.6, -14, 9.4, -3, 8, -0.6, 1.4, -0.4, 0.6, -2], SK, 1.6)
      L([-11.6, -37, -16, -30, -17, -22], 6, SK); E(-17, -21, 3.4, 3.2, SK, 1.3)
      P([-12, -40, 9, -40, 10, -18, 8, -13.6, 5, -16, 2, -13, -1, -16, -4, -13, -7, -16, -10, -13.4, -12.4, -18], TU, 2)
      P([-12.4, -22, 10, -22, 10, -18, 8, -13.6, 5, -16, 2, -13, -1, -16, -4, -13, -7, -16, -10, -13.4, -12.4, -18], '#2a4260', 0.01)
      L([-12, -22.4, -1, -21.4, 10, -22.4], 2.8, '#ffffff')
      L([8, -37, 12, -30, 14, -24], 5.6, SK)
      // the club held forward, spikes out
      ctx.save(); ctx.translate(14.6, -19); ctx.rotate(0.1 + sw); ctx.scale(1.2, 1.2)
      P([-1.6, 3, 1.8, 3, 5, -21, -4.2, -23], '#8a5a34', 1.6)
      P([-4.2, -23, -0.6, -23, -0.4, 3, -1.6, 3], '#6a4428', 0.01)
      for (const [x, y, d] of [[4.4, -14, 1], [-3.4, -11, -1], [3, -20, 1], [-3.8, -19, -1]] as const) horn(x, y, x + d * 1.6, y - 0.6, x + d * 3.6, y - 0.8, 2.4, '#e8f4ff')
      ctx.restore()
      E(14.4, -22.6, 3.6, 3.4, SK, 1.3); L([12.4, -24, 16.4, -24], 0.8, '#5a8ab0', false)
      horn(-12.6, -61, -16.6, -65, -16.6, -71, 4.4, '#eef4fa'); horn(9.4, -61, 12, -65, 11, -71, 4.4, '#eef4fa')
      P([-14.6, -50, -14.6, -60, -15.4, -64.6, -10.6, -62.6, -2, -64.6, 6, -64, 10.6, -62, 12.6, -65, 12.6, -56, 12.6, -51, 9, -42, -2, -39.6, -12, -43], SK, 2.2)
      P([-10, -59, -5, -63.4, 3, -64, 0, -60], '#c4eafc', 0.01)
      P([-14, -43, -9, -41.6, -2, -42, 5, -40, 8, -37, 6, -33, 7, -29, 3, -30, 1, -25, -2, -29, -5, -26, -7, -30, -11, -28, -10, -32, -13.4, -34, -12, -38], '#eef6ff', 1.6)
      L([-10, -37, -8, -32], 0.7, '#b8d4ea', false); L([-3, -37, -2, -30], 0.7, '#b8d4ea', false); L([3, -36, 4, -31], 0.7, '#b8d4ea', false)
      L([-12, -41, -6, -39.4, -1, -41, 3, -39], 1.1, '#c8e2f4', false)
      P([-8, -41.6, -4.8, -42.4, -3.8, -40.4], '#c08870', 0.01); P([-14, -40, -8, -45.6, -3.4, -44, 1.4, -45.6, 6.6, -39.4, 1, -39.4, -3.4, -41.6, -8, -38.6], '#ffffff', 2); L([-3.4, -43.6, -3.4, -41.4], 0.9, '#8ab8da', false)
      P([-13.6, -50.4, -6, -52.6, 3.6, -51.4, 3, -49.4, -6, -50, -13, -48.6], '#7ab4dc', 0.01)
      eye(-8.4, -48, 1.5, 1.5, '#2a3a5a', '#bfe6ff', '', 1); eye(-1.8, -48, 1.7, 1.6, '#2a3a5a', '#bfe6ff', '', -1)
      L([-12, -52.4, -6.4, -50.4], 2.8, '#e8f2fa', false); L([-4.4, -50.4, 2.4, -52.6], 3, '#e8f2fa', false)
    },
  }

  // ── the hero: the game's, facing right (drawn as before the 21 Oct redraw, the owner's pick) ──
  /** The hero's own eye: white, a coloured iris, a pupil, a catch-light; a brow. */
  const heroEye = (x: number, y: number, r: number, iris: string, look = 0, brow = 0, side = 1): void => {
    if (blink) { L([x - r, y, x + r, y], 1.4, INK, false) } else {
      ctx.lineWidth = 1.1
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.1, 0, 0, TAU); ctx.fillStyle = white ? '#fff' : '#fff'; ctx.fill(); ctx.strokeStyle = INK; ctx.stroke()
      dot(x + look, y + 0.2, r * 0.62, iris); dot(x + look, y + 0.2, r * 0.3, INK)
      dot(x + look - r * 0.2, y - r * 0.25, r * 0.2, '#fff')
    }
    if (brow) L([x - r * 1.4 * side, y - r - brow * side, x + r * 1.2 * side, y - r * 1.3 + brow * side], 1.8, INK, false)
  }
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
    heroEye(4.2, -37.5, 2.1, '#5a3a22', 0.8, 0.8)
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
