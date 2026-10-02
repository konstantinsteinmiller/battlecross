<template lang="pug">
  div.hero-frame
    div.hero-frame__face
      Portrait(look="hero")
      span.hero-frame__level {{ hud.level }}
    div.hero-frame__bars
      div.bar.bar--hp(:class="{ 'is-low': hp01 < 0.3 }" role="img" :aria-label="t('hud.health', { n: Math.ceil(hud.hp), max: Math.round(hud.maxHp) })")
        span.bar__fill(:style="{ transform: `scaleX(${hp01})` }")
        span.bar__shield(v-if="hud.shield > 0" :style="{ transform: `scaleX(${shield01})` }")
        span.bar__text {{ Math.ceil(hud.hp) }}
      div.bar.bar--mana(role="img" :aria-label="t('hud.mana', { n: Math.floor(hud.mana), max: Math.round(hud.maxMana) })")
        span.bar__fill(:style="{ transform: `scaleX(${mana01})` }")
        span.bar__text {{ Math.floor(hud.mana) }}
      div.bar.bar--heat(v-if="hud.heat >= 0" :class="{ 'is-over': hud.overheated }" role="img" :aria-label="t('hud.heat')")
        span.bar__fill(:style="{ transform: `scaleX(${Math.min(1, hud.heat / 100)})` }")
      div.bar.bar--xp(role="img" :aria-label="t('hud.xp')")
        span.bar__fill(:style="{ transform: `scaleX(${hud.xp01})` }")
      div.hero-frame__row
        //- Twenty taps here inside thirty seconds request an interstitial (the
        //- portals' QA back door: see `useQaAdTrigger`). Silent on purpose.
        span.gold(@pointerdown="registerQaAdTap()")
          IconCoin.gold__icon
          span {{ fmt(hud.gold) }}
        span.statuses
          span.statuses__icon(v-for="s in statuses" :key="s")
            ArtIcon(:glyph="`status.${s}`" :tint="statusTint(s)" frame="round")
</template>

<script setup lang="ts">
/**
 * The hero's corner: face, level, health / mana / heat / experience, purse
 * and the statuses on him. Bars scale on the compositor (`scaleX`), fed by the
 * throttled HUD mirror — never per frame.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import Portrait from '@/components/art/Portrait.vue'
import ArtIcon from '@/components/art/ArtIcon.vue'
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
.hero-frame
  display: flex
  align-items: flex-start
  gap: clamp(0.3rem, 1.4vmin, 0.6rem)
  pointer-events: none
.hero-frame__face
  position: relative
  width: clamp(2.6rem, 12vmin, 4.2rem)
  flex: 0 0 auto
.hero-frame__level
  position: absolute
  right: -8%
  bottom: -8%
  min-width: 1.7em
  padding: 0.12em 0.3em
  border-radius: 999px
  border: 2px solid #0f1a30
  background: linear-gradient(180deg, #ffe066, #f0a020)
  color: #2a1a05
  font-size: clamp(0.62rem, 2.6vmin, 0.9rem)
  line-height: 1.1
  text-align: center
.hero-frame__bars
  display: flex
  flex-direction: column
  gap: clamp(2px, 0.5vmin, 4px)
  width: clamp(6.2rem, 34vmin, 12.5rem)
  padding-top: 0.1rem
.bar
  position: relative
  height: clamp(0.72rem, 2.9vmin, 1.05rem)
  border-radius: 999px
  border: 2px solid #0f1a30
  background: #1c2440
  overflow: hidden
  box-shadow: 0 2px 0 #0f1a30
.bar__fill, .bar__shield
  position: absolute
  inset: 0
  transform-origin: left center
  transition: transform 160ms ease-out
  border-radius: 999px
.bar--hp .bar__fill
  background: linear-gradient(180deg, #8dff7a, #2fc24a)
.bar--hp.is-low .bar__fill
  background: linear-gradient(180deg, #ff8a7a, #e0303a)
  animation: bar-low 0.7s ease-in-out infinite alternate
.bar__shield
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(190, 230, 255, 0.85))
  opacity: 0.85
.bar--mana .bar__fill
  background: linear-gradient(180deg, #8fd0ff, #3a7cf0)
.bar--mana, .bar--heat
  height: clamp(0.6rem, 2.4vmin, 0.9rem)
  width: 86%
.bar--heat .bar__fill
  background: linear-gradient(90deg, #ffd84a, #ff7a2a 70%, #ff3a2a)
.bar--heat.is-over
  animation: bar-low 0.3s linear infinite alternate
.bar--xp
  height: clamp(0.3rem, 1.1vmin, 0.42rem)
  width: 72%
  border-width: 1.5px
  box-shadow: none
.bar--xp .bar__fill
  background: linear-gradient(90deg, #c58cff, #7fd8ff)
.bar__text
  position: absolute
  inset: 0
  display: flex
  align-items: center
  justify-content: center
  color: #fff
  font-size: clamp(0.5rem, 2.1vmin, 0.74rem)
  line-height: 1
  text-shadow: 0 1px 0 #0f1a30, 1px 0 0 #0f1a30, -1px 0 0 #0f1a30, 0 -1px 0 #0f1a30
.hero-frame__row
  display: flex
  align-items: center
  gap: 0.4rem
  min-height: 1.1rem
.gold
  pointer-events: auto
  touch-action: manipulation
  display: inline-flex
  align-items: center
  gap: 0.2em
  color: #ffe066
  font-size: clamp(0.7rem, 2.8vmin, 0.98rem)
  line-height: 1
  text-shadow: 0 2px 0 #0f1a30, 1px 0 0 #0f1a30, -1px 0 0 #0f1a30, 0 -1px 0 #0f1a30
.gold__icon
  width: 1.05em
  height: 1.05em
.statuses
  display: inline-flex
  gap: 2px
.statuses__icon
  width: clamp(0.95rem, 4vmin, 1.4rem)
@keyframes bar-low
  from
    filter: brightness(1)
  to
    filter: brightness(1.5)
</style>
