<template lang="pug">
  ul.checklist(v-if="hud.checklist.length && hud.phase === 'play'" :aria-label="t('train.checklist')")
    li(v-for="c in hud.checklist" :key="c.id")
      button.item(
        type="button"
        :class="{ done: c.done, current: c.current }"
        :aria-label="`${t(`train.name.${c.id}`)}: ${c.done ? t('train.done') : t('train.todo')}`"
        :disabled="c.done"
        @pointerdown.prevent.stop="point(c.id)"
      )
        GameIcon.ic(:name="ICON[c.id] ?? 'star'")
        span.tick(v-if="c.done" aria-hidden="true")
          GameIcon(name="check")
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { currentMission } from '@/game/boot'
import GameIcon from '@/components/icons/GameIcon.vue'
import type { GameIconName } from '@/components/icons/iconNames'
import type { TrainId } from '@/game/sim/training'

/**
 * The first mission's lessons, top right: one small chip per lesson, ticked
 * when done, ringed gold while it runs. A player who skipped one by accident
 * sees it is still open; tapping an open one points the way to its room.
 * Wordless: the lesson names are the aria-labels.
 */
const { t } = useI18n()
const ICON: Partial<Record<string, GameIconName>> = {
  charge: 'bolt', block: 'shield', slide: 'dodge', gel: 'flask', gap: 'up', weapon: 'buster'
}
const point = (id: string) => currentMission()?.pointToLesson(id as TrainId)
</script>

<style scoped lang="sass">
.checklist
  position: absolute
  right: calc(env(safe-area-inset-right, 0px) + clamp(8px, 2vmin, 16px))
  top: calc(env(safe-area-inset-top, 0px) + clamp(52px, 12vh, 84px))
  margin: 0
  padding: 5px
  list-style: none
  display: flex
  flex-direction: column
  gap: 5px
  border-radius: 14px
  background: rgba(10, 14, 30, 0.45)
  z-index: 3
@media (max-aspect-ratio: 1/1)
  .checklist
    top: calc(env(safe-area-inset-top, 0px) + clamp(96px, 15vh, 130px))
.item
  position: relative
  display: grid
  place-items: center
  width: clamp(26px, 5.4vmin, 34px)
  height: clamp(26px, 5.4vmin, 34px)
  border-radius: 50%
  border: 2px solid rgba(255, 255, 255, 0.55)
  background: rgba(20, 26, 51, 0.8)
  color: rgba(255, 255, 255, 0.85)
  cursor: pointer
  touch-action: none
  // The HUD layer passes pointers through; the buttons must take them back.
  pointer-events: auto
  .ic
    width: 62%
    height: 62%
  &.current
    border-color: #ffd84a
    color: #ffd84a
    animation: cl-ring 1.4s ease-in-out infinite
  &.done
    cursor: default
    border-color: #4fd19a
    color: rgba(255, 255, 255, 0.5)
.tick
  position: absolute
  right: -4px
  bottom: -4px
  width: 58%
  height: 58%
  padding: 2px
  box-sizing: border-box
  border-radius: 50%
  background: #4fd19a
  color: #0b2a1c
@keyframes cl-ring
  50%
    box-shadow: 0 0 10px rgba(255, 216, 74, 0.9)
@media (prefers-reduced-motion: reduce)
  .item.current
    animation: none
</style>
