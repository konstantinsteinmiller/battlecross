<template lang="pug">
  div.chest-prompt(v-show="hud.interactChest && !flow.modal && !flow.talk")
    div.chest-prompt__pin(ref="pin" :class="`chest-prompt__pin--${hud.interactChest || 'wood'}`")
      button.chest-prompt__btn(v-if="hud.interactChest" type="button" :aria-label="t('level.open')" @click="open")
        span.chest-prompt__row
          span.chest-prompt__glyph
            GameIcon(name="chest")
          span.chest-prompt__label {{ t('level.open') }}
          KeyCap.chest-prompt__key(v-if="hud.device === 'mouse'" :code="interactCode")
</template>

<script setup lang="ts">
/**
 * The prompt over a chest the hero can open: "Open", with the key on a
 * desktop. It hangs over the chest itself (a transform written from the HUD
 * ticker, the scene's own frame), like the "Talk" prompt over a townsperson,
 * so a thumb finds it where the eye already is. Tapping the chest in the world
 * does the same thing.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { addHudTicker, hud } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { currentZone, input } from '@/game/boot'
import { nearChest } from '@/game/sim/interact'
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
    if (!el || !hud.interactChest) return
    const zone = currentZone()
    const c = zone && zone.setup.kind === 'zone' ? nearChest(zone.sim) : undefined
    const on = !!c && zone!.project(c.x, 1.5, c.z, p)
    el.style.transform = on ? `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0)` : 'translate3d(-999px, -999px, 0)'
  })
})
onUnmounted(() => remove?.())

const open = (): void => { input.interactQueued = true }
</script>

<style scoped lang="sass">
.chest-prompt
  position: absolute
  inset: 0
  overflow: hidden
  pointer-events: none
  font-family: var(--font-ui)
.chest-prompt__pin
  --c-hi: var(--bc-gold-hi)
  --c: var(--bc-gold)
  --c-lo: var(--bc-gold-lo)
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  will-change: transform
.chest-prompt__pin--iron
  --c-hi: var(--bc-blue-hi)
  --c: var(--bc-blue)
  --c-lo: var(--bc-blue-lo)
.chest-prompt__btn
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
  animation: chest-prompt-in 220ms var(--bc-ease-pop) both
  &:focus
    outline: none
.chest-prompt__row
  display: inline-flex
  align-items: center
  gap: 0.4em
  min-height: max(2.2rem, 36px)
  padding: 0.2em 0.85em 0.26em 0.6em
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--c-hi) 0, var(--c-hi) 46%, var(--c) 46%, var(--c) 86%, var(--c-lo) 86%)
  box-shadow: 0 var(--bc-press-sm) 0 var(--bc-ink)
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
.chest-prompt__btn:active .chest-prompt__row
  transition-duration: var(--bc-t-press)
  transform: translateY(var(--bc-press-sm)) scale(1.02, 0.95)
  box-shadow: 0 0 0 var(--bc-ink)
.chest-prompt__glyph
  width: 1.3em
  height: 1.3em
.chest-prompt__pin--iron .chest-prompt__btn
  color: var(--bc-white)
.chest-prompt__pin--iron .chest-prompt__label
  text-shadow: var(--bc-text-outline)
.chest-prompt__pin--iron .chest-prompt__glyph
  filter: drop-shadow(0 1px 0 var(--bc-ink))
.chest-prompt__key
  font-size: 0.95em
  color: var(--bc-ink)

@keyframes chest-prompt-in
  from
    opacity: 0
    transform: translateX(-50%) translateY(0.5rem) scale(0.8)
@media (prefers-reduced-motion: reduce)
  .chest-prompt__btn
    animation: none
</style>
