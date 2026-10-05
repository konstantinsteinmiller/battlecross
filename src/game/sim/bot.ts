import { startAttrs, ATTRS, type Attr, type AttrBlock } from '../data/attributes'
import { POINTS_PER_LEVEL } from '../data/attributes'
import { SKILLS, SKILL_BY_ID, meetsSkill, type ClassId } from '../data/skills'
import { ITEMS, noGear, type ItemSlot, type ZoneId } from '../data/items'
import { ZONES, visitLevel } from '../data/zones'
import { applyPlan, populateZone } from './director'
import { ROLL_DIST, castSkill, createHero, orderAttack, orderMove, rollHero, slotState, useManaPotion, usePotion } from './hero'
import { isSolidAt } from './grid'
import type { Danger } from './types'
import { chestLock, orderOpen } from './interact'
import { zoneMastery, type Mastery } from './route'
import { heroStats, sumBuild, type HeroBuild } from './stats'
import { stepSim } from './step'
import { generateZone, type ZonePlan } from './zoneGen'
import { Sim } from './world'

/**
 * ─── A reference player ──────────────────────────────────────────────────────
 *
 * A scripted hero that plays a zone the way a competent, unhurried player
 * would: walk to the next pack, fight what is awake, use every skill as it
 * comes up, drink at 40 %. It opens no chests and takes no side path, so it
 * measures the fights alone: the main road is the shortest route to the
 * finale, and the yardstick never leaves it. The `explore` policy is the
 * completionist instead: every branch, every branch boss, every chest it can
 * reach, the finale last (the full-clear time). Not an AI — a yardstick. The balance tests run it
 * through every zone with a level-appropriate build so a later change to a
 * formula cannot silently turn the Goblin Hollows into a wall (or a walkover).
 */

export interface RefBuildOpts {
  level: number
  cls: ClassId
  /** Gear tier to wear (best item of each slot at or below the hero's level). */
  geared?: boolean
}

/** Where each class puts its points: two in three into the main attribute. */
const MAIN: Record<ClassId, [Attr, Attr]> = {
  aegis: ['str', 'end'], shadow: ['dex', 'skl'], pyro: ['int', 'skl'], sovereign: ['cha', 'end'],
  chrono: ['int', 'skl'], blood: ['end', 'int'], aether: ['skl', 'int'], geo: ['str', 'int']
}

export const referenceBuild = (o: RefBuildOpts): { build: HeroBuild; skills: string[] } => {
  const attrs: AttrBlock = startAttrs()
  const [a, b] = MAIN[o.cls]
  let points = (o.level - 1) * POINTS_PER_LEVEL
  // First, what the class's own skills ask for at this level: a player who
  // commits to a class spends the points that unlock its skills (an Aegis
  // Knight needs INT 8 for Radiant Strike) before anything else.
  for (const s of SKILLS) {
    if (s.cls !== o.cls || s.level > o.level) continue
    for (const k in s.req) {
      const attr = k as Attr
      const need = (s.req[attr] ?? 0) - attrs[attr]
      if (need > 0 && need <= points) { attrs[attr] += need; points -= need }
    }
  }
  attrs[a] += Math.ceil(points * 0.6)
  attrs[b] += Math.floor(points * 0.3)
  attrs.end += points - Math.ceil(points * 0.6) - Math.floor(points * 0.3)
  const equipped = noGear()
  if (o.geared !== false) {
    const score = (id: string): number => {
      const it = ITEMS.find(i => i.id === id)!
      return (it.mods[a] ?? 0) * 2 + (it.mods[b] ?? 0) + (it.mods.end ?? 0) * 0.5 + (it.armor ?? 0) * 0.2 + it.tier
    }
    const best = (slot: ItemSlot, skip?: string | null): string | null => {
      const pool = ITEMS.filter(i => i.slot === slot && i.level <= o.level && i.id !== skip)
      // A weapon must be one the class's attribute actually swings.
      const fit = slot === 'main' ? pool.filter(i => i.weapon?.scale === a || i.weapon?.scale === b) : pool
      const list = (fit.length ? fit : pool).sort((x, y) => score(y.id) - score(x.id))
      return list[0]?.id ?? null
    }
    equipped.main = best('main')
    equipped.off = best('off')
    equipped.head = best('head')
    equipped.body = best('body')
    equipped.hands = best('hands')
    equipped.feet = best('feet')
    equipped.trinket1 = best('trinket')
    equipped.trinket2 = best('trinket', equipped.trinket1)
  }
  // Every skill of the class the build qualifies for.
  const probe: HeroBuild = { level: o.level, attrs, equipped, passives: [] }
  const total = sumBuild(probe).attrs
  const own = SKILLS.filter(s => s.cls === o.cls && meetsSkill(s, o.level, total))
  const passives = own.filter(s => s.kind === 'passive').slice(0, 3).map(s => s.id)
  const skills = own.filter(s => s.kind === 'active').slice(0, 6).map(s => s.id)
  return { build: { level: o.level, attrs, equipped, passives }, skills }
}

