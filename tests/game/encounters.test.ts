import { describe, expect, it } from 'vitest'
import {
  ENCOUNTER_ODDS, ENCOUNTER_PACE, ENCOUNTER_REGION, EncounterClock, chestReward, encountersAllowed, merchantTiers, rollEncounter
} from '@/game/data/encounters'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { MAP, ZONES, ZONE_FEATURES, ZONE_IDS, visitLevel } from '@/game/data/zones'
import { generateEncounter } from '@/game/sim/zoneGen'
import { CELL } from '@/game/sim/grid'

/**
 * Random encounters on the world map (roadmap #67): what is met
 * (`rollEncounter`), when (`EncounterClock`), and the ground it is fought on
 * (`generateEncounter`).
 */

/** Walk for `secs` at 60 frames a second; returns the times (s) encounters fired. */
const walk = (c: EncounterClock, secs: number, o: { road?: boolean; allowed?: boolean; walking?: boolean; t0?: number } = {}): number[] => {
  const out: number[] = []
  const dt = 1 / 60
  for (let i = 0; i < secs * 60; i++) if (c.step(dt, o.walking ?? true, o.road ?? false, o.allowed ?? true)) out.push((o.t0 ?? 0) + i * dt)
  return out
}

describe('when something jumps out', () => {
  it('off the road: one every 25 to 45 seconds of walking, never two within 10', () => {
    for (const seed of [1, 7, 42, 1234, 99991]) {
      const c = new EncounterClock(seed)
      const at = walk(c, 600)
      // 600 s of walking: between 600 / 45 and 600 / 25 of them.
      expect(at.length, `seed ${seed}`).toBeGreaterThanOrEqual(Math.floor(600 / ENCOUNTER_PACE.max))
      expect(at.length, `seed ${seed}`).toBeLessThanOrEqual(Math.ceil(600 / ENCOUNTER_PACE.min))
      expect(at[0]!).toBeGreaterThanOrEqual(ENCOUNTER_PACE.min - 0.05)
      for (let i = 1; i < at.length; i++) {
        const gap = at[i]! - at[i - 1]!
        expect(gap).toBeGreaterThanOrEqual(ENCOUNTER_PACE.min - 0.05)
        expect(gap).toBeLessThanOrEqual(ENCOUNTER_PACE.max + 0.05)
      }
    }
  })

  it('on a road it comes about three times less often', () => {
    const off = walk(new EncounterClock(5), 900).length
    const on = walk(new EncounterClock(5), 900, { road: true }).length
    expect(on).toBeGreaterThan(0)
    expect(on).toBeLessThan(off / 2)
  })

  it('standing still counts nothing; nothing fires when not allowed (before the first town, on the way into a place)', () => {
    const c = new EncounterClock(3)
    expect(walk(c, 300, { walking: false })).toEqual([])
    expect(c.meter).toBe(0)
    expect(walk(c, 300, { allowed: false })).toEqual([])
    expect(c.meter).toBe(0)
    // Allowed again: it takes a full stretch of walking, not an instant.
    expect(walk(c, ENCOUNTER_PACE.min - 1)).toEqual([])
  })

  it('a grace after leaving a place, and never within 10 seconds of the last one', () => {
    const c = new EncounterClock(11)
    c.meter = 999
    c.calm(3)
    // Ripe, but the grace holds it for three seconds.
    const at = walk(c, 5)
    expect(at).toHaveLength(1)
    expect(at[0]!).toBeGreaterThanOrEqual(3 - 0.02)
    // Ripe again at once: the gap holds it until ten seconds after the last.
    const sinceLast = c.since
    c.meter = 999
    const again = walk(c, 12)
    expect(again).toHaveLength(1)
    expect(sinceLast + again[0]!).toBeGreaterThanOrEqual(ENCOUNTER_PACE.gap - 0.05)
  })

  it('is deterministic from its seed', () => {
    expect(walk(new EncounterClock(77), 400)).toEqual(walk(new EncounterClock(77), 400))
    expect(walk(new EncounterClock(77), 400)).not.toEqual(walk(new EncounterClock(78), 400))
  })

  it('waits until the first town has been reached', () => {
    expect(encountersAllowed([])).toBe(false)
    expect(encountersAllowed(['plains'])).toBe(false)
    expect(encountersAllowed(['plains', 'hollows'])).toBe(false)
    expect(encountersAllowed(['plains', 'sunford'])).toBe(true)
  })
})

