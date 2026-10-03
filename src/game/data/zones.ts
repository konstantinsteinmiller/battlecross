import type { ClassId } from './skills'
import type { ItemSlot, ZoneId } from './items'

/**
 * ─── The world (GDD §3.1, §6.2) ──────────────────────────────────────────────
 *
 * The twelve combat zones of the tier table, three towns, the colosseum, and
 * the map that joins them. A node opens when ANY node it is linked to has been
 * cleared (or, for a town, visited). Recommended levels are shown, never
 * enforced: a level-3 hero may walk into the Ashen Crags, and will meet
 * level-11 fire elementals there.
 */

/** The look, the props and the music of a place. */
export type ThemeId =
  | 'plains' | 'cave' | 'forest' | 'farm' | 'ash' | 'mine' | 'snow' | 'temple' | 'void' | 'peak' | 'fortress' | 'rift'
  | 'town' | 'ruin' | 'arena'

export interface PackEntry {
  kind: string
  /** Relative weight in the zone's ordinary packs. */
  w: number
}

export interface ZoneDef {
  id: ZoneId
  theme: ThemeId
  /** Enemy level band. The visit's level is the hero's, clamped into it. */
  min: number
  max: number
  /** Clearings after the safe one the hero starts in. */
  sections: number
  /** Enemies per ordinary pack. */
  pack: [number, number]
  kinds: PackEntry[]
  /** The pack that ends the zone: its leader and who stands with it. */
  finale: { leader: string; with: string[] }
  /** A side clearing with a secret chest. */
  secret?: boolean
}

export const ZONES: Readonly<Record<ZoneId, ZoneDef>> = {
  plains: {
    id: 'plains', theme: 'plains', min: 1, max: 3, sections: 3, pack: [2, 3],
    kinds: [{ kind: 'goblin', w: 5 }, { kind: 'goblinSlinger', w: 2 }, { kind: 'wolf', w: 2 }, { kind: 'bandit', w: 2 }],
    finale: { leader: 'banditChief', with: ['bandit', 'goblinSlinger'] }
  },
  hollows: {
    id: 'hollows', theme: 'cave', min: 3, max: 5, sections: 4, pack: [3, 4],
    kinds: [{ kind: 'goblin', w: 5 }, { kind: 'goblinSlinger', w: 3 }, { kind: 'wolf', w: 2 }],
    finale: { leader: 'goblinKing', with: ['goblin', 'goblin', 'goblinSlinger'] }
  },
  woods: {
    id: 'woods', theme: 'forest', min: 6, max: 8, sections: 4, pack: [3, 4],
    kinds: [{ kind: 'spider', w: 4 }, { kind: 'treant', w: 2 }, { kind: 'wolf', w: 2 }, { kind: 'bandit', w: 2 }],
    finale: { leader: 'elderTreant', with: ['spider', 'spider', 'treant'] }
  },
  outskirts: {
    id: 'outskirts', theme: 'farm', min: 8, max: 10, sections: 4, pack: [3, 4],
    kinds: [{ kind: 'bandit', w: 4 }, { kind: 'banditArcher', w: 3 }, { kind: 'outlawCaptain', w: 1 }, { kind: 'spider', w: 1 }],
    finale: { leader: 'warlord', with: ['banditArcher', 'banditArcher', 'bandit'] }
  },
  crags: {
    id: 'crags', theme: 'ash', min: 11, max: 13, sections: 4, pack: [3, 4],
    kinds: [{ kind: 'fireElemental', w: 4 }, { kind: 'cultist', w: 3 }, { kind: 'ironGolem', w: 2 }],
    finale: { leader: 'emberLord', with: ['fireElemental', 'cultist', 'cultist'] }
  },
  mines: {
    id: 'mines', theme: 'mine', min: 13, max: 15, sections: 5, pack: [3, 4],
    kinds: [{ kind: 'ironGolem', w: 3 }, { kind: 'cultist', w: 3 }, { kind: 'spider', w: 2 }, { kind: 'fireElemental', w: 2 }],
    finale: { leader: 'ironColossus', with: ['cultist', 'cultist'] }
  },
  tundra: {
    id: 'tundra', theme: 'snow', min: 16, max: 19, sections: 4, pack: [3, 4],
    kinds: [{ kind: 'frostGiant', w: 3 }, { kind: 'wolf', w: 3 }, { kind: 'necromancer', w: 2 }, { kind: 'skeleton', w: 2 }],
    finale: { leader: 'frostJarl', with: ['frostGiant', 'wolf', 'wolf'] }
  },
  temple: {
    id: 'temple', theme: 'temple', min: 17, max: 20, sections: 4, pack: [3, 5],
    kinds: [{ kind: 'naga', w: 5 }, { kind: 'necromancer', w: 2 }, { kind: 'skeleton', w: 3 }, { kind: 'cultist', w: 1 }],
    finale: { leader: 'nagaOracle', with: ['naga', 'naga'] }
  },
  citadel: {
    id: 'citadel', theme: 'void', min: 21, max: 23, sections: 5, pack: [3, 5],
    kinds: [{ kind: 'voidStalker', w: 4 }, { kind: 'highDemon', w: 3 }, { kind: 'cultist', w: 2 }, { kind: 'necromancer', w: 1 }],
    finale: { leader: 'voidWarden', with: ['voidStalker', 'voidStalker', 'highDemon'] }
  },
  peak: {
    id: 'peak', theme: 'peak', min: 24, max: 25, sections: 4, pack: [3, 4],
    kinds: [{ kind: 'wyvern', w: 4 }, { kind: 'highDemon', w: 2 }, { kind: 'fireElemental', w: 2 }, { kind: 'voidStalker', w: 1 }],
    finale: { leader: 'voidDragon', with: [] }
  },
  fortress: {
    id: 'fortress', theme: 'fortress', min: 26, max: 30, sections: 5, pack: [4, 5], secret: true,
    kinds: [{ kind: 'highDemon', w: 3 }, { kind: 'imp', w: 4 }, { kind: 'doomKnight', w: 1 }, { kind: 'necromancer', w: 2 }, { kind: 'voidStalker', w: 2 }],
    finale: { leader: 'archDemon', with: ['doomKnight'] }
  },
  rift: {
    id: 'rift', theme: 'rift', min: 30, max: 30, sections: 3, pack: [4, 6],
    kinds: [{ kind: 'voidling', w: 5 }, { kind: 'voidStalker', w: 3 }, { kind: 'doomKnight', w: 1 }, { kind: 'highDemon', w: 2 }],
    finale: { leader: 'voidLord', with: [] }
  }
}

