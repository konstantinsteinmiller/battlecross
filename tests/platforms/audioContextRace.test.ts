// @vitest-environment jsdom
// The AudioContext suspend/resume race (src/use/useAssets.ts, syncContextState).
//
// `suspend()` / `resume()` are async: `ctx.state` keeps its old value until the
// promise settles. The gate used to decide from `ctx.state` alone, so a resume
// that arrived while the ad's suspend was still in flight read "running", did
// nothing — and the suspend then landed with the gate open. The game played on
// in silence (hub after an interstitial in the Playgama QA Tool). The mirror
// race skipped a suspend under a pending resume, letting an ad open over audio.
//
// A fake context whose transitions settle a few ms later, like a real one.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

class FakeCtx extends EventTarget {
  state: 'running' | 'suspended' | 'closed' = 'running'
  /** When false, transitions never settle (a wedged implementation). */
  static settles = true
  suspend = vi.fn(() => this.to('suspended'))
  resume = vi.fn(() => this.to('running'))
  private to(next: 'running' | 'suspended'): Promise<void> {
    return new Promise((resolve) => {
      if (!FakeCtx.settles) return
      setTimeout(() => {
        this.state = next
        this.dispatchEvent(new Event('statechange'))
        resolve()
      }, 10)
    })
  }
}

const load = async () => {
  vi.resetModules()
  const mod = await import('@/use/useAssets')
  const ctx = mod.getAudioContext() as unknown as FakeCtx
  return { ...mod, ctx }
}

beforeEach(() => {
  vi.useFakeTimers()
  FakeCtx.settles = true
  ;(window as unknown as Record<string, unknown>).AudioContext = FakeCtx
})
afterEach(() => {
  vi.useRealTimers()
  delete (window as unknown as Record<string, unknown>).AudioContext
})

describe('AudioContext state follows the gate, whatever the timing', () => {
  it('a resume issued while the suspend is still in flight still ends running', async () => {
    const m = await load()
    expect(m.ctx.state).toBe('running')
    m.suspendAllAudio() // ad opens: suspend() in flight, state still 'running'
    m.resumeAllAudio() // ad closes inside the same transition
    await vi.advanceTimersByTimeAsync(50)
    expect(m.ctx.state).toBe('running')
    expect(m.isAudioSuspended()).toBe(false)
  })

  it('a suspend issued while a resume is in flight still ends suspended', async () => {
    const m = await load()
    m.suspendAllAudio()
    await vi.advanceTimersByTimeAsync(50)
    expect(m.ctx.state).toBe('suspended')
    m.resumeAllAudio() // resume() in flight, state still 'suspended'
    m.suspendAllAudio() // the next ad / pause lands before it settles
    await vi.advanceTimersByTimeAsync(50)
    expect(m.ctx.state).toBe('suspended')
  })

  it('never has two transitions in flight at once', async () => {
    const m = await load()
    m.suspendAllAudio()
    m.resumeAllAudio()
    m.suspendAllAudio()
    m.resumeAllAudio()
    expect(m.ctx.suspend.mock.calls.length + m.ctx.resume.mock.calls.length).toBe(1)
    await vi.advanceTimersByTimeAsync(100)
    expect(m.ctx.state).toBe('running')
  })

  it('a transition that never settles does not wedge the gate', async () => {
    const m = await load()
    FakeCtx.settles = false
    m.suspendAllAudio() // this suspend() never settles
    await vi.advanceTimersByTimeAsync(1100)
    // Past the cap the gate asks again rather than waiting on a dead promise…
    expect(m.ctx.suspend.mock.calls.length).toBeGreaterThan(1)
    // …and converges once the context answers again.
    FakeCtx.settles = true
    await vi.advanceTimersByTimeAsync(1100)
    expect(m.ctx.state).toBe('suspended')
  })
})
