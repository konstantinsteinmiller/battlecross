import { CELL, hasLineOfSight } from '../grid'
import { addField, cellIndex } from '../actors'
import { applyStatus, removeStatus } from '../combat'
import type { Sim } from '../world'
import type { BossState, Unit } from '../types'
import type { BossScript } from './index'
import { BOSS_HURT } from './hooks'
import { bark, daze, move, other, raiseProps, shatterWallAt, strikeFor, warn } from './kit'

/**
 * ─── The Hydra (Dread Fortress, afterplay §5.6) — teaches burning the stumps ─
 *
 *   all fight  its body is out of reach behind its HEADS: every blow lands on
 *             a head (the weakest first), each with a bar of its own. A head
 *             cut off leaves a STUMP that REGROWS TWO HEADS in 8 s (seven at
 *             most) — unless fire reaches it first: any fire blow on the Hydra
 *             (a fire skill, a burn) sears one stump shut, and a BRAZIER
 *             knocked over (its slam reaching one of the four round the moat)
 *             leaves a burning patch that sears every stump of a Hydra
 *             standing in it. So any build can win: fire, or the braziers.
 *   0 heads    the body sinks, DAZED 6 s and open to blows; then three heads
 *             grow back and the next round begins. A round never takes it
 *             past a phase line: three rounds at the least.
 *   moves      each head in turn: a SLAM (a circle in front of it), a SPIT of
 *             venom or fire (a circle at the hero); more heads, more often.
 *   60 / 30 %  it rages: the heads strike faster.
 */

const COLOR = '#5ac04a'
const PHASES = [0.6, 0.3]
const FIRE = '#ff7a2a'
const START_HEADS = 3
const MAX_HEADS = 7
/** A head's bar, as a share of the body's. */
const HEAD_HP = 0.06
const REGROW = 8
const WINDOW = 7
/** Seconds the new heads take to rise (nothing reaches it the while). */
const RISING = 2.5
const BRAZIERS = 4
const PATCH_R = 2.6
const PATCH_DUR = 12
const SLAM_R = 3
const SLAM_WARN = 0.9
const SPIT_R = 2.2
const SPIT_WARN = 1

/** What the script keeps between steps. */
interface HyState {
  /** Each head's health left. */
  heads: number[]
  /** Each stump's seconds until it regrows. */
  stumps: number[]
  /** Seconds left of the open window (0 heads), and of the new heads rising after it. */
  window: number
  rising: number
  rounds: number
  /** The burning patches the braziers left: where, and seconds left. */
  px: number[]; pz: number[]; pt: number[]
}
const states = new WeakMap<BossState, HyState>()
const state = (b: BossState): HyState => {
  let s = states.get(b)
  if (!s) {
    s = { heads: [], stumps: [], window: 0, rising: 0, rounds: 0, px: [], pz: [], pt: [] }
    states.set(b, s)
  }
  return s
}

const hitsBuf: Unit[] = []

const grow = (u: Unit, s: HyState, n: number): void => {
  for (let i = 0; i < n && s.heads.length < MAX_HEADS; i++) s.heads.push(u.s.maxHp * HEAD_HP)
}

/** A stump seared shut: it will not grow back. */
const sear = (sim: Sim, u: Unit, s: HyState): void => {
  if (!s.stumps.length) return
  s.stumps.shift()
  sim.emit({ t: 'fx', id: 'burst:ember', x: u.x, z: u.z, r: 1.6, color: FIRE })
}

/** A blow on the Hydra: a head takes it, unless the body is down and open. */
const hurt = (sim: Sim, u: Unit, amount: number, type: string): number => {
  const s = state(u.boss!)
  if (type === 'fire') sear(sim, u, s)
  if (s.window > 0) {
    // A round ends at a phase line: the heads grow back, and the next phase begins with them.
    const line = PHASES[u.boss!.phase - 1]
    const floor = line === undefined ? 0 : u.s.maxHp * line
    if (line !== undefined && u.hp - amount <= floor) {
      s.window = 1e-6
      return Math.max(0, u.hp - floor)
    }
    return amount
  }
  if (!s.heads.length || s.rising > 0) return 0
  // The weakest head takes it.
  let k = 0
  for (let i = 1; i < s.heads.length; i++) if (s.heads[i]! < s.heads[k]!) k = i
  s.heads[k]! -= amount
  if (s.heads[k]! <= 0) {
    s.heads.splice(k, 1)
    s.stumps.push(REGROW)
    sim.emit({ t: 'fx', id: 'burst:venom', x: u.x, z: u.z, r: 2, color: COLOR })
    if (!s.heads.length) {
      // No head left: the body sinks, open.
      s.window = WINDOW
      daze(sim, u, WINDOW, 0.5)
      sim.emit({ t: 'fx', id: 'quake', x: u.x, z: u.z, r: 3, color: COLOR })
    }
  }
  return 0
}

