/**
 * ─── The colosseum's ladder (roadmap #117) ──────────────────────────────────
 *
 * After the campaign the ladder is where a build is proven: how far past the
 * eighth wave it gets. Six milestones each hand over a mythic piece the moment
 * the wave falls, once for good; nothing else in the game gives them.
 */
export interface ArenaMilestone {
  wave: number
  item: string
}

export const ARENA_MILESTONES: readonly ArenaMilestone[] = [
  { wave: 10, item: 'laurelOfTheVictor' },
  { wave: 15, item: 'gripsOfTheGladiator' },
  { wave: 20, item: 'sandstriderGreaves' },
  { wave: 25, item: 'crimsonBulwark' },
  { wave: 30, item: 'mantleOfTheUndefeated' },
  { wave: 40, item: 'heartOfTheArena' }
]

/** The milestone a wave completes, if any. */
export const milestoneAt = (wave: number): ArenaMilestone | undefined => ARENA_MILESTONES.find(m => m.wave === wave)

/** The next milestone not yet earned (none: every prize is the hero's). */
export const nextMilestone = (owned: (id: string) => boolean): ArenaMilestone | undefined =>
  ARENA_MILESTONES.find(m => !owned(m.item))
