import { ARENA_WAVES, ZONES } from '../data/zones'
import { itemsOfZone, type ZoneId } from '../data/items'
import { ENEMY_BY_ID } from '../data/enemies'
import { spawnEnemy, spawnMinion } from './spawn'
import { plainStats } from './stats'
import type { ZonePlan } from './zoneGen'
import type { Sim } from './world'

/**
 * ─── The encounter director ──────────────────────────────────────────────────
 *
 * Puts a plan's packs into the world, watches them fall, and decides when the
 * visit is won: the finale pack in a zone, the last wave in the colosseum.
 */

/** Which kinds a colosseum wave draws from, by the hero's level. */
const ARENA_POOLS: Array<{ upTo: number; kinds: string[]; elite: string }> = [
  { upTo: 5, kinds: ['goblin', 'goblinSlinger', 'wolf', 'bandit'], elite: 'banditChief' },
  { upTo: 10, kinds: ['bandit', 'banditArcher', 'spider', 'treant'], elite: 'outlawCaptain' },
  { upTo: 15, kinds: ['fireElemental', 'cultist', 'ironGolem', 'spider'], elite: 'emberLord' },
  { upTo: 20, kinds: ['naga', 'necromancer', 'frostGiant', 'skeleton'], elite: 'nagaOracle' },
  { upTo: 25, kinds: ['voidStalker', 'highDemon', 'wyvern', 'cultist'], elite: 'voidWarden' },
  { upTo: 99, kinds: ['highDemon', 'imp', 'voidStalker', 'voidling'], elite: 'doomKnight' }
]

export const applyPlan = (sim: Sim, plan: ZonePlan): void => {
  sim.grid.solid.set(plan.solid)
  sim.spawnPoints = plan.gates.slice()
}

/** Spawn a zone's packs (asleep until the hero comes near). */
export const populateZone = (sim: Sim, plan: ZonePlan, zone: ZoneId, owned: Iterable<string>): void => {
  for (const id of owned) sim.owned.add(id)
  sim.dropTable = {
    mob: itemsOfZone(zone, 'mob').map(i => i.id),
    chest: itemsOfZone(zone, 'chest').map(i => i.id),
    boss: itemsOfZone(zone, 'boss').map(i => i.id),
    secret: itemsOfZone(zone, 'secret').map(i => i.id)
  }
  plan.packs.forEach((p, gi) => {
    const group = { id: gi, x: p.x, z: p.z, members: [] as number[], awake: false, cleared: false, finale: p.finale, boss: p.boss }
    sim.groups.push(group)
    p.kinds.forEach((kind, k) => {
      const leader = p.finale && k === 0
      // The leader stands in the middle; the rest ring it.
      const a = (k / Math.max(1, p.kinds.length)) * Math.PI * 2 + sim.rng() * 0.6
      const d = leader ? 0 : Math.min(p.r * 0.55, 1.6 + sim.rng() * 2.2)
      const u = spawnEnemy(sim, kind, p.x + Math.cos(a) * d, p.z + Math.sin(a) * d - (leader ? p.r * 0.2 : 0), gi)
      if (!u) return
      // Facing the way the hero will come from.
      u.facing = 0
      group.members.push(u.id)
    })
  })
}

/** Put a town's people on the map (they never fight). */
export const populateTown = (sim: Sim, plan: ZonePlan): void => {
  for (const n of plan.npcs) {
    sim.addUnit({
      kind: n.look, team: 0, rank: 'npc', level: 1, x: n.x, z: n.z, r: 0.5, h: 1.45,
      s: plainStats({ hp: 1000, dmg: 0, speed: 0 }), facing: n.facing, npc: n.id
    })
  }
}

/** The dragon keeps its bargain (GDD §3.2: choices alter the endgame). */
export const summonDragonAlly = (sim: Sim): void => {
  const h = sim.hero.unit
  spawnMinion(sim, 'dragonAlly', h.x + 2.5, h.z + 1.5, -1)
}