export const ZONE_IDS = Object.keys(ZONES) as ZoneId[]

// ─── What a visit can hold beside its packs (roadmap #54–#59) ────────────────

/** What fills a zone's rivers and ponds. All of them are walked AROUND; the
 *  look and the warning differ (lava glows, snow water is rimmed with ice). */
export type LiquidId = 'water' | 'ice' | 'lava' | 'pool' | 'void'

/**
 * The limits a visit's seed chooses inside, so the woods are not the same wood
 * twice and still stay the woods: every number is a chance per visit (0..1)
 * unless it says otherwise.
 */
export interface ZoneFeatures {
  /** null: a dry zone (no river, no pond). */
  liquid: LiquidId | null
  /** A river across the road, bridged where the road meets it. */
  river: number
  /** Ponds inside the clearings: the most a visit has, and the chance of each. */
  ponds: number
  pond: number
  /** A side lagoon with a chest on its islet, reached over stepping stones. */
  lagoon: number
  /** A winding passage to a cave chamber. */
  cave: number
  /** Pressure plates of the zone's puzzle (0: this zone has none) and the
   *  chance a visit holds it. */
  plates: 0 | 3 | 4
  puzzle: number
  /** A side corner with one guard and a chest. */
  corner: number
  /** The optional champion: an elite several levels above the zone. */
  champion: number
  championKind: string
  championLevels: [number, number]
  /** Side chests per visit, the finale's chest not counted. */
  chests: [number, number]
}

