import { reactive } from 'vue'
import { DEFENCES, type DefenceId, type SiegeTier } from '../data/siege'
import type { BuildBlock, SiegePhase } from '../sim/siege'

/**
 * ─── The siege's HUD mirror (afterplay §8.5) ────────────────────────────────
 *
 * What `SiegeHud.vue` shows, written by the live scene at the HUD's rate
 * (≤ 15 Hz, `ZoneMode.syncHud`) and only where it changed: the wave of ten,
 * the phase and the build clock, the gate's health (always on show), the
 * Marks in hand, which defences can be bought now, and the siege's boss.
 * `active` is false outside a siege.
 */
export const siegeHud = reactive({
  active: false,
  tier: 'normal' as SiegeTier,
  story: false,
  phase: 'build' as SiegePhase,
  wave: 1,
  /** Whole seconds left in the build phase. */
  buildT: 0,
  gate01: 1,
  gateHp: 0,
  gateMax: 0,
  marks: 0,
  /** Why each defence cannot be bought ('' it can). */
  blocks: Object.fromEntries(DEFENCES.map(d => [d, ''])) as Record<DefenceId, BuildBlock>,
  /** The siege's boss on the field: its name key and health (0: none). */
  bossKey: '',
  boss01: 0,
  /** Defences standing: ballistas, lit cauldrons, barricades up, militia alive. */
  ballistas: 0,
  cauldrons: 0,
  barricades: 0,
  militia: 0
})

/** The scene's hands for the HUD's buttons (set while a siege is the live scene). */
export const siegeActions = {
  build: (_id: DefenceId): boolean => false,
  ready: (): boolean => false
}
