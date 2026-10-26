import { MAP, type NodeId } from './zones'

/**
 * The iOS free demo and its one-time full-version unlock (roadmap #Store-IAP).
 *
 * On the iOS store build the game is free to play up to and including the
 * Goblin King (the Goblin Hollows finale and its decision). Everything past
 * that needs the non-consumable In-App Purchase below. Every other build
 * (Android, web portals, desktop) is fully free and never reads this list.
 *
 * THE one place that says what "beyond the demo" means: `LOCKED_NODES`. A
 * quest is locked when its zone is (`questLockedByDemo`), so the list needs
 * no second column. `tests/game/fullVersionGate.test.ts` pins that every map
 * node is either demo content or locked, so a node added later cannot slip
 * past the lock unnoticed.
 */

/** The non-consumable product in App Store Connect. */
export const FULL_VERSION_PRODUCT_ID = 'com.hyperg8.battlecross.fullversion'

/** The world flag every answer to the Goblin King's decision sets (slay, pact,
 *  ransom all open the colosseum): the demo's last story beat is done. */
export const DEMO_END_FLAG = 'arenaOpen'

/** The demo: the town, the first fight and the Hollows. Playable and
 *  replayable without the purchase. */
export const DEMO_NODES: readonly NodeId[] = ['sunford', 'plains', 'hollows']

/** Everything else (the colosseum the Goblin King opens included): shut on the
 *  demo build until the full version is bought. */
export const LOCKED_NODES: readonly NodeId[] = [
  'arena', 'woods', 'silverbridge', 'outskirts', 'oakhaven', 'bastion', 'crags', 'mines',
  'ironhold', 'tundra', 'temple', 'citadel', 'peak', 'fortress', 'rift'
]

const LOCKED = new Set<string>(LOCKED_NODES)

/** Is this place part of the paid game? (Pure data: whether the lock applies
 *  at all is `useFullVersion`'s call.) */
export const isLockedNode = (id: string): boolean => LOCKED.has(id)

/** A quest is past the demo when its zone is. */
export const questLockedByDemo = (questNode: string): boolean => LOCKED.has(questNode)

/** Has the player seen the demo through (the Goblin King answered)? */
export const demoEnded = (flags: ReadonlySet<string>): boolean => flags.has(DEMO_END_FLAG)

/** Nodes of the map that are neither demo content nor locked (must stay empty). */
export const unclassifiedNodes = (): NodeId[] =>
  MAP.map(n => n.id).filter(id => !DEMO_NODES.includes(id) && !LOCKED.has(id))
