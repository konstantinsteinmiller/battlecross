// @vitest-environment jsdom
// ─── The lock-on and line of sight ───────────────────────────────────────────
//
// A lock-on target that goes out of sight keeps the lock for a grace
// (`LOCK_GRACE`), so a machine passing behind a pillar is still the target
// when it comes out. A playtester saw the frame and bracket stay fully locked
// on a drone behind a wall, so while the grace holds it the mission flags it
// (`Mission.targetHidden`, mirrored to `hud.targetHidden`): the HUD dims the
// frame and bracket, and the soft lock stops turning the camera toward it.
// Driven through the mission's own targeting step at the app's fixed 60 Hz.

import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/game/audio/sfx', () => ({ sfx: () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { setMode: () => {}, setWanted: () => {} } }))
vi.mock('@/game/engine/renderer', async (orig) => ({
  ...(await orig<object>()),
  getRenderer: () => ({ clear: () => {}, render: () => {}, clearDepth: () => {}, domElement: { clientWidth: 1 } })
}))

import { Object3D } from 'three'
import { Mission, LOCK_GRACE, type MissionSetup } from '@/game/sim/mission'
import { baseStats } from '@/game/sim/stats'
import { createInput, type Input } from '@/game/engine/input'
import { createNav } from '@/game/world/nav'
import { CELL, cellCenter, type MapData } from '@/game/world/levelGen'
import { SECTORS } from '@/game/data/regions'
import { hud } from '@/game/state/hud'
import type { Enemy } from '@/game/sim/world'

/** The app's fixed logic step (`engine/app.ts`). */
const STEP = 1 / 60
const W = 24
/** Flux stands in the middle of cell (12, 12), looking down −z (yaw 0). */
const P = cellCenter(12)
/** A wall across row 10, right of Flux's line down −z: x 39..48, z 30..33. */
const WALL = { j: 10, i0: 13, i1: 15 }
/** Down-range and to the right: straight behind the wall. */
const BEHIND_WALL = { x: P + 6, z: P - 10 }
/** The mirror spot on the left: in plain sight. */
const IN_SIGHT = { x: P - 6, z: P - 10 }

type Rig = {
  m: Mission
  step: () => void
  /** Step for `s` seconds. */
  run: (s: number) => void
  writeHud: () => void
}

/** A mission with only what targeting, the HUD mirror and the view read: an
 *  open floor with `WALL` across it, or with `pillars` instead. */
const rig = (pillars?: MapData['pillars']): Rig => {
  const sector = SECTORS[0]!
  const setup: MissionSetup = {
    sector: sector.id, seed: 1, rooms: 1, boss: false, enemyLevel: 1, encounters: sector.encounters, stats: baseStats()
  }
  const input: Input = createInput()
  const m = new (Mission as unknown as new (s: MissionSetup, i: Input) => Mission)(setup, input)
  const cell = new Uint8Array(W * W).fill(1)
  if (!pillars) for (let i = WALL.i0; i <= WALL.i1; i++) cell[WALL.j * W + i] = 0
  const map = {
    w: W, h: W, cell, pillars: pillars ?? [], room: new Int16Array(W * W), rooms: [], start: { x: P, z: P }
  } as unknown as MapData
  m.map = map
  m.nav = createNav(map)
  m.player = {
    x: P, z: P, px: P, pz: P, vx: 0, vz: 0, yaw: 0, pitch: 0, path: null, bob: 0, bobAmp: 0,
    y: 0, py: 0, vy: 0, ground: true, ladder: -1, plat: -1, air: 0, safeY: 0, mantle: 0, mx: 0, mz: 0
  }
  m.system = { vacuum: () => {}, sync: () => {} } as unknown as Mission['system']
  // The HUD mirror's other readers.
  m.lessons = { view: () => null } as unknown as Mission['lessons']
  m.objects = {
    objective: { template: 'kill', progress: 0, count: 1, done: false },
    compassTargets: () => []
  } as unknown as Mission['objects']
  m.weapons = { cost: () => 0, cooldown: [0, 0, 0], guardT: 0 } as unknown as Mission['weapons']
  m.borrowed = { writeHud: () => {} } as unknown as Mission['borrowed']
  // The view: the sky dome follows the camera; no arm cannon.
  m.level = { sky: new Object3D() } as unknown as Mission['level']
  ;(m as unknown as { syncViewmodel(dt: number): void }).syncViewmodel = () => {}
  const inner = m as unknown as { updateTargeting(dt: number): void; writeHud(): void }
  const step = () => inner.updateTargeting(STEP)
  const run = (s: number) => { for (let k = Math.round(s / STEP); k > 0; k--) step() }
  return { m, step, run, writeHud: () => inner.writeHud() }
}

/** An awake machine (a rotor drone) at (x, z). */
const machine = (at: { x: number; z: number }): Enemy => ({
  x: at.x, z: at.z, y: 0, state: 'engage', awake: true, offstage: false, dormant: false, elite: false,
  nameKey: 'enemy.heli', level: 1, hp: 28, maxHp: 28, def: { aimY: 0.4, hitR: 0.6 }, root: { visible: false }
}) as unknown as Enemy

const put = (e: Enemy, at: { x: number; z: number }) => { e.x = at.x; e.z = at.z }

afterEach(() => {
  hud.phase = 'boot'
  hud.combat = false
  hud.targetName = ''
  hud.targetHidden = false
})

