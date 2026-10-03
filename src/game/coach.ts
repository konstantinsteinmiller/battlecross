import { shallowReactive } from 'vue'
import { SKILL_BY_ID } from './data/skills'
import { TOWNS } from './data/zones'
import { hud, hudLive } from './state/hud'
import { profile, saveProfile } from './state/profile'
import type { Sim } from './sim/world'
import { findPath, nearestOpen, smoothPath } from './sim/grid'
import type { Unit } from './sim/types'
import { dummyBeat, dummyOf } from './coach/dummy'
import { isVeteran, revealed } from './coach/reveal'
import { onboard, type FeatureId } from './coach/state'
import { canLearnFrom } from './coach/goal'
import type { ClassId } from './data/skills'

/**
 * ─── The wordless coach ──────────────────────────────────────────────────────
 *
 * Controls are taught with glyphs drawn where the action happens — a finger
 * tapping the ground ahead, a finger dragging from the hero to a goblin, a
 * ring closing on a skill button — and never with a sentence on a timer. Each
 * lesson stays until the player has DONE the thing a few times; every success
 * flashes it green and fills a pip; the last pip retires it for good.
 *
 * The rules, each one a playtest finding from the games this was built on:
 *   • nothing times out;
 *   • at most two glyphs at once, most urgent first;
 *   • a lesson is offered when its moment comes (the potion only when hurt,
 *     the mana flask only when the mana runs low, a chest only in a calm);
 *   • a player who is stuck gets the glyph back (recall), and the "?" button
 *     brings back the lessons of the place he is in;
 *   • mastery is stored per INPUT FAMILY: a desktop veteran on a phone has
 *     still not learned the touch controls.
 *
 * The same counts keep the FEATURE lessons (`FEATURES`: talking to a trainer,
 * equipping, travelling…), which `coach/onboarding.ts` paces one at a time and
 * `LessonLayer.vue` draws over the screens. A returning player has them all.
 *
 * The first visit of a new save opens on the training dummy
 * (`coach/dummy.ts`): the walk and the attack are taught on it before the
 * goblins, and only then does the walk glyph point up the road.
 *
 * This module is bookkeeping only: it needs no scene, so tests pin the rules.
 */

export type LessonId = 'move' | 'target' | 'skill' | 'aim' | 'potion' | 'mana' | 'chest' | 'talk'

export interface LessonDef<Id extends string = LessonId> {
  id: Id
  /** Successes it takes to retire. */
  need: number
  /** Higher shows first. */
  urgency: number
}

/** The controls, taught in the world. */
export const LESSONS: readonly LessonDef[] = [
  { id: 'potion', need: 1, urgency: 6 },
  { id: 'mana', need: 1, urgency: 5 },
  { id: 'target', need: 3, urgency: 4 },
  { id: 'skill', need: 3, urgency: 3 },
  { id: 'aim', need: 2, urgency: 2 },
  { id: 'chest', need: 1, urgency: 1.5 },
  { id: 'talk', need: 1, urgency: 1.2 },
  { id: 'move', need: 3, urgency: 1 }
]

/** The features, taught once each where they happen (`coach/onboarding.ts`). */
export const FEATURES: readonly LessonDef<FeatureId>[] = [
  { id: 'talk', need: 1, urgency: 0 },
  { id: 'teach', need: 1, urgency: 0 },
  { id: 'learn', need: 1, urgency: 0 },
  { id: 'slot', need: 1, urgency: 0 },
  { id: 'equip', need: 1, urgency: 0 },
  { id: 'attr', need: 1, urgency: 0 },
  { id: 'travel', need: 1, urgency: 0 },
  { id: 'buy', need: 1, urgency: 0 },
  { id: 'exit', need: 1, urgency: 0 }
]

/** Every lesson id, controls and features (the sentences behind them all). */
export const ALL_LESSON_IDS: readonly string[] = [...new Set([...LESSONS.map(l => l.id), ...FEATURES.map(l => l.id)])]

type AnyId = LessonId | FeatureId
const NEED: Record<string, number> = {}
for (const l of FEATURES) NEED[l.id] = l.need
for (const l of LESSONS) NEED[l.id] = l.need
const BY_ID: Record<LessonId, LessonDef> = Object.fromEntries(LESSONS.map(l => [l.id, l])) as Record<LessonId, LessonDef>
const FEATURE_IDS = new Set<string>(FEATURES.map(l => l.id))

/** Which lessons the "?" button brings back, by where the player is. */
export const RECALL: Record<'fight' | 'town' | 'map', readonly AnyId[]> = {
  fight: ['move', 'target', 'skill', 'aim', 'potion', 'mana', 'chest'],
  town: ['move', 'talk', 'teach', 'learn', 'slot', 'buy', 'equip', 'attr', 'exit'],
  map: ['travel', 'equip', 'attr']
}

