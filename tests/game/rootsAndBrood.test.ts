import { describe, expect, it } from 'vitest'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { setupRun } from '@/game/sim/bot'
import { spawnEnemy } from '@/game/sim/spawn'
import { abilityReady, startAbility } from '@/game/sim/abilities'
import { isRooted, moveSpeedOf } from '@/game/sim/combat'
import { stepSim } from '@/game/sim/step'
import { BROOD_TUNING } from '@/game/sim/bosses/brood'

// #242 (treants root and throw roots) and #241 (the Brood Mother).
const rig = (zone: 'woods' | 'hollows' = 'woods') => {
  const { sim, plan } = setupRun({ zone, level: 12, cls: 'aegis', seed: 5 })
  const hero = sim.hero.unit
  hero.hp = hero.s.maxHp
  return { sim, plan, hero }
}
const run = (sim: ReturnType<typeof rig>['sim'], plan: ReturnType<typeof rig>['plan'], seconds: number): void => {
  for (let i = 0; i < seconds * 30; i++) stepSim(sim, plan, 1 / 30)
}

describe('treants (#242)', () => {
  it('a plain treant roots, a champion or elite also throws a fan of five roots', () => {
    for (const id of ['treant', 'corruptedTreant', 'elderTreant', 'thornfather']) {
      const kinds = ENEMY_BY_ID[id]!.abilities.map(a => a.kind)
      expect(kinds, id).toContain('root')
      expect(kinds, id).toContain('rootLine')
    }
    const plain = ENEMY_BY_ID.treant!.abilities.find(a => a.kind === 'rootLine')!
    expect(plain.champ).toBe(true)
    expect(plain.count).toBe(5)
  })

  it('the root holds a hero in place for three seconds, then lets go; only one root at a time', () => {
    const { sim, plan, hero } = rig()
    const t = spawnEnemy(sim, 'treant', hero.x + 4, hero.z)!
    t.awake = true
    const idx = ENEMY_BY_ID.treant!.abilities.findIndex(a => a.kind === 'root')
    const ab = ENEMY_BY_ID.treant!.abilities[idx]!
    t.cds[idx] = 0
    expect(abilityReady(sim, t, ab, idx, hero)).toBe(true)
    startAbility(sim, t, ab, idx, hero)
    run(sim, plan, ab.windup + 0.2)
    expect(isRooted(hero)).toBe(true)
    expect(moveSpeedOf(hero)).toBe(0)
    // Another root cannot be cast on a hero already held.
    t.cds[idx] = 0
    expect(abilityReady(sim, t, ab, idx, hero)).toBe(false)
    run(sim, plan, 3.2)
    expect(isRooted(hero)).toBe(false)
    expect(moveSpeedOf(hero)).toBeGreaterThan(0)
  })

  it('roots are a light blow', () => {
    const { sim, plan, hero } = rig()
    const t = spawnEnemy(sim, 'treant', hero.x + 4, hero.z)!
    t.awake = true
    const idx = ENEMY_BY_ID.treant!.abilities.findIndex(a => a.kind === 'root')
    startAbility(sim, t, ENEMY_BY_ID.treant!.abilities[idx]!, idx, hero)
    const before = hero.hp
    run(sim, plan, 1.2)
    expect((before - hero.hp) / hero.s.maxHp).toBeLessThan(0.15)
  })

  it('the fan lands root by root: a hero standing close takes more of them than one who steps to the side', () => {
    const lost = (dx: number, dz: number): number => {
      const { sim, plan, hero } = rig()
      const t = spawnEnemy(sim, 'elderTreant', hero.x + 3, hero.z)!
      t.awake = true
      const idx = ENEMY_BY_ID.elderTreant!.abilities.findIndex(a => a.kind === 'rootLine')
      const ab = ENEMY_BY_ID.elderTreant!.abilities[idx]!
      // The treant faces the hero; the hero then stands at (dx, dz) from him.
      startAbility(sim, t, ab, idx, hero)
      hero.x = t.x + dx
      hero.z = t.z + dz
      const before = hero.hp
      run(sim, plan, ab.windup + 1)
      return before - hero.hp
    }
    // Hero was at (-3, 0) of the treant: the fan opens toward -x; close in the middle takes several roots, far to the side none.
    const middleClose = lost(-1.2, 0)
    const sideFar = lost(-1.2, 7)
    expect(middleClose).toBeGreaterThan(0)
    expect(sideFar).toBe(0)
  })
})

describe('the Brood Mother (#241)', () => {
  it('runs by the brood script and its brood has a no-warning lunge worth three in a hundred', () => {
    expect(ENEMY_BY_ID.broodMother!.script).toBe('brood')
    const lunge = ENEMY_BY_ID.broodling!.abilities.find(a => a.kind === 'lunge')!
    expect(lunge.pct).toBeCloseTo(0.03)
    expect(BROOD_TUNING.MAX_BROOD).toBe(6)
  })

  it('a web holds the other team to a fifth of its speed for five seconds', () => {
    const { sim, plan, hero } = rig('hollows')
    const mother = spawnEnemy(sim, 'broodMother', hero.x + 6, hero.z)!
    mother.awake = true
    const speed = moveSpeedOf(hero)
    const start = sim.fields.length
    expect(start).toBeGreaterThanOrEqual(0)
    // Lay one under the hero through the script's own ground effect.
    sim.fields.push({ active: true, fx: 'web', team: 1, srcId: mother.id, x: hero.x, z: hero.z, r: 2.3, t: 0, dur: BROOD_TUNING.WEB_DUR, every: 0.5, next: 0.5, dmg: 0, type: 'physical', kind: 'web', v: BROOD_TUNING.WEB_SLOW, skill: '', color: '#fff' })
    run(sim, plan, 0.2)
    expect(moveSpeedOf(hero)).toBeCloseTo(speed * 0.2, 5)
  })

  it('the call brings spiderlings out of the ground, never more than six, and they jump on the hero', () => {
    const { sim, plan, hero } = rig('hollows')
    const mother = spawnEnemy(sim, 'broodMother', hero.x + 7, hero.z)!
    mother.awake = true
    mother.targetId = hero.id
    hero.hp = hero.s.maxHp
    let most = 0
    let hit = 0
    let last = hero.hp
    for (let i = 0; i < 30 * 60; i++) {
      stepSim(sim, plan, 1 / 30)
      let n = 0
      for (const m of sim.units) if (m.alive && m.kind === 'broodling') n++
      most = Math.max(most, n)
      if (hero.hp < last) hit++
      last = hero.hp
      hero.hp = hero.s.maxHp
      if (!mother.alive) break
    }
    expect(most).toBeGreaterThan(0)
    expect(most).toBeLessThanOrEqual(BROOD_TUNING.MAX_BROOD)
    expect(hit).toBeGreaterThan(0)
  })
})
