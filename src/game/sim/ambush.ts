import { ALT_AMBUSH_KINDS, TRAP_CRACK_S, TRAP_HOLE_R, TRAP_RADIUS, TRAP_SIZE } from '../data/altTutorial'
import { CELL, SOLID_LOW, SOLID_ROUND, isSolidAt, setCellBit } from './grid'
import { spawnEnemy } from './spawn'
import type { Dresser } from './dressing'
import type { PackPlan } from './zoneGen'
import type { Sim } from './world'

/**
 * ─── The ambush (#218, the stretched tutorial level) ──────────────────────────
 *
 * The hero walks into a clearing with broken-down wagons and no sign of anyone. Under the middle lies a trapdoor (`gfx`): the
 * moment he stands on it, it gives way under his feet and the raiders hidden in the wagons jump out — three bandits, one with
 * a lane charge (the dodge roll's lesson) and a cone (the shield bash's). Nobody exists before that: the group is empty and
 * uncleared, so the road does not count it done, the chevrons lead into it and the palisade gate waits for it.
 */

/** The wagons the raiders hide in: round the clearing's middle, off the road, as many as fit (up to three). Their centres. */
export const dressAmbush = (d: Dresser, p: PackPlan, cell: number = CELL): Array<{ x: number; z: number }> => {
  const out: Array<{ x: number; z: number }> = []
  const want = ALT_AMBUSH_KINDS.length
  const base = Math.atan2(1, 0.4)
  for (const rad of [0.62, 0.78, 0.5, 0.9, 0.38]) {
    for (let q = 0; q < 24 && out.length < want; q++) {
      const a = base + (q / 24) * Math.PI * 2
      const x = p.x + Math.cos(a) * p.r * rad
      const z = p.z + Math.sin(a) * p.r * rad
      // The trapdoor's own ground and each other's stay clear.
      if (Math.hypot(x - p.x, z - p.z) < 3.4) continue
      if (out.some(o => Math.hypot(o.x - x, o.z - z) < 5)) continue
      const before = d.pieces.length
      if (d.stand('wagon', Math.floor(x / cell), Math.floor(z / cell), a + Math.PI / 2, { clear: 0, byPack: true }) && d.pieces.length > before) {
        const w = d.pieces[d.pieces.length - 1]!
        out.push({ x: w.x, z: w.z })
      }
    }
  }
  return out
}

/** Each step: the hero near the trapdoor makes it crack; a moment later it gives way (the raiders jump out) and the pit stays shut to every foot. */
export const stepAmbush = (sim: Sim): void => {
  const hero = sim.hero?.unit
  for (const g of sim.groups) {
    const a = g.ambush
    if (!a) continue
    if (a.sprung) {
      continue
    }
    if (!hero?.alive) continue
    if (a.crackAt === undefined) {
      if (Math.hypot(hero.x - a.x, hero.z - a.z) > TRAP_RADIUS) continue
      a.crackAt = sim.time
      // The way out: straight away from the middle (the way the hero came in when he stands on it).
      let dx = hero.x - a.x
      let dz = hero.z - a.z
      const dl = Math.hypot(dx, dz)
      if (dl < 0.2) { dx = -Math.sin(hero.facing); dz = -Math.cos(hero.facing) } else { dx /= dl; dz /= dl }
      sim.emit({ t: 'trapCrack', x: a.x, z: a.z, dx, dz })
      continue
    }
    if (sim.time - a.crackAt < TRAP_CRACK_S) continue
    a.sprung = true
    g.awake = true
    const ids: number[] = []
    a.kinds.forEach((kind, k) => {
      // Out of the wagons (a ring about the trapdoor where none stands), facing the hero.
      const cart = a.carts[k % Math.max(1, a.carts.length)]
      const ang = (k / a.kinds.length) * Math.PI * 2 + 0.7
      const x = cart ? cart.x + Math.cos(ang) * 0.9 : a.x + Math.cos(ang) * 4
      const z = cart ? cart.z + Math.sin(ang) * 0.9 : a.z + Math.sin(ang) * 4
      const u = spawnEnemy(sim, kind, x, z, g.id)
      if (!u) return
      u.awake = true
      u.facing = Math.atan2(hero!.x - u.x, hero!.z - u.z)
      g.members.push(u.id)
      ids.push(u.id)
    })
    // A hero still over the hatch when it gives way falls onto the spikes: hurt, and set on the rim.
    if (Math.hypot(hero.x - a.x, hero.z - a.z) < TRAP_SIZE / 2 + 0.1) hero.hp = Math.max(1, hero.hp - hero.s.maxHp * 0.3)
    // The cart on the left falls to pieces: nothing of it blocks any more (foes, hero and helpers move through).
    const w = sim.grid.w
    if (a.smash) for (const k of a.smash.cells) { const i = k % w; const j = (k - i) / w; setCellBit(sim.grid, i, j, SOLID_LOW | SOLID_ROUND, false) }
    sim.emit({ t: 'trapSprung', x: a.x, z: a.z, ids })
    closePit(sim, a.x, a.z)
  }
}

/** The open pit is not ground: its cells stop every body (the paths go round it), and whoever stands over it is set on its rim. */
const closePit = (sim: Sim, x: number, z: number): void => {
  const g = sim.grid
  const r = Math.ceil(TRAP_HOLE_R / CELL) + 1
  const ci = Math.floor(x / CELL)
  const cj = Math.floor(z / CELL)
  for (let j = cj - r; j <= cj + r; j++) {
    for (let i = ci - r; i <= ci + r; i++) {
      if (Math.hypot((i + 0.5) * CELL - x, (j + 0.5) * CELL - z) <= TRAP_HOLE_R) setCellBit(g, i, j, SOLID_LOW, true)
    }
  }
  for (const u of sim.units) {
    if (!u.alive) continue
    let dx = u.x - x
    let dz = u.z - z
    const d = Math.hypot(dx, dz)
    if (d < 0.05) { dx = 1; dz = 0 } else { dx /= d; dz /= d }
    // Out along the line from the middle until the ground is open again.
    for (let step = 0; step < 24 && isSolidAt(g, u.x, u.z); step++) { u.x = u.px = u.x + dx * 0.25; u.z = u.pz = u.z + dz * 0.25 }
  }
}
