<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import { sfx } from '@/game/audio/sfx'
import { resolveIconLabel } from '@/components/icons/iconLabels'
import type { GameIconName } from '@/components/icons/iconNames'

/**
 * The primary CTA button.
 *
 * Sizing is FLUID, not scaled. The previous implementation applied Tailwind
 * `scale-60 / 75 / 80 / 90 / 110 / 120 / 125` transforms to a fixed-size body,
 * which had three problems: the transform did not affect layout (so buttons
 * overlapped their neighbours at large sizes and left dead gaps at small ones),
 * the border/shadow scaled with it (going blurry or hairline), and hit targets
 * drifted away from the painted pixels.
 *
 * Every dimension is now a `clamp(min, preferred-in-vw/vh, max)`, so the button
 * grows smoothly from a 320 px phone to a 4K desktop while never collapsing
 * below a comfortable 44 px touch target.
 */

interface Props {
  label?: string
  type?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  variant?: 'default' | 'brawl'
  isDisabled?: boolean
  colorFrom?: string
  colorTo?: string
  shadowColor?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  attention?: boolean
  /** Stretch to the container's width. Off by default so a button in a row
   *  sizes to its content instead of fighting its siblings. */
  block?: boolean
  /** A glyph from the shared set, drawn beside the label. */
  icon?: GameIconName
  /** Which side the glyph sits on. Right by default: the label is what the eye
   *  reads first, the glyph confirms the action. */
  iconPosition?: 'left' | 'right'
  /**
   * Drop the label and draw only the glyph, in a square button.
   *
   * This is what lets a row of actions cost one line instead of two. An
   * icon-only button has no accessible name of its own, so the caller MUST
   * pass an `aria-label`.
   */
  iconOnly?: boolean
  /** Required whenever the button has no visible text. */
  ariaLabel?: string
  /** A painting under `images/ui/` that may stand in for the glyph of an
   *  icon-only button once the art pipeline has produced it — see `ArtIcon`. */
  art?: string
  /**
   * Grow the whole control by this factor - the "this is the one that ends the
   * screen" mark for a row of otherwise identical glyph buttons.
   *
   * Multiplies INSIDE the clamp terms rather than applying a `transform:
   * scale()`, so the layout box grows with the paint and the row gutters
   * correctly around it. A transform would leave the neighbours' gaps wrong and
   * the hit target drifting off the painted pixels - which is the bug this
   * component was rewritten to kill in the first place.
   */
  emphasis?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  type: 'primary',
  variant: 'default',
  size: 'md',
  attention: false,
  block: false,
  iconPosition: 'right',
  iconOnly: false,
  emphasis: 1
})

const emit = defineEmits(['click'])
/** Every button answers with a click (#114: buttons were silent). */
const onClick = (): void => {
  if (props.isDisabled) return
  sfx('uiClick')
  emit('click')
}

const { t, te } = useI18n()

/**
 * An icon-only button has no text to be announced, so it needs a name from
 * somewhere. The caller's `ariaLabel` is the right answer and normally present;
 * the shared map in `iconLabels.ts` is the floor under the call site that
 * forgets. A button that still has its caption needs neither — its own text is
 * its name, and an `aria-label` there would silently override it.
 */
const resolvedAriaLabel = computed<string | undefined>(() => {
  if (props.ariaLabel) return props.ariaLabel
  return props.iconOnly ? resolveIconLabel(undefined, props.icon, t, te) : undefined
})

/**
 * The colour is a token RAMP (`theme.sass`), picked by a class: gold for the
 * primary action and for `warning` (the rewarded-video gold — the one button
 * that earns money, so the one whose colour is least allowed to drift), blue
 * for a second choice, green to go on, red to give something up.
 *
 * `colorFrom` / `colorTo` / `shadowColor` remain for a one-off: the lit band,
 * the base and the depth plate, in that order.
 */
const customRamp = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}
  if (props.colorFrom) out['--c-hi'] = props.colorFrom
  if (props.colorTo) { out['--c'] = props.colorTo; out['--c-lo'] = props.colorTo }
  if (props.shadowColor) out['--c-deep'] = props.shadowColor
  return out
})

/**
 * Per-size fluid metrics. The `vw` term is what makes the button responsive;
 * the min/max clamp keeps it usable at both extremes. `--fbtn-min-h` is never
 * below 2.25rem (36px) for `sm` and 2.75rem (44px) elsewhere — the WCAG touch
 * target floor — so no parent layout can crush the control out of existence.
 */
