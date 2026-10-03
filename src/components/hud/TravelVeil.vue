<template lang="pug">
  Transition(name="veil")
    div.veil(v-if="flow.loading" role="status" :aria-label="t('travel.loading')")
      div.veil__card
        span.veil__kicker {{ flow.encounter ? t('encounter.kicker') : t('travel.to') }}
        span.veil__name {{ flow.encounter ? t(`encounter.title.${flow.encounter.kind}`) : flow.loadingNode ? t(`node.${flow.loadingNode}.name`) : '' }}
        FBar.veil__bar(:value="Math.max(0.04, flow.loadProgress)" tone="gold" frame="champion" :ticks="false")
</template>

<script setup lang="ts">
/** The veil over a journey: the next place is built behind it (time-sliced),
 *  and its bar is the build's real progress. */
import { useI18n } from 'vue-i18n'
import { flow } from '@/game/flow'
import FBar from '@/components/atoms/FBar.vue'

const { t } = useI18n()
</script>

<style scoped lang="sass">
.veil
  position: absolute
  inset: 0
  z-index: var(--bc-z-veil)
  display: flex
  align-items: center
  justify-content: center
  background: radial-gradient(circle at 50% 40%, var(--bc-slate-hi) 0%, var(--bc-ink) 75%)
  font-family: var(--font-ui)
  color: var(--bc-text)
.veil__card
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.3rem, 1.4vmin, 0.6rem)
  width: min(80vw, 24rem)
  text-align: center
.veil__kicker
  color: var(--bc-text-soft)
  font-size: clamp(0.8rem, 3.2vmin, 1.1rem)
.veil__name
  font-size: clamp(1.4rem, 6.4vmin, 2.4rem)
  line-height: 1.1
  text-shadow: var(--bc-text-outline)
.veil__bar
  --fbar-h: clamp(0.8rem, 3vmin, 1.1rem)
  align-self: stretch
  margin-top: 0.3rem
.veil-enter-active, .veil-leave-active
  transition: opacity 200ms ease-out
.veil-enter-from, .veil-leave-to
  opacity: 0
</style>
