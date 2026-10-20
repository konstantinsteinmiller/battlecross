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
  /** Adrenal Catalyst (#95): up to this much more damage as health falls (full at 30 %). */
  | 'lowHealthDamage'
  /** Thermal Plating (#95): damage taken is cut by this share while heat is at half or more. */
  | 'heatArmor'
  /** Crumble (#95): more damage to slowed, knocked-down or petrified enemies. */
  | 'crumble'
  /** Unbreakable (#95): damage taken is cut by this share below 30 % health. */
  | 'lastStand'
  /** Wildfire (#95): a burning enemy's defeat sets its neighbours within this many metres alight. */
  | 'wildfire'
  /** Loyal Hearts (#95): a minion's defeat heals the hero this share of her health. */
  | 'loyalty'
  /** Winter's Bite (#86): the hero's basic hits slow by this share for 2 s. */
  | 'chillOnHit'
  /** Shatterpoint (#86): more damage to slowed or frozen enemies. */
  | 'chillDamage'
  /** Kindled Hope (#86): healing the hero receives is this much stronger. */
  | 'healPower'
  /** Pack Tactics (#86): the hero deals this much more damage for each companion alive (up to 4). */
  | 'packDamage'
  /** Elemental Harmony (#95): element reactions are this much stronger. */
  | 'reactionDamage'
  /** Restless Souls (#95): a beaten foe may rise as the hero's spirit. */
  | 'soulRise'
  /** Flowing Fists (#95): an attack builds a bead of chi with this chance. */
  | 'chiOnHit'
  /** Long Refrain (#95): the bard's songs last this much longer. */
  | 'songLength'
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
  // Demon affixes (afterplay §2.4): one on every Infernal piece (`relics.ts`)
  /** More damage to demons. */
  | 'demonBane'
  /** This share of the damage dealt to demons heals the hero. */
  | 'demonLeech'
  /** More damage to the mythic beasts (the afterplay's bosses and their kin). */
  | 'beastBane'
  /** Fire damage taken is cut by this share. */
  | 'fireWard'
  /** Shadow damage taken is cut by this share. */
  | 'shadowWard'
  /** Damage taken from demons is cut by this share. */
  | 'demonWard'
  /** More damage to demon pylons. */
  | 'pylonBreaker'
  /** Chance a slain demon leaves one more Demonglass. */
  | 'glassFinder'
  /** The Leviathan Scale: water does not slow the hero. */
  | 'waterWalk'

export type Mods = Partial<Record<ModId, number>>

export const addMods = (into: Mods, from: Mods | undefined, scale = 1): Mods => {
  if (!from) return into
  for (const k in from) {
    const key = k as ModId
    into[key] = (into[key] ?? 0) + (from[key] ?? 0) * scale
  }
  return into
}