describe('what is met', () => {
  it('every place\'s land is some zone\'s', () => {
    for (const n of MAP) expect(ZONE_IDS, n.id).toContain(ENCOUNTER_REGION[n.id])
  })

  it('the same seed is the same encounter; the odds hold over many', () => {
    expect(rollEncounter('woods', 7, 123)).toEqual(rollEncounter('woods', 7, 123))
    const n: Record<string, number> = { fight: 0, elite: 0, chest: 0, merchant: 0 }
    for (let s = 1; s <= 4000; s++) n[rollEncounter('plains', 3, s * 7919).kind]!++
    for (const k of Object.keys(ENCOUNTER_ODDS) as Array<keyof typeof ENCOUNTER_ODDS>) {
      expect(n[k]! / 4000, k).toBeGreaterThan(ENCOUNTER_ODDS[k] / 100 - 0.03)
      expect(n[k]! / 4000, k).toBeLessThan(ENCOUNTER_ODDS[k] / 100 + 0.03)
    }
  })

  it('a fight is one or two small packs of the region\'s own ordinary enemies, at the region\'s level', () => {
    for (const zone of ZONE_IDS) {
      const def = ZONES[zone]
      const own = new Set(def.kinds.map(k => k.kind))
      for (let s = 1; s < 60; s++) {
        const e = rollEncounter(zone, 1, s * 104729)
        expect(e.level).toBe(visitLevel(def, 1))
        if (e.kind === 'fight') {
          expect(e.packs.length).toBeGreaterThanOrEqual(1)
          expect(e.packs.length).toBeLessThanOrEqual(2)
          for (const p of e.packs) {
            expect(p.length).toBeGreaterThanOrEqual(2)
            expect(p.length).toBeLessThanOrEqual(def.pack[1])
            for (const k of p) {
              expect(own.has(k), `${zone}: ${k}`).toBe(true)
              expect(ENEMY_BY_ID[k]!.rank).not.toBe('boss')
            }
          }
        } else if (e.kind === 'elite') {
          expect(e.packs).toEqual([[ZONE_FEATURES[zone].championKind]])
        } else {
          expect(e.packs).toEqual([])
        }
      }
    }
  })

  it('the rewards are modest and grow with the level', () => {
    expect(chestReward(1).gold).toBeLessThan(40)
    expect(chestReward(30).gold).toBeGreaterThan(chestReward(10).gold)
    expect(merchantTiers(1)).toEqual([1, 2])
    expect(merchantTiers(30)).toEqual([4, 5])
  })
})

describe('the ground an encounter is fought on', () => {
  it('a clearing to land in, then one per pack, the last one deciding the fight', () => {
    const packs = [['goblin', 'goblin'], ['wolf', 'bandit', 'bandit']]
    const plan = generateEncounter(packs, 99)
    expect(generateEncounter(packs, 99).solid).toEqual(plan.solid)
    expect(plan.packs.map(p => p.kinds)).toEqual(packs)
    expect(plan.packs.map(p => p.finale)).toEqual([false, true])
    expect(plan.packs.every(p => p.boss === '')).toBe(true)
    expect(plan.clearings[0]!.role).toBe('start')
    expect(plan.chests).toEqual([])
    expect(plan.chest).toBeNull()
    // The start and every pack stand on open ground.
    const cell = (x: number, z: number): number => plan.solid[Math.floor(z / CELL) * plan.w + Math.floor(x / CELL)]!
    expect(cell(plan.start.x, plan.start.z)).toBe(0)
    for (const p of plan.packs) expect(cell(p.x, p.z)).toBe(0)
    // A lone champion: one clearing, and it is the finale.
    const one = generateEncounter([['banditChief']], 5)
    expect(one.packs).toHaveLength(1)
    expect(one.packs[0]!.finale).toBe(true)
  })
})
