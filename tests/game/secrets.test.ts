// Secret rooms (`sim/secrets.ts`): shoot the wall buttons until they match
// the panel, and the false wall sinks away from a hidden alcove's prize.
//
// Pinned here: each puzzle's rules (lights toggle, a colour puzzle wants
// exactly its key's buttons, a cycle wraps after yellow); a real shot from
// the combat system presses the button it strikes, once, before the wall it
// sits on can stop it; solving opens the alcove to bodies and paths after
// the wall's sink and pays its prize once; a resumed stage keeps the buttons
// mid-puzzle and the alcove open after; Atlas's one hint comes when Flux
// first nears the buttons on their floor; and the Tower Run carries one
// secret off its route.

import { beforeEach, describe, expect, it, vi } from 'vitest'

// The blob shadow and the shot glow draw canvas textures (no 2D canvas under
// jsdom); plain objects stand in.
vi.mock('@/game/fx/markers', async () => {
  const { Mesh, Group } = await import('three')
  return { makeBlobShadow: () => new Mesh(), makeTeleRing: () => new Group(), setTeleRing: () => {} }
})
vi.mock('@/game/world/textures', async (orig) => {
  const { Texture } = await import('three')
  return { ...(await orig<object>()), glowTexture: () => new Texture(), ringTexture: () => new Texture() }
})

import { Group, Scene } from 'three'
import { CELL, cellCenter, type MapData, type SecretSpec } from '@/game/world/levelGen'
import { createNav, findPath, moveBody, type Nav } from '@/game/world/nav'
import { generateClimb } from '@/game/world/climbGen'
import { Builder, finish, mirrorX, secretDoorFace, YAW_PX } from '@/game/world/stages/builder'
import { THEMES } from '@/game/world/themes'
import { SECTOR_BY_ID } from '@/game/data/regions'
import { ClimbRun, type ClimbBody, type ClimbHost } from '@/game/sim/climb'
import { SecretsFeature, press, solved, initialState, targetOf, SINK_T, HINT_R } from '@/game/sim/secrets'
import { CombatSystem, type CombatHost } from '@/game/sim/combat'
import { BorrowedRun, LENT_SHOTS, secretWeapon } from '@/game/sim/borrowed'
import { WEAPON_IDS } from '@/game/data/weapons'
import type { AtlasLine } from '@/game/sim/atlas'
import type { Shot, World } from '@/game/sim/world'
import { PLAYER_R } from '@/game/sim/constants'

const DT = 1 / 60
const noop = (): void => {}
const SEEDS = Array.from({ length: 24 }, (_, i) => (i * 2654435761 + 1013904223) >>> 0)

beforeEach(() => {
  let seed = 7
  const dice = vi.spyOn(Math, 'random').mockImplementation(() => ((seed = (seed * 16807) % 2147483647) / 2147483647))
  return () => dice.mockRestore()
})

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** A 6 × 4 room at y = 3 and a 2 × 2 alcove east of it (false wall facing
 *  cell (5, 1)); three buttons on the north wall. */
const secretMap = (kind: SecretSpec['kind'] = 'lights', prize: SecretSpec['prize'] = 'tank'): MapData => {
  const b = new Builder(10, 5)
  b.addRoom(0, 0, 6, 4, 'start', 'hall', 3)
  if (kind === 'color') b.secret(0, 'color', [6, 1, 7, 2], { i: 6, j: 1, axis: 'x' }, [[0, 0, 'n', 1], [1, 0, 'n', 0], [2, 0, 'n', 1]], [], prize, 1)
  else if (kind === 'cycle') b.secret(0, 'cycle', [6, 1, 7, 2], { i: 6, j: 1, axis: 'x' }, [[0, 0, 'n', 0], [1, 0, 'n', 0], [2, 0, 'n', 0]], [2, 0, 3], prize)
  else b.secret(0, 'lights', [6, 1, 7, 2], { i: 6, j: 1, axis: 'x' }, [[0, 0, 'n'], [1, 0, 'n'], [2, 0, 'n']], [1, 0, 1], prize)
  return finish(b, { x: cellCenter(1), z: cellCenter(2), yaw: YAW_PX }, 1)
}

const body = (x: number, z: number, y = 3): ClimbBody => ({
  x, z, y, vx: 0, vz: 0, vy: 0, yaw: YAW_PX, ground: true, ladder: -1, plat: -1, air: 0, safeY: y, mantle: 0, mx: 0, mz: 0, path: null
})

