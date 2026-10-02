import { findBlock, lockReasons, meets, memoryKey, pickBlock } from './conditions'
import type {
  ChoiceDef, ChoiceIcon, ChoiceTone, ConversationDef, DialogHost, DialogWorld, LineDef, LockReason, NodeDef, TalkWindow
} from './types'

/**
 * ─── The conversation runner ─────────────────────────────────────────────────
 *
 * A small state machine over one `ConversationDef`. It speaks one line at a
 * time (`next`), then offers the topics (`pick`), and ends politely (`leave`).
 * It never waits and never draws: the layer that shows the bubbles calls it,
 * and reads `view()` after every call.
 *
 *   start → greeting lines → choices ⇄ (hero line → answer lines → effects)
 *                                  ↘ window (shop / trainer / healer) → resume
 *                                  ↘ farewell → ended
 */

/** The hero's own "that is all" (the last entry of every list). */
export const END_CHOICE = 'end'
/** One line, shared by every conversation: its id is its i18n key. */
export const END_LINE: LineDef = { id: 'dlg.hero.bye', by: 'hero' }

export type Phase = 'idle' | 'line' | 'choices' | 'window' | 'ended'

export interface ChoiceView {
  id: string
  /** i18n key of what the hero says. */
  text: string
  icon?: ChoiceIcon
  tone?: ChoiceTone
  /** Not pickable: what is missing. */
  locked: LockReason[]
  /** A permanent topic that was raised before. */
  used: boolean
  note?: ChoiceDef['note']
}

export interface RunnerView {
  phase: Phase
  /** The line on screen. */
  line: LineDef | null
  /** Another line follows this one. */
  more: boolean
  choices: ChoiceView[]
  /** The list is an irreversible decision: it cannot be left open. */
  final: boolean
  /** The farewell is being spoken. */
  leaving: boolean
  /** The window the conversation is waiting behind. */
  window: TalkWindow | ''
  /** The decision made in this conversation, once made. */
  decided: { quest: string; choice: string } | null
}

type After = { t: 'choices' } | { t: 'open'; window: TalkWindow } | { t: 'end' }

export class DialogRunner {
  readonly conv: ConversationDef
  private host: DialogHost
  private queue: LineDef[] = []
  private line: LineDef | null = null
  private after: After = { t: 'choices' }
  private node = 'root'
  private phase: Phase = 'idle'
  private leaving = false
  private window: TalkWindow | '' = ''
  private decided: RunnerView['decided'] = null

  constructor(conv: ConversationDef, host: DialogHost) {
    this.conv = conv
    this.host = host
  }

  private get world(): DialogWorld {
    return this.host.world()
  }

  private get cur(): NodeDef {
    return this.conv.nodes[this.node] ?? this.conv.nodes.root!
  }

  /** Speak `lines`, then do `after`. With nothing to say, `after` happens now. */
  private say(lines: LineDef[], after: After): void {
    this.queue = lines.slice()
    this.after = after
    this.step()
  }

  private step(): void {
    const l = this.queue.shift()
    if (l) {
      this.line = l
      this.phase = 'line'
      return
    }
    const a = this.after
    if (a.t === 'end') {
      this.line = null
      this.phase = 'ended'
    } else if (a.t === 'open') {
      this.line = null
      this.phase = 'window'
      this.window = a.window
      this.host.open(a.window)
    } else {
      // The last line stays up behind the list (the question being answered).
      this.phase = 'choices'
    }
  }

  /**
   * The greeting, then the topics. The meeting is remembered at once, and so
   * is WHICH greeting was spoken: a greeting about news (`unsaid: [its id]`)
   * is said once, and the everyday one takes over.
   */
  start(): void {
    if (this.phase !== 'idle') return
    const w = this.world
    const b = findBlock(this.conv.greet, w, this.conv.id)
    const lines = b ? b.lines.filter(l => meets(l.when, w, this.conv.id)) : []
    this.host.remember(this.conv.id)
    if (b?.when?.unsaid?.includes(b.id)) this.host.remember(memoryKey(this.conv.id, b.id))
    this.say(lines, { t: 'choices' })
  }

  /** The line was heard: the next one, or whatever follows the last. */
  next(): void {
    if (this.phase === 'line') this.step()
  }

  /** Is this topic on the list right now? */
  private offered(c: ChoiceDef, w: DialogWorld): boolean {
    if (!meets(c.when, w, this.conv.id)) return false
    return !(c.once && w.said.has(memoryKey(this.conv.id, c.id)))
  }

