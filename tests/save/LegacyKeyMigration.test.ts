import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

// ─── Pre-rename saves migrate (Mega Adventure → Mega Droid) ─────────────────
//
// Every top-level storage key was renamed with the game. A rename done naively
// would boot every existing player as a fresh install — level 1, no bolts, a
// second leaderboard row — and the next autosave would push those defaults
// over their cloud save. So the old names live on in ONE place
// (`src/legacyKeys.ts`) purely to carry old saves forward:
//
//   • on the device, before anything reads state;
//   • from every cloud payload that stores the key name
//     (`{ mega_adventure_state, __save_meta__ }`), writing only the new name
//     from then on.
//
// The literals are spelled out here on purpose: they are the contract.

const STATE_KEY = 'mega_droid_state'
const LEGACY_STATE_KEY = 'mega_adventure_state'
const META_KEY = '__save_meta__'
const CG_MANIFEST_KEY = '__save_internal__crazy_keys'

const sdkActive = ref(true)
let bridge: { storage: ReturnType<typeof makeBridgeCloud>['storage'] } | null = null

vi.mock('@/utils/playgamaPlugin', () => ({
  isPlaygamaSdkActive: sdkActive,
  getPlaygamaBridge: () => bridge
}))

/** A save blob as the game writes it. */
const blob = (level: number, bolts = 0) => JSON.stringify({ ma_level: level, ma_bolts: bolts, ma_story: 1 })

/** The meta the merge resolver scores a cloud save by. */
const metaFor = (level: number) => JSON.stringify({
  savedAt: '2026-09-01T00:00:00.000Z',
  progressScore: 5000 + level * 1000,
  schemaVersion: 1,
  maxStage: level
})

/** A strategy-facing accessor over a plain map (what `SaveManager` hands in). */
const makeLocal = () => {
  const map = new Map<string, string>()
  return {
    map,
    get: (k: string) => map.get(k) ?? null,
    set: (k: string, v: string) => { map.set(k, v) },
    remove: (k: string) => { map.delete(k) },
    keys: () => [...map.keys()]
  }
}

/** A Web Storage over a map, with optional failure injection. */
const makeStorage = (seed: Record<string, string> = {}, fail: { all?: boolean; set?: boolean } = {}): Storage => {
  const map = new Map(Object.entries(seed))
  const guard = () => { if (fail.all) throw new DOMException('The operation is insecure.', 'SecurityError') }
  return {
    get length () { guard(); return map.size },
    key: (i: number) => { guard(); return [...map.keys()][i] ?? null },
    getItem: (k: string) => { guard(); return map.get(k) ?? null },
    setItem: (k: string, v: string) => {
      guard()
      if (fail.set) throw new DOMException('Quota exceeded', 'QuotaExceededError')
      map.set(k, String(v))
    },
    removeItem: (k: string) => { guard(); map.delete(k) },
    clear: () => { guard(); map.clear() }
  }
}

const installStorage = (s: Storage): void => {
  Object.defineProperty(window, 'localStorage', { value: s, configurable: true, writable: true })
}

afterEach(() => {
  drainPersist()
})

describe('the legacy names live in one table', () => {
  it('pins every pre-rename key, spelled exactly as old saves have it', async () => {
    const { LEGACY_KEYS } = await import('@/legacyKeys')
    expect(LEGACY_KEYS).toEqual({
      STATE: 'mega_adventure_state',
      BOARD_CACHE: 'mega_adventure_board_cache',
      DEVICE_UID: 'mega_adventure_uid',
      DEVICE_NAME: 'mega_adventure_name'
    })
  })
})

describe('migrateLegacyKey', () => {
  it('moves a legacy-only entry to the new key and removes the legacy one', async () => {
    const { migrateLegacyKey } = await import('@/legacyKeys')
    const s = makeStorage({ old: 'v1' })
    migrateLegacyKey('old', 'new', s)
    expect(s.getItem('new')).toBe('v1')
    expect(s.getItem('old')).toBeNull()
  })

  it('keeps the new key when both exist, and still removes the legacy one', async () => {
    const { migrateLegacyKey } = await import('@/legacyKeys')
    const s = makeStorage({ old: 'stale', new: 'current' })
    migrateLegacyKey('old', 'new', s)
    expect(s.getItem('new')).toBe('current')
    expect(s.getItem('old')).toBeNull()
  })

  it('is idempotent', async () => {
    const { migrateLegacyKey } = await import('@/legacyKeys')
    const s = makeStorage({ old: 'v1' })
    migrateLegacyKey('old', 'new', s)
    migrateLegacyKey('old', 'new', s)
    expect(s.getItem('new')).toBe('v1')
    expect(s.length).toBe(1)
  })

  it('never throws when storage is unavailable (private mode)', async () => {
    const { migrateLegacyKey } = await import('@/legacyKeys')
    expect(() => migrateLegacyKey('old', 'new', makeStorage({ old: 'v1' }, { all: true }))).not.toThrow()
  })

  it('keeps the legacy entry when the copy fails (quota), so the next boot retries', async () => {
    const { migrateLegacyKey } = await import('@/legacyKeys')
    const s = makeStorage({ old: 'v1' }, { set: true })
    expect(() => migrateLegacyKey('old', 'new', s)).not.toThrow()
    expect(s.getItem('old')).toBe('v1')
    expect(s.getItem('new')).toBeNull()
  })
})

