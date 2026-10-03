import { Group, Mesh, MeshBasicMaterial, type BufferGeometry, type Material, type Scene, type ShaderMaterial } from 'three'
import type { Slice } from '../engine/slicer'
import { sceneQuality } from '../engine/quality'
import { CELL } from '../sim/grid'
import { TC_DOOR, TC_GRASS, TC_GROUND, TC_STREET, TC_YARD, townRoomAt, type TownPlan } from '../sim/town'
import { townLife, townPose, type TownPoseView } from '../sim/townLife'
import type { ZonePlan } from '../sim/zoneGen'
import type { Sim } from '../sim/world'
import type { Unit } from '../sim/types'
import { Mesher, newKit, type Kit } from './archKit'
import { celVC, glowVC, outlineMat, rigOutline, rigToon, setCelOpacity, setOutlineOpacity, type CelMaterial } from './cel'
import { groundAt } from './ground'
import { buildHouse, roomPropsOf, type HouseOut } from './houses'
import { holdProp } from './rigs/handProps'
import { loopBeat, townLoop, type LoopClip } from './rigs/townClips'
import type { RigView } from './rigs'
import { Bubbles, Puffs } from './townFx'
import { buildFences, buildPaving, buildProp, type PropCtx } from './townProps'
import type { Particles } from './particles'
import type { HandProp } from '../sim/townLife'
import { markStill, splitByTile } from './cull'

/**
 * ─── A town in the view (roadmap #41, #42) ───────────────────────────────────
 *
 * Builds what `sim/town.ts` planned — houses, props, fences, cobbles — merged
 * per quarter of the town into a few draws, and keeps it alive:
 *
 *   • the dollhouse cut: the front wall, upper storey and roof of the house
 *     the hero stands in (or talks into) fade and lift away, so the fixed
 *     camera sees the room and whoever works in it;
 *   • chimney smoke, the forge's embers, the lamps' glow;
 *   • townspeople's loops (`rigs/townClips.ts`), what they hold
 *     (`rigs/handProps.ts`), the beats of their work (sparks off the anvil, a
 *     puff of the pipe, a dummy rocking from a blow) and their emote bubbles;
 *   • a few chickens about the gardens, a cat by a door.
 *
 * Nothing here decides anything: the sim says what everybody does.
 */

/** Side of a merged quarter of the town, metres: an instanced or merged mesh is culled as a whole. */
const CHUNK = 20

interface Cut {
  house: number
  group: Group
  /** The room's furniture, and where its door is. */
  room: Group | null
  /** The room's small things (shown only while the front is lifted). */
  clutter: Group | null
  dx: number
  dz: number
  mat: CelMaterial
  line: ShaderMaterial
  glow: MeshBasicMaterial
  a: number
}

interface Person {
  held: Mesh | null
  props: Map<HandProp, Mesh>
  loop: LoopClip | null
  t: number
  scaled: boolean
}

interface Dummy {
  obj: Group
  x: number
  z: number
  /** Rock angle and its speed (a spring). */
  w: number
  dw: number
  dir: number
}

interface Animal {
  obj: Group
  head: Group | null
  x: number
  z: number
  tx: number
  tz: number
  rest: number
  yaw: number
  hop: number
  cat: boolean
  hx: number
  hz: number
}

export class TownView {
  readonly root = new Group()
  private owned: BufferGeometry[] = []
  private mats: Material[] = []
  private cuts: Cut[] = []
  private chimneys: Array<[number, number, number]> = []
  private forges: Array<[number, number, number]> = []
  private dummies: Dummy[] = []
  private animals: Animal[] = []
  private people = new Map<number, Person>()
  private puffs: Puffs
  private bubbles: Bubbles
  private smokeT = 0
  private low = sceneQuality() === 'low'
  /** The house the cut is open on (-1: none). */
  open = -1

  private constructor(private readonly plan: ZonePlan, private readonly town: TownPlan, private readonly sim: Sim, private readonly particles: Particles) {
    this.puffs = new Puffs(this.low ? 32 : 110)
    this.bubbles = new Bubbles(16)
    this.root.add(this.puffs.mesh, this.bubbles.mesh)
  }

