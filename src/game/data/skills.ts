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
  'aegis', 'shadow', 'pyro', 'sovereign', 'chrono', 'blood', 'aether', 'geo',
  'windrunner', 'frostwarden', 'lightbringer', 'beastcaller',
  'elementalist', 'soulwarden', 'ironmonk', 'bard'
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
  /** Share of a skill's table mana cost this class pays (#129). Mana recovery grows
   *  with Intelligence, so a class that does not scale with it pays less. */
  manaCost: number
}

export const CLASSES: Record<ClassId, ClassDef> = {
  aegis: { id: 'aegis', faction: 'order', color: '#ffd84a', novel: false, manaCost: 0.6 },
  shadow: { id: 'shadow', faction: 'syndicate', color: '#9c7bff', novel: false, manaCost: 0.6 },
  pyro: { id: 'pyro', faction: 'circle', color: '#ff7a3a', novel: false, manaCost: 1 },
  sovereign: { id: 'sovereign', faction: 'order', color: '#ffb04a', novel: false, manaCost: 0.6 },
  chrono: { id: 'chrono', faction: 'circle', color: '#5fd8ff', novel: true, manaCost: 1 },
  blood: { id: 'blood', faction: 'syndicate', color: '#ff4a6a', novel: true, manaCost: 0.8 },
  aether: { id: 'aether', faction: 'circle', color: '#4ff0c8', novel: true, manaCost: 0.6 },
  geo: { id: 'geo', faction: 'none', color: '#c79a5a', novel: true, manaCost: 0.6 },
  windrunner: { id: 'windrunner', faction: 'none', color: '#c4f05a', novel: true, manaCost: 0.6 },
  frostwarden: { id: 'frostwarden', faction: 'circle', color: '#a8d8ff', novel: true, manaCost: 0.8 },
  lightbringer: { id: 'lightbringer', faction: 'order', color: '#ffa8c8', novel: true, manaCost: 0.8 },
  beastcaller: { id: 'beastcaller', faction: 'none', color: '#4fb85a', novel: true, manaCost: 0.6 },
  elementalist: { id: 'elementalist', faction: 'circle', color: '#e86bff', novel: true, manaCost: 1 },
  soulwarden: { id: 'soulwarden', faction: 'none', color: '#7f9cff', novel: true, manaCost: 1 },
  ironmonk: { id: 'ironmonk', faction: 'order', color: '#5fd08a', novel: true, manaCost: 0.6 },
  bard: { id: 'bard', faction: 'syndicate', color: '#ff8ad8', novel: true, manaCost: 0.6 }
}

