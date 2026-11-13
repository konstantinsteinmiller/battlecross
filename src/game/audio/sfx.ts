/**
 * SFX entry point. Every gameplay sound goes through `sfx(name, pan, gain)`;
 * the synthesizer behind it lands with the audio chunk. Until then this is a
 * registry the synth plugs into, so call sites are already final.
 *
 * `muffle` (0..1) low-passes the sound (something heard through a wall, or
 * under a menu).
 *
 * A file in `public/audio/sfx/` named after one of these replaces the
 * synthesized version (see `sound-todo.md`).
 */
export type SfxName =
  // Weapons
  | 'swing' | 'swingDagger' | 'swingHeavy' | 'swingBlunt' | 'shoot' | 'shootBow' | 'cast'
  // Impacts
  | 'hit' | 'hitBlunt' | 'hitPierce' | 'hitHeavy' | 'crit' | 'block' | 'dodge' | 'hurt'
  // Elements and schools
  | 'fire' | 'ice' | 'holy' | 'shadow' | 'poison' | 'blood' | 'quake' | 'beam' | 'explode' | 'teleport'
  // A skill's element: its cast and its impact (#101)
  | 'castFire' | 'castIce' | 'castShock' | 'castHoly' | 'castShadow' | 'castPoison' | 'castBlood' | 'castEarth' | 'castWind' | 'castNature' | 'castArcane' | 'castTime' | 'castSpirit' | 'castSong' | 'castTech' | 'castCommand'
  | 'impactFire' | 'impactIce' | 'impactShock' | 'impactWind' | 'impactNature' | 'impactArcane' | 'impactTime' | 'impactSpirit' | 'impactSong' | 'impactTech'
  // Skills with a cast of their own, from the sound review (#118)
  | 'castEarthShift' | 'castBoulder' | 'castFrostShatter' | 'castAvalancheLeap' | 'castAbsoluteZero' | 'castSmokeBomb' | 'castShadowMark' | 'castOrbitalBeam' | 'castSpark'
  // The colosseum's crowd (#117)
  | 'crowdCheer' | 'crowdRoar'
  // Abilities
  | 'summon' | 'heal' | 'shieldUp' | 'roar' | 'telegraph' | 'overheat'
  // Enemies
  | 'alert' | 'bossIntro' | 'death' | 'deathBig'
  // Rewards
  | 'coin' | 'loot' | 'lootRare' | 'lootEpic' | 'lootLegend' | 'chest' | 'levelUp' | 'potion'
  // UI
  // The smithy's anvil: a strike on the glow, a perfect one, and one that misses it
  | 'forgeStrike' | 'forgePerfect' | 'forgeMiss'
  // The gunslinger on the plains (#210): his landing, pistols, turret and shield, the chimera's roar, leaps and claws, his running steps
  | 'cameoLand' | 'cameoShot' | 'cameoTower' | 'cameoTowerOut' | 'cameoShield' | 'cameoRoar' | 'cameoLeap' | 'cameoClaw' | 'cameoStep'
  // …and the chimera fighting back: its breath of fire on the shield, its serpent tail's lash
  | 'cameoBreath' | 'cameoLash'
  | 'denied' | 'uiClick' | 'uiOpen' | 'uiClose' | 'uiEquip' | 'uiBuy' | 'uiLearn' | 'uiPoint' | 'uiChoice' | 'mapMove'

export const SFX_NAMES: readonly SfxName[] = [
  'swing', 'swingDagger', 'swingHeavy', 'swingBlunt', 'shoot', 'shootBow', 'cast', 'hit', 'hitBlunt', 'hitPierce', 'hitHeavy', 'crit', 'block', 'dodge', 'hurt', 'fire', 'ice', 'holy',
  'shadow', 'poison', 'blood', 'quake', 'beam', 'explode', 'teleport',
  'castFire', 'castIce', 'castShock', 'castHoly', 'castShadow', 'castPoison', 'castBlood', 'castEarth', 'castWind', 'castNature', 'castArcane', 'castTime', 'castSpirit', 'castSong', 'castTech', 'castCommand',
  'impactFire', 'impactIce', 'impactShock', 'impactWind', 'impactNature', 'impactArcane', 'impactTime', 'impactSpirit', 'impactSong', 'impactTech',
  'castEarthShift', 'castBoulder', 'castFrostShatter', 'castAvalancheLeap', 'castAbsoluteZero', 'castSmokeBomb', 'castShadowMark', 'castOrbitalBeam', 'castSpark',
  'crowdCheer', 'crowdRoar',
  'summon', 'heal', 'shieldUp', 'roar', 'telegraph',
  'overheat', 'alert', 'bossIntro', 'death', 'deathBig', 'coin', 'loot', 'lootRare', 'lootEpic', 'lootLegend', 'chest', 'levelUp', 'potion', 'denied', 'uiClick',
  'uiOpen', 'uiClose', 'uiEquip', 'uiBuy', 'uiLearn', 'uiPoint', 'uiChoice', 'mapMove',
  'forgeStrike', 'forgePerfect', 'forgeMiss',
  'cameoLand', 'cameoShot', 'cameoTower', 'cameoTowerOut', 'cameoShield', 'cameoRoar', 'cameoLeap', 'cameoClaw', 'cameoStep',
  'cameoBreath', 'cameoLash'
]

type Player = (name: SfxName, pan: number, gain: number, muffle: number) => void
let player: Player | null = null

export const setSfxPlayer = (p: Player | null): void => { player = p }

/** DEV: a listener on every sound the game asks for (the trailer recorder logs them). */
let tap: Player | null = null
export const setSfxTap = (t: Player | null): void => { tap = import.meta.env.DEV ? t : null }

/** A filter on every sound asked for (the intro keeps a film's worth of effects from piling on top of each other, #189). */
let gate: ((name: SfxName) => boolean) | null = null
export const setSfxGate = (g: ((name: SfxName) => boolean) | null): void => { gate = g }

export const sfx = (name: SfxName, pan = 0, gain = 1, muffle = 0): void => {
  if (gate && !gate(name)) return
  if (import.meta.env.DEV) tap?.(name, pan, gain, muffle)
  player?.(name, Math.max(-1, Math.min(1, pan)), gain, Math.max(0, Math.min(1, muffle)))
}
