<template lang="pug">
  div.actions(v-show="hud.phase === 'play'")
    button.act.block(
      type="button"
      :class="{ held: hud.blockHeld }"
      :aria-label="t('combat.block')"
      @pointerdown.prevent.stop="blockDown"
      @pointerup.prevent.stop="blockUp"
      @pointercancel.prevent.stop="blockUp"
      @pointerleave="blockUp"
    )
      GameIcon(name="shield")
      KeyCap.kc(v-if="desk" code="MouseRight")
      CoachRing(:hint="touchHint('parry') ?? touchHint('block')" side="rim")
    button.act.slide(
      type="button"
      :class="{ off: !hud.slideReady }"
      :aria-label="t('combat.slide')"
      @pointerdown.prevent.stop="slide"
    )
      GameIcon(name="forward")
      KeyCap.kc(v-if="desk" code="Space")
      CoachRing(:hint="touchHint('slide')")
    button.act.tank(
      type="button"
      :class="{ off: hud.tanks <= 0 || hud.hp >= hud.maxHp }"
      :aria-label="t('combat.tank')"
      @pointerdown.prevent.stop="tank"
    )
      GameIcon(name="flask")
      span.count {{ hud.tanks }}
      KeyCap.kc(v-if="desk" code="KeyH")
      CoachRing(:hint="touchHint('tank')")
    template(v-for="(w, i) in hud.weapons" :key="i")
      button.act.weapon(
        v-if="w.id"
        type="button"
        :class="[`w${i}`, { off: !w.ready, lesson: hud.lesson?.id === 'weapon' && !hud.lesson.done && hud.lesson.slot === i + 1 }]"
        :style="{ '--wc': w.color }"
        :data-lesson="`weapon-${i + 1}`"
        :aria-label="t(`weapon.${w.id}.name`)"
        @pointerdown.prevent.stop="fire(i)"
      )
        span.w-orb
        span.w-cost {{ w.cost }}
        KeyCap.kc(v-if="desk" :code="`Digit${i + 1}`")
        CoachRing(v-if="i === 0" :hint="touchHint('weapon')")
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { input } from '@/game/boot'
import GameIcon from '@/components/icons/GameIcon.vue'
import CoachRing from './CoachRing.vue'
import KeyCap from './KeyCap.vue'
import type { HintId } from '@/game/sim/coach'
import { computed } from 'vue'

/**
 * Right-thumb cluster: BLOCK (hold; tap it as a ring closes to parry) and
 * SLIDE. These sit above the input surface, so their presses never reach the
 * fire/look gesture layer underneath.
 */
const { t } = useI18n()
/** The coach glyph for a button, when it is teaching a touch player. */
const touchHint = (id: HintId) => hud.hints.find(h => h.id === id && h.family === 'touch')
/** Mouse + keys: every button wears its key (the captured mouse has no cursor). */
const desk = computed(() => hud.device === 'mouse')

const blockDown = (e: PointerEvent) => {
  input.touched = true
  input.blockHeld = true
  input.blockPressed = true
  try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* ignore */ }
}
const blockUp = () => {
  input.blockHeld = false
}
const slide = () => {
  input.touched = true
  input.slideQueued = true
}
const tank = () => {
  input.touched = true
  input.tankQueued = true
}
const fire = (i: number) => {
  input.touched = true
  input.weaponQueued = (i + 1) as 1 | 2
}
</script>

<style scoped lang="sass">
.actions
  position: absolute
  right: calc(env(safe-area-inset-right, 0px) + clamp(12px, 3.5vmin, 28px))
  bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(14px, 4vmin, 32px))
  width: clamp(130px, 32vmin, 210px)
  height: clamp(110px, 26vmin, 170px)
  pointer-events: none
