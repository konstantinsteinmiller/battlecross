import { describe, expect, it } from 'vitest'
import { ENEMIES, MINIONS } from '@/game/data/enemies'
import { EQUIP_SLOTS, ITEMS, ITEM_BY_ID, type EquipSlot } from '@/game/data/items'
import { buildHumanoid, type Look } from '@/game/gfx/rigs/humanoid'
import { LOOKS, heroLook, lookKey } from '@/game/gfx/rigs/looks'

/**
 * The chibi rig, held to its budget and its skeleton. The animation poses
 * bones by NAME and the swing trails read the weapon bone, so a look that
 * loses one is a silent bug in the picture; and a look that grows past its
 * triangle budget is a slow phone.
 */

const HERO_BUDGET = 3200
const ENEMY_BUDGET = 2200
const NEEDED = [
  'root', 'hips', 'torso', 'neck', 'head', 'armL', 'armR', 'foreL', 'foreR', 'handL', 'handR', 'weapon', 'offhand',
  'legL', 'legR', 'shinL', 'shinR', 'footL', 'footR', 'hairF', 'hairB'
]

/** Every slot the game has, empty. */
const bare = Object.fromEntries(EQUIP_SLOTS.map(s => [s, null])) as Record<EquipSlot, string | null>

describe('humanoid rig', () => {
  it('builds every look at every detail level, with the bones the animation poses', () => {
    for (const [id, look] of Object.entries(LOOKS)) {
      for (const detail of [0, 1, 2] as const) {
        const rig = buildHumanoid(look, detail)
        for (const b of NEEDED) expect(rig.bones[b], `${id} @${detail} is missing bone ${b}`).toBeDefined()
        expect(rig.tris, `${id} @${detail}`).toBeGreaterThan(400)
        if (look.cape) expect(rig.bones.cape2, `${id} cape`).toBeDefined()
      }
    }
  })

  it('gives a face to every look that shows one: brows, lids that blink, a mouth that opens', () => {
    for (const [id, look] of Object.entries(LOOKS)) {
      const rig = buildHumanoid(look, 1)
      const faced = look.head !== 'greathelm'
      for (const b of ['browL', 'browR', 'lids', 'mouth']) expect(!!rig.bones[b], `${id} ${b}`).toBe(faced)
    }
  })

  it('keeps a standard human enemy within its triangle budget, and is leaner on a weak device', () => {
    const humans = [...ENEMIES.filter(e => e.rig === 'humanoid' && (e.rank === 'normal' || e.rank === 'weak')).map(e => e.look ?? e.id),
      ...Object.values(MINIONS).filter(m => m.rig === 'humanoid').map(m => m.look)]
    expect(humans.length).toBeGreaterThan(8)
    for (const id of humans) {
      const look = LOOKS[id]!
      const std = buildHumanoid(look, 1).tris
      const low = buildHumanoid(look, 0).tris
      expect(std, `${id} standard`).toBeLessThanOrEqual(ENEMY_BUDGET)
      expect(low, `${id} low`).toBeLessThan(std)
    }
  })

  it('keeps every other look (elites, bosses, townsfolk) within the hero budget', () => {
    for (const [id, look] of Object.entries(LOOKS)) expect(buildHumanoid(look, 1).tris, id).toBeLessThanOrEqual(HERO_BUDGET)
  })

  it('keeps the hero within budget in every weapon, off hand and armour he can wear', () => {
    const mains = ITEMS.filter(i => i.slot === 'main')
    const offs = [null, ...ITEMS.filter(i => i.slot === 'off').map(i => i.id)]
    const bodies = [null, ...ITEMS.filter(i => i.slot === 'body').map(i => i.id)]
    let worst = 0
    for (const main of mains) {
      for (const body of bodies) {
        const off = offs[(mains.indexOf(main) + bodies.indexOf(body)) % offs.length]!
        const look = heroLook({ ...bare, main: main.id, off, body })
        expect(look.hero).toBe(true)
        const tris = buildHumanoid(look, 2).tris
        worst = Math.max(worst, tris)
        expect(tris, `${main.id} + ${off} + ${body}`).toBeLessThanOrEqual(HERO_BUDGET)
      }
    }
    expect(worst).toBeGreaterThan(1800)
  })
})

