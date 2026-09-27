import type { Door, MapData } from '../world/levelGen'
import { CELL, Cell, cellCenter } from '../world/levelGen'
import { mulberry32 } from '../world/rng'
import { scaleDmg } from '../data/enemies'

/**
 * ─── Corridor traps: something to watch between two rooms ───────────────────
 *
 * The walk from room to room was dead time. Now one or two corridors per map
 * carry a trap you can SEE coming and time your way through:
 *
 *   flame  Nozzles in a side wall (or both). A cycle: idle → WARN (the
 *          nozzles glow and spit sparks, a hiss, the floor strip lights up)
 *          → BURN (a sheet of fire across the whole corridor) → cool. It is a
 *          red-ring rule: it cannot be blocked, and Slide's i-frames go
 *          straight through it.
 *   blade  A pendulum blade hung from a gantry on the wall tops, sweeping the
 *          passage from wall to wall. A whoosh as it comes down, a red line on
 *          the floor where it swings and its shadow running along it. Go right
 *          after it passes your side — or slide.
 *
 * Rules, each against a way a trap could feel cheap:
 * - Never where a fight could land on top of it: not in the start room's
 *   corridors, not in the boss shutter's, never on a door's own cell. And
 *   while a fight is on, every trap PARKS — a flame holds its idle, a blade
 *   latches at the top of its swing — until the room is quiet again.
 * - One hit is 12 at level 1 (an eighth of the bar), scaled like the
 *   machines' damage, with the usual hurt i-frames: a mistake, never a death.
 * - They hurt Flux only. Machines walk through; tap-to-move paths too — the
 *   player's call.
 * - Placed from the map seed with its OWN stream, so the map itself, and the
 *   tests that pin the tutorial's layout, never change.
 *
 * The tutorial gets no random trap. It has one scripted pressure plate: the
 * Repair Gel corridor (`walkthrough.ts`), which the walkthrough trips itself.
 *
 * Pure logic over a small host; the meshes are `models/traps.ts`, handed in as
 * views, so `tests/game/traps.test.ts` runs without a GPU.
 */

export type TrapKind = 'flame' | 'blade'
/** A flame's cycle; a spent plate stays dark for good. */
export type TrapStage = 'idle' | 'warn' | 'burn' | 'cool' | 'spent'

export interface TrapSpot {
  kind: TrapKind
  /** The door at the far end of its corridor. */
  door: number
  /** The room the corridor leaves (its mesh group owns the corridor). */
  room: number
  /** The corridor cell. */
  i: number
  j: number
  /** The corridor runs along this axis. */
  axis: 'x' | 'z'
  /** World centre of the cell. */
  x: number
  z: number
  /** Seconds into the cycle at the start, so two traps never pulse in step. */
  phase: number
  /** Flame: which wall the nozzles sit in (+1 / −1, local X), 0 for both.
   *  Blade: the side it swings out to first. */
  side: -1 | 0 | 1
  /** The tutorial's pressure plate: bursts once, when the walkthrough trips it. */
  plate: boolean
}

// ── The flame's cycle (s) ──
export const FLAME_IDLE = 1.8
export const FLAME_WARN = 0.8
export const FLAME_BURN = 1.0
export const FLAME_COOL = 0.5
export const FLAME_CYCLE = FLAME_IDLE + FLAME_WARN + FLAME_BURN + FLAME_COOL
/** Half the fire sheet's depth along the corridor (m). */
export const FLAME_HALF = 0.55
/** The plate's one burst (s), then its embers. */
export const PLATE_BURN = 1.1
export const PLATE_COOL = 0.9

// ── The blade ──
/** A full swing, there and back (s). */
export const BLADE_PERIOD = 2.4
/** How far it swings out (rad): its tip stops just short of the walls. */
export const BLADE_AMP = 0.28
/** Pivot to the blade's middle (m). The pivot sits on a gantry over the
 *  walls, so the blade passes at chest height. */
export const BLADE_ARM = 3.55
/** Half its length along the swing, half its thickness along the corridor (m). */
export const BLADE_HALF_W = 0.35
export const BLADE_HALF_T = 0.12
/** A blade slower than this (rad/s) is latched, and cuts nothing. */
const BLADE_LIVE = 0.2

/** Hazards judge Flux by his body, not by the generous wall-collision radius
 *  (`PLAYER_R`, which keeps the camera off the pilasters). */
export const BODY_R = 0.3
/** Level-1 damage of one hit: an eighth of the starting bar. */
export const TRAP_DMG = 12
/** Sounds and sparks carry this far (m), and only from a room on screen. */
const HEAR = 18
/** The trap stream's salt: the map's own stream must never move. */
const SALT = 0x7a9b1e5d

