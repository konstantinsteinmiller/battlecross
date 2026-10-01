// @vitest-environment jsdom
// ─── Where the damage comes from ─────────────────────────────────────────────
//
// A playtester found the heart, the red pulse and the vignette, and still did
// not know what was shooting him. Every hit with a source now reports it
// (`state/damageFeed.ts`): the HUD puts a marker on a ring round the
// crosshair at the source's bearing (one per source, refreshed by a repeat
// hit, faded in ~1.15 s), and the hurt sound plays from that side, muffled
// from behind. Hits with no direction show nothing. The low-health warning
// starts at 40 % now (it was 30 %).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({ calls: [] as unknown[][] }))
vi.mock('@/game/audio/sfx', () => ({ sfx: (...a: unknown[]) => { h.calls.push(a) } }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { setMode: () => {}, setWanted: () => {} } }))

import {
  DamageFeed, bearingOf, isBehind, unseen, markerAlpha, hitCue, feedDamage, damageFeed, damageView,
  whizzBearing, incomingShot, WHIZZ, MARKER_HOLD, MARKER_FADE, MARKER_POOL, type HitCue, type Pose
} from '@/game/state/damageFeed'
import { Mission, type MissionSetup } from '@/game/sim/mission'
import { hud } from '@/game/state/hud'
import { LOW_HP } from '@/game/state/screenFx'
import { createInput, type Input } from '@/game/engine/input'
import { SECTORS } from '@/game/data/regions'
import { baseStats } from '@/game/sim/stats'
import type { Enemy } from '@/game/sim/world'

const D = Math.PI / 180
/** Flux at the origin facing `yawDeg` (forward is (-sin yaw, -cos yaw)). */
const at = (yawDeg = 0): Pose => ({ x: 0, z: 0, yaw: yawDeg * D })
/** A point `dist` m away at the compass bearing `deg` of a pose facing yaw 0:
 *  0 = ahead (-z), 90 = right (+x), 180 = behind (+z), 270 = left (-x). */
const pointAt = (deg: number, dist = 10): [number, number] =>
  [Math.sin(deg * D) * dist, -Math.cos(deg * D) * dist]

beforeEach(() => {
  h.calls.length = 0
  damageFeed.clear()
})
afterEach(() => {
  hud.phase = 'boot'
  WHIZZ.on = true
})

describe('bearingOf: world source vs Flux → relative angle, + = right', () => {
  const cases: [number, number][] = [[0, 0], [90, 90], [180, 180], [270, -90]]
  for (const [deg, want] of cases) {
    it(`a source at ${deg}° reads ${want}°`, () => {
      const [x, z] = pointAt(deg)
      const b = bearingOf(x, z, 0, 0, 0)
      expect(Math.abs(b / D - want) < 1e-6 || Math.abs(Math.abs(b / D) - 180) < 1e-6 && Math.abs(want) === 180).toBe(true)
    })
  }

  it('front and back', () => {
    for (const [deg, behind] of [[0, false], [60, false], [-60, false], [100, true], [180, true], [260, true], [300, false]] as const) {
      const [x, z] = pointAt(deg)
      expect(isBehind(bearingOf(x, z, 0, 0, 0)), `${deg}°`).toBe(behind)
    }
  })

  it('is relative to the view: turning right by 90° puts a right-hand source dead ahead', () => {
    // The yaw grows to the LEFT, so a right turn is a negative yaw.
    const [x, z] = pointAt(90)
    expect(bearingOf(x, z, 0, 0, -90 * D)).toBeCloseTo(0, 9)
    expect(bearingOf(x, z, 0, 0, 90 * D)).toBeCloseTo(180 * D, 9)
  })

  it('wraps round: always in (-180°, 180°], whatever the yaw', () => {
    // Yaw 350° is facing 10° to the right (the yaw grows to the left): a
    // source at 20° is 10° right of the view…
    const [x, z] = pointAt(20)
    expect(bearingOf(x, z, 0, 0, 350 * D) / D).toBeCloseTo(10, 6)
    expect(bearingOf(x, z, 0, 0, -10 * D) / D).toBeCloseTo(10, 6)
    // …and the same with the yaw wound past a full turn either way.
    expect(bearingOf(x, z, 0, 0, (350 + 720) * D) / D).toBeCloseTo(10, 6)
    expect(bearingOf(x, z, 0, 0, (350 - 1080) * D) / D).toBeCloseTo(10, 6)
    // Across the seam: facing 10° left, a source at 175° is 185° to the right,
    // which wraps to 175° on the left (-).
    const [sx, sz] = pointAt(175)
    expect(bearingOf(sx, sz, 0, 0, 10 * D) / D).toBeCloseTo(-175, 6)
    // A source 10° left of dead behind stays on the left (negative), never 190°.
    const [bx, bz] = pointAt(190)
    expect(bearingOf(bx, bz, 0, 0, 0) / D).toBeCloseTo(-170, 6)
    for (let yaw = -720; yaw <= 720; yaw += 37) {
      const b = bearingOf(bx, bz, 0, 0, yaw * D)
      expect(b).toBeGreaterThan(-Math.PI)
      expect(b).toBeLessThanOrEqual(Math.PI)
    }
  })

  it('from where Flux stands, not the origin', () => {
    expect(bearingOf(15, 5, 5, 5, 0) / D).toBeCloseTo(90, 9)
  })
})

