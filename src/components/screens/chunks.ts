/**
 * The full screens — the world map, the hero's book (with its 3D doll), the
 * trade, trainer and healer tables — as chunks of their own: none of them is
 * on screen while the first place loads, and together they were ~160 kB of the
 * scene's chunk. `preloadScreens` fetches them once the first frame is up, so
 * opening one later does not wait.
 *
 * Dynamic imports live here, in a module the obfuscator leaves alone
 * (`vite.config.ts`): its string-array pass would otherwise break them.
 */
export const SCREEN_CHUNKS = {
  worldMap: () => import('./WorldMap.vue'),
  heroBook: () => import('./hero/HeroBook.vue'),
  trade: () => import('./trade/TradeScreen.vue'),
  teach: () => import('./trade/TeachScreen.vue'),
  healer: () => import('./trade/HealerScreen.vue')
}

/** Fetch every screen's chunk (each import is cached: a no-op once loaded). */
export const preloadScreens = (): void => {
  for (const load of Object.values(SCREEN_CHUNKS)) void load().catch(() => { /* a later open retries */ })
}
