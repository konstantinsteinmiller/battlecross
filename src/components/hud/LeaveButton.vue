<template lang="pug">
  div.leave(v-if="hud.canLeave && !flow.modal && !flow.talk" :class="{ 'is-ready': hud.finaleOpen }")
    FButton.leave__btn(
      data-coach="leave"
      :label="t('level.leave')"
      type="success"
      size="lg"
      icon="forward"
      :attention="hud.finaleOpen"
      @click="leave"
    )
    KeyCap.leave__key(v-if="hud.device === 'mouse'" :code="leaveCode")
    //- What this place still holds: a chest and a number, no words.
    span.leave__left(v-if="hud.chestsLeft > 0" role="img" :aria-label="t('level.chestsLeft', { n: hud.chestsLeft })")
      GameIcon(name="chest")
      span.leave__count {{ hud.chestsLeft }}
</template>

<script setup lang="ts">
/**
 * After a zone's finale falls the place is the hero's to walk: its chests,
 * its corners, the finale's own chest. This is how he goes home — a big green
 * ribbon of a button that pulses once the finale's chest is open, with the
 * number of chests still closed here beside it. Leaving opens the finale's
 * chest for him if he never did, so the boss's reward is never lost.
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
</script>

<style scoped lang="sass">
.leave
  position: absolute
  left: 50%
  // Touch: above the stick and the skill bar, in the middle of the screen's foot.
  bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(9.5rem, 42vmin, 13.5rem))
  transform: translateX(-50%)
  display: flex
  align-items: center
  gap: 0.5rem
  pointer-events: auto
  animation: leave-in 320ms var(--bc-ease-pop, cubic-bezier(0.2, 1.4, 0.4, 1)) both
.hud--mouse .leave
  // Desktop: top centre, under the zone's status.
  top: calc(env(safe-area-inset-top, 0px) + clamp(4.6rem, 12vh, 6.4rem))
  bottom: auto
.leave__btn
  filter: drop-shadow(0 0.25rem 0 rgba(var(--bc-ink-rgb), 0.35))
.leave.is-ready .leave__btn
  animation: leave-pulse 1.4s ease-in-out infinite
.leave__key
  font-size: clamp(0.8rem, 2.4vmin, 1.05rem)
  color: var(--bc-ink)
.leave__left
  position: relative
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
    transform: translateX(-50%) translateY(0.8rem) scale(0.85)
@keyframes leave-pulse
  0%, 100%
    transform: scale(1)
  50%
    transform: scale(1.07)
@media (prefers-reduced-motion: reduce)
  .leave, .leave.is-ready .leave__btn
    animation: none
</style>
