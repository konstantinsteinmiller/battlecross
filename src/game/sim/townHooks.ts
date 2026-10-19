/**
 * The town's simulation code (`townCode.ts`), once it is loaded
 * (`townSimLoader.ts`, roadmap #142). The engine calls into a town only
 * inside one, and a town is never built before its code is here
 * (`ZoneMode.create` awaits it), so `townSim()` is always set where it is read.
 */
export type TownCode = typeof import('./townCode')

let code: TownCode | null = null

/** The loaded town code, or null before the first load. */
export const townSimReady = (): TownCode | null => code

/** The town code, inside a town (where it is always loaded). */
export const townSim = (): TownCode => {
  if (!code) throw new Error('[town] the town code is not loaded')
  return code
}

/** Hand the loaded chunk over (the loader; a test's setup). */
export const installTownSim = (c: TownCode): void => { code = c }
