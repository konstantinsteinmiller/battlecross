<template lang="pug">
  span.art-icon(:class="[`frame-${frame}`, { 'is-dim': dim }]" :style="{ '--a': tint, '--b': soft }")
    img.art-icon__img(v-if="src" :src="src" alt="" draggable="false")
    svg.art-icon__svg(v-else viewBox="0 0 48 48" aria-hidden="true" focusable="false" v-html="markup")
    span.art-icon__gloss(v-if="frame !== 'none'" aria-hidden="true")
</template>

<script setup lang="ts">
/**
 * One drawing in a candy frame: an item, a skill, a status. The vector glyph
 * (`glyphs.ts`) is the placeholder; a painted file under `public/images/`
 * takes its place when `src` is given. The caller owns the size: the icon
 * fills its box and keeps a square.
 */
import { computed } from 'vue'
import { GLYPHS } from './glyphs'

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
.art-icon__img
  inset: 0
  width: 100%
  height: 100%
  object-fit: cover
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