interface Rig {
  host: ClimbHost & { nav: Nav }
  run: ClimbRun
  sec: SecretsFeature
  said: AtlasLine[]
  prizes: string[]
  pickups: string[]
  wall: Group
}

const rig = (map: MapData): Rig => {
  const said: AtlasLine[] = []
  const prizes: string[] = []
  const pickups: string[] = []
  const scene = new Scene()
  const wall = new Group()
  const host: ClimbHost & { nav: Nav } = {
    nav: createNav(map), map, theme: THEMES.scrapyard,
    combat: { maxHp: 100 } as ClimbHost['combat'],
    fx: { sparks: noop, riseRing: noop, emit: noop } as unknown as ClimbHost['fx'],
    markers: { spawn: noop } as unknown as ClimbHost['markers'],
    shocks: { spawn: noop } as unknown as ClimbHost['shocks'],
    hitPlayer: () => 'hit', sfx: noop, shake: noop, onPickup: (k) => { pickups.push(k) }, propParent: () => scene,
    scene, time: 0,
    level: { root: new Group(), rooms: [], sky: null as never, bounds: [], owner: new Int16Array(0), secretWalls: [wall] },
    enemyLevel: 1, encounters: SECTOR_BY_ID.scrapyard.encounters, addEnemy: noop,
    say: (l) => { said.push(l) },
    secretPrize: (p) => { prizes.push(p) }
  }
  const run = new ClimbRun(host, 1)
  const sec = run.features.find(f => f instanceof SecretsFeature) as SecretsFeature
  return { host, run, sec, said, prizes, pickups, wall }
}

/** A stand-in shot's step from a to b (all `shot` reads). */
const step = (a: [number, number, number], b: [number, number, number], radius = 0.085): Shot =>
  ({ px: a[0], py: a[1], pz: a[2], x: b[0], y: b[1], z: b[2], radius }) as Shot

/** A shot's step straight into button `i` from 0.6 m in front of it. */
const shootAt = (r: Rig, i: number): boolean => {
  const b = r.run.t.secrets![0]!.buttons[i]!
  return r.run.shotStep(step([b.x + b.nx * 0.6, b.y, b.z + b.nz * 0.6], [b.x - b.nx * 0.2, b.y, b.z - b.nz * 0.2]))
}

const tick = (r: Rig, s: number, p = body(cellCenter(1), cellCenter(3))): void => {
  for (let n = 0; n < Math.round(s / DT); n++) r.run.update(DT, n * DT, p, true)
}

// ─── The puzzles (pure) ──────────────────────────────────────────────────────

describe('the puzzle rules', () => {
  const spec = (kind: SecretSpec['kind']): SecretSpec => secretMap(kind).terrain!.secrets![0]!

  it('lights: each press toggles its button; solved when the pattern matches', () => {
    const s = spec('lights')
    const st = initialState(s)
    expect(st).toEqual([0, 0, 0])
    expect(solved(s, st)).toBe(false)
    expect(press(s, st, 0)).toBe(1)
    expect(press(s, st, 1)).toBe(1)
    expect(press(s, st, 2)).toBe(1)
    expect(solved(s, st)).toBe(false)
    expect(press(s, st, 1)).toBe(0)
    expect(st).toEqual([1, 0, 1])
    expect(solved(s, st)).toBe(true)
  })

  it('color: exactly the key colour\'s buttons on, every other off', () => {
    const s = spec('color')
    expect(s.key).toBe(1)
    expect([0, 1, 2].map(i => targetOf(s, i))).toEqual([1, 0, 1])
    const st = initialState(s)
    press(s, st, 0)
    expect(solved(s, st)).toBe(false)
    press(s, st, 2)
    expect(solved(s, st)).toBe(true)
    // A button of another colour lit too: not solved.
    press(s, st, 1)
    expect(solved(s, st)).toBe(false)
    // The key rules, whatever an edited target says.
    expect(solved({ ...s, target: [0, 0, 0] }, [1, 0, 1])).toBe(true)
  })

  it('cycle: each press steps red → green → blue → yellow → red', () => {
    const s = spec('cycle')
    const st = initialState(s)
    expect(st).toEqual([0, 0, 0])
    expect([1, 2, 3, 4].map(() => press(s, st, 0))).toEqual([1, 2, 3, 0])
    press(s, st, 0)
    press(s, st, 0)
    expect(solved(s, st)).toBe(false)
    for (let n = 0; n < 3; n++) press(s, st, 2)
    expect(st).toEqual([2, 0, 3])
    expect(solved(s, st)).toBe(true)
    // A cycle button starts on its own colour.
    expect(initialState({ ...s, buttons: s.buttons.map((b, i) => ({ ...b, color: i + 1 })) })).toEqual([1, 2, 3])
  })
})

