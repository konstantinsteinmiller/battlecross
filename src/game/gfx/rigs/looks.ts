import { ITEM_BY_ID, TIER_COLOR, type EquipSlot } from '../../data/items'
import type { GearKind, HeadGear, Held, Look, OffHand } from './humanoid'
import { heroOutfitOf, type HeroGender } from '../../art/heroPortrait'

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
  // The whistle's gnomes (#136): a red pointed cap, a white beard, a small blade.
  gnome: L({ skin: '#e8b890', top: '#4f8a4a', bottom: '#6b4a2c', head: 'wizard', hair: '#d8483a', outfit: 'tunic', held: 'dagger', beard: '#f0ece4', trim: '#c9a24a', metal: '#b9c4d6' }),
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
  // The old bosses as mini-bosses (#74, D85): their kits, in colours and shapes of their own.
  // The Frost Thane: a hooded raider in bronze and black ice, an axe, no crown.
  frostThane: L({ skin: '#6f9ec2', top: '#1f2f44', bottom: '#18222f', head: 'horns', hair: '#c9d8e8', outfit: 'leather', held: 'axe', off: 'shield', pauldrons: true, trim: '#c98a4a', bulk: 1.12, beard: '#c9d8e8', cape: '#2a4a6a', metal: '#7fb8e0', eyeGlow: '#bfe6ff' }),
  // The Pit Lord: charred black and ember, an axe, a tail, no wings.
  pitLord: L({ skin: '#4a2028', top: '#1a0c10', bottom: '#120808', head: 'horns', hair: '#120808', outfit: 'bare', held: 'axe', trim: '#ff7a2a', bulk: 1.18, eyeGlow: '#ff9a3a', tail: '#3a1418', metal: '#ff9a3a', glow: '#ff6a2a' }),
  goblinTyrant: L({ skin: '#6f8f3a', top: '#3e3a48', bottom: '#2a2632', head: 'horns', hair: '#d8d0c0', ears: 'goblin', outfit: 'plate', held: 'hammer', trim: '#9a4ad0', bulk: 1.1, cape: '#4a1a6a', pauldrons: true, eye: '#ff6a3a', metal: '#8a8fa0' }),
  // The branch bosses (#74): each a look of its own, not a regular foe scaled up.
  goblinWarchief: L({ skin: '#4fa03a', top: '#5a3a24', bottom: '#3a2a1c', head: 'horns', hair: '#e8dcc0', ears: 'goblin', outfit: 'leather', held: 'axe', pauldrons: true, trim: '#c9a24a', bulk: 1.22, cape: '#8a2a1c', eye: '#ffd24a', metal: '#c9d3e4' }),
  banditBaron: L({ skin: '#d9a47e', top: '#2a3a6a', bottom: '#2a2420', head: 'hat', hair: '#2a1c14', outfit: 'leather', held: 'sword', off: 'dagger', trim: '#ffd24a', bulk: 1.1, beard: '#2a1c14', cape: '#6a1a2a', pauldrons: true, headCol: '#1c1a24', headTrim: '#ffd24a', metal: '#e8eef8' }),
  riftKnight: L({ skin: '#3a2466', top: '#1c1430', bottom: '#140c24', head: 'greathelm', hair: '#2a1a4a', outfit: 'plate', held: 'greatsword', off: 'none', pauldrons: true, trim: '#b06aff', bulk: 1.2, cape: '#3a1a6a', eyeGlow: '#e0a8ff', metal: '#5a4a8a', glow: '#b06aff' }),
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
  // Sunford's two newer teachers (#106).
  sfShadow: L({ skin: '#e8b894', top: '#3a4030', bottom: '#2a2a22', head: 'hood', hair: '#7a3a24', outfit: 'leather', held: 'dagger', off: 'dagger', trim: '#8ab07a', cape: '#3a4030' }),
  sfGeo: L({ skin: '#c89a70', top: '#7a6a44', bottom: '#4a4030', head: 'bald', hair: '#d8d0c0', outfit: 'robe', held: 'staff', trim: '#a8b86a', beard: '#d8d0c0', metal: '#7a6a5a', glow: '#c8b87a' }),
  trainerGeo: L({ skin: '#b8845a', top: '#8a6a3a', bottom: '#5a4424', head: 'hood', hair: '#8a6a3a', outfit: 'robe', held: 'none', trim: '#c79a5a' }),

  // ── Silverbridge (river blue and bridge silver are the town's colours) ──
  // The mayor: river-blue robe, silver trim, a ledger under her arm.
  mayorBrenna: L({ skin: '#e8b890', top: '#2f6f9a', bottom: '#2a3a54', head: 'bun', hair: '#7a3a24', outfit: 'robe', held: 'none', off: 'tome', trim: '#d8dde8', cape: '#1f4a6a' }),
  // The healer: a monk's pale robe, a fringe of brown hair, a calm green orb.
  // The alchemist: a moss-green apron over a lilac dress, a bun of red hair stuck with herbs, a bubbling flask.
  // The gamblers (#91, #92): a showwoman in purple and gold; a scruffy dice man in a
  // patched waistcoat; a sleek dealer in midnight blue with a jewelled cap.
  // ── The new Silverbridge masters (#86, #95), each dressed as its class ──
  // Windrunner: a green leather ranger, lime trim, a hood with a copper fringe peeking out, a pale ash bow with a lime glow.
  sbMasterWindrunner: L({ skin: '#e2b08a', top: '#5f8a3a', bottom: '#4a3b2a', head: 'hood', headCol: '#4f7a2a', hair: '#c9783a', style: 'ponytail', outfit: 'leather', held: 'bow', trim: '#c4f05a', cape: '#3f6a2a', metal: '#e0d0a8', glow: '#c4f05a', boots: 'leather' }),
  // Frostwarden: ice-blue plate, a white fur mantle, a frosted helm, a white beard and a crystal sword.
  sbMasterFrostwarden: L({ skin: '#e8c4a4', top: '#bfe0f8', bottom: '#4a6a8a', head: 'helm', headCol: '#d8eeff', hair: '#eef4fa', style: 'short', outfit: 'plate', held: 'sword', pauldrons: true, trim: '#a8d8ff', cape: '#f4f8ff', beard: '#eef4fa', metal: '#bfe6ff', glow: '#a8d8ff', bulk: 1.08 }),
  // Lightbringer: a white robe with dawn-rose trim and skirt, a golden bun, a staff and a softly glowing orb.
  sbMasterLightbringer: L({ skin: '#f0c8a8', top: '#fbf4f0', bottom: '#ffa8c8', head: 'bun', hair: '#e8c46a', outfit: 'robe', held: 'staff', off: 'orb', trim: '#ffa8c8', metal: '#e0b84a', glow: '#fff2a8' }),
  // ── Freed from the cages (#100) ──
  freedPeddler: L({ skin: '#e8c0a0', top: '#c87a3a', bottom: '#5a4a3a', head: 'hat', headCol: '#7a5a3a', hair: '#9a9a9a', style: 'short', outfit: 'apron', held: 'none', trim: '#f0d080', beard: '#9a9a9a', bulk: 1.1 }),
  freedHerbalist: L({ skin: '#d8a880', top: '#4a9a6a', bottom: '#5a4a32', head: 'long', hair: '#7a4a2a', outfit: 'robe', held: 'flask', trim: '#c8e8a0' }),
  freedFarmers: L({ skin: '#d8a078', top: '#a88a3a', bottom: '#4a5a6a', head: 'cap', headCol: '#8a6a3a', hair: '#5a3a22', style: 'short', outfit: 'tunic', held: 'none', trim: '#e8d8a0', beard: '#5a3a22' }),
  windDisciple: L({ skin: '#e8b88e', top: '#5ac8e0', bottom: '#3a4a3a', head: 'short', hair: '#3a2a1a', outfit: 'leather', held: 'bow', trim: '#d8f8a0', cape: '#4a8a3a', metal: '#e0d0a8', glow: '#c4f05a', boots: 'leather' }),
  frostDisciple: L({ skin: '#e0c0a8', top: '#8ab8ff', bottom: '#3a4a6a', head: 'short', hair: '#c8b890', style: 'short', outfit: 'plate', held: 'sword', trim: '#d8eeff', cape: '#c8e0f8', beard: '#c8b890', metal: '#bfe6ff', glow: '#a8d8ff' }),
  lightDisciple: L({ skin: '#c89070', top: '#fbf0e0', bottom: '#f0d060', head: 'bun', hair: '#2a1a12', outfit: 'robe', held: 'staff', trim: '#f0d060', metal: '#e0b84a', glow: '#fff2a8' }),
  // Beastcaller: a moss-green hunting coat, a grey fur hood over long grey hair, a beard and a walking staff.
  sbMasterBeastcaller: L({ skin: '#d9a47e', top: '#4a6a34', bottom: '#5a4430', head: 'hood', headCol: '#8a8278', hair: '#c8c4bc', style: 'long', outfit: 'leather', held: 'staff', trim: '#4fb85a', cape: '#5a4a34', beard: '#c8c4bc', metal: '#7a5a34', glow: '#4fb85a', boots: 'leather' }),
  // Elementalist: a prism-orchid robe, a fiery orange ponytail, a staff and an orb that glows magenta.
  sbMasterElementalist: L({ skin: '#f2c8a0', top: '#b04ac8', bottom: '#4a2a6a', head: 'ponytail', hair: '#ff8a3a', ribbon: '#5fd8ff', outfit: 'robe', held: 'staff', off: 'orb', trim: '#e86bff', metal: '#c9a24a', glow: '#e86bff' }),
  // Soul Warden: a periwinkle robe under a dusk-blue hood, long silver hair, a staff and a lantern-bright orb.
  sbMasterSoulwarden: L({ skin: '#e8c4a4', top: '#6f86e0', bottom: '#2f3a6a', head: 'hood', headCol: '#3f4a8a', hair: '#d8dce8', style: 'long', outfit: 'robe', held: 'staff', off: 'orb', trim: '#7f9cff', metal: '#8a7a6a', glow: '#a8c0ff' }),
  // Iron Monk: a jade tunic with a dark sash, grey trousers, bald with a long white beard, bare hands.
  sbMasterIronmonk: L({ skin: '#d9a47e', top: '#3fa86a', bottom: '#5a6a6a', head: 'bald', hair: '#e8e8e0', outfit: 'tunic', held: 'none', off: 'none', trim: '#2f5a44', beard: '#e8e8e0', gloves: 'none', boots: 'none' }),
  // Bard: a stage-pink doublet with gold trim, a feathered plum hat over copper hair, a sky-blue cape, a songbook (no lute on the rig).
  sbMasterBard: L({ skin: '#e8b890', top: '#ff8ad8', bottom: '#4a3a6a', head: 'hat', headCol: '#7a2a5a', headTrim: '#ffd24a', hair: '#c9783a', style: 'short', outfit: 'tunic', held: 'none', off: 'tome', trim: '#ffd24a', cape: '#5fb8e0' }),
  // The secret traders (#86): a stooped old collector in a dusty plum coat with
  // a monocle-bright orb; a river fence in a teal hood, a dagger at her belt.
  sbCollector: L({ skin: '#e8c4a4', top: '#5a2a4a', bottom: '#3a2a2a', head: 'bald', outfit: 'robe', held: 'none', off: 'orb', trim: '#c9a24a', beard: '#d8d8d0', glow: '#ffe07a' }),
  sbFence: L({ skin: '#d9a47e', top: '#1f5a5a', bottom: '#2a2a30', head: 'hood', hair: '#1f5a5a', outfit: 'leather', held: 'dagger', trim: '#c9a24a', cape: '#16303a' }),
  sbGambler: L({ skin: '#e8b890', top: '#7a2a8a', bottom: '#2a1c3a', head: 'hat', hair: '#1c1418', outfit: 'robe', held: 'none', off: 'orb', trim: '#ffd24a', cape: '#3a1c4a', glow: '#ffd24a' }),
  sunfordGambler: L({ skin: '#d9a47e', top: '#8a5f3a', bottom: '#4a3a2a', head: 'bandana', hair: '#5a3a24', outfit: 'tunic', held: 'none', off: 'tome', trim: '#e0a84a', beard: '#5a3a24' }),
  // The cup stand (#136): a quick-fingered girl in a yellow hood and a green apron, a bright orb for the gem.
  sunfordCups: L({ skin: '#e8b890', top: '#4a9a5a', bottom: '#3a3a52', head: 'hood', headCol: '#e8c23a', hair: '#c9783a', style: 'ponytail', outfit: 'apron', held: 'none', off: 'orb', trim: '#f0d060', glow: '#ff6a8a' }),
  oakGambler: L({ skin: '#f0c8a8', top: '#1f2a5a', bottom: '#141a3a', head: 'leathercap', hair: '#c9a24a', headCol: '#2a1f4a', outfit: 'leather', held: 'none', off: 'orb', trim: '#c9a24a', glow: '#8fd8ff' }),
  sbAlchemist: L({ skin: '#f2c8a0', top: '#8a6ab8', bottom: '#4a6a3a', head: 'bun', hair: '#d8583a', outfit: 'apron', held: 'flask', off: 'tome', trim: '#9ef06a', glow: '#9ef06a' }),
  sbHealer: L({ skin: '#e2b08a', top: '#e8eef4', bottom: '#9fb4c8', head: 'bald', outfit: 'robe', held: 'none', off: 'orb', trim: '#4f9fd6', beard: '#7a5a3a', glow: '#8dff9a' }),
  // The armourer: a sturdy mountain woman in a leather apron, red hair tied up, a hammer.
  sbArmorer: L({ skin: '#e2a888', top: '#7a3a2a', bottom: '#4a3424', head: 'bun', hair: '#c9483a', outfit: 'apron', held: 'hammer', trim: '#c9a24a', bulk: 1.15, metal: '#b9c4d6' }),
  // The weaponsmith: a dandy in burgundy and gold, a short cape, a gleaming sword.
  sbWeapons: L({ skin: '#e8c4a4', top: '#7a1f3a', bottom: '#2a2030', head: 'short', hair: '#1c1418', outfit: 'tunic', held: 'sword', trim: '#ffd24a', cape: '#2a1c3a', metal: '#f4f8ff' }),
  // The trinket kid: a patched green tunic, a leather cap over ginger hair, a pouch-orb of charms.
  sbJeweler: L({ skin: '#f2c8a0', top: '#5f9a4a', bottom: '#6a5a44', head: 'leathercap', hair: '#d8783a', style: 'spiky', headCol: '#8a5f3a', outfit: 'tunic', held: 'none', off: 'orb', trim: '#ffd24a', glow: '#ffe07a' }),

  // ── The Silverbridge masters (one per class, each dressed as its class) ──
  // Aegis: an old champion in silver plate, a storm-blue cape, a hammer and a shield; grey braids under the helm.
  sbMasterAegis: L({ skin: '#e8b890', top: '#d8dde8', bottom: '#4a5a78', head: 'helm', hair: '#c9ccd6', style: 'long', outfit: 'plate', held: 'hammer', off: 'shield', pauldrons: true, trim: '#4f8fd6', cape: '#2a4a8a', metal: '#eef2fa', bulk: 1.08 }),
  // Pyro: a scholar's deep-orange robe, a pointed hat, a grey beard and a staff with a small, steady flame.
  sbMasterPyro: L({ skin: '#f0c8a8', top: '#b84a1c', bottom: '#5a2a1c', head: 'wizard', hair: '#7a2a1c', outfit: 'robe', held: 'staff', trim: '#ffd84a', beard: '#c8c8d0', glow: '#ffb04a', metal: '#6a4a2a' }),
  // Shadow: a midnight-teal hood, light leather, two daggers.
  sbMasterShadow: L({ skin: '#e8b890', top: '#1f3a44', bottom: '#162a32', head: 'hood', hair: '#1f3a44', outfit: 'leather', held: 'dagger', off: 'dagger', trim: '#4fd0c0', cape: '#16303a' }),
  // Sovereign: a kindly noble in royal blue, a gold circlet, a long gold-lined cape, a rapier.
  sbMasterSovereign: L({ skin: '#f0c8a8', top: '#3f5fd6', bottom: '#2a2f5a', head: 'circlet', hair: '#c9a24a', style: 'short', outfit: 'robe', held: 'sword', trim: '#ffd84a', cape: '#7a1f3a', metal: '#f4f8ff' }),
  // Geo: a grandmother in moss green and earth brown, a grey bun, a wooden staff with an amber stone.
  sbMasterGeo: L({ skin: '#d9a47e', top: '#5f7a3a', bottom: '#6a4a2a', head: 'bun', hair: '#d8d8d0', outfit: 'robe', held: 'staff', trim: '#c79a5a', metal: '#7a5a34', glow: '#ffb84a' }),
  // Aether: a lecturer's brown coat with brass trim, goggles on white hair, a pistol and a battery pack.
  sbMasterAether: L({ skin: '#e2b08a', top: '#6a4a2a', bottom: '#3a3430', head: 'goggles', hair: '#e8e8f0', outfit: 'leather', held: 'gun', off: 'battery', trim: '#e0a84a', beard: '#e8e8f0', glow: '#4ff0c8', metal: '#c9a24a' }),
  // Chrono: a time-blue robe with brass trim, a circlet, a grey beard, a staff and a glowing orb.
  sbMasterChrono: L({ skin: '#e8c4a4', top: '#2a5ab8', bottom: '#1c3a7a', head: 'circlet', hair: '#c8ccd8', style: 'short', outfit: 'robe', held: 'staff', off: 'orb', trim: '#e0b84a', beard: '#c8ccd8', glow: '#7fd8ff' }),
  // Blood: a dark-red alchemist's coat, long black hair, a flask and her book of recipes.
  sbMasterBlood: L({ skin: '#f0d0c0', top: '#6a1c2a', bottom: '#2a1418', head: 'long', hair: '#1c1218', outfit: 'leather', held: 'flask', off: 'tome', trim: '#ff6a8a', cape: '#3a0e18', glow: '#ff4a6a' })
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
/**
 * The two heroes the player can be (roadmap #71). Same chibi, same gear, same
 * proportions; what tells them apart at a glance is the head: the boy's short
 * brown hair and blue eyes, the girl's auburn ponytail with a red ribbon,
 * green eyes, lashes and finer brows. The painted portraits (`hero-…` and
 * `hero-f-…`, `art/artSheet.ts`) are painted from exactly these.
 */
