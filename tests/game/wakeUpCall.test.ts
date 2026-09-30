import { describe, expect, it } from 'vitest'
import { generateWakeUpCall, TUTORIAL_STEPS } from '@/game/world/stages/tutorial'
import { planWalkthrough } from '@/game/sim/walkthrough'
import { createNav, floorAt } from '@/game/world/nav'
import { cellCenter } from '@/game/world/levelGen'

// Mission 1 is a built stage: its lessons in a fixed order (charge, crate,
// block, the gap, the chest, the slide, a breather), the Repair Gel corridor
// out of the slide room, and a spiked one-cell gap that only an edge-leap
// crosses.
describe('Wake-Up Call (the built tutorial)', () => {
  const map = generateWakeUpCall(1)

  it('teaches its rooms in order, the slide right before the boss', () => {
    const plan = planWalkthrough(map)
    expect(plan.gates.map(g => g.steps)).toEqual(TUTORIAL_STEPS)
    expect(map.doors[plan.gates[plan.gates.length - 1]!.door]!.boss).toBe(true)
  })

  it('puts the Repair Gel corridor out of the slide room, before the breather', () => {
    const plan = planWalkthrough(map)
    expect(plan.gel).not.toBeNull()
    expect(plan.gates[plan.gel!.gate]!.steps).toContain('slide')
  })

  it('has a spiked one-cell gap with a leap link across it', () => {
    const t = map.terrain!
    const link = t.links!.find(l => l.kind === 'leap')!
    expect(link).toBeTruthy()
    const nav = createNav(map)
    const mid = [(link.from[0] + link.to[0]) / 2, link.from[1]] as const
    expect(floorAt(nav, cellCenter(mid[0]), cellCenter(mid[1]))).toBe(-Infinity)
    expect(floorAt(nav, cellCenter(link.from[0]), cellCenter(link.from[1]))).toBe(0)
    expect(floorAt(nav, cellCenter(link.to[0]), cellCenter(link.to[1]))).toBe(0)
    expect(t.pitKind![map.room[mid[1] * map.w + mid[0]]!]).toBe('spikes')
  })

  it('every room has spots for its cast, and the start pad is in the start room', () => {
    for (const r of map.rooms) expect(r.spots.length, `room ${r.id}`).toBeGreaterThan(4)
    const i = Math.floor(map.start.x / 3)
    const j = Math.floor(map.start.z / 3)
    expect(map.rooms[map.room[j * map.w + i]!]!.role).toBe('start')
  })
})