describe('adoptLegacyField (cloud payloads)', () => {
  it('re-files the legacy field of a record, and reports it', async () => {
    const { adoptLegacyField } = await import('@/legacyKeys')
    const payload: Record<string, unknown> = { [LEGACY_STATE_KEY]: blob(4), [META_KEY]: metaFor(4) }
    expect(adoptLegacyField(payload, LEGACY_STATE_KEY, STATE_KEY)).toBe(true)
    expect(payload).toEqual({ [STATE_KEY]: blob(4), [META_KEY]: metaFor(4) })
  })

  it('lets the new field win in a map, and drops the legacy one', async () => {
    const { adoptLegacyField } = await import('@/legacyKeys')
    const payload = new Map([[STATE_KEY, blob(9)], [LEGACY_STATE_KEY, blob(2)]])
    expect(adoptLegacyField(payload, LEGACY_STATE_KEY, STATE_KEY)).toBe(true)
    expect([...payload]).toEqual([[STATE_KEY, blob(9)]])
  })

  it('leaves a payload without the legacy field alone', async () => {
    const { adoptLegacyField } = await import('@/legacyKeys')
    const payload = { [STATE_KEY]: blob(3) }
    expect(adoptLegacyField(payload, LEGACY_STATE_KEY, STATE_KEY)).toBe(false)
    expect(payload).toEqual({ [STATE_KEY]: blob(3) })
  })
})

// ─── On the device ──────────────────────────────────────────────────────────

/** A fresh boot of the state layer against whatever storage is installed. */
const bootState = async () => {
  drainAndResetModules()
  return await holdGameState()
}

describe('a pre-rename save on this device', () => {
  it('is what the game boots with, and only the new key is left', async () => {
    localStorage.setItem(LEGACY_STATE_KEY, blob(7, 1250))
    const gs = await bootState()

    expect(gs.getState('ma_level')).toBe(7)
    expect(gs.getState('ma_bolts')).toBe(1250)
    expect(localStorage.getItem(STATE_KEY)).toBe(blob(7, 1250))
    expect(localStorage.getItem(LEGACY_STATE_KEY)).toBeNull()
  })

  it('loses to the new key when both exist, and is removed', async () => {
    localStorage.setItem(STATE_KEY, blob(9))
    localStorage.setItem(LEGACY_STATE_KEY, blob(2))
    const gs = await bootState()

    expect(gs.getState('ma_level')).toBe(9)
    expect(localStorage.getItem(LEGACY_STATE_KEY)).toBeNull()
  })

  it('is a no-op on the second boot', async () => {
    localStorage.setItem(LEGACY_STATE_KEY, blob(5, 300))
    await bootState()
    const after = localStorage.getItem(STATE_KEY)

    const gs = await bootState()
    expect(gs.getState('ma_level')).toBe(5)
    expect(localStorage.getItem(STATE_KEY)).toBe(after)
    expect(localStorage.getItem(LEGACY_STATE_KEY)).toBeNull()
    expect(localStorage.length).toBe(1)
  })

  it('boots at defaults instead of throwing when storage throws (private mode)', async () => {
    installStorage(makeStorage({ [LEGACY_STATE_KEY]: blob(5) }, { all: true }))
    const gs = await bootState()
    expect(gs.getState('ma_level', 1)).toBe(1)
  })

  it('is moved before SaveManager seeds, even when it appears after the state layer loaded', async () => {
    // Cloud-only (CrazyGames) mode scrubs raw storage after seeding, so a legacy
    // entry the seed skipped would be the only copy — and then gone.
    const { SaveManager } = await import('@/utils/save/SaveManager')
    const { LocalStorageStrategy } = await import('@/utils/save/LocalStorageStrategy')
    const raw = window.localStorage
    raw.setItem(LEGACY_STATE_KEY, blob(6, 40))

    const manager = new SaveManager(new LocalStorageStrategy(), raw, { blob: { persistToRaw: false } })
    await manager.init()

    expect(window.localStorage.getItem(STATE_KEY)).toBe(blob(6, 40))
    expect(raw.getItem(LEGACY_STATE_KEY)).toBeNull()
    manager.dispose()
  })
})

