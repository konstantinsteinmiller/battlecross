import { sightPastWalls } from '../grid'
import { applyStatus } from '../combat'
import type { Sim } from '../world'
import type { BossState, Unit } from '../types'
import type { BossScript } from './index'
import { bark, daze, move, other, raiseProps, shatterWallAt, strikeFor, warn, windChargeAt, type ChargeOpts } from './kit'

/**
 * ─── The Cyclops (Ironhold Mines, afterplay §5.3) — teaches weak points ─────
 *
 *   all fight  its hide turns four blows in five (it takes a fifth): only its
 *             EYE is soft, and the eye is open 2.5 s after it MISSES A
 *             BOULDER (the circle shows where it lands) or SLAMS INTO ONE OF
 *             THE HALL'S FOUR SUPPORT BEAMS on a charge (the beam breaks and
 *             rocks come down where the warning shows). It stands dazed
 *             while the eye is open: that is the window.
 *   100–60 %  the EYE BEAM: a lit lane, then it sweeps 90°; the eye is open
 *             while it burns.
 *   60 %      it COVERS ITS EYE with a hand between attacks: only a miss or
 *             a beam opens it now.
 *   30 %      BLIND RAGE: it goes for the LAST NOISE it heard. Running is
 *             noise; a dodge roll is not (and standing still is silent).
 */

const COLOR = '#e0b04a'
/** What reaches it of a blow while the eye is shut. */
export const GUARD = 0.2
const EYE_OPEN = 2.5
const BOULDER_R = 2.4
const BOULDER_WIND = 1
const BOULDER_FLIGHT = 0.7
const ROCKS_R = 2.6
const ROCKS_WARN = 1
const BEAM_R = 12
const BEAM_W = 0.8
const BEAM_WIND = 1.2
const BEAM_SWEEP = 0.9
const BEAM_ARC = Math.PI / 2
/** Close enough that even blind it feels you. */
const FEEL = 2.8

const STOMP: ChargeOpts = {
  speed: 12, max: 14, dmg: 1.8, pinDmg: 0, pinStun: 0, daze: 0, carry: false,
  // Into a support beam: it breaks, the roof comes down, the eye opens. The rock only staggers it.
  wallDaze: (sim, x, z) => {
    if (shatterWallAt(sim, x, z) !== 'beam') return 0.6
    const s = sim.units.find(q => q.alive && q.boss?.script === 'cyclops' && Math.hypot(q.x - x, q.z - z) < 4)
    if (s) {
      const st = state(s.boss!)
      st.rockT = ROCKS_WARN
      st.rx = x
      st.rz = z
      openEye(sim, s)
      warn(sim, s, { shape: 'circle', x, z, r: ROCKS_R, w: 0, a: 0, dur: ROCKS_WARN })
    }
    sim.emit({ t: 'fx', id: 'burst:rock', x, z, r: 2.2, color: '#8a6a4a' })
    return EYE_OPEN
  }
}

/** What the script keeps between steps (no allocation once made). */
interface CyState {
  eye: number
  boulderT: number; bx: number; bz: number
  rockT: number; rx: number; rz: number
  sweepT: number; sweepA: number; sweepDir: number; beamFx: number
  /** Who the sweep has burnt already (once each). */
  swept: number[]
  lx: number; lz: number; nx: number; nz: number
}
const states = new WeakMap<BossState, CyState>()
const state = (b: BossState): CyState => {
  let s = states.get(b)
  if (!s) {
    s = { eye: 0, boulderT: 0, bx: 0, bz: 0, rockT: 0, rx: 0, rz: 0, sweepT: 0, sweepA: 0, sweepDir: 1, beamFx: 0, swept: [], lx: 0, lz: 0, nx: 0, nz: 0 }
    states.set(b, s)
  }
  return s
}

const hitsBuf: Unit[] = []

/** The eye opens: a gleam of it, and the window begins. */
const openEye = (sim: Sim, u: Unit): void => {
  state(u.boss!).eye = EYE_OPEN
  u.boss!.guard = 1
  sim.emit({ t: 'fx', id: 'mark', x: u.x, z: u.z, unit: u.id, color: COLOR })
}

