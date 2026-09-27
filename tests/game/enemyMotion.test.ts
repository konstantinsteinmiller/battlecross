// The machines' idle and walk animation (models/motion.ts, the motion layer of
// the pose functions in models/enemies.ts, `stepMotion` in sim/enemies.ts),
// asserted headless against the REAL sim: createEnemy / updateEnemy /
// syncEnemyVisual on an open-field nav, no GPU.
//
// What it replaced (measured before the change): idle machines stood frozen
// in an A-pose (the Guardroid's fists 11.5° out, the trooper's gun arm 10.3°
// out, 0° forward, 0° of motion over 2 s); a strafing trooper slid at 0.8 m/s
// with `walk` at 0.017 and frozen legs; walking feet skated 85–96 % of the
// distance covered; the roller's wheel jumped 7 rad per tick. And the old
// pose calls (ModelLab's turntables and its store-art shots) must still render
// byte-for-byte as before — the motion layer is opt-in.

import { beforeEach, describe, expect, it, vi } from 'vitest'

// The blob shadow and the telegraph ring draw canvas textures (no 2D canvas
// under jsdom); plain objects stand in.
vi.mock('@/game/fx/markers', async () => {
  const { Mesh, Group } = await import('three')
  return { makeBlobShadow: () => new Mesh(), makeTeleRing: () => new Group(), setTeleRing: () => {} }
})

import { Matrix4, Quaternion, Vector3 } from 'three'
import {
  createEnemy, updateEnemy, syncEnemyVisual, stepMotion, UNAWARE_TROOPER_GUARD
} from '@/game/sim/enemies'
import { createBoss } from '@/game/sim/bosses'
import {
  buildEnemyRig, poseHardhat, poseTrooper, poseHeli, poseHopper, poseRoller, poseBrute, poseTurret,
  HARDHAT_IDLE_PEEK, type EnemyKind
} from '@/game/models/enemies'
import {
  newMotion, FIDGET_LEN, GAIT, cycleLen, swingA, fidgetEnv, hopSquash, frac, ROLLER_R, TAU, type EnemyMotion
} from '@/game/models/motion'
import { pose, nudge, scaleBone, type Rig } from '@/game/models/kit'
import { createNav } from '@/game/world/nav'
import type { MapData } from '@/game/world/levelGen'
import type { Enemy, World } from '@/game/sim/world'

const KINDS: EnemyKind[] = ['hardhat', 'trooper', 'heli', 'hopper', 'roller', 'brute', 'turret']
const DT = 1 / 60
const DEG = 180 / Math.PI

// ─── Harness ────────────────────────────────────────────────────────────────

/** A 120 m open field: the real nav functions, no walls. */
const openWorld = (enemies: Enemy[]): World => {
  const W = 40
  const map = { w: W, h: W, cell: new Uint8Array(W * W).fill(1), pillars: [], room: new Int16Array(W * W), rooms: [] } as unknown as MapData
  const noop = (): void => {}
  return {
    map, nav: createNav(map), time: 0,
    player: { x: 60, z: 115, yaw: 0, pitch: 0 },
    combat: { iframes: 1e9 } as World['combat'],
    enemies,
    fx: { sparks: noop, emit: noop, orbBurst: noop } as unknown as World['fx'],
    markers: { spawn: noop } as unknown as World['markers'],
    shocks: { spawn: noop } as unknown as World['shocks'],
    fireEnemyShot: noop, lobShell: noop, spawnWave: noop, spawnRing: noop, fireOrb: noop,
    hitPlayer: () => 'miss', shake: noop, sfx: noop
  }
}

/** A machine at (60, 30) facing +Z, with a deterministic motion record. */
const spawn = (kind: EnemyKind, seed = 777): { w: World; e: Enemy } => {
  const e = createEnemy(kind, 1, 60, 30, 0)
  e.yaw = 0
  e.anim = 3.1
  e.mo = newMotion(seed, kind)
  e.mo.pyaw = 0
  return { w: openWorld([e]), e }
}

/** Awake and moving, attacks held off. */
const engage = (e: Enemy): void => {
  e.state = 'engage'
  e.awake = true
  e.cd = 999
}

const tick = (w: World, e: Enemy, n = 1, dt = DT): void => {
  for (let i = 0; i < n; i++) {
    w.time += dt
    updateEnemy(w, e, dt)
    syncEnemyVisual(e, 1, w.time)
  }
}

/** Every bone's local transform, flattened. */
const snap = (rig: Rig): number[] => {
  const out: number[] = []
  for (const b of Object.values(rig.bones)) {
    out.push(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w, b.position.x, b.position.y, b.position.z, b.scale.x, b.scale.y, b.scale.z)
  }
  return out
}

/** Upper-arm angles in the rig's own frame: sideways off the body (+ = out),
 *  forward, and the elbow's bend. */
const armAngles = (rig: Rig, side: 'L' | 'R'): { outward: number; forward: number; elbow: number } => {
  rig.root.updateMatrixWorld(true)
  const inv = new Matrix4().copy(rig.root.matrixWorld).invert()
  const s = rig.bones[`shoulder${side}`]!.getWorldPosition(new Vector3()).applyMatrix4(inv)
  const el = rig.bones[`elbow${side}`]!.getWorldPosition(new Vector3()).applyMatrix4(inv)
  const hand = rig.bones[`elbow${side}`]!.localToWorld(new Vector3(0, -0.3, 0)).applyMatrix4(inv)
  const up = el.clone().sub(s).normalize()
  const fore = hand.sub(el).normalize()
  const sgn = side === 'L' ? -1 : 1
  return {
    outward: Math.atan2(up.x * sgn, -up.y) * DEG,
    forward: Math.atan2(up.z, -up.y) * DEG,
    elbow: Math.acos(Math.min(1, up.dot(fore))) * DEG
  }
}

