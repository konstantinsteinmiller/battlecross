// The sound lab's prompts (roadmap #192): for each sound the game plays (the ids of `tools/sfx-review/manifest.json`, the
// game's `SfxName`s), one sentence a sound designer would brief, and how long the clip runs. 20 variants of each are asked
// of ElevenLabs' sound-effect model (`generate.mjs`), every one with a different "direction" from VARIATIONS, so the 20 are
// 20 different takes of the same job, not 20 copies.

/** What every sound is part of. */
export const STYLE = 'Sound effect for a bright, adventurous cel-shaded fantasy action RPG about building a hero. Punchy, clean, '
  + 'satisfying and exciting, mixed to read over music, one isolated sound with no music, no voices and no background noise.'

const ELEMENT = {
  Fire: 'fire: a hot whoosh and crackle', Ice: 'ice: a cold glassy shimmer and crystalline crack', Shock: 'lightning: a bright electric zap and crackle',
  Holy: 'holy light: a warm angelic chime and radiant swell', Shadow: 'shadow magic: a dark whispering rush', Poison: 'poison: a wet bubbling toxic hiss',
  Blood: 'blood magic: a dark throbbing wet pulse', Earth: 'earth: a heavy grinding stone rumble', Wind: 'wind: a sharp airy slice and rush',
  Nature: 'nature magic: rustling leaves and a growing vine creak', Arcane: 'arcane energy: a rising magical hum with sparkles',
  Time: 'time magic: a ticking clockwork warp', Spirit: 'spirit magic: a ghostly airy wail', Song: 'bardic song magic: a chiming melodic flourish',
  Tech: 'steampunk gadgetry: a mechanical clank, hiss of steam and a spark', Command: 'a regal command: a rallying horn-like call and a shimmer of authority'
}

