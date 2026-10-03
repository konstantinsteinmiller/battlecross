import { SKILL_BY_ID } from '../data/skills'
import { ENEMY_BY_ID, RANK_REWARD } from '../data/enemies'
import { killGold, killXp, addXp } from '../data/progression'
import { CHAMPION_REWARD } from '../data/loot'
import { rewardBonus, armorMitigation } from './stats'
import { HARD_CC, isPhysical, type DamageType, type Status, type StatusId, type Unit } from './types'
import { atPeace, findStatus, hasStatus, statusV, type Sim } from './world'

/**
 * ─── Damage, healing, statuses, death ────────────────────────────────────────
 *
 * Every point of damage in the game goes through `dealDamage`, and every
 * status through `applyStatus`, so the rules — crits, blocks, dodges, armour,
 * shields, the passives that bend them — exist exactly once.
 */

export interface HitOpts {
  type: DamageType
  /** Roll for a critical hit (default true). */
  canCrit?: boolean
  /** A guaranteed crit. */
  crit?: boolean
  /** A spell: Caster's Emblem's spell-crit applies, Pyromaniac may trigger. */
  spell?: boolean
  /** A basic weapon attack: it can be dodged and blocked. */
  attack?: boolean
  /** Big hit: heavier hit-stop, shake and sound. */
  heavy?: boolean
  /** Damage over time: no crit, no dodge, no flinch, no reflect. */
  dot?: boolean
  /** The skill it came from (fire hooks, tooltips). */
  skill?: string
  /** Struck from behind (Shadowstep): the backstab bonus applies. */
  backstab?: boolean
  /** Extra lifesteal on this hit, as a fraction of damage dealt. */
  steal?: number
  /** A drain effect: Hemophilia increases what it heals. */
  drain?: boolean
  /** Reflected / redirected damage: never reflects or redirects again. */
  echo?: boolean
}

const STUN_LIKE: ReadonlySet<StatusId> = new Set<StatusId>(['stun', 'knockup', 'knockdown', 'frozen', 'fear', 'confuse'])
const KNOCK: ReadonlySet<StatusId> = new Set<StatusId>(['knockup', 'knockdown'])
/** Negative effects Chrono Rewind and potions clear. */
export const DEBUFFS: ReadonlySet<StatusId> = new Set<StatusId>([
  'stun', 'knockup', 'knockdown', 'frozen', 'fear', 'slow', 'confuse', 'armorShred', 'weaken', 'vulnerable',
  'burn', 'poison', 'bleed', 'delayed', 'petrify'
])

/** Bosses shrug off most of a hard control effect. */
const BOSS_CC = 0.35
const ELITE_CC = 0.7

export interface StatusOpts {
  type?: DamageType
  /** Stack cap for stacking statuses (poison, accelerate). */
  maxStacks?: number
  /** Do not announce it with floating text. */
  quiet?: boolean
}

/**
 * Apply (or refresh) a status. `v` is its magnitude: a fraction for slows and
 * buffs, damage PER SECOND for a DoT. Returns the status, or null when the
 * target resisted it outright.
 */
export const applyStatus = (sim: Sim, tgt: Unit, id: StatusId, dur: number, v: number, src: Unit | null, o: StatusOpts = {}): Status | null => {
  if (!tgt.alive || dur <= 0) return null
  // Frozen in time: nothing new lands, good or bad.
  if (hasStatus(tgt, 'stasis') && id !== 'stasis') return null
  let d = dur
  if (HARD_CC.has(id) || id === 'confuse') {
    if (hasStatus(tgt, 'invulnerable')) return null
    if (KNOCK.has(id) && (tgt.s.mods.knockbackImmune ?? 0) > 0) return null
    if (tgt.rank === 'boss') d *= BOSS_CC
    else if (tgt.rank === 'elite') d *= ELITE_CC
    if (STUN_LIKE.has(id)) d *= 1 - tgt.s.stunResist
    if (tgt.rank === 'turret') return null
    if (d < 0.08) return null
  }
  const cur = findStatus(tgt, id)
  if (cur) {
    if (o.maxStacks) {
      // Stacking: each application adds a stack and refreshes the clock.
      cur.n = Math.min(o.maxStacks, cur.n + 1)
      cur.v = Math.max(cur.v, v)
    } else {
      cur.v = Math.max(cur.v, v)
    }
    cur.t = Math.max(cur.t, d)
    cur.dur = Math.max(cur.dur, d)
    cur.src = src?.id ?? cur.src
    return cur
  }
  const st: Status = { id, t: d, dur: d, v, n: 1, src: src?.id ?? 0, type: o.type, tick: 0.5 }
  tgt.statuses.push(st)
  if (HARD_CC.has(id)) {
    // Whatever it was doing is interrupted.
    tgt.action = null
    tgt.hasGoal = false
    tgt.path.length = 0
  }
  if (!o.quiet) sim.emit({ t: 'status', tgt: tgt.id, id, x: tgt.x, z: tgt.z, h: tgt.h })
  return st
}

