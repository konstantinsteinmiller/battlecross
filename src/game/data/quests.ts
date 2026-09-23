import type { SectorId } from '../world/themes'
import type { EnemyKind } from '../models/enemies'
import { SECTOR_BY_ID, enemyLevelFor, type Sector } from './regions'
import { mulberry32, randInt, pick, weighted } from '../world/rng'
import type { Rarity } from './items'

/**
 * ─── Missions ────────────────────────────────────────────────────────────────
 *
 * Story missions (one per sector: fight through to the Core Master) and the
 * repeatable Blades-style JOBS the terminal offers three at a time. Every
 * mission carries its own map seed, so taking a job builds a fresh sector map.
 */

export type QuestTemplate = 'tutorial' | 'boss' | 'kill' | 'collect' | 'rescue' | 'elite' | 'supply' | 'purge'

export interface Quest {
  id: string
  kind: 'story' | 'job'
  template: QuestTemplate
  sector: SectorId
  seed: number
  level: number
  /** kill: which machine; elite: its archetype. */
  target: EnemyKind | null
  count: number
  rooms: number
  reward: { xp: number; bolts: number; rarityBias: number; guaranteed?: Rarity }
}

export const JOB_TEMPLATES: Array<[QuestTemplate, number]> = [
  ['kill', 3], ['collect', 2.5], ['purge', 1.5], ['elite', 1.6], ['supply', 1.6], ['rescue', 1.8]
]

const rewardFor = (template: QuestTemplate, level: number, story: boolean): Quest['reward'] => {
  const base = 40 + level * 18
  const mul: Record<QuestTemplate, number> = { tutorial: 1.2, boss: 2.6, kill: 1, collect: 1.05, rescue: 1.15, elite: 1.35, supply: 1.1, purge: 1.3 }
  return {
    xp: Math.round(base * mul[template] * (story ? 1.3 : 1)),
    bolts: Math.round((30 + level * 12) * mul[template]),
    rarityBias: template === 'boss' ? 1.5 : template === 'elite' || template === 'purge' ? 0.8 : 0.3,
    guaranteed: template === 'boss' ? 'prototype' : undefined
  }
}

export const tutorialQuest = (): Quest => ({
  id: 'story_tutorial',
  kind: 'story',
  template: 'tutorial',
  sector: 'scrapyard',
  seed: 20260923,
  level: 1,
  target: null,
  count: 1,
  rooms: 7,
  reward: { xp: 120, bolts: 80, rarityBias: 0.5, guaranteed: 'tuned' }
})

export const storyQuest = (sector: Sector, playerLevel: number, attempt: number): Quest => {
  const level = enemyLevelFor(sector, playerLevel, 1)
  return {
    id: `story_${sector.id}`,
    kind: 'story',
    template: 'boss',
    sector: sector.id,
    seed: (sector.id.length * 7919 + attempt * 104729 + 12345) >>> 0,
    level,
    target: null,
    count: 1,
    rooms: sector.rooms[1],
    reward: rewardFor('boss', level, true)
  }
}

export const rollJob = (seed: number, sectors: SectorId[], playerLevel: number): Quest => {
  const rng = mulberry32(seed)
  const sid = pick(rng, sectors)
  const sector = SECTOR_BY_ID[sid]
  const template = weighted(rng, JOB_TEMPLATES)
  const level = enemyLevelFor(sector, playerLevel, randInt(rng, -1, 1))
  const kinds = sector.encounters.kinds.filter(([k]) => k !== 'turret').map(([k, w]) => [k, w] as const)
  let target: EnemyKind | null = null
  let count = 1
  switch (template) {
    case 'kill':
      target = weighted(rng, kinds)
      count = randInt(rng, 5, 9)
      break
    case 'collect':
      count = randInt(rng, 3, 5)
      break
    case 'supply':
      count = randInt(rng, 3, 4)
      break
    case 'elite':
      target = weighted(rng, kinds.filter(([k]) => k !== 'hardhat'))
      break
    default:
      break
  }
  return {
    id: `job_${seed.toString(36)}`,
    kind: 'job',
    template,
    sector: sid,
    seed: (seed * 2654435761) >>> 0,
    level,
    target,
    count,
    rooms: randInt(rng, sector.rooms[0], sector.rooms[1]),
    reward: rewardFor(template, level, false)
  }
}
