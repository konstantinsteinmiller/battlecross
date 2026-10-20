import type { ConversationDef } from '../../dialog/types'
import { conversation } from '../../dialog/build'
import { play, who } from './shared'

/**
 * ─── The fort's fair corner (afterplay §9) ──────────────────────────────────
 *
 * The three barkers of the new fair games, each at a table of their own
 * (`game/fair.ts`). Their talk is short: a hello that tells the rules, who
 * they are, the game. No topic of the hero's own, so no new hero line to
 * record (the rules are on the game's window too).
 */

/** Pip: a wiry fair barker with a mallet and a voice that carries over a crowd. Whack-a-Imp. */
const fairPip = conversation('fairPip', {
  name: 'npc.fairPip.name', look: 'fairPip', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nnn' },
    { id: 'again' }
  ],
  topics: [
    play('whack'),
    who()
  ],
  back: { whack: [{ id: 'playBack' }] },
  bye: [{ id: 'bye' }]
})

/** Old Bess: a dry old carnival woman who carved the wooden hydra herself. Ring Toss. */
const fairBess = conversation('fairBess', {
  name: 'npc.fairBess.name', look: 'fairBess', mood: 'amused',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nnn' },
    { id: 'again' }
  ],
  topics: [
    play('ring'),
    who()
  ],
  back: { ring: [{ id: 'playBack' }] },
  bye: [{ id: 'bye' }]
})

/** Hob: the Forgemaster's apprentice, huge, shy and very proud of his arms. Arm-Wrestle. */
const fairHob = conversation('fairHob', {
  name: 'npc.fairHob.name', look: 'fairHob', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nnn' },
    { id: 'again' }
  ],
  topics: [
    play('arm'),
    who()
  ],
  back: { arm: [{ id: 'playBack' }] },
  bye: [{ id: 'bye' }]
})

export const FAIR_TALK: ConversationDef[] = [fairPip, fairBess, fairHob]
