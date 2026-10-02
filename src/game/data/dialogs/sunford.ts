import { conversation } from '../../dialog/build'
import type { ConversationDef } from '../../dialog/types'
import { foe, friend, heal, mana, news, ready, rumor, trade, train, who } from './shared'

/**
 * Sunford: the farming town the hero comes home to. Its people talk about the
 * plains road, the goblins of the Hollows and — later — what became of them.
 */

/** Bram the Smith: gruff, few words, proud of plain steel. */
const sunfordSmith = conversation('sunfordSmith', {
  name: 'npc.sunfordSmith.name', look: 'smith', mood: 'gruff',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('kingDead', { quest: { goblinKing: 'slay' } }),
    news('kingPact', { quest: { goblinKing: 'pact' } }),
    news('kingRansom', { quest: { goblinKing: 'ransom' } }),
    news('ending', { flags: ['throneDone'] }),
    { id: 'again' }
  ],
  topics: [
    trade(),
    who({ lines: 'nn' }),
    { id: 'gear', lines: 'nn' },
    rumor([
      { id: 'plains', when: { uncleared: ['plains'] } },
      { id: 'hollows', when: { quest: { goblinKing: false } } },
      { id: 'woods', when: { uncleared: ['woods'] } },
      { id: 'siege', when: { uncleared: ['outskirts'] } },
      { id: 'north' }
    ])
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Tilly the Peddler: chirpy, shifty, talks faster than she thinks. */
const sunfordPeddler = conversation('sunfordPeddler', {
  name: 'npc.sunfordPeddler.name', look: 'peddler', mood: 'amused',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('rival', { flags: ['goblinPact'] }, { mood: 'afraid' }),
    { id: 'again' }
  ],
  topics: [
    trade(),
    who({ lines: 'nn' }),
    { id: 'trinkets' },
    // GDD §4.1: Charisma opens dialogue options. She pays for silence.
    { id: 'stolen', lines: 'nn', needs: { attrs: { cha: 8 } }, icon: 'gift', fx: [{ t: 'item', id: 'copperBand' }], mood: 'afraid' },
    rumor([
      { id: 'arenaShut', when: { not: ['arenaOpen'] } },
      { id: 'arenaOpen', when: { uncleared: ['arena'] }, mood: 'excited' },
      { id: 'east' }
    ])
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Ser Aldric: an old knight of the Iron Order, formal and dutiful. */
const trainerAegis = conversation('trainerAegis', {
  name: 'npc.trainerAegis.name', look: 'trainerAegis', mood: 'grave',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'proud' },
    news('saved', { flags: ['oakhavenSaved'] }, { mood: 'proud' }),
    news('fallen', { flags: ['oakhavenFallen'] }, { mood: 'angry' }),
    news('dragon', { flags: ['dragonSlain'] }, { mood: 'proud' }),
    friend('order'),
    foe('order'),
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('aegis'),
    { id: 'order', lines: 'nn' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Ember Wren: a pyromancer of the Circle who loves her work a little too much. */
const trainerPyro = conversation('trainerPyro', {
  name: 'npc.trainerPyro.name', look: 'trainerPyro', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('core', { flags: ['coreCircle'] }),
    friend('circle'),
    foe('circle'),
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('pyro'),
    { id: 'circle' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Elder Mara: forty years of Sunford's ledger and its peace. Warm, and tired. */
const elderMara = conversation('elderMara', {
  name: 'npc.elderMara.name', look: 'elder', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('slain', { quest: { goblinKing: 'slay' } }),
    news('pact', { quest: { goblinKing: 'pact' } }, { mood: 'amused' }),
    news('ransom', { quest: { goblinKing: 'ransom' } }, { mood: 'sad' }),
    news('saved', { flags: ['oakhavenSaved'] }),
    news('fallen', { flags: ['oakhavenFallen'] }, { mood: 'sad' }),
    news('ending', { flags: ['throneDone'] }, { mood: 'proud' }),
    { id: 'again' }
  ],
  topics: [
    // The town's thanks for the plains road.
    { id: 'reward', lines: 'nn', when: { cleared: ['plains'] }, icon: 'gift', fx: [{ t: 'gold', n: 60 }] },
    // The Goblin King, told as an exchange; decided in the Hollows.
    { id: 'quest', lines: 'nhnn', when: { quest: { goblinKing: false } }, once: false, icon: 'quest', fx: [{ t: 'hint', quest: 'goblinKing' }], mood: 'grave' },
    {
      id: 'king', when: { quest: { goblinKing: true } },
      alt: [
        { id: 'slay', when: { quest: { goblinKing: 'slay' } }, mood: 'grave' },
        { id: 'pact', when: { quest: { goblinKing: 'pact' } }, mood: 'amused' },
        { id: 'ransom', mood: 'weary' }
      ]
    },
    { id: 'town', lines: 'nn' },
    {
      id: 'next', once: false,
      alt: [
        { id: 'plains', when: { uncleared: ['plains'] } },
        { id: 'hollows', when: { quest: { goblinKing: false } } },
        { id: 'woods', when: { uncleared: ['woods'] } },
        { id: 'oakhaven', when: { uncleared: ['outskirts'] } },
        { id: 'north' }
      ]
    }
  ],
  bye: [{ id: 'bye' }]
})

/** Sister Lune: gentle hands, dry humour. */
const sunfordHealer = conversation('sunfordHealer', {
  name: 'npc.sunfordHealer.name', look: 'healer', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again', mood: 'amused' }
  ],
  topics: [
    heal(),
    mana(),
    { id: 'potions', lines: 'nn' },
    rumor([
      { id: 'goblins', when: { uncleared: ['hollows'] } },
      { id: 'spiders', when: { uncleared: ['woods'] } },
      { id: 'burns' }
    ])
  ],
  back: { healer: [{ id: 'healBack' }] },
  bye: [{ id: 'bye', mood: 'amused' }]
})

/** Grik the Trader: a goblin who has discovered commerce, and pies. */
const goblinTrader = conversation('goblinTrader', {
  name: 'npc.goblinTrader.name', look: 'goblinTrader', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again' }
  ],
  topics: [
    trade(),
    { id: 'king', lines: 'nn' },
    { id: 'town', mood: 'amused' },
    rumor([
      { id: 'crags', when: { uncleared: ['crags'] }, mood: 'afraid' },
      { id: 'deep', mood: 'grave' }
    ])
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

export const SUNFORD_TALK: ConversationDef[] = [
  sunfordSmith, sunfordPeddler, trainerAegis, trainerPyro, elderMara, sunfordHealer, goblinTrader
]
