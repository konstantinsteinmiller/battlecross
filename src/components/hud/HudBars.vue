<template lang="pug">
  div.bars(aria-hidden="true")
    div.bar-col
      div.bar.hp(:title="t('hud.hp')")
        div.fill(:style="{ height: hpPct + '%' }" :class="{ low: hpLow }")
      div.bar.we(:title="t('hud.we')" :style="{ '--we': weColor }")
        div.fill(:style="{ height: wePct + '%' }")
    div.power
      div.power-fill(:style="{ width: powerPct + '%' }" :class="{ cracked: powerPct < 20 }")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'

/**
 * The classic vertical energy bars: 28 segments each, health in yellow and
 * weapon energy in the equipped weapon's colour, drawn as ONE fill element over
 * a repeating segment mask (no per-segment DOM). A thin Power bar (block /
 * slide stamina) runs underneath.
 */
const { t } = useI18n()
const SEG = 28
const seg = (v: number, max: number) => (max > 0 ? (Math.ceil((v / max) * SEG) / SEG) * 100 : 0)
const hpPct = computed(() => seg(hud.hp, hud.maxHp))
const wePct = computed(() => seg(hud.we, hud.maxWe))
const powerPct = computed(() => (hud.maxPower > 0 ? (hud.power / hud.maxPower) * 100 : 0))
const hpLow = computed(() => hud.hp / Math.max(1, hud.maxHp) < 0.25)
const weColor = computed(() => hud.weapons[0]?.id ? hud.weapons[0]!.color : '#5fd8ff')
</script>

<style scoped lang="sass">
.bars
  position: absolute
  left: calc(env(safe-area-inset-left, 0px) + clamp(8px, 2.2vmin, 18px))
  top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 2.2vmin, 18px))
  display: flex
  flex-direction: column
  gap: 6px
.bar-col
  display: flex
  gap: clamp(3px, 0.8vmin, 6px)
.bar
  position: relative
  width: clamp(14px, 3.4vmin, 22px)
  height: clamp(110px, 28vmin, 200px)
  border: 3px solid #141a33
  border-radius: 4px
  background: #0b1433
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  overflow: hidden
  // Segment gaps drawn over whatever fill is below
  &::after
    content: ''
    position: absolute
    inset: 0
    background: repeating-linear-gradient(to top, transparent 0, transparent calc(100% / 28 - 1.5px), #0b1433 calc(100% / 28 - 1.5px), #0b1433 calc(100% / 28))
    pointer-events: none
.fill
  position: absolute
  left: 0
  right: 0
  bottom: 0
  transition: height 0.12s linear
.hp .fill
  background: linear-gradient(90deg, #fff9c8 0%, #fff9c8 30%, #ffe14a 31%, #f0a800 100%)
  &.low
    animation: low-blink 0.5s steps(2) infinite
.we .fill
  background: linear-gradient(90deg, #ffffff 0%, #ffffff 30%, var(--we) 31%, var(--we) 100%)
.power
  width: calc(clamp(14px, 3.4vmin, 22px) * 2 + clamp(3px, 0.8vmin, 6px))
  height: 7px
  border: 2px solid #141a33
  border-radius: 4px
  background: #0b1433
  overflow: hidden
.power-fill
  height: 100%
  background: linear-gradient(#bff3ff, #3cc8ff)
  transition: width 0.1s linear
  &.cracked
    background: linear-gradient(#ffd0c0, #ff6a3d)
@keyframes low-blink
  50%
    opacity: 0.45
</style>
