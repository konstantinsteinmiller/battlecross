<template lang="pug">
  Transition(name="splash-fade" @after-leave="onBackdropGone")
    div.splash-backdrop.no-os-ui(v-if="!backdropHidden")
      div.backdrop-grid(ref="gridEl" aria-hidden="true")
  Transition(name="loader-fade")
    div.loader.no-os-ui(v-if="!done")
      div.card
        //- The same ONE-SVG lockup as the static splash in index.html, byte for
        //- byte (tests/ui/splashLogo.test.ts compares them): two swords crossed
        //- behind a shield over the BATTLE / CROSS wordmark, all paths,
        //- no ids (the two copies share the document during the hand-over).
        h1.logo(:aria-label="t('gameName')")
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 262" aria-hidden="true" focusable="false"><g stroke-linejoin="round"><g transform="rotate(-42 150 80)"><path d="M150 -20l9 13v82h-18V-7z" fill="#e6ebf5" stroke="#141a33" stroke-width="6"/><path d="M150 -6v76" stroke="#aeb9cf" stroke-width="3" stroke-linecap="round"/><path d="M128 75h44v10h-44z" fill="#ffd24a" stroke="#141a33" stroke-width="6"/><path d="M144 86h12v36h-12z" fill="#a8733f" stroke="#141a33" stroke-width="6"/><circle cx="150" cy="128" r="7" fill="#ffd24a" stroke="#141a33" stroke-width="6"/></g><g transform="rotate(42 150 80)"><path d="M150 -20l9 13v82h-18V-7z" fill="#e6ebf5" stroke="#141a33" stroke-width="6"/><path d="M150 -6v76" stroke="#aeb9cf" stroke-width="3" stroke-linecap="round"/><path d="M128 75h44v10h-44z" fill="#ffd24a" stroke="#141a33" stroke-width="6"/><path d="M144 86h12v36h-12z" fill="#a8733f" stroke="#141a33" stroke-width="6"/><circle cx="150" cy="128" r="7" fill="#ffd24a" stroke="#141a33" stroke-width="6"/></g><path d="M150 24l40 13v32c0 27-16 45-40 56c-24-11-40-29-40-56V37z" fill="#3f7fd6" stroke="#141a33" stroke-width="8"/><path d="M150 34l31 10v25c0 21-12 36-31 45z" fill="#2f63b8"/><path d="M150 34l31 10v25c0 21-12 36-31 45c-19-9-31-24-31-45V44z" fill="none" stroke="#ffd24a" stroke-width="3.4"/><path d="M150 48l6.5 15 15 6.5-15 6.5-6.5 15-6.5-15-15-6.5 15-6.5z" fill="#fff" stroke="#141a33" stroke-width="4"/><path d="M26.5 146V191.6M26.5 146H44.7Q56.9 146 56.9 157.4Q56.9 168.8 44.7 168.8H26.5M44.7 168.8Q56.9 168.8 56.9 180.2Q56.9 191.6 44.7 191.6H26.5M69.8 191.6L85 146L100.2 191.6M76.7 176.4H93.4M113.1 146H143.5M128.3 146V191.6M156.5 146H186.9M171.7 146V191.6M199.8 146V191.6H230.2M273.5 146H243.1V191.6H273.5M243.1 168.8H265.9" transform="matrix(1 0 -.213 1 40 0)" fill="none" stroke="#141a33" stroke-width="17" stroke-linecap="round"/><path d="M26.5 146V191.6M26.5 146H44.7Q56.9 146 56.9 157.4Q56.9 168.8 44.7 168.8H26.5M44.7 168.8Q56.9 168.8 56.9 180.2Q56.9 191.6 44.7 191.6H26.5M69.8 191.6L85 146L100.2 191.6M76.7 176.4H93.4M113.1 146H143.5M128.3 146V191.6M156.5 146H186.9M171.7 146V191.6M199.8 146V191.6H230.2M273.5 146H243.1V191.6H273.5M243.1 168.8H265.9" transform="matrix(1 0 -.213 1 40 -4)" fill="none" stroke="#ffffff" stroke-width="8.6" stroke-linecap="round"/><path d="M78.6 215.1Q78.6 206 67.9 206H59.6Q48.2 206 48.2 217.4V240.2Q48.2 251.6 59.6 251.6H67.9Q78.6 251.6 78.6 242.5M91.5 251.6V206H109.7Q121.9 206 121.9 217.4Q121.9 228.8 109.7 228.8H91.5M108.2 228.8L121.9 251.6M146.2 206H153.8Q165.2 206 165.2 217.4V240.2Q165.2 251.6 153.8 251.6H146.2Q134.8 251.6 134.8 240.2V217.4Q134.8 206 146.2 206ZM208.5 215.1Q208.5 206 197.9 206H189.5Q178.1 206 178.1 217.4Q178.1 228.8 189.5 228.8H197.1Q208.5 228.8 208.5 240.2Q208.5 251.6 197.1 251.6H188.8Q178.1 251.6 178.1 242.5M251.8 215.1Q251.8 206 241.2 206H232.8Q221.4 206 221.4 217.4Q221.4 228.8 232.8 228.8H240.4Q251.8 228.8 251.8 240.2Q251.8 251.6 240.4 251.6H232.1Q221.4 251.6 221.4 242.5" transform="matrix(1 0 -.213 1 40 0)" fill="none" stroke="#141a33" stroke-width="17" stroke-linecap="round"/><path d="M78.6 215.1Q78.6 206 67.9 206H59.6Q48.2 206 48.2 217.4V240.2Q48.2 251.6 59.6 251.6H67.9Q78.6 251.6 78.6 242.5M91.5 251.6V206H109.7Q121.9 206 121.9 217.4Q121.9 228.8 109.7 228.8H91.5M108.2 228.8L121.9 251.6M146.2 206H153.8Q165.2 206 165.2 217.4V240.2Q165.2 251.6 153.8 251.6H146.2Q134.8 251.6 134.8 240.2V217.4Q134.8 206 146.2 206ZM208.5 215.1Q208.5 206 197.9 206H189.5Q178.1 206 178.1 217.4Q178.1 228.8 189.5 228.8H197.1Q208.5 228.8 208.5 240.2Q208.5 251.6 197.1 251.6H188.8Q178.1 251.6 178.1 242.5M251.8 215.1Q251.8 206 241.2 206H232.8Q221.4 206 221.4 217.4Q221.4 228.8 232.8 228.8H240.4Q251.8 228.8 251.8 240.2Q251.8 251.6 240.4 251.6H232.1Q221.4 251.6 221.4 242.5" transform="matrix(1 0 -.213 1 40 -4)" fill="none" stroke="#ffa733" stroke-width="8.6" stroke-linecap="round"/></g></svg>
        div.bar(role="progressbar" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100")
          div.track(aria-hidden="true")
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
import { whenInteractive } from '@/use/whenInteractive'

/**
 * The boot splash: the Battlecross lockup + an amber loading bar, driven by
 * `useAssets.preloadAssets`, which primes the 3D engine — procedural meshes,
 * baked textures and the shader compile — so the first frame after the
 * splash is a real frame, not a hitch.
 *
 * Also owns every portal "loading finished" signal (CrazyGames loadingStop,
 * Playgama / GamePix / Poki / Yandex ready), fired once the splash is gone.
 */
const { t } = useI18n()

const { loadingProgress, preloadAssets } = useAssets()
const progress = computed(() => loadingProgress.value)

// ── The bar ──
// One fill scaled by `transform`, clipped by the capsule. A transform
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

// The backdrop grid pans like the static splash's. Given the static grid's
// start time, it is at the same point of the same loop, so the cross-fade
// below never shows two grids sliding against each other.
const gridEl = ref<HTMLElement | null>(null)
const continuePan = (from: Element | null, to: Element | null): void => {
  if (!from || !to || typeof from.getAnimations !== 'function') return
  const [a] = from.getAnimations()
  const [b] = to.getAnimations()
  if (a && b && a.startTime !== null) b.startTime = a.startTime
}

onMounted(() => {
  performance.mark('boot:loader-mounted')
  // First frame at the static bar's position, then start moving.
  requestAnimationFrame(() => { armed.value = true })
  const staticSplash = document.getElementById('static-splash')
  if (staticSplash) {
    continuePan(staticSplash.querySelector('.s-grid'), gridEl.value)
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
    signalGameReadyToGamepix()
    signalGameReadyToYandex()
    signalGameReadyToPoki()
    notifySplashGone()
  }, 150)
})

