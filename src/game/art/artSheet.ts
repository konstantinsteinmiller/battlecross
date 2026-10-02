import { ITEMS, TIER_COLOR, type ItemDef } from '../data/items'
import { CLASSES, CLASS_IDS, skillsOf, type ClassId } from '../data/skills'

/**
 * ─── The art manifest ────────────────────────────────────────────────────────
 *
 * What a painter can replace, on which reference sheet it goes out, and the
 * prompt it goes out with. The game already loads painted files by name
 * (`game/assets/overrides.ts`); this module is the other half of that round
 * trip: the dev bench (`views/ArtSheets.vue`) draws every sheet from it, the
 * tools (`tools/art-prompts.mjs`, `art-status.mjs`, `slice-sheets.mjs`) read
 * it or the `sheet-index.json` built from it, and the Art Desk sends the
 * prompt blocks it writes.
 *
 * Pure TypeScript on purpose: no `.vue`, no canvas, no `import.meta.env`, so
 * plain Node can import it (`tools/ts-resolve.mjs`).
 *
 * THE LATTICE IS THE CONTRACT. Every panel is one cell (256 px square, or
 * 256 x 288 on the three-by-two sheets, see `TALL`), counted from the sheet's
 * origin, with no gutter and no padding, so a painted sheet is cut back with
 * integer arithmetic. Captions live on the separate key sheet.
 *
 * Every sheet is 4:3, 1:1 or 16:9: the shapes the image model offers.
 *
 * Not in here, by decision: the hero's portrait (code-drawn, it follows the
 * gear worn), `voidLord` (not a speaker), the status icons (vector only).
 */

/** One panel of a sheet, in px. */
export const CELL = 256
/**
 * The height of a panel on a three-by-two sheet. With square panels that
 * sheet is 3:2, a shape the image model does not offer; a return of any other
 * shape re-composes the grid. 256 x 288 panels make it 768 x 576, exactly 4:3,
 * with no blank panel for the model to invent content for and still one class
 * (one accent colour) per sheet.
 */
export const TALL = 288
/** How much of its panel a drawing's own box takes: the glyph's inset in
 *  `ArtIcon` (10 % a side), so a painted icon lands where the drawn one was.
 *  The margin around it is not empty by rule: a glyph that runs past its box
 *  is drawn whole (see `placeOf` in the bench). */
export const REF_SCALE = 0.8

// ─── What the renderer can load ──────────────────────────────────────────────

export type ArtKind = 'items' | 'skills' | 'portraits' | 'ui' | 'textures'

/** Town and quest speakers, as the brief sets them out. */
const TOWN_LOOKS = ['smith', 'peddler', 'elder', 'healer', 'goblinTrader', 'captain', 'fence', 'dwarf', 'tinker'] as const
const TRAINER_LOOKS = ['trainerAegis', 'trainerShadow', 'trainerPyro', 'trainerSovereign', 'trainerChrono', 'trainerBlood', 'trainerAether', 'trainerGeo'] as const
const SPEAKER_LOOKS = ['goblinKing', 'warlord', 'oracle', 'dragon', 'archDemon'] as const

/** Every drop-in the pipeline paints, by the folder the build scans. */
export const ART_CATALOGUE: Readonly<Record<ArtKind, readonly string[]>> = {
  items: ITEMS.map(i => i.id),
  skills: CLASS_IDS.flatMap(c => skillsOf(c).map(s => s.id)),
  portraits: [...TOWN_LOOKS, ...TRAINER_LOOKS, ...SPEAKER_LOOKS],
  ui: ['coin', 'map'],
  textures: ['ground']
}

/** Where a painted file goes, relative to `public/`. The name is the id. */
export const artTarget = (kind: ArtKind, id: string): string => `images/${kind}/${id}.webp`

// ─── Blurbs: WHAT IT IS, in material and shape ───────────────────────────────
//
// 44 items share 21 kind glyphs, so the blurb is what tells two swords apart.
// Two rules, both learned from returns that could not be used:
//   · every noun is a thing the painter draws, so no lore nouns and no
//     metaphors ("heart of the mountain" paints a heart, "dragon smasher" a
//     dragon). The item's NAME never enters a prompt for the same reason;
//   · the Blood Alchemist reads as alchemy: vials and red essence.

