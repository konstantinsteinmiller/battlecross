import type { TownJob } from '../data/zones'
import { CELL, cellOf, isSolidCell, moveCircle } from './grid'
import { setGoal, stop, turnToward, walk } from './actors'
import { hashSeed, mulberry32, type Rng } from './rng'
import { plainStats } from './stats'
import { TC_DOOR, TC_FLOOR, TC_GRASS, TC_GROUND, TC_SQUARE, TC_STREET, type SpotKind, type TownPerson, type TownPlan } from './town'
import type { Unit } from './types'
import type { Sim } from './world'

/**
 * ─── Town life (roadmap #42) ─────────────────────────────────────────────────
 *
 * Townspeople are not statues. Each has a home spot and a day made of small
 * activities picked from their job's list on a seeded schedule: work at their
 * station (the smith hammers, the scholar reads, the knight drills at the
 * dummy), stroll a little way, sit on a bench with a mug, lean on a wall and
 * smoke a pipe, meet someone for a chat, spar in the yard, warm their hands at
 * a fire. Children play tag.
 *
 * Only ever in a town, and nothing here touches a fight: no damage, no
 * statuses, the fight's dice untouched (every person has a stream of their
 * own). The step is cheap: a few comparisons per person, a path only when
 * one sets off somewhere.
 *
 * What a person is doing reaches the view as a POSE name (`townPose`), which
 * `gfx/rigs/clips.ts` turns into a looping clip and `gfx/townView.ts` dresses
 * with a hand prop, a puff of pipe smoke or an emote bubble.
 *
 * The hero comes first: a person he walks up to stops and turns to him; one
 * he talks to (`townAddress`) holds still, facing him, until he is done, and
 * then picks up where they left off. Walking people step out of his way; and
 * nobody ever stands about in a doorway.
 */

/** What a person is doing (the view poses each). */
export type TownPose =
  | 'stand' | 'look' | 'sit' | 'sitDrink' | 'sitEat' | 'sitSmoke' | 'lean' | 'leanSmoke' | 'hammer' | 'stir' | 'sweep' | 'read'
  | 'count' | 'sharpen' | 'forms' | 'cast' | 'talk' | 'listen' | 'wave' | 'spar' | 'warm' | 'huddle' | 'drink' | 'eat' | 'smoke'
  | 'tinker' | 'pray' | 'hoe' | 'hang' | 'play' | 'inspect' | 'sing' | 'polish' | 'doze'

/** What is in a person's hand (a small mesh on the hand's bone). */
export type HandProp = '' | 'mug' | 'bread' | 'pipe' | 'book' | 'broom' | 'hoe' | 'ladle' | 'stone' | 'cloth' | 'wrench'

/** A wordless bubble over a head. */
export type Emote = '' | 'dots' | 'note' | 'bang' | 'ask' | 'heart' | 'sweat' | 'zzz' | 'star'

type Act =
  | 'idle' | 'station' | 'spot' | 'wander' | 'chat' | 'spar' | 'patrol' | 'play' | 'treat'

interface ActDef {
  act: Act
  w: number
  /** For a spot activity: which kind of spot. */
  spot?: SpotKind
  pose: TownPose
  prop?: HandProp
  /** Seconds it lasts. */
  dur: [number, number]
}

const A = (act: Act, w: number, pose: TownPose, dur: [number, number], spot?: SpotKind, prop?: HandProp): ActDef => ({ act, w, pose, dur, spot, prop })

