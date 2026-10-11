// ─── Wavedash SaveStrategy (Remote Storage cloud file) ─────────────────────
//
// Mirrors gameplay state through the Wavedash SDK's Remote Storage: one
// per-player file in Wavedash's cloud (`uploadRemoteFile` /
// `downloadRemoteFile`, staged through the SDK's local IndexedDB file store
// with `writeLocalFile` / `readLocalFile`).
//
// Why it exists: the browser storage of a game running inside the Wavedash
// home-screen app on iOS did not survive a full close of the app — the
// player came back to a fresh save. localStorage alone cannot fix that, so
// the cloud copy is the one that survives, and every start reads it back.
//
// Design, following YandexStrategy:
//
//   1. **Authoritative cloud-read on hydrate**, merged by progress
//      (`decideMerge`) so an older cloud file never wipes newer local play
//      and a fresh-defaults device never overwrites the real save. A 404 is
//      a confirmed-empty cloud (`success-empty`); any other failure is
//      `failed-retrying` with the background retry ladder, and writes queue
//      until a read succeeds.
//
//   2. **One file, whole snapshot.** `{ v, blob, meta }` JSON — the
//      consolidated `bcross_state` blob plus the SaveMeta the merge reads.
//
//   3. **Throttled uploads.** Wavedash limits uploads to 30 / minute and
//      300 / hour per player per game, and once over, the SDK refuses every
//      upload until the server's retry-after passes. Uploads run at most
//      every UPLOAD_MIN_INTERVAL_MS during play (≤ 180 / hour), plus one on
//      every `flush()` (app hidden / closed) — the SDK PUTs small files with
//      `keepalive`, so the close-time upload has a chance to land after the
//      page is gone. A save lost to a hard kill is at most one interval old.

import type {
  HydrateState,
  HydrateNotice,
  HydrateNoticeListener,
  LocalStorageAccessor,
  SaveStrategy
} from './types'
import { isInternalKey } from './types'
import { STATE_KEY } from '@/use/useGameState'
import { META_KEY, computeMeta, decideMerge, epochOf, parseMeta, serializeMeta } from './SaveMergePolicy'
import { isDebug } from '@/use/useMatch'

/** The slice of the Wavedash SDK this strategy uses. The SDK's public
 *  methods answer `{ success, data, message }` instead of throwing; the
 *  strategy still treats a throw as a failure. */
export interface WavedashResponseLike<T> {
  success: boolean
  data: T | null
  message?: string
}

export interface WavedashSaveSdk {
  downloadRemoteFile(path: string): Promise<WavedashResponseLike<string>>
  uploadRemoteFile(path: string): Promise<WavedashResponseLike<string>>
  writeLocalFile(path: string, data: Uint8Array): Promise<boolean>
  readLocalFile(path: string): Promise<Uint8Array | null>
}

export type WavedashSdkGetter = () => Promise<WavedashSaveSdk | null>

/** Default getter: the `WavedashJS` global the platform wrapper injects
 *  (a promise of the SDK; `main.ts` has already awaited its `init`). */
const defaultSdkGetter: WavedashSdkGetter = async () => {
  try {
    const sdk = await (window as any).WavedashJS
    return sdk && typeof sdk.uploadRemoteFile === 'function' ? sdk as WavedashSaveSdk : null
  } catch {
    return null
  }
}

/** Remote key, relative to the player's root on Wavedash. */
export const WAVEDASH_SAVE_PATH = 'bcross/save.json'

const SAVE_FILE_VERSION = 1

const PORTAL_KEYS: ReadonlySet<string> = new Set([STATE_KEY, META_KEY])

/** Quiet time after a write before an upload is considered. */
const UPLOAD_DEBOUNCE_MS = 1_500
/** Minimum gap between two timer-driven uploads (≤ 180 / hour, leaving
 *  room under Wavedash's 300 / hour for the close-time flushes). */
