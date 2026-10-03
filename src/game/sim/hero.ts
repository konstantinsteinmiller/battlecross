import { statPower } from '../data/attributes'
import { HEAT_DECAY, SKILL_BY_ID, type SkillDef } from '../data/skills'
import { MANA_POTION, POTION_HEAL } from '../data/loot'
import { hasLineOfSight } from './grid'
import { face, fire, inAttackRange, setGoal, setHeroOnHit, startAttack, stop, stride, walk } from './actors'
import { applyStatus, cdrOf, cleanse, dealDamage, giveMana, heal, isControlled, attackSpeedOf } from './combat'
import { FREE_AIM, addHeat } from './heroSkills'
import { CHEST_REACH, beginOpen, cancelOpen, chestLock } from './interact'
import { heroStats, minionMul, type HeroBuild } from './stats'
import { angleTo, atPeace, findStatus, hasStatus, newAction, type HeroState, type Sim } from './world'
import type { Unit } from './types'

/**
 * ─── The hero ────────────────────────────────────────────────────────────────
 *
 * Orders (walk there, fight that), the stick, casting with its targeting
 * rules, potions, heat, and the on-hit effects of his weapon.
 *
 * Targeting, in the order a cast resolves it (GDD §7):
 *   1. where the skill button was DRAGGED to, if it was;
 *   2. the locked target;
 *   3. the nearest enemy in reach.
 * An out-of-range enemy skill walks the hero into range and casts on arrival
 * (unless the player gives another order first).
 */

export { POTION_HEAL }
export const POTION_CD = 6
/** The hero's swing lands this far into its interval. */
const WINDUP = 0.24
/** With nothing ordered, he engages an awake enemy this close. */
const AUTO_ENGAGE = 3.2

export interface HeroInit {
  build: HeroBuild
  /** The six active slots. */
  skills: string[]
  x: number
  z: number
  xpInto: number
  potions: number
  /** Mana potions carried in, and how many the belt holds (default: none, the health belt's size). */
  manaPotions?: number
  manaPotionsMax?: number
}

