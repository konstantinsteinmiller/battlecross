import {
  BREACH_S, CATAPULT_FLIGHT, CATAPULT_WIND, CRIES, CRY_FIRST_S, HINT_IDLE_S, LEVER_REACH, PANORAMA_S, RAM_BLOW_GAP, RAM_BLOWS, RAM_CREEP,
  RAM_HALF_X, RAM_HALF_Z, RAM_PUSH, RAM_REACH, RAM_RIDE_Z, RAM_STOP, cryKey, cryPeriod, type Cry
} from '../data/assault'
import { ASSAULT_LAYOUT, BREACH_I0, BREACH_I1, PAL_J, palisadeCells } from './assaultMap'
import { face, setGoal, stop, walk } from './actors'
import { setTempSolid } from './grid'
import { mulberry32 } from './rng'
import { plainStats } from './stats'
import type { Sim } from './world'

/**
 * ─── The siege of the Hollows' gate, as the sim plays it (roadmap #204) ──────
 *
 * Phases: `panorama` (the camera shows the storm; the hero cannot move), `play` (the hero breaks the
 * siege), `breach` (the palisade is down and the party pours into the cave), `done` (the visit hands
 * over to the Hollows proper, or the hero skipped it).
 *
 * Nobody here fights the hero: the rebels (goblins and gnomes) hack at the palisade and fall back, the
 * archers on the towers shoot at them. The hero's part is the catapults' levers and the ram.
 *
 * Everything that moves on its own is a pure function of the state, so a test steps the sim and reads it.
 */

export type AssaultPhase = 'panorama' | 'play' | 'breach' | 'done'

export interface TowerState {
  /** Blows still needed to bring it down (a stone takes all of them). */
  blows: number
  down: boolean
  /** Seconds since it began to fall (-1: standing). */
  fallT: number
  /** A stone is on its way to it. */
  incoming: boolean
  archers: number[]
}

export interface CatapultState {
  state: 'ready' | 'wind' | 'fly' | 'spent'
  /** Seconds in the state. */
  t: number
  /** Seconds the hero has stood at the lever. */
  dwell: number
  /** The tower the stone is on its way to (index). */
  at: number
}

export type RamMode = 'idle' | 'roll' | 'blow' | 'spent'
export interface RamState {
  x: number
  z: number
  mode: RamMode
  t: number
  /** The tower it rolls to or strikes (index). */
  target: number
  /** Blows landed on this tower. */
  blows: number
  /** The hero is under it. */
  riding: boolean
  /** m/s now (eases between the creep and the push). */
  speed: number
  /** The tower this ram is for (index): each has its own, and each is left where it struck. */
  tower: number
  /** Ready to take the hero in again: he has stepped away since the last ride. */
  armed: boolean
}

export type RebelMode = 'run' | 'hack' | 'back' | 'wait' | 'charge' | 'gone'
export interface RebelState {
  unit: number
  who: 'goblin' | 'gnome'
  mode: RebelMode
  t: number
  spot: number
  /** Seconds to the next swing. */
  swing: number
}

export interface AssaultState {
  phase: AssaultPhase
  /** Seconds in the phase. */
  t: number
  /** Play time (seconds since the panorama ended). */
  play: number
  /** Seconds since the hero last did something that helps. */
  idle: number
  towers: TowerState[]
  catapults: CatapultState[]
  /** The ram the hero is at (riding one, else the nearest one still to be used). */
  ram: RamState
  /** Both rams, by tower. */
  rams: RamState[]
  rebels: RebelState[]
  /** The cries: seconds since the last, and how many were made. */
  cries: { t: number; n: number }
  arrowT: number
  /** How it ended: '' while it goes on; 'won' (both towers down), 'skipped' (the hero skipped it). */
  outcome: '' | 'won' | 'skipped'
  /** Seed of the siege's own dice (the sim's are left alone). */
  seed: number
}

