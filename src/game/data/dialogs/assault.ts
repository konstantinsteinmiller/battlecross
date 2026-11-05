import { CRIER, CRIES } from '../assault'
import type { ConversationDef } from '../../dialog/types'

/**
 * ─── The storming rebels' cries (roadmap #204) ──────────────────────────────
 *
 * The goblins and gnomes breaking the Hollows' gate scream "Down with the king!", "No king!" and "For
 * freedom!" one after another, in a bubble over whoever shouts (`sim/assault.ts` says who and when). Not
 * conversations: only lines the voice manifest and the i18n checks read. Line ids:
 * `dlg.bark.<rebelGoblin|rebelGnome>.<down|nomore|free>.1`.
 */

const cries = (voice: string, look: string, name: string): ConversationDef => ({
  id: `bark.${voice}`,
  name,
  look,
  voice,
  greet: CRIES.map(c => ({ id: c, lines: [{ id: `dlg.bark.${voice}.${c}.1`, by: 'npc' as const, emotion: 'shout' as const }] })),
  nodes: {},
  back: {},
  bye: []
})

export const ASSAULT_BARKS: readonly ConversationDef[] = [
  cries(CRIER.goblin, 'goblin', 'enemy.goblin'),
  cries(CRIER.gnome, 'gnome', 'enemy.gnome')
]
