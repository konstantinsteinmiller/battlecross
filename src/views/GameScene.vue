<template lang="pug">
  div.scene-root
    div.canvas-host(ref="canvasHost")
    div.input-surface(v-show="flow.screen === 'mission'" ref="surface")
    div.hud-layer(v-if="flow.screen === 'mission'")
      ScreenFx
      FloatingText
      Crosshair
      Compass
      TargetFrame(v-if="!hud.bossName")
      BossBar
      TitleCard
      TipBubble
      HudBars
      ObjectiveTracker
      TopStatus(@pause="openPause")
      Joystick
      ContextButtons
      ActionButtons
    HubScreen(v-else-if="flow.screen === 'hub'" @options="optionsOpen = true")
    ResultsModal
    DefeatModal
    PauseModal(@options="optionsOpen = true")
    LevelUpModal
    OptionsModal(:is-open="optionsOpen" @close="optionsOpen = false")
    MissionLoading
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { app } from '@/game/engine/app'
import { attachInput } from '@/game/engine/input'
import { input, adoptBootMode, currentMission } from '@/game/boot'
import { flow, startMission, storyFor, goHub } from '@/game/flow'
import { hud } from '@/game/state/hud'
import { chargeHum } from '@/game/audio/synth'
import { isGamePaused, isAdShowing, isVisibilityHidden, isPlatformPaused } from '@/use/useGamePause'
import { isAnyModalOpen } from '@/use/useModalState'
import { isGameplayLive, syncGameplayLifecycle } from '@/use/useGameplayLifecycle'
import { startGameMusic } from '@/use/useSound'
import { registerGameCheats } from '@/game/cheats'
import Joystick from '@/components/hud/Joystick.vue'
import HudBars from '@/components/hud/HudBars.vue'
import Crosshair from '@/components/hud/Crosshair.vue'
import TargetFrame from '@/components/hud/TargetFrame.vue'
import FloatingText from '@/components/hud/FloatingText.vue'
import ScreenFx from '@/components/hud/ScreenFx.vue'
import ActionButtons from '@/components/hud/ActionButtons.vue'
import TopStatus from '@/components/hud/TopStatus.vue'
import ObjectiveTracker from '@/components/hud/ObjectiveTracker.vue'
import Compass from '@/components/hud/Compass.vue'
import ContextButtons from '@/components/hud/ContextButtons.vue'
import BossBar from '@/components/hud/BossBar.vue'
import TitleCard from '@/components/hud/TitleCard.vue'
import TipBubble from '@/components/hud/TipBubble.vue'
import HubScreen from '@/components/hub/HubScreen.vue'
import ResultsModal from '@/components/modals/ResultsModal.vue'
import DefeatModal from '@/components/modals/DefeatModal.vue'
import PauseModal from '@/components/modals/PauseModal.vue'
import LevelUpModal from '@/components/modals/LevelUpModal.vue'
import OptionsModal from '@/components/organisms/OptionsModal.vue'
import MissionLoading from '@/components/hud/MissionLoading.vue'

/**
 * The one game view. Hosts the canvas, the gesture surface and whichever UI
 * the flow is in — the mission HUD or the hub — plus every modal. Modals
 * acquire the pause gate (FModal → useModalState), and the loop is suspended
 * while any pause reason holds (ads, modals, platform pause, hidden tab).
 */
registerGameCheats()

const canvasHost = ref<HTMLElement | null>(null)
const surface = ref<HTMLElement | null>(null)
const optionsOpen = ref(false)
let detachInput: (() => void) | null = null

const openPause = () => {
  if (flow.screen === 'mission' && hud.phase === 'play' && !flow.modal) flow.modal = 'pause'
}

const onKey = (e: KeyboardEvent) => {
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (flow.modal === 'pause') flow.modal = ''
    else openPause()
  }
}

onMounted(async () => {
  if (!canvasHost.value || !surface.value) return
  app.attach(canvasHost.value)
  detachInput = attachInput(surface.value, input, { fireMode: () => currentMission()?.wantsFire() ?? false })
  app.setSuspended(isGamePaused.value)
  app.setWanted(true)
  // Music intent from the first frame; the context itself unlocks on the
  // first gesture (autoplay policy), and the gates keep it silent under ads.
  startGameMusic()
  window.addEventListener('keydown', onKey)
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__game = { app, input, flow, startMission, storyFor, goHub }
  // The loader's prepared first scene. The scene never builds its own copy
  // while the loader is still priming (see `adoptBootMode`).
  app.setMode(await adoptBootMode())
})

watch(isGamePaused, (p) => {
  app.setSuspended(p)
  // The sim is frozen, so nothing re-pitches the buster's charge hum: silence
  // it (audio itself keeps running under a modal — see `isAudioPaused`).
  if (p) chargeHum(null)
})

// The portals' gameplay bracket (CrazyGames / Poki / Playgama). The rule is in
// `isGameplayLive`; the Poki arm defers a start inside its 50 ms bad-event
// window, so a modal closing in the same breath as an ad opening is safe.
const live = computed(() => isGameplayLive({
  screen: flow.screen,
  phase: hud.phase,
  flowModal: flow.modal !== '',
  anyModalOpen: isAnyModalOpen.value,
  adShowing: isAdShowing.value,
  visibilityHidden: isVisibilityHidden.value,
  platformPaused: isPlatformPaused.value
}))
watch(live, (v) => syncGameplayLifecycle(v), { immediate: true })

onUnmounted(() => {
  syncGameplayLifecycle(false)
  detachInput?.()
  window.removeEventListener('keydown', onKey)
  app.setWanted(false)
  app.detach()
})
</script>

<style scoped lang="sass">
.scene-root
  position: fixed
  inset: 0
  overflow: hidden
  background: #0a1224
.canvas-host
  position: absolute
  inset: 0
  :deep(canvas)
    display: block
    width: 100%
    height: 100%
    touch-action: none
.input-surface
  position: absolute
  inset: 0
  touch-action: none
  -webkit-user-select: none
  user-select: none
.hud-layer
  position: absolute
  inset: 0
  pointer-events: none
</style>
