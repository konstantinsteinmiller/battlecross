<template lang="pug">
  FModal(:model-value="open" :title="r ? (r.success ? t('results.success') : t('results.failed')) : ''" :is-closable="false")
    div.results(v-if="r" :class="{ split: hasExtras }")
      div.col
        div.quest
          div.q-name {{ t(`quest.${r.quest.template}`) }}
          div.q-sector {{ t(`sector.${r.quest.sector}`) }}
        div.rows
          div.row
            span.k {{ t('results.xp') }}
            span.v.xp +{{ fmt(r.xp) }}
          div.row
            span.k {{ t('results.bolts') }}
            span.v.bolts +{{ fmt(boltsShown) }}
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
          div.item(v-for="it in r.items" :key="it.id" :style="{ '--rc': RARITY_COLOR[it.rarity] }")
            span.i-rar {{ t(`rarity.${it.rarity}`) }}
            span.i-name {{ t(`item.${it.base}`) }}
            span.i-lvl {{ t('enemy.level', { n: it.ilvl }) }}
    template(#footer)
      div.actions
        FButton(
          v-if="r && r.success && canAd && !doubled && r.bolts > 0"
          type="warning"
          icon="video"
          :is-disabled="adInFlight"
          :label="t('results.double', { n: fmt(r.bolts) })"
          @click="double"
        )
        FButton(type="primary" icon="forward" :label="t('continue')" @click="done")
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { flow, goHub } from '@/game/flow'
import { profile, saveProfile } from '@/game/state/profile'
import { RARITY_COLOR } from '@/game/models/palette'
import { WEAPONS } from '@/game/data/weapons'
import { claimReward, canOfferReward, adInFlight } from '@/use/useAdGate'
import { formatCount } from '@/utils/localeNumber'

/** Mission results: what the run earned, what unlocked, then home. */
const { t, locale } = useI18n()
const open = computed(() => flow.modal === 'results')
const r = computed(() => flow.results)
const doubled = ref(false)
const canAd = computed(() => canOfferReward.value)
const boltsShown = computed(() => (r.value ? r.value.bolts * (doubled.value ? 2 : 1) : 0))
const hasExtras = computed(() => {
  const x = r.value
  return !!x && (x.levelAfter > x.levelBefore || !!x.weapon || !!x.unlocked || x.items.length > 0)
})
const fmt = (n: number) => formatCount(Math.round(n), locale.value)
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
const done = () => {
  flow.modal = ''
  goHub()
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
    color: #ffd84a
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
.items
  display: flex
  flex-direction: column
  gap: 4px
.i-title
  font-size: clamp(11px, 2.4vmin, 14px)
  color: #ffd84a
  text-transform: uppercase
.item
  display: flex
  gap: 8px
  align-items: baseline
  padding: 4px 10px
  border-radius: 8px
  border-left: 4px solid var(--rc)
  background: rgba(0, 0, 0, 0.2)
  font-size: clamp(12px, 2.6vmin, 15px)
.i-rar
  color: var(--rc)
.i-lvl
  margin-left: auto
  font-family: var(--font-pixel)
  font-size: 0.65em
  color: #9fe6ff
.actions
  display: flex
  flex-wrap: wrap
  gap: 10px
  justify-content: center
@keyframes lvl-pulse
  50%
    transform: scale(1.06)
</style>
