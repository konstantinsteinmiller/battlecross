import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import en from '@/i18n/locales/en'
import { conversation, decision, choiceNeeds } from '@/game/dialog/build'
import { lockReasons, meets } from '@/game/dialog/conditions'
import { dialogLines, linesOf, voicePath } from '@/game/dialog/manifest'
import { graphemes, isDense, revealed, speakSeconds, typeSeconds } from '@/game/dialog/pacing'
import { DialogRunner, END_CHOICE, END_LINE, hasNews } from '@/game/dialog/runner'
import type { Cond, ConversationDef, DialogHost, DialogWorld, Offer, TalkWindow } from '@/game/dialog/types'
import { CONVERSATIONS, SPOKEN, conversationOf, decisionOf } from '@/game/data/dialogs'
import { MANA_OFFER } from '@/game/data/dialogs/shared'
import { QUESTS, QUEST_BY_ID, choiceOpen } from '@/game/data/quests'
import { MAP, TOWNS } from '@/game/data/zones'
import { startAttrs, type AttrBlock } from '@/game/data/attributes'

/**
 * The dialogue engine (pure: no Vue, no scene) and the conversations written
 * for it. The engine half runs against a stand-in host; the data half holds
 * every conversation in the game to the rules the voice-over depends on.
 */

// ─── A stand-in game ─────────────────────────────────────────────────────────

interface Fake extends DialogHost {
  w: { level: number; gold: number; attrs: AttrBlock; flags: Set<string>; rep: Record<'order' | 'syndicate' | 'circle', number>; quests: Record<string, string>; cleared: Set<string>; said: Set<string> }
  log: string[]
  offers: Record<string, Offer | null>
}

const fake = (over: Partial<Fake['w']> = {}): Fake => {
  const w: Fake['w'] = {
    level: 1, gold: 0, attrs: startAttrs(), flags: new Set(), rep: { order: 0, syndicate: 0, circle: 0 }, quests: {},
    cleared: new Set(), said: new Set(), ...over
  }
  const log: string[] = []
  const offers: Record<string, Offer | null> = {}
  return {
    w, log, offers,
    world: () => w,
    remember: (k) => { w.said.add(k) },
    give: (gold, item) => { w.gold += gold; log.push(item ? `item:${item}` : `gold:${gold}`) },
    hint: (q) => { log.push(`hint:${q}`) },
    decide: (q, c) => {
      const def = QUEST_BY_ID[q]?.choices.find(x => x.id === c)
      if (!def || w.quests[q] || !choiceOpen(def, { level: w.level, attrs: w.attrs, flags: w.flags, rep: w.rep })) return false
      w.quests[q] = c
      for (const f of def.flags) w.flags.add(f)
      log.push(`decide:${q}:${c}`)
      return true
    },
    open: (win: TalkWindow) => { log.push(`open:${win}`) },
    offer: id => offers[id] ?? null,
    buy: (id) => { const o = offers[id]; if (!o || o.block) return false; w.gold -= o.price; log.push(`buy:${id}`); return true }
  }
}

/** Hear every line until the runner wants something else. */
const hear = (r: DialogRunner): string[] => {
  const ids: string[] = []
  for (let i = 0; i < 40 && r.view().phase === 'line'; i++) { ids.push(r.view().line!.id); r.next() }
  return ids
}

const smith = conversation('smith', {
  name: 'npc.sunfordSmith.name', look: 'smith', mood: 'gruff',
  greet: [
    { id: 'hello', when: { met: false }, lines: 'nn' },
    { id: 'news', when: { flags: ['kingDead'], unsaid: ['news'] } },
    { id: 'again' }
  ],
  topics: [
    { id: 'trade', say: 'dlg.hero.trade', once: false, icon: 'trade', fx: [{ t: 'open', window: 'shop' }] },
    { id: 'who', lines: 'nhn' },
    { id: 'bribe', needs: { attrs: { cha: 12 } }, fx: [{ t: 'gold', n: 50 }, { t: 'remember', key: 'paid' }] },
    { id: 'secret', when: { said: ['who'] }, goto: 'deeper' },
    { id: 'rumor', once: false, alt: [{ id: 'early', when: { uncleared: ['plains'] } }, { id: 'late' }] }
  ],
  nodes: { deeper: { topics: [{ id: 'more', end: true }] } },
  back: { shop: [{ id: 'shopBack' }] },
  bye: [{ id: 'bye' }]
})

