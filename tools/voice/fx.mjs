// The character chains, as ffmpeg filter graphs. Pure: a speaker and a line
// in, a graph and the levelling targets out; tools/voice/post.mjs runs them.
//
// Battlecross is voiced for 10–15 year olds with clean, natural human voices:
// every person gets the same gentle clean-up (rumble cut, a little presence,
// the harsh top tamed). Only the creatures get a character effect, and a light
// one: the goblins a little higher and nasal, the dragon lower with a soft sub
// octave and a cave, the arch-demon lower with a faint octave under him and a
// stone hall. A crushed or heavy layer reads as "crisping" to a listener:
// keep every effect subtle.

const eq = (f, g, w = 1) => `equalizer=f=${f}:t=q:w=${w}:g=${g}`
const band = (hp, lp) => `highpass=f=${hp}:poles=2,lowpass=f=${lp}:poles=2`
/** Semitones → rubberband's pitch ratio (formants move with it). */
const semis = (st) => (2 ** (st / 12)).toFixed(5)

/** The clean-up every human voice gets: presence, a softer 2–3 kHz edge for small speakers, de-mud. */
const CLEAN = `${band(80, 12000)},${eq(250, -1.5)},${eq(3200, 1.5)}`

const PEOPLE = { thr: -22, ratio: 2.5, atk: 6, rel: 140, lufs: -16, peak: -3 }
/**
 * Dynamics per speaker (`{thr}` dB, ratio, attack/release ms) and the level a
 * finished line is brought to: `lufs` for lines over 1 s, `peak` dBFS for
 * shorter ones (LUFS needs 400 ms blocks). Everyone sits at −16 LUFS so a
 * conversation never jumps in level; the soft speakers a touch under.
 */
export const DYNAMICS = {
  default: PEOPLE,
  trainerShadow: { ...PEOPLE, lufs: -17 },
  oracle: { ...PEOPLE, lufs: -17 },
  dragon: { thr: -24, ratio: 3, atk: 10, rel: 250, lufs: -15, peak: -3 },
  archDemon: { thr: -24, ratio: 3, atk: 10, rel: 250, lufs: -15.5, peak: -3 }
}

/** A speaker's dynamics (per-line exceptions would go here). */
export const dynamicsFor = (speaker) => ({ ...(DYNAMICS[speaker] ?? DYNAMICS.default) })

/** Seconds of tail kept after the last sound: a creature's room rings out. */
export const tailFor = (speaker) => (speaker === 'dragon' || speaker === 'archDemon' ? 0.3 : 0.05)

/** The speakers with a character effect (everyone else is a clean human voice). */
export const FX_SPEAKERS = ['goblinKing', 'goblinTrader', 'dragon', 'archDemon']

/**
 * The chain as a `-filter_complex` graph from `[0:a]` to `[fx]`, mono, 48 kHz.
 * `dry: true` gives the plain graph (format only), for A/B listening.
 */
export const chainFor = (speaker, key, { dry = false } = {}) => {
  const prep = 'aformat=channel_layouts=mono,aresample=48000,highpass=f=60:poles=2'
  if (dry) return `[0:a]${prep}[fx]`
  switch (speaker) {
    case 'goblinKing':
    case 'goblinTrader':
      // A goblin: 1.5 semitones up (a smaller body), a nasal bump at 1.1 kHz, the lows thinned.
      return `[0:a]${prep},rubberband=pitch=${semis(1.5)},${band(140, 11000)},${eq(1100, 3, 1.4)},${eq(300, -2)}[fx]`
    case 'dragon': {
      // Two semitones down, a soft sub octave at −16 dB under it, warm lows, a short cave.
      const main = `[m]rubberband=pitch=${semis(-2)}[m1]`
      const sub = `[s]rubberband=pitch=0.5,lowpass=f=1800:poles=2,highpass=f=50:poles=2,volume=0.158[sb]`
      return `[0:a]${prep},asplit=2[m][s];${main};${sub};[m1][sb]amix=inputs=2:normalize=0,${band(50, 10000)},${eq(140, 2)},${eq(2800, 1)},aecho=1:0.9:60|97|140:0.14|0.1|0.07[fx]`
    }
    case 'archDemon': {
      // A semitone and a half down, a faint octave below at −20 dB, a stone hall.
      const main = `[m]rubberband=pitch=${semis(-1.5)}[m1]`
      const sub = `[s]rubberband=pitch=0.5,lowpass=f=2200:poles=2,highpass=f=55:poles=2,volume=0.1[sb]`
      return `[0:a]${prep},asplit=2[m][s];${main};${sub};[m1][sb]amix=inputs=2:normalize=0,${band(60, 11000)},${eq(200, 1.5)},${eq(3000, 1.5)},aecho=1:0.9:45|73|110:0.12|0.08|0.05[fx]`
    }
    default:
      return `[0:a]${prep},${CLEAN}[fx]`
  }
}
