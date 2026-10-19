<script setup lang="ts">
// ─── SamsungColorCheck ──────────────────────────────────────────────────
//
// The one-time question that switches on the Samsung dark-mode colour fix
// (`useSamsungFix`). Samsung Internet's forced website dark mode recolours the
// DOM UI and is invisible to JS, so the player is the detector: two squares of
// the same ink colour on a cream bar, the left drawn on a <canvas> (never
// recoloured), the right a plain CSS box (recoloured when forced dark is on).
// "They look different" turns the fix on; "They match" stores "not needed" and
// the card never comes back (Options can re-run it).
//
// Samsung Internet only (the UA gate is `samsungCheckDue`), and only at a calm
// moment: on the map or in a town, nothing else open, after the first run, a
// couple of seconds after the last thing closed. Never during the first fight
// (the tutorial), never over a conversation, a modal, an ad or the dark-mode
// notice. It holds the game like any blocking window while it is up.
//
// Built like ForcedDarkModeModal, not on the parchment FModal shell: while forced
// dark is on, a cream page with ink text is exactly what gets recoloured into
// something unreadable, so the card is solid dark with light text. The squares'
// bar carries `data-bc-raw` so the counter, when it is already running (a re-run
// from Options), leaves the test untouched.

import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { samsungCheckDue, setSamsungFixChoice } from '@/use/useSamsungFix'
import { isForcedDarkBlocking } from '@/use/useForcedDarkModeGuard'
import { acquireModalOpen, isAnyModalOpen } from '@/use/useModalState'
import { isAdShowing } from '@/use/useGamePause'

const { t } = useI18n()

/** Ink on cream: both are ordinary game colours (--bc-ink, a parchment tone). */
const INK = '#1b1626'
const CREAM = '#f3e7c9'
/** Quiet time before the card appears once the game is calm. */
const CALM_MS = 2500

// The game's own state, imported lazily so this always-mounted component does not pull the game chunk in at boot.
const flowRef = shallowRef<null | { screen: string; loading: boolean; modal: string; talk: string; encounter: unknown }>(null)
const runsRef = shallowRef<null | { stats: { runs: number } }>(null)
const loadGame = async (): Promise<void> => {
  if (flowRef.value) return
  const [flow, profile] = await Promise.all([import('@/game/flow'), import('@/game/state/profile')])
  flowRef.value = flow.flow
  runsRef.value = profile.profile
}

const calm = computed(() => {
  const f = flowRef.value
  const p = runsRef.value
  if (!f || !p) return false
  return (
    (f.screen === 'map' || f.screen === 'town') &&
    !f.loading &&
    f.modal === '' &&
    f.talk === '' &&
    !f.encounter &&
    p.stats.runs >= 1 &&
    !isAnyModalOpen.value &&
    !isForcedDarkBlocking.value &&
    !isAdShowing.value
  )
})

const open = ref(false)
let timer = 0
watch([calm, samsungCheckDue], ([isCalm, due]) => {
  window.clearTimeout(timer)
  if (due) void loadGame()
  if (!due) {
    open.value = false
    return
  }
  if (!isCalm) return // an open card stays open: the player is mid-answer
  if (!open.value) timer = window.setTimeout(() => { open.value = true }, CALM_MS)
}, { immediate: true })

let release: (() => void) | null = null
watch(open, async (on) => {
  if (on && !release) release = acquireModalOpen()
  if (!on) {
    release?.()
    release = null
  }
  if (on) {
    await nextTick()
    drawReference()
  }
})
onBeforeUnmount(() => {
  window.clearTimeout(timer)
  release?.()
  release = null
})

const canvas = ref<HTMLCanvasElement | null>(null)
const SIZE = 56

/** The truth square: canvas pixels are never recoloured. Backing store at the display's own pixel ratio. */
function drawReference(): void {
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx) return
  const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1))
  el.width = SIZE * dpr
  el.height = SIZE * dpr
  ctx.fillStyle = INK
  ctx.fillRect(0, 0, el.width, el.height)
}

const answer = (matches: boolean): void => {
  setSamsungFixChoice(matches ? 'unneeded' : 'on')
  open.value = false
}
</script>