// ─── Shots and buttons ───────────────────────────────────────────────────────

describe('shooting a button', () => {
  it('a shot through a button presses it once; one beside it, or from behind its wall, does not', () => {
    const r = rig(secretMap('lights'))
    expect(shootAt(r, 1)).toBe(true)
    expect(r.sec.list[0]!.state).toEqual([0, 1, 0])
    // A metre along the wall: a miss.
    const b = r.run.t.secrets![0]!.buttons[1]!
    expect(r.run.shotStep(step([b.x + 1, b.y, b.z + 0.6], [b.x + 1, b.y, b.z - 0.2]))).toBe(false)
    // From behind the wall, coming out of it: a miss.
    expect(r.run.shotStep(step([b.x, b.y, b.z - 0.8], [b.x, b.y, b.z - 0.1]))).toBe(false)
    expect(r.sec.list[0]!.state).toEqual([0, 1, 0])
  })

  it('the combat system\'s shot strikes the button before the wall stops it, and ends there', () => {
    const r = rig(secretMap('lights'))
    const b = r.run.t.secrets![0]!.buttons[0]!
    const w = {
      scene: new Scene(), map: r.host.map, nav: r.host.nav, time: 0,
      player: { x: b.x, z: 6, yaw: 0, pitch: 0, y: 3 },
      combat: { iframes: 1e9, charging: false, charge: 0 } as unknown as World['combat'],
      enemies: [],
      fx: { sparks: noop, emit: noop, orbBurst: noop, flash: noop, riseRing: noop },
      markers: { spawn: noop }, shocks: { spawn: noop, spawnLinear: noop },
      stats: { critChance: 0, critMul: 1.5, piercing: false, boltMul: 1, magnetMul: 1, parryBonus: 0, busterDmg: 10, chargeTimeMul: 1 },
      hitStop: 0,
      onEnemyKilled: noop, onPickup: noop, onPlayerHurt: noop, onPlayerDown: noop,
      hitPlayer: () => 'miss', shake: noop, sfx: noop,
      shotHitsStage: (s: Shot) => r.run.shotStep(s)
    } as unknown as World & CombatHost
    const sys = new CombatSystem(w)
    for (const kind of ['pellet', 'charge3'] as const) {
      const s = sys.spawnPlayerShot(kind, b.x, b.y, 6, 0, 0, -1, 10, false, null)
      for (let n = 0; n < 120 && s.active; n++) sys.update(DT)
      expect(s.active).toBe(false)
    }
    // Two shots, two presses: on, then off again.
    expect(r.sec.list[0]!.state).toEqual([0, 0, 0])
    const s = sys.spawnPlayerShot('pellet', b.x, b.y, 6, 0, 0, -1, 10, false, null)
    for (let n = 0; n < 120 && s.active; n++) sys.update(DT)
    expect(r.sec.list[0]!.state).toEqual([1, 0, 0])
    // A shot at the bare wall ends there and presses nothing.
    const miss = sys.spawnPlayerShot('pellet', b.x + 1.5, b.y, 6, 0, 0, -1, 10, false, null)
    for (let n = 0; n < 120 && miss.active; n++) sys.update(DT)
    expect(miss.active).toBe(false)
    expect(r.sec.list[0]!.state).toEqual([1, 0, 0])
  })
})

// ─── Solving ─────────────────────────────────────────────────────────────────

