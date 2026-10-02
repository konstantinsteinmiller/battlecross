<script setup lang="ts">
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

defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const selectTab = (value: string | number): void => {
  emit('update:modelValue', value)
}
</script>

<template lang="pug">
  //- The row scrolls horizontally rather than wrapping: on a 320px phone with
  //- four tabs, wrapping would push the modal content down and the previous
  //- fixed padding compensation would no longer clear the header.
  div.f-tabs(role="tablist")
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

.f-tabs
  display: flex
  align-items: flex-end
  justify-content: safe center
  gap: clamp(0.1rem, 0.6vw, 0.25rem)
  max-width: 100%
  // Room for the active tab's lift and its focus ring inside the scroller.
  padding: 0.35rem clamp(0.25rem, 2vw, 1rem) 0
  overflow-x: auto
  overflow-y: hidden
  scrollbar-width: none

  &::-webkit-scrollbar
    display: none

// A folder tab: leather while it waits, gold when it is the open page.
.f-tabs__tab
  +cel.tone('leather')
  position: relative
  flex: 0 0 auto
  // Floor so a tab can never render as an invisible sliver.
  min-width: 3.25rem
  min-height: 2.1rem
  padding: 0
  border: 0
  border-radius: var(--ftab-r) var(--ftab-r) 0 0
  --ftab-r: clamp(0.55rem, 2.4vw, 0.95rem)
  background: none
  cursor: pointer
  transition: translate var(--bc-t-release) var(--bc-ease-bounce)
  -webkit-tap-highlight-color: transparent
  +cel.focus-ring

  &:hover:not(.is-active) .f-tabs__body
    filter: brightness(1.1)

  &:active .f-tabs__body
    transition-duration: var(--bc-t-press)
    transform: translateY(2px) scale(1, 0.94)

  &.is-active
    +cel.tone('gold')
    z-index: 10
    translate: 0 -0.3rem

.f-tabs__shadow
  position: absolute
  inset: 0
  transform: translateY(3px)
  border-radius: var(--ftab-r) var(--ftab-r) 0 0
  background-color: var(--bc-ink)

.f-tabs__body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  min-height: 2.1rem
  padding: clamp(0.2rem, 1vw, 0.4rem) clamp(0.6rem, 3.2vw, 1.35rem)
  border: var(--bc-ol) solid var(--bc-ink)
  border-bottom-width: 0
  border-radius: var(--ftab-r) var(--ftab-r) 0 0
  +cel.fill(42%, 100%)
  color: var(--bc-stitch)
  transform-origin: 50% 100%
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), filter 120ms ease-out

  .f-tabs__tab.is-active &
    color: var(--bc-text)
    padding-bottom: calc(clamp(0.2rem, 1vw, 0.4rem) + 0.3rem)

.f-tabs__label
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  white-space: nowrap
  font-size: clamp(0.65rem, 2.9vw, 1rem)
  text-shadow: var(--bc-text-outline)

.f-tabs__icon
  width: clamp(1.15rem, 5vw, 1.75rem)
  height: clamp(1.15rem, 5vw, 1.75rem)
  object-fit: contain
  pointer-events: none
  user-select: none
  -webkit-user-drag: none
</style>
