// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { ARM_DISCOUNT, ARM_DISCOUNT_ROW, ARM_ROW, FAIR_CLEARS, FAIR_FULL, FAIR_GLASS, RING_RINGS, WHACK_ROW, fairFee, fairTopGold } from '@/game/fair'
import { ITEM_BY_ID } from '@/game/data/items'
import { TOWNS } from '@/game/data/zones'
import { conversationOf } from '@/game/data/dialogs'

/** The fair games at the save (afterplay §9): fees, rows, top prizes, the cap, the hidden-class flags. */

type P = typeof import('@/game/state/profile')
type F = typeof import('@/game/state/fair')
let p: P
let f: F
beforeEach(async () => {
  drainAndResetModules()
  localStorage.clear()
  await holdGameState()
  p = await import('@/game/state/profile')
  f = await import('@/game/state/fair')
  p.initProfile()
  p.profile.level = 40
})
afterEach(() => { drainPersist(); vi.restoreAllMocks() })

describe('the fee', () => {
  it('goes on the table; no round without the gold', () => {
    p.profile.gold = fairFee(40)
    expect(f.startFair()).toBe(true)
    expect(p.profile.gold).toBe(0)
    expect(f.fairBlock()).toBe('gold')
    expect(f.startFair()).toBe(false)
  })
})

describe('Whack-a-Imp', () => {
  it('a win pays the fee doubled; the third in a row is the top prize (gold, XP, Demonglass, a rare trinket); a loss breaks the row', () => {
    p.profile.gold = 0
    expect(f.settleWhack(true).gold).toBe(fairFee(40) * 2)
    f.settleWhack(true)
    const xp = p.lifetimeXp()
    const r = f.settleWhack(true)
    expect(r.top).not.toBeNull()
    expect(r.top!.gold).toBe(fairTopGold(40))
    expect(r.top!.capped).toBe(false)
    expect(p.lifetimeXp()).toBeGreaterThan(xp)
    expect(p.oreCount('demonglass')).toBe(FAIR_GLASS)
    expect(ITEM_BY_ID[r.top!.item]!.slot).toBe('trinket')
    expect(p.profile.inv.items).toContain(r.top!.item)
    expect(r.row).toBe(0)
    expect(p.profile.meta.fair.best.whack).toBe(WHACK_ROW)
    f.settleWhack(true)
    f.settleWhack(false)
    expect(p.profile.meta.fair.rows.whack).toBe(0)
  })
})

describe('the cap (Q9: per five zone clears)', () => {
  it('five top prizes in full, then gold only until five more zones are cleared', () => {
    const top = () => { for (let i = 0; i < WHACK_ROW; i++) f.settleWhack(true) }
    for (let i = 0; i < FAIR_FULL; i++) top()
    expect(f.fairCapped('whack')).toBe(true)
    const glass = p.oreCount('demonglass')
    const items = p.profile.inv.items.length
    const gold = p.profile.gold
    for (let i = 0; i < WHACK_ROW - 1; i++) f.settleWhack(true)
    const r = f.settleWhack(true)
    expect(r.top!.capped).toBe(true)
    expect(r.top!.xp).toBe(0)
    expect(p.oreCount('demonglass')).toBe(glass)
    expect(p.profile.inv.items.length).toBe(items)
    expect(p.profile.gold).toBe(gold + fairFee(40) * 2 * (WHACK_ROW - 1) + fairTopGold(40))
    // The other games keep their own count.
    expect(f.fairCapped('ring')).toBe(false)
    for (let i = 0; i < FAIR_CLEARS - 1; i++) f.countFairClear()
    expect(f.fairCapped('whack')).toBe(true)
    f.countFairClear()
    expect(f.fairCapped('whack')).toBe(false)
  })
})

describe('Ring Toss', () => {
  it('the score tier pays; a perfect round is the top prize and sets the Tidecaller flag, capped or not', () => {
    p.profile.gold = 0
    const low = f.settleRing([true, false, false, false, false])
    expect(low.gold).toBe(0)
    expect(low.tier).toBe(0)
    const mid = f.settleRing([true, true, true, false, false])
    expect(mid.tier).toBe(2)
    expect(mid.gold).toBe(fairFee(40) * 2)
    expect(p.hasFlag(f.RING_PERFECT_FLAG)).toBe(false)
    p.profile.meta.fair.full.ring = FAIR_FULL
    const perfect = f.settleRing(new Array(RING_RINGS).fill(true))
    expect(perfect.tier).toBe(4)
    expect(perfect.top!.capped).toBe(true)
    expect(p.hasFlag(f.RING_PERFECT_FLAG)).toBe(true)
  })
})

describe('Arm-Wrestle', () => {
  it('the third win in a row turns on the smith discount; the fifth is the top prize with Heroic+ material and the Hexsmith flag', () => {
    for (let i = 0; i < ARM_DISCOUNT_ROW - 1; i++) expect(f.settleArm(true).discount).toBe(false)
    expect(f.settleArm(true).discount).toBe(true)
    expect(p.profile.meta.fair.discount).toBe(true)
    for (let i = ARM_DISCOUNT_ROW; i < ARM_ROW - 1; i++) f.settleArm(true)
    const r = f.settleArm(true)
    expect(r.top!.mats).toBe(1)
    expect(r.top!.item).toBe('')
    expect(p.oreCount('ichor')).toBe(1)
    expect(p.hasFlag(f.ARM_STREAK_FLAG)).toBe(true)
    expect(p.profile.meta.fair.best.arm).toBe(ARM_ROW)
    // Five zone clears end the discount.
    for (let i = 0; i < FAIR_CLEARS; i++) f.countFairClear()
    expect(p.profile.meta.fair.discount).toBe(false)
  })

  it('the discount takes its share off the smith\'s upgrade', () => {
    const id = p.profile.inv.equipped.main!
    const full = p.upgradeCost(id)
    expect(full).toBeGreaterThan(0)
    p.profile.meta.fair.discount = true
    expect(p.upgradeCost(id)).toBe(Math.round(full * (1 - ARM_DISCOUNT)))
  })
})

describe('the save', () => {
  it('an old save without the fair block loads with it empty', () => {
    delete (p.profile.meta as Partial<typeof p.profile.meta>).fair
    p.saveProfile()
    drainPersist()
    p.loadProfile()
    expect(p.profile.meta.fair.rows).toEqual({ whack: 0, ring: 0, arm: 0 })
    expect(p.profile.meta.fair.discount).toBe(false)
    // And a played one keeps what it played.
    f.settleArm(true)
    f.settleArm(true)
    p.saveProfile()
    drainPersist()
    p.loadProfile()
    expect(p.profile.meta.fair.rows.arm).toBe(2)
  })
})

describe('the barkers', () => {
  it('stand at the fort\'s fair corner, each with a conversation that opens the game', () => {
    const fort = TOWNS.bastion.npcs
    for (const [id, game] of [['fairPip', 'whack'], ['fairBess', 'ring'], ['fairHob', 'arm']] as const) {
      const npc = fort.find(n => n.id === id)
      expect(npc?.role).toBe('gambler')
      expect(npc?.game).toBe(game)
      expect(conversationOf(id)).toBeTruthy()
    }
  })
})
