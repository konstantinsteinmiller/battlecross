// The tutorial walkthrough (src/game/sim/walkthrough.ts): every door on the
// path from the pad to the Scrapper starts locked, and each room's door out
// opens only once its lesson is DONE — the drone popped, the Hardhat down and
// the crate broken, the Trooper down and a block, the Stomper down and a
// slide, the chest open. Driven on the real tutorial map with a fake mission
// around it, so the gating order, each gate's condition, the stand-in
// teachers and the resume are pinned without a GPU.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateMap, roomCenter, type MapData } from '@/game/world/levelGen'
import { createNav, hasLineOfSight, isSolidAt } from '@/game/world/nav'
import { tutorialQuest } from '@/game/data/quests'
import { profile, writeSnapshot, type MissionSnapshot } from '@/game/state/profile'
import { Coach, type CoachContext } from '@/game/sim/coach'
import type { Enemy } from '@/game/sim/world'

// The real rigs bake canvas textures jsdom cannot draw: a plain record is all
// the walkthrough and the spawner need from a machine.
vi.mock('@/game/sim/enemies', () => ({
  createEnemy: (kind: string, level: number, x: number, z: number, room: number, opts: { elite?: boolean } = {}) => ({
    id: Math.random(), kind, level, x, z, y: 0, room, elite: !!opts.elite, hp: 30, maxHp: 30, state: 'idle',
    awake: false, boss: false, yaw: 0, def: { aimY: 0, hitR: 0.5 }
  })
}))

const { Walkthrough, planWalkthrough, stepsFor, doorwayOf, helperSpot, MAX_HELPERS } = await import('@/game/sim/walkthrough')
const { spawnTutorial } = await import('@/game/sim/spawn')
const { roomAt } = await import('@/game/sim/lessons')
type Host = import('@/game/sim/walkthrough').WalkHost
type Walk = InstanceType<typeof Walkthrough>

const tutorialMap = (): MapData => {
  const q = tutorialQuest()
  return generateMap({ seed: q.seed, rooms: q.rooms, boss: true })
}

/** A fake mission: doors as a map of states, a drone flag, a crate flag, one chest. */
const makeWalk = (map: MapData = tutorialMap()) => {
  const plan = planWalkthrough(map)
  const doors = new Map<number, 'held' | 'open'>()
  const s = {
    droneUp: true, crateBroken: false, crateRooms: [] as number[], brought: [] as string[], saves: 0,
    spot: { x: 0, z: 0, on: false }
  }
  const chests = [{ opened: false }]
  const enemies: Enemy[] = []
  const host: Host = {
    time: 0,
    map,
    player: { x: map.start.x, z: map.start.z },
    enemies,
    lessons: {
      get droneUp() { return s.droneUp },
      get crateBroken() { return s.crateBroken },
      startCrate: (room) => { s.crateRooms.push(room); return true },
      spotlight: (x, z, on) => { s.spot = { x, z, on } }
    },
    objects: { chests },
    holdDoor: (id) => { doors.set(id, 'held') },
    releaseDoor: (id) => { doors.set(id, 'open') },
    bringIn: (kind, room) => {
      enemies.push({ kind, room, state: 'engage', boss: false } as Enemy)
      s.brought.push(kind)
      return true
    },
    checkpoint: () => { s.saves++ }
  }
  const gate = (k: number) => plan.gates[k]!
  const [cx, cz] = roomCenter(map.rooms[plan.gates.find(g => g.steps.includes('chest'))!.room]!)
  const walk = new Walkthrough(host, plan, { id: 0, x: cx, z: cz })
  return { map, plan, doors, s, chests, enemies, host, walk, gate }
}

type Rig = ReturnType<typeof makeWalk>

/** Step the walkthrough for `secs` of game time. */
const run = (r: Rig, secs: number, fighting = false) => {
  for (let t = 0; t < secs; t += 1 / 30) {
    r.host.time += 1 / 30
    r.walk.update(true, fighting)
  }
}