/** Is the eye open now? */
export const eyeOpen = (u: Unit): boolean => {
  const b = u.boss
  if (!b) return false
  const s = state(b)
  if (s.eye > 0) return true
  // Before it covers it (60 %), the eye shows while it burns.
  return b.phase < 2 && (u.action?.id === 'beam' || s.sweepT > 0)
}

/** Where it aims (into `aimBuf`): the hero, or, blind, the last noise. */
const aimBuf: [number, number] = [0, 0]
const aim = (u: Unit, tgt: Unit): void => {
  const b = u.boss!
  const s = state(b)
  const blind = b.marks.includes('blind')
  aimBuf[0] = blind ? s.nx : tgt.x
  aimBuf[1] = blind ? s.nz : tgt.z
}

const cyclops: BossScript = {
  phases: [0.6, 0.3],
  arena(sim, u) {
    raiseProps(sim, u, 'beam', 4, 4.5, 7)
    const s = state(u.boss!)
    s.lx = s.nx = sim.hero.unit.x
    s.lz = s.nz = sim.hero.unit.z
  },
  think(sim, u, tgt) {
    const b = u.boss!
    // Its first words, once (no string built every step).
    if (!b.marks.includes('bark:intro')) bark(sim, u, 'cyclops', 'intro')
    const blind = b.marks.includes('blind')
    const dh = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    // Blind, it still feels a hero at its feet.
    if (blind && dh < FEEL) return false
    if (b.next > 0) return blind
    aim(u, tgt)
    const x = aimBuf[0]
    const z = aimBuf[1]
    const d = Math.hypot(x - u.x, z - u.z)
    const sight = sightPastWalls(sim.grid, u.x, u.z, x, z)
    // A charge at a hero (or a noise) out of reach: beams in the way break.
    if ((b.cd.charge ?? 0) <= 0 && sight && d > 4) {
      b.cd.charge = blind ? 6 : 8
      b.next = 1.6
      windChargeAt(sim, u, x, z, 1.1, STOMP, blind ? null : tgt)
      return true
    }
    // The eye beam (it sees no more once blind).
    if (!blind && (b.cd.beam ?? 0) <= 0 && d < BEAM_R - 1) {
      b.cd.beam = 10
      b.next = 2.4
      const s = state(b)
      const a = Math.atan2(x - u.x, z - u.z)
      s.sweepDir = sim.rng() < 0.5 ? -1 : 1
      s.sweepA = a - s.sweepDir * BEAM_ARC / 2
      move(sim, u, 'beam', BEAM_WIND, BEAM_SWEEP + 0.3, tgt)
      // The lit lane where it starts, and the quarter it sweeps.
      warn(sim, u, { shape: 'line', x: u.x, z: u.z, r: BEAM_R, w: BEAM_W, a: s.sweepA, dur: BEAM_WIND, wind: BEAM_WIND })
      warn(sim, u, { shape: 'cone', x: u.x, z: u.z, r: BEAM_R, w: BEAM_ARC / 2, a, dur: BEAM_WIND + BEAM_SWEEP, wind: BEAM_WIND })
      return true
    }
    // A boulder at the spot.
    if ((b.cd.boulder ?? 0) <= 0 && d > 2.5 && d < 15) {
      b.cd.boulder = blind ? 4 : 5.5
      b.next = 1.4
      move(sim, u, 'lob', BOULDER_WIND, 0.4, blind ? null : tgt, x, z, 1)
      warn(sim, u, { shape: 'circle', x, z, r: BOULDER_R, w: 0, a: 0, dur: BOULDER_WIND + BOULDER_FLIGHT, wind: BOULDER_WIND })
      return true
    }
    return blind
  },
  land(sim, u, act) {
    const s = state(u.boss!)
    if (act.id === 'lob') {
      s.boulderT = BOULDER_FLIGHT
      s.bx = act.x
      s.bz = act.z
      sim.emit({ t: 'fx', id: 'lob:rock', x: u.x, z: u.z, x2: act.x, z2: act.z, dur: BOULDER_FLIGHT, color: '#8a7a6a' })
    } else if (act.id === 'beam') {
      s.sweepT = BEAM_SWEEP
      s.swept.length = 0
      s.beamFx = 0
    }
  },
  onPhase(sim, u, phase) {
    const b = u.boss!
    sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 8, color: COLOR })
    if (phase === 2) {
      move(sim, u, 'enrage', 0.8, 0.4, null)
      bark(sim, u, 'cyclops', 'cover')
    } else if (phase === 3) {
      move(sim, u, 'enrage', 1, 0.5, null)
      b.marks.push('blind')
      const s = state(b)
      s.nx = s.lx = sim.hero.unit.x
      s.nz = s.lz = sim.hero.unit.z
      bark(sim, u, 'cyclops', 'blind')
    }
  },
  tick(sim, u, dt) {
    const b = u.boss!
    const s = state(b)
    if (s.eye > 0) s.eye -= dt
    // What it hears: a hero who moves, but not one who rolls.
    const h = sim.hero.unit
    if (Math.abs(h.x - s.lx) + Math.abs(h.z - s.lz) > 0.01 && h.action?.id !== 'roll') {
      s.nx = h.x
      s.nz = h.z
    }
    s.lx = h.x
    s.lz = h.z
    // The boulder lands: on someone, or on nothing (and the eye opens).
    if (s.boulderT > 0) {
      s.boulderT -= dt
      if (s.boulderT <= 0) {
        sim.emit({ t: 'fx', id: 'quake', x: s.bx, z: s.bz, r: BOULDER_R + 0.6, color: '#8a7a6a' })
        let hit = false
        for (const t of sim.inCircle(other(u), s.bx, s.bz, BOULDER_R, hitsBuf)) {
          strikeFor(sim, u, t, 2)
          applyStatus(sim, t, 'knockdown', 0.8, 1, u)
          if (t.rank === 'hero') hit = true
        }
        if (!hit && u.alive && b.mode !== 'charge') {
          daze(sim, u, EYE_OPEN, 0.25)
          openEye(sim, u)
        }
      }
    }
    // The broken beam's rocks come down.
    if (s.rockT > 0) {
      s.rockT -= dt
      if (s.rockT <= 0) {
        sim.emit({ t: 'fx', id: 'quake', x: s.rx, z: s.rz, r: ROCKS_R + 0.4, color: '#8a6a4a' })
        for (const t of sim.inCircle(other(u), s.rx, s.rz, ROCKS_R, hitsBuf)) {
          strikeFor(sim, u, t, 1.6)
          applyStatus(sim, t, 'stun', 0.8, 1, u)
        }
      }
    }
    // The beam sweeps its quarter.
    if (s.sweepT > 0) {
      s.sweepT -= dt
      const a = s.sweepA + s.sweepDir * BEAM_ARC * Math.min(1, 1 - s.sweepT / BEAM_SWEEP)
      const dx = Math.sin(a)
      const dz = Math.cos(a)
      s.beamFx -= dt
      if (s.beamFx <= 0) {
        s.beamFx = 0.12
        sim.emit({ t: 'fx', id: 'beam', x: u.x, z: u.z, x2: u.x + dx * BEAM_R, z2: u.z + dz * BEAM_R, r: BEAM_W, color: COLOR })
      }
      for (const t of sim.inCircle(other(u), u.x, u.z, BEAM_R + 1, hitsBuf)) {
        if (s.swept.includes(t.id)) continue
        const along = (t.x - u.x) * dx + (t.z - u.z) * dz
        const across = Math.abs((t.x - u.x) * dz - (t.z - u.z) * dx)
        if (along < 0 || along > BEAM_R || across > BEAM_W + t.r) continue
        s.swept.push(t.id)
        strikeFor(sim, u, t, 1.8, 'beam')
      }
    }
    // Its hide, or its eye.
    b.guard = eyeOpen(u) ? 1 : GUARD
  }
}

export const CYCLOPS_SCRIPTS: Record<string, BossScript> = { cyclops }
export const CYCLOPS_TUNING = { GUARD, EYE_OPEN, BOULDER_R, BOULDER_WIND, BOULDER_FLIGHT, BEAM_WIND, BEAM_SWEEP, ROCKS_WARN, FEEL }
