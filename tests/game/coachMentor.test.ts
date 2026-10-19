import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { applyPlan, populateZone } from '@/game/sim/director'
import { stepSim } from '@/game/sim/step'
import { generateZone, type ZonePlan } from '@/game/sim/zoneGen'
import { isSolidAt } from '@/game/sim/grid'
import { ZONES } from '@/game/data/zones'
import { noGear } from '@/game/data/items'
import { startAttrs } from '@/game/data/attributes'
import { SKILL_BY_ID } from '@/game/data/skills'
import { MENTOR_MET_TIP, MENTOR_NPC, MENTOR_SKILL, ROAD_NPCS } from '@/game/data/mentor'
import { conversationOf } from '@/game/data/dialogs'
import { DialogRunner } from '@/game/dialog/runner'
import type { DialogHost, DialogWorld } from '@/game/dialog/types'
import { MENTOR_DELAY, MENTOR_ENTRY, armMentor, mentorBeat, mentorCue, mentorUnit, stepMentor, syncHeroSkills } from '@/game/coach/mentor'
import { nextGoal, type GoalCtx } from '@/game/coach/goal'
import { objectiveOf } from '@/game/coach/world'
import { learnBlock, learnSkill, lesson, profile, skillCost } from '@/game/state/profile'

/**
 * The road teacher of the opening fight (roadmap #136): Nettle Quickhand walks
 * in from the top of the screen once the first pack (two goblins) is down and
 * waits where it fell. She comes only then, in the right place, the same way
 * every time, and her talk is the trainer's window and nothing else.
 */

const SEEDS = [...Array.from({ length: 20 }, (_, k) => k + 1), 1234, 99991]
const DT = 1 / 30

const visit = (seed = 7, arm = true): { sim: Sim; plan: ZonePlan } => {
  const plan = generateZone(ZONES.plains, seed, { tutorial: true, openingPack: 5 })
  const sim = new Sim({ seed, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped: noGear(), passives: [] }, skills: ['shieldSlam'], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, 'plains', [])
  if (arm) armMentor(sim)
  return { sim, plan }
}

/** One step of the visit as the scene runs it: the sim, then the beat. */
const tick = (sim: Sim, plan: ZonePlan): void => {
  stepSim(sim, plan, DT)
  stepMentor(sim, DT)
}

/** The first pack falls where it stood, with the hero fighting beside it. */
const fell = (sim: Sim, plan: ZonePlan): void => {
  const g = plan.packs[0]!
  sim.hero.unit.x = sim.hero.unit.px = g.x
  sim.hero.unit.z = sim.hero.unit.pz = g.z + 4
  for (const u of sim.units) if (u.team === 1 && u.group === 0) { u.hp = 0; u.alive = false }
  tick(sim, plan)
}

describe('the road teacher: when she comes', () => {
  it('not while the first pack stands, however long the hero waits', () => {
    const { sim, plan } = visit()
    for (let i = 0; i < 30 * 12; i++) tick(sim, plan)
    expect(mentorUnit(sim)).toBeNull()
    expect(mentorBeat(sim)).toBe('wait')
    expect(mentorCue(sim)).toBe(false)
  })

  it('a visit that never armed her has none, whatever falls', () => {
    const { sim, plan } = visit(7, false)
    fell(sim, plan)
    for (let i = 0; i < 30 * 8; i++) tick(sim, plan)
    expect(mentorUnit(sim)).toBeNull()
    expect(mentorBeat(sim)).toBeNull()
  })

  it('the first pack is the two goblins, and she is seen a beat after they fall — not before', () => {
    const { sim, plan } = visit()
    expect(plan.packs[0]!.kinds).toHaveLength(2)
    fell(sim, plan)
    expect(mentorUnit(sim)).toBeNull()
    for (let t = 0; t < MENTOR_DELAY - 0.2; t += DT) tick(sim, plan)
    expect(mentorUnit(sim)).toBeNull()
    for (let t = 0; t < 0.6; t += DT) tick(sim, plan)
    expect(mentorUnit(sim)).not.toBeNull()
  })
})

