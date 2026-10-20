import { conversation, decision } from '../../dialog/build'
import type { BlockSpec, ConvSpec } from '../../dialog/build'
import type { ConversationDef } from '../../dialog/types'
import { RIFT_SEALED, SEAL_QUEST, purgedFlag } from '../breaking'
import { news, rumor, who } from './shared'
import { siegeTopic } from './siege'

/**
 * ─── The Breaking: the afterplay's story, B0–B10 (docs/gdd-afterplay.md §1) ───
 *
 * Two beats told on the world map as a portrait (`flow.ts`, `playMapBeat`):
 * the rift's scream as the Void Lord falls (B0, the intro's storyteller), and
 * Scout Wren finding the hero (B1). Then the fort's own people at Bastion
 * Crossing: the captain (or Elder Mara in his stead, should Oakhaven have
 * fallen), Mara, and Wren, each with a word for every step of the chain.
 *
 * B6–B10 come to the hero on the map as B1 did: whoever the step concerns
 * says it in two lines, then B10's one decision (the storyteller over the dead
 * dragon) and its epilogue. The fort's three each have a word once it is over.
 */

/** Where the road goes next, as the fort's people tell it (the first that holds). */
const road = (ids: { road: string; woods: string; centaurs: string; siege: string }): BlockSpec[] => [
  { id: ids.road, when: { any: [{ not: [purgedFlag('plains')] }, { not: [purgedFlag('hollows')] }] } },
  { id: ids.woods, when: { not: ['brk4'] } },
  { id: ids.centaurs, when: { not: ['brk5'] } },
  { id: ids.siege, mood: 'grave' }
]

/** B0: the rift screams. */
const rift = conversation('story.rift', {
  name: 'intro.narrator', look: 'chronicler', voice: 'chronicler', mood: 'grave',
  greet: [{ id: 'scream', lines: 'nnn' }],
  topics: [],
  bye: []
})

/** B1: the wounded scout finds the hero on the map. */
const wrenFinds = conversation('story.wren', {
  name: 'npc.scoutWren.name', look: 'scoutWren', voice: 'scoutWren', mood: 'afraid',
  greet: [{ id: 'found', lines: 'nnn' }],
  topics: [],
  bye: []
})

/** A late step told on the map: `who` speaks two lines under `block`. */
const beat = (id: string, block: string, who: { name: string; look: string; voice: string; mood: 'grave' | 'warm' | 'proud' | 'sly' | 'cold' | 'gruff' | 'weary' }) =>
  conversation(id, { name: who.name, look: who.look, voice: who.voice, mood: who.mood, greet: [{ id: block, lines: 'nn' }], topics: [], bye: [] })

/** B6: the Forgemaster has his forge back. */
const forge = beat('story.forge', 'back', { name: 'npc.forgemaster.name', look: 'dwarf', voice: 'forgemaster', mood: 'gruff' })
/** B7: the Oracle (freed in the campaign) or, if she was slain, the Sunken Priest, with the Lens. */
const oracle = beat('story.oracle', 'lens', { name: 'enemy.nagaOracle', look: 'oracle', voice: 'oracle', mood: 'grave' })
const priest = beat('story.priest', 'lens', { name: 'npc.sunkenPriest.name', look: 'sunkenPriest', voice: 'sunkenPriest', mood: 'grave' })
/** B8: the herbalist, with the Leviathan's scale. */
const herbs = beat('story.herbs', 'scale', { name: 'npc.freedHerbalist.name', look: 'freedHerbalist', voice: 'freedHerbalist', mood: 'warm' })
/** B9: the Arch-Demon's ghost (the throne was claimed) or the Syndicate's boss, with the Hydra's fire key. */
const ghost = beat('story.ghost', 'key', { name: 'enemy.archDemon', look: 'archDemon', voice: 'archDemon', mood: 'cold' })
const syndicate = beat('story.syndicate', 'key', { name: 'npc.syndicateBoss.name', look: 'fence', voice: 'syndicateBoss', mood: 'sly' })
/** B10: seal the rift, or keep it ajar — the storyteller asks. */
const seal = decision(SEAL_QUEST, { name: 'intro.narrator', voice: 'chronicler', mood: 'grave', ask: 'nnn', results: { seal: 'n', ajar: 'n' } })
/** B10's epilogue, as it was chosen. */
const sealed = conversation('story.sealed', {
  name: 'intro.narrator', look: 'chronicler', voice: 'chronicler', mood: 'grave',
  greet: [{ id: 'sealed', when: { flags: [RIFT_SEALED] }, lines: 'nn', mood: 'warm' }, { id: 'ajar', lines: 'nn' }],
  topics: [],
  bye: []
})

