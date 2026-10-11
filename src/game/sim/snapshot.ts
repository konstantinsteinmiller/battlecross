import { SOLID_SEALED, setCellBit } from './grid'
import { rngState, setRngState } from './rng'
import type { Unit } from './types'
import type {
  BranchState, ChestState, DoorState, GroupState, HeroState, PlateState, PuzzleState, Sim, WaveState
} from './world'
import type { HerbState, PieceState } from './herbs'
import type { OreState } from './ores'
import type { CaravanState } from './caravan'

/**
 * ─── A zone visit, saved mid-fight (manual save slots) ──────────────────────
 *
 * A saved game puts the player back exactly where they stood: the hero's spot,
 * health, mana, potions and cooldowns, every enemy still standing (where it
 * is, its health, whether it has noticed the hero), the chests opened and
 * shut, the herbs picked, the doors and plates, the escort's cart, the dice.
 *
 * A visit is generated deterministically from its setup (`zoneGen.ts`,
 * `director.ts`: the seed and the profile), so a snapshot does not carry the
 * world — only what has CHANGED since the visit began:
 *
 *   • `captureBaseline` records the units as the visit was generated;
 *   • `snapshotSim` stores, per generated unit, only the fields that differ
 *     from that baseline (an untouched sleeping pack costs nothing), the
 *     units gone (killed), the units born since (summons, waves) in full, and
 *     the small feature lists (chests, herbs, doors…) whole;
 *   • `restoreSim` regenerates the same visit, checks it IS the same visit
 *     (the baseline signature), and lays the snapshot over it.
 *
 * What is in flight when the game is saved — projectiles, ground fields, a
 * telegraphed strike, a skill's delayed second hit — is not kept: those are
 * closures or a second's worth of effect, and saving happens from the pause
 * menu.
 */

export const SNAPSHOT_VERSION = 1

const plain = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T

/** The units of a freshly generated visit, field by field (as JSON). */
export interface SimBaseline {
  units: Map<number, Record<string, string>>
  /** Which units the visit was generated with: a save only restores onto
   *  the same visit (same ids, same kinds). */
  sig: string
}

export interface UnitDelta {
  id: number
  /** Fields that differ from the baseline. */
  d: Record<string, unknown>
  /** Fields the unit no longer has. */
  x?: string[]
}

export interface SimSnapshot {
  v: number
  sig: string
  time: number
  rng: number
  core: { nextId: number; dangerN: number }
  /** Generated units no longer there (killed and swept). */
  removed: number[]
  changed: UnitDelta[]
  /** Units born during the visit (summons, waves, spirits), whole. */
  added: Unit[]
  hero: Omit<HeroState, 'unit'> & { unit: number }
  groups: GroupState[]
  sideGroups: GroupState[]
  branches: BranchState[]
  groupsDone: number
  chests: ChestState[]
  herbs: HerbState[]
  /** The outcrops (#99); a save from before ore has none. */
  ores?: OreState[]
  pieces: PieceState[]
  caravan: CaravanState | null
  plates: PlateState[]
  puzzle: PuzzleState | null
  doors: DoorState[]
  specialOpened: string[]
  wave: WaveState
  owned: string[]
  ended: Sim['ended']
  endedT: number
  endReady: boolean
  leaving: boolean
  leaveAt: number
  leaveOpened: boolean
}

const signature = (units: readonly Unit[]): string => units.map(u => `${u.id}:${u.kind}`).join(',')

const fieldsOf = (u: Unit): Record<string, string> => {
  const r: Record<string, string> = {}
  for (const k of Object.keys(u)) {
    const v = (u as unknown as Record<string, unknown>)[k]
    if (v !== undefined) r[k] = JSON.stringify(v)
  }
  return r
}

/** Record the visit as generated. Call once, right after generation. */
export const captureBaseline = (sim: Sim): SimBaseline => {
  const units = new Map<number, Record<string, string>>()
  for (const u of sim.units) units.set(u.id, fieldsOf(u))
  return { units, sig: signature(sim.units) }
}