export const ZONE_FEATURES: Readonly<Record<ZoneId, ZoneFeatures>> = {
  plains: { liquid: 'water', river: 0.55, ponds: 2, pond: 0.5, lagoon: 0.3, cave: 0.25, plates: 0, puzzle: 0, corner: 0.5, champion: 0.06, championKind: 'banditChief', championLevels: [3, 4], chests: [1, 2] },
  hollows: { liquid: 'pool', river: 0, ponds: 1, pond: 0.5, lagoon: 0.3, cave: 0.45, plates: 3, puzzle: 0.6, corner: 0.5, champion: 0.08, championKind: 'banditChief', championLevels: [3, 4], chests: [1, 3] },
  woods: { liquid: 'water', river: 0.7, ponds: 2, pond: 0.5, lagoon: 0.4, cave: 0.4, plates: 3, puzzle: 0.55, corner: 0.55, champion: 0.1, championKind: 'broodSpider', championLevels: [3, 5], chests: [2, 3] },
  outskirts: { liquid: 'water', river: 0.6, ponds: 2, pond: 0.45, lagoon: 0.3, cave: 0.2, plates: 0, puzzle: 0, corner: 0.6, champion: 0.1, championKind: 'broodSpider', championLevels: [3, 5], chests: [1, 3] },
  crags: { liquid: 'lava', river: 0.6, ponds: 2, pond: 0.5, lagoon: 0.25, cave: 0.4, plates: 3, puzzle: 0.5, corner: 0.5, champion: 0.1, championKind: 'outlawCaptain', championLevels: [3, 5], chests: [1, 3] },
  mines: { liquid: 'pool', river: 0, ponds: 1, pond: 0.4, lagoon: 0.25, cave: 0.5, plates: 4, puzzle: 0.6, corner: 0.5, champion: 0.1, championKind: 'emberLord', championLevels: [3, 5], chests: [2, 3] },
  tundra: { liquid: 'ice', river: 0.6, ponds: 2, pond: 0.5, lagoon: 0.35, cave: 0.35, plates: 0, puzzle: 0, corner: 0.55, champion: 0.12, championKind: 'doomKnight', championLevels: [3, 4], chests: [1, 3] },
  temple: { liquid: 'water', river: 0.5, ponds: 2, pond: 0.6, lagoon: 0.5, cave: 0.2, plates: 4, puzzle: 0.7, corner: 0.5, champion: 0.12, championKind: 'voidWarden', championLevels: [3, 4], chests: [2, 3] },
  citadel: { liquid: 'void', river: 0.4, ponds: 2, pond: 0.45, lagoon: 0.3, cave: 0.25, plates: 4, puzzle: 0.5, corner: 0.5, champion: 0.12, championKind: 'doomKnight', championLevels: [3, 4], chests: [2, 3] },
  peak: { liquid: 'lava', river: 0.5, ponds: 2, pond: 0.5, lagoon: 0.2, cave: 0.45, plates: 0, puzzle: 0, corner: 0.5, champion: 0.14, championKind: 'voidWarden', championLevels: [3, 4], chests: [1, 3] },
  fortress: { liquid: 'lava', river: 0.4, ponds: 1, pond: 0.4, lagoon: 0, cave: 0.3, plates: 4, puzzle: 0.5, corner: 0.5, champion: 0.14, championKind: 'voidWarden', championLevels: [2, 3], chests: [2, 3] },
  rift: { liquid: 'lava', river: 0.5, ponds: 2, pond: 0.5, lagoon: 0.2, cave: 0.2, plates: 0, puzzle: 0, corner: 0.4, champion: 0.16, championKind: 'doomKnight', championLevels: [2, 3], chests: [1, 2] }
}

/** Waves the colosseum throws before it pays out. */
export const ARENA_WAVES = 8

// ─── The lie of the land (roadmap #57) ───────────────────────────────────────

/**
 * How a zone's ground rises and falls. Heights are cosmetic for the fight
 * (no high-ground bonus, no fall damage); only a ledge's cliff edge changes
 * where a body can walk, and every ledge has a ramp.
 */
export interface ZoneRelief {
  /** Rolling ground everywhere, metres either way: nothing is dead flat. */
  roll: number
  /** Hills and dips across a clearing's outer ring and between clearings
   *  (metres either way); a fight's centre stays moderate. */
  swell: number
  /** How far the road rises or falls from one clearing to the next (metres),
   *  and which way: `up` climbs to the finale, `down` delves, `mixed` both. */
  climb: [number, number]
  trend: 'up' | 'down' | 'mixed'
  /** A ledge in a clearing (a cliff edge with a ramp): the chance per visit,
   *  the most a visit has, and its height in metres. */
  ledge: number
  ledges: number
  step: [number, number]
  /** A raised dais the finale stands on (chance per visit). */
  dais: number
  /** Built terraces: cliffs of dressed stone and ramps of steps. */
  stairs?: boolean
}

