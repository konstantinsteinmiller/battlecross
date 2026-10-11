/**
 * Everything the wiki shows, read from the game's own modules. Nothing here
 * restates a number: a balance change in src/game/data is on the site the
 * next time it is built.
 */
import en from '@/i18n/locales/en'
import { CLASSES, CLASS_IDS, SKILLS, SKILL_BY_ID, FIXED_EFFECT, ACTIVE_SLOTS, PASSIVE_SLOTS, priceOf as skillPriceOf, type ClassId, type SkillDef } from '@/game/data/skills'
import { ATTRS, ATTR_COLOR, ATTR_START, POINTS_PER_LEVEL, ATTR_EFFECTS, CAPS, type Attr } from '@/game/data/attributes'
import { ITEMS, SMITHED, ITEM_BY_ID, TIER_COLOR, EQUIP_SLOTS, slotOf, priceOf as itemPriceOf, type ItemDef, type ItemSlot, type ZoneId, type EquipSlot } from '@/game/data/items'
import { ZONES, ZONE_IDS, ZONE_FEATURES, TOWNS, MAP, NODE_BY_ID, FALLBACK_TRAINERS, type NpcDef, type TownId } from '@/game/data/zones'
import { QUESTS, FACTIONS, FACTION_COLOR, FRIEND_DISCOUNT, REP_FRIEND } from '@/game/data/quests'
import { ERRANDS } from '@/game/data/errands'
import { CAGES } from '@/game/data/cages'
import { PLANTS } from '@/game/data/plants'
import { ELIXIRS } from '@/game/data/elixirs'
import { ENEMY_BY_ID } from '@/game/data/enemies'
import { merchantTiers } from '@/game/data/encounters'
import { MAX_LEVEL, xpToReach, skillPrice } from '@/game/data/progression'
import { shelfTier } from '@/game/rareShelf'
import { BLESSING } from '@/game/contracts'

export { CLASSES, CLASS_IDS, SKILLS, SKILL_BY_ID, ACTIVE_SLOTS, PASSIVE_SLOTS, ATTRS, ATTR_COLOR, ATTR_START, POINTS_PER_LEVEL,
  ATTR_EFFECTS, CAPS, ITEMS, SMITHED, ITEM_BY_ID, TIER_COLOR, ZONES, ZONE_IDS, ZONE_FEATURES, TOWNS, MAP, QUESTS, FACTIONS,
  FACTION_COLOR, ERRANDS, CAGES, PLANTS, ELIXIRS, MAX_LEVEL, xpToReach, skillPrice, BLESSING, FRIEND_DISCOUNT, REP_FRIEND }
export type { ClassId, SkillDef, Attr, ItemDef, ItemSlot, ZoneId, TownId, EquipSlot }

// ─── Text ────────────────────────────────────────────────────────────────────

const dig = (key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), en)

