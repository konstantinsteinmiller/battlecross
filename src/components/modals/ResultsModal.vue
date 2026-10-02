<template lang="pug">
  FModal(:model-value="true" :title="t(`results.${r ? r.outcome : 'victory'}`)" :is-closable="false")
    div.results(v-if="r" :class="`results--${r.outcome}`")
      p.results__place {{ t(`node.${r.node}.name`) }}
      p.results__first(v-if="r.firstClear") {{ t('results.firstClear') }}
      p.results__first(v-if="r.node === 'arena'") {{ t('results.waves', { n: r.waves }) }}
      div.results__levelup(v-if="r.levelAfter > r.levelBefore")
        span.results__level {{ t('results.levelUp', { n: r.levelAfter }) }}
        span.results__points {{ t('results.points', { n: (r.levelAfter - r.levelBefore) * POINTS_PER_LEVEL }) }}
      dl.results__stats
        div
          dt {{ t('results.xp') }}
          dd.xp +{{ fmt(r.xp) }}
        div
          dt {{ t('results.gold') }}
          dd.gold
            IconCoin.results__coin
            | +{{ fmt(r.gold) }}
        div(v-if="r.goldLost > 0")
          dt {{ t('results.lost') }}
          dd.lost
            IconCoin.results__coin
            | -{{ fmt(r.goldLost) }}
        div
          dt {{ t('results.kills') }}
          dd {{ fmt(r.kills) }}
        div
          dt {{ t('results.time') }}
          dd {{ clock(r.seconds) }}
      ul.results__loot(v-if="r.items.length")
        li.loot(v-for="(it, i) in r.items" :key="i" :style="{ '--tier': TIER_COLOR[ITEM_BY_ID[it.id] ? ITEM_BY_ID[it.id].tier : 1], animationDelay: `${i * 90}ms` }")
          span.loot__icon
            ItemIcon(:id="it.id")
          span.loot__name {{ t(`item.${it.id}.name`) }}
          span.loot__dup(v-if="!it.added")
            IconCoin.results__coin
            | +{{ fmt(it.gold) }}
      p.results__open(v-if="r.unlocked.length") {{ t('results.unlocked', { places: r.unlocked.map(n => t(`node.${n}.name`)).join(', ') }) }}
      p.results__tip(v-if="r.outcome === 'defeat'") {{ t('results.tip') }}
    template(#footer)
      FButton(v-if="r && r.outcome !== 'victory'" :label="t('results.retry')" type="secondary" size="md" icon="replay" @click="retryVisit")
      FButton(:label="t('ui.continue')" type="success" size="md" icon="skip-forward" attention @click="leaveResults")
</template>

<script setup lang="ts">
/**
 * The end of a visit. Everything is already banked and saved when this opens;
 * Continue closes it FIRST and only then lets an interstitial play (see
 * `flow.leaveResults`), so an ad never sits on top of the result.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ITEM_BY_ID, TIER_COLOR } from '@/game/data/items'
import { POINTS_PER_LEVEL } from '@/game/data/attributes'
import { flow, leaveResults, retryVisit } from '@/game/flow'
import { clock, fmt } from '@/utils/format'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'

const { t } = useI18n()
const r = computed(() => flow.results)
</script>

<style scoped lang="sass">
.results
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.4rem, 1.8vmin, 0.7rem)
  color: #fff
  text-align: center
.results__place
  margin: 0
  color: #b9c4ee
  font-size: clamp(0.84rem, 3.5vmin, 1.1rem)
.results__first
  margin: 0
  color: #ffe066
  font-size: clamp(0.9rem, 3.8vmin, 1.2rem)
.results__levelup
  display: flex
  flex-direction: column
  padding: 0.4em 1.2em
  border-radius: 0.9rem
  border: 2px solid #0f1a30
  background: linear-gradient(180deg, #ffe066, #f0a020)
  box-shadow: 0 4px 0 #0f1a30
  color: #2a1a05
  animation: levelup 520ms cubic-bezier(0.2, 1.6, 0.4, 1)
.results__level
  font-size: clamp(1.1rem, 4.8vmin, 1.6rem)
  line-height: 1.1
.results__points
  font-size: clamp(0.72rem, 3vmin, 0.92rem)
.results__stats
  margin: 0
  width: 100%
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(min(46%, 7.5rem), 1fr))
  gap: 0.3rem
  div
    display: flex
    flex-direction: column
    padding: 0.3rem 0.5rem
    border-radius: 0.6rem
    background: rgba(14, 20, 44, 0.6)
  dt
    color: #a9b4de
    font-size: clamp(0.62rem, 2.6vmin, 0.8rem)
  dd
    margin: 0
    display: inline-flex
    align-items: center
    justify-content: center
    gap: 0.2em
    font-size: clamp(0.95rem, 4vmin, 1.25rem)
  .xp
    color: #c9a4ff
  .gold
    color: #ffe066
  .lost
    color: #ff8a8a
.results__coin
  width: 1em
  height: 1em
.results__loot
  margin: 0
  padding: 0
  list-style: none
  width: 100%
  display: flex
  flex-direction: column
  gap: 0.3rem
.loot
  display: flex
  align-items: center
  gap: 0.6rem
  padding: 0.3rem 0.6rem 0.3rem 0.3rem
  border-radius: 0.7rem
  border: 2px solid #0f1a30
  background: rgba(14, 20, 44, 0.75)
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--tier) 60%, transparent)
  animation: loot-in 380ms cubic-bezier(0.2, 1.4, 0.4, 1) both
.loot__icon
  width: clamp(2.2rem, 9.5vmin, 2.8rem)
.loot__name
  flex: 1 1 auto
  color: var(--tier)
  font-size: clamp(0.8rem, 3.3vmin, 1rem)
  text-align: left
.loot__dup
  display: inline-flex
  align-items: center
  gap: 0.2em
  color: #ffe066
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
.results__open
  margin: 0
  color: #7dff8a
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
.results__tip
  margin: 0
  color: #dfe6ff
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
  line-height: 1.3
@keyframes levelup
  from
    transform: scale(0.5)
    opacity: 0
  to
    transform: scale(1)
    opacity: 1
@keyframes loot-in
  from
    transform: translateX(-1.2rem)
    opacity: 0
  to
    transform: none
    opacity: 1
</style>
