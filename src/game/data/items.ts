import type { Attr } from './attributes'
import type { Mods } from './mods'

/**
 * ─── Items (GDD §6) ──────────────────────────────────────────────────────────
 *
 * The 44 named pieces of the GDD's master database, exactly as tabled: tier,
 * required level, primary stats, armour value, unique passive and drop
 * location. Nothing is rolled: an Iron Broadsword is the same sword for every
 * player, which is what lets a quest or a boss promise a specific reward.
 *
 * And the eighteen pieces of decision D39 (helmets, gloves and boots), which
 * the GDD's tables do not have: six per slot, one per tier, in the tables'
 * own naming and at a share of a body armour's budget (see the section below).
 *
 * Eight equipment slots: main hand, off hand, head, body, hands, feet and two
 * trinkets.
 */

export type ItemSlot = 'main' | 'off' | 'head' | 'body' | 'hands' | 'feet' | 'trinket'
export type EquipSlot = 'main' | 'off' | 'head' | 'body' | 'hands' | 'feet' | 'trinket1' | 'trinket2'
export const EQUIP_SLOTS: readonly EquipSlot[] = ['main', 'off', 'head', 'body', 'hands', 'feet', 'trinket1', 'trinket2']

export const slotOf = (e: EquipSlot): ItemSlot => (e === 'trinket1' || e === 'trinket2' ? 'trinket' : e)

/** Every slot empty: a bare hero, a build to fill in. */
export const noGear = (): Record<EquipSlot, string | null> =>
  ({ main: null, off: null, head: null, body: null, hands: null, feet: null, trinket1: null, trinket2: null })

/** What the item looks like in the hand / on the body, and its icon. */
export type ItemKind =
  | 'sword' | 'dagger' | 'greatsword' | 'axe' | 'hammer' | 'staff' | 'wand' | 'gun' | 'cannon'
  | 'shield' | 'tome' | 'orb' | 'syringe' | 'battery'
  | 'robe' | 'leather' | 'plate'
  | 'hood' | 'cap' | 'helm' | 'greathelm' | 'circlet' | 'hat'
  | 'gloves' | 'gauntlets'
  | 'boots' | 'greaves'
  | 'ring' | 'charm' | 'hourglass' | 'heart'

export type ZoneId =
  | 'plains' | 'hollows' | 'woods' | 'outskirts' | 'crags' | 'mines'
  | 'tundra' | 'temple' | 'citadel' | 'peak' | 'fortress' | 'rift'

/** Where it comes from inside its zone ('smith': made at a forge, #99; 'arena': a
 *  colosseum milestone, #117; neither is ever dropped). */
export type DropSource = 'mob' | 'chest' | 'boss' | 'secret' | 'smith' | 'arena'

export interface ItemDef {
  id: string
  slot: ItemSlot
  kind: ItemKind
  /** 1 Common … 6 Legendary, 7 Mythic (#117: only from the colosseum's milestones). */
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7
  /** Required hero level. */
  level: number
  /** Primary stats and the unique passive, as modifiers. */
  mods: Mods
  /** Body armour's Armor Value. */
  armor?: number
  /** Main hand: the attribute its basic attack scales with, how it attacks,
   *  its reach and its swing time. */
  weapon?: { scale: Attr; style: 'melee' | 'ranged' | 'magic'; range: number; interval: number; heavy?: boolean }
  /** It has a unique passive line (`item.<id>.passive` in i18n). */
  unique?: boolean
  drop: { zone: ZoneId; src: DropSource }
}

const melee = (scale: Attr, interval = 0.95, heavy = false) => ({ scale, style: 'melee' as const, range: 2.1, interval, heavy })
const ranged = (scale: Attr, interval = 0.9) => ({ scale, style: 'ranged' as const, range: 9.5, interval })
const magic = (interval = 1.05) => ({ scale: 'int' as Attr, style: 'magic' as const, range: 9, interval })

/**
 * ─── Gear gives attributes, but less than the hero earns (#110) ──────────────
 *
 * The item tables below keep the GDD's numbers; what a piece actually adds is
 * that times its quality's share. Before #110 a full set at level 25 was worth
 * three to six times the attribute points the hero had spent, so where those
 * points went hardly mattered. Rarer gear is cut harder: a legendary weapon's
 * 140 points were 47 levels' worth. Only attributes are scaled; a piece's own
 * effects (crit, cooldowns, lifesteal...) and armour are untouched.
 */