const SALT = 0x5ad3c71f
const FALL_S = 2.4

const rebelStats = plainStats({ hp: 100, dmg: 0, speed: 4.3 })

/** The hero's own state once the siege is on: he is never hurt (nobody here aims at him). */
export const armAssault = (sim: Sim, o: { low?: boolean } = {}): void => {
  const L = ASSAULT_LAYOUT
  const rng = mulberry32((sim.seed ^ SALT) >>> 0)
  // The palisade stands until the second tower falls.
  const g = sim.grid
  for (const k of palisadeCells()) setTempSolid(g, k % g.w, Math.floor(k / g.w), true)
  const towers: TowerState[] = L.towers.map((t, q) => {
    const archers: number[] = []
    for (let a = 0; a < (o.low ? 1 : 2); a++) {
      const x = t.x + (a ? 0.55 : -0.55)
      const z = t.z + 0.1
      const u = sim.addUnit({
        kind: 'goblinSlinger', team: 1, rank: 'npc', level: 1, x, z, r: 0.2, h: 1.1,
        s: plainStats({ hp: 100, dmg: 0, speed: 3 }), facing: 0
      })
      // Up on the platform; they stand there until the tower goes.
      u.x = u.px = x
      u.z = u.pz = z
      u.rooted = true
      u.stunt = { lift: t.top, flip: 0 }
      u.facing = 0
      archers.push(u.id)
    }
    return { blows: RAM_BLOWS, down: false, fallT: -1, incoming: false, archers }
  })
  const rebels: RebelState[] = []
  const n = o.low ? 8 : 15
  for (let q = 0; q < n; q++) {
    const who: 'goblin' | 'gnome' = q % 5 === 4 || q % 5 === 2 ? 'gnome' : 'goblin'
    const spot = q % L.storm.length
    const home = L.rally[q % L.rally.length]!
    const u = sim.addUnit({
      kind: who, team: 0, rank: 'npc', level: 1, x: home.x + (rng() - 0.5) * 2, z: home.z + rng() * 2, r: who === 'gnome' ? 0.28 : 0.38,
      h: who === 'gnome' ? 0.85 : 1.15, s: { ...rebelStats }, facing: Math.PI
    })
    rebels.push({ unit: u.id, who, mode: 'run', t: rng() * 1.2, spot, swing: rng() })
    const s = L.storm[spot]!
    setGoal(sim, u, s.x + (rng() - 0.5) * 1.4, s.z)
  }
  const rams: RamState[] = L.rams.map((p, q) => ({ x: p.x, z: p.z, mode: 'idle', t: 0, target: q, blows: 0, riding: false, speed: 0, armed: true, tower: q }))
  sim.assault = {
    phase: 'panorama', t: 0, play: 0, idle: 0, towers,
    catapults: L.catapults.map(c => ({ state: 'ready', t: 0, dwell: 0, at: c.at })),
    ram: rams[0]!, rams,
    rebels, cries: { t: 0, n: 0 }, arrowT: 0.6, outcome: '', seed: (sim.seed ^ SALT) >>> 0
  }
}

/** The siege is over (won or skipped): the visit hands over. */
export const assaultOver = (sim: Sim): boolean => !!sim.assault && sim.assault.phase === 'done'

/** Skip the panorama: the play begins now. */
export const skipPanorama = (sim: Sim): void => {
  const a = sim.assault
  if (a && a.phase === 'panorama') { a.phase = 'play'; a.t = 0 }
}

/** Skip the whole siege ("Skip Siege"): the visit hands over to the Hollows at once. */
export const skipAssault = (sim: Sim): void => {
  const a = sim.assault
  if (!a || a.phase === 'done') return
  a.outcome = 'skipped'
  a.phase = 'done'
  a.t = 0
}

const standing = (a: AssaultState): number => a.towers.filter(t => !t.down).length

