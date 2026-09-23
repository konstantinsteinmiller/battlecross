/**
 * SFX entry point. Every gameplay sound goes through `sfx(name, pan, gain)`;
 * the chiptune synthesizer behind it lands in the audio chunk. Until then this
 * is a registry the synth plugs into, so call sites are already final.
 */
export type SfxName =
  | 'shoot' | 'charge1' | 'charge2' | 'chargeShot' | 'chargeShotBig' | 'hit' | 'hitHeavy' | 'crit' | 'tink'
  | 'guardBreak' | 'explode' | 'enemyShot' | 'lob' | 'jump' | 'stomp' | 'dash' | 'bonk' | 'punch' | 'alert'
  | 'hurt' | 'block' | 'parry' | 'guardCrack' | 'slide' | 'bolt' | 'heal' | 'energy' | 'door' | 'beamIn'
  | 'beamOut' | 'levelUp' | 'chestOpen' | 'loot' | 'tank' | 'weapon' | 'denied' | 'uiClick' | 'uiOpen'
  | 'objective' | 'bossIntro' | 'death'

type Player = (name: SfxName, pan: number, gain: number) => void
let player: Player | null = null

export const setSfxPlayer = (p: Player | null): void => { player = p }

export const sfx = (name: SfxName | string, pan = 0, gain = 1): void => {
  player?.(name as SfxName, Math.max(-1, Math.min(1, pan)), gain)
}
