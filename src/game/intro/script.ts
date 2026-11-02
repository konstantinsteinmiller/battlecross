/**
 * ─── The intro's script (roadmap #130, replaced by #183) ─────────────────────
 *
 * Pure data and a small clock, no engine: the runner (`intro/runner.ts`) plays
 * it, the tests hold it to its limits (`tests/game/intro.test.ts`).
 *
 * A new save picks its hero first (the choice is also the click that gives the
 * page focus), then 12 seconds of film play and the game starts:
 *
 *   0.0  the field, a small dragon over a hero lying face down in the grass
 *   0.9  two heroes, far above this one's level, ride in on the fight: a beast
 *        caller (wolves, a bear, a hawk) and an elementalist (fire, frost,
 *        lightning, a storm of meteors)
 *   8.4  the dragon falls
 *   9.0  they leave, not once looking at the one in the grass
 *  10.4  black, and "1 month later…"
 *  12.0  the game
 *
 * The hero on the ground is never seen from the front, so the face the player
 * picked is the one that gets up a month later.
 *
 * The scene's half waits for the place: if it is not built by `SCENE_AT` the
 * clock holds there (black) until it is, and gives up on a device that needs
 * longer than `BUILD_CAP_S` (the game just starts).
 */

/** The whole intro, seconds (the roadmap's ceiling is 12). */
export const INTRO_LENGTH = 12
/** The place is on screen from here; the clock holds here until it is built. */
export const SCENE_AT = 0
/** Wall seconds the build may take before the intro is dropped. */
export const BUILD_CAP_S = 12
/** The fade in from black. */
export const FADE_IN_S = 0.7
/** Where it is shot: an icy field, and the smaller of the dragons. */
export const INTRO_ZONE = 'tundra'
export const INTRO_FOE_LEVEL = 19
export const INTRO_SEED = 130
/** Which of the zone's packs the scene is staged at (never the finale). */
export const INTRO_PACK = 1
/** The dragon of the fight (an elite: the smaller of the dragons). */
export const INTRO_DRAGON = 'voidDrake'
/** The two who save the day: their looks (the masters of the two schools). */
export const INTRO_MAGE = 'sbMasterElementalist'
export const INTRO_BEAST = 'sbMasterBeastcaller'

/** The heroes' entrance (#188): a leap in from the picture's edge with a forward flip, landing as a hero lands. */
export const ENTRY_AT = 0.4
export const ENTRY_S = 1.3

/** What happens when: who does it and what. The runner plays them in order. */
export type IntroAct = 'roar' | 'summon' | 'close' | 'slap' | 'slay' | 'flee' | 'rise' | 'load'
export interface IntroBeat { at: number; who: 'beast' | 'mage' | 'both'; act: IntroAct }
export const INTRO_ACTS: readonly IntroBeat[] = [
  { at: 0.15, who: 'both', act: 'roar' },
  { at: 1.9, who: 'beast', act: 'summon' },
  { at: 2.4, who: 'both', act: 'close' },
  { at: 3.7, who: 'mage', act: 'slap' },
  { at: 4.15, who: 'beast', act: 'slap' },
  { at: 4.6, who: 'mage', act: 'slap' },
  { at: 5.05, who: 'beast', act: 'slap' },
  { at: 5.5, who: 'mage', act: 'slap' },
  { at: 5.95, who: 'beast', act: 'slap' },
  { at: 6.5, who: 'both', act: 'slay' },
  { at: 7.4, who: 'both', act: 'flee' },
  { at: 8.4, who: 'both', act: 'rise' },
  { at: 8.9, who: 'both', act: 'load' }
]
/** The camera: pulled well back (above 1 is farther), so the leaps, the flips and the dragon are all in the picture. */
export const INTRO_ZOOMS = [{ at: 0, to: 1.3, dur: 0.01, hold: 12 }] as const
/** "1 month later…" fades in over the dark from here. */
export const LABEL_AT = 9.8
/** The last fade to black (the label rides on it). */
export const FADE_OUT_AT = 9.3

/** How black the screen is at `t` (0..1): black until the scene is built, the fade in, the fade to black. */
export const veilAt = (t: number, sceneReady: boolean): number => {
  if (!sceneReady) return 1
  if (t < FADE_IN_S) return 1 - t / FADE_IN_S
  if (t >= FADE_OUT_AT) return Math.min(1, (t - FADE_OUT_AT) / (LABEL_AT + 0.5 - FADE_OUT_AT))
  return 0
}

/** How visible the label is at `t` (0..1). */
export const labelAt = (t: number): number => (t < LABEL_AT ? 0 : Math.min(1, (t - LABEL_AT) / 0.5))

/**
 * The intro's clock: real seconds, paused with the game, held at `SCENE_AT`
 * until the place is built. `tick` returns the new time.
 */
export const createIntroClock = () => {
  let t = 0
  return {
    tick(dt: number, sceneReady: boolean): number {
      const next = t + Math.max(0, Math.min(dt, 0.1))
      t = !sceneReady && next > SCENE_AT ? SCENE_AT : Math.min(INTRO_LENGTH, next)
      return t
    },
    get t(): number { return t },
    get done(): boolean { return t >= INTRO_LENGTH }
  }
}

// ─── The old narration (#130): no longer played, kept for the voice tools ─────

/** The old narrator's lines: i18n key (= voice id) and when it started. The new film has no narrator; these stay
 *  so the voice files and tools that name them keep working until the owner drops them. */
export const INTRO_LINES = [
  { id: 'dlg.intro.crossing.1', at: 0.1 },
  { id: 'dlg.intro.hero.1', at: 6.0 },
  { id: 'dlg.intro.fire.1', at: 10.3 },
  { id: 'dlg.intro.foes.1', at: 13.8 },
  { id: 'dlg.intro.begin.1', at: 20.8 }
] as const
/** The beats of the old narration, in order (the voice manifest's line names). */
export const INTRO_BEATS = INTRO_LINES.map(l => l.id.split('.')[2]!)

/** From here the film can no longer be skipped: the opening level is building behind it (#189). */
export const NO_SKIP_AT = 8.9
