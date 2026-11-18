import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { generateZone } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { applyStatus, dealDamage, SHIELD_GUARD } from '@/game/sim/combat'
import { startAttrs } from '@/game/data/attributes'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { ZONES } from '@/game/data/zones'

/** #EXT-3 and #EXT-2: the Hollows' three new kinds, and one trick per section. */

const scene = () => {
  const plan = generateZone(ZONES.hollows, 11)
  const sim = new Sim({ seed: 11, w: plan.w, h: plan.h, level: 4, difficulty: 1, mode: 'zone', zone: 'hollows' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: 4, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
  return { sim, plan }
}

describe('the shield brute', () => {
  const hit = (sim: Sim, from: 'front' | 'back', stun = false): number => {
    const h = sim.hero.unit
    const b = spawnEnemy(sim, 'shieldBrute', h.x + 3, h.z)!
    b.hp = b.s.maxHp = 1e6
    b.facing = from === 'front' ? -Math.PI / 2 : Math.PI / 2
    if (stun) applyStatus(sim, b, 'stun', 3, 1, h, { quiet: true })
    const before = b.hp
    dealDamage(sim, h, b, 1000, { type: 'physical', canCrit: false, attack: true })
    return before - b.hp
  }
  it('turns a blow from the front, takes a whole one from behind or when stunned', () => {
    const { sim } = scene()
    const front = hit(sim, 'front')
    const back = hit(sim, 'back')
    const bashed = hit(sim, 'front', true)
    expect(front).toBeGreaterThan(0)
    expect(front).toBeLessThan(back * (SHIELD_GUARD + 0.1))
    expect(bashed).toBeGreaterThan(front * 3)
  })
})

describe('the new kinds and the sections', () => {
  it('the shaman mends, the bomb goblin bursts, and all three are on the Hollows list', () => {
    expect(ENEMY_BY_ID.goblinShaman!.abilities.some(a => a.kind === 'heal')).toBe(true)
    expect(ENEMY_BY_ID.bombGoblin!.deathBlast).toBeDefined()
    const kinds = ZONES.hollows.kinds.map(k => k.kind)
    for (const k of ['goblinShaman', 'bombGoblin', 'shieldBrute']) expect(kinds).toContain(k)
  })
  it('each section before the King has its own trick', () => {
    const plan = generateZone(ZONES.hollows, 11)
    const packs = plan.packs.filter(p => !p.finale)
    expect(packs[0]!.kinds).toContain('goblinShaman')
    expect(packs[1]!.kinds.filter(k => k === 'bombGoblin').length).toBeGreaterThanOrEqual(2)
    expect(packs[2]!.kinds).toContain('shieldBrute')
  })
})