/** id → [what it is, seconds] */
export const SOUNDS = {
  // Skill casts: the moment a skill starts.
  castFire: ['casting a fire spell: a hot gathering whoosh that ends in a flare', 1.2], castIce: ['casting an ice spell: a glassy shimmer that freezes into a crack', 1.2],
  castShock: ['casting a lightning spell: a charging electric crackle that ends in a zap', 1.1], castHoly: ['casting a holy spell: a bright angelic swell with a chime', 1.3],
  castShadow: ['casting a shadow spell: a dark whispering rush that drops away', 1.2], castPoison: ['casting a poison spell: a bubbling, hissing toxic gather', 1.2],
  castBlood: ['casting a blood spell: a dark wet throb and a sinister rise', 1.2], castEarth: ['casting an earth spell: a heavy stone grind and rumble', 1.2],
  castWind: ['casting a wind spell: a quick sharp rush of air with a whistle', 1.0], castNature: ['casting a nature spell: rustling leaves and a creaking vine unfurling', 1.2],
  castArcane: ['casting an arcane spell: a rising magical hum with sparkling overtones', 1.2], castTime: ['casting a time spell: a ticking clockwork whir that warps', 1.2],
  castSpirit: ['casting a spirit spell: a ghostly airy wail that fades', 1.3], castSong: ['casting a bardic song spell: a short magical melodic flourish with a chime', 1.2],
  castTech: ['casting a gadget skill: a mechanical clank, steam hiss and spark', 1.1], castCommand: ['a commander rallying: a regal horn-like call and a shimmer', 1.3],
  castEarthShift: ['a big earth-shifting ability: the ground heaving, stone grinding and cracking', 1.6], castBoulder: ['a boulder conjured and hurled: a heavy stone whoosh and thud', 1.3],
  castFrostShatter: ['frost shattering: an ice crystal forming and exploding into shards', 1.4], castAvalancheLeap: ['a heroic leap with an avalanche of snow: a whoosh and a rumbling crash', 1.6],
  castAbsoluteZero: ['absolute zero: a deep freezing drone that snaps to dead silence with a crack', 1.8], castSmokeBomb: ['a smoke bomb: a pop and a soft billowing hiss', 1.0],
  castShadowMark: ['marking an enemy with shadow: a quick dark stamp with a whisper', 0.9], castOrbitalBeam: ['an orbital beam calling down: a rising charge then a huge energy beam', 2.0],
  castSpark: ['a small electric spark spell: a quick bright zap', 0.6],
  // Skill impacts: when a skill lands.
  holy: ['a holy skill landing: a radiant burst with a bell-like chime', 0.9], shadow: ['a shadow skill landing: a dark thud with a whispering wash', 0.9],
  poison: ['a poison skill landing: a wet splat and a hiss', 0.9], blood: ['a blood skill landing: a heavy wet impact with a dark pulse', 0.9],
  quake: ['an earth impact: a deep ground-shaking boom and falling rubble', 1.3], impactFire: ['a fire skill landing: a fiery explosion burst', 1.0],
  impactIce: ['an ice skill landing: glass shattering into shards', 0.9], impactShock: ['a lightning skill landing: a sharp thunderclap with electric crackle', 1.0],
  impactWind: ['a wind skill landing: a sharp gust slicing past', 0.8], impactNature: ['a nature skill landing: a thick leafy thump with a splintering twig', 0.9],
  impactArcane: ['an arcane skill landing: a magical burst with sparkling shimmer', 0.9], impactTime: ['a time skill landing: a clockwork clunk with a warping echo', 0.9],
  impactSpirit: ['a spirit skill landing: a ghostly whoosh and soft burst', 0.9], impactSong: ['a song skill landing: a bright chiming burst', 0.9],
  impactTech: ['a gadget skill landing: a metallic crunch and an electric pop', 0.9],
  // Weapons
  swing: ['a sword swing: a quick clean blade whoosh', 0.5], swingDagger: ['a dagger swing: a very fast light slicing whisper', 0.35],
  swingHeavy: ['a heavy two-handed weapon swing: a low powerful whoosh', 0.7], swingBlunt: ['a hammer or club swing: a heavy whoosh', 0.6],
  shoot: ['firing a magic bolt: a quick bright energy zip', 0.5], shootBow: ['shooting a bow: a bowstring twang and an arrow whistling away', 0.6],
  cast: ['a generic magic cast: a short magical gather and release', 0.8],
  // Hits
  hit: ['a sword hitting an enemy: a crisp slash impact', 0.4], hitBlunt: ['a club or hammer hitting an enemy: a heavy meaty thud', 0.5],
  hitPierce: ['an arrow or spear hitting an enemy: a sharp pierce thunk', 0.4], hitHeavy: ['a very heavy hit on an enemy: a bone-rattling crunch and boom', 0.7],
  crit: ['a critical hit: a satisfying heavy impact with a bright ringing sting', 0.8], block: ['blocking a blow with a shield: a solid metallic clang', 0.5],
  dodge: ['dodging an attack: a quick airy whoosh of evasion', 0.4], hurt: ['the hero being hurt: a dull impact with a short pained thud, no voice', 0.5],
  fire: ['a fire element tick on a target: a short burning flare', 0.5], ice: ['an ice element tick on a target: a quick icy crackle', 0.5],
  // Abilities
  beam: ['a sustained energy beam: a humming beam with a crackling core', 1.6], explode: ['an explosion: a big powerful boom with a fiery blast and debris', 1.5],
  teleport: ['teleporting: a quick magical blink, a whoosh into a pop', 0.8], summon: ['summoning an ally: a magical swirl that ends with a bright appearance chime', 1.2],
  heal: ['healing: a soft warm sparkling chime that rises', 1.2], shieldUp: ['a magical shield rising: a bright solid shimmer and a ring', 0.9],
  overheat: ['a weapon overheating: a rising hiss of steam and a warning alarm tone', 1.2],
  // Enemies
  roar: ['a monster roaring: a big guttural beast roar', 1.6], telegraph: ['an enemy attack warning: a short tense rising warning tone', 0.8],
  alert: ['enemies noticing the hero: a short sharp alert sting', 0.6], bossIntro: ['a boss appearing: a massive dramatic low boom with a rising menacing growl', 3.0],
  death: ['an enemy dying: a short poof of magic and a soft collapse', 0.9], deathBig: ['a big enemy dying: a heavy collapse with a long rumbling fade and a magical burst', 2.0],
  // Rewards
  coin: ['picking up a gold coin: a bright metallic coin chink', 0.5], loot: ['picking up loot: a pleasant rustle and a small chime', 0.8],
  lootRare: ['finding a rare item: a bright magical chime sparkle', 1.2], lootEpic: ['finding an epic item: a triumphant shimmering chime with a magical swell', 1.6],
  lootLegend: ['finding a legendary item: a glorious fanfare-like shimmer with a choir-like swell, very exciting', 2.4], chest: ['opening a treasure chest: a creaking lid, a clasp click and a sparkle', 1.4],
  levelUp: ['the hero levelling up: a triumphant rising magical fanfare with sparkles', 2.2], potion: ['drinking a potion: a short gulp-like glug and a soft magical chime', 0.9],
  // Crowd
  crowdCheer: ['an arena crowd cheering: a roaring cheering crowd swell', 2.5], crowdRoar: ['an arena crowd roaring: a thunderous excited crowd roar', 2.5],
  // UI
  denied: ['a refused action: a short low dull error blip', 0.4], uiClick: ['a game menu button click: a crisp satisfying pop-click', 0.25],
  uiOpen: ['opening a menu window: a quick soft airy swoosh up with a small chime', 0.5], uiClose: ['closing a menu window: a quick soft swoosh down', 0.4],
  uiEquip: ['equipping an item: a short metallic clip and a rustle', 0.6], uiBuy: ['buying an item: a coin-register-like chime with a coin chink', 0.7],
  uiLearn: ['learning a new skill: a bright magical rising chime', 0.9], uiPoint: ['spending an attribute point: a short bright tick-chime', 0.5],
  uiChoice: ['confirming a choice: a warm positive blip-chime', 0.5], mapMove: ['moving a marker across a world map: a soft parchment shuffle and a footstep', 0.8]
}

