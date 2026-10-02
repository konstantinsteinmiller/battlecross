import type { ZoneId } from '../data/items'
import {
  POTION_BELT_MAX, POTION_HEAL, ZONE_LOOT, finaleGold, manaPotionGold, secretGold, type ChestTable, type ChestTier
} from '../data/loot'
import { face, setGoal, stop } from './actors'
import { heal } from './combat'
import { SOLID_SEALED, setCellBit } from './grid'
import { mulberry32, type Rng } from './rng'
import { spawnEnemy } from './spawn'
import { SIDE_GROUP, newAction, type ChestState, type GroupState, type LootDraw, type Sim } from './world'
import type { ZonePlan } from './zoneGen'

/**
 * ─── Things to do besides fighting (roadmap #54–#56) ─────────────────────────
 *
 * Chests the hero walks up to and opens, the side packs that guard some of
 * them, pressure plates stepped on in the order a carved stone shows, and the
 * hidden passage a solved puzzle opens.
 *
 * What a chest holds is decided when the visit begins, from the visit's seed
 * on a stream of its own: the fight's dice (`sim.rng`) are never touched, so a
 * chest changes nothing about how a seed's battles play out.
 */

/** The hero opens a chest from this far (centre to centre). */
export const CHEST_REACH = 2.15
/** The prompt offers a chest this near. */
export const CHEST_NEAR = 3.4
/** Seconds the lid takes. */
export const OPEN_TIME = 0.55
/** A plate is stepped on within this of its centre. */
export const PLATE_R = 0.62
/** A side pack only notices a hero who comes this close (or strikes it). */
export const SIDE_AGGRO = 6
/** …and gives up the chase this far from where it stood. */
export const SIDE_LEASH = 13
/** A won visit waits this long for the hero to reach the finale's chest. */
export const FINALE_WAIT = 7
/** …and this long on the open chest before the result screen. */
export const FINALE_BEAT = 1.3

const LOOT_SALT = 0x2c1b3c6d
const SIDE_SALT = 0x71d3a4f9

/** The save key of a one-time chest. */
export const specialKey = (zone: string, role: string): string => zone + ':' + role

/** Draw a chest's contents from its tier's table. Pure: same stream, same chest. */
export const rollChest = (table: ChestTable, rng: Rng): LootDraw[] => {
  const out: LootDraw[] = []
  const goldOf = (): number => {
    const e = table.entries.find(x => x.kind === 'gold')
    const [lo, hi] = e?.gold ?? [1, 1]
    return lo + Math.floor(rng() * (hi - lo + 1))
  }
  let total = 0
  for (const e of table.entries) total += e.w
  let items = 0
  for (let d = 0; d < table.draws; d++) {
    // The first draw is always coins: no chest is "just a potion".
    let kind: LootDraw['kind'] = 'gold'
    let r = rng() * total
    if (d > 0) {
      for (const e of table.entries) {
        r -= e.w
        if (r <= 0) { kind = e.kind; break }
      }
    }
    if (kind === 'item' && items >= table.maxItems) kind = 'gold'
    if (kind === 'item') items++
    out.push({ kind, gold: kind === 'gold' ? goldOf() : 0, u: rng(), item: '' })
  }
  return out
}

/** Why a chest cannot be opened right now ('' = it can). */
export const chestLock = (sim: Sim, c: ChestState): '' | 'guard' | 'finale' | 'gone' => {
  if (c.state !== 'closed') return 'gone'
  if (c.role === 'finale' && sim.ended !== 'victory') return 'finale'
  if (c.guard >= 0 && !sim.sideGroups[c.guard]?.cleared) return 'guard'
  return ''
}

/** The chest under a ground point (a tap), if one is in view. */
export const pickChest = (sim: Sim, x: number, z: number, pad: number): ChestState | undefined => {
  let best: ChestState | undefined
  let bd = 0.75 + pad
  for (const c of sim.chests) {
    if (c.state !== 'closed') continue
    const d = Math.hypot(c.x - x, c.z - z)
    if (d < bd) { bd = d; best = c }
  }
  return best
}

/** The closed chest nearest the hero within `maxDist` that he could open now. */
export const nearChest = (sim: Sim, maxDist = CHEST_NEAR): ChestState | undefined => {
  const u = sim.hero.unit
  let best: ChestState | undefined
  let bd = maxDist
  for (const c of sim.chests) {
    if (chestLock(sim, c)) continue
    const d = Math.hypot(c.x - u.x, c.z - u.z)
    if (d < bd) { bd = d; best = c }
  }
  return best
}

/** Send the hero to a chest. A guarded or sealed one says so instead. */
export const orderOpen = (sim: Sim, id: number): boolean => {
  const c = sim.chests[id]
  const h = sim.hero
  if (!c || !h.unit.alive) return false
  const lock = chestLock(sim, c)
  if (lock === 'gone') return false
  if (lock) {
    sim.emit({ t: 'chest', id: c.id, x: c.x, z: c.z, state: 'locked', why: lock })
    return false
  }
  h.order.kind = 'chest'
  h.order.targetId = id
  h.order.x = c.sx
  h.order.z = c.sz
  h.queued = null
  h.unit.targetId = 0
  h.unit.repathT = 0
  return true
}

