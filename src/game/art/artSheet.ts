import { ITEMS, TIER_COLOR, type ItemDef } from '../data/items'
import { CLASSES, CLASS_IDS, skillsOf, type ClassId } from '../data/skills'
import { HERO_OUTFITS, heroPortraitId } from './heroPortrait'
import { BRAND_REFS } from './brandRefs'
import { CG_BANNER, COVER_RECOMPOSED, COVER_SCENES, FAMILY_SIZE, VOID_DRAGON, type CoverScene } from './coverScenes'
import { CLASS_EMBLEM_BLURBS, MARK_ICONS, SLOT_BLURBS, SLOT_GLYPH, STATUS_BLURBS, UI_ICONS } from './iconBlurbs'
import { GLYPHS } from '../../components/art/glyphs'
import { statusTint } from '../../components/art/tints'

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
 * Not in here, by decision: `voidLord` (not a speaker), the status icons
 * (vector only). The hero is in, as four paintings of the same face, one per
 * outfit family (`art/heroPortrait.ts`); the code-drawn bust, which follows
 * every piece he wears, stays the fallback.
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
/**
 * How much of its panel an ICON's longest side takes on a reference sheet
 * (items, skills, the coin; not the busts, which stay on their box).
 *
 * The image model paints a thing at the size the reference shows it, and
 * with detail to match: at the glyph's own inset an icon was 55 to 70 % of
 * its panel, and came back small, fine-lined and hard to read at 40 px. At
 * 84 % it is drawn, and painted, large and bold, and still keeps 8 % of
 * plain ground on every side so nothing touches a cut line. The slicer trims
 * an icon to its own paint, so this size never reaches the game.
 */
export const ICON_FILL = 0.84
/** An icon shown in a round frame stays inside its panel's inscribed circle:
 *  its farthest point from the middle, as a share of half the panel. */
export const ICON_FILL_ROUND = 0.9

// ─── What the renderer can load ──────────────────────────────────────────────

export type ArtKind = 'items' | 'skills' | 'portraits' | 'ui' | 'textures' | 'icons' | 'logo'

/** Town and quest speakers, as the brief sets them out. */
const TOWN_LOOKS = ['smith', 'peddler', 'elder', 'healer', 'goblinTrader', 'captain', 'fence', 'dwarf', 'tinker'] as const
const TRAINER_LOOKS = ['trainerAegis', 'trainerShadow', 'trainerPyro', 'trainerSovereign', 'trainerChrono', 'trainerBlood', 'trainerAether', 'trainerGeo'] as const
const SPEAKER_LOOKS = ['goblinKing', 'warlord', 'oracle', 'dragon', 'archDemon'] as const
/** The hero, once per outfit family: `hero-tunic` … `hero-plate`. */
const HERO_LOOKS: readonly string[] = HERO_OUTFITS.map(o => heroPortraitId(o))
/** The girl hero (roadmap #71), the same four: `hero-f-tunic` … `hero-f-plate`. */
const HERO_F_LOOKS: readonly string[] = HERO_OUTFITS.map(o => heroPortraitId(o, 'f'))

/** Every drop-in the pipeline paints, by the folder the build scans. */
export const ART_CATALOGUE: Readonly<Record<ArtKind, readonly string[]>> = {
  items: ITEMS.map(i => i.id),
  skills: CLASS_IDS.flatMap(c => skillsOf(c).map(s => s.id)),
  portraits: [...TOWN_LOOKS, ...TRAINER_LOOKS, ...SPEAKER_LOOKS, ...HERO_LOOKS, ...HERO_F_LOOKS],
  ui: ['coin', 'map', 'bg-trade', 'bg-inventory', 'bg-skills'],
  textures: ['ground'],
  // Defined below with their sheets (`ICON_CELLS`); a getter, because the
  // cells are built after this table.
  get icons() { return ICON_CELLS.map(c => c.id) },
  // The painted badge and the loader's mascot (roadmap #65).
  logo: ['emblem', 'mascot']
}

/** Where a painted file goes, relative to `public/`. The name is the id. */
export const artTarget = (kind: ArtKind, id: string): string => `images/${kind}/${id}.webp`

// ─── Blurbs: WHAT IT IS, in material and shape ───────────────────────────────
//
// 62 items share 31 kind glyphs, so the blurb is what tells two swords apart.
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
  // Head: seen from the front, never on a head (a face is a subject of its own)
  quiltedCap: 'a round, close-fitting skullcap of quilted cloth with diamond stitching, a thick rolled brim band and a small round button on top',
  stalkersHood: 'an empty soft cloth hood seen from the front: a pointed peak, a deep dark oval opening where a face would be, and two short ties hanging at the bottom',
  ironcladHelm: 'an empty open-faced steel helmet seen from the front: a round dome with a centre ridge, a riveted brow band, a short stubby crest block on top and a narrow gap down the front',
  seersCirclet: 'a thin gold headband seen from the front, rising to a point in the middle that holds one large diamond-cut stone, with one tiny round stone on each side',
  wyrmguardGreathelm: 'an empty closed bucket-shaped steel helmet seen from the front: a flat-topped barrel with one dark T-shaped slit, a centre ridge and two round rivets on the cheeks',
  hatOfTheStarweaver: 'a tall pointed cloth hat with a wide round brim, its tip bent slightly to one side, a broad gold band around the base of the cone and one small four-pointed star on the cone',
  // Hands: ONE glove, fingers up, nothing inside it
  hideGloves: 'one empty mitten of rough brown leather seen from the back, fingers up: a rounded hand, a separate thumb, two stitched seam lines and a wide turned-back cuff',
  ironGauntlets: 'one empty iron plate gauntlet seen from the back, fingers up: a boxy hand of riveted plates with a knuckle band, a separate thumb plate and a wide flared wrist cuff',
  emberweaveGloves: 'one empty fine cloth glove seen from the back, fingers up: a slim rounded hand, a separate thumb, a wide cuff with a pale trim line and one small flame-shaped patch stitched on the back of the hand',
  duelistsGrips: 'one empty fitted glove of dark leather seen from the back, fingers up: a rounded hand with a padded knuckle strip, a separate thumb and a narrow buckled wrist strap',
  voidforgedGauntlets: 'one empty heavy plate gauntlet of dark steel seen from the back, fingers up: thick layered plates, a studded knuckle band, a separate thumb plate and a long flared cuff with a bright rim',
  gripsOfTheTempest: 'one empty ornate leather glove seen from the back, fingers up: a rounded hand with gold stitching, a separate thumb, one small lightning-bolt plate on the back of the hand and a wide gold-edged cuff',
  // Feet: ONE boot from the side, toe to the right
  trailBoots: 'one worn ankle boot of soft brown leather seen from the side, toe pointing right: a rounded toe, a folded cuff, a thick dark sole and one creased seam at the ankle',
  pathfindersBoots: 'one calf-high leather boot seen from the side, toe pointing right: a folded cuff, two small buckled straps across the shin and a thick dark sole',
  forgeplateGreaves: 'one armoured steel boot seen from the side, toe pointing right: banded shin plates, a flared knee guard on top, a rounded steel toe cap and a thick dark sole',
  mistwalkerBoots: 'one soft cloth boot seen from the side, toe pointing right: a slim toe curling slightly up, a wide cuff with a pale trim band, cloth wrappings around the ankle and a thin sole',
  stormstrideGreaves: 'one heavy armoured steel boot seen from the side, toe pointing right: thick overlapping shin plates, a large pointed knee guard, one small fin-shaped flange at the heel and a thick dark sole',
  treadsOfTheHorizon: 'one ornate tall leather boot seen from the side, toe pointing right: gold edging along the cuff and the sole, one small wing-shaped ornament at the ankle and a gold toe cap',
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
  archDemon: 'a crimson-skinned horned figure with two curved ivory horns, near-black hair, solid pale-yellow eyes with no pupils, dark armour with an amber collar line and a dark red cape at the shoulders',
  // The hero: the face, hair and skin are the sheet's ONE CHARACTER clause;
  // a blurb says only what he wears.
  'hero-tunic': 'the hero in his starting clothes: a plain blue cloth tunic with a gold collar line and a red cape at the shoulders',
  'hero-leather': 'the hero in a fitted brown leather jerkin with a pale collar line and a red cape at the shoulders',
  'hero-robe': 'the hero in a royal-blue cloth robe with a green collar line and a red cape at the shoulders',
  'hero-plate': 'the hero in polished steel plate armour with rounded shoulder plates, a green collar line and a red cape at the shoulders',
  // The girl hero (roadmap #71): the same four outfits; her face, hair and
  // ribbon are her sheet's ONE CHARACTER clause.
  'hero-f-tunic': 'the girl hero in her starting clothes: a plain blue cloth tunic with a gold collar line and a red cape at the shoulders',
  'hero-f-leather': 'the girl hero in a fitted brown leather jerkin with a pale collar line and a red cape at the shoulders',
  'hero-f-robe': 'the girl hero in a royal-blue cloth robe with a green collar line and a red cape at the shoulders',
  'hero-f-plate': 'the girl hero in polished steel plate armour with rounded shoulder plates, a green collar line and a red cape at the shoulders'
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
/** What the bench draws into a panel. `glyph`: an `ArtIcon` glyph (status,
 *  class emblem, empty-slot marker); `ui`: a `GameIcon`; `mark`: one of
 *  `components/icons/marks.ts`. */