export const GEAR_ATTR_SCALE: Readonly<Record<number, number>> = { 1: 0.5, 2: 0.4, 3: 0.32, 4: 0.28, 5: 0.25, 6: 0.22, 7: 0.22 }
const ATTR_KEYS = ['str', 'dex', 'int', 'end', 'skl', 'cha', 'allAttrs', 'strOrDex'] as const

const scaled = (it: ItemDef): ItemDef => {
  const k = GEAR_ATTR_SCALE[it.tier] ?? 1
  const mods = { ...it.mods }
  for (const a of ATTR_KEYS) {
    const v = mods[a]
    if (v) mods[a] = Math.max(1, Math.round(v * k))
  }
  return { ...it, mods }
}

const ITEM_TABLE: readonly ItemDef[] = [
  // ── Weapons (main hand) ───────────────────────────────────────────────────
  { id: 'rustedShortsword', slot: 'main', kind: 'sword', tier: 1, level: 1, mods: { str: 4, dex: 2 }, weapon: melee('str'), drop: { zone: 'plains', src: 'mob' } },
  { id: 'apprenticeStaff', slot: 'main', kind: 'staff', tier: 1, level: 1, mods: { int: 5, manaDiscount: 0.05 }, weapon: magic(), unique: true, drop: { zone: 'plains', src: 'chest' } },
  { id: 'scoutsHandgun', slot: 'main', kind: 'gun', tier: 1, level: 2, mods: { skl: 5, attackSpeed: 0.05 }, weapon: ranged('skl'), unique: true, drop: { zone: 'hollows', src: 'boss' } },
  { id: 'ironBroadsword', slot: 'main', kind: 'sword', tier: 2, level: 6, mods: { str: 12, end: 5, block: 0.05 }, weapon: melee('str'), unique: true, drop: { zone: 'woods', src: 'mob' } },
  { id: 'vipinsStiletto', slot: 'main', kind: 'dagger', tier: 2, level: 8, mods: { dex: 16, skl: 8, critDamage: 0.1 }, weapon: melee('dex', 0.7), unique: true, drop: { zone: 'outskirts', src: 'mob' } },
  { id: 'aetherCarbine', slot: 'main', kind: 'gun', tier: 2, level: 10, mods: { skl: 18, int: 10, heatBuildCut: 0.1 }, weapon: ranged('skl', 0.8), unique: true, drop: { zone: 'outskirts', src: 'boss' } },
  { id: 'ashenGreatsword', slot: 'main', kind: 'greatsword', tier: 3, level: 12, mods: { str: 28, end: 12, burnOnHit: 15 }, weapon: melee('str', 1.2, true), unique: true, drop: { zone: 'crags', src: 'mob' } },
  { id: 'archmageWand', slot: 'main', kind: 'wand', tier: 3, level: 14, mods: { int: 32, skl: 10, cdr: 0.08 }, weapon: magic(0.85), unique: true, drop: { zone: 'mines', src: 'boss' } },
  { id: 'chronoBlade', slot: 'main', kind: 'sword', tier: 4, level: 17, mods: { dex: 35, int: 25, freezeOnHit: 0.1 }, weapon: melee('dex', 0.8), unique: true, drop: { zone: 'temple', src: 'mob' } },
  { id: 'bloodForgedAxe', slot: 'main', kind: 'axe', tier: 4, level: 19, mods: { str: 45, end: 20, physLifesteal: 0.08 }, weapon: melee('str', 1.1, true), unique: true, drop: { zone: 'tundra', src: 'boss' } },
  { id: 'voidCannon', slot: 'main', kind: 'cannon', tier: 5, level: 22, mods: { skl: 55, int: 30, pierce: 2 }, weapon: ranged('skl', 1.0), unique: true, drop: { zone: 'citadel', src: 'mob' } },
  { id: 'dragonSmasher', slot: 'main', kind: 'hammer', tier: 5, level: 25, mods: { str: 65, end: 35, bossDamage: 0.25 }, weapon: melee('str', 1.25, true), unique: true, drop: { zone: 'peak', src: 'boss' } },
  { id: 'bladeOfTheUnbound', slot: 'main', kind: 'sword', tier: 6, level: 28, mods: { str: 80, dex: 60, critCooldown: 1 }, weapon: melee('str', 0.85), unique: true, drop: { zone: 'fortress', src: 'boss' } },
  { id: 'aetheriumDestroyer', slot: 'main', kind: 'gun', tier: 6, level: 30, mods: { skl: 90, int: 50, extraBlastEvery: 3 }, weapon: ranged('skl', 0.75), unique: true, drop: { zone: 'rift', src: 'boss' } },

  // ── Off-hand items ────────────────────────────────────────────────────────
  { id: 'woodenBuckler', slot: 'off', kind: 'shield', tier: 1, level: 1, mods: { end: 3, str: 1, block: 0.05 }, unique: true, drop: { zone: 'plains', src: 'mob' } },
  { id: 'tomeOfNovices', slot: 'off', kind: 'tome', tier: 1, level: 2, mods: { int: 4, maxMana: 10 }, unique: true, drop: { zone: 'hollows', src: 'mob' } },
  { id: 'ironShield', slot: 'off', kind: 'shield', tier: 2, level: 7, mods: { end: 10, str: 8, block: 0.1 }, unique: true, drop: { zone: 'woods', src: 'chest' } },
  { id: 'syringeOfTheAdept', slot: 'off', kind: 'syringe', tier: 2, level: 9, mods: { end: 12, int: 6, flaskDamage: 0.15 }, unique: true, drop: { zone: 'outskirts', src: 'chest' } },
  { id: 'aethericBattery', slot: 'off', kind: 'battery', tier: 3, level: 13, mods: { skl: 20, int: 14, heatDissipation: 0.25 }, unique: true, drop: { zone: 'mines', src: 'mob' } },
  { id: 'aegisTowerShield', slot: 'off', kind: 'shield', tier: 4, level: 18, mods: { end: 35, str: 20, reflectOnBlock: 20 }, unique: true, drop: { zone: 'tundra', src: 'mob' } },
  { id: 'orbOfEternalFlame', slot: 'off', kind: 'orb', tier: 5, level: 23, mods: { int: 48, igniteBonus: 0.25 }, unique: true, drop: { zone: 'citadel', src: 'chest' } },
  { id: 'shieldOfTheFallen', slot: 'off', kind: 'shield', tier: 6, level: 29, mods: { end: 65, str: 40, fatalSave: 3 }, unique: true, drop: { zone: 'fortress', src: 'boss' } },

  // ── Body armour ───────────────────────────────────────────────────────────
  { id: 'paddedTunic', slot: 'body', kind: 'leather', tier: 1, level: 1, mods: { end: 2 }, armor: 8, drop: { zone: 'plains', src: 'mob' } },
  { id: 'leatherDoublet', slot: 'body', kind: 'leather', tier: 1, level: 3, mods: { dex: 4, skl: 2 }, armor: 14, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'chainmailVest', slot: 'body', kind: 'plate', tier: 2, level: 6, mods: { str: 10, end: 6 }, armor: 28, drop: { zone: 'woods', src: 'mob' } },
  { id: 'scholarsRobe', slot: 'body', kind: 'robe', tier: 2, level: 8, mods: { int: 14, cha: 6 }, armor: 18, drop: { zone: 'outskirts', src: 'mob' } },
  { id: 'reinforcedPlate', slot: 'body', kind: 'plate', tier: 3, level: 12, mods: { str: 22, end: 16 }, armor: 55, drop: { zone: 'crags', src: 'chest' } },
  { id: 'assassinsGarb', slot: 'body', kind: 'leather', tier: 3, level: 14, mods: { dex: 26, skl: 14 }, armor: 40, drop: { zone: 'mines', src: 'chest' } },
  { id: 'chronoWeaverCloak', slot: 'body', kind: 'robe', tier: 4, level: 17, mods: { int: 32, skl: 20 }, armor: 48, drop: { zone: 'temple', src: 'chest' } },
  { id: 'bloodSoakedPlate', slot: 'body', kind: 'plate', tier: 4, level: 19, mods: { end: 38, str: 24 }, armor: 85, drop: { zone: 'tundra', src: 'chest' } },
  { id: 'exoArmorChassis', slot: 'body', kind: 'plate', tier: 5, level: 23, mods: { skl: 45, str: 30 }, armor: 110, drop: { zone: 'citadel', src: 'mob' } },
  { id: 'dragonscaleHauberk', slot: 'body', kind: 'plate', tier: 5, level: 25, mods: { str: 55, end: 40 }, armor: 140, drop: { zone: 'peak', src: 'boss' } },
  { id: 'vestmentsOfSovereign', slot: 'body', kind: 'robe', tier: 6, level: 28, mods: { cha: 60, int: 50 }, armor: 110, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'armorOfTheTitan', slot: 'body', kind: 'plate', tier: 6, level: 30, mods: { str: 85, end: 85 }, armor: 220, drop: { zone: 'rift', src: 'boss' } },

  // ── Head, hands and feet (D39) ───────────────────────────────────────────
  //
  // Not in the GDD's tables. One piece per slot per tier, so the three slots
  // together are worth about ONE more body armour of the tier: head 35 %,
  // hands 30 %, feet 35 % of its attribute points, and (plate) of its armour.
  // A piece that is not plate trades the armour for a small percentage.
  //   head:  defence, mana, a sharper eye       (helms are plate, hoods and caps leather, circlets and hats cloth)
  //   hands: attack speed, criticals            (gauntlets are plate, gloves leather or cloth)
  //   feet:  move speed, dodge, standing firm   (greaves are plate, boots leather or cloth)
  // Their armour is a modifier (`mods.armor`), not an Armor Value: STR's
  // heavy-armour affinity stays the body's own.
  { id: 'quiltedCap', slot: 'head', kind: 'cap', tier: 1, level: 2, mods: { end: 2, armor: 4 }, drop: { zone: 'hollows', src: 'mob' } },
  { id: 'stalkersHood', slot: 'head', kind: 'hood', tier: 2, level: 7, mods: { dex: 4, skl: 2, critChance: 0.02 }, unique: true, drop: { zone: 'woods', src: 'chest' } },
  { id: 'ironcladHelm', slot: 'head', kind: 'helm', tier: 3, level: 12, mods: { end: 8, str: 5, armor: 18 }, drop: { zone: 'crags', src: 'mob' } },
  { id: 'seersCirclet', slot: 'head', kind: 'circlet', tier: 4, level: 18, mods: { int: 14, cha: 6, maxMana: 40 }, unique: true, drop: { zone: 'temple', src: 'chest' } },
  { id: 'wyrmguardGreathelm', slot: 'head', kind: 'greathelm', tier: 5, level: 24, mods: { end: 18, str: 12, armor: 44 }, drop: { zone: 'peak', src: 'mob' } },
  { id: 'hatOfTheStarweaver', slot: 'head', kind: 'hat', tier: 6, level: 28, mods: { int: 30, skl: 18, cdr: 0.06 }, unique: true, drop: { zone: 'fortress', src: 'chest' } },

  { id: 'hideGloves', slot: 'hands', kind: 'gloves', tier: 1, level: 3, mods: { dex: 1, skl: 1, attackSpeed: 0.02 }, unique: true, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'ironGauntlets', slot: 'hands', kind: 'gauntlets', tier: 2, level: 8, mods: { str: 4, end: 2, armor: 7 }, drop: { zone: 'outskirts', src: 'mob' } },
  { id: 'emberweaveGloves', slot: 'hands', kind: 'gloves', tier: 3, level: 13, mods: { int: 10, spellCrit: 0.03 }, unique: true, drop: { zone: 'crags', src: 'chest' } },
  { id: 'duelistsGrips', slot: 'hands', kind: 'gloves', tier: 4, level: 19, mods: { dex: 12, skl: 6, attackSpeed: 0.05 }, unique: true, drop: { zone: 'tundra', src: 'mob' } },
  { id: 'voidforgedGauntlets', slot: 'hands', kind: 'gauntlets', tier: 5, level: 22, mods: { str: 14, end: 8, armor: 34, critDamage: 0.08 }, unique: true, drop: { zone: 'citadel', src: 'chest' } },
  { id: 'gripsOfTheTempest', slot: 'hands', kind: 'gloves', tier: 6, level: 29, mods: { dex: 26, skl: 16, attackSpeed: 0.1, critChance: 0.04 }, unique: true, drop: { zone: 'fortress', src: 'boss' } },

  { id: 'trailBoots', slot: 'feet', kind: 'boots', tier: 1, level: 1, mods: { end: 1, moveSpeed: 0.03 }, unique: true, drop: { zone: 'plains', src: 'mob' } },
  { id: 'pathfindersBoots', slot: 'feet', kind: 'boots', tier: 2, level: 9, mods: { dex: 5, moveSpeed: 0.04, dodge: 0.02 }, unique: true, drop: { zone: 'outskirts', src: 'chest' } },
  { id: 'forgeplateGreaves', slot: 'feet', kind: 'greaves', tier: 3, level: 14, mods: { end: 9, str: 5, armor: 16, stunDurationCut: 0.1 }, unique: true, drop: { zone: 'mines', src: 'chest' } },
  { id: 'mistwalkerBoots', slot: 'feet', kind: 'boots', tier: 4, level: 17, mods: { int: 12, end: 6, moveSpeed: 0.05 }, unique: true, drop: { zone: 'temple', src: 'mob' } },
  { id: 'stormstrideGreaves', slot: 'feet', kind: 'greaves', tier: 5, level: 23, mods: { end: 14, str: 14, armor: 40, moveSpeed: 0.04 }, unique: true, drop: { zone: 'citadel', src: 'mob' } },
  { id: 'treadsOfTheHorizon', slot: 'feet', kind: 'boots', tier: 6, level: 30, mods: { dex: 28, end: 20, moveSpeed: 0.1, dodge: 0.08 }, unique: true, drop: { zone: 'rift', src: 'boss' } },

  // ── Trinkets & rings ──────────────────────────────────────────────────────
  { id: 'copperBand', slot: 'trinket', kind: 'ring', tier: 1, level: 2, mods: { strOrDex: 3, moveSpeed: 0.02 }, unique: true, drop: { zone: 'plains', src: 'chest' } },
  { id: 'ringOfMending', slot: 'trinket', kind: 'ring', tier: 2, level: 7, mods: { end: 8, hpRegen: 3 }, unique: true, drop: { zone: 'woods', src: 'mob' } },
  { id: 'bandOfSwiftness', slot: 'trinket', kind: 'ring', tier: 2, level: 9, mods: { dex: 10, attackSpeed: 0.08 }, unique: true, drop: { zone: 'outskirts', src: 'mob' } },
  { id: 'castersEmblem', slot: 'trinket', kind: 'charm', tier: 3, level: 13, mods: { int: 16, spellCrit: 0.05 }, unique: true, drop: { zone: 'mines', src: 'mob' } },
  { id: 'infiltratorsCharm', slot: 'trinket', kind: 'charm', tier: 3, level: 15, mods: { skl: 18, stealthy: 0.4, backstab: 0.1 }, unique: true, drop: { zone: 'crags', src: 'mob' } },
  { id: 'timekeepersHourglass', slot: 'trinket', kind: 'hourglass', tier: 4, level: 18, mods: { int: 22, skl: 15, cdr: 0.1 }, unique: true, drop: { zone: 'temple', src: 'mob' } },
  { id: 'ringOfTheVampyre', slot: 'trinket', kind: 'ring', tier: 4, level: 20, mods: { end: 25, lifesteal: 0.05 }, unique: true, drop: { zone: 'tundra', src: 'mob' } },
  { id: 'sovereignsSignet', slot: 'trinket', kind: 'ring', tier: 5, level: 24, mods: { cha: 30, minionDamage: 0.2 }, unique: true, drop: { zone: 'peak', src: 'mob' } },
  { id: 'heartOfTheMountain', slot: 'trinket', kind: 'heart', tier: 5, level: 25, mods: { str: 35, end: 20, knockbackImmune: 1 }, unique: true, drop: { zone: 'citadel', src: 'mob' } },
  { id: 'ringOfAbsolutePower', slot: 'trinket', kind: 'ring', tier: 6, level: 30, mods: { allAttrs: 25, damagePct: 0.15, damageReduction: 0.15 }, unique: true, drop: { zone: 'fortress', src: 'secret' } }
]

