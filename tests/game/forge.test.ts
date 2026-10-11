// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { ITEMS, ITEM_BY_ID, noGear, type ItemDef } from '@/game/data/items'
import { FORGE_GAIN, FORGE_MAX, FORGE_STEP, forgeCost, forgeTotal, forgedArmor, forgedMods } from '@/game/data/forge'
import { attrWeights, itemScore } from '@/game/data/upgrade'
import { sumBuild } from '@/game/sim/stats'

/**
 * Upgrading worn gear for gold (roadmap #90, D99): a little more of a
 * piece's attributes and armour each level, more for a better quality, each
 * level dearer than the last, and never enough to catch the next quality up.
 */

const flat = attrWeights()
const GROWN = ['str', 'dex', 'int', 'end', 'skl', 'cha', 'allAttrs', 'strOrDex', 'armor', 'maxHp', 'maxMana']

describe('the smith\'s rules', () => {
  it('a better quality grows by more a level, and a legendary fastest', () => {
    // The mean gain of one level, in attribute worth, quality by quality.
    const gain = (t: number): number => {
      const xs = ITEMS.filter(i => i.tier === t)
      return xs.reduce((s, i) => s + itemScore(i, flat, 1) - itemScore(i, flat, 0), 0) / xs.length
    }
    for (let t = 2; t <= 6; t++) expect(gain(t), `quality ${t}`).toBeGreaterThan(gain(t - 1))
    expect(FORGE_GAIN[6]).toBeGreaterThan(FORGE_GAIN[5])
  })

  it('each level costs more than the last, and a legendary has a price', () => {
    for (const it of ITEMS) {
      expect(forgeCost(it, 0), it.id).toBeGreaterThan(0)
      for (let l = 1; l < FORGE_MAX; l++) {
        expect(forgeCost(it, l), it.id).toBeGreaterThan(forgeCost(it, l - 1))
        expect(forgeCost(it, l) / forgeCost(it, l - 1)).toBeGreaterThan(FORGE_STEP - 0.25)
      }
    }
    expect(forgeTotal(ITEM_BY_ID.bladeOfTheUnbound!)).toBeGreaterThan(forgeTotal(ITEM_BY_ID.dragonSmasher!))
  })

  it('grows attributes and armour only: an item\'s own effect is never touched', () => {
    for (const it of ITEMS) {
      const m = forgedMods(it, FORGE_MAX)
      for (const [id, v] of Object.entries(it.mods)) {
        if (GROWN.includes(id)) expect(m[id as 'str']!, `${it.id} ${id}`).toBeGreaterThan(v)
        else expect(m[id as 'str'], `${it.id} ${id}`).toBe(v)
      }
      if (it.armor) expect(forgedArmor(it, FORGE_MAX)).toBeGreaterThan(it.armor)
      expect(forgedMods(it, 0)).toEqual(it.mods)
    }
  })

  it('a fully upgraded piece never beats a next-quality piece of its slot made for the same build', () => {
    // A build that leans on the piece's leading attribute weighs it 1, the rest
    // a quarter (as `attrWeights` does for a committed hero).
    const lead = (it: ItemDef): string => {
      let best = ''
      let bv = -1
      for (const a of ['str', 'dex', 'int', 'end', 'skl', 'cha']) if ((it.mods[a as 'str'] ?? 0) > bv) { bv = it.mods[a as 'str'] ?? 0; best = a }
      return best
    }
    const weights = (a: string): Record<string, number> => Object.fromEntries(['str', 'dex', 'int', 'end', 'skl', 'cha'].map(x => [x, x === a ? 1 : x === 'end' ? 0.5 : 0.25]))
    let pairs = 0
    for (const it of ITEMS) {
      if (it.tier === 6) continue
      const a = lead(it)
      const w = weights(a) as never
      for (const o of ITEMS.filter(x => x.slot === it.slot && x.tier === it.tier + 1 && lead(x) === a)) {
        pairs++
        expect(itemScore(it, w, FORGE_MAX), `${it.id} +${FORGE_MAX} vs ${o.id}`).toBeLessThan(itemScore(o, w))
      }
    }
    expect(pairs).toBeGreaterThan(10)
    // And a piece never grows by more than half.
    for (const it of ITEMS) expect(itemScore(it, flat, FORGE_MAX) - it.tier * 3, it.id).toBeLessThanOrEqual((itemScore(it, flat) - it.tier * 3) * 1.5 + 1e-9)
  })

  it('the build counts a worn piece as upgraded', () => {
    const equipped = { ...noGear(), main: 'ironBroadsword' }
    const attrs = { str: 5, dex: 5, int: 5, end: 5, skl: 5, cha: 5 }
    const base = sumBuild({ level: 6, attrs, equipped, passives: [] })
    const up = sumBuild({ level: 6, attrs, equipped, passives: [], upgrades: { ironBroadsword: 3 } })
    expect(up.attrs.str).toBeCloseTo(base.attrs.str + ITEM_BY_ID.ironBroadsword!.mods.str! * FORGE_GAIN[2] * 3, 5)
    expect(up.mods.block).toBe(base.mods.block)
  })
})

describe('upgrading on the hero\'s sheet', () => {
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

  it('a worn piece goes up a level for its price, up to the top; nothing else does', () => {
    p.profile.gold = 100_000
    const id = 'rustedShortsword'
    const str = p.totalAttrs().str
    for (let l = 0; l < FORGE_MAX; l++) {
      const cost = p.upgradeCost(id)
      expect(cost).toBe(forgeCost(ITEM_BY_ID[id]!, l))
      const gold = p.profile.gold
      expect(p.upgradeItem(id)).toBe(true)
      expect(p.profile.gold).toBe(gold - cost)
      expect(p.upgradeLevel(id)).toBe(l + 1)
    }
    expect(p.upgradeItem(id)).toBe(false)
    expect(p.upgradeCost(id)).toBe(0)
    expect(p.totalAttrs().str).toBeGreaterThan(str)
    // Not worn: no smith's work on it.
    p.profile.inv.items.push('leatherDoublet')
    expect(p.upgradeItem('leatherDoublet')).toBe(false)
  })

  it('without the gold nothing happens', () => {
    p.profile.gold = 0
    expect(p.upgradeItem('rustedShortsword')).toBe(false)
    expect(p.upgradeLevel('rustedShortsword')).toBe(0)
  })

  it('a sold piece loses its upgrade; the save keeps the levels', async () => {
    p.profile.gold = 10_000
    expect(p.upgradeItem('paddedTunic')).toBe(true)
    p.unequip('body')
    expect(p.sellItem('paddedTunic')).toBe(true)
    expect(p.upgradeLevel('paddedTunic')).toBe(0)
    expect(p.upgradeItem('woodenBuckler')).toBe(true)
    expect(p.upgradeItem('woodenBuckler')).toBe(true)
    p.saveProfile()
    drainAndResetModules()
    await holdGameState()
    const q = await import('@/game/state/profile')
    q.initProfile()
    expect(q.upgradeLevel('woodenBuckler')).toBe(2)
    expect(q.profile.inv.upgrades).toEqual({ woodenBuckler: 2 })
  })
})