export const UPLOAD_MIN_INTERVAL_MS = 20_000
/** Back-off after a failed upload that did not say how long to wait. */
const UPLOAD_FAIL_BACKOFF_MS = 30_000
/** A cloud read slower than this lets the game boot on local state and
 *  keeps retrying in the background — boot must not hang on the network. */
const HYDRATE_TIMEOUT_MS = 8_000

const HYDRATE_RETRY_DELAYS_MS = [5_000, 15_000, 45_000, 120_000, 300_000]
const HYDRATE_RETRY_LOOP_MS = 900_000

const TAG = '[wavedash-save]'
const dlog = (...args: unknown[]): void => {
  if (isDebug.value) console.info(...args)
}

const shouldMirror = (key: string): boolean =>
  !isInternalKey(key) && PORTAL_KEYS.has(key)

/** The SDK's own rate-limit refusal names the wait ("try again in 42s"). */
const parseRetryAfterMs = (message: string | undefined): number | null => {
  const m = /try again in (\d+)\s*s/i.exec(message ?? '')
  return m ? Number(m[1]) * 1000 : null
}

const isNotFound = (message: string | undefined): boolean => /\b404\b/.test(message ?? '')

const messageOf = (e: unknown): string => (e instanceof Error ? e.message : String(e))

interface SaveFile {
  v?: number
  blob?: string | null
  meta?: string | null
}

const timeout = (ms: number): Promise<'timeout'> =>
  new Promise(resolve => setTimeout(() => resolve('timeout'), ms))

export class WavedashStrategy implements SaveStrategy {
  readonly name = 'wavedash'

  hydrateState: HydrateState = 'pending'

  private noticeListeners = new Set<HydrateNoticeListener>()
  /** Latest value of each mirrored key — the upload always carries the
   *  whole snapshot, because the cloud holds one file. */
  private latest = new Map<string, string>()
  /** True while `latest` holds something the cloud has not seen. */
  private dirty = false
  private uploadTimer: ReturnType<typeof setTimeout> | null = null
  private inFlight: Promise<void> | null = null
  private lastUploadAt = Number.NEGATIVE_INFINITY
  /** No upload before this time — the server's retry-after, or a back-off. */
  private blockedUntil = 0
  private local: LocalStorageAccessor | null = null
  private retryAttempt = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  /** Bumped per hydrate attempt; a read that lost its timeout race and
   *  lands later must not overwrite what the game has played since. */
  private hydrateGen = 0

  constructor(private readonly getSdk: WavedashSdkGetter = defaultSdkGetter) {}

  // ─── Hydrate ────────────────────────────────────────────────────────────

  async hydrate(local: LocalStorageAccessor): Promise<void> {
    this.local = local
    await this.runHydrate(local)
    if (this.hydrateState === 'failed-retrying') this.scheduleRetry()
  }

  async retryHydrate(local: LocalStorageAccessor): Promise<HydrateState> {
    this.local = local
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    await this.runHydrate(local)
    if (this.hydrateState === 'failed-retrying') this.scheduleRetry()
    return this.hydrateState
  }

