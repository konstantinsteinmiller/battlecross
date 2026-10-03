// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { ITEM_BY_ID } from '@/game/data/items'
import { SHELF_REFRESHES, SHELF_SIZE, dayKey, shelfTier, stockShelf, type Stock } from '@/game/rareShelf'
import { TOWNS } from '@/game/data/zones'

/** The merchants' rare shelves (roadmap #19, D60). */

const smith: Stock = { slots: ['main', 'off', 'head', 'body', 'hands', 'feet'], tiers: [1] }

describe('stocking a rare shelf', () => {
  it('holds three pieces one tier above the merchant, none owned, none legendary, none from the normal stock', () => {
    for (const t of Object.values(TOWNS)) {
      for (const n of t.npcs) {
        if (!n.stock) continue
        const ids = stockShelf(n.id, n.stock, new Set(), '2026-10-04', 0)
        expect(ids.length, n.id).toBe(SHELF_SIZE)
        for (const id of ids) {
          const it = ITEM_BY_ID[id]!
          expect(it.tier, `${n.id} ${id}`).toBe(shelfTier(n.stock))
          expect(it.tier).toBeLessThan(6)
          expect(n.stock.slots.includes(it.slot) && n.stock.tiers.includes(it.tier), `${n.id} sells ${id} anyway`).toBe(false)
        }
      }
    }
  })

  it('prefers the merchant\'s own trade, skips what the hero owns, and is the same all day', () => {
    const a = stockShelf('sunfordSmith', smith, new Set(), '2026-10-04', 0)
    expect(a.every(id => smith.slots.includes(ITEM_BY_ID[id]!.slot))).toBe(true)
    expect(stockShelf('sunfordSmith', smith, new Set(), '2026-10-04', 0)).toEqual(a)
    const b = stockShelf('sunfordSmith', smith, new Set([a[0]!]), '2026-10-04', 0)
    expect(b).not.toContain(a[0])
    // Another day or a re-stock is (almost always) another shelf.
    const days = new Set(['2026-10-05', '2026-10-06', '2026-10-07'].map(d => stockShelf('sunfordSmith', smith, new Set(), d, 0).join()))
    expect(days.size).toBeGreaterThan(1)
  })

  it('the day is the player\'s calendar day', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})

describe('the shelf in the save', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  beforeEach(async () => {
    drainAndResetModules()
    await holdGameState()
    p = await import('@/game/state/profile')
    p.initProfile()
  })
  afterEach(() => { drainPersist(); vi.useRealTimers() })

  it('is stocked on first look and kept; a bought piece stays listed', () => {
    const first = p.rareShelf('sunfordSmith', smith)
    p.profile.gold = 1e6
    expect(p.buyItem(first[0]!)).toBe(true)
    expect(p.rareShelf('sunfordSmith', smith)).toEqual(first)
  })

  it('re-stocks a few times a day over all merchants, and a new day starts afresh', () => {
    vi.useFakeTimers({ now: new Date(2026, 9, 4, 12) })
    const first = p.rareShelf('sunfordSmith', smith)
    for (let i = 0; i < SHELF_REFRESHES; i++) expect(p.restockShelf(i % 2 ? 'sunfordPeddler' : 'sunfordSmith', i % 2 ? { slots: ['trinket'], tiers: [1, 2] } : smith)).toBe(true)
    expect(p.shelfRefreshesLeft()).toBe(0)
    expect(p.restockShelf('sunfordSmith', smith)).toBe(false)
    expect(p.rareShelf('sunfordSmith', smith)).not.toEqual(first)
    vi.setSystemTime(new Date(2026, 9, 5, 9))
    expect(p.shelfRefreshesLeft()).toBe(SHELF_REFRESHES)
  })

  it('survives a reload', () => {
    const first = p.rareShelf('sunfordSmith', smith)
    p.saveProfile()
    p.loadProfile()
    expect(p.profile.meta.shelf.wares.sunfordSmith).toEqual(first)
  })
})
