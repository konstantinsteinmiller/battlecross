import type { NpcDef } from './zones'

/**
 * ─── The road teacher (roadmap #136) ─────────────────────────────────────────
 *
 * The first new teacher, met in the opening fight: Nettle Quickhand of
 * Sunford walks in from the top of the screen once the first pack is down and
 * waits where it fell. Her lesson is the Shadow class's first skill — the
 * teleport — and it is free. She is not a townsperson (no town lists her), so
 * `npcById` reads her from here; her talk (`dlg.sfShadowRoad.*`) opens the
 * trainer's window and nothing else.
 */

export const MENTOR_NPC = 'sfShadowRoad'
/** What she teaches for nothing. */
export const MENTOR_SKILL = 'shadowstep'
/** The one-time flag (in `profile.tips`) that the hero has spoken to her. */
export const MENTOR_MET_TIP = 'mentorMet'

export const ROAD_NPCS: readonly NpcDef[] = [
  { id: MENTOR_NPC, role: 'trainer', look: 'sfShadow', at: [0, 0], place: 'street', cls: 'shadow' }
]
