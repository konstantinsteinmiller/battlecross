import { Color, Group, Mesh, MeshToonMaterial, type BufferGeometry, type Object3D } from 'three'
import { rock, rbox, paint, paintBy } from '../models/kit'
import { toonRamp, toonVC, outlineMat } from '../models/toon'
import { isSolidAt, floorAt, type Nav } from '../world/nav'

/**
 * ─── Rubble: the crate golem's stones and splinters ──────────────────────────
 *
 * Real meshes, pooled (a glow sprite does not read as a rock): the stones a
 * golem throws, which ride their Shot until it ends, and the debris of a
 * golem's death — planks in its crate's wood and trim, chips of its stone —
 * tossed out, tumbling, bouncing once or twice and shrinking away. All of it
 * is built with the mission, so a throw or a death allocates nothing, and it
 * draws with the vertex-coloured toon program every prop already uses (a
 * plank's wood is its own material's `color` over white vertices), so nothing
 * compiles mid-fight either.
 */

const STONE_TOP = new Color('#a39d90')
const STONE_LOW = new Color('#6a645a')
/** Stones (small = the thrown rock, big = the lobbed boulder) and debris bits. */
const SMALL_R = 0.19
const BIG_R = 0.34
const STONES_SMALL = 6
const STONES_BIG = 3
const PLANKS = 14
const CHIPS = 12
const GRAVITY = 16

/** A stone painted lighter on top, darker below (reads as a lit rock under
 *  the toon ramp). `paintBy` reads each returned colour at once, so one
 *  scratch colour serves every vertex. */
const stoneGeo = (r: number, seed: number): BufferGeometry => {
  const c = new Color()
  return paintBy(rock(r, seed), (_x, y) => c.copy(STONE_LOW).lerp(STONE_TOP, Math.min(1, Math.max(0, 0.5 + y / (1.6 * r)))))
}

interface Stone {
  g: Group
  big: boolean
  used: boolean
}

interface Bit {
  m: Mesh
  /** Planks carry their own material (the wood colour changes per golem). */
  mat: MeshToonMaterial | null
  on: boolean
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  sx: number
  sy: number
  sz: number
  t: number
  life: number
  /** Height of its centre when it lies on the floor. */
  rest: number
}

export class Rubble {
  readonly root = new Group()
  private stones: Stone[] = []
  private planks: Bit[] = []
  private chips: Bit[] = []
  private smallGeo = stoneGeo(SMALL_R, 5)
  private bigGeo = stoneGeo(BIG_R, 9)
  private plankGeo = paint(rbox(0.46, 0.07, 0.15, 0.3), '#ffffff')
  private chipGeo = stoneGeo(0.09, 13)
  private nextPlank = 0
  private nextChip = 0

  constructor(parent: Object3D) {
    parent.add(this.root)
    for (let i = 0; i < STONES_SMALL; i++) this.makeStone(false)
    for (let i = 0; i < STONES_BIG; i++) this.makeStone(true)
    for (let i = 0; i < PLANKS; i++) {
      const mat = new MeshToonMaterial({ vertexColors: true, gradientMap: toonRamp() })
      this.planks.push(this.makeBit(new Mesh(this.plankGeo, mat), mat, 0.035))
    }
    for (let i = 0; i < CHIPS; i++) this.chips.push(this.makeBit(new Mesh(this.chipGeo, toonVC()), null, 0.07))
  }

  private makeStone(big: boolean): Stone {
    const geo = big ? this.bigGeo : this.smallGeo
    const g = new Group()
    const body = new Mesh(geo, toonVC())
    const outline = new Mesh(geo, outlineMat(big ? 0.03 : 0.022))
    outline.renderOrder = -1
    g.add(body, outline)
    g.visible = false
    this.root.add(g)
    const s: Stone = { g, big, used: false }
    this.stones.push(s)
    return s
  }

  private makeBit(m: Mesh, mat: MeshToonMaterial | null, rest: number): Bit {
    m.visible = false
    this.root.add(m)
    return { m, mat, on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, sx: 0, sy: 0, sz: 0, t: 0, life: 1, rest }
  }

  /** A stone for a thrown rock (big: the boulder). Give it back with `drop`. */
  stone(big: boolean): Object3D {
    let s: Stone | undefined
    for (const x of this.stones) {
      if (!x.used && x.big === big) { s = x; break }
    }
    // Every stone in the air at once: one more (never expected in play)
    s ??= this.makeStone(big)
    s.used = true
    s.g.visible = true
    s.g.rotation.set(Math.random() * 6, Math.random() * 6, 0)
    return s.g
  }

