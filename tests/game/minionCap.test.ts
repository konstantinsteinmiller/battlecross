import { describe, expect, it } from 'vitest'
import { setupRun } from '@/game/sim/bot'
import { stepSim } from '@/game/sim/step'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { MINION_CAP, spawnEnemy, spawnMinion, spawnSpirit } from '@/game/sim/spawn'
import { SPIRIT_DAMAGE_TAKEN_MUL, SPIRIT_DECAY_PER_SEC } from '@/game/data/relics'

/** #176 minion cap, #175 raised souls: no clock, a slow fade, frail against ordinary foes. */
const band = (sim: ReturnType<typeof setupRun>['sim']) =>
  sim.units.filter(m => m.alive && m.team === 0 && m.ownerId === sim.hero.unit.id && (m.rank === 'minion' || m.rank === 'turret'))

describe('the hero\'s band', () => {
  it('stops at the cap: the seventh summon never appears', () => {
    const { sim } = setupRun({ zone: 'plains', level: 10, cls: 'aegis', geared: true, seed: 7 })
    const h = sim.hero.unit
    for (let i = 0; i < MINION_CAP; i++) expect(spawnMinion(sim, 'guard', h.x + i, h.z, -1)).not.toBeNull()
    expect(spawnMinion(sim, 'guard', h.x, h.z + 2, -1)).toBeNull()
    expect(band(sim)).toHaveLength(MINION_CAP)
  })

  it('a raised soul has no clock, fades by a share of its health a second, and spirits count against the cap', () => {
    const { sim, plan } = setupRun({ zone: 'plains', level: 10, cls: 'aegis', geared: true, seed: 7 })
    const h = sim.hero.unit
    const foe = sim.units.find(u => u.team === 1 && u.rank !== 'boss' && ENEMY_BY_ID[u.kind])!
    const s = spawnSpirit(sim, foe, 8)!
    expect(s.life).toBeLessThan(0)
    for (let i = 0; i < 6; i++) spawnMinion(sim, 'guard', h.x + i, h.z, -1)
    expect(band(sim)).toHaveLength(MINION_CAP)
    expect(spawnSpirit(sim, spawnEnemy(sim, foe.kind, h.x, h.z + 3, 0, null)!, 8)).toBeNull()
    const hp0 = s.hp
    for (let i = 0; i < 30 * 5; i++) { stepSim(sim, plan, 1 / 30); sim.events.length = 0 }
    if (s.alive) expect(s.hp).toBeLessThan(hp0)
    expect(SPIRIT_DECAY_PER_SEC).toBe(0.01)
    expect(SPIRIT_DAMAGE_TAKEN_MUL).toBe(1.5)
  })
})
