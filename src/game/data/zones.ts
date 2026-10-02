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
  { id: 'sunford', kind: 'town', at: [0.13, 0.8], links: ['plains', 'arena'] },
  { id: 'plains', kind: 'zone', at: [0.27, 0.69], links: ['sunford', 'hollows', 'woods'] },
  { id: 'hollows', kind: 'zone', at: [0.15, 0.53], links: ['plains', 'arena'], quest: 'goblinKing' },
  { id: 'arena', kind: 'arena', at: [0.33, 0.88], links: ['sunford', 'hollows'], needs: ['arenaOpen'] },
  { id: 'woods', kind: 'zone', at: [0.41, 0.58], links: ['plains', 'outskirts', 'crags'] },
  { id: 'outskirts', kind: 'zone', at: [0.55, 0.7], links: ['woods', 'oakhaven'], quest: 'siege' },
  { id: 'oakhaven', kind: 'town', at: [0.68, 0.82], links: ['outskirts'] },
  { id: 'crags', kind: 'zone', at: [0.49, 0.41], links: ['woods', 'mines', 'tundra'] },
  { id: 'mines', kind: 'zone', at: [0.35, 0.31], links: ['crags', 'ironhold'], quest: 'core' },
  { id: 'ironhold', kind: 'town', at: [0.22, 0.22], links: ['mines'] },
  { id: 'tundra', kind: 'zone', at: [0.64, 0.31], links: ['crags', 'temple', 'citadel'] },
  {
    id: 'temple', kind: 'zone', at: [0.79, 0.47], links: ['tundra', 'citadel'], quest: 'oracle',
    trainer: { cls: 'chrono', npc: 'trainerChrono', not: ['oracleSlain'] }
  },
  {
    id: 'citadel', kind: 'zone', at: [0.8, 0.22], links: ['tundra', 'temple', 'peak', 'fortress'],
    // The alchemist the Syndicate would have sheltered hides here instead —
    // and the oracle's keeper of hours, should the oracle have been slain.
    trainer: { cls: 'blood', npc: 'trainerBlood', not: ['oakhavenFallen'] }
  },
  { id: 'peak', kind: 'zone', at: [0.62, 0.1], links: ['citadel', 'fortress'], quest: 'dragon' },
  { id: 'fortress', kind: 'zone', at: [0.9, 0.08], links: ['citadel', 'peak', 'rift'], quest: 'throne' },
  { id: 'rift', kind: 'zone', at: [0.93, 0.32], links: ['fortress'], needs: ['throneDone'] }
]

export const NODE_BY_ID: Readonly<Record<string, MapNode>> = Object.fromEntries(MAP.map(n => [n.id, n]))

/** A second hidden trainer: with the oracle slain, the Chrono-Weaver's last
 *  pupil is found in the Citadel instead of the temple. */
export const FALLBACK_TRAINERS: ReadonlyArray<{ node: NodeId; cls: ClassId; npc: string; needs: string[] }> = [
  { node: 'peak', cls: 'chrono', npc: 'trainerChrono', needs: ['oracleSlain'] }
]

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
