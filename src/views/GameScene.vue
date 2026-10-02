<template lang="pug">
  div.scene-root
    div.canvas-host(ref="canvasHost")
    div.input-surface(v-show="flow.screen === 'zone' || flow.screen === 'town'" ref="surface")
    GameHud(v-if="flow.screen === 'zone' || flow.screen === 'town'" @options="optionsOpen = true")
    WorldMap(v-if="flow.screen === 'map'" @options="optionsOpen = true")
    //- A conversation: bubbles over the running scene, never a window.
    DialogLayer(v-if="flow.talk")
    GameModals(@options="optionsOpen = true")
    OptionsModal(:is-open="optionsOpen" @close="optionsOpen = false")
    TravelVeil
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { app } from '@/game/engine/app'
import { attachInput, consumeEdges } from '@/game/engine/input'
import { loadKeyboardLayout } from '@/game/engine/keyLabels'
import { input, adoptBootMode, currentZone } from '@/game/boot'
import { flow, travel, openMap, talkTo, visitHiddenTrainer } from '@/game/flow'
import { hud } from '@/game/state/hud'
import { profile } from '@/game/state/profile'
import { talk } from '@/game/talk'
import { coach } from '@/game/coach'
import { isGamePaused, isAdShowing, isVisibilityHidden, isPlatformPaused } from '@/use/useGamePause'
import { isAnyModalOpen } from '@/use/useModalState'
import { isGameplayLive, syncGameplayLifecycle } from '@/use/useGameplayLifecycle'
import { startGameMusic } from '@/use/useSound'
import { toggleGameMute } from '@/use/useGameMute'
import { registerGameCheats } from '@/game/cheats'
import { PREVIEW_ON } from '@/game/previewFlags'
import GameHud from '@/components/hud/GameHud.vue'
import WorldMap from '@/components/screens/WorldMap.vue'
import GameModals from '@/components/modals/GameModals.vue'
import DialogLayer from '@/components/dialog/DialogLayer.vue'
import TravelVeil from '@/components/hud/TravelVeil.vue'
import OptionsModal from '@/components/organisms/OptionsModal.vue'

/**
 * The one game view. Hosts the canvas, the gesture surface and whichever UI
 * the flow is in — the combat / town HUD or the world map — plus every modal.
 * Modals acquire the pause gate (FModal → useModalState), and the loop is
 * suspended while any pause reason holds (ads, modals, platform pause, a
 * hidden tab).
 */
registerGameCheats()

const canvasHost = ref<HTMLElement | null>(null)
const surface = ref<HTMLElement | null>(null)
const optionsOpen = ref(false)
let detachInput: (() => void) | null = null

/** A key typed into a form field is text, not a game key. */
const typing = (e: KeyboardEvent): boolean => {
  const tag = (e.target as HTMLElement | null)?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

const onKey = (e: KeyboardEvent) => {
  if (typing(e)) return
  // F1 and "?" bring the control lessons back. `e.key` so "?" is found on
  // every layout. F1 is the game's here: it never opens the browser's help.
  if (e.code === 'F1' || e.key === '?') {
    e.preventDefault()
    if (!e.repeat) { coach.recallAll(); flow.modal = flow.modal === 'help' ? '' : flow.modal || 'help' }
    return
  }
  // F2 is the speaker button, on every screen. Not under an ad — the ad's
  // audio gate owns the sound then.
  if (e.code === 'F2') {
    e.preventDefault()
    if (!e.repeat && !isAdShowing.value) toggleGameMute()
    return
  }
  // Esc closes whatever is on top; with nothing open it pauses (the scene's
  // own input reads Esc / P for that) — and closes the pause menu again.
  if (e.code === 'Escape' && !e.repeat) {
    if (optionsOpen.value) { optionsOpen.value = false; return }
    if (flow.modal === 'pause' || flow.modal === 'character' || flow.modal === 'skills' || flow.modal === 'inventory' || flow.modal === 'help') flow.modal = ''
  }
}

onMounted(async () => {
  if (!canvasHost.value || !surface.value) return
  app.attach(canvasHost.value)
  detachInput = attachInput(surface.value, input)
  void loadKeyboardLayout()
  app.setSuspended(isGamePaused.value)
  // Music intent from the first frame; the context itself unlocks on the
  // first gesture (autoplay policy), and the gates keep it silent under ads.
  startGameMusic()
  window.addEventListener('keydown', onKey)
  if (import.meta.env.DEV) {
    // Probe hooks for browser checks. Folds away in production.
    ;(window as unknown as Record<string, unknown>).__game = { app, input, flow, hud, profile, travel, openMap, zone: currentZone, coach, talk, talkTo, visitHiddenTrainer }
    // The recorder's scripting handle (tools/preview-video), on `?preview=1`.
    if (PREVIEW_ON) void import('@/game/previewFeed').then(m => m.installPreview())
  }
  // The loader's prepared first scene. The scene never builds its own copy
  // while the loader is still priming (see `adoptBootMode`).
  app.setMode(await adoptBootMode())
  app.setWanted(flow.screen !== 'map')
})

watch(isGamePaused, (p) => {
  // Whatever was pressed while the game stood still is not an order: the Esc
  // that CLOSED the pause menu must not be read as the Esc that opens it.
  if (!p) consumeEdges(input)
  app.setSuspended(p)
})

// The portals' gameplay bracket (CrazyGames / Poki / Playgama). The rule is in
// `isGameplayLive`; the Poki arm defers a start inside its 50 ms bad-event
// window, so a modal closing in the same breath as an ad opening is safe.
const live = computed(() => isGameplayLive({
  screen: flow.screen,
  phase: hud.phase,
  // A conversation is not gameplay either (in a zone it is the quest's decision).
  flowModal: flow.modal !== '' || flow.talk !== '',
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
  background: #1b1626
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
</style>
