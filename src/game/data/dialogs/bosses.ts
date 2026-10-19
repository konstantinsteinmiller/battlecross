import type { ConversationDef, Emotion } from '../../dialog/types'

/**
 * ─── What the bosses shout mid-fight (#74) ───────────────────────────────────
 *
 * One short line at each big beat of a scripted fight (`sim/bosses`): the King
 * leaping off his boar, the dragon taking to the sky, the gate of fire, the
 * ice breaking. Said once, in a bubble over the boss (`BossBarkLayer.vue`),
 * with its recording when there is one. Never talked through: these are not
 * conversations, only lines the voice manifest and the i18n checks read.
 *
 * Line ids: `dlg.bark.<boss>.<beat>.1`.
 */

const barks = (boss: string, name: string, beats: Array<[string, Emotion]>): ConversationDef => ({
  id: `bark.${boss}`,
  name,
  look: boss,
  voice: boss,
  greet: beats.map(([beat, emotion]) => ({ id: beat, lines: [{ id: `dlg.bark.${boss}.${beat}.1`, by: 'npc', emotion }] })),
  nodes: {},
  back: {},
  bye: []
})

export const BOSS_BARKS: readonly ConversationDef[] = [
  barks('banditChief', 'enemy.banditChief', [['whistle', 'shout']]),
  barks('goblinKing', 'enemy.goblinKing', [['charge', 'shout'], ['horn', 'shout'], ['dismount', 'angry'], ['return', 'excited']]),
  barks('dragon', 'enemy.voidDragon', [['takeoff', 'proud'], ['flight2', 'angry']]),
  barks('archDemon', 'enemy.archDemon', [['gate', 'cold'], ['dive', 'cold']]),
  barks('frostJarl', 'enemy.frostJarl', [['hammer', 'gruff'], ['iceBreak', 'shout']])
]

/** The i18n key of a boss's line at a beat. */
export const barkKey = (boss: string, beat: string): string => `dlg.bark.${boss}.${beat}.1`
