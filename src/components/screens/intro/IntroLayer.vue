<template lang="pug">
  div.intro(:class="{ 'is-touch': touch, 'is-ready': introView.ready }")
    div.intro__veil(:style="{ opacity: introView.veil }" aria-hidden="true")
    //- The hero's belt, as the HUD shows it: five skills, their cooldowns turning. Display only.
    div.intro__belt(v-if="introView.ready" aria-hidden="true" :class="{ 'is-mouse': !touch }")
      SkillBar
    Transition(name="intro-title")
      h1.intro__title(v-if="introView.title" :aria-label="t('gameName')")
        img.intro__wordmark(v-if="wordmark" :src="wordmark" alt="" draggable="false")
        span(v-else) {{ t('gameName') }}
    //- The narration's subtitles (always shown: the voice may be locked or muted).
    p.intro__line(aria-live="polite")
      Transition(name="intro-line" mode="out-in")
        span.intro__text(v-if="line" :key="line") {{ t(line) }}
    div.intro__skip
      button.intro__btn(
        ref="btn"
        type="button"
        data-intro-skip
        :aria-label="t('intro.skip')"
        @pointerdown.prevent="press"
        @pointerup="release"
        @pointercancel="release"
        @lostpointercapture="release"
        @contextmenu.prevent
      )
        svg.intro__ring(viewBox="0 0 44 44" aria-hidden="true" focusable="false")
          circle.intro__track(cx="22" cy="22" r="19")
          circle.intro__fill(cx="22" cy="22" r="19" :style="{ strokeDashoffset: RING * (1 - introView.skip) }")
        span.intro__label {{ t('intro.skip') }}
      span.intro__hint
        template(v-if="touch") {{ t('intro.holdTouch') }}
        I18nT(v-else keypath="intro.holdKey" tag="span" scope="global")
          template(#key)
            KeyCap(code="Space")
</template>

<script setup lang="ts">
/**
 * ─── The intro's overlay (roadmap #130) ──────────────────────────────────────
 *
 * Over the running scene (`intro/runner.ts`): the black veil, the title, the
 * narration's subtitles, the hero's skill belt, and the skip — hold Space, or
 * hold the button (finger or mouse), for 1.5 s while its ring fills; let go
 * and it drains. A lazy chunk, mounted only while the intro plays.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Translation as I18nT, useI18n } from 'vue-i18n'
import SkillBar from '@/components/hud/SkillBar.vue'
import KeyCap from '@/components/glyphs/KeyCap.vue'
import { introView, holdSkip } from '@/game/intro/runner'
import { INTRO_LINES } from '@/game/intro/script'
import { touchFirst } from '@/game/engine/input'
import { LOGO_ART } from '@/game/assets/overrides'

const { t } = useI18n()
const touch = touchFirst()
const wordmark = LOGO_ART.get('wordmark') ?? ''
/** The ring's length (2πr). */
const RING = 2 * Math.PI * 19
const btn = ref<HTMLButtonElement | null>(null)
const line = computed(() => (introView.line >= 0 ? INTRO_LINES[introView.line]!.id : ''))

const press = (e: PointerEvent): void => {
  try { btn.value?.setPointerCapture(e.pointerId) } catch { /* not capturable */ }
  holdSkip(true)
}
const release = (): void => holdSkip(false)

// Space is the skip key while the intro plays, and nothing else's: the game's
// own handlers never see it (capture phase).
const onDown = (e: KeyboardEvent): void => {
  if (e.code !== 'Space') return
  e.preventDefault()
  e.stopImmediatePropagation()
  if (!e.repeat) holdSkip(true)
}
const onUp = (e: KeyboardEvent): void => {
  if (e.code !== 'Space') return
  e.preventDefault()
  e.stopImmediatePropagation()
  holdSkip(false)
}

onMounted(() => {
  window.addEventListener('keydown', onDown, true)
  window.addEventListener('keyup', onUp, true)
  window.addEventListener('blur', release)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onDown, true)
  window.removeEventListener('keyup', onUp, true)
  window.removeEventListener('blur', release)
  holdSkip(false)
})
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.intro
  position: absolute
  inset: 0
  z-index: 40
  overflow: hidden
  font-family: var(--font-ui)
  user-select: none
  -webkit-user-select: none
  touch-action: none
