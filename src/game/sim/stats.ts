import { ATTRS, ATTR_EFFECTS, CAPS, statPower, zeroAttrs, type Attr, type AttrBlock } from '../data/attributes'
import { addMods, type Mods } from '../data/mods'
import { ITEM_BY_ID, UNARMED, isPlate, type EquipSlot } from '../data/items'
import { SKILL_BY_ID } from '../data/skills'
import type { DamageType, UnitStats } from './types'

/**
 * ─── Derived stats ───────────────────────────────────────────────────────────
 *
 * The hero's combat stats from the three things the player builds with:
 * attribute points, the eight equipped items and the three equipped passives
 * (GDD §4.1). Pure: the same function feeds the fight, the character sheet's
 * preview ("what would +1 STR give me") and the balance tests.
 */

export interface HeroBuild {
  level: number
  /** Spent attribute points (base 5 each included). */
  attrs: AttrBlock
  /** Item ids by slot (null: empty). */
  equipped: Record<EquipSlot, string | null>
  /** Equipped passive skill ids. */
  passives: readonly string[]
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))

/** The attribute totals and the summed modifier bag of a build. */
export const sumBuild = (b: HeroBuild): { attrs: AttrBlock; mods: Mods; armor: number; plate: number } => {
  const mods: Mods = {}
  let armor = 0
  let plate = 0
  for (const slot in b.equipped) {
    const id = b.equipped[slot as EquipSlot]
    const it = id ? ITEM_BY_ID[id] : undefined
    if (!it) continue
    addMods(mods, it.mods)
    if (it.armor) {
      armor += it.armor
      if (isPlate(it)) plate += it.armor
    }
  }
  for (const id of b.passives) addMods(mods, SKILL_BY_ID[id]?.mods)
  const attrs = zeroAttrs()
  for (const a of ATTRS) attrs[a] = b.attrs[a] + (mods[a] ?? 0) + (mods.allAttrs ?? 0)
  // "+3 STR or DEX": whichever the hero has more of.
  if (mods.strOrDex) attrs[attrs.dex > attrs.str ? 'dex' : 'str'] += mods.strOrDex
  return { attrs, mods, armor, plate }
}

const attackType = (style: 'melee' | 'ranged' | 'magic', kind: string | undefined): DamageType => {
  if (style === 'ranged') return 'pierce'
  if (style === 'magic') return kind === 'wand' ? 'temporal' : 'fire'
  return 'physical'
}

export const heroStats = (b: HeroBuild): UnitStats => {
  const { attrs, mods, armor: gearArmor, plate } = sumBuild(b)
  const m = (id: keyof Mods): number => mods[id] ?? 0
  const E = ATTR_EFFECTS
  const main = b.equipped.main ? ITEM_BY_ID[b.equipped.main] : undefined
  const off = b.equipped.off ? ITEM_BY_ID[b.equipped.off] : undefined
  const w = main?.weapon ?? UNARMED

  // STR's heavy-armour affinity: plate is worth more on a strong body.
  const armorBase = gearArmor + plate * attrs.str * E.str.plateArmorPerPoint +
    attrs.end * E.end.armorPerPoint + m('armor') + attrs.str * m('armorFromStr')
  const armor = armorBase * (1 + m('armorPct'))

  const maxHp = (100 + attrs.end * E.end.hpPerPoint + b.level * 32 + m('maxHp')) * (1 + m('maxHpPct'))
  const maxMana = 30 + attrs.int * E.int.manaPerPoint + m('maxMana')

  return {
    maxHp: Math.round(maxHp),
    maxMana: Math.round(maxMana),
    hpRegen: attrs.end * E.end.hpRegenPerPoint + m('hpRegen'),
    manaRegen: 1.5 + attrs.int * E.int.manaRegenPerPoint,
    armor,
    resist: clamp(attrs.int * E.int.resistPerPoint, 0, CAPS.resist),
    block: clamp(attrs.str * E.str.blockPerPoint + m('block'), 0, CAPS.block),
    dodge: clamp(m('dodge'), 0, CAPS.dodge),
    damageReduction: clamp(m('damageReduction'), 0, 0.6),
    physReduction: clamp(m('physReduction'), 0, 0.6),
    stunResist: clamp(attrs.end * E.end.stunResistPerPoint + m('stunDurationCut'), 0, CAPS.stunResist),
    power: attrs,
    baseDmg: statPower(attrs[w.scale]),
    critChance: clamp(0.05 + attrs.dex * E.dex.critPerPoint + m('critChance'), 0, CAPS.crit),
    critMult: 1.5 + attrs.skl * E.skl.critDamagePerPoint + m('critDamage'),
    spellCrit: m('spellCrit'),
    attackSpeed: 1 + attrs.dex * E.dex.attackSpeedPerPoint + m('attackSpeed'),
    moveSpeed: 4.3 * clamp(1 + attrs.dex * E.dex.moveSpeedPerPoint + m('moveSpeed'), 0.5, CAPS.moveSpeed),
    cdr: clamp(attrs.skl * E.skl.cdrPerPoint + m('cdr'), 0, CAPS.cdr),
    lifesteal: m('lifesteal'),
    physLifesteal: m('physLifesteal'),
    damageMul: 1 + m('damagePct'),
    manaDiscount: clamp(m('manaDiscount'), 0, 0.5),
    atkScale: w.scale,
    atkStyle: w.style,
    atkType: attackType(w.style, main?.kind),
    atkRange: w.range,
    atkInterval: w.interval,
    atkHeavy: !!w.heavy,
    // DEX's dual-wield efficiency: a pistol or dagger in the main hand with a
    // free off hand (or a light off-hand tool) follows up with a second strike.
    dual: (main?.kind === 'dagger' || main?.kind === 'gun') && (!off || off.kind !== 'shield')
      ? clamp(0.1 + attrs.dex * E.dex.dualWieldPerPoint, 0, CAPS.dualWield)
      : 0,
    mods
  }
}

