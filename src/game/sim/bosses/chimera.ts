import { hasLineOfSight, isSolidAt } from '../grid'
import { addField, fire } from '../actors'
import { applyStatus, knockback } from '../combat'
import { spawnEnemy } from '../spawn'
import type { Sim } from '../world'
import type { BossState, Unit } from '../types'
import type { BossScript } from './index'
import { bark, move, other, propAt, raiseProps, strikeFor, warn, windCharge, type ChargeOpts } from './kit'

/**
 * ─── The Chimera (Wildwood, afterplay §5.1) — teaches reading three heads ───
 *
 *   100–60 %  every move comes from one head, and that head GLOWS its colour
 *             for 0.8 s first: the lion (orange) pounces down a lane, the
 *             goat (blue) breathes a cone of frost, the serpent tail (green)
 *             spits a lob that leaves a poison pool. A pounce that meets one
 *             of the clearing's two stone PILLARS dazes it 3 s.
 *   60 %      TWO HEADS GLOW TOGETHER: each head owns a third of the ground
 *             round it (the lion ahead, the goat to its left behind, the
 *             serpent to its right behind) and both glowing thirds burn —
 *             the third whose head stays dark is the safe side.
 *   30 %      THE TAIL IS CUT OFF: a shockwave throws everyone back, the
 *             serpent fights on as a weak snake, and the chimera, lighter,
 *             is a quarter faster. No more poison, no more pairs.
 */

export const HEAD_COLOR = { lion: '#ff9a3a', goat: '#6fc8ff', serpent: '#6ad84a' } as const
type Head = keyof typeof HEAD_COLOR
/** The heads' bits (`BossState.n` holds the pair that glows). */
const BIT: Record<Head, number> = { lion: 1, goat: 2, serpent: 4 }
const HEADS: readonly Head[] = ['lion', 'goat', 'serpent']
/** Where each head owns the ground: its third's middle, off the line to the hero (radians). */
const SECTOR: Record<Head, number> = { lion: 0, goat: (Math.PI * 2) / 3, serpent: -(Math.PI * 2) / 3 }

/** How long a head glows before its move. */
const GLOW = 0.8
/** The pair's glow: a beat longer, there is more to read. */
const TWIN_GLOW = 1.1
const TWIN_R = 7.5
const CONE_R = 6
const CONE_HALF = 0.6
const LOB_R = 2.2
const LOB_FLIGHT = 0.6
const PILLAR_DAZE = 3
/** Faster by a quarter once the tail is gone. */
const TAILLESS = 1.25

const POUNCE: ChargeOpts = {
  speed: 17, max: 11, dmg: 1.6, pinDmg: 0, pinStun: 0, daze: 0, carry: false,
  // Into a pillar: stunned on the stone. The clearing's edge only stops it.
  wallDaze: (sim, x, z) => (propAt(sim, x, z) === 'pillar' ? (sim.emit({ t: 'fx', id: 'quake', x, z, r: 2, color: HEAD_COLOR.lion }), PILLAR_DAZE) : 0)
}

const hitsBuf: Unit[] = []
/** The head that stayed dark last time (never the same safe side twice running). */
const lastDark = new WeakMap<BossState, number>()

/** The head glows: a ring of its colour where it sits on the body. */
const glow = (sim: Sim, u: Unit, head: Head): void => {
  const f = u.facing
  const a = head === 'lion' ? f : head === 'goat' ? f + 0.7 : f + Math.PI - 0.6
  const d = head === 'serpent' ? u.r * 0.9 : u.r * 0.8
  sim.emit({ t: 'fx', id: 'mark', x: u.x + Math.sin(a) * d, z: u.z + Math.cos(a) * d, unit: u.id, color: HEAD_COLOR[head] })
}

