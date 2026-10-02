<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UI_ART } from '@/game/assets/overrides'

/**
 * ─── The one bar (D42) ───────────────────────────────────────────────────────
 *
 * Health, mana, experience, heat, a target's or a boss's life, a journey's
 * progress: every bar in the game is this component, so they all read the
 * same way — a two-tone cel fill in an ink-outlined well, tick marks at 25,
 * 50 and 75 %, and a frame whose ornaments say how special its owner is.
 *
 * It never lays anything out when its value changes:
 *   • the fill, the damage ghost and the shield are `transform` only (a
 *     `scaleX` from the left edge), so a value change is a compositor job;
 *   • the GHOST is the same value on a slower, delayed transition: on a loss
 *     the fill snaps back and the pale ghost stays where the life was for a
 *     beat, then drains — the eye reads how much was just taken. On a gain
 *     the ghost jumps with the fill (there is nothing to mourn);
 *   • the ornaments are absolutely placed inside padding the frame reserves
 *     for them, so the bar's box is its whole picture: nothing hangs out over
 *     a neighbour, at 320 px wide or anywhere else.
 *
 * The thickness is `--fbar-h` (set it on the bar or any ancestor); every
 * ornament is sized off it.
 *
 * A painted frame replaces the code-drawn one when the file exists:
 * `public/images/ui/bar-frame-<frame>.webp` (see `art-todo.md`).
 */
export type BarFrame = 'plain' | 'hero' | 'mana' | 'xp' | 'elite' | 'champion' | 'boss'
export type BarTone = 'health' | 'mana' | 'xp' | 'heat' | 'enemy' | 'boss' | 'gold'

interface Props {
  /** How full, 0..1. */
  value: number
  /** A shield on top of the value, 0..1 of the same scale. */
  shield?: number
  /** What it measures (the fill's colour). */
  tone?: BarTone
  /** How ornate: `plain`; the hero's `hero` (health) and `mana`; `xp` (ticks,
   *  no ornaments); and by an enemy's rank `elite` (winged), `champion`
   *  (crested), `boss` (crowned, horned, winged, a gem at each end). */
  frame?: BarFrame
  /** Nearly empty: the fill turns red and pulses. */
  low?: boolean
  /** A number or word set on the bar. */
  text?: string | number
  /** The accessible name (the bar is one image to a screen reader). */
  label?: string
  /** The 25 / 50 / 75 % marks. */
  ticks?: boolean
  /** A painted frame's URL. Defaults to the drop-in file for this frame. */
  art?: string
}

const props = withDefaults(defineProps<Props>(), {
  shield: 0,
  tone: 'health',
  frame: 'plain',
  low: false,
  text: '',
  label: undefined,
  ticks: true,
  art: undefined
})

const clamp01 = (v: number): number => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0)
/** Four decimals: a sub-pixel change writes no new style. */
const round = (v: number): number => Math.round(v * 10000) / 10000

const v01 = computed(() => round(clamp01(props.value)))
const shield01 = computed(() => round(clamp01(props.shield)))
/** The shield hangs off the end of the fill; on a full bar it lies over its end. */
const shieldAt = computed(() => round(Math.min(v01.value, 1 - shield01.value)))

/** The experience bar is never painted: it has no frame to paint (D42). */
const frameArt = computed(() => props.art ?? (props.frame === 'xp' ? '' : UI_ART.get(`bar-frame-${props.frame}`) ?? ''))

// ── The ghost and the hit flash ──────────────────────────────────────────────
/** True while the last change was a gain: the ghost then follows at once. */
const rising = ref(true)
const flash = ref<HTMLElement | null>(null)
watch(v01, (now, was) => {
  rising.value = now >= was
  // A real loss (not a regen flicker) blinks the well.
  if (was - now > 0.02) {
    const el = flash.value
    if (el && typeof el.animate === 'function') {
      el.getAnimations().forEach(a => a.cancel())
      el.animate([{ opacity: 0.85 }, { opacity: 0 }], { duration: 260, easing: 'ease-out', fill: 'both' })
    }
  }
}, { flush: 'sync' })

