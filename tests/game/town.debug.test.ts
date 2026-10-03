import { it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { generateTown } from '@/game/sim/zoneGen'
import { TOWNS, type TownId } from '@/game/data/zones'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateTown } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { townLife } from '@/game/sim/townLife'
import { referenceBuild } from '@/game/sim/bot'

it('dump', () => {
  const out: string[] = []
  for (const [t, f] of [['sunford', []], ['oakhaven', []], ['ironhold', []], ['oakhaven', ['oakhavenFallen']]] as Array<[TownId, string[]]>) {
    const plan = generateTown(TOWNS[t], new Set(f), 7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'town', zone: t })
    applyPlan(sim, plan)
    createHero(sim, { build: referenceBuild({ cls: 'aegis', level: 1 }).build, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
    populateTown(sim, plan, {})
    const life = townLife(sim)!
    const tally = new Map<string, Map<string, number>>()
    for (let s = 0; s < 240 * 30; s++) {
      stepSim(sim, plan, 1 / 30)
      sim.events.length = 0
      if (s % 30) continue
      for (const p of life.people) {
        const m = tally.get(p.def.id) ?? new Map()
        const k = `${p.act}:${p.phase === 3 ? p.pose : 'ph' + p.phase}`
        m.set(k, (m.get(k) ?? 0) + 1)
        tally.set(p.def.id, m)
      }
    }
    out.push(`== ${t} ${f}`)
    for (const [id, m] of tally) out.push(`${id}: ` + [...m].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}=${n}`).join(' '))
  }
  writeFileSync(process.env.DUMP ?? 'dbg.txt', out.join('\n'))
})
