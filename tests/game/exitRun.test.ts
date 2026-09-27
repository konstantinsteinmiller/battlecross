// The exit cutscene (src/game/sim/exitRun.ts, wired in sim/mission.ts): the
// lab's drone flies in, Flux walks to it and hops on, it lifts off under the
// LEVEL CLEARED banner, and the mission finishes BANNER_HOLD.cleared later —
// once. A press after the first moments skips straight to the lift-off; the
// press that asked for the exit never does. The planner puts the drone where
// it fits (never in a wall, in rooms, corridors and the climb's shafts) and
// falls back to straight down over Flux when nothing does. Stepped at the
// app's fixed 60 Hz without a GPU.

import { afterEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({ finishes: [] as Array<{ success: boolean }>, sounds: [] as string[], snaps: 0 }))

vi.mock('@/game/audio/sfx', () => ({ sfx: (id: string) => { h.sounds.push(id) } }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { setMode: () => {}, setWanted: () => {} } }))
vi.mock('@/game/flow', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/game/flow')>()),
  finishMission: async (success: boolean) => { h.finishes.push({ success }) }
}))
vi.mock('@/game/state/profile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/game/state/profile')>()),
  writeSnapshot: () => { h.snaps++ }
}))

import { Mission, type MissionSetup } from '@/game/sim/mission'
import {
  ExitRun, planExit, newExitPose, EXIT_SKIP_AFTER, EXIT_APPROACH, DRONE_HOVER, type ExitEvent, type ExitPlan
} from '@/game/sim/exitRun'
import { cineWorld, solidAt, type CineWorld } from '@/game/sim/cineCam'
import { BANNER_HOLD, banner } from '@/game/state/banner'
import { hud } from '@/game/state/hud'
import { createInput, consumeEdges, type Input } from '@/game/engine/input'
import { createNav, groundAt } from '@/game/world/nav'
import { CELL, generateMap, type MapData } from '@/game/world/levelGen'
import { generateClimb } from '@/game/world/climbGen'
import { SECTORS } from '@/game/data/regions'
import { baseStats } from '@/game/sim/stats'
import { DRONE_BELOW, DRONE_DECK_Y, DRONE_ROTORS, DRONE_DUCT_R, DRONE_RIM_R } from '@/game/models/exitDrone'

/** The app's fixed logic step (`engine/app.ts`). */
const STEP = 1 / 60

/** An open W×H floor with its border walled; `walls` adds void cells. */
const grid = (W: number, H: number, walls: Array<[number, number]> = []): MapData => {
  const cell = new Uint8Array(W * H).fill(1)
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) if (i === 0 || j === 0 || i === W - 1 || j === H - 1) cell[j * W + i] = 0
  }
  for (const [i, j] of walls) cell[j * W + i] = 0
  return { w: W, h: H, cell, pillars: [], room: new Int16Array(W * H), rooms: [], doors: [] } as unknown as MapData
}
const c = (i: number): number => (i + 0.5) * CELL

/** The drone, waiting at the plan's spot, touches nothing. */
const droneClear = (w: CineWorld, P: ExitPlan): boolean => {
  if (solidAt(w, P.sx, P.hoverY - 0.12, P.sz, DRONE_RIM_R, 0.1)) return false
  const cy = Math.cos(P.droneYaw)
  const sy = Math.sin(P.droneYaw)
  return DRONE_ROTORS.every(([x, z]) => !solidAt(w, P.sx + x * cy + z * sy, P.hoverY + 0.06, P.sz - x * sy + z * cy, DRONE_DUCT_R))
}

class Recorder {
  events: Array<[ExitEvent, number]> = []
  run: ExitRun
  constructor() {
    this.run = new ExitRun({ exitEvent: (e) => { this.events.push([e, this.run.time]) } })
  }
  names(): ExitEvent[] {
    return this.events.map(e => e[0])
  }
  /** Step `s` seconds, pressing on the steps `press` says. */
  steps(s: number, press: (t: number) => boolean = () => false): void {
    for (let n = Math.round(s / STEP); n > 0; n--) this.run.update(STEP, press(this.run.time))
  }
}

const openPlan = (): ExitPlan => {
  const w = cineWorld(createNav(grid(12, 12)))
  return planExit(w, c(6), 0, c(6), 0.4, true)
}

afterEach(() => {
  h.finishes.length = 0
  h.sounds.length = 0
  h.snaps = 0
})

