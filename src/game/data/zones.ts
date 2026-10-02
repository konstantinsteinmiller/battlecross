import type { ClassId } from './skills'
import type { ZoneId } from './items'

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

// ─── Towns ───────────────────────────────────────────────────────────────────

export type TownId = 'sunford' | 'oakhaven' | 'ironhold'

export type NpcRole = 'shop' | 'trainer' | 'quest' | 'healer' | 'talk'

export interface NpcDef {
  id: string
  role: NpcRole
  /** Rig look (see `gfx/rigs/humanoid.ts`). */
  look: string
  /** Where it stands, in the town's own 0..1 square. */
  at: [number, number]
  /** Trainers: the class they teach. */
  cls?: ClassId
  /** Shops: what they stock. */
  stock?: { slots: Array<'main' | 'off' | 'body' | 'trinket'>; tiers: number[] }
  /** Quest givers: the quest id. */
  quest?: string
  /** Shown only while every flag in `needs` is set and none in `not`. */
  needs?: string[]
  not?: string[]
}

export interface TownDef {
  id: TownId
  /** The theme: a ruined town draws (and sounds) different. */
  theme: ThemeId
  npcs: NpcDef[]
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
  sunford: {
    id: 'sunford', theme: 'town',
    npcs: [
      { id: 'sunfordSmith', role: 'shop', look: 'smith', at: [0.24, 0.38], stock: { slots: ['main', 'off', 'body'], tiers: [1] } },
      { id: 'sunfordPeddler', role: 'shop', look: 'peddler', at: [0.74, 0.62], stock: { slots: ['trinket'], tiers: [1, 2] } },
      { id: 'trainerAegis', role: 'trainer', look: 'trainerAegis', at: [0.36, 0.2], cls: 'aegis' },
      { id: 'trainerPyro', role: 'trainer', look: 'trainerPyro', at: [0.68, 0.24], cls: 'pyro' },
      { id: 'elderMara', role: 'quest', look: 'elder', at: [0.5, 0.42], quest: 'goblinKing' },
      { id: 'sunfordHealer', role: 'healer', look: 'healer', at: [0.2, 0.68] },
      // The pact's price and prize: goblins trading rarities in the square.
      { id: 'goblinTrader', role: 'shop', look: 'goblinTrader', at: [0.82, 0.36], stock: { slots: ['trinket', 'off'], tiers: [2, 3] }, needs: ['goblinPact'] }
    ]
  },
  oakhaven: {
    id: 'oakhaven', theme: 'town',
    npcs: [
      { id: 'captainHale', role: 'quest', look: 'captain', at: [0.5, 0.36], quest: 'siege', not: ['oakhavenFallen'] },
      // Defended: a prosperous trade hub with high-tier armourers.
      { id: 'oakArmorer', role: 'shop', look: 'smith', at: [0.26, 0.4], stock: { slots: ['body', 'off'], tiers: [2, 3] }, not: ['oakhavenFallen', 'oakhavenSaved'] },
      { id: 'oakMasterArmorer', role: 'shop', look: 'smith', at: [0.26, 0.4], stock: { slots: ['body', 'off'], tiers: [2, 3, 4, 5] }, needs: ['oakhavenSaved'] },
      { id: 'oakWeapons', role: 'shop', look: 'peddler', at: [0.74, 0.44], stock: { slots: ['main'], tiers: [2, 3] }, not: ['oakhavenFallen'] },
      { id: 'trainerShadow', role: 'trainer', look: 'trainerShadow', at: [0.8, 0.7], cls: 'shadow' },
      { id: 'trainerSovereign', role: 'trainer', look: 'trainerSovereign', at: [0.5, 0.18], cls: 'sovereign', not: ['oakhavenFallen'] },
      { id: 'oakHealer', role: 'healer', look: 'healer', at: [0.2, 0.7], not: ['oakhavenFallen'] },
      // Betrayed: a ruin with a black market, and the alchemist it shelters.
      { id: 'blackMarket', role: 'shop', look: 'fence', at: [0.3, 0.46], stock: { slots: ['main', 'trinket'], tiers: [2, 3, 4] }, needs: ['oakhavenFallen'] },
      { id: 'trainerBlood', role: 'trainer', look: 'trainerBlood', at: [0.62, 0.3], cls: 'blood', needs: ['oakhavenFallen'] },
      { id: 'syndicateBoss', role: 'talk', look: 'fence', at: [0.5, 0.5], needs: ['oakhavenFallen'] }
    ]
  },
  ironhold: {
    id: 'ironhold', theme: 'town',
    npcs: [
      { id: 'forgemaster', role: 'quest', look: 'dwarf', at: [0.5, 0.36], quest: 'core' },
      { id: 'ironWeapons', role: 'shop', look: 'dwarf', at: [0.26, 0.42], stock: { slots: ['main', 'off'], tiers: [3, 4] }, not: ['coreCircle'] },
      // The Circle's study of the core arms the town with aether-works.
      { id: 'ironAetherWorks', role: 'shop', look: 'tinker', at: [0.26, 0.42], stock: { slots: ['main', 'off'], tiers: [3, 4, 5] }, needs: ['coreCircle'] },
      { id: 'ironArmor', role: 'shop', look: 'smith', at: [0.74, 0.42], stock: { slots: ['body', 'trinket'], tiers: [3, 4] }, not: ['coreOrder'] },
      // The Order's thanks: its own armourers move in.
      { id: 'ironOrderArmor', role: 'shop', look: 'smith', at: [0.74, 0.42], stock: { slots: ['body', 'trinket'], tiers: [3, 4, 5] }, needs: ['coreOrder'] },
      { id: 'trainerGeo', role: 'trainer', look: 'trainerGeo', at: [0.34, 0.2], cls: 'geo' },
      { id: 'trainerAether', role: 'trainer', look: 'trainerAether', at: [0.68, 0.22], cls: 'aether' },
      { id: 'ironHealer', role: 'healer', look: 'healer', at: [0.2, 0.7] },
      // Oakhaven's exiled lord teaches from here once his town has fallen.
      { id: 'exiledSovereign', role: 'trainer', look: 'trainerSovereign', at: [0.8, 0.68], cls: 'sovereign', needs: ['oakhavenFallen'] }
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