/** The day of each kind of townsperson. `station` is their own work place. */
const DAYS: Readonly<Record<TownJob, ActDef[]>> = {
  smith: [A('station', 6, 'hammer', [9, 15]), A('treat', 1, 'drink', [4, 6], undefined, 'mug'), A('treat', 1, 'smoke', [6, 9], undefined, 'pipe'), A('wander', 1, 'stand', [2, 4]), A('chat', 1, 'talk', [6, 9])],
  merchant: [A('station', 6, 'count', [8, 14]), A('chat', 2, 'talk', [6, 9]), A('treat', 1, 'drink', [4, 6], undefined, 'mug'), A('wander', 1, 'look', [2, 4])],
  elder: [A('station', 5, 'sitSmoke', [12, 18], undefined, 'pipe'), A('chat', 2, 'talk', [7, 10]), A('wander', 1, 'stand', [3, 5]), A('treat', 1, 'smoke', [6, 9], undefined, 'pipe')],
  healer: [A('station', 5, 'stir', [8, 13], undefined, 'ladle'), A('station', 2, 'pray', [6, 9]), A('spot', 1, 'sit', [6, 10], 'seat'), A('wander', 2, 'stand', [2, 4])],
  scholar: [A('station', 5, 'read', [9, 14], undefined, 'book'), A('station', 2, 'cast', [5, 8]), A('spot', 1, 'sit', [6, 10], 'seat', 'book'), A('wander', 2, 'look', [2, 4])],
  knight: [A('spot', 5, 'forms', [9, 14], 'dummy'), A('spar', 3, 'spar', [9, 14]), A('station', 1, 'inspect', [4, 7]), A('wander', 1, 'stand', [2, 4])],
  rogue: [A('station', 4, 'sharpen', [8, 12]), A('station', 2, 'forms', [5, 8]), A('spot', 1, 'sit', [5, 9], 'seat'), A('wander', 2, 'look', [2, 4])],
  noble: [A('station', 4, 'inspect', [7, 11]), A('station', 2, 'read', [7, 11], undefined, 'book'), A('spot', 2, 'sitDrink', [7, 11], 'seat', 'mug'), A('wander', 2, 'stand', [2, 4])],
  alchemist: [A('station', 6, 'stir', [8, 13], undefined, 'ladle'), A('spot', 1, 'sit', [5, 8], 'seat'), A('wander', 2, 'look', [2, 4])],
  tinker: [A('station', 6, 'tinker', [9, 14], undefined, 'wrench'), A('spot', 1, 'sit', [5, 8], 'seat'), A('wander', 2, 'look', [2, 4]), A('treat', 1, 'drink', [4, 6], undefined, 'mug')],
  geo: [A('spot', 5, 'cast', [8, 13], 'dummy'), A('station', 1, 'inspect', [5, 8]), A('wander', 2, 'stand', [3, 5])],
  captain: [A('spar', 4, 'spar', [9, 14]), A('spot', 2, 'forms', [7, 11], 'dummy'), A('station', 2, 'inspect', [5, 8]), A('chat', 1, 'talk', [6, 9]), A('wander', 1, 'stand', [2, 4])],
  fence: [A('station', 6, 'count', [8, 14]), A('treat', 1, 'smoke', [6, 9], undefined, 'pipe'), A('wander', 1, 'look', [2, 4])],
  boss: [A('station', 5, 'warm', [9, 14]), A('treat', 1, 'smoke', [6, 9], undefined, 'pipe'), A('wander', 1, 'inspect', [3, 5])],
  squire: [A('spar', 5, 'spar', [9, 14]), A('spot', 4, 'forms', [8, 12], 'dummy'), A('spot', 1, 'lean', [5, 8], 'lean'), A('wander', 1, 'stand', [2, 4])],
  guard: [A('patrol', 4, 'stand', [2, 3]), A('spar', 3, 'spar', [9, 14]), A('spot', 2, 'lean', [6, 10], 'lean'), A('chat', 1, 'talk', [6, 9])],
  villager: [A('wander', 3, 'look', [2, 5]), A('chat', 3, 'talk', [7, 10]), A('spot', 2, 'sitDrink', [7, 11], 'seat', 'mug'), A('spot', 2, 'look', [4, 7], 'look'), A('spot', 2, 'hang', [7, 11], 'work'), A('treat', 1, 'sweep', [7, 10], undefined, 'broom')],
  farmer: [A('spot', 5, 'hoe', [9, 14], 'work', 'hoe'), A('wander', 1, 'stand', [2, 4]), A('treat', 1, 'drink', [4, 6], undefined, 'mug'), A('spot', 1, 'sitEat', [6, 9], 'seat', 'bread'), A('chat', 1, 'talk', [6, 9])],
  child: [A('play', 7, 'play', [1.5, 3]), A('chat', 1, 'talk', [4, 6]), A('wander', 1, 'look', [1.5, 3])],
  // (Now and then one nods off over his mug.)
  drinker: [A('spot', 6, 'sitDrink', [10, 16], 'seat', 'mug'), A('chat', 2, 'talk', [6, 9]), A('spot', 1, 'sitEat', [7, 10], 'seat', 'bread'), A('spot', 1, 'doze', [14, 22], 'seat', 'mug'), A('wander', 1, 'stand', [2, 4])],
  survivor: [A('spot', 5, 'warm', [9, 14], 'fire'), A('spot', 3, 'huddle', [8, 12], 'seat'), A('wander', 1, 'look', [2, 3])],
  thug: [A('spot', 5, 'leanSmoke', [9, 15], 'lean', 'pipe'), A('spot', 2, 'lean', [6, 10], 'lean'), A('wander', 1, 'look', [2, 4])],
  miner: [A('spot', 3, 'sitDrink', [8, 12], 'seat', 'mug'), A('chat', 3, 'talk', [6, 9]), A('wander', 2, 'stand', [2, 4]), A('treat', 1, 'eat', [5, 7], undefined, 'bread')],
  // The taproom: the keeper keeps to the bar (wipes it, counts, pours himself one), the bard sings.
  keeper: [A('station', 4, 'polish', [8, 13], undefined, 'mug'), A('station', 3, 'count', [8, 13]), A('station', 1, 'drink', [4, 6], undefined, 'mug'), A('chat', 1, 'talk', [5, 8])],
  bard: [A('station', 7, 'sing', [12, 18]), A('treat', 1, 'drink', [4, 6], undefined, 'mug'), A('wander', 1, 'stand', [2, 3])]
}

const enum Phase { Choose, Go, Settle, Do, Leave }

export interface TownLifePerson {
  def: TownPerson
  unit: Unit
  rng: Rng
  act: Act
  pose: TownPose
  prop: HandProp
  phase: Phase
  /** Seconds into the activity's doing, and how long it lasts. */
  t: number
  dur: number
  /** The spot held (-1: none), and where to settle onto it. */
  spot: number
  sx: number
  sz: number
  sf: number
  partner: TownLifePerson | null
  /** In a spar: this one swings first. */
  lead: boolean
  /** Held by the hero: walked up to (1) or spoken to (2). */
  held: 0 | 1 | 2
  /** Seconds without getting anywhere while walking. */
  stuck: number
  lastX: number
  lastZ: number
  patrol: number
  legs: number
  emote: Emote
  emoteT: number
  /** Seconds of the wave after the hero greeted one of the folk. */
  greet: number
  /** A chat with somebody who stays at what they are doing (a seat, a wall). */
  visit: boolean
  /** Seconds left of a line the hero overhears this one say (`game/overheard.ts`). */
  say: number
}