describe('conditions', () => {
  const w: DialogWorld = fake({ level: 5, gold: 100, flags: new Set(['a']), rep: { order: 2, syndicate: -3, circle: 0 }, quests: { siege: 'defend' }, cleared: new Set(['plains']), said: new Set(['smith', 'smith.who', 'other.topic']) }).w

  it('every field given must hold', () => {
    const yes: Cond[] = [
      {}, { flags: ['a'] }, { not: ['b'] }, { quest: { siege: 'defend' } }, { quest: { siege: true } }, { quest: { core: false } },
      { rep: { order: 2 } }, { repMax: { syndicate: -2 } }, { level: 5 }, { attrs: { str: 5 } }, { gold: 100 }, { cleared: ['plains'] },
      { uncleared: ['woods'] }, { said: ['who'] }, { said: ['other.topic'] }, { unsaid: ['rumor'] }, { met: true },
      { any: [{ flags: ['zzz'] }, { level: 2 }] }
    ]
    const no: Cond[] = [
      { flags: ['a', 'b'] }, { not: ['a'] }, { quest: { siege: 'betray' } }, { quest: { siege: false } }, { quest: { core: true } },
      { rep: { order: 3 } }, { repMax: { order: 1 } }, { level: 6 }, { attrs: { str: 6 } }, { gold: 101 }, { cleared: ['woods'] },
      { uncleared: ['plains'] }, { said: ['rumor'] }, { unsaid: ['who'] }, { met: false }, { any: [{ flags: ['zzz'] }, { level: 9 }] },
      { flags: ['a'], level: 9 }
    ]
    for (const c of yes) expect(meets(c, w, 'smith'), JSON.stringify(c)).toBe(true)
    for (const c of no) expect(meets(c, w, 'smith'), JSON.stringify(c)).toBe(false)
    expect(meets(undefined, w, 'smith')).toBe(true)
  })

  it('a locked choice says what is missing, in terms the hero can work on', () => {
    expect(lockReasons({ attrs: { cha: 12 }, level: 9, rep: { circle: 2 }, gold: 500 }, w, 'smith')).toEqual([
      { kind: 'level', n: 9 }, { kind: 'attr', attr: 'cha', n: 12 }, { kind: 'rep', faction: 'circle', n: 2 }, { kind: 'gold', n: 500 }
    ])
    expect(lockReasons({ attrs: { str: 5 } }, w, 'smith')).toEqual([])
    expect(lockReasons({ flags: ['nope'] }, w, 'smith')).toEqual([{ kind: 'other' }])
  })
})

