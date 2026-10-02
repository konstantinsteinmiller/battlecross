// The robot chains from `story-voice-over.md` (the Audacity blocks), as ffmpeg
// filter graphs. Pure: a speaker and a line in, a graph and the levelling
// targets out; tools/voice/post.mjs runs them.
//
// Ported: every band, EQ, doubler and ring-mod; Vex's two pitched layers (the
// crushed sub octave at -12 dB), his consonant buzz and his three places
// (broadcast, the arena PA, the clinic); Flux's +3 semitones and metallic
// edge; Gauss's shimmer and her small room; each speaker's dynamics and
// loudness. Not ported (they need hand-placed labels or made tails): the
// label-driven glitches (stutter, wobble, tear, crush on one word) and Flux's
// synth tails. ffmpeg has no Audacity Reverb: the rooms are short echo
// clusters tuned to the same sizes.

/** Ring modulation mixed in at `mix`: x · (1 − mix + mix · sin(2π f t)). */
const ring = (hz, mix) => `aeval=exprs='val(0)*(${1 - mix}+${mix}*sin(2*PI*${hz}*t))':channel_layout=mono`
const eq = (f, g, w = 1) => `equalizer=f=${f}:t=q:w=${w}:g=${g}`
const band = (hp, lp) => `highpass=f=${hp}:poles=2,lowpass=f=${lp}:poles=2`
/** Semitones → rubberband's pitch ratio (formants move with it, as in Audacity's ChangePitch). */
const semis = (st) => (2 ** (st / 12)).toFixed(5)

/** Vex's place for a line: in the Fortress he is in the room; presenting a Master, on the arena PA; else a hacked screen. */
export const vexPlace = (key) =>
  /^vex\.(mk1|fortress|sting|laugh)\./.test(key) ? 'clinic' : /^vex\.present\./.test(key) ? 'pa' : 'broadcast'

const PLACES = {
  // A hacked screen or a hub transmission: a narrow band, grit, no room.
  broadcast: `${band(250, 4500)},acrusher=bits=8:mode=lin:mix=0.08:aa=1`,
  // The arena PA: one slap at 110 ms and a short hall.
  pa: 'aecho=1:0.9:110|43|67|89:0.15|0.12|0.09|0.07',
  // In person, a small hard room close up.
  clinic: 'aecho=1:0.95:9|17|26:0.1|0.07|0.05'
}

/**
 * Dynamics per speaker (`{thr}` dB, ratio, attack/release ms) and the level a
 * finished line is brought to: `lufs` for lines over 1 s, `peak` dBFS for
 * shorter ones (LUFS needs 400 ms blocks).
 */
export const DYNAMICS = {
  atlas: { thr: -22, ratio: 3, atk: 5, rel: 120, lufs: -16, peak: -4 },
  vex: { thr: -24, ratio: 4, atk: 8, rel: 250, lufs: -15, peak: -3 },
  flux: { thr: -28, ratio: 6, atk: 1, rel: 60, lufs: null, peak: -3 },
  gauss: { thr: -20, ratio: 2, atk: 15, rel: 300, lufs: -17, peak: -3 },
  pip: { thr: -24, ratio: 3.5, atk: 3, rel: 100, lufs: -16, peak: -3 }
}

/** Per-line exceptions from the chains' tables. */
export const dynamicsFor = (speaker, key) => {
  const d = { ...DYNAMICS[speaker] }
  if (/^atlas\.warn\.critical/.test(key)) Object.assign(d, { thr: -26, ratio: 5, atk: 2, rel: 80 })
  if (key === 'atlas.story.firstDraft') d.lufs = -19
  if (key === 'vex.mk1.defeat') d.lufs = -19
  if (key === 'vex.sting.doctorIn') Object.assign(d, { thr: -30, ratio: 3, atk: 5, rel: 150, lufs: -18 })
  return d
}

/** Seconds of tail kept after the last sound: a laugh rings out. */
export const tailFor = (key) => (/\.laugh\./.test(key) ? 0.25 : 0.05)

