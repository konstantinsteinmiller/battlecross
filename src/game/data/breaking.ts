import type { ZoneId } from './items'
import type { QuestDef } from './quests'

/**
 * ─── The Breaking: the afterplay's story, beats B0–B10 (docs/gdd-afterplay.md §1, §7) ──
 *
 * The Void Lord is dead and the rift is open. Every step of the chain is a
 * world flag in the save (`world.flags`), so the towns' `needs` / `not` lists
 * and the conversations' conditions read the story the way they read every
 * other turn of the world:
 *
 *   brk0  B0  the rift screamed (told on the map after the Rift is won)
 *   brk1  B1  Scout Wren found the hero: Bastion Crossing is on the map
 *   brk2  B2  the hero reached the fort: its services are open
 *   brk3  B3  the road is clear (Plains and Hollows purged): Sunford's people are safe
 *   brk4  B4  the Wildwood purged at level 34: the herbalist joins the fort
 *   brk5  B5  the Outskirts purged at level 38: the centaurs are broken, the siege is next
 *   brk6  B6  Crags and Mines purged at 42: the Forgemaster has his forge back (Infernal smithing)
 *   brk7  B7  Tundra and Temple purged at 46: the Sphinx is dead, the Oracle's Lens is the hero's
 *   brk8  B8  the Citadel purged at 50: the Leviathan is dead, its Scale walks on water
 *   brk9  B9  the Fortress purged at 54: the Hydra is dead, its fire key opens the Rift's heart
 *   brk10 B10 Peak and Rift purged at 57: the Elder Dragon is dead; the hero seals the rift, or
 *             keeps it ajar (`riftSealed` / `riftAjar`, the one new decision)
 *
 * Each of B6–B10 is told on the world map once it holds (`mapBeat`): its
 * speaker comes to the hero, as Scout Wren did. The rewards the story names
 * (Infernal smithing, the Lens, the Scale, the key) are world flags here; what
 * they DO comes with the phases that build them (`STORY_REWARDS`).
 *
 * A zone is PURGED when the hero wins it in the afterplay once the fort is
 * found (`purged<Zone>`). The invasion overlay (phase 2) may narrow that to
 * an invaded visit; the story only reads the flag.
 *
 * The three towns the demons took (Sunford, Oakhaven, Ironhold) are OVERRUN
 * — a ruin with nobody in it to trade with — until both zones of their road
 * are purged, then REBUILT: their people come home and the shops stock a tier
 * higher. Silverbridge stays open. Those two states are not stored: they are
 * derived from the purges (`breakingDerived`), so they can never disagree.
 *
 * Pure: no save, no Vue. `state/profile.ts` applies what this decides.
 */

/** The story's steps, in order. */
export const BRK = ['brk0', 'brk1', 'brk2', 'brk3', 'brk4', 'brk5', 'brk6', 'brk7', 'brk8', 'brk9', 'brk10'] as const
export type BreakingFlag = typeof BRK[number]

/** The hero levels B4 and B5 ask for (§1.2). */
export const B4_LEVEL = 34
export const B5_LEVEL = 38
/** And B6–B10's. */
export const B6_LEVEL = 42
export const B7_LEVEL = 46
export const B8_LEVEL = 50
export const B9_LEVEL = 54
export const B10_LEVEL = 57

/** The zones each of B6–B10 asks to be purged. */
export const LATE_BEATS: ReadonlyArray<{ flag: BreakingFlag; zones: readonly ZoneId[]; level: number }> = [
  { flag: 'brk6', zones: ['crags', 'mines'], level: B6_LEVEL },
  { flag: 'brk7', zones: ['tundra', 'temple'], level: B7_LEVEL },
  { flag: 'brk8', zones: ['citadel'], level: B8_LEVEL },
  { flag: 'brk9', zones: ['fortress'], level: B9_LEVEL },
  { flag: 'brk10', zones: ['peak', 'rift'], level: B10_LEVEL }
]

/** What a late step leaves the hero (a world flag; its use is the later phases'). */
export const STORY_REWARDS: Readonly<Partial<Record<BreakingFlag, string>>> = {
  brk6: 'infernalForge',
  brk7: 'oracleLens',
  brk8: 'leviathanScale',
  brk9: 'hydraKey'
}

