import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { Sim } from '@/game/sim/world'
import { createHero, castSkill } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'
import { FIXED_EFFECT, SKILLS, scalingOf, type SkillDef } from '@/game/data/skills'

/**
 * The scaling badge (#96, #105) names the attribute a skill's effect grows
 * with, and appears on no skill whose effect reads none. Every active skill is
 * cast once with the hero's power table watched, which records the attributes
 * the effect actually reads; effects that only fire later (souls to release,
 * burns to set off, a blow to answer) are read from the handler's source.
 */

const ATTRS = ['str', 'dex', 'int', 'end', 'skl', 'cha']

/** Each handler's source, by skill id (`  id: (c) => {` … the next one). */
const handlers = (): Record<string, string> => {
  const lines = readFileSync('src/game/sim/heroSkills.ts', 'utf8').split('\n')
  const starts: Array<{ id: string; i: number }> = []
  lines.forEach((l, i) => { const m = /^ {2}(\w+): \(c\)/.exec(l); if (m) starts.push({ id: m[1]!, i }) })
  const out: Record<string, string> = {}
  starts.forEach((s, k) => { out[s.id] = lines.slice(s.i, starts[k + 1]?.i ?? lines.length).join('\n') })
  return out
}
const SRC = handlers()
const sourceReads = (id: string): string[] =>
  [...(SRC[id] ?? '').matchAll(/pw\(c, '(\w+)'\)|scalePower\([^,]+, '(\w+)'\)/g)].map(m => (m[1] ?? m[2])!)
const spawnsSpirits = (id: string): boolean => /spawnSpirit\(/.test(SRC[id] ?? '')

/** Cast once with every attribute raised; what the effect read, and whether it summoned. */
const probe = (def: SkillDef): { reads: string[]; summon: boolean } => {
  const plan = generateArena(7)
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 30, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  const attrs = { ...startAttrs(), str: 40, dex: 40, int: 40, end: 40, skl: 40, cha: 40 }
  createHero(sim, {
    build: { level: 30, attrs, equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
    skills: [def.id], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3
  })
  const u = sim.hero.unit
  u.mana = 9999
  for (let i = 0; i < 3; i++) { const e = spawnEnemy(sim, 'goblin', u.x + 2 + i, u.z + 1)!; e.awake = true }
  const reads = new Set<string>()
  u.s.power = new Proxy(u.s.power, { get(t, k) { if (typeof k === 'string') reads.add(k); return (t as Record<string, unknown>)[k as string] } })
  const target = sim.units.find(x => x.team === 1)!
  castSkill(sim, 0, { x: target.x, z: target.z })
  for (let t = 0; t < 4; t += 1 / 30) { stepSim(sim, plan, 1 / 30); sim.events.length = 0 }
  return { reads: [...reads].filter(a => ATTRS.includes(a)), summon: sim.units.some(x => x.team === 0 && x.ownerId === u.id) }
}

describe('the scaling badge only where the effect grows with an attribute', () => {
  it('passives show none: they are flat bonuses', () => {
    for (const s of SKILLS.filter(s => s.kind === 'passive')) expect(scalingOf(s), s.id).toBeNull()
  })

  it('every active skill names what it reads — or is listed as a fixed effect', () => {
    for (const def of SKILLS.filter(s => s.kind === 'active')) {
      const { reads, summon } = probe(def)
      const later = sourceReads(def.id)
      if (FIXED_EFFECT.has(def.id)) {
        expect(reads, `${def.id} reads an attribute but is listed as fixed`).toEqual([])
        expect(later, `${def.id}'s handler reads an attribute but is listed as fixed`).toEqual([])
        expect(summon || spawnsSpirits(def.id), `${def.id} summons but is listed as fixed`).toBe(false)
        continue
      }
      const shown = scalingOf(def)
      expect(shown, def.id).not.toBeNull()
      // A summon's blows: minions by Charisma, the turret by Skill, spirits by Intelligence.
      const ok = reads.includes(shown!) || later.includes(shown!) || (spawnsSpirits(def.id) && shown === 'int') ||
        (summon && (shown === 'cha' || reads.includes(shown!))) ||
        // The homunculus is made of the hero's own health; Combustion sets off
        // burns that Intelligence already scaled.
        (def.id === 'homunculus' && shown === 'end') || (def.id === 'combustion' && shown === 'int')
      expect(ok, `${def.id} shows ${shown} but reads [${reads}] (later [${later}])`).toBe(true)
    }
  }, 60_000)
})
