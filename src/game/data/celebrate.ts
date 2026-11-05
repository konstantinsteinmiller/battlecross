/**
 * ─── The Hollows' celebration (roadmap #206) ─────────────────────────────────
 *
 * After the Goblin King's answer, once: the freed goblins, dwarfs and gnomes gather round a camp fire in the
 * Hollows, raise their "no king" crests, eat roast meat and drink beer together. The hero stands among them.
 * It is a short film (skippable at any moment) that shows the world changed by what he did; it plays once per save.
 */

/** The `profile.tips` key set once it has been seen (or skipped). */
export const PARTY_TIP = 'hollowsParty'

/** Is it due? The King has been answered and the party has not been held yet. */
export const partyDue = (kingAnswered: boolean, seen: boolean): boolean => kingAnswered && !seen

/** Seconds the film runs before it ends by itself, and when its title appears. */
export const PARTY_S = 19
export const PARTY_TITLE_AT = 1.4

/** The crowd: goblins and dwarfs always, gnomes as many as the hero freed (never fewer than three, never more than six). */
export const PARTY_GOBLINS = 8
export const PARTY_DWARFS = 7
export const PARTY_GNOMES_MIN = 3
export const PARTY_GNOMES_MAX = 6
export const partyGnomes = (freed: number): number => Math.max(PARTY_GNOMES_MIN, Math.min(PARTY_GNOMES_MAX, Math.round(freed)))

/** Seconds between two cheers of one celebrant (each has its own offset), and one cheer's length. */
export const CHEER_EVERY = 3.1
export const CHEER_S = 0.95
/** Seconds between two shouts of the crowd ("Down with the king!", "For freedom!"), and to the first. */
export const SHOUT_EVERY = 3.4
export const SHOUT_FIRST = 2.2
