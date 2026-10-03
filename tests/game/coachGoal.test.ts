// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import type { GoalCtx, ZoneGoalState } from '@/game/coach/goal'
import type { FeatureCtx } from '@/game/coach/features'
import { xpToNext } from '@/game/data/progression'

/**
 * The next goal (roadmap #2), walked through a new player's whole first hour:
 * the dummy, the plains, the map, Sunford's trainer and the points, the road
 * to the Goblin Hollows, the King, the decision, the next place. And the
 * guided first town visit (roadmap #3): the way out is always there, and a
 * player who skips the trainer is not held to him.
 */

type P = typeof import('@/game/state/profile')
type G = typeof import('@/game/coach/goal')
let p: P
let g: G

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  p.initProfile()
  g = await import('@/game/coach/goal')
})
afterEach(() => { drainPersist(); vi.restoreAllMocks() })

const zone = (over: Partial<ZoneGoalState> = {}): ZoneGoalState =>
  ({ kind: 'zone', node: 'plains', done: 0, total: 3, boss: '', ended: '', dummy: false, wave: 0, waves: 8, ...over })
const at = (screen: string, node: string, over: Partial<GoalCtx> = {}): GoalCtx => ({ screen, node, modal: '', quest: '', zone: null, ...over })
const inZone = (z: Partial<ZoneGoalState>): GoalCtx => at('zone', z.node ?? 'plains', { zone: zone(z) })

describe('the next goal through the first hour', () => {
  it('fresh save → dummy → the plains, counted → the way out after the win', () => {
    expect(g.nextGoal(inZone({ dummy: true }))).toEqual({ id: 'dummy' })
    expect(g.nextGoal(inZone({}))).toEqual({ id: 'clear', place: 'plains', n: 0, of: 3 })
    expect(g.nextGoal(inZone({ done: 2 }))).toEqual({ id: 'clear', place: 'plains', n: 2, of: 3 })
    expect(g.nextGoal(inZone({ done: 3, ended: 'victory' }))).toEqual({ id: 'exit' })
    // A defeat goes to the result screen: no goal over it.
    expect(g.nextGoal(inZone({ ended: 'defeat' }))).toBeNull()
  })

  it('the map after the first win: to Sunford first (a town not yet walked into)', () => {
    p.clearNode('plains')
    expect(g.nextGoal(at('map', 'plains'))).toEqual({ id: 'travel', place: 'sunford' })
  })

  it('Sunford: a trainer while a skill can be learned → learn it → spend the points → leave for the Hollows', () => {
    p.clearNode('plains')
    p.clearNode('sunford')
    p.profile.gold = 120
    p.grantXp(xpToNext(1))
    expect(p.profile.hero.points).toBe(3)
    expect(g.teachersIn('sunford')).toContain('trainerPyro')
    expect(g.nextGoal(at('town', 'sunford'))).toEqual({ id: 'trainer' })
    expect(g.nextGoal(at('town', 'sunford', { modal: 'trainer' }))).toEqual({ id: 'learn' })
    expect(p.learnSkill('fireball')).toBe(true)
    expect(g.nextGoal(at('town', 'sunford'))).toEqual({ id: 'points', n: 3, of: 0 })
    p.spendPoint('int', 3)
    expect(g.nextGoal(at('town', 'sunford'))).toEqual({ id: 'leave', place: 'hollows' })
  })

  it('points he chose to keep (the sheet closed on some) do not hold him in town', () => {
    p.clearNode('plains')
    p.clearNode('sunford')
    p.profile.gold = 0
    p.grantXp(xpToNext(1))
    expect(g.nextGoal(at('town', 'sunford'))).toEqual({ id: 'points', n: 3, of: 0 })
    expect(g.nextGoal(at('town', 'sunford', { pointsKept: true }))).toEqual({ id: 'leave', place: 'hollows' })
  })

  it('no trainer goal where nothing can be learned (no gold, no level): straight on', () => {
    p.clearNode('plains')
    p.clearNode('sunford')
    p.profile.gold = 0
    expect(g.teachersIn('sunford')).toEqual([])
    expect(g.nextGoal(at('town', 'sunford'))).toEqual({ id: 'leave', place: 'hollows' })
  })

  it('a player who walks out on the trainer: the map points on; the trainer is back only in a town', () => {
    p.clearNode('plains')
    p.clearNode('sunford')
    p.profile.gold = 120
    expect(g.nextGoal(at('map', 'sunford'))).toEqual({ id: 'travel', place: 'hollows' })
    expect(g.nextGoal(at('town', 'sunford'))).toEqual({ id: 'trainer' })
  })

  it('the Hollows: its groups, then the King himself; his decision; then the next place', () => {
    for (const n of ['plains', 'sunford']) p.clearNode(n as 'plains')
    p.profile.hero.learned.push('fireball')
    const hollows = { node: 'hollows', total: 3, boss: 'goblinKing' }
    expect(g.bossOf(['goblinKing', 'goblin'])).toBe('goblinKing')
    expect(g.bossOf(['banditChief', 'bandit'])).toBe('')
    expect(g.nextGoal(inZone({ ...hollows, done: 1 }))).toEqual({ id: 'clear', place: 'hollows', n: 1, of: 3 })
    expect(g.nextGoal(inZone({ ...hollows, done: 2 }))).toEqual({ id: 'boss', foe: 'goblinKing' })
    // Run straight into the King: he is the goal while he fights.
    expect(g.nextGoal(inZone({ ...hollows, done: 0, bossAwake: true }))).toEqual({ id: 'boss', foe: 'goblinKing' })
    p.clearNode('hollows')
    expect(g.nextGoal(at('zone', 'hollows', { quest: 'goblinKing', zone: zone({ ...hollows, done: 3, ended: 'victory' }) }))).toEqual({ id: 'decide' })
    p.decideQuest('goblinKing', 'slay')
    // The colosseum opened too, but the story's road goes on to the Woods.
    expect(g.nextGoal(at('map', 'hollows'))).toEqual({ id: 'travel', place: 'woods' })
    expect(g.nextGoal(at('town', 'sunford'))).toEqual({ id: 'leave', place: 'woods' })
  })

  it('the colosseum counts its waves; a pending decision outranks everything', () => {
    expect(g.nextGoal(at('zone', 'arena', { zone: zone({ kind: 'arena', node: 'arena', wave: 3 }) }))).toEqual({ id: 'wave', n: 2, of: 8 })
    expect(g.nextGoal(at('map', 'plains', { quest: 'goblinKing' }))).toEqual({ id: 'decide' })
  })

  it('every open place cleared: explore', () => {
    for (const n of ['plains', 'sunford', 'hollows', 'woods']) p.clearNode(n as 'plains')
    // Close the rest by clearing them as well (the whole map).
    for (const n of ['outskirts', 'oakhaven', 'crags', 'mines', 'ironhold', 'tundra', 'temple', 'citadel', 'peak', 'fortress']) p.clearNode(n as 'plains')
    expect(g.nextGoal(at('map', 'fortress'))).toEqual({ id: 'explore' })
  })

  it('a goal is one comparable string; its progress changes it', () => {
    expect(g.goalSig({ id: 'clear', place: 'plains', n: 1, of: 3 })).not.toBe(g.goalSig({ id: 'clear', place: 'plains', n: 2, of: 3 }))
    expect(g.goalSig(null)).toBe('')
  })

  it('tapping the tracker brings back the right pointer for each goal', () => {
    expect(g.GOAL_LESSON).toMatchObject({ trainer: 'talk', points: 'attr', leave: 'exit', travel: 'travel', clear: 'move' })
  })
})

