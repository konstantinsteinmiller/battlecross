// Pins the literal string values of SAVE_KEYS. These keys are a contract with
// every player's save blob — renaming one strands existing players' progress on
// the old field, and the cloud strategies key their manifests off these exact
// strings. `src/keys.ts` is the single source of truth; this test is the tripwire
// that catches an accidental rename during a refactor.

import { describe, expect, it } from 'vitest'
import { SAVE_KEYS, isPayloadKey, META_KEY } from '@/utils/save/SaveMergePolicy'
import { STATE_KEY } from '@/use/useGameState'

describe('SAVE_KEYS values are stable', () => {
  it('LEVEL key is the literal "ma_level"', () => {
    expect(SAVE_KEYS.LEVEL).toBe('ma_level')
  })
  it('STORY key is the literal "ma_story"', () => {
    expect(SAVE_KEYS.STORY).toBe('ma_story')
  })
  it('QUESTS_DONE key is the literal "ma_quests_done"', () => {
    expect(SAVE_KEYS.QUESTS_DONE).toBe('ma_quests_done')
  })
  it('the currency key is the literal "ma_bolts"', () => {
    expect(SAVE_KEYS.COINS).toBe('ma_bolts')
  })
})

describe('the persisted surface is exactly one state blob plus the meta blob', () => {
  it('accepts the state blob and the meta blob', () => {
    expect(STATE_KEY).toBe('mega_adventure_state')
    expect(isPayloadKey(STATE_KEY)).toBe(true)
    expect(isPayloadKey(META_KEY)).toBe(true)
  })

  it('accepts stray per-field ma_* writes so nothing is silently dropped', () => {
    expect(isPayloadKey(SAVE_KEYS.COINS)).toBe(true)
    expect(isPayloadKey('ma_anything_new')).toBe(true)
  })

  it('rejects foreign keys so ad-tech / dev scribbles never reach the cloud', () => {
    for (const key of ['debug', 'cheat', 'prebid11_exp', 'li-module-enabled', 'epic_stage', 'spinner_user_language']) {
      expect(isPayloadKey(key)).toBe(false)
    }
  })
})
