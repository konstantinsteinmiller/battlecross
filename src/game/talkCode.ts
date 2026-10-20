import { DialogRunner, hasNews } from './dialog/runner'
import type { ConversationDef, DialogHost, Offer } from './dialog/types'
import { conversationOf, decisionOf } from './data/dialogs'
import { MANA_OFFER } from './data/dialogs/shared'
import { QUEST_BY_ID } from './data/quests'
import { RIFT_SEALED, STORY_QUESTS } from './data/breaking'
import {
  buyManaPotion, completeErrand, decideQuest, errandTalk, gainItem, manaPotionCost, manaPotionRoom, profile, saveProfile,
  startErrand,
  learnSmithing
} from './state/profile'
import { pushHud } from './state/hud'
import { sfx } from './audio/sfx'
import { flushSaveNow } from '@/use/useSaveStatus'
import { dialogWorld, talk, type TalkOptions } from './talk'

/**
 * ─── The conversation's code, as a lazy chunk (roadmap #142) ─────────────────
 *
 * The dialogue engine (`game/dialog`), every conversation's data
 * (`data/dialogs`) and the host that answers the engine from the save: none of
 * it is needed for the first fight, so it stays out of the engine chunk.
 * `talkLoader.ts` fetches it (on the idle queue; awaited before a town is
 * built and before a conversation that finds it missing) and hands it to
 * `talk.ts`, whose functions are what the game calls.
 */

export { conversationOf, decisionOf, hasNews }

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
    const q = QUEST_BY_ID[quest] ?? STORY_QUESTS[quest]
    talk.outcome = q?.choices.find(c => c.id === choice) ?? null
    // The end of the Breaking: what the choice made of the hero (the title) or of the world.
    if (q && q === STORY_QUESTS.seal) pushHud({ t: 'toast', key: q.choices.find(c => c.id === choice)?.flags.includes(RIFT_SEALED) ? 'breaking.toast.sealed' : 'breaking.toast.ajar' })
    return true
  },
  open(window) {
    opts?.onOpen(window)
  },
  errand(id, act) {
    if (act === 'start') {
      if (!startErrand(id)) return false
      pushHud({ t: 'toast', key: 'journal.taken', params: { title: `errand.${id}.title` } })
      sfx('uiOpen')
      return true
    }
    const r = completeErrand(id)
    if (!r) return false
    pushHud({ t: 'toast', key: 'journal.done', params: { title: `errand.${id}.title` } })
    if (r.gold) { pushHud({ t: 'toast', key: 'dlg.ui.gotGold', params: { n: r.gold } }); sfx('coin') }
    if (r.item) pushHud({ t: 'toast', key: 'dlg.ui.gotItem', params: { item: `item.${r.item}.name` }, icon: r.item })
    sfx('levelUp')
    return true
  },
  learnSmith() {
    learnSmithing()
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

export const beginTalk = (conv: ConversationDef, o: TalkOptions): boolean => {
  if (runner) return false
  // A word with this person may be a step of an errand (#86).
  errandTalk(conv.id)
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

export const talkNext = (): void => {
  runner?.next()
  sync()
}

export const talkPick = (id: string): boolean => {
  if (!runner) return false
  const ok = runner.pick(id)
  sfx(ok ? 'uiChoice' : 'denied')
  sync()
  return ok
}

export const talkLeave = (): boolean => {
  if (!runner) return false
  const ok = runner.leave()
  if (!ok) sfx('denied')
  sync()
  return ok
}

export const talkResume = (): void => {
  runner?.resume()
  sync()
}

export const abortTalk = (): void => {
  if (!runner) return
  opts = null
  finish()
}