interface Life {
  plan: TownPlan
  people: TownLifePerson[]
  byUnit: Map<number, TownLifePerson>
  /** Who holds each spot (-1: free). */
  holder: Int32Array
  /** The person the hero is speaking to (unit id, 0: nobody). */
  addressed: number
  time: number
}

const lives = new WeakMap<Sim, Life>()

const out2: [number, number] = [0, 0]

/**
 * Put a town's people into the world. `lite` (a weak device) leaves the folk
 * out but for the few marked `lite`. `visit` varies the day from one visit
 * to the next; the same visit always plays the same.
 */
export const spawnTownPeople = (sim: Sim, plan: TownPlan, o: { lite?: boolean; visit?: number } = {}): void => {
  const people: TownLifePerson[] = []
  const salt = (sim.seed ^ Math.imul((o.visit ?? 0) + 1, 0x9e3779b1)) >>> 0
  for (const p of plan.people) {
    if (o.lite && !p.npc && !p.lite) continue
    const unit = sim.addUnit({
      kind: p.look, team: 0, rank: 'npc', level: 1, x: p.x, z: p.z, r: p.r, h: 1.45 * p.scale,
      s: plainStats({ hp: 1000, dmg: 0, speed: p.speed }), facing: p.facing, npc: p.npc || undefined
    })
    // A person stands where the plan puts them (a work place may be close to a wall).
    unit.x = unit.px = p.x
    unit.z = unit.pz = p.z
    people.push({
      def: p, unit, rng: mulberry32((salt ^ hashSeed(p.id)) >>> 0), act: 'idle', pose: 'stand', prop: '', phase: Phase.Choose,
      t: 0, dur: 0, spot: -1, sx: p.x, sz: p.z, sf: p.facing, partner: null, lead: false, held: 0, stuck: 0, lastX: p.x, lastZ: p.z,
      patrol: 0, legs: 0, emote: '', emoteT: 0, greet: 0, visit: false, say: 0
    })
  }
  const life: Life = { plan, people, byUnit: new Map(people.map(p => [p.unit.id, p])), holder: new Int32Array(plan.spots.length).fill(-1), addressed: 0, time: 0 }
  // The day starts at work: whoever has a station is at it, a moment in.
  for (let i = 0; i < people.length; i++) {
    const p = people[i]!
    if (p.def.station >= 0 && p.def.place !== 'street') begin(life, p, i, DAYS[p.def.job].find(d => d.act === 'station' || d.spot === 'dummy') ?? DAYS[p.def.job][0]!, true)
    // A taproom's patrons are on their stools when the hero walks in.
    else if (p.def.place === 'inside' && p.def.room >= 0 && DAYS[p.def.job].some(d => d.act === 'spot') && begin(life, p, i, DAYS[p.def.job].find(d => d.act === 'spot')!, true)) continue
    else { p.phase = Phase.Choose; p.t = 0; p.dur = p.rng() * 2 }
  }
  lives.set(sim, life)
}

/** What the view needs to pose a townsperson. */
export interface TownPoseView {
  pose: TownPose
  prop: HandProp
  /** Seconds into the pose (a loop's clock: sparring partners swing in turn). */
  t: number
  lead: boolean
  emote: Emote
  /** Seconds the emote has been up. */
  emoteT: number
  /** On the spot it is using (sitting down, leaning back). */
  settled: boolean
  scale: number
}

const view: TownPoseView = { pose: 'stand', prop: '', t: 0, lead: false, emote: '', emoteT: 0, settled: false, scale: 1 }

/** How a townsperson stands this frame (undefined: not one). Reused object. */
export const townPose = (sim: Sim, unitId: number): TownPoseView | undefined => {
  const p = lives.get(sim)?.byUnit.get(unitId)
  if (!p) return undefined
  const settled = p.phase === Phase.Do || p.phase === Phase.Settle
  view.pose = p.greet > 0 ? 'wave' : p.held === 2 ? (p.pose.startsWith('sit') ? p.pose : 'listen') : p.held === 1 ? (p.pose.startsWith('sit') && settled ? p.pose : 'stand') : settled ? p.pose : 'stand'
  view.prop = p.greet > 0 || p.held ? (p.pose.startsWith('sit') && settled ? p.prop : '') : settled ? p.prop : ''
  view.t = p.t
  view.lead = p.lead
  view.emote = p.emote
  view.emoteT = p.emoteT
  view.settled = settled && !p.greet
  view.scale = p.def.scale
  return view
}

/** The people of a town visit (tests, the view). */
export const townLife = (sim: Sim): { people: readonly TownLifePerson[]; plan: TownPlan } | undefined => lives.get(sim)

/** The hero speaks to a townsperson (0: the conversation is over). */
export const townAddress = (sim: Sim, unitId: number): void => {
  const life = lives.get(sim)
  if (!life) return
  life.addressed = unitId
}

