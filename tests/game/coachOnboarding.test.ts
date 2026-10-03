// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { Pacer, REVEAL_GAP, SETTLE } from '@/game/coach/pacing'
import type { FeatureCtx } from '@/game/coach/features'

/**
 * The paced introductions of roadmap #52: one feature lesson at a time, one
 * new one per breathing moment, reveals first and never stacked, retired by
 * DOING (never a timer), per input family, kept in the save — and a returning
 * player skips all of it.
 */

type P = typeof import('@/game/state/profile')
type R = typeof import('@/game/coach/reveal')
type F = typeof import('@/game/coach/features')
type C = typeof import('@/game/coach')
let p: P
let r: R
let f: F
let c: C

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  p.initProfile()
  r = await import('@/game/coach/reveal')
  f = await import('@/game/coach/features')
  c = await import('@/game/coach')
  c.coach.reset()
})
afterEach(() => { drainPersist(); vi.restoreAllMocks() })

/** A screen as the lessons read it: `on` lists the selectors present, `sel` attribute values. */
const ctx = (over: Partial<FeatureCtx> = {}, on: string[] = [], attrs: Record<string, string> = {}, lists: Record<string, string[]> = {}): FeatureCtx => ({
  screen: 'town', modal: '', talk: '', talkPhase: 'idle', npcRole: '', trainerCls: '', node: 'sunford', family: 'touch',
  dom: {
    has: (s) => on.includes(s),
    attr: (s, n) => attrs[`${s}@${n}`] ?? null,
    all: (s) => lists[s] ?? []
  },
  ...over
})

// ─── The pacing ──────────────────────────────────────────────────────────────

describe('pacing: nothing stacks', () => {
  it('one lesson at a time, after the screen has settled', () => {
    const pc = new Pacer()
    pc.breathe(0)
    let o = pc.step({ now: 0.1, want: ['equip', 'attr'], blocked: false, reveals: [] })
    expect(o.lesson).toBe('equip')
    expect(o.shown).toBe(false)
    o = pc.step({ now: SETTLE + 0.05, want: ['equip', 'attr'], blocked: false, reveals: [] })
    expect(o).toMatchObject({ lesson: 'equip', shown: true })
    // Still one, however many could be taught.
    o = pc.step({ now: 5, want: ['attr', 'equip', 'slot'], blocked: false, reveals: [] })
    expect(o.lesson).toBe('equip')
  })

  it('one NEW feature per breathing moment: the next waits for the next pause', () => {
    const pc = new Pacer()
    pc.breathe(0)
    pc.step({ now: 1, want: ['equip', 'attr'], blocked: false, reveals: [] })
    pc.retire('equip')
    expect(pc.step({ now: 3, want: ['attr'], blocked: false, reveals: [] }).lesson).toBe('')
    pc.breathe(4)
    const o = pc.step({ now: 4 + SETTLE + 0.1, want: ['attr'], blocked: false, reveals: [] })
    expect(o).toMatchObject({ lesson: 'attr', shown: true })
  })

  it('a lesson that leads on from the one just learned follows at once (talk → teach → learn)', () => {
    const pc = new Pacer()
    pc.breathe(0)
    expect(pc.step({ now: 1, want: ['talk'], blocked: false, reveals: [] }).lesson).toBe('talk')
    pc.retire('talk')
    pc.settle(2)
    expect(pc.step({ now: 2 + SETTLE + 0.1, want: ['teach'], blocked: false, reveals: [] })).toMatchObject({ lesson: 'teach', shown: true })
    pc.retire('teach')
    expect(pc.step({ now: 4, want: ['learn'], blocked: false, reveals: [] }).lesson).toBe('learn')
    // A feature that is not the next link waits.
    pc.retire('learn')
    expect(pc.step({ now: 5, want: ['equip'], blocked: false, reveals: [] }).lesson).toBe('')
  })

  it('held back while something else has the player, and back when it is gone', () => {
    const pc = new Pacer()
    pc.breathe(0)
    expect(pc.step({ now: 2, want: ['travel'], blocked: true, reveals: [] })).toMatchObject({ lesson: 'travel', shown: false })
    expect(pc.step({ now: 3, want: ['travel'], blocked: false, reveals: [] })).toMatchObject({ lesson: 'travel', shown: true })
  })

  it('reveals come first, one at a time and REVEAL_GAP apart; a lesson waits one gap after the last', () => {
    const pc = new Pacer()
    pc.breathe(0)
    let o = pc.step({ now: 1, want: ['equip'], blocked: false, reveals: ['map', 'bag'] })
    expect(o.reveal).toBe('map')
    expect(o.shown).toBe(false)
    o = pc.step({ now: 1.5, want: ['equip'], blocked: false, reveals: ['bag'] })
    expect(o.reveal).toBe('')
    o = pc.step({ now: 1 + REVEAL_GAP, want: ['equip'], blocked: false, reveals: ['bag'] })
    expect(o.reveal).toBe('bag')
    o = pc.step({ now: 1 + REVEAL_GAP + 0.5, want: ['equip'], blocked: false, reveals: [] })
    expect(o.shown).toBe(false)
    o = pc.step({ now: 1 + REVEAL_GAP * 2 + 0.01, want: ['equip'], blocked: false, reveals: [] })
    expect(o.shown).toBe(true)
    // And never a reveal over a lesson on screen, nor under a blocker.
    expect(pc.step({ now: 9, want: ['equip'], blocked: false, reveals: ['skills'] }).reveal).toBe('')
    expect(new Pacer().step({ now: 9, want: [], blocked: true, reveals: ['skills'] }).reveal).toBe('')
    // Nor on a screen that has only just come up (the veil is still fading).
    const fresh = new Pacer()
    fresh.breathe(20)
    expect(fresh.step({ now: 20.3, want: [], blocked: false, reveals: ['map'] }).reveal).toBe('')
    expect(fresh.step({ now: 20 + SETTLE + 0.01, want: [], blocked: false, reveals: ['map'] }).reveal).toBe('map')
  })

  it('a lesson the place no longer asks for steps aside, and nothing ever times out', () => {
    const pc = new Pacer()
    pc.breathe(0)
    pc.step({ now: 1, want: ['equip'], blocked: false, reveals: [] })
    expect(pc.step({ now: 600, want: ['equip'], blocked: false, reveals: [] })).toMatchObject({ lesson: 'equip', shown: true })
    expect(pc.step({ now: 601, want: [], blocked: false, reveals: [] }).lesson).toBe('')
  })
})

