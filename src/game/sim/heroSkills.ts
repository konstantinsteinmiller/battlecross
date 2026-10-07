import { HEAT_MAX, OVERHEAT_LOCK, type SkillDef } from '../data/skills'
import { MINIONS } from '../data/enemies'
import { cellOf, isSolidAt, isSolidCell, nearestOpen } from './grid'
import { addField, face, fire, raiseWall } from './actors'
import {
  addShield, applyStatus, cleanse, dealDamage, heal, kill, knockback, removeStatus, wakeGroup
} from './combat'
import { isSpirit, spawnMinion, spawnSpirit } from './spawn'
import { scalePower } from './stats'
import { angleTo, findStatus, hasStatus, outOfReach, type HeroState, type Sim } from './world'
import type { Attr, DamageType, Unit } from './types'

/**
 * ─── The hero's skills (GDD §5) ──────────────────────────────────────────────
 *
 * One function per active skill, run at the moment its cast lands. The numbers
 * come from `data/skills.ts` (`def.p`), which is also what the tooltips print,
 * so the description and the effect cannot drift apart.
 */

export interface CastCtx {
  sim: Sim
  h: HeroState
  u: Unit
  def: SkillDef
  /** The enemy it was aimed at, if it has one and it is still alive. */
  target: Unit | null
  /** The aim point and direction. */
  x: number
  z: number
  a: number
}

const hits: Unit[] = []
const out2: [number, number] = [0, 0]

const pw = (c: CastCtx, attr: Attr): number => scalePower(c.u.s, attr)
const pct = (n: number | undefined): number => (n ?? 0) / 100

const placeNear = (sim: Sim, u: Unit, x: number, z: number): void => {
  if (!isSolidAt(sim.grid, x, z)) { u.x = x; u.z = z } else if (nearestOpen(sim.grid, x, z, out2, 4)) { u.x = out2[0]; u.z = out2[1] }
  u.px = u.x
  u.pz = u.z
}

/** Add heat; a full gauge overheats (GDD §5.7). */
export const addHeat = (sim: Sim, h: HeroState, amount: number): void => {
  if (amount <= 0 || hasStatus(h.unit, 'exosuit') || h.overheatT > 0) return
  h.heat = Math.min(HEAT_MAX, h.heat + amount * (1 - Math.min(0.9, h.unit.s.mods.heatBuildCut ?? 0)))
  if (h.heat >= HEAT_MAX) {
    h.overheatT = OVERHEAT_LOCK
    applyStatus(sim, h.unit, 'overheat', OVERHEAT_LOCK, 1, h.unit)
    sim.emit({ t: 'overheat', on: true })
  }
}

type SkillFn = (c: CastCtx) => void

// ── Bard (#95): a song walks with the bard ──────────────────────────────────
/**
 * Every half second the song touches the bard and every ally within `r` of
 * where he stands now; a beat of rings marks it every two seconds. Long
 * Refrain stretches it. Returns how long it plays.
 */
const sing = (c: CastCtx, dur: number, r: number, touch: (f: Unit) => void): number => {
  const len = dur * (1 + (c.u.s.mods.songLength ?? 0))
  c.u.icd['song:' + c.def.id] = len
  const beats = Math.round(len / 0.5)
  for (let i = 0; i < beats; i++) {
    c.sim.after(i * 0.5, () => {
      if (!c.u.alive) return
      for (const f of c.sim.inCircle(0, c.u.x, c.u.z, r, hits)) touch(f)
      if (i % 4 === 0) c.sim.emit({ t: 'fx', id: 'harvest', x: c.u.x, z: c.u.z, r, color: c.def.color })
    })
  }
  return len
}
const songsPlaying = (u: Unit): number => {
  let n = 0
  for (const k in u.icd) if (k.startsWith('song:') && u.icd[k]! > 0) n++
  return n
}

// ── Iron Monk (#95): chi, built by strikes and spent by finishers ──────────
export const CHI_MAX = 5
const CHI_DUR = 8
const gainChi = (c: CastCtx, n: number): void => {
  for (let i = 0; i < n; i++) applyStatus(c.sim, c.u, 'chi', CHI_DUR, 1, c.u, { maxStacks: CHI_MAX, quiet: true })
}
/** Take every bead of chi; returns how many there were. */
const spendChi = (c: CastCtx): number => {
  const n = findStatus(c.u, 'chi')?.n ?? 0
  removeStatus(c.u, 'chi')
  return n
}

/** Nothing to work on: the cooldown and the mana are given back. */
const refund = (c: CastCtx): void => {
  const i = c.h.skills.indexOf(c.def.id)
  if (i >= 0) c.h.cd[i] = Math.min(c.h.cd[i]!, 1)
  c.u.mana = Math.min(c.u.s.maxMana, c.u.mana + Math.round(c.def.mana * (1 - c.u.s.manaDiscount)))
}
const soulOf = (t: Unit): boolean => t.rank === 'normal' || t.rank === 'weak'

// ── Elementalist (#95): marks and reactions ─────────────────────────────────
type Element = 'fire' | 'frost' | 'storm' | 'earth'
const EL_TYPE: Record<Element, DamageType> = { fire: 'fire', frost: 'frost', storm: 'beam', earth: 'physical' }
const EL_COLOR: Record<Element, string> = { fire: '#ff8a2a', frost: '#9fdcff', storm: '#fff27a', earth: '#c79a5a' }
/** What each reaction is worth before Elemental Harmony (`reactionDamage`) raises it. */
const REACT = { melt: 0.4, steam: 0.25, steamR: 2.5, shatter: 0.3, stun: 1, overload: 0.6, blast: 2.5, crystal: 0.08 }
const near: Unit[] = []
const chilled = (t: Unit): boolean => hasStatus(t, 'slow') || hasStatus(t, 'frozen')

/** Leave an element's mark: fire burns for `v` of the Intelligence hit over `dur`, frost slows by `v`. */
const mark = (c: CastCtx, t: Unit, el: Element, dur: number, v: number): void => {
  if (el === 'fire') {
    const dps = ((pw(c, 'int') * v) / dur) * (1 + (c.u.s.mods.igniteBonus ?? 0))
    applyStatus(c.sim, t, 'burn', dur, dps, c.u, { type: 'fire', quiet: true })
  } else if (el === 'frost') applyStatus(c.sim, t, 'slow', dur, v, c.u)
}

/**
 * An element meets a mark. Consumes the mark, plays the reaction and returns
 * the multiplier for the hit that set it off (1: no reaction).
 */
const react = (c: CastCtx, t: Unit, el: Element): number => {
  const k = 1 + (c.u.s.mods.reactionDamage ?? 0)
  const burning = hasStatus(t, 'burn')
  const cold = chilled(t)
  if (el === 'fire' && cold) {
    // Melt: the ice goes in a hiss and the fire bites deeper.
    removeStatus(t, 'slow')
    removeStatus(t, 'frozen')
    c.sim.emit({ t: 'fx', id: 'burst:geyser', x: t.x, z: t.z, r: 1.4, color: '#ffffff' })
    return 1 + REACT.melt * k
  }
  if (el === 'frost' && burning) {
    // Steam: a cloud; whoever stands in it hits softer for a while.
    removeStatus(t, 'burn')
    c.sim.emit({ t: 'fx', id: 'smoke', x: t.x, z: t.z, r: REACT.steamR, color: '#e8f4ff' })
    for (const e of c.sim.inCircle(1, t.x, t.z, REACT.steamR, near)) applyStatus(c.sim, e, 'weaken', 3, REACT.steam * k, c.u)
    return 1
  }
  if (el === 'storm' && cold) {
    // Shatter: the frost cracks and the foe reels.
    removeStatus(t, 'slow')
    removeStatus(t, 'frozen')
    c.sim.emit({ t: 'fx', id: 'burst:icicle', x: t.x, z: t.z, r: 1.6, color: EL_COLOR.frost })
    applyStatus(c.sim, t, 'stun', REACT.stun, 1, c.u)
    return 1 + REACT.shatter * k
  }
  if (el === 'storm' && burning) {
    // Overload: the flame bursts and throws the crowd back.
    removeStatus(t, 'burn')
    c.sim.emit({ t: 'fx', id: 'burst:ember', x: t.x, z: t.z, r: REACT.blast, color: EL_COLOR.storm })
    for (const e of c.sim.inCircle(1, t.x, t.z, REACT.blast, near)) {
      if (e === t) continue
      dealDamage(c.sim, c.u.alive ? c.u : null, e, pw(c, 'int') * REACT.overload * k, { type: 'fire', spell: true, skill: c.def.id })
      if (e.alive) knockback(e, t.x, t.z, 5)
    }
    return 1
  }
  if (el === 'earth' && (burning || cold)) {
    // Crystal: the mark hardens into a shield round the Elementalist.
    removeStatus(t, 'burn')
    removeStatus(t, 'slow')
    removeStatus(t, 'frozen')
    addShield(c.u, c.u.s.maxHp * REACT.crystal * k, 5)
    c.sim.emit({ t: 'fx', id: 'shield', x: c.u.x, z: c.u.z, unit: c.u.id, color: '#e8d8ff' })
    return 1.2
  }
  return 1
}

/** Call a companion beside the hero. `max` > 0: a lasting one (life -1),
 *  the oldest sent home when the pack is full; else one for `life` seconds. */
const callBeast = (c: CastCtx, kind: string, max: number, life: number): Unit | null => {
  if (life < 0) {
    const pack = c.sim.units.filter(m => m.alive && m.kind === kind && m.ownerId === c.u.id && m.life < 0)
    if (pack.length >= max) pack[0]!.life = 0.01
  } else {
    for (const m of c.sim.units) if (m.alive && m.kind === kind && m.ownerId === c.u.id) m.life = 0.01
  }
  const ang = c.u.facing + (c.sim.rng() - 0.5)
  const m = spawnMinion(c.sim, kind, c.u.x + Math.sin(ang) * 1.6, c.u.z + Math.cos(ang) * 1.6, life)
  if (m) c.sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color: MINIONS[kind]!.color })
  return m
}

/** The hero's living companions. */
const pack = (c: CastCtx): Unit[] => c.sim.units.filter(m => m.alive && m.ownerId === c.u.id && m.rank === 'minion')

/** Move the hero up to `dist` m along `a`, stopping short of the first wall
 *  (shared by Windrunner and Frostwarden; add once). */
const dashTo = (c: CastCtx, a: number, dist: number): void => {
  const sx = c.u.x
  const sz = c.u.z
  let x = sx
  let z = sz
  for (let d = 0.5; d <= dist + 0.01; d += 0.5) {
    const nx = sx + Math.sin(a) * d
    const nz = sz + Math.cos(a) * d
    if (isSolidAt(c.sim.grid, nx, nz)) break
    x = nx
    z = nz
  }
  c.sim.emit({ t: 'fx', id: 'dash', x: sx, z: sz, x2: x, z2: z, color: c.def.color })
  placeNear(c.sim, c.u, x, z)
  c.u.hasGoal = false
  c.u.path.length = 0
}

/** Distance from (px, pz) to the segment a→b (Phoenix Flight's path). */
const segDist = (px: number, pz: number, ax: number, az: number, bx: number, bz: number): number => {
  const dx = bx - ax
  const dz = bz - az
  const l2 = dx * dx + dz * dz
  const k = l2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2)) : 0
  return Math.hypot(px - (ax + dx * k), pz - (az + dz * k))
}