/** Stand in the middle of a room. */
const enter = (r: Rig, room: number) => {
  const [x, z] = roomCenter(r.map.rooms[room]!)
  r.host.player.x = x
  r.host.player.z = z
}

/** A machine of `room`, standing. */
const machine = (r: Rig, room: number, kind = 'hardhat'): Enemy => {
  const e = { kind, room, state: 'engage', boss: false } as Enemy
  r.enemies.push(e)
  return e
}

const held = (r: Rig): number[] => [...r.doors].filter(([, v]) => v === 'held').map(([k]) => k).sort((a, b) => a - b)
const isOpen = (r: Rig, k: number): boolean => r.doors.get(r.gate(k).door) === 'open'

/** Pass the first `n` gates the honest way. */
const passTo = (r: Rig, n: number) => {
  if (n > 0) {
    r.s.droneUp = false
    run(r, 1)
  }
  if (n > 1) {
    enter(r, r.gate(1).room)
    run(r, 1.5)
    r.s.crateBroken = true
    run(r, 1)
  }
  if (n > 2) {
    r.walk.noteBlock()
    enter(r, r.gate(2).room)
    run(r, 1)
  }
  if (n > 3) {
    r.walk.noteSlide()
    enter(r, r.gate(3).room)
    run(r, 1)
  }
  expect(r.walk.passed).toBe(n)
}

beforeEach(() => {
  profile.tips = {}
})

describe('the tutorial map', () => {
  it('has four rooms between the pad and the Scrapper, one lesson each', () => {
    const map = tutorialMap()
    const { path, gates } = planWalkthrough(map)
    expect(path).toHaveLength(5)
    expect(map.rooms[path[0]!]!.role).toBe('start')
    expect(gates.map(g => g.steps)).toEqual([['charge'], ['crate'], ['block'], ['slide'], ['chest']])
    // Each gate's door leads on along the path; the last is the boss shutter.
    gates.forEach((g, k) => {
      const d = map.doors[g.door]!
      expect(d.from).toBe(g.room)
      if (k + 1 < gates.length) expect(d.to).toBe(gates[k + 1]!.room)
    })
    expect(map.doors[gates[4]!.door]!.boss).toBe(true)
    expect(map.rooms[map.doors[gates[4]!.door]!.to]!.role).toBe('boss')
  })

  it('starts in a one-door room, facing that door', () => {
    const map = tutorialMap()
    const out = map.doors.filter(d => d.from === 0 || d.to === 0)
    expect(out).toHaveLength(1)
    const d = out[0]!
    const want = Math.atan2(-((d.i + 0.5) * 3 - map.start.x), -((d.j + 0.5) * 3 - map.start.z))
    expect(map.start.yaw).toBeCloseTo(want, 5)
  })

  it('folds lessons together on a shorter path, and pads a longer one', () => {
    expect(stepsFor(4)).toEqual([['charge'], ['crate'], ['block'], ['slide', 'chest']])
    expect(stepsFor(3)).toEqual([['charge'], ['crate', 'block'], ['slide', 'chest']])
    expect(stepsFor(2)).toEqual([['charge'], ['crate', 'block', 'slide', 'chest']])
    expect(stepsFor(1)).toEqual([['charge', 'crate', 'block', 'slide', 'chest']])
    // The chest always opens the boss shutter; extra rooms only need clearing.
    expect(stepsFor(7)).toEqual([['charge'], ['crate'], ['block'], ['slide'], ['clear'], ['clear'], ['chest']])
    // Every lesson is taught exactly once, whatever the length.
    for (let n = 1; n <= 9; n++) {
      const all = stepsFor(n).flat().filter(s => s !== 'clear').sort()
      expect(all).toEqual(['block', 'charge', 'chest', 'crate', 'slide'])
    }
  })

  it('a map with no boss room has no walkthrough', () => {
    const map = generateMap({ seed: 7, rooms: 6, boss: false })
    expect(planWalkthrough(map).gates).toHaveLength(0)
  })
})

