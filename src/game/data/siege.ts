import { AFTER_XP_MUL, xpToNext } from './progression'
import { finaleGold } from './loot'

/**
 * ─── The Siege of Bastion (docs/gdd-afterplay.md §8, phase 6) ───────────────
 *
 * The afterplay's castle siege: ten waves come down three lanes at the fort's
 * gate; between them a short build phase spends Siege Marks on defences. The
 * gate falls (or the hero does, with no revive left) and the siege is lost;
 * the tenth wave's Siege Lord falls and it is won.
 *
 * Everything here is pure data and arithmetic: which waves come, what the
 * defences cost and do, what a run pays, which one-time milestones a win
 * reaches, and when the siege bell rings. The sim plays it (`sim/siege.ts`),
 * the save keeps what lasts (`state/profile.ts`, `meta.siege`).
 */

export const SIEGE_WAVES = 10
/** Seconds of the build phase before each wave (the first one too). */
export const BUILD_SECONDS = 15

export type SiegeTier = 'normal' | 'hard' | 'nightmare'
export const SIEGE_TIERS: readonly SiegeTier[] = ['normal', 'hard', 'nightmare']

/** Hard: +3 levels and +30 % health; Nightmare: +6 levels and two waves of mythic elites (§8.4). */
export const TIER_LEVEL: Readonly<Record<SiegeTier, number>> = { normal: 0, hard: 3, nightmare: 6 }
export const TIER_HP: Readonly<Record<SiegeTier, number>> = { normal: 1, hard: 1.3, nightmare: 1.3 }

/** The siege is fought at the hero's level, never under 38 (B5's level); its enemies one above it. */
export const SIEGE_MIN_LEVEL = 38
export const siegeLevel = (heroLevel: number): number => Math.max(SIEGE_MIN_LEVEL, heroLevel)
export const siegeEnemyLevel = (heroLevel: number, tier: SiegeTier): number => siegeLevel(heroLevel) + 1 + TIER_LEVEL[tier]

/** Kills in a siege pay the afterplay's XP (§2.1, decisions: "invaded zones and siege waves give ×2.2"). */
export const SIEGE_XP_MUL = AFTER_XP_MUL

// ─── Defences (§8.2) ─────────────────────────────────────────────────────────

export type DefenceId = 'ballista' | 'cauldron' | 'barricade' | 'militia' | 'repair'
export const DEFENCES: readonly DefenceId[] = ['ballista', 'cauldron', 'barricade', 'militia', 'repair']

/** What each defence costs in Siege Marks. */
export const DEFENCE_COST: Readonly<Record<DefenceId, number>> = { ballista: 3, cauldron: 2, barricade: 1, militia: 4, repair: 2 }

/** A ballista: a piercing bolt down its lane every 2 s. */
export const BALLISTA = {
  every: 2,
  range: 17,
  /** A bolt's hit, as a share of a normal enemy's health at the siege's level. */
  dmg: 0.3,
  pierce: 3,
  speed: 26,
  /** Its own health, in blows of a normal enemy (harpies go for it). */
  hp: 40
} as const

/** A fire cauldron: a burning patch across its lane's chokepoint for the rest of the siege. */
export const CAULDRON = {
  r: 2.6,
  /** Damage a half-second tick, as a share of a normal enemy's health. */
  tick: 0.035,
  every: 0.5,
  /** The burn it leaves, damage per second as a share of a normal enemy's health. */
  burn: 0.02
} as const

/** A barricade: blocks its lane for 20 s or until it has taken 400 damage (§8.2, as written). */
export const BARRICADE = { dur: 20, hp: 400 } as const

/** Militia: two guards that fight beside the hero for the rest of the siege. */
export const MILITIA_COUNT = 2

/** Gate repair: a quarter of the gate's health back. */
export const REPAIR = 0.25