export const createHero = (sim: Sim, o: HeroInit): HeroState => {
  const s = heroStats(o.build)
  const unit = sim.addUnit({ kind: 'hero', team: 0, rank: 'hero', level: o.build.level, x: o.x, z: o.z, r: 0.45, h: 1.45, s, facing: Math.PI })
  const skills = [...o.skills]
  while (skills.length < 6) skills.push('')
  const h: HeroState = {
    unit,
    build: o.build,
    skills,
    cd: [0, 0, 0, 0, 0, 0],
    cdMax: [1, 1, 1, 1, 1, 1],
    heat: 0,
    overheatT: 0,
    usesHeat: skills.some(id => SKILL_BY_ID[id]?.cls === 'aether'),
    potions: o.potions,
    potionsMax: o.potions,
    potionCd: 0,
    manaPotions: Math.max(0, o.manaPotions ?? 0),
    manaPotionsMax: Math.max(o.manaPotions ?? 0, o.manaPotionsMax ?? o.potions),
    manaPotionCd: 0,
    order: { kind: 'none', targetId: 0, x: o.x, z: o.z },
    queued: null,
    stickX: 0,
    stickZ: 0,
    history: [],
    historyT: 0,
    xp: 0,
    gold: 0,
    kills: 0,
    items: [],
    chests: 0,
    opening: -1,
    dealt: 0,
    taken: 0,
    minionMul: minionMul(s.power.cha, s.mods),
    level: o.build.level,
    xpInto: o.xpInto
  }
  sim.hero = h
  return h
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orderMove = (sim: Sim, x: number, z: number): void => {
  const h = sim.hero
  h.order.kind = 'move'
  h.order.targetId = 0
  h.order.x = x
  h.order.z = z
  h.queued = null
  h.unit.targetId = 0
  cancelSwing(h.unit)
  setGoal(sim, h.unit, x, z)
}

export const orderAttack = (sim: Sim, targetId: number): void => {
  const h = sim.hero
  const t = sim.live(targetId)
  if (!t) return
  // After a win only a side pack is left to fight.
  if (t.team === 1 && (atPeace(sim, t) || sim.ended === 'defeat' || sim.leaving)) return
  h.order.kind = t.team === 1 ? 'attack' : 'interact'
  h.order.targetId = targetId
  h.queued = null
  h.unit.targetId = t.team === 1 ? targetId : 0
}

export const orderStop = (sim: Sim): void => {
  const h = sim.hero
  h.order.kind = 'none'
  h.order.targetId = 0
  h.queued = null
  stop(h.unit)
}

/** The stick or the keys, in world space. Zero when released. */
export const setStick = (sim: Sim, x: number, z: number): void => {
  sim.hero.stickX = x
  sim.hero.stickZ = z
}

/** A basic swing that has not landed yet is dropped when the hero moves. */
const cancelSwing = (u: Unit): void => {
  if (u.action && u.action.id === 'attack' && !u.action.done) {
    u.action = null
    u.attackCd = Math.min(u.attackCd, 0.15)
  }
}

/** Lock the next enemy round the hero (Tab; a tap on the target frame). */
export const cycleTarget = (sim: Sim): void => {
  const h = sim.hero
  const u = h.unit
  const foes = sim.units
    .filter(e => e.alive && e.team === 1 && e.awake && Math.hypot(e.x - u.x, e.z - u.z) < 16)
    .sort((a, b) => Math.hypot(a.x - u.x, a.z - u.z) - Math.hypot(b.x - u.x, b.z - u.z))
  if (!foes.length) return
  const i = foes.findIndex(e => e.id === h.order.targetId)
  orderAttack(sim, foes[(i + 1) % foes.length]!.id)
}

// ─── Casting ─────────────────────────────────────────────────────────────────

export interface SlotState {
  def: SkillDef | undefined
  ready: boolean
  noMana: boolean
  locked: boolean
  cd: number
  cdMax: number
  manaCost: number
}

export const manaCostOf = (u: Unit, def: SkillDef): number => Math.round(def.mana * (1 - u.s.manaDiscount))

export const slotState = (sim: Sim, slot: number): SlotState => {
  const h = sim.hero
  const def = SKILL_BY_ID[h.skills[slot] ?? '']
  const cd = h.cd[slot] ?? 0
  const cdMax = h.cdMax[slot] ?? 1
  if (!def) return { def, ready: false, noMana: false, locked: false, cd: 0, cdMax: 1, manaCost: 0 }
  const manaCost = manaCostOf(h.unit, def)
  const noMana = h.unit.mana < manaCost
  // Overheated: everything that builds heat is locked. Venting is the way out.
  const locked = isControlled(h.unit) || (h.overheatT > 0 && (def.heat ?? 0) > 0)
  return { def, ready: cd <= 0 && !noMana && !locked && h.unit.alive, noMana, locked, cd, cdMax, manaCost }
}

/**
 * Cast the skill in a slot. `aim` is the ground point the button was dragged
 * to (null for a plain tap). Returns whether the cast began (or was queued).
 */
export const castSkill = (sim: Sim, slot: number, aim: { x: number; z: number } | null): boolean => {
  const h = sim.hero
  const u = h.unit
  const st = slotState(sim, slot)
  const def = st.def
  if (!def || !u.alive || sim.ended === 'defeat' || sim.leaving) return false
  if (st.cd > 0) { sim.emit({ t: 'denied', why: 'cooldown' }); return false }
  if (st.locked) { sim.emit({ t: 'denied', why: 'locked' }); return false }
  if (st.noMana) { sim.emit({ t: 'denied', why: 'mana' }); return false }
  if (def.hpCost && u.hp <= 2) { sim.emit({ t: 'denied', why: 'hp' }); return false }
  if (u.action && u.action.id !== 'attack') return false

  let target: Unit | null = null
  let x = u.x
  let z = u.z
  if (def.target === 'enemy') {
    if (aim) target = sim.pick(1, aim.x, aim.z, 1.6) ?? null
    if (!target && !aim) target = sim.live(h.order.targetId) ?? sim.live(u.targetId) ?? null
    if (target && target.team !== 1) target = null
    if (!target && !aim) target = sim.nearest(1, u.x, u.z, def.range + 5) ?? null
    if (!target) {
      if (!aim || !FREE_AIM.has(def.id)) { sim.emit({ t: 'denied', why: 'target' }); return false }
      x = aim.x
      z = aim.z
    } else {
      x = target.x
      z = target.z
      const d = Math.hypot(x - u.x, z - u.z) - target.r
      const blocked = def.range > 3 && !hasLineOfSight(sim.grid, u.x, u.z, x, z)
      if (d > def.range || blocked) {
        // Walk into range (and sight) first; the cast follows on arrival.
        h.queued = { slot, targetId: target.id, x, z, aimed: false }
        h.order.kind = 'attack'
        h.order.targetId = target.id
        u.targetId = target.id
        return true
      }
    }
  } else if (def.target === 'ground' || def.target === 'dir') {
    const locked = sim.live(h.order.targetId) ?? sim.live(u.targetId)
    if (aim) { x = aim.x; z = aim.z } else if (locked && locked.team === 1) { x = locked.x; z = locked.z } else {
      const near = sim.nearest(1, u.x, u.z, def.range + 3)
      if (near && near.awake) { x = near.x; z = near.z } else {
        x = u.x + Math.sin(u.facing) * Math.min(def.range, 4)
        z = u.z + Math.cos(u.facing) * Math.min(def.range, 4)
      }
    }
    // Out of reach: the point is pulled in to the edge of the range.
    const d = Math.hypot(x - u.x, z - u.z)
    if (def.target === 'ground' && d > def.range && d > 1e-3) {
      x = u.x + ((x - u.x) / d) * def.range
      z = u.z + ((z - u.z) / d) * def.range
    }
  }
  beginCast(sim, slot, def, target, x, z)
  return true
}

const beginCast = (sim: Sim, slot: number, def: SkillDef, target: Unit | null, x: number, z: number): void => {
  const h = sim.hero
  const u = h.unit
  cancelSwing(u)
  stop(u)
  h.queued = null
  if (Math.abs(x - u.x) + Math.abs(z - u.z) > 0.05) face(u, x, z)
  // Paid up front: a cast that is interrupted is still spent.
  u.mana -= manaCostOf(u, def)
  if (def.hpCost) u.hp = Math.max(1, u.hp - u.hp * (def.hpCost / 100))
  const cd = def.cd * (1 - cdrOf(u))
  h.cd[slot] = cd
  h.cdMax[slot] = Math.max(0.1, cd)
  if (def.heat) addHeat(sim, h, def.heat)
  // Entropy: every cast speeds the next ones.
  const ent = u.s.mods.entropy ?? 0
  if (ent > 0) applyStatus(sim, u, 'accelerate', 10, ent, u, { maxStacks: 10, quiet: true })
  const speed = attackSpeedOf(u)
  const windup = def.cast / speed
  u.action = newAction(u, def.id, windup, windup + 0.16, target?.id ?? 0, x, z, -1, slot)
  u.anim = 'cast'
  u.animT = 0
  u.animStyle = def.target === 'self' ? 2 : def.range <= 3 ? 0 : 1
  sim.emit({ t: 'cast', src: u.id, skill: def.id, x: u.x, z: u.z, tx: x, tz: z })
}

export const usePotion = (sim: Sim): boolean => {
  const h = sim.hero
  const u = h.unit
  if (!u.alive || h.potions <= 0 || h.potionCd > 0 || sim.ended === 'defeat' || sim.leaving) { sim.emit({ t: 'denied', why: 'cooldown' }); return false }
  if (u.hp >= u.s.maxHp && !u.statuses.length) { sim.emit({ t: 'denied', why: 'hp' }); return false }
  h.potions--
  h.potionCd = POTION_CD
  heal(sim, u, u.s.maxHp * POTION_HEAL)
  cleanse(u)
  sim.emit({ t: 'potion' })
  sim.emit({ t: 'fx', id: 'heal', x: u.x, z: u.z, unit: u.id, color: '#7dff8a' })
  return true
}

/** Drink a mana potion from the stock: mana back, nothing cleansed. */
export const useManaPotion = (sim: Sim): boolean => {
  const h = sim.hero
  const u = h.unit
  if (!u.alive || h.manaPotions <= 0 || h.manaPotionCd > 0 || sim.ended === 'defeat' || sim.leaving) { sim.emit({ t: 'denied', why: 'cooldown' }); return false }
  if (u.s.maxMana <= 0 || u.mana >= u.s.maxMana) { sim.emit({ t: 'denied', why: 'mana' }); return false }
  h.manaPotions--
  h.manaPotionCd = POTION_CD
  giveMana(sim, u, u.s.maxMana * MANA_POTION)
  sim.emit({ t: 'potion', mana: true })
  sim.emit({ t: 'fx', id: 'manaPotion', x: u.x, z: u.z, unit: u.id, color: '#6ab8ff' })
  return true
}

// ─── On-hit effects of the basic attack ──────────────────────────────────────

const onHit = (sim: Sim, tgt: Unit, base: number): void => {
  const h = sim.hero
  const u = h.unit
  const m = u.s.mods
  if (tgt.alive) {
    // Ashen Greatsword: a 15-damage burn.
    if (m.burnOnHit) applyStatus(sim, tgt, 'burn', 3, m.burnOnHit / 3, u, { type: 'fire', quiet: true })
    // Chrono Blade: a chance to freeze.
    if (m.freezeOnHit && sim.rng() < m.freezeOnHit) applyStatus(sim, tgt, 'frozen', 1.5, 1, u)
    // Venomous Blade: 40 % of the hit again as poison over 4 s, up to five stacks.
    const venom = findStatus(u, 'envenom')
    if (venom) applyStatus(sim, tgt, 'poison', 4, (base * venom.v) / 4, u, { type: 'poison', maxStacks: 5, quiet: true })
    // Mutagenic Rage: his blows open wounds.
    if (hasStatus(u, 'lifestealUp')) applyStatus(sim, tgt, 'bleed', 5, (statPower(u.s.power.end) * 0.2) / 5, u, { type: 'physical', quiet: true })
  }
  // Hemophilia: striking a bleeding target feeds him.
  if (m.bleedHeal && (hasStatus(tgt, 'bleed') || !tgt.alive)) heal(sim, u, u.s.maxHp * m.bleedHeal, true)
  // Aetherium Destroyer: every third shot fires an extra blast.
  if (m.extraBlastEvery && u.s.atkStyle !== 'melee' && u.swings % m.extraBlastEvery === 0 && tgt.alive) {
    fire(sim, { fx: 'blast', src: u, tx: tgt.x, tz: tgt.z, targetId: tgt.id, homing: true, speed: 24, dmg: base * 0.8, type: 'beam', aoe: 1.6, heavy: true, color: '#7ff4ff' })
  }
  // Dual wield: the off hand follows up at half strength.
  if (u.s.dual > 0 && (u.icd.dual ?? 0) <= 0 && sim.rng() < u.s.dual) {
    u.icd.dual = 0.2
    sim.after(0.13, () => {
      if (!u.alive || !tgt.alive) return
      if (u.s.atkStyle === 'melee') dealDamage(sim, u, tgt, base * 0.5, { type: u.s.atkType, attack: true })
      else fire(sim, { fx: 'bullet', src: u, tx: tgt.x, tz: tgt.z, targetId: tgt.id, homing: true, speed: 22, dmg: base * 0.5, type: u.s.atkType, color: '' })
    })
  }
}
setHeroOnHit(onHit)

// ─── The step ────────────────────────────────────────────────────────────────

export const stepHero = (sim: Sim, dt: number): void => {
  const h = sim.hero
  const u = h.unit
  for (let i = 0; i < h.cd.length; i++) if (h.cd[i]! > 0) h.cd[i] = Math.max(0, h.cd[i]! - dt)
  if (h.potionCd > 0) h.potionCd = Math.max(0, h.potionCd - dt)
  if (h.manaPotionCd > 0) h.manaPotionCd = Math.max(0, h.manaPotionCd - dt)
  if (h.overheatT > 0) {
    h.overheatT -= dt
    if (h.overheatT <= 0) { h.overheatT = 0; h.heat = 0 }
  } else if (h.heat > 0) {
    h.heat = Math.max(0, h.heat - HEAT_DECAY * (1 + (u.s.mods.heatDissipation ?? 0)) * dt)
  }
  if (!u.alive) return
  // A lid half lifted when something took the action away: the chest waits.
  if (h.opening >= 0 && u.action?.id !== 'open') cancelOpen(sim)

  // The rewind's memory: four samples a second, a little over four seconds.
  h.historyT -= dt
  if (h.historyT <= 0) {
    h.historyT = 0.25
    h.history.push({ t: sim.time, x: u.x, z: u.z, hp: u.hp, mana: u.mana })
    while (h.history.length > 20) h.history.shift()
  }

  if (isControlled(u)) {
    u.anim = 'stun'
    return
  }
  const stick = Math.hypot(h.stickX, h.stickZ)
  if (u.action) {
    // A skill's wind-up roots him; a basic swing gives way to the stick, and
    // so does a chest's lid.
    if (u.action.id === 'attack' && stick > 0.2) cancelSwing(u)
    else if (u.action.id === 'open' && stick > 0.2) cancelOpen(sim)
    else return
  }

  if (stick > 0.12) {
    h.order.kind = 'none'
    h.queued = null
    stop(u)
    stride(sim, u, h.stickX, h.stickZ, dt)
    u.anim = 'walk'
    return
  }

  // A cast waiting on range.
  if (h.queued) {
    const q = h.queued
    const def = SKILL_BY_ID[h.skills[q.slot] ?? '']
    const t = sim.live(q.targetId)
    if (!def || !t) h.queued = null
    else {
      const d = Math.hypot(t.x - u.x, t.z - u.z) - t.r
      if (d <= def.range && (def.range <= 3 || hasLineOfSight(sim.grid, u.x, u.z, t.x, t.z))) {
        if (h.cd[q.slot]! <= 0) beginCast(sim, q.slot, def, t, t.x, t.z)
        else h.queued = null
        return
      }
      chase(sim, u, t, dt)
      return
    }
  }

  if (h.order.kind === 'attack') {
    const t = sim.live(h.order.targetId)
    if (!t || t.team !== 1) {
      // The target fell: on to the next one near, or stand down.
      const next = hasStatus(u, 'stealth') ? undefined : nearestAwake(sim, u, 7.5)
      if (next) { h.order.targetId = next.id; u.targetId = next.id } else { h.order.kind = 'none'; h.order.targetId = 0; u.targetId = 0 }
      u.anim = 'idle'
      return
    }
    u.targetId = t.id
    if (inAttackRange(sim, u, t)) {
      stop(u)
      face(u, t.x, t.z)
      if (u.attackCd <= 0) startAttack(sim, u, t, u.s.atkInterval * WINDUP)
      if (!u.action) u.anim = 'idle'
      return
    }
    chase(sim, u, t, dt)
    return
  }

  if (h.order.kind === 'interact') {
    const t = sim.live(h.order.targetId)
    if (!t) { h.order.kind = 'none'; return }
    if (Math.hypot(t.x - u.x, t.z - u.z) <= t.r + u.r + 1.1) {
      stop(u)
      face(u, t.x, t.z)
      h.order.kind = 'none'
      u.anim = 'idle'
      sim.emit({ t: 'fx', id: 'interact', x: t.x, z: t.z, unit: t.id })
      return
    }
    chase(sim, u, t, dt)
    return
  }

  if (h.order.kind === 'chest') {
    const c = sim.chests[h.order.targetId]
    if (!c || chestLock(sim, c)) { h.order.kind = 'none'; u.anim = 'idle'; return }
    if (Math.hypot(c.x - u.x, c.z - u.z) <= CHEST_REACH) {
      h.order.kind = 'none'
      beginOpen(sim, c)
      return
    }
    u.repathT -= dt
    if (u.repathT <= 0 || !u.hasGoal) {
      u.repathT = 0.5
      setGoal(sim, u, c.sx, c.sz)
    }
    walk(sim, u, dt)
    u.anim = 'walk'
    return
  }

  if (h.order.kind === 'move') {
    if (walk(sim, u, dt)) u.anim = 'walk'
    else { h.order.kind = 'none'; u.anim = 'idle' }
    return
  }

  // Nothing ordered: answer whoever is on top of him.
  u.anim = 'idle'
  if (hasStatus(u, 'stealth') || sim.leaving) return
  const near = nearestAwake(sim, u, u.s.atkStyle === 'melee' ? AUTO_ENGAGE : u.s.atkRange)
  if (near && (u.s.atkStyle === 'melee' || hasLineOfSight(sim.grid, u.x, u.z, near.x, near.z))) {
    h.order.kind = 'attack'
    h.order.targetId = near.id
    u.targetId = near.id
  }
}

const nearestAwake = (sim: Sim, u: Unit, maxDist: number): Unit | undefined => {
  let best: Unit | undefined
  let bd = maxDist
  for (const e of sim.units) {
    if (!e.alive || e.team !== 1 || !e.awake || atPeace(sim, e)) continue
    const d = Math.hypot(e.x - u.x, e.z - u.z) - e.r
    if (d < bd) { bd = d; best = e }
  }
  return best
}

const chase = (sim: Sim, u: Unit, t: Unit, dt: number): void => {
  u.repathT -= dt
  if (u.repathT <= 0 || !u.hasGoal) {
    u.repathT = 0.3
    setGoal(sim, u, t.x, t.z)
  }
  walk(sim, u, dt)
  u.anim = 'walk'
  if (!u.hasGoal) face(u, t.x, t.z)
}

export { angleTo }
