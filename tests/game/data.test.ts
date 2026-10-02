import { describe, expect, it } from 'vitest'
import { ITEMS, ITEM_BY_ID, EQUIP_SLOTS, TIER_PRICE, itemsOfZone, noGear, priceOf, sellValue, slotOf, type ItemDef, type ItemSlot, type ZoneId } from '@/game/data/items'
import { ZONE_LOOT } from '@/game/data/loot'
import { GLYPHS } from '@/components/art/glyphs'
import { modLines } from '@/components/game/modLines'
import { heroStats } from '@/game/sim/stats'
import { SKILLS, SKILL_BY_ID, CLASSES, CLASS_IDS, ACTIVE_SLOTS, PASSIVE_SLOTS, meetsSkill, skillsOf } from '@/game/data/skills'
import { ATTRS, ATTR_START, POINTS_PER_LEVEL, startAttrs, statPower } from '@/game/data/attributes'
import { MAX_LEVEL, addXp, killGold, killXp, skillPrice, xpToNext, xpToReach } from '@/game/data/progression'
import { ENEMIES, ENEMY_BY_ID, MINIONS } from '@/game/data/enemies'
import { ARENA_WAVES, MAP, NODE_BY_ID, TOWNS, ZONES, ZONE_IDS, dangerOf, visitLevel } from '@/game/data/zones'
import { QUESTS } from '@/game/data/quests'

/**
 * The GDD's tables, held to the letter. The numbers below are quoted from
 * GDD.md §5 (skills) and §6 (items): a change to the data that departs from
 * the document fails here, by name.
 */

const NEW_SLOTS = ['head', 'hands', 'feet'] as const

describe('items (GDD §6)', () => {
  it('is the master database: the 44 named items of the tables (14 weapons, 8 off-hands, 12 armours, 10 trinkets), and nothing twice', () => {
    expect(new Set(ITEMS.map(i => i.id)).size).toBe(ITEMS.length)
    const by = (slot: string): number => ITEMS.filter(i => i.slot === slot).length
    expect([by('main'), by('off'), by('body'), by('trinket')]).toEqual([14, 8, 12, 10])
    // Every item is in a slot the hero has; what is not in the tables is head, hands or feet.
    const slots = new Set<ItemSlot>(EQUIP_SLOTS.map(slotOf))
    for (const i of ITEMS) expect(slots.has(i.slot), i.id).toBe(true)
    expect(ITEMS).toHaveLength(44 + NEW_SLOTS.reduce((n, s) => n + by(s), 0))
  })

  it('has eight equipment slots: main hand, off hand, head, body, hands, feet, two trinkets (D39)', () => {
    expect(EQUIP_SLOTS).toEqual(['main', 'off', 'head', 'body', 'hands', 'feet', 'trinket1', 'trinket2'])
    expect(slotOf('trinket2')).toBe('trinket')
    for (const s of NEW_SLOTS) expect(slotOf(s)).toBe(s)
    expect(Object.keys(noGear())).toEqual([...EQUIP_SLOTS])
    expect(Object.values(noGear()).every(v => v === null)).toBe(true)
  })

  it('keeps every item inside its tier\'s level band (§6.2)', () => {
    const band: Record<number, [number, number]> = { 1: [1, 5], 2: [6, 10], 3: [11, 15], 4: [16, 20], 5: [21, 25], 6: [26, 30] }
    for (const i of ITEMS) {
      const [lo, hi] = band[i.tier]!
      expect(i.level, i.id).toBeGreaterThanOrEqual(lo)
      expect(i.level, i.id).toBeLessThanOrEqual(hi)
    }
  })

  it('every weapon swings, every body armour has an armour value, and nothing else does', () => {
    for (const i of ITEMS) {
      expect(!!i.weapon, i.id).toBe(i.slot === 'main')
      expect(!!i.armor, i.id).toBe(i.slot === 'body')
    }
  })

  it.each([
    ['rustedShortsword', 1, 1, { str: 4, dex: 2 }],
    ['apprenticeStaff', 1, 1, { int: 5, manaDiscount: 0.05 }],
    ['ironBroadsword', 2, 6, { str: 12, end: 5, block: 0.05 }],
    ['ashenGreatsword', 3, 12, { str: 28, end: 12, burnOnHit: 15 }],
    ['chronoBlade', 4, 17, { dex: 35, int: 25, freezeOnHit: 0.1 }],
    ['voidCannon', 5, 22, { skl: 55, int: 30, pierce: 2 }],
    ['bladeOfTheUnbound', 6, 28, { str: 80, dex: 60, critCooldown: 1 }],
    ['aegisTowerShield', 4, 18, { end: 35, str: 20, reflectOnBlock: 20 }],
    ['shieldOfTheFallen', 6, 29, { end: 65, str: 40, fatalSave: 3 }],
    ['ringOfMending', 2, 7, { end: 8, hpRegen: 3 }],
    ['sovereignsSignet', 5, 24, { cha: 30, minionDamage: 0.2 }],
    ['ringOfAbsolutePower', 6, 30, { allAttrs: 25, damagePct: 0.15, damageReduction: 0.15 }]
  ] as const)('%s is as tabled', (id, tier, level, mods) => {
    const it = ITEM_BY_ID[id]!
    expect(it.tier).toBe(tier)
    expect(it.level).toBe(level)
    expect(it.mods).toEqual(mods)
  })

  it.each([['paddedTunic', 8], ['chainmailVest', 28], ['reinforcedPlate', 55], ['dragonscaleHauberk', 140], ['armorOfTheTitan', 220]] as const)(
    '%s has %i armour', (id, armor) => { expect(ITEM_BY_ID[id]!.armor).toBe(armor) })

  it('drops where the table says: every zone has loot, every drop names a real zone', () => {
    for (const i of ITEMS) expect(ZONES[i.drop.zone], i.id).toBeDefined()
    for (const z of ZONE_IDS) expect(itemsOfZone(z).length, z).toBeGreaterThan(0)
    expect(itemsOfZone('fortress', 'secret').map(i => i.id)).toEqual(['ringOfAbsolutePower'])
    // The Void Lord's two from the tables, and the legendary boots of D39.
    expect(itemsOfZone('rift', 'boss').map(i => i.id).sort()).toEqual(['aetheriumDestroyer', 'armorOfTheTitan', 'treadsOfTheHorizon'])
  })

  it('prices rise with the tier, and legendaries are found, never sold', () => {
    for (let t = 1; t < 5; t++) expect(TIER_PRICE[t + 1]!).toBeGreaterThan(TIER_PRICE[t]!)
    expect(TIER_PRICE[6]).toBe(0)
    for (const i of ITEMS) {
      expect(sellValue(i), i.id).toBeGreaterThan(0)
      if (i.tier < 6) expect(sellValue(i), i.id).toBeLessThan(priceOf(i))
    }
  })
})

