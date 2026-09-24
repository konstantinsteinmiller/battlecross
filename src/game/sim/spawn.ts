import type { EnemyKind } from '../models/enemies'
import type { Element } from '../data/enemies'
import type { MapData, Room } from '../world/levelGen'
import { cellCenter, roomCenter } from '../world/levelGen'
import { mulberry32, weighted } from '../world/rng'
import { createEnemy } from './enemies'
import type { Enemy } from './world'
import type { Slice } from '../engine/slicer'

/**
 * Encounter placement: which machines stand in which room. Deterministic from
 * the map seed so a resumed mission rebuilds the same cast (the snapshot then
 * removes the ones already destroyed).
 */

export interface EncounterTable {
  kinds: Array<[EnemyKind, number]>
  element: Element
  /** Enemies per 9 floor cells, roughly. */
  density: number
  eliteChance: number
}

/** Async so the rig builds can be time-sliced (`opts.slice`): a dozen skinned
 *  machines is the second-heaviest part of a mission build. The RNG never
 *  sees the yields, so the order (which resume snapshots index) is stable. */
export const spawnEncounters = async (
  map: MapData, table: EncounterTable, level: number,
  opts: { firstRoomsGentle?: boolean; slice?: Slice; onProgress?: (f01: number) => void } = {}
): Promise<Enemy[]> => {
  const rng = mulberry32(map.seed ^ 0xe11e)
  const out: Enemy[] = []
  for (const room of map.rooms) {
    if (room.role === 'start' || room.role === 'boss') continue
    const area = room.w * room.h
    let n: number
    if (room.role === 'treasure') n = 1 + (rng() < 0.5 ? 1 : 0)
    else if (room.role === 'objective') n = Math.max(2, Math.round((area / 9) * table.density) + 1)
    else n = Math.max(1, Math.round((area / 9) * table.density))
    // Onboarding: the first room off the start is a single easy target.
    if (opts.firstRoomsGentle && room.depth === 1) n = 1
    n = Math.min(n, 6, room.spots.length)
    const [cx, cz] = roomCenter(room)
    let placed = 0
    let spotIdx = 0
    let wallIdx = 0
    while (placed < n && spotIdx < room.spots.length) {
      let kind = weighted(rng, table.kinds)
      if (opts.firstRoomsGentle && room.depth === 1) kind = 'hardhat'
      let x: number
      let z: number
      if (kind === 'turret') {
        const ws = room.wallSpots[wallIdx++]
        if (!ws) { kind = 'hardhat'; continue }
        x = cellCenter(ws[0])
        z = cellCenter(ws[1])
      } else {
        const sp = room.spots[spotIdx++]!
        x = cellCenter(sp[0]) + (rng() - 0.5) * 1.2
        z = cellCenter(sp[1]) + (rng() - 0.5) * 1.2
      }
      const elite = room.role !== 'treasure' && rng() < table.eliteChance
      const e = createEnemy(kind, level, x, z, room.id, { elite, element: table.element })
      e.yaw = Math.atan2(cx - x, cz - z) + (rng() - 0.5) * 0.8
      out.push(e)
      placed++
      await opts.slice?.()
    }
    opts.onProgress?.((room.id + 1) / map.rooms.length)
  }
  return out
}

export const roomOf = (map: MapData, x: number, z: number): Room | null => {
  const i = Math.floor(x / 3)
  const j = Math.floor(z / 3)
  const id = map.room[j * map.w + i]
  return id !== undefined && id >= 0 ? map.rooms[id]! : null
}
