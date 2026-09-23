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
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { app } from '@/game/engine/app'
import { attachInput } from '@/game/engine/input'
import { input, takePreparedMode, fallbackMode, currentMission } from '@/game/boot'
import { flow, startMission, storyFor, goHub } from '@/game/flow'
import { hud } from '@/game/state/hud'
import { isGamePaused } from '@/use/useGamePause'
import { startGameMusic } from '@/use/useSound'
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

/**
 * The one game view. Hosts the canvas, the gesture surface and whichever UI
 * the flow is in — the mission HUD or the hub — plus every modal. Modals
 * acquire the pause gate (FModal → useModalState), and the loop is suspended
 * while any pause reason holds (ads, modals, platform pause, hidden tab).
 */
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

onMounted(() => {
  if (!canvasHost.value || !surface.value) return
  app.attach(canvasHost.value)
  app.setMode(takePreparedMode() ?? fallbackMode())
  detachInput = attachInput(surface.value, input, { fireMode: () => currentMission()?.wantsFire() ?? false })
  app.setSuspended(isGamePaused.value)
  app.setWanted(true)
  // Music intent from the first frame; the context itself unlocks on the
  // first gesture (autoplay policy), and the gates keep it silent under ads.
  startGameMusic()
  window.addEventListener('keydown', onKey)
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__game = { app, input, flow, startMission, storyFor, goHub }
})

watch(isGamePaused, (p) => app.setSuspended(p))

onUnmounted(() => {
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