const winged = computed(() => props.frame === 'elite' || props.frame === 'boss')
</script>

<template lang="pug">
  div.f-bar(
    :class="[`f-bar--${frame}`, `tone-${tone}`, { 'is-low': low, 'is-rising': rising, 'has-art': !!frameArt }]"
    role="img"
    :aria-label="label"
  )
    //- The metal bezel round the well (framed variants).
    span.f-bar__bezel(v-if="!frameArt && frame !== 'plain' && frame !== 'xp'" aria-hidden="true")
    span.f-bar__track
      span.f-bar__ghost(:style="{ transform: `scaleX(${v01})` }")
      span.f-bar__fill(:style="{ transform: `scaleX(${v01})` }")
      span.f-bar__shield(v-if="shield01 > 0" :style="{ transform: `translateX(${shieldAt * 100}%) scaleX(${shield01})` }")
      span.f-bar__ticks(v-if="ticks" aria-hidden="true")
        i
        i
        i
      span.f-bar__flash(ref="flash" aria-hidden="true")
    //- A painted frame, three-sliced: the caps keep their shape, the middle stretches.
    span.f-bar__art(v-if="frameArt" aria-hidden="true" :style="{ borderImageSource: `url(${frameArt})` }")
    //- The code-drawn ornaments. Decoration only: the box already reserves their room.
    template(v-else)
      //- Wings: an elite's and a boss's.
      template(v-if="winged")
        svg.f-bar__orn.f-bar__wing.is-left(viewBox="0 0 30 24" aria-hidden="true" focusable="false")
          path.o-base(d="M29 15C22 15 13 12 2 2c1 6 4 10 8 12-3 0-5-.5-7-1.500 2 4.500 6 7 11 7.500-2.500.6-4.500.6-6 .2 4 2.800 13 3.300 21 .8z")
          path.o-shade(d="M29 21c-8 2.500-17 2-21-.8 1.500.4 3.500.4 6-.2 5 0 10-1 15-2z")
          path.o-line(d="M10 14c5 2 11 2.500 17 2.500M14 20c5 0 10-1 14-1.500")
          path.o-edge(d="M29 15C22 15 13 12 2 2c1 6 4 10 8 12-3 0-5-.5-7-1.500 2 4.500 6 7 11 7.500-2.500.6-4.500.6-6 .2 4 2.800 13 3.300 21 .8z")
        svg.f-bar__orn.f-bar__wing.is-right(viewBox="0 0 30 24" aria-hidden="true" focusable="false")
          path.o-base(d="M29 15C22 15 13 12 2 2c1 6 4 10 8 12-3 0-5-.5-7-1.500 2 4.500 6 7 11 7.500-2.500.6-4.500.6-6 .2 4 2.800 13 3.300 21 .8z")
          path.o-shade(d="M29 21c-8 2.500-17 2-21-.8 1.500.4 3.500.4 6-.2 5 0 10-1 15-2z")
          path.o-line(d="M10 14c5 2 11 2.500 17 2.500M14 20c5 0 10-1 14-1.500")
          path.o-edge(d="M29 15C22 15 13 12 2 2c1 6 4 10 8 12-3 0-5-.5-7-1.500 2 4.500 6 7 11 7.500-2.500.6-4.500.6-6 .2 4 2.800 13 3.300 21 .8z")
      //- A gem at each end: the boss's alone.
      template(v-if="frame === 'boss'")
        svg.f-bar__orn.f-bar__gem.is-left(viewBox="0 0 16 16" aria-hidden="true" focusable="false")
          path.g-base(d="M8 1l7 7-7 7-7-7z")
          path.g-hi(d="M8 1L1 8h7z")
          path.g-lo(d="M8 15l7-7H8z")
          path.o-edge(d="M8 1l7 7-7 7-7-7z")
        svg.f-bar__orn.f-bar__gem.is-right(viewBox="0 0 16 16" aria-hidden="true" focusable="false")
          path.g-base(d="M8 1l7 7-7 7-7-7z")
          path.g-hi(d="M8 1L1 8h7z")
          path.g-lo(d="M8 15l7-7H8z")
          path.o-edge(d="M8 1l7 7-7 7-7-7z")
        //- The crown between its horns.
        svg.f-bar__orn.f-bar__crown(viewBox="0 0 72 26" aria-hidden="true" focusable="false")
          path.h-base(d="M22 24C12 24 4 17 3 3c5 7 10 10 18 11z")
          path.h-shade(d="M22 24C13 24 6 18.500 4 9c3 6 9 10 17.500 11.500z")
          path.o-edge(d="M22 24C12 24 4 17 3 3c5 7 10 10 18 11z")
          path.h-base(d="M50 24c10 0 18-7 19-21-5 7-10 10-18 11z")
          path.h-shade(d="M50 24c9 0 16-5.500 18-15-3 6-9 10-17.500 11.500z")
          path.o-edge(d="M50 24c10 0 18-7 19-21-5 7-10 10-18 11z")
          path.o-base(d="M24 24L21 9l8 6 7-11 7 11 8-6-3 15z")
          path.o-shade(d="M24 24l-1-5h26l-1 5z")
          path.o-edge(d="M24 24L21 9l8 6 7-11 7 11 8-6-3 15z")
          circle.g-base(cx="36" cy="18.500" r="2.600")
          circle.o-dot(cx="36" cy="4.500" r="2.200")
          circle.o-dot(cx="21" cy="9" r="1.800")
          circle.o-dot(cx="51" cy="9" r="1.800")
      //- A champion's crest and pointed end caps.
      template(v-else-if="frame === 'champion'")
        svg.f-bar__orn.f-bar__crest(viewBox="0 0 28 24" aria-hidden="true" focusable="false")
          path.o-base(d="M14 2l10 3v7c0 5-4 9-10 11C8 21 4 17 4 12V5z")
          path.o-shade(d="M14 2l10 3v7c0 5-4 9-10 11z")
          path.o-edge(d="M14 2l10 3v7c0 5-4 9-10 11C8 21 4 17 4 12V5z")
          path.g-base(d="M14 7l4.500 5-4.500 6-4.500-6z")
          path.g-hi(d="M14 7l-4.500 5H14z")
          path.o-thin(d="M14 7l4.500 5-4.500 6-4.500-6z")
        svg.f-bar__orn.f-bar__finial.is-left(viewBox="0 0 12 16" aria-hidden="true" focusable="false")
          path.o-base(d="M11 2L1.500 8 11 14z")
          path.o-shade(d="M11 8v6L1.500 8z")
          path.o-edge(d="M11 2L1.500 8 11 14z")
        svg.f-bar__orn.f-bar__finial.is-right(viewBox="0 0 12 16" aria-hidden="true" focusable="false")
          path.o-base(d="M11 2L1.500 8 11 14z")
          path.o-shade(d="M11 8v6L1.500 8z")
          path.o-edge(d="M11 2L1.500 8 11 14z")
      //- The hero's own: a heart (or a drop of mana) in a medallion, a finial on the far end.
      template(v-else-if="frame === 'hero' || frame === 'mana'")
        svg.f-bar__orn.f-bar__cap(viewBox="0 0 24 24" aria-hidden="true" focusable="false")
          circle.o-base(cx="12" cy="12" r="10.400")
          path.o-shade(d="M1.600 12a10.400 10.400 0 0 0 20.800 0z")
          circle.o-edge(cx="12" cy="12" r="10.400")
          circle.c-well(cx="12" cy="12" r="7.400")
          path.g-base(v-if="frame === 'hero'" d="M12 18.200C6.200 14 5.400 10.600 7 8.700c1.500-1.800 4-1.300 5 .7 1-2 3.500-2.500 5-.7 1.600 1.900.8 5.300-5 9.500z")
          path.g-base(v-else d="M12 5.200c2.400 3.600 4.600 5.800 4.600 8.400a4.600 4.600 0 0 1-9.200 0c0-2.600 2.200-4.800 4.600-8.400z")
          path.g-glint(v-if="frame === 'hero'" d="M8.600 9.800c.5-.9 1.300-1.200 2-.9")
          path.g-glint(v-else d="M10.200 11.200c.4-1 .9-1.700 1.400-2.400")
        svg.f-bar__orn.f-bar__finial.is-right(viewBox="0 0 12 16" aria-hidden="true" focusable="false")
          path.o-base(d="M11 2L1.500 8 11 14z")
          path.o-shade(d="M11 8v6L1.500 8z")
          path.o-edge(d="M11 2L1.500 8 11 14z")
    span.f-bar__text(v-if="text !== ''") {{ text }}
