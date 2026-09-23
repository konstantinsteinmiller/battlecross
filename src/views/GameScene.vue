<template lang="pug">
  div.scene-root
    div.canvas-host(ref="canvasHost")
    div.input-surface(ref="surface")
    div.hud-layer
      ScreenFx
      FloatingText
      Crosshair
      TargetFrame
      HudBars
      Joystick
      ActionButtons
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { app } from '@/game/engine/app'
import { attachInput } from '@/game/engine/input'
import { input, takePreparedMode, firstMissionSetup, currentMission } from '@/game/boot'
import { Mission } from '@/game/sim/mission'
import { isGamePaused } from '@/use/useGamePause'
import Joystick from '@/components/hud/Joystick.vue'
import HudBars from '@/components/hud/HudBars.vue'
import Crosshair from '@/components/hud/Crosshair.vue'
import TargetFrame from '@/components/hud/TargetFrame.vue'
import FloatingText from '@/components/hud/FloatingText.vue'
import ScreenFx from '@/components/hud/ScreenFx.vue'
import ActionButtons from '@/components/hud/ActionButtons.vue'

const canvasHost = ref<HTMLElement | null>(null)
const surface = ref<HTMLElement | null>(null)
let detachInput: (() => void) | null = null

onMounted(() => {
  if (!canvasHost.value || !surface.value) return
  app.attach(canvasHost.value)
  const mode = takePreparedMode() ?? new Mission(firstMissionSetup(), input)
  app.setMode(mode)
  detachInput = attachInput(surface.value, input, { fireMode: () => currentMission()?.wantsFire() ?? false })
  app.setSuspended(isGamePaused.value)
  app.setWanted(true)
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__game = { app, input }
})

watch(isGamePaused, (p) => app.setSuspended(p))

onUnmounted(() => {
  detachInput?.()
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
