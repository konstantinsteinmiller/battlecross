import { mulberry32, type Rng } from './rng'
import { createGrid, nearestOpen, type Grid } from './grid'
import type { HeroBuild } from './stats'
import type { ChestTier, LootKind } from '../data/loot'
import type { ChestRole } from './zoneFeatures'
import type {
  Action, Field, Projectile, SimEvent, Status, StatusId, Team, TempWall, Unit, UnitStats, Rank
} from './types'

/**
 * ─── The simulation world ────────────────────────────────────────────────────
 *
 * One `Sim` is one zone visit: the grid, every unit on it, the projectiles and
 * ground fields in flight, and the hero's own state (loadout, cooldowns, heat,
 * the rewind history). It advances in fixed steps (`step.ts`) and reports what
 * happened as `events`, which the view drains to draw, shake and play sounds.
 *
 * Nothing here imports three.js or Vue.
 */

/** What the hero is trying to do. */
export interface Order {
  /** `chest`: walk up to a chest and open it (`targetId` is the chest's id). */
  kind: 'none' | 'move' | 'attack' | 'interact' | 'chest'
  targetId: number
  x: number
  z: number
}

/** A cast waiting for the hero to walk into range. */
export interface QueuedCast {
  slot: number
  targetId: number
  x: number
  z: number
  /** The player aimed it (a drag): the point is kept even if a target moves. */
  aimed: boolean
}

export interface HeroSample {
  t: number
  x: number
  z: number
  hp: number
  mana: number
}

export interface HeroState {
  unit: Unit
  build: HeroBuild
  /** The six active slots (skill ids, '' = empty). */
  skills: string[]
  cd: number[]
  cdMax: number[]
  /** Heat gauge 0..100 and seconds of overheat lock-out left. */
  heat: number
  overheatT: number
  usesHeat: boolean
  potions: number
  potionsMax: number
  potionCd: number
  /** Mana potions: a carried stock (kept between visits), its cap and its own cooldown. */
  manaPotions: number
  manaPotionsMax: number
  manaPotionCd: number
  order: Order
  queued: QueuedCast | null
  /** The stick / keys this step, in world space (x right, z down-screen). */
  stickX: number
  stickZ: number
  /** Position, health and mana over the last seconds (Chrono Rewind). */
  history: HeroSample[]
  historyT: number
  /** The run's tally (the result screen). */
  xp: number
  gold: number
  kills: number
  items: string[]
  /** Chests opened this visit, and the chest being opened now (-1: none). */
  chests: number
  opening: number
  /** Damage the hero has dealt and taken (balance tests, the result screen). */
  dealt: number
  taken: number
  /** Minion damage multiplier (Charisma + Sovereign's Signet). */
  minionMul: number
  /** Level at the start of the visit and now (XP is banked live). */
  level: number
  xpInto: number
}

/** One encounter: a pack of enemies that wakes together. */
export interface GroupState {
  id: number
  x: number
  z: number
  /** Unit ids. */
  members: number[]
  awake: boolean
  cleared: boolean
  /** The pack that ends the zone (its boss or elite). */
  finale: boolean
  boss: string
  /** A side pack off the main chain: it never counts for the win or the HUD's
   *  pips, and it only notices a hero who walks right up to it. */
  optional?: boolean
  /** The over-levelled optional elite. */
  champion?: boolean
}

/** Side groups are numbered from here, so a unit's `group` tells which list it is in. */
export const SIDE_GROUP = 1000

/** One thing a chest holds, decided when the visit began. */
export interface LootDraw {
  kind: LootKind
  /** Gold: the pile. */
  gold: number
  /** Equipment: a roll 0..1 that picks the piece when the chest opens (so two
   *  chests never hand out the same new item), or a named piece. */
  u: number
  item: string
}