export const HERO_SKILLS: Record<string, SkillFn> = {
  // ── Aegis Knight ──────────────────────────────────────────────────────────
  shieldSlam: (c) => {
    const t = c.target
    if (!t) return
    c.sim.emit({ t: 'fx', id: 'shieldSlam', x: t.x, z: t.z, a: c.a, color: c.def.color, unit: t.id })
    const dealt = dealDamage(c.sim, c.u, t, pw(c, 'str') * pct(c.def.p.dmg), { type: 'physical', heavy: true, skill: c.def.id })
    if (dealt > 0 && t.alive) {
      applyStatus(c.sim, t, 'stun', c.def.p.stun!, 1, c.u)
      knockback(t, c.u.x, c.u.z, 4)
    }
  },
  radiantStrike: (c) => {
    const t = c.target
    if (!t) return
    c.sim.emit({ t: 'fx', id: 'radiant', x: t.x, z: t.z, a: c.a, color: '#fff2a8', unit: t.id })
    const dealt = dealDamage(c.sim, c.u, t, pw(c, 'str') * pct(c.def.p.dmg), { type: 'holy', heavy: true, spell: true, skill: c.def.id })
    heal(c.sim, c.u, dealt * pct(c.def.p.heal))
  },
  tauntingCry: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      wakeGroup(c.sim, t)
      applyStatus(c.sim, t, 'taunt', p.dur!, 1, c.u)
      t.targetId = c.u.id
    }
    applyStatus(c.sim, c.u, 'defenseUp', p.dur!, pct(p.def), c.u)
  },
  holyBastion: (c) => {
    const p = c.def.p
    applyStatus(c.sim, c.u, 'invulnerable', p.dur!, 1, c.u)
    applyStatus(c.sim, c.u, 'reflect', p.dur!, pct(p.reflect), c.u, { quiet: true })
    c.sim.emit({ t: 'fx', id: 'bastion', x: c.u.x, z: c.u.z, dur: p.dur, color: '#fff2a8', unit: c.u.id })
  },
  shieldThrow: (c) => {
    const first = c.target
    if (!first) return
    const p = c.def.p
    const dmg = pw(c, 'str') * pct(p.dmg)
    const struck: number[] = []
    let fromX = c.u.x
    let fromZ = c.u.z
    let next: Unit | undefined = first
    // The route is chosen now (nearest unstruck enemy each time); the shield flies it a beat per hop.
    for (let i = 0; i < p.bounces! && next; i++) {
      const t: Unit = next
      const ax = fromX
      const az = fromZ
      struck.push(t.id)
      c.sim.after(i * 0.18, () => {
        if (!t.alive) return
        c.sim.emit({ t: 'fx', id: 'dash', x: ax, z: az, x2: t.x, z2: t.z, color: c.def.color })
        c.sim.emit({ t: 'fx', id: 'impact:rock', x: t.x, z: t.z, color: c.def.color })
        const dealt = dealDamage(c.sim, c.u, t, dmg, { type: 'physical', heavy: i === 0, skill: c.def.id })
        if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'weaken', p.dur!, pct(p.weak), c.u)
      })
      fromX = t.x
      fromZ = t.z
      next = c.sim.inCircle(1, t.x, t.z, p.jump!, hits)
        .filter(e => e.rank !== 'npc' && !struck.includes(e.id))
        .sort((a, b) => Math.hypot(a.x - t.x, a.z - t.z) - Math.hypot(b.x - t.x, b.z - t.z))[0]
    }
  },
  shieldShove: (c) => {
    const p = c.def.p
    const half = ((p.cone! / 2) * Math.PI) / 180
    c.sim.emit({ t: 'fx', id: 'cleave', x: c.u.x, z: c.u.z, r: c.def.range, a: c.a, dur: half, color: c.def.color })
    c.sim.emit({ t: 'fx', id: 'shieldSlam', x: c.u.x + Math.sin(c.a) * 1.2, z: c.u.z + Math.cos(c.a) * 1.2, a: c.a, color: c.def.color })
    for (const t of c.sim.inCone(1, c.u.x, c.u.z, c.a, c.def.range, half, hits)) {
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'str') * pct(p.dmg), { type: 'physical', heavy: true, skill: c.def.id })
      if (dealt <= 0 || !t.alive) continue
      // Whatever it was winding up (a swing, a spell) is knocked out of its hands. Bosses keep theirs.
      if (t.rank !== 'boss') t.action = null
      knockback(t, c.u.x, c.u.z, 8)
    }
  },
  holyChains: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      if (!t.awake) continue
      // A chain of light from each enemy to the knight.
      c.sim.emit({ t: 'fx', id: 'drain', x: t.x, z: t.z, x2: c.u.x, z2: c.u.z, color: '#fff2a8' })
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'end') * pct(p.dmg), { type: 'holy', spell: true, skill: c.def.id })
      if (dealt <= 0 || !t.alive) continue
      applyStatus(c.sim, t, 'slow', p.dur!, pct(p.slow), c.u)
      // A negative shove is a pull. A shove travels speed / 8 metres (actors.ts decays it at e^-8t),
      // so this stops the enemy about 1.6 m from the knight. Bosses and turrets do not budge.
      const d = Math.hypot(t.x - c.u.x, t.z - c.u.z)
      if (d > 1.6 + t.r) knockback(t, c.u.x, c.u.z, -(d - 1.6 - t.r) * 8)
    }
  },
  retribution: (c) => {
    const p = c.def.p
    // "Come and try": everyone near must attack the knight, who braces behind the shield.
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    c.sim.emit({ t: 'fx', id: 'bastion', x: c.u.x, z: c.u.z, dur: p.dur, color: '#fff2a8', unit: c.u.id })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      wakeGroup(c.sim, t)
      applyStatus(c.sim, t, 'taunt', p.dur!, 1, c.u)
      t.targetId = c.u.id
    }
    applyStatus(c.sim, c.u, 'defenseUp', p.dur!, pct(p.def), c.u)
    // What got through is counted by the hero's running total (`sim.hero.taken`, after shields).
    const taken0 = c.sim.hero.taken
    c.sim.after(p.dur!, () => {
      if (!c.u.alive) return
      const power = pw(c, 'str')
      const back = Math.min((c.sim.hero.taken - taken0) * pct(p.back), power * pct(p.cap))
      c.sim.emit({ t: 'fx', id: 'radiant', x: c.u.x, z: c.u.z, a: c.u.facing, color: '#fff2a8' })
      c.sim.emit({ t: 'fx', id: 'quake', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
      for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
        const dealt = dealDamage(c.sim, c.u, t, power * pct(p.dmg) + back, { type: 'holy', spell: true, heavy: true, skill: c.def.id })
        if (dealt > 0 && t.alive) knockback(t, c.u.x, c.u.z, 6)
      }
    })
  },

  // ── Shadowblade ───────────────────────────────────────────────────────────
  shadowstep: (c) => {
    const t = c.target
    if (!t) return
    c.sim.emit({ t: 'fx', id: 'blink', x: c.u.x, z: c.u.z, color: c.def.color })
    placeNear(c.sim, c.u, t.x - Math.sin(t.facing) * (t.r + c.u.r + 0.35), t.z - Math.cos(t.facing) * (t.r + c.u.r + 0.35))
    face(c.u, t.x, t.z)
    c.sim.emit({ t: 'fx', id: 'blink', x: c.u.x, z: c.u.z, color: c.def.color })
    c.sim.emit({ t: 'fx', id: 'cleave', x: c.u.x, z: c.u.z, r: 2.2, a: angleTo(c.u.x, c.u.z, t.x, t.z), dur: 0.9, color: c.def.color })
    dealDamage(c.sim, c.u, t, pw(c, 'dex') * pct(c.def.p.dmg), { type: 'physical', backstab: true, heavy: true, skill: c.def.id })
    c.h.order.kind = 'attack'
    c.h.order.targetId = t.id
  },
  venomousBlade: (c) => {
    applyStatus(c.sim, c.u, 'envenom', c.def.p.dur!, pct(c.def.p.poison), c.u)
    c.sim.emit({ t: 'fx', id: 'buff', x: c.u.x, z: c.u.z, color: '#7dff5a', unit: c.u.id })
  },
  smokeBomb: (c) => {
    const p = c.def.p
    applyStatus(c.sim, c.u, 'stealth', p.dur!, 1, c.u)
    applyStatus(c.sim, c.u, 'ambush', p.dur!, pct(p.bonus), c.u, { quiet: true })
    c.sim.emit({ t: 'fx', id: 'smoke', x: c.u.x, z: c.u.z, r: 3, color: '#8a8fa8' })
    // Out of sight, out of mind.
    for (const e of c.sim.units) if (e.team === 1 && e.targetId === c.u.id) e.targetId = 0
  },
  danceOfBlades: (c) => {
    const p = c.def.p
    const n = p.hits!
    applyStatus(c.sim, c.u, 'invulnerable', p.dur! + 0.1, 1, c.u, { quiet: true })
    const dmg = pw(c, 'dex') * pct(p.dmg)
    for (let i = 0; i < n; i++) {
      c.sim.after((i * p.dur!) / n, () => {
        if (!c.u.alive) return
        const near = c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits).filter(e => e.awake || e.rank !== 'npc')
        if (!near.length) return
        const t = near[Math.floor(c.sim.rng() * near.length)]!
        const ang = c.sim.rng() * Math.PI * 2
        const fromX = c.u.x
        const fromZ = c.u.z
        placeNear(c.sim, c.u, t.x + Math.cos(ang) * (t.r + c.u.r + 0.3), t.z + Math.sin(ang) * (t.r + c.u.r + 0.3))
        face(c.u, t.x, t.z)
        c.sim.emit({ t: 'fx', id: 'dash', x: fromX, z: fromZ, x2: c.u.x, z2: c.u.z, color: c.def.color })
        c.sim.emit({ t: 'fx', id: 'cleave', x: c.u.x, z: c.u.z, r: 2.4, a: angleTo(c.u.x, c.u.z, t.x, t.z), dur: 1.2, color: c.def.color })
        dealDamage(c.sim, c.u, t, dmg, { type: 'physical', heavy: true, skill: c.def.id })
      })
    }
  },
  starFan: (c) => {
    const p = c.def.p
    const n = p.stars!
    const spread = (p.spread! * Math.PI) / 180
    const dmg = pw(c, 'dex') * pct(p.dmg)
    const speed = 22
    for (let i = 0; i < n; i++) {
      // Evenly across the fan, centred on the aim.
      const a = c.a + (n > 1 ? (i / (n - 1) - 0.5) * spread : 0)
      fire(c.sim, {
        fx: 'shadow', src: c.u, tx: c.u.x + Math.sin(a) * c.def.range, tz: c.u.z + Math.cos(a) * c.def.range,
        speed, dmg, type: 'physical', r: 0.35, life: c.def.range / speed, skill: c.def.id, color: c.def.color
      })
    }
  },
  grapplingHook: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const gap = t.r + c.u.r + 0.3
    // The rope.
    c.sim.emit({ t: 'fx', id: 'drain', x: c.u.x, z: c.u.z, x2: t.x, z2: t.z, color: '#d8d0ff' })
    if (t.rank === 'boss' || t.rank === 'elite') {
      // Too heavy to pull: the hook pulls YOU to it.
      const a = angleTo(t.x, t.z, c.u.x, c.u.z)
      const fx0 = c.u.x
      const fz0 = c.u.z
      placeNear(c.sim, c.u, t.x + Math.sin(a) * gap, t.z + Math.cos(a) * gap)
      c.sim.emit({ t: 'fx', id: 'dash', x: fx0, z: fz0, x2: c.u.x, z2: c.u.z, color: c.def.color })
    } else {
      const a = angleTo(c.u.x, c.u.z, t.x, t.z)
      const fx0 = t.x
      const fz0 = t.z
      placeNear(c.sim, t, c.u.x + Math.sin(a) * gap, c.u.z + Math.cos(a) * gap)
      t.action = null
      c.sim.emit({ t: 'fx', id: 'dash', x: fx0, z: fz0, x2: t.x, z2: t.z, color: c.def.color })
    }
    face(c.u, t.x, t.z)
    const dealt = dealDamage(c.sim, c.u, t, pw(c, 'dex') * pct(p.dmg), { type: 'physical', heavy: true, skill: c.def.id })
    if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'slow', p.dur!, pct(p.slow), c.u)
    c.h.order.kind = 'attack'
    c.h.order.targetId = t.id
  },
  shadowMark: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    applyStatus(c.sim, t, 'vulnerable', p.dur!, pct(p.vuln), c.u)
    // The next blow (any skill or swing) is a sure critical, and harder (see `dealDamage`'s ambush).
    applyStatus(c.sim, c.u, 'ambush', p.dur!, pct(p.bonus), c.u, { quiet: true })
    c.sim.emit({ t: 'fx', id: 'mark', x: t.x, z: t.z, color: c.def.color, unit: t.id, dur: p.dur })
    c.h.order.kind = 'attack'
    c.h.order.targetId = t.id
  },
  nightshadeMist: (c) => {
    const p = c.def.p
    const ticks = p.dur! / 0.5
    // A vial shatters and the mist rolls out.
    c.sim.emit({ t: 'fx', id: 'smoke', x: c.x, z: c.z, r: p.radius, color: c.def.color })
    // The enemies' own poison-cloud field kind (`kind: 'poison'`, fx `venom`), in the class's purple.
    addField(c.sim, {
      fx: 'venom', kind: 'poison', src: c.u, x: c.x, z: c.z, r: p.radius!, dur: p.dur!, every: 0.5,
      dmg: (pw(c, 'dex') * pct(p.dmg)) / ticks, type: 'poison', skill: c.def.id, color: c.def.color
    })
    // Lost in the mist: everyone inside when it lands wanders about for a moment.
    for (const t of c.sim.inCircle(1, c.x, c.z, p.radius!, hits)) {
      if (t.awake) applyStatus(c.sim, t, 'confuse', p.confuse!, 1, c.u)
    }
  },

  // ── Pyromancer ────────────────────────────────────────────────────────────
  fireball: (c) => {
    const p = c.def.p
    const burnDps = (pw(c, 'int') * pct(p.burn) / p.burnDur!) * (1 + (c.u.s.mods.igniteBonus ?? 0))
    fire(c.sim, {
      fx: 'fireball', src: c.u, tx: c.target?.x ?? c.x, tz: c.target?.z ?? c.z, targetId: c.target?.id, homing: !!c.target,
      speed: 15, dmg: pw(c, 'int') * pct(p.dmg), type: 'fire', aoe: p.radius, r: 0.45, spell: true, heavy: true, skill: c.def.id,
      status: { id: 'burn', dur: p.burnDur!, v: burnDps, type: 'fire' }, color: '#ff8a2a'
    })
  },
  flamePillar: (c) => {
    const p = c.def.p
    const ticks = p.dur! / 0.5
    const burnDps = pw(c, 'int') * 0.12 * (1 + (c.u.s.mods.igniteBonus ?? 0))
    addField(c.sim, {
      fx: 'pillar', kind: 'burnGround', src: c.u, x: c.x, z: c.z, r: p.radius!, dur: p.dur!, every: 0.5,
      dmg: (pw(c, 'int') * pct(p.dmg)) / ticks, type: 'fire', v: burnDps, skill: c.def.id, color: '#ff7a1a'
    })
    for (const t of c.sim.inCircle(1, c.x, c.z, p.radius!, hits)) applyStatus(c.sim, t, 'knockup', p.airborne!, 1, c.u)
  },
  combustion: (c) => {
    const p = c.def.p
    const lit = c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits).filter(e => hasStatus(e, 'burn'))
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: '#ff7a1a' })
    for (const e of lit) {
      const b = findStatus(e, 'burn')
      if (!b) continue
      // Everything the burn still had to give, at once, to everything near.
      const left = b.v * b.n * b.t * pct(p.pct)
      removeStatus(e, 'burn')
      c.sim.emit({ t: 'fx', id: 'burst:fireball', x: e.x, z: e.z, r: p.blast, color: '#ffb02a' })
      const near: Unit[] = []
      for (const t of c.sim.inCircle(1, e.x, e.z, p.blast!, near)) {
        dealDamage(c.sim, c.u, t, left, { type: 'fire', spell: true, heavy: true, skill: c.def.id })
      }
    }
  },
  cataclysm: (c) => {
    const p = c.def.p
    const n = p.meteors!
    const each = (pw(c, 'int') * pct(p.dmg)) / n
    const burnDps = pw(c, 'int') * 0.1 * (1 + (c.u.s.mods.igniteBonus ?? 0))
    for (let i = 0; i < n; i++) {
      c.sim.after((i * p.dur!) / n, () => {
        if (!c.u.alive) return
        // On an enemy while there are any, else scattered round the hero.
        const foes = c.sim.units.filter(e => e.alive && e.team === 1 && e.awake && Math.hypot(e.x - c.u.x, e.z - c.u.z) < 16)
        let x: number
        let z: number
        if (foes.length) {
          const t = foes[Math.floor(c.sim.rng() * foes.length)]!
          x = t.x + (c.sim.rng() - 0.5) * 1.6
          z = t.z + (c.sim.rng() - 0.5) * 1.6
        } else {
          const ang = c.sim.rng() * Math.PI * 2
          const d = 2 + c.sim.rng() * 8
          x = c.u.x + Math.cos(ang) * d
          z = c.u.z + Math.sin(ang) * d
        }
        c.sim.emit({ t: 'tele', tele: { shape: 'circle', x, z, r: p.radius!, w: 0, a: 0, dur: 0.7, team: 0 } })
        c.sim.emit({ t: 'fx', id: 'fall:meteor', x, z, r: p.radius, dur: 0.7, color: '#ff7a1a' })
        c.sim.after(0.7, () => {
          c.sim.emit({ t: 'fx', id: 'burst:meteor', x, z, r: p.radius, color: '#ff8a2a' })
          for (const t of c.sim.inCircle(1, x, z, p.radius!, hits)) {
            dealDamage(c.sim, c.u, t, each, { type: 'fire', spell: true, heavy: true, skill: c.def.id })
          }
          if (c.u.alive) {
            addField(c.sim, {
              fx: 'burning', kind: 'burnGround', src: c.u, x, z, r: p.radius! * 0.8, dur: 3, every: 0.5,
              dmg: each * 0.06, type: 'fire', v: burnDps, skill: c.def.id, color: '#ff7a1a'
            })
          }
        })
      })
    }
  },
  firecracker: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const dmg = pw(c, 'int') * pct(p.dmg)
    const burnDps = (pw(c, 'int') * pct(p.burn) / p.burnDur!) * (1 + (c.u.s.mods.igniteBonus ?? 0))
    // The fuse: a ring of sparks on the target while it fizzes.
    c.sim.emit({ t: 'fx', id: 'mark', x: t.x, z: t.z, color: '#ffb02a', unit: t.id, dur: p.delay })
    c.sim.after(p.delay!, () => {
      // It pops where the target is, or where it fell.
      const x = t.x
      const z = t.z
      c.sim.emit({ t: 'fx', id: 'burst:ember', x, z, r: p.radius, color: '#ffb02a' })
      for (const e of c.sim.inCircle(1, x, z, p.radius!, hits)) {
        const dealt = dealDamage(c.sim, c.u.alive ? c.u : null, e, dmg, { type: 'fire', spell: true, heavy: true, skill: c.def.id })
        if (dealt > 0 && e.alive) applyStatus(c.sim, e, 'burn', p.burnDur!, burnDps, c.u, { type: 'fire' })
      }
    })
  },
  fanTheFlames: (c) => {
    const p = c.def.p
    // A gust of hot air rolls out from the mage.
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: '#ff8a2a' })
    for (const e of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      const b = findStatus(e, 'burn')
      if (b) {
        // The burn flares: stronger, and back to its full length.
        b.v *= 1 + pct(p.pct)
        b.t = Math.max(b.t, b.dur)
        c.sim.emit({ t: 'fx', id: 'burst:ember', x: e.x, z: e.z, r: 1.2, color: '#ffb02a' })
      }
      // Too close: blown back.
      if (Math.hypot(e.x - c.u.x, e.z - c.u.z) <= p.push! + e.r) knockback(e, c.u.x, c.u.z, 9)
    }
  },
  ringOfFire: (c) => {
    const p = c.def.p
    const n = p.flames!
    const R = p.radius!
    const ticks = p.dur! / 0.5
    const burnDps = pw(c, 'int') * 0.12 * (1 + (c.u.s.mods.igniteBonus ?? 0))
    // Small flames round the rim, each disc a hair smaller than half the spacing,
    // so neighbouring ground discs never overlap.
    const r = Math.min(1.35, ((Math.PI * R) / n) * 0.95)
    c.sim.emit({ t: 'fx', id: 'roar', x: c.x, z: c.z, r: R, color: '#ff7a1a' })
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const x = c.x + Math.sin(a) * R
      const z = c.z + Math.cos(a) * R
      if (isSolidAt(c.sim.grid, x, z)) continue
      addField(c.sim, {
        fx: 'ember', kind: 'burnGround', src: c.u, x, z, r, dur: p.dur!, every: 0.5,
        dmg: (pw(c, 'int') * pct(p.dmg)) / ticks, type: 'fire', v: burnDps, skill: c.def.id, color: '#ff7a1a'
      })
    }
    // Whoever is caught inside is slowed: getting out means wading through fire.
    for (const e of c.sim.inCircle(1, c.x, c.z, R, hits)) applyStatus(c.sim, e, 'slow', p.dur!, pct(p.slow), c.u)
  },
  phoenixFlight: (c) => {
    const p = c.def.p
    const ax = c.u.x
    const az = c.u.z
    applyStatus(c.sim, c.u, 'invulnerable', 0.5, 1, c.u, { quiet: true })
    placeNear(c.sim, c.u, c.x, c.z)
    const bx = c.u.x
    const bz = c.u.z
    c.sim.emit({ t: 'fx', id: 'dash', x: ax, z: az, x2: bx, z2: bz, color: '#ff8a2a' })
    c.sim.emit({ t: 'fx', id: 'burst:meteor', x: bx, z: bz, r: p.radius, color: '#ffb02a' })
    c.sim.emit({ t: 'fx', id: 'roar', x: bx, z: bz, r: p.radius, color: '#ff7a1a' })
    const burnDps = (pw(c, 'int') * pct(p.burn) / p.burnDur!) * (1 + (c.u.s.mods.igniteBonus ?? 0))
    const len = Math.hypot(bx - ax, bz - az)
    for (const e of c.sim.inCircle(1, (ax + bx) / 2, (az + bz) / 2, len / 2 + p.radius!, hits)) {
      const landed = Math.hypot(e.x - bx, e.z - bz) <= p.radius! + e.r
      const crossed = segDist(e.x, e.z, ax, az, bx, bz) <= 1.4 + e.r
      if (!landed && !crossed) continue
      // The landing blasts; the path only sets alight.
      if (landed) dealDamage(c.sim, c.u, e, pw(c, 'int') * pct(p.dmg), { type: 'fire', spell: true, heavy: true, skill: c.def.id })
      if (e.alive) applyStatus(c.sim, e, 'burn', p.burnDur!, burnDps, c.u, { type: 'fire' })
    }
    // The fire trail: small burning patches along the path, spaced so no two discs overlap,
    // stopping short of the landing blast.
    const trailR = 1.1
    const stepD = trailR * 2 + 0.2
    if (c.u.alive) {
      for (let d = 1.5; d < len - p.radius!; d += stepD) {
        const x = ax + ((bx - ax) / len) * d
        const z = az + ((bz - az) / len) * d
        if (isSolidAt(c.sim.grid, x, z)) continue
        addField(c.sim, {
          fx: 'burning', kind: 'burnGround', src: c.u, x, z, r: trailR, dur: 3, every: 0.5,
          dmg: pw(c, 'int') * 0.05, type: 'fire', v: burnDps * 0.5, skill: c.def.id, color: '#ff7a1a'
        })
      }
    }
    // Rebirth: the flight heals.
    applyStatus(c.sim, c.u, 'regen', p.dur!, pct(p.regen), c.u)
    c.sim.emit({ t: 'fx', id: 'rage', x: bx, z: bz, dur: p.dur, color: '#ff8a2a', unit: c.u.id })
  },

  // ── Grand Sovereign ───────────────────────────────────────────────────────
  royalGuard: (c) => {
    const guards = c.sim.units.filter(m => m.alive && m.kind === 'guard' && m.ownerId === c.u.id && m.life < 0)
    // A third call sends the oldest guard home.
    if (guards.length >= c.def.p.max!) {
      const old = guards[0]!
      old.life = 0.01
    }
    const ang = c.u.facing + (c.sim.rng() - 0.5)
    const m = spawnMinion(c.sim, 'guard', c.u.x + Math.sin(ang) * 1.6, c.u.z + Math.cos(ang) * 1.6, -1)
    if (m) c.sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color: c.def.color })
  },
  commandFocus: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'mark', x: t.x, z: t.z, color: c.def.color, unit: t.id, dur: p.dur })
    for (const m of c.sim.units) {
      if (!m.alive || m.ownerId !== c.u.id || m.rank !== 'minion') continue
      // `focus` carries the TARGET in its source field (see `ai.stepAlly`).
      applyStatus(c.sim, m, 'focus', p.dur!, pct(p.move) / 2, t, { quiet: true })
      applyStatus(c.sim, m, 'damageUp', p.dur!, pct(p.atk), c.u, { quiet: true })
      m.targetId = t.id
    }
  },
  bannerOfVictory: (c) => {
    const p = c.def.p
    addField(c.sim, { fx: 'banner', kind: 'banner', src: c.u, x: c.x, z: c.z, r: p.radius!, dur: p.dur!, v: pct(p.dmg), color: c.def.color })
  },
  armyOfTheRealm: (c) => {
    const p = c.def.p
    const roster: string[] = []
    for (let i = 0; i < p.archers!; i++) roster.push('archer')
    for (let i = 0; i < p.guards!; i++) roster.push('guard')
    for (let i = 0; i < p.mages!; i++) roster.push('mage')
    roster.forEach((kind, i) => {
      const ang = (i / roster.length) * Math.PI * 2
      const m = spawnMinion(c.sim, kind, c.u.x + Math.cos(ang) * 2.2, c.u.z + Math.sin(ang) * 2.2, p.dur!)
      if (m) c.sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color: MINIONS[kind]!.color })
    })
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: 5, color: c.def.color })
  },
  callArchers: (c) => {
    // Only the lasting archers count (Army of the Realm's have a timer).
    const mine = c.sim.units.filter(m => m.alive && m.kind === 'archer' && m.ownerId === c.u.id && m.life < 0)
    // A third call sends the oldest archer home.
    if (mine.length >= c.def.p.max!) mine[0]!.life = 0.01
    // Archers take their place behind the ruler, not in front.
    const ang = c.u.facing + Math.PI + (c.sim.rng() - 0.5)
    const m = spawnMinion(c.sim, 'archer', c.u.x + Math.sin(ang) * 1.8, c.u.z + Math.cos(ang) * 1.8, -1)
    if (m) c.sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color: MINIONS.archer!.color })
  },
  royalRally: (c) => {
    const p = c.def.p
    const court = c.sim.units.filter(m => m.alive && m.ownerId === c.u.id && m.rank === 'minion')
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: 5, color: c.def.color })
    court.forEach((m, i) => {
      // Everyone to the ruler's side, in a ring.
      const ang = (i / court.length) * Math.PI * 2
      c.sim.emit({ t: 'fx', id: 'blink', x: m.x, z: m.z, color: c.def.color })
      placeNear(c.sim, m, c.u.x + Math.sin(ang) * p.radius!, c.u.z + Math.cos(ang) * p.radius!)
      m.action = null
      c.sim.emit({ t: 'fx', id: 'blink', x: m.x, z: m.z, color: c.def.color })
      heal(c.sim, m, m.s.maxHp * pct(p.heal))
      applyStatus(c.sim, m, 'defenseUp', p.dur!, pct(p.def), c.u, { quiet: true })
    })
    applyStatus(c.sim, c.u, 'defenseUp', p.dur!, pct(p.def), c.u)
  },
  royalDecree: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    c.sim.emit({ t: 'fx', id: 'radiant', x: c.u.x, z: c.u.z, a: c.u.facing, color: '#fff2a8' })
    // "Bow!": only the enemies already in the fight; sleeping packs stay asleep.
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      if (!t.awake) continue
      applyStatus(c.sim, t, 'stun', p.stun!, 1, c.u)
      // Bowed heads make easy targets for the royal troops.
      applyStatus(c.sim, t, 'vulnerable', p.dur!, pct(p.vuln), c.u)
    }
  },
  summonChampion: (c) => {
    const p = c.def.p
    // One champion at a time: a second call sends the first one home.
    for (const m of c.sim.units) if (m.alive && m.kind === 'knightChampion' && m.ownerId === c.u.id) m.life = 0.01
    const x = c.u.x + Math.sin(c.u.facing) * 2.2
    const z = c.u.z + Math.cos(c.u.facing) * 2.2
    const m = spawnMinion(c.sim, 'knightChampion', x, z, p.dur!)
    if (!m) return
    c.sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color: MINIONS.knightChampion!.color })
    c.sim.emit({ t: 'fx', id: 'radiant', x: m.x, z: m.z, a: c.u.facing, color: '#fff2a8' })
    c.sim.emit({ t: 'fx', id: 'roar', x: m.x, z: m.z, r: 5, color: c.def.color })
  },

  // ── Chrono-Weaver ─────────────────────────────────────────────────────────
  temporalStasis: (c) => {
    const t = c.target
    if (!t) return
    applyStatus(c.sim, t, 'stasis', c.def.p.dur!, 1, c.u)
    c.sim.emit({ t: 'fx', id: 'stasis', x: t.x, z: t.z, dur: c.def.p.dur, color: c.def.color, unit: t.id })
  },
  hasteField: (c) => {
    const p = c.def.p
    addField(c.sim, { fx: 'haste', kind: 'haste', src: c.u, x: c.u.x, z: c.u.z, r: p.radius!, dur: p.dur!, v: pct(p.move), color: c.def.color })
  },
  paradoxShift: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const hx = c.u.x
    const hz = c.u.z
    c.sim.emit({ t: 'fx', id: 'blink', x: hx, z: hz, color: c.def.color })
    c.sim.emit({ t: 'fx', id: 'blink', x: t.x, z: t.z, color: c.def.color })
    placeNear(c.sim, c.u, t.x, t.z)
    if (t.rank !== 'boss') {
      t.x = hx
      t.z = hz
      t.px = hx
      t.pz = hz
    }
    dealDamage(c.sim, c.u, t, pw(c, 'int') * pct(p.dmg), { type: 'temporal', spell: true, heavy: true, skill: c.def.id })
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const e of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      if (e !== t) applyStatus(c.sim, e, 'confuse', p.confuse!, 1, c.u)
    }
  },
  chronoRewind: (c) => {
    const back = c.sim.time - c.def.p.back!
    // The newest sample that is at least four seconds old (the oldest we have
    // if the fight is younger than that).
    let s = c.h.history[0]
    for (const h of c.h.history) if (h.t <= back) s = h
    c.sim.emit({ t: 'fx', id: 'rewind', x: c.u.x, z: c.u.z, x2: s?.x, z2: s?.z, color: c.def.color })
    cleanse(c.u)
    if (!s) return
    placeNear(c.sim, c.u, s.x, s.z)
    c.u.hp = Math.max(c.u.hp, Math.min(c.u.s.maxHp, s.hp))
    c.u.mana = Math.max(c.u.mana, Math.min(c.u.s.maxMana, s.mana))
    c.sim.emit({ t: 'fx', id: 'blink', x: c.u.x, z: c.u.z, color: c.def.color })
  },
  echoBolt: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const power = pw(c, 'int')
    const speed = 20
    fire(c.sim, {
      fx: 'bolt', src: c.u, tx: t.x, tz: t.z, targetId: t.id, homing: true, speed,
      dmg: power * pct(p.dmg), type: 'temporal', spell: true, skill: c.def.id, color: c.def.color
    })
    // The same hit again, a moment later: time repeats itself.
    const fly = Math.hypot(t.x - c.u.x, t.z - c.u.z) / speed
    c.sim.after(fly + p.delay!, () => {
      if (!t.alive) return
      c.sim.emit({ t: 'fx', id: 'impact:bolt', x: t.x, z: t.z, color: c.def.color })
      dealDamage(c.sim, c.u.alive ? c.u : null, t, power * pct(p.echo), { type: 'temporal', spell: true, skill: c.def.id })
    })
  },
  timeBubble: (c) => {
    const p = c.def.p
    const ticks = p.dur! / 0.5
    // A 'web' field: every tick deals its share and slows by 50 % for 1 s
    // (`stepFields` hard-codes the 0.5, which is why p.slow is 50).
    addField(c.sim, {
      fx: 'haste', kind: 'web', src: c.u, x: c.x, z: c.z, r: p.radius!, dur: p.dur!, every: 0.5,
      dmg: (pw(c, 'int') * pct(p.dmg)) / ticks, type: 'temporal', skill: c.def.id, color: '#8fb8ff'
    })
  },
  timeLoop: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const sx = t.x
    const sz = t.z
    const hp0 = t.hp
    const base = pw(c, 'int') * pct(p.dmg)
    c.sim.emit({ t: 'fx', id: 'mark', x: t.x, z: t.z, color: c.def.color, unit: t.id, dur: p.dur })
    c.sim.after(p.dur!, () => {
      if (!t.alive) return
      // Whatever it lost while looped comes round again, plus the loop's own snap.
      const lost = Math.max(0, hp0 - t.hp)
      c.sim.emit({ t: 'fx', id: 'rewind', x: t.x, z: t.z, x2: sx, z2: sz, color: c.def.color })
      if (t.rank !== 'boss' && !hasStatus(t, 'stasis')) placeNear(c.sim, t, sx, sz)
      c.sim.emit({ t: 'fx', id: 'blink', x: t.x, z: t.z, color: c.def.color })
      dealDamage(c.sim, c.u.alive ? c.u : null, t, base + lost * pct(p.echo), { type: 'temporal', spell: true, heavy: true, skill: c.def.id })
    })
  },
  timeStop: (c) => {
    const p = c.def.p
    const R = c.def.radius!
    const dmg = pw(c, 'int') * pct(p.dmg)
    c.sim.emit({ t: 'fx', id: 'rupture', x: c.u.x, z: c.u.z, r: R, color: c.def.color })
    const caught: Unit[] = []
    for (const e of c.sim.inCircle(1, c.u.x, c.u.z, R, hits)) {
      if (!e.awake) continue
      // Bosses shrug most of it off (applyStatus scales stasis by BOSS_CC).
      if (applyStatus(c.sim, e, 'stasis', p.dur!, 1, c.u)) {
        caught.push(e)
        c.sim.emit({ t: 'fx', id: 'stasis', x: e.x, z: e.z, dur: p.dur, color: c.def.color, unit: e.id })
      }
    }
    // When the clock starts again, the stopped moment lands all at once.
    c.sim.after(p.dur!, () => {
      for (const e of caught) {
        if (!e.alive) continue
        removeStatus(e, 'stasis')
        c.sim.emit({ t: 'fx', id: 'burst:bolt', x: e.x, z: e.z, r: 1.8, color: c.def.color })
        dealDamage(c.sim, c.u.alive ? c.u : null, e, dmg, { type: 'temporal', spell: true, heavy: true, skill: c.def.id })
      }
    })
  },

  // ── Blood Alchemist ───────────────────────────────────────────────────────
  sanguineFlask: (c) => {
    const p = c.def.p
    const dmg = pw(c, 'end') * pct(p.dmg) * (1 + (c.u.s.mods.flaskDamage ?? 0))
    const bleed = (pw(c, 'end') * 0.2) / 5
    const x = c.x
    const z = c.z
    c.sim.emit({ t: 'fx', id: 'lob:flask', x: c.u.x, z: c.u.z, x2: x, z2: z, dur: 0.38, color: c.def.color })
    c.sim.after(0.38, () => {
      c.sim.emit({ t: 'fx', id: 'burst:flask', x, z, r: p.radius, color: c.def.color })
      for (const t of c.sim.inCircle(1, x, z, p.radius!, hits)) {
        const dealt = dealDamage(c.sim, c.u.alive ? c.u : null, t, dmg, { type: 'acid', spell: true, heavy: true, skill: c.def.id })
        if (dealt > 0 && t.alive) {
          applyStatus(c.sim, t, 'armorShred', p.shredDur!, pct(p.shred), c.u)
          applyStatus(c.sim, t, 'bleed', 5, bleed, c.u, { type: 'physical', quiet: true })
        }
      }
    })
  },
  essenceHarvest: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'harvest', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      if (t.hp >= t.s.maxHp) continue
      c.sim.emit({ t: 'fx', id: 'drain', x: t.x, z: t.z, x2: c.u.x, z2: c.u.z, color: c.def.color })
      dealDamage(c.sim, c.u, t, pw(c, 'int') * pct(p.dmg), { type: 'blood', spell: true, skill: c.def.id, steal: pct(p.heal), drain: true })
    }
  },
  mutagenicRage: (c) => {
    const p = c.def.p
    applyStatus(c.sim, c.u, 'attackSpeed', p.dur!, pct(p.speed), c.u, { quiet: true })
    applyStatus(c.sim, c.u, 'lifestealUp', p.dur!, pct(p.steal), c.u)
    applyStatus(c.sim, c.u, 'haste', p.dur!, pct(p.move), c.u, { quiet: true })
    c.sim.emit({ t: 'fx', id: 'rage', x: c.u.x, z: c.u.z, dur: p.dur, color: c.def.color, unit: c.u.id })
  },
  philosophersCrucible: (c) => {
    const p = c.def.p
    addField(c.sim, {
      fx: 'crucible', kind: 'crucible', src: c.u, x: c.u.x, z: c.u.z, r: p.radius!, dur: p.dur!, every: 0.5,
      dmg: pw(c, 'int') * pct(p.dmg) * 0.5, type: 'blood', skill: c.def.id, color: c.def.color
    })
  },
  essenceWard: (c) => {
    const p = c.def.p
    // beginCast already took hp % of the health she had; work back what that was.
    const paid = c.u.hp * (p.hp! / (100 - p.hp!))
    addShield(c.u, paid * pct(p.shield), p.dur!)
    c.sim.emit({ t: 'fx', id: 'shield', x: c.u.x, z: c.u.z, unit: c.u.id, color: c.def.color })
  },
  enfeeblingTonic: (c) => {
    const p = c.def.p
    const dmg = pw(c, 'int') * pct(p.dmg) * (1 + (c.u.s.mods.flaskDamage ?? 0))
    const x = c.x
    const z = c.z
    // A green-gold tonic: same flight as Sanguine Flask, a different brew.
    c.sim.emit({ t: 'fx', id: 'lob:flask', x: c.u.x, z: c.u.z, x2: x, z2: z, dur: 0.38, color: '#c8ff6a' })
    c.sim.after(0.38, () => {
      c.sim.emit({ t: 'fx', id: 'burst:flask', x, z, r: p.radius, color: '#c8ff6a' })
      for (const t of c.sim.inCircle(1, x, z, p.radius!, hits)) {
        const dealt = dealDamage(c.sim, c.u.alive ? c.u : null, t, dmg, { type: 'acid', spell: true, heavy: true, skill: c.def.id })
        if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'weaken', p.dur!, pct(p.weak), c.u)
      }
    })
  },
  homunculus: (c) => {
    const p = c.def.p
    // Only one at a time: the old one hops back into the flask, and the
    // life it still had flows back to her.
    const old = c.sim.units.find(m => m.alive && m.kind === 'homunculus' && m.ownerId === c.u.id)
    if (old) {
      c.sim.emit({ t: 'fx', id: 'drain', x: old.x, z: old.z, x2: c.u.x, z2: c.u.z, color: c.def.color })
      heal(c.sim, c.u, old.hp * pct(p.back))
      old.life = 0.01
    }
    const m = spawnMinion(c.sim, 'homunculus', c.x, c.z, p.dur!)
    if (m) c.sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color: c.def.color })
  },
  grandTransmutation: (c) => {
    const p = c.def.p
    const cap = pw(c, 'int') * pct(p.cap)
    let got = 0
    c.sim.emit({ t: 'fx', id: 'harvest', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      if (!t.awake) continue
      // A share of what it has left, turned to glowing essence (capped, so a
      // boss loses a big bite, not a quarter of its bar).
      const amount = Math.min(cap, t.hp * pct(p.pct))
      c.sim.emit({ t: 'fx', id: 'drain', x: t.x, z: t.z, x2: c.u.x, z2: c.u.z, color: c.def.color })
      got += dealDamage(c.sim, c.u, t, amount, { type: 'true', canCrit: false, spell: true, heavy: true, skill: c.def.id, drain: true })
    }
    heal(c.sim, c.u, got * pct(p.heal))
  },

  // ── Aether-Tech ───────────────────────────────────────────────────────────
  aetherPistol: (c) => {
    fire(c.sim, {
      fx: 'aether', src: c.u, tx: c.target?.x ?? c.x, tz: c.target?.z ?? c.z, targetId: c.target?.id, homing: !!c.target,
      speed: 26, dmg: pw(c, 'skl') * pct(c.def.p.dmg), type: 'pierce', pierce: Math.round(c.u.s.mods.pierce ?? 0),
      skill: c.def.id, color: c.def.color
    })
  },
  deployTurret: (c) => {
    const mine = c.sim.units.filter(m => m.alive && m.rank === 'turret' && m.ownerId === c.u.id)
    if (mine.length >= c.def.p.max!) mine[0]!.life = 0.01
    // Gatling and rocket take turns (the reference sheet shows both).
    const kind = c.u.swings % 2 === 0 ? 'turret' : 'rocketTurret'
    c.u.swings++
    const m = spawnMinion(c.sim, kind, c.x, c.z, c.def.p.dur!)
    if (m) c.sim.emit({ t: 'fx', id: 'deploy', x: m.x, z: m.z, color: c.def.color })
  },
  ventHeat: (c) => {
    const p = c.def.p
    const k = Math.max(0.08, c.h.heat / HEAT_MAX)
    const half = ((p.cone! / 2) * Math.PI) / 180
    c.sim.emit({ t: 'fx', id: 'breath', x: c.u.x, z: c.u.z, r: c.def.range, a: c.a, dur: half, color: '#ff8a3a' })
    for (const t of c.sim.inCone(1, c.u.x, c.u.z, c.a, c.def.range, half, hits)) {
      dealDamage(c.sim, c.u, t, pw(c, 'skl') * pct(p.dmg) * k, { type: 'fire', spell: true, heavy: k > 0.6, skill: c.def.id })
    }
    c.h.heat = 0
    c.h.overheatT = 0
    removeStatus(c.u, 'overheat')
    c.sim.emit({ t: 'overheat', on: false })
  },
  orbitalBeam: (c) => {
    const p = c.def.p
    const ticks = p.dur! / 0.5
    const power = (pw(c, 'int') + pw(c, 'skl')) / 2
    addField(c.sim, {
      fx: 'orbital', kind: 'beam', src: c.u, x: c.x, z: c.z, r: p.radius!, dur: p.dur!, every: 0.5,
      dmg: (power * pct(p.dmg)) / ticks, type: 'beam', skill: c.def.id, color: c.def.color
    })
  },
  exoSuit: (c) => {
    const p = c.def.p
    applyStatus(c.sim, c.u, 'exosuit', p.dur!, pct(p.armor), c.u)
    c.h.heat = 0
    c.h.overheatT = 0
    removeStatus(c.u, 'overheat')
    c.sim.emit({ t: 'fx', id: 'exosuit', x: c.u.x, z: c.u.z, dur: p.dur, color: c.def.color, unit: c.u.id })
    const dmg = pw(c, 'skl') * pct(p.rocket)
    for (let t = 0.6; t < p.dur!; t += 1.5) {
      c.sim.after(t, () => {
        if (!c.u.alive || !hasStatus(c.u, 'exosuit')) return
        const e = c.sim.nearest(1, c.u.x, c.u.z, 12)
        if (!e || !e.awake) return
        fire(c.sim, { fx: 'rocket', src: c.u, tx: e.x, tz: e.z, targetId: e.id, homing: true, speed: 17, dmg, type: 'fire', aoe: 2, heavy: true, skill: c.def.id, color: '#ff8a4a' })
      })
    }
  },
  rocketJump: (c) => {
    const p = c.def.p
    const fromX = c.u.x
    const fromZ = c.u.z
    // A puff of exhaust where she was, a streak through the air, a blast where she lands.
    applyStatus(c.sim, c.u, 'invulnerable', 0.3, 1, c.u, { quiet: true })
    c.sim.emit({ t: 'fx', id: 'burst:rocket', x: fromX, z: fromZ, r: 1.2, color: '#ff8a4a' })
    placeNear(c.sim, c.u, c.x, c.z)
    c.sim.emit({ t: 'fx', id: 'dash', x: fromX, z: fromZ, x2: c.u.x, z2: c.u.z, color: c.def.color })
    c.sim.emit({ t: 'fx', id: 'burst:rocket', x: c.u.x, z: c.u.z, r: p.radius, color: '#ff8a4a' })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'skl') * pct(p.dmg), { type: 'fire', heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive) knockback(t, c.u.x, c.u.z, 4)
    }
  },
  shockGrenade: (c) => {
    const p = c.def.p
    // Lobbed: it arcs over everything and bursts where she aimed, stunning all it catches.
    fire(c.sim, {
      fx: 'blast', src: c.u, tx: c.x, tz: c.z, lob: 0.6, speed: 1, dmg: pw(c, 'skl') * pct(p.dmg), type: 'beam',
      aoe: p.radius, spell: true, heavy: true, skill: c.def.id, status: { id: 'stun', dur: p.stun!, v: 1 }, color: c.def.color
    })
  },
  arcCoil: (c) => {
    let t = c.target
    if (!t) return
    const p = c.def.p
    const dmg = pw(c, 'skl') * pct(p.dmg)
    const struck: number[] = []
    let from: Unit = c.u
    // Lightning leaps from enemy to enemy, never the same one twice.
    for (let i = 0; i <= p.jumps! && t; i++) {
      const a = from
      const b = t
      c.sim.after(i * 0.12, () => {
        if (!b.alive) return
        c.sim.emit({ t: 'fx', id: 'beam', x: a.x, z: a.z, x2: b.x, z2: b.z, r: 0.45, color: c.def.color })
        dealDamage(c.sim, c.u.alive ? c.u : null, b, dmg, { type: 'beam', spell: true, heavy: i === 0, skill: c.def.id })
      })
      struck.push(b.id)
      let next: Unit | null = null
      let best = p.chain! * p.chain!
      for (const e of c.sim.units) {
        if (!e.alive || e.team !== 1 || !e.awake || e.rank === 'npc' || outOfReach(e) || struck.includes(e.id)) continue
        const d = (e.x - b.x) * (e.x - b.x) + (e.z - b.z) * (e.z - b.z)
        if (d < best) { best = d; next = e }
      }
      from = b
      t = next
    }
  },

  // ── Geomancer ─────────────────────────────────────────────────────────────
  stoneSpike: (c) => {
    const p = c.def.p
    const x = c.target?.x ?? c.x
    const z = c.target?.z ?? c.z
    c.sim.emit({ t: 'fx', id: 'spike', x, z, color: c.def.color })
    const list = c.target ? [c.target] : c.sim.inCircle(1, x, z, 1.3, hits)
    for (const t of list) {
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'str') * pct(p.dmg), { type: 'physical', heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'slow', p.dur!, pct(p.slow), c.u)
    }
  },
  earthBarrier: (c) => {
    const p = c.def.p
    const g = c.sim.grid
    // A row of cells across the line from the hero to the aim point.
    const along = Math.abs(Math.sin(c.a)) > Math.abs(Math.cos(c.a))
    const ci = cellOf(c.x)
    const cj = cellOf(c.z)
    const n = p.cells!
    const cells: number[] = []
    const hi = cellOf(c.u.x)
    const hj = cellOf(c.u.z)
    for (let k = -Math.floor(n / 2); k <= Math.floor(n / 2); k++) {
      const i = along ? ci : ci + k
      const j = along ? cj + k : cj
      if (i < 0 || j < 0 || i >= g.w || j >= g.h || isSolidCell(g, i, j)) continue
      // Never on the hero's own cell.
      if (i === hi && j === hj) continue
      cells.push(j * g.w + i)
    }
    raiseWall(c.sim, cells, p.dur!, 'barrier')
  },
  seismicShock: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'quake', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'str') * pct(p.dmg), { type: 'physical', heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive && t.rank !== 'boss') {
        applyStatus(c.sim, t, 'knockdown', p.down!, 1, c.u)
        knockback(t, c.u.x, c.u.z, 5)
      }
    }
  },
  petrify: (c) => {
    const t = c.target
    if (!t) return
    applyStatus(c.sim, t, 'petrify', c.def.p.dur!, pct(c.def.p.vuln), c.u)
    c.sim.emit({ t: 'fx', id: 'petrify', x: t.x, z: t.z, dur: c.def.p.dur, color: '#b9b2a4', unit: t.id })
  },
  tectonicRupture: (c) => {
    const p = c.def.p
    const g = c.sim.grid
    const each = (pw(c, 'str') * pct(p.dmg)) / p.dur!
    c.sim.emit({ t: 'fx', id: 'quake', x: c.u.x, z: c.u.z, r: c.def.radius, color: c.def.color })
    for (let i = 0; i < p.dur!; i++) {
      c.sim.after(i, () => {
        if (!c.u.alive) return
        c.sim.emit({ t: 'fx', id: 'rupture', x: c.u.x, z: c.u.z, r: c.def.radius, color: c.def.color })
        for (const t of c.sim.inCircle(1, c.u.x, c.u.z, c.def.radius!, hits)) {
          if (t.awake) dealDamage(c.sim, c.u, t, each, { type: 'physical', heavy: true, skill: c.def.id })
        }
      })
    }
    // Rubble: impassable ground thrown up among the enemy, never round the hero.
    const hi = cellOf(c.u.x)
    const hj = cellOf(c.u.z)
    const cells: number[] = []
    const foes = c.sim.units.filter(e => e.alive && e.team === 1 && e.awake)
    for (let n = 0; n < 14; n++) {
      const e = foes.length ? foes[Math.floor(c.sim.rng() * foes.length)]! : null
      const bx = e ? e.x : c.u.x
      const bz = e ? e.z : c.u.z
      const ang = c.sim.rng() * Math.PI * 2
      const d = e ? 1.5 + c.sim.rng() * 2.5 : 4 + c.sim.rng() * 6
      const i = cellOf(bx + Math.cos(ang) * d)
      const j = cellOf(bz + Math.sin(ang) * d)
      if (i < 0 || j < 0 || i >= g.w || j >= g.h || isSolidCell(g, i, j)) continue
      if (Math.abs(i - hi) <= 1 && Math.abs(j - hj) <= 1) continue
      const k = j * g.w + i
      if (!cells.includes(k)) cells.push(k)
    }
    raiseWall(c.sim, cells, p.rubble!, 'rubble')
  },
  boulderRoll: (c) => {
    const p = c.def.p
    const speed = 12
    const len = c.def.range
    // A boulder bowls along the aimed line, through everything, knocking them flat.
    fire(c.sim, {
      fx: 'rock', src: c.u, tx: c.u.x + Math.sin(c.a) * len, tz: c.u.z + Math.cos(c.a) * len, speed,
      dmg: pw(c, 'str') * pct(p.dmg), type: 'physical', r: 0.8, pierce: 20, life: len / speed, heavy: true,
      skill: c.def.id, status: { id: 'knockdown', dur: p.down!, v: 1 }, color: c.def.color
    })
  },
  sinkhole: (c) => {
    const p = c.def.p
    const x = c.x
    const z = c.z
    const R = p.radius!
    const dmg = pw(c, 'str') * pct(p.dmg)
    c.sim.emit({ t: 'tele', tele: { shape: 'circle', x, z, r: R, w: 0, a: 0, dur: p.dur!, team: 0 } })
    c.sim.emit({ t: 'fx', id: 'field:sinkhole', x, z, r: R, dur: p.dur, color: c.def.color })
    // The ground sags: everything near slides toward the middle...
    const steps = Math.round(p.dur! / 0.25)
    for (let k = 0; k < steps; k++) {
      c.sim.after(k * 0.25, () => {
        for (const t of c.sim.inCircle(1, x, z, R + 1, hits)) {
          if (!t.awake) continue
          applyStatus(c.sim, t, 'slow', 0.4, pct(p.slow), c.u, { quiet: true })
          // Shoved away from its own mirror point = pulled toward (x, z).
          if (Math.hypot(t.x - x, t.z - z) > 0.6) knockback(t, 2 * t.x - x, 2 * t.z - z, 2.5)
        }
      })
    }
    // ...then it caves in.
    c.sim.after(p.dur!, () => {
      c.sim.emit({ t: 'fx', id: 'quake', x, z, r: R, color: c.def.color })
      for (const t of c.sim.inCircle(1, x, z, R, hits)) {
        const dealt = dealDamage(c.sim, c.u.alive ? c.u : null, t, dmg, { type: 'physical', heavy: true, skill: c.def.id })
        if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'knockdown', p.down!, 1, c.u)
      }
    })
  },
  geodeShell: (c) => {
    const p = c.def.p
    const full = c.u.s.maxHp * pct(p.shield)
    const dmg = pw(c, 'str') * pct(p.dmg)
    addShield(c.u, full, p.dur!)
    c.sim.emit({ t: 'fx', id: 'shield', x: c.u.x, z: c.u.z, unit: c.u.id, color: '#d8c8ff' })
    // Just before it would fade, the crystal bursts for whatever it still holds.
    c.sim.after(p.dur! - 0.05, () => {
      if (!c.u.alive || c.u.shield <= 0) return
      const k = Math.min(1, c.u.shield / full)
      c.u.shield = 0
      c.u.shieldT = 0
      c.sim.emit({ t: 'fx', id: 'burst:icicle', x: c.u.x, z: c.u.z, r: p.radius, color: '#d8c8ff' })
      for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
        const dealt = dealDamage(c.sim, c.u, t, dmg * k, { type: 'physical', heavy: true, skill: c.def.id })
        if (dealt > 0 && t.alive) knockback(t, c.u.x, c.u.z, 5)
      }
    })
  },

  // ── Windrunner ────────────────────────────────────────────────────────────
  galeArrow: (c) => {
    const p = c.def.p
    const t = c.target
    const hx = c.u.x
    const hz = c.u.z
    const tx = t?.x ?? c.x
    const tz = t?.z ?? c.z
    fire(c.sim, {
      fx: 'arrow', src: c.u, tx, tz, targetId: t?.id, homing: !!t,
      speed: 28, dmg: pw(c, 'dex') * pct(p.dmg), type: 'pierce', r: 0.35, heavy: true, skill: c.def.id, color: c.def.color
    })
    // The gust behind the arrow shoves whatever it struck.
    if (t) {
      c.sim.after(Math.hypot(tx - hx, tz - hz) / 28, () => {
        if (t.alive) knockback(t, hx, hz, p.push!)
      })
    }
  },
  zephyrDash: (c) => {
    const p = c.def.p
    dashTo(c, c.a, p.dist!)
    applyStatus(c.sim, c.u, 'haste', p.dur!, pct(p.move), c.u, { quiet: true })
  },
  piercingGale: (c) => {
    const p = c.def.p
    const len = c.def.range
    fire(c.sim, {
      fx: 'arrow', src: c.u, tx: c.u.x + Math.sin(c.a) * len, tz: c.u.z + Math.cos(c.a) * len,
      speed: 30, dmg: pw(c, 'dex') * pct(p.dmg), type: 'pierce', r: 0.6, pierce: 99, life: len / 30,
      heavy: true, skill: c.def.id, color: c.def.color, status: { id: 'slow', dur: p.dur!, v: pct(p.slow) }
    })
  },
  cycloneSnare: (c) => {
    const p = c.def.p
    const x = c.x
    const z = c.z
    const ticks = p.dur! / 0.5
    addField(c.sim, {
      fx: 'haste', kind: 'damage', src: c.u, x, z, r: p.radius!, dur: p.dur!, every: 0.5,
      dmg: (pw(c, 'skl') * pct(p.dmg)) / ticks, type: 'physical', skill: c.def.id, color: c.def.color
    })
    // The wind draws everything near toward its eye (a negative shove; bosses do not budge).
    for (let i = 0; i < ticks; i++) {
      c.sim.after(i * 0.5, () => {
        for (const t of c.sim.inCircle(1, x, z, p.radius! + 1.5, hits)) {
          if (Math.hypot(t.x - x, t.z - z) > 0.6) knockback(t, x, z, -3)
        }
      })
    }
  },
  updraftLeap: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'dex') * pct(p.dmg), { type: 'physical', heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'knockup', p.air!, 1, c.u)
    }
    // Ride the gust out: away from the nearest enemy (else backwards).
    const e = c.sim.nearest(1, c.u.x, c.u.z, 12)
    const away = e ? angleTo(e.x, e.z, c.u.x, c.u.z) : c.u.facing + Math.PI
    applyStatus(c.sim, c.u, 'invulnerable', 0.3, 1, c.u, { quiet: true })
    dashTo(c, away, p.leap!)
  },
  arrowStorm: (c) => {
    const p = c.def.p
    const n = p.volleys!
    const each = (pw(c, 'skl') * pct(p.dmg)) / n
    const x = c.x
    const z = c.z
    c.sim.emit({ t: 'tele', tele: { shape: 'circle', x, z, r: p.radius!, w: 0, a: 0, dur: 0.4, team: 0 } })
    for (let i = 0; i < n; i++) {
      c.sim.after(0.15 + (i * p.dur!) / n, () => {
        const ang = c.sim.rng() * Math.PI * 2
        const d = Math.sqrt(c.sim.rng()) * p.radius! * 0.7
        c.sim.emit({ t: 'fx', id: 'fall:arrow', x: x + Math.cos(ang) * d, z: z + Math.sin(ang) * d, dur: 0.25, color: c.def.color })
        c.sim.after(0.25, () => {
          c.sim.emit({ t: 'fx', id: 'burst:arrow', x, z, r: p.radius, color: c.def.color })
          for (const t of c.sim.inCircle(1, x, z, p.radius!, hits)) {
            const dealt = dealDamage(c.sim, c.u.alive ? c.u : null, t, each, { type: 'pierce', skill: c.def.id })
            if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'slow', 1, pct(p.slow), c.u, { quiet: true })
          }
        })
      })
    }
  },
  galeSpirits: (c) => {
    const p = c.def.p
    applyStatus(c.sim, c.u, 'haste', p.dur!, pct(p.move), c.u)
    c.sim.emit({ t: 'fx', id: 'buff', x: c.u.x, z: c.u.z, color: c.def.color, unit: c.u.id })
    const dmg = pw(c, 'skl') * pct(p.dmg)
    const every = p.dur! / p.shots!
    for (let i = 0; i < p.shots!; i++) {
      c.sim.after(0.3 + i * every, () => {
        if (!c.u.alive) return
        const e = c.sim.nearest(1, c.u.x, c.u.z, 12)
        if (!e || !e.awake) return
        fire(c.sim, {
          fx: 'arrow', src: c.u, tx: e.x, tz: e.z, targetId: e.id, homing: true,
          speed: 24, dmg, type: 'pierce', skill: c.def.id, color: c.def.color
        })
      })
    }
  },
  skyrender: (c) => {
    const p = c.def.p
    const len = c.def.range
    const x2 = c.u.x + Math.sin(c.a) * len
    const z2 = c.u.z + Math.cos(c.a) * len
    c.sim.emit({ t: 'fx', id: 'dash', x: c.u.x, z: c.u.z, x2, z2, color: c.def.color })
    c.sim.emit({ t: 'fx', id: 'roar', x: x2, z: z2, r: 3, color: c.def.color })
    // The side of the line each enemy stood on: it is thrown that way.
    const nx = Math.cos(c.a)
    const nz = -Math.sin(c.a)
    for (const t of c.sim.inLine(1, c.u.x, c.u.z, c.a, len, p.width!, hits)) {
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'dex') * pct(p.dmg), { type: 'physical', heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive) {
        applyStatus(c.sim, t, 'knockup', p.air!, 1, c.u)
        const s = Math.sign((t.x - c.u.x) * nx + (t.z - c.u.z) * nz) || 1
        knockback(t, t.x - nx * s, t.z - nz * s, 5)
      }
    }
  },

  // ── Frostwarden ─────────────────────────────────────────────────────────────
  frostCleave: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const a = angleTo(c.u.x, c.u.z, t.x, t.z)
    c.sim.emit({ t: 'fx', id: 'cleave', x: c.u.x, z: c.u.z, r: 2.8, a, dur: 1, color: c.def.color })
    for (const e of c.sim.inCone(1, c.u.x, c.u.z, a, 2.8, Math.PI / 3, hits)) {
      const dealt = dealDamage(c.sim, c.u, e, pw(c, 'str') * pct(p.dmg), { type: 'frost', heavy: e === t, skill: c.def.id })
      if (dealt > 0 && e.alive) applyStatus(c.sim, e, 'slow', p.dur!, pct(p.slow), c.u)
    }
  },
  rimeLance: (c) => {
    const p = c.def.p
    fire(c.sim, {
      fx: 'icicle', src: c.u, tx: c.target?.x ?? c.x, tz: c.target?.z ?? c.z, targetId: c.target?.id, homing: !!c.target,
      speed: 22, dmg: pw(c, 'int') * pct(p.dmg), type: 'frost', r: 0.4, spell: true, heavy: true, skill: c.def.id,
      status: { id: 'slow', dur: p.dur!, v: pct(p.slow) }, color: c.def.color
    })
  },
  frostArmor: (c) => {
    const p = c.def.p
    addShield(c.u, pw(c, 'int') * pct(p.shield), p.dur!)
    c.sim.emit({ t: 'fx', id: 'shield', x: c.u.x, z: c.u.z, unit: c.u.id, color: c.def.color })
    c.sim.emit({ t: 'fx', id: 'burst:icicle', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) applyStatus(c.sim, t, 'slow', p.slowDur!, pct(p.slow), c.u)
  },
  glacialCharge: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const a = angleTo(c.u.x, c.u.z, t.x, t.z)
    const d = Math.max(0, Math.hypot(t.x - c.u.x, t.z - c.u.z) - (t.r + c.u.r + 0.3))
    // Everything on the way is chilled by the wake.
    for (const e of c.sim.inLine(1, c.u.x, c.u.z, a, d, 0.9, hits)) {
      if (e !== t) applyStatus(c.sim, e, 'slow', p.dur!, pct(p.slow), c.u)
    }
    dashTo(c, a, d)
    face(c.u, t.x, t.z)
    c.sim.emit({ t: 'fx', id: 'burst:icicle', x: t.x, z: t.z, r: 1.4, color: c.def.color })
    const dealt = dealDamage(c.sim, c.u, t, pw(c, 'str') * pct(p.dmg), { type: 'frost', heavy: true, skill: c.def.id })
    if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'frozen', p.freeze!, 1, c.u)
    c.h.order.kind = 'attack'
    c.h.order.targetId = t.id
  },
  rimeField: (c) => {
    const p = c.def.p
    const x = c.x
    const z = c.z
    const ticks = p.dur! / 0.5
    addField(c.sim, {
      fx: 'rime', kind: 'damage', src: c.u, x, z, r: p.radius!, dur: p.dur!, every: 0.5,
      dmg: (pw(c, 'int') * pct(p.dmg)) / ticks, type: 'frost', skill: c.def.id, color: c.def.color
    })
    // Once a second: the warm are chilled, the chilled freeze.
    for (let i = 0; i < p.dur!; i++) {
      c.sim.after(i, () => {
        for (const t of c.sim.inCircle(1, x, z, p.radius!, hits)) {
          if (hasStatus(t, 'slow')) {
            removeStatus(t, 'slow')
            applyStatus(c.sim, t, 'frozen', p.freeze!, 1, c.u)
          } else applyStatus(c.sim, t, 'slow', 1.2, pct(p.slow), c.u, { quiet: true })
        }
      })
    }
  },
  frostShatter: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'quake', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      const iced = hasStatus(t, 'frozen')
      const mul = 1 + (iced ? pct(p.frozen) : hasStatus(t, 'slow') ? pct(p.chilled) : 0)
      if (iced) {
        removeStatus(t, 'frozen')
        c.sim.emit({ t: 'fx', id: 'burst:icicle', x: t.x, z: t.z, r: 1.6, color: '#ffffff' })
      }
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'str') * pct(p.dmg) * mul, { type: 'frost', heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive) knockback(t, c.u.x, c.u.z, 4)
    }
  },
  avalancheLeap: (c) => {
    const p = c.def.p
    const d = Math.hypot(c.x - c.u.x, c.z - c.u.z)
    applyStatus(c.sim, c.u, 'invulnerable', 0.3, 1, c.u, { quiet: true })
    dashTo(c, angleTo(c.u.x, c.u.z, c.x, c.z), d)
    c.sim.emit({ t: 'fx', id: 'quake', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    c.sim.emit({ t: 'fx', id: 'burst:icicle', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'str') * pct(p.dmg), { type: 'frost', heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive) {
        applyStatus(c.sim, t, 'slow', p.dur!, pct(p.slow), c.u, { quiet: true })
        if (t.rank !== 'boss') applyStatus(c.sim, t, 'knockdown', p.down!, 1, c.u)
      }
    }
  },
  absoluteZero: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    c.sim.emit({ t: 'fx', id: 'stasis', x: c.u.x, z: c.u.z, dur: p.freeze, color: c.def.color, unit: c.u.id })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      c.sim.emit({ t: 'fx', id: 'burst:icicle', x: t.x, z: t.z, r: 1.2, color: c.def.color })
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'int') * pct(p.dmg), { type: 'frost', spell: true, heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'frozen', p.freeze!, 1, c.u)
    }
    addShield(c.u, pw(c, 'int') * pct(p.shield), p.freeze! + 2)
  },

  // ── Lightbringer ────────────────────────────────────────────────────────────
  // ── Lightbringer ──────────────────────────────────────────────────────────
  sunbolt: (c) => {
    const p = c.def.p
    fire(c.sim, {
      fx: 'holy', src: c.u, tx: c.target?.x ?? c.x, tz: c.target?.z ?? c.z, targetId: c.target?.id, homing: !!c.target,
      speed: 18, dmg: pw(c, 'int') * pct(p.dmg), type: 'holy', r: 0.4, spell: true, heavy: true, skill: c.def.id,
      status: { id: 'weaken', dur: p.dur!, v: pct(p.weaken) }, color: '#fff2a8'
    })
  },
  mendingLight: (c) => {
    const p = c.def.p
    heal(c.sim, c.u, pw(c, 'cha') * pct(p.heal))
    applyStatus(c.sim, c.u, 'regen', p.dur!, pct(p.regen), c.u)
    c.sim.emit({ t: 'fx', id: 'heal', x: c.u.x, z: c.u.z, unit: c.u.id, color: '#fff2a8' })
  },
  lanceOfLight: (c) => {
    const p = c.def.p
    const len = c.def.range
    const x2 = c.u.x + Math.sin(c.a) * len
    const z2 = c.u.z + Math.cos(c.a) * len
    c.sim.emit({ t: 'fx', id: 'beam', x: c.u.x, z: c.u.z, x2, z2, r: p.width, color: '#fff2a8' })
    let n = 0
    for (const t of c.sim.inLine(1, c.u.x, c.u.z, c.a, len, p.width!, hits)) {
      if (dealDamage(c.sim, c.u, t, pw(c, 'int') * pct(p.dmg), { type: 'holy', spell: true, heavy: true, skill: c.def.id }) > 0) n++
    }
    if (n > 0) heal(c.sim, c.u, c.u.s.maxHp * pct(p.heal) * Math.min(n, 5))
  },
  dawnShield: (c) => {
    const p = c.def.p
    cleanse(c.u)
    addShield(c.u, pw(c, 'cha') * pct(p.shield), p.dur!)
    c.sim.emit({ t: 'fx', id: 'shield', x: c.u.x, z: c.u.z, unit: c.u.id, color: c.def.color })
  },
  dawnSanctuary: (c) => {
    const p = c.def.p
    const ticks = p.dur! / 0.5
    // A `heal` field both mends the hero's side (v per tick) and burns the
    // other side (dmg per tick): `stepFields` already does both.
    addField(c.sim, {
      fx: 'banner', kind: 'heal', src: c.u, x: c.x, z: c.z, r: p.radius!, dur: p.dur!, every: 0.5,
      dmg: (pw(c, 'int') * pct(p.dmg)) / ticks, type: 'holy', v: pw(c, 'cha') * pct(p.heal) * 0.5,
      skill: c.def.id, color: '#fff2a8'
    })
  },
  blindingFlash: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: '#ffffff' })
    c.sim.emit({ t: 'fx', id: 'burst:holy', x: c.u.x, z: c.u.z, r: 2.5, color: '#fff2a8' })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      applyStatus(c.sim, t, 'weaken', p.dur!, pct(p.weaken), c.u, { quiet: true })
      applyStatus(c.sim, t, 'fear', p.fear!, 1, c.u)
    }
  },
  sunfall: (c) => {
    const p = c.def.p
    const x = c.target?.x ?? c.x
    const z = c.target?.z ?? c.z
    c.sim.emit({ t: 'tele', tele: { shape: 'circle', x, z, r: p.radius!, w: 0, a: 0, dur: 0.6, team: 0 } })
    c.sim.emit({ t: 'fx', id: 'fall:holy', x, z, r: p.radius, dur: 0.6, color: '#fff2a8' })
    c.sim.after(0.6, () => {
      c.sim.emit({ t: 'fx', id: 'radiant', x, z, a: 0, color: '#fff2a8' })
      c.sim.emit({ t: 'fx', id: 'burst:holy', x, z, r: p.radius, color: '#fff2a8' })
      for (const t of c.sim.inCircle(1, x, z, p.radius!, hits)) {
        const dealt = dealDamage(c.sim, c.u.alive ? c.u : null, t, pw(c, 'int') * pct(p.dmg), { type: 'holy', spell: true, heavy: true, skill: c.def.id })
        if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'vulnerable', p.dur!, pct(p.vuln), c.u)
      }
    })
  },
  haloOfDawn: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'bastion', x: c.u.x, z: c.u.z, dur: p.dur, color: '#fff2a8', unit: c.u.id })
    const dmg = pw(c, 'int') * pct(p.dmg)
    for (let i = 1; i <= p.dur!; i++) {
      c.sim.after(i, () => {
        if (!c.u.alive) return
        c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: '#fff2a8' })
        heal(c.sim, c.u, c.u.s.maxHp * pct(p.heal), true)
        // The light also mends anything that fights at her side.
        for (const m of c.sim.units) {
          if (m.alive && m.ownerId === c.u.id && m.rank === 'minion') heal(c.sim, m, m.s.maxHp * pct(p.heal), true)
        }
        for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
          dealDamage(c.sim, c.u, t, dmg, { type: 'holy', spell: true, skill: c.def.id })
        }
      })
    }
  },

  // ── Beastcaller ─────────────────────────────────────────────────────────────
  callWolf: (c) => {
    callBeast(c, 'packWolf', c.def.p.max!, -1)
  },
  wolfPounce: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const dmg = pw(c, 'cha') * pct(p.dmg)
    const wolves = c.sim.units.filter(m => m.alive && m.kind === 'packWolf' && m.ownerId === c.u.id && Math.hypot(m.x - t.x, m.z - t.z) < 14)
    if (!wolves.length) {
      // No pack at hand: a spirit wolf leaps from the hero, for half.
      c.sim.emit({ t: 'fx', id: 'dash', x: c.u.x, z: c.u.z, x2: t.x, z2: t.z, color: c.def.color })
      dealDamage(c.sim, c.u, t, dmg * 0.5, { type: 'physical', heavy: true, skill: c.def.id })
      return
    }
    wolves.forEach((w, i) => {
      const ang = angleTo(t.x, t.z, w.x, w.z) + (i - (wolves.length - 1) / 2) * 0.7
      const fromX = w.x
      const fromZ = w.z
      placeNear(c.sim, w, t.x + Math.sin(ang) * (t.r + w.r + 0.2), t.z + Math.cos(ang) * (t.r + w.r + 0.2))
      face(w, t.x, t.z)
      c.sim.emit({ t: 'fx', id: 'dash', x: fromX, z: fromZ, x2: w.x, z2: w.z, color: c.def.color })
      const dealt = dealDamage(c.sim, w, t, dmg, { type: 'physical', heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive && t.rank !== 'boss') applyStatus(c.sim, t, 'knockdown', p.down!, 1, c.u)
      w.targetId = t.id
    })
  },
  callHawk: (c) => {
    const p = c.def.p
    const m = callBeast(c, 'packHawk', 1, p.life!)
    const t = c.target
    if (!m || !t) return
    // It arrives in a dive on the target and marks it for the pack.
    c.sim.emit({ t: 'fx', id: 'dash', x: m.x, z: m.z, x2: t.x, z2: t.z, color: MINIONS.packHawk!.color })
    c.sim.emit({ t: 'fx', id: 'mark', x: t.x, z: t.z, color: c.def.color, unit: t.id, dur: p.dur })
    const dealt = dealDamage(c.sim, m, t, pw(c, 'cha') * pct(p.dmg), { type: 'pierce', heavy: true, skill: c.def.id })
    if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'vulnerable', p.dur!, pct(p.vuln), c.u)
    m.targetId = t.id
  },
  callBear: (c) => {
    const m = callBeast(c, 'packBear', c.def.p.max!, -1)
    if (m) c.sim.emit({ t: 'fx', id: 'roar', x: m.x, z: m.z, r: 4, color: MINIONS.packBear!.color })
  },
  packBond: (c) => {
    const p = c.def.p
    const near = [c.u, ...pack(c).filter(m => Math.hypot(m.x - c.u.x, m.z - c.u.z) <= p.radius!)]
    for (const u of near) {
      applyStatus(c.sim, u, 'regen', p.dur!, pct(p.regen), c.u, { quiet: u !== c.u })
      applyStatus(c.sim, u, 'defenseUp', p.dur!, pct(p.def), c.u, { quiet: true })
      c.sim.emit({ t: 'fx', id: 'buff', x: u.x, z: u.z, unit: u.id, color: c.def.color })
    }
  },
  spiritStampede: (c) => {
    const p = c.def.p
    const len = c.def.range
    const dx = Math.sin(c.a)
    const dz = Math.cos(c.a)
    // Three running lines of spirit beasts.
    for (const off of [-1.2, 0, 1.2]) {
      const ox = dz * off
      const oz = -dx * off
      c.sim.emit({ t: 'fx', id: 'dash', x: c.u.x + ox, z: c.u.z + oz, x2: c.u.x + dx * len + ox, z2: c.u.z + dz * len + oz, color: c.def.color })
    }
    c.sim.emit({ t: 'fx', id: 'slam', x: c.u.x + dx * len * 0.5, z: c.u.z + dz * len * 0.5, r: 3, color: '#c79a5a' })
    for (const t of c.sim.inLine(1, c.u.x, c.u.z, c.a, len, p.width!, hits)) {
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'cha') * pct(p.dmg), { type: 'physical', heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive && t.rank !== 'boss') {
        applyStatus(c.sim, t, 'knockdown', p.down!, 1, c.u)
        // Bowled over along the herd's run.
        knockback(t, t.x - dx, t.z - dz, 6)
      }
    }
  },
  alphaHowl: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const m of pack(c)) {
      applyStatus(c.sim, m, 'enrage', p.dur!, pct(p.rage), c.u, { quiet: true })
      heal(c.sim, m, m.s.maxHp * pct(p.heal))
      c.sim.emit({ t: 'fx', id: 'rage', x: m.x, z: m.z, dur: p.dur, color: c.def.color, unit: m.id })
    }
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) applyStatus(c.sim, t, 'fear', p.fear!, 1, c.u)
  },
  wildHunt: (c) => {
    const p = c.def.p
    for (let i = 0; i < p.wolves!; i++) {
      const ang = (i / p.wolves!) * Math.PI * 2
      const m = spawnMinion(c.sim, 'packWolf', c.u.x + Math.cos(ang) * 2.2, c.u.z + Math.sin(ang) * 2.2, p.dur!)
      if (m) c.sim.emit({ t: 'fx', id: 'summon', x: m.x, z: m.z, color: c.def.color })
    }
    for (const m of pack(c)) {
      heal(c.sim, m, m.s.maxHp, true)
      applyStatus(c.sim, m, 'damageUp', p.dur!, pct(p.dmg), c.u, { quiet: true })
      applyStatus(c.sim, m, 'haste', p.dur!, pct(p.move), c.u, { quiet: true })
    }
    applyStatus(c.sim, c.u, 'haste', p.dur!, pct(p.move), c.u)
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: 6, color: c.def.color })
  },

  // ── Elementalist ────────────────────────────────────────────────────────────
  // ── Elementalist (#95) ────────────────────────────────────────────────────
  prismBolt: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    // The element the target answers to: frost on a burning foe, else fire
    // (which Melts a chilled one). Alternating comes by itself.
    const el: Element = hasStatus(t, 'burn') ? 'frost' : 'fire'
    c.sim.emit({ t: 'fx', id: 'beam', x: c.u.x, z: c.u.z, x2: t.x, z2: t.z, r: 0.45, color: EL_COLOR[el] })
    c.sim.emit({ t: 'fx', id: el === 'fire' ? 'impact:fireball' : 'impact:icicle', x: t.x, z: t.z, color: EL_COLOR[el] })
    const mul = react(c, t, el)
    const dealt = dealDamage(c.sim, c.u, t, pw(c, 'int') * pct(p.dmg) * mul, { type: EL_TYPE[el], spell: true, heavy: mul > 1, skill: c.def.id })
    if (dealt > 0 && t.alive) mark(c, t, el, p.dur!, pct(el === 'fire' ? p.burn : p.slow))
  },
  frostLance: (c) => {
    const p = c.def.p
    const len = c.def.range
    c.sim.emit({ t: 'fx', id: 'beam', x: c.u.x, z: c.u.z, x2: c.u.x + Math.sin(c.a) * len, z2: c.u.z + Math.cos(c.a) * len, r: 0.8, color: EL_COLOR.frost })
    const dmg = pw(c, 'int') * pct(p.dmg)
    for (const t of c.sim.inLine(1, c.u.x, c.u.z, c.a, len, c.def.radius!, hits)) {
      const mul = react(c, t, 'frost')
      const dealt = dealDamage(c.sim, c.u, t, dmg * mul, { type: 'frost', spell: true, heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive) mark(c, t, 'frost', p.dur!, pct(p.slow))
    }
  },
  chainSpark: (c) => {
    const first = c.target
    if (!first) return
    const p = c.def.p
    const struck = new Set<number>()
    let from: Unit = c.u
    let t: Unit | undefined = first
    let dmg = pw(c, 'int') * pct(p.dmg)
    for (let i = 0; i <= p.jumps! && t; i++) {
      const tgt: Unit = t
      const sx = from.x
      const sz = from.z
      const amount = dmg
      struck.add(tgt.id)
      c.sim.after(i * 0.08, () => {
        if (!tgt.alive) return
        c.sim.emit({ t: 'fx', id: 'beam', x: sx, z: sz, x2: tgt.x, z2: tgt.z, r: 0.35, color: EL_COLOR.storm })
        const mul = react(c, tgt, 'storm')
        dealDamage(c.sim, c.u.alive ? c.u : null, tgt, amount * mul, { type: 'beam', spell: true, heavy: mul > 1, skill: c.def.id })
      })
      from = tgt
      dmg *= 1 - pct(p.fall)
      // On to the nearest awake foe within 5 m not struck yet.
      t = undefined
      let bd = 5
      for (const e of c.sim.units) {
        if (!e.alive || e.team !== 1 || !e.awake || struck.has(e.id)) continue
        const d = Math.hypot(e.x - tgt.x, e.z - tgt.z)
        if (d < bd) { bd = d; t = e }
      }
    }
  },
  rollingBoulder: (c) => {
    const p = c.def.p
    const ox = c.u.x
    const oz = c.u.z
    const dx = Math.sin(c.a)
    const dz = Math.cos(c.a)
    const steps = 10
    const dmg = pw(c, 'int') * pct(p.dmg)
    const struck = new Set<number>()
    let stopped = false
    for (let i = 1; i <= steps; i++) {
      c.sim.after(i * 0.07, () => {
        if (stopped) return
        const x = ox + dx * (c.def.range * i) / steps
        const z = oz + dz * (c.def.range * i) / steps
        // A wall stops the boulder where it stands.
        if (isSolidAt(c.sim.grid, x, z)) { stopped = true; c.sim.emit({ t: 'fx', id: 'burst:rock', x, z, r: 1.4, color: EL_COLOR.earth }); return }
        if (i % 2 === 0) c.sim.emit({ t: 'fx', id: 'burst:rock', x, z, r: 1, color: EL_COLOR.earth })
        for (const t of c.sim.inCircle(1, x, z, c.def.radius!, hits)) {
          if (struck.has(t.id)) continue
          struck.add(t.id)
          const mul = react(c, t, 'earth')
          const dealt = dealDamage(c.sim, c.u.alive ? c.u : null, t, dmg * mul, { type: 'physical', spell: true, heavy: true, skill: c.def.id })
          if (dealt > 0 && t.alive && t.rank !== 'boss') {
            applyStatus(c.sim, t, 'knockdown', p.down!, 1, c.u)
            knockback(t, x - dx, z - dz, 4)
          }
        }
      })
    }
  },
  thunderSnow: (c) => {
    const p = c.def.p
    const x = c.x
    const z = c.z
    const ticks = p.dur! / 0.5
    // A 'web' field: frost ticks that chill (stepFields slows 50 % for 1 s each tick).
    addField(c.sim, {
      fx: 'frost', kind: 'web', src: c.u, x, z, r: p.radius!, dur: p.dur!, every: 0.5,
      dmg: (pw(c, 'int') * pct(p.dmg)) / ticks, type: 'frost', skill: c.def.id, color: EL_COLOR.frost
    })
    // Once a second, lightning into the chilled crowd: every strike Shatters.
    const bolt = pw(c, 'int') * pct(p.bolt)
    for (let s = 1; s <= p.dur!; s++) {
      c.sim.after(s - 0.25, () => {
        const inside = c.sim.inCircle(1, x, z, p.radius!, hits)
        if (!inside.length) return
        const t = inside[Math.floor(c.sim.rng() * inside.length)]!
        c.sim.emit({ t: 'fx', id: 'spike', x: t.x, z: t.z, color: EL_COLOR.storm })
        const mul = react(c, t, 'storm')
        dealDamage(c.sim, c.u.alive ? c.u : null, t, bolt * mul, { type: 'beam', spell: true, heavy: true, skill: c.def.id })
      })
    }
  },
  prismaticNova: (c) => {
    const p = c.def.p
    const dmg = pw(c, 'int') * pct(p.dmg)
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      // Each foe gets the element it reacts to: frost on fire (Steam),
      // lightning on ice (Shatter), and fire on the unmarked (it leaves a burn).
      const el: Element = hasStatus(t, 'burn') ? 'frost' : chilled(t) ? 'storm' : 'fire'
      c.sim.emit({ t: 'fx', id: 'beam', x: c.u.x, z: c.u.z, x2: t.x, z2: t.z, r: 0.4, color: EL_COLOR[el] })
      const mul = react(c, t, el)
      const dealt = dealDamage(c.sim, c.u, t, dmg * mul, { type: EL_TYPE[el], spell: true, heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive && el === 'fire') mark(c, t, 'fire', 3, 0.3)
    }
  },
  frostfireComet: (c) => {
    const p = c.def.p
    const x = c.x
    const z = c.z
    c.sim.emit({ t: 'tele', tele: { shape: 'circle', x, z, r: p.radius!, w: 0, a: 0, dur: 0.6, team: 0 } })
    c.sim.emit({ t: 'fx', id: 'fall:meteor', x, z, r: p.radius, dur: 0.6, color: c.def.color })
    c.sim.after(0.6, () => {
      c.sim.emit({ t: 'fx', id: 'burst:meteor', x, z, r: p.radius, color: EL_COLOR.fire })
      c.sim.emit({ t: 'fx', id: 'burst:icicle', x, z, r: p.radius! * 0.8, color: EL_COLOR.frost })
      const dmg = pw(c, 'int') * pct(p.dmg)
      for (const t of c.sim.inCircle(1, x, z, p.radius!, hits)) {
        // A chilled foe Melts first; then everyone is left both burning and chilled,
        // so the next element of any kind sets something off.
        const mul = react(c, t, 'fire')
        const dealt = dealDamage(c.sim, c.u.alive ? c.u : null, t, dmg * mul, { type: 'fire', spell: true, heavy: true, skill: c.def.id })
        if (dealt > 0 && t.alive) {
          mark(c, t, 'fire', p.dur!, pct(p.burn))
          mark(c, t, 'frost', p.dur!, pct(p.slow))
        }
      }
    })
  },
  elementalConvergence: (c) => {
    const p = c.def.p
    const order: Element[] = ['fire', 'frost', 'storm', 'earth']
    const each = pw(c, 'int') * pct(p.dmg)
    c.sim.emit({ t: 'fx', id: 'rage', x: c.u.x, z: c.u.z, dur: p.dur, color: c.def.color, unit: c.u.id })
    for (let i = 0; i < p.strikes!; i++) {
      c.sim.after((i * p.dur!) / p.strikes!, () => {
        if (!c.u.alive) return
        const t = c.sim.nearest(1, c.u.x, c.u.z, c.def.radius!)
        if (!t || !t.awake) return
        // The four orbs take turns, so each strike finds the last one's mark.
        const el = order[i % 4]!
        c.sim.emit({ t: 'fx', id: 'beam', x: c.u.x, z: c.u.z, x2: t.x, z2: t.z, r: 0.5, color: EL_COLOR[el] })
        const mul = react(c, t, el)
        const dealt = dealDamage(c.sim, c.u, t, each * mul, { type: EL_TYPE[el], spell: true, heavy: true, skill: c.def.id })
        if (dealt > 0 && t.alive) mark(c, t, el, 3, el === 'fire' ? 0.3 : 0.4)
      })
    }
  },

  // ── Soul Warden ─────────────────────────────────────────────────────────────
  // ── Soul Warden (#95) ─────────────────────────────────────────────────────
  wispBolt: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const fly = Math.hypot(t.x - c.u.x, t.z - c.u.z) / 18
    c.sim.emit({ t: 'fx', id: 'lob:holy', x: c.u.x, z: c.u.z, x2: t.x, z2: t.z, dur: fly, color: c.def.color })
    c.sim.after(fly, () => {
      if (!t.alive) return
      c.sim.emit({ t: 'fx', id: 'impact:holy', x: t.x, z: t.z, color: c.def.color })
      dealDamage(c.sim, c.u.alive ? c.u : null, t, pw(c, 'int') * pct(p.dmg), { type: 'shadow', spell: true, skill: c.def.id })
      // The wisp that lands the last blow shows the lost soul the way.
      if (!t.alive && soulOf(t)) spawnSpirit(c.sim, t, p.life!)
    })
  },
  callTheFallen: (c) => {
    const p = c.def.p
    // The freshest first: bodies still fading (the sweep takes them at three seconds).
    const bodies = c.sim.units
      .filter(e => !e.alive && e.team === 1 && e.rank !== 'boss' && e.deadT < 3 && Math.hypot(e.x - c.u.x, e.z - c.u.z) <= p.radius!)
      .sort((a, b) => a.deadT - b.deadT)
      .slice(0, p.max!)
    c.sim.emit({ t: 'fx', id: 'harvest', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    if (!bodies.length) { refund(c); return }
    for (const b of bodies) spawnSpirit(c.sim, b, p.life!)
  },
  soulBond: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'drain', x: t.x, z: t.z, x2: c.u.x, z2: c.u.z, color: c.def.color })
    const odds = pct(t.hp < t.s.maxHp * 0.5 ? p.low : p.chance)
    if (soulOf(t) && c.sim.rng() < odds) {
      // Befriended: the foe counts as beaten (reward, group, quests) and its
      // spirit stands up at once on the Warden's side, stronger than a raised one.
      c.sim.emit({ t: 'fx', id: 'mark', x: t.x, z: t.z, unit: t.id, color: c.def.color })
      kill(c.sim, t, null)
      spawnSpirit(c.sim, t, p.life!, 1.3)
      return
    }
    // Not this time: the soul takes fright and runs off for a moment.
    const dealt = dealDamage(c.sim, c.u, t, pw(c, 'int') * pct(p.dmg), { type: 'shadow', spell: true, heavy: true, skill: c.def.id })
    if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'fear', p.fear!, 1, c.u)
  },
  spiritLantern: (c) => {
    const p = c.def.p
    const x = c.x
    const z = c.z
    const ticks = p.dur! / 0.5
    // A 'heal' field: its damage ticks hurt the foes in the light, its heal
    // ticks mend the Warden and his spirits (both handled by stepFields).
    addField(c.sim, {
      fx: 'lantern', kind: 'heal', src: c.u, x, z, r: p.radius!, dur: p.dur!, every: 0.5,
      dmg: (pw(c, 'int') * pct(p.dmg)) / ticks, type: 'shadow', v: c.u.s.maxHp * pct(p.heal) * 0.5,
      skill: c.def.id, color: c.def.color
    })
    // Whoever falls in its light rises.
    for (let s = 0.5; s <= p.dur!; s += 0.5) {
      c.sim.after(s, () => {
        for (const b of c.sim.units) {
          if (b.alive || b.team !== 1 || b.rank === 'boss' || b.deadT > 0.6) continue
          if (Math.hypot(b.x - x, b.z - z) <= p.radius!) spawnSpirit(c.sim, b, p.life!)
        }
      })
    }
  },
  hauntingWail: (c) => {
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      const dealt = dealDamage(c.sim, c.u, t, pw(c, 'int') * pct(p.dmg), { type: 'shadow', spell: true, heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'fear', p.fear!, 1, c.u)
    }
    // Every spirit joins in with a little BOO of its own.
    const band = c.sim.units.filter(m => isSpirit(m, c.u))
    for (const m of band) {
      c.sim.emit({ t: 'fx', id: 'roar', x: m.x, z: m.z, r: 3, color: c.def.color })
      for (const t of c.sim.inCircle(1, m.x, m.z, 3, hits)) applyStatus(c.sim, t, 'fear', p.fear!, 1, c.u)
    }
  },
  releaseSouls: (c) => {
    const p = c.def.p
    const band = c.sim.units.filter(m => isSpirit(m, c.u))
    if (!band.length) { refund(c); return }
    const dmg = pw(c, 'int') * pct(p.dmg)
    for (const m of band) {
      // Home at last: each spirit goes up in a burst of light that hurts foes
      // round it and warms the Warden.
      c.sim.emit({ t: 'fx', id: 'burst:holy', x: m.x, z: m.z, r: p.radius, color: c.def.color })
      for (const t of c.sim.inCircle(1, m.x, m.z, p.radius!, hits)) {
        dealDamage(c.sim, c.u, t, dmg, { type: 'shadow', spell: true, heavy: true, skill: c.def.id })
      }
      heal(c.sim, c.u, c.u.s.maxHp * pct(p.heal))
      m.life = 0.01
    }
  },
  wispSwarm: (c) => {
    const p = c.def.p
    const n = p.wisps!
    const each = (pw(c, 'int') * pct(p.dmg)) / n
    const x = c.x
    const z = c.z
    for (let i = 0; i < n; i++) {
      c.sim.after(i * 0.15, () => {
        const inside = c.sim.inCircle(1, x, z, p.radius!, hits)
        const t = inside.length ? inside[Math.floor(c.sim.rng() * inside.length)]! : null
        const tx = t ? t.x : x + (c.sim.rng() - 0.5) * p.radius!
        const tz = t ? t.z : z + (c.sim.rng() - 0.5) * p.radius!
        c.sim.emit({ t: 'fx', id: 'fall:holy', x: tx, z: tz, dur: 0.35, color: c.def.color })
        c.sim.after(0.35, () => {
          c.sim.emit({ t: 'fx', id: 'impact:holy', x: tx, z: tz, color: c.def.color })
          if (!t || !t.alive) return
          dealDamage(c.sim, c.u.alive ? c.u : null, t, each, { type: 'shadow', spell: true, skill: c.def.id })
          if (!t.alive && soulOf(t)) spawnSpirit(c.sim, t, p.life!)
        })
      })
    }
  },
  processionOfSouls: (c) => {
    const p = c.def.p
    const R = c.def.radius!
    c.sim.emit({ t: 'fx', id: 'rage', x: c.u.x, z: c.u.z, dur: p.dur, color: c.def.color, unit: c.u.id })
    for (let s = 0; s <= p.dur!; s += 0.5) {
      c.sim.after(s, () => {
        if (!c.u.alive) return
        // Every foe down near the Warden rises (at once for the bodies already
        // on the ground), up to the band's limit; the oldest go home to make room.
        for (const b of c.sim.units) {
          if (b.alive || b.team !== 1 || b.rank === 'boss' || b.deadT >= 3) continue
          if (Math.hypot(b.x - c.u.x, b.z - c.u.z) <= R) spawnSpirit(c.sim, b, p.life!)
        }
        for (const m of c.sim.units) if (isSpirit(m, c.u)) applyStatus(c.sim, m, 'damageUp', 0.6, pct(p.atk), c.u, { quiet: true })
      })
    }
  },

  // ── Iron Monk ───────────────────────────────────────────────────────────────
  // ── Iron Monk (#95) ───────────────────────────────────────────────────────
  palmStrike: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'shieldSlam', x: t.x, z: t.z, a: c.a, color: c.def.color, unit: t.id })
    const dealt = dealDamage(c.sim, c.u, t, pw(c, 'dex') * pct(p.dmg), { type: 'physical', heavy: true, skill: c.def.id })
    if (dealt > 0) {
      gainChi(c, p.chi!)
      if (t.alive) knockback(t, c.u.x, c.u.z, 3)
    }
  },
  flyingKick: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const fromX = c.u.x
    const fromZ = c.u.z
    const a = angleTo(fromX, fromZ, t.x, t.z)
    const len = Math.max(0, Math.hypot(t.x - fromX, t.z - fromZ) - t.r - c.u.r - 0.3)
    // Whoever stands in the way is clipped on the way past.
    for (const e of c.sim.inLine(1, fromX, fromZ, a, len, 0.6, hits)) {
      if (e !== t) dealDamage(c.sim, c.u, e, pw(c, 'dex') * pct(p.path), { type: 'physical', skill: c.def.id })
    }
    placeNear(c.sim, c.u, fromX + Math.sin(a) * len, fromZ + Math.cos(a) * len)
    face(c.u, t.x, t.z)
    c.sim.emit({ t: 'fx', id: 'dash', x: fromX, z: fromZ, x2: c.u.x, z2: c.u.z, color: c.def.color })
    const dealt = dealDamage(c.sim, c.u, t, pw(c, 'dex') * pct(p.dmg), { type: 'physical', heavy: true, skill: c.def.id })
    if (dealt > 0) {
      gainChi(c, p.chi!)
      if (t.alive) knockback(t, c.u.x, c.u.z, 4)
    }
    c.h.order.kind = 'attack'
    c.h.order.targetId = t.id
  },
  tigerStance: (c) => {
    const p = c.def.p
    // One stance at a time: the Tiger ends the Crane.
    removeStatus(c.u, 'defenseUp')
    removeStatus(c.u, 'regen')
    applyStatus(c.sim, c.u, 'damageUp', p.dur!, pct(p.dmg), c.u)
    applyStatus(c.sim, c.u, 'attackSpeed', p.dur!, pct(p.speed), c.u, { quiet: true })
    c.sim.emit({ t: 'fx', id: 'rage', x: c.u.x, z: c.u.z, dur: p.dur, color: '#ffb04a', unit: c.u.id })
  },
  craneStance: (c) => {
    const p = c.def.p
    // ...and the Crane ends the Tiger.
    removeStatus(c.u, 'damageUp')
    removeStatus(c.u, 'attackSpeed')
    applyStatus(c.sim, c.u, 'defenseUp', p.dur!, pct(p.def), c.u)
    applyStatus(c.sim, c.u, 'regen', p.dur!, pct(p.regen), c.u, { quiet: true })
    c.sim.emit({ t: 'fx', id: 'buff', x: c.u.x, z: c.u.z, color: c.def.color, unit: c.u.id })
  },
  hundredFists: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const n = p.hits!
    const each = (pw(c, 'dex') * pct(p.dmg)) / n
    for (let i = 0; i < n; i++) {
      c.sim.after((i * p.dur!) / n, () => {
        if (!c.u.alive || !t.alive) return
        // A flurry only lands on a foe still within arm's reach.
        if (Math.hypot(t.x - c.u.x, t.z - c.u.z) > t.r + c.u.r + 1.6) return
        face(c.u, t.x, t.z)
        c.sim.emit({ t: 'fx', id: 'cleave', x: c.u.x, z: c.u.z, r: 1.8, a: angleTo(c.u.x, c.u.z, t.x, t.z), dur: 0.6, color: c.def.color })
        const dealt = dealDamage(c.sim, c.u, t, each, { type: 'physical', heavy: i === n - 1, skill: c.def.id })
        // A bead of chi at the middle and at the end of the flurry.
        if (dealt > 0 && (i + 1) % (n / p.chi!) === 0) gainChi(c, 1)
      })
    }
  },
  risingDragon: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    const chi = spendChi(c)
    c.sim.emit({ t: 'fx', id: 'radiant', x: t.x, z: t.z, a: c.a, color: c.def.color, unit: t.id })
    const dealt = dealDamage(c.sim, c.u, t, pw(c, 'dex') * pct(p.dmg! + p.per! * chi), { type: 'physical', heavy: true, skill: c.def.id })
    if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'knockup', p.up! + 0.2 * chi, 1, c.u)
  },
  whirlwindKick: (c) => {
    const p = c.def.p
    const each = (pw(c, 'dex') * pct(p.dmg)) / 2
    const struck = new Set<number>()
    // Two turns of the kick; the second throws them back.
    for (let k = 0; k < 2; k++) {
      c.sim.after(k * 0.25, () => {
        if (!c.u.alive) return
        c.sim.emit({ t: 'fx', id: 'cleave', x: c.u.x, z: c.u.z, r: p.radius, a: c.u.facing + k * Math.PI, dur: Math.PI, color: c.def.color })
        for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
          const dealt = dealDamage(c.sim, c.u, t, each, { type: 'physical', heavy: k === 1, skill: c.def.id })
          if (dealt > 0) struck.add(t.id)
          if (k === 1 && dealt > 0 && t.alive) knockback(t, c.u.x, c.u.z, 5)
        }
        // A bead per foe kicked, up to three.
        if (k === 1) gainChi(c, Math.min(p.chi!, struck.size))
      })
    }
  },
  mountainPalm: (c) => {
    const p = c.def.p
    const chi = spendChi(c)
    const x = c.x
    const z = c.z
    // At full chi the monk cannot be touched while the palm comes down.
    if (chi >= CHI_MAX) applyStatus(c.sim, c.u, 'invulnerable', 1, 1, c.u)
    c.sim.emit({ t: 'tele', tele: { shape: 'circle', x, z, r: p.radius!, w: 0, a: 0, dur: 0.45, team: 0 } })
    c.sim.emit({ t: 'fx', id: 'petrify', x, z, dur: 0.45, color: c.def.color })
    c.sim.after(0.45, () => {
      c.sim.emit({ t: 'fx', id: 'rupture', x, z, r: p.radius, color: c.def.color })
      const dmg = pw(c, 'dex') * pct(p.dmg! + p.per! * chi)
      for (const t of c.sim.inCircle(1, x, z, p.radius!, hits)) {
        const dealt = dealDamage(c.sim, c.u.alive ? c.u : null, t, dmg, { type: 'physical', heavy: true, skill: c.def.id })
        if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'knockdown', p.down!, 1, c.u)
      }
    })
  },

  // ── Bard ────────────────────────────────────────────────────────────────────
  // ── Bard (#95) ────────────────────────────────────────────────────────────
  sharpNote: (c) => {
    const p = c.def.p
    fire(c.sim, {
      fx: 'holy', src: c.u, tx: c.target?.x ?? c.x, tz: c.target?.z ?? c.z, targetId: c.target?.id, homing: !!c.target,
      speed: 18, dmg: pw(c, 'cha') * pct(p.dmg), type: 'holy', spell: true, skill: c.def.id,
      status: { id: 'weaken', dur: p.dur!, v: pct(p.weaken) }, color: c.def.color
    })
  },
  marchingSong: (c) => {
    const p = c.def.p
    sing(c, p.dur!, p.radius!, (f) => {
      applyStatus(c.sim, f, 'haste', 0.6, pct(p.move), c.u, { quiet: true })
      applyStatus(c.sim, f, 'attackSpeed', 0.6, pct(p.speed), c.u, { quiet: true })
    })
  },
  lullaby: (c) => {
    const p = c.def.p
    const half = ((p.cone! / 2) * Math.PI) / 180
    // A soft wave of notes; whoever it reaches nods off.
    c.sim.emit({ t: 'fx', id: 'breath', x: c.u.x, z: c.u.z, r: c.def.range, a: c.a, dur: half, color: c.def.color })
    for (const t of c.sim.inCone(1, c.u.x, c.u.z, c.a, c.def.range, half, hits)) applyStatus(c.sim, t, 'stun', p.dur!, 1, c.u)
  },
  balladOfValor: (c) => {
    const p = c.def.p
    sing(c, p.dur!, p.radius!, (f) => {
      applyStatus(c.sim, f, 'damageUp', 0.6, pct(p.dmg), c.u, { quiet: true })
      applyStatus(c.sim, f, 'defenseUp', 0.6, pct(p.def), c.u, { quiet: true })
    })
  },
  charmingSerenade: (c) => {
    const t = c.target
    if (!t) return
    const p = c.def.p
    c.sim.emit({ t: 'fx', id: 'mark', x: t.x, z: t.z, unit: t.id, dur: p.dur, color: c.def.color })
    // Charmed: for a while they pick on their own friends (`pickTarget` under confuse).
    for (const e of c.sim.inCircle(1, t.x, t.z, p.radius!, hits)) {
      wakeGroup(c.sim, e)
      applyStatus(c.sim, e, 'confuse', p.dur!, 1, c.u)
    }
  },
  hymnOfMending: (c) => {
    const p = c.def.p
    // The first chord lifts every bad effect from the bard and his allies near him.
    for (const f of c.sim.inCircle(0, c.u.x, c.u.z, p.radius!, hits)) cleanse(f)
    c.sim.emit({ t: 'fx', id: 'heal', x: c.u.x, z: c.u.z, unit: c.u.id, color: c.def.color })
    sing(c, p.dur!, p.radius!, (f) => applyStatus(c.sim, f, 'regen', 0.6, pct(p.regen), c.u, { quiet: true }))
  },
  crescendo: (c) => {
    const p = c.def.p
    const dmg = pw(c, 'cha') * pct(p.dmg! + p.per! * songsPlaying(c.u))
    c.sim.emit({ t: 'fx', id: 'roar', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
    for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
      const dealt = dealDamage(c.sim, c.u, t, dmg, { type: 'holy', spell: true, heavy: true, skill: c.def.id })
      if (dealt > 0 && t.alive) knockback(t, c.u.x, c.u.z, 5)
    }
  },
  grandFinale: (c) => {
    const p = c.def.p
    // Everything at once: a little of every song for the whole band...
    const len = sing(c, p.dur!, p.radius!, (f) => {
      applyStatus(c.sim, f, 'haste', 0.6, pct(p.buff), c.u, { quiet: true })
      applyStatus(c.sim, f, 'damageUp', 0.6, pct(p.buff), c.u, { quiet: true })
      applyStatus(c.sim, f, 'defenseUp', 0.6, pct(p.buff), c.u, { quiet: true })
    })
    // ...and the last chord.
    c.sim.after(len, () => {
      if (!c.u.alive) return
      c.sim.emit({ t: 'fx', id: 'rupture', x: c.u.x, z: c.u.z, r: p.radius, color: c.def.color })
      for (const t of c.sim.inCircle(1, c.u.x, c.u.z, p.radius!, hits)) {
        const dealt = dealDamage(c.sim, c.u, t, pw(c, 'cha') * pct(p.dmg), { type: 'holy', spell: true, heavy: true, skill: c.def.id })
        if (dealt > 0 && t.alive) applyStatus(c.sim, t, 'confuse', p.charm!, 1, c.u)
      }
    })
  }

}

/** Skills that may be thrown at a point when there is no enemy to lock. */
export const FREE_AIM: ReadonlySet<string> = new Set(['fireball', 'aetherPistol', 'stoneSpike', 'galeArrow', 'rimeLance', 'sunbolt', 'prismBolt', 'wispBolt', 'sharpNote'])

export { addShield }
