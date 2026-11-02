// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { generateZone } from '@/game/sim/zoneGen'
import { ZONES } from '@/game/data/zones'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateZone } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { spawnEnemy } from '@/game/sim/spawn'
import { dealDamage } from '@/game/sim/combat'
import { referenceBuild } from '@/game/sim/bot'

/**
 * The intro's scene is the tundra with its own packs dismissed (#189): the director must not find the finale's pack
 * "cleared" and call the visit won, and the drake falling must not end anything: the film goes on to its black.
 */
describe('the intro only asks the effects for what they know', () => {
  it('every damage type the film strikes with has an impact colour (an unknown one threw in the middle of every frame and froze the game)', async () => {
    const { readFileSync } = await import('node:fs')
    const { TYPE_COLOR } = await import('@/game/gfx/vfx')
    const src = readFileSync('src/game/intro/runner.ts', 'utf8')
    const used = new Set([...src.matchAll(/hit\(sim, c, \d+, ([^,]+),/g)].flatMap(m => [...m[1]!.matchAll(/'([a-z]+)'/g)].map(x => x[1]!)).filter(w => !['fireball', 'frostLance', 'chainSpark'].includes(w)))
    expect(used.size).toBeGreaterThan(2)
    for (const t of used) expect(TYPE_COLOR, t).toHaveProperty(t)
  })
})

describe('a staged pack is not walked to the hero', () => {
  it('a minion with a stage flag keeps its place and its facing while the hero stands elsewhere', async () => {
    const { spawnMinion } = await import('@/game/sim/spawn')
    const plan = generateZone(ZONES.tundra, 130, {})
    const sim = new Sim({ seed: 130, w: plan.w, h: plan.h, level: 19, difficulty: 1, mode: 'zone', zone: 'tundra' })
    applyPlan(sim, plan)
    const ref = referenceBuild({ level: 1, cls: 'aegis' })
    createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
    const m = spawnMinion(sim, 'packWolf', plan.start.x + 12, plan.start.z, 30, false)!
    m.stunt = { lift: 0, flip: 0 }
    m.facing = 1.1
    const x0 = m.x
    for (let t = 0; t < 3; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    expect(m.x).toBeCloseTo(x0, 5)
    expect(m.facing).toBeCloseTo(1.1, 5)
    // …and unflagged, the same wolf runs to the hero (why the flag matters).
    const w = spawnMinion(sim, 'packWolf', plan.start.x + 12, plan.start.z, 30, false)!
    for (let t = 0; t < 3; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    expect(Math.abs(w.x - (plan.start.x + 12))).toBeGreaterThan(1)
  })
})

describe('the intro scene stays a scene', () => {
  it('no victory when the packs are dismissed, nor when the drake falls', () => {
    const plan = generateZone(ZONES.tundra, 130, {})
    const sim = new Sim({ seed: 130, w: plan.w, h: plan.h, level: 19, difficulty: 1, mode: 'zone', zone: 'tundra' })
    applyPlan(sim, plan)
    const ref = referenceBuild({ level: 1, cls: 'aegis' })
    createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
    populateZone(sim, plan, 'tundra', [])
    for (const e of [...sim.units]) if (e.team === 1) sim.dismiss(e)
    for (const g of sim.groups) g.cleared = true
    const drake = spawnEnemy(sim, 'voidDrake', plan.start.x, plan.start.z - 5, -1)!
    for (let t = 0; t < 4; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    expect(sim.ended).toBeFalsy()
    dealDamage(sim, null, drake, 1e12, { type: 'true', canCrit: false } as Parameters<typeof dealDamage>[4])
    for (let t = 0; t < 4; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    expect(drake.alive).toBe(false)
    expect(sim.ended).toBeFalsy()
  })

  it('and without marking the groups cleared the same scene would be won at once (why the runner does it)', () => {
    const plan = generateZone(ZONES.tundra, 130, {})
    const sim = new Sim({ seed: 130, w: plan.w, h: plan.h, level: 19, difficulty: 1, mode: 'zone', zone: 'tundra' })
    applyPlan(sim, plan)
    const ref = referenceBuild({ level: 1, cls: 'aegis' })
    createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
    populateZone(sim, plan, 'tundra', [])
    for (const e of [...sim.units]) if (e.team === 1) sim.dismiss(e)
    for (let t = 0; t < 1; t += 1 / 30) stepSim(sim, plan, 1 / 30)
    expect(sim.ended).toBe('victory')
  })
})
