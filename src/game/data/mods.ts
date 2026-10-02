import type { Attr } from './attributes'

/**
 * ─── Modifiers ───────────────────────────────────────────────────────────────
 *
 * Everything gear and passive skills give the hero is a bag of additive
 * modifiers. `sim/stats.ts` sums the bags and derives the combat stats; the
 * combat hooks read the "unique" ones (a burn on hit, a freeze chance, a fatal
 * save) straight from the summed bag. One vocabulary for items and passives is
 * what lets "+10 % Critical Damage" from a dagger and "+30 % Critical Damage"
 * from Lethality stack without either knowing about the other.
 *
 * Percentages are fractions (0.15 = 15 %).
 */
export type ModId =
  // The six attributes (flat points)
  | Attr
  /** +N to every attribute (Ring of Absolute Power). */
  | 'allAttrs'
  /** +N to the higher of STR / DEX (Copper Band). */
  | 'strOrDex'
  // Defence
  | 'armor' | 'armorPct' | 'armorFromStr' | 'block' | 'dodge' | 'damageReduction' | 'physReduction'
  | 'maxHp' | 'maxHpPct' | 'maxMana' | 'hpRegen' | 'stunDurationCut'
  // Offence
  | 'damagePct' | 'critChance' | 'critDamage' | 'spellCrit' | 'attackSpeed' | 'moveSpeed'
  | 'cdr' | 'manaDiscount' | 'lifesteal' | 'physLifesteal' | 'lifeDrainPct' | 'bossDamage' | 'backstab'
  | 'minionDamage' | 'minionAttackSpeed' | 'minionHp'
  // Uniques (items)
  /** Attacks apply a burn dealing this much damage (Ashen Greatsword). */
  | 'burnOnHit'
  /** Chance per attack to freeze the foe (Chrono Blade). */
  | 'freezeOnHit'
  /** Shots pass through this many extra enemies (Void Cannon). */
  | 'pierce'
  /** Critical hits take this many seconds off every cooldown (Blade of the Unbound). */
  | 'critCooldown'
  /** Every Nth shot fires an extra energy blast (Aetherium Destroyer). */
  | 'extraBlastEvery'
  /** Damage reflected to the attacker on a successful block (Aegis Tower Shield). */
  | 'reflectOnBlock'
  /** Fatal damage instead grants invulnerability for this many seconds (Shield of the Fallen). */
  | 'fatalSave'
  /** Immune to knockback and knock-ups (Heart of the Mountain). */
  | 'knockbackImmune'
  /** Heat built per shot is cut by this fraction (Aether Carbine). */
  | 'heatBuildCut'
  /** Heat drains this much faster (Aetheric Battery). */
  | 'heatDissipation'
  /** Sanguine Flask damage bonus (Syringe of the Adept). */
  | 'flaskDamage'
  /** Fire spells' burns are this much stronger (Orb of Eternal Flame). */
  | 'igniteBonus'
  /** Moves silently: enemies notice the hero from this much less far (Infiltrator's Charm). */
  | 'stealthy'
  // Uniques (passive skills)
  /** Fortitude: a hit over 15 % max HP grants a shield of this share of max HP. */
  | 'fortitude'
  /** Evasion: a dodge grants a burst of speed. */
  | 'evasionHaste'
  /** Cauterize: burning enemies deal this much less damage to the hero. */
  | 'cauterize'
  /** Pyromaniac: a critical spell hit takes this many seconds off fire cooldowns. */
  | 'pyromaniac'
  /** Sovereign's Tribute: this share of damage taken is passed to the minions. */
  | 'tribute'
  /** Time Distort: this share of incoming damage is delayed over six seconds. */
  | 'timeDistort'
  /** Entropy: every cast grants a stack of Accelerate (cooldown reduction). */
  | 'entropy'
  /** Blood Transmutation: this share of physical damage taken returns as mana. */
  | 'bloodToMana'
  /** Hemophilia: attacks on bleeding targets heal this share of max HP. */
  | 'bleedHeal'
  /** Thermal Overload: critical damage bonus while overheated. */
  | 'overheatCrit'

export type Mods = Partial<Record<ModId, number>>

export const addMods = (into: Mods, from: Mods | undefined, scale = 1): Mods => {
  if (!from) return into
  for (const k in from) {
    const key = k as ModId
    into[key] = (into[key] ?? 0) + (from[key] ?? 0) * scale
  }
  return into
}
