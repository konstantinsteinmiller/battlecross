// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { referenceBuild } from '@/game/sim/bot'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepBoss, setArena } from '@/game/sim/bosses'
import { GROVE_TUNING } from '@/game/sim/bosses/grove'
import { ENEMY_BY_ID } from '@/game/data/enemies'

/** The Elder Treant's shamans (#171): they mend it while they live. */
const treant = (): { sim: Sim; u: ReturnType<typeof spawnEnemy> } => {
  const sim = new Sim({ seed: 5, w: 40, h: 40, level: 7, difficulty: 1, mode: 'zone', zone: 'woods' })
  const ref = referenceBuild({ level: 7, cls: 'aegis' })
  createHero(sim, { build: ref.build, skills: ref.skills, x: 12, z: 12, xpInto: 0, potions: 3 })
  const u = spawnEnemy(sim, 'elderTreant', 20 * 1.5, 20 * 1.5, 1)
  return { sim, u }
}

describe('the Elder Treant and its shamans (#171)', () => {
  it('is a scripted fight with a Grove Shaman def, in the woods', () => {
    expect(ENEMY_BY_ID.elderTreant!.script).toBe('grove')
    expect(ENEMY_BY_ID.groveShaman).toBeTruthy()
  })

  it('two shamans stand up with it, and mend it while they live; dead, they mend nothing', () => {
    const { sim, u } = treant()
    expect(u).toBeTruthy()
    setArena(sim, u!)
    const marks = u!.boss!.marks.filter(m => m.startsWith('sh:'))
    expect(marks).toHaveLength(2)
    u!.hp = u!.s.maxHp * 0.8
    const before = u!.hp
    for (let i = 0; i < 20; i++) stepBoss(sim, u!, 0.1, sim.hero.unit)
    const gain = u!.hp - before
    expect(gain).toBeCloseTo(u!.s.maxHp * GROVE_TUNING.MEND * 2 * 2, 0)
    for (const m of marks) sim.get(+m.slice(3))!.alive = false
    const at = u!.hp
    for (let i = 0; i < 20; i++) stepBoss(sim, u!, 0.1, sim.hero.unit)
    expect(u!.hp).toBe(at)
  })

  it('two more are called at half health', () => {
    const { sim, u } = treant()
    setArena(sim, u!)
    u!.hp = u!.s.maxHp * 0.45
    stepBoss(sim, u!, 0.1, sim.hero.unit)
    expect(u!.boss!.phase).toBe(2)
    expect(u!.boss!.marks.filter(m => m.startsWith('sh:'))).toHaveLength(4)
  })
})
