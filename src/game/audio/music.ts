import { audio, audioAllowed } from './engine'
import { getSong, makeOut, playStep, playJingleNotes, stepSeconds, type Out, type Song, type SongId, type TrackId } from './songs'
import { MUSIC_FILES } from '../assets/overrides'
import { registerHtmlAudio, unregisterHtmlAudio } from '@/use/useAssets'

export type { TrackId, SongId }

/**
 * ─── Music ───────────────────────────────────────────────────────────────────
 *
 * A lookahead step sequencer on the shared AudioContext, playing the score in
 * `songs.ts`. Because it runs on the shared context, the ad / pause / mute
 * gates silence it automatically.
 *
 * THE ROTATION. The game asks for music by TRACK (`playMusic('town' |
 * 'meadow' | … | 'boss')`, see `themes.ts` for which zone plays which). A zone
 * visit lasts two to five minutes and its theme about seventy seconds, so the
 * sequencer does not loop the theme for the whole visit. It alternates:
 *
 *     the zone's theme  →  "The Long Road" (the travelling piece)  →  theme  → …
 *
 * handing over at the end of a pass once the current song has played
 * `ROTATE_AFTER_S` (every piece is longer than that, so each plays once). The
 * travelling piece is written for the same instruments as the themes; it is
 * the walk between two hearings of the tune, not a change of style. The
 * rotation position is kept across areas: the travelling piece carries on
 * through a town → zone change, and only slot 0 follows the area.
 *
 * A boss fight interrupts the rotation with its own song (`'boss'`), crossfaded
 * in, and loops it — skipping its intro on repeats — for as long as the fight
 * lasts; the zone's theme fades back in afterwards.
 */

/** Song 2 of the rotation; song 1 is the area's own theme. */
const ROTATION: readonly SongId[] = ['journey']
export const ROTATION_SIZE = ROTATION.length + 1
/** A song keeps playing whole passes until it has run at least this long. */
export const ROTATE_AFTER_S = 45
/** The first music of the session fades in gently rather than arriving at full level. */
export const FIRST_FADE_S = 4
/** Songs that loop and never rotate: the boss fight. */
const OWN_SONG = (id: TrackId | SongId | null): boolean => id === 'boss'

/** Song-to-song handover: the outgoing song's tail fades under the incoming one. */
const HANDOVER_FADE_S = 2.5
/**
 * Crossfades when the game changes track, as [out, in] seconds. The boss
 * arrives fast (its first bar is a drum blow) and leaves slowly; one area's
 * theme gives way to the next in under a second.
 */
export const CROSSFADE = {
  toBoss: [0.9, 0.25],
  fromBoss: [2.2, 1.6],
  area: [0.6, 0.35]
} as const

/** The song an area plays at a rotation slot. */
export const songFor = (area: TrackId, slot: number): SongId =>
  OWN_SONG(area) ? area : slot % ROTATION_SIZE === 0 ? area : ROTATION[(slot % ROTATION_SIZE) - 1]!

/** Whether a finished pass of a song should hand over to the next one. */
export const shouldRotate = (area: TrackId | null, playing: SongId | null, played: number): boolean =>
  !OWN_SONG(area) && !OWN_SONG(playing) && played >= ROTATE_AFTER_S

/**
 * Whether a request for `area` can leave the current song alone. The same song
 * obviously can; so can the travelling piece (slot 1) when the player moves
 * between non-boss areas — only the area theme is tied to the area.
 */
export const keepsPlaying = (area: TrackId, playing: SongId | null, slot: number): boolean => {
  if (!playing) return false
  if (playing === songFor(area, slot)) return true
  return !OWN_SONG(area) && !OWN_SONG(playing) && slot % ROTATION_SIZE !== 0
}

// ─── Sequencer state ────────────────────────────────────────────────────────

let area: TrackId | null = null
let slot = 0
let playing: SongId | null = null
let song: Song | null = null
let out: Out | null = null
let timer: number | null = null
let nextTime = 0
let stepIdx = 0
/** Seconds the current song has played (drives the rotation). */
let played = 0
/** Where a paused song picks up: the start of the bar it was stopped in. */
let resume: { id: SongId; step: number; played: number } | null = null
let everStarted = false
/** A result jingle still ringing (the next music fades it out). */
let jingle: Out | null = null

