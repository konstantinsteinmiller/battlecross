import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { resolvePlatformPolicy } from './src/platforms/policy'

// Stub for `virtual:leaderboard-snapshot`, which `leaderboardSnapshot.ts`
// imports statically.
//
// It stubs to `null` — a build with a LIVE endpoint — on purpose, so the
// existing leaderboard suite keeps asserting the real "no endpoint, no
// leaderboard" contract. The static-board specs mock `@/use/leaderboardSnapshot`
// itself to supply a board, which is why that module exists as a thin
// re-export rather than the virtual id being imported all over the app.
const stubLeaderboardSnapshotPlugin = () => ({
  name: 'stub-leaderboard-snapshot',
  resolveId(id: string) {
    if (id === 'virtual:leaderboard-snapshot') return '\0virtual:leaderboard-snapshot'
    return null
  },
  load(id: string) {
    if (id === '\0virtual:leaderboard-snapshot') return 'export default null'
    return null
  }
})

export default defineConfig({
  plugins: [vue(), stubLeaderboardSnapshotPlugin()],
  // Vite's production config (`vite.config.ts`) injects `APP_VERSION` at
  // build time via `define`. Vitest doesn't run that plugin, so any
  // module that reads `APP_VERSION` at import time (e.g. `useUser.ts`)
  // throws ReferenceError under tests. Mirror the define here so test
  // imports of those modules don't trip on a missing global.
  define: {
    APP_VERSION: JSON.stringify('test'),
    // The build-time platform policy (see `src/platforms/policy.ts`): tests run
    // as the plain web build, which ships every rule at its default. Suites that
    // need a portal's policy mock `@/platforms/capabilities` instead.
    __PLATFORM_POLICY__: JSON.stringify(resolvePlatformPolicy({ isPoki: false }))
  },
  resolve: {
    alias: {
      // The drop-in asset list is a build-time virtual module; tests run with
      // no drop-ins (the procedural art and synth).
      'virtual:asset-overrides': path.resolve(__dirname, './tests/stubs/assetOverrides.ts'),
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  test: {
    globals: true,
    // Node by default: a jsdom window costs more to set up than most game
    // tests take to run (environment 214 s vs tests 93 s summed over the
    // workers). Files that need the DOM opt in on their first line with
    // `// @vitest-environment jsdom`.
    environment: 'node',
    setupFiles: ['./tests/save/setup.ts', './tests/setup.network.ts'],
    // `.env` holds the LIVE leaderboard Worker and its signing secret. Blank
    // both for the whole suite, or every test that ends a mission posts a real,
    // signed score to the production board (it happened once). The leaderboard
    // suites stub their own endpoint per case (`vi.stubEnv`).
    env: { VITE_LEADERBOARD_URL: '', VITE_LEADERBOARD_SECRET: '' },
    // The suite's slowest tests are the ones that dynamically `import()` the
    // whole game model on their first assertion; with every file transforming
    // in parallel on a cold cache that import alone can exceed the 5 s default
    // and fail a test that is not actually slow. The work is transform time,
    // not test time, so the ceiling is raised rather than the tests split up.
    testTimeout: 30_000,
    // Vitest defaults to one worker per core — ~30 on this laptop, which
    // starves every other app and session on it, and two agents testing at
    // once doubled that. Four keeps a full run to about a minute. Raise it
    // for a one-off run with VITEST_MAX_WORKERS=<n>.
    maxWorkers: Number(process.env.VITEST_MAX_WORKERS) || 4,
    // tests/e2e runs under Playwright + a real Vite dev server (Node env,
    // not jsdom). Excluded from the default suite so `pnpm test` stays
    // fast; run them with `pnpm test:e2e`.
    // `.claude/**` holds git WORKTREES, which are full checkouts of this same
    // repository sitting inside it. Without this, a worktree's `tests/` is
    // discovered as if it were ours: a run on `main` picked up an agent
    // branch's specs, failed on constants that exist only there, and reported
    // a green tree as broken. Test discovery must never wander into a checkout
    // that is not this one.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**', '**/.claude/**']
  }
})