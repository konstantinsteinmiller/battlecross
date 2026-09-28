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
 *   0  0.0–3.5  cold open: Flux on the neon streets, freeze, tape rewind
 *   1  3.5–6.5  the valley, then the Red Signal (Vex's bubble, Blaze's cut-in)
 *   2  6.5–9.5  the lab: the Atlas disc, the lever
 *   3  9.5–11   safe mode: Gauss freezes herself
 *   4  11–15    wake-up, first person: blinks, Pip, the HUD boots, Atlas
 *   5  15–17    the beam, the flash, the logo
 */

export type ShotId = 'coldOpen' | 'valley' | 'lab' | 'safeMode' | 'wakeUp' | 'beam'

export interface Shot {
  id: ShotId
  start: number
  end: number
}

export const SHOTS: readonly Shot[] = [
  { id: 'coldOpen', start: 0, end: 3.5 },
  { id: 'valley', start: 3.5, end: 6.5 },
  { id: 'lab', start: 6.5, end: 9.5 },
  { id: 'safeMode', start: 9.5, end: 11 },
  { id: 'wakeUp', start: 11, end: 15 },
  { id: 'beam', start: 15, end: 17 }
]

/** The whole cutscene (s). The rules cap it at 18. */
export const INTRO_END = 17
/** The skip glyph appears, and a skip counts, from here (s). */
export const SKIP_AFTER = 0.5

/** Index into `SHOTS` of the shot on at `t`. */
export const shotIndexAt = (t: number): number => {
  for (let i = SHOTS.length - 1; i > 0; i--) if (t >= SHOTS[i]!.start) return i
  return 0
}

export const shotAt = (t: number): Shot => SHOTS[shotIndexAt(t)]!

/** Seconds into the shot on at `t`. */
export const shotTime = (t: number): number => t - shotAt(t).start

// ─── Beats inside the shots (s, absolute) ────────────────────────────────────

/** Cold open: the freeze frame on the release, then the tape runs backwards. */
export const FREEZE_AT = 2.7
export const REWIND_FROM = 2.95
/** How fast the rewind runs the action back (× real time). */
export const REWIND_RATE = 5.5
/** The valley: the Spire's tip flashes red, and Vex's face glitches on. */
export const SPIRE_FLASH = 4.55
export const VEX_ON = 4.75
/** The red shock-ring rolls out over the valley (0 → 1 of the valley's reach). */
export const RING_FROM = 4.95
export const RING_TO = 6.45
/** Blaze Master's cut-in: gold eyes flicker, then lock red. */
export const CUTIN_FROM = 5.75
export const CUTIN_TO = 6.35
/** The lab: the Atlas disc's close-up, then the lever. */
export const DISC_FROM = 7.55
export const DISC_TO = 7.95
export const LEVER_AT = 8.55
/** Safe mode: the glass seals, the frost races up. */
export const SEAL_AT = 9.9
export const FROST_FROM = 10.0
export const FROST_TO = 10.55
/** Wake-up: Pip pops in, the HUD boots, the hologram opens. */
export const PIP_POP = 12.15
export const HUD_BOOT = 12.5
export const HP_FILL_FROM = 12.6
export const HP_FILL_TO = 13.25
export const LV_POP = 13.3
export const GLYPH_ON = 13.0
export const HOLO_FROM = 13.4
export const SCRAP_BLINK = 14.0
/** The beam: the view turns to the pad and steps onto it; the column rises. */
export const TURN_FROM = 15.0
export const STEP_FROM = 15.45
export const STEP_TO = 15.9
export const BEAM_RISE = 15.85
export const FLASH_FROM = 16.3
export const FLASH_FULL = 16.45
export const LOGO_AT = 16.5

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
  // 0 · Cold open
  { at: 0, kind: 'line', shot: 'coldOpen' },
  { at: 0.05, kind: 'sfx', name: 'synthPulse' },
  { at: 0.35, kind: 'sfx', name: 'droneArrive', gain: 0.7 },
  { at: 1.15, kind: 'sfx', name: 'slide' },
  { at: 1.55, kind: 'sfx', name: 'flameJet', gain: 0.8 },
  { at: 1.95, kind: 'sfx', name: 'charge1' },
  { at: 2.35, kind: 'sfx', name: 'charge2' },
  { at: 2.65, kind: 'sfx', name: 'chargeShotBig', gain: 0.8 },
  { at: REWIND_FROM - 0.1, kind: 'sfx', name: 'tapeRewind' },
  { at: REWIND_FROM, kind: 'atlas', key: 'logStart' },
  // 1 · The valley and the Red Signal
  { at: 3.5, kind: 'line', shot: 'valley' },
  { at: 3.65, kind: 'sfx', name: 'relayChime' },
  { at: 3.95, kind: 'sfx', name: 'relayChime', gain: 0.8 },
  { at: 4.25, kind: 'sfx', name: 'relayChime', gain: 0.7 },
  { at: SPIRE_FLASH, kind: 'sfx', name: 'vexGlitch' },
  { at: VEX_ON + 0.1, kind: 'vex', key: 'diagnosis' },
  { at: RING_FROM + 0.25, kind: 'sfx', name: 'relayOut' },
  { at: RING_FROM + 0.55, kind: 'sfx', name: 'relayOut', gain: 0.9 },
  { at: RING_FROM + 0.85, kind: 'sfx', name: 'relayOut', gain: 0.8 },
  { at: CUTIN_FROM, kind: 'sfx', name: 'vexGlitch', gain: 0.7 },
  { at: 6.4, kind: 'vex', key: '' },
  // 2 · The lab
  { at: 6.5, kind: 'line', shot: 'lab' },
  { at: 6.55, kind: 'sfx', name: 'alarm' },
  { at: 7.45, kind: 'sfx', name: 'alarm', gain: 0.8 },
  { at: DISC_FROM + 0.2, kind: 'sfx', name: 'energy', gain: 0.7 },
  { at: LEVER_AT, kind: 'sfx', name: 'capsule' },
  // 3 · Safe mode
  { at: 9.5, kind: 'line', shot: 'safeMode' },
  { at: SEAL_AT, kind: 'sfx', name: 'door', gain: 0.8 },
  { at: FROST_FROM, kind: 'sfx', name: 'freeze' },
  { at: 10.6, kind: 'sfx', name: 'heartbeat' },
  // 4 · Wake-up, first person
  { at: 11, kind: 'line', shot: 'wakeUp' },
  { at: 11.9, kind: 'sfx', name: 'heartbeat', gain: 0.6 },
  { at: PIP_POP, kind: 'sfx', name: 'pipChirp' },
  { at: HUD_BOOT, kind: 'sfx', name: 'bootUp' },
  { at: GLYPH_ON, kind: 'atlas', key: 'goodMorning' },
  { at: 13.2, kind: 'sfx', name: 'heartbeat', gain: 0.5 },
  { at: HOLO_FROM, kind: 'sfx', name: 'uiOpen' },
  { at: SCRAP_BLINK, kind: 'atlas', key: 'scrapyardFirst' },
  { at: SCRAP_BLINK, kind: 'sfx', name: 'locate' },
  // 5 · The beam
  { at: 15, kind: 'line', shot: 'beam' },
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
 * The cold open's action clock: it runs, freezes on the release, then the
 * tape runs it backwards to the start — the rewind is Atlas replaying its log.
 */
