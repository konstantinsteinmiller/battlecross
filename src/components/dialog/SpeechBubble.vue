<template lang="pug">
  div.bubble(
    ref="root"
    :class="[`bubble--${tone}`, emotion ? `is-${emotion}` : '', { 'has-tail': tail, 'is-typed': cue }]"
  )
    div.bubble__body
      span.bubble__name(v-if="name") {{ name }}
      //- The typewriter writes these two spans directly: what is revealed, and
      //- the rest kept invisible in place, so the bubble never reflows as it types.
      p.bubble__text(dir="auto" aria-hidden="true")
        span(ref="shownEl")
        span.bubble__rest(ref="restEl")
      span.bubble__sr(aria-live="polite") {{ text }}
      span.bubble__next(v-if="cue" aria-hidden="true")
        GameIcon(name="down")
      span.bubble__tail(v-if="tail" aria-hidden="true")
</template>

<script setup lang="ts">
/**
 * One spoken line: a paper bubble with the speaker's name on a ribbon, a tail
 * that points at them, and a typewriter. The hero's bubble is a different
 * paper; the storyteller's is a dark caption without a tail.
 *
 * It only DRAWS. Where it sits, when it types and what it says are the
 * layer's (`DialogLayer.vue`), which positions the root by a transform and
 * calls `reveal`.
 */
import { onMounted, ref, watch } from 'vue'
import { graphemes } from '@/game/dialog/pacing'
import GameIcon from '@/components/icons/GameIcon.vue'

const props = withDefaults(defineProps<{
  text: string
  name?: string
  /** Whose paper: the person spoken to, the hero, or the storyteller. */
  tone?: 'npc' | 'hero' | 'narrator'
  emotion?: string
  /** Draw the tail (the layer aims it with `--tail-x`). */
  tail?: boolean
  /** The line is fully shown and waits for the player: the "next" cue. */
  cue?: boolean
}>(), { name: '', tone: 'npc', emotion: '', tail: false, cue: false })

const root = ref<HTMLElement | null>(null)
const shownEl = ref<HTMLElement | null>(null)
const restEl = ref<HTMLElement | null>(null)
let chars: string[] = []
let shown = -1

/** Show the first `n` characters (all of them when `n` is past the end). */
const reveal = (n: number): void => {
  const a = shownEl.value
  const b = restEl.value
  if (!a || !b) return
  const k = Math.max(0, Math.min(chars.length, n))
  if (k === shown) return
  shown = k
  a.textContent = chars.slice(0, k).join('')
  b.textContent = chars.slice(k).join('')
}

const reset = (): void => {
  chars = graphemes(props.text)
  shown = -1
  reveal(0)
}
onMounted(reset)
// The words may change under a line (the language was switched): show them whole.
watch(() => props.text, () => { const all = shown >= chars.length; reset(); if (all) reveal(Infinity) })

defineExpose({ el: root, reveal, length: (): number => chars.length })
</script>

<style scoped lang="sass">
.bubble
  --tail-x: 50%
  --paper: var(--bc-paper-hi)
  --paper-lo: var(--bc-paper-lo)
  --ribbon-hi: var(--bc-orange-hi)
  --ribbon: var(--bc-orange)
  --ribbon-lo: var(--bc-orange-lo)
  position: relative
  box-sizing: border-box
  max-width: 100%
  // The ribbon overhangs the top edge, the tail and the "next" cue the bottom
  // one: keep room for them inside the box the layer measures and clamps.
  padding: 0.75em 0 0.62em
  font-family: var(--font-ui)
  font-size: clamp(0.86rem, 3.6vmin, 1.08rem)
  pointer-events: none
.bubble__body
  position: relative
  padding: 0.75em 0.95em 0.7em
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-lg)
  // Flat paper with a hard shadow lip along the bottom (cel, not a gradient).
  background: linear-gradient(180deg, var(--paper) 0, var(--paper) calc(100% - 0.4em), var(--paper-lo) calc(100% - 0.4em), var(--paper-lo) 100%)
  box-shadow: 0 var(--bc-press) 0 rgba(var(--bc-ink-rgb), 0.55)
  color: var(--bc-paper-ink)
  transform-origin: var(--tail-x) 100%
  animation: bubble-pop 240ms var(--bc-ease-pop) both
