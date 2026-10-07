import { conversation } from '../../dialog/build'
import type { ConversationDef } from '../../dialog/types'
import { brew, heal, mana, news, ready, rumor, trade, train, who } from './shared'

/**
 * Silverbridge: a busy river trade town built on an old stone bridge. A master
 * of every class teaches here, so pupils come from all over; the merchants
 * trade whatever the river carries. Not every trader hangs out a sign.
 */

/** Mayor Brenna Quill: runs the busiest bridge on the river. Proud, practical, dry. */
const mayorBrenna = conversation('mayorBrenna', {
  name: 'npc.mayorBrenna.name', look: 'mayorBrenna', mood: 'neutral',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'amused' },
    news('ending', { flags: ['throneDone'] }, { mood: 'proud' }),
    { id: 'again' }
  ],
  topics: [
    who({ lines: 'nn', mood: 'amused' }),
    { id: 'town', lines: 'nn', mood: 'proud' },
    { id: 'masters', lines: 'nn', mood: 'proud' },
    // The hint at the secret traders (roadmap #86): her second line.
    { id: 'river', lines: 'nn', mood: 'sly' },
    rumor([
      { id: 'crags', when: { uncleared: ['crags'] } },
      { id: 'mines', when: { uncleared: ['mines'] } },
      { id: 'tundra', when: { uncleared: ['tundra'] } },
      { id: 'far', mood: 'grave' }
    ])
  ],
  bye: [{ id: 'bye', mood: 'amused' }]
})

/** Friar Ansel: gentle hands, and always about to nod off. */
const sbHealer = conversation('sbHealer', {
  name: 'npc.sbHealer.name', look: 'sbHealer', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'amused' },
    { id: 'again', mood: 'weary' }
  ],
  topics: [
    heal(),
    mana(),
    { id: 'potions', lines: 'nn' },
    { id: 'sleep', mood: 'amused' }
  ],
  back: { healer: [{ id: 'healBack' }] },
  bye: [{ id: 'bye', mood: 'amused' }]
})

/** Odile Fernwhistle: the alchemist (#87). Herbs in her hair, ink on her nose, delighted by everything that grows. */
const sbAlchemist = conversation('sbAlchemist', {
  name: 'npc.sbAlchemist.name', look: 'sbAlchemist', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again', mood: 'warm' }
  ],
  topics: [
    brew(),
    who({ mood: 'amused' }),
    { id: 'herbs', lines: 'nn' },
    { id: 'elixirs', lines: 'nn' }
  ],
  back: { alchemy: [{ id: 'brewBack' }] },
  bye: [{ id: 'bye' }]
})

/** Greta Ironvein: armour from the mountains, opinions free of charge. */
const sbArmorer = conversation('sbArmorer', {
  name: 'npc.sbArmorer.name', look: 'sbArmorer', mood: 'amused',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again', mood: 'warm' }
  ],
  topics: [
    trade(),
    who(),
    { id: 'steel', lines: 'nn' }
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Corvin Ashby: fine blades, finer hair, and he knows it. */
const sbWeapons = conversation('sbWeapons', {
  name: 'npc.sbWeapons.name', look: 'sbWeapons', mood: 'proud',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again', mood: 'sly' }
  ],
  topics: [
    trade(),
    who({ mood: 'amused' }),
    { id: 'blades', lines: 'nn' }
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Tam Marlow: a street stall, a quick tongue, and ears everywhere. */
const sbJeweler = conversation('sbJeweler', {
  name: 'npc.sbJeweler.name', look: 'sbJeweler', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again' }
  ],
  topics: [
    trade(),
    who(),
    { id: 'gossip', lines: 'nn', mood: 'sly' }
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Dame Helga Stormshield: held this bridge once. Loud, jolly, unmovable. */
const sbMasterAegis = conversation('sbMasterAegis', {
  name: 'npc.sbMasterAegis.name', look: 'sbMasterAegis', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'excited' },
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('aegis'),
    { id: 'bridge', lines: 'nn', mood: 'proud' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Magister Ignatius Vale: fire as a careful craft. Fussy, precise, quietly funny. */
const sbMasterPyro = conversation('sbMasterPyro', {
  name: 'npc.sbMasterPyro.name', look: 'sbMasterPyro', mood: 'neutral',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again', mood: 'proud' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('pyro'),
    { id: 'sprocket', mood: 'amused' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Nyx Halloway: a pickpocket gone straight. Hides in the crowd, in broad daylight. */
const sbMasterShadow = conversation('sbMasterShadow', {
  name: 'npc.sbMasterShadow.name', look: 'sbMasterShadow', mood: 'amused',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'sly' },
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('shadow'),
    { id: 'past', lines: 'nn', mood: 'sly' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye', mood: 'sly' }]
})

/** Lord Percival Ashcombe: leads by saying please. Kind, gracious, a little fussy. */
const sbMasterSovereign = conversation('sbMasterSovereign', {
  name: 'npc.sbMasterSovereign.name', look: 'sbMasterSovereign', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'amused' },
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('sovereign'),
    { id: 'please' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Grandmother Tova Deeproot: tends a garden of stone. Chatty, feisty, all tea. */
const sbMasterGeo = conversation('sbMasterGeo', {
  name: 'npc.sbMasterGeo.name', look: 'sbMasterGeo', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again', mood: 'amused' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('geo'),
    { id: 'garden', lines: 'nn', mood: 'proud' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Professor Quint Sprocket: every lesson a demonstration, every demonstration loud. */
const sbMasterAether = conversation('sbMasterAether', {
  name: 'npc.sbMasterAether.name', look: 'sbMasterAether', mood: 'proud',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'excited' },
    { id: 'again', mood: 'excited' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('aether'),
    { id: 'eyebrows', mood: 'amused' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/**
 * The Clockwarden Selwyn: keeps the bridge clock, and once taught the Keeper
 * of Hours. In town only after the hero met that pupil (the town's `needs`).
 * Brisk, punctual, dry.
 */
const sbMasterChrono = conversation('sbMasterChrono', {
  name: 'npc.sbMasterChrono.name', look: 'sbMasterChrono', mood: 'neutral',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('chrono'),
    { id: 'keeper', mood: 'amused' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/**
 * Vesper Crimsonleaf: an alchemist of essence, and a friend of Doctor
 * Sangrel's. In town only after the hero found him. Bright, kind, fond of mint.
 */
const sbMasterBlood = conversation('sbMasterBlood', {
  name: 'npc.sbMasterBlood.name', look: 'sbMasterBlood', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'amused' },
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('blood'),
    { id: 'herbs', lines: 'nn' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

export const SILVERBRIDGE_TALK: ConversationDef[] = [
  mayorBrenna, sbHealer, sbAlchemist, sbArmorer, sbWeapons, sbJeweler,
  sbMasterAegis, sbMasterPyro, sbMasterShadow, sbMasterSovereign, sbMasterGeo, sbMasterAether,
  sbMasterChrono, sbMasterBlood
]
