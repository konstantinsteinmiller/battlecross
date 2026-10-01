/**
 * The Grand Master Bot's numbers (`sim/grandMaster.ts`), apart from its body
 * so the balance sim (`sim/balance.ts`, run by a node script) can read them
 * without loading three.js.
 */

/** The giant's health against Vex's own (his max). */
export const GM_HP_MUL = 2.5
/** A hit on the weak spot itself, and with the part's weakness. */
export const WEAK_SPOT_MUL = 1.5
export const WEAKNESS_MUL = 2
