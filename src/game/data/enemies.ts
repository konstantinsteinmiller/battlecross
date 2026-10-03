import type { DamageType, Rank, StatusId } from '../sim/types'

/**
 * ─── The bestiary (GDD §6.2) ─────────────────────────────────────────────────
 *
 * Every monster type the tier table names, as data: how tough it is relative
 * to a "normal enemy of its level" (`sim/stats.ts` holds the level curves),
 * how it moves and strikes, and its abilities. An ability is one of a small
 * set of behaviours (`sim/abilities.ts`) with numbers; every one that is more
 * than a plain swing shows a ground telegraph for its wind-up, so damage is
 * always something the player could have walked out of.
 */

export type AbilityKind =
  /** A circle around the caster. */
  | 'slam'
  /** A circle on the target's position at cast time. */
  | 'smash'
  /** A cone toward the target. */
  | 'cone'
  /** A straight dash through a line. */
  | 'charge'
  /** A beam down a line. */
  | 'line'
  /** A fast straight projectile. */
  | 'shot'
  /** Several projectiles in a fan. */
  | 'volley'
  /** An arcing projectile that lands in a circle. */
  | 'lob'
  /** Several circles scattered around the target. */
  | 'barrage'
  /** A jump onto the target's position. */
  | 'leap'
  /** A step through shadow to behind the target, then a strike. */
  | 'blink'
  | 'summon'
  | 'heal'
  | 'enrage'

export interface AbilityDef {
  kind: AbilityKind
  /** Cooldown and the cooldown it starts the fight on. */
  cd: number
  first?: number
  /** Used when the target is within this many metres (and beyond `min`). */
  range: number
  min?: number
  windup: number
  recover: number
  /** Damage as a multiple of the unit's base hit. */
  dmg?: number
  type?: DamageType
  /** Circle radius / cone and line length. */
  r?: number
  /** Cone half-angle in degrees, or line half-width in metres. */
  w?: number
  count?: number
  /** Kind to summon. */
  spawn?: string
  status?: { id: StatusId; dur: number; v: number; type?: DamageType }
  /** Only while health is at or below this fraction. */
  below?: number
  /** Only from this boss phase on (0 = always). */
  phase?: number
  /** Attack pose index for the rig. */
  pose?: number
  /** Projectile / effect look. */
  fx?: string
  color?: string
}

export interface EnemyDef {
  id: string
  rank: Rank
  /** Rig family and look (see `gfx/rigs`). */
  rig: string
  look?: string
  scale: number
  /** Collision radius and height in metres (after scale). */
  r: number
  h: number
  /** Multiples of the level's baseline health and hit. */
  hp: number
  dmg: number
  /** Armour per level, and elemental resistance. */
  armor: number
  resist?: number
  speed: number
  /** The basic attack. */
  style: 'melee' | 'ranged' | 'magic'
  type: DamageType
  range: number
  interval: number
  windup: number
  heavy?: boolean
  /** Basic projectile look. */
  shotFx?: string
  /** How far it notices the hero from. */
  aggro: number
  /** Ranged units try to keep this distance. */
  keep?: number
  /** XP and gold multiple of a normal kill. */
  reward: number
  abilities: AbilityDef[]
  /** Signature colour (death burst, health-bar accent). */
  color: string
  /** Bursts on death, hurting anything near. */
  deathBlast?: { r: number; dmg: number; type: DamageType }
  /** Bosses turn to phase 2 at this health fraction. */
  phase2?: number
  /** A branch boss (roadmap #70): guards the end of a side way. It shows a
   *  boss plate and wakes the boss music, but drops what a zone's mobs drop,
   *  never the finale's promised piece; its prize is the chest it guards. */
  branch?: boolean
}

const D = (e: EnemyDef): EnemyDef => e

/** Rank multipliers for XP and gold (the def's own `reward` multiplies these). */
export const RANK_REWARD: Record<Rank, number> = {
  hero: 0, minion: 0, turret: 0, npc: 0, weak: 0.5, normal: 1, elite: 3.5, boss: 14
}

