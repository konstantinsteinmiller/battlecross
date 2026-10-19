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
  /** The other voiced languages: the file names in public/audio/voice/<lang>/. */
  others?: ReadonlyArray<{ lang: string; files: ReadonlySet<string> }>
  /** The core line ids (data/voice-core.json, twins included): all the other languages voice. */
  core?: ReadonlySet<string>
  /** The core rule's size limit. */
  coreMax?: number
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

export const renderVoiceTodo = ({ lines, shipped, files, others = [], core, coreMax }: VoiceTodoInput): string => {
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
  const coreLines = core ? lines.filter(l => core.has(l.id)) : lines
  const otherRows = others.map(o => `| ${o.lang} | ${coreLines.filter(l => o.files.has(l.id)).length} | ${coreLines.length} |`)
  const twins = coreLines.filter(l => l.id.endsWith('__f')).length
  const otherTable = otherRows.length
    ? [
      '', '## Other languages: the core lines only', '',
      core
        ? `English is voiced in full. Every other voiced language ships only the **core**: ${coreLines.length} of ${lines.length} lines (${twins} of them the girl hero's \`__f\` twins${coreMax ? `, limit ${coreMax}` : ''}), set in data/voice-core.json by id pattern plus an explicit list. Core: the hero's "Will you teach me?" and goodbye lines, the main quest decisions with their boss monologues (Goblin King, Krag, the Colossus core, the oracle, the dragon, the Arch-Demon's throne), the five endings, and the story beats of Elder Mara, Captain Hale, Mayor Brenna, Madam Ash and the exiled Sovereign. Not core: smalltalk, shops, gamblers, barks, trainer and master Q&A, trade and heal chatter. A non-core line is a silent bubble; a test fails when a language folder holds a file outside the core.`
        : 'Voiced from the game\'s own locale text, with the same speaker voices (`voice:gen --lang <code>`). A line with no file is silent there.',
      'Make them with `voice:gen --engine chatterbox --lang <code>` (then `--retry 2`); `voice:collect` builds jobs for the core lines only.',
      'Indonesian (id) and Vietnamese (vi) are not voiced: Chatterbox cannot speak them. pt-PT keeps English too.', '',
      '| Language | Core voiced | Core lines |', '| --- | --- | --- |', ...otherRows, ''
    ].join('\n')
    : ''
  const parked = [
    '', '## Parked takes (decision 2026-10-18)', '',
    'About 1,400 files per language is too large for CrazyGames (50 MB), so only English ships complete and the others ship the core. The earlier full Chatterbox runs are kept out of the build in `vo-src/parked/<lang>/` (git-ignored): German has 1,366 of 1,410 lines (the girl hero\'s short lines with invented class names, such as the Aether and Chrono masters, still fail the Whisper check), French about 1,000, and ja, zh, es, pt and ru only pilot files. Only the core takes were moved back to `public/audio/voice/<lang>/`.',
    'To widen a language beyond the core, change data/voice-core.json and settle the size budget or a per-portal language filter first. A half-voiced core is silent on its missing lines, so finish it before shipping.', ''
  ].join('\n')
  return `# Voice-over to-do

Generated from data/voice-manifest.json, the voice files and
vo-src/shipped.json by \`pnpm voice:script\`; every \`pnpm voice:gen\` run
rewrites it, and a test fails when it is stale. Do not edit by hand.

- **Files:** \`public/audio/voice/<lang>/<id>.ogg\`. A language with
  recordings plays only its own (a line with no file is text-paced); a
  language with none (id, vi) plays the English ones under its subtitle.
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
${otherTable}${parked}
## To do (${open.length})

${open.length ? `${head}\n${open.map(row).join('\n')}` : 'Nothing: every line has its recording.'}

## Every line (${lines.length})

${head}
${lines.map(row).join('\n')}
`
}
