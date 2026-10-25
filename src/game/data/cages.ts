import type { ZoneId } from './items'
import type { TownId } from './zones'

/**
 * ─── Cages and captives (roadmap #100, D125–D126) ───────────────────────────
 *
 * Six places hold somebody in a cage: wooden ones in the low places, iron
 * ones further on. The key lies somewhere else in the place, glinting when
 * the hero comes near. Opened, the cage stays open for good, and whoever was
 * in it is found again in a town: a peddler, a herbalist with a favour to
 * ask, farmers with trouble of their own, and three disciples of the secret
 * classes who teach what their masters teach (and spare the hero the
 * master's test, D139/question 57).
 */

export interface CageDef {
  zone: ZoneId
  kind: 'wood' | 'iron'
  /** The world flag freeing them sets (and the npc's `needs`). */
  flag: string
  /** The townsperson they become, and where. */
  npc: string
  town: TownId
  /** How many stand in the cage (the farmers are a family). */
  count: number
  /** Their look in the cage. */
  look: string
  /** A secret class's flag the freeing sets too: the disciple teaches it. */
  found?: string
  /** The afterplay's cage (#164): only in the invaded zone, never in its old self. */
  afterplay?: boolean
  /** More flags the freeing sets (each captive's own rescue). */
  also?: readonly string[]
  /** Each captive's look, when they are not all alike. */
  looks?: readonly string[]
  /** The lead's line when freed (default `dlg.bark.<npc>.freed.1`). */
  line?: string
}

export const CAGES: readonly CageDef[] = [
  { zone: 'plains', kind: 'wood', flag: 'freedPeddler', npc: 'freedPeddler', town: 'sunford', count: 1, look: 'freedPeddler' },
  { zone: 'hollows', kind: 'wood', flag: 'freedHerbalist', npc: 'freedHerbalist', town: 'silverbridge', count: 1, look: 'freedHerbalist' },
  { zone: 'woods', kind: 'wood', flag: 'freedFarmers', npc: 'freedFarmers', town: 'oakhaven', count: 2, look: 'freedFarmers' },
  { zone: 'crags', kind: 'iron', flag: 'freedWindDisciple', npc: 'windDisciple', town: 'oakhaven', count: 1, look: 'windDisciple', found: 'foundWindrunner' },
  { zone: 'tundra', kind: 'iron', flag: 'freedFrostDisciple', npc: 'frostDisciple', town: 'ironhold', count: 1, look: 'frostDisciple', found: 'foundFrostwarden' },
  { zone: 'temple', kind: 'iron', flag: 'freedLightDisciple', npc: 'lightDisciple', town: 'sunford', count: 1, look: 'lightDisciple', found: 'foundLightbringer' },
  // The afterplay (#164): Sunford's teachers, caught on its road when the town burned, held in the
  // invaded Plains and Hollows. Freed (or the zone purged, `data/breaking.ts` RESCUES) they go to the fort.
  { zone: 'plains', kind: 'iron', flag: 'rescuedAegis', also: ['rescuedPyro'], npc: 'trainerAegis', town: 'bastion', count: 2, look: 'trainerAegis', looks: ['trainerAegis', 'trainerPyro'], line: 'dlg.bark.trainerAegis.road.1', afterplay: true },
  { zone: 'hollows', kind: 'iron', flag: 'rescuedShadow', also: ['rescuedGeo'], npc: 'sfShadow', town: 'bastion', count: 2, look: 'sfShadow', looks: ['sfShadow', 'sfGeo'], line: 'dlg.bark.sfShadow.road.1', afterplay: true }
]

/** The zone's cage: its old self's, or in the afterplay its invaded self's (#164). */
export const cageOf = (zone: string, afterplay = false): CageDef | undefined => CAGES.find(c => c.zone === zone && !!c.afterplay === afterplay)
