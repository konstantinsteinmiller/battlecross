import { ref } from 'vue'

/**
 * ─── The intro's switch and its one live flag (roadmap #130) ─────────────────
 *
 * Import-free on purpose (Vue alone): the scene, the first-load ad and the
 * options window read it, and none of them may pull the intro's code, its
 * scene or its words onto the startup path. The intro itself is two lazy
 * chunks (`intro/runner.ts`, `IntroLayer.vue`) fetched only when it plays.
 *
 * `VITE_INTRO_ENABLED=true` in the build's env switches it on. Off (the
 * default, in `.env` and every portal env) every branch on `INTRO_ENABLED`
 * folds away and the two chunks are never requested.
 */

/** The build carries the intro. A literal comparison, so the bundler folds it. */
export const INTRO_ENABLED: boolean = import.meta.env.VITE_INTRO_ENABLED === 'true'

/** The one-time flag in `profile.tips`: the intro was watched to its end or skipped. */
export const INTRO_TIP = 'introSeen'

/** The intro is on screen: no HUD, no lessons, no gameplay bracket, no ad. */
export const introPlaying = ref(false)