export interface ChestState {
  id: number
  x: number
  z: number
  /** Where the hero stands to open it. */
  sx: number
  sz: number
  tier: ChestTier
  role: ChestRole
  /** `hidden`: behind a door that has not opened. */
  state: 'hidden' | 'closed' | 'opening' | 'open'
  /** The door that hides it and the side group that guards it (-1: none). */
  door: number
  guard: number
  loot: LootDraw[]
  /** A one-time chest's save key ('' for a chest that refills each visit). */
  special: string
  /** Sim time it was opened at. */
  openedAt: number
}

export interface PlateState {
  id: number
  x: number
  z: number
  symbol: number
  /** Pressed in its turn: it stays lit. */
  lit: boolean
  /** The hero is standing on it. */
  down: boolean
}

export interface PuzzleState {
  /** Plate ids in order. */
  order: number[]
  /** How many of them have been pressed in turn. */
  step: number
  solved: boolean
  door: number
}

export interface DoorState {
  id: number
  cells: number[]
  x: number
  z: number
  open: boolean
}

export interface WaveState {
  n: number
  /** Seconds until the next wave spawns (after the last one is dead). */
  rest: number
  alive: number
}

export interface SimOptions {
  seed: number
  w: number
  h: number
  /** Enemy level of this visit. */
  level: number
  /** Health and damage multiplier from the difficulty setting. */
  difficulty: number
  mode: 'zone' | 'arena' | 'town'
  zone: string
}

export class Sim {
  /** The fight's dice. */
  rng: Rng
  readonly seed: number
  readonly grid: Grid
  readonly level: number
  readonly difficulty: number
  readonly mode: 'zone' | 'arena' | 'town'
  readonly zone: string
  time = 0
  units: Unit[] = []
  private byId = new Map<number, Unit>()
  private nextId = 1
  projectiles: Projectile[] = []
  fields: Field[] = []
  walls: TempWall[] = []
  events: SimEvent[] = []
  hero!: HeroState
  /** The MAIN chain's packs. The last one's fall wins the visit. */
  groups: GroupState[] = []
  /** Optional packs (a chest's guard, a champion): ids from `SIDE_GROUP`. */
  sideGroups: GroupState[] = []
  groupsDone = 0
  chests: ChestState[] = []
  plates: PlateState[] = []
  puzzle: PuzzleState | null = null
  doors: DoorState[] = []
  /** One-time chests opened this visit (their save keys). */
  specialOpened: string[] = []
  /** A won visit may close: the colosseum's purse is paid, or the hero chose
   *  to leave a zone and its beat has passed (`leaveVisit`). */
  endReady = false
  /** The hero pressed Leave (when, and whether the finale's chest was opened for him then). */
  leaving = false
  leaveAt = 0
  leaveOpened = false
  wave: WaveState = { n: 0, rest: 0, alive: 0 }
  /** Where waves spawn (arena) and where the zone's exit / chest stands. */
  spawnPoints: Array<[number, number]> = []
  ended: '' | 'victory' | 'defeat' = ''
  /** Seconds since the outcome was decided (the mode waits out a beat). */
  endedT = 0
  /** Loot tables for this visit (set by the director). */
  dropTable: { mob: string[]; chest: string[]; boss: string[]; secret: string[] } = { mob: [], chest: [], boss: [], secret: [] }
  /** Items the hero already owns (drops prefer something new). */
  owned = new Set<string>()
  /** Extra hostile packs from quest consequences (kind ids). */
  ambushers: string[] = []
  /** Things due later in sim time: a meteor's landing, a second strike. */
  private timers: Array<{ t: number; fn: () => void }> = []

  constructor(o: SimOptions) {
    this.rng = mulberry32(o.seed)
    this.seed = o.seed
    this.grid = createGrid(o.w, o.h)
    this.level = o.level
    this.difficulty = o.difficulty
    this.mode = o.mode
    this.zone = o.zone
  }

  emit(e: SimEvent): void {
    if (this.events.length < 400) this.events.push(e)
  }

  /** Run `fn` after `sec` seconds of SIM time (it stops with a pause or hit-stop). */
  after(sec: number, fn: () => void): void {
    this.timers.push({ t: this.time + sec, fn })
  }