/** Bring a tower down (or knock blows off it). */
const hitTower = (sim: Sim, q: number, blows: number): void => {
  const a = sim.assault!
  const t = a.towers[q]!
  if (t.down) return
  t.blows = Math.max(0, t.blows - blows)
  if (t.blows > 0) return
  t.down = true
  t.fallT = 0
  t.incoming = false
  a.idle = 0
  const tw = ASSAULT_LAYOUT.towers[q]!
  sim.emit({ t: 'assault', id: 'tower', n: q, x: tw.x, z: tw.z })
  // The archers lose their footing.
  for (const id of t.archers) {
    const u = sim.get(id)
    if (u) { u.anim = 'stun'; u.animT = 0 }
  }
}

/** Is any catapult's stone (or the ram) still going to a tower other than `except`? */
const spare = (a: AssaultState, except: number): number => {
  for (let q = 0; q < a.towers.length; q++) if (q !== except && !a.towers[q]!.down) return q
  return -1
}

const stepCatapults = (sim: Sim, dt: number): void => {
  const a = sim.assault!
  const h = sim.hero.unit
  a.catapults.forEach((c, q) => {
    const def = ASSAULT_LAYOUT.catapults[q]!
    c.t += dt
    if (c.state === 'ready') {
      const near = a.phase === 'play' && h.alive && !a.rams.some(q => q.riding) && Math.hypot(def.lever.x - h.x, def.lever.z - h.z) <= LEVER_REACH
      c.dwell = near ? c.dwell + dt : 0
      if (c.dwell < 0.35) return
      // Its own tower, or the other when that one is down; none left: nothing to throw at.
      let at = def.at
      if (a.towers[at]!.down || a.towers[at]!.incoming) at = spare(a, at)
      if (at < 0 || a.towers[at]!.incoming) return
      c.state = 'wind'
      c.t = 0
      c.at = at
      a.towers[at]!.incoming = true
      a.idle = 0
      sim.emit({ t: 'assault', id: 'pull', n: q, x: def.x, z: def.z })
    } else if (c.state === 'wind' && c.t >= CATAPULT_WIND) {
      c.state = 'fly'
      c.t = 0
      const tw = ASSAULT_LAYOUT.towers[c.at]!
      sim.emit({ t: 'assault', id: 'stone', n: q, x: def.x, z: def.z, tx: tw.x, tz: tw.z })
    } else if (c.state === 'fly' && c.t >= CATAPULT_FLIGHT) {
      c.state = 'spent'
      c.t = 0
      const tw = ASSAULT_LAYOUT.towers[c.at]!
      sim.emit({ t: 'assault', id: 'impact', n: c.at, x: tw.x, z: tw.z })
      hitTower(sim, c.at, RAM_BLOWS)
    }
  })
}

const stepRams = (sim: Sim, dt: number): void => {
  const a = sim.assault!
  for (const r of a.rams) stepRam(sim, r, dt)
  // The one the hero is at: the one he rides, else the nearest that still has a tower to break.
  const h = sim.hero.unit
  let best = a.rams.find(q => q.riding)
  if (!best) {
    let bd = Infinity
    for (const q of a.rams) {
      if (a.towers[q.tower]!.down || q.mode === 'spent') continue
      const d = Math.hypot(q.x - h.x, q.z - h.z)
      if (d < bd) { bd = d; best = q }
    }
  }
  if (best) a.ram = best
}

