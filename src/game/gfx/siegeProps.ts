import { Group, InstancedMesh, Matrix4, Mesh, Quaternion, Vector3, type BufferGeometry, type Scene } from 'three'
import { sfx } from '../audio/sfx'
import { sceneQuality } from '../engine/quality'
import { RAM_KIND } from '../data/siege'
import { SIEGE_LAYOUT } from '../sim/siegeMap'
import { BALLISTA_KIND, GATE_KIND } from '../sim/siege'
import type { SimEvent } from '../sim/types'
import type { Sim } from '../sim/world'
import { celVC, celVCInst, glowVC, glowVCInst, outlineMat } from './cel'
import { groundAt } from './ground'
import { merge, paint, rbox, rcone, rcyl, sph, torus, xform } from './kit'
import type { Vfx } from './vfx'

/**
 * ─── The Siege of Bastion's props (afterplay §8, §12) ───────────────────────
 *
 * The fort's gate in its wall, the siege bell, the three ballista platforms
 * and the three cauldron stands are one merged mesh (one draw, one for its
 * outline, one for what glows): they never move and are there, empty or
 * built, from the start (`sim/siegeMap.ts` blocks their cells). What a build
 * phase adds and what the horde brings are instanced, one draw a kind:
 *
 *   ballistas  on the platforms of the lanes that have one, turned to their shot;
 *   fires      in the stands of the lanes whose cauldron is lit;
 *   rams       walking their lane, rocking as they go, swinging at the gate.
 *
 * The barricades are temporary walls (`terrain.ts`'s \`wallParts().barricade\`).
 * Every matrix is set only when something moved, from scratch objects: nothing
 * is allocated per frame.
 *
 * Each piece is built at the origin on flat ground, its front toward +Z (the
 * yard, the camera), inside the cells it blocks below a body's height; parts
 * of one piece never share a plane.
 */

const P = (g: BufferGeometry, hex: string, p?: [number, number, number], r?: [number, number, number], s?: number | [number, number, number]): BufferGeometry =>
  xform(paint(g, hex), p, r, s ?? 1)

export interface SiegePieceGeo { lit: BufferGeometry[]; glow: BufferGeometry[] }

const STONE = '#8a8278'
const STONE2 = '#6e675f'
const OAK = '#6a4a2e'
const OAK2 = '#57391f'
const IRON = '#3e3a3a'

/** The siege gate: two squat towers in the wall, the oak doors banded with iron between them, a lintel over all. 6 m wide, one cell deep. */
const gate = (): SiegePieceGeo => {
  const lit: BufferGeometry[] = []
  for (const sx of [-1, 1]) {
    lit.push(P(rbox(1.3, 5.0, 1.36, 0.12, 8, 10), STONE, [sx * 2.32, 2.5, 0]))
    // A darker course round the tower's foot, and its crown of merlons.
    lit.push(P(rbox(1.42, 0.5, 1.42, 0.2, 8, 4), STONE2, [sx * 2.32, 0.27, 0.005]))
    for (const dx of [-0.38, 0.38]) lit.push(P(rbox(0.42, 0.5, 0.5, 0.25, 6, 4), STONE2, [sx * 2.32 + dx, 5.22, 0.24]))
  }
  // The doors: two thick oak leaves, a finger's gap between them, banded with iron.
  for (const sx of [-1, 1]) {
    lit.push(P(rbox(1.62, 3.7, 0.46, 0.12, 8, 10), sx < 0 ? OAK : OAK2, [sx * 0.83, 1.885, 0.12]))
    for (const y of [0.7, 1.9, 3.1]) lit.push(P(rbox(1.5, 0.14, 0.12, 0.3, 6, 3), IRON, [sx * 0.83, y, 0.36]))
    lit.push(P(sph(0.09, 7, 5), IRON, [sx * 0.2, 1.95, 0.42]))
  }
  // The lintel over the doors, between the towers.
  lit.push(P(rbox(3.4, 0.8, 1.0, 0.18, 10, 4), STONE2, [0, 4.15, 0.02]))
  return { lit, glow: [P(rbox(0.16, 0.5, 0.1, 0.4, 4, 4), '#ffb04a', [-2.32, 3.4, 0.7]), P(rbox(0.16, 0.5, 0.1, 0.4, 4, 4), '#ffb04a', [2.32, 3.4, 0.7])] }
}