</template>

<style scoped lang="sass">
@use '@/assets/css/cel'

.f-bar
  // The bar's thickness; every ornament is a multiple of it.
  --u: var(--fbar-h, clamp(0.72rem, 2.9vmin, 1.05rem))
  // The bezel's width, and the room each frame reserves for its ornaments.
  --bz: 0px
  --pad-l: 0px
  --pad-r: 0px
  --pad-t: 0px
  --pad-b: 0px
  // The ornaments' metal.
  --o-hi: var(--bc-brass-hi)
  --o: var(--bc-brass)
  --o-lo: var(--bc-brass-lo)
  --gem: var(--bc-red)
  --gem-hi: var(--bc-red-hi)
  --gem-lo: var(--bc-red-lo)
  +cel.tone('green')
  position: relative
  display: block
  box-sizing: border-box
  padding: calc(var(--pad-t) + var(--bz)) calc(var(--pad-r) + var(--bz)) calc(var(--pad-b) + var(--bz) + var(--bc-press-sm)) calc(var(--pad-l) + var(--bz))
  pointer-events: none

// ── What it measures ─────────────────────────────────────────────────────────
.tone-mana
  +cel.tone('blue')
.tone-xp
  +cel.tone('purple')
.tone-heat
  +cel.tone('orange')
