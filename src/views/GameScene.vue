<template lang="pug">
  div.scene-root
    div.canvas-host(ref="canvasHost")
    div.input-surface(v-show="!introOn && (flow.screen === 'zone' || flow.screen === 'town')" ref="surface")
    GameHud(v-if="!introOn && (flow.screen === 'zone' || flow.screen === 'town')" @options="optionsOpen = true")
    WorldMap(v-if="flow.screen === 'map'" @options="optionsOpen = true")
    //- A conversation: bubbles over the running scene, never a window.
    DialogLayer(v-if="flow.talk")
    GameModals(@options="optionsOpen = true")
    //- Mounted once first opened: its chunk is not on the first frame (#142).
    OptionsModal(v-if="optionsMounted" :is-open="optionsOpen" @close="optionsOpen = false" @intro="replayIntro")
    TravelVeil
    //- The feature lessons, over every screen (and the pacing that picks them).
    LessonLayer(v-if="!introOn")
    //- A new save picks the boy or the girl hero over the opening fight.
    HeroChoice(v-if="!introOn")
    //- The intro (#130): its own chunk, mounted only while it plays.
    IntroLayer(v-if="introOn")
    //- Debug only (the debug flag or `?perfhud=1`): what a playtest reports (#Perf1-3).
    div.perf-detail(v-if="perfLines.length")
      div(v-for="l in perfLines" :key="l") {{ l }}
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { app } from '@/game/engine/app'
import { attachInput, consumeEdges } from '@/game/engine/input'
import { loadKeyboardLayout } from '@/game/engine/keyLabels'
import { input, adoptBootMode, currentZone } from '@/game/boot'
import { flow, travel, openMap, talkTo, visitHiddenTrainer } from '@/game/flow'
import { hud } from '@/game/state/hud'
import { isFreshProfile, profile } from '@/game/state/profile'
import { talk } from '@/game/talk'
import { coach } from '@/game/coach'
import { isGamePaused, isAdShowing, isVisibilityHidden, isPlatformPaused } from '@/use/useGamePause'
import { isAnyModalOpen } from '@/use/useModalState'
import { isGameplayLive, syncGameplayLifecycle } from '@/use/useGameplayLifecycle'
import { startGameMusic } from '@/use/useSound'
import { getAudioContext } from '@/use/useAssets'
import { afterPaint, yieldToBrowser } from '@/game/engine/slicer'
import { toggleGameMute } from '@/use/useGameMute'
import { registerGameCheats } from '@/game/cheats'
import { PREVIEW_ON } from '@/game/previewFlags'
import GameHud from '@/components/hud/GameHud.vue'
import { SCREEN_CHUNKS, queueScreens } from '@/components/screens/chunks'
import { queueEarlyArt } from '@/game/assets/preload'
import { setIdleHold, startIdleQueue } from '@/utils/idleQueue'
import { exposePerf, perfHudOn, perfSnapshot } from '@/game/engine/perfReport'
import { isDebug } from '@/use/useMatch'
import { useI18n } from 'vue-i18n'
import useUser from '@/use/useUser'
import { setI18nLocale } from '@/i18n'
import GameModals from '@/components/modals/GameModals.vue'
import TravelVeil from '@/components/hud/TravelVeil.vue'
import LessonLayer from '@/components/onboarding/LessonLayer.vue'
import HeroChoice from '@/components/screens/hero/HeroChoice.vue'
import { recallHere } from '@/game/coach/onboarding'
import { useHudScale } from '@/use/useHudScale'
import { INTRO_ENABLED, INTRO_TIP, introPlaying } from '@/game/intro/state'
import { whenForcedDarkGuardClear } from '@/use/useForcedDarkModeGuard'

