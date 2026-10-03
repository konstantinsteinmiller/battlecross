import { describe, expect, it } from 'vitest'
import { MAP, nodeOpen, type NodeId } from '@/game/data/zones'
import { MAP_H, MAP_W, type Pt } from '@/components/screens/map/geo'
import { ROADS, nodeAt } from '@/components/screens/map/roads'
import { GH, GW, ROAD, STEP, findPath, fogCells, nearestWalkable, stepWalk, walkMask } from '@/components/screens/map/walk'

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

  it('a tap on the water finds the nearest shore', () => {
    const shore = nearestWalkable(m, [60, 640])
    expect(shore).not.toBeNull()
    expect(m.ok(shore![0], shore![1])).toBe(true)
    expect(Math.hypot(shore![0] - 60, shore![1] - 640)).toBeLessThan(STEP * 9)
    expect(nearestWalkable(m, [MAP_W / 2, MAP_H - 5], 2)).toBeNull()
  })
})
