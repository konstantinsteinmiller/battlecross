import { describe, expect, it } from 'vitest'
import { startAttrs } from '@/game/data/attributes'
import { animate } from '@/game/gfx/rigs/anim'
import { makeRigView, type RigView } from '@/game/gfx/rigs'
import type { Held } from '@/game/gfx/rigs/humanoid'
import { LOOKS } from '@/game/gfx/rigs/looks'
import { I, N } from '@/game/gfx/rigs/pose'
import { createHero, ROLL_T, rollHero } from '@/game/sim/hero'
import { applyPlan } from '@/game/sim/director'
import { stepSim } from '@/game/sim/step'
import { Sim } from '@/game/sim/world'
import { generateArena } from '@/game/sim/zoneGen'

/**
 * The dodge roll ends a full somersault on (pitch 2π), landing in a crouch
 * (#139). The crossfade out of the clip must take the short way round to the
 * stance, not unwind the turn, and every channel of the pose must move in small
 * steps from the roll into idle or the walk: no snap up to standing.
 */
const HELD: Held[] = ['sword', 'dagger', 'great', 'heavy', 'staff', 'wand', 'bow', 'gun', 'sling', 'scythe', 'none']
const DT = 1 / 60
const TAU = Math.PI * 2
/** Largest pose change one frame may make across the roll's end (radians / unit).
 *  The old clip stood up in a single frame (a knee jumped ~0.5). */
const MAX_STEP = 0.3

const field = (): Sim => {
  const plan = generateArena(7)
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 5, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 5, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
    skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0
  })
  return sim
}

interface Run {
  v: RigView
  /** Largest one-frame change of any channel, from the sim's last roll frame on. */
  worst: number
  /** The pose on the sim's last roll frame. */
  landing: Float32Array
}

const rollInto = (held: Held, walk: boolean): Run => {
  const sim = field()
  const plan = generateArena(7)
  const u = sim.hero.unit
  const v = makeRigView(u, { ...LOOKS.bandit!, held, hero: true })
  let time = 0
  const frame = (): void => { stepSim(sim, plan, DT); time += DT; animate(v, u, u.x, u.z, time, DT) }
  for (let i = 0; i < 30; i++) frame()
  expect(rollHero(sim, 0, 1)).toBe(true)
  const prev = new Float32Array(N)
  const landing = new Float32Array(N)
  let worst = 0
  let wasRolling = true
  for (let i = 0; i < Math.ceil((ROLL_T + 0.8) / DT); i++) {
    if (walk) { sim.hero.stickX = 0; sim.hero.stickZ = 1 }
    prev.set(v.pose)
    frame()
    if (wasRolling && u.action?.id !== 'roll') {
      wasRolling = false
      landing.set(prev)
    }
    if (!wasRolling) {
      for (let c = 0; c < N; c++) {
        // A whole turn of pitch is the same pose.
        let d = v.pose[c]! - prev[c]!
        if (c === I.pitch) d -= Math.round(d / TAU) * TAU
        worst = Math.max(worst, Math.abs(d))
      }
    }
  }
  return { v, worst, landing }
}

describe('dodge roll blends back into the stance', () => {
  it.each(HELD)('moves in small steps from the last roll frame into idle (%s)', held => {
    const { v, worst } = rollInto(held, false)
    expect(worst).toBeLessThan(MAX_STEP)
    // The body is upright again once it has settled...
    expect(Math.abs(v.rig.root.rotation.x)).toBeLessThan(0.15)
    // ...and the pose has come all the way home to the stance.
    for (let c = 0; c < N; c++) {
      let d = v.pose[c]! - v.set.stance[c]!
      if (c === I.pitch) d -= Math.round(d / TAU) * TAU
      expect(Math.abs(d), `channel ${c}`).toBeLessThan(0.02)
    }
  })

  it.each(HELD)('moves in small steps from the last roll frame into the walk (%s)', held => {
    const { v, worst } = rollInto(held, true)
    expect(worst).toBeLessThan(MAX_STEP)
    expect(Math.abs(v.rig.root.rotation.x)).toBeLessThan(0.2)
  })

  it('the turn is complete and on the ground when the sim lets go of the roll', () => {
    const { v, landing } = rollInto('sword', false)
    // The view's follow-through lasts as long as the sim's roll after its (tiny) wind-up.
    expect(v.clipFollow).toBeCloseTo(ROLL_T - 0.04, 3)
    // Within one frame of the end: the somersault has (nearly) closed its turn...
    expect(Math.abs(landing[I.pitch]! - TAU)).toBeLessThan(0.1)
    // ...the body is down out of the air, and still crouched to take the landing.
    expect(landing[I.rootY]!).toBeLessThan(0.02)
    expect(landing[I.kL]!).toBeGreaterThan(0.7)
  })
})
