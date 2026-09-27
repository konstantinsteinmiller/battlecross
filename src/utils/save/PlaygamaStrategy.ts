// ─── Playgama save strategy (Bridge v2) ────────────────────────────────────
//
// Mirrors the consolidated `mega_droid_state` blob and its `__save_meta__` through
// `bridge.storage`. The same code runs on three backends, because the same
// archive does:
//
//   playgama  `PLAYGAMA_SDK.cloudSaveApi` — on whenever the portal reports
//             cloud save as supported (2.2.0 has no `allowAnonymousCloudSave`
//             option any more; guests get cloud rows too)
//   youtube   `ytgame.game.loadData / saveData` — ONE string for the whole save
//   qa_tool / mock   the Bridge's own localStorage
//
// ── Four rules, each one a way the previous version could lose a save ──
//
// 1. HYDRATE READS THE CLOUD. The v1 strategy's hydrate was a no-op marked
//    `success-with-data`, so nothing was ever read back: a new device, a wiped
//    iframe or YouTube's own storage (localStorage is null there) booted at
//    defaults — and the fake terminal state also switched off the "never push
//    before a successful read" rule, so those defaults were then uploaded over
//    the real save. `main.ts` now awaits `playgamaPlugin()` BEFORE
//    `SaveManager.init()`, so `bridge.storage` is live here.
//
// 2. ONE BATCHED WRITE, NEVER CONCURRENT ONES. Both cloud backends above are
//    read-modify-write of the WHOLE save (`getState` → merge → `setItems`,
//    `loadData` → merge → `saveData`). Two unawaited `storage.set` calls read
//    the same snapshot and the second silently drops the first one's keys. The
//    2.2.0 StorageModule does queue operations internally, but a per-key loop
//    still costs a full cloud round-trip per key; so the dirty map drains as a
//    single `storage.set([keys], [values])`, one flight at a time.
//
// 3. ONLY THE SAVE CROSSES. `mega_droid_state` + `__save_meta__`, nothing else —
//    dev toggles, perf flags and ad-tech scribbles stay on the device. A cloud
//    save from before the rename holds its blob under `LEGACY_KEYS.STATE`: the
//    hydrate read asks for it too, adopts it when the new key is empty, and the
//    first push under the new key deletes the legacy one after it.
//
// 4. THE CALL IS THE CERTIFICATION SIGNAL. The QA Tool's "Game Saves" check
//    watches `bridge.storage.set`, so writes go through the Bridge even where
//    its backend is plain localStorage.
//
// ── A 2.2.0 behaviour to know about ──
//
// After a successful CLOUD write the Bridge removes that key from its own
// handle on localStorage, and a `get` for a key the cloud lacks uploads the
// local value and removes it locally too. The Bridge captured that handle when
// its module loaded — before `SaveManager` installed its proxy — so these are
// RAW removals the proxy never sees. Nothing is lost in-session:
// `SaveManager` serves every read from `BlobStorage`'s in-memory state and
// re-persists raw on the next write. Across a reload the cloud read in rule 1
// is what brings the save back, which is why that rule is not optional.

import { ref } from 'vue'
import type {
  HydrateNotice,
  HydrateNoticeListener,
  HydrateState,
  LocalStorageAccessor,
  SaveStrategy
} from './types'
import { isInternalKey } from './types'
import { STATE_KEY } from '@/use/useGameState'
import { LEGACY_KEYS, adoptLegacyField } from '@/legacyKeys'
import { META_KEY, computeMeta, decideMerge, parseMeta, serializeMeta } from './SaveMergePolicy'
import { isDebug } from '@/use/useMatch'
import { getPlaygamaBridge, isPlaygamaSdkActive } from '@/utils/playgamaPlugin'

const TAG = '[playgama-save]'
const dlog = (...args: unknown[]): void => {
  if (isDebug.value) console.info(...args)
}

/** Debounce for cloud pushes — collapses a burst of state writes (a bank, a
 *  purchase, a settings drag) into one whole-save round-trip. */