const stepRam = (sim: Sim, r: RamState, dt: number): void => {
  const a = sim.assault!
  const hero = sim.hero
  const h = hero.unit
  r.t += dt
  if (r.mode === 'idle') {
    r.riding = false
    r.speed = 0
    if (a.phase !== 'play' || !h.alive || standing(a) === 0) return
    // Each ram is for its own tower: one that has fallen (to a stone) leaves its ram alone.
    if (a.towers[r.tower]!.down) { r.mode = 'spent'; return }
    if (a.towers[r.tower]!.incoming || a.rams.some(q => q.riding)) return
    const away = Math.hypot(r.x - h.x, r.z + RAM_RIDE_Z - h.z)
    // After a ride the hero steps out from under it before it takes him in again.
    if (away > RAM_REACH + 1) r.armed = true
    if (away > RAM_REACH || !r.armed) return
    // Under the ram: it rolls to its own tower.
    const best = r.tower
    r.mode = 'roll'
    r.armed = false
    r.t = 0
    r.target = best
    r.blows = 0
    r.riding = true
    a.idle = 0
    sim.emit({ t: 'assault', id: 'roll', n: best, x: r.x, z: r.z })
    return
  }
  if (r.mode === 'roll') {
    // Its tower fell to a stone on the way: the ram stops where it is, left alone.
    if (a.towers[r.target]!.down) { r.mode = 'spent'; r.riding = false; r.speed = 0; return }
    // Any push on a key or the stick (or a tap to walk) speeds it up.
    const pushed = Math.hypot(hero.stickX, hero.stickZ) > 0.2 || hero.order.kind !== 'none'
    const want = pushed ? RAM_PUSH : RAM_CREEP
    r.speed += (want - r.speed) * Math.min(1, dt * 3.5)
    const f = ASSAULT_LAYOUT.towers[r.target]!.foot
    const dx = f.x - r.x
    const dz = (f.z + RAM_STOP) - r.z
    const d = Math.hypot(dx, dz)
    const step = r.speed * dt
    if (d <= step + 0.05) {
      r.x = f.x
      r.z = f.z + RAM_STOP
      r.mode = 'blow'
      r.t = 0
      r.blows = 0
      r.speed = 0
    } else {
      r.x += (dx / d) * step
      r.z += (dz / d) * step
    }
    return
  }
  if (r.mode === 'blow') {
    // The ram draws back and strikes: a blow at 0.55 s, then one every RAM_BLOW_GAP.
    const due = 0.55 + r.blows * RAM_BLOW_GAP
    if (r.blows < RAM_BLOWS && r.t >= due) {
      r.blows++
      const tw = ASSAULT_LAYOUT.towers[r.target]!
      sim.emit({ t: 'assault', id: 'ram', n: r.blows, x: tw.x, z: tw.z + 1.4 })
      hitTower(sim, r.target, 1)
    }
    if (r.blows >= RAM_BLOWS && r.t >= due + 0.6) {
      // Its work is done: the ram stays where it struck, and the other one is for the other tower.
      r.mode = 'spent'
      r.riding = false
      r.speed = 0
      r.t = 0
    }
  }
}

/**
 * The ram is solid: whoever stands in its box (a goblin running the yard, a gnome, the hero before he takes
 * the handles) is pushed out through the nearest face, so nobody walks through the timber.
 */
const keepOutOfRam = (sim: Sim): void => {
  const a = sim.assault!
  for (const r of a.rams) keepOutOf(sim, r)
}
const keepOutOf = (sim: Sim, r: RamState): void => {
  const cz = r.z + 0.05
  const riderId = r.riding ? sim.hero.unit.id : -1
  for (const u of sim.units) {
    if (!u.alive || u.id === riderId) continue
    const hx = RAM_HALF_X + u.r
    const hz = RAM_HALF_Z + u.r
    const dx = u.x - r.x
    const dz = u.z - cz
    if (Math.abs(dx) >= hx || Math.abs(dz) >= hz) continue
    // The face with the least way out.
    const ox = hx - Math.abs(dx)
    const oz = hz - Math.abs(dz)
    if (ox < oz) u.x = r.x + (dx < 0 ? -hx : hx)
    else u.z = cz + (dz < 0 ? -hz : hz)
    u.px = u.x
    u.pz = u.z
  }
}

