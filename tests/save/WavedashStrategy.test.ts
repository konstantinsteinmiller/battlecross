// ─── WavedashStrategy: progress survives in Wavedash's cloud file ──────────
//
// The iOS home-screen app lost the browser storage on a full close, so the
// Wavedash build keeps its save in Remote Storage. These pin the read
// (merge by progress, 404 = empty, failures retry), the upload throttle that
// keeps a player under Wavedash's 30 / min · 300 / h limit, and the
// close-time flush.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { WavedashSaveSdk } from '@/utils/save/WavedashStrategy'

const STATE_KEY = 'bcross_state'
const PATH = 'bcross/save.json'

const makeLocal = (seed: Record<string, string> = {}) => {
  const map = new Map<string, string>(Object.entries(seed))
  return {
    map,
    get: (k: string) => map.get(k) ?? null,
    set: (k: string, v: string) => { map.set(k, v) },
    remove: (k: string) => { map.delete(k) },
    keys: () => [...map.keys()]
  }
}

const save = (level: number, story: number): string =>
  JSON.stringify({ bc_level: level, bc_story: story })

/** In-memory stand-in for the SDK: a local file store (IndexedDB in the
 *  real SDK) and the cloud, with the SDK's `{ success, message }` answers. */
const makeSdk = (cloud: Record<string, unknown> | null = null) => {
  const localFiles = new Map<string, Uint8Array>()
  const remote = new Map<string, Uint8Array>()
  if (cloud) remote.set(PATH, new TextEncoder().encode(JSON.stringify(cloud)))
  const sdk = {
    downloadRemoteFile: vi.fn(async (p: string) => {
      const f = remote.get(p)
      if (!f) return { success: false, data: null, message: '404 (Not Found)' }
      localFiles.set(p, f)
      return { success: true, data: p }
    }),
    uploadRemoteFile: vi.fn(async (p: string) => {
      remote.set(p, localFiles.get(p)!)
      return { success: true, data: p }
    }),
    writeLocalFile: vi.fn(async (p: string, d: Uint8Array) => { localFiles.set(p, d); return true }),
    readLocalFile: vi.fn(async (p: string) => localFiles.get(p) ?? null)
  }
  const uploaded = (): { blob: string | null; meta: string | null } =>
    JSON.parse(new TextDecoder().decode(remote.get(PATH)!))
  return { sdk, remote, uploaded }
}

const load = async () => (await import('@/utils/save/WavedashStrategy')).WavedashStrategy

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.useRealTimers()
  vi.resetModules()
})