/** Charisma's three numbers outside combat. */
export const shopDiscount = (cha: number): number => clamp(cha * ATTR_EFFECTS.cha.discountPerPoint, 0, CAPS.discount)
export const rewardBonus = (cha: number): number => 1 + cha * ATTR_EFFECTS.cha.rewardPerPoint
export const minionMul = (cha: number, mods: Mods): number =>
  1 + cha * ATTR_EFFECTS.cha.minionPerPoint + (mods.minionDamage ?? 0)

// ─── Everything that is not the hero ─────────────────────────────────────────

/** A normal enemy's health at a level (the baseline every rank multiplies). */
export const enemyHp = (level: number): number => {
  const l = Math.max(0, level - 1)
  return 55 + 38 * l + 2.2 * l * l
}

/**
 * A normal enemy's "100 %" hit at a level: about 1.5 % of the health a hero
 * of that level has, before armour. A pack of four is then a real fight (a
 * third of a health bar if it is fought standing still) without one bad
 * second being a death; the abilities, which are telegraphed, hit harder.
 */
export const enemyDmg = (level: number): number => {
  const l = Math.max(0, level - 1)
  return 3.2 + 0.52 * l + 0.004 * l * l
}

/** Armour's mitigation against an attacker of a given level. */
export const armorMitigation = (armor: number, attackerLevel: number): number =>
  armor <= 0 ? 0 : armor / (armor + 60 + 12 * attackerLevel)

export interface PlainStatOpts {
  hp: number
  dmg: number
  armor?: number
  resist?: number
  speed?: number
  range?: number
  interval?: number
  style?: 'melee' | 'ranged' | 'magic'
  type?: DamageType
  crit?: number
  heavy?: boolean
}

/** Stats for a unit without attributes: enemies, minions, turrets, NPCs. */
export const plainStats = (o: PlainStatOpts): UnitStats => ({
  maxHp: Math.max(1, Math.round(o.hp)),
  maxMana: 0,
  hpRegen: 0,
  manaRegen: 0,
  armor: o.armor ?? 0,
  resist: o.resist ?? 0,
  block: 0,
  dodge: 0,
  damageReduction: 0,
  physReduction: 0,
  stunResist: 0,
  power: zeroAttrs(),
  baseDmg: o.dmg,
  critChance: o.crit ?? 0,
  critMult: 1.5,
  spellCrit: 0,
  attackSpeed: 1,
  moveSpeed: o.speed ?? 3,
  cdr: 0,
  lifesteal: 0,
  physLifesteal: 0,
  damageMul: 1,
  manaDiscount: 0,
  atkScale: 'str',
  atkStyle: o.style ?? 'melee',
  atkType: o.type ?? 'physical',
  atkRange: o.range ?? 1.8,
  atkInterval: o.interval ?? 1.4,
  atkHeavy: !!o.heavy,
  dual: 0,
  mods: {}
})

/** The damage of "100 % of `attr`" for a unit: the hero's attribute power,
 *  or a plain unit's base damage. */
export const scalePower = (s: UnitStats, attr: Attr): number => {
  const v = s.power[attr]
  return v > 0 ? statPower(v) : s.baseDmg
}
