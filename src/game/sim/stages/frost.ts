import { Color } from 'three'
import { CELL, cellCenter, type Terrain, type VentSpec } from '../../world/levelGen'
import type { ParticleSpec } from '../../fx/particles'
import { buildFrostNozzle, type NozzleMesh } from '../../models/stageProps/frost'
import type { ClimbBody, ClimbHost } from '../climb'
import { PLAYER_R } from '../constants'
import { AtlasCue, type MoveMod, type StageFeature } from '../stageFeatures'

/**
 * ─── Frost throwers (Glacier Run) ────────────────────────────────────────────
 *
 * A `Terrain.vents` entry of kind 'frost' is a nozzle on the wall behind
 * cell (i, j), its mouth at height `y`, blasting a cone of frost along
 * (dx, dz) across the room — as far as the floor runs level, FROST_REACH
 * cells at most — for `on` s of every `period` (offset by `phase`, on the
 * mission clock). Before each blast it telegraphs for FROST_WARN s: the
 * mouth glows up, it hisses, the floor of its lane is marked.
 *
 * A hit (not blockable) costs FROST_COST of the health and SLOWS Flux for
 * SLOW_TIME s: through the `move` hook, a push against his own velocity takes
 * FROST_SLOW of each step's walk away (on the ground only — a dash leap is
 * never shortened into the spikes). One hit per blast.
 *
 * Fire vents are another feature's (the blaze stage); this one ignores them.
 */

export const FROST_WARN = 0.9
const FROST_REACH = 5
export const FROST_COST = 0.1
export const FROST_SLOW = 0.4
export const SLOW_TIME = 2
/** The cone: half its width at the mouth (m), and how much it widens per
 *  metre along. */
const CONE_W0 = 0.9
const CONE_SPREAD = 0.12
/** Frost off the mouth per step while it blasts. */
const PUFFS = 3

const GLOW = {
  rest: new Color('#16303f'),
  warn: new Color('#7ff4ff'),
  blast: new Color('#ffffff')
}

interface NozzleRt {
  def: VentSpec
  /** The mouth on the wall face, the floor of the lane, its length (m). */
  mx: number
  mz: number
  floor: number
  len: number
  /** The first lane cell's centre (what a hit comes from). */
  fx: number
  fz: number
  mesh: NozzleMesh
  warned: number
  hitCyc: number
}

/** Where along and across a nozzle's lane (x, z) lies (m). */
const laneOf = (n: NozzleRt, x: number, z: number): [along: number, across: number] => {
  const rx = x - n.mx
  const rz = z - n.mz
  return [rx * n.def.dx + rz * n.def.dz, Math.abs(rx * -n.def.dz + rz * n.def.dx)]
}

/** A body at (x, z) is in the blast of nozzle `n` (heights aside). */
export const inFrostCone = (n: Pick<NozzleRt, 'def' | 'mx' | 'mz' | 'len'>, x: number, z: number): boolean => {
  const [along, across] = laneOf(n as NozzleRt, x, z)
  return along > -0.2 && along < n.len + 0.3 && across < CONE_W0 + Math.max(0, along) * CONE_SPREAD + PLAYER_R * 0.6
}

