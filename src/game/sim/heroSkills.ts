import { HEAT_MAX, OVERHEAT_LOCK, type SkillDef } from '../data/skills'
import { MINIONS } from '../data/enemies'
import { cellOf, isSolidAt, isSolidCell, nearestOpen } from './grid'
import { addField, face, fire, raiseWall } from './actors'
import {
  addShield, applyStatus, cleanse, dealDamage, heal, knockback, removeStatus, wakeGroup
} from './combat'
import { spawnMinion } from './spawn'
import { scalePower } from './stats'
import { angleTo, findStatus, hasStatus, type HeroState, type Sim } from './world'
import type { Attr, Unit } from './types'

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
  }
}

/** Skills that may be thrown at a point when there is no enemy to lock. */
export const FREE_AIM: ReadonlySet<string> = new Set(['fireball', 'aetherPistol', 'stoneSpike'])

export { addShield }
