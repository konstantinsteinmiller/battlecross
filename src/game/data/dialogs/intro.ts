import type { ConversationDef, Emotion } from '../../dialog/types'
import { INTRO_LINES } from '../../intro/script'

/**
 * ─── The intro's narration (roadmap #130) ────────────────────────────────────
 *
 * Told over the intro by an old storyteller (`chronicler`, his own voice card)
 * — never talked through, only heard, like the bosses' barks. Listed here so
 * the voice manifest and the i18n checks read it; the intro plays it from its
 * own script (`intro/script.ts`), which holds the order and the timing.
 *
 * Line ids: `dlg.intro.<beat>.1`.
 */

const MOOD: Record<string, Emotion> = { crossing: 'grave', hero: 'warm', fire: 'proud', foes: 'grave', begin: 'warm' }

export const INTRO_NARRATION: readonly ConversationDef[] = [{
  id: 'intro',
  name: 'intro.narrator',
  look: 'chronicler',
  voice: 'chronicler',
  greet: INTRO_LINES.map(l => {
    const beat = l.id.split('.')[2]!
    return { id: beat, lines: [{ id: l.id, by: 'npc', emotion: MOOD[beat] ?? 'neutral' }] }
  }),
  nodes: {},
  back: {},
  bye: []
}]