export const ENEMIES: readonly EnemyDef[] = [
  // ── Tier 1: Sunford Plains, Goblin Hollows ───────────────────────────────
  D({
    id: 'goblin', rank: 'normal', rig: 'humanoid', look: 'goblin', scale: 0.82, r: 0.42, h: 1.15,
    hp: 0.8, dmg: 0.9, armor: 0.6, speed: 3.6, style: 'melee', type: 'physical', range: 1.7, interval: 1.25, windup: 0.32,
    aggro: 8.5, reward: 0.85, color: '#7bc74d', abilities: []
  }),
  D({
    id: 'goblinSlinger', rank: 'normal', rig: 'humanoid', look: 'goblinSlinger', scale: 0.8, r: 0.4, h: 1.1,
    hp: 0.6, dmg: 0.85, armor: 0.3, speed: 3.2, style: 'ranged', type: 'pierce', range: 8, interval: 1.9, windup: 0.45,
    shotFx: 'rock', aggro: 10, keep: 6, reward: 0.9, color: '#9bd45a', abilities: []
  }),
  D({
    id: 'bandit', rank: 'normal', rig: 'humanoid', look: 'bandit', scale: 1, r: 0.46, h: 1.4,
    hp: 1.05, dmg: 1, armor: 1.2, speed: 3.4, style: 'melee', type: 'physical', range: 1.9, interval: 1.3, windup: 0.36,
    aggro: 9, reward: 1, color: '#c96a4a',
    abilities: [{ kind: 'cone', cd: 7, first: 3, range: 2.6, windup: 0.6, recover: 0.45, dmg: 1.5, r: 3, w: 50, pose: 1 }]
  }),
  D({
    id: 'banditArcher', rank: 'normal', rig: 'humanoid', look: 'banditArcher', scale: 1, r: 0.44, h: 1.4,
    hp: 0.75, dmg: 1.05, armor: 0.6, speed: 3.1, style: 'ranged', type: 'pierce', range: 9.5, interval: 2, windup: 0.5,
    shotFx: 'arrow', aggro: 11, keep: 7, reward: 1, color: '#d98a5a',
    abilities: [{ kind: 'volley', cd: 9, first: 5, range: 10, min: 3, windup: 0.8, recover: 0.5, dmg: 0.7, count: 3, w: 16, fx: 'arrow', pose: 1 }]
  }),
  D({
    id: 'wolf', rank: 'normal', rig: 'beast', look: 'wolf', scale: 1, r: 0.48, h: 0.95,
    hp: 0.7, dmg: 0.95, armor: 0.3, speed: 5.1, style: 'melee', type: 'physical', range: 1.7, interval: 1.05, windup: 0.26,
    aggro: 10, reward: 0.9, color: '#9aa4b8',
    abilities: [{ kind: 'leap', cd: 6, first: 1.5, range: 7, min: 3, windup: 0.5, recover: 0.4, dmg: 1.3, r: 1.5 }]
  }),
  D({
    id: 'banditChief', rank: 'elite', rig: 'humanoid', look: 'banditChief', scale: 1.22, r: 0.58, h: 1.7,
    hp: 2.6, dmg: 1.25, armor: 2, speed: 3.3, style: 'melee', type: 'physical', range: 2.2, interval: 1.4, windup: 0.42, heavy: true,
    aggro: 10, reward: 1, color: '#e0563a',
    abilities: [
      { kind: 'cone', cd: 6, first: 2.5, range: 3, windup: 0.7, recover: 0.5, dmg: 1.7, r: 3.4, w: 55, pose: 1 },
      { kind: 'charge', cd: 11, first: 6, range: 9, min: 3.5, windup: 0.8, recover: 0.7, dmg: 1.9, r: 8, w: 0.9, status: { id: 'knockdown', dur: 0.8, v: 1 } }
    ]
  }),
  D({
    id: 'goblinKing', rank: 'boss', rig: 'humanoid', look: 'goblinKing', scale: 1.7, r: 0.9, h: 2.3,
    hp: 8.5, dmg: 1.1, armor: 2.2, speed: 2.9, style: 'melee', type: 'physical', range: 2.8, interval: 1.6, windup: 0.5, heavy: true,
    aggro: 14, reward: 1, color: '#58c23f', phase2: 0.5,
    abilities: [
      { kind: 'slam', cd: 8, first: 3, range: 3.6, windup: 0.9, recover: 0.6, dmg: 1.9, r: 4, pose: 1, status: { id: 'knockdown', dur: 0.7, v: 1 } },
      { kind: 'barrage', cd: 12, first: 7, range: 12, windup: 0.8, recover: 0.6, dmg: 1.3, r: 2, count: 4, fx: 'bomb', type: 'fire' },
      { kind: 'summon', cd: 18, first: 10, range: 20, windup: 0.9, recover: 0.5, spawn: 'goblin', count: 3 },
      { kind: 'enrage', cd: 30, first: 0, range: 20, windup: 0.8, recover: 0.3, phase: 2 }
    ]
  }),

  // ── Tier 2: Whispering Woods, Oakhaven Outskirts ─────────────────────────
  D({
    id: 'treant', rank: 'normal', rig: 'treant', look: 'treant', scale: 1.15, r: 0.66, h: 1.9,
    hp: 1.7, dmg: 1.2, armor: 2.6, speed: 2.3, style: 'melee', type: 'physical', range: 2.3, interval: 1.8, windup: 0.55, heavy: true,
    aggro: 8, reward: 1.25, color: '#5f9b4a',
    abilities: [{ kind: 'smash', cd: 9, first: 4, range: 8, min: 2.5, windup: 1, recover: 0.5, dmg: 1.2, r: 2.4, type: 'poison', status: { id: 'slow', dur: 2.5, v: 0.5 }, fx: 'roots' }]
  }),
  D({
    id: 'spider', rank: 'normal', rig: 'spider', look: 'spider', scale: 0.95, r: 0.52, h: 0.8,
    hp: 0.75, dmg: 0.9, armor: 0.5, speed: 4.6, style: 'melee', type: 'physical', range: 1.7, interval: 1.1, windup: 0.28,
    aggro: 9.5, reward: 0.95, color: '#8a5fd0',
    abilities: [
      { kind: 'shot', cd: 8, first: 2, range: 8, min: 2.5, windup: 0.5, recover: 0.4, dmg: 0.5, type: 'poison', fx: 'web', status: { id: 'slow', dur: 3, v: 0.55 } }
    ]
  }),
  D({
    id: 'broodSpider', rank: 'elite', rig: 'spider', look: 'brood', scale: 1.55, r: 0.85, h: 1.2,
    hp: 2.8, dmg: 1.2, armor: 1.4, speed: 3.8, style: 'melee', type: 'physical', range: 2.2, interval: 1.3, windup: 0.36,
    aggro: 11, reward: 1, color: '#a65fe6',
    abilities: [
      { kind: 'lob', cd: 7, first: 3, range: 10, min: 2, windup: 0.7, recover: 0.4, dmg: 1.1, r: 2.4, type: 'poison', fx: 'venom', status: { id: 'poison', dur: 4, v: 0.25, type: 'poison' } },
      { kind: 'summon', cd: 16, first: 8, range: 20, windup: 0.8, recover: 0.5, spawn: 'spider', count: 2 }
    ]
  }),
  D({
    id: 'outlawCaptain', rank: 'elite', rig: 'humanoid', look: 'captain', scale: 1.18, r: 0.56, h: 1.65,
    hp: 2.5, dmg: 1.2, armor: 2.4, speed: 3.5, style: 'melee', type: 'physical', range: 2.1, interval: 1.25, windup: 0.38,
    aggro: 10, reward: 1, color: '#c9483a',
    abilities: [
      { kind: 'charge', cd: 9, first: 3, range: 9, min: 3.5, windup: 0.7, recover: 0.6, dmg: 1.7, r: 8, w: 0.9 },
      { kind: 'enrage', cd: 20, first: 8, range: 12, windup: 0.6, recover: 0.3 }
    ]
  }),
  D({
    id: 'elderTreant', rank: 'elite', rig: 'treant', look: 'elder', scale: 1.7, r: 0.95, h: 2.7,
    hp: 3.4, dmg: 1.35, armor: 3.4, speed: 2.1, style: 'melee', type: 'physical', range: 2.9, interval: 1.9, windup: 0.6, heavy: true,
    aggro: 10, reward: 1.2, color: '#4f8f3a',
    abilities: [
      { kind: 'slam', cd: 8, first: 3, range: 3.6, windup: 1, recover: 0.6, dmg: 1.8, r: 4.2, status: { id: 'knockdown', dur: 0.8, v: 1 } },
      { kind: 'barrage', cd: 11, first: 6, range: 12, windup: 0.9, recover: 0.5, dmg: 1.1, r: 2.1, count: 4, type: 'poison', fx: 'roots', status: { id: 'slow', dur: 2.5, v: 0.5 } }
    ]
  }),
  D({
    id: 'warlord', rank: 'boss', rig: 'humanoid', look: 'warlord', scale: 1.5, r: 0.78, h: 2.05,
    hp: 11, dmg: 1.25, armor: 3, speed: 3.4, style: 'melee', type: 'physical', range: 2.6, interval: 1.35, windup: 0.42, heavy: true,
    aggro: 14, reward: 1, color: '#d4402c', phase2: 0.45,
    abilities: [
      { kind: 'cone', cd: 6, first: 2, range: 3.2, windup: 0.7, recover: 0.5, dmg: 1.7, r: 3.8, w: 60, pose: 1 },
      { kind: 'charge', cd: 10, first: 5, range: 11, min: 3.5, windup: 0.75, recover: 0.6, dmg: 2, r: 10, w: 1.1, status: { id: 'knockdown', dur: 0.8, v: 1 } },
      { kind: 'summon', cd: 20, first: 12, range: 20, windup: 0.8, recover: 0.5, spawn: 'banditArcher', count: 2 },
      { kind: 'barrage', cd: 9, first: 4, range: 14, windup: 0.8, recover: 0.5, dmg: 1.4, r: 2.2, count: 5, fx: 'bomb', type: 'fire', phase: 2 },
      { kind: 'enrage', cd: 40, first: 0, range: 20, windup: 0.7, recover: 0.3, phase: 2 }
    ]
  }),

  // ── Tier 3: Ashen Crags, Ironhold Mines ──────────────────────────────────
  D({
    id: 'fireElemental', rank: 'normal', rig: 'elemental', look: 'fire', scale: 1, r: 0.5, h: 1.5,
    hp: 0.85, dmg: 1.1, armor: 0.4, resist: 0.4, speed: 3.3, style: 'magic', type: 'fire', range: 8.5, interval: 1.8, windup: 0.45,
    shotFx: 'ember', aggro: 10, keep: 5.5, reward: 1.1, color: '#ff7a2a',
    deathBlast: { r: 2.4, dmg: 0.9, type: 'fire' },
    abilities: [{ kind: 'lob', cd: 8, first: 3, range: 10, min: 2, windup: 0.7, recover: 0.4, dmg: 1.2, r: 2.3, type: 'fire', fx: 'ember', status: { id: 'burn', dur: 3, v: 0.2, type: 'fire' } }]
  }),
  D({
    id: 'ironGolem', rank: 'normal', rig: 'golem', look: 'iron', scale: 1.25, r: 0.72, h: 2,
    hp: 2.2, dmg: 1.3, armor: 5, speed: 2.4, style: 'melee', type: 'physical', range: 2.4, interval: 1.9, windup: 0.6, heavy: true,
    aggro: 8.5, reward: 1.5, color: '#9aa7bd',
    abilities: [{ kind: 'slam', cd: 8, first: 3.5, range: 3, windup: 0.95, recover: 0.6, dmg: 1.7, r: 3.4, status: { id: 'stun', dur: 0.8, v: 1 } }]
  }),
  D({
    id: 'cultist', rank: 'normal', rig: 'humanoid', look: 'cultist', scale: 1, r: 0.44, h: 1.45,
    hp: 0.8, dmg: 1.1, armor: 0.5, resist: 0.2, speed: 3, style: 'magic', type: 'shadow', range: 9, interval: 2, windup: 0.5,
    shotFx: 'shadow', aggro: 10.5, keep: 6.5, reward: 1.1, color: '#b04adf',
    abilities: [{ kind: 'heal', cd: 9, first: 4, range: 9, windup: 0.9, recover: 0.4, dmg: 2.2 }]
  }),
  D({
    id: 'emberLord', rank: 'elite', rig: 'elemental', look: 'emberLord', scale: 1.7, r: 0.9, h: 2.5,
    hp: 3.2, dmg: 1.3, armor: 1.5, resist: 0.5, speed: 3, style: 'magic', type: 'fire', range: 9, interval: 1.7, windup: 0.5,
    shotFx: 'ember', aggro: 12, keep: 5, reward: 1.2, color: '#ff5a1a',
    deathBlast: { r: 3.5, dmg: 1.4, type: 'fire' },
    abilities: [
      { kind: 'cone', cd: 7, first: 2.5, range: 6, windup: 0.9, recover: 0.5, dmg: 1.6, r: 6.5, w: 32, type: 'fire', fx: 'breath', status: { id: 'burn', dur: 3, v: 0.2, type: 'fire' } },
      { kind: 'barrage', cd: 10, first: 6, range: 13, windup: 0.8, recover: 0.5, dmg: 1.2, r: 2.2, count: 5, type: 'fire', fx: 'ember' },
      { kind: 'summon', cd: 22, first: 12, range: 20, windup: 0.9, recover: 0.5, spawn: 'fireElemental', count: 2 }
    ]
  }),
  D({
    id: 'ironColossus', rank: 'boss', rig: 'golem', look: 'colossus', scale: 2.1, r: 1.25, h: 3.3,
    hp: 12, dmg: 1.35, armor: 7, speed: 2.5, style: 'melee', type: 'physical', range: 3.6, interval: 1.9, windup: 0.6, heavy: true,
    aggro: 16, reward: 1, color: '#b8c4d9', phase2: 0.5,
    abilities: [
      { kind: 'slam', cd: 8, first: 3, range: 4.5, windup: 1, recover: 0.7, dmg: 2, r: 5.2, status: { id: 'stun', dur: 0.9, v: 1 } },
      { kind: 'charge', cd: 12, first: 6, range: 13, min: 4, windup: 0.9, recover: 0.8, dmg: 2.1, r: 12, w: 1.6, status: { id: 'knockdown', dur: 0.9, v: 1 } },
      { kind: 'line', cd: 10, first: 8, range: 14, windup: 1, recover: 0.6, dmg: 1.8, r: 14, w: 1.1, type: 'beam', fx: 'beam' },
      { kind: 'barrage', cd: 9, first: 4, range: 14, windup: 0.8, recover: 0.5, dmg: 1.3, r: 2.4, count: 6, fx: 'rock', phase: 2 },
      { kind: 'summon', cd: 26, first: 2, range: 20, windup: 0.9, recover: 0.5, spawn: 'ironGolem', count: 1, phase: 2 }
    ]
  }),

  // ── Tier 4: Frostbite Tundra, Sunken Temple ──────────────────────────────
  D({
    id: 'frostGiant', rank: 'normal', rig: 'humanoid', look: 'frostGiant', scale: 1.6, r: 0.8, h: 2.3,
    hp: 2.3, dmg: 1.35, armor: 2.6, resist: 0.25, speed: 2.8, style: 'melee', type: 'physical', range: 2.7, interval: 1.8, windup: 0.55, heavy: true,
    aggro: 10, reward: 1.6, color: '#8fd6ff',
    abilities: [
      { kind: 'cone', cd: 9, first: 4, range: 5.5, windup: 0.9, recover: 0.5, dmg: 1.3, r: 6, w: 34, type: 'frost', fx: 'breath', status: { id: 'slow', dur: 3, v: 0.5 } },
      { kind: 'slam', cd: 11, first: 7, range: 3.2, windup: 0.9, recover: 0.6, dmg: 1.7, r: 3.8, status: { id: 'knockdown', dur: 0.8, v: 1 } }
    ]
  }),
  D({
    id: 'naga', rank: 'normal', rig: 'naga', look: 'naga', scale: 1.05, r: 0.5, h: 1.6,
    hp: 1.1, dmg: 1.1, armor: 1.4, resist: 0.2, speed: 3.6, style: 'melee', type: 'physical', range: 2.3, interval: 1.2, windup: 0.34,
    aggro: 10, reward: 1.15, color: '#3fc7b0',
    abilities: [
      { kind: 'volley', cd: 8, first: 3, range: 9, min: 2.6, windup: 0.6, recover: 0.4, dmg: 0.7, count: 3, w: 14, type: 'frost', fx: 'water' }
    ]
  }),
  D({
    id: 'skeleton', rank: 'weak', rig: 'humanoid', look: 'skeleton', scale: 0.95, r: 0.42, h: 1.35,
    hp: 0.45, dmg: 0.8, armor: 0.3, speed: 3.5, style: 'melee', type: 'physical', range: 1.8, interval: 1.2, windup: 0.3,
    aggro: 12, reward: 0.6, color: '#e8e2cf', abilities: []
  }),
  D({
    id: 'necromancer', rank: 'normal', rig: 'humanoid', look: 'necromancer', scale: 1.05, r: 0.46, h: 1.55,
    hp: 1, dmg: 1.15, armor: 0.6, resist: 0.3, speed: 2.9, style: 'magic', type: 'shadow', range: 9.5, interval: 2, windup: 0.5,
    shotFx: 'shadow', aggro: 11, keep: 7, reward: 1.4, color: '#7d5fe0',
    abilities: [
      { kind: 'summon', cd: 11, first: 2, range: 14, windup: 0.9, recover: 0.4, spawn: 'skeleton', count: 2 },
      { kind: 'smash', cd: 9, first: 6, range: 10, windup: 0.9, recover: 0.4, dmg: 1.4, r: 2.4, type: 'shadow', fx: 'curse', status: { id: 'weaken', dur: 4, v: 0.25 } }
    ]
  }),
  D({
    id: 'frostJarl', rank: 'boss', rig: 'humanoid', look: 'frostJarl', scale: 2.15, r: 1.15, h: 3.2,
    hp: 12, dmg: 1.35, armor: 4, resist: 0.3, speed: 2.9, style: 'melee', type: 'physical', range: 3.6, interval: 1.7, windup: 0.5, heavy: true,
    aggro: 16, reward: 1, color: '#6fc8ff', phase2: 0.5,
    abilities: [
      { kind: 'cone', cd: 7, first: 3, range: 6.5, windup: 0.9, recover: 0.5, dmg: 1.5, r: 7.5, w: 36, type: 'frost', fx: 'breath', status: { id: 'slow', dur: 3, v: 0.55 } },
      { kind: 'leap', cd: 10, first: 6, range: 12, min: 4, windup: 0.9, recover: 0.7, dmg: 2, r: 4.4, status: { id: 'knockdown', dur: 0.9, v: 1 } },
      { kind: 'barrage', cd: 9, first: 4, range: 14, windup: 0.8, recover: 0.5, dmg: 1.3, r: 2.3, count: 6, type: 'frost', fx: 'icicle', status: { id: 'slow', dur: 2, v: 0.4 } },
      { kind: 'slam', cd: 14, first: 1, range: 20, windup: 1.3, recover: 0.7, dmg: 1.8, r: 8, type: 'frost', status: { id: 'frozen', dur: 1.2, v: 1 }, phase: 2 },
      { kind: 'summon', cd: 24, first: 10, range: 20, windup: 0.9, recover: 0.5, spawn: 'frostGiant', count: 1, phase: 2 }
    ]
  }),
  D({
    id: 'nagaOracle', rank: 'elite', rig: 'naga', look: 'oracle', scale: 1.6, r: 0.82, h: 2.4,
    hp: 4.2, dmg: 1.3, armor: 2, resist: 0.4, speed: 3.4, style: 'magic', type: 'frost', range: 10, interval: 1.6, windup: 0.45,
    shotFx: 'water', aggro: 13, keep: 5.5, reward: 1.6, color: '#2fe0c0', phase2: 0.5,
    abilities: [
      { kind: 'volley', cd: 6, first: 2, range: 11, windup: 0.6, recover: 0.4, dmg: 0.8, count: 5, w: 14, type: 'frost', fx: 'water' },
      { kind: 'barrage', cd: 10, first: 5, range: 13, windup: 0.8, recover: 0.5, dmg: 1.3, r: 2.3, count: 5, type: 'frost', fx: 'geyser', status: { id: 'knockup', dur: 0.7, v: 1 } },
      { kind: 'summon', cd: 20, first: 9, range: 20, windup: 0.9, recover: 0.5, spawn: 'naga', count: 2 },
      { kind: 'heal', cd: 16, first: 0, range: 20, windup: 1.1, recover: 0.5, dmg: 4, below: 0.5 }
    ]
  }),

  // ── Tier 5: Citadel of the Void, Dragon's Peak ───────────────────────────
  D({
    id: 'voidStalker', rank: 'normal', rig: 'beast', look: 'stalker', scale: 1.15, r: 0.55, h: 1.1,
    hp: 1.05, dmg: 1.25, armor: 1.2, resist: 0.3, speed: 4.8, style: 'melee', type: 'shadow', range: 1.9, interval: 1, windup: 0.26,
    aggro: 11, reward: 1.2, color: '#8a4af0',
    abilities: [{ kind: 'blink', cd: 7, first: 2, range: 10, min: 3, windup: 0.45, recover: 0.4, dmg: 1.6, type: 'shadow' }]
  }),
  D({
    id: 'wyvern', rank: 'normal', rig: 'wyvern', look: 'wyvern', scale: 1.1, r: 0.7, h: 1.9,
    hp: 1.4, dmg: 1.2, armor: 1.8, resist: 0.3, speed: 4.2, style: 'magic', type: 'fire', range: 8.5, interval: 1.9, windup: 0.5,
    shotFx: 'ember', aggro: 12, keep: 5, reward: 1.5, color: '#e0703a',
    abilities: [
      { kind: 'charge', cd: 8, first: 3, range: 11, min: 4, windup: 0.7, recover: 0.6, dmg: 1.6, r: 10, w: 1.2 },
      { kind: 'cone', cd: 10, first: 6, range: 5.5, windup: 0.8, recover: 0.5, dmg: 1.4, r: 6, w: 30, type: 'fire', fx: 'breath', status: { id: 'burn', dur: 3, v: 0.2, type: 'fire' } }
    ]
  }),
  D({
    id: 'highDemon', rank: 'normal', rig: 'humanoid', look: 'demon', scale: 1.35, r: 0.62, h: 1.95,
    hp: 1.7, dmg: 1.3, armor: 2.4, resist: 0.35, speed: 3.4, style: 'melee', type: 'physical', range: 2.3, interval: 1.4, windup: 0.4, heavy: true,
    aggro: 10.5, reward: 1.5, color: '#e0364a',
    abilities: [
      { kind: 'slam', cd: 9, first: 4, range: 3, windup: 0.85, recover: 0.5, dmg: 1.6, r: 3.6, type: 'fire', status: { id: 'burn', dur: 3, v: 0.2, type: 'fire' } },
      { kind: 'lob', cd: 7, first: 2, range: 10, min: 3, windup: 0.6, recover: 0.4, dmg: 1.2, r: 2.2, type: 'fire', fx: 'ember' }
    ]
  }),
  D({
    id: 'voidWarden', rank: 'elite', rig: 'humanoid', look: 'warden', scale: 1.55, r: 0.78, h: 2.25,
    hp: 3.6, dmg: 1.35, armor: 3.2, resist: 0.4, speed: 3.3, style: 'melee', type: 'shadow', range: 2.7, interval: 1.4, windup: 0.42, heavy: true,
    aggro: 12, reward: 1.4, color: '#a45cff',
    abilities: [
      { kind: 'blink', cd: 8, first: 3, range: 11, min: 3.5, windup: 0.5, recover: 0.5, dmg: 1.8, type: 'shadow' },
      { kind: 'slam', cd: 9, first: 5, range: 3.4, windup: 0.9, recover: 0.6, dmg: 1.8, r: 4.4, type: 'shadow', status: { id: 'weaken', dur: 4, v: 0.25 } },
      { kind: 'barrage', cd: 11, first: 7, range: 13, windup: 0.8, recover: 0.5, dmg: 1.3, r: 2.3, count: 5, type: 'shadow', fx: 'curse' },
      { kind: 'summon', cd: 22, first: 11, range: 20, windup: 0.9, recover: 0.5, spawn: 'voidStalker', count: 2 }
    ]
  }),
  D({
    id: 'voidDragon', rank: 'boss', rig: 'dragon', look: 'void', scale: 1.9, r: 1.6, h: 3.4,
    hp: 13, dmg: 1.4, armor: 5, resist: 0.45, speed: 3.1, style: 'melee', type: 'physical', range: 4.2, interval: 1.7, windup: 0.5, heavy: true,
    aggro: 18, reward: 1, color: '#9a4aff', phase2: 0.55,
    abilities: [
      { kind: 'cone', cd: 7, first: 3, range: 8, windup: 1, recover: 0.6, dmg: 1.7, r: 9, w: 30, type: 'shadow', fx: 'breath', status: { id: 'burn', dur: 4, v: 0.22, type: 'shadow' } },
      { kind: 'slam', cd: 9, first: 5, range: 5, windup: 0.9, recover: 0.6, dmg: 1.8, r: 6, status: { id: 'knockdown', dur: 0.9, v: 1 }, pose: 1 },
      { kind: 'charge', cd: 12, first: 8, range: 14, min: 5, windup: 0.9, recover: 0.8, dmg: 2.1, r: 13, w: 2 },
      { kind: 'barrage', cd: 8, first: 2, range: 16, windup: 0.8, recover: 0.5, dmg: 1.4, r: 2.6, count: 7, type: 'shadow', fx: 'meteor', phase: 2 },
      { kind: 'summon', cd: 24, first: 6, range: 20, windup: 0.9, recover: 0.5, spawn: 'wyvern', count: 2, phase: 2 },
      { kind: 'enrage', cd: 45, first: 0, range: 20, windup: 0.8, recover: 0.3, phase: 2 }
    ]
  }),

  // ── Tier 6: Dread Fortress, the Void Rift ────────────────────────────────
  D({
    id: 'doomKnight', rank: 'elite', rig: 'humanoid', look: 'doomKnight', scale: 1.4, r: 0.66, h: 2.05,
    hp: 3, dmg: 1.4, armor: 6, resist: 0.3, speed: 3.2, style: 'melee', type: 'physical', range: 2.5, interval: 1.4, windup: 0.42, heavy: true,
    aggro: 11, reward: 1.2, color: '#c0364a',
    abilities: [
      { kind: 'cone', cd: 6, first: 2.5, range: 3.2, windup: 0.7, recover: 0.5, dmg: 1.8, r: 3.9, w: 60, pose: 1 },
      { kind: 'charge', cd: 10, first: 5, range: 11, min: 3.5, windup: 0.75, recover: 0.6, dmg: 2, r: 10, w: 1.1, status: { id: 'knockdown', dur: 0.8, v: 1 } },
      { kind: 'enrage', cd: 25, first: 10, range: 14, windup: 0.6, recover: 0.3 }
    ]
  }),
  D({
    id: 'imp', rank: 'weak', rig: 'humanoid', look: 'imp', scale: 0.72, r: 0.38, h: 1,
    hp: 0.5, dmg: 0.9, armor: 0.4, resist: 0.3, speed: 4.4, style: 'magic', type: 'fire', range: 7.5, interval: 1.7, windup: 0.4,
    shotFx: 'ember', aggro: 12, keep: 5, reward: 0.6, color: '#ff5a3a', abilities: []
  }),
  D({
    id: 'archDemon', rank: 'boss', rig: 'humanoid', look: 'archDemon', scale: 2.3, r: 1.3, h: 3.5,
    hp: 13, dmg: 1.35, armor: 6, resist: 0.45, speed: 3.2, style: 'melee', type: 'physical', range: 4, interval: 1.6, windup: 0.48, heavy: true,
    aggro: 18, reward: 1, color: '#ff2a3f', phase2: 0.55,
    abilities: [
      { kind: 'cone', cd: 6, first: 2.5, range: 5, windup: 0.8, recover: 0.5, dmg: 1.8, r: 5.6, w: 62, pose: 1 },
      { kind: 'slam', cd: 9, first: 5, range: 4.6, windup: 1, recover: 0.6, dmg: 1.9, r: 6.2, type: 'fire', status: { id: 'burn', dur: 4, v: 0.22, type: 'fire' } },
      { kind: 'line', cd: 10, first: 7, range: 16, windup: 1, recover: 0.6, dmg: 2, r: 16, w: 1.4, type: 'fire', fx: 'beam' },
      { kind: 'leap', cd: 12, first: 9, range: 14, min: 5, windup: 0.9, recover: 0.7, dmg: 2.1, r: 5, status: { id: 'knockdown', dur: 0.9, v: 1 } },
      { kind: 'barrage', cd: 8, first: 3, range: 16, windup: 0.8, recover: 0.5, dmg: 1.5, r: 2.6, count: 8, type: 'fire', fx: 'meteor', phase: 2 },
      { kind: 'summon', cd: 20, first: 4, range: 20, windup: 0.9, recover: 0.5, spawn: 'imp', count: 4, phase: 2 },
      { kind: 'enrage', cd: 45, first: 0, range: 20, windup: 0.8, recover: 0.3, phase: 2 }
    ]
  }),
  D({
    id: 'voidling', rank: 'weak', rig: 'elemental', look: 'void', scale: 0.8, r: 0.42, h: 1.1,
    hp: 0.5, dmg: 0.95, armor: 0.4, resist: 0.4, speed: 4.2, style: 'melee', type: 'shadow', range: 1.7, interval: 1.1, windup: 0.28,
    aggro: 14, reward: 0.6, color: '#b06aff',
    deathBlast: { r: 2, dmg: 0.8, type: 'shadow' }, abilities: []
  }),
  D({
    id: 'voidLord', rank: 'boss', rig: 'voidlord', look: 'voidLord', scale: 2.5, r: 1.5, h: 4,
    hp: 16, dmg: 1.4, armor: 7, resist: 0.5, speed: 3, style: 'magic', type: 'shadow', range: 10, interval: 1.5, windup: 0.45,
    shotFx: 'shadow', aggro: 20, keep: 5, reward: 1.6, color: '#c44aff', phase2: 0.6,
    abilities: [
      { kind: 'volley', cd: 5, first: 2, range: 13, windup: 0.6, recover: 0.4, dmg: 0.85, count: 7, w: 12, type: 'shadow', fx: 'shadow' },
      { kind: 'slam', cd: 9, first: 5, range: 6, windup: 1, recover: 0.6, dmg: 1.9, r: 7, type: 'shadow', status: { id: 'knockdown', dur: 0.9, v: 1 } },
      { kind: 'line', cd: 8, first: 6, range: 18, windup: 0.9, recover: 0.5, dmg: 2, r: 18, w: 1.5, type: 'beam', fx: 'beam' },
      { kind: 'barrage', cd: 7, first: 3, range: 18, windup: 0.8, recover: 0.5, dmg: 1.5, r: 2.7, count: 9, type: 'shadow', fx: 'meteor' },
      { kind: 'blink', cd: 11, first: 8, range: 14, min: 4, windup: 0.5, recover: 0.5, dmg: 2, type: 'shadow' },
      { kind: 'summon', cd: 16, first: 4, range: 20, windup: 0.9, recover: 0.5, spawn: 'voidling', count: 4 },
      { kind: 'slam', cd: 18, first: 1, range: 20, windup: 1.6, recover: 0.8, dmg: 2.2, r: 11, type: 'shadow', phase: 2 },
      { kind: 'enrage', cd: 40, first: 0, range: 20, windup: 0.8, recover: 0.3, phase: 2 }
    ]
  }),

  // ── Hostile townsfolk and faction ambushers (quest consequences) ──────────
  D({
    id: 'orderGuard', rank: 'normal', rig: 'humanoid', look: 'orderGuard', scale: 1.05, r: 0.48, h: 1.5,
    hp: 1.4, dmg: 1.05, armor: 3.2, speed: 3.2, style: 'melee', type: 'physical', range: 2, interval: 1.3, windup: 0.36,
    aggro: 10, reward: 1.1, color: '#ffd84a',
    abilities: [{ kind: 'cone', cd: 8, first: 3, range: 2.6, windup: 0.6, recover: 0.45, dmg: 1.5, r: 3, w: 50, pose: 1, status: { id: 'stun', dur: 0.7, v: 1 } }]
  }),
  D({
    id: 'syndicateBlade', rank: 'normal', rig: 'humanoid', look: 'syndicate', scale: 1, r: 0.44, h: 1.42,
    hp: 0.95, dmg: 1.2, armor: 1, speed: 4.2, style: 'melee', type: 'physical', range: 1.9, interval: 0.95, windup: 0.26,
    aggro: 10, reward: 1.1, color: '#8a5fd0',
    abilities: [{ kind: 'blink', cd: 8, first: 2.5, range: 9, min: 3, windup: 0.4, recover: 0.4, dmg: 1.6, status: { id: 'poison', dur: 4, v: 0.2, type: 'poison' } }]
  }),

  // ── Branch bosses (roadmap #70): each guards the end of a side way ───────
  // Built from the zones' own kinds on a boss template: a boss's health, a
  // phase, a summons or a signature blow. `reward` keeps one worth about two
  // elites; `branch` keeps the finale's promised drops for the finale.
  D({
    id: 'goblinWarchief', rank: 'boss', branch: true, rig: 'humanoid', look: 'goblin', scale: 1.55, r: 0.8, h: 2,
    hp: 4.2, dmg: 1.05, armor: 1.8, speed: 3.1, style: 'melee', type: 'physical', range: 2.5, interval: 1.45, windup: 0.46, heavy: true,
    aggro: 10, reward: 0.45, color: '#6fbf3f', phase2: 0.5,
    abilities: [
      { kind: 'slam', cd: 8, first: 3, range: 3.2, windup: 0.85, recover: 0.6, dmg: 1.7, r: 3.4, pose: 1, status: { id: 'knockdown', dur: 0.6, v: 1 } },
      { kind: 'summon', cd: 16, first: 6, range: 20, windup: 0.8, recover: 0.5, spawn: 'goblin', count: 2 },
      { kind: 'enrage', cd: 30, first: 0, range: 20, windup: 0.7, recover: 0.3, phase: 2 }
    ]
  }),
  D({
    id: 'thornfather', rank: 'boss', branch: true, rig: 'treant', look: 'treant', scale: 1.85, r: 1, h: 3,
    hp: 5, dmg: 1.25, armor: 3, speed: 2.1, style: 'melee', type: 'physical', range: 2.9, interval: 1.9, windup: 0.6, heavy: true,
    aggro: 10, reward: 0.45, color: '#4f8f3a', phase2: 0.5,
    abilities: [
      { kind: 'slam', cd: 8, first: 3, range: 3.6, windup: 1, recover: 0.6, dmg: 1.7, r: 4, status: { id: 'knockdown', dur: 0.7, v: 1 } },
      { kind: 'barrage', cd: 10, first: 5, range: 12, windup: 0.9, recover: 0.5, dmg: 1.1, r: 2, count: 4, type: 'poison', fx: 'roots', status: { id: 'slow', dur: 2.5, v: 0.5 }, phase: 2 }
    ]
  }),
  D({
    id: 'broodMother', rank: 'boss', branch: true, rig: 'spider', look: 'brood', scale: 2, r: 1.1, h: 1.6,
    hp: 4.4, dmg: 1.15, armor: 1.6, speed: 3.5, style: 'melee', type: 'physical', range: 2.4, interval: 1.3, windup: 0.38,
    aggro: 11, reward: 0.45, color: '#a65fe6', phase2: 0.5,
    abilities: [
      { kind: 'lob', cd: 6, first: 2.5, range: 10, min: 2, windup: 0.7, recover: 0.4, dmg: 1.1, r: 2.4, type: 'poison', fx: 'venom', status: { id: 'poison', dur: 4, v: 0.25, type: 'poison' } },
      { kind: 'summon', cd: 14, first: 6, range: 20, windup: 0.8, recover: 0.5, spawn: 'spider', count: 2 },
      { kind: 'summon', cd: 12, first: 1, range: 20, windup: 0.8, recover: 0.5, spawn: 'spider', count: 3, phase: 2 }
    ]
  }),
  D({
    id: 'banditBaron', rank: 'boss', branch: true, rig: 'humanoid', look: 'banditChief', scale: 1.45, r: 0.7, h: 2,
    hp: 4.8, dmg: 1.25, armor: 2.6, speed: 3.4, style: 'melee', type: 'physical', range: 2.4, interval: 1.35, windup: 0.42, heavy: true,
    aggro: 10, reward: 0.45, color: '#e0563a', phase2: 0.5,
    abilities: [
      { kind: 'cone', cd: 6, first: 2.5, range: 3, windup: 0.7, recover: 0.5, dmg: 1.7, r: 3.6, w: 55, pose: 1 },
      { kind: 'charge', cd: 10, first: 5, range: 9, min: 3.5, windup: 0.8, recover: 0.7, dmg: 1.9, r: 8, w: 0.9, status: { id: 'knockdown', dur: 0.8, v: 1 } },
      { kind: 'summon', cd: 20, first: 10, range: 20, windup: 0.8, recover: 0.5, spawn: 'banditArcher', count: 2, phase: 2 }
    ]
  }),
  D({
    id: 'cinderGolem', rank: 'boss', branch: true, rig: 'golem', look: 'iron', scale: 1.8, r: 1, h: 2.9,
    hp: 5.2, dmg: 1.3, armor: 5, resist: 0.3, speed: 2.3, style: 'melee', type: 'fire', range: 2.6, interval: 1.9, windup: 0.6, heavy: true,
    aggro: 9, reward: 0.45, color: '#ff7a2a', phase2: 0.5,
    abilities: [
      { kind: 'slam', cd: 8, first: 3, range: 3.4, windup: 0.95, recover: 0.6, dmg: 1.7, r: 3.8, type: 'fire', status: { id: 'burn', dur: 3, v: 0.2, type: 'fire' } },
      { kind: 'barrage', cd: 10, first: 5, range: 12, windup: 0.8, recover: 0.5, dmg: 1.1, r: 2, count: 4, fx: 'ember', type: 'fire', phase: 2 }
    ]
  }),
  D({
    id: 'frostHowler', rank: 'boss', branch: true, rig: 'beast', look: 'wolf', scale: 1.9, r: 0.9, h: 1.7,
    hp: 4.4, dmg: 1.2, armor: 1.4, speed: 4.6, style: 'melee', type: 'frost', range: 2.2, interval: 1.1, windup: 0.3,
    aggro: 11, reward: 0.45, color: '#9fdcff', phase2: 0.5,
    abilities: [
      { kind: 'leap', cd: 6, first: 1.5, range: 8, min: 3, windup: 0.55, recover: 0.4, dmg: 1.4, r: 2, type: 'frost' },
      { kind: 'cone', cd: 8, first: 4, range: 5, windup: 0.8, recover: 0.5, dmg: 1.3, r: 5.5, w: 34, type: 'frost', status: { id: 'slow', dur: 2.5, v: 0.5 } },
      { kind: 'summon', cd: 18, first: 2, range: 20, windup: 0.8, recover: 0.5, spawn: 'wolf', count: 2, phase: 2 }
    ]
  }),
  D({
    id: 'tideSerpent', rank: 'boss', branch: true, rig: 'naga', look: 'naga', scale: 1.6, r: 0.8, h: 2.4,
    hp: 4.6, dmg: 1.2, armor: 1.6, resist: 0.3, speed: 3, style: 'magic', type: 'frost', range: 8.5, interval: 1.7, windup: 0.45,
    aggro: 11, keep: 5, reward: 0.45, color: '#3fd8c8', phase2: 0.5,
    abilities: [
      { kind: 'line', cd: 7, first: 3, range: 10, windup: 0.8, recover: 0.5, dmg: 1.5, r: 10, w: 1, type: 'frost', status: { id: 'slow', dur: 2, v: 0.5 } },
      { kind: 'barrage', cd: 10, first: 5, range: 13, windup: 0.8, recover: 0.5, dmg: 1.2, r: 2.2, count: 4, type: 'frost', phase: 2 }
    ]
  }),
  D({
    id: 'riftKnight', rank: 'boss', branch: true, rig: 'humanoid', look: 'doomKnight', scale: 1.6, r: 0.75, h: 2.3,
    hp: 5, dmg: 1.3, armor: 3, speed: 3.3, style: 'melee', type: 'shadow', range: 2.5, interval: 1.35, windup: 0.42, heavy: true,
    aggro: 10, reward: 0.45, color: '#b06aff', phase2: 0.5,
    abilities: [
      { kind: 'charge', cd: 9, first: 4, range: 10, min: 3.5, windup: 0.75, recover: 0.6, dmg: 1.9, r: 9, w: 1.1, type: 'shadow', status: { id: 'knockdown', dur: 0.8, v: 1 } },
      { kind: 'slam', cd: 8, first: 3, range: 3.2, windup: 0.85, recover: 0.6, dmg: 1.7, r: 3.8, type: 'shadow' },
      { kind: 'enrage', cd: 30, first: 0, range: 20, windup: 0.7, recover: 0.3, phase: 2 }
    ]
  }),
  D({
    id: 'wyvernMatriarch', rank: 'boss', branch: true, rig: 'wyvern', look: 'wyvern', scale: 1.7, r: 1.05, h: 2.8,
    hp: 4.8, dmg: 1.25, armor: 1.8, speed: 3.6, style: 'melee', type: 'physical', range: 2.6, interval: 1.4, windup: 0.4,
    aggro: 11, reward: 0.45, color: '#ff8a4a', phase2: 0.5,
    abilities: [
      { kind: 'cone', cd: 8, first: 3, range: 5.5, windup: 0.8, recover: 0.5, dmg: 1.4, r: 6, w: 30, type: 'fire', status: { id: 'burn', dur: 3, v: 0.2, type: 'fire' } },
      { kind: 'leap', cd: 9, first: 5, range: 10, min: 4, windup: 0.8, recover: 0.6, dmg: 1.6, r: 3.2 },
      { kind: 'summon', cd: 20, first: 2, range: 20, windup: 0.8, recover: 0.5, spawn: 'wyvern', count: 1, phase: 2 }
    ]
  })
]

