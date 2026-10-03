/**
 * The town's view (houses, props, town life: ~90 kB of code) is its own chunk:
 * the first fight of a new player never needs it. Loaded when a town is built,
 * and fetched in the background once a place is on screen
 * (`ZoneMode.enter`), so a travel to town does not wait for it.
 *
 * A module of its own because of the obfuscator: a file with a dynamic import
 * must be excluded from it (`vite.config.ts`), and this one holds nothing else.
 */
export const loadTownView = (): Promise<typeof import('./townView')> => import('./townView')