const ITEM_BLURBS: Readonly<Record<string, string>> = {
  // Main hand
  rustedShortsword: 'a short one-handed sword: a stubby straight blade of pitted, rust-flecked iron, a plain bar crossguard, a leather-wrapped grip and a round pommel',
  apprenticeStaff: 'a plain, slightly knotted wooden staff topped with one smooth round crystal ball held in a simple curved wooden fork',
  scoutsHandgun: 'a small single-barrel pistol: a short steel barrel, a curved wooden grip and one small sight block on top',
  ironBroadsword: 'a broad one-handed sword: a wide, clean straight blade of polished iron with a central ridge, a thick gold bar crossguard, a brown leather grip and a round gold pommel',
  vipinsStiletto: 'a slim, needle-pointed dagger: a narrow tapering blade, a short gold crossguard and a small wooden grip',
  aetherCarbine: 'a short carbine: a longer steel barrel with two brass bands, a wooden grip and one small glass capsule of bright liquid set on top of the barrel',
  ashenGreatsword: 'a very large two-handed sword: a long, wide blade of dark soot-grey steel with a pale groove down its middle, a wide crossguard and a long wooden grip',
  archmageWand: 'a short, slim wooden wand with a gold-capped handle, tipped with one large four-pointed star',
  chronoBlade: 'a slender one-handed sword: a straight blade of pale polished steel with a row of small engraved tick marks along it, a thin gold crossguard and a round pommel set with a small flat disc',
  bloodForgedAxe: 'a heavy battle axe: one broad curved blade and one small back blade of dark steel with a crimson band along the cutting edge, on a straight wooden haft',
  voidCannon: 'a stubby hand cannon: a thick dark-steel barrel with a wide flared muzzle ring, one round rivet on its side and a short wooden grip underneath',
  dragonSmasher: 'a huge two-handed war hammer: a long blocky steel head with a flat striking cap at each end, on a thick straight wooden shaft',
  bladeOfTheUnbound: 'an ornate one-handed sword: a long, bright mirror-steel blade with a gold inlay line, a wide curved gold crossguard, a wrapped grip and a jewelled pommel',
  aetheriumDestroyer: 'a heavy long-barrelled pistol plated in gold and steel: a thick barrel with three cooling fins, a large glass capsule of bright liquid on top and a sturdy curved grip',
  // Off hand
  woodenBuckler: 'a small shield of wooden planks with an iron rim, crossed by two iron straps',
  tomeOfNovices: 'a thick closed book seen from the front: a plain cloth cover, a leather spine down its left side and one four-pointed star stamped on the cover',
  ironShield: 'a shield of riveted iron plate with a raised cross-shaped rib and a rolled rim',
  syringeOfTheAdept: 'a brass-and-glass laboratory syringe held diagonally: a clear glass barrel half full of red liquid, a flat brass plunger on top and a short steel nozzle',
  aethericBattery: 'a squat power cell seen from the front: a steel casing with rounded corners, one terminal cap on top and a large lightning-bolt mark on its face',
  aegisTowerShield: 'a tall, heavy shield of thick polished steel plate with a wide raised rim, a cross-shaped rib and four round rivets',
  orbOfEternalFlame: 'a smooth glass sphere resting on a small flat foot, with one solid teardrop-shaped flame painted inside it',
  shieldOfTheFallen: 'a battle-worn shield of gold-edged steel with a cross-shaped rib, two shallow dents and one notch cut in its rim',
  // Body
  paddedTunic: 'a sleeveless quilted cloth tunic with diamond stitching, short shoulder flaps and a simple cloth belt',
  leatherDoublet: 'a fitted brown leather jerkin with short shoulder flaps, a row of small buckles down the front and a wide belt',
  chainmailVest: 'a sleeveless vest of small steel rings with a plain steel collar, short shoulder flaps and one round clasp on the chest',
  scholarsRobe: 'a long, loose cloth robe with wide short sleeves, a V-shaped collar and a pale trim line down the front',
  reinforcedPlate: 'a steel breastplate with riveted bands across the belly, short rounded shoulder plates and one round boss on the chest',
  assassinsGarb: 'a close-fitting dark leather vest with a high collar, crossed chest straps and a narrow belt',
  chronoWeaverCloak: 'a long cloth robe with wide short sleeves and a deep V collar, edged with a pale band and fastened by one round brass clasp',
  bloodSoakedPlate: 'a heavy steel breastplate lacquered deep crimson along its edges, with short rounded shoulder plates and one round boss on the chest',
  exoArmorChassis: 'a boxy mechanical chest rig of steel plates with bolted seams, short squared shoulder blocks and one round glass lens in the middle of the chest',
  dragonscaleHauberk: 'a breastplate covered in rows of large overlapping rounded scales, with short scaled shoulder plates and one round boss on the chest',
  vestmentsOfSovereign: 'a long ceremonial cloth robe with wide short sleeves, a deep V collar, a broad gold trim band down the front and a gold hem',
  armorOfTheTitan: 'a massive, thick-plated breastplate of gold-edged steel with large rounded shoulder plates, a raised centre ridge and one large round boss on the chest',
  // Trinkets
  copperBand: 'a plain, slightly dented copper finger ring set with one small rough-cut stone on top',
  ringOfMending: 'a smooth gold finger ring set with one round polished stone on top, held by four tiny claws',
  bandOfSwiftness: 'a thin gold finger ring with one pointed diamond-cut stone on top and a small fin-shaped flange on each side of the setting',
  castersEmblem: 'a diamond-shaped pendant on a short loop of pale cord: a flat faceted plate with a smaller pale diamond inlaid in its middle',
  infiltratorsCharm: 'a diamond-shaped pendant on a short loop of pale cord: a dark matte plate with a narrow pale slit-shaped inlay in its middle',
  timekeepersHourglass: 'a small hourglass: two glass bulbs holding coloured sand, half in the top and half in the bottom, between two flat gold end plates',
  ringOfTheVampyre: 'a heavy gold finger ring with a pointed claw-shaped setting holding one deep, dark teardrop-cut stone',
  sovereignsSignet: 'a broad gold signet ring with a flat oval face on top, engraved with three small points in a row',
  heartOfTheMountain: 'a gemstone cut in a rounded heart outline with flat facets and one pale crack line down it: a carved stone with hard, flat faces',
  ringOfAbsolutePower: 'a thick, ornate gold finger ring with two engraved bands, set with one large brilliant-cut stone flanked by two tiny ones'
}

const SKILL_BLURBS: Readonly<Record<string, string>> = {
  // Aegis Knight
  shieldSlam: 'a shield tilted forward with a six-pointed impact burst at its upper right edge',
  aegisAura: 'a shield with a cross-shaped rib, sitting in the middle of a solid round disc of light',
  radiantStrike: 'a pale sword pointing up and to the right, in front of eight short solid light rays arranged in a ring',
  fortitude: 'a shield with a small red playing-card heart shape on its face',
  tauntingCry: 'a horn-shaped megaphone pointing right, with two curved solid sound arcs in front of its mouth',
  holyBastion: 'a small pale castle tower with three battlements and an arched door, standing in front of a solid half-dome, with one four-pointed star above it',
  // Shadowblade
  shadowstep: 'a crescent shape curving to the right, with three short horizontal speed lines trailing on its left',
  lethality: 'a steel dagger pointing up and to the right, with a red four-pointed star at its tip',
  venomousBlade: 'a steel dagger pointing up and to the right, with one fat green droplet falling from its blade',
  evasion: 'a small cloak shape with a zigzag hem and two round eye holes, leaning away from two short speed lines on its left',
  smokeBomb: 'a round black bomb with a short fuse and a spark, half covered by one puffy solid cloud',
  danceOfBlades: 'three short steel blades pointing outward from a small round hub, evenly spaced like a three-armed pinwheel',
  // Pyromancer
  fireball: 'a teardrop-shaped ball of flame with a yellow core, flying up and to the right, with three short streaks behind it',
  cauterize: 'a flame with a thick white plus sign on its lower half',
  flamePillar: 'a tall, narrow column of flame with a yellow core, rising from a flat ground line',
  pyromaniac: 'a flame with a yellow core, with two white four-pointed sparks beside it, one large and one small',
  combustion: 'a nine-pointed explosion burst with a smaller yellow nine-pointed burst in its middle',
  cataclysm: 'a round cratered boulder falling toward the lower left, with three streaks behind it at the upper right and a flat ground line below',
  // Grand Sovereign
  royalGuard: 'a steel knight\'s helmet with a face opening, topped with a short rounded plume',
  inspiringPresence: 'a gold crown with five points and one red jewel, with two white four-pointed sparks above it',
  commandFocus: 'a round target of three rings, with four short crosshair ticks at top, bottom, left and right',
  sovereignsTribute: 'a shield with a small gold crown on its face',
  bannerOfVictory: 'a swallow-tailed flag on a wooden pole, with one gold five-pointed star on the cloth',
  armyOfTheRealm: 'three knight\'s helmets in a group: one larger in front, two smaller steel ones behind it at left and right',
  // Chrono-Weaver
  temporalStasis: 'an hourglass with gold end plates, sitting in the middle of a solid round disc',
  hasteField: 'a white round clock face with two hands, with two small fast-forward triangles at its lower right',
  timeDistort: 'a white clock face with a wobbly, bent outline and two bent hands, with one short wavy line at its upper left and one at its lower right',
  paradoxShift: 'two thick arrows stacked one above the other, the upper pointing right and the lower pointing left',
  entropy: 'a solid round disc with one thick white spiral line on it',
  chronoRewind: 'a white round clock face with two hands, with a curved arrow hooking back around its upper left',
  // Blood Alchemist: alchemy, never gore
  sanguineFlask: 'a conical glass laboratory flask with a cork, one third full of red liquid with two small bubbles in it',
  bloodTransmutation: 'two fat droplets of liquid side by side, a red one on the left and a blue one on the right, with a small arrowhead between them pointing right',
  essenceHarvest: 'one fat red droplet of liquid in the middle, circled by two curved arrows that chase each other',
  hemophilia: 'a flat red playing-card heart shape with one small white droplet mark on it',
  mutagenicRage: 'a round red cartoon face with angry slanted brows, two dot eyes and a zigzag row of teeth',
  philosophersCrucible: 'a wide steel bowl-shaped cauldron full of red liquid, with three round red bubbles rising above it',
  // Aether-Tech
  aetherPistol: 'a steel pistol pointing right with a small four-pointed spark at its muzzle',
  deployTurret: 'a small boxy steel gun turret with one short barrel pointing right and a round lens, on a wooden tripod base',
  ventHeat: 'a steel nozzle on the left blowing a wide solid cone to the right, with three streak lines inside the cone',
  thermalOverload: 'a glass thermometer full to the top with red liquid, with a small gold lightning bolt at its upper right',
  orbitalBeam: 'a thick vertical beam with a white core coming down from the top edge onto a flat oval of ground, with a white six-pointed burst where it lands',
  exoSuit: 'a six-sided steel armour shell seen from the front, with one wide visor slot across it',
  // Geomancer
  stoneSpike: 'one tall sharp rock spike rising from a flat ground line, with a small spike on each side of it',
  earthBarrier: 'a wall of five rounded stone blocks in two staggered rows',
  seismicShock: 'a jagged zigzag shock line above a flat ground line, with two curved ripple arcs between them',
  earthenSkin: 'a shield made of stone, with a branching crack line running down it',
  petrify: 'a rounded standing stone statue with two dot eyes, a straight mouth line and one crack at its top right',
  tectonicRupture: 'two slabs of ground split apart by a zigzag crack down the middle, with a small pointed wedge of molten yellow rock rising in the gap'
}

