import { expect, it } from 'vitest'
import { generateZone, fillGrid } from '@/game/sim/zoneGen'
import { createGrid, isSolidCell, CELL } from '@/game/sim/grid'
import { ZONES, OPENING } from '@/game/data/zones'

const reach = (g: any, from: [number, number], to: [number, number]): boolean => {
  const seen = new Set<number>([from[1] * g.w + from[0]])
  const st = [from]
  while (st.length) {
    const [i, j] = st.pop()!
    if (i === to[0] && j === to[1]) return true
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ni = i + di, nj = j + dj
      if ((!di && !dj) || isSolidCell(g, ni, nj) || seen.has(nj * g.w + ni)) continue
      if (di && dj && (isSolidCell(g, ni, j) || isSolidCell(g, i, nj))) continue
      seen.add(nj * g.w + ni); st.push([ni, nj])
    }
  }
  return false
}
/** The stretched level's palisade gate (a playtester found one that led nowhere): over many seeds the open gate always leaves a walk from the start to the boss, and the shut one none. */
it('the gate is a way through to the boss on every seed, and walls it off while shut', () => {
  const bad: number[] = []
  for (let seed = 1; seed <= 120; seed++) {
    const plan = generateZone(ZONES.plains, seed, { tutorial: true, alt: true, openingPack: OPENING.pack })
    const g = fillGrid(createGrid(plan.w, plan.h), plan, true)
    const c = (p: { x: number; z: number }): [number, number] => [Math.floor(p.x / CELL), Math.floor(p.z / CELL)]
    const fin = plan.packs[plan.packs.length - 1]!
    const ok = reach(g, c(plan.start), c(fin))
    const gp = plan.gate
    if (!ok || !gp) bad.push(seed)
    const shut = fillGrid(createGrid(plan.w, plan.h), plan, false)
    if (reach(shut, c(plan.start), c(fin))) bad.push(-seed)
  }
  expect(bad).toEqual([])
})
