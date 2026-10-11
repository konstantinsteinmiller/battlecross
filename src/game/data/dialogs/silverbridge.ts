import { conversation } from '../../dialog/build'
import type { ConversationDef } from '../../dialog/types'
import { brew, heal, mana, news, play, ready, rumor, trade, train, who, smithing } from './shared'

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

/** Alder Vane, the Collector: a dusty old man in a room full of curiosities; opens his cabinets to friends only (#86). */
const sbCollector = conversation('sbCollector', {
  name: 'npc.sbCollector.name', look: 'sbCollector', mood: 'amused',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'open', when: { flags: ['collectorOpen'] } },
    { id: 'again' }
  ],
  topics: [
    trade({ when: { flags: ['collectorOpen'] } }),
    // The favour (roadmap #86): asked, waited on, handed in.
    { id: 'favor', lines: 'nn', when: { errand: { collectorFavor: 'none' } }, fx: [{ t: 'errand', id: 'collectorFavor', act: 'start' }] },
    { id: 'waiting', once: false, when: { errand: { collectorFavor: 'active' } } },
    { id: 'favorDone', lines: 'nn', when: { errand: { collectorFavor: 'ready' } }, fx: [{ t: 'errand', id: 'collectorFavor', act: 'complete' }], mood: 'warm' },
    who()
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Mirela Thorne: a fence by the river steps, sharp as a pin and fair to those she trusts (#86). */
const sbFence = conversation('sbFence', {
  name: 'npc.sbFence.name', look: 'sbFence', mood: 'sly',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'open', when: { flags: ['mirelaOpen'] } },
    { id: 'again' }
  ],
  topics: [
    trade({ when: { flags: ['mirelaOpen'] } }),
    // The favour (roadmap #86): asked, waited on, handed in.
    { id: 'favor', lines: 'nn', when: { errand: { mirelaFavor: 'none' } }, fx: [{ t: 'errand', id: 'mirelaFavor', act: 'start' }] },
    { id: 'waiting', once: false, when: { errand: { mirelaFavor: 'active' } } },
    { id: 'favorDone', lines: 'nn', when: { errand: { mirelaFavor: 'ready' } }, fx: [{ t: 'errand', id: 'mirelaFavor', act: 'complete' }], mood: 'warm' },
    who()
  ],
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

/** Madame Pell: the memory stand's showwoman, all sparkle and sand-glass (#91). */
const sbGambler = conversation('sbGambler', {
  name: 'npc.sbGambler.name', look: 'sbGambler', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again' }
  ],
  topics: [
    play('memory'),
    { id: 'rules', lines: 'nn' },
    who(),
    { id: 'prize', mood: 'sly' }
  ],
  back: { memory: [{ id: 'playBack' }] },
  bye: [{ id: 'bye' }]
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
    // Ore and the forge (#99).
    ...smithing(),
    who(),
    { id: 'steel', lines: 'nn' }
  ],
  back: { shop: [{ id: 'shopBack' }], smithing: [{ id: 'forgeBack' }] },
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

/**
 * The eight new Silverbridge masters (#86, #95). Drop into
 * src/game/data/dialogs/silverbridge.ts and append NEW_MASTERS to SILVERBRIDGE_TALK.
 *
 * The secret four (Windrunner, Frostwarden, Lightbringer, Beastcaller) follow the
 * secret traders' favour flow: a face in the street until their test is handed
 * in, which sets `found<Class>`; only then do they teach.
 * `ready()` takes no over-props, so the secret ones spread it and add the gate
 * (or shared.ts's `ready` gains an `over: Partial<TopicSpec> = {}` like `train`).
 */

/** Sefa Galewing: a cheerful, restless archer who can never sit down. Lives in the old windmill loft (#86). */
const sbMasterWindrunner = conversation('sbMasterWindrunner', {
  name: 'npc.sbMasterWindrunner.name', look: 'sbMasterWindrunner', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'open', when: { flags: ['foundWindrunner'] } },
    { id: 'again', mood: 'amused' }
  ],
  topics: [
    train({ when: { flags: ['foundWindrunner'] } }),
    // The test (#86): asked, waited on, handed in.
    { id: 'favor', lines: 'nn', when: { errand: { windrunnerTest: 'none' } }, fx: [{ t: 'errand', id: 'windrunnerTest', act: 'start' }] },
    { id: 'waiting', once: false, when: { errand: { windrunnerTest: 'active' } } },
    { id: 'favorDone', lines: 'nn', when: { errand: { windrunnerTest: 'ready' } }, fx: [{ t: 'errand', id: 'windrunnerTest', act: 'complete' }], mood: 'warm' },
    { id: 'class', lines: 'nn', when: { flags: ['foundWindrunner'] } },
    { ...ready('windrunner'), when: { flags: ['foundWindrunner'] } },
    who({ lines: 'nn', mood: 'amused' })
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye', mood: 'amused' }]
})

/** Halvard Rimeheart: a calm northern knight of few words. Keeps to the icehouse by the docks (#86). */
const sbMasterFrostwarden = conversation('sbMasterFrostwarden', {
  name: 'npc.sbMasterFrostwarden.name', look: 'sbMasterFrostwarden', mood: 'neutral',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'open', when: { flags: ['foundFrostwarden'] }, mood: 'warm' },
    { id: 'again' }
  ],
  topics: [
    train({ when: { flags: ['foundFrostwarden'] } }),
    // The test (#86): asked, waited on, handed in.
    { id: 'favor', lines: 'nn', when: { errand: { frostwardenTest: 'none' } }, fx: [{ t: 'errand', id: 'frostwardenTest', act: 'start' }] },
    { id: 'waiting', once: false, when: { errand: { frostwardenTest: 'active' } } },
    { id: 'favorDone', lines: 'nn', when: { errand: { frostwardenTest: 'ready' } }, fx: [{ t: 'errand', id: 'frostwardenTest', act: 'complete' }], mood: 'warm' },
    { id: 'class', lines: 'nn', when: { flags: ['foundFrostwarden'] } },
    { ...ready('frostwarden'), when: { flags: ['foundFrostwarden'] } },
    who()
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye', mood: 'amused' }]
})