export const ZONE_RELIEF: Readonly<Record<ZoneId, ZoneRelief>> = {
  plains: { roll: 0.32, swell: 0.95, climb: [0.2, 0.7], trend: 'mixed', ledge: 0.45, ledges: 1, step: [1.0, 1.3], dais: 0 },
  hollows: { roll: 0.26, swell: 0.6, climb: [0.4, 1.0], trend: 'down', ledge: 0.55, ledges: 2, step: [1.1, 1.5], dais: 0.3 },
  woods: { roll: 0.32, swell: 1.0, climb: [0.3, 0.9], trend: 'mixed', ledge: 0.65, ledges: 1, step: [1.1, 1.4], dais: 0 },
  outskirts: { roll: 0.3, swell: 0.85, climb: [0.2, 0.6], trend: 'mixed', ledge: 0.45, ledges: 1, step: [1.0, 1.3], dais: 0.2 },
  crags: { roll: 0.26, swell: 0.85, climb: [0.6, 1.3], trend: 'up', ledge: 0.65, ledges: 2, step: [1.3, 1.7], dais: 0.4 },
  mines: { roll: 0.16, swell: 0.45, climb: [0.5, 1.1], trend: 'down', ledge: 0.7, ledges: 2, step: [1.2, 1.6], dais: 0.3, stairs: true },
  tundra: { roll: 0.46, swell: 1.15, climb: [0.2, 0.8], trend: 'mixed', ledge: 0.5, ledges: 1, step: [1.1, 1.4], dais: 0.3 },
  temple: { roll: 0.1, swell: 0.35, climb: [0.4, 0.9], trend: 'up', ledge: 0.6, ledges: 2, step: [1.1, 1.4], dais: 0.7, stairs: true },
  citadel: { roll: 0.16, swell: 0.45, climb: [0.4, 1.0], trend: 'up', ledge: 0.6, ledges: 2, step: [1.2, 1.5], dais: 0.6, stairs: true },
  peak: { roll: 0.3, swell: 1.05, climb: [0.9, 1.5], trend: 'up', ledge: 0.7, ledges: 2, step: [1.4, 1.8], dais: 0.5 },
  fortress: { roll: 0.1, swell: 0.3, climb: [0.5, 1.0], trend: 'up', ledge: 0.7, ledges: 2, step: [1.2, 1.5], dais: 0.8, stairs: true },
  rift: { roll: 0.22, swell: 0.75, climb: [0.3, 0.9], trend: 'mixed', ledge: 0.6, ledges: 1, step: [1.2, 1.6], dais: 0.5 }
}

// ─── Towns ───────────────────────────────────────────────────────────────────

export type TownId = 'sunford' | 'oakhaven' | 'ironhold'

export type NpcRole = 'shop' | 'trainer' | 'quest' | 'healer' | 'talk'

/**
 * Where a townsperson spends the day (roadmap #41, #42):
 *   inside  in their house, at work in a furnished room the hero walks into;
 *   porch   just in front of their house (a smith at the anvil before the forge);
 *   yard    in the fenced yard beside their house (a training ground);
 *   street  out in the square or the street, with no house of their own.
 */
export type NpcPlace = 'inside' | 'porch' | 'yard' | 'street'

/** The kinds of house a town is built from (`gfx/houses.ts` draws each, and a
 *  ruin of each). */
export type HouseKind = 'cottage' | 'townhouse' | 'workshop' | 'tavern' | 'hall' | 'chapel'

/** What a townsperson does with the day (their routine, `sim/townLife.ts`). */
export type TownJob =
  | 'smith' | 'merchant' | 'elder' | 'healer' | 'scholar' | 'knight' | 'rogue' | 'noble' | 'alchemist' | 'tinker'
  | 'geo' | 'captain' | 'fence' | 'boss' | 'guard' | 'squire' | 'villager' | 'farmer' | 'child' | 'drinker' | 'survivor' | 'thug'
  | 'miner' | 'keeper' | 'bard'

/** A town's character: what its houses are made of and how they are dressed. */
export type TownStyle = 'rural' | 'mercantile' | 'mountain'

export interface NpcDef {
  id: string
  role: NpcRole
  /** Rig look (see `gfx/rigs/humanoid.ts`). */
  look: string
  /**
   * Where they are, in the town's own 0..1 square: the door of their house
   * (inside, porch, yard), or the spot they keep to (street). People who share
   * a spot never stand in the same world state, and share a house.
   */
  at: [number, number]
  /** Where they spend the day (default: in the street). */
  place?: NpcPlace
  /** The house built for them (default: by role and place). */
  house?: HouseKind
  /** Their routine (default: by look and role). */
  job?: TownJob
  /** Trainers: the class they teach. */
  cls?: ClassId
  /** Shops: what they stock. */
  stock?: { slots: ItemSlot[]; tiers: number[] }
  /** Quest givers: the quest id. */
  quest?: string
  /** Shown only while every flag in `needs` is set and none in `not`. */
  needs?: string[]
  not?: string[]
}

/** A townsperson with no part to play in the story: they make a town feel lived in. */
export interface TownFolkDef {
  id: string
  look: string
  job: TownJob
  /** Where they spend the day, in the town's 0..1 square. */
  at: [number, number]
  /** Kept on a weak device (the others are left out first). */
  lite?: boolean
  needs?: string[]
  not?: string[]
  /** Spends the day in the town's taproom (the keeper, the bard, a patron);
   *  out in the street, at `at`, when the town has no taproom to walk into. */
  inn?: boolean
}