describe('door gating', () => {
  it('locks every door on the path at the start, and nothing else', () => {
    const r = makeWalk()
    r.walk.start()
    expect(held(r)).toEqual(r.plan.gates.map(g => g.door).sort((a, b) => a - b))
    expect(r.walk.active).toBe(true)
  })

  it('opens them one at a time, in path order, each only when its room is done', () => {
    const r = makeWalk()
    r.walk.start()
    for (let n = 0; n < 5; n++) {
      // Everything past the gate being taught stays shut.
      for (let k = n; k < 5; k++) expect(isOpen(r, k)).toBe(false)
      if (n < 4) passTo(r, n + 1)
    }
  })

  it('opens a moment after the lesson, not on the same frame', () => {
    const r = makeWalk()
    r.walk.start()
    r.s.droneUp = false
    run(r, 0.5)
    expect(isOpen(r, 0)).toBe(false)
    run(r, 0.5)
    expect(isOpen(r, 0)).toBe(true)
    expect(r.s.saves).toBeGreaterThan(0)
  })

  it('never while the game is not playing (a modal, the beam-in)', () => {
    const r = makeWalk()
    r.walk.start()
    r.s.droneUp = false
    for (let t = 0; t < 3; t += 1 / 30) {
      r.host.time += 1 / 30
      r.walk.update(false, false)
    }
    expect(isOpen(r, 0)).toBe(false)
  })
})