const A = (
  id: string, cls: ClassId, level: number, req: Partial<AttrBlock>, cd: number, mana: number,
  target: TargetMode, range: number, scales: Attr, p: Record<string, number>, extra: Partial<SkillDef> = {}
): SkillDef => ({
  id, cls, kind: 'active', level, req, cd, mana: Math.max(1, Math.round(mana * CLASSES[cls].manaCost)), target, range, cast: 0.22, scales, p, color: CLASSES[cls].color, ...extra
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
  P('crumble', 'geo', 29, { str: 34, int: 26 }, 'str', { crumble: 0.2 }, { dmg: 20 }),

  // ── Windrunner ────────────────────────────────────────────────────────────
  A('galeArrow', 'windrunner', 1, { dex: 5 }, 3, 6, 'enemy', 12, 'dex', { dmg: 105, push: 4 }, { cast: 0.15 }),
  P('fleetfoot', 'windrunner', 3, { dex: 8 }, 'dex', { moveSpeed: 0.1, dodge: 0.08 }, { move: 10, dodge: 8 }),
  A('zephyrDash', 'windrunner', 5, { dex: 10, skl: 6 }, 7, 8, 'dir', 7, 'dex', { dist: 7, move: 30, dur: 2 }, { cast: 0.06 }),
  A('piercingGale', 'windrunner', 7, { dex: 13 }, 9, 12, 'dir', 14, 'dex', { dmg: 135, slow: 35, dur: 2 }, { cast: 0.3 }),
  A('cycloneSnare', 'windrunner', 9, { skl: 13, dex: 11 }, 13, 14, 'ground', 11, 'skl', { dmg: 145, dur: 4, radius: 3 }, { radius: 3 }),
  P('keenEye', 'windrunner', 11, { skl: 16, dex: 12 }, 'skl', { critDamage: 0.25, pierce: 1 }, { critDmg: 25, pierce: 1 }),
  A('updraftLeap', 'windrunner', 13, { dex: 18, skl: 14 }, 15, 14, 'self', 0, 'dex', { dmg: 120, air: 1, radius: 4, leap: 6 }, { radius: 4, cast: 0.1 }),
  P('swiftDraw', 'windrunner', 16, { dex: 22 }, 'dex', { attackSpeed: 0.15, cdr: 0.05 }, { speed: 15, cdr: 5 }),
  A('arrowStorm', 'windrunner', 18, { skl: 24, dex: 18 }, 20, 22, 'ground', 12, 'skl', { dmg: 240, volleys: 8, dur: 2, radius: 3.5, slow: 30 }, { radius: 3.5, cast: 0.35 }),
  A('galeSpirits', 'windrunner', 21, { skl: 27, dex: 20 }, 30, 26, 'self', 0, 'skl', { dur: 8, shots: 10, dmg: 40, move: 25 }, { cast: 0.25 }),
  P('skyHunter', 'windrunner', 24, { dex: 30, skl: 24 }, 'dex', { bossDamage: 0.15, critChance: 0.06 }, { boss: 15, crit: 6 }),
  A('skyrender', 'windrunner', 28, { dex: 34, skl: 28 }, 45, 40, 'dir', 18, 'dex', { dmg: 440, air: 1.2, width: 1.6 }, { cast: 0.6 }),

  // ── Frostwarden ───────────────────────────────────────────────────────────
  A('frostCleave', 'frostwarden', 1, { str: 5 }, 4, 6, 'enemy', MELEE, 'str', { dmg: 155, slow: 30, dur: 2 }),
  A('rimeLance', 'frostwarden', 3, { int: 7, str: 5 }, 5, 8, 'enemy', 11, 'int', { dmg: 170, slow: 40, dur: 3 }, { cast: 0.18 }),
  P('wintersBite', 'frostwarden', 5, { str: 10 }, 'str', { chillOnHit: 0.25 }, { slow: 25, dur: 2 }),
  A('frostArmor', 'frostwarden', 7, { int: 12, str: 9 }, 14, 12, 'self', 0, 'int', { shield: 300, dur: 6, slow: 40, slowDur: 3, radius: 3.5 }, { radius: 3.5, cast: 0.2 }),
  A('glacialCharge', 'frostwarden', 9, { str: 14, int: 10 }, 11, 12, 'enemy', 9, 'str', { dmg: 220, freeze: 1.2, slow: 40, dur: 2 }, { cast: 0.1 }),
  P('frozenHeart', 'frostwarden', 11, { str: 15, end: 10 }, 'str', { maxHpPct: 0.08, damageReduction: 0.06 }, { hp: 8, reduce: 6 }),
  A('rimeField', 'frostwarden', 13, { int: 18, str: 13 }, 16, 16, 'ground', 10, 'int', { dmg: 195, dur: 5, slow: 50, freeze: 1, radius: 3.5 }, { radius: 3.5 }),
  A('frostShatter', 'frostwarden', 16, { str: 22, int: 15 }, 14, 16, 'self', 0, 'str', { dmg: 195, chilled: 50, frozen: 150, radius: 5 }, { radius: 5, cast: 0.3 }),
  P('shatterpoint', 'frostwarden', 19, { str: 24, int: 18 }, 'str', { chillDamage: 0.2 }, { bonus: 20 }),
  A('avalancheLeap', 'frostwarden', 22, { str: 28, int: 20 }, 24, 24, 'ground', 9, 'str', { dmg: 390, down: 1.2, slow: 40, dur: 3, radius: 3.5 }, { radius: 3.5, cast: 0.3 }),
  P('iceborn', 'frostwarden', 25, { str: 30, end: 22 }, 'str', { knockbackImmune: 1, stunDurationCut: 0.3 }, { cut: 30 }),
  A('absoluteZero', 'frostwarden', 28, { int: 34, str: 28 }, 50, 40, 'self', 0, 'int', { dmg: 545, freeze: 3, shield: 400, radius: 10 }, { radius: 10, cast: 0.6 }),

  // ── Lightbringer ──────────────────────────────────────────────────────────
  A('sunbolt', 'lightbringer', 1, { int: 5 }, 3, 6, 'enemy', 11, 'int', { dmg: 120, weaken: 15, dur: 3 }, { cast: 0.18 }),
  A('mendingLight', 'lightbringer', 3, { cha: 7, int: 5 }, 10, 12, 'self', 0, 'cha', { heal: 250, regen: 2, dur: 4 }, { cast: 0.25 }),
  P('kindledHope', 'lightbringer', 5, { cha: 10 }, 'cha', { healPower: 0.2 }, { heal: 20 }),
  A('lanceOfLight', 'lightbringer', 7, { int: 12, cha: 8 }, 9, 12, 'dir', 12, 'int', { dmg: 170, heal: 3, width: 0.9 }, { cast: 0.25 }),
  A('dawnShield', 'lightbringer', 10, { cha: 15, int: 10 }, 15, 14, 'self', 0, 'cha', { shield: 300, dur: 6 }, { cast: 0.15 }),
  P('haloWard', 'lightbringer', 12, { int: 16, cha: 12 }, 'int', { damageReduction: 0.08 }, { reduce: 8 }),
  A('dawnSanctuary', 'lightbringer', 14, { cha: 19, int: 14 }, 20, 20, 'ground', 8, 'cha', { heal: 25, dmg: 160, dur: 8, radius: 4 }, { radius: 4, cast: 0.3 }),
  A('blindingFlash', 'lightbringer', 17, { int: 22, cha: 16 }, 20, 18, 'self', 0, 'int', { fear: 2, weaken: 30, dur: 5, radius: 6 }, { radius: 6, cast: 0.15 }),
  P('guardianLight', 'lightbringer', 20, { cha: 25, int: 18 }, 'cha', { fatalSave: 2 }, { dur: 2, icd: 120 }),
  A('sunfall', 'lightbringer', 22, { int: 28, cha: 20 }, 22, 24, 'enemy', 12, 'int', { dmg: 380, vuln: 20, dur: 5, radius: 2.5 }, { radius: 2.5, cast: 0.3 }),
  P('searingLight', 'lightbringer', 25, { int: 30, cha: 22 }, 'int', { spellCrit: 0.12, critDamage: 0.2 }, { crit: 12, critDmg: 20 }),
  A('haloOfDawn', 'lightbringer', 28, { int: 34, cha: 28 }, 50, 40, 'self', 0, 'int', { dur: 10, dmg: 60, heal: 3, radius: 6 }, { radius: 6, cast: 0.5 }),

  // ── Beastcaller ───────────────────────────────────────────────────────────
  A('callWolf', 'beastcaller', 1, { cha: 5 }, 10, 10, 'self', 0, 'cha', { dmg: 45, max: 2 }, { cast: 0.3 }),
  A('wolfPounce', 'beastcaller', 3, { cha: 8 }, 7, 8, 'enemy', 12, 'cha', { dmg: 110, down: 0.8 }, { cast: 0.1 }),
  P('wildKinship', 'beastcaller', 5, { cha: 10 }, 'cha', { minionHp: 0.25, minionDamage: 0.1 }, { hp: 25, dmg: 10 }),
  A('callHawk', 'beastcaller', 7, { cha: 12, end: 6 }, 16, 14, 'enemy', 14, 'cha', { dmg: 120, vuln: 15, dur: 5, life: 20 }, { cast: 0.2 }),
  A('callBear', 'beastcaller', 10, { cha: 15, end: 10 }, 20, 18, 'self', 0, 'cha', { dmg: 70, max: 1 }, { cast: 0.4 }),
  P('thickHide', 'beastcaller', 12, { end: 16 }, 'end', { maxHpPct: 0.1, hpRegen: 1.5 }, { hp: 10, regen: 1.5 }),
  A('packBond', 'beastcaller', 14, { end: 19, cha: 14 }, 18, 16, 'self', 0, 'end', { regen: 3, def: 30, dur: 6, radius: 10 }, { radius: 10, cast: 0.2 }),
  A('spiritStampede', 'beastcaller', 17, { cha: 22, end: 16 }, 18, 20, 'dir', 12, 'cha', { dmg: 220, down: 1, width: 1.8 }, { cast: 0.35 }),
  P('packTactics', 'beastcaller', 20, { cha: 25, end: 18 }, 'cha', { packDamage: 0.05 }, { bonus: 5, max: 4 }),
  A('alphaHowl', 'beastcaller', 22, { cha: 28, end: 20 }, 28, 24, 'self', 0, 'cha', { dur: 8, rage: 40, heal: 30, fear: 1.5, radius: 8 }, { radius: 8, cast: 0.3 }),
  P('leaderOfThePack', 'beastcaller', 25, { cha: 30, end: 22 }, 'cha', { minionAttackSpeed: 0.2, minionDamage: 0.15 }, { speed: 20, dmg: 15 }),
  A('wildHunt', 'beastcaller', 28, { cha: 34, end: 26 }, 55, 40, 'self', 0, 'cha', { wolves: 3, dur: 12, dmg: 50, move: 30 }, { cast: 0.5 }),

  // ── Elementalist (#95) ────────────────────────────────────────────────────
  A('prismBolt', 'elementalist', 1, { int: 5 }, 2.5, 6, 'enemy', 11, 'int', { dmg: 90, burn: 30, slow: 30, dur: 3 }, { cast: 0.15 }),
  P('elementalHarmony', 'elementalist', 3, { int: 8 }, 'int', { reactionDamage: 0.25 }, { pct: 25 }),
  A('frostLance', 'elementalist', 4, { int: 9 }, 7, 10, 'dir', 10, 'int', { dmg: 110, slow: 40, dur: 3 }, { radius: 0.6 }),
  A('chainSpark', 'elementalist', 7, { int: 12, skl: 8 }, 8, 12, 'enemy', 10, 'int', { dmg: 105, jumps: 4, fall: 15 }, { cast: 0.15 }),
  P('smolderingCore', 'elementalist', 9, { int: 14 }, 'int', { igniteBonus: 0.3, maxMana: 40 }, { burn: 30, mana: 40 }),
  A('rollingBoulder', 'elementalist', 10, { int: 15, skl: 10 }, 10, 14, 'dir', 10, 'int', { dmg: 130, down: 1 }, { radius: 1.2, cast: 0.3 }),
  A('thunderSnow', 'elementalist', 14, { int: 19, skl: 13 }, 16, 18, 'ground', 10, 'int', { dmg: 120, bolt: 70, dur: 5, radius: 3.5 }, { radius: 3.5 }),
  P('spellweave', 'elementalist', 16, { int: 21, skl: 16 }, 'int', { spellCrit: 0.08, manaDiscount: 0.1 }, { crit: 8, mana: 10 }),
  A('prismaticNova', 'elementalist', 18, { int: 23, skl: 17 }, 16, 20, 'self', 0, 'int', { dmg: 135, radius: 7 }, { radius: 7, cast: 0.3 }),
  P('prismaticWard', 'elementalist', 21, { int: 26, end: 14 }, 'end', { damageReduction: 0.08, maxHpPct: 0.12 }, { reduce: 8, hp: 12 }),
  A('frostfireComet', 'elementalist', 23, { int: 28, skl: 21 }, 24, 28, 'ground', 11, 'int', { dmg: 240, radius: 3.2, burn: 40, slow: 40, dur: 4 }, { radius: 3.2, cast: 0.4, fire: true }),
  A('elementalConvergence', 'elementalist', 28, { int: 34, skl: 26 }, 50, 42, 'self', 0, 'int', { dmg: 35, strikes: 12, dur: 6 }, { radius: 12, cast: 0.5 }),

  // ── Soul Warden (#95) ─────────────────────────────────────────────────────
  A('wispBolt', 'soulwarden', 1, { int: 5 }, 3, 6, 'enemy', 11, 'int', { dmg: 130, life: 8 }, { cast: 0.15 }),
  P('kindredSpirits', 'soulwarden', 3, { int: 7, cha: 6 }, 'int', { minionHp: 0.25, minionAttackSpeed: 0.15 }, { hp: 25, speed: 15 }),
  A('callTheFallen', 'soulwarden', 4, { int: 9 }, 12, 14, 'self', 0, 'int', { max: 3, life: 15, radius: 8 }, { radius: 8, cast: 0.35 }),
  A('soulBond', 'soulwarden', 7, { int: 12, cha: 9 }, 14, 16, 'enemy', 9, 'int', { dmg: 160, chance: 15, low: 30, life: 20, fear: 1.5 }, { cast: 0.3 }),
  P('restlessSouls', 'soulwarden', 9, { int: 14, cha: 10 }, 'int', { soulRise: 0.15 }, { chance: 15, life: 10 }),
  A('spiritLantern', 'soulwarden', 11, { int: 16, cha: 11 }, 18, 18, 'ground', 9, 'int', { dmg: 150, heal: 2, dur: 6, radius: 4, life: 12 }, { radius: 4, cast: 0.3 }),
  A('hauntingWail', 'soulwarden', 14, { int: 19, cha: 13 }, 16, 16, 'self', 0, 'int', { dmg: 160, fear: 2, radius: 6 }, { radius: 6, cast: 0.3 }),
  P('wardensVigil', 'soulwarden', 16, { int: 21, end: 14 }, 'int', { minionDamage: 0.2, damageReduction: 0.08 }, { dmg: 20, reduce: 8 }),
  A('releaseSouls', 'soulwarden', 18, { int: 23, cha: 16 }, 14, 14, 'self', 0, 'int', { dmg: 220, heal: 5, radius: 3 }, { radius: 3, cast: 0.25 }),
  P('lanternKeeper', 'soulwarden', 21, { int: 26, cha: 18 }, 'int', { cdr: 0.08, manaDiscount: 0.15 }, { cdr: 8, mana: 15 }),
  A('wispSwarm', 'soulwarden', 23, { int: 28, cha: 20 }, 20, 26, 'ground', 11, 'int', { dmg: 320, wisps: 8, radius: 3.5, life: 10 }, { radius: 3.5, cast: 0.3 }),
  A('processionOfSouls', 'soulwarden', 27, { int: 33, cha: 24 }, 50, 40, 'self', 0, 'int', { dur: 10, atk: 50, life: 15 }, { radius: 12, cast: 0.5 }),

  // ── Iron Monk (#95) ───────────────────────────────────────────────────────
  A('palmStrike', 'ironmonk', 1, { dex: 5 }, 3, 5, 'enemy', MELEE, 'dex', { dmg: 130, chi: 1 }, { cast: 0.12 }),
  P('ironBody', 'ironmonk', 3, { end: 8 }, 'end', { physReduction: 0.08, maxHpPct: 0.1 }, { reduce: 8, hp: 10 }),
  A('flyingKick', 'ironmonk', 4, { dex: 9 }, 8, 9, 'enemy', 8, 'dex', { dmg: 160, path: 60, chi: 1 }, { cast: 0.08 }),
  A('tigerStance', 'ironmonk', 6, { dex: 11 }, 4, 6, 'self', 0, 'dex', { dur: 20, dmg: 20, speed: 20 }, { cast: 0.15 }),
  A('craneStance', 'ironmonk', 8, { end: 12, dex: 8 }, 4, 6, 'self', 0, 'end', { dur: 20, def: 40, regen: 1 }, { cast: 0.15 }),
  P('flowingFists', 'ironmonk', 10, { dex: 15, end: 10 }, 'dex', { chiOnHit: 0.25 }, { chance: 25 }),
  A('hundredFists', 'ironmonk', 12, { dex: 17, end: 11 }, 10, 12, 'enemy', MELEE, 'dex', { hits: 8, dmg: 240, dur: 1.2, chi: 2 }, { cast: 0.1 }),
  A('risingDragon', 'ironmonk', 15, { dex: 20, end: 14 }, 12, 14, 'enemy', MELEE, 'dex', { dmg: 200, per: 50, up: 1 }, { cast: 0.15 }),
  P('cranesGrace', 'ironmonk', 17, { end: 22, dex: 16 }, 'end', { dodge: 0.1, stunDurationCut: 0.3 }, { dodge: 10, cut: 30 }),
  A('whirlwindKick', 'ironmonk', 20, { dex: 25, end: 18 }, 14, 18, 'self', 0, 'dex', { dmg: 260, radius: 4, chi: 3 }, { radius: 4, cast: 0.2 }),
  P('tigersFury', 'ironmonk', 24, { dex: 30, end: 20 }, 'dex', { critChance: 0.08, attackSpeed: 0.12 }, { crit: 8, speed: 12 }),
  A('mountainPalm', 'ironmonk', 28, { dex: 34, end: 26 }, 40, 35, 'ground', 8, 'dex', { dmg: 420, per: 60, radius: 3.5, down: 1.5 }, { radius: 3.5, cast: 0.4 }),

  // ── Bard (#95) ────────────────────────────────────────────────────────────
  A('sharpNote', 'bard', 1, { cha: 5 }, 3, 6, 'enemy', 11, 'cha', { dmg: 170, weaken: 15, dur: 3 }, { cast: 0.15 }),
  P('stagePresence', 'bard', 3, { cha: 8 }, 'cha', { manaDiscount: 0.1, moveSpeed: 0.06 }, { mana: 10, move: 6 }),
  A('marchingSong', 'bard', 4, { cha: 9, skl: 6 }, 18, 14, 'self', 0, 'cha', { dur: 10, move: 25, speed: 20, radius: 7 }, { radius: 7, cast: 0.3 }),
  A('lullaby', 'bard', 7, { cha: 12, skl: 8 }, 16, 14, 'dir', 7, 'cha', { dur: 3, cone: 70 }, { radius: 7, cast: 0.3 }),
  P('longRefrain', 'bard', 9, { cha: 14, skl: 10 }, 'cha', { songLength: 0.3 }, { pct: 30 }),
  A('balladOfValor', 'bard', 10, { cha: 15, skl: 10 }, 22, 18, 'self', 0, 'cha', { dur: 10, dmg: 30, def: 25, radius: 7 }, { radius: 7, cast: 0.3 }),
  A('charmingSerenade', 'bard', 13, { cha: 18, skl: 12 }, 18, 18, 'enemy', 10, 'cha', { dur: 4, radius: 3.5 }, { radius: 3.5, cast: 0.3 }),
  P('virtuoso', 'bard', 15, { skl: 18, cha: 14 }, 'skl', { cdr: 0.08, critDamage: 0.25 }, { cdr: 8, critDmg: 25 }),
  A('hymnOfMending', 'bard', 17, { cha: 22, skl: 15 }, 28, 24, 'self', 0, 'cha', { dur: 8, regen: 2, radius: 7 }, { radius: 7, cast: 0.3 }),
  A('crescendo', 'bard', 21, { cha: 26, skl: 20 }, 14, 20, 'self', 0, 'cha', { dmg: 310, per: 80, radius: 6 }, { radius: 6, cast: 0.25 }),
  P('standingOvation', 'bard', 24, { cha: 29, skl: 22 }, 'cha', { damagePct: 0.1, damageReduction: 0.08 }, { dmg: 10, reduce: 8 }),
  A('grandFinale', 'bard', 27, { cha: 33, skl: 26 }, 50, 40, 'self', 0, 'cha', { dur: 8, buff: 15, dmg: 560, charm: 3, radius: 9 }, { radius: 9, cast: 0.5 })
]

export const SKILL_BY_ID: Readonly<Record<string, SkillDef>> = Object.fromEntries(SKILLS.map(s => [s.id, s]))

/**
 * Actives whose effect reads no attribute (roadmap #105): flat percentages,
 * durations, a taunt, a dash, a stance. They show no scaling badge. Pinned by
 * `skillScaling.test.ts`, which casts every active skill and records which
 * attributes it reads, so a skill that starts scaling cannot stay listed.
 */
export const FIXED_EFFECT: ReadonlySet<string> = new Set([
  'tauntingCry', 'holyBastion', 'venomousBlade', 'smokeBomb', 'shadowMark', 'fanTheFlames', 'commandFocus',
  'royalRally', 'bannerOfVictory', 'royalDecree', 'temporalStasis', 'hasteField', 'chronoRewind', 'essenceWard',
  'earthBarrier', 'petrify', 'zephyrDash', 'blindingFlash', 'packBond', 'alphaHowl', 'tigerStance', 'craneStance',
  'marchingSong', 'lullaby', 'balladOfValor', 'charmingSerenade', 'hymnOfMending'
])

/** The attribute a skill's effect grows with, or null when nothing it does
 *  reads one (every passive: flat bonuses; the actives in FIXED_EFFECT). */
export const scalingOf = (def: SkillDef): Attr | null =>
  def.kind === 'passive' || FIXED_EFFECT.has(def.id) ? null : def.scales

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
