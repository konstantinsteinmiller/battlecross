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
      li(v-for="l in lines" :key="l.id" :class="{ unique: !l.attr, 'is-attr': l.attr }" :style="l.attr ? { '--dot': attrColor(l.id) } : undefined") {{ t(l.key, { n: l.n }) }}
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
@use '@/assets/css/cel'

// A parchment card under a ribbon in the item's tier colour. The card brings
// its own page and its own ink, so it reads the same in any window.
.item-card
  position: relative
  display: flex
  flex-direction: column
  gap: 0.4rem
  padding: clamp(0.5rem, 2.2vmin, 0.8rem)
  border-radius: var(--bc-r-md)
  border: var(--bc-ol) solid var(--bc-ink)
  background: linear-gradient(180deg, var(--bc-paper-hi) 0, var(--bc-paper-hi) 0.4rem, var(--bc-paper) 0.4rem, var(--bc-paper) 100%)
  box-shadow: var(--bc-drop)
  color: var(--bc-paper-ink)
  text-align: start
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
  align-items: flex-start
  gap: 0.2rem
  min-width: 0
// The name on a two-tone band of the tier's colour.
.item-card__name
  max-width: 100%
  padding: 0.12em 0.6em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: linear-gradient(180deg, color-mix(in srgb, var(--tier) 72%, var(--bc-white)) 0, color-mix(in srgb, var(--tier) 72%, var(--bc-white)) 46%, var(--tier) 46%, var(--tier) 100%)
  +cel.label
  font-size: clamp(0.9rem, 3.7vmin, 1.15rem)
  line-height: 1.15
.item-card__sub
  color: var(--bc-paper-ink-soft)
  font-size: clamp(0.7rem, 2.9vmin, 0.88rem)
  line-height: 1.2
.bad
  color: var(--bc-red-lo)
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
    color: var(--bc-gold-deep)
  // An attribute's colour is a bead before its line: candy on cream is not
  // readable as text.
  .is-attr::before
    content: ''
    display: inline-block
    width: 0.62em
    height: 0.62em
    margin-inline-end: 0.4em
    border: 1.5px solid var(--bc-ink)
    border-radius: 50%
    background: var(--dot)
.item-card__weapon
  color: var(--bc-paper-ink-soft)
.item-card__from
  margin: 0
  color: var(--bc-paper-ink-soft)
  font-size: clamp(0.68rem, 2.8vmin, 0.84rem)
</style>