export const HERO_HEAD: Readonly<Record<HeroGender, { hair: string; eye: string; style: 'short' | 'ponytail'; fem: boolean }>> = {
  m: { hair: '#7a4a2a', eye: '#3f8fd6', style: 'short', fem: false },
  f: { hair: '#9a4526', eye: '#3fa66a', style: 'ponytail', fem: true }
}

/** Gloves and boots: cloth or leather by tier, plate for gauntlets and greaves. */
const wornKind = (kind: string, tier: number, plate: string): GearKind => (kind === plate ? 'plate' : tier <= 2 ? 'cloth' : 'leather')

/** The hero as the gear makes him (or her, `gender` 'f') look. Tier colours
 *  the trim; the body armour's class decides the outfit. */
/** Heroic and legendary steel. A deep gold: the cel light (×1.25) clips a pale
 *  one to flat white-yellow, and a full set read as one blank figure (#125). */
const HERO_GOLD = '#d9b04e'
/** A tier's colour on the rig: heroic orange and legendary gold a shade
 *  deeper than on the icons, for the same reason (the plate's breastplate and
 *  pauldrons are lit to 1.5× their trim, and the pale ones clip flat). */
const RIG_TIER: Record<number, string> = { 5: '#d9743c', 6: '#d9a531' }
const tierHex = (tier: number): string => RIG_TIER[tier] ?? TIER_COLOR[tier]!

