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
  // The secret four (#86), each found through its master's test in Silverbridge
  | 'windrunner' | 'frostwarden' | 'lightbringer' | 'beastcaller'
  // The four of #95, taught openly in Silverbridge
  | 'elementalist' | 'soulwarden' | 'ironmonk' | 'bard'

/** The classes in play, in the skills page's order. A new class joins the
 *  list in the phase that gives it its skills (#86, #95). */
export const CLASS_IDS: readonly ClassId[] = [
  'aegis', 'shadow', 'pyro', 'sovereign', 'chrono', 'blood', 'aether', 'geo'
]

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
  geo: { id: 'geo', faction: 'none', color: '#c79a5a', novel: true },
  windrunner: { id: 'windrunner', faction: 'none', color: '#c4f05a', novel: true },
  frostwarden: { id: 'frostwarden', faction: 'circle', color: '#a8d8ff', novel: true },
  lightbringer: { id: 'lightbringer', faction: 'order', color: '#ffa8c8', novel: true },
  beastcaller: { id: 'beastcaller', faction: 'none', color: '#4fb85a', novel: true },
  elementalist: { id: 'elementalist', faction: 'circle', color: '#e86bff', novel: true },
  soulwarden: { id: 'soulwarden', faction: 'none', color: '#7f9cff', novel: true },
  ironmonk: { id: 'ironmonk', faction: 'order', color: '#5fd08a', novel: true },
  bard: { id: 'bard', faction: 'syndicate', color: '#ff8ad8', novel: true }
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
  A('shieldThrow', 'aegis', 10, { str: 15, end: 10 }, 9, 12, 'enemy', 10, 'str', { dmg: 100, bounces: 3, jump: 6, weak: 25, dur: 4 }, { cast: 0.2 }),
  A('tauntingCry', 'aegis', 12, { str: 16, end: 14 }, 15, 14, 'self', 0, 'end', { dur: 5, def: 40, radius: 8 }, { radius: 8, cast: 0.3 }),
  A('shieldShove', 'aegis', 14, { str: 18, end: 14 }, 10, 12, 'dir', 5, 'str', { dmg: 150, cone: 100 }, { radius: 5, cast: 0.12 }),
  A('holyChains', 'aegis', 17, { end: 22, str: 16 }, 16, 18, 'self', 0, 'end', { dmg: 120, radius: 7, slow: 30, dur: 2 }, { radius: 7, cast: 0.3 }),
  A('holyBastion', 'aegis', 20, { str: 25, end: 20 }, 45, 30, 'self', 0, 'end', { dur: 4, reflect: 50 }, { cast: 0.15 }),
  P('bulwark', 'aegis', 23, { end: 28, str: 20 }, 'end', { block: 0.15, reflectOnBlock: 50 }, { block: 15, back: 50 }),
  A('retribution', 'aegis', 27, { str: 33, end: 26 }, 40, 35, 'self', 0, 'str', { dur: 4, def: 50, radius: 8, dmg: 300, back: 150, cap: 600 }, { radius: 8, cast: 0.3 }),
  P('unbreakable', 'aegis', 29, { end: 35, str: 26 }, 'end', { lastStand: 0.25 }, { hp: 30, reduce: 25 }),
  // ── 5.2 Shadowblade ───────────────────────────────────────────────────────
  A('shadowstep', 'shadow', 1, { dex: 5 }, 5, 8, 'enemy', 9, 'dex', { dmg: 150 }, { cast: 0.08 }),
  P('lethality', 'shadow', 3, { dex: 8, skl: 6 }, 'dex', { critChance: 0.15, critDamage: 0.3 }, { crit: 15, critDmg: 30 }),
  A('starFan', 'shadow', 4, { dex: 9 }, 5, 7, 'dir', 10, 'dex', { stars: 3, dmg: 70, spread: 30 }, { cast: 0.12 }),
  A('venomousBlade', 'shadow', 6, { dex: 12 }, 10, 10, 'self', 0, 'dex', { dur: 8, poison: 40, over: 4, stacks: 5 }, { cast: 0.15 }),
  P('evasion', 'shadow', 9, { dex: 15 }, 'dex', { dodge: 0.2, evasionHaste: 0.3 }, { dodge: 20, haste: 30, dur: 2 }),
  A('grapplingHook', 'shadow', 11, { dex: 16, skl: 10 }, 10, 10, 'enemy', 11, 'dex', { dmg: 110, slow: 40, dur: 3 }, { cast: 0.15 }),
  A('smokeBomb', 'shadow', 14, { dex: 18, skl: 12 }, 20, 14, 'self', 0, 'dex', { dur: 4, bonus: 100 }, { cast: 0.1 }),
  P('silentStrike', 'shadow', 16, { dex: 21, skl: 14 }, 'dex', { backstab: 0.35, stealthy: 0.3 }, { backstab: 35, notice: 30 }),
  A('shadowMark', 'shadow', 18, { dex: 23, skl: 16 }, 14, 12, 'enemy', 12, 'dex', { vuln: 25, bonus: 50, dur: 6 }, { cast: 0.1 }),
  A('danceOfBlades', 'shadow', 22, { dex: 28, skl: 22 }, 35, 30, 'self', 0, 'dex', { hits: 8, dmg: 300, dur: 1.5, radius: 10 }, { radius: 10, cast: 0.1 }),
  P('bladeRhythm', 'shadow', 25, { dex: 30, skl: 24 }, 'skl', { critCooldown: 0.5, attackSpeed: 0.1 }, { cut: 0.5, speed: 10 }),
  A('nightshadeMist', 'shadow', 28, { dex: 34, skl: 28 }, 30, 32, 'ground', 10, 'dex', { dmg: 400, dur: 6, radius: 4.5, confuse: 2.5 }, { radius: 4.5, cast: 0.25 }),
  // ── 5.3 Pyromancer ────────────────────────────────────────────────────────
  A('fireball', 'pyro', 1, { int: 5 }, 3, 7, 'enemy', 11, 'int', { dmg: 140, radius: 2.2, burn: 40, burnDur: 4 }, { radius: 2.2, fire: true }),
  P('cauterize', 'pyro', 4, { int: 9 }, 'int', { cauterize: 0.15 }, { reduce: 15 }),
  A('flamePillar', 'pyro', 7, { int: 13 }, 10, 14, 'ground', 10, 'int', { dmg: 220, dur: 3, radius: 2.2, airborne: 1 }, { radius: 2.2, fire: true }),
  A('firecracker', 'pyro', 9, { int: 15 }, 7, 10, 'enemy', 11, 'int', { dmg: 190, delay: 2, radius: 3, burn: 40, burnDur: 4 }, { radius: 3, fire: true }),
  P('pyromaniac', 'pyro', 11, { int: 17, skl: 10 }, 'int', { pyromaniac: 1.5 }, { cut: 1.5 }),
  A('fanTheFlames', 'pyro', 13, { int: 18, skl: 8 }, 14, 14, 'self', 0, 'int', { pct: 50, radius: 8, push: 3 }, { radius: 8, fire: true, cast: 0.2 }),
  A('combustion', 'pyro', 16, { int: 22 }, 16, 18, 'self', 0, 'int', { pct: 100, radius: 9, blast: 2.5 }, { radius: 9, fire: true, cast: 0.3 }),
  A('ringOfFire', 'pyro', 19, { int: 24, skl: 12 }, 20, 22, 'ground', 10, 'int', { dmg: 260, dur: 5, radius: 4.5, flames: 10, slow: 30 }, { radius: 4.5, fire: true, cast: 0.3 }),
  P('everflame', 'pyro', 21, { int: 26 }, 'int', { igniteBonus: 0.3, spellCrit: 0.05 }, { burn: 30, crit: 5 }),
  A('cataclysm', 'pyro', 24, { int: 30 }, 40, 40, 'self', 0, 'int', { dmg: 450, dur: 6, meteors: 12, radius: 3 }, { radius: 14, fire: true, cast: 0.5 }),
  P('wildfire', 'pyro', 26, { int: 32, skl: 18 }, 'int', { wildfire: 3.5 }, { radius: 3.5, dur: 3 }),
  A('phoenixFlight', 'pyro', 29, { int: 36 }, 45, 40, 'ground', 12, 'int', { dmg: 480, radius: 4, burn: 60, burnDur: 5, regen: 4, dur: 5 }, { radius: 4, fire: true, cast: 0.3 }),
  // ── 5.4 Grand Sovereign ───────────────────────────────────────────────────
  A('royalGuard', 'sovereign', 1, { cha: 5 }, 12, 12, 'self', 0, 'cha', { dmg: 50, max: 2 }, { cast: 0.3 }),
  P('inspiringPresence', 'sovereign', 3, { cha: 8 }, 'cha', { minionAttackSpeed: 0.25, minionHp: 0.2 }, { speed: 25, hp: 20 }),
  A('commandFocus', 'sovereign', 6, { cha: 11 }, 6, 6, 'enemy', 14, 'cha', { dur: 4, move: 100, atk: 50 }, { cast: 0.1 }),
  A('callArchers', 'sovereign', 8, { cha: 13 }, 12, 12, 'self', 0, 'cha', { dmg: 55, max: 2 }, { cast: 0.3 }),
  P('sovereignsTribute', 'sovereign', 10, { cha: 15, end: 10 }, 'cha', { tribute: 0.15 }, { share: 15 }),
  A('royalRally', 'sovereign', 12, { cha: 17, end: 10 }, 18, 16, 'self', 0, 'cha', { heal: 35, def: 40, dur: 6, radius: 2.2 }, { cast: 0.25 }),
  A('bannerOfVictory', 'sovereign', 15, { cha: 20 }, 22, 20, 'ground', 8, 'cha', { dmg: 35, regen: 5, dur: 10, radius: 5 }, { radius: 5 }),
  P('warMarshal', 'sovereign', 18, { cha: 23 }, 'cha', { minionDamage: 0.3 }, { dmg: 30 }),
  A('royalDecree', 'sovereign', 20, { cha: 25, end: 14 }, 24, 22, 'self', 0, 'cha', { stun: 1.5, vuln: 25, dur: 6, radius: 7 }, { radius: 7, cast: 0.35 }),
  P('loyalHearts', 'sovereign', 23, { cha: 28, end: 18 }, 'cha', { loyalty: 0.06 }, { heal: 6 }),
  A('armyOfTheRealm', 'sovereign', 25, { cha: 30 }, 50, 40, 'self', 0, 'cha', { archers: 2, guards: 2, mages: 1, dur: 20 }, { cast: 0.5 }),
  A('summonChampion', 'sovereign', 29, { cha: 36 }, 60, 45, 'self', 0, 'cha', { dmg: 140, hp: 150, dur: 25 }, { cast: 0.5 }),
  // ── 5.5 Chrono-Weaver ─────────────────────────────────────────────────────
  A('temporalStasis', 'chrono', 1, { int: 5, skl: 5 }, 10, 10, 'enemy', 10, 'int', { dur: 3.5 }),
  A('echoBolt', 'chrono', 2, { int: 7 }, 4, 7, 'enemy', 11, 'int', { dmg: 100, echo: 60, delay: 1.5 }, { cast: 0.15 }),
  A('hasteField', 'chrono', 4, { skl: 9, int: 7 }, 14, 12, 'self', 0, 'skl', { dur: 6, move: 40, speed: 30, radius: 4 }, { radius: 4 }),
  P('foresight', 'chrono', 6, { skl: 11, int: 8 }, 'skl', { dodge: 0.1, cdr: 0.08 }, { dodge: 10, cdr: 8 }),
  P('timeDistort', 'chrono', 8, { int: 13, skl: 11 }, 'int', { timeDistort: 0.3 }, { share: 30, over: 6 }),
  A('timeBubble', 'chrono', 10, { int: 15, skl: 12 }, 14, 16, 'ground', 10, 'int', { dmg: 80, slow: 50, dur: 5, radius: 3.5 }, { radius: 3.5 }),
  A('paradoxShift', 'chrono', 13, { int: 18, skl: 14 }, 18, 16, 'enemy', 12, 'int', { dmg: 160, confuse: 3, radius: 4 }, { radius: 4, cast: 0.12 }),
  A('timeLoop', 'chrono', 16, { int: 21, skl: 17 }, 16, 18, 'enemy', 11, 'int', { dmg: 140, echo: 50, dur: 3 }, { cast: 0.15 }),
  P('entropy', 'chrono', 18, { skl: 24, int: 18 }, 'skl', { entropy: 0.03 }, { cdr: 3, stacks: 10 }),
  P('frozenMoment', 'chrono', 22, { skl: 27, int: 22 }, 'skl', { freezeOnHit: 0.12 }, { chance: 12, dur: 1.5 }),
  A('chronoRewind', 'chrono', 25, { int: 30, skl: 25 }, 40, 0, 'self', 0, 'int', { back: 4 }, { cast: 0.05 }),
  A('timeStop', 'chrono', 28, { int: 34, skl: 28 }, 60, 45, 'self', 0, 'int', { dmg: 400, dur: 3, radius: 12 }, { radius: 12, cast: 0.5 }),
  // ── 5.6 Blood Alchemist ───────────────────────────────────────────────────
  A('sanguineFlask', 'blood', 1, { end: 5 }, 4, 0, 'ground', 9, 'end', { hp: 10, dmg: 160, shred: 15, shredDur: 5, radius: 2.5 }, { hpCost: 10, radius: 2.5 }),
  P('bloodTransmutation', 'blood', 4, { end: 8, int: 7 }, 'end', { bloodToMana: 0.1 }, { share: 10 }),
  A('essenceWard', 'blood', 5, { end: 10 }, 14, 0, 'self', 0, 'end', { hp: 15, shield: 200, dur: 6 }, { hpCost: 15, cast: 0.15 }),
  A('essenceHarvest', 'blood', 7, { end: 12, int: 10 }, 8, 10, 'self', 0, 'int', { dmg: 120, heal: 50, radius: 6 }, { radius: 6, cast: 0.3 }),
  P('vitalReserve', 'blood', 9, { end: 14 }, 'end', { maxHpPct: 0.12, hpRegen: 2 }, { hp: 12, regen: 2 }),
  A('enfeeblingTonic', 'blood', 11, { int: 15, end: 12 }, 9, 6, 'ground', 9, 'int', { hp: 8, dmg: 170, weak: 25, dur: 5, radius: 3 }, { hpCost: 8, radius: 3 }),
  P('hemophilia', 'blood', 12, { end: 16 }, 'end', { lifeDrainPct: 0.4, bleedHeal: 0.03 }, { drain: 40, heal: 3 }),
  A('homunculus', 'blood', 15, { end: 20, int: 14 }, 20, 10, 'ground', 5, 'end', { hp: 15, dur: 20, back: 50 }, { hpCost: 15, cast: 0.35 }),
  A('mutagenicRage', 'blood', 17, { end: 22, str: 16 }, 25, 0, 'self', 0, 'end', { hp: 25, speed: 60, steal: 20, move: 30, dur: 10 }, { hpCost: 25, cast: 0.25 }),
  P('adrenalCatalyst', 'blood', 20, { end: 25, str: 16 }, 'end', { lowHealthDamage: 0.3 }, { dmg: 30, low: 30 }),
  A('philosophersCrucible', 'blood', 24, { end: 30, int: 22 }, 45, 30, 'self', 0, 'int', { dmg: 200, dur: 8, radius: 4.5 }, { radius: 4.5, cast: 0.4 }),
  A('grandTransmutation', 'blood', 28, { end: 34, int: 28 }, 60, 45, 'self', 0, 'int', { pct: 25, cap: 600, heal: 40, radius: 10 }, { radius: 10, cast: 0.5 }),
  // ── 5.7 Aether-Tech ───────────────────────────────────────────────────────
  A('aetherPistol', 'aether', 1, { skl: 5 }, 2, 3, 'enemy', 12, 'skl', { dmg: 110, heat: 10 }, { heat: 10, cast: 0.1 }),
  A('deployTurret', 'aether', 4, { skl: 9, int: 6 }, 12, 14, 'ground', 6, 'skl', { dmg: 45, dur: 10, max: 2 }, { cast: 0.3 }),
  A('rocketJump', 'aether', 6, { skl: 11 }, 10, 6, 'ground', 7, 'skl', { dmg: 140, heat: 25, radius: 2.5 }, { heat: 25, radius: 2.5, cast: 0.15 }),
  A('ventHeat', 'aether', 8, { skl: 12 }, 10, 0, 'dir', 6.5, 'skl', { dmg: 250, cone: 60 }, { radius: 6.5, fire: true }),
  P('coolantLoop', 'aether', 10, { skl: 15 }, 'skl', { heatDissipation: 0.4, heatBuildCut: 0.15 }, { cool: 40, cut: 15 }),
  P('thermalOverload', 'aether', 13, { skl: 17, int: 12 }, 'skl', { overheatCrit: 1 }, { lock: 5, crit: 100 }),
  A('shockGrenade', 'aether', 15, { skl: 20, int: 14 }, 14, 12, 'ground', 10, 'skl', { dmg: 160, stun: 1.5, heat: 20, radius: 2.8 }, { heat: 20, radius: 2.8 }),
  P('precisionOptics', 'aether', 17, { skl: 22, int: 15 }, 'skl', { critChance: 0.08, pierce: 1 }, { crit: 8, pierce: 1 }),
  A('orbitalBeam', 'aether', 19, { skl: 24, int: 18 }, 30, 26, 'ground', 12, 'skl', { dmg: 400, dur: 4, radius: 2.6 }, { radius: 2.6, cast: 0.5 }),
  A('arcCoil', 'aether', 22, { skl: 28, int: 21 }, 8, 14, 'enemy', 10, 'skl', { dmg: 150, jumps: 4, chain: 5, heat: 15 }, { heat: 15, cast: 0.15 }),
  A('exoSuit', 'aether', 26, { skl: 32 }, 50, 35, 'self', 0, 'skl', { dur: 15, armor: 50, rocket: 120 }, { cast: 0.4 }),
  P('thermalPlating', 'aether', 29, { skl: 34, int: 26 }, 'skl', { heatArmor: 0.2 }, { heat: 50, reduce: 20 }),
  // ── 5.8 Geomancer ─────────────────────────────────────────────────────────
  A('stoneSpike', 'geo', 1, { str: 5, int: 5 }, 4, 7, 'enemy', 9, 'str', { dmg: 130, slow: 40, dur: 3 }),
  A('boulderRoll', 'geo', 3, { str: 8, int: 5 }, 7, 9, 'dir', 10, 'str', { dmg: 140, down: 0.8 }, { cast: 0.3 }),
  A('earthBarrier', 'geo', 5, { str: 10 }, 12, 12, 'ground', 8, 'str', { dur: 6, cells: 5 }, { radius: 3 }),
  P('bedrock', 'geo', 7, { str: 11, end: 8 }, 'str', { knockbackImmune: 1, maxHpPct: 0.08 }, { hp: 8 }),
  A('seismicShock', 'geo', 9, { str: 14, int: 10 }, 11, 14, 'self', 0, 'str', { dmg: 180, radius: 5.5, down: 1.5 }, { radius: 5.5, cast: 0.35 }),
  A('sinkhole', 'geo', 12, { str: 17, int: 12 }, 16, 16, 'ground', 9, 'str', { dmg: 220, dur: 2, radius: 3.5, slow: 40, down: 1.2 }, { radius: 3.5 }),
  P('earthenSkin', 'geo', 14, { str: 18, end: 14 }, 'str', { armorFromStr: 0.25, stunDurationCut: 0.5 }, { armor: 25, cut: 50 }),
  P('mountainBreaker', 'geo', 17, { str: 22, int: 16 }, 'str', { bossDamage: 0.2, armorPct: 0.1 }, { boss: 20, armor: 10 }),
  A('petrify', 'geo', 20, { int: 25, str: 20 }, 22, 18, 'enemy', 10, 'int', { dur: 5, vuln: 30 }),
  A('geodeShell', 'geo', 23, { str: 28, int: 22 }, 24, 22, 'self', 0, 'str', { shield: 30, dur: 6, dmg: 300, radius: 5 }, { radius: 5, cast: 0.2 }),
  A('tectonicRupture', 'geo', 26, { str: 30, int: 25 }, 40, 40, 'self', 0, 'str', { dmg: 500, dur: 5, rubble: 8 }, { radius: 16, cast: 0.6 }),
  P('crumble', 'geo', 29, { str: 34, int: 26 }, 'str', { crumble: 0.2 }, { dmg: 20 })
]

export const SKILL_BY_ID: Readonly<Record<string, SkillDef>> = Object.fromEntries(SKILLS.map(s => [s.id, s]))

export const skillsOf = (cls: ClassId): SkillDef[] => SKILLS.filter(s => s.cls === cls)

/** The bar's slots (roadmap #95): eight actives, four passives. */
export const ACTIVE_SLOTS = 8
export const PASSIVE_SLOTS = 4

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
