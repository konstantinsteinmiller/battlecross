import type { PlantId } from './plants'

/**
 * ─── Elixirs (roadmap #87, D104) ─────────────────────────────────────────────
 *
 * The alchemist in Silverbridge brews the herbs the hero picks into six
 * elixirs. One is drunk from the third flask in a fight and works for five
 * minutes: a lot more damage, armour, speed, quicker skills, health back
 * over time, or life drawn with every blow. Each is its own status, so it adds
 * to a skill's buff of the same kind instead of being swallowed by it.
 */

export type ElixirId = 'might' | 'iron' | 'swift' | 'mind' | 'vigor' | 'shadow'

/** The status an elixir puts on the hero (`sim/types.ts`). */
export type ElixirStatus = 'elixirMight' | 'elixirIron' | 'elixirSwift' | 'elixirMind' | 'elixirVigor' | 'elixirShadow'

export interface ElixirDef {
  id: ElixirId
  status: ElixirStatus
  /** The status's strength: a share (0.15 = +15 %), or the share of health back a second (vigor). */
  v: number
  /** The herbs one brew takes. */
  recipe: Readonly<Partial<Record<PlantId, number>>>
  /** The liquid's colour (the flask, the aura). */
  colour: string
}

export const ELIXIRS: readonly ElixirDef[] = [
  // Ember and sun: a hotter blow.
  { id: 'might', status: 'elixirMight', v: 0.75, recipe: { emberbloom: 2, sunpetal: 1 }, colour: '#ff6a3a' },
  // Moss and frost: a skin that turns a blade.
  { id: 'iron', status: 'elixirIron', v: 0.75, recipe: { ironmoss: 2, frostmint: 1 }, colour: '#a8b8c8' },
  // Fern and sun: lighter feet, a quicker arm.
  { id: 'swift', status: 'elixirSwift', v: 0.75, recipe: { swiftfern: 2, sunpetal: 1 }, colour: '#9ef06a' },
  // Glowcap and moonbell: a clear head, skills back sooner.
  { id: 'mind', status: 'elixirMind', v: 0.6, recipe: { glowcap: 2, moonbell: 1 }, colour: '#7fb8ff' },
  // Sun and glow: health back, a little every second.
  { id: 'vigor', status: 'elixirVigor', v: 0.012, recipe: { sunpetal: 2, glowcap: 1 }, colour: '#ff7aa8' },
  // Thorn and ember: every blow draws a little life.
  { id: 'shadow', status: 'elixirShadow', v: 0.75, recipe: { shadowthorn: 2, emberbloom: 1 }, colour: '#a85ad8' }
]

export const ELIXIR_IDS: readonly ElixirId[] = ELIXIRS.map(e => e.id)
export const ELIXIR_BY_ID: Readonly<Record<ElixirId, ElixirDef>> = Object.fromEntries(ELIXIRS.map(e => [e.id, e])) as Record<ElixirId, ElixirDef>
export const isElixir = (id: string): id is ElixirId => id in ELIXIR_BY_ID

/** How long one works, in seconds. */
export const ELIXIR_TIME = 300
/** The most of each the hero carries. */
export const ELIXIR_CAP = 5
/** The alchemist's fee for one brew, by the hero's level. */
export const brewFee = (level: number): number => 15 + 3 * level
