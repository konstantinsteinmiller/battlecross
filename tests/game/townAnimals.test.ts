// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { stubCanvas } from './zfightTools'

/**
 * The towns' animals (roadmap #97): who lives in which town, and the three
 * things they do for the hero — the dog trots up and sits, the strolling cat
 * keeps out of reach, the squirrel runs up its tree and hides.
 */

stubCanvas()

const build = async (town: 'sunford' | 'oakhaven' | 'ironhold' | 'silverbridge', flags: string[] = [], low = false) => {
  const { generateTown } = await import('@/game/sim/zoneGen')
  const { TOWNS } = await import('@/game/data/zones')
  const { setGround } = await import('@/game/gfx/ground')
  const { Sim } = await import('@/game/sim/world')
  const { TownAnimals } = await import('@/game/gfx/townAnimals')
  const plan = generateTown(TOWNS[town], new Set(flags), 7)
  setGround({ w: plan.w, h: plan.h, height: plan.height })
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 1, difficulty: 1, mode: 'town', zone: town })
  const zoo = new TownAnimals(plan.town!, plan.w, plan.h, sim.grid, [])
  if (!plan.town!.ruined) zoo.populate(low, plan.seed)
  return { plan, zoo }
}

const count = (zoo: { beasts: Array<{ kind: string }> }, kind: string): number => zoo.beasts.filter(b => b.kind === kind).length

describe('the towns\' animals (#97)', () => {
  it('every living town has cats and a dog; the leafy ones squirrels; the rural ones chickens', async () => {
    for (const town of ['sunford', 'oakhaven', 'ironhold', 'silverbridge'] as const) {
      const { plan, zoo } = await build(town)
      expect(count(zoo, 'cat'), town).toBeGreaterThanOrEqual(2)
      expect(count(zoo, 'dog'), town).toBeGreaterThanOrEqual(1)
      const trees = plan.town!.props.filter(p => p.kind === 'tree').length
      if (trees) expect(count(zoo, 'squirrel'), town).toBeGreaterThanOrEqual(1)
      if (plan.town!.style === 'mountain') expect(count(zoo, 'chicken'), town).toBe(0)
      // Each stands on open town ground, never in a house or a wall.
      for (const b of zoo.beasts) {
        const c = plan.town!.cell[Math.floor(b.z / 1.5) * plan.w + Math.floor(b.x / 1.5)]
        expect([0, 1, 2, 6, 9], `${town} ${b.kind} at ${b.x.toFixed(1)}, ${b.z.toFixed(1)}`).toContain(c)
      }
    }
  })

  it('the big town has the most; a weak device fewer; a burnt town none', async () => {
    const big = await build('silverbridge')
    const small = await build('sunford')
    expect(big.zoo.beasts.length).toBeGreaterThanOrEqual(small.zoo.beasts.length)
    const low = await build('silverbridge', [], true)
    expect(low.zoo.beasts.length).toBeLessThan(big.zoo.beasts.length)
    expect(low.zoo.beasts.length).toBeGreaterThan(0)
    const fallen = await build('oakhaven', ['oakhavenFallen'])
    expect(fallen.zoo.beasts).toHaveLength(0)
  })

  it('the dog trots up to the hero and sits at his feet, then goes back to its rounds', async () => {
    const { zoo } = await build('sunford')
    const dog = zoo.beasts.find(b => b.kind === 'dog')!
    // The hero a few steps off, on open ground the dog can walk to.
    const canWalk = (zoo as unknown as { canWalk: (ax: number, az: number, bx: number, bz: number) => boolean }).canWalk.bind(zoo)
    let hx = dog.x
    let hz = dog.z
    for (let a = 0; a < 16; a++) {
      const x = dog.x + Math.cos(a * 0.39) * 4
      const z = dog.z + Math.sin(a * 0.39) * 4
      if (canWalk(dog.x, dog.z, x, z)) { hx = x; hz = z; break }
    }
    expect(hx !== dog.x || hz !== dog.z).toBe(true)
    const start = Math.hypot(hx - dog.x, hz - dog.z)
    for (let i = 0; i < 30; i++) zoo.update(1 / 20, hx, hz)
    expect(dog.mode).toBe('greet')
    expect(Math.hypot(hx - dog.x, hz - dog.z)).toBeLessThan(start)
    // Within its seven seconds it reaches him and sits (its sitting body shown).
    for (let i = 0; i < 70; i++) zoo.update(1 / 20, hx, hz)
    expect(dog.mode).toBe('greet')
    expect(Math.hypot(hx - dog.x, hz - dog.z)).toBeLessThan(1.6)
    expect(dog.sit!.visible).toBe(true)
    // After a while it loses interest, and waits before greeting again.
    for (let i = 0; i < 200; i++) zoo.update(1 / 20, hx, hz)
    expect(dog.mode).not.toBe('greet')
    expect(dog.cool).toBeGreaterThan(0)
  })

  it('a squirrel runs up its tree when the hero comes near, hides, and comes down when he has gone', async () => {
    const { zoo } = await build('sunford')
    const sq = zoo.beasts.find(b => b.kind === 'squirrel')
    if (!sq) return
    for (let i = 0; i < 200 && sq.obj.visible; i++) zoo.update(1 / 20, sq.x + 1, sq.z)
    expect(sq.obj.visible).toBe(false)
    expect(sq.mode).toBe('sit')
    // The hero far away: it comes back down to the ground.
    for (let i = 0; i < 200 && sq.mode !== 'idle'; i++) zoo.update(1 / 20, sq.x + 40, sq.z)
    expect(sq.obj.visible).toBe(true)
    expect(sq.mode).toBe('idle')
  })

  it('a strolling cat keeps out of the hero\'s reach; a doorstep cat watches him', async () => {
    const { zoo } = await build('silverbridge')
    const stroller = zoo.beasts.find(b => b.kind === 'cat' && !b.sitter)!
    for (let i = 0; i < 10; i++) zoo.update(1 / 20, stroller.x + 1, stroller.z)
    expect(stroller.mode).toBe('walk')
    expect(stroller.tx).toBeLessThan(stroller.x + 0.01)
    const sitter = zoo.beasts.find(b => b.kind === 'cat' && b.sitter)!
    for (let i = 0; i < 40; i++) zoo.update(1 / 20, sitter.x + 3, sitter.z)
    // Looking toward him (to its right of where it faces, within reach).
    expect(Math.abs(sitter.head!.rotation.y)).toBeGreaterThan(0.2)
  })
})
