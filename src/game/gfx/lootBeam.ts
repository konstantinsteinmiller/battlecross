import {
  AdditiveBlending, BufferAttribute, Color, CylinderGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, NormalBlending,
  type BufferGeometry
} from 'three'
import { TIER_COLOR } from '../data/items'
import { groundAt } from './ground'
import { SHAPE, type Particles, type Sprites } from './particles'

/**
 * ─── Loot beams (roadmap #5) ─────────────────────────────────────────────────
 *
 * Where an item drops, a column of light in its tier's colour rises out of
 * the ground and stands there a moment: the find is seen across the field
 * before its name is read. The tiers climb in height, width, time and spark:
 *
 *   T1–2  a slim beam, a few motes
 *   T3    taller, a ring of sparks at its foot
 *   T4–5  a wide glow round the core and a second ring
 *   T6    the legendary: gold, the tallest, stars twinkling up its length
 *
 * Two open cylinders per beam (a bright additive core and a tinted glow laid
 * over the scene) whose vertex alpha fades to nothing at the top, never
 * writing depth —
 * nothing to z-fight with. A small pool; a seventh beam reuses the oldest.
 */

interface Beam {
  core: Mesh
  glow: Mesh
  coreMat: MeshBasicMaterial
  glowMat: MeshBasicMaterial
  x: number
  z: number
  tier: number
  h: number
  t: number
  dur: number
  active: boolean
  spark: number
}

const POOL = 6
const WHITE = new Color('#ffffff')

/** A tube whose alpha runs 1 at the foot to 0 at the top. */
const fadeTube = (): BufferGeometry => {
  const g = new CylinderGeometry(1, 1, 1, 14, 6, true)
  g.translate(0, 0.5, 0)
  const pos = g.getAttribute('position')
  const col = new Float32Array(pos.count * 4)
  for (let i = 0; i < pos.count; i++) {
    const v = pos.getY(i)
    col[i * 4] = col[i * 4 + 1] = col[i * 4 + 2] = 1
    col[i * 4 + 3] = Math.pow(1 - v, 1.6)
  }
  g.setAttribute('color', new BufferAttribute(col, 4))
  return g
}

const mat = (additive: boolean): MeshBasicMaterial => new MeshBasicMaterial({
  color: 0xffffff, vertexColors: true, transparent: true, depthWrite: false, side: DoubleSide, toneMapped: false,
  blending: additive ? AdditiveBlending : NormalBlending
})

/** Height, glow radius and life by tier. */
export const beamShape = (tier: number): { h: number; r: number; dur: number } => ({
  h: 2.6 + tier * 0.55,
  r: 0.16 + tier * 0.04,
  dur: 1.9 + tier * 0.45
})

export class LootBeams {
  readonly root = new Group()
  private geo = fadeTube()
  private beams: Beam[] = []
  private time = 0

  constructor(private particles: Particles, private sprites: Sprites, private low: boolean) {}

  /** Raise a beam for an item of `tier` (1..6) dropped at (x, z). */
  add(x: number, z: number, tier: number): void {
    const t = Math.max(1, Math.min(6, Math.round(tier)))
    let b = this.beams.find(q => !q.active)
    if (!b && this.beams.length < POOL) {
      // The glow is laid over the ground, not added to it: on bright grass or
      // snow an added colour turns white, and the tier is the whole point.
      const coreMat = mat(true)
      const glowMat = mat(false)
      const core = new Mesh(this.geo, coreMat)
      const glow = new Mesh(this.geo, glowMat)
      core.renderOrder = 7
      glow.renderOrder = 6
      core.frustumCulled = glow.frustumCulled = false
      this.root.add(glow, core)
      b = { core, glow, coreMat, glowMat, x, z, tier: t, h: 1, t: 0, dur: 1, active: false, spark: 0 }
      this.beams.push(b)
    }
    if (!b) b = this.beams.reduce((a, q) => (q.t / q.dur > a.t / a.dur ? q : a))
    const s = beamShape(t)
    const c = TIER_COLOR[t] ?? '#ffffff'
    Object.assign(b, { x, z, tier: t, h: s.h, t: 0, dur: s.dur, active: true, spark: 0 })
    b.glowMat.color.set(c)
    // The core is the tier's colour washed towards white: hot, but still its hue.
    b.coreMat.color.set(c).lerp(WHITE, 0.12)
    const y = groundAt(x, z)
    b.core.position.set(x, y, z)
    b.glow.position.set(x, y, z)
    b.core.visible = b.glow.visible = true
    this.burst(b)
  }