export const ITEMS: readonly ItemDef[] = ITEM_TABLE.map(scaled)

/**
 * ─── Smithed gear (roadmap #99, D121) ────────────────────────────────────────
 *
 * A fixed catalogue: six pieces of metal gear in each of the four ores, and a
 * masterwork twin of each a quality higher. Never dropped, never sold in a
 * shop (they are kept out of `ITEMS`, which shops, gamblers and the drop
 * tables read); only made at a forge. Plain, honest pieces: strength and
 * endurance, the weight of their metal, no passive.
 */
export type SmithPiece = 'sword' | 'hammer' | 'shield' | 'helm' | 'plate' | 'greaves'
export const SMITH_PIECES: readonly SmithPiece[] = ['sword', 'hammer', 'shield', 'helm', 'plate', 'greaves']
export type SmithMetal = 'iron' | 'silver' | 'gold' | 'mithril'
/** Each metal's quality (the masterwork one higher) and the level its pieces ask. */
export const SMITH_METAL: Readonly<Record<SmithMetal, { tier: 1 | 2 | 3 | 4; level: number }>> = {
  iron: { tier: 1, level: 3 }, silver: { tier: 2, level: 8 }, gold: { tier: 3, level: 15 }, mithril: { tier: 4, level: 23 }
}
/** The attribute points (before the quality's share) a main-hand piece of a
 *  quality carries, and a body piece's armour: in step with the found gear. */
