<template lang="pug">
  div.outcome
    span.outcome__pill.outcome__rep(
      v-for="r in rep"
      :key="r.f"
      :style="{ '--c': FACTION_COLOR[r.f] }"
      :class="{ down: r.n < 0 }"
    ) {{ t(`faction.${r.f}`) }} {{ r.n > 0 ? '+' : '' }}{{ r.n }}
    span.outcome__pill.outcome__gold(v-if="choice.gold")
      IconCoin.outcome__coin
      | +{{ fmt(choice.gold) }}
    span.outcome__pill.outcome__item(v-if="choice.item")
      span.outcome__icon
        ItemIcon(:id="choice.item")
      | {{ t(`item.${choice.item}.name`) }}
</template>

<script setup lang="ts">
/** What a quest decision changed: standing with the factions, gold, an item. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FACTIONS, FACTION_COLOR, type ChoiceDef } from '@/game/data/quests'
import { fmt } from '@/utils/format'
import IconCoin from '@/components/icons/IconCoin.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'

const props = defineProps<{ choice: ChoiceDef }>()
const { t } = useI18n()
const rep = computed(() => {
  const r = props.choice.rep
  return r ? FACTIONS.filter(f => r[f]).map(f => ({ f, n: r[f] ?? 0 })) : []
})
</script>

<style scoped lang="sass">
.outcome
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.4rem
  font-family: var(--font-ui)
.outcome__pill
  display: inline-flex
  align-items: center
  gap: 0.3em
  padding: 0.25em 0.75em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--bc-slate) 0, var(--bc-slate) 46%, var(--bc-slate-deep) 46%, var(--bc-slate-deep) 100%)
  box-shadow: var(--bc-drop)
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
  line-height: 1.2
  animation: outcome-in 320ms var(--bc-ease-pop) both
  &:nth-child(2)
    animation-delay: 90ms
  &:nth-child(3)
    animation-delay: 180ms
  &:nth-child(4)
    animation-delay: 270ms
.outcome__rep
  color: var(--c)
  &.down
    color: var(--bc-text-bad)
.outcome__gold
  color: var(--bc-text-gold)
.outcome__item
  color: var(--bc-text)
.outcome__coin
  width: 1.1em
  height: 1.1em
.outcome__icon
  width: 1.8em
@keyframes outcome-in
  from
    opacity: 0
    transform: translateY(0.4em) scale(0.8)
@media (prefers-reduced-motion: reduce)
  .outcome__pill
    animation: none
</style>