const sizeVars = computed<Record<string, string>>(() => {
  switch (props.size) {
    case 'sm':
      return {
        '--fbtn-font': 'clamp(0.7rem, 2.6vw, 0.95rem)',
        '--fbtn-px': 'clamp(0.6rem, 2.6vw, 1rem)',
        '--fbtn-py': 'clamp(0.3rem, 1.2vw, 0.5rem)',
        '--fbtn-min-w': 'clamp(3.5rem, 18vw, 6rem)',
        '--fbtn-min-h': '2.25rem',
        '--fbtn-radius': 'clamp(0.5rem, 2vw, 0.85rem)'
      }
    case 'lg':
      return {
        '--fbtn-font': 'clamp(1rem, 4.2vw, 1.6rem)',
        '--fbtn-px': 'clamp(1.1rem, 5vw, 2.2rem)',
        '--fbtn-py': 'clamp(0.55rem, 2.2vw, 0.95rem)',
        '--fbtn-min-w': 'clamp(6.5rem, 34vw, 12rem)',
        '--fbtn-min-h': '3rem',
        '--fbtn-radius': 'clamp(0.75rem, 3vw, 1.35rem)'
      }
    case 'xl':
      return {
        '--fbtn-font': 'clamp(1.15rem, 5vw, 2rem)',
        '--fbtn-px': 'clamp(1.4rem, 6vw, 2.8rem)',
        '--fbtn-py': 'clamp(0.65rem, 2.6vw, 1.15rem)',
        '--fbtn-min-w': 'clamp(8rem, 42vw, 15rem)',
        '--fbtn-min-h': '3.25rem',
        '--fbtn-radius': 'clamp(0.85rem, 3.4vw, 1.6rem)'
      }
    default:
      return {
        '--fbtn-font': 'clamp(0.85rem, 3.4vw, 1.25rem)',
        '--fbtn-px': 'clamp(0.85rem, 4vw, 1.6rem)',
        '--fbtn-py': 'clamp(0.45rem, 1.8vw, 0.75rem)',
        '--fbtn-min-w': 'clamp(5rem, 26vw, 9rem)',
        '--fbtn-min-h': '2.75rem',
        '--fbtn-radius': 'clamp(0.65rem, 2.6vw, 1.1rem)'
      }
  }
})

/**
 * Emphasis multiplies every fluid metric, so a 1.2x button is a genuinely
 * larger BOX: `calc(clamp(...) * 1.2)` clamps first and scales after, which
 * keeps the floors meaningful. The border width and the depth plate offset are
 * deliberately left alone - they read as the material the buttons are cut
 * from, and scaling them makes the emphasised one look like a different set.
 */
const scaled = (v: string, e: number): string => (e === 1 ? v : `calc(${v} * ${e})`)

const styleVars = computed(() => {
  const e = Number.isFinite(props.emphasis) && props.emphasis > 0 ? props.emphasis : 1
  const vars = Object.fromEntries(
    Object.entries(sizeVars.value).map(([key, value]) => [key, scaled(value, e)])
  )
  return { ...vars, ...customRamp.value }
})
</script>

<template lang="pug">
  button.f-button(
    type="button"
    :style="styleVars"
    :class="[\
      `tone-${type}`,\
      variant === 'brawl' ? 'is-brawl' : '',\
      block ? 'is-block' : '',\
      attention ? 'attention-bounce' : '',\
      isDisabled ? 'is-disabled' : '',\
      iconOnly ? 'is-icon-only' : ''\
    ]"
    :aria-label="resolvedAriaLabel"
    :disabled="isDisabled"
    @click="onClick"
  )
    //- The depth plate the body stands on (and sinks onto when pressed).
    span.f-button__shadow(aria-hidden="true")
    span.f-button__body
      //- The hard cel glint.
      span.f-button__shine(aria-hidden="true")
      //- Glyph-only. A separate `v-if` rather than a `v-else` on the label, so
      //- an icon-only button that was passed no icon still renders its slot
      //- instead of an empty box.
      GameIcon.f-button__glyph.is-solo(v-if="iconOnly && icon" :name="icon")
      template(v-else)
        GameIcon.f-button__glyph(v-if="icon && iconPosition === 'left'" :name="icon")
        span.f-button__text
          slot {{ label }}
        GameIcon.f-button__glyph(v-if="icon && iconPosition === 'right'" :name="icon")
</template>

<style scoped lang="sass">
@use '@/assets/css/cel'

