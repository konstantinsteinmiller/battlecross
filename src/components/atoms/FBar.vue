<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UI_ART } from '@/game/assets/overrides'
import { CREST_BOX, CROWN_BOX, FINIAL_BOX, GEM_BOX, THEME_PALETTE, WING_BOX, crestBody, crownBody, finialBody, gemBody, wingBody } from '@/game/art/barFrameRefs'
import { LEVEL_TIER_COLORS, type LevelTier } from '@/game/data/zones'

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
  /** A level, in a round framed badge at the bar's right end (0: none, roadmap #77). */
  level?: number
  /** How that level sits against the hero's: the badge's colour (`unitLevelTier`). */
  tier?: LevelTier
  /** Marks at these shares instead of the quarter ticks: a boss's phase lines. */
  marks?: readonly number[]
}

const props = withDefaults(defineProps<Props>(), {
  shield: 0,
  tone: 'health',
  frame: 'plain',
  low: false,
  text: '',
  label: undefined,
  ticks: true,
  art: undefined,
  level: 0,
  tier: 'match',
  marks: undefined
})

const clamp01 = (v: number): number => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0)
/** Four decimals: a sub-pixel change writes no new style. */
const round = (v: number): number => Math.round(v * 10000) / 10000

const v01 = computed(() => round(clamp01(props.value)))
const shield01 = computed(() => round(clamp01(props.shield)))
/** The shield hangs off the end of the fill; on a full bar it lies over its end. */
const shieldAt = computed(() => round(Math.min(v01.value, 1 - shield01.value)))

/**
 * Off while the painted frames do not register with the live well (the first paintings
 * did not: an 8:1 well in a square file). The drawn frame shows instead; a caller can
 * still pass `art` to try a file.
 */
const PAINTED_FRAMES_FIT = true
/** The experience bar is never painted: it has no frame to paint (D42). */
const frameArt = computed(() => props.art ?? (props.frame === 'xp' || !PAINTED_FRAMES_FIT ? '' : UI_ART.get(`bar-frame-${props.frame}`) ?? ''))

// ── The ghost and the hit flash ──────────────────────────────────────────────
/** True while the last change was a gain: the ghost then follows at once. */
const rising = ref(true)
const flash = ref<HTMLElement | null>(null)
/** The blink running now (cancelled by hand: `getAnimations()` forces a style recalc). */
let blink: Animation | null = null
watch(v01, (now, was) => {
  rising.value = now >= was
  // A real loss (not a regen flicker) blinks the well.
  if (was - now > 0.02) {
    const el = flash.value
    if (el && typeof el.animate === 'function') {
      blink?.cancel()
      blink = el.animate([{ opacity: 0.85 }, { opacity: 0 }], { duration: 260, easing: 'ease-out', fill: 'both' })
    }
  }
}, { flush: 'sync' })

// The ornaments' markup: built once, coloured by the frame's CSS variables.
const wing = wingBody(THEME_PALETTE)
const gem = gemBody(THEME_PALETTE, true)
const starGem = gemBody(THEME_PALETTE)
const crown = crownBody(THEME_PALETTE)
const crest = crestBody(THEME_PALETTE)
const finial = finialBody(THEME_PALETTE)

const winged = computed(() => props.frame === 'elite' || props.frame === 'boss')
const badge = computed(() => (props.level > 0 ? LEVEL_TIER_COLORS[props.tier] : null))
/** A boss's phase lines, inside the bar (never at its ends). */
const phaseMarks = computed(() => (props.marks ?? []).filter(m => m > 0.01 && m < 0.99))
</script>