  runTimers(): void {
    const ts = this.timers
    for (let i = ts.length - 1; i >= 0; i--) {
      if (ts[i]!.t > this.time) continue
      const fn = ts[i]!.fn
      ts.splice(i, 1)
      fn()
    }
  }

  /**
   * Run `fn` with another stream as the world's dice, then put the fight's
   * own back untouched. What a visit holds beside its packs is set up this
   * way, so a seed's battles roll exactly as they would in the bare zone.
   */
  withStream(rng: Rng, fn: () => void): void {
    const keep = this.rng
    this.rng = rng
    try { fn() } finally { this.rng = keep }
  }

  /** A unit's encounter group, main or side. */
  groupById(id: number): GroupState | undefined {
    return id >= SIDE_GROUP ? this.sideGroups[id - SIDE_GROUP] : id >= 0 ? this.groups[id] : undefined
  }

  get(id: number): Unit | undefined {
    return id > 0 ? this.byId.get(id) : undefined
  }

  /** A living unit by id, or undefined. */
  live(id: number): Unit | undefined {
    const u = id > 0 ? this.byId.get(id) : undefined
    return u && u.alive ? u : undefined
  }

  addUnit(o: {
    kind: string; team: Team; rank: Rank; level: number; x: number; z: number; r: number; h: number; s: UnitStats
    facing?: number; ownerId?: number; life?: number; group?: number; npc?: string; abilityCount?: number
  }): Unit {
    const p: [number, number] = [o.x, o.z]
    nearestOpen(this.grid, o.x, o.z, p)
    const u: Unit = {
      id: this.nextId++,
      kind: o.kind,
      team: o.team,
      rank: o.rank,
      level: o.level,
      x: p[0], z: p[1], px: p[0], pz: p[1], vx: 0, vz: 0,
      facing: o.facing ?? 0,
      r: o.r,
      h: o.h,
      hp: o.s.maxHp,
      mana: o.s.maxMana,
      shield: 0,
      shieldT: 0,
      alive: true,
      deadT: 0,
      s: o.s,
      statuses: [],
      targetId: 0,
      hasGoal: false,
      goalX: p[0],
      goalZ: p[1],
      path: [],
      pathI: 0,
      repathT: 0,
      attackCd: 0.2 + this.rng() * 0.5,
      action: null,
      cds: new Array<number>(o.abilityCount ?? 0).fill(0),
      ai: 'idle',
      aiT: 0,
      homeX: p[0],
      homeZ: p[1],
      group: o.group ?? -1,
      awake: o.team === 0,
      ownerId: o.ownerId ?? 0,
      life: o.life ?? -1,
      kx: 0,
      kz: 0,
      anim: 'idle',
      animT: this.rng() * 3,
      animStyle: 0,
      flinch: 0,
      swings: 0,
      phase: 1,
      npc: o.npc,
      icd: {}
    }
    this.units.push(u)
    this.byId.set(u.id, u)
    this.emit({ t: 'spawn', unit: u.id })
    return u
  }

