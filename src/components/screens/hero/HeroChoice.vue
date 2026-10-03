<template lang="pug">
  Transition(name="hero-choice")
    div.hero-choice(
      v-if="stage === 'open' || stage === 'picked'"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hero-choice-title"
      :class="{ 'is-picked': stage === 'picked', 'is-low': low }"
      data-coach="hero-choice"
    )
      div.hero-choice__spot(aria-hidden="true")
      h2#hero-choice-title.hero-choice__title
        span.hero-choice__title-body {{ t('heroChoice.title') }}
      div.hero-choice__cards
        button.hero-choice__card(
          v-for="(g, i) in HERO_GENDERS"
          :key="g"
          :ref="(el) => setCard(i, el)"
          type="button"
          :data-hero="g"
          :class="[`is-${g}`, { 'is-chosen': picked === g, 'is-other': picked !== '' && picked !== g }]"
          :style="{ '--i': i }"
          :aria-label="t(g === 'f' ? 'heroChoice.girl' : 'heroChoice.boy')"
          :aria-pressed="picked === g"
          @click="choose(g)"
          @keydown="onKey($event, i)"
        )
          span.hero-choice__rays(aria-hidden="true")
          span.hero-choice__face
            Portrait(:look="heroPortraitId(outfit, g)" :ring="g === 'f' ? 'var(--bc-pink-hi)' : 'var(--bc-blue-hi)'")
          span.hero-choice__plinth(aria-hidden="true")
</template>

<script setup lang="ts">
/**
 * ─── The hero choice (roadmap #71) ───────────────────────────────────────────
 *
 * The first thing a brand-new save is asked, over the opening fight it boots
 * into (there is no main menu): the boy hero or the girl hero, two painted
 * portraits, one tap. The pick pops, sparks, swaps the hero in the scene
 * behind, is saved, and the overlay leaves; the dummy beat and the first
 * lesson start after it. A returning save never sees it, and the pick can be
 * changed on the character page.
 *
 * WHEN is `game/heroChoice.ts`. While it is up the game holds still (the
 * modal pause), so the portals' gameplay bracket stays closed until the
 * player has acted: the tap on a portrait is the trusted gesture Poki's
 * `gameplayStart` waits for.
 */
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Portrait from '@/components/art/Portrait.vue'
import { HERO_GENDERS, heroOutfit, heroPortraitId, type HeroGender } from '@/game/art/heroPortrait'
import { heroChoice, heroChoiceShown } from '@/game/heroChoice'
import { flow } from '@/game/flow'
import { currentZone } from '@/game/boot'
import { needsHeroChoice, pickHero, profile } from '@/game/state/profile'
import { heroLook } from '@/game/gfx/rigs/looks'
import { prewarmLook } from '@/game/gfx/rigs'
import { sceneQuality } from '@/game/engine/quality'
import { sfx } from '@/game/audio/sfx'
import { isAdShowing } from '@/use/useGamePause'
import { acquireModalOpen } from '@/use/useModalState'
import { isForcedDarkBlocking } from '@/use/useForcedDarkModeGuard'
import { burst, prefersReducedMotion } from '@/components/game/fx'

const { t } = useI18n()
const low = sceneQuality() === 'low'

/** wait: owed, not on screen yet (the loader, an ad); open: asking; picked:
 *  the pop plays; done: answered (the overlay leaves). */
type Stage = 'wait' | 'open' | 'picked' | 'done'
const stage = ref<Stage>('wait')
const picked = ref<HeroGender | ''>('')
const cards: Array<HTMLButtonElement | null> = []
const setCard = (i: number, el: unknown): void => { cards[i] = el instanceof HTMLButtonElement ? el : null }
/** The portraits wear what the hero wears (a new save: the starter tunic). */
const outfit = computed(() => heroOutfit(profile.inv.equipped))

// ── The loader has left ──────────────────────────────────────────────────────
// Three layers load: the static splash in index.html, the loader card and
// its backdrop (`FLogoProgress`). Once all are gone (the backdrop may still
// be fading, no longer taking input) the scene is the backdrop.
const SPLASH_CAP_MS = 20000
const splashGone = ref(false)
const t0 = performance.now()
const splashLeft = (): boolean => {
  const fixed = document.getElementById('static-splash')
  if (fixed && !fixed.classList.contains('hidden')) return false
  if (document.querySelector('.loader')) return false
  const el = document.querySelector('.splash-backdrop')
  return !el || getComputedStyle(el).pointerEvents === 'none'
}
let pollId = 0
const poll = (): void => {
  if (splashLeft() || performance.now() - t0 > SPLASH_CAP_MS) { splashGone.value = true; return }
  pollId = window.setTimeout(poll, 120)
}

const shown = computed(() => heroChoiceShown({
  needs: needsHeroChoice(),
  screen: flow.screen,
  node: flow.node,
  loading: flow.loading,
  splashGone: splashGone.value,
  adShowing: isAdShowing.value,
  darkBlocking: isForcedDarkBlocking.value
}))
// Only a new save on its opening fight is ever owed the choice: everyone else
// pays for one DOM check, once.
if (needsHeroChoice()) poll()

