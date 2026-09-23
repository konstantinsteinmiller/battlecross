<template lang="pug">
  div.sfx-layer(aria-hidden="true")
    div.hurt(ref="hurt")
    div.flash(ref="flash")
    div.beam(ref="beam")
  div.toasts
    TransitionGroup(name="toast")
      div.toast(v-for="tt in toasts" :key="tt.id" :style="{ color: tt.color }") {{ t(tt.key, tt.params) }}
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { addHudTicker, hud } from '@/game/state/hud'
import { screenFx, toasts } from '@/game/state/screenFx'

/** Red hurt vignette, colour flashes (parry, perfect, pickups), the beam-in
 *  white-out, and the toast stack. */
const { t } = useI18n()
const hurt = ref<HTMLElement | null>(null)
const flash = ref<HTMLElement | null>(null)
const beam = ref<HTMLElement | null>(null)
let off: (() => void) | null = null

onMounted(() => {
  off = addHudTicker((dt) => {
    screenFx.hurt = Math.max(0, screenFx.hurt - dt * 1.6)
    screenFx.flash = Math.max(0, screenFx.flash - dt * 3.5)
    const lowHp = hud.maxHp > 0 && hud.hp / hud.maxHp < 0.25 && hud.phase === 'play'
    const pulse = lowHp ? 0.25 + 0.15 * Math.sin(performance.now() / 180) : 0
    if (hurt.value) hurt.value.style.opacity = String(Math.min(1, screenFx.hurt * 0.85 + pulse))
    if (flash.value) {
      flash.value.style.opacity = String(screenFx.flash)
      flash.value.style.background = screenFx.flashColor
    }
    if (beam.value) beam.value.style.opacity = hud.phase === 'beamIn' ? '0.35' : '0'
  })
})
onUnmounted(() => off?.())
</script>

<style scoped lang="sass">
.sfx-layer
  position: absolute
  inset: 0
  pointer-events: none
.hurt
  position: absolute
  inset: 0
  opacity: 0
  background: radial-gradient(ellipse at center, transparent 45%, rgba(255, 30, 50, 0.55) 100%)
.flash
  position: absolute
  inset: 0
  opacity: 0
  mix-blend-mode: screen
.beam
  position: absolute
  inset: 0
  opacity: 0
  background: radial-gradient(ellipse at center, rgba(180, 250, 255, 0.9) 0%, rgba(120, 220, 255, 0.4) 40%, transparent 75%)
  transition: opacity 0.4s
.toasts
  position: absolute
  left: 50%
  top: calc(env(safe-area-inset-top, 0px) + clamp(70px, 14vh, 120px))
  transform: translateX(-50%)
  display: flex
  flex-direction: column
  align-items: center
  gap: 6px
  pointer-events: none
  width: min(92vw, 520px)
.toast
  font-family: var(--font-ui)
  font-size: clamp(14px, 3.2vmin, 20px)
  padding: 6px 14px
  border-radius: 10px
  background: rgba(11, 20, 51, 0.78)
  border: 2px solid rgba(127, 244, 255, 0.45)
  text-shadow: 0 2px 0 #141a33
  text-align: center
.toast-enter-active, .toast-leave-active
  transition: all 0.25s
.toast-enter-from
  opacity: 0
  transform: translateY(-10px) scale(0.9)
.toast-leave-to
  opacity: 0
</style>
