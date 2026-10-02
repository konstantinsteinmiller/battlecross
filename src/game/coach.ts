import { SKILL_BY_ID } from './data/skills'
import { hud, hudLive } from './state/hud'
import { profile, saveProfile } from './state/profile'
import type { Sim } from './sim/world'

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
 *   • a lesson is offered when its moment comes (the potion only when hurt);
 *   • a player who is stuck gets the glyph back (recall), and the "?" button
 *     brings the whole set back;
 *   • mastery is stored per INPUT FAMILY: a desktop veteran on a phone has
 *     still not learned the touch controls.
 *
 * This module is bookkeeping only: it needs no scene, so tests pin the rules.
 */

export type LessonId = 'move' | 'target' | 'skill' | 'aim' | 'potion'

export interface LessonDef {
  id: LessonId
  /** Successes it takes to retire. */
  need: number
  /** Higher shows first. */
  urgency: number
}

export const LESSONS: readonly LessonDef[] = [
  { id: 'potion', need: 1, urgency: 5 },
  { id: 'target', need: 3, urgency: 4 },
  { id: 'skill', need: 3, urgency: 3 },
  { id: 'aim', need: 2, urgency: 2 },
  { id: 'move', need: 3, urgency: 1 }
]

const BY_ID: Record<LessonId, LessonDef> = Object.fromEntries(LESSONS.map(l => [l.id, l])) as Record<LessonId, LessonDef>

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

/** Per-frame geometry for the glyph layer (surface px). Not reactive. */
export const hintGeo: Record<LessonId, { x0: number; y0: number; x1: number; y1: number; slot: number; on: boolean }> = {
  move: { x0: 0, y0: 0, x1: 0, y1: 0, slot: -1, on: false },
  target: { x0: 0, y0: 0, x1: 0, y1: 0, slot: -1, on: false },
  skill: { x0: 0, y0: 0, x1: 0, y1: 0, slot: 0, on: false },
  aim: { x0: 0, y0: 0, x1: 0, y1: 0, slot: 0, on: false },
  potion: { x0: 0, y0: 0, x1: 0, y1: 0, slot: -1, on: false }
}

const key = (id: LessonId, family: string): string => `hint:${id}:${family}`
const p0 = { x: 0, y: 0 }
const p1 = { x: 0, y: 0 }

class Coach {
  private flashes: Record<string, number> = {}
  /** Lessons brought back for one more use (recall, the "?" button). */
  private recalled = new Set<LessonId>()
  private idleT = 0
  private noTargetT = 0
  private sig = ''
  private part: Record<string, number> = {}

  private family(): string {
    return hud.device
  }

  count(id: LessonId): number {
    const v = profile.tips[key(id, this.family())]
    return typeof v === 'number' ? v : 0
  }

  learned(id: LessonId): boolean {
    return this.count(id) >= BY_ID[id].need && !this.recalled.has(id)
  }

  /** The player did the thing. */
  use(id: LessonId): void {
    const k = key(id, this.family())
    const n = this.count(id)
    this.flashes[id] = (this.flashes[id] ?? 0) + 1
    if (this.recalled.delete(id)) { this.sig = ''; return }
    if (n >= BY_ID[id].need) return
    profile.tips[k] = n + 1
    this.sig = ''
    if (n + 1 >= BY_ID[id].need) saveProfile()
  }

  /** A continuous input (the stick): `amount` of a use per call. */
  progress(id: LessonId, amount: number): void {
    const v = (this.part[id] ?? 0) + amount
    if (v >= 1) {
      this.part[id] = 0
      this.use(id)
    } else this.part[id] = v
  }

  /** The "?" button: every lesson once more. */
  recallAll(): void {
    for (const l of LESSONS) this.recalled.add(l.id)
    this.sig = ''
  }

  /** Decide which glyphs are up and where they point. */
  step(host: CoachHost, dt: number): void {
    const sim = host.sim
    const h = sim.hero
    const u = h.unit
    for (const k in hintGeo) hintGeo[k as LessonId].on = false
    if (!u.alive || sim.ended) { this.publish([]); return }

    // The nearest awake enemy.
    let foe: (typeof sim.units)[number] | undefined
    let bd = 14
    for (const e of sim.units) {
      if (!e.alive || e.team !== 1 || !e.awake) continue
      const d = Math.hypot(e.x - u.x, e.z - u.z)
      if (d < bd) { bd = d; foe = e }
    }
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
    if (!this.learned('target') && foe && !hasTarget) {
      host.project(u.x, 0.5, u.z, p0)
      host.project(foe.x, foe.h * 0.5, foe.z, p1)
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
    if (!this.learned('move') && !foe && host.setup.kind !== 'town') {
      // A spot ahead of him, toward the next pack.
      const g = sim.groups.find(q => !q.cleared)
      let tx = u.x
      let tz = u.z - 4.5
      if (g) {
        const d = Math.hypot(g.x - u.x, g.z - u.z) || 1
        tx = u.x + ((g.x - u.x) / d) * Math.min(4.5, d)
        tz = u.z + ((g.z - u.z) / d) * Math.min(4.5, d)
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
    this.sig = ''
    this.part = {}
  }
}

export const coach = new Coach()