const spawnWave = (sim: Sim): void => {
  const w = sim.wave
  w.n++
  const pool = ARENA_POOLS.find(p => sim.level <= p.upTo) ?? ARENA_POOLS[ARENA_POOLS.length - 1]!
  const count = 2 + Math.ceil(w.n * 0.8)
  const gates = sim.spawnPoints
  for (let i = 0; i < count; i++) {
    const g = gates[(i + w.n) % Math.max(1, gates.length)] ?? [sim.hero.unit.x + 8, sim.hero.unit.z]
    const kind = pool.kinds[Math.floor(sim.rng() * pool.kinds.length)]!
    const u = spawnEnemy(sim, kind, g[0] + (sim.rng() - 0.5) * 2, g[1] + (sim.rng() - 0.5) * 2, 0)
    if (u) { u.awake = true; u.targetId = sim.hero.unit.id }
  }
  // Every fourth wave brings a champion; the last brings two.
  if (w.n % 4 === 0) {
    const n = w.n >= ARENA_WAVES ? 2 : 1
    for (let i = 0; i < n; i++) {
      const g = gates[(i * 3) % Math.max(1, gates.length)] ?? [sim.hero.unit.x, sim.hero.unit.z - 8]
      const u = spawnEnemy(sim, pool.elite, g[0], g[1], 0)
      if (u) { u.awake = true; u.targetId = sim.hero.unit.id }
    }
  }
  sim.emit({ t: 'wave', n: w.n })
}

const win = (sim: Sim, plan: ZonePlan | null): void => {
  if (sim.ended) return
  sim.ended = 'victory'
  const h = sim.hero
  // The chest behind the finale: something from this zone the hero lacks.
  const table = sim.dropTable.chest.concat(sim.dropTable.mob)
  const fresh = table.filter(id => !sim.owned.has(id) && !h.items.includes(id))
  const chest = plan?.chest ?? { x: h.unit.x, z: h.unit.z }
  if (fresh.length) {
    const id = fresh[Math.floor(sim.rng() * fresh.length)]!
    h.items.push(id)
    sim.emit({ t: 'loot', x: chest.x, z: chest.z, gold: 0, item: id })
  }
  const bonus = Math.round((20 + sim.level * 14) * (sim.mode === 'arena' ? 2.5 : 1))
  h.gold += bonus
  sim.emit({ t: 'loot', x: chest.x, z: chest.z, gold: bonus, item: '' })
  sim.emit({ t: 'victory' })
}

/** The secret chest: opened by walking up to it. */
const stepSecret = (sim: Sim, plan: ZonePlan): void => {
  if (!plan.secret || sim.owned.has('__secret')) return
  const h = sim.hero
  if (Math.hypot(h.unit.x - plan.secret.x, h.unit.z - plan.secret.z) > 1.8) return
  sim.owned.add('__secret')
  const fresh = sim.dropTable.secret.filter(id => !sim.owned.has(id) && !h.items.includes(id))
  const gold = 150 + sim.level * 40
  h.gold += gold
  const item = fresh[0] ?? ''
  if (item) h.items.push(item)
  sim.emit({ t: 'loot', x: plan.secret.x, z: plan.secret.z, gold, item })
  sim.emit({ t: 'fx', id: 'chest', x: plan.secret.x, z: plan.secret.z })
}

const counts: number[] = []

export const stepDirector = (sim: Sim, plan: ZonePlan, dt: number): void => {
  if (sim.ended) { sim.endedT += dt; return }
  if (sim.mode === 'town') return
  if (sim.mode === 'arena') {
    let alive = 0
    for (const u of sim.units) if (u.alive && u.team === 1) alive++
    sim.wave.alive = alive
    if (alive === 0) {
      if (sim.wave.n >= ARENA_WAVES) { win(sim, plan); return }
      sim.wave.rest -= dt
      if (sim.wave.rest <= 0) {
        sim.wave.rest = 2.4
        spawnWave(sim)
      }
    }
    return
  }
  stepSecret(sim, plan)
  counts.length = sim.groups.length
  counts.fill(0)
  for (const u of sim.units) if (u.alive && u.team === 1 && u.group >= 0) counts[u.group]!++
  for (const g of sim.groups) {
    if (g.cleared || counts[g.id]! > 0) continue
    g.cleared = true
    sim.groupsDone++
    sim.emit({ t: 'groupDone', done: sim.groupsDone, total: sim.groups.length })
    if (g.finale) win(sim, plan)
  }
}

/** Is `kind` a boss (the HUD shows a boss bar for its pack)? */
export const isBossKind = (kind: string): boolean => ENEMY_BY_ID[kind]?.rank === 'boss'

export { ZONES }
