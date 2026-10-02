import { ENEMY_BY_ID, MINIONS } from '../../data/enemies'
import { cloneRig, type Rig } from '../kit'
import { buildBeast, buildDragon, buildElemental, buildGolem, buildNaga, buildSpider, buildTreant, buildTurret, buildWyvern } from './creatures'
import { clipSet, styleOf, type ClipSet } from './clips'
import { buildHumanoid, WEAPON_EDGE, WEAPON_REACH, type Held, type Look, type OffHand } from './humanoid'
import { LOOKS, lookKey } from './looks'
import { N, type Clip, type Pose } from './pose'
import type { Action, Unit } from '../../sim/types'

/**
 * ─── Rig factory ─────────────────────────────────────────────────────────────
 *
 * Maps a unit to its rig. Every distinct look is BUILT once (a template that
 * never enters a scene) and every unit gets a clone of it: shared geometry, its
 * own bones and material. Building is the expensive part (merging a couple of
 * dozen primitives); cloning is cheap enough to do when a necromancer raises
 * two skeletons mid-fight.
 */

export type Family = 'humanoid' | 'beast' | 'spider' | 'naga' | 'wyvern' | 'dragon' | 'turret'

export interface RigView {
  rig: Rig
  family: Family
  /** World scale of the unit. */
  scale: number
  /** Hovers this far off the ground (0: walks). */
  float: number
  held: Held
  off: OffHand
  /** How it carries its weapon: the stance, the attacks and the casts (`clips.ts`). */
  set: ClipSet
  /** Drawn see-through at rest. */
  ghost: boolean
  /** Walk-cycle phase, advanced by distance. */
  phase: number
  /** Seconds since the last squash was triggered (−1: none running). */
  squashT: number
  squashDepth: number
  squashAction: object | null
  /** The unit's action it was last posed for. */
  lastAction: Action | null
  /** Smoothed heading, radians, and how fast it is turning. */
  yaw: number
  yawRate: number
  /** Speed along its own heading, m/s. */
  fwd: number
  /** Death: the body has finished fading. */
  gone: boolean
  /** Signature colour for its effects. */
  color: string

  // ── The pose layer (humanoids) ──
  /** The core pose as last drawn, and the pose a crossfade started from. */
  pose: Pose
  from: Pose
  blendT: number
  blendDur: number
  blendKey: Clip | null
  /** The clip in hand, the action it belongs to, where its strike begins
   *  (0..1 of the wind-up), seconds since its hit (−1: not yet), and how long
   *  its follow-through runs. */
  clip: Clip | null
  clipSrc: Action | null
  clipS: number
  clipAfter: number
  clipFollow: number
  /** Basic attacks made (they alternate). */
  combo: number
  /** 0 standing … 1 walking. */
  walkK: number
  /** Stride length (robes shorten it). */
  stride: number
  /** Springs: cape, hem, hair, sway, the recoil of a hit, the tail. */
  sec: Float32Array
  lastFlinch: number
  lastRootZ: number
  /** Where the last blow came from: the direction it travelled, radians. */
  hitYaw: number
  /** An extra flash on the body (a critical hit's gold), fading. */
  flash: number
  flashHex: string
  blinkT: number
  /** Eased 0..1: stunned or confused, afraid, in the air, on its back. */
  dazed: number
  scared: number
  air: number
  down: number
  /** What the rig has: a neck, elbows, a face; leg lengths for grounding. */
  neck: boolean
  fore: boolean
  face: boolean
  jaw: boolean
  mouthRest: number
  l1: number
  l2: number

  // ── What the pose says to the effects this frame ──
  /** The weapon's trail, 0..1 (and the off hand's), and whether the blow is heavy. */
  trail: number
  trailOff: number
  trailHeavy: boolean
  /** The bones the trails are read from, and the cutting edge along them. */
  trailBone: string
  trailOffBone: string
  reach: number
  edge: number
  offReach: number
  /** Root offsets of the pose: a lunge along the heading, a hop, a lean, a spin. */
  rootZ: number
  rootY: number
  hopY: number
  hopFrom: number
  leapK: number
  pitch: number
  roll: number
  spin: number
  /** Where the body was drawn (lunge and leap included). */
  x: number
  z: number

