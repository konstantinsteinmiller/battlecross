import type { ChoiceDef as QuestChoice, QuestDef } from '../data/quests'
import type {
  BlockDef, ChoiceDef, ChoiceIcon, ChoiceTone, Cond, ConversationDef, Effect, Emotion, Gesture, LineDef, NodeDef, Speaker,
  TalkWindow
} from './types'

/**
 * ─── Writing a conversation ──────────────────────────────────────────────────
 *
 * The data files say WHO speaks and WHEN; the words live in i18n. Line ids are
 * derived, so the two cannot drift apart:
 *
 *   a block `hello` of two lines        → dlg.<conv>.hello.1, dlg.<conv>.hello.2
 *   a topic `rumor`: the hero's line    → dlg.<conv>.rumor.say
 *                    its answer         → dlg.<conv>.rumor.1 …
 *                    an alternative     → dlg.<conv>.rumor.<alt>.1 …
 *
 * `lines` is one letter per line: `n` the person addressed, `h` the hero,
 * `x` the storyteller. "nhn" is a three-line exchange.
 */

export interface BlockSpec {
  id: string
  /** One letter per line (default: one line by the NPC). */
  lines?: string
  when?: Cond
  /** The NPC's tone in this block (default: the conversation's). */
  mood?: Emotion
  gesture?: Gesture
}

export interface TopicSpec {
  id: string
  /** A shared hero line instead of the topic's own `.say`. */
  say?: string
  /** The answer, one letter per line ('' = none). Default: one line. */
  lines?: string
  /** Alternative answers by world state (first match); they replace `lines`. */
  alt?: BlockSpec[]
  when?: Cond
  needs?: Cond
  /** Default true: said once. `false` = a permanent topic. */
  once?: boolean
  icon?: ChoiceIcon
  tone?: ChoiceTone
  fx?: Effect[]
  goto?: string
  end?: boolean
  mood?: Emotion
  gesture?: Gesture
  note?: ChoiceDef['note']
  /** A purchase priced and gated by the game (see `ChoiceDef.offer`). */
  offer?: string
}

export interface ConvSpec {
  /** i18n key of the speaker's name. */
  name: string
  look: string
  /** Whose voice it is, when it is not this conversation's own (the same
   *  person under another NPC id). */
  voice?: string
  /** How this person usually sounds. */
  mood?: Emotion
  greet: BlockSpec[]
  topics: TopicSpec[]
  /** Further lists reached by a topic's `goto`. */
  nodes?: Record<string, { final?: boolean; topics: TopicSpec[] }>
  back?: Partial<Record<TalkWindow, BlockSpec[]>>
  bye: BlockSpec[]
}

const SPEAKER: Record<string, Speaker> = { n: 'npc', h: 'hero', x: 'narrator' }

const linesOf = (prefix: string, pattern: string, mood: Emotion | undefined, gesture: Gesture | undefined): LineDef[] =>
  [...pattern].map((ch, i) => {
    const by = SPEAKER[ch]
    if (!by) throw new Error(`[dialog] "${ch}" in "${pattern}" (${prefix}) is not a speaker letter`)
    const line: LineDef = { id: `${prefix}.${i + 1}`, by }
    if (by !== 'hero' && mood) line.emotion = mood
    if (by === 'npc' && gesture && i === 0) line.gesture = gesture
    return line
  })

/** Build a conversation from its spec. Throws on a duplicate id: two blocks
 *  with one id would be two texts under one line id. */
export const conversation = (id: string, spec: ConvSpec): ConversationDef => {
  const p = `dlg.${id}`
  const seen = new Set<string>()
  const claim = (key: string): void => {
    if (seen.has(key)) throw new Error(`[dialog] ${id}: "${key}" is used twice`)
    seen.add(key)
  }
  const block = (b: BlockSpec, under = ''): BlockDef => {
    claim(under ? `${under}.${b.id}` : b.id)
    return { id: b.id, when: b.when, lines: linesOf(under ? `${p}.${under}.${b.id}` : `${p}.${b.id}`, b.lines ?? 'n', b.mood ?? spec.mood, b.gesture) }
  }
  const topic = (t: TopicSpec): ChoiceDef => {
    claim(t.id)
    const replies: BlockDef[] = t.alt
      ? t.alt.map(a => block({ ...a, mood: a.mood ?? t.mood }, t.id))
      : [{ id: t.id, lines: linesOf(`${p}.${t.id}`, t.lines ?? 'n', t.mood ?? spec.mood, t.gesture) }]
    return {
      id: t.id,
      line: { id: t.say ?? `${p}.${t.id}.say`, by: 'hero' },
      when: t.when, needs: t.needs, once: t.once ?? true, icon: t.icon, tone: t.tone,
      replies, effects: t.fx ?? [], goto: t.goto, end: t.end, note: t.note, offer: t.offer
    }
  }
  const nodes: Record<string, NodeDef> = { root: { id: 'root', choices: spec.topics.map(topic) } }
  for (const n in spec.nodes) nodes[n] = { id: n, final: spec.nodes[n]!.final, choices: spec.nodes[n]!.topics.map(topic) }
  const back: ConversationDef['back'] = {}
  for (const w in spec.back) back[w as TalkWindow] = spec.back[w as TalkWindow]!.map(b => block(b))
  return { id, name: spec.name, look: spec.look, voice: spec.voice ?? id, greet: spec.greet.map(b => block(b)), nodes, back, bye: spec.bye.map(b => block(b)) }
}

/** What a quest choice asks of the hero, as a dialogue condition (the same
 *  thresholds `choiceOpen` checks; `decideQuest` checks them again). */
export const choiceNeeds = (c: QuestChoice): Cond | undefined => {
  const n = c.needs
  if (!n) return undefined
  return { level: n.level, attrs: n.attrs, flags: n.flags, rep: n.rep }
}

export interface DecisionSpec {
  /** i18n key of who speaks. */
  name: string
  /** Whose voice it is (default: the quest's speaker look). */
  voice?: string
  mood?: Emotion
  /** The question, one letter per line. */
  ask: string
  /** What follows each choice, one letter per line (default: the storyteller, once). */
  results?: Record<string, string>
}

/**
 * A quest's decision as a conversation: the speaker puts the question, the
 * hero answers with one of the quest's choices, and what follows is told.
 * Everything that is a RULE (who may pick what, what it changes) is read from
 * the quest table, so the two cannot disagree.
 */
export const decision = (quest: QuestDef, spec: DecisionSpec): ConversationDef => {
  const id = `quest.${quest.id}`
  const p = `dlg.${id}`
  const choices: ChoiceDef[] = quest.choices.map(c => ({
    id: c.id,
    line: { id: `${p}.${c.id}.say`, by: 'hero' },
    needs: choiceNeeds(c),
    once: true,
    icon: 'decision',
    tone: c.tone,
    replies: [{ id: c.id, lines: linesOf(`${p}.${c.id}`, spec.results?.[c.id] ?? 'x', spec.mood, undefined) }],
    effects: [{ t: 'decide', quest: quest.id, choice: c.id }],
    end: true,
    note: c.gold ? { key: 'quest.gold', params: { n: c.gold } } : undefined
  }))
  return {
    id, name: spec.name, look: quest.speaker, voice: spec.voice ?? quest.speaker,
    greet: [{ id: 'ask', lines: linesOf(`${p}.ask`, spec.ask, spec.mood, undefined) }],
    nodes: { root: { id: 'root', final: true, choices } },
    back: {}, bye: []
  }
}

export type { ChoiceIcon, ChoiceTone }