// ─── Learning by doing ───────────────────────────────────────────────────────

describe('feature lessons are learned by use, per hand', () => {
  it('one use retires a feature; a mouse use does not teach the touch screen', async () => {
    const { hud } = await import('@/game/state/hud')
    hud.device = 'mouse'
    expect(c.coach.learned('equip')).toBe(false)
    c.coach.use('equip')
    expect(c.coach.learned('equip')).toBe(true)
    hud.device = 'touch'
    expect(c.coach.learned('equip')).toBe(false)
    hud.device = 'mouse'
  })

  it('a feature already used never comes up: learned lessons are not wanted', () => {
    p.gainItem('trailBoots')
    const here = ctx({ screen: 'town' }, [])
    p.profile.tips['reveal:bag'] = 2
    expect(f.wantedHere(here, id => c.coach.learned(id))).toContain('equip')
    c.coach.use('equip')
    expect(f.wantedHere(here, id => c.coach.learned(id))).not.toContain('equip')
  })

  it('"?" brings a place\'s lessons back for one more use', () => {
    c.coach.use('travel')
    expect(c.coach.learned('travel')).toBe(true)
    c.coach.recall(c.RECALL.map)
    expect(c.coach.learned('travel')).toBe(false)
    c.coach.use('travel')
    expect(c.coach.learned('travel')).toBe(true)
    expect(c.RECALL.fight).toContain('target')
    expect(c.RECALL.town).toEqual(expect.arrayContaining(['talk', 'teach', 'learn', 'buy']))
  })

  it('every lesson has its sentence ids (both hands) — the controls and the features', () => {
    for (const id of ['move', 'mana', 'chest', 'talk', 'teach', 'learn', 'slot', 'equip', 'attr', 'travel', 'buy']) expect(c.ALL_LESSON_IDS).toContain(id)
  })
})

// ─── Where each lesson points ────────────────────────────────────────────────

