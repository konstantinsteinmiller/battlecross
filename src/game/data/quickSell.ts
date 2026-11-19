/**
 * Quick sell (the merchant's table, `TradeScreen.vue`): Shift + click sells a piece at once, and a switch above the bag does
 * the same for a tap. The way to learn it is a short lightbox, shown once: when the hero comes to a trader after the
 * Whispering Woods (the loot has piled up by then), or after three sales in a row by the long way (tap the piece, tap Sell).
 */
export const QUICK_SELL_TIP = 'quickSell'
/** Sales in a row, each by the long way, after which the lightbox shows. */
export const QUICK_SELL_STREAK = 3
/** The zone after which the next trader teaches it. */
export const QUICK_SELL_AFTER = 'woods'

/** Has the hero been to the Woods (cleared it, or walked in)? */
export const quickSellDue = (tips: Record<string, unknown>, cleared: readonly string[], visits: Record<string, number>): boolean =>
  !tips[QUICK_SELL_TIP] && (cleared.includes(QUICK_SELL_AFTER) || (visits[QUICK_SELL_AFTER] ?? 0) > 0)
