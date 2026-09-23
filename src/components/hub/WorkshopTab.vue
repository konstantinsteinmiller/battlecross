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
      slot
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import { profile, saveProfile, computeStats } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'

/** The Workshop: Repair Tanks now; gear upgrades and salvage with the loot chunk. */
const { t } = useI18n()
const TANK_PRICE = 150
const stats = computed(() => { void profile.hero.skills; return computeStats() })
const buyTank = () => {
  if (profile.bolts < TANK_PRICE || profile.inv.tanks >= stats.value.tanksMax) { sfx('denied'); return }
  profile.bolts -= TANK_PRICE
  profile.inv.tanks++
  saveProfile()
  sfx('tank')
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
  width: 16px
  height: 16px
</style>