/** The hero walked up to one of the folk (no conversation): a wave, a bubble. */
export const townGreet = (sim: Sim, unitId: number): void => {
  const p = lives.get(sim)?.byUnit.get(unitId)
  if (!p) return
  p.greet = 2.4
  p.emote = p.rng() < 0.5 ? 'note' : 'bang'
  p.emoteT = 0
}

/** Two of the folk in a chat the hero can overhear: `a` started it. */
export interface TownChat {
  a: number
  b: number
  /** Where between them a line is heard best (their middle). */
  x: number
  z: number
  /** Two children (they have their own small talk). */
  kids: boolean
}

/** The chats going on now (both at it, not held by the hero). */
export const townChats = (sim: Sim): TownChat[] => {
  const life = lives.get(sim)
  const out: TownChat[] = []
  if (!life) return out
  for (const p of life.people) {
    const q = p.partner
    if (p.act !== 'chat' || !q || p.phase !== Phase.Do || q.phase !== Phase.Do || p.held || q.held) continue
    // A two-way chat is listed once (by the lower unit id).
    if (!p.visit && (q.partner !== p || q.unit.id < p.unit.id)) continue
    out.push({ a: p.unit.id, b: q.unit.id, x: (p.unit.x + q.unit.x) / 2, z: (p.unit.z + q.unit.z) / 2, kids: p.def.job === 'child' && q.def.job === 'child' })
  }
  return out
}

/**
 * Overheard small talk: `unitId` says a line for `seconds`. The speaker
 * talks and the other listens for that long, and their chat lasts at least
 * until the line is over. False when the unit is not in a chat.
 */
export const townSay = (sim: Sim, unitId: number, seconds: number): boolean => {
  const p = lives.get(sim)?.byUnit.get(unitId)
  if (!p) return false
  const chat = p.act === 'chat' ? p : p.partner?.act === 'chat' && p.partner.partner === p ? p.partner : null
  // A seated partner of a visiting chat is found from the visitor.
  const visitor = chat ?? lives.get(sim)!.people.find(q => q.act === 'chat' && q.visit && q.partner === p) ?? null
  if (!visitor || visitor.phase !== Phase.Do) return false
  p.say = seconds
  for (const q of [visitor, visitor.partner]) if (q && q.phase === Phase.Do) q.dur = Math.max(q.dur, q.t + seconds + 0.8)
  return true
}

// ─── The step ────────────────────────────────────────────────────────────────

const dist2 = (ax: number, az: number, bx: number, bz: number): number => (ax - bx) * (ax - bx) + (az - bz) * (az - bz)

export const stepTownLife = (sim: Sim, dt: number): void => {
  const life = lives.get(sim)
  if (!life || dt <= 0) return
  life.time += dt
  const hero = sim.hero?.unit
  const heroGoingTo = hero && sim.hero.order.kind === 'interact' ? sim.hero.order.targetId : 0
  const ps = life.people
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i]!
    const u = p.unit
    if (!u.alive) continue
    if (p.emote) { p.emoteT += dt; if (p.emoteT > 2.2) p.emote = '' }
    if (p.greet > 0) {
      p.greet -= dt
      stop(u)
      u.anim = 'idle'
      if (hero) u.facing = turnToward(u.facing, Math.atan2(hero.x - u.x, hero.z - u.z), dt * 8)
      continue
    }
    // The hero first: walked up to, they wait; spoken to, they listen.
    const held: 0 | 1 | 2 = life.addressed === u.id ? 2 : heroGoingTo === u.id && hero && dist2(u.x, u.z, hero.x, hero.z) < 36 ? 1 : 0
    if (held && !p.held && p.phase === Phase.Go) stop(u)
    p.held = held
    if (held) {
      u.hasGoal = false
      u.anim = 'idle'
      // A seated person stays in their seat; anybody else turns to him.
      const seated = p.phase === Phase.Do && p.pose.startsWith('sit')
      if (hero && !seated) u.facing = turnToward(u.facing, Math.atan2(hero.x - u.x, hero.z - u.z), dt * 9)
      continue
    }
    switch (p.phase) {
      case Phase.Choose:
        p.t += dt
        u.anim = 'idle'
        if (p.t >= p.dur) choose(sim, life, p, i)
        break
      case Phase.Go:
        goStep(sim, life, p, i, dt)
        break
      case Phase.Settle: {
        // The last half metre onto a seat or against a wall: no walls in the way of it.
        const d = Math.hypot(p.sx - u.x, p.sz - u.z)
        const step = dt * 1.4
        if (d <= step) { u.x = p.sx; u.z = p.sz; p.phase = Phase.Do; p.t = 0 } else { u.x += ((p.sx - u.x) / d) * step; u.z += ((p.sz - u.z) / d) * step }
        u.facing = turnToward(u.facing, p.sf, dt * 8)
        u.anim = 'idle'
        break
      }
      case Phase.Do:
        doStep(life, p, dt)
        break
      case Phase.Leave: {
        const d = Math.hypot(p.sx - u.x, p.sz - u.z)
        const step = dt * 1.4
        if (d <= step) { u.x = p.sx; u.z = p.sz; release(life, p); idle(p, 0.6 + p.rng() * 2) } else { u.x += ((p.sx - u.x) / d) * step; u.z += ((p.sz - u.z) / d) * step }
        u.anim = 'idle'
        break
      }
    }
  }
  // Out of the hero's way: whoever is walking steps aside rather than stand in
  // his path (the separation pass would push HIM off a townsperson).
  if (hero && hero.alive) {
    for (const p of ps) {
      const u = p.unit
      if (p.phase === Phase.Do || p.phase === Phase.Settle || p.held) continue
      const rr = (u.r + hero.r) * 0.96
      const dx = u.x - hero.x
      const dz = u.z - hero.z
      const d2 = dx * dx + dz * dz
      if (d2 >= rr * rr || d2 < 1e-6) continue
      const d = Math.sqrt(d2)
      moveCircle(sim.grid, u.x, u.z, (dx / d) * (rr - d + 0.02), (dz / d) * (rr - d + 0.02), u.r, out2)
      u.x = out2[0]
      u.z = out2[1]
    }
  }
  // Two walkers do not walk through each other.
  for (let a = 0; a < ps.length; a++) {
    const pa = ps[a]!
    const moving = pa.phase === Phase.Go
    if (!moving) continue
    for (let b = 0; b < ps.length; b++) {
      if (a === b) continue
      const ua = pa.unit
      const ub = ps[b]!.unit
      const rr = (ua.r + ub.r) * 0.85
      const dx = ua.x - ub.x
      const dz = ua.z - ub.z
      const d2 = dx * dx + dz * dz
      if (d2 >= rr * rr || d2 < 1e-6) continue
      const d = Math.sqrt(d2)
      moveCircle(sim.grid, ua.x, ua.z, (dx / d) * (rr - d) * 0.5, (dz / d) * (rr - d) * 0.5, ua.r, out2)
      ua.x = out2[0]
      ua.z = out2[1]
    }
  }
}

