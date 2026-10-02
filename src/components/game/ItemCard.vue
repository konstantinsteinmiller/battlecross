<template lang="pug">
  div.item-card(v-if="item" :style="{ '--tier': tint }")
    div.item-card__head
      span.item-card__icon
        ItemIcon(:id="id")
      span.item-card__title
        span.item-card__name {{ t(`item.${id}.name`) }}
        span.item-card__sub
          | {{ t(`slot.${item.slot}`) }} · {{ t(`tier.${item.tier}`) }} ·
          |
          span(:class="{ bad: profile.level < item.level }") {{ t('hud.level', { n: item.level }) }}
    ul.item-card__lines
      li.item-card__weapon(v-if="item.weapon") {{ t(`weapon.${item.weapon.style}`, { attr: t(`attr.${item.weapon.scale}.short`) }) }}
      li(v-if="item.armor") {{ t('mod.armor', { n: item.armor }) }}
      li(v-for="l in lines" :key="l.id" :class="{ unique: !l.attr }" :style="l.attr ? { color: attrColor(l.id) } : undefined") {{ t(l.key, { n: l.n }) }}
    p.item-card__from(v-if="showSource") {{ t(`source.${item.drop.src}`, { zone: t(`node.${item.drop.zone}.name`) }) }}
</template>

<script setup lang="ts">
/** One item, spelled out: what it is, what it needs, what it gives. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ITEM_BY_ID, TIER_COLOR } from '@/game/data/items'
import { ATTR_COLOR, type Attr } from '@/game/data/attributes'
import { profile } from '@/game/state/profile'
import ItemIcon from '@/components/art/ItemIcon.vue'
import { modLines } from './modLines'

const props = withDefaults(defineProps<{ id: string; showSource?: boolean }>(), { showSource: false })
const { t } = useI18n()
const item = computed(() => ITEM_BY_ID[props.id])
const tint = computed(() => TIER_COLOR[item.value?.tier ?? 1])
const lines = computed(() => modLines(item.value?.mods))
const attrColor = (id: string): string => ATTR_COLOR[id as Attr]
</script>

<style scoped lang="sass">
.item-card
  display: flex
  flex-direction: column
  gap: 0.4rem
  padding: clamp(0.5rem, 2.2vmin, 0.8rem)
  border-radius: 0.8rem
  border: 2px solid #0f1a30
  background: linear-gradient(180deg, rgba(20, 28, 60, 0.85), rgba(14, 20, 44, 0.85))
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--tier) 55%, transparent)
  color: #fff
  text-align: left
.item-card__head
  display: flex
  align-items: center
  gap: 0.6rem
.item-card__icon
  width: clamp(2.6rem, 11vmin, 3.4rem)
  flex: 0 0 auto
.item-card__title
  display: flex
  flex-direction: column
  min-width: 0
.item-card__name
  color: var(--tier)
  font-size: clamp(0.92rem, 3.8vmin, 1.2rem)
  line-height: 1.15
.item-card__sub
  color: #b9c4ee
  font-size: clamp(0.7rem, 2.9vmin, 0.88rem)
  line-height: 1.2
.bad
  color: #ff8080
.item-card__lines
  margin: 0
  padding: 0
  list-style: none
  display: flex
  flex-direction: column
  gap: 0.1rem
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
  line-height: 1.25
  .unique
    color: #ffe9a8
.item-card__weapon
  color: #dfe6ff
.item-card__from
  margin: 0
  color: #9aa6d0
  font-size: clamp(0.68rem, 2.8vmin, 0.84rem)
</style>