.intro__veil
  position: absolute
  inset: 0
  background: #07050c
  pointer-events: none
.intro__belt
  position: absolute
  right: calc(env(safe-area-inset-right, 0px) + clamp(0.8rem, 3.4vmin, 2.2rem))
  bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(0.9rem, 5vmin, 2.4rem))
  pointer-events: none
  &.is-mouse
    right: auto
    left: 50%
    transform: translateX(-50%)
.intro__title
  position: absolute
  left: 50%
  top: 42%
  width: min(78vw, 34rem)
  margin: 0
  transform: translate(-50%, -50%)
  color: var(--bc-gold-hi, #ffe9a8)
  font-size: clamp(2rem, 9vmin, 4.4rem)
  text-align: center
  text-shadow: 0 0.08em 0 #2a1408, 0 0 0.6em rgba(255, 170, 60, 0.55)
  pointer-events: none
.intro__wordmark
  display: block
  width: 100%
  height: auto
  filter: drop-shadow(0 0.4rem 1.2rem rgba(0, 0, 0, 0.6))
.intro__line
  position: absolute
  left: 50%
  bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(7.5rem, 26vmin, 12rem))
  width: min(92vw, 44rem)
  margin: 0
  transform: translateX(-50%)
  text-align: center
  pointer-events: none
.is-touch .intro__line
  bottom: auto
  top: 64%
.intro__text
  display: inline-block
  padding: 0.35em 0.8em
  border-radius: 0.5em
  background: rgba(7, 5, 12, 0.62)
  color: #fff8e8
  font-size: clamp(1rem, 3.6vmin, 1.55rem)
  line-height: 1.3
  text-shadow: 0 0.06em 0 #000
.intro__skip
  position: absolute
  top: calc(env(safe-area-inset-top, 0px) + clamp(0.7rem, 3vmin, 1.6rem))
  right: calc(env(safe-area-inset-right, 0px) + clamp(0.7rem, 3vmin, 1.6rem))
  display: flex
  flex-direction: column
  align-items: flex-end
  gap: 0.35rem
.intro__btn
  position: relative
  display: flex
  align-items: center
  gap: 0.45rem
  min-height: 48px
  padding: 0.3rem 1rem 0.3rem 0.35rem
  border-radius: 999px
  border: var(--bc-ol-thin, 2px) solid var(--bc-ink, #1b1020)
  +cel.tone('blue')
  +cel.fill(46%, 100%)
  box-shadow: 0 3px 0 var(--bc-ink, #1b1020)
  +cel.label
  font-size: clamp(0.9rem, 3vmin, 1.15rem)
  cursor: pointer
  touch-action: none
  +cel.focus-ring
.intro__ring
  width: 38px
  height: 38px
  transform: rotate(-90deg)
.intro__track, .intro__fill
  fill: none
  stroke-width: 5
.intro__track
  stroke: rgba(0, 0, 0, 0.35)
.intro__fill
  stroke: #ffe9a8
  stroke-linecap: round
  stroke-dasharray: 119.38
.intro__hint
  padding: 0.15em 0.6em
  border-radius: 0.4em
  background: rgba(7, 5, 12, 0.55)
  color: #fff8e8
  font-size: clamp(0.72rem, 2.4vmin, 0.9rem)
.intro-title-enter-active, .intro-title-leave-active
  transition: opacity 0.6s ease
.intro-title-enter-from, .intro-title-leave-to
  opacity: 0
.intro-line-enter-active, .intro-line-leave-active
  transition: opacity 0.35s ease
.intro-line-enter-from, .intro-line-leave-to
  opacity: 0
@media (prefers-reduced-motion: reduce)
  .intro-title-enter-active, .intro-title-leave-active, .intro-line-enter-active, .intro-line-leave-active
    transition: none
</style>