export interface HintView {
  id: LessonId
  pips: number
  done: number
  /** Grows with every success (the green flash replays). */
  flash: number
}

/** What the coach needs from the live mode. */
export interface CoachHost {
  sim: Sim
  setup: { kind: 'zone' | 'town' | 'arena' }
  project(x: number, y: number, z: number, out: { x: number; y: number }): boolean
}

/** Per-frame geometry for the glyph layer (surface px). Not reactive.
 *  `x0, y0` where a drag or a trail starts, `x1, y1` where it points, `x2,
 *  y2` a second mark (a townsperson's head), `slot` the button it rings. */
export interface HintGeo { x0: number; y0: number; x1: number; y1: number; x2: number; y2: number; slot: number; on: boolean }
const geo = (slot = -1): HintGeo => ({ x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, slot, on: false })
/**
 * The way to a trainer as the hero would WALK it (round houses, through
 * doors), in surface px: `n` points in `pts` (x, y pairs), hero first.
 * Rewritten every frame from a path found a few times a second.
 */
export const hintPath = { n: 0, pts: new Float32Array(96) }
/** Whom the way leads to (a look id), for the badge at the screen edge. Reactive. */
export const hintTalk = shallowReactive({ look: '' })
const wayWorld: number[] = []
const wayScratch: number[] = []
const wayOpen: [number, number] = [0, 0]
let wayAge = 1e9
let wayTo = -1

export const hintGeo: Record<LessonId, HintGeo> = {
  move: geo(), target: geo(), skill: geo(0), aim: geo(0), potion: geo(), mana: geo(), chest: geo(), talk: geo()
}

/** A signature no list of glyphs has: the next step republishes, even an
 *  empty list (a lesson just retired must leave the screen). */
const STALE = '\u0000'

/** Metres from the training dummy at which the walk lesson hands over to the hit. */
const DUMMY_NEAR = 2.7

const key = (id: string, family: string): string => `hint:${id}:${family}`
const p0 = { x: 0, y: 0 }
const p1 = { x: 0, y: 0 }
const p2 = { x: 0, y: 0 }
const p3 = { x: 0, y: 0 }

/** The townspeople who teach, and what (the "talk" lesson leads to the
 *  nearest who can teach the hero something now). */
const TRAINERS = new Map<string, ClassId | undefined>()
for (const t of Object.values(TOWNS)) for (const n of t.npcs) if (n.role === 'trainer') TRAINERS.set(n.id, n.cls)

class Coach {
  private flashes: Record<string, number> = {}
  /** Lessons brought back for one more use (recall, the "?" button). */
  private recalled = new Set<string>()
  private idleT = 0
  private noTargetT = 0
  private sig = STALE
  private part: Record<string, number> = {}
  /** The chests the hero had opened at the last step (a new one is a use). */
  private chestSim: Sim | null = null
  private chestN = 0

  private family(): string {
    return hud.device
  }

  count(id: AnyId): number {
    const v = profile.tips[key(id, this.family())]
    return typeof v === 'number' ? v : 0
  }

  learned(id: AnyId): boolean {
    if (this.recalled.has(id)) return false
    // A returning player is past the introductions (not the controls: those
    // are per hand, and his hand may be new).
    if (FEATURE_IDS.has(id) && isVeteran()) return true
    return this.count(id) >= (NEED[id] ?? 1)
  }

  /** The player did the thing. */
  use(id: AnyId): void {
    const k = key(id, this.family())
    const n = this.count(id)
    this.flashes[id] = (this.flashes[id] ?? 0) + 1
    if (this.recalled.delete(id)) { this.sig = STALE; return }
    if (n >= (NEED[id] ?? 1)) return
    profile.tips[k] = n + 1
    this.sig = STALE
    if (n + 1 >= (NEED[id] ?? 1)) saveProfile()
  }

  /** A continuous input (the stick): `amount` of a use per call. */
  progress(id: LessonId, amount: number): void {
    const v = (this.part[id] ?? 0) + amount
    if (v >= 1) {
      this.part[id] = 0
      this.use(id)
    } else this.part[id] = v
  }

  /** The pause menu: every control lesson once more. */
  recallAll(): void {
    for (const l of LESSONS) this.recalled.add(l.id)
    this.sig = STALE
  }

  /** The "?" button: the lessons of the place the player is in, once more. */
  recall(ids: readonly AnyId[]): void {
    for (const id of ids) this.recalled.add(id)
    this.sig = STALE
  }

  /** Brought back and not used since. */
  isRecalled(id: AnyId): boolean {
    return this.recalled.has(id)
  }

