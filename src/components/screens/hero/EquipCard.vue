<template lang="pug">
  div.equip-card
    button.equip-card__close(type="button" :aria-label="t('close')" @click="emit('close')")
      GameIcon(name="close")
    //- The card scrolls; what can be done with it stays in reach.
    div.equip-card__paper
      ItemCard(:id="id" :against="against" show-source)
    p.equip-card__note(v-if="!worn && !canWear") {{ t('bag.tooLow', { n: level }) }}
    div.bag__actions
      FButton(v-if="worn" :label="t('bag.unequip')" type="danger" size="sm" @click="emit('unequip')")
      FButton(v-else :label="t('bag.equip')" type="success" size="sm" :is-disabled="!canWear" @click="emit('equip')")
</template>

<script setup lang="ts">
/**
 * The piece in hand on the equipment page: its card (compared with what is
 * worn in its slot), why it cannot be worn yet if it cannot, and the one
 * thing to do with it — put it on, or take it off. On a phone in portrait it
 * stands on the hero's plinth in his place; elsewhere it has a column.
 */
import { useI18n } from 'vue-i18n'
import FButton from '@/components/atoms/FButton.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import ItemCard from '@/components/game/ItemCard.vue'

defineProps<{
  id: string
  /** The worn piece it is compared with. */
  against: string | null
  /** It is worn (the action takes it off). */
  worn: boolean
  /** The hero's level allows it. */
  canWear: boolean
  /** The level it asks for. */
  level: number
}>()
const emit = defineEmits<{ (e: 'equip'): void; (e: 'unequip'): void; (e: 'close'): void }>()
const { t } = useI18n()
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'

.equip-card
  position: relative
  display: flex
  flex-direction: column
  gap: clamp(0.35rem, 1.6vmin, 0.7rem)
  min-width: 0
  min-height: 0
  max-height: 100%
.equip-card__paper
  flex: 0 1 auto
  min-height: 0
  padding-bottom: 0.25rem
  +screen.scroller
  // A long name keeps clear of the close button on the corner.
  :deep(.item-card__title)
    padding-inline-end: 2rem
.equip-card__note
  margin: 0
  +cel.label
  color: var(--bc-text-bad)
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
  text-shadow: var(--bc-text-outline-thin)
  text-align: end
.bag__actions
  display: flex
  align-items: center
  justify-content: flex-end
  flex-wrap: wrap
  gap: 0.5rem
  padding-bottom: var(--bc-press)
// A round "put it back" button on the card's corner.
.equip-card__close
  +screen.bare-button
  +cel.tone('stone')
  position: absolute
  right: -0.35rem
  top: -0.45rem
  z-index: 3
  width: 2.75rem
  height: 2.75rem
  padding: 0.75rem
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: 50%
  +cel.fill(48%, 100%)
  box-shadow: var(--bc-drop)
  color: var(--bc-text)
  :deep(svg)
    display: block
    width: 100%
    height: 100%
</style>
