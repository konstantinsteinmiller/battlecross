// ─── The cheat flag does nothing on a build without dev tooling ─────────────
//
// Poki's release must be a clean build ("no debug code, no dev artifacts").
// With the cheat modules aliased out (see platformPolicy.test.ts), one path to
// debug tooling was left: `localStorage.cheat = 'true'` switched on `isDebug`
// — the FPS meter and the debug logs — straight from useMatch. Pinned: the
// flag is ignored when `platformPolicy.devTools` is false, and works as before
// everywhere else.

import { afterEach, describe, expect, it, vi } from 'vitest'

describe('the cheat flag on a build without dev tooling', () => {
  afterEach(() => {
    localStorage.removeItem('cheat')
    vi.doUnmock('@/platforms/capabilities')
  })
  const isDebugWith = async (devTools: boolean): Promise<boolean> => {
    vi.resetModules()
    vi.doMock('@/platforms/capabilities', () => ({ platformPolicy: { devTools, freeOptionFirst: !devTools } }))
    localStorage.setItem('cheat', 'true')
    const { isDebug } = await import('@/use/useMatch')
    return isDebug.value
  }

  it('does NOT switch on debug mode (FPS meter, debug logs) on the Poki release', async () => {
    expect(await isDebugWith(false)).toBe(false)
  })

  it('still does everywhere else (QA opt-in unchanged)', async () => {
    expect(await isDebugWith(true)).toBe(true)
  })
})