  /** Decide which glyphs are up and where they point. */
  step(host: CoachHost, dt: number): void {
    const sim = host.sim
    const h = sim.hero
    const u = h.unit
    for (const k in hintGeo) hintGeo[k as LessonId].on = false
    if (!u.alive || sim.ended) { this.setFight(false); this.publish([]); return }

    // A chest opened, however it was found: the chest lesson is learned.
    if (this.chestSim !== sim) { this.chestSim = sim; this.chestN = h.chests }
    if (h.chests > this.chestN) { this.chestN = h.chests; this.use('chest') }

    // The nearest awake enemy.
    let foe: Unit | undefined
    let bd = 14
    for (const e of sim.units) {
      if (!e.alive || e.team !== 1 || !e.awake) continue
      const d = Math.hypot(e.x - u.x, e.z - u.z)
      if (d < bd) { bd = d; foe = e }
    }
    this.setFight(!!foe)
    // The opening beat: the dummy stands for an enemy while it is up.
    const dummy = dummyBeat(sim) === 'on' ? dummyOf(sim) : null
    const dummyD = dummy ? Math.hypot(dummy.x - u.x, dummy.z - u.z) : 99
    // First the walk up to it, then — once there — the hit: one at a time.
    const atDummy = !!dummy && dummyD < DUMMY_NEAR
    const aimAt = foe ?? (atDummy ? dummy! : undefined)
    const moving = Math.hypot(u.vx, u.vz) > 0.4
    this.idleT = moving || foe ? 0 : this.idleT + dt
    const hasTarget = h.order.kind === 'attack' && !!sim.live(h.order.targetId)
    this.noTargetT = foe && !hasTarget ? this.noTargetT + dt : 0
    // Stuck: standing with nothing to fight for a long while, or facing an
    // enemy without ever locking it.
    if (this.idleT > 16 && this.learned('move') && host.setup.kind !== 'town') { this.recalled.add('move'); this.idleT = 0 }
    if (this.noTargetT > 7 && this.learned('target')) { this.recalled.add('target'); this.noTargetT = 0 }

    const want: LessonId[] = []
    const ready = (slot: number): boolean => (h.cd[slot] ?? 1) <= 0 && !!h.skills[slot] && u.mana >= (SKILL_BY_ID[h.skills[slot]!]?.mana ?? 0)

    if (!this.learned('potion') && h.potions > 0 && h.potionCd <= 0 && u.hp < u.s.maxHp * 0.45) {
      want.push('potion')
      hintGeo.potion.on = true
    }
    // The mana flask, the first time the mana runs low with one in stock.
    if (!this.learned('mana') && h.manaPotions > 0 && h.manaPotionCd <= 0 && u.s.maxMana > 0 && u.mana < u.s.maxMana * 0.25 && revealed('mana')) {
      want.push('mana')
      hintGeo.mana.on = true
    }
    if (!this.learned('target') && aimAt && !hasTarget) {
      host.project(u.x, 0.5, u.z, p0)
      host.project(aimAt.x, aimAt.h * 0.5, aimAt.z, p1)
      Object.assign(hintGeo.target, { x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y, on: true })
      want.push('target')
    }
    if (foe) {
      // The first ready skill; an aimed one teaches the drag.
      let slot = -1
      let aimSlot = -1
      for (let s = 0; s < 6; s++) {
        if (!ready(s)) continue
        const def = SKILL_BY_ID[h.skills[s]!]
        if (!def) continue
        if (slot < 0) slot = s
        if (aimSlot < 0 && (def.target === 'ground' || def.target === 'dir')) aimSlot = s
      }
      if (!this.learned('skill') && slot >= 0) {
        hintGeo.skill.slot = slot
        hintGeo.skill.on = true
        want.push('skill')
      } else if (!this.learned('aim') && aimSlot >= 0) {
        host.project(foe.x, 0.3, foe.z, p1)
        Object.assign(hintGeo.aim, { x1: p1.x, y1: p1.y, slot: aimSlot, on: true })
        want.push('aim')
      }
    }
    // The first chest seen, in a calm, once the dummy has had its turn.
    if (!this.learned('chest') && !foe && !dummy && host.setup.kind === 'zone') {
      const c = this.nearChest(sim, u)
      if (c && host.project(c.x, 0.55, c.z, p1)) {
        Object.assign(hintGeo.chest, { x1: p1.x, y1: p1.y, on: true })
        want.push('chest')
      }
    }
    // A town's first steps: the way to the nearest trainer, when the pacing
    // says this is the moment (`coach/onboarding.ts`).
    if (host.setup.kind === 'town' && onboard.lesson === 'talk' && onboard.shown && !this.learned('talk')) {
      const t = this.nearTrainer(sim, u)
      if (t) {
        host.project(u.x, 0.02, u.z, p0)
        host.project(t.x, t.h * 0.5, t.z, p1)
        host.project(t.x, t.h + 0.75, t.z, p2)
        Object.assign(hintGeo.talk, { x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, on: true })
        if (hintTalk.look !== t.kind) hintTalk.look = t.kind
        // The walked way: found again a few times a second (the hero and the
        // trainer both move), projected every frame.
        wayAge += dt
        if (wayAge > 0.4 || wayTo !== t.id) {
          wayAge = 0
          wayTo = t.id
          wayWorld.length = 0
          if (nearestOpen(sim.grid, t.x, t.z + 0.9, wayOpen) && findPath(sim.grid, u.x, u.z, wayOpen[0], wayOpen[1], wayScratch) > 0) {
            wayScratch.length = smoothPath(sim.grid, u.x, u.z, wayScratch)
            for (const v of wayScratch) wayWorld.push(v)
          }
        }
        const pts = hintPath.pts
        let n = 0
        pts[n * 2] = p0.x; pts[n * 2 + 1] = p0.y; n++
        for (let i = 0; i + 1 < wayWorld.length && n < pts.length / 2 - 1; i += 2) {
          if (host.project(wayWorld[i]!, 0.02, wayWorld[i + 1]!, p3)) { pts[n * 2] = p3.x; pts[n * 2 + 1] = p3.y; n++ }
        }
        hintPath.n = wayWorld.length ? n : 0
        want.push('talk')
      }
    }
    if (!this.learned('move') && !foe && host.setup.kind !== 'town' && !(atDummy && !this.learned('target'))) {
      // A spot ahead of him: toward the dummy while it stands, else toward
      // the next pack.
      const g = sim.groups.find(q => !q.cleared)
      const to = dummy ?? g
      let tx = u.x
      let tz = u.z - 4.5
      if (to) {
        const d = Math.hypot(to.x - u.x, to.z - u.z) || 1
        // Well short of the dummy: a tap there walks, it does not strike.
        const reach = dummy ? Math.max(0.8, Math.min(4.5, d - 2)) : Math.min(4.5, d)
        tx = u.x + ((to.x - u.x) / d) * reach
        tz = u.z + ((to.z - u.z) / d) * reach
      }
      host.project(tx, 0.05, tz, p1)
      Object.assign(hintGeo.move, { x1: p1.x, y1: p1.y, on: true })
      want.push('move')
    }

    // Two at a time, most urgent first.
    want.sort((a, b) => BY_ID[b].urgency - BY_ID[a].urgency)
    const shown = want.slice(0, 2)
    for (const k in hintGeo) if (!shown.includes(k as LessonId)) hintGeo[k as LessonId].on = false
    this.publish(shown)
    hudLive.hintOn = shown.length > 0
  }

