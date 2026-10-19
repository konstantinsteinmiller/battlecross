import { appendFileSync } from 'node:fs'
import { it } from 'vitest'
import { generateZone } from '@/game/sim/zoneGen'
import { ZONES } from '@/game/data/zones'
import { CELL } from '@/game/sim/grid'
it('dbg', () => {
  for (const [zone, seed, x, z] of [['hollows', 95029, 59.3, 47.3], ['outskirts', 47515, 27.8, 68.3]] as const) {
    const odd = seed % 2 === 1
    const def = ZONES[zone]
    const p = generateZone(def, seed, { cage: odd, treasure: !odd, pieces: odd ? ['a', 'b'] : [], ambush: odd ? def.kinds[0]!.kind : null })
    const ci = Math.floor(x / CELL), cj = Math.floor(z / CELL)
    const rows: string[] = [`${zone}#${seed} @${ci},${cj}`]
    for (let j = cj - 7; j <= cj + 7; j++) {
      let r = ''
      for (let i = ci - 10; i <= ci + 10; i++) {
        const k = j * p.w + i
        if (i === ci && j === cj) { r += '@'; continue }
        r += p.solid[k] ? '#' : p.sealed[k] ? 's' : ['.', 'w', 'b', 'f', 'B', 'p', 'c', 'r'][p.kind[k]!] ?? '?'
      }
      rows.push(r)
    }
    appendFileSync('C:/Users/konst/AppData/Local/Temp/claude/C--Users-konst-Documents---p-battlecross/2aef2bdf-6fde-4436-b6ea-f73305a8906d/scratchpad/dbg.txt', rows.join('\n') + '\n')
  }
})
