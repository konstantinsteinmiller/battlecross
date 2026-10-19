<template lang="pug">
  button.item-cell(
    type="button"
    :class="{ 'is-sel': selected, 'is-worn': worn, 'is-dim': dim, 'has-tag': !!$slots.tag }"
    :aria-label="t(`item.${id}.name`)"
    :aria-pressed="selected"
    :data-item="id"
  )
    span.item-cell__icon
      ItemIcon(:id="id" :dim="dim")
    //- Worn right now: a blue shield crest on the corner.
    span.item-cell__worn(v-if="worn" aria-hidden="true")
      GameIcon(name="shield")
    //- Better than what is worn in its slot (`data/upgrade.ts`): a green arrow.
    span.item-cell__up(v-if="better" aria-hidden="true")
      GameIcon(name="up")
    //- Never looked at: the "new" dot.
    span.cell__new(v-if="fresh" aria-hidden="true")
    //- A price, "owned", whatever the caller hangs under it.
    span.item-cell__tag(v-if="$slots.tag")
      slot(name="tag")
</template>

<script setup lang="ts">
/**
 * One item in a grid: the bag, a merchant's shelf, the buy-back row. It is a
 * button (a tap selects it) and the thing that is picked up in a drag; the
 * marks on its corners say what the hero should know before tapping it —
 * worn, new, better than what he wears — and the `tag` slot carries a price.
 */
import { useI18n } from 'vue-i18n'
import ItemIcon from '@/components/art/ItemIcon.vue'
import GameIcon from '@/components/icons/GameIcon.vue'

withDefaults(defineProps<{
  id: string
  selected?: boolean
  /** The hero wears it. */
  worn?: boolean
  /** Not yet looked at. */
  fresh?: boolean
  /** Greyed: already owned, sold out, not for this hero. */
  dim?: boolean
  /** Beats what the hero wears in its slot. */
  better?: boolean
}>(), { selected: false, worn: false, fresh: false, dim: false, better: false })
const { t } = useI18n()
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'

.item-cell
  +screen.bare-button
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.2rem
  width: 100%
  min-width: 0
  border-radius: var(--bc-r-md)
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
  &:active
    transition-duration: var(--bc-t-press)
    transform: scale(0.93)
.item-cell__icon
  position: relative
  display: block
  width: 100%
  border-radius: 24%
.is-sel .item-cell__icon
  +screen.chosen

.item-cell__worn, .cell__new, .item-cell__up
  position: absolute
  z-index: 1
  pointer-events: none
  // Round at any cell size: border-box, so the padding and the outline stay
  // inside the square the aspect ratio makes, and never shrink or stretch.
  box-sizing: border-box
  display: flex
  align-items: center
  justify-content: center
// Worn: a blue shield crest, top left.
.item-cell__worn
  left: -5%
  top: -5%
  width: 36%
  aspect-ratio: 1 / 1
  padding: 7%
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-blue)
  color: var(--bc-text)
  :deep(svg)
    display: block
    width: 100%
    height: 100%
// Better: a green arrow, bottom right.
.item-cell__up
  right: -5%
  bottom: -5%
  width: 36%
  aspect-ratio: 1 / 1
  padding: 5%
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-green)
  color: var(--bc-text)
  box-shadow: 0 2px 0 var(--bc-ink)
  :deep(svg)
    display: block
    width: 100%
    height: 100%
// New: a red dot that breathes, top right.
.cell__new
  right: -6%
  top: -6%
  width: 32%
  aspect-ratio: 1 / 1
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-red)
  animation: cell-new 0.8s ease-in-out infinite alternate
.item-cell__tag
  display: flex
  justify-content: center
  max-width: 100%
  min-height: 1.2em

@keyframes cell-new
  from
    transform: scale(0.85)
  to
    transform: scale(1.15)
@media (prefers-reduced-motion: reduce)
  .cell__new
    animation: none
</style>
