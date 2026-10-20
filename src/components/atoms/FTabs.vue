<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { revealIn, useDragScroll } from '@/use/useDragScroll'

export interface TabOption {
  label: string
  value: string | number
  /** Optional image icon shown instead of the label. */
  icon?: string
}

interface Props {
  modelValue: string | number
  options: TabOption[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const row = ref<HTMLElement | null>(null)
useDragScroll(row)
// The open tab is always whole in the row.
const showOpen = async (smooth: boolean): Promise<void> => {
  await nextTick()
  const on = row.value?.querySelector<HTMLElement>('.is-active')
  if (row.value && on) revealIn(row.value, on, smooth)
}
onMounted(() => showOpen(false))
watch(() => props.modelValue, () => showOpen(true))

const selectTab = (value: string | number): void => {
  emit('update:modelValue', value)
}
</script>

<template lang="pug">
  //- The row scrolls horizontally rather than wrapping: on a 320px phone with
  //- four tabs, wrapping would push the modal content down and the previous
  //- fixed padding compensation would no longer clear the header.
  div.f-tabs(ref="row" role="tablist")
    button.f-tabs__tab(
      v-for="tab in options"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.value"
      :class="{ 'is-active': modelValue === tab.value }"
      @click="selectTab(tab.value)"
    )
      span.f-tabs__shadow(aria-hidden="true")
      span.f-tabs__body
        img.f-tabs__icon(v-if="tab.icon" :src="tab.icon" :alt="tab.label" draggable="false")
        span.f-tabs__label(v-else) {{ tab.label }}
</template>

<style scoped lang="sass">
@use '@/assets/css/cel'

// Folder tabs that sit FLUSH on the modal frame under them: the row overlaps
// the frame's ink outline by --tab-overlap, and the open tab paints the
// frame's own top-band leather over that outline, so tab and frame read as
// one piece (no gap, no floating). Closed tabs tuck behind the rim, darker.
.f-tabs
  --tab-overlap: var(--bc-ol-thick, 4px)
  position: relative
  z-index: 3
  display: flex
  align-items: flex-end
  // Auto margins centre the row when it fits; justify-content: center would
  // clip the first tab off the left edge of an overflowing scroll row.
  justify-content: flex-start
  gap: clamp(0.1rem, 0.6vw, 0.25rem)
  max-width: 100%
  padding: 0.35rem clamp(0.25rem, 2vw, 1rem) 0
  margin-bottom: calc(var(--tab-overlap) * -1)
  overflow-x: auto
  overflow-y: hidden
  scrollbar-width: none
  overscroll-behavior-x: contain
  touch-action: pan-x

  &::-webkit-scrollbar
    display: none

  &.dragging
    cursor: grabbing
    user-select: none

  &.can-right
    mask-image: linear-gradient(90deg, black calc(100% - 1.6rem), transparent)

  &.can-left
    mask-image: linear-gradient(90deg, transparent, black 1.6rem)

  &.can-left.can-right
    mask-image: linear-gradient(90deg, transparent, black 1.6rem, black calc(100% - 1.6rem), transparent)

  > :first-child
    margin-left: auto

  > :last-child
    margin-right: auto

.f-tabs__tab
  position: relative
  flex: 0 0 auto
  // Floor so a tab can never render as an invisible sliver.
  min-width: 3.25rem
  // A closed tab stands a little lower than the open one.
  margin-top: 0.3rem
  // The rim strip the open tab paints over.
  padding: 0 0 var(--tab-overlap)
  border: 0
  --ftab-r: clamp(0.55rem, 2.4vw, 0.95rem)
  background: none
  cursor: pointer
  -webkit-tap-highlight-color: transparent
  +cel.focus-ring

  &:hover:not(.is-active) .f-tabs__body
    filter: brightness(1.12)

  &:active:not(.is-active) .f-tabs__body
    transform: scale(0.95)

  &.is-active
    z-index: 10
    margin-top: 0

.f-tabs__shadow
  position: absolute
  inset: 0 0 var(--tab-overlap)
  transform: translateY(3px)
  border-radius: var(--ftab-r) var(--ftab-r) 0 0
  background-color: var(--bc-ink)
  .is-active &
    display: none

.f-tabs__body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  min-height: 2.1rem
  box-sizing: border-box
  padding: clamp(0.2rem, 1vw, 0.4rem) clamp(0.6rem, 3.2vw, 1.35rem)
  border: var(--bc-ol) solid var(--bc-ink)
  border-bottom: 0
  border-radius: var(--ftab-r) var(--ftab-r) 0 0
  // Closed: the frame's shadowed leather, a step darker than the rim.
  background: linear-gradient(180deg, var(--bc-leather) 0, var(--bc-leather) 40%, var(--bc-leather-lo) 40%)
  color: var(--bc-stitch)
  transform-origin: 50% 100%
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), filter 120ms ease-out

  // Open: the frame's lit top band, running down over the frame's outline.
  .f-tabs__tab.is-active &
    min-height: 2.4rem
    background: linear-gradient(180deg, color-mix(in srgb, var(--bc-leather-hi), white 25%) 0, color-mix(in srgb, var(--bc-leather-hi), white 25%) 0.3rem, var(--bc-leather-hi) 0.3rem)
    color: var(--bc-text)
    &::after
      content: ''
      position: absolute
      left: 0
      right: 0
      top: 100%
      height: calc(var(--tab-overlap) + 1px)
      background: var(--bc-leather-hi)

.f-tabs__label
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  white-space: nowrap
  font-size: clamp(0.65rem, 2.9vw, 1rem)
  text-shadow: var(--bc-text-outline)
  .f-tabs__tab.is-active &
    color: var(--bc-gold-hi)

.f-tabs__icon
  width: clamp(1.15rem, 5vw, 1.75rem)
  height: clamp(1.15rem, 5vw, 1.75rem)
  object-fit: contain
  pointer-events: none
  user-select: none
  -webkit-user-drag: none
</style>
