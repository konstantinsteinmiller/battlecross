import { describe, expect, it } from 'vitest'
import { MAP, nodeOpen, type NodeId } from '@/game/data/zones'
import { MAP_H, MAP_W, type Pt } from '@/components/screens/map/geo'
import { ROADS, nodeAt } from '@/components/screens/map/roads'
import { GH, GW, ROAD, STEP, findPath, fogCells, nearestWalkable, stepWalk, walkMask } from '@/components/screens/map/walk'
import { TERRAIN_SHAPES } from '@/components/screens/map/terrain'

/**
 * Free walking on the world map (roadmap #67): the walk mask built from the
 * terrain. Every open place can be walked to; the sea, the lake, the mountain
 * wall and the fog over places not open yet cannot.
 */

const ALL = (): boolean => true
const after = (...cleared: string[]) => {
  const c = new Set(cleared)
  return (id: NodeId): boolean => nodeOpen(id, c, new Set(['arenaOpen', 'throneDone']))
}

describe('the walk mask', () => {
  const m = walkMask(ALL)

  it('every place stands on walkable ground, and a road runs out of it', () => {
    for (const n of MAP) {
      const [x, y] = nodeAt(n.id)
      expect(m.ok(x, y), n.id).toBe(true)
      expect(m.owner(x, y), n.id).toBe(n.id)
    }
    // The middle of every road is road (the bridges and the causeway too).
    for (const r of ROADS) {
      const p = r.line[Math.floor(r.line.length / 2)]!
      expect(m.road(p[0], p[1]), r.key).toBe(true)
    }
  })

  it('with everything open, every place can be walked to from Sunford', () => {
    const from = nodeAt('sunford')
    for (const n of MAP) {
      const path = findPath(m, from, nodeAt(n.id))
      expect(path, n.id).not.toBeNull()
      // Every leg of the way is on walkable ground.
      for (let i = 1; i < path!.length; i++) {
        const a = path![i - 1]!
        const b = path![i]!
        const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4))
        for (let s = 0; s <= steps; s++) expect(m.ok(a[0] + ((b[0] - a[0]) * s) / steps, a[1] + ((b[1] - a[1]) * s) / steps), `${n.id} leg ${i}`).toBe(true)
      }
    }
  })

  it('the sea, the lake and the mountain wall are not walked', () => {
    // Open sea in the lower right, the bay, the west coast.
    for (const p of [[1500, 820], [800, 850], [20, 400]] as Pt[]) expect(m.ok(p[0], p[1]), `${p}`).toBe(false)
    // The temple's lake, off its causeway.
    expect(m.ok(1250, 500)).toBe(false)
    // Deep in the Ironpeaks, away from the passes.
    expect(m.ok(150, 120)).toBe(false)
    // The paper's frame.
    expect(m.ok(10, 450)).toBe(false)
    expect(m.ok(MAP_W - 10, 450)).toBe(false)
  })

  it('a road is faster ground, and a long way prefers it', () => {
    let roads = 0
    for (const c of m.cells) if (c === ROAD) roads++
    expect(roads).toBeGreaterThan(200)
    const path = findPath(m, nodeAt('sunford'), nodeAt('woods'))!
    // Most of the way runs on the road.
    let on = 0
    let all = 0
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1]!
      const b = path[i]!
      const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4))
      for (let s = 0; s < steps; s++) { all++; if (m.road(a[0] + ((b[0] - a[0]) * s) / steps, a[1] + ((b[1] - a[1]) * s) / steps)) on++ }
    }
    expect(on / all).toBeGreaterThan(0.6)
  })
})

describe('the fog over places not open yet', () => {
  it('a new save after the first fight: the open land is walked, the rest is fogged', () => {
    const open = after('plains')
    const m = walkMask(open)
    const from = nodeAt('plains')
    for (const id of ['sunford', 'hollows', 'woods'] as NodeId[]) expect(findPath(m, from, nodeAt(id)), id).not.toBeNull()
    for (const id of ['crags', 'outskirts', 'oakhaven', 'mines', 'tundra', 'rift'] as NodeId[]) {
      const [x, y] = nodeAt(id)
      expect(m.ok(x, y), id).toBe(false)
      expect(findPath(m, from, [x, y]), id).toBeNull()
    }
    const fog = fogCells(open)
    let fogged = 0
    for (const c of fog) fogged += c
    expect(fogged).toBeGreaterThan(GW * GH * 0.3)
    // Nothing is fogged where the hero may walk.
    for (let k = 0; k < fog.length; k++) if (fog[k]) expect(m.cells[k]).toBe(0)
  })

  it('clearing a place lifts the fog off its neighbours', () => {
    const before = walkMask(after('plains'))
    const later = walkMask(after('plains', 'woods'))
    const [x, y] = nodeAt('crags')
    expect(before.ok(x, y)).toBe(false)
    expect(later.ok(x, y)).toBe(true)
  })
})

