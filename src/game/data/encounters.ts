import { ENEMY_BY_ID } from './enemies'
import type { ZoneId } from './items'
import { NODE_BY_ID, ZONES, ZONE_FEATURES, visitLevel, type NodeId } from './zones'

/**
 * ─── Random encounters on the world map (roadmap #67) ────────────────────────
 *
 * The hero walks the map freely; off the roads (and less often on them)
 * something can jump out: a pack or two of the region's own enemies at the
 * region's level, now and then a lone champion, rarely a chest in the grass or
 * a wandering merchant instead of a fight.
 *
 * Two pure pieces: `rollEncounter` says WHAT is met (from a seed), and
 * `EncounterClock` says WHEN (walking time, a gap after the last one, a grace
 * after leaving a place). The map screen feeds the clock; the flow builds the
 * fight (`flow.startEncounter`, `zoneGen.generateEncounter`).
 */

export type EncounterKind = 'fight' | 'elite' | 'chest' | 'merchant'

export interface EncounterSpec {
  kind: EncounterKind
  /** The region's zone: its enemies, its look, its music. */
  zone: ZoneId
  /** The enemies' level: the hero's, held inside the region's band. */
  level: number
  seed: number
  /** A fight's packs, the nearest first (empty for a chest or a merchant). */
  packs: string[][]
}

/** Whose land a place's surroundings are: a town's and the colosseum's
 *  wilds are those of the zone next door. */
export const ENCOUNTER_REGION: Readonly<Record<NodeId, ZoneId>> = {
  sunford: 'plains', arena: 'plains', oakhaven: 'outskirts', ironhold: 'mines',
  plains: 'plains', hollows: 'hollows', woods: 'woods', outskirts: 'outskirts', crags: 'crags', mines: 'mines',
  tundra: 'tundra', temple: 'temple', citadel: 'citadel', peak: 'peak', fortress: 'fortress', rift: 'rift'
}

/** What an encounter turns out to be, in parts of 100. */
export const ENCOUNTER_ODDS: Readonly<Record<EncounterKind, number>> = { fight: 70, elite: 15, chest: 10, merchant: 5 }

/** The same small generator the simulation uses (mulberry32). */
const rngOf = (seed: number): (() => number) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** The region's ordinary enemies (no elites, no bosses), with their weights. */
const plainKinds = (zone: ZoneId): Array<{ kind: string; w: number }> => {
  const all = ZONES[zone].kinds
  const plain = all.filter(k => { const r = ENEMY_BY_ID[k.kind]?.rank; return r !== 'elite' && r !== 'boss' })
  return plain.length ? plain : all
}

const weighted = (rng: () => number, kinds: Array<{ kind: string; w: number }>): string => {
  let total = 0
  for (const k of kinds) total += k.w
  let r = rng() * total
  for (const k of kinds) { r -= k.w; if (r <= 0) return k.kind }
  return kinds[0]!.kind
}

/** What is met: deterministic from the seed. */
export const rollEncounter = (zone: ZoneId, heroLevel: number, seed: number): EncounterSpec => {
  const rng = rngOf(seed)
  const def = ZONES[zone]
  const level = visitLevel(def, heroLevel)
  let r = rng() * 100
  let kind: EncounterKind = 'fight'
  for (const k of ['fight', 'elite', 'chest', 'merchant'] as const) {
    r -= ENCOUNTER_ODDS[k]
    if (r <= 0) { kind = k; break }
  }
  const packs: string[][] = []
  if (kind === 'fight') {
    // One pack, or two smaller ones: always less than a zone's clearing holds.
    const two = rng() < 0.35
    const n = two ? 2 : 1
    for (let p = 0; p < n; p++) {
      const lo = Math.max(2, def.pack[0] - 1)
      const hi = Math.max(lo, two ? def.pack[0] : def.pack[1] - 1)
      const size = lo + Math.floor(rng() * (hi - lo + 1))
      const kinds = plainKinds(zone)
      packs.push(Array.from({ length: size }, () => weighted(rng, kinds)))
    }
  } else if (kind === 'elite') {
    // A lone champion of the region.
    packs.push([ZONE_FEATURES[zone].championKind])
  }
  return { kind, zone, level, seed, packs }
}

/** The region a spot on the map belongs to, by the place whose land it is. */
export const regionOf = (owner: NodeId): ZoneId => ENCOUNTER_REGION[owner] ?? 'plains'

/** A chest found in the grass: a little gold and a little experience. */
export const chestReward = (level: number): { gold: number; xp: number } => ({ gold: 12 + level * 8, xp: 10 + level * 6 })

/** A wandering merchant's wares: the two tiers around the region's level. */
export const merchantTiers = (level: number): number[] => {
  const t = Math.max(1, Math.min(5, Math.ceil(level / 6)))
  return t > 1 ? [t - 1, t] : [1, 2]
}

/** Encounters wait until the first town has been reached: the first-timer's
 *  guided way there is never interrupted. */
export const encountersAllowed = (cleared: readonly string[]): boolean =>
  cleared.some(id => NODE_BY_ID[id as NodeId]?.kind === 'town')

// ─── When ────────────────────────────────────────────────────────────────────

/** The clock's tuning, in seconds of walking. */
export const ENCOUNTER_PACE = {
  /** Off-road walking between two encounters: drawn between these. */
  min: 25,
  max: 45,
  /** Never sooner than this after the last one (any walking). */
  gap: 10,
  /** A road counts this much of a second toward the next one. */
  road: 0.35,
  /** The breath after leaving a place (or coming back to the map). */
  grace: 5
} as const

/**
 * When something jumps out. Fed every frame the map runs: `walking` (the hero
 * is moving), `onRoad`, and `allowed` (the first town has been reached, the
 * hero is out in the wilds and not on his way to a place he chose to enter).
 * Seconds of walking fill a meter (a road's at a third of the rate); when it
 * reaches the drawn threshold, and the gap and the grace have both run out,
 * it fires and draws the next threshold.
 */
export class EncounterClock {
  private rng: () => number
  /** Walking seconds counted toward the next encounter. */
  meter = 0
  /** The threshold the meter must reach. */
  next: number
  /** Seconds since the last encounter (any time on the map). */
  since = Infinity
  /** Seconds of grace left. */
  grace = 0

  constructor(seed: number) {
    this.rng = rngOf(seed)
    this.next = this.draw()
  }

  private draw(): number { return ENCOUNTER_PACE.min + this.rng() * (ENCOUNTER_PACE.max - ENCOUNTER_PACE.min) }

  /** A breath before anything jumps out: the hero left a place, or the map just opened. */
  calm(seconds: number = ENCOUNTER_PACE.grace): void { this.grace = Math.max(this.grace, seconds) }

  /** One step of the map's time. True: an encounter, now. */
  step(dt: number, walking: boolean, onRoad: boolean, allowed: boolean): boolean {
    this.since += dt
    this.grace = Math.max(0, this.grace - dt)
    if (!walking || !allowed) return false
    this.meter += dt * (onRoad ? ENCOUNTER_PACE.road : 1)
    if (this.meter < this.next || this.since < ENCOUNTER_PACE.gap || this.grace > 0) return false
    this.meter = 0
    this.since = 0
    this.next = this.draw()
    return true
  }
}