describe('the runner', () => {
  it('a first meeting is greeted as one, a later one differently, and news is told once', () => {
    const h = fake()
    let r = new DialogRunner(smith, h)
    r.start()
    expect(hear(r)).toEqual(['dlg.smith.hello.1', 'dlg.smith.hello.2'])
    expect(h.w.said.has('smith')).toBe(true)

    r = new DialogRunner(smith, h)
    r.start()
    expect(hear(r)).toEqual(['dlg.smith.again.1'])

    h.w.flags.add('kingDead')
    r = new DialogRunner(smith, h)
    r.start()
    expect(hear(r)).toEqual(['dlg.smith.news.1'])
    r = new DialogRunner(smith, h)
    r.start()
    expect(hear(r)).toEqual(['dlg.smith.again.1'])
  })

  it('the list holds the open topics, "End" last; the hero speaks his choice, then the answer', () => {
    const h = fake()
    const r = new DialogRunner(smith, h)
    r.start()
    hear(r)
    expect(r.view().phase).toBe('choices')
    expect(r.view().choices.map(c => c.id)).toEqual(['trade', 'who', 'bribe', 'rumor', END_CHOICE])
    expect(r.pick('who')).toBe(true)
    expect(r.view().line).toMatchObject({ id: 'dlg.smith.who.say', by: 'hero' })
    expect(hear(r)).toEqual(['dlg.smith.who.say', 'dlg.smith.who.1', 'dlg.smith.who.2', 'dlg.smith.who.3'])
    expect(smith.nodes.root!.choices.find(c => c.id === 'who')!.replies[0]!.lines.map(l => l.by)).toEqual(['npc', 'hero', 'npc'])
  })

  it('a one-time topic leaves the list; a permanent one stays, marked as used; a new one appears when its condition comes true', () => {
    const h = fake()
    const r = new DialogRunner(smith, h)
    r.start()
    hear(r)
    r.pick('who')
    hear(r)
    r.pick('rumor')
    expect(hear(r)).toEqual(['dlg.smith.rumor.say', 'dlg.smith.rumor.early.1'])
    const list = r.view().choices
    expect(list.map(c => c.id)).toEqual(['trade', 'bribe', 'secret', 'rumor', END_CHOICE])
    expect(list.find(c => c.id === 'rumor')!.used).toBe(true)
    expect(list.find(c => c.id === 'trade')!.used).toBe(false)
    // The answer follows the world.
    h.w.cleared.add('plains')
    r.pick('rumor')
    expect(hear(r)).toEqual(['dlg.smith.rumor.say', 'dlg.smith.rumor.late.1'])
  })

  it('a locked choice is shown with its reason and cannot be picked; once the hero qualifies it pays out once', () => {
    const h = fake()
    const r = new DialogRunner(smith, h)
    r.start()
    hear(r)
    expect(r.view().choices.find(c => c.id === 'bribe')!.locked).toEqual([{ kind: 'attr', attr: 'cha', n: 12 }])
    expect(r.pick('bribe')).toBe(false)
    expect(h.w.gold).toBe(0)
    h.w.attrs.cha = 12
    expect(r.view().choices.find(c => c.id === 'bribe')!.locked).toEqual([])
    expect(r.pick('bribe')).toBe(true)
    expect(h.w.gold).toBe(50)
    expect(h.w.said.has('smith.paid')).toBe(true)
    hear(r)
    expect(r.view().choices.map(c => c.id)).not.toContain('bribe')
    expect(r.pick('bribe')).toBe(false)
    expect(h.w.gold).toBe(50)
  })

  it('a topic opens a window after its answer; the talk waits, then goes on with a parting word', () => {
    const h = fake()
    const r = new DialogRunner(smith, h)
    r.start()
    hear(r)
    r.pick('trade')
    expect(h.log).toEqual([])
    expect(hear(r)).toEqual(['dlg.hero.trade', 'dlg.smith.trade.1'])
    expect(r.view()).toMatchObject({ phase: 'window', window: 'shop' })
    expect(h.log).toEqual(['open:shop'])
    expect(r.leave()).toBe(false)
    r.resume()
    expect(hear(r)).toEqual(['dlg.smith.shopBack.1'])
    expect(r.view().phase).toBe('choices')
  })

  it('a topic can lead to another list, and end the conversation', () => {
    const h = fake({ said: new Set(['smith', 'smith.who']) })
    const r = new DialogRunner(smith, h)
    r.start()
    hear(r)
    r.pick('secret')
    hear(r)
    expect(r.view().choices.map(c => c.id)).toEqual(['more', END_CHOICE])
    r.pick('more')
    hear(r)
    expect(r.view().phase).toBe('ended')
  })

  it('leaving is polite: the hero takes his leave, the other answers — and asking twice ends it at once', () => {
    const h = fake()
    let r = new DialogRunner(smith, h)
    r.start()
    hear(r)
    expect(r.pick(END_CHOICE)).toBe(true)
    expect(r.view().leaving).toBe(true)
    expect(hear(r)).toEqual([END_LINE.id, 'dlg.smith.bye.1'])
    expect(r.view().phase).toBe('ended')

    // Mid-greeting, too.
    r = new DialogRunner(smith, h)
    r.start()
    expect(r.canLeave()).toBe(true)
    expect(r.leave()).toBe(true)
    expect(r.view().line!.id).toBe(END_LINE.id)
    expect(r.leave()).toBe(true)
    expect(r.view().phase).toBe('ended')
    expect(r.leave()).toBe(false)
  })

  it('something new to say: a first meeting, or an open one-time topic never raised', () => {
    const h = fake()
    expect(hasNews(smith, h.w)).toBe(true)
    h.w.said = new Set(['smith', 'smith.who', 'smith.bribe', 'smith.secret'])
    expect(hasNews(smith, h.w)).toBe(false)
    h.w.said.delete('smith.who')
    expect(hasNews(smith, h.w)).toBe(true)
  })

  it('a purchase shows its price, locks when it cannot be had, hides when nothing is sold, and never counts as "said"', () => {
    const conv = conversation('nurse', {
      name: 'npc.sunfordHealer.name', look: 'healer',
      greet: [{ id: 'hi' }], topics: [{ id: 'mana', once: false, offer: MANA_OFFER, icon: 'buy' }], bye: [{ id: 'bye' }]
    })
    const h = fake({ gold: 100 })
    const r = new DialogRunner(conv, h)
    r.start()
    hear(r)
    expect(r.view().choices.map(c => c.id)).toEqual([END_CHOICE])

    h.offers[MANA_OFFER] = { price: 40, block: '' }
    expect(r.view().choices[0]).toMatchObject({ id: 'mana', locked: [], note: { key: 'hud.gold', params: { n: 40 } } })
    expect(r.pick('mana')).toBe(true)
    expect(h.log).toEqual([`buy:${MANA_OFFER}`])
    expect(h.w.gold).toBe(60)
    hear(r)
    expect(r.view().choices[0]).toMatchObject({ id: 'mana', used: false })

    h.offers[MANA_OFFER] = { price: 40, block: 'gold' }
    expect(r.view().choices[0]!.locked).toEqual([{ kind: 'gold', n: 40 }])
    expect(r.pick('mana')).toBe(false)
    h.offers[MANA_OFFER] = { price: 40, block: 'full' }
    expect(r.view().choices[0]!.locked).toEqual([{ kind: 'full' }])
    expect(h.w.gold).toBe(60)
  })
})

