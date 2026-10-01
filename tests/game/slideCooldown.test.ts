// @vitest-environment jsdom
// The slide (the dodge, Space / the slide button) cools down for 1.5 s from
// the start of one slide to the start of the next; spammed, it made every
// fight too easy (it was 0.7 s). Slide Boosters still shorten it. Driven
// through the mission's own player step at the app's fixed 60 Hz, with the
// input edges consumed after each step the way `Mission.update` does.

import { afterEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({ slides: 0 }))

vi.mock('@/game/audio/sfx', () => ({ sfx: (id: string) => { if (id === 'slide') h.slides++ } }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { setMode: () => {}, setWanted: () => {} } }))

import { Mission, type MissionSetup } from '@/game/sim/mission'
import { baseStats, type PlayerStats } from '@/game/sim/stats'
import { createInput, consumeEdges, type Input } from '@/game/engine/input'
import { createNav } from '@/game/world/nav'
import { CELL, type MapData } from '@/game/world/levelGen'
import { SECTORS } from '@/game/data/regions'
import { profile, computeStats } from '@/game/state/profile'

/** The app's fixed logic step (`engine/app.ts`). */
const STEP = 1 / 60
const W = 24

/** A mission with only what the player step reads: an open floor, Flux in
 *  the middle of it, full Power. */
const rig = (stats: PlayerStats = baseStats()) => {
  const sector = SECTORS[0]!
  const setup: MissionSetup = {
    sector: sector.id, seed: 1, rooms: 1, boss: false, enemyLevel: 1, encounters: sector.encounters, stats
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
  m.fx = { emit: () => {} } as unknown as Mission['fx']
  const step = (slide = false) => {
    if (slide) input.slideQueued = true
    ;(m as unknown as { updatePlayer(dt: number, first: boolean): void }).updatePlayer(STEP, true)
    consumeEdges(input)
    // Keep Flux in the middle of the floor: the test is about time, not walls.
    m.player.x = m.player.z = mid
  }
  /** Step `n` times without input. */
  const idle = (n: number) => { for (let i = 0; i < n; i++) step() }
  return { m, step, idle }
}

/** Whole steps in `s` seconds (the float quotient of 1.4 / (1/60) is 83.99…). */
const steps = (s: number) => Math.round(s / STEP)

afterEach(() => {
  h.slides = 0
})

describe('slide cooldown', () => {
  it('a second slide 1.4 s after the first does not trigger; at 1.5 s it does', () => {
    const { m, step, idle } = rig()
    step(true)
    expect(h.slides).toBe(1)
    // Pressed 1.4 s after the first slide started: still cooling down.
    idle(steps(1.4) - 1)
    step(true)
    expect(h.slides).toBe(1)
    expect(m.combat.power).toBeGreaterThanOrEqual(m.stats.slideCost)
    // Pressed 1.5 s after it: a slide.
    idle(steps(1.5) - steps(1.4) - 1)
    step(true)
    expect(h.slides).toBe(2)
  })

  it('pressed one step short of 1.5 s it waits; later presses work', () => {
    const { step, idle } = rig()
    step(true)
    idle(steps(1.5) - 2)
    step(true)
    expect(h.slides).toBe(1)
    step(true)
    expect(h.slides).toBe(2)
    // …and the next one is 1.5 s from THAT start, not from the first.
    idle(steps(1.5) - 2)
    step(true)
    expect(h.slides).toBe(2)
    step(true)
    expect(h.slides).toBe(3)
  })

  it('a press during the cooldown is dropped, not held for a surprise slide later', () => {
    const { step, idle } = rig()
    step(true)
    idle(steps(0.5))
    step(true)
    idle(steps(3))
    expect(h.slides).toBe(1)
  })

  it('never fires without Power, even after the cooldown', () => {
    const { m, step, idle } = rig()
    step(true)
    idle(steps(1.5))
    m.combat.power = m.stats.slideCost - 1
    m.combat.powerDelay = 10
    step(true)
    expect(h.slides).toBe(1)
  })

  it('Slide Boosters still shorten it: rank 2 cools in 1.5 × 0.7 = 1.05 s', () => {
    const before = profile.hero.skills
    profile.hero.skills = { ...before, boosters: 2 }
    try {
      const stats = computeStats()
      expect(stats.slideCdMul).toBeCloseTo(0.7, 10)
      const { step, idle } = rig(stats)
      step(true)
      // 1.05 s is 63 steps: the step at 1.0333 s is too early…
      idle(62 - 1)
      step(true)
      expect(h.slides).toBe(1)
      // …the one at 1.05 s slides.
      step(true)
      expect(h.slides).toBe(2)
    } finally {
      profile.hero.skills = before
    }
  })

  it('…but never below 1.0 s: rank 3 (1.5 × 0.55 = 0.825 s) is floored to 1.0 s', () => {
    const before = profile.hero.skills
    profile.hero.skills = { ...before, boosters: 3 }
    try {
      const stats = computeStats()
      expect(stats.slideCdMul).toBeCloseTo(0.55, 10)
      const { step, idle } = rig(stats)
      step(true)
      // The unfloored 0.825 s (step 50) is long past and still no slide…
      idle(50 - 1)
      step(true)
      expect(h.slides).toBe(1)
      // …nor at 0.9833 s (step 59)…
      idle(59 - 51)
      step(true)
      expect(h.slides).toBe(1)
      // …the one at 1.0 s slides.
      step(true)
      expect(h.slides).toBe(2)
    } finally {
      profile.hero.skills = before
    }
  })
})
