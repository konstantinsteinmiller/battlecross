import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { MAX_LEVEL as GAME_MAX_LEVEL, xpToNext as gameXpToNext, xpToReach as gameXpToReach } from '@/game/data/progression'
import { rankFromDist } from '@/use/leaderboardSnapshot'
// Plain Node, imported as-is: tests are not part of a tsconfig project.
import {
  buildSeed, MAX_LEVEL, SURVIVAL, TOTAL, survival, xpToNext, xpToReach
} from '../../scripts/leaderboard-seed.mjs'

/**
 * ─── The modelled board for the builds that cannot post (Poki, Yandex,
 *     Playgama) ──────────────────────────────────────────────────────────────
 *
 * It is the WHOLE board on those builds, for the life of the build, so its
 * shape is a design decision and the numbers are pinned here. Regenerate with
 * `pnpm leaderboard:seed` after changing the curve or the game's XP table, and
 * expect this file to say so.
 */

interface Seed {
  source: string
  total: number
  entries: unknown[]
  dist: [number, number][]
}

const seed = JSON.parse(
  readFileSync(resolve(__dirname, '../../data/leaderboard-seed.json'), 'utf-8')
) as Seed

const atLeast = (xp: number): number =>
  seed.dist.filter(([s]) => s >= xp).reduce((a, [, n]) => a + n, 0)

describe('the seeded board', () => {
  it('is exactly what the generator produces (byte-reproducible)', () => {
    expect(JSON.parse(JSON.stringify(buildSeed()))).toEqual(seed)
  })

  it('copies the game\'s XP curve faithfully (drift guard)', () => {
    // The generator is plain Node and cannot import the game, so its curve is
    // a COPY. Retuning `progression.ts` without regenerating fails here.
    expect(MAX_LEVEL).toBe(GAME_MAX_LEVEL)
    for (let level = 1; level <= GAME_MAX_LEVEL + 2; level++) {
      expect(xpToNext(level), `xpToNext(${level})`).toBe(gameXpToNext(level))
      expect(xpToReach(level), `xpToReach(${level})`).toBe(gameXpToReach(level))
    }
  })

  it('says it is modelled, and publishes no rows (no invented players)', () => {
    expect(seed.source).toBe('seeded:retention-curve')
    expect(seed.entries).toEqual([])
  })

  it('is a well-formed histogram of exactly TOTAL players', () => {
    expect(seed.total).toBe(TOTAL)
    expect(seed.dist.reduce((a, [, n]) => a + n, 0)).toBe(TOTAL)
    for (let i = 0; i < seed.dist.length; i++) {
      const [score, n] = seed.dist[i]
      expect(Number.isInteger(score) && score >= 0).toBe(true)
      expect(n).toBeGreaterThan(0)
      if (i > 0) expect(score).toBeLessThan(seed.dist[i - 1][0])
    }
  })

  it('holds the stated retention curve, level by level', () => {
    // Each anchor as a share of players whose lifetime XP says they reached
    // that level. Within 1.5 points: the draw is random within a level's bar.
    for (const [level, share] of SURVIVAL as [number, number][]) {
      if (level < 2 || level > MAX_LEVEL) continue
      expect(atLeast(xpToReach(level)) / seed.total, `reached level ${level}`)
        .toBeCloseTo(share, 1)
    }
    expect(survival(MAX_LEVEL + 1)).toBe(0)
  })

  it('is measured in LIFETIME XP, the quantity the game posts — not levels', () => {
    // The trap this guards: a board built from levels (1–40) and ranked against
    // XP totals tells every player they are #1. The top of the board must sit
    // at XP a level-40 player has, and below the Worker's plausibility cap.
    const top = seed.dist[0][0]
    expect(top).toBeGreaterThanOrEqual(gameXpToReach(GAME_MAX_LEVEL))
    expect(top).toBeLessThan(100_000_000)
    // …and places real players where the curve says they belong.
    const rank = (xp: number) => rankFromDist(seed.dist, xp)
    expect(rank(0)).toBeGreaterThan(seed.total * 0.8)
    expect(rank(gameXpToReach(12))).toBeLessThan(seed.total * 0.15)
    expect(rank(gameXpToReach(GAME_MAX_LEVEL) + 500_000)).toBe(1)
  })
})
