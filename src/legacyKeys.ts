// ─── Pre-rename storage keys ────────────────────────────────────────────────
//
// The game shipped as "Mega Adventure" before it became Battlecross, and every
// top-level storage key carried the old slug. These strings exist ONLY so saves
// written before the rename migrate onto the new keys: nothing may ever write
// them again, and this is the one place in `src/` allowed to spell them.
//
// Two paths carry an old save forward:
//
//   • This device — each key's owner calls `migrateLegacyKey` before its first
//     read (`useGameState` at module load, and `SaveManager` again before it
//     seeds, so the blob moves before anything reads state).
//   • The cloud — a payload saved before the rename is
//     `{ mega_adventure_state, __save_meta__ }`. The strategies that store the
//     key name in the payload (CrazyGames, Playgama, GamePix, Glitch) pass what
//     they read through `adoptLegacyField` and only ever write the new name.
//
// Both are idempotent: once a key has moved, the legacy name is gone and every
// later boot is a no-op.

export const LEGACY_KEYS = {
  /** → `STATE_KEY` (`src/use/useGameState.ts`), locally AND in cloud payloads. */
  STATE: 'mega_adventure_state',
  /** → `BOARD_CACHE_KEY` (`src/use/useLeaderboard.ts`). Device-only. */
  BOARD_CACHE: 'mega_adventure_board_cache',
  /** → `DEVICE_UID_KEY` (`src/use/usePlayerIdentity.ts`). Device-only. */
  DEVICE_UID: 'mega_adventure_uid',
  /** → `DEVICE_NAME_KEY` (`src/use/usePlayerIdentity.ts`). Device-only. */
  DEVICE_NAME: 'mega_adventure_name'
} as const

/**
 * Move one pre-rename localStorage entry onto its new key.
 *
 *   legacy only  → copied to `key`, then removed
 *   both present → `key` wins, legacy removed
 *   neither / new only → nothing to do
 *
 * The legacy entry is removed only AFTER the copy landed: a write that throws
 * (quota) leaves it in place for the next boot to retry. Never throws — private
 * mode or no storage at all simply means there is nothing to migrate.
 */
export const migrateLegacyKey = (legacyKey: string, key: string, storage?: Storage): void => {
  try {
    const store = storage ?? localStorage
    const legacy = store.getItem(legacyKey)
    if (legacy === null) return
    if (store.getItem(key) === null) store.setItem(key, legacy)
    store.removeItem(legacyKey)
  } catch { /* private mode / no storage — nothing to migrate from either */ }
}

/**
 * Re-file a pre-rename field of a CLOUD payload under its new name, in place.
 *
 * Takes the new field when the payload has no value for it; drops the legacy
 * field either way, so nothing downstream (merge scoring, the cloud → local
 * copy, the next upload) ever sees the old name. Returns whether the payload
 * carried the legacy field — the caller's cue to retire it on the backend once
 * the new field is confirmed written.
 */
export const adoptLegacyField = (
  payload: Map<string, unknown> | Record<string, unknown>,
  legacyKey: string,
  key: string
): boolean => {
  if (payload instanceof Map) {
    if (!payload.has(legacyKey)) return false
    if (payload.get(key) == null) payload.set(key, payload.get(legacyKey))
    payload.delete(legacyKey)
    return true
  }
  if (!Object.prototype.hasOwnProperty.call(payload, legacyKey)) return false
  if (payload[key] == null) payload[key] = payload[legacyKey]
  delete payload[legacyKey]
  return true
}