/** Scout Wren at the fort: quick, eager, and she knows every road. */
const scoutWren = conversation('scoutWren', {
  name: 'npc.scoutWren.name', look: 'scoutWren', mood: 'excited',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('sealed', { flags: ['brk10'] }, { mood: 'excited' }),
    { id: 'again', mood: 'amused' }
  ],
  topics: [
    who(),
    rumor([
      { id: 'plains', when: { not: [purgedFlag('plains')] } },
      { id: 'hollows', when: { not: [purgedFlag('hollows')] } },
      { id: 'woods', when: { not: ['brk4'] } },
      { id: 'outskirts', when: { not: ['brk5'] } },
      { id: 'siege', mood: 'grave' }
    ])
  ],
  bye: [{ id: 'bye' }]
})

/** Captain Hale holds the fort: still weary, still unbending. */
const fortHale = conversation('fortHale', {
  name: 'npc.captainHale.name', look: 'captain', voice: 'captainHale', mood: 'weary',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('road', { flags: ['brk3'] }, { mood: 'warm' }),
    news('herbs', { flags: ['brk4'] }, { mood: 'warm' }),
    news('siege', { flags: ['brk5'] }, { mood: 'grave' }),
    news('sealed', { flags: ['brk10'] }, { mood: 'proud' }),
    { id: 'again' }
  ],
  topics: [
    // The siege (afterplay §8): to the gate, once the story has brought it.
    siegeTopic(),
    { id: 'fort', lines: 'nn' },
    rumor(road({ road: 'road', woods: 'woods', centaurs: 'centaurs', siege: 'siege' }))
  ],
  // The siege's window closed without a siege: a word for the road.
  back: { siege: [{ id: 'siegeBack' }] },
  bye: [{ id: 'bye' }]
})

/** Elder Mara, a guest in a soldier's fort: she speaks for Sunford's people. */
const fortMaraSpec: ConvSpec = {
  name: 'npc.elderMara.name', look: 'elder', voice: 'elderMara', mood: 'warm',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    news('command', { flags: ['oakhavenFallen'] }, { mood: 'grave' }),
    news('home', { flags: ['sunfordRebuilt'] }, { mood: 'excited' }),
    news('sealed', { flags: ['brk10'] }, { mood: 'warm' }),
    { id: 'again' }
  ],
  topics: [
    // In the captain's stead (Oakhaven fell), she sends the hero to the gate.
    siegeTopic({ when: { flags: ['oakhavenFallen'], any: [{ flags: ['siegeDue'] }, { flags: ['siegeHeld'] }] } }),
    { id: 'town', lines: 'nn', mood: 'sad' },
    rumor(road({ road: 'road', woods: 'woods', centaurs: 'centaurs', siege: 'siege' }))
  ],
  back: { siege: [{ id: 'siegeBack' }] },
  bye: [{ id: 'bye' }]
}
const fortMara = conversation('fortMara', fortMaraSpec)

/** The fort's people (talked to in town). */
export const BREAKING_TALK: readonly ConversationDef[] = [scoutWren, fortHale, fortMara]

/** The beats told on the map (`conversationOf('story.rift')`). */
export const BREAKING_BEATS: readonly ConversationDef[] = [rift, wrenFinds, forge, oracle, priest, herbs, ghost, syndicate, seal, sealed]