.act
  position: absolute
  pointer-events: auto
  border-radius: 50%
  border: 3px solid #141a33
  color: #fff
  display: grid
  place-items: center
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.35), inset 0 -5px 0 rgba(0, 0, 0, 0.18), inset 0 4px 0 rgba(255, 255, 255, 0.35)
  touch-action: none
  -webkit-tap-highlight-color: transparent
  transition: transform 0.06s
  :deep(.game-icon)
    width: 52%
    height: 52%
    filter: drop-shadow(0 2px 0 rgba(20, 26, 51, 0.6))
.block
  right: 0
  bottom: 0
  width: clamp(66px, 15vmin, 96px)
  height: clamp(66px, 15vmin, 96px)
  background: radial-gradient(circle at 40% 30%, #9fe6ff, #3cc8ff 45%, #1f7fd0)
  &.held
    transform: scale(0.92)
    background: radial-gradient(circle at 40% 30%, #ffffff, #7ff4ff 50%, #3cc8ff)
    box-shadow: 0 0 18px rgba(127, 244, 255, 0.8), inset 0 -3px 0 rgba(0, 0, 0, 0.15)
.slide
  right: clamp(72px, 17vmin, 108px)
  bottom: clamp(8px, 2vmin, 14px)
  width: clamp(48px, 11vmin, 68px)
  height: clamp(48px, 11vmin, 68px)
  background: radial-gradient(circle at 40% 30%, #c0d4ff, #6f8cff 45%, #3a4fc0)
  &:active
    transform: scale(0.9)
  &.off
    filter: grayscale(0.7) brightness(0.8)
.tank
  right: clamp(4px, 1vmin, 8px)
  bottom: clamp(76px, 17.5vmin, 110px)
  width: clamp(44px, 10vmin, 60px)
  height: clamp(44px, 10vmin, 60px)
  background: radial-gradient(circle at 40% 30%, #d4ffc8, #5fe07a 45%, #1f9a4a)
  &:active
    transform: scale(0.9)
  &.off
    filter: grayscale(0.8) brightness(0.75)
.weapon
  width: clamp(46px, 10.5vmin, 62px)
  height: clamp(46px, 10.5vmin, 62px)
  background: radial-gradient(circle at 40% 30%, #ffffff, var(--wc) 50%, color-mix(in srgb, var(--wc) 55%, #141a33))
  &.w0
    right: clamp(64px, 15vmin, 96px)
    bottom: clamp(70px, 16vmin, 100px)
  &.w1
    right: clamp(120px, 27vmin, 170px)
    bottom: clamp(30px, 7vmin, 46px)
  &:active
    transform: scale(0.9)
  &.off
    filter: grayscale(0.75) brightness(0.7)
  .w-orb
    width: 44%
    height: 44%
    border-radius: 50%
    background: radial-gradient(circle, #ffffff 0%, var(--wc) 70%)
    box-shadow: 0 0 10px var(--wc)
  .w-cost
    position: absolute
    left: -4px
    top: -6px
    min-width: 20px
    height: 20px
    padding: 0 4px
    border-radius: 10px
    background: #141a33
    color: #fff
    font-family: var(--font-pixel)
    font-size: 8px
    line-height: 20px
    text-align: center
// The key that works this button on a keyboard, tucked on its rim.
.kc
  position: absolute
  left: 50%
  bottom: -0.55em
  transform: translateX(-50%)
  font-size: clamp(11px, 2.3vmin, 14px)
  pointer-events: none
// The weapon lesson: the button to press breathes (on a child, so no
// class churn on the button can clobber the animation).
// The tank's count badge owns its bottom-right corner.
.tank .kc
  left: -2px
  transform: none
.weapon.lesson .w-orb
  animation: lesson-breathe 0.9s ease-in-out infinite
.weapon.lesson
  box-shadow: 0 0 0 4px #ffffff, 0 0 22px var(--wc)
@keyframes lesson-breathe
  50%
    transform: scale(1.35)
.tank
  .count
    position: absolute
    right: -6px
    bottom: -6px
    min-width: 20px
    height: 20px
    padding: 0 4px
    border-radius: 10px
    background: #141a33
    color: #fff
    font-family: var(--font-pixel)
    font-size: 9px
    line-height: 20px
    text-align: center
</style>
