import type { EnemyKind } from '../models/enemies'
import type { MapData } from '../world/levelGen'
import { cellCenter } from '../world/levelGen'
import { hasLineOfSight, isSolidAt, type Nav } from '../world/nav'
import type { WalkthroughSave } from '../state/profile'
import type { Enemy } from './world'
import { roomAt } from './lessons'

/**
 * ─── The tutorial walkthrough: a lesson per room, a door per lesson ──────────
 *
 * "Wake-Up Call" is a guided walk along the main path, from the start pad to
 * the Scrapper's shutter. Every door on that path starts LOCKED (red lamp),
 * and a room's door out opens only once the player has DONE what the room
 * teaches — so nobody meets the boss, or the sectors after it, missing a
 * control or a mechanic the game takes for granted:
 *
 *   start  look and move (the coach, from the first frame), then the training
 *          drone: quick shots skip off its bubble, a charged shot pops it
 *   2nd    one Hardhat (shoot when it peeks), then a glowing crate that only
 *          a charged shot breaks
 *   3rd    one Shield Trooper: block its burst (a parry is welcome), a charge
 *          breaks its guard. Opens once it is down AND a block happened
 *   4th    one Stomper: slide out of its red ring. Opens once a slide happened
 *   5th    a chest: open it, and the boss shutter unlocks
 *
 * The Repair Tank is the coach's (low health, a tank carried), never a gate.
 * A lesson skipped by accident brings in another teacher — the Trooper down
 * before a single block: a Rotor Drone rams (blockable); the Stomper down
 * before a slide: another Stomper — and after a few the gate gives up rather
 * than trap anyone. A shorter path folds lessons together (the chest joins
 * the Stomper first); a longer one gives its extra rooms a plain "clear it"
 * gate.
 *
 * Wordless like the rest: the coach's glyphs and the scene lessons do the
 * teaching; the walkthrough only schedules them and keeps the doors. A door
 * it opens gets a chime, a pulse and a yellow lamp (the mission's part).
 * Pure logic over a small host, pinned by `tests/game/walkthrough.test.ts`.
 */

/** What a room teaches before its door out opens. */
export type WalkStep = 'charge' | 'crate' | 'block' | 'slide' | 'chest' | 'clear'

export interface WalkGate {
  /** The path room that teaches. */
  room: number
  /** Its door out along the path (the last gate's is the boss shutter). */
  door: number
  steps: WalkStep[]
}

export interface WalkPlan {
  /** The main path, start room first, up to the boss room's threshold. */
  path: number[]
  gates: WalkGate[]
}

/** The rooms after the start teach these, in order (the start: 'charge'). */
const TEACH: readonly WalkStep[] = ['crate', 'block', 'slide', 'chest']
/** The one machine that stands in a room for each step (the scripted cast). */
export const TEACHER: Record<WalkStep, EnemyKind | null> = {
  charge: null, crate: 'hardhat', block: 'trooper', slide: 'hopper', chest: null, clear: 'hardhat'
}
/** A room must have been quiet this long before its lesson moves in. */
const SETTLE = 1.2
/** A gate's conditions must hold this long before its door opens, so the
 *  lesson's check and the last death burst play first. */
const OPEN_DELAY = 0.8
/** Stand-in teachers a gate brings in before it opens anyway. */
export const MAX_HELPERS = 3
/** A prompt that found no floor to use tries again after this long (s). */
const RETRY = 1

/**
 * Which lessons each of `n` path rooms teaches, start room first. Four rooms
 * after the start: one lesson each. More: the extra rooms (before the chest,
 * which always opens the boss shutter) only need clearing. Fewer: the later
 * rooms take two, the chest joining the Stomper first.
 */
export const stepsFor = (n: number): WalkStep[][] => {
  if (n <= 0) return []
  if (n === 1) return [['charge', ...TEACH]]
  const m = n - 1
  const out: WalkStep[][] = [['charge']]
  if (m >= TEACH.length) {
    for (let k = 0; k < TEACH.length - 1; k++) out.push([TEACH[k]!])
    for (let k = TEACH.length; k < m; k++) out.push(['clear'])
    out.push([TEACH[TEACH.length - 1]!])
    return out
  }
  const base = Math.floor(TEACH.length / m)
  const extra = TEACH.length % m
  let at = 0
  for (let k = 0; k < m; k++) {
    const take = base + (k >= m - extra ? 1 : 0)
    out.push(TEACH.slice(at, at + take))
    at += take
  }
  return out
}

