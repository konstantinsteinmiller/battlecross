import { describe, expect, it } from 'vitest'

// The suite must never see the live leaderboard (see `tests/setup.network.ts`).
describe('the test environment', () => {
  it('has no leaderboard endpoint or secret', () => {
    expect(import.meta.env.VITE_LEADERBOARD_URL ?? '').toBe('')
    expect(import.meta.env.VITE_LEADERBOARD_SECRET ?? '').toBe('')
  })

  it('refuses a request to a live host', async () => {
    await expect(fetch('https://battlecross-leaderboard.rodent-race.workers.dev/top'))
      .rejects.toThrow(/blocked a live network request/)
  })
})
