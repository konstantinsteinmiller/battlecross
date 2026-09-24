/**
 * ─── The seeded board, for the builds that can never gain a player ──────────
 *
 * Poki forbids every external runtime request, Yandex rejects third-party
 * storage URLs and the Playgama archive doubles as the YouTube Playables
 * submission (no external calls), so those builds ship `VITE_LEADERBOARD_URL`
 * empty. They can neither READ the live board nor WRITE to it: their baked copy
 * is the whole board for the life of the build, and nobody playing it ever
 * appears on it.
 *
 * So it is generated from a stated RETENTION CURVE instead of copied from the
 * live board (which is a survivorship sample of everyone who ever opened the
 * game). It is modelled data, and the file says so (`source`).
 *
 * ── Histogram only, NO rows ──
 *
 * The owner's call (2026-09-24): on these builds the game shows the rank badge
 * ("#1,204 of 2,500 players") and no top-100 list, so the seed publishes no
 * rows at all and therefore no invented player names. `rankFromDist` needs
 * only `dist` and `total` to place a player exactly.
 *
 * ── What the score is ──
 *
 * LIFETIME XP, the same number the live builds post: the point total, not the
 * hero level. The curve below is stated in hero LEVELS because that is how the
 * design intent is phrased ("most stop by level 5"), and each modelled player
 * is then given the lifetime XP a player of that level has: everything it took
 * to reach the level, plus part of the bar. Keep the two straight — a histogram
 * of levels ranked against XP totals would tell every player they are #1.
 *
 * ── Determinism ──
 *
 * Everything comes out of a seeded PRNG, so re-running this reproduces the
 * committed file byte for byte. A board that churned per build would move every
 * player's rank for no reason.
 *
 *     pnpm leaderboard:seed
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** This script's own path, or null where `import.meta.url` is not a file URL
 *  (vitest imports this module to check it against the game). */
const SELF = (() => {
  try { return fileURLToPath(import.meta.url) } catch { return null }
})()

export const SEED_FILE = resolve(SELF ? dirname(SELF) : 'scripts', '../data/leaderboard-seed.json')

/**
 * How many players the board claims. Sized to what these portals plausibly
 * bring a new game (the studio's live boards run from a few hundred to ~5 000),
 * not to what looks impressive: six figures beside an unknown game is the tell
 * that a board was invented.
 */
export const TOTAL = 2_500

// ─── Copies of the game's XP curve (`src/game/data/progression.ts`) ─────────
// This is plain Node and the game is TypeScript behind an alias, so these are
// COPIES. `tests/game/leaderboardSeed.test.ts` re-derives them from the game's
// own module and fails if they drift: regenerate the seed after changing the
// curve.
export const MAX_LEVEL = 40
export const xpToNext = (level) => Math.round(60 * Math.pow(Math.max(1, level), 1.55))
export const xpToReach = (level) => {
  let sum = 0
  for (let l = 1; l < Math.min(level, MAX_LEVEL); l++) sum += xpToNext(l)
  return sum
}

/**
 * The retention curve: `level → fraction of players whose best level is ≥ it`.
 *
 * A survival function, because the design intent is stated that way:
 *
 *    1 → 1.00     everyone starts at level 1
 *    2 → 0.82     ~a fifth never finish the first mission
 *    5 → 0.42     most stop somewhere in levels 2–4
 *   12 → 0.12     one in eight plays into the second sector's levels
 *   25 → 0.022    ~2 % are still playing at level 25
 *   40 → 0.0024   a handful (~6 of 2 500) reach the cap
 *   41 → 0        the cap: nobody is modelled past it
 *
 * Interpolated log-linearly between anchors, so each band decays smoothly
 * instead of stepping at the anchors.
 */
export const SURVIVAL = [
  [1, 1],
  [2, 0.82],
  [3, 0.64],
  [5, 0.42],
  [8, 0.24],
  [12, 0.12],
  [18, 0.055],
  [25, 0.022],
  [32, 0.008],
  [40, 0.0024],
  [41, 0]
]

/** Fraction of players still going at `level`. */
export const survival = (level) => {
  if (level <= 1) return 1
  for (let i = 0; i < SURVIVAL.length - 1; i++) {
    const [x0, y0] = SURVIVAL[i]
    const [x1, y1] = SURVIVAL[i + 1]
    if (level < x0 || level > x1) continue
    const t = (level - x0) / (x1 - x0)
    if (y1 <= 0 || y0 <= 0) return y0 + (y1 - y0) * t
    return y0 * Math.pow(y1 / y0, t)
  }
  return 0
}