// PLAYGAMA fires later than the rest, on purpose: its `game_ready` is also
// YouTube Playables' `gameReady()`, which MUST NOT arrive while a
// non-interactable layer is on screen. At `done` + 150 ms the loader is still
// fading and still takes the pointer, and the backdrop has not started to go —
// so it waits for the backdrop, the last loading layer, to finish LEAVING, and
// then for the scene to take input (`whenInteractive`: the hub, or a mission
// past its scripted beam-in).
const onBackdropGone = (): void => {
  if (import.meta.env.VITE_APP_PLAYGAMA !== 'true') return
  whenInteractive(signalGameReadyToPlaygama)
}
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

// The backdrop, the lockup and the bar mirror the static splash in
// index.html rule for rule (same values, same place), so the hand-over moves
// nothing. Change one, change both: tests/ui/splashLogo.test.ts compares them.
.splash-backdrop
  position: fixed
  inset: 0
  z-index: 150
  overflow: hidden
  background: radial-gradient(circle at 50% 40%, rgba(255, 167, 51, 0.16) 0%, rgba(255, 167, 51, 0) 32%), radial-gradient(circle at 50% 40%, #1d2f63 0%, #111d42 52%, #0a1224 100%)

.backdrop-grid
  position: absolute
  inset: -64px 0 0 -64px
  background-image: linear-gradient(rgba(120, 160, 230, 0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(120, 160, 230, 0.08) 2px, transparent 2px)
  background-size: 64px 64px
  animation: grid-pan 6s linear infinite
  will-change: transform

@keyframes grid-pan
  to
    transform: translate3d(64px, 64px, 0)

// Laid out exactly like #static-splash > .s-card: a fixed layer that centres
// the column with flex. Not left/top 50% + translate(-50%): that puts the
// lockup on a half pixel through a transform, which rasterises its edges
// differently from the static copy and shows as a shimmer at the hand-over.
.loader
  position: fixed
  inset: 0
  z-index: 200
  display: flex
  align-items: center
  justify-content: center
.card
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(10px, 3vmin, 20px)
  width: min(84vw, 70vh, 420px)

// ── The lockup: one inline SVG, sized by its box ──
.logo
  margin: 0
  width: 100%
  aspect-ratio: 300 / 262
  :deep(svg)
    display: block
    width: 100%
    height: 100%

// ── The loading bar ──
// An amber fill in a graphite capsule, leaning with the wordmark. ONE fill
// element animated by transform, clipped by `.lit`; its hot top edge is the
// gloss, so the empty track stays dark and the fill reads at 12 px.
.bar
  position: relative
  width: 76%
  height: clamp(12px, 2.6vmin, 18px)
  border: 2px solid #141a33
  border-radius: 4px
  background: #161a22
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.3)
  box-sizing: border-box
  transform: skewX(-12deg)
.track, .lit
  position: absolute
  inset: 1px
  border-radius: 2px
.track
  background: linear-gradient(#232936, #161a22)
.lit
  overflow: hidden
.fill
  width: 100%
  height: 100%
  background: linear-gradient(#fff0cc 0%, #ffc768 35%, #ffa733 62%, #e27a10 100%)
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
  // The scene is live under a fading splash: the fade must not eat the
  // player's first tap.
  pointer-events: none
.splash-fade-leave-to, .loader-fade-leave-to
  opacity: 0
.hint-fade-enter-active
  transition: opacity 0.4s
.hint-fade-enter-from
  opacity: 0

@media (prefers-reduced-motion: reduce)
  .backdrop-grid
    animation: none
</style>