describe('the road teacher: where she walks and stands', () => {
  it('comes in from the top of the screen and stops where the goblins fell', () => {
    for (const seed of SEEDS) {
      const { sim, plan } = visit(seed)
      fell(sim, plan)
      let start: { x: number; z: number } | null = null
      let steps = 0
      while (mentorBeat(sim) !== 'stand' && steps++ < 30 * 20) {
        tick(sim, plan)
        const u = mentorUnit(sim)
        if (u && !start) start = { x: u.x, z: u.z }
      }
      const u = mentorUnit(sim)!
      const g = plan.packs[0]!
      expect(mentorBeat(sim), `#${seed}`).toBe('stand')
      // Where the first pack stood (a little further back if the hero stood on it).
      expect(Math.hypot(u.x - g.x, u.z - g.z), `#${seed} at the pack`).toBeLessThan(3)
      expect(isSolidAt(sim.grid, u.x, u.z), `#${seed} on open ground`).toBe(false)
      // She started higher up the screen (smaller z), far enough to be out of it, and walked.
      expect(start!.z, `#${seed} from the top`).toBeLessThan(u.z - 4)
      expect(Math.hypot(start!.x - u.x, start!.z - u.z), `#${seed}`).toBeLessThanOrEqual(MENTOR_ENTRY + 1)
      expect(u.rank).toBe('npc')
      expect(u.npc).toBe(MENTOR_NPC)
      expect(u.team).toBe(0)
    }
  })

  it('puffs in when she appears and again when she arrives; walks in between', () => {
    const { sim, plan } = visit()
    fell(sim, plan)
    sim.events.length = 0
    const seen: string[] = []
    let walked = false
    for (let i = 0; i < 30 * 20 && mentorBeat(sim) !== 'stand'; i++) {
      tick(sim, plan)
      if (mentorUnit(sim)?.anim === 'walk') walked = true
      for (const e of sim.events) if (e.t === 'fx' && e.id === 'blink') seen.push(e.id)
      sim.events.length = 0
    }
    expect(walked).toBe(true)
    expect(seen).toHaveLength(2)
  })

  it('stays where she is, facing the hero, once there', () => {
    const { sim, plan } = visit()
    fell(sim, plan)
    for (let i = 0; i < 30 * 20 && mentorBeat(sim) !== 'stand'; i++) tick(sim, plan)
    const u = mentorUnit(sim)!
    const at = [u.x, u.z]
    sim.hero.unit.x += 3
    for (let i = 0; i < 30 * 5; i++) tick(sim, plan)
    expect([u.x, u.z]).toEqual(at)
    expect(Math.abs(Math.sin(u.facing) - Math.sin(Math.atan2(sim.hero.unit.x - u.x, sim.hero.unit.z - u.z)))).toBeLessThan(0.01)
  })

  it('is the same every time: same seed, same steps, same walk — and the fight\'s dice are untouched', () => {
    const run = (arm: boolean): { trace: number[][]; rng: number } => {
      const { sim, plan } = visit(11, arm)
      fell(sim, plan)
      const trace: number[][] = []
      for (let i = 0; i < 30 * 12; i++) {
        tick(sim, plan)
        const u = mentorUnit(sim)
        if (u) trace.push([u.x, u.z, u.facing])
      }
      return { trace, rng: sim.rng() }
    }
    const a = run(true)
    const b = run(true)
    expect(a.trace.length).toBeGreaterThan(30)
    expect(b.trace).toEqual(a.trace)
    // Not one die rolled for her: the next roll is the one an unarmed visit makes.
    expect(a.rng).toBe(run(false).rng)
  })

  it('leaves no one in the way of a hero who walks on: the cue ends, nothing waits on her', () => {
    const { sim, plan } = visit()
    fell(sim, plan)
    for (let i = 0; i < 30 * 20 && mentorBeat(sim) !== 'stand'; i++) tick(sim, plan)
    expect(mentorCue(sim)).toBe(true)
    sim.groups[1]!.awake = true
    tick(sim, plan)
    expect(mentorCue(sim)).toBe(false)
    expect(mentorUnit(sim)).not.toBeNull()
  })

  it('a saved visit that gave her back is picked up where she stands', () => {
    const { sim, plan } = visit()
    fell(sim, plan)
    for (let i = 0; i < 30 * 20 && mentorBeat(sim) !== 'stand'; i++) tick(sim, plan)
    const u = mentorUnit(sim)!
    const at = [u.x, u.z]
    // A fresh scene over the same units (the arm is all a reload does).
    armMentor(sim)
    expect(mentorBeat(sim)).toBe('wait')
    stepMentor(sim, DT)
    expect(mentorBeat(sim)).toBe('stand')
    expect([mentorUnit(sim)!.x, mentorUnit(sim)!.z]).toEqual(at)
    expect(sim.units.filter(x => x.npc === MENTOR_NPC)).toHaveLength(1)
  })
})

describe('the road teacher: the goal and the cue', () => {
  const ctx = (mentor: boolean): GoalCtx => ({
    screen: 'zone', node: 'plains', modal: '', quest: '',
    zone: { kind: 'zone', node: 'plains', done: 1, total: 3, boss: '', ended: '', dummy: false, mentor, wave: 0, waves: 8 }
  })

  it('she is the goal while she waits, then the road is', () => {
    expect(nextGoal(ctx(true))).toEqual({ id: 'trainer' })
    expect(nextGoal(ctx(false))?.id).toBe('clear')
  })

  it('the pointer leads to her, even though her lesson costs nothing the hero has', () => {
    const { sim, plan } = visit()
    fell(sim, plan)
    for (let i = 0; i < 30 * 20 && mentorBeat(sim) !== 'stand'; i++) tick(sim, plan)
    const o = objectiveOf(sim, 'trainer')!
    const u = mentorUnit(sim)!
    expect(o).toMatchObject({ kind: 'trainer', npc: MENTOR_NPC, x: u.x, z: u.z })
  })
})