.f-button
  +cel.tone('gold')
  position: relative
  display: inline-flex
  align-items: center
  justify-content: center
  // Floors that guarantee the control can never be collapsed to nothing by a
  // flex/grid parent — the "invisible button" failure mode.
  min-width: var(--fbtn-min-w)
  min-height: var(--fbtn-min-h)
  padding: 0
  border: 0
  border-radius: var(--fbtn-radius)
  background: none
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  +cel.focus-ring

  &.is-block
    display: flex
    width: 100%

  &:hover:not(.is-disabled) .f-button__body
    filter: brightness(1.07)

  // The press: the body squashes down ONTO its plate (the plate stays put),
  // quickly; letting go springs it back past rest.
  &:active:not(.is-disabled) .f-button__body
    transition-duration: var(--bc-t-press)
    transition-timing-function: ease-out
    transform: translateY(var(--bc-press)) scale(1.015, 0.95)

  // Switched off: no hue, no depth, no glint — it sits pressed flat.
  &.is-disabled
    +cel.tone('off')
    cursor: not-allowed

    .f-button__body
      transform: translateY(var(--bc-press))
    .f-button__shine
      display: none
    .f-button__text, .f-button__glyph
      opacity: 0.7

  // Glyph-only: a square button, not a pill with a lonely icon adrift in it.
  // The width floor becomes the height floor, so the control is as tall as it
  // is wide at every size and emphasis - and dropping the caption cannot
  // collapse it, because the caption was never what held it open.
  &.is-icon-only
    min-width: var(--fbtn-min-h)

    .f-button__body
      min-width: var(--fbtn-min-h)
      padding-inline: var(--fbtn-py)

  &.is-brawl
    transform: skewX(-10deg)

    .f-button__text
      transform: skewX(10deg)
      font-style: italic
      letter-spacing: -0.01em

.tone-secondary
  +cel.tone('blue')
.tone-danger
  +cel.tone('red')
.tone-success
  +cel.tone('green')
.tone-warning
  +cel.tone('gold')

.f-button__shadow
  position: absolute
  inset: 0
  transform: translateY(var(--bc-press))
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--fbtn-radius)
  background-color: var(--c-deep)

.f-button__body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  gap: 0.4em
  // The body owns the type scale so the glyph can size itself in `em` off it -
  // one metric for label and icon, which is what keeps them optically matched
  // at every size and emphasis.
  font-size: var(--fbtn-font)
  width: 100%
  min-height: var(--fbtn-min-h)
  padding: var(--fbtn-py) var(--fbtn-px)
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--fbtn-radius)
  +cel.fill
  overflow: hidden
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), filter 120ms ease-out

// The glint: a hard-edged lit window, top left, like the icons' gloss.
.f-button__shine
  position: absolute
  top: 0.22em
  left: 0.45em
  width: min(38%, 3.2em)
  height: 0.3em
  border-radius: var(--bc-r-pill)
  background-color: rgba(var(--bc-white-rgb), 0.62)
  pointer-events: none

// Nested rather than written flat, and that is load-bearing: `GameIcon`'s own
// scoped rule is `.game-icon[data-v-…]` — one class plus one attribute, exactly
// the same specificity a flat `.f-button__glyph[data-v-…]` would have. On a tie the
// winner is whichever stylesheet the bundler happened to emit last. Nesting
// adds the ancestor class and settles it.
.f-button__body .f-button__glyph
  position: relative
  flex: 0 0 auto
  // Sized in `em` off the body's font size, so one metric drives the label and
  // the glyph together at every size and emphasis factor.
  width: 1.25em
  height: 1.25em
  color: var(--bc-text)
  // The same ink outline the captions wear, so a glyph button and a text
  // button read as the same material.
  filter: drop-shadow(0 0.1em 0 var(--bc-ink)) drop-shadow(0.06em 0 0 var(--bc-ink)) drop-shadow(-0.06em 0 0 var(--bc-ink)) drop-shadow(0 -0.06em 0 var(--bc-ink))

  // Alone in the button it IS the control, not an ornament beside a word.
  &.is-solo
    width: 1.6em
    height: 1.6em

.f-button__text
  position: relative
  display: block
  +cel.label
  font-weight: 900
  text-transform: uppercase
  font-size: var(--fbtn-font)
  line-height: 1.15
  white-space: nowrap

.attention-bounce
  animation: fbtn-bounce 0.6s infinite alternate

@keyframes fbtn-bounce
  from
    translate: 0 0
  to
    translate: 0 -5px

@media (prefers-reduced-motion: reduce)
  .attention-bounce
    animation: none
  .f-button__body
    transition: none
</style>
