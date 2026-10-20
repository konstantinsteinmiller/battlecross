import { describe, expect, it } from 'vitest'
import { Sim, hasStatus } from '@/game/sim/world'
import { createHero } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { cellIndex, raiseWall } from '@/game/sim/actors'
import { dealDamage } from '@/game/sim/combat'
import { startAttrs } from '@/game/data/attributes'
import { laneLength } from '@/game/sim/bosses/kit'
import { CHIMERA_TUNING, HEAD_COLOR } from '@/game/sim/bosses/chimera'
import type { SimEvent, Unit } from '@/game/sim/types'

/**
 * The Chimera (afterplay §5.1): every move comes from one head, which glows
 * its colour first; a pounce into a pillar dazes it; at 60 % two heads glow
 * and only the dark head's third of the ground is safe; at 30 % the serpent
 * tail is cut off and fights alone, and the chimera is a quarter faster.
 */

const plan = generateArena(7)
const arena = (): Sim => {
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 37, difficulty: 1, mode: 'zone', zone: 'woods' })
  applyPlan(sim, plan)
  createHero(sim, {
    build: { level: 37, attrs: startAttrs(), equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
    skills: [], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 0
  })
  sim.hero.unit.s.maxHp = sim.hero.unit.hp = 1e7
  return sim
}
/** Step, keeping every event (`seen`), until `until` holds. */
const step = (sim: Sim, seconds: number, until?: () => boolean, seen?: SimEvent[]): void => {
  for (let t = 0; t < seconds; t += 1 / 30) {
    stepSim(sim, plan, 1 / 30)
    if (seen) seen.push(...sim.events)
    sim.events.length = 0
    if (until?.()) return
  }
}
/** The chimera `dist` m off along an open lane, awake, only the moves a test names ready, no props of its own. */
const chimera = (sim: Sim, ready: string[] = [], dist = 8): Unit => {
  const h = sim.hero.unit
  let ax = 0
  let az = -1
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2
    if (laneLength(sim, h.x, h.z, Math.sin(a), Math.cos(a), dist + 6) >= dist + 5) { ax = Math.sin(a); az = Math.cos(a); break }
  }
  const c = spawnEnemy(sim, 'chimera', h.x + ax * dist, h.z + az * dist)!
  c.awake = true
  c.targetId = h.id
  c.homeX = c.x
  c.homeZ = c.z
  c.boss!.marks.push('arena')
  for (let i = 0; i < c.cds.length; i++) c.cds[i] = 99
  for (const k of ['pounce', 'cone', 'lob', 'twin']) c.boss!.cd[k] = ready.includes(k) ? 0 : 99
  return c
}
const glows = (seen: SimEvent[], color: string): number => seen.filter(e => e.t === 'fx' && e.id === 'mark' && e.color === color).length

