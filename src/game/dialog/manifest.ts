import { END_LINE } from './runner'
import { EPILOGUE_FLAGS } from '../data/quests'
import type { BlockDef, ConversationDef, Emotion, Gesture, LineDef } from './types'

/**
 * ─── The voice manifest ──────────────────────────────────────────────────────
 *
 * Every line the game can speak, once: who says it, how, the English text and
 * the audio file the player layer will look for. A recording dropped at that
 * path is played instead of the text-paced bubble; nothing else has to change.
 */

export const VOICE_DIR = 'audio/voice'
export const VOICE_EXT = 'ogg'

/** Where a line's recording lives under `public/`. */
export const voicePath = (lang: string, id: string): string => `${VOICE_DIR}/${lang}/${id}.${VOICE_EXT}`

export interface ManifestLine {
  /** Line id = i18n key = file name. */
  id: string
  /** The voice: `hero`, `narrator`, or a person (`sunfordSmith`, `goblinKing`). */
  speaker: string
  /** The speaker's rig look (what they look like): '' for the storyteller. */
  look: string
  /** The conversation it was first found in (`hero` for his shared lines). */
  scene: string
  /** i18n key of the speaker's name (the person addressed, for a hero line). */
  name: string
  emotion: Emotion
  gesture?: Gesture
  text: string
  /** `public/…` path the game plays when it exists. */
  file: string
  /** A feminine take (`<id>__f`, roadmap #71): the line it is a take of. */
  variantOf?: string
  /** Told, not said to someone: the player's own voice narrates it (roadmap #73). */
  narrated?: true
}

/**
 * What the player's own voice reads out (roadmap #73): the story told between
 * the conversations — a quest's outcome, which was the storyteller's — and the
 * ending, which is the closest thing the game has to a letter. Read by the
 * hero, or by the girl hero in her own takes, so a player hears it rather than
 * reads it.
 */
export const ENDINGS = ['order', 'syndicate', 'circle', 'free', 'unbound'] as const
export const narrationIds = (): string[] => [
  ...ENDINGS.map(k => `ending.${k}.text`),
  ...EPILOGUE_FLAGS.map(f => `ending.note.${f}`),
  'ending.more'
]

/** The suffix of a feminine take; the same as the i18n variant's (`i18n/gendered.ts`). */
export const FEMININE_TAKE = '__f'
/** Who voices the girl hero's own takes of the hero's lines. */
export const HEROINE = 'heroine'

/** Every line of a conversation, in reading order. */
export const linesOf = (c: ConversationDef): LineDef[] => {
  const out: LineDef[] = []
  const blocks = (bs: readonly BlockDef[] | undefined): void => { for (const b of bs ?? []) out.push(...b.lines) }
  blocks(c.greet)
  for (const n of Object.values(c.nodes)) {
    for (const ch of n.choices) {
      out.push(ch.line)
      blocks(ch.replies)
    }
  }
  for (const w of Object.values(c.back)) blocks(w)
  blocks(c.bye)
  return out
}

/** Who voices a line. */
export const voiceOf = (c: ConversationDef, l: LineDef): string =>
  l.by === 'npc' ? c.voice : l.by

/**
 * The manifest. A line shared by several conversations (the hero's "Show me
 * your goods.") is listed once. `text` looks a line id up in a locale.
 */
export const dialogLines = (
  convs: readonly ConversationDef[], text: (id: string) => string, lang = 'en'
): ManifestLine[] => {
  const out = new Map<string, ManifestLine>()
  const add = (l: LineDef, c: ConversationDef | null): void => {
    if (out.has(l.id)) return
    const voice = c ? voiceOf(c, l) : l.by
    // The storyteller is the player's own voice now (#73).
    const narrated = voice === 'narrator'
    const speaker = narrated ? 'hero' : voice
    out.set(l.id, {
      id: l.id,
      speaker,
      ...(narrated ? { narrated: true as const } : {}),
      look: l.by === 'npc' && c ? c.look : l.by === 'narrator' ? '' : l.by,
      scene: !c || l.id.startsWith('dlg.hero.') ? 'hero' : c.id,
      name: c ? c.name : '',
      emotion: l.emotion ?? 'neutral',
      ...(l.gesture ? { gesture: l.gesture } : {}),
      text: text(l.id),
      file: `public/${voicePath(lang, l.id)}`
    })
  }
  add(END_LINE, null)
  for (const c of convs) for (const l of linesOf(c)) add(l, c)
  // The ending, read in the player's voice.
  for (const id of narrationIds()) {
    if (!out.has(id)) out.set(id, { id, speaker: 'hero', narrated: true, look: '', scene: 'ending', name: '', emotion: 'neutral', text: text(id), file: `public/${voicePath(lang, id)}` })
  }
  const lines = [...out.values()]
  return [...lines, ...feminineTakes(lines, text, lang)]
}

/**
 * The girl hero's takes (roadmap #71), each its own entry with its own id
 * (`<id>__f`, which is also the recording's name and, where the text differs,
 * the i18n key of its feminine variant):
 *   · every line the HERO speaks, in the girl hero's voice (`heroine`), with
 *     the variant's text where English has one;
 *   · every other line whose English text has a feminine variant (someone
 *     speaking ABOUT or TO her differently), in its own speaker's voice.
 * The game plays `<id>__f` for the girl hero when it exists (`audio/speech.ts`).
 */
export const feminineTakes = (lines: readonly ManifestLine[], text: (id: string) => string, lang = 'en'): ManifestLine[] => {
  const out: ManifestLine[] = []
  for (const l of lines) {
    const id = l.id + FEMININE_TAKE
    const variant = text(id)
    if (l.speaker !== 'hero' && !variant) continue
    out.push({ ...l, id, speaker: l.speaker === 'hero' ? HEROINE : l.speaker, text: variant || l.text, file: `public/${voicePath(lang, id)}`, variantOf: l.id })
  }
  return out
}
