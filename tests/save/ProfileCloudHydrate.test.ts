import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

// ─── Cloud → profile hydrate, and checkpoint flushes ────────────────────────
//
// THE BUG THIS FILE EXISTS TO PREVENT:
//   A returning player reloads. The platform SDK's cloud read is async. The
//   Vue module graph evaluates first, the profile store reads an empty blob
//   and initialises to defaults, and the player is rendered as a brand-new
//   install: level 1, no bolts, the tutorial again. The next write then
//   commits those defaults over the real cloud save and the loss becomes
//   permanent.
//
// The whole game lives in ONE `mega_adventure_state` blob. The profile store
// (`src/game/state/profile.ts`) re-reads it whenever `saveDataVersion` bumps,
// which `useSaveStatus` does right after a hydrate lands.
//
// The second half is the checkpoint flush: a finished mission must reach the
// backend right away, not after the persist + strategy debounces — a player
// who beams out and reloads a moment later would otherwise get the OLD save.

const MANIFEST_KEY = '__save_internal__crazy_keys'
const STATE_KEY = 'mega_adventure_state'

const makeFakeData = (seed: Record<string, string> = {}) => {
  const store = new Map<string, string>(Object.entries(seed))
  return {
    store,
    getItem: vi.fn(async (key: string) => store.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { store.set(key, value) }),
    removeItem: vi.fn(async (key: string) => { store.delete(key) })
  }
}

const flush = async (): Promise<void> => { await nextTick(); await nextTick() }

/** A mid-mission snapshot of the Blaze story mission, as the game writes it. */
const snapshot = (quest: unknown) => ({
  quest, killed: [0, 3], opened: [1], doors: [2, 5], collected: [], progress: 0,
  x: 31.5, z: 12, yaw: 1.2, hp: 88, we: 20, bolts: 45, xp: 60, kills: 2, t: 94, done: false
})

/** A cloud save for a player well into the game, with the meta blob the merge
 *  resolver needs in order to pick remote over an empty local. */
const seededCloud = async (withSnapshot = false) => {
  const { META_KEY } = await import('@/utils/save/SaveMergePolicy')
  const { storyQuest } = await import('@/game/data/quests')
  const { SECTOR_BY_ID } = await import('@/game/data/regions')
  const cloudBlob: Record<string, unknown> = {
    ma_level: 7,
    ma_bolts: 1250,
    ma_story: 1,
    ma_quests_done: 9,
    ma_hero: { xp: 120, attrs: { hp: 2, we: 1, power: 3 }, skills: { rapid: 2 }, pendingAttrs: 0, weapons: ['scrapBurst'], slots: ['scrapBurst', ''], weaponXp: {} },
    ma_world: { unlocked: ['scrapyard', 'blaze'], bosses: ['scrapper'], tutorialDone: true, selected: 'blaze' },
    ma_stats: { kills: 310, deaths: 2, chests: 14, missions: 11, playSeconds: 2400, bestLevel: 7, lastDropAt: 0 },
    ma_user_sound_volume: 0.4,
    ma_user_language: 'es'
  }
  if (withSnapshot) cloudBlob.ma_mission = snapshot(storyQuest(SECTOR_BY_ID.blaze, 7, 0))
  const meta = {
    savedAt: '2026-09-20T00:00:00.000Z',
    progressScore: 1 * 5000 + 7 * 1000 + 9 * 40 + Math.floor(1250 / 100),
    schemaVersion: 1,
    maxStage: 7
  }
  return makeFakeData({
    [MANIFEST_KEY]: JSON.stringify([STATE_KEY, META_KEY]),
    [STATE_KEY]: JSON.stringify(cloudBlob),
    [META_KEY]: JSON.stringify(meta)
  })
}

/** Boot the CrazyGames cloud-only configuration: gameplay state lives in memory
 *  only and `sdk.data` is the sole persistence backend. */
const bootCloudOnly = async (data: ReturnType<typeof makeFakeData>) => {
  const { SaveManager } = await import('@/utils/save/SaveManager')
  const { CrazyGamesStrategy } = await import('@/utils/save/CrazyGamesStrategy')
  const { installSaveStatus } = await import('@/use/useSaveStatus')
  const manager = new SaveManager(
    new CrazyGamesStrategy(() => data),
    window.localStorage,
    { blob: { persistToRaw: false } }
  )
  installSaveStatus(manager)
  await manager.init()
  await flush()
  return manager
}

/** Drain this module instance's pending persist timer so it cannot write this
 *  test's blob into the next test's store after `vi.resetModules()`. */
