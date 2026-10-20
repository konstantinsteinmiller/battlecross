import { ARM_DISCOUNT, FAIR_CLEARS, type FairGame } from '@/game/fair'
import type { FairTop } from '@/game/state/fair'
import { fairCapped } from '@/game/state/fair'
import { profile } from '@/game/state/profile'
import { fmt } from '@/utils/format'

type T = (key: string, args?: Record<string, unknown>) => string

/**
 * ─── What a fair game's round paid, in words (afterplay §9) ─────────────────
 *
 * Shared by the three fair windows (`WhackGame`, `RingTossGame`,
 * `ArmWrestleGame`): the lines under a finished round, and the note that the
 * big prizes are spent for now.
 */

/** The lines a top prize shows: its gold (and XP), the Demonglass, the trinket, the material. */
export const topLines = (t: T, top: FairTop): string[] => {
  if (top.capped) return [t('fair.topGold', { n: fmt(top.gold) })]
  const out = [t('fair.top', { gold: fmt(top.gold), xp: fmt(top.xp) }), t('siege.result.glass', { n: top.glass })]
  if (top.item) out.push(t('gamble.prize', { item: t(`item.${top.item}.name`) }))
  if (top.mats) out.push(t('fair.mats', { n: top.mats }))
  return out
}

/** The smith's discount, as the line that announces it. */
export const discountLine = (t: T): string => t('fair.discount', { n: Math.round(ARM_DISCOUNT * 100) })

/** The note under a game whose big prizes are spent ('' while they are not). */
export const cappedNote = (t: T, game: FairGame): string =>
  fairCapped(game) ? t('fair.capped', { n: FAIR_CLEARS - profile.meta.fair.clears }) : ''