describe('the guided first town visit (roadmap #3)', () => {
  const ctx = (over: Partial<FeatureCtx> = {}): FeatureCtx => ({
    screen: 'town', modal: '', talk: '', talkPhase: 'idle', npcRole: '', trainerCls: '', node: 'sunford', family: 'touch',
    dom: { has: () => false, attr: () => null, all: () => [] }, ...over
  })

  it('the way to a trainer only while that is the goal; the way out once the town is done', async () => {
    const f = await import('@/game/coach/features')
    expect(f.stepOf('talk', ctx({ goal: 'trainer' }))).toEqual({ kind: 'world', here: true })
    expect(f.stepOf('talk', ctx({ goal: 'leave' }))).toBeNull()
    // The map button is not on the HUD yet: nothing to point at.
    expect(f.stepOf('exit', ctx({ goal: 'leave' }))).toBeNull()
    p.profile.tips['reveal:map'] = 1
    expect(f.stepOf('exit', ctx({ goal: 'leave' }))).toEqual({ kind: 'tap', at: '[data-coach="menu-map"]', here: true })
    expect(f.stepOf('exit', ctx({ goal: 'points' }))).toBeNull()
    expect(f.stepOf('exit', ctx({ goal: 'leave', talk: 'npc' }))).toBeNull()
  })

  it('in town the order is: the trainer, the hero sheet, then the bag, then the way out', async () => {
    const f = await import('@/game/coach/features')
    const o = f.FEATURE_ORDER
    expect(o.indexOf('talk')).toBeLessThan(o.indexOf('attr'))
    expect(o.indexOf('attr')).toBeLessThan(o.indexOf('equip'))
    expect(o.indexOf('equip')).toBeLessThan(o.indexOf('exit'))
  })

  it('the tracker\'s tap puts its lesson first, at once', async () => {
    const { Pacer } = await import('@/game/coach/pacing')
    const pc = new Pacer()
    pc.breathe(0)
    pc.step({ now: 1, want: ['equip', 'attr'], blocked: false, reveals: [] })
    pc.retire('equip')
    // Another feature would wait for the next pause; asked for, it shows now.
    pc.prefer('attr', 2)
    expect(pc.step({ now: 2.05, want: ['attr'], blocked: false, reveals: [] })).toMatchObject({ lesson: 'attr', shown: true })
  })
})
