import type { BlockSpec, TopicSpec } from '../../dialog/build'
import { REP_FRIEND, REP_HOSTILE, type FactionId } from '../quests'
import { skillsOf, type ClassId } from '../skills'

/**
 * What every conversation shares: the hero's stock lines (said the same way to
 * every smith and every trainer, so they are recorded once) and the topics
 * every shopkeeper, trainer and healer has.
 */

/** The hero's shared lines (ids = i18n keys). */
export const HERO = {
  trade: 'dlg.hero.trade',
  train: 'dlg.hero.train',
  heal: 'dlg.hero.heal',
  mana: 'dlg.hero.mana',
  who: 'dlg.hero.who',
  rumor: 'dlg.hero.rumor',
  ready: 'dlg.hero.ready'
} as const

/** "Show me your goods." → the answer, then the shop. */
export const trade = (over: Partial<TopicSpec> = {}): TopicSpec =>
  ({ id: 'trade', say: HERO.trade, once: false, icon: 'trade', fx: [{ t: 'open', window: 'shop' }], ...over })

/** "Teach me." → the answer, then the trainer's lessons. */
export const train = (over: Partial<TopicSpec> = {}): TopicSpec =>
  ({ id: 'train', say: HERO.train, once: false, icon: 'train', fx: [{ t: 'open', window: 'trainer' }], ...over })

/** "Patch me up." → the answer, then the healer (and the potion belt). */
export const heal = (over: Partial<TopicSpec> = {}): TopicSpec =>
  ({ id: 'heal', say: HERO.heal, once: false, icon: 'heal', fx: [{ t: 'open', window: 'healer' }], ...over })

/** The offer a healer's mana potion is (`DialogHost.offer`). */
export const MANA_OFFER = 'manaPotion'

/** "I need something for my mana.": a healer sells a mana potion for the belt.
 *  The price and the cap are the game's rule; the choice shows both. */
export const mana = (over: Partial<TopicSpec> = {}): TopicSpec =>
  ({ id: 'mana', say: HERO.mana, once: false, icon: 'buy', offer: MANA_OFFER, ...over })

/** "Who are you?" */
export const who = (over: Partial<TopicSpec> = {}): TopicSpec => ({ id: 'who', say: HERO.who, ...over })

/** "Heard anything lately?": the answer depends on how far the hero has come,
 *  and points at where to go next. Always on the list. */
export const rumor = (alt: BlockSpec[]): TopicSpec => ({ id: 'rumor', say: HERO.rumor, once: false, alt })

/**
 * "Am I ready for more?": a trainer's word on the hero's attributes, read off
 * the class's own skill table — `weak` while the second lesson's requirement is
 * not met, `able` until the fourth's is, then `strong`.
 */
export const ready = (cls: ClassId): TopicSpec => {
  const s = skillsOf(cls)
  return {
    id: 'ready', say: HERO.ready, once: false,
    alt: [
      { id: 'strong', when: { attrs: s[3]!.req } },
      { id: 'able', when: { attrs: s[1]!.req } },
      { id: 'weak' }
    ]
  }
}

/** A greeting for a friend of the faction (said once: it announces the discount). */
export const friend = (f: FactionId): BlockSpec => ({ id: 'friend', when: { rep: { [f]: REP_FRIEND }, unsaid: ['friend'] }, mood: 'warm' })
/** A greeting for someone the faction hunts (every time). */
export const foe = (f: FactionId): BlockSpec => ({ id: 'foe', when: { repMax: { [f]: REP_HOSTILE } }, mood: 'cold' })
/** A one-time greeting about something that happened in the world. */
export const news = (id: string, when: BlockSpec['when'], over: Partial<BlockSpec> = {}): BlockSpec =>
  ({ id, when: { ...when, unsaid: [id] }, ...over })
