<template lang="pug">
  //- Keyed on the count: every deal stamps anew, even the same words twice.
  span.deal-stamp(v-if="n > 0" :key="n" :class="`deal-stamp--${tone}`" aria-hidden="true")
    span.deal-stamp__text {{ text }}
</template>

<script setup lang="ts">
/**
 * The flourish on a deal struck or a lesson learned: a rubber stamp that
 * thumps down on the table, sits a moment and fades. The caller counts the
 * deals (`n`) and gives the word; nothing here can be tapped.
 */
withDefaults(defineProps<{
  /** How many times it has been stamped (0: never yet). */
  n: number
  text: string
  tone?: 'green' | 'gold' | 'blue'
}>(), { tone: 'green' })
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.deal-stamp
  +cel.tone('green')
  position: absolute
  left: 50%
  top: 42%
  z-index: 6
  translate: -50% -50%
  rotate: -9deg
  padding: 0.2em 0.9em
  border: var(--bc-ol-thick) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  +cel.fill(46%, 88%)
  box-shadow: 0 0.3rem 0 var(--bc-ink)
  pointer-events: none
  animation: stamp 1150ms var(--bc-ease-out) both
  // A second rule inside the edge, like a stamp's own frame.
  &::before
    content: ''
    position: absolute
    inset: 3px
    border: 2px dashed rgba(var(--bc-white-rgb), 0.7)
    border-radius: var(--bc-r-sm)
.deal-stamp--gold
  +cel.tone('gold')
.deal-stamp--blue
  +cel.tone('blue')
.deal-stamp__text
  position: relative
  +cel.label
  font-size: clamp(1.3rem, 6vmin, 2.3rem)
  letter-spacing: 0.05em
  line-height: 1.1
  text-transform: uppercase
  white-space: nowrap

@keyframes stamp
  0%
    opacity: 0
    transform: scale(2.4)
  14%
    opacity: 1
    transform: scale(0.9)
  22%
    transform: scale(1.06)
  30%
    transform: scale(1)
  78%
    opacity: 1
    transform: scale(1)
  100%
    opacity: 0
    transform: scale(1.04) translateY(-0.6rem)
@media (prefers-reduced-motion: reduce)
  .deal-stamp
    animation: stamp-still 1150ms linear both
@keyframes stamp-still
  0%, 80%
    opacity: 1
  100%
    opacity: 0
</style>
