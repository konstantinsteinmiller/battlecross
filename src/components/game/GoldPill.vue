<template lang="pug">
  span.gold-pill(role="img" :class="{ 'is-up': dir > 0, 'is-down': dir < 0 }" :aria-label="t('hud.gold', { n: fmt(profile.gold) })")
    IconCoin.gold-pill__coin
    span.gold-pill__n {{ fmt(shown) }}
</template>

<script setup lang="ts">
/** The purse, wherever it is spent. The number rolls to its new value: gold
 *  is seen leaving and arriving, not swapped for another figure. */
import { useI18n } from 'vue-i18n'
import { profile } from '@/game/state/profile'
import { fmt } from '@/utils/format'
import IconCoin from '@/components/icons/IconCoin.vue'
import { useRolling } from './fx'

const { t } = useI18n()
const { shown, dir } = useRolling(() => profile.gold)
</script>

<style scoped lang="sass">
// The purse: a dark plate of its own, so the gold reads on parchment and on
// slate alike.
.gold-pill
  display: inline-flex
  align-items: center
  gap: 0.3em
  flex: 0 0 auto
  padding: 0.25em 0.75em 0.25em 0.4em
  border-radius: var(--bc-r-pill)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  background: linear-gradient(180deg, var(--bc-slate) 0, var(--bc-slate) 46%, var(--bc-slate-deep) 46%, var(--bc-slate-deep) 100%)
  box-shadow: var(--bc-drop)
  color: var(--bc-text-gold)
  font-size: clamp(0.84rem, 3.5vmin, 1.1rem)
  line-height: 1
  text-shadow: var(--bc-text-outline-thin)
  font-variant-numeric: tabular-nums
.gold-pill__coin
  width: 1.25em
  height: 1.25em
  user-select: none
  -webkit-user-drag: none
// While it rolls, the figure wears the direction it is going.
.is-up .gold-pill__n
  color: var(--bc-text-good)
.is-down .gold-pill__n
  color: var(--bc-text-bad)
</style>
