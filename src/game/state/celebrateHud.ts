import { reactive } from 'vue'

/**
 * ─── The celebration's HUD mirror (roadmap #206) ─────────────────────────────
 *
 * What `CelebrateHud.vue` shows, written by the live scene: the letterbox, the title, the skip. `active` is false
 * outside the film after the Goblin King.
 */
export const celebrateHud = reactive({
  active: false,
  /** The title is up. */
  title: false,
  /** The film's progress, 0..1. */
  t01: 0
})

/** The scene's hand for the HUD's skip button (set while the film is the live scene). */
export const celebrateActions = {
  skip: (): void => {}
}