describe('each room', () => {
  it('start: the door waits for the drone to pop, however long the player looks around', () => {
    const r = makeWalk()
    r.walk.start()
    expect(r.walk.needsDrone).toBe(true)
    run(r, 30)
    expect(isOpen(r, 0)).toBe(false)
    r.s.droneUp = false
    run(r, 1)
    expect(isOpen(r, 0)).toBe(true)
    expect(r.walk.needsDrone).toBe(false)
  })

  it('second: the Hardhat down, then the crate lesson in that room; the crate opens the door', () => {
    const r = makeWalk()
    r.walk.start()
    passTo(r, 1)
    const room = r.gate(1).room
    const hardhat = machine(r, room)
    enter(r, room)
    run(r, 3, true)
    expect(r.s.crateRooms).toEqual([])
    hardhat.state = 'dead'
    run(r, 0.6)
    expect(r.s.crateRooms).toEqual([]) // the room settles first
    run(r, 1)
    expect(r.s.crateRooms).toEqual([room])
    run(r, 3)
    expect(isOpen(r, 1)).toBe(false)
    r.s.crateBroken = true
    run(r, 1)
    expect(isOpen(r, 1)).toBe(true)
  })

  it('second: the crate waits until the player is in the room', () => {
    const r = makeWalk()
    r.walk.start()
    passTo(r, 1)
    run(r, 3) // still in the start room
    expect(r.s.crateRooms).toEqual([])
    enter(r, r.gate(1).room)
    run(r, 1.5)
    expect(r.s.crateRooms).toEqual([r.gate(1).room])
  })

  it('third: the Trooper down AND a block — a block from the room before counts', () => {
    const r = makeWalk()
    r.walk.start()
    passTo(r, 2)
    const room = r.gate(2).room
    const trooper = machine(r, room, 'trooper')
    enter(r, room)
    r.walk.noteBlock()
    run(r, 2, true)
    expect(isOpen(r, 2)).toBe(false)
    trooper.state = 'dead'
    run(r, 1)
    expect(isOpen(r, 2)).toBe(true)
    expect(r.s.brought).toEqual([])
  })

  it('third: a Trooper felled before any block brings in a Rotor Drone to block', () => {
    const r = makeWalk()
    r.walk.start()
    passTo(r, 2)
    const room = r.gate(2).room
    machine(r, room, 'trooper').state = 'dead'
    enter(r, room)
    run(r, 2)
    expect(r.s.brought).toEqual(['heli'])
    expect(isOpen(r, 2)).toBe(false)
    // The ram is blocked, the drone goes down: the door opens.
    r.walk.noteBlock()
    r.enemies[r.enemies.length - 1]!.state = 'dead'
    run(r, 1)
    expect(isOpen(r, 2)).toBe(true)
    expect(r.s.brought).toEqual(['heli'])
  })

  it('third: never traps anyone — after a few stand-ins the door opens anyway', () => {
    const r = makeWalk()
    r.walk.start()
    passTo(r, 2)
    const room = r.gate(2).room
    machine(r, room, 'trooper').state = 'dead'
    enter(r, room)
    for (let k = 0; k < MAX_HELPERS; k++) {
      run(r, 2)
      expect(isOpen(r, 2)).toBe(false)
      for (const e of r.enemies) e.state = 'dead'
    }
    run(r, 2)
    expect(r.s.brought).toHaveLength(MAX_HELPERS)
    expect(isOpen(r, 2)).toBe(true)
  })

  it('fourth: the Stomper down AND a slide; felled first, another Stomper comes', () => {
    const r = makeWalk()
    r.walk.start()
    passTo(r, 3)
    const room = r.gate(3).room
    machine(r, room, 'hopper').state = 'dead'
    enter(r, room)
    run(r, 2)
    expect(r.s.brought).toEqual(['hopper'])
    r.walk.noteSlide()
    run(r, 2)
    expect(isOpen(r, 3)).toBe(false) // the newcomer still stands
    r.enemies[r.enemies.length - 1]!.state = 'dead'
    run(r, 1)
    expect(isOpen(r, 3)).toBe(true)
  })

  it('fifth: the chest glows until it is opened, and opens the boss shutter', () => {
    const r = makeWalk()
    r.walk.start()
    passTo(r, 4)
    run(r, 0.1)
    expect(r.s.spot.on).toBe(true)
    run(r, 5)
    expect(isOpen(r, 4)).toBe(false)
    expect(r.walk.active).toBe(true)
    r.chests[0]!.opened = true
    run(r, 1)
    expect(r.s.spot.on).toBe(false)
    expect(isOpen(r, 4)).toBe(true)
    expect(r.walk.active).toBe(false)
  })

  it('a folded path teaches two lessons in one room, in order', () => {
    // The old tutorial map: only two rooms between the pad and the boss.
    const r = makeWalk(generateMap({ seed: 20260923, rooms: 7, boss: true }))
    expect(r.plan.gates.map(g => g.steps)).toEqual([['charge'], ['crate', 'block'], ['slide', 'chest']])
    r.walk.start()
    passTo(r, 1)
    const room = r.gate(1).room
    machine(r, room).state = 'dead'
    enter(r, room)
    run(r, 2)
    // The crate first; no stand-in while it is being taught…
    expect(r.s.crateRooms).toEqual([room])
    expect(r.s.brought).toEqual([])
    r.s.crateBroken = true
    run(r, 2)
    // …then the block, which nobody has done yet: a Rotor Drone.
    expect(r.s.brought).toEqual(['heli'])
    r.walk.noteBlock()
    r.enemies[r.enemies.length - 1]!.state = 'dead'
    run(r, 1)
    expect(isOpen(r, 1)).toBe(true)
    // The last room: the chest glows while the Stomper is still to beat.
    enter(r, r.gate(2).room)
    run(r, 0.1)
    expect(r.s.spot.on).toBe(true)
  })

  it('a machine of another room still fighting holds the gate', () => {
    const r = makeWalk()
    r.walk.start()
    passTo(r, 2)
    r.walk.noteBlock()
    enter(r, r.gate(2).room)
    run(r, 2, true)
    expect(isOpen(r, 2)).toBe(false)
    run(r, 1)
    expect(isOpen(r, 2)).toBe(true)
  })
})

