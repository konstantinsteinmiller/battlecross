import { BufferGeometry, Color, Float32BufferAttribute, Group, InstancedMesh, Matrix4, Mesh, Quaternion, Vector3 } from 'three'
import { CELL } from '../sim/grid'
import { ARENA_STANDS_R, type ZonePlan } from '../sim/zoneGen'
import { mulberry32 } from '../sim/rng'
import { celVC, celVCInst, outlineMat } from './cel'
import { lathe, merge, paint, paintBy, pose, rbox, rcyl, sph, xform } from './kit'
import { buildHumanoid, type Look } from './rigs/humanoid'
import { LOOKS } from './rigs/looks'
import type { Particles } from './particles'

/**
 * ─── The colosseum's spectacle (roadmap #117) ──────────────────────────────
 *
 * Stone stands climbing away behind the wall: ONE lathe, so the tiers are whole rings (no block ever leaves a wedge of dark ground
 * between its neighbours), a crimson and gold frieze with banners
 * hung from the cornice, pennants on the rim. The crowd is instanced, one mesh per coat and pose. It watches the fight: the stands
 * nearest the hero rise to their feet, turn to him and cheer, the more the nearer he comes to the wall and the more a wave is
 * being fought; a kill pulses the seats beside it; a won wave sets the whole house off.
 */

const COATS = ['#d8584a', '#4a8ad8', '#e8c040', '#6ac06a', '#b86ad8', '#e88a3a']
const SKIN = ['#f0c8a0', '#d8a078', '#a87050', '#e8b890', '#c89a70']
const HAIR = ['#3a2a20', '#7a4a2a', '#c8a050', '#b8642a', '#2a2028', '#d8d0c0']
/** The folk of the towns, dressed in the crowd's coats: each variant is one of the town looks with its own coat, skin and hair. */
const FOLK = ['villager', 'villagerF', 'farmer', 'merchantF', 'villager', 'villagerF'] as const

/**
 * One spectator as a STATIC mesh: the town folk's own chibi (`rigs/humanoid.ts`, the lowest detail), posed once on its bones (arms down,
 * or an arm up in a cheer) and baked to plain geometry, so the stands hold figures that look like the people of the towns, drawn
 * instanced (a few hundred of them for a handful of draw calls).
 */
const bakeFan = (look: Look, cheer: boolean): BufferGeometry => {
  const r = buildHumanoid(look, 0)
  if (cheer) {
    pose(r, 'armR', -2.7, 0, 0.25)
    pose(r, 'foreR', -0.35, 0, 0)
    pose(r, 'armL', 0.1, 0, -0.15)
  } else {
    pose(r, 'armL', 0.05, 0, -0.08)
    pose(r, 'armR', 0.05, 0, 0.08)
  }
  r.root.updateMatrixWorld(true)
  r.mesh.skeleton.update()
  const src = r.mesh.geometry
  const n = src.attributes.position!.count
  const pos = new Float32Array(n * 3)
  const nor = new Float32Array(n * 3)
  const skinIndex = src.attributes.skinIndex!
  const bm = r.mesh.skeleton.boneMatrices!
  const v = new Vector3()
  const nv = new Vector3()
  const m = new Matrix4()
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(src.attributes.position!, i)
    r.mesh.applyBoneTransform(i, v)
    pos.set([v.x, v.y, v.z], i * 3)
    m.fromArray(bm, skinIndex.getX(i) * 16)
    nv.fromBufferAttribute(src.attributes.normal!, i).transformDirection(m)
    nor.set([nv.x, nv.y, nv.z], i * 3)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3))
  if (src.attributes.color) g.setAttribute('color', src.attributes.color.clone())
  if (src.index) g.setIndex(src.index.clone())
  r.mesh.geometry.dispose()
  return g
}
const _m = new Matrix4()
const _q = new Quaternion()
const _qr = new Quaternion()
const _p = new Vector3()
const _s = new Vector3()
const _up = new Vector3(0, 1, 0)
const _fwd = new Vector3(0, 0, 1)

/** The stands' tiers: the podium (where the first row stands) then each tread a step higher and further out. */
const R0 = ARENA_STANDS_R
const TIER_W = 1.9
const TIER_RISE = 0.85
const TIERS = 4
const Y0 = 2.45
const tierTop = (t: number): number => Y0 + t * TIER_RISE
const tierIn = (t: number): number => R0 + t * TIER_W
const WALL_TOP = tierTop(TIERS - 1) + 1.5

