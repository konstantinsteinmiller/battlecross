/**
 * No test may reach a live service.
 *
 * `.env` carries the production leaderboard Worker and its signing secret, so
 * any test that runs the end-of-mission path (`finishMission` → `reportRun`)
 * would post a real, SIGNED score to the live board. One full-suite run did
 * exactly that before this guard existed: a fake level-2 player appeared on the
 * production leaderboard. `vitest.config.ts` blanks the endpoint for the whole
 * suite; this is the second layer, so that a leak fails loudly instead of
 * posting.
 *
 * Suites that exercise networking stub `fetch` themselves
 * (`vi.stubGlobal('fetch', …)`), which replaces this wrapper for that test.
 */
const realFetch = globalThis.fetch

const urlOf = (input: RequestInfo | URL): string =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

if (typeof realFetch === 'function') {
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = urlOf(input)
    if (/^https?:\/\//i.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(url)) {
      return Promise.reject(new Error(`[tests] blocked a live network request: ${url}`))
    }
    return realFetch(input, init)
  }) as typeof fetch
}
