import type { Attr, AttrBlock } from '../data/attributes'
import type { Mods } from '../data/mods'

/**
 * ─── Simulation types ────────────────────────────────────────────────────────
 *
 * Plain data. The sim is framework-free (no three.js, no Vue, no DOM), so it
 * runs unchanged in the game, in Vitest and in a Node balance script. The view
 * reads units and drains `events`; it never writes back.
 */

/** 0 = the hero's side (hero, minions, turrets), 1 = everything hostile. */
export type Team = 0 | 1

export type DamageType =
  | 'physical' | 'pierce'
  | 'fire' | 'frost' | 'holy' | 'poison' | 'acid' | 'temporal' | 'beam' | 'shadow' | 'blood'
  /** Ignores armour and resistance (reflected damage, delayed Time Distort). */
  | 'true'

export const isPhysical = (t: DamageType): boolean => t === 'physical' || t === 'pierce'

export type Rank = 'hero' | 'minion' | 'turret' | 'npc' | 'weak' | 'normal' | 'elite' | 'boss'

export interface UnitStats {
  maxHp: number
  maxMana: number
  hpRegen: number
  manaRegen: number
  armor: number
  /** Elemental resistance, 0..0.7. */
  resist: number
  block: number
  dodge: number
  /** Flat share taken off all / physical damage. */
  damageReduction: number
  physReduction: number
  /** Share taken off stun-like durations. */
  stunResist: number
  /** Effective attribute totals (the hero's; zero for everything else). */
  power: AttrBlock
  /** What a "100 %" hit of this unit deals when it has no attributes. */
  baseDmg: number
  critChance: number
  critMult: number
  spellCrit: number
  /** Attack / cast speed multiplier (1 = the weapon's own interval). */
  attackSpeed: number
  /** Metres per second. */
  moveSpeed: number
  cdr: number
  lifesteal: number
  physLifesteal: number
  damageMul: number
  manaDiscount: number
  // The basic attack
  atkScale: Attr
  atkStyle: 'melee' | 'ranged' | 'magic'
  atkType: DamageType
  atkRange: number
  atkInterval: number
  atkHeavy: boolean
  /** Chance of an off-hand follow-up strike. */
  dual: number
  /** The summed modifier bag (unique item and passive effects). */
  mods: Mods
}

// ─── Statuses ────────────────────────────────────────────────────────────────

export type StatusId =
  // Control (the unit cannot act)
  | 'stun' | 'knockup' | 'knockdown' | 'stasis' | 'petrify' | 'frozen' | 'fear'
  // Impairment
  | 'slow' | 'confuse' | 'taunt' | 'armorShred' | 'weaken' | 'vulnerable'
  // Damage over time
  | 'burn' | 'poison' | 'bleed' | 'delayed'
  // Good
  | 'haste' | 'attackSpeed' | 'damageUp' | 'defenseUp' | 'regen' | 'lifestealUp' | 'invulnerable' | 'unkillable'
  | 'stealth' | 'reflect' | 'envenom' | 'exosuit' | 'focus' | 'accelerate' | 'overheat' | 'enrage' | 'ambush'

export interface Status {
  id: StatusId
  /** Seconds left. */
  t: number
  /** The duration it was applied with (for the HUD ring). */
  dur: number
  /** Magnitude: a fraction (slow 0.4), a DPS (burn), a count (poison stacks). */
  v: number
  /** Stack count for the stacking ones (poison, accelerate). */
  n: number
  /** Who applied it (unit id; 0 = the world). */
  src: number
  /** A DoT's damage type. */
  type?: DamageType
  /** Seconds until the next damage tick. */
  tick?: number
}

/** A status the unit cannot act under. */
export const HARD_CC: ReadonlySet<StatusId> = new Set<StatusId>(['stun', 'knockup', 'knockdown', 'stasis', 'petrify', 'frozen', 'fear'])

// ─── Units ───────────────────────────────────────────────────────────────────

/** What the unit is doing, as far as the view's animation cares. */
export type AnimState = 'idle' | 'walk' | 'attack' | 'cast' | 'hit' | 'stun' | 'dead' | 'channel' | 'spawn'

/** An action in progress: a basic swing or an ability, wind-up to release. */
export interface Action {
  /** 'attack' for the basic swing, else an ability / skill id. */
  id: string
  /** Seconds since it began, and when its effect lands. */
  t: number
  hitAt: number
  /** When the unit may act again. */
  end: number
  done: boolean
  targetId: number
  /** Aim point (ground skills, telegraphed slams). */
  x: number
  z: number
  /** Where the unit stood when it began (leaps travel from here). */
  sx: number
  sz: number
  /** Direction it was aimed in, radians. */
  a: number
  /** Index into the unit's ability list (-1: hero skill or basic attack). */
  ability: number
  /** Hero skill slot (-1: not one). */
  slot: number
}

export type AiState = 'idle' | 'chase' | 'act' | 'recover' | 'flee' | 'follow' | 'leash'