describe('what each feature lesson points at', () => {
  it('equip: the bag button (once revealed), then — on a phone — tap the find, read the numbers, tap its socket', () => {
    p.gainItem('trailBoots')
    expect(f.equipCandidate()).toEqual({ id: 'trailBoots', slot: 'feet' })
    // The bag button is not on the HUD yet: nothing to point at.
    expect(f.stepOf('equip', ctx())).toBeNull()
    p.profile.tips['reveal:bag'] = 1
    expect(f.stepOf('equip', ctx())).toMatchObject({ kind: 'tap', at: '[data-coach="menu-inventory"]', here: false })
    // The book open on another page: its tab.
    expect(f.stepOf('equip', ctx({ modal: 'character' }))).toMatchObject({ at: '.book__tab[data-page="inventory"]' })
    expect(f.stepOf('equip', ctx({ modal: 'inventory' }))).toMatchObject({ kind: 'tap', at: '.bag__grid [data-item="trailBoots"]', here: true })
    expect(f.stepOf('equip', ctx({ modal: 'inventory' }, [], { '.equip@data-sel': 'trailBoots' })))
      .toMatchObject({ kind: 'tap', at: '.doll__socket[data-slot="feet"]', glow: '[data-coach="equip-stats"]' })
  })

  it('equip with a mouse: a ghost of the find dragged onto its socket', () => {
    p.gainItem('trailBoots')
    expect(f.stepOf('equip', ctx({ modal: 'inventory', family: 'mouse' })))
      .toEqual({ kind: 'drag', from: '.bag__grid [data-item="trailBoots"]', to: '.doll__socket[data-slot="feet"]', ghost: { item: 'trailBoots' }, glow: undefined, here: true })
  })

  it('equip waits for something worth wearing: the starting gear is all worn', () => {
    expect(f.equipCandidate()).toBeNull()
    expect(f.stepOf('equip', ctx({ modal: 'inventory' }))).toBeNull()
  })

  it('attribute points: every "+" breathes and the first is tapped; none to spend, no lesson', () => {
    expect(f.stepOf('attr', ctx({ modal: 'character' }))).toBeNull()
    p.profile.hero.points = 3
    expect(f.stepOf('attr', ctx({ modal: 'character' }))).toMatchObject({ kind: 'tap', at: '.attr__plus', rings: '.attr__plus' })
  })

  it('travel: after the first win, the next place (a town first), then its travel button', () => {
    const map = { screen: 'map', node: 'plains' }
    expect(f.stepOf('travel', ctx(map))).toBeNull()
    p.clearNode('plains')
    expect(f.nextPlace()).toBe('sunford')
    expect(f.stepOf('travel', ctx(map))).toMatchObject({ at: '.node[data-node="sunford"]' })
    expect(f.stepOf('travel', ctx(map, ['.card__actions button'], { '.node.is-selected@data-node': 'sunford' })))
      .toMatchObject({ at: '.card__actions button', last: true })
  })

  it('talking: drawn in the town itself, toward its trainer; teach: the "Teach me" topic of a trainer', () => {
    expect(f.stepOf('talk', ctx())).toEqual({ kind: 'world', here: true })
    expect(f.stepOf('talk', ctx({ talk: 'npc' }))).toBeNull()
    expect(f.stepOf('teach', ctx({ talk: 'npc', npcRole: 'trainer', talkPhase: 'choices' }, ['[data-choice="train"]'])))
      .toMatchObject({ kind: 'tap', at: '[data-choice="train"]' })
    expect(f.stepOf('teach', ctx({ talk: 'npc', npcRole: 'shop', talkPhase: 'choices' }, ['[data-choice="train"]']))).toBeNull()
  })

  it('learn: the first skill the hero can learn, then the Learn button; none affordable, no lesson', () => {
    const at = { modal: 'trainer', trainerCls: 'pyro' }
    p.profile.gold = 0
    expect(f.stepOf('learn', ctx(at))).toBeNull()
    p.profile.gold = 9999
    const s = f.stepOf('learn', ctx(at))
    expect(s).toMatchObject({ kind: 'tap' })
    const id = /data-skill="([^"]+)"/.exec((s as { at: string }).at)![1]!
    expect(f.stepOf('learn', ctx(at, [`.lesson.is-sel[data-skill="${id}"]`]))).toMatchObject({ at: '.trainer__actions button', glow: '.trade__deal' })
  })

  it('buy: the cheapest ware he can afford, then the deal', () => {
    p.profile.gold = 100000
    const shelf = { '.ware:not(.is-owned)[data-item]': ['quiltedCap', 'trailBoots'] }
    const s = f.stepOf('buy', ctx({ modal: 'shop' }, [], {}, shelf))
    expect(s).toMatchObject({ kind: 'tap' })
    const id = /data-item="([^"]+)"/.exec((s as { at: string }).at)![1]!
    expect(f.stepOf('buy', ctx({ modal: 'shop' }, [`.ware.is-sel[data-item="${id}"]`], {}, shelf))).toMatchObject({ at: '.shop__actions .trade__act', glow: '.trade__deal' })
    p.profile.gold = 0
    expect(f.stepOf('buy', ctx({ modal: 'shop' }, [], {}, shelf))).toBeNull()
  })

  it('on a screen, the lesson that acts there goes before one that only points to another screen', () => {
    p.gainItem('trailBoots')
    p.profile.tips['reveal:bag'] = 1
    p.profile.tips['reveal:hero'] = 1
    p.profile.hero.points = 3
    const order = f.wantedHere(ctx({ modal: 'character' }), id => c.coach.learned(id))
    expect(order[0]).toBe('attr')
    expect(order).toContain('equip')
  })
})

