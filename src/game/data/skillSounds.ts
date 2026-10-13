import type { SfxName } from '../audio/sfx'
import { SKILLS, type SkillDef } from './skills'

/**
 * ─── What each skill sounds like (roadmap #101, D127) ───────────────────────
 *
 * Every active skill belongs to an element, and an element has two sounds:
 * the CAST (the gathering, as the skill begins: a fireball's roar, frost
 * crystallising, a bowstring of wind) and the IMPACT (what it does when it
 * lands: the fireball's explosion, ice shattering, the crack of a spark). The
 * sounds are layered syntheses (`audio/synth.ts`); a recorded file named after
 * one replaces it.
 */

export type SoundElement =
  | 'physical' | 'fire' | 'ice' | 'shock' | 'holy' | 'shadow' | 'poison' | 'blood' | 'earth' | 'wind' | 'nature'
  | 'arcane' | 'time' | 'spirit' | 'song' | 'tech' | 'command'

/** A class's element, where its skills share one. */
const CLASS_ELEMENT: Readonly<Record<string, SoundElement>> = {
  pyro: 'fire', aether: 'tech', chrono: 'time', aegis: 'holy', blood: 'blood', geo: 'earth', shadow: 'physical', sovereign: 'command',
  windrunner: 'wind', frostwarden: 'ice', lightbringer: 'holy', beastcaller: 'nature', elementalist: 'arcane', soulwarden: 'spirit',
  ironmonk: 'physical', bard: 'song'
}

/** The skills that are not their class's element. */
const SKILL_ELEMENT: Readonly<Record<string, SoundElement>> = {
  // Aether: a gun, a heat vent, grenades and coils.
  aetherPistol: 'tech', ventHeat: 'fire', shockGrenade: 'shock', arcCoil: 'shock', orbitalBeam: 'shock',
  // Aegis: the shield's own blows, and the war cry.
  shieldSlam: 'physical', shieldThrow: 'physical', shieldShove: 'physical', tauntingCry: 'command',
  // Blood: the flasks are brews.
  sanguineFlask: 'poison', enfeeblingTonic: 'poison',
  // Shadow: steel, and what hides in the dark.
  shadowstep: 'shadow', smokeBomb: 'shadow', shadowMark: 'shadow', venomousBlade: 'poison', nightshadeMist: 'poison',
  // The elementalist: one of each.
  frostLance: 'ice', chainSpark: 'shock', rollingBoulder: 'earth', thunderSnow: 'shock', frostfireComet: 'fire',
  // The monk's mountain palm shakes the ground.
  mountainPalm: 'earth',
  // The bear and the wolves call with the wild; the hawk with the wind.
  callHawk: 'wind'
}

export const skillElement = (def: Pick<SkillDef, 'id' | 'cls' | 'fire'>): SoundElement =>
  SKILL_ELEMENT[def.id] ?? (def.fire ? 'fire' : CLASS_ELEMENT[def.cls] ?? 'physical')

/** The cast of each element. */
export const CAST_SOUND: Readonly<Record<SoundElement, SfxName>> = {
  physical: 'swingHeavy', fire: 'castFire', ice: 'castIce', shock: 'castShock', holy: 'castHoly', shadow: 'castShadow',
  poison: 'castPoison', blood: 'castBlood', earth: 'castEarth', wind: 'castWind', nature: 'castNature', arcane: 'castArcane',
  time: 'castTime', spirit: 'castSpirit', song: 'castSong', tech: 'castTech', command: 'castCommand'
}

/**
 * The skills whose cast is their own, not their element's (the sound review,
 * #118): the owner heard the element's cast as wrong for these. The rest of
 * each element keeps its shared cast (Stone Spike and Tectonic Rupture the
 * earth's, Frost Armor and Frost Cleave the frost's, Shadowstep the shadow's,
 * Shock Grenade the shock's).
 */
export const SKILL_CAST: Readonly<Record<string, SfxName>> = {
  // The ground reshaped (walls, shells, sinkholes, stone skin, the shaking palm).
  earthBarrier: 'castEarthShift', seismicShock: 'castEarthShift', sinkhole: 'castEarthShift', petrify: 'castEarthShift', geodeShell: 'castEarthShift', mountainPalm: 'castEarthShift',
  // A boulder that rolls.
  boulderRoll: 'castBoulder', rollingBoulder: 'castBoulder',
  frostShatter: 'castFrostShatter', avalancheLeap: 'castAvalancheLeap', absoluteZero: 'castAbsoluteZero',
  smokeBomb: 'castSmokeBomb', shadowMark: 'castShadowMark',
  orbitalBeam: 'castOrbitalBeam', arcCoil: 'castSpark', chainSpark: 'castSpark', thunderSnow: 'castSpark'
}

/** The sound a skill's cast makes: its own, else its element's. */
export const castSoundOf = (def: Pick<SkillDef, 'id' | 'cls' | 'fire'>): SfxName =>
  SKILL_CAST[def.id] ?? CAST_SOUND[skillElement(def)]

/** What lands. */
export const IMPACT_SOUND: Readonly<Record<SoundElement, SfxName>> = {
  physical: 'hitHeavy', fire: 'impactFire', ice: 'impactIce', shock: 'impactShock', holy: 'holy', shadow: 'shadow',
  poison: 'poison', blood: 'blood', earth: 'quake', wind: 'impactWind', nature: 'impactNature', arcane: 'impactArcane',
  time: 'impactTime', spirit: 'impactSpirit', song: 'impactSong', tech: 'impactTech', command: 'hitHeavy'
}

/** Every active skill's element (the tests read it). */
export const ACTIVE_ELEMENTS = (): Array<{ id: string; element: SoundElement }> =>
  SKILLS.filter(s => s.kind === 'active').map(s => ({ id: s.id, element: skillElement(s) }))
