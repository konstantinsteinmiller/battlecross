import { describe, expect, it } from 'vitest'
import { CLASS_IDS, type ClassId } from '@/game/data/skills'
import { MAP, NODE_BY_ID, TOWNS, hiddenTrainerOf, nodeOpen, townNpcs, type NodeId, type TownId } from '@/game/data/zones'
import { ITEM_BY_ID } from '@/game/data/items'
import { EPILOGUE_FLAGS, FACTIONS, QUESTS, QUEST_BY_ID, REP_MAX, REP_MIN, choiceOpen, endingOf, questOfNode, type ChoiceDef, type QuestHero } from '@/game/data/quests'
import { startAttrs } from '@/game/data/attributes'

/**
 * Consequential quests (GDD §3.2): decisions permanently change who trades
 * and teaches where. The rule that must hold in EVERY world the player can
 * make: nothing they chose can lock a class out for good.
 */

const ALL_NODES = new Set(MAP.map(n => n.id))

/** Every combination of one choice per quest (3·2·3·2·2·5 = 360 worlds). */
const worlds = (): Array<{ picks: Record<string, string>; flags: Set<string> }> => {
  let acc: Array<{ picks: Record<string, string>; flags: Set<string> }> = [{ picks: {}, flags: new Set() }]
  for (const q of QUESTS) {
    const next: typeof acc = []
    for (const w of acc) for (const c of q.choices) next.push({ picks: { ...w.picks, [q.id]: c.id }, flags: new Set([...w.flags, ...c.flags]) })
    acc = next
  }
  return acc
}

const trainersIn = (flags: ReadonlySet<string>): Set<ClassId> => {
  const out = new Set<ClassId>()
  for (const town of Object.keys(TOWNS) as TownId[]) for (const n of townNpcs(town, flags)) if (n.role === 'trainer' && n.cls) out.add(n.cls)
  for (const n of MAP) {
    const t = hiddenTrainerOf(n.id, ALL_NODES, flags)
    if (t) out.add(t.cls)
  }
  return out
}

describe('the six decisions', () => {
  it('are the six of the plan, each decided at the end of a zone that exists', () => {
    expect(QUESTS.map(q => q.id)).toEqual(['goblinKing', 'siege', 'core', 'oracle', 'dragon', 'throne'])
    for (const q of QUESTS) {
      expect(NODE_BY_ID[q.node]?.kind, q.id).toBe('zone')
      expect(NODE_BY_ID[q.node]?.quest, q.id).toBe(q.id)
      expect(questOfNode(q.node)?.id).toBe(q.id)
      expect(q.choices.length, q.id).toBeGreaterThanOrEqual(2)
      // Never a dead end: at least one option needs nothing.
      expect(q.choices.some(c => !c.needs), q.id).toBe(true)
      for (const c of q.choices) if (c.item) expect(ITEM_BY_ID[c.item], `${q.id}.${c.id}`).toBeDefined()
    }
  })

  it('the Siege of Oakhaven is the GDD\'s example, to the letter', () => {
    const q = QUEST_BY_ID.siege!
    const defend = q.choices.find(c => c.id === 'defend')!
    const betray = q.choices.find(c => c.id === 'betray')!
    // A: a prosperous trade hub with high-tier armourers; the Syndicate turns hostile.
    expect(defend.flags).toEqual(['oakhavenSaved'])
    expect(defend.rep!.syndicate).toBeLessThanOrEqual(-2)
    const saved = townNpcs('oakhaven', new Set(defend.flags))
    const armorer = saved.find(n => n.role === 'shop' && n.stock!.slots.includes('body'))!
    expect(Math.max(...armorer.stock!.tiers)).toBeGreaterThanOrEqual(5)
    expect(saved.some(n => n.cls === 'blood')).toBe(false)
    // B: a ruin with a black market and the Blood Alchemist; armour merchants are gone.
    expect(betray.flags).toEqual(['oakhavenFallen'])
    const fallen = townNpcs('oakhaven', new Set(betray.flags))
    expect(fallen.some(n => n.role === 'trainer' && n.cls === 'blood')).toBe(true)
    expect(fallen.some(n => n.id === 'blackMarket')).toBe(true)
    expect(fallen.some(n => n.role === 'shop' && n.stock!.slots.includes('body'))).toBe(false)
  })

  it('gates the silver-tongued and the learned options behind the attribute they name', () => {
    const hero = (over: Partial<QuestHero> = {}): QuestHero => ({ level: 1, attrs: startAttrs(), flags: new Set(), rep: { order: 0, syndicate: 0, circle: 0 }, ...over })
    const pick = (q: string, c: string): ChoiceDef => QUEST_BY_ID[q]!.choices.find(x => x.id === c)!
    expect(choiceOpen(pick('goblinKing', 'pact'), hero())).toBe(false)
    expect(choiceOpen(pick('goblinKing', 'pact'), hero({ attrs: { ...startAttrs(), cha: 8 } }))).toBe(true)
    expect(choiceOpen(pick('core', 'study'), hero({ attrs: { ...startAttrs(), int: 17 } }))).toBe(false)
    expect(choiceOpen(pick('core', 'study'), hero({ attrs: { ...startAttrs(), int: 18 } }))).toBe(true)
    expect(choiceOpen(pick('dragon', 'pact'), hero({ attrs: { ...startAttrs(), cha: 25 } }))).toBe(true)
    expect(choiceOpen(pick('throne', 'order'), hero())).toBe(false)
    expect(choiceOpen(pick('throne', 'order'), hero({ rep: { order: 2, syndicate: 0, circle: 0 } }))).toBe(true)
    expect(choiceOpen(pick('throne', 'claim'), hero({ level: 27 }))).toBe(false)
    expect(choiceOpen(pick('throne', 'claim'), hero({ level: 28 }))).toBe(true)
    expect(choiceOpen(pick('throne', 'shatter'), hero())).toBe(true)
  })

  it('reputation a choice hands out stays inside the scale', () => {
    for (const q of QUESTS) for (const c of q.choices) for (const f of FACTIONS) {
      const v = c.rep?.[f] ?? 0
      expect(v, `${q.id}.${c.id}.${f}`).toBeGreaterThanOrEqual(REP_MIN)
      expect(v, `${q.id}.${c.id}.${f}`).toBeLessThanOrEqual(REP_MAX)
    }
  })

  it('every throne choice ends the story, each in its own way', () => {
    const endings = QUEST_BY_ID.throne!.choices.map(c => endingOf(new Set(c.flags)))
    expect(endings.sort()).toEqual(['circle', 'free', 'order', 'syndicate', 'unbound'])
    for (const c of QUEST_BY_ID.throne!.choices) expect(c.flags).toContain('throneDone')
    expect(endingOf(new Set())).toBe('')
  })

  it('the epilogue has a line for every lasting choice before the throne', () => {
    const flags = new Set(QUESTS.filter(q => q.id !== 'throne').flatMap(q => q.choices.flatMap(c => c.flags)))
    flags.delete('arenaOpen')
    expect([...flags].sort()).toEqual([...EPILOGUE_FLAGS].sort())
  })
})