// ─── Reveals and the returning player ────────────────────────────────────────

describe('progressive reveal, kept in the save', () => {
  it('a new player\'s HUD starts bare; a reveal glows until used; both are saved', () => {
    r.classifyOnboarding()
    expect(p.profile.tips.onboard).toBe(1)
    for (const id of r.REVEALS) expect(r.revealed(id), id).toBe(false)
    r.markRevealed('bag')
    expect(r.revealed('bag')).toBe(true)
    expect(r.glowing('bag')).toBe(true)
    r.markRevealUsed('bag')
    expect(r.glowing('bag')).toBe(false)
    // Through the save and back.
    p.saveProfile()
    p.loadProfile()
    expect(p.profile.tips['reveal:bag']).toBe(2)
    expect(r.revealed('bag')).toBe(true)
    expect(r.revealed('map')).toBe(false)
  })

  it('a returning player has every button and none of the introductions', () => {
    p.grantXp(5000)
    p.clearNode('plains')
    p.profile.stats.runs = 4
    r.classifyOnboarding()
    expect(p.profile.tips.onboard).toBe(2)
    for (const id of r.REVEALS) { expect(r.revealed(id), id).toBe(true); expect(r.glowing(id), id).toBe(false) }
    for (const l of c.FEATURES) expect(c.coach.learned(l.id), l.id).toBe(true)
  })

  it('the decision is kept: a new player who has since played on is still taken through it', () => {
    r.classifyOnboarding()
    p.grantXp(5000)
    p.profile.stats.runs = 2
    r.classifyOnboarding()
    expect(r.isVeteran()).toBe(false)
    expect(c.coach.learned('travel')).toBe(false)
  })

  it('a returning player\'s cloud save that lands late (tips without the mark) is judged again: a veteran', () => {
    r.classifyOnboarding()
    expect(r.isVeteran()).toBe(false)
    // The cloud replaces the tips wholesale with a played save's.
    p.profile.tips = { 'hint:move:touch': 3 }
    p.profile.level = 9
    p.profile.stats.runs = 30
    expect(r.isVeteran()).toBe(true)
    expect(r.revealed('skills')).toBe(true)
  })
})

// ─── The opening beat, as the coach paces it ─────────────────────────────────

describe('the dummy beat: the walk, then the hit, then the road', () => {
  const beat = async () => {
    const { Sim } = await import('@/game/sim/world')
    const { createHero } = await import('@/game/sim/hero')
    const { applyPlan, populateZone } = await import('@/game/sim/director')
    const { generateZone } = await import('@/game/sim/zoneGen')
    const { ZONES } = await import('@/game/data/zones')
    const { noGear } = await import('@/game/data/items')
    const { startAttrs } = await import('@/game/data/attributes')
    const { spawnDummy, dummyOf } = await import('@/game/coach/dummy')
    const { hud } = await import('@/game/state/hud')
    const plan = generateZone(ZONES.plains, 7, { tutorial: true })
    const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
    applyPlan(sim, plan)
    createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
    populateZone(sim, plan, 'plains', [])
    spawnDummy(sim, plan)
    const host = { sim, setup: { kind: 'zone' as const }, project: (x: number, _y: number, z: number, o: { x: number; y: number }) => { o.x = x * 10; o.y = z * 10; return true } }
    const ids = (): string[] => { c.coach.step(host, 1 / 30); return hud.hints.map(h => h.id) }
    return { sim, dummy: dummyOf(sim)!, ids }
  }

  it('far from the dummy: only the walk; beside it: only the hit — one lesson at a time', async () => {
    const { sim, dummy, ids } = await beat()
    expect(ids()).toEqual(['move'])
    // The walk points at the dummy, not up the road at the pack.
    const { hintGeo } = c
    const u = sim.hero.unit
    expect(Math.hypot(hintGeo.move.x1 / 10 - dummy.x, hintGeo.move.y1 / 10 - dummy.z)).toBeLessThan(Math.hypot(u.x - dummy.x, u.z - dummy.z))
    u.x = dummy.x + 1.6
    u.z = dummy.z
    expect(ids()).toEqual(['target'])
  })

  it('a lesson done leaves the screen at once (even when nothing else is up)', async () => {
    const { sim, dummy, ids } = await beat()
    const u = sim.hero.unit
    u.x = dummy.x + 1.6
    u.z = dummy.z
    expect(ids()).toEqual(['target'])
    for (let i = 0; i < 3; i++) c.coach.use('target')
    c.coach.use('move'); c.coach.use('move'); c.coach.use('move')
    expect(ids()).toEqual([])
  })
})
