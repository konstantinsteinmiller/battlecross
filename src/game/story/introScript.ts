import type { SfxName } from '../audio/sfx'

/**
 * ─── The intro, "Wake-Up Call": the script ──────────────────────────────────
 *
 * The six shots of `story-arc.md` § 1 as data and pure functions of time: which
 * shot is on, which one-shot events fire (sounds, lines, the music handover),
 * and every overlay's value (the rewind, the eyelids, the blur, the HUD boot,
 * the white flash). `IntroMode` (`story/intro.ts`) plays it on the game loop's
 * clock; nothing here touches three.js or Vue, so a test can step the whole
 * cutscene without a GPU.
 *
 *   0   0–11   cold open: the neon street, Flux runs in, the slide in slow
 *              motion, the charge, the freeze, the tape rewind
 *   1  11–21   the valley at dusk, then the Red Signal (Vex's bubble, the
 *              red ring, Blaze's cut-in)
 *   2  21–31   the lab: the alarm, the Atlas disc's close-up, the lever
 *   3  31–36   safe mode: Gauss freezes herself
 *   4  36–49   wake-up, first person: blinks, Pip, the HUD boots, Atlas,
 *              the hologram
 *   5  49–57   the beam, the flash, the logo
 *
 * Paced to be followed on a first watch, not to fit a budget: every shot
 * holds its framing while its action plays, each beat gets its own moment
 * (a line stays up long enough to read in any language), and the camera
 * drifts between few keys rather than cutting. Anyone who has seen it skips
 * it (the skip button, `Esc`, or holding `Space`; `cine.ts`).
 */

export type ShotId = 'coldOpen' | 'valley' | 'lab' | 'safeMode' | 'wakeUp' | 'beam'

export interface Shot {
  id: ShotId
  start: number
  end: number
}

/** Where each shot after the cold open starts (s). */
export const VALLEY_FROM = 11
export const LAB_FROM = 21
export const SAFE_FROM = 31
export const WAKE_FROM = 36
export const BEAM_FROM = 49
/** The whole cutscene (s). */
export const INTRO_END = 57

export const SHOTS: readonly Shot[] = [
  { id: 'coldOpen', start: 0, end: VALLEY_FROM },
  { id: 'valley', start: VALLEY_FROM, end: LAB_FROM },
  { id: 'lab', start: LAB_FROM, end: SAFE_FROM },
  { id: 'safeMode', start: SAFE_FROM, end: WAKE_FROM },
  { id: 'wakeUp', start: WAKE_FROM, end: BEAM_FROM },
  { id: 'beam', start: BEAM_FROM, end: INTRO_END }
]

/** The skip button appears, and a skip counts, from here (s). */
export const SKIP_AFTER = 0.5
/** How long an Atlas caption stays up (s): its voice runs ≤ 2.2 s, and a
 *  translated caption must be readable after it. */
export const ATLAS_HOLD = 3.5

/** Index into `SHOTS` of the shot on at `t`. */
export const shotIndexAt = (t: number): number => {
  for (let i = SHOTS.length - 1; i > 0; i--) if (t >= SHOTS[i]!.start) return i
  return 0
}

export const shotAt = (t: number): Shot => SHOTS[shotIndexAt(t)]!

/** Seconds into the shot on at `t`. */
export const shotTime = (t: number): number => t - shotAt(t).start

// ─── The cold open's action clock ────────────────────────────────────────────
//
// The street's choreography (`renderStreet`) is written in ACTION seconds:
// Flux runs in until 1.1, slides under the Trooper's swing, plants, charges,
// and releases at 2.7. The picture plays it through a speed ramp: the run at
// full speed from far down the street (it starts before 0), the slide — the
// poster frame — at a third of it, the plant and the charge at under half, so
// each move reads; then the freeze, and the tape runs it all back.

