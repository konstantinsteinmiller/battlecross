/**
 * ─── The foes meet the hero's kit: skills learned so far ─────────────────────
 *
 * How hard a fight bites depends on how many skills the hero brings to it: one Shield Slam is a different hero from five
 * skills on the bar. The levels a first-timer must get through (the opening plains and the Goblin King's Hollows) are tuned for
 * a hero with a CERTAIN kit; a hero short of it meets softer foes, by a little per missing skill, and one with it (or more) meets
 * the level as tabled. It never makes a level harder than its table: a stronger kit is a reward, not a penalty (the opening's own
 * `OPENING.skillHp` already toughens the plains once the road teacher's skill is learned).
 *
 * Plain numbers, no scene: `tests/game/kitEase.test.ts` pins the rules.
 */

export interface KitEase {
  /** Enemy damage multiplier (1 = as tabled). */
  dmg: number
  /** Enemy health multiplier (1 = as tabled). */
  hp: number
}

/** The levels that adapt: the skills they are tuned for, and what each missing one takes off. */
export const KIT_LEVELS = {
  /** The opening plains: the start skill is the whole kit, so only the blows ease (the road teacher's skill toughens the foes instead). */
  plains: { expect: 2, dmgPer: 0.12, hpPer: 0 },
  /** The Goblin King's Hollows: start skill + the road teacher's + two a trainer taught. */
  hollows: { expect: 4, dmgPer: 0.1, hpPer: 0.06 }
} as const

/** The most the foes can be eased: never below this share of the table. */
export const KIT_FLOOR = { dmg: 0.6, hp: 0.76 } as const

export type KitLevel = keyof typeof KIT_LEVELS

export const isKitLevel = (id: string | undefined): id is KitLevel => !!id && id in KIT_LEVELS

/** The multipliers for a level and the number of skills the hero has learned. */
export const kitEase = (level: KitLevel, learned: number): KitEase => {
  const k = KIT_LEVELS[level]
  const missing = Math.max(0, k.expect - Math.max(0, learned))
  return {
    dmg: Math.max(KIT_FLOOR.dmg, 1 - missing * k.dmgPer),
    hp: Math.max(KIT_FLOOR.hp, 1 - missing * k.hpPer)
  }
}