/** The gate's health, in blows of a normal enemy of the siege's level. */
export const GATE_BLOWS = 400
/** Oak banded with iron: the share of a blow the gate shrugs off (a ram's and a sapper's land whole). */
export const GATE_GUARD = 0.5
/** A battering ram at the gate: a share of the gate's health every few seconds. */
export const RAM = { hit: 0.035, every: 3, speed: 1.15, hp: 6 } as const
/** A sapper's blast (a share of the gate's health; a defence it reaches is destroyed). */
export const SAPPER = { gate: 0.025, r: 2.2 } as const

// ─── Siege Marks (§8.2) ──────────────────────────────────────────────────────

/** 1 per elite killed, 3 per wave cleared, +2 if the gate took no damage that wave. */
export const MARKS = { elite: 1, wave: 3, unharmed: 2, start: 5 } as const
/** A lost siege keeps half the Marks it earned. */
export const FAIL_KEEP = 0.5

/** The Marks a run banks: all of them on a win, half (rounded down) on a loss. */
export const marksBanked = (earned: number, won: boolean): number => (won ? earned : Math.floor(earned * FAIL_KEEP))

// ─── Waves (§8.3) ────────────────────────────────────────────────────────────

/** What a group in a wave is. */
export type SpawnRole =
  /** Walks its lane to the gate, fighting whoever stands in the way. */
  | 'foe'
  /** Lands on the wall by the gate (gargoyles, wave 3). */
  | 'leap'
  /** Goes for the ballistas first (harpies, waves 6-7). */
  | 'raider'
  /** Runs at a defence or the gate and explodes (imps, wave 8). */
  | 'sapper'
  /** A battering ram: slow, tough, deadly at the gate (waves 4 and 9). */
  | 'ram'
  /** The fifth wave's captain, the tenth's Siege Lord: a champion with a bar of its own. */
  | 'boss'
  /** An elite of the wave (Marks), or a Nightmare mythic elite. */
  | 'elite'

export interface WaveGroup {
  kind: string
  n: number
  role: SpawnRole
  /** Champion health multiplier (bosses, mythic elites). */
  hp?: number
}

export interface WavePlan {
  n: number
  groups: WaveGroup[]
}

/** The ram's kind: no enemy table knows it (it never fights), the sim drives it. */
export const RAM_KIND = 'siegeRam'
/** The Siege Lord (§8.3): the pit lord, re-skinned (tinted infernal, named anew). */
export const SIEGE_LORD = 'pitLord'

/** The fifth wave's captain, rotating siege by siege: a centaur raider captain, or the Ember Lord Reborn. */
export const MINI_BOSSES: readonly string[] = ['centaurRaider', 'emberLord']

/** Nightmare's two waves of mythic elites (§8.4): the waves, and who comes. */
export const MYTHIC_WAVES: readonly number[] = [6, 9]
export const MYTHIC_ELITES: readonly string[] = ['cyclopsBrute', 'centaurRaider']

const g = (kind: string, n: number, role: SpawnRole = 'foe', hp?: number): WaveGroup => ({ kind, n, role, ...(hp ? { hp } : {}) })

/**
 * The siege's ten waves at a tier (§8.3). `rotation` picks the fifth wave's
 * captain (the number of sieges fought before). Counts are the same on every
 * tier; Hard and Nightmare raise the level and the health instead.
 */