  private scheduleRetry(): void {
    if (this.retryTimer) return
    const delay = HYDRATE_RETRY_DELAYS_MS[this.retryAttempt] ?? HYDRATE_RETRY_LOOP_MS
    // Only the ladder's own timer advances it (see YandexStrategy): the boot
    // sanity guard and the banner's Retry also come through `retryHydrate`.
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      this.retryAttempt++
      if (this.local) void this.retryHydrate(this.local)
    }, delay)
  }

  private async runHydrate(local: LocalStorageAccessor): Promise<void> {
    const gen = ++this.hydrateGen
    const result = await Promise.race([this.readCloud(), timeout(HYDRATE_TIMEOUT_MS)])
    if (gen !== this.hydrateGen) return

    if (result === 'timeout') {
      console.warn(`${TAG} hydrate: cloud read timed out`)
      this.setState('failed-retrying', { reason: 'timeout' })
      return
    }
    if (result.kind === 'no-sdk') {
      // No SDK (local dev, wrapper missing): local-only, like a confirmed
      // empty cloud, so the game plays normally. Nothing will upload.
      dlog(`${TAG} hydrate: no SDK → success-empty (local-only)`)
      this.seedLatest(local)
      this.setState('success-empty', { reason: 'no-sdk' })
      return
    }
    if (result.kind === 'error') {
      console.warn(`${TAG} hydrate: cloud read failed`, result.message)
      this.setState('failed-retrying', { reason: 'download-failed' })
      return
    }

    this.retryAttempt = 0
    const remoteState = result.kind === 'file' && typeof result.file.blob === 'string' && result.file.blob.length > 0
      ? result.file.blob
      : null
    if (remoteState === null) {
      dlog(`${TAG} hydrate: cloud empty → success-empty`)
      this.setState('success-empty')
      this.pushLocal(local)
      return
    }

    const remoteMetaRaw = result.kind === 'file' ? result.file.meta : null
    const remoteMeta = parseMeta(typeof remoteMetaRaw === 'string' ? remoteMetaRaw : null)
      ?? computeMeta({ get: (k) => (k === STATE_KEY ? remoteState : null) })
    const localMeta = parseMeta(local.get(META_KEY))
      ?? (local.get(STATE_KEY) !== null ? computeMeta({ get: (k) => local.get(k) }) : null)
    const resolution = decideMerge(localMeta, remoteMeta, {
      local: epochOf({ get: (k) => local.get(k) }),
      remote: epochOf({ get: (k) => (k === STATE_KEY ? remoteState : null) })
    })
    if (resolution.kind === 'remote-wins' || resolution.kind === 'remote-only') {
      // Writes queued before the read were made against pre-hydrate state;
      // the cloud just won, so they must not go back up over it.
      this.dirty = false
      local.set(STATE_KEY, remoteState)
      if (remoteMeta) local.set(META_KEY, serializeMeta(remoteMeta))
      this.seedLatest(local)
      dlog(`${TAG} hydrate: ${resolution.kind} — cloud → local`)
      this.setState('success-with-data')
      return
    }
    dlog(`${TAG} hydrate: ${resolution.kind} — keeping local, queued for push`)
    this.setState('success-with-data')
    this.pushLocal(local)
  }

  private async readCloud(): Promise<
    | { kind: 'no-sdk' }
    | { kind: 'empty' }
    | { kind: 'file'; file: SaveFile }
    | { kind: 'error'; message: string }
  > {
    try {
      const sdk = await this.getSdk()
      if (!sdk) return { kind: 'no-sdk' }
      const res = await sdk.downloadRemoteFile(WAVEDASH_SAVE_PATH)
      if (!res?.success) {
        // The SDK reports a missing file as the server's "404 (Not Found)".
        if (isNotFound(res?.message)) return { kind: 'empty' }
        return { kind: 'error', message: res?.message ?? 'download failed' }
      }
      const bytes = await sdk.readLocalFile(WAVEDASH_SAVE_PATH)
      if (!bytes) return { kind: 'error', message: 'downloaded file unreadable' }
      const text = new TextDecoder().decode(bytes)
      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        // A corrupt cloud file holds no progress we can use; treating it
        // as empty lets the local save replace it on the next upload.
        console.warn(`${TAG} cloud file is not JSON — treating as empty`)
        return { kind: 'empty' }
      }
      return { kind: 'file', file: (parsed && typeof parsed === 'object' ? parsed : {}) as SaveFile }
    } catch (e) {
      if (isNotFound(messageOf(e))) return { kind: 'empty' }
      return { kind: 'error', message: messageOf(e) }
    }
  }

  private seedLatest(local: LocalStorageAccessor): void {
    for (const key of PORTAL_KEYS) {
      const v = local.get(key)
      if (v !== null) this.latest.set(key, v)
    }
  }

  /** Queue the local save for upload (local won, or the cloud is empty). */
  private pushLocal(local: LocalStorageAccessor): void {
    this.seedLatest(local)
    if (this.latest.has(STATE_KEY)) {
      this.dirty = true
      this.scheduleUpload()
    }
  }

  onHydrateNotice(listener: HydrateNoticeListener): () => void {
    this.noticeListeners.add(listener)
    return () => this.noticeListeners.delete(listener)
  }

  // ─── Writes ─────────────────────────────────────────────────────────────

  private get canUpload(): boolean {
    return this.hydrateState === 'success-with-data' || this.hydrateState === 'success-empty'
  }

  onLocalSet(key: string, value: string): void {
    if (!shouldMirror(key)) return
    this.latest.set(key, value)
    this.dirty = true
    // Before a successful read the change only queues: pushing now could
    // put fresh defaults over a real cloud save.
    if (this.canUpload) this.scheduleUpload()
  }

  onLocalRemove(key: string): void {
    if (!shouldMirror(key)) return
    this.latest.delete(key)
    this.dirty = true
    if (this.canUpload) this.scheduleUpload()
  }

  async flush(): Promise<void> {
    if (this.uploadTimer) {
      clearTimeout(this.uploadTimer)
      this.uploadTimer = null
    }
    await this.drain(true)
  }

  dispose(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    if (this.uploadTimer) {
      clearTimeout(this.uploadTimer)
      this.uploadTimer = null
    }
    this.dirty = false
  }

  // ─── Internal ───────────────────────────────────────────────────────────

  private setState(state: HydrateState, extra: Partial<HydrateNotice> = {}): void {
    this.hydrateState = state
    const notice: HydrateNotice = { state, ...extra }
    for (const l of this.noticeListeners) {
      try { l(notice) } catch (e) { console.warn(`${TAG} notice listener threw`, e) }
    }
  }

  private scheduleUpload(): void {
    if (this.uploadTimer !== null) return
    const now = Date.now()
    const delay = Math.max(
      UPLOAD_DEBOUNCE_MS,
      this.lastUploadAt + UPLOAD_MIN_INTERVAL_MS - now,
      this.blockedUntil - now
    )
    this.uploadTimer = setTimeout(() => {
      this.uploadTimer = null
      void this.drain(false)
    }, delay)
  }

  /** Upload the snapshot. `force` (app hidden / closing) skips the
   *  interval throttle, but never the server's retry-after: the SDK would
   *  refuse that upload without sending it anyway. */
  private async drain(force: boolean): Promise<void> {
    if (!this.dirty || !this.canUpload) return
    if (this.inFlight) {
      await this.inFlight
      if (!this.dirty) return
    }
    const now = Date.now()
    if (now < this.blockedUntil || (!force && now < this.lastUploadAt + UPLOAD_MIN_INTERVAL_MS)) {
      this.scheduleUpload()
      return
    }
    const sdk = await this.getSdk()
    if (!sdk) return

    const file: SaveFile = {
      v: SAVE_FILE_VERSION,
      blob: this.latest.get(STATE_KEY) ?? null,
      meta: this.latest.get(META_KEY) ?? null
    }
    this.dirty = false
    this.lastUploadAt = now

    this.inFlight = (async () => {
      let failure: string | null = null
      try {
        const bytes = new TextEncoder().encode(JSON.stringify(file))
        const written = await sdk.writeLocalFile(WAVEDASH_SAVE_PATH, bytes)
        if (!written) {
          failure = 'writeLocalFile failed'
        } else {
          const res = await sdk.uploadRemoteFile(WAVEDASH_SAVE_PATH)
          if (!res?.success) failure = res?.message ?? 'upload failed'
        }
      } catch (e) {
        failure = messageOf(e)
      }
      if (failure === null) {
        dlog(`${TAG} uploaded (force=${force})`)
        return
      }
      console.warn(`${TAG} upload failed — re-queuing`, failure)
      // Writes made during the upload already set `dirty`; a failed upload
      // sets it too, so the next attempt carries the newest snapshot.
      this.dirty = true
      this.blockedUntil = Date.now() + (parseRetryAfterMs(failure) ?? UPLOAD_FAIL_BACKOFF_MS)
    })()
    try {
      await this.inFlight
    } finally {
      this.inFlight = null
    }
    if (this.dirty) this.scheduleUpload()
  }
}
