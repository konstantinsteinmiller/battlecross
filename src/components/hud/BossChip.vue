<template lang="pug">
  div.boss-chip(
    v-if="bossId"
    role="img"
    :class="{ revealed, down: hud.bossDown, live: hud.locatorOn }"
    :aria-label="revealed ? t(`boss.${bossId}`) : t('hud.bossUnknown')"
  )
    span.disc
      img.face(v-if="face" :src="face" alt="" draggable="false")
      span.q(v-if="!revealed") ?
      GameIcon.done(v-if="hud.bossDown" name="check")
    //- The locator's cooldown, drawn as a ring that fills back up: when it
    //- closes, the triangle shows the way again.
    svg.cd(v-if="!revealed && hud.locatorCd01 >= 0" viewBox="0 0 40 40" aria-hidden="true")
      circle.cd-track(cx="20" cy="20" r="18")
      circle.cd-fill(cx="20" cy="20" r="18" :style="{ strokeDashoffset: ringOffset }")
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import GameIcon from '@/components/icons/GameIcon.vue'
import type { BossId } from '@/game/models/bosses'
import { BOSSES } from '@/game/data/bosses'
import { bossPortrait, cachedBossPortrait } from '@/game/models/portrait'

/**
 * ─── The mystery boss chip ───────────────────────────────────────────────────
 *
 * The top row's promise of what waits at the end of the mission: the Core
 * Master's head, dimmed and tinted, behind a big "?". It stays a mystery until
 * the shutter slams and the name card plays; then the "?" pops off and the face
 * lights up in full colour. A fallen boss greys out under a check.
 *
 * It doubles as the locator's clock (`sim/locator.ts`): the ring around it
 * fills over the cooldown, and the chip glows while the yellow triangle is on
 * screen — so the player can tell the triangle will come back, and when.
 *
 * Only on maps with a boss; jobs have none, and show no chip.
 */
const { t } = useI18n()
const CIRC = 2 * Math.PI * 18

const bossId = computed<BossId | null>(() => {
  const id = hud.missionBoss
  return id && id in BOSSES ? id as BossId : null
})
/** The fight has begun: the name card named it. */
const revealed = computed(() => !!hud.bossName || hud.bossDown)
const ringOffset = computed(() => (CIRC * (1 - Math.max(0, Math.min(1, hud.locatorCd01)))).toFixed(2))

// The same cached render the objective card shows (see `models/portrait.ts`):
// drawn once per boss after the beam-in, when the mission's shaders are warm.
const face = ref<string | null>(null)
watch([bossId, () => hud.phase], ([id, phase]) => {
  face.value = id ? cachedBossPortrait(id) : null
  if (!id || face.value || phase !== 'play') return
  void bossPortrait(id).then((url) => {
    if (bossId.value === id) face.value = url
  })
}, { immediate: true })
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
  background: radial-gradient(circle at 50% 40%, #6a1f2c, #2a0c14 70%)
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35), inset 0 0 8px rgba(255, 60, 80, 0.55)
  transition: box-shadow 0.3s ease-out, background 0.4s ease-out
// The head in the background: there, recognisably, but held back — muted
// and washed red by the veil over it — until the fight names it.
.face
  position: absolute
  inset: -6%
  width: 112%
  height: 112%
  object-fit: cover
  filter: brightness(0.9) saturate(0.7) contrast(1.1)
  opacity: 0.95
  transition: filter 0.5s ease-out, opacity 0.5s ease-out
  user-select: none
// The red veil between the head and the "?".
.disc::after
  content: ''
  position: absolute
  inset: 0
  border-radius: 50%
  background: radial-gradient(circle at 50% 45%, rgba(120, 10, 30, 0.05), rgba(90, 8, 24, 0.5) 80%)
  transition: opacity 0.5s ease-out
  pointer-events: none
.revealed .disc::after
  opacity: 0
.q
  position: relative
  z-index: 1
  font-family: var(--font-pixel)
  font-size: clamp(12px, 2.8vmin, 17px)
  line-height: 1
  color: #ffd84a
  text-shadow: 2px 2px 0 #141a33, -1px -1px 0 #141a33, 1px -1px 0 #141a33, -1px 1px 0 #141a33, 0 0 8px rgba(255, 216, 74, 0.8)
  animation: q-breathe 1.8s ease-in-out infinite
.done
  position: absolute
  z-index: 1
  width: 58%
  height: 58%
  color: #8dff7a
  filter: drop-shadow(0 2px 0 #141a33)
  animation: pop-in 0.35s ease-out
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
.live .q
  animation: q-ping 0.5s ease-out 2
// The name card played: the face in full.
.revealed .face
  filter: none
  opacity: 1
.revealed .disc
  background: radial-gradient(circle at 50% 35%, #3a4a86, #141a33 72%)
  border-color: #ff6a78
  animation: pop-in 0.4s ease-out
.down .face
  filter: grayscale(1) brightness(0.6)
.down .disc
  border-color: #8dff7a
@keyframes q-breathe
  0%, 100%
    transform: scale(1)
  50%
    transform: scale(1.12)
@keyframes q-ping
  0%
    transform: scale(1)
  40%
    transform: scale(1.45)
  100%
    transform: scale(1)
@keyframes pop-in
  from
    transform: scale(0.5)
    opacity: 0
@media (prefers-reduced-motion: reduce)
  .q, .live .q
    animation: none
</style>
