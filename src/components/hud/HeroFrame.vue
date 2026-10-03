<template lang="pug">
  div.hero-frame
    //- The portrait medallion, the level on its rim.
    div.hero-frame__face
      span.hero-frame__ring(aria-hidden="true")
      Portrait.hero-frame__portrait(look="hero" ring="var(--bc-brass-hi)")
      span.hero-frame__level {{ hud.level }}
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import FBar from '@/components/atoms/FBar.vue'
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
@keyframes heat-over
  from
    opacity: 1
  to
    opacity: 0.55
@media (prefers-reduced-motion: reduce)
  .hero-frame__heat.is-over
    animation: none
</style>