const WRITE_DEBOUNCE_MS = 600
/** Retry ladder for a cloud READ that failed. Writes stay queued meanwhile. */
const RETRY_DELAYS_MS = [1_000, 3_000, 8_000] as const

/** The part of `bridge.storage` touched here, typed defensively. */
interface BridgeStorage {
  get?: (key: string | string[], tryParseJson?: boolean) => Promise<unknown>
  set?: (key: string | string[], value: unknown) => Promise<void>
  delete?: (key: string | string[]) => Promise<void>
}

const PORTAL_KEYS: ReadonlySet<string> = new Set([STATE_KEY, META_KEY])

const shouldMirror = (key: string): boolean => !isInternalKey(key) && PORTAL_KEYS.has(key)

const getBridgeStorage = (): BridgeStorage | null => {
  if (!isPlaygamaSdkActive.value) return null
  try {
    return (getPlaygamaBridge()?.storage as BridgeStorage | undefined) ?? null
  } catch {
    // The module getters throw before init; defensive after it.
    return null
  }
}

/**
 * A stored value as the string this save layer deals in.
 *
 * `get(..., false)` asks for raw strings, but a backend is JSON on the wire and
 * can still hand back a parsed object. Re-serialize rather than discard: a
 * `typeof value === 'string'` check alone drops the player's whole save.
 */
export const asStoredString = (value: unknown): string | null => {
  if (typeof value === 'string') return value.length > 0 ? value : null
  if (value == null) return null
  if (typeof value === 'object') {
    try { return JSON.stringify(value) } catch { return null }
  }
  return String(value)
}

export class PlaygamaStrategy implements SaveStrategy {
  readonly name = 'playgama'

  hydrateState: HydrateState = 'pending'
  /** Reactive mirror for the save-status banner. */
  readonly _state = ref<HydrateState>('pending')

  private noticeListeners = new Set<HydrateNoticeListener>()
  /** Latest value per key; `null` = delete. */
  private dirty = new Map<string, string | null>()
  private writeTimer: ReturnType<typeof setTimeout> | null = null
  private inFlight: Promise<void> | null = null
  /**
   * The value each in-flight key is being pushed with. The Bridge's LOCAL
   * backend writes localStorage inside `set`; if that ever reaches the patched
   * setter it must not bounce back into another `set`.
   *
   * By VALUE, not by key. A key-only guard also swallowed a genuinely NEW value
   * written while the push was in flight — the player's next bank or purchase
   * silently never reached the cloud (caught by the concurrent-writes spec).
   * Only the echo of the value being pushed is skipped.
   */
  private writeInFlight = new Map<string, string | null>()
  private retriesRun = 0
  private local: LocalStorageAccessor | null = null
  /** The last cloud read found a pre-rename blob (`LEGACY_KEYS.STATE`). It is
   *  deleted after the next push that carries STATE_KEY has landed. */
  private legacyInCloud = false

  // ─── Hydrate ────────────────────────────────────────────────────────────

  async hydrate(local: LocalStorageAccessor): Promise<void> {
    this.local = local
    const storage = getBridgeStorage()
    if (!storage) {
      // The Bridge never came up (module blocked, init timed out). Nothing can
      // be pushed without it either, so local-only is safe — and it must not
      // read as a failure that blocks the game.
      console.warn(`${TAG} Bridge unavailable — local-only this session`)
      this.setState('success-empty', { reason: 'no-bridge' })
      return
    }
    await this.readAndMerge(storage, local)
  }

  async retryHydrate(local: LocalStorageAccessor): Promise<HydrateState> {
    this.local = local
    const storage = getBridgeStorage()
    if (!storage) return this.hydrateState
    await this.readAndMerge(storage, local)
    return this.hydrateState
  }

  onHydrateNotice(listener: HydrateNoticeListener): () => void {
    this.noticeListeners.add(listener)
    return () => this.noticeListeners.delete(listener)
  }

