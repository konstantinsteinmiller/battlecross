import {
  BALLISTA, BARRICADE, BUILD_SECONDS, CAULDRON, DEFENCE_COST, GATE_BLOWS, GATE_GUARD, MARKS, MILITIA_COUNT, PACKET_EVERY, PACKET_MAX, RAM, RAM_KIND,
  REPAIR, SAPPER, SIEGE_LORD, SIEGE_WAVES, SIEGE_XP_MUL, TIER_HP, siegeWaves, type DefenceId, type SiegeTier, type SpawnRole
} from '../data/siege'
import { addField, fire, raiseWall, setGoal, stop, walk } from './actors'
import { applyStatus, dealDamage, reviveHero } from './combat'
import { spawnEnemy, spawnMinion } from './spawn'
import { enemyDmg, enemyHp, plainStats } from './stats'
import { SIEGE_LAYOUT } from './siegeMap'
import type { Unit } from './types'
import { hasStatus, outOfReach, type Sim } from './world'

/**
 * ─── The Siege of Bastion, as the sim plays it (afterplay §8) ──────────────
 *
 * A siege is a colosseum visit (`sim.mode` 'arena': no adaptive pressure, no
 * leash) with a siege state beside it, stepped by the director before
 * anything else (`stepDirector`):
 *
 *   the gate     a unit of the hero's side that never acts (like the demon
 *                pylon, drawn as a prop): the horde walks the lanes to it and
 *                beats on it, and when its health is gone the siege is lost;
 *   the phases   a build phase (15 s, or until the player is ready) before
 *                every wave, then the wave: its enemies come in packets down
 *                the three lanes while fewer than the cap are alive; the wave
 *                is cleared when none is left to come and none is standing;
 *   defences     bought with Siege Marks in a build phase: a ballista on its
 *                lane's platform (a piercing bolt every 2 s), a fire cauldron
 *                (a burning patch across its lane), a barricade (its lane's
 *                cells raised for 20 s or 400 damage), militia (two guards)
 *                and a gate repair;
 *   the horde    rams walk to the gate and batter it; raiders (harpies) go
 *                for the ballistas; sappers run at a defence or the gate and
 *                blow up; everyone else fights whoever stands near and
 *                otherwise the gate.
 *
 * The story's first siege (B5) cannot be lost: the gate holds at its last
 * splinter and a fallen hero gets up again. What the HUD and the view need to
 * hear (a wave, the horn, a summary) goes into `news`, drained by the scene.
 *
 * Not kept by a save slot: a siege is fought in one sitting (`ZoneMode.snapshot`).
 */

/** The gate's body and a ballista's: units nobody table knows (they never act). */
export const GATE_KIND = 'siegeGate'
export const BALLISTA_KIND = 'siegeBallista'

/** An enemy closer than this to one of the hero's side fights it before the gate. */
const ENGAGE = 6.5
/** The siege's captains and elites come for the hero himself from this far: theirs is a duel, not a race to the gate. */
const CHALLENGE = 16
/** A gate HP share the horn sounds at (§8.5: 50 % and 25 %). */
const HORNS = [0.5, 0.25] as const

export type SiegePhase = 'build' | 'wave' | 'won' | 'lost'

export type SiegeNews =
  | { t: 'build'; n: number }
  | { t: 'wave'; n: number; ram: boolean; boss: boolean }
  /** A wave cleared: the Marks it paid, and whether the gate went unharmed. */
  | { t: 'cleared'; n: number; marks: number; unharmed: boolean }
  | { t: 'horn'; pct: number }
  | { t: 'ram' }
  | { t: 'built'; id: DefenceId }
  | { t: 'lost'; why: 'gate' }
  | { t: 'won' }
  /** The story's siege: the hero is back on his feet. */
  | { t: 'rally' }

export interface SiegeBarricade { lane: number; hp: number; t: number }

