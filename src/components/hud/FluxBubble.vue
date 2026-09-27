<template lang="pug">
  div.flux-say(aria-live="polite")
    div.bubble(v-if="line && hud.phase === 'play'" :key="seq" :class="{ leaving }")
      span.say-text {{ t(line) }}
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud, addHudTicker } from '@/game/state/hud'
import { FUMBLE_BUBBLE } from '@/game/sim/fumble'

/**
 * Flux's speech bubble: a short comic line by his buster arm (bottom right,
 * clear of the touch buttons) when a hard hit shakes his charge loose
 * (`sim/fumble.ts`). It pops in with a bounce, holds `FUMBLE_BUBBLE` and
 * fades. The clock is the HUD ticker's, so a pause holds it too.
 */
const { t } = useI18n()
/** How long the fade at the end of the hold takes (s). */
const FADE = 0.18
const line = ref('')
const seq = ref(0)
const leaving = ref(false)
let age = 0
let off: (() => void) | null = null

watch(() => hud.saySeq, () => {
  if (!hud.sayKey) return
  line.value = hud.sayKey
  seq.value = hud.saySeq
  leaving.value = false
  age = 0
})

onMounted(() => {
  off = addHudTicker((dt) => {
    if (!line.value) return
    age += dt
    if (age >= FUMBLE_BUBBLE) {
      line.value = ''
      leaving.value = false
    } else if (!leaving.value && age >= FUMBLE_BUBBLE - FADE) leaving.value = true
  })
})
onUnmounted(() => off?.())
</script>

<style scoped lang="sass">
.flux-say
  position: absolute
  right: calc(env(safe-area-inset-right, 0px) + clamp(64px, 16vmin, 180px))
  // Tall phones: up off the gel button and its pips.
  bottom: calc(env(safe-area-inset-bottom, 0px) + max(clamp(150px, 36vmin, 290px), 24vh))
  display: flex
  justify-content: flex-end
  width: min(56vw, 250px)
  pointer-events: none
  z-index: 2
.bubble
  position: relative
  padding: 0.42em 0.8em 0.46em
  background: #ffffff
  color: #141a33
  border: 3px solid #141a33
  border-radius: 1.1em
  box-shadow: 0 4px 0 rgba(20, 26, 51, 0.45)
  font-family: var(--font-ui)
  font-size: clamp(13px, 2.8vmin, 20px)
  line-height: 1.15
  text-align: center
  transform-origin: 80% 120%
  animation: say-pop 0.34s cubic-bezier(0.2, 1.5, 0.45, 1) both
  transition: opacity 0.18s
  // The tail, down toward the buster.
  &::after
    content: ''
    position: absolute
    right: 20%
    bottom: -10px
    width: 14px
    height: 14px
    background: #ffffff
    border-right: 3px solid #141a33
    border-bottom: 3px solid #141a33
    transform: rotate(30deg) skewX(12deg)
  &.leaving
    opacity: 0
// Two lines at most, whatever the language.
.say-text
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
  overflow: hidden
  overflow-wrap: anywhere
@keyframes say-pop
  0%
    transform: scale(0.2) rotate(-8deg)
    opacity: 0
  55%
    transform: scale(1.14) rotate(3deg)
    opacity: 1
  80%
    transform: scale(0.95) rotate(-1deg)
  100%
    transform: scale(1) rotate(0)
</style>
