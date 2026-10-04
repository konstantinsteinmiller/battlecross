/**
 * ─── voice-todo.md, rendered ─────────────────────────────────────────────────
 *
 * The to-do list of the voice work: every line of data/voice-manifest.json
 * with its voice, when it plays, its text and the state of its English
 * recording: voiced (by which engine, `vo-src/shipped.json`), **stale** (the
 * text changed since it was voiced: `voice:gen` re-voices it) or
 * **missing**. Lines that need work come first. A pure function with no
 * imports, so the test that keeps the file current and the script that writes
 * it (`pnpm voice:script`, and every `voice:gen` run) render the same text.
 */

export interface VoiceTodoLine {
  id: string
  /** The voice (card) that speaks it. */
  speaker: string
  /** Who it is, in words. */
  who: string
  scene: string
  text: string
  /** The text's hash now (`textHash`). */
  hash: string
}

export interface VoiceTodoInput {
  lines: readonly VoiceTodoLine[]
  /** `en/<id>` → the engine that made the shipped file, and the hash of the text it said. */
  shipped: Readonly<Record<string, { engine: string; hash?: string }>>
  /** The file names (without extension) in public/audio/voice/en/. */
  files: ReadonlySet<string>
}

/** The to-do's lines from the manifest's: the voice from `voiceOf` (voiceCards.ts), the hash from `hashOf`. */
export const todoLinesOf = (
  manifest: ReadonlyArray<{ id: string; speaker: string; who: string; scene: string; text: string }>,
  voiceOf: (l: { speaker: string; scene: string }) => string,
  hashOf: (l: { text: string }) => string
): VoiceTodoLine[] => manifest.map(l => ({ id: l.id, speaker: voiceOf(l), who: l.who, scene: l.scene, text: l.text, hash: hashOf(l) }))

const cell = (s: unknown): string => String(s ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const extOf = /\.(ogg|mp3|m4a)$/i

/** The file name without its extension (ids keep their dots: `dlg.hero.bye.ogg` → `dlg.hero.bye`). */
export const voiceFileId = (file: string): string => file.replace(extOf, '')

export const renderVoiceTodo = ({ lines, shipped, files }: VoiceTodoInput): string => {
  const state = (l: VoiceTodoLine): string => {
    if (!files.has(l.id)) return '**missing**'
    const rec = shipped[`en/${l.id}`]
    if (!rec) return 'by hand'
    return rec.hash === l.hash ? rec.engine : '**stale**'
  }
  const open = lines.filter(l => state(l).startsWith('**'))
  const row = (l: VoiceTodoLine) => `| \`${l.id}\` | ${cell(l.who)} (${l.speaker}) | ${cell(l.scene)} | ${cell(l.text)} | ${state(l)} |`
  const head = '| File | Who | Scene | English | EN |\n| --- | --- | --- | --- | --- |'
  const speakers = [...new Set(lines.map(l => l.speaker))]
  const bySpeaker = speakers.map(s => {
    const mine = lines.filter(l => l.speaker === s)
    return `| ${s} | ${mine.length} | ${mine.filter(l => !state(l).startsWith('**')).length} |`
  })
  const voiced = lines.length - open.length
  return `# Voice-over to-do

Generated from data/voice-manifest.json, the voice files and
vo-src/shipped.json by \`pnpm voice:script\`; every \`pnpm voice:gen\` run
rewrites it, and a test fails when it is stale. Do not edit by hand.

- **Files:** \`public/audio/voice/en/<id>.ogg\`. Every language plays the
  English recording under its own subtitle; a line with no file is
  text-paced.
- **Stale** means the line's text changed after it was voiced: the next
  \`voice:gen\` run voices it again.
- **Make the missing and stale ones:** \`pnpm voice:manifest\`, \`pnpm
  voice:collect\`, then \`node --experimental-strip-types --no-warnings
  tools/voice/generate.mjs --engine chatterbox\` (it voices only what is
  missing or stale), then \`--retry 2\` for the ones that fail QA.

| Voice | Lines | EN voiced |
| --- | --- | --- |
${bySpeaker.join('\n')}
| **All** | **${lines.length}** | **${voiced}** |

## To do (${open.length})

${open.length ? `${head}\n${open.map(row).join('\n')}` : 'Nothing: every line has its recording.'}

## Every line (${lines.length})

${head}
${lines.map(row).join('\n')}
`
}