export interface SiegeState {
  tier: SiegeTier
  /** The story's first siege (B5): it cannot be lost. */
  story: boolean
  /** Most enemies alive at once, militia included. */
  cap: number
  phase: SiegePhase
  /** The wave being fought (or the next one, in a build phase): 1..10. */
  wave: number
  /** Seconds left in the build phase. */
  buildT: number
  /** The waves of this siege (the fifth's captain rotates). */
  plan: ReturnType<typeof siegeWaves>
  /** What is still to come this wave, and seconds to the next packet. */
  queue: Array<{ kind: string; role: SpawnRole; hp: number; lane: number }>
  packetT: number
  /** Units of the horde, by role (the roles that act differently). */
  roles: Map<number, SpawnRole>
  rams: Array<{ id: number; lane: number; cd: number }>
  /** The gate's body (unit id), and its full health. */
  gate: number
  gateMax: number
  /** The gate's health at the last step (a blow since is a hurt). */
  gateHp: number
  /** The fort's commander in the yard (Captain Hale or Elder Mara): who shouts the barks. */
  commander: number
  barkVoice: string
  /** Marks in hand, and every Mark this siege earned (the bank). */
  marks: number
  earned: number
  /** Elites killed (the Marks they paid). */
  elites: number
  /** The gate took a blow this wave; it took none all siege. */
  hurt: boolean
  flawless: boolean
  /** The lanes' defences: a ballista's unit id (0: none), its shot timer, a lit cauldron, a barricade. */
  ballistas: number[]
  ballCd: number[]
  cauldrons: boolean[]
  barricades: Array<SiegeBarricade | null>
  militia: number[]
  /** The horn has sounded at this many of `HORNS`. */
  horns: number
  /** The siege's boss now on the field (the fifth's captain, the Siege Lord), 0: none. */
  boss: number
  /** The waves fought to their end. */
  cleared: number
  news: SiegeNews[]
}

export interface SiegeOptions {
  tier: SiegeTier
  story?: boolean
  rotation?: number
  cap: number
  /** Who commands the fort: its look, and the voice id of its barks. */
  commander: { look: string; voice: string }
}

const live = (sim: Sim, id: number): Unit | undefined => (id ? sim.live(id) : undefined)

/** The siege's state, if this visit is one. */
export const siegeOf = (sim: Sim): SiegeState | null => sim.siege

/** Is this unit one of the siege's own pieces (drawn as a prop, never a rig)? */
export const isSiegePiece = (u: Unit | null | undefined): boolean => !!u && (u.kind === GATE_KIND || u.kind === BALLISTA_KIND || u.kind === RAM_KIND)

const news = (s: SiegeState, n: SiegeNews): void => { if (s.news.length < 32) s.news.push(n) }

/** A line the commander shouts, by its beat (an i18n key = its recording). */
export const siegeBarkKey = (voice: string, beat: string): string => `dlg.bark.siege${voice[0]!.toUpperCase()}${voice.slice(1)}.${beat}.1`

const bark = (sim: Sim, s: SiegeState, beat: string): void => {
  const c = live(sim, s.commander)
  if (c) sim.emit({ t: 'bark', unit: c.id, key: siegeBarkKey(s.barkVoice, beat) })
}

/**
 * Make this visit a siege (after the hero is created): the gate's body at the
 * gate, the commander in the yard, the first build phase, kills worth the
 * afterplay's XP and no zone's gear.
 */
export const armSiege = (sim: Sim, o: SiegeOptions): SiegeState => {
  const L = SIEGE_LAYOUT
  const lvl = sim.level
  const gateMax = Math.round(enemyDmg(lvl) * GATE_BLOWS * sim.difficulty)
  const gate = sim.addUnit({
    kind: GATE_KIND, team: 0, rank: 'turret', level: lvl, x: L.gate.front.x, z: L.gate.front.z, r: 1.35, h: 3.6,
    s: plainStats({ hp: gateMax, dmg: 0, speed: 0 }), facing: 0
  })
  gate.rooted = true
  gate.s.damageReduction = GATE_GUARD
  // The story's siege holds at the gate's last splinter.
  if (o.story) applyStatus(sim, gate, 'unkillable', 1e9, 1, null, { quiet: true })
  const c = sim.addUnit({
    kind: o.commander.look, team: 0, rank: 'npc', level: 1, x: L.bell.x + 2.2, z: L.bell.z + 0.6, r: 0.5, h: 1.45,
    s: plainStats({ hp: 1000, dmg: 0, speed: 0 }), facing: 0
  })
  sim.xpMul = SIEGE_XP_MUL
  sim.dropTable = { mob: [], chest: [], boss: [], secret: [] }
  const s: SiegeState = {
    tier: o.tier, story: !!o.story, cap: o.cap, phase: 'build', wave: 1, buildT: BUILD_SECONDS,
    plan: siegeWaves(o.tier, o.rotation ?? 0), queue: [], packetT: 0, roles: new Map(), rams: [],
    gate: gate.id, gateMax, gateHp: gateMax, commander: c.id, barkVoice: o.commander.voice,
    marks: MARKS.start, earned: 0, elites: 0, hurt: false, flawless: true,
    ballistas: L.lanes.map(() => 0), ballCd: L.lanes.map(() => 0), cauldrons: L.lanes.map(() => false), barricades: L.lanes.map(() => null),
    militia: [], horns: 0, boss: 0, cleared: 0, news: []
  }
  sim.siege = s
  news(s, { t: 'build', n: 1 })
  return s
}

