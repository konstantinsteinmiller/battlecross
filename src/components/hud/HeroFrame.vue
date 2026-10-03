<template lang="pug">
  div.hero-frame
    //- The portrait medallion, the level on its rim.
    div.hero-frame__face
      span.hero-frame__ring(aria-hidden="true")
      Portrait.hero-frame__portrait(look="hero" ring="var(--bc-brass-hi)")
      span.hero-frame__level(:key="hud.level" :class="{ 'is-pop': popped }") {{ hud.level }}
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
      //- Experience: a ticked rule, no ornaments (D42).
      FBar.hero-frame__xp(:value="hud.xp01" tone="xp" frame="xp" :label="t('hud.xp')")
      div.hero-frame__row
        //- Twenty taps here inside thirty seconds request an interstitial (the
        //- portals' QA back door: see `useQaAdTrigger`). Silent on purpose.
        span.gold(@pointerdown="registerQaAdTap()")
          IconCoin.gold__icon
          span {{ fmt(hud.gold) }}
        span.statuses
          span.statuses__icon(v-for="s in statuses" :key="s")
            ArtIcon(:glyph="`status.${s}`" :tint="statusTint(s)" :src="ICON_ART.get(`status-${s}`)" frame="round")
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
import ArtIcon from '@/components/art/ArtIcon.vue'
import { ICON_ART } from '@/game/assets/overrides'
import IconCoin from '@/components/icons/IconCoin.vue'
import { statusTint } from '@/components/art/tints'
import { registerQaAdTap } from '@/use/useQaAdTrigger'
import { fmt } from '@/utils/format'

const { t } = useI18n()
const hp01 = computed(() => Math.max(0, Math.min(1, hud.hp / Math.max(1, hud.maxHp))))
const shield01 = computed(() => Math.max(0, Math.min(1, hud.shield / Math.max(1, hud.maxHp))))
const mana01 = computed(() => Math.max(0, Math.min(1, hud.mana / Math.max(1, hud.maxMana))))
const statuses = computed(() => hud.statuses.slice(0, 6))

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
  --hp-h: clamp(0.78rem, 3.1vmin, 1.1rem)
  --mp-h: clamp(0.64rem, 2.5vmin, 0.9rem)
  // Where the health bar's well starts and ends inside its frame (`FBar`:
  // the cap, the finial and the bezel), so the plainer bars sit under it.
  --well-l: calc(var(--hp-h) * 1.25 + 3px)
  --well-r: calc(var(--hp-h) * 0.5 + 3px)
  display: flex
  align-items: flex-start
  gap: clamp(0.25rem, 1.2vmin, 0.5rem)
  pointer-events: none

// ── The medallion ────────────────────────────────────────────────────────────
.hero-frame__face
  position: relative
  width: clamp(2.6rem, 12vmin, 4.2rem)
  flex: 0 0 auto
  // The brass ring stands out round the portrait.
  padding: clamp(3px, 0.9vmin, 5px)
.hero-frame__ring
  position: absolute
  inset: 0
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: linear-gradient(180deg, var(--bc-brass-hi) 0, var(--bc-brass-hi) 42%, var(--bc-brass-lo) 42%, var(--bc-brass-lo) 100%)
  box-shadow: 0 var(--bc-press-sm) 0 var(--bc-ink)
.hero-frame__portrait
  position: relative
// The level: a gold stud on the rim.
.hero-frame__level
  +cel.tone('gold')
  position: absolute
  right: -10%
  bottom: -10%
  min-width: 1.75em
  padding: 0.14em 0.3em
  border-radius: var(--bc-r-pill)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  +cel.fill(46%, 100%)
  box-shadow: 0 2px 0 var(--bc-ink)
  +cel.label
  font-size: clamp(0.66rem, 2.7vmin, 0.94rem)
  line-height: 1.1
  text-align: center
  text-shadow: var(--bc-text-outline-thin)

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
  gap: clamp(1px, 0.4vmin, 3px)
  width: clamp(6.2rem, 34vmin, 12.5rem)
.hero-frame__hp
  --fbar-h: var(--hp-h)
// Mana is the slimmer of the two; its well starts where health's does.
.hero-frame__mana
  --fbar-h: var(--mp-h)
  margin-left: calc((var(--hp-h) - var(--mp-h)) * 1.25)
  margin-right: calc(var(--hp-h) * 0.5 + (var(--hp-h) - var(--mp-h)) * 2.2)
.hero-frame__heat
  --fbar-h: clamp(0.5rem, 2vmin, 0.72rem)
  margin-left: var(--well-l)
  margin-right: calc(var(--well-r) + var(--hp-h) * 1.6)
  &.is-over
    animation: heat-over 0.3s linear infinite alternate
// Experience: tall enough to read, as long as the health well.
.hero-frame__xp
  --fbar-h: clamp(0.5rem, 2vmin, 0.72rem)
  margin-left: var(--well-l)
  margin-right: var(--well-r)

.hero-frame__row
  display: flex
  align-items: center
  gap: 0.4rem
  min-height: 1.1rem
  margin-top: clamp(1px, 0.4vmin, 3px)
  margin-left: var(--well-l)
// The purse: gold on a dark plate.
.gold
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
  font-size: clamp(0.7rem, 2.8vmin, 0.98rem)
  line-height: 1
  text-shadow: var(--bc-text-outline-thin)
.gold__icon
  width: 1.1em
  height: 1.1em
  user-select: none
  -webkit-user-drag: none
.statuses
  display: inline-flex
  gap: 2px
.statuses__icon
  width: clamp(0.95rem, 4vmin, 1.4rem)
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
  .hero-frame__heat.is-over, .hero-frame__level.is-pop, .hero-frame__level.is-pop::after, .chip-enter-active
    animation: none
</style>
