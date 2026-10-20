import type { ConversationDef, Emotion } from '../../dialog/types'
import type { TopicSpec } from '../../dialog/build'
import { SIEGE_DUE } from '../breaking'
import { HERO } from './shared'

/**
 * ─── The Siege of Bastion's words (afterplay §8, §13) ───────────────────────
 *
 * The fort's commander (Captain Hale, or Elder Mara in his stead when
 * Oakhaven fell) stands in the yard through the siege and shouts at its big
 * beats: the first wave, a battering ram, the horn at half the gate and at a
 * quarter, the last foe down (`sim/siege.ts` emits them; `BossBarkLayer.vue`
 * says them). And in the fort, the same commander sends the hero to the gate
 * (`bell`, the siege's window).
 *
 * Line ids: `dlg.bark.siege<Hale|Mara>.<beat>.1`.
 */

/** The flag the story's siege leaves behind (`state/siege.ts`); repeated here so the data needs no state. */
const SIEGE_HELD = 'siegeHeld'

const barks = (id: string, name: string, look: string, voice: string, beats: Array<[string, Emotion]>): ConversationDef => ({
  id: `bark.${id}`,
  name,
  look,
  voice,
  greet: beats.map(([beat, emotion]) => ({ id: beat, lines: [{ id: `dlg.bark.${id}.${beat}.1`, by: 'npc', emotion }] })),
  nodes: {},
  back: {},
  bye: []
})

const BEATS: Array<[string, Emotion]> = [['start', 'shout'], ['ram', 'shout'], ['horn50', 'grave'], ['horn25', 'afraid'], ['won', 'proud']]

export const SIEGE_BARKS: readonly ConversationDef[] = [
  barks('siegeHale', 'npc.captainHale.name', 'captain', 'captainHale', BEATS),
  barks('siegeMara', 'npc.elderMara.name', 'elder', 'elderMara', BEATS)
]

/** "Let's man the walls.": the commander's answer, then the siege's window (tiers, the bell). */
export const siegeTopic = (over: Partial<TopicSpec> = {}): TopicSpec => ({
  id: 'bell', say: HERO.siege, once: false, icon: 'quest', mood: 'grave',
  when: { any: [{ flags: [SIEGE_DUE] }, { flags: [SIEGE_HELD] }] },
  fx: [{ t: 'open', window: 'siege' }],
  ...over
})