  /** Build a town's view, time-sliced. */
  static async build(plan: ZonePlan, sim: Sim, scene: Scene, slice: Slice, particles: Particles): Promise<TownView> {
    const t = plan.town!
    const v = new TownView(plan, t, sim, particles)
    const ctx: PropCtx = { style: t.style, ruined: t.ruined, low: v.low, gy: groundAt }
    const nx = Math.ceil((plan.w * CELL) / CHUNK)
    const nz = Math.ceil((plan.h * CELL) / CHUNK)
    const kits: Kit[] = []
    for (let k = 0; k < nx * nz; k++) kits.push(newKit())
    const kitAt = (x: number, z: number): Kit => kits[Math.min(nz - 1, Math.max(0, Math.floor(z / CHUNK))) * nx + Math.min(nx - 1, Math.max(0, Math.floor(x / CHUNK)))]!

    // ── Houses ──
    for (let hi = 0; hi < t.houses.length; hi++) {
      const h = t.houses[hi]!
      const x = (h.i0 + h.cw / 2) * CELL
      const z = (h.j0 + h.cd / 2) * CELL
      const owner = t.people.find(p => p.npc && p.npc === h.owner)
      const out: HouseOut = buildHouse(kitAt(x, z), h, { style: t.style, ruined: t.ruined, low: v.low, x, y: groundAt(x, z), z, job: owner?.job ?? (h.owners.length ? undefined : undefined), cls: h.cls, inRoom: h.inside ? roomPropsOf(t, hi) : undefined })
      v.chimneys.push(...out.chimneys)
      if (out.forge) v.forges.push(out.forge)
      if (out.cut) v.addCut(hi, out.cut, out.room, out.clutter, (h.doorI + 0.5) * CELL, (h.j0 + h.cd) * CELL)
      if ((hi & 1) === 1) await slice()
    }
    // ── Props, fences, the yards' dummies ──
    for (const p of t.props) {
      if (p.kind === 'dummy' || p.kind === 'stone') v.addDummy(p.x, p.z, p.rot, p.kind === 'stone', t.ruined)
      buildProp(kitAt(p.x, p.z), p, ctx)
    }
    await slice()
    // Fences go into the kit of where they stand; one pass per quarter keeps them together.
    const fences = newKit()
    buildFences(fences, t, plan.w, plan.h, ctx)
    v.addKit(fences, true, 'fences', true)
    await slice()
    for (const k of kits) v.addKit(k, true)
    await slice()
    // ── The cobbles ──
    const paving = new Mesher()
    buildPaving(paving, plan, t, ctx, plan.seed)
    if (!paving.empty) {
      const all = paving.build()
      v.owned.push(all)
      for (const g of splitByTile(all, CHUNK)) {
        if (g !== all) v.owned.push(g)
        const m = markStill(new Mesh(g, celVC()))
        m.renderOrder = -1
        m.name = 'paving'
        v.root.add(m)
      }
    }
    // ── A few animals ──
    if (!v.low && !t.ruined) v.addAnimals()
    scene.add(v.root)
    await slice()
    return v
  }

  /** A kit's lit, outline and glow meshes, culled by their boxes; `split`
   *  cuts a kit that spans the whole town (the fences) into quarters first. */
  private addKit(k: Kit, outline: boolean, name = 'town', split = false): void {
    const add = (all: BufferGeometry, mat: Material, label: string, order = 0): void => {
      this.owned.push(all)
      for (const g of split ? splitByTile(all, CHUNK) : [all]) {
        if (g !== all) this.owned.push(g)
        const m = markStill(new Mesh(g, mat))
        m.name = label
        m.renderOrder = order
        this.root.add(m)
      }
    }
    const lit = new Mesher().append(k.hull).append(k.detail)
    if (!lit.empty) add(lit.build(), celVC(), name)
    if (outline && !k.hull.empty) add(k.hull.welded(), outlineMat(), '', -1)
    if (!k.glow.empty) add(k.glow.build(), glowVC(), name + ':glow')
  }

