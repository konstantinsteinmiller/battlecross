<template lang="pug">
  div.lesson-pointer(ref="el" aria-hidden="true")
    svg(viewBox="0 0 40 40")
      path(d="M20 3 L36 21 H26.5 V37 H13.5 V21 H4 Z")
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { hud, addHudTicker } from '@/game/state/hud'
import { currentMission } from '@/game/boot'
import { promptArrow, type ArrowPose } from '@/game/sim/doorPrompt'

/**
 * The checklist's "which way" (`Mission.pointToLesson`): a blue arrow under
 * the top edge turning live toward the lesson's room for a few seconds, the
 * door prompt's arrow language. Direct style writes from the HUD ticker.
 */
const el = ref<HTMLElement | null>(null)
const pose: ArrowPose = { rot: 0, edge: 0 }
let off: (() => void) | null = null

onMounted(() => {
  off = addHudTicker(() => {
    const a = el.value
    const m = currentMission()
    if (!a) return
    const lp = m?.lessonPointer
    if (!m || !lp || m.time > lp.until || hud.phase !== 'play') {
      a.style.opacity = '0'
      return
    }
    const p = m.player
    promptArrow(lp.x, lp.z, p.x, p.z, p.yaw, pose)
    a.style.opacity = '1'
    a.style.transform = `translateX(-50%) rotate(${pose.rot.toFixed(3)}rad)`
  })
})
onUnmounted(() => off?.())
</script>

<style scoped lang="sass">
.lesson-pointer
  position: absolute
  left: 50%
  top: calc(env(safe-area-inset-top, 0px) + clamp(70px, 16vh, 120px))
  width: clamp(44px, 9vmin, 64px)
  height: clamp(44px, 9vmin, 64px)
  opacity: 0
  pointer-events: none
  transition: opacity 0.25s
  filter: drop-shadow(0 0 10px rgba(60, 200, 255, 0.9))
  svg
    width: 100%
    height: 100%
  path
    fill: #3cc8ff
    stroke: #141a33
    stroke-width: 2.5
    stroke-linejoin: round
</style>
