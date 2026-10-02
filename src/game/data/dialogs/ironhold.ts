import { conversation } from '../../dialog/build'
import type { ConversationDef } from '../../dialog/types'
import { foe, friend, heal, mana, news, ready, rumor, trade, train, who } from './shared'

/**
 * Ironhold: the mountain forge-town, and the hidden teacher of the Sunken
 * Temple. What the hero did with the aether core decides who trades here.
 */

/** Forgemaster Dorn: a dwarf with a problem the size of a mountain. */
const forgemaster = conversation('forgemaster', {
  name: 'npc.forgemaster.name', look: 'dwarf', mood: 'gruff',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('destroyed', { flags: ['coreOrder'] }, { mood: 'warm' }),
    news('studied', { flags: ['coreCircle'] }),
    news('sold', { flags: ['coreSold'] }, { mood: 'angry' }),
    news('ending', { flags: ['throneDone'] }, { mood: 'grave' }),
    { id: 'again' }
  ],
  topics: [
    // The core, told as an exchange; decided at the bottom of the mines.
    { id: 'quest', lines: 'nhnn', when: { quest: { core: false } }, once: false, icon: 'quest', fx: [{ t: 'hint', quest: 'core' }], mood: 'grave' },
    {
      id: 'core', when: { quest: { core: true } },
      alt: [
        { id: 'destroy', when: { quest: { core: 'destroy' } }, mood: 'warm' },
        { id: 'study', when: { quest: { core: 'study' } } },
        { id: 'sell', mood: 'angry' }
      ]
    },
    { id: 'town', lines: 'nn' },
    rumor([
      { id: 'tundra', when: { uncleared: ['tundra'] } },
      { id: 'citadel', when: { uncleared: ['citadel'] }, mood: 'grave' },
      { id: 'fortress', mood: 'grave' }
    ])
  ],
  bye: [{ id: 'bye' }]
})

/** Hilda Hammerhand: dwarf-forged, every piece, and she will tell you so. */
const ironWeapons = conversation('ironWeapons', {
  name: 'npc.ironWeapons.name', look: 'dwarf', mood: 'proud',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('dragon', { flags: ['dragonSlain'] }, { mood: 'excited' }),
    { id: 'again' }
  ],
  topics: [
    trade(),
    who(),
    rumor([
      { id: 'golems', when: { quest: { core: false } }, mood: 'gruff' },
      { id: 'arm' }
    ])
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Tinker Voss: the Circle's engineer, armed with everything the core taught. */
const ironAetherWorks = conversation('ironAetherWorks', {
  name: 'npc.ironAetherWorks.name', look: 'tinker', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again' }
  ],
  topics: [
    trade(),
    { id: 'core', mood: 'grave' },
    rumor([{ id: 'heat' }])
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Garrun Ironside: armour, rings, and as few words as will do. */
const ironArmor = conversation('ironArmor', {
  name: 'npc.ironArmor.name', look: 'smith', mood: 'gruff',
  greet: [
    { id: 'hello', when: { met: false } },
    { id: 'again' }
  ],
  topics: [
    trade(),
    { id: 'quiet' },
    rumor([
      { id: 'giants', when: { uncleared: ['tundra'] } },
      { id: 'demons' }
    ])
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** The Order's Quartermaster: clipped, correct, and not allowed to joke. */
const ironOrderArmor = conversation('ironOrderArmor', {
  name: 'npc.ironOrderArmor.name', look: 'smith', mood: 'cold',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('throneOurs', { flags: ['endOrder'] }, { mood: 'proud' }),
    foe('order'),
    { id: 'again' }
  ],
  topics: [
    trade(),
    { id: 'order' },
    rumor([{ id: 'throne' }])
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Old Stonefoot: listens to the ground, and serves nobody. */
const trainerGeo = conversation('trainerGeo', {
  name: 'npc.trainerGeo.name', look: 'trainerGeo', mood: 'weary',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('core', { quest: { core: true } }, { mood: 'grave' }),
    news('dragon', { flags: ['dragonPact'] }),
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('geo'),
    { id: 'factions' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Gearwright Pim: guns, turrets, heat gauges, and very little sleep. */
const trainerAether = conversation('trainerAether', {
  name: 'npc.trainerAether.name', look: 'trainerAether', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('core', { flags: ['coreCircle'] }),
    news('oracle', { flags: ['oracleSlain'] }, { mood: 'afraid' }),
    friend('circle'),
    foe('circle'),
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('aether'),
    { id: 'heat' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Mother Brynja: has set every broken bone in the mountain twice. */
const ironHealer = conversation('ironHealer', {
  name: 'npc.ironHealer.name', look: 'healer', mood: 'gruff',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('ending', { flags: ['throneDone'] }, { mood: 'warm' }),
    { id: 'again' }
  ],
  topics: [
    heal(),
    mana(),
    { id: 'potions' },
    rumor([
      { id: 'tundra', when: { uncleared: ['tundra'] } },
      { id: 'temple', when: { uncleared: ['temple'] } },
      { id: 'rift', mood: 'grave' }
    ])
  ],
  back: { healer: [{ id: 'healBack' }] },
  bye: [{ id: 'bye', mood: 'warm' }]
})

/** Lord Castellan, in exile: teaches in a dwarf's cellar, and forgives nothing. */
const exiledSovereign = conversation('exiledSovereign', {
  name: 'npc.exiledSovereign.name', look: 'trainerSovereign', voice: 'trainerSovereign', mood: 'cold',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'angry' },
    news('ending', { flags: ['throneDone'] }, { mood: 'angry' }),
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('sovereign'),
    { id: 'oakhaven', lines: 'nn', mood: 'sad' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/**
 * The Keeper of Hours: the oracle's pupil, found in the Sunken Temple — or on
 * Dragon's Peak, having fled, if the oracle was slain. Met from the world map.
 * Speaks a little out of order.
 */
const trainerChrono = conversation('trainerChrono', {
  name: 'npc.trainerChrono.name', look: 'trainerChrono', mood: 'grave',
  greet: [
    { id: 'fled', when: { met: false, flags: ['oracleSlain'] }, lines: 'nn', mood: 'sad' },
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('freed', { flags: ['oracleFreed'] }, { mood: 'warm' }),
    friend('circle'),
    foe('circle'),
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('chrono'),
    {
      id: 'oracle',
      alt: [
        { id: 'freed', when: { flags: ['oracleFreed'] }, mood: 'warm' },
        { id: 'slain', when: { flags: ['oracleSlain'] }, mood: 'sad' },
        { id: 'waits' }
      ]
    }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

export const IRONHOLD_TALK: ConversationDef[] = [
  forgemaster, ironWeapons, ironAetherWorks, ironArmor, ironOrderArmor, trainerGeo, trainerAether, ironHealer,
  exiledSovereign, trainerChrono
]
