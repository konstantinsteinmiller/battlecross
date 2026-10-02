/**
 * ─── The six attributes (GDD §4.1) ───────────────────────────────────────────
 *
 * Every hero stat is derived from these plus gear and passives
 * (`sim/stats.ts`). The hero starts with 5 in each — every class's first skill
 * asks for 5 of its stat, so a Novice can learn any opening skill the moment
 * they meet its trainer — and earns 3 points per level.
 */

export type Attr = 'str' | 'dex' | 'int' | 'end' | 'skl' | 'cha'

export const ATTRS: readonly Attr[] = ['str', 'dex', 'int', 'end', 'skl', 'cha']

export const ATTR_START = 5
export const POINTS_PER_LEVEL = 3

export type AttrBlock = Record<Attr, number>

export const startAttrs = (): AttrBlock => ({
  str: ATTR_START, dex: ATTR_START, int: ATTR_START, end: ATTR_START, skl: ATTR_START, cha: ATTR_START
})

export const zeroAttrs = (): AttrBlock => ({ str: 0, dex: 0, int: 0, end: 0, skl: 0, cha: 0 })

/** The attribute's signature colour (bars, skill frames, floating labels). */
export const ATTR_COLOR: Record<Attr, string> = {
  str: '#ff6b5a',
  dex: '#67e08a',
  int: '#50aaff',
  end: '#ffb04a',
  skl: '#c58cff',
  cha: '#ffd84a'
}

/**
 * What one point of each attribute buys, as the character sheet lists it. The
 * numbers are the ones `sim/stats.ts` applies; a test holds the two together.
 */
export const ATTR_EFFECTS = {
  /** STR: melee power, heavy-armour affinity, block chance. */
  str: { blockPerPoint: 0.002, plateArmorPerPoint: 0.005 },
  /** DEX: crit chance, attack speed, move speed, dual-wield efficiency. */
  dex: { critPerPoint: 0.004, attackSpeedPerPoint: 0.008, moveSpeedPerPoint: 0.003, dualWieldPerPoint: 0.01 },
  /** INT: spell power, max mana, mana regeneration, elemental resistance. */
  int: { manaPerPoint: 5, manaRegenPerPoint: 0.12, resistPerPoint: 0.005 },
  /** END: max health, health regeneration, physical defence, stun resistance. */
  end: { hpPerPoint: 8, hpRegenPerPoint: 0.04, armorPerPoint: 1.5, stunResistPerPoint: 0.008 },
  /** SKL: crit damage, cooldown reduction, ranged weapon damage. */
  skl: { critDamagePerPoint: 0.01, cdrPerPoint: 0.005 },
  /** CHA: minion damage, shop prices, quest rewards, dialogue options. */
  cha: { minionPerPoint: 0.02, discountPerPoint: 0.008, rewardPerPoint: 0.01 }
} as const

/** Caps on what the attributes alone (plus gear) can reach. */
export const CAPS = {
  crit: 0.75,
  block: 0.6,
  dodge: 0.6,
  cdr: 0.6,
  resist: 0.7,
  moveSpeed: 1.6,
  discount: 0.4,
  stunResist: 0.7,
  dualWield: 0.8
} as const

/**
 * The damage a "100 % STAT" hit deals: `6 + 1.6 × stat`. A fresh hero (5) hits
 * for 14; a late one with 150 in a stat hits for 246. Every skill percentage
 * in the GDD's tables multiplies this.
 */
export const statPower = (stat: number): number => 6 + 1.6 * Math.max(0, stat)
