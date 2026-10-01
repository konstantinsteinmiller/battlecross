import type { SectorId } from '../themes'

/**
 * The platform stages' metadata: which sectors have one and how many
 * sections each has. Apart from the generators (`./index.ts`, `./load.ts`)
 * so the quest board and the boot path do not pull every stage's builder in
 * with it: a stage's code loads when its mission does.
 */

export type StageSector = 'blaze' | 'cryo' | 'volt' | 'gale' | 'magnet' | 'drill' | 'tide' | 'neon' | 'rotor' | 'fortress'

/** Sections per stage, the arena not counted (the climb has six): the
 *  Meltdown's seven, then about a tenth more each (×1.1, ×1.21, ×1.33). */
export const STAGE_LENGTH: Record<StageSector, number> = { blaze: 7, cryo: 8, volt: 8, gale: 9, magnet: 10, drill: 11, tide: 12, neon: 13, rotor: 13, fortress: 17 }

export const isStageSector = (s: SectorId): s is StageSector => s in STAGE_LENGTH