describe('a quest decision as a conversation', () => {
  const king = decision(QUEST_BY_ID.goblinKing!, { name: 'enemy.goblinKing', ask: 'nn', results: { slay: 'xx', pact: 'nx' } })

  it('puts the question, then offers exactly the quest table\'s choices, with their tones, locks and gold', () => {
    const h = fake()
    const r = new DialogRunner(king, h)
    r.start()
    expect(hear(r)).toEqual(['dlg.quest.goblinKing.ask.1', 'dlg.quest.goblinKing.ask.2'])
    const v = r.view()
    expect(v.final).toBe(true)
    expect(v.choices.map(c => c.id)).toEqual(['slay', 'pact', 'ransom'])
    expect(v.choices.map(c => c.tone)).toEqual(['noble', 'cunning', 'ruthless'])
    expect(v.choices[1]!.locked).toEqual([{ kind: 'attr', attr: 'cha', n: 8 }])
    expect(v.choices[0]!.note).toEqual({ key: 'quest.gold', params: { n: 120 } })
    expect(v.choices[1]!.note).toBeUndefined()
  })

  it('cannot be left open, refuses a locked choice, is decided once, and then tells what follows', () => {
    const h = fake()
    const r = new DialogRunner(king, h)
    r.start()
    expect(r.canLeave()).toBe(false)
    expect(r.leave()).toBe(false)
    hear(r)
    expect(r.leave()).toBe(false)
    expect(r.pick(END_CHOICE)).toBe(false)
    expect(r.pick('pact')).toBe(false)
    expect(h.w.quests).toEqual({})

    expect(r.pick('slay')).toBe(true)
    expect(h.log).toEqual(['decide:goblinKing:slay'])
    expect(r.view().decided).toEqual({ quest: 'goblinKing', choice: 'slay' })
    expect(r.view().final).toBe(false)
    // Decided: nothing else can be picked any more.
    expect(r.pick('ransom')).toBe(false)
    expect(hear(r)).toEqual(['dlg.quest.goblinKing.slay.say', 'dlg.quest.goblinKing.slay.1', 'dlg.quest.goblinKing.slay.2'])
    expect(r.view().phase).toBe('ended')
    expect(king.nodes.root!.choices[0]!.replies[0]!.lines.map(l => l.by)).toEqual(['narrator', 'narrator'])

    // A second conversation about a decided quest decides nothing.
    const again = new DialogRunner(king, h)
    again.start()
    hear(again)
    expect(again.pick('ransom')).toBe(false)
    expect(h.w.quests).toEqual({ goblinKing: 'slay' })
  })

  it('a choice\'s requirement is the quest table\'s own', () => {
    for (const q of QUESTS) {
      for (const c of q.choices) {
        const need = choiceNeeds(c)
        const poor = { level: 1, attrs: startAttrs(), flags: new Set<string>(), rep: { order: 0, syndicate: 0, circle: 0 } }
        expect(meets(need, fake().w, `quest.${q.id}`), `${q.id}.${c.id}`).toBe(choiceOpen(c, poor))
        const rich = fake({ level: 30, attrs: { str: 40, dex: 40, int: 40, end: 40, skl: 40, cha: 40 }, rep: { order: 5, syndicate: 5, circle: 5 } }).w
        expect(meets(need, rich, `quest.${q.id}`), `${q.id}.${c.id}`).toBe(true)
      }
    }
  })
})

describe('building a conversation', () => {
  it('refuses two blocks under one id (two texts would share a line id)', () => {
    expect(() => conversation('x', { name: 'n', look: 'l', greet: [{ id: 'a' }], topics: [{ id: 'a' }], bye: [] })).toThrow(/used twice/)
    expect(() => conversation('x', { name: 'n', look: 'l', greet: [{ id: 'a', lines: 'nq' }], topics: [], bye: [] })).toThrow(/speaker/)
  })
})

