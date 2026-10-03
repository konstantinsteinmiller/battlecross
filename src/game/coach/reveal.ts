import { isFreshProfile, profile, saveProfile } from '../state/profile'

/**
 * ─── Progressive reveal of the HUD (roadmap #52) ─────────────────────────────
 *
 * A first-timer sees only what the next minute needs. The hero's menus (the
 * map, the character sheet, the skills, the bag) and the mana flask arrive
 * when they first matter — with a pop, and a soft glow that stays until the
 * first use. A returning player (any progress in the save) has everything at
 * once.
 *
 * Kept in the save's `tips`, like the coach's counts:
 *   `onboard`        1 a new player, 2 a returning one (decided once, at the
 *                    first boot after the cloud read — `classifyOnboarding`)
 *   `reveal:<id>`    1 shown and glowing, 2 used
 */

export type RevealId = 'map' | 'hero' | 'skills' | 'bag' | 'mana'
export const REVEALS: readonly RevealId[] = ['map', 'hero', 'bag', 'skills', 'mana']

const key = (id: RevealId): string => `reveal:${id}`

/**
 * Is this a returning player? Decided by `classifyOnboarding` and kept; until
 * then (a test, a first frame) by the save itself. A cloud save that lands late
 * replaces the tips wholesale: one without the mark is judged again, so a
 * returning player whose progress arrived after the first frame is still one.
 */
export const isVeteran = (): boolean => {
  const k = profile.tips.onboard
  return k === 2 ? true : k === 1 ? false : !isFreshProfile()
}

/** Decide, once, whether this save starts the onboarding or skips it. */
export const classifyOnboarding = (): void => {
  if (profile.tips.onboard === 1 || profile.tips.onboard === 2) return
  profile.tips.onboard = isFreshProfile() ? 1 : 2
  saveProfile()
}

const stateOf = (id: RevealId): number => {
  const v = profile.tips[key(id)]
  return typeof v === 'number' ? v : 0
}

/** Is it on the HUD? */
export const revealed = (id: RevealId): boolean => isVeteran() || stateOf(id) >= 1

/** Revealed and never used: it keeps its soft glow. */
export const glowing = (id: RevealId): boolean => !isVeteran() && stateOf(id) === 1

/** It arrives (the HUD pops it in). */
export const markRevealed = (id: RevealId): void => {
  if (stateOf(id) >= 1) return
  profile.tips[key(id)] = 1
  saveProfile()
}

/** It was used: the glow goes (and a control used before it was revealed is
 *  simply there from now on). */
export const markRevealUsed = (id: RevealId): void => {
  if (stateOf(id) >= 2 || isVeteran()) return
  profile.tips[key(id)] = 2
  saveProfile()
}
