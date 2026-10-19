<template lang="pug">
  div.hero-frame
    //- The portrait medallion: experience fills the ring round it, the level
    //- sits in a gold crest on its rim.
    div.hero-frame__face(:class="{ 'is-rested': hud.rested }")
      svg.xpring(
        viewBox="0 0 100 100"
        role="meter"
        :aria-label="t('hud.xp')"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(xp01 * 100)"
        data-xp-ring
      )
        //- The groove: an ink rim, a dark channel.
        circle.xpring__rim(cx="50" cy="50" r="44.5")
        circle.xpring__groove(cx="50" cy="50" r="44.5")
        //- The fill from twelve o'clock, clockwise; a lighter band on its outer half (cel).
        circle.xpring__fill(cx="50" cy="50" r="44.5" pathLength="100" :stroke-dasharray="dash")
        circle.xpring__band(cx="50" cy="50" r="47" pathLength="100" :stroke-dasharray="dash")
        //- A quarter, a half, three quarters.
        line.xpring__tick(v-for="a in TICKS" :key="a" x1="50" y1="0.5" x2="50" y2="11" :transform="`rotate(${a} 50 50)`")
      Portrait.hero-frame__portrait(look="hero" ring="var(--bc-brass-hi)")
      span.hero-frame__level(:key="hud.level" :class="{ 'is-pop': popped }" data-level)
        svg.crest(viewBox="-50 -50 100 100" aria-hidden="true")
          polygon.crest__burst(:points="BURST")
          circle.crest__coin(r="31")
          circle.crest__shine(r="31")
          circle.crest__inner(r="25")
        span.crest__n {{ hud.level }}
      //- Points won in this fight and not yet spent: a chip parked on the
      //- medallion until they are (the town's sheet button has its own).
      Transition(name="chip")
        FHudBadge.hero-frame__points(v-if="pending > 0" tone="red") +{{ pending }}
    div.hero-frame__bars
      FBar.hero-frame__hp(
        :value="hp01"
        :shield="shield01"
        tone="health"
        frame="hero"
        :low="hp01 < 0.3"
        :text="Math.ceil(hud.hp)"
        :label="t('hud.health', { n: Math.ceil(hud.hp), max: Math.round(hud.maxHp) })"
      )
      FBar.hero-frame__mana(
        :value="mana01"
        tone="mana"
        frame="mana"
        :text="Math.floor(hud.mana)"
        :label="t('hud.mana', { n: Math.floor(hud.mana), max: Math.round(hud.maxMana) })"
      )
      FBar.hero-frame__heat(
        v-if="hud.heat >= 0"
        :class="{ 'is-over': hud.overheated }"
        :value="Math.min(1, hud.heat / 100)"
        tone="heat"
        frame="plain"
        :label="t('hud.heat')"
      )
      div.hero-frame__row
        //- Twenty taps here inside thirty seconds request an interstitial (the
        //- portals' QA back door: see `useQaAdTrigger`). Silent on purpose.
        span.gold(@pointerdown="registerQaAdTap()")
          IconCoin.gold__icon
          span {{ fmt(hud.gold) }}
        //- Rested (#9): kills pay double XP while the pool lasts.
        span.rested(v-if="hud.rested" data-rested-hud) {{ t('rested.hud') }}
        span.statuses
          StatusChipIcon.statuses__icon(v-for="s in statuses" :key="s.id" :chip="s")
</template>

<script setup lang="ts">
/**
 * The hero's corner: a portrait medallion with the level on its rim, framed
 * health and mana, heat for a gunsmith, a ticked experience rule, the purse
 * and the statuses on him. Every bar is the shared `FBar`: it scales on the
 * compositor (`scaleX`), fed by the throttled HUD mirror — never per frame.
 */
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { profile } from '@/game/state/profile'
import { POINTS_PER_LEVEL } from '@/game/data/attributes'
import FBar from '@/components/atoms/FBar.vue'
import FHudBadge from '@/components/atoms/FHudBadge.vue'
import Portrait from '@/components/art/Portrait.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import StatusChipIcon from './StatusChipIcon.vue'
import { registerQaAdTap } from '@/use/useQaAdTrigger'
import { fmt } from '@/utils/format'

const { t } = useI18n()
const hp01 = computed(() => Math.max(0, Math.min(1, hud.hp / Math.max(1, hud.maxHp))))
const shield01 = computed(() => Math.max(0, Math.min(1, hud.shield / Math.max(1, hud.maxHp))))
const mana01 = computed(() => Math.max(0, Math.min(1, hud.mana / Math.max(1, hud.maxMana))))
const statuses = computed(() => hud.statuses.slice(0, 6))

