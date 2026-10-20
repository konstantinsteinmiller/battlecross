import type { Attr } from './attributes'
import type { Mods, ModId } from './mods'
import { DEMON_AFFIXES, INFERNAL_LEVEL, INFERNAL_MUL, INFERNAL_PRICE, INFERNAL_SUFFIX } from './relics'

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
  // The afterplay (phase 8): a siege milestone, and an Infernal twin (invaded zones, a smith).
  | 'siege' | 'infernal'

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
  /** An Infernal twin (afterplay §2.4): the id of the piece it was made from. */
  infernal?: string
  /** One of a boss pair (afterplay §2.4): both worn add the set's bonus (`SET_BONUS`). */
  set?: string
}

const melee = (scale: Attr, interval = 0.95, heavy = false) => ({ scale, style: 'melee' as const, range: 2.1, interval, heavy })
const ranged = (scale: Attr, interval = 0.9) => ({ scale, style: 'ranged' as const, range: 9.5, interval })
const magic = (interval = 1.05, scale: Attr = 'int') => ({ scale, style: 'magic' as const, range: 9, interval })

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
  { id: 'ringOfAbsolutePower', slot: 'trinket', kind: 'ring', tier: 6, level: 30, mods: { allAttrs: 25, damagePct: 0.15, damageReduction: 0.15 }, unique: true, drop: { zone: 'fortress', src: 'secret' } },

  // ── The Charisma set ──────────────────────────────────────────────────────
  //
  // Four classes (Sovereign, Lightbringer, Beastcaller, Bard) scale on CHA,
  // but the tables above only had a ring and a robe for it, both late. Twelve
  // pieces, one sheet of icons (`CHARISMA_ITEMS`), from level 3 to 29: a
  // weapon whose blow scales on CHA in every stage of the game, and every
  // slot filled. Their extras feed what CHA skills do: minions, heals, songs.
  { id: 'heraldsPin', slot: 'trinket', kind: 'charm', tier: 1, level: 3, mods: { cha: 6, hpRegen: 2 }, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'hymnalOfTheRoad', slot: 'off', kind: 'tome', tier: 1, level: 5, mods: { cha: 6, end: 2, minionHp: 0.1 }, drop: { zone: 'hollows', src: 'mob' } },
  { id: 'shepherdsCrook', slot: 'main', kind: 'staff', tier: 2, level: 7, mods: { cha: 14, end: 6, minionDamage: 0.1 }, weapon: magic(1.05, 'cha'), drop: { zone: 'woods', src: 'chest' } },
  { id: 'minstrelsHat', slot: 'head', kind: 'hat', tier: 2, level: 9, mods: { cha: 6, end: 2, maxMana: 20 }, drop: { zone: 'outskirts', src: 'mob' } },
  { id: 'pilgrimsSandals', slot: 'feet', kind: 'boots', tier: 2, level: 10, mods: { cha: 5, end: 2, moveSpeed: 0.04 }, drop: { zone: 'outskirts', src: 'chest' } },
  { id: 'falconersGloves', slot: 'hands', kind: 'gloves', tier: 3, level: 12, mods: { cha: 10, attackSpeed: 0.03 }, drop: { zone: 'crags', src: 'mob' } },
  { id: 'bellOfTheHerd', slot: 'trinket', kind: 'charm', tier: 3, level: 14, mods: { cha: 18, minionHp: 0.15 }, drop: { zone: 'mines', src: 'chest' } },
  { id: 'bannerOfTheHost', slot: 'main', kind: 'staff', tier: 4, level: 18, mods: { cha: 38, end: 18, minionAttackSpeed: 0.12 }, weapon: magic(1.0, 'cha'), drop: { zone: 'temple', src: 'boss' } },
  { id: 'heraldsTabard', slot: 'body', kind: 'robe', tier: 4, level: 20, mods: { cha: 34, end: 22 }, armor: 52, drop: { zone: 'tundra', src: 'chest' } },
  { id: 'codexOfOaths', slot: 'off', kind: 'tome', tier: 5, level: 22, mods: { cha: 48, end: 20, minionHp: 0.2 }, drop: { zone: 'citadel', src: 'chest' } },
  { id: 'crownOfTheRightfulKing', slot: 'head', kind: 'circlet', tier: 5, level: 25, mods: { cha: 22, end: 10, cdr: 0.03 }, drop: { zone: 'peak', src: 'chest' } },
  { id: 'scepterOfTheFirstKing', slot: 'main', kind: 'wand', tier: 6, level: 29, mods: { cha: 85, end: 45, minionDamage: 0.25 }, weapon: magic(0.95, 'cha'), drop: { zone: 'fortress', src: 'boss' } },

  // ── The Dexterity set ─────────────────────────────────────────────────────
  //
  // DEX had a dagger, a sword and a few leathers, with holes at most tiers
  // (no off-hand at all, no trinket past the second tier). Thirty-one pieces,
  // three sheets of icons (`DEXTERITY_ITEMS`), fill every slot at every tier
  // so a full DEX build exists from level 2 to 30, together with the older DEX
  // pieces above. Their extras are a rogue's: speed, criticals, dodge.
  { id: 'pickpocketsKnife', slot: 'main', kind: 'dagger', tier: 1, level: 2, mods: { dex: 6, attackSpeed: 0.04 }, weapon: melee('dex', 0.75), drop: { zone: 'hollows', src: 'chest' } },
  { id: 'serpentsFang', slot: 'main', kind: 'dagger', tier: 3, level: 13, mods: { dex: 30, skl: 10, critChance: 0.04 }, weapon: melee('dex', 0.7), drop: { zone: 'crags', src: 'mob' } },
  { id: 'phantomRapier', slot: 'main', kind: 'sword', tier: 5, level: 23, mods: { dex: 62, skl: 25, critDamage: 0.15 }, weapon: melee('dex', 0.75), drop: { zone: 'peak', src: 'mob' } },
  { id: 'fangOfTheWindless', slot: 'main', kind: 'dagger', tier: 6, level: 29, mods: { dex: 100, skl: 40, critChance: 0.06 }, weapon: melee('dex', 0.6), drop: { zone: 'fortress', src: 'chest' } },

  { id: 'roguesBuckler', slot: 'off', kind: 'shield', tier: 1, level: 4, mods: { dex: 3, end: 1, dodge: 0.02 }, drop: { zone: 'hollows', src: 'mob' } },
  { id: 'venomVial', slot: 'off', kind: 'syringe', tier: 2, level: 8, mods: { dex: 11, skl: 5, flaskDamage: 0.1 }, drop: { zone: 'outskirts', src: 'mob' } },
  { id: 'swiftguardBuckler', slot: 'off', kind: 'shield', tier: 3, level: 14, mods: { dex: 20, end: 8, dodge: 0.04 }, drop: { zone: 'crags', src: 'chest' } },
  { id: 'nightshadeFlask', slot: 'off', kind: 'syringe', tier: 4, level: 19, mods: { dex: 30, skl: 14, dodge: 0.05 }, drop: { zone: 'temple', src: 'chest' } },
  { id: 'windveilTarge', slot: 'off', kind: 'shield', tier: 5, level: 24, mods: { dex: 46, end: 18, dodge: 0.06 }, drop: { zone: 'peak', src: 'chest' } },
  { id: 'shadowdancersBuckler', slot: 'off', kind: 'shield', tier: 6, level: 30, mods: { dex: 70, skl: 30, dodge: 0.1 }, drop: { zone: 'fortress', src: 'chest' } },

  { id: 'scoutsBandana', slot: 'head', kind: 'hood', tier: 1, level: 4, mods: { dex: 2, skl: 1 }, drop: { zone: 'plains', src: 'chest' } },
  { id: 'nightcowl', slot: 'head', kind: 'hood', tier: 3, level: 14, mods: { dex: 11, skl: 5, critChance: 0.02 }, drop: { zone: 'mines', src: 'mob' } },
  { id: 'shadowveilHood', slot: 'head', kind: 'hood', tier: 4, level: 20, mods: { dex: 18, skl: 8, critChance: 0.02 }, drop: { zone: 'tundra', src: 'mob' } },
  { id: 'windrunnersCap', slot: 'head', kind: 'cap', tier: 5, level: 25, mods: { dex: 26, skl: 12, critChance: 0.02 }, drop: { zone: 'peak', src: 'chest' } },
  { id: 'maskOfTheSilentWind', slot: 'head', kind: 'hood', tier: 6, level: 30, mods: { dex: 42, skl: 20, critChance: 0.04 }, drop: { zone: 'fortress', src: 'mob' } },

  { id: 'rangersJerkin', slot: 'body', kind: 'leather', tier: 2, level: 9, mods: { dex: 14, skl: 6 }, armor: 26, drop: { zone: 'woods', src: 'chest' } },
  { id: 'nightstalkerLeathers', slot: 'body', kind: 'leather', tier: 4, level: 20, mods: { dex: 38, skl: 18 }, armor: 68, drop: { zone: 'temple', src: 'mob' } },
  { id: 'windridersHarness', slot: 'body', kind: 'leather', tier: 5, level: 24, mods: { dex: 52, skl: 24 }, armor: 90, drop: { zone: 'citadel', src: 'chest' } },
  { id: 'mantleOfTheShadowDancer', slot: 'body', kind: 'leather', tier: 6, level: 29, mods: { dex: 78, skl: 40 }, armor: 130, drop: { zone: 'fortress', src: 'mob' } },

  { id: 'thiefsGloves', slot: 'hands', kind: 'gloves', tier: 2, level: 10, mods: { dex: 4, skl: 2, attackSpeed: 0.03 }, drop: { zone: 'woods', src: 'mob' } },
  { id: 'cutpurseGloves', slot: 'hands', kind: 'gloves', tier: 3, level: 14, mods: { dex: 9, skl: 4, critChance: 0.02 }, drop: { zone: 'crags', src: 'mob' } },
  { id: 'glovesOfTheGale', slot: 'hands', kind: 'gloves', tier: 5, level: 25, mods: { dex: 18, skl: 9, attackSpeed: 0.05 }, drop: { zone: 'citadel', src: 'mob' } },

  { id: 'softSoledShoes', slot: 'feet', kind: 'boots', tier: 1, level: 3, mods: { dex: 2, moveSpeed: 0.02 }, drop: { zone: 'plains', src: 'chest' } },
  { id: 'catStepBoots', slot: 'feet', kind: 'boots', tier: 3, level: 15, mods: { dex: 9, moveSpeed: 0.04, dodge: 0.02 }, drop: { zone: 'crags', src: 'chest' } },
  { id: 'shadowstepBoots', slot: 'feet', kind: 'boots', tier: 4, level: 19, mods: { dex: 13, skl: 5, moveSpeed: 0.05, dodge: 0.03 }, drop: { zone: 'tundra', src: 'chest' } },
  { id: 'windstrideBoots', slot: 'feet', kind: 'boots', tier: 5, level: 24, mods: { dex: 20, end: 6, moveSpeed: 0.05, dodge: 0.04 }, drop: { zone: 'peak', src: 'mob' } },

  { id: 'luckyCoin', slot: 'trinket', kind: 'charm', tier: 1, level: 4, mods: { dex: 6, moveSpeed: 0.02 }, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'shadowBand', slot: 'trinket', kind: 'ring', tier: 3, level: 14, mods: { dex: 20, attackSpeed: 0.06 }, drop: { zone: 'mines', src: 'chest' } },
  { id: 'sandglassOfTheSwift', slot: 'trinket', kind: 'hourglass', tier: 4, level: 19, mods: { dex: 30, skl: 12, attackSpeed: 0.08 }, drop: { zone: 'temple', src: 'chest' } },
  { id: 'talonCharm', slot: 'trinket', kind: 'charm', tier: 5, level: 25, mods: { dex: 42, skl: 20, critDamage: 0.15 }, drop: { zone: 'peak', src: 'chest' } },
  { id: 'windheart', slot: 'trinket', kind: 'heart', tier: 6, level: 30, mods: { dex: 60, skl: 30, attackSpeed: 0.1, critChance: 0.04 }, drop: { zone: 'fortress', src: 'chest' } },

  // ── The gap-fill set (items-gap-audit.md) ─────────────────────────────────
  //
  // The audit laid every attribute line (strength, dexterity, intelligence,
  // skill, charisma, endurance) over the seven slots and the six qualities
  // and found a hundred and five empty cells: a slot a build could not fill,
  // or a rung missing from a line's ladder. One fixed piece for each, in the
  // zone of its quality, with the stat budget of its slot and quality
  // (`ITEM_BUDGET`) and the line's own extras. Strength and endurance share
  // the heavy gear: a piece counts for a line when that attribute is at least
  // half of its top one. The legendaries drop from the Dread Fortress's
  // finale and chests, like the other legendaries.

  // str
  { id: 'ashwallHeater', slot: 'off', kind: 'shield', tier: 3, level: 11, mods: { str: 21, end: 9, block: 0.1 }, drop: { zone: 'crags', src: 'mob' } },
  { id: 'wyrmhidePavise', slot: 'off', kind: 'shield', tier: 5, level: 21, mods: { str: 48, end: 20, block: 0.15 }, drop: { zone: 'citadel', src: 'mob' } },
  { id: 'footmansKettleHat', slot: 'head', kind: 'helm', tier: 1, level: 1, mods: { str: 3, end: 1, armor: 4 }, drop: { zone: 'plains', src: 'mob' } },
  { id: 'ironbrowSallet', slot: 'head', kind: 'helm', tier: 2, level: 6, mods: { str: 6, end: 2, armor: 9 }, drop: { zone: 'woods', src: 'mob' } },
  { id: 'warlordsBarbute', slot: 'head', kind: 'greathelm', tier: 4, level: 16, mods: { str: 18, end: 8, stunDurationCut: 0.06, armor: 27 }, drop: { zone: 'tundra', src: 'mob' } },
  { id: 'helmOfTheSunderedThrone', slot: 'head', kind: 'greathelm', tier: 6, level: 28, mods: { str: 41, end: 18, stunDurationCut: 0.15, armor: 70 }, drop: { zone: 'fortress', src: 'boss' } },
  { id: 'recruitsCuirass', slot: 'body', kind: 'plate', tier: 1, level: 3, mods: { str: 4, end: 2 }, armor: 14, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'stonecuttersMitts', slot: 'hands', kind: 'gauntlets', tier: 1, level: 2, mods: { str: 3, end: 1, critDamage: 0.02, armor: 4 }, drop: { zone: 'plains', src: 'mob' } },
  { id: 'ashforgedGauntlets', slot: 'hands', kind: 'gauntlets', tier: 3, level: 13, mods: { str: 8, end: 3, critDamage: 0.04, armor: 14 }, drop: { zone: 'mines', src: 'chest' } },
  { id: 'warbringerGauntlets', slot: 'hands', kind: 'gauntlets', tier: 4, level: 17, mods: { str: 13, end: 5, critDamage: 0.05, armor: 21 }, drop: { zone: 'temple', src: 'chest' } },
  { id: 'titanfistGauntlets', slot: 'hands', kind: 'gauntlets', tier: 6, level: 29, mods: { str: 31, end: 14, critDamage: 0.12, armor: 55 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'footmansGreaves', slot: 'feet', kind: 'greaves', tier: 1, level: 4, mods: { str: 1, end: 1, moveSpeed: 0.01, armor: 4 }, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'ironshodGreaves', slot: 'feet', kind: 'greaves', tier: 2, level: 8, mods: { str: 4, end: 2, moveSpeed: 0.02, armor: 8 }, drop: { zone: 'outskirts', src: 'chest' } },
  { id: 'warlordsSabatons', slot: 'feet', kind: 'greaves', tier: 4, level: 17, mods: { str: 13, end: 5, moveSpeed: 0.03, armor: 25 }, drop: { zone: 'tundra', src: 'mob' } },
  { id: 'greavesOfTheMountainfall', slot: 'feet', kind: 'greaves', tier: 6, level: 30, mods: { str: 31, end: 14, moveSpeed: 0.06, armor: 64 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'sergeantsSignet', slot: 'trinket', kind: 'ring', tier: 2, level: 7, mods: { str: 7, end: 3, bossDamage: 0.05 }, drop: { zone: 'woods', src: 'mob' } },
  { id: 'brawlersKnuckleRing', slot: 'trinket', kind: 'ring', tier: 3, level: 12, mods: { str: 13, end: 6, bossDamage: 0.08 }, drop: { zone: 'crags', src: 'mob' } },
  { id: 'bloodiedWarMedal', slot: 'trinket', kind: 'charm', tier: 4, level: 18, mods: { str: 25, end: 11, bossDamage: 0.1 }, drop: { zone: 'temple', src: 'chest' } },

  // end
  { id: 'watchmansCudgel', slot: 'main', kind: 'hammer', tier: 1, level: 3, mods: { end: 4, str: 2, block: 0.03 }, weapon: melee('end', 0.95, true), drop: { zone: 'plains', src: 'mob' } },
  { id: 'ironboundMace', slot: 'main', kind: 'hammer', tier: 2, level: 9, mods: { end: 16, str: 7, block: 0.05 }, weapon: melee('end', 0.95, true), drop: { zone: 'outskirts', src: 'chest' } },
  { id: 'stonehideCleaver', slot: 'main', kind: 'axe', tier: 3, level: 14, mods: { end: 29, str: 12, block: 0.06, physLifesteal: 0.02 }, weapon: melee('end', 1.1, true), drop: { zone: 'mines', src: 'chest' } },
  { id: 'bulwarkMaul', slot: 'main', kind: 'hammer', tier: 4, level: 18, mods: { end: 43, str: 18, block: 0.07, physLifesteal: 0.03 }, weapon: melee('end', 0.95, true), drop: { zone: 'tundra', src: 'mob' } },
  { id: 'mountainsplitterAxe', slot: 'main', kind: 'axe', tier: 5, level: 24, mods: { end: 62, str: 26, block: 0.08, physLifesteal: 0.04 }, weapon: melee('end', 1.1, true), drop: { zone: 'peak', src: 'chest' } },
  { id: 'everstandWarmace', slot: 'main', kind: 'hammer', tier: 6, level: 30, mods: { end: 99, str: 42, block: 0.1, physLifesteal: 0.06 }, weapon: melee('end', 0.95, true), drop: { zone: 'fortress', src: 'boss' } },
  { id: 'emberwallBastion', slot: 'off', kind: 'shield', tier: 5, level: 22, mods: { end: 48, str: 20, block: 0.15 }, drop: { zone: 'citadel', src: 'mob' } },
  { id: 'stonewardenHelm', slot: 'head', kind: 'helm', tier: 4, level: 19, mods: { end: 18, str: 8, stunDurationCut: 0.06, armor: 27 }, drop: { zone: 'temple', src: 'chest' } },
  { id: 'colossusVisage', slot: 'head', kind: 'greathelm', tier: 6, level: 30, mods: { end: 41, str: 18, stunDurationCut: 0.15, armor: 70 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'diggersGauntlets', slot: 'hands', kind: 'gauntlets', tier: 1, level: 5, mods: { end: 3, str: 1, stunDurationCut: 0.03, armor: 4 }, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'bastionGauntlets', slot: 'hands', kind: 'gauntlets', tier: 3, level: 13, mods: { end: 8, str: 3, stunDurationCut: 0.06, armor: 14 }, drop: { zone: 'crags', src: 'mob' } },
  { id: 'glacierplateGauntlets', slot: 'hands', kind: 'gauntlets', tier: 4, level: 19, mods: { end: 13, str: 5, stunDurationCut: 0.08, armor: 21 }, drop: { zone: 'tundra', src: 'mob' } },
  { id: 'gauntletsOfEndlessVigil', slot: 'hands', kind: 'gauntlets', tier: 6, level: 30, mods: { end: 31, str: 14, stunDurationCut: 0.18, armor: 55 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'hearthstoneCharm', slot: 'trinket', kind: 'charm', tier: 1, level: 3, mods: { end: 4, str: 2, hpRegen: 2 }, drop: { zone: 'plains', src: 'mob' } },
  { id: 'ironheartPendant', slot: 'trinket', kind: 'heart', tier: 3, level: 15, mods: { end: 13, str: 6, hpRegen: 5 }, drop: { zone: 'mines', src: 'chest' } },

  // int
  { id: 'hedgewizardsWand', slot: 'main', kind: 'wand', tier: 2, level: 8, mods: { int: 16, skl: 7, manaDiscount: 0.06 }, weapon: magic(0.85), drop: { zone: 'woods', src: 'mob' } },
  { id: 'frostglassStaff', slot: 'main', kind: 'staff', tier: 4, level: 20, mods: { int: 43, skl: 18, cdr: 0.1 }, weapon: magic(1.05), drop: { zone: 'temple', src: 'chest' } },
  { id: 'voidthreadWand', slot: 'main', kind: 'wand', tier: 5, level: 25, mods: { int: 62, skl: 26, spellCrit: 0.06 }, weapon: magic(0.85), drop: { zone: 'peak', src: 'chest' } },
  { id: 'staffOfTheStarlessSky', slot: 'main', kind: 'staff', tier: 6, level: 30, mods: { int: 99, skl: 42, cdr: 0.12, spellCrit: 0.08 }, weapon: magic(1.05), drop: { zone: 'fortress', src: 'boss' } },
  { id: 'studentsGrimoire', slot: 'off', kind: 'tome', tier: 2, level: 10, mods: { int: 12, skl: 5, maxMana: 25 }, drop: { zone: 'outskirts', src: 'chest' } },
  { id: 'frostfireOrb', slot: 'off', kind: 'orb', tier: 4, level: 19, mods: { int: 34, skl: 14, maxMana: 60 }, drop: { zone: 'tundra', src: 'mob' } },
  { id: 'orbOfTheUnwrittenHour', slot: 'off', kind: 'orb', tier: 6, level: 30, mods: { int: 71, skl: 31, maxMana: 130 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'apprenticesPointedCap', slot: 'head', kind: 'hat', tier: 1, level: 5, mods: { int: 3, cha: 1, maxMana: 10 }, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'sagesCirclet', slot: 'head', kind: 'circlet', tier: 2, level: 8, mods: { int: 6, cha: 2, maxMana: 20 }, drop: { zone: 'woods', src: 'mob' } },
  { id: 'cinderWizardsHat', slot: 'head', kind: 'hat', tier: 3, level: 13, mods: { int: 13, cha: 6, maxMana: 30 }, drop: { zone: 'crags', src: 'mob' } },
  { id: 'voidseerCirclet', slot: 'head', kind: 'circlet', tier: 5, level: 23, mods: { int: 27, cha: 11, maxMana: 55, cdr: 0.03 }, drop: { zone: 'citadel', src: 'mob' } },
  { id: 'apprenticesRobe', slot: 'body', kind: 'robe', tier: 1, level: 3, mods: { int: 4, skl: 2 }, armor: 8, drop: { zone: 'plains', src: 'mob' } },
  { id: 'cinderthreadRobe', slot: 'body', kind: 'robe', tier: 3, level: 15, mods: { int: 27, skl: 11 }, armor: 33, drop: { zone: 'mines', src: 'chest' } },
  { id: 'voidwovenRobe', slot: 'body', kind: 'robe', tier: 5, level: 25, mods: { int: 55, skl: 23 }, armor: 84, drop: { zone: 'peak', src: 'chest' } },
  { id: 'inkStainedGloves', slot: 'hands', kind: 'gloves', tier: 1, level: 5, mods: { int: 3, skl: 1, spellCrit: 0.01 }, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'spellthreadGloves', slot: 'hands', kind: 'gloves', tier: 2, level: 10, mods: { int: 6, skl: 2, spellCrit: 0.02 }, drop: { zone: 'outskirts', src: 'chest' } },
  { id: 'frostweaveGloves', slot: 'hands', kind: 'gloves', tier: 4, level: 20, mods: { int: 13, skl: 5, spellCrit: 0.03 }, drop: { zone: 'temple', src: 'chest' } },
  { id: 'starlitGloves', slot: 'hands', kind: 'gloves', tier: 5, level: 23, mods: { int: 20, skl: 8, spellCrit: 0.03 }, drop: { zone: 'citadel', src: 'mob' } },
  { id: 'glovesOfTheLastWord', slot: 'hands', kind: 'gloves', tier: 6, level: 30, mods: { int: 31, skl: 14, spellCrit: 0.06 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'scribesSlippers', slot: 'feet', kind: 'boots', tier: 1, level: 3, mods: { int: 1, end: 1, moveSpeed: 0.03, maxMana: 8 }, drop: { zone: 'plains', src: 'mob' } },
  { id: 'moonstepSlippers', slot: 'feet', kind: 'boots', tier: 2, level: 8, mods: { int: 4, end: 2, moveSpeed: 0.03, maxMana: 12 }, drop: { zone: 'woods', src: 'mob' } },
  { id: 'emberstepBoots', slot: 'feet', kind: 'boots', tier: 3, level: 13, mods: { int: 8, end: 3, moveSpeed: 0.04, maxMana: 16 }, drop: { zone: 'crags', src: 'mob' } },
  { id: 'voidwalkerBoots', slot: 'feet', kind: 'boots', tier: 5, level: 25, mods: { int: 20, end: 8, moveSpeed: 0.05, maxMana: 28 }, drop: { zone: 'peak', src: 'chest' } },
  { id: 'bootsOfTheWanderingStar', slot: 'feet', kind: 'boots', tier: 6, level: 30, mods: { int: 31, end: 14, moveSpeed: 0.1, maxMana: 40 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'glowstonePendant', slot: 'trinket', kind: 'charm', tier: 1, level: 5, mods: { int: 4, skl: 2, spellCrit: 0.02 }, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'scholarsSeal', slot: 'trinket', kind: 'ring', tier: 2, level: 10, mods: { int: 7, skl: 3, spellCrit: 0.03 }, drop: { zone: 'outskirts', src: 'chest' } },
  { id: 'eyeOfTheArchon', slot: 'trinket', kind: 'charm', tier: 5, level: 23, mods: { int: 42, skl: 18, spellCrit: 0.08 }, drop: { zone: 'citadel', src: 'mob' } },

  // skl
  { id: 'cinderRepeater', slot: 'main', kind: 'gun', tier: 3, level: 15, mods: { skl: 29, int: 12, attackSpeed: 0.06, critChance: 0.03 }, weapon: ranged('skl', 0.8), drop: { zone: 'mines', src: 'chest' } },
  { id: 'glacierMortar', slot: 'main', kind: 'cannon', tier: 4, level: 19, mods: { skl: 43, int: 18, critChance: 0.05, heatBuildCut: 0.12 }, weapon: ranged('skl', 1.0), drop: { zone: 'tundra', src: 'mob' } },
  { id: 'sparkCell', slot: 'off', kind: 'battery', tier: 1, level: 3, mods: { skl: 4, int: 2, heatDissipation: 0.1 }, drop: { zone: 'plains', src: 'mob' } },
  { id: 'arcCapacitor', slot: 'off', kind: 'battery', tier: 5, level: 25, mods: { skl: 48, int: 20, heatDissipation: 0.35 }, drop: { zone: 'peak', src: 'chest' } },
  { id: 'aetherheartCell', slot: 'off', kind: 'battery', tier: 6, level: 30, mods: { skl: 71, int: 31, heatDissipation: 0.4 }, drop: { zone: 'fortress', src: 'boss' } },
  { id: 'marksmansVisor', slot: 'head', kind: 'cap', tier: 4, level: 20, mods: { skl: 18, dex: 8, critChance: 0.02 }, drop: { zone: 'temple', src: 'chest' } },
  { id: 'sharpshootersCap', slot: 'head', kind: 'cap', tier: 5, level: 23, mods: { skl: 27, dex: 11, critChance: 0.02 }, drop: { zone: 'citadel', src: 'mob' } },
  { id: 'gunnersHarness', slot: 'body', kind: 'leather', tier: 2, level: 8, mods: { skl: 14, dex: 6 }, armor: 22, drop: { zone: 'woods', src: 'mob' } },
  { id: 'steadyhandGloves', slot: 'hands', kind: 'gloves', tier: 3, level: 13, mods: { skl: 8, dex: 3, attackSpeed: 0.04 }, drop: { zone: 'crags', src: 'mob' } },
  { id: 'gunsmithsGloves', slot: 'hands', kind: 'gloves', tier: 5, level: 25, mods: { skl: 20, dex: 8, attackSpeed: 0.05 }, drop: { zone: 'peak', src: 'chest' } },
  { id: 'scrappersBoots', slot: 'feet', kind: 'boots', tier: 1, level: 5, mods: { skl: 1, dex: 1, moveSpeed: 0.03, dodge: 0.01 }, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'sharpshooterBoots', slot: 'feet', kind: 'boots', tier: 2, level: 10, mods: { skl: 4, dex: 2, moveSpeed: 0.03, dodge: 0.02 }, drop: { zone: 'outskirts', src: 'chest' } },
  { id: 'firingLineBoots', slot: 'feet', kind: 'boots', tier: 3, level: 15, mods: { skl: 8, dex: 3, moveSpeed: 0.04, dodge: 0.02 }, drop: { zone: 'mines', src: 'chest' } },
  { id: 'steadyfootBoots', slot: 'feet', kind: 'boots', tier: 4, level: 19, mods: { skl: 13, dex: 5, moveSpeed: 0.05, dodge: 0.03 }, drop: { zone: 'tundra', src: 'mob' } },
  { id: 'aetherstepBoots', slot: 'feet', kind: 'boots', tier: 5, level: 23, mods: { skl: 20, dex: 8, moveSpeed: 0.05, dodge: 0.04 }, drop: { zone: 'citadel', src: 'mob' } },
  { id: 'bootsOfTheLastShot', slot: 'feet', kind: 'boots', tier: 6, level: 30, mods: { skl: 31, dex: 14, moveSpeed: 0.1, dodge: 0.08 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'brassCartridgeCharm', slot: 'trinket', kind: 'charm', tier: 1, level: 3, mods: { skl: 4, dex: 2, critChance: 0.02 }, drop: { zone: 'plains', src: 'mob' } },
  { id: 'deadEyeLens', slot: 'trinket', kind: 'charm', tier: 2, level: 8, mods: { skl: 7, dex: 3, critChance: 0.03 }, drop: { zone: 'woods', src: 'mob' } },
  { id: 'eagleEyeScope', slot: 'trinket', kind: 'charm', tier: 5, level: 25, mods: { skl: 42, dex: 18, critChance: 0.06 }, drop: { zone: 'peak', src: 'chest' } },

  // cha
  { id: 'criersBaton', slot: 'main', kind: 'wand', tier: 1, level: 5, mods: { cha: 4, end: 2, minionDamage: 0.05, minionHp: 0.08 }, weapon: magic(0.95, 'cha'), drop: { zone: 'hollows', src: 'chest' } },
  { id: 'droversStandard', slot: 'main', kind: 'staff', tier: 3, level: 13, mods: { cha: 29, end: 12, minionDamage: 0.12, minionHp: 0.1 }, weapon: magic(1.0, 'cha'), drop: { zone: 'crags', src: 'mob' } },
  { id: 'marshalsSceptre', slot: 'main', kind: 'wand', tier: 5, level: 23, mods: { cha: 62, end: 26, minionDamage: 0.18, minionAttackSpeed: 0.14 }, weapon: magic(0.95, 'cha'), drop: { zone: 'citadel', src: 'mob' } },
  { id: 'balladBook', slot: 'off', kind: 'tome', tier: 2, level: 10, mods: { cha: 12, end: 5, minionHp: 0.12 }, drop: { zone: 'outskirts', src: 'chest' } },
  { id: 'chronicleOfHeroes', slot: 'off', kind: 'tome', tier: 3, level: 15, mods: { cha: 21, end: 9, minionHp: 0.15 }, drop: { zone: 'mines', src: 'chest' } },
  { id: 'psalterOfTheHost', slot: 'off', kind: 'tome', tier: 4, level: 20, mods: { cha: 34, end: 14, minionHp: 0.18 }, drop: { zone: 'temple', src: 'chest' } },
  { id: 'tomeOfEternalReign', slot: 'off', kind: 'tome', tier: 6, level: 30, mods: { cha: 71, end: 31, minionHp: 0.28 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'heraldsCap', slot: 'head', kind: 'hat', tier: 1, level: 3, mods: { cha: 3, end: 1, maxMana: 10 }, drop: { zone: 'plains', src: 'mob' } },
  { id: 'singersCirclet', slot: 'head', kind: 'circlet', tier: 3, level: 13, mods: { cha: 13, end: 6, maxMana: 30 }, drop: { zone: 'crags', src: 'mob' } },
  { id: 'diademOfTenThousandVoices', slot: 'head', kind: 'circlet', tier: 6, level: 30, mods: { cha: 41, end: 18, maxMana: 90, cdr: 0.06 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'travelersWaistcoat', slot: 'body', kind: 'robe', tier: 1, level: 5, mods: { cha: 4, end: 2 }, armor: 8, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'minstrelsMotley', slot: 'body', kind: 'robe', tier: 2, level: 8, mods: { cha: 14, end: 6 }, armor: 17, drop: { zone: 'woods', src: 'mob' } },
  { id: 'troubadoursCoat', slot: 'body', kind: 'robe', tier: 3, level: 15, mods: { cha: 27, end: 11 }, armor: 33, drop: { zone: 'mines', src: 'chest' } },
  { id: 'marshalsGreatcoat', slot: 'body', kind: 'robe', tier: 5, level: 25, mods: { cha: 55, end: 23 }, armor: 84, drop: { zone: 'peak', src: 'chest' } },
  { id: 'buskersGloves', slot: 'hands', kind: 'gloves', tier: 1, level: 3, mods: { cha: 3, end: 1, attackSpeed: 0.015 }, drop: { zone: 'plains', src: 'mob' } },
  { id: 'drummersGloves', slot: 'hands', kind: 'gloves', tier: 2, level: 10, mods: { cha: 6, end: 2, attackSpeed: 0.02 }, drop: { zone: 'outskirts', src: 'chest' } },
  { id: 'standardBearersGloves', slot: 'hands', kind: 'gloves', tier: 4, level: 19, mods: { cha: 13, end: 5, attackSpeed: 0.035 }, drop: { zone: 'tundra', src: 'mob' } },
  { id: 'gildedParadeGloves', slot: 'hands', kind: 'gloves', tier: 5, level: 23, mods: { cha: 20, end: 8, attackSpeed: 0.04 }, drop: { zone: 'citadel', src: 'mob' } },
  { id: 'glovesOfTheCrownedHand', slot: 'hands', kind: 'gloves', tier: 6, level: 30, mods: { cha: 31, end: 14, attackSpeed: 0.07 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'wayfarersShoes', slot: 'feet', kind: 'boots', tier: 1, level: 5, mods: { cha: 1, end: 1, moveSpeed: 0.03 }, drop: { zone: 'hollows', src: 'chest' } },
  { id: 'troubadourBoots', slot: 'feet', kind: 'boots', tier: 3, level: 13, mods: { cha: 8, end: 3, moveSpeed: 0.04 }, drop: { zone: 'crags', src: 'mob' } },
  { id: 'heraldsRidingBoots', slot: 'feet', kind: 'boots', tier: 4, level: 20, mods: { cha: 13, end: 5, moveSpeed: 0.05 }, drop: { zone: 'temple', src: 'chest' } },
  { id: 'paradeBoots', slot: 'feet', kind: 'boots', tier: 5, level: 25, mods: { cha: 20, end: 8, moveSpeed: 0.05 }, drop: { zone: 'peak', src: 'chest' } },
  { id: 'bootsOfTheLongProcession', slot: 'feet', kind: 'boots', tier: 6, level: 30, mods: { cha: 31, end: 14, moveSpeed: 0.1 }, drop: { zone: 'fortress', src: 'chest' } },
  { id: 'silverWhistle', slot: 'trinket', kind: 'charm', tier: 2, level: 8, mods: { cha: 7, end: 3, minionDamage: 0.08 }, drop: { zone: 'woods', src: 'mob' } },
  { id: 'gatheringHorn', slot: 'trinket', kind: 'charm', tier: 4, level: 19, mods: { cha: 25, end: 11, minionDamage: 0.15 }, drop: { zone: 'tundra', src: 'mob' } },
]

/** The Charisma set's ids: one sheet of icons of their own. */
export const CHARISMA_ITEMS: ReadonlySet<string> = new Set(['heraldsPin', 'hymnalOfTheRoad', 'shepherdsCrook', 'minstrelsHat', 'pilgrimsSandals', 'falconersGloves',
  'bellOfTheHerd', 'bannerOfTheHost', 'heraldsTabard', 'codexOfOaths', 'crownOfTheRightfulKing', 'scepterOfTheFirstKing'])

/** The Dexterity set's ids: three sheets of icons of their own. */
export const DEXTERITY_ITEMS: ReadonlySet<string> = new Set([
  'pickpocketsKnife', 'serpentsFang', 'phantomRapier', 'fangOfTheWindless', 'roguesBuckler', 'venomVial', 'swiftguardBuckler', 'nightshadeFlask', 'windveilTarge', 'shadowdancersBuckler', 'scoutsBandana', 'nightcowl', 'shadowveilHood', 'windrunnersCap', 'maskOfTheSilentWind', 'rangersJerkin', 'nightstalkerLeathers', 'windridersHarness', 'mantleOfTheShadowDancer', 'thiefsGloves', 'cutpurseGloves', 'glovesOfTheGale', 'softSoledShoes', 'catStepBoots', 'shadowstepBoots', 'windstrideBoots', 'luckyCoin', 'shadowBand', 'sandglassOfTheSwift', 'talonCharm', 'windheart'])

/** The gap-fill set's ids (the audit's hundred and five pieces): nine sheets of icons of their own. */
export const GAPFILL_ITEMS: ReadonlySet<string> = new Set([
  'ashwallHeater', 'wyrmhidePavise', 'footmansKettleHat', 'ironbrowSallet', 'warlordsBarbute', 'helmOfTheSunderedThrone',
  'recruitsCuirass', 'stonecuttersMitts', 'ashforgedGauntlets', 'warbringerGauntlets', 'titanfistGauntlets', 'footmansGreaves',
  'ironshodGreaves', 'warlordsSabatons', 'greavesOfTheMountainfall', 'sergeantsSignet', 'brawlersKnuckleRing', 'bloodiedWarMedal',
  'watchmansCudgel', 'ironboundMace', 'stonehideCleaver', 'bulwarkMaul', 'mountainsplitterAxe', 'everstandWarmace',
  'emberwallBastion', 'stonewardenHelm', 'colossusVisage', 'diggersGauntlets', 'bastionGauntlets', 'glacierplateGauntlets',
  'gauntletsOfEndlessVigil', 'hearthstoneCharm', 'ironheartPendant', 'hedgewizardsWand', 'frostglassStaff', 'voidthreadWand',
  'staffOfTheStarlessSky', 'studentsGrimoire', 'frostfireOrb', 'orbOfTheUnwrittenHour', 'apprenticesPointedCap', 'sagesCirclet',
  'cinderWizardsHat', 'voidseerCirclet', 'apprenticesRobe', 'cinderthreadRobe', 'voidwovenRobe', 'inkStainedGloves',
  'spellthreadGloves', 'frostweaveGloves', 'starlitGloves', 'glovesOfTheLastWord', 'scribesSlippers', 'moonstepSlippers',
  'emberstepBoots', 'voidwalkerBoots', 'bootsOfTheWanderingStar', 'glowstonePendant', 'scholarsSeal', 'eyeOfTheArchon',
  'cinderRepeater', 'glacierMortar', 'sparkCell', 'arcCapacitor', 'aetherheartCell', 'marksmansVisor',
  'sharpshootersCap', 'gunnersHarness', 'steadyhandGloves', 'gunsmithsGloves', 'scrappersBoots', 'sharpshooterBoots',
  'firingLineBoots', 'steadyfootBoots', 'aetherstepBoots', 'bootsOfTheLastShot', 'brassCartridgeCharm', 'deadEyeLens',
  'eagleEyeScope', 'criersBaton', 'droversStandard', 'marshalsSceptre', 'balladBook', 'chronicleOfHeroes',
  'psalterOfTheHost', 'tomeOfEternalReign', 'heraldsCap', 'singersCirclet', 'diademOfTenThousandVoices', 'travelersWaistcoat',
  'minstrelsMotley', 'troubadoursCoat', 'marshalsGreatcoat', 'buskersGloves', 'drummersGloves', 'standardBearersGloves',
  'gildedParadeGloves', 'glovesOfTheCrownedHand', 'wayfarersShoes', 'troubadourBoots', 'heraldsRidingBoots', 'paradeBoots',
  'bootsOfTheLongProcession', 'silverWhistle', 'gatheringHorn'])

/**
 * The attribute points (before the quality's share, `GEAR_ATTR_SCALE`) a piece
 * of a slot carries at each quality, 1 Common ... 6 Legendary: the yardstick the
 * found gear is budgeted by, and the one new pieces are made to. A piece is
 * checked against it by `tests/game/itemBudget.test.ts`.
 */
export const ITEM_BUDGET: Readonly<Record<ItemSlot, readonly number[]>> = {
  main: [6, 23, 41, 61, 88, 141],
  off: [6, 17, 30, 48, 68, 102],
  head: [4, 8, 19, 25, 38, 59],
  body: [6, 20, 38, 58, 78, 118],
  hands: [4, 8, 11, 18, 28, 45],
  feet: [2, 6, 11, 18, 28, 45],
  trinket: [6, 10, 19, 36, 60, 95]
}

export const ITEMS: readonly ItemDef[] = ITEM_TABLE.map(scaled)

/**
 * ─── Smithed gear (roadmap #99, D121) ────────────────────────────────────────
 *
 * A fixed catalogue: six pieces of metal gear in each of the six ores for each
 * of the six attributes (roadmap #148), and a masterwork twin of each a quality
 * higher. Never dropped, never sold in a shop (they are kept out of `ITEMS`, which shops, gamblers and the drop
 * tables read); only made at a forge. Plain, honest pieces: the build's own
 * attributes and the weight of their metal, no passive.
 */
export type SmithPiece = 'sword' | 'hammer' | 'shield' | 'helm' | 'plate' | 'greaves'
export const SMITH_PIECES: readonly SmithPiece[] = ['sword', 'hammer', 'shield', 'helm', 'plate', 'greaves']
export type SmithMetal = 'iron' | 'silver' | 'gold' | 'mithril' | 'adamant' | 'aetherite'
/**
 * Each metal's plain quality, the masterwork's, and the level its pieces ask.
 * `budget` is the attribute points (before the quality's share) a main-hand
 * piece carries, plain then masterwork, and `armor` a body piece's armour:
 * in step with the found gear of that quality. The first four are a quality
 * apart; adamant (heroic, its masterwork a legendary) and aetherite (legendary
 * both ways) are the endgame's (#150): their masterworks stay under the best
 * legendary drops (a main hand's 140 points, a plate's 220 armour), which keep
 * their passives and variety.
 */
export const SMITH_METAL: Readonly<Record<SmithMetal, { tier: 1 | 2 | 3 | 4 | 5 | 6; master: 2 | 3 | 4 | 5 | 6; level: number; budget: readonly [number, number]; armor: readonly [number, number] }>> = {
  iron: { tier: 1, master: 2, level: 3, budget: [6, 17], armor: [14, 28] },
  silver: { tier: 2, master: 3, level: 8, budget: [17, 34], armor: [28, 55] },
  gold: { tier: 3, master: 4, level: 15, budget: [34, 58], armor: [55, 85] },
  mithril: { tier: 4, master: 5, level: 23, budget: [58, 92], armor: [85, 120] },
  adamant: { tier: 5, master: 6, level: 26, budget: [100, 124], armor: [140, 178] },
  aetherite: { tier: 6, master: 6, level: 29, budget: [132, 140], armor: [196, 215] }
}
/** What a smith can forge for: the six attributes, the build a piece is for (roadmap #148). */
export type SmithLine = Attr
export const SMITH_LINES: readonly SmithLine[] = ['str', 'dex', 'int', 'skl', 'cha', 'end']
interface SmithPieceDef { kind: ItemKind; sec: Attr; weapon?: ItemDef['weapon']; main?: number }
/**
 * Each build's six pieces, the base model and stat profile taken from the found
 * gear of that attribute (a dagger for dexterity, a wand for intelligence, a
 * pistol for skill, a sceptre for charisma, a mace for endurance). The strength
 * line is the original catalogue, ids and numbers untouched. `sec` is the
 * piece's second attribute; `main` overrides the share the main one carries.
 */
const SMITH_BUILD: Readonly<Record<SmithLine, Record<SmithPiece, SmithPieceDef>>> = {
  str: {
    sword: { kind: 'sword', sec: 'dex', weapon: melee('str') }, hammer: { kind: 'hammer', sec: 'end', weapon: melee('str', 1.2, true) },
    shield: { kind: 'shield', sec: 'str' }, helm: { kind: 'helm', sec: 'str' }, plate: { kind: 'plate', sec: 'end' }, greaves: { kind: 'greaves', sec: 'str' }
  },
  dex: {
    sword: { kind: 'dagger', sec: 'skl', weapon: melee('dex', 0.7) }, hammer: { kind: 'sword', sec: 'skl', weapon: melee('dex', 0.8) },
    shield: { kind: 'shield', sec: 'end' }, helm: { kind: 'hood', sec: 'skl' }, plate: { kind: 'leather', sec: 'skl' }, greaves: { kind: 'boots', sec: 'end' }
  },
  int: {
    sword: { kind: 'wand', sec: 'skl', weapon: magic(0.85) }, hammer: { kind: 'staff', sec: 'end', weapon: magic(1.05) },
    shield: { kind: 'tome', sec: 'skl' }, helm: { kind: 'circlet', sec: 'cha' }, plate: { kind: 'robe', sec: 'skl' }, greaves: { kind: 'boots', sec: 'end' }
  },
  skl: {
    sword: { kind: 'gun', sec: 'int', weapon: ranged('skl', 0.8) }, hammer: { kind: 'cannon', sec: 'int', weapon: ranged('skl', 1.0) },
    shield: { kind: 'battery', sec: 'int' }, helm: { kind: 'cap', sec: 'dex' }, plate: { kind: 'leather', sec: 'dex' }, greaves: { kind: 'boots', sec: 'dex' }
  },
  cha: {
    sword: { kind: 'wand', sec: 'end', weapon: magic(0.95, 'cha') }, hammer: { kind: 'staff', sec: 'end', weapon: magic(1.0, 'cha') },
    shield: { kind: 'tome', sec: 'end' }, helm: { kind: 'circlet', sec: 'end' }, plate: { kind: 'robe', sec: 'end' }, greaves: { kind: 'boots', sec: 'end' }
  },
  end: {
    sword: { kind: 'hammer', sec: 'str', weapon: melee('end', 0.95, true) }, hammer: { kind: 'axe', sec: 'str', weapon: melee('end', 1.1, true) },
    shield: { kind: 'shield', sec: 'str', main: 0.8 }, helm: { kind: 'helm', sec: 'str', main: 0.8 }, plate: { kind: 'plate', sec: 'str', main: 0.8 }, greaves: { kind: 'greaves', sec: 'str', main: 0.8 }
  }
}
/** A line's armour, against the plate line's: cloth and leather wear less metal. */
const SMITH_ARMOR_K: Readonly<Record<SmithLine, number>> = { str: 1, end: 1, dex: 0.85, skl: 0.8, cha: 0.7, int: 0.65 }
/** The slot, the share of a main-hand budget it carries, and the main attribute's cut of it (the strength line's own, from the first catalogue). */
const SMITH_SHAPE: Readonly<Record<SmithPiece, { slot: ItemSlot; share: number; main: number }>> = {
  sword: { slot: 'main', share: 1, main: 0.7 },
  hammer: { slot: 'main', share: 1.1, main: 0.75 },
  shield: { slot: 'off', share: 0.55, main: 0.6 },
  helm: { slot: 'head', share: 0.3, main: 0.6 },
  plate: { slot: 'body', share: 1, main: 0.55 },
  greaves: { slot: 'feet', share: 0.3, main: 0.6 }
}
/** Strength's guards lead with endurance, as they always did. */
const STR_LEAD: ReadonlySet<SmithPiece> = new Set(['shield', 'helm', 'greaves'])
export const smithItemId = (metal: SmithMetal, piece: SmithPiece, master: boolean, line: SmithLine = 'str'): string =>
  `smith${master ? 'Master' : ''}${line === 'str' ? '' : line[0]!.toUpperCase() + line.slice(1)}${metal[0]!.toUpperCase()}${metal.slice(1)}${piece[0]!.toUpperCase()}${piece.slice(1)}`
const smithDef = (metal: SmithMetal, piece: SmithPiece, master: boolean, line: SmithLine): ItemDef => {
  const m = SMITH_METAL[metal]
  const tier = (master ? m.master : m.tier) as ItemDef['tier']
  const w = master ? 1 : 0
  const sh = SMITH_SHAPE[piece]
  const b = SMITH_BUILD[line][piece]
  const pts = m.budget[w] * sh.share
  const lead: Attr = line === 'str' ? (STR_LEAD.has(piece) ? 'end' : 'str') : line
  const cut = b.main ?? sh.main
  const a = Math.max(1, Math.round(pts * cut))
  const c = Math.max(1, Math.round(pts * (1 - cut)))
  const mods: Mods = { [lead]: a, [b.sec]: c }
  const k = SMITH_ARMOR_K[line]
  if (piece === 'shield') {
    if (line === 'str' || line === 'end') mods.block = master ? 0.08 : 0.06
    else if (line === 'dex') mods.dodge = master ? 0.04 : 0.03
    else if (line === 'int') mods.maxMana = tier * 8
    else if (line === 'skl') mods.attackSpeed = master ? 0.04 : 0.03
    else mods.minionHp = master ? 0.15 : 0.1
  }
  if (piece === 'helm') mods.armor = Math.round(m.armor[w] * 0.3 * k)
  if (piece === 'greaves') mods.armor = Math.round(m.armor[w] * 0.28 * k)
  return {
    id: smithItemId(metal, piece, master, line), slot: sh.slot, kind: b.kind, tier, level: m.level, mods,
    ...(piece === 'plate' ? { armor: Math.round(m.armor[w] * k) } : {}),
    ...(b.weapon ? { weapon: b.weapon } : {}),
    drop: { zone: 'plains', src: 'smith' }
  }
}
export const SMITHED: readonly ItemDef[] = SMITH_LINES.flatMap(line => (Object.keys(SMITH_METAL) as SmithMetal[])
  .flatMap(metal => SMITH_PIECES.flatMap(piece => [smithDef(metal, piece, false, line), smithDef(metal, piece, true, line)])))
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

/**
 * ─── The afterplay's named pieces (docs/gdd-afterplay.md §2.4, §5, §8.6) ─────
 *
 * Each of the seven new bosses drops two (`drop.src` 'boss', in its invaded
 * zone), a set; the Siege of Bastion's milestones hand over four. Tier 6, the
 * Elder Dragon's pair and the siege's two top milestones tier 7 (mythic: siege
 * and final boss only). Their budgets grow past the legendaries' with their
 * levels (34–60). Kept out of `ITEMS`: no shop, no gambler, no campaign chest
 * or finale ever holds one (`AFTER_BOSS_DROPS` is the invaded finales' table).
 * There is no flail in the armoury yet: the Many-Headed Flail is drawn as a hammer.
 */
export const AFTER_ITEMS: readonly ItemDef[] = ([
  // The Chimera (Wildwood, lvl 37)
  { id: 'chimeraMane', slot: 'head', kind: 'helm', tier: 6, level: 37, set: 'chimera', mods: { str: 70, end: 40, armor: 80, stunDurationCut: 0.2 }, unique: true, drop: { zone: 'woods', src: 'boss' } },
  { id: 'triFang', slot: 'main', kind: 'dagger', tier: 6, level: 37, set: 'chimera', mods: { dex: 130, skl: 60, critChance: 0.06, critDamage: 0.2 }, weapon: melee('dex', 0.6), unique: true, drop: { zone: 'woods', src: 'boss' } },
  // The Centaur Warchief (Outskirts, lvl 40)
  { id: 'warchiefsLongbowGun', slot: 'main', kind: 'gun', tier: 6, level: 40, set: 'centaur', mods: { skl: 140, dex: 65, pierce: 2, attackSpeed: 0.08 }, weapon: ranged('skl', 0.8), unique: true, drop: { zone: 'outskirts', src: 'boss' } },
  { id: 'hoofbreakerGreaves', slot: 'feet', kind: 'greaves', tier: 6, level: 40, set: 'centaur', mods: { end: 45, str: 30, armor: 80, moveSpeed: 0.1, knockbackImmune: 1 }, unique: true, drop: { zone: 'outskirts', src: 'boss' } },
  // The Cyclops (Mines, lvl 45)
  { id: 'eyeOfTheDeep', slot: 'trinket', kind: 'charm', tier: 6, level: 45, set: 'cyclops', mods: { skl: 90, dex: 60, critChance: 0.08, crumble: 0.25 }, unique: true, drop: { zone: 'mines', src: 'boss' } },
  { id: 'beamSplitter', slot: 'off', kind: 'shield', tier: 6, level: 45, set: 'cyclops', mods: { end: 120, str: 70, block: 0.18, reflectOnBlock: 60 }, unique: true, drop: { zone: 'mines', src: 'boss' } },
  // The Sphinx (Temple, lvl 49)
  { id: 'riddleCrown', slot: 'head', kind: 'circlet', tier: 6, level: 49, set: 'sphinx', mods: { int: 95, cha: 40, cdr: 0.1, maxMana: 140 }, unique: true, drop: { zone: 'temple', src: 'boss' } },
  { id: 'sandglassWand', slot: 'main', kind: 'wand', tier: 6, level: 49, set: 'sphinx', mods: { int: 200, skl: 85, cdr: 0.1, freezeOnHit: 0.1 }, weapon: magic(0.85), unique: true, drop: { zone: 'temple', src: 'boss' } },
  // The Leviathan (Citadel, lvl 52)
  { id: 'leviathanScale', slot: 'body', kind: 'plate', tier: 6, level: 52, set: 'leviathan', mods: { end: 190, str: 110, damageReduction: 0.06, waterWalk: 1 }, armor: 340, unique: true, drop: { zone: 'citadel', src: 'boss' } },
  { id: 'tidecallerStaff', slot: 'main', kind: 'staff', tier: 6, level: 52, set: 'leviathan', mods: { int: 215, cha: 90, chillOnHit: 0.25, spellCrit: 0.06 }, weapon: magic(1.05), unique: true, drop: { zone: 'citadel', src: 'boss' } },
  // The Hydra (Fortress, lvl 57)
  { id: 'hydraScaleGauntlets', slot: 'hands', kind: 'gauntlets', tier: 6, level: 57, set: 'hydra', mods: { str: 80, end: 45, armor: 110, burnOnHit: 40, critDamage: 0.15 }, unique: true, drop: { zone: 'fortress', src: 'boss' } },
  { id: 'manyHeadedFlail', slot: 'main', kind: 'hammer', tier: 6, level: 57, set: 'hydra', mods: { str: 245, end: 110, burnOnHit: 60, attackSpeed: 0.08 }, weapon: melee('str', 1.0, true), unique: true, drop: { zone: 'fortress', src: 'boss' } },
  // The Elder Dragon (Rift, lvl 60): mythic
  { id: 'heartOfTheElderDragon', slot: 'trinket', kind: 'heart', tier: 7, level: 60, set: 'elderDragon', mods: { allAttrs: 110, damagePct: 0.25, damageReduction: 0.12, fireWard: 0.3 }, unique: true, drop: { zone: 'rift', src: 'boss' } },
  { id: 'dragonboneGreatsword', slot: 'main', kind: 'greatsword', tier: 7, level: 60, set: 'elderDragon', mods: { str: 290, end: 130, critDamage: 0.35, bossDamage: 0.3, beastBane: 0.2 }, weapon: melee('str', 1.2, true), unique: true, drop: { zone: 'rift', src: 'boss' } },
  // The Siege of Bastion's milestones (§8.6)
  { id: 'bastionBanner', slot: 'off', kind: 'tome', tier: 6, level: 38, mods: { cha: 100, end: 60, minionDamage: 0.05, minionHp: 0.05, minionAttackSpeed: 0.05 }, unique: true, drop: { zone: 'outskirts', src: 'siege' } },
  { id: 'wallwardensPlate', slot: 'body', kind: 'plate', tier: 6, level: 42, mods: { end: 170, str: 95, damageReduction: 0.08 }, armor: 320, unique: true, drop: { zone: 'outskirts', src: 'siege' } },
  { id: 'gatebreaker', slot: 'main', kind: 'hammer', tier: 7, level: 45, mods: { str: 270, end: 120, bossDamage: 0.3, pylonBreaker: 1 }, weapon: melee('str', 1.25, true), unique: true, drop: { zone: 'outskirts', src: 'siege' } },
  { id: 'crownOfTheLastBastion', slot: 'head', kind: 'greathelm', tier: 7, level: 50, mods: { allAttrs: 70, armor: 100, damageReduction: 0.08, lastStand: 0.2 }, unique: true, drop: { zone: 'outskirts', src: 'siege' } }
] as ItemDef[]).map(scaled)

/** The partner of a set piece ('' none). */
export const setPartner = (it: ItemDef): string => (it.set ? AFTER_ITEMS.find(o => o.set === it.set && o.id !== it.id)?.id ?? '' : '')

/** The two pieces an afterplay boss leaves, by the invaded zone it holds. */
export const AFTER_BOSS_DROPS: Readonly<Partial<Record<ZoneId, readonly string[]>>> =
  AFTER_ITEMS.reduce<Partial<Record<ZoneId, string[]>>>((m, i) => {
    if (i.drop.src === 'boss') (m[i.drop.zone] ??= []).push(i.id)
    return m
  }, {})

/** What an Infernal twin grows: its attributes, armour and the flat pools; never its effects. */
const INFERNAL_GROWS: ReadonlySet<ModId> = new Set<ModId>(['str', 'dex', 'int', 'end', 'skl', 'cha', 'allAttrs', 'strOrDex', 'armor', 'maxHp', 'maxMana', 'hpRegen'])

/** An Infernal twin's id. */
export const infernalId = (id: string): string => `${id}${INFERNAL_SUFFIX}`

/**
 * ─── Infernal twins (afterplay §2.4) ─────────────────────────────────────────
 *
 * Every named unique of the campaign (`ITEMS` with a passive), once more: 30
 * levels higher, its attributes and armour ×1.9, one demon affix (taken in
 * turn from the eight, so the table is the same for every player). Its icon
 * is its original's, tinted red-black. Named "<name> · Infernal" by the
 * locale loader, from the original's own name.
 */
export const INFERNALS: readonly ItemDef[] = ITEMS.filter(i => i.unique).map((it, n) => {
  const mods: Mods = {}
  for (const k of Object.keys(it.mods) as ModId[]) {
    const v = it.mods[k] ?? 0
    mods[k] = INFERNAL_GROWS.has(k) ? Math.round(v * INFERNAL_MUL) : v
  }
  for (const [k, v] of Object.entries(DEMON_AFFIXES[n % DEMON_AFFIXES.length]!)) mods[k as ModId] = (mods[k as ModId] ?? 0) + (v ?? 0)
  return {
    ...it, id: infernalId(it.id), level: it.level + INFERNAL_LEVEL, mods,
    ...(it.armor ? { armor: Math.round(it.armor * INFERNAL_MUL) } : {}),
    infernal: it.id, drop: { zone: it.drop.zone, src: 'infernal' as const }
  }
})

/** The Infernal twins of the uniques found in a zone (its drops, chests and boss). */
export const infernalsOfZone = (zone: ZoneId): string[] => INFERNALS.filter(i => i.drop.zone === zone).map(i => i.id)

export const ITEM_BY_ID: Readonly<Record<string, ItemDef>> = Object.fromEntries([...ITEMS, ...SMITHED, ...MYTHICS, ...AFTER_ITEMS, ...INFERNALS].map(i => [i.id, i]))

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

export const priceOf = (it: ItemDef): number => Math.round(TIER_PRICE[it.tier]! * (1 + (it.level % 5) * 0.06) * (it.infernal ? INFERNAL_PRICE : 1))

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