  /** The list as the player sees it, "End" last. */
  choices(): ChoiceView[] {
    const w = this.world
    const node = this.cur
    const out: ChoiceView[] = []
    for (const c of node.choices) {
      if (!this.offered(c, w)) continue
      const locked = lockReasons(c.needs, w, this.conv.id)
      let note = c.note
      if (c.offer) {
        // A purchase: the game's rule prices it and says whether it can be had.
        const o = this.host.offer(c.offer)
        if (!o) continue
        note = { key: 'hud.gold', params: { n: o.price } }
        if (o.block === 'gold') locked.push({ kind: 'gold', n: o.price })
        else if (o.block === 'full') locked.push({ kind: 'full' })
      }
      out.push({
        id: c.id, text: c.line.id, icon: c.icon, tone: c.tone, note, locked,
        // A purchase is made again and again: never "already said".
        used: !c.once && !c.offer && w.said.has(memoryKey(this.conv.id, c.id))
      })
    }
    if (!node.final) out.push({ id: END_CHOICE, text: END_LINE.id, icon: 'end', locked: [], used: false })
    return out
  }

  /** The hero raises a topic. False when it is not on the list or is locked. */
  pick(id: string): boolean {
    if (this.phase !== 'choices') return false
    if (id === END_CHOICE) return this.leave()
    const w = this.world
    const c = this.cur.choices.find(x => x.id === id)
    if (!c || !this.offered(c, w) || !meets(c.needs, w, this.conv.id)) return false

    // A purchase or a decision first: if the rules refuse it, nothing was said.
    if (c.offer && !this.host.buy(c.offer)) return false
    for (const e of c.effects) {
      if (e.t !== 'decide') continue
      if (!this.host.decide(e.quest, e.choice)) return false
      this.decided = { quest: e.quest, choice: e.choice }
    }
    // The answer is chosen by the world as it was when he asked.
    const reply = pickBlock(c.replies, w, this.conv.id)
    this.host.remember(memoryKey(this.conv.id, c.id))
    let open: TalkWindow | '' = ''
    for (const e of c.effects) {
      if (e.t === 'remember') this.host.remember(memoryKey(this.conv.id, e.key))
      else if (e.t === 'gold') this.host.give(e.n, '')
      else if (e.t === 'item') this.host.give(0, e.id)
      else if (e.t === 'hint') this.host.hint(e.quest)
      else if (e.t === 'open') open = e.window
    }
    if (c.goto && this.conv.nodes[c.goto]) this.node = c.goto
    const after: After = open ? { t: 'open', window: open } : c.end ? { t: 'end' } : { t: 'choices' }
    this.say([c.line, ...reply], after)
    return true
  }

  /** The window closed: a word about it, and back to the topics. */
  resume(): void {
    if (this.phase !== 'window') return
    const w = this.window
    this.window = ''
    this.say(w ? pickBlock(this.conv.back[w], this.world, this.conv.id) : [], { t: 'choices' })
  }

  /**
   * End the conversation politely: the hero takes his leave, the other answers.
   * Asked again while the farewell is spoken, it ends at once. Refused inside
   * an irreversible decision.
   */
  leave(): boolean {
    if (this.phase === 'ended' || this.phase === 'idle') return false
    // A second request, or one after a decision (its outcome is being told):
    // no more words.
    if (this.leaving || this.decided) { this.queue.length = 0; this.after = { t: 'end' }; this.step(); return true }
    if (this.cur.final) return false
    if (this.phase === 'window') return false
    this.leaving = true
    this.say([END_LINE, ...pickBlock(this.conv.bye, this.world, this.conv.id)], { t: 'end' })
    return true
  }

  /** May the player walk away right now? */
  canLeave(): boolean {
    return this.phase !== 'ended' && this.phase !== 'idle' && this.phase !== 'window' && !(this.cur.final && !this.decided)
  }

  view(): RunnerView {
    return {
      phase: this.phase,
      line: this.line,
      more: this.queue.length > 0,
      choices: this.phase === 'choices' ? this.choices() : [],
      final: !!this.cur.final && !this.decided,
      leaving: this.leaving,
      window: this.window,
      decided: this.decided
    }
  }
}

/**
 * Has this person something NEW to say: a first meeting, or a one-time topic
 * that is open and was never raised? (The marker over their head.)
 */
export const hasNews = (conv: ConversationDef, w: DialogWorld): boolean => {
  if (!w.said.has(conv.id)) return true
  const root = conv.nodes.root
  if (!root) return false
  return root.choices.some(c => c.once && meets(c.when, w, conv.id) && !w.said.has(memoryKey(conv.id, c.id)))
}