/** Where the action starts: Flux far down the street, running in. */
export const STREET_FROM = -2.4
/** The release: the shot a hand's width off the Trooper's shield. */
export const STREET_RELEASE = 2.7
/** [picture s, action s]: piecewise linear, rising (the ramp's gears). */
const STREET_CLOCK: ReadonlyArray<readonly [number, number]> = [
  [0, STREET_FROM],
  [3.2, 0.8], // full speed: the run toward the camera, the drones swoop in
  [5.6, 1.6], // a third: the Trooper steps out, the slide under the swing
  [7.0, 2.2], // under half: he plants, turns and raises the buster
  [7.9, 2.6], // the charge ring fills
  [8.1, STREET_RELEASE] // the shot leaves
]
/** The freeze frame on the release, then the tape runs the action backwards. */
export const FREEZE_AT = 8.1
export const REWIND_FROM = 9.2
/** How fast the rewind runs the action back (× real time): back to the start
 *  in about 1.6 s, with the tape's tear held a beat on the first frame. */
export const REWIND_RATE = 3.2

// ─── Beats inside the shots (s, absolute) ────────────────────────────────────

/** The valley: the Spire's tip flashes red, and Vex's face glitches on. */
export const SPIRE_FLASH = 14.6
export const VEX_ON = 15.0
/** The red shock-ring rolls out over the valley (0 → 1 of the valley's reach). */
export const RING_FROM = 15.8
export const RING_TO = 18.8
/** Blaze Master's cut-in: gold eyes flicker, then lock red; the cut to the
 *  lab comes straight off it. */
export const CUTIN_FROM = 19.4
export const CUTIN_TO = LAB_FROM
/** The lab: the alarm closes in; Gauss turns to Flux, the Atlas disc's
 *  close-up (it slides home in it), the red crackle, the lever. */
export const ALARM_TO = 26.0
export const GAUSS_TURN = 23.0
export const DISC_FROM = 24.4
export const DISC_TO = 26.0
export const STAGGER_AT = 26.4
export const LEVER_AT = 28.4
/** Safe mode: she walks to her capsule, the glass seals, the frost races up,
 *  the heartbeat light starts. */
export const SEAL_AT = 32.4
export const FROST_FROM = 32.7
export const FROST_TO = 34.2
export const HEART_FROM = 34.4
/** Wake-up: Pip pops in, the HUD boots, the hologram opens. */
export const PIP_POP = 40.2
export const HUD_BOOT = 41.2
export const HP_FILL_FROM = 41.4
export const HP_FILL_TO = 42.8
export const GLYPH_ON = 42.2
export const LV_POP = 43.0
export const HOLO_FROM = 44.0
export const SCRAP_BLINK = 46.4
/** The beam: the view turns to the pad (the hologram folds away) and steps
 *  onto it; the column rises; the flash and the logo. */
export const TURN_FROM = BEAM_FROM
export const HOLO_FOLD_FROM = TURN_FROM + 0.4
export const HOLO_FOLD_TO = TURN_FROM + 1.1
export const STEP_FROM = 50.4
export const STEP_TO = 51.9
export const BEAM_RISE = 52.2
export const FLASH_FROM = 54.5
export const FLASH_FULL = 54.9
export const LOGO_AT = 55.0

/** Picture time of an action-clock moment before the freeze (the inverse of
 *  `streetTime` there): the street's sounds are placed on the action. */
export const streetAt = (st: number): number => {
  for (let i = 1; i < STREET_CLOCK.length; i++) {
    const [t0, s0] = STREET_CLOCK[i - 1]!
    const [t1, s1] = STREET_CLOCK[i]!
    if (st <= s1) return t0 + (t1 - t0) * Math.max(0, (st - s0) / (s1 - s0))
  }
  return FREEZE_AT
}

// ─── One-shot events ─────────────────────────────────────────────────────────

