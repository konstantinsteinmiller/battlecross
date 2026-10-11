import { describe, expect, it } from 'vitest'
import { referenceBuild, runZone } from '@/game/sim/bot'
import { heroStats, sumBuild, HP_PER_LEVEL } from '@/game/sim/stats'
import { ATTR_EFFECTS, ATTRS } from '@/game/data/attributes'
import { CLASS_IDS, SKILL_BY_ID } from '@/game/data/skills'
import { POINTS_PER_LEVEL } from '@/game/data/attributes'
import { ZONES } from '@/game/data/zones'

/**
 * The level curve after #104, #109 and #110: health comes from Endurance, not
 * from levels; gear adds about what the hero has earned, not three to six
 * times it; mana matters for every class. Measured on the reference builds
 * (`sim/bot.ts`), the same ones the balance run plays.
 */

describe('health comes from Endurance (#109)', () => {
  it('three points of Endurance give more health than a level-up', () => {
    expect(3 * ATTR_EFFECTS.end.hpPerPoint).toBeGreaterThan(HP_PER_LEVEL * 2)
  })

  it('a build that skips Endurance has clearly less health than one that keeps a quarter in it', () => {
    for (const cls of ['pyro', 'shadow', 'aether'] as const) {
      const sensible = heroStats(referenceBuild({ level: 25, cls }).build).maxHp
      const glass = heroStats(referenceBuild({ level: 25, cls, glass: true }).build).maxHp
      expect(glass / sensible, cls).toBeLessThan(0.8)
    }
  })

  it('a glass cannon wins no more often, and with less to spare, in the late-middle zones', () => {
    let sensibleWins = 0
    let glassWins = 0
    let sensibleHp = 0
    let glassHp = 0
    // Where enemies bite hardest (levels 6-22; the endgame bosses keep their own tuning).
    // Four seeds: on one, a single close fight can go either way.
    for (const seed of [77, 78, 79, 80]) for (const zone of ['tundra', 'temple', 'citadel', 'peak'] as const) {
      for (const cls of ['pyro', 'shadow', 'aether', 'chrono', 'windrunner', 'elementalist'] as const) {
        const level = Math.min(30, ZONES[zone].min + 1)
        const a = runZone({ zone, level, cls, seed })
        const b = runZone({ zone, level, cls, seed, glass: true })
        if (a.outcome === 'victory') { sensibleWins++; sensibleHp += a.hpLeft01 }
        if (b.outcome === 'victory') { glassWins++; glassHp += b.hpLeft01 }
      }
    }
    expect(glassWins).toBeLessThanOrEqual(sensibleWins)
    expect(glassHp).toBeLessThan(sensibleHp)
  }, 480_000)
})

describe('gear adds about what the hero has earned (#110)', () => {
  it('a full set at level 25 is worth at most 1.6 times the points spent', () => {
    let gear = 0
    let points = 0
    for (const cls of CLASS_IDS) {
      const { build } = referenceBuild({ level: 25, cls })
      const t = sumBuild(build).attrs
      for (const a of ATTRS) gear += t[a] - build.attrs[a]
      points += 24 * POINTS_PER_LEVEL
    }
    // Measured: 1.26 (before #110: three to six times).
    expect(gear / points).toBeLessThan(1.6)
  })
})

describe('mana matters for every class (#104)', () => {
  it('every class can cast its whole loadout at least once, at every level', () => {
    for (const cls of CLASS_IDS) {
      for (const level of [10, 20, 30]) {
        const { build, skills } = referenceBuild({ level, cls })
        const s = heroStats(build)
        const rotation = skills.reduce((n, id) => n + (SKILL_BY_ID[id]?.mana ?? 0), 0)
        expect(s.maxMana, `${cls} at ${level}`).toBeGreaterThanOrEqual(rotation)
      }
    }
  })

  it('casting everything on cooldown outruns the regeneration for most classes', () => {
    let short = 0
    for (const cls of CLASS_IDS) {
      const { build, skills } = referenceBuild({ level: 20, cls })
      const s = heroStats(build)
      const spend = skills.reduce((n, id) => n + (SKILL_BY_ID[id]?.mana ?? 0) / Math.max(1, SKILL_BY_ID[id]?.cd ?? 1), 0)
      if (s.manaRegen < spend) short++
    }
    // Before #104 the casters out-regenerated their whole loadout from level 10.
    expect(short).toBeGreaterThanOrEqual(Math.ceil(CLASS_IDS.length / 2))
  })
})
