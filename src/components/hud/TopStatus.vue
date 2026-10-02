<template lang="pug">
  div.top-status
    //- A boss owns the top of the screen while it lives.
    div.plate.plate--boss(v-if="hud.bossKey")
      span.plate__name
        GameIcon.plate__skull(name="skull")
        span.plate__label {{ t(hud.bossKey) }}
      FBar.plate__bar(:value="hud.bossHp01" tone="boss" frame="boss" :label="t(hud.bossKey)")
    template(v-else)
      div.zone(v-if="flow.screen === 'zone'")
        span.zone__name {{ t(`node.${hud.zoneKey}.name`) }}
        span.zone__level {{ t('hud.level', { n: hud.zoneLevel }) }}
        span.zone__pips(v-if="hud.zoneKey !== 'arena'" role="img" :aria-label="t('hud.groups', { n: hud.groupsDone, total: hud.groupsTotal })")
          i(v-for="n in hud.groupsTotal" :key="n" :class="{ on: n <= hud.groupsDone }")
        span.zone__wave(v-else) {{ t('hud.wave', { n: Math.max(1, hud.wave), total: ARENA_WAVES }) }}
      div.zone(v-else)
        span.zone__name {{ t(`node.${hud.zoneKey}.name`) }}
      div.plate(v-if="hud.targetKey" :class="{ 'plate--elite': hud.targetElite }")
        span.plate__name
          span.plate__label {{ t(hud.targetKey) }} · {{ t('hud.level', { n: hud.targetLevel }) }}
        FBar.plate__bar(:value="hud.targetHp01" tone="enemy" :frame="hud.targetElite ? 'elite' : 'plain'" :label="t(hud.targetKey)")
</template>

<script setup lang="ts">
/** Top centre: where the hero is and how far through it, the locked target's
 *  health (an elite's in a winged frame), and a boss's crowned bar when one
 *  is awake. */
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { ARENA_WAVES } from '@/game/data/zones'
import FBar from '@/components/atoms/FBar.vue'
import GameIcon from '@/components/icons/GameIcon.vue'

const { t } = useI18n()
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.top-status
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.15rem, 0.8vmin, 0.4rem)
  min-width: 0
  pointer-events: none
  color: var(--bc-text)
  text-shadow: var(--bc-text-outline-thin)

// Where the hero is: a parchment tag.
.zone
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.1em 0.5em
  max-width: 100%
  padding: 0.2em 0.8em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--bc-paper-hi) 0, var(--bc-paper-hi) 46%, var(--bc-paper) 46%, var(--bc-paper) 100%)
  box-shadow: var(--bc-drop)
  color: var(--bc-paper-ink)
  font-size: clamp(0.7rem, 3vmin, 1.05rem)
  line-height: 1.15
  text-align: center
  text-shadow: none
.zone__level
  color: var(--bc-gold-deep)
.zone__wave
  color: var(--bc-orange-deep)
// One gem per enemy group; it lights when the group is beaten.
.zone__pips
  display: inline-flex
  gap: 3px
  i
    width: 0.68em
    height: 0.68em
    border-radius: 50%
    border: var(--bc-ol-thin) solid var(--bc-ink)
    background: var(--bc-paper-deep)
    &.on
      background: linear-gradient(180deg, var(--bc-green-hi) 0, var(--bc-green-hi) 46%, var(--bc-green-lo) 46%, var(--bc-green-lo) 100%)

.plate
  display: flex
  flex-direction: column
  align-items: center
  gap: 1px
  width: min(100%, clamp(8rem, 44vmin, 17rem))
  font-size: clamp(0.64rem, 2.7vmin, 0.95rem)
  line-height: 1.1
  --fbar-h: clamp(0.56rem, 2.3vmin, 0.86rem)
.plate--boss
  width: min(100%, clamp(11rem, 66vmin, 27rem))
  font-size: clamp(0.76rem, 3.2vmin, 1.15rem)
  --fbar-h: clamp(0.7rem, 2.8vmin, 1.1rem)
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
  +cel.tone('pink')
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
