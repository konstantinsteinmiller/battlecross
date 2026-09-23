<template lang="pug">
  Transition(name="bb")
    div.boss-bar(v-if="hud.bossName" aria-hidden="true")
      div.bb-name {{ t(hud.bossName) }}
      div.bb-track
        div.bb-fill(:style="{ width: segPct + '%' }")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'

/** The Core Master's energy bar — the classic 28 segments, laid across the
 *  top. It fills segment by segment during the entrance. */
const { t } = useI18n()
const SEG = 28
const segPct = computed(() => (Math.ceil(Math.max(0, hud.bossHp01) * SEG) / SEG) * 100)
</script>

<style scoped lang="sass">
.boss-bar
  position: absolute
  left: 50%
  top: calc(env(safe-area-inset-top, 0px) + clamp(32px, 7vmin, 46px))
  transform: translateX(-50%)
  width: min(64vw, 440px)
  pointer-events: none
  z-index: 2
.bb-name
  text-align: center
  font-family: var(--font-ui)
  font-size: clamp(13px, 2.8vmin, 17px)
  color: #fff
  text-shadow: 0 2px 0 #141a33, 0 0 6px rgba(255, 60, 80, 0.6)
  letter-spacing: 0.04em
.bb-track
  position: relative
  margin-top: 4px
  height: clamp(12px, 2.6vmin, 18px)
  border: 3px solid #141a33
  border-radius: 5px
  background: #2a0a12
  overflow: hidden
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  &::after
    content: ''
    position: absolute
    inset: 0
    background: repeating-linear-gradient(90deg, transparent 0, transparent calc(100% / 28 - 2px), #2a0a12 calc(100% / 28 - 2px), #2a0a12 calc(100% / 28))
.bb-fill
  height: 100%
  background: linear-gradient(#fff4c8 0%, #fff4c8 28%, #ff5a4a 29%, #c01830 100%)
  transition: width 0.08s linear
.bb-enter-active, .bb-leave-active
  transition: opacity 0.3s, transform 0.3s
.bb-enter-from, .bb-leave-to
  opacity: 0
  transform: translate(-50%, -10px)
@media (max-aspect-ratio: 1/1)
  .boss-bar
    top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 2.2vmin, 18px) + clamp(36px, 8vmin, 48px) + 40px)
    width: min(72vw, 440px)
</style>