/** A house that is nobody's in particular: a landmark of the town (its tavern). */
export interface TownHouseDef {
  kind: HouseKind
  /** Its door, in the town's 0..1 square. */
  at: [number, number]
  /** Its room is walked into: a tavern's taproom (needs a house four cells deep). */
  inside?: boolean
}

export interface TownDef {
  id: TownId
  /** The theme: a ruined town draws (and sounds) different. */
  theme: ThemeId
  style: TownStyle
  /** The world flag that leaves the town a ruin (its houses burnt, its people few). */
  fallen?: string
  npcs: NpcDef[]
  houses: TownHouseDef[]
  folk: TownFolkDef[]
}

/**
 * World-state flags that change who is where (GDD §3.2). Written by quest
 * choices (`data/quests.ts`):
 *   oakhavenSaved / oakhavenFallen — the Siege's two ends;
 *   goblinPact — the Goblin King was spared and trades;
 *   coreOrder / coreCircle / coreSold — the Ironhold core's three fates;
 *   oracleFreed / oracleSlain; dragonPact / dragonSlain.
 */
export const TOWNS: Readonly<Record<TownId, TownDef>> = {
  // Rural and warm: thatch and timber, gardens, a tavern at the head of the square.
  sunford: {
    id: 'sunford', theme: 'town', style: 'rural',
    npcs: [
      { id: 'sunfordSmith', role: 'shop', look: 'smith', at: [0.2, 0.48], place: 'porch', house: 'workshop', job: 'smith', stock: { slots: ['main', 'off', 'head', 'body', 'hands', 'feet'], tiers: [1] } },
      { id: 'sunfordPeddler', role: 'shop', look: 'peddler', at: [0.6, 0.54], place: 'street', job: 'merchant', stock: { slots: ['trinket'], tiers: [1, 2] } },
      // The knight drills in his yard; the pyromancer keeps to her books.
      { id: 'trainerAegis', role: 'trainer', look: 'trainerAegis', at: [0.2, 0.15], place: 'yard', house: 'hall', cls: 'aegis' },
      { id: 'trainerPyro', role: 'trainer', look: 'trainerPyro', at: [0.8, 0.15], place: 'inside', house: 'hall', cls: 'pyro' },
      { id: 'elderMara', role: 'quest', look: 'elder', at: [0.42, 0.36], place: 'street', job: 'elder', quest: 'goblinKing' },
      { id: 'sunfordHealer', role: 'healer', look: 'healer', at: [0.84, 0.48], place: 'inside', house: 'chapel' },
      // The pact's price and prize: goblins trading rarities in the square.
      { id: 'goblinTrader', role: 'shop', look: 'goblinTrader', at: [0.6, 0.3], place: 'street', job: 'merchant', stock: { slots: ['trinket', 'off'], tiers: [2, 3] }, needs: ['goblinPact'] }
    ],
    houses: [{ kind: 'tavern', at: [0.5, 0.15], inside: true }],
    folk: [
      // The taproom: the keeper behind the bar, patrons at the tables, a bard by the hearth.
      { id: 'innkeeper', look: 'villager', job: 'keeper', at: [0.5, 0.15], inn: true, lite: true },
      { id: 'patronA', look: 'farmer', job: 'drinker', at: [0.5, 0.15], inn: true, lite: true },
      { id: 'patronB', look: 'villagerF', job: 'drinker', at: [0.5, 0.15], inn: true },
      { id: 'patronC', look: 'squire', job: 'drinker', at: [0.5, 0.15], inn: true },
      { id: 'bard', look: 'peddler', job: 'bard', at: [0.5, 0.15], inn: true },
      { id: 'squire', look: 'squire', job: 'squire', at: [0.26, 0.15] },
      { id: 'gossip', look: 'villagerF', job: 'villager', at: [0.4, 0.5], lite: true },
      { id: 'drinker', look: 'villager', job: 'drinker', at: [0.44, 0.24], lite: true },
      { id: 'farmer', look: 'farmer', job: 'farmer', at: [0.3, 0.86] },
      { id: 'washer', look: 'villagerF', job: 'villager', at: [0.72, 0.86], lite: true },
      { id: 'kidA', look: 'child', job: 'child', at: [0.46, 0.62] },
      { id: 'kidB', look: 'childF', job: 'child', at: [0.54, 0.62] }
    ]
  },
  // Bigger and mercantile: two storeys, shop fronts, a fountain, the watch.
  oakhaven: {
    id: 'oakhaven', theme: 'town', style: 'mercantile', fallen: 'oakhavenFallen',
    npcs: [
      { id: 'captainHale', role: 'quest', look: 'captain', at: [0.82, 0.15], place: 'yard', house: 'hall', job: 'captain', quest: 'siege', not: ['oakhavenFallen'] },
      // Defended: a prosperous trade hub with high-tier armourers.
      { id: 'oakArmorer', role: 'shop', look: 'smith', at: [0.12, 0.48], place: 'porch', house: 'workshop', job: 'smith', stock: { slots: ['head', 'body', 'hands', 'feet', 'off'], tiers: [2, 3] }, not: ['oakhavenFallen', 'oakhavenSaved'] },
      { id: 'oakMasterArmorer', role: 'shop', look: 'smith', at: [0.12, 0.48], place: 'porch', house: 'workshop', job: 'smith', stock: { slots: ['head', 'body', 'hands', 'feet', 'off'], tiers: [2, 3, 4, 5] }, needs: ['oakhavenSaved'] },
      { id: 'oakWeapons', role: 'shop', look: 'peddler', at: [0.3, 0.48], place: 'inside', house: 'townhouse', job: 'merchant', stock: { slots: ['main'], tiers: [2, 3] }, not: ['oakhavenFallen'] },
      { id: 'trainerShadow', role: 'trainer', look: 'trainerShadow', at: [0.86, 0.48], place: 'inside', house: 'townhouse', cls: 'shadow' },
      { id: 'trainerSovereign', role: 'trainer', look: 'trainerSovereign', at: [0.5, 0.15], place: 'inside', house: 'hall', cls: 'sovereign', not: ['oakhavenFallen'] },
      { id: 'oakHealer', role: 'healer', look: 'healer', at: [0.18, 0.15], place: 'inside', house: 'chapel', not: ['oakhavenFallen'] },
      // Betrayed: a ruin with a black market, and the alchemist it shelters in
      // what was the healer's chapel.
      { id: 'blackMarket', role: 'shop', look: 'fence', at: [0.36, 0.4], place: 'street', job: 'fence', stock: { slots: ['main', 'trinket'], tiers: [2, 3, 4] }, needs: ['oakhavenFallen'] },
      { id: 'trainerBlood', role: 'trainer', look: 'trainerBlood', at: [0.18, 0.15], place: 'inside', house: 'chapel', cls: 'blood', needs: ['oakhavenFallen'] },
      { id: 'syndicateBoss', role: 'talk', look: 'fence', at: [0.6, 0.42], place: 'street', job: 'boss', needs: ['oakhavenFallen'] }
    ],
    houses: [{ kind: 'tavern', at: [0.78, 0.76], inside: true }],
    folk: [
      // The taproom. After the fall the keeper stays, with two who have nowhere else to go.
      { id: 'innkeeper', look: 'villager', job: 'keeper', at: [0.78, 0.76], inn: true, lite: true },
      { id: 'patronA', look: 'villager', job: 'drinker', at: [0.78, 0.76], inn: true, lite: true, not: ['oakhavenFallen'] },
      { id: 'patronB', look: 'merchantF', job: 'drinker', at: [0.78, 0.76], inn: true, not: ['oakhavenFallen'] },
      { id: 'patronC', look: 'townGuard', job: 'drinker', at: [0.78, 0.76], inn: true, not: ['oakhavenFallen'] },
      { id: 'bard', look: 'peddler', job: 'bard', at: [0.78, 0.76], inn: true, not: ['oakhavenFallen'] },
      { id: 'patronD', look: 'survivor', job: 'drinker', at: [0.78, 0.76], inn: true, lite: true, needs: ['oakhavenFallen'] },
      { id: 'patronE', look: 'villagerF', job: 'drinker', at: [0.78, 0.76], inn: true, needs: ['oakhavenFallen'] },
      { id: 'guardA', look: 'townGuard', job: 'squire', at: [0.88, 0.15], not: ['oakhavenFallen'] },
      { id: 'guardB', look: 'townGuard', job: 'guard', at: [0.5, 0.58], lite: true, not: ['oakhavenFallen'] },
      { id: 'merchantF', look: 'merchantF', job: 'villager', at: [0.42, 0.5], lite: true, not: ['oakhavenFallen'] },
      { id: 'drinker', look: 'villager', job: 'drinker', at: [0.72, 0.86], not: ['oakhavenFallen'] },
      { id: 'kidA', look: 'child', job: 'child', at: [0.44, 0.64], not: ['oakhavenFallen'] },
      { id: 'kidB', look: 'childF', job: 'child', at: [0.56, 0.64], not: ['oakhavenFallen'] },
      // What is left of the town huddles round a fire; the Syndicate's men watch.
      { id: 'survivorA', look: 'survivor', job: 'survivor', at: [0.54, 0.46], lite: true, needs: ['oakhavenFallen'] },
      { id: 'survivorB', look: 'villagerF', job: 'survivor', at: [0.66, 0.46], needs: ['oakhavenFallen'] },
      { id: 'thugA', look: 'syndicate', job: 'thug', at: [0.3, 0.52], lite: true, needs: ['oakhavenFallen'] },
      { id: 'thugB', look: 'syndicate', job: 'thug', at: [0.7, 0.28], needs: ['oakhavenFallen'] }
    ]
  },
  // Mountain stone and slate: forges everywhere, and dwarves at work in them.
  ironhold: {
    id: 'ironhold', theme: 'town', style: 'mountain',
    npcs: [
      { id: 'forgemaster', role: 'quest', look: 'dwarf', at: [0.5, 0.15], place: 'porch', house: 'workshop', job: 'smith', quest: 'core' },
      { id: 'ironWeapons', role: 'shop', look: 'dwarf', at: [0.28, 0.48], place: 'porch', house: 'workshop', job: 'smith', stock: { slots: ['main', 'off'], tiers: [3, 4] }, not: ['coreCircle'] },
      // The Circle's study of the core arms the town with aether-works.
      { id: 'ironAetherWorks', role: 'shop', look: 'tinker', at: [0.28, 0.48], place: 'porch', house: 'workshop', job: 'tinker', stock: { slots: ['main', 'off'], tiers: [3, 4, 5] }, needs: ['coreCircle'] },
      { id: 'ironArmor', role: 'shop', look: 'smith', at: [0.78, 0.48], place: 'porch', house: 'workshop', job: 'smith', stock: { slots: ['head', 'body', 'hands', 'feet', 'trinket'], tiers: [3, 4] }, not: ['coreOrder'] },
      // The Order's thanks: its own armourers move in.
      { id: 'ironOrderArmor', role: 'shop', look: 'smith', at: [0.78, 0.48], place: 'porch', house: 'workshop', job: 'smith', stock: { slots: ['head', 'body', 'hands', 'feet', 'trinket'], tiers: [3, 4, 5] }, needs: ['coreOrder'] },
      { id: 'trainerGeo', role: 'trainer', look: 'trainerGeo', at: [0.18, 0.15], place: 'yard', house: 'hall', cls: 'geo' },
      { id: 'trainerAether', role: 'trainer', look: 'trainerAether', at: [0.82, 0.15], place: 'inside', house: 'hall', cls: 'aether' },
      { id: 'ironHealer', role: 'healer', look: 'healer', at: [0.08, 0.48], place: 'inside', house: 'chapel' },
      // Oakhaven's exiled lord teaches from here once his town has fallen.
      { id: 'exiledSovereign', role: 'trainer', look: 'trainerSovereign', at: [0.8, 0.76], place: 'porch', house: 'townhouse', cls: 'sovereign', needs: ['oakhavenFallen'] }
    ],
    houses: [{ kind: 'tavern', at: [0.22, 0.76] }],
    folk: [
      { id: 'guardA', look: 'dwarfGuard', job: 'squire', at: [0.26, 0.15] },
      { id: 'guardB', look: 'dwarfGuard', job: 'squire', at: [0.14, 0.15], lite: true },
      { id: 'minerA', look: 'miner', job: 'miner', at: [0.38, 0.86], lite: true },
      { id: 'minerB', look: 'miner', job: 'drinker', at: [0.2, 0.86] },
      { id: 'kidA', look: 'child', job: 'child', at: [0.56, 0.62] }
    ]
  }
}

