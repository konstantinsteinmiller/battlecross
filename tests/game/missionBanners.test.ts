// The big moment banners (src/game/state/banner.ts) raised by the mission:
// ENEMY DEFEATED when a Core Master falls — once per boss, never for an
// ordinary machine — and GAME OVER when Flux goes down, with the defeat
// modal held back until that banner has had its BANNER_HOLD. (LEVEL CLEARED
// at the exit's lift-off is pinned in exitRun.test.ts.)

import { afterEach, describe, expect, it, vi } from 'vitest'
import { Color } from 'three'

vi.mock('@/game/audio/sfx', () => ({ sfx: () => {} }))
vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { setMode: () => {}, setWanted: () => {} } }))

import { Mission, type MissionSetup } from '@/game/sim/mission'
import { BANNER_HOLD, banner } from '@/game/state/banner'
import { hud } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { createInput, type Input } from '@/game/engine/input'
import { SECTORS } from '@/game/data/regions'
import { baseStats } from '@/game/sim/stats'
import type { Enemy } from '@/game/sim/world'

const STEP = 1 / 60

const mission = () => {
  const sector = SECTORS[0]!
  const setup: MissionSetup = {
    sector: sector.id, seed: 1, rooms: 1, boss: false, enemyLevel: 1, encounters: sector.encounters, stats: baseStats()
  }
  const m = new (Mission as unknown as new (s: MissionSetup, i: Input) => Mission)(setup, createInput())
  m.player = {
    x: 10, z: 10, px: 10, pz: 10, vx: 0, vz: 0, yaw: 0, pitch: 0, path: null, bob: 0, bobAmp: 0,
    y: 0, py: 0, vy: 0, ground: true, ladder: -1, plat: -1, air: 0, safeY: 0, mantle: 0, mx: 0, mz: 0
  }
  m.fx = { orbBurst: () => {}, riseRing: () => {} } as unknown as Mission['fx']
  m.vm = { coreColor: new Color('#ffa733') } as unknown as Mission['vm']
  m.objects = { onEnemyKilled: () => {} } as unknown as Mission['objects']
  m.weapons = { onKill: () => {} } as unknown as Mission['weapons']
  return m
}

const machine = (boss: boolean): Enemy => ({ boss, nameKey: boss ? 'boss.scrapper' : 'enemy.hardhat' }) as unknown as Enemy

afterEach(() => {
  hud.phase = 'boot'
  flow.modal = ''
})

describe('ENEMY DEFEATED', () => {
  it('goes up when a Core Master falls, once per boss', () => {
    const m = mission()
    const seq = banner.seq
    const boss = machine(true)
    m.onEnemyKilled(boss, 0)
    expect(banner.kind).toBe('bossDown')
    expect(banner.seq).toBe(seq + 1)
    // The same boss reported again: no second card.
    m.onEnemyKilled(boss, 0)
    expect(banner.seq).toBe(seq + 1)
    // A second boss gets its own.
    m.onEnemyKilled(machine(true), 0)
    expect(banner.seq).toBe(seq + 2)
  })

  it('never for an ordinary machine', () => {
    const m = mission()
    const seq = banner.seq
    for (let k = 0; k < 5; k++) m.onEnemyKilled(machine(false), 0)
    expect(banner.seq).toBe(seq)
  })
})

describe('GAME OVER', () => {
  it('goes up when Flux goes down, and the defeat modal waits out its hold', () => {
    const m = mission()
    hud.phase = 'play'
    const seq = banner.seq
    m.onPlayerDown()
    expect(hud.phase).toBe('dead')
    expect(banner.kind).toBe('gameOver')
    expect(banner.seq).toBe(seq + 1)
    const stepDead = (m as unknown as { stepDead(dt: number, rawDt: number): void }).stepDead.bind(m)
    let t = 0
    while (flow.modal !== 'defeat' && t < 10) {
      stepDead(STEP, STEP)
      t += STEP
    }
    expect(flow.modal).toBe('defeat')
    expect(t).toBeGreaterThanOrEqual(BANNER_HOLD.gameOver - 1e-9)
    expect(t).toBeLessThan(BANNER_HOLD.gameOver + 2 * STEP)
  })

  it('a second report of the same death changes nothing', () => {
    const m = mission()
    hud.phase = 'play'
    m.onPlayerDown()
    const seq = banner.seq
    m.onPlayerDown()
    expect(banner.seq).toBe(seq)
  })
})