export type DrawKind = 'item' | 'skill' | 'portrait' | 'coin' | 'glyph' | 'ui' | 'mark' | 'svg'

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
  /**
   * Written at `maxEdge` whatever the slicer's 256 px default says: a file read
   * at a fixed size outside the game's HUD (the logo on the splash and the
   * store art, the app icons cut from it).
   */
  exact?: boolean
  /** Row by row; `null` is a panel left blank (flat magenta). */
  cells: ReadonlyArray<SheetCell | null>
  /** One accent for the whole sheet (a class's skills). */
  accent?: { hex: string; name: string }
  /**
   * FINISH references: shipped paintings (project-relative paths) attached
   * BEFORE the layout reference, to show what "painted" means in this game.
   * The prompt document names them on an `Attach, in this order:` line under
   * the heading, which is how the Art Desk learns to attach them.
   */
  styleRefs?: readonly string[]
  /** Every panel is the same person (the hero's outfits): the consistency clause. */
  oneCharacter?: string
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
  plate: 'map' | 'ground' | 'screen'
  label: string
  /** A screen's backdrop (`components/game/backdrops.ts`): which one, and
   *  what is in it, left, right and in the calm middle, for its prompt. */
  screen?: { name: 'trade' | 'inventory' | 'skills'; what: string; left: string; right: string; middle: string }
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
// Helmets, gloves and boots (D39): eighteen pieces on two sheets, a slot never split across them.
const head = ITEMS.filter(i => i.slot === 'head')
const hands = ITEMS.filter(i => i.slot === 'hands')
const feet = ITEMS.filter(i => i.slot === 'feet')

const itemSet = (stem: string, title: string, items: ItemDef[]): ArtSet => ({
  stem, title, kind: 'items', doc: 'PROMPTS-ITEMS.md', cols: 4, rows: 3, maxEdge: 192, crop: 1, anchor: 'centre',
  cells: grid(items.map(itemCell), 4, 3)
})

/**
 * What a skill sheet is shown as "finished": three painted weapons, the icons
 * whose volume came back right. Single square sprites, as the pipeline's
 * rules ask (a sheet of another subject is read as subjects to copy), and the
 * prompt says they are never subjects.
 */
export const SKILL_FINISH_REFS: readonly string[] = ['ironBroadsword', 'dragonSmasher', 'voidCannon'].map(id => `public/${artTarget('items', id)}`)