/** Seeded [0, 1) stream for the fuzz cases. */
const rng = (seed: number) => () => {
  seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0
  seed ^= seed >>> 13
  return (seed >>> 0) / 4294967296
}

// The AI rolls Math.random (cooldowns, aim jitter, the Guardroid's slam, the
// spawn's facing): every test replays ONE fixed run, so a result never
// depends on the run.
beforeEach(() => {
  const dice = vi.spyOn(Math, 'random').mockImplementation(rng(0x5eed))
  return () => dice.mockRestore()
})

/** A motion record in a random (possibly extreme) state. */
const randomMotion = (kind: EnemyKind, r: () => number): EnemyMotion => {
  const m = newMotion(Math.floor(r() * 1e6), kind)
  const n = FIDGET_LEN[kind].length
  m.walk = r() < 0.2 ? 0 : r() < 0.3 ? 1 : r()
  m.stride = r() * 1e6
  m.pstride = m.stride
  m.phase = r() < 0.1 ? 1e6 : r() * 1e4
  m.fwd = r() < 0.1 ? 0 : r() * 2 - 1
  m.side = r() < 0.1 ? 0 : r() * 2 - 1
  m.turn = (r() * 2 - 1) * 20
  m.roll = (r() * 2 - 1) * 1e5
  m.heading = (r() * 2 - 1) * 2
  m.hop = r() * 0.3
  m.calm = r() < 0.3 ? 1 : r() < 0.3 ? 0 : r()
  m.startle = r()
  m.fid = Math.floor(r() * (n + 1))
  m.fidT = m.fid ? r() * FIDGET_LEN[kind][m.fid - 1]! : 0
  m.look = r() * 2 - 1
  m.tilt = (r() * 2 - 1) * 1.2
  m.armL = r() * 2 - 1
  m.armR = r() * 2 - 1
  m.slam = r() * 1.4 - 0.4
  return m
}

/** Pose one kind with the motion layer the way an unaware machine is posed:
 *  no attack in play (hidden hardhat, shield up, no aim, no squash…). */
const poseIdle = (kind: EnemyKind, rig: Rig, m: EnemyMotion, t: number): void => {
  switch (kind) {
    case 'hardhat': poseHardhat(rig, 0, t, m.walk, m); break
    case 'trooper': poseTrooper(rig, 1, 0, t, m.walk, m); break
    case 'heli': poseHeli(rig, t, m.tilt, t * 28, m); break
    case 'hopper': poseHopper(rig, 0, t, m); break
    case 'roller': poseRoller(rig, 0, t, m.tilt, m); break
    case 'brute': poseBrute(rig, t, m.walk, 0, 0, 0, m); break
    case 'turret': poseTurret(rig, 0.35, 0, m); break
  }
}

/** Pose one kind with the motion layer, with random attack params. */
const poseWith = (kind: EnemyKind, rig: Rig, m: EnemyMotion, r: () => number): void => {
  const t = r() < 0.1 ? 1e5 : r() * 100
  switch (kind) {
    case 'hardhat': poseHardhat(rig, r(), t, m.walk, m); break
    case 'trooper': poseTrooper(rig, r(), r(), t, m.walk, m); break
    case 'heli': poseHeli(rig, t, m.tilt, r() * 1e5, m); break
    case 'hopper': poseHopper(rig, r() * 2 - 1, t, m); break
    case 'roller': poseRoller(rig, (r() * 2 - 1) * 1e4, t, m.tilt, m); break
    case 'brute': poseBrute(rig, t, m.walk, 0, 0, m.slam, m); break
    case 'turret': poseTurret(rig, r(), r(), m); break
  }
}

// ─── Legacy oracles: the pose functions exactly as they were before ─────────