  private async readAndMerge(storage: BridgeStorage, local: LocalStorageAccessor): Promise<void> {
    if (typeof storage.get !== 'function') {
      this.setState('success-empty', { reason: 'no-get-api' })
      this.seedFromLocal(local)
      return
    }

    let remoteState: string | null
    let remoteMetaRaw: string | null
    try {
      // ONE call for every key: on a whole-blob backend every read is a full
      // download. `false` = do not JSON-parse, the blob is a string. The
      // pre-rename key rides along so an old cloud save is found in the same
      // round-trip (the new key wins when both are there).
      const raw = await storage.get([STATE_KEY, META_KEY, LEGACY_KEYS.STATE], false)
      const values = Array.isArray(raw) ? raw : [raw, null, null]
      const remote: Record<string, string | null> = { [STATE_KEY]: asStoredString(values[0]) }
      const legacy = asStoredString(values[2])
      if (legacy !== null) remote[LEGACY_KEYS.STATE] = legacy
      this.legacyInCloud = adoptLegacyField(remote, LEGACY_KEYS.STATE, STATE_KEY)
      remoteState = remote[STATE_KEY] ?? null
      remoteMetaRaw = asStoredString(values[1])
    } catch (e) {
      console.warn(`${TAG} hydrate: storage.get failed`, e)
      this.setState('failed-retrying', { reason: 'get-failed' })
      this.scheduleRetry(local)
      return
    }

    if (remoteState === null && remoteMetaRaw === null) {
      dlog(`${TAG} hydrate: remote empty → success-empty`)
      this.setState('success-empty')
      this.seedFromLocal(local)
      return
    }

    const remoteMeta = parseMeta(remoteMetaRaw)
      ?? (remoteState !== null ? computeMeta({ get: (k) => (k === STATE_KEY ? remoteState : null) }) : null)
    const localMeta = parseMeta(local.get(META_KEY))
      ?? (local.get(STATE_KEY) !== null ? computeMeta({ get: (k) => local.get(k) }) : null)

    const resolution = decideMerge(localMeta, remoteMeta)
    if ((resolution.kind === 'remote-wins' || resolution.kind === 'remote-only') && remoteState !== null) {
      // Anything queued before the read was written against the pre-hydrate
      // defaults. The cloud just won, so pushing that queue later would put the
      // defaults back over the save that won.
      this.dirty.clear()
      local.set(STATE_KEY, remoteState)
      if (remoteMeta) local.set(META_KEY, serializeMeta(remoteMeta))
      // An adopted pre-rename save goes straight back up under its new name.
      if (this.legacyInCloud) this.dirty.set(STATE_KEY, remoteState)
      dlog(`${TAG} hydrate: ${resolution.kind} — cloud → local`)
      this.setState('success-with-data')
      return
    }

    dlog(`${TAG} hydrate: ${resolution.kind} — keeping local, queued for push`)
    this.setState('success-with-data')
    this.seedFromLocal(local)
  }

  /**
   * Delete a pre-rename cloud blob, AFTER a push carrying STATE_KEY resolved —
   * the legacy copy never goes before the new one has landed. Best-effort and
   * outside the batch's re-queue: some Bridge backends reject deletes, and a
   * failure there must not re-send the save every debounce. A copy left behind
   * is harmless (the next read adopts it, the new key wins) and is retried then.
   */
  private async retireLegacyState(del: BridgeStorage['delete']): Promise<void> {
    this.legacyInCloud = false
    if (!del) return
    try {
      await del([LEGACY_KEYS.STATE])
      dlog(`${TAG} retired the pre-rename cloud save`)
    } catch (e) {
      console.warn(`${TAG} retiring the pre-rename cloud save failed`, e)
    }
  }

  /** Queue the local snapshot so the cloud catches up with it. */
  private seedFromLocal(local: LocalStorageAccessor): void {
    const state = local.get(STATE_KEY)
    if (state === null) return
    this.dirty.set(STATE_KEY, state)
    this.scheduleFlush()
  }

