// @vitest-environment jsdom
// The Grand Master Bot (#101): Vex's button, the ten Masters assembling on
// the roof, then four parts in Mega Man 2's Wily Machine order — the arms, the
// feet, the head, the core — one weak spot at a time; its state rides in the
// climb's save.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Group } from 'three'
import { GrandMaster, GM_PHASES, GM_HP_MUL, WEAK_SPOT_MUL, WEAKNESS_MUL, type GmHost } from '@/game/sim/grandMaster'
import { generateVexFortress } from '@/game/world/stages/fortress'
import { hud } from '@/game/state/hud'
import { banner } from '@/game/state/banner'
import type { Enemy, Shot } from '@/game/sim/world'

const rig = () => {
  const map = generateVexFortress(3)
  const roof = map.rooms[map.terrain!.bossStages![0]!]!
  let press = false
  const host = {
    player: { x: 0, y: 0, z: 0, px: 0, pz: 0, py: 0, vx: 0, vz: 0, vy: 0, yaw: 0, safeY: 0, pitch: 0, ground: true },
    combat: { maxHp: 100 },
    vex: { maxHp: 1000, dmg: 20 } as unknown as Enemy,
    dmg: 20,
    markers: { spawn: vi.fn() },
    shocks: { spawn: vi.fn() },
    fx: { sparks: vi.fn(), orbBurst: vi.fn() },
    propParent: () => new Group(),
    sfx: vi.fn(),
    say: vi.fn(),
    shake: vi.fn(),
    hitPlayer: vi.fn(() => 'hit'),
    hurtMachines: vi.fn(),
    fireEnemyShot: vi.fn(),
    spawnWave: vi.fn(),
    pull: vi.fn(),
    skyFlash: vi.fn(),
    keepRetryPoint: vi.fn(),
    pressed: () => press,
    onDefeated: vi.fn()
  }
  const gm = new GrandMaster(host as unknown as GmHost, roof)
  const step = (s: number) => { for (let t = 0; t < s; t += 1 / 30) gm.update(1 / 30, 0, host.player as never, true) }
  return { gm, host, step, roof, setPress: (v: boolean) => { press = v } }
}

/** A player shot right on part `id`'s weak spot (or `off` m beside it). */
const shotAt = (gm: GrandMaster, id: string, dmg: number, o: Partial<Shot> = {}, off = 0): Shot => {
  const p = gm.parts.find(q => q.id === id)!
  const at = gm.root.position
  return { owner: 'player', x: at.x + p.wx + off, y: p.wy + at.y, z: at.z + p.wz, radius: 0.1, dmg, crit: false, kind: 'charge2', weapon: '', ...o } as unknown as Shot
}

beforeEach(() => { hud.bossName = ''; hud.bossMarks = [] })