export const removeStatus = (u: Unit, id: StatusId): void => {
  const st = u.statuses
  for (let i = st.length - 1; i >= 0; i--) if (st[i]!.id === id) st.splice(i, 1)
}

/** Clear every negative effect (Chrono Rewind, a potion). */
export const cleanse = (u: Unit): void => {
  const st = u.statuses
  for (let i = st.length - 1; i >= 0; i--) if (DEBUFFS.has(st[i]!.id)) st.splice(i, 1)
}

/** Cannot act: stunned, airborne, frozen, petrified, in stasis. */
export const isControlled = (u: Unit): boolean => {
  const st = u.statuses
  for (let i = 0; i < st.length; i++) if (HARD_CC.has(st[i]!.id)) return true
  return false
}

export const moveSpeedOf = (u: Unit): number => {
  const slow = Math.min(0.8, statusV(u, 'slow'))
  return u.s.moveSpeed * (1 + statusV(u, 'haste') + statusV(u, 'focus') * 2) * (1 - slow)
}

export const attackSpeedOf = (u: Unit): number =>
  u.s.attackSpeed * (1 + statusV(u, 'attackSpeed') + statusV(u, 'enrage') * 0.6)

/** Effective cooldown reduction: the stat plus Entropy's Accelerate stacks. */
export const cdrOf = (u: Unit): number => {
  const acc = findStatus(u, 'accelerate')
  return Math.min(0.6, u.s.cdr + (acc ? acc.v * acc.n : 0))
}

export const heal = (sim: Sim, tgt: Unit, amount: number, quiet = false): number => {
  if (!tgt.alive || amount <= 0) return 0
  const before = tgt.hp
  tgt.hp = Math.min(tgt.s.maxHp, tgt.hp + amount)
  const got = tgt.hp - before
  if (got >= 1 && !quiet) sim.emit({ t: 'heal', tgt: tgt.id, x: tgt.x, z: tgt.z, h: tgt.h, amount: Math.round(got) })
  return got
}

export const giveMana = (sim: Sim, tgt: Unit, amount: number, quiet = false): number => {
  if (!tgt.alive || amount <= 0 || tgt.s.maxMana <= 0) return 0
  const before = tgt.mana
  tgt.mana = Math.min(tgt.s.maxMana, tgt.mana + amount)
  const got = tgt.mana - before
  if (got >= 1 && !quiet) sim.emit({ t: 'mana', tgt: tgt.id, x: tgt.x, z: tgt.z, h: tgt.h, amount: Math.round(got) })
  return got
}

export const addShield = (tgt: Unit, amount: number, dur: number): void => {
  tgt.shield = Math.max(tgt.shield, amount)
  tgt.shieldT = Math.max(tgt.shieldT, dur)
}

/** Shove a unit (decays in `actors.ts`). Bosses and turrets do not budge. */
export const knockback = (tgt: Unit, fromX: number, fromZ: number, speed: number): void => {
  if (tgt.rank === 'boss' || tgt.rank === 'turret' || (tgt.s.mods.knockbackImmune ?? 0) > 0) return
  if (hasStatus(tgt, 'stasis') || hasStatus(tgt, 'petrify')) return
  const dx = tgt.x - fromX
  const dz = tgt.z - fromZ
  const d = Math.hypot(dx, dz) || 1
  tgt.kx += (dx / d) * speed
  tgt.kz += (dz / d) * speed
}

