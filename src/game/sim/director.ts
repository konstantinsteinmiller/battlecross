import { ARENA_WAVES, ZONES } from '../data/zones'
import { itemsOfZone, type ZoneId } from '../data/items'
import { ENEMY_BY_ID } from '../data/enemies'
import { FINALE_BEAT, LEAVE_BEAT, openChest, populateFeatures, stepPlates } from './interact'
import { spawnEnemy, spawnMinion } from './spawn'
import { plainStats } from './stats'
import { spawnTownPeople } from './townLife'
import { fillGrid, type ZonePlan } from './zoneGen'
import { SIDE_GROUP, type Sim } from './world'
import { populateHerbs } from './herbs'
import { populateOres } from './ores'
import { spawnCaravan, stepCaravan } from './caravan'
import { HASTE, SWARM_COUNT, SWARM_HP } from '../arenaWeek'

/**
 * ─── The encounter director ──────────────────────────────────────────────────
 *
 * Puts a plan's packs into the world, watches them fall, and decides when the
 * visit is won: the finale pack in a zone, the last wave in the colosseum.
 * Side packs (a chest's guard, an optional champion) are watched too, but they
 * decide nothing: a zone is won by its main chain alone.
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

/** Every kind a colosseum at this level can send (the scene prewarms them). */
export const arenaKinds = (level: number): string[] => {
  const pool = ARENA_POOLS.find(p => level <= p.upTo) ?? ARENA_POOLS[ARENA_POOLS.length - 1]!
  return [...pool.kinds, pool.elite]
}

/** The ladder (roadmap #10, D69): past the eighth wave, the gold every so many waves, and the most a wave sends. */
export const LADDER_GOLD_EVERY = 5
export const WAVE_CAP = 14
/** Past wave 8: one enemy level more every this many waves, and an elite every this many. */
const LEVEL_EVERY = 2
const ELITE_EVERY = 3

/** The colosseum's purse at a milestone (wave 8 pays the full prize, every fifth after it gold). */
const ladderPurse = (sim: Sim, full: boolean): number => Math.round((20 + sim.level * 14) * (full ? 2.5 : 1))

export const applyPlan = (sim: Sim, plan: ZonePlan): void => {
  fillGrid(sim.grid, plan)
  sim.spawnPoints = plan.gates.slice()
}

/** Spawn a zone's packs (asleep until the hero comes near), then its chests,
 *  plates and side packs. `opened`: one-time chests this save already emptied. */
export const populateZone = (sim: Sim, plan: ZonePlan, zone: ZoneId, owned: Iterable<string>, opened: Iterable<string> = []): void => {
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
  // After the main chain and on streams of their own, so the fight's dice
  // fall exactly as they did before the zone had anything in it but packs.
  populateFeatures(sim, plan, zone, opened)
  populateHerbs(sim, plan.herbs ?? [], plan.pieces ?? [])
  populateOres(sim, plan.ores ?? [])
  // An escort's caravan, at the start of its road (#85).
  if (plan.caravan) spawnCaravan(sim, plan.caravan.path)
}