describe('the exit timeline', () => {
  it('runs approach → walk → hop → land → lift → finish, in order, finishing once after the banner hold', () => {
    const r = new Recorder()
    const P = openPlan()
    expect(P.overhead).toBe(false)
    expect(r.run.start(P)).toBe(true)
    const stages: string[] = []
    for (let n = 0; n < Math.round((P.tEnd + 3) / STEP); n++) {
      r.run.update(STEP, false)
      if (stages[stages.length - 1] !== r.run.stage) stages.push(r.run.stage)
    }
    expect(r.names()).toEqual(['approach', 'walk', 'hop', 'land', 'lift', 'finish'])
    expect(stages).toEqual(['approach', 'walk', 'hop', 'settle', 'lift'])
    const at = Object.fromEntries(r.events.map(([e, t]) => [e, t]))
    // Five seconds or so of film before the banner, then the banner's hold.
    expect(at.lift).toBeGreaterThan(4.5)
    expect(at.lift).toBeLessThan(7)
    expect(at.finish! - at.lift!).toBeGreaterThanOrEqual(BANNER_HOLD.cleared - 1e-9)
    expect(at.finish! - at.lift!).toBeLessThan(BANNER_HOLD.cleared + STEP + 1e-9)
    expect(r.events.filter(e => e[0] === 'finish').length).toBe(1)
  })

  it('cannot be started twice', () => {
    const r = new Recorder()
    const P = openPlan()
    r.run.start(P)
    r.steps(1)
    expect(r.run.start(openPlan())).toBe(false)
    expect(r.run.plan).toBe(P)
    expect(r.names()).toEqual(['approach'])
  })

  it('a press in the first moments is ignored; one after skips to the lift-off, banner and finish still in order', () => {
    const r = new Recorder()
    const P = openPlan()
    r.run.start(P)
    // Held presses through the first 0.35 s: the exit carries on.
    r.steps(0.35, () => true)
    expect(r.run.time).toBeCloseTo(0.35, 5)
    expect(r.run.skippable).toBe(false)
    r.steps(0.2)
    expect(r.run.skippable).toBe(true)
    const pressedAt = r.run.time
    expect(pressedAt).toBeGreaterThanOrEqual(EXIT_SKIP_AFTER)
    r.run.update(STEP, true)
    expect(r.run.stage).toBe('lift')
    expect(r.names()).toEqual(['approach', 'lift'])
    // The walk, the hop and the landing (and their sounds) are skipped.
    r.steps(BANNER_HOLD.cleared + 1)
    expect(r.names()).toEqual(['approach', 'lift', 'finish'])
    const at = Object.fromEntries(r.events.map(([e, t]) => [e, t]))
    expect(at.finish! - at.lift!).toBeGreaterThanOrEqual(BANNER_HOLD.cleared - 1e-9)
  })

  it('a press after the lift-off changes nothing', () => {
    const r = new Recorder()
    const P = openPlan()
    r.run.start(P)
    r.steps(P.tLift + 0.2)
    const t = r.run.time
    expect(r.run.skip()).toBe(false)
    r.run.update(STEP, true)
    expect(r.run.time).toBeCloseTo(t + STEP, 9)
  })

  it('poses: the drone settles ~0.4 m off the floor beside Flux; he stands on its deck and rides it up', () => {
    const r = new Recorder()
    const P = openPlan()
    r.run.start(P)
    const o = newExitPose()
    // Waiting: the underside about 0.4 m over the floor, 2–3 m from Flux.
    r.run.sample(EXIT_APPROACH + 0.3, o)
    expect(o.dy - DRONE_BELOW).toBeGreaterThan(0.33)
    expect(o.dy - DRONE_BELOW).toBeLessThan(0.47)
    expect(Math.hypot(o.dx - P.fx, o.dz - P.fz)).toBeGreaterThan(1.7)
    expect(Math.hypot(o.dx - P.fx, o.dz - P.fz)).toBeLessThan(3.5)
    // The approach comes in from above.
    r.run.sample(0.05, o)
    expect(o.dy).toBeGreaterThan(P.hoverY + 5)
    // Aboard: his feet on the deck, riding it.
    r.run.sample(P.tLand + 0.3, o)
    expect(o.mode).toBe('ride')
    expect(o.hy).toBeCloseTo(o.dy + DRONE_DECK_Y, 6)
    expect(Math.hypot(o.hx - o.dx, o.hz - o.dz)).toBeLessThan(1e-6)
    // Lifting off: rising, accelerating, a forward tilt.
    const y0 = r.run.sample(P.tLift + 0.5, o).dy
    const y1 = r.run.sample(P.tLift + 1.0, o).dy
    const y2 = r.run.sample(P.tLift + 1.5, o).dy
    expect(y1).toBeGreaterThan(y0)
    expect(y2 - y1).toBeGreaterThan(y1 - y0)
    expect(Math.hypot(o.dpitch, o.droll)).toBeGreaterThan(0.05)
    // Walking, he goes from where he stood toward the deck.
    r.run.sample((P.tWalk + P.tHop) / 2, o)
    expect(o.mode).toBe('walk')
    expect(Math.hypot(o.hx - P.sx, o.hz - P.sz)).toBeLessThan(Math.hypot(P.fx - P.sx, P.fz - P.sz))
  })
})

