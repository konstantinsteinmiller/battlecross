import { shallowReactive } from 'vue'
import { newOverlay, type IntroOverlay, type ShotId } from './introScript'

/**
 * ─── The cutscene's HUD mirror ───────────────────────────────────────────────
 *
 * The same firewall as `state/hud.ts`: the cutscene (`story/intro.ts`) never
 * touches Vue. Discrete things the layer shows through Vue (the skip glyph,
 * the screen-reader line, which bubble or caption is up) go in `cine`, written
 * only when they change. Everything that moves every frame (the overlays, the
 * projected anchors of the bubble and the hologram's tags) goes in `cineLive`,
 * which `CutsceneLayer.vue` paints with direct DOM writes from its HUD ticker.
 */

export const cine = shallowReactive({
  /** A cutscene is on screen. */
  on: false,
  /** The skip glyph is up (and a skip counts). */
  skip: false,
  /** The screen-reader line: the shot whose `story.intro.<id>` is read. */
  line: '' as ShotId | '',
  /** Atlas's caption (`story.atlas.<key>`), and a count so a repeat re-pops. */
  atlas: '' as '' | 'logStart' | 'goodMorning' | 'scrapyardFirst',
  atlasSeq: 0,
  /** Dr. Vex's speech bubble (`story.vex.<key>`). */
  vex: '' as '' | 'diagnosis'
})

export interface CineLive extends IntroOverlay {
  /** The cutscene clock (s). */
  t: number
  /** When the current Atlas caption came up (s). */
  atlasAt: number
  /** Vex's bubble anchor, in viewport fractions (0..1, top-left origin). */
  bubbleX: number
  bubbleY: number
  /** The hologram's tag anchors (viewport fractions). */
  fortX: number
  fortY: number
  scrapX: number
  scrapY: number
}

export const cineLive: CineLive = { ...newOverlay(), t: 0, atlasAt: -10, bubbleX: 0.5, bubbleY: 0.2, fortX: 0, fortY: 0, scrapX: 0, scrapY: 0 }

/** Back to rest (a cutscene ended, or a new one starts). */
export const resetCine = (): void => {
  cine.on = false
  cine.skip = false
  cine.line = ''
  cine.atlas = ''
  cine.vex = ''
  Object.assign(cineLive, newOverlay(), { t: 0, atlasAt: -10 })
}

// ─── Skip ────────────────────────────────────────────────────────────────────

let skipHandler: (() => void) | null = null

/** The live cutscene registers how it is skipped (null when it ends). */
export const setSkipHandler = (fn: (() => void) | null): void => {
  skipHandler = fn
}

/** The skip glyph, `Esc`: skip the cutscene on screen, if any (and if a skip
 *  counts yet — the cutscene decides). */
export const skipCutscene = (): void => {
  skipHandler?.()
}
