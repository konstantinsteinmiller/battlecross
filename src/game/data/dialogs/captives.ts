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

/** Each line a freed one may say, by its greet id: `freed`, or a cage's own (`road`, #164). */
const freed = (npc: string, look: string, emotion: Emotion, says: readonly string[] = ['freed']): ConversationDef => ({
  id: `bark.${npc}`,
  name: `npc.${npc}.name`,
  look,
  voice: npc,
  greet: says.map(id => ({ id, lines: [{ id: `dlg.bark.${npc}.${id}.1`, by: 'npc', emotion }] })),
  nodes: {},
  back: {},
  bye: []
})

export const CAPTIVE_BARKS: readonly ConversationDef[] = [
  ...CAGES.filter(c => !c.afterplay).map(c => freed(c.npc, c.look, FEEL[c.npc] ?? 'warm')),
  // The first visit's camp (#156): Ser Aldric thanks the hero for the three of them
  // and offers their lessons (`sim/camp.ts`, CAMP_THANKS); freed on the burned road in
  // the afterplay (#164), he sends the hero to the fort.
  freed('trainerAegis', 'trainerAegis', 'proud', ['freed', 'road']),
  freed('sfShadow', 'sfShadow', 'warm', ['road'])
]
