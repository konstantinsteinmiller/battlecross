/**
 * ─── Pacing a line without a recording ───────────────────────────────────────
 *
 * A bubble with no audio file is paced by its text: the typewriter reveals it
 * at reading speed, and the line then "lasts" about as long as saying it
 * would. Scripts without spaces (Chinese, Japanese) carry more per character,
 * so they are revealed slower and held longer per character.
 */

/** Characters per second of the typewriter. */
export const TYPE_CPS = 46
export const TYPE_CPS_DENSE = 22
/** Seconds a spoken character takes (the bubble's "audio" length). */
const SPEAK_PER_CHAR = 0.058
const SPEAK_PER_CHAR_DENSE = 0.16
const SPEAK_MIN = 1.1
const SPEAK_MAX = 9

const DENSE = /[぀-ヿ㐀-鿿가-힯]/

/** A text in a script that packs a word into a character or two. */
export const isDense = (text: string): boolean => DENSE.test(text)

/** User-perceived characters, so a reveal never splits an emoji, a Hangul
 *  syllable or a base letter from its accent. */
export const graphemes = (text: string): string[] => {
  const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => { segment(s: string): Iterable<{ segment: string }> } }).Segmenter
  if (Seg) return [...new Seg(undefined, { granularity: 'grapheme' }).segment(text)].map(s => s.segment)
  return Array.from(text)
}

/** Seconds the typewriter takes for the whole line. */
export const typeSeconds = (text: string): number => graphemes(text).length / (isDense(text) ? TYPE_CPS_DENSE : TYPE_CPS)

/** Seconds the line is "spoken" for when there is no recording. */
export const speakSeconds = (text: string): number => {
  const n = graphemes(text).length
  return Math.max(SPEAK_MIN, Math.min(SPEAK_MAX, n * (isDense(text) ? SPEAK_PER_CHAR_DENSE : SPEAK_PER_CHAR) + 0.5))
}

/** How many characters are revealed after `t` seconds. */
export const revealed = (text: string, t: number): number =>
  Math.max(0, Math.floor(t * (isDense(text) ? TYPE_CPS_DENSE : TYPE_CPS)))

/** A stable number from a speaker's name (the pitch of their voice blip). */
export const voiceSeed = (speaker: string): number => {
  let h = 2166136261
  for (let i = 0; i < speaker.length; i++) h = Math.imul(h ^ speaker.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967295
}
