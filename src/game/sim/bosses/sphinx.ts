import { hasLineOfSight, isSolidAt, nearestOpen } from '../grid'
import { addField } from '../actors'
import { applyStatus, heal } from '../combat'
import { spawnEnemy } from '../spawn'
import type { Sim } from '../world'
import type { BossState, Unit } from '../types'
import type { BossScript } from './index'
import { bark, daze, move, other, strikeFor, warn } from './kit'

/**
 * ─── The Sphinx (Sunken Temple, afterplay §5.4) — teaches the puzzle phase ──
 *
 *   100–60 %  a CLAW CONE at whoever comes close, and a SAND BARRAGE: three
 *             circles round the hero, each shown before the sand comes down.
 *   60 %      THE RIDDLE: she flies up out of reach and four pressure plates
 *             round her hall light, each its symbol's colour (sun gold, moon
 *             silver, eye violet, wave teal). She shows a sequence of four,
 *             one plate flaring after the other; the hero steps the plates in
 *             that order while SAND BLADES sweep the floor (each lane shown
 *             first). Right: she falls, dazed 6 s, and takes half again for
 *             10 s. Wrong (or too slow): she heals 8 % and asks again, in a
 *             new order.
 *   30 %      the second riddle, five long, and two sand-spinning acolytes.
 *
 * No words in the riddle: symbols are colours and places, so it reads the
 * same in every language.
 */

const COLOR = '#e8c060'
/** The four symbols, by their colour (the plate's ring and its flare). */
export const SYMBOL_COLOR = ['#ffc23a', '#c8d8ff', '#c87aff', '#3ac8d8'] as const
const PLATE_R = 1.2
const PLATE_DIST = 5
const HIGH = 6
const RISE = 1
/** Seconds each symbol flares while she shows the sequence, and the pause after. */
const SHOW_EACH = 0.8
const SHOW_PAUSE = 0.6
/** The plates' dim glow, laid again every beat. */
const GLOW_BEAT = 1
/** Seconds to step the whole sequence before it counts as wrong. */
const STEP_TIME = 16
const BLADE_EVERY = 3.2
const BLADE_WARN = 1.2
const BLADE_W = 0.8
const BLADE_LEN = 24
const RIGHT_DAZE = 6
const RIGHT_VULN = 10
const WRONG_HEAL = 0.08
const CLAW_R = 4.2
const CLAW_HALF = 0.75
const SAND_R = 1.9
const SAND_WARN = 1.1

/** What the script keeps between steps. */
interface SxState {
  /** The plates: where each symbol lies. */
  px: number[]; pz: number[]
  /** The sequence asked, and how far the hero has stepped it. */
  seq: number[]; at: number
  /** The plate the hero stood on last step (-1: none), so a plate counts once per step onto it. */
  on: number
  showT: number; stepT: number; bladeT: number
  /** Seconds until the plates' dim glow is laid again (it is laid in short beats, never stacked). */
  glowT: number
}
const states = new WeakMap<BossState, SxState>()
const state = (b: BossState): SxState => {
  let s = states.get(b)
  if (!s) {
    s = { px: [], pz: [], seq: [], at: 0, on: -1, showT: 0, stepT: 0, bladeT: 0, glowT: 0 }
    states.set(b, s)
  }
  return s
}

const hitsBuf: Unit[] = []
const open2: [number, number] = [0, 0]

/** The riddle's plates, the four quarters round her home (on open ground). */
const layPlates = (sim: Sim, u: Unit): void => {
  const s = state(u.boss!)
  s.px.length = s.pz.length = 0
  const a0 = sim.rng() * Math.PI * 2
  for (let k = 0; k < 4; k++) {
    let x = u.homeX
    let z = u.homeZ
    for (let r = PLATE_DIST; r >= 2; r -= 0.5) {
      const a = a0 + (k * Math.PI) / 2
      const tx = u.homeX + Math.sin(a) * r
      const tz = u.homeZ + Math.cos(a) * r
      if (!isSolidAt(sim.grid, tx, tz) && hasLineOfSight(sim.grid, u.homeX, u.homeZ, tx, tz)) { x = tx; z = tz; break }
    }
    if (isSolidAt(sim.grid, x, z) && nearestOpen(sim.grid, x, z, open2, 3)) { x = open2[0]; z = open2[1] }
    s.px.push(x)
    s.pz.push(z)
  }
}