const LEGACY = {
  hardhat: (rig: Rig, peek: number, t: number, walk: number): void => {
    const k = Math.max(0, Math.min(1, peek))
    nudge(rig, 'helmet', 0, -0.26 * (1 - k) + 0.12 * k, -0.04 * k)
    pose(rig, 'helmet', -0.35 * k, 0, Math.sin(t * 9) * 0.04 * walk)
    scaleBone(rig, 'body', 1, 0.45 + 0.55 * k, 1)
    nudge(rig, 'body', 0, -0.12 * (1 - k), 0)
    const w = Math.sin(t * 12) * walk
    nudge(rig, 'footL', 0, Math.max(0, w) * 0.05, 0)
    nudge(rig, 'footR', 0, Math.max(0, -w) * 0.05, 0)
  },
  trooper: (rig: Rig, guard: number, aim: number, t: number, walk: number): void => {
    const w = Math.sin(t * 8) * walk
    pose(rig, 'hipL', w * 0.5, 0, 0)
    pose(rig, 'hipR', -w * 0.5, 0, 0)
    pose(rig, 'kneeL', Math.max(0, -w) * 0.6, 0, 0)
    pose(rig, 'kneeR', Math.max(0, w) * 0.6, 0, 0)
    nudge(rig, 'hips', 0, Math.abs(w) * 0.03 + Math.sin(t * 2) * 0.008, 0)
    pose(rig, 'shoulderL', -1.35 * guard - 0.1, 0.35 * guard, -0.25 + 0.45 * guard)
    pose(rig, 'elbowL', -0.4 * guard, 0, 0)
    pose(rig, 'shoulderR', -1.5 * aim - 0.05, 0, 0.18 - 0.15 * aim)
    pose(rig, 'elbowR', -0.15 * aim - 0.2 * (1 - aim), 0, 0)
    pose(rig, 'head', -0.1 * aim, 0, 0)
    pose(rig, 'chest', 0.05 * guard, 0.15 * aim, 0)
  },
  heli: (rig: Rig, t: number, tilt: number, spin: number): void => {
    pose(rig, 'rotor', 0, spin, 0)
    pose(rig, 'body', tilt, 0, Math.sin(t * 2.3) * 0.08)
    pose(rig, 'clawL', Math.sin(t * 3) * 0.2 - tilt * 0.8, 0, -0.2)
    pose(rig, 'clawR', Math.sin(t * 3 + 1) * 0.2 - tilt * 0.8, 0, 0.2)
  },
  hopper: (rig: Rig, squash: number, t: number): void => {
    const s = Math.max(-1, Math.min(1, squash))
    scaleBone(rig, 'legL', 1, 1 + s * 0.35, 1)
    scaleBone(rig, 'legR', 1, 1 + s * 0.35, 1)
    scaleBone(rig, 'body', 1 - s * 0.08, 1 + s * 0.1, 1 - s * 0.08)
    nudge(rig, 'hips', 0, s * 0.22 + Math.sin(t * 2.5) * 0.01, 0)
  },
  roller: (rig: Rig, wheelAngle: number, t: number, lean: number): void => {
    pose(rig, 'wheel', wheelAngle, 0, 0)
    pose(rig, 'driver', lean * 0.35, 0, Math.sin(t * 6) * 0.05)
    nudge(rig, 'driver', 0, Math.abs(Math.sin(t * 10)) * 0.03 * Math.min(1, Math.abs(lean) + 0.2), 0)
  },
  brute: (rig: Rig, t: number, walk: number, arm: number, k: number, slam: number): void => {
    const w = Math.sin(t * 5.5) * walk
    pose(rig, 'hipL', w * 0.4, 0, 0)
    pose(rig, 'hipR', -w * 0.4, 0, 0)
    pose(rig, 'kneeL', Math.max(0, -w) * 0.5, 0, 0)
    pose(rig, 'kneeR', Math.max(0, w) * 0.5, 0, 0)
    nudge(rig, 'hips', 0, Math.abs(w) * 0.05 - slam * 0.25, 0)
    const throwL = arm < 0 ? k : 0
    const throwR = arm > 0 ? k : 0
    pose(rig, 'shoulderL', -1.4 * Math.max(0, throwL) + 0.6 * Math.max(0, -throwL) - 2.6 * slam, 0, -0.2)
    pose(rig, 'shoulderR', -1.4 * Math.max(0, throwR) + 0.6 * Math.max(0, -throwR) - 2.6 * slam, 0, 0.2)
    pose(rig, 'elbowL', -0.9 + 0.8 * Math.max(0, throwL), 0, 0)
    pose(rig, 'elbowR', -0.9 + 0.8 * Math.max(0, throwR), 0, 0)
    pose(rig, 'chest', 0.2 * slam, -0.35 * throwL + 0.35 * throwR, 0)
  },
  turret: (rig: Rig, pitch: number, recoil: number): void => {
    pose(rig, 'barrel', -pitch, 0, 0)
    nudge(rig, 'barrel', 0, 0, -recoil * 0.15)
  }
}