describe('stepping', () => {
  const m = walkMask(ALL)

  it('walks on open ground and slides along a coast instead of sticking', () => {
    const p = nodeAt('plains')
    expect(stepWalk(m, p, 5, 0)).toEqual([p[0] + 5, p[1]])
    // Into the sea west of Sunford: the westward part is refused, the rest is kept.
    let q: Pt = nodeAt('sunford')
    for (let i = 0; i < 200; i++) q = stepWalk(m, q, -4, -1)
    expect(m.ok(q[0], q[1])).toBe(true)
    expect(q[0]).toBeGreaterThan(30)
  })

  it('a tapped way is walked to its end: the path and the step agree on the ground (#111)', () => {
    const from = nodeAt('sunford')
    for (const n of MAP) {
      const path = findPath(m, from, nodeAt(n.id))!
      let p: Pt = from
      let leg = 1
      let stalls = 0
      for (let t = 0; t < 4000 && leg < path.length; t++) {
        const w = path[leg]!
        const d = Math.hypot(w[0] - p[0], w[1] - p[1])
        if (d < 4) { leg++; continue }
        const sp = Math.min(4, d)
        const q = stepWalk(m, p, ((w[0] - p[0]) / d) * sp, ((w[1] - p[1]) / d) * sp)
        if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.5) stalls++
        p = q
      }
      expect(leg, `${n.id}: stopped at leg ${leg} of ${path.length}`).toBe(path.length)
      expect(stalls, n.id).toBe(0)
    }
  })

  it('pushing slantwise into a river slides along its bank instead of sticking (#111)', () => {
    // The step before #111: the whole step, else one axis, probes on each axis.
    const before = (p: Pt, dx: number, dy: number): Pt => {
      const fits = (x: number, y: number): boolean => m.ok(x, y) && m.ok(x + Math.sign(dx) * 3, y) && m.ok(x, y + Math.sign(dy) * 3)
      if (fits(p[0] + dx, p[1] + dy)) return [p[0] + dx, p[1] + dy]
      if (dx && fits(p[0] + dx, p[1])) return [p[0] + dx, p[1]]
      if (dy && fits(p[0], p[1] + dy)) return [p[0], p[1] + dy]
      return p
    }
    let tried = 0
    let moving = 0
    let movingBefore = 0
    for (const r of TERRAIN_SHAPES.rivers) {
      for (let i = 1; i < r.line.length - 1; i++) {
        const [ax, ay] = r.line[i - 1]!
        const [bx, by] = r.line[i + 1]!
        const len = Math.hypot(bx - ax, by - ay)
        if (len < 1) continue
        const tx = (bx - ax) / len
        const ty = (by - ay) / len
        for (const side of [1, -1]) {
          // Stand on the bank, then push 45° into the water for 30 steps.
          const nx = -ty * side
          const ny = tx * side
          const start: Pt = [r.line[i]![0] + nx * (r.w / 2 + 14), r.line[i]![1] + ny * (r.w / 2 + 14)]
          if (!m.ok(start[0], start[1]) || m.road(start[0], start[1])) continue
          const dx = (tx - nx) * Math.SQRT1_2 * 3
          const dy = (ty - ny) * Math.SQRT1_2 * 3
          let p: Pt = start
          let q: Pt = start
          let went = 0
          let wentBefore = 0
          for (let k = 0; k < 30; k++) {
            const p2 = stepWalk(m, p, dx, dy)
            went += Math.hypot(p2[0] - p[0], p2[1] - p[1])
            p = p2
            const q2 = before(q, dx, dy)
            wentBefore += Math.hypot(q2[0] - q[0], q2[1] - q[1])
            q = q2
          }
          expect(m.ok(p[0], p[1])).toBe(true)
          tried++
          // Still moving: at least 60 % of what sliding at the bank's slant covers.
          if (went > 30 * 2.12 * 0.6) moving++
          if (wentBefore > 30 * 2.12 * 0.6) movingBefore++
        }
      }
    }
    expect(tried).toBeGreaterThan(200)
    // Measured: 204 of 268 bank points keep moving (71 with the old step).
    expect(moving / tried).toBeGreaterThan(0.7)
    expect(moving).toBeGreaterThan(movingBefore * 2)
  })

  it('a bridge is three cells wide; a place does not make its river walkable (#111)', () => {
    for (const r of TERRAIN_SHAPES.rivers) {
      for (const pt of r.line) {
        const k = Math.floor(pt[1] / STEP) * GW + Math.floor(pt[0] / STEP)
        if (!m.cells[k] || m.cells[k] === ROAD) continue
        throw new Error(`river cell at ${pt} is walkable land`)
      }
    }
  })

  it('a tap on the water finds the nearest shore', () => {
    const shore = nearestWalkable(m, [60, 640])
    expect(shore).not.toBeNull()
    expect(m.ok(shore![0], shore![1])).toBe(true)
    expect(Math.hypot(shore![0] - 60, shore![1] - 640)).toBeLessThan(STEP * 9)
    expect(nearestWalkable(m, [MAP_W / 2, MAP_H - 5], 2)).toBeNull()
  })
})
