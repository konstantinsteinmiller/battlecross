import type { ZoneId } from './items'

/**
 * ─── The treasure map (roadmap #89, D112) ────────────────────────────────────
 *
 * Six torn pieces of an old map lie in the low places, one or two to a zone,
 * picked up by walking over them like the herbs (`sim/herbs.ts`), until each
 * is found. The first one found starts the errand in the Journal; with all
 * six, the Ashen Crags hold a buried chest under an X, dug up by opening it:
 * a fat purse and an Epic the hero does not own yet.
 */

export const MAP_PIECES: ReadonlyArray<{ id: string; zone: ZoneId }> = [
  { id: 'plains1', zone: 'plains' },
  { id: 'hollows1', zone: 'hollows' },
  { id: 'woods1', zone: 'woods' },
  { id: 'woods2', zone: 'woods' },
  { id: 'outskirts1', zone: 'outskirts' },
  { id: 'outskirts2', zone: 'outskirts' }
]

/** Where the X is. */
export const TREASURE_ZONE: ZoneId = 'crags'
/** The errand that tracks it (`data/errands.ts`). */
export const TREASURE_ERRAND = 'treasureMap'
/** The world flag the dig leaves (the errand's `dig` step reads it). */
export const DUG_FLAG = `dug:${TREASURE_ZONE}`

export const isPiece = (id: string): boolean => MAP_PIECES.some(p => p.id === id)

/** The pieces still lying in a zone. */
export const piecesIn = (zone: string, found: readonly string[]): string[] =>
  MAP_PIECES.filter(p => p.zone === zone && !found.includes(p.id)).map(p => p.id)
