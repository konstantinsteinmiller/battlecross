import { sfx } from '../audio/sfx'

/**
 * ─── Where the damage comes from ─────────────────────────────────────────────
 *
 * A playtester found the heart, the red pulse and the edge vignette, and still
 * died not knowing what was shooting him. Every hit that has a source now says
 * where it came from, without a word:
 *
 * - the sim reports it here, one call at its damage site (`feedDamage`): the
 *   source's position, the damage, and the machine that dealt it if any;
 * - the HUD (`DamageMarkers.vue`) draws a red marker on a ring around the
 *   crosshair at the source's bearing, re-aimed every frame as Flux turns,
 *   held briefly and faded out; one per source, a repeat hit refreshes it;
 * - the hurt sound plays from that side, muffled when the source is behind.
 *
 * The HUD reads the marker pool in its ticker (direct style writes, see the
 * reactivity firewall in `hud.ts`): nothing here is reactive, and a hit
 * allocates nothing.
 */

/** Where Flux stands and faces (the sim's player). */
export interface Pose {
  x: number
  z: number
  yaw: number
}

/** A hit's source: anything with a position (a machine). Its identity is
 *  what makes a repeat hit refresh its marker instead of adding one. */
export interface DamageSource {
  x: number
  z: number
}

const TAU = Math.PI * 2

/**
 * The bearing of a world point relative to the view, radians in (-π, π]:
 * 0 = dead ahead, + = to the right, ±π = behind (the compass's convention;
 * the yaw grows to the left, forward is (-sin yaw, -cos yaw)).
 */
export const bearingOf = (sx: number, sz: number, px: number, pz: number, yaw: number): number => {
  let b = (yaw - Math.atan2(-(sx - px), -(sz - pz))) % TAU
  if (b > Math.PI) b -= TAU
  else if (b <= -Math.PI) b += TAU
  return b
}

/** A bearing in the half-plane behind Flux. */
export const isBehind = (bearing: number): boolean => Math.abs(bearing) > Math.PI / 2

const smooth = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * How unseen a source is: 0 in plain view, about 0.7 just past the screen's
 * edge, 1 behind. `halfFov` is the view's horizontal half-angle. The markers
 * of an unseen source are drawn stronger: the machine in view announces itself.
 */
export const unseen = (bearing: number, halfFov: number): number => {
  const a = Math.abs(bearing)
  return smooth(halfFov * 0.8, halfFov * 1.1, a) * 0.7 + smooth(Math.PI / 2, (Math.PI * 2) / 3, a) * 0.3
}

// ─── The marker pool ────────────────────────────────────────────────────────

/** A marker holds at full strength (s)… */
export const MARKER_HOLD = 0.3
/** …then fades out over this (s): ~1.15 s in all. */
export const MARKER_FADE = 0.85
/** Markers on screen at once; a seventh source recycles the oldest. */
export const MARKER_POOL = 6
/** Two hits without a machine behind them (a trap, a blast) this close
 *  together (m) are the same source. */
const SAME_SPOT = 2.5
/** A source nearer than this (m) is pushed out along its direction: a shot's
 *  last position is right next to Flux, and one step of his would swing a
 *  marker anchored there all the way round. */
const MIN_R = 3
/** Nearer than this there is no direction to show (fire under his feet). */
const NO_DIR = 0.05

export interface DamageMarker {
  active: boolean
  /** The machine that dealt it, null for a trap or a blast. */
  key: DamageSource | null
  /** The source, in the world. */
  x: number
  z: number
  /** 0.3..1, from the damage's share of max HP. */
  strength: number
  /** Seconds since the last hit from this source. */
  age: number
  /** Bumped on every hit: the view redraws the marker's shape. */
  gen: number
  /** Where the HUD drew it last (px): the first-hit cue flies from here. */
  sx: number
  sy: number
}

/** 0..1 visibility of a marker `age` seconds after its last hit. */
export const markerAlpha = (age: number): number => {
  if (age <= MARKER_HOLD) return 1
  const t = Math.min(1, (age - MARKER_HOLD) / MARKER_FADE)
  return 1 - t * t * (3 - 2 * t)
}

/** A hit's strength from its share of max HP: a chip reads, a big one shouts. */
export const strengthOf = (amount: number, maxHp: number): number =>
  Math.min(1, 0.3 + (maxHp > 0 ? amount / maxHp : 0) * 2.8)

export class DamageFeed {
  readonly markers: DamageMarker[] = []
  /** The marker the last hit made or refreshed. */
  latest: DamageMarker | null = null

  constructor(size = MARKER_POOL) {
    for (let i = 0; i < size; i++) {
      this.markers.push({ active: false, key: null, x: 0, z: 0, strength: 0, age: 0, gen: 0, sx: NaN, sy: NaN })
    }
  }