/** A brazier knocked over: its burning patch. */
const tip = (sim: Sim, u: Unit, s: HyState, x: number, z: number): void => {
  s.px.push(x)
  s.pz.push(z)
  s.pt.push(PATCH_DUR)
  addField(sim, { fx: 'burning', kind: 'burnGround', src: u, x, z, r: PATCH_R, dur: PATCH_DUR, every: 0.5, dmg: u.s.baseDmg * 0.12, type: 'fire', v: u.s.baseDmg * 0.08, color: FIRE })
  sim.emit({ t: 'fx', id: 'burst:ember', x, z, r: PATCH_R, color: FIRE })
}

const hydra: BossScript = {
  phases: PHASES,
  arena(sim, u) {
    raiseProps(sim, u, 'brazier', BRAZIERS, 6, 8.5)
    grow(u, state(u.boss!), START_HEADS)
  },
  think(sim, u, tgt) {
    const b = u.boss!
    if (!b.marks.includes('bark:intro')) bark(sim, u, 'hydra', 'intro')
    const s = state(b)
    if (!s.heads.length || b.next > 0) return !s.heads.length
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    // More heads, more often; faster as it rages.
    const every = (b.phase >= 3 ? 2.2 : b.phase >= 2 ? 2.7 : 3.2) / Math.sqrt(s.heads.length / START_HEADS)
    if (d < SLAM_R + u.r + 1) {
      b.next = every
      const x = u.x + ((tgt.x - u.x) / Math.max(0.01, d)) * Math.min(d, u.r + 1.2)
      const z = u.z + ((tgt.z - u.z) / Math.max(0.01, d)) * Math.min(d, u.r + 1.2)
      move(sim, u, 'slam', SLAM_WARN, 0.4, tgt, x, z, 1)
      warn(sim, u, { shape: 'circle', x, z, r: SLAM_R, w: 0, a: 0, dur: SLAM_WARN, wind: SLAM_WARN })
      return true
    }
    if (d < 13 && hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)) {
      b.next = every
      move(sim, u, 'lob', SPIT_WARN, 0.3, tgt, tgt.x, tgt.z, 1)
      warn(sim, u, { shape: 'circle', x: tgt.x, z: tgt.z, r: SPIT_R, w: 0, a: 0, dur: SPIT_WARN + 0.5, wind: SPIT_WARN })
      return true
    }
    return false
  },
  land(sim, u, act) {
    const s = state(u.boss!)
    if (act.id === 'slam') {
      sim.emit({ t: 'fx', id: 'slam', x: act.x, z: act.z, r: SLAM_R, color: COLOR })
      for (const t of sim.inCircle(other(u), act.x, act.z, SLAM_R, hitsBuf)) {
        strikeFor(sim, u, t, 1.7)
        applyStatus(sim, t, 'knockdown', 0.6, 1, u)
      }
      // A brazier in reach goes over.
      const r = Math.ceil(SLAM_R / CELL)
      const ci = Math.floor(act.x / CELL)
      const cj = Math.floor(act.z / CELL)
      for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) {
        const x = (i + 0.5) * CELL
        const z = (j + 0.5) * CELL
        if (Math.hypot(x - act.x, z - act.z) > SLAM_R + CELL * 0.5) continue
        if (cellIndex(sim, x, z) < 0) continue
        if (sim.walls.some(w => w.fx === 'brazier' && w.t < w.dur && w.cells[0] === j * sim.grid.w + i) && shatterWallAt(sim, x, z) === 'brazier') tip(sim, u, s, x, z)
      }
    } else if (act.id === 'lob') {
      // Venom or fire, by turns.
      const fire = (u.boss!.n++ % 2) === 1
      const col = fire ? FIRE : COLOR
      sim.emit({ t: 'fx', id: fire ? 'lob:ember' : 'lob:venom', x: u.x, z: u.z, x2: act.x, z2: act.z, dur: 0.5, color: col })
      sim.after(0.5, () => {
        if (!u.alive) return
        sim.emit({ t: 'fx', id: 'quake', x: act.x, z: act.z, r: SPIT_R, color: col })
        for (const t of sim.inCircle(other(u), act.x, act.z, SPIT_R, hitsBuf)) {
          strikeFor(sim, u, t, 1.3, fire ? 'fire' : 'poison')
          applyStatus(sim, t, fire ? 'burn' : 'poison', 3, u.s.baseDmg * 0.15, u, { type: fire ? 'fire' : 'poison', quiet: true })
        }
      })
    }
  },
  onPhase(sim, u, phase) {
    sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 8, color: COLOR })
    if (phase === 2) bark(sim, u, 'hydra', 'heads')
    if (phase === 3) {
      bark(sim, u, 'hydra', 'rage')
      applyStatus(sim, u, 'enrage', 60, 0.25, u)
    }
  },
  tick(sim, u, dt) {
    const s = state(u.boss!)
    // The burning patches: a Hydra standing in one has every stump seared.
    for (let i = s.pt.length - 1; i >= 0; i--) {
      s.pt[i]! -= dt
      if (s.pt[i]! <= 0) { s.px.splice(i, 1); s.pz.splice(i, 1); s.pt.splice(i, 1); continue }
      if (s.stumps.length && Math.hypot(u.x - s.px[i]!, u.z - s.pz[i]!) < PATCH_R + u.r) while (s.stumps.length) sear(sim, u, s)
    }
    // The open window closes: three heads, the next round.
    if (s.window > 0) {
      s.window -= dt
      if (s.window <= 0) {
        s.window = 0
        s.rounds++
        // Up again, if a phase line cut the window short.
        const b = u.boss!
        if (b.mode === 'dazed') { b.mode = ''; removeStatus(u, 'stun'); removeStatus(u, 'vulnerable') }
        s.stumps.length = 0
        s.rising = RISING
        grow(u, s, START_HEADS)
        sim.emit({ t: 'fx', id: 'summon', x: u.x, z: u.z, color: COLOR })
      }
      return
    }
    if (s.rising > 0) s.rising -= dt
    // Stumps not seared grow back two heads each.
    for (let i = s.stumps.length - 1; i >= 0; i--) {
      s.stumps[i]! -= dt
      if (s.stumps[i]! > 0) continue
      s.stumps.splice(i, 1)
      grow(u, s, 2)
      sim.emit({ t: 'fx', id: 'summon', x: u.x, z: u.z, color: COLOR })
    }
    // Its guard: whole while open, nothing reaches the body otherwise (the heads take it, `hurt`).
    u.boss!.guard = 1
  },
  botGoal(sim, u) {
    const s = state(u.boss!)
    if (!s.stumps.length || s.window > 0) return null
    const h = sim.hero.unit
    // A patch burning: stand at its edge, the Hydra comes into it.
    for (let i = 0; i < s.pt.length; i++) {
      if (s.pt[i]! < 2) continue
      const d = Math.max(0.01, Math.hypot(u.x - s.px[i]!, u.z - s.pz[i]!))
      return { x: s.px[i]! + ((s.px[i]! - u.x) / d) * (PATCH_R + 0.8), z: s.pz[i]! + ((s.pz[i]! - u.z) / d) * (PATCH_R + 0.8) }
    }
    // Else by a brazier, on the Hydra's side of it, for its slam to knock over.
    let bx = 0
    let bz = 0
    let bd = Infinity
    for (const w of sim.walls) {
      if (w.fx !== 'brazier' || w.t >= w.dur) continue
      const c = w.cells[0]!
      const x = ((c % sim.grid.w) + 0.5) * CELL
      const z = (Math.floor(c / sim.grid.w) + 0.5) * CELL
      const d = Math.hypot(x - h.x, z - h.z)
      if (d < bd) { bd = d; bx = x; bz = z }
    }
    if (bd === Infinity) return null
    const d = Math.max(0.01, Math.hypot(u.x - bx, u.z - bz))
    return { x: bx + ((u.x - bx) / d) * 1.4, z: bz + ((u.z - bz) / d) * 1.4 }
  }
}

BOSS_HURT.hydra = (sim, u, amount, type) => hurt(sim, u, amount, type)

export const HYDRA_SCRIPTS: Record<string, BossScript> = { hydra }
export const HYDRA_TUNING = { START_HEADS, MAX_HEADS, HEAD_HP, REGROW, WINDOW, PATCH_R, SLAM_R, SLAM_WARN, SPIT_WARN }
/** The heads, stumps and window as they stand (tests, the view). */
export const hydraOf = (u: Unit): { heads: readonly number[]; stumps: readonly number[]; window: number; rounds: number } | undefined => {
  const s = u.boss ? states.get(u.boss) : undefined
  return s ? { heads: s.heads, stumps: s.stumps, window: s.window, rounds: s.rounds } : undefined
}
