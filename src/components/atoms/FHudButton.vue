<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import { sfx } from '@/game/audio/sfx'
import { resolveIconLabel } from '@/components/icons/iconLabels'
import type { GameIconName } from '@/components/icons/iconNames'

/**
 * The standard HUD chip used by every meta button in the bottom rows
 * (Daily Rewards, Missions, Achievements, Battle Pass, Ad Reward, Settings,
 * Tech Tree, Themes).
 *
 * Exists to kill the copy-pasted `scale-80 sm:scale-100` wrappers that used to
 * live in each of those components. Those transforms shrank the painted chip
 * without shrinking its layout box, so the bottom row reserved full-size gaps
 * around 80%-size buttons and the spacing looked wrong on exactly the screens
 * that could least afford it. Everything here is fluid `clamp()` sizing with a
 * hard 2.5rem floor, so the row is compact on a 320px phone, comfortable on a
 * tablet, and never collapses.
 *
 * The glyph normally comes from the shared set via the `icon` prop; the default
 * slot stays for the handful of marks that are art rather than UI (a bitmap
 * prop, a component with its own fallback logic). `badge` = the corner
 * indicator (claim count, reward pill, timer).
 */

interface Props {
  /** Colour family. `gold` is the "there is something to collect" default. */
  tone?: 'gold' | 'blue' | 'green' | 'slate'
  /** Soft glow pulse — used when the button has an unclaimed reward. */
  attention?: boolean
  isDisabled?: boolean
  /** A glyph from the shared set. Ignored when the default slot is filled. */
  icon?: GameIconName
  /** A painting under `images/ui/` that may stand in for the glyph once the
   *  art pipeline has produced it — see `ArtIcon`. */
  art?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'gold',
  attention: false,
  isDisabled: false
})

const emit = defineEmits(['click'])
/** Every button answers with a click, like `FButton`; a disabled one is silent. */
const onClick = (): void => {
  if (props.isDisabled) return
  sfx('uiClick')
  emit('click')
}

const slots = useSlots()
const { t, te } = useI18n()

/** The caller's label, or the shared floor under a glyph that arrived without
 *  one — see `iconLabels.ts`. */
const resolvedAriaLabel = computed<string | undefined>(
  () => resolveIconLabel(props.ariaLabel, props.icon, t, te)
)
</script>

<template lang="pug">
  button.f-hud-button(
    type="button"
    :class="[`tone-${tone}`, { 'is-attention': attention, 'is-disabled': isDisabled }]"
    :aria-label="resolvedAriaLabel"
    :disabled="isDisabled"
    @click="onClick"
  )
    span.f-hud-button__shadow(aria-hidden="true")
    span.f-hud-button__body
      GameIcon.f-hud-button__glyph(v-if="icon && !slots.default" :name="icon")
      slot
    span.f-hud-button__badge(v-if="$slots.badge")
      slot(name="badge")
</template>

<style scoped lang="sass">
@use '@/assets/css/cel'

.f-hud-button
  +cel.tone('gold')
  position: relative
  display: inline-flex
  align-items: center
  justify-content: center
  flex: 0 0 auto
  // Floors keep the tap target legal and the chip visible in any layout.
  min-width: 2.5rem
  min-height: 2.5rem
  width: clamp(2.5rem, 11vw, 3.4rem)
  height: clamp(2.5rem, 11vw, 3.4rem)
  padding: 0
  border: 0
  border-radius: var(--fhud-r)
  --fhud-r: clamp(0.55rem, 2.4vw, 0.85rem)
  background: none
  cursor: pointer
  pointer-events: auto
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  +cel.focus-ring

  &:hover:not(.is-disabled) .f-hud-button__body
    filter: brightness(1.08)

  // Squash onto the plate, spring back past rest.
  &:active:not(.is-disabled) .f-hud-button__body
    transition-duration: var(--bc-t-press)
    transition-timing-function: ease-out
    transform: translateY(var(--bc-press-sm)) scale(1.03, 0.93)

  &.is-disabled
    +cel.tone('off')
    cursor: not-allowed
    .f-hud-button__body
      transform: translateY(var(--bc-press-sm))
      color: rgba(var(--bc-white-rgb), 0.6)
      &::before
        display: none

.f-hud-button__shadow
  position: absolute
  inset: 0
  transform: translateY(var(--bc-press-sm))
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--fhud-r)
  background-color: var(--c-deep)

.f-hud-button__body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  width: 100%
  height: 100%
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--fhud-r)
  +cel.fill(48%, 88%)
  color: var(--bc-text)
  overflow: hidden
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), filter 120ms ease-out

  // The cel glint.
  &::before
    +cel.glint(9%, 12%, 42%, 13%)

  // The glyph fills a consistent fraction of the chip regardless of chip size,
  // so a row of mixed icons reads as one set. A bitmap needs the larger box to
  // read as the same optical size — its art carries its own margin, a vector
  // glyph does not.
  .f-hud-button__glyph
    position: relative
    width: 56%
    height: 56%
    // The glyphs' own ink line, so a white mark reads on the lit band.
    filter: drop-shadow(0 0.09em 0 var(--bc-ink)) drop-shadow(0.06em 0 0 var(--bc-ink)) drop-shadow(-0.06em 0 0 var(--bc-ink)) drop-shadow(0 -0.06em 0 var(--bc-ink))
    font-size: 1rem

  // A painted glyph carries its own outline and sits larger than a flat one.
  img.f-hud-button__glyph
    width: 70%
    height: 70%
    filter: none

  :slotted(svg), :slotted(img)
    position: relative
    width: 62%
    height: 62%
    pointer-events: none

.f-hud-button__badge
  position: absolute
  top: 0
  right: 0
  translate: 30% -30%
  display: flex
  align-items: center
  justify-content: center
  pointer-events: none

// ─── Tones ──────────────────────────────────────────────────────────────────
.tone-blue
  +cel.tone('blue')
.tone-green
  +cel.tone('green')
.tone-slate
  +cel.tone('stone')

// Something to collect: the chip hops and its plate glows.
.is-attention
  animation: hud-hop 1.6s ease-in-out infinite
  .f-hud-button__shadow
    animation: hud-glow 1.6s ease-in-out infinite

@keyframes hud-hop
  0%, 60%, 100%
    translate: 0 0
  72%
    translate: 0 -14%
  84%
    translate: 0 0
  92%
    translate: 0 -5%

@keyframes hud-glow
  0%, 100%
    box-shadow: 0 0 0 0 rgba(var(--bc-white-rgb), 0)
  50%
    box-shadow: var(--bc-glow-gold)

@media (prefers-reduced-motion: reduce)
  .is-attention, .is-attention .f-hud-button__shadow
    animation: none
  .f-hud-button__body
    transition: none
</style>
