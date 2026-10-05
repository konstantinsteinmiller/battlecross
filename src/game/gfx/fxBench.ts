import {
  CapsuleGeometry, CircleGeometry, Color, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SRGBColorSpace, WebGLRenderer
} from 'three'
import type { DamageType, Projectile, SimEvent, StatusId, Unit } from '../sim/types'
import { CAM_FOV, CAM_PITCH } from '../engine/camera'
import { SHOT_KINDS, Vfx, type Blow, type ImpactOpts } from './vfx'

/**
 * ─── The effects bench (DEV only) ────────────────────────────────────────────
 *
 * Mounted by `/models` (the art bench's "Effects" tab), and scriptable as
 * `window.__fxbench`. The game's own `Vfx` on a bare ground under the game's
 * own camera angle, so an effect can be judged on its own and shot frame by
 * frame:
 *
 *   shots     every projectile kind, one lane each, flying left to right
 *   impacts   every damage type (and the three physical blows), landing in a grid
 *   statuses  a row of stand-in bodies, each under one status, as the body shows it
 *   play      any sim `fx` event (a burst, a breath, a beam, a pillar …)
 *   pause / step   stop the clock and advance it by hand (screenshots)
 *   ground    grass, snow or night: an effect must read on all three
 */

export interface FxBench {
  shots(kinds?: string[]): void
  impacts(crit?: boolean): void
  /** A row of stand-in bodies, each under one status (or a shield). */
  statuses(ids?: Array<StatusId | 'shield'>): void
  play(e: Omit<Extract<SimEvent, { t: 'fx' }>, 't'>): void
  impact(o: Partial<ImpactOpts>): void
  death(big: number, color?: string): void
  pause(on: boolean): void
  step(dt: number, frames?: number): void
  ground(kind: 'grass' | 'snow' | 'night'): void
  /** Look at a patch of ground `w` metres wide round (x, z). */
  frame(x: number, z: number, w: number): void
  clear(): void
  dispose(): void
}

const GROUNDS = { grass: '#6fae5a', snow: '#e8eef4', night: '#1e2430' }
const TYPES: DamageType[] = ['physical', 'pierce', 'fire', 'frost', 'holy', 'poison', 'acid', 'temporal', 'beam', 'shadow', 'blood']

const fakeShot = (fx: string, x: number, z: number, speed: number): Projectile => ({
  active: true, fx, team: 0, srcId: 0, x, z, y: 1, vx: speed, vz: 0, targetId: 0, speed, r: 0.3, life: 9,
  dmg: 0, type: 'physical', crit: false, aoe: 0, pierce: 0, hit: [], lob: 0, lobT: 0, tx: 0, tz: 0, skill: '', color: ''
} as unknown as Projectile)

