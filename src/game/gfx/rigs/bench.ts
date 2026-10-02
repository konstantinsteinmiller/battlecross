import {
  CircleGeometry, Color, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SRGBColorSpace, WebGLRenderer
} from 'three'
import { updateCelFrame } from '../cel'
import { makeBlobShadow } from '../markers'
import { Trails } from '../trails'
import { EQUIP_SLOTS, type EquipSlot } from '../../data/items'
import type { Action, Unit } from '../../sim/types'
import { animate } from './anim'
import { LOOKS, heroLook } from './looks'
import type { GearKind, HeadGear, Held, Look, OffHand } from './humanoid'
import { makeRigView, type RigView } from './index'

/**
 * ─── The rig bench (DEV only) ────────────────────────────────────────────────
 *
 * Mounted by `/models` (the art bench's "Rigs" tab). It draws the game's own
 * rigs with the game's own animation and trails, outside a fight, so a look or
 * a swing can be judged on its own:
 *
 *   grid    every look, standing
 *   strip   one look, one action, as a film strip: the same swing frozen at N
 *           moments from the first frame of the wind-up to the recovery
 *   gear    the hero in every head / hand / foot layer
 *   live    one look, looping an action in real time
 *
 * Also scriptable as `window.__bench` (screenshots in CI, art review).
 */

export interface StripOpts {
  look: string
  /** Override what the look holds. */
  held?: Held
  off?: OffHand
  /** 'attack', a hero skill id or an enemy ability kind. */
  action: string
  /** The sim's wind-up and total length, seconds. */
  hitAt?: number
  end?: number
  frames?: number
  /** Which basic attack of the set (0, 1, 2 …). */
  combo?: number
  yaw?: number
  /** Several headings, one row of the strip each (a swing reads differently from behind). */
  yaws?: number[]
  heavy?: boolean
  dual?: boolean
  style?: 'melee' | 'ranged' | 'magic'
}

export interface Bench {
  grid(ids?: string[]): void
  strip(o: StripOpts): void
  gear(): void
  live(o: StripOpts | null): void
  looks(): string[]
  dispose(): void
}

const GROUND = '#6fae5a'

/** The hero in a starter sword and nothing else (whatever slots the game has). */
const starter = (): Record<EquipSlot, string | null> =>
  ({ ...(Object.fromEntries(EQUIP_SLOTS.map(s => [s, null])) as Record<EquipSlot, string | null>), main: 'rustedShortsword' })

const fakeUnit = (id: number, o: { style: 'melee' | 'ranged' | 'magic'; heavy: boolean; dual: boolean }): Unit => ({
  id, kind: 'hero', team: 0, rank: 'hero', level: 1, x: 0, z: 0, px: 0, pz: 0, vx: 0, vz: 0, facing: 0, r: 0.45, h: 1.45,
  hp: 10, mana: 0, shield: 0, shieldT: 0, alive: true, deadT: 0,
  s: { atkStyle: o.style, atkHeavy: o.heavy, dual: o.dual ? 1 : 0, maxHp: 10 } as Unit['s'],
  statuses: [], targetId: 0, hasGoal: false, goalX: 0, goalZ: 0, path: [], pathI: 0, repathT: 0, attackCd: 0, action: null,
  cds: [], ai: 'idle', aiT: 0, homeX: 0, homeZ: 0, group: -1, awake: true, ownerId: 0, life: -1, kx: 0, kz: 0,
  anim: 'idle', animT: 1, animStyle: 0, flinch: 0, swings: 0, phase: 1, icd: {}
})

const styleOf = (held: Held): 'melee' | 'ranged' | 'magic' =>
  held === 'staff' || held === 'wand' ? 'magic' : held === 'gun' || held === 'cannon' || held === 'bow' || held === 'sling' || held === 'flask' ? 'ranged' : 'melee'

