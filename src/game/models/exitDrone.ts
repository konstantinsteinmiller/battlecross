import {
  Group, Mesh, MeshBasicMaterial, AdditiveBlending, Color, CircleGeometry, CylinderGeometry, DoubleSide,
  Float32BufferAttribute, type BufferGeometry
} from 'three'
import { RigBuilder, rcyl, rcone, torus, sph, ell, cap, xform, paint, merge, pose, type Rig } from './kit'
import { PAL } from './palette'

/**
 * ─── The exit drone ──────────────────────────────────────────────────────────
 *
 * The lab's robotic quadcopter that fetches Flux at the end of a mission
 * (`sim/exitRun.ts`): a flat landing deck he stands on, a glowing rim with
 * blinking landing lights, a shallow hull with a thruster under it, and four
 * arms carrying ducted rotors on the diagonals. The lab's blue and cyan, the
 * way Pip and the hub wear them, so it reads as "home is coming for you".
 *
 * One skinned rig (the kit's three draws: toon, glow, outline): the body bone
 * banks and pitches with the drone's acceleration, a bone per rotor spins.
 * Four additive blur discs ride the rotor bones, the thruster flare and the
 * landing lights hang under the body bone with materials of their own (they
 * pulse and blink). The mission builds it hidden at setup, so it compiles
 * and uploads with the sector, and animates it through `poseExitDrone`.
 *
 * Its origin is the middle of the deck's top: Flux's feet stand on it, and
 * the body tilts about it, so a rider stays put however the drone banks.
 */

/** Height of the deck's standing surface over the drone's origin (m). */
export const DRONE_DECK_Y = 0.03
/** Radius Flux may stand within (the plate inside the rim). */
export const DRONE_DECK_R = 0.64
/** The deck's outer edge (the glowing rim). */
export const DRONE_RIM_R = 0.8
/** Rotor centres: this far from the middle, on the diagonals. */
export const DRONE_ARM_R = 0.9
/** Outer radius of a rotor's duct ring. */
export const DRONE_DUCT_R = 0.42
/** The lowest point (the thruster's glow) under the deck's top (m). */
export const DRONE_BELOW = 0.3
/** Rotor centres in the drone's own frame, [x, z]. +Z is its front: the flat
 *  side between two arms, which it turns to Flux so he can walk up to the deck
 *  between the ducts. */
export const DRONE_ROTORS: ReadonlyArray<readonly [number, number]> = [45, 135, 225, 315].map((deg) => {
  const a = (deg * Math.PI) / 180
  return [Math.cos(a) * DRONE_ARM_R, Math.sin(a) * DRONE_ARM_R] as const
})

const ROTOR_BONES = ['rotor0', 'rotor1', 'rotor2', 'rotor3'] as const

const HULL = '#2f5fd0'
const HULL_DEEP = '#1c2f6e'
const PLATE = PAL.gunmetal
const METAL = PAL.steel
const BLADE = '#dfe6f2'
const GLOW = PAL.glowCyan

export interface ExitDroneView {
  /** Placed and turned (yaw) by the mission; the body bone does the tilt. */
  root: Group
  rig: Rig
  /** The rotors' motion blur, one material for all four. */
  discMat: MeshBasicMaterial
  /** The landing lights round the rim (blink). */
  lightsMat: MeshBasicMaterial
  /** The thruster's downward flare (brightens with thrust). */
  thrustMat: MeshBasicMaterial
}

const additive = (color: string, opacity: number, vertexColors = false): MeshBasicMaterial => new MeshBasicMaterial({
  color: new Color(color), vertexColors, transparent: true, opacity, blending: AdditiveBlending,
  depthWrite: false, side: DoubleSide, toneMapped: false
})

/** An open cone pointing down, white at the nozzle and black (= nothing,
 *  additively) at its tip: the thruster's flare needs no texture. */
const flare = (r: number, h: number): BufferGeometry => {
  const g = new CylinderGeometry(r, r * 0.25, h, 14, 3, true)
  g.deleteAttribute('uv')
  const pos = g.attributes.position!
  const col = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const k = 0.5 + pos.getY(i) / h // 1 at the nozzle, 0 at the tip
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = k * k
  }
  g.setAttribute('color', new Float32BufferAttribute(col, 3))
  g.translate(0, -h / 2, 0)
  return g
}