const SMITH_BUDGET: Readonly<Record<number, number>> = { 1: 6, 2: 17, 3: 34, 4: 58, 5: 92 }
const SMITH_ARMOR: Readonly<Record<number, number>> = { 1: 14, 2: 28, 3: 55, 4: 85, 5: 120 }
const SMITH_SHAPE: Readonly<Record<SmithPiece, { slot: ItemSlot; kind: ItemKind; share: number; split: [Attr, number, Attr] }>> = {
  sword: { slot: 'main', kind: 'sword', share: 1, split: ['str', 0.7, 'dex'] },
  hammer: { slot: 'main', kind: 'hammer', share: 1.1, split: ['str', 0.75, 'end'] },
  shield: { slot: 'off', kind: 'shield', share: 0.55, split: ['end', 0.6, 'str'] },
  helm: { slot: 'head', kind: 'helm', share: 0.3, split: ['end', 0.6, 'str'] },
  plate: { slot: 'body', kind: 'plate', share: 1, split: ['str', 0.55, 'end'] },
  greaves: { slot: 'feet', kind: 'greaves', share: 0.3, split: ['end', 0.6, 'str'] }
}
export const smithItemId = (metal: SmithMetal, piece: SmithPiece, master: boolean): string =>
  `smith${master ? 'Master' : ''}${metal[0]!.toUpperCase()}${metal.slice(1)}${piece[0]!.toUpperCase()}${piece.slice(1)}`