/** The main path (the map is a tree: the boss room's ancestors) and its gates. */
export const planWalkthrough = (map: MapData): WalkPlan => {
  const boss = map.rooms.find(r => r.role === 'boss')
  if (!boss || boss.parent < 0) return { path: [], gates: [] }
  const path: number[] = []
  for (let r = boss.parent; r >= 0; r = map.rooms[r]!.parent) path.unshift(r)
  const steps = stepsFor(path.length)
  const gates = path.map((room, k): WalkGate => {
    const next = k + 1 < path.length ? path[k + 1]! : boss.id
    return { room, door: map.rooms[next]!.door, steps: steps[k]! }
  })
  return { path, gates }
}

/** Where the player first stands in a room: the cell just inside the door
 *  leading in (the pad, for the start room). */
export const doorwayOf = (map: MapData, roomId: number): [number, number] => {
  const r = map.rooms[roomId]
  const d = r && r.door >= 0 ? map.doors[r.door] : undefined
  if (!d) return [map.start.x, map.start.z]
  return [cellCenter(d.i + (d.axis === 'x' ? d.dir : 0)), cellCenter(d.j + (d.axis === 'z' ? d.dir : 0))]
}

/** Where a stand-in teacher beams in: inside `roomId`, 4–11 m from the
 *  player, in sight, as near the middle of the view as the room allows. */
export const helperSpot = (
  nav: Nav, map: MapData, roomId: number, px: number, pz: number, yaw: number
): [number, number] | null => {
  const room = map.rooms[roomId]
  if (!room) return null
  let best: [number, number] | null = null
  let bestScore = Infinity
  for (const [i, j] of room.spots) {
    const x = cellCenter(i)
    const z = cellCenter(j)
    const d = Math.hypot(x - px, z - pz)
    if (d < 4 || d > 11 || isSolidAt(nav, x, z) || !hasLineOfSight(nav, px, pz, x, z)) continue
    let a = Math.atan2(-(x - px), -(z - pz)) - yaw
    while (a > Math.PI) a -= Math.PI * 2
    while (a < -Math.PI) a += Math.PI * 2
    const score = Math.abs(a) * 3 + Math.abs(d - 6)
    if (score < bestScore) {
      best = [x, z]
      bestScore = score
    }
  }
  return best
}

/** None of the room's own machines is standing (a boss never counts). */
const roomEmpty = (enemies: Enemy[], room: number): boolean => {
  for (let k = 0; k < enemies.length; k++) {
    const e = enemies[k]!
    if (e.room === room && e.state !== 'dead' && !e.boss) return false
  }
  return true
}

/** What the walkthrough needs from the mission. */
export interface WalkHost {
  time: number
  map: MapData
  player: { x: number; z: number }
  enemies: Enemy[]
  lessons: {
    /** Step one's training drone still hovers. */
    readonly droneUp: boolean
    /** The crate lesson's crate broke (this mission). */
    readonly crateBroken: boolean
    /** Light the crate lesson in `room`; false while no crate can be shown. */
    startCrate(room: number): boolean
    /** A floor glow under a scripted scene's subject (the chest). */
    spotlight(x: number, z: number, on: boolean): void
  }
  objects: { chests: ReadonlyArray<{ opened: boolean }> }
  /** Shut a path door: locked, red lamp, nobody through. */
  holdDoor(id: number): void
  /** Open it for good: a yellow lamp, a chime, a pulse at the door. */
  releaseDoor(id: number): void
  /** Beam a stand-in teacher into `room`, in view of the player. */
  bringIn(kind: 'heli' | 'hopper', room: number): boolean
  /** Progress worth a checkpoint (the resume snapshot). */
  checkpoint(): void
}

/** The chest step's chest: its id in `MissionObjects.chests`, and where. */
export interface WalkChest {
  id: number
  x: number
  z: number
}

export class Walkthrough {
  readonly plan: WalkPlan
  private h: WalkHost
  private chest: WalkChest | null
  /** Gates passed; the one at this index is the one being taught. */
  private gate = 0
  private blocked = false
  private slid = false
  private crate = false
  private crateLive = false
  private helpers = 0
  private clearAt = -1
  private readyAt = -1
  private retryAt = -1
  private lit = false

  constructor(host: WalkHost, plan: WalkPlan, chest: WalkChest | null = null) {
    this.h = host
    this.plan = plan
    this.chest = chest
  }

  /** Until every gate before the boss is passed. */
  get active(): boolean {
    return this.gate < this.plan.gates.length
  }

  /** Gates passed so far. */
  get passed(): number {
    return this.gate
  }

  /** The gate being taught now, if any. */
  get current(): WalkGate | null {
    return this.plan.gates[this.gate] ?? null
  }