const idle = (p: TownLifePerson, sec: number): void => {
  p.phase = Phase.Choose
  p.act = 'idle'
  p.pose = 'stand'
  p.prop = ''
  p.t = 0
  p.dur = sec
  p.partner = null
  p.visit = false
}

const release = (life: Life, p: TownLifePerson): void => {
  if (p.spot >= 0 && life.holder[p.spot] === life.people.indexOf(p)) life.holder[p.spot] = -1
  p.spot = -1
}

/** Pick the next thing to do. */
const choose = (sim: Sim, life: Life, p: TownLifePerson, idx: number): void => {
  const day = DAYS[p.def.job]
  let total = 0
  for (const d of day) total += d.w
  for (let tries = 0; tries < 4; tries++) {
    let r = p.rng() * total
    let pick = day[0]!
    for (const d of day) { r -= d.w; if (r <= 0) { pick = d; break } }
    if (begin(life, p, idx, pick, false, sim)) return
  }
  idle(p, 1 + p.rng() * 2)
}

/** Start an activity; false when it cannot be had right now (no free spot, nobody to talk to). */
const begin = (life: Life, p: TownLifePerson, idx: number, d: ActDef, now: boolean, sim?: Sim): boolean => {
  const plan = life.plan
  const u = p.unit
  // Whatever was held before is let go first.
  if (!now) release(life, p)
  p.pose = d.pose
  p.prop = d.prop ?? ''
  p.dur = d.dur[0] + p.rng() * (d.dur[1] - d.dur[0])
  p.t = 0
  p.act = d.act
  p.partner = null
  p.visit = false
  p.lead = false
  switch (d.act) {
    case 'station': {
      const s = p.def.station
      if (s < 0) return false
      const spot = plan.spots[s]!
      // A merchant's station is theirs; an elder's bench may have been taken.
      if (life.holder[s]! >= 0 && life.holder[s] !== idx) return false
      life.holder[s] = idx
      p.spot = s
      if (now) { u.x = u.px = spot.x; u.z = u.pz = spot.z; u.facing = spot.facing; p.sx = spot.x; p.sz = spot.z; p.sf = spot.facing; p.phase = Phase.Do; p.t = p.rng() * 3; return true }
      return goTo(sim!, p, spot.ax, spot.az, spot.x, spot.z, spot.facing)
    }
    case 'spot': {
      const s = findSpot(life, p, idx, d.spot!)
      if (s < 0) return false
      life.holder[s] = idx
      p.spot = s
      const spot = plan.spots[s]!
      if (now) { u.x = u.px = spot.x; u.z = u.pz = spot.z; u.facing = spot.facing; p.sx = spot.x; p.sz = spot.z; p.sf = spot.facing; p.phase = Phase.Do; return true }
      return goTo(sim!, p, spot.ax, spot.az, spot.x, spot.z, spot.facing)
    }
    case 'treat':
      // Where they stand: a drink, a bite, a pipe, a sweep of the step.
      p.phase = Phase.Do
      p.sx = u.x
      p.sz = u.z
      return true
    case 'wander': {
      const t = wanderTarget(life, p)
      if (!t) return false
      return goTo(sim!, p, t[0], t[1], t[0], t[1], Math.atan2(t[0] - u.x, t[1] - u.z) + (p.rng() - 0.5) * 2.4)
    }
    case 'play': {
      // Tag: run to somewhere near the other children, or near home.
      const t = wanderTarget(life, p, 3.5)
      if (!t) return false
      return goTo(sim!, p, t[0], t[1], t[0], t[1], p.rng() * 6.28)
    }
    case 'patrol': {
      const pts = plan.patrol
      if (!pts.length) return false
      p.legs = 3 + Math.floor(p.rng() * 3)
      if (!p.patrol) p.patrol = nearestPoint(pts, u.x, u.z)
      const [x, z] = pts[p.patrol % pts.length]!
      return goTo(sim!, p, x, z, x, z, u.facing)
    }
    case 'chat': {
      // Somebody idle nearby, in the same room, not a child unless this is one.
      let best: TownLifePerson | null = null
      let bd = 81
      for (const q of life.people) {
        if (q === p || q.held || q.greet > 0 || q.def.room !== p.def.room) continue
        if ((q.def.job === 'child') !== (p.def.job === 'child')) continue
        const free = q.phase === Phase.Choose || (q.phase === Phase.Do && (q.act === 'wander' || q.act === 'treat'))
        if (!free) continue
        const dd = dist2(q.unit.x, q.unit.z, u.x, u.z)
        if (dd < bd) { bd = dd; best = q }
      }
      // Nobody about: then somebody at a table, on a bench, leaning on a wall —
      // they stay where they are and are talked to there.
      let visit = false
      if (!best) {
        bd = 144
        for (const q of life.people) {
          if (q === p || q.held || q.greet > 0 || q.def.room !== p.def.room || q.phase !== Phase.Do || q.act !== 'spot') continue
          if ((q.def.job === 'child') !== (p.def.job === 'child')) continue
          if (!(q.pose.startsWith('sit') || q.pose.startsWith('lean') || q.pose === 'look' || q.pose === 'warm')) continue
          const dd = dist2(q.unit.x, q.unit.z, u.x, u.z)
          if (dd < bd) { bd = dd; best = q }
        }
        visit = true
      }
      if (!best) return false
      const q = best
      if (visit) {
        // Stand before them (the side the camera sees), a step off.
        const f = q.unit.facing
        const tx = q.unit.x + Math.sin(f) * 1.05
        const tz = q.unit.z + Math.cos(f) * 1.05
        if (isSolidCell(sim!.grid, cellOf(tx), cellOf(tz))) return false
        p.partner = q
        p.visit = true
        return goTo(sim!, p, tx, tz, tx, tz, Math.atan2(q.unit.x - tx, q.unit.z - tz))
      }
      const dx = u.x - q.unit.x
      const dz = u.z - q.unit.z
      const l = Math.hypot(dx, dz) || 1
      const tx = q.unit.x + (dx / l) * 1.15
      const tz = q.unit.z + (dz / l) * 1.15
      if (isSolidCell(sim!.grid, cellOf(tx), cellOf(tz))) return false
      // The other waits for them, facing them.
      release(life, q)
      q.act = 'chat'
      q.pose = 'listen'
      q.prop = ''
      q.phase = Phase.Do
      q.t = 0
      q.dur = 99
      q.partner = p
      q.sx = q.unit.x
      q.sz = q.unit.z
      stop(q.unit)
      p.partner = q
      return goTo(sim!, p, tx, tz, tx, tz, Math.atan2(q.unit.x - tx, q.unit.z - tz))
    }
    case 'spar': {
      // A free pair of marks in a yard, and a martial partner nearby.
      const spots = plan.spots
      let s = -1
      for (let k = 0; k < spots.length; k++) {
        const sp = spots[k]!
        if (sp.kind !== 'spar' || life.holder[k]! >= 0 || life.holder[sp.pair]! >= 0) continue
        if (dist2(sp.x, sp.z, u.x, u.z) > 196) continue
        s = k
        break
      }
      if (s < 0) return false
      let q: TownLifePerson | null = null
      for (const c of life.people) {
        if (c === p || c.held || c.phase === Phase.Go || c.act === 'spar' || c.act === 'chat') continue
        if (c.def.job !== 'guard' && c.def.job !== 'squire' && c.def.job !== 'knight' && c.def.job !== 'captain') continue
        if (dist2(c.unit.x, c.unit.z, u.x, u.z) > 196) continue
        q = c
        break
      }
      if (!q) return false
      const qi = life.people.indexOf(q)
      release(life, q)
      const a = spots[s]!
      const b = spots[a.pair]!
      life.holder[s] = idx
      life.holder[a.pair] = qi
      p.spot = s
      q.spot = a.pair
      p.partner = q
      q.partner = p
      p.lead = true
      q.lead = false
      q.act = 'spar'
      q.pose = 'spar'
      q.prop = ''
      q.dur = p.dur
      q.t = 0
      if (!goTo(sim!, q, b.ax, b.az, b.x, b.z, b.facing)) { release(life, q); release(life, p); idle(q, 1); return false }
      return goTo(sim!, p, a.ax, a.az, a.x, a.z, a.facing)
    }
    default:
      return false
  }
}