<template lang="pug">
  Teleport(to="body")
    Transition(name="scc-fade")
      div.scc(
        v-if="open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scc-title"
        aria-describedby="scc-body"
      )
        div.scc__backdrop
        div.scc__card
          h2#scc-title.scc__title {{ t('samsungFix.title') }}
          p#scc-body.scc__body {{ t('samsungFix.body') }}
          div.scc__bar(data-bc-raw :style="{ background: CREAM }")
            canvas.scc__sq(ref="canvas" :aria-label="t('samsungFix.refSquare')" role="img" :style="{ width: SIZE + 'px', height: SIZE + 'px' }")
            div.scc__sq(:aria-label="t('samsungFix.pageSquare')" role="img" :style="{ width: SIZE + 'px', height: SIZE + 'px', background: INK }")
          p.scc__question {{ t('samsungFix.question') }}
          div.scc__buttons
            button.scc__btn.scc__btn--yes(type="button" @click="answer(true)") {{ t('samsungFix.yes') }}
            button.scc__btn.scc__btn--no(type="button" @click="answer(false)") {{ t('samsungFix.no') }}
</template>

<style scoped lang="sass">
// Same layer as the dark-mode notice: above every window, below the boot loader.
.scc
  position: fixed
  inset: 0
  z-index: calc(var(--bc-z-system) + 5)
  display: flex
  align-items: center
  justify-content: center
  padding: calc(1rem + env(safe-area-inset-top, 0px)) calc(1rem + env(safe-area-inset-right, 0px)) calc(1rem + env(safe-area-inset-bottom, 0px)) calc(1rem + env(safe-area-inset-left, 0px))
  font-family: var(--font-ui)
  color-scheme: only dark
  forced-color-adjust: none

.scc__backdrop
  position: absolute
  inset: 0
  background: rgba(3, 6, 14, 0.82)

.scc__card
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.5rem, 2vmin, 0.8rem)
  width: 100%
  max-width: 26rem
  max-height: 100%
  overflow-y: auto
  padding: clamp(1rem, 4vmin, 1.5rem) clamp(0.9rem, 3.6vmin, 1.25rem)
  border: 3px solid var(--bc-night)
  border-radius: 1.1rem
  background: var(--bc-slate-lo)
  box-shadow: 0 0.35rem 0 var(--bc-night), 0 1rem 3rem rgba(0, 0, 0, 0.6)
  color: var(--bc-text)
  text-align: center

.scc__title
  margin: 0
  font-size: clamp(1.1rem, 4.8vmin, 1.4rem)
  line-height: 1.2
  font-weight: 800

.scc__body
  margin: 0
  font-size: clamp(0.88rem, 3.6vmin, 1rem)
  line-height: 1.4
  color: var(--bc-text-soft)

// The squares sit side by side on the cream bar, touching the bar's colour on every side.
.scc__bar
  display: flex
  align-items: center
  justify-content: center
  gap: 0.9rem
  padding: 1rem 1.4rem
  border-radius: 0.8rem

.scc__sq
  display: block
  flex: none

.scc__question
  margin: 0
  font-size: clamp(0.95rem, 3.8vmin, 1.1rem)
  font-weight: 700

.scc__buttons
  display: flex
  flex-direction: column
  gap: 0.6rem
  width: 100%

.scc__btn
  appearance: none
  width: 100%
  min-height: 44px
  padding: 0.6rem 1rem
  border: 3px solid var(--bc-night)
  border-radius: 0.8rem
  font: inherit
  font-size: clamp(0.9rem, 3.6vmin, 1rem)
  font-weight: 800
  color: var(--bc-text)
  cursor: pointer
  pointer-events: auto
  &:active
    transform: translateY(2px)

.scc__btn--yes
  background: var(--bc-green-deep)

.scc__btn--no
  background: var(--bc-blue-deep)

.scc-fade-enter-active, .scc-fade-leave-active
  transition: opacity 0.2s ease
.scc-fade-enter-from, .scc-fade-leave-to
  opacity: 0
</style>
