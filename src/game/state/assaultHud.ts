import { reactive } from 'vue'

/**
 * ─── The besieged gate's HUD mirror (roadmap #204) ───────────────────────────
 *
 * What `AssaultHud.vue` shows, written by the live scene at the HUD's rate and only where it
 * changed. `active` is false outside the siege of the Hollows' gate.
 */
export const assaultHud = reactive({
  active: false,
  /** 'panorama' (the cutscene), 'play', 'breach'. */
  phase: 'play' as 'panorama' | 'play' | 'breach',
  /** Towers still standing, of two. */
  towers: 2,
  /** What the player needs to hear: the two ways, the ram being pushed, or the idle reminder. */
  hint: '' as '' | 'levers' | 'pushing' | 'idle',
  /** The sally is on (#EXT-7): the gate guards are out, and how many are left (those still to come too). */
  sally: false,
  foes: 0,
  /** The cutscene's progress, 0..1. */
  cut01: 0,
  /** The ram's way: where it is on the screen, and the angle (radians, screen space) toward the tower it will roll to. */
  aim: false,
  aimX: 0,
  aimY: 0,
  aimAngle: 0
})

/** The scene's hands for the HUD's buttons (set while the siege is the live scene). */
export const assaultActions = {
  skipCut: (): void => {},
  skipSiege: (): void => {}
}