const nearestPoint = (pts: Array<[number, number]>, x: number, z: number): number => {
  let best = 0
  let bd = Infinity
  for (let k = 0; k < pts.length; k++) {
    const d = dist2(pts[k]![0], pts[k]![1], x, z)
    if (d < bd) { bd = d; best = k }
  }
  return best
}

/** A free spot of a kind near home, in the same room (or kept for them). */
const findSpot = (life: Life, p: TownLifePerson, idx: number, kind: SpotKind): number => {
  const spots = life.plan.spots
  const hx = p.def.x
  const hz = p.def.z
  const reach = p.def.room >= 0 ? 6 : 15
  let best = -1
  let bs = Infinity
  for (let k = 0; k < spots.length; k++) {
    const s = spots[k]!
    if (s.kind !== kind || s.room !== p.def.room) continue
    if (s.owner && s.owner !== p.def.id) continue
    if (life.holder[k]! >= 0 && life.holder[k] !== idx) continue
    const d = Math.sqrt(dist2(s.x, s.z, hx, hz))
    if (d > reach && s.owner !== p.def.id) continue
    // The nearer the likelier, with a little chance in it.
    const score = d + p.rng() * 6 - (s.owner === p.def.id ? 50 : 0)
    if (score < bs) { bs = score; best = k }
  }
  return best
}