const PORTRAIT_BLURBS: Readonly<Record<string, string>> = {
  smith: 'a bald, broad-faced blacksmith with a thick brown beard, tan skin and a brown work apron',
  peddler: 'a travelling merchant with a peaked rust-brown cap, fair skin and a green tunic',
  elder: 'an old village elder with long white hair, a long white beard, pale skin and a dusty-violet robe',
  healer: 'a healer with ginger hair tied in a round bun on top, fair skin and a cream-white robe with a green collar line',
  goblinTrader: 'a green-skinned goblin merchant with large pointed ears sticking out sideways, a plum-purple peaked cap and a mustard tunic',
  captain: 'a guard captain in an open-faced steel helmet with a centre ridge, fair skin and a dark red tunic with a grey collar line',
  fence: 'a shady trader with a violet-black hood up, tan skin and a matching dark robe with a violet collar line',
  dwarf: 'a stocky dwarf in a round steel helmet with a centre ridge, ruddy skin, a big ginger beard and a brown apron',
  tinker: 'an inventor with blond hair, round glass goggles on a teal strap pushed up on the forehead, fair skin and a blue-grey apron',
  trainerAegis: 'a knight in an open-faced polished steel helmet with a centre ridge, fair skin, silver plate with a gold collar line and a blue cape at the shoulders',
  trainerShadow: 'a rogue with a near-black hood up, tan skin and dark leather with a violet collar line',
  trainerPyro: 'a fire mage with a red-orange hood up, fair skin and a red-orange robe with a gold collar line',
  trainerSovereign: 'a monarch with a gold crown set with one red jewel, golden-blond hair, fair skin, a purple robe with a gold collar line and a red cape at the shoulders',
  trainerChrono: 'a mage with sky-blue hair tied in a round bun on top, pale blue-tinted skin and a blue robe with a pale collar line',
  trainerBlood: 'an alchemist with long crimson hair, pale skin, small pointed ears and a cream-white robe with a crimson collar line',
  trainerAether: 'an engineer with blond hair, round glass goggles on a teal strap pushed up on the forehead, fair skin and a steel-blue jacket with a teal collar line',
  trainerGeo: 'an earth mage with a sand-brown hood up, brown skin and a sand-brown robe',
  goblinKing: 'a goblin chief with bright green skin, large pointed ears sticking out sideways, a gold crown set with one red jewel, a purple robe with a gold collar line and a red cape at the shoulders',
  warlord: 'a warlord whose whole head is inside a closed steel great helm with a T-shaped slit, no face showing, in dark red armour with a red cape at the shoulders',
  oracle: 'a sea-green-skinned seer with small pointed ears, teal hair, a gold crown set with one red jewel, solid pale-gold eyes with no pupils and a teal robe',
  dragon: 'a violet-skinned horned figure with two curved ivory horns, small pointed ears, dark violet hair, solid yellow eyes with no pupils and a dark violet collar with a yellow line',
  archDemon: 'a crimson-skinned horned figure with two curved ivory horns, near-black hair, solid pale-yellow eyes with no pupils, dark armour with an amber collar line and a dark red cape at the shoulders'
}

const COIN_BLURB = 'a thick round gold coin seen flat from the front: an orange-gold rim, a lighter raised centre disc stamped with one five-pointed star, and one short curved highlight at the upper left'

// ─── Colour names: the hue identity a prompt hands over ──────────────────────

const TIER_NAME: Readonly<Record<number, string>> = { 1: 'pale silver-grey', 2: 'green', 3: 'blue', 4: 'violet', 5: 'orange', 6: 'gold' }
/** Operator-facing (headings, the desk's search). Never in a prompt. */
const CLASS_NAME: Readonly<Record<ClassId, string>> = {
  aegis: 'Aegis Knight', shadow: 'Shadowblade', pyro: 'Pyromancer', sovereign: 'Grand Sovereign', chrono: 'Chrono-Weaver', blood: 'Blood Alchemist', aether: 'Aether-Tech', geo: 'Geomancer'
}
const CLASS_HUE: Readonly<Record<ClassId, string>> = {
  aegis: 'gold', shadow: 'violet', pyro: 'orange', sovereign: 'amber', chrono: 'cyan', blood: 'crimson', aether: 'teal', geo: 'sand'
}

// ─── The sheets ──────────────────────────────────────────────────────────────

/** What the bench draws into a panel. */
export type DrawKind = 'item' | 'skill' | 'portrait' | 'coin'

export interface SheetCell {
  id: string
  draw: DrawKind
  /** Operator-facing: the key sheet, the index, the desk's search. NEVER in a prompt. */
  label: string
  /** WHAT IT IS, for the prompt. */
  blurb: string
  /** Relative to `public/`. */
  target: string
  /** The glyph `ArtIcon` draws (items, skills). */
  glyph?: string
  /** The owner's colour: a tier, a class. */
  tint?: string
  tintName?: string
  /** Shown clipped to a circle in the game (passive skills). */
  round?: boolean
}