/** The plate the hero stands on (-1: none). */
const plateUnder = (s: SxState, h: Unit): number => {
  for (let k = 0; k < s.px.length; k++) if (Math.hypot(h.x - s.px[k]!, h.z - s.pz[k]!) < PLATE_R) return k
  return -1
}

/** A plate glows its colour for `dur` seconds (`flare`: brighter, the sequence being shown). */
const lightPlate = (sim: Sim, u: Unit, k: number, dur: number, flare: boolean): void => {
  const s = state(u.boss!)
  addField(sim, { fx: flare ? 'rune' : 'plate', kind: 'damage', src: u, x: s.px[k]!, z: s.pz[k]!, r: flare ? PLATE_R + 0.3 : PLATE_R, dur, color: SYMBOL_COLOR[k]! })
  if (flare) sim.emit({ t: 'fx', id: 'slam', x: s.px[k]!, z: s.pz[k]!, r: PLATE_R + 0.4, color: SYMBOL_COLOR[k]! })
}

/** A new sequence of `n`: no symbol twice in a row. */
const newSequence = (sim: Sim, s: SxState, n: number): void => {
  s.seq.length = 0
  for (let i = 0; i < n; i++) {
    let k = Math.floor(sim.rng() * 4)
    if (i > 0 && k === s.seq[i - 1]) k = (k + 1 + Math.floor(sim.rng() * 3)) % 4
    s.seq.push(k)
  }
  s.at = 0
  s.on = -1
}

/** She flies up and asks: the plates light, the sequence is shown. */
const ask = (sim: Sim, u: Unit, n: number): void => {
  const b = u.boss!
  const s = state(b)
  if (!s.px.length) layPlates(sim, u)
  b.mode = 'air'
  b.modeT = 0
  b.sub = 'rise'
  b.n = n
  u.action = null
  newSequence(sim, s, n)
  sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 7, color: COLOR })
}

/** The answer is in: she falls dazed (right), or heals and asks again (wrong). */
const answer = (sim: Sim, u: Unit, right: boolean): void => {
  const b = u.boss!
  const s = state(b)
  if (!right) {
    heal(sim, u, u.s.maxHp * WRONG_HEAL)
    sim.emit({ t: 'fx', id: 'heal', x: u.x, z: u.z, unit: u.id, color: COLOR })
    sim.emit({ t: 'fx', id: 'burst:sand', x: sim.hero.unit.x, z: sim.hero.unit.z, r: 1.6, color: COLOR })
    newSequence(sim, s, b.n)
    b.sub = 'show'
    b.modeT = 0
    s.showT = 0
    return
  }
  // Down she comes, right where she hovered: dazed, and open to it.
  b.sub = 'fall'
  b.modeT = 0
  sim.emit({ t: 'fx', id: 'burst:holy', x: u.x, z: u.z, r: 3, color: COLOR })
}

/** Sand barrage: three circles round the hero, the sand comes down on each. */
const barrage = (sim: Sim, u: Unit, tgt: Unit): void => {
  for (let k = 0; k < 3; k++) {
    const a = sim.rng() * Math.PI * 2
    const r = k === 0 ? 0 : 1.6 + sim.rng() * 2
    const x = tgt.x + Math.sin(a) * r
    const z = tgt.z + Math.cos(a) * r
    const delay = SAND_WARN + k * 0.25
    warn(sim, u, { shape: 'circle', x, z, r: SAND_R, w: 0, a: 0, dur: delay })
    sim.after(delay, () => {
      if (!u.alive) return
      sim.emit({ t: 'fx', id: 'quake', x, z, r: SAND_R + 0.3, color: COLOR })
      for (const t of sim.inCircle(other(u), x, z, SAND_R, hitsBuf)) {
        strikeFor(sim, u, t, 1.3)
        applyStatus(sim, t, 'slow', 2, 0.4, u)
      }
    })
  }
}

