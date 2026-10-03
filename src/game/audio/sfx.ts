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
  | 'swing' | 'swingHeavy' | 'shoot' | 'cast'
  // Impacts
  | 'hit' | 'hitHeavy' | 'crit' | 'block' | 'dodge' | 'hurt'
  // Elements and schools
  | 'fire' | 'ice' | 'holy' | 'shadow' | 'poison' | 'blood' | 'quake' | 'beam' | 'explode' | 'teleport'
  // Abilities
  | 'summon' | 'heal' | 'shieldUp' | 'roar' | 'telegraph' | 'overheat'
  // Enemies
  | 'alert' | 'bossIntro' | 'death' | 'deathBig'
  // Rewards
  | 'coin' | 'loot' | 'lootRare' | 'lootEpic' | 'lootLegend' | 'chest' | 'levelUp' | 'potion'
  // UI
  | 'denied' | 'uiClick' | 'uiOpen' | 'uiClose' | 'uiEquip' | 'uiBuy' | 'uiLearn' | 'uiPoint' | 'uiChoice' | 'mapMove'

export const SFX_NAMES: readonly SfxName[] = [
  'swing', 'swingHeavy', 'shoot', 'cast', 'hit', 'hitHeavy', 'crit', 'block', 'dodge', 'hurt', 'fire', 'ice', 'holy',
  'shadow', 'poison', 'blood', 'quake', 'beam', 'explode', 'teleport', 'summon', 'heal', 'shieldUp', 'roar', 'telegraph',
  'overheat', 'alert', 'bossIntro', 'death', 'deathBig', 'coin', 'loot', 'lootRare', 'lootEpic', 'lootLegend', 'chest', 'levelUp', 'potion', 'denied', 'uiClick',
  'uiOpen', 'uiClose', 'uiEquip', 'uiBuy', 'uiLearn', 'uiPoint', 'uiChoice', 'mapMove'
]

type Player = (name: SfxName, pan: number, gain: number, muffle: number) => void
let player: Player | null = null

export const setSfxPlayer = (p: Player | null): void => { player = p }

export const sfx = (name: SfxName, pan = 0, gain = 1, muffle = 0): void => {
  player?.(name, Math.max(-1, Math.min(1, pan)), gain, Math.max(0, Math.min(1, muffle)))
}
