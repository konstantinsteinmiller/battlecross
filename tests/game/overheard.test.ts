import { describe, expect, it } from 'vitest'
import { Overhearing, PER_PAIR, type OverhearInput } from '@/game/overheard'
import { SMALLTALK, smalltalkOf } from '@/game/data/dialogs/smalltalk'
import { meets } from '@/game/dialog/conditions'
import type { DialogWorld } from '@/game/dialog/types'
import { QUESTS } from '@/game/data/quests'
import { TOWNS, type TownId } from '@/game/data/zones'
import { generateTown } from '@/game/sim/zoneGen'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateTown } from '@/game/sim/director'
import { stepSim } from '@/game/sim/step'
import { createHero } from '@/game/sim/hero'
import { referenceBuild } from '@/game/sim/bot'
import { townChats, townPose, townSay, type TownChat } from '@/game/sim/townLife'
import en from '@/i18n/locales/en'

/**
 * Overheard small talk (roadmap #42): walking past two chatting townsfolk,
 * the hero catches an exchange — a line over each in turn, two or three of
 * them, never the same exchange twice in a visit, never while a conversation
 * or a screen is open.
 */

const world = (flags: string[] = [], quests: Record<string, string> = {}, cleared: string[] = []): DialogWorld => ({
  level: 1, gold: 0, attrs: { str: 0, dex: 0, int: 0, vit: 0, cha: 0 } as never, flags: new Set(flags),
  rep: { order: 0, syndicate: 0, circle: 0 } as never, quests, cleared: new Set(cleared), said: new Set()
})
const textOf = (key: string): string => {
  let o: unknown = en
  for (const part of key.split('.')) o = (o as Record<string, unknown>)?.[part]
  return typeof o === 'string' ? o : ''
}

describe('small talk data', () => {
  const quests = new Set(QUESTS.map(q => q.id))
  const flags = new Set(['oakhavenFallen', ...QUESTS.flatMap(q => q.choices.flatMap(c => c.flags))])
  it('every exchange is two or three short lines, said in turn, starting with the one who began the chat', () => {
    for (const c of SMALLTALK) {
      expect(c.greet.length, c.id).toBeGreaterThanOrEqual(4)
      for (const b of c.greet) {
        expect(b.lines.length, `${c.id}.${b.id}`).toBeGreaterThanOrEqual(2)
        expect(b.lines.length, `${c.id}.${b.id}`).toBeLessThanOrEqual(3)
        b.lines.forEach((l, k) => {
          expect(l.id).toBe(`dlg.${c.id}.${b.id}.${k + 1}`)
          expect(l.by).toBe(k % 2 === 0 ? 'npc' : 'townsfolk')
          const s = textOf(l.id)
          expect(s.length, l.id).toBeGreaterThan(3)
          // Short enough to read in passing, over a head.
          expect(s.length, l.id).toBeLessThanOrEqual(60)
        })
      }
    }
  })

  it('what an exchange waits for exists: real quests and the flags their choices set', () => {
    for (const c of SMALLTALK) {
      for (const b of c.greet) {
        for (const q of Object.keys(b.when?.quest ?? {})) expect(quests.has(q), `${c.id}.${b.id}: quest ${q}`).toBe(true)
        for (const f of [...(b.when?.flags ?? []), ...(b.when?.not ?? [])]) expect(flags.has(f), `${c.id}.${b.id}: flag ${f}`).toBe(true)
      }
    }
  })

  it('every town (and fallen Oakhaven, and its children) has at least three exchanges to overhear', () => {
    for (const [town, w] of [['sunford', world()], ['oakhaven', world()], ['ironhold', world()], ['oakhaven', world(['oakhavenFallen'], { siege: 'betray' })]] as const) {
      for (const kids of [false, true]) {
        const c = smalltalkOf(town, kids)!
        expect(c.greet.filter(b => meets(b.when, w, c.id)).length, `${town}${kids ? ' kids' : ''}`).toBeGreaterThanOrEqual(3)
      }
    }
    // A fallen town talks of nothing else.
    const fallen = smalltalkOf('oakhaven', false)!
    const open = fallen.greet.filter(b => meets(b.when, world(['oakhavenFallen'], { siege: 'betray' }), fallen.id)).map(b => b.id)
    expect(open).toEqual(['ash', 'hide', 'bread'])
  })
})