export const siegeWaves = (tier: SiegeTier, rotation = 0): WavePlan[] => {
  const boss = MINI_BOSSES[((rotation % MINI_BOSSES.length) + MINI_BOSSES.length) % MINI_BOSSES.length]!
  const waves: WaveGroup[][] = [
    [g('imp', 12), g('hellhound', 5)],
    [g('imp', 13), g('hellhound', 8)],
    [g('gargoyle', 7, 'leap'), g('imp', 12)],
    [g(RAM_KIND, 1, 'ram'), g('imp', 11), g('hellhound', 7)],
    [g(boss, 1, 'boss', boss === 'emberLord' ? 2.5 : 4), g('imp', 10), g('hellhound', 7)],
    [g('imp', 10), g('hellhound', 7), g('gargoyle', 3, 'leap'), g('harpy', 6, 'raider')],
    [g('imp', 10), g('hellhound', 8), g('gargoyle', 4, 'leap'), g('harpy', 7, 'raider')],
    [g('imp', 14, 'sapper'), g('hellhound', 9)],
    [g(RAM_KIND, 2, 'ram'), g('imp', 12), g('hellhound', 9), g('gargoyle', 4, 'leap'), g('harpy', 6, 'raider'), g('imp', 6, 'sapper')],
    [g(SIEGE_LORD, 1, 'boss', 6), g('doomKnight', 2, 'elite'), g('imp', 12)]
  ]
  if (tier === 'nightmare') {
    MYTHIC_WAVES.forEach((w, k) => { waves[w - 1]!.push(g(MYTHIC_ELITES[k % MYTHIC_ELITES.length]!, 2, 'elite', 3)) })
  }
  return waves.map((groups, i) => ({ n: i + 1, groups }))
}

/** Every enemy kind a siege can send (the scene prewarms their rigs). */
export const siegeKinds = (tier: SiegeTier): string[] => {
  const out = new Set<string>(MINI_BOSSES)
  for (const w of siegeWaves(tier)) for (const x of w.groups) if (x.kind !== RAM_KIND) out.add(x.kind)
  return [...out]
}

/** Most enemies alive at once, militia included (§14: 28, 18 on a low device). */
export const SIEGE_CAP = 28
export const SIEGE_CAP_LOW = 18
/** Seconds between two spawn packets of a wave, and the most a packet holds. */
export const PACKET_EVERY = 3.5
export const PACKET_MAX = 4

// ─── Rewards (§8.6, §11) ─────────────────────────────────────────────────────

/** A win's purse at the reference level 45 (§11: 4k / 6k / 9k), its XP in levels, its Demonglass. */
export const WIN_GOLD: Readonly<Record<SiegeTier, number>> = { normal: 4000, hard: 6000, nightmare: 9000 }
export const WIN_LEVELS: Readonly<Record<SiegeTier, number>> = { normal: 1, hard: 1.3, nightmare: 1.6 }
export const WIN_GLASS: Readonly<Record<SiegeTier, number>> = { normal: 50, hard: 80, nightmare: 120 }
/** The item a win rolls (§8.6: one tier 5-6 piece; Nightmare rolls the higher). */
export const WIN_TIER: Readonly<Record<SiegeTier, number>> = { normal: 5, hard: 6, nightmare: 6 }

export interface SiegeReward { gold: number; xp: number; glass: number; tier: number }

/** A won siege's reward at a hero level: the purse scales with the level like a finale's. */
export const siegeReward = (tier: SiegeTier, heroLevel: number): SiegeReward => {
  const lvl = siegeLevel(heroLevel)
  return {
    gold: Math.round(WIN_GOLD[tier] * finaleGold(lvl) / finaleGold(45)),
    xp: Math.round(xpToNext(lvl) * WIN_LEVELS[tier]),
    glass: WIN_GLASS[tier],
    tier: WIN_TIER[tier]
  }
}

// ─── Milestones (§8.6: first clear only, like the colosseum's) ───────────────

export type MilestoneId = 'normal1' | 'normal5' | 'hard1' | 'hard5' | 'nightmare1' | 'hardFlawless'

export interface SiegeMilestone {
  id: MilestoneId
  tier: SiegeTier
  /** Wins at the tier it asks for (a flawless one: a Hard win the gate took no damage in). */
  wins: number
  flawless?: boolean
  /** An item it hands over (granted once the item exists: phase 8 adds them). */
  item?: string
  /** A world flag it sets (an account unlock). */
  flag?: string
}

/** The flag of the fifth passive slot ("Veteran's Instinct", account-wide). */
export const FIFTH_PASSIVE_FLAG = 'fifthPassive'
/** The hidden class trial's key (the Demonhunter, §10; phase 10 reads it). */
export const DEMONHUNTER_KEY = 'demonhunterKey'