// ─── The map ─────────────────────────────────────────────────────────────────

export type NodeId = ZoneId | TownId | 'arena'

export interface MapNode {
  id: NodeId
  kind: 'zone' | 'town' | 'arena'
  /** Position on the parchment, 0..1 (x right, y down). */
  at: [number, number]
  links: NodeId[]
  /** Needs these flags as well as a cleared neighbour. */
  needs?: string[]
  /** A hidden trainer found here once the zone is cleared, unless a flag moved them. */
  trainer?: { cls: ClassId; npc: string; needs?: string[]; not?: string[] }
  /** The major quest resolved by this zone's finale. */
  quest?: string
}

export const MAP: readonly MapNode[] = [
  { id: 'sunford', kind: 'town', at: [0.125, 0.735], links: ['plains', 'arena'] },
  { id: 'plains', kind: 'zone', at: [0.265, 0.625], links: ['sunford', 'hollows', 'woods'] },
  { id: 'hollows', kind: 'zone', at: [0.125, 0.455], links: ['plains', 'arena'], quest: 'goblinKing' },
  { id: 'arena', kind: 'arena', at: [0.315, 0.835], links: ['sunford', 'hollows'], needs: ['arenaOpen'] },
  { id: 'woods', kind: 'zone', at: [0.415, 0.525], links: ['plains', 'outskirts', 'crags'] },
  { id: 'outskirts', kind: 'zone', at: [0.555, 0.67], links: ['woods', 'oakhaven'], quest: 'siege' },
  { id: 'oakhaven', kind: 'town', at: [0.695, 0.795], links: ['outskirts'] },
  { id: 'crags', kind: 'zone', at: [0.5, 0.345], links: ['woods', 'mines', 'tundra'] },
  { id: 'mines', kind: 'zone', at: [0.345, 0.25], links: ['crags', 'ironhold'], quest: 'core' },
  { id: 'ironhold', kind: 'town', at: [0.2, 0.175], links: ['mines'] },
  { id: 'tundra', kind: 'zone', at: [0.66, 0.29], links: ['crags', 'temple', 'citadel'] },
  {
    id: 'temple', kind: 'zone', at: [0.815, 0.52], links: ['tundra', 'citadel'], quest: 'oracle',
    trainer: { cls: 'chrono', npc: 'trainerChrono', not: ['oracleSlain'] }
  },
  {
    id: 'citadel', kind: 'zone', at: [0.8, 0.235], links: ['tundra', 'temple', 'peak', 'fortress'],
    // The alchemist the Syndicate would have sheltered hides here instead —
    // and the oracle's keeper of hours, should the oracle have been slain.
    trainer: { cls: 'blood', npc: 'trainerBlood', not: ['oakhavenFallen'] }
  },
  { id: 'peak', kind: 'zone', at: [0.6, 0.112], links: ['citadel', 'fortress'], quest: 'dragon' },
  { id: 'fortress', kind: 'zone', at: [0.905, 0.12], links: ['citadel', 'peak', 'rift'], quest: 'throne' },
  { id: 'rift', kind: 'zone', at: [0.925, 0.37], links: ['fortress'], needs: ['throneDone'] }
]

