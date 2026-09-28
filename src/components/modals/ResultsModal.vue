<template lang="pug">
  FModal(:model-value="open" :title="r ? (r.success ? t('results.success') : t('results.failed')) : ''" :is-closable="false")
    div.results(v-if="r" :class="{ split: hasExtras }")
      div.col
        div.quest
          div.q-name {{ t(`quest.${r.quest.template}`) }}
          div.q-sector {{ t(`sector.${r.quest.sector}`) }}
        //- Where this lifetime XP places the player among everyone. Renders
        //- nothing at all when there is no honest number to show.
        div.rank(v-if="leaderboardEnabled")
          RankBadge(:score="lifetime")
        div.rows
          div.row
            span.k {{ t('results.xp') }}
            span.v.xp +{{ fmt(r.xp) }}
          div.row
            span.k {{ t('results.bolts') }}
            span.v.bolts
              | +{{ fmt(boltsShown) }}
              GameIcon.nut(name="nut")
          div.row
            span.k {{ t('results.kills') }}
            span.v {{ r.kills }}
          div.row(v-if="r.chests")
            span.k {{ t('results.chests') }}
            span.v {{ r.chests }}
          div.row
            span.k {{ t('results.time') }}
            span.v {{ mmss(r.seconds) }}
      div.col(v-if="hasExtras")
        div.levelup(v-if="r.levelAfter > r.levelBefore")
          | {{ t('results.levelUp', { n: r.levelAfter }) }}
        div.unlock(v-if="r.weapon")
          span.w-dot(:style="{ background: WEAPONS[r.weapon].color }")
          | {{ t('results.newWeapon', { weapon: t(`weapon.${r.weapon}.name`) }) }}
        div.unlock(v-if="r.unlocked")
          | {{ t('results.newSector', { sector: t(`sector.${r.unlocked}`) }) }}
        div.items(v-if="r.items.length")
          div.i-title {{ t('results.items') }}
          //- Each find with its icon and what it changes against the equipped
          //- piece — a boss's reward is the one to know is an upgrade.
          LootCompare.item(v-for="it in r.items" :key="it.id" :item="it" compact)
    template(#footer)
      div.actions
        //- Poki (`platformPolicy.freeOptionFirst`): the free Continue leads and is
        //- never smaller than the rewarded offer — an invisible copy of the
        //- offer's label sizes it, in every language.
        FButton(v-if="freeFirst" type="primary" icon="forward" :size="pairSize" @click="done")
          span.free-label
            span {{ t('continue') }}
            span.sizer(v-if="offerDouble" aria-hidden="true") {{ doubleLabel }}
        FButton(
          v-if="offerDouble"
          type="warning"
          icon="video"
          :size="pairSize"
          :is-disabled="adInFlight"
          :label="doubleLabel"
          @click="double"
        )
        FButton(v-if="!freeFirst" type="primary" icon="forward" :label="t('continue')" @click="done")
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { flow, leaveResults } from '@/game/flow'
import { profile, saveProfile, lifetimeXp } from '@/game/state/profile'
import { WEAPONS } from '@/game/data/weapons'
import { claimReward, canOfferReward, adInFlight } from '@/use/useAdGate'
import { formatCount } from '@/utils/localeNumber'
import RankBadge from '@/components/molecules/RankBadge.vue'
import LootCompare from '@/components/molecules/LootCompare.vue'
import { leaderboardEnabled } from '@/use/useLeaderboard'
import { platformPolicy } from '@/platforms/capabilities'
import { isShortViewport, windowWidth } from '@/use/useUser'

/** Mission results: what the run earned, what unlocked, then home. */
const { t, locale } = useI18n()
const open = computed(() => flow.modal === 'results')
const r = computed(() => flow.results)
const doubled = ref(false)
const canAd = computed(() => canOfferReward.value)
/** Portal rule (Poki): the free choice before the rewarded one. */
const freeFirst = platformPolicy.freeOptionFirst
const offerDouble = computed(() => !!(r.value && r.value.success && canAd.value && !doubled.value && r.value.bolts > 0))
const doubleLabel = computed(() => (r.value ? t('results.double', { n: fmt(r.value.bolts) }) : ''))
/** Two equal-width buttons need more room than the old pair did. In a tight
 *  landscape (Poki's 640×360 test size) they take the small size so they stay
 *  on one row instead of wrapping and pushing the stats into a scroll. */
const pairSize = computed(() =>
  (freeFirst && offerDouble.value && isShortViewport.value && windowWidth.value < 800 ? 'sm' : undefined))
const boltsShown = computed(() => (r.value ? r.value.bolts * (doubled.value ? 2 : 1) : 0))
const hasExtras = computed(() => {
  const x = r.value
  return !!x && (x.levelAfter > x.levelBefore || !!x.weapon || !!x.unlocked || x.items.length > 0)
})
const fmt = (n: number) => formatCount(Math.round(n), locale.value)
/** The leaderboard's score: the same number `finishMission` reported. */
const lifetime = computed(() => (r.value ? lifetimeXp() : 0))
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

watch(open, (o) => { if (o) doubled.value = false })

const double = async () => {
  const res = r.value
  if (!res) return
  await claimReward(() => {
    profile.bolts += res.bolts
    doubled.value = true
    saveProfile()
  })
}
/** Continue: the interstitial (when one is due), then home. */
const done = () => {
  void leaveResults()
}
</script>

<style scoped lang="sass">
.results
  color: #fff
  font-family: var(--font-ui)
  display: flex
  flex-direction: column
  gap: 10px
  min-width: min(78vw, 360px)
.col
  display: flex
  flex-direction: column
  gap: 10px
// Short landscape (phones on their side, ~764×385 portal embeds): the stats
// and the rewards sit side by side so nothing hides below the fold.
@media (max-height: 520px) and (min-aspect-ratio: 4/3)
  .results.split
    display: grid
    grid-template-columns: 1fr 1fr
    align-items: center
    gap: 16px
    min-width: min(86vw, 640px)
.quest
  text-align: center
.q-name
  font-size: clamp(17px, 3.6vmin, 22px)
.q-sector
  font-size: clamp(11px, 2.4vmin, 14px)
  color: #9fe6ff
.rank
  display: flex
  justify-content: center
  &:empty
    display: none
.rows
  display: flex
  flex-direction: column
  gap: 4px
  padding: 8px 12px
  border-radius: 10px
  background: rgba(0, 0, 0, 0.25)
.row
  display: flex
  justify-content: space-between
  font-size: clamp(13px, 2.8vmin, 16px)
.k
  color: #cfe0ff
.v
  font-family: var(--font-pixel)
  font-size: 0.8em
  &.xp
    color: #9dff5a
  &.bolts
    display: inline-flex
    align-items: center
    gap: 4px
    color: #ffd84a
// The value's pixel font runs at 0.8em: the glyph matches the label's size.
// Nested, so it outranks GameIcon's own 100% sizing on specificity.
.bolts .nut
  width: 1.4em
  height: 1.4em
.levelup
  text-align: center
  color: #ffd84a
  font-size: clamp(15px, 3.2vmin, 19px)
  animation: lvl-pulse 0.9s ease-in-out infinite
.unlock
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  color: #7ff4ff
  font-size: clamp(13px, 2.8vmin, 16px)
.w-dot
  width: 14px
  height: 14px
  border-radius: 50%
  border: 2px solid #141a33
.items .item
  margin-top: 8px
.items
  display: flex
  flex-direction: column
  gap: 4px
.i-title
  font-size: clamp(11px, 2.4vmin, 14px)
  color: #ffd84a
  text-transform: uppercase
.actions
  display: flex
  flex-wrap: wrap
  gap: 10px
  justify-content: center
// Poki: the free button's label shares one grid cell with an invisible copy of
// the rewarded label, so the free button is at least as wide as the offer.
.free-label
  display: inline-grid
  justify-items: center
  > *
    grid-area: 1 / 1
.sizer
  visibility: hidden
@keyframes lvl-pulse
  50%
    transform: scale(1.06)
</style>