// ─── Building ────────────────────────────────────────────────────────────────

/** Why a defence cannot be bought now ('' it can). */
export type BuildBlock = '' | 'phase' | 'marks' | 'full'

/** The lane a placed defence goes to: the first free one, the middle lane first. */
const LANE_ORDER = [1, 0, 2] as const

const freeLane = (s: SiegeState, sim: Sim, id: DefenceId): number => {
  for (const l of LANE_ORDER) {
    if (id === 'ballista' && !live(sim, s.ballistas[l]!)) return l
    if (id === 'cauldron' && !s.cauldrons[l]) return l
    if (id === 'barricade' && !s.barricades[l]) return l
  }
  return -1
}

export const buildBlock = (sim: Sim, id: DefenceId): BuildBlock => {
  const s = sim.siege
  if (!s || s.phase !== 'build' || sim.ended) return 'phase'
  if (id === 'repair') { const g = live(sim, s.gate); if (!g || g.hp >= g.s.maxHp) return 'full' }
  if (id === 'militia' && s.militia.filter(m => live(sim, m)).length >= MILITIA_COUNT * 2) return 'full'
  if ((id === 'ballista' || id === 'cauldron' || id === 'barricade') && freeLane(s, sim, id) < 0) return 'full'
  if (s.marks < DEFENCE_COST[id]) return 'marks'
  return ''
}

/** Buy a defence in the build phase. False: not now (`buildBlock` says why). */
export const buildDefence = (sim: Sim, id: DefenceId): boolean => {
  const s = sim.siege
  if (!s || buildBlock(sim, id)) return false
  const L = SIEGE_LAYOUT
  const gate = live(sim, s.gate)
  switch (id) {
    case 'ballista': {
      const l = freeLane(s, sim, id)
      const p = L.lanes[l]!.platform
      const u = sim.addUnit({
        kind: BALLISTA_KIND, team: 0, rank: 'turret', level: sim.level, x: p.x, z: p.z, r: 0.62, h: 1.6,
        s: plainStats({ hp: enemyDmg(sim.level) * BALLISTA.hp * sim.difficulty, dmg: 0, speed: 0 }), facing: Math.PI
      })
      u.rooted = true
      s.ballistas[l] = u.id
      s.ballCd[l] = 0.5
      break
    }
    case 'cauldron': {
      const l = freeLane(s, sim, id)
      const f = L.lanes[l]!.fire
      const hp = enemyHp(sim.level)
      s.cauldrons[l] = true
      if (gate) {
        addField(sim, {
          fx: 'burning', kind: 'burnGround', src: gate, x: f.x, z: f.z, r: CAULDRON.r, dur: 1e9, every: CAULDRON.every,
          dmg: hp * CAULDRON.tick, type: 'fire', v: hp * CAULDRON.burn, color: '#ff7a2a'
        })
      }
      break
    }
    case 'barricade': {
      const l = freeLane(s, sim, id)
      raiseWall(sim, L.lanes[l]!.barricade, BARRICADE.dur, 'barricade')
      s.barricades[l] = { lane: l, hp: BARRICADE.hp, t: BARRICADE.dur }
      break
    }
    case 'militia': {
      const h = sim.hero.unit
      for (let k = 0; k < MILITIA_COUNT; k++) {
        const m = spawnMinion(sim, 'guard', L.gate.front.x + (k ? 1.6 : -1.6), L.gate.front.z + 1.4, -1)
        if (m) s.militia.push(m.id)
      }
      sim.emit({ t: 'fx', id: 'summon', x: h.x, z: h.z, color: '#ffd84a' })
      break
    }
    case 'repair': {
      if (gate) {
        gate.hp = Math.min(gate.s.maxHp, gate.hp + Math.round(gate.s.maxHp * REPAIR))
        sim.emit({ t: 'heal', tgt: gate.id, x: gate.x, z: gate.z, h: gate.h, amount: Math.round(gate.s.maxHp * REPAIR) })
      }
      break
    }
  }
  s.marks -= DEFENCE_COST[id]
  news(s, { t: 'built', id })
  return true
}

