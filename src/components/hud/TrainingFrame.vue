<template lang="pug">
  Transition(name="tf")
    div.training-frame(v-if="show" aria-live="polite")
      div.vignette(aria-hidden="true")
      div.label(role="status") {{ t(`train.name.${hud.trainId}`) }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'

/**
 * Inside a lesson room (`sim/training.ts`): a soft gold glow round the view's
 * edges and a black label naming the lesson ("Charge Shot Tutorial"), so a
 * player knows this room is for practice. Both go when Flux leaves the room.
 * The label sits on a free edge: bottom centre, and in portrait (where the
 * thumbs own the bottom) the top, under the progress bar.
 */
const { t } = useI18n()
const show = computed(() => hud.phase === 'play' && !!hud.trainId && hud.trainPhase !== 'off' &&
  !(hud.freezeKind && hud.freezeFrame !== 'fp'))
</script>

<style scoped lang="sass">
.training-frame
  position: absolute
  inset: 0
  pointer-events: none
  z-index: 1
.vignette
  position: absolute
  inset: 0
  box-shadow: inset 0 0 clamp(40px, 9vmin, 90px) rgba(255, 196, 40, 0.42)
  animation: tf-glow 3.2s ease-in-out infinite
@keyframes tf-glow
  50%
    box-shadow: inset 0 0 clamp(50px, 11vmin, 110px) rgba(255, 196, 40, 0.55)
.label
  position: absolute
  left: 50%
  bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(10px, 2.2vh, 20px))
  transform: translateX(-50%)
  max-width: 44vw
  padding: 5px 14px
  border-radius: 8px
  background: #05070f
  border: 2px solid rgba(255, 216, 74, 0.8)
  color: #ffd84a
  font-family: var(--font-ui)
  font-size: clamp(12px, 2.6vmin, 16px)
  text-align: center
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
@media (max-aspect-ratio: 1/1)
  .label
    bottom: auto
    top: calc(env(safe-area-inset-top, 0px) + 15vh)
    max-width: 70vw
.tf-enter-active, .tf-leave-active
  transition: opacity 0.4s
.tf-enter-from, .tf-leave-to
  opacity: 0
@media (prefers-reduced-motion: reduce)
  .vignette
    animation: none
</style>