const retire = (o: Out, at: number, fade: number): void => {
  const g = o.master.gain
  const now = o.ctx.currentTime
  g.cancelScheduledValues(now)
  g.setValueAtTime(Math.max(0.0001, g.value), now)
  if (at > now) g.setValueAtTime(Math.max(0.0001, g.value), at)
  g.setTargetAtTime(0.0001, Math.max(at, now), fade / 4)
  setTimeout(() => o.dispose(), (Math.max(0, at - now) + fade + 0.5) * 1000)
}

const startSong = (id: SongId, at: number | null, fadeIn: number, allowResume: boolean): void => {
  const a = audio()
  if (!a) return
  const s = getSong(id)
  const o = makeOut(a.ctx, a.music, s)
  const t0 = at ?? a.ctx.currentTime + 0.08
  o.master.gain.setValueAtTime(0.0001, a.ctx.currentTime)
  o.master.gain.setValueAtTime(0.0001, t0)
  o.master.gain.exponentialRampToValueAtTime(s.gain, t0 + Math.max(0.03, fadeIn))
  // A song the gates stopped (an ad, a pause, a mute) picks up at its bar.
  if (allowResume && resume && resume.id === id) {
    stepIdx = Math.min(resume.step, s.steps.length - 1)
    played = resume.played
  } else {
    stepIdx = 0
    played = 0
  }
  resume = null
  song = s
  out = o
  playing = id
  nextTime = t0
  if (timer === null) timer = window.setInterval(tick, 30)
  tick()
}

/** The end of a pass: hand over to the next song in the rotation, or repeat. */
const endOfPass = (): void => {
  if (!song || !out) return
  if (shouldRotate(area, playing, played)) {
    slot = (slot + 1) % ROTATION_SIZE
    const next = songFor(area ?? 'town', slot)
    if (MUSIC_FILES.has(next)) {
      stopMusic(0.8)
      begin(next)
      return
    }
    retire(out, nextTime, HANDOVER_FADE_S)
    startSong(next, nextTime, 0.03, false)
    return
  }
  stepIdx = song.loopBar * song.barSteps
}

const tick = (): void => {
  const a = audio()
  if (!a || !song || !out) return
  const horizon = a.ctx.currentTime + 0.15
  if (nextTime < a.ctx.currentTime - 0.5) nextTime = a.ctx.currentTime + 0.05 // resumed after a long suspend
  while (nextTime < horizon && song && out) {
    if (stepIdx >= song.steps.length) {
      endOfPass()
      if (timer === null || !song) return
      continue
    }
    const spb = stepSeconds(song)
    playStep(out, song, stepIdx, nextTime, spb)
    nextTime += spb
    played += spb
    stepIdx++
  }
}

// A track asked for before the first gesture waits here. Activation lands on
// pointerup for touch (pointerdown only counts for a mouse), so listen to both.
let pending: TrackId | null = null
let gestureArmed = false
const GESTURES = ['pointerdown', 'pointerup', 'keydown'] as const

const onGesture = (): void => {
  if (!audioAllowed()) return
  for (const g of GESTURES) window.removeEventListener(g, onGesture, true)
  gestureArmed = false
  const id = pending
  pending = null
  if (id) playMusic(id)
}

const startOnGesture = (id: TrackId): void => {
  pending = id
  if (gestureArmed) return
  gestureArmed = true
  for (const g of GESTURES) window.addEventListener(g, onGesture, true)
}

// ─── Drop-in music files ─────────────────────────────────────────────────────
// public/audio/music/<song id>.ogg replaces that composed song, and
// victory / defeat.ogg the jingles (see `game/assets/overrides.ts`). A file
// STREAMS through a media element, routed into the same music bus as the
// synth, so the volume, the platform mute and the ad / pause gates apply to
// it unchanged; it is also registered with the suspend registry, which pauses
// the element itself under an ad. In the rotation a file plays whole passes
// like a composed song does, then hands over.

/** Drop-ins are mastered far hotter than the synth voices. */
const FILE_GAIN = 0.35
let fileEl: HTMLAudioElement | null = null
let fileGain: GainNode | null = null