/** A sand blade across the hall through the hero, its lane shown first. */
const blade = (sim: Sim, u: Unit): void => {
  const h = sim.hero.unit
  const a = sim.rng() * Math.PI
  const dx = Math.sin(a)
  const dz = Math.cos(a)
  const x0 = h.x - dx * (BLADE_LEN / 2)
  const z0 = h.z - dz * (BLADE_LEN / 2)
  warn(sim, u, { shape: 'line', x: x0, z: z0, r: BLADE_LEN, w: BLADE_W, a, dur: BLADE_WARN })
  sim.after(BLADE_WARN, () => {
    if (!u.alive) return
    for (let d = 1; d < BLADE_LEN; d += 2.4) sim.emit({ t: 'fx', id: 'burst:sand', x: x0 + dx * d, z: z0 + dz * d, r: 1, color: COLOR })
    for (const t of sim.inCircle(other(u), h.x, h.z, BLADE_LEN, hitsBuf)) {
      const along = (t.x - x0) * dx + (t.z - z0) * dz
      const across = Math.abs((t.x - x0) * dz - (t.z - z0) * dx)
      if (along < 0 || along > BLADE_LEN || across > BLADE_W + t.r) continue
      strikeFor(sim, u, t, 1.2)
      applyStatus(sim, t, 'knockdown', 0.5, 1, u)
    }
  })
}

