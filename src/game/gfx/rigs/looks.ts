import { ITEM_BY_ID, TIER_COLOR, type EquipSlot } from '../../data/items'
import type { GearKind, HeadGear, Held, Look, OffHand } from './humanoid'
import { heroOutfitOf } from '../../art/heroPortrait'

/**
 * Who looks like what. Every two-legged thing in the game is one `Look` on the
 * shared chibi rig (`humanoid.ts`): monsters, minions, townsfolk, trainers —
 * and the hero, whose look is read off the gear he is wearing.
 */

const L = (l: Partial<Look> & Pick<Look, 'skin' | 'top'>): Look => ({
  hair: '#5a3b24', head: 'short', bottom: '#4a4458', trim: '#c9a24a', outfit: 'tunic', held: 'none', off: 'none', ears: 'none', ...l
})

const GOBLIN = '#7bc74d'
const BONE = '#e8e2cf'

export const LOOKS: Readonly<Record<string, Look>> = {
  // ── Tier 1 ──
  goblin: L({ skin: GOBLIN, top: '#8a5a34', bottom: '#6b4a2c', head: 'bald', ears: 'goblin', outfit: 'rags', held: 'dagger', metal: '#b9c4d6' }),
  goblinSlinger: L({ skin: '#9bd45a', top: '#7a4f2e', bottom: '#5d4128', head: 'bandana', hair: '#c9483a', ears: 'goblin', outfit: 'rags', held: 'sling' }),
  bandit: L({ skin: '#e2b08a', top: '#8c4a3a', bottom: '#4a3b34', head: 'bandana', hair: '#c9483a', outfit: 'leather', held: 'sword', trim: '#3b2f2a' }),
  banditArcher: L({ skin: '#d9a47e', top: '#5f7a4a', bottom: '#4a3b34', head: 'hood', hair: '#4f6a3a', outfit: 'leather', held: 'bow', trim: '#3b2f2a' }),
  banditChief: L({ skin: '#d9a47e', top: '#a03a2c', bottom: '#3b2f2a', head: 'horns', hair: '#e8e2cf', outfit: 'leather', held: 'axe', pauldrons: true, trim: '#5a4a44', bulk: 1.12, beard: '#3b2a22', cape: '#5a1f1a' }),
  goblinKing: L({ skin: '#58c23f', top: '#7a2f8a', bottom: '#4a2c5a', head: 'crown', hair: '#58c23f', ears: 'goblin', outfit: 'robe', held: 'club', trim: '#ffd24a', bulk: 1.2, cape: '#c9483a' }),

  // ── Tier 2 ──
  captain: L({ skin: '#e2b08a', top: '#7a2a24', bottom: '#2f2a34', head: 'helm', hair: '#8a8fa0', outfit: 'plate', held: 'sword', off: 'shield', pauldrons: true, trim: '#8a8fa0', metal: '#d8dde8' }),
  warlord: L({ skin: '#c9906e', top: '#5a1f1a', bottom: '#241c22', head: 'greathelm', hair: '#3a3440', outfit: 'plate', held: 'greatsword', pauldrons: true, trim: '#c9483a', bulk: 1.18, cape: '#8a1f1a', metal: '#b9c4d6' }),

  // ── Tier 3 ──
  cultist: L({ skin: '#cdb8d6', top: '#4a2a6a', bottom: '#2f1c44', head: 'hood', hair: '#3a1f55', outfit: 'robe', held: 'staff', trim: '#b04adf', glow: '#d28bff', eyeGlow: '#d28bff' }),

  // ── Tier 4 ──
  frostGiant: L({ skin: '#9fd4f2', top: '#5a7a9a', bottom: '#3f5a78', head: 'horns', hair: '#e8f4ff', outfit: 'rags', held: 'club', trim: '#e8f4ff', bulk: 1.25, beard: '#e8f4ff' }),
  skeleton: L({ skin: BONE, top: BONE, bottom: '#bdb6a2', head: 'skull', outfit: 'bare', held: 'sword', metal: '#9aa4b8', eyeGlow: '#7dff8a' }),
  necromancer: L({ skin: '#b8c8b0', top: '#2a2438', bottom: '#1c1828', head: 'hood', hair: '#1c1828', outfit: 'robe', held: 'scythe', trim: '#7d5fe0', eyeGlow: '#9f7bff', glow: '#9f7bff' }),
  frostJarl: L({ skin: '#8fc8ee', top: '#34506e', bottom: '#263a52', head: 'crown', hair: '#f4fbff', outfit: 'plate', held: 'hammer', pauldrons: true, trim: '#bfe6ff', bulk: 1.28, beard: '#f4fbff', cape: '#e8f4ff', metal: '#bfe6ff' }),

  // ── Tier 5 ──
  demon: L({ skin: '#d8404a', top: '#3a1c24', bottom: '#2a141c', head: 'horns', hair: '#2a141c', outfit: 'bare', held: 'axe', trim: '#ffb04a', bulk: 1.2, eyeGlow: '#ffd84a', tail: '#b8303a', wings: '#7a1c28', metal: '#4a3038' }),
  warden: L({ skin: '#6a4a9a', top: '#2a1c4a', bottom: '#1c1234', head: 'greathelm', hair: '#3a2a6a', outfit: 'plate', held: 'scythe', pauldrons: true, trim: '#a45cff', bulk: 1.16, cape: '#4a2a8a', eyeGlow: '#d28bff', metal: '#8a6ad0' }),

  // ── Tier 6 ──
  doomKnight: L({ skin: '#5a3038', top: '#2a1c24', bottom: '#1a1218', head: 'greathelm', hair: '#3a2028', outfit: 'plate', held: 'greatsword', off: 'none', pauldrons: true, trim: '#c0364a', bulk: 1.15, cape: '#7a1c28', eyeGlow: '#ff5a4a', metal: '#6a4048' }),
  imp: L({ skin: '#ff6a4a', top: '#8a2a1c', bottom: '#6a1c14', head: 'horns', hair: '#3a141c', outfit: 'bare', held: 'none', ears: 'pointy', eyeGlow: '#ffd84a', tail: '#d84a30', wings: '#a8301c' }),
  archDemon: L({ skin: '#c8283a', top: '#2a1018', bottom: '#1a0a10', head: 'horns', hair: '#1a0a10', outfit: 'plate', held: 'greatsword', pauldrons: true, trim: '#ffb04a', bulk: 1.3, eyeGlow: '#ffe07a', tail: '#a01c2c', wings: '#5a1020', cape: '#3a0a14', metal: '#ff7a3a' }),

  // ── Faction ambushers ──
  orderGuard: L({ skin: '#e8b890', top: '#d8dde8', bottom: '#6a7488', head: 'helm', hair: '#d8dde8', outfit: 'plate', held: 'sword', off: 'shield', pauldrons: true, trim: '#ffd84a', metal: '#eef2fa' }),
  syndicate: L({ skin: '#d9a47e', top: '#2f2a44', bottom: '#201c30', head: 'hood', hair: '#2f2a44', outfit: 'leather', held: 'dagger', off: 'dagger', trim: '#9c7bff', cape: '#3a3458' }),

  // ── The hero's troops ──
  royalGuard: L({ skin: '#e8b890', top: '#c9d3e4', bottom: '#6a7488', head: 'helm', hair: '#c9d3e4', outfit: 'plate', held: 'sword', off: 'shield', pauldrons: true, trim: '#ffd84a', metal: '#eef2fa' }),
  royalArcher: L({ skin: '#e8b890', top: '#3f7a5a', bottom: '#4a4458', head: 'hood', hair: '#3f7a5a', outfit: 'leather', held: 'bow', trim: '#ffd84a' }),
  royalMage: L({ skin: '#cfe4ff', top: '#5f8fd6', bottom: '#3f5fa0', head: 'wizard', hair: '#5f8fd6', outfit: 'robe', held: 'staff', trim: '#ffd84a', glow: '#bfe6ff', ghost: true }),

  // ── Townsfolk ──
  smith: L({ skin: '#d9a47e', top: '#8a5a44', bottom: '#4a3b34', head: 'bald', outfit: 'apron', held: 'hammer', trim: '#5a4a44', beard: '#5a3b24', bulk: 1.1, metal: '#8a8fa0' }),
  peddler: L({ skin: '#e2b08a', top: '#5f8f6a', bottom: '#6a5a44', head: 'cap', hair: '#a85a3a', outfit: 'tunic', held: 'none', off: 'tome' }),
  elder: L({ skin: '#e8c4a4', top: '#7a6a9a', bottom: '#5a4a7a', head: 'long', hair: '#e8e8f0', outfit: 'robe', held: 'staff', beard: '#e8e8f0', glow: '#ffe9a8' }),
  healer: L({ skin: '#f0c8a8', top: '#f4f0e8', bottom: '#c8c0b0', head: 'bun', hair: '#c9783a', outfit: 'robe', held: 'none', off: 'orb', trim: '#67e08a', glow: '#8dff9a' }),
  goblinTrader: L({ skin: GOBLIN, top: '#c9a24a', bottom: '#6b4a2c', head: 'cap', hair: '#8a2a8a', ears: 'goblin', outfit: 'tunic', held: 'none', off: 'tome' }),
  fence: L({ skin: '#c9906e', top: '#2f2a44', bottom: '#201c30', head: 'hood', hair: '#2f2a44', outfit: 'robe', held: 'none', off: 'orb', trim: '#9c7bff', glow: '#b48cff' }),
  dwarf: L({ skin: '#e2a888', top: '#6a4a34', bottom: '#4a3424', head: 'helm', hair: '#8a8fa0', outfit: 'apron', held: 'hammer', beard: '#c9783a', bulk: 1.18, trim: '#c9a24a', metal: '#b9c4d6' }),
  tinker: L({ skin: '#e2b08a', top: '#4a7a8a', bottom: '#3a4a54', head: 'goggles', hair: '#e8c44a', outfit: 'apron', held: 'gun', trim: '#4ff0c8', glow: '#4ff0c8' }),
  // The folk of the towns (no part in the story: `data/zones.ts` TownDef.folk).
  villager: L({ skin: '#e8b890', top: '#c97a3a', bottom: '#5a4a3a', head: 'short', hair: '#7a4a2a', outfit: 'tunic', trim: '#5a3a24' }),
  villagerF: L({ skin: '#f0c8a8', top: '#d86a7a', bottom: '#f4ead2', head: 'bun', hair: '#b8642a', outfit: 'robe', trim: '#f4ead2' }),
  farmer: L({ skin: '#d9a47e', top: '#7aa84a', bottom: '#6a5a3a', head: 'cap', hair: '#c8a050', outfit: 'apron', trim: '#a8884a' }),
  child: L({ skin: '#f2c8a0', top: '#4f8fd6', bottom: '#4a4458', head: 'spiky', hair: '#e8b84a', outfit: 'tunic', trim: '#ffd84a' }),
  childF: L({ skin: '#e8b890', top: '#ffb04a', bottom: '#8a5ab0', head: 'long', hair: '#5a3424', outfit: 'robe', trim: '#ff8ab0' }),
  squire: L({ skin: '#f0c8a8', top: '#8a9ab8', bottom: '#4a4458', head: 'leathercap', hair: '#a85a3a', style: 'short', headCol: '#8a5f3a', outfit: 'leather', held: 'sword', trim: '#3f5fd6' }),
  townGuard: L({ skin: '#e2b08a', top: '#3f5fd6', bottom: '#2f3a5a', head: 'helm', hair: '#c9d3e4', outfit: 'plate', held: 'sword', off: 'shield', trim: '#c9d3e4', metal: '#d8dde8' }),
  merchantF: L({ skin: '#c9906e', top: '#3f9a8a', bottom: '#f2e0b0', head: 'bun', hair: '#2a2028', outfit: 'robe', trim: '#ffd24a', off: 'tome' }),
  survivor: L({ skin: '#d9a47e', top: '#7a6a5a', bottom: '#4a4038', head: 'bandana', hair: '#6a5a4a', outfit: 'rags', trim: '#5a4a3a' }),
  miner: L({ skin: '#e2a888', top: '#5a6a7a', bottom: '#3a3430', head: 'helm', hair: '#d8a050', headCol: '#c9a24a', outfit: 'apron', beard: '#a85a2a', bulk: 1.15, trim: '#8a6a4a' }),
  dwarfGuard: L({ skin: '#e2a888', top: '#6a4a34', bottom: '#3a3430', head: 'helm', hair: '#8a8fa0', outfit: 'plate', held: 'axe', off: 'shield', beard: '#5a3424', bulk: 1.18, trim: '#c9a24a', metal: '#b9c4d6' }),

  // ── Trainers (one per class, dressed as its archetype) ──
  trainerAegis: L({ skin: '#e8b890', top: '#c9d3e4', bottom: '#5a6a88', head: 'helm', hair: '#c9d3e4', outfit: 'plate', held: 'sword', off: 'shield', pauldrons: true, trim: '#ffd84a', cape: '#3f5fd6', metal: '#eef2fa' }),
  trainerShadow: L({ skin: '#d9a47e', top: '#2a2438', bottom: '#1c1828', head: 'hood', hair: '#2a2438', outfit: 'leather', held: 'dagger', off: 'dagger', trim: '#9c7bff', cape: '#2a2438' }),
  trainerPyro: L({ skin: '#f0c8a8', top: '#c9482a', bottom: '#8a2a1c', head: 'hood', hair: '#c9482a', outfit: 'robe', held: 'staff', trim: '#ffd84a', glow: '#ff9a2a' }),
  trainerSovereign: L({ skin: '#f0c8a8', top: '#7a3fa0', bottom: '#4a2a6a', head: 'crown', hair: '#c9a24a', outfit: 'robe', held: 'none', trim: '#ffd84a', cape: '#c9483a' }),
  trainerChrono: L({ skin: '#cfe0ff', top: '#3f6fd6', bottom: '#2a4a9a', head: 'bun', hair: '#5f9fff', outfit: 'robe', held: 'wand', off: 'orb', trim: '#bfe6ff', glow: '#7fd8ff' }),
  trainerBlood: L({ skin: '#f0d0c0', top: '#f0ece4', bottom: '#8a2a3a', head: 'long', hair: '#c8283a', outfit: 'robe', held: 'flask', off: 'syringe', trim: '#c8283a', glow: '#ff4a6a', ears: 'pointy' }),
  trainerAether: L({ skin: '#e2b08a', top: '#3a5a8a', bottom: '#4a4a54', head: 'goggles', hair: '#f0d04a', outfit: 'leather', held: 'gun', trim: '#4ff0c8', glow: '#4ff0c8' }),
  trainerGeo: L({ skin: '#b8845a', top: '#8a6a3a', bottom: '#5a4424', head: 'hood', hair: '#8a6a3a', outfit: 'robe', held: 'none', trim: '#c79a5a' })
}

