<template lang="pug">
  div.hero.sheet
    div.scroll
      button.attr-cta(v-if="profile.hero.pendingAttrs > 0" type="button" @click="flow.modal = 'levelUp'")
        | {{ t('hero.attrPending', { n: profile.hero.pendingAttrs }) }}
      div.slots
        button.slot(
          v-for="s in EQUIP_SLOTS"
          :key="s"
          type="button"
          :class="{ on: slot === s, empty: !equipped(s) }"
          :style="equipped(s) ? { '--rc': RARITY_COLOR[equipped(s)?.rarity ?? 'standard'] } : {}"
          @click="pickSlot(s)"
        )
          span.s-ico
            GameIcon(:name="SLOT_ICON[s]")
          span.s-lvl(v-if="equipped(s)") {{ equipped(s)?.ilvl }}
          span.s-new(v-if="freshIn(s)") !
      div.cols
        div.list
          div.section-title {{ t(`slot.${slotKind(slot)}`) }}
          button.row(
            v-for="it in items"
            :key="it.id"
            type="button"
            :class="{ sel: selId === it.id, eq: isEquipped(it.id) }"
            :style="{ '--rc': RARITY_COLOR[it.rarity] }"
            @click="select(it.id)"
          )
            span.r-name {{ t(`item.${it.base}`) }}
              span.r-upg(v-if="it.upg") &nbsp;+{{ it.upg }}
            span.r-meta {{ t('enemy.level', { n: it.ilvl }) }}
            span.r-tag(v-if="isEquipped(it.id)") {{ t('gear.equipped') }}
            span.r-new(v-else-if="profile.inv.fresh.includes(it.id)") {{ t('gear.new') }}
          div.empty-note(v-if="!items.length") {{ t('gear.emptySlot') }}
        div.detail-col(v-if="selected")
          ItemDetail(:item="selected" :compare="compareTo")
            div.actions
              button.btn.equip(v-if="!isEquipped(selected.id)" type="button" @click="equip") {{ t('gear.equip') }}
              button.btn.unequip(v-else-if="selected.slot === 'chip'" type="button" @click="unequip") {{ t('gear.unequip') }}
              button.btn.salvage(v-if="!isEquipped(selected.id)" type="button" @click="salvage")
                | {{ t('gear.salvage', { n: salvageValue(selected) }) }}
      div.section-title {{ t('hero.stats') }}
      div.stats
        div.stat(v-for="s in statRows" :key="s.k")
          span.k {{ t(s.k) }}
          span.v {{ s.v }}
      div.section-title {{ t('hero.attributes') }}
      div.attrs
        div.attr(v-for="a in ATTRS" :key="a" :class="a")
          GameIcon.ai(:name="ATTR_ICON[a]")
          span.an {{ t(`attr.${a}.name`) }}
          span.av {{ profile.hero.attrs[a] }}
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import ItemDetail from './ItemDetail.vue'
import { SLOT_ICON } from './gearFormat'
import {
  profile, computeStats, armorTotal, equipped, isEquipped, equipItem, unequipChip, salvageItem, markSeen, itemById
} from '@/game/state/profile'
import { ATTR_ICON, type Attr } from '@/game/data/progression'
import { EQUIP_SLOTS, itemPower, salvageValue, type EquipSlot, type Slot } from '@/game/data/items'
import { RARITY_COLOR } from '@/game/models/palette'
import { flow } from '@/game/flow'
import { currentHub } from '@/game/boot'
import { sfx } from '@/game/audio/sfx'

/**
 * Cobalt's gear and stats. Six sockets across the top (buster, helmet, chest,
 * boots, two chips); tap one to list what fits it, tap an item to compare it
 * with what is equipped, then Equip or Salvage. Equipping repaints Cobalt in
 * the lab behind the menu.
 */
const { t } = useI18n()
const ATTRS: Attr[] = ['hp', 'we', 'power']
const slot = ref<EquipSlot>('buster')
const selId = ref<string | null>(profile.inv.equipped.buster)
const slotKind = (s: EquipSlot): Slot => (s === 'chip1' || s === 'chip2' ? 'chip' : s)
const items = computed(() => profile.inv.items
  .filter(i => i.slot === slotKind(slot.value))
  .sort((a, b) => Number(!!isEquipped(b.id)) - Number(!!isEquipped(a.id)) || itemPower(b) - itemPower(a)))
const selected = computed(() => itemById(selId.value))
const compareTo = computed(() => {
  const s = selected.value
  if (!s || isEquipped(s.id)) return null
  return equipped(s.slot === 'chip' ? 'chip1' : s.slot as EquipSlot)
})
const freshIn = (s: EquipSlot) => profile.inv.items.some(i => i.slot === slotKind(s) && profile.inv.fresh.includes(i.id))

const pickSlot = (s: EquipSlot) => {
  slot.value = s
  selId.value = profile.inv.equipped[s] ?? items.value[0]?.id ?? null
  sfx('uiClick')
}
const select = (id: string) => {
  selId.value = id
  markSeen(id)
  sfx('uiClick')
}
const equip = () => {
  if (!selected.value) return
  const socket = slot.value === 'chip1' || slot.value === 'chip2' ? slot.value : undefined
  equipItem(selected.value.id, socket)
  currentHub()?.refreshHero()
  sfx('weapon')
}
const unequip = () => {
  const s = selected.value ? isEquipped(selected.value.id) : null
  if (s === 'chip1' || s === 'chip2') unequipChip(s)
  sfx('uiClick')
}
const salvage = () => {
  const s = selected.value
  if (!s) return
  if (salvageItem(s.id, salvageValue(s))) {
    sfx('bolt')
    selId.value = items.value[0]?.id ?? null
  }
}