const smithDef = (metal: SmithMetal, piece: SmithPiece, master: boolean): ItemDef => {
  const m = SMITH_METAL[metal]
  const tier = (m.tier + (master ? 1 : 0)) as ItemDef['tier']
  const sh = SMITH_SHAPE[piece]
  const pts = SMITH_BUDGET[tier]! * sh.share
  const a = Math.max(1, Math.round(pts * sh.split[1]))
  const b = Math.max(1, Math.round(pts * (1 - sh.split[1])))
  const mods: Mods = { [sh.split[0]]: a, [sh.split[2]]: b }
  if (piece === 'shield') mods.block = master ? 0.08 : 0.06
  if (piece === 'helm') mods.armor = Math.round(SMITH_ARMOR[tier]! * 0.3)
  if (piece === 'greaves') mods.armor = Math.round(SMITH_ARMOR[tier]! * 0.28)
  return {
    id: smithItemId(metal, piece, master), slot: sh.slot, kind: sh.kind, tier, level: m.level, mods,
    ...(piece === 'plate' ? { armor: SMITH_ARMOR[tier]! } : {}),
    ...(piece === 'sword' ? { weapon: melee('str') } : piece === 'hammer' ? { weapon: melee('str', 1.2, true) } : {}),
    drop: { zone: 'plains', src: 'smith' }
  }
}
export const SMITHED: readonly ItemDef[] = (Object.keys(SMITH_METAL) as SmithMetal[])
  .flatMap(metal => SMITH_PIECES.flatMap(piece => [smithDef(metal, piece, false), smithDef(metal, piece, true)]))
  .map(scaled)

