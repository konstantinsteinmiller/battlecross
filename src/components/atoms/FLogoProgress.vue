<template lang="pug">
  Transition(name="splash-fade")
    div.splash-backdrop.no-os-ui(v-if="!backdropHidden")
      div.backdrop-grid(aria-hidden="true")
  Transition(name="loader-fade")
    div.loader.no-os-ui(v-if="!done")
      div.emblem(aria-hidden="true")
        div.helm
          div.helm-stripe
          div.helm-ear.l
          div.helm-ear.r
          div.face
            div.eye.l
            div.eye.r
      h1.title(:aria-label="t('gameName')")
        span.t1 MEGA
        span.t2 ADVENTURE
      div.bar(role="progressbar" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100")
        div.cells(aria-hidden="true")
        div.lit(aria-hidden="true")
          div.fill(:style="fillStyle")
      Transition(name="hint-fade")
        div.stuck-hint(v-if="showStuckHint") {{ t('loading.tooLong') }}
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import useAssets from '@/use/useAssets'
import { stopLoading } from '@/use/useCrazyGames'
import { armFirstLoadInterstitial, notifySplashGone } from '@/use/useFirstLoadInterstitial'

/**
 * The boot splash: logo + a segmented energy bar (the classic 28-cell bar,
 * laid on its side) driven by `useAssets.preloadAssets`, which primes the 3D
 * engine — procedural meshes, baked textures and the shader compile — so the
 * first frame after the splash is a real frame, not a hitch.
 *
 * Also owns every portal "loading finished" signal (CrazyGames loadingStop,
 * Playgama / GamePix / Poki / Yandex ready), fired once the splash is gone.
 */
const { t } = useI18n()

const { loadingProgress, preloadAssets } = useAssets()
const progress = computed(() => loadingProgress.value)

// ── The bar ──
// One fill scaled by `transform`, under a static segment mask. A transform
// transition runs on the COMPOSITOR, so the bar keeps moving through a long
// main-thread task (the engine chunk evaluating, a slice that overran) where
// a per-segment class toggle would freeze.
//
// It starts exactly where the static HTML splash's creeping bar has got to,
// so the handover never jumps backwards. While nothing has reported progress
// yet (the engine chunk is still downloading) it creeps toward CREEP_TO.
const readScaleX = (el: Element | null): number => {
  if (!el) return 0
  const m = /matrix\(([^,]+)/.exec(getComputedStyle(el).transform)
  const v = m ? parseFloat(m[1]!) : 0
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0
}
const startAt = typeof document !== 'undefined' ? readScaleX(document.querySelector('#static-splash .s-fill')) : 0
const CREEP_TO = 0.14
const armed = ref(false)
const fillStyle = computed(() => {
  const real = Math.max(progress.value / 100, startAt)
  const creeping = progress.value < CREEP_TO * 100
  const target = armed.value ? (creeping ? Math.max(real, CREEP_TO) : real) : startAt
  return {
    transform: `scaleX(${target.toFixed(4)})`,
    transitionDuration: !armed.value ? '0ms' : creeping ? '3200ms' : '420ms'
  }
})

void preloadAssets()

// First-load interstitial (GameMonetize / GameDistribution / GamePix
// moderation requirement). Armed from here behind static env literals so the
// other builds dead-code-eliminate the watcher.
if (
  import.meta.env.VITE_APP_GAMEPIX === 'true'
  || import.meta.env.VITE_APP_GAME_MONETIZE === 'true'
  || import.meta.env.VITE_APP_GAME_DISTRIBUTION === 'true'
) {
  armFirstLoadInterstitial()
}

const done = ref(false)
const backdropHidden = ref(false)
const showStuckHint = ref(false)
let stuckHintId: number | null = null
const STALL_MS = 6000
let lastProgressAt = typeof performance !== 'undefined' ? performance.now() : 0
let settleFallbackId: number | null = null

onMounted(() => {
  performance.mark('boot:loader-mounted')
  // First frame at the static bar's position, then start moving.
  requestAnimationFrame(() => { armed.value = true })
  const staticSplash = document.getElementById('static-splash')
  if (staticSplash) {
    staticSplash.classList.add('hidden')
    setTimeout(() => staticSplash.remove(), 500)
  }
  // Last-resort clear. Ordered AFTER the loader's own 20 s cap so it never
  // fires first on exactly the slow devices the wait protects.
  settleFallbackId = window.setTimeout(() => {
    if (!done.value) done.value = true
  }, 22000)
  // Not on Playgama: Playables grades a clean load, and a "taking long" line
  // there reads as an error state. Everywhere else it appears only when the
  // load has actually STALLED — progress frozen for STALL_MS — never on a
  // plain timer: a slow phone loading at an honest pace is not stuck, and
  // being told to disable an ad blocker mid-load reads as the game broken.
  if (import.meta.env.VITE_APP_PLAYGAMA !== 'true') {
    stuckHintId = window.setInterval(() => {
      if (!done.value && performance.now() - lastProgressAt > STALL_MS) showStuckHint.value = true
    }, 1000)
  }
})

onUnmounted(() => {
  if (settleFallbackId !== null) clearTimeout(settleFallbackId)
  if (stuckHintId !== null) clearInterval(stuckHintId)
})

watch(progress, (val) => {
  lastProgressAt = performance.now()
  showStuckHint.value = false
  if (val < 100 || done.value) return
  // Let the fill land on the last segment before the loader fades.
  setTimeout(() => { done.value = true }, 320)
}, { immediate: true })

let cgLoadSignaled = false
const signalGameReadyToCG = () => {
  if (cgLoadSignaled) return
  cgLoadSignaled = true
  try { stopLoading() } catch (e) { console.warn('[FLogoProgress] CG ready-to-play failed', e) }
}

let playgamaLoadSignaled = false
const signalGameReadyToPlaygama = () => {
  if (playgamaLoadSignaled) return
  if (import.meta.env.VITE_APP_PLAYGAMA !== 'true') return
  playgamaLoadSignaled = true
  void import('@/utils/playgamaPlugin').then(({ playgamaGameLoadingStop }) => {
    try { playgamaGameLoadingStop() } catch (e) { console.warn('[FLogoProgress] Playgama game_ready failed', e) }
  })
}

let gamepixLoadSignaled = false
const signalGameReadyToGamepix = () => {
  if (gamepixLoadSignaled) return
  if (import.meta.env.VITE_APP_GAMEPIX !== 'true') return
  gamepixLoadSignaled = true
  void import('@/utils/gamepixPlugin').then(({ gamePixGameLoadingStop }) => {
    try { gamePixGameLoadingStop() } catch (e) { console.warn('[FLogoProgress] GamePix gameLoaded failed', e) }
  })
}

let pokiLoadSignaled = false
const signalGameReadyToPoki = () => {
  if (pokiLoadSignaled) return
  if (import.meta.env.VITE_APP_POKI !== 'true') return
  pokiLoadSignaled = true
  void import('@/utils/pokiPlugin').then(({ pokiGameLoadingFinished }) => {
    try { pokiGameLoadingFinished() } catch (e) { console.warn('[FLogoProgress] Poki gameLoadingFinished failed', e) }
  })
}

let yandexLoadSignaled = false
const signalGameReadyToYandex = () => {
  if (yandexLoadSignaled) return
  if (import.meta.env.VITE_APP_YANDEX !== 'true') return
  yandexLoadSignaled = true
  void import('@/utils/yandexPlugin').then(({ yandexLoadingReady }) => {
    try { yandexLoadingReady() } catch (e) { console.warn('[FLogoProgress] Yandex LoadingAPI.ready failed', e) }
  })
}

watch(done, (isDone) => {
  if (!isDone) return
  setTimeout(() => {
    backdropHidden.value = true
    signalGameReadyToCG()
    signalGameReadyToPlaygama()
    signalGameReadyToGamepix()
    signalGameReadyToYandex()
    signalGameReadyToPoki()
    notifySplashGone()
  }, 150)
})
</script>

<style scoped lang="sass">
.no-os-ui
  caret-color: transparent
  user-select: none
  -webkit-user-select: none
  -webkit-touch-callout: none
  -webkit-tap-highlight-color: transparent
  &, & *
    -webkit-user-drag: none

.splash-backdrop
  position: fixed
  inset: 0
  z-index: 150
  overflow: hidden
  background: radial-gradient(circle at 50% 36%, #2a63d8 0%, #12306e 55%, #0a1224 100%)

.backdrop-grid
  position: absolute
  inset: -64px 0 0 -64px
  background-image: linear-gradient(rgba(120, 210, 255, 0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(120, 210, 255, 0.12) 2px, transparent 2px)
  background-size: 64px 64px
  animation: grid-pan 6s linear infinite
  will-change: transform

@keyframes grid-pan
  to
    transform: translate3d(64px, 64px, 0)

.loader
  position: fixed
  z-index: 200
  left: 50%
  top: 50%
  transform: translate(-50%, -50%)
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.4rem, 2vmin, 0.9rem)
  width: min(88vw, 460px)

// ── CSS-drawn helmet emblem (no bitmap on the critical path) ──
.emblem
  width: clamp(88px, 26vmin, 150px)
  aspect-ratio: 1
  animation: emblem-bob 2.4s ease-in-out infinite
.helm
  position: relative
  width: 100%
  height: 100%
  border-radius: 50% 50% 46% 46%
  background: radial-gradient(circle at 35% 28%, #7fb2ff 0%, #2f73f0 38%, #1f4fc0 100%)
  border: 4px solid #141a33
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.35), inset -8px -10px 0 rgba(0, 0, 0, 0.12)
.helm-stripe
  position: absolute
  left: 50%
  top: -2%
  width: 18%
  height: 38%
  transform: translateX(-50%)
  border-radius: 40% 40% 50% 50%
  background: linear-gradient(#bff3ff, #3cc8ff)
  border: 3px solid #141a33
.helm-ear
  position: absolute
  top: 44%
  width: 26%
  aspect-ratio: 1
  border-radius: 50%
  background: radial-gradient(circle at 40% 35%, #bff3ff, #3cc8ff 60%, #1f9fd8)
  border: 4px solid #141a33
  &.l
    left: -10%
  &.r
    right: -10%
.face
  position: absolute
  left: 17%
  right: 17%
  top: 38%
  bottom: 6%
  border-radius: 38% 38% 48% 48%
  background: radial-gradient(circle at 50% 40%, #ffe0c0, #ffd2a8 60%, #f0b48c)
  border: 3px solid #141a33
.eye
  position: absolute
  top: 18%
  width: 22%
  height: 42%
  border-radius: 50%
  background: radial-gradient(circle at 50% 62%, #0b1433 0 26%, #1b6dd6 27% 48%, #fff 49%)
  border: 2px solid #141a33
  &.l
    left: 20%
  &.r
    right: 20%

@keyframes emblem-bob
  0%, 100%
    transform: translateY(0) rotate(-2deg)
  50%
    transform: translateY(-6%) rotate(2deg)

.title
  margin: 0
  display: flex
  flex-direction: column
  align-items: center
  line-height: 0.95
  font-family: var(--font-ui)
  letter-spacing: 0.02em
  text-shadow: 0 4px 0 #141a33, 0 0 18px rgba(80, 200, 255, 0.35)
  .t1
    font-size: clamp(2.2rem, 11vmin, 4.2rem)
    color: #ffffff
    -webkit-text-stroke: 2px #141a33
  .t2
    font-size: clamp(1.15rem, 5.6vmin, 2.1rem)
    color: #3cc8ff
    -webkit-text-stroke: 1.5px #141a33

// ── The 28-cell energy bar on its side ──
// Cells are a mask (28 cells, 2 px gaps), so the fill beneath can be ONE
// element animated by transform. Mirrors the static splash in index.html
// exactly: change one, change both.
.bar
  position: relative
  width: 100%
  height: clamp(16px, 3.4vmin, 24px)
  border: 3px solid #141a33
  border-radius: 6px
  background: #0b1433
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  box-sizing: border-box
.cells, .lit
  position: absolute
  inset: 3px
  -webkit-mask-image: repeating-linear-gradient(90deg, #000 0, #000 calc((100% - 54px) / 28), transparent calc((100% - 54px) / 28), transparent calc((100% - 54px) / 28 + 2px))
  mask-image: repeating-linear-gradient(90deg, #000 0, #000 calc((100% - 54px) / 28), transparent calc((100% - 54px) / 28), transparent calc((100% - 54px) / 28 + 2px))
.cells
  background: rgba(255, 255, 255, 0.08)
.lit
  overflow: hidden
.fill
  width: 100%
  height: 100%
  background: linear-gradient(#fff9c8 0%, #ffe14a 45%, #f0a800 100%)
  transform-origin: left center
  transition-property: transform
  transition-timing-function: cubic-bezier(0.2, 0.7, 0.3, 1)
  will-change: transform

.stuck-hint
  font-size: clamp(0.8rem, 3.2vmin, 1rem)
  color: #cfe8ff
  text-align: center

.splash-fade-leave-active, .loader-fade-leave-active
  transition: opacity 0.35s ease-out
.splash-fade-leave-to, .loader-fade-leave-to
  opacity: 0
.hint-fade-enter-active
  transition: opacity 0.4s
.hint-fade-enter-from
  opacity: 0

@media (prefers-reduced-motion: reduce)
  .emblem, .backdrop-grid
    animation: none
</style>