/** Sister Auriel Dawnmere: warm and teasing, hums old hymns, tends the lamp-tower at the bridge's end (#86). */
const sbMasterLightbringer = conversation('sbMasterLightbringer', {
  name: 'npc.sbMasterLightbringer.name', look: 'sbMasterLightbringer', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'amused' },
    { id: 'open', when: { flags: ['foundLightbringer'] } },
    { id: 'again' }
  ],
  topics: [
    train({ when: { flags: ['foundLightbringer'] } }),
    // The test (#86): asked, waited on, handed in.
    { id: 'favor', lines: 'nn', when: { errand: { lightbringerTest: 'none' } }, fx: [{ t: 'errand', id: 'lightbringerTest', act: 'start' }] },
    { id: 'waiting', once: false, when: { errand: { lightbringerTest: 'active' } }, mood: 'amused' },
    { id: 'favorDone', lines: 'nn', when: { errand: { lightbringerTest: 'ready' } }, fx: [{ t: 'errand', id: 'lightbringerTest', act: 'complete' }], mood: 'excited' },
    { id: 'class', lines: 'nn', when: { flags: ['foundLightbringer'] } },
    { ...ready('lightbringer'), when: { flags: ['foundLightbringer'] } },
    who()
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Old Rowan Thistlefoot: a gruff hermit with a three-legged fox, kinder to animals than to people (#86). */
const sbMasterBeastcaller = conversation('sbMasterBeastcaller', {
  name: 'npc.sbMasterBeastcaller.name', look: 'sbMasterBeastcaller', mood: 'gruff',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'open', when: { flags: ['foundBeastcaller'] }, mood: 'warm' },
    { id: 'again' }
  ],
  topics: [
    train({ when: { flags: ['foundBeastcaller'] } }),
    // The test (#86): asked, waited on, handed in.
    { id: 'favor', lines: 'nnn', when: { errand: { beastcallerTest: 'none' } }, fx: [{ t: 'errand', id: 'beastcallerTest', act: 'start' }] },
    { id: 'waiting', once: false, when: { errand: { beastcallerTest: 'active' } } },
    { id: 'favorDone', lines: 'nn', when: { errand: { beastcallerTest: 'ready' } }, fx: [{ t: 'errand', id: 'beastcallerTest', act: 'complete' }], mood: 'warm' },
    { id: 'class', lines: 'nn', when: { flags: ['foundBeastcaller'] } },
    { ...ready('beastcaller'), when: { flags: ['foundBeastcaller'] } },
    who({ lines: 'nn' })
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye', mood: 'warm' }]
})

/** Magistra Iris Fourwinds: bubbly and quick, juggles four tiny orbs, sets her own sleeve alight (#95). */
const sbMasterElementalist = conversation('sbMasterElementalist', {
  name: 'npc.sbMasterElementalist.name', look: 'sbMasterElementalist', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again', mood: 'amused' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('elementalist'),
    { id: 'sleeve', lines: 'nn', mood: 'amused' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye', mood: 'amused' }]
})

/** Warden Odalys Lanternlight: soft-spoken and kind; no spirit is bad, only lost (#95). */
const sbMasterSoulwarden = conversation('sbMasterSoulwarden', {
  name: 'npc.sbMasterSoulwarden.name', look: 'sbMasterSoulwarden', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn', mood: 'amused' },
    { id: 'again' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('soulwarden'),
    { id: 'wisps', lines: 'nn' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye' }]
})

/** Master Oru Stillwater: calm, dry, answers in short proverbs, very serious about noodles (#95). */
const sbMasterIronmonk = conversation('sbMasterIronmonk', {
  name: 'npc.sbMasterIronmonk.name', look: 'sbMasterIronmonk', mood: 'neutral',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again', mood: 'amused' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('ironmonk'),
    { id: 'noodles', lines: 'nn', mood: 'proud' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye', mood: 'amused' }]
})

/** Lark Merriweather: the tavern's bard; rhymes by accident, can't finish a story without a song (#95). */
const sbMasterBard = conversation('sbMasterBard', {
  name: 'npc.sbMasterBard.name', look: 'sbMasterBard', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'again', mood: 'warm' }
  ],
  topics: [
    train(),
    { id: 'class', lines: 'nn' },
    ready('bard'),
    { id: 'story', lines: 'nnn', mood: 'amused' }
  ],
  back: { trainer: [{ id: 'trainBack' }] },
  bye: [{ id: 'bye', mood: 'amused' }]
})

const NEW_MASTERS: ConversationDef[] = [
  sbMasterWindrunner, sbMasterFrostwarden, sbMasterLightbringer, sbMasterBeastcaller,
  sbMasterElementalist, sbMasterSoulwarden, sbMasterIronmonk, sbMasterBard
]

export const SILVERBRIDGE_TALK: ConversationDef[] = [
  mayorBrenna, sbHealer, sbAlchemist, sbGambler, sbCollector, sbFence, sbArmorer, sbWeapons, sbJeweler,
  sbMasterAegis, sbMasterPyro, sbMasterShadow, sbMasterSovereign, sbMasterGeo, sbMasterAether,
  sbMasterChrono, sbMasterBlood,
  ...NEW_MASTERS
]