const skillSet = (cls: ClassId): ArtSet => ({
  stem: `sheet-skills-${cls}`,
  title: `Skill icons: ${CLASS_NAME[cls]}`,
  kind: 'skills', doc: 'PROMPTS-SKILLS.md', cols: 3, rows: 2, panelH: TALL, maxEdge: 192, crop: 1, anchor: 'centre',
  accent: { hex: CLASSES[cls].color, name: CLASS_HUE[cls] },
  styleRefs: SKILL_FINISH_REFS,
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

// ─── Every other icon the player sees ───────────────────────────────────────
//
// The UI glyphs, the status effects, the class emblems, the empty-slot markers
// of the equipment doll and the few marks drawn outside the icon set. Next to
// painted items and skills the vectors read as another game, so they go
// through the same round trip. All of them are `public/images/icons/
// <family>-<id>.webp` (`ICON_ART`); a missing file keeps the vector. Most are
// drawn small, so their prompt asks for 24 px, not 40.

/** A hue name for a status colour, for the prompt. */
const hueName = (hex: string): string => {
  const n = Number.parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  if (mx - mn < 30) return 'grey'
  const h = mx === r ? ((g - b) / (mx - mn) + 6) % 6 * 60 : mx === g ? ((b - r) / (mx - mn) + 2) * 60 : ((r - g) / (mx - mn) + 4) * 60
  if (h < 15 || h >= 345) return 'red'
  if (h < 40) return 'orange'
  if (h < 65) return 'gold'
  if (h < 160) return 'green'
  if (h < 190) return 'teal'
  if (h < 215) return 'sky blue'
  if (h < 245) return 'blue'
  if (h < 290) return 'violet'
  return 'pink'
}

const iconCell = (id: string, draw: DrawKind, ref: string, blurb: string, tint: string, tintName: string, round = false): SheetCell => ({
  id, draw, label: labelOf(id), blurb, target: artTarget('icons', id), glyph: ref, tint, tintName, ...(round ? { round } : {})
})

const STATUS_IDS = Object.keys(GLYPHS).filter(k => k.startsWith('status.')).map(k => k.slice(7))
const statusCells = STATUS_IDS.map(id => {
  const blurb = STATUS_BLURBS[id]
  if (!blurb) throw new Error(`artSheet: no blurb for status "${id}"`)
  return iconCell(`status-${id}`, 'glyph', `status.${id}`, blurb, statusTint(id), hueName(statusTint(id)), true)
})
const classCells = CLASS_IDS.map(cls => iconCell(`class-${cls}`, 'glyph', `skill.${skillsOf(cls)[0]!.id}`, CLASS_EMBLEM_BLURBS[cls], CLASSES[cls].color, CLASS_HUE[cls], true))
const uiCells = UI_ICONS.map(i => iconCell(`ui-${i.ref}`, 'ui', i.ref, i.blurb, i.tint, i.tintName))
const slotCells = Object.entries(SLOT_BLURBS).map(([slot, blurb]) => iconCell(`slot-${slot}`, 'glyph', SLOT_GLYPH[slot] ?? 'unknown', blurb, '#b8b2c8', 'pale stone grey'))
const markCells = MARK_ICONS.map(m => iconCell(`mark-${m.ref}`, 'mark', m.ref, m.blurb, m.tint, m.tintName))

const iconSet = (stem: string, title: string, cells: SheetCell[], cols: number, rows: number, maxEdge: number): ArtSet => ({
  stem, title, kind: 'icons', doc: 'PROMPTS-ICONS.md', cols, rows, maxEdge, crop: 1, anchor: 'centre',
  // The painted weapons show what "painted" means, as they do for the skills.
  styleRefs: SKILL_FINISH_REFS,
  cells: grid(cells, cols, rows)
})

/** The icon sheets, in the order to paint them: what stands out most first. */
export const ICON_SETS: readonly ArtSet[] = [
  iconSet('sheet-icons-classes', 'Icons: class emblems', classCells, 3, 3, 128),
  iconSet('sheet-icons-status-1', 'Icons: status effects (1 of 3)', statusCells.slice(0, 12), 4, 3, 96),
  iconSet('sheet-icons-status-2', 'Icons: status effects (2 of 3)', statusCells.slice(12, 24), 4, 3, 96),
  iconSet('sheet-icons-status-3', 'Icons: status effects (3 of 3)', statusCells.slice(24), 4, 3, 96),
  iconSet('sheet-icons-ui-1', 'Icons: HUD and menu buttons', uiCells.slice(0, 12), 4, 3, 96),
  iconSet('sheet-icons-ui-2', 'Icons: screen buttons', uiCells.slice(12, 24), 4, 3, 96),
  iconSet('sheet-icons-ui-3', 'Icons: badges, pins and help', uiCells.slice(24, 36), 4, 3, 96),
  iconSet('sheet-icons-misc', 'Icons: equipment slots and marks', [...uiCells.slice(36), ...slotCells, ...markCells], 4, 3, 128)
]
const ICON_CELLS: readonly SheetCell[] = ICON_SETS.flatMap(s => s.cells.flatMap(c => (c ? [c] : [])))

export const SETS: readonly ArtSet[] = [
  itemSet('sheet-items-weapons', 'Item icons: weapons', main.slice(0, 12)),
  itemSet('sheet-items-arms', 'Item icons: top weapons and off-hands', [...main.slice(12), ...off]),
  itemSet('sheet-items-armor', 'Item icons: body armour', body),
  itemSet('sheet-items-trinkets', 'Item icons: trinkets', trinkets),
  itemSet('sheet-items-headgear', 'Item icons: headgear and gloves', [...head, ...hands]),
  itemSet('sheet-items-boots', 'Item icons: boots', feet),
  ...CLASS_IDS.map(skillSet),
  portraitSet('sheet-portraits-town', 'Portraits: townsfolk', TOWN_LOOKS, 3, 3),
  portraitSet('sheet-portraits-trainers', 'Portraits: trainers', TRAINER_LOOKS, 3, 3),
  portraitSet('sheet-portraits-speakers', 'Portraits: quest speakers', SPEAKER_LOOKS, 3, 2),
  {
    ...portraitSet('sheet-portraits-hero', 'Portraits: the hero, per outfit', HERO_LOOKS, 2, 2),
    // Four paintings of ONE face, shown as the same player all game: a face
    // that drifts between them is the one failure this sheet can have.
    oneCharacter: [
      'ONE CHARACTER — all 4 panels are the SAME young hero, the player\'s own character, painted four times. That is the whole point of this sheet.',
      '· The same face in every panel: the same head shape, the same eyes, the same small smile, the same proportions, the same age. A likeable, determined chibi adventurer, young but not a child.',
      '· The same hair in every panel: short, tousled, warm brown (about #7a4a2a), the same cut and the same parting.',
      '· The same skin in every panel: fair and warm (about #f2c8a0).',
      '· ONLY THE CLOTHES CHANGE between the panels, as each panel\'s line says. No helmet, no hat, no hood: the face and hair always show.',
      '· Four different people side by side is the wrong answer however well each is painted. Hold panel 1 against panel 4: if the face is not obviously the same person, it is not usable.'
    ].join('\n')
  },
  {
    // The girl hero (roadmap #71): the player picks her or the boy on the
    // first boot, so she is painted exactly like him: the same artist, the
    // same age and proportions, her own face. His finished portraits go along
    // as the finish to match, never as her face.
    ...portraitSet('sheet-portraits-girl', 'Portraits: the girl hero, per outfit', HERO_F_LOOKS, 2, 2),
    styleRefs: ['public/images/portraits/hero-tunic.webp', 'public/images/portraits/hero-plate.webp'],
    oneCharacter: [
      'ONE CHARACTER — all 4 panels are the SAME young girl hero, the player\'s own character, painted four times. That is the whole point of this sheet.',
      '· The same face in every panel: the same head shape, the same big eyes with dark lashes flicking out at the outer corners, the same fine arched brows, the same small smile and rosy cheeks, the same proportions, the same age. A likeable, determined chibi adventurer girl, young but not a child.',
      '· The same hair in every panel: warm auburn (about #9a4526), a soft side-swept fringe, one lock framing each cheek, and a high ponytail at the back of the head tied with a red ribbon bow (about #e0505e); the ponytail shows beside the head.',
      '· The same skin in every panel: fair and warm (about #f2c8a0). Green eyes (about #3fa66a).',
      '· ONLY THE CLOTHES CHANGE between the panels, as each panel\'s line says. No helmet, no hat, no hood: the face and hair always show.',
      '· Four different people side by side is the wrong answer however well each is painted. Hold panel 1 against panel 4: if the face is not obviously the same person, it is not usable.',
      '',
      'ATTACHED IMAGES — the first 2 are finished portraits of the BOY hero of this same game. She is his counterpart, a different person: take from them ONLY the finish and the hand — the outline, the hard-edged shading, the head size, the age, the proportions, the way the bust is cut. Never his face, never his short brown hair. The LAST image is the layout reference.'
    ].join('\n')
  },
  ...ICON_SETS
]

/** One object per file. The same shape as a set, with one panel. */
export const SINGLES: readonly ArtSet[] = [
  {
    stem: 'single-ui-coin', title: 'UI: the gold coin', kind: 'ui', doc: 'PROMPTS-UI.md', cols: 1, rows: 1, maxEdge: 64, crop: 1, anchor: 'centre',
    cells: [{ id: 'coin', draw: 'coin', label: 'Coin', blurb: COIN_BLURB, target: artTarget('ui', 'coin') }]
  },
  // ── The brand (roadmap #65): the logo's badge and the loader's mascot ──
  // Written at 512 (`exact`): the splash shows them large, the store art and
  // the app icons are cut from them. The title letters stay code-drawn.
  {
    stem: 'single-logo-emblem', title: 'Logo: the badge (swords behind a shield)', kind: 'logo', doc: 'PROMPTS-UI.md', cols: 1, rows: 1, maxEdge: 512, exact: true, crop: 1, anchor: 'centre',
    cells: [{ id: 'emblem', draw: 'svg', glyph: 'emblem', label: 'Logo emblem', target: artTarget('logo', 'emblem'), tint: '#3f7fd6', tintName: 'blue', blurb: 'a heraldic badge: a blue heater shield with a gold inner rim and a white four-pointed star in its middle, in front of two steel swords crossed behind it, their gold crossguards and pommels showing at the lower corners and their blades rising past the shield\'s top corners' }]
  },
  {
    stem: 'single-logo-mascot', title: 'Logo: the mascot (the hero)', kind: 'logo', doc: 'PROMPTS-UI.md', cols: 1, rows: 1, maxEdge: 512, exact: true, crop: 1, anchor: 'centre',
    // Who he is: the painted portraits of the same hero.
    styleRefs: ['public/images/portraits/hero-tunic.webp', 'public/images/portraits/hero-leather.webp'],
    cells: [{ id: 'mascot', draw: 'svg', glyph: 'mascot', label: 'Mascot', target: artTarget('logo', 'mascot'), tint: '#3f7fd6', tintName: 'blue', blurb: 'the hero of the game, full figure, as a lovable squat chibi adventurer: short tousled brown hair, a big friendly confident grin, a blue tunic with a brown belt, brown boots and a red cape; one hand raises a steel sword with a gold crossguard high, the other waves at the viewer' }]
  }
]

export const SCENERY: readonly ArtScenery[] = [
  {
    stem: 'bg-ui-map', title: 'UI: the world map terrain', kind: 'ui', doc: 'PROMPTS-UI.md', width: 1376, height: 768,
    target: artTarget('ui', 'map'), maxEdge: 1376, tileable: false, bg: 'opaque', plate: 'map', label: 'World map'
  },
  // The three big screens' backdrops (D38 to D40, D45). Drawn by
  // `components/game/backdrops.ts` until the file exists; shown `cover`, so the
  // middle of the sheet is always under the interface (see `screenPrompt`).
  {
    stem: 'bg-ui-trade', title: 'UI: the trade table backdrop', kind: 'ui', doc: 'PROMPTS-UI.md', width: 1376, height: 768,
    target: artTarget('ui', 'bg-trade'), maxEdge: 1376, tileable: false, bg: 'opaque', plate: 'screen', label: 'Trade table',
    screen: {
      name: 'trade',
      what: 'a merchant\'s wooden counter seen from straight above: warm honey-brown planks running across the whole picture, with a long runner of deep teal cloth laid down the middle from the top edge to the bottom edge, a gold band along each of its long sides.',
      left: 'on the planks left of the cloth: a brass lantern with a glowing glass body standing near the top, a hard-edged pool of warm light on the wood around it, a small stack of gold coins, and an open ledger with a quill lying across it near the bottom.',
      right: 'on the planks right of the cloth: brass merchant\'s scales near the top (one pan lower, holding a few coins), three small steel weights in a row above them, and an untied leather coin purse near the bottom with coins spilling from it.',
      middle: 'the teal cloth with a quiet woven diamond pattern, tone on tone.'
    }
  },
  {
    stem: 'bg-ui-inventory', title: 'UI: the equipment backdrop', kind: 'ui', doc: 'PROMPTS-UI.md', width: 1376, height: 768,
    target: artTarget('ui', 'bg-inventory'), maxEdge: 1376, tileable: false, bg: 'opaque', plate: 'screen', label: 'Equipment',
    screen: {
      name: 'inventory',
      what: 'the inside of an open adventurer\'s satchel seen from the front: a deep green quilted lining filling the picture, framed by the bag\'s stitched tan leather rim along all four edges, with two leather straps and brass buckles hanging over the top rim.',
      left: 'a wooden weapon rack standing in the bag: two posts and two rails, a sword hanging point down, an axe beside it, and a round blue shield leaning at its foot.',
      right: 'a wooden armour stand: a post on a foot, a steel breastplate hung on its shoulder bar and a steel helmet with a red plume on top.',
      middle: 'the quilted green lining, lit a little lighter toward the middle.'
    }
  },
  {
    stem: 'bg-ui-skills', title: 'UI: the skills backdrop', kind: 'ui', doc: 'PROMPTS-UI.md', width: 1376, height: 768,
    target: artTarget('ui', 'bg-skills'), maxEdge: 1376, tileable: false, bg: 'opaque', plate: 'screen', label: 'Skills',
    screen: {
      name: 'skills',
      what: 'a page of a star codex: a deep indigo night sky filling the picture inside a brass frame along all four edges, with turned brass ornaments in the corners and four coloured gems set into the frame down each side.',
      left: 'two constellations of four-pointed stars joined by dotted lines (one shaped like a sword in pale blue, one like a flame in orange), a shooting star, and many small stars.',
      right: 'two more constellations (a shield in pale gold, an hourglass in lilac), a shooting star near the bottom, and many small stars.',
      middle: 'the dark sky with the faint rings and tick marks of an astrolabe, and only a few faint stars.'
    }
  },
  {
    stem: 'bg-ground', title: 'Texture: the ground detail', kind: 'textures', doc: 'PROMPTS-UI.md', width: 512, height: 512,
    // The game bakes it into a 256 px tile, so more is payload.
    target: artTarget('textures', 'ground'), maxEdge: 256, tileable: true, bg: 'opaque', plate: 'ground', label: 'Ground'
  }
]

/**
 * The store covers (roadmap #1, `coverScenes.ts`): opaque full-bleed masters
 * like a backdrop, but nothing in the game loads them. The slicer writes its
 * preview copy to `store-art/covers/masters/` (outside `public/`, so no build
 * ships it); `store-art/covers.mjs` cuts the deliverables from the painting.
 */
export interface ArtCover {
  stem: string
  title: string
  doc: 'PROMPTS-COVERS.md'
  width: number
  height: number
  /** Relative to `public/`, like every target: it climbs out to `store-art/`. */
  target: string
  maxEdge: number
  scene: CoverScene
  styleRefs: readonly string[]
}

/** Where a cover master's preview copy lands, relative to `public/`. */
export const coverTarget = (stem: string): string => `../store-art/covers/masters/${stem}.webp`

/** The four scenarios (16:9), then the square and tall recompositions of the winners. */
export const COVERS: readonly ArtCover[] = [...COVER_SCENES, ...COVER_RECOMPOSED].map(scene => ({
  stem: scene.stem,
  title: scene.title,
  doc: 'PROMPTS-COVERS.md' as const,
  ...FAMILY_SIZE[scene.family],
  target: coverTarget(scene.stem),
  maxEdge: Math.max(FAMILY_SIZE[scene.family].width, FAMILY_SIZE[scene.family].height),
  scene,
  styleRefs: scene.refs
}))

/** A panel's height, px: `CELL` unless the set says otherwise. */
export const panelHeight = (s: ArtSet): number => s.panelH ?? CELL

export const sheetSize = (s: ArtSet): { width: number; height: number } => ({ width: s.cols * CELL, height: s.rows * panelHeight(s) })

/** Every stem a painted file may be filed under. */
export const allStems = (): string[] => [...SETS, ...SINGLES, ...SCENERY, ...COVERS].map(s => s.stem)

/** Every target the manifest writes, with the stem that owns it. */
export const manifestTargets = (): Map<string, string> => {
  const out = new Map<string, string>()
  for (const s of [...SETS, ...SINGLES]) for (const c of s.cells) if (c) out.set(c.target, s.stem)
  for (const a of [...SCENERY, ...COVERS]) out.set(a.target, a.stem)
  return out
}

// ─── The world map plate ─────────────────────────────────────────────────────
//
// The terrain `WorldMap.vue` draws under its landmarks until
// `images/ui/map.webp` exists: sea and coast, a region of terrain per stretch
// of the journey, rivers, bridges, the roads' beds and the bare sites the
// landmarks stand on. It is built from data in
// `components/screens/map/terrain.ts` (`mapPlateSvg`), and the bench bakes that
// same drawing as the reference. The landmarks, the travelled roads, the names
// and everything that moves are drawn by the game OVER the plate, painted or
// not: `mapPrompt` below tells the painter to leave them out.

// ─── The index: what the slicer and the desk read ────────────────────────────

/** A drawing's solid bounding box, as fractions of its panel. */
export interface Fit { h: number; w: number; bottom: number; cx: number }
/** Measured fits, keyed by TARGET: the one name no two panels share. */
export type Fits = Readonly<Record<string, Fit>>

export interface IndexCell { id: string; label: string; variant: string; x: number; y: number; w: number; h: number; target: string; round?: true; fit?: Fit }
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
  exact?: true
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
    ...(s.exact ? { exact: true } : {}),
    crop: s.crop,
    anchor: s.anchor,
    cells: s.cells.flatMap((c, i) => (c
      ? [{
          // The PANEL's rect. The slicer cuts the square in its middle, and a
          // fit is a fraction of that square, never of the taller panel.
          id: c.id, label: c.label, variant: s.kind, x: (i % s.cols) * CELL, y: Math.floor(i / s.cols) * panelHeight(s), w: CELL, h: panelHeight(s),
          // `round`: shown in a round frame, so the slicer fits it inside the circle.
          target: c.target, ...(c.round ? { round: true as const } : {}), ...(fits?.[c.target] ? { fit: fits[c.target] } : {})
        }]
      : []))
  })),
  scenery: [
    ...SCENERY.map(a => ({
      id: a.stem, file: `${a.stem}.png`, title: a.title, width: a.width, height: a.height, target: a.target, maxEdge: a.maxEdge, tileable: a.tileable, bg: a.bg
    })),
    // A cover is an opaque picture to the slicer, exactly like a backdrop.
    ...COVERS.map(a => ({
      id: a.stem, file: `${a.stem}.png`, title: a.title, width: a.width, height: a.height, target: a.target, maxEdge: a.maxEdge, tileable: false, bg: 'opaque' as const
    }))
  ]
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
/**
 * Effects only: what "painted" means, spelled out. The first skill sheets
 * came back as flat single-colour shapes with an outline (the reference,
 * neatly redrawn) while the weapons, from the same style block, came back
 * with real volume: an object brings its own material to shade, a symbol
 * does not. So the volume is demanded here, part by part, and the flat
 * answer is named as the wrong one.
 */