export const NODE_BY_ID: Readonly<Record<string, MapNode>> = Object.fromEntries(MAP.map(n => [n.id, n]))

/** A second hidden trainer: with the oracle slain, the Chrono-Weaver's last
 *  pupil is found in the Citadel instead of the temple. */
export const FALLBACK_TRAINERS: ReadonlyArray<{ node: NodeId; cls: ClassId; npc: string; needs: string[] }> = [
  { node: 'peak', cls: 'chrono', npc: 'trainerChrono', needs: ['oracleSlain'] }
]

/** The hidden trainer a cleared node holds for this world state, if any. */
export const hiddenTrainerOf = (node: NodeId, cleared: ReadonlySet<string>, flags: ReadonlySet<string>): { cls: ClassId; npc: string } | null => {
  if (!cleared.has(node)) return null
  const t = NODE_BY_ID[node]?.trainer
  if (t && (!t.needs || t.needs.every(f => flags.has(f))) && (!t.not || !t.not.some(f => flags.has(f)))) return { cls: t.cls, npc: t.npc }
  const fb = FALLBACK_TRAINERS.find(f => f.node === node && f.needs.every(x => flags.has(x)))
  return fb ? { cls: fb.cls, npc: fb.npc } : null
}

/** A town's people as the world's flags leave them. */
export const townNpcs = (town: TownId, flags: ReadonlySet<string>): NpcDef[] =>
  TOWNS[town].npcs.filter(n => (!n.needs || n.needs.every(f => flags.has(f))) && !(n.not && n.not.some(f => flags.has(f))))

/** Is a node open, given the cleared nodes and the world flags? */
export const nodeOpen = (id: NodeId, cleared: ReadonlySet<string>, flags: ReadonlySet<string>): boolean => {
  const n = NODE_BY_ID[id]
  if (!n) return false
  if (n.needs && !n.needs.every(f => flags.has(f))) return false
  if (id === 'sunford' || id === 'plains') return true
  return n.links.some(l => cleared.has(l))
}

/** Danger skulls: how far above the hero a zone's enemies start. */
export const dangerOf = (zone: ZoneDef, heroLevel: number): 0 | 1 | 2 | 3 => {
  const gap = zone.min - heroLevel
  return gap <= 0 ? 0 : gap <= 2 ? 1 : gap <= 5 ? 2 : 3
}

/** The enemy level of a visit: the hero's own, held inside the zone's band. */
export const visitLevel = (zone: ZoneDef, heroLevel: number): number =>
  Math.max(zone.min, Math.min(zone.max, heroLevel))