describe('overhearing a chat', () => {
  const chat: TownChat = { a: 3, b: 4, x: 10, z: 10, kids: false }
  const make = (o: Partial<OverhearInput> = {}): { input: OverhearInput; said: Array<[number, number]> } => {
    const said: Array<[number, number]> = []
    return {
      said,
      input: { visit: 1, town: 'sunford', chats: [chat], hx: 11, hz: 10, quiet: false, world: world(), say: (u, s) => { said.push([u, s]); return true }, text: textOf, ...o }
    }
  }
  /** Run until nothing is said for a while; the exchanges heard, line keys and speakers. */
  const listen = (h: Overhearing, input: OverhearInput, sec: number): Array<Array<[string, number]>> => {
    const out: Array<Array<[string, number]>> = []
    let last = ''
    for (let t = 0; t < sec; t += 0.05) {
      const l = h.step(0.05, input)
      if (l && l.key !== last) {
        const ex = l.key.split('.').slice(0, 3).join('.')
        if (!out.length || out[out.length - 1]![0]![0].split('.').slice(0, 3).join('.') !== ex) out.push([])
        out[out.length - 1]!.push([l.key, l.unit])
      }
      last = l?.key ?? ''
    }
    return out
  }

  it('in reach: an exchange, a line over each in turn; never the same one twice; a few from one pair', () => {
    const h = new Overhearing()
    const { input, said } = make()
    const heard = listen(h, input, 90)
    expect(heard.length).toBe(PER_PAIR)
    const ids = heard.map(e => e[0]![0].split('.').slice(0, 3).join('.'))
    expect(new Set(ids).size).toBe(ids.length)
    for (const e of heard) {
      expect(e.length).toBeGreaterThanOrEqual(2)
      e.forEach(([, unit], k) => expect(unit).toBe(k % 2 === 0 ? chat.a : chat.b))
    }
    // Town life was told who speaks, and for as long as each line is shown.
    expect(said.length).toBe(heard.flat().length)
    expect(said.every(([, s]) => s >= 1)).toBe(true)
  })

  it('out of reach, nothing; walking off stops it', () => {
    const h = new Overhearing()
    const { input } = make({ hx: 20 })
    expect(listen(h, input, 10)).toEqual([])
    const near = make().input
    h.step(0.05, near)
    expect(h.now).not.toBeNull()
    for (let t = 0; t < 1; t += 0.05) h.step(0.05, { ...near, hx: 20 })
    expect(h.now).toBeNull()
  })

  it('a conversation or a screen silences it at once, and what was said stays said', () => {
    const h = new Overhearing()
    const { input } = make()
    h.step(0.05, input)
    const first = h.now!.key
    expect(h.step(0.05, { ...input, quiet: true })).toBeNull()
    const after = listen(h, input, 60).map(e => e[0]![0])
    expect(after).not.toContain(first)
  })

  it('a new visit may say it all again; the children have their own talk', () => {
    const h = new Overhearing()
    const { input } = make()
    const one = listen(h, input, 90).map(e => e[0]![0])
    const two = listen(h, { ...input, visit: 2 }, 90).map(e => e[0]![0])
    expect(two).toEqual(one)
    const kids = listen(new Overhearing(), { ...input, chats: [{ ...chat, kids: true }] }, 30)
    expect(kids[0]![0]![0].startsWith('dlg.smalltalkKids.')).toBe(true)
  })

  it('in a real town: the chats are found, and the one saying a line talks while the other listens', () => {
    const town: TownId = 'sunford'
    const plan = generateTown(TOWNS[town], new Set(), 7)
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'town', zone: town })
    applyPlan(sim, plan)
    createHero(sim, { build: referenceBuild({ cls: 'aegis', level: 1 }).build, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0 })
    populateTown(sim, plan, {})
    let chats: TownChat[] = []
    for (let t = 0; t < 90 && !chats.length; t += 1 / 30) {
      stepSim(sim, plan, 1 / 30)
      sim.events.length = 0
      chats = townChats(sim)
    }
    expect(chats.length).toBeGreaterThan(0)
    const c = chats[0]!
    expect(townSay(sim, c.b, 2)).toBe(true)
    for (let t = 0; t < 0.5; t += 1 / 30) { stepSim(sim, plan, 1 / 30); sim.events.length = 0 }
    expect(townPose(sim, c.b)?.pose === 'talk' || townPose(sim, c.b)?.pose.startsWith('sit')).toBe(true)
    if (townPose(sim, c.a)?.pose !== undefined && !townPose(sim, c.a)!.pose.startsWith('sit')) expect(townPose(sim, c.a)!.pose).toBe('listen')
    // The chat holds while the line is said.
    expect(townChats(sim).some(q => q.a === c.a && q.b === c.b)).toBe(true)
  })
})
