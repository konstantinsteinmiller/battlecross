<template lang="pug">
  div.bag
    div.bag__worn
      button.cell(
        v-for="s in EQUIP_SLOTS"
        :key="s"
        type="button"
        :class="{ 'is-sel': picked && profile.inv.equipped[s] === picked, 'is-empty': !profile.inv.equipped[s] }"
        :aria-label="t(`slot.${slotOf(s)}`)"
        @click="pickWorn(s)"
      )
        ItemIcon(v-if="profile.inv.equipped[s]" :id="profile.inv.equipped[s]")
        span.cell__ghost(v-else)
          ArtIcon(:glyph="GHOST[slotOf(s)]" tint="#5a658f" frame="none")
        span.cell__slot {{ t(`slot.${slotOf(s)}`) }}
    div.bag__grid
      button.cell(
        v-for="it in items"
        :key="it.id"
        type="button"
        :class="{ 'is-sel': picked === it.id, 'is-worn': !!equippedIn(it.id) }"
        :aria-label="t(`item.${it.id}.name`)"
        @click="pick(it.id)"
      )
        ItemIcon(:id="it.id" :dim="profile.level < it.level")
        span.cell__new(v-if="profile.inv.fresh.includes(it.id)" aria-hidden="true")
    template(v-if="picked")
      ItemCard(:id="picked" show-source)
      div.bag__actions
        span.bag__value(v-if="sell")
          IconCoin.bag__coin
          | {{ fmt(sellValue(ITEM_BY_ID[picked])) }}
        FButton(v-if="sell" :label="t('shop.sell')" type="warning" size="sm" :is-disabled="!!equippedIn(picked)" @click="doSell")
        FButton(v-if="wornSlot" :label="t('bag.unequip')" type="danger" size="sm" @click="doUnequip")
        FButton(v-else :label="t('bag.equip')" type="success" size="sm" :is-disabled="!canEquip(picked)" @click="doEquip")
      p.bag__hint(v-if="!wornSlot && !canEquip(picked)") {{ t('bag.tooLow', { n: ITEM_BY_ID[picked].level }) }}
</template>

<script setup lang="ts">
/**
 * The bag and the five equipment slots (GDD §6): main hand, off hand, body
 * and two trinkets. Every named item is owned once; a second copy found in
 * the field is turned into gold where it drops. With `sell`, the same panel
 * is a merchant's "sell" tab.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { EQUIP_SLOTS, ITEM_BY_ID, sellValue, slotOf, type EquipSlot, type ItemDef, type ItemSlot } from '@/game/data/items'
import { canEquip, equipItem, equippedIn, markSeen, profile, saveProfile, sellItem, unequip } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import FButton from '@/components/atoms/FButton.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'
import ArtIcon from '@/components/art/ArtIcon.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import ItemCard from '@/components/game/ItemCard.vue'

withDefaults(defineProps<{ sell?: boolean }>(), { sell: false })
const { t } = useI18n()
const GHOST: Record<ItemSlot, string> = { main: 'sword', off: 'shield', body: 'plate', trinket: 'ring' }
const ORDER: Record<ItemSlot, number> = { main: 0, off: 1, body: 2, trinket: 3 }

const picked = ref('')
const items = computed<ItemDef[]>(() =>
  profile.inv.items.map(id => ITEM_BY_ID[id]).filter((i): i is ItemDef => !!i)
    .sort((a, b) => ORDER[a.slot] - ORDER[b.slot] || b.tier - a.tier || a.level - b.level))
const wornSlot = computed<EquipSlot | null>(() => (picked.value ? equippedIn(picked.value) : null))

const pick = (id: string): void => {
  picked.value = id
  if (profile.inv.fresh.includes(id)) { markSeen(id); saveProfile() }
}
const pickWorn = (s: EquipSlot): void => {
  const id = profile.inv.equipped[s]
  if (id) pick(id)
}
const doEquip = (): void => { sfx(equipItem(picked.value) ? 'uiEquip' : 'denied') }
const doUnequip = (): void => {
  if (!wornSlot.value) return
  unequip(wornSlot.value)
  sfx('uiClose')
}
const doSell = (): void => {
  if (sellItem(picked.value)) { sfx('uiBuy'); picked.value = '' } else sfx('denied')
}
</script>

<style scoped lang="sass">
.bag
  display: flex
  flex-direction: column
  gap: clamp(0.5rem, 2.2vmin, 0.8rem)
  color: #fff
.bag__worn
  display: grid
  grid-template-columns: repeat(5, minmax(0, 1fr))
  gap: clamp(0.25rem, 1.3vmin, 0.5rem)
  padding-bottom: 1.1rem
.bag__grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(clamp(2.6rem, 11.5vmin, 3.4rem), 1fr))
  gap: clamp(0.3rem, 1.5vmin, 0.5rem)
  padding: 0.5rem
  border-radius: 0.8rem
  background: rgba(14, 20, 44, 0.55)
  min-height: clamp(3.2rem, 14vmin, 4.2rem)
.cell
  position: relative
  width: 100%
  max-width: 4.2rem
  justify-self: center
  aspect-ratio: 1
  padding: 0
  border: 0
  border-radius: 24%
  background: rgba(14, 20, 44, 0.7)
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.16)
  cursor: pointer
  touch-action: manipulation
  transition: transform 90ms ease-out
  &:active
    transform: scale(0.93)
.cell__ghost
  position: absolute
  inset: 18%
  opacity: 0.55
.cell__slot
  position: absolute
  left: 50%
  top: 104%
  transform: translateX(-50%)
  color: #a9b4de
  font-size: clamp(0.52rem, 2.2vmin, 0.72rem)
  line-height: 1
  white-space: nowrap
.is-sel
  box-shadow: 0 0 0 3px #ffffff, 0 0 0.9rem #ffe9a8
.is-worn::after
  content: ''
  position: absolute
  left: -6%
  top: -6%
  width: 32%
  height: 32%
  border-radius: 50%
  border: 2px solid #0f1a30
  background: #3fd060
.cell__new
  position: absolute
  right: -8%
  top: -8%
  width: 34%
  height: 34%
  border-radius: 50%
  border: 2px solid #0f1a30
  background: #ff4a5a
  animation: new-dot 0.8s ease-in-out infinite alternate
.bag__actions
  display: flex
  align-items: center
  justify-content: flex-end
  flex-wrap: wrap
  gap: 0.5rem
.bag__value
  display: inline-flex
  align-items: center
  gap: 0.25em
  margin-right: auto
  color: #ffe066
  font-size: clamp(0.9rem, 3.6vmin, 1.1rem)
.bag__coin
  width: 1.1em
  height: 1.1em
.bag__hint
  margin: 0
  color: #ffb0b0
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
  text-align: right
@keyframes new-dot
  from
    transform: scale(0.85)
  to
    transform: scale(1.15)
</style>
