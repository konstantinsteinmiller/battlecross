<template lang="pug">
  Transition(name="xs")
    div.exit-skip(v-if="hud.cineSkip" aria-hidden="true")
      GameIcon(name="skip-forward")
</template>

<script setup lang="ts">
import { hud } from '@/game/state/hud'
import GameIcon from '@/components/icons/GameIcon.vue'

/**
 * The exit cutscene's skip mark (`sim/exitRun.ts`): a small "skip forward"
 * glyph in the corner, no words, shown while a press would skip to the
 * lift-off. It is only a sign — the press itself can land anywhere (a tap on
 * the scene, a click, a key), so it takes no pointer events and has nothing
 * to announce.
 */
</script>

<style scoped lang="sass">
.exit-skip
  position: absolute
  right: calc(env(safe-area-inset-right, 0px) + clamp(14px, 3vmin, 26px))
  bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(14px, 3vmin, 26px))
  width: clamp(38px, 7vmin, 52px)
  height: clamp(38px, 7vmin, 52px)
  padding: clamp(8px, 1.6vmin, 11px)
  box-sizing: border-box
  border-radius: 50%
  border: 2px solid rgba(255, 255, 255, 0.55)
  background: rgba(20, 26, 51, 0.55)
  color: #fff
  pointer-events: none
  z-index: 4
  :deep(.game-icon)
    animation: xs-breathe 1.6s ease-in-out infinite
@keyframes xs-breathe
  0%, 100%
    opacity: 0.6
  50%
    opacity: 1
.xs-enter-active, .xs-leave-active
  transition: opacity 0.25s, transform 0.25s
.xs-enter-from, .xs-leave-to
  opacity: 0
  transform: scale(0.8)
</style>