/** The game's English text for a key, `{n}` filled from `vars`. */
export const t = (key: string, vars: Record<string, string | number> = {}): string => {
  const v = dig(key)
  if (typeof v !== 'string') return key.split('.').slice(-2, -1)[0] ?? key
  return v.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`))
}
const has = (key: string): boolean => typeof dig(key) === 'string'

export const IMG = 'img/'

export const ATTR_NAME: Record<Attr, string> = { str: 'Strength', dex: 'Dexterity', int: 'Intelligence', end: 'Endurance', skl: 'Skill', cha: 'Charisma' }
export const ATTR_SHORT: Record<Attr, string> = { str: 'STR', dex: 'DEX', int: 'INT', end: 'END', skl: 'SKL', cha: 'CHA' }

export const className = (c: ClassId): string => t(`class.${c}.name`)
export const classDesc = (c: ClassId): string => t(`class.${c}.desc`)
export const classIcon = (c: ClassId): string => `${IMG}icons/class-${c}.webp`

export const skillName = (s: SkillDef): string => t(`skill.${s.id}.name`)
export const skillDesc = (s: SkillDef): string => t(`skill.${s.id}.desc`, s.p)
/** Painted icons that exist (the rest draw a glyph in the class colour). */
const PAINTED_SKILLS = new Set(Object.keys(import.meta.glob('../../public/images/skills/*.webp')).map(p => p.split('/').pop()!.replace('.webp', '')))
const PAINTED_ITEMS = new Set(Object.keys(import.meta.glob('../../public/images/items/*.webp')).map(p => p.split('/').pop()!.replace('.webp', '')))
const PORTRAITS = new Set(Object.keys(import.meta.glob('../../public/images/portraits/*.webp')).map(p => p.split('/').pop()!.replace('.webp', '')))
export const skillIcon = (s: SkillDef): string | null => (PAINTED_SKILLS.has(s.id) ? `${IMG}skills/${s.id}.webp` : null)
export const scalingOf = (s: SkillDef): Attr | null => (s.kind === 'passive' || FIXED_EFFECT.has(s.id) ? null : s.scales)
export const skillCost = (s: SkillDef): number => skillPriceOf(s)

export const itemName = (i: ItemDef): string => t(`item.${i.id}.name`)
export const itemPassive = (i: ItemDef): string | null => (has(`item.${i.id}.passive`) ? t(`item.${i.id}.passive`) : null)
export const itemIcon = (i: ItemDef): string => (PAINTED_ITEMS.has(i.id) ? `${IMG}items/${i.id}.webp` : `${IMG}icons/slot-${i.slot}.webp`)
export const tierName = (n: number): string => t(`tier.${n}`)
export const slotName = (s: ItemSlot): string => t(`slot.${s}`)
export const itemPrice = (i: ItemDef): number => itemPriceOf(i)

const PCT = new Set(['armorPct', 'armorFromStr', 'block', 'dodge', 'damageReduction', 'physReduction', 'maxHpPct', 'stunDurationCut', 'damagePct',
  'critChance', 'critDamage', 'spellCrit', 'attackSpeed', 'moveSpeed', 'cdr', 'manaDiscount', 'lifesteal', 'physLifesteal', 'lifeDrainPct',
  'bossDamage', 'backstab', 'minionDamage', 'minionAttackSpeed', 'minionHp', 'freezeOnHit', 'heatBuildCut', 'heatDissipation', 'flaskDamage',
  'igniteBonus', 'stealthy', 'fortitude', 'evasionHaste', 'cauterize', 'tribute', 'timeDistort', 'entropy', 'bloodToMana', 'bleedHeal',
  'overheatCrit', 'chillOnHit', 'chillDamage', 'reactionDamage', 'packDamage', 'soulRise', 'chiOnHit', 'songLength', 'lowHealthDamage', 'loyalty', 'crumble', 'lastStand', 'heatArmor'])
/** One modifier as the game words it. */
export const modLine = (id: string, v: number): string => {
  const n = PCT.has(id) ? Math.round(v * 1000) / 10 : Math.round(v * 10) / 10
  return has(`mod.${id}`) ? t(`mod.${id}`, { n }) : `${id} ${n}`
}

export const zoneName = (z: string): string => t(`node.${z}.name`)
export const zoneDesc = (z: string): string => t(`node.${z}.desc`)
export const npcName = (id: string): string => (id === 'wanderer' ? t('npc.wanderer.name') : t(`npc.${id}.name`))
export const npcPortrait = (look: string): string | null => {
  const map: Record<string, string> = { smith: 'smith', peddler: 'peddler', dwarf: 'dwarf', tinker: 'tinker', fence: 'fence', healer: 'healer', elder: 'elder', captain: 'captain', goblinTrader: 'goblinTrader', sbArmorer: 'smith', sbWeapons: 'peddler', sbJeweler: 'peddler', sbCollector: 'peddler', sbFence: 'fence', freedPeddler: 'peddler' }
  const p = PORTRAITS.has(look) ? look : map[look]
  return p && PORTRAITS.has(p) ? `${IMG}portraits/${p}.webp` : null
}
export const enemyName = (id: string): string => t(`enemy.${id}`)
export const plantName = (id: string): string => t(`plant.${id}.name`)
export const factionName = (f: string): string => t(`faction.${f}`)

// ─── Progress: when a player usually gets somewhere ──────────────────────────

/** The level a hero usually has when he first walks into a place (the zone's
 *  band; a town once its neighbour is cleared). */
export const ARRIVE: Record<string, number> = {
  sunford: 1, plains: 1, hollows: 3, arena: 4, woods: 6, silverbridge: 6, outskirts: 8, oakhaven: 9, crags: 11, mines: 13, ironhold: 14,
  tundra: 16, temple: 17, citadel: 21, peak: 24, fortress: 26, rift: 30
}
for (const z of ZONE_IDS) ARRIVE[z] = ZONES[z].min

/** World flags in words: what the player does to set one. */
export const FLAG_HOW: Record<string, { text: string; at: number }> = {
  goblinPact: { text: 'Goblin King: offer the trade pact (needs 8 CHA)', at: 5 },
  goblinSlain: { text: 'Goblin King: end his reign', at: 5 },
  goblinRansom: { text: 'Goblin King: take the ransom', at: 5 },
  arenaOpen: { text: 'Finish the Goblin King quest (any choice)', at: 5 },
  oakhavenSaved: { text: 'Siege of Oakhaven: defend the town', at: 10 },
  oakhavenFallen: { text: 'Siege of Oakhaven: open the gate for the Syndicate', at: 10 },
  coreOrder: { text: 'Heart of Ironhold: shatter the core', at: 15 },
  coreCircle: { text: 'Heart of Ironhold: give it to the Circle (needs 18 INT)', at: 15 },
  coreSold: { text: 'Heart of Ironhold: sell it to the Syndicate', at: 15 },
  oracleFreed: { text: 'Drowned Oracle: break her chains', at: 20 },
  oracleSlain: { text: 'Drowned Oracle: take the hourglass', at: 20 },
  dragonSlain: { text: 'Void Dragon: slay it', at: 25 },
  dragonPact: { text: 'Void Dragon: strike a pact (needs 25 CHA)', at: 25 },
  throneDone: { text: 'Decide the Empty Throne', at: 30 },
  freedPeddler: { text: 'Free the caged peddler in Sunford Plains (find the key in the zone)', at: 1 },
  freedHerbalist: { text: 'Free the caged herbalist in the Goblin Hollows', at: 3 },
  freedFarmers: { text: 'Free the caged farmers in the Whispering Woods', at: 6 },
  freedWindDisciple: { text: 'Free the iron cage in the Ashen Crags', at: 11 },
  freedFrostDisciple: { text: 'Free the iron cage in the Frostbite Tundra', at: 16 },
  freedLightDisciple: { text: 'Free the iron cage in the Sunken Temple', at: 17 },
  collectorOpen: { text: 'Do Alder Vane\'s favour (6 Treants in the Woods + 3 Moonbells)', at: 7 },
  mirelaOpen: { text: 'Do Mirela Thorne\'s favour (15 Bandits in the Outskirts, then talk to Tam Marlow)', at: 9 },
  foundChrono: { text: 'Meet the Keeper of Hours (clear the Sunken Temple; Dragon\'s Peak if the oracle was slain)', at: 20 },
  foundBlood: { text: 'Meet Doctor Sangrel (clear the Citadel of the Void, or betray Oakhaven)', at: 21 },
  foundWindrunner: { text: 'Pass Sefa Galewing\'s test, or free Kestrel Vane in the Ashen Crags', at: 11 },
  foundFrostwarden: { text: 'Pass Halvard Rimeheart\'s test, or free Ivor Hask in the Frostbite Tundra', at: 13 },
  foundLightbringer: { text: 'Pass Sister Auriel\'s test, or free Sister Aurelle in the Sunken Temple', at: 13 },
  foundBeastcaller: { text: 'Pass Old Rowan Thistlefoot\'s test', at: 7 }
}

// ─── Where every class is taught ─────────────────────────────────────────────

export interface Teacher {
  npc: string
  cls: ClassId
  place: string
  /** In words, what opens this teacher (empty: always there). */
  how: string
  /** The level a player can usually reach this teacher. */
  at: number
  secret?: boolean
  town: boolean
}

const npcGate = (n: NpcDef): { how: string; at: number } => {
  const parts: string[] = []
  let at = 0
  for (const f of [...(n.needs ?? []), ...(n.secret ? [n.secret] : [])]) {
    const h = FLAG_HOW[f]
    parts.push(h ? h.text : f)
    at = Math.max(at, h?.at ?? 0)
  }
  for (const f of n.not ?? []) {
    const h = FLAG_HOW[f]
    parts.push(`Gone if: ${h ? h.text.replace(/^.*?: /, '') : f}`)
  }
  return { how: parts.join(' · '), at }
}

export const TEACHERS: Teacher[] = []
for (const town of Object.keys(TOWNS) as TownId[]) {
  for (const n of TOWNS[town].npcs) {
    if (n.role !== 'trainer' || !n.cls) continue
    const g = npcGate(n)
    TEACHERS.push({ npc: n.id, cls: n.cls, place: town, how: g.how, at: Math.max(ARRIVE[town]!, g.at), secret: !!n.secret, town: true })
  }
}
for (const node of MAP) {
  if (!node.trainer) continue
  const tr = node.trainer
  const not = (tr.not ?? []).map(f => FLAG_HOW[f]?.text.replace(/^.*?: /, '') ?? f)
  TEACHERS.push({ npc: tr.npc, cls: tr.cls, place: node.id, how: `Found after clearing ${zoneName(node.id)}${not.length ? ` (unless you chose: ${not.join(', ')})` : ''}`, at: ZONES[node.id as ZoneId].max, secret: true, town: false })
}
for (const fb of FALLBACK_TRAINERS) {
  TEACHERS.push({ npc: fb.npc, cls: fb.cls, place: fb.node, how: `Found after clearing ${zoneName(fb.node)} if the oracle was slain`, at: ZONES[fb.node as ZoneId].max, secret: true, town: false })
}
export const teachersOf = (c: ClassId): Teacher[] => TEACHERS.filter(x => x.cls === c).sort((a, b) => a.at - b.at)
/** The earliest level a class can usually be learned at all. */
export const classOpensAt = (c: ClassId): number => Math.min(...teachersOf(c).map(x => x.at))
export const placeName = (p: string): string => zoneName(p)

// ─── Who sells what ──────────────────────────────────────────────────────────

export interface Seller {
  npc: string
  look: string
  place: string
  tiers: number[]
  slots: ItemSlot[]
  how: string
  at: number
  secret?: boolean
  kind: 'shop' | 'shelf' | 'wanderer'
}

export const SHOPS: Seller[] = []
for (const town of Object.keys(TOWNS) as TownId[]) {
  for (const n of TOWNS[town].npcs) {
    if (n.role !== 'shop' || !n.stock) continue
    const g = npcGate(n)
    SHOPS.push({ npc: n.id, look: n.look, place: town, tiers: n.stock.tiers, slots: n.stock.slots, how: g.how, at: Math.max(ARRIVE[town]!, g.at), secret: !!n.secret, kind: 'shop' })
  }
}

export interface Source { kind: 'drop' | 'shop' | 'shelf' | 'wanderer' | 'smith' | 'quest'; text: string; at: number; place?: string; npc?: string; how?: string }

const SRC_WORD: Record<string, string> = { mob: 'Monster drop', chest: 'Chests', boss: 'Boss drop', secret: 'Secret chest', smith: 'Forged' }

/** Every way to get an item, earliest first. */
export const sourcesOf = (i: ItemDef): Source[] => {
  const out: Source[] = []
  if (i.drop.src === 'smith') {
    out.push({ kind: 'smith', text: 'Forged at a smithy from ore (any town smith)', at: i.level })
  } else {
    const z = i.drop.zone
    out.push({ kind: 'drop', text: `${SRC_WORD[i.drop.src]} — ${zoneName(z)}`, place: z, at: Math.max(ZONES[z].min, i.drop.src === 'boss' ? ZONES[z].max : ZONES[z].min) })
    // The Void Rift's chests hold the Dread Fortress's chest pieces.
    if (z === 'fortress' && (i.drop.src === 'chest')) out.push({ kind: 'drop', text: `Chests — ${zoneName('rift')}`, place: 'rift', at: 30 })
  }
  for (const q of QUESTS) for (const c of q.choices) if (c.item === i.id) out.push({ kind: 'quest', text: `Quest reward — ${t(`quest.${q.id}.title`)}: “${t(`quest.${q.id}.${c.id}.label`)}”`, at: FLAG_HOW[c.flags[0]!]?.at ?? 20 })
  if (i.tier === 6 || i.drop.src === 'smith') return out.sort((a, b) => a.at - b.at)
  for (const s of SHOPS) {
    if (s.slots.includes(i.slot) && s.tiers.includes(i.tier)) out.push({ kind: 'shop', npc: s.npc, place: s.place, how: s.how, at: s.at, text: `${npcName(s.npc)} — ${zoneName(s.place)}` })
    else if (shelfTier(s) === i.tier) out.push({ kind: 'shelf', npc: s.npc, place: s.place, how: s.how, at: s.at, text: `${npcName(s.npc)}'s rare shelf — ${zoneName(s.place)} (3 random pieces a day)` })
  }
  // Pip the Wanderer on the roads: two tiers around the hero's level.
  if (['main', 'off', 'body', 'trinket'].includes(i.slot)) {
    for (let lv = 1; lv <= MAX_LEVEL; lv++) {
      if (merchantTiers(lv).includes(i.tier)) {
        out.push({ kind: 'wanderer', npc: 'wanderer', at: Math.max(lv, 3), text: `${npcName('wanderer')} — a road encounter on the world map (from about level ${Math.max(lv, 3)})` })
        break
      }
    }
  }
  return out.sort((a, b) => a.at - b.at)
}
export const earliestOf = (i: ItemDef): Source | undefined => sourcesOf(i)[0]

export const ALL_ITEMS: ItemDef[] = [...ITEMS, ...SMITHED]
export const EQUIP_SLOT_LIST = EQUIP_SLOTS
export const slotOfEquip = slotOf

// ─── Skills, per level ───────────────────────────────────────────────────────

export const skillsByClass = (c: ClassId): SkillDef[] => SKILLS.filter(s => s.cls === c).sort((a, b) => a.level - b.level)
export const enemy = (id: string) => ENEMY_BY_ID[id]
export const node = (id: string) => NODE_BY_ID[id]
export const skillReqText = (s: SkillDef): string =>
  [`Lv ${s.level}`, ...Object.entries(s.req).map(([a, v]) => `${v} ${ATTR_SHORT[a as Attr]}`)].join(' · ')
