<template lang="pug">
  div.joy(ref="root" aria-hidden="true")
    div.joy-base(ref="base")
      div.joy-knob(ref="knob")
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { addHudTicker } from '@/game/state/hud'
import { input } from '@/game/boot'

/**
 * The floating joystick's visual. The logic lives in `engine/input.ts`; this
 * only mirrors it with direct DOM writes from the HUD ticker (never through
 * Vue reactivity — it moves every frame).
 */
const base = ref<HTMLElement | null>(null)
const knob = ref<HTMLElement | null>(null)
let off: (() => void) | null = null
let shown = false

onMounted(() => {
  off = addHudTicker(() => {
    const b = base.value
    const k = knob.value
    if (!b || !k) return
    if (input.joyActive !== shown) {
      shown = input.joyActive
      b.style.opacity = shown ? '1' : '0'
    }
    if (!shown) return
    b.style.transform = `translate(${input.joyOriginX}px, ${input.joyOriginY}px)`
    const m = Math.min(1, Math.hypot(input.joyX, input.joyY))
    const a = Math.atan2(input.joyY, input.joyX)
    k.style.transform = `translate(${Math.cos(a) * m * 100}%, ${Math.sin(a) * m * 100}%)`
  })
})
onUnmounted(() => off?.())
</script>

<style scoped lang="sass">
.joy
  position: absolute
  inset: 0
  pointer-events: none
.joy-base
  position: absolute
  left: 0
  top: 0
  width: 112px
  height: 112px
  margin: -56px 0 0 -56px
  border-radius: 50%
  background: radial-gradient(circle, rgba(20, 40, 90, 0.18) 0%, rgba(20, 40, 90, 0.34) 70%)
  border: 3px solid rgba(160, 225, 255, 0.55)
  box-shadow: 0 0 18px rgba(80, 200, 255, 0.25), inset 0 0 12px rgba(80, 200, 255, 0.25)
  opacity: 0
  transition: opacity 0.12s
  will-change: transform
.joy-knob
  position: absolute
  left: 50%
  top: 50%
  width: 50px
  height: 50px
  margin: -25px 0 0 -25px
  border-radius: 50%
  background: radial-gradient(circle at 38% 32%, #bff3ff 0%, #3cc8ff 45%, #1f5fe8 100%)
  border: 3px solid #141a33
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  will-change: transform
</style>
