import type { ThemeId } from './zones'

/**
 * ─── Plants (roadmap #87, #88, D103) ─────────────────────────────────────────
 *
 * Eight herbs grow in the wild places: three or four of them on every visit,
 * picked by walking over them, carried home in a pouch and brewed by the
 * alchemist into elixirs. Each grows where its theme suits it; the common ones
 * everywhere they fit, the rare ones less often, and only past the first
 * zones. Every visit is a new layout, so they are back the next time, like the
 * goblins.
 */

export type PlantId = 'sunpetal' | 'glowcap' | 'swiftfern' | 'ironmoss' | 'emberbloom' | 'frostmint' | 'moonbell' | 'shadowthorn'

export interface PlantDef {
  id: PlantId
  /** Its colour in the world and on its icon (the bloom, then the leaves). */
  bloom: string
  leaf: string
  /** How often it is picked where it grows (relative). */
  weight: number
  /** The zone themes it grows in. */
  themes: readonly ThemeId[]
  /** The lowest zone level it is found in. */
  minLevel: number
}

export const PLANTS: readonly PlantDef[] = [
  // The heal plant: the healers' oldest remedy, common and bright.
  { id: 'sunpetal', bloom: '#ffd23a', leaf: '#4fae4a', weight: 6, themes: ['plains', 'forest', 'farm', 'temple', 'cave'], minLevel: 1 },
  { id: 'glowcap', bloom: '#5fe8ff', leaf: '#e8e2d0', weight: 5, themes: ['cave', 'mine', 'forest', 'void'], minLevel: 1 },
  { id: 'swiftfern', bloom: '#9ef06a', leaf: '#3f9a44', weight: 4, themes: ['plains', 'forest', 'farm', 'snow'], minLevel: 1 },
  { id: 'ironmoss', bloom: '#a8b8a0', leaf: '#6a7a62', weight: 3, themes: ['cave', 'mine', 'peak', 'fortress', 'ash'], minLevel: 3 },
  { id: 'emberbloom', bloom: '#ff6a2a', leaf: '#7a3a24', weight: 3, themes: ['ash', 'peak', 'fortress', 'rift', 'farm'], minLevel: 6 },
  { id: 'frostmint', bloom: '#bfe8ff', leaf: '#5aa8c8', weight: 3, themes: ['snow', 'temple', 'peak', 'plains'], minLevel: 6 },
  { id: 'moonbell', bloom: '#c8a8ff', leaf: '#5a7a8a', weight: 1.5, themes: ['temple', 'void', 'forest', 'snow'], minLevel: 8 },
  { id: 'shadowthorn', bloom: '#8a3aa8', leaf: '#3a2440', weight: 1.5, themes: ['void', 'rift', 'fortress', 'cave', 'mine'], minLevel: 8 }
]

export const PLANT_IDS: readonly PlantId[] = PLANTS.map(p => p.id)
export const PLANT_BY_ID: Readonly<Record<PlantId, PlantDef>> = Object.fromEntries(PLANTS.map(p => [p.id, p])) as Record<PlantId, PlantDef>

/** Plants found on one visit (at most). */
export const HERBS_MIN = 3
export const HERBS_MAX = 4
/** The pouch holds this many of each. */
export const HERB_CAP = 99

/** What grows in a place of this theme and level. */
export const plantsOf = (theme: ThemeId, level: number): PlantDef[] =>
  PLANTS.filter(p => p.themes.includes(theme) && level >= p.minLevel)

export const isPlant = (id: string): id is PlantId => id in PLANT_BY_ID
