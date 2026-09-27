<template lang="pug">
  Transition(name="splash-fade" @after-leave="onBackdropGone")
    div.splash-backdrop.no-os-ui(v-if="!backdropHidden")
      div.backdrop-grid(ref="gridEl" aria-hidden="true")
  Transition(name="loader-fade")
    div.loader.no-os-ui(v-if="!done")
      div.card
        //- The same ONE-SVG lockup as the static splash in index.html, byte for
        //- byte (tests/ui/splashLogo.test.ts compares them): Flux's visor head in
        //- the hex reactor badge over the MEGA / DROID wordmark, all paths,
        //- no ids (the two copies share the document during the hand-over).
        h1.logo(:aria-label="t('gameName')")
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 256" aria-hidden="true" focusable="false"><g stroke-linejoin="round"><path d="M230 70c4 7 4 14 0 20.9l-31 53.6c-4 7-10 10.5-18 10.5h-62c-8 0-14-3.5-18-10.5l-31-53.6c-4-6.9-4-13.9 0-20.9l31-53.6c4-6.9 10-10.4 18-10.4h62c8 0 14 3.5 18 10.4z" fill="#3a3f4b" stroke="#141a33" stroke-width="8"/><path d="M222 71.1c3.6 6.2 3.6 12.5 0 18.8l-27.9 48.2c-3.6 6.3-9 9.4-16.2 9.4h-55.8c-7.2 0-12.6-3.1-16.2-9.4l-27.9-48.2c-3.6-6.3-3.6-12.6 0-18.8l27.9-48.3c3.6-6.2 9-9.4 16.2-9.4h55.8c7.2 0 12.6 3.2 16.2 9.4z" fill="#252932"/><path d="M214 72.1c3.2 5.6 3.2 11.2 0 16.7l-24.8 42.9c-3.2 5.6-8 8.4-14.4 8.4h-49.6c-6.4 0-11.2-2.8-14.4-8.4l-24.8-42.9c-3.2-5.5-3.2-11.1 0-16.7l24.8-42.9c3.2-5.5 8-8.3 14.4-8.3h49.6c6.4 0 11.2 2.8 14.4 8.3z" fill="none" stroke="#ffa733" stroke-width="2.6"/><g transform="matrix(.9 0 0 .9 153 79.5)"><path d="M-56-20c-12-10-22-24-30-42c8 18 16 38 22 66zM-60-4c0-26 24-42 60-42c36 0 60 16 60 42l-60 8zM-58 8h116c0 22-14 42-34 52c-12 6-36 6-48 0c-20-10-34-30-34-52zM-68-14l68 14l68-14c1 12-1 24-7 32c-19 11-40 15-61 15c-21 0-42-4-61-15c-6-8-8-20-7-32z" fill="#141a33" stroke="#141a33" stroke-width="10"/><circle cx="-86" cy="-62" r="11.5" fill="#141a33"/><path d="M-56-20c-12-10-22-24-30-42c8 18 16 38 22 66z" fill="#c3cad4"/><path d="M-58 8h116c0 22-14 42-34 52c-12 6-36 6-48 0c-20-10-34-30-34-52z" fill="#eef0f3"/><path d="M58 10c0 20-14 40-34 50c-12 6-28 6-36 4c28-6 52-22 57-50z" fill="#c3cad4"/><path d="M-60-4c0-26 24-42 60-42c36 0 60 16 60 42l-60 8z" fill="#eef0f3"/><path d="M60-6c0-24-24-40-56-40c28 6 44 20 43 43z" fill="#c3cad4"/><path d="M-42-26c8-10 20-14 32-15" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M-68-14l68 14l68-14c1 12-1 24-7 32c-19 11-40 15-61 15c-21 0-42-4-61-15c-6-8-8-20-7-32z" fill="#161a22" stroke="#141a33" stroke-width="3.4"/><path d="M-62-9l62 13l62-13v5l-62 13l-62-13z" fill="#3a4250"/><ellipse cx="-25" cy="15" rx="11.5" ry="13" fill="#b8651a"/><ellipse cx="-25" cy="15" rx="8.6" ry="10.2" fill="#ffa733"/><ellipse cx="-28" cy="10.6" rx="2.7" ry="3.5" fill="#fff0cc"/><ellipse cx="25" cy="15" rx="11.5" ry="13" fill="#b8651a"/><ellipse cx="25" cy="15" rx="8.6" ry="10.2" fill="#ffa733"/><ellipse cx="22" cy="10.6" rx="2.7" ry="3.5" fill="#fff0cc"/><circle cx="-86" cy="-62" r="6.5" fill="#ffa733"/><circle cx="-87.8" cy="-63.8" r="2.2" fill="#fff0cc"/></g><path transform="matrix(1 0 -.213 1 28.2 147.5)" d="M0 58v-50l8-8h13l15 25.5l15-25.5h21v50l-8 8h-6.5v-44.4l-21.5 36.6l-21.5-36.6v44.4zM78 58v-50l8-8h40v12h-33.5v11h27.7v12h-27.7v11h33.5v4l-8 8zM132 58v-50l8-8h50v12h-43.5v34h29v-11h-13.3v-12h27.8v27l-8 8zM196 58v-41l17-17h26l17 17v33l-8 8h-6.5v-11.4h-31v11.4zM210.5 34.6h31v-13.4l-9.2-9.2h-12.6l-9.2 9.2z" fill="#141a33" stroke="#141a33" stroke-width="7"/><path transform="matrix(1 0 -.213 1 28.2 143)" d="M0 58v-50l8-8h13l15 25.5l15-25.5h21v50l-8 8h-6.5v-44.4l-21.5 36.6l-21.5-36.6v44.4zM78 58v-50l8-8h40v12h-33.5v11h27.7v12h-27.7v11h33.5v4l-8 8zM132 58v-50l8-8h50v12h-43.5v34h29v-11h-13.3v-12h27.8v27l-8 8zM196 58v-41l17-17h26l17 17v33l-8 8h-6.5v-11.4h-31v11.4zM210.5 34.6h31v-13.4l-9.2-9.2h-12.6l-9.2 9.2z" fill="#eef0f3" stroke="#141a33" stroke-width="7" paint-order="stroke"/><path d="M68.4 211h172l-8.8 41h-172z" fill="#161a22" stroke="#141a33" stroke-width="6"/><path d="M70.6 214.4h166" stroke="#3a4250" stroke-width="2.4"/><path transform="matrix(1 0 -.213 1 79 217.5)" d="M0 28v-24l4-4h14.6l7.8 7.8v12.4l-7.8 7.8zM7 22h10.2l2.2-2.2v-11.6l-2.2-2.2h-10.2zM35.3 28v-24l4-4h14.6l7.8 7.8v3.6l-7.8 7.8h-1.1l8.9 8.8h-8.9l-8-8.8h-2.5v8.8zM42.3 13.2h9.1l3.3-3.2v-.8l-3.3-3.2h-9.1zM70.5 20.2v-12.4l7.8-7.8h11.8l7.8 7.8v12.4l-7.8 7.8h-11.8zM77.5 19.8l2.2 2.2h9l2.2-2.2v-11.6l-2.2-2.2h-9l-2.2 2.2zM106.8 28v-24l4-4h3v24l-4 4zM123.6 28v-24l4-4h14.6l7.8 7.8v12.4l-7.8 7.8zM130.6 22h10.2l2.2-2.2v-11.6l-2.2-2.2h-10.2z" fill="#ffa733"/></g></svg>
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
 * The boot splash: the Mega Droid lockup + an amber plasma bar, driven by
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
  aspect-ratio: 300 / 256
  :deep(svg)
    display: block
    width: 100%
    height: 100%

// ── The plasma bar ──
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
