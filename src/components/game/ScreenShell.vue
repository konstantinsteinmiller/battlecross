<template lang="pug">
  //- Teleport to body so `position: fixed` is not trapped by an ancestor
  //- transform (the HUD layer scales).
  Teleport(to="body")
    Transition(name="screen" appear)
      div.screen(:class="`screen--${art}`" role="dialog" aria-modal="true" :aria-label="label")
        ScreenBackdrop(:name="art")
        header.screen__bar
          div.screen__lead
            slot(name="lead")
          div.screen__tail
            slot(name="tail")
            button.screen__close(type="button" :aria-label="t('close')" @click="onClose")
              span.screen__close-shadow(aria-hidden="true")
              span.screen__close-body
                GameIcon.screen__close-icon(name="close")
        div.screen__body
          slot
</template>

<script setup lang="ts">
/**
 * ─── A full screen (D38 to D40) ──────────────────────────────────────────────
 *
 * The trade table and the hero's book are not windows in a box: they take the
 * whole screen, over an illustrated backdrop. This is their shared shell — the
 * backdrop, a bar across the top (the page tabs or the two parties on the
 * left, the purse and the close button on the right) and the body under it.
 *
 * It is a modal like `FModal`: it holds the pause gate while it is up
 * (`acquireModalOpen`: the game loop stands still behind it), plays the
 * window's open and close sounds, and Esc closes it.
 */
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import { sfx } from '@/game/audio/sfx'
import { acquireModalOpen } from '@/use/useModalState'
import ScreenBackdrop from './ScreenBackdrop.vue'
import type { BackdropName } from './backdrops'

defineProps<{
  /** Which backdrop lies behind it. */
  art: BackdropName
  /** The screen's accessible name. */
  label: string
}>()
const emit = defineEmits<{ (e: 'close'): void }>()
const { t } = useI18n()

const onClose = (): void => {
  sfx('uiClick')
  emit('close')
}

const onKey = (e: KeyboardEvent): void => {
  if (e.code !== 'Escape' || e.repeat) return
  // The key that closes the screen is not also an answer to whatever is
  // under it (the conversation a shop was opened from).
  e.stopPropagation()
  emit('close')
}

let release: (() => void) | null = null
onMounted(() => {
  release = acquireModalOpen()
  sfx('uiOpen')
  window.addEventListener('keydown', onKey, true)
})
onUnmounted(() => {
  release?.()
  release = null
  sfx('uiClose')
  window.removeEventListener('keydown', onKey, true)
})
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.screen
  --screen-pad: clamp(0.4rem, 1.8vmin, 0.9rem)
  --screen-close: clamp(2.75rem, 10vmin, 3.1rem)
  position: fixed
  inset: 0
  z-index: var(--bc-z-modal)
  display: flex
  flex-direction: column
  gap: var(--screen-pad)
  padding: calc(env(safe-area-inset-top, 0px) + var(--screen-pad)) calc(env(safe-area-inset-right, 0px) + var(--screen-pad)) calc(env(safe-area-inset-bottom, 0px) + var(--screen-pad)) calc(env(safe-area-inset-left, 0px) + var(--screen-pad))
  font-family: var(--font-ui)
  color: var(--bc-text)
  // Nothing on a screen is selected by a long press or dragged off as an image.
  user-select: none
  -webkit-user-select: none
  -webkit-touch-callout: none
  :deep(img), :deep(svg)
    -webkit-user-drag: none

.screen__bar
  position: relative
  z-index: 3
  display: flex
  align-items: center
  gap: var(--screen-pad)
  flex: 0 0 auto
  min-height: var(--screen-close)
.screen__lead
  flex: 1 1 auto
  min-width: 0
.screen__tail
  display: flex
  align-items: center
  gap: var(--screen-pad)
  flex: 0 0 auto

.screen__body
  position: relative
  z-index: 2
  flex: 1 1 auto
  min-height: 0
  display: flex
  flex-direction: column

// ── The close button (the window's own, at a touch size) ─────────────────────
.screen__close
  +cel.tone('red')
  position: relative
  flex: 0 0 auto
  width: var(--screen-close)
  height: var(--screen-close)
  padding: 0
  border: 0
  border-radius: var(--bc-r-md)
  background: none
  cursor: pointer
  -webkit-tap-highlight-color: transparent
  +cel.focus-ring
  &:hover .screen__close-body
    filter: brightness(1.08)
  &:active .screen__close-body
    transition-duration: var(--bc-t-press)
    transition-timing-function: ease-out
    transform: translateY(var(--bc-press-sm)) scale(1.04, 0.92)
.screen__close-shadow
  position: absolute
  inset: 0
  transform: translateY(var(--bc-press-sm))
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  background-color: var(--c-deep)
.screen__close-body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  width: 100%
  height: 100%
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  +cel.fill(48%, 88%)
  color: var(--bc-text)
  overflow: hidden
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), filter 120ms ease-out
  &::before
    +cel.glint(10%, 14%, 40%, 12%)
  .screen__close-icon
    position: relative
    width: 46%
    height: 46%
    filter: drop-shadow(0 2px 0 var(--bc-ink)) drop-shadow(1px 0 0 var(--bc-ink)) drop-shadow(-1px 0 0 var(--bc-ink)) drop-shadow(0 -1px 0 var(--bc-ink))

// ── In and out ───────────────────────────────────────────────────────────────
.screen-enter-active
  transition: opacity 180ms ease-out
  .screen__body, .screen__bar
    transition: transform 320ms var(--bc-ease-pop), opacity 180ms ease-out
.screen-enter-from
  opacity: 0
  .screen__body
    transform: translateY(1.2rem) scale(0.97)
    opacity: 0
  .screen__bar
    transform: translateY(-0.8rem)
    opacity: 0
@media (prefers-reduced-motion: reduce)
  .screen-enter-active, .screen-enter-active .screen__body, .screen-enter-active .screen__bar
    transition: none
</style>
