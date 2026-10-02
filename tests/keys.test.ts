// Pins the literal string values of SAVE_KEYS. These keys are a contract with
// every player's save blob — renaming one strands existing players' progress on
// the old field, and the cloud strategies key their manifests off these exact
// strings. `src/keys.ts` is the single source of truth; this test is the tripwire
// that catches an accidental rename during a refactor.

import { describe, expect, it } from 'vitest'
import { SAVE_KEYS, isPayloadKey, META_KEY } from '@/utils/save/SaveMergePolicy'
import { STATE_KEY, STATE_FIELD_PREFIX } from '@/use/useGameState'

describe('SAVE_KEYS values are stable', () => {
  it('LEVEL key is the literal "bc_level"', () => {
    expect(SAVE_KEYS.LEVEL).toBe('bc_level')
  })
  it('STORY key is the literal "bc_story"', () => {
    expect(SAVE_KEYS.STORY).toBe('bc_story')
  })
  it('QUESTS_DONE key is the literal "bc_quests_done"', () => {
    expect(SAVE_KEYS.QUESTS_DONE).toBe('bc_quests_done')
  })
  it('the currency key is the literal "bc_gold"', () => {
    expect(SAVE_KEYS.COINS).toBe('bc_gold')
  })
})

describe('the persisted surface is exactly one state blob plus the meta blob', () => {
  it('accepts the state blob and the meta blob', () => {
    // Battlecross's own blob. Changing it would strand every existing save.
    expect(STATE_KEY).toBe('bcross_state')
    expect(STATE_FIELD_PREFIX).toBe('bc_')
    expect(isPayloadKey(STATE_KEY)).toBe(true)
    expect(isPayloadKey(META_KEY)).toBe(true)
  })

  it('never mirrors the predecessor games\' keys: this game shares no save with them', () => {
    for (const key of ['mega_adventure_state', 'mega_droid_state', 'ma_level', 'ma_bolts']) {
      expect(isPayloadKey(key)).toBe(false)
    }
  })

  it('accepts stray per-field bc_* writes so nothing is silently dropped', () => {
    expect(isPayloadKey(SAVE_KEYS.COINS)).toBe(true)
    expect(isPayloadKey('bc_anything_new')).toBe(true)
  })

  it('rejects foreign keys so ad-tech / dev scribbles never reach the cloud', () => {
    for (const key of ['debug', 'cheat', 'prebid11_exp', 'li-module-enabled', 'epic_stage', 'spinner_user_language']) {
      expect(isPayloadKey(key)).toBe(false)
    }
  })
})