export interface ArtSet {
  /** File stem: `<stem>.png` goes out, `painted/<stem>.<ext>` comes back. */
  stem: string
  title: string
  kind: ArtKind
  /** The prompt document its block is written into. */
  doc: string
  cols: number
  rows: number
  /**
   * The panel's height when it is not a square `CELL` (see `TALL`). The
   * drawing's square sits in the MIDDLE of the taller panel, with a band of
   * plain ground above and below it: every fit, every crop and every anchor
   * is still measured on that square, so nothing else changes with the shape.
   */
  panelH?: number
  /** Longest edge a sliced file is written at, px. */
  maxEdge: number
  /**
   * How much of the panel a sliced file keeps, centred. 1: the whole panel
   * (`ArtIcon` draws a painted file edge to edge and the glyph inset by 10 %,
   * which is exactly the reference's placement). `REF_SCALE`: only the
   * drawing's own box, for `Portrait`, whose vector fills its frame.
   */
  crop: number
  /** What a return is registered by: its middle, or its bottom edge. */
  anchor: 'centre' | 'feet'
  /** Row by row; `null` is a panel left blank (flat magenta). */
  cells: ReadonlyArray<SheetCell | null>
  /** One accent for the whole sheet (a class's skills). */
  accent?: { hex: string; name: string }
}

export interface ArtScenery {
  stem: string
  title: string
  kind: ArtKind
  doc: string
  width: number
  height: number
  target: string
  maxEdge: number
  /** Must repeat without a seam in both directions. */
  tileable: boolean
  /** A backdrop is all artwork: never keyed, never trimmed. */
  bg: 'opaque'
  /** The plate the bench draws as its reference. */
  plate: 'map' | 'ground'
  label: string
}

/** `rustedShortsword` → `Rusted Shortsword`. */
const labelOf = (id: string): string => id.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase())

const need = (blurbs: Readonly<Record<string, string>>, id: string): string => {
  const b = blurbs[id]
  if (!b) throw new Error(`artSheet: no blurb for "${id}" — every drawable needs its WHAT IT IS`)
  return b
}

const itemCell = (it: ItemDef): SheetCell => ({
  id: it.id, draw: 'item', label: labelOf(it.id), blurb: need(ITEM_BLURBS, it.id), target: artTarget('items', it.id),
  glyph: it.kind, tint: TIER_COLOR[it.tier] ?? '#c9d2e3', tintName: TIER_NAME[it.tier] ?? 'grey'
})

const portraitCell = (look: string): SheetCell => ({
  id: look, draw: 'portrait', label: labelOf(look), blurb: need(PORTRAIT_BLURBS, look), target: artTarget('portraits', look)
})

/** Pad a list out to a full grid with blank panels. */
const grid = (cells: SheetCell[], cols: number, rows: number): Array<SheetCell | null> => {
  if (cells.length > cols * rows) throw new Error(`artSheet: ${cells.length} cells do not fit ${cols}x${rows}`)
  return [...cells, ...Array.from({ length: cols * rows - cells.length }, () => null)]
}

const main = ITEMS.filter(i => i.slot === 'main')
const off = ITEMS.filter(i => i.slot === 'off')
const body = ITEMS.filter(i => i.slot === 'body')
const trinkets = ITEMS.filter(i => i.slot === 'trinket')

const itemSet = (stem: string, title: string, items: ItemDef[]): ArtSet => ({
  stem, title, kind: 'items', doc: 'PROMPTS-ITEMS.md', cols: 4, rows: 3, maxEdge: 192, crop: 1, anchor: 'centre',
  cells: grid(items.map(itemCell), 4, 3)
})

const skillSet = (cls: ClassId): ArtSet => ({
  stem: `sheet-skills-${cls}`,
  title: `Skill icons: ${CLASS_NAME[cls]}`,
  kind: 'skills', doc: 'PROMPTS-SKILLS.md', cols: 3, rows: 2, panelH: TALL, maxEdge: 192, crop: 1, anchor: 'centre',
  accent: { hex: CLASSES[cls].color, name: CLASS_HUE[cls] },
  cells: grid(skillsOf(cls).map(s => ({
    id: s.id, draw: 'skill' as const, label: labelOf(s.id), blurb: need(SKILL_BLURBS, s.id), target: artTarget('skills', s.id),
    glyph: `skill.${s.id}`, tint: CLASSES[cls].color, tintName: CLASS_HUE[cls], round: s.kind === 'passive'
  })), 3, 2)
})

const portraitSet = (stem: string, title: string, looks: readonly string[], cols: number, rows: number): ArtSet => ({
  // A bust is cut flat along the bottom of its box, so it registers by that
  // edge, and the sliced file keeps the box alone: `Portrait` draws it edge to
  // edge, exactly where the vector bust was.
  stem, title, kind: 'portraits', doc: 'PROMPTS-PORTRAITS.md', cols, rows, maxEdge: 256, crop: REF_SCALE, anchor: 'feet',
  // Three across and two down would be 3:2 with square panels.
  ...(cols * 2 === rows * 3 ? { panelH: TALL } : {}),
  cells: grid(looks.map(portraitCell), cols, rows)
})

export const SETS: readonly ArtSet[] = [
  itemSet('sheet-items-weapons', 'Item icons: weapons', main.slice(0, 12)),
  itemSet('sheet-items-arms', 'Item icons: top weapons and off-hands', [...main.slice(12), ...off]),
  itemSet('sheet-items-armor', 'Item icons: body armour', body),
  itemSet('sheet-items-trinkets', 'Item icons: trinkets', trinkets),
  ...CLASS_IDS.map(skillSet),
  portraitSet('sheet-portraits-town', 'Portraits: townsfolk', TOWN_LOOKS, 3, 3),
  portraitSet('sheet-portraits-trainers', 'Portraits: trainers', TRAINER_LOOKS, 3, 3),
  portraitSet('sheet-portraits-speakers', 'Portraits: quest speakers', SPEAKER_LOOKS, 3, 2)
]

/** One object per file. The same shape as a set, with one panel. */
export const SINGLES: readonly ArtSet[] = [
  {
    stem: 'single-ui-coin', title: 'UI: the gold coin', kind: 'ui', doc: 'PROMPTS-UI.md', cols: 1, rows: 1, maxEdge: 64, crop: 1, anchor: 'centre',
    cells: [{ id: 'coin', draw: 'coin', label: 'Coin', blurb: COIN_BLURB, target: artTarget('ui', 'coin') }]
  }
]

export const SCENERY: readonly ArtScenery[] = [
  {
    stem: 'bg-ui-map', title: 'UI: the world map parchment', kind: 'ui', doc: 'PROMPTS-UI.md', width: 1376, height: 768,
    target: artTarget('ui', 'map'), maxEdge: 1376, tileable: false, bg: 'opaque', plate: 'map', label: 'World map'
  },
  {
    stem: 'bg-ground', title: 'Texture: the ground detail', kind: 'textures', doc: 'PROMPTS-UI.md', width: 512, height: 512,
    // The game bakes it into a 256 px tile, so more is payload.
    target: artTarget('textures', 'ground'), maxEdge: 256, tileable: true, bg: 'opaque', plate: 'ground', label: 'Ground'
  }
]

/** A panel's height, px: `CELL` unless the set says otherwise. */
export const panelHeight = (s: ArtSet): number => s.panelH ?? CELL

export const sheetSize = (s: ArtSet): { width: number; height: number } => ({ width: s.cols * CELL, height: s.rows * panelHeight(s) })

/** Every stem a painted file may be filed under. */
export const allStems = (): string[] => [...SETS, ...SINGLES, ...SCENERY].map(s => s.stem)

