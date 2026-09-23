<template lang="pug">
  div.workshop.sheet
    div.scroll
      div.section-title {{ t('workshop.tanks') }}
      div.tank-row
        div.tank-ico
          GameIcon(name="flask")
        div.tank-info
          div.tn {{ t('workshop.tankName') }}
          div.td {{ t('workshop.tankDesc') }}
          div.tc {{ t('workshop.owned', { n: profile.inv.tanks, max: stats.tanksMax }) }}
        button.buy(
          type="button"
          :disabled="profile.bolts < TANK_PRICE || profile.inv.tanks >= stats.tanksMax"
          @click="buyTank"
        )
          GameIcon.bi(name="bolt")
          span {{ TANK_PRICE }}
      div.section-title {{ t('workshop.upgrade') }}
      div.cols
        div.list
          button.row(
            v-for="it in items"
            :key="it.id"
            type="button"
            :class="{ sel: selId === it.id }"
            :style="{ '--rc': RARITY_COLOR[it.rarity] }"
            @click="selId = it.id"
          )
            span.r-ico
              GameIcon(:name="SLOT_ICON[it.slot]")
            span.r-name {{ t(`item.${it.base}`) }}
              span.r-upg(v-if="it.upg") &nbsp;+{{ it.upg }}
            span.r-eq(v-if="isEquipped(it.id)") ●
        div.detail-col(v-if="selected")
          ItemDetail(:item="selected")
            div.upg-line(v-if="selected.slot !== 'chip'")
              span {{ t('workshop.next') }}
              span.v {{ mainStat(selected) }} → {{ nextMain }}
            button.btn.upgrade(
              type="button"
              :disabled="selected.upg >= MAX_UPG || profile.bolts < upgradeCost(selected)"
              @click="upgrade"
            )
              template(v-if="selected.upg >= MAX_UPG") {{ t('workshop.maxed') }}
              template(v-else)
                | {{ t('workshop.upgradeBtn') }}
                GameIcon.bi(name="bolt")
                | {{ upgradeCost(selected) }}
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import ItemDetail from './ItemDetail.vue'
import { SLOT_ICON } from './gearFormat'
import { profile, saveProfile, computeStats, isEquipped, upgradeItem, itemById } from '@/game/state/profile'
import { itemPower, mainStat, upgradeCost, MAX_UPG } from '@/game/data/items'
import { RARITY_COLOR } from '@/game/models/palette'
import { sfx } from '@/game/audio/sfx'

/** The Workshop: Repair Tanks, and upgrading gear with bolts (+1 … +10,
 *  +8 % main stat per level). Equipped gear is listed first. */
const { t } = useI18n()
const TANK_PRICE = 150
const stats = computed(() => { void profile.hero.skills; return computeStats() })
const items = computed(() => [...profile.inv.items]
  .sort((a, b) => Number(!!isEquipped(b.id)) - Number(!!isEquipped(a.id)) || itemPower(b) - itemPower(a)))
const selId = ref<string | null>(profile.inv.equipped.buster)
const selected = computed(() => itemById(selId.value))
const nextMain = computed(() => {
  const s = selected.value
  if (!s) return 0
  return mainStat({ ...s, upg: Math.min(MAX_UPG, s.upg + 1) })
})
const buyTank = () => {
  if (profile.bolts < TANK_PRICE || profile.inv.tanks >= stats.value.tanksMax) { sfx('denied'); return }
  profile.bolts -= TANK_PRICE
  profile.inv.tanks++
  saveProfile()
  sfx('tank')
}
const upgrade = () => {
  const s = selected.value
  if (s && upgradeItem(s.id, upgradeCost(s), MAX_UPG)) sfx('levelUp')
  else sfx('denied')
}
</script>

<style scoped lang="sass">
@use './sheet'
.tank-row
  display: flex
  align-items: center
  gap: 10px
  padding: 10px
  border-radius: 14px
  background: rgba(0, 0, 0, 0.25)
.tank-ico
  width: 44px
  height: 44px
  padding: 8px
  border-radius: 12px
  border: 2px solid #141a33
  background: radial-gradient(circle at 40% 30%, #d4ffc8, #5fe07a 45%, #1f9a4a)
.tank-info
  flex: 1
.tn
  font-size: clamp(14px, 3vmin, 17px)
.td
  font-size: clamp(11px, 2.4vmin, 13px)
  color: #cfe0ff
.tc
  font-size: clamp(11px, 2.4vmin, 13px)
  color: #9fe6ff
.buy
  display: flex
  align-items: center
  gap: 4px
  padding: 8px 12px
  border-radius: 12px
  border: 3px solid #141a33
  background: linear-gradient(#ffd23a, #e08a00)
  color: #141a33
  font-family: var(--font-pixel)
  font-size: 11px
  &:disabled
    filter: grayscale(0.8) brightness(0.7)
.bi
  display: inline-block
  width: 16px
  height: 16px
  vertical-align: -3px
.cols
  display: flex
  gap: 10px
.list
  flex: 1
  min-width: 0
  display: flex
  flex-direction: column
  gap: 4px
  max-height: 40vh
  overflow-y: auto
.row
  display: flex
  align-items: center
  gap: 8px
  padding: 6px 10px
  border-radius: 10px
  border-left: 4px solid var(--rc)
  background: rgba(0, 0, 0, 0.25)
  color: #fff
  text-align: left
  font-family: var(--font-ui)
  font-size: clamp(12px, 2.6vmin, 14px)
  &.sel
    background: rgba(79, 216, 255, 0.22)
.r-ico
  width: 18px
  height: 18px
  color: var(--rc)
.r-name
  flex: 1
  color: var(--rc)
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
.r-upg
  color: #ffd84a
.r-eq
  color: #8dff7a
.detail-col
  flex: 1
  min-width: 0
.upg-line
  display: flex
  justify-content: space-between
  font-size: clamp(12px, 2.6vmin, 14px)
  .v
    font-family: var(--font-pixel)
    font-size: 0.75em
    color: #8dff7a
.btn
  padding: 9px 10px
  border-radius: 12px
  border: 3px solid #141a33
  color: #fff
  font-family: var(--font-ui)
  font-size: clamp(13px, 2.8vmin, 16px)
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  &:disabled
    filter: grayscale(0.8) brightness(0.7)
.upgrade
  background: linear-gradient(#ffd23a, #e08a00)
  color: #141a33
@media (orientation: portrait)
  .cols
    flex-direction: column
</style>