export const ENEMY_BY_ID: Readonly<Record<string, EnemyDef>> = Object.fromEntries(ENEMIES.map(e => [e.id, e]))

/** The hero's summons (Grand Sovereign) and machines (Aether-Tech). Their
 *  numbers come from the hero at the moment they are summoned. */
export interface MinionDef {
  id: string
  rig: string
  look: string
  scale: number
  r: number
  h: number
  style: 'melee' | 'ranged' | 'magic'
  type: DamageType
  range: number
  interval: number
  speed: number
  /** Share of the hero's max health. */
  hp: number
  /** Share of the hero's basic hit, before Charisma. */
  dmg: number
  shotFx?: string
  /** Royal Guards hold the enemy's attention. */
  taunts?: boolean
  color: string
}

export const MINIONS: Readonly<Record<string, MinionDef>> = {
  guard: { id: 'guard', rig: 'humanoid', look: 'royalGuard', scale: 0.92, r: 0.44, h: 1.35, style: 'melee', type: 'physical', range: 1.9, interval: 1.1, speed: 4.4, hp: 0.6, dmg: 0.5, taunts: true, color: '#ffd84a' },
  archer: { id: 'archer', rig: 'humanoid', look: 'royalArcher', scale: 0.9, r: 0.42, h: 1.3, style: 'ranged', type: 'pierce', range: 9, interval: 1.2, speed: 4.2, hp: 0.35, dmg: 0.55, shotFx: 'arrow', color: '#ffb04a' },
  mage: { id: 'mage', rig: 'humanoid', look: 'royalMage', scale: 0.9, r: 0.42, h: 1.3, style: 'magic', type: 'holy', range: 9, interval: 1.6, speed: 4, hp: 0.35, dmg: 0.9, shotFx: 'holy', color: '#8fd6ff' },
  turret: { id: 'turret', rig: 'turret', look: 'gatling', scale: 1, r: 0.5, h: 1.1, style: 'ranged', type: 'pierce', range: 10, interval: 0.5, speed: 0, hp: 0.4, dmg: 0.45, shotFx: 'bullet', color: '#4ff0c8' },
  rocketTurret: { id: 'rocketTurret', rig: 'turret', look: 'rocket', scale: 1, r: 0.5, h: 1.1, style: 'ranged', type: 'fire', range: 11, interval: 1, speed: 0, hp: 0.4, dmg: 0.9, shotFx: 'rocket', color: '#ff8a4a' },
  // The Void Dragon, bound by the pact struck on its peak (quest `dragon`).
  dragonAlly: { id: 'dragonAlly', rig: 'dragon', look: 'ally', scale: 1.1, r: 1.1, h: 2.2, style: 'magic', type: 'shadow', range: 8, interval: 1.6, speed: 4.6, hp: 2.2, dmg: 1.6, shotFx: 'shadow', color: '#9a4aff' }
}
