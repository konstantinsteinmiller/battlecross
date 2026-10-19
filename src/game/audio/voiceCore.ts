/**
 * ─── The core voice lines ────────────────────────────────────────────────────
 *
 * English is voiced in full; every other voiced language ships only the core
 * (data/voice-core.json: id patterns plus an explicit list), so the build stays
 * small. A pure function, shared by the voice pipeline (tools/voice/core.mjs),
 * voice-todo.md and the tests. The girl hero's `<id>__f` twin follows its base.
 */

export interface VoiceCoreSpec {
  max: number
  patterns: readonly string[]
  include: readonly string[]
  exclude: readonly string[]
}

/** The id of a line without the girl hero's `__f` suffix. */
export const voiceBaseId = (id: string): string => id.replace(/__f$/, '')

/** The ids (twins included) of `ids` that are core. */
export const coreIdsOf = (spec: VoiceCoreSpec, ids: readonly string[]): string[] => {
  const res = spec.patterns.map(p => new RegExp(p))
  const inc = new Set(spec.include)
  const exc = new Set(spec.exclude)
  return ids.filter((id) => {
    const b = voiceBaseId(id)
    return !exc.has(b) && (inc.has(b) || res.some(r => r.test(b)))
  })
}
