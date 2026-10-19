import { shallowReactive } from 'vue'
import type { ChoiceView, Phase } from './dialog/runner'
import type { ConversationDef, DialogWorld, LineDef, TalkWindow } from './dialog/types'
import type { ChoiceDef as QuestChoice } from './data/quests'
import type { NpcDef } from './data/zones'
import { errandStateOf, flagSet, profile, totalAttrs } from './state/profile'

/**
 * ─── The conversation on screen ──────────────────────────────────────────────
 *
 * The bridge between the pure dialogue engine (`game/dialog`) and the game:
 * it answers the engine's questions from the save, applies what a topic does
 * through the game's own rules (`decideQuest`, `gainItem`…), and mirrors the
 * runner into `talk`, the reactive state the bubble layer draws.
 *
 * `flow.ts` decides WHEN a conversation starts and what follows it; this file
 * never opens a window or travels by itself — it is handed `onOpen` / `onEnd`.
 *
 * The engine, the conversations and the host are a lazy chunk (`talkCode.ts`,
 * roadmap #142): what is here is the state and the calls the game makes, each
 * passed on to the chunk once `talkLoader.ts` has installed it.
 */

/** `world`: bubbles over the speakers' heads. `portrait`: the speaker is not
 *  in the scene (a decision after a fight, a trainer met on the map). */
export type TalkStage = 'world' | 'portrait'

export const talk = shallowReactive({
  on: false,
  conv: null as ConversationDef | null,
  stage: 'world' as TalkStage,
  /** i18n key of a heading over the conversation (a quest's title), or ''. */
  title: '',
  phase: 'idle' as Phase,
  line: null as LineDef | null,
  /** Another line follows the one on screen. */
  more: false,
  choices: [] as ChoiceView[],
  /** The list is an irreversible decision. */
  final: false,
  leaving: false,
  /** The quest choice just made: its rewards are shown with what follows. */
  outcome: null as QuestChoice | null,
  /** Counts the lines spoken: the bubble restarts its typewriter on a change. */
  beat: 0
})

// ─── The world, as conditions see it ─────────────────────────────────────────

export const dialogWorld = (): DialogWorld => ({
  level: profile.level,
  gold: profile.gold,
  attrs: totalAttrs(),
  flags: flagSet(),
  rep: profile.quests.rep,
  quests: profile.quests.done,
  cleared: new Set(profile.world.cleared),
  said: new Set(profile.world.said),
  errands: Object.fromEntries(Object.keys(profile.quests.errands).map(id => [id, errandStateOf(id)])),
  ore: Object.values(profile.inv.ores).reduce((s, n) => s + n, 0),
  smithing: profile.inv.smithing
})

// ─── A conversation ──────────────────────────────────────────────────────────

export interface TalkOptions {
  stage: TalkStage
  title?: string
  /** A topic hands over to a window. */
  onOpen(window: TalkWindow): void
  /** The conversation is over. */
  onEnd(): void
}

type TalkCode = typeof import('./talkCode')

let code: TalkCode | null = null

/** The conversations' code, once loaded (null before). */
export const talkCodeReady = (): TalkCode | null => code

/** Hand the loaded chunk over (`talkLoader.ts`; a test's setup). */
export const installTalkCode = (c: TalkCode): void => { code = c }

/** The conversation of a townsperson (or a hidden trainer); undefined while
 *  the conversations' code is not loaded. */
export const conversationOf = (npcId: string): ConversationDef | undefined => code?.conversationOf(npcId)

/** The decision conversation of a quest (as `conversationOf`). */
export const decisionOf = (questId: string): ConversationDef | undefined => code?.decisionOf(questId)

/** Start a conversation. False when one is already running (or its code is
 *  not loaded: the caller loads it first). */
export const beginTalk = (conv: ConversationDef, o: TalkOptions): boolean => (code ? code.beginTalk(conv, o) : false)

/** The line was heard (a tap, Space, Enter, the end of its recording). */
export const talkNext = (): void => { code?.talkNext() }

/** The hero says something. False when he cannot (locked, gone, refused). */
export const talkPick = (id: string): boolean => (code ? code.talkPick(id) : false)

/** End it politely (Esc, the close button). False inside a decision. */
export const talkLeave = (): boolean => (code ? code.talkLeave() : false)

/** The window a topic opened has closed: the talk goes on. */
export const talkResume = (): void => { code?.talkResume() }

/** Is the conversation waiting behind a window? */
export const talkWaiting = (): boolean => talk.on && talk.phase === 'window'

/** Drop the conversation without a word (the place is being left). */
export const abortTalk = (): void => { code?.abortTalk() }

// ─── The marker over a townsperson's head ────────────────────────────────────

export type NpcPin = 'quest' | 'shop' | 'trainer' | 'healer' | 'alchemist' | 'gambler' | 'talk'

/**
 * What floats over an NPC: a quest mark while their quest is undecided, else
 * their trade. `news`: they have something to say that was never said.
 */
export const npcPin = (npc: NpcDef, w: DialogWorld = dialogWorld()): { kind: NpcPin; news: boolean } => {
  const conv = conversationOf(npc.id)
  const open = !!npc.quest && !w.quests[npc.quest]
  // A secret trader or master is a face in the crowd until the hero has earned them.
  const hidden = !!npc.secret && !w.flags.has(npc.secret)
  const shop = npc.role === 'shop' && !hidden
  const kind: NpcPin = open ? 'quest' : hidden ? 'talk' : shop ? 'shop' : npc.role === 'trainer' ? 'trainer' : npc.role === 'healer' ? 'healer' : npc.role === 'alchemist' ? 'alchemist' : npc.role === 'gambler' ? 'gambler' : 'talk'
  return { kind, news: !!conv && !!code && code.hasNews(conv, w) }
}
