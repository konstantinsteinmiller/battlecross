import { ENEMY_BY_ID, MINIONS, type EnemyDef } from '../data/enemies'
import { enemyDmg, enemyHp, heroMight, plainStats, scalePower } from './stats'
import type { Unit } from './types'
import { newBossState } from './bosses/kit'
import type { Sim } from './world'
import { pressureMul } from './pressure'

/**
 * Create units from the bestiary: enemies at the zone's level, and the hero's
 * summons, whose numbers come from the hero at the moment they are called.
 */

/**
 * A foe far above the hero hits harder (GDD pillar 3: an under-levelled hero
 * is in real danger three tiers up). Each level past `OUTMATCH_FREE` above the
 * hero adds `OUTMATCH_STEP` to its damage; a zone at or near the hero's level
 * is untouched, so the reference curve is too.
 */
export const OUTMATCH_FREE = 4
export const OUTMATCH_STEP = 0.15
export const outmatchMul = (enemyLevel: number, heroLevel: number | undefined): number =>
  heroLevel == null ? 1 : 1 + OUTMATCH_STEP * Math.max(0, enemyLevel - heroLevel - OUTMATCH_FREE)

export const spawnEnemy = (sim: Sim, kind: string, x: number, z: number, group = -1, owner: Unit | null = null, levelOffset = 0): Unit | null => {
  const def: EnemyDef | undefined = ENEMY_BY_ID[kind]
  if (!def) return null
  const level = Math.max(1, sim.level + levelOffset)
  // Adaptive pressure (#124): a hero with no trouble meets tougher foes.
  const press = sim.pressure ? pressureMul(sim.pressure.bonus, def.rank === 'boss') : 1
  const outmatch = outmatchMul(level, sim.hero?.level)
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
      hp: enemyHp(level) * def.hp * sim.difficulty * sim.enemyHpMul * press,
      dmg: enemyDmg(level) * def.dmg * sim.difficulty * sim.enemyDmgMul * press * outmatch,
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
  // The Breaking's hordes (an invaded zone): drawn tinted.
  if (sim.invaded) u.infernal = true
  // A scripted boss (#74) carries its script's state.
  if (def.script) u.boss = newBossState(def.script)
  // A helper that burns out (the whistle's gnomes, #136): its time is its `life`.
  if (def.fleeting) u.life = def.fleeting.life
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
  // The hero's level might (#110) is his summons' too.
  const dmg = (machine
    ? scalePower(hs, 'skl') * def.dmg
    : hs.baseDmg * def.dmg * h.minionMul) * heroMight(h.level)
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

/** Spirits a Soul Warden keeps at once: one more sends the oldest home. */
export const SPIRIT_MAX = 5
export const SPIRIT_COLOR = '#7f9cff'

/** One of the hero's spirits: an ENEMY kind fighting on his side. */
export const isSpirit = (m: Unit, owner: Unit): boolean =>
  m.alive && m.team === 0 && m.ownerId === owner.id && !!ENEMY_BY_ID[m.kind] && !MINIONS[m.kind]

/**
 * Soul Warden (#95): the spirit of a fallen — or befriended — enemy fights for
 * the hero for `life` seconds. It keeps its old shape (drawn as a glowing
 * ghost), its reach, its attack style and its damage type, but none of its
 * abilities. Health is a share of the hero's times the kind's own toughness
 * (capped), damage a share of his Intelligence hit times the kind's punch
 * (capped); `mul` scales both (a befriended soul is stronger). Bosses never
 * rise. A body that rises is taken up by its spirit: it is aged past the
 * sweep, so no body rises twice.
 */
export const spawnSpirit = (sim: Sim, from: Unit, life: number, mul = 1): Unit | null => {
  const def = ENEMY_BY_ID[from.kind]
  const h = sim.hero
  if (!def || !h || from.team !== 1 || from.rank === 'boss') return null
  if (!from.alive && from.deadT >= 3) return null
  const hs = h.unit.s
  const band = sim.units.filter(m => isSpirit(m, h.unit))
  if (band.length >= SPIRIT_MAX) band[0]!.life = 0.01
  const s = plainStats({
    hp: hs.maxHp * 0.4 * Math.min(2.5, def.hp) * mul * (1 + (hs.mods.minionHp ?? 0)),
    dmg: scalePower(hs, 'int') * 0.45 * Math.min(1.6, def.dmg) * mul * (1 + (hs.mods.minionDamage ?? 0)) * heroMight(h.level),
    armor: hs.armor * 0.6,
    resist: def.resist,
    speed: Math.max(4, def.speed),
    range: def.range,
    interval: def.interval,
    style: def.style,
    type: def.type
  })
  s.attackSpeed = 1 + (hs.mods.minionAttackSpeed ?? 0)
  const u = sim.addUnit({
    kind: from.kind, team: 0, rank: 'minion', level: h.level, x: from.x, z: from.z, r: def.r, h: def.h, s,
    ownerId: h.unit.id, life, facing: from.facing
  })
  u.anim = 'spawn'
  u.animT = 0
  if (!from.alive) from.deadT = 3.01
  sim.emit({ t: 'fx', id: 'summon', x: u.x, z: u.z, color: SPIRIT_COLOR })
  return u
}

/** How long a spirit risen by Restless Souls (#95) fights. */
export const SOUL_RISE_LIFE = 10
