import { describe, expect, it } from 'vitest'
import { Sim } from '@/game/sim/world'
import { createHero, orderAttack, orderMove } from '@/game/sim/hero'
import { applyPlan, populateZone } from '@/game/sim/director'
import { generateZone } from '@/game/sim/zoneGen'
import { stepSim } from '@/game/sim/step'
import { hashSeed } from '@/game/sim/rng'
import { OPENING, ZONES } from '@/game/data/zones'
import { castSkill, slotState, usePotion } from '@/game/sim/hero'
import { noGear } from '@/game/data/items'
import { startAttrs } from '@/game/data/attributes'
import { spawnDummy } from '@/game/coach/dummy'

/**
 * ─── The opening fight's yardstick (owner, 2026-10-04) ──────────────────────
 *
 * The first visit of a new save (Sunford Plains, tutorial layout, the level-1
 * recruit in his starting gear) is tuned against the most naive way to play
 * it: click the dummy, then click the nearest enemy and let the hero swing
 * until it falls, then the next — never a skill, never a potion, never pulling
 * one enemy away from its pack, never cancelling a swing. That player must
 * win with 1 to 5 health left. Anyone who uses the skill on 1, drinks, or
 * fights smarter has room to spare; the naive clicker scrapes through.
 */

export interface NaiveRun { outcome: string; hp: number; maxHp: number; seconds: number; level: number; trace: string[] }

/** `react`: seconds between the player's looks at the screen (a click takes that long to come). */
export const naiveRun = (react = 0.25, tune: { pack: number; dmg: number } = OPENING, play: { skills?: boolean; potions?: boolean } = {}): NaiveRun => {
  const def = ZONES.plains
  const plan = generateZone(def, hashSeed('plains', 0), { tutorial: true, openingPack: tune.pack })
  const sim = new Sim({ seed: hashSeed('plains', 0), w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'zone', zone: 'plains' })
  sim.enemyDmgMul = tune.dmg
  sim.holdLevelUp = true
  applyPlan(sim, plan)
  const equipped = { ...noGear(), main: 'rustedShortsword', off: 'woodenBuckler', body: 'paddedTunic' }
  createHero(sim, { build: { level: 1, attrs: startAttrs(), equipped, passives: [] }, skills: ['shieldSlam'], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3 })
  populateZone(sim, plan, 'plains', ['rustedShortsword', 'woodenBuckler', 'paddedTunic'], [])
  const dummy = spawnDummy(sim, plan)
  const h = sim.hero
  const u = h.unit
  const trace: string[] = []
  let think = 0
  let target = 0
  let lastLevel = h.level
  while (!sim.ended && sim.time < 600) {
    think -= 1 / 30
    if (think <= 0) {
      think = react
      const cur = target ? sim.units.find(e => e.id === target && e.alive) : undefined
      if (!cur) {
        target = 0
        if (dummy && dummy.alive) { target = dummy.id; orderAttack(sim, dummy.id) }
        else {
          let best: (typeof sim.units)[number] | undefined
          let bd = Infinity
          for (const e of sim.units) {
            if (!e.alive || e.team !== 1 || !e.awake) continue
            const d = Math.hypot(e.x - u.x, e.z - u.z)
            if (d < bd) { bd = d; best = e }
          }
          if (best) { target = best.id; orderAttack(sim, best.id) }
          else {
            const next = sim.groups.find(g => !g.cleared)
            if (next && (h.order.kind !== 'move' || Math.hypot(h.order.x - next.x, h.order.z - next.z) > 1)) orderMove(sim, next.x, next.z)
          }
        }
      }
    }
    // A player who does use the skill on 1 and drinks at a third (the comparison).
    if (play.potions && u.hp < u.s.maxHp * 0.33) usePotion(sim)
    if (play.skills && target && slotState(sim, 0).ready && Math.hypot((sim.units.find(e => e.id === target)?.x ?? 1e9) - u.x, (sim.units.find(e => e.id === target)?.z ?? 1e9) - u.z) < 3) castSkill(sim, 0, null)
    stepSim(sim, plan, 1 / 30)
    for (const ev of sim.events) {
      if (ev.t === 'levelUp') trace.push(`${sim.time.toFixed(1)}s level ${ev.level} (full heal)`)
      if (ev.t === 'death' && ev.team === 1) trace.push(`${sim.time.toFixed(1)}s ${ev.kind} falls (group ${sim.units.find(x => x.id === ev.unit)?.group}), hero ${Math.round(u.hp)}/${Math.round(u.s.maxHp)}, xp ${h.xp}`)
    }
    sim.events.length = 0
    if (h.level !== lastLevel) lastLevel = h.level
  }
  trace.push(`${sim.time.toFixed(1)}s ${sim.ended || 'timeout'} with ${Math.max(0, Math.round(u.hp))}/${Math.round(u.s.maxHp)}`)
  return { outcome: sim.ended, hp: Math.max(0, u.hp), maxHp: u.s.maxHp, seconds: sim.time, level: h.level, trace }
}

describe('the opening fight', () => {
  it('a naive clicker (no skill, no potion, no pulling) wins with 1 to 5 health left', () => {
    const r = naiveRun()
    expect(r.outcome).toBe('victory')
    expect(r.hp).toBeGreaterThanOrEqual(1)
    expect(r.hp).toBeLessThanOrEqual(5)
  })
})


describe('the opening fight for a player who plays it', () => {
  it('the skill on 1 makes it comfortable: a quarter of the health left or more, no potion needed', () => {
    const r = naiveRun(0.25, OPENING, { skills: true })
    expect(r.outcome).toBe('victory')
    expect(r.hp / r.maxHp).toBeGreaterThanOrEqual(0.25)
  })

  it('drinking when low is enough on its own', () => {
    const r = naiveRun(0.25, OPENING, { potions: true })
    expect(r.outcome).toBe('victory')
    expect(r.hp / r.maxHp).toBeGreaterThanOrEqual(0.25)
  })

  it('how fast the player clicks does not change it (the hero takes the next enemy on his own)', () => {
    const hp = [0.1, 0.25, 0.5].map(r => Math.round(naiveRun(r).hp))
    expect(new Set(hp).size).toBe(1)
  })

  it('the first level-up waits for the result screen: nothing refills the fight', () => {
    const r = naiveRun()
    expect(r.level).toBe(1)
    expect(r.trace.some(l => l.includes('full heal'))).toBe(false)
  })

  it('a replay of the plains is the zone as tabled (only the first visit is the opening)', () => {
    const a = generateZone(ZONES.plains, 99, {})
    const b = generateZone(ZONES.plains, 99, { openingPack: OPENING.pack })
    expect(b.packs.map(p => p.kinds)).toEqual(a.packs.map(p => p.kinds))
  })
})
