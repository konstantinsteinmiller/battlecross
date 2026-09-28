// Weak spots (data/weakspots.ts, sim/combat.ts): every machine and every
// Core Master has one; a shot fired with the crosshair on it lands there for
// ×1.5 and the amber KRANCK!, while a shot the auto-aim steered never does,
// however close it passes. A back, a tail or a core is only open from behind.

import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/game/fx/markers', async () => {
  const { Mesh, Group } = await import('three')
  return { makeBlobShadow: () => new Mesh(), makeTeleRing: () => new Group(), setTeleRing: () => {} }
})
vi.mock('@/game/world/textures', async (orig) => {
  const { Texture } = await import('three')
  return { ...(await orig<object>()), glowTexture: () => new Texture(), ringTexture: () => new Texture() }
})

import { Scene } from 'three'
import {
  BOSS_WEAK, ENEMY_WEAK, WEAK_SPOT_MUL, raySphere, weakSpotAt, weakSpotFacing, weakSpotOf, weakSpotUnderRay,
  type WeakBody
} from '@/game/data/weakspots'
import { createEnemy } from '@/game/sim/enemies'
import { CombatSystem, type CombatHost } from '@/game/sim/combat'
import { createNav } from '@/game/world/nav'
import type { MapData } from '@/game/world/levelGen'
import { THEMES } from '@/game/world/themes'
import { hudEvents } from '@/game/state/hud'
import type { Enemy, Shot, World } from '@/game/sim/world'
import type { EnemyKind } from '@/game/models/enemies'
import type { BossId } from '@/game/models/bosses'

const DT = 1 / 60
const noop = (): void => {}

beforeEach(() => {
  let seed = 11
  const dice = vi.spyOn(Math, 'random').mockImplementation(() => ((seed = (seed * 16807) % 2147483647) / 2147483647))
  hudEvents.length = 0
  return () => dice.mockRestore()
})

const body = (o: Partial<WeakBody> = {}): WeakBody =>
  ({ x: 0, y: 0, z: 0, yaw: 0, floor: 0, elite: false, boss: false, kind: 'trooper', def: { aimY: 1 }, ...o })

describe('Weak spots: the data', () => {
  const kinds: EnemyKind[] = ['hardhat', 'trooper', 'heli', 'hopper', 'roller', 'brute', 'turret', 'golem']
  const bosses: BossId[] = ['scrapper', 'blazeMaster', 'frostMaster', 'voltMaster', 'galeMaster', 'vexMk1']

  it('every machine and every boss has one', () => {
    for (const k of kinds) expect(ENEMY_WEAK[k], k).toBeDefined()
    for (const b of bosses) expect(BOSS_WEAK[b], b).toBeDefined()
  })
  it('the androids are hit in the head', () => {
    for (const k of ['hardhat', 'trooper', 'brute'] as const) expect(ENEMY_WEAK[k].part).toBe('head')
    for (const b of ['blazeMaster', 'frostMaster', 'voltMaster', 'galeMaster'] as const) expect(BOSS_WEAK[b].part).toBe('head')
  })
  it('the robots are open at the back or the tail', () => {
    for (const k of ['heli', 'hopper', 'roller', 'turret', 'golem'] as const) {
      expect(['back', 'tail', 'core']).toContain(ENEMY_WEAK[k].part)
      expect(ENEMY_WEAK[k].fwd, k).toBeLessThan(0)
    }
  })
  it('a boss uses its own spot, a machine its kind\'s', () => {
    expect(weakSpotOf(body({ boss: true, def: { aimY: 1, id: 'vexMk1' } }))).toBe(BOSS_WEAK.vexMk1)
    expect(weakSpotOf(body({ kind: 'heli' }))).toBe(ENEMY_WEAK.heli)
  })
  it('the multiplier is ×1.5', () => expect(WEAK_SPOT_MUL).toBe(1.5))
})

