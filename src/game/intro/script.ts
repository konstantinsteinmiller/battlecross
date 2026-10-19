/**
 * ─── The intro's script (roadmap #130) ───────────────────────────────────────
 *
 * Pure data and two small clocks, no engine: the runner (`intro/runner.ts`)
 * plays it, the voice manifest reads its lines (`data/dialogs/intro.ts`), the
 * tests hold it to its limits (`tests/game/intro.test.ts`).
 *
 * 25 seconds, in two acts:
 *   0.0  black, the title, the narrator: "Every road in this world meets at a
 *        crossing… and every crossing is a battle." (the place builds behind it)
 *   4.0  the frozen tundra fades in, close on a level-30 Pyromancer, five
 *        skills in the belt, a pack of the Frost Jarl's folk closing in
 *   6.0  "From the quiet fields of Sunford, a young hero set out."
 *   5–16 Flame Pillar, Fireball, Ring of Fire ("Fire answered the call."),
 *        Phoenix Flight, Fireball, Flame Pillar
 *  13.8  "Goblin kings, frost jarls, a void dragon… and the Arch-Demon."
 *  17.6  the camera pulls out: Cataclysm, twelve meteors finish the field
 *  20.8  "Your legend begins now." and the title over the burning field;
 *        fade to black, the game starts at 25.0
 *
 * The scene's half waits for the place: if it is not built by `SCENE_AT`,
 * the clock holds there (the title card stays) until it is, and gives up on a
 * device that needs longer than `BUILD_CAP_S` (the game just starts).
 */

/** The whole intro, seconds (the roadmap's ceiling is 25). */
export const INTRO_LENGTH = 25
/** The place is on screen from here; the clock holds here until it is built. */
export const SCENE_AT = 4
/** Wall seconds the build may take before the intro is dropped. */
export const BUILD_CAP_S = 12
/** Hold Space (or the skip button) this long to skip. */
export const HOLD_SKIP_S = 1.5
/** Where it is shot: an icy field for fire to light up, and the Jarl's folk. */
export const INTRO_ZONE = 'tundra'
/** Its enemies' level, and a fixed seed so every player sees the same field. */
export const INTRO_FOE_LEVEL = 19
export const INTRO_SEED = 130
/** Which of the zone's packs the hero meets (never the finale: no boss, no victory). */
export const INTRO_PACK = 1
/** The hero: a full build of this class at this level. */
export const INTRO_CLASS = 'pyro'
export const INTRO_LEVEL = 30
/** The five skills in the belt (slots 0-4), the fire school's best. */
export const INTRO_BELT = ['fireball', 'flamePillar', 'ringOfFire', 'phoenixFlight', 'cataclysm'] as const
/** The foes are this much tougher until the finale, so every skill has someone to hit. */
export const INTRO_FOE_HP = 6

/** The narrator's lines: i18n key (= voice id) and when it starts. */
export const INTRO_LINES = [
  { id: 'dlg.intro.crossing.1', at: 0.1 },
  { id: 'dlg.intro.hero.1', at: 6.0 },
  { id: 'dlg.intro.fire.1', at: 10.3 },
  { id: 'dlg.intro.foes.1', at: 13.8 },
  { id: 'dlg.intro.begin.1', at: 20.8 }
] as const

/** The beats of the narration, in order (the voice manifest's line names). */
export const INTRO_BEATS = INTRO_LINES.map(l => l.id.split('.')[2]!)

/** Skill casts: belt slot, when. The last one is the finale. */
export const INTRO_CASTS = [
  { slot: 1, at: 5.2 },
  { slot: 0, at: 7.4 },
  { slot: 2, at: 10.6 },
  { slot: 3, at: 12.6 },
  { slot: 0, at: 14.6 },
  { slot: 1, at: 16.2 },
  { slot: 4, at: 17.6 }
] as const

/** The finale: from here the field may fall. */
export const FINALE_AT = 17.6
/** Camera: close on the hero as the scene opens, pulled out for the finale. */
export const INTRO_ZOOMS = [
  { at: SCENE_AT, to: 0.72, dur: 0.01, hold: 5.4 },
  { at: 17.3, to: 1.3, dur: 0.8, hold: 5 }
] as const
/** The title card: over black at the start, over the field at the end. */
export const TITLE_SPANS: ReadonlyArray<readonly [number, number]> = [[0.2, SCENE_AT], [21.0, INTRO_LENGTH]]
/** The last fade to black. */
export const FADE_OUT_AT = 24.2

/** The line on screen at `t` (index into INTRO_LINES, -1 for none): each holds until the next. */
export const lineAt = (t: number): number => {
  let i = -1
  for (let k = 0; k < INTRO_LINES.length; k++) if (t >= INTRO_LINES[k]!.at) i = k
  return t >= INTRO_LENGTH ? -1 : i
}

/** Is the title card up at `t`? */
export const titleAt = (t: number): boolean => TITLE_SPANS.some(([a, b]) => t >= a && t < b)

/** How black the screen is at `t` (0..1): black until the scene, then the last fade. */
export const veilAt = (t: number, sceneReady: boolean): number => {
  if (!sceneReady || t < SCENE_AT) return 1
  if (t < SCENE_AT + 0.6) return 1 - (t - SCENE_AT) / 0.6
  if (t >= FADE_OUT_AT) return Math.min(1, (t - FADE_OUT_AT) / (INTRO_LENGTH - FADE_OUT_AT))
  return 0
}

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

/**
 * Hold-to-skip (the RDR2 way): the ring fills while the key or the button is
 * held and drains, four times as fast, when it is let go — a tap never skips.
 * `tick` returns true once, and for good, when the ring is full.
 */
export const createHoldSkip = (need = HOLD_SKIP_S) => {
  let held = 0
  let down = false
  let done = false
  return {
    press(): void { if (!done) down = true },
    release(): void { down = false },
    tick(dt: number): boolean {
      if (done) return true
      const step = Math.max(0, Math.min(dt, 0.1))
      held = down ? Math.min(need, held + step) : Math.max(0, held - step * 4)
      if (held >= need) done = true
      return done
    },
    get progress(): number { return held / need },
    get holding(): boolean { return down },
    get done(): boolean { return done }
  }
}