export type IntroEvent =
  | { at: number; kind: 'sfx'; name: SfxName; gain?: number }
  /** The screen-reader line for a shot (`story.intro.<id>`). */
  | { at: number; kind: 'line'; shot: ShotId }
  /** An Atlas line (`story.atlas.<key>`), shown as a caption. */
  | { at: number; kind: 'atlas'; key: 'logStart' | 'goodMorning' | 'scrapyardFirst' }
  /** Dr. Vex's speech bubble on (`story.vex.<key>`) or off (''). */
  | { at: number; kind: 'vex'; key: 'diagnosis' | '' }
  /** The Scrapyard's theme takes over once the flash chord has rung, and
   *  carries into the tutorial. */
  | { at: number; kind: 'music'; track: 'scrapyard' }

export const EVENTS: readonly IntroEvent[] = [
  // 0 · Cold open (the street's hits on its action clock)
  { at: 0, kind: 'line', shot: 'coldOpen' },
  { at: 0.05, kind: 'sfx', name: 'synthPulse' },
  { at: streetAt(0.3), kind: 'sfx', name: 'droneArrive', gain: 0.7 },
  // The rain hiss (a 2.8 s burst), laid end to end under the run and slide.
  { at: 2.75, kind: 'sfx', name: 'synthPulse', gain: 0.9 },
  { at: streetAt(1.15), kind: 'sfx', name: 'slide' },
  { at: streetAt(1.55), kind: 'sfx', name: 'flameJet', gain: 0.8 },
  { at: 5.5, kind: 'sfx', name: 'synthPulse', gain: 0.8 },
  { at: streetAt(1.95), kind: 'sfx', name: 'charge1' },
  { at: streetAt(2.35), kind: 'sfx', name: 'charge2' },
  { at: streetAt(2.65), kind: 'sfx', name: 'chargeShotBig', gain: 0.8 },
  { at: REWIND_FROM - 0.1, kind: 'sfx', name: 'tapeRewind' },
  { at: REWIND_FROM, kind: 'atlas', key: 'logStart' },
  { at: REWIND_FROM + 0.75, kind: 'sfx', name: 'tapeRewind', gain: 0.6 },
  // 1 · The valley and the Red Signal
  { at: VALLEY_FROM, kind: 'line', shot: 'valley' },
  { at: 11.8, kind: 'sfx', name: 'relayChime' },
  { at: 12.7, kind: 'sfx', name: 'relayChime', gain: 0.8 },
  { at: 13.6, kind: 'sfx', name: 'relayChime', gain: 0.7 },
  { at: SPIRE_FLASH, kind: 'sfx', name: 'vexGlitch' },
  { at: VEX_ON + 0.1, kind: 'vex', key: 'diagnosis' },
  { at: RING_FROM + 0.5, kind: 'sfx', name: 'relayOut' },
  { at: RING_FROM + 1.2, kind: 'sfx', name: 'relayOut', gain: 0.9 },
  { at: RING_FROM + 1.9, kind: 'sfx', name: 'relayOut', gain: 0.8 },
  { at: RING_FROM + 2.6, kind: 'sfx', name: 'relayOut', gain: 0.7 },
  { at: CUTIN_FROM, kind: 'vex', key: '' },
  { at: CUTIN_FROM, kind: 'sfx', name: 'vexGlitch', gain: 0.7 },
  // 2 · The lab
  { at: LAB_FROM, kind: 'line', shot: 'lab' },
  { at: LAB_FROM + 0.05, kind: 'sfx', name: 'alarm' },
  { at: 22.9, kind: 'sfx', name: 'alarm', gain: 0.8 },
  { at: DISC_TO - 0.5, kind: 'sfx', name: 'energy', gain: 0.7 },
  { at: 26.6, kind: 'sfx', name: 'alarm', gain: 0.7 },
  { at: LEVER_AT, kind: 'sfx', name: 'capsule' },
  // 3 · Safe mode
  { at: SAFE_FROM, kind: 'line', shot: 'safeMode' },
  { at: SEAL_AT, kind: 'sfx', name: 'door', gain: 0.8 },
  { at: FROST_FROM, kind: 'sfx', name: 'freeze' },
  { at: HEART_FROM, kind: 'sfx', name: 'heartbeat' },
  // 4 · Wake-up, first person
  { at: WAKE_FROM, kind: 'line', shot: 'wakeUp' },
  { at: 38.3, kind: 'sfx', name: 'heartbeat', gain: 0.6 },
  { at: PIP_POP, kind: 'sfx', name: 'pipChirp' },
  { at: HUD_BOOT, kind: 'sfx', name: 'bootUp' },
  { at: GLYPH_ON, kind: 'atlas', key: 'goodMorning' },
  { at: 43.4, kind: 'sfx', name: 'heartbeat', gain: 0.5 },
  { at: HOLO_FROM, kind: 'sfx', name: 'uiOpen' },
  { at: SCRAP_BLINK, kind: 'atlas', key: 'scrapyardFirst' },
  { at: SCRAP_BLINK, kind: 'sfx', name: 'locate' },
  // 5 · The beam
  { at: BEAM_FROM, kind: 'line', shot: 'beam' },
  { at: STEP_TO - 0.05, kind: 'sfx', name: 'deckLand', gain: 0.7 },
  { at: BEAM_RISE, kind: 'sfx', name: 'beamOut' },
  { at: INTRO_END - 0.05, kind: 'music', track: 'scrapyard' }
]

