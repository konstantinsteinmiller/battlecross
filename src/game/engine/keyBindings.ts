import { reactive, watch } from 'vue'
import { getState, setState } from '@/use/useGameState'
import { saveDataVersion } from '@/use/useSaveStatus'
import { KEY_BINDINGS_KEY } from '@/keys'

/**
 * ─── Key bindings ────────────────────────────────────────────────────────────
 *
 * Every keyboard action is bound to PHYSICAL keys (`KeyboardEvent.code`), so
 * the defaults sit under the same fingers on every layout: the WASD block is
 * ZQSD on AZERTY and ,AOE on Dvorak without any remapping, which is how most
 * PC games handle it. The player can rebind each action's main key in Options
 * → Controls; the other defaults (arrows, Numpad) stay as alternates unless a
 * rebinding takes them.
 *
 * What a key is CALLED on this keyboard is `keyLabels.ts`'s job.
 *
 * Escape (pause), F1 / F2 and the mouse buttons are not rebindable.
 */

export type Action =
  | 'up' | 'down' | 'left' | 'right'
  | 'skill1' | 'skill2' | 'skill3' | 'skill4' | 'skill5' | 'skill6'
  | 'potion' | 'manaPotion' | 'interact' | 'target'
  | 'map' | 'character' | 'inventory' | 'skills'

/** Defaults: the first code is the action's main key, the rest alternates. */
export const DEFAULT_BINDINGS: Readonly<Record<Action, readonly string[]>> = {
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  skill1: ['Digit1', 'Numpad1'],
  skill2: ['Digit2', 'Numpad2'],
  skill3: ['Digit3', 'Numpad3'],
  skill4: ['Digit4', 'Numpad4'],
  skill5: ['Digit5', 'Numpad5'],
  skill6: ['Digit6', 'Numpad6'],
  potion: ['KeyQ', 'Space'],
  manaPotion: ['KeyR'],
  interact: ['KeyE', 'KeyF'],
  target: ['Tab'],
  map: ['KeyM'],
  character: ['KeyC'],
  inventory: ['KeyI'],
  skills: ['KeyK']
}

/** The order the Controls tab lists them in. */
export const ACTIONS = Object.keys(DEFAULT_BINDINGS) as Action[]

/** Keys an action can never take. */
const RESERVED = new Set(['Escape', 'F1', 'F2', 'MetaLeft', 'MetaRight', 'ContextMenu', 'OSLeft', 'OSRight'])
export const isBindable = (code: string): boolean => !!code && !RESERVED.has(code)

/** The player's main-key choices (absent: the default). */
const overrides = reactive<Partial<Record<Action, string>>>({})

const read = (): void => {
  const saved = getState<Partial<Record<Action, string>> | null>(KEY_BINDINGS_KEY, null)
  for (const a of ACTIONS) delete overrides[a]
  if (saved && typeof saved === 'object') {
    for (const a of ACTIONS) {
      const c = saved[a]
      if (typeof c === 'string' && isBindable(c)) overrides[a] = c
    }
  }
  rebuild()
}

/** The main key of an action. */
export const primaryCode = (a: Action): string => overrides[a] ?? DEFAULT_BINDINGS[a][0]!

/** Every key that works an action: its main key, then the default alternates
 *  no other action's main key has taken. */
export const codesFor = (a: Action): string[] => {
  const main = primaryCode(a)
  const out = [main]
  for (const c of DEFAULT_BINDINGS[a].slice(1)) {
    if (c !== main && !ACTIONS.some(o => o !== a && primaryCode(o) === c)) out.push(c)
  }
  return out
}

let byCode = new Map<string, Action>()
const rebuild = (): void => {
  const m = new Map<string, Action>()
  for (const a of ACTIONS) for (const c of codesFor(a)) if (!m.has(c)) m.set(c, a)
  byCode = m
}

/** The action a key works, if any. */
export const actionForCode = (code: string): Action | null => byCode.get(code) ?? null

/**
 * Bind `code` as `a`'s main key. A key that was another action's main key
 * swaps: that action takes `a`'s old one, so nothing is ever left unbound.
 */
export const bindKey = (a: Action, code: string): boolean => {
  if (!isBindable(code)) return false
  const old = primaryCode(a)
  if (old === code) return true
  const other = ACTIONS.find(o => o !== a && primaryCode(o) === code)
  overrides[a] = code
  if (other) overrides[other] = old
  for (const x of [a, other]) {
    if (x && overrides[x] === DEFAULT_BINDINGS[x][0]) delete overrides[x]
  }
  save()
  return true
}

export const resetBindings = (): void => {
  for (const a of ACTIONS) delete overrides[a]
  save()
}

/** Any main key moved from its default? */
export const bindingsChanged = (): boolean => ACTIONS.some(a => overrides[a] !== undefined)

/**
 * The key the HUD should draw where it was written for a DEFAULT key: a
 * prompt made with `KeyE` shows the interact key as bound now. Codes that are
 * no action's default main key come back unchanged.
 */
export const boundCode = (defaultCode: string): string => {
  for (const a of ACTIONS) if (DEFAULT_BINDINGS[a][0] === defaultCode) return primaryCode(a)
  return defaultCode
}

const save = (): void => {
  rebuild()
  setState(KEY_BINDINGS_KEY, { ...overrides })
}

read()
// A cloud save lands after module load on some portals: take its bindings.
watch(saveDataVersion, read)

/** Test seam. */
export const __resetBindingsForTests = (): void => {
  for (const a of ACTIONS) delete overrides[a]
  rebuild()
}