const STAND_OK = new Set<number>([TC_GRASS, TC_STREET, TC_SQUARE, TC_FLOOR, TC_GROUND])

/** Somewhere to stroll to: open ground within reach of home, in their own room. */
const wanderTarget = (life: Life, p: TownLifePerson, near = 0): [number, number] | null => {
  const plan = life.plan
  const W = plan.w
  const ox = near ? p.unit.x : p.def.x
  const oz = near ? p.unit.z : p.def.z
  const R = near || p.def.roam
  for (let tries = 0; tries < 10; tries++) {
    const a = p.rng() * Math.PI * 2
    const d = R * (0.3 + 0.7 * p.rng())
    const x = ox + Math.cos(a) * d
    const z = oz + Math.sin(a) * d
    const i = cellOf(x)
    const j = cellOf(z)
    if (i < 0 || j < 0 || i >= W || j >= plan.cell.length / W) continue
    const k = j * W + i
    const c = plan.cell[k]!
    if (!STAND_OK.has(c) || c === TC_DOOR) continue
    if ((plan.room[k] ?? -1) !== p.def.room && !(p.def.room < 0 && plan.room[k] === -1)) continue
    if (p.def.room < 0 && plan.room[k] !== -1) continue
    // Not right in front of a door.
    if (doorstep(plan, W, i, j)) continue
    return [(i + 0.3 + p.rng() * 0.4) * CELL, (j + 0.3 + p.rng() * 0.4) * CELL]
  }
  return null
}

const doorstep = (plan: TownPlan, W: number, i: number, j: number): boolean => {
  if (j > 0 && plan.cell[(j - 1) * W + i] === TC_DOOR) return true
  for (const h of plan.houses) if (i === h.doorI && j === h.j0 + h.cd) return true
  return false
}

/** Set off for (ax, az), to settle at (x, z) facing `f`. */
const goTo = (sim: Sim, p: TownLifePerson, ax: number, az: number, x: number, z: number, f: number): boolean => {
  const u = p.unit
  setGoal(sim, u, ax, az)
  if (!u.hasGoal) return false
  p.phase = Phase.Go
  p.sx = x
  p.sz = z
  p.sf = f
  p.stuck = 0
  p.lastX = u.x
  p.lastZ = u.z
  return true
}

const goStep = (sim: Sim, life: Life, p: TownLifePerson, idx: number, dt: number): void => {
  const u = p.unit
  const going = walk(sim, u, dt, p.act === 'play' ? 1 : 1)
  u.anim = going ? 'walk' : 'idle'
  // Stuck behind somebody (the hero in a doorway): wait a little, then give up.
  const moved = Math.hypot(u.x - p.lastX, u.z - p.lastZ)
  p.lastX = u.x
  p.lastZ = u.z
  p.stuck = moved < dt * 0.2 ? p.stuck + dt : 0
  if (going && p.stuck < 2.5) {
    // A chat partner who has wandered off cancels the chat.
    if (p.act === 'chat' && (!p.partner || (p.visit ? p.partner.phase !== Phase.Do : p.partner.partner !== p))) { stop(u); idle(p, 0.5) }
    return
  }
  if (p.stuck >= 2.5) {
    stop(u)
    if (p.partner && p.partner.partner === p) idle(p.partner, 0.5)
    release(life, p)
    idle(p, 0.8 + p.rng())
    return
  }
  // Arrived.
  switch (p.act) {
    case 'wander':
    case 'play':
      p.phase = Phase.Do
      p.t = 0
      p.sx = u.x
      p.sz = u.z
      u.facing = turnToward(u.facing, p.sf, 0.6)
      if (p.act === 'play' && p.rng() < 0.3) { p.emote = 'note'; p.emoteT = 0 }
      break
    case 'patrol': {
      p.legs--
      const pts = life.plan.patrol
      if (p.legs <= 0) { idle(p, 0.5 + p.rng()); break }
      p.patrol = (p.patrol + 1) % pts.length
      const [x, z] = pts[p.patrol]!
      if (!goTo(sim, p, x, z, x, z, u.facing)) idle(p, 1)
      break
    }
    case 'chat': {
      const q = p.partner
      if (q && p.visit) {
        p.phase = Phase.Do
        p.t = 0
        p.sx = u.x
        p.sz = u.z
        p.pose = 'talk'
        p.emote = 'dots'
        p.emoteT = 0
        break
      }
      if (!q || q.partner !== p) { idle(p, 0.5); break }
      p.phase = Phase.Do
      p.t = 0
      p.sx = u.x
      p.sz = u.z
      q.t = 0
      q.dur = p.dur
      p.pose = 'talk'
      q.pose = 'listen'
      p.emote = 'dots'
      p.emoteT = 0
      break
    }
    default:
      // Onto the spot (a seat, a wall to lean on, the anvil).
      p.phase = Phase.Settle
  }
  void idx
}

