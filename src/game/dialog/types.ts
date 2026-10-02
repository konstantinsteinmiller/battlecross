import type { AttrBlock } from '../data/attributes'
import type { FactionId } from '../data/quests'

/**
 * ─── Conversations as data (D37) ─────────────────────────────────────────────
 *
 * A conversation is a small graph: a greeting, then a list of TOPICS the hero
 * may raise. A topic is what he says, what is answered, and what it does (opens
 * the shop, hands over a purse, decides a quest). The list shrinks as one-time
 * topics are used and grows as the world changes, and the save remembers what
 * was said, so nobody introduces themselves twice.
 *
 * Every LINE has a stable id that is three things at once: the i18n key of its
 * text (`dlg.sunfordSmith.greet.1`), its place in the voice manifest, and the
 * name of its future audio file. A line is therefore always a whole sentence:
 * never built by concatenation, never one id for two texts.
 *
 * Nothing here knows Vue, three.js or the save: the engine is handed a
 * `DialogHost` and asks it about the world.
 */

/** Who says a line: the person addressed, the hero, the storyteller, or a
 *  named third party (a rig look id). */
export type Speaker = 'npc' | 'hero' | 'narrator' | (string & {})

/** How a line is delivered. Read by the voice manifest (the actor's tone) and
 *  by the bubble (a shout shakes, a whisper is small). */
export type Emotion =
  | 'neutral' | 'warm' | 'gruff' | 'sly' | 'grave' | 'angry' | 'afraid' | 'proud' | 'sad' | 'amused' | 'excited'
  | 'whisper' | 'shout' | 'weary' | 'cold'

/** A body cue for the speaker (the view may play it; the manifest lists it). */
export type Gesture = 'nod' | 'shrug' | 'point' | 'wave' | 'bow' | 'think' | 'laugh' | 'refuse'

/** What must hold. Every field given must be true (`any` adds an OR). */
export interface Cond {
  /** World flags that are set / not set. */
  flags?: readonly string[]
  not?: readonly string[]
  /** Quest id → the choice made; `true` = decided somehow; `false` = still open. */
  quest?: Readonly<Record<string, string | boolean>>
  /** Faction standing at least / at most (a friend, a foe). */
  rep?: Partial<Record<FactionId, number>>
  repMax?: Partial<Record<FactionId, number>>
  level?: number
  attrs?: Partial<AttrBlock>
  gold?: number
  /** Map nodes cleared / not cleared yet. */
  cleared?: readonly string[]
  uncleared?: readonly string[]
  /** Memory keys said / not said before. A bare topic id means this
   *  conversation's own; `other.topic` reaches into another one. */
  said?: readonly string[]
  unsaid?: readonly string[]
  /** The hero has (not) spoken to this person before. */
  met?: boolean
  any?: readonly Cond[]
}

/** The world as conditions see it. */
export interface DialogWorld {
  level: number
  gold: number
  attrs: AttrBlock
  flags: ReadonlySet<string>
  rep: Readonly<Record<FactionId, number>>
  /** Quest id → the choice made. */
  quests: Readonly<Record<string, string>>
  cleared: ReadonlySet<string>
  /** Dialogue memory: `<conversation>` (met) and `<conversation>.<topic>` (said). */
  said: ReadonlySet<string>
}

export interface LineDef {
  /** Stable id = i18n key = voice file name. */
  id: string
  by: Speaker
  emotion?: Emotion
  gesture?: Gesture
  /** Spoken only while this holds. */
  when?: Cond
}

/** A run of lines; of several alternatives the first whose `when` holds is spoken. */
export interface BlockDef {
  id: string
  when?: Cond
  lines: LineDef[]
}

/** The windows a conversation hands over to (and comes back from). */
export type TalkWindow = 'shop' | 'trainer' | 'healer'