export const trapDamage = (level: number): number => scaleDmg(TRAP_DMG, level)

/**
 * The cells of the corridor ending at `door`, from the room it leaves (first)
 * to the door's own cell (last) — the corridor belongs to the room it leaves
 * (`levelMesh.cellOwners`).
 */
export const corridorCells = (map: MapData, door: Door): Array<[number, number]> => {
  const out: Array<[number, number]> = []
  const di = door.axis === 'x' ? -door.dir : 0
  const dj = door.axis === 'z' ? -door.dir : 0
  let i = door.i
  let j = door.j
  let guard = 0
  while (map.cell[j * map.w + i] === Cell.Corridor && guard++ < 24) {
    out.push([i, j])
    i += di
    j += dj
  }
  return out.reverse()
}

/** The rooms from the pad to the mission's goal, both ends included: the boss
 *  room, else the objective room (the deepest one). */
export const mainPath = (map: MapData): Set<number> => {
  const goal = map.rooms.find(r => r.role === 'boss') ?? map.rooms.find(r => r.role === 'objective')
  const out = new Set<number>()
  for (let r = goal ? goal.id : -1; r >= 0; r = map.rooms[r]!.parent) out.add(r)
  return out
}

const spotIn = (door: Door, cell: [number, number], kind: TrapKind, phase: number, side: -1 | 0 | 1, plate = false): TrapSpot => ({
  kind, door: door.id, room: door.from, i: cell[0], j: cell[1], axis: door.axis,
  x: cellCenter(cell[0]), z: cellCenter(cell[1]), phase, side, plate
})

/**
 * One or two traps for a regular map, in corridors on or just off the main
 * path, longer corridors first; never the start room's, never the boss
 * shutter's, never on a door's own cell (the trap takes the middle of the
 * cells before it). Deterministic from the map seed. None in the tutorial.
 */
export const planTraps = (map: MapData, opts: { tutorial?: boolean } = {}): TrapSpot[] => {
  if (opts.tutorial) return []
  const rng = mulberry32((map.seed ^ SALT) >>> 0)
  const path = mainPath(map)
  const start = map.rooms.find(r => r.role === 'start')?.id ?? 0
  const cands: Array<{ door: Door; cells: Array<[number, number]>; score: number }> = []
  for (const d of map.doors) {
    if (d.boss || d.from === start) continue
    const cells = corridorCells(map, d)
    if (cells.length < 2) continue
    const onPath = path.has(d.to)
    if (!onPath && !path.has(d.from)) continue
    cands.push({ door: d, cells, score: (onPath ? 2 : 0) + (cells.length >= 3 ? 1.5 : 0) + rng() * 1.2 })
  }
  cands.sort((a, b) => b.score - a.score)
  const n = Math.min(cands.length, rng() < 0.55 ? 2 : 1)
  const first: TrapKind = rng() < 0.5 ? 'flame' : 'blade'
  const out: TrapSpot[] = []
  for (let k = 0; k < n; k++) {
    const c = cands[k]!
    const kind: TrapKind = k === 0 ? first : first === 'flame' ? 'blade' : 'flame'
    const cell = c.cells[Math.floor((c.cells.length - 1) / 2)]!
    const phase = rng() * (kind === 'flame' ? FLAME_CYCLE : BLADE_PERIOD)
    const roll = rng()
    const side: -1 | 0 | 1 = kind === 'flame' ? (roll < 0.5 ? 0 : roll < 0.75 ? 1 : -1) : roll < 0.5 ? 1 : -1
    out.push(spotIn(c.door, cell, kind, phase, side))
  }
  return out
}

/** The tutorial's pressure plate: the corridor cell just before `doorId`'s
 *  own, nozzles in both walls. Null when the corridor is a single cell. */
export const plateSpot = (map: MapData, doorId: number): TrapSpot | null => {
  const d = map.doors[doorId]
  if (!d) return null
  const cells = corridorCells(map, d)
  if (cells.length < 2) return null
  return spotIn(d, cells[cells.length - 2]!, 'flame', 0, 0, true)
}

// ─── Geometry in a trap's frame ──────────────────────────────────────────────
// Local Z runs along the corridor, local X across it (the view is rotated to
// match: for an X corridor, local +X is world −Z).

/** How far along the corridor from the trap (m). */
export const alongOf = (s: TrapSpot, px: number, pz: number): number => s.axis === 'x' ? px - s.x : pz - s.z
/** How far across the corridor from its middle (m, local X). */
export const acrossOf = (s: TrapSpot, px: number, pz: number): number => s.axis === 'x' ? s.z - pz : px - s.x

