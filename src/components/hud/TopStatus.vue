<template lang="pug">
  div.top-status
    //- A boss owns the top of the screen while it lives.
    div.plate.plate--boss(v-if="hud.bossKey")
      span.plate__name
        GameIcon.plate__skull(name="skull")
        | {{ t(hud.bossKey) }}
      span.plate__bar
        span.plate__fill(:style="{ transform: `scaleX(${clamp01(hud.bossHp01)})` }")
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
        span.plate__name {{ t(hud.targetKey) }} · {{ t('hud.level', { n: hud.targetLevel }) }}
        span.plate__bar
          span.plate__fill(:style="{ transform: `scaleX(${clamp01(hud.targetHp01)})` }")
</template>

<script setup lang="ts">
/** Top centre: where the hero is and how far through it, the locked target's
 *  health, and a boss's bar when one is awake. */
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { flow } from '@/game/flow'
import { ARENA_WAVES } from '@/game/data/zones'
import GameIcon from '@/components/icons/GameIcon.vue'

const { t } = useI18n()
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v))
</script>

<style scoped lang="sass">
$outline: 0 2px 0 #0f1a30, 1px 0 0 #0f1a30, -1px 0 0 #0f1a30, 0 -1px 0 #0f1a30
.top-status
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.15rem, 0.8vmin, 0.4rem)
  min-width: 0
  pointer-events: none
  color: #fff
  text-shadow: $outline
.zone
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.1em 0.5em
  font-size: clamp(0.7rem, 3vmin, 1.05rem)
  line-height: 1.1
  text-align: center
.zone__level
  color: #ffe066
.zone__wave
  color: #ffb04a
.zone__pips
  display: inline-flex
  gap: 3px
  i
    width: 0.62em
    height: 0.62em
    border-radius: 50%
    border: 2px solid #0f1a30
    background: rgba(255, 255, 255, 0.35)
    &.on
      background: #5dff7a
.plate
  display: flex
  flex-direction: column
  align-items: center
  gap: 2px
  width: min(100%, clamp(8rem, 44vmin, 17rem))
  font-size: clamp(0.64rem, 2.7vmin, 0.95rem)
  line-height: 1.1
.plate--boss
  width: min(100%, clamp(10rem, 62vmin, 26rem))
  font-size: clamp(0.76rem, 3.2vmin, 1.15rem)
.plate__name
  display: inline-flex
  align-items: center
  gap: 0.3em
  max-width: 100%
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
.plate--elite .plate__name
  color: #ffb04a
.plate--boss .plate__name
  color: #ff8a8a
.plate__skull
  width: 1em
  height: 1em
.plate__bar
  position: relative
  width: 100%
  height: clamp(0.5rem, 2.1vmin, 0.8rem)
  border-radius: 999px
  border: 2px solid #0f1a30
  background: #1c2440
  overflow: hidden
  box-shadow: 0 2px 0 #0f1a30
.plate--boss .plate__bar
  height: clamp(0.7rem, 2.8vmin, 1.1rem)
.plate__fill
  position: absolute
  inset: 0
  border-radius: 999px
  transform-origin: left center
  transition: transform 140ms ease-out
  background: linear-gradient(180deg, #ff8a7a, #e0303a)
.plate--boss .plate__fill
  background: linear-gradient(180deg, #ff7ad0, #b030e0)
</style>