/** The visit as it stands now, against its baseline. */
export const snapshotSim = (sim: Sim, base: SimBaseline): SimSnapshot => {
  const dice = rngState(sim.rng)
  if (dice === null) throw new Error('snapshot: the fight\'s dice cannot be read')
  const present = new Set<number>()
  const changed: UnitDelta[] = []
  const added: Unit[] = []
  for (const u of sim.units) {
    present.add(u.id)
    const b = base.units.get(u.id)
    if (!b) { added.push(plain(u)); continue }
    const now = fieldsOf(u)
    const d: Record<string, unknown> = {}
    for (const k of Object.keys(now)) if (now[k] !== b[k]) d[k] = JSON.parse(now[k]!)
    const gone = Object.keys(b).filter(k => !(k in now))
    if (Object.keys(d).length || gone.length) changed.push(gone.length ? { id: u.id, d, x: gone } : { id: u.id, d })
  }
  const removed = [...base.units.keys()].filter(id => !present.has(id))
  const { unit, ...hero } = sim.hero
  return {
    v: SNAPSHOT_VERSION,
    sig: base.sig,
    time: sim.time,
    rng: dice,
    core: { nextId: sim.core().nextId, dangerN: sim.core().dangerN },
    removed,
    changed,
    added,
    hero: { ...plain(hero), unit: unit.id },
    groups: plain(sim.groups),
    sideGroups: plain(sim.sideGroups),
    branches: plain(sim.branches),
    groupsDone: sim.groupsDone,
    chests: plain(sim.chests),
    herbs: plain(sim.herbs),
    ores: plain(sim.ores),
    pieces: plain(sim.pieces),
    caravan: plain(sim.caravan),
    plates: plain(sim.plates),
    puzzle: plain(sim.puzzle),
    doors: plain(sim.doors),
    specialOpened: [...sim.specialOpened],
    wave: plain(sim.wave),
    owned: [...sim.owned],
    ended: sim.ended,
    endedT: sim.endedT,
    endReady: sim.endReady,
    leaving: sim.leaving,
    leaveAt: sim.leaveAt,
    leaveOpened: sim.leaveOpened
  }
}

/**
 * Lay a snapshot over a freshly generated visit. Returns false — and changes
 * nothing — when the snapshot is not of this visit (another version, another
 * seed, a game update that generates the zone differently).
 */
export const restoreSim = (sim: Sim, base: SimBaseline, s: SimSnapshot): boolean => {
  if (!s || s.v !== SNAPSHOT_VERSION || s.sig !== base.sig) return false
  const byId = new Map(sim.units.map(u => [u.id, u]))
  if (s.changed.some(c => !byId.has(c.id)) || !(byId.has(s.hero.unit) || s.added.some(a => a.id === s.hero.unit))) return false

  const removed = new Set(s.removed)
  const units: Unit[] = []
  for (const u of sim.units) if (!removed.has(u.id)) units.push(u)
  for (const c of s.changed) {
    const u = byId.get(c.id)! as unknown as Record<string, unknown>
    Object.assign(u, plain(c.d))
    for (const k of c.x ?? []) delete u[k]
  }
  for (const a of s.added) units.push(plain(a))
  sim.restoreCore(s.core, units)
  setRngState(sim.rng, s.rng)
  sim.time = s.time

  const { unit, ...hero } = plain(s.hero)
  Object.assign(sim.hero, hero, { unit: sim.get(unit)! })

  sim.groups = plain(s.groups)
  sim.sideGroups = plain(s.sideGroups)
  sim.branches = plain(s.branches)
  sim.groupsDone = s.groupsDone
  sim.chests = plain(s.chests)
  sim.herbs = plain(s.herbs)
  if (s.ores) sim.ores = plain(s.ores)
  sim.pieces = plain(s.pieces)
  sim.caravan = plain(s.caravan)
  sim.plates = plain(s.plates)
  sim.puzzle = plain(s.puzzle)
  // A door that was open lets the ground through again (the fresh grid has it sealed).
  sim.doors = plain(s.doors)
  const g = sim.grid
  for (const d of sim.doors) {
    if (!d.open) continue
    for (const k of d.cells) {
      const i = k % g.w
      setCellBit(g, i, (k - i) / g.w, SOLID_SEALED, false)
    }
  }
  sim.specialOpened = [...s.specialOpened]
  sim.wave = plain(s.wave)
  sim.owned = new Set(s.owned)
  sim.ended = s.ended
  sim.endedT = s.endedT
  sim.endReady = s.endReady
  sim.leaving = s.leaving
  sim.leaveAt = s.leaveAt
  sim.leaveOpened = s.leaveOpened
  // Nothing in flight survives a save: the regenerated visit has none (no
  // projectile, field, wall or warning yet), so there is nothing to clear
  // but the generation's own events.
  sim.events.length = 0
  return true
}