describe('where the drone comes down', () => {
  it('in an open room: beside Flux, 2–3 m off, clear of everything', () => {
    const w = cineWorld(createNav(grid(12, 12)))
    const P = planExit(w, c(6), 0, c(6), 1.1, true)
    expect(P.overhead).toBe(false)
    expect(Math.hypot(P.sx - P.fx, P.sz - P.fz)).toBeGreaterThan(1.7)
    expect(Math.hypot(P.sx - P.fx, P.sz - P.fz)).toBeLessThan(3.4)
    expect(P.hoverY).toBeCloseTo(DRONE_HOVER, 6)
    expect(droneClear(w, P)).toBe(true)
  })

  it('in a one-cell corridor: on its axis, the rotors clear of both walls', () => {
    // A corridor one cell wide (x = 3 m), running along z.
    const walls: Array<[number, number]> = []
    for (let j = 1; j < 11; j++) for (let i = 1; i < 11; i++) if (i !== 5) walls.push([i, j])
    const w = cineWorld(createNav(grid(12, 12, walls)))
    const P = planExit(w, c(5), 0, c(5), 0, true)
    expect(P.overhead).toBe(false)
    expect(Math.abs(P.sx - c(5))).toBeLessThan(0.05)
    expect(droneClear(w, P)).toBe(true)
  })

  it('boxed in with nowhere to land: straight down over Flux', () => {
    const w = cineWorld(createNav(grid(5, 5, [[1, 1], [2, 1], [3, 1], [1, 2], [3, 2], [1, 3], [2, 3], [3, 3]])))
    const P = planExit(w, c(2), 0, c(2), 0, true)
    expect(P.overhead).toBe(true)
    expect(P.sx).toBe(P.fx)
    expect(P.sz).toBe(P.fz)
    // Over his head, not through it.
    expect(P.hoverY - DRONE_BELOW).toBeGreaterThan(1.6)
  })

  it('in real labyrinths, from every room\'s middle, it never lands in a wall', () => {
    let spots = 0
    for (const seed of [3, 17, 58]) {
      const m = generateMap({ seed, rooms: 7, boss: true })
      const w = cineWorld(createNav(m))
      for (const room of m.rooms) {
        const x = (room.x0 + room.w / 2) * CELL
        const z = (room.z0 + room.h / 2) * CELL
        if (solidAt(w, x, 1, z, 0.7)) continue
        const P = planExit(w, x, 0, z, 0.3, true)
        if (P.overhead) continue
        spots++
        expect(droneClear(w, P)).toBe(true)
      }
    }
    expect(spots).toBeGreaterThan(10)
  })

  it('on the climb (shafts, ledges, the walkway over the pits), at every checkpoint', () => {
    for (const seed of [2, 9]) {
      const m = generateClimb(seed)
      const w = cineWorld(createNav(m))
      for (const cp of m.terrain!.checkpoints) {
        const P = planExit(w, cp.x, cp.y, cp.z, cp.yaw, true)
        if (!P.overhead) {
          expect(droneClear(w, P)).toBe(true)
          // The drone hovers over Flux's own floor (or a pit), never over a higher one.
          expect(groundAt(m, P.sx, P.sz)).toBeLessThanOrEqual(cp.y + 0.15)
        }
        // Wherever it comes down, the lift-off goes over the walls round about.
        expect(P.top).toBeGreaterThanOrEqual(cp.y + 3)
      }
    }
  })
})

// ─── Wired into the mission ──────────────────────────────────────────────────

/** A mission with only what the exit reads: an open floor, Flux in the
 *  middle of it, the objective done. */
