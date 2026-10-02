<template lang="pug">
  //- Dr. Vex in the Lab after a win (#117): his broadcast, or a short hologram
  //- scene (the blueprint, the reserve, the breach). The words are in the
  //- scene bubble (SceneBubble.vue); this layer is the picture and the skip.
  div.hub-scene(v-if="hubSceneUi.active" :class="[hubSceneUi.id, { cine }]")
    HubHologram(v-if="hubSceneUi.id && hubSceneUi.id !== 'broadcast'" :id="hubSceneUi.id" :stage="hubSceneUi.stage")
    button.skip(type="button" @click="skip") {{ t('ui.skip') }}
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { flow } from '@/game/flow'
import { profile } from '@/game/state/profile'
import { isAnyModalOpen } from '@/use/useModalState'
import { isAudioPaused } from '@/use/useGamePause'
import { hubLesson } from '@/components/hub/hubLesson'
import { SECTORS } from '@/game/data/regions'
import { Scene, markVexSeen, prefetchScene, vexSeen } from '@/game/story/vexScene'
import { hubSceneFor } from '@/game/story/vexScenes'
import { hubSceneUi } from '@/game/story/hubSceneUi'
import HubHologram from './HubHologram.vue'

/**
 * The hub's voiced scenes: after a Master falls, back in the Lab, Vex
 * reacts — once ever (`vex:<boss>`, `blueprint`, `reserve`, `breach`). It
 * waits its turn behind anything else on screen (a modal, the upgrade tour,
 * a load, an ad) and Pip's notices wait for it. Skip ends it (it stays seen).
 */
const { t } = useI18n()

/** The first freed Master, in story order, whose scene has not played. */
const due = computed(() => {
  for (const s of SECTORS) {
    if (!profile.world.bosses.includes(s.boss)) continue
    const sc = hubSceneFor(s.boss)
    if (sc && !vexSeen(sc.seen)) return sc
  }
  return null
})
const free = computed(() => flow.screen === 'hub' && !flow.modal && !isAnyModalOpen.value && !flow.loading &&
  !hubLesson.step && !isAudioPaused.value)
const cine = computed(() => hubSceneUi.id !== 'broadcast')

let scene: Scene | null = null
let raf = 0
let last = 0
let wait: ReturnType<typeof setTimeout> | null = null

const loop = (now: number): void => {
  const dt = Math.min(0.1, (now - last) / 1000)
  last = now
  // The clock stops with the game (a pause, an ad, a hidden tab).
  if (scene && !isAudioPaused.value) {
    if (!scene.update(dt)) return finish()
  }
  raf = requestAnimationFrame(loop)
}

const start = (): void => {
  const sc = due.value
  if (!sc || scene) return
  markVexSeen(sc.seen)
  Object.assign(hubSceneUi, { active: true, id: sc.id, stage: '' })
  scene = new Scene(sc.beats, 'top', { onEnd: () => { /* finish() runs from the loop */ } })
  last = performance.now()
  raf = requestAnimationFrame(loop)
}

const finish = (): void => {
  cancelAnimationFrame(raf)
  scene = null
  Object.assign(hubSceneUi, { active: false, id: '', stage: '' })
}

const skip = (): void => {
  scene?.skip()
  finish()
}

// Due and free: a short beat after the Lab settles, then Vex cuts in.
watch([due, free], ([d, f]) => {
  if (d) prefetchScene(d.beats)
  if (wait) { clearTimeout(wait); wait = null }
  if (d && f && !scene) wait = setTimeout(start, 600)
}, { immediate: true })

onUnmounted(() => {
  if (wait) clearTimeout(wait)
  scene?.skip()
  finish()
})
</script>

<style scoped lang="sass">
.hub-scene
  position: absolute
  inset: 0
  z-index: 35
  pointer-events: none
  &.cine
    pointer-events: auto
.skip
  position: absolute
  right: calc(env(safe-area-inset-right, 0px) + 16px)
  bottom: calc(env(safe-area-inset-bottom, 0px) + 16px)
  pointer-events: auto
  padding: 0.45em 1.1em
  border: 2px solid #ffd35a
  border-radius: 0.8em
  background: rgba(20, 10, 16, 0.85)
  color: #fff4d6
  font-family: var(--font-ui)
  font-size: clamp(13px, 2.4vmin, 18px)
  cursor: pointer
</style>
