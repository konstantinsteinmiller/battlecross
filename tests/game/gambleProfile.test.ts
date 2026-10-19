// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { BATTLE_ROW, MEMORY_ROW, battleFee } from '@/game/gamble'
import { ITEM_BY_ID } from '@/game/data/items'
import { TOWNS } from '@/game/data/zones'
import { conversationOf } from '@/game/data/dialogs'

/** The gamblers at the save (roadmap #91, #92): bets, fees, rows, prizes. */

type P = typeof import('@/game/state/profile')
let p: P
beforeEach(async () => {
  drainAndResetModules()
  localStorage.clear()
  await holdGameState()
  p = await import('@/game/state/profile')
  p.initProfile()
})
afterEach(() => { drainPersist(); vi.restoreAllMocks() })

describe('the memory stand', () => {
  it('a won round pays the bet back doubled; the fifth win in a row adds a Legendary and the row starts over', () => {
    p.profile.gold = 500
    expect(p.placeMemoryBet(100)).toBe(true)
    expect(p.profile.gold).toBe(400)
    expect(p.settleMemory(true, 100).gold).toBe(200)
    expect(p.profile.gold).toBe(600)
    expect(p.profile.meta.gamble.memory).toBe(1)
    for (let k = 1; k < MEMORY_ROW - 1; k++) p.settleMemory(true, 0)
    const before = p.profile.inv.items.length
    const r = p.settleMemory(true, 0)
    expect(r.prize?.item).toBeTruthy()
    expect(ITEM_BY_ID[r.prize!.item]!.tier).toBe(6)
    expect(p.profile.inv.items.length).toBe(before + 1)
    expect(p.profile.meta.gamble.memory).toBe(0)
  })

  it('a lost round keeps the bet and breaks the row; no bet without the gold', () => {
    p.profile.gold = 50
    expect(p.placeMemoryBet(100)).toBe(false)
    p.settleMemory(true, 0)
    p.settleMemory(false, 50)
    expect(p.profile.meta.gamble.memory).toBe(0)
    expect(p.profile.gold).toBe(50)
  })
})

describe('the item battle', () => {
  it('needs three unworn items and the fee; laid items are gone; the third win in a row adds an Epic', () => {
    p.profile.gold = 1000
    // A new hero wears everything he has.
    expect(p.battleBlock('oakGambler')).toBe('items')
    for (const id of ['apprenticeStaff', 'scoutsHandgun', 'tomeOfNovices', 'quiltedCap']) p.gainItem(id)
    const spare = p.unwornItems()
    expect(spare.length).toBeGreaterThanOrEqual(3)
    expect(p.battleBlock('oakGambler')).toBe('')
    expect(p.startBattle('oakGambler')).toBe(true)
    expect(p.profile.gold).toBe(1000 - battleFee('oakGambler'))
    expect(p.layBattleItem(spare[0]!)).toBe(true)
    expect(p.owns(spare[0]!)).toBe(false)
    expect(p.layBattleItem(p.profile.inv.equipped.main!)).toBe(false)
    const xp0 = p.lifetimeXp()
    expect(p.settleBattle(true, 'oakGambler').xp).toBeGreaterThan(0)
    expect(p.lifetimeXp()).toBeGreaterThan(xp0)
    for (let k = 1; k < BATTLE_ROW - 1; k++) p.settleBattle(true, 'oakGambler')
    const r = p.settleBattle(true, 'oakGambler')
    expect(ITEM_BY_ID[r.prize!.item]!.tier).toBe(4)
    expect(p.battleRow('oakGambler')).toBe(0)
    p.settleBattle(true, 'oakGambler')
    p.settleBattle(false, 'oakGambler')
    expect(p.battleRow('oakGambler')).toBe(0)
  })

  it('each table keeps its own row; Sunford\'s easy table pays a Rare, not an Epic (#115)', () => {
    p.settleBattle(true, 'oakGambler')
    for (let k = 1; k < BATTLE_ROW; k++) p.settleBattle(true, 'sunfordGambler')
    expect(p.battleRow('oakGambler')).toBe(1)
    expect(p.battleRow('sunfordGambler')).toBe(BATTLE_ROW - 1)
    const s = p.settleBattle(true, 'sunfordGambler')
    expect(s.prize).not.toBeNull()
    if (s.prize!.item) expect(ITEM_BY_ID[s.prize!.item]!.tier).toBe(3)
    expect(p.battleRow('sunfordGambler')).toBe(0)
  })
})

describe('where they sit', () => {
  it('the item battle in Sunford and Oakhaven (whatever becomes of it), the memory stand in Silverbridge', () => {
    const at = (game: string) => Object.values(TOWNS).filter(t => t.npcs.some(n => n.role === 'gambler' && n.game === game && !n.needs)).map(t => t.id)
    expect(at('items').sort()).toEqual(['oakhaven', 'sunford'])
    expect(at('memory')).toEqual(['silverbridge'])
    for (const t of Object.values(TOWNS)) for (const n of t.npcs.filter(x => x.role === 'gambler')) {
      expect(n.not, n.id).toBeUndefined()
      const conv = conversationOf(n.id)!
      const open = Object.values(conv.nodes).flatMap(x => x.choices).some(c => c.effects.some(f => f.t === 'open' && f.window === (n.game === 'memory' ? 'memory' : n.game === 'cups' ? 'cups' : 'itemBattle')))
      expect(open, n.id).toBe(true)
    }
  })
})
