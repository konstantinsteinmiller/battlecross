// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { BLESSING, GIFT_GOLD, contractGold, countDeeds, giftItem, postContracts } from '@/game/contracts'
import { FACTIONS } from '@/game/data/quests'
import { ZONES } from '@/game/data/zones'
import { ITEM_BY_ID } from '@/game/data/items'
import { heroStats } from '@/game/sim/stats'
import { startAttrs } from '@/game/data/attributes'

/** Faction contracts and standing (roadmap #15, D66–D68). */

describe('posting the day\'s contracts', () => {
  it('one per faction, set in a zone the hero can reach, the same all day', () => {
    const list = postContracts('2026-10-04', ['plains', 'hollows', 'woods'])
    expect(list.map(c => c.faction)).toEqual([...FACTIONS])
    for (const c of list) {
      if (c.kind === 'chests') expect(c.zone).toBe('')
      else expect(['plains', 'hollows', 'woods']).toContain(c.zone)
      if (c.kind === 'slay') expect(ZONES[c.zone as 'plains'].kinds.map(k => k.kind)).toContain(c.enemy)
      expect(c.n).toBeGreaterThan(0)
    }
    expect(postContracts('2026-10-04', ['plains', 'hollows', 'woods'])).toEqual(list)
    const week = new Set(['05', '06', '07', '08', '09'].map(d => JSON.stringify(postContracts(`2026-10-${d}`, ['plains', 'hollows', 'woods']))))
    expect(week.size).toBeGreaterThan(3)
  })

  it('with no zone open yet, every contract is a chest hunt', () => {
    expect(postContracts('2026-10-04', []).every(c => c.kind === 'chests')).toBe(true)
  })

  it('counts kills of the kind in the zone, a win in the zone, and chests anywhere', () => {
    const list = [
      { faction: 'order', kind: 'slay', zone: 'woods', enemy: 'wolf', n: 5, have: 0, done: false },
      { faction: 'syndicate', kind: 'chests', zone: '', enemy: '', n: 3, have: 0, done: false },
      { faction: 'circle', kind: 'clear', zone: 'woods', enemy: '', n: 1, have: 0, done: false }
    ] as ReturnType<typeof postContracts>
    countDeeds(list, { zone: 'plains', won: true, kills: { wolf: 4 }, chests: 1 })
    expect(list.map(c => c.have)).toEqual([0, 1, 0])
    countDeeds(list, { zone: 'woods', won: false, kills: { wolf: 9, goblin: 3 }, chests: 4 })
    expect(list.map(c => c.have)).toEqual([5, 3, 0])
    countDeeds(list, { zone: 'woods', won: true, kills: {}, chests: 0 })
    expect(list[2]!.have).toBe(1)
  })

  it('a gift is a piece of the faction\'s gear the hero does not own', () => {
    const a = giftItem('order', 2, new Set())!
    expect(a.tier).toBe(2)
    expect(giftItem('order', 2, new Set([a.id]))!.id).not.toBe(a.id)
  })
})

describe('the blessings at +5', () => {
  const build = (blessings: ('order' | 'circle')[] = []) => ({ level: 10, attrs: startAttrs(), equipped: { main: null, off: null, head: null, body: null, hands: null, feet: null, trinket1: null, trinket2: null }, passives: [], blessings })
  it('the Order adds health and the Circle mana regeneration', () => {
    const base = heroStats(build())
    expect(heroStats(build(['order'])).maxHp).toBe(Math.round(base.maxHp * (1 + BLESSING.order.maxHpPct)))
    expect(heroStats(build(['circle'])).manaRegen).toBeCloseTo(base.manaRegen * (1 + BLESSING.circle.manaRegenPct))
  })
})

describe('the board in the save', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  beforeEach(async () => {
    vi.useFakeTimers({ now: new Date(2026, 9, 4, 12) })
    drainAndResetModules()
    await holdGameState()
    p = await import('@/game/state/profile')
    p.initProfile()
    p.profile.world.cleared.push('plains', 'hollows')
  })
  afterEach(() => { drainPersist(); vi.useRealTimers() })

  it('a finished contract is handed in once, for gold and a point of standing; a new day posts afresh', () => {
    const list = p.contractsToday()
    expect(p.handInContract(0)).toBe(false)
    list[0]!.have = list[0]!.n
    expect(p.contractsReady()).toBe(1)
    const gold = p.profile.gold
    const rep = p.profile.quests.rep[list[0]!.faction]
    expect(p.handInContract(0)).toBe(true)
    expect(p.profile.gold).toBe(gold + contractGold(p.profile.level))
    expect(p.profile.quests.rep[list[0]!.faction]).toBe(rep + 1)
    expect(p.handInContract(0)).toBe(false)
    p.saveProfile()
    p.loadProfile()
    expect(p.profile.meta.contracts.list[0]!.done).toBe(true)
    vi.setSystemTime(new Date(2026, 9, 5, 8))
    expect(p.contractsToday()[0]!.done).toBe(false)
  })

  it('+3 brings the gift once; +5 the blessing while it is held', () => {
    expect(p.giftReady('syndicate')).toBe(false)
    p.profile.quests.rep.syndicate = 3
    const gold = p.profile.gold
    const id = p.claimGift('syndicate')
    expect(id).not.toBeNull()
    expect(p.profile.gold).toBe(gold + GIFT_GOLD)
    if (id) expect(p.owns(id)).toBe(true)
    expect(p.claimGift('syndicate')).toBeNull()
    expect(p.blessings()).toEqual([])
    p.profile.quests.rep.syndicate = 5
    expect(p.blessings()).toEqual(['syndicate'])
    expect(p.heroBuild().blessings).toEqual(['syndicate'])
    p.profile.quests.rep.syndicate = 4
    expect(p.blessings()).toEqual([])
  })

  it('a visit counts into the board through the flow', async () => {
    const list = p.contractsToday()
    const chests = list.find(c => c.kind === 'chests')
    p.countContracts({ zone: 'hollows', won: true, kills: {}, chests: 2 })
    if (chests) expect(chests.have).toBe(Math.min(chests.n, 2))
    expect(ITEM_BY_ID).toBeTruthy()
  })
})