describe('the marker pool', () => {
  const HALF = 45 * D

  it('a hit with a source makes a marker at the source, faded out in ~1.15 s', () => {
    const f = new DamageFeed()
    const [x, z] = pointAt(90)
    const m = f.push(at(), null, x, z, 10, 100)!
    expect(m).not.toBeNull()
    expect(f.latest).toBe(m)
    expect(m.active).toBe(true)
    expect(bearingOf(m.x, m.z, 0, 0, 0) / D).toBeCloseTo(90, 6)
    expect(markerAlpha(0)).toBe(1)
    f.step(MARKER_HOLD - 0.01)
    expect(markerAlpha(m.age)).toBe(1) // holds…
    f.step(0.3)
    expect(markerAlpha(m.age)).toBeGreaterThan(0)
    expect(markerAlpha(m.age)).toBeLessThan(1) // …fades…
    expect(MARKER_HOLD + MARKER_FADE).toBeGreaterThanOrEqual(1)
    expect(MARKER_HOLD + MARKER_FADE).toBeLessThanOrEqual(1.2)
    f.step(MARKER_HOLD + MARKER_FADE)
    expect(m.active).toBe(false) // …and is gone
    expect(f.latest).toBeNull()
  })

  it('a repeat hit from the same machine refreshes its marker, never stacks one', () => {
    const f = new DamageFeed()
    const shooter = { x: 8, z: 0 }
    const a = f.push(at(), shooter, 0, 0, 5, 100)!
    f.step(0.7)
    shooter.x = 9 // it moved between shots
    const b = f.push(at(), shooter, 0, 0, 5, 100)!
    expect(b).toBe(a)
    expect(b.age).toBe(0)
    expect(b.x).toBe(9) // re-aimed at where it stands now
    expect(f.markers.filter(m => m.active)).toHaveLength(1)
  })

  it('a machine\'s position wins over the hit point (a shot lands next to Flux)', () => {
    const f = new DamageFeed()
    // The shot's last position is 0.4 m in front; the shooter is to the right.
    const m = f.push(at(), { x: 12, z: 0 }, 0, -0.4, 5, 100)!
    expect(bearingOf(m.x, m.z, 0, 0, 0) / D).toBeCloseTo(90, 6)
  })

  it('a trap hit twice from the same spot is one marker; another spot is another', () => {
    const f = new DamageFeed()
    const a = f.push(at(), null, 4, 0, 5, 100)!
    const b = f.push(at(), null, 4.5, 0.5, 5, 100)!
    expect(b).toBe(a)
    const c = f.push(at(), null, -4, 0, 5, 100)!
    expect(c).not.toBe(a)
    expect(f.markers.filter(m => m.active)).toHaveLength(2)
  })

  it('several sources show as several markers; past the pool the oldest is recycled', () => {
    const f = new DamageFeed()
    const machines = Array.from({ length: MARKER_POOL + 1 }, (_, i) => ({ x: Math.cos(i) * 10, z: Math.sin(i) * 10 }))
    for (let i = 0; i < MARKER_POOL; i++) {
      f.push(at(), machines[i]!, 0, 0, 5, 100)
      f.step(0.05)
    }
    expect(f.markers.filter(m => m.active)).toHaveLength(MARKER_POOL)
    const oldest = f.markers.find(m => m.key === machines[0])!
    f.push(at(), machines[MARKER_POOL]!, 0, 0, 5, 100)
    expect(f.markers.filter(m => m.active)).toHaveLength(MARKER_POOL)
    expect(oldest.key).toBe(machines[MARKER_POOL])
  })

  it('a hit with no direction (fire under his feet) makes no marker', () => {
    const f = new DamageFeed()
    expect(f.push(at(), null, 0, 0, 20, 100)).toBeNull()
    expect(f.markers.some(m => m.active)).toBe(false)
  })

  it('a near source is pushed out along its direction, so a step does not swing it', () => {
    const f = new DamageFeed()
    const m = f.push(at(), null, 0.5, 0, 5, 100)!
    expect(Math.hypot(m.x, m.z)).toBeCloseTo(3, 6)
    // One step forward: still to the right, not behind.
    expect(Math.abs(bearingOf(m.x, m.z, 0, -0.4, 0) / D - 90)).toBeLessThan(10)
  })

  it('strength follows the damage share: a chip reads, a big hit shouts', () => {
    const f = new DamageFeed()
    const small = f.push(at(), { x: 5, z: 0 }, 0, 0, 3, 100)!.strength
    const big = f.push(at(), { x: -5, z: 0 }, 0, 0, 30, 100)!.strength
    expect(small).toBeGreaterThanOrEqual(0.3)
    expect(big).toBeGreaterThan(small)
    expect(big).toBeLessThanOrEqual(1)
  })

  it('an unseen source is drawn stronger: off-screen more than in view, behind most', () => {
    const front = unseen(0, HALF)
    const edge = unseen(20 * D, HALF)
    const off = unseen(80 * D, HALF)
    const back = unseen(180 * D, HALF)
    expect(front).toBe(0)
    expect(edge).toBe(0)
    expect(off).toBeGreaterThan(0.5)
    expect(back).toBe(1)
    expect(unseen(-80 * D, HALF)).toBe(off) // either side
  })

  it('clear() drops everything (a new mission)', () => {
    const f = new DamageFeed()
    f.push(at(), { x: 5, z: 0 }, 0, 0, 5, 100)
    f.clear()
    expect(f.markers.some(m => m.active)).toBe(false)
    expect(f.latest).toBeNull()
  })
})

