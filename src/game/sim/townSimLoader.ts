import { installTownSim, townSimReady, type TownCode } from './townHooks'

/**
 * The town's simulation (layout and town life, ~100 kB of code) is a chunk of
 * its own, like the town's view (`gfx/townLoader.ts`): fetched in the
 * background once a place is on screen (`ZoneMode.enter`), and awaited before
 * a town is built, so a travel to town does not wait for it.
 *
 * A module of its own because of the obfuscator: a file with a dynamic import
 * must be excluded from it (`vite.config.ts`), and this one holds nothing else.
 */
export const loadTownSim = async (): Promise<TownCode> => {
  const had = townSimReady()
  if (had) return had
  const m = await import('./townCode')
  installTownSim(m)
  return m
}