export const FINISH = [
  'PAINTED VOLUME — this is what the sheet is judged on.',
  '· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.',
  '· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.',
  '· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE\'S OWN COLOUR on fire, light and energy.',
  '· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.',
  '· The silhouette is the reference\'s, unchanged. Put the volume INSIDE the outline; do not add parts around it.',
  '· The accent colour stays the dominant colour of every panel.'
].join('\n')

/**
 * Icons are drawn at 40 px in the HUD. The first painted icons carried detail
 * that turned to mud there, so the size they are seen at is part of the brief.
 */
export const READABLE = [
  'READABLE AT 40 PIXELS — each of these is shown about 40 pixels wide in the game, and it has to be recognised at a glance.',
  '· Bold, chunky shapes and a thick outline. Few parts, each one large.',
  '· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size.',
  '· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.',
  '· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.',
  '· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.'
].join('\n')
/** The same clause, for icons drawn as small as 24 px (badges, pins, status chips). */
export const READABLE_SMALL = READABLE
  .replace('READABLE AT 40 PIXELS — each of these is shown about 40 pixels wide', 'READABLE AT 24 PIXELS — each of these is shown between 24 and 40 pixels wide')
  .replace('disappears at that size.', 'disappears at that size. At 24 pixels a shape has room for one idea: keep only the silhouette and its one or two biggest colour areas.')