describe('the leaderboard identity survives the rename', () => {
  const UID = 'a1b2c3d4e5f60718293a4b5c'
  const NAME = 'Rivet482913'

  it('keeps the device id and generated name, under the new keys', async () => {
    localStorage.setItem('mega_adventure_uid', UID)
    localStorage.setItem('mega_adventure_name', NAME)
    drainAndResetModules()
    const { resolveIdentity } = await import('@/use/usePlayerIdentity')
    await holdGameState()

    const who = await resolveIdentity()
    expect(who).toEqual({ id: UID, name: NAME, source: 'device' })
    expect(localStorage.getItem('mega_droid_uid')).toBe(UID)
    expect(localStorage.getItem('mega_droid_name')).toBe(NAME)
    expect(localStorage.getItem('mega_adventure_uid')).toBeNull()
    expect(localStorage.getItem('mega_adventure_name')).toBeNull()
  })

  it('resolves the same id on the next boot', async () => {
    localStorage.setItem('mega_adventure_uid', UID)
    drainAndResetModules()
    await (await import('@/use/usePlayerIdentity')).resolveIdentity()
    await holdGameState()

    drainAndResetModules()
    const { resolveIdentity } = await import('@/use/usePlayerIdentity')
    await holdGameState()
    expect((await resolveIdentity()).id).toBe(UID)
    expect(localStorage.getItem('mega_adventure_uid')).toBeNull()
  })
})

// ─── From the cloud ─────────────────────────────────────────────────────────

const makeSdkData = (seed: Record<string, string> = {}) => {
  const store = new Map<string, string>(Object.entries(seed))
  return {
    store,
    getItem: vi.fn(async (key: string) => store.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { store.set(key, value) }),
    removeItem: vi.fn(async (key: string) => { store.delete(key) })
  }
}

describe('a pre-rename CrazyGames cloud save (per-key sdk.data)', () => {
  beforeEach(() => {
    drainAndResetModules()
  })

  /** A reload: the previous page flushes on its way out, then fresh raw
   *  storage, fresh modules, cloud-only boot. */
  const boot = async (data: ReturnType<typeof makeSdkData>) => {
    drainAndResetModules()
    installStorage(makeStorage())
    const { SaveManager } = await import('@/utils/save/SaveManager')
    const { CrazyGamesStrategy } = await import('@/utils/save/CrazyGamesStrategy')
    const { installSaveStatus } = await import('@/use/useSaveStatus')
    const manager = new SaveManager(new CrazyGamesStrategy(() => data), window.localStorage, { blob: { persistToRaw: false } })
    installSaveStatus(manager)
    await manager.init()
    return { manager, gs: await holdGameState() }
  }

  it('hydrates with the progress intact, and is re-filed under the new key only', async () => {
    const data = makeSdkData({
      [CG_MANIFEST_KEY]: JSON.stringify([META_KEY, LEGACY_STATE_KEY]),
      [LEGACY_STATE_KEY]: blob(7, 1250),
      [META_KEY]: metaFor(7)
    })
    const { manager, gs } = await boot(data)

    expect(gs.getState('ma_level')).toBe(7)
    expect(gs.getState('ma_bolts')).toBe(1250)

    await manager.flush()
    expect(data.store.get(STATE_KEY)).toBe(blob(7, 1250))
    expect(data.store.has(LEGACY_STATE_KEY)).toBe(false)
    const manifest = JSON.parse(data.store.get(CG_MANIFEST_KEY)!)
    expect(manifest).toContain(STATE_KEY)
    expect(manifest).not.toContain(LEGACY_STATE_KEY)
    expect(data.setItem.mock.calls.map((c) => c[0])).not.toContain(LEGACY_STATE_KEY)
    // The legacy entry went only AFTER the blob was confirmed under its new name.
    const setAt = data.setItem.mock.invocationCallOrder[data.setItem.mock.calls.findIndex((c) => c[0] === STATE_KEY)]!
    expect(data.removeItem.mock.invocationCallOrder[0]!).toBeGreaterThan(setAt)
    manager.dispose()

    // The next boot finds only the new layout — nothing left to migrate.
    data.removeItem.mockClear()
    const again = await boot(data)
    expect(again.gs.getState('ma_level')).toBe(7)
    await again.manager.flush()
    expect(data.removeItem).not.toHaveBeenCalled()
    again.manager.dispose()
  })

  it('prefers the new key when sdk.data holds both', async () => {
    const data = makeSdkData({
      [CG_MANIFEST_KEY]: JSON.stringify([META_KEY, LEGACY_STATE_KEY, STATE_KEY]),
      [STATE_KEY]: blob(9),
      [LEGACY_STATE_KEY]: blob(2),
      [META_KEY]: metaFor(9)
    })
    const { manager, gs } = await boot(data)
    expect(gs.getState('ma_level')).toBe(9)

    // Retired with the next write that reaches sdk.data.
    gs.setState('ma_bolts', 5)
    gs.flushPersist()
    await manager.flush()
    expect(data.store.has(LEGACY_STATE_KEY)).toBe(false)
    expect(JSON.parse(data.store.get(STATE_KEY)!).ma_level).toBe(9)
    manager.dispose()
  })
})

