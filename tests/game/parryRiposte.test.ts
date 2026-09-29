// A parry (a block pressed just as the hit lands) stuns the machine — and
// drops the shield for a short counter window, so the stunned machine can be
// shot at once. In a playtest the shield stayed up while the right button was
// still held after the parry, and the buster (which never fires while
// blocking) did nothing: the stunned drone could not be punished. Driven
// through the mission's own player step and `hitPlayer`, with the input edges
// consumed after each step the way `Mission.update` does.

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/game/audio/sfx', () => ({ sfx: () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { setMode: () => {}, setWanted: () => {} } }))

import { Mission, type MissionSetup } from '@/game/sim/mission'
import { baseStats } from '@/game/sim/stats'
import { createInput, consumeEdges, type Input } from '@/game/engine/input'
import { createNav } from '@/game/world/nav'
import { CELL, type MapData } from '@/game/world/levelGen'
import { SECTORS } from '@/game/data/regions'
import { hud } from '@/game/state/hud'
import type { Enemy } from '@/game/sim/world'

const STEP = 1 / 60
const W = 24

const rig = () => {
  const sector = SECTORS[0]!
  const setup: MissionSetup = {
    sector: sector.id, seed: 1, rooms: 1, boss: false, enemyLevel: 1, encounters: sector.encounters, stats: baseStats()
  }
  const input = createInput()
  const m = new (Mission as unknown as new (s: MissionSetup, i: Input) => Mission)(setup, input)
  const map = { w: W, h: W, cell: new Uint8Array(W * W).fill(1), pillars: [], room: new Int16Array(W * W), rooms: [] } as unknown as MapData
  const mid = (W / 2) * CELL
  m.map = map
  m.nav = createNav(map)
  m.player = {
    x: mid, z: mid, px: mid, pz: mid, vx: 0, vz: 0, yaw: 0, pitch: 0, path: null, bob: 0, bobAmp: 0,
    y: 0, py: 0, vy: 0, ground: true, ladder: -1, plat: -1, air: 0, safeY: 0, mantle: 0, mx: 0, mz: 0
  }
  m.fx = { emit: () => {}, sparks: () => {} } as unknown as Mission['fx']
  ;(m as unknown as { vm: unknown }).vm = { barrier: { impact: () => {} } }
  const fired = vi.fn()
  ;(m as unknown as { firePellet: () => void }).firePellet = fired
  ;(m as unknown as { activePellets: () => number }).activePellets = () => 0
  hud.phase = 'play'
  const step = () => {
    ;(m as unknown as { updatePlayer(dt: number, first: boolean): void }).updatePlayer(STEP, true)
    consumeEdges(input)
    // The mission clock (the parry window reads it) runs in `update`.
    m.time += STEP
    m.player.x = m.player.z = mid
  }
  // A drone diving in from straight ahead (yaw 0 faces −z).
  const drone = { x: mid, z: mid - 1, state: 'act', st: 0, stunT: 0, ring: { visible: true }, flash: 0 } as unknown as Enemy
  const dive = () => m.hitPlayer(drone, 10, { blockable: true, fromX: drone.x, fromZ: drone.z, kind: 'melee' })
  return { m, input, step, fired, dive, drone }
}

describe('parry → counter', () => {
  it('after a parry the shield drops and the buster fires with block still held', () => {
    const { m, input, step, fired, dive, drone } = rig()
    input.blockHeld = true
    input.blockPressed = true
    step()
    expect(m.combat.blocking).toBe(true)
    expect(dive()).toBe('parry')
    expect(drone.state).toBe('stun')
    step()
    expect(m.combat.blocking).toBe(false)
    // Block still held, fire pressed: a shot.
    input.firePressed = true
    input.fireHeld = true
    step()
    expect(fired).toHaveBeenCalledTimes(1)
  })

  it('the shield comes back up by itself after the window, block still held', () => {
    const { m, input, step, dive } = rig()
    input.blockHeld = true
    input.blockPressed = true
    step()
    dive()
    for (let i = 0; i < Math.round(1.3 / STEP); i++) step()
    expect(m.combat.blocking).toBe(true)
  })

  it('a fresh block press raises it at once', () => {
    const { m, input, step, dive } = rig()
    input.blockHeld = true
    input.blockPressed = true
    step()
    dive()
    step()
    expect(m.combat.blocking).toBe(false)
    input.blockPressed = true
    step()
    expect(m.combat.blocking).toBe(true)
  })

  it('a plain block (late press) keeps the shield up', () => {
    const { m, input, step, dive } = rig()
    input.blockHeld = true
    input.blockPressed = true
    step()
    for (let i = 0; i < 30; i++) step()
    expect(dive()).toBe('block')
    step()
    expect(m.combat.blocking).toBe(true)
  })
})