  /**
   * A hit from (x, z) — or, with a `key`, from that machine — that cost
   * `amount` HP. Returns its marker, or null when the hit has no direction.
   */
  push(pose: Pose, key: DamageSource | null, x: number, z: number, amount: number, maxHp: number): DamageMarker | null {
    if (key) {
      x = key.x
      z = key.z
    }
    let dx = x - pose.x
    let dz = z - pose.z
    const d = Math.hypot(dx, dz)
    if (!(d > NO_DIR)) return null
    if (d < MIN_R) {
      dx *= MIN_R / d
      dz *= MIN_R / d
      x = pose.x + dx
      z = pose.z + dz
    }
    const strength = strengthOf(amount, maxHp)
    let m: DamageMarker | null = null
    for (const o of this.markers) {
      if (!o.active) continue
      if (key ? o.key === key : !o.key && Math.hypot(o.x - x, o.z - z) < SAME_SPOT) {
        m = o
        break
      }
    }
    if (m) {
      // The same source again: refresh it, a touch stronger under fire.
      m.strength = Math.min(1, Math.max(m.strength, strength) + 0.08)
    } else {
      m = this.markers.find(o => !o.active) ?? null
      if (!m) {
        m = this.markers[0]!
        for (const o of this.markers) if (o.age > m.age) m = o
      }
      m.active = true
      m.key = key
      m.strength = strength
      m.sx = m.sy = NaN
    }
    m.x = x
    m.z = z
    m.age = 0
    m.gen++
    this.latest = m
    return m
  }

  /** Age the markers (the HUD's frame). */
  step(dt: number): void {
    for (const m of this.markers) {
      if (!m.active) continue
      m.age += dt
      if (m.age >= MARKER_HOLD + MARKER_FADE) this.drop(m)
    }
  }

  clear(): void {
    for (const m of this.markers) this.drop(m)
    this.latest = null
  }

  private drop(m: DamageMarker): void {
    m.active = false
    m.key = null
    if (this.latest === m) this.latest = null
  }
}

/** The mission's feed (the HUD mounts and clears it with the mission). */
export const damageFeed = new DamageFeed()

/** What the HUD saw last frame, read by the sim-side cues below. */
export const damageView = {
  /** The view's horizontal half-angle (rad). */
  halfFov: 0.8
}

// ─── The hurt sound, from its side ──────────────────────────────────────────

export interface HitCue {
  /** Stereo position, -1 left .. +1 right. */
  pan: number
  /** 0 in front .. 1 dead behind: how far the sound is low-passed. */
  muffle: number
  gain: number
}

/** Never a hard pan: one silent ear reads as a broken headphone. */
const PAN = 0.85

/**
 * A directional sound's parameters for a source at `bearing` (see
 * `bearingOf`): panned by its side, and muffled from behind, so a hit at the
 * back sounds different from one in front (both pan to the middle).
 */
export const hitCue = (bearing: number, share: number, out: HitCue): HitCue => {
  const muffle = Math.max(0, -Math.cos(bearing))
  out.pan = Math.sin(bearing) * PAN
  out.muffle = muffle
  // The low-pass takes the edge off: a behind hit gets a little back.
  out.gain = Math.min(1.35, (0.85 + Math.max(0, share) * 1.5) * (1 + 0.15 * muffle))
  return out
}

const cue: HitCue = { pan: 0, muffle: 0, gain: 1 }

/**
 * The sim's hook at the damage site: Flux lost `amount` HP to a hit from
 * (x, z), or from the machine `src`. Plays the hurt sound from that side
 * (centred when the hit has no direction; the synth throttles it) and puts
 * up the HUD's marker.
 */
export const feedDamage = (pose: Pose, src: DamageSource | null, x: number, z: number, amount: number, maxHp: number): void => {
  const m = damageFeed.push(pose, src, x, z, amount, maxHp)
  if (!m) {
    sfx('hurt')
    return
  }
  hitCue(bearingOf(m.x, m.z, pose.x, pose.z, pose.yaw), maxHp > 0 ? amount / maxHp : 0, cue)
  sfx('hurt', cue.pan, cue.gain, cue.muffle)
}

// ─── The incoming shot's warning ────────────────────────────────────────────

/**
 * An enemy shot about to arrive from off-screen whizzes from its side a beat
 * before it lands, so a player can turn or slide. `on` is the opt-out; the
 * synth rate-limits the sound itself.
 */
export const WHIZZ = {
  on: true,
  /** Seconds before impact the warning plays. */
  lead: 0.32,
  gain: 0.9
}

/**
 * The bearing of a shot worth a whizz this step, or null: it crossed the lead
 * distance on this step (so each shot warns once, with no state kept), it is
 * aimed at Flux (within ~30°), and he cannot see it coming.
 */
export const whizzBearing = (
  pose: Pose, x: number, z: number, px: number, pz: number, vx: number, vz: number, halfFov: number
): number | null => {
  const sp = Math.hypot(vx, vz)
  if (sp < 1) return null
  const dx = pose.x - x
  const dz = pose.z - z
  const d = Math.hypot(dx, dz)
  const lead = sp * WHIZZ.lead
  if (d > lead || Math.hypot(pose.x - px, pose.z - pz) <= lead) return null
  if (dx * vx + dz * vz < 0.86 * d * sp) return null
  const b = bearingOf(x, z, pose.x, pose.z, pose.yaw)
  return Math.abs(b) > halfFov ? b : null
}

/** The sim's hook in the enemy-shot step (`sim/combat.ts`). */
export const incomingShot = (pose: Pose, x: number, z: number, px: number, pz: number, vx: number, vz: number): void => {
  if (!WHIZZ.on) return
  const b = whizzBearing(pose, x, z, px, pz, vx, vz, damageView.halfFov)
  if (b === null) return
  hitCue(b, 0, cue)
  sfx('whizz', cue.pan, WHIZZ.gain, cue.muffle)
}
