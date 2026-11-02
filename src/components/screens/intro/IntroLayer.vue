<template lang="pug">
  div.intro(:class="{ 'is-touch': touch, 'is-ready': introView.ready }")
    div.intro__veil(:style="{ opacity: introView.veil }" aria-hidden="true")
    //- "1 month later…" rides on the last fade to black.
    p.intro__later(:style="{ opacity: introView.label }" aria-live="polite") {{ introView.label > 0.05 ? t('intro.later') : '' }}
    div.intro__skip(v-if="!introBoot && introView.canSkip")
      button.intro__btn(
        type="button"
        data-intro-skip
        :aria-label="t('intro.skip')"
        @click="skipIntro"
      )
        span.intro__label {{ t('intro.skip') }}
        KeyCap.intro__key(v-if="!touch" code="Space")
</template>

<script setup lang="ts">
/**
 * ─── The intro's overlay (roadmap #130, the film of #183) ────────────────────
 *
 * Over the running scene (`intro/runner.ts`): the black veil, "1 month later…"
 * and the skip: one tap on the button, or Space (the key is nothing else's
 * while the film plays: the game's own handlers never see it). A lazy chunk,
 * mounted only while the intro plays.
 */
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import KeyCap from '@/components/glyphs/KeyCap.vue'
import { introView, skipIntro } from '@/game/intro/runner'
import { introBoot } from '@/game/intro/state'
import { touchFirst } from '@/game/engine/input'

const { t } = useI18n()
const touch = touchFirst()

const onDown = (e: KeyboardEvent): void => {
  if (e.code !== 'Space') return
  e.preventDefault()
  e.stopImmediatePropagation()
  if (!e.repeat && introView.canSkip) skipIntro()
}

onMounted(() => window.addEventListener('keydown', onDown, true))
onUnmounted(() => window.removeEventListener('keydown', onDown, true))
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
.intro__later
  position: absolute
  left: 50%
  top: 50%
  width: min(86vw, 36rem)
  margin: 0
  transform: translate(-50%, -50%)
  color: var(--bc-gold-hi, #ffe9a8)
  font-size: clamp(1.6rem, 7vmin, 3.2rem)
  text-align: center
  text-shadow: 0 0.08em 0 #2a1408, 0 0 0.6em rgba(255, 170, 60, 0.45)
  pointer-events: none
.intro__skip
  position: absolute
  top: calc(env(safe-area-inset-top, 0px) + clamp(0.7rem, 3vmin, 1.6rem))
  right: calc(env(safe-area-inset-right, 0px) + clamp(0.7rem, 3vmin, 1.6rem))
  display: flex
  flex-direction: column
  align-items: flex-end
  gap: 0.35rem
.intro__btn
  display: flex
  align-items: center
  gap: 0.5rem
  min-height: 48px
  padding: 0.3rem 1.1rem
  border-radius: 999px
  border: var(--bc-ol-thin, 2px) solid var(--bc-ink, #1b1020)
  +cel.tone('blue')
  +cel.fill(46%, 100%)
  box-shadow: 0 3px 0 var(--bc-ink, #1b1020)
  +cel.label
  font-size: clamp(0.9rem, 3vmin, 1.15rem)
  cursor: pointer
  +cel.focus-ring
.intro__key
  height: 1.5em
</style>
