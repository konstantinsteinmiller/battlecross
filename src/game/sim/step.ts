import { ENEMY_BY_ID, MINIONS } from '../data/enemies'
import { SKILL_BY_ID } from '../data/skills'
import { resolveAbility } from './abilities'
import { resolveAttack, separate, stepFields, stepProjectiles, stepWalls } from './actors'
import { stepAlly, stepEnemy } from './ai'
import { stepStatuses } from './combat'
import { stepDirector } from './director'
import { stepHero } from './hero'
import { finishOpen } from './interact'
import { HERO_SKILLS } from './heroSkills'
import { stepTownLife } from './townLife'
import type { ZonePlan } from './zoneGen'
import type { Unit } from './types'
import { atPeace, type Sim } from './world'

/**
 * ─── One fixed step of the world ─────────────────────────────────────────────
 *
 * Order matters and is fixed: timers, the hero's decisions, every unit's
 * statuses and action, AI, separation, then projectiles, fields and walls,
 * and last the director (who won?). Deterministic for a given seed and input
 * sequence, which is what the balance tests rely on.
 */

const land = (sim: Sim, u: Unit): void => {
  const a = u.action
  if (!a) return
  if (a.id === 'open') {
    finishOpen(sim)
    return
  }
  if (a.id === 'attack') {
    const fx = u.team === 1 ? ENEMY_BY_ID[u.kind]?.shotFx : MINIONS[u.kind]?.shotFx
    resolveAttack(sim, u, sim.live(a.targetId), 1, fx ?? '')
    return
  }
  if (a.slot >= 0) {
    const def = SKILL_BY_ID[a.id]
    const fn = HERO_SKILLS[a.id]
    if (def && fn) fn({ sim, h: sim.hero, u, def, target: sim.live(a.targetId) ?? null, x: a.x, z: a.z, a: a.a })
    return
  }
  if (a.ability >= 0) resolveAbility(sim, u, a)
}

export const stepSim = (sim: Sim, plan: ZonePlan, dt: number): void => {
  sim.time += dt
  const us = sim.units
  for (let i = 0; i < us.length; i++) {
    const u = us[i]!
    u.px = u.x
    u.pz = u.z
  }
  sim.runTimers()
  if (!sim.ended || sim.ended === 'victory') stepHero(sim, dt)

  // Units summoned during the loop join it on the next step.
  const n = us.length
  for (let i = 0; i < n; i++) {
    const u = us[i]!
    if (!u.alive) {
      u.deadT += dt
      u.animT += dt
      continue
    }
    stepStatuses(sim, u, dt)
    if (!u.alive) continue
    if (u.attackCd > 0) u.attackCd -= dt
    if (u.flinch > 0) u.flinch = Math.max(0, u.flinch - dt * 5)
    u.animT += dt
    const a = u.action
    if (a) {
      a.t += dt
      if (!a.done && a.t >= a.hitAt) {
        a.done = true
        land(sim, u)
      }
      // `land` may have ended the action (a stun reflected back, a death).
      if (u.action === a && a.t >= a.end) {
        u.action = null
        if (u.alive && (u.anim === 'attack' || u.anim === 'cast')) { u.anim = 'idle'; u.animT = 0 }
      }
    }
    if (!u.alive || u.rank === 'hero' || u.rank === 'npc') continue
    // The fight is over either way: nobody presses on.
    // A lost fight, a hero on his way out, or the won main chain's leftovers:
    // nobody presses on. Side packs fight on after a win.
    if (sim.ended === 'defeat' || sim.leaving || atPeace(sim, u)) { if (!u.action) u.anim = 'idle'; continue }
    if (u.team === 1) stepEnemy(sim, u, dt)
    else stepAlly(sim, u, dt)
  }

  if (sim.mode === 'town') stepTownLife(sim, dt)
  separate(sim, dt)
  stepProjectiles(sim, dt)
  stepFields(sim, dt)
  stepWalls(sim, dt)

  const inv = dt > 0 ? 1 / dt : 0
  for (let i = 0; i < us.length; i++) {
    const u = us[i]!
    u.vx = (u.x - u.px) * inv
    u.vz = (u.z - u.pz) * inv
  }
  stepDirector(sim, plan, dt)
  if ((sim.time * 2 | 0) !== ((sim.time - dt) * 2 | 0)) sim.sweep()
}