describe('WavedashStrategy', () => {
  it('treats a missing cloud file as empty and uploads the local save', async () => {
    const Strategy = await load()
    const { sdk, uploaded } = makeSdk()
    const s = new Strategy(async () => sdk as unknown as WavedashSaveSdk)
    const local = makeLocal({ [STATE_KEY]: save(3, 1) })
    await s.hydrate(local)
    expect(s.hydrateState).toBe('success-empty')
    await vi.advanceTimersByTimeAsync(1_600)
    expect(sdk.uploadRemoteFile).toHaveBeenCalledWith(PATH)
    expect(uploaded().blob).toBe(save(3, 1))
  })

  it('restores a cloud save that is further along (the wiped-iOS-storage case)', async () => {
    const Strategy = await load()
    const { sdk } = makeSdk({ v: 1, blob: save(9, 4), meta: null })
    const s = new Strategy(async () => sdk as unknown as WavedashSaveSdk)
    const local = makeLocal()
    await s.hydrate(local)
    expect(s.hydrateState).toBe('success-with-data')
    expect(local.get(STATE_KEY)).toBe(save(9, 4))
    await vi.advanceTimersByTimeAsync(30_000)
    expect(sdk.uploadRemoteFile).not.toHaveBeenCalled()
  })

  it('keeps a save slot loaded on purpose over a cloud file that is further along', async () => {
    const Strategy = await load()
    const { sdk, uploaded } = makeSdk({ v: 1, blob: JSON.stringify({ bc_level: 20, bc_story: 6, bc_save_epoch: 1 }), meta: null })
    const s = new Strategy(async () => sdk as unknown as WavedashSaveSdk)
    const loaded = JSON.stringify({ bc_level: 3, bc_story: 0, bc_save_epoch: 2 })
    const local = makeLocal({ [STATE_KEY]: loaded })
    await s.hydrate(local)
    expect(local.get(STATE_KEY)).toBe(loaded)
    await vi.advanceTimersByTimeAsync(1_600)
    expect(uploaded().blob).toBe(loaded)
  })

  it('keeps newer local progress over an older cloud file, and pushes it up', async () => {
    const Strategy = await load()
    const { sdk, uploaded } = makeSdk({ v: 1, blob: save(2, 0), meta: null })
    const s = new Strategy(async () => sdk as unknown as WavedashSaveSdk)
    const local = makeLocal({ [STATE_KEY]: save(12, 5) })
    await s.hydrate(local)
    expect(local.get(STATE_KEY)).toBe(save(12, 5))
    await vi.advanceTimersByTimeAsync(1_600)
    expect(uploaded().blob).toBe(save(12, 5))
  })

  it('never uploads before a successful read; retries the read, then uploads', async () => {
    const Strategy = await load()
    const { sdk, uploaded } = makeSdk()
    sdk.downloadRemoteFile.mockResolvedValueOnce({ success: false, data: null, message: '503 (Service Unavailable)' })
    const s = new Strategy(async () => sdk as unknown as WavedashSaveSdk)
    const local = makeLocal()
    await s.hydrate(local)
    expect(s.hydrateState).toBe('failed-retrying')

    local.set(STATE_KEY, save(4, 1))
    s.onLocalSet(STATE_KEY, save(4, 1))
    await s.flush()
    expect(sdk.uploadRemoteFile).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(5_000)
    expect(s.hydrateState).toBe('success-empty')
    await vi.advanceTimersByTimeAsync(1_600)
    expect(uploaded().blob).toBe(save(4, 1))
  })

  it('uploads at most once per interval during play, carrying the newest state', async () => {
    const Strategy = await load()
    const { UPLOAD_MIN_INTERVAL_MS } = await import('@/utils/save/WavedashStrategy')
    const { sdk, uploaded } = makeSdk()
    const s = new Strategy(async () => sdk as unknown as WavedashSaveSdk)
    await s.hydrate(makeLocal())

    s.onLocalSet(STATE_KEY, save(1, 0))
    await vi.advanceTimersByTimeAsync(1_600)
    expect(sdk.uploadRemoteFile).toHaveBeenCalledTimes(1)

    for (let i = 2; i <= 10; i++) {
      s.onLocalSet(STATE_KEY, save(i, 0))
      await vi.advanceTimersByTimeAsync(1_000)
    }
    expect(sdk.uploadRemoteFile).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(UPLOAD_MIN_INTERVAL_MS)
    expect(sdk.uploadRemoteFile).toHaveBeenCalledTimes(2)
    expect(uploaded().blob).toBe(save(10, 0))
  })

  it('flush (app hidden / closed) uploads at once, inside the interval', async () => {
    const Strategy = await load()
    const { sdk, uploaded } = makeSdk()
    const s = new Strategy(async () => sdk as unknown as WavedashSaveSdk)
    await s.hydrate(makeLocal())
    s.onLocalSet(STATE_KEY, save(1, 0))
    await vi.advanceTimersByTimeAsync(1_600)
    s.onLocalSet(STATE_KEY, save(2, 0))
    await s.flush()
    expect(sdk.uploadRemoteFile).toHaveBeenCalledTimes(2)
    expect(uploaded().blob).toBe(save(2, 0))
    await s.flush()
    expect(sdk.uploadRemoteFile).toHaveBeenCalledTimes(2)
  })

  it('honours the server retry-after when rate limited, then uploads', async () => {
    const Strategy = await load()
    const { sdk, uploaded } = makeSdk()
    sdk.uploadRemoteFile.mockResolvedValueOnce({
      success: false, data: null, message: 'Upload rate limited; try again in 45s. Upload less often.'
    })
    const s = new Strategy(async () => sdk as unknown as WavedashSaveSdk)
    await s.hydrate(makeLocal())
    s.onLocalSet(STATE_KEY, save(5, 0))
    await s.flush()
    expect(sdk.uploadRemoteFile).toHaveBeenCalledTimes(1)

    await s.flush()
    await vi.advanceTimersByTimeAsync(40_000)
    expect(sdk.uploadRemoteFile).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(6_000)
    expect(sdk.uploadRemoteFile).toHaveBeenCalledTimes(2)
    expect(uploaded().blob).toBe(save(5, 0))
  })

  it('boots on local state when the cloud read hangs, and ignores the late answer', async () => {
    const Strategy = await load()
    const { sdk } = makeSdk({ v: 1, blob: save(9, 9), meta: null })
    let release: () => void = () => {}
    sdk.downloadRemoteFile.mockImplementationOnce(() => new Promise(resolve => {
      release = () => resolve({ success: true, data: PATH })
    }))
    const s = new Strategy(async () => sdk as unknown as WavedashSaveSdk)
    const local = makeLocal({ [STATE_KEY]: save(1, 0) })
    const done = s.hydrate(local)
    await vi.advanceTimersByTimeAsync(8_000)
    await done
    expect(s.hydrateState).toBe('failed-retrying')
    expect(local.get(STATE_KEY)).toBe(save(1, 0))

    // The retry ladder's first rung reads again and restores the cloud save;
    // the hung first read finishing afterwards must not apply twice.
    await vi.advanceTimersByTimeAsync(5_000)
    expect(local.get(STATE_KEY)).toBe(save(9, 9))
    local.set(STATE_KEY, save(10, 9))
    release()
    await vi.advanceTimersByTimeAsync(0)
    expect(local.get(STATE_KEY)).toBe(save(10, 9))
  })

  it('plays local-only without an SDK', async () => {
    const Strategy = await load()
    const s = new Strategy(async () => null)
    await s.hydrate(makeLocal({ [STATE_KEY]: save(1, 0) }))
    expect(s.hydrateState).toBe('success-empty')
    s.onLocalSet(STATE_KEY, save(2, 0))
    await expect(s.flush()).resolves.toBeUndefined()
  })
})