/** Every target the manifest writes, with the stem that owns it. */
export const manifestTargets = (): Map<string, string> => {
  const out = new Map<string, string>()
  for (const s of [...SETS, ...SINGLES]) for (const c of s.cells) if (c) out.set(c.target, s.stem)
  for (const a of SCENERY) out.set(a.target, a.stem)
  return out
}

// ─── The world map plate ─────────────────────────────────────────────────────
//
// The parchment `WorldMap.vue` paints in CSS until `images/ui/map.webp`
// exists: a tan sheet with one soft tint per region. Kept here as data so the
// bench can draw the same plate on a canvas. If the CSS changes, change this.

export interface MapBlob { at: [number, number]; rgb: [number, number, number]; alpha: number; reach: number }
export const MAP_PLATE: { base: Array<[number, string]>; angle: number; blobs: MapBlob[] } = {
  angle: 160,
  base: [[0, '#ecd9a8'], [0.55, '#dcc188'], [1, '#c9a66b']],
  blobs: [
    { at: [0.22, 0.78], rgb: [111, 191, 74], alpha: 0.5, reach: 0.26 },
    { at: [0.44, 0.52], rgb: [47, 154, 90], alpha: 0.45, reach: 0.24 },
    { at: [0.44, 0.34], rgb: [224, 96, 58], alpha: 0.4, reach: 0.22 },
    { at: [0.68, 0.28], rgb: [143, 208, 240], alpha: 0.6, reach: 0.24 },
    { at: [0.84, 0.18], rgb: [138, 90, 224], alpha: 0.45, reach: 0.26 },
    { at: [0.8, 0.62], rgb: [63, 192, 176], alpha: 0.4, reach: 0.22 }
  ]
}

// ─── The index: what the slicer and the desk read ────────────────────────────

/** A drawing's solid bounding box, as fractions of its panel. */
export interface Fit { h: number; w: number; bottom: number; cx: number }
/** Measured fits, keyed by TARGET: the one name no two panels share. */
export type Fits = Readonly<Record<string, Fit>>

export interface IndexCell { id: string; label: string; variant: string; x: number; y: number; w: number; h: number; target: string; fit?: Fit }
export interface IndexSheet {
  id: string
  kind: 'set' | 'single'
  title: string
  files: { clean: string; key: string }
  width: number
  height: number
  cols: number
  rows: number
  maxEdge: number
  crop: number
  anchor: 'centre' | 'feet'
  cells: IndexCell[]
}
export interface IndexScenery { id: string; file: string; title: string; width: number; height: number; target: string; maxEdge: number; tileable: boolean; bg: 'opaque' }
export interface SheetIndex { version: 1; cell: number; sheets: IndexSheet[]; scenery: IndexScenery[] }

/** The index for the whole manifest; the bench adds the fits it measured. */
export const sheetIndex = (fits?: Fits): SheetIndex => ({
  version: 1,
  cell: CELL,
  sheets: [...SETS, ...SINGLES].map((s) => ({
    id: s.stem,
    kind: s.cols * s.rows === 1 ? 'single' as const : 'set' as const,
    title: s.title,
    files: { clean: `${s.stem}.png`, key: `${s.stem}-key.png` },
    ...sheetSize(s),
    cols: s.cols,
    rows: s.rows,
    maxEdge: s.maxEdge,
    crop: s.crop,
    anchor: s.anchor,
    cells: s.cells.flatMap((c, i) => (c
      ? [{
          // The PANEL's rect. The slicer cuts the square in its middle, and a
          // fit is a fraction of that square, never of the taller panel.
          id: c.id, label: c.label, variant: s.kind, x: (i % s.cols) * CELL, y: Math.floor(i / s.cols) * panelHeight(s), w: CELL, h: panelHeight(s),
          target: c.target, ...(fits?.[c.target] ? { fit: fits[c.target] } : {})
        }]
      : []))
  })),
  scenery: SCENERY.map(a => ({
    id: a.stem, file: `${a.stem}.png`, title: a.title, width: a.width, height: a.height, target: a.target, maxEdge: a.maxEdge, tileable: a.tileable, bg: a.bg
  }))
})

/** The fits an exported index carries, or `undefined` when it has none. */
export const fitsOfIndex = (index: { sheets?: Array<{ cells?: Array<{ target?: string; fit?: Fit }> }> } | null | undefined): Fits | undefined => {
  const fits: Record<string, Fit> = {}
  for (const s of index?.sheets ?? []) for (const c of s.cells ?? []) if (c.fit && c.target) fits[c.target] = c.fit
  return Object.keys(fits).length ? fits : undefined
}

// ─── The prompts ─────────────────────────────────────────────────────────────
//
// Generated, never hand-written per sheet: one style block, one background
// rule, per-sheet text only where a sheet genuinely differs. The order of the
// blocks is load-bearing (the skill's PROMPT-ANATOMY.md): what comes back
// first, what it is not, what it is, colour, view, consistency, style, size,
// background, the check list, and the output shape last.

/** The art direction, shared by every sheet. For anything that must NOT fill its panel. */
export const STYLE_PART = [
  'STYLE — the same hand as every other picture in this game.',
  '· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.',
  '· ONE dark outline around every shape, in deep charcoal-violet (about #0F0C19, never pure black), brush-pen weight: at its heaviest about 2.5% of the panel\'s shorter side. Hold the picture at thumbnail size; if the outline has thinned to a hairline it is several times too thin.',
  '· Cel shading in hard steps, no blending: a base tone, ONE shadow step (the base darkened by about a third and pushed toward blue-violet) and ONE lighter step. No airbrush, no smooth gradients, no photographic texture, no noise.',
  '· Bright, saturated candy colours (saturation 60-85%, brightness 75-100%). Nothing muddy, grey or desaturated.',
  '· One small, hard-edged white glint on anything metal, glass, gem or liquid.',
  '· Light and energy are painted as SOLID shapes: a white-hot core, the colour, a darker edge. Nothing is ever see-through, hazy or ghostly.',
  '· People are squat chibi: the head is nearly half the figure, large oval eyes with one white glint, tiny nose or none, mitten hands, no fingers.',
  '· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. A sword, a ring, a flask or a rock gets the same outline, the same two-step shading and the same glint as a character.',
  '· The attached reference is a flat stand-in. Follow its SHAPE, its SIZE in the panel and its POSITION; take nothing else from it — not its line weight, flat fills or lack of shading. Its plain shapes are notation, and a sheet that comes back as the same flat shapes neatly repainted is unusable.',
  'AVOID: three-quarter or perspective views, realism, pixel art, thin technical line, soft glow around a shape, drop shadows, text, numbers, frames, badges or cards behind the object.',
  '· Each object floats in its own panel at the size the reference shows. It does NOT fill its panel; do not invent anything for a panel that is blank in the reference — flat magenta and nothing else.'
].join('\n')

/** The same block without the panel tail, which a full-bleed backdrop would contradict. */
export const STYLE_BACKDROP = STYLE_PART.split('\n').slice(0, -1).join('\n')

