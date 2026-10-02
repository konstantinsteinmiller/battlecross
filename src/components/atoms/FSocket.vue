<script setup lang="ts">
import { computed } from 'vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import type { GameIconName } from '@/components/icons/iconNames'
import { UI_ART } from '@/game/assets/overrides'

/**
 * ─── A socket: the frame something is set in ─────────────────────────────────
 *
 * The metal-and-gem frame of a battle skill button, a flask on the belt, and
 * (next) an equipment slot on the paper-doll. It is only the FRAME and the
 * well behind it — what is set in it comes through the default slot, and the
 * socket clips it to its window.
 *
 * Layers, back to front:
 *   plate   the dark disc it stands on (its depth)
 *   well    the sunk window; an empty socket shows a ghost glyph of what
 *           belongs there (`ghost`)
 *   slot    the content, clipped to the window
 *   #over   overlays clipped to the window too: a cooldown sweep, a wash
 *   gloss   the hard cel highlight on the glass
 *   frame   the metal ring with its inlay in `tint`, studs and a gem — drawn
 *           in code, or the painted file when one exists
 *   #badge  whatever hangs off the frame unclipped: a count, a cost, a key
 *
 * It fills its parent's box and stays square. Everything is static: nothing
 * here animates or reads a per-frame value.
 */
interface Props {
  /** `square` (a rounded square: skills, gear) or `round` (flasks, trinkets). */
  shape?: 'square' | 'round'
  /** The owner's colour — a class, an item tier: the inlay and the gem. */
  tint?: string
  /** The ring's metal. */
  metal?: 'brass' | 'steel'
  /** The gem on the crown of the frame. */
  gem?: boolean
  /** A corked neck on the crown instead (a flask). */
  cork?: boolean
  /** Nothing is set in it: the well shows, with the ghost glyph if given. */
  empty?: boolean
  /** What belongs here, drawn faintly in an empty socket. */
  ghost?: GameIconName
  /** The painted frame's name under `images/ui/` (see `art-todo.md`), e.g.
   *  `skill-frame`. The code-drawn frame stands in until the file exists. */
  art?: string
  /** A painted frame's URL, given directly (tests, a lab). */
  artSrc?: string
}

const props = withDefaults(defineProps<Props>(), {
  shape: 'square',
  tint: undefined,
  metal: 'brass',
  gem: false,
  cork: false,
  empty: false,
  ghost: undefined,
  art: undefined,
  artSrc: undefined
})

const frameArt = computed(() => props.artSrc ?? (props.art ? UI_ART.get(props.art) ?? '' : ''))
</script>

<template lang="pug">
  span.f-socket(
    :class="[`f-socket--${shape}`, `f-socket--${metal}`, { 'is-empty': empty, 'has-art': !!frameArt }]"
    :style="tint ? { '--tint': tint } : undefined"
  )
    span.f-socket__plate(aria-hidden="true")
    span.f-socket__well
      GameIcon.f-socket__ghost(v-if="empty && ghost" :name="ghost")
      slot
      slot(name="over")
      span.f-socket__gloss(aria-hidden="true")
    img.f-socket__art(v-if="frameArt" :src="frameArt" alt="" draggable="false")
    //- The code-drawn frame.
    svg.f-socket__frame(v-else-if="shape === 'square'" viewBox="0 0 64 64" aria-hidden="true" focusable="false")
      //- The ring: lit above, shaded below (a hard two-tone, no gradient).
      path.m-hi(fill-rule="evenodd" d="M18 2h28a16 16 0 0 1 16 16v28a16 16 0 0 1-16 16H18A16 16 0 0 1 2 46V18A16 16 0 0 1 18 2zM20 9.500A10.500 10.500 0 0 0 9.500 20v24A10.500 10.500 0 0 0 20 54.500h24A10.500 10.500 0 0 0 54.500 44V20A10.500 10.500 0 0 0 44 9.500z")
      path.m-lo(d="M2 36v10a16 16 0 0 0 16 16h28a16 16 0 0 0 16-16V36h-7.500v8A10.500 10.500 0 0 1 44 54.500H20A10.500 10.500 0 0 1 9.500 44v-8z")
      //- The inlay: a groove of the owner's colour round the ring.
      rect.m-inlay(x="5.750" y="5.750" width="52.500" height="52.500" rx="13.250")
      rect.m-edge(x="2" y="2" width="60" height="60" rx="16")
      rect.m-edge(x="9.500" y="9.500" width="45" height="45" rx="10.500")
      //- A glint on the lit shoulder.
      path.m-glint(d="M6 22v-4A12 12 0 0 1 18 6h7")
      //- Studs in the corners.
      circle.m-stud(cx="8.800" cy="8.800" r="2.300")
      circle.m-stud(cx="55.200" cy="8.800" r="2.300")
      circle.m-stud(cx="8.800" cy="55.200" r="2.300")
      circle.m-stud(cx="55.200" cy="55.200" r="2.300")
      //- The gem on the crown.
      g(v-if="gem")
        path.g-base(d="M32 -3l6.500 7-6.500 7-6.500-7z")
        path.g-hi(d="M32 -3l-6.500 7H32z")
        path.g-edge(d="M32 -3l6.500 7-6.500 7-6.500-7z")
    svg.f-socket__frame(v-else viewBox="0 0 64 64" aria-hidden="true" focusable="false")
      //- A flask's neck and cork stand behind the ring.
      g(v-if="cork")
        path.m-hi(d="M26 6V-1h12v7z")
        path.m-edge(d="M26 6V-1h12v7")
        rect.c-cork(x="24.500" y="-6" width="15" height="6.500" rx="2.200")
      path.m-hi(fill-rule="evenodd" d="M32 2a30 30 0 1 1 0 60 30 30 0 0 1 0-60zm0 7.500a22.500 22.500 0 1 0 0 45 22.500 22.500 0 0 0 0-45z")
      path.m-lo(d="M2.800 38A30 30 0 0 0 61.200 38h-7.700a22.500 22.500 0 0 1-43 0z")
      circle.m-inlay(cx="32" cy="32" r="26.250")
      circle.m-edge(cx="32" cy="32" r="30")
      circle.m-edge(cx="32" cy="32" r="22.500")
      path.m-glint(d="M7.500 24A26 26 0 0 1 23 7.800")
      g(v-if="gem")
        path.g-base(d="M32 -3l6.500 7-6.500 7-6.500-7z")
        path.g-hi(d="M32 -3l-6.500 7H32z")
        path.g-edge(d="M32 -3l6.500 7-6.500 7-6.500-7z")
    slot(name="badge")