  // ── The effects' own bookkeeping (`combatFx.ts`) ──
  /** The action last seen, whether its release has been drawn, and whether it hit anything. */
  fxAct: Action | null
  fxDone: boolean
  fxHit: boolean
  trailWas: boolean
  trailOffWas: boolean
  /** Where the unit was at the last frame (NaN: not seen yet). */
  lastX: number
  lastZ: number
}

const templates = new Map<string, Rig>()

const template = (key: string, build: () => Rig): Rig => {
  let t = templates.get(key)
  if (!t) {
    t = build()
    templates.set(key, t)
  }
  return t
}

const VOID_LORD: Look = {
  skin: '#3a2466', hair: '#e0c8ff', head: 'horns', top: '#241048', bottom: '#180a34', trim: '#c44aff', outfit: 'robe',
  held: 'staff', off: 'orb', eyeGlow: '#f0c8ff', cape: '#4a1c8a', bulk: 1.3, pauldrons: true, glow: '#e0a8ff', ears: 'none'
}

interface Spec { key: string; family: Family; build: () => Rig; float: number; held: Held; ghost: boolean; off?: OffHand; robe?: boolean }

const humanoid = (look: Look): Spec => ({
  key: 'h:' + lookKey(look), family: 'humanoid', build: () => buildHumanoid(look), float: 0, held: look.held, ghost: !!look.ghost,
  off: look.off, robe: look.outfit === 'robe'
})

/** How far a creature's jaws (or a fist with nothing in it) reach, for its trail. */
const BITE_REACH: Partial<Record<Family, number>> = { beast: 0.55, spider: 0.4, wyvern: 0.6, dragon: 1.0 }

const specFor = (rig: string, look: string): Spec => {
  switch (rig) {
    case 'beast': {
      const v = look === 'stalker' ? 'stalker' : 'wolf'
      return { key: 'beast:' + v, family: 'beast', build: () => buildBeast(v), float: 0, held: 'none', ghost: false }
    }
    case 'spider': {
      const v = look === 'brood' ? 'brood' : 'spider'
      return { key: 'spider:' + v, family: 'spider', build: () => buildSpider(v), float: 0, held: 'none', ghost: false }
    }
    case 'treant': {
      const v = look === 'elder' ? 'elder' : 'treant'
      return { key: 'treant:' + v, family: 'humanoid', build: () => buildTreant(v), float: 0, held: 'club', ghost: false }
    }
    case 'golem': {
      const v = look === 'colossus' ? 'colossus' : 'iron'
      return { key: 'golem:' + v, family: 'humanoid', build: () => buildGolem(v), float: 0, held: 'hammer', ghost: false }
    }
    case 'elemental': {
      const v = look === 'emberLord' ? 'emberLord' : look === 'void' ? 'void' : 'fire'
      return { key: 'elem:' + v, family: 'humanoid', build: () => buildElemental(v), float: 0.22, held: 'wand', ghost: false }
    }
    case 'naga': {
      const v = look === 'oracle' ? 'oracle' : 'naga'
      return { key: 'naga:' + v, family: 'naga', build: () => buildNaga(v), float: 0, held: v === 'oracle' ? 'wand' : 'sword', ghost: false }
    }
    case 'wyvern':
      return { key: 'wyvern', family: 'wyvern', build: buildWyvern, float: 0.5, held: 'none', ghost: false }
    case 'dragon': {
      const v = look === 'ally' ? 'ally' : 'void'
      return { key: 'dragon:' + v, family: 'dragon', build: () => buildDragon(v), float: 0, held: 'none', ghost: false }
    }
    case 'voidlord':
      return { ...humanoid(VOID_LORD), float: 0.3 }
    case 'turret': {
      const v = look === 'rocket' ? 'rocket' : 'gatling'
      return { key: 'turret:' + v, family: 'turret', build: () => buildTurret(v), float: 0, held: 'gun', ghost: false }
    }
    default:
      return humanoid(LOOKS[look] ?? LOOKS.bandit!)
  }
}

