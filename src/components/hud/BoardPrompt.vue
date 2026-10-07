<template lang="pug">
  div.board-prompt(v-show="hud.interactBoard && !flow.modal && !flow.talk")
    div.board-prompt__pin(ref="pin")
      button.board-prompt__btn(v-if="hud.interactBoard" type="button" :aria-label="t('board.read')" @click="read")
        span.board-prompt__row
          span.board-prompt__glyph
            GameIcon(name="scroll")
          span.board-prompt__label {{ t('board.read') }}
          KeyCap.board-prompt__key(v-if="hud.device === 'mouse'" :code="interactCode")
</template>

<script setup lang="ts">
/**
 * The prompt over the town square's notice board (roadmap #85): "Read", with
 * the key on a desktop, hanging over the board like the "Open" prompt over a
 * chest. Tapping the board in the world walks the hero up and opens it too.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { addHudTicker, hud } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { currentZone, input } from '@/game/boot'
import { DEFAULT_BINDINGS } from '@/game/engine/keyBindings'
import GameIcon from '@/components/icons/GameIcon.vue'
import KeyCap from '@/components/glyphs/KeyCap.vue'

const { t } = useI18n()
const interactCode = DEFAULT_BINDINGS.interact[0]!
const pin = ref<HTMLElement | null>(null)

const p = { x: 0, y: 0 }
let remove: (() => void) | null = null
onMounted(() => {
  remove = addHudTicker(() => {
    const el = pin.value
    if (!el || !hud.interactBoard) return
    const zone = currentZone()
    const b = zone?.boardSpot()
    const on = !!b && zone!.project(b.x, 2.1, b.z, p)
    el.style.transform = on ? `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0)` : 'translate3d(-999px, -999px, 0)'
  })
})
onUnmounted(() => remove?.())

const read = (): void => { input.interactQueued = true }
</script>

<style scoped lang="sass">
.board-prompt
  position: absolute
  inset: 0
  overflow: hidden
  pointer-events: none
  font-family: var(--font-ui)
.board-prompt__pin
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  will-change: transform
.board-prompt__btn
  position: absolute
  left: 0
  bottom: 0
  transform: translateX(-50%)
  display: flex
  align-items: center
  justify-content: center
  min-width: max(2.75rem, 44px)
  min-height: max(2.75rem, 44px)
  margin: 0
  padding: 0
  border: 0
  background: none
  color: var(--bc-ink)
  font: inherit
  font-size: clamp(0.86rem, 3.6vmin, 1.1rem)
  line-height: 1.1
  white-space: nowrap
  pointer-events: auto
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  animation: board-prompt-in 220ms var(--bc-ease-pop) both
  &:focus
    outline: none
.board-prompt__row
  display: inline-flex
  align-items: center
  gap: 0.4em
  min-height: max(2.2rem, 36px)
  padding: 0.2em 0.85em 0.26em 0.6em
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--bc-paper-hi) 0, var(--bc-paper-hi) 46%, var(--bc-paper) 46%, var(--bc-paper) 86%, var(--bc-paper-lo) 86%)
  box-shadow: 0 var(--bc-press-sm) 0 var(--bc-ink)
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
.board-prompt__btn:active .board-prompt__row
  transition-duration: var(--bc-t-press)
  transform: translateY(var(--bc-press-sm)) scale(1.02, 0.95)
  box-shadow: 0 0 0 var(--bc-ink)
.board-prompt__glyph
  width: 1.3em
  height: 1.3em
.board-prompt__key
  font-size: 0.95em
  color: var(--bc-ink)

@keyframes board-prompt-in
  from
    opacity: 0
    transform: translateX(-50%) translateY(0.5rem) scale(0.8)
@media (prefers-reduced-motion: reduce)
  .board-prompt__btn
    animation: none
</style>