const stepRebels = (sim: Sim, dt: number): void => {
  const a = sim.assault!
  const L = ASSAULT_LAYOUT
  const rng = mulberry32((a.seed ^ (Math.floor(sim.time * 8) * 7919)) >>> 0)
  for (const r of a.rebels) {
    const u = sim.get(r.unit)
    if (!u || !u.alive || r.mode === 'gone') continue
    r.t += dt
    if (r.mode === 'charge') {
      // Through the breach, into the cave.
      if (walk(sim, u, dt, 1.25)) { u.anim = 'walk'; continue }
      if (Math.hypot(L.mouth.x - u.x, L.mouth.z - u.z) < 2.2 || r.t > 9) { r.mode = 'gone'; sim.dismiss(u); continue }
      setGoal(sim, u, L.mouth.x + (rng() - 0.5) * 3, L.mouth.z - 2)
      continue
    }
    if (r.mode === 'run') {
      if (walk(sim, u, dt)) { u.anim = 'walk'; if (r.t > 8) { r.mode = 'hack'; r.t = 0 } continue }
      r.mode = 'hack'
      r.t = 0
      r.swing = rng() * 0.5
      stop(u)
    } else if (r.mode === 'hack') {
      face(u, u.x, L.wallZ - 5)
      r.swing -= dt
      if (r.swing <= 0) { u.anim = 'attack'; u.animT = 0; r.swing = 0.62 + rng() * 0.3 }
      if (r.t > 3.2 + rng() * 0.02 * 40) {
        r.mode = 'back'
        r.t = 0
        const home = L.rally[(r.spot + Math.floor(rng() * 5)) % L.rally.length]!
        setGoal(sim, u, home.x + (rng() - 0.5) * 2, home.z + rng() * 1.5)
      }
    } else if (r.mode === 'back') {
      if (walk(sim, u, dt, 0.8)) { u.anim = 'walk'; if (r.t > 8) { r.mode = 'wait'; r.t = 0 } continue }
      r.mode = 'wait'
      r.t = 0
      stop(u)
      u.anim = 'idle'
    } else if (r.mode === 'wait') {
      u.anim = 'idle'
      if (r.t > 1 + rng() * 0.05 * 20) {
        r.mode = 'run'
        r.t = 0
        r.spot = (r.spot + 3 + Math.floor(rng() * 4)) % L.storm.length
        const s = L.storm[r.spot]!
        setGoal(sim, u, s.x + (rng() - 0.5) * 1.4, s.z)
      }
    }
  }
}

const stepArchers = (sim: Sim, dt: number): void => {
  const a = sim.assault!
  const L = ASSAULT_LAYOUT
  a.towers.forEach((t, q) => {
    for (const id of t.archers) {
      const u = sim.get(id)
      if (!u) continue
      if (!t.down) { u.anim = 'idle'; continue }
      // The platform gives way: down they come, and lie dazed in the dust.
      if (u.stunt) {
        const k = Math.min(1, t.fallT / 0.7)
        u.stunt = { lift: L.towers[q]!.top * (1 - k * k), flip: 0 }
        if (k >= 1) u.stunt = undefined
      }
      u.anim = 'stun'
    }
  })
  a.arrowT -= dt
  if (a.arrowT > 0 || a.phase === 'breach' || a.phase === 'done') return
  a.arrowT = 0.5 + ((Math.floor(sim.time * 10) * 2654435761) >>> 0) % 600 / 1000
  const live = a.towers.map((t, q) => ({ t, q })).filter(o => !o.t.down)
  if (!live.length) return
  const from = live[Math.floor(sim.time * 3) % live.length]!
  const hit = a.rebels.filter(r => r.mode === 'hack' || r.mode === 'run')
  const target = hit.length ? sim.get(hit[Math.floor(sim.time * 5) % hit.length]!.unit) : null
  const tw = L.towers[from.q]!
  const tx = target ? target.x : L.storm[Math.floor(sim.time) % L.storm.length]!.x
  const tz = target ? target.z : L.storm[0]!.z
  sim.emit({ t: 'assault', id: 'arrow', n: from.q, x: tw.x, z: tw.z, tx, tz })
  if (target && Math.floor(sim.time * 5) % 3 === 0) target.flinch = 1
}