/**
 * ─── Mythic gear (roadmap #117) ──────────────────────────────────────────────
 *
 * The colosseum's prizes, one for each milestone of the ladder
 * (`data/arena.ts`): never dropped, never sold, never in a shop or a
 * gambler's pool. Class-free on purpose (every build pushes the ladder), each
 * with a passive of its own, and a little past the legendaries.
 */
export const MYTHICS: readonly ItemDef[] = ([
  { id: 'laurelOfTheVictor', slot: 'head', kind: 'circlet', tier: 7, level: 24, mods: { allAttrs: 40, cdr: 0.08, healPower: 0.2 }, unique: true, drop: { zone: 'plains', src: 'arena' } },
  { id: 'gripsOfTheGladiator', slot: 'hands', kind: 'gauntlets', tier: 7, level: 26, mods: { strOrDex: 90, attackSpeed: 0.12, lifesteal: 0.05 }, unique: true, drop: { zone: 'plains', src: 'arena' } },
  { id: 'sandstriderGreaves', slot: 'feet', kind: 'greaves', tier: 7, level: 28, mods: { end: 70, armor: 40, moveSpeed: 0.12, dodge: 0.08, knockbackImmune: 1 }, unique: true, drop: { zone: 'plains', src: 'arena' } },
  { id: 'crimsonBulwark', slot: 'off', kind: 'shield', tier: 7, level: 30, mods: { end: 120, str: 60, block: 0.15, reflectOnBlock: 40, lastStand: 0.25 }, unique: true, drop: { zone: 'plains', src: 'arena' } },
  { id: 'mantleOfTheUndefeated', slot: 'body', kind: 'plate', tier: 7, level: 30, mods: { allAttrs: 60, maxHpPct: 0.15, damageReduction: 0.08 }, armor: 200, unique: true, drop: { zone: 'plains', src: 'arena' } },
  { id: 'heartOfTheArena', slot: 'trinket', kind: 'heart', tier: 7, level: 30, mods: { allAttrs: 60, damagePct: 0.2, critChance: 0.08, critCooldown: 0.5 }, unique: true, drop: { zone: 'plains', src: 'arena' } }
] as ItemDef[]).map(scaled)

