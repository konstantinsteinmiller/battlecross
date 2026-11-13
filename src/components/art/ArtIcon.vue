<template lang="pug">
  span.art-icon(:class="[`frame-${frame}`, { 'is-dim': dim, 'is-wait': waiting, 'is-reveal': revealed }]" :style="{ '--a': tint, '--b': soft }")
    img.art-icon__img(v-if="paint" v-show="!waiting" :src="src" alt="" draggable="false" @load="onLoad" @error="onError")
    svg.art-icon__svg(v-if="!paint" viewBox="0 0 48 48" aria-hidden="true" focusable="false" v-html="markup")
    //- Waiting for the painted file (and its neighbours): a grey box with a question mark.
    svg.art-icon__wait(v-if="waiting" viewBox="0 0 48 48" aria-hidden="true" focusable="false" data-icon-wait)
      text(x="24" y="34.5" text-anchor="middle") ?
    span.art-icon__gloss(v-if="frame !== 'none' && !waiting" aria-hidden="true")
</template>

<script setup lang="ts">
/**
 * One drawing in a candy frame: an item, a skill, a status. The vector glyph
 * (`glyphs.ts`) is the placeholder; a painted file under `public/images/`
 * takes its place when `src` is given. The caller owns the size: the icon
 * fills its box and keeps a square.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { GLYPHS } from './glyphs'
import { begin, end, inFlight, isLoaded, release } from './iconReveal'

const props = withDefaults(defineProps<{
  glyph: string
  /** The owner's colour: a tier, a class, a status family. */
  tint?: string
  /** A painted override. */
  src?: string
  /** `chip`: rounded square (items, active skills). `round`: passives,
   *  statuses. `none`: the bare drawing. */
  frame?: 'chip' | 'round' | 'none'
  /** Locked / unaffordable. */
  dim?: boolean
}>(), { tint: '#7fd8ff', src: '', frame: 'chip', dim: false })

const markup = computed(() => GLYPHS[props.glyph] ?? GLYPHS.unknown!)
const soft = computed(() => `color-mix(in srgb, ${props.tint} 45%, #ffffff)`)

// ── Painted files arrive together (`iconReveal.ts`) ──
/** The painted file failed: the vector drawing stands in for it. */
const failed = ref(false)
const paint = computed(() => !!props.src && !failed.value)
/** Held back (a placeholder shows) until every icon of the burst has its file. */
const waiting = ref(false)
/** The small reveal plays once, when a held icon is let go. */
const revealed = ref(false)
let counted = false
let giveUp: ReturnType<typeof setTimeout> | undefined
let revealT: ReturnType<typeof setTimeout> | undefined

const done = (src?: string): void => {
  if (!counted) return
  counted = false
  clearTimeout(giveUp)
  end(src)
}

const arm = (): void => {
  done()
  failed.value = false
  waiting.value = false
  if (!props.src) return
  const ready = isLoaded(props.src)
  // Everything to hand and nothing else coming in: just there.
  if (ready && inFlight() === 0) return
  waiting.value = true
  if (!ready) {
    counted = true
    begin()
    // A file that never answers must not hold a modal's icons for ever.
    giveUp = setTimeout(() => done(), 8000)
  }
}
arm()
watch(() => props.src, arm)

const onLoad = (): void => done(props.src)
const onError = (): void => { failed.value = true; done() }

// The burst is over: every held icon lets go at once.
watch(release, () => {
  if (!waiting.value || counted) return
  waiting.value = false
  revealed.value = true
  clearTimeout(revealT)
  revealT = setTimeout(() => { revealed.value = false }, 520)
})
onBeforeUnmount(() => { done(); clearTimeout(revealT) })
</script>

<style scoped lang="sass">
.art-icon
  --ol: #1b1626
  --gold: #ffd24a
  position: relative
  display: block
  width: 100%
  aspect-ratio: 1
  flex: 0 0 auto
  user-select: none
  -webkit-user-drag: none
.frame-chip, .frame-round
  border-radius: 24%
  background: radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--a) 62%, #2a2440) 0%, #241d38 78%)
  box-shadow: inset 0 0 0 0.14em color-mix(in srgb, var(--a) 80%, #ffffff), 0 0 0 0.12em #0f1a30, 0 0.22em 0 0.12em #0f1a30
  overflow: hidden
.frame-round
  border-radius: 50%
.art-icon__svg, .art-icon__img
  position: absolute
  inset: 10%
  width: 80%
  height: 80%
  object-fit: contain
  pointer-events: none
.frame-none .art-icon__svg, .frame-none .art-icon__img
  inset: 0
  width: 100%
  height: 100%
// A painted file is cut with its object filling about 90 % of the square
// (`tools/slice-sheets.mjs`). Drawn at 92 % of the chip that is 83 % of it:
// the size of the boldest vector glyphs, and clear of the inset ring.
.art-icon__img
  inset: 4%
  width: 92%
  height: 92%
  object-fit: contain
// Waiting for its file: a grey box with a white question mark (the same box the painted icon then fills).
.art-icon.is-wait
  background: radial-gradient(circle at 50% 30%, #8a8f9c 0%, #5d6270 78%)
  box-shadow: inset 0 0 0 0.14em #aab0bd, 0 0 0 0.12em #0f1a30, 0 0.22em 0 0.12em #0f1a30
.art-icon__wait
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  pointer-events: none
  text
    fill: #ffffff
    stroke: #1b1626
    stroke-width: 2.4
    paint-order: stroke fill
    stroke-linejoin: round
    font: 900 30px var(--bc-font-display, system-ui, sans-serif)
// The reveal: the box warms to the icon's colour and the painted file pops in with a little overshoot.
.art-icon.is-reveal
  animation: icon-warm 0.42s ease-out
  .art-icon__img
    animation: icon-pop 0.42s cubic-bezier(0.2, 1.5, 0.4, 1) both
@keyframes icon-pop
  0%
    opacity: 0
    transform: scale(0.55) rotate(-6deg)
  100%
    opacity: 1
    transform: none
@keyframes icon-warm
  0%
    filter: grayscale(1) brightness(1.15)
  100%
    filter: none
@media (prefers-reduced-motion: reduce)
  .art-icon.is-reveal, .art-icon.is-reveal .art-icon__img
    animation: none
.art-icon__gloss
  position: absolute
  inset: 6% 8% 52% 8%
  border-radius: 40% 40% 60% 60% / 60% 60% 40% 40%
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.04))
  pointer-events: none
.is-dim
  filter: grayscale(0.85) brightness(0.62)

.art-icon__svg
  :deep(*)
    stroke: var(--ol)
    stroke-width: 2.6
    stroke-linejoin: round
    stroke-linecap: round
  :deep(.a)
    fill: var(--a)
  :deep(.b)
    fill: var(--b)
  :deep(.w)
    fill: #ffffff
  :deep(.d)
    fill: var(--ol)
  :deep(.m)
    fill: #d8dde8
  :deep(.g)
    fill: var(--gold)
  :deep(.k)
    fill: #a8733f
  :deep(.r)
    fill: #ff5a6a
  :deep(.u)
    fill: #5fb8ff
  :deep(.e)
    fill: #7ee05a
  :deep(.n)
    fill: none
    stroke: #ffffff
    stroke-width: 3.4
  :deep(.i)
    fill: none
    stroke: var(--ol)
    stroke-width: 3.4
  :deep(g)
    stroke: inherit
</style>
