import { CRIES, cryKey } from '../data/assault'
import { CHEER_EVERY, CHEER_S, PARTY_DWARFS, PARTY_GOBLINS, PARTY_S, SHOUT_EVERY, SHOUT_FIRST, partyGnomes } from '../data/celebrate'
import { face } from './actors'
import { PARTY_LAYOUT } from './celebrateMap'
import { mulberry32 } from './rng'
import { plainStats } from './stats'
import { newAction, type Sim } from './world'

/**
 * ─── The celebration, as the sim plays it (roadmap #206) ─────────────────────
 *
 * A film: the crowd round the camp fire. Goblins hold their "no king" crests up and cheer in turn, dwarfs
 * raise their mugs, the gnomes dance round the fire. Now and then one of them shouts what they shouted in
 * the siege. The hero stands among them. A pure function of the clock (and the seed's offsets): a test steps
 * it and reads it.
 */

export type PartyKind = 'goblin' | 'dwarf' | 'gnome'
/** What a celebrant does with its hands: a crest overhead, a mug, or nothing (it dances). */
export type PartyRole = 'crest' | 'mug' | 'dance'

export interface Celebrant {
  unit: number
  kind: PartyKind
  role: PartyRole
  /** Its place round the fire: radius, heading (rad), and its own offset in the rhythm (s). */
  r: number
  a: number
  off: number
  /** 0..1: how high the crest or the mug is held right now (the view reads it). */
  up: number
}

export interface CelebrationState {
  t: number
  phase: 'play' | 'done'
  outcome: '' | 'watched' | 'skipped'
  celebrants: Celebrant[]
  /** Shouts so far, and the clock of the next. */
  shouts: number
  next: number
}

/** What a celebrant's unit is called in the rig tables. */
export const PARTY_UNIT: Readonly<Record<PartyKind, string>> = { goblin: 'celebGoblin', dwarf: 'dwarf', gnome: 'rebelGnome' }
const SIZE: Readonly<Record<PartyKind, { r: number; h: number }>> = { goblin: { r: 0.36, h: 1.1 }, dwarf: { r: 0.45, h: 1.35 }, gnome: { r: 0.28, h: 0.85 } }
const SALT = 0x2f9be6a1

/** How fast the dancers circle the fire (rad/s). */
export const DANCE_SPEED = 0.55

export const armCelebration = (sim: Sim, o: { freed?: number } = {}): void => {
  const rng = mulberry32((sim.seed ^ SALT) >>> 0)
  const F = PARTY_LAYOUT.fire
  const left: Record<PartyKind, number> = { goblin: PARTY_GOBLINS, dwarf: PARTY_DWARFS, gnome: partyGnomes(o.freed ?? 0) }
  // Dwarf, goblin, gnome, dwarf... round the fire until each kind has its number.
  const seq: PartyKind[] = []
  const order: PartyKind[] = ['dwarf', 'goblin', 'gnome']
  for (let q = 0; left.dwarf + left.goblin + left.gnome > 0; q++) {
    const k = order[q % 3]!
    if (left[k] > 0) { left[k]--; seq.push(k) }
  }
  const celebrants: Celebrant[] = []
  seq.forEach((kind, q) => {
    const ring = q % 2
    // Two rings of onlookers; the gnomes dance on the inner one.
    const r = kind === 'gnome' ? 2.3 : ring ? 5.5 : 4.0
    const a = (q / seq.length) * Math.PI * 2 + (ring ? 0.2 : 0) + rng() * 0.12
    const role: PartyRole = kind === 'gnome' ? 'dance' : kind === 'goblin' ? 'crest' : 'mug'
    const s = SIZE[kind]
    const x = F.x + Math.sin(a) * r
    const z = F.z + Math.cos(a) * r * 0.85
    const u = sim.addUnit({
      kind: PARTY_UNIT[kind], team: 0, rank: 'npc', level: 1, x, z, r: s.r, h: s.h, s: plainStats({ hp: 1000, dmg: 0, speed: 3 }), facing: 0
    })
    u.x = u.px = x
    u.z = u.pz = z
    face(u, F.x, F.z)
    celebrants.push({ unit: u.id, kind, role, r, a, off: rng() * CHEER_EVERY, up: 0 })
  })
  sim.celebrate = { t: 0, phase: 'play', outcome: '', celebrants, shouts: 0, next: SHOUT_FIRST }
}

/** The cheer's envelope at clock `t` for a celebrant: 0 at rest, up and down once each period. */
export const cheerUp = (t: number, off: number): number => {
  const p = (t + off) % CHEER_EVERY
  if (p > CHEER_S) return 0
  return Math.sin((p / CHEER_S) * Math.PI)
}

export const skipCelebration = (sim: Sim): void => {
  const c = sim.celebrate
  if (!c || c.phase === 'done') return
  c.phase = 'done'
  c.outcome = 'skipped'
}

export const stepCelebration = (sim: Sim, dt: number): void => {
  const c = sim.celebrate
  if (!c || c.phase === 'done') return
  c.t += dt
  const F = PARTY_LAYOUT.fire
  for (const p of c.celebrants) {
    const u = sim.get(p.unit)
    if (!u) continue
    const cheer = cheerUp(c.t, p.off)
    if (p.role === 'dance') {
      // Round the fire, alternate ones the other way, hopping.
      const dir = p.unit % 2 ? 1 : -1
      p.a += dir * DANCE_SPEED * dt
      const x = F.x + Math.sin(p.a) * p.r
      const z = F.z + Math.cos(p.a) * p.r * 0.85
      u.facing = Math.atan2(x - u.x, z - u.z)
      u.x = u.px = x
      u.z = u.pz = z
      u.anim = 'walk'
      p.up = 0
      u.stunt = { lift: 0.12 + Math.abs(Math.sin(c.t * 5 + p.off * 3)) * 0.22, flip: 0 }
      continue
    }
    p.up = p.role === 'crest' ? cheer : 0.5 + 0.5 * Math.sin((c.t + p.off) * 1.9)
    // A cheer: the arms up in a shout, a little hop.
    if (cheer > 0.02 && !u.action) u.action = newAction(u, 'tauntingCry', CHEER_S * 0.4, CHEER_S, 0, F.x, F.z)
    u.stunt = { lift: cheer * 0.2, flip: 0 }
    u.anim = 'idle'
  }
  // The hero cheers with them now and then.
  const h = sim.hero?.unit
  if (h && !h.action && cheerUp(c.t, 1.1) > 0.02) h.action = newAction(h, 'tauntingCry', CHEER_S * 0.4, CHEER_S, 0, F.x, F.z)
  // Somebody shouts: the siege's cries, goblin and gnome by turns.
  if (c.t >= c.next) {
    c.next = c.t + SHOUT_EVERY
    const who = c.shouts % 2 === 0 ? 'goblin' : 'gnome'
    const pool = c.celebrants.filter(p => p.kind === who)
    const p = pool[Math.floor(c.shouts / 2) % Math.max(1, pool.length)]
    if (p) sim.emit({ t: 'bark', unit: p.unit, key: cryKey(who, CRIES[c.shouts % CRIES.length]!) })
    c.shouts++
  }
  if (c.t >= PARTY_S) { c.phase = 'done'; c.outcome = 'watched' }
}