  /** Drop units that have been dead long enough for their fade to finish. */
  sweep(): void {
    let w = 0
    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i]!
      if (!u.alive && u.deadT > 3 && u.rank !== 'hero') {
        this.byId.delete(u.id)
        continue
      }
      this.units[w++] = u
    }
    this.units.length = w
  }

  // ─── Queries ─────────────────────────────────────────────────────────────

  /** The nearest living unit of `team` to a point within `maxDist`, visible
   *  (not stealthed) to the asker. */
  nearest(team: Team, x: number, z: number, maxDist: number, skipId = 0): Unit | undefined {
    let best: Unit | undefined
    let bd = maxDist * maxDist
    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i]!
      if (!u.alive || u.team !== team || u.id === skipId || u.rank === 'npc') continue
      if (hasStatus(u, 'stealth')) continue
      const d = (u.x - x) * (u.x - x) + (u.z - z) * (u.z - z)
      if (d < bd) { bd = d; best = u }
    }
    return best
  }

  /** Every living unit of `team` whose body touches the circle. */
  inCircle(team: Team, x: number, z: number, r: number, out: Unit[]): Unit[] {
    out.length = 0
    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i]!
      if (!u.alive || u.team !== team || u.rank === 'npc') continue
      const rr = r + u.r
      if ((u.x - x) * (u.x - x) + (u.z - z) * (u.z - z) <= rr * rr) out.push(u)
    }
    return out
  }

  /** Every living unit of `team` inside a cone from (x, z) along angle `a`. */
  inCone(team: Team, x: number, z: number, a: number, len: number, half: number, out: Unit[]): Unit[] {
    out.length = 0
    const dx = Math.sin(a)
    const dz = Math.cos(a)
    const cos = Math.cos(half)
    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i]!
      if (!u.alive || u.team !== team || u.rank === 'npc') continue
      const ux = u.x - x
      const uz = u.z - z
      const d = Math.hypot(ux, uz)
      if (d > len + u.r) continue
      // A body right on top of the apex is in the cone whatever its bearing.
      if (d < u.r + 0.2 || (ux * dx + uz * dz) / d >= cos) out.push(u)
    }
    return out
  }

  /** Every living unit of `team` within `half` metres of a segment. */
  inLine(team: Team, x: number, z: number, a: number, len: number, half: number, out: Unit[]): Unit[] {
    out.length = 0
    const dx = Math.sin(a)
    const dz = Math.cos(a)
    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i]!
      if (!u.alive || u.team !== team || u.rank === 'npc') continue
      const ux = u.x - x
      const uz = u.z - z
      const along = ux * dx + uz * dz
      if (along < -u.r || along > len + u.r) continue
      const side = Math.abs(ux * dz - uz * dx)
      if (side <= half + u.r) out.push(u)
    }
    return out
  }

  /** The unit under a ground point (taps): the nearest whose padded body
   *  covers it. `pad` forgives a fat finger. */
  pick(team: Team | -1, x: number, z: number, pad: number): Unit | undefined {
    let best: Unit | undefined
    let bd = Infinity
    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i]!
      if (!u.alive || (team !== -1 && u.team !== team)) continue
      if (u.rank === 'hero') continue
      const d = Math.hypot(u.x - x, u.z - z)
      if (d <= u.r + pad && d < bd) { bd = d; best = u }
    }
    return best
  }

  countAlive(team: Team, kind?: string, ownerId?: number): number {
    let n = 0
    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i]!
      if (u.alive && u.team === team && (!kind || u.kind === kind) && (ownerId === undefined || u.ownerId === ownerId)) n++
    }
    return n
  }
}

// ─── Status helpers (read side; `combat.ts` owns the write side) ────────────

export const findStatus = (u: Unit, id: StatusId): Status | undefined => {
  const st = u.statuses
  for (let i = 0; i < st.length; i++) if (st[i]!.id === id) return st[i]
  return undefined
}

export const hasStatus = (u: Unit, id: StatusId): boolean => findStatus(u, id) !== undefined

/** The magnitude of a status, or 0 when the unit does not have it. */
export const statusV = (u: Unit, id: StatusId): number => findStatus(u, id)?.v ?? 0

export const newAction = (u: Unit, id: string, hitAt: number, end: number, targetId: number, x: number, z: number, ability = -1, slot = -1): Action => ({
  id, t: 0, hitAt, end, done: false, targetId, x, z, sx: u.x, sz: u.z, a: Math.atan2(x - u.x, z - u.z), ability, slot
})

/**
 * A won zone is at peace with what is left of its MAIN chain: those enemies
 * stand idle and nobody hurts them or is hurt by them. Side packs (a chest's
 * guard, a champion) stay optional fights to the end.
 */
export const atPeace = (sim: Sim, u: Unit): boolean =>
  sim.ended === 'victory' && sim.mode === 'zone' && u.team === 1 && u.group < SIDE_GROUP

export const dist = (a: Unit, b: Unit): number => Math.hypot(a.x - b.x, a.z - b.z)

/** Heading from (ax, az) toward (bx, bz): 0 faces +Z. */
export const angleTo = (ax: number, az: number, bx: number, bz: number): number => Math.atan2(bx - ax, bz - az)
