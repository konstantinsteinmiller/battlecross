// @vitest-environment jsdom
// ─── Manual save slots: pause menu → Save / Load, and Start New Game ───────
//
// Four slots a player copies the current game into and loads back from, to
// try out different builds. These pin what a slot holds (the playthrough, not
// the settings or the leaderboard identity), that loading swaps the whole
// playthrough and keeps the slots, that a new game clears the playthrough
// only, and that both stamp a save epoch the cloud merge honours — loading an
// EARLIER save must not be undone by the cloud copy of the later one.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

const STATE_KEY = 'bcross_state'

const GAME_A = {
  bc_version: 2,
  bc_level: 12,
  bc_gold: 900,
  bc_story: 4,
  bc_quests_done: 7,
  bc_hero: { xp: 10, attrs: { str: 20, dex: 5, int: 5, end: 9, skl: 5, cha: 5 }, points: 0, learned: ['shieldSlam'], active: ['shieldSlam'], passive: [], gender: 'girl' },
  bc_world: { cleared: ['plains', 'sunford'], at: 'sunford' },
  bc_stats: { kills: 300, runs: 12 },
  bc_tutorial: { heroPicked: true }
}

const SETTINGS = {
  bc_user_language: 'de',
  bc_user_sound_volume: 0.3,
  bc_player_id: 'player-123'
}

const boot = async () => {
  const state = await holdGameState()
  const slots = await import('@/game/state/saveSlots')
  const profile = await import('@/game/state/profile')
  return { state, slots, profile }
}

beforeEach(() => {
  drainAndResetModules()
  localStorage.setItem(STATE_KEY, JSON.stringify({ ...GAME_A, ...SETTINGS }))
})
afterEach(() => { drainPersist() })

describe('save slots', () => {
  it('starts with four empty slots', async () => {
    const { slots } = await boot()
    expect(slots.readSlots()).toEqual([null, null, null, null])
    expect(slots.slotSummaries.value).toEqual([null, null, null, null])
  })

  it('a slot holds the playthrough — not the settings, not the leaderboard id', async () => {
    const { slots } = await boot()
    slots.saveToSlot(2, 1_700_000_000_000)
    const s = slots.readSlots()[2]!
    expect(s.savedAt).toBe(1_700_000_000_000)
    expect(s.data.bc_level).toBe(12)
    expect(s.data.bc_hero).toEqual(GAME_A.bc_hero)
    expect(s.data).not.toHaveProperty('bc_user_language')
    expect(s.data).not.toHaveProperty('bc_player_id')
    expect(s.data).not.toHaveProperty('bc_save_slots')
    expect(slots.slotSummaries.value[2]).toEqual({ savedAt: 1_700_000_000_000, level: 12, place: 'sunford', gender: 'girl' })
  })

  it('a slot is a copy: play after saving does not change it', async () => {
    const { slots, state } = await boot()
    slots.saveToSlot(0)
    const hero = state.getState<{ learned: string[] }>('bc_hero')
    state.setState('bc_hero', { ...hero, learned: [...hero.learned, 'fireball'] })
    state.setState('bc_level', 13)
    expect(slots.readSlots()[0]!.data.bc_level).toBe(12)
    expect((slots.readSlots()[0]!.data.bc_hero as { learned: string[] }).learned).toEqual(['shieldSlam'])
  })

  it('loading swaps the whole playthrough, keeps settings and slots, stamps the epoch, and restarts', async () => {
    const { slots, state } = await boot()
    slots.saveToSlot(1)
    // Play on: a different build, further along, with a field the slot never had.
    state.setStates({ bc_level: 20, bc_story: 6, bc_hero: { ...GAME_A.bc_hero, attrs: { ...GAME_A.bc_hero.attrs, int: 30 } }, bc_meta: { rested: 3 } })
    const reload = vi.fn()
    await expect(slots.loadSlot(1, reload, 1_800_000_000_000)).resolves.toBe(true)
    expect(reload).toHaveBeenCalledOnce()
    expect(state.getState('bc_level')).toBe(12)
    expect(state.getState('bc_story')).toBe(4)
    expect(state.getState<{ attrs: { int: number } }>('bc_hero').attrs.int).toBe(5)
    expect(state.hasState('bc_meta')).toBe(false)
    expect(state.getState('bc_user_language')).toBe('de')
    expect(state.getState('bc_player_id')).toBe('player-123')
    expect(slots.readSlots()[1]).not.toBeNull()
    expect(state.getState('bc_save_epoch')).toBe(1_800_000_000_000)
    // …and it is what the next boot reads.
    state.flushPersist()
    expect(JSON.parse(localStorage.getItem(STATE_KEY)!).bc_level).toBe(12)
  })

  it('an empty slot does not load', async () => {
    const { slots, state } = await boot()
    const reload = vi.fn()
    await expect(slots.loadSlot(3, reload)).resolves.toBe(false)
    expect(reload).not.toHaveBeenCalled()
    expect(state.getState('bc_level')).toBe(12)
  })

  it('Start New Game clears the playthrough and nothing else', async () => {
    const { slots, state } = await boot()
    slots.saveToSlot(0)
    const reload = vi.fn()
    await slots.startNewGame(reload, 1_900_000_000_000)
    expect(reload).toHaveBeenCalledOnce()
    for (const k of ['bc_level', 'bc_gold', 'bc_story', 'bc_hero', 'bc_world', 'bc_stats', 'bc_tutorial']) {
      expect(state.hasState(k)).toBe(false)
    }
    expect(state.getState('bc_user_language')).toBe('de')
    expect(state.getState('bc_player_id')).toBe('player-123')
    expect(slots.readSlots()[0]!.data.bc_level).toBe(12)
    expect(state.getState('bc_save_epoch')).toBe(1_900_000_000_000)
  })

  it('a checkpoint after a load cannot write the old game back over it', async () => {
    const { slots, state, profile } = await boot()
    profile.initProfile()
    slots.saveToSlot(0)
    state.setState('bc_level', 20)
    profile.loadProfile()
    expect(profile.profile.level).toBe(20)
    await slots.loadSlot(0, () => {})
    profile.saveProfile()
    expect(state.getState('bc_level')).toBe(12)
  })
})

