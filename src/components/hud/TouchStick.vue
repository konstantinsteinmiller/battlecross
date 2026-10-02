<template lang="pug">
  div.stick(v-show="hud.device === 'touch'" ref="root" aria-hidden="true")
    div.stick__base(ref="base")
      div.stick__knob(ref="knob")
</template>

<script setup lang="ts">
/**
 * The resting joystick (phones and tablets). It is a PICTURE: the gesture
 * surface under the HUD owns the pointer, grabs the stick when a press lands
 * on its home (`input.joyHome*`, measured here) and floats it under the thumb.
 * The base and knob follow from the HUD ticker with transforms only.
 */
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { addHudTicker, hud } from '@/game/state/hud'
import { input } from '@/game/boot'

const root = ref<HTMLElement | null>(null)
const base = ref<HTMLElement | null>(null)
const knob = ref<HTMLElement | null>(null)

/** The knob's travel in px (must match `attachInput`'s joystick radius). */
const TRAVEL = 52
let homeX = 0
let homeY = 0

const measure = (): void => {
  const el = base.value
  if (!el || hud.device !== 'touch') { input.joyHomeR = 0; return }
  const r = el.getBoundingClientRect()
  if (r.width <= 0) { input.joyHomeR = 0; return }
  homeX = r.left + r.width / 2
  homeY = r.top + r.height / 2
  input.joyHomeX = homeX
  input.joyHomeY = homeY
  // A generous grab: the whole corner around the picture.
  input.joyHomeR = r.width * 0.95
}

// The stick appears when the hand on the controls turns out to be a finger:
// measure it the moment it is laid out, not a second later.
watch(() => hud.device, () => { void nextTick(measure) })

let removeTicker: (() => void) | null = null
let was = ''
let frame = 0
onMounted(() => {
  measure()
  window.addEventListener('resize', measure)
  removeTicker = addHudTicker(() => {
    // The layout settles a frame or two after a rotation; re-measure cheaply.
    if ((input.joyHomeR === 0 || ++frame % 45 === 0) && !input.joyActive) measure()
    const b = base.value
    const k = knob.value
    if (!b || !k) return
    const on = input.joyActive
    const bx = on ? input.joyOriginX - homeX : 0
    const by = on ? input.joyOriginY - homeY : 0
    const mag = Math.hypot(input.joyX, input.joyY)
    const s = mag > 1 ? 1 / mag : 1
    const kx = on ? input.joyX * s * TRAVEL : 0
    const ky = on ? input.joyY * s * TRAVEL : 0
    const sig = `${on ? 1 : 0}|${bx.toFixed(0)}|${by.toFixed(0)}|${kx.toFixed(0)}|${ky.toFixed(0)}`
    if (sig === was) return
    was = sig
    b.style.transform = `translate(${bx}px, ${by}px)`
    b.style.opacity = on ? '1' : ''
    k.style.transform = `translate(${kx}px, ${ky}px)`
  })
})
onUnmounted(() => {
  window.removeEventListener('resize', measure)
  removeTicker?.()
  input.joyHomeR = 0
})
</script>

<style scoped lang="sass">
.stick
  pointer-events: none
.stick__base
  position: relative
  width: clamp(5.6rem, 30vmin, 8.4rem)
  aspect-ratio: 1
  border-radius: 50%
  border: 3px solid rgba(255, 255, 255, 0.55)
  background: radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.2), rgba(15, 26, 48, 0.38))
  box-shadow: 0 0 0 2px rgba(15, 26, 48, 0.55)
  opacity: 0.62
  transition: opacity 120ms ease-out
  will-change: transform
.stick__knob
  position: absolute
  inset: 28%
  border-radius: 50%
  border: 2px solid #0f1a30
  background: radial-gradient(circle at 38% 30%, #ffffff, #b9c8ee 70%)
  box-shadow: 0 0.2em 0 #0f1a30
  will-change: transform
</style>