describe('in every world the player can make', () => {
  const all = worlds()

  it('there are 360 of them', () => { expect(all).toHaveLength(360) })

  it('all eight classes still have a trainer somewhere', () => {
    const broken: string[] = []
    for (const w of all) {
      const got = trainersIn(w.flags)
      const missing = CLASS_IDS.filter(c => !got.has(c))
      if (missing.length) broken.push(`${JSON.stringify(w.picks)} lacks ${missing.join(',')}`)
    }
    expect(broken).toEqual([])
  })

  it('every town still has a healer or a trainer to walk to, and at least one shop sells weapons somewhere', () => {
    for (const w of all) {
      let weaponShops = 0
      for (const town of Object.keys(TOWNS) as TownId[]) {
        const npcs = townNpcs(town, w.flags)
        expect(npcs.length, `${town} ${JSON.stringify(w.picks)}`).toBeGreaterThan(0)
        weaponShops += npcs.filter(n => n.role === 'shop' && n.stock!.slots.includes('main')).length
      }
      expect(weaponShops).toBeGreaterThan(0)
    }
  })

  it('no two people stand on the same spot of a town', () => {
    for (const w of all) {
      for (const town of Object.keys(TOWNS) as TownId[]) {
        const spots = townNpcs(town, w.flags).map(n => n.at.join(','))
        expect(new Set(spots).size, `${town} ${JSON.stringify(w.picks)}`).toBe(spots.length)
      }
    }
  })

  it('the colosseum opens whatever becomes of the Goblin King, the Rift whatever becomes of the throne', () => {
    for (const w of all) {
      expect(nodeOpen('arena', ALL_NODES, w.flags)).toBe(true)
      expect(nodeOpen('rift', ALL_NODES, w.flags)).toBe(true)
    }
  })
})

describe('the map opens outward from Sunford', () => {
  const open = (cleared: NodeId[], flags: string[] = []): NodeId[] =>
    MAP.filter(n => nodeOpen(n.id, new Set(cleared), new Set(flags))).map(n => n.id)

  it('a new save sees the town and the plains', () => {
    expect(open([])).toEqual(['sunford', 'plains'])
  })

  it('clearing a node opens its neighbours', () => {
    expect(open(['plains'])).toEqual(expect.arrayContaining(['hollows', 'woods']))
    expect(open(['plains'])).not.toContain('outskirts')
    expect(open(['plains', 'woods'])).toEqual(expect.arrayContaining(['outskirts', 'crags']))
  })

  it('the colosseum and the Rift also need their flag', () => {
    expect(open(['sunford', 'hollows'])).not.toContain('arena')
    expect(open(['sunford', 'hollows'], ['arenaOpen'])).toContain('arena')
    expect(open(['fortress'])).not.toContain('rift')
    expect(open(['fortress'], ['throneDone'])).toContain('rift')
  })

  it('a hidden trainer is found only once their zone is cleared', () => {
    expect(hiddenTrainerOf('temple', new Set(), new Set())).toBeNull()
    expect(hiddenTrainerOf('temple', new Set(['temple']), new Set())).toMatchObject({ cls: 'chrono' })
    // The oracle slain: her keeper of hours has fled the temple for the peak.
    expect(hiddenTrainerOf('temple', new Set(['temple']), new Set(['oracleSlain']))).toBeNull()
    expect(hiddenTrainerOf('peak', new Set(['peak']), new Set(['oracleSlain']))).toMatchObject({ cls: 'chrono' })
  })
})