/** The player is ready: the wave comes now. */
export const skipBuild = (sim: Sim): boolean => {
  const s = sim.siege
  if (!s || s.phase !== 'build' || sim.ended) return false
  s.buildT = 0
  return true
}

// ─── Who the horde goes for ──────────────────────────────────────────────────

const nearestOf = (sim: Sim, u: Unit, ids: readonly number[]): Unit | undefined => {
  let best: Unit | undefined
  let bd = Infinity
  for (const id of ids) {
    const b = live(sim, id)
    if (!b) continue
    const d = (b.x - u.x) ** 2 + (b.z - u.z) ** 2
    if (d < bd) { bd = d; best = b }
  }
  return best
}

/**
 * The siege's say in an enemy's target (`ai.ts` asks first): a sapper runs at
 * the nearest defence or the gate, a raider at a ballista while one stands;
 * anyone else fights whoever of the hero's side stands near, and otherwise
 * marches on the gate. Null: not a siege.
 */
export const siegeTarget = (sim: Sim, u: Unit): Unit | null => {
  const s = sim.siege
  if (!s) return null
  const gate = live(sim, s.gate)
  const role = s.roles.get(u.id)
  if (role === 'sapper') return nearestOf(sim, u, s.ballistas) ?? gate ?? null
  if (role === 'raider') {
    const b = nearestOf(sim, u, s.ballistas)
    if (b) return b
  }
  if (role === 'boss' || role === 'elite') {
    const h = sim.hero.unit
    if (h.alive && !hasStatus(h, 'stealth') && Math.hypot(h.x - u.x, h.z - u.z) < CHALLENGE) return h
  }
  return sim.nearest(0, u.x, u.z, ENGAGE, 0) ?? gate ?? null
}

// ─── The waves ───────────────────────────────────────────────────────────────

const startWave = (sim: Sim, s: SiegeState): void => {
  const plan = s.plan[s.wave - 1]!
  s.queue.length = 0
  let lane = Math.floor(sim.rng() * 3)
  for (const gr of plan.groups) {
    for (let k = 0; k < gr.n; k++) {
      s.queue.push({ kind: gr.kind, role: gr.role, hp: gr.hp ?? 1, lane: gr.role === 'ram' ? (k === 0 ? 1 : 0) + (k > 1 ? 2 : 0) : lane })
      lane = (lane + 1) % 3
    }
  }
  // Mixed into one stream, the bosses and rams first (they are the wave's point).
  for (let i = s.queue.length - 1; i > 0; i--) {
    const j = Math.floor(sim.rng() * (i + 1))
    const a = s.queue[i]!
    s.queue[i] = s.queue[j]!
    s.queue[j] = a
  }
  s.queue.sort((a, b) => rank(b.role) - rank(a.role))
  s.packetT = 0
  s.hurt = false
  s.phase = 'wave'
  const ram = plan.groups.some(x => x.role === 'ram')
  news(s, { t: 'wave', n: s.wave, ram, boss: plan.groups.some(x => x.role === 'boss') })
  if (s.wave === 1) bark(sim, s, 'start')
  else if (ram) bark(sim, s, 'ram')
}

/** Spawn order inside a wave: bosses and rams lead, the rest follow mixed. */
const rank = (r: SpawnRole): number => (r === 'boss' ? 3 : r === 'ram' ? 2 : 0)

const hordeAlive = (sim: Sim): number => {
  let n = 0
  for (const u of sim.units) if (u.alive && u.team === 1) n++
  return n
}

const militiaAlive = (sim: Sim, s: SiegeState): number => {
  let n = 0
  for (const id of s.militia) if (live(sim, id)) n++
  return n
}