export interface RunResult {
  outcome: '' | 'victory' | 'defeat'
  seconds: number
  hpLeft01: number
  kills: number
  xp: number
  gold: number
  dealt: number
  taken: number
  potionsUsed: number
  items: string[]
  /** Bosses beaten and chests opened of the visit's (roadmap #70). */
  mastery: Mastery
}

export interface RunOpts extends RefBuildOpts {
  zone: ZoneId
  seed?: number
  /** Enemy level; default is the zone's level for this hero. */
  enemyLevel?: number
  difficulty?: number
  maxSeconds?: number
  potions?: number
  /** Play the plain chain, without what a visit holds beside its packs. */
  bare?: boolean
  /** Clear the branches and open the chests before the finale. */
  explore?: boolean
}

/** Set up a zone visit exactly as the game does, with a reference build. */
export const setupRun = (o: RunOpts): { sim: Sim; plan: ZonePlan } => {
  const def = ZONES[o.zone]
  const seed = o.seed ?? 1234
  const plan = generateZone(def, seed, { bare: o.bare })
  const sim = new Sim({
    seed, w: plan.w, h: plan.h, level: o.enemyLevel ?? visitLevel(def, o.level), difficulty: o.difficulty ?? 1,
    mode: 'zone', zone: o.zone
  })
  applyPlan(sim, plan)
  const ref = referenceBuild(o)
  createHero(sim, { build: ref.build, skills: ref.skills, x: plan.start.x, z: plan.start.z, xpInto: 0, potions: o.potions ?? 3 })
  populateZone(sim, plan, o.zone, [])
  return { sim, plan }
}

/** One decision of the reference player (call a few times a second).
 *  `explore`: the completionist's route (every branch and chest first). */
