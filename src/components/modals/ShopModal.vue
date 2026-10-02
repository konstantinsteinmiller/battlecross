<template lang="pug">
  FModal(
    :model-value="true"
    :tabs="tabs"
    :active-tab="tab"
    @update:active-tab="tab = String($event)"
    @update:model-value="closeModal"
  )
    div.shop
      div.shop__keeper
        span.shop__face
          Portrait(:look="flow.npc ? flow.npc.look : 'peddler'")
        span.shop__say
          span.shop__name {{ flow.npc ? t(`npc.${flow.npc.id}.name`) : '' }}
          span.shop__line {{ flow.npc ? t(`npc.${flow.npc.id}.talk`) : '' }}
        GoldPill
      template(v-if="tab === 'buy'")
        p.shop__empty(v-if="stock.length === 0") {{ t('shop.empty') }}
        div.shop__grid
          button.ware(
            v-for="it in stock"
            :key="it.id"
            type="button"
            :class="{ 'is-sel': picked === it.id, 'is-owned': owns(it.id) }"
            :aria-label="t(`item.${it.id}.name`)"
            @click="picked = it.id"
          )
            span.ware__icon
              ItemIcon(:id="it.id" :dim="owns(it.id)")
            span.ware__price(v-if="!owns(it.id)" :class="{ bad: profile.gold < buyCost(it.id) }")
              IconCoin.ware__coin
              | {{ fmt(buyCost(it.id)) }}
            span.ware__price(v-else) {{ t('shop.owned') }}
        template(v-if="picked")
          ItemCard(:id="picked")
          div.shop__actions
            FButton(
              :label="owns(picked) ? t('shop.owned') : t('shop.buy')"
              type="success"
              size="sm"
              :is-disabled="owns(picked) || profile.gold < buyCost(picked)"
              @click="buy"
            )
      InventoryPanel(v-else sell)
</template>

<script setup lang="ts">
/** A merchant (GDD §6): what they stock depends on the town and on what the
 *  hero's choices made of it. Charisma haggles the price down. */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ITEMS, type ItemDef } from '@/game/data/items'
import { buyCost, buyItem, owns, profile } from '@/game/state/profile'
import { closeModal, flow } from '@/game/flow'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import Portrait from '@/components/art/Portrait.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import ItemCard from '@/components/game/ItemCard.vue'
import GoldPill from '@/components/game/GoldPill.vue'
import InventoryPanel from './InventoryPanel.vue'

const { t } = useI18n()
const tab = ref('buy')
const picked = ref('')
const tabs = computed(() => [{ label: t('shop.buy'), value: 'buy' }, { label: t('shop.sell'), value: 'sell' }])

const stock = computed<ItemDef[]>(() => {
  const s = flow.npc?.stock
  if (!s) return []
  // Legendaries are found, never sold.
  return ITEMS.filter(i => i.tier < 6 && s.slots.includes(i.slot) && s.tiers.includes(i.tier))
    .sort((a, b) => a.tier - b.tier || a.level - b.level)
})

const buy = (): void => { sfx(buyItem(picked.value) ? 'uiBuy' : 'denied') }
</script>

<style scoped lang="sass">
.shop
  display: flex
  flex-direction: column
  gap: clamp(0.5rem, 2.2vmin, 0.8rem)
  color: #fff
.shop__keeper
  display: flex
  align-items: center
  gap: 0.6rem
.shop__face
  width: clamp(2.8rem, 12vmin, 3.8rem)
.shop__say
  flex: 1 1 auto
  display: flex
  flex-direction: column
  min-width: 0
.shop__name
  color: #ffe066
  font-size: clamp(0.84rem, 3.5vmin, 1.05rem)
.shop__line
  color: #dfe6ff
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
  line-height: 1.25
.shop__empty
  margin: 0
  color: #b9c4ee
.shop__grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(clamp(3.4rem, 15vmin, 4.4rem), 1fr))
  gap: clamp(0.3rem, 1.5vmin, 0.5rem)
.ware
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.2rem
  padding: 0.3rem
  border: 0
  border-radius: 0.7rem
  background: rgba(14, 20, 44, 0.7)
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.14)
  color: #fff
  cursor: pointer
  touch-action: manipulation
  &.is-sel
    box-shadow: 0 0 0 3px #ffffff, 0 0 0.9rem #ffe9a8
.ware__icon
  width: 78%
.ware__price
  display: inline-flex
  align-items: center
  gap: 0.2em
  color: #ffe066
  font-size: clamp(0.62rem, 2.6vmin, 0.8rem)
  line-height: 1
  white-space: nowrap
  &.bad
    color: #ff8a8a
.is-owned .ware__price
  color: #7dff8a
.ware__coin
  width: 1em
  height: 1em
.shop__actions
  display: flex
  justify-content: flex-end
</style>
