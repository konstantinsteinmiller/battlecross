<template lang="pug">
  Transition(name="coach")
    span.coach(v-if="hint" :class="[side, { ok: approving, done: hint.done, parry: hint.id === 'parry', urgent: hint.urgent }]" aria-hidden="true")
      span.pulse
      span.closing(v-if="hint.id === 'parry'")
      span.approve(v-if="approving" :key="hint.flash")
      span.pips(v-if="!hint.done")
        span.pip(v-for="i in hint.goal" :key="i" :class="{ on: i <= hint.count }")
      GameIcon.check(v-else name="check")
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { HintView } from '@/game/sim/coach'
import GameIcon from '@/components/icons/GameIcon.vue'

/**
 * The control coach on a TOUCH button (block, slide, tank, weapon, interact):
 * a pulsing ring around the button — for the parry, a ring closing onto it,
 * which is the timing itself — pips for the uses still to go, a green flash on
 * each success and a check when it is learned. Sits inside the button, so it
 * follows the button wherever the layout puts it.
 */
const props = withDefaults(defineProps<{
  hint?: HintView
  /** Where the pips go: above the button, or on its bottom rim — the corner
   *  button, boxed in by its neighbours above and to the left. */
  side?: 'above' | 'rim'
}>(), { side: 'above' })

const approving = ref(false)
let last: number | undefined
watch(() => props.hint?.flash, (f) => {
  if (f === undefined) { last = undefined; return }
  const prev = last
  last = f
  if (prev === undefined || f <= prev) return
  approving.value = false
  requestAnimationFrame(() => {
    approving.value = true
    setTimeout(() => { approving.value = false }, 560)
  })
}, { immediate: true })
</script>

<style scoped lang="sass">
.coach
  position: absolute
  inset: 0
  pointer-events: none
.pulse
  position: absolute
  inset: -12%
  border-radius: 50%
  border: 4px solid #ffd84a
  box-shadow: 0 0 14px rgba(255, 216, 74, 0.8)
  animation: coach-pulse 1.1s ease-out infinite
.closing
  position: absolute
  inset: -40%
  border-radius: 50%
  border: 4px solid #ffffff
  animation: coach-close 1.1s ease-in infinite
.urgent .pulse
  inset: -22%
  border-width: 6px
  box-shadow: 0 0 22px rgba(255, 216, 74, 0.95)
  animation-duration: 0.8s
.ok .pulse
  border-color: #8dff7a
  box-shadow: 0 0 18px rgba(141, 255, 122, 0.95)
.approve
  position: absolute
  inset: -10%
  border-radius: 50%
  border: 5px solid #8dff7a
  box-shadow: 0 0 20px rgba(141, 255, 122, 0.9)
  animation: coach-approve 0.55s ease-out forwards
.pips
  position: absolute
  left: 50%
  bottom: calc(100% + 10px)
  transform: translateX(-50%)
  display: flex
  gap: 4px
.pip
  width: 10px
  height: 10px
  border-radius: 50%
  border: 2px solid #141a33
  background: rgba(255, 255, 255, 0.45)
  &.on
    background: #8dff7a
    box-shadow: 0 0 8px rgba(141, 255, 122, 0.9)
.check
  position: absolute
  left: 50%
  bottom: calc(100% + 6px)
  width: 30px
  height: 30px
  padding: 4px
  transform: translateX(-50%)
  border-radius: 50%
  border: 3px solid #141a33
  background: #8dff7a
  color: #141a33
.rim .pips
  bottom: -7px
.rim .check
  bottom: -12px
.coach-enter-active, .coach-leave-active
  transition: opacity 0.3s
.coach-enter-from, .coach-leave-to
  opacity: 0
@keyframes coach-pulse
  from
    transform: scale(0.95)
    opacity: 1
  to
    transform: scale(1.35)
    opacity: 0
@keyframes coach-close
  0%
    transform: scale(1)
    opacity: 0
  25%
    opacity: 1
  85%
    transform: scale(0.72)
    opacity: 1
  100%
    transform: scale(0.7)
    opacity: 0
@keyframes coach-approve
  from
    transform: scale(0.8)
    opacity: 1
  to
    transform: scale(1.45)
    opacity: 0
@media (prefers-reduced-motion: reduce)
  .pulse, .closing, .approve
    animation: none
</style>
