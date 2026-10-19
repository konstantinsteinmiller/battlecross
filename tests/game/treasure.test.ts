// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { DUG_FLAG, MAP_PIECES, PIECES_NEEDED, TREASURE_ZONE, piecesIn } from '@/game/data/treasure'
import { ZONES } from '@/game/data/zones'
import { ITEM_BY_ID } from '@/game/data/items'
import { walkableFrom } from '@/game/sim/herbs'
import { cellOf } from '@/game/sim/grid'
import { generateZone } from '@/game/sim/zoneGen'
import { Sim } from '@/game/sim/world'
import { applyPlan, populateZone } from '@/game/sim/director'
import { createHero } from '@/game/sim/hero'
import { stepSim } from '@/game/sim/step'
import { referenceBuild } from '@/game/sim/bot'

/** The treasure map (roadmap #89, D112). */

describe('the pieces', () => {
  it('eight: Plains 1, Hollows 1, Woods 2, Outskirts 3, Temple 1 (two spares)', () => {
    expect(MAP_PIECES).toHaveLength(8)
    const by = (z: string) => MAP_PIECES.filter(p => p.zone === z).length
    expect([by('plains'), by('hollows'), by('woods'), by('outskirts'), by('temple')]).toEqual([1, 1, 2, 3, 1])
    expect(piecesIn('woods', ['woods1'])).toEqual(['woods2'])
  })

  const visit = (zone: 'woods' | 'crags', o: { pieces?: string[]; treasure?: boolean }, seed = 3) => {
    const plan = generateZone(ZONES[zone], seed, o)
    const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 9, difficulty: 1, mode: 'zone', zone })
    applyPlan(sim, plan)
    const ref = referenceBuild({ level: 9, cls: 'aegis' })
    createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
    populateZone(sim, plan, zone, [])
    return { sim, plan }
  }

  it('lie where the hero can walk, apart from the herbs, and are his when walked over; nothing else moves for them', () => {
    for (const seed of [1, 2, 3, 4]) {
      const a = generateZone(ZONES.woods, seed)
      const b = generateZone(ZONES.woods, seed, { pieces: ['woods1', 'woods2'] })
      expect(b.pieces!.map(p => p.id)).toEqual(['woods1', 'woods2'])
      // The fight, the chests and the herbs are the same with or without them.
      expect(JSON.stringify(b.packs)).toBe(JSON.stringify(a.packs))
      expect(JSON.stringify(b.chests)).toBe(JSON.stringify(a.chests))
      expect(JSON.stringify(b.herbs)).toBe(JSON.stringify(a.herbs))
      for (const p of b.pieces!) for (const h of b.herbs ?? []) expect(Math.hypot(p.x - h.x, p.z - h.z)).toBeGreaterThanOrEqual(3)
    }
    expect(generateZone(ZONES.plains, 1, { tutorial: true, pieces: ['plains1'] }).pieces).toEqual([])
    const { sim, plan } = visit('woods', { pieces: ['woods1'] })
    const p = sim.pieces[0]!
    const u = sim.hero.unit
    u.x = u.px = p.x
    u.z = u.pz = p.z
    stepSim(sim, plan, 1 / 30)
    expect(sim.hero.pieces).toEqual(['woods1'])
    expect(sim.events.some(e => e.t === 'piece')).toBe(true)
  })

  it('with the map whole, the Crags hold the buried chest: a fat purse and an Epic', () => {
    const { sim } = visit('crags', { treasure: true })
    const c = sim.chests.find(x => x.role === 'treasure')!
    expect(c).toBeDefined()
    expect(c.special).toBe(`${TREASURE_ZONE}:treasure`)
    const item = c.loot.find(d => d.kind === 'item')!
    expect(ITEM_BY_ID[item.item]!.tier).toBe(4)
    expect(c.loot.find(d => d.kind === 'gold')!.gold).toBeGreaterThan(0)
    expect(visit('crags', {}).sim.chests.some(x => x.role === 'treasure')).toBe(false)
  })
})

describe('the errand', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  beforeEach(async () => {
    drainAndResetModules()
    localStorage.clear()
    await holdGameState()
    p = await import('@/game/state/profile')
    p.initProfile()
  })
  afterEach(() => { drainPersist(); vi.restoreAllMocks() })

  it('starts with the first piece, wants the X once the map is whole, and ends with the dig', () => {
    expect(p.errandStateOf('treasureMap')).toBe('none')
    expect(p.treasureFor('woods').pieces).toEqual(['woods1', 'woods2'])
    expect(p.addPieces(['woods1', 'bogus'])).toBe(1)
    expect(p.errandStateOf('treasureMap')).toBe('active')
    expect(p.treasureFor('woods').pieces).toEqual(['woods2'])
    expect(p.treasureFor('crags').treasure).toBe(false)
    // Any six make it whole; a seventh and eighth are kept but never count past six.
    p.addPieces(['plains1', 'hollows1', 'woods2', 'temple1'])
    expect(p.treasureFor('crags').treasure).toBe(false)
    p.addPieces(['outskirts3'])
    expect(p.treasureFor('crags').treasure).toBe(true)
    p.addPieces(MAP_PIECES.map(x => x.id))
    expect(p.treasureFor('crags').treasure).toBe(true)
    expect(p.errandStateOf('treasureMap')).toBe('active')
    p.markTreasureDug()
    expect(p.hasFlag(DUG_FLAG)).toBe(true)
    expect(p.errandStateOf('treasureMap')).toBe('done')
    expect(p.treasureFor('crags').treasure).toBe(false)
  })
})

describe('every piece can be found', () => {
  it('eight pieces, any six make the map whole; each zone lays all its pieces on walkable ground across many seeds', () => {
    expect(MAP_PIECES).toHaveLength(8)
    expect(new Set(MAP_PIECES.map(p => p.id)).size).toBe(8)
    expect(PIECES_NEEDED).toBe(6)
    for (const zone of ['plains', 'hollows', 'woods', 'outskirts', 'temple'] as const) {
      const ids = piecesIn(zone, [])
      expect(ids.length).toBeGreaterThan(0)
      for (let seed = 1; seed <= 60; seed++) {
        const plan = generateZone(ZONES[zone], seed, { pieces: ids })
        expect(plan.pieces!.map(p => p.id), `${zone} seed ${seed}`).toEqual(ids)
        const reach = walkableFrom(plan.w, plan.h, plan.solid, plan.sealed, plan.start)
        for (const p of plan.pieces!) expect(reach[cellOf(p.z) * plan.w + cellOf(p.x)], `${zone} seed ${seed} ${p.id}`).toBe(1)
      }
    }
  })
})