/**
 * The ground detail is a greyscale map multiplied over each zone's colours:
 * the candy-colour, outline, blue-violet shadow, glint, energy and character
 * bullets describe the opposite of it. Derived from the one block (no second
 * copy to drift), with those bullets taken out, so its prompt does not argue
 * with itself; the ground's own prompt states its flat-step shading.
 */
const GREY_DROPS = ['· ONE dark outline', '· Cel shading', '· Bright, saturated', '· One small, hard-edged white glint', '· Light and energy', '· People are squat', '· AN OBJECT WITH NO FACE']
export const STYLE_GREY = STYLE_BACKDROP.split('\n').filter(l => !GREY_DROPS.some(d => l.startsWith(d))).join('\n')

/** The magenta contract. */
export const BACKGROUND = [
  'BACKGROUND — this matters more than the style.',
  'Fill every pixel that is not an object with solid, flat, pure magenta #FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.',
  '· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not mauve, not a soft or tinted version of it. Only the true colour can be cut away cleanly.',
  '· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD and then baked into the artwork as though the squares were paint.',
  '· NOT white, cream, parchment, paper, or any tinted or textured ground.',
  '· Nothing sits on a card, panel, tile, badge, frame, ring or rectangle of any kind. The magenta must touch the outline of each object on every side.',
  '· No drop shadow onto the background, and no vignette.',
  '· No object contains magenta or hot pink.',
  '· The candy palette above is for the OBJECTS. The ground is not part of the painting: it stays a vivid, eye-hurting #FF00FF.'
].join('\n')

export const GLOW = 'KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the background is measured as part of the object when the return is fitted back onto the reference, so a wide aura comes back as a tiny object inside a huge smear. It also cannot be keyed: soft light over magenta turns pink rather than transparent. Any glow belongs inside the shape\'s own outline.'

/** Effects only: the flat placeholder is notation, and what "painted" means. */
export const NOTATION = '· The reference\'s flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable.'
export const FINISH = '· FINISH — every shape becomes a painted VOLUME of energy or matter: an inner glow from a hot white core through the accent colour to a deep shade at its edge; two or three cel steps; crisp highlights; streaks and sparks stretched along the way they travel; brush-pen contours in a DARK SHADE OF THE SHAPE\'S OWN COLOUR where it is energy, and the charcoal-violet line where it is a solid object.'
export const SEE_THROUGH = 'NOTHING IS EVER SEE-THROUGH. Every piece that is present is painted at full, solid colour; light is painted as solid shapes (hard-edged rays, solid rim bands), never as a soft bloom around a shape and never half-transparent or ghostly.'

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
/** `4:3`, `3:2`, `1:1`, and `16:9` for the map's near-16:9 plate. */
const ratio = (w: number, h: number): string => {
  if (Math.abs(w / h - 16 / 9) < 0.02) return '16:9'
  const g = gcd(w, h)
  return `${w / g}:${h / g}`
}
const shapeWord = (w: number, h: number): string => (w === h ? 'square' : w > h ? 'landscape' : 'portrait')
const pct = (v: number): number => Math.round(v * 100)

/** The widest and tallest drawing on a sheet, from the measured fits, else the nominal extent. */
const extent = (s: ArtSet, fits?: Fits): { w: number; h: number } => {
  let w = 0
  let h = 0
  for (const c of s.cells) {
    const f = c ? fits?.[c.target] : undefined
    if (f) { w = Math.max(w, f.w); h = Math.max(h, f.h) }
  }
  const e = w > 0 && h > 0 ? { w, h } : { w: REF_SCALE, h: REF_SCALE }
  // A fit is measured on the drawing's square; the prompt speaks of the PANEL,
  // which may be taller than that square.
  return { w: e.w, h: (e.h * CELL) / panelHeight(s) }
}

const heading = (title: string, stem: string, target: string): string => `# ${title}  (${stem}.png → ${target})`

/** What every panel of a set is, by position. Names never appear: a name is a noun, and a noun gets painted. */
const panelList = (s: ArtSet, withTint: boolean): string[] =>
  s.cells.map((c, i) => {
    const at = `Panel ${i + 1} (row ${Math.floor(i / s.cols) + 1}, column ${(i % s.cols) + 1})`
    if (!c) return `${at}: BLANK — flat magenta and nothing else.`
    const tint = withTint && c.tint ? ` Accent, where the reference shows one: ${c.tintName} (about ${c.tint}).` : ''
    return `${at}: ${c.blurb}.${tint}${c.round ? ' Shown inside a ROUND frame: keep it clear of the panel\'s four corners.' : ''}`
  })

const comesBack = (s: ArtSet, noun: string): string[] => {
  const { width, height } = sheetSize(s)
  const n = s.cols * s.rows
  const blanks = s.cells.filter(c => !c).length
  return [
    `WHAT COMES BACK IS A SHEET OF ${n} SEPARATE ${noun.toUpperCase()}S, NOT ONE PICTURE.`,
    `One ${shapeWord(width, height)} image, ${width} x ${height} pixels (${ratio(width, height)}), holding ${n} separate small drawings laid out ${s.cols} across and ${s.rows} down, on the same grid as the attached reference, read left to right along the top row first.`,
    `· ${n} panels. Not 1, not ${n - s.cols}, not ${n + s.cols}. Exactly ${s.rows} rows of ${s.cols} — do not add a row and do not drop one.`,
    `· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.`,
    '· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.',
    ...(panelHeight(s) !== CELL ? [`· The panels are NOT square: each is a little taller than it is wide (${ratio(CELL, panelHeight(s))}), because the canvas divides into ${s.cols} equal columns and ${s.rows} equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.`] : []),
    ...(blanks ? [`· ${blanks} panel${blanks > 1 ? 's are' : ' is'} BLANK in the reference. Leave ${blanks > 1 ? 'them' : 'it'} flat magenta: do not invent anything for ${blanks > 1 ? 'them' : 'it'}.`] : [])
  ]
}

const sizeClause = (s: ArtSet, fits?: Fits): string[] => {
  const e = extent(s, fits)
  return [
    'SIZE AND PLACE — measure against the PANEL, not against the paper.',
    `· In the reference no drawing is wider than about ${pct(e.w)}% of its panel or taller than about ${pct(e.h)}%, and every panel keeps a clear magenta margin on all four sides.`,
    '· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.',
    '· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.'
  ]
}

const output = (width: number, height: number): string =>
  `OUTPUT: one image, ${width} x ${height} pixels (${ratio(width, height)}, ${shapeWord(width, height)}), or the same shape larger. If your tool has an aspect-ratio control, set it to ${ratio(width, height)} — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.`

const checks = (s: ArtSet, lines: string[]): string[] => {
  const { width, height } = sheetSize(s)
  return [
    'BEFORE YOU CALL IT FINISHED, count and check:',
    `· ${s.cols} panels across, ${s.rows} down, ${s.cols * s.rows} in all.`,
    `· The canvas is ${shapeWord(width, height)}, ${ratio(width, height)}.`,
    ...lines,
    '· Nothing in any panel reaches its panel\'s edge.',
    '· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.'
  ]
}

