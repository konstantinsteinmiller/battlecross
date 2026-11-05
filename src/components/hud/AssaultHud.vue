<template lang="pug">
  div.assault(v-if="v.active" data-assault-hud :class="{ 'is-cut': v.phase === 'panorama' }")
    //- The panorama: letterbox bars slide in, the skip button waits at the corner.
    div.assault__bar.assault__bar--top(aria-hidden="true")
    div.assault__bar.assault__bar--bottom(aria-hidden="true")
    Transition(name="assault-fade")
      div.assault__cut(v-if="v.phase === 'panorama'")
        h2.assault__title {{ t('assault.title') }}
        div.assault__btn.assault__btn--cut
          FButton(type="secondary" size="md" icon="fast-forward" icon-position="left" data-assault-skip-cut :label="t('assault.skipCut')" @click="skipCut")
        div.assault__progress(aria-hidden="true")
          i(:style="{ transform: 'scaleX(' + v.cut01 + ')' }")
    //- The play: the goal with its two towers, the hint, and the way out.
    template(v-if="v.phase !== 'panorama'")
      div.assault__goal(role="status")
        span.assault__goal-text {{ v.phase === 'breach' ? t('assault.breach') : t('assault.goal') }}
        span.assault__pips(:aria-label="t('assault.towers', { n: 2 - v.towers, total: 2 })")
          i.assault__pip(v-for="q in 2" :key="q" :class="{ 'is-down': q <= 2 - v.towers }")
      Transition(name="assault-fade")
        p.assault__hint(v-if="hint" :key="hintKey" :class="{ 'is-urgent': v.hint === 'idle', 'is-push': v.hint === 'pushing' }" aria-live="polite" data-assault-hint) {{ hint }}
      div.assault__btn.assault__btn--skip(v-if="v.phase === 'play'")
        FButton(type="secondary" size="sm" icon="fast-forward" icon-position="left" data-assault-skip :label="t('assault.skip')" @click="skipSiege")
</template>

<script setup lang="ts">
/**
 * ─── The besieged gate's HUD (roadmap #204) ──────────────────────────────────
 *
 * Over the cutscene: letterbox bars, the siege's title and a skip button with a thin progress line.
 * Over the play: the goal with its two tower pips, a hint card that names the two ways to break the
 * siege (a catapult's lever, the ram) and, while the hero pushes the ram, how to speed it up, in
 * words for the player's device; and the "Skip Siege" button with the double-triangle glyph (the
 * siege is a diversion, never a gate).
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { assaultActions, assaultHud } from '@/game/state/assaultHud'
import { hud } from '@/game/state/hud'
import FButton from '@/components/atoms/FButton.vue'

const { t } = useI18n()
const v = assaultHud
const touch = computed(() => hud.device === 'touch')
const hintKey = computed(() => `${v.hint}:${touch.value ? 't' : 'k'}`)
const hint = computed(() => {
  if (v.hint === 'pushing') return t(touch.value ? 'assault.hint.pushTouch' : 'assault.hint.push')
  if (v.hint === 'idle') return t('assault.hint.idle')
  if (v.hint === 'levers') return t('assault.hint.levers')
  return ''
})
const skipCut = (): void => assaultActions.skipCut()
const skipSiege = (): void => assaultActions.skipSiege()
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.assault
  position: absolute
  inset: 0
  pointer-events: none
  --bar: 0px
  &.is-cut
    --bar: clamp(2.6rem, 13vh, 6rem)
.assault__bar
  position: absolute
  left: 0
  right: 0
  height: var(--bar)
  background: var(--bc-ink)
  transition: height 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)
  &--top
    top: 0
  &--bottom
    bottom: 0
.assault__cut
  position: absolute
  inset: 0
.assault__title
  position: absolute
  top: calc(var(--bar) * 0.5)
  left: 50%
  margin: 0
  transform: translate(-50%, -50%)
  width: max-content
  max-width: 88vw
  text-align: center
  +cel.label
  color: var(--bc-gold-hi)
  font-size: clamp(0.95rem, 3.4vmin, 1.7rem)
  letter-spacing: 0.06em
  text-shadow: 0 0.1em 0 var(--bc-leather-deep), 0 0 0.7em rgba(255, 170, 60, 0.45)
.assault__progress
  position: absolute
  left: 0
  right: 0
  bottom: var(--bar)
  height: 3px
  background: rgba(255, 255, 255, 0.08)
  i
    display: block
    height: 100%
    transform-origin: left center
    background: var(--bc-gold-hi)
.assault__btn
  pointer-events: auto
  &--cut
    position: absolute
    right: calc(env(safe-area-inset-right, 0px) + clamp(0.7rem, 3vmin, 1.6rem))
    bottom: calc(var(--bar) * 0.5)
    transform: translateY(50%)
  &--skip
    position: absolute
    right: calc(env(safe-area-inset-right, 0px) + clamp(0.6rem, 2.4vmin, 1.2rem))
    bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(7.5rem, 22vmin, 11rem))
    opacity: 0.92
.assault__goal
  position: absolute
  top: max(58px, calc(4.4rem * var(--hud-s, 1)))
  left: 50%
  transform: translateX(-50%)
  display: flex
  align-items: center
  gap: 0.6rem
  padding: 0.3rem 0.9rem
  border-radius: 999px
  background: rgba(20, 12, 8, 0.72)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  +cel.label
  color: var(--bc-gold-hi)
  font-size: max(11px, calc(clamp(0.74rem, 2.9vmin, 0.98rem) * var(--hud-s, 1)))
  white-space: nowrap
  @media (max-aspect-ratio: 3/4)
    top: max(158px, calc(10rem * var(--hud-s, 1)))
    white-space: normal
    max-width: 86vw
.assault__pips
  display: flex
  gap: 0.3rem
.assault__pip
  width: 0.9em
  height: 1.3em
  border-radius: 0.2em 0.2em 0.1em 0.1em
  border: 2px solid var(--bc-ink)
  background: var(--bc-leather)
  &.is-down
    background: var(--bc-stone-deep)
    transform: rotate(18deg) scaleY(0.6)
.assault__hint
  position: absolute
  left: 50%
  bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(5.5rem, 17vmin, 9rem))
  transform: translateX(-50%)
  margin: 0
  max-width: min(34rem, 88vw)
  padding: 0.5rem 1rem
  border-radius: 0.9rem
  background: rgba(20, 12, 8, 0.8)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  color: var(--bc-off-hi)
  text-align: center
  font-size: clamp(0.82rem, 2.8vmin, 1.05rem)
  text-shadow: 0 1px 0 var(--bc-ink)
  &.is-urgent
    border-color: var(--bc-gold-hi)
    animation: assault-nudge 1.1s ease-in-out infinite
  &.is-push
    border-color: var(--bc-green-hi)
.assault-fade-enter-active, .assault-fade-leave-active
  transition: opacity 0.35s
.assault-fade-enter-from, .assault-fade-leave-to
  opacity: 0
@keyframes assault-nudge
  0%, 100%
    transform: translateX(-50%) scale(1)
  50%
    transform: translateX(-50%) scale(1.04)
@media (prefers-reduced-motion: reduce)
  .assault__bar
    transition: none
  .assault__hint.is-urgent
    animation: none
</style>