// The world map is a chunk of its own (see `components/screens/chunks.ts`).
const WorldMap = defineAsyncComponent(SCREEN_CHUNKS.worldMap)
// Likewise a conversation's layer and the options window (fetched with the screens).
const DialogLayer = defineAsyncComponent(SCREEN_CHUNKS.dialog)
const OptionsModal = defineAsyncComponent(SCREEN_CHUNKS.options)
// The intro's overlay (#130): fetched only when the intro plays.
const IntroLayer = defineAsyncComponent(() => import('@/components/screens/intro/IntroLayer.vue'))

/**
 * The one game view. Hosts the canvas, the gesture surface and whichever UI
 * the flow is in — the combat / town HUD or the world map — plus every modal.
 * Modals acquire the pause gate (FModal → useModalState), and the loop is
 * suspended while any pause reason holds (ads, modals, platform pause, a
 * hidden tab).
 */
registerGameCheats()
// `--hud-s`: the HUD's sizes shrink on a very small viewport (see the composable).
useHudScale()

const canvasHost = ref<HTMLElement | null>(null)
/** Frame interval (ms, the loop's running average) above which background loads wait. */
const IDLE_HOLD_MS = 34
const surface = ref<HTMLElement | null>(null)
const optionsOpen = ref(false)
const optionsMounted = ref(false)
watch(optionsOpen, (o) => { if (o) optionsMounted.value = true })

// A stored language that changes mid-session (a save hydrated late, another
// tab) is applied here. It was the options window's watch, which is no longer
// mounted before it is first opened.
const { locale } = useI18n({ useScope: 'global' })
const { userLanguage } = useUser()
watch(userLanguage, async (code: string) => {
  const appI18n = (window as unknown as { __i18n?: Parameters<typeof setI18nLocale>[0] }).__i18n
  if (appI18n) await setI18nLocale(appI18n, code)
  else locale.value = code
})
let detachInput: (() => void) | null = null

// ─── The intro (roadmap #130, `VITE_INTRO_ENABLED`) ─────────────────────────
// Off, every branch here folds away and its chunks are never fetched.
const introOn = computed(() => INTRO_ENABLED && introPlaying.value)
/** Play the intro; `next`: the scene it hands over to (its music is restored). */
const playIntro = async (next: Parameters<typeof app.setMode>[0] = null): Promise<void> => {
  if (!INTRO_ENABLED || introPlaying.value) return
  introPlaying.value = true
  try {
    const { runIntro } = await import('@/game/intro/runner')
    await runIntro(() => locale.value, next)
  } catch (e) {
    console.warn('[intro] it could not play', e)
  } finally {
    introPlaying.value = false
  }
}
/** "Watch the intro" in the options: over the place the player is in, which waits behind it. */
const replayIntro = (): void => {
  optionsOpen.value = false
  if (!INTRO_ENABLED || flow.screen === 'map') return
  flow.modal = ''
  void playIntro().then(() => { if (flow.screen === 'zone') flow.modal = 'pause' })
}

