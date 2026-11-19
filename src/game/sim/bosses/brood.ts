import { addField, fire, stride } from '../actors'
import { applyStatus, knockback } from '../combat'
import { isSolidAt } from '../grid'
import { spawnEnemy } from '../spawn'
import type { Sim } from '../world'
import type { Unit } from '../types'
import type { BossScript } from './index'
import { move, other, strikeFor, warn } from './kit'

/**
 * ─── The Brood Mother (Whispering Woods and the other spider ways, #241) — teaches "the quiet ones hit hardest" ───
 *
 * A round of four moves, then a rest in which she fights as any spider does (her venom lob, a bite):
 *
 *   JUMP    she bounces onto the spot the hero stood on (a circle warns), then
 *   RUN     backs away across the clearing, quick, and as she goes
 *   WEBS    lays three webs on the ground between herself and him: for five
 *           seconds anyone standing in one is held to a fifth of his speed.
 *           It buys her the time for
 *   BROOD   a chittering call, and up to six spiderlings crawl out of the
 *           ground round the hero. Each jumps onto him with no warning on the
 *           ground (about three in a hundred of his health apiece): the only
 *           defence is to kill them fast, keep out of the webs, and dodge the
 *           crouch before the jump.
 *
 *   50 %      she spits a web first (a lob that leaves one where it lands), and the call brings six.
 */

const COLOR = '#d9d9ee'
const WEB_R = 2.3
const WEB_DUR = 5
/** The speed a web holds the other team to is a fifth: it slows by this much. */
const WEB_SLOW = 0.8
const FLEE_SECONDS = 1.5
const JUMP_R = 2.4
const SPIT_R = 2.4
const SPIT_FLIGHT = 0.65
/** Most spiderlings alive at once, and what a call brings in each phase. */
const MAX_BROOD = 6
const CALL = [4, 6]
/** Seconds of ordinary fighting between two rounds. */
const REST = [5.5, 3.5]

const hitsBuf: Unit[] = []

const lay = (sim: Sim, u: Unit, x: number, z: number): void => {
  if (isSolidAt(sim.grid, x, z)) return
  addField(sim, { fx: 'web', kind: 'web', src: u, x, z, r: WEB_R, dur: WEB_DUR, every: 0.5, dmg: 0, type: 'physical', v: WEB_SLOW, color: COLOR })
  sim.emit({ t: 'fx', id: 'webLay', x: u.x, z: u.z, x2: x, z2: z, r: WEB_R, color: COLOR })
}

/** The webs she leaves behind her as she backs away: three, between her and the hero. */
const layWebs = (sim: Sim, u: Unit, tgt: Unit): void => {
  const a = Math.atan2(tgt.x - u.x, tgt.z - u.z)
  for (let k = 0; k < 3; k++) {
    const d = 3 + k * 2.4
    const side = (k - 1) * 2.4
    lay(sim, u, u.x + Math.sin(a) * d + Math.cos(a) * side, u.z + Math.cos(a) * d - Math.sin(a) * side)
  }
}

const living = (sim: Sim, u: Unit): number => {
  let n = 0
  for (const m of sim.units) if (m.alive && m.ownerId === u.id && m.kind === 'broodling') n++
  return n
}

/** The brood crawls out of the ground round the hero, and lies stunned a beat as it climbs out. */
const callBrood = (sim: Sim, u: Unit, tgt: Unit, n: number): void => {
  const room = Math.min(n, MAX_BROOD - living(sim, u))
  for (let i = 0; i < room; i++) {
    const ang = (i / Math.max(1, room)) * Math.PI * 2 + sim.rng() * 0.8
    const d = 3.2 + sim.rng() * 2.2
    const x = tgt.x + Math.sin(ang) * d
    const z = tgt.z + Math.cos(ang) * d
    if (isSolidAt(sim.grid, x, z)) continue
    const m = spawnEnemy(sim, 'broodling', x, z, u.group, u)
    if (!m) continue
    m.awake = true
    m.targetId = tgt.id
    applyStatus(sim, m, 'stun', 0.9, 1, null, { quiet: true })
    sim.emit({ t: 'fx', id: 'crawlOut', x, z, r: 1, color: '#8a6a4a' })
  }
}