/** A seat: where a spectator stands, which way he faces, and how readily he rises (the lower, the sooner). */
interface Seat { x: number; y: number; z: number; rot: number; ang: number; phase: number; s: number; thr: number }
/** One coat: its calm and its cheering poses, each its own instanced mesh. */
interface Fan { calm: InstancedMesh; calmLine: InstancedMesh; cheer: InstancedMesh; cheerLine: InstancedMesh; seats: Seat[] }

const angDiff = (a: number, b: number): number => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))
const smooth = (a: number, b: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export class ArenaCrowd {
  readonly root = new Group()
  private fans: Fan[] = []
  private owned: BufferGeometry[] = []
  /** The whole house: 0 calm .. 1 on its feet; eases back down. */
  private excite = 0.12
  /** How hard a fight is being fought (eased): the stands nearest the hero answer it more. */
  private fight = 0
  private time = 0
  private cx: number
  private cz: number
  private hx: number
  private hz: number
  /** A kill: the seats beside it rise for a moment. */
  private pulses: Array<{ a: number; v: number }> = []

  constructor(plan: ZonePlan, private particles: Particles, private low: boolean) {
    this.cx = (plan.w / 2) * CELL
    this.cz = (plan.h / 2) * CELL
    this.hx = this.cx
    this.hz = this.cz
    const rng = mulberry32((plan.seed ^ 0xc0105) >>> 0)

    // ── The stands: one lathe, from the podium's face to the back wall, every tier a whole ring ──
    const rimOut = R0 + TIERS * TIER_W + 0.5
    const pts: Array<[number, number]> = [[rimOut, 0], [rimOut, WALL_TOP], [rimOut - 0.55, WALL_TOP + 0.02]]
    pts.push([rimOut - 0.55, tierTop(TIERS - 1)])
    for (let t = TIERS - 1; t >= 0; t--) {
      pts.push([tierIn(t), tierTop(t)])
      if (t > 0) pts.push([tierIn(t), tierTop(t - 1)])
    }
    // The cornice at the podium's front, overhanging; then the face down to the ground.
    pts.push([R0 - 0.16, tierTop(0) - 0.02], [R0 - 0.16, tierTop(0) - 0.34], [R0, tierTop(0) - 0.4], [R0, 0])
    const stands = lathe(pts, 112)
    // Stone: each tread and riser its own course of tone, and the blocks of a course told apart by a slight step of tone (like laid slabs).
    const light = new Color('#ecd8aa')
    const dark = new Color('#8a6c48')
    const tmp = new Color()
    paintBy(stands, (x, y, z) => {
      const course = Math.max(0, Math.floor((y - Y0 + 0.05) / TIER_RISE))
      const sector = Math.floor(((Math.atan2(z, x) + Math.PI) / (Math.PI * 2)) * 56)
      const t = (course % 2 ? 0.05 : 0.85) + ((sector % 2) * 0.2 - 0.1) + (y < 0.75 ? -0.2 : 0)
      return tmp.copy(dark).lerp(light, Math.max(0, Math.min(1, t)))
    })
    xform(stands, [this.cx, 0, this.cz])
    this.owned.push(stands)
    const sm = new Mesh(stands, celVC())
    const so = new Mesh(stands, outlineMat())
    so.renderOrder = -1
    this.root.add(sm, so)

    // ── The frieze: a crimson band with gold rules round the podium's face, and banners hung from the cornice ──
    const parts: BufferGeometry[] = []
    const band = (y0: number, y1: number, color: string, off: number): void => {
      parts.push(xform(paint(lathe([[R0 - off, y1], [R0 - off, y0]], 112), color), [this.cx, 0, this.cz]))
    }
    band(1.55, 1.95, '#b8263a', 0.07)
    band(1.43, 1.5, '#e8b030', 0.07)
    band(2.0, 2.07, '#e8b030', 0.07)
    const NB = 14
    for (let k = 0; k < NB; k++) {
      const a = ((k + 0.5) / NB) * Math.PI * 2
      const rot = -a + Math.PI / 2
      const r = R0 - 0.17
      const x = this.cx + Math.cos(a) * r
      const z = this.cz + Math.sin(a) * r
      // The pole's bar under the cornice, the cloth hanging from it, a pointed foot and a gold device.
      const red = k % 2 === 0
      parts.push(xform(paint(rcyl(0.06, 1.5, 0.02, 6, 1), '#6a4a2a'), [x, 2.12, z], [0, rot, Math.PI / 2]))
      parts.push(xform(paint(rbox(1.15, 1.7, 0.05, 0.1, 4, 3), red ? '#c8283c' : '#e8b030'), [x, 1.2, z], [0, rot, 0]))
      parts.push(xform(paint(rbox(0.5, 0.5, 0.06, 0.2, 4, 3), red ? '#ffd84a' : '#c8283c'), [x - Math.cos(a) * 0.04, 1.4, z - Math.sin(a) * 0.04], [0, rot, Math.PI / 4]))
    }
    // Pennants on the back wall: pole, ball, a swallow-tailed flag streaming along the rim.
    const NP = 18
    for (let k = 0; k < NP; k++) {
      const a = (k / NP) * Math.PI * 2 + 0.1
      const r = rimOut - 0.28
      const x = this.cx + Math.cos(a) * r
      const z = this.cz + Math.sin(a) * r
      const rot = -a + Math.PI / 2
      parts.push(xform(paint(rcyl(0.07, 3.2, 0.02, 6, 1), '#6a4a2a'), [x, WALL_TOP + 1.6, z]))
      parts.push(xform(paint(sph(0.12, 6, 5), '#ffd84a'), [x, WALL_TOP + 3.25, z]))
      parts.push(xform(paint(rbox(1.5, 0.7, 0.05, 0.1, 4, 3), k % 2 ? '#c8283c' : '#e8b030'), [x + Math.cos(a + Math.PI / 2) * 0.78, WALL_TOP + 2.75, z + Math.sin(a + Math.PI / 2) * 0.78], [0, rot, 0]))
    }
    // Braziers on the podium, between the first row's seats and the wall's cornice.
    const NBR = 8
    for (let k = 0; k < NBR; k++) {
      const a = (k / NBR) * Math.PI * 2 + 0.39
      const r = R0 + 0.35
      const x = this.cx + Math.cos(a) * r
      const z = this.cz + Math.sin(a) * r
      const y = tierTop(0)
      parts.push(xform(paint(rcyl(0.1, 0.9, 0.03, 8, 1), '#6a5a48'), [x, y + 0.45, z]))
      parts.push(xform(paint(rcyl(0.34, 0.22, 0.08, 10, 2), '#8a7458'), [x, y + 1.0, z]))
      parts.push(xform(paint(sph(0.24, 8, 6), '#ffb02a'), [x, y + 1.22, z]))
      parts.push(xform(paint(sph(0.14, 7, 5), '#fff0a0'), [x, y + 1.36, z]))
    }
    const dress = merge(parts)
    this.owned.push(dress)
    const dm = new Mesh(dress, celVC())
    const dl = new Mesh(dress, outlineMat())
    dl.renderOrder = -1
    this.root.add(dm, dl)

    // ── The crowd: a seat every two metres along every tier (a few left empty), each a look of the town folk in one of the coats ──
    const SPACING = this.low ? 2.9 : 2.0
    const bySeat: Array<Seat[]> = Array.from({ length: COATS.length }, () => [])
    for (let t = 0; t < TIERS; t++) {
      const r = tierIn(t) + (t === 0 ? 0.95 : 1.0)
      const n = Math.round((2 * Math.PI * r) / SPACING)
      for (let q = 0; q < n; q++) {
        if (rng() < 0.1) continue
        const a = ((q + 0.5 * (t % 2) + (rng() - 0.5) * 0.35) / n) * Math.PI * 2
        const rr = r + (rng() - 0.5) * 0.3
        const x = this.cx + Math.cos(a) * rr
        const z = this.cz + Math.sin(a) * rr
        bySeat[Math.floor(rng() * COATS.length)]!.push({ x, y: tierTop(t), z, rot: Math.atan2(this.cx - x, this.cz - z), ang: a, phase: rng() * 6.28, s: 0.74 + rng() * 0.14, thr: 0.18 + rng() * 0.5 })
      }
    }
    for (let c = 0; c < COATS.length; c++) {
      const look: Look = { ...LOOKS[FOLK[c]!]!, top: COATS[c]!, skin: SKIN[(c * 2 + 1) % SKIN.length]!, hair: HAIR[(c * 5 + 2) % HAIR.length]! }
      const seats = bySeat[c]!
      if (!seats.length) continue
      const make = (cheer: boolean): { mesh: InstancedMesh; line: InstancedMesh } => {
        const g = bakeFan(look, cheer)
        this.owned.push(g)
        const mesh = new InstancedMesh(g, celVCInst(), seats.length)
        const line = new InstancedMesh(g, outlineMat(undefined, undefined, true), seats.length)
        line.renderOrder = -1
        mesh.frustumCulled = false
        line.frustumCulled = false
        this.root.add(mesh, line)
        return { mesh, line }
      }
      const a = make(false)
      const b = make(true)
      const fan: Fan = { calm: a.mesh, calmLine: a.line, cheer: b.mesh, cheerLine: b.line, seats }
      this.place(fan)
      this.fans.push(fan)
    }
  }

  /** Every seat for this moment: how far up it is (the house, the hero's side, a pulse), then its pose, hop, sway and gaze. */
  private place(f: Fan): void {
    const hAng = Math.atan2(this.hz - this.cz, this.hx - this.cx)
    const hR = Math.hypot(this.hx - this.cx, this.hz - this.cz)
    // The nearer the wall, the louder the side he is at.
    const edge = smooth(7, 14.5, hR)
    const intensity = edge * (0.4 + 0.6 * this.fight)
    let nc = 0
    let nk = 0
    for (let n = 0; n < f.seats.length; n++) {
      const s = f.seats[n]!
      const d = angDiff(s.ang, hAng)
      let ex = this.excite + intensity * Math.max(0, 1 - d / 1.0)
      for (const p of this.pulses) ex += p.v * Math.max(0, 1 - angDiff(s.ang, p.a) / 0.32)
      ex = Math.min(1.4, ex)
      const up = ex > s.thr
      const hop = up ? Math.max(0, Math.sin(this.time * (4 + ex * 6) + s.phase)) * (0.06 + ex * 0.42) : Math.max(0, Math.sin(this.time * 2.2 + s.phase)) * 0.04
      // The ones the fight is at turn to it.
      const look = Math.atan2(this.hx - s.x, this.hz - s.z)
      let yaw = s.rot
      if (ex > 0.3) {
        const k = Math.min(0.55, (ex - 0.3) * 0.8)
        const dy = Math.atan2(Math.sin(look - s.rot), Math.cos(look - s.rot))
        yaw = s.rot + dy * k
      }
      _q.setFromAxisAngle(_up, yaw)
      _qr.setFromAxisAngle(_fwd, up ? Math.sin(this.time * (3 + ex * 4) + s.phase * 2) * 0.1 * Math.min(1, ex) : 0)
      _q.multiply(_qr)
      _p.set(s.x, s.y + hop, s.z)
      _s.setScalar(s.s)
      _m.compose(_p, _q, _s)
      if (up) { f.cheer.setMatrixAt(nk, _m); f.cheerLine.setMatrixAt(nk, _m); nk++ } else { f.calm.setMatrixAt(nc, _m); f.calmLine.setMatrixAt(nc, _m); nc++ }
    }
    f.calm.count = nc
    f.calmLine.count = nc
    f.cheer.count = nk
    f.cheerLine.count = nk
    f.calm.instanceMatrix.needsUpdate = true
    f.calmLine.instanceMatrix.needsUpdate = true
    f.cheer.instanceMatrix.needsUpdate = true
    f.cheerLine.instanceMatrix.needsUpdate = true
  }

  /** The crowd roars: `big` for a milestone or a won wave. Confetti over the sand round (x, z). */
  cheer(x: number, z: number, big = false): void {
    this.excite = big ? 1 : Math.max(this.excite, 0.75)
    const n = (big ? 90 : 40) * (this.low ? 0.4 : 1)
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2
      const d = 3 + Math.random() * 8
      this.particles.emit({
        x: x + Math.cos(a) * d, y: 5 + Math.random() * 4, z: z + Math.sin(a) * d,
        vx: (Math.random() - 0.5) * 2, vy: -0.4 - Math.random(), vz: (Math.random() - 0.5) * 2,
        color: COATS[k % COATS.length]!, size: 0.22, sizeEnd: 0.16, life: 1.8 + Math.random(), gravity: 1.2, drag: 0.6
      })
    }
  }

  /** A wave is announced: the house stirs and rises a little (the herald's brass is played by the caller). */
  stir(): void {
    this.excite = Math.max(this.excite, 0.55)
  }

  /** A kill at (x, z): the seats that look down on it jump up. */
  react(x: number, z: number): void {
    if (Math.hypot(x - this.cx, z - this.cz) < 6) return
    this.pulses.push({ a: Math.atan2(z - this.cz, x - this.cx), v: 0.7 })
    if (this.pulses.length > 8) this.pulses.shift()
  }

  update(dt: number, hx = this.cx, hz = this.cz, fighting = false): void {
    this.time += dt
    const k = Math.min(1, dt * 4)
    this.hx += (hx - this.hx) * k
    this.hz += (hz - this.hz) * k
    this.fight += ((fighting ? 1 : 0) - this.fight) * Math.min(1, dt * 1.5)
    this.excite += (0.12 - this.excite) * Math.min(1, dt * 0.5)
    for (const p of this.pulses) p.v -= dt * 0.9
    while (this.pulses.length && this.pulses[0]!.v <= 0) this.pulses.shift()
    for (const f of this.fans) this.place(f)
  }

  dispose(): void {
    for (const g of this.owned) g.dispose()
    this.root.removeFromParent()
  }
}