describe('a slot keeps the visit being played', () => {
  const VISIT = { v: 1, node: 'woods', encounter: null, setup: { kind: 'zone', seed: 5, flags: [] }, resume: { sim: { v: 1, time: 42 } } }

  it('saving takes the visit at that moment, and the profile as it is now', async () => {
    const { slots, profile, state } = await boot()
    profile.initProfile()
    slots.setVisitSnapshotProvider(() => VISIT)
    profile.profile.gold = 4321
    slots.saveToSlot(0)
    expect(slots.readSlots()[0]!.visit).toEqual(VISIT)
    // Not the last checkpoint: the profile in memory, written out first.
    expect(slots.readSlots()[0]!.data.bc_gold).toBe(4321)
    expect(state.getState('bc_gold')).toBe(4321)
    slots.setVisitSnapshotProvider(null)
  })

  it('loading hands the visit to the next boot, once', async () => {
    const { slots, state } = await boot()
    slots.setVisitSnapshotProvider(() => VISIT)
    slots.saveToSlot(1)
    slots.setVisitSnapshotProvider(null)
    await slots.loadSlot(1, () => {})
    expect(state.getState('bc_resume')).toEqual(VISIT)
    expect(slots.takeResumeVisit()).toEqual(VISIT)
    expect(slots.takeResumeVisit()).toBeNull()
  })

  it('a slot saved outside a place loads into the last town, not into an old visit', async () => {
    const { slots, state } = await boot()
    slots.setVisitSnapshotProvider(() => VISIT)
    slots.saveToSlot(0)
    slots.setVisitSnapshotProvider(null)
    slots.saveToSlot(1)
    await slots.loadSlot(0, () => {})
    expect(state.hasState('bc_resume')).toBe(true)
    await slots.loadSlot(1, () => {})
    expect(state.hasState('bc_resume')).toBe(false)
  })

  it('a provider that throws still saves the profile', async () => {
    const { slots } = await boot()
    slots.setVisitSnapshotProvider(() => { throw new Error('boom') })
    slots.saveToSlot(2)
    expect(slots.readSlots()[2]!.data.bc_level).toBe(12)
    expect(slots.readSlots()[2]!.visit).toBeUndefined()
    slots.setVisitSnapshotProvider(null)
  })

  it('Start New Game drops a visit waiting to be resumed', async () => {
    const { slots, state } = await boot()
    slots.setVisitSnapshotProvider(() => VISIT)
    slots.saveToSlot(0)
    slots.setVisitSnapshotProvider(null)
    await slots.loadSlot(0, () => {})
    await slots.startNewGame(() => {})
    expect(state.hasState('bc_resume')).toBe(false)
  })

  it('loading resets the rested clock: the time between save and load is not time away', async () => {
    const { slots, state, profile } = await boot()
    profile.initProfile()
    slots.saveToSlot(0)
    await slots.loadSlot(0, () => {}, 1_950_000_000_000)
    expect(state.getState<{ lastSeen: number }>('bc_meta').lastSeen).toBe(1_950_000_000_000)
  })
})

describe('the slot fields are the profile', () => {
  it('saveProfile writes exactly PROFILE_FIELDS, so a slot can never miss a new one', async () => {
    const { state, profile } = await boot()
    const { PROFILE_FIELDS } = await import('@/keys')
    profile.initProfile()
    profile.saveProfile()
    const written = Object.keys(state.gameState.value).filter(k => !(k in SETTINGS) && k !== 'bc_save_slots' && k !== 'bc_save_epoch')
    expect(written.sort()).toEqual([...PROFILE_FIELDS].sort())
  })
})

describe('the cloud merge honours the save epoch', () => {
  it('a newer epoch wins over a higher progress score, both ways', async () => {
    const { computeMeta, decideMerge } = await import('@/utils/save/SaveMergePolicy')
    const meta = (level: number, story: number) => computeMeta({ get: (k) => (k === STATE_KEY ? JSON.stringify({ bc_level: level, bc_story: story }) : null) })
    const behind = meta(3, 0)
    const ahead = meta(20, 6)
    // Loaded an earlier slot on this device; the cloud still has the later game.
    expect(decideMerge(behind, ahead, { local: 2, remote: 1 }).kind).toBe('local-wins')
    // Loaded it on another device; this one still has the later game.
    expect(decideMerge(ahead, behind, { local: 1, remote: 2 })).toEqual({ kind: 'remote-wins', bonusCoins: 0 })
    // Same epoch: progress decides, as before.
    expect(decideMerge(behind, ahead, { local: 1, remote: 1 }).kind).toBe('remote-wins')
    expect(decideMerge(behind, ahead).kind).toBe('remote-wins')
  })

  it('reads the epoch out of the state blob', async () => {
    const { epochOf } = await import('@/utils/save/SaveMergePolicy')
    expect(epochOf({ get: (k) => (k === STATE_KEY ? JSON.stringify({ bc_save_epoch: 42 }) : null) })).toBe(42)
    expect(epochOf({ get: (k) => (k === STATE_KEY ? JSON.stringify({ bc_level: 3 }) : null) })).toBe(0)
    expect(epochOf({ get: () => null })).toBe(0)
  })
})
