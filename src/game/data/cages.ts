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
}

export const CAGES: readonly CageDef[] = [
  { zone: 'plains', kind: 'wood', flag: 'freedPeddler', npc: 'freedPeddler', town: 'sunford', count: 1, look: 'freedPeddler' },
  { zone: 'hollows', kind: 'wood', flag: 'freedHerbalist', npc: 'freedHerbalist', town: 'silverbridge', count: 1, look: 'freedHerbalist' },
  { zone: 'woods', kind: 'wood', flag: 'freedFarmers', npc: 'freedFarmers', town: 'oakhaven', count: 2, look: 'freedFarmers' },
  { zone: 'crags', kind: 'iron', flag: 'freedWindDisciple', npc: 'windDisciple', town: 'oakhaven', count: 1, look: 'windDisciple', found: 'foundWindrunner' },
  { zone: 'tundra', kind: 'iron', flag: 'freedFrostDisciple', npc: 'frostDisciple', town: 'ironhold', count: 1, look: 'frostDisciple', found: 'foundFrostwarden' },
  { zone: 'temple', kind: 'iron', flag: 'freedLightDisciple', npc: 'lightDisciple', town: 'sunford', count: 1, look: 'lightDisciple', found: 'foundLightbringer' }
]

export const cageOf = (zone: string): CageDef | undefined => CAGES.find(c => c.zone === zone)