  /** A house's front, upper storey and roof: their own materials, so they can fade. */
  private addCut(house: number, k: Kit, roomKit: Kit | null, clutterKit: Kit | null, dx: number, dz: number): void {
    const group = new Group()
    group.name = 'cut'
    const mat = rigToon()
    const line = rigOutline()
    const glow = new MeshBasicMaterial({ vertexColors: true, toneMapped: false })
    this.mats.push(mat, line, glow)
    const lit = new Mesher().append(k.hull).append(k.detail)
    if (!lit.empty) { const g = lit.build(); this.owned.push(g); group.add(new Mesh(g, mat)) }
    if (!k.hull.empty) { const g = k.hull.welded(); this.owned.push(g); const o = new Mesh(g, line); o.renderOrder = -1; group.add(o) }
    if (!k.glow.empty) { const g = k.glow.build(); this.owned.push(g); group.add(new Mesh(g, glow)) }
    this.root.add(group)
    let room: Group | null = null
    if (roomKit && (!roomKit.hull.empty || !roomKit.detail.empty)) {
      room = new Group()
      room.name = 'room'
      const lit = new Mesher().append(roomKit.hull).append(roomKit.detail)
      if (!lit.empty) { const g = lit.build(); this.owned.push(g); room.add(new Mesh(g, celVC())) }
      if (!roomKit.hull.empty) { const g = roomKit.hull.welded(); this.owned.push(g); const o = new Mesh(g, outlineMat()); o.renderOrder = -1; room.add(o) }
      if (!roomKit.glow.empty) { const g = roomKit.glow.build(); this.owned.push(g); room.add(new Mesh(g, glowVC())) }
      this.root.add(room)
    }
    // The room's small things: one more merged draw (two with their glow), only while the front is lifted.
    let clutter: Group | null = null
    if (clutterKit && (!clutterKit.hull.empty || !clutterKit.detail.empty || !clutterKit.glow.empty)) {
      clutter = new Group()
      clutter.name = 'clutter'
      const lit = new Mesher().append(clutterKit.hull).append(clutterKit.detail)
      if (!lit.empty) { const g = lit.build(); this.owned.push(g); clutter.add(new Mesh(g, celVC())) }
      if (!clutterKit.glow.empty) { const g = clutterKit.glow.build(); this.owned.push(g); clutter.add(new Mesh(g, glowVC())) }
      clutter.visible = false
      this.root.add(clutter)
    }
    this.cuts.push({ house, group, room, clutter, dx, dz, mat, line, glow, a: 1 })
  }

  private addDummy(x: number, z: number, rot: number, stone: boolean, ruined: boolean): void {
    const k = newKit()
    const h = k.hull
    if (stone) {
      // A standing stone with a rune.
      h.cyl(0, 0, 0, 0.32, 0.22, 1.45, 6, '#8a8078', '#9a9088')
      h.cyl(0, 1.45, 0, 0.22, 0.12, 0.18, 6, '#8a8078', '#a49a92')
      k.glow.box(-0.08, 0.7, 0.27, 0.08, 1.05, 0.29, '#ffb04a', 'b')
    } else {
      // A straw dummy on a post: a sack body, a head, arms of a cross-bar.
      h.cyl(0, 0, 0, 0.06, 0.06, 0.9, 6, '#7a5030')
      h.cyl(0, 0.75, 0, 0.26, 0.3, 0.62, 8, ruined ? '#6a5a40' : '#e2b850', '#c99a3a')
      h.ball(0, 1.58, 0, 0.21, ruined ? '#7a6a50' : '#f0d8a0', 7, 5)
      k.detail.beam(-0.5, 1.2, 0, 0.5, 1.2, 0, 0.08, '#7a5030', 0.08)
      for (const s of [-1, 1]) k.detail.ball(s * 0.5, 1.2, 0, 0.1, '#e2b850', 5, 3)
      k.detail.cyl(0, 0.95, 0, 0.305, 0.305, 0.06, 8, '#8a4a2a')
      k.detail.box(-0.1, 1.6, 0.18, -0.04, 1.66, 0.21, '#3a2a28', 'b')
      k.detail.box(0.04, 1.6, 0.18, 0.1, 1.66, 0.21, '#3a2a28', 'b')
      // A painted target on its chest.
      k.detail.cyl(0, 1.0, 0.26, 0.12, 0.12, 0.02, 8, '#c9483a', '#c9483a')
    }
    const obj = new Group()
    const lit = new Mesher().append(k.hull).append(k.detail).build()
    const line = k.hull.welded()
    this.owned.push(lit, line)
    obj.add(new Mesh(lit, celVC()))
    const o = new Mesh(line, outlineMat())
    o.renderOrder = -1
    obj.add(o)
    if (!k.glow.empty) { const g = k.glow.build(); this.owned.push(g); obj.add(new Mesh(g, glowVC())) }
    obj.position.set(x, groundAt(x, z) + 0.06, z)
    obj.rotation.y = rot + Math.PI / 2
    // A dummy is a head shorter than a person.
    if (!stone) obj.scale.setScalar(0.8)
    this.root.add(obj)
    this.dummies.push({ obj, x, z, w: 0, dw: 0, dir: 1 })
  }

