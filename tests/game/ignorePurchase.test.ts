// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

vi.stubEnv('VITE_APP_IAP_UNLOCK', 'true')
vi.stubEnv('VITE_APP_NATIVE', 'true')
vi.mock('@/use/deviceProfile', () => ({ isAppleTouch: () => true }))

/** The TestFlight test switch: a bought unlock can be ignored, and comes back when asked. */
describe('ignore my purchase (TestFlight testing)', () => {
  it('shows the demo while on, and the unlock again when off', async () => {
    const m = await import('@/use/useFullVersion')
    const { setState } = await import('@/use/useGameState')
    const { FULL_VERSION_KEY } = await import('@/keys')
    setState(FULL_VERSION_KEY, true)
    m.refreshGate()
    expect(m.gateOn.value).toBe(true)
    expect(m.isFullVersion.value).toBe(true)
    expect(m.adsRemoved.value).toBe(true)
    m.setIgnorePurchase(true)
    expect(m.isFullVersion.value).toBe(false)
    expect(m.adsRemoved.value).toBe(false)
    expect(m.isNodeLockedByDemo('arena')).toBe(true)
    m.refreshGate()
    expect(m.isFullVersion.value, 'stays off after a restart').toBe(false)
    m.setIgnorePurchase(false)
    m.refreshGate()
    expect(m.isFullVersion.value).toBe(true)
  })
})
