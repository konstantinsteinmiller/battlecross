import type { ClassId } from '../data/skills'

/**
 * ─── What the painted UI icons are ───────────────────────────────────────────
 *
 * The data behind the icon sheets in `artSheet.ts`: one line of WHAT IT IS per
 * icon, in material and shape, and the colour it is painted in. Pure data.
 *
 * Every vector glyph is a one-colour silhouette that takes its colour from
 * wherever it is drawn (`currentColor`). A painting cannot, so each one gets a
 * fixed colour here: the colour the reference is drawn in and the painter is
 * asked for. The few glyphs whose colour carries STATE are not painted at all
 * (`VECTOR_ONLY`).
 */

export interface IconDef {
  /** The vector it replaces: a `GameIcon` name, a glyph id, a mark id. */
  ref: string
  blurb: string
  /** The colour the reference is drawn in, and its name for the prompt. */
  tint: string
  tintName: string
}

/** `GameIcon` glyphs the player sees, most visible first: the HUD and menu
 *  buttons, then the screens' buttons and badges, then the rest. */
export const UI_ICONS: readonly IconDef[] = [
  // The HUD and menu buttons
  { ref: 'pause', tint: '#f4ecd8', tintName: 'cream white', blurb: 'two thick, rounded upright bars side by side, cream-white enamel with a thin gold rim' },
  { ref: 'settings', tint: '#c9d3e4', tintName: 'steel grey', blurb: 'a chunky steel cog wheel with eight square teeth and a round hole in its middle' },
  { ref: 'help', tint: '#f4ecd8', tintName: 'cream white', blurb: 'a round cream-white token with a bold dark-blue question mark on its face' },
  { ref: 'map', tint: '#e8d29a', tintName: 'parchment tan', blurb: 'a folded parchment map seen from the front, three panels folded like a fan, with a green patch of land and a red dotted route on it' },
  { ref: 'hero', tint: '#4a7fd6', tintName: 'blue', blurb: 'a small head-and-shoulders bust of a young adventurer: round head with short brown hair and a blue tunic' },
  { ref: 'book', tint: '#c9483a', tintName: 'red', blurb: 'an open book seen from the front: two cream pages spread wide over a red leather cover' },
  { ref: 'bag', tint: '#8a5f3a', tintName: 'brown', blurb: 'a sturdy brown leather satchel with a rounded flap, a gold buckle and a short carrying handle on top' },
  { ref: 'close', tint: '#f4ecd8', tintName: 'cream white', blurb: 'a thick cross made of two rounded cream-white bars' },
  { ref: 'check', tint: '#5fd068', tintName: 'bright green', blurb: 'a thick, bright green tick mark with rounded ends' },
  { ref: 'lock', tint: '#ffd24a', tintName: 'gold', blurb: 'a gold padlock with a rounded steel shackle and a dark keyhole' },
  { ref: 'plus', tint: '#5fd068', tintName: 'bright green', blurb: 'a thick plus sign with rounded ends, bright green' },
  { ref: 'chest', tint: '#a8733f', tintName: 'wood brown', blurb: 'a small closed wooden treasure chest seen from the front, with gold bands and a gold lock plate' },
  // The screens' buttons
  { ref: 'sound', tint: '#f4ecd8', tintName: 'cream white', blurb: 'a cream-white loudspeaker cone pointing right, with two curved sound arcs in front of it' },
  { ref: 'sound-off', tint: '#f4ecd8', tintName: 'cream white', blurb: 'the same cream-white loudspeaker cone pointing right, with a small red cross in front of it instead of sound arcs' },
  { ref: 'play', tint: '#f4ecd8', tintName: 'cream white', blurb: 'a thick, rounded triangle pointing right, cream-white enamel with a thin gold rim' },
  { ref: 'replay', tint: '#f4ecd8', tintName: 'cream white', blurb: 'a thick circular arrow of cream-white enamel curling almost all the way round, its arrowhead at the top' },
  { ref: 'skip-forward', tint: '#f4ecd8', tintName: 'cream white', blurb: 'a thick triangle pointing right followed by an upright bar, both cream-white enamel' },
  { ref: 'forward', tint: '#f4ecd8', tintName: 'cream white', blurb: 'a thick arrow pointing right, cream-white enamel' },
  { ref: 'back', tint: '#f4ecd8', tintName: 'cream white', blurb: 'a thick arrow pointing left, cream-white enamel' },
  { ref: 'home', tint: '#c9483a', tintName: 'red', blurb: 'a small cottage seen from the front: a red pitched roof over cream walls and a dark wooden door' },
  { ref: 'sword', tint: '#d8dde8', tintName: 'steel', blurb: 'a short steel sword pointing up and to the right, with a gold crossguard and a brown grip' },
  { ref: 'flask', tint: '#ff5a6a', tintName: 'red', blurb: 'a conical glass laboratory flask with a cork, half full of bright red liquid' },
  { ref: 'chat', tint: '#f4ecd8', tintName: 'cream white', blurb: 'a cream-white speech bubble with a short pointed tail at its lower left' },
  { ref: 'skull', tint: '#f4ecd8', tintName: 'bone white', blurb: 'a bone-white cartoon skull seen from the front, with round dark eye holes and a small dark nose' },
  // Badges, pins and the rest
  { ref: 'anvil', tint: '#8a8fa0', tintName: 'dark steel', blurb: 'a dark steel blacksmith\'s anvil seen from the side, with a small gold chevron pointing up above it' },
  { ref: 'gem', tint: '#50aaff', tintName: 'blue', blurb: 'a faceted cut gemstone, bright blue, with flat facets and one white glint' },
  { ref: 'gift', tint: '#c9483a', tintName: 'red', blurb: 'a red gift box seen from the front, tied with a gold ribbon and a gold bow on top' },
  { ref: 'info', tint: '#f4ecd8', tintName: 'cream white', blurb: 'a round cream-white token with a bold dark-blue lowercase letter i on its face' },
  { ref: 'shield', tint: '#4a7fd6', tintName: 'blue', blurb: 'a heater shield seen from the front: a blue face and a gold rim' },
  { ref: 'star', tint: '#ffd24a', tintName: 'gold', blurb: 'a plump five-pointed gold star' },
  { ref: 'coin', tint: '#ffd24a', tintName: 'gold', blurb: 'a thick round gold coin seen flat from the front, with a raised rim' },
  { ref: 'trophy', tint: '#ffd24a', tintName: 'gold', blurb: 'a gold cup trophy with two curled handles on a short dark base' },
  { ref: 'leaderboard', tint: '#ffd24a', tintName: 'gold', blurb: 'three upright blocks of different heights side by side like a winners\' podium: the tallest gold in the middle, silver on the left, bronze on the right' },
  { ref: 'boots', tint: '#8a5f3a', tintName: 'brown', blurb: 'a single brown leather boot seen from the side, its toe pointing right' },
  { ref: 'bolt', tint: '#ffd24a', tintName: 'yellow', blurb: 'a bright yellow lightning bolt' },
  { ref: 'range', tint: '#f4ecd8', tintName: 'cream white', blurb: 'two short upright posts with a double-headed arrow standing upright between them, cream-white' },
  { ref: 'armor', tint: '#c9d3e4', tintName: 'steel', blurb: 'a steel breastplate seen from the front, with rounded shoulders' }
]

