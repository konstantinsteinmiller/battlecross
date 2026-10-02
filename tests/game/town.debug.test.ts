import { it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { buildHouse } from '@/game/gfx/houses'
import { newKit } from '@/game/gfx/archKit'
import { generateTown } from '@/game/sim/zoneGen'
import { TOWNS } from '@/game/data/zones'

it('dump', () => {
  const plan = generateTown(TOWNS.sunford, new Set(), 7)
  const out: string[] = []
  for (const h of plan.town!.houses) {
    const k = newKit()
    const o = buildHouse(k, h, { style: 'rural', ruined: false, low: false, x: 0, y: 0, z: 0 })
    const c = o.cut ?? k
    out.push([h.kind, h.inside, 'base', k.hull.idx.length / 3, k.detail.idx.length / 3, k.glow.idx.length / 3, 'cut', o.cut ? [c.hull.idx.length / 3, c.detail.idx.length / 3].join('/') : '-'].join(' '))
  }
  writeFileSync(process.env.DUMP ?? 'tri.txt', out.join('\n'))
})
