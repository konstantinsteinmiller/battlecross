// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { buildHouse } from '@/game/gfx/houses'
import { newKit, type Kit } from '@/game/gfx/archKit'
import { CLASS_IDS } from '@/game/data/skills'
import { generateTown } from '@/game/sim/zoneGen'
import { TOWNS, type TownId } from '@/game/data/zones'

/**
 * Interiors (roadmap #62): every room tells what it is with its furniture and
 * its clutter. The clutter is a kit of its own, drawn only while the front is
 * lifted and left out on a weak device; a room stays inside its triangle budget.
 */

const tris = (k: Kit | null): number => (k ? (k.hull.idx.length + k.detail.idx.length + k.glow.idx.length) / 3 : 0)

const ROOMS: Array<[string, 'cottage' | 'townhouse' | 'tavern' | 'hall' | 'chapel', number, number, string | undefined, string | undefined]> = [
  ['home', 'cottage', 4, 4, undefined, undefined], ['taproom', 'tavern', 7, 5, undefined, undefined],
  ['healer', 'chapel', 5, 5, 'healer', undefined], ['shop', 'townhouse', 5, 4, 'merchant', undefined],
  ...CLASS_IDS.map(cls => [`school ${cls}`, 'hall', 7, 5, undefined, cls] as [string, 'hall', number, number, undefined, string])
]

const build = (kind: string, cw: number, cd: number, job: string | undefined, cls: string | undefined, o: { low?: boolean; ruined?: boolean } = {}) => {
  const h = { kind, i0: 0, j0: 0, cw, cd, doorI: Math.floor(cw / 2), inside: true, owner: '', owners: [], sign: '', cls, storeys: 1, setback: false, seed: 77, yard: null, row: 0 } as never
  return buildHouse(newKit(), h, { style: 'rural', ruined: !!o.ruined, low: !!o.low, x: 0, y: 0, z: 0, job: job as never, cls: cls as never })
}

describe('interiors', () => {
  it('every room has its furniture and, apart, the clutter of its story (none on a weak device)', () => {
    for (const [label, kind, cw, cd, job, cls] of ROOMS) {
      const full = build(kind, cw, cd, job, cls)
      expect(tris(full.room), label).toBeGreaterThan(400)
      expect(tris(full.clutter), label).toBeGreaterThan(150)
      const low = build(kind, cw, cd, job, cls, { low: true })
      expect(low.clutter, label).toBeNull()
      // A weak device still gets the room (what it is), only not the small things.
      expect(tris(low.room), label).toBeGreaterThan(400)
    }
  })

  it('a room stays inside its budget (drawn only while it can be seen, but drawn whole)', () => {
    for (const [label, kind, cw, cd, job, cls] of ROOMS) {
      for (const ruined of [false, true]) {
        const o = build(kind, cw, cd, job, cls, { ruined })
        expect(tris(o.room), label).toBeLessThan(16000)
        expect(tris(o.clutter), label).toBeLessThan(9000)
      }
    }
  })

  it('a ruin is the same room broken: less on its shelves, its fire out', () => {
    for (const [label, kind, cw, cd, job, cls] of ROOMS) {
      const whole = build(kind, cw, cd, job, cls)
      const ruin = build(kind, cw, cd, job, cls, { ruined: true })
      // No warm glow left burning in a ruin's room (a cold hearth, no candles or lanterns).
      expect(ruin.room!.glow.idx.length, label).toBeLessThan(Math.max(1, whole.room!.glow.idx.length))
    }
  })

  it('every town has a family home or two to walk into, and its taproom tables carry packs', () => {
    for (const town of ['sunford', 'oakhaven', 'ironhold'] as TownId[]) {
      const t = generateTown(TOWNS[town], new Set(), 7).town!
      const homes = t.houses.filter(h => h.inside && !h.owner && h.kind !== 'tavern')
      expect(homes.length, town).toBeGreaterThanOrEqual(1)
      expect(homes.length, town).toBeLessThanOrEqual(2)
      const inn = t.houses.findIndex(h => h.kind === 'tavern' && h.inside)
      if (inn >= 0) expect(t.props.filter(p => p.kind === 'table' && p.w === 1).length, town).toBeGreaterThanOrEqual(2)
    }
  })
})
