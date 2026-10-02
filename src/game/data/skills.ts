import type { Attr, AttrBlock } from './attributes'
import type { Mods } from './mods'
import { skillPrice } from './progression'

/**
 * ─── Classes and skills (GDD §5) ─────────────────────────────────────────────
 *
 * Eight classes, six skills each, exactly as the GDD tables them: level and
 * attribute requirements, cooldowns and every percentage. The numbers live in
 * `p` (parameters), which serves two readers: the sim (`sim/heroSkills.ts`
 * reads `p.dmg`, `p.stun`…) and the tooltips (the i18n description of a skill
 * interpolates the same values, so a balance change never leaves a stale
 * number in 39 languages).
 *
 * What the GDD leaves open is filled here and marked: mana costs (the GDD
 * names mana as a resource but tables none), cast ranges and radii.
 */

export type ClassId = 'aegis' | 'shadow' | 'pyro' | 'sovereign' | 'chrono' | 'blood' | 'aether' | 'geo'

export const CLASS_IDS: readonly ClassId[] = ['aegis', 'shadow', 'pyro', 'sovereign', 'chrono', 'blood', 'aether', 'geo']

/** How a skill is aimed. */
export type TargetMode =
  /** Needs an enemy: the locked one, else the nearest in range. */
  | 'enemy'
  /** A point on the ground: where the button was dragged to, else the target's feet. */
  | 'ground'
  /** No aim: around or on the hero. */
  | 'self'
  /** A direction from the hero: toward the drag point, else the target. */
  | 'dir'

export interface SkillDef {
  id: string
  cls: ClassId
  kind: 'active' | 'passive'
  /** Level requirement. */
  level: number
  /** Attribute thresholds. */
  req: Partial<AttrBlock>
  /** Seconds. 0 for a passive. */
  cd: number
  /** Mana cost. */
  mana: number
  /** Cost in % of CURRENT health (Blood Alchemist). */
  hpCost?: number
  /** Heat generated, 0..100 (Aether-Tech). */
  heat?: number
  target: TargetMode
  /** Cast range in metres (0: self). The hero walks into range first. */
  range: number
  /** Area radius in metres, for the aim preview. */
  radius?: number
  /** Wind-up before the effect lands, seconds. */
  cast: number
  /** The attribute its damage scales with (the tooltip's colour). */
  scales: Attr
  /** Passive modifiers (see `data/mods.ts`). */
  mods?: Mods
  /** The table's numbers. Percentages are whole numbers (120 = 120 %). */
  p: Record<string, number>
  /** Signature colour (icon frame, VFX tint). */
  color: string
  /** Fire skills: Pyromaniac shortens their cooldowns. */
  fire?: boolean
}

export interface ClassDef {
  id: ClassId
  /** The faction that teaches it (reputation discounts its trainer). */
  faction: 'order' | 'syndicate' | 'circle' | 'none'
  color: string
  /** GDD §5: a reimagined classic or a novel archetype. */
  novel: boolean
}

export const CLASSES: Record<ClassId, ClassDef> = {
  aegis: { id: 'aegis', faction: 'order', color: '#ffd84a', novel: false },
  shadow: { id: 'shadow', faction: 'syndicate', color: '#9c7bff', novel: false },
  pyro: { id: 'pyro', faction: 'circle', color: '#ff7a3a', novel: false },
  sovereign: { id: 'sovereign', faction: 'order', color: '#ffb04a', novel: false },
  chrono: { id: 'chrono', faction: 'circle', color: '#5fd8ff', novel: true },
  blood: { id: 'blood', faction: 'syndicate', color: '#ff4a6a', novel: true },
  aether: { id: 'aether', faction: 'circle', color: '#4ff0c8', novel: true },
  geo: { id: 'geo', faction: 'none', color: '#c79a5a', novel: true }
}