<template lang="pug">
  div.f-bar(
    :class="[`f-bar--${frame}`, `tone-${tone}`, { 'is-low': low, 'is-rising': rising, 'has-art': !!frameArt, 'has-level': !!badge }]"
    role="img"
    :aria-label="label"
  )
    //- The metal bezel round the well (framed variants).
    span.f-bar__bezel(v-if="!frameArt && frame !== 'plain' && frame !== 'xp'" aria-hidden="true")
    span.f-bar__track
      span.f-bar__ghost(:style="{ transform: `scaleX(${v01})` }")
      span.f-bar__fill(:style="{ transform: `scaleX(${v01})` }")
      span.f-bar__shield(v-if="shield01 > 0" :style="{ transform: `translateX(${shieldAt * 100}%) scaleX(${shield01})` }")
      span.f-bar__ticks(v-if="ticks && !phaseMarks.length" aria-hidden="true")
        i
        i
        i
      //- A boss's phase lines: where its fight changes.
      span.f-bar__phases(v-else-if="phaseMarks.length" aria-hidden="true")
        i(v-for="m in phaseMarks" :key="m" :style="{ left: `${Math.round(m * 1000) / 10}%` }")
      span.f-bar__flash(ref="flash" aria-hidden="true")
    //- A painted frame, five-sliced: the caps and the middle ornament (crest, crown, stones)
    //- keep their shape, only the plain stretches of rim between them stretch.
    span.f-bar__art(v-if="frameArt" aria-hidden="true" :style="{ '--art': `url(${frameArt})` }")
      i.is-cap-l
      i.is-rim-l
      i.is-mid
      i.is-rim-r
      i.is-cap-r
    //- The code-drawn ornaments (the shapes live in `game/art/barFrameRefs.ts`, which
    //- is also what the painter is shown). Decoration only: the box already reserves their room.
    template(v-else)
      //- Wings: an elite's and a boss's.
      template(v-if="winged")
        svg.f-bar__orn.f-bar__wing.is-left(:viewBox="WING_BOX" aria-hidden="true" focusable="false" v-html="wing")
        svg.f-bar__orn.f-bar__wing.is-right(:viewBox="WING_BOX" aria-hidden="true" focusable="false" v-html="wing")
      //- A gem at each end: a boss's (purple) and an elite's (amber); the level badge is the right one's place.
      template(v-if="frame === 'boss' || frame === 'elite'")
        svg.f-bar__orn.f-bar__gem.is-left(:viewBox="GEM_BOX" aria-hidden="true" focusable="false" v-html="gem")
        svg.f-bar__orn.f-bar__gem.is-right(v-if="!badge" :viewBox="GEM_BOX" aria-hidden="true" focusable="false" v-html="gem")
        //- The crown between its horns.
        svg.f-bar__orn.f-bar__crown(v-if="frame === 'boss'" :viewBox="CROWN_BOX" aria-hidden="true" focusable="false" v-html="crown")
        //- An elite's small star over the middle.
        svg.f-bar__orn.f-bar__star(v-else :viewBox="GEM_BOX" aria-hidden="true" focusable="false" v-html="starGem")
      //- A champion's winged crest and gilded scroll-and-gem end caps.
      template(v-else-if="frame === 'champion'")
        svg.f-bar__orn.f-bar__crest(:viewBox="CREST_BOX" aria-hidden="true" focusable="false" v-html="crest")
        svg.f-bar__orn.f-bar__finial.is-left(:viewBox="FINIAL_BOX" aria-hidden="true" focusable="false" v-html="finial")
        svg.f-bar__orn.f-bar__finial.is-right(:viewBox="FINIAL_BOX" aria-hidden="true" focusable="false" v-html="finial")
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
        svg.f-bar__orn.f-bar__finial.is-right(:viewBox="FINIAL_BOX" aria-hidden="true" focusable="false" v-html="finial")
    //- The level: a round framed badge, the bar's right end (not an ornament: it carries the number).
    span.f-bar__lvl(v-if="badge" :style="{ '--lv-bg': badge.bg, '--lv-ink': badge.ink }" :class="`is-${tier}`" data-level)
      span.f-bar__lvl-n {{ level }}
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
  // The level badge's room past the bar's right end (0 without one).
  --lv: 0px
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
  padding: calc(var(--pad-t) + var(--bz)) calc(var(--pad-r) + var(--lv) + var(--bz)) calc(var(--pad-b) + var(--bz) + var(--bc-press-sm)) calc(var(--pad-l) + var(--bz))
  pointer-events: none

