import { KING_DONE_FLAG } from './assault'

/**
 * ─── The gnome rebellion (roadmap #205) ──────────────────────────────────────
 *
 * Until the Goblin King falls, the Hollows holds a labour gang: gnome diggers in chains under the
 * goblins' overseers (the second clearing's pack). Walk up once the overseers are down and the
 * chains snap; the gnomes join the hero, but they are too frail to last: a blow that would leave one
 * under a tenth of its health leaves it at 9 % instead and sends it running, hurt by nothing more.
 * The ones who ran come back for the King's fight: a stampede at its start (a share of his health
 * that grows with how many were freed) and five of them again when he leaps off Tusker, one stab
 * each. After the King, the gang is gone: nothing of it is laid, so no chains, posts or diggers.
 */

/** The gang is laid while the King lives. */
export const rebellionDue = (has: (flag: string) => boolean): boolean => !has(KING_DONE_FLAG)

/** Diggers in the chain gang. */
export const REBEL_COUNT = 6
/** The share of its health a gnome keeps once it runs (a blow that would take it under `REBEL_FLEE` leaves it here). */
export const REBEL_FLEE = 0.1
export const REBEL_FLOOR = 0.09
/** What a gnome is, as a share of the hero's health and basic hit (the minion table's). */
export const REBEL_HP = 0.3
export const REBEL_DMG = 0.22

/** How near (m) the hero stands to a chained gnome to free the gang, and how near an awake foe may stand and still guard it. */
export const FREE_REACH = 2.4
export const GUARD_RADIUS = 5.5
/** Seconds between two gnomes' chains snapping, and between two "guarded" hints. */
export const FREE_GAP = 0.18
export const GUARD_HINT_GAP = 7

/** A frightened gnome keeps this far (m) from an awake foe, and loiters this near the hero. */
export const FLEE_KEEP = 9
export const LOITER_NEAR = 4.5
export const LOITER_FAR = 7.5

/** The stampede at the start of the King's fight: the share of his health, from the fewest freed to all of them. */
export const STAMPEDE_MIN = 0.05
export const STAMPEDE_MAX = 0.1
/** The second run, when the King leaps off Tusker: at most this many gnomes, and each one's single stab (share of the King's health). */
export const LEAP_RUNNERS = 5
export const LEAP_STAB = 0.008
/** A runner's speed multiplier, the reach (m) of its stab, the seconds between two runners setting off, and the longest run. */
export const RUN_SPEED = 1.9
export const STAB_REACH = 0.9
export const RUN_GAP = 0.12
export const RUN_MAX = 9
/** Seconds the stab's pose lasts before the gnome turns and runs. */
export const STAB_S = 0.4

/** The share of the King's health the first stampede takes for `freed` gnomes (5 % for one, 10 % for the whole gang). */
export const stampedeShare = (freed: number): number =>
  freed <= 0 ? 0 : STAMPEDE_MIN + (STAMPEDE_MAX - STAMPEDE_MIN) * Math.min(1, (freed - 1) / Math.max(1, REBEL_COUNT - 1))

/** The King's added health (Tusker's and his own): the stampede's help is paid for. */
export const KING_HP_MUL = 1.14
