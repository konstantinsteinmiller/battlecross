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

describe('the animals walk on their legs (#102)', () => {
  it('a paw on the ground stays put: slip under 2 % of the ground covered, in every gait and pace', async () => {
    const { WALK, TROT, BOUND, pawAt, legPose, strideFor, maxStride } = await import('@/game/gfx/townAnimals')
    const cases = [
      { g: WALK, len: 0.32, v: 1.13 }, { g: TROT, len: 0.32, v: 2.43 },
      { g: WALK, len: 0.18, v: 0.58 }, { g: TROT, len: 0.18, v: 1.38 },
      { g: BOUND, len: 0.05, v: 1.9 }
    ]
    for (const { g, len, v } of cases) {
      const stride = strideFor(g, len, v)
      expect(stride * g.duty, 'the paw never reaches past the leg').toBeLessThanOrEqual(1.1 * len + 1e-9)
      expect(stride).toBeLessThanOrEqual(maxStride(g, len) + 1e-9)
      // Walk the body for two cycles; follow the first leg's paw on the ground.
      const T = (2 * stride) / v
      let worst = 0
      let plantedAt: number | null = null
      for (let k = 0; k <= 400; k++) {
        const time = (k / 400) * T
        const body = v * time
        const p = pawAt(g, (body / stride) + g.offsets[0], stride, len)
        // The posed leg puts its paw exactly there.
        const q = legPose(p.z, p.lift, len)
        const pz = -len * q.stretch * Math.sin(q.pitch)
        const py = -len * q.stretch * Math.cos(q.pitch)
        expect(pz).toBeCloseTo(p.z, 9)
        expect(py).toBeCloseTo(-len + p.lift, 9)
        const ground = body + pz
        if (p.lift === 0) {
          if (plantedAt === null) plantedAt = ground
          worst = Math.max(worst, Math.abs(ground - plantedAt))
        } else plantedAt = null
      }
      expect(worst / (2 * stride), `${len} at ${v}`).toBeLessThan(0.02)
    }
  })

  it('a walking dog moves its legs; standing, they settle under it', async () => {
    const { zoo } = await build('sunford')
    const dog = zoo.beasts.find(b => b.kind === 'dog')!
    expect(dog.legs.length).toBe(4)
    dog.mode = 'walk'
    dog.tx = dog.x + 3
    dog.tz = dog.z
    const pitches = new Set<number>()
    for (let i = 0; i < 30; i++) {
      zoo.update(1 / 30, dog.x + 40, dog.z + 40)
      pitches.add(Math.round(dog.legs[0]!.obj.rotation.x * 100))
    }
    expect(pitches.size, 'the front leg swings').toBeGreaterThan(5)
    // Diagonal pairs move together in a trot or apart in a walk: never all alike.
    expect(new Set(dog.legs.map(l => Math.round(l.obj.rotation.x * 100))).size).toBeGreaterThan(1)
  })

  it('a walking or trotting dog never sinks a paw or its body into the ground, at any phase (#123)', async () => {
    const { Mesh, Vector3 } = await import('three')
    const { groundAt } = await import('@/game/gfx/ground')
    const { zoo } = await build('sunford')
    const dog = zoo.beasts.find(b => b.kind === 'dog')!
    const v = new Vector3()
    // The lowest point of the dog's lit meshes against the ground under each vertex.
    const lowest = (): number => {
      dog.obj.updateMatrixWorld(true)
      let worst = Infinity
      dog.obj.traverseVisible(o => {
        if (!(o instanceof Mesh) || o.renderOrder < 0) return
        const pos = o.geometry.getAttribute('position')
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld)
          worst = Math.min(worst, v.y - groundAt(v.x, v.z))
        }
      })
      return worst
    }
    // A stroll (the walk), then a dash to greet a far-off hero (the trot).
    for (const [speed, hero] of [[1.3, 60], [2.8, 6]] as const) {
      dog.mode = hero > 10 ? 'walk' : 'greet'
      dog.cool = hero > 10 ? 99 : 0
      dog.t = 30
      let worst = Infinity
      let walked = 0
      for (let i = 0; i < 120; i++) {
        dog.tx = dog.x + Math.cos(i * 0.01) * 4
        dog.tz = dog.z + Math.sin(i * 0.01) * 4
        const x0 = dog.x
        const z0 = dog.z
        zoo.update(1 / 60, dog.x - Math.cos(i * 0.01) * hero, dog.z - Math.sin(i * 0.01) * hero)
        walked += Math.hypot(dog.x - x0, dog.z - z0)
        if (dog.stand.visible) worst = Math.min(worst, lowest())
      }
      expect(walked, `it moved at ${speed}`).toBeGreaterThan(0.5)
      expect(worst, `the lowest paw at ${speed} m/s`).toBeGreaterThan(-0.01)
      // ...and it does stand on its paws, not hover over them.
      expect(worst, `the lowest paw at ${speed} m/s`).toBeLessThan(0.06)
    }
  })

  it('a dog sitting, sniffing about or greeting the hero rests on the ground, on grass and on the cobbles (#123)', async () => {
    const { Mesh, Vector3 } = await import('three')
    const { groundAt } = await import('@/game/gfx/ground')
    const { CELL } = await import('@/game/sim/grid')
    const { TC_GRASS, TC_STREET } = await import('@/game/sim/town')
    const { plan, zoo } = await build('sunford')
    const dog = zoo.beasts.find(b => b.kind === 'dog')!
    const v = new Vector3()
    const lowest = (): number => {
      dog.obj.updateMatrixWorld(true)
      let worst = Infinity
      dog.obj.traverseVisible(o => {
        if (!(o instanceof Mesh) || o.renderOrder < 0) return
        const pos = o.geometry.getAttribute('position')
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld)
          worst = Math.min(worst, v.y - groundAt(v.x, v.z))
        }
      })
      return worst
    }
    // A flat cell of each kind, its neighbours the same (no slope under the body).
    const t = plan.town!
    const flatCell = (kind: number): [number, number] => {
      for (let j = 2; j < plan.h - 2; j++) {
        for (let i = 2; i < plan.w - 2; i++) {
          if ([[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].every(([a, b]) => t.cell[(j + b!) * plan.w + i + a!] === kind)) {
            const x = (i + 0.5) * CELL
            const z = (j + 0.5) * CELL
            if (Math.abs(groundAt(x + 0.5, z) - groundAt(x - 0.5, z)) + Math.abs(groundAt(x, z + 0.5) - groundAt(x, z - 0.5)) < 0.02) return [x, z]
          }
        }
      }
      throw new Error(`no flat ${kind}`)
    }
    // Cobbles lie 2.5 cm up: on the street the dog must clear them, not the ground under them.
    for (const [kind, floor] of [[TC_GRASS, 0], [TC_STREET, 0.025]] as const) {
      const [x, z] = flatCell(kind)
      for (const pose of ['sit', 'idle', 'greet'] as const) {
        dog.x = dog.hx = dog.tx = x
        dog.z = dog.hz = dog.tz = z
        dog.mode = pose
        dog.t = 30
        dog.cool = pose === 'greet' ? 0 : 99
        // Greeting, the hero stands close by: it sits at his feet. Else he is far off.
        const hx = pose === 'greet' ? x + 1.2 : x + 60
        let worst = Infinity
        for (let i = 0; i < 60; i++) {
          zoo.update(1 / 60, hx, z)
          worst = Math.min(worst, lowest())
        }
        expect(dog.sit!.visible, `${pose} sits`).toBe(pose !== 'idle')
        expect(worst, `${pose} on ${kind}`).toBeGreaterThan(floor - 0.01)
        expect(worst, `${pose} on ${kind}: rests, not hovers`).toBeLessThan(floor + 0.05)
      }
    }
  })

  it('the body vaults over its planted legs: no planted leg is ever stretched, the hips dip twice a cycle (#123)', async () => {
    const { WALK, TROT, pawAt, legPose, strideFor, vaultDrop } = await import('@/game/gfx/townAnimals')
    const len = 0.32
    for (const [g, v] of [[WALK, 1.13], [TROT, 2.43]] as const) {
      const stride = strideFor(g, len, v)
      const drops: number[] = []
      for (let k = 0; k < 200; k++) {
        const cycle = k / 200
        const drop = vaultDrop(g, cycle, stride, len)
        drops.push(drop)
        for (const o of g.offsets) {
          const p = pawAt(g, cycle + o, stride, len)
          if (p.lift > 0) continue
          // A paw on flat ground: its leg reaches from the lowered hips, never past its length.
          expect(legPose(p.z, drop, len).stretch).toBeLessThanOrEqual(1 + 1e-9)
        }
      }
      expect(Math.max(...drops) - Math.min(...drops), 'the hips bob').toBeGreaterThan(0.005)
      expect(Math.max(...drops), 'but only a little').toBeLessThan(0.12 * len)
    }
  })
})
