<template lang="pug">
  Transition(name="tip")
    div.tip(v-if="hud.tip && hud.phase === 'play'" :key="hud.tip" role="status")
      div.pip(aria-hidden="true")
        div.pip-eye
        div.pip-ant
      div.bubble {{ t(hud.tip) }}
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'

/** Pip, Cobalt's support bot, with a one-line tip. CSS-drawn (no bitmap). */
const { t } = useI18n()
</script>

<style scoped lang="sass">
.tip
  position: absolute
  left: 50%
  top: calc(env(safe-area-inset-top, 0px) + clamp(78px, 15vmin, 110px))
  transform: translateX(-50%)
  display: flex
  align-items: center
  gap: 8px
  width: max-content
  max-width: min(90vw, 460px)
  pointer-events: none
  z-index: 2
.pip
  position: relative
  flex: 0 0 auto
  width: clamp(34px, 7vmin, 44px)
  height: clamp(34px, 7vmin, 44px)
  border-radius: 50%
  border: 3px solid #141a33
  background: radial-gradient(circle at 40% 30%, #ffffff, #dfe7ff 55%, #9fb8e6)
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.3)
  animation: pip-bob 1.4s ease-in-out infinite
.pip-eye
  position: absolute
  left: 26%
  top: 30%
  width: 48%
  height: 40%
  border-radius: 50%
  background: radial-gradient(circle, #7ff4ff 0 35%, #1d2438 36%)
.pip-ant
  position: absolute
  left: 46%
  top: -30%
  width: 8%
  height: 32%
  background: #2468f0
  border-radius: 2px
  &::after
    content: ''
    position: absolute
    left: -120%
    top: -40%
    width: 340%
    aspect-ratio: 1
    border-radius: 50%
    background: #ff7ab0
.bubble
  padding: 8px 12px
  border-radius: 12px
  border: 2px solid #141a33
  background: rgba(244, 247, 255, 0.95)
  color: #141a33
  font-family: var(--font-ui)
  font-size: clamp(12px, 2.7vmin, 16px)
  line-height: 1.25
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.3)
.tip-enter-active, .tip-leave-active
  transition: opacity 0.25s, transform 0.25s
.tip-enter-from, .tip-leave-to
  opacity: 0
  transform: translate(-50%, -8px) scale(0.95)
@keyframes pip-bob
  50%
    transform: translateY(-3px)
@media (max-aspect-ratio: 1/1)
  .tip
    top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 2.2vmin, 18px) + clamp(110px, 28vmin, 200px) + 86px)
</style>
