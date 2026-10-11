import { computed } from 'vue'
import { gameState, getState, removeState, replaceStates } from '@/use/useGameState'
import { flushSaveNow } from '@/use/useSaveStatus'
import { LEVEL_KEY, META_KEY, PROFILE_FIELDS, SAVE_EPOCH_KEY, SAVE_RESUME_KEY, SAVE_SLOTS_KEY, WORLD_KEY, HERO_KEY } from '@/keys'
import { freezeProfile, profileLoaded, saveProfile } from './profile'

/**
 * ─── Manual save slots (pause menu → Save / Load) ───────────────────────────
 *
 * Four slots a player saves the current game into and loads back from, to try
 * out different builds. The game itself keeps saving automatically as before;
 * a slot is a copy of it, taken when the player asks.
 *
 *   • A slot is the game at the moment of saving: the profile (written out
 *     first, so the slot is not an older checkpoint) and the visit being
 *     played, whole — where the hero stands, the enemies left, the chests,
 *     the herbs (`flow.SavedVisit`, `sim/snapshot.ts`). In a zone the
 *     visit's earnings are still the visit's (banked when it ends), so the
 *     two together are exactly the game as it was. Settings, the leaderboard
 *     identity and the slots themselves stay with the player.
 *   • The slots live inside the blob, so they ride the cloud save (the
 *     Wavedash iOS app, CrazyGames, …) like every other field.
 *   • Loading a slot or starting a new game swaps the playthrough in one write,
 *     stamps a new save epoch (so the cloud copy of the replaced game, which
 *     may have MORE progress, does not win the next merge), pushes the save
 *     out, and reloads: every system then boots from the new save, the way it
 *     does on any start, instead of each holding on to the old one.
 */

export const SLOT_COUNT = 4

export interface SlotSave {
  /** When it was saved (ms). */
  savedAt: number
  /** The PROFILE_FIELDS as they were. */
  data: Record<string, unknown>
  /** The visit being played when it was saved (`flow.SavedVisit`); absent:
   *  saved outside a place (it loads into the last town). */
  visit?: unknown
}

/** Who knows the visit being played (`flow.ts` registers itself: this module
 *  cannot import the flow, which imports it). */
let visitProvider: (() => unknown) | null = null
export const setVisitSnapshotProvider = (fn: (() => unknown) | null): void => {
  visitProvider = fn
}

/** The visit a slot was just loaded into, once: the boot builds into it. */
export const takeResumeVisit = (): unknown => {
  const v = getState<unknown>(SAVE_RESUME_KEY)
  if (v === undefined) return null
  removeState(SAVE_RESUME_KEY)
  return v
}

/** What the Save / Load lists show of a slot. */
export interface SlotSummary {
  savedAt: number
  level: number
  /** Where the hero stood (a node id), '' when unknown. */
  place: string
  gender: string
}

const copy = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T

const isSlot = (v: unknown): v is SlotSave =>
  !!v && typeof v === 'object' &&
  typeof (v as SlotSave).savedAt === 'number' &&
  !!(v as SlotSave).data && typeof (v as SlotSave).data === 'object'

/** The four slots as stored (null: empty), always SLOT_COUNT long. */
export const readSlots = (): (SlotSave | null)[] => {
  const raw = getState<unknown>(SAVE_SLOTS_KEY)
  const list = Array.isArray(raw) ? raw : []
  return Array.from({ length: SLOT_COUNT }, (_, i) => (isSlot(list[i]) ? list[i] as SlotSave : null))
}

const summarize = (s: SlotSave): SlotSummary => {
  const level = Number(s.data[LEVEL_KEY])
  const world = s.data[WORLD_KEY] as { at?: unknown } | undefined
  const hero = s.data[HERO_KEY] as { gender?: unknown } | undefined
  return {
    savedAt: s.savedAt,
    level: Number.isFinite(level) && level >= 1 ? Math.round(level) : 1,
    place: typeof world?.at === 'string' ? world.at : '',
    gender: typeof hero?.gender === 'string' ? hero.gender : ''
  }
}

/** Reactive summaries for the menus. */
export const slotSummaries = computed<(SlotSummary | null)[]>(() => {
  void gameState.value
  return readSlots().map(s => (s ? summarize(s) : null))
})

/** Copy the current game into slot `i` (overwrites what is there). */
export const saveToSlot = (i: number, now: number = Date.now()): void => {
  if (i < 0 || i >= SLOT_COUNT) return
  // The profile as it is NOW, not as the last checkpoint wrote it.
  if (profileLoaded()) saveProfile()
  let visit: unknown = null
  try {
    visit = visitProvider?.() ?? null
  } catch (e) {
    console.warn('[save] the visit could not be captured; the slot keeps the profile only', e)
  }
  const data: Record<string, unknown> = {}
  for (const k of PROFILE_FIELDS) {
    const v = getState<unknown>(k)
    if (v !== undefined) data[k] = copy(v)
  }
  const slots = readSlots()
  slots[i] = visit ? { savedAt: now, data, visit } : { savedAt: now, data }
  replaceStates({ [SAVE_SLOTS_KEY]: slots })
  void flushSaveNow()
}

/** How long a load / new game waits for the save to go out before reloading.
 *  The page-hide flush runs again on the reload itself. */
const FLUSH_WAIT_MS = 4_000

/** Push the save out (bounded), then restart the game on it. */
const restart = async (reload: () => void): Promise<void> => {
  await Promise.race([flushSaveNow(), new Promise(resolve => setTimeout(resolve, FLUSH_WAIT_MS))])
  reload()
}

const reloadPage = (): void => window.location.reload()

/** Make slot `i` the game being played, and restart on it. False: empty slot. */
export const loadSlot = async (i: number, reload: () => void = reloadPage, now: number = Date.now()): Promise<boolean> => {
  const slot = readSlots()[i]
  if (!slot) return false
  const patch: Record<string, unknown> = { [SAVE_EPOCH_KEY]: now }
  const absent: string[] = []
  if (slot.visit) patch[SAVE_RESUME_KEY] = copy(slot.visit)
  else absent.push(SAVE_RESUME_KEY)
  for (const k of PROFILE_FIELDS) {
    if (k in slot.data) patch[k] = copy(slot.data[k])
    else absent.push(k)
  }
  // The time between saving and loading is not time away: no rested pool for it.
  const meta = patch[META_KEY]
  if (meta && typeof meta === 'object') (meta as { lastSeen?: number }).lastSeen = now
  freezeProfile()
  replaceStates(patch, absent)
  await restart(reload)
  return true
}

/** Throw away the game being played (the slots stay) and start over. */
export const startNewGame = async (reload: () => void = reloadPage, now: number = Date.now()): Promise<void> => {
  freezeProfile()
  replaceStates({ [SAVE_EPOCH_KEY]: now }, [...PROFILE_FIELDS, SAVE_RESUME_KEY])
  await restart(reload)
}
