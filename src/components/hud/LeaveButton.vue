<template lang="pug">
  div.leave(v-if="hud.canLeave && !flow.modal && !flow.talk" :class="{ 'is-ready': hud.finaleOpen }")
    FButton.leave__btn(
      data-coach="leave"
      :label="t('level.leave')"
      type="success"
      size="lg"
      :emphasis="hud.device === 'touch' ? 0.8 : 1"
      icon="forward"
      :attention="hud.finaleOpen"
      @click="leave"
    )
    KeyCap.leave__key(v-if="hud.device === 'mouse'" :code="leaveCode")
    //- What this place still holds: a chest and a number, no words. Tapped, it
    //- shows the way to the nearest one (roadmap #79).
    button.leave__left(
      v-if="hud.chestsLeft > 0"
      type="button"
      data-coach="chestsLeft"
      :aria-label="t('level.chestsLeft', { n: hud.chestsLeft })"
      @click="find"
    )
      GameIcon(name="chest")
      span.leave__count {{ hud.chestsLeft }}
</template>

<script setup lang="ts">
/**
 * After a zone's finale falls the place is the hero's to walk: its chests,
 * its corners, the finale's own chest. This is how he goes home — a green
 * ribbon of a button that pulses once the finale's chest is open, with the
 * number of chests still closed here beside it. Leaving opens the finale's
 * chest for him if he never did, so the boss's reward is never lost.
 *
 * It hangs under the hero's frame, top-left (roadmap #80): in the middle of the
 * screen it stood in the way of the packs still to fight. A fifth smaller on
 * a touch screen, where `lg` reaches its desktop size on a wide phone.
 */
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { input } from '@/game/boot'
import { DEFAULT_BINDINGS } from '@/game/engine/keyBindings'
import FButton from '@/components/atoms/FButton.vue'
import KeyCap from '@/components/glyphs/KeyCap.vue'
import GameIcon from '@/components/icons/GameIcon.vue'

const { t } = useI18n()
const leaveCode = DEFAULT_BINDINGS.leave[0]!
const leave = (): void => { input.leaveQueued = true }
const find = (): void => { input.findChestQueued = true }
</script>

<style scoped lang="sass">
.leave
  // Under the hero's frame (its column is the positioning box).
  position: absolute
  left: 0
  top: calc(100% + clamp(0.35rem, 1.6vmin, 0.7rem))
  display: flex
  align-items: center
  gap: 0.5rem
  pointer-events: auto
  white-space: nowrap
  animation: leave-in 320ms var(--bc-ease-pop, cubic-bezier(0.2, 1.4, 0.4, 1)) both
.leave__btn
  filter: drop-shadow(0 0.25rem 0 rgba(var(--bc-ink-rgb), 0.35))
.leave.is-ready .leave__btn
  animation: leave-pulse 1.4s ease-in-out infinite
.leave__key
  font-size: clamp(0.8rem, 2.4vmin, 1.05rem)
  color: var(--bc-ink)
.leave__left
  position: relative
  appearance: none
  margin: 0
  cursor: pointer
  font: inherit
  transition: transform 120ms ease-out
  display: inline-flex
  align-items: center
  justify-content: center
  width: clamp(2.3rem, 9vmin, 2.9rem)
  height: clamp(2.3rem, 9vmin, 2.9rem)
  padding: 0.35rem
  box-sizing: border-box
  border: 2px solid var(--bc-ink)
  border-radius: 50%
  background: linear-gradient(180deg, var(--bc-gold-hi) 0, var(--bc-gold) 50%, var(--bc-gold-lo) 100%)
  color: var(--bc-ink)
.leave__left:active
  transform: scale(0.92)
.leave__left:focus-visible
  outline: 3px solid var(--bc-white)
  outline-offset: 2px
.leave__count
  position: absolute
  right: -0.35rem
  bottom: -0.3rem
  min-width: 1.2rem
  padding: 0 0.25rem
  border: 2px solid var(--bc-ink)
  border-radius: 999px
  background: var(--bc-white)
  color: var(--bc-ink)
  font-family: var(--font-ui)
  font-size: clamp(0.72rem, 2.4vmin, 0.9rem)
  line-height: 1.15
  text-align: center
@keyframes leave-in
  from
    opacity: 0
    transform: translateY(-0.6rem) scale(0.85)
@keyframes leave-pulse
  0%, 100%
    transform: scale(1)
  50%
    transform: scale(1.07)
@media (prefers-reduced-motion: reduce)
  .leave, .leave.is-ready .leave__btn
    animation: none
</style>
