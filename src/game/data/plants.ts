import type { ZoneId } from './items'

/**
 * ─── Plants (roadmap #87, #88, D103; habitats #112, #114) ────────────────────
 *
 * Eight herbs grow in the wild places: three or four of them on every visit,
 * picked by walking over them, carried home in a pouch and brewed by the
 * alchemist into elixirs. Each grows in the places that suit it — its
 * HABITAT, a list of zones with how common it is there — not anywhere a
 * zone's look happens to share a theme: sun petals in sunny meadows and
 * fields, never in the drowned temple; moonbells in the night woods and the
 * cold or haunted places past them. Every visit is a new layout, so they are
 * back the next time, like the goblins.
 */

export type PlantId = 'sunpetal' | 'glowcap' | 'swiftfern' | 'ironmoss' | 'emberbloom' | 'frostmint' | 'moonbell' | 'shadowthorn'

export interface PlantDef {
  id: PlantId
  /** Its colour in the world and on its icon (the bloom, then the leaves). */
  bloom: string
  leaf: string
  /** The zones it grows in, and how often it is picked there (relative). */
  habitat: Readonly<Partial<Record<ZoneId, number>>>
}

export const PLANTS: readonly PlantDef[] = [
  // The heal plant: the healers' oldest remedy, common and bright, in the sun.
  { id: 'sunpetal', bloom: '#ffd23a', leaf: '#4fae4a', habitat: { plains: 6, woods: 4, outskirts: 6 } },
  // A cave and night-forest mushroom that glows.
  { id: 'glowcap', bloom: '#5fe8ff', leaf: '#e8e2d0', habitat: { hollows: 6, woods: 4, mines: 5, temple: 5, citadel: 3 } },
  { id: 'swiftfern', bloom: '#9ef06a', leaf: '#3f9a44', habitat: { plains: 4, woods: 4, outskirts: 4, tundra: 2 } },
  // Moss on stone and iron: caves, mines, the high rock.
  { id: 'ironmoss', bloom: '#a8b8a0', leaf: '#6a7a62', habitat: { hollows: 3, crags: 4, mines: 4, peak: 3, fortress: 3 } },
  // Fire-loving: ash, the mountain, the fortress, the rift.
  { id: 'emberbloom', bloom: '#ff6a2a', leaf: '#7a3a24', habitat: { crags: 5, peak: 3, fortress: 3, rift: 3 } },
  // Cold mint: snow and the cold heights.
  { id: 'frostmint', bloom: '#bfe8ff', leaf: '#5aa8c8', habitat: { tundra: 5, peak: 3 } },
  // The rare night flower: the Whispering Woods are its home (the Collector's
  // and Old Rowan's errands send the hero there), the temple's dim halls and
  // the cold and void places past them.
  { id: 'moonbell', bloom: '#c8a8ff', leaf: '#5a7a8a', habitat: { woods: 3, temple: 4, tundra: 2, citadel: 3 } },
  { id: 'shadowthorn', bloom: '#8a3aa8', leaf: '#3a2440', habitat: { hollows: 1, citadel: 3, fortress: 2, rift: 4 } }
]

export const PLANT_IDS: readonly PlantId[] = PLANTS.map(p => p.id)
export const PLANT_BY_ID: Readonly<Record<PlantId, PlantDef>> = Object.fromEntries(PLANTS.map(p => [p.id, p])) as Record<PlantId, PlantDef>

/** Plants found on one visit (at most). */
export const HERBS_MIN = 3
export const HERBS_MAX = 4
/** The pouch holds this many of each. */
export const HERB_CAP = 99

/** What grows in a zone, with how often each is picked there. */
export const plantsOf = (zone: ZoneId): Array<PlantDef & { weight: number }> =>
  PLANTS.filter(p => (p.habitat[zone] ?? 0) > 0).map(p => ({ ...p, weight: p.habitat[zone]! }))

export const isPlant = (id: string): id is PlantId => id in PLANT_BY_ID
