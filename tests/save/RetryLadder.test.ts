// @vitest-environment jsdom
// ─── A failed boot is retried FIVE SECONDS later, not two minutes later ─────
//
// A strategy whose cloud read fails schedules background retries on a ladder
// (5 s → 15 s → 45 s → 2 min → 5 min → every 15 min). `SaveManager.init` also
// retries a few times before it lets the app boot, and the "cloud sync
// paused" banner has a Retry button — and both come through the very same
// `retryHydrate`. They used to climb the ladder too: after a failed boot the
// short rungs were already spent, so the cloud save of a returning player
// showed up minutes into a session that had started them as a first-timer.
// (Found by `scripts/hydrate-check.mjs`, case D.)
//
// Pinned: only the ladder's own timer advances the ladder.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CrazyGamesStrategy } from '@/utils/save/CrazyGamesStrategy'

const STATE_KEY = 'bcross_state'
const MANIFEST = '__save_internal__crazy_keys'
const CLOUD: Record<string, string> = {
  [MANIFEST]: JSON.stringify([STATE_KEY]),
  [STATE_KEY]: JSON.stringify({ bc_level: 9, bc_story: 3, bc_gold: 1234 })
}

const makeLocal = () => {
  const map = new Map<string, string>()
  return {
    map,
    get: (k: string) => map.get(k) ?? null,
    set: (k: string, v: string) => { map.set(k, v) },
    remove: (k: string) => { map.delete(k) },
    keys: () => [...map.keys()]
  }
}

/** Run something that sleeps on timers, under fake timers. */
const settle = async <T>(p: Promise<T>, ms = 2_000): Promise<T> => {
  await vi.advanceTimersByTimeAsync(ms)
  return p
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('the hydrate retry ladder', () => {
  it('boot-time retries do not spend it: the first background retry is 5 s after a failed boot', async () => {
    let down = true
    const data = {
      getItem: vi.fn(async (k: string) => { if (down) throw new Error('cloud unavailable'); return CLOUD[k] ?? null }),
      setItem: vi.fn(),
      removeItem: vi.fn()
    }
    const strat = new CrazyGamesStrategy(() => data)
    const local = makeLocal()

    await settle(strat.hydrate(local))
    expect(strat.hydrateState).toBe('failed-retrying')
    // What SaveManager's boot sanity guard does: three quick retries.
    for (let i = 0; i < 3; i++) await settle(strat.retryHydrate(local))
    expect(strat.hydrateState).toBe('failed-retrying')
    expect(data.setItem).not.toHaveBeenCalled()

    // The cloud comes back. Nothing but the ladder's own timer runs from here.
    down = false
    const readsBefore = data.getItem.mock.calls.length
    // (The last quick retry ended up to ~1.3 s before this point.)
    await vi.advanceTimersByTimeAsync(3_000)
    expect(data.getItem.mock.calls.length).toBe(readsBefore)
    await vi.advanceTimersByTimeAsync(3_000)

    expect(strat.hydrateState).toBe('success-with-data')
    expect(JSON.parse(local.get(STATE_KEY)!).bc_level).toBe(9)
  })

  it('still backs off when its OWN retries keep failing', async () => {
    const data = {
      getItem: vi.fn(async () => { throw new Error('cloud unavailable') }),
      setItem: vi.fn(),
      removeItem: vi.fn()
    }
    const strat = new CrazyGamesStrategy(() => data)
    const local = makeLocal()
    await settle(strat.hydrate(local))

    const readsAt = async (ms: number): Promise<number> => {
      await vi.advanceTimersByTimeAsync(ms)
      return data.getItem.mock.calls.length
    }
    const r0 = data.getItem.mock.calls.length
    // First rung: 5 s.
    const r1 = await readsAt(6_500)
    expect(r1).toBeGreaterThan(r0)
    // Second rung is 15 s: nothing new after another 6 s…
    const r2 = await readsAt(6_000)
    expect(r2).toBe(r1)
    // …and it has fired once 15 s have passed since the first retry.
    const r3 = await readsAt(10_500)
    expect(r3).toBeGreaterThan(r2)
    expect(strat.hydrateState).toBe('failed-retrying')
  })
})
