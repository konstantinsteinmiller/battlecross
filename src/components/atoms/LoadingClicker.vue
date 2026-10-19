<template lang="pug">
canvas.clicker(ref="el" aria-hidden="true" :class="{ on, instant }")
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * A tap-to-slash distraction for the loading screens. Pure decoration: it never gates or delays
 * the loading, and cleans up after itself when the screen leaves. The game itself is an inline
 * script in index.html (`window.__bcClicker`), already playing on the static splash's canvas:
 * this canvas takes it over where it stands. Without that script (a page that lacks it) the same
 * code is fetched as a lazy chunk instead.
 */
const props = defineProps<{ firstLoad?: boolean }>()
const el = ref<HTMLCanvasElement | null>(null)
const on = ref(false)
const instant = ref(false)
let stop: (() => void) | null = null
let alive = true

onMounted(() => {
  // F5 is a fresh page, but not a first load: the man only greets a real first visit.
  const nav = performance.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined
  const first = !!props.firstLoad && nav?.type !== 'reload'
  const inline = window.__bcClicker
  void (inline ? Promise.resolve({ mountClicker: inline.mount, isRunning: inline.running }) : import('@/utils/loadingClicker/index')).then(({ mountClicker, isRunning }) => {
    if (!alive || !el.value) return
    instant.value = isRunning()
    stop = mountClicker(el.value, { firstLoad: first })
    on.value = true
  })
})

onBeforeUnmount(() => {
  alive = false
  stop?.()
  stop = null
})
</script>


<style scoped lang="sass">
// In flow, under the progress bar (the splash's `.play` or the veil's card sets its width).
.clicker
  display: block
  aspect-ratio: 4 / 3
  opacity: 0
  transition: opacity 0.12s
  touch-action: manipulation
  user-select: none
  -webkit-user-select: none
  -webkit-tap-highlight-color: transparent
  &.on
    opacity: 1
  &.instant
    transition: none
</style>
