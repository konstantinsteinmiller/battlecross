<script setup lang="ts">
// ─── ForcedDarkModeModal ────────────────────────────────────────────────
//
// Blocking notice shown while a forced dark-mode / colour overrider is
// repainting the game (Dark Reader's Filter modes, Chromium's "Auto Dark Mode
// for Web Contents" on a light OS, a generic recolouring extension…). The
// opt-outs in index.html and the global stylesheet neutralise the common
// cases silently; this is for what is left. From the forced-dark-mode-guard
// skill.
//
// Mounted unconditionally in App.vue; visibility is purely reactive on
// `isBlocking`, so it disappears BY ITSELF the moment the player turns the
// overrider off (the watcher re-checks on focus, DOM mutation and
// media-query change). There is no close button: the only exits are "fix it"
// (auto-dismiss) or the small "Continue at own risk" link.
//
// Deliberately NOT the parchment FModal shell: the overrider is still active
// while this card is on screen, and a solid dark card with light text survives
// Dark Reader, auto-dark and forced colours almost unchanged, where the light
// parchment would be repainted into exactly the mess the notice is about.
// Colour carries no meaning here.

import { computed, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForcedDarkModeGuard } from '@/use/useForcedDarkModeGuard'
import { acquireModalOpen } from '@/use/useModalState'
import GameIcon from '@/components/icons/GameIcon.vue'

const { t } = useI18n()
const { result, isBlocking, canContinueAnyway, continueAnyway } = useForcedDarkModeGuard()

const FLAG_URL: Record<string, string> = {
  chrome: 'chrome://flags/#enable-force-dark',
  edge: 'edge://flags/#enable-force-dark',
  opera: 'opera://flags/#enable-force-dark',
  brave: 'brave://flags/#enable-force-dark'
}

/** One "how to turn it off" line, picked from what was detected. */
const hint = computed(() => {
  const { kind, browser } = result.value
  switch (kind) {
    case 'dark-reader':
      return t('forcedDark.hint.darkReader')
    case 'chromium-auto-dark':
      if (browser === 'samsung') return t('forcedDark.hint.samsung')
      return t('forcedDark.hint.chromiumFlag', { flagUrl: FLAG_URL[browser] ?? FLAG_URL.chrome })
    case 'forced-colors':
      return browser === 'firefox' ? t('forcedDark.hint.firefoxColors') : t('forcedDark.hint.forcedColors')
    default: // night-eye, css-filter-invert, unknown-css-override
      return t('forcedDark.hint.extension')
  }
})

// Dark Reader Filter mode (and other invert-filter extensions) put
// `filter: invert(…) hue-rotate(180deg)` on <html>, so this card would be
// shown inverted. Counter-invert the notice so it keeps its real colours.
// Filter+ uses an SVG `url(#…)` filter instead: no invert signal, no counter,
// and the notice shows in whatever colours that filter paints (still legible).
const counterInvert = computed(() => result.value.signals.some(s => s.kind === 'css-filter-invert' && !s.prevented))

// The game stands still behind the notice: an app-side modal hold, the same one
// every blocking window takes. It freezes the simulation and keeps the portal
// gameplay bracket closed (`isAnyModalOpen` is one of its inputs), so on the
// boot path the first gameplayStart waits for the guard, and mid-session the
// notice reads as any blocking menu. A hold, not the platform pause setter: a
// portal resume (an ad closing) must not release it while the notice is up.
let release: (() => void) | null = null
watch(isBlocking, (on) => {
  if (on && !release) release = acquireModalOpen()
  if (!on) { release?.(); release = null }
}, { immediate: true })
onBeforeUnmount(() => { release?.(); release = null })
</script>

<template lang="pug">
  Teleport(to="body")
    Transition(name="fdm-fade")
      div.fdm(
        v-if="isBlocking"
        :class="{ 'fdm--counter-invert': counterInvert }"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="fdm-title"
        aria-describedby="fdm-body"
      )
        div.fdm__backdrop
        div.fdm__card
          span.fdm__badge(aria-hidden="true")
            GameIcon(name="warning")
          h2#fdm-title.fdm__title {{ t('forcedDark.title') }}
          p#fdm-body.fdm__body {{ t('forcedDark.body') }}
          p.fdm__hint {{ hint }}
          p.fdm__waiting(aria-live="polite") {{ t('forcedDark.waiting') }}
          button.fdm__continue(
            v-if="canContinueAnyway"
            type="button"
            @click="continueAnyway"
          ) {{ t('forcedDark.continueAnyway') }}
