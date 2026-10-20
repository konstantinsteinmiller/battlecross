import type { ConversationDef } from '../../dialog/types'
import { conversation } from '../../dialog/build'
import { RIFT_AJAR, RIFT_SEALED } from '../breaking'
import { news, train, who } from './shared'

/**
 * ─── The Mysterious Wanderer (afterplay §10, phase 10) ───────────────────────
 *
 * He comes to the fort once a prestige trial is passed (`data/prestige.ts`)
 * and teaches each class whose trial the hero has passed, to a hero who knows
 * a skill of both its parents. A hooded stranger who has walked the rift's
 * edge longer than the war has lasted. How the rift was left (sealed, ajar)
 * is the one thing that moves him.
 */
const mysteriousWanderer = conversation('mysteriousWanderer', {
  name: 'npc.mysteriousWanderer.name', look: 'mysteriousWanderer', mood: 'sly',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('sealed', { flags: [RIFT_SEALED] }, { mood: 'grave' }),
    news('ajar', { flags: [RIFT_AJAR] }, { mood: 'amused' }),
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'trial', lines: 'nn' },
    who()
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

export const PRESTIGE_TALK: ConversationDef[] = [mysteriousWanderer]
