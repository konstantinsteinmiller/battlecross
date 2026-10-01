import type { BossId } from '../models/bosses'
import type { SectorId } from '../world/themes'

/**
 * Each Master's signature colour: the ONE colour it is known by everywhere —
 * its boss tint, the weapon Flux copies from it (HUD, icon, results badge),
 * its relay's glow once freed, its sector tile, orb and mission card. The
 * story's palette (`story-arc.md` § colours): red is Vex's control, cyan is
 * Gauss's lab (Pip, Atlas), amber is Flux; a sector's own colour means free.
 *
 * Kept apart from each other by a perceptual distance (`tests/game/
 * signatureColors.test.ts`): no two Masters may read alike, and none may
 * read as Vex's red. Ice blue and sea blue share a hue, so they are split by
 * lightness (pale ice, deep sea); the warm yellows likewise (gold scrap,
 * pale yellow-white volt, dark ochre drill).
 */
export const MASTER_COLOR: Record<BossId, string> = {
  scrapper: '#ffc21a', // warm yellow
  blazeMaster: '#ff6a2a', // orange
  frostMaster: '#cfe6ff', // ice blue (pale, frost-white)
  voltMaster: '#fff07a', // yellow-white
  galeMaster: '#7dffc4', // mint
  magnetMaster: '#3f7bff', // cobalt (silver trim)
  drillMaster: '#c8862a', // ochre
  tideMaster: '#1f8fd6', // sea blue (deep)
  neonMaster: '#ff3fd2', // hot pink
  rotorMaster: '#b8ff5a', // lime
  vexMk1: '#ff2d3f' // Vex red: control
}

/** A sector's colour: its Master's (the Fortress: Vex's). */
export const SECTOR_COLOR: Record<SectorId, string> = {
  scrapyard: MASTER_COLOR.scrapper,
  blaze: MASTER_COLOR.blazeMaster,
  cryo: MASTER_COLOR.frostMaster,
  volt: MASTER_COLOR.voltMaster,
  gale: MASTER_COLOR.galeMaster,
  magnet: MASTER_COLOR.magnetMaster,
  drill: MASTER_COLOR.drillMaster,
  tide: MASTER_COLOR.tideMaster,
  neon: MASTER_COLOR.neonMaster,
  rotor: MASTER_COLOR.rotorMaster,
  fortress: MASTER_COLOR.vexMk1
}

/** The colours the Masters must stay clear of: Vex's control red and the
 *  lab's cyan. */
export const RESERVED_COLOR = { vex: '#ff2d3f', lab: '#4fd8ff' } as const