const itemPrompt = (s: ArtSet, fits?: Fits): string => {
  const { width, height } = sheetSize(s)
  return [
    heading(s.title, s.stem, 'images/items/'),
    '',
    ...comesBack(s, 'object'),
    '',
    'EACH PANEL IS ONE OBJECT, NOT A SCENE.',
    '· Paint ONLY the object the reference shows in that panel. No hand holding it, no wearer, no mannequin, no stand, no ground, no shadow, no sparkle cloud, no scenery.',
    '· The game draws its own coloured frame around each icon. Nothing here sits on a tile, badge or ring.',
    '',
    'WHAT EACH PANEL IS:',
    ...panelList(s, true),
    '',
    'COLOUR — each object keeps the colours its panel shows in the reference. Where the reference gives an object one strong accent colour, keep that accent: it tells the player how rare the object is. Take the HUE from it, not the flatness. Steel stays steel, wood stays brown, gold stays gold.',
    '',
    'THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.',
    '',
    `ONE HAND — all ${s.cells.filter(c => c).length} objects are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one object is glossy and the next is flat is not one set.`,
    '',
    STYLE_PART,
    '',
    ...sizeClause(s, fits),
    '',
    BACKGROUND,
    '',
    GLOW,
    '',
    ...checks(s, ['· Each panel holds exactly one object and nothing else.']),
    '',
    output(width, height)
  ].join('\n')
}

const skillPrompt = (s: ArtSet, fits?: Fits): string => {
  const { width, height } = sheetSize(s)
  const accent = s.accent ?? { hex: '#7fd8ff', name: 'blue' }
  return [
    heading(s.title, s.stem, 'images/skills/'),
    '',
    ...comesBack(s, 'icon'),
    '',
    'EACH PANEL IS ONE SMALL EMBLEM, NOT A SCENE.',
    '· Paint ONLY what the reference shows in that panel. No character casting it, no hand, no target, no landscape, no extra sparks around it.',
    '· The game draws its own coloured frame around each icon. Nothing here sits on a tile, badge or ring.',
    '',
    'WHAT EACH PANEL IS:',
    ...panelList(s, false),
    '',
    `COLOUR — ONE accent for the whole sheet: ${accent.name} (about ${accent.hex}). Wherever the reference uses that colour, yours does; white, gold, steel, wood, red, green and blue details keep the colours the reference gives them. Take the HUE, not the flatness.`,
    '',
    'THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.',
    '',
    `ONE HAND — all ${s.cells.filter(c => c).length} icons belong to one set: the same line weight, the same shading, the same light from the upper left, the same accent colour.`,
    '',
    STYLE_PART,
    NOTATION,
    FINISH,
    '',
    ...sizeClause(s, fits),
    '',
    BACKGROUND,
    '',
    GLOW,
    '',
    SEE_THROUGH,
    '',
    ...checks(s, [
      '· Each panel holds exactly one emblem and nothing else.',
      '· No panel is a flat copy of the reference\'s plain shapes.',
      '· Nothing anywhere is half-transparent, hazy or glowing out into the magenta.'
    ]),
    '',
    output(width, height)
  ].join('\n')
}

const portraitPrompt = (s: ArtSet, fits?: Fits): string => {
  const { width, height } = sheetSize(s)
  return [
    heading(s.title, s.stem, 'images/portraits/'),
    '',
    ...comesBack(s, 'portrait'),
    '',
    'EACH PANEL IS ONE HEAD-AND-SHOULDERS BUST, NOT A FIGURE AND NOT A SCENE.',
    '· Head, neck and the top of the shoulders, cut off flat along a level line exactly where the reference cuts it. No arms, no hands, no weapon, no body below the cut.',
    '· No backdrop behind the head: the game shows each bust inside its own round frame.',
    '',
    'WHO EACH PANEL IS:',
    ...panelList(s, false),
    '',
    'COLOUR — each bust keeps the skin, hair, headgear and clothing colours its panel shows in the reference. Take the HUES from it, not the flatness.',
    '',
    'THE VIEW — straight on, facing the viewer, eyes level, the way the reference shows it. No three-quarter turn, no tilt, no profile.',
    '',
    `ONE HAND — all ${s.cells.filter(c => c).length} busts are the same kind of character drawn by the same artist: the same head size, the same eye shape, the same line weight, the same light from the upper left.`,
    '',
    STYLE_PART,
    '',
    ...sizeClause(s, fits),
    '· The flat cut along the bottom of each bust stays where the reference has it: it is the edge of the frame the game puts the bust in.',
    '',
    BACKGROUND,
    '',
    GLOW,
    '',
    ...checks(s, [
      '· Each panel holds exactly one bust, facing front, cut flat along the bottom.',
      '· There is not one arm, hand or weapon anywhere in it.'
    ]),
    '',
    output(width, height)
  ].join('\n')
}

const singlePrompt = (s: ArtSet, fits?: Fits): string => {
  const c = s.cells[0]
  if (!c) throw new Error(`artSheet: ${s.stem} has no panel`)
  const e = extent(s, fits)
  return [
    heading(s.title, s.stem, c.target),
    '',
    'WHAT COMES BACK IS ONE OBJECT ON A FLAT MAGENTA GROUND.',
    'One square image holding one object, at the size and in the spot the attached reference shows it.',
    '· ONE object. Not a pile, not a row, not a scene.',
    '',
    `WHAT IT IS: ${c.blurb}. NOTHING else: no hand, no sparkle, no ground, no shadow.`,
    '',
    'COLOUR — the colours the reference shows. Take the HUES from it, not the flatness.',
    '',
    'THE VIEW — flat and front-on, the way the reference shows it. No tilt, no perspective, no edge-on thickness.',
    '',
    STYLE_PART,
    '',
    'SIZE AND PLACE — measure against the image, not against a guess.',
    `· In the reference the object is about ${pct(e.w)}% of the image's width and ${pct(e.h)}% of its height, centred, with a clear magenta margin on all four sides. Keep it there.`,
    '· It is shown at the size of a single letter in the game, so it must read at a glance: the simplest version of itself.',
    '',
    BACKGROUND,
    '',
    GLOW,
    '',
    'BEFORE YOU CALL IT FINISHED, check:',
    '· There is exactly one object, and it does not reach the edge of the image.',
    '· Every pixel that is not the object is flat, vivid #FF00FF.',
    '',
    'OUTPUT: one square image (1:1), 1024 x 1024 pixels or larger. If your tool has an aspect-ratio control, set it to 1:1. PNG. No labels, captions, numbers or watermarks.'
  ].join('\n')
}

