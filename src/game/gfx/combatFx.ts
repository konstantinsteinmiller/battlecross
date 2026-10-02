import { Vector3 } from 'three'
import { ENEMY_BY_ID } from '../data/enemies'
import { SKILL_BY_ID } from '../data/skills'
import type { Unit } from '../sim/types'
import type { RigView } from './rigs'
import { TYPE_COLOR, type Blow, type Vfx } from './vfx'

/**
 * ─── What a unit's own motion leaves in the air ──────────────────────────────
 *
 * Called once a frame for every unit in view, right after its rig is posed.
 * Everything here is read off the POSE and the unit's action, never off an
 * event, because the sim does not announce these moments:
 *
 *   • the swing trail: the pose says when the weapon is cutting, and the trail
 *     is fed from the weapon bone as it is this frame;
 *   • the release of a shot or a spell (the action's hit time passing): a
 *     muzzle flash at the barrel, a ring of light at the staff's tip;
 *   • a melee swing that met nothing: its trail dims and nothing else happens;
 *   • a body that moved further in one step than legs could: the wind of it.
 *
 * A cancelled action simply stops feeding its trail, which then fades.
 */

const _p = new Vector3()

/** Where a unit's weapon tip (or its other hand's) is, in the world. Poses the matrices first. */
const tipOf = (v: RigView, off: boolean, out: Vector3): boolean => {
  const bone = v.rig.bones[off ? v.trailOffBone : v.trailBone] ?? v.rig.bones.head
  if (!bone) return false
  v.rig.root.updateMatrixWorld(true)
  out.set(0, 0, off ? v.offReach : v.reach).applyMatrix4(bone.matrixWorld)
  return true
}

/** How a physical blow from this attacker lands: an edge, a weight, or a point. */
export const blowOf = (v: RigView | undefined): Blow => {
  if (!v) return 'slash'
  if (v.family === 'beast' || v.family === 'spider' || v.family === 'dragon' || v.family === 'wyvern') return 'slash'
  const h = v.held
  return h === 'hammer' || h === 'club' || h === 'none' || h === 'staff' || h === 'cannon' || h === 'wand' ? 'blunt' : 'slash'
}

const trailColor = (v: RigView, u: Unit): string =>
  u.s.atkType === 'physical' || u.s.atkType === 'pierce' || u.s.atkType === 'true' ? v.color : TYPE_COLOR[u.s.atkType]

export const trackUnit = (vfx: Vfx, v: RigView, u: Unit): void => {
  const key = u.id * 2
  const a = u.action

  // ── A new action, or none ──
  if (a !== v.fxAct) {
    v.fxAct = a
    v.fxDone = false
    v.fxHit = false
  }

  // ── The trail ──
  if (v.trail > 0.02 || v.trailWas) {
    vfx.trails.feed(key, v, false, v.trail, trailColor(v, u), v.trailHeavy)
    v.trailWas = v.trail > 0.02
  }
  if (v.trailOff > 0.02 || v.trailOffWas) {
    vfx.trails.feed(key + 1, v, true, v.trailOff, trailColor(v, u), v.trailHeavy)
    v.trailOffWas = v.trailOff > 0.02
  }

  // ── The moment the action lands or lets fly ──
  if (a && a.done && !v.fxDone) {
    v.fxDone = true
    const dx = Math.sin(u.facing)
    const dz = Math.cos(u.facing)
    if (a.id === 'attack') {
      if (u.s.atkStyle === 'melee') {
        // Nothing was hit: the blade cut air.
        if (!v.fxHit) { vfx.trails.dim(key, 0.38); vfx.trails.dim(key + 1, 0.38) }
      } else if (tipOf(v, v.combo % 2 === 1 && v.set.dual && v.set.style === 'gun', _p)) {
        if (u.s.atkStyle === 'magic') vfx.castFlash(_p.x, _p.y, _p.z, TYPE_COLOR[u.s.atkType] === '#ffffff' ? v.color : TYPE_COLOR[u.s.atkType])
        else if (v.held === 'bow' || v.held === 'sling') vfx.wind(_p.x - dx * 0.2, _p.z - dz * 0.2, _p.x + dx * 1.1, _p.z + dz * 1.1, '#ffffff')
        else vfx.muzzle(_p.x, _p.y, _p.z, dx, dz, v.color, v.held === 'cannon' || v.family === 'turret' && u.kind === 'rocketTurret')
      }
    } else if (a.slot >= 0) {
      // A hero's skill leaves his hands in its own colour.
      const def = SKILL_BY_ID[a.id]
      if (def && tipOf(v, false, _p)) vfx.castFlash(_p.x, _p.y, _p.z, def.color, def.cast >= 0.4)
    } else if (a.ability >= 0) {
      // An enemy's ability that is thrown, shot or called down.
      const k = a.id
      if ((k === 'shot' || k === 'volley' || k === 'lob' || k === 'line' || k === 'barrage' || k === 'smash' || k === 'summon' || k === 'heal') && tipOf(v, k === 'lob' || k === 'smash', _p)) {
        const def = ENEMY_BY_ID[u.kind]
        const col = def?.abilities[a.ability]?.color ?? def?.color ?? v.color
        if ((k === 'shot' || k === 'volley') && (v.held === 'bow' || v.held === 'sling')) vfx.wind(_p.x, _p.z, _p.x + dx * 1.2, _p.z + dz * 1.2, '#ffffff')
        else vfx.castFlash(_p.x, _p.y, _p.z, col, u.rank === 'boss')
      }
    }
  }

  // ── A jump no legs made (a blink, a shadowstep): the wind of it ──
  if (v.lastX !== v.lastX) { v.lastX = u.x; v.lastZ = u.z }
  const jx = u.x - v.lastX
  const jz = u.z - v.lastZ
  if (jx * jx + jz * jz > 9 && u.alive) vfx.wind(v.lastX, v.lastZ, u.x, u.z, v.color)
  v.lastX = u.x
  v.lastZ = u.z
}
