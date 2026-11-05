<template lang="pug">
  div.party(v-if="v.active" data-party-hud)
    //- The film: letterbox bars, the title between them, the skip at the corner.
    div.party__bar.party__bar--top(aria-hidden="true")
    div.party__bar.party__bar--bottom(aria-hidden="true")
    Transition(name="party-fade")
      h2.party__title(v-if="v.title") {{ t('celebrate.title') }}
    div.party__skip
      FButton(type="secondary" size="md" icon="fast-forward" icon-position="left" data-party-skip :label="t('intro.skip')" @click="skip")
    div.party__progress(aria-hidden="true")
      i(:style="{ transform: 'scaleX(' + v.t01 + ')' }")
</template>

<script setup lang="ts">
/**
 * ─── The celebration's HUD (roadmap #206) ────────────────────────────────────
 *
 * Over the film after the Goblin King's answer: letterbox bars, "The Hollows are free!" and the game's own skip
 * button (the film can be left at any moment; it is shown once).
 */
import { useI18n } from 'vue-i18n'
import { celebrateActions, celebrateHud } from '@/game/state/celebrateHud'
import FButton from '@/components/atoms/FButton.vue'

const { t } = useI18n()
const v = celebrateHud
const skip = (): void => celebrateActions.skip()
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.party
  position: absolute
  inset: 0
  pointer-events: none
  --bar: clamp(2.6rem, 13vh, 6rem)
.party__bar
  position: absolute
  left: 0
  right: 0
  height: var(--bar)
  background: var(--bc-ink)
  &--top
    top: 0
  &--bottom
    bottom: 0
.party__title
  position: absolute
  bottom: calc(var(--bar) * 0.5)
  left: 50%
  margin: 0
  transform: translate(-50%, 50%)
  width: max-content
  max-width: 88vw
  text-align: center
  +cel.label
  color: var(--bc-gold-hi)
  font-size: clamp(1rem, 3.8vmin, 1.9rem)
  letter-spacing: 0.06em
  text-shadow: 0 0.1em 0 var(--bc-leather-deep), 0 0 0.7em rgba(255, 170, 60, 0.45)
.party__skip
  position: absolute
  top: calc(var(--bar) * 0.5)
  right: calc(env(safe-area-inset-right, 0px) + clamp(0.7rem, 3vmin, 1.6rem))
  transform: translateY(-50%)
  pointer-events: auto
.party__progress
  position: absolute
  left: 0
  right: 0
  bottom: var(--bar)
  height: 3px
  background: rgba(255, 255, 255, 0.08)
  i
    display: block
    height: 100%
    transform-origin: left center
    background: var(--bc-gold-hi)
.party-fade-enter-active, .party-fade-leave-active
  transition: opacity 0.6s ease
.party-fade-enter-from, .party-fade-leave-to
  opacity: 0
</style>