const A = (
  id: string, cls: ClassId, level: number, req: Partial<AttrBlock>, cd: number, mana: number,
  target: TargetMode, range: number, scales: Attr, p: Record<string, number>, extra: Partial<SkillDef> = {}
): SkillDef => ({
  id, cls, kind: 'active', level, req, cd, mana, target, range, cast: 0.22, scales, p, color: CLASSES[cls].color, ...extra
})

const P = (
  id: string, cls: ClassId, level: number, req: Partial<AttrBlock>, scales: Attr, mods: Mods, p: Record<string, number>
): SkillDef => ({
  id, cls, kind: 'passive', level, req, cd: 0, mana: 0, target: 'self', range: 0, cast: 0, scales, mods, p, color: CLASSES[cls].color
})

/** Melee reach of a targeted strike (metres, centre to centre past the radii). */
const MELEE = 2.4

export const SKILLS: readonly SkillDef[] = [
  // ── 5.1 Aegis Knight ──────────────────────────────────────────────────────
  A('shieldSlam', 'aegis', 1, { str: 5 }, 6, 8, 'enemy', MELEE, 'str', { dmg: 120, stun: 2 }),
  P('aegisAura', 'aegis', 3, { str: 8, end: 6 }, 'end', { armorPct: 0.2, physReduction: 0.1 }, { armor: 20, reduce: 10 }),
  A('radiantStrike', 'aegis', 5, { str: 10, int: 8 }, 8, 12, 'enemy', MELEE, 'str', { dmg: 180, heal: 30 }),
  P('fortitude', 'aegis', 8, { end: 12 }, 'end', { fortitude: 0.2 }, { hit: 15, shield: 20, dur: 5, icd: 20 }),
  A('tauntingCry', 'aegis', 12, { str: 16, end: 14 }, 15, 14, 'self', 0, 'end', { dur: 5, def: 40, radius: 8 }, { radius: 8, cast: 0.3 }),
  A('holyBastion', 'aegis', 20, { str: 25, end: 20 }, 45, 30, 'self', 0, 'end', { dur: 4, reflect: 50 }, { cast: 0.15 }),

  // ── 5.2 Shadowblade ───────────────────────────────────────────────────────
  A('shadowstep', 'shadow', 1, { dex: 5 }, 5, 8, 'enemy', 9, 'dex', { dmg: 150 }, { cast: 0.08 }),
  P('lethality', 'shadow', 3, { dex: 8, skl: 6 }, 'dex', { critChance: 0.15, critDamage: 0.3 }, { crit: 15, critDmg: 30 }),
  A('venomousBlade', 'shadow', 6, { dex: 12 }, 10, 10, 'self', 0, 'dex', { dur: 8, poison: 40, over: 4, stacks: 5 }, { cast: 0.15 }),
  P('evasion', 'shadow', 9, { dex: 15 }, 'dex', { dodge: 0.2, evasionHaste: 0.3 }, { dodge: 20, haste: 30, dur: 2 }),
  A('smokeBomb', 'shadow', 14, { dex: 18, skl: 12 }, 20, 14, 'self', 0, 'dex', { dur: 4, bonus: 100 }, { cast: 0.1 }),
  A('danceOfBlades', 'shadow', 22, { dex: 28, skl: 22 }, 35, 30, 'self', 0, 'dex', { hits: 8, dmg: 300, dur: 1.5, radius: 10 }, { radius: 10, cast: 0.1 }),

  // ── 5.3 Pyromancer ────────────────────────────────────────────────────────
  A('fireball', 'pyro', 1, { int: 5 }, 3, 7, 'enemy', 11, 'int', { dmg: 140, radius: 2.2, burn: 40, burnDur: 4 }, { radius: 2.2, fire: true }),
  P('cauterize', 'pyro', 4, { int: 9 }, 'int', { cauterize: 0.15 }, { reduce: 15 }),
  A('flamePillar', 'pyro', 7, { int: 13 }, 10, 14, 'ground', 10, 'int', { dmg: 220, dur: 3, radius: 2.2, airborne: 1 }, { radius: 2.2, fire: true }),
  P('pyromaniac', 'pyro', 11, { int: 17, skl: 10 }, 'int', { pyromaniac: 1.5 }, { cut: 1.5 }),
  A('combustion', 'pyro', 16, { int: 22 }, 16, 18, 'self', 0, 'int', { pct: 100, radius: 9, blast: 2.5 }, { radius: 9, fire: true, cast: 0.3 }),
  A('cataclysm', 'pyro', 24, { int: 30 }, 40, 40, 'self', 0, 'int', { dmg: 450, dur: 6, meteors: 12, radius: 3 }, { radius: 14, fire: true, cast: 0.5 }),

  // ── 5.4 Grand Sovereign ───────────────────────────────────────────────────
  A('royalGuard', 'sovereign', 1, { cha: 5 }, 12, 12, 'self', 0, 'cha', { dmg: 50, max: 2 }, { cast: 0.3 }),
  P('inspiringPresence', 'sovereign', 3, { cha: 8 }, 'cha', { minionAttackSpeed: 0.25, minionHp: 0.2 }, { speed: 25, hp: 20 }),
  A('commandFocus', 'sovereign', 6, { cha: 11 }, 6, 6, 'enemy', 14, 'cha', { dur: 4, move: 100, atk: 50 }, { cast: 0.1 }),
  P('sovereignsTribute', 'sovereign', 10, { cha: 15, end: 10 }, 'cha', { tribute: 0.15 }, { share: 15 }),
  A('bannerOfVictory', 'sovereign', 15, { cha: 20 }, 22, 20, 'ground', 8, 'cha', { dmg: 35, regen: 5, dur: 10, radius: 5 }, { radius: 5 }),
  A('armyOfTheRealm', 'sovereign', 25, { cha: 30 }, 50, 40, 'self', 0, 'cha', { archers: 2, guards: 2, mages: 1, dur: 20 }, { cast: 0.5 }),

  // ── 5.5 Chrono-Weaver ─────────────────────────────────────────────────────
  A('temporalStasis', 'chrono', 1, { int: 5, skl: 5 }, 10, 10, 'enemy', 10, 'int', { dur: 3.5 }),
  A('hasteField', 'chrono', 4, { skl: 9, int: 7 }, 14, 12, 'self', 0, 'skl', { dur: 6, move: 40, speed: 30, radius: 4 }, { radius: 4 }),
  P('timeDistort', 'chrono', 8, { int: 13, skl: 11 }, 'int', { timeDistort: 0.3 }, { share: 30, over: 6 }),
  A('paradoxShift', 'chrono', 13, { int: 18, skl: 14 }, 18, 16, 'enemy', 12, 'int', { dmg: 160, confuse: 3, radius: 4 }, { radius: 4, cast: 0.12 }),
  P('entropy', 'chrono', 18, { skl: 24, int: 18 }, 'skl', { entropy: 0.03 }, { cdr: 3, stacks: 10 }),
  A('chronoRewind', 'chrono', 25, { int: 30, skl: 25 }, 40, 0, 'self', 0, 'int', { back: 4 }, { cast: 0.05 }),

  // ── 5.6 Blood Alchemist ───────────────────────────────────────────────────
  A('sanguineFlask', 'blood', 1, { end: 5 }, 4, 0, 'ground', 9, 'end', { hp: 10, dmg: 160, shred: 15, shredDur: 5, radius: 2.5 }, { hpCost: 10, radius: 2.5 }),
  P('bloodTransmutation', 'blood', 4, { end: 8, int: 7 }, 'end', { bloodToMana: 0.1 }, { share: 10 }),
  A('essenceHarvest', 'blood', 7, { end: 12, int: 10 }, 8, 10, 'self', 0, 'int', { dmg: 120, heal: 50, radius: 6 }, { radius: 6, cast: 0.3 }),
  P('hemophilia', 'blood', 12, { end: 16 }, 'end', { lifeDrainPct: 0.4, bleedHeal: 0.03 }, { drain: 40, heal: 3 }),
  A('mutagenicRage', 'blood', 17, { end: 22, str: 16 }, 25, 0, 'self', 0, 'end', { hp: 25, speed: 60, steal: 20, move: 30, dur: 10 }, { hpCost: 25, cast: 0.25 }),
  A('philosophersCrucible', 'blood', 24, { end: 30, int: 22 }, 45, 30, 'self', 0, 'int', { dmg: 200, dur: 8, radius: 4.5 }, { radius: 4.5, cast: 0.4 }),

  // ── 5.7 Aether-Tech ───────────────────────────────────────────────────────
  A('aetherPistol', 'aether', 1, { skl: 5 }, 2, 3, 'enemy', 12, 'skl', { dmg: 110, heat: 10 }, { heat: 10, cast: 0.1 }),
  A('deployTurret', 'aether', 4, { skl: 9, int: 6 }, 12, 14, 'ground', 6, 'skl', { dmg: 45, dur: 10, max: 2 }, { cast: 0.3 }),
  A('ventHeat', 'aether', 8, { skl: 12 }, 10, 0, 'dir', 6.5, 'skl', { dmg: 250, cone: 60 }, { radius: 6.5, fire: true }),
  P('thermalOverload', 'aether', 13, { skl: 17, int: 12 }, 'skl', { overheatCrit: 1 }, { lock: 5, crit: 100 }),
  A('orbitalBeam', 'aether', 19, { skl: 24, int: 18 }, 30, 26, 'ground', 12, 'skl', { dmg: 400, dur: 4, radius: 2.6 }, { radius: 2.6, cast: 0.5 }),
  A('exoSuit', 'aether', 26, { skl: 32 }, 50, 35, 'self', 0, 'skl', { dur: 15, armor: 50, rocket: 120 }, { cast: 0.4 }),

  // ── 5.8 Geomancer ─────────────────────────────────────────────────────────
  A('stoneSpike', 'geo', 1, { str: 5, int: 5 }, 4, 7, 'enemy', 9, 'str', { dmg: 130, slow: 40, dur: 3 }),
  A('earthBarrier', 'geo', 5, { str: 10 }, 12, 12, 'ground', 8, 'str', { dur: 6, cells: 5 }, { radius: 3 }),
  A('seismicShock', 'geo', 9, { str: 14, int: 10 }, 11, 14, 'self', 0, 'str', { dmg: 180, radius: 5.5, down: 1.5 }, { radius: 5.5, cast: 0.35 }),
  P('earthenSkin', 'geo', 14, { str: 18, end: 14 }, 'str', { armorFromStr: 0.25, stunDurationCut: 0.5 }, { armor: 25, cut: 50 }),
  A('petrify', 'geo', 20, { int: 25, str: 20 }, 22, 18, 'enemy', 10, 'int', { dur: 5, vuln: 30 }),
  A('tectonicRupture', 'geo', 26, { str: 30, int: 25 }, 40, 40, 'self', 0, 'str', { dmg: 500, dur: 5, rubble: 8 }, { radius: 16, cast: 0.6 })
]

export const SKILL_BY_ID: Readonly<Record<string, SkillDef>> = Object.fromEntries(SKILLS.map(s => [s.id, s]))

export const skillsOf = (cls: ClassId): SkillDef[] => SKILLS.filter(s => s.cls === cls)

export const ACTIVE_SLOTS = 6
export const PASSIVE_SLOTS = 3

/** Does a hero of this level and these attribute totals meet a skill's bars? */
export const meetsSkill = (s: SkillDef, level: number, attrs: AttrBlock): boolean => {
  if (level < s.level) return false
  for (const k in s.req) {
    const a = k as Attr
    if (attrs[a] < (s.req[a] ?? 0)) return false
  }
  return true
}

/** What its trainer charges (before the Charisma discount). */
export const priceOf = (s: SkillDef): number => skillPrice(s.level)

/** Heat a full gauge holds, and how fast it drains per second. */
export const HEAT_MAX = 100
export const HEAT_DECAY = 9
export const OVERHEAT_LOCK = 5
