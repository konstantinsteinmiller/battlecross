import { ENEMY_BY_ID, MINIONS } from '../data/enemies'
import { hasLineOfSight } from './grid'
import { abilityReady, startAbility } from './abilities'
import { face, inAttackRange, setGoal, startAttack, stop, stride, walk } from './actors'
import { isControlled, wakeGroup } from './combat'
import { findStatus, hasStatus, type Sim } from './world'
import type { Unit } from './types'

/**
 * ─── Who does what ───────────────────────────────────────────────────────────
 *
 * Enemies sleep in their packs until the hero comes near (or one of them is
 * hit), then chase, use an ability when one is ready and in range, and
 * otherwise swing. Ranged ones keep their distance. The hero's minions follow
 * him, fight whatever is near, and obey a Command: Focus.
 */

/** Seconds between two abilities of the same unit (so a boss never chains). */
const ABILITY_GAP = 1.4
/** A pack gives up the chase this far from where it stood. */
const LEASH = 26

const pickTarget = (sim: Sim, u: Unit): Unit | null => {
  // Taunted: the taunter, whoever else is closer.
  const taunt = findStatus(u, 'taunt')
  if (taunt) {
    const t = sim.live(taunt.src)
    if (t) return t
  }
  if (hasStatus(u, 'confuse')) return sim.nearest(u.team, u.x, u.z, 9, u.id) ?? null
  const foe = u.team === 0 ? 1 : 0
  const cur = sim.live(u.targetId)
  // A Royal Guard in the way holds attention (GDD: it "taunts enemies").
  if (u.team === 1) {
    let guard: Unit | null = null
    let gd = 4.2
    for (const m of sim.units) {
      if (!m.alive || m.team !== 0 || !MINIONS[m.kind]?.taunts) continue
      const d = Math.hypot(m.x - u.x, m.z - u.z)
      if (d < gd) { gd = d; guard = m }
    }
    if (guard && u.rank !== 'boss') return guard
  }
  if (cur && cur.team === foe && !hasStatus(cur, 'stealth')) return cur
  return sim.nearest(foe, u.x, u.z, 30) ?? null
}

/** One enemy's turn. */
export const stepEnemy = (sim: Sim, u: Unit, dt: number): void => {
  const def = ENEMY_BY_ID[u.kind]
  if (!def) return
  const hero = sim.hero.unit
  if (!u.awake) {
    // Asleep: wake when the hero is seen. A silent hero gets closer first.
    if (!hero.alive || hasStatus(hero, 'stealth')) return
    const reach = def.aggro * (1 - Math.min(0.6, hero.s.mods.stealthy ?? 0))
    const d = Math.hypot(hero.x - u.x, hero.z - u.z)
    if (d < reach && hasLineOfSight(sim.grid, u.x, u.z, hero.x, hero.z)) wakeGroup(sim, u)
    return
  }
  for (let i = 0; i < u.cds.length; i++) if (u.cds[i]! > 0) u.cds[i]! -= dt
  if (u.aiT > 0) u.aiT -= dt
  if (isControlled(u) || u.action) return

  // Bosses change gear at their phase line.
  if (def.phase2 && u.phase === 1 && u.hp <= u.s.maxHp * def.phase2) {
    u.phase = 2
    sim.emit({ t: 'bossPhase', unit: u.id, phase: 2 })
    for (let i = 0; i < def.abilities.length; i++) {
      const a = def.abilities[i]!
      if (a.phase === 2) u.cds[i] = a.first ?? 1
    }
  }

  // Feared: run from whoever scared it.
  const fear = findStatus(u, 'fear')
  if (fear) {
    const from = sim.get(fear.src) ?? hero
    stride(sim, u, u.x - from.x, u.z - from.z, dt)
    u.anim = 'walk'
    return
  }

  const tgt = pickTarget(sim, u)
  if (!tgt) {
    // Nobody to fight (the hero is dead or hidden): drift home.
    if (Math.hypot(u.homeX - u.x, u.homeZ - u.z) > 1.5) {
      if (!u.hasGoal) setGoal(sim, u, u.homeX, u.homeZ)
      u.anim = walk(sim, u, dt, 0.7) ? 'walk' : 'idle'
    } else u.anim = 'idle'
    return
  }
  u.targetId = tgt.id
  const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)

  // Too far from home: a pack does not follow the hero across the map.
  if (sim.mode === 'zone' && u.rank !== 'boss' && Math.hypot(u.homeX - u.x, u.homeZ - u.z) > LEASH && d > 8) {
    u.targetId = 0
    setGoal(sim, u, u.homeX, u.homeZ)
    return
  }

  if (u.aiT <= 0) {
    for (let i = 0; i < def.abilities.length; i++) {
      const a = def.abilities[i]!
      if (!abilityReady(sim, u, a, i, tgt)) continue
      startAbility(sim, u, a, i, tgt)
      u.aiT = ABILITY_GAP
      return
    }
  }

  if (inAttackRange(sim, u, tgt)) {
    stop(u)
    face(u, tgt.x, tgt.z)
    if (u.attackCd <= 0) startAttack(sim, u, tgt, def.windup)
    else if (def.keep && d < def.keep * 0.55) {
      // A shooter with the hero in its face backs off between shots.
      stride(sim, u, u.x - tgt.x, u.z - tgt.z, dt, 0.8)
      face(u, tgt.x, tgt.z)
      u.anim = 'walk'
      return
    }
    if (!u.action) u.anim = 'idle'
    return
  }

  // Close the distance (a shooter only as far as it needs to see and reach).
  u.repathT -= dt
  if (u.repathT <= 0 || !u.hasGoal) {
    u.repathT = 0.45 + sim.rng() * 0.25
    setGoal(sim, u, tgt.x, tgt.z)
  }
  walk(sim, u, dt)
  u.anim = 'walk'
}