.bubble__name
  position: absolute
  top: 0
  inset-inline-start: 0.8em
  transform: translateY(-62%)
  max-width: calc(100% - 1.6em)
  padding: 0.12em 0.7em 0.16em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--ribbon-hi) 0, var(--ribbon-hi) 46%, var(--ribbon) 46%, var(--ribbon) 100%)
  color: var(--bc-text)
  text-shadow: var(--bc-text-outline-thin)
  font-size: 0.8em
  line-height: 1.2
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
.bubble__text
  margin: 0
  line-height: 1.34
  overflow-wrap: anywhere
  // Latin words break at spaces; a script without spaces may break anywhere.
  line-break: auto
  text-align: start
.bubble__rest
  opacity: 0
.bubble__sr
  position: absolute
  width: 1px
  height: 1px
  overflow: hidden
  clip-path: inset(50%)
  white-space: nowrap
.bubble__next
  position: absolute
  inset-inline-end: 0.7em
  bottom: -0.62em
  box-sizing: border-box
  width: 1.3em
  height: 1.3em
  padding: 0.12em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--ribbon)
  color: var(--bc-white)
  animation: bubble-next 720ms ease-in-out infinite alternate
.bubble__tail
  position: absolute
  left: var(--tail-x)
  bottom: 0
  width: 0.95em
  height: 0.95em
  border: var(--bc-ol) solid var(--bc-ink)
  border-top-color: transparent
  border-left-color: transparent
  border-bottom-right-radius: 0.2em
  background: var(--paper-lo)
  transform: translate(-50%, 58%) rotate(45deg)
  // Only the lower half shows: the upper one would cut into the paper.
  clip-path: polygon(110% -10%, 110% 110%, -10% 110%)

// Hanging UNDER its speaker (the layer adds the class): the tail points up
// from the top edge, and the name moves to the bottom one.
.bubble.tail-up
  .bubble__body
    transform-origin: var(--tail-x) 0
  .bubble__tail
    bottom: auto
    top: 0
    border-color: transparent
    border-top-color: var(--bc-ink)
    border-left-color: var(--bc-ink)
    border-radius: 0.2em 0 0 0
    background: var(--paper)
    transform: translate(-50%, -58%) rotate(45deg)
    clip-path: polygon(-10% -10%, 110% -10%, -10% 110%)
  .bubble__name
    top: auto
    bottom: 0
    transform: translateY(62%)

// The hero speaks on his own paper.
.bubble--hero
  --paper: var(--bc-white)
  --paper-lo: var(--bc-blue-hi)
  --ribbon-hi: var(--bc-blue-hi)
  --ribbon: var(--bc-blue)
  --ribbon-lo: var(--bc-blue-lo)
// The storyteller: a dark caption, no ribbon, no tail.
.bubble--narrator
  .bubble__body
    border-color: var(--bc-ink)
    background: linear-gradient(180deg, var(--bc-slate) 0, var(--bc-slate) calc(100% - 0.4em), var(--bc-slate-deep) calc(100% - 0.4em), var(--bc-slate-deep) 100%)
    color: var(--bc-text-soft)
  .bubble__text
    text-align: center
    font-style: italic
  .bubble__next
    background: var(--bc-gold)
    color: var(--bc-ink)

// How it is said.
.is-shout .bubble__body
  animation: bubble-pop 240ms var(--bc-ease-pop) both, bubble-shake 300ms 200ms linear
.is-shout .bubble__text, .is-angry .bubble__text
  letter-spacing: 0.01em
.is-whisper
  font-size: clamp(0.8rem, 3.3vmin, 1rem)
  .bubble__body
    border-style: dashed
.is-excited .bubble__body, .is-afraid .bubble__body
  animation: bubble-pop 240ms var(--bc-ease-pop) both, bubble-shake 260ms 180ms linear

@keyframes bubble-pop
  from
    opacity: 0
    transform: scale(0.72) translateY(0.4em)
  to
    opacity: 1
    transform: none
@keyframes bubble-shake
  0%, 100%
    transform: none
  25%
    transform: translateX(-0.12em) rotate(-0.6deg)
  75%
    transform: translateX(0.12em) rotate(0.6deg)
@keyframes bubble-next
  from
    transform: translateY(-0.12em)
  to
    transform: translateY(0.14em)
@media (prefers-reduced-motion: reduce)
  .bubble__body, .bubble__next
    animation: none
</style>
