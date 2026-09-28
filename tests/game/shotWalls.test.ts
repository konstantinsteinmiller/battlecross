// Shots and walls (sim/combat.ts, world/nav.ts): a shot — quick or charged —
// ends on the wall it meets and never hurts what stands behind it. That holds
// for a charged shot's fat hit sphere reaching past a thin closed door, for a
// shot fired from a buster already pushed through a wall, and for the
// pilasters and door posts standing proud of the wall line at corners and
// doorways, which block sight (and so the lock-on and aim) as they block a
// shot. A charged shot also looks the part: a comet tail and energy rings.

import { beforeEach, describe, expect, it, vi } from 'vitest'

// The blob shadow, the telegraph ring and the shot glow draw canvas textures
// (no 2D canvas under jsdom); plain objects stand in.
vi.mock('@/game/fx/markers', async () => {
  const { Mesh, Group } = await import('three')
  return { makeBlobShadow: () => new Mesh(), makeTeleRing: () => new Group(), setTeleRing: () => {} }
})
vi.mock('@/game/world/textures', async (orig) => {
  const { Texture } = await import('three')
  return { ...(await orig<object>()), glowTexture: () => new Texture(), ringTexture: () => new Texture() }
})

import { Scene } from 'three'
import { createEnemy } from '@/game/sim/enemies'
import { CombatSystem, type CombatHost } from '@/game/sim/combat'
import { createNav, hasLineOfSight, type Nav } from '@/game/world/nav'
import { CELL, type MapData } from '@/game/world/levelGen'
import { THEMES } from '@/game/world/themes'
import type { Enemy, Shot, World } from '@/game/sim/world'

const DT = 1 / 60
const noop = (): void => {}

beforeEach(() => {
  let seed = 7
  const dice = vi.spyOn(Math, 'random').mockImplementation(() => ((seed = (seed * 16807) % 2147483647) / 2147483647))
  return () => dice.mockRestore()
})

const W = 20
const openMap = (): MapData => {
  const cell = new Uint8Array(W * W).fill(1)
  return { w: W, h: W, cell, pillars: [], room: new Int16Array(W * W), rooms: [], doors: [] } as unknown as MapData
}

/** A closed door panel across the whole field at z = 30 (a thin slab). */
const DOOR_Z = 30
const shutDoor = (nav: Nav): void => {
  nav.slabs.push({ minX: 0, maxX: W * CELL, minZ: DOOR_Z - 0.1, maxZ: DOOR_Z + 0.1, active: true })
}

interface Rig { w: World & CombatHost; sys: CombatSystem; e: Enemy; nav: Nav }

/** A turret (it never moves) at (30, ez), Flux at (30, pz), a real CombatSystem. */
const setup = (ez: number, pz: number, door = true): Rig => {
  const map = openMap()
  const nav = createNav(map)
  if (door) shutDoor(nav)
  const e = createEnemy('turret', 1, 30, ez, 0, { theme: THEMES.scrapyard })
  const w = {
    scene: new Scene(), map, nav, time: 0,
    player: { x: 30, z: pz, yaw: 0, pitch: 0 },
    combat: { iframes: 1e9, charging: false, charge: 0 } as unknown as World['combat'],
    enemies: [e],
    fx: { sparks: vi.fn(), emit: noop, orbBurst: vi.fn(), flash: noop, riseRing: noop },
    markers: { spawn: noop }, shocks: { spawn: noop, spawnLinear: noop },
    stats: { critChance: 0, critMul: 1.5, piercing: false, boltMul: 1, magnetMul: 1, parryBonus: 0, busterDmg: 10, chargeTimeMul: 1 },
    hitStop: 0,
    onEnemyKilled: vi.fn(), onPickup: noop, onPlayerHurt: noop, onPlayerDown: noop,
    fireEnemyShot: vi.fn(), lobShell: vi.fn(), spawnWave: noop, spawnRing: noop, fireOrb: noop,
    hitPlayer: () => 'miss', shake: noop, sfx: vi.fn()
  } as unknown as World & CombatHost
  return { w, sys: new CombatSystem(w), e, nav }
}

/** A player shot from (30, z) straight down +z at the turret's aim height. */
const fire = (r: Rig, kind: 'pellet' | 'charge1' | 'charge2' | 'charge3', z: number): Shot =>
  r.sys.spawnPlayerShot(kind, 30, r.e.y + r.e.def.aimY, z, 0, 0, 1, 40, false, null)

const fly = (r: Rig, s: Shot, maxTicks = 120): void => {
  for (let n = 0; n < maxTicks && s.active; n++) r.sys.update(DT)
}