const spawnOne = (sim: Sim, s: SiegeState, e: SiegeState['queue'][number]): void => {
  const L = SIEGE_LAYOUT
  const lane = L.lanes[e.lane]!
  const tierHp = TIER_HP[s.tier]
  const jx = (sim.rng() - 0.5) * 4
  const jz = (sim.rng() - 0.5) * 2
  if (e.role === 'ram') {
    const hp = enemyHp(sim.level) * RAM.hp * tierHp * sim.difficulty
    const u = sim.addUnit({
      kind: RAM_KIND, team: 1, rank: 'elite', level: sim.level, x: lane.entry.x, z: lane.entry.z, r: 0.95, h: 1.7,
      s: plainStats({ hp, dmg: 0, speed: RAM.speed, armor: sim.level * 2 }), group: 0, facing: Math.PI
    })
    u.awake = true
    u.infernal = true
    u.rooted = true
    s.rams.push({ id: u.id, lane: e.lane, cd: RAM.every })
    s.roles.set(u.id, 'ram')
    // The ram's lane, warned like a charge (§8.5).
    const gate = live(sim, s.gate)
    if (gate) {
      sim.emit({
        t: 'tele', tele: {
          shape: 'line', x: lane.entry.x, z: lane.entry.z, r: Math.hypot(gate.x - lane.entry.x, gate.z - lane.entry.z), w: 1.2,
          a: Math.atan2(gate.x - lane.entry.x, gate.z - lane.entry.z), dur: 3, team: 1, src: u.id, charged: true
        }
      })
    }
    news(s, { t: 'ram' })
    return
  }
  const at = e.role === 'leap' ? L.leaps[sim.rng() < 0.5 ? 0 : 1]! : { x: lane.entry.x + jx, z: lane.entry.z + jz }
  const u = spawnEnemy(sim, e.kind, at.x + (e.role === 'leap' ? jx * 0.3 : 0), at.z, 0)
  if (!u) return
  u.awake = true
  u.infernal = true
  const mul = tierHp * e.hp
  if (mul !== 1) { u.s.maxHp = Math.max(1, Math.round(u.s.maxHp * mul)); u.hp = u.s.maxHp }
  if (e.role === 'boss' || e.role === 'elite') {
    u.champion = true
    if (u.rank !== 'boss') u.rank = 'elite'
  }
  if (e.role === 'boss') {
    s.boss = u.id
    // The Siege Lord hits as hard as he looks.
    if (e.kind === SIEGE_LORD) u.s.baseDmg *= 1.3
  }
  if (e.role === 'leap') sim.emit({ t: 'fx', id: 'slam', x: u.x, z: u.z, r: 1.6, color: '#8a7a6a' })
  if (e.role !== 'foe' && e.role !== 'leap') s.roles.set(u.id, e.role)
  const gate = live(sim, s.gate)
  u.targetId = gate?.id ?? sim.hero.unit.id
}

const stepWave = (sim: Sim, s: SiegeState, dt: number): void => {
  s.packetT -= dt
  if (s.queue.length && s.packetT <= 0) {
    s.packetT = PACKET_EVERY
    let room = s.cap - hordeAlive(sim) - militiaAlive(sim, s)
    for (let k = 0; k < PACKET_MAX && room > 0 && s.queue.length; k++, room--) spawnOne(sim, s, s.queue.shift()!)
  }
  if (s.queue.length || hordeAlive(sim) > 0) return
  // The wave is beaten.
  s.cleared = s.wave
  const unharmed = !s.hurt
  const paid = MARKS.wave + (unharmed ? MARKS.unharmed : 0)
  s.marks += paid
  s.earned += paid
  news(s, { t: 'cleared', n: s.wave, marks: paid, unharmed })
  s.boss = 0
  s.roles.clear()
  s.rams.length = 0
  if (s.wave >= SIEGE_WAVES) { winSiege(sim, s); return }
  s.wave++
  s.phase = 'build'
  s.buildT = BUILD_SECONDS
  news(s, { t: 'build', n: s.wave })
}

// ─── The horde's own moves and the defences ──────────────────────────────────

const gateReach = (u: Unit, gate: Unit): boolean => Math.hypot(u.x - gate.x, u.z - gate.z) <= u.r + gate.r + 0.45

