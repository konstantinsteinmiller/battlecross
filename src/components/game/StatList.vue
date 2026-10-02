<template lang="pug">
  dl.stats(:class="[`stats--${layout}`, { 'is-preview': changed }]")
    div.stat(
      v-for="r in shown"
      :key="r.key"
      :class="{ 'is-up': r.delta > 0, 'is-down': r.delta < 0 }"
    )
      dt.stat__name {{ t(`stat.${r.key}`) }}
      dd.stat__val
        //- Keyed on the figure: a change re-mounts it, and it ticks.
        span.stat__n(:key="r.next") {{ r.next }}
        span.stat__delta(v-if="r.deltaText") {{ r.deltaText }}
</template>

<script setup lang="ts">
/**
 * The hero's derived stats as a list. Given rows that carry a preview
 * (`statRows(now, next)`), every stat a change would move shows its NEW value
 * in green or red with the difference beside it — before anything is
 * committed. `only-changed` lists just those (the trade table's card).
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StatRow } from './heroSheet'

const props = withDefaults(defineProps<{
  rows: StatRow[]
  /** `grid`: label over value in cells. `rows`: label left, value right. `chips`: a wrapping row of tags. */
  layout?: 'grid' | 'rows' | 'chips'
  onlyChanged?: boolean
}>(), { layout: 'grid', onlyChanged: false })
const { t } = useI18n()
const shown = computed(() => (props.onlyChanged ? props.rows.filter(r => r.delta !== 0) : props.rows))
const changed = computed(() => props.rows.some(r => r.delta !== 0))
</script>

<style scoped lang="sass">
.stats
  margin: 0
  display: grid
  gap: clamp(0.2rem, 0.9vmin, 0.35rem)
.stat
  display: flex
  min-width: 0
  border-radius: var(--bc-r-sm)
  background: var(--bc-cell)
  line-height: 1.15
  transition: background-color 160ms ease-out
.stat__name
  min-width: 0
  color: var(--bc-on-soft)
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
.stat__val
  display: inline-flex
  align-items: baseline
  gap: 0.3em
  margin: 0
  color: var(--bc-on)
  font-variant-numeric: tabular-nums
  white-space: nowrap
.stat__n
  display: inline-block
  animation: stat-tick 260ms var(--bc-ease-pop)
.stat__delta
  font-size: 0.82em

// ── A stat a change would move ───────────────────────────────────────────────
.is-up
  background: color-mix(in srgb, var(--bc-green) 30%, var(--bc-cell))
  .stat__val
    color: var(--bc-on-good)
.is-down
  background: color-mix(in srgb, var(--bc-red) 30%, var(--bc-cell))
  .stat__val
    color: var(--bc-on-bad)

// ── Layouts ──────────────────────────────────────────────────────────────────
.stats--grid
  grid-template-columns: repeat(auto-fill, minmax(min(30%, 6.2rem), 1fr))
  .stat
    flex-direction: column
    align-items: flex-start
    padding: 0.22rem 0.45rem
  .stat__name
    max-width: 100%
    font-size: clamp(0.56rem, 2.3vmin, 0.72rem)
  .stat__val
    font-size: clamp(0.78rem, 3.2vmin, 1rem)
.stats--rows
  grid-template-columns: minmax(0, 1fr)
  .stat
    align-items: baseline
    justify-content: space-between
    gap: 0.5rem
    padding: 0.24rem 0.55rem
    font-size: clamp(0.72rem, 2.9vmin, 0.9rem)
.stats--chips
  display: flex
  flex-wrap: wrap
  .stat
    align-items: baseline
    gap: 0.4em
    padding: 0.16rem 0.5rem
    border-radius: var(--bc-r-pill)
    font-size: clamp(0.68rem, 2.8vmin, 0.86rem)

@keyframes stat-tick
  from
    transform: translateY(-0.35em) scale(1.25)
  to
    transform: translateY(0) scale(1)
@media (prefers-reduced-motion: reduce)
  .stat__n
    animation: none
</style>
