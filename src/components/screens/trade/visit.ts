import { watch } from 'vue'
import { flow } from '@/game/flow'
import { clearBuyBack } from '@/game/state/profile'

/**
 * A visit to a merchant lasts as long as the conversation with them: the
 * buy-back row (`profile.ts`) belongs to it. The shop screen may be closed
 * and opened again inside one conversation and still offer what was sold;
 * once the hero turns to someone else, or walks away, the sales are final.
 *
 * Imported for its effect by the shop screen: the watch is set up once, on
 * the first visit, and lives as long as the game.
 */
let armed = false
export const trackVisit = (): void => {
  if (armed) return
  armed = true
  watch(() => flow.npc?.id ?? '', (now, was) => { if (now !== was) clearBuyBack() }, { flush: 'sync' })
}
