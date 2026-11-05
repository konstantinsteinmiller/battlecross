import { CRIES, cryKey } from '../data/assault'
import {
  FLEE_KEEP, FREE_GAP, FREE_REACH, GUARD_HINT_GAP, GUARD_RADIUS, LEAP_RUNNERS, LEAP_STAB, LOITER_FAR, LOITER_NEAR,
  RUN_GAP, RUN_MAX, RUN_SPEED, STAB_REACH, STAB_S, stampedeShare
} from '../data/rebellion'
import { face, setGoal, stop, stride, walk } from './actors'
import { dealDamage } from './combat'
import { REBEL_KIND } from './rebelHurt'
import { gnomeSpot, type RebelSite } from './rebelSite'
import { spawnMinion } from './spawn'
import { plainStats } from './stats'
import type { Unit } from './types'
import { outOfReach, type Sim } from './world'

/**
 * ─── The gnome rebellion's sim (roadmap #205) ────────────────────────────────
 *
 * The chain gang stands chained at its posts (hand-held `npc` units, like a cage's captives) until the
 * hero walks up with the overseers down. Freed, a gnome is the hero's minion and fights beside him until
 * a blow would leave it under a tenth of its health (`rebelHurt.ts`): it then runs, untouchable, and
 * loiters a few steps behind the hero out of the foes' way. The King's fight calls them back twice
 * (`startStampede`): all of them at its start, five of them when he leaps off Tusker.
 */

export type RebelMode = 'chained' | 'follow' | 'fled' | 'run' | 'stab'

export interface RebelGnome {
  /** The unit's id (it changes once, when the chains snap). */
  unit: number
  mode: RebelMode
  /** Its post's index. */
  q: number
  /** Where it stood in chains. */
  x0: number
  z0: number
  /** Seconds in the mode, and seconds still to wait before setting off on a stampede. */
  t: number
  delay: number
  /** A stampede: whom it runs at, and how much its stab takes (health). */
  target: number
  share: number
}

export interface RebelState {
  site: RebelSite
  gnomes: RebelGnome[]
  /** How many chains have snapped this visit (the stampede's size). */
  freed: number
  /** Seconds the freeing has run (-1: not started), and until the next "guarded" hint. */
  freeing: number
  guardT: number
  /** The stampedes run so far. */
  stampedes: number
}

/** Lay the gang: a gnome chained at each post. */
export const populateRebels = (sim: Sim, site: RebelSite | undefined): void => {
  sim.rebels = null
  if (!site) return
  const gnomes: RebelGnome[] = site.posts.map((p, q) => {
    const at = gnomeSpot(site, q)
    const u = sim.addUnit({
      kind: REBEL_KIND, team: 0, rank: 'npc', level: 1, x: at.x, z: at.z, r: 0.3, h: 0.85,
      s: plainStats({ hp: 1000, dmg: 0, speed: 4.2 }), facing: p.a + Math.PI
    })
    u.rooted = true
    return { unit: u.id, mode: 'chained' as const, q, x0: at.x, z0: at.z, t: 0, delay: 0, target: 0, share: 0 }
  })
  sim.rebels = { site, gnomes, freed: 0, freeing: -1, guardT: 0, stampedes: 0 }
}

/** An awake foe (not a statue, not out of reach) standing near the gang. */
const guarded = (sim: Sim, s: RebelSite): boolean => {
  for (const e of sim.units) {
    if (!e.alive || e.team !== 1 || e.rank === 'npc' || !e.awake || outOfReach(e)) continue
    if (Math.hypot(e.x - s.x, e.z - s.z) <= GUARD_RADIUS) return true
  }
  return false
}

const snap = (sim: Sim, r: RebelState, g: RebelGnome): void => {
  const old = sim.get(g.unit)
  const hero = sim.hero?.unit
  if (!old || !hero) return
  const at = { x: old.x, z: old.z }
  const f = old.facing
  sim.dismiss(old)
  const u = spawnMinion(sim, REBEL_KIND, at.x, at.z, -1, false)
  if (!u) return
  u.facing = f
  g.unit = u.id
  g.mode = 'follow'
  g.t = 0
  r.freed++
  sim.emit({ t: 'rebel', id: 'snap', n: g.q, x: at.x, z: at.z })
}

const enemyNear = (sim: Sim, u: Unit, within: number): Unit | null => {
  let best: Unit | null = null
  let bd = within
  for (const e of sim.units) {
    if (!e.alive || e.team !== 1 || e.rank === 'npc' || !e.awake || outOfReach(e)) continue
    const d = Math.hypot(e.x - u.x, e.z - u.z)
    if (d < bd) { bd = d; best = e }
  }
  return best
}