/** The hero has reached the chest: the lid starts to lift. */
export const beginOpen = (sim: Sim, c: ChestState): void => {
  const h = sim.hero
  const u = h.unit
  stop(u)
  face(u, c.x, c.z)
  u.action = newAction(u, 'open', OPEN_TIME, OPEN_TIME + 0.2, 0, c.x, c.z)
  u.anim = 'cast'
  u.animT = 0
  u.animStyle = 0
  h.opening = c.id
  c.state = 'opening'
  sim.emit({ t: 'chest', id: c.id, x: c.x, z: c.z, state: 'opening' })
}

/** The hero was called away with the lid half up: the chest waits, closed. */
export const cancelOpen = (sim: Sim): void => {
  const h = sim.hero
  const c = sim.chests[h.opening]
  h.opening = -1
  if (h.unit.action?.id === 'open') h.unit.action = null
  if (!c || c.state !== 'opening') return
  c.state = 'closed'
  sim.emit({ t: 'chest', id: c.id, x: c.x, z: c.z, state: 'closed' })
}

/** Hand over what a chest holds. */
export const openChest = (sim: Sim, c: ChestState): void => {
  if (c.state === 'open' || c.state === 'hidden') return
  const h = sim.hero
  const u = h.unit
  c.state = 'open'
  c.openedAt = sim.time
  h.chests++
  if (h.opening === c.id) h.opening = -1
  if (c.special) sim.specialOpened.push(c.special)
  sim.emit({ t: 'chest', id: c.id, x: c.x, z: c.z, state: 'open' })
  const pool = c.role === 'finale' ? sim.dropTable.chest.concat(sim.dropTable.mob) : ZONE_LOOT[sim.zone as ZoneId]?.items ?? []
  // Every pile in the chest is one purse (and one number over it).
  let gold = 0
  for (const d of c.loot) {
    if (d.kind === 'gold') gold += d.gold
    else if (d.kind === 'item') {
      let id = d.item
      if (!id) {
        // Something the hero does not have yet, if the zone still has one.
        const fresh = pool.filter(i => !sim.owned.has(i) && !h.items.includes(i))
        const from = fresh.length ? fresh : c.role === 'finale' ? [] : pool
        id = from[Math.min(from.length - 1, Math.floor(d.u * from.length))] ?? ''
      } else if (sim.owned.has(id) || h.items.includes(id)) id = ''
      if (!id) continue
      h.items.push(id)
      sim.emit({ t: 'loot', x: c.x, z: c.z, gold: 0, item: id })
    } else if (d.kind === 'potion') {
      if (h.potions < POTION_BELT_MAX) {
        h.potions++
        h.potionsMax = Math.max(h.potionsMax, h.potions)
        sim.emit({ t: 'pickup', what: 'potion', x: c.x, z: c.z })
      } else {
        // A full belt: the potion is drunk on the spot.
        heal(sim, u, u.s.maxHp * POTION_HEAL)
        sim.emit({ t: 'pickup', what: 'heal', x: c.x, z: c.z })
      }
    } else if (h.manaPotions < h.manaPotionsMax) {
      // Into the stock: his to drink when he chooses, this visit or a later one.
      h.manaPotions++
      sim.emit({ t: 'pickup', what: 'mana', x: c.x, z: c.z })
    } else {
      // No room for it: a little gold instead, like a second copy of an item.
      gold += manaPotionGold(sim.level)
    }
  }
  if (gold > 0) {
    h.gold += gold
    sim.emit({ t: 'loot', x: c.x, z: c.z, gold, item: '' })
  }
}

/** The lid is up (the hero's `open` action landed). */
export const finishOpen = (sim: Sim): void => {
  const c = sim.chests[sim.hero.opening]
  sim.hero.opening = -1
  if (c && c.state === 'opening') openChest(sim, c)
}

/** A hidden passage opens, for the rest of the visit. */
export const openDoor = (sim: Sim, id: number): void => {
  const d = sim.doors[id]
  if (!d || d.open) return
  d.open = true
  const g = sim.grid
  for (const k of d.cells) {
    const i = k % g.w
    setCellBit(g, i, (k - i) / g.w, SOLID_SEALED, false)
  }
  sim.emit({ t: 'door', id, cells: d.cells, x: d.x, z: d.z })
  for (const c of sim.chests) {
    if (c.door !== id || c.state !== 'hidden') continue
    c.state = 'closed'
    sim.emit({ t: 'chest', id: c.id, x: c.x, z: c.z, state: 'reveal' })
  }
  // A way that was not there a moment ago: everyone walking looks again.
  for (const u of sim.units) if (u.alive && u.hasGoal) setGoal(sim, u, u.goalX, u.goalZ)
}

