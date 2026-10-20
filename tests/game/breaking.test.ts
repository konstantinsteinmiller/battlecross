import { describe, expect, it } from 'vitest'
import {
  B4_LEVEL, B5_LEVEL, FORT, OVERRUN_ROADS, RESCUES, SIEGE_DUE, advance, breakingDerived, breakingStep, mapBeat, nextGoal, onZoneWon,
  purgedFlag, rebuiltTiers, townState
} from '@/game/data/breaking'
import { MAP, NODE_BY_ID, TOWNS, nodeOpen, townNpcs, type TownId } from '@/game/data/zones'
import { generateTown } from '@/game/sim/townGen'
import { townRuined } from '@/game/sim/town'
import { conversationOf } from '@/game/data/dialogs'

/**
 * The afterplay's phase 3 (docs/gdd-afterplay.md §1 B0–B5, §7): the story
 * chain as world flags, the fort Bastion Crossing, and the fallen towns
 * overrun and rebuilt.
 */

const S = (...f: string[]): Set<string> => new Set(f)
const ALL_RESCUED = Object.values(RESCUES).flat() as string[]

describe('the chain B0–B5', () => {
  it('counts its steps in order: a gap stops the count', () => {
    expect(breakingStep(S())).toBe(0)
    expect(breakingStep(S('brk0', 'brk1'))).toBe(2)
    expect(breakingStep(S('brk0', 'brk2'))).toBe(1)
    expect(breakingStep(S('brk0', 'brk1', 'brk2', 'brk3', 'brk4', 'brk5'))).toBe(6)
  })

  it('tells the rift (B0), then the scout (B1) on the map, only in the afterplay', () => {
    expect(mapBeat(false, S())).toBe(null)
    expect(mapBeat(true, S())).toBe('story.rift')
    expect(mapBeat(true, S('brk0'))).toBe('story.wren')
    expect(mapBeat(true, S('brk0', 'brk1'))).toBe(null)
  })

  it('a win purges a zone only once the fort is found, and frees whoever its road held', () => {
    expect(onZoneWon('plains', false, S(), 40)).toEqual([])
    expect(onZoneWon('plains', true, S('brk0'), 40)).toEqual([])
    expect(onZoneWon('plains', true, S('brk0', 'brk1'), 40)).toEqual([purgedFlag('plains'), ...RESCUES.plains!])
    // Twice is once.
    expect(onZoneWon('plains', true, S('brk0', 'brk1', purgedFlag('plains'), ...RESCUES.plains!), 40)).toEqual([])
  })

  it('B3 needs the fort reached and both Sunford roads purged; B4 the Woods and level 34; B5 the Outskirts and level 38, and calls the siege', () => {
    const b2 = ['brk0', 'brk1', 'brk2']
    expect(advance(S('brk0', 'brk1', purgedFlag('plains'), purgedFlag('hollows')), 50)).toEqual([])
    expect(advance(S(...b2, purgedFlag('plains')), 50)).toEqual([])
    expect(advance(S(...b2, purgedFlag('plains'), purgedFlag('hollows')), 31)).toEqual(['brk3'])
    const b3 = [...b2, 'brk3', purgedFlag('plains'), purgedFlag('hollows'), purgedFlag('woods')]
    expect(advance(S(...b3), B4_LEVEL - 1)).toEqual([])
    expect(advance(S(...b3), B4_LEVEL)).toEqual(['brk4'])
    // The whole road at once, at a high level: every step that holds.
    expect(advance(S(...b2, ...['plains', 'hollows', 'woods', 'outskirts'].map(z => purgedFlag(z as 'plains'))), B5_LEVEL)).toEqual(['brk3', 'brk4', 'brk5', SIEGE_DUE])
    expect(advance(S(...b3, 'brk4', purgedFlag('outskirts')), B5_LEVEL - 1)).toEqual([])
  })

  it('points the way: the fort, then the Sunford road, the Woods, the Outskirts', () => {
    expect(nextGoal(S('brk0'), 31)).toBe(null)
    expect(nextGoal(S('brk0', 'brk1'), 31)).toBe(FORT)
    expect(nextGoal(S('brk0', 'brk1', 'brk2'), 31)).toBe('plains')
    expect(nextGoal(S('brk0', 'brk1', 'brk2', purgedFlag('plains')), 31)).toBe('hollows')
    expect(nextGoal(S('brk0', 'brk1', 'brk2', 'brk3'), 34)).toBe('woods')
    expect(nextGoal(S('brk0', 'brk1', 'brk2', 'brk3', 'brk4'), 38)).toBe('outskirts')
  })
})

