import { decision } from '../../dialog/build'
import type { ConversationDef } from '../../dialog/types'
import { QUEST_BY_ID } from '../quests'

/**
 * The six decisions (GDD §3.2), each put by whoever the fight left standing.
 * WHO may choose WHAT, and what it changes, is the quest table's; this file
 * only says who speaks and how many lines.
 */
export const DECISION_TALK: ConversationDef[] = [
  decision(QUEST_BY_ID.goblinKing!, {
    name: 'enemy.goblinKing', mood: 'afraid', ask: 'nnn',
    results: { slay: 'xx', pact: 'nx', ransom: 'nx' }
  }),
  decision(QUEST_BY_ID.siege!, {
    name: 'enemy.warlord', mood: 'cold', ask: 'nnn',
    results: { defend: 'nx', betray: 'nxx' }
  }),
  // Forgemaster Dorn has followed the hero down.
  decision(QUEST_BY_ID.core!, {
    name: 'npc.forgemaster.name', voice: 'forgemaster', mood: 'grave', ask: 'nnn',
    results: { destroy: 'xx', study: 'xx', sell: 'nx' }
  }),
  decision(QUEST_BY_ID.oracle!, {
    name: 'enemy.nagaOracle', mood: 'weary', ask: 'nnn',
    results: { free: 'nx', slay: 'nxx' }
  }),
  decision(QUEST_BY_ID.dragon!, {
    name: 'enemy.voidDragon', mood: 'proud', ask: 'nnn',
    results: { slay: 'xx', pact: 'nx' }
  }),
  // The Arch-Demon's last words.
  decision(QUEST_BY_ID.throne!, {
    name: 'enemy.archDemon', mood: 'cold', ask: 'nnn',
    results: { order: 'xx', syndicate: 'xx', circle: 'xx', shatter: 'xx', claim: 'xx' }
  })
]