/** Put a town's people on the map (they never fight). */
export const populateTown = (sim: Sim, plan: ZonePlan, o: { lite?: boolean; visit?: number } = {}): void => {
  // A town's people go about their day (`townLife.ts`).
  if (plan.town) { spawnTownPeople(sim, plan.town, o); return }
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
  const mod = sim.arenaMod
  // Past the eighth wave the ladder climbs by level, not by numbers.
  const past = Math.max(0, w.n - ARENA_WAVES)
  const lvl = Math.floor(past / LEVEL_EVERY)
  const count = Math.round(Math.min(WAVE_CAP, 2 + Math.ceil(w.n * 0.8)) * (mod === 'swarm' ? SWARM_COUNT : 1))
  const gates = sim.spawnPoints
  const tune = (u: ReturnType<typeof spawnEnemy>): void => {
    if (!u) return
    u.awake = true
    u.targetId = sim.hero.unit.id
    if (mod === 'swarm') { u.s.maxHp = Math.max(1, Math.round(u.s.maxHp * SWARM_HP)); u.hp = u.s.maxHp }
    if (mod === 'haste') { u.s.moveSpeed *= HASTE; u.s.attackSpeed *= HASTE }
  }
  for (let i = 0; i < count; i++) {
    const g = gates[(i + w.n) % Math.max(1, gates.length)] ?? [sim.hero.unit.x + 8, sim.hero.unit.z]
    const kind = pool.kinds[Math.floor(sim.rng() * pool.kinds.length)]!
    tune(spawnEnemy(sim, kind, g[0] + (sim.rng() - 0.5) * 2, g[1] + (sim.rng() - 0.5) * 2, 0, null, lvl))
  }
  // Champions: every fourth wave up to the eighth (two on it), every third
  // after it; every wave in an Elite parade week.
  const elites = mod === 'elites' ? 1 : w.n <= ARENA_WAVES ? (w.n % 4 === 0 ? (w.n === ARENA_WAVES ? 2 : 1) : 0) : (past % ELITE_EVERY === 0 ? 1 : 0)
  for (let i = 0; i < elites; i++) {
    const g = gates[(i * 3) % Math.max(1, gates.length)] ?? [sim.hero.unit.x, sim.hero.unit.z - 8]
    tune(spawnEnemy(sim, pool.elite, g[0], g[1], 0, null, lvl))
  }
  sim.emit({ t: 'wave', n: w.n })
}