describe('the hurt sound from its side', () => {
  const cue = (deg: number, share = 0.1): HitCue => hitCue(deg * D, share, { pan: 0, muffle: 0, gain: 1 })

  it('pans by the bearing: right is +, left is −, never hard', () => {
    expect(cue(0).pan).toBeCloseTo(0, 9)
    expect(cue(90).pan).toBeGreaterThan(0.7)
    expect(cue(90).pan).toBeLessThan(1)
    expect(cue(-90).pan).toBeCloseTo(-cue(90).pan, 9)
    expect(cue(45).pan).toBeGreaterThan(0)
    expect(cue(45).pan).toBeLessThan(cue(90).pan)
  })

  it('muffles from behind only, so front and back differ (both pan to the middle)', () => {
    expect(cue(0).muffle).toBe(0)
    expect(cue(60).muffle).toBe(0)
    expect(cue(90).muffle).toBeCloseTo(0, 9)
    expect(cue(135).muffle).toBeGreaterThan(0.6)
    expect(cue(180).muffle).toBeCloseTo(1, 9)
    expect(cue(180).pan).toBeCloseTo(0, 9)
    expect(cue(-150).muffle).toBeCloseTo(cue(150).muffle, 9)
  })

  it('louder for a bigger hit, capped', () => {
    expect(cue(0, 0.3).gain).toBeGreaterThan(cue(0, 0.05).gain)
    expect(cue(180, 5).gain).toBeLessThanOrEqual(1.35)
  })

  it('feedDamage plays the hurt sound panned and muffled by the source, and puts up the marker', () => {
    const [x, z] = pointAt(90)
    feedDamage(at(), null, x, z, 10, 100)
    const [name, pan, , muffle] = h.calls.at(-1)!
    expect(name).toBe('hurt')
    expect(pan as number).toBeGreaterThan(0.7)
    expect(muffle).toBeCloseTo(0, 9)
    expect(damageFeed.latest?.active).toBe(true)

    const [bx, bz] = pointAt(180)
    feedDamage(at(), null, bx, bz, 10, 100)
    const [, bpan, , bmuffle] = h.calls.at(-1)!
    expect(bpan as number).toBeCloseTo(0, 6)
    expect(bmuffle as number).toBeCloseTo(1, 6)
  })

  it('a hit with no direction still hurts, centred, and shows no marker', () => {
    feedDamage(at(), null, 0, 0, 10, 100)
    expect(h.calls.at(-1)).toEqual(['hurt'])
    expect(damageFeed.markers.some(m => m.active)).toBe(false)
  })
})