describe('pacing a line without a recording', () => {
  it('reveals by whole characters, at reading speed, slower for dense scripts', () => {
    expect(graphemes('ab👍🏽c').length).toBe(4)
    expect(isDense('こんにちは')).toBe(true)
    expect(isDense('Hello')).toBe(false)
    expect(typeSeconds('x'.repeat(46))).toBeCloseTo(1, 5)
    expect(typeSeconds('あ'.repeat(22))).toBeCloseTo(1, 5)
    expect(revealed('hello world', 0)).toBe(0)
    expect(revealed('hello world', 0.1)).toBe(4)
    expect(speakSeconds('No.')).toBeGreaterThanOrEqual(1.1)
    expect(speakSeconds('x'.repeat(400))).toBeLessThanOrEqual(9)
    expect(speakSeconds('x'.repeat(80))).toBeGreaterThan(speakSeconds('x'.repeat(30)))
  })
})

// ─── The conversations of the game ───────────────────────────────────────────

const text = (key: string): unknown => {
  let cur: unknown = en
  for (const part of key.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return cur
}

/** A world in which a condition holds (as strong a hero as it takes). */
const worldFor = (conv: string, ...conds: Array<Cond | undefined>): DialogWorld => {
  const h = fake({ level: 30, gold: 1e9, attrs: { str: 99, dex: 99, int: 99, end: 99, skl: 99, cha: 99 }, rep: { order: 0, syndicate: 0, circle: 0 } })
  const apply = (c: Cond | undefined): void => {
    if (!c) return
    for (const f of c.flags ?? []) h.w.flags.add(f)
    for (const q in c.quest) { const v = c.quest[q]; if (typeof v === 'string') h.w.quests[q] = v; else if (v) h.w.quests[q] = QUEST_BY_ID[q]!.choices[0]!.id }
    for (const f in c.rep) h.w.rep[f as 'order'] = Math.max(h.w.rep[f as 'order'], c.rep[f as 'order']!)
    for (const f in c.repMax) h.w.rep[f as 'order'] = Math.min(h.w.rep[f as 'order'], c.repMax[f as 'order']!)
    for (const n of c.cleared ?? []) h.w.cleared.add(n)
    for (const k of c.said ?? []) h.w.said.add(k.includes('.') ? k : `${conv}.${k}`)
    if (c.met) h.w.said.add(conv)
    if (c.any?.length) apply(c.any[0])
  }
  for (const c of conds) apply(c)
  return h.w
}

describe('every conversation in the game', () => {
  // Every line spoken, small talk included.
  const all = SPOKEN.flatMap(c => linesOf(c).map(l => ({ c, l })))

  it('everyone has one: each townsperson, each hidden trainer, each quest', () => {
    for (const town of Object.values(TOWNS)) for (const n of town.npcs) expect(conversationOf(n.id), n.id).toBeTruthy()
    for (const n of MAP) if (n.trainer) expect(conversationOf(n.trainer.npc), n.trainer.npc).toBeTruthy()
    for (const q of QUESTS) expect(decisionOf(q.id), q.id).toBeTruthy()
    expect(new Set(CONVERSATIONS.map(c => c.id)).size).toBe(CONVERSATIONS.length)
  })

  it('every line id is a `dlg.` key with English text, and belongs to one conversation only (or is the hero\'s shared line)', () => {
    const missing: string[] = []
    const owner = new Map<string, string>()
    const stray: string[] = []
    for (const { c, l } of all) {
      if (typeof text(l.id) !== 'string' || !(text(l.id) as string).trim()) missing.push(l.id)
      if (l.id.startsWith('dlg.hero.')) { if (l.by !== 'hero') stray.push(l.id); continue }
      if (!l.id.startsWith(`dlg.${c.id}.`)) stray.push(l.id)
      if (owner.has(l.id) && owner.get(l.id) !== c.id) stray.push(l.id)
      owner.set(l.id, c.id)
    }
    expect(missing).toEqual([])
    expect(stray).toEqual([])
    expect(typeof text(END_LINE.id)).toBe('string')
  })

  it('within a conversation no line id is used twice (one id, one text, one recording)', () => {
    const dup: string[] = []
    for (const c of CONVERSATIONS) {
      const seen = new Set<string>()
      for (const l of linesOf(c)) {
        // The hero's stock lines may be the label of several topics.
        if (l.id.startsWith('dlg.hero.')) continue
        if (seen.has(l.id)) dup.push(l.id)
        seen.add(l.id)
      }
    }
    expect(dup).toEqual([])
  })

  it('no English line is left over: every `dlg` text is spoken somewhere', () => {
    const used = new Set(all.map(x => x.l.id))
    used.add(END_LINE.id)
    const unused: string[] = []
    const walk = (node: unknown, key: string): void => {
      if (typeof node === 'string') { if (!used.has(key)) unused.push(key); return }
      for (const k in node as Record<string, unknown>) walk((node as Record<string, unknown>)[k], `${key}.${k}`)
    }
    const dlg = (en as unknown as { dlg: Record<string, unknown> }).dlg
    for (const k in dlg) if (k !== 'ui') walk(dlg[k], `dlg.${k}`)
    expect(unused).toEqual([])
  })

  it('lines are whole, short sentences: no placeholders, none over 120 characters, nine in ten under 90', () => {
    const texts = [...new Set(all.map(x => x.l.id))].map(id => ({ id, s: String(text(id) ?? '') }))
    expect(texts.filter(x => /[{}]/.test(x.s)).map(x => x.id)).toEqual([])
    expect(texts.filter(x => x.s.length > 120).map(x => `${x.id} (${x.s.length})`)).toEqual([])
    expect(texts.filter(x => !/[.!?…]$/.test(x.s)).map(x => x.id)).toEqual([])
    expect(texts.filter(x => x.s.length <= 90).length / texts.length).toBeGreaterThan(0.9)
  })

  it('every speaker named by a conversation has a name in English, and a look', () => {
    for (const c of CONVERSATIONS) {
      expect(typeof text(c.name), `${c.id}: ${c.name}`).toBe('string')
      expect(c.look, c.id).toBeTruthy()
    }
  })

  it('every topic can come up: its conditions can be met, and its list can be reached', () => {
    const unreachable: string[] = []
    for (const c of CONVERSATIONS) {
      const targets = new Set(['root'])
      for (const n of Object.values(c.nodes)) for (const ch of n.choices) if (ch.goto) targets.add(ch.goto)
      for (const n of Object.values(c.nodes)) {
        if (!targets.has(n.id)) unreachable.push(`${c.id}: list "${n.id}"`)
        for (const ch of n.choices) {
          const w = worldFor(c.id, ch.when, ch.needs)
          if (!meets(ch.when, w, c.id) || !meets(ch.needs, w, c.id)) unreachable.push(`${c.id}.${ch.id}`)
          if (ch.goto && !c.nodes[ch.goto]) unreachable.push(`${c.id}.${ch.id} → ${ch.goto}`)
          // Every alternative answer but the last needs a condition, or the rest is dead text.
          ch.replies.slice(0, -1).forEach((b) => { if (!b.when) unreachable.push(`${c.id}.${ch.id}.${b.id} hides what follows it`) })
          for (const b of ch.replies) if (!meets(b.when, worldFor(c.id, ch.when, b.when), c.id)) unreachable.push(`${c.id}.${ch.id}.${b.id}`)
        }
      }
      c.greet.slice(0, -1).forEach((b) => { if (!b.when) unreachable.push(`${c.id}.${b.id} hides the greetings after it`) })
    }
    expect(unreachable).toEqual([])
  })

  it('every greeting, answer and farewell has something to say in any world', () => {
    const silent: string[] = []
    for (const c of CONVERSATIONS) {
      if (c.greet.length && c.greet[c.greet.length - 1]!.when) silent.push(`${c.id}: no unconditional greeting`)
      for (const n of Object.values(c.nodes)) for (const ch of n.choices) if (ch.replies[ch.replies.length - 1]?.when) silent.push(`${c.id}.${ch.id}: no fallback answer`)
    }
    expect(silent).toEqual([])
  })

  it('every conversation can be ended, in a fresh world and in a finished one', () => {
    const worlds: Array<() => Fake> = [
      () => fake(),
      () => fake({ cleared: new Set(['plains']) }),
      () => fake({ level: 30, flags: new Set(['goblinPact', 'arenaOpen', 'oakhavenSaved', 'coreOrder', 'oracleFreed', 'dragonPact', 'throneDone', 'endOrder']), quests: { goblinKing: 'pact', siege: 'defend', core: 'destroy', oracle: 'free', dragon: 'pact', throne: 'order' }, rep: { order: 5, syndicate: -4, circle: 3 } }),
      () => fake({ level: 30, flags: new Set(['goblinSlain', 'arenaOpen', 'oakhavenFallen', 'coreSold', 'oracleSlain', 'dragonSlain', 'throneDone', 'endSyndicate']), quests: { goblinKing: 'slay', siege: 'betray', core: 'sell', oracle: 'slay', dragon: 'slay', throne: 'syndicate' }, rep: { order: -5, syndicate: 5, circle: -3 } })
    ]
    for (const c of CONVERSATIONS) {
      for (const make of worlds) {
        const h = make()
        const quest = c.id.startsWith('quest.') ? c.id.slice(6) : ''
        if (quest) delete h.w.quests[quest]
        const r = new DialogRunner(c, h)
        r.start()
        hear(r)
        expect(r.view().phase, c.id).toBe('choices')
        const list = r.view().choices
        expect(list.length, c.id).toBeGreaterThan(0)
        if (quest) {
          // A decision: no way out but a choice, and at least one is always open.
          expect(list.some(x => x.id === END_CHOICE), c.id).toBe(false)
          const open = list.find(x => !x.locked.length)
          expect(open, c.id).toBeTruthy()
          expect(r.pick(open!.id)).toBe(true)
        } else {
          expect(list[list.length - 1]!.id, c.id).toBe(END_CHOICE)
          expect(r.pick(END_CHOICE)).toBe(true)
        }
        hear(r)
        expect(r.view().phase, c.id).toBe('ended')
      }
    }
  })

  it('every open topic can be raised and leads back to the list, a window or the end', () => {
    for (const c of CONVERSATIONS) {
      if (c.id.startsWith('quest.')) continue
      for (const ch of c.nodes.root!.choices) {
        const h = fake()
        Object.assign(h.w, worldFor(c.id, ch.when, ch.needs))
        if (ch.offer) h.offers[ch.offer] = { price: 10, block: '' }
        const r = new DialogRunner(c, h)
        r.start()
        hear(r)
        expect(r.pick(ch.id), `${c.id}.${ch.id}`).toBe(true)
        const said = hear(r)
        expect(said[0], `${c.id}.${ch.id}`).toBe(ch.line.id)
        expect(said.length, `${c.id}.${ch.id} has an answer`).toBeGreaterThan(1)
        expect(['choices', 'window', 'ended'], `${c.id}.${ch.id}`).toContain(r.view().phase)
        if (r.view().phase === 'window') {
          r.resume()
          expect(hear(r).length, `${c.id}: a word when the ${r.view().window} closes`).toBeGreaterThan(0)
          expect(r.view().phase).toBe('choices')
        }
      }
    }
  })

  it('a townsperson\'s trade is one of their topics: shops trade, trainers teach, healers heal and sell mana, quest givers tell of the quest', () => {
    const opens = (c: ConversationDef): string[] => c.nodes.root!.choices.flatMap(ch => ch.effects.filter(e => e.t === 'open').map(e => (e as { window: string }).window))
    const people = [...Object.values(TOWNS).flatMap(t => t.npcs), ...MAP.filter(n => n.trainer).map(n => ({ id: n.trainer!.npc, role: 'trainer' as const, quest: undefined }))]
    for (const n of people) {
      const c = conversationOf(n.id)!
      if (n.role === 'shop') expect(opens(c), n.id).toEqual(['shop'])
      if (n.role === 'trainer') expect(opens(c), n.id).toEqual(['trainer'])
      if (n.role === 'healer') {
        expect(opens(c), n.id).toEqual(['healer'])
        expect(c.nodes.root!.choices.some(ch => ch.offer === MANA_OFFER), n.id).toBe(true)
      }
      if (n.role === 'talk') expect(c.nodes.root!.choices.length, n.id).toBeGreaterThanOrEqual(2)
      if (n.quest) {
        const tells = c.nodes.root!.choices.find(ch => ch.effects.some(e => e.t === 'hint' && e.quest === n.quest))
        expect(tells, n.id).toBeTruthy()
        // Told only while it is undecided; afterwards they speak of what was chosen.
        expect(tells!.when?.quest?.[n.quest]).toBe(false)
      }
      // Every window a conversation opens has its parting line.
      for (const w of opens(c)) expect(c.back[w as TalkWindow]?.length, `${n.id}: back from ${w}`).toBeGreaterThan(0)
      expect(c.bye.length, n.id).toBeGreaterThan(0)
    }
  })

  it('a decision conversation offers the quest\'s choices and nothing else, each applying its own', () => {
    for (const q of QUESTS) {
      const c = decisionOf(q.id)!
      expect(c.look).toBe(q.speaker)
      expect(c.nodes.root!.final).toBe(true)
      expect(c.nodes.root!.choices.map(x => x.id)).toEqual(q.choices.map(x => x.id))
      for (const ch of c.nodes.root!.choices) {
        expect(ch.effects).toEqual([{ t: 'decide', quest: q.id, choice: ch.id }])
        expect(ch.end).toBe(true)
        expect(ch.tone).toBe(q.choices.find(x => x.id === ch.id)!.tone)
      }
    }
  })

  it('the world\'s turns are spoken of: each of the six decisions and the ending changes what somebody says', () => {
    const conds: Cond[] = []
    const collect = (c: Cond | undefined): void => { if (c) { conds.push(c); c.any?.forEach(collect) } }
    for (const c of CONVERSATIONS) {
      if (c.id.startsWith('quest.')) continue
      c.greet.forEach(b => collect(b.when))
      for (const n of Object.values(c.nodes)) for (const ch of n.choices) { collect(ch.when); ch.replies.forEach(b => collect(b.when)) }
    }
    const flags = new Set(conds.flatMap(c => [...(c.flags ?? []), ...(c.not ?? [])]))
    const quests = new Set(conds.flatMap(c => Object.keys(c.quest ?? {})))
    const mentions = (q: string): boolean => quests.has(q) || QUEST_BY_ID[q]!.choices.some(ch => ch.flags.some(f => flags.has(f)))
    for (const q of QUESTS) expect(mentions(q.id), q.id).toBe(true)
    expect(flags.has('throneDone')).toBe(true)
    // Friend and foe of a faction are greeted differently.
    expect(conds.some(c => c.rep)).toBe(true)
    expect(conds.some(c => c.repMax)).toBe(true)
  })
})

describe('the voice manifest', () => {
  const manifest = dialogLines(SPOKEN, id => String(text(id) ?? ''))

  it('lists every line once, with its speaker, its English text and where its recording goes', () => {
    const ids = new Set(SPOKEN.flatMap(c => linesOf(c).map(l => l.id)))
    ids.add(END_LINE.id)
    expect(manifest.length).toBe(ids.size)
    expect(new Set(manifest.map(m => m.id)).size).toBe(manifest.length)
    for (const m of manifest) {
      expect(ids.has(m.id), m.id).toBe(true)
      expect(m.text.length, m.id).toBeGreaterThan(0)
      expect(m.file).toBe(`public/audio/voice/en/${m.id}.ogg`)
      expect(m.speaker, m.id).toBeTruthy()
      expect(m.emotion, m.id).toBeTruthy()
    }
    expect(voicePath('de', 'dlg.hero.bye')).toBe('audio/voice/de/dlg.hero.bye.ogg')
  })

  it('the file on disk (`pnpm voice:manifest`) is the one the game would write today', () => {
    const file = JSON.parse(readFileSync(resolve(__dirname, '../../data/voice-manifest.json'), 'utf8')) as { count: number; lines: Array<{ id: string; speaker: string; text: string; file: string }> }
    expect(file.count).toBe(manifest.length)
    expect(file.lines.map(l => [l.id, l.speaker, l.text, l.file])).toEqual(manifest.map(m => [m.id, m.speaker, m.text, m.file]))
  })

  it('names the voice: the hero, the storyteller, or the PERSON who speaks (two smiths share a look, not a voice)', () => {
    const by = (id: string) => manifest.find(m => m.id === id)!
    expect(by('dlg.hero.trade')).toMatchObject({ speaker: 'hero', scene: 'hero' })
    expect(by('dlg.sunfordSmith.hello.1')).toMatchObject({ speaker: 'sunfordSmith', look: 'smith', scene: 'sunfordSmith', emotion: 'gruff', name: 'npc.sunfordSmith.name' })
    expect(by('dlg.ironArmor.hello.1')).toMatchObject({ speaker: 'ironArmor', look: 'smith' })
    // One person, two conversations: Odo before and after the siege; Dorn in town and in the mines.
    expect(by('dlg.oakMasterArmorer.hello.1').speaker).toBe(by('dlg.oakArmorer.hello.1').speaker)
    expect(by('dlg.exiledSovereign.hello.1').speaker).toBe('trainerSovereign')
    expect(by('dlg.quest.core.ask.1').speaker).toBe('forgemaster')
    expect(by('dlg.elderMara.quest.2')).toMatchObject({ speaker: 'hero', scene: 'elderMara' })
    expect(by('dlg.quest.goblinKing.ask.1')).toMatchObject({ speaker: 'goblinKing', scene: 'quest.goblinKing' })
    expect(by('dlg.quest.goblinKing.slay.1')).toMatchObject({ speaker: 'narrator' })
    expect(by('dlg.quest.goblinKing.slay.say')).toMatchObject({ speaker: 'hero' })
  })
})