export type Effect =
  /** Remember something beyond the topic itself. */
  | { t: 'remember'; key: string }
  /** Hand over to a window once the answer has been spoken. */
  | { t: 'open'; window: TalkWindow }
  | { t: 'gold'; n: number }
  | { t: 'item'; id: string }
  /** The quest's zone is pointed out to the player. */
  | { t: 'hint'; quest: string }
  /** A quest decision: permanent. */
  | { t: 'decide'; quest: string; choice: string }

/** Something sold inside a conversation (a mana potion): the game's rule says
 *  what it costs and whether it can be bought right now. */
export interface Offer {
  price: number
  /** '' = can be bought; `gold` = too dear; `full` = no room for it. */
  block: '' | 'gold' | 'full'
}

export type ChoiceIcon = 'trade' | 'train' | 'heal' | 'quest' | 'gift' | 'buy' | 'decision' | 'end'
export type ChoiceTone = 'noble' | 'ruthless' | 'cunning'

/** Something the hero can say. */
export interface ChoiceDef {
  id: string
  /** The line the hero SPEAKS (its text is also the choice's label). */
  line: LineDef
  /** Offered only while this holds (hidden otherwise). */
  when?: Cond
  /** Offered but LOCKED while this does not hold: the list says what is missing. */
  needs?: Cond
  /** A one-time topic leaves the list once used; a permanent one stays. */
  once: boolean
  icon?: ChoiceIcon
  tone?: ChoiceTone
  /** The answer: the first block whose `when` holds. */
  replies: BlockDef[]
  effects: Effect[]
  /** Move to another node afterwards. */
  goto?: string
  /** The conversation ends after the answer. */
  end?: boolean
  /** A short note under the label (an i18n key and its numbers), e.g. the gold a choice pays. */
  note?: { key: string; params?: Record<string, string | number> }
  /** A purchase (`DialogHost.offer` / `buy`): the price is shown, the choice
   *  is locked while it cannot be bought, and hidden when the game has no
   *  such thing for sale. */
  offer?: string
}

export interface NodeDef {
  id: string
  choices: ChoiceDef[]
  /** An irreversible decision: no "End", no leaving until one is picked. */
  final?: boolean
}

export interface ConversationDef {
  /** The NPC id, or `quest.<id>` for a decision. Prefix of its memory keys. */
  id: string
  /** i18n key of the speaker's name. */
  name: string
  /** Rig look: the portrait, and the model when they stand in the scene. */
  look: string
  /** Whose VOICE it is in the manifest. Two people may share a look (every
   *  smith is built from one rig) and one person may have two conversations
   *  (Odo before and after the siege): the voice is the person. */
  voice: string
  /** Spoken on arrival: the first block whose `when` holds. */
  greet: BlockDef[]
  nodes: Record<string, NodeDef>
  /** Spoken when a window closes and the talk goes on. */
  back: Partial<Record<TalkWindow, BlockDef[]>>
  /** The farewell. */
  bye: BlockDef[]
}

/** Why a locked choice is locked, for the list to spell out. */
export type LockReason =
  | { kind: 'attr'; attr: keyof AttrBlock; n: number }
  | { kind: 'level'; n: number }
  | { kind: 'rep'; faction: FactionId; n: number }
  | { kind: 'gold'; n: number }
  /** No room for what is sold. */
  | { kind: 'full' }
  | { kind: 'other' }

/** What the engine may ask of, and do to, the game. */
export interface DialogHost {
  world(): DialogWorld
  remember(key: string): void
  /** A gift: gold and / or an item. */
  give(gold: number, item: string): void
  hint(quest: string): void
  /** Apply a quest decision. False when the rules refuse it. */
  decide(quest: string, choice: string): boolean
  /** Hand over to a window (the conversation waits behind it). */
  open(window: TalkWindow): void
  /** What an offer costs and whether it can be bought; null = not for sale. */
  offer(id: string): Offer | null
  /** Buy it. False when the rules refuse. */
  buy(id: string): boolean
}
