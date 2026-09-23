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
      div.tank-row.drop(v-if="canOfferReward")
        div.tank-ico.drop-ico
          GameIcon(name="gift")
        div.tank-info
          div.tn {{ t('workshop.dropName') }}
          div.td {{ t('workshop.dropDesc') }}
          div.tc(v-if="dropLeft > 0") {{ t('workshop.dropCooldown', { t: mmss(dropLeft) }) }}
        button.buy.ad(
          type="button"
          :disabled="dropLeft > 0 || adInFlight"
          :aria-label="t('workshop.dropAria', { n: dropAmount })"
          @click="claimDrop"
        )
          GameIcon.bi(name="video")
          span +{{ dropAmount }}
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import ItemDetail from './ItemDetail.vue'
import { SLOT_ICON } from './gearFormat'
import { profile, saveProfile, computeStats, isEquipped, upgradeItem, itemById } from '@/game/state/profile'
import { itemPower, mainStat, upgradeCost, MAX_UPG } from '@/game/data/items'
import { RARITY_COLOR } from '@/game/models/palette'
import { sfx } from '@/game/audio/sfx'
import { claimReward, canOfferReward, adInFlight } from '@/use/useAdGate'
import { resumeMusicAfterAd } from '@/use/useSound'

/** The Workshop: Repair Tanks, and upgrading gear with bolts (+1 … +10,
 *  +8 % main stat per level). Equipped gear is listed first. */
const { t } = useI18n()
const TANK_PRICE = 150

// ─── Supply drop (rewarded) ──────────────────────────────────────────────────
// Free bolts for a video, scaled by level and paced by a cooldown that lives
// in the save (so a reload does not reset it). Hidden whenever no rewarded ad
// is ready — an offer that then fails reads as a broken game.
const DROP_COOLDOWN_MS = 4 * 60_000
const dropAmount = computed(() => Math.round((40 + 20 * profile.level) / 5) * 5)
const now = ref(Date.now())
let clock: number | null = null
onMounted(() => { clock = window.setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => { if (clock !== null) clearInterval(clock) })
const dropLeft = computed(() => Math.max(0, Math.ceil((profile.stats.lastDropAt + DROP_COOLDOWN_MS - now.value) / 1000)))
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const claimDrop = async () => {
  if (dropLeft.value > 0) return
  const n = dropAmount.value
  try {
    await claimReward(() => {
      profile.bolts += n
      profile.stats.lastDropAt = Date.now()
      now.value = Date.now()
      saveProfile()
      sfx('loot')
    })
  } finally {
    // The ad hard-stopped the lab music and its play intent; nothing else
    // restarts it until the next mission, so bring it back here.
    resumeMusicAfterAd()
  }
}
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
.drop
  margin-top: 8px
.drop-ico
  background: radial-gradient(circle at 40% 30%, #fff3c8, #ffb84a 45%, #d06a10)
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
  &.ad
    background: linear-gradient(#9fe6ff, #3c8cff)
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
