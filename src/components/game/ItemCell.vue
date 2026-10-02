<template lang="pug">
  button.item-cell(
    type="button"
    :class="{ 'is-sel': selected, 'is-worn': worn, 'is-locked': locked, 'is-dim': dim, 'has-tag': !!$slots.tag }"
    :aria-label="t(`item.${id}.name`)"
    :aria-pressed="selected"
    :data-item="id"
  )
    span.item-cell__icon
      ItemIcon(:id="id" :dim="dim")
    //- Worn right now: a green tick on the corner.
    span.item-cell__worn(v-if="worn" aria-hidden="true")
      GameIcon(name="check")
    //- Above the hero's level: a padlock and the level it asks for.
    span.item-cell__lock(v-if="locked" aria-hidden="true")
      GameIcon(name="lock")
      | {{ item ? item.level : '' }}
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
 * worn, new, above his level — and the `tag` slot carries a price.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ITEM_BY_ID } from '@/game/data/items'
import ItemIcon from '@/components/art/ItemIcon.vue'
import GameIcon from '@/components/icons/GameIcon.vue'

const props = withDefaults(defineProps<{
  id: string
  selected?: boolean
  /** The hero wears it. */
  worn?: boolean
  /** Not yet looked at. */
  fresh?: boolean
  /** Its level is above the hero's: he cannot wear it yet. */
  locked?: boolean
  /** Greyed: already owned, sold out, not for this hero. */
  dim?: boolean
}>(), { selected: false, worn: false, fresh: false, locked: false, dim: false })
const { t } = useI18n()
const item = computed(() => ITEM_BY_ID[props.id])
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

.item-cell__worn, .item-cell__lock, .cell__new
  position: absolute
  z-index: 1
  pointer-events: none
// Worn: a tick, top left.
.item-cell__worn
  left: -5%
  top: -5%
  width: 36%
  aspect-ratio: 1
  padding: 5%
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-green-lo)
  color: var(--bc-text)
  :deep(svg)
    display: block
    width: 100%
    height: 100%
// Above the hero's level: a lock and the number, across the foot of the icon.
.item-cell__lock
  +screen.tag('red')
  left: 50%
  top: 0
  translate: -50% -30%
  padding-inline: 0.35em
  font-size: clamp(0.56rem, 2.2vmin, 0.7rem)
  :deep(svg)
    width: 0.9em
    height: 0.9em
// New: a red dot that breathes, top right.
.cell__new
  right: -6%
  top: -6%
  width: 32%
  aspect-ratio: 1
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