const HELD_OF: Record<string, Held> = {
  sword: 'sword', dagger: 'dagger', greatsword: 'greatsword', axe: 'axe', hammer: 'hammer', staff: 'staff', wand: 'wand',
  gun: 'gun', cannon: 'cannon'
}
const OFF_OF: Record<string, OffHand> = { shield: 'shield', tome: 'tome', orb: 'orb', syringe: 'syringe', battery: 'battery' }
/** Head items by kind → what is drawn on the head. */
const HEAD_OF: Record<string, HeadGear> = {
  hood: 'hood', cap: 'leathercap', helm: 'helm', greathelm: 'greathelm', circlet: 'circlet', hat: 'hat'
}
/** What a head item is made of, where its tier does not colour it. */
const HEAD_COL: Record<string, string> = {
  hood: '#4a5a8a', cap: '#8a5f3a', helm: '#c9d3e4', greathelm: '#b9c4d6', circlet: '#ffd24a', hat: '#6a4a8a'
}
const HAIR = '#7a4a2a'

/** Gloves and boots: cloth or leather by tier, plate for gauntlets and greaves. */
const wornKind = (kind: string, tier: number, plate: string): GearKind => (kind === plate ? 'plate' : tier <= 2 ? 'cloth' : 'leather')

/** The hero as his gear makes him look. Tier colours the trim; the body
 *  armour's class decides the outfit. */
