import { CAGES } from '../data/cages'
import { SMALLTALK } from '../data/dialogs/smalltalk'
import { SUNFORD_TALK } from '../data/dialogs/sunford'
import { OAKHAVEN_TALK } from '../data/dialogs/oakhaven'
import { IRONHOLD_TALK } from '../data/dialogs/ironhold'
import { SILVERBRIDGE_TALK } from '../data/dialogs/silverbridge'
import { ZONES } from '../data/zones'
import type { ConversationDef } from '../dialog/types'
import { lineIdsOf, preloadVoices } from './speech'
import { VOICE_FILES } from '../assets/overrides'

/**
 * ─── Voices ready before they are spoken (roadmap #211) ──────────────────────
 *
 * A recording is fetched and decoded whole before it plays; fetched only when the line came up, a busy moment made it
 * start late or break up. So the moment a place is on screen the lines it will speak are fetched and decoded in the
 * background, the ones the first seconds need first (the hero's cries, the place's barks, the teachers' calls), then the
 * rest of the place: its townspeople's conversations and overheard talk, a zone's boss and captives.
 *
 * Pure selection (`voiceIdsFor`), so a test holds it to the recordings the game has; the loading is `speech.ts`.
 */

const TOWN_TALK: Readonly<Record<string, readonly ConversationDef[]>> = {
  sunford: SUNFORD_TALK, oakhaven: OAKHAVEN_TALK, ironhold: IRONHOLD_TALK, silverbridge: SILVERBRIDGE_TALK
}

export { lineIdsOf }

/** The bark owners of a place: `dlg.bark.<owner>.…` (the hero's cries are every place's). */
const barkOwners = (node: string): string[] => {
  const owners = new Set<string>(['hero'])
  for (const c of CAGES) if (c.zone === node) { owners.add(c.npc); for (const l of c.looks ?? []) owners.add(l) }
  const zone = (ZONES as Record<string, { finale?: { leader: string } } | undefined>)[node]
  if (zone?.finale) owners.add(zone.finale.leader)
  // The opening level: the camp's teachers, the road's call, the gunslinger's shout.
  if (node === 'plains') for (const o of ['trainerAegis', 'trainerPyro', 'sbMasterSoulwarden', 'sbMasterIronmonk', 'sbMasterAether']) owners.add(o)
  // The Hollows: the storming goblins and gnomes cry at the gate.
  if (node === 'hollows') { owners.add('rebelGoblin'); owners.add('rebelGnome') }
  return [...owners]
}

/**
 * The recordings a place will speak in `lang`, the first seconds' first: `{ soon, rest }` as URLs-bearing ids (only
 * those the language has a file for).
 */
export const voiceIdsFor = (node: string, lang: string, has: (id: string) => boolean): { soon: string[]; rest: string[] } => {
  const soon: string[] = []
  const rest: string[] = []
  const owners = new Set(barkOwners(node))
  const seen = new Set<string>()
  const add = (into: string[], id: string): void => { if (!seen.has(id) && has(id)) { seen.add(id); into.push(id) } }
  // The barks: the place's own, from the VOICE_FILES' names (a bark is `dlg.bark.<owner>.<beat>.1`).
  const prefix = `${lang}/dlg.bark.`
  for (const key of VOICE_FILES.keys()) {
    if (!key.startsWith(prefix)) continue
    const id = key.slice(lang.length + 1)
    // (The girl hero's twin is chosen by `voiceUrl` itself.)
    if (id.endsWith('__f')) continue
    const owner = id.split('.')[2]!
    if (owners.has(owner) || (owner.startsWith('freed') && CAGES.some(c => c.zone === node && c.npc === owner))) add(soon, id)
  }
  // A town: what is overheard in it, then its people.
  const key = node.charAt(0).toUpperCase() + node.slice(1)
  for (const c of SMALLTALK) if (c.id === `smalltalk${key}`) for (const id of lineIdsOf(c)) add(soon, id)
  for (const c of TOWN_TALK[node] ?? []) for (const id of lineIdsOf(c)) add(rest, id)
  return { soon, rest }
}

let run = 0

/** Start fetching and decoding a place's recordings in the background (a new place or language drops the old queue). */
export const preloadPlaceVoices = (node: string, lang: string): void => {
  const me = ++run
  const { soon, rest } = voiceIdsFor(node, lang, id => VOICE_FILES.has(`${lang}/${id}`) || VOICE_FILES.has(`${lang}/${id}__f`))
  void preloadVoices([...soon, ...rest], lang, () => me !== run)
}