/** The siege bell: a timber frame on a stone foot, the bronze bell hung in it. */
const bell = (): SiegePieceGeo => ({
  lit: [
    P(rbox(1.34, 0.3, 1.34, 0.25, 8, 4), STONE2, [0, 0.15, 0]),
    P(rbox(0.2, 2.6, 0.2, 0.3, 6, 8), OAK, [-0.5, 1.6, 0]),
    P(rbox(0.2, 2.6, 0.2, 0.3, 6, 8), OAK, [0.5, 1.6, 0]),
    P(rbox(1.4, 0.2, 0.26, 0.3, 8, 4), OAK2, [0, 2.95, 0]),
    P(rcyl(0.04, 0.24, 0.01, 6, 1), IRON, [0, 2.76, 0]),
    P(rcone(0.36, 0.16, 0.62, 0.05, 14), '#b8862e', [0, 2.38, 0]),
    P(sph(0.08, 7, 5), '#7a5a1e', [0, 2.02, 0])
  ],
  glow: []
})

/** A ballista platform: a squared stone pad a step high. */
const platform = (): SiegePieceGeo => ({
  lit: [
    P(rbox(1.38, 0.42, 1.38, 0.2, 8, 4), STONE, [0, 0.21, 0]),
    P(rbox(1.2, 0.1, 1.2, 0.3, 8, 3), STONE2, [0, 0.46, 0.003])
  ],
  glow: []
})

/** A cauldron stand: an iron pot on three legs over a ring of stones (lit, its fire glows: `fireGlow`). */
const stand = (): SiegePieceGeo => {
  const lit: BufferGeometry[] = [P(rcyl(0.62, 0.26, 0.08, 12, 2), STONE2, [0, 0.13, 0])]
  for (let q = 0; q < 3; q++) {
    const a = (q / 3) * Math.PI * 2
    lit.push(P(rcyl(0.05, 1.5, 0.02, 6, 1), IRON, [Math.cos(a) * 0.36, 0.95, Math.sin(a) * 0.36], [Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3]))
  }
  lit.push(P(rcone(0.38, 0.5, 0.5, 0.06, 12), '#2e2a2a', [0, 1.42, 0]))
  lit.push(P(torus(0.5, 0.05, 6, 16), IRON, [0, 1.67, 0], [Math.PI / 2, 0, 0]))
  return { lit, glow: [] }
}

/** A ballista: a turning post, its stock along the lane, the bow across, a bolt laid in. Stands on a platform (y = its top). */
const ballista = (): SiegePieceGeo => ({
  lit: [
    P(rcyl(0.16, 0.5, 0.04, 8, 1), OAK2, [0, 0.25, 0]),
    P(rbox(0.32, 0.26, 1.5, 0.3, 6, 4), OAK, [0, 0.62, 0.1]),
    P(rbox(1.7, 0.16, 0.18, 0.4, 8, 3), OAK2, [0, 0.72, 0.62]),
    P(rcyl(0.035, 1.5, 0.01, 6, 1), '#c8b890', [0, 0.82, 0.25], [Math.PI / 2, 0, 0]),
    P(rcone(0.07, 0.005, 0.22, 0.01, 6), IRON, [0, 0.82, 1.08], [Math.PI / 2, 0, 0])
  ],
  glow: []
})

/** A battering ram: a log with an iron head on a wheeled frame under a hide roof. Its head toward +Z. */
const ram = (): SiegePieceGeo => {
  const lit: BufferGeometry[] = [
    P(rbox(1.1, 0.24, 2.3, 0.3, 8, 4), OAK2, [0, 0.52, 0]),
    P(rcyl(0.22, 2.7, 0.06, 10, 1), OAK, [0, 0.95, 0.15], [Math.PI / 2, 0, 0]),
    P(rcone(0.3, 0.18, 0.4, 0.04, 10), IRON, [0, 0.95, 1.62], [Math.PI / 2, 0, 0]),
    P(rcone(0.95, 0.12, 0.7, 0.04, 4), '#7a5a3a', [0, 1.62, -0.1], [0, Math.PI / 4, 0], [1, 1, 1.7])
  ]
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      lit.push(P(rcyl(0.3, 0.12, 0.04, 12, 1), '#3a2a1e', [sx * 0.62, 0.3, sz * 0.8], [0, 0, Math.PI / 2]))
      // The posts that carry the roof over the log.
      lit.push(P(rcyl(0.05, 0.72, 0.02, 6, 1), OAK2, [sx * 0.42, 0.98, sz * 0.86]))
    }
  }
  return { lit, glow: [] }
}

/** A lit cauldron's fire, over the pot of its stand. */
const fireGlow = (): SiegePieceGeo => ({
  lit: [],
  glow: [P(rcone(0.34, 0.02, 0.7, 0.02, 9), '#ffb02a', [0, 1.95, 0]), P(rcone(0.2, 0.01, 0.5, 0.01, 7), '#fff0a0', [0.05, 1.9, 0.04])]
})

