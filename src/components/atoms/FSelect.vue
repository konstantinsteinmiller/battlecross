<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { sfx } from '@/game/audio/sfx'

interface Option {
  value: string | number
  label: string
  /** The label's own language (a language picker's autonyms): its font
   *  fallback and its uppercasing follow it, not the UI's language. */
  lang?: string
}

interface Props {
  modelValue: string | number
  options: Option[]
  placeholder?: string
  label?: string
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '…',
  maxHeight: '200px'
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option ? option.label : props.placeholder
})
const selectedLang = computed(() => props.options.find(opt => opt.value === props.modelValue)?.lang)

const toggle = () => {
  sfx('uiClick')
  isOpen.value = !isOpen.value
}

const selectOption = (value: string | number) => {
  sfx('uiClick')
  emit('update:modelValue', value)
  isOpen.value = false
}

// Close when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) { e.stopPropagation(); isOpen.value = false }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template lang="pug">
  div.f-select(ref="dropdownRef" :class="{ 'is-open': isOpen }" @keydown="onKey")
    //- Label (Optional)
    div.label-text(v-if="label") {{ label }}

    //- The trigger: a button in the same cut as `FButton`.
    button.f-select__trigger(
      type="button"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-label="label"
      @click="toggle"
    )
      span.f-select__shadow(aria-hidden="true")
      span.f-select__body
        span.f-select__value(:lang="selectedLang") {{ selectedLabel }}
        span.f-select__caret-wrap
          GameIcon.f-select__caret(name="down")

    //- The list: a parchment sheet under the trigger.
    transition(name="pop")
      div.f-select__menu(v-if="isOpen")
        div.custom-scrollbar(role="listbox" :style="{ maxHeight: maxHeight }")
          button.f-select__row(
            v-for="option in options"
            :key="option.value"
            type="button"
            role="option"
            :aria-selected="modelValue === option.value"
            :class="{ 'is-selected': modelValue === option.value }"
            @click="selectOption(option.value)"
          )
            span.f-select__option(:lang="option.lang") {{ option.label }}
</template>

<style scoped lang="sass">
@use '@/assets/css/cel'

// Fluid metrics replace the old fixed `text-sm md:text-lg` / `px-4 py-3` pairs
// so the control reads the same on a 320px phone and a 4K desktop, and the
// `min-height` floor guarantees a legal touch target in every layout.
.f-select
  +cel.tone('gold')
  position: relative
  width: 100%
  font-weight: 900

.label-text
  margin: 0 0 0.3rem 0.2rem
  color: var(--bc-on)
  text-transform: uppercase
  letter-spacing: 0.04em
  font-size: clamp(0.75rem, 3.2vw, 1.05rem)
  text-align: start

.f-select__trigger
  position: relative
  display: block
  width: 100%
  padding: 0
  border: 0
  border-radius: var(--bc-r-lg)
  background: none
  cursor: pointer
  user-select: none
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  +cel.focus-ring
  &:hover .f-select__body
    filter: brightness(1.06)
  &:active .f-select__body
    transition-duration: var(--bc-t-press)
    transition-timing-function: ease-out
    transform: translateY(var(--bc-press)) scale(1.01, 0.95)

.f-select__shadow
  position: absolute
  inset: 0
  transform: translateY(var(--bc-press))
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-lg)
  background: var(--c-deep)

.f-select__body
  position: relative
  display: flex
  align-items: center
  justify-content: space-between
  gap: 0.5rem
  min-height: 2.75rem
  min-width: clamp(6rem, 40vw, 9rem)
  padding: clamp(0.4rem, 1.8vw, 0.7rem) clamp(0.7rem, 3vw, 1.1rem)
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-lg)
  +cel.fill
  overflow: hidden
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), filter 120ms ease-out
  &::before
    +cel.glint(0.22em, 0.5em, min(34%, 3rem), 0.28em)

.f-select__value
  position: relative
  min-width: 0
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  +cel.label
  text-transform: uppercase
  letter-spacing: 0.03em
  font-size: clamp(0.72rem, 3vw, 1.05rem)

// The caret is the shared `down` chevron — solid like the rest of the set.
// Sized here because `GameIcon` deliberately fills whatever box the caller
// gives it. Nested to outrank `GameIcon`'s own `.game-icon` rule, which
// carries the same specificity a flat class selector would — on a tie the
// winner is whichever stylesheet the bundler emitted last.
.f-select__caret-wrap
  position: relative
  flex: 0 0 auto
  color: var(--bc-text)
  transition: transform 220ms var(--bc-ease-bounce)

  .f-select__caret
    width: 1.25rem
    height: 1.25rem
    filter: drop-shadow(0 2px 0 var(--bc-ink)) drop-shadow(1px 0 0 var(--bc-ink)) drop-shadow(-1px 0 0 var(--bc-ink)) drop-shadow(0 -1px 0 var(--bc-ink))
.is-open .f-select__caret-wrap
  transform: rotate(180deg)

.f-select__menu
  position: absolute
  z-index: var(--bc-z-dropdown)
  left: 0
  right: 0
  margin-top: 0.6rem
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-lg)
  background: var(--bc-paper-hi)
  box-shadow: 0 var(--bc-press) 0 var(--bc-ink), 0 0.9rem 1.4rem rgba(var(--bc-ink-rgb), 0.45)
  overflow: hidden

.custom-scrollbar
  display: flex
  flex-direction: column
  gap: 0.2rem
  padding: 0.35rem
  overflow-y: auto
  overscroll-behavior: contain
  +cel.scrollbar

.f-select__row
  +cel.tone('blue')
  position: relative
  flex: 0 0 auto
  min-height: 2.5rem
  padding: 0.5rem 0.75rem
  border: var(--bc-ol-thin) solid transparent
  border-radius: var(--bc-r-md)
  background: none
  color: var(--bc-paper-ink)
  font: inherit
  text-align: start
  cursor: pointer
  transition: transform 90ms ease-out
  +cel.focus-ring
  &:hover
    background: var(--bc-paper-lo)
  &:active
    transform: scale(0.98)
  &.is-selected
    border-color: var(--bc-ink)
    +cel.fill(46%, 88%)
    color: var(--bc-text)
    text-shadow: var(--bc-text-outline)

.f-select__option
  display: block
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  text-transform: uppercase
  letter-spacing: 0.03em
  font-size: clamp(0.72rem, 3vw, 1rem)

/* Transition Animations */
.pop-enter-active, .pop-leave-active
  transition: transform 0.2s var(--bc-ease-pop), opacity 0.1s

.pop-enter-from, .pop-leave-to
  opacity: 0
  transform: translateY(-10px) scale(0.95)
</style>