// ── What it measures ─────────────────────────────────────────────────────────
.tone-mana
  +cel.tone('blue')
// Health reads as the heart on its cap does: the light reddish ramp (never green, never the boss's blood).
.tone-health
  +cel.tone('red')
.tone-xp
  +cel.tone('purple')
.tone-heat
  +cel.tone('orange')
.tone-enemy
  +cel.tone('red')
.tone-boss
  +cel.tone('blood')
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

// A boss's phase lines: a gold notch across the well with an ink edge.
.f-bar__phases
  position: absolute
  inset: 0
  pointer-events: none
  i
    position: absolute
    top: -1px
    bottom: -1px
    width: 3px
    margin-left: -1.5px
    background: var(--bc-gold-hi)
    box-shadow: 0 0 0 1px var(--bc-ink)

// A boss's life shines: a slow light across the fill (transform only).
.f-bar--boss .f-bar__fill::before
  content: ''
  position: absolute
  inset: 0
  background: linear-gradient(100deg, transparent 0, transparent 40%, rgba(var(--bc-white-rgb), 0.38) 47%, transparent 54%, transparent 100%)
  transform: translateX(-100%)
  animation: fbar-shine 3.2s ease-in-out infinite

// ── The level badge: round, framed, the bar's right end ──────────────────────
.has-level
  --lv: calc(var(--u) * 1.7)
.f-bar__lvl
  position: absolute
  // Overlapping the bar's end a little: a continuation of it, not a neighbour.
  right: var(--pad-r)
  top: calc(var(--pad-t) + var(--bz) + var(--u) / 2 - var(--u) * 1.1)
  width: calc(var(--u) * 2.2)
  height: calc(var(--u) * 2.2)
  box-sizing: border-box
  border-radius: 50%
  border: calc(var(--bz) + 2px) solid var(--o-hi)
  background: linear-gradient(180deg, color-mix(in srgb, var(--lv-bg) 78%, var(--bc-white)) 0, color-mix(in srgb, var(--lv-bg) 78%, var(--bc-white)) 48%, var(--lv-bg) 48%, var(--lv-bg) 100%)
  box-shadow: 0 0 0 var(--bc-ol-thin) var(--bc-ink), inset 0 0 0 var(--bc-ol-thin) var(--bc-ink), 0 var(--bc-press-sm) 0 var(--bc-ol-thin) var(--bc-ink)
  display: flex
  align-items: center
  justify-content: center
  pointer-events: none
  // A deadly one is rimmed in hot red.
  &.is-deadly
    border-color: var(--bc-red-hi)
.f-bar__lvl-n
  color: var(--lv-ink)
  font-size: calc(var(--u) * 0.95)
  font-weight: 900
  line-height: 1
  letter-spacing: -0.02em
  text-shadow: 0 1px 0 rgba(var(--bc-ink-rgb), 0.55)
.f-bar__lvl.is-low .f-bar__lvl-n
  text-shadow: none

.f-bar__text
  position: absolute
  left: calc(var(--pad-l) + var(--bz))
  right: calc(var(--pad-r) + var(--lv) + var(--bz))
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
  right: calc(var(--pad-r) + var(--lv))
  top: var(--pad-t)
  height: calc(var(--u) + var(--bz) * 2)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--o-hi) 0, var(--o-hi) 46%, var(--o-lo) 46%, var(--o-lo) 100%)
  box-shadow: 0 0 0 var(--bc-ol-thin) var(--bc-ink), 0 calc(var(--bc-press-sm) + 1px) 0 var(--bc-ol-thin) var(--bc-ink)

// A rank shows in the metal's outer ring: an elite's cold white, a champion's gold,
// a boss's blood red between two lines of ink.
.f-bar--elite .f-bar__bezel
  box-shadow: 0 0 0 var(--bc-ol-thin) var(--bc-ink), 0 0 0 calc(var(--bc-ol-thin) + 2px) var(--bc-white), 0 0 0 calc(var(--bc-ol-thin) * 2 + 2px) var(--bc-ink), 0 calc(var(--bc-press-sm) + 3px) 0 var(--bc-ol-thin) var(--bc-ink)
