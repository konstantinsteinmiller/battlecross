import { idleTask, rerankIdle } from '@/utils/idleQueue'

/**
 * The full screens — the world map, the hero's book (with its 3D doll), the
 * trade, trainer and healer tables — as chunks of their own: none of them is
 * on screen while the first place loads, and together they were ~160 kB of the
 * scene's chunk. `queueScreens` fetches them one by one once the first frame
 * is up, so opening one later does not wait.
 *
 * Dynamic imports live here, in a module the obfuscator leaves alone
 * (`vite.config.ts`): its string-array pass would otherwise break them.
 */
export const SCREEN_CHUNKS = {
  worldMap: () => import('./WorldMap.vue'),
  heroBook: () => import('./hero/HeroBook.vue'),
  trade: () => import('./trade/TradeScreen.vue'),
  teach: () => import('./trade/TeachScreen.vue'),
  healer: () => import('./trade/HealerScreen.vue'),
  alchemy: () => import('./trade/AlchemyScreen.vue'),
  // The forge (#99).
  smithing: () => import('./trade/SmithScreen.vue'),
  sellOre: () => import('./trade/SellOreScreen.vue'),
  // The gamblers' tables (#91, #92).
  memory: () => import('../modals/MemoryGame.vue'),
  itemBattle: () => import('../modals/ItemBattle.vue'),
  cups: () => import('../modals/CupsGame.vue'),
  // The fort's fair games (afterplay §9).
  whack: () => import('../modals/WhackGame.vue'),
  ring: () => import('../modals/RingTossGame.vue'),
  arm: () => import('../modals/ArmWrestleGame.vue'),
  // Not screens, but not on the first frame either: a conversation's layer
  // (towns and decisions) and the options window.
  dialog: () => import('../dialog/DialogLayer.vue'),
  // The small talk overheard in a town (it reads the town's life, a lazy chunk too).
  overheard: () => import('../dialog/OverheardLayer.vue'),
  options: () => import('../organisms/OptionsModal.vue')
}

export type ScreenChunk = keyof typeof SCREEN_CHUNKS

/**
 * The order the screens are fetched in, by where the player is (roadmap #142):
 * in a field the book and bag (opened after a fight) and the map (he leaves by
 * it) come first; in a town its people's conversation and their tables. The
 * gamblers' tables are last everywhere. A screen opened before its turn loads
 * at once, as before.
 */
export const SCREEN_ORDER: Record<'field' | 'town', readonly ScreenChunk[]> = {
  field: ['heroBook', 'worldMap', 'dialog', 'options', 'overheard', 'trade', 'smithing', 'sellOre', 'teach', 'healer', 'alchemy', 'memory', 'itemBattle', 'cups', 'whack', 'ring', 'arm'],
  town: ['dialog', 'trade', 'smithing', 'sellOre', 'teach', 'healer', 'alchemy', 'overheard', 'worldMap', 'heroBook', 'options', 'memory', 'itemBattle', 'cups', 'whack', 'ring', 'arm']
}

/** The idle queue's key of a screen's chunk. */
export const screenTask = (name: ScreenChunk): string => `screen:${name}`

/**
 * Queue every screen's chunk on the background queue (`utils/idleQueue.ts`),
 * ranked for `place`; called again on a new place, it re-ranks what is still
 * waiting. Each import is cached: a no-op once loaded.
 */
export const queueScreens = (place: 'field' | 'town'): void => {
  const order = SCREEN_ORDER[place]
  order.forEach((name, i) => idleTask(screenTask(name), SCREEN_CHUNKS[name], 10 + i))
  rerankIdle(Object.fromEntries(order.map((name, i) => [screenTask(name), 10 + i])))
}