  drop(o: Object3D): void {
    for (const s of this.stones) {
      if (s.g === o) {
        s.used = false
        s.g.visible = false
        return
      }
    }
  }

  private toss(b: Bit, x: number, y: number, z: number, speed: number, up: number, life: number): void {
    const a = Math.random() * Math.PI * 2
    const sp = speed * (0.5 + Math.random() * 0.7)
    b.on = true
    b.x = x + Math.cos(a) * 0.25
    b.y = y + (Math.random() - 0.5) * 0.4
    b.z = z + Math.sin(a) * 0.25
    b.vx = Math.cos(a) * sp
    b.vz = Math.sin(a) * sp
    b.vy = up * (0.6 + Math.random() * 0.7)
    b.sx = (Math.random() - 0.5) * 18
    b.sy = (Math.random() - 0.5) * 12
    b.sz = (Math.random() - 0.5) * 18
    b.t = 0
    b.life = life * (0.8 + Math.random() * 0.4)
    b.m.visible = true
    b.m.scale.setScalar(1)
    b.m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6)
    b.m.position.set(b.x, b.y, b.z)
  }

  /** A golem breaks apart: planks in its wood and trim, chips of its stone. */
  burst(x: number, y: number, z: number, wood: string, trim: string, planks = 9, chips = 7): void {
    for (let k = 0; k < planks; k++) {
      const b = this.planks[this.nextPlank]!
      this.nextPlank = (this.nextPlank + 1) % this.planks.length
      b.mat!.color.set(k % 3 === 2 ? trim : wood)
      this.toss(b, x, y, z, 5.5, 7, 1.7)
    }
    this.scatter(x, y, z, chips, 4.5, 6, 1.4)
  }

  /** A rock crumbling where it lands. */
  crumble(x: number, y: number, z: number, n = 4): void {
    this.scatter(x, Math.max(0.15, y), z, n, 3, 4.5, 0.9)
  }

  private scatter(x: number, y: number, z: number, n: number, speed: number, up: number, life: number): void {
    for (let k = 0; k < n; k++) {
      const b = this.chips[this.nextChip]!
      this.nextChip = (this.nextChip + 1) % this.chips.length
      this.toss(b, x, y, z, speed, up, life)
    }
  }

  update(dt: number, nav: Nav): void {
    this.step(this.planks, dt, nav)
    this.step(this.chips, dt, nav)
  }

  private step(bits: Bit[], dt: number, nav: Nav): void {
    for (const b of bits) {
      if (!b.on) continue
      b.t += dt
      if (b.t >= b.life) {
        b.on = false
        b.m.visible = false
        continue
      }
      b.vy -= GRAVITY * dt
      const nx = b.x + b.vx * dt
      const nz = b.z + b.vz * dt
      // Walls: knock it back rather than through into the next room
      if (isSolidAt(nav, nx, nz)) {
        b.vx *= -0.3
        b.vz *= -0.3
      } else {
        b.x = nx
        b.z = nz
      }
      b.y += b.vy * dt
      // The floor under it (the climb's ledges; 0 on a flat map, a pit's −60 floor at worst)
      const rest = Math.max(-60, floorAt(nav, b.x, b.z, b.y)) + b.rest
      if (b.y < rest) {
        b.y = rest
        b.vy = b.vy < -1.5 ? -b.vy * 0.35 : 0
        b.vx *= 0.55
        b.vz *= 0.55
        b.sx *= 0.5
        b.sy *= 0.5
        b.sz *= 0.5
      }
      b.m.rotation.x += b.sx * dt
      b.m.rotation.y += b.sy * dt
      b.m.rotation.z += b.sz * dt
      b.m.position.set(b.x, b.y, b.z)
      // Shrink away over the last 0.35 s
      const left = b.life - b.t
      b.m.scale.setScalar(left < 0.35 ? Math.max(0.001, left / 0.35) : 1)
    }
  }

  clear(): void {
    for (const s of this.stones) {
      s.used = false
      s.g.visible = false
    }
    for (const b of this.planks) { b.on = false; b.m.visible = false }
    for (const b of this.chips) { b.on = false; b.m.visible = false }
  }
}