/** The events with `t0 < at ≤ t1` (the very first step includes `at = 0`). */
export const eventsBetween = (t0: number, t1: number): IntroEvent[] =>
  EVENTS.filter(e => (e.at > t0 || (t0 <= 0 && e.at === 0)) && e.at <= t1)

// ─── Easing ──────────────────────────────────────────────────────────────────

export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x)
/** 0 → 1 across [a, b], smoothstepped. */
export const ramp = (a: number, b: number, x: number): number => {
  const k = clamp01((x - a) / (b - a))
  return k * k * (3 - 2 * k)
}
/** Piecewise-linear through `[t, v]` keys (held flat outside them). */
export const keys = (k: ReadonlyArray<readonly [number, number]>, t: number): number => {
  if (t <= k[0]![0]) return k[0]![1]
  for (let i = 1; i < k.length; i++) {
    const [t1, v1] = k[i]!
    if (t <= t1) {
      const [t0, v0] = k[i - 1]!
      return v0 + (v1 - v0) * ((t - t0) / (t1 - t0))
    }
  }
  return k[k.length - 1]![1]
}

// ─── Action clocks ───────────────────────────────────────────────────────────

/**
 * The cold open's action clock: it runs through the speed ramp, freezes on
 * the release, then the tape runs it backwards to the start — the rewind is
 * Atlas replaying its log.
 */
export const streetTime = (t: number): number => {
  if (t < FREEZE_AT) return keys(STREET_CLOCK, t)
  if (t < REWIND_FROM) return STREET_RELEASE
  return Math.max(STREET_FROM, STREET_RELEASE - (t - REWIND_FROM) * REWIND_RATE)
}

/** How fast the action clock runs at `t` (× real time; the slow motion is
 *  under 1, the freeze 0): the street's particles slow down with it. */
export const streetRate = (t: number): number => {
  if (t >= FREEZE_AT) return 0
  for (let i = 1; i < STREET_CLOCK.length; i++) {
    const [t1, s1] = STREET_CLOCK[i]!
    if (t < t1) {
      const [t0, s0] = STREET_CLOCK[i - 1]!
      return (s1 - s0) / (t1 - t0)
    }
  }
  return 0
}

/** How far the red shock-ring has rolled over the valley, 0..1. */
export const ringReach = (t: number): number => clamp01((t - RING_FROM) / (RING_TO - RING_FROM))

