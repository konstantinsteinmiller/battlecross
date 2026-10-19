/**
 * ─── A town's cells and its ways out ────────────────────────────────────────
 *
 * The few pieces of a town's plan that the rest of the game reads outside a
 * town (the field's terrain keeps a town's exits clear, the generator's water
 * pass reads the walked cells): a module of its own, so the town's layout and
 * its life (`town.ts`, `townLife.ts`) stay in the town's lazy chunk
 * (`townSimLoader.ts`, roadmap #142). `town.ts` re-exports all of it.
 */

export const TOWN_W = 38
export const TOWN_H = 36

/** What a town cell is (`TownPlan.cell`). */
export const TC_GRASS = 0
/** A cobbled street: walkable, nothing stands in its middle lane. */
export const TC_STREET = 1
/** The paved square. */
export const TC_SQUARE = 2
/** A room's floor. */
export const TC_FLOOR = 3
/** A doorway: walked through, never stood in. */
export const TC_DOOR = 4
/** A house's wall (solid). */
export const TC_WALL = 5
/** A garden or backyard: kept out of (low: fences, beds, woodpiles). */
export const TC_YARD = 6
/** A prop in the way: a well, a stall, an anvil (low). */
export const TC_PROP = 7
/** A fence (low). */
export const TC_FENCE = 8
/** A training ground: beaten earth, walkable. */
export const TC_GROUND = 9
/** Out of town (the trees). */
export const TC_RIM = 10
/** The river under a bridge town (#103). */
export const TC_WATER = 11
/** A town's wall (a walled town, #103): stone, nobody passes. */
export const TC_TOWNWALL = 12
/** A bridge's parapet (#103): a low stone wall at the deck's edge. */
export const TC_PARAPET = 13

/**
 * A way out of town (#131): the cells of the corridor (inclusive; the road
 * runs through it to the edge of the grid) and which way it leads out. Walking
 * into its last two cells leaves for the map; no tree, prop or person is in it.
 */
export interface TownExit {
  i0: number
  j0: number
  i1: number
  j1: number
  /** The step out of town, in cells: (0, 1) south, (1, 0) east, (-1, 0) west. */
  dx: number
  dz: number
}

/** How many cells at the corridor's outer end leave for the map. */
export const EXIT_DEPTH = 2

/** Is the cell (it may lie past the grid) in the open before a way out: the
 *  corridor and a cell either side of it, on out? No tree, rock or prop stands there. */
export const townExitClear = (exits: readonly TownExit[], i: number, j: number): boolean =>
  exits.some(e => (e.dz !== 0 ? i >= e.i0 - 1 && i <= e.i1 + 1 && j >= e.j0 : j >= e.j0 - 1 && j <= e.j1 + 1 && (e.dx > 0 ? i >= e.i0 : i <= e.i1)))

/** Is the cell one that leaves for the map (the outermost `EXIT_DEPTH` of a corridor)? */
export const townExitAt = (exits: readonly TownExit[], i: number, j: number): boolean =>
  exits.some(e => i >= e.i0 && i <= e.i1 && j >= e.j0 && j <= e.j1 &&
    (e.dz > 0 ? j >= e.j1 - EXIT_DEPTH + 1 : e.dx > 0 ? i >= e.i1 - EXIT_DEPTH + 1 : i <= e.i0 + EXIT_DEPTH - 1))