describe('Weak spots: geometry', () => {
  const p = { x: 0, y: 0, z: 0, r: 0 }
  it('turns with the machine and stands on its floor', () => {
    weakSpotAt(body({ kind: 'hopper', x: 5, z: 5, floor: 2 }), p)
    expect(p.z).toBeCloseTo(5 + ENEMY_WEAK.hopper.fwd)
    expect(p.y).toBeCloseTo(2 + ENEMY_WEAK.hopper.up)
    weakSpotAt(body({ kind: 'hopper', x: 5, z: 5, yaw: Math.PI / 2 }), p)
    expect(p.x).toBeCloseTo(5 + ENEMY_WEAK.hopper.fwd)
    expect(p.z).toBeCloseTo(5)
  })
  it('an elite is bigger, and so is its spot', () => {
    weakSpotAt(body({ elite: true }), p)
    expect(p.y).toBeCloseTo(ENEMY_WEAK.trooper.up * 1.18)
    expect(p.r).toBeCloseTo(ENEMY_WEAK.trooper.r * 1.18)
  })
  it('raySphere: hits in front, misses beside and behind', () => {
    expect(raySphere(0, 0, 0, 0, 0, 1, 0, 0, 10, 1)).toBeCloseTo(9)
    expect(raySphere(0, 0, 0, 0, 0, 1, 1.5, 0, 10, 1)).toBe(-1)
    expect(raySphere(0, 0, 0, 0, 0, 1, 0, 0, -10, 1)).toBe(-1)
  })
  it('a back is only open from behind; a head from anywhere', () => {
    const hop = body({ kind: 'hopper' }) // faces +z, its back at −z
    expect(weakSpotFacing(hop, 0, 8)).toBe(false)
    expect(weakSpotFacing(hop, 0, -8)).toBe(true)
    expect(weakSpotFacing(body(), 0, 8)).toBe(true)
    expect(weakSpotFacing(body(), 0, -8)).toBe(true)
  })
  it('the crosshair finds the spot it is on — and only that', () => {
    const e = body({ z: 10 })
    const s = weakSpotAt(e, { x: 0, y: 0, z: 0, r: 0 })
    const yes = () => true
    // Straight at the head from the front
    const d = Math.hypot(s.x, s.y - 1.5, s.z)
    expect(weakSpotUnderRay(0, 1.5, 0, s.x / d, (s.y - 1.5) / d, s.z / d, [e], yes, yes)?.e).toBe(e)
    // At the chest: no spot
    expect(weakSpotUnderRay(0, 1, 0, 0, 0, 1, [e], yes, yes)).toBeNull()
    // Behind a wall, or out of reach: no spot
    expect(weakSpotUnderRay(0, 1.5, 0, s.x / d, (s.y - 1.5) / d, s.z / d, [e], yes, () => false)).toBeNull()
    expect(weakSpotUnderRay(0, 1.5, 0, s.x / d, (s.y - 1.5) / d, s.z / d, [e], yes, yes, 5)).toBeNull()
  })
})

// ─── In combat ───────────────────────────────────────────────────────────────

const W = 20
const openMap = (): MapData => {
  const cell = new Uint8Array(W * W).fill(1)
  return { w: W, h: W, cell, pillars: [], room: new Int16Array(W * W), rooms: [], doors: [] } as unknown as MapData
}

/** A turret (it never moves, its core on its back) at (30, 30), a real CombatSystem. */
const setup = (): { sys: CombatSystem; e: Enemy } => {
  const map = openMap()
  const e = createEnemy('turret', 1, 30, 30, 0, { theme: THEMES.scrapyard })
  e.hp = e.maxHp = 1e6
  const w = {
    scene: new Scene(), map, nav: createNav(map), time: 0,
    player: { x: 30, z: 40, yaw: Math.PI, pitch: 0 },
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
  return { sys: new CombatSystem(w), e }
}

const fly = (sys: CombatSystem, s: Shot): void => {
  for (let n = 0; n < 120 && s.active; n++) sys.update(DT)
}

/** A pellet from behind the turret (z = 38) straight at a point. */
const shootAt = (sys: CombatSystem, x: number, y: number, z: number, target: Enemy | null, weakOf: Enemy | null): Shot => {
  const oy = y
  const d = Math.hypot(x - 30, y - oy, z - 38)
  return sys.spawnPlayerShot('pellet', 30, oy, 38, (x - 30) / d, (y - oy) / d, (z - 38) / d, 10, false, target, weakOf)
}

const kranks = (): number => hudEvents.filter(h => h.t === 'kranck').length

describe('Weak spots: in combat', () => {
  it('a shot fired on the spot lands there: ×1.5 and KRANCK!', () => {
    const { sys, e } = setup()
    const p = weakSpotAt(e, { x: 0, y: 0, z: 0, r: 0 })
    const hp0 = e.hp
    fly(sys, shootAt(sys, p.x, p.y, p.z, null, e))
    expect(hp0 - e.hp).toBe(Math.round(10 * e.def.armor * WEAK_SPOT_MUL))
    expect(kranks()).toBe(1)
  })

  it('an auto-aimed shot never lands one, even aimed dead on the spot', () => {
    const { sys, e } = setup()
    const p = weakSpotAt(e, { x: 0, y: 0, z: 0, r: 0 })
    const hp0 = e.hp
    fly(sys, shootAt(sys, p.x, p.y, p.z, e, null))
    expect(hp0 - e.hp).toBe(Math.round(10 * e.def.armor))
    expect(kranks()).toBe(0)
  })

  it('damageEnemy with weakSpot multiplies and pushes the label', () => {
    const { sys, e } = setup()
    const hp0 = e.hp
    sys.damageEnemy(e, 20, { crit: false, charge: 1, fromX: 30, fromZ: 38, x: 30, y: 1, z: 30, color: '#fff', weakSpot: true })
    expect(hp0 - e.hp).toBe(Math.round(20 * e.def.armor * 1.5))
    expect(kranks()).toBe(1)
  })
})