export const ITEM_BY_ID: Readonly<Record<string, ItemDef>> = Object.fromEntries([...ITEMS, ...SMITHED, ...MYTHICS].map(i => [i.id, i]))

/** Tier frame colours (icons, loot beams, names). T6 is the legendary gold. */
export const TIER_COLOR: Record<number, string> = {
  1: '#c9d2e3',
  2: '#67e08a',
  3: '#50aaff',
  4: '#c58cff',
  5: '#ff8a4a',
  6: '#ffd84a',
  // Mythic (#117): a deep crimson, the arena's own.
  7: '#d0283c'
}

/** What a shop charges (before the Charisma discount); legendaries are not for sale. */
export const TIER_PRICE: Record<number, number> = { 1: 60, 2: 260, 3: 820, 4: 2300, 5: 5600, 6: 0, 7: 0 }

export const priceOf = (it: ItemDef): number => Math.round(TIER_PRICE[it.tier]! * (1 + (it.level % 5) * 0.06))

/** What a merchant pays for it. Legendaries sell for a fortune they can never be bought back with. */
export const sellValue = (it: ItemDef): number =>
  it.tier >= 7 ? 0 : it.tier === 6 ? 2400 : Math.max(5, Math.round(priceOf(it) * 0.25))

/** A mythic is the colosseum's trophy: it is never sold (#117). */
export const sellable = (it: ItemDef): boolean => it.tier < 7

/** The hero's bare hands: a Novice with no main-hand item. */
export const UNARMED = { scale: 'str' as Attr, style: 'melee' as const, range: 1.9, interval: 0.9, heavy: false }

export const itemsOfZone = (zone: ZoneId, src?: DropSource): ItemDef[] =>
  ITEMS.filter(i => i.drop.zone === zone && (!src || i.drop.src === src))

/** Body armour's class (STR's "heavy armour affinity" applies to plate). */
export const isPlate = (it: ItemDef): boolean => it.slot === 'body' && it.kind === 'plate'