  private burst(b: Beam): void {
    const c = TIER_COLOR[b.tier] ?? '#ffffff'
    const ps = this.particles
    const n = (k: number): number => (this.low ? Math.max(2, Math.round(k * 0.5)) : k)
    // Motes thrown up the column.
    for (let k = 0; k < n(6 + b.tier * 3); k++) {
      const a = Math.random() * Math.PI * 2
      const sp = 0.6 + Math.random() * 1.2
      ps.emit({ x: b.x, y: 0.2, z: b.z, vx: Math.cos(a) * sp, vy: 3 + Math.random() * (2 + b.tier), vz: Math.sin(a) * sp, color: Math.random() < 0.35 ? '#ffffff' : c, size: 0.2 + b.tier * 0.03, sizeEnd: 0.04, life: 0.8 + Math.random() * 0.5, drag: 0.8 })
    }
    if (b.tier >= 3) ps.riseRing(b.x, 0.1, b.z, c, 0.7 + b.tier * 0.1, n(10 + b.tier * 2))
    if (b.tier >= 4) ps.riseRing(b.x, 0.1, b.z, '#ffffff', 0.45, n(8))
    // A flare at the foot.
    this.sprites.emit({ x: b.x, y: 0.35, z: b.z, color: c, size: 1 + b.tier * 0.25, sizeEnd: 0.2, life: 0.45, shape: SHAPE.star, spin: 2, hold: 0.1 })
  }

  update(dt: number): void {
    this.time += dt
    for (const b of this.beams) {
      if (!b.active) continue
      b.t += dt
      if (b.t >= b.dur) { b.active = false; b.core.visible = b.glow.visible = false; continue }
      const s = beamShape(b.tier)
      // Rises out of the ground (ease-out), stands, thins away at the end.
      const rise = 1 - Math.pow(1 - Math.min(1, b.t / 0.32), 3)
      const out = Math.min(1, (b.dur - b.t) / 0.7)
      const legend = b.tier >= 6
      const flick = legend ? 0.82 + 0.18 * Math.sin(this.time * 23 + Math.sin(this.time * 7) * 3) : 1
      const breathe = 1 + 0.06 * Math.sin(this.time * 6)
      const r = s.r * (0.6 + 0.4 * out) * breathe
      b.glow.scale.set(r, b.h * rise, r)
      b.core.scale.set(r * 0.3, b.h * rise * 1.04, r * 0.32)
      b.glowMat.opacity = (0.34 + b.tier * 0.04) * out * flick
      b.coreMat.opacity = (0.45 + b.tier * 0.04) * out * flick
      b.glow.rotation.y += dt * 1.4
      // Sparks keep drifting up while it stands; the legendary's are stars.
      b.spark += dt * (this.low ? 4 : 9) * (0.5 + b.tier * 0.25) * out
      while (b.spark >= 1) {
        b.spark -= 1
        const a = Math.random() * Math.PI * 2
        const d = r * (0.4 + Math.random() * 0.8)
        const x = b.x + Math.cos(a) * d
        const z = b.z + Math.sin(a) * d
        if (legend) {
          this.sprites.emit({ x, y: 0.3 + Math.random() * b.h * 0.6, z, vy: 1.4 + Math.random() * 1.6, color: Math.random() < 0.5 ? '#ffffff' : '#ffe58a', size: 0.3 + Math.random() * 0.25, sizeEnd: 0.02, life: 0.7 + Math.random() * 0.4, shape: SHAPE.star, spin: 4, hold: 0.3 })
        } else {
          this.particles.emit({ x, y: 0.15, z, vy: 1.8 + Math.random() * (1 + b.tier * 0.5), color: TIER_COLOR[b.tier] ?? '#ffffff', size: 0.18, sizeEnd: 0.03, life: 0.9 })
        }
      }
    }
  }

  clear(): void {
    for (const b of this.beams) { b.active = false; b.core.visible = b.glow.visible = false }
  }

  dispose(): void {
    this.geo.dispose()
    for (const b of this.beams) { b.coreMat.dispose(); b.glowMat.dispose() }
  }
}

