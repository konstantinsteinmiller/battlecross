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
const freed = (npc: string, look: string, emotion: Emotion, says: readonly string[] = ['freed'], voice = npc): ConversationDef => ({
  id: `bark.${npc}`,
  name: `npc.${npc}.name`,
  look,
  voice,
  greet: says.map(id => ({ id, lines: [{ id: `dlg.bark.${npc}.${id}.1`, by: 'npc', emotion }] })),
  nodes: {},
  back: {},
  bye: []
})

/** The hero's thought as the first chest opens, and the cries from the cage (#187; `sim/camp.ts`'s `stepHelp`); and the
 *  one line as the chimera bounds away from its hunter on the plains (#210, `coach/cameo.ts`). */
const heroThought: ConversationDef = {
  id: 'bark.hero',
  name: 'dlg.ui.hero',
  look: 'hero',
  voice: 'hero',
  greet: [
    { id: 'cage', lines: [{ id: 'dlg.bark.hero.cage.1', by: 'hero', emotion: 'neutral' }] },
    { id: 'hunt', lines: [{ id: 'dlg.bark.hero.hunt.1', by: 'hero', emotion: 'neutral' }] }
  ],
  nodes: {},
  back: {},
  bye: []
}

/**
 * The hunter on the plains (#210, `coach/cameo.ts`): Silverbridge's aether master, out hunting, shouts at the chimera as
 * he lands in front of it. His own voice (the same man the hero meets in Silverbridge), his hunting look.
 */
const gunslinger = freed('sbMasterAether', 'cameoGunslinger', 'shout', ['fight'])

export const CAPTIVE_BARKS: readonly ConversationDef[] = [
  heroThought,
  gunslinger,
  freed('trainerPyro', 'trainerPyro', 'excited', ['help'], 'pyroCry'),
  freed('sbMasterSoulwarden', 'sbMasterSoulwarden', 'grave', ['help']),
  freed('sbMasterIronmonk', 'sbMasterIronmonk', 'excited', ['help']),
  ...CAGES.filter(c => !c.afterplay).map(c => freed(c.npc, c.look, FEEL[c.npc] ?? 'warm')),
  // The first visit's camp (#156): Ser Aldric thanks the hero for the three of them
  // and offers their lessons (`sim/camp.ts`, CAMP_THANKS); freed on the burned road in
  // the afterplay (#164), he sends the hero to the fort.
  freed('trainerAegis', 'trainerAegis', 'proud', ['freed', 'road', 'next']),
  freed('sfShadow', 'sfShadow', 'warm', ['road'])
]