.tone-enemy
  +cel.tone('red')
.tone-boss
  +cel.tone('pink')
.tone-gold
  +cel.tone('gold')
.is-low
  +cel.tone('red')

// ── The well and what moves in it ────────────────────────────────────────────
.f-bar__track
  position: relative
  display: block
  height: var(--u)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  // A sunk well: the dark page with a harder shadow band under its top lip.
  background: linear-gradient(180deg, var(--bc-night) 0, var(--bc-night) 34%, var(--bc-slate-deep) 34%, var(--bc-slate-deep) 100%)
  box-shadow: 0 var(--bc-press-sm) 0 var(--bc-ink)
  overflow: hidden

.f-bar__ghost, .f-bar__fill, .f-bar__shield, .f-bar__flash
  position: absolute
  inset: 0
  transform-origin: left center

// The life that was just taken: pale, and slow to let go.
.f-bar__ghost
  background: var(--bc-paper-hi)
  opacity: 0.9
  transition: transform 620ms cubic-bezier(0.5, 0, 0.75, 0.4) 320ms
.is-rising .f-bar__ghost
  transition: none

.f-bar__fill
  +cel.fill(44%, 80%)
  // A loss is immediate; a gain eases in.
  transition: transform 110ms ease-out
.is-rising .f-bar__fill
  transition: transform 260ms var(--bc-ease-out)
// The pulse of a nearly empty bar: opacity only.
.is-low .f-bar__fill::after
  content: ''
  position: absolute
  inset: 0
  background: var(--bc-white)
  opacity: 0
  animation: fbar-low 0.7s ease-in-out infinite alternate

// The shield: white-blue, hatched so it never reads as health.
.f-bar__shield
  background: repeating-linear-gradient(115deg, var(--bc-steel-hi) 0, var(--bc-steel-hi) 0.3em, var(--bc-blue-hi) 0.3em, var(--bc-blue-hi) 0.6em)
  box-shadow: inset 0 0 0 1px var(--bc-ink)
  transition: transform 160ms ease-out

.f-bar__ticks
  position: absolute
  inset: 0
  pointer-events: none
  i
    position: absolute
    top: 0
    bottom: 0
    width: 2px
    margin-left: -1px
    background: rgba(var(--bc-ink-rgb), 0.5)
    // A pale edge, so a mark still shows on the empty well.
    box-shadow: 1px 0 0 rgba(var(--bc-white-rgb), 0.16)
    &:nth-child(1)
      left: 25%
    &:nth-child(2)
      left: 50%
      background: rgba(var(--bc-ink-rgb), 0.78)
    &:nth-child(3)
      left: 75%