export const heroLook = (equipped: Record<EquipSlot, string | null>): Look => {
  const main = equipped.main ? ITEM_BY_ID[equipped.main] : undefined
  const off = equipped.off ? ITEM_BY_ID[equipped.off] : undefined
  const body = equipped.body ? ITEM_BY_ID[equipped.body] : undefined
  const tier = body?.tier ?? 0
  const trim = tier ? TIER_COLOR[tier]! : '#c9a24a'
  // Head, hands and feet: slots a newer save has and an older one does not.
  const worn = equipped as Partial<Record<string, string | null>>
  const head = ITEM_BY_ID[worn.head ?? '']
  const hands = ITEM_BY_ID[worn.hands ?? '']
  const feet = ITEM_BY_ID[worn.feet ?? '']
  const headKind: string = head?.kind ?? ''
  const headGear = HEAD_OF[headKind]
  // One mapping for the rig and the painted portrait (`art/heroPortrait.ts`).
  const outfit: Look['outfit'] = heroOutfitOf(body?.kind)
  const tops: Record<string, string> = { plate: '#c9d3e4', robe: '#4a5fd6', leather: '#8a5f3a', tunic: '#3f7fd6' }
  const mainTier = main?.tier ?? 1
  return L({
    skin: '#f2c8a0',
    hair: HAIR,
    hero: true,
    eye: '#3f8fd6',
    // Bare-headed he wears his hair; under a helmet or a hat it is tucked in.
    head: headGear ? (headGear === 'hat' && outfit === 'robe' ? 'wizard' : headGear) : 'short',
    style: 'short',
    headCol: head ? (headKind === 'helm' || headKind === 'greathelm' ? (head.tier >= 5 ? '#ffe9a8' : head.tier >= 3 ? '#bfe6ff' : '#c9d3e4') : HEAD_COL[headKind]) : undefined,
    headTrim: head ? TIER_COLOR[head.tier] : undefined,
    gloves: hands ? wornKind(hands.kind, hands.tier, 'gauntlets') : undefined,
    gloveTrim: hands ? TIER_COLOR[hands.tier] : undefined,
    boots: feet ? wornKind(feet.kind, feet.tier, 'greaves') : undefined,
    bootTrim: feet ? TIER_COLOR[feet.tier] : undefined,
    top: tops[outfit]!,
    bottom: outfit === 'plate' ? '#5a6a88' : '#3a4a6a',
    trim,
    outfit,
    held: main ? HELD_OF[main.kind] ?? 'sword' : 'none',
    off: off ? OFF_OF[off.kind] ?? 'none' : 'none',
    pauldrons: outfit === 'plate',
    cape: tier >= 3 ? trim : '#c9483a',
    metal: mainTier >= 5 ? '#ffe9a8' : mainTier >= 3 ? '#bfe6ff' : '#d8dde8',
    glow: main ? TIER_COLOR[mainTier]! : '#7ff4ff'
  })
}

/** A stable key for a look (rig templates are cached by it). */
export const lookKey = (l: Look): string =>
  [
    l.skin, l.hair, l.head, l.top, l.bottom, l.trim, l.outfit, l.held, l.off, l.metal, l.glow, l.ears, l.eyeGlow, l.cape,
    l.wings, l.tail, l.beard, l.pauldrons ? 1 : 0, l.bulk ?? 1, l.eye, l.cowl ? 1 : 0, l.hero ? 1 : 0, l.style, l.headCol,
    l.headTrim, l.gloves, l.gloveTrim, l.boots, l.bootTrim
  ].join('|')
