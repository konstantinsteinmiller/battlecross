<template lang="pug">
  div.boss-chip(
    v-if="show"
    :class="{ live: hud.locatorOn }"
    aria-hidden="true"
  )
    span.disc
      svg.tri(viewBox="0 0 24 24")
        path(d="M12 20 L3 5 H21 Z")
    //- The locator's cooldown, drawn as a ring that fills back up: when it
    //- closes, the triangle shows the way again.
    svg.cd(v-if="hud.locatorCd01 >= 0" viewBox="0 0 40 40")
      circle.cd-track(cx="20" cy="20" r="18")
      circle.cd-fill(cx="20" cy="20" r="18" :style="{ strokeDashoffset: ringOffset }")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { hud } from '@/game/state/hud'
import { BOSSES } from '@/game/data/bosses'

/**
 * ─── The locator chip ────────────────────────────────────────────────────────
 *
 * The top row's clock for the objective locator (`sim/locator.ts`): the yellow
 * triangle's own mark, in a ring that fills over the cooldown, glowing while
 * the triangle is on screen — so the player can tell it will come back, and
 * when.
 *
 * It used to be a "mystery boss" chip (the Core Master's head behind a "?")
 * that doubled as this clock. The mystery made no sense any more (#118): the
 * objective card right below names the Master beside its portrait, and the
 * stage select shows it before the mission starts. So the boss is on the HUD
 * once, in the objective card, and this chip is only the clock.
 *
 * Only on maps with a boss (the locator leads there), until the fight starts.
 */
const CIRC = 2 * Math.PI * 18

const show = computed(() => !!hud.missionBoss && hud.missionBoss in BOSSES && !hud.bossName && !hud.bossDown)
const ringOffset = computed(() => (CIRC * (1 - Math.max(0, Math.min(1, hud.locatorCd01)))).toFixed(2))
</script>

<style scoped lang="sass">
.boss-chip
  position: relative
  flex: 0 0 auto
  width: clamp(34px, 7.6vmin, 46px)
  height: clamp(34px, 7.6vmin, 46px)
  pointer-events: none
.disc
  position: absolute
  inset: 3px
  display: grid
  place-items: center
  border-radius: 50%
  overflow: hidden
  border: 2px solid #141a33
  background: radial-gradient(circle at 50% 35%, #3a4a86, #141a33 72%)
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35), inset 0 0 8px rgba(255, 216, 74, 0.35)
  transition: box-shadow 0.3s ease-out
// The locator's own triangle, pointing down like the one in the world.
.tri
  width: 56%
  height: 56%
  fill: #ffd84a
  stroke: #141a33
  stroke-width: 2
  stroke-linejoin: round
  filter: drop-shadow(0 0 4px rgba(255, 216, 74, 0.7))
.cd
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  transform: rotate(-90deg)
  overflow: visible
.cd-track, .cd-fill
  fill: none
  stroke-width: 3.4
.cd-track
  stroke: rgba(11, 20, 51, 0.8)
.cd-fill
  stroke: #ffd84a
  stroke-linecap: round
  stroke-dasharray: 113.1
  transition: stroke-dashoffset 0.2s linear
// The triangle is up: the chip answers it.
.live .disc
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35), 0 0 12px rgba(255, 216, 74, 0.9), inset 0 0 8px rgba(255, 216, 74, 0.6)
.live .tri
  animation: tri-ping 0.5s ease-out 2
@keyframes tri-ping
  0%
    transform: scale(1)
  40%
    transform: scale(1.35)
  100%
    transform: scale(1)
@media (prefers-reduced-motion: reduce)
  .live .tri
    animation: none
</style>