  /** Step one still needs its training drone (the mission places it at build). */
  get needsDrone(): boolean {
    return this.current?.steps.includes('charge') ?? false
  }

  /** Lock every door not yet earned: at build, after a resume restored the
   *  progress (the doors already passed are open or open on approach). */
  start(): void {
    for (let k = this.gate; k < this.plan.gates.length; k++) this.h.holdDoor(this.plan.gates[k]!.door)
  }

  /** A block or a parry landed (anywhere in the mission). */
  noteBlock(): void {
    if (this.blocked) return
    this.blocked = true
    this.h.checkpoint()
  }

  /** The player slid. */
  noteSlide(): void {
    if (this.slid) return
    this.slid = true
    this.h.checkpoint()
  }

  /** Per sim step. Allocation-free. */
  update(playing: boolean, fighting: boolean): void {
    const g = this.plan.gates[this.gate]
    if (!g) return
    const h = this.h
    // The chest step's chest glows on the floor until it is open.
    const c = this.chest
    const glow = !!c && g.steps.includes('chest') && !this.chestOpen()
    if (glow !== this.lit) {
      this.lit = glow
      if (c) h.lessons.spotlight(c.x, c.z, glow)
    }
    if (!playing) return
    const clear = !fighting && roomEmpty(h.enemies, g.room)
    if (!clear) this.clearAt = -1
    else if (this.clearAt < 0) this.clearAt = h.time
    for (let k = 0; k < g.steps.length; k++) {
      const s = g.steps[k]!
      if (this.met(s, clear)) continue
      this.readyAt = -1
      const settled = this.clearAt >= 0 && h.time - this.clearAt >= SETTLE
      if (settled && h.time >= this.retryAt && roomAt(h.map, h.player.x, h.player.z) === g.room) this.prompt(s, g.room)
      return
    }
    if (this.readyAt < 0) this.readyAt = h.time
    else if (h.time - this.readyAt >= OPEN_DELAY) this.pass(g)
  }

  private chestOpen(): boolean {
    const c = this.chest
    return !c || !!this.h.objects.chests[c.id]?.opened
  }

  private met(s: WalkStep, clear: boolean): boolean {
    const h = this.h
    switch (s) {
      case 'charge':
        return !h.lessons.droneUp
      case 'crate':
        if (!this.crate && this.crateLive && h.lessons.crateBroken) {
          this.crate = true
          // The crate lesson borrowed the floor glow: a chest sharing the
          // room (a folded path) gets it back on the next step.
          this.lit = false
          h.checkpoint()
        }
        return clear && this.crate
      case 'block':
        return clear && (this.blocked || this.helpers >= MAX_HELPERS)
      case 'slide':
        return clear && (this.slid || this.helpers >= MAX_HELPERS)
      case 'chest':
        return this.chestOpen()
      case 'clear':
        return clear
    }
  }

  /** The room is quiet and the player in it, but the step is not done: bring
   *  in what teaches it (the crate lesson, another machine). */
  private prompt(s: WalkStep, room: number): void {
    const h = this.h
    if (s === 'crate') {
      if (!this.crateLive) this.crateLive = h.lessons.startCrate(room)
      if (!this.crateLive) this.retryAt = h.time + RETRY
    } else if ((s === 'block' || s === 'slide') && this.helpers < MAX_HELPERS) {
      if (h.bringIn(s === 'block' ? 'heli' : 'hopper', room)) {
        this.helpers++
        this.clearAt = -1
      } else {
        this.retryAt = h.time + RETRY
      }
    }
  }

  private pass(g: WalkGate): void {
    const h = this.h
    h.releaseDoor(g.door)
    this.gate++
    this.clearAt = -1
    this.readyAt = -1
    this.retryAt = -1
    this.crateLive = false
    this.helpers = 0
    if (this.lit && this.chest) {
      this.lit = false
      h.lessons.spotlight(this.chest.x, this.chest.z, false)
    }
    h.checkpoint()
  }

  // ─── Resume ────────────────────────────────────────────────────────────────

  save(): WalkthroughSave {
    return { gate: this.gate, crate: this.crate, block: this.blocked, slide: this.slid }
  }

  /** Before `start()`: the snapshot's progress (anything malformed reads as none). */
  restore(s: WalkthroughSave | null | undefined): void {
    if (!s || typeof s !== 'object') return
    const n = Number(s.gate)
    this.gate = Number.isFinite(n) ? Math.max(0, Math.min(this.plan.gates.length, Math.floor(n))) : 0
    this.crate = s.crate === true
    this.blocked = s.block === true
    this.slid = s.slide === true
  }
}
