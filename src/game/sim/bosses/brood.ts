import { addField, face, fire, stop, stride } from '../actors'
import { applyStatus, knockback } from '../combat'
import { hasLineOfSight, isSolidAt } from '../grid'
import { spawnEnemy } from '../spawn'
import type { Sim } from '../world'
import type { Unit } from '../types'
import type { BossScript } from './index'
import { move, other, strikeFor, warn } from './kit'

/**
 * ─── The Brood Mother (Whispering Woods and the other spider ways, #241) — teaches "the quiet ones hit hardest" ───
 *
 * She holds her own arena on the Woods' main road, just before the Elder Treant, and a trail of webs from the entry leads to it.
 * A round of four moves, a perch, then a rest in which she fights as any spider does (her venom lob, a bite):
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
 *   PERCH   after the call she holds back at a distance and, while ALL her brood is alive, spits webs at the hero from afar (one
 *           every few seconds, at most nine seconds): kill a spiderling, come close, or wait it out and she comes in. She never
 *           runs again until the next round.
 *
 *   50 %      she spits a web first (a lob that leaves one where it lands), and the call brings six.
 */

const COLOR = '#d9d9ee'
/** The webs along the road to her arena: how much they slow whoever walks in them. */
export const WEB_TRAIL_SLOW = 0.4
/** The perch: at most this many seconds, a spit every PERCH_SPIT seconds, from at least PERCH_MIN metres. */
const PERCH_SECONDS = 9
const PERCH_SPIT = 3.2
const PERCH_MIN = 4.5
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

/** The brood crawls out of the ground round the hero, and lies stunned a beat as it climbs out. Returns how many came. */
const callBrood = (sim: Sim, u: Unit, tgt: Unit, n: number): number => {
  let came = 0
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
    came++
  }
  return came
}

/** The chittering call: a ring round the hero warns where the brood will climb out. */
const startCall = (sim: Sim, u: Unit, tgt: Unit): void => {
  const b = u.boss!
  b.sub = 'calling'
  b.cd.calling = 3
  b.next = 0
  warn(sim, u, { shape: 'circle', x: tgt.x, z: tgt.z, r: 6, w: 0, a: 0, dur: 1.3, wind: 1.3 })
  move(sim, u, 'enrage', 1.3, 0.6, tgt)
  sim.emit({ t: 'fx', id: 'roar', x: u.x, z: u.z, r: 4, color: COLOR })
}

const brood: BossScript = {
  phases: [0.5],
  think(sim, u, tgt, dt) {
    const b = u.boss!
    // Backing away, quick, while the webs go down.
    if (b.sub === 'flee') {
      b.left -= dt
      // Away from him; if she landed right on him, away from where she faces.
      let dx = u.x - tgt.x
      let dz = u.z - tgt.z
      if (Math.hypot(dx, dz) < 0.5) { dx = -Math.sin(u.facing); dz = -Math.cos(u.facing) }
      stride(sim, u, dx, dz, dt, 2.6)
      u.anim = 'walk'
      if (b.left <= 0) {
        layWebs(sim, u, tgt)
        startCall(sim, u, tgt)
      }
      return true
    }
    const d = Math.hypot(tgt.x - u.x, tgt.z - u.z)
    // The perch: holding back, spitting, for as long as every spiderling she called is alive.
    if (b.sub === 'perch') {
      if ((b.cd.perch ?? 0) <= 0 || living(sim, u) < b.n || d < PERCH_MIN - 1) { b.sub = 'rest'; b.next = 0; return false }
      stop(u)
      face(u, tgt.x, tgt.z)
      u.anim = 'idle'
      if ((b.cd.perchSpit ?? 0) > 0 || d < PERCH_MIN || !hasLineOfSight(sim.grid, u.x, u.z, tgt.x, tgt.z)) return true
      b.cd.perchSpit = PERCH_SPIT
      move(sim, u, 'lob', 0.85, 0.5, tgt)
      warn(sim, u, { shape: 'circle', x: tgt.x, z: tgt.z, r: SPIT_R, w: 0, a: 0, dur: 0.85 + SPIT_FLIGHT, wind: 0.85 })
      return true
    }
    if (b.next > 0) return false
    const ph = Math.min(2, b.phase) - 1
    // (A call that was cut short by a stun must not hold the round for good.)
    if (b.sub === 'calling') { if ((b.cd.calling ?? 0) <= 0) b.sub = 'rest'; return false }
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
      // The opening spit of the second phase is followed by the bounce; a perched spit is not.
      if (b.sub !== 'perch') b.next = 0.9
    } else if (act.id === 'enrage') {
      const came = callBrood(sim, u, tgt, CALL[Math.min(1, b.phase - 1)]!)
      // Then she holds back and spits, while all of them live.
      b.sub = came > 0 ? 'perch' : 'rest'
      b.n = came
      b.cd.perch = PERCH_SECONDS
      b.cd.perchSpit = 1.4
      b.next = 0
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