/** The two ends of the story (B10's decision). */
export const RIFT_SEALED = 'riftSealed'
export const RIFT_AJAR = 'riftAjar'

/**
 * B10's decision, put by the storyteller over the dead dragon: seal the rift
 * for good, or keep it ajar (the colosseum's demon waves, the siege's
 * Nightmare). Not one of the campaign's six quests (no zone's finale brings
 * it, no faction cares): `profile.decideQuest` reads it from here.
 */
export const SEAL_QUEST: QuestDef = {
  id: 'seal', node: 'rift', speaker: 'chronicler',
  choices: [
    { id: 'seal', flags: [RIFT_SEALED], tone: 'noble' },
    { id: 'ajar', flags: [RIFT_AJAR], tone: 'cunning' }
  ]
}
export const STORY_QUESTS: Readonly<Record<string, QuestDef>> = { seal: SEAL_QUEST }

/** The fort's town id (and its map node). */
export const FORT = 'bastion' as const

/** The flag the siege (phase 6) opens on: the story's first siege is due. */
export const SIEGE_DUE = 'siegeDue'

/** How far the chain has come: the number of steps done (0 before B0, 6 after B5). */
export const breakingStep = (flags: ReadonlySet<string>): number => {
  let n = 0
  while (n < BRK.length && flags.has(BRK[n]!)) n++
  return n
}

/** A zone purged in the afterplay. */
export const purgedFlag = (zone: ZoneId): string => 'purged' + zone[0]!.toUpperCase() + zone.slice(1)

/** The towns the demons took, and the two zones of road that free each. */
export const OVERRUN_ROADS: Readonly<Record<'sunford' | 'oakhaven' | 'ironhold', readonly [ZoneId, ZoneId]>> = {
  sunford: ['plains', 'hollows'],
  oakhaven: ['woods', 'outskirts'],
  ironhold: ['crags', 'mines']
}
export type OverrunTown = keyof typeof OVERRUN_ROADS

export const overrunFlag = (town: string): string => `${town}Overrun`
export const rebuiltFlag = (town: string): string => `${town}Rebuilt`

export type TownState = 'normal' | 'overrun' | 'rebuilt'

/** A town as the afterplay leaves it. */
export const townState = (town: string, afterplay: boolean, flags: ReadonlySet<string>): TownState => {
  const road = OVERRUN_ROADS[town as OverrunTown]
  if (!afterplay || !road) return 'normal'
  return road.every(z => flags.has(purgedFlag(z))) ? 'rebuilt' : 'overrun'
}

/**
 * Who is rescued by a purge, and comes to the fort (the flag their place there
 * `needs`). Sunford's teachers are held on its road; its traders and gamblers
 * are freed with the Plains, its healer with the Hollows.
 */
export const RESCUES: Readonly<Partial<Record<ZoneId, readonly string[]>>> = {
  plains: ['rescuedAegis', 'rescuedPyro', 'rescuedTraders'],
  hollows: ['rescuedShadow', 'rescuedGeo', 'rescuedHealer', 'rescuedGamblers'],
  woods: ['rescuedHerbalist']
}

/** The flags derived from the save, never stored: each fallen town's state. */
export const breakingDerived = (afterplay: boolean, flags: ReadonlySet<string>): string[] => {
  if (!afterplay) return []
  const out: string[] = ['afterplay']
  for (const t of Object.keys(OVERRUN_ROADS)) out.push(townState(t, true, flags) === 'rebuilt' ? rebuiltFlag(t) : overrunFlag(t))
  return out
}

/**
 * A beat told on the world map: the rift's scream (B0), the scout (B1), and
 * each late step's speaker (B6–B9: the Forgemaster; the Oracle if she was
 * freed, else the Sunken Priest; the herbalist; the Arch-Demon's ghost if the
 * throne was claimed, else the Syndicate's boss), then B10's decision and its
 * epilogue. `quest.seal` is the decision's conversation.
 */