export class FrostThrowers implements StageFeature {
  private readonly host: ClimbHost
  readonly nozzles: NozzleRt[] = []
  private readonly cue: AtlasCue | null = null
  /** Seconds of the frost slow left. */
  slowT = 0
  private puff: ParticleSpec = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, color: '#dff8ff', size: 0.5, sizeEnd: 1.6, life: 0.55, drag: 1.5 }

  constructor(host: ClimbHost, t: Terrain) {
    this.host = host
    const map = host.map
    const W = map.w
    for (const v of t.vents ?? []) {
      if (v.kind !== 'frost') continue
      const k0 = v.j * W + v.i
      const floor = t.floor[k0]!
      // The lane: level floor of the same room, straight out from the wall.
      let n = 0
      for (let s = 0; s < FROST_REACH; s++) {
        const i = v.i + v.dx * s
        const j = v.j + v.dz * s
        if (i < 0 || j < 0 || i >= W || j >= map.h) break
        const k = j * W + i
        if (map.room[k] !== map.room[k0] || t.pit[k] || Math.abs(t.floor[k]! - floor) > 0.3) break
        n++
      }
      const mx = cellCenter(v.i) - v.dx * CELL / 2
      const mz = cellCenter(v.j) - v.dz * CELL / 2
      const mesh = buildFrostNozzle(host.theme)
      mesh.root.position.set(mx, v.y, mz)
      mesh.root.rotation.y = Math.atan2(v.dx, v.dz)
      host.propParent(mx, mz).add(mesh.root)
      this.nozzles.push({
        def: v, mx, mz, floor, len: Math.max(1, n) * CELL, fx: cellCenter(v.i), fz: cellCenter(v.j), mesh, warned: -1, hitCyc: -1
      })
    }
    const f = this.nozzles[0]
    if (f) {
      this.cue = new AtlasCue(host, 'hint.cryo.frost', f.mx + f.def.dx * f.len / 2, f.mz + f.def.dz * f.len / 2, f.floor, 8)
    }
  }

  move(p: ClimbBody, out: MoveMod): void {
    if (this.slowT <= 0 || !p.ground) return
    out.pushX -= p.vx * FROST_SLOW
    out.pushZ -= p.vz * FROST_SLOW
  }

  update(dt: number, time: number, p: ClimbBody, playing: boolean): void {
    this.cue?.update(p, playing)
    if (this.slowT > 0) {
      this.slowT = Math.max(0, this.slowT - dt)
      // Rime on Flux while he is slowed.
      if (Math.random() < dt * 14) {
        const s = this.puff
        s.x = p.x + (Math.random() - 0.5) * 0.8
        s.y = p.y + 0.3 + Math.random() * 1.2
        s.z = p.z + (Math.random() - 0.5) * 0.8
        s.vx = s.vz = 0
        s.vy = 0.4
        s.size = 0.3
        this.host.fx.emit(s)
      }
    }
    for (const n of this.nozzles) this.stepNozzle(n, time, p, playing)
  }

  private stepNozzle(n: NozzleRt, time: number, p: ClimbBody, playing: boolean): void {
    const d = n.def
    const period = Math.max(d.period, FROST_WARN + d.on + 0.3)
    const clock = time + d.phase
    const cyc = Math.floor(clock / period)
    const u = clock - cyc * period
    const warning = u < FROST_WARN
    const blasting = !warning && u < FROST_WARN + d.on
    const glow = n.mesh.glowMat.color
    if (warning) glow.copy(GLOW.rest).lerp(GLOW.warn, u / FROST_WARN)
    else if (blasting) glow.copy(GLOW.blast)
    else glow.copy(GLOW.rest)
    if (warning && n.warned !== cyc) {
      n.warned = cyc
      this.host.sfx('trapHiss', n.fx, n.fz)
      // The lane's floor, marked cell by cell.
      for (let s = CELL / 2; s < n.len; s += CELL) {
        this.host.markers.spawn(n.mx + d.dx * s, n.mz + d.dz * s, 1.3, FROST_WARN + d.on)
      }
    }
    if (!blasting) return
    const s = this.puff
    for (let q = 0; q < PUFFS; q++) {
      const a = Math.random() * n.len
      const w = (Math.random() - 0.5) * 2 * (CONE_W0 + a * CONE_SPREAD) * 0.8
      s.x = n.mx + d.dx * a - d.dz * w
      s.z = n.mz + d.dz * a + d.dx * w
      s.y = d.y + (Math.random() - 0.6) * 0.9
      s.vx = d.dx * 7
      s.vz = d.dz * 7
      s.vy = -0.3
      s.size = 0.5 + Math.random() * 0.4
      this.host.fx.emit(s)
    }
    if (!playing || n.hitCyc === cyc || Math.abs(p.y - n.floor) > 1.2 || !inFrostCone(n, p.x, p.z)) return
    n.hitCyc = cyc
    const r = this.host.hitPlayer(null, Math.round(this.host.combat.maxHp * FROST_COST), { blockable: false, fromX: n.fx, fromZ: n.fz, kind: 'aoe' })
    if (r === 'hit') {
      this.slowT = SLOW_TIME
      this.host.sfx('freeze', p.x, p.z)
      this.host.fx.sparks(p.x, p.y + 1, p.z, '#bff4ff', 12, 4, 0.2)
    }
  }

  save(): unknown {
    return this.cue?.said ? 1 : 0
  }

  restore(s: unknown): void {
    if (this.cue) this.cue.said = s === 1
  }
}
