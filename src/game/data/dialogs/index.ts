import type { ConversationDef } from '../../dialog/types'
import { SUNFORD_TALK } from './sunford'
import { OAKHAVEN_TALK } from './oakhaven'
import { IRONHOLD_TALK } from './ironhold'
import { DECISION_TALK } from './decisions'

/**
 * ─── Every conversation in the game ──────────────────────────────────────────
 *
 * One per townsperson (keyed by NPC id, hidden trainers included) and one per
 * quest decision (`quest.<id>`). The words are in i18n under `dlg.*`: a line's
 * id is its key. `tools/voice-manifest.mjs` lists them all for recording.
 */
export const CONVERSATIONS: readonly ConversationDef[] = [
  ...SUNFORD_TALK, ...OAKHAVEN_TALK, ...IRONHOLD_TALK, ...DECISION_TALK
]

export const CONVERSATION_BY_ID: Readonly<Record<string, ConversationDef>> =
  Object.fromEntries(CONVERSATIONS.map(c => [c.id, c]))

/** The conversation of a townsperson (or a hidden trainer). */
export const conversationOf = (npcId: string): ConversationDef | undefined => CONVERSATION_BY_ID[npcId]

/** The decision conversation of a quest. */
export const decisionOf = (questId: string): ConversationDef | undefined => CONVERSATION_BY_ID[`quest.${questId}`]
