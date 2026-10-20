import type { ConversationDef } from '../../dialog/types'
import { SUNFORD_TALK } from './sunford'
import { OAKHAVEN_TALK } from './oakhaven'
import { IRONHOLD_TALK } from './ironhold'
import { SILVERBRIDGE_TALK } from './silverbridge'
import { DECISION_TALK } from './decisions'
import { SMALLTALK } from './smalltalk'
import { BOSS_BARKS } from './bosses'
import { CAPTIVE_BARKS } from './captives'
import { INTRO_NARRATION } from './intro'
import { BREAKING_BEATS, BREAKING_TALK } from './breaking'
import { SIEGE_BARKS } from './siege'
import { FAIR_TALK } from './fair'
import { PRESTIGE_TALK } from './prestige'

/**
 * ─── Every conversation in the game ──────────────────────────────────────────
 *
 * One per townsperson (keyed by NPC id, hidden trainers included) and one per
 * quest decision (`quest.<id>`),
 * and the afterplay's beats told on the map (`story.<beat>`). The words are in i18n under `dlg.*`: a line's
 * id is its key. `tools/voice-manifest.mjs` lists them all for recording.
 */
export const CONVERSATIONS: readonly ConversationDef[] = [
  ...SUNFORD_TALK, ...OAKHAVEN_TALK, ...IRONHOLD_TALK, ...SILVERBRIDGE_TALK, ...DECISION_TALK,
  ...BREAKING_TALK, ...BREAKING_BEATS, ...FAIR_TALK, ...PRESTIGE_TALK
]

/** Every line the game speaks: the conversations, the small talk the hero
 *  overhears in the towns, and what the bosses shout mid-fight (neither talked
 *  through, only heard), and the intro's narration (#130). The voice manifest
 *  and the i18n checks read this. */
export const SPOKEN: readonly ConversationDef[] = [...CONVERSATIONS, ...SMALLTALK, ...BOSS_BARKS, ...SIEGE_BARKS, ...CAPTIVE_BARKS, ...INTRO_NARRATION]

export const CONVERSATION_BY_ID: Readonly<Record<string, ConversationDef>> =
  Object.fromEntries(CONVERSATIONS.map(c => [c.id, c]))

/** The conversation of a townsperson (or a hidden trainer). */
export const conversationOf = (npcId: string): ConversationDef | undefined => CONVERSATION_BY_ID[npcId]

/** The decision conversation of a quest. */
export const decisionOf = (questId: string): ConversationDef | undefined => CONVERSATION_BY_ID[`quest.${questId}`]