/** A unit of the horde gone without a kill (a sapper blown, a ram broken on the gate): no reward. */
const retire = (sim: Sim, u: Unit): void => {
  u.icd.siegeCounted = 1
  u.alive = false
  u.deadT = 0
  u.hp = 0
  u.action = null
  u.anim = 'dead'
  u.animT = 0
  sim.emit({ t: 'death', unit: u.id, x: u.x, z: u.z, kind: u.kind, rank: u.rank, team: u.team })
}

const stepRams = (sim: Sim, s: SiegeState, gate: Unit, dt: number): void => {
  for (const r of s.rams) {
    const u = live(sim, r.id)
    if (!u) continue
    if (gateReach(u, gate)) {
      stop(u)
      u.anim = 'attack'
      r.cd -= dt
      if (r.cd <= 0) {
        r.cd = RAM.every
        dealDamage(sim, u, gate, s.gateMax * RAM.hit, { type: 'true', canCrit: false, heavy: true })
        sim.emit({ t: 'fx', id: 'slam', x: gate.x, z: gate.z + 0.6, r: 2.2, color: '#c8a070' })
      }
      continue
    }
    u.repathT -= dt
    if (u.repathT <= 0 || !u.hasGoal) {
      u.repathT = 0.8
      setGoal(sim, u, gate.x, gate.z + gate.r + u.r)
    }
    u.anim = walk(sim, u, dt) ? 'walk' : 'idle'
  }
}

const stepSappers = (sim: Sim, s: SiegeState, gate: Unit): void => {
  for (const [id, role] of s.roles) {
    if (role !== 'sapper') continue
    const u = live(sim, id)
    if (!u) continue
    const t = siegeTarget(sim, u)
    if (!t || Math.hypot(t.x - u.x, t.z - u.z) > u.r + t.r + 0.6) continue
    // It reaches what it ran at: the blast.
    sim.emit({ t: 'fx', id: 'blast', x: u.x, z: u.z, r: SAPPER.r, color: '#ff6a2a' })
    if (t === gate) dealDamage(sim, u, gate, s.gateMax * SAPPER.gate, { type: 'true', canCrit: false, heavy: true })
    else dealDamage(sim, u, t, t.hp + t.s.maxHp, { type: 'true', canCrit: false, heavy: true })
    for (const o of sim.inCircle(0, u.x, u.z, SAPPER.r, hits)) {
      if (o !== t && o !== gate && o.kind !== BALLISTA_KIND) dealDamage(sim, u, o, u.s.baseDmg * 3, { type: 'fire', canCrit: false })
    }
    retire(sim, u)
  }
}

const hits: Unit[] = []

const stepBallistas = (sim: Sim, s: SiegeState, dt: number): void => {
  const L = SIEGE_LAYOUT
  for (let l = 0; l < s.ballistas.length; l++) {
    const b = live(sim, s.ballistas[l]!)
    if (!b) { s.ballistas[l] = 0; continue }
    s.ballCd[l]! -= dt
    if (s.ballCd[l]! > 0) continue
    // The nearest of the horde in reach, its own lane's first.
    let best: Unit | undefined
    let bd = BALLISTA.range * BALLISTA.range
    for (const u of sim.units) {
      if (!u.alive || u.team !== 1 || outOfReach(u)) continue
      const d = (u.x - b.x) ** 2 + (u.z - b.z) ** 2 * 0.8 + (Math.abs(u.x - L.lanes[l]!.x) < 4.5 ? 0 : 40)
      if (d < bd) { bd = d; best = u }
    }
    if (!best) continue
    s.ballCd[l] = BALLISTA.every
    b.facing = Math.atan2(best.x - b.x, best.z - b.z)
    fire(sim, {
      fx: 'arrow', src: b, tx: best.x, tz: best.z, speed: BALLISTA.speed, dmg: enemyHp(sim.level) * BALLISTA.dmg, type: 'pierce',
      pierce: BALLISTA.pierce, r: 0.45, life: BALLISTA.range / BALLISTA.speed + 0.15, heavy: true, color: '#e8d2a0'
    })
    sim.emit({ t: 'fx', id: 'ballista', x: b.x, z: b.z, a: b.facing, unit: b.id, color: '#e8d2a0' })
  }
}