const stepCries = (sim: Sim, dt: number): void => {
  const a = sim.assault!
  if (a.phase === 'panorama') {
    if (a.t < PANORAMA_S * 0.45) return
  }
  if (a.phase === 'done') return
  a.cries.t += dt
  const need = a.cries.n === 0 ? CRY_FIRST_S : cryPeriod(a.cries.n)
  if (a.cries.t < need) return
  const live = a.rebels.filter(r => r.mode !== 'gone' && sim.get(r.unit)?.alive)
  if (!live.length) return
  const r = live[(a.cries.n * 5 + 1) % live.length]!
  const cry: Cry = CRIES[a.cries.n % CRIES.length]!
  a.cries.t = 0
  a.cries.n++
  sim.emit({ t: 'bark', unit: r.unit, key: cryKey(r.who, cry) })
}

/** The palisade between the towers falls. */
const breach = (sim: Sim): void => {
  const a = sim.assault!
  const g = sim.grid
  for (let i = BREACH_I0; i <= BREACH_I1; i++) setTempSolid(g, i, PAL_J, false)
  a.phase = 'breach'
  a.t = 0
  const L = ASSAULT_LAYOUT
  sim.emit({ t: 'assault', id: 'breach', n: 0, x: L.mouth.x, z: L.wallZ })
  // The party pours in: everyone charges the mouth, one after another.
  a.rebels.forEach((r, q) => {
    const u = sim.get(r.unit)
    if (!u) return
    r.mode = 'charge'
    r.t = -q * 0.18
    setGoal(sim, u, L.mouth.x + (q % 5 - 2) * 1.1, L.mouth.z - 1)
  })
}

/** Every step while the siege is on. */
export const stepAssault = (sim: Sim, dt: number): void => {
  const a = sim.assault
  if (!a || a.phase === 'done') return
  const h = sim.hero
  a.t += dt
  if (a.phase === 'panorama') {
    // The hero stands where he is: the camera has the scene.
    h.stickX = h.stickZ = 0
    h.order = { kind: 'none', targetId: 0, x: h.unit.x, z: h.unit.z }
    if (a.t >= PANORAMA_S) { a.phase = 'play'; a.t = 0 }
  } else if (a.phase === 'play') {
    a.play += dt
    a.idle += dt
  }
  for (const t of a.towers) if (t.down && t.fallT >= 0 && t.fallT < FALL_S + 0.5) t.fallT += dt
  stepCatapults(sim, dt)
  stepRams(sim, dt)
  // Under the ram the hero walks with it, whatever the stick says.
  if (a.ram.riding && h.unit.alive) {
    const u = h.unit
    u.x = a.ram.x
    u.z = a.ram.z + RAM_RIDE_Z
    u.vx = u.vz = 0
    u.facing = Math.PI
    u.anim = 'walk'
    h.order = { kind: 'none', targetId: 0, x: u.x, z: u.z }
  }
  stepRebels(sim, dt)
  keepOutOfRam(sim)
  stepArchers(sim, dt)
  stepCries(sim, dt)
  if (a.phase === 'play' && standing(a) === 0 && a.towers.every(t => t.fallT >= 1.4)) breach(sim)
  else if (a.phase === 'breach') {
    if (a.t >= BREACH_S) { a.phase = 'done'; a.outcome = 'won'; a.t = 0 }
  }
}

/** What the hint should say: the hero idles, so the HUD names the two ways, then points at the nearest. */
export const assaultHint = (a: AssaultState): '' | 'levers' | 'pushing' | 'idle' => {
  if (a.phase !== 'play') return ''
  if (a.ram.riding) return 'pushing'
  return a.idle >= HINT_IDLE_S ? 'idle' : 'levers'
}