export const heroLook = (equipped: Record<EquipSlot, string | null>, gender: HeroGender = 'm'): Look => {
  const who = HERO_HEAD[gender === 'f' ? 'f' : 'm']
  const main = equipped.main ? ITEM_BY_ID[equipped.main] : undefined
  const off = equipped.off ? ITEM_BY_ID[equipped.off] : undefined
  const body = equipped.body ? ITEM_BY_ID[equipped.body] : undefined
  const tier = body?.tier ?? 0
  const trim = tier ? tierHex(tier) : '#c9a24a'
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
    hair: who.hair,
    hero: true,
    eye: who.eye,
    // Bare-headed the hero wears the hair; under a helmet or a hat it is
    // tucked in (the girl's ponytail still shows below the rim).
    head: headGear ? (headGear === 'hat' && outfit === 'robe' ? 'wizard' : headGear) : who.style,
    style: who.style,
    ...(who.fem ? { fem: true } : {}),
    headCol: head ? (headKind === 'helm' || headKind === 'greathelm' ? (head.tier >= 5 ? HERO_GOLD : head.tier >= 3 ? '#bfe6ff' : '#c9d3e4') : HEAD_COL[headKind]) : undefined,
    headTrim: head ? tierHex(head.tier) : undefined,
    gloves: hands ? wornKind(hands.kind, hands.tier, 'gauntlets') : undefined,
    gloveTrim: hands ? tierHex(hands.tier) : undefined,
    boots: feet ? wornKind(feet.kind, feet.tier, 'greaves') : undefined,
    bootTrim: feet ? tierHex(feet.tier) : undefined,
    top: tops[outfit]!,
    bottom: outfit === 'plate' ? '#5a6a88' : '#3a4a6a',
    trim,
    outfit,
    held: main ? HELD_OF[main.kind] ?? 'sword' : 'none',
    off: off ? OFF_OF[off.kind] ?? 'none' : 'none',
    pauldrons: outfit === 'plate',
    cape: tier >= 3 ? trim : '#c9483a',
    metal: mainTier >= 5 ? HERO_GOLD : mainTier >= 3 ? '#bfe6ff' : '#d8dde8',
    glow: main ? TIER_COLOR[mainTier]! : '#7ff4ff'
  })
}

/** A stable key for a look (rig templates are cached by it). */
export const lookKey = (l: Look): string =>
  [
    l.skin, l.hair, l.head, l.top, l.bottom, l.trim, l.outfit, l.held, l.off, l.metal, l.glow, l.ears, l.eyeGlow, l.cape,
    l.wings, l.tail, l.beard, l.pauldrons ? 1 : 0, l.bulk ?? 1, l.eye, l.cowl ? 1 : 0, l.hero ? 1 : 0, l.style, l.headCol,
    l.headTrim, l.gloves, l.gloveTrim, l.boots, l.bootTrim, l.fem ? 1 : 0, l.ribbon, l.fierce ? 1 : 0
  ].join('|')