export const buildExitDrone = (): ExitDroneView => {
  const b = new RigBuilder()
  b.bone('body', null, [0, 0, 0])
  DRONE_ROTORS.forEach(([x, z], k) => b.bone(ROTOR_BONES[k]!, 'body', [x, 0.05, z]))

  // ── Deck: a rounded disc, the standing plate inset in it, a landing ring ──
  b.part('body', rcyl(DRONE_RIM_R - 0.02, 0.14, 0.05, 32), HULL, { p: [0, -0.07, 0] })
  b.part('body', rcyl(DRONE_DECK_R, 0.04, 0.015, 32), PLATE, { p: [0, DRONE_DECK_Y - 0.02, 0] })
  b.part('body', torus(0.4, 0.018, 4, 40), GLOW, { p: [0, DRONE_DECK_Y - 0.004, 0], r: [Math.PI / 2, 0, 0], glow: true, outline: false })
  // The glowing rim round the deck's edge
  b.part('body', torus(DRONE_RIM_R - 0.01, 0.03, 6, 48), GLOW, { p: [0, -0.04, 0], r: [Math.PI / 2, 0, 0], glow: true, outline: false })

  // ── Hull under the deck, a steel band, the thruster nozzle ──
  b.part('body', ell(0.54, 0.15, 0.54, 22, 12), HULL_DEEP, { p: [0, -0.1, 0] })
  b.part('body', torus(0.5, 0.028, 6, 32), METAL, { p: [0, -0.13, 0], r: [Math.PI / 2, 0, 0] })
  b.part('body', rcone(0.17, 0.12, 0.1, 0.03, 16), PLATE, { p: [0, -0.24, 0] })
  b.part('body', rcyl(0.1, 0.02, 0.008, 16), GLOW, { p: [0, -0.29, 0], glow: true, outline: false })

  // ── Arms, motor pods, rotor ducts ──
  DRONE_ROTORS.forEach(([x, z]) => {
    const a = Math.atan2(z, x)
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    b.part('body', cap(0.065, 0.42, 10, 3), HULL, { p: [ca * 0.64, -0.07, sa * 0.64], r: [0, -a, Math.PI / 2] })
    b.part('body', rcyl(0.11, 0.18, 0.05, 16), METAL, { p: [x, -0.03, z] })
    b.part('body', torus(DRONE_DUCT_R - 0.04, 0.04, 6, 32), HULL, { p: [x, 0.06, z], r: [Math.PI / 2, 0, 0] })
    // A spoke across the duct, square to the arm, holds the ring on its pod
    b.part('body', cap(0.018, (DRONE_DUCT_R - 0.06) * 2, 6, 2), METAL, { p: [x, 0.02, z], r: [0, -a + Math.PI / 2, Math.PI / 2], outline: false })
    // Nav lights on the outer side of each duct: port red, starboard green
    b.part('body', sph(0.042, 10, 8), x < 0 ? PAL.glowRed : PAL.glowGreen, {
      p: [ca * (DRONE_ARM_R + DRONE_DUCT_R), 0.06, sa * (DRONE_ARM_R + DRONE_DUCT_R)], glow: true, outline: false
    })
  })

  // ── Rotors: a hub and two crossed blades each (the blur disc is added below) ──
  for (const bone of ROTOR_BONES) {
    b.part(bone, sph(0.05, 10, 8), METAL)
    b.part(bone, ell(DRONE_DUCT_R - 0.1, 0.012, 0.05, 12, 6), BLADE, { p: [0, 0.025, 0], outline: false })
    b.part(bone, ell(0.05, 0.012, DRONE_DUCT_R - 0.1, 12, 6), BLADE, { p: [0, 0.025, 0], outline: false })
  }

  const rig = b.build({ outline: 0.018, height: 0.5 })
  const root = new Group()
  root.add(rig.root)

  // Motion blur: a faint disc filling each duct (radially even, so it needs
  // no turning; it rides the rotor bone only to sit where the rotor is).
  const discMat = additive('#e8f6ff', 0.16)
  const discGeo = new CircleGeometry(DRONE_DUCT_R - 0.08, 24)
  discGeo.deleteAttribute('uv')
  discGeo.rotateX(-Math.PI / 2)
  for (const bone of ROTOR_BONES) {
    const d = new Mesh(discGeo, discMat)
    d.position.y = 0.03
    d.renderOrder = 2
    rig.bones[bone]!.add(d)
  }

  // Landing lights round the rim, blinking together.
  const lightsMat = new MeshBasicMaterial({ vertexColors: true, toneMapped: false })
  const lights: BufferGeometry[] = []
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) / 8) * Math.PI * 2
    lights.push(xform(paint(sph(0.034, 8, 6), k % 2 ? '#ffffff' : PAL.glowYellow), [Math.cos(a) * (DRONE_RIM_R - 0.01), -0.1, Math.sin(a) * (DRONE_RIM_R - 0.01)]))
  }
  const body = rig.bones.body!
  body.add(new Mesh(merge(lights), lightsMat))

  // The thruster's flare under the nozzle.
  const thrustMat = additive(GLOW, 0.5, true)
  const thrust = new Mesh(flare(0.1, 0.5), thrustMat)
  thrust.position.y = -0.3
  thrust.renderOrder = 2
  body.add(thrust)

  return { root, rig, discMat, lightsMat, thrustMat }
}

/**
 * One frame of the drone: the body tilted (pitch about its X, roll about its
 * Z, radians, in its own frame), the rotors at `spin` (alternate ones turn
 * the other way), the thruster at `thrust` 0..1, the lights blinking on `t`.
 */
export const poseExitDrone = (v: ExitDroneView, t: number, spin: number, pitch: number, roll: number, thrust: number): void => {
  pose(v.rig, 'body', pitch, 0, roll)
  for (let k = 0; k < 4; k++) pose(v.rig, ROTOR_BONES[k]!, 0, (k % 2 ? -spin : spin) + k * 0.7, 0)
  const th = Math.max(0, Math.min(1, thrust))
  v.discMat.opacity = 0.1 + 0.1 * th
  v.thrustMat.opacity = 0.3 + 0.6 * th
  v.lightsMat.color.setScalar(Math.sin(t * 7) > 0.3 ? 1 : 0.2)
  v.rig.glowMaterial.color.setScalar(0.82 + 0.18 * Math.sin(t * 3.4))
}