describe('the road teacher: her lesson', () => {
  it('is a trainer of the Shadow class who is in no town', () => {
    const def = ROAD_NPCS.find(n => n.id === MENTOR_NPC)!
    expect(def).toMatchObject({ role: 'trainer', cls: 'shadow', look: 'sfShadow' })
    expect(SKILL_BY_ID[MENTOR_SKILL]!.cls).toBe('shadow')
  })

  it('her talk is one hook, the trainer\'s window and a parting word — no other topic', () => {
    const conv = conversationOf(MENTOR_NPC)!
    expect(conv.voice).toBe('sfShadow')
    expect(conv.nodes.root!.choices.map(c => c.id)).toEqual(['train'])
    const opened: string[] = []
    const world: DialogWorld = {
      level: 1, gold: 0, attrs: startAttrs(), flags: new Set(), rep: { order: 0, syndicate: 0, circle: 0, none: 0 } as never,
      quests: {}, cleared: new Set(), said: new Set(), errands: {}
    }
    const host: DialogHost = {
      world: () => world,
      remember: (k) => { (world.said as Set<string>).add(k) },
      give: () => {}, hint: () => {}, decide: () => true,
      open: (w) => { opened.push(w) },
      offer: () => null, buy: () => false, errand: () => true, learnSmith: () => {}
    }
    const r = new DialogRunner(conv, host)
    const heard: string[] = []
    const hear = (): void => { while (r.view().phase === 'line') { heard.push(r.view().line!.id); r.next() } }
    r.start()
    hear()
    expect(heard).toEqual(['dlg.sfShadowRoad.hello.1'])
    expect(r.view().choices.map(c => c.id)).toEqual(['train', 'end'])
    expect(r.pick('train')).toBe(true)
    hear()
    expect(opened).toEqual(['trainer'])
    r.resume()
    hear()
    expect(heard[heard.length - 1]).toBe('dlg.sfShadowRoad.trainBack.1')
    expect(r.view().choices.map(c => c.id)).toEqual(['train', 'end'])
    // Met once: the everyday greeting takes over.
    const again = new DialogRunner(conv, host)
    again.start()
    expect(again.view().line!.id).toBe('dlg.sfShadowRoad.again.1')
  })

  it('teaches the teleport for nothing, only while she is the one teaching', () => {
    const gold = profile.gold
    const learned = [...profile.hero.learned]
    const active = [...profile.hero.active]
    try {
      profile.gold = 0
      profile.hero.learned = ['shieldSlam']
      lesson.free = ''
      expect(skillCost(MENTOR_SKILL)).toBeGreaterThan(0)
      expect(learnBlock(MENTOR_SKILL)).toBe('gold')
      lesson.free = MENTOR_SKILL
      expect(skillCost(MENTOR_SKILL)).toBe(0)
      // Her gift is that one skill: the Shadow's second still costs and needs its level.
      expect(skillCost('lethality')).toBeGreaterThan(0)
      expect(learnBlock(MENTOR_SKILL)).toBe('')
      expect(learnSkill(MENTOR_SKILL)).toBe(true)
      expect(profile.gold).toBe(0)
      expect(profile.hero.learned).toContain(MENTOR_SKILL)
      expect(profile.hero.active).toContain(MENTOR_SKILL)
    } finally {
      lesson.free = ''
      profile.gold = gold
      profile.hero.learned = learned
      profile.hero.active = active
      delete profile.tips[MENTOR_MET_TIP]
    }
  })

  it('a skill learned on the way fills its empty slot in the live hero, ready at once', () => {
    const { sim } = visit()
    const h = sim.hero
    expect(h.skills[0]).toBe('shieldSlam')
    expect(h.skills[1]).toBe('')
    h.cd[1] = 9
    expect(syncHeroSkills(sim, ['shieldSlam', MENTOR_SKILL])).toBe(true)
    expect(h.skills[0]).toBe('shieldSlam')
    expect(h.skills[1]).toBe(MENTOR_SKILL)
    expect(h.cd[1]).toBe(0)
    // Nothing to add the second time, and a held slot is never overwritten.
    expect(syncHeroSkills(sim, ['pyro', MENTOR_SKILL])).toBe(false)
    expect(h.skills[0]).toBe('shieldSlam')
  })
})

describe('the road teacher: her stride reaches the rig', () => {
  it('walks in with a velocity along her heading, so the rig plays the walk cycle', () => {
    const { sim, plan } = visit()
    fell(sim, plan)
    for (let t = 0; t < MENTOR_DELAY + 0.4; t += DT) tick(sim, plan)
    let walked = 0
    for (let i = 0; i < 30 * 3 && mentorBeat(sim) === 'walk'; i++) {
      tick(sim, plan)
      const u = mentorUnit(sim)!
      if (mentorBeat(sim) !== 'walk') break
      const speed = Math.hypot(u.vx, u.vz)
      expect(u.anim).toBe('walk')
      expect(speed).toBeGreaterThan(2)
      // she faces the way she goes
      expect(u.vx * Math.sin(u.facing) + u.vz * Math.cos(u.facing)).toBeGreaterThan(speed * 0.8)
      walked++
    }
    expect(walked).toBeGreaterThan(10)
  })
})