describe('the Grand Master', () => {
  it('sleeps until Vex falls; then the button, the rumble, the drop to the roof, the assembly, and it wakes', () => {
    const r = rig()
    r.step(5)
    expect(r.gm.state).toBe('dormant')
    r.gm.start(10, 10)
    r.step(4)
    expect(r.host.say).toHaveBeenCalledWith('hint.gm.button')
    r.step(5.5)
    // On the roof, facing it, the stick held.
    expect(Math.floor(r.host.player.z / 3)).toBe(r.roof.z0 + r.roof.h - 2)
    expect(r.gm.locksMove()).toBe(true)
    const seq = banner.seq
    r.step(6)
    expect(r.gm.state).toBe('fight')
    expect(banner.seq).toBe(seq + 1)
    expect(banner.kind).toBe('grandMaster')
    expect(hud.bossName).toBe('boss.grandMaster')
    expect(hud.bossMarks).toHaveLength(3)
    expect(r.host.keepRetryPoint).toHaveBeenCalledTimes(1)
    expect(r.host.say).toHaveBeenCalledWith('hint.gm.arms')
  })

  it('a press once the rumble has begun skips straight to the fight', () => {
    const r = rig()
    r.gm.start(10, 10)
    r.step(4)
    r.setPress(true)
    r.step(0.1)
    expect(r.gm.state).toBe('fight')
  })

  it('holds the giant\'s health against Vex\'s, shared by its parts', () => {
    const r = rig()
    const total = r.gm.parts.reduce((a, p) => a + p.max, 0)
    expect(total).toBeCloseTo(1000 * GM_HP_MUL, -1)
  })

  it('only the live part takes damage; the weak spot and the part\'s weakness hit harder', () => {
    const r = rig()
    r.gm.start(10, 10)
    r.setPress(true); r.step(4); r.setPress(false)
    const head = r.gm.part('head')
    expect(r.gm.shot(shotAt(r.gm, 'head', 50))).toBe(true)
    expect(head.hp).toBe(head.max)
    const arm = r.gm.part('armL')
    r.gm.shot(shotAt(r.gm, 'armL', 10, {}, 1.2))
    expect(arm.max - arm.hp).toBe(10)
    r.gm.shot(shotAt(r.gm, 'armL', 10))
    expect(arm.max - arm.hp).toBe(10 + 10 * WEAK_SPOT_MUL)
    const before = arm.hp
    r.gm.shot(shotAt(r.gm, 'armL', 10, { kind: 'special', weapon: arm.weakTo! } as never))
    expect(before - arm.hp).toBe(10 * WEAK_SPOT_MUL * WEAKNESS_MUL)
  })

  it('arms, then feet, then head, then the core; then it falls and the objective is done', () => {
    const r = rig()
    r.gm.start(10, 10)
    r.setPress(true); r.step(4); r.setPress(false)
    for (const set of GM_PHASES) {
      for (const id of set) {
        const p = r.gm.part(id)
        while (!p.gone) r.gm.shot(shotAt(r.gm, id, 500))
      }
      r.step(0.2)
    }
    expect(r.host.say).toHaveBeenCalledWith('hint.gm.feet')
    expect(r.host.say).toHaveBeenCalledWith('hint.gm.head')
    expect(r.host.say).toHaveBeenCalledWith('hint.gm.body')
    expect(r.gm.state).toBe('dying')
    r.step(3)
    expect(r.gm.state).toBe('done')
    expect(r.host.onDefeated).toHaveBeenCalledTimes(1)
    expect(hud.bossName).toBe('')
  })

  it('attacks per part: the arms fire, the feet send waves along the floor', () => {
    const r = rig()
    r.gm.start(10, 10)
    r.setPress(true); r.step(4); r.setPress(false)
    r.step(5)
    expect(r.host.fireEnemyShot).toHaveBeenCalled()
    for (const id of GM_PHASES[0]!) { const p = r.gm.part(id); while (!p.gone) r.gm.shot(shotAt(r.gm, id, 500)) }
    r.step(4)
    expect(r.host.spawnWave).toHaveBeenCalled()
  })

  it('a reload or retry comes back to the fight with every broken part still broken; a fallen giant stays fallen', () => {
    const r = rig()
    r.gm.start(10, 10)
    r.setPress(true); r.step(4); r.setPress(false)
    for (const id of GM_PHASES[0]!) { const p = r.gm.part(id); while (!p.gone) r.gm.shot(shotAt(r.gm, id, 500)) }
    const saved = r.gm.save()
    const again = rig()
    again.gm.restore(saved)
    expect(again.gm.state).toBe('fight')
    expect(again.gm.part('armL').gone && again.gm.part('armR').gone).toBe(true)
    expect(again.host.keepRetryPoint).not.toHaveBeenCalled()
    const done = rig()
    done.gm.restore({ s: 'done', hp: [0, 0, 0, 0, 0, 0] })
    expect(done.gm.state).toBe('done')
    expect(done.gm.blocking).toBe(false)
  })
})