/** A key typed into a form field is text, not a game key. */
const typing = (e: KeyboardEvent): boolean => {
  const tag = (e.target as HTMLElement | null)?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

const onKey = (e: KeyboardEvent) => {
  if (typing(e)) return
  // The intro has the keys (its overlay holds Space); the speaker button still works.
  if (introOn.value && e.code !== 'F2') return
  // F1 and "?" bring the control lessons back. `e.key` so "?" is found on
  // every layout. F1 is the game's here: it never opens the browser's help.
  if (e.code === 'F1' || e.key === '?') {
    e.preventDefault()
    if (!e.repeat) { recallHere(); flow.modal = flow.modal === 'help' ? '' : flow.modal || 'help' }
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
  window.addEventListener('keydown', onKey)
  if (import.meta.env.DEV) {
    // Probe hooks for browser checks. Folds away in production.
    ;(window as unknown as Record<string, unknown>).__game = { app, input, flow, hud, profile, travel, openMap, zone: currentZone, coach, talk, talkTo, visitHiddenTrainer }
    // The recorder's scripting handle (tools/preview-video), on `?preview=1`.
    if (PREVIEW_ON) void import('@/game/previewFeed').then(m => m.installPreview())
  }
  // The loader's prepared first scene. The scene never builds its own copy
  // while the loader is still priming (see `adoptBootMode`).
  const first = await adoptBootMode()
  // A brand-new save sees the intro first (#130), the prepared first scene
  // waiting behind it. After the dark-mode notice: nothing plays under it.
  if (INTRO_ENABLED && !PREVIEW_ON && isFreshProfile() && profile.tips[INTRO_TIP] !== true) {
    await whenForcedDarkGuardClear()
    await playIntro(first)
  }
  app.setMode(first)
  app.setWanted(flow.screen !== 'map')
  // Music once the first frame is up, in the place's own track (started
  // during the loader it played the default one, then built a second song for
  // the place: two reverbs and a ~0.5 s task at 4× CPU). The audio context and
  // the song are two tasks. It still unlocks on the first gesture (autoplay
  // policy), and the gates keep it silent under ads.
  await afterPaint()
  getAudioContext()
  await yieldToBrowser()
  startGameMusic()
  // What this place does not show yet (the screens' chunks, the town's code,
  // the English fallback), one at a time in idle periods, most likely first
  // (`utils/idleQueue.ts`, roadmap #142).
  queueScreens(flow.screen === 'town' ? 'town' : 'field')
  // Then the art of what opens after the first fights, one image at a time
  // while the connection is idle (`assets/preload.ts`, D149).
  queueEarlyArt()
  // Nothing forced in while play runs under ~30 fps (#Perf1): a slow phone
  // never has an idle period, and the queue's timeout fed it ~140 loads into
  // its first fight. A pause, a menu or a result screen lets them through.
  setIdleHold(() => app.running && app.frameMs > IDLE_HOLD_MS)
  startIdleQueue()
  exposePerf()
})

// A new place re-ranks what is still waiting for its own likely next steps.
watch(() => flow.screen, (s) => { if (s === 'zone' || s === 'town') queueScreens(s === 'town' ? 'town' : 'field') })

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
  flowModal: flow.modal !== '' || flow.talk !== '' || introOn.value,
  anyModalOpen: isAnyModalOpen.value,
  adShowing: isAdShowing.value,
  visibilityHidden: isVisibilityHidden.value,
  platformPaused: isPlatformPaused.value
}))
watch(live, (v) => syncGameplayLifecycle(v), { immediate: true })

// The perf meter's second half: tier, rung, pixels, GPU (dev overlay, not player copy).
const perfLines = ref<string[]>([])
let perfTimer: ReturnType<typeof setInterval> | null = null
const showPerf = (): void => {
  const p = perfSnapshot()
  perfLines.value = [
    `${p.fps} fps · fx ${p.fx} · ${p.tier} · steady @${p.steadyAt}s`,
    `dpr ${p.dpr} · ${p.bufW}×${p.bufH} · css ${p.cssW}×${p.cssH}`,
    `${p.calls} draws · ${Math.round(p.tris / 1000)}k tris · ${p.cores} cores`,
    p.gpu
  ]
}
watch(() => isDebug.value || perfHudOn(), (on) => {
  if (perfTimer) clearInterval(perfTimer)
  perfTimer = on ? setInterval(showPerf, 1000) : null
  if (!on) perfLines.value = []
}, { immediate: true })

onUnmounted(() => {
  if (perfTimer) clearInterval(perfTimer)
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
.perf-detail
  position: fixed
  top: calc(84px + env(safe-area-inset-top, 0px))
  right: calc(12px + env(safe-area-inset-right, 0px))
  z-index: 9999
  pointer-events: none
  text-align: right
  font: 600 11px/1.3 ui-monospace, monospace
  color: rgba(226, 232, 240, 0.9)
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85)
.input-surface
  position: absolute
  inset: 0
  touch-action: none
  -webkit-user-select: none
  user-select: none
</style>
