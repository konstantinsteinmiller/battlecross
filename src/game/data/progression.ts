/**
 * Level curve and the per-level attribute pick (the Blades triad, renamed
 * for an android: HP, Weapon Energy, Power).
 */
export const MAX_LEVEL = 40

/** XP needed to go from `level` to `level + 1`. */
export const xpToNext = (level: number): number => Math.round(60 * Math.pow(Math.max(1, level), 1.55))

/** Total XP it takes to reach `level` from level 1. */
export const xpToReach = (level: number): number => {
  let sum = 0
  for (let l = 1; l < Math.min(level, MAX_LEVEL); l++) sum += xpToNext(l)
  return sum
}

export type Attr = 'hp' | 'we' | 'power'

export const ATTR_GAIN: Record<Attr, number> = { hp: 10, we: 4, power: 10 }

export const ATTR_ICON: Record<Attr, 'heart' | 'bolt' | 'shield'> = { hp: 'heart', we: 'bolt', power: 'shield' }

/** Fold an XP gain into (level, xp). Returns how many levels were gained. */
export const addXp = (level: number, xp: number, gain: number): { level: number; xp: number; gained: number } => {
  let l = level
  let x = xp + Math.max(0, Math.round(gain))
  let gained = 0
  while (l < MAX_LEVEL && x >= xpToNext(l)) {
    x -= xpToNext(l)
    l++
    gained++
  }
  if (l >= MAX_LEVEL) x = Math.min(x, xpToNext(MAX_LEVEL))
  return { level: l, xp: x, gained }
}
