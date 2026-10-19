import { installTalkCode, talkCodeReady } from './talk'

/**
 * The conversations' code (the dialogue engine and every conversation, see
 * `talkCode.ts`) is a chunk of its own: fetched on the idle queue once a place
 * is on screen (`ZoneMode.enter`), awaited before a town is built and by a
 * conversation that starts before it is here.
 *
 * A module of its own because of the obfuscator: a file with a dynamic import
 * must be excluded from it (`vite.config.ts`), and this one holds nothing else.
 */
export const loadTalk = async (): Promise<void> => {
  if (talkCodeReady()) return
  installTalkCode(await import('./talkCode'))
}