export const SEE_THROUGH = 'NOTHING IS EVER SEE-THROUGH. Every piece that is present is painted at full, solid colour; light is painted as solid shapes (hard-edged rays, solid rim bands), never as a soft bloom around a shape and never half-transparent or ghostly.'

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
/** `4:3`, `3:2`, `1:1`, and `16:9` for the map's near-16:9 plate. */
const ratio = (w: number, h: number): string => {
  if (Math.abs(w / h - 16 / 9) < 0.02) return '16:9'
  if (Math.abs(h / w - 16 / 9) < 0.02) return '9:16'
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
  // Not measured yet: what the bench aims for. An icon's longest side, a bust's box.
  const nominal = s.anchor === 'centre' ? ICON_FILL : REF_SCALE
  const e = w > 0 && h > 0 ? { w, h } : { w: nominal, h: nominal }
  // A fit is measured on the drawing's square; the prompt speaks of the PANEL,
  // which may be taller than that square.
  return { w: e.w, h: (e.h * CELL) / panelHeight(s) }
}

const heading = (title: string, stem: string, target: string): string => `# ${title}  (${stem}.png → ${target})`

/** What every panel of a set is, by position. Names never appear: a name is a noun, and a noun gets painted. */
/** `tint`: say each panel's accent (items), or its main colour (icons, which have no colour of their own). */
const panelList = (s: ArtSet, withTint: boolean | 'main'): string[] =>
  s.cells.map((c, i) => {
    const at = `Panel ${i + 1} (row ${Math.floor(i / s.cols) + 1}, column ${(i % s.cols) + 1})`
    if (!c) return `${at}: BLANK — flat magenta and nothing else.`
    const tint = !withTint || !c.tint ? '' : withTint === 'main' ? ` Main colour: ${c.tintName} (about ${c.tint}).` : ` Accent, where the reference shows one: ${c.tintName} (about ${c.tint}).`
    // No "frame", no "round": the first passives came back with the frame PAINTED,
    // a dark ring or disc around the drawing. Say where the paint may go, and
    // name the ring as the thing not to draw.
    return `${at}: ${c.blurb}.${tint}${c.round ? ' Keep this one compact, well away from its panel\'s four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.' : ''}`
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
    // Written after a return that did exactly this: "magenta included" was
    // read as the pure colour only, and the grid came back in a paler shade.
    '· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.',
    ...(panelHeight(s) !== CELL ? [`· The panels are NOT square: each is a little taller than it is wide (${ratio(CELL, panelHeight(s))}), because the canvas divides into ${s.cols} equal columns and ${s.rows} equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.`] : []),
    ...(blanks ? [`· ${blanks} panel${blanks > 1 ? 's are' : ' is'} BLANK in the reference. Leave ${blanks > 1 ? 'them' : 'it'} flat magenta: do not invent anything for ${blanks > 1 ? 'them' : 'it'}.`] : [])
  ]
}

/**
 * Which attached image is which, when a sheet goes out with finish references.
 * The model takes its grid and shape from the LAST image it is given and reads
 * any other as something to copy, so both facts are said in words.
 */
const attached = (s: ArtSet): string[] => {
  const n = s.styleRefs?.length ?? 0
  if (!n) return []
  return [
    '',
    `ATTACHED IMAGES — there are ${n + 1}, and they do two different jobs.`,
    `· The first ${n} are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.`,
    '· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.'
  ]
}

const sizeClause = (s: ArtSet, fits?: Fits): string[] => {
  const e = extent(s, fits)
  return [
    'SIZE AND PLACE — measure against the PANEL, not against the paper.',
    `· In the reference no drawing is wider than about ${pct(e.w)}% of its panel or taller than about ${pct(e.h)}%, and every panel keeps a clear magenta margin on all four sides.`,
    ...(s.anchor === 'centre' ? ['· Paint each one as LARGE as the reference shows it: it takes up most of its panel, with a narrow, even margin of magenta around it. A small drawing in the middle of a big empty panel is the wrong answer.'] : []),
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
    '· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.',
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
    READABLE,
    '',
    ...sizeClause(s, fits),
    '',
    BACKGROUND,
    '',
    GLOW,
    '',
    ...checks(s, [
      '· Each panel holds exactly one object and nothing else.',
      '· Every object would still be recognised 40 pixels wide.'
    ]),
    '',
    output(width, height)
  ].join('\n')
}

/**
 * The icon sheets: the items' brief (it came back with real volume) plus the
 * skills' painted-volume block, the 24 px readability clause, and one fixed
 * colour per panel, since a UI glyph has none of its own.
 */
