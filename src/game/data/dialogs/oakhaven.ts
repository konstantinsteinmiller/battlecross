import { conversation } from '../../dialog/build'
import type { ConversationDef } from '../../dialog/types'
import { foe, friend, heal, mana, news, ready, rumor, trade, train, who } from './shared'

/**
 * Oakhaven: a walled trade town under siege. Defended, it prospers; betrayed,
 * it is a ruin with a black market, and other people stand in its streets.
 */

/** Captain Hale: commands what is left of the watch. Weary, and unbending. */
const captainHale = conversation('captainHale', {
  name: 'npc.captainHale.name', look: 'captain', mood: 'weary',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('saved', { flags: ['oakhavenSaved'] }, { mood: 'proud' }),
    news('ending', { flags: ['throneDone'] }, { mood: 'grave' }),
    { id: 'again', when: { quest: { siege: false } } },
    { id: 'after', mood: 'warm' }
  ],
  topics: [
    // The siege, told as an exchange; decided at the outskirts.
    { id: 'quest', lines: 'nhnn', when: { quest: { siege: false } }, once: false, icon: 'quest', fx: [{ t: 'hint', quest: 'siege' }], mood: 'grave' },
    { id: 'siege', lines: 'nn', when: { quest: { siege: 'defend' } } },
    { id: 'town', lines: 'nn' },
    { id: 'order' },
    rumor([
      { id: 'crags', when: { uncleared: ['crags'] } },
      { id: 'mines', when: { uncleared: ['mines'] } },
      { id: 'north', mood: 'grave' }
    ])
  ],
  bye: [{ id: 'bye' }]
})

/** Odo the Armorer, while the siege lasts: harried, short of everything. */
const oakArmorer = conversation('oakArmorer', {
  name: 'npc.oakArmorer.name', look: 'smith', mood: 'weary',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again' }
  ],
  topics: [
    trade(),
    who(),
    { id: 'armor' },
    rumor([{ id: 'backRoom' }])
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Master Odo, in the town the hero saved: grateful, busy, sleepless. */
const oakMasterArmorer = conversation('oakMasterArmorer', {
  name: 'npc.oakMasterArmorer.name', look: 'smith', voice: 'oakArmorer', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'excited' },
    news('ending', { flags: ['throneDone'] }, { mood: 'proud' }),
    { id: 'again' }
  ],
  topics: [
    trade(),
    { id: 'town', lines: 'nn', mood: 'amused' },
    rumor([
      { id: 'mines', when: { uncleared: ['mines'] } },
      { id: 'tundra' }
    ])
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Senna Blades: sells edges to whoever pays, and has outlived most of them. */
const oakWeapons = conversation('oakWeapons', {
  name: 'npc.oakWeapons.name', look: 'peddler', mood: 'cold',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('saved', { flags: ['oakhavenSaved'] }, { mood: 'sly' }),
    { id: 'again' }
  ],
  topics: [
    trade(),
    who(),
    rumor([
      { id: 'krag', when: { quest: { siege: false } }, mood: 'sly' },
      { id: 'which' }
    ])
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** The Whisper: teaches the Syndicate's knife-work. Stays, whoever holds the town. */
const trainerShadow = conversation('trainerShadow', {
  name: 'npc.trainerShadow.name', look: 'trainerShadow', mood: 'whisper',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('fallen', { flags: ['oakhavenFallen'] }),
    friend('syndicate'),
    foe('syndicate'),
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('shadow'),
    { id: 'syndicate', mood: 'sly' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Lord Castellan: old blood of Oakhaven, teaching command from a great height. */
const trainerSovereign = conversation('trainerSovereign', {
  name: 'npc.trainerSovereign.name', look: 'trainerSovereign', mood: 'proud',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('saved', { flags: ['oakhavenSaved'] }, { mood: 'warm' }),
    friend('order'),
    foe('order'),
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('sovereign'),
    { id: 'family' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Brother Fenn: forty wounded on the wall and one of him. Cheerful about it. */
const oakHealer = conversation('oakHealer', {
  name: 'npc.oakHealer.name', look: 'healer', mood: 'amused',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('saved', { flags: ['oakhavenSaved'] }),
    { id: 'again' }
  ],
  topics: [
    heal(),
    mana(),
    { id: 'potions' },
    rumor([
      { id: 'archers', when: { quest: { siege: false } } },
      { id: 'north' }
    ])
  ],
  back: { healer: [{ id: 'healBack' }] },
  bye: [{ id: 'bye' }]
})

/** The Fence: the black market of the ruin. No names, no questions. */
const blackMarket = conversation('blackMarket', {
  name: 'npc.blackMarket.name', look: 'fence', mood: 'sly',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    foe('syndicate'),
    { id: 'again' }
  ],
  topics: [
    trade(),
    who({ mood: 'amused' }),
    { id: 'armor' },
    rumor([
      { id: 'citadel', when: { uncleared: ['citadel'] }, mood: 'grave' },
      { id: 'crystals', mood: 'grave' }
    ])
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/**
 * Doctor Sangrel: the Blood Alchemist. In the ruin of Oakhaven the Syndicate
 * shelters him; otherwise he is found hiding in the Citadel of the Void (from
 * the world map, with no town around him).
 */
const trainerBlood = conversation('trainerBlood', {
  name: 'npc.trainerBlood.name', look: 'trainerBlood', mood: 'cold',
  greet: [
    { id: 'hello', when: { met: false, flags: ['oakhavenFallen'] }, lines: 'nn' },
    { id: 'found', when: { met: false }, lines: 'nn' },
    friend('syndicate'),
    foe('syndicate'),
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('blood'),
    { id: 'jars', mood: 'amused' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Madam Ash: the Syndicate's hand in Oakhaven. Smooth, patient, dangerous. */
const syndicateBoss = conversation('syndicateBoss', {
  name: 'npc.syndicateBoss.name', look: 'fence', mood: 'sly',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('throneOurs', { flags: ['endSyndicate'] }, { mood: 'proud' }),
    news('throneLost', { flags: ['throneDone'], not: ['endSyndicate'] }, { mood: 'cold' }),
    foe('syndicate'),
    { id: 'again' }
  ],
  topics: [
    // The Warlord's promise, paid in a ruin's coin.
    { id: 'cut', lines: 'nn', icon: 'gift', fx: [{ t: 'gold', n: 250 }] },
    { id: 'syndicate', lines: 'nn' },
    { id: 'order', mood: 'amused' },
    rumor([
      { id: 'core', when: { quest: { core: false } } },
      { id: 'sold', when: { flags: ['coreSold'] }, mood: 'amused' },
      { id: 'north' }
    ])
  ],
  bye: [{ id: 'bye' }]
})

export const OAKHAVEN_TALK: ConversationDef[] = [
  captainHale, oakArmorer, oakMasterArmorer, oakWeapons, trainerShadow, trainerSovereign, oakHealer, blackMarket,
  trainerBlood, syndicateBoss
]