  private scheduleRetry(local: LocalStorageAccessor): void {
    const delay = RETRY_DELAYS_MS[this.retriesRun]
    if (delay === undefined) {
      this.setState('failed-final', { reason: 'retries-exhausted' })
      return
    }
    this.retriesRun += 1
    setTimeout(() => {
      const storage = getBridgeStorage()
      if (storage) void this.readAndMerge(storage, local)
      else this.scheduleRetry(local)
    }, delay)
  }

  // ─── Writes ─────────────────────────────────────────────────────────────

  onLocalSet(key: string, value: string): void {
    if (!shouldMirror(key)) return
    if (this.writeInFlight.has(key) && this.writeInFlight.get(key) === value) return
    this.dirty.set(key, value)
    this.scheduleFlush()
  }

  onLocalRemove(key: string): void {
    if (!shouldMirror(key)) return
    if (this.writeInFlight.has(key) && this.writeInFlight.get(key) === null) return
    this.dirty.set(key, null)
    this.scheduleFlush()
  }

  async flush(): Promise<void> {
    if (this.writeTimer !== null) {
      clearTimeout(this.writeTimer)
      this.writeTimer = null
    }
    await this.drain()
  }

  dispose(): void {
    if (this.writeTimer !== null) clearTimeout(this.writeTimer)
    this.writeTimer = null
    this.noticeListeners.clear()
  }

  private canPush(): boolean {
    return this.hydrateState === 'success-with-data' || this.hydrateState === 'success-empty'
  }

  private setState(state: HydrateState, extra: Partial<HydrateNotice> = {}): void {
    this.hydrateState = state
    this._state.value = state
    const notice: HydrateNotice = { state, ...extra }
    for (const l of this.noticeListeners) {
      try { l(notice) } catch (e) { console.warn(`${TAG} notice listener threw`, e) }
    }
    // A read that succeeded on a retry releases whatever queued meanwhile.
    if (this.dirty.size > 0) this.scheduleFlush()
  }

  private scheduleFlush(): void {
    // Held, not dropped, until a read has succeeded — rule 1.
    if (!this.canPush() || this.writeTimer !== null) return
    this.writeTimer = setTimeout(() => {
      this.writeTimer = null
      void this.drain()
    }, WRITE_DEBOUNCE_MS)
  }

  private async drain(): Promise<void> {
    if (!this.canPush() || this.dirty.size === 0) return
    if (this.inFlight) {
      await this.inFlight
      if (this.dirty.size === 0) return
    }
    const storage = getBridgeStorage()
    if (!storage?.set) return
    const set = storage.set.bind(storage)
    const del = storage.delete?.bind(storage)

    // Stamp the meta from the state being pushed, so the next hydrate's merge
    // on any device compares like with like.
    const local = this.local
    if (local && this.dirty.has(STATE_KEY)) {
      const meta = serializeMeta(computeMeta({ get: (k) => local.get(k) }))
      this.dirty.set(META_KEY, meta)
    }

    const batch = new Map(this.dirty)
    this.dirty.clear()
    const setKeys: string[] = []
    const setValues: string[] = []
    const deleteKeys: string[] = []
    for (const [k, v] of batch) {
      if (v === null) deleteKeys.push(k)
      else { setKeys.push(k); setValues.push(v) }
    }

    this.inFlight = (async () => {
      for (const [k, v] of batch) this.writeInFlight.set(k, v)
      try {
        if (setKeys.length > 0) await set(setKeys, setValues)
        if (this.legacyInCloud && setKeys.includes(STATE_KEY)) await this.retireLegacyState(del)
        if (deleteKeys.length > 0 && del) await del(deleteKeys)
        dlog(`${TAG} pushed ${setKeys.length} key(s), deleted ${deleteKeys.length}`)
      } catch (e) {
        console.warn(`${TAG} push failed — re-queued`, e)
        // Newer values that arrived mid-flight win; re-queue only the rest.
        for (const [k, v] of batch) if (!this.dirty.has(k)) this.dirty.set(k, v)
        this.scheduleFlush()
      } finally {
        for (const k of batch.keys()) this.writeInFlight.delete(k)
        this.inFlight = null
      }
    })()
    await this.inFlight
  }
}