// ─── Overlays ────────────────────────────────────────────────────────────────

export interface IntroOverlay {
  /** Black over the frame (fade in from the loader, the wake-up's dark), 0..1. */
  black: number
  /** The tape-rewind tear: scan-lines, the cyan cast, Atlas's corner glyph. */
  rewind: number
  /** The eyelid bars, 0 open … 1 shut. */
  eyelid: number
  /** Focus blur (px at 1080p), sharpening after the blinks. */
  blur: number
  /** The first-person HUD booting: on at all, the health bar's fill, `Lv 1`. */
  hud: number
  hp: number
  lv: number
  /** Atlas's glyph spinning up in its HUD slot, 0..1. */
  glyph: number
  /** The hologram's level tags: the Fortress's, then the Scrapyard's. */
  tagFortress: number
  tagScrap: number
  /** Blaze Master's cut-in frame, 0..1. */
  cutin: number
  /** The white flash, and the logo stamped onto it. */
  flash: number
  logo: number
}

export const newOverlay = (): IntroOverlay => ({
  black: 1, rewind: 0, eyelid: 0, blur: 0, hud: 0, hp: 0, lv: 0, glyph: 0, tagFortress: 0, tagScrap: 0, cutin: 0, flash: 0, logo: 0
})

/** Out of the dark: shut a moment, two slow blinks, then eyes open. */
const EYELID: ReadonlyArray<readonly [number, number]> = [
  [WAKE_FROM, 1], [37.0, 1], [37.45, 0.35], [37.8, 1], [38.2, 1], [39.0, 0]
]
/** The fade to black that ends safe mode (the wake-up opens in it, lids shut). */
const DARK_FROM = 35.4

/** Every overlay at `t` (written into `o`, which is returned). */
export const overlayAt = (t: number, o: IntroOverlay = newOverlay()): IntroOverlay => {
  // In from black off the loader; the cut to the wake-up is to black too.
  o.black = Math.max(1 - ramp(0, 0.8, t), t >= DARK_FROM && t < 37.0 ? ramp(DARK_FROM, WAKE_FROM, t) : 0)
  // The tear comes up on the rewind and fades once the valley is on.
  o.rewind = t < REWIND_FROM - 0.15 ? 0 : t < VALLEY_FROM ? ramp(REWIND_FROM - 0.15, REWIND_FROM + 0.1, t) : 1 - ramp(VALLEY_FROM, VALLEY_FROM + 0.4, t)
  o.eyelid = t < WAKE_FROM || t > 39.2 ? 0 : keys(EYELID, t)
  o.blur = t < WAKE_FROM || t > 40.5 ? 0 : 10 * (1 - ramp(37.45, 40.2, t))
  const fp = t >= WAKE_FROM && t < FLASH_FULL
  o.hud = fp ? ramp(HUD_BOOT, HUD_BOOT + 0.35, t) : 0
  o.hp = fp ? clamp01((t - HP_FILL_FROM) / (HP_FILL_TO - HP_FILL_FROM)) : 0
  o.lv = fp ? ramp(LV_POP, LV_POP + 0.2, t) : 0
  o.glyph = fp ? ramp(GLYPH_ON - 0.3, GLYPH_ON + 0.45, t) : 0
  // The tags fold away with the hologram as the view turns to the pad.
  const holo = 1 - ramp(HOLO_FOLD_FROM, HOLO_FOLD_TO, t)
  o.tagFortress = ramp(HOLO_FROM + 0.6, HOLO_FROM + 1.0, t) * holo
  o.tagScrap = ramp(SCRAP_BLINK, SCRAP_BLINK + 0.3, t) * holo
  o.cutin = t >= CUTIN_FROM && t < CUTIN_TO ? 1 : 0
  o.flash = ramp(FLASH_FROM, FLASH_FULL, t)
  o.logo = ramp(LOGO_AT, LOGO_AT + 0.3, t)
  return o
}