  private addAnimals(): void {
    const t = this.town
    const W = this.plan.w
    const H = this.plan.h
    const open = (x: number, z: number): boolean => {
      const i = Math.floor(x / CELL)
      const j = Math.floor(z / CELL)
      if (i < 0 || j < 0 || i >= W || j >= H) return false
      const c = t.cell[j * W + i]
      return c === TC_GRASS || c === TC_YARD || c === TC_GROUND
    }
    // Chickens about the green and the gardens.
    const chicken = (): Group => {
      const k = newKit()
      k.hull.ball(0, 0.2, 0, 0.16, '#fff8ee', 7, 5, 0.9)
      k.hull.ball(0, 0.36, 0.12, 0.09, '#fffaf2', 6, 4)
      k.detail.ball(0, 0.26, -0.15, 0.08, '#f4ece0', 5, 3, 1.3)
      k.detail.box(-0.02, 0.43, 0.08, 0.02, 0.48, 0.16, '#e03a3a', 'b')
      k.detail.box(-0.02, 0.34, 0.2, 0.02, 0.37, 0.26, '#ffb02a', 'b')
      k.detail.box(-0.07, 0.37, 0.16, -0.05, 0.39, 0.18, '#1b1626', 'b')
      k.detail.box(0.05, 0.37, 0.16, 0.07, 0.39, 0.18, '#1b1626', 'b')
      for (const s of [-1, 1]) k.detail.box(s * 0.05 - 0.012, 0, -0.012, s * 0.05 + 0.012, 0.09, 0.012, '#ffb02a', 'b')
      return this.small(k)
    }
    const homes: Array<[number, number]> = []
    for (const p of t.props) if (p.kind === 'garden' || p.kind === 'hay' || p.kind === 'cart') homes.push([p.x, p.z + 1.2])
    const n = t.style === 'mountain' ? 0 : 4
    for (let i = 0; i < n && homes.length; i++) {
      const [hx, hz] = homes[(i * 3) % homes.length]!
      if (!open(hx, hz)) continue
      const obj = chicken()
      this.root.add(obj)
      this.animals.push({ obj, head: null, x: hx, z: hz, tx: hx, tz: hz, rest: i * 0.7, yaw: i, hop: 0, cat: false, hx, hz })
    }
    // A cat on a doorstep.
    const door = t.houses.find(h => !h.inside && h.kind === 'cottage')
    if (door) {
      const k = newKit()
      const fur = t.style === 'mountain' ? '#8a8a94' : '#f0a050'
      k.hull.ball(0, 0.16, -0.05, 0.17, fur, 7, 5, 0.85)
      k.detail.beam(0, 0.12, -0.2, 0.18, 0.05, -0.38, 0.05, fur, 0.05)
      const body = this.small(k)
      const hk = newKit()
      hk.hull.ball(0, 0, 0, 0.13, fur, 7, 5)
      for (const s of [-1, 1]) hk.detail.prism([[s * 0.1 - 0.04, 0.07], [s * 0.1 + 0.04, 0.07], [s * 0.1, 0.17]], -0.02, 0.02, fur)
      hk.detail.box(-0.06, 0.01, 0.11, -0.03, 0.04, 0.13, '#3a8a3a', 'b')
      hk.detail.box(0.03, 0.01, 0.11, 0.06, 0.04, 0.13, '#3a8a3a', 'b')
      const head = this.small(hk)
      head.position.set(0, 0.36, 0.08)
      body.add(head)
      const x = (door.doorI + 0.5) * CELL + 0.75
      const z = (door.j0 + door.cd) * CELL + 0.15
      this.root.add(body)
      this.animals.push({ obj: body, head, x, z, tx: x, tz: z, rest: 0, yaw: 0, hop: 0, cat: true, hx: x, hz: z })
    }
  }

