// ─── useSamsungFix (Vue 3) ──────────────────────────────────────────────
//
// Opt-in fix for Samsung Internet's forced website dark mode, which recolours the DOM UI (cream panels go
// brown, dark ink vanishes) and cannot be detected from JS. The counter itself lives in
// `@/utils/forcedDarkCounter`; this file decides WHEN it runs:
//
//   Samsung UA  AND  the player said the two check squares look different (or turned it on in Options).
//
// The choice is a field inside the existing `bcross_state` blob (`SAMSUNG_FIX_KEY`), never its own storage
// key. It is meaningless off Samsung (the UA gate comes first), so a blob synced to another device is harmless.
//
//   choice      'on'       the fix runs
//               'off'      the player switched it off in Options
//               'unneeded' the check squares matched: never ask again (Options can re-run the check)
//               null       not asked yet
//
// Query override for testing on desktop Chrome (works in every build, stores nothing):
//   ?samsungfix=1   run the counter regardless of UA and choice (it WILL visibly recolour a normal browser)
//   ?samsungfix=0   never run it and never ask
//   ?samsungfixgain=1  with ?samsungfix=1: leave the image brightness gains out (screenshot diffs only)
//
// The counter is imported lazily: a normal browser never downloads it.

import { computed, ref, watch } from 'vue'
import { SAMSUNG_FIX_KEY } from '@/keys'
import { getState, removeState, setState } from '@/use/useGameState'
import { saveDataVersion } from '@/use/useSaveStatus'
import { isSamsungUa } from '@/utils/forcedDarkCounter/ua'

export type SamsungFixChoice = 'on' | 'off' | 'unneeded'

const readQuery = (): '1' | '0' | null => {
  try {
    const v = new URLSearchParams(window.location.search).get('samsungfix')
    return v === '1' || v === '0' ? v : null
  } catch {
    return null
  }
}

const readChoice = (): SamsungFixChoice | null => {
  const v = getState<unknown>(SAMSUNG_FIX_KEY)
  return v === 'on' || v === 'off' || v === 'unneeded' ? v : null
}

/** Samsung Internet (the only browser the check is offered in). */
export const isSamsungBrowser: boolean = typeof navigator !== 'undefined' && isSamsungUa(navigator.userAgent)

const query = typeof window !== 'undefined' ? readQuery() : null
const choice = ref<SamsungFixChoice | null>(readChoice())

/** `?samsungfixgain=1` (with `?samsungfix=1`): no image gain, for screenshot diffs on a browser that darkens nothing. */
const testGain = (() => {
  try {
    return new URLSearchParams(window.location.search).get('samsungfixgain') === '1' ? { img: 1, bgImage: 1 } : undefined
  } catch {
    return undefined
  }
})()

// Cloud-only builds fill the blob after this module evaluates: re-read on a hydrate bump (as useUser does).
watch(saveDataVersion, () => { choice.value = readChoice() })

/** The Options toggle and the check are offered here (`?samsungfix=1` shows them on desktop for testing). */
export const samsungFixOffered: boolean = isSamsungBrowser || query === '1'

/** The counter should be running right now. */
export const samsungFixOn = computed<boolean>(() => {
  if (query === '1') return true
  if (query === '0') return false
  return isSamsungBrowser && choice.value === 'on'
})

/** The one-time check card is due: Samsung, never answered, no query override. */
export const samsungCheckDue = computed<boolean>(() => isSamsungBrowser && query === null && choice.value === null)

export const samsungFixChoice = choice

/** Store the player's answer. */
export const setSamsungFixChoice = (next: SamsungFixChoice): void => {
  choice.value = next
  setState(SAMSUNG_FIX_KEY, next)
}

/** Forget the answer so the check card comes back at the next calm moment (Options: "run the check again"). */
export const resetSamsungFixCheck = (): void => {
  choice.value = null
  removeState(SAMSUNG_FIX_KEY)
}

let installed = false

/** Follow `samsungFixOn`: start the counter when it turns on, put everything back when it turns off. */
export const installSamsungFix = (): void => {
  if (installed) return
  installed = true
  watch(samsungFixOn, async (on) => {
    const counter = await import('@/utils/forcedDarkCounter')
    if (on) {
      try {
        await counter.startCounter(document.body, { gain: testGain })
      } catch (err) {
        console.warn('[samsung-fix] could not start', err)
      }
    } else {
      counter.stopCounter()
    }
  }, { immediate: true })
}