/**
 * Helmets, gloves and boots (D39): not in the GDD's tables, so what is pinned
 * here is the RULE they were made by, not eighteen rows of numbers.
 */
describe('head, hands and feet (D39)', () => {
  const of = (slot: ItemSlot): ItemDef[] => ITEMS.filter(i => i.slot === slot)
  const KINDS: Record<string, string[]> = {
    head: ['hood', 'cap', 'helm', 'greathelm', 'circlet', 'hat'],
    hands: ['gloves', 'gauntlets'],
    feet: ['boots', 'greaves']
  }
  /** An item's attribute points (the six attributes, summed). */
  const points = (i: ItemDef): number => ATTRS.reduce((n, a) => n + (i.mods[a] ?? 0), 0)
  const bodyOf = (tier: number): ItemDef[] => of('body').filter(i => i.tier === tier)
  const mean = (v: number[]): number => v.reduce((a, b) => a + b, 0) / v.length

  it('each slot has one piece per tier, of a kind the hero model can show', () => {
    for (const slot of NEW_SLOTS) {
      expect(of(slot).map(i => i.tier), slot).toEqual([1, 2, 3, 4, 5, 6])
      for (const i of of(slot)) expect(KINDS[slot], i.id).toContain(i.kind)
    }
    // Every kind is used: a mage, a rogue and a knight each find theirs.
    for (const slot of NEW_SLOTS) expect(new Set(of(slot).map(i => i.kind)), slot).toEqual(new Set(KINDS[slot]))
  })

  it('every kind has its drawing and every modifier its line', () => {
    for (const slot of NEW_SLOTS) {
      for (const i of of(slot)) {
        expect(GLYPHS[i.kind], i.kind).toBeTruthy()
        expect(modLines(i.mods).map(l => l.id).sort(), i.id).toEqual(Object.keys(i.mods).sort())
      }
    }
  })

  it('the slots have their identities: plate carries armour, gloves quicken or sharpen, boots move', () => {
    for (const i of ITEMS.filter(x => ['helm', 'greathelm', 'gauntlets', 'greaves'].includes(x.kind))) expect(i.mods.armor, i.id).toBeGreaterThan(0)
    for (const i of ITEMS.filter(x => x.kind === 'gloves')) {
      expect((i.mods.attackSpeed ?? 0) + (i.mods.critChance ?? 0) + (i.mods.spellCrit ?? 0) + (i.mods.critDamage ?? 0), i.id).toBeGreaterThan(0)
    }
    for (const i of ITEMS.filter(x => x.kind === 'boots')) expect(i.mods.moveSpeed, i.id).toBeGreaterThan(0)
    // Their armour is a modifier; the Armor Value stays the body's (see "every weapon swings…").
    for (const slot of NEW_SLOTS) for (const i of of(slot)) expect(i.armor, i.id).toBeUndefined()
  })

  it('together they are worth about one more body armour of the tier, never more', () => {
    for (let tier = 1; tier <= 6; tier++) {
      const body = bodyOf(tier)
      const three = NEW_SLOTS.map(s => of(s).find(i => i.tier === tier)!)
      const pts = three.reduce((n, i) => n + points(i), 0)
      const armor = three.reduce((n, i) => n + (i.mods.armor ?? 0), 0)
      // Attribute points: at most the tier's richest body armour (a point of rounding at tier 1).
      expect(pts, `tier ${tier} points`).toBeLessThanOrEqual(Math.max(...body.map(points)) + 1)
      expect(pts, `tier ${tier} points`).toBeGreaterThanOrEqual(mean(body.map(points)) * 0.5)
      // Armour: never more than the tier's heaviest plate.
      expect(armor, `tier ${tier} armour`).toBeLessThanOrEqual(Math.max(...body.map(i => i.armor ?? 0)))
      // No single piece carries more than 45 % of a body armour's points.
      for (const i of three) expect(points(i), i.id).toBeLessThanOrEqual(Math.max(...body.map(points)) * 0.45 + 1)
    }
  })

  it('a percentage on one of them stays small: a legendary may carry the whole of it, the rest about half', () => {
    // The most each modifier may be on these slots (a trinket built around one carries as much or more).
    const most: Record<string, number> = { moveSpeed: 0.1, dodge: 0.08, attackSpeed: 0.1, critChance: 0.04, spellCrit: 0.06, critDamage: 0.15, cdr: 0.06, stunDurationCut: 0.2 }
    for (const slot of NEW_SLOTS) {
      for (const i of of(slot)) {
        for (const k in i.mods) {
          if ((ATTRS as readonly string[]).includes(k) || k === 'armor' || k === 'maxMana') continue
          expect(most[k], `${i.id}: ${k} is a modifier these slots use`).toBeDefined()
          expect(i.mods[k as keyof typeof i.mods]!, `${i.id}: ${k}`).toBeLessThanOrEqual(most[k]! * (i.tier === 6 ? 1 : 0.55) + 1e-9)
        }
      }
    }
  })

  it('wearing them moves the stats they name, through the same sum as the rest of the gear', () => {
    const bare = heroStats({ level: 30, attrs: startAttrs(), equipped: noGear(), passives: [] })
    const worn = heroStats({ level: 30, attrs: startAttrs(), equipped: { ...noGear(), head: 'wyrmguardGreathelm', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon' }, passives: [] })
    expect(worn.armor).toBeGreaterThan(bare.armor + 44)
    expect(worn.attackSpeed).toBeGreaterThan(bare.attackSpeed + 0.1)
    expect(worn.critChance).toBeGreaterThan(bare.critChance + 0.04)
    expect(worn.moveSpeed).toBeGreaterThan(bare.moveSpeed)
    expect(worn.dodge).toBeCloseTo(0.08)
    expect(worn.maxHp).toBeGreaterThan(bare.maxHp)
    // A helmet is not plate BODY armour: STR's affinity does not multiply it.
    const greathelm = ITEM_BY_ID.wyrmguardGreathelm!
    const strong = { ...startAttrs(), str: 60 }
    const helmed = heroStats({ level: 30, attrs: strong, equipped: { ...noGear(), head: greathelm.id }, passives: [] })
    const same = heroStats({ level: 30, attrs: { ...strong, str: strong.str + greathelm.mods.str!, end: strong.end + greathelm.mods.end! }, equipped: noGear(), passives: [] })
    expect(helmed.armor - same.armor).toBeCloseTo(greathelm.mods.armor!)
  })

  it('they are found across all twelve zones, in the chests of their zone, and sold by the armourers of their tier', () => {
    const three = NEW_SLOTS.flatMap(of)
    expect(new Set(three.map(i => i.drop.zone)).size).toBe(ZONE_IDS.length)
    for (const i of three) {
      // A drop in the tier's own zones (§6.2).
      expect(Math.min(6, Math.ceil(ZONES[i.drop.zone].max / 5)), i.id).toBe(i.tier)
      if (i.drop.src === 'mob' || i.drop.src === 'chest') expect(ZONE_LOOT[i.drop.zone].items, i.id).toContain(i.id)
      else expect(i.drop.src, i.id).toBe('boss')
      const sellers = Object.values(TOWNS).flatMap(t => t.npcs).filter(n => n.role === 'shop' && n.stock!.slots.includes(i.slot) && n.stock!.tiers.includes(i.tier))
      if (i.tier === 6) expect(priceOf(i), i.id).toBe(0)
      else {
        expect(sellers.length, i.id).toBeGreaterThan(0)
        expect(priceOf(i), i.id).toBeGreaterThan(0)
      }
    }
    // Every chest table holds at least one of them (the Rift's holds the Fortress's).
    const isNew = (id: string): boolean => (NEW_SLOTS as readonly string[]).includes(ITEM_BY_ID[id]!.slot)
    for (const z of ZONE_IDS) expect(ZONE_LOOT[z].items.some(isNew), z).toBe(true)
    // An armourer sells all three, and the towns keep their tiers: Sunford 1, Oakhaven from 2, Ironhold from 3.
    for (const n of Object.values(TOWNS).flatMap(t => t.npcs)) {
      if (n.role !== 'shop' || !n.stock!.slots.includes('body')) continue
      for (const s of NEW_SLOTS) expect(n.stock!.slots, n.id).toContain(s)
    }
    const from = (town: keyof typeof TOWNS): number => Math.min(...TOWNS[town].npcs.filter(n => n.role === 'shop' && n.stock!.slots.includes('head')).flatMap(n => n.stock!.tiers))
    expect([from('sunford'), from('oakhaven'), from('ironhold')]).toEqual([1, 2, 3])
  })
})

describe('classes and skills (GDD §5)', () => {
  it('is eight classes of six skills', () => {
    expect(CLASS_IDS).toHaveLength(8)
    expect(SKILLS).toHaveLength(48)
    expect(new Set(SKILLS.map(s => s.id)).size).toBe(48)
    for (const c of CLASS_IDS) expect(skillsOf(c), c).toHaveLength(6)
  })

  it('four are the reimagined classics, four are new', () => {
    expect(CLASS_IDS.filter(c => !CLASSES[c].novel)).toEqual(['aegis', 'shadow', 'pyro', 'sovereign'])
    expect(CLASS_IDS.filter(c => CLASSES[c].novel)).toEqual(['chrono', 'blood', 'aether', 'geo'])
  })

  it('a fresh hero (5 in everything, level 1) can learn the first skill of every class', () => {
    expect(ATTR_START).toBe(5)
    for (const c of CLASS_IDS) {
      const first = skillsOf(c)[0]!
      expect(first.level, first.id).toBe(1)
      expect(first.kind, first.id).toBe('active')
      expect(meetsSkill(first, 1, startAttrs()), first.id).toBe(true)
    }
  })

  it('skills unlock in order: each class\'s level requirements never go down', () => {
    for (const c of CLASS_IDS) {
      const levels = skillsOf(c).map(s => s.level)
      expect([...levels].sort((a, b) => a - b), c).toEqual(levels)
      expect(Math.max(...levels), c).toBeLessThanOrEqual(MAX_LEVEL)
    }
  })

  it('an active has a cooldown and no modifiers; a passive has modifiers and no cooldown', () => {
    for (const s of SKILLS) {
      if (s.kind === 'active') {
        expect(s.cd, s.id).toBeGreaterThan(0)
        expect(s.mods, s.id).toBeUndefined()
      } else {
        expect(s.cd, s.id).toBe(0)
        expect(s.mana, s.id).toBe(0)
        expect(Object.keys(s.mods ?? {}).length, s.id).toBeGreaterThan(0)
      }
    }
    expect([ACTIVE_SLOTS, PASSIVE_SLOTS]).toEqual([6, 3])
  })

  it.each([
    ['shieldSlam', 6, { dmg: 120, stun: 2 }],
    ['radiantStrike', 8, { dmg: 180, heal: 30 }],
    ['shadowstep', 5, { dmg: 150 }],
    ['fireball', 3, { dmg: 140 }],
    ['cataclysm', 40, { dmg: 450, meteors: 12 }],
    ['temporalStasis', 10, { dur: 3.5 }],
    ['chronoRewind', 40, { back: 4 }],
    ['sanguineFlask', 4, { hp: 10, dmg: 160, shred: 15 }],
    ['orbitalBeam', 30, { dmg: 400, dur: 4 }],
    ['petrify', 22, { dur: 5, vuln: 30 }],
    ['tectonicRupture', 40, { dmg: 500 }]
  ] as const)('%s: cooldown %i s, numbers as tabled', (id, cd, p) => {
    const s = SKILL_BY_ID[id]!
    expect(s.cd).toBe(cd)
    expect(s.p).toMatchObject(p)
  })

  it('pins the two places the GDD contradicts itself (the table is the spec)', () => {
    // §5.5: the table says 30 % of damage is delayed over 6 s (the diagram says 70 %).
    expect(SKILL_BY_ID.timeDistort!.mods).toEqual({ timeDistort: 0.3 })
    expect(SKILL_BY_ID.timeDistort!.p).toMatchObject({ share: 30, over: 6 })
    // §5.7: overheating locks heat skills for 5 s; the passive adds +100 % crit damage.
    expect(SKILL_BY_ID.thermalOverload!.p).toMatchObject({ lock: 5, crit: 100 })
  })

  it('the Blood Alchemist pays in health, the Aether-Tech in heat', () => {
    expect(SKILL_BY_ID.sanguineFlask!.hpCost).toBe(10)
    expect(SKILL_BY_ID.mutagenicRage!.hpCost).toBe(25)
    expect(SKILL_BY_ID.aetherPistol!.heat).toBe(10)
  })

  it('a trainer charges more for a later skill', () => {
    expect(skillPrice(1)).toBeLessThan(skillPrice(10))
    expect(skillPrice(10)).toBeLessThan(skillPrice(26))
  })
})

describe('attributes and levels (GDD §4)', () => {
  it('six attributes, three points a level', () => {
    expect(ATTRS).toEqual(['str', 'dex', 'int', 'end', 'skl', 'cha'])
    expect(POINTS_PER_LEVEL).toBe(3)
  })

  it('a "100 % STAT" hit is 6 + 1.6 × stat', () => {
    expect(statPower(5)).toBeCloseTo(14)
    expect(statPower(150)).toBeCloseTo(246)
    expect(statPower(-3)).toBe(6)
  })

  it('the XP curve only climbs, and levels are earned one at a time', () => {
    for (let l = 1; l < MAX_LEVEL; l++) expect(xpToNext(l + 1), `level ${l}`).toBeGreaterThan(xpToNext(l))
    expect(addXp(1, 0, xpToNext(1) - 1)).toMatchObject({ level: 1, gained: 0 })
    expect(addXp(1, 0, xpToNext(1))).toMatchObject({ level: 2, xp: 0, gained: 1 })
    expect(addXp(1, 0, xpToNext(1) + xpToNext(2) + 5)).toMatchObject({ level: 3, xp: 5, gained: 2 })
    expect(xpToReach(3)).toBe(xpToNext(1) + xpToNext(2))
  })

  it('the level stops at 30 and the bar stays full', () => {
    expect(MAX_LEVEL).toBe(30)
    const r = addXp(29, 0, 10_000_000)
    expect(r.level).toBe(30)
    expect(r.xp).toBe(xpToNext(30))
    expect(addXp(30, 0, 500).level).toBe(30)
  })

  it('fighting up pays more, farming far below pays little', () => {
    expect(killXp(10, 1, 5)).toBeGreaterThan(killXp(10, 1, 10))
    expect(killXp(3, 1, 20)).toBeLessThan(killXp(3, 1, 3) * 0.3)
    expect(killXp(1, 1, 30)).toBeGreaterThanOrEqual(1)
    expect(killGold(10, 3)).toBeGreaterThan(killGold(10, 1))
  })
})

describe('the world (GDD §3.1, §6.2)', () => {
  it('has the twelve zones of the tier table, two per tier, in order', () => {
    expect(ZONE_IDS).toEqual(['plains', 'hollows', 'woods', 'outskirts', 'crags', 'mines', 'tundra', 'temple', 'citadel', 'peak', 'fortress', 'rift'])
    const tierOf = (z: ZoneId): number => Math.min(6, Math.ceil(ZONES[z].max / 5))
    expect(ZONE_IDS.map(tierOf)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6])
    for (const z of ZONE_IDS) expect(ZONES[z].min, z).toBeLessThanOrEqual(ZONES[z].max)
  })

  it('fields the monsters the table names for each tier', () => {
    const kinds = (z: ZoneId): string[] => [...ZONES[z].kinds.map(k => k.kind), ZONES[z].finale.leader, ...ZONES[z].finale.with]
    expect(kinds('plains')).toEqual(expect.arrayContaining(['goblin', 'bandit', 'wolf']))
    expect(kinds('woods')).toEqual(expect.arrayContaining(['treant', 'spider']))
    expect(kinds('outskirts')).toContain('outlawCaptain')
    expect(kinds('crags')).toEqual(expect.arrayContaining(['fireElemental', 'cultist']))
    expect(kinds('mines')).toContain('ironGolem')
    expect(kinds('tundra')).toEqual(expect.arrayContaining(['frostGiant', 'necromancer']))
    expect(kinds('temple')).toContain('naga')
    expect(kinds('citadel')).toEqual(expect.arrayContaining(['voidStalker', 'highDemon']))
    expect(kinds('peak')).toContain('wyvern')
    expect(kinds('fortress')).toContain('archDemon')
    expect(kinds('rift')).toContain('voidLord')
  })

  it('every enemy a zone can field exists, and every finale has a leader worth the name', () => {
    for (const z of ZONE_IDS) {
      const def = ZONES[z]
      for (const k of def.kinds) expect(ENEMY_BY_ID[k.kind], `${z}: ${k.kind}`).toBeDefined()
      for (const k of def.finale.with) expect(ENEMY_BY_ID[k], `${z}: ${k}`).toBeDefined()
      const leader = ENEMY_BY_ID[def.finale.leader]
      expect(leader, `${z} leader`).toBeDefined()
      expect(['elite', 'boss'], `${z} leader rank`).toContain(leader!.rank)
    }
    expect(new Set(ENEMIES.map(e => e.id)).size).toBe(ENEMIES.length)
  })

  it('the summoner classes have their minions', () => {
    for (const k of ['guard', 'archer', 'mage', 'turret', 'rocketTurret', 'dragonAlly']) expect(MINIONS[k], k).toBeDefined()
  })

  it('the map is one connected graph with symmetric roads', () => {
    for (const n of MAP) for (const l of n.links) expect(NODE_BY_ID[l]?.links, `${n.id} ↔ ${l}`).toContain(n.id)
    const seen = new Set<string>(['sunford'])
    const stack = ['sunford']
    while (stack.length) for (const l of NODE_BY_ID[stack.pop()!]!.links) if (!seen.has(l)) { seen.add(l); stack.push(l) }
    expect([...seen].sort()).toEqual(MAP.map(n => n.id).sort())
    expect(MAP.filter(n => n.kind === 'zone').map(n => n.id).sort()).toEqual([...ZONE_IDS].sort())
    expect(ARENA_WAVES).toBeGreaterThan(0)
  })

  it('recommended levels are shown, never enforced: the visit\'s level is held inside the zone\'s band', () => {
    expect(visitLevel(ZONES.crags, 3)).toBe(11)
    expect(visitLevel(ZONES.crags, 12)).toBe(12)
    expect(visitLevel(ZONES.plains, 30)).toBe(3)
    expect(dangerOf(ZONES.plains, 1)).toBe(0)
    expect(dangerOf(ZONES.hollows, 1)).toBe(1)
    expect(dangerOf(ZONES.crags, 3)).toBe(3)
  })

  it('every shop has something to sell, every trainer teaches a real class, every quest giver a real quest', () => {
    const questIds = new Set(QUESTS.map(q => q.id))
    for (const town of Object.values(TOWNS)) {
      for (const n of town.npcs) {
        if (n.role === 'shop') {
          const stock = ITEMS.filter(i => i.tier < 6 && n.stock!.slots.includes(i.slot) && n.stock!.tiers.includes(i.tier))
          expect(stock.length, n.id).toBeGreaterThan(0)
        }
        if (n.role === 'trainer') expect(CLASSES[n.cls!], n.id).toBeDefined()
        if (n.quest) expect(questIds.has(n.quest), n.id).toBe(true)
        expect(n.at[0]).toBeGreaterThan(0)
        expect(n.at[0]).toBeLessThan(1)
      }
    }
  })
})