/** Pressure plates: only the hero's own feet count. */
export const stepPlates = (sim: Sim): void => {
  const p = sim.puzzle
  if (!p || !sim.plates.length) return
  const u = sim.hero.unit
  for (const pl of sim.plates) {
    const on = u.alive && Math.hypot(pl.x - u.x, pl.z - u.z) <= PLATE_R
    if (on === pl.down) continue
    pl.down = on
    // Stepping off does nothing; nor does anything once it is solved, and a
    // plate that is already lit is simply walked over.
    if (!on || p.solved || pl.lit) continue
    if (p.order[p.step] === pl.id) {
      pl.lit = true
      p.step++
      p.solved = p.step >= p.order.length
      sim.emit({ t: 'plate', id: pl.id, x: pl.x, z: pl.z, ok: true, step: p.step, solved: p.solved })
      if (p.solved) openDoor(sim, p.door)
      continue
    }
    // Out of turn: every plate goes dark, with no other punishment. If this
    // one happens to be the first of the order, it counts as the new start.
    for (const q of sim.plates) q.lit = false
    p.step = 0
    if (p.order[0] === pl.id) {
      pl.lit = true
      p.step = 1
    }
    sim.emit({ t: 'plate', id: pl.id, x: pl.x, z: pl.z, ok: p.step === 1, step: p.step, solved: false })
  }
}

/**
 * Put a plan's chests, plates, doors and side packs into the world.
 * `opened`: the one-time chests this save has already emptied.
 */
export const populateFeatures = (sim: Sim, plan: ZonePlan, zone: ZoneId, opened: Iterable<string> = []): void => {
  const done = new Set(opened)
  const loot = ZONE_LOOT[zone]
  sim.doors = plan.doors.map(d => ({ id: d.id, cells: d.cells, x: d.x, z: d.z, open: false }))
  sim.plates = plan.plates.map(p => ({ id: p.id, x: p.x, z: p.z, symbol: p.symbol, lit: false, down: false }))
  sim.puzzle = plan.puzzle ? { order: plan.puzzle.order.slice(), step: 0, solved: false, door: plan.puzzle.door } : null

  // Side packs spawn on a stream of their own (a spawn rolls a facing and a
  // first swing): the main fights' dice stay where they were.
  sim.withStream(mulberry32((sim.seed ^ SIDE_SALT) >>> 0), () => plan.optionalPacks.forEach((p, n) => {
    const id = SIDE_GROUP + n
    const group: GroupState = { id, x: p.x, z: p.z, members: [], awake: false, cleared: false, finale: false, boss: '', optional: true, champion: p.champion }
    sim.sideGroups.push(group)
    p.kinds.forEach((kind, k) => {
      const a = (k / Math.max(1, p.kinds.length)) * Math.PI * 2
      const d = k === 0 ? 0 : 1.6
      const u = spawnEnemy(sim, kind, p.x + Math.cos(a) * d, p.z + Math.sin(a) * d, id, null, p.levelOffset)
      if (!u) return
      u.facing = 0
      if (p.champion) u.champion = true
      group.members.push(u.id)
    })
  }))

  for (const c of plan.chests) {
    const rng = mulberry32(((sim.seed ^ LOOT_SALT) + Math.imul(c.id + 1, 0x9e3779b1)) >>> 0)
    let special = ''
    let tier: ChestTier = c.tier
    let draws: LootDraw[]
    if (c.role === 'finale') {
      // What the finale always paid: a piece of the zone the hero lacks, and its purse.
      draws = [{ kind: 'item', gold: 0, u: rng(), item: '' }, { kind: 'gold', gold: finaleGold(sim.level), u: 0, item: '' }]
    } else if (c.role === 'secret' || c.role === 'puzzle') {
      const key = specialKey(zone, c.role)
      if (done.has(key)) {
        // Emptied on an earlier visit: an ordinary chest stands in its place.
        tier = 'iron'
        draws = rollChest(loot.tables.iron, rng)
      } else {
        special = key
        draws = rollChest(loot.tables.gold, rng)
        if (c.role === 'secret') {
          draws = [{ kind: 'gold', gold: secretGold(sim.level), u: 0, item: '' }]
          const ring = sim.dropTable.secret[0]
          if (ring) draws.push({ kind: 'item', gold: 0, u: 0, item: ring })
        } else if (!draws.some(d => d.kind === 'item')) {
          // A solved puzzle always pays in equipment the first time.
          draws.push({ kind: 'item', gold: 0, u: rng(), item: '' })
        }
      }
    } else draws = rollChest(loot.tables[c.tier], rng)
    sim.chests.push({
      id: c.id, x: c.x, z: c.z, sx: c.sx, sz: c.sz, tier, role: c.role, state: c.door >= 0 ? 'hidden' : 'closed',
      door: c.door, guard: c.guard, loot: draws, special, openedAt: 0
    })
  }
}