export const botThink = (sim: Sim, explore = false): void => {
  const h = sim.hero
  const u = h.unit
  if (!u.alive) return
  if (sim.ended) {
    // A won zone: like a player, it goes and opens the finale's chest (the
    // recorder's win clips end on it). `runZone` itself stops at the win.
    const c = sim.ended === 'victory' ? sim.chests.find(x => x.role === 'finale') : undefined
    if (c && c.state === 'closed' && h.order.kind === 'none' && !u.action) orderOpen(sim, c.id)
    return
  }
  if (u.hp < u.s.maxHp * 0.4) usePotion(sim)
  if (dodge(sim)) return
  if (h.manaPotions > 0 && h.manaPotionCd <= 0 && u.mana < u.s.maxMana * 0.25) useManaPotion(sim)
  // The nearest enemy that is awake; if none, the next pack that still stands.
  let foe: (typeof sim.units)[number] | undefined
  let bd = Infinity
  for (const e of sim.units) {
    if (!e.alive || e.team !== 1 || !e.awake) continue
    const d = Math.hypot(e.x - u.x, e.z - u.z)
    if (d < bd) { bd = d; foe = e }
  }
  if (!foe) {
    if (explore && exploreStep(sim)) return
    // The main chain only: side packs are a player's choice, not the yardstick's.
    const next = sim.groups.find(g => !g.cleared)
    if (next && (h.order.kind !== 'move' || Math.hypot(h.order.x - next.x, h.order.z - next.z) > 1)) orderMove(sim, next.x, next.z)
    return
  }
  if (h.order.kind !== 'attack' || h.order.targetId !== foe.id) orderAttack(sim, foe.id)
  if (u.action && u.action.id !== 'attack') return
  for (let slot = 0; slot < 6; slot++) {
    const st = slotState(sim, slot)
    if (!st.ready || !st.def) continue
    const def = st.def
    // Hold defensive and panic buttons for when they are needed.
    if ((def.id === 'holyBastion' || def.id === 'chronoRewind' || def.id === 'smokeBomb') && u.hp > u.s.maxHp * 0.45) continue
    if (def.id === 'ventHeat' && h.heat < 60) continue
    if (def.hpCost && u.hp < u.s.maxHp * 0.5) continue
    // Area skills that are centred on the hero wait for something to be in them.
    if (def.target === 'self' && def.radius && bd > def.radius) continue
    if (def.target === 'enemy' && def.range <= 3 && bd > 6) continue
    if (castSkill(sim, slot, null)) return
  }
}

// ─── Dodging (#74, D80) ──────────────────────────────────────────────────────

/** Of the warnings it stands in, the share it rolls out of (a fair player, not a perfect one). */
export const BOT_DODGE = 0.7
/** How soon before a warning lands it rolls (it thinks five times a second). */
const DODGE_LEAD = 0.55

/** Does a warning cover a body of radius `pr` at (px, pz)? */
export const inDanger = (d: Danger, px: number, pz: number, pr: number): boolean => {
  const t = d.tele
  const dx = px - d.x
  const dz = pz - d.z
  if (t.shape === 'circle') return Math.hypot(dx, dz) < t.r + pr
  const sa = Math.sin(t.a)
  const ca = Math.cos(t.a)
  const along = dx * sa + dz * ca
  const across = dx * ca - dz * sa
  if (t.shape === 'line') return along > -pr && along < t.r + pr && Math.abs(across) < t.w + pr
  if (Math.hypot(dx, dz) > t.r + pr) return false
  let da = Math.atan2(dx, dz) - t.a
  while (da > Math.PI) da -= Math.PI * 2
  while (da < -Math.PI) da += Math.PI * 2
  return Math.abs(da) < t.w + 0.12
}

/** The way out of a warning: off a lane or a narrow cone sideways, out of a circle or a wide cone. */
const wayOut = (d: Danger, px: number, pz: number): [number, number] => {
  const t = d.tele
  const dx = px - d.x
  const dz = pz - d.z
  if (t.shape === 'circle' || (t.shape === 'cone' && t.w > 0.9)) {
    const l = Math.hypot(dx, dz)
    return l > 0.2 ? [dx / l, dz / l] : [Math.cos(t.a), -Math.sin(t.a)]
  }
  const across = dx * Math.cos(t.a) - dz * Math.sin(t.a)
  const s = across >= 0 ? 1 : -1
  return [Math.cos(t.a) * s, -Math.sin(t.a) * s]
}

/** A stable coin per warning: whether this one is rolled out of. */
let dodgeShare = BOT_DODGE
/** How often it rolls out (a clip that wants the hit taken sets 0 for a moment). */
export const setBotDodge = (share: number): void => { dodgeShare = share }
const rollsFor = (n: number): boolean => ((Math.imul(n, 2654435761) >>> 0) / 4294967296) < dodgeShare