/** One of the hero's minions or machines. */
export const stepAlly = (sim: Sim, u: Unit, dt: number): void => {
  const def = MINIONS[u.kind]
  const hero = sim.hero.unit
  if (u.life > 0) {
    u.life -= dt
    if (u.life <= 0) {
      u.hp = 0
      u.alive = false
      u.deadT = 0
      u.anim = 'dead'
      u.animT = 0
      sim.emit({ t: 'death', unit: u.id, x: u.x, z: u.z, kind: u.kind, rank: u.rank, team: u.team })
      return
    }
  }
  if (isControlled(u) || u.action || !def) return

  // Command: Focus names the target; otherwise the nearest threat around the
  // hero (so the guard fights WITH him rather than wandering off).
  const focus = findStatus(u, 'focus')
  let tgt = focus ? sim.live(focus.src) : sim.live(u.targetId)
  if (tgt && tgt.team !== 1) tgt = undefined
  if (!tgt || !tgt.awake) {
    const cx = u.rank === 'turret' ? u.x : hero.x
    const cz = u.rank === 'turret' ? u.z : hero.z
    tgt = undefined
    let bd = u.rank === 'turret' ? def.range + 1 : 10
    for (const e of sim.units) {
      if (!e.alive || e.team !== 1 || !e.awake) continue
      const d = Math.hypot(e.x - cx, e.z - cz)
      if (d < bd) { bd = d; tgt = e }
    }
  }
  if (tgt) {
    u.targetId = tgt.id
    if (inAttackRange(sim, u, tgt)) {
      stop(u)
      face(u, tgt.x, tgt.z)
      if (u.attackCd <= 0) startAttack(sim, u, tgt, def.style === 'melee' ? 0.28 : 0.22)
      if (!u.action) u.anim = 'idle'
      return
    }
    if (u.rank === 'turret') { face(u, tgt.x, tgt.z); u.anim = 'idle'; return }
    u.repathT -= dt
    if (u.repathT <= 0 || !u.hasGoal) {
      u.repathT = 0.4
      setGoal(sim, u, tgt.x, tgt.z)
    }
    walk(sim, u, dt)
    u.anim = 'walk'
    return
  }
  u.targetId = 0
  if (u.rank === 'turret') { u.anim = 'idle'; return }
  // Nothing to fight: keep close to the hero, without crowding him.
  const dh = Math.hypot(hero.x - u.x, hero.z - u.z)
  if (dh > 3.4) {
    u.repathT -= dt
    if (u.repathT <= 0 || !u.hasGoal) {
      u.repathT = 0.5
      // Each follower aims for its own spot behind him.
      const slot = (u.id * 2.39996) % (Math.PI * 2)
      setGoal(sim, u, hero.x + Math.cos(slot) * 2, hero.z + Math.sin(slot) * 2)
    }
    walk(sim, u, dt, dh > 9 ? 1.6 : 1)
    u.anim = 'walk'
  } else {
    stop(u)
    u.anim = 'idle'
  }
}
