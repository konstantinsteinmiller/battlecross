<template lang="pug">
  div.stick(v-show="hud.device === 'touch'" ref="root" aria-hidden="true")
    div.stick__probe(ref="probe")
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
import { isTabletViewport, TABLET_TRAVEL_K } from '@/game/engine/stickZone'

const root = ref<HTMLElement | null>(null)
const base = ref<HTMLElement | null>(null)
const knob = ref<HTMLElement | null>(null)
const probe = ref<HTMLElement | null>(null)

/** The knob's travel in px at HUD scale 1; `input.joyTravel` carries the scaled value to `attachInput`. */
const TRAVEL = 52
let travel = TRAVEL
let homeX = 0
let homeY = 0
/** The base glides to a re-anchored spot (and back) in about this long (ms). */
const GLIDE_MS = 36
let shownX = 0
let shownY = 0
let lastAt = 0

const measure = (): void => {
  const el = base.value
  if (!el || hud.device !== 'touch') { input.joyHomeR = 0; return }
  const r = el.getBoundingClientRect()
  if (r.width <= 0) { input.joyHomeR = 0; return }
  // A smaller picture (a small screen) has less room for the knob to roam.
  const s = parseFloat(document.documentElement.style.getPropertyValue('--hud-s')) || 1
  const tablet = isTabletViewport(window.innerWidth, window.innerHeight, window.matchMedia?.('(pointer: coarse)').matches ?? false)
  travel = Math.min(TRAVEL * s * (tablet ? TABLET_TRAVEL_K : 1), r.width * (tablet ? 0.62 : 0.52))
  input.joyTravel = travel
  // The notch and the home bar: the floating anchor keeps clear of them.
  const pr = probe.value ? getComputedStyle(probe.value) : null
  input.joyInsetL = parseFloat(pr?.paddingLeft ?? '0') || 0
  input.joyInsetB = parseFloat(pr?.paddingBottom ?? '0') || 0
  homeX = r.left + r.width / 2
  homeY = r.top + r.height / 2
  input.joyHomeX = homeX
  input.joyHomeY = homeY
  // A generous grab: the whole corner around the picture.
  input.joyHomeR = Math.max(r.width * 0.95, 64)
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
    const now = performance.now()
    const dt = lastAt ? Math.min(100, now - lastAt) : 16
    lastAt = now
    const tx = on ? input.joyOriginX - homeX : 0
    const ty = on ? input.joyOriginY - homeY : 0
    // A short ease: the base glides to the thumb and back to its resting spot.
    const ease = 1 - Math.exp(-dt / GLIDE_MS)
    shownX += (tx - shownX) * ease
    shownY += (ty - shownY) * ease
    if (Math.abs(tx - shownX) < 0.5 && Math.abs(ty - shownY) < 0.5) { shownX = tx; shownY = ty }
    const bx = shownX
    const by = shownY
    const mag = Math.hypot(input.joyX, input.joyY)
    const s = mag > 1 ? 1 / mag : 1
    const kx = on ? input.joyX * s * travel : 0
    const ky = on ? input.joyY * s * travel : 0
    const sig = `${on ? 1 : 0}|${bx.toFixed(1)}|${by.toFixed(1)}|${kx.toFixed(0)}|${ky.toFixed(0)}`
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
  input.joyTravel = 0
})
</script>

<style scoped lang="sass">
.stick
  pointer-events: none
// Measures the safe-area insets (read as computed padding), takes no room.
.stick__probe
  position: absolute
  width: 0
  height: 0
  visibility: hidden
  padding-left: env(safe-area-inset-left, 0px)
  padding-bottom: env(safe-area-inset-bottom, 0px)
// The base: an inked ring of pale glass, so the field shows through it.
.stick__base
  position: relative
  width: max(64px, calc(clamp(5.6rem, 30vmin, 8.4rem) * var(--hud-s, 1)))
  aspect-ratio: 1
  border-radius: 50%
  border: var(--bc-ol) solid rgba(var(--bc-white-rgb), 0.7)
  background: linear-gradient(180deg, rgba(var(--bc-white-rgb), 0.22) 0, rgba(var(--bc-white-rgb), 0.22) 46%, rgba(var(--bc-ink-rgb), 0.3) 46%, rgba(var(--bc-ink-rgb), 0.3) 100%)
  box-shadow: 0 0 0 var(--bc-ol-thin) rgba(var(--bc-ink-rgb), 0.7)
  opacity: 0.66
  transition: opacity 120ms ease-out
  will-change: transform
// The knob: a two-tone steel stud on its own shadow.
.stick__knob
  position: absolute
  inset: 28%
  border-radius: 50%
  border: var(--bc-ol) solid var(--bc-ink)
  background: linear-gradient(180deg, var(--bc-steel-hi) 0, var(--bc-steel-hi) 46%, var(--bc-steel) 46%, var(--bc-steel) 84%, var(--bc-steel-lo) 84%, var(--bc-steel-lo) 100%)
  box-shadow: 0 0.22em 0 var(--bc-ink)
  will-change: transform
  &::before
    content: ''
    position: absolute
    top: 14%
    left: 20%
    width: 34%
    height: 16%
    border-radius: var(--bc-r-pill)
    background: rgba(var(--bc-white-rgb), 0.85)
</style>