export const streetTime = (t: number): number => {
  if (t < FREEZE_AT) return t
  if (t < REWIND_FROM) return FREEZE_AT
  return Math.max(0, FREEZE_AT - (t - REWIND_FROM) * REWIND_RATE)
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

/** Two blinks out of the dark, then eyes open. */
const EYELID: ReadonlyArray<readonly [number, number]> = [
  [11.0, 1], [11.3, 1], [11.45, 0.4], [11.58, 1], [11.7, 1], [11.95, 0]
]

/** Every overlay at `t` (written into `o`, which is returned). */
export const overlayAt = (t: number, o: IntroOverlay = newOverlay()): IntroOverlay => {
  // In from black off the loader; the cut to the wake-up is to black too.
  o.black = Math.max(1 - ramp(0, 0.3, t), t >= 10.75 && t < 11.3 ? ramp(10.75, 11.0, t) : 0)
  o.rewind = t < REWIND_FROM - 0.15 ? 0 : t < 3.5 ? ramp(REWIND_FROM - 0.15, REWIND_FROM + 0.1, t) : 1 - ramp(3.5, 3.75, t)
  o.eyelid = t < 11 || t > 12 ? 0 : keys(EYELID, t)
  o.blur = t < 11 || t > 12.5 ? 0 : 10 * (1 - ramp(11.45, 12.4, t))
  const fp = t >= 11 && t < FLASH_FULL
  o.hud = fp ? ramp(HUD_BOOT, HUD_BOOT + 0.2, t) : 0
  o.hp = fp ? clamp01((t - HP_FILL_FROM) / (HP_FILL_TO - HP_FILL_FROM)) : 0
  o.lv = fp ? ramp(LV_POP, LV_POP + 0.12, t) : 0
  o.glyph = fp ? ramp(GLYPH_ON - 0.15, GLYPH_ON + 0.25, t) : 0
  // The tags fold away with the hologram as the view turns to the pad.
  const holo = t < TURN_FROM + 0.2 ? 1 : 1 - ramp(TURN_FROM + 0.2, TURN_FROM + 0.45, t)
  o.tagFortress = ramp(HOLO_FROM + 0.25, HOLO_FROM + 0.45, t) * holo
  o.tagScrap = ramp(SCRAP_BLINK, SCRAP_BLINK + 0.15, t) * holo
  o.cutin = t >= CUTIN_FROM && t < CUTIN_TO ? 1 : 0
  o.flash = ramp(FLASH_FROM, FLASH_FULL, t)
  o.logo = ramp(LOGO_AT, LOGO_AT + 0.12, t)
  return o
}