const brood: BossScript = {
  phases: [0.5],
  think(sim, u, tgt, dt) {
    const b = u.boss!
    // Backing away, quick, while the webs go down.
    if (b.sub === 'flee') {
      b.left -= dt
      const dx = u.x - tgt.x
      const dz = u.z - tgt.z
      stride(sim, u, dx, dz, dt, 1.9)
      u.anim = 'walk'
      if (b.left <= 0) {
        layWebs(sim, u, tgt)
        b.sub = 'call'
        b.next = 0.25
      }
      return true
    }
    if (b.next > 0) return false
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    const ph = Math.min(2, b.phase) - 1
    if (b.sub === 'call') {
      b.sub = 'rest'
      b.next = 0
      warn(sim, u, { shape: 'circle', x: tgt.x, z: tgt.z, r: 6, w: 0, a: 0, dur: 1.3, wind: 1.3 })
      move(sim, u, 'enrage', 1.3, 0.6, tgt)
      sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 4, color: COLOR })
      return true
    }
    if (b.sub === 'rest') {
      // The round is over: a while of plain fighting.
      b.sub = ''
      b.next = REST[ph]!
      return false
    }
    if (b.sub === 'spit') {
      b.sub = ''
      move(sim, u, 'lob', 0.7, 0.5, tgt)
      warn(sim, u, { shape: 'circle', x: tgt.x, z: tgt.z, r: SPIT_R, w: 0, a: 0, dur: 0.7 + SPIT_FLIGHT, wind: 0.7 })
      return true
    }
    // A new round: the bounce (from out of reach), preceded in the second phase by a spit.
    if (d < 3.5) return false
    if (b.phase >= 2 && b.alt === 0) {
      b.alt = 1
      b.sub = 'spit'
      return true
    }
    b.alt = 0
    warn(sim, u, { shape: 'circle', x: tgt.x, z: tgt.z, r: JUMP_R, w: 0, a: 0, dur: 0.7, wind: 0.7 })
    move(sim, u, 'leap', 0.7, 0.4, tgt)
    return true
  },
  land(sim, u, act) {
    const b = u.boss!
    const tgt = sim.live(act.targetId) ?? sim.hero.unit
    if (act.id === 'leap') {
      if (!isSolidAt(sim.grid, act.x, act.z)) { u.x = act.x; u.z = act.z }
      u.px = u.x
      u.pz = u.z
      sim.emit({ t: 'fx', id: 'slam', x: u.x, z: u.z, r: JUMP_R, color: COLOR })
      for (const t of sim.inCircle(other(u), u.x, u.z, JUMP_R, hitsBuf)) { strikeFor(sim, u, t, 1.3, 'physical'); knockback(t, u.x, u.z, 4) }
      b.sub = 'flee'
      b.left = FLEE_SECONDS
    } else if (act.id === 'lob') {
      const x = act.x
      const z = act.z
      fire(sim, { fx: 'web', src: u, tx: x, tz: z, speed: 0, lob: SPIT_FLIGHT, aoe: SPIT_R, dmg: u.s.baseDmg * 0.8, type: 'poison', color: COLOR, heavy: true })
      sim.after(SPIT_FLIGHT, () => { if (u.alive) lay(sim, u, x, z) })
      // The spit is the round's opening: the bounce follows.
      b.next = 0.9
    } else if (act.id === 'enrage') {
      callBrood(sim, u, tgt, CALL[Math.min(1, b.phase - 1)]!)
    }
  },
  onPhase(sim, u) {
    const b = u.boss!
    b.sub = ''
    b.next = 1
    sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 7, color: COLOR })
  }
}

export const BROOD_SCRIPTS: Record<string, BossScript> = { brood }
export const BROOD_TUNING = { WEB_R, WEB_DUR, WEB_SLOW, MAX_BROOD, CALL }