/** The element a cast/impact id belongs to, for the prompt (castFire → fire). */
const elementOf = (id) => {
  const m = /^(?:cast|impact)([A-Z][a-z]+)$/.exec(id)
  return m ? ELEMENT[m[1]] ?? null : null
}

/** What makes take N different from take M: a direction for the sound designer. 20 of them. */
export const VARIATIONS = [
  'as a clean, polished, modern take',
  'with more weight and a deeper low end',
  'brighter and sparklier, with more high-frequency shimmer',
  'tighter and snappier, with a very fast attack',
  'bigger and more cinematic, with a wide tail',
  'more stylised and cartoonish, playful and punchy',
  'more organic and natural, with a realistic texture',
  'with a magical sparkle tail',
  'grittier and more aggressive',
  'smoother and softer, more elegant',
  'with a layered, rich, multi-part texture',
  'dry and close, with no reverb',
  'with a touch of echoing reverb, epic',
  'higher in pitch, lighter and faster',
  'lower in pitch, heavier and slower',
  'with a rhythmic double hit',
  'with a rising pitch that feels rewarding',
  'with a satisfying punchy transient and quick decay',
  'mystical and otherworldly',
  'exciting and energetic, with a heroic feel'
]

/** The text asked of the model for take `n` (0-based) of `id` in round `round` (a reroll uses other directions). */
export const promptFor = (id, n, round = 0) => {
  const s = SOUNDS[id]
  if (!s) throw new Error(`no prompt for sound "${id}"`)
  const el = elementOf(id)
  const dir = VARIATIONS[(n + round * 7) % VARIATIONS.length]
  return `${s[0]}${el ? ` (${el})` : ''}, ${dir}. ${STYLE}`
}
/** The model's shortest clip is half a second (a click is trimmed in the lab, not asked shorter). */
export const secondsFor = (id) => Math.max(0.5, SOUNDS[id][1])