export interface Unit {
  id: number
  /** Enemy / minion kind id, or 'hero'. */
  kind: string
  team: Team
  rank: Rank
  level: number
  x: number
  z: number
  /** Position at the previous step (render interpolation). */
  px: number
  pz: number
  /** Velocity of the last step, m/s (animation, camera lead). */
  vx: number
  vz: number
  /** Heading, radians: 0 faces +Z (toward the camera), atan2(dx, dz). */
  facing: number
  /** Collision radius and height (metres). */
  r: number
  h: number
  hp: number
  mana: number
  /** Damage-absorbing shield and its seconds left. */
  shield: number
  shieldT: number
  alive: boolean
  /** Seconds since death (the view fades the body, the sim removes it). */
  deadT: number
  s: UnitStats
  statuses: Status[]
  // Orders and movement
  targetId: number
  hasGoal: boolean
  goalX: number
  goalZ: number
  path: number[]
  pathI: number
  repathT: number
  /** Basic-attack cooldown, seconds until the next swing may start. */
  attackCd: number
  action: Action | null
  /** Ability cooldowns (enemies, minions), by ability index. */
  cds: number[]
  // AI
  ai: AiState
  aiT: number
  homeX: number
  homeZ: number
  /** Encounter group (-1: none). Waking one member wakes the group. */
  group: number
  awake: boolean
  /** Summons: the owner's id, and seconds of life left (< 0: no limit). */
  ownerId: number
  life: number
  /** Knockback velocity, decaying. */
  kx: number
  kz: number
  // View hints
  anim: AnimState
  animT: number
  /** Which attack / cast pose (the ability's `pose`). */
  animStyle: number
  /** 1 when just hit, decaying: the flinch and the white flash. */
  flinch: number
  /** Counts attacks made (every Nth shot effects, combo poses). */
  swings: number
  /** Boss: the phase it is in. */
  phase: number
  /** NPCs: their role id (shop, trainer, quest giver). */
  npc?: string
  /** Fortitude / fatal-save style internal cooldowns, by name. */
  icd: Record<string, number>
}

// ─── Projectiles and ground fields ───────────────────────────────────────────

export interface Projectile {
  active: boolean
  /** Visual id (the view picks the mesh / trail by it). */
  fx: string
  team: Team
  srcId: number
  x: number
  z: number
  y: number
  vx: number
  vz: number
  /** Homing target (0: flies straight). */
  targetId: number
  speed: number
  r: number
  life: number
  dmg: number
  type: DamageType
  crit: boolean
  /** Explodes with this radius on impact (0: single target). */
  aoe: number
  /** Extra enemies it may pass through. */
  pierce: number
  /** Unit ids already hit (piercing shots hit each once). */
  hit: number[]
  /** Status applied on hit. */
  status?: { id: StatusId; dur: number; v: number; type?: DamageType }
  /** An arcing lob: flight time and total time, landing at (tx, tz). */
  lob: number
  lobT: number
  tx: number
  tz: number
  /** Skill id that fired it (hooks: Pyromaniac, burns). */
  skill: string
  /** A basic weapon shot: the hero's on-hit effects apply. */
  basic: boolean
  /** A spell (spell crit, Pyromaniac). */
  spell: boolean
  heavy: boolean
  color: string
}

/** A lingering area on the ground: a fire pillar, a banner, a crucible. */
export interface Field {
  active: boolean
  fx: string
  team: Team
  srcId: number
  x: number
  z: number
  r: number
  t: number
  dur: number
  /** Seconds between ticks and until the next one. */
  every: number
  next: number
  /** Damage per tick to the other team (0: none). */
  dmg: number
  type: DamageType
  /** What it does besides damage (handled in `fields.ts`). */
  kind: 'damage' | 'haste' | 'banner' | 'crucible' | 'beam' | 'burnGround' | 'poison' | 'heal' | 'web'
  v: number
  skill: string
  color: string
}

/** A temporary wall of solid cells (Earth Barrier, Tectonic rubble). */
export interface TempWall {
  cells: number[]
  t: number
  dur: number
  fx: string
}

/** A warning the view draws on the ground before an attack lands. */
export interface Telegraph {
  shape: 'circle' | 'cone' | 'line'
  x: number
  z: number
  /** Radius (circle, cone) or length (line). */
  r: number
  /** Cone half-angle (radians) or line half-width (metres). */
  w: number
  /** Direction for cones and lines. */
  a: number
  dur: number
  team: Team
}

// ─── Events (sim → view) ─────────────────────────────────────────────────────

export type SimEvent =
  | { t: 'hit'; src: number; tgt: number; x: number; z: number; h: number; amount: number; crit: boolean; type: DamageType; heavy: boolean; toHero: boolean; killed: boolean }
  | { t: 'miss'; tgt: number; x: number; z: number; h: number; why: 'dodge' | 'block' | 'immune' }
  | { t: 'heal'; tgt: number; x: number; z: number; h: number; amount: number }
  | { t: 'mana'; tgt: number; x: number; z: number; h: number; amount: number }
  | { t: 'status'; tgt: number; id: StatusId; x: number; z: number; h: number }
  | { t: 'swing'; src: number; style: 'melee' | 'ranged' | 'magic'; heavy: boolean }
  | { t: 'cast'; src: number; skill: string; x: number; z: number; tx: number; tz: number }
  /** A one-shot visual: `id` names the effect, the rest place it. */
  | { t: 'fx'; id: string; x: number; z: number; x2?: number; z2?: number; r?: number; dur?: number; a?: number; color?: string; unit?: number }
  | { t: 'tele'; tele: Telegraph }
  | { t: 'death'; unit: number; x: number; z: number; kind: string; rank: Rank; team: Team }
  | { t: 'spawn'; unit: number }
  | { t: 'wall'; cells: number[]; on: boolean; fx: string }
  | { t: 'loot'; x: number; z: number; gold: number; item: string }
  | { t: 'xp'; amount: number }
  | { t: 'levelUp'; level: number }
  | { t: 'awake'; group: number; boss: string }
  | { t: 'groupDone'; done: number; total: number }
  | { t: 'wave'; n: number }
  | { t: 'bossPhase'; unit: number; phase: number }
  | { t: 'overheat'; on: boolean }
  | { t: 'denied'; why: 'mana' | 'cooldown' | 'range' | 'target' | 'locked' | 'hp' }
  | { t: 'potion' }
  | { t: 'victory' }
  | { t: 'defeat' }

export type { Attr, Mods }