/** Where in its cycle a flame is at time `t` (its own clock). */
export const flameStage = (t: number): TrapStage => {
  const u = ((t % FLAME_CYCLE) + FLAME_CYCLE) % FLAME_CYCLE
  if (u < FLAME_IDLE) return 'idle'
  if (u < FLAME_IDLE + FLAME_WARN) return 'warn'
  if (u < FLAME_IDLE + FLAME_WARN + FLAME_BURN) return 'burn'
  return 'cool'
}

/** 0..1 through the current stage of a flame at time `t`. */
export const flameK = (t: number): number => {
  const u = ((t % FLAME_CYCLE) + FLAME_CYCLE) % FLAME_CYCLE
  if (u < FLAME_IDLE) return u / FLAME_IDLE
  if (u < FLAME_IDLE + FLAME_WARN) return (u - FLAME_IDLE) / FLAME_WARN
  if (u < FLAME_IDLE + FLAME_WARN + FLAME_BURN) return (u - FLAME_IDLE - FLAME_WARN) / FLAME_BURN
  return (u - FLAME_IDLE - FLAME_WARN - FLAME_BURN) / FLAME_COOL
}

/** Inside the fire sheet: the whole width of the corridor, a body deep. */
export const inFlame = (s: TrapSpot, px: number, pz: number): boolean =>
  Math.abs(alongOf(s, px, pz)) < FLAME_HALF + BODY_R && Math.abs(acrossOf(s, px, pz)) < CELL / 2 + 0.2

/** The blade's swing angle (rad, + = toward local +X for `side` +1). */
export const bladeAngle = (t: number, side: -1 | 0 | 1 = 1): number =>
  (side < 0 ? -1 : 1) * BLADE_AMP * Math.sin((t / BLADE_PERIOD) * Math.PI * 2)

/** Its angular speed (rad/s). */
export const bladeSpeed = (t: number, side: -1 | 0 | 1 = 1): number =>
  (side < 0 ? -1 : 1) * BLADE_AMP * ((Math.PI * 2) / BLADE_PERIOD) * Math.cos((t / BLADE_PERIOD) * Math.PI * 2)

/** The blade at `angle` cuts through Flux standing at (px, pz). */
export const bladeHits = (s: TrapSpot, angle: number, px: number, pz: number): boolean =>
  Math.abs(alongOf(s, px, pz)) < BLADE_HALF_T + BODY_R
  && Math.abs(acrossOf(s, px, pz) - BLADE_ARM * Math.sin(angle)) < BLADE_HALF_W + BODY_R

/** The next top of the swing out (sin = 1) strictly after `t`. */
const nextPeak = (t: number): number => {
  const p = Math.floor((t - BLADE_PERIOD / 4) / BLADE_PERIOD) * BLADE_PERIOD + BLADE_PERIOD / 4
  return p > t + 1e-6 ? p : p + BLADE_PERIOD
}

// ─── The live traps ──────────────────────────────────────────────────────────

export interface TrapState {
  readonly spot: TrapSpot
  /** The trap's own clock (s); it stops while the trap is parked. */
  t: number
  stage: TrapStage
  /** 0..1 through the stage. */
  k: number
  /** Blade: swing angle and angular speed. */
  angle: number
  speed: number
  /** Parked for a fight (a flame holding its idle, a blade latched up). */
  parked: boolean
}

/** The meshes of one trap (`models/traps.ts`). */
export interface TrapView {
  /** Per sim step: pose, glow, and emit its fire (only while on screen). */
  sync(s: TrapState, dt: number, time: number): void
  /** Its room is drawn this frame (portal culling): sounds and sparks only then. */
  readonly shown: boolean
}

/** What the traps need from the mission. */
export interface TrapHost {
  time: number
  player: { x: number; z: number }
  setup: { enemyLevel: number }
  hitPlayer(e: null, dmg: number, o: { blockable: boolean; fromX: number; fromZ: number; kind: 'melee' | 'aoe' | 'shot' }): unknown
  sfx(name: string, x?: number, z?: number): void
  shake(amount: number): void
}

/** What the mission passes each step. */
export interface TrapTick {
  /** Live play (no modal, not beaming): only then does a trap hurt. */
  playing: boolean
  /** A fight is on: every trap parks. */
  combat: boolean
}

export class TrapSystem {
  readonly traps: TrapState[]
  private views: Array<TrapView | null>
  private host: TrapHost

