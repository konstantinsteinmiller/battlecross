import {
  Group, Mesh, MeshBasicMaterial, PlaneGeometry, AdditiveBlending, DoubleSide, Color, type BufferGeometry
} from 'three'
import { rcyl, rbox, torus, sph, cap, xform, paint, paintBy, merge } from './kit'
import { toonVC, glowVC, outlineMat } from './toon'
import { PAL } from './palette'
import { makeBlobShadow } from '../fx/markers'
import type { Particles, ParticleSpec } from '../fx/particles'
import type { Theme } from '../world/themes'
import { CELL, WALL_H } from '../world/levelGen'
import {
  BLADE_AMP, BLADE_ARM, BLADE_HALF_W, FLAME_HALF, type TrapSpot, type TrapState, type TrapView
} from '../sim/traps'

/**
 * ─── Trap meshes ─────────────────────────────────────────────────────────────
 *
 * Built in a local frame — X across the corridor (walls at ±1.5 m), Z along
 * it — and turned onto the corridor. Static parts are one toon mesh plus its
 * outline; everything that glows or flickers uses the mission marker's exact
 * additive material parameters (or the door lamps' plain glow), so no trap
 * ever compiles a program of its own mid-mission. Fire is the mission's pooled
 * `Particles`, emitted through ONE scratch spec (no allocation per spark), and
 * only while the trap's room is drawn.
 */

export interface TrapMesh extends TrapView {
  root: Group
}

/** The walk marker's parameters: the same (precompiled) program. */
const addMat = (hex: string): MeshBasicMaterial => new MeshBasicMaterial({
  color: new Color(hex), transparent: true, opacity: 0, blending: AdditiveBlending,
  depthWrite: false, side: DoubleSide, toneMapped: false
})

const assemble = (toonParts: BufferGeometry[], glowParts: BufferGeometry[], outline = 0.025): Group => {
  const g = new Group()
  if (toonParts.length) {
    const geo = merge(toonParts)
    g.add(new Mesh(geo, toonVC()))
    const o = new Mesh(geo, outlineMat(outline))
    o.renderOrder = -1
    g.add(o)
  }
  if (glowParts.length) g.add(new Mesh(merge(glowParts), glowVC()))
  return g
}

const HALF = CELL / 2
/** Nozzle heights (m): a column of three makes a SHEET, not a jet. */
const NOZZLE_Y = [0.45, 1.15, 1.85] as const

// Fire colours as Color objects: a hex string would be parsed per spark.
const FIRE = [new Color('#fff27a'), new Color('#ffb04a'), new Color('#ff6a2a')] as const
const SPARK = new Color('#ffd27a')
const EMBER = new Color('#ff7a3a')
// Pilot-light tones (linear scratch set per sync, never allocated).
const PILOT_IDLE = new Color('#8a4a1c')
const PILOT_OFF = new Color('#2e2622')
const PILOT_HOT = new Color('#fff3c4')
const PILOT_WARN = new Color('#ffb04a')
const PLATE_ARMED = new Color(PAL.glowRed)