const iconPrompt = (s: ArtSet, fits?: Fits): string => {
  const { width, height } = sheetSize(s)
  return [
    heading(s.title, s.stem, 'images/icons/'),
    '',
    ...comesBack(s, 'object'),
    ...attached(s),
    '',
    'EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR SIGN — NOT A FLAT SYMBOL, AND NOT A SCENE.',
    '· Paint ONLY what the reference shows in that panel. No hand, no character, no ground, no shadow, no sparkle cloud, no scenery.',
    '· The game puts each one on its own button, badge or frame. Nothing here sits on a tile, badge, ring, disc or button of its own.',
    '· Where a panel is a SIGN rather than a thing (an arrow, a tick, a cross, a plus, a question mark, a triangle), paint it as a thick, solid, enamelled token shape with the same volume, outline and glint as everything else — never as a flat letter from a font.',
    '',
    'WHAT EACH PANEL IS:',
    ...panelList(s, 'main'),
    '',
    'COLOUR — each panel\'s line names its main colour, and the reference shows it. Keep it: the game shows these on coloured buttons and dark frames, and the colour is how a player finds the right one. Take the HUE, not the flatness.',
    '',
    'THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.',
    '',
    `ONE HAND — all ${s.cells.filter(c => c).length} are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one panel has volume and the next is flat is not one set.`,
    '',
    FINISH,
    '',
    STYLE_PART,
    NOTATION,
    '',
    READABLE_SMALL,
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
      '· Each panel holds exactly one thing and nothing else, and no ring, disc, button or badge sits around or behind it.',
      '· Every shape has a lit side and a shadow side: not one of them is a single flat colour.',
      '· Every panel would still be recognised 24 pixels wide.'
    ]),
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
    // "Object", not "icon" or "emblem": those two words are a style, and the
    // first skill sheets came back in it — flat, like an icon font.
    ...comesBack(s, 'object'),
    ...attached(s),
    '',
    'EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR BURST OF ENERGY — NOT A FLAT SYMBOL, AND NOT A SCENE.',
    '· Paint ONLY what the reference shows in that panel. No character casting it, no hand, no target, no landscape, no extra sparks around it.',
    '· The game draws its own coloured frame around each one. Nothing here sits on a tile, badge, ring or disc.',
    '',
    'WHAT EACH PANEL IS:',
    ...panelList(s, false),
    '',
    `COLOUR — ONE accent for the whole sheet: ${accent.name} (about ${accent.hex}). Wherever the reference uses that colour, yours does; white, gold, steel, wood, red, green and blue details keep the colours the reference gives them. Take the HUE, not the flatness.`,
    '',
    'THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.',
    '',
    `ONE HAND — all ${s.cells.filter(c => c).length} belong to one set, painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left, the same accent colour. A sheet where one panel has volume and the next is flat is not one set.`,
    '',
    FINISH,
    '',
    STYLE_PART,
    NOTATION,
    '',
    READABLE,
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
      '· Each panel holds exactly one thing and nothing else, and no ring, disc or badge sits around or behind it.',
      '· Every shape has a lit side and a shadow side: not one of them is a single flat colour.',
      '· No panel is a flat copy of the reference\'s plain shapes.',
      '· Every panel would still be recognised 40 pixels wide.',
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
    // Before the style, for the same reason the background rule is near the
    // top: it decides whether the sheet is usable at all.
    ...(s.oneCharacter ? [s.oneCharacter, ''] : []),
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

/**
 * The logo badge and the mascot: shown large (the splash, the store art, the
 * app icons), so the brief is about appeal and finish rather than 24 px. The
 * badge carries NO letters; the mascot is the same hero as the portraits.
 */