</template>

<style scoped lang="sass">
.f-socket
  // The ring's metal, and how far the window sits inside the box.
  --m-hi: var(--bc-brass-hi)
  --m: var(--bc-brass)
  --m-lo: var(--bc-brass-lo)
  --tint: var(--bc-gold)
  --win: 13%
  --win-r: 17%
  position: relative
  display: block
  width: 100%
  aspect-ratio: 1
  flex: 0 0 auto
  user-select: none
  -webkit-user-select: none

.f-socket--steel
  --m-hi: var(--bc-steel-hi)
  --m: var(--bc-steel)
  --m-lo: var(--bc-steel-lo)
.f-socket--round
  --win-r: 50%

// The depth: a dark shape a step below the frame.
.f-socket__plate
  position: absolute
  inset: 2% 2% -5% 2%
  border-radius: 26%
  background: var(--bc-ink)
.f-socket--round .f-socket__plate
  border-radius: 50%

.f-socket__well
  position: absolute
  inset: var(--win)
  display: block
  border-radius: var(--win-r)
  // The sunk window: a harder shadow band under its upper lip.
  background: linear-gradient(180deg, var(--bc-night) 0, var(--bc-night) 26%, var(--bc-slate-deep) 26%, var(--bc-slate-deep) 100%)
  overflow: hidden

// What is set in the socket fills the window edge to edge.
.f-socket__well :slotted(*)
  position: absolute
  inset: 0
  width: 100%
  height: 100%

.f-socket__well .f-socket__ghost
  position: absolute
  inset: 22%
  width: 56%
  height: 56%
  color: var(--bc-slate-hi)

// The glass: one hard-edged lit crescent, upper left.
.f-socket__gloss
  position: absolute
  left: 7%
  top: 6%
  width: 62%
  height: 34%
  border-radius: 60% 40% 70% 30% / 70% 50% 50% 30%
  background: rgba(var(--bc-white-rgb), 0.26)
  pointer-events: none
.f-socket--round .f-socket__gloss
  left: 14%
  top: 9%
  width: 52%
  height: 30%
  border-radius: 50%
.is-empty .f-socket__gloss
  display: none

.f-socket__frame, .f-socket__art
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  overflow: visible
  pointer-events: none
.f-socket__art
  object-fit: contain
  user-select: none
  -webkit-user-drag: none

.f-socket__frame
  path, rect, circle
    stroke-linejoin: round
    stroke-linecap: round
  .m-hi
    fill: var(--m-hi)
  .m-lo
    fill: var(--m-lo)
  .m-edge
    fill: none
    stroke: var(--bc-ink)
    stroke-width: 3
  .m-inlay
    fill: none
    stroke: var(--tint)
    stroke-width: 2.4
  .m-glint
    fill: none
    stroke: var(--bc-white)
    stroke-width: 2
    opacity: 0.9
  .m-stud
    fill: var(--m-hi)
    stroke: var(--bc-ink)
    stroke-width: 1.5
  .g-base
    fill: var(--tint)
  .g-hi
    fill: color-mix(in srgb, var(--tint) 45%, var(--bc-white))
  .g-edge
    fill: none
    stroke: var(--bc-ink)
    stroke-width: 2.2
  .c-cork
    fill: var(--bc-leather)
    stroke: var(--bc-ink)
    stroke-width: 2.4

// An empty socket: the metal goes dull so a filled one beside it stands out.
.is-empty
  --m-hi: var(--bc-off-hi)
  --m: var(--bc-off)
  --m-lo: var(--bc-off-lo)
  --tint: var(--bc-off-deep)
</style>
