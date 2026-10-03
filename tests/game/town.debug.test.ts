import { it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { generateTown } from '@/game/sim/zoneGen'
import { TOWNS, type TownId } from '@/game/data/zones'
import { buildHouse } from '@/game/gfx/houses'
import { buildFences, buildPaving, buildProp } from '@/game/gfx/townProps'
import { Mesher, newKit, type Kit } from '@/game/gfx/archKit'
import { CELL } from '@/game/sim/grid'

const tris = (k: Kit): [number, number] => [(k.hull.idx.length + k.detail.idx.length + k.glow.idx.length) / 3, k.hull.idx.length / 3]

it('triangles per town', () => {
  const out: string[] = []
  for (const low of [false, true]) {
    for (const [t, f] of [['sunford', []], ['oakhaven', []], ['ironhold', []], ['oakhaven', ['oakhavenFallen']]] as Array<[TownId, string[]]>) {
      const plan = generateTown(TOWNS[t], new Set(f), 7)
      const tp = plan.town!
      const houses = newKit()
      let cut = 0
      let cutHull = 0
      for (const h of tp.houses) {
        const o = buildHouse(houses, h, { style: tp.style, ruined: tp.ruined, low, x: (h.i0 + h.cw / 2) * CELL, y: 0, z: (h.j0 + h.cd / 2) * CELL })
        if (o.cut) { const [a, b] = tris(o.cut); cut += a; cutHull += b }
      }
      const props = newKit()
      const ctx = { style: tp.style, ruined: tp.ruined, low, gy: () => 0 }
      for (const p of tp.props) buildProp(props, p, ctx)
      buildFences(props, tp, plan.w, plan.h, ctx)
      const pave = new Mesher()
      buildPaving(pave, plan, tp, ctx, plan.seed)
      const [h, hh] = tris(houses)
      const [p, ph] = tris(props)
      const pv = pave.idx.length / 3
      const lit = h + p + pv + cut
      const hull = hh + ph + cutHull
      out.push(`${low ? 'low ' : 'full'} ${t}${f.length ? '(fallen)' : ''}: houses ${h} (+cut ${cut}) props+fences ${p} paving ${pv} = ${lit} lit, ${hull} in outline hulls, drawn ≈ ${lit + hull}`)
    }
  }
  writeFileSync(process.env.DUMP ?? 'tri.txt', out.join('\n'))
})