describe('solving a secret', () => {
  const inside: [number, number] = [cellCenter(6), cellCenter(1)]
  const from: [number, number] = [cellCenter(4), cellCenter(1)]

  it('sinks the false wall, then opens the alcove to paths and bodies; the buttons stop answering', () => {
    const r = rig(secretMap('lights'))
    shootAt(r, 0)
    shootAt(r, 2)
    expect(r.sec.isSolved(0)).toBe(true)
    expect(r.said).toContain('secret.solved')
    // Mid-sink: the wall is going down, the way is not open yet.
    tick(r, SINK_T / 2)
    expect(r.wall.position.y).toBeLessThan(-0.5)
    expect(r.run.secretOpen(0)).toBe(false)
    tick(r, SINK_T)
    expect(r.run.secretOpen(0)).toBe(true)
    expect(r.wall.visible).toBe(false)
    expect(findPath(r.host.nav, ...from, ...inside, 1400, 0, true)).not.toBeNull()
    const out: [number, number] = [0, 0]
    moveBody(r.host.nav, from[0], from[1], 3, 6, 0, PLAYER_R, out)
    expect(out[0]).toBeGreaterThan(19)
    // Solved: a shot at a button flies on to the wall.
    expect(shootAt(r, 1)).toBe(false)
    expect(r.sec.list[0]!.state).toEqual([1, 0, 1])
  })

  it('pays its prize once, walking into it, only once the wall is down', () => {
    const r = rig(secretMap('lights', 'tank'))
    const at = r.run.t.secrets![0]!.prizeAt
    const onPrize = body(at.x, at.z, at.y)
    tick(r, 0.5, onPrize)
    expect(r.prizes).toEqual([])
    shootAt(r, 0)
    shootAt(r, 2)
    tick(r, SINK_T * 0.5, onPrize)
    expect(r.prizes).toEqual([])
    tick(r, SINK_T, onPrize)
    tick(r, 1, onPrize)
    expect(r.prizes).toEqual(['tank'])
    expect(r.sec.list[0]!.prize.visible).toBe(false)
    expect(r.sec.list[0]!.shaft.visible).toBe(false)
  })

  it('each prize goes its way: hp a big heal; weapon and power the borrowed slot', () => {
    for (const prize of ['hp', 'weapon', 'power'] as const) {
      const r = rig(secretMap('color', prize))
      shootAt(r, 0)
      shootAt(r, 2)
      const at = r.run.t.secrets![0]!.prizeAt
      tick(r, SINK_T + 0.2, body(at.x, at.z, at.y))
      if (prize === 'hp') {
        expect(r.pickups).toEqual(['hpBig'])
        expect(r.prizes).toEqual([])
      } else expect(r.prizes).toEqual([prize])
    }
  })

  it('a borrowed weapon off a pedestal fills the slot; the secret\'s pick is deterministic', () => {
    const b = new BorrowedRun({ fx: { orbBurst: noop, riseRing: noop, flash: noop, sparks: noop }, sfx: noop }, [])
    b.lend('iceLance', 1, 0, 1)
    expect(b.slot.id).toBe('iceLance')
    expect(b.slot.shots).toBe(LENT_SHOTS.iceLance)
    expect(b.capsules).toHaveLength(0)
    expect(secretWeapon(42, [], [])).toBe(secretWeapon(42, [], []))
    expect(WEAPON_IDS).toContain(secretWeapon(42, [], []))
  })
})

// ─── Save / restore ──────────────────────────────────────────────────────────

describe('a resumed stage', () => {
  it('keeps the buttons mid-puzzle', () => {
    const map = secretMap('cycle')
    const a = rig(map)
    shootAt(a, 0)
    shootAt(a, 0)
    shootAt(a, 2)
    const save = a.run.save()
    const b = rig(map)
    b.run.restore(JSON.parse(JSON.stringify(save)))
    expect(b.sec.list[0]!.state).toEqual([2, 0, 1])
    expect(b.sec.isSolved(0)).toBe(false)
    expect(b.run.secretOpen(0)).toBe(false)
    // …and solves from there.
    shootAt(b, 2)
    shootAt(b, 2)
    expect(b.sec.isSolved(0)).toBe(true)
  })

  it('keeps a solved secret open (even saved mid-sink), and a taken prize taken', () => {
    const map = secretMap('lights')
    const a = rig(map)
    shootAt(a, 0)
    shootAt(a, 2)
    tick(a, SINK_T / 3)
    const midSink = a.run.save()
    const b = rig(map)
    b.run.restore(JSON.parse(JSON.stringify(midSink)))
    expect(b.run.secretOpen(0)).toBe(true)
    expect(b.wall.visible).toBe(false)
    expect(b.sec.list[0]!.prize.visible).toBe(true)
    expect(findPath(b.host.nav, cellCenter(4), cellCenter(1), cellCenter(6), cellCenter(1), 1400, 0, true)).not.toBeNull()

    const at = map.terrain!.secrets![0]!.prizeAt
    tick(b, 0.2, body(at.x, at.z, at.y))
    expect(b.prizes).toEqual(['tank'])
    const c = rig(map)
    c.run.restore(JSON.parse(JSON.stringify(b.run.save())))
    tick(c, 0.5, body(at.x, at.z, at.y))
    expect(c.prizes).toEqual([])
    expect(c.sec.list[0]!.prize.visible).toBe(false)
    // No second hint and no second "solved" line on the way back in.
    expect(c.said).toEqual([])
  })

  it('shrugs off a missing or broken save', () => {
    const r = rig(secretMap('lights'))
    r.sec.restore(undefined)
    r.sec.restore([{ on: 'x', f: 'y' }, null])
    expect(r.sec.list[0]!.state).toEqual([0, 0, 0])
    expect(r.sec.isSolved(0)).toBe(false)
  })
})

