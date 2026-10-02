// @vitest-environment jsdom
// The numbers behind the screens' previews: a piece set against the one worn
// (`compareMods`), what wearing it or a point of an attribute would change
// (`statRows`), and where a piece would go (`slotFor`), all asked of the same
// rules the fight uses. And the drawn backdrops behind the screens.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { compareMods, signed } from '@/components/game/modLines'
import { BACKDROPS, BACKDROP_H, BACKDROP_SAFE, BACKDROP_W, backdropSvg } from '@/components/game/backdrops'

type P = typeof import('@/game/state/profile')
type S = typeof import('@/components/game/heroSheet')
let p: P
let s: S

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  s = await import('@/components/game/heroSheet')
  p.initProfile()
})
afterEach(() => { drainPersist(); vi.restoreAllMocks() })

describe('a piece against the one worn', () => {
  it('every line of the new piece says how it differs; the worn piece\'s other lines are what is given up', () => {
    // Iron Broadsword (str 12, end 5, block 5 %) against the Rusted Shortsword (str 4, dex 2).
    const lines = compareMods({ str: 12, end: 5, block: 0.05 }, { str: 4, dex: 2 })
    expect(lines.map(l => [l.id, l.n, l.delta, l.gone])).toEqual([
      ['str', 12, 8, false],
      ['end', 5, 5, false],
      ['block', 5, 5, false],
      ['dex', 2, -2, true]
    ])
    // Nothing worn: every line is all gain; the same piece: no difference.
    expect(compareMods({ int: 5 }, undefined)).toEqual([expect.objectContaining({ id: 'int', delta: 5, gone: false })])
    expect(compareMods({ int: 5 }, { int: 5 })[0]!.delta).toBe(0)
    expect([signed(3), signed(-2.5), signed(0)]).toEqual(['+3', '−2.5', '0'])
  })
})

describe('what a change would do', () => {
  it('the rows carry the new value and the difference, in the units they are shown in', () => {
    const now = p.computeStats()
    const same = s.statRows(now)
    expect(same.map(r => r.key)).toEqual(s.STATS.map(d => d.key))
    expect(same.every(r => r.delta === 0 && r.deltaText === '' && r.next === r.text)).toBe(true)
    // Only the key six, in their order.
    expect(s.statRows(now, now, s.KEY_STATS).map(r => r.key)).toEqual(['damage', 'health', 'mana', 'armor', 'crit', 'moveSpeed'])
    // One more point of Endurance: more health, nothing about mana.
    const more = s.statsWithAttrs({ ...p.profile.hero.attrs, end: p.profile.hero.attrs.end + 1 })
    const rows = s.statRows(now, more)
    const health = rows.find(r => r.key === 'health')!
    expect(health.delta).toBeGreaterThan(0)
    expect(health.deltaText).toBe(`+${health.delta}`)
    expect(rows.find(r => r.key === 'mana')!.delta).toBe(0)
  })

  it('a piece in the bag is measured in the slot it would take; the hero is not changed by asking', () => {
    p.profile.level = 10
    p.gainItem('chainmailVest')
    expect(s.slotFor('chainmailVest')).toBe('body')
    expect(s.wornAgainst('chainmailVest')).toBe('paddedTunic')
    const before = JSON.stringify(p.profile.inv.equipped)
    const next = s.statsWith('body', 'chainmailVest')
    expect(next.armor).toBeGreaterThan(p.computeStats().armor)
    expect(JSON.stringify(p.profile.inv.equipped)).toBe(before)
    // The worn piece itself is measured against nothing.
    expect(s.wornAgainst('paddedTunic')).toBeNull()
  })

  it('a ring goes to the free trinket slot, else the first, as `equipItem` puts it', () => {
    p.profile.level = 10
    p.gainItem('copperBand')
    p.gainItem('ringOfMending')
    expect(s.slotFor('copperBand')).toBe('trinket1')
    p.equipItem('copperBand')
    expect(s.slotFor('ringOfMending')).toBe('trinket2')
    expect(s.wornAgainst('ringOfMending')).toBeNull()
    p.equipItem('ringOfMending')
    expect(s.slotFor('ringOfMending')).toBe('trinket2')
    // Moving a ring to the other hand in a preview swaps them, as the rule does.
    const swapped = s.statsWith('trinket1', 'ringOfMending')
    expect(swapped.maxHp).toBe(p.computeStats().maxHp)
  })
})

describe('the drawn backdrops', () => {
  it.each(BACKDROPS)('%s is a full 16:9 picture with no lettering in it', (name) => {
    const svg = backdropSvg(name)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain(`viewBox="0 0 ${BACKDROP_W} ${BACKDROP_H}"`)
    expect(svg).toContain('preserveAspectRatio="xMidYMid slice"')
    expect(BACKDROP_W / BACKDROP_H).toBeCloseTo(16 / 9, 1)
    // A painter's reference and a drop-in: no text, no images pulled in.
    expect(svg).not.toMatch(/<text|<image|href="http/)
    expect(svg).not.toMatch(/NaN|undefined/)
    // It parses as SVG.
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    expect(doc.querySelector('parsererror')).toBeNull()
    // The same drawing every time (seeded, cached).
    expect(backdropSvg(name)).toBe(svg)
  })

  it('keeps the middle calm: the content-safe band is the middle 44 %', () => {
    expect(BACKDROP_SAFE).toEqual([0.28, 0.72])
  })
})