describe('the incoming shot\'s whizz', () => {
  const HALF = 45 * D
  /** A shot flying straight at Flux from `deg`, `d` m out, this step. */
  const shot = (deg: number, d: number, speed = 12, stepDt = 1 / 60) => {
    const [ux, uz] = pointAt(deg, 1)
    return {
      x: ux * d, z: uz * d,
      px: ux * (d + speed * stepDt), pz: uz * (d + speed * stepDt),
      vx: -ux * speed, vz: -uz * speed
    }
  }
  const test = (s: ReturnType<typeof shot>, pose = at()) => whizzBearing(pose, s.x, s.z, s.px, s.pz, s.vx, s.vz, HALF)

  it('warns once, on the step a shot from behind crosses the lead distance', () => {
    const lead = 12 * WHIZZ.lead
    expect(test(shot(180, lead - 0.1))).not.toBeNull()
    expect(test(shot(180, lead + 1))).toBeNull() // still far
    expect(test(shot(180, lead - 0.5))).toBeNull() // crossed on an earlier step
  })

  it('not for a shot Flux can see coming, nor one flying past', () => {
    const lead = 12 * WHIZZ.lead
    expect(test(shot(10, lead - 0.1))).toBeNull()
    const s = shot(120, lead - 0.1)
    s.vx = -s.vz // flying across, not at him
    s.vz = s.x
    expect(test(s)).toBeNull()
  })

  it('pans from its side, and the opt-out silences it', () => {
    const lead = 12 * WHIZZ.lead
    const s = shot(100, lead - 0.1)
    damageView.halfFov = HALF
    incomingShot(at(), s.x, s.z, s.px, s.pz, s.vx, s.vz)
    const [name, pan] = h.calls.at(-1)!
    expect(name).toBe('whizz')
    expect(pan as number).toBeGreaterThan(0.5)
    h.calls.length = 0
    WHIZZ.on = false
    incomingShot(at(), s.x, s.z, s.px, s.pz, s.vx, s.vz)
    expect(h.calls).toHaveLength(0)
  })
})

describe('the mission reports its hits', () => {
  const mission = () => {
    const sector = SECTORS[0]!
    const setup: MissionSetup = {
      sector: sector.id, seed: 1, rooms: 1, boss: false, enemyLevel: 1, encounters: sector.encounters, stats: baseStats()
    }
    const m = new (Mission as unknown as new (s: MissionSetup, i: Input) => Mission)(setup, createInput())
    m.player = {
      x: 10, z: 10, px: 10, pz: 10, vx: 0, vz: 0, yaw: 0, pitch: 0, path: null, bob: 0, bobAmp: 0,
      y: 0, py: 0, vy: 0, ground: true, ladder: -1, plat: -1, air: 0, safeY: 0, mantle: 0, mx: 0, mz: 0
    }
    hud.phase = 'play'
    return m
  }

  it('a machine\'s hit marks the machine, with the hurt sound from its side', () => {
    const m = mission()
    const e = { x: 10, z: 20 } as unknown as Enemy // dead behind (+z)
    expect(m.hitPlayer(e, 12, { blockable: false, fromX: 10, fromZ: 10.5, kind: 'shot' })).toBe('hit')
    const mk = damageFeed.latest!
    expect(mk.key).toBe(e)
    expect(Math.abs(bearingOf(mk.x, mk.z, 10, 10, 0) / D)).toBeCloseTo(180, 6)
    const hurt = h.calls.filter(c => c[0] === 'hurt')
    expect(hurt).toHaveLength(1)
    expect(hurt[0]![3] as number).toBeCloseTo(1, 6) // muffled: behind
  })

  it('a trap or a blast (no machine) marks the spot it came from', () => {
    const m = mission()
    m.hitPlayer(null, 8, { blockable: false, fromX: 4, fromZ: 10, kind: 'aoe' })
    const mk = damageFeed.latest!
    expect(mk.key).toBeNull()
    expect(bearingOf(mk.x, mk.z, 10, 10, 0) / D).toBeCloseTo(-90, 6) // left
  })

  it('a missed hit (i-frames) reports nothing', () => {
    const m = mission()
    m.combat.iframes = 1
    expect(m.hitPlayer(null, 8, { blockable: false, fromX: 4, fromZ: 10, kind: 'aoe' })).toBe('miss')
    expect(damageFeed.latest).toBeNull()
    expect(h.calls.filter(c => c[0] === 'hurt')).toHaveLength(0)
  })
})

describe('the low-health warning', () => {
  it('starts at 40 % of max HP', () => {
    expect(LOW_HP).toBe(0.4)
  })
})