const mission = () => {
  const sector = SECTORS[0]!
  const setup: MissionSetup = {
    sector: sector.id, seed: 1, rooms: 1, boss: false, enemyLevel: 1, encounters: sector.encounters, stats: baseStats()
  }
  const input = createInput()
  const m = new (Mission as unknown as new (s: MissionSetup, i: Input) => Mission)(setup, input)
  const map = grid(12, 12)
  m.map = map
  m.nav = createNav(map)
  m.cine = cineWorld(m.nav)
  const mid = c(6)
  m.player = {
    x: mid, z: mid, px: mid, pz: mid, vx: 0, vz: 0, yaw: 0, pitch: 0, path: null, bob: 0, bobAmp: 0,
    y: 0, py: 0, vy: 0, ground: true, ladder: -1, plat: -1, air: 0, safeY: 0, mantle: 0, mx: 0, mz: 0
  }
  m.fx = { emit: () => {}, sparks: () => {}, riseRing: () => {} } as unknown as Mission['fx']
  m.objects = { objective: { done: true } } as unknown as Mission['objects']
  // The teleporter pad, in a far corner.
  m.pad = { root: { position: { x: c(2), y: 0, z: c(2) } } } as unknown as Mission['pad']
  const step = (press = false) => {
    if (press) input.anyPressed = true
    ;(m as unknown as { stepExit(dt: number, first: boolean): void }).stepExit(STEP, true)
    consumeEdges(input)
  }
  return { m, input, step }
}

describe('the exit in the mission', () => {
  afterEach(() => {
    hud.phase = 'boot'
    hud.cineSkip = false
  })

  it('B / the button starts it once; the banner goes up at lift-off; finishMission(true) once, after the hold', () => {
    const { m, step } = mission()
    hud.phase = 'play'
    const seq0 = banner.seq
    m.beamOut()
    expect(hud.phase).toBe('beamOut')
    expect(m.exit.active).toBe(true)
    const P = m.exit.plan!
    // The press that started it lands in the same breath: no skip.
    step(true)
    m.beamOut()
    expect(m.exit.plan).toBe(P)
    let liftStep = -1
    let n = 0
    for (; n < Math.round((P.tEnd + 3) / STEP); n++) {
      step()
      if (liftStep < 0 && banner.seq !== seq0) liftStep = n
      if (n === liftStep) {
        expect(banner.kind).toBe('cleared')
        expect(h.finishes.length).toBe(0)
      }
    }
    expect(liftStep).toBeGreaterThan(0)
    expect(h.finishes).toEqual([{ success: true }])
    expect(h.snaps).toBe(1)
    expect(banner.seq).toBe(seq0 + 1)
    // Flux went up with the drone.
    expect(m.player.y).toBeGreaterThan(P.hoverY + 3)
    expect(h.sounds).toEqual(expect.arrayContaining(['droneArrive', 'deckLand', 'liftOff', 'droneHum', 'droneHumHi']))
  })

  it('the finish waits the banner hold after a skip too', () => {
    const { m, step } = mission()
    hud.phase = 'play'
    m.beamOut()
    const P = m.exit.plan!
    for (let n = 0; n < Math.round(0.6 / STEP); n++) step()
    expect(hud.cineSkip).toBe(true)
    step(true)
    expect(m.exit.stage).toBe('lift')
    expect(hud.cineSkip).toBe(false)
    expect(banner.kind).toBe('cleared')
    for (let n = 0; n < Math.round((BANNER_HOLD.cleared - 0.1) / STEP); n++) step()
    expect(h.finishes.length).toBe(0)
    for (let n = 0; n < Math.round(0.3 / STEP); n++) step()
    expect(h.finishes).toEqual([{ success: true }])
    expect(P.tEnd - P.tLift).toBe(BANNER_HOLD.cleared)
    expect(h.sounds).not.toContain('deckLand')
  })

  it('never starts before the objective is done, nor outside live play', () => {
    const { m } = mission()
    hud.phase = 'play'
    m.objects = { objective: { done: false } } as unknown as Mission['objects']
    m.beamOut()
    expect(m.exit.active).toBe(false)
    m.objects = { objective: { done: true } } as unknown as Mission['objects']
    hud.phase = 'dead'
    m.beamOut()
    expect(m.exit.active).toBe(false)
  })

  it('retreat / abandon bypasses it: a failed finish at once, no cutscene', () => {
    const { m } = mission()
    hud.phase = 'play'
    m.retreat()
    expect(h.finishes).toEqual([{ success: false }])
    expect(m.exit.active).toBe(false)
  })

  it('a retreat mid-exit ends the mission once: the cutscene does not finish it again', () => {
    const { m, step } = mission()
    hud.phase = 'play'
    m.beamOut()
    for (let n = 0; n < Math.round(1 / STEP); n++) step()
    m.retreat()
    const P = m.exit.plan!
    for (let n = 0; n < Math.round(P.tEnd / STEP); n++) step()
    expect(h.finishes).toEqual([{ success: false }])
  })
})
