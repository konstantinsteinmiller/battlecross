<template lang="pug">
  Transition(name="veil")
    div.veil(v-if="flow.loading" role="status" :aria-label="t('travel.loading')")
      //- The boot splash's backdrop (FLogoProgress), so every loading screen looks alike.
      div.veil__grid(aria-hidden="true")
      div.veil__card
        span.veil__kicker {{ flow.encounter ? t('encounter.kicker') : t('travel.to') }}
        span.veil__name {{ flow.encounter ? t(`encounter.title.${flow.encounter.kind}`) : flow.loadingNode ? t(`node.${flow.loadingNode}.name`) : '' }}
        FBar.veil__bar(:value="Math.max(0.04, flow.loadProgress)" tone="gold" frame="boss" :ticks="false")
        LoadingClicker.veil__play
</template>

<script setup lang="ts">
/** The veil over a journey: the next place is built behind it (time-sliced),
 *  and its bar is the build's real progress. */
import { useI18n } from 'vue-i18n'
import { flow } from '@/game/flow'
import FBar from '@/components/atoms/FBar.vue'
import LoadingClicker from '@/components/atoms/LoadingClicker.vue'

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
  overflow: hidden
  // Kept equal to FLogoProgress's .splash-backdrop / .backdrop-grid (tests/ui/travelVeil.test.ts).
  background: radial-gradient(circle at 50% 40%, rgba(255, 167, 51, 0.18) 0%, rgba(255, 167, 51, 0) 30%), radial-gradient(circle at 50% 40%, #3f7be0 0%, #2b55bf 46%, #1b357f 84%, #0a1224 100%)
  font-family: var(--font-ui)
  color: var(--bc-text)
.veil__grid
  position: absolute
  inset: -300px 0 0 -300px
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cg fill='none' stroke='%23fff' stroke-opacity='.26' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath transform='translate(52 54) rotate(-32) scale(2.2) translate(-12 -12)' d='M12 1.5l2.6 3.4V16h-5.2V4.9zM6 16.5h12M12 17v4.5M12 21.5a1.4 1.4 0 1 0 .01 0'/%3E%3Cpath transform='translate(170 46) rotate(12) scale(1.6) translate(-12 -12)' d='M12 2l8 3v6.2c0 5.6-3.6 9.3-8 10.8c-4.4-1.5-8-5.2-8-10.8V5zM12 6v12M7.5 10.5h9'/%3E%3Cpath transform='translate(194 140) rotate(16) scale(1.9) translate(-12 -12)' d='M9.5 2h5M10.5 2v6.5L5.2 17.5a2.8 2.8 0 0 0 2.4 4.2h8.8a2.8 2.8 0 0 0 2.4-4.2L13.5 8.5V2M7.4 14h9.2'/%3E%3Cpath transform='translate(106 128) rotate(0) scale(1.35) translate(-12 -12)' d='M12 3a9 9 0 1 0 .01 0M12 6.6a5.4 5.4 0 1 0 .01 0'/%3E%3Cpath transform='translate(48 190) rotate(-12) scale(2) translate(-12 -12)' d='M4 17v-5.5a8 8 0 0 1 16 0V17h-5.2v-4.4H9.2V17zM12 3.5V1'/%3E%3Cpath transform='translate(146 202) rotate(18) scale(1.45) translate(-12 -12)' d='M12 2.2l2.9 6 6.5.9-4.7 4.6 1.1 6.5L12 17.1l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z'/%3E%3Cpath transform='translate(206 208) rotate(-10) scale(1.2) translate(-12 -12)' d='M6 4h12l4.5 5.5L12 22 1.5 9.5zM1.5 9.5h21M9 4l3 5.5L15 4'/%3E%3C/g%3E%3C/svg%3E")
  background-size: 300px 300px
  animation: grid-pan 40s linear infinite
  will-change: transform
  pointer-events: none
.veil__card
  position: relative
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
.veil__play
  width: min(92vw, 52vh)
  margin-top: 0.3rem
.veil-enter-active, .veil-leave-active
  transition: opacity 200ms ease-out
.veil-enter-from, .veil-leave-to
  opacity: 0

@keyframes grid-pan
  to
    transform: translate3d(300px, 300px, 0)
@media (prefers-reduced-motion: reduce)
  .veil__grid
    animation: none
</style>