describe('a shot ends on the wall', () => {
  it('a charged shot stopped by a closed door does not reach the machine right behind it', () => {
    // Every start offset: wherever the last step before the door leaves it,
    // the fat charged sphere must not touch the turret 0.6 m past the panel.
    for (const kind of ['pellet', 'charge1', 'charge2', 'charge3'] as const) {
      for (let k = 0; k < 12; k++) {
        const r = setup(DOOR_Z + 0.6, 20)
        const hp = r.e.hp
        const s = fire(r, kind, 24 + k * 0.04)
        fly(r, s)
        expect(s.active, `${kind} #${k}`).toBe(false)
        expect(r.e.hp, `${kind} #${k}`).toBe(hp)
      }
    }
  })

  it('the same machine with the door open takes the hit', () => {
    const r = setup(DOOR_Z + 0.6, 20, false)
    const hp = r.e.hp
    fly(r, fire(r, 'charge2', 24))
    expect(r.e.hp).toBeLessThan(hp)
  })

  it('a shot fired from a buster already through the wall ends on it at once', () => {
    // Flux pressed to the door: his muzzle sits past the panel
    const r = setup(DOOR_Z + 1.5, DOOR_Z - 0.62)
    const hp = r.e.hp
    for (const kind of ['pellet', 'charge2'] as const) {
      const s = fire(r, kind, DOOR_Z + 0.15)
      expect(s.active).toBe(false)
      fly(r, s)
    }
    expect(r.e.hp).toBe(hp)
    expect(r.w.fx.sparks).toHaveBeenCalled()
  })

  it('a charged shot bursts on the wall, a quick one only sparks', () => {
    const r = setup(DOOR_Z + 5, 20)
    fly(r, fire(r, 'pellet', 24))
    expect(r.w.fx.orbBurst).not.toHaveBeenCalled()
    fly(r, fire(r, 'charge2', 24))
    expect(r.w.fx.orbBurst).toHaveBeenCalledTimes(1)
  })
})

describe('wall corners and doorways block sight', () => {
  /** A room (rows j ≥ 5) with a one-cell corridor (column i = 4) leaving it
   *  down −z: the corridor mouth's corners are the vertices (4, 5), (5, 5). */
  const mouth = (): Nav => {
    const cell = new Uint8Array(W * W)
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) if (j >= 5 || i === 4) cell[j * W + i] = 1
    return createNav({ w: W, h: W, cell, pillars: [], room: new Int16Array(W * W), rooms: [], doors: [] } as unknown as MapData)
  }

  it('a line grazing the pilaster at a corridor mouth is blocked, both ways', () => {
    const nav = mouth()
    // From inside the corridor out into the room, 5 cm past the corner at (15, 15)
    expect(hasLineOfSight(nav, 14.5, 13, 15.4, 17)).toBe(false)
    expect(hasLineOfSight(nav, 15.4, 17, 14.5, 13)).toBe(false)
  })

  it('a line clear of the pilaster still sees', () => {
    const nav = mouth()
    expect(hasLineOfSight(nav, 13, 13, 15.4, 17)).toBe(true)
    expect(hasLineOfSight(nav, 15.4, 17, 13, 13)).toBe(true)
    // Down the middle of the corridor and on into the room
    expect(hasLineOfSight(nav, 13.5, 3, 13.5, 25)).toBe(true)
  })

  it('posts stand only where a wall ends at a vertex, door posts beside a doorway', () => {
    const cell = new Uint8Array(W * W)
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) if (j >= 5 || i === 4) cell[j * W + i] = 1
    const door = { id: 0, i: 4, j: 4, axis: 'z', dir: 1, from: 0, to: 1, boss: false }
    const nav = createNav({ w: W, h: W, cell, pillars: [], room: new Int16Array(W * W), rooms: [], doors: [door] } as unknown as MapData)
    const post = (i: number, j: number) => nav.posts![j * (W + 1) + i]
    expect(post(4, 5)).toBeCloseTo(0.4) // the door frame's posts
    expect(post(5, 5)).toBeCloseTo(0.4)
    expect(post(4, 2)).toBeCloseTo(0.3) // a corridor wall's pilaster
    expect(post(10, 10)).toBe(0) // open floor
    expect(post(10, 2)).toBe(0) // deep in the void
  })
})

describe('a charged shot looks charged', () => {
  it('a charge shot carries its tail and rings; a quick shot does not', () => {
    const r = setup(50, 20, false)
    const p = fire(r, 'pellet', 24)
    expect(p.aura ?? null).toBeNull()
    const c = fire(r, 'charge3', 24)
    expect(c.aura?.visible).toBe(true)
    r.sys.update(DT)
    r.sys.sync(1)
    // Faces its flight (+z), and sheds all three rings at a full charge
    expect(c.aura!.position.z).toBeCloseTo(c.z)
    const rings = c.aura!.children.slice(2)
    expect(rings.filter(m => m.visible)).toHaveLength(3)
  })

  it('a level-1 shot sheds one ring, and the aura goes with the shot', () => {
    const r = setup(DOOR_Z + 5, 20)
    const s = fire(r, 'charge1', 24)
    expect(s.aura!.children.slice(2).filter(m => m.visible)).toHaveLength(1)
    fly(r, s)
    expect(s.aura!.visible).toBe(false)
  })
})
