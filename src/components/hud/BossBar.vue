<template lang="pug">
  Transition(name="bb")
    div.bb-bar(v-if="hud.bossName" aria-hidden="true")
      span.cap
        GameIcon(name="skull")
      div.track
        div.fill(:style="{ height: segPct + '%' }")
        //- A multi-part boss: where each part's share ends.
        span.mark(v-for="m in hud.bossMarks" :key="m" :style="{ bottom: (m * 100) + '%' }")
  Transition(name="bbn")
    div.bb-name(v-if="hud.bossName" aria-hidden="true")
      span.skull
        GameIcon(name="skull")
      span.label {{ t(hud.bossName) }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import GameIcon from '@/components/icons/GameIcon.vue'

/**
 * The Core Master's energy: the classic 28-segment vertical bar, standing in
 * line right of Flux's own two, the way Mega Man 2–6 set the boss's meter
 * beside the hero's. Same frame, cap and segment geometry as HudBars (keep the
 * two in step), in violet under a skull, a colour none of Flux's bars ever
 * take (yellow or red health, weapon colours).
 *
 * It fills segment by segment during the entrance (the mission ramps
 * `bossHp01`), with no tween, so every step lands whole.
 *
 * The name keeps the top-centre slot the target frame gives up while a boss is
 * up, marked with the same skull.
 */
const { t } = useI18n()
const SEG = 28
const segPct = computed(() => (Math.ceil(Math.min(1, Math.max(0, hud.bossHp01)) * SEG) / SEG) * 100)
</script>

<style scoped lang="sass">
// ─── The bar: HudBars' frame, two bars and two gaps in from its left ────────
.bb-bar
  --bw: clamp(14px, 3.4vmin, 22px)
  --gap: clamp(3px, 0.8vmin, 6px)
  position: absolute
  left: calc(env(safe-area-inset-left, 0px) + clamp(8px, 2.2vmin, 18px) + var(--bw) * 2 + var(--gap) * 2)
  top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 2.2vmin, 18px))
  display: flex
  flex-direction: column
  width: var(--bw)
  height: clamp(110px, 28vmin, 200px)
  padding: 3px
  border-radius: 4px
  background: #141a33
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  pointer-events: none
  z-index: 2
.cap
  display: block
  flex: none
  width: calc(var(--bw) - 2px)
  height: calc(var(--bw) - 2px)
  margin: -2px -2px 1px
  color: #c98bff
.track
  position: relative
  flex: 1
  border-radius: 1px
  background: #0b1433
  overflow: hidden
  // Segment gaps drawn over whatever fill is below
  &::after
    content: ''
    position: absolute
    inset: 0
    background: repeating-linear-gradient(to top, transparent 0, transparent calc(100% / 28 - 1.5px), #0b1433 calc(100% / 28 - 1.5px), #0b1433 calc(100% / 28))
    pointer-events: none
.mark
  position: absolute
  left: -2px
  right: -2px
  height: 2px
  background: #ffd84a
  z-index: 1
.fill
  position: absolute
  left: 0
  right: 0
  bottom: 0
  background: linear-gradient(90deg, #f4e0ff 0%, #f4e0ff 30%, #b45cff 31%, #7a2ee0 100%)
// ─── The name: the target frame's slot ───────────────────────────────────────
.bb-name
  position: absolute
  left: 50%
  top: calc(env(safe-area-inset-top, 0px) + clamp(32px, 7vmin, 46px))
  transform: translateX(-50%)
  display: flex
  align-items: center
  gap: 6px
  max-width: min(64vw, 440px)
  font-family: var(--font-ui)
  font-size: clamp(13px, 2.8vmin, 17px)
  color: #fff
  text-shadow: 0 2px 0 #141a33, 0 0 6px rgba(180, 92, 255, 0.7)
  letter-spacing: 0.04em
  white-space: nowrap
  pointer-events: none
  z-index: 2
.skull
  display: block
  flex: none
  width: 1.2em
  height: 1.2em
  color: #c98bff
  filter: drop-shadow(0 2px 0 #141a33)
.label
  min-width: 0
  overflow: hidden
  text-overflow: ellipsis
.bb-enter-active, .bb-leave-active, .bbn-enter-active, .bbn-leave-active
  transition: opacity 0.3s, transform 0.3s
.bb-enter-from, .bb-leave-to
  opacity: 0
  transform: translateX(-10px)
.bbn-enter-from, .bbn-leave-to
  opacity: 0
  transform: translate(-50%, -10px)
@media (max-aspect-ratio: 1/1)
  .bb-name
    top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 2.2vmin, 18px) + clamp(36px, 8vmin, 48px) + 40px)
    max-width: min(72vw, 440px)
</style>