const rigs = new Map<EnemyKind, Rig[]>()
/** Two fresh rigs of a kind (built once per kind: rig builds are the slow part). */
const pair = (kind: EnemyKind): [Rig, Rig] => {
  let rs = rigs.get(kind)
  if (!rs) {
    rs = [buildEnemyRig(kind), buildEnemyRig(kind)]
    rigs.set(kind, rs)
  }
  for (const r of rs) {
    for (const n of Object.keys(r.bones)) {
      pose(r, n)
      nudge(r, n)
      scaleBone(r, n, 1)
    }
  }
  return [rs[0]!, rs[1]!]
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('enemy motion: pose functions', () => {
  it('stay finite for any motion state and attack params (every kind, extremes included)', () => {
    const r = rng(2026)
    for (const kind of KINDS) {
      const [rig] = pair(kind)
      for (let i = 0; i < 300; i++) {
        poseWith(kind, rig, randomMotion(kind, r), r)
        for (const b of Object.values(rig.bones)) {
          const q = b.quaternion
          const v = [q.x, q.y, q.z, q.w, b.position.x, b.position.y, b.position.z, b.scale.x, b.scale.y, b.scale.z]
          expect(v.every(Number.isFinite), `${kind} ${b.name}`).toBe(true)
          expect(Math.abs(Math.hypot(q.x, q.y, q.z, q.w) - 1)).toBeLessThan(1e-9)
        }
      }
    }
  })

  it('without the motion argument render byte-for-byte as before (ModelLab, store art)', () => {
    // The dev bench's turntable calls and the store-cover shots' calls
    const cases: Array<[EnemyKind, number[]]> = [
      ['hardhat', [1, 0, 0]], ['hardhat', [0.5 + 0.5 * Math.sin(2.3), 7.7, 0]], ['hardhat', [0.3, 13.2, 0.8]],
      ['trooper', [0.5, 0.5, 1.3, 0.3]], ['trooper', [1, 0, 0, 0]], ['trooper', [0.4, 0.6, 0, 0]], ['trooper', [0, 1, 99.1, 1]],
      ['heli', [0.6, 0.12, 0.5]], ['heli', [0.6, 0.37, 0.5]], ['heli', [7.1, 0.1, 177.5]],
      ['hopper', [Math.sin(2), 1]], ['hopper', [-0.2, 0]], ['hopper', [1, 0]],
      ['roller', [3.9, 1.3, 0.4]], ['roller', [-12, 88, -0.5]],
      ['brute', [0, 0, 1, 0, 0]], ['brute', [0, 0, 1, 0, 0.6]], ['brute', [0, 0, 1, 0.4, 0]], ['brute', [3.3, 0.2, -1, -0.7, 0]], ['brute', [5, 1, 1, 1, 1]],
      ['turret', [0.2, 0]], ['turret', [0.15, 0]], ['turret', [0.35, 1]]
    ]
    const NEW = { hardhat: poseHardhat, trooper: poseTrooper, heli: poseHeli, hopper: poseHopper, roller: poseRoller, brute: poseBrute, turret: poseTurret }
    for (const [kind, args] of cases) {
      const [a, b] = pair(kind)
      ;(LEGACY[kind] as (r: Rig, ...x: number[]) => void)(a, ...args)
      ;(NEW[kind] as (r: Rig, ...x: number[]) => void)(b, ...args)
      expect(snap(b), `${kind} ${args.join(',')}`).toEqual(snap(a))
    }
  })

  it('leave no bone state behind: pose(A) then pose(B) equals pose(B) alone', () => {
    const r = rng(99)
    for (const kind of KINDS) {
      const [a, b] = pair(kind)
      for (let i = 0; i < 40; i++) {
        const mA = randomMotion(kind, r)
        const mB = randomMotion(kind, r)
        const s = Math.floor(r() * 1e9)
        poseWith(kind, a, mA, rng(s + 1))
        poseWith(kind, a, mB, rng(s))
        poseWith(kind, b, mB, rng(s))
        expect(snap(a), kind).toEqual(snap(b))
      }
    }
  })

  it('every idle fidget starts and ends exactly at the no-fidget pose', () => {
    expect(fidgetEnv(0)).toBe(0)
    expect(fidgetEnv(1)).toBe(0)
    const r = rng(7)
    for (const kind of KINDS) {
      const [a, b] = pair(kind)
      for (let id = 1; id <= FIDGET_LEN[kind].length; id++) {
        const len = FIDGET_LEN[kind][id - 1]!
        for (let i = 0; i < 6; i++) {
          // An unaware machine standing still (fidgets only play then)
          const base = randomMotion(kind, r)
          Object.assign(base, { calm: 1, walk: 0, startle: 0, fid: 0, fidT: 0, hop: 0, armL: 0, armR: 0, slam: 0 })
          const t = r() * 100
          poseIdle(kind, a, base, t)
          const ref = snap(a)
          for (const at of [0, len]) {
            poseIdle(kind, b, { ...base, fid: id, fidT: at }, t)
            const got = snap(b)
            for (let j = 0; j < ref.length; j++) expect(got[j]!, `${kind} fidget ${id} at ${at}`).toBeCloseTo(ref[j]!, 12)
          }
          // …and does something visible in between
          let most = 0
          for (const q of [0.2, 0.3, 0.45, 0.62]) {
            poseIdle(kind, b, { ...base, fid: id, fidT: len * q }, t)
            const mid = snap(b)
            most = Math.max(most, ...mid.map((v, j) => Math.abs(v - ref[j]!)))
          }
          expect(most, `${kind} fidget ${id} moves`).toBeGreaterThan(1e-3)
        }
      }
    }
  })

  it('hop squash is continuous through a whole hop and zero at both ends', () => {
    expect(hopSquash(0)).toBe(0)
    expect(Math.abs(hopSquash(0.9999))).toBeLessThan(1e-3)
    let prev = hopSquash(0)
    for (let b = 0.001; b < 1; b += 0.001) {
      const v = hopSquash(b)
      expect(Math.abs(v - prev)).toBeLessThan(0.02)
      prev = v
    }
  })
})

describe('enemy motion: idle', () => {
  it('no machine idles in the A-pose any more: arms forward, bent and alive', () => {
    for (const kind of ['trooper', 'brute'] as const) {
      const { w, e } = spawn(kind)
      const sides: Array<'L' | 'R'> = kind === 'brute' ? ['L', 'R'] : ['R']
      const first: Record<string, Vector3> = {}
      const moved: Record<string, number> = {}
      for (let i = 0; i < 360; i++) {
        tick(w, e)
        if (i % 6) continue
        for (const side of sides) {
          const a = armAngles(e.rig, side)
          // The old rests: brute 11.5° out / 0° forward, trooper gun 10.3° out / 0° forward
          expect(a.outward, `${kind} ${side} outward`).toBeLessThanOrEqual(8)
          expect(a.forward, `${kind} ${side} forward`).toBeGreaterThanOrEqual(8)
          expect(a.elbow, `${kind} ${side} elbow`).toBeGreaterThanOrEqual(20)
          e.rig.root.updateMatrixWorld(true)
          const dir = e.rig.bones[`elbow${side}`]!.getWorldPosition(new Vector3()).sub(e.rig.bones[`shoulder${side}`]!.getWorldPosition(new Vector3())).normalize()
          const f = first[side] ??= dir.clone()
          moved[side] = Math.max(moved[side] ?? 0, Math.acos(Math.min(1, f.dot(dir))) * DEG)
        }
      }
      expect(e.state).toBe('idle')
      for (const side of sides) expect(moved[side], `${kind} ${side} arm is alive`).toBeGreaterThan(1.5)
    }
  })

  it('the trooper lowers its shield to fire at its side, edge-on — not the old 14°-out arm', () => {
    const [rig] = pair('trooper')
    const m = newMotion(5, 'trooper')
    m.calm = 0
    for (const t of [0, 0.7, 2.9]) {
      poseTrooper(rig, 0, 1, t, 0, m)
      expect(armAngles(rig, 'L').outward).toBeLessThanOrEqual(9)
      // The disc (its normal is the forearm's +Z) turns edge-on to the front,
      // so the open torso reads at a glance
      rig.root.updateMatrixWorld(true)
      const n = new Vector3(0, 0, 1).applyQuaternion(rig.bones.elbowL!.getWorldQuaternion(new Quaternion()))
      expect(Math.abs(n.z), 'disc faces sideways').toBeLessThan(0.5)
    }
  })

  it("the trooper's raised shield stands upright IN FRONT of its torso (it used to lie flat overhead)", () => {
    const [rig] = pair('trooper')
    const m = newMotion(12, 'trooper')
    for (const t of [0, 1.1, 2.7]) {
      poseTrooper(rig, 1, 0, t, 0, m)
      rig.root.updateMatrixWorld(true)
      const inv = new Matrix4().copy(rig.root.matrixWorld).invert()
      // Disc face = the forearm's +Z; its centre sits 0.18 down, 0.2 out
      const c = rig.bones.elbowL!.localToWorld(new Vector3(0.02, -0.18, 0.2)).applyMatrix4(inv)
      const n = new Vector3(0, 0, 1).applyQuaternion(rig.bones.elbowL!.getWorldQuaternion(new Quaternion()))
      const chest = rig.bones.chest!.getWorldPosition(new Vector3()).applyMatrix4(inv)
      expect(n.z, 'faces the front').toBeGreaterThan(0.93)
      expect(c.z - chest.z, 'in front of the chest').toBeGreaterThan(0.3)
      expect(Math.abs(c.y - (chest.y - 0.1)), 'at torso height').toBeLessThan(0.2)
      expect(Math.abs(c.x), 'across the body').toBeLessThan(0.25)
    }
    // …while the old pose (still the no-motion path) laid it flat: face upward
    LEGACY.trooper(rig, 1, 0, 0, 0)
    rig.root.updateMatrixWorld(true)
    const up = new Vector3(0, 0, 1).applyQuaternion(rig.bones.elbowL!.getWorldQuaternion(new Quaternion()))
    expect(up.y).toBeGreaterThan(0.8)
  })

  it('a standing machine never plays its walk cycle (phase from distance, not time)', () => {
    for (const kind of ['hardhat', 'brute'] as const) {
      const { w, e } = spawn(kind)
      engage(e)
      // In range and dead ahead: the hardhat hides (no seek inside 7 m), the
      // brute waits for its cooldown (no seek inside 2.3 m) — nobody turns
      w.player.x = 60
      w.player.z = 30 + (kind === 'brute' ? 2 : 5)
      tick(w, e, 60)
      const s0 = e.mo.stride
      const legs = kind === 'brute' ? ['hipL', 'hipR', 'kneeL', 'kneeR'] : ['footL', 'footR']
      const q0 = legs.map(n => e.rig.bones[n]!.quaternion.clone())
      const p0 = legs.map(n => e.rig.bones[n]!.position.clone())
      tick(w, e, 300)
      expect(e.state).toBe('engage')
      expect(e.mo.stride, `${kind} stride`).toBe(s0)
      expect(e.walk, `${kind} walk`).toBe(0)
      legs.forEach((n, i) => {
        // Component-wise: angleTo of identical quaternions reads ~3e-8 (acos)
        const q = e.rig.bones[n]!.quaternion
        expect(Math.max(Math.abs(q.x - q0[i]!.x), Math.abs(q.y - q0[i]!.y), Math.abs(q.z - q0[i]!.z), Math.abs(q.w - q0[i]!.w)), `${kind} ${n}`).toBeLessThan(1e-12)
        expect(e.rig.bones[n]!.position.distanceTo(p0[i]!), `${kind} ${n}`).toBeLessThan(1e-12)
      })
    }
  })

  it('the hardhat idle peek stays under the guard line (a TINK is never a lie)', () => {
    const { w, e } = spawn('hardhat', 424242)
    let peak = 0
    for (let i = 0; i < 60 * 60; i++) {
      tick(w, e)
      peak = Math.max(peak, (e.rig.bones.body!.scale.y - 0.45) / 0.55)
      expect(e.guard).toBe(1)
    }
    expect(e.state).toBe('idle')
    expect(peak, 'at least one peek-look played').toBeGreaterThan(0.2)
    // combat.ts deflects while guard > 0.55, i.e. peek < 0.45
    expect(peak).toBeLessThanOrEqual(HARDHAT_IDLE_PEEK + 1e-9)
    expect(HARDHAT_IDLE_PEEK).toBeLessThan(0.45)
  })

  it('a room of machines does not breathe or fidget in lockstep', () => {
    const es = Array.from({ length: 6 }, () => createEnemy('hardhat', 1, 60, 30, 0))
    const tempos = es.map(e => e.mo.tempo)
    for (let i = 0; i < tempos.length; i++) for (let j = i + 1; j < tempos.length; j++) expect(Math.abs(tempos[i]! - tempos[j]!)).toBeGreaterThan(1e-4)
    const w = openWorld(es)
    const firstFidget = es.map(() => -1)
    const bobs: number[][] = es.map(() => [])
    for (let i = 0; i < 600; i++) {
      w.time += DT
      es.forEach((e, k) => {
        updateEnemy(w, e, DT)
        syncEnemyVisual(e, 1, w.time)
        if (e.mo.fid && firstFidget[k] === -1) firstFidget[k] = i
        bobs[k]!.push(e.rig.bones.helmet!.position.y)
      })
    }
    const started = firstFidget.filter(f => f >= 0)
    expect(started.length).toBeGreaterThan(2)
    expect(new Set(started).size).toBeGreaterThan(started.length / 2)
    let spread = 0
    for (let t = 0; t < 600; t++) spread = Math.max(spread, Math.max(...bobs.map(b => b[t]!)) - Math.min(...bobs.map(b => b[t]!)))
    expect(spread).toBeGreaterThan(0.005)
  })
})

describe('enemy motion: walking', () => {
  it('walk is measured: a strafing trooper walks (it used to slide at walk 0.017)', () => {
    const { w, e } = spawn('trooper')
    engage(e)
    w.player.x = 60
    w.player.z = 30 + 7.5 // inside its 5–10 m band: keepRange strafes
    const walks: number[] = []
    let legOut = 0
    let px = e.x
    let pz = e.z
    for (let i = 0; i < 60 * 8; i++) {
      tick(w, e)
      const v = Math.hypot(e.x - px, e.z - pz) / DT
      px = e.x
      pz = e.z
      if (v > 0.5) walks.push(e.walk)
      e.rig.root.updateMatrixWorld(true)
      const hip = e.rig.bones.hipR!.getWorldPosition(new Vector3())
      const knee = e.rig.bones.kneeR!.getWorldPosition(new Vector3())
      const inv = new Matrix4().copy(e.rig.root.matrixWorld).invert()
      const d = knee.applyMatrix4(inv).sub(hip.applyMatrix4(inv)).normalize()
      legOut = Math.max(legOut, Math.abs(Math.atan2(d.x, -d.y)) * DEG)
    }
    expect(walks.length).toBeGreaterThan(60)
    expect(walks.reduce((s, x) => s + x, 0) / walks.length).toBeGreaterThan(0.3)
    expect(legOut, 'legs side-step').toBeGreaterThan(5)
  })

  it('the stride advances by distance: 2π per cycle length, independent of the tick rate', () => {
    for (const kind of ['trooper', 'brute', 'hardhat'] as const) {
      const perMetre: number[] = []
      for (const dt of [1 / 60, 1 / 30]) {
        const { w, e } = spawn(kind)
        engage(e)
        tick(w, e, Math.round(1.5 / dt), dt)
        const s0 = e.mo.stride
        const x0 = e.x
        const z0 = e.z
        tick(w, e, Math.round(4 / dt), dt)
        const dist = Math.hypot(e.x - x0, e.z - z0)
        expect(dist).toBeGreaterThan(4)
        perMetre.push((e.mo.stride - s0) / dist)
        const g = GAIT[kind]!
        expect((e.mo.stride - s0) / dist, kind).toBeCloseTo(TAU / cycleLen(g, swingA(g, 1, 0)), 1)
      }
      expect(Math.abs(perMetre[0]! - perMetre[1]!) / perMetre[0]!, `${kind} tick-rate independent`).toBeLessThan(0.01)
    }
  })

  it('planted feet stay put: the stance sole slips < 5 % of the ground covered (was 85–96 %)', () => {
    const SOLE: Record<'trooper' | 'brute' | 'hardhat', [string, string, [number, number, number]]> = {
      trooper: ['kneeL', 'kneeR', [0, -0.38, 0.04]],
      brute: ['kneeL', 'kneeR', [0, -0.6, 0.06]],
      hardhat: ['footL', 'footR', [0, -0.07, 0.02]]
    }
    for (const kind of ['trooper', 'brute', 'hardhat'] as const) {
      const { w, e } = spawn(kind)
      engage(e)
      tick(w, e, 90)
      const [bl, br, p] = SOLE[kind]
      const beta = GAIT[kind]!.beta
      let slip = 0
      let travel = 0
      let prev: { leg: string; x: number; z: number } | null = null
      let bx = e.x
      let bz = e.z
      for (let i = 0; i < 180; i++) {
        tick(w, e)
        travel += Math.hypot(e.x - bx, e.z - bz)
        bx = e.x
        bz = e.z
        const u = frac(e.mo.phase / TAU)
        const leg = u < beta ? bl : br
        e.root.updateMatrixWorld(true)
        const s = e.rig.bones[leg]!.localToWorld(new Vector3(p[0], p[1], p[2]))
        if (prev && prev.leg === leg) slip += Math.hypot(s.x - prev.x, s.z - prev.z)
        prev = { leg, x: s.x, z: s.z }
      }
      expect(travel).toBeGreaterThan(2)
      expect(slip / travel, kind).toBeLessThan(0.05)
    }
  })

  it('the roller wheel rolls by distance and never jumps when it starts or stops', () => {
    const { w, e } = spawn('roller')
    e.anim = 47.3 // the old code spun 7 rad per tick at this age
    engage(e)
    const wheel = e.rig.bones.wheel!
    let prevQ = wheel.quaternion.clone()
    let worst = 0
    let r0 = e.mo.roll
    let x0 = e.x
    let z0 = e.z
    for (let i = 0; i < 300; i++) {
      tick(w, e)
      worst = Math.max(worst, wheel.quaternion.angleTo(prevQ))
      prevQ = wheel.quaternion.clone()
      if (i === 119) {
        r0 = e.mo.roll
        x0 = e.x
        z0 = e.z
      }
    }
    const dist = Math.hypot(e.x - x0, e.z - z0)
    expect(dist).toBeGreaterThan(3)
    expect((e.mo.roll - r0) / (dist / ROLLER_R)).toBeCloseTo(1, 1)
    expect(worst).toBeLessThan(0.5)
  })

  it('the hopper hops for real: airborne for its whole move, its sim height untouched', () => {
    const { w, e } = spawn('hopper')
    engage(e)
    w.player.z = 30 + 12
    let movedOnGround = 0
    let moved = 0
    let px = e.x
    let pz = e.z
    for (let i = 0; i < 180; i++) {
      tick(w, e)
      const d = Math.hypot(e.x - px, e.z - pz)
      px = e.x
      pz = e.z
      moved += d
      if (d > 1e-4 && e.mo.hop < 0.02) movedOnGround += d
      expect(e.y).toBe(0)
    }
    expect(moved).toBeGreaterThan(1.5)
    // Only the lift-off/touch-down instants are near the floor
    expect(movedOnGround / moved).toBeLessThan(0.15)
  })
})

describe('enemy motion: attacks and transitions', () => {
  /** Drive one machine through idle → alert → engage → tele → act → recover → engage. */
  interface Worst { v: number; at: string }
  const LEG = /^(hip|knee|foot|leg)[LR]$/
  const runFight = (kind: EnemyKind, seed: number): { rot: Worst; leg: Worst; pos: Worst; states: Set<string> } => {
    const { w, e } = spawn(kind, seed)
    const SPIN = new Set(['wheel', 'rotor'])
    const bones = Object.values(e.rig.bones).filter(b => !SPIN.has(b.name))
    tick(w, e) // the first frame poses the rig out of its bind pose
    let prevQ = bones.map(b => b.quaternion.clone())
    let prevP = bones.map(b => b.position.clone())
    const rot: Worst = { v: 0, at: '' }
    const leg: Worst = { v: 0, at: '' }
    const pos: Worst = { v: 0, at: '' }
    const states = new Set<string>()
    let prevState = e.state
    for (let i = 0; i < 60 * 16; i++) {
      if (i === 60) {
        // Step into its sight
        w.player.x = 60
        w.player.z = 30 + (kind === 'brute' ? 9 : kind === 'hopper' ? 9.5 : 10)
      }
      if (e.state === 'engage' && e.st > 1.2) e.cd = Math.min(e.cd, 0)
      tick(w, e)
      states.add(e.state)
      // Intentional snaps: the stomper's take-off and landing, the
      // Guardroid's strike, the cannon's recoil kick
      const entered = e.state !== prevState
      const whitelisted =
        (kind === 'hopper' && entered && (e.state === 'act' || e.state === 'recover')) ||
        (kind === 'brute' && e.state === 'act' && e.st < 0.1) ||
        (kind === 'turret' && entered && e.state === 'recover')
      if (!whitelisted) {
        bones.forEach((b, j) => {
          const dr = b.quaternion.angleTo(prevQ[j]!)
          const dp = b.position.distanceTo(prevP[j]!)
          const at = `${b.name} in ${prevState}→${e.state} st ${e.st.toFixed(3)} tick ${i}`
          const r = LEG.test(b.name) ? leg : rot
          if (dr > r.v) Object.assign(r, { v: dr, at })
          if (dp > pos.v) Object.assign(pos, { v: dp, at })
        })
      }
      prevQ = bones.map(b => b.quaternion.clone())
      prevP = bones.map(b => b.position.clone())
      prevState = e.state
    }
    return { rot, leg, pos, states }
  }

  it.each(KINDS)('%s: no pops through idle → alert → engage → tele → act → recover', (kind) => {
    const { rot, leg, pos, states } = runFight(kind, 31337)
    for (const s of ['idle', 'alert', 'engage', 'tele', 'recover']) expect(states.has(s), `${kind} reached ${s}`).toBe(true)
    // 0.25 rad in one tick is a visible snap (the old heli tilt jumped 0.33,
    // the brute's fist 1.4, the roller's wheel 7). Legs get their own
    // ceiling: at the per-tick stride cap (0.55 rad of phase, stepMotion) the
    // trooper's hip sweeps up to A·0.55 / (2·(1 − β)) = 0.275 rad BY DESIGN
    // (420 random fights peaked at 0.231; everything else at 0.234 — the
    // Guardroid's combo wind-up). A leg snapping across its stride jumps ≥ 2·A.
    expect(rot.v, `${kind} rotation per tick: ${rot.at}`).toBeLessThan(0.25)
    expect(leg.v, `${kind} leg rotation per tick: ${leg.at}`).toBeLessThan(0.35)
    expect(pos.v, `${kind} offset per tick: ${pos.at}`).toBeLessThan(0.08)
  })

  it('telegraph key poses are exactly the old ones', () => {
    // Guardroid: full wind-up, thrown fist, slam wind-up and top — per arm
    for (const [armR, slam, legacyArgs] of [[-1, 0, [1, -1, 0]], [1, 0, [1, 1, 0]], [0, -0.4, [0, 0, -0.4]], [0, 1, [0, 0, 1]]] as const) {
      const [a, b] = pair('brute')
      LEGACY.brute(a, 2.2, 0, legacyArgs[0], legacyArgs[1], legacyArgs[2])
      const m = newMotion(3, 'brute')
      m.calm = 0
      m.armR = armR
      m.slam = slam
      poseBrute(b, 2.2, 0, 0, 0, slam, m)
      for (const n of slam !== 0 ? ['shoulderL', 'elbowL', 'shoulderR', 'elbowR'] : ['shoulderR', 'elbowR']) {
        expect(b.bones[n]!.quaternion.angleTo(a.bones[n]!.quaternion), `brute ${n} @ ${armR}/${slam}`).toBeLessThan(1e-6)
      }
    }
    // Trooper: the aim arm of the burst telegraph
    {
      const [a, b] = pair('trooper')
      LEGACY.trooper(a, 0, 1, 1.1, 0)
      const m = newMotion(4, 'trooper')
      m.calm = 0
      poseTrooper(b, 0, 1, 1.1, 0, m)
      for (const n of ['shoulderR', 'elbowR']) expect(b.bones[n]!.quaternion.angleTo(a.bones[n]!.quaternion), `trooper ${n}`).toBeLessThan(1e-6)
    }
    // Hardhat: a full peek (the spread-shot telegraph) opens as far as ever
    {
      const [a, b] = pair('hardhat')
      LEGACY.hardhat(a, 1, 0.4, 0)
      const m = newMotion(6, 'hardhat')
      m.calm = 0
      poseHardhat(b, 1, 0.4, 0, m)
      expect(b.bones.body!.scale.y).toBe(a.bones.body!.scale.y)
      expect(Math.abs(b.bones.helmet!.position.y - a.bones.helmet!.position.y)).toBeLessThan(0.02)
      expect(b.bones.helmet!.quaternion.angleTo(a.bones.helmet!.quaternion)).toBeLessThan(0.04)
    }
    // Stomper: the leap's crouch
    {
      const [a, b] = pair('hopper')
      LEGACY.hopper(a, -1, 0.9)
      const m = newMotion(8, 'hopper')
      m.calm = 0
      poseHopper(b, -1, 0.9, m)
      expect(b.bones.legL!.scale.y).toBe(a.bones.legL!.scale.y)
      expect(b.bones.body!.scale.y).toBe(a.bones.body!.scale.y)
    }
    // Rotor drone: the dive tilt arrives within 0.15 s
    {
      const { e } = spawn('heli')
      e.state = 'act'
      for (let i = 0; i < 9; i++) stepMotion(e, DT)
      expect(e.mo.tilt).toBeGreaterThan(0.39)
    }
  })

  it('pending decisions keep today\'s behaviour: shield-up unaware troopers, boss animation untouched', () => {
    expect(UNAWARE_TROOPER_GUARD).toBe(1)
    expect(createEnemy('trooper', 1, 0, 0, 0).guard).toBe(1)
    // The Masters carry a motion record (ready for a follow-up) that nothing advances yet
    const b = createBoss('blazeMaster', 1, 10, 10, 0)
    expect(b.mo).toBeDefined()
    expect(b.mo.walk).toBe(0)
  })
})

describe('enemy motion: cost', () => {
  /**
   * HEAD's syncEnemyVisual — the view before the motion layer — with the pose
   * calls on their no-motion path: the in-process baseline the new view is
   * timed against. It does the same position / shadow / flash work, so the
   * ratio isolates what the motion layer adds.
   */
  const oldView = (e: Enemy, alpha: number, time: number): void => {
    const x = e.px + (e.x - e.px) * alpha
    const z = e.pz + (e.z - e.pz) * alpha
    const y = e.py + (e.y - e.py) * alpha
    e.root.position.set(x, y, z)
    e.root.rotation.y = e.yaw
    e.shadow.position.set(x, 0.02, z)
    e.shadow.scale.setScalar(e.def.radius * 1.1 * (e.elite ? 1.18 : 1) * Math.max(0.45, 1 - y * 0.15))
    const r = e.rig
    const t = e.anim
    r.material.emissive.setScalar(e.flash * 0.85)
    const stunned = e.state === 'stun'
    switch (e.kind) {
      case 'hardhat': poseHardhat(r, 1 - e.guard, t, e.walk); break
      case 'trooper': poseTrooper(r, e.guardBreakT > 0 ? 0 : e.guard, e.aim, t, e.walk); break
      case 'heli': poseHeli(r, t, e.state === 'act' ? 0.45 : e.state === 'tele' ? -0.25 : 0.08, t * (stunned ? 4 : 28)); break
      case 'hopper': poseHopper(r, Math.sin(t * 2.2) * 0.06, t); break
      case 'roller': poseRoller(r, e.a + e.walk * t * 6, t, 0.2); break
      case 'brute': poseBrute(r, t, e.walk, 0, 0, 0); break
      case 'turret': poseTurret(r, 0.35, e.a); break
    }
    e.root.rotation.z = stunned ? Math.sin(time * 18) * 0.08 : 0
  }

  // No wall-clock threshold: the suite may share a loaded machine. Both views
  // are timed in the same process, in short alternating batches, and only the
  // MEDIAN of the per-pair ratios is asserted — a stall, a GC or a neighbour's
  // burst landing in a few batches moves a few pairs, not the median.
  // Measured: medians 1.46–2.02× over 40 runs, most of them with the machine
  // pinned at 100 % (a parallel full suite, or a busy-loop on every core);
  // single pairs spread 0.1–26× (p10–p90). The in-browser bench on the dev build: 1.36×.
  // The bound keeps that ~1.8× headroom over the typical median (≈1.65×).
  it('the motion layer costs < 3× the old view to pose (median of interleaved batches)', () => {
    const es = Array.from({ length: 140 }, (_, i) => {
      const e = createEnemy(KINDS[i % KINDS.length]!, 1, 30 + (i % 20) * 3, 30 + Math.floor(i / 20) * 3, 0)
      if (i % 2) engage(e)
      e.walk = e.mo.walk = i % 3 ? 1 : 0
      e.mo.calm = i % 2 ? 0 : 1
      e.mo.fid = i % 5 === 0 ? 1 : 0
      e.mo.fidT = 0.3
      return e
    })
    let frame = 0
    const batch = (view: (e: Enemy, alpha: number, time: number) => void): number => {
      const t0 = performance.now()
      for (let f = 0; f < 8; f++) {
        frame++
        for (const e of es) {
          e.anim += DT
          e.mo.pstride = e.mo.stride
          e.mo.stride += 0.05
          view(e, 0.5, frame * DT)
        }
      }
      return performance.now() - t0
    }
    for (let i = 0; i < 6; i++) {
      batch(oldView)
      batch(syncEnemyVisual)
    }
    const ratios: number[] = []
    for (let i = 0; i < 41; i++) {
      // Alternate which view goes first, so neither always runs after a stall
      if (i % 2) {
        const a = batch(oldView)
        ratios.push(batch(syncEnemyVisual) / a)
      } else {
        const b = batch(syncEnemyVisual)
        ratios.push(b / batch(oldView))
      }
    }
    ratios.sort((x, y) => x - y)
    const median = ratios[20]!
    console.log(`[posing cost] median ratio ${median.toFixed(2)} (p10 ${ratios[4]!.toFixed(2)}, p90 ${ratios[36]!.toFixed(2)})`)
    expect(median, `median new/old posing time ${median.toFixed(2)}`).toBeLessThan(3)
  })
})