/** Is `src` standing behind `tgt` (within ~70° of its back)? */
export const isBehind = (src: Unit, tgt: Unit): boolean => {
  const fx = Math.sin(tgt.facing)
  const fz = Math.cos(tgt.facing)
  const dx = src.x - tgt.x
  const dz = src.z - tgt.z
  const d = Math.hypot(dx, dz) || 1
  return (dx * fx + dz * fz) / d < -0.35
}

const wakeGroup = (sim: Sim, u: Unit): void => {
  if (u.team !== 1 || u.awake) return
  u.awake = true
  const g = sim.groupById(u.group)
  if (!g || g.awake) return
  g.awake = true
  for (const id of g.members) {
    const m = sim.get(id)
    if (m) m.awake = true
  }
  sim.emit({ t: 'awake', group: g.id, boss: g.boss })
}
export { wakeGroup }

/**
 * Deal damage. `base` is the amount before the target's defences; the source's
 * own multipliers (crit, buffs, bonuses) are applied here. Returns the health
 * actually removed.
 */
export const dealDamage = (sim: Sim, src: Unit | null, tgt: Unit, base: number, o: HitOpts): number => {
  if (!tgt.alive || base <= 0) return 0
  // A won zone: the main chain's leftovers neither hurt nor are hurt; a side
  // pack is still a fight (`atPeace`). Nothing else harms the hero then.
  if (sim.ended === 'victory' && sim.mode === 'zone') {
    if (tgt.team === 1 ? atPeace(sim, tgt) : !src || src.team !== 1 || atPeace(sim, src)) return 0
  }
  const hero = sim.hero?.unit
  const toHero = tgt === hero
  const srcMods = src?.s.mods

  // Frozen in time: untouchable.
  if (hasStatus(tgt, 'stasis')) {
    if (!o.dot) sim.emit({ t: 'miss', tgt: tgt.id, x: tgt.x, z: tgt.z, h: tgt.h, why: 'immune' })
    return 0
  }
  wakeGroup(sim, tgt)
  if (src && src.team !== tgt.team && tgt.team === 1 && tgt.targetId === 0 && src.alive) tgt.targetId = src.id

  // ── The source's side ──
  let amount = base
  let crit = false
  if (src) {
    amount *= src.s.damageMul * (1 + statusV(src, 'damageUp') + statusV(src, 'enrage')) * (1 - Math.min(0.8, statusV(src, 'weaken')))
    if (tgt.rank === 'boss') amount *= 1 + (srcMods?.bossDamage ?? 0)
    if (o.backstab || (o.attack && src === hero && isBehind(src, tgt))) amount *= 1.25 + (srcMods?.backstab ?? 0)
    // Smoke Bomb: the next strike from the shadows always crits, and harder.
    const ambush = !o.dot ? findStatus(src, 'ambush') : undefined
    if (ambush) {
      crit = true
      amount *= 1 + ambush.v
      removeStatus(src, 'ambush')
      removeStatus(src, 'stealth')
    } else if (o.crit) {
      crit = true
    } else if (o.canCrit !== false && !o.dot) {
      crit = sim.rng() < src.s.critChance + (o.spell ? src.s.spellCrit : 0)
    }
    if (crit) {
      const over = hasStatus(src, 'overheat') ? (srcMods?.overheatCrit ?? 0) : 0
      amount *= src.s.critMult + over
    }
  }

  // ── Avoidance ──
  if (o.attack && !o.dot && tgt.s.dodge > 0 && !isControlled(tgt) && sim.rng() < tgt.s.dodge) {
    sim.emit({ t: 'miss', tgt: tgt.id, x: tgt.x, z: tgt.z, h: tgt.h, why: 'dodge' })
    const hasteV = tgt.s.mods.evasionHaste ?? 0
    if (hasteV > 0) applyStatus(sim, tgt, 'haste', 2, hasteV, tgt, { quiet: true })
    return 0
  }
  const invulnerable = hasStatus(tgt, 'invulnerable')
  // Holy Bastion: the blow never lands, and half of it goes back.
  const reflect = !o.echo && !o.dot && src ? statusV(tgt, 'reflect') : 0
  if (reflect > 0 && src && src.alive) dealDamage(sim, tgt, src, amount * reflect, { type: 'holy', canCrit: false, echo: true })
  if (invulnerable) {
    if (!o.dot) sim.emit({ t: 'miss', tgt: tgt.id, x: tgt.x, z: tgt.z, h: tgt.h, why: 'immune' })
    return 0
  }

  // ── The target's defences ──
  let blocked = false
  const phys = isPhysical(o.type)
  if (o.type !== 'true') {
    if (o.attack && phys && tgt.s.block > 0 && !isControlled(tgt) && sim.rng() < tgt.s.block) {
      blocked = true
      amount *= 0.4
      const back = tgt.s.mods.reflectOnBlock ?? 0
      if (back > 0 && src && src.alive) dealDamage(sim, tgt, src, back, { type: 'true', canCrit: false, echo: true })
    }
    if (phys) {
      const armor = tgt.s.armor * (1 + statusV(tgt, 'defenseUp') + (hasStatus(tgt, 'exosuit') ? 0.5 : 0)) * (1 - Math.min(0.9, statusV(tgt, 'armorShred')))
      amount *= 1 - armorMitigation(armor, src?.level ?? tgt.level)
      amount *= 1 - tgt.s.physReduction
      // Petrified: stone shatters.
      amount *= 1 + statusV(tgt, 'petrify')
    } else {
      amount *= 1 - tgt.s.resist
    }
    amount *= 1 - tgt.s.damageReduction
    amount *= 1 + statusV(tgt, 'vulnerable')
    // Cauterize: a burning enemy hits the Pyromancer more softly.
    if (toHero && src && hasStatus(src, 'burn')) amount *= 1 - (tgt.s.mods.cauterize ?? 0)
  }
  if (amount < 0.5 && !o.dot) amount = 0.5

  // ── Passives that move damage around (the hero only, never on an echo) ──
  if (toHero && !o.echo && o.type !== 'true') {
    // Sovereign's Tribute: the royal guard takes its share.
    const tribute = tgt.s.mods.tribute ?? 0
    if (tribute > 0) {
      let n = 0
      for (const u of sim.units) if (u.alive && u.ownerId === tgt.id && u.rank === 'minion') n++
      if (n > 0) {
        const each = (amount * tribute) / n
        amount *= 1 - tribute
        for (const u of sim.units) {
          if (u.alive && u.ownerId === tgt.id && u.rank === 'minion') dealDamage(sim, null, u, each, { type: 'true', canCrit: false, echo: true, dot: true })
        }
      }
    }
    // Time Distort: part of the blow arrives later, a little at a time.
    const delay = o.dot ? 0 : (tgt.s.mods.timeDistort ?? 0)
    if (delay > 0) {
      const later = amount * delay
      amount -= later
      const cur = findStatus(tgt, 'delayed')
      if (cur) {
        // What is still owed plus the new debt, spread over a fresh six seconds.
        cur.v = (cur.v * cur.t + later) / 6
        cur.t = cur.dur = 6
      } else applyStatus(sim, tgt, 'delayed', 6, later / 6, null, { type: 'true', quiet: true })
    }
    // Blood Transmutation: pain becomes mana.
    if (phys) giveMana(sim, tgt, amount * (tgt.s.mods.bloodToMana ?? 0), true)
  }

  // ── Shield, then health ──
  let left = amount
  if (tgt.shield > 0) {
    const soak = Math.min(tgt.shield, left)
    tgt.shield -= soak
    left -= soak
  }
  const before = tgt.hp
  tgt.hp -= left
  if (toHero) sim.hero.taken += left
  else if (src && (src === hero || src.ownerId === hero?.id)) sim.hero.dealt += left

  // Fortitude: a heavy blow raises a shield.
  if (toHero && !o.dot && left > tgt.s.maxHp * 0.15) {
    const fort = tgt.s.mods.fortitude ?? 0
    if (fort > 0 && (tgt.icd.fortitude ?? 0) <= 0) {
      tgt.icd.fortitude = 20
      addShield(tgt, tgt.s.maxHp * fort, 5)
      sim.emit({ t: 'fx', id: 'shield', x: tgt.x, z: tgt.z, unit: tgt.id, color: '#ffd84a' })
    }
  }

  let killed = false
  if (tgt.hp <= 0) {
    if (hasStatus(tgt, 'unkillable')) {
      tgt.hp = 1
    } else if (toHero && (tgt.s.mods.fatalSave ?? 0) > 0 && (tgt.icd.fatalSave ?? 0) <= 0) {
      // Shield of the Fallen: death is refused once every two minutes.
      tgt.icd.fatalSave = 120
      tgt.hp = 1
      applyStatus(sim, tgt, 'invulnerable', tgt.s.mods.fatalSave ?? 3, 1, tgt)
      sim.emit({ t: 'fx', id: 'fatalSave', x: tgt.x, z: tgt.z, unit: tgt.id, color: '#ffd84a' })
    } else {
      killed = true
    }
  }
  const dealt = Math.max(0, before - Math.max(0, tgt.hp))

  if (!o.dot) {
    tgt.flinch = 1
    if (blocked) sim.emit({ t: 'miss', tgt: tgt.id, x: tgt.x, z: tgt.z, h: tgt.h, why: 'block' })
  }
  sim.emit({
    t: 'hit', src: src?.id ?? 0, tgt: tgt.id, x: tgt.x, z: tgt.z, h: tgt.h,
    amount: Math.max(1, Math.round(amount)), crit, type: o.type, heavy: !!o.heavy || crit, toHero, killed, dot: !!o.dot
  })

  // ── What the hit gives back to the source ──
  if (src && src.alive && dealt > 0 && !o.echo) {
    let steal = src.s.lifesteal + (phys ? src.s.physLifesteal : 0) + statusV(src, 'lifestealUp') + (o.steal ?? 0)
    if (o.drain) steal *= 1 + (srcMods?.lifeDrainPct ?? 0)
    if (steal > 0) heal(sim, src, dealt * steal, dealt * steal < src.s.maxHp * 0.02)
    if (src === hero && crit) {
      // Blade of the Unbound: a crit takes a second off every cooldown
      // (at most a few times a second, or one cleave would reset everything).
      const cut = srcMods?.critCooldown ?? 0
      if (cut > 0 && (src.icd.critCd ?? 0) <= 0) {
        src.icd.critCd = 0.3
        for (let i = 0; i < sim.hero.cd.length; i++) sim.hero.cd[i] = Math.max(0, sim.hero.cd[i]! - cut)
      }
      // Pyromaniac: a critical fire spell shortens the fire cooldowns.
      const pyro = srcMods?.pyromaniac ?? 0
      if (pyro > 0 && o.spell && o.skill && SKILL_BY_ID[o.skill]?.fire && (src.icd.pyro ?? 0) <= 0) {
        src.icd.pyro = 0.3
        for (let i = 0; i < sim.hero.cd.length; i++) {
          if (SKILL_BY_ID[sim.hero.skills[i] ?? '']?.fire) sim.hero.cd[i] = Math.max(0, sim.hero.cd[i]! - pyro)
        }
      }
    }
  }

  if (killed) kill(sim, tgt, src)
  return dealt
}

