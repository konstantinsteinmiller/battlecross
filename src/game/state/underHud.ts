import { reactive } from 'vue'

/**
 * ─── The Undercroft's HUD mirror (roadmap #EXT-1) ────────────────────────────
 *
 * What `UndercroftHud.vue` shows, written by the live scene: the dark veil (how much of the picture is lit), the cart's
 * state and the skip button. `active` is false outside the Undercroft.
 */
export const underHud = reactive({
  active: false,
  phase: 'corridor' as 'corridor' | 'cart' | 'stash' | 'warden' | 'done',
  /** The share of the picture the lantern lights (0.2 a dark corridor .. 1 all lit). */
  lit: 0.25,
  /** The dark veil is on (the corridor only). */
  dark: true,
  /** Barrels hit and gaps fallen in the cart run, and chests opened in the stash. */
  hits: 0,
  chests: 0
})

export const underActions = {
  skip: (): void => {}
}
