import type { PlantId } from './plants'

/**
 * ─── Errands: things people ask of the hero (roadmap #85, #86, #89, D101) ────
 *
 * One model for every task with steps: a secret trader's favour, a teacher's
 * test, the treasure map. An errand is started in a conversation, its steps
 * are done one after the other (counted at the end of each visit, or checked
 * against the pouch, the bag and the world as it is), and it is handed in to
 * whoever asked, for its reward. The Journal (the hero's book) lists them.
 *
 * Step kinds:
 *   slay    defeat `n` of `enemy` (in `place`, or anywhere when it is '')
 *   clear   win `place`
 *   visit   go to `place` (a zone or a town)
 *   gather  have `n` of `plant` in the pouch: given over when handed in
 *   bring   have `item` in the bag: given over when handed in
 *   pieces  have found `n` pieces of the treasure map
 *   dig     dig where the map says (a world flag `dug:<place>`)
 *   talk    speak to `npc` about it
 * `gather` and `bring` give something away, so they are only ever the last
 * step (tested): handing in is what takes them.
 */

export type ErrandStepKind = 'slay' | 'clear' | 'visit' | 'gather' | 'bring' | 'pieces' | 'dig' | 'talk'

export interface ErrandStep {
  kind: ErrandStepKind
  /** A map node (zone or town); '' = anywhere. */
  place?: string
  enemy?: string
  plant?: PlantId
  item?: string
  npc?: string
  n: number
}

export interface ErrandReward {
  gold?: number
  /** A share of a level's experience at the hero's level (0.2 = a fifth). */
  xp?: number
  /** World flags it sets (a trader opens shop, a teacher takes a pupil). */
  flags?: readonly string[]
  item?: string
}

export interface ErrandDef {
  id: string
  /** Who it is handed in to (an npc id). */
  giver: string
  steps: readonly ErrandStep[]
  reward: ErrandReward
}

/** Every errand the game has. Content phases add theirs (`errandDefs`). */
export const ERRANDS: ErrandDef[] = [
  // The secret traders of Silverbridge (roadmap #86, D108): a favour each,
  // and their better stock is open to the hero for good.
  {
    id: 'collectorFavor', giver: 'sbCollector',
    steps: [{ kind: 'slay', enemy: 'treant', place: 'woods', n: 6 }, { kind: 'gather', plant: 'moonbell', n: 3 }],
    reward: { gold: 250, xp: 0.3, flags: ['collectorOpen'] }
  },
  // The treasure map (roadmap #89): started by the first piece found; Elder
  // Mara knows the old story. Handed in by itself when the chest is dug up.
  {
    id: 'treasureMap', giver: 'elderMara',
    steps: [{ kind: 'pieces', n: 6 }, { kind: 'dig', place: 'crags', n: 1 }],
    reward: { xp: 0.5 }
  },
  {
    id: 'mirelaFavor', giver: 'sbFence',
    steps: [{ kind: 'slay', enemy: 'bandit', place: 'outskirts', n: 15 }, { kind: 'talk', npc: 'sbJeweler', n: 1 }],
    reward: { gold: 200, xp: 0.3, flags: ['mirelaOpen'] }
  }
]

/** Add errands to the game (each content module calls it once). */
export const errandDefs = (defs: readonly ErrandDef[]): void => {
  for (const d of defs) if (!ERRANDS.some(e => e.id === d.id)) ERRANDS.push(d)
}

export const errandDef = (id: string): ErrandDef | undefined => ERRANDS.find(e => e.id === id)