.f-bar__flash
  background: var(--bc-white)
  opacity: 0

.f-bar__text
  position: absolute
  left: calc(var(--pad-l) + var(--bz))
  right: calc(var(--pad-r) + var(--bz))
  top: calc(var(--pad-t) + var(--bz))
  height: var(--u)
  display: flex
  align-items: center
  justify-content: center
  color: var(--bc-text)
  font-size: calc(var(--u) * 0.86)
  line-height: 1
  white-space: nowrap
  text-shadow: var(--bc-text-outline-thin)

// ── Frames ───────────────────────────────────────────────────────────────────
// The bezel: a two-tone metal band between two ink lines, round the well.
.f-bar__bezel
  position: absolute
  left: var(--pad-l)
  right: var(--pad-r)
  top: var(--pad-t)
  height: calc(var(--u) + var(--bz) * 2)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--o-hi) 0, var(--o-hi) 46%, var(--o-lo) 46%, var(--o-lo) 100%)
  box-shadow: 0 0 0 var(--bc-ol-thin) var(--bc-ink), 0 calc(var(--bc-press-sm) + 1px) 0 var(--bc-ol-thin) var(--bc-ink)

.f-bar--hero, .f-bar--mana, .f-bar--elite, .f-bar--champion, .f-bar--boss
  --bz: 3px
  .f-bar__track
    box-shadow: none

.f-bar--hero, .f-bar--mana
  --pad-l: calc(var(--u) * 1.25)
  --pad-r: calc(var(--u) * 0.5)
.f-bar--mana, .f-bar--elite
  --o-hi: var(--bc-steel-hi)
  --o: var(--bc-steel)
  --o-lo: var(--bc-steel-lo)
.f-bar--mana
  --gem: var(--bc-blue)
  --gem-hi: var(--bc-blue-hi)
  --gem-lo: var(--bc-blue-lo)

// Experience: a slim ticked rule, no ornaments.
.f-bar--xp
  .f-bar__track
    box-shadow: none
  &.f-bar
    padding-bottom: 0

.f-bar--elite
  --pad-l: calc(var(--u) * 1.75)
  --pad-r: calc(var(--u) * 1.75)
  --pad-t: calc(var(--u) * 0.5)
.f-bar--champion
  --pad-l: calc(var(--u) * 0.7)
  --pad-r: calc(var(--u) * 0.7)
  --pad-t: calc(var(--u) * 1.05)
.f-bar--boss
  --bz: 4px
  --pad-l: calc(var(--u) * 2.5)
  --pad-r: calc(var(--u) * 2.5)
  --pad-t: calc(var(--u) * 1.3)
  --gem: var(--bc-purple)
  --gem-hi: var(--bc-purple-hi)
  --gem-lo: var(--bc-purple-lo)

// ── Ornaments ────────────────────────────────────────────────────────────────
.f-bar__orn
  position: absolute
  display: block
  overflow: visible
  pointer-events: none
  // The centre line of the well, for anything hung at an end.
  --mid: calc(var(--pad-t) + var(--bz) + var(--u) / 2)
  path, circle
    stroke-linejoin: round
    stroke-linecap: round
  .o-base
    fill: var(--o-hi)
  .o-shade
    fill: var(--o-lo)
  .o-edge, .o-line, .o-thin
    fill: none
    stroke: var(--bc-ink)
    stroke-width: 2
  .o-line
    stroke-width: 1.3
  .o-thin
    stroke-width: 1.2
  .o-dot
    fill: var(--o-hi)
    stroke: var(--bc-ink)
    stroke-width: 1.5
  .h-base
    fill: var(--bc-paper-hi)
  .h-shade
    fill: var(--bc-paper-deep)
  .g-base
    fill: var(--gem)
    stroke: var(--bc-ink)
    stroke-width: 1.5
  .g-hi
    fill: var(--gem-hi)
  .g-lo
    fill: var(--gem-lo)
  .g-glint
    fill: none
    stroke: var(--bc-white)
    stroke-width: 1.4
  .c-well
    fill: var(--bc-slate-deep)
    stroke: var(--bc-ink)
    stroke-width: 1.5