/** Roll out of a foe's warning about to land. True: it rolled. */
const dodge = (sim: Sim): boolean => {
  const h = sim.hero
  const u = h.unit
  if (h.rollCd > 0 || u.action?.id === 'roll') return false
  for (const d of sim.dangers) {
    if (d.tele.team === u.team) continue
    const left = d.at - sim.time
    if (left < 0 || left > DODGE_LEAD) continue
    // A shadow that hunts: only once it has locked.
    if (d.tele.follow && sim.time - d.t0 < (d.tele.lock ?? 0)) continue
    if (!rollsFor(d.n) || !inDanger(d, u.x, u.z, u.r)) continue
    // Of the rolls that come out clear, the one that stays nearest its foe
    // (a fight that only ever rolls away wanders off across the map).
    const foe = h.order.kind === 'attack' ? sim.live(h.order.targetId) : undefined
    let best: [number, number] | null = null
    let bd = Infinity
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2
      const rx = Math.sin(a)
      const rz = Math.cos(a)
      const x = u.x + rx * ROLL_DIST
      const z = u.z + rz * ROLL_DIST
      if (isSolidAt(sim.grid, u.x + rx * 2, u.z + rz * 2) || isSolidAt(sim.grid, x, z) || inDanger(d, x, z, u.r)) continue
      const s = foe ? Math.abs(Math.hypot(foe.x - x, foe.z - z) - 3) : 0
      if (s < bd) { bd = s; best = [rx, rz] }
    }
    let [rx, rz] = best ?? wayOut(d, u.x, u.z)
    // Rock that way: the other way.
    if (!best && isSolidAt(sim.grid, u.x + rx * 3, u.z + rz * 3)) { rx = -rx; rz = -rz }
    return rollHero(sim, rx, rz)
  }
  return false
}

/** The completionist's next errand: the nearest chest it may open, else the
 *  nearest branch pack or main pack before the finale. False: only the finale is left. */
const exploreStep = (sim: Sim): boolean => {
  const h = sim.hero
  const u = h.unit
  if (h.opening >= 0 || h.order.kind === 'chest') return true
  let best: { x: number; z: number; chest: number } | undefined
  let bd = Infinity
  const consider = (x: number, z: number, chest: number): void => {
    const d = Math.hypot(x - u.x, z - u.z)
    if (d < bd) { bd = d; best = { x, z, chest } }
  }
  for (const c of sim.chests) if (c.role !== 'finale' && c.state === 'closed' && chestLock(sim, c) === '') consider(c.sx, c.sz, c.id)
  for (const b of sim.branches) {
    const g = sim.groupById(b.group)
    if (g && !g.cleared) consider(g.x, g.z, -1)
  }
  for (const g of sim.groups) if (!g.cleared && !g.finale) consider(g.x, g.z, -1)
  if (!best) return false
  const t: { x: number; z: number; chest: number } = best
  if (t.chest >= 0) { orderOpen(sim, t.chest); return true }
  if (h.order.kind !== 'move' || Math.hypot(h.order.x - t.x, h.order.z - t.z) > 1) orderMove(sim, t.x, t.z)
  return true
}

/** Play a zone to its end (or to the time limit) with the reference player. */
export const runZone = (o: RunOpts): RunResult => {
  const { sim, plan } = setupRun(o)
  const dt = 1 / 30
  const max = o.maxSeconds ?? 420
  const potions0 = sim.hero.potions
  let think = 0
  while (!sim.ended && sim.time < max) {
    think -= dt
    if (think <= 0) { think = 0.2; botThink(sim, o.explore) }
    stepSim(sim, plan, dt)
    sim.events.length = 0
  }
  const h = sim.hero
  return {
    outcome: sim.ended,
    seconds: sim.time,
    hpLeft01: Math.max(0, h.unit.hp) / h.unit.s.maxHp,
    kills: h.kills,
    xp: h.xp,
    gold: h.gold,
    dealt: h.dealt,
    taken: h.taken,
    potionsUsed: potions0 - h.potions,
    items: h.items,
    mastery: zoneMastery(sim)
  }
}

export { heroStats, SKILL_BY_ID, ATTRS }