/** While the hero overhears a chat, the one saying the line talks and the
 *  other listens (no emote: the line's bubble is over them). */
const heard = (p: TownLifePerson, q: TownLifePerson, dt: number): boolean => {
  if (p.say <= 0 && q.say <= 0) return false
  // Each chatter keeps its own clock; a seated partner's is kept by the visitor.
  p.say = Math.max(0, p.say - dt)
  if (p.visit) q.say = Math.max(0, q.say - dt)
  p.pose = p.say > 0 ? 'talk' : 'listen'
  p.emote = ''
  if (p.t >= p.dur) idle(p, 1 + p.rng() * 2)
  return true
}

const doStep = (life: Life, p: TownLifePerson, dt: number): void => {
  const u = p.unit
  u.anim = 'idle'
  const was0 = p.t
  p.t += dt
  if (p.pose === 'sing' && Math.floor(p.t / 1.7) !== Math.floor(was0 / 1.7)) { p.emote = 'note'; p.emoteT = 0 }
  if (p.pose === 'doze' && Math.floor(p.t / 3.2) !== Math.floor(was0 / 3.2)) { p.emote = 'zzz'; p.emoteT = 0 }
  if (p.act === 'chat' && p.partner && p.visit) {
    const q = p.partner
    // Talking to somebody who is busy at a seat or a wall: they answer now and then.
    if (q.phase !== Phase.Do || q.held) { idle(p, 0.6); return }
    u.facing = turnToward(u.facing, Math.atan2(q.unit.x - u.x, q.unit.z - u.z), dt * 8)
    if (heard(p, q, dt)) return
    const turn = Math.floor(p.t / 2.3)
    const was = p.pose
    p.pose = turn % 2 === 0 ? 'talk' : 'listen'
    if (p.pose !== was) {
      const r = p.rng()
      const who = p.pose === 'talk' ? p : q
      who.emote = r < 0.55 ? 'dots' : r < 0.7 ? 'bang' : r < 0.82 ? 'ask' : r < 0.92 ? 'note' : 'heart'
      who.emoteT = 0
    }
    if (p.t >= p.dur) idle(p, 1 + p.rng() * 2)
    return
  }
  if (p.act === 'chat' && p.partner) {
    const q = p.partner
    if (q.partner !== p) { idle(p, 0.6); return }
    // Face each other; take turns to talk.
    u.facing = turnToward(u.facing, Math.atan2(q.unit.x - u.x, q.unit.z - u.z), dt * 8)
    if (heard(p, q, dt)) return
    const turn = Math.floor(p.t / 2.3)
    const mine = (turn + (p.t > q.t ? 0 : 1)) % 2 === 0
    const was = p.pose
    p.pose = mine ? 'talk' : 'listen'
    if (p.pose === 'talk' && was !== 'talk') {
      const r = p.rng()
      p.emote = r < 0.55 ? 'dots' : r < 0.7 ? 'bang' : r < 0.82 ? 'ask' : r < 0.92 ? 'note' : 'heart'
      p.emoteT = 0
    }
    if (p.t >= p.dur) {
      const qq = q
      idle(p, 1 + p.rng() * 2)
      if (qq.partner === p) idle(qq, 0.6 + qq.rng() * 2)
    }
    return
  }
  if (p.act === 'spar') {
    const q = p.partner
    if (!q || q.partner !== p || q.phase !== Phase.Do) {
      // Waiting for the partner to take their mark.
      p.t = Math.min(p.t, 0.01)
      if (!q || q.partner !== p) { release(life, p); idle(p, 0.5) }
      return
    }
    if (p.t >= p.dur) {
      release(life, p)
      release(life, q)
      idle(p, 1 + p.rng())
      idle(q, 1 + q.rng())
      p.emote = 'star'
      p.emoteT = 0
    }
    return
  }
  if (p.t < p.dur) {
    // Now and then a small word bubble at a seat or a fire.
    if ((p.pose === 'sitDrink' || p.pose === 'warm') && p.t > 3 && Math.floor(p.t / 4) !== Math.floor((p.t - dt) / 4) && p.rng() < 0.25) {
      p.emote = p.pose === 'warm' ? (life.plan.ruined ? 'sweat' : 'dots') : 'note'
      p.emoteT = 0
    }
    return
  }
  if (p.spot >= 0) {
    // Off the seat, back to where it was walked to from (it is right beside it).
    const s = life.plan.spots[p.spot]!
    if (Math.hypot(s.ax - u.x, s.az - u.z) > 1.6) { release(life, p); idle(p, 0.5); return }
    p.phase = Phase.Leave
    p.sx = s.ax
    p.sz = s.az
    return
  }
  idle(p, 0.5 + p.rng() * 2)
}
