import { describe, expect, it } from 'vitest'
import { setupRun } from '@/game/sim/bot'
import { spawnEnemy } from '@/game/sim/spawn'
import { dealDamage } from '@/game/sim/combat'

// The floors (#233): an enemy's blow takes at least a share of the hero's full health whatever his defences.
const rig = (kind: string) => {
  const { sim } = setupRun({ zone: 'peak', level: 30, cls: 'aegis', seed: 5, floors: true })
  const hero = sim.hero.unit
  hero.s.armor = 1e6
  hero.s.resist = 0.7
  hero.s.damageReduction = 0.6
  hero.s.physReduction = 0.6
  hero.s.block = 0
  hero.s.dodge = 0
  const u = spawnEnemy(sim, kind, hero.x + 3, hero.z)!
  u.awake = true
  return { sim, hero, u }
}
const hit = (kind: string, opts: Parameters<typeof dealDamage>[4]): number => {
  const { sim, hero, u } = rig(kind)
  hero.hp = hero.s.maxHp
  hero.shield = 0
  const before = hero.hp
  dealDamage(sim, u, hero, 1, opts)
  return (before - hero.hp) / hero.s.maxHp
}

describe('the damage floors', () => {
  it('an ordinary blow takes at least 0.5 % of the hero\'s health, a boss\'s basic blow 3 %', () => {
    expect(hit('goblin', { type: 'physical', attack: true })).toBeGreaterThanOrEqual(0.005 - 1e-9)
    expect(hit('voidDragon', { type: 'physical', attack: true })).toBeGreaterThanOrEqual(0.03 - 1e-9)
  })
  it('a boss\'s heavy ability takes at least 10 %, an ordinary one 2 %', () => {
    expect(hit('voidDragon', { type: 'fire', heavy: true, canCrit: false })).toBeGreaterThanOrEqual(0.1 - 1e-9)
    expect(hit('goblin', { type: 'fire', heavy: true, canCrit: false })).toBeGreaterThanOrEqual(0.02 - 1e-9)
  })
  it('a charged blow takes at least a quarter', () => {
    expect(hit('voidDragon', { type: 'true', heavy: true, canCrit: false, capHp: 0.5, capFloor: 0.2 })).toBeGreaterThanOrEqual(0.25 - 1e-9)
  })
  it('the hero\'s own blows and the hero\'s allies are not floored', () => {
    const { sim, hero, u } = rig('goblin')
    const before = u.hp
    dealDamage(sim, hero, u, 1, { type: 'physical', attack: true, canCrit: false })
    expect(before - u.hp).toBeLessThan(u.s.maxHp * 0.005)
  })
})