/** A flame jet (or the tutorial's pressure plate, which is one with a plate). */
const buildFlame = (spot: TrapSpot, theme: Theme, fx: Particles): TrapMesh => {
  const root = new Group()
  const sides: Array<1 | -1> = spot.side === 0 ? [1, -1] : [spot.side]
  const toon: BufferGeometry[] = []
  const pilotGeo: BufferGeometry[] = []
  for (const s of sides) {
    const wx = s * (HALF - 0.16)
    // The housing: a rounded block on the wall, hazard-striped along its edge.
    toon.push(xform(paint(rbox(0.34, 2.3, 0.86, 0.3), theme.pilaster), [wx, 1.2, 0]))
    toon.push(paintBy(
      xform(rbox(0.38, 2.36, 0.22, 0.3), [wx, 1.2, 0.36]),
      (_x, y) => (Math.floor(y * 3) & 1 ? theme.hazard : theme.crateTrim)
    ))
    toon.push(paintBy(
      xform(rbox(0.38, 2.36, 0.22, 0.3), [wx, 1.2, -0.36]),
      (_x, y) => (Math.floor(y * 3) & 1 ? theme.hazard : theme.crateTrim)
    ))
    for (const y of NOZZLE_Y) {
      // A stubby nozzle pointing across, a ring of pilot light at its mouth.
      toon.push(xform(paint(rcyl(0.15, 0.3, 0.05, 14), PAL.gunmetal), [s * (HALF - 0.38), y, 0], [0, 0, Math.PI / 2]))
      pilotGeo.push(xform(paint(torus(0.1, 0.035, 6, 14), '#ffffff'), [s * (HALF - 0.54), y, 0], [0, Math.PI / 2, 0]))
    }
  }
  // Scorch on the floor under the sheet: the corridor remembers every burst.
  toon.push(xform(paint(rbox(CELL - 0.3, 0.03, FLAME_HALF * 2, 0.2), '#3a302a'), [0, 0.012, 0]))
  let plateGeo: BufferGeometry | null = null
  if (spot.plate) {
    toon.push(xform(paint(rcyl(1.05, 0.07, 0.03, 28), theme.crateTrim), [0, 0.04, 0]))
    toon.push(xform(paint(torus(0.98, 0.05, 6, 28), theme.hazard), [0, 0.08, 0], [Math.PI / 2, 0, 0]))
    plateGeo = xform(paint(rcyl(0.62, 0.05, 0.02, 24), '#ffffff'), [0, 0.085, 0])
  }
  root.add(assemble(toon, []))
  const pilotMat = new MeshBasicMaterial({ color: PILOT_IDLE.clone(), toneMapped: false })
  root.add(new Mesh(merge(pilotGeo), pilotMat))
  let plateMat: MeshBasicMaterial | null = null
  let plate: Mesh | null = null
  if (plateGeo) {
    plateMat = new MeshBasicMaterial({ color: PLATE_ARMED.clone(), toneMapped: false })
    plate = new Mesh(plateGeo, plateMat)
    root.add(plate)
  }
  // The warning strip: lights up across the floor before every burst.
  const stripMat = addMat(PAL.glowOrange)
  const strip = new Mesh(new PlaneGeometry(CELL - 0.4, FLAME_HALF * 1.8), stripMat)
  strip.rotation.x = -Math.PI / 2
  strip.position.y = 0.035
  root.add(strip)
  // The sheet: three layered curtains, hottest in the middle. Built visible
  // (opacity 0) so the precompile sees them; the first step hides them until
  // they burn.
  const sheet = new Group()
  const layers: Array<{ mat: MeshBasicMaterial; mesh: Mesh; base: number; h: number }> = []
  for (const [hex, h, base] of [['#ff5a1f', 2.7, 0.3], ['#ffa23a', 2.1, 0.4], ['#fff27a', 1.35, 0.5]] as const) {
    const mat = addMat(hex)
    const mesh = new Mesh(new PlaneGeometry(CELL - 0.2, h), mat)
    mesh.position.y = h / 2 + 0.05
    sheet.add(mesh)
    layers.push({ mat, mesh, base, h })
  }
  root.add(sheet)

  // Local → world for particle velocities (the root is turned onto the axis).
  const ax = spot.axis === 'x' ? 0 : 1 // world x of local +X
  const az = spot.axis === 'x' ? -1 : 0 // world z of local +X
  const spec: ParticleSpec = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, color: FIRE[0], size: 0.5, sizeEnd: 0.1, life: 0.3, gravity: 0, drag: 0 }
  const emitLocal = (lx: number, y: number, lz: number, vlx: number, vy: number, vlz: number, color: Color, size: number, sizeEnd: number, life: number, gravity = 0, drag = 0): void => {
    spec.x = spot.x + lx * ax + lz * (spot.axis === 'x' ? 1 : 0)
    spec.z = spot.z + lx * az + lz * (spot.axis === 'x' ? 0 : 1)
    spec.y = y
    spec.vx = vlx * ax + vlz * (spot.axis === 'x' ? 1 : 0)
    spec.vz = vlx * az + vlz * (spot.axis === 'x' ? 0 : 1)
    spec.vy = vy
    spec.color = color
    spec.size = size
    spec.sizeEnd = sizeEnd
    spec.life = life
    spec.gravity = gravity
    spec.drag = drag
    fx.emit(spec)
  }

  let fireAcc = 0
  let sparkAcc = 0
  const view: TrapMesh = {
    root,
    get shown(): boolean {
      return !root.parent || root.parent.visible
    },
    sync(s: TrapState, dt: number, time: number): void {
      const burning = s.stage === 'burn'
      const warn = s.stage === 'warn'
      // Pilot lights: dim at rest, dark when parked or spent, pulsing hot in
      // the warning, white-hot while it burns.
      const pc = pilotMat.color
      if (burning) pc.copy(PILOT_HOT)
      else if (warn) pc.copy(PILOT_WARN).lerp(PILOT_HOT, 0.5 + 0.5 * Math.sin(time * 26))
      else if (s.stage === 'cool') pc.copy(PILOT_WARN).lerp(PILOT_IDLE, s.k)
      else if (s.parked || s.stage === 'spent') pc.copy(PILOT_OFF)
      else pc.copy(PILOT_IDLE)
      stripMat.opacity = warn ? 0.18 + 0.32 * s.k * (0.6 + 0.4 * Math.sin(time * 22)) : burning ? 0.6 : s.stage === 'cool' ? 0.35 * (1 - s.k) : 0
      // Once live, a layer with nothing to show is not drawn at all (it was
      // in the scene for the precompile; its program is the marker's anyway).
      strip.visible = stripMat.opacity > 0.003
      // The curtains: up fast, a live flicker, then gone.
      const rise = burning ? Math.min(1, s.k * 7) : 0
      sheet.visible = rise > 0
      for (let k = 0; k < layers.length; k++) {
        const L = layers[k]!
        const flick = 0.75 + 0.25 * Math.sin(time * (31 + k * 7) + k * 1.7)
        L.mat.opacity = L.base * rise * flick
        L.mesh.scale.y = 0.2 + 0.8 * rise * (0.9 + 0.1 * Math.sin(time * 19 + k))
        L.mesh.position.y = L.h * L.mesh.scale.y / 2 + 0.05
      }
      if (plate && plateMat) {
        plate.position.y = s.stage === 'idle' ? 0 : -0.035
        if (s.stage === 'idle') plateMat.color.copy(PLATE_ARMED).multiplyScalar(0.55 + 0.45 * Math.sin(time * 3.2))
        else if (burning) plateMat.color.copy(PILOT_HOT)
        else plateMat.color.copy(PILOT_OFF)
      }
      // Fire and sparks, only where someone can see them.
      if (!view.shown || dt <= 0) return
      if (burning) {
        fireAcc += dt * 55
        while (fireAcc >= 1) {
          fireAcc -= 1
          for (const sd of sides) {
            const y = NOZZLE_Y[Math.floor(Math.random() * 3)]! + (Math.random() - 0.5) * 0.2
            const sp = 7 + Math.random() * 4
            emitLocal(sd * (HALF - 0.55), y, (Math.random() - 0.5) * 0.3, -sd * sp, 0.6 + Math.random() * 1.4, (Math.random() - 0.5) * 1.4,
              FIRE[Math.floor(Math.random() * 3)]!, 0.55 + Math.random() * 0.35, 1.1, 0.24 + Math.random() * 0.14, -1.5, 1.2)
          }
        }
      } else if (warn) {
        sparkAcc += dt * (8 + 20 * s.k)
        while (sparkAcc >= 1) {
          sparkAcc -= 1
          const sd = sides[Math.floor(Math.random() * sides.length)]!
          const y = NOZZLE_Y[Math.floor(Math.random() * 3)]!
          emitLocal(sd * (HALF - 0.56), y, 0, -sd * (1.5 + Math.random() * 2.5), 1 + Math.random() * 2, (Math.random() - 0.5) * 2, SPARK, 0.12, 0.02, 0.3, 9, 1.5)
        }
      } else if (s.stage === 'cool' && Math.random() < dt * 14) {
        const sd = sides[Math.floor(Math.random() * sides.length)]!
        emitLocal(sd * (HALF - 0.6), NOZZLE_Y[1] + (Math.random() - 0.5), 0, -sd * 0.4, 0.9, 0, EMBER, 0.22, 0.05, 0.6)
      } else {
        fireAcc = 0
        sparkAcc = 0
      }
    }
  }
  return view
}