const brandPrompt = (s: ArtSet, fits?: Fits): string => {
  const c = s.cells[0]
  if (!c) throw new Error(`artSheet: ${s.stem} has no panel`)
  const e = extent(s, fits)
  const mascot = c.id === 'mascot'
  return [
    heading(s.title, s.stem, c.target),
    '',
    mascot ? 'WHAT COMES BACK IS ONE CHARACTER, FULL FIGURE, ON A FLAT MAGENTA GROUND.' : 'WHAT COMES BACK IS ONE BADGE ON A FLAT MAGENTA GROUND.',
    'One square image holding one subject, at the size and in the spot the attached layout reference shows it.',
    ...(mascot
      ? [
          '',
          `ATTACHED IMAGES — there are ${(s.styleRefs?.length ?? 0) + 1}.`,
          `· The first ${s.styleRefs?.length ?? 0} are painted portraits of THIS SAME HERO from the game. Copy his face from them exactly: the same face shape, the same eyes and brows, the same short tousled brown hair, the same skin, the same age. He must be recognisably the same person.`,
          '· The LAST image is the LAYOUT reference: his pose, his size and his place. Wherever this text says "the reference", it means that last image. Its flat shapes are notation; take only the pose from it.'
        ]
      : []),
    '',
    `WHAT IT IS: ${c.blurb}. NOTHING else: no ground, no shadow, no scenery, no frame or card behind it.`,
    ...(mascot
      ? ['', 'THE POSE — dynamic and friendly, the game\'s mascot on its loading screen: a little lean, weight on one leg, sword up, a wave, a grin that invites the player in. Facing the viewer (a slight three-quarter turn of the body is fine, the face looks at us).']
      : ['', 'NO LETTERS — not one letter, word, number or rune anywhere on it, not even the game\'s name: the title is set beside it by the game. A badge with lettering on it is the wrong answer.']),
    '',
    'APPEAL — this is the face of the game on its splash, on store pages and on a phone\'s home screen. Make it the most polished thing in the set: crisp, confident, bright and immediately likeable.',
    '',
    FINISH,
    '',
    STYLE_PART,
    '',
    'SIZE AND PLACE — measure against the image, not against a guess.',
    `· In the reference the subject takes about ${pct(e.w)}% of the image's width and ${pct(e.h)}% of its height, centred, with a clear magenta margin on all four sides. Keep it there.`,
    `· It must still read as a small square at 32 pixels${mascot ? '' : ' (it becomes the game\'s app icon and favicon)'}: a bold silhouette and two or three big areas of colour.`,
    '',
    BACKGROUND,
    '',
    GLOW,
    '',
    'BEFORE YOU CALL IT FINISHED, check:',
    `· There is exactly one ${mascot ? 'character' : 'badge'}, and it does not reach the edge of the image.`,
    ...(mascot ? ['· His face is the face in the attached portraits.'] : ['· There is not one letter, word or number anywhere in the image.']),
    '· Every pixel that is not the subject is flat, vivid #FF00FF.',
    '',
    'OUTPUT: one square image (1:1), 1024 x 1024 pixels or larger. If your tool has an aspect-ratio control, set it to 1:1. PNG. No labels, captions, numbers or watermarks.'
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
    READABLE,
    '',
    'SIZE AND PLACE — measure against the image, not against a guess.',
    `· In the reference the object is about ${pct(e.w)}% of the image's width and ${pct(e.h)}% of its height, centred, with a clear magenta margin on all four sides. Keep it there.`,
    '· In the game it is shown smaller still, at the size of a single letter: the simplest version of itself.',
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

/**
 * A big screen's backdrop: a still life the interface is laid over. It is
 * shown `cover`, so its sides are cropped on a narrow screen and its middle is
 * always under panels and lettering: the prompt keeps the objects out at the
 * sides and the middle one calm surface.
 */
const screenPrompt = (a: ArtScenery): string => {
  const sc = a.screen!
  return [
    heading(a.title, a.stem, a.target),
    '',
    'WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED BACKDROP FOR A GAME SCREEN: A STILL LIFE WITH NO PEOPLE AND NO LETTERING.',
    `One ${shapeWord(a.width, a.height)} image, ${a.width} x ${a.height} pixels (${ratio(a.width, a.height)}), painted edge to edge.`,
    '',
    'IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the backdrop the screen is drawn on top of. No outer frame of your own, no vignette, no card, no matting, no rounded corners, no letterboxing.',
    '',
    `WHAT IT IS: ${sc.what} Repaint the attached reference: every object stays where the reference has it, at its size.`,
    `· LEFT: ${sc.left}`,
    `· RIGHT: ${sc.right}`,
    `· MIDDLE: ${sc.middle}`,
    '',
    'THE CALM MIDDLE — read this twice. The game lays its interface over the middle of this picture: panels, buttons and white lettering with a dark outline. The middle 44% of the width (from 28% to 72% across) is ALWAYS covered, and on a phone held upright it is all that is seen. Keep that band one quiet, even surface: no objects, no strong pattern, no bright spot, no dark hole, nothing that draws the eye. Every object lives in the outer 28% at each side, and nothing important sits in the top 12% (a bar of buttons covers it).',
    '',
    'WHAT IT IS NOT: no people, no hands, no animals, no faces, no text, no letters, no numbers, no runes, no signs, no labels, no buttons, no frames or panels of an interface, no icons. Nothing that could be mistaken for something the player can tap.',
    '',
    'COLOUR — the reference\'s own, object by object. Take the HUES from it, not the flatness.',
    '',
    'THE VIEW — as the reference: straight on, flat, the objects as simple upright shapes. No perspective that tilts the surface away, no depth blur.',
    '',
    STYLE_BACKDROP,
    '',
    'BEFORE YOU CALL IT FINISHED, check:',
    '· The picture reaches all four edges of the image; there is no magenta and no added border.',
    '· Laid over the reference, every object is where the reference has it.',
    '· The middle band is calm and even, with not one object in it, and there is not one letter anywhere.',
    '',
    `OUTPUT: one image, ${a.width} x ${a.height} pixels (${ratio(a.width, a.height)}, ${shapeWord(a.width, a.height)}). If your tool has an aspect-ratio control, set it to ${ratio(a.width, a.height)}. PNG. No labels, captions, numbers or watermarks.`
  ].join('\n')
}

const mapPrompt = (a: ArtScenery): string => [
  heading(a.title, a.stem, a.target),
  '',
  'WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED MAP OF A FANTASY REALM: ITS TERRAIN ONLY, WITH NO BUILDINGS AND NO LETTERING.',
  `One ${shapeWord(a.width, a.height)} image, ${a.width} x ${a.height} pixels (${ratio(a.width, a.height)}), painted edge to edge.`,
  '',
  'IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the sheet the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge (the game draws the paper\'s edge itself).',
  '',
  'WHAT IT IS: the terrain of a hand-drawn storybook map, drawn the way such maps are: the land flat from above, and what stands on it (mountains, trees, hills) as small upright pictures. Repaint the attached reference. Every coast, region, river, bridge, road and clearing stays exactly where the reference has it: the game lays its own drawings over the picture by position. In the reference:',
  '· Sea along the left and the bottom edge and in the lower right corner: bright turquoise, a paler band of shallows hugging the coast, small white wave squiggles, a few rocks, a small wreck on the rocks of the left shore, a little sand island in the lower left corner and one at the right edge.',
  '· Lower left: bright green meadow with soft hills, tufts, flowers, lone round trees and a few sheep.',
  '· Left: olive-yellow hills dotted with grey rocks; a short river above them runs to the left shore.',
  '· Upper left: tan highlands crowded with brown, snow-capped mountains and dark pines.',
  '· Middle: a wood of round lollipop trees, a few in pink blossom or autumn orange; a blue river runs down its left side into the bay, with a plank bridge where a road crosses it; a ring of standing stones to the left of the wood.',
  '· Above the middle: an ashen grey-violet waste with cracks of glowing lava, cinder rocks, dead trees, and a stream of lava running into a small pool.',
  '· Top middle: snowfields with pale blue peaks, snow-tipped pines, drifts and frozen ponds; a river leaves them toward the lake, under a second plank bridge.',
  '· Lower middle to right: golden farmland, a patchwork of striped fields in wheat, green and brown, with hay stooks and hedge trees.',
  '· Right of centre: a pale green marsh of reeds around a turquoise lake with lily pads; a river runs from the lake to the sea.',
  '· Upper right: a violet land of pale crystal spikes and dark pools; beyond it, in the top right corner, a dark crimson land of black peaks with burning tips, thorn spikes and dead trees.',
  '· Right edge, under those: a jagged black tear in the land with a glowing hot-pink rim, running off the edge of the image.',
  '· Pale dirt roads wind between sixteen bare, flat, oval clearings, each with a darker lip along its lower edge. Keep every road and every clearing, at its place and its size, and keep the clearings EMPTY.',
  '',
  'WHAT IT IS NOT — read this twice. The game draws every landmark, every place marker and every name OVER this picture, on the sixteen clearings, and they change as the player travels: a place is hidden under cloud, then opens, then is marked as cleared. So the clearings stay bare ground, and NOTHING painted anywhere may be a building or a sign: no towns, no houses, no castles, no towers, no temples, no tents, no camps, no windmills, no lighthouses, no ships under sail, no people, no monsters, no flags, no banners, no crosses, no compass rose, no title ribbon, no clouds, no text, no letters, no numbers. A painted town would sit beside the real one and read as a second, wrong place.',
  '· Do not add regions, roads, rivers or clearings the reference does not have, and do not join, move or drop any it has.',
  '· Keep it bright and even: small landmarks and paper name tags sit on every part of it and must stay readable. No region darker or busier than the reference shows it.',
  '',
  'COLOUR — the reference\'s own, region by region. Take the HUES from it, not the flatness.',
  '',
  'THE VIEW — the map convention the reference uses: the ground from straight above, each mountain, tree and hill as a small upright picture on it. No horizon, no perspective, no tilt of the sheet.',
  '',
  STYLE_BACKDROP,
  '',
  'BEFORE YOU CALL IT FINISHED, check:',
  '· The picture reaches all four edges of the image; there is no magenta and no border.',
  '· Laid over the reference, every coast, river, bridge, road and clearing is where the reference has it.',
  '· The sixteen clearings are empty, and there is not one building, figure, symbol or letter anywhere in it.',
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

const pc = (v: number): string => `${Math.round(v * 100)}%`

/**
 * A store cover: the one prompt in the project that keeps its own ground (it
 * IS the floor, the light and the shadow out to its edges) and the one built
 * to sell. Every clause is a property a 250 px tile keeps for a fifth of a
 * second in a grid of forty games (`store-art/README.md` has the evidence).
 */
const coverPrompt = (a: ArtCover): string => {
  const s = a.scene
  const named = s.figures.filter(fig => fig.portrait)
  const dragon = s.id === 'dragon' ? [`· ${VOID_DRAGON}. It fills the middle and top of the picture behind him: the purple shapes in the reference are its head, body and wings.`] : []
  return [
    heading(a.title, a.stem, a.target),
    '',
    'WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED COVER IMAGE FOR A GAME STORE PAGE: A SINGLE DRAMATIC MOMENT, PAINTED EDGE TO EDGE, WITH NO TEXT OF ANY KIND.',
    `One ${shapeWord(a.width, a.height)} image, ${a.width} x ${a.height} pixels (${ratio(a.width, a.height)}).`,
    '',
    'WHAT IT IS NOT: no title, no logo, no lettering, no numbers, no speech bubbles, no buttons, no health bars, no interface, no border, no frame, no watermark. The game\'s name is added later, by the store and by us; painted text would collide with it.',
    '',
    `THE HOOK: ${s.hook}`,
    `WHERE: ${s.where}.`,
    `THE MOMENT: ${s.moment}.`,
    '',
    'WHO IS IN IT — exactly these, nobody else:',
    ...s.figures.map(fig => `· ${fig.says}.`),
    ...dragon,
    '',
    'READ THE ATTACHED IMAGES:',
    ...(s.from ? [`· THE FIRST ATTACHED IMAGE IS THE FINISHED 16:9 COVER OF THIS SAME MOMENT. Paint it again for a ${shapeWord(a.width, a.height)} frame: the same characters, the same moment, the same expressions, light and colours, rearranged to fill this shape as the layout shows. Not a crop of it, not stretched, not a wider view with empty space: every figure is as big in the frame as the layout has it.`] : []),
    `· The finished paintings attached first show what the characters look like and what "painted" means in this game: ${named.map(fig => fig.portrait).join(', ')}${s.refs.some(r => r.includes('mascot')) ? ', and the full-figure hero (the mascot) for his body, clothes and proportions' : ''}. Keep their faces, colours and costumes exactly; give them the pose and expression written above, not the one in the portrait.`,
    '· The LAST image is the layout: a flat stand-in for this cover. Take from it WHERE each figure, effect and prop is and HOW BIG; the round heads with painted faces are where those faces go. Take nothing else from it — it is stiff, evenly lit and has no atmosphere, and fixing that is the job.',
    '',
    'WHAT MAKES IT GET CLICKED — each one is a check, not a mood:',
    '· One subject, enormous: the hero and the action fill at least half the frame. Faces are BIG and the expression reads from across a room.',
    '· The moment is mid-action, full of motion: a body leaning into it, speed lines, things flying outward.',
    `· Maximum contrast where the eye lands: ${s.contrast}. Those two colours meet there and nowhere else.`,
    '· Everything points at the hero\'s face and the action: bodies lean toward it, light falls on it, debris flies away from it.',
    '· Three planes of depth: something large and cropped by the frame in front, the subject crisp in the middle, a simpler, softer background behind.',
    '· A quiet edge and a bright centre: the background is simpler, darker and less saturated toward the corners.',
    `· THE TOP-LEFT CORNER IS COVERED by the store's own badges, from the left edge to ${pc(CG_BANNER.w)} across and ${pc(CG_BANNER.h)} down: nothing important there, only sky, foliage or background.`,
    `· ${s.logo.x < 0.1 ? 'THE LOWER LEFT' : 'THE BOTTOM BAND'}, from ${pc(s.logo.x)} to ${pc(s.logo.x + s.logo.w)} across and from ${pc(s.logo.y)} down to the bottom, is where the game's logo is laid on later: keep it simple and fairly dark (ground, shadow, a tumbling extra at most), no faces there.`,
    '· Nothing important in the outer twentieth on any side: stores crop.',
    '',
    'COLOUR — bright, saturated and warm on the subject; cooler and calmer behind. The characters\' own colours exactly as in their paintings.',
    '',
    'THE VIEW — a dynamic, slightly low camera close to the action, as on a game box: the figures large, three-quarter views, real depth in the scene. (This picture is not seen from straight above like the game.)',
    '',
    STYLE_BACKDROP.split('\n').filter(l => !l.startsWith('· The attached reference is a flat stand-in') && !l.startsWith('AVOID:') && !l.startsWith('· Light and energy')).join('\n'),
    '· Light and energy are bold painted shapes: a white-hot core, the colour, a darker edge. A soft glow around a light source and a little atmosphere in the distance are allowed in this picture, never over the faces.',
    '· This picture HAS its own ground, light and shadows, out to all four edges: cast shadows under the figures, rim light, atmosphere and depth. It is a finished illustration, not a cut-out on a background.',
    'AVOID: realism, pixel art, thin technical line, muddy or grey colour, a busy background that competes with the subject, small faces, any text.',
    '',
    'BEFORE YOU CALL IT FINISHED, check:',
    '· There is not one letter, number or logo anywhere in the picture.',
    `· Shrink it to 250 pixels wide: the hero's face and what is happening still read in a glance.`,
    '· The top-left corner and the lower left hold nothing important.',
    '· Everybody in it is one of the characters listed above, in their own colours.',
    '',
    `OUTPUT: one image, ${a.width} x ${a.height} pixels (${ratio(a.width, a.height)}, ${shapeWord(a.width, a.height)}). If your tool has an aspect-ratio control, set it to ${ratio(a.width, a.height)}. PNG. No labels, captions, numbers or watermarks.`
  ].join('\n')
}

export interface PromptBlock {
  doc: string
  stem: string
  title: string
  text: string
  /** Finish references to attach BEFORE the layout reference (project-relative). */
  styleRefs?: readonly string[]
}

const setPrompt = (s: ArtSet, fits?: Fits): string =>
  s.kind === 'items' ? itemPrompt(s, fits) : s.kind === 'skills' ? skillPrompt(s, fits) : s.kind === 'icons' ? iconPrompt(s, fits) : portraitPrompt(s, fits)

/** One block per reference, in document order. `text` is `# heading`, a blank line, the prompt. */
export const promptBlocks = (fits?: Fits): PromptBlock[] => [
  ...SETS.map(s => ({ doc: s.doc, stem: s.stem, title: s.title, text: setPrompt(s, fits), ...(s.styleRefs?.length ? { styleRefs: s.styleRefs } : {}) })),
  ...SINGLES.map(s => ({ doc: s.doc, stem: s.stem, title: s.title, text: s.kind === 'logo' ? brandPrompt(s, fits) : singlePrompt(s, fits), ...(s.styleRefs?.length ? { styleRefs: s.styleRefs } : {}) })),
  ...SCENERY.map(a => ({ doc: a.doc, stem: a.stem, title: a.title, text: a.plate === 'map' ? mapPrompt(a) : a.plate === 'screen' ? screenPrompt(a) : groundPrompt(a) })),
  ...COVERS.map(a => ({ doc: a.doc, stem: a.stem, title: a.title, text: coverPrompt(a), styleRefs: a.styleRefs }))
]

/** A fence longer than any run of backticks in the body, so a prompt can never close its own block. */
const fenceFor = (body: string): string => {
  let longest = 0
  for (const run of body.match(/`+/g) ?? []) longest = Math.max(longest, run.length)
  return '`'.repeat(Math.max(3, longest + 1))
}

/** `# Title (ref.png → target)` + prompt → a `##` heading OUTSIDE a fenced block. */
const block = (b: PromptBlock): string => {
  const text = b.text
  const cut = text.indexOf('\n')
  const head = (cut < 0 ? text : text.slice(0, cut)).replace(/^#+\s*/, '')
  const bodyText = (cut < 0 ? '' : text.slice(cut + 1)).replace(/^\n+/, '')
  const fence = fenceFor(bodyText)
  // The operator's line, and the Art Desk's: which finished paintings go in
  // BEFORE the layout reference (the model takes its grid from the last image).
  const attach = b.styleRefs?.length ? [`Attach, in this order: ${b.styleRefs.map(f => `\`${f}\``).join(', ')}, then the reference named in the heading.`, ''] : []
  return [`## ${head}`, '', ...attach, `${fence}text`, bodyText, fence].join('\n')
}

const DOC_TITLES: Readonly<Record<string, string>> = {
  'PROMPTS-ITEMS.md': 'Item icons',
  'PROMPTS-SKILLS.md': 'Skill icons',
  'PROMPTS-PORTRAITS.md': 'Portraits',
  'PROMPTS-UI.md': 'UI and textures',
  'PROMPTS-ICONS.md': 'UI icons, statuses, class emblems and marks',
  'PROMPTS-COVERS.md': 'Store covers'
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
  '',
  'A block with an "Attach, in this order" line goes out with finished paintings',
  'as well: attach those FIRST and the reference LAST (the model takes the grid',
  'from the last image). `pnpm art:desk` does this by itself.',
  ''
]

/** The prompt documents, by file name. Both routes (bench, `pnpm art:prompts`) render exactly this. */
export const promptDocs = (fits?: Fits): Record<string, string> => {
  const out: Record<string, string> = {}
  const blocks = promptBlocks(fits)
  for (const name of Object.keys(DOC_TITLES)) {
    const mine = blocks.filter(b => b.doc === name)
    if (!mine.length) continue
    out[name] = [...docIntro(name), ...mine.flatMap(b => [block(b), ''])].join('\n')
  }
  return out
}