const sphinx: BossScript = {
  phases: [0.6, 0.3],
  arena(sim, u) {
    layPlates(sim, u)
  },
  think(sim, u, tgt) {
    const b = u.boss!
    if (!b.marks.includes('bark:intro')) bark(sim, u, 'sphinx', 'intro')
    if (b.next > 0) return false
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    const los = hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)
    if ((b.cd.claw ?? 0) <= 0 && d < CLAW_R) {
      b.cd.claw = b.phase >= 3 ? 4 : 5
      b.next = 1.4
      const act = move(sim, u, 'cone', 0.8, 0.5, tgt)
      warn(sim, u, { shape: 'cone', x: u.x, z: u.z, r: CLAW_R, w: CLAW_HALF, a: act.a, dur: 0.8, wind: 0.8 })
      return true
    }
    if ((b.cd.sand ?? 0) <= 0 && los && d > 2.5 && d < 14) {
      b.cd.sand = b.phase >= 3 ? 6 : 8
      b.next = 1.6
      move(sim, u, 'lob', 0.6, 0.6, tgt)
      return true
    }
    return false
  },
  land(sim, u, act) {
    if (act.id === 'cone') {
      sim.emit({ t: 'fx', id: 'breath', x: u.x, z: u.z, r: CLAW_R, a: act.a, dur: 0.3, color: COLOR })
      for (const t of sim.inCone(other(u), u.x, u.z, act.a, CLAW_R, CLAW_HALF, hitsBuf)) strikeFor(sim, u, t, 1.6)
    } else if (act.id === 'lob') {
      const t = sim.live(act.targetId)
      if (t) barrage(sim, u, t)
    }
  },
  onPhase(sim, u, phase) {
    if (phase === 2) {
      bark(sim, u, 'sphinx', 'riddle')
      ask(sim, u, 4)
    } else if (phase === 3) {
      bark(sim, u, 'sphinx', 'sand')
      // Two acolytes spinning out of the sand.
      for (let i = 0; i < 2; i++) {
        const a = sim.rng() * Math.PI * 2
        const x = u.homeX + Math.sin(a) * 3
        const z = u.homeZ + Math.cos(a) * 3
        if (isSolidAt(sim.grid, x, z)) continue
        const m = spawnEnemy(sim, 'sphinxAcolyte', x, z, u.group, u)
        if (m) { m.awake = true; sim.emit({ t: 'fx', id: 'summon', x, z, color: COLOR }) }
      }
      ask(sim, u, 5)
    }
  },
  air(sim, u, dt) {
    const b = u.boss!
    const s = state(b)
    const t = b.modeT
    // While she asks, the four plates glow dim, each its symbol's colour.
    if (b.sub === 'show' || b.sub === 'step') {
      s.glowT -= dt
      if (s.glowT <= 0) {
        s.glowT = GLOW_BEAT
        for (let k = 0; k < 4; k++) lightPlate(sim, u, k, GLOW_BEAT, false)
      }
    }
    switch (b.sub) {
      case 'rise':
        b.alt = HIGH * Math.min(1, t / RISE)
        if (t >= RISE) {
          b.sub = 'show'
          b.modeT = 0
          s.showT = 0
        }
        return true
      case 'show': {
        // The plates glow dim the while; one flares at a time, in the order asked.
        b.alt = HIGH
        const i = Math.floor(t / SHOW_EACH)
        if (i < s.seq.length && s.showT <= i) {
          s.showT = i + 1
          lightPlate(sim, u, s.seq[i]!, SHOW_EACH * 0.8, true)
        }
        if (t >= s.seq.length * SHOW_EACH + SHOW_PAUSE) {
          b.sub = 'step'
          b.modeT = 0
          s.stepT = STEP_TIME
          s.bladeT = BLADE_EVERY * 0.6
          s.at = 0
          // A hero already on a plate must step off and on again for it to count.
          s.on = plateUnder(s, sim.hero.unit)
        }
        return true
      }
      case 'step': {
        b.alt = HIGH
        s.stepT -= dt
        s.bladeT -= dt
        if (s.bladeT <= 0) { s.bladeT = BLADE_EVERY; blade(sim, u) }
        // Which plate the hero stands on now: a step onto one is the answer to the next symbol.
        const on = plateUnder(s, sim.hero.unit)
        if (on >= 0 && on !== s.on) {
          if (on === s.seq[s.at]) {
            lightPlate(sim, u, on, 0.5, true)
            s.at++
            if (s.at >= s.seq.length) answer(sim, u, true)
          } else answer(sim, u, false)
        }
        s.on = on
        if (b.sub === 'step' && s.stepT <= 0) answer(sim, u, false)
        return true
      }
      case 'fall':
        b.alt = HIGH * Math.max(0, 1 - t / 0.5) ** 1.5
        if (t >= 0.5) {
          b.alt = 0
          b.mode = ''
          b.sub = ''
          sim.emit({ t: 'fx', id: 'quake', x: u.x, z: u.z, r: 3, color: COLOR })
          daze(sim, u, RIGHT_DAZE, 0)
          applyStatus(sim, u, 'vulnerable', RIGHT_VULN, 0.5, u, { quiet: true })
          b.next = 1
        }
        return true
    }
    b.mode = ''
    b.alt = 0
    return false
  },
  botGoal(sim, u) {
    const b = u.boss!
    if (b.mode !== 'air') return null
    const h = sim.hero.unit
    if (b.sub !== 'step') return { x: h.x, z: h.z }
    const s = state(b)
    const k = s.seq[s.at]
    if (k === undefined) return { x: h.x, z: h.z }
    return { x: s.px[k]!, z: s.pz[k]! }
  }
}

export const SPHINX_SCRIPTS: Record<string, BossScript> = { sphinx }
export const SPHINX_TUNING = { PLATE_R, SHOW_EACH, SHOW_PAUSE, STEP_TIME, RIGHT_DAZE, RIGHT_VULN, WRONG_HEAL, CLAW_R, BLADE_WARN, SAND_WARN }
/** The riddle as it stands (tests, the view): the plates, the sequence asked, how far it is stepped. */
export const riddleOf = (u: Unit): { px: readonly number[]; pz: readonly number[]; seq: readonly number[]; at: number } | undefined => {
  const s = u.boss ? states.get(u.boss) : undefined
  return s ? { px: s.px, pz: s.pz, seq: s.seq, at: s.at } : undefined
}
