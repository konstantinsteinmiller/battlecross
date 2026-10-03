<template lang="pug">
  FModal(:model-value="true" :title="t(`results.${r ? r.outcome : 'victory'}`)" :is-closable="false" surface="parchment" :tone="tone")
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
        div(v-if="r.chests")
          dt {{ t('results.chests') }}
          dd {{ r.chests.opened }} / {{ r.chests.total }}
        div
          dt {{ t('results.time') }}
          dd {{ clock(r.seconds) }}
      //- Where this hero stands among everyone's: nothing at all on a build
      //- without a board, or before a placing can be stated as a number.
      RankBadge.results__rank(:score="lifetimeXp()")
      ul.results__loot(v-if="r.items.length")
        li.loot(v-for="(it, i) in r.items" :key="i" :style="{ '--tier': TIER_COLOR[ITEM_BY_ID[it.id] ? ITEM_BY_ID[it.id].tier : 1], animationDelay: `${i * 90}ms` }")
          span.loot__icon
            ItemIcon(:id="it.id")
          span.loot__name {{ t(`item.${it.id}.name`) }}
          span.loot__up(v-if="it.added && !equippedIn(it.id) && isUpgrade(it.id, profile.inv.equipped, profile.hero.attrs)" :aria-label="t('results.better')")
            GameIcon(name="up")
          span.loot__dup(v-if="!it.added")
            IconCoin.results__coin
            | +{{ fmt(it.gold) }}
          //- A new piece goes on from here: the bag's own rule (`equipItem`).
          span.loot__act(v-else)
            span.loot__done(v-if="equippedIn(it.id)")
              span.loot__tick
                GameIcon(name="check")
              | {{ t('results.equipped') }}
            FButton(
              v-else
              :label="canEquip(it.id) ? t('bag.equip') : t('bag.tooLow', { n: levelOf(it.id) })"
              type="success"
              size="sm"
              :is-disabled="!canEquip(it.id)"
              @click="wear(it.id)"
            )
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
import RankBadge from '@/components/molecules/RankBadge.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { canEquip, equipItem, equippedIn, lifetimeXp, profile } from '@/game/state/profile'
import { isUpgrade } from '@/game/data/upgrade'
import { sfx } from '@/game/audio/sfx'

const { t } = useI18n()
const r = computed(() => flow.results)
/** The ribbon says how it went before a word is read. */
const tone = computed(() => (!r.value || r.value.outcome === 'victory' ? 'gold' : r.value.outcome === 'defeat' ? 'red' : 'blue'))

const levelOf = (id: string): number => ITEM_BY_ID[id]?.level ?? 1
/** Put a find on straight from the result: the same rule as the bag. */
const wear = (id: string): void => { sfx(equipItem(id) ? 'uiEquip' : 'denied') }
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.results
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.4rem, 1.8vmin, 0.7rem)
  color: var(--bc-on)
  text-align: center
.results__place
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.84rem, 3.5vmin, 1.1rem)
.results__first
  margin: 0
  color: var(--bc-on-accent)
  font-size: clamp(0.9rem, 3.8vmin, 1.2rem)
// A level gained: the one gold plate on the page.
.results__levelup
  +cel.tone('gold')
  position: relative
  display: flex
  flex-direction: column
  padding: 0.4em 1.4em
  border-radius: var(--bc-r-lg)
  border: var(--bc-ol) solid var(--bc-ink)
  +cel.fill(44%, 88%)
  box-shadow: 0 var(--bc-press) 0 var(--bc-ink)
  +cel.label
  overflow: hidden
  animation: levelup 520ms var(--bc-ease-bounce)
  &::before
    +cel.glint(0.3em, 0.7em, 30%, 0.32em)
.results__level
  position: relative
  font-size: clamp(1.1rem, 4.8vmin, 1.6rem)
  line-height: 1.1
.results__points
  position: relative
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
    +cel.cell(var(--bc-r-md))
  dt
    color: var(--bc-on-soft)
    font-size: clamp(0.62rem, 2.6vmin, 0.8rem)
  dd
    margin: 0
    display: inline-flex
    align-items: center
    justify-content: center
    gap: 0.2em
    font-size: clamp(0.95rem, 4vmin, 1.25rem)
  .xp
    color: var(--bc-purple-lo)
  .gold
    color: var(--bc-on-accent)
  .lost
    color: var(--bc-on-bad)
.results__coin
  width: 1em
  height: 1em
  user-select: none
  -webkit-user-drag: none
.results__rank
  margin-bottom: var(--bc-press-sm)
.results__loot
  margin: 0
  padding: 0 0 var(--bc-press-sm)
  list-style: none
  width: 100%
  display: flex
  flex-direction: column
  gap: 0.45rem
// What was found: a paper slip each, the name on a band of its tier's colour.
.loot
  display: flex
  align-items: center
  gap: 0.6rem
  padding: 0.3rem 0.7rem 0.3rem 0.3rem
  border-radius: var(--bc-r-md)
  border: var(--bc-ol) solid var(--bc-ink)
  background: var(--bc-paper-hi)
  box-shadow: var(--bc-drop)
  animation: loot-in 380ms var(--bc-ease-pop) both
.loot__icon
  width: clamp(2.2rem, 9.5vmin, 2.8rem)
  flex: 0 0 auto
.loot__name
  min-width: 0
  padding: 0.14em 0.6em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: linear-gradient(180deg, color-mix(in srgb, var(--tier) 72%, var(--bc-white)) 0, color-mix(in srgb, var(--tier) 72%, var(--bc-white)) 46%, var(--tier) 46%, var(--tier) 100%)
  +cel.label
  font-size: clamp(0.8rem, 3.3vmin, 1rem)
  text-align: start
.loot__up
  flex: 0 0 auto
  width: 1.5rem
  height: 1.5rem
  padding: 0.2rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-green)
  color: var(--bc-text)
  box-shadow: 0 2px 0 var(--bc-ink)
  :deep(svg)
    display: block
    width: 100%
    height: 100%
.loot__act
  display: inline-flex
  margin-inline-start: auto
  flex: 0 0 auto
.loot__done
  display: inline-flex
  align-items: center
  gap: 0.25em
  color: var(--bc-on-good)
  font-weight: 900
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
.loot__tick
  display: block
  width: 1.3em
  height: 1.3em
  :deep(svg)
    display: block
    width: 100%
    height: 100%
.loot__dup
  display: inline-flex
  align-items: center
  gap: 0.2em
  margin-inline-start: auto
  color: var(--bc-on-accent)
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
.results__open
  margin: 0
  color: var(--bc-on-good)
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
.results__tip
  margin: 0
  color: var(--bc-on-soft)
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
@media (prefers-reduced-motion: reduce)
  .results__levelup, .loot
    animation: none
</style>
