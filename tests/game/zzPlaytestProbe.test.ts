import { it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { generateZone } from '@/game/sim/zoneGen'
import { applyPlan, populateZone } from '@/game/sim/director'
import { botThink, referenceBuild } from '@/game/sim/bot'
import { OPENING, ZONES, visitLevel } from '@/game/data/zones'

const OUT = process.env.PROBE_OUT ?? 'probe.json'
const play = (zone: 'plains' | 'hollows', alt: boolean, heroLevel: number, seed: number) => {
  const def = ZONES[zone]
  const plan = alt ? generateZone(def, seed, { tutorial: true, alt: true, openingPack: OPENING.pack }) : generateZone(def, seed, {})
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: alt ? 1 : visitLevel(def, heroLevel), difficulty: 1, mode: 'zone', zone })
  applyPlan(sim, plan)
  const ref = referenceBuild({ cls: 'aegis', level: heroLevel })
  createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, zone, [])
  const dt = 1 / 30
  let think = 0, nextSample = 0
  const rows: any[] = []
  const events: any[] = []
  const bossIds = new Set<number>()
  while (!sim.ended && sim.time < 900) {
    think -= dt
    if (think <= 0) { think = 0.2; botThink(sim, false) }
    stepSim(sim, plan, dt)
    for (const e of sim.events) if (['awake','chest','kill','levelup','ended','cage'].includes((e as any).t)) events.push({ time: +sim.time.toFixed(1), e: (e as any).t, boss: (e as any).boss })
    sim.events.length = 0
    if (sim.time >= nextSample) {
      nextSample += 1
      const u = sim.hero.unit
      const foes = sim.units.filter(q => q.alive && q.team === 1)
      const near = foes.filter(q => q.awake && Math.hypot(q.x - u.x, q.z - u.z) < 16).length
      rows.push({ t: Math.round(sim.time), x: +u.x.toFixed(0), z: +u.z.toFixed(0), hp: +(u.hp / u.s.maxHp).toFixed(2), near, awake: foes.filter(q => q.awake).length, left: foes.length, kills: sim.hero.kills, gold: sim.hero.gold, chests: sim.chests.filter(c => c.state === 'open').length })
    }
  }
  return { zone, alt, heroLevel, seed, outcome: sim.ended, seconds: +sim.time.toFixed(1), packs: plan.packs.map(p => ({ kinds: p.kinds.length, boss: !!p.finale })), chestsTotal: sim.chests.length, rows, events: events.filter(e => e.e !== 'kill').slice(0, 80) }
}

it('probe', () => {
  const runs = [
    play('plains', true, 1, 5), play('plains', true, 1, 11),
    play('hollows', false, 3, 21), play('hollows', false, 4, 33), play('hollows', false, 3, 7)
  ]
  writeFileSync(OUT, JSON.stringify(runs))
}, 600000)