watch(shown, (on) => {
  if (on && stage.value === 'wait') open()
  // An ad (or the dark-mode notice) took the screen, or a cloud save landed
  // and this is a returning player after all: step aside.
  else if (!on && stage.value === 'open') stage.value = needsHeroChoice() ? 'wait' : 'done'
}, { immediate: true })

// ── The pause it holds ───────────────────────────────────────────────────────
let release: (() => void) | null = null
watch(stage, (s) => {
  const holding = s === 'open' || s === 'picked'
  heroChoice.open = holding
  if (holding && !release) release = acquireModalOpen()
  else if (!holding && release) { release(); release = null }
})

let warmed = false
const open = (): void => {
  stage.value = 'open'
  void nextTick(() => cards[0]?.focus({ preventScroll: true }))
  if (warmed) return
  warmed = true
  // The girl hero's rig, built while the player looks (the boy's was built
  // with the scene): the pick then swaps without a hitch.
  window.setTimeout(() => {
    try { prewarmLook(heroLook(profile.inv.equipped, 'f')) } catch { /* built on the pick instead */ }
  }, 250)
}

let doneTimer = 0
const choose = (g: HeroGender): void => {
  if (stage.value !== 'open') return
  picked.value = g
  stage.value = 'picked'
  sfx('uiChoice')
  const card = cards[HERO_GENDERS.indexOf(g)]
  burst(card?.querySelector('.hero-choice__face'), g === 'f' ? 'var(--bc-pink-hi)' : 'var(--bc-blue-hi)', true)
  pickHero(g)
  try { currentZone()?.restyleHero() } catch (e) { console.warn('[hero-choice] the hero could not be rebuilt', e) }
  // The pop plays, then the overlay leaves and the fight begins.
  doneTimer = window.setTimeout(() => { stage.value = 'done' }, prefersReducedMotion() ? 120 : 640)
}

/** Left / right move between the two portraits; Enter and Space pick (a button's own). */
const onKey = (e: KeyboardEvent, i: number): void => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  e.preventDefault()
  cards[(i + 1) % HERO_GENDERS.length]?.focus()
}

onUnmounted(() => {
  window.clearTimeout(pollId)
  window.clearTimeout(doneTimer)
  heroChoice.open = false
  release?.()
  release = null
})
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.hero-choice
  --card: clamp(6.5rem, min(36vw, 36vh), 15rem)
  position: fixed
  inset: 0
  // Over the lessons, under the travel veil and the system layers.
  z-index: calc(var(--bc-z-modal) + 8)
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: clamp(0.8rem, 4vmin, 2.2rem)
  padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left))
  background: radial-gradient(ellipse 80% 70% at 50% 55%, rgba(var(--bc-ink-rgb), 0.28) 0, rgba(var(--bc-ink-rgb), 0.78) 100%)
  backdrop-filter: blur(3px) saturate(1.15)
  -webkit-backdrop-filter: blur(3px) saturate(1.15)
  user-select: none
  -webkit-user-select: none
  -webkit-touch-callout: none
  &.is-low
    backdrop-filter: none
    -webkit-backdrop-filter: none
    background: radial-gradient(ellipse 80% 70% at 50% 55%, rgba(var(--bc-ink-rgb), 0.4) 0, rgba(var(--bc-ink-rgb), 0.84) 100%)

// A warm pool of light the two of them stand in.
.hero-choice__spot
  position: absolute
  left: 50%
  top: 55%
  width: min(150vw, 70rem)
  aspect-ratio: 2
  transform: translate(-50%, -50%)
  background: radial-gradient(closest-side, rgba(255, 214, 120, 0.22), rgba(255, 214, 120, 0) 100%)
  pointer-events: none

// ── The title: a gold ribbon ────────────────────────────────────────────────
.hero-choice__title
  position: relative
  margin: 0
  +cel.tone('gold')
  animation: title-drop 520ms var(--bc-ease-pop) both
.hero-choice__title-body
  display: block
  padding: 0.28em 1.3em 0.36em
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  +cel.fill(48%, 84%)
  box-shadow: 0 var(--bc-press) 0 var(--bc-ink), 0 0.6rem 1.4rem rgba(var(--bc-ink-rgb), 0.45)
  +cel.label
  font-size: clamp(1.15rem, 5.2vmin, 2.1rem)
  line-height: 1.1
  letter-spacing: 0.02em
  text-align: center
  white-space: nowrap

// ── The two of them ─────────────────────────────────────────────────────────
.hero-choice__cards
  position: relative
  display: flex
  align-items: flex-end
  justify-content: center
  gap: clamp(1rem, 7vmin, 4.5rem)
