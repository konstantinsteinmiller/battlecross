import { describe, it, expect } from 'vitest'
import { runZone } from '@/game/sim/bot'
import { ZONES, ZONE_IDS } from '@/game/data/zones'
import type { ClassId } from '@/game/data/skills'

/**
 * The balance curve, pinned. A reference player (`sim/bot.ts`) with a
 * level-appropriate build plays every zone at the level the map recommends.
 * The zone must be winnable without being a walkover, and take about as long
 * as a web-portal session wants a stage to take.
 *
 * This is a test and not a spreadsheet so that a later change to a formula —
 * an armour curve, a status duration — cannot move the curve silently.
 */

const CLASSES: ClassId[] = ['aegis', 'shadow', 'pyro', 'sovereign', 'chrono', 'blood', 'aether', 'geo']

describe('balance: the reference player through every zone', () => {
  const rows: string[] = []

  for (const zone of ZONE_IDS) {
    const def = ZONES[zone]
    it(`${zone} (levels ${def.min}-${def.max}) is winnable at its level and is not a walkover`, () => {
      let wins = 0
      let seconds = 0
      let hp = 0
      for (const cls of CLASSES) {
        const r = runZone({ zone, level: def.min + 1 > 30 ? 30 : Math.min(30, def.min + 1), cls, seed: 77 })
        if (r.outcome === 'victory') { wins++; seconds += r.seconds; hp += r.hpLeft01 }
        rows.push(`${zone.padEnd(10)} ${cls.padEnd(10)} ${r.outcome.padEnd(8)} ${r.seconds.toFixed(0).padStart(4)}s hp ${(r.hpLeft01 * 100).toFixed(0).padStart(3)}% potions ${r.potionsUsed} kills ${r.kills}`)
      }
      // Most classes clear it; none of them should stroll through.
      expect(wins).toBeGreaterThanOrEqual(5)
      const avg = seconds / Math.max(1, wins)
      // The plains are the opening stage: short on purpose.
      expect(avg).toBeGreaterThan(zone === 'plains' ? 20 : 45)
      expect(avg).toBeLessThan(330)
    })
  }

  it('covers every class in every zone', async () => {
    // `BALANCE_OUT=<file>` writes the table (a tuning pass reads it).
    const out = process.env.BALANCE_OUT
    if (out) (await import('node:fs')).writeFileSync(out, rows.join('\n') + '\n')
    expect(rows.length).toBe(ZONE_IDS.length * CLASSES.length)
  })

  it('an under-levelled hero is in real danger three tiers up (GDD pillar 3)', () => {
    let wins = 0
    for (const cls of CLASSES) if (runZone({ zone: 'crags', level: 4, cls, seed: 5 }).outcome === 'victory') wins++
    expect(wins).toBeLessThanOrEqual(1)
  })
})
