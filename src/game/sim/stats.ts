import { ATTRS, ATTR_EFFECTS, CAPS, softCapAttrs, statPower, zeroAttrs, type Attr, type AttrBlock } from '../data/attributes'
import { addMods, type Mods } from '../data/mods'
import { rankMul } from '../data/progression'
import { ITEM_BY_ID, UNARMED, isPlate, type EquipSlot } from '../data/items'
import { forgedArmor, forgedMods } from '../data/forge'
import { SET_BONUS } from '../data/relics'
import { SKILL_BY_ID } from '../data/skills'
import type { DamageType, UnitStats } from './types'
import type { FactionId } from '../data/quests'
import { BLESSING } from '../contracts'

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
  /** Factions whose +5 blessing the hero holds (roadmap #15). */
  blessings?: readonly FactionId[]
  /** Upgrade levels by item id (roadmap #90; none: +0). */
  upgrades?: Readonly<Record<string, number>>
  /** Skill ranks bought in the afterplay, by skill id (none: rank 1). */
  ranks?: Readonly<Record<string, number>>
  /** The level the hero may reach (none: the campaign's MAX_LEVEL). */
  levelCap?: number
  /** Heroic+ ranks by item id (afterplay §2.4; none: 0). */
  heroic?: Readonly<Record<string, number>>
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))

/**
 * ─── The level curve (#104, #109, #110) ──────────────────────────────────────
 *
 * Health comes mostly from Endurance, not from levels: before #109 a level-up
 * gave +32 health and three points of Endurance +24, so nobody needed it and a
 * glass cannon stood as long as a tank. Mana grows with level for every class
 * (a Strength hero kept 55-70 all game and could not cast his own skills);
 * Intelligence still adds mana and regeneration, less of both. And since gear
 * gives far fewer attributes (`GEAR_ATTR_SCALE`), the hero's own MIGHT grows
 * with level instead: the damage the old gear gave, back as a level factor, so
 * the points a player spends are a far larger share of what he hits for.
 */
/** A hero's health before Endurance and levels. */
export const HP_BASE = 150
export const HP_PER_LEVEL = 10
export const MANA_PER_LEVEL = 5
export const MANA_REGEN_PER_LEVEL = 0.06
/** Damage factor for the hero's level: the power the old gear gave a
 *  reference build's main attribute (1.13 at level 5, 2.33 at 30), and an
 *  eighth more for what it gave the others (crit, attack speed, cooldowns). */
export const heroMight = (level: number): number => Math.max(1, 1.27 + 0.054 * (level - 5))

/** The attribute totals and the summed modifier bag of a build. */
export const sumBuild = (b: HeroBuild): { attrs: AttrBlock; mods: Mods; armor: number; plate: number } => {
  const mods: Mods = {}
  let armor = 0
  let plate = 0
  const sets: Record<string, number> = {}
  for (const slot in b.equipped) {
    const id = b.equipped[slot as EquipSlot]
    const it = id ? ITEM_BY_ID[id] : undefined
    if (!it) continue
    const lvl = b.upgrades?.[it.id] ?? 0
    const hero = b.heroic?.[it.id] ?? 0
    addMods(mods, forgedMods(it, lvl, hero))
    if (it.armor) {
      const a = forgedArmor(it, lvl, hero)
      armor += a
      if (isPlate(it)) plate += a
    }
    if (it.set) sets[it.set] = (sets[it.set] ?? 0) + 1
  }
  // A boss pair worn together (afterplay §2.4): the set's bonus.
  for (const s in sets) if (sets[s]! >= 2) addMods(mods, SET_BONUS[s])
  // A ranked passive gives its bonuses × its rank's factor (numeric rank only).
  for (const id of b.passives) addMods(mods, SKILL_BY_ID[id]?.mods, rankMul(b.ranks?.[id] ?? 1))
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
  const built = sumBuild(b)
  const { mods, armor: gearArmor, plate } = built
  // Past ATTR_SOFT_CAP a point counts half (afterplay §2.2). Requirements
  // still read the raw totals (`sumBuild`).
  const attrs = softCapAttrs(built.attrs)
  const m = (id: keyof Mods): number => mods[id] ?? 0
  const E = ATTR_EFFECTS
  const main = b.equipped.main ? ITEM_BY_ID[b.equipped.main] : undefined
  const off = b.equipped.off ? ITEM_BY_ID[b.equipped.off] : undefined
  const w = main?.weapon ?? UNARMED

  // STR's heavy-armour affinity: plate is worth more on a strong body.
  const armorBase = gearArmor + plate * attrs.str * E.str.plateArmorPerPoint +
    attrs.end * E.end.armorPerPoint + m('armor') + attrs.str * m('armorFromStr')
  const armor = armorBase * (1 + m('armorPct'))

  const blessed = (f: FactionId): boolean => !!b.blessings?.includes(f)
  const maxHp = (HP_BASE + attrs.end * E.end.hpPerPoint + b.level * HP_PER_LEVEL + m('maxHp')) * (1 + m('maxHpPct')) *
    (blessed('order') ? 1 + BLESSING.order.maxHpPct : 1)
  const maxMana = 30 + b.level * MANA_PER_LEVEL + attrs.int * E.int.manaPerPoint + m('maxMana')

  return {
    maxHp: Math.round(maxHp),
    maxMana: Math.round(maxMana),
    hpRegen: attrs.end * E.end.hpRegenPerPoint + m('hpRegen'),
    manaRegen: (1.5 + b.level * MANA_REGEN_PER_LEVEL + attrs.int * E.int.manaRegenPerPoint) * (blessed('circle') ? 1 + BLESSING.circle.manaRegenPct : 1),
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
    critMult: clamp(1.5 + attrs.skl * E.skl.critDamagePerPoint + m('critDamage'), 0, CAPS.critMult),
    spellCrit: m('spellCrit'),
    attackSpeed: clamp(1 + attrs.dex * E.dex.attackSpeedPerPoint + m('attackSpeed'), 0, CAPS.attackSpeed),
    moveSpeed: 4.3 * clamp(1 + attrs.dex * E.dex.moveSpeedPerPoint + m('moveSpeed'), 0.5, CAPS.moveSpeed),
    cdr: clamp(attrs.skl * E.skl.cdrPerPoint + m('cdr'), 0, CAPS.cdr),
    lifesteal: m('lifesteal'),
    physLifesteal: m('physLifesteal'),
    damageMul: (1 + m('damagePct')) * heroMight(b.level),
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
  return (3.2 + 0.52 * l + 0.004 * l * l) * lateEase(level)
}

/**
 * How hard enemies hit for their level, on top of the base curve (#109). Before
 * #109 the hero's health piled up from levels and gear and enemies were tuned
 * against that: a reference build left most zones with 80-90 % of it, and a
 * glass cannon with no Endurance did as well. Now health comes from Endurance,
 * and enemies past the opening hit hard enough that skipping it shows: ×1 for
 * the first levels (the opening fight keeps its own tuning), ×`ENEMY_BITE`
 * from level 6 to 22, back to ×1 by 28 (the endgame bosses' own tuning).
 */
export const ENEMY_BITE = 1.15
const ramp = (level: number, from: number, to: number): number => {
  const t = Math.max(0, Math.min(1, (level - from) / (to - from)))
  return t * t * (3 - 2 * t)
}
const lateEase = (level: number): number =>
  // In from level 2 to 6; out again from 22 to 28, where the endgame's
  // scripted bosses were tuned (they pin their own fight length).
  1 + (ENEMY_BITE - 1) * (ramp(level, 2, 6) - ramp(level, 22, 28))

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
