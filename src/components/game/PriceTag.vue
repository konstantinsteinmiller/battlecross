<template lang="pug">
  span.price-tag(:class="{ 'is-bad': bad, 'is-plain': plain }")
    IconCoin.price-tag__coin
    //- What it would cost without the discount, struck through.
    s.price-tag__base(v-if="base > n") {{ fmt(base) }}
    span.price-tag__n {{ fmt(n) }}
</template>

<script setup lang="ts">
/**
 * A sum of gold beside a coin: a price on a shelf, what a merchant pays, a
 * lesson's fee. With `base` above `n` the full price is shown struck through
 * before it: Charisma haggled, or a friendly faction gave its discount.
 */
import { fmt } from '@/utils/format'
import IconCoin from '@/components/icons/IconCoin.vue'

withDefaults(defineProps<{
  n: number
  /** The price before any discount. */
  base?: number
  /** The hero cannot pay it. */
  bad?: boolean
  /** Bare figures on the surface (no plate): inside a card or a list row. */
  plain?: boolean
}>(), { base: 0, bad: false, plain: false })
</script>

<style scoped lang="sass">
.price-tag
  display: inline-flex
  align-items: center
  gap: 0.25em
  padding: 0.08em 0.5em 0.08em 0.3em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: var(--bc-slate-deep)
  color: var(--bc-text-gold)
  line-height: 1.2
  white-space: nowrap
  font-variant-numeric: tabular-nums
  text-shadow: var(--bc-text-outline-thin)
.price-tag__coin
  flex: 0 0 auto
  width: 1.05em
  height: 1.05em
.price-tag__base
  color: var(--bc-text-mute)
  font-size: 0.86em
.is-bad
  color: var(--bc-text-bad)
.is-plain
  padding: 0
  border: 0
  background: none
</style>
