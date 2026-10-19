// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Scene } from 'three'
import { layoutOrbs, newOrbs, newRingState, NO_STATUSES, ORB_POOL, ORB_RINGS, stackChange, StackOrbs, type OrbFrame } from '@/game/gfx/stackOrbs'
import { CHI_MAX } from '@/game/sim/heroSkills'
import type { Status } from '@/game/sim/types'
import { stubCanvas } from './zfightTools'

const st = (id: string, n: number, t = 5): Status => ({ id, t, dur: 8, v: 1, n, src: 0 } as unknown as Status)
const frame = (dt = 1 / 60): OrbFrame => ({ r: 0.5, h: 1.6, dt, time: 1, calm: false })
const rings = () => ORB_RINGS.map(newRingState)

describe('stack orbs', () => {
  it('rings only the stacks a hero skill builds, chi sized to the monk', () => {
    expect(ORB_RINGS.map(r => r.id)).toEqual(['chi', 'accelerate'])
    expect(ORB_RINGS[0]!.max).toBe(CHI_MAX)
    expect(ORB_POOL).toBe((CHI_MAX + 10) * 2)
  })

  it('one orb per stack, each kind on its own ring', () => {
    const out = newOrbs()
    const n = layoutOrbs([st('chi', 3), st('accelerate', 4), st('poison', 5), st('haste', 1)], rings(), frame(), out)
    expect(n).toBe(7)
    const chi = out.slice(0, 3)
    const acc = out.slice(3, 7)
    expect(chi.every(o => o.ring === 0)).toBe(true)
    expect(acc.every(o => o.ring === 1)).toBe(true)
    const rad = (o: { x: number; z: number }) => Math.hypot(o.x, o.z)
    expect(rad(acc[0]!)).toBeGreaterThan(rad(chi[0]!) + 0.1)
    expect(acc[0]!.y).toBeGreaterThan(chi[0]!.y + 0.1)
  })

  it('nothing stacked draws nothing', () => {
    expect(layoutOrbs(NO_STATUSES, rings(), frame(), newOrbs())).toBe(0)
  })

  it('reads spend vs run-out vs add', () => {
    expect(stackChange(2, 3, 5)).toBe('add')
    expect(stackChange(5, 0, 6)).toBe('spend')
    expect(stackChange(3, 0, 0.01)).toBe('expire')
    expect(stackChange(3, 3, 5)).toBe('none')
  })

  it('a spent ring collapses into the body, then is gone', () => {
    const r = rings()
    const out = newOrbs()
    layoutOrbs([st('chi', 5)], r, frame(), out)
    const before = Math.hypot(out[0]!.x, out[0]!.z)
    expect(layoutOrbs(NO_STATUSES, r, frame(0.1), out)).toBe(5)
    expect(Math.hypot(out[0]!.x, out[0]!.z)).toBeLessThan(before)
    expect(layoutOrbs(NO_STATUSES, r, frame(0.3), out)).toBe(0)
  })

  it('spins faster as the ring fills; a full ring pulses', () => {
    const a = rings(); const b = rings()
    layoutOrbs([st('chi', 1)], a, frame(0.1), newOrbs())
    layoutOrbs([st('chi', 5)], b, frame(0.1), newOrbs())
    expect(b[0]!.phase).toBeGreaterThan(a[0]!.phase)
    const lo = newOrbs(); const hi = newOrbs()
    const r1 = rings(); layoutOrbs([st('chi', 5)], r1, { ...frame(1), time: 0 }, lo)
    const r2 = rings(); layoutOrbs([st('chi', 5)], r2, { ...frame(1), time: Math.PI / 14 }, hi)
    expect(hi[0]!.s).toBeGreaterThan(lo[0]!.s)
  })

  it('the view is one instanced mesh, hidden when empty, reusing its buffers', () => {
    stubCanvas()
    const scene = new Scene()
    const cam = new PerspectiveCamera()
    const orbs = new StackOrbs(scene)
    expect(scene.children.filter(c => c === orbs.mesh)).toHaveLength(1)
    expect(orbs.mesh.visible).toBe(false)
    const buf = orbs.mesh.instanceMatrix.array
    const col = orbs.mesh.instanceColor!.array
    const list = [st('chi', 5), st('accelerate', 10)]
    for (let i = 0; i < 60; i++) orbs.update(list, 1, 2, 0.5, 1.6, 1 / 60, i / 60, cam)
    expect(orbs.mesh.count).toBe(15)
    expect(orbs.mesh.visible).toBe(true)
    expect(orbs.mesh.instanceMatrix.array).toBe(buf)
    expect(orbs.mesh.instanceColor!.array).toBe(col)
    for (let i = 0; i < 30; i++) orbs.update(NO_STATUSES, 1, 2, 0.5, 1.6, 1 / 60, 1 + i / 60, cam)
    expect(orbs.mesh.count).toBe(0)
    expect(orbs.mesh.visible).toBe(false)
    orbs.dispose()
    expect(scene.children).not.toContain(orbs.mesh)
  })
})