/** Playgama's whole-save backend (`bridge.storage`), recording the op order. */
const makeBridgeCloud = (seed: Record<string, string> = {}) => {
  let saved: Record<string, string> = { ...seed }
  const ops: string[] = []
  const setKeys: string[] = []
  const tick = () => new Promise((r) => setTimeout(r, 10))
  const storage = {
    get: vi.fn(async (keys: string | string[], _parse?: boolean) => {
      await tick()
      const list = Array.isArray(keys) ? keys : [keys]
      const out = list.map((k) => saved[k] ?? null)
      return Array.isArray(keys) ? out : out[0]
    }),
    set: vi.fn(async (keys: string | string[], values: unknown) => {
      const ks = Array.isArray(keys) ? keys : [keys]
      const vs = Array.isArray(keys) ? values as unknown[] : [values]
      ops.push('set')
      setKeys.push(...ks)
      await tick()
      const next = { ...saved }
      ks.forEach((k, i) => { next[k] = String(vs[i]) })
      saved = next
    }),
    delete: vi.fn(async (keys: string | string[]) => {
      ops.push('delete')
      await tick()
      const next = { ...saved }
      for (const k of Array.isArray(keys) ? keys : [keys]) delete next[k]
      saved = next
    })
  }
  return { storage, ops, setKeys, read: () => saved }
}

describe('a pre-rename Playgama cloud save (bridge.storage)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sdkActive.value = true
  })
  afterEach(() => {
    vi.useRealTimers()
    bridge = null
  })

  const hydrate = async (cloud: ReturnType<typeof makeBridgeCloud>) => {
    bridge = { storage: cloud.storage }
    const { PlaygamaStrategy } = await import('@/utils/save/PlaygamaStrategy')
    const local = makeLocal()
    const strat = new PlaygamaStrategy()
    const p = strat.hydrate(local)
    await vi.advanceTimersByTimeAsync(20)
    await p
    return { strat, local }
  }

  it('hydrates with the progress intact, is pushed under the new key, then the legacy copy is deleted', async () => {
    const cloud = makeBridgeCloud({ [LEGACY_STATE_KEY]: blob(12, 900), [META_KEY]: metaFor(12) })
    const { strat, local } = await hydrate(cloud)

    expect(strat.hydrateState).toBe('success-with-data')
    expect(local.get(STATE_KEY)).toBe(blob(12, 900))
    expect(local.get(LEGACY_STATE_KEY)).toBeNull()

    await vi.advanceTimersByTimeAsync(1000)
    expect(cloud.read()[STATE_KEY]).toBe(blob(12, 900))
    expect(cloud.read()).not.toHaveProperty(LEGACY_STATE_KEY)
    expect(cloud.setKeys).not.toContain(LEGACY_STATE_KEY)
    expect(cloud.ops).toEqual(['set', 'delete'])
    strat.dispose()
  })

  it('prefers the new key when the cloud holds both', async () => {
    const cloud = makeBridgeCloud({ [STATE_KEY]: blob(20), [LEGACY_STATE_KEY]: blob(3), [META_KEY]: metaFor(20) })
    const { strat, local } = await hydrate(cloud)
    expect(local.get(STATE_KEY)).toBe(blob(20))

    await vi.advanceTimersByTimeAsync(1000)
    expect(cloud.read()[STATE_KEY]).toBe(blob(20))
    expect(cloud.read()).not.toHaveProperty(LEGACY_STATE_KEY)
    strat.dispose()
  })

  it('keeps the save pushed, and does not re-send it, when the backend rejects the delete', async () => {
    const cloud = makeBridgeCloud({ [LEGACY_STATE_KEY]: blob(8), [META_KEY]: metaFor(8) })
    cloud.storage.delete.mockRejectedValue(new Error('STORAGE_NOT_SUPPORTED'))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { strat } = await hydrate(cloud)

    await vi.advanceTimersByTimeAsync(5000)
    expect(cloud.read()[STATE_KEY]).toBe(blob(8))
    expect(cloud.storage.set).toHaveBeenCalledTimes(1)
    strat.dispose()
  })
})