describe('the lock-on target out of sight', () => {
  it('is flagged the step sight is lost, through the grace, and cleared the step it is seen again', () => {
    const { m, step, run, writeHud } = rig()
    const drone = machine(IN_SIGHT)
    m.enemies = [drone]
    step()
    expect(m.combat.target).toBe(drone)
    expect(m.targetHidden).toBe(false)

    // Behind the wall: still the target (the grace), but flagged at once.
    put(drone, BEHIND_WALL)
    step()
    expect(m.combat.target).toBe(drone)
    expect(m.targetHidden).toBe(true)
    writeHud()
    expect(hud.targetName).toBe('enemy.heli')
    expect(hud.targetHidden).toBe(true)
    run(LOCK_GRACE - 0.1)
    expect(m.combat.target).toBe(drone)
    expect(m.targetHidden).toBe(true)

    // Out again: the same lock, whole again on the very next step.
    put(drone, IN_SIGHT)
    step()
    expect(m.combat.target).toBe(drone)
    expect(m.targetHidden).toBe(false)
    writeHud()
    expect(hud.targetHidden).toBe(false)
  })

  it('lets the lock go once the grace runs out, and nothing is left flagged', () => {
    const { m, step, run, writeHud } = rig()
    const drone = machine(IN_SIGHT)
    m.enemies = [drone]
    step()
    put(drone, BEHIND_WALL)
    run(LOCK_GRACE + 0.1)
    expect(m.combat.target).toBeNull()
    expect(m.targetHidden).toBe(false)
    writeHud()
    expect(hud.targetName).toBe('')
    expect(hud.targetHidden).toBe(false)
  })

  it('hands the lock to a machine in sight once the grace runs out', () => {
    const { m, step, run } = rig()
    const drone = machine(IN_SIGHT)
    // Well off to the left: the drone is the better lock while both are seen.
    const other = machine({ x: P - 8, z: P + 1 })
    m.enemies = [drone, other]
    step()
    expect(m.combat.target).toBe(drone)
    put(drone, BEHIND_WALL)
    run(LOCK_GRACE - 0.1)
    expect(m.combat.target).toBe(drone)
    run(0.2)
    expect(m.combat.target).toBe(other)
    expect(m.targetHidden).toBe(false)
  })
})

describe('the grace (why it stays at LOCK_GRACE)', () => {
  it('is 1.2 s', () => {
    expect(LOCK_GRACE).toBe(1.2)
  })

  it('keeps the lock on a drone orbiting behind a pillar, though another machine is in sight', () => {
    // No wall: a pillar 3 m ahead, and a rotor drone on its orbit (6.25 m out, about
    // 0.44 rad/s: it lags its 0.6 rad/s orbit point at 0.8 × its speed)
    // sweeping behind it from right to left.
    const R = 6.25
    const RATE = 0.44
    const { m, step } = rig([{ x: P, z: P - 3, r: 0.62 }])
    const at = (a: number) => ({ x: P + Math.sin(a) * R, z: P - Math.cos(a) * R })
    const drone = machine(at(0.5))
    const other = machine({ x: P - 8, z: P + 1 })
    m.enemies = [drone, other]
    step()
    expect(m.combat.target).toBe(drone)
    let hidden = 0
    for (let a = 0.5; a > -0.5; a -= RATE * STEP) {
      put(drone, at(a))
      step()
      expect(m.combat.target).toBe(drone)
      if (m.targetHidden) hidden += STEP
    }
    // Behind the pillar for longer than a 0.6 s grace would have held it.
    expect(hidden).toBeGreaterThan(0.6)
    expect(hidden).toBeLessThan(LOCK_GRACE)
    expect(m.targetHidden).toBe(false)
  })
})

describe('the soft lock-on camera', () => {
  /** Render `n` frames and return how far the view turned (yaw, pitch). */
  const frames = (m: Mission, n: number) => {
    const y0 = m.player.yaw
    const p0 = m.player.pitch
    for (let k = 0; k < n; k++) m.render(1, STEP)
    return { yaw: m.player.yaw - y0, pitch: m.player.pitch - p0 }
  }

  it('turns the view toward a target in sight', () => {
    const { m, step } = rig()
    hud.phase = 'play'
    const drone = machine(IN_SIGHT)
    m.enemies = [drone]
    step()
    expect(hud.combat).toBe(true)
    // In sight on the left (+yaw): the view eases that way.
    expect(frames(m, 10).yaw).toBeGreaterThan(0.1)
  })

  it('does not swing toward a target behind a wall during the grace, and resumes once it is seen', () => {
    const { m, step } = rig()
    hud.phase = 'play'
    const drone = machine(IN_SIGHT)
    m.enemies = [drone]
    step()
    put(drone, BEHIND_WALL)
    step()
    expect(m.combat.target).toBe(drone)
    expect(m.targetHidden).toBe(true)
    const held = frames(m, 30)
    expect(held.yaw).toBe(0)
    expect(held.pitch).toBe(0)
    // Out from behind the wall, on Flux's side of it to the right (−yaw):
    // the pull is back.
    put(drone, { x: P + 6, z: P - 2 })
    step()
    expect(m.targetHidden).toBe(false)
    expect(frames(m, 10).yaw).toBeLessThan(-0.1)
  })
})