/**
 * XP a player earns AFTER reaching the cap (the bar stops, lifetime XP does
 * not): exponential, with this mean. A soft knee keeps the tail from piling
 * onto one ceiling value (a hard `Math.min` would tie every extreme draw).
 */
const POST_CAP_MEAN = 60_000
const POST_CAP_KNEE = 150_000
const POST_CAP_ROOM = 250_000
const softKnee = (x) => (x <= POST_CAP_KNEE ? x : POST_CAP_KNEE + POST_CAP_ROOM * (1 - Math.exp(-(x - POST_CAP_KNEE) / POST_CAP_ROOM)))

/**
 * Round to two significant figures. The histogram ships inside the bundle, and
 * 2 500 distinct XP values would be ~30 kB of buckets; two figures keep it to a
 * few hundred without changing anyone's placing by more than the model's own
 * noise.
 */
const twoFigures = (x) => {
  if (x < 100) return Math.round(x)
  const p = Math.pow(10, Math.floor(Math.log10(x)) - 1)
  return Math.round(x / p) * p
}

/** Any fixed integer. */
const SEED = 20260924
/** The curve's stated date. A CONSTANT, so the file stays byte-reproducible. */
const SEED_EPOCH = Date.UTC(2026, 8, 24)

/** Deterministic PRNG — mulberry32. */
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// ─── Build ──────────────────────────────────────────────────────────────────

export const buildSeed = () => {
  const r = rng(SEED)

  // Players per level, from the survival curve.
  const perLevel = []
  for (let level = 1; level <= MAX_LEVEL; level++) {
    perLevel.push([level, Math.round(TOTAL * (survival(level) - survival(level + 1)))])
  }
  // Rounding leaves the sum a little off; correct it on the biggest level.
  const sum = perLevel.reduce((a, [, n]) => a + n, 0)
  let biggest = 0
  for (let i = 1; i < perLevel.length; i++) if (perLevel[i][1] > perLevel[biggest][1]) biggest = i
  perLevel[biggest][1] += TOTAL - sum

  // Each player's lifetime XP: what the level took, plus part of the bar; at
  // the cap, plus whatever they kept earning.
  const buckets = new Map()
  for (const [level, n] of perLevel) {
    for (let i = 0; i < n; i++) {
      let xp = xpToReach(level) + r() * xpToNext(level)
      if (level >= MAX_LEVEL) xp += softKnee(-Math.log(1 - r()) * POST_CAP_MEAN)
      const score = twoFigures(xp)
      buckets.set(score, (buckets.get(score) ?? 0) + 1)
    }
  }
  const dist = [...buckets.entries()].sort((a, b) => b[0] - a[0])

  return {
    source: 'seeded:retention-curve',
    // FIXED, not `Date.now()`: a regeneration that changed nothing must not
    // land as a diff. Nothing reads either field on the seeded path.
    fetchedAt: SEED_EPOCH,
    updatedAt: SEED_EPOCH,
    total: dist.reduce((a, [, n]) => a + n, 0),
    // No rows: these builds show the rank badge only (see the header).
    entries: [],
    dist
  }
}

// ─── CLI ────────────────────────────────────────────────────────────────────

if (SELF && process.argv[1] && resolve(process.argv[1]) === resolve(SELF)) {
  const seed = buildSeed()
  mkdirSync(dirname(SEED_FILE), { recursive: true })
  const json = JSON.stringify(seed) + '\n'
  writeFileSync(SEED_FILE, json, 'utf-8')

  const atLeast = (xp) => seed.dist.filter(([s]) => s >= xp).reduce((a, [, n]) => a + n, 0)
  const pct = (n) => `${((100 * n) / seed.total).toFixed(1)}%`
  console.log(`[seed] ${seed.total} players, ${seed.dist.length} buckets, ${(json.length / 1024).toFixed(1)} kB, top ${seed.dist[0][0]} XP`)
  for (const level of [2, 5, 12, 25, 40]) {
    const n = atLeast(xpToReach(level))
    console.log(`[seed]   reached level ${String(level).padStart(2)}  ${String(n).padStart(5)}  ${pct(n)}`)
  }
  console.log(`[seed] wrote ${SEED_FILE}`)
}
