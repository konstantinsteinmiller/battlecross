// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { ERRANDS, type ErrandDef } from '@/game/data/errands'
import { countTalk, countVisit, errandState, handInCost, settle, stepHave, type ErrandSave, type ErrandWorld } from '@/game/errands'
import { meets } from '@/game/dialog/conditions'
import type { DialogWorld } from '@/game/dialog/types'
import { CONVERSATIONS } from '@/game/data/dialogs'

/**
 * Errands (roadmap #85, #86, #89, D101): one model for every task with
 * steps. Counted steps move at the end of a visit, live ones are read off the
 * world, `talk` moves when the person is spoken to; what is handed over goes
 * at hand-in, and only the last step may ask for it.
 */

const world = (o: Partial<{ herbs: Record<string, number>; items: string[]; pieces: number; flags: string[] }> = {}): ErrandWorld => ({
  herbs: id => o.herbs?.[id] ?? 0,
  owns: id => (o.items ?? []).includes(id),
  pieces: () => o.pieces ?? 0,
  flags: new Set(o.flags ?? [])
})

const HUNT: ErrandDef = {
  id: 'testHunt', giver: 'elderMara',
  steps: [{ kind: 'visit', place: 'woods', n: 1 }, { kind: 'slay', place: 'hollows', enemy: 'goblin', n: 10 }, { kind: 'gather', plant: 'sunpetal', n: 6 }],
  reward: { gold: 120, xp: 0.2, flags: ['testHuntDone'] }
}

describe('the rules', () => {
  it('a counted step moves at the end of a visit to its place, and only there', () => {
    const s: ErrandSave = { step: 0, have: 0, done: false }
    expect(countVisit(HUNT, s, { node: 'plains', won: true, kills: {} }, world())).toBe(false)
    expect(countVisit(HUNT, s, { node: 'woods', won: false, kills: {} }, world())).toBe(true)
    expect(s.step).toBe(1)
    countVisit(HUNT, s, { node: 'plains', won: true, kills: { goblin: 9 } }, world())
    expect(s.have).toBe(0)
    countVisit(HUNT, s, { node: 'hollows', won: false, kills: { goblin: 6, goblinSlinger: 3 } }, world())
    expect([s.step, s.have]).toEqual([1, 6])
    countVisit(HUNT, s, { node: 'hollows', won: true, kills: { goblin: 9 } }, world())
    expect([s.step, s.have]).toEqual([2, 0])
    expect(errandState(HUNT, s, world())).toBe('active')
    expect(stepHave(HUNT.steps[2]!, s, world({ herbs: { sunpetal: 4 } }))).toBe(4)
    expect(errandState(HUNT, s, world({ herbs: { sunpetal: 6 } }))).toBe('ready')
    expect(handInCost(HUNT)).toEqual({ herbs: { sunpetal: 6 }, item: '' })
  })

  it('live steps settle by themselves; a talk step waits for the word', () => {
    const def: ErrandDef = { id: 't2', giver: 'elderMara', steps: [{ kind: 'pieces', n: 6 }, { kind: 'dig', place: 'crags', n: 1 }, { kind: 'talk', npc: 'elderMara', n: 1 }], reward: {} }
    const s: ErrandSave = { step: 0, have: 0, done: false }
    settle(def, s, world({ pieces: 5 }))
    expect(s.step).toBe(0)
    settle(def, s, world({ pieces: 6, flags: ['dug:crags'] }))
    expect(s.step).toBe(2)
    expect(errandState(def, s, world())).toBe('active')
    expect(countTalk(def, s, 'sunfordSmith', world())).toBe(false)
    expect(countTalk(def, s, 'elderMara', world())).toBe(true)
    expect(errandState(def, s, world())).toBe('ready')
  })

  it('a bring step is ready while the item is in the bag', () => {
    const def: ErrandDef = { id: 't3', giver: 'elderMara', steps: [{ kind: 'bring', item: 'copperBand', n: 1 }], reward: {} }
    const s: ErrandSave = { step: 0, have: 0, done: false }
    expect(errandState(def, s, world())).toBe('active')
    expect(errandState(def, s, world({ items: ['copperBand'] }))).toBe('ready')
    expect(errandState(def, undefined, world())).toBe('none')
    expect(errandState(def, { ...s, done: true }, world())).toBe('done')
  })

  it('every errand the game has: known givers and places, a give-away only as the last step', () => {
    const npcs = new Set(CONVERSATIONS.map(c => c.id))
    for (const e of ERRANDS) {
      expect(npcs.has(e.giver), `${e.id} giver ${e.giver}`).toBe(true)
      e.steps.forEach((s, i) => {
        if (s.kind === 'gather' || s.kind === 'bring') expect(i, `${e.id} step ${i}`).toBe(e.steps.length - 1)
        expect(s.n, `${e.id} step ${i}`).toBeGreaterThan(0)
      })
    }
  })
})

describe('conversations', () => {
  it('a condition can ask where an errand stands', () => {
    const w = { errands: { testHunt: 'ready' } } as unknown as DialogWorld
    expect(meets({ errand: { testHunt: 'ready' } }, w, 'x')).toBe(true)
    expect(meets({ errand: { testHunt: ['active', 'ready'] } }, w, 'x')).toBe(true)
    expect(meets({ errand: { testHunt: 'done' } }, w, 'x')).toBe(false)
    expect(meets({ errand: { other: 'none' } }, w, 'x')).toBe(true)
  })
})

describe('on the hero\'s sheet', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  beforeEach(async () => {
    drainAndResetModules()
    localStorage.clear()
    await holdGameState()
    const d = await import('@/game/data/errands')
    d.errandDefs([HUNT])
    p = await import('@/game/state/profile')
    p.initProfile()
  })
  afterEach(() => { drainPersist(); vi.restoreAllMocks() })

  it('taken, counted, handed in: the herbs go, the reward comes; the save keeps it', async () => {
    expect(p.errandStateOf('testHunt')).toBe('none')
    expect(p.startErrand('testHunt')).toBe(true)
    expect(p.startErrand('testHunt')).toBe(false)
    p.countErrands({ node: 'woods', won: true, kills: {} })
    p.countErrands({ node: 'hollows', won: true, kills: { goblin: 12 } })
    expect(p.errandStateOf('testHunt')).toBe('active')
    expect(p.completeErrand('testHunt')).toBeNull()
    p.addHerbs({ sunpetal: 7 })
    expect(p.errandStateOf('testHunt')).toBe('ready')
    expect(p.openErrands().map(e => e.def.id)).toEqual(['testHunt'])
    const gold = p.profile.gold
    const level = p.profile.level
    const xp = p.profile.hero.xp
    expect(p.completeErrand('testHunt')).not.toBeNull()
    expect(p.profile.gold).toBe(gold + 120)
    expect(p.profile.level > level || p.profile.hero.xp > xp).toBe(true)
    expect(p.herbCount('sunpetal')).toBe(1)
    expect(p.hasFlag('testHuntDone')).toBe(true)
    expect(p.errandStateOf('testHunt')).toBe('done')
    expect(p.openErrands()).toEqual([])
    expect(p.completeErrand('testHunt')).toBeNull()
    p.saveProfile()
    drainAndResetModules()
    await holdGameState()
    const d = await import('@/game/data/errands')
    d.errandDefs([HUNT])
    const q = await import('@/game/state/profile')
    q.initProfile()
    expect(q.errandStateOf('testHunt')).toBe('done')
  })
})