  private small(k: Kit): Group {
    const g = new Group()
    const lit = new Mesher().append(k.hull).append(k.detail).build()
    const line = k.hull.welded()
    this.owned.push(lit, line)
    g.add(new Mesh(lit, celVC()))
    const o = new Mesh(line, outlineMat())
    o.renderOrder = -1
    g.add(o)
    return g
  }

  // ─── Every frame ───────────────────────────────────────────────────────────

  /** Before the units are posed. */
  begin(): void {
    this.bubbles.begin()
  }

  /**
   * A townsperson's frame, BEFORE `animate`: their loop, what they hold, the
   * beats of their work, their bubble.
   */
  pose(v: RigView, u: Unit, dt: number): void {
    const tp = townPose(this.sim, u.id)
    if (!tp) return
    let p = this.people.get(u.id)
    if (!p) { p = { held: null, props: new Map(), loop: null, t: 0, scaled: false }; this.people.set(u.id, p) }
    if (!p.scaled) { v.scale = tp.scale; p.scaled = true }
    const walking = u.anim === 'walk'
    // Which hand is free: the right unless it holds a weapon. An empty-handed
    // one turned east would hold a prop in the hand away from the camera (the
    // body hides it): it goes in the other hand then, the loop mirrored.
    const armed = v.held !== 'none'
    const left = armed || (tp.prop !== '' && v.off === 'none' && Math.sin(u.facing) > 0.35)
    const free = !armed || v.off === 'none'
    const loop = walking ? null : townLoop(v.set, tp.pose, left && free && tp.prop !== '')
    const t0 = p.t
    const half = tp.pose === 'spar' && !tp.lead && loop ? loop.period / 2 : 0
    const t1 = tp.t + half
    v.loop = loop
    v.loopT = t1
    p.loop = loop
    p.t = t1
    // The prop goes in the free hand.
    const bone = left ? v.rig.bones.offhand : v.rig.bones.weapon
    p.held = holdProp(bone, p.held, walking || !free ? '' : tp.prop, p.props)
    if (loop && !walking && t1 > t0 && t1 - t0 < 0.5) this.beat(v, u, tp, loop, t0, t1)
    if (tp.emote) this.bubbles.add(v.x, groundAt(v.x, v.z) + u.h * tp.scale + 0.85, v.z, tp.emote, tp.emoteT, tp.scale < 1 ? 0.85 : 1)
    void dt
  }

