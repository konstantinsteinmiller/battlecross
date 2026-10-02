import { ENEMY_BY_ID, MINIONS, type EnemyDef } from '../data/enemies'
import { enemyDmg, enemyHp, plainStats, scalePower } from './stats'
import type { Unit } from './types'
import type { Sim } from './world'

/**
 * Create units from the bestiary: enemies at the zone's level, and the hero's
 * summons, whose numbers come from the hero at the moment they are called.
 */

export const spawnEnemy = (sim: Sim, kind: string, x: number, z: number, group = -1, owner: Unit | null = null, levelOffset = 0): Unit | null => {
  const def: EnemyDef | undefined = ENEMY_BY_ID[kind]
  if (!def) return null
  const level = Math.max(1, sim.level + levelOffset)
  const u = sim.addUnit({
    kind,
    team: 1,
    rank: def.rank,
    level,
    x,
    z,
    r: def.r,
    h: def.h,
    s: plainStats({
      hp: enemyHp(level) * def.hp * sim.difficulty,
      dmg: enemyDmg(level) * def.dmg * sim.difficulty,
      armor: def.armor * level,
      resist: def.resist,
      speed: def.speed,
      range: def.range,
      interval: def.interval,
      style: def.style,
      type: def.type,
      heavy: def.heavy
    }),
    group,
    ownerId: owner?.id ?? 0,
    abilityCount: def.abilities.length,
    facing: sim.rng() * Math.PI * 2
  })
  for (let i = 0; i < def.abilities.length; i++) u.cds[i] = def.abilities[i]!.first ?? def.abilities[i]!.cd * 0.5
  // Called in by something already fighting: it joins the fight at once.
  if (owner) {
    u.awake = true
    u.targetId = owner.targetId
  }
  return u
}

/**
 * Summon one of the hero's minions or machines. `life` < 0 lasts until it
 * falls. Health is a share of the hero's; damage a share of the hero's hit
 * (Charisma for the royal troops, Skill for the machines).
 */
export const spawnMinion = (sim: Sim, kind: string, x: number, z: number, life: number): Unit | null => {
  const def = MINIONS[kind]
  const h = sim.hero
  if (!def || !h) return null
  const machine = def.rig === 'turret'
  const hs = h.unit.s
  const hpMul = machine ? 1 : 1 + (hs.mods.minionHp ?? 0)
  const dmg = machine
    ? scalePower(hs, 'skl') * def.dmg
    : hs.baseDmg * def.dmg * h.minionMul
  const s = plainStats({
    hp: hs.maxHp * def.hp * hpMul,
    dmg,
    armor: hs.armor * 0.6,
    speed: def.speed,
    range: def.range,
    interval: def.interval,
    style: def.style,
    type: def.type
  })
  if (!machine) s.attackSpeed = 1 + (hs.mods.minionAttackSpeed ?? 0)
  const u = sim.addUnit({
    kind, team: 0, rank: machine ? 'turret' : 'minion', level: h.level, x, z, r: def.r, h: def.h, s,
    ownerId: h.unit.id, life, facing: h.unit.facing
  })
  u.anim = 'spawn'
  u.animT = 0
  return u
}