export const SIEGE_MILESTONES: readonly SiegeMilestone[] = [
  { id: 'normal1', tier: 'normal', wins: 1, item: 'bastionBanner' },
  { id: 'normal5', tier: 'normal', wins: 5, item: 'wallwardensPlate' },
  { id: 'hard1', tier: 'hard', wins: 1, flag: FIFTH_PASSIVE_FLAG },
  { id: 'hard5', tier: 'hard', wins: 5, item: 'gatebreaker' },
  { id: 'nightmare1', tier: 'nightmare', wins: 1, item: 'crownOfTheLastBastion' },
  { id: 'hardFlawless', tier: 'hard', wins: 1, flawless: true, flag: DEMONHUNTER_KEY }
]

/** The milestones a win now reaches that were not reached before (each is given once). */
export const milestonesReached = (
  wins: Readonly<Record<SiegeTier, number>>, flawlessHard: boolean, done: ReadonlySet<string>
): SiegeMilestone[] =>
  SIEGE_MILESTONES.filter(m => !done.has(m.id) && (m.flawless ? flawlessHard : wins[m.tier] >= m.wins))

// ─── Tiers and cadence (§8.4) ────────────────────────────────────────────────

/** Hard opens after a Normal win; Nightmare after B10, or with the rift kept ajar. */
export const tierOpen = (tier: SiegeTier, wins: Readonly<Record<SiegeTier, number>>, flags: ReadonlySet<string>): boolean =>
  tier === 'normal' || (tier === 'hard' ? wins.normal > 0 : flags.has('brk10') || flags.has('riftAjar'))

/** The siege bell rings after every this many invaded zone clears (decisions: no real-time timer). */
export const BELL_CLEARS = 2

/** Does the bell ring? The story's first siege is due, or enough zones were cleared since the last one. */
export const bellRings = (opened: boolean, storyDue: boolean, clearsSince: number): boolean =>
  storyDue || (opened && clearsSince >= BELL_CLEARS)

// ─── What the save keeps (`profile.meta.siege`) ──────────────────────────────

export interface SiegeSave {
  /** Sieges won, by tier. */
  wins: Record<SiegeTier, number>
  /** Sieges fought (the fifth wave's captain rotates by it). */
  runs: number
  /** The furthest wave fought to its end. */
  best: number
  /** Siege Marks banked (for the fort's banner colours and Demonglass, a later phase's shop). */
  marks: number
  /** Milestones reached (`SIEGE_MILESTONES` ids): each is given once. */
  milestones: string[]
  /** Milestone items not handed over yet because they do not exist yet (phase 8 adds them). */
  owed: string[]
  /** Demonglass won and not yet in the pouch (the material arrives with phase 8). */
  glass: number
  /** Invaded zones cleared since the last siege (the bell, §8.4). */
  clears: number
}

export const defaultSiege = (): SiegeSave => ({ wins: { normal: 0, hard: 0, nightmare: 0 }, runs: 0, best: 0, marks: 0, milestones: [], owed: [], glass: 0, clears: 0 })

/** A stored siege block, cleaned: anything missing or malformed loads as nothing done yet. */
export const normalizeSiege = (raw: unknown): SiegeSave => {
  const d = defaultSiege()
  if (!raw || typeof raw !== 'object') return d
  const o = raw as Record<string, unknown>
  const n = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0)
  const ids = (v: unknown, ok: (s: string) => boolean): string[] => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && ok(x)))] : [])
  const w = (o.wins && typeof o.wins === 'object' ? o.wins : {}) as Record<string, unknown>
  const known = new Set<string>(SIEGE_MILESTONES.map(m => m.id))
  return {
    wins: { normal: n(w.normal), hard: n(w.hard), nightmare: n(w.nightmare) },
    runs: n(o.runs),
    best: Math.min(SIEGE_WAVES, n(o.best)),
    marks: n(o.marks),
    milestones: ids(o.milestones, s => known.has(s)),
    owed: ids(o.owed, () => true),
    glass: n(o.glass),
    clears: n(o.clears)
  }
}