</template>

<style scoped lang="sass">
// Above every window and the ad-blocked notice (--bc-z-system); below the boot
// loader (z 200), which it never coexists with for long: loading is not gated.
.fdm
  position: fixed
  inset: 0
  z-index: calc(var(--bc-z-system) + 10)
  display: flex
  align-items: center
  justify-content: center
  padding: calc(1rem + env(safe-area-inset-top, 0px)) calc(1rem + env(safe-area-inset-right, 0px)) calc(1rem + env(safe-area-inset-bottom, 0px)) calc(1rem + env(safe-area-inset-left, 0px))
  font-family: var(--font-ui)
  // The game already declares its own scheme; pin this subtree as well so a
  // partial overrider does not flip UA defaults (button text etc.) inside it.
  color-scheme: only dark
  forced-color-adjust: none

// Undo an inverting page filter (Dark Reader Filter mode) on the notice only.
// Approximate: Dark Reader's brightness/contrast/sepia sliders are not undone.
.fdm--counter-invert
  filter: invert(1) hue-rotate(180deg)

.fdm__backdrop
  position: absolute
  inset: 0
  background: rgba(3, 6, 14, 0.88)

.fdm__card
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.4rem, 1.6vmin, 0.65rem)
  width: 100%
  max-width: 26rem
  max-height: 100%
  overflow-y: auto
  padding: clamp(1rem, 4vmin, 1.5rem) clamp(0.9rem, 3.6vmin, 1.25rem) clamp(0.6rem, 2.4vmin, 1rem)
  border: 3px solid var(--bc-night)
  border-radius: 1.1rem
  background: var(--bc-slate-lo)
  box-shadow: 0 0.35rem 0 var(--bc-night), 0 1rem 3rem rgba(0, 0, 0, 0.6)
  color: var(--bc-text)
  text-align: center

.fdm__badge
  width: clamp(2.6rem, 11vmin, 3.2rem)
  height: clamp(2.6rem, 11vmin, 3.2rem)
  padding: 0.6rem
  border: 2px solid var(--bc-night)
  border-radius: 50%
  background: var(--bc-orange)
  color: var(--bc-ink)

.fdm__title
  margin: 0
  font-size: clamp(1.1rem, 4.8vmin, 1.4rem)
  line-height: 1.2
  font-weight: 800

.fdm__body
  margin: 0
  font-size: clamp(0.88rem, 3.6vmin, 1rem)
  line-height: 1.4
  color: var(--bc-text-soft)

.fdm__hint
  margin: 0
  width: 100%
  padding: 0.6rem 0.75rem
  border-radius: 0.7rem
  background: var(--bc-slate-deep)
  color: var(--bc-text-gold)
  font-size: clamp(0.82rem, 3.3vmin, 0.92rem)
  line-height: 1.4
  // Flag URLs must wrap, never force a sideways scroll at 320 px.
  overflow-wrap: anywhere

.fdm__waiting
  margin: 0
  font-size: clamp(0.76rem, 3vmin, 0.84rem)
  color: var(--bc-text-mute)

// Deliberately a quiet text link, not a button: the fix is the primary path.
.fdm__continue
  appearance: none
  border: 0
  background: none
  padding: 0.5rem 0.75rem
  min-height: 44px
  font: inherit
  font-size: clamp(0.78rem, 3vmin, 0.86rem)
  color: var(--bc-text-mute)
  text-decoration: underline
  cursor: pointer
  pointer-events: auto
  &:hover, &:focus-visible
    color: var(--bc-text-soft)

.fdm-fade-enter-active, .fdm-fade-leave-active
  transition: opacity 0.2s ease
.fdm-fade-enter-from, .fdm-fade-leave-to
  opacity: 0
</style>