const win = (sim: Sim, plan: ZonePlan | null): void => {
  if (sim.ended) return
  sim.ended = 'victory'
  const h = sim.hero
  // A zone's finale leaves a real chest, and the place is the hero's to walk:
  // the fight is over (nobody hurts anybody: `dealDamage`), its chest opens
  // to him like any other, and the visit closes when he chooses to leave
  // (`leaveVisit`).
  const finale = sim.chests.find(c => c.role === 'finale')
  if (finale) {
    sim.emit({ t: 'victory' })
    if (h.unit.action && h.unit.action.id === 'attack') h.unit.action = null
    if (h.order.kind === 'attack') { h.order.kind = 'none'; h.order.targetId = 0; h.unit.targetId = 0 }
    h.queued = null
    return
  }
  sim.endReady = true
  // No chest to walk to (the colosseum): the purse is handed over on the spot.
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

/** Seconds between ladder waves from the eighth on (the Leave button's moment). */
export const LADDER_REST = 5

/** Wave 8: the colosseum's old prize — a piece not owned yet and the full purse. */
const ladderPrize = (sim: Sim, plan: ZonePlan | null): void => {
  const h = sim.hero
  const at = plan?.chest ?? { x: h.unit.x, z: h.unit.z }
  const fresh = sim.dropTable.chest.concat(sim.dropTable.mob).filter(id => !sim.owned.has(id) && !h.items.includes(id))
  if (fresh.length) {
    const id = fresh[Math.floor(sim.rng() * fresh.length)]!
    h.items.push(id)
    sim.emit({ t: 'loot', x: at.x, z: at.z, gold: 0, item: id })
  }
  const gold = ladderPurse(sim, true)
  h.gold += gold
  sim.emit({ t: 'loot', x: at.x, z: at.z, gold, item: '' })
  sim.emit({ t: 'fx', id: 'chest', x: at.x, z: at.z, unit: 0, color: '#ffd84a' })
}

/** Every fifth wave past the eighth: a purse. */
const ladderGold = (sim: Sim, plan: ZonePlan | null): void => {
  const h = sim.hero
  const at = plan?.chest ?? { x: h.unit.x, z: h.unit.z }
  const gold = ladderPurse(sim, false)
  h.gold += gold
  sim.emit({ t: 'loot', x: at.x, z: at.z, gold, item: '' })
}

/**
 * The hero leaves the ladder between waves (the Leave button, from the eighth
 * wave on): the visit is won, with what the waves paid.
 */
export const leaveLadder = (sim: Sim): boolean => {
  if (sim.mode !== 'arena' || sim.ended || sim.wave.alive > 0 || sim.wave.cleared < ARENA_WAVES) return false
  sim.ended = 'victory'
  sim.endReady = true
  sim.emit({ t: 'victory' })
  return true
}

/** After the win: the visit closes a beat after the hero chose to leave (a
 *  longer one when the finale's chest was opened for him on the way out, so
 *  its loot is seen). */
const stepFinale = (sim: Sim): void => {
  if (sim.ended !== 'victory') return
  // Side packs can still be fought after the win: one that falls frees its chest.
  clearSideGroups(sim)
  if (sim.endReady || !sim.leaving) return
  // Leaving (or fallen): the finale's chest is never left unopened.
  const c = sim.chests.find(x => x.role === 'finale')
  if (c && c.state !== 'open') { openChest(sim, c); sim.leaveOpened = true }
  if (sim.time - sim.leaveAt >= (sim.leaveOpened ? FINALE_BEAT : LEAVE_BEAT)) sim.endReady = true
}

/**
 * The hero leaves a won zone (the Leave button). The finale's chest, if he
 * has not opened it, is opened for him now: nobody loses the boss's reward.
 * Returns whether the visit is now closing.
 */
export const leaveVisit = (sim: Sim): boolean => {
  if (sim.ended !== 'victory' || sim.leaving) return false
  sim.leaving = true
  sim.leaveAt = sim.time
  const c = sim.chests.find(x => x.role === 'finale')
  if (c && c.state !== 'open') {
    openChest(sim, c)
    sim.leaveOpened = true
  }
  return true
}

const counts: number[] = []
const sideCounts: number[] = []

/** A side pack that falls frees its chest; it is no step toward the win. */
const clearSideGroups = (sim: Sim): void => {
  sideCounts.length = sim.sideGroups.length
  sideCounts.fill(0)
  for (const u of sim.units) if (u.alive && u.team === 1 && u.group >= SIDE_GROUP) sideCounts[u.group - SIDE_GROUP]!++
  for (const g of sim.sideGroups) if (!g.cleared && sideCounts[g.id - SIDE_GROUP]! === 0) g.cleared = true
}

export const stepDirector = (sim: Sim, plan: ZonePlan, dt: number): void => {
  if (sim.ended) { sim.endedT += dt; stepFinale(sim); return }
  if (sim.mode === 'town') return
  if (sim.mode === 'arena') {
    let alive = 0
    for (const u of sim.units) if (u.alive && u.team === 1) alive++
    sim.wave.alive = alive
    if (alive === 0) {
      const w = sim.wave
      // A wave fought to its last enemy: the ladder's score, and its purses.
      if (w.cleared < w.n) {
        w.cleared = w.n
        if (w.n === ARENA_WAVES) ladderPrize(sim, plan)
        else if (w.n > ARENA_WAVES && (w.n - ARENA_WAVES) % LADDER_GOLD_EVERY === 0) ladderGold(sim, plan)
        // From the eighth on, a breather long enough to choose: Leave, or on.
        if (w.n >= ARENA_WAVES) w.rest = LADDER_REST
      }
      w.rest -= dt
      if (w.rest <= 0) {
        w.rest = 2.4
        spawnWave(sim)
      }
    }
    return
  }
  stepPlates(sim)
  // An escort (#85): the caravan's arrival wins, its loss loses; its packs are
  // only the ambushes on the way.
  if (sim.caravan) {
    const r = stepCaravan(sim, dt)
    if (r === 'arrived') { win(sim, plan); return }
    if (r === 'lost') { lose(sim); return }
  }
  counts.length = sim.groups.length
  counts.fill(0)
  for (const u of sim.units) if (u.alive && u.team === 1 && u.group >= 0 && u.group < SIDE_GROUP) counts[u.group]!++
  clearSideGroups(sim)
  for (const g of sim.groups) {
    if (g.cleared || counts[g.id]! > 0) continue
    g.cleared = true
    sim.groupsDone++
    sim.emit({ t: 'groupDone', done: sim.groupsDone, total: sim.groups.length })
    if (g.finale && !sim.caravan) win(sim, plan)
  }
}

/** The escort's caravan is lost: the visit is, too. */
const lose = (sim: Sim): void => {
  if (sim.ended) return
  sim.ended = 'defeat'
  sim.emit({ t: 'defeat' })
}

/** Is `kind` a boss (the HUD shows a boss bar for its pack)? */
export const isBossKind = (kind: string): boolean => ENEMY_BY_ID[kind]?.rank === 'boss'

export { ZONES }