describe('a pre-rename GamePix portal save (window.GamePix.localStorage)', () => {
  const installPortal = (seed: Record<string, string>) => {
    const store = new Map(Object.entries(seed))
    ;(window as unknown as { GamePix?: unknown }).GamePix = {
      localStorage: {
        getItem: (k: string) => Promise.resolve(store.get(k) ?? null),
        setItem: (k: string, v: string) => { store.set(k, v) },
        removeItem: (k: string) => { store.delete(k) }
      }
    }
    return store
  }

  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => {
    vi.useRealTimers()
    delete (window as unknown as { GamePix?: unknown }).GamePix
  })

  const hydrate = async () => {
    const { GamePixStrategy } = await import('@/utils/save/GamePixStrategy')
    const local = makeLocal()
    const strat = new GamePixStrategy()
    const p = strat.hydrate(local)
    await vi.advanceTimersByTimeAsync(2000)
    await p
    return { strat, local }
  }

  it('hydrates with the progress intact, and is re-filed on the portal under the new key', async () => {
    const store = installPortal({ [LEGACY_STATE_KEY]: blob(4, 70), [META_KEY]: metaFor(4) })
    const { strat, local } = await hydrate()

    expect(strat.hydrateState).toBe('success-with-data')
    expect(local.get(STATE_KEY)).toBe(blob(4, 70))
    expect(local.get(LEGACY_STATE_KEY)).toBeNull()
    expect(store.get(STATE_KEY)).toBe(blob(4, 70))
    expect(store.has(LEGACY_STATE_KEY)).toBe(false)
    strat.dispose()
  })

  it('prefers the new key when the portal holds both', async () => {
    const store = installPortal({ [STATE_KEY]: blob(11), [LEGACY_STATE_KEY]: blob(1) })
    const { strat, local } = await hydrate()

    expect(local.get(STATE_KEY)).toBe(blob(11))
    expect(store.get(STATE_KEY)).toBe(blob(11))
    expect(store.has(LEGACY_STATE_KEY)).toBe(false)
    strat.dispose()
  })
})

describe('a pre-rename Glitch cloud slot', () => {
  const BASE = 'https://api.test.local/api'
  const SAVES = `${BASE}/titles/t/installs/i/saves`
  const encode = (o: unknown) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))

  it('hydrates with the progress intact, and the next upload carries only the new key', async () => {
    const uploads: Record<string, unknown>[] = []
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'GET') {
        return new Response(JSON.stringify({
          data: [{
            id: 'slot-1', slot_index: 0, version: 3,
            payload: encode({ [LEGACY_STATE_KEY]: blob(6, 500), [META_KEY]: metaFor(6) })
          }]
        }), { status: 200 })
      }
      expect(String(input)).toBe(SAVES)
      uploads.push(JSON.parse(atob(JSON.parse(String(init!.body)).payload)))
      return new Response(JSON.stringify({ data: { version: 4, is_conflicted: false } }), { status: 201 })
    })
    const { GlitchStrategy } = await import('@/utils/save/GlitchStrategy')
    const { SaveManager } = await import('@/utils/save/SaveManager')
    const raw = window.localStorage
    const manager = new SaveManager(new GlitchStrategy({ titleId: 't', installId: 'i', token: 'x', baseUrl: BASE, fetchImpl }))
    await manager.init()

    expect(window.localStorage.getItem(STATE_KEY)).toBe(blob(6, 500))
    expect(raw.getItem(LEGACY_STATE_KEY)).toBeNull()

    await manager.flush()
    expect(uploads).toHaveLength(1)
    expect(uploads[0]![STATE_KEY]).toBe(blob(6, 500))
    expect(uploads[0]).not.toHaveProperty(LEGACY_STATE_KEY)
    manager.dispose()
  })
})