/**
 * `GameIcon` glyphs that are NOT painted: their colour is their state. The
 * carets of a select, of a speech bubble's "more" and of a drag hint take the
 * colour of the control they sit on, hovered, pressed or disabled.
 */
export const VECTOR_ONLY: readonly string[] = ['down', 'up', 'right']

/** The status effects, shown round in the hero's frame, in their family colour. */
export const STATUS_BLURBS: Readonly<Record<string, string>> = {
  stun: 'a five-pointed star burst with a white middle, the dizzy star of a knock on the head',
  knockup: 'a thick white arrow pointing up, above a short ground line',
  knockdown: 'a thick white arrow pointing down, below a short line',
  stasis: 'an hourglass with gold end plates, set in the middle of a solid pale disc',
  petrify: 'a chunky grey rock with one crack across it',
  frozen: 'a six-pointed ice crystal with a white middle',
  fear: 'a white cartoon skull seen from the front',
  slow: 'a small snail on a ground line: a domed shell and a green head with two short stalks',
  confuse: 'one thick white spiral',
  taunt: 'a horn-shaped megaphone pointing right, with one curved sound arc in front of it',
  armorShred: 'a steel shield with a jagged crack running down it',
  weaken: 'a thick arrow pointing down',
  vulnerable: 'a round target of three rings',
  burn: 'a flame with a yellow core',
  poison: 'a fat green droplet with one small white bubble in it',
  bleed: 'a fat red droplet with one white glint',
  delayed: 'a white round clock face with two hands',
  haste: 'two thick arrowheads pointing right, one just behind the other',
  attackSpeed: 'a steel dagger pointing up and to the right, with two short speed lines behind it',
  damageUp: 'a steel sword pointing up and to the right, with a small gold arrow pointing up beside it',
  defenseUp: 'a shield with a white arrow pointing up on its face',
  regen: 'a green playing-card heart with a white plus sign on it',
  lifestealUp: 'a red playing-card heart with a white arrow pointing up on it',
  invulnerable: 'a white shield set in the middle of a solid gold disc',
  unkillable: 'a white cartoon skull with one thick bar struck diagonally across it',
  stealth: 'a wide almond-shaped eye with a dark pupil, struck through by one thick diagonal bar',
  reflect: 'a shield with a short arrow bouncing off its upper right corner',
  envenom: 'a steel dagger pointing up and to the right, with one fat green droplet falling from its blade',
  exosuit: 'a six-sided steel armour shell seen from the front, with one wide visor slot across it',
  focus: 'a round target of three rings',
  accelerate: 'a white round clock face with two small fast-forward triangles at its lower right',
  overheat: 'a glass thermometer full of red liquid',
  enrage: 'a round red cartoon face with angry slanted brows and two dot eyes',
  ambush: 'a white cartoon skull seen from the front'
}

