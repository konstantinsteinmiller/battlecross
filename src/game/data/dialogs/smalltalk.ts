import type { BlockDef, Cond, ConversationDef, LineDef } from '../../dialog/types'

/**
 * ─── Overheard small talk (roadmap #42) ──────────────────────────────────────
 *
 * What two townspeople say to each other when the hero passes close by a
 * chat: an EXCHANGE of two or three short lines, spoken in turn over the two
 * heads (`game/overheard.ts`), no choices, never the same exchange twice in a
 * visit. A conversation per town (and one for its children); each exchange is
 * a block, the first speaker `npc`, the other `townsfolk`. The world's flags
 * choose what is talked about (a fallen Oakhaven is a frightened place).
 *
 * Line ids follow every conversation's: `dlg.<conversation>.<exchange>.<n>`.
 */

/** An exchange: `who` is one letter per line, `a` the one who started the chat, `b` the other. */
const ex = (conv: string, id: string, who: string, when?: Cond): BlockDef => ({
  id,
  when,
  lines: [...who].map((w, k): LineDef => ({ id: `dlg.${conv}.${id}.${k + 1}`, by: w === 'a' ? 'npc' : 'townsfolk', emotion: 'neutral' }))
})

const town = (id: string, look: string, blocks: Array<[string, string, Cond?]>): ConversationDef => ({
  id,
  name: 'dlg.ui.overheard',
  look,
  voice: id,
  greet: blocks.map(([b, who, when]) => ex(id, b, who, when)),
  nodes: {},
  back: {},
  bye: []
})

export const SMALLTALK: readonly ConversationDef[] = [
  town('smalltalkSunford', 'villager', [
    ['weather', 'aba'],
    ['harvest', 'ab'],
    ['goblins', 'aba', { quest: { goblinKing: false } }],
    ['kingGone', 'ab', { quest: { goblinKing: 'slay' } }],
    ['pact', 'aba', { flags: ['goblinPact'] }],
    ['bram', 'ab'],
    ['pie', 'aba'],
    ['road', 'ab', { uncleared: ['plains'] }],
    ['hero', 'ab', { cleared: ['plains'] }]
  ]),
  town('smalltalkOakhaven', 'merchantF', [
    ['prices', 'aba', { not: ['oakhavenFallen'] }],
    ['watch', 'ab', { not: ['oakhavenFallen'] }],
    ['caravan', 'aba', { not: ['oakhavenFallen'] }],
    ['siege', 'ab', { quest: { siege: false } }],
    ['saved', 'aba', { flags: ['oakhavenSaved'] }],
    ['fountain', 'ab', { not: ['oakhavenFallen'] }],
    ['ash', 'ab', { flags: ['oakhavenFallen'] }],
    ['hide', 'aba', { flags: ['oakhavenFallen'] }],
    ['bread', 'ab', { flags: ['oakhavenFallen'] }]
  ]),
  town('smalltalkIronhold', 'miner', [
    ['ore', 'aba'],
    ['forge', 'ab'],
    ['beard', 'aba'],
    ['core', 'ab', { quest: { core: false } }],
    ['order', 'ab', { flags: ['coreOrder'] }],
    ['circle', 'ab', { flags: ['coreCircle'] }],
    ['cold', 'ab']
  ]),
  town('smalltalkKids', 'child', [
    ['tag', 'ab'],
    ['dragon', 'aba'],
    ['sword', 'ab'],
    ['frog', 'aba']
  ])
]

/** The small-talk conversation of a town (children have their own everywhere). */
export const smalltalkOf = (town: string, children: boolean): ConversationDef | undefined =>
  SMALLTALK.find(c => c.id === (children ? 'smalltalkKids' : `smalltalk${town[0]!.toUpperCase()}${town.slice(1)}`))
