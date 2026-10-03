import { EncounterClock } from '@/game/data/encounters'

/**
 * What the world map keeps between its visits in one session: the encounter
 * clock. The screen is unmounted for every fight and town, and an encounter
 * met, fought and walked back from must not reset the count toward the next.
 */
let clock: EncounterClock | null = null

/** The session's encounter clock (seeded once, from the time it was first needed). */
export const mapClock = (): EncounterClock => (clock ||= new EncounterClock((Date.now() * 2654435761) >>> 0))
