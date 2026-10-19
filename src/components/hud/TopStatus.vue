<template lang="pug">
  div.top-status
    //- A boss owns the top of the screen while it lives.
    div.plate.plate--boss(v-if="hud.bossKey")
      span.plate__name
        GameIcon.plate__skull(name="skull")
        span.plate__label {{ t(hud.bossKey) }}
      FBar.plate__bar(:value="hud.bossHp01" tone="boss" frame="boss" :label="`${t(hud.bossKey)} · ${t('hud.level', { n: hud.bossLevel })}`" :level="hud.bossLevel" :tier="hud.bossTier" :marks="hud.bossPhases")
    //- The next goal: under the boss's bar while it lives, else on top (the place is the zone badge, top left).
    GoalTracker(v-if="hud.bossKey")
    template(v-else)
      GoalTracker
      div.plate(v-if="hud.targetKey" :class="{ 'plate--elite': hud.targetElite }")
        span.plate__name
          span.plate__label {{ t(hud.targetKey) }}
        FBar.plate__bar(:value="hud.targetHp01" tone="enemy" :frame="hud.targetElite ? 'elite' : 'plain'" :label="`${t(hud.targetKey)} · ${t('hud.level', { n: hud.targetLevel })}`" :level="hud.targetLevel" :tier="hud.targetTier")
</template>

<script setup lang="ts">
/** Top centre: the next goal, the locked target's health (an elite's in a
 *  winged frame), and a boss's crowned bar when one is awake. The place and
 *  its clearing are the zone badge under the hero's frame. */
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import FBar from '@/components/atoms/FBar.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import GoalTracker from './GoalTracker.vue'

const { t } = useI18n()
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.top-status
  display: flex
  flex-direction: column
  align-items: center
  gap: calc(clamp(0.15rem, 0.8vmin, 0.4rem) * var(--hud-s, 1))
  min-width: 0
  pointer-events: none
  color: var(--bc-text)
  text-shadow: var(--bc-text-outline-thin)

.plate
  display: flex
  flex-direction: column
  align-items: center
  gap: 1px
  width: min(100%, calc(clamp(8rem, 44vmin, 17rem) * var(--hud-s, 1)))
  font-size: max(10px, calc(clamp(0.64rem, 2.7vmin, 0.95rem) * var(--hud-s, 1)))
  line-height: 1.1
  --fbar-h: calc(clamp(0.56rem, 2.3vmin, 0.86rem) * var(--hud-s, 1))
.plate--boss
  width: min(100%, calc(clamp(11rem, 66vmin, 27rem) * var(--hud-s, 1)))
  font-size: max(10px, calc(clamp(0.76rem, 3.2vmin, 1.15rem) * var(--hud-s, 1)))
  --fbar-h: calc(clamp(0.7rem, 2.8vmin, 1.1rem) * var(--hud-s, 1))
.plate__name
  display: inline-flex
  align-items: center
  gap: 0.3em
  max-width: 100%
.plate__label
  min-width: 0
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
// The bar takes the plate's whole width, ornaments included.
.plate__bar
  align-self: stretch
.plate--elite .plate__name
  color: var(--bc-orange-hi)
// The boss's name on a ribbon of its own.
.plate--boss .plate__name
  +cel.tone('blood')
  padding: 0.14em 0.8em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  +cel.fill(46%, 100%)
  box-shadow: var(--bc-drop)
  text-shadow: var(--bc-text-outline)
.plate__skull
  flex: 0 0 auto
  width: 1em
  height: 1em
  filter: drop-shadow(0 1px 0 var(--bc-ink)) drop-shadow(1px 0 0 var(--bc-ink)) drop-shadow(-1px 0 0 var(--bc-ink)) drop-shadow(0 -1px 0 var(--bc-ink))
</style>
