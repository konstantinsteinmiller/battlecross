import { describe, expect, it } from 'vitest'
import { ZONES, ZONE_IDS } from '@/game/data/zones'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { generateZone } from '@/game/sim/zoneGen'

/**
 * The old bosses as mini-bosses (#74, D85): each leads the pack half-way along
 * the road of a zone other than its own, as an elite — far weaker than the
 * boss whose fight it keeps, and the only elite of its pack.
 */

const OLD: Record<string, string> = { goblinTyrant: 'goblinKing', voidDrake: 'voidDragon', pitLord: 'archDemon', frostThane: 'frostJarl' }
/** The health (× a foe of its level) of each old boss fight, before the scripted fights took the ids. */
const OLD_HP: Record<string, number> = { goblinTyrant: 8.5, voidDrake: 13, pitLord: 13, frostThane: 12 }

describe('mini-bosses mid-way (#74, D85)', () => {
  const placed = ZONE_IDS.filter(z => ZONES[z].midBoss)

  it('every old boss has a zone, never its own', () => {
    expect(placed.map(z => ZONES[z].midBoss).sort()).toEqual(Object.keys(OLD).sort())
    for (const z of placed) expect(ZONES[z].finale.leader).not.toBe(OLD[ZONES[z].midBoss!])
  })

  it('is an elite, a fraction of the boss it was', () => {
    for (const [mini, boss] of Object.entries(OLD)) {
      expect(ENEMY_BY_ID[mini]!.rank).toBe('elite')
      expect(ENEMY_BY_ID[mini]!.hp).toBeLessThan(OLD_HP[mini]! * 0.4)
      expect(ENEMY_BY_ID[mini]!.look).not.toBe(ENEMY_BY_ID[boss]!.look)
    }
  })

  it('leads the middle pack, the only elite there, on every seed', () => {
    for (const z of placed) {
      for (const seed of [1, 2, 3, 17, 99]) {
        const plan = generateZone(ZONES[z], seed)
        const mid = plan.packs.filter(p => !p.finale)
        const with_ = mid.filter(p => p.kinds.includes(ZONES[z].midBoss!))
        expect(with_.length, `${z}#${seed}`).toBe(1)
        expect(with_[0]!.kinds.filter(k => ENEMY_BY_ID[k]?.rank === 'elite').length).toBe(1)
        expect(mid.indexOf(with_[0]!)).toBe(Math.ceil(ZONES[z].sections / 2) - 1)
      }
    }
  })
})
