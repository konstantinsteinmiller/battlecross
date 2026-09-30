<template lang="pug">
  div.freeze(v-if="hud.freezeKind && hud.freezeFrame !== 'fp'" :class="hud.freezeKind")
    //- Letterbox bars: the moment is a shot, not play.
    div.bar.top(aria-hidden="true")
    div.bar.bottom(aria-hidden="true")
    //- The kill-cam counter: how many this mission (top right).
    div.count(v-if="hud.freezeKind === 'kill'" role="img" :aria-label="t('ui.killcamCount', { n: hud.killCams })")
      GameIcon.ic(name="skull")
      span.n ×{{ hud.killCams }}
    //- Where the fire and block buttons sit in play: skip (two presses of
    //- anything also skip; each fills a pip) and, for a kill-cam, "off".
    div.buttons
      button.off(
        v-if="hud.freezeKind === 'kill'"
        type="button"
        :aria-label="t('ui.killcamOff')"
        @pointerdown.prevent.stop="off"
      )
        span.off-mark
          GameIcon(name="video")
          span.slash(aria-hidden="true")
        KeyCap.kc(v-if="desk" code="F4")
      button.skip(
        v-if="hud.freezeSkippable"
        type="button"
        :aria-label="t('ui.skip')"
        @pointerdown.prevent.stop="skip"
      )
        GameIcon(name="skip-forward")
        span.pips(aria-hidden="true")
          span.pip(v-for="i in 2" :key="i" :class="{ on: i <= hud.freezeSkips }")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { currentMission } from '@/game/boot'
import GameIcon from '@/components/icons/GameIcon.vue'
import KeyCap from './KeyCap.vue'

/**
 * The HUD of a third-person freeze-frame (`sim/freezeCam.ts`): letterbox
 * bars, a skip button with a pip per press, and for a kill-cam its counter
 * and the button (or F4) that turns kill-cams off until Options turns them
 * back on. No words: the sentences are the aria-labels.
 */
const { t } = useI18n()
const desk = computed(() => hud.device === 'mouse')
const skip = () => currentMission()?.skipFreeze()
const off = () => currentMission()?.killCamsOff()
</script>

<style scoped lang="sass">
.freeze
  position: absolute
  inset: 0
  z-index: 5
  pointer-events: none
.bar
  position: absolute
  left: 0
  right: 0
  height: 9vh
  background: #05070f
  animation: bar-in 0.3s ease-out both
.bar.top
  top: 0
  transform-origin: top
.bar.bottom
  bottom: 0
  transform-origin: bottom
@keyframes bar-in
  from
    transform: scaleY(0)
.count
  position: absolute
  top: calc(9vh + clamp(8px, 2vmin, 14px))
  right: calc(env(safe-area-inset-right, 0px) + clamp(12px, 3vmin, 24px))
  display: flex
  align-items: center
  gap: 6px
  padding: 4px 10px 4px 6px
  border-radius: 999px
  background: rgba(20, 26, 51, 0.7)
  border: 2px solid rgba(255, 255, 255, 0.45)
  color: #fff
  font-family: var(--font-pixel)
  font-size: clamp(12px, 2.6vmin, 16px)
  .ic
    width: 1.4em
    height: 1.4em
.buttons
  position: absolute
  right: calc(env(safe-area-inset-right, 0px) + clamp(12px, 3.5vmin, 28px))
  bottom: calc(9vh + clamp(10px, 2.5vmin, 20px))
  display: flex
  align-items: flex-end
  gap: clamp(10px, 2.4vmin, 18px)
button
  pointer-events: auto
  position: relative
  display: grid
  place-items: center
  border-radius: 50%
  border: 3px solid #141a33
  color: #fff
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.35), inset 0 -5px 0 rgba(0, 0, 0, 0.18), inset 0 4px 0 rgba(255, 255, 255, 0.35)
  touch-action: none
  -webkit-tap-highlight-color: transparent
  :deep(.game-icon)
    width: 50%
    height: 50%
  &:active
    transform: scale(0.92)
.skip
  width: clamp(64px, 14vmin, 88px)
  height: clamp(64px, 14vmin, 88px)
  background: radial-gradient(circle at 40% 30%, #c0d4ff, #6f8cff 45%, #3a4fc0)
.off
  width: clamp(48px, 11vmin, 64px)
  height: clamp(48px, 11vmin, 64px)
  background: radial-gradient(circle at 40% 30%, #ffb3b3, #ff5a5a 45%, #b02a3a)
.off-mark
  position: relative
  display: grid
  place-items: center
  width: 100%
  height: 100%
  :deep(.game-icon)
    width: 54%
    height: 54%
.slash
  position: absolute
  left: 22%
  right: 22%
  top: 50%
  height: 4px
  margin-top: -2px
  border-radius: 2px
  background: #141a33
  transform: rotate(-40deg)
.pips
  position: absolute
  bottom: -12px
  display: flex
  gap: 4px
.pip
  width: 9px
  height: 9px
  border-radius: 50%
  border: 2px solid #141a33
  background: rgba(255, 255, 255, 0.35)
  &.on
    background: #7fffc8
.kc
  position: absolute
  bottom: -0.55em
  right: -0.35em
@media (prefers-reduced-motion: reduce)
  .bar
    animation: none
</style>
