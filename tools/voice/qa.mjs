// Automatic QA for a finished take, so no line needs a listen by hand: the
// words came out (a Whisper read-back against the text the model was given),
// the take fits the line's max, the level is on target, nothing clips.
// `pickBest` chooses between the takes of one line.

const words = (s) => s.toLowerCase()
  .normalize('NFKD').replace(/[̀-ͯ]/g, '') // ä → a: Whisper and the text may differ in accents only
  .replace(/ß/g, 'ss')
  .replace(/[^\p{L}\p{N}\s'-]/gu, ' ').replace(/[-']/g, ' ')
  .split(/\s+/).filter(Boolean)

const distance = (r, h) => {
  let prev = Array.from({ length: h.length + 1 }, (_, j) => j)
  for (let i = 1; i <= r.length; i++) {
    const cur = [i]
    for (let j = 1; j <= h.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (r[i - 1] === h[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[h.length]
}

/** Word error rate of `hyp` against `ref` (edit distance over words / reference words). */
export const wer = (ref, hyp) => {
  const r = words(ref)
  const h = words(hyp)
  if (!r.length) return h.length ? 1 : 0
  return distance(r, h) / r.length
}

/** Letter error rate, spaces ignored: "Blaze Master" heard as "BLAZEMASTER" is right. */
export const cer = (ref, hyp) => {
  const r = [...words(ref).join('')]
  const h = [...words(hyp).join('')]
  if (!r.length) return h.length ? 1 : 0
  return distance(r, h) / r.length
}

/** `overMax`: a take may run this far past the line's max before it fails (the
 *  max is a guide written for actors; the game's bubble waits for the file).
 *  Past the max itself it passes with a warning. */
export const LIMITS = { wer: 0.1, cer: 0.06, lufs: 1.5, peak: -1, overMax: 1.5 }

/**
 * Pass or fail, with the reasons. `take` = post.mjs's numbers plus `heard`
 * (the read-back) and `text` (what the model was given); `max` = the line's.
 * Short lines (≤ 3 words) allow one wrong word: Whisper mishears "Ouch!".
 */
export const judge = (take, max) => {
  const reasons = []
  const e = take.heard == null ? null : wer(take.text, take.heard)
  const n = words(take.text).length
  if (e != null && e > Math.max(LIMITS.wer, n <= 3 ? 1 / n : 0) && cer(take.text, take.heard) > LIMITS.cer) reasons.push(`words: heard "${take.heard}" (${Math.round(e * 100)} % off)`)
  if (max && take.seconds > max * LIMITS.overMax + 0.001) reasons.push(`length ${take.seconds.toFixed(2)} s > ${LIMITS.overMax}× max ${max} s`)
  if (take.target?.lufs != null && take.lufs != null && Math.abs(take.lufs - take.target.lufs) > LIMITS.lufs) reasons.push(`loudness ${take.lufs} LUFS (target ${take.target.lufs})`)
  if (take.peak > LIMITS.peak) reasons.push(`peak ${take.peak} dBFS`)
  if (!(take.seconds > 0.15)) reasons.push('empty take')
  const warnings = max && take.seconds > max + 0.001 && !reasons.some(r => r.startsWith('length')) ? [`long: ${take.seconds.toFixed(2)} s (max ${max} s)`] : []
  return { ok: reasons.length === 0, wer: e, reasons, warnings }
}

/** The take to ship: a passing one with the fewest wrong words, then the shortest; null when none passes. */
export const pickBest = (takes) => takes
  .filter(t => t.qa?.ok)
  .sort((a, b) => (a.qa.wer ?? 0) - (b.qa.wer ?? 0) || a.seconds - b.seconds)[0] ?? null