export const mountFxBench = (host: HTMLElement): FxBench => {
  const renderer = new WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  host.appendChild(renderer.domElement)
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
  const scene = new Scene()
  const camera = new PerspectiveCamera(CAM_FOV, 1, 0.5, 300)
  const groundMat = new MeshBasicMaterial()
  const ground = new Mesh(new CircleGeometry(120, 32), groundMat)
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)
  const vfx = new Vfx(scene)

  let shots: Projectile[] = []
  let bodies: Array<{ u: Unit; mesh: Mesh }> = []
  const bodyGeo = new CapsuleGeometry(0.42, 0.7, 4, 12)
  const bodyMat = new MeshBasicMaterial({ color: '#8a8478' })
  let lanes: { x0: number; x1: number } = { x0: -8, x1: 8 }
  let paused = false
  let raf = 0
  let last = performance.now()
  let view = { x: 0, z: 0, w: 18 }

  const setGround = (kind: keyof typeof GROUNDS): void => {
    scene.background = new Color(GROUNDS[kind])
    groundMat.color.set(GROUNDS[kind]).multiplyScalar(0.92)
  }
  setGround('grass')

  const frame = (x: number, z: number, w: number): void => {
    view = { x, z, w }
    const W = host.clientWidth || 800
    const H = host.clientHeight || 450
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    // The distance that holds `w` metres across at the game's own lens and pitch.
    const d = w / 2 / Math.tan((CAM_FOV * Math.PI) / 360) / camera.aspect
    camera.position.set(x, Math.sin(CAM_PITCH) * d, z + Math.cos(CAM_PITCH) * d)
    camera.lookAt(x, 0.8, z)
    camera.updateProjectionMatrix()
    vfx.setViewport(H * renderer.getPixelRatio(), CAM_FOV)
  }

  const tick = (dt: number): void => {
    for (const p of shots) {
      p.x += p.vx * dt
      if (p.x > lanes.x1) p.x = lanes.x0
    }
    for (const b of bodies) vfx.statusTells(b.u, dt)
    vfx.syncProjectiles(shots, 0, dt)
    vfx.update(dt, 0)
    renderer.render(scene, camera)
  }

  const loop = (): void => {
    raf = requestAnimationFrame(loop)
    const now = performance.now()
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!paused) tick(dt)
  }

  const clear = (): void => {
    shots = []
    for (const b of bodies) scene.remove(b.mesh)
    bodies = []
    vfx.clear()
  }

  const bench: FxBench = {
    shots(kinds = SHOT_KINDS) {
      clear()
      const gap = 1.4
      const depth = (kinds.length - 1) * gap
      lanes = { x0: -9, x1: 9 }
      shots = kinds.map((k, i) => fakeShot(k, -9 + ((i * 5.3) % 18), -depth / 2 + i * gap, 11))
      frame(0, 0, 22)
    },
    impacts(crit = false) {
      clear()
      const cols = 6
      const all: Array<Partial<ImpactOpts>> = [
        ...(['slash', 'blunt', 'pierce'] as Blow[]).map(blow => ({ type: 'physical' as DamageType, blow })),
        ...TYPES.slice(1).map(type => ({ type }))
      ]
      // One at a time: the effects allow only a few full impacts a frame.
      all.forEach((o, i) => { bench.impact({ ...o, crit, x: -7.5 + (i % cols) * 3, z: -3 + Math.floor(i / cols) * 3 }); vfx.update(0, 0) })
      frame(0, 0, 20)
    },
    statuses(ids = ['burn', 'poison', 'bleed', 'stun', 'confuse', 'slow', 'frozen', 'fear', 'haste', 'enrage', 'regen', 'invulnerable', 'shield', 'stealth']) {
      clear()
      const cols = 7
      bodies = ids.map((id, i) => {
        const x = -9 + (i % cols) * 3
        const z = -2 + Math.floor(i / cols) * 4
        const u = { x, z, r: 0.45, h: 1.45, vx: -3, vz: 0, statuses: id === 'shield' ? [] : [{ id, t: 9, v: 1 }], shield: id === 'shield' ? 50 : 0 } as unknown as Unit
        const mesh = new Mesh(bodyGeo, bodyMat)
        mesh.position.set(x, 0.77, z)
        scene.add(mesh)
        return { u, mesh }
      })
      frame(0, 0, 22)
    },
    play(e) {
      vfx.play({ t: 'fx', ...e } as Extract<SimEvent, { t: 'fx' }>, () => 1.4)
    },
    impact(o) {
      vfx.impact({ x: 0, y: 0.9, z: 0, dx: 1, dz: 0, type: 'physical', blow: 'slash', heavy: false, crit: false, dot: false, size: 0.5, toHero: false, ...o })
    },
    death(big, color = '#c04a3a') {
      vfx.death(view.x, view.z, 1.4, color, big)
    },
    pause(on) { paused = on; last = performance.now() },
    step(dt, frames = 1) {
      for (let i = 0; i < frames; i++) tick(dt)
    },
    ground: setGround,
    frame,
    clear,
    dispose() {
      cancelAnimationFrame(raf)
      vfx.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      if ((window as unknown as { __fxbench?: FxBench }).__fxbench === bench) delete (window as unknown as { __fxbench?: FxBench }).__fxbench
    }
  }
  frame(0, 0, 18)
  loop()
  ;(window as unknown as { __fxbench?: FxBench }).__fxbench = bench
  return bench
}