const startFile = (url: string, loop: boolean, fadeIn = 0.35): { el: HTMLAudioElement; gain: GainNode } | null => {
  const a = audio()
  if (!a) return null
  const el = new Audio(url)
  el.loop = loop
  el.preload = 'auto'
  const g = a.ctx.createGain()
  g.gain.setValueAtTime(0.0001, a.ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(FILE_GAIN, a.ctx.currentTime + fadeIn)
  a.ctx.createMediaElementSource(el).connect(g).connect(a.music)
  registerHtmlAudio(el)
  el.play().catch(() => { /* blocked or failed — the gates retry the start */ })
  return { el, gain: g }
}

const stopFile = (el: HTMLAudioElement, g: GainNode, fade: number): void => {
  const a = audio()
  if (a) {
    g.gain.cancelScheduledValues(a.ctx.currentTime)
    g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), a.ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, a.ctx.currentTime + fade)
  }
  setTimeout(() => {
    el.pause()
    unregisterHtmlAudio(el)
    g.disconnect()
  }, (fade + 0.05) * 1000)
}

const startFileSong = (id: SongId, url: string, fadeIn: number): boolean => {
  const rotating = !OWN_SONG(id)
  const f = startFile(url, !rotating, fadeIn)
  if (!f) return false
  playing = id
  fileEl = f.el
  fileGain = f.gain
  if (rotating) {
    let filePlayed = 0
    f.el.addEventListener('ended', () => {
      if (fileEl !== f.el) return
      filePlayed += Number.isFinite(f.el.duration) ? f.el.duration : 0
      if (shouldRotate(area, playing, filePlayed)) {
        slot = (slot + 1) % ROTATION_SIZE
        stopMusic(0.05)
        begin(songFor(area ?? 'town', slot))
      } else {
        f.el.currentTime = 0
        f.el.play().catch(() => { /* the gates retry */ })
      }
    })
  }
  return true
}

/** Start a song from a file if one was dropped in, else from the score. */
const begin = (id: SongId, fade: number = 0.35): void => {
  const fadeIn = everStarted ? fade : FIRST_FADE_S
  everStarted = true
  const url = MUSIC_FILES.get(id)
  if (url && startFileSong(id, url, fadeIn)) return
  startSong(id, null, fadeIn, true)
}

/**
 * Ask for a track's music. Leaves a song alone that may keep playing (see
 * `keepsPlaying`), so it is safe to call again and again with the same track.
 * A change of track is a crossfade (`CROSSFADE`): the old song's notes ring
 * out under the new one's first bar.
 */
export const playMusic = (id: TrackId): void => {
  const a = audio()
  if (!a) {
    startOnGesture(id)
    return
  }
  area = id
  if (isMusicRunning() && keepsPlaying(id, playing, slot)) return
  const switching = isMusicRunning()
  const [fadeOut, fadeIn] = OWN_SONG(id) ? CROSSFADE.toBoss : OWN_SONG(playing) ? CROSSFADE.fromBoss : CROSSFADE.area
  // A boss fight ends on the zone's own theme, not in the middle of the rotation.
  if (OWN_SONG(id)) slot = 0
  if (jingle) {
    retire(jingle, a.ctx.currentTime, 0.4)
    jingle = null
  }
  stopMusic(switching ? fadeOut : 0.15)
  // A song the game replaced does not resume; only one the gates stopped does.
  if (switching) resume = null
  begin(songFor(id, slot), switching ? fadeIn : 0.35)
}

/** Stop with a short fade. The song picks up at the same bar if it is asked for again. */
export const stopMusic = (fade = 0.25): void => {
  pending = null
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
  const a = audio()
  if (out && a) retire(out, a.ctx.currentTime, fade)
  if (song && playing) resume = { id: playing, step: Math.floor(stepIdx / song.barSteps) * song.barSteps, played }
  out = null
  song = null
  if (fileEl && fileGain) stopFile(fileEl, fileGain, fade)
  fileEl = null
  fileGain = null
  playing = null
}

export const isMusicRunning = (): boolean => timer !== null || fileEl !== null
/** The song playing now (an area theme, `journey` or `boss`). */
export const currentMusic = (): SongId | null => playing

/** The result jingles (not looped). */
export const playJingle = (kind: 'victory' | 'defeat'): void => {
  const a = audio()
  if (!a) return
  stopMusic(0.1)
  // The fight is over: whatever plays next starts from its top.
  resume = null
  const url = MUSIC_FILES.get(kind)
  if (url) {
    const f = startFile(url, false)
    if (f) f.el.addEventListener('ended', () => stopFile(f.el, f.gain, 0.05), { once: true })
    return
  }
  const j = playJingleNotes(a.ctx, a.music, kind)
  jingle = j.out
  setTimeout(() => {
    j.out.dispose()
    if (jingle === j.out) jingle = null
  }, (j.seconds + 0.5) * 1000)
}