export type MapBeat = 'story.rift' | 'story.wren' | 'story.forge' | 'story.oracle' | 'story.priest' | 'story.herbs' | 'story.ghost' | 'story.syndicate' | 'quest.seal' | 'story.sealed'
export const mapBeat = (afterplay: boolean, flags: ReadonlySet<string>): MapBeat | null => {
  if (!afterplay) return null
  if (!flags.has('brk0')) return 'story.rift'
  if (!flags.has('brk1')) return 'story.wren'
  if (flags.has('brk6') && !flags.has('told6')) return 'story.forge'
  if (flags.has('brk7') && !flags.has('told7')) return flags.has('oracleFreed') ? 'story.oracle' : 'story.priest'
  if (flags.has('brk8') && !flags.has('told8')) return 'story.herbs'
  if (flags.has('brk9') && !flags.has('told9')) return flags.has('endUnbound') ? 'story.ghost' : 'story.syndicate'
  if (flags.has('brk10') && !flags.has(RIFT_SEALED) && !flags.has(RIFT_AJAR)) return 'quest.seal'
  if (flags.has('brk10') && !flags.has('told10')) return 'story.sealed'
  return null
}

/** The flag a map beat writes as it begins (so it is told once; the decision writes its own: none here). */
export const MAP_BEAT_FLAG: Readonly<Record<MapBeat, string>> = {
  'story.rift': 'brk0', 'story.wren': 'brk1', 'story.forge': 'told6', 'story.oracle': 'told7', 'story.priest': 'told7',
  'story.herbs': 'told8', 'story.ghost': 'told9', 'story.syndicate': 'told9', 'quest.seal': '', 'story.sealed': 'told10'
}

/**
 * A zone won in the afterplay: the flags to add (the purge, whoever it frees,
 * and the story steps that now hold). Nothing before the fort is found: the
 * road is cleared FOR the fort.
 */
export const onZoneWon = (zone: ZoneId, afterplay: boolean, flags: ReadonlySet<string>, level: number): string[] => {
  if (!afterplay || !flags.has('brk1')) return []
  const add: string[] = []
  const has = (f: string): boolean => flags.has(f) || add.includes(f)
  const put = (f: string): void => { if (!has(f)) add.push(f) }
  put(purgedFlag(zone))
  for (const f of RESCUES[zone] ?? []) put(f)
  for (const f of advance(new Set([...flags, ...add]), level)) put(f)
  return add
}

/** The story steps that hold in this world and are not yet written (B3–B5). */
export const advance = (flags: ReadonlySet<string>, level: number): string[] => {
  const add: string[] = []
  const has = (f: string): boolean => flags.has(f) || add.includes(f)
  if (has('brk2') && !has('brk3') && has(purgedFlag('plains')) && has(purgedFlag('hollows'))) add.push('brk3')
  if (has('brk3') && !has('brk4') && has(purgedFlag('woods')) && level >= B4_LEVEL) add.push('brk4')
  if (has('brk4') && !has('brk5') && has(purgedFlag('outskirts')) && level >= B5_LEVEL) add.push('brk5', SIEGE_DUE)
  // B6–B10: each after the one before, its zones purged, at its level.
  for (let i = 0; i < LATE_BEATS.length; i++) {
    const b = LATE_BEATS[i]!
    const before = i === 0 ? 'brk5' : LATE_BEATS[i - 1]!.flag
    if (!has(before) || has(b.flag) || level < b.level || !b.zones.every(z => has(purgedFlag(z)))) continue
    add.push(b.flag)
    const reward = STORY_REWARDS[b.flag]
    if (reward && !has(reward)) add.push(reward)
  }
  return add
}

/** Where the story points next (the scout's word, the map's hint). */
export const nextGoal = (flags: ReadonlySet<string>, level: number): ZoneId | typeof FORT | null => {
  // Steps done: 2 = the scout has spoken (the fort is next), 3 = the fort reached, …
  const s = breakingStep(flags)
  if (s < 2) return null
  if (s === 2) return FORT
  if (s === 3) return !flags.has(purgedFlag('plains')) ? 'plains' : 'hollows'
  if (s === 4) return level >= B4_LEVEL || !flags.has(purgedFlag('woods')) ? 'woods' : null
  if (s === 5) return 'outskirts'
  // B6–B10: the first zone of the next step not purged yet.
  const late = LATE_BEATS[s - 6]
  if (late) return late.zones.find(z => !flags.has(purgedFlag(z))) ?? null
  return null
}

/** A shop in a rebuilt town stocks one tier higher (never past 5: legendaries are found). */
export const rebuiltTiers = (tiers: readonly number[]): number[] => [...new Set(tiers.map(t => Math.min(5, t + 1)))]