/** Experience as the ring round the portrait (the dash of a 100-long circle). */
const xp01 = computed(() => Math.max(0, Math.min(1, hud.xp01)))
const dash = computed(() => `${(xp01.value * 100).toFixed(2)} 100`)
const TICKS = [90, 180, 270]
/** The level crest's sunburst: twelve rays round a coin. */
const BURST = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2 - Math.PI / 2
  const r = i % 2 === 0 ? 48 : 38
  return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`
}).join(' ')

/** In a fight the levels gained are banked at its end: the points to spend
 *  are the banked ones plus three for every level the fight has added. */
const pending = computed(() => flow.screen !== 'zone' ? 0 : profile.hero.points + Math.max(0, hud.level - profile.level) * POINTS_PER_LEVEL)

/** A level gained mid-fight: the number on the rim pops (roadmap #6). Entering
 *  a zone only brings the HUD up to the saved level, which is not a level-up. */
const popped = ref(false)
let popTimer: ReturnType<typeof setTimeout> | undefined
watch(() => hud.level, (now, was) => {
  if (!(now > was && now > profile.level && flow.screen === 'zone')) return
  popped.value = true
  clearTimeout(popTimer)
  popTimer = setTimeout(() => { popped.value = false }, 1400)
})
onUnmounted(() => clearTimeout(popTimer))
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.hero-frame
  // The two framed bars' thicknesses; the rest lines up on them.
  --hp-h: max(12px, calc(clamp(0.78rem, 3.1vmin, 1.1rem) * var(--hud-s, 1)))
  --mp-h: max(9px, calc(clamp(0.64rem, 2.5vmin, 0.9rem) * var(--hud-s, 1)))
  // Where the health bar's well starts and ends inside its frame (`FBar`:
  // the cap, the finial and the bezel), so the plainer bars sit under it.
  --well-l: calc(var(--hp-h) * 1.25 + 3px)
  --well-r: calc(var(--hp-h) * 0.5 + 3px)
  display: flex
  align-items: flex-start
  gap: calc(clamp(0.25rem, 1.2vmin, 0.5rem) * var(--hud-s, 1))
  pointer-events: none

// ── The medallion ────────────────────────────────────────────────────────────
.hero-frame__face
  --face: max(36px, calc(clamp(2.9rem, 13vmin, 4.6rem) * var(--hud-s, 1)))
  position: relative
  width: var(--face)
  flex: 0 0 auto
  // Room for the experience ring round the portrait (a percentage would be the row's width).
  padding: calc(var(--face) * 0.1)

// ── The experience ring ──────────────────────────────────────────────────────
.xpring
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  overflow: visible
  filter: drop-shadow(0 2px 0 var(--bc-ink))
  circle
    fill: none
.xpring__rim
  stroke: var(--bc-ink)
  stroke-width: 13
.xpring__groove
  stroke: var(--bc-purple-deep)
  stroke-width: 8
.xpring__fill, .xpring__band
  transform: rotate(-90deg)
  transform-origin: 50% 50%
  transition: stroke-dasharray 420ms var(--bc-ease-bounce)
.xpring__fill
  stroke: var(--bc-purple)
  stroke-width: 8
.xpring__band
  stroke: var(--bc-purple-hi)
  stroke-width: 3
.xpring__tick
  stroke: var(--bc-ink)
  stroke-width: 2.5
  stroke-linecap: round
// Rested (#9): the ring glints while kills pay double.
.hero-frame__face.is-rested .xpring__band
  animation: xp-glint 1.6s ease-in-out infinite
.hero-frame__portrait
  position: relative
// The level: a gold sunburst crest on the rim, a violet coin, the number in gold.
.hero-frame__level
  position: absolute
  right: -16%
  bottom: -16%
  z-index: 1
  display: grid
  place-items: center
  width: 2.5em
  height: 2.5em
  font-size: max(10px, calc(clamp(0.66rem, 2.7vmin, 0.94rem) * var(--hud-s, 1)))
.crest
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  overflow: visible
  filter: drop-shadow(0 2px 0 var(--bc-ink))
.crest__burst
  fill: var(--bc-gold)
  stroke: var(--bc-ink)
  stroke-width: 5
  stroke-linejoin: round
.crest__coin
  fill: var(--bc-gold-lo)
  stroke: var(--bc-ink)
  stroke-width: 4
// The hard highlight band across the coin's upper half (cel).
.crest__shine
  fill: var(--bc-gold-hi)
  clip-path: inset(0 0 52% 0)
.crest__inner
  fill: var(--bc-purple-deep)
  stroke: var(--bc-gold-hi)
  stroke-width: 3.5
.crest__n
  position: relative
  +cel.label
  color: var(--bc-gold-hi)
  font-size: 1.05em
  line-height: 1
  text-shadow: var(--bc-text-outline-thin)
  font-variant-numeric: tabular-nums

// A level gained: the stud swells, flares gold and settles; a ring of light leaves it.
.hero-frame__level.is-pop
  z-index: 2
  animation: level-pop 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) both
  &::after
    content: ''
    position: absolute
    inset: -0.3em
    border-radius: var(--bc-r-pill)
    border: 3px solid var(--bc-gold-hi)
    animation: level-ring 0.9s ease-out 0.1s both
    pointer-events: none
// Unspent points: a red chip on the medallion's rim, opposite the level.
.hero-frame__points
  position: absolute
  left: -4%
  bottom: -8%
  z-index: 1
.chip-enter-active
  animation: chip-in 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both
.chip-leave-active
  transition: opacity 160ms ease-in
.chip-leave-to
  opacity: 0

// ── The bars ─────────────────────────────────────────────────────────────────
.hero-frame__bars
  display: flex
  flex-direction: column
  gap: calc(clamp(1px, 0.4vmin, 3px) * var(--hud-s, 1))
  width: calc(clamp(6.2rem, 34vmin, 12.5rem) * var(--hud-s, 1))
.hero-frame__hp
  --fbar-h: var(--hp-h)
// Mana is the slimmer of the two; its well starts where health's does.
.hero-frame__mana
  --fbar-h: var(--mp-h)
  margin-left: calc((var(--hp-h) - var(--mp-h)) * 1.25)
  margin-right: calc(var(--hp-h) * 0.5 + (var(--hp-h) - var(--mp-h)) * 2.2)
.hero-frame__heat
  --fbar-h: calc(clamp(0.5rem, 2vmin, 0.72rem) * var(--hud-s, 1))
  margin-left: var(--well-l)
  margin-right: calc(var(--well-r) + var(--hp-h) * 1.6)
  &.is-over
    animation: heat-over 0.3s linear infinite alternate
// Experience: tall enough to read, as long as the health well.
.hero-frame__xp
  --fbar-h: calc(clamp(0.5rem, 2vmin, 0.72rem) * var(--hud-s, 1))
  margin-left: var(--well-l)
  margin-right: var(--well-r)

.rested
  padding: 0 0.35em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: var(--bc-purple)
  color: var(--bc-text)
  font-size: max(10px, calc(clamp(0.6rem, 2.4vmin, 0.8rem) * var(--hud-s, 1)))
  font-weight: 900
.hero-frame__row
  display: flex
  align-items: center
  gap: 0.4rem
  min-height: 1.1rem
  margin-top: clamp(1px, 0.4vmin, 3px)
  margin-left: var(--well-l)
// The purse: gold on a dark plate.
.gold
  position: relative
  pointer-events: auto
  touch-action: manipulation
  display: inline-flex
  align-items: center
  gap: 0.25em
  padding: 0.14em 0.6em 0.14em 0.25em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--bc-slate) 0, var(--bc-slate) 46%, var(--bc-slate-deep) 46%, var(--bc-slate-deep) 100%)
  color: var(--bc-text-gold)
  font-size: max(10px, calc(clamp(0.7rem, 2.8vmin, 0.98rem) * var(--hud-s, 1)))
  line-height: 1
  text-shadow: var(--bc-text-outline-thin)
  // A small purse keeps a 28 px tap: an invisible halo round the chip.
  &::before
    content: ''
    position: absolute
    inset: -6px -4px
.gold__icon
  width: 1.1em
  height: 1.1em
  user-select: none
  -webkit-user-drag: none
.statuses
  display: inline-flex
  gap: 2px
.statuses__icon
  width: calc(clamp(0.95rem, 4vmin, 1.4rem) * var(--hud-s, 1))
@keyframes level-pop
  0%
    transform: scale(1)
  18%
    transform: scale(2.1)
    filter: brightness(1.8)
  45%
    transform: scale(1.7)
    filter: brightness(1.3)
  100%
    transform: scale(1)
    filter: none
@keyframes xp-glint
  0%, 100%
    stroke: var(--bc-purple-hi)
  50%
    stroke: var(--bc-white)
@keyframes level-ring
  from
    transform: scale(0.8)
    opacity: 1
  to
    transform: scale(2.6)
    opacity: 0
@keyframes chip-in
  from
    transform: scale(0)
  to
    transform: scale(1)
@keyframes heat-over
  from
    opacity: 1
  to
    opacity: 0.55
@media (prefers-reduced-motion: reduce)
  .hero-frame__heat.is-over, .hero-frame__level.is-pop, .hero-frame__level.is-pop::after, .chip-enter-active, .hero-frame__face.is-rested .xpring__band
    animation: none
</style>