/**
 * The class emblems on the skills page: each class's crest, drawn today as its
 * first skill's glyph in the class colour, inside a round disc.
 */
export const CLASS_EMBLEM_BLURBS: Readonly<Record<ClassId, string>> = {
  aegis: 'a crest: a gold-rimmed shield tilted forward with a six-pointed impact burst at its upper right edge',
  shadow: 'a crest: a violet crescent curving to the right, with three short speed lines trailing on its left',
  pyro: 'a crest: a teardrop-shaped ball of flame with a yellow core, flying up and to the right, with three short streaks behind it',
  sovereign: 'a crest: a steel knight\'s helmet with a face opening, topped with a short rounded plume',
  chrono: 'a crest: an hourglass with gold end plates, set in the middle of a solid disc',
  blood: 'a crest: a conical glass laboratory flask with a cork, one third full of red liquid with two small bubbles in it',
  aether: 'a crest: a steel pistol pointing right with a small four-pointed spark at its muzzle',
  geo: 'a crest: one tall sharp rock spike rising from a flat ground line, with a small spike on each side of it'
}

/** The empty-slot markers of the equipment doll: a slot's shape, in pale stone. */
export const SLOT_BLURBS: Readonly<Record<string, string>> = {
  main: 'an empty-slot marker: a sword shape carved in pale grey stone',
  off: 'an empty-slot marker: a shield shape carved in pale grey stone',
  head: 'an empty-slot marker: a helmet shape carved in pale grey stone',
  body: 'an empty-slot marker: a breastplate shape carved in pale grey stone',
  hands: 'an empty-slot marker: a glove shape carved in pale grey stone',
  feet: 'an empty-slot marker: a boot shape carved in pale grey stone',
  trinket: 'an empty-slot marker: a finger ring shape carved in pale grey stone'
}

/** The glyph each empty slot shows today (`GHOST` in `EquipmentPage.vue`). */
export const SLOT_GLYPH: Readonly<Record<string, string>> = {
  main: 'sword', off: 'shield', head: 'helm', body: 'plate', hands: 'gloves', feet: 'boots', trinket: 'ring'
}

/** The marks drawn outside the icon set (`components/icons/marks.ts`). */
export const MARK_ICONS: readonly IconDef[] = [
  { ref: 'potion-health', tint: '#ff5a6a', tintName: 'red', blurb: 'a glossy red playing-card heart' },
  { ref: 'potion-mana', tint: '#5fb8ff', tintName: 'blue', blurb: 'a glossy blue droplet' },
  { ref: 'quest', tint: '#ffd24a', tintName: 'gold', blurb: 'a bold gold exclamation mark: a thick tapering bar above a round dot' },
  { ref: 'cursor', tint: '#f4ecd8', tintName: 'white', blurb: 'a white mouse pointer arrow, tip at the upper left, with a dark outline' }
]