.f-bar--champion .f-bar__bezel
  box-shadow: 0 0 0 var(--bc-ol-thin) var(--bc-ink), 0 0 0 calc(var(--bc-ol-thin) + 2px) var(--bc-gold-hi), 0 0 0 calc(var(--bc-ol-thin) * 2 + 2px) var(--bc-ink), 0 calc(var(--bc-press-sm) + 3px) 0 var(--bc-ol-thin) var(--bc-ink)
.f-bar--boss .f-bar__bezel
  box-shadow: 0 0 0 var(--bc-ol-thin) var(--bc-ink), 0 0 0 calc(var(--bc-ol-thin) + 3px) var(--bc-blood-hi, var(--bc-red)), 0 0 0 calc(var(--bc-ol-thin) * 2 + 3px) var(--bc-ink), 0 calc(var(--bc-press-sm) + 4px) 0 var(--bc-ol-thin) var(--bc-ink)

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
  --pad-l: calc(var(--u) * 3.5)
  --pad-r: calc(var(--u) * 3.5)
  --pad-t: calc(var(--u) * 0.7)
  --gem: var(--bc-orange)
  --gem-hi: var(--bc-gold-hi)
  --gem-lo: var(--bc-orange-lo)
.f-bar--champion
  --pad-l: calc(var(--u) * 1.1)
  --pad-r: calc(var(--u) * 1.1)
  --pad-t: calc(var(--u) * 1.5)
.f-bar--boss
  --bz: 4px
  --pad-l: calc(var(--u) * 4.5)
  --pad-r: calc(var(--u) * 4.5)
  --pad-t: calc(var(--u) * 2.5)
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

// Wings end under the gem at the bar's end (or under the level badge), never over the well.
// 46 x 30: five feathers, the root (right edge) tucked under the end gem.
.f-bar__wing
  width: calc(var(--u) * 3.3)
  height: calc(var(--u) * 2.15)
  top: calc(var(--mid) - var(--u) * 1.45)
  &.is-left
    left: calc(var(--pad-l) - var(--u) * 3.4)
  &.is-right
    right: calc(var(--pad-r) - var(--u) * 3.4)
    transform: scaleX(-1)
.f-bar--boss .f-bar__wing
  width: calc(var(--u) * 4.6)
  height: calc(var(--u) * 3)
  top: calc(var(--mid) - var(--u) * 2)
  &.is-left
    left: calc(var(--pad-l) - var(--u) * 4.7)
  &.is-right
    right: calc(var(--pad-r) - var(--u) * 4.7)
// With a level badge the right wing grows out from behind it.
.has-level .f-bar__wing.is-right
  right: calc(var(--pad-r) - var(--u) * 2.6)
.has-level.f-bar--boss .f-bar__wing.is-right
  right: calc(var(--pad-r) - var(--u) * 3.7)

// A gem caps each end, its inner point just over the bezel.
// 18 x 22: a cut stone, taller than wide.
.f-bar__gem
  width: calc(var(--u) * 1.5)
  height: calc(var(--u) * 1.83)
  top: calc(var(--mid) - var(--u) * 0.92)
  &.is-left
    left: calc(var(--pad-l) - var(--u) * 1.25)
  &.is-right
    right: calc(var(--pad-r) - var(--u) * 1.25)
.f-bar--elite .f-bar__gem
  width: calc(var(--u) * 1.15)
  height: calc(var(--u) * 1.4)
  top: calc(var(--mid) - var(--u) * 0.7)
  &.is-left
    left: calc(var(--pad-l) - var(--u) * 1)
  &.is-right
    right: calc(var(--pad-r) - var(--u) * 1)

// The crown stands ON the bezel: its base just meets the metal, never the well.
// 96 x 34: horns sweep out to both sides, five jewelled points rise between them.
.f-bar__crown
  left: 50%
  width: calc(var(--u) * 8)
  height: calc(var(--u) * 2.83)
  margin-left: calc(var(--u) * -4)
  top: calc(var(--pad-t) - var(--u) * 2.45)