describe('worn gear on the hero', () => {
  /** A stand-in for the head / hands / feet items the item worker adds. */
  const withGear = (over: Record<string, string>): Look => {
    const fake: Record<string, { kind: string; tier: number }> = {
      tHood: { kind: 'hood', tier: 1 }, tCap: { kind: 'cap', tier: 2 }, tHelm: { kind: 'helm', tier: 3 },
      tGreat: { kind: 'greathelm', tier: 5 }, tCirclet: { kind: 'circlet', tier: 4 }, tHat: { kind: 'hat', tier: 2 },
      tGloves: { kind: 'gloves', tier: 1 }, tGloves3: { kind: 'gloves', tier: 3 }, tGauntlets: { kind: 'gauntlets', tier: 4 },
      tBoots: { kind: 'boots', tier: 2 }, tBoots4: { kind: 'boots', tier: 4 }, tGreaves: { kind: 'greaves', tier: 5 }
    }
    const db = ITEM_BY_ID as unknown as Record<string, unknown>
    for (const [id, it] of Object.entries(fake)) db[id] = { id, slot: 'body', level: 1, mods: {}, ...it }
    try {
      return heroLook({ ...bare, ...over } as Record<EquipSlot, string | null>)
    } finally {
      for (const id of Object.keys(fake)) delete db[id]
    }
  }

  it('wears today\'s defaults when the save has no head, hands or feet slot', () => {
    const l = heroLook(bare)
    expect(l.head).toBe('short')
    expect(l.gloves).toBeUndefined()
    expect(l.boots).toBeUndefined()
  })

  it('shows a head item as head gear over tucked hair', () => {
    expect(withGear({ head: 'tHood' }).head).toBe('hood')
    expect(withGear({ head: 'tCap' }).head).toBe('leathercap')
    expect(withGear({ head: 'tHelm' }).head).toBe('helm')
    expect(withGear({ head: 'tGreat' }).head).toBe('greathelm')
    expect(withGear({ head: 'tCirclet' }).head).toBe('circlet')
    expect(withGear({ head: 'tHat' }).head).toBe('hat')
    expect(withGear({ head: 'tHelm' }).style).toBe('short')
    // An open helmet keeps the face (and its blink) in view; a great helm closes it.
    expect(buildHumanoid(withGear({ head: 'tHelm' }), 2).bones.lids).toBeDefined()
    expect(buildHumanoid(withGear({ head: 'tGreat' }), 2).bones.lids).toBeUndefined()
  })

  it('maps gloves and boots to cloth or leather by tier, gauntlets and greaves to plate', () => {
    expect(withGear({ hands: 'tGloves' }).gloves).toBe('cloth')
    expect(withGear({ hands: 'tGloves3' }).gloves).toBe('leather')
    expect(withGear({ hands: 'tGauntlets' }).gloves).toBe('plate')
    expect(withGear({ feet: 'tBoots' }).boots).toBe('cloth')
    expect(withGear({ feet: 'tBoots4' }).boots).toBe('leather')
    expect(withGear({ feet: 'tGreaves' }).boots).toBe('plate')
  })

  it('shows every head, hand and foot item the game ships as its own layer', () => {
    const worn = ITEMS.filter(i => (i.slot as string) === 'head' || (i.slot as string) === 'hands' || (i.slot as string) === 'feet')
    for (const it of worn) {
      const slot = it.slot as string
      const look = heroLook({ ...bare, [slot]: it.id } as Record<EquipSlot, string | null>)
      if (slot === 'head') expect(look.head, it.id).not.toBe('short')
      if (slot === 'hands') expect(look.gloves, it.id).toBeDefined()
      if (slot === 'feet') expect(look.boots, it.id).toBeDefined()
      expect(lookKey(look), it.id).not.toBe(lookKey(heroLook(bare)))
      expect(buildHumanoid(look, 2).tris, it.id).toBeLessThanOrEqual(HERO_BUDGET)
    }
  })

  it('builds every gear layer within the hero budget, and each one is its own template', () => {
    const keys = new Set<string>()
    const base = heroLook(bare)
    for (const head of ['short', 'hood', 'cap', 'leathercap', 'helm', 'greathelm', 'circlet', 'hat', 'wizard'] as const) {
      for (const g of ['none', 'cloth', 'leather', 'plate'] as const) {
        const look: Look = { ...base, head, headCol: '#c9d3e4', gloves: g, boots: g, cape: '#c9483a', pauldrons: true, outfit: 'plate', held: 'greatsword', off: 'shield' }
        keys.add(lookKey(look))
        expect(buildHumanoid(look, 2).tris, `${head} / ${g}`).toBeLessThanOrEqual(HERO_BUDGET)
      }
    }
    expect(keys.size).toBe(9 * 4)
    expect(lookKey({ ...base, gloves: 'plate' })).not.toBe(lookKey({ ...base, gloves: 'plate', gloveTrim: '#ff0000' }))
    expect(lookKey({ ...base, boots: 'plate' })).not.toBe(lookKey({ ...base, boots: 'plate', bootTrim: '#ff0000' }))
  })
})