describe('the fallen towns', () => {
  it('are normal before the afterplay, overrun in it, rebuilt once both roads are purged; Silverbridge stays open', () => {
    expect(townState('sunford', false, S())).toBe('normal')
    expect(townState('sunford', true, S())).toBe('overrun')
    expect(townState('sunford', true, S(purgedFlag('plains')))).toBe('overrun')
    expect(townState('sunford', true, S(purgedFlag('plains'), purgedFlag('hollows')))).toBe('rebuilt')
    expect(townState('silverbridge', true, S())).toBe('normal')
    expect(breakingDerived(false, S())).toEqual([])
    expect(breakingDerived(true, S(purgedFlag('crags'), purgedFlag('mines')))).toEqual(['afterplay', 'sunfordOverrun', 'oakhavenOverrun', 'ironholdRebuilt'])
  })

  it('overrun: a ruin with nobody to trade with, two survivors by a fire; rebuilt: the people back', () => {
    for (const t of Object.keys(OVERRUN_ROADS) as TownId[]) {
      const over = S(`${t}Overrun`)
      expect(townNpcs(t, over), t).toEqual([])
      expect(townRuined(TOWNS[t], over), t).toBe(true)
      const plan = generateTown(TOWNS[t], over, 7)
      expect(plan.npcs ?? [], t).toEqual([])
      const folk = plan.town!.people.filter(p => !p.npc)
      expect(folk.map(p => p.job), t).toEqual(['survivor', 'survivor'])
      const back = generateTown(TOWNS[t], S(`${t}Rebuilt`), 7)
      expect(townRuined(TOWNS[t], S(`${t}Rebuilt`)), t).toBe(false)
      expect(back.town!.people.some(p => p.npc), t).toBe(true)
      // The same streets either way: only who is in them changes.
      expect(back.town!.houses.length, t).toBe(plan.town!.houses.length)
    }
  })
})

describe('Bastion Crossing', () => {
  it('is a walled town on the Outskirts–Crags road, on the map once Wren has told of it', () => {
    expect(TOWNS.bastion.site).toBe('walled')
    expect(NODE_BY_ID.bastion!.links.sort()).toEqual(['crags', 'outskirts'])
    expect(NODE_BY_ID.outskirts!.links).toContain('bastion')
    expect(NODE_BY_ID.crags!.links).toContain('bastion')
    const cleared = new Set(MAP.filter(n => n.kind === 'zone').map(n => n.id))
    expect(nodeOpen('bastion', cleared, S())).toBe(false)
    expect(nodeOpen('bastion', cleared, S('brk1'))).toBe(true)
  })

  it('holds only its captain, Mara and Wren until somebody is rescued; then the rescued, each once', () => {
    expect(townNpcs('bastion', S()).map(n => n.id).sort()).toEqual(['fortHale', 'fortMara', 'scoutWren'])
    // Oakhaven fell: Mara holds the fort, and the Syndicate's fence trades by the gate.
    expect(townNpcs('bastion', S('oakhavenFallen')).map(n => n.id).sort()).toEqual(['blackMarket', 'fortMara', 'scoutWren'])
    const full = townNpcs('bastion', S(...ALL_RESCUED)).map(n => n.id)
    for (const id of ['trainerAegis', 'trainerPyro', 'sfShadow', 'sfGeo', 'sunfordSmith', 'sunfordPeddler', 'sunfordGambler', 'sunfordCups', 'sunfordHealer', 'freedHerbalist']) expect(full, id).toContain(id)
    expect(new Set(full).size).toBe(full.length)
  })

  it('builds with everybody reachable: empty, full, and with Oakhaven fallen; nobody not yet rescued is built', () => {
    for (const flags of [S(), S(...ALL_RESCUED), S(...ALL_RESCUED, 'oakhavenFallen')]) {
      const plan = generateTown(TOWNS.bastion, flags, 11)
      const cast = plan.town!.people.filter(p => p.npc).map(p => p.npc).sort()
      expect(cast).toEqual(townNpcs('bastion', flags).map(n => n.id).sort())
      expect(plan.town!.ruined).toBe(false)
    }
  })

  it('the fort sells the afterplay\'s tiers, and a rebuilt town one tier up', () => {
    const smith = TOWNS.bastion.npcs.find(n => n.id === 'sunfordSmith')!
    expect(smith.stock!.tiers).toEqual([4, 5])
    expect(rebuiltTiers([1])).toEqual([2])
    expect(rebuiltTiers([4, 5])).toEqual([5])
  })

  it('everyone in it has a conversation, and the beats on the map have theirs', () => {
    for (const n of TOWNS.bastion.npcs) expect(conversationOf(n.id), n.id).toBeTruthy()
    expect(conversationOf('story.rift')!.greet[0]!.lines).toHaveLength(3)
    expect(conversationOf('story.wren')!.voice).toBe('scoutWren')
  })
})