// ─── Atlas ───────────────────────────────────────────────────────────────────

describe('Atlas\'s hint', () => {
  it('comes once, the first time Flux nears the buttons on their floor', () => {
    const r = rig(secretMap('color'))
    const b = r.run.t.secrets![0]!.buttons[0]!
    // Far off, and near but a floor below: nothing.
    tick(r, 0.2, body(17, 11))
    expect(Math.hypot(17 - 7.5, 11) > HINT_R).toBe(true)
    tick(r, 0.2, body(b.x, b.z + 2, 0))
    expect(r.said).toEqual([])
    // Not while play is paused (a modal, the beam-in).
    r.run.update(DT, 0, body(b.x, b.z + 2), false)
    expect(r.said).toEqual([])
    tick(r, 0.5, body(b.x, b.z + 2))
    expect(r.said).toEqual(['secret.color'])
    tick(r, 0.5, body(b.x + 1, b.z + 1))
    expect(r.said).toEqual(['secret.color'])
  })

  it('each kind has its own line', () => {
    for (const kind of ['lights', 'color', 'cycle'] as const) {
      const r = rig(secretMap(kind))
      const b = r.run.t.secrets![0]!.buttons[1]!
      tick(r, 0.1, body(b.x, b.z + 1.5))
      expect(r.said).toEqual([`secret.${kind}`])
    }
  })
})

// ─── The Tower Run's secret ──────────────────────────────────────────────────

describe('the Tower Run', () => {
  it('holds one secret, off the route: its buttons and panel on the hall\'s walls, reachable, its alcove shut', () => {
    for (const seed of SEEDS) {
      const m = generateClimb(seed)
      const t = m.terrain!
      const where = `seed ${seed}`
      expect(t.secrets, where).toHaveLength(1)
      const s = t.secrets![0]!
      expect(s.kind).toBe('lights')
      expect(s.prize).toBe('tank')
      expect(s.room).toBe(0)
      expect(solved(s, initialState(s))).toBe(false)
      // Nothing of the route in the alcove.
      for (const c of t.checkpoints) for (const k of c.cells) expect(s.cells.includes(k), where).toBe(false)
      for (const k of s.cells) expect(m.room[k]).toBe(0)
      const r = rig(m)
      // The cell in front of the false wall and each button's cell: reached
      // from the pad; the alcove not, until it opens.
      const face = secretDoorFace(m, s)
      const front: [number, number] = [cellCenter(face.i + face.di), cellCenter(face.j + face.dj)]
      const nav = r.host.nav
      expect(findPath(nav, m.start.x, m.start.z, ...front, 4000, 0, true), where).not.toBeNull()
      for (const b of s.buttons) {
        expect(findPath(nav, m.start.x, m.start.z, b.x + b.nx * 1.2, b.z + b.nz * 1.2, 4000, 0, true), where).not.toBeNull()
      }
      expect(findPath(nav, m.start.x, m.start.z, s.prizeAt.x, s.prizeAt.z, 4000, 0, true), where).toBeNull()
      for (let i = 0; i < s.buttons.length; i++) if (targetOf(s, i)) r.sec.hit(r.sec.list[0]!, i)
      tick(r, SINK_T + 0.1, body(m.start.x, m.start.z, 0))
      expect(findPath(nav, m.start.x, m.start.z, s.prizeAt.x, s.prizeAt.z, 4000, 0, true), where).not.toBeNull()
    }
  })

  it('the mirrored hand\'s panel is the mirror image too: lamps sorted left to right as Flux faces them', () => {
    const m = generateClimb(SEEDS[0]!)
    const mm = mirrorX(m)
    const a = rig(m).sec.list[0]!
    const b = rig(mm).sec.list[0]!
    // The panel lamps' colours in slot order are each other's mirror image.
    const cols = (x: typeof a) => x.panel.map(l => l.lampMat.color.getHexString())
    expect(cols(b)).toEqual(cols(a).slice().reverse())
    expect(a.spec.buttons.length).toBe(4)
    expect(CELL).toBe(3)
  })
})
