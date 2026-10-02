<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  label?: string
  /** A one-off fill: the lit band and the base. Defaults to the gold ramp. */
  colorFrom?: string
  colorTo?: string
  /** A one-off colour for the well. */
  trackColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 50,
  min: 0,
  max: 100,
  step: 1
})

const emit = defineEmits(['update:modelValue'])

const progress = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})

const customVars = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}
  if (props.colorFrom) out['--c-hi'] = props.colorFrom
  if (props.colorTo) { out['--c'] = props.colorTo; out['--c-lo'] = props.colorTo }
  if (props.trackColor) out['--fsl-well'] = props.trackColor
  return out
})

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}
</script>

<template lang="pug">
  div.f-slider-container(:style="customVars")
    //- Label (Optional)
    div.slider-label(v-if="label") {{ label }}

    div.f-slider__row
      //- The well, and the fill in it.
      div.f-slider__track
        div.f-slider__fill(:style="{ width: `${progress}%` }")

      //- Native Input (Invisible but functional)
      input.f-slider__input(
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        :aria-label="label"
        @input="updateValue"
      )

      //- The thumb (a picture: the native input under it takes the hand).
      div.thumb-visual(:style="{ left: `calc(${progress}% - var(--fsl-thumb) * ${progress / 100})` }")
        span.thumb-visual__shadow
        span.thumb-visual__body
          span.thumb-visual__grip
</template>

<style scoped lang="sass">
@use '@/assets/css/cel'

.slider-label
  margin-bottom: 0.35rem
  color: var(--bc-on)
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  font-size: clamp(0.75rem, 3.2vw, 1.05rem)
  text-align: start

.f-slider-container
  +cel.tone('gold')
  --fsl-well: var(--bc-slate-deep)
  // Thumb size drives the row height, the track height AND the left offset, so
  // all three stay in sync at any viewport instead of the old hard-coded 40px.
  --fsl-thumb: clamp(2rem, 9vw, 2.5rem)
  width: 100%
  padding-block: clamp(0.4rem, 2vw, 1rem)
  -webkit-tap-highlight-color: transparent

.f-slider__row
  position: relative
  display: flex
  align-items: center
  height: var(--fsl-thumb)

.f-slider__track
  position: absolute
  inset: 0
  height: calc(var(--fsl-thumb) * 0.56)
  margin-block: auto
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: var(--fsl-well)
  box-shadow: 0 var(--bc-press-sm) 0 var(--bc-ink)
  overflow: hidden

.f-slider__fill
  height: 100%
  +cel.fill(46%, 82%)
  border-right: var(--bc-ol-thin) solid var(--bc-ink)

.f-slider__input
  position: absolute
  inset: 0
  z-index: 1
  width: 100%
  height: var(--fsl-thumb)
  margin: 0
  opacity: 0
  cursor: pointer
  touch-action: manipulation

.thumb-visual
  +cel.tone('blue')
  position: absolute
  width: var(--fsl-thumb)
  height: var(--fsl-thumb)
  pointer-events: none

.thumb-visual__shadow
  position: absolute
  inset: 0
  transform: translateY(var(--bc-press-sm))
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  background: var(--c-deep)

.thumb-visual__body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  width: 100%
  height: 100%
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  +cel.fill(46%, 86%)
  overflow: hidden
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
  &::before
    +cel.glint(10%, 14%, 40%, 12%)

// The grip: two ink notches.
.thumb-visual__grip
  width: 28%
  height: 38%
  border-inline: var(--bc-ol-thin) solid rgba(var(--bc-ink-rgb), 0.7)

// The keyboard's ring and the hand's squash land on the picture.
.f-slider__input:focus-visible ~ .thumb-visual .thumb-visual__body
  box-shadow: var(--bc-focus)
.f-slider__input:active ~ .thumb-visual .thumb-visual__body
  transition-duration: var(--bc-t-press)
  transform: translateY(var(--bc-press-sm)) scale(1.04, 0.93)

/* Ensure the native range covers the whole area for better hitboxes */
input[type="range"]
  -webkit-appearance: none
  appearance: none
  background: transparent

  &::-webkit-slider-thumb
    -webkit-appearance: none
    width: var(--fsl-thumb)
    height: var(--fsl-thumb)
    cursor: pointer

  &::-moz-range-thumb
    width: var(--fsl-thumb)
    height: var(--fsl-thumb)
    cursor: pointer
    border: none
    background: transparent
</style>
