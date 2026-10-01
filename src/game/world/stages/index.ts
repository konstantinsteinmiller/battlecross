import type { MapData } from '../levelGen'
import type { SectorId } from '../themes'
import { generateClimb } from '../climbGen'
import { generateMeltdown } from './blaze'
import { generateGlacier } from './cryo'
import { generateRailRush } from './volt'
import { generateSkyDocks } from './gale'
import { generatePolarityWorks } from './magnet'
import { generateDeepMine } from './drill'

/**
 * ─── The platform stages ─────────────────────────────────────────────────────
 *
 * The sectors' story missions are hand-authored platforming stages built
 * like the Tower Run (`world/climbGen.ts`, with `stages/builder.ts`), each
 * themed on its Core Master, the boss in the arena at the end (floor y = 0):
 *
 *   blaze  Meltdown Descent   down a burning refinery stack
 *   cryo   Glacier Run        ice, spike pits, frost throwers
 *   volt   Rail Rush          a maglev cart ride under waves of flyers
 *   gale   Sky Docks          floating platforms and a wind tunnel
 *   magnet Polarity Works     magnet rails, polarity panels, crane shuttles
 *   drill  Deep Mine          boulders, falling rock, a mine elevator, moles
 *
 * Each story level is about a tenth longer than the one before it.
 */

export type StageSector = 'blaze' | 'cryo' | 'volt' | 'gale' | 'magnet' | 'drill'

/** Sections per stage, the arena not counted (the climb has six): the
 *  Meltdown's seven, then about a tenth more each (×1.1, ×1.21, ×1.33). */
export const STAGE_LENGTH: Record<StageSector, number> = { blaze: 7, cryo: 8, volt: 8, gale: 9, magnet: 10, drill: 11 }

const GENERATORS: Record<StageSector, (seed: number) => MapData> = {
  blaze: generateMeltdown,
  cryo: generateGlacier,
  volt: generateRailRush,
  gale: generateSkyDocks,
  magnet: generatePolarityWorks,
  drill: generateDeepMine
}

export const isStageSector = (s: SectorId): s is StageSector => s in STAGE_LENGTH

/** The stage map of `sector` for `seed` (deterministic: a resume rebuilds
 *  it). A sector without a stage gets the Tower Run. */
export const generateStage = (sector: SectorId, seed: number): MapData =>
  isStageSector(sector) ? GENERATORS[sector](seed) : generateClimb(seed)