.f-bar__wing
  width: calc(var(--u) * 2.3)
  height: calc(var(--u) * 1.84)
  top: calc(var(--mid) - var(--u) * 1.22)
  &.is-left
    left: calc(var(--pad-l) - var(--u) * 1.75)
  &.is-right
    right: calc(var(--pad-r) - var(--u) * 1.75)
    transform: scaleX(-1)
.f-bar--boss .f-bar__wing
  width: calc(var(--u) * 2.8)
  height: calc(var(--u) * 2.24)
  top: calc(var(--mid) - var(--u) * 1.5)
  &.is-left
    left: calc(var(--pad-l) - var(--u) * 2.5)
  &.is-right
    right: calc(var(--pad-r) - var(--u) * 2.5)

.f-bar__gem
  width: calc(var(--u) * 1.5)
  height: calc(var(--u) * 1.5)
  top: calc(var(--mid) - var(--u) * 0.75)
  &.is-left
    left: calc(var(--pad-l) - var(--u) * 1.15)
  &.is-right
    right: calc(var(--pad-r) - var(--u) * 1.15)

.f-bar__crown
  left: 50%
  width: calc(var(--u) * 4.7)
  height: calc(var(--u) * 1.7)
  margin-left: calc(var(--u) * -2.35)
  top: calc(var(--pad-t) - var(--u) * 1.3)

.f-bar__crest
  left: 50%
  width: calc(var(--u) * 1.75)
  height: calc(var(--u) * 1.5)
  margin-left: calc(var(--u) * -0.875)
  top: calc(var(--pad-t) - var(--u) * 1.05)

.f-bar__finial
  width: calc(var(--u) * 0.72)
  height: calc(var(--u) * 0.96)
  top: calc(var(--mid) - var(--u) * 0.48)
  &.is-left
    left: calc(var(--pad-l) - var(--u) * 0.62)
  &.is-right
    right: calc(var(--pad-r) - var(--u) * 0.62)
    transform: scaleX(-1)
.f-bar--hero .f-bar__finial, .f-bar--mana .f-bar__finial
  width: calc(var(--u) * 0.6)
  height: calc(var(--u) * 0.8)
  top: calc(var(--mid) - var(--u) * 0.4)
  &.is-right
    right: calc(var(--pad-r) - var(--u) * 0.5)

.f-bar__cap
  left: 0
  width: calc(var(--u) * 1.6)
  height: calc(var(--u) * 1.6)
  top: calc(var(--mid) - var(--u) * 0.8)

// ── A painted frame ──────────────────────────────────────────────────────────
// 512 × 128, the well's window 384 × 32 in the middle: the 64 px caps keep
// their shape (two bar-heights wide), the middle stretches.
.has-art
  --bz: 0px
  --pad-l: calc(var(--u) * 2)
  --pad-r: calc(var(--u) * 2)
  --pad-t: calc(var(--u) * 0.5)
  --pad-b: calc(var(--u) * 0.5)
  &.f-bar--champion, &.f-bar--boss
    --pad-t: calc(var(--u) * 1.5)
  .f-bar__track
    border-color: transparent
    box-shadow: none
.f-bar__art
  position: absolute
  left: 0
  right: 0
  top: calc(var(--pad-t) - var(--u) * 1.5)
  height: calc(var(--u) * 4)
  box-sizing: border-box
  border-style: solid
  border-width: 0 calc(var(--u) * 2)
  border-image-slice: 0 64 fill
  border-image-width: 0 calc(var(--u) * 2)
  border-image-repeat: stretch
  pointer-events: none

@keyframes fbar-low
  from
    opacity: 0
  to
    opacity: 0.42

@media (prefers-reduced-motion: reduce)
  .is-low .f-bar__fill::after
    animation: none
  .f-bar__ghost
    transition: none
</style>
