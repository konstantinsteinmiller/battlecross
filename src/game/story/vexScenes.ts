import type { Beat } from './vexScene'
import { VEX_BOSS_KEY } from './vexScene'
import { WEAPONS } from '../data/weapons'
import { hubStage } from './hubSceneUi'

/**
 * ─── The voiced story scenes, as beats (#117) ────────────────────────────────
 *
 * Every Dr. Vex line has a moment (the scene spec in the #117 decision doc,
 * S1–S14). The runner and the bubble are `vexScene.ts` / `SceneBubble.vue`;
 * the triggers live where the moment happens (`sim/mission.ts`, the hub,
 * the ending). Lines are voice catalog keys = i18n keys.
 */

/** S2: the Master's presentation as the boss lands (done before its first attack). */
export const presentBeats = (bossId: string): Beat[] => [
  { vex: `vex.present.${VEX_BOSS_KEY[bossId]}`, params: { boss: `boss.${bossId}` } }
]

/** S3: Atlas on a Master's first clear, in place of "Master freed!", then the weapon it copied. */
const FREED: Readonly<Record<string, string | null>> = {
  scrapper: 'relayOne', blazeMaster: null, frostMaster: 'dataCore', voltMaster: 'voltFreed', galeMaster: 'galeFreed',
  magnetMaster: 'magnetFreed', drillMaster: 'drillFreed', tideMaster: 'tideFreed', neonMaster: 'neonFreed', rotorMaster: 'rotorFreed'
}
export const copiedWeapon = (bossId: string): string | null =>
  Object.values(WEAPONS).find(w => w.from === bossId)?.id ?? null
export const freedBeats = (bossId: string): Beat[] => {
  const freed = FREED[bossId]
  const weapon = copiedWeapon(bossId)
  return [
    ...(freed ? [{ atlas: `atlas.story.${freed}`, gap: 0.6 }] : []),
    ...(weapon ? [{ atlas: `atlas.story.copied.${weapon}` }] : [])
  ]
}

/** S4: Vex on the lab's screens after a win (Frost, Gale and Rotor have their own scenes). */
export const hubBeats = (bossId: string): Beat[] => {
  const laugh = bossId === 'scrapper' ? { laugh: 'short' as const } : {}
  return [{ vex: `vex.hub.${VEX_BOSS_KEY[bossId]}`, ...laugh }]
}

/** S5: the blueprint, after Frost: Atlas reads its own first draft, Vex preens. */
export const blueprintBeats = (): Beat[] => [
  { wait: 1.2 },
  { call: hubStage('freeze') },
  { atlas: 'atlas.story.firstDraft', gap: 0.6 },
  { atlas: 'atlas.story.body', gap: 0.5 },
  { vex: 'vex.hub.blueprint', laugh: 'medium', gap: 0.8 }
]

/** S6: the reserve, after Gale: the shield holds, five more Masters wake. */
export const reserveBeats = (): Beat[] => [
  { call: hubStage('beams'), gap: 1.5 },
  { call: hubStage('red'), gap: 0.3 },
  { vex: 'vex.hub.gale', laugh: 'medium', gap: 0.5 }
]

/** S7: the breach, after Rotor: ten relays fire, the shield shatters. */
export const breachBeats = (): Beat[] => [
  { call: hubStage('fire') },
  { vex: 'vex.hub.rotor', gap: 0.3 },
  { call: hubStage('crack') },
  { vex: 'vex.hub.breach' },
  { call: hubStage('shatter'), gap: 0.6 },
  { atlas: 'atlas.story.breach', gap: 0.8 }
]

/** Which hub scene a newly freed Master brings, and its seen flag. */
export const hubSceneFor = (bossId: string): { id: 'broadcast' | 'blueprint' | 'reserve' | 'breach'; seen: string; beats: Beat[] } | null => {
  if (!VEX_BOSS_KEY[bossId]) return null
  if (bossId === 'frostMaster') return { id: 'blueprint', seen: 'blueprint', beats: blueprintBeats() }
  if (bossId === 'galeMaster') return { id: 'reserve', seen: 'reserve', beats: reserveBeats() }
  if (bossId === 'rotorMaster') return { id: 'breach', seen: 'breach', beats: breachBeats() }
  return { id: 'broadcast', seen: `vex:${bossId}`, beats: hubBeats(bossId) }
}

/** S8: the Volt Tower hack, in place of the story briefing. */
export const voltHackBeats = (arc: number, onHack: () => void, onFail: () => void): Beat[] => [
  { atlas: 'atlas.story.volt', gap: 0.5 },
  { atlas: 'atlas.volt.hack' },
  { call: onHack },
  { vex: 'vex.volt.hack', gap: 0.3 },
  { vex: 'vex.volt.fail' },
  { call: onFail, gap: 0.6 },
  { atlas: 'atlas.volt.thanks', gap: 1.2 },
  ...(arc >= 1 && arc <= 10 ? [{ atlas: `atlas.arc.${arc}` }] : [])
]

/** S9: Vex welcomes Flux to the Fortress (then the usual briefing). */
export const fortressBeats = (): Beat[] => [
  { vex: 'vex.fortress.welcome', laugh: 'maniacal', gap: 0.6 }
]

/** S10: the Mk-I lands (its entrance held while it speaks). */
export const mk1IntroBeats = (): Beat[] => [
  { wait: 0.8 },
  { vex: 'vex.mk1.intro', gap: 0.3 },
  { atlas: 'atlas.mk1.intro' }
]
/** How much longer the Mk-I's first entrance runs for S10 (s). */
export const MK1_INTRO_HOLD = 3

/** S11: the element of an Mk-I attack, for Atlas's call-out (first of each per fight). */
export const MK1_CALL: Readonly<Record<string, 'fire' | 'ice' | 'volt' | 'wind' | 'scrap'>> = {
  flameBurst: 'fire', fireWave: 'fire', iceVolley: 'ice', orbStorm: 'volt', voltRing: 'volt', dive: 'wind', lobBarrage: 'scrap'
}

/** S12: phase 2, the relays hold: the Masters will not obey. */
export const mk1SignalBeats = (): Beat[] => [
  { vex: 'vex.mk1.obey', gap: 0.2 },
  { vex: 'vex.mk1.listen', gap: 0.3 },
  { atlas: 'atlas.mk1.free' }
]
/** How much longer the phase-2 roar runs for S12 (s). */
export const MK1_SIGNAL_HOLD = 4

/** S13: the Mk-I falls. */
export const mk1DefeatBeats = (): Beat[] => [
  { wait: 0.3 },
  { vex: 'vex.mk1.defeat' }
]

/** S14: the sting, when the player starts New Game+. */
export const stingBeats = (): Beat[] => [
  { wait: 0.6 },
  { vex: 'vex.sting.doctorIn', gap: 1.2 }
]