/** A pendulum blade on a gantry over the walls, swinging across the passage. */
const buildBlade = (spot: TrapSpot, theme: Theme): TrapMesh => {
  const root = new Group()
  const pivotY = WALL_H + 0.4
  // The gantry: a hazard-striped beam from wall top to wall top, on two feet.
  const beam = paintBy(
    xform(rbox(CELL + 0.7, 0.36, 0.44, 0.35), [0, pivotY, 0]),
    (x) => (Math.floor((x + 3) * 2.4) & 1 ? theme.hazard : theme.crateTrim)
  )
  const gantry = [
    beam,
    xform(paint(rbox(0.5, 0.5, 0.66, 0.4), theme.pilaster), [HALF + 0.05, WALL_H + 0.18, 0]),
    xform(paint(rbox(0.5, 0.5, 0.66, 0.4), theme.pilaster), [-HALF - 0.05, WALL_H + 0.18, 0]),
    xform(paint(sph(0.28, 14, 10), PAL.gunmetal), [0, pivotY, 0]),
    xform(paint(torus(0.3, 0.06, 6, 18), PAL.steelDark), [0, pivotY, 0])
  ]
  root.add(assemble(gantry, [xform(paint(sph(0.09, 8, 6), PAL.glowRed), [0, pivotY + 0.3, 0])]))
  // The swinging part, built hanging straight down from the pivot. The blade
  // is an arc of a circle round the pivot, so its edge rides the swing itself.
  const swing = new Group()
  swing.position.y = pivotY
  const arc = (BLADE_HALF_W * 2) / BLADE_ARM
  const turn = -Math.PI / 2 - arc / 2
  const blade = xform(paint(torus(BLADE_ARM, 0.17, 8, 10, arc), PAL.steel), [0, 0, 0], [0, 0, turn], [1, 1, 0.3])
  const swingToon = [
    xform(paint(cap(0.07, BLADE_ARM - 0.45, 8, 2), PAL.steelDark), [0, -(BLADE_ARM - 0.3) / 2, 0]),
    xform(paint(sph(0.14, 12, 8), PAL.gunmetal), [0, -(BLADE_ARM - 0.2), 0]),
    blade
  ]
  const edge = xform(paint(torus(BLADE_ARM + 0.15, 0.035, 6, 10, arc), PAL.glowRed), [0, 0, 0], [0, 0, turn])
  swing.add(assemble(swingToon, [edge], 0.02))
  root.add(swing)
  // Where it swings: a red line across the floor, brightest as it comes down,
  // and its shadow running along it.
  const lineMat = addMat(PAL.glowRed)
  const line = new Mesh(new PlaneGeometry(CELL - 0.3, 0.22), lineMat)
  line.rotation.x = -Math.PI / 2
  line.position.y = 0.03
  root.add(line)
  const shadow = makeBlobShadow(0.42)
  root.add(shadow)
  const view: TrapMesh = {
    root,
    get shown(): boolean {
      return !root.parent || root.parent.visible
    },
    sync(s: TrapState): void {
      swing.rotation.z = s.angle
      const low = 1 - Math.min(1, Math.abs(s.angle) / BLADE_AMP)
      lineMat.opacity = s.parked ? 0.08 : 0.12 + 0.5 * low * low
      shadow.position.set(BLADE_ARM * Math.sin(s.angle), 0.02, 0)
      shadow.scale.setScalar(0.34 + 0.12 * low)
    }
  }
  return view
}

/** The meshes for one trap: hang `root` under the corridor's room group. */
export const buildTrapView = (spot: TrapSpot, theme: Theme, fx: Particles): TrapMesh => {
  const v = spot.kind === 'blade' ? buildBlade(spot, theme) : buildFlame(spot, theme, fx)
  v.root.position.set(spot.x, 0, spot.z)
  v.root.rotation.y = spot.axis === 'x' ? Math.PI / 2 : 0
  return v
}
