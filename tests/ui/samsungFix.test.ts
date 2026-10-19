// @vitest-environment jsdom
// The gate for the Samsung dark-mode colour fix: Samsung UA AND the player's answer, stored as a field in the
// existing state blob (never a key of its own), with ?samsungfix=1|0 as the desktop test override.

import { afterEach, describe, expect, it, vi } from 'vitest'

const SAMSUNG = 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36'
const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/143.0.0.0 Safari/537.36'

const load = async (ua: string, search = '') => {
  vi.resetModules()
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true })
  window.history.replaceState({}, '', `/${search}`)
  const fix = await import('@/use/useSamsungFix')
  const state = await import('@/use/useGameState')
  const keys = await import('@/keys')
  return { fix, state, keys }
}

afterEach(() => {
  window.history.replaceState({}, '', '/')
  localStorage.clear()
})

describe('useSamsungFix gate', () => {
  it('is inert outside Samsung Internet, whatever the blob says', async () => {
    const { fix, state, keys } = await load(CHROME)
    state.setState(keys.SAMSUNG_FIX_KEY, 'on')
    fix.samsungFixChoice.value = 'on'
    expect(fix.isSamsungBrowser).toBe(false)
    expect(fix.samsungFixOffered).toBe(false)
    expect(fix.samsungCheckDue.value).toBe(false)
    expect(fix.samsungFixOn.value).toBe(false)
  })

  it('asks once on Samsung, then follows the answer', async () => {
    const { fix, state, keys } = await load(SAMSUNG)
    expect(fix.samsungFixOffered).toBe(true)
    expect(fix.samsungCheckDue.value).toBe(true)
    expect(fix.samsungFixOn.value).toBe(false)

    fix.setSamsungFixChoice('unneeded')
    expect(fix.samsungCheckDue.value).toBe(false)
    expect(fix.samsungFixOn.value).toBe(false)
    expect(state.getState(keys.SAMSUNG_FIX_KEY)).toBe('unneeded')

    fix.setSamsungFixChoice('on')
    expect(fix.samsungFixOn.value).toBe(true)
    expect(state.getState(keys.SAMSUNG_FIX_KEY)).toBe('on')

    fix.setSamsungFixChoice('off')
    expect(fix.samsungFixOn.value).toBe(false)
    expect(fix.samsungCheckDue.value).toBe(false)
  })

  it('"run the check again" clears the answer and the fix with it', async () => {
    const { fix, state, keys } = await load(SAMSUNG)
    fix.setSamsungFixChoice('on')
    fix.resetSamsungFixCheck()
    expect(fix.samsungCheckDue.value).toBe(true)
    expect(fix.samsungFixOn.value).toBe(false)
    expect(state.hasState(keys.SAMSUNG_FIX_KEY)).toBe(false)
  })

  it('keeps the answer in the one state blob: no extra localStorage key', async () => {
    const { fix } = await load(SAMSUNG)
    fix.setSamsungFixChoice('on')
    expect(Object.keys(localStorage).filter(k => /samsung/i.test(k))).toEqual([])
  })

  it('restores a stored answer on the next load', async () => {
    const first = await load(SAMSUNG)
    first.fix.setSamsungFixChoice('on')
    first.state.flushPersist()
    const second = await load(SAMSUNG)
    expect(second.fix.samsungFixOn.value).toBe(true)
    expect(second.fix.samsungCheckDue.value).toBe(false)
  })

  it('?samsungfix=1 forces the fix on any browser and skips the question; ?samsungfix=0 forces it off', async () => {
    const forced = await load(CHROME, '?samsungfix=1')
    expect(forced.fix.samsungFixOffered).toBe(true)
    expect(forced.fix.samsungFixOn.value).toBe(true)
    expect(forced.fix.samsungCheckDue.value).toBe(false)

    const off = await load(SAMSUNG, '?samsungfix=0')
    expect(off.fix.samsungFixOn.value).toBe(false)
    expect(off.fix.samsungCheckDue.value).toBe(false)
    off.fix.setSamsungFixChoice('on')
    expect(off.fix.samsungFixOn.value).toBe(false)
  })
})

describe('counter is inert off Samsung', () => {
  it('injects no fix style or attributes on a normal browser, and the stylesheet is scoped to data-bc-* attributes', async () => {
    const { fix } = await load(CHROME)
    fix.installSamsungFix()
    await Promise.resolve()
    expect(fix.samsungFixOn.value).toBe(false)
    expect(document.querySelector('[data-bc-fix],[data-bc-fix-rules],[data-bc-n],[data-bc-bgi]')).toBeNull()
  })
})