const mapPrompt = (a: ArtScenery): string => [
  heading(a.title, a.stem, a.target),
  '',
  'WHAT COMES BACK IS ONE FULL-BLEED PARCHMENT MAP SHEET, WITH NOTHING MARKED ON IT.',
  `One ${shapeWord(a.width, a.height)} image, ${a.width} x ${a.height} pixels (${ratio(a.width, a.height)}), painted edge to edge.`,
  '',
  'IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the background the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge.',
  '',
  'WHAT IT IS: a hand-painted sheet of warm tan parchment showing a stretch of country from above, as soft regions of terrain colour that melt into the parchment between them. Following the reference: gentle green grassland at the lower left; darker green woodland in the middle; warm ash-red badlands above the middle; pale icy blue snowfields at the upper right of centre; violet haze in the far upper right corner; sea-green lowlands at the right of centre.',
  '',
  'WHAT IT IS NOT — read this twice. The game draws every place marker, every road and every name OVER this picture, at positions it computes itself. So NOTHING painted here may look like a place: no towns, no castles, no towers, no houses, no camps, no roads, no paths, no dotted lines, no bridges, no flags, no crosses, no compass rose, no ships, no creatures, no banners, no text, no letters, no numbers. A painted town would sit beside the real marker and read as a second, wrong one.',
  '· Terrain texture is welcome, kept small and even: tiny hill bumps, tree dots, short grass ticks, ripple marks, drifts. Nothing larger than a fingernail, nothing that reads as a landmark, nothing that draws the eye to one spot.',
  '· Keep it calm and fairly light: dark ink labels and bright round markers sit on every part of it, and both must stay readable.',
  '',
  'COLOUR — the reference\'s own: warm tan paper, with each region\'s colour laid softly over it where the reference shows it. Keep the regions where they are; their exact outlines are free.',
  '',
  'THE VIEW — straight down, flat, like a printed map. No horizon, no perspective, no tilt.',
  '',
  STYLE_BACKDROP,
  '',
  'BEFORE YOU CALL IT FINISHED, check:',
  '· The paper reaches all four edges of the image; there is no magenta and no border.',
  '· There is not one building, road, marker, symbol or letter anywhere in it.',
  '· The six regions sit where the reference has them.',
  '',
  `OUTPUT: one image, ${a.width} x ${a.height} pixels (${ratio(a.width, a.height)}, ${shapeWord(a.width, a.height)}). If your tool has an aspect-ratio control, set it to ${ratio(a.width, a.height)}. PNG. No labels, captions, numbers or watermarks.`
].join('\n')

const groundPrompt = (a: ArtScenery): string => [
  heading(a.title, a.stem, a.target),
  '',
  'WHAT COMES BACK IS ONE SEAMLESS, TILEABLE, GREYSCALE TEXTURE.',
  `One square image, ${a.width} x ${a.height} pixels (1:1), painted edge to edge.`,
  '',
  'IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one. No frame, no border, no vignette, no darker corners.',
  '',
  'WHAT IT IS: a hand-painted detail pattern for open ground, seen straight down: large rounded blotches a little lighter and a little darker than the base, small scattered speckles, and a few short tufts of two or three strokes. The game multiplies it over each land\'s own colour, so it carries light and dark only.',
  '· Flat steps only: each blotch is ONE flat grey with a clean, hand-cut edge, like cut paper. No airbrush, no smooth gradients, no photographic texture, no noise.',
  '',
  'COLOUR — NONE. Pure greyscale: no hue at all, no tint, no warm or cool cast.',
  '· Very light overall: the base is near white (about 90% brightness) and the darkest mark is a pale grey (no darker than about 65%). No black, no dark outline, no ink line.',
  '· Even all over: no part of the image is noticeably darker or busier than another, or the repeat will show as a grid of patches.',
  '',
  'IT MUST TILE. The left edge continues into the right edge and the top into the bottom with no seam: a blotch that leaves on one side comes back in on the other. The reference shows the pattern repeated twice across and twice down; paint ONE pattern that repeats the same way.',
  '',
  'THE VIEW — straight down, flat. No horizon, no perspective, no cast shadows with a direction.',
  '',
  STYLE_GREY,
  '',
  'BEFORE YOU CALL IT FINISHED, check:',
  '· There is no colour anywhere: it is greys only, and almost white on average.',
  '· Put two copies side by side and one above the other: no line shows where they meet.',
  '· Nothing in it is an object: no stones with outlines, no flowers, no footprints, no paths.',
  '',
  'OUTPUT: one square image (1:1), 1024 x 1024 pixels or larger. If your tool has an aspect-ratio control, set it to 1:1. PNG. No labels, captions, numbers or watermarks.'
].join('\n')

export interface PromptBlock { doc: string; stem: string; title: string; text: string }

const setPrompt = (s: ArtSet, fits?: Fits): string =>
  s.kind === 'items' ? itemPrompt(s, fits) : s.kind === 'skills' ? skillPrompt(s, fits) : portraitPrompt(s, fits)

/** One block per reference, in document order. `text` is `# heading`, a blank line, the prompt. */
export const promptBlocks = (fits?: Fits): PromptBlock[] => [
  ...SETS.map(s => ({ doc: s.doc, stem: s.stem, title: s.title, text: setPrompt(s, fits) })),
  ...SINGLES.map(s => ({ doc: s.doc, stem: s.stem, title: s.title, text: singlePrompt(s, fits) })),
  ...SCENERY.map(a => ({ doc: a.doc, stem: a.stem, title: a.title, text: a.plate === 'map' ? mapPrompt(a) : groundPrompt(a) }))
]

/** A fence longer than any run of backticks in the body, so a prompt can never close its own block. */
const fenceFor = (body: string): string => {
  let longest = 0
  for (const run of body.match(/`+/g) ?? []) longest = Math.max(longest, run.length)
  return '`'.repeat(Math.max(3, longest + 1))
}

/** `# Title (ref.png → target)` + prompt → a `##` heading OUTSIDE a fenced block. */
const block = (text: string): string => {
  const cut = text.indexOf('\n')
  const head = (cut < 0 ? text : text.slice(0, cut)).replace(/^#+\s*/, '')
  const bodyText = (cut < 0 ? '' : text.slice(cut + 1)).replace(/^\n+/, '')
  const fence = fenceFor(bodyText)
  return [`## ${head}`, '', `${fence}text`, bodyText, fence].join('\n')
}

const DOC_TITLES: Readonly<Record<string, string>> = {
  'PROMPTS-ITEMS.md': 'Item icons',
  'PROMPTS-SKILLS.md': 'Skill icons',
  'PROMPTS-PORTRAITS.md': 'Portraits',
  'PROMPTS-UI.md': 'UI and textures'
}

const docIntro = (name: string): string[] => [
  `# Battlecross art prompts — ${DOC_TITLES[name] ?? name}`,
  '',
  'Generated from `src/game/art/artSheet.ts` by `pnpm art:prompts` (and by the',
  'bench at `/#/art-sheets` on export). Do not edit by hand: change the manifest.',
  '',
  'Each block is one generation. The heading names the reference image to attach',
  'and where the sliced result lands; it stays OUTSIDE the fence, so copy the',
  'fenced text only (a markdown preview gives it a copy button). Save the return',
  'as `art-sheets/painted/<reference name>.png`, then `pnpm art:slice`.',
  ''
]

/** The prompt documents, by file name. Both routes (bench, `pnpm art:prompts`) render exactly this. */
export const promptDocs = (fits?: Fits): Record<string, string> => {
  const out: Record<string, string> = {}
  const blocks = promptBlocks(fits)
  for (const name of Object.keys(DOC_TITLES)) {
    const mine = blocks.filter(b => b.doc === name)
    if (!mine.length) continue
    out[name] = [...docIntro(name), ...mine.flatMap(b => [block(b.text), ''])].join('\n')
  }
  return out
}