/** The rig for a unit. `heroLook` is the hero's gear-derived look. */
export const makeRigView = (u: Unit, heroLook?: Look): RigView => {
  let spec: Spec
  let scale = 1
  let color = '#ffffff'
  if (u.rank === 'hero' && heroLook) {
    spec = humanoid(heroLook)
    // His weapon's own light (its tier's colour) is what his swings are drawn in.
    color = heroLook.glow ?? '#7ff4ff'
  } else if (u.rank === 'npc') {
    spec = humanoid(LOOKS[u.kind] ?? LOOKS.peddler!)
  } else {
    const e = ENEMY_BY_ID[u.kind]
    const m = MINIONS[u.kind]
    if (e) { spec = specFor(e.rig, e.look ?? e.id); scale = e.scale; color = e.color } else if (m) { spec = specFor(m.rig, m.look); scale = m.scale; color = m.color } else spec = humanoid(LOOKS.bandit!)
  }
  const rig = cloneRig(template(spec.key, spec.build))
  rig.root.scale.setScalar(scale)
  const off = spec.off ?? 'none'
  const set = clipSet(styleOf(spec.held, off, u.s.atkStyle), off === 'shield', u.s.dual > 0 || off === 'dagger' || off === 'gun')
  const posed = spec.family === 'humanoid' || spec.family === 'naga'
  const rest = rig.rest
  const pose = new Float32Array(N)
  pose.set(set.stance)
  const bite = BITE_REACH[spec.family]
  const mouth = rig.bones.mouth
  return {
    rig,
    family: spec.family,
    scale,
    float: spec.float,
    held: spec.held,
    off,
    set,
    ghost: spec.ghost,
    phase: (u.id * 1.7) % 6.28,
    squashT: -1,
    squashDepth: 0.2,
    squashAction: null,
    lastAction: null,
    yaw: u.facing,
    yawRate: 0,
    fwd: 0,
    gone: false,
    color,
    pose,
    from: new Float32Array(N),
    blendT: 1,
    blendDur: 0,
    blendKey: null,
    clip: null,
    clipSrc: null,
    clipS: 0.7,
    clipAfter: -1,
    clipFollow: 0.3,
    combo: (u.id * 7) % 3,
    walkK: 0,
    stride: spec.robe ? 0.7 : 1,
    sec: new Float32Array(12),
    lastFlinch: 0,
    lastRootZ: 0,
    hitYaw: 0,
    flash: 0,
    flashHex: '#ffffff',
    blinkT: 0.5 + ((u.id * 0.37) % 3),
    dazed: 0,
    scared: 0,
    air: 0,
    down: 0,
    neck: !!rig.bones.neck,
    fore: !!rig.bones.foreR,
    face: !!rig.bones.lids,
    jaw: !!mouth && mouth.scale.y > 0.99,
    mouthRest: mouth ? mouth.scale.y : 1,
    l1: posed && rest.legL ? (rest.shinL ? Math.abs(rest.shinL.p.y) : rest.hips ? rest.hips.p.y : 0) : 0,
    l2: posed && rest.footL ? Math.abs(rest.footL.p.y) : 0,
    trail: 0,
    trailOff: 0,
    trailHeavy: false,
    trailBone: bite ? 'head' : rig.bones.weapon ? 'weapon' : 'handR',
    trailOffBone: rig.bones.offhand ? 'offhand' : 'handL',
    reach: bite ?? WEAPON_REACH[spec.held],
    edge: bite ? 0.35 : WEAPON_EDGE[spec.held],
    offReach: off === 'dagger' ? 0.32 : off === 'shield' ? 0.3 : 0.16,
    rootZ: 0,
    rootY: 0,
    hopY: 0,
    hopFrom: 1,
    leapK: 0,
    pitch: 0,
    roll: 0,
    spin: 0,
    x: u.x,
    z: u.z,
    fxAct: null,
    fxDone: false,
    fxHit: false,
    trailWas: false,
    trailOffWas: false,
    lastX: NaN,
    lastZ: NaN
  }
}

/** Build the templates a zone will need, one per call (the loader slices it). */
export const prewarmKinds = (kinds: Iterable<string>): Array<() => void> => {
  const jobs: Array<() => void> = []
  const seen = new Set<string>()
  for (const kind of kinds) {
    const e = ENEMY_BY_ID[kind]
    const m = MINIONS[kind]
    const spec = e ? specFor(e.rig, e.look ?? e.id) : m ? specFor(m.rig, m.look) : LOOKS[kind] ? humanoid(LOOKS[kind]!) : null
    if (!spec || seen.has(spec.key)) continue
    seen.add(spec.key)
    jobs.push(() => { template(spec.key, spec.build) })
  }
  return jobs
}

export const prewarmLook = (look: Look): void => {
  const s = humanoid(look)
  template(s.key, s.build)
}