describe('the Chimera (afterplay §5.1)', () => {
  it('a head glows its colour, and its warning shows, before the blow lands', () => {
    const sim = arena()
    const h = sim.hero.unit
    const c = chimera(sim, ['cone'], 3)
    const seen: SimEvent[] = []
    const hp = h.hp
    let teleAt = -1
    let hitAt = -1
    for (let i = 0; i < 90 && hitAt < 0; i++) {
      step(sim, 1 / 30, undefined, seen)
      if (teleAt < 0 && seen.some(e => e.t === 'tele' && e.tele.src === c.id)) teleAt = sim.time
      if (h.hp < hp) hitAt = sim.time
    }
    expect(glows(seen, HEAD_COLOR.goat)).toBe(1)
    expect(teleAt).toBeGreaterThan(0)
    expect(hitAt).toBeGreaterThan(0)
    // The goat's glow and its cone are up for its whole wind-up first.
    expect(hitAt - teleAt).toBeGreaterThanOrEqual(CHIMERA_TUNING.GLOW - 0.05)
    expect(hasStatus(h, 'slow')).toBe(true)
  })

  it('the lion pounces down a lane; into a pillar it stands dazed 3 s', () => {
    const sim = arena()
    const h = sim.hero.unit
    const c = chimera(sim, ['pounce'], 7)
    const seen: SimEvent[] = []
    step(sim, 1, () => c.action?.id === 'charge', seen)
    expect(c.action?.id).toBe('charge')
    expect(glows(seen, HEAD_COLOR.lion)).toBe(1)
    // A pillar between them; the hero steps aside.
    const a = c.action!.a
    raiseWall(sim, [cellIndex(sim, c.x + Math.sin(a) * 4, c.z + Math.cos(a) * 4)], 1e6, 'pillar')
    h.x += Math.cos(a) * 4
    h.z -= Math.sin(a) * 4
    step(sim, 3, () => c.boss!.mode === 'dazed')
    expect(c.boss!.mode).toBe('dazed')
    step(sim, CHIMERA_TUNING.PILLAR_DAZE - 0.4)
    expect(hasStatus(c, 'stun')).toBe(true)
    // The pillar stands: it is the clearing's, not a thing to break.
    expect(sim.walls.some(w => w.fx === 'pillar')).toBe(true)
  })

  it('at 60 % two heads glow at once: the dark head\'s third is safe, a glowing one is not', () => {
    const run = (safe: boolean): number => {
      const sim = arena()
      const h = sim.hero.unit
      const c = chimera(sim, [], 4)
      c.hp = c.s.maxHp * 0.59
      // Phase 2 begins; then only the pair is ready.
      step(sim, 2.5, () => c.boss!.phase === 2 && !c.action)
      c.boss!.cd.twin = 0
      c.boss!.next = 0
      const seen: SimEvent[] = []
      step(sim, 1, () => c.action?.id === 'cone', seen)
      expect(c.action?.id).toBe('cone')
      // Two heads glow: the bits of the pair.
      expect([HEAD_COLOR.lion, HEAD_COLOR.goat, HEAD_COLOR.serpent].filter(col => glows(seen, col) > 0).length).toBe(2)
      const lit = seen.filter(e => e.t === 'tele' && e.tele.shape === 'cone' && e.tele.src === c.id).map(e => (e as Extract<SimEvent, { t: 'tele' }>).tele.a)
      expect(lit.length).toBe(2)
      // Where the dark third lies: the one of the three not lit.
      const base = Math.atan2(c.action!.x - c.x, c.action!.z - c.z)
      const thirds = [0, (Math.PI * 2) / 3, -(Math.PI * 2) / 3].map(o => base + o)
      const near = (x: number, y: number): boolean => Math.abs(Math.atan2(Math.sin(x - y), Math.cos(x - y))) < 0.05
      const dark = thirds.find(t => !lit.some(l => near(l, t)))!
      const go = safe ? dark : lit[0]!
      h.x = c.x + Math.sin(go) * 4
      h.z = c.z + Math.cos(go) * 4
      h.kx = h.kz = 0
      const hp = h.hp
      step(sim, 1.4, () => !c.action)
      return hp - h.hp
    }
    expect(run(true)).toBe(0)
    expect(run(false)).toBeGreaterThan(0)
  })

  it('at 30 % the serpent tail is cut off: a snake fights on, the chimera is faster and spits no more', () => {
    const sim = arena()
    const c = chimera(sim, [], 6)
    const speed = c.s.moveSpeed
    c.hp = c.s.maxHp * 0.29
    const seen: SimEvent[] = []
    step(sim, 2, undefined, seen)
    expect(c.boss!.phase).toBe(3)
    expect(sim.units.filter(u => u.alive && u.kind === 'chimeraTail').length).toBe(1)
    expect(c.s.moveSpeed).toBeCloseTo(speed * CHIMERA_TUNING.TAILLESS, 5)
    expect(seen.some(e => e.t === 'bark' && e.key === 'dlg.bark.chimera.tail.1')).toBe(true)
    // The serpent's spit is gone with it.
    c.boss!.cd.lob = 0
    c.boss!.next = 0
    const later: SimEvent[] = []
    step(sim, 3, undefined, later)
    expect(glows(later, HEAD_COLOR.serpent)).toBe(0)
  })

  it('raises its two stone pillars in the clearing, and says its last words', () => {
    const sim = arena()
    const h = sim.hero.unit
    const c = spawnEnemy(sim, 'chimera', h.x, h.z - 8)!
    step(sim, 0.2)
    expect(sim.walls.filter(w => w.fx === 'pillar').length).toBe(2)
    const seen: SimEvent[] = []
    c.awake = true
    sim.events.length = 0
    // A killing blow.
    dealDamage(sim, h, c, 1e6, { type: 'true', canCrit: false })
    seen.push(...sim.events)
    expect(c.alive).toBe(false)
    expect(seen.some(e => e.t === 'bark' && e.key === 'dlg.bark.chimera.death.1')).toBe(true)
  })
})