/** A gnome that ran: out of the foes' way, a few steps behind the hero. */
const stepFled = (sim: Sim, u: Unit, dt: number): void => {
  const hero = sim.hero.unit
  const foe = enemyNear(sim, u, FLEE_KEEP)
  if (foe) {
    stop(u)
    stride(sim, u, u.x - foe.x, u.z - foe.z, dt, 1.5)
    u.anim = 'walk'
    return
  }
  const dh = Math.hypot(hero.x - u.x, hero.z - u.z)
  if (hero.alive && dh > LOITER_FAR) {
    u.repathT -= dt
    if (u.repathT <= 0 || !u.hasGoal) {
      u.repathT = 0.5
      const slot = (u.id * 2.39996) % (Math.PI * 2)
      setGoal(sim, u, hero.x + Math.cos(slot) * LOITER_NEAR, hero.z + Math.sin(slot) * LOITER_NEAR)
    }
    u.anim = walk(sim, u, dt, 1.4) ? 'walk' : 'idle'
    return
  }
  stop(u)
  u.anim = 'idle'
}

const stab = (sim: Sim, g: RebelGnome, u: Unit, tgt: Unit | undefined): void => {
  g.mode = 'stab'
  g.t = 0
  stop(u)
  u.anim = 'attack'
  u.animT = 0
  if (tgt && tgt.alive && !outOfReach(tgt)) {
    face(u, tgt.x, tgt.z)
    dealDamage(sim, null, tgt, g.share, { type: 'true', canCrit: false, echo: true })
    sim.emit({ t: 'rebel', id: 'stab', n: g.q, x: tgt.x, z: tgt.z })
  }
}

/** A runner on its stampede: straight at the King, one stab, and away. */
const stepRun = (sim: Sim, g: RebelGnome, u: Unit, dt: number): void => {
  const tgt = sim.get(g.target)
  g.t += dt
  if (g.delay > 0) { g.delay -= dt; u.anim = 'idle'; return }
  if (!tgt || !tgt.alive) { g.mode = 'fled'; return }
  const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
  if (d <= STAB_REACH + tgt.r || g.t > RUN_MAX) { stab(sim, g, u, tgt); return }
  u.repathT -= dt
  if (u.repathT <= 0 || !u.hasGoal) {
    u.repathT = 0.3
    setGoal(sim, u, tgt.x, tgt.z)
  }
  walk(sim, u, dt, RUN_SPEED)
  u.anim = 'walk'
}

/**
 * The King's fight calls the gnomes: `first` at its start (all of them, together a share of his health
 * that grows with the gang freed), `second` when he leaps off Tusker (up to five, one stab each). One of
 * them screams once for each run.
 */
export const startStampede = (sim: Sim, kind: 'first' | 'second', target: Unit): void => {
  const r = sim.rebels
  if (!r || r.freed <= 0) return
  const pool = r.gnomes.filter(g => g.mode === 'follow' || g.mode === 'fled')
  if (!pool.length) return
  // The frightened first: the ones still fighting stay at the hero's side a moment longer.
  pool.sort((a, b) => (a.mode === 'fled' ? 0 : 1) - (b.mode === 'fled' ? 0 : 1))
  const runners = kind === 'first' ? pool : pool.slice(0, LEAP_RUNNERS)
  const each = kind === 'first' ? (stampedeShare(r.freed) * target.s.maxHp) / runners.length : LEAP_STAB * target.s.maxHp
  runners.forEach((g, i) => {
    const u = sim.get(g.unit)
    if (!u) return
    g.mode = 'run'
    g.t = 0
    g.delay = i * RUN_GAP
    g.target = target.id
    g.share = each
    u.rank = 'npc'
    u.action = null
    u.targetId = 0
    stop(u)
  })
  r.stampedes++
  const cryer = sim.get(runners[0]!.unit)
  if (cryer) sim.emit({ t: 'bark', unit: cryer.id, key: cryKey('gnome', CRIES[kind === 'first' ? 0 : 2]) })
}

/** Every step. */
export const stepRebels = (sim: Sim, dt: number): void => {
  const r = sim.rebels
  if (!r || !sim.hero) return
  const hero = sim.hero.unit
  if (r.guardT > 0) r.guardT -= dt
  // The chains: the hero comes close and the overseers are down; the whole gang is let go, one after the other.
  const chained = r.gnomes.filter(g => g.mode === 'chained')
  if (chained.length) {
    if (r.freeing < 0 && hero.alive && chained.some(g => Math.hypot(hero.x - g.x0, hero.z - g.z0) < FREE_REACH)) {
      if (!guarded(sim, r.site)) r.freeing = 0
      else if (r.guardT <= 0) { r.guardT = GUARD_HINT_GAP; sim.emit({ t: 'rebel', id: 'guarded', n: 0, x: r.site.x, z: r.site.z }) }
    }
    if (r.freeing >= 0) {
      r.freeing += dt
      chained.forEach((g, i) => { if (r.freeing >= i * FREE_GAP) snap(sim, r, g) })
    }
  }
  for (const g of r.gnomes) {
    const u = sim.get(g.unit)
    if (!u) continue
    if (g.mode === 'chained') {
      u.x = u.px = g.x0
      u.z = u.pz = g.z0
      u.anim = 'idle'
      continue
    }
    if (g.mode === 'fled') stepFled(sim, u, dt)
    else if (g.mode === 'run') stepRun(sim, g, u, dt)
    else if (g.mode === 'stab') {
      g.t += dt
      if (g.t >= STAB_S) { g.mode = 'fled'; g.t = 0 }
    }
  }
}