/** Every siege piece, as the poke-through and coplanar audits read them. */
export const siegePieceParts = (): Record<'gate' | 'bell' | 'platform' | 'stand' | 'ballista' | 'ram' | 'fire', SiegePieceGeo> =>
  ({ gate: gate(), bell: bell(), platform: platform(), stand: stand(), ballista: ballista(), ram: ram(), fire: fireGlow() })

/** The fixed pieces, each placed where the siege's field has it (metres, turned to face the yard). */
export const siegeStatics = (): Array<{ piece: 'gate' | 'bell' | 'platform' | 'stand'; x: number; z: number; a: number }> => {
  const L = SIEGE_LAYOUT
  return [
    { piece: 'gate', x: L.gate.x, z: L.gate.z, a: 0 },
    { piece: 'bell', x: L.bell.x, z: L.bell.z, a: 0 },
    ...L.lanes.flatMap(l => [{ piece: 'platform' as const, x: l.platform.x, z: l.platform.z, a: 0 }, { piece: 'stand' as const, x: l.stand.x, z: l.stand.z, a: 0 }])
  ]
}

/** The fixed pieces in the world, merged: their solid parts and their glowing ones. */
export const siegeStaticGeo = (): { lit: BufferGeometry; glow: BufferGeometry } => {
  const parts = siegePieceParts()
  const lit: BufferGeometry[] = []
  const glow: BufferGeometry[] = []
  for (const s of siegeStatics()) {
    const y = groundAt(s.x, s.z)
    for (const g of parts[s.piece].lit) lit.push(g.clone().rotateY(s.a).translate(s.x, y, s.z))
    for (const g of parts[s.piece].glow) glow.push(g.clone().rotateY(s.a).translate(s.x, y, s.z))
  }
  const out = { lit: merge(lit), glow: merge(glow) }
  for (const p of Object.values(parts)) for (const g of [...p.lit, ...p.glow]) g.dispose()
  for (const g of [...lit, ...glow]) g.dispose()
  return out
}

/** A ballista's platform top: where it stands. */
const DECK = 0.51

const _m = new Matrix4()
const _q = new Quaternion()
const _p = new Vector3()
const _s = new Vector3()
const _up = new Vector3(0, 1, 0)

interface Slot { mesh: InstancedMesh; line: InstancedMesh | null; ids: number[] }

export class SiegeProps {
  private root = new Group()
  private geos: BufferGeometry[] = []
  private meshes: Array<Mesh | InstancedMesh> = []
  private ballistas!: Slot
  private rams!: Slot
  private fires!: InstancedMesh
  private litFires = [false, false, false]
  private low = sceneQuality() === 'low'

  constructor(private sim: Sim, private vfx: Vfx) {}

  build(scene: Scene): void {
    const st = siegeStaticGeo()
    this.geos.push(st.lit, st.glow)
    const body = new Mesh(st.lit, celVC())
    const line = new Mesh(st.lit, outlineMat())
    line.renderOrder = -1
    const shine = new Mesh(st.glow, glowVC())
    this.meshes.push(body, line, shine)
    const parts = siegePieceParts()
    const one = (k: 'ballista' | 'ram', n: number): Slot => {
      const g = merge(parts[k].lit)
      this.geos.push(g)
      const mesh = new InstancedMesh(g, celVCInst(), n)
      const ol = new InstancedMesh(g, outlineMat(undefined, undefined, true), n)
      ol.renderOrder = -1
      mesh.count = ol.count = 0
      this.meshes.push(mesh, ol)
      return { mesh, line: ol, ids: [] }
    }
    this.ballistas = one('ballista', 3)
    this.rams = one('ram', 2)
    const fg = merge(parts.fire.glow)
    this.geos.push(fg)
    this.fires = new InstancedMesh(fg, glowVCInst(), 3)
    this.fires.count = 0
    this.meshes.push(this.fires)
    for (const p of Object.values(parts)) for (const g of [...p.lit, ...p.glow]) g.dispose()
    for (const m of this.meshes) {
      m.frustumCulled = false
      this.root.add(m)
    }
    scene.add(this.root)
  }

