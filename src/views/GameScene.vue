<template lang="pug">
  div.scene-root
    div.canvas-host(ref="canvasHost")
    div.input-surface(ref="surface")
    div.hud-layer
      Joystick
      div.crosshair(aria-hidden="true")
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { app } from '@/game/engine/app'
import { attachInput } from '@/game/engine/input'
import { input, takePreparedMode, firstMissionSetup } from '@/game/boot'
import { Mission } from '@/game/sim/mission'
import { isGamePaused } from '@/use/useGamePause'
import Joystick from '@/components/hud/Joystick.vue'

const canvasHost = ref<HTMLElement | null>(null)
const surface = ref<HTMLElement | null>(null)
let detachInput: (() => void) | null = null

onMounted(() => {
  if (!canvasHost.value || !surface.value) return
  app.attach(canvasHost.value)
  const mode = takePreparedMode() ?? new Mission(firstMissionSetup(), input)
  app.setMode(mode)
  detachInput = attachInput(surface.value, input, { fireMode: () => false })
  app.setSuspended(isGamePaused.value)
  app.setWanted(true)
  ;(window as unknown as Record<string, unknown>).__game = { app, input }
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
.crosshair
  position: absolute
  left: 50%
  top: 50%
  width: 10px
  height: 10px
  margin: -5px 0 0 -5px
  border-radius: 50%
  border: 2px solid rgba(255, 255, 255, 0.85)
  box-shadow: 0 0 0 2px rgba(20, 26, 51, 0.55)
</style>