  /** The nearest closed chest that can be opened now, within sight. */
  private nearChest(sim: Sim, u: Unit): { x: number; z: number } | null {
    let best: { x: number; z: number } | null = null
    let bd = 10
    for (const c of sim.chests) {
      if (c.state !== 'closed' || c.role === 'finale') continue
      // Its guard still stands: that is a fight first, not a chest.
      if (c.guard >= 0 && !sim.sideGroups[c.guard]?.cleared) continue
      const d = Math.hypot(c.x - u.x, c.z - u.z)
      if (d < bd) { bd = d; best = c }
    }
    return best
  }

  /** The nearest trainer in this town who can teach the hero something now
   *  (a trainer with nothing for him is no lesson), else the nearest at all. */
  private nearTrainer(sim: Sim, u: Unit): Unit | null {
    let best: Unit | null = null
    let bd = 1e9
    let any: Unit | null = null
    let ad = 1e9
    for (const n of sim.units) {
      if (n.rank !== 'npc' || !n.npc || !TRAINERS.has(n.npc)) continue
      const d = Math.hypot(n.x - u.x, n.z - u.z)
      if (d < ad) { ad = d; any = n }
      const cls = TRAINERS.get(n.npc)
      if (cls && d < bd && canLearnFrom(cls)) { bd = d; best = n }
    }
    return best ?? any
  }

  private setFight(on: boolean): void {
    if (onboard.fight !== on) onboard.fight = on
  }

  private publish(ids: LessonId[]): void {
    const views: HintView[] = ids.map(id => ({ id, pips: BY_ID[id].need, done: Math.min(BY_ID[id].need, this.count(id)), flash: this.flashes[id] ?? 0 }))
    const sig = views.map(v => `${v.id}:${v.done}:${v.flash}`).join('|')
    if (sig === this.sig) return
    this.sig = sig
    hud.hints = views.map(v => ({ id: v.id, kind: v.id, pips: v.pips, done: v.done, flash: v.flash }))
  }

  /** Test seam. */
  reset(): void {
    this.flashes = {}
    this.recalled.clear()
    this.idleT = 0
    this.noTargetT = 0
    this.sig = STALE
    this.part = {}
    this.chestSim = null
    this.chestN = 0
  }
}

export const coach = new Coach()