  constructor(host: TrapHost, spots: TrapSpot[], makeView: (s: TrapSpot) => TrapView | null = () => null) {
    this.host = host
    this.traps = spots.map((spot): TrapState => {
      const t = spot.plate ? 0 : spot.phase
      return {
        spot, t, stage: spot.kind === 'flame' && !spot.plate ? flameStage(t) : 'idle', k: 0,
        angle: spot.kind === 'blade' ? bladeAngle(t, spot.side) : 0, speed: 0, parked: false
      }
    })
    this.views = spots.map(makeView)
  }

  /** The tutorial's plate, if this map has one. */
  get plate(): TrapState | null {
    for (const s of this.traps) if (s.spot.plate) return s
    return null
  }

  /** Burst the plate now (the walkthrough decides when). False once spent. */
  trip(): boolean {
    const s = this.plate
    if (!s || s.stage !== 'idle') return false
    s.stage = 'burn'
    s.t = 0
    s.k = 0
    this.host.sfx('trapClick', s.spot.x, s.spot.z)
    this.host.sfx('flameJet', s.spot.x, s.spot.z)
    return true
  }

  /** The plate already went off (a resumed tutorial): dark from the start. */
  spendPlate(): void {
    const s = this.plate
    if (s) s.stage = 'spent'
  }

  /** Per sim step (the mission's `dt`: hit-stop slows them too). Allocation-free. */
  update(dt: number, o: TrapTick): void {
    const h = this.host
    const p = h.player
    for (let n = 0; n < this.traps.length; n++) {
      const s = this.traps[n]!
      const sp = s.spot
      const view = this.views[n] ?? null
      const loud = Math.hypot(sp.x - p.x, sp.z - p.z) < HEAR && (!view || view.shown)
      if (sp.plate) this.stepPlate(s, dt)
      else if (sp.kind === 'flame') this.stepFlame(s, dt, o, loud)
      else this.stepBlade(s, dt, o, loud)
      view?.sync(s, dt, h.time)
    }
  }

  private stepPlate(s: TrapState, dt: number): void {
    if (s.stage === 'burn') {
      s.t += dt
      s.k = Math.min(1, s.t / PLATE_BURN)
      if (s.t >= PLATE_BURN) { s.stage = 'cool'; s.t = 0; s.k = 0 }
    } else if (s.stage === 'cool') {
      s.t += dt
      s.k = Math.min(1, s.t / PLATE_COOL)
      if (s.t >= PLATE_COOL) s.stage = 'spent'
    }
  }

  private stepFlame(s: TrapState, dt: number, o: TrapTick, loud: boolean): void {
    const before = s.stage
    // A fight parks it: it finishes the burst it is in, then holds its idle.
    s.parked = o.combat && before === 'idle'
    if (!s.parked) s.t += dt
    s.stage = flameStage(s.t)
    s.k = flameK(s.t)
    const sp = s.spot
    if (s.stage !== before && loud) {
      if (s.stage === 'warn') this.host.sfx('trapHiss', sp.x, sp.z)
      else if (s.stage === 'burn') this.host.sfx('flameJet', sp.x, sp.z)
    }
    const p = this.host.player
    if (s.stage === 'burn' && o.playing && inFlame(sp, p.x, p.z)) this.hurt(s)
  }

  private stepBlade(s: TrapState, dt: number, o: TrapTick, loud: boolean): void {
    const sp = s.spot
    if (o.combat) {
      // Swing on to the top of the next swing out and latch there.
      if (!s.parked) {
        const peak = nextPeak(s.t)
        if (s.t + dt >= peak) {
          s.t = peak
          s.parked = true
        } else s.t += dt
      }
    } else {
      s.parked = false
      s.t += dt
    }
    const prev = s.angle
    s.angle = bladeAngle(s.t, sp.side)
    s.speed = s.parked ? 0 : bladeSpeed(s.t, sp.side)
    // The whoosh swells as it comes down: cue it half-way in.
    const half = BLADE_AMP * 0.5
    if (loud && !s.parked && Math.abs(prev) > half && Math.abs(s.angle) <= half) this.host.sfx('bladeWhoosh', sp.x, sp.z)
    const p = this.host.player
    if (o.playing && Math.abs(s.speed) > BLADE_LIVE && bladeHits(sp, s.angle, p.x, p.z)) this.hurt(s)
  }

  /** One hit: unblockable, knocked back out along the corridor. */
  private hurt(s: TrapState): void {
    const h = this.host
    const p = h.player
    const sp = s.spot
    // From the trap's plane, level with Flux: the push runs along the corridor.
    const fromX = sp.axis === 'x' ? sp.x : p.x
    const fromZ = sp.axis === 'x' ? p.z : sp.z
    if (h.hitPlayer(null, trapDamage(h.setup.enemyLevel), { blockable: false, fromX, fromZ, kind: 'aoe' }) === 'hit') {
      h.shake(0.15)
    }
  }
}
