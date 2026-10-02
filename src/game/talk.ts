import { shallowReactive } from 'vue'
import { DialogRunner, hasNews, type ChoiceView, type Phase } from './dialog/runner'
import type { ConversationDef, DialogHost, DialogWorld, LineDef, Offer, TalkWindow } from './dialog/types'
import { conversationOf } from './data/dialogs'
import { MANA_OFFER } from './data/dialogs/shared'
import { QUEST_BY_ID, type ChoiceDef as QuestChoice } from './data/quests'
import type { NpcDef } from './data/zones'
import {
  buyManaPotion, decideQuest, flagSet, gainItem, manaPotionCost, manaPotionRoom, profile, saveProfile, totalAttrs
} from './state/profile'
import { pushHud } from './state/hud'
import { sfx } from './audio/sfx'
import { flushSaveNow } from '@/use/useSaveStatus'

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
  said: new Set(profile.world.said)
})

/** Remember a dialogue key in the save (a checkpoint, like any purchase). */
const remember = (key: string): void => {
  if (profile.world.said.includes(key)) return
  profile.world.said.push(key)
  saveProfile()
}

/**
 * The healers' mana potion. The rule is `state/profile.ts`'s (the price grows
 * with the hero's level; the stock holds as many as the health belt): this
 * only asks it, so the choice shows the price and locks when the stock is full
 * or the purse too light.
 */
const manaOffer = (): Offer => {
  const price = manaPotionCost()
  return { price, block: manaPotionRoom() <= 0 ? 'full' : profile.gold < price ? 'gold' : '' }
}

// ─── A conversation ──────────────────────────────────────────────────────────

export interface TalkOptions {
  stage: TalkStage
  title?: string
  /** A topic hands over to a window. */
  onOpen(window: TalkWindow): void
  /** The conversation is over. */
  onEnd(): void
}

let runner: DialogRunner | null = null
let opts: TalkOptions | null = null

const host: DialogHost = {
  world: dialogWorld,
  remember,
  give(gold, item) {
    if (gold > 0) {
      profile.gold += gold
      pushHud({ t: 'toast', key: 'dlg.ui.gotGold', params: { n: gold } })
      sfx('coin')
    }
    if (item) {
      gainItem(item)
      pushHud({ t: 'toast', key: 'dlg.ui.gotItem', params: { item: `item.${item}.name` }, icon: item })
      sfx('loot')
    }
    saveProfile()
  },
  hint(quest) {
    const q = QUEST_BY_ID[quest]
    if (!q || profile.world.said.includes(`hint.${quest}`)) return
    remember(`hint.${quest}`)
    pushHud({ t: 'toast', key: 'dlg.ui.hint', params: { zone: `node.${q.node}.name` } })
  },
  decide(quest, choice) {
    // The rule, and the save on the device at once: a decision is permanent.
    if (!decideQuest(quest, choice)) return false
    void flushSaveNow()
    talk.outcome = QUEST_BY_ID[quest]?.choices.find(c => c.id === choice) ?? null
    return true
  },
  open(window) {
    opts?.onOpen(window)
  },
  offer: id => (id === MANA_OFFER ? manaOffer() : null),
  buy: (id) => {
    if (id !== MANA_OFFER || !buyManaPotion()) return false
    sfx('potion')
    return true
  }
}

/** Mirror the runner into the reactive state; finish when it has ended. */
const sync = (): void => {
  if (!runner) return
  const v = runner.view()
  if (v.line !== talk.line && v.line) talk.beat++
  talk.phase = v.phase
  talk.line = v.line
  talk.more = v.more
  talk.choices = v.choices
  talk.final = v.final
  talk.leaving = v.leaving
  if (v.phase === 'ended') finish()
}

const finish = (): void => {
  const o = opts
  runner = null
  opts = null
  talk.on = false
  talk.phase = 'idle'
  talk.line = null
  talk.choices = []
  talk.final = false
  talk.leaving = false
  talk.more = false
  talk.outcome = null
  talk.conv = null
  o?.onEnd()
}

/** Start a conversation. False when one is already running. */
export const beginTalk = (conv: ConversationDef, o: TalkOptions): boolean => {
  if (runner) return false
  runner = new DialogRunner(conv, host)
  opts = o
  talk.on = true
  talk.conv = conv
  talk.stage = o.stage
  talk.title = o.title ?? ''
  talk.outcome = null
  talk.line = null
  runner.start()
  sync()
  return true
}

/** The line was heard (a tap, Space, Enter, the end of its recording). */
export const talkNext = (): void => {
  runner?.next()
  sync()
}

/** The hero says something. False when he cannot (locked, gone, refused). */
export const talkPick = (id: string): boolean => {
  if (!runner) return false
  const ok = runner.pick(id)
  sfx(ok ? 'uiChoice' : 'denied')
  sync()
  return ok
}

/** End it politely (Esc, the close button). False inside a decision. */
export const talkLeave = (): boolean => {
  if (!runner) return false
  const ok = runner.leave()
  if (!ok) sfx('denied')
  sync()
  return ok
}

/** The window a topic opened has closed: the talk goes on. */
export const talkResume = (): void => {
  runner?.resume()
  sync()
}

/** Is the conversation waiting behind a window? */
export const talkWaiting = (): boolean => talk.on && talk.phase === 'window'

/** Drop the conversation without a word (the place is being left). */
export const abortTalk = (): void => {
  if (!runner) return
  opts = null
  finish()
}

// ─── The marker over a townsperson's head ────────────────────────────────────

export type NpcPin = 'quest' | 'shop' | 'trainer' | 'healer' | 'talk'

/**
 * What floats over an NPC: a quest mark while their quest is undecided, else
 * their trade. `news`: they have something to say that was never said.
 */
export const npcPin = (npc: NpcDef, w: DialogWorld = dialogWorld()): { kind: NpcPin; news: boolean } => {
  const conv = conversationOf(npc.id)
  const open = !!npc.quest && !w.quests[npc.quest]
  const kind: NpcPin = open ? 'quest' : npc.role === 'shop' ? 'shop' : npc.role === 'trainer' ? 'trainer' : npc.role === 'healer' ? 'healer' : 'talk'
  return { kind, news: !!conv && hasNews(conv, w) }
}
