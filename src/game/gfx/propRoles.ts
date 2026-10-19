/**
 * ─── What every drawn thing is to a walking body ─────────────────────────────
 *
 * Everything the world draws is one of two things:
 *   • SOLID: it stands in the way (a tree, a rock, a wall, a tower, a chest).
 *     What it covers of the ground, seen from above, lies on the walk grid's
 *     colliders (blocked cells, a level prop's round disc, a room's furniture
 *     block): the hero is stopped at its edge, never walks into it.
 *   • WALK: ground cover and things made to be walked on or over (grass,
 *     flowers, pebbles, a step, a bridge's deck, a plate, a decal).
 *
 * Every kind of prop is named here and given its role, so a new kind cannot
 * be drawn until somebody says which it is (the `Record`s fail to type-check
 * without it, and `propCollide.test.ts` checks every placed prop against the
 * colliders by its role). Pure data: no three.js.
 */

import type { TownPropKind } from '../sim/town'

export type PropRole = 'solid' | 'walk'

/** The terrain's own instanced shapes (`terrain.ts`): scenery, ledges, decor. */
export type SceneryKind =
  // The tall scenery on solid cells, and what stands in front of a side place.
  | 'tree' | 'pine' | 'bush' | 'boulder' | 'spire' | 'crystal' | 'mushroom' | 'column' | 'brokenColumn'
  | 'wallBlock' | 'deadTree' | 'brazier' | 'hay' | 'iceRock' | 'emberRock'
  | 'caveWall' | 'caveBoulder' | 'caveGlow' | 'builtWall' | 'lowWall' | 'ruinWall'
  // A ledge: stones on its brow, a coping, a fallen boulder at its foot, a ramp's kerbs and treads.
  | 'browStone' | 'coping' | 'kerb' | 'tread'
  // Ground cover in the clearings.
  | 'tuft' | 'flower' | 'pebble' | 'bones' | 'ember' | 'shroom' | 'wheat' | 'crestStone'

export const SCENERY_ROLE: Readonly<Record<SceneryKind, PropRole>> = {
  tree: 'solid', pine: 'solid', bush: 'solid', boulder: 'solid', spire: 'solid', crystal: 'solid', mushroom: 'solid',
  column: 'solid', brokenColumn: 'solid', wallBlock: 'solid', deadTree: 'solid', brazier: 'solid', hay: 'solid',
  iceRock: 'solid', emberRock: 'solid', caveWall: 'solid', caveBoulder: 'solid', caveGlow: 'solid',
  builtWall: 'solid', lowWall: 'solid', ruinWall: 'solid',
  browStone: 'solid', coping: 'solid', kerb: 'solid', tread: 'walk',
  tuft: 'walk', flower: 'walk', pebble: 'walk', bones: 'walk', ember: 'walk', shroom: 'walk', wheat: 'walk', crestStone: 'walk'
}

/** What `levelProps.ts` builds of a zone's plan, besides its set pieces (`DRESS_ROLE`). */
export type LevelPropKind =
  | 'bridge' | 'ford' | 'caveMouth' | 'skullSign' | 'signpost' | 'hintStone'
  | 'reeds' | 'bankStone' | 'lilyPad' | 'chest' | 'treasureMound' | 'cage' | 'ore' | 'herb' | 'plate' | 'doorRocks' | 'key'

export const LEVEL_PROP_ROLE: Readonly<Record<LevelPropKind, PropRole>> = {
  bridge: 'walk', ford: 'walk', lilyPad: 'walk', plate: 'walk', herb: 'walk', key: 'walk', treasureMound: 'walk',
  caveMouth: 'solid', skullSign: 'solid', signpost: 'solid', hintStone: 'solid', reeds: 'solid', bankStone: 'solid',
  chest: 'solid', cage: 'solid', ore: 'solid', doorRocks: 'solid'
}

/** A town's props (`townProps.ts`): each keeps its cells (`TownProp.cells`)
 *  or stands in a yard nobody walks into. */
export const TOWN_PROP_ROLE: Readonly<Record<TownPropKind, PropRole>> = {
  well: 'solid', fountain: 'solid', stall: 'solid', board: 'solid', bench: 'solid', table: 'solid', barrel: 'solid',
  crates: 'solid', cart: 'solid', hay: 'solid', lamp: 'solid', tree: 'solid', dummy: 'solid', stone: 'solid',
  rack: 'solid', anvil: 'solid', trough: 'solid', grindstone: 'solid', woodpile: 'solid', laundry: 'solid',
  garden: 'solid', fence: 'solid', campfire: 'solid', brazier: 'solid', rubble: 'solid', signpost: 'solid',
  bush: 'solid', sacks: 'solid', cauldron: 'solid', gate: 'solid', planter: 'solid', barrels: 'solid',
  armorStand: 'solid', ore: 'solid', spill: 'solid',
  flowers: 'walk', pumpkins: 'walk', chalk: 'walk'
}

/** How far (m) a solid prop's drawn footprint may reach past its colliders:
 *  the hero's sleeve brushing a lumpy rock, never his body inside it (his
 *  collider's radius is 0.45 m). */
export const SOLID_TOL = 0.3

/** A body's height (m): what of a solid prop stands below it is in the way;
 *  a crown, an awning or a lintel above it is not (the hero walks under a
 *  branch). The hero's rig stands 1.42 m; a helmet or a raised hand more. */
export const BODY_H = 1.6

/** What lies lower than this (m) is walked over, whatever it belongs to: a
 *  tool dropped by a cart, a plinth's lip, a bale's straw. */
export const GROUND_H = 0.25