export const mountBench = (host: HTMLElement): Bench => {
  const renderer = new WebGLRenderer({ antialias: true, alpha: false })
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setPixelRatio(1)
  host.appendChild(renderer.domElement)
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
  const scene = new Scene()
  scene.background = new Color(GROUND)
  const camera = new PerspectiveCamera(30, 1, 0.5, 200)
  const ground = new Mesh(new CircleGeometry(60, 24), new MeshBasicMaterial({ color: new Color(GROUND).multiplyScalar(0.92) }))
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)
  const trails = new Trails(scene)

  /** `own`: a still of a strip keeps its own trails, frozen at its own moment. */
  interface Actor { v: RigView; u: Unit; x: number; z: number; shadow: Mesh; act: StripOpts | null; t: number; own: Trails | null }
  let actors: Actor[] = []
  let liveOpts: StripOpts | null = null
  let raf = 0
  let time = 0
  /** The patch of ground the camera must hold: its centre, width and depth (metres). */
  let cam = { x: 0, z: 0, w: 12, d: 6 }

  const clear = (): void => {
    for (const a of actors) {
      scene.remove(a.v.rig.root, a.shadow)
      a.v.rig.material.dispose()
      a.own?.dispose()
    }
    actors = []
    trails.clear()
  }

  const lookOf = (o: { look: string; held?: Held; off?: OffHand }): Look => {
    const base = o.look === 'hero' ? heroLook(starter()) : LOOKS[o.look] ?? LOOKS.bandit!
    return { ...base, held: o.held ?? base.held, off: o.off ?? base.off }
  }

  const add = (look: Look, x: number, z: number, yaw: number, o?: Partial<StripOpts>): Actor => {
    const style = o?.style ?? styleOf(look.held)
    const u = fakeUnit(actors.length + 1, { style, heavy: o?.heavy ?? (look.held === 'greatsword' || look.held === 'axe' || look.held === 'hammer'), dual: o?.dual ?? (look.off === 'dagger' || look.off === 'gun') })
    u.facing = yaw
    u.x = u.px = x
    u.z = u.pz = z
    const v = makeRigView(u, look)
    v.yaw = yaw
    const shadow = makeBlobShadow(0.45)
    shadow.position.set(x, 0.02, z)
    scene.add(v.rig.root, shadow)
    const a: Actor = { v, u, x, z, shadow, act: null, t: 0, own: null }
    actors.push(a)
    return a
  }

  const action = (o: StripOpts, t: number): Action => {
    const hitAt = o.hitAt ?? 0.22
    const end = o.end ?? hitAt + 0.44
    return { id: o.action, t, hitAt, end, done: t >= hitAt, targetId: 0, x: 0, z: 3, sx: 0, sz: 0, a: 0, ability: -1, slot: o.action === 'attack' ? -1 : 0 }
  }

  /** Play `a`'s action from its first frame to time `t`, 60 steps a second. */
  const playTo = (a: Actor, o: StripOpts, t: number): void => {
    const dt = 1 / 60
    if (o.combo !== undefined) a.v.combo = o.combo - 1
    // A second of standing first, so springs and blends are settled.
    for (let i = 0; i < 20; i++) animate(a.v, a.u, a.x, a.z, i * dt, dt)
    const act = action(o, 0)
    a.u.action = act
    a.u.anim = o.action === 'attack' ? 'attack' : 'cast'
    let now = 0
    const key = a.u.id * 2
    const own = (a.own = new Trails(scene))
    while (now <= t + 1e-6) {
      act.t = now
      act.done = now >= act.hitAt
      if (now > act.end) { a.u.action = null; a.u.anim = 'idle' }
      animate(a.v, a.u, a.x, a.z, 1 + now, dt)
      own.feed(key, a.v, false, a.v.trail, a.v.color, a.v.trailHeavy)
      own.feed(key + 1, a.v, true, a.v.trailOff, a.v.color, a.v.trailHeavy)
      own.update(dt)
      now += dt
    }
  }

  const frame = (): void => {
    const w = Math.max(1, host.clientWidth)
    const h = Math.max(1, host.clientHeight)
    if (renderer.domElement.width !== w || renderer.domElement.height !== h) renderer.setSize(w, h, false)
    camera.aspect = w / h
    const p = (52 * Math.PI) / 180
    const dist = Math.max(cam.w / (0.536 * camera.aspect), cam.d / 0.68) * 1.08
    // The game's own clip planes: a near plane this far out keeps the depth buffer fine.
    camera.near = Math.max(0.5, dist * 0.25)
    camera.far = dist * 2.6 + 60
    camera.updateProjectionMatrix()
    camera.position.set(cam.x, Math.sin(p) * dist, cam.z + Math.cos(p) * dist)
    camera.lookAt(cam.x, 0.6, cam.z)
    camera.updateMatrixWorld()
    updateCelFrame(camera, dist)
    renderer.render(scene, camera)
  }

  const tick = (): void => {
    raf = requestAnimationFrame(tick)
    const dt = 1 / 60
    time += dt
    for (const a of actors) {
      if (liveOpts) {
        const o = liveOpts
        const hitAt = o.hitAt ?? 0.22
        const end = o.end ?? hitAt + 0.44
        a.t += dt
        if (a.t > end + 0.7) { a.t = 0; a.u.action = null }
        if (a.t <= end) {
          if (!a.u.action) { a.u.action = action(o, 0); a.u.anim = o.action === 'attack' ? 'attack' : 'cast' }
          a.u.action.t = a.t
          a.u.action.done = a.t >= hitAt
        } else { a.u.action = null; a.u.anim = 'idle' }
      }
      animate(a.v, a.u, a.x, a.z, time, dt)
      trails.feed(a.u.id * 2, a.v, false, a.v.trail, a.v.color, a.v.trailHeavy)
      trails.feed(a.u.id * 2 + 1, a.v, true, a.v.trailOff, a.v.color, a.v.trailHeavy)
    }
    trails.update(dt)
    frame()
  }
  raf = requestAnimationFrame(tick)

  const api: Bench = {
    looks: () => ['hero', ...Object.keys(LOOKS)],

    grid(ids) {
      clear()
      liveOpts = null
      const list = ids ?? Object.keys(LOOKS)
      const cols = Math.min(list.length, 9)
      const rows = Math.ceil(list.length / cols)
      list.forEach((id, i) => {
        const c = i % cols
        const r = Math.floor(i / cols)
        add(lookOf({ look: id }), (c - (cols - 1) / 2) * 1.5, (r - (rows - 1) / 2) * 1.9, 0.25)
      })
      cam = { x: 0, z: 0.2, w: cols * 1.5 + 0.6, d: rows * 1.9 + 1.2 }
    },

    strip(o) {
      clear()
      liveOpts = null
      const n = o.frames ?? 8
      const hitAt = o.hitAt ?? 0.22
      const end = o.end ?? hitAt + 0.44
      const look = lookOf(o)
      // Frames spread over the action, with one exactly on the hit.
      const times: number[] = []
      const before = Math.max(2, Math.round(n * 0.45))
      for (let i = 0; i < before; i++) times.push((hitAt * i) / before)
      times.push(hitAt)
      const after = n - before - 1
      for (let i = 1; i <= after; i++) times.push(hitAt + ((end + 0.12 - hitAt) * i) / after)
      const yaws = o.yaws ?? [o.yaw ?? 0.5]
      yaws.forEach((yaw, r) => {
        times.forEach((t, i) => {
          const a = add(look, (i - (times.length - 1) / 2) * 1.7, (r - (yaws.length - 1) / 2) * 2.3, yaw, o)
          playTo(a, o, t)
          a.act = o
        })
      })
      // The strip is a set of stills: stop the clock on it.
      cancelAnimationFrame(raf)
      raf = 0
      cam = { x: 0, z: 0.1, w: times.length * 1.7 + 0.8, d: 1.3 + yaws.length * 2.3 }
      frame()
    },

    gear() {
      clear()
      liveOpts = null
      const base = heroLook(starter())
      const heads: HeadGear[] = ['short', 'hood', 'leathercap', 'helm', 'greathelm', 'circlet', 'hat', 'wizard', 'cap']
      const kinds: GearKind[] = ['none', 'cloth', 'leather', 'plate']
      const tiers = ['#c9a24a', '#5fd08a', '#5f9fff', '#b06aff']
      heads.forEach((head, c) => {
        kinds.forEach((g, r) => {
          const metal = head === 'helm' || head === 'greathelm'
          const look: Look = {
            ...base, head, style: 'short', headCol: head === 'short' ? undefined : metal ? '#c9d3e4' : head === 'circlet' ? '#ffd24a' : '#8a5f3a',
            headTrim: tiers[r], gloves: g, gloveTrim: tiers[r], boots: g, bootTrim: tiers[r],
            outfit: r === 3 ? 'plate' : r === 2 ? 'leather' : r === 1 ? 'robe' : 'tunic', pauldrons: r === 3, cape: r >= 2 ? tiers[r] : undefined, trim: tiers[r]!
          }
          add(look, (c - (heads.length - 1) / 2) * 1.5, (r - 1.5) * 1.9, 0.3)
        })
      })
      cam = { x: 0, z: 0.2, w: heads.length * 1.5 + 0.6, d: 4 * 1.9 + 1.2 }
      if (!raf) raf = requestAnimationFrame(tick)
    },

    live(o) {
      clear()
      liveOpts = o
      if (o) add(lookOf(o), 0, 0, o.yaw ?? 0.5, o)
      cam = { x: 0, z: 0.2, w: 4.5, d: 3.6 }
      if (!raf) raf = requestAnimationFrame(tick)
    },

    dispose() {
      cancelAnimationFrame(raf)
      clear()
      trails.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      delete (window as unknown as { __bench?: Bench }).__bench
    }
  }
  const grid = api.grid
  api.grid = (ids) => { grid(ids); if (!raf) raf = requestAnimationFrame(tick) }
  ;(window as unknown as { __bench: Bench }).__bench = api
  api.grid()
  return api
}