  /** What lands on a beat of a loop. */
  private beat(v: RigView, u: Unit, tp: TownPoseView, loop: LoopClip, t0: number, t1: number): void {
    if (!loopBeat(loop, t0, t1)) return
    const fx = Math.sin(v.yaw)
    const fz = Math.cos(v.yaw)
    const ps = this.particles
    switch (tp.pose) {
      case 'hammer': {
        // Sparks off the anvil.
        const x = v.x + fx * 0.62
        const z = v.z + fz * 0.62
        for (let i = 0; i < (this.low ? 4 : 9); i++) {
          const a = Math.random() * Math.PI * 2
          const s = 1.5 + Math.random() * 2.5
          ps.emit({ x, y: 0.85, z, vx: Math.cos(a) * s, vy: 1.5 + Math.random() * 2.5, vz: Math.sin(a) * s, color: Math.random() < 0.5 ? '#ffd24a' : '#ff8a2a', size: 0.12, sizeEnd: 0.02, life: 0.35 + Math.random() * 0.25, gravity: 9 })
        }
        break
      }
      case 'forms':
      case 'spar':
      case 'cast': {
        // A tick on the dummy (or between the partners) and the dummy rocks.
        const x = v.x + fx * (tp.pose === 'spar' ? 0.65 : 0.85)
        const z = v.z + fz * (tp.pose === 'spar' ? 0.65 : 0.85)
        ps.emit({ x, y: 1.05, z, color: tp.pose === 'cast' ? v.color : '#fff6c8', size: tp.pose === 'cast' ? 0.5 : 0.3, sizeEnd: 0.05, life: 0.22 })
        for (let i = 0; i < 4; i++) ps.emit({ x, y: 1.05, z, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2, vz: (Math.random() - 0.5) * 3, color: tp.pose === 'cast' ? v.color : '#ffe9a8', size: 0.1, sizeEnd: 0.02, life: 0.3, gravity: 4 })
        for (const d of this.dummies) {
          if (Math.hypot(d.x - v.x, d.z - v.z) > 2.2) continue
          d.dw += 4.5
          d.dir = Math.atan2(d.x - v.x, d.z - v.z)
        }
        break
      }
      case 'tinker':
        ps.emit({ x: v.x + fx * 0.55, y: 1.0, z: v.z + fz * 0.55, vy: 1, color: '#4ff0c8', size: 0.14, sizeEnd: 0.02, life: 0.3 })
        break
      case 'hoe':
        if (!this.low) this.puffs.emit(v.x + fx * 0.8, groundAt(v.x, v.z) + 0.1, v.z + fz * 0.8, 0, 0.4, 0, 0.25, 0.35, 0.6, 0.72, 0.6, 0.45)
        break
      default:
        // A puff of the pipe.
        if (tp.prop === 'pipe' && !this.low) {
          const y = groundAt(v.x, v.z) + u.h * tp.scale * 0.9
          this.puffs.emit(v.x + fx * 0.2, y, v.z + fz * 0.2, fx * 0.15, 0.45, fz * 0.15, 0.12, 0.3, 1.6, 0.95, 0.95, 0.98)
          this.puffs.emit(v.x + fx * 0.25, y + 0.1, v.z + fz * 0.25, fx * 0.1, 0.5, fz * 0.1, 0.09, 0.25, 1.9, 0.95, 0.95, 0.98)
        }
    }
  }

  /** After the units: the cut, smoke, dummies, animals. `hx, hz`: the hero; `talk`: the unit he speaks to. */
  update(dt: number, hx: number, hz: number, talk: Unit | undefined, camX: number, camZ: number): void {
    const t = this.town
    // ── The dollhouse: open the house he is in, or talks into, or stands at the door of ──
    let open = townRoomAt(t, hx, hz).room
    if (open < 0 && talk) open = townRoomAt(t, talk.x, talk.z).room
    if (open < 0) {
      const i = Math.floor(hx / CELL)
      const j = Math.floor(hz / CELL)
      for (let k = 0; k < this.cuts.length; k++) {
        const h = t.houses[this.cuts[k]!.house]!
        if (i === h.doorI && j === h.j0 + h.cd && t.cell[(j - 1) * t.w + i] === TC_DOOR) { open = this.cuts[k]!.house; break }
      }
    }
    this.open = open
    for (const c of this.cuts) {
      const target = c.house === open ? 0 : 1
      c.a += Math.sign(target - c.a) * Math.min(Math.abs(target - c.a), dt * 4.5)
      const a = c.a
      setCelOpacity(c.mat, a)
      setOutlineOpacity(c.line, a)
      const tr = a < 0.999
      if (c.glow.transparent !== tr) { c.glow.transparent = tr; c.glow.depthWrite = !tr; c.glow.needsUpdate = true }
      c.glow.opacity = a
      c.group.visible = a > 0.01
      // The room is only seen through the open roof, or through the doorway from
      // its doorstep (from farther, the doorway shows a step of floor at most).
      if (c.room) c.room.visible = a < 0.999 || Math.abs(hx - c.dx) < 4 && hz - c.dz < 5 && hz - c.dz > -1
      if (c.clutter) c.clutter.visible = a < 0.999
      // It lifts a little as it goes, so the eye reads it as a lid coming off.
      c.group.position.y = (1 - a) * (1 - a) * 0.8
    }
    // ── Smoke from the chimneys near the camera ──
    if (!this.low) {
      this.smokeT -= dt
      if (this.smokeT <= 0) {
        this.smokeT = 0.32
        for (const [x, y, z] of this.chimneys) {
          if (Math.abs(x - camX) > 22 || Math.abs(z - camZ) > 26) continue
          if (Math.random() < 0.35) continue
          this.puffs.emit(x + (Math.random() - 0.5) * 0.1, y, z, 0.05, 0.55 + Math.random() * 0.25, 0, 0.28, 0.65, 3 + Math.random(), 0.92, 0.9, 0.9)
        }
      }
      for (const [x, y, z] of this.forges) {
        if (Math.random() > dt * 3 || Math.abs(x - camX) > 20 || Math.abs(z - camZ) > 24) continue
        this.particles.emit({ x: x + (Math.random() - 0.5) * 0.5, y: y - groundAt(x, z), z: z + (Math.random() - 0.5) * 0.3, vy: 0.8 + Math.random(), color: Math.random() < 0.5 ? '#ffb02a' : '#ff6a1a', size: 0.1, sizeEnd: 0.02, life: 0.8 })
      }
    }
    this.puffs.update(dt)
    this.bubbles.end()
    // ── Dummies rock on a spring ──
    for (const d of this.dummies) {
      d.dw += (-d.w * 90 - d.dw * 7) * Math.min(dt, 1 / 30)
      d.w += d.dw * Math.min(dt, 1 / 30)
      d.obj.rotation.x = Math.cos(d.dir) * d.w * 0.12
      d.obj.rotation.z = -Math.sin(d.dir) * d.w * 0.12
    }
    // ── Animals ──
    for (const a of this.animals) this.animal(a, dt)
  }