const drain = async () => {
  const { flushPersist } = await import('@/use/useGameState')
  flushPersist()
}

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe('mega_adventure_state cloud hydrate → profile store', () => {
  it('hydrates the blob before the app graph reads it', async () => {
    await bootCloudOnly(await seededCloud())
    const { getState } = await import('@/use/useGameState')
    expect(getState('ma_level')).toBe(7)
    expect(getState('ma_bolts')).toBe(1250)
    await drain()
  })

  it('loads the returning player — NOT a fresh install', async () => {
    await bootCloudOnly(await seededCloud())
    const { profile, initProfile } = await import('@/game/state/profile')
    initProfile()
    expect(profile.level).toBe(7)
    expect(profile.bolts).toBe(1250)
    expect(profile.world.tutorialDone).toBe(true)
    expect(profile.world.unlocked).toEqual(['scrapyard', 'blaze'])
    expect(profile.hero.attrs.power).toBe(3)
    expect(profile.hero.weapons).toEqual(['scrapBurst'])
    // …so the boot goes to the hub, not back into the tutorial.
    const { bootTarget } = await import('@/game/flow')
    expect(bootTarget().kind).toBe('hub')
    await drain()
  })

  it('re-reads the profile when a hydrate lands AFTER the store loaded', async () => {
    // The store loads defaults first (the async cloud read has not answered
    // yet), then the hydrate bumps `saveDataVersion` and the store follows.
    const { profile, initProfile } = await import('@/game/state/profile')
    initProfile()
    expect(profile.level).toBe(1)
    await bootCloudOnly(await seededCloud())
    await flush()
    expect(profile.level).toBe(7)
    expect(profile.bolts).toBe(1250)
    await drain()
  })

  it('keeps the player settings (language, volume)', async () => {
    await bootCloudOnly(await seededCloud())
    const { default: useUser } = await import('@/use/useUser')
    const u = useUser()
    expect(u.userLanguage.value).toBe('es')
    expect(u.userSoundVolume.value).toBe(0.4)
    await drain()
  })

  it('resumes the mid-mission snapshot instead of dropping the player in the hub', async () => {
    await bootCloudOnly(await seededCloud(true))
    const { initProfile } = await import('@/game/state/profile')
    initProfile()
    const { bootTarget } = await import('@/game/flow')
    const t = bootTarget()
    expect(t.kind).toBe('mission')
    if (t.kind === 'mission') {
      expect(t.quest.sector).toBe('blaze')
      expect(t.snapshot?.kills).toBe(2)
      expect(t.snapshot?.x).toBe(31.5)
    }
    await drain()
  })

  it('keeps nothing but the save blobs in raw localStorage on a cloud-only build', async () => {
    await bootCloudOnly(await seededCloud())
    const raw: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k) raw.push(k)
    }
    expect(raw.filter((k) => k.startsWith('ma_'))).toEqual([])
    await drain()
  })
})

describe('checkpoint flushes', () => {
  it('flushSaveNow pushes a pending profile write without waiting for the debounce', async () => {
    const data = makeFakeData()
    await bootCloudOnly(data)
    const { profile, saveProfile } = await import('@/game/state/profile')
    const { flushSaveNow } = await import('@/use/useSaveStatus')

    profile.level = 3
    profile.bolts = 480
    saveProfile()
    expect(data.store.get(STATE_KEY)).toBeUndefined()

    // No fake timers: the checkpoint drains the whole pipeline immediately.
    await flushSaveNow()
    const cloud = JSON.parse(data.store.get(STATE_KEY) || '{}')
    expect(cloud.ma_level).toBe(3)
    expect(cloud.ma_bolts).toBe(480)
  })

  it('a finished mission reaches the backend right away', async () => {
    const data = makeFakeData()
    await bootCloudOnly(data)
    const { profile, initProfile } = await import('@/game/state/profile')
    initProfile()
    const { flow, finishMission } = await import('@/game/flow')
    const { tutorialQuest } = await import('@/game/data/quests')
    flow.quest = tutorialQuest()
    const boltsBefore = profile.bolts
    await finishMission(true, { xp: 30, bolts: 12, kills: 5, chests: 1, items: [], seconds: 180 })
    // Let the fire-and-forget flush settle WITHOUT reaching the 200 ms
    // persist debounce: anything in the cloud now came from the checkpoint.
    await new Promise((r) => setTimeout(r, 0))
    const cloud = JSON.parse(data.store.get(STATE_KEY) || '{}')
    expect(cloud.ma_world?.tutorialDone).toBe(true)
    expect(cloud.ma_quests_done).toBe(1)
    expect(cloud.ma_bolts).toBe(profile.bolts)
    expect(profile.bolts).toBeGreaterThan(boltsBefore)
    await drain()
  })

  it('a trivial post-boot write does not clobber the hydrated progress', async () => {
    const data = await seededCloud()
    const manager = await bootCloudOnly(data)
    const { setState } = await import('@/use/useGameState')
    const { flushSaveNow } = await import('@/use/useSaveStatus')
    setState('ma_user_haptics', true)
    await flushSaveNow()
    await manager.flush()
    const cloud = JSON.parse(data.store.get(STATE_KEY) || '{}')
    expect(cloud.ma_level).toBe(7)
    expect(cloud.ma_bolts).toBe(1250)
    expect(cloud.ma_user_haptics).toBe(true)
  })
})