describe('resume', () => {
  it('restores the gates passed, locks only the rest, and needs no drone', () => {
    const a = makeWalk()
    a.walk.start()
    passTo(a, 3)
    const saved = JSON.parse(JSON.stringify(a.walk.save())) as ReturnType<Walk['save']>
    expect(saved).toEqual({ gate: 3, crate: true, block: true, slide: false })
    const b = makeWalk()
    b.walk.restore(saved)
    b.walk.start()
    expect(b.walk.passed).toBe(3)
    expect(b.walk.needsDrone).toBe(false)
    expect(held(b)).toEqual([b.gate(3).door, b.gate(4).door].sort((x, y) => x - y))
    // …and carries on from there: the slide still has to happen.
    machine(b, b.gate(3).room, 'hopper').state = 'dead'
    enter(b, b.gate(3).room)
    run(b, 2)
    expect(b.s.brought).toEqual(['hopper'])
  })

  it('a block, a slide or a broken crate survive a resume mid-room', () => {
    const a = makeWalk()
    a.walk.start()
    passTo(a, 1)
    enter(a, a.gate(1).room)
    run(a, 1.5)
    a.s.crateBroken = true
    a.walk.noteSlide()
    // Saved on the frame the crate broke: before the door had its moment.
    run(a, 0.1)
    const saved = a.walk.save()
    expect(saved).toMatchObject({ gate: 1, crate: true, slide: true })
    const b = makeWalk()
    b.walk.restore(saved)
    b.walk.start()
    enter(b, b.gate(1).room)
    run(b, 1)
    expect(isOpen(b, 1)).toBe(true)
  })

  it('reads a malformed or missing save as a fresh start', () => {
    const r = makeWalk()
    r.walk.restore(undefined)
    expect(r.walk.passed).toBe(0)
    r.walk.restore({ gate: 'x', crate: 1, block: 'yes', slide: null } as unknown as ReturnType<Walk['save']>)
    expect(r.walk.save()).toEqual({ gate: 0, crate: false, block: false, slide: false })
    r.walk.restore({ gate: 99, crate: false, block: false, slide: false })
    expect(r.walk.passed).toBe(5)
    expect(r.walk.active).toBe(false)
  })
})

describe('walkthroughActive', () => {
  it('is true until the chest room\'s door opens, then false for good', () => {
    const r = makeWalk()
    r.walk.start()
    const seen: boolean[] = []
    for (let n = 1; n <= 4; n++) {
      passTo(r, n)
      seen.push(r.walk.active)
    }
    r.chests[0]!.opened = true
    run(r, 1)
    seen.push(r.walk.active)
    run(r, 10)
    seen.push(r.walk.active)
    expect(seen).toEqual([true, true, true, true, false, false])
  })
})

describe('the coach, with the drone\'s lesson in focus', () => {
  const ctx = (time: number, over: Partial<CoachContext> = {}): CoachContext => ({
    time, family: 'touch', playing: true, combat: false, aimCandidate: false, teleBlock: false, teleRed: false,
    hp01: 1, tanks: 1, hasWeapon: false, canInteract: false, quiet: true, ...over
  })

  it('wants the stick and the camera on the very first frame on a phone', () => {
    const c = new Coach()
    c.update(ctx(0))
    const v = c.views()
    expect(v.map(h => h.id).sort()).toEqual(['look', 'move'])
    expect(v.every(h => h.family === 'touch')).toBe(true)
  })

  it('keeps them through the whole lesson until they are learned', () => {
    const c = new Coach()
    for (let t = 0; t < 40; t += 1 / 15) c.update(ctx(t, { aimCandidate: true }))
    const ids = c.views().map(h => h.id)
    expect(ids).toContain('move')
    expect(ids).toContain('look')
    expect(ids).not.toContain('fire')
  })
})