  private animal(a: Animal, dt: number): void {
    if (a.cat) {
      // A cat sits on its step and looks about; now and then it washes.
      a.rest += dt
      a.obj.position.set(a.x, groundAt(a.x, a.z), a.z)
      a.obj.rotation.y = 0.5
      if (a.head) {
        a.head.rotation.y = Math.sin(a.rest * 0.4) * 0.9
        a.head.rotation.x = Math.max(0, Math.sin(a.rest * 0.23)) * 0.4
      }
      const s = 1 + Math.sin(a.rest * 2.2) * 0.02
      a.obj.scale.set(1, s, 1)
      return
    }
    a.rest -= dt
    const dx = a.tx - a.x
    const dz = a.tz - a.z
    const d = Math.hypot(dx, dz)
    let peck = 0
    if (a.rest > 0) {
      // Pecking at the ground.
      peck = Math.max(0, Math.sin(a.rest * 9)) * 0.5
    } else if (d > 0.05) {
      const s = Math.min(d, dt * 0.9)
      a.x += (dx / d) * s
      a.z += (dz / d) * s
      a.yaw = Math.atan2(dx, dz)
      a.hop += dt * 14
    } else {
      // Somewhere else to scratch at, near home.
      const ang = Math.random() * Math.PI * 2
      const r = Math.random() * 2.2
      const nx = a.hx + Math.cos(ang) * r
      const nz = a.hz + Math.sin(ang) * r
      const i = Math.floor(nx / CELL)
      const j = Math.floor(nz / CELL)
      const c = this.town.cell[j * this.town.w + i]
      if (c === TC_GRASS || c === TC_YARD || c === TC_STREET || c === TC_GROUND) { a.tx = nx; a.tz = nz }
      a.rest = 1 + Math.random() * 2.5
    }
    a.obj.position.set(a.x, groundAt(a.x, a.z) + Math.abs(Math.sin(a.hop)) * 0.05, a.z)
    a.obj.rotation.set(peck, a.yaw, 0, 'YXZ')
  }

  /** DEV probes: the town's people as the sim has them, and how one is posed. */
  people_(): ReturnType<typeof townLife> { return townLife(this.sim) }
  pose_(id: number): TownPoseView | undefined { return townPose(this.sim, id) }

  /** A unit's view is gone: forget what it held. */
  drop(id: number): void {
    const p = this.people.get(id)
    if (!p) return
    p.held?.removeFromParent()
    this.people.delete(id)
  }

  dispose(): void {
    this.root.removeFromParent()
    for (const g of this.owned) g.dispose()
    for (const m of this.mats) m.dispose()
    this.puffs.dispose()
    this.bubbles.dispose()
  }
}