/** Barricades wear: their time runs out, and the horde pressed against them chews through. */
const stepBarricades = (sim: Sim, s: SiegeState, dt: number): void => {
  const L = SIEGE_LAYOUT
  const g = sim.grid
  for (let l = 0; l < s.barricades.length; l++) {
    const b = s.barricades[l]
    if (!b) continue
    b.t -= dt
    const cells = L.lanes[l]!.barricade
    const i0 = cells[0]! % g.w
    const j = (cells[0]! - i0) / g.w
    const z = (j + 0.5) * 1.5
    const x0 = i0 * 1.5
    const x1 = x0 + cells.length * 1.5
    for (const u of sim.units) {
      if (!u.alive || u.team !== 1 || u.x < x0 - 0.5 || u.x > x1 + 0.5 || Math.abs(u.z - z) > u.r + 1.3) continue
      // A body against the stakes beats on them as it would on anything.
      b.hp -= (u.s.baseDmg / Math.max(0.4, u.s.atkInterval)) * dt
    }
    const wall = sim.walls.find(w => w.fx === 'barricade' && cells.some(k => w.cells.includes(k)))
    if (b.hp <= 0 && wall) wall.t = wall.dur
    if (b.hp <= 0 || b.t <= 0 || !wall) s.barricades[l] = null
  }
}

// ─── The end ─────────────────────────────────────────────────────────────────

const winSiege = (sim: Sim, s: SiegeState): void => {
  s.phase = 'won'
  sim.ended = 'victory'
  sim.endReady = true
  news(s, { t: 'won' })
  bark(sim, s, 'won')
  sim.emit({ t: 'victory' })
}

const loseSiege = (sim: Sim, s: SiegeState, why: 'gate'): void => {
  s.phase = 'lost'
  news(s, { t: 'lost', why })
  if (!sim.ended) {
    sim.ended = 'defeat'
    sim.emit({ t: 'defeat' })
  }
}

/** One step of the siege (the director's, before anything else). */
export const stepSiege = (sim: Sim, dt: number): void => {
  const s = sim.siege
  if (!s) return
  const hero = sim.hero.unit
  // The story's siege: a fallen hero gets up again at once.
  if (s.story && sim.ended === 'defeat' && !hero.alive && s.phase !== 'lost') {
    if (reviveHero(sim)) news(s, { t: 'rally' })
  }
  countFallen(sim, s)
  // The colosseum's wave counters read the siege's (the coach's goal, the result's waves).
  sim.wave.n = s.wave
  sim.wave.cleared = s.cleared
  // Decided (or the hero down, waiting on Second wind: a revive carries the siege on).
  if (sim.ended) { sim.endedT += dt; return }
  const gate = sim.get(s.gate)
  if (!gate || !gate.alive) { loseSiege(sim, s, 'gate'); return }
  if (gate.hp < s.gateHp) { s.hurt = true; s.flawless = false }
  s.gateHp = gate.hp
  // The horn at half the gate, and at a quarter (§8.5).
  while (s.horns < HORNS.length && gate.hp <= gate.s.maxHp * HORNS[s.horns]!) {
    news(s, { t: 'horn', pct: Math.round(HORNS[s.horns]! * 100) })
    bark(sim, s, s.horns === 0 ? 'horn50' : 'horn25')
    s.horns++
  }
  // Repaired back above a line: the horn may sound at it again.
  while (s.horns > 0 && gate.hp > gate.s.maxHp * HORNS[s.horns - 1]! + 1) s.horns--
  stepBallistas(sim, s, dt)
  stepBarricades(sim, s, dt)
  if (s.phase === 'build') {
    s.buildT -= dt
    if (s.buildT <= 0) startWave(sim, s)
    return
  }
  stepRams(sim, s, gate, dt)
  stepSappers(sim, s, gate)
  stepWave(sim, s, dt)
}

/** Elites of the horde that fell since the last step: a Mark each (§8.2). A sapper blown up is not a kill. */
const countFallen = (sim: Sim, s: SiegeState): void => {
  for (const u of sim.units) {
    if (u.alive || u.team !== 1 || u.icd.siegeCounted) continue
    u.icd.siegeCounted = 1
    if (u.rank === 'elite' || u.rank === 'boss' || u.champion) {
      s.marks += MARKS.elite
      s.earned += MARKS.elite
      s.elites++
    }
  }
}