describe('the scripted cast', () => {
  const cast = async () => {
    const map = tutorialMap()
    const nav = createNav(map)
    const plan = planWalkthrough(map)
    const side = map.rooms.filter(r => r.role !== 'start' && r.role !== 'boss' && !plan.path.includes(r.id))
    const chestRooms = new Set([side[0]!.id])
    const enemies = await spawnTutorial(map, nav, plan, 1, { chestRooms })
    return { map, nav, plan, side, chestRooms, enemies }
  }

  it('puts exactly the teaching machine in each walkthrough room', async () => {
    const { plan, enemies } = await cast()
    const kinds = (room: number) => enemies.filter(e => e.room === room).map(e => e.kind)
    expect(kinds(plan.gates[0]!.room)).toEqual([])
    expect(kinds(plan.gates[1]!.room)).toEqual(['hardhat'])
    expect(kinds(plan.gates[2]!.room)).toEqual(['trooper'])
    expect(kinds(plan.gates[3]!.room)).toEqual(['hopper'])
    expect(kinds(plan.gates[4]!.room)).toEqual([])
  })

  it('side rooms: a Hardhat or two, or nothing where a chest waits; never a Guardroid or an elite', async () => {
    const { side, chestRooms, enemies } = await cast()
    for (const r of side) {
      const kinds = enemies.filter(e => e.room === r.id).map(e => e.kind)
      if (chestRooms.has(r.id)) expect(kinds).toEqual([])
      else {
        expect(kinds.length).toBeGreaterThanOrEqual(1)
        expect(kinds.length).toBeLessThanOrEqual(2)
        expect(kinds.every(k => k === 'hardhat')).toBe(true)
      }
    }
    expect(enemies.some(e => e.kind === 'brute' || e.elite)).toBe(false)
  })

  it('each teacher stands in sight of the door the player comes in by, and the same every time', async () => {
    const a = await cast()
    for (const g of a.plan.gates.slice(1, 4)) {
      const e = a.enemies.find(x => x.room === g.room)!
      const [dx, dz] = doorwayOf(a.map, g.room)
      expect(roomAt(a.map, dx, dz)).toBe(g.room)
      expect(hasLineOfSight(a.nav, dx, dz, e.x, e.z)).toBe(true)
      expect(isSolidAt(a.nav, e.x, e.z)).toBe(false)
    }
    const b = await cast()
    expect(b.enemies.map(e => [e.kind, e.room, e.x, e.z])).toEqual(a.enemies.map(e => [e.kind, e.room, e.x, e.z]))
  })

  it('a stand-in beams in inside the room, in sight, a few metres out', () => {
    const map = tutorialMap()
    const nav = createNav(map)
    const room = planWalkthrough(map).gates[2]!.room
    const [px, pz] = doorwayOf(map, room)
    const at = helperSpot(nav, map, room, px, pz, 0)!
    expect(at).not.toBeNull()
    expect(roomAt(map, at[0], at[1])).toBe(room)
    expect(hasLineOfSight(nav, px, pz, at[0], at[1])).toBe(true)
    const d = Math.hypot(at[0] - px, at[1] - pz)
    expect(d).toBeGreaterThanOrEqual(4)
    expect(d).toBeLessThanOrEqual(11)
  })
})

describe('flow', () => {
  beforeEach(() => {
    profile.world.tutorialDone = false
    profile.world.unlocked = ['scrapyard']
    profile.world.bosses = []
    writeSnapshot(null)
  })

  it('the Scrapyard story card replays the tutorial until it is done', async () => {
    const { storyFor } = await import('@/game/flow')
    expect(storyFor('scrapyard')?.template).toBe('tutorial')
    profile.world.tutorialDone = true
    profile.world.bosses = ['scrapper']
    expect(storyFor('scrapyard')).toBeNull()
  })

  it('a tutorial snapshot from before the walkthrough starts the tutorial over; a new one resumes', async () => {
    const { bootTarget } = await import('@/game/flow')
    const snap: MissionSnapshot = {
      quest: { ...tutorialQuest(), seed: 20260923 }, killed: [1], opened: [], doors: [0], collected: [], progress: 0,
      x: 10, z: 10, yaw: 0, hp: 50, we: 10, bolts: 5, xp: 12, kills: 1, t: 60, done: false
    }
    writeSnapshot(snap)
    const old = bootTarget()
    expect(old.kind === 'mission' && old.snapshot).toBeNull()
    expect(old.kind === 'mission' && old.quest.seed).toBe(tutorialQuest().seed)
    writeSnapshot({ ...snap, quest: tutorialQuest(), walk: { gate: 2, crate: true, block: false, slide: false } })
    const cur = bootTarget()
    expect(cur.kind === 'mission' && cur.snapshot?.walk?.gate).toBe(2)
  })
})