/** A unit dies: rewards, death effects, and the body left to fade. */
export const kill = (sim: Sim, u: Unit, by: Unit | null): void => {
  if (!u.alive) return
  u.alive = false
  u.hp = 0
  u.deadT = 0
  u.action = null
  u.hasGoal = false
  u.statuses.length = 0
  u.shield = 0
  u.anim = 'dead'
  u.animT = 0
  sim.emit({ t: 'death', unit: u.id, x: u.x, z: u.z, kind: u.kind, rank: u.rank, team: u.team })
  const h = sim.hero
  if (u === h?.unit) {
    if (!sim.ended) {
      sim.ended = 'defeat'
      sim.emit({ t: 'defeat' })
    } else if (sim.ended === 'victory' && !sim.leaving) {
      // Fallen to a side pack after the zone was won: the win stands. He
      // leaves with what he collected, as if he had pressed Leave.
      sim.leaving = true
      sim.leaveAt = sim.time
      // The longer beat: his fall, and the finale's chest if it was still shut, are seen.
      sim.leaveOpened = true
    }
    return
  }
  if (u.team !== 1) return
  const def = ENEMY_BY_ID[u.kind]
  // Summoned adds are worth nothing: a necromancer must not be a gold mine.
  const summoned = u.ownerId !== 0
  if (def && h && !summoned) {
    // A champion pays like several of its kind: the reward for a fight nobody had to take.
    const mul = RANK_REWARD[u.rank] * def.reward * (u.champion ? CHAMPION_REWARD : 1)
    const cha = h.unit.s.power.cha
    const xp = killXp(u.level, mul, h.level)
    const gold = Math.round(killGold(u.level, mul) * rewardBonus(cha) * (0.8 + sim.rng() * 0.4))
    h.kills++
    grantXp(sim, xp)
    h.gold += gold
    let item = ''
    // A branch boss pays in its chest: it drops like an elite, never the
    // finale's promised piece.
    const finaleBoss = u.rank === 'boss' && !def.branch
    const table = finaleBoss ? sim.dropTable.boss : sim.dropTable.mob
    const chance = finaleBoss ? 1 : u.rank === 'elite' || u.rank === 'boss' ? 0.3 : u.rank === 'weak' ? 0.015 : 0.05
    if (table.length && sim.rng() < chance) {
      // Something the hero does not own yet, if there is one.
      const fresh = table.filter(id => !sim.owned.has(id) && !h.items.includes(id))
      const pool = fresh.length ? fresh : finaleBoss ? [] : table
      if (pool.length) {
        item = pool[Math.floor(sim.rng() * pool.length)]!
        h.items.push(item)
      }
    }
    sim.emit({ t: 'loot', x: u.x, z: u.z, gold, item })
  }
  if (def?.deathBlast && by) {
    const b = def.deathBlast
    sim.emit({ t: 'fx', id: 'blast', x: u.x, z: u.z, r: b.r, color: def.color })
    const near = sim.inCircle(0, u.x, u.z, b.r, scratch)
    for (const t of near) dealDamage(sim, null, t, u.s.baseDmg * b.dmg, { type: b.type, canCrit: false })
  }
}