// An elite's star: a small stone on the bezel's middle.
.f-bar__star
  left: 50%
  width: calc(var(--u) * 0.9)
  height: calc(var(--u) * 1.1)
  margin-left: calc(var(--u) * -0.45)
  top: calc(var(--pad-t) - var(--u) * 0.75)
// The stones' halo: an opacity pulse, nothing else moves.
.f-bar__orn :deep(.g-glow)
  opacity: 0.32
  animation: fbar-gem 2.4s ease-in-out infinite alternate

// 52 x 30: a shield between two swept blades.
.f-bar__crest
  left: 50%
  width: calc(var(--u) * 3.3)
  height: calc(var(--u) * 1.9)
  margin-left: calc(var(--u) * -1.65)
  top: calc(var(--pad-t) - var(--u) * 1.5)

.f-bar__finial
  width: calc(var(--u) * 0.72)
  height: calc(var(--u) * 0.96)
  top: calc(var(--mid) - var(--u) * 0.48)
.f-bar--champion .f-bar__finial
  width: calc(var(--u) * 1.1)
  height: calc(var(--u) * 1.57)
  top: calc(var(--mid) - var(--u) * 0.78)
  &.is-left
    left: calc(var(--pad-l) - var(--u) * 0.62)
  &.is-right
    right: calc(var(--pad-r) - var(--u) * 0.62)
    transform: scaleX(-1)
.f-bar--hero .f-bar__finial, .f-bar--mana .f-bar__finial
  width: calc(var(--u) * 1.1)
  height: calc(var(--u) * 1.57)
  top: calc(var(--mid) - var(--u) * 0.78)
  &.is-right
    right: calc(var(--pad-r) - var(--u) * 0.45)
    transform: scaleX(-1)

.f-bar__cap
  left: 0
  width: calc(var(--u) * 1.6)
  height: calc(var(--u) * 1.6)
  top: calc(var(--mid) - var(--u) * 0.8)

// ── A painted frame ──────────────────────────────────────────────────────────
// The frame is the file: a 4:1 strip, 512 × 128, the well's window 384 × 32 (12:1) in
// the middle. The 64 px caps keep their shape (two bar-heights wide), the middle stretches.
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
  display: flex
  pointer-events: none
  // Five slices of the strip (16 bar-heights wide at its own height): the 12.5 % caps
  // and the middle 30 % (35 %..65 %, where the crest or crown stands) are drawn at their
  // own size, the two plain stretches of rim between them take up the rest of the bar's
  // length. A bar wider than 16 heights then grows by its rim, and the ornament keeps its shape.
  i
    display: block
    flex: none
    height: 100%
    background-image: var(--art)
    background-repeat: no-repeat
    background-size: calc(var(--u) * 16) 100%
  .is-cap-l, .is-cap-r
    width: calc(var(--u) * 2)
  .is-cap-r
    background-position: 100% 0
  .is-mid
    width: calc(var(--u) * 4.8)
    background-position: calc(var(--u) * -5.6) 0
  .is-rim-l, .is-rim-r
    flex: 1 1 0
    min-width: 0
    // 22.5 % of the strip stretched over the rim's own length.
    background-size: 444.444% 100%
  .is-rim-l
    background-position: 16.129% 0
  .is-rim-r
    background-position: 83.871% 0

@keyframes fbar-low
  from
    opacity: 0
  to
    opacity: 0.42
@keyframes fbar-gem
  from
    opacity: 0.12
  to
    opacity: 0.5
@keyframes fbar-shine
  0%, 55%
    transform: translateX(-100%)
  100%
    transform: translateX(100%)

@media (prefers-reduced-motion: reduce)
  .is-low .f-bar__fill::after, .f-bar--boss .f-bar__fill::before, .f-bar__orn :deep(.g-glow)
    animation: none
  .f-bar__ghost
    transition: none
</style>
