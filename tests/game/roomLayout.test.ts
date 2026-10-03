// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { buildHouse, roomPropsOf } from '@/game/gfx/houses'
import { newKit } from '@/game/gfx/archKit'
import { CLASS_IDS } from '@/game/data/skills'
import { generateTown } from '@/game/sim/zoneGen'
import { CELL } from '@/game/sim/grid'
import { TOWNS, type TownId } from '@/game/data/zones'
import { RoomLayout } from '@/game/gfx/roomLayout'

/**
 * Rooms arranged the way people arrange them (roadmap #68): no piece in
 * another or through a wall, nothing in a doorway, before a window (above the
 * sill), on somebody's place or at the stair's foot, nothing hung over a
 * window or behind a wardrobe; from the door one walks to everybody's place,
 * to the stair and to each bed's open side. A house with a floor above has a
 * stair up to it; a bed has its head to a wall; the hearth is on the back
 * wall with the chimney over it.
 */

const towns: Array<[TownId, string[]]> = [['sunford', []], ['oakhaven', []], ['oakhaven', ['oakhavenFallen']], ['ironhold', []]]

describe('room layouts', () => {
  it('every room of every town, whole and fallen: nothing in the way of anything', () => {
    const bad: string[] = []
    for (const [town, flags] of towns) {
      for (const seed of [7, 3]) {
        const plan = generateTown(TOWNS[town], new Set(flags), seed)
        const t = plan.town!
        for (const [hi, h] of t.houses.entries()) {
          if (!h.inside) continue
          const owner = t.people.find(p => p.npc && p.npc === h.owner)
          const x = (h.i0 + h.cw / 2) * CELL
          const z = (h.j0 + h.cd / 2) * CELL
          const o = buildHouse(newKit(), h, { style: t.style, ruined: t.ruined, low: false, x, y: 0, z, job: owner?.job, cls: h.cls, inRoom: roomPropsOf(t, hi) })
          const lay = o.layout!
          const name = `${town}${flags.length ? ' (fallen)' : ''}#${seed} ${h.kind} ${hi}`
          for (const p of lay.problems()) bad.push(`${name}: ${p}`)
          if (h.storeys === 2 && !t.ruined && !lay.pieces.some(p => p.label === 'the stair')) bad.push(`${name}: a floor above, and no stair up to it`)
        }
      }
    }
    expect(bad).toEqual([])
  })

  it('every kind of room, the work wall on either side: nothing in the way, beds and hearths against walls', () => {
    const rooms: Array<[string, string, number, number, string | undefined, string | undefined]> = [
      ['home', 'cottage', 4, 4, undefined, undefined], ['home (town house)', 'townhouse', 5, 4, undefined, undefined],
      ['taproom', 'tavern', 7, 5, undefined, undefined], ['taproom (shallow)', 'tavern', 7, 4, undefined, undefined],
      ['healer', 'chapel', 5, 5, 'healer', undefined], ['shop', 'townhouse', 5, 4, 'merchant', undefined],
      ...CLASS_IDS.map(cls => [`school ${cls}`, 'hall', 7, 5, undefined, cls] as [string, string, number, number, undefined, string])
    ]
    const bad: string[] = []
    for (const [label, kind, cw, cd, job, cls] of rooms) {
      for (const ruined of [false, true]) {
        // The door where the town puts it: the middle cell (or, in an even house, one left of it):
        // the work wall comes out on either side.
        const even = cw % 2 === 0 ? cw : cw - 1
        for (const [w, storeys, left] of [[cw, 1, 0], [even, 2, 1]] as const) {
          const h = { kind, i0: 0, j0: 0, cw: w, cd, doorI: Math.floor(w / 2) - left, inside: true, owner: '', owners: [], sign: '', cls, storeys, setback: false, seed: 300, yard: null, row: 0 } as never
          const o = buildHouse(newKit(), h, { style: 'mercantile', ruined, low: false, x: 0, y: 0, z: 0, job: job as never, cls: cls as never })
          const lay: RoomLayout = o.layout!
          const name = `${label} ${w}x${cd}${storeys === 2 ? ' 2st' : ''}${ruined ? ' ruined' : ''}`
          for (const p of lay.problems()) bad.push(`${name}: ${p}`)
          // What each room must have found room for.
          const need = label.startsWith('home') ? ['the bed', 'the hearth', 'a table with its chairs'] : label.startsWith('taproom') ? ['the hearth', 'the bar'] : label === 'healer' ? ['a cot', 'her worktable'] : label === 'shop' ? ['the counter'] : ['the bookcase']
          if (storeys === 2 && !ruined) need.push('the stair')
          for (const n of need) if (!lay.pieces.some(p => p.label === n)) bad.push(`${name}: no room found for ${n}`)
          if (label === 'healer' && lay.pieces.filter(p => p.label === 'a cot').length < 2) bad.push(`${name}: one cot only`)
          for (const p of lay.pieces) {
            if (p.label === 'the bed' && p.rect.z0 - lay.room.z0 > 0.05 && p.rect.x0 - lay.room.x0 > 0.05 && lay.room.x1 - p.rect.x1 > 0.05) bad.push(`${name}: the bed is not against a wall`)
            if (p.label === 'the hearth' && p.rect.z0 - lay.room.z0 > 0.05 && lay.room.z1 - p.rect.z1 > 0.05 && p.rect.x0 - lay.room.x0 > 0.05 && lay.room.x1 - p.rect.x1 > 0.05) bad.push(`${name}: the hearth is off the walls`)
          }
        }
      }
    }
    expect(bad).toEqual([])
  })

  it('the layout itself: a piece is refused where it would block the way, and placed where it would not', () => {
    const lay = new RoomLayout({ x0: 0, z0: 0, x1: 4, z1: 4 }, { x: 2, z: 4 })
    lay.target('the corner', 0.4, 0.4)
    // A wall across the room from side to side would cut the corner off.
    expect(lay.free({ x0: 0, z0: 1.5, x1: 4, z1: 1.9 }, 1)).toBe(false)
    // Against the back wall, out of the corner, it stands.
    const s = lay.onWall('back', 1.2, 0.6, 2, 0.6)
    expect(s).not.toBeNull()
    lay.add('a wardrobe', s!, 2)
    expect(lay.problems()).toEqual([])
    // Nothing may stand in the doorway.
    lay.zone('the doorway', { x0: 1.4, z0: 3, x1: 2.6, z1: 4 })
    expect(lay.free({ x0: 1.8, z0: 3.2, x1: 2.2, z1: 3.6 }, 0.5)).toBe(false)
  })
})