/** Is `t` inside the cone from `u` along `a` (half-angle `half`, reach `r`)? */
const inCone = (u: Unit, t: Unit, a: number, half: number, r: number): boolean => {
  const d = Math.hypot(t.x - u.x, t.z - u.z)
  if (d > r + t.r) return false
  if (d < u.r) return true
  let da = Math.atan2(t.x - u.x, t.z - u.z) - a
  da = Math.atan2(Math.sin(da), Math.cos(da))
  return Math.abs(da) <= half + Math.atan2(t.r, d)
}

/** The serpent's lob lands: the poison pool it leaves. */
const pool = (sim: Sim, u: Unit, x: number, z: number): void => {
  if (!u.alive) return
  addField(sim, { fx: 'venom', kind: 'poison', src: u, x, z, r: LOB_R * 0.9, dur: 5, every: 0.5, dmg: u.s.baseDmg * 0.16, type: 'poison', color: HEAD_COLOR.serpent })
}

const chimera: BossScript = {
  phases: [0.6, 0.3],
  arena(sim, u) {
    raiseProps(sim, u, 'pillar', 2, 4.5, 6.5)
  },
  think(sim, u, tgt) {
    const b = u.boss!
    // Its first words, once (no string built every step).
    if (!b.marks.includes('bark:intro')) bark(sim, u, 'chimera', 'intro')
    if (b.next > 0) return false
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    const tail = !b.marks.includes('tailCut')
    const pace = tail ? 1 : 1 / TAILLESS
    // Two heads at once (from 60 %, while it still has three).
    if (b.phase >= 2 && tail && (b.cd.twin ?? 0) <= 0 && d < TWIN_R - 0.5) {
      b.cd.twin = 9
      b.next = 2.4
      const a = Math.atan2(tgt.x - u.x, tgt.z - u.z)
      // The dark head is any of the three; never the same safe side twice running.
      let dark = Math.floor(sim.rng() * 3)
      if (dark === lastDark.get(b)) dark = (dark + 1) % 3
      lastDark.set(b, dark)
      b.n = 0
      for (let k = 0; k < 3; k++) {
        if (k === dark) continue
        const head = HEADS[k]!
        b.n |= BIT[head]
        glow(sim, u, head)
        warn(sim, u, { shape: 'cone', x: u.x, z: u.z, r: TWIN_R, w: Math.PI / 3, a: a + SECTOR[head], dur: TWIN_GLOW, wind: TWIN_GLOW })
      }
      move(sim, u, 'cone', TWIN_GLOW, 0.6, tgt)
      return true
    }
    // The lion pounces at a hero out of reach.
    if ((b.cd.pounce ?? 0) <= 0 && d >= 4 && hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)) {
      b.cd.pounce = 7 * pace
      b.next = 1.8 * pace
      glow(sim, u, 'lion')
      windCharge(sim, u, tgt, GLOW, POUNCE)
      return true
    }
    // The goat breathes on a hero close by.
    if ((b.cd.cone ?? 0) <= 0 && d < CONE_R - 0.5) {
      b.cd.cone = 5.5 * pace
      b.next = 1.6 * pace
      b.n = 0
      const a = Math.atan2(tgt.x - u.x, tgt.z - u.z)
      glow(sim, u, 'goat')
      move(sim, u, 'cone', GLOW, 0.5, tgt)
      warn(sim, u, { shape: 'cone', x: u.x, z: u.z, r: CONE_R, w: CONE_HALF, a, dur: GLOW, wind: GLOW })
      return true
    }
    // The serpent spits at the spot the hero stands on.
    if (tail && (b.cd.lob ?? 0) <= 0 && d < 12) {
      b.cd.lob = 6.5
      b.next = 1.6
      glow(sim, u, 'serpent')
      move(sim, u, 'lob', GLOW, 0.4, tgt)
      warn(sim, u, { shape: 'circle', x: tgt.x, z: tgt.z, r: LOB_R, w: 0, a: 0, dur: GLOW + LOB_FLIGHT, wind: GLOW })
      return true
    }
    return false
  },
  land(sim, u, act) {
    const b = u.boss!
    if (act.id === 'cone') {
      const a = Math.atan2(act.x - u.x, act.z - u.z)
      if (b.n) {
        // The pair: both glowing thirds burn at once.
        for (const head of HEADS) {
          if (!(b.n & BIT[head])) continue
          const ha = a + SECTOR[head]
          sim.emit({ t: 'fx', id: 'breath', x: u.x, z: u.z, a: ha, r: TWIN_R, dur: Math.PI / 3, color: HEAD_COLOR[head] })
          for (const t of sim.inCircle(other(u), u.x, u.z, TWIN_R + 1, hitsBuf)) {
            if (!inCone(u, t, ha, Math.PI / 3, TWIN_R)) continue
            strikeFor(sim, u, t, 1.5, head === 'goat' ? 'frost' : head === 'serpent' ? 'poison' : 'physical')
            if (head === 'goat') applyStatus(sim, t, 'slow', 2.5, 0.45, u)
            else if (head === 'serpent') applyStatus(sim, t, 'poison', 4, u.s.baseDmg * 0.15, u, { type: 'poison' })
            else knockback(t, u.x, u.z, 6)
          }
        }
        b.n = 0
        return
      }
      // The goat's frost.
      sim.emit({ t: 'fx', id: 'breath', x: u.x, z: u.z, a, r: CONE_R, dur: CONE_HALF, color: HEAD_COLOR.goat })
      for (const t of sim.inCircle(other(u), u.x, u.z, CONE_R + 1, hitsBuf)) {
        if (!inCone(u, t, a, CONE_HALF, CONE_R)) continue
        strikeFor(sim, u, t, 1.4, 'frost')
        applyStatus(sim, t, 'slow', 2.5, 0.45, u)
      }
    } else if (act.id === 'lob') {
      // The serpent's spit: it flies, splashes, and the pool stays.
      const x = act.x
      const z = act.z
      fire(sim, {
        fx: 'venom', src: u, tx: x, tz: z, speed: 0, lob: LOB_FLIGHT, aoe: LOB_R, dmg: u.s.baseDmg * 1.2,
        type: 'poison', color: HEAD_COLOR.serpent, heavy: true
      })
      sim.after(LOB_FLIGHT, () => pool(sim, u, x, z))
    }
  },
  onPhase(sim, u, phase) {
    const b = u.boss!
    if (phase === 2) {
      sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 7, color: HEAD_COLOR.lion })
      b.cd.twin = 1.2
      bark(sim, u, 'chimera', 'twin')
      return
    }
    if (phase !== 3) return
    // The tail is cut off: a shockwave, and the serpent fights on alone.
    b.marks.push('tailCut')
    let tx = u.x - Math.sin(u.facing) * u.r * 1.4
    let tz = u.z - Math.cos(u.facing) * u.r * 1.4
    if (isSolidAt(sim.grid, tx, tz)) { tx = u.x; tz = u.z }
    sim.emit({ t: 'fx', id: 'quake', x: u.x, z: u.z, r: 5, color: HEAD_COLOR.serpent })
    for (const t of sim.inCircle(other(u), u.x, u.z, 5, hitsBuf)) knockback(t, u.x, u.z, 8)
    const snake = spawnEnemy(sim, 'chimeraTail', tx, tz, u.group, u)
    if (snake) {
      snake.awake = true
      snake.targetId = sim.hero.unit.id
      sim.emit({ t: 'fx', id: 'summon', x: snake.x, z: snake.z, color: HEAD_COLOR.serpent })
    }
    u.s.moveSpeed *= TAILLESS
    u.s.attackSpeed *= TAILLESS
    bark(sim, u, 'chimera', 'tail')
  }
}

export const CHIMERA_SCRIPTS: Record<string, BossScript> = { chimera }
export const CHIMERA_TUNING = { GLOW, TWIN_GLOW, TWIN_R, SECTOR, PILLAR_DAZE, TAILLESS, POUNCE }