  onEvent(e: SimEvent): void {
    const s = this.sim.siege
    if (!s) return
    if (e.t === 'hit' && e.tgt === s.gate && !e.dot) {
      const ps = this.vfx.particles
      for (let q = 0; q < (this.low ? 2 : 5); q++) {
        ps.emit({
          x: e.x + (Math.random() - 0.5) * 3, y: 0.6 + Math.random() * 2.6, z: e.z + 0.8, vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 2, vz: 1 + Math.random() * 1.5,
          color: q % 2 ? '#8a6a4a' : '#c8b890', size: 0.1, sizeEnd: 0.03, life: 0.5 + Math.random() * 0.3, gravity: 8, drag: 0.6
        })
      }
      if (e.heavy) sfx('hitHeavy', 0, 0.9)
    } else if (e.t === 'fx' && e.id === 'ballista') {
      sfx('shootBow', 0, 0.8)
    }
  }

  update(dt: number): void {
    const s = this.sim.siege
    if (!s) return
    const sim = this.sim
    // The ballistas that stand, each turned to its last shot.
    let n = 0
    for (let l = 0; l < s.ballistas.length; l++) {
      const b = s.ballistas[l] ? sim.live(s.ballistas[l]!) : undefined
      if (!b) continue
      _q.setFromAxisAngle(_up, b.facing)
      _p.set(b.x, groundAt(b.x, b.z) + DECK, b.z)
      _s.setScalar(1)
      _m.compose(_p, _q, _s)
      this.ballistas.mesh.setMatrixAt(n, _m)
      this.ballistas.line!.setMatrixAt(n, _m)
      n++
    }
    this.ballistas.mesh.count = this.ballistas.line!.count = n
    if (n) { this.ballistas.mesh.instanceMatrix.needsUpdate = true; this.ballistas.line!.instanceMatrix.needsUpdate = true }
    // The rams on the field, rocking on their wheels as they roll.
    n = 0
    for (const r of s.rams) {
      const u = sim.get(r.id)
      if (!u || (!u.alive && u.deadT > 1.2) || n >= 2) continue
      const sink = u.alive ? 0 : Math.min(1, u.deadT / 1.2)
      _q.setFromAxisAngle(_up, u.facing)
      const rock = u.anim === 'walk' ? Math.sin(sim.time * 9 + r.id) * 0.03 : u.anim === 'attack' ? Math.max(0, Math.sin(r.cd * 2.4)) * 0.12 : 0
      _p.set(u.x + Math.sin(u.facing) * rock, groundAt(u.x, u.z) - sink * 1.2, u.z + Math.cos(u.facing) * rock)
      _s.setScalar(sink >= 1 ? 0 : 1)
      _m.compose(_p, _q, _s)
      this.rams.mesh.setMatrixAt(n, _m)
      this.rams.line!.setMatrixAt(n, _m)
      n++
    }
    this.rams.mesh.count = this.rams.line!.count = n
    if (n) { this.rams.mesh.instanceMatrix.needsUpdate = true; this.rams.line!.instanceMatrix.needsUpdate = true }
    // The lit cauldrons: a flame over the pot, embers rising off it.
    n = 0
    const L = SIEGE_LAYOUT
    for (let l = 0; l < s.cauldrons.length; l++) {
      if (!s.cauldrons[l]) continue
      const st = L.lanes[l]!.stand
      const flick = 1 + Math.sin(sim.time * 13 + l * 2) * 0.08
      _q.identity()
      _p.set(st.x, groundAt(st.x, st.z), st.z)
      _s.set(1, flick, 1)
      _m.compose(_p, _q, _s)
      this.fires.setMatrixAt(n++, _m)
      if (!this.litFires[l]) { this.litFires[l] = true; this.vfx.ring(L.lanes[l]!.fire.x, L.lanes[l]!.fire.z, 0.4, 2.8, '#ff7a2a', 0.5); sfx('fire', 0, 0.8) }
      if (Math.random() < dt * (this.low ? 4 : 10)) {
        this.vfx.particles.emit({ x: st.x, y: 2.1, z: st.z, vx: (Math.random() - 0.5) * 0.5, vy: 1.2 + Math.random(), vz: (Math.random() - 0.5) * 0.5, color: '#ff8a2a', size: 0.12, sizeEnd: 0.02, life: 0.7 })
      }
    }
    this.fires.count = n
    if (n) this.fires.instanceMatrix.needsUpdate = true
  }

  dispose(): void {
    this.root.parent?.remove(this.root)
    for (const m of this.meshes) if ((m as InstancedMesh).isInstancedMesh) (m as InstancedMesh).dispose()
    for (const g of this.geos) g.dispose()
    this.meshes.length = 0
    this.geos.length = 0
  }
}

/** Kinds the scene draws as siege props, never as rigs. */
export const SIEGE_PROP_KINDS: ReadonlySet<string> = new Set([GATE_KIND, BALLISTA_KIND, RAM_KIND])