.hero-choice__card
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  width: var(--card)
  padding: 0
  border: 0
  border-radius: 50%
  background: none
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  // In one after the other, with a bounce; then a slow bob, out of step.
  animation: card-in 560ms var(--bc-ease-bounce) both, card-bob 2.8s ease-in-out infinite
  animation-delay: calc(140ms + var(--i) * 110ms), calc(700ms + var(--i) * 1.4s)
  &:focus
    outline: none
  &:focus-visible .hero-choice__face
    box-shadow: var(--bc-focus)
  &:disabled
    cursor: default
.hero-choice__face
  position: relative
  z-index: 1
  display: block
  width: 100%
  border-radius: 50%
  filter: drop-shadow(0 0.45rem 0 rgba(var(--bc-ink-rgb), 0.45))
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), filter 200ms ease-out
  :deep(.portrait)
    box-shadow: inset 0 0 0 0.3em var(--ring), 0 0 0 0.22em var(--bc-ink), 0 0.3em 0 0.22em var(--bc-ink)
// Hover lifts a portrait (a mouse); a press squashes it.
@media (hover: hover)
  .hero-choice__card:hover:not(:disabled) .hero-choice__face
    transform: translateY(-6%) scale(1.05)
.hero-choice__card:active:not(:disabled) .hero-choice__face
  transition-duration: var(--bc-t-press)
  transform: translateY(3%) scale(1.03, 0.95)
// Slow light rays turning behind each portrait.
.hero-choice__rays
  position: absolute
  left: 50%
  top: 50%
  width: 150%
  aspect-ratio: 1
  margin: -75% 0 0 -75%
  border-radius: 50%
  background: repeating-conic-gradient(from 0deg, rgba(255, 236, 170, 0.2) 0deg 9deg, rgba(255, 236, 170, 0) 9deg 30deg)
  mask-image: radial-gradient(closest-side, black 35%, transparent 100%)
  -webkit-mask-image: radial-gradient(closest-side, black 35%, transparent 100%)
  animation: rays 18s linear infinite
  pointer-events: none
  opacity: 0.8
.hero-choice__card.is-f .hero-choice__rays
  animation-direction: reverse
// The ground under their feet.
.hero-choice__plinth
  display: block
  width: 70%
  height: calc(var(--card) * 0.09)
  margin-top: calc(var(--card) * -0.02)
  border-radius: 50%
  background: radial-gradient(closest-side, rgba(var(--bc-ink-rgb), 0.55), rgba(var(--bc-ink-rgb), 0))

// ── The pick ────────────────────────────────────────────────────────────────
.hero-choice__card.is-chosen
  animation: none
  .hero-choice__face
    animation: chosen 560ms var(--bc-ease-pop) both
    filter: drop-shadow(0 0 1.2rem rgba(255, 233, 120, 0.85)) drop-shadow(0 0.45rem 0 rgba(var(--bc-ink-rgb), 0.45))
  .hero-choice__rays
    opacity: 1
    animation-duration: 3s
.hero-choice__card.is-other
  animation: none
  opacity: 0.25
  transform: scale(0.84)
  filter: saturate(0.3)
  transition: opacity 260ms ease-out, transform 260ms ease-out, filter 260ms ease-out
.hero-choice.is-picked .hero-choice__title
  animation: title-nod 420ms var(--bc-ease-pop) both

// The low tier: no turning rays, no bob.
.hero-choice.is-low
  .hero-choice__rays
    display: none
  .hero-choice__card
    animation: card-in 480ms var(--bc-ease-bounce) both
    animation-delay: calc(120ms + var(--i) * 100ms)

// ── Leaving ─────────────────────────────────────────────────────────────────
.hero-choice-enter-active
  transition: opacity 260ms ease-out
.hero-choice-leave-active
  transition: opacity 340ms ease-in
.hero-choice-enter-from, .hero-choice-leave-to
  opacity: 0

@keyframes title-drop
  from
    transform: translateY(-60%) scale(0.7)
    opacity: 0
  to
    transform: none
    opacity: 1
@keyframes title-nod
  40%
    transform: scale(1.08)
  to
    transform: scale(1)
@keyframes card-in
  from
    transform: translateY(18%) scale(0.4)
    opacity: 0
  to
    transform: none
    opacity: 1
@keyframes card-bob
  0%, 100%
    translate: 0 0
  50%
    translate: 0 -3%
@keyframes chosen
  0%
    transform: scale(1)
  30%
    transform: scale(1.24, 1.12)
  55%
    transform: scale(1.08, 1.18)
  100%
    transform: scale(1.14)
@keyframes rays
  to
    transform: rotate(360deg)

@media (prefers-reduced-motion: reduce)
  .hero-choice__card, .hero-choice__title, .hero-choice__rays, .hero-choice__card.is-chosen .hero-choice__face
    animation: none !important

// A short landscape phone: the title tucks in, the portraits take the height.
@media (max-height: 26rem) and (min-aspect-ratio: 1/1)
  .hero-choice
    --card: clamp(6rem, 52vh, 12rem)
    gap: 0.6rem
</style>
