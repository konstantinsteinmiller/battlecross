import { ENEMY_BY_ID, MINIONS } from '../../data/enemies'
import { cloneRig, type Rig } from '../kit'
import { buildBeast, buildDragon, buildElemental, buildGolem, buildNaga, buildSpider, buildTreant, buildTurret, buildWyvern } from './creatures'
import { buildHumanoid, type Held, type Look } from './humanoid'
import { LOOKS, lookKey } from './looks'
import type { Unit } from '../../sim/types'

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
  /** How its basic attack is posed. */
  attack: 'swing' | 'heavy' | 'shoot' | 'cast' | 'bite'
  held: Held
  /** Drawn see-through at rest. */
  ghost: boolean
  /** Walk-cycle phase, advanced by distance. */
  phase: number
  /** Seconds since the last squash was triggered (−1: none running). */
  squashT: number
  squashDepth: number
  /** The unit's action it was last posed for (a new one triggers a squash). */
  lastAction: object | null
  /** Smoothed heading, radians. */
  yaw: number
  /** Death: the body has finished fading. */
  gone: boolean
  /** Signature colour for its effects. */
  color: string
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

const attackOf = (held: Held, style: 'melee' | 'ranged' | 'magic', heavy: boolean): RigView['attack'] => {
  if (style === 'magic' || held === 'staff' || held === 'wand') return 'cast'
  if (style === 'ranged' || held === 'gun' || held === 'cannon' || held === 'bow' || held === 'sling') return 'shoot'
  return heavy || held === 'greatsword' || held === 'axe' || held === 'hammer' || held === 'club' ? 'heavy' : 'swing'
}

interface Spec { key: string; family: Family; build: () => Rig; float: number; held: Held; ghost: boolean }

const humanoid = (look: Look): Spec => ({
  key: 'h:' + lookKey(look), family: 'humanoid', build: () => buildHumanoid(look), float: 0, held: look.held, ghost: !!look.ghost
})

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
    color = '#7ff4ff'
  } else if (u.rank === 'npc') {
    spec = humanoid(LOOKS[u.kind] ?? LOOKS.peddler!)
  } else {
    const e = ENEMY_BY_ID[u.kind]
    const m = MINIONS[u.kind]
    if (e) { spec = specFor(e.rig, e.look ?? e.id); scale = e.scale; color = e.color } else if (m) { spec = specFor(m.rig, m.look); scale = m.scale; color = m.color } else spec = humanoid(LOOKS.bandit!)
  }
  const rig = cloneRig(template(spec.key, spec.build))
  rig.root.scale.setScalar(scale)
  return {
    rig,
    family: spec.family,
    scale,
    float: spec.float,
    attack: spec.family === 'beast' || spec.family === 'spider' || spec.family === 'wyvern' || spec.family === 'dragon'
      ? 'bite'
      : attackOf(spec.held, u.s.atkStyle, u.s.atkHeavy),
    held: spec.held,
    ghost: spec.ghost,
    phase: (u.id * 1.7) % 6.28,
    squashT: -1,
    squashDepth: 0.2,
    lastAction: null,
    yaw: u.facing,
    gone: false,
    color
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
