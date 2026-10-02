<template lang="pug">
  Transition(name="veil")
    div.veil(v-if="flow.loading" role="status" :aria-label="t('travel.loading')")
      div.veil__card
        span.veil__kicker {{ t('travel.to') }}
        span.veil__name {{ flow.loadingNode ? t(`node.${flow.loadingNode}.name`) : '' }}
        span.veil__bar
          span.veil__fill(:style="{ transform: `scaleX(${Math.max(0.04, flow.loadProgress)})` }")
</template>

<script setup lang="ts">
/** The veil over a journey: the next place is built behind it (time-sliced),
 *  and its bar is the build's real progress. */
import { useI18n } from 'vue-i18n'
import { flow } from '@/game/flow'

const { t } = useI18n()
</script>

<style scoped lang="sass">
.veil
  position: absolute
  inset: 0
  z-index: 120
  display: flex
  align-items: center
  justify-content: center
  background: radial-gradient(circle at 50% 40%, #3a3168 0%, #1b1626 75%)
  font-family: var(--font-ui)
  color: #fff
.veil__card
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.4rem, 1.8vmin, 0.8rem)
  width: min(80vw, 24rem)
  text-align: center
.veil__kicker
  color: #b9c4ee
  font-size: clamp(0.8rem, 3.2vmin, 1.1rem)
.veil__name
  font-size: clamp(1.4rem, 6.4vmin, 2.4rem)
  line-height: 1.1
  text-shadow: 0 3px 0 #0f1a30
.veil__bar
  position: relative
  width: 100%
  height: clamp(0.7rem, 2.8vmin, 1rem)
  margin-top: 0.4rem
  border-radius: 999px
  border: 2px solid #0f1a30
  background: #1c2440
  overflow: hidden
.veil__fill
  position: absolute
  inset: 0
  border-radius: 999px
  background: linear-gradient(90deg, #ffd84a, #ff9a2a)
  transform-origin: left center
  transition: transform 260ms ease-out
.veil-enter-active, .veil-leave-active
  transition: opacity 200ms ease-out
.veil-enter-from, .veil-leave-to
  opacity: 0
</style>