/**
 * The character chain as a `-filter_complex` graph from `[0:a]` to `[fx]`,
 * mono, 48 kHz. `dry: true` gives the same graph without the robot (band and
 * dynamics only), for A/B listening.
 */
export const chainFor = (speaker, key, { dry = false } = {}) => {
  const prep = 'aformat=channel_layouts=mono,aresample=48000,highpass=f=70:poles=2,highpass=f=70:poles=2'
  if (dry) return `[0:a]${prep}[fx]`
  switch (speaker) {
    case 'atlas': {
      // The helmet band, presence over the square leads, a 14 ms doubler, a 6 % digital sheen.
      const narrow = key === 'story.atlas.logStart'
      const doubler = key === 'ending.atlas' ? 0.12 : 0.2 // the finale: steadier, closer
      return `[0:a]${prep},${narrow ? band(400, 4000) : band(280, 6200)},${eq(700, -2)},${eq(3000, 3)},aecho=1:1:14:${doubler},${ring(1200, 0.06)}${narrow ? ',acrusher=bits=10:mode=lin:mix=0.3:aa=1' : ''}[fx]`
    }
    case 'vex': {
      // Main layer −2 st with a 98 Hz square gated by the voice's energy over 3 kHz (the consonant buzz,
      // kept faint); a sub layer an octave down, dark, at −12 dB; then one voice, toned and placed.
      // The Audacity chain crushed the sub layer (8 kHz / 24 levels): the user heard it as crisping on
      // the Blaze Master line, so the sub layer is clean and the buzz half as loud (2026-10-02).
      const sub = key !== 'vex.sting.doctorIn'
      const place = PLACES[vexPlace(key)]
      const main = `[m]rubberband=pitch=${semis(-2)},asplit=2[m1][m2]`
      const buzz = `[m2]highpass=f=3000:poles=2,aeval=exprs='abs(val(0))':channel_layout=mono,lowpass=f=30,aeval=exprs='0.12*max(0\\,3*val(0)-0.06)*if(lt(mod(t*98\\,1)\\,0.5)\\,1\\,-1)':channel_layout=mono[bz]`
      const subL = `[s]rubberband=pitch=0.5,lowpass=f=2500:poles=2,highpass=f=60:poles=2,volume=0.2512[sb]`
      const mixIn = sub ? '[m1][bz][sb]amix=inputs=3:normalize=0' : '[m1][bz]amix=inputs=2:normalize=0'
      return `[0:a]${prep},asplit=2[m][s];${main};${buzz};${sub ? subL : '[s]anullsink'};${mixIn},${band(110, 8000)},${eq(180, 2)},${eq(800, -2)},${eq(3500, 3)},${place}[fx]`
    }
    case 'flux':
      // A toy robot yelp: +3 semitones (formants rise too), a 20 % ring-mod at 330 Hz, bright and clear of the thumps.
      return `[0:a]${prep},rubberband=pitch=${semis(3)},${ring(330, 0.2)},${band(150, 9000)},${eq(300, -1)},${eq(4000, 3)}[fx]`
    case 'gauss':
      // Warm and full, a 9 ms comb, a trace of ring-mod up high, the lab's soft small room.
      return `[0:a]${prep},${band(90, 10000)},${eq(200, 1)},${eq(9000, 2)},aecho=1:1:9:0.12,${ring(2400, 0.03)},aecho=1:0.95:11|19|29:0.09|0.06|0.04,lowpass=f=9000[fx]`
    case 'pip':
      // A tiny bot with a tiny speaker: +2 semitones, a bell-like 10 % ring at 880 Hz, the highest
      // high-pass in the cast (he reads smaller than Atlas and Flux), a 7 ms comb as the tin body. No room.
      return `[0:a]${prep},rubberband=pitch=${semis(2)},${ring(880, 0.1)},${band(380, 7800)},${eq(500, -2)},${eq(2500, 3)},aecho=1:1:7:0.2[fx]`
    default:
      throw new Error(`no chain for speaker ${speaker}`)
  }
}