const scratch: Unit[] = []

/** Bank XP for the hero and level them up on the spot. */
export const grantXp = (sim: Sim, amount: number): void => {
  const h = sim.hero
  if (!h || amount <= 0) return
  h.xp += amount
  const r = addXp(h.level, h.xpInto, amount)
  h.xpInto = r.xp
  sim.emit({ t: 'xp', amount })
  if (r.gained > 0) {
    h.level = r.level
    sim.emit({ t: 'levelUp', level: r.level })
    // A level-up is a breather: back to full, with a burst of light.
    h.unit.hp = h.unit.s.maxHp
    h.unit.mana = h.unit.s.maxMana
  }
}

/** Tick every unit's statuses: clocks, damage over time, regeneration. */
export const stepStatuses = (sim: Sim, u: Unit, dt: number): void => {
  const st = u.statuses
  for (let i = st.length - 1; i >= 0; i--) {
    const s = st[i]!
    s.t -= dt
    if (s.id === 'burn' || s.id === 'poison' || s.id === 'bleed' || s.id === 'delayed') {
      s.tick = (s.tick ?? 0.5) - dt
      if (s.tick <= 0) {
        s.tick += 0.5
        const src = sim.live(s.src) ?? null
        const type: DamageType = s.type ?? (s.id === 'burn' ? 'fire' : s.id === 'poison' ? 'poison' : s.id === 'bleed' ? 'physical' : 'true')
        dealDamage(sim, src, u, s.v * s.n * 0.5, { type, dot: true, canCrit: false, echo: s.id === 'delayed' })
        if (!u.alive) return
      }
    } else if (s.id === 'regen') {
      heal(sim, u, u.s.maxHp * s.v * dt, true)
    }
    if (s.t <= 0) {
      st.splice(i, 1)
      if (s.id === 'overheat') sim.emit({ t: 'overheat', on: false })
    }
  }
  if (u.shieldT > 0) {
    u.shieldT -= dt
    if (u.shieldT <= 0) u.shield = 0
  }
  for (const k in u.icd) if (u.icd[k]! > 0) u.icd[k]! -= dt
  if (u.s.hpRegen > 0 && u.hp < u.s.maxHp) u.hp = Math.min(u.s.maxHp, u.hp + u.s.hpRegen * dt)
  if (u.s.manaRegen > 0 && u.mana < u.s.maxMana) u.mana = Math.min(u.s.maxMana, u.mana + u.s.manaRegen * dt)
}