const pct = (v: number) => `${Math.round(v * 100)}%`
const statRows = computed(() => {
  void profile.level
  void profile.inv.equipped
  const s = computeStats()
  return [
    { k: 'hero.stat.hp', v: s.maxHp },
    { k: 'hero.stat.we', v: s.maxWe },
    { k: 'hero.stat.power', v: s.maxPower },
    { k: 'hero.stat.damage', v: Math.round(s.busterDmg * s.pelletMul) },
    { k: 'hero.stat.charge', v: Math.round(s.busterDmg * 4 * s.chargeDmgMul) },
    { k: 'hero.stat.armor', v: armorTotal() },
    { k: 'hero.stat.crit', v: pct(s.critChance) },
    { k: 'hero.stat.tanks', v: `${profile.inv.tanks}/${s.tanksMax}` }
  ]
})
</script>

<style scoped lang="sass">
@use './sheet'
.attr-cta
  padding: 10px
  border-radius: 12px
  border: 3px solid #141a33
  background: linear-gradient(#ffd23a, #e08a00)
  color: #141a33
  font-family: var(--font-ui)
  font-size: clamp(13px, 2.8vmin, 16px)
  animation: cta 1.2s ease-in-out infinite
.slots
  display: grid
  grid-template-columns: repeat(6, 1fr)
  gap: 6px
.slot
  position: relative
  aspect-ratio: 1
  border-radius: 12px
  border: 3px solid var(--rc, #3a5a9a)
  background: rgba(0, 0, 0, 0.3)
  color: #fff
  padding: 18%
  &.on
    background: rgba(79, 216, 255, 0.25)
    outline: 2px solid #fff
  &.empty
    color: #5d6a82
.s-ico
  display: block
  width: 100%
  height: 100%
.s-lvl
  position: absolute
  right: 2px
  bottom: 1px
  font-family: var(--font-pixel)
  font-size: 7px
.s-new
  position: absolute
  right: -5px
  top: -6px
  width: 16px
  height: 16px
  border-radius: 50%
  background: #ff4a5a
  border: 2px solid #141a33
  font-size: 9px
  line-height: 12px
.cols
  display: flex
  gap: 10px
.list
  flex: 1
  min-width: 0
  display: flex
  flex-direction: column
  gap: 4px
.row
  display: flex
  align-items: center
  gap: 8px
  padding: 7px 10px
  border-radius: 10px
  border-left: 4px solid var(--rc)
  background: rgba(0, 0, 0, 0.25)
  color: #fff
  text-align: left
  font-family: var(--font-ui)
  font-size: clamp(12px, 2.6vmin, 14px)
  &.sel
    background: rgba(79, 216, 255, 0.22)
.r-name
  color: var(--rc)
  flex: 1
  min-width: 0
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
.r-upg
  color: #ffd84a
.r-meta
  font-family: var(--font-pixel)
  font-size: 0.6em
  color: #9fe6ff
.r-tag
  font-size: 0.75em
  color: #8dff7a
.r-new
  font-size: 0.7em
  padding: 1px 5px
  border-radius: 6px
  background: #ff4a5a
.empty-note
  color: #7f8ba3
  font-size: clamp(12px, 2.6vmin, 14px)
.detail-col
  flex: 1
  min-width: 0
.actions
  display: flex
  gap: 8px
  flex-wrap: wrap
.btn
  flex: 1
  padding: 8px 10px
  border-radius: 12px
  border: 3px solid #141a33
  color: #fff
  font-family: var(--font-ui)
  font-size: clamp(12px, 2.6vmin, 15px)
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  &:active
    transform: translateY(2px)
.equip
  background: linear-gradient(#7ff4ff, #1f7fd0)
.unequip
  background: linear-gradient(#5d6a82, #3b4458)
.salvage
  background: linear-gradient(#ffb04a, #c25a00)
.stats
  display: grid
  grid-template-columns: repeat(2, 1fr)
  gap: 4px 12px
  padding: 8px 12px
  border-radius: 12px
  background: rgba(0, 0, 0, 0.25)
.stat
  display: flex
  justify-content: space-between
  font-size: clamp(12px, 2.6vmin, 15px)
.k
  color: #cfe0ff
.v
  font-family: var(--font-pixel)
  font-size: 0.75em
.attrs
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: 8px
.attr
  display: flex
  align-items: center
  gap: 6px
  padding: 8px
  border-radius: 12px
  border: 2px solid #141a33
  font-size: clamp(12px, 2.6vmin, 14px)
  &.hp
    background: linear-gradient(#d0303f, #7a1420)
  &.we
    background: linear-gradient(#1f7fd0, #123c6e)
  &.power
    background: linear-gradient(#2f9a3f, #145a22)
.ai
  width: 20px
  height: 20px
.av
  margin-left: auto
  font-family: var(--font-pixel)
  font-size: 0.75em
@media (orientation: portrait)
  .cols
    flex-direction: column
@keyframes cta
  50%
    transform: scale(1.03)
</style>
