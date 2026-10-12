import type { ConversationDef, Emotion } from '../../dialog/types'
import { CAGES } from '../cages'

/**
 * ─── What a freed captive says (#100) ────────────────────────────────────────
 *
 * Out of the cage, the first of them turns to the hero and says, in one
 * breath, who they are and where to find them: a trader, a herbalist with a
 * favour, a farming family, a disciple who teaches a secret class. Said once,
 * in a bubble over their head (`BossBarkLayer.vue`, the bosses' bubble), with
 * its recording. Never talked through.
 *
 * Line ids: `dlg.bark.<npc>.freed.1`.
 */

const FEEL: Readonly<Record<string, Emotion>> = {
  freedPeddler: 'excited', freedHerbalist: 'warm', freedFarmers: 'excited',
  windDisciple: 'proud', frostDisciple: 'grave', lightDisciple: 'warm'
}

export const CAPTIVE_BARKS: readonly ConversationDef[] = CAGES.map(c => ({
  id: `bark.${c.npc}`,
  name: `npc.${c.npc}.name`,
  look: c.look,
  voice: c.npc,
  greet: [{ id: 'freed', lines: [{ id: `dlg.bark.${c.npc}.freed.1`, by: 'npc', emotion: FEEL[c.npc] ?? 'warm' }] }],
  nodes: {},
  back: {},
  bye: []
}))
