<template lang="pug">
  div.equip-card
    button.equip-card__close(type="button" :aria-label="t('close')" @click="emit('close')")
      GameIcon(name="close")
    //- The card scrolls; what can be done with it stays in reach.
    div.equip-card__paper
      ItemCard(:id="id" :against="against" show-source)
    //- The smith (roadmap #90): a worn piece goes up a level, in a town.
    p.equip-card__note.is-forge(v-if="worn && forge && !forge.town") {{ t('forge.town') }}
    p.equip-card__note.is-forge(v-else-if="worn && forge && forge.cost") {{ t('forge.next', { level: fmt(forge.level + 1), pct: fmt2(forge.pct) }) }}
    p.equip-card__note.is-forge(v-if="worn && heroicDone") {{ t('relic.heroicMax') }}
    div.bag__actions
      FButton(
        v-if="worn && forge && forge.town && forge.cost"
        :label="t('forge.upgrade', { n: fmtBig(forge.cost) })"
        type="primary"
        size="sm"
        icon="up"
        data-coach="forge"
        :is-disabled="!forge.affordable"
        @click="emit('upgrade')"
      )
      //- Heroic+ (afterplay §2.4): a worn piece's ranks past the gold levels, at a town's smith.
      FButton(
        v-if="worn && heroic && forge && forge.town"
        :label="heroic.ichor ? t('relic.heroicIchor', { n: heroic.rank + 1, gold: fmtBig(heroic.gold), glass: fmt(heroic.glass), ichor: fmt(heroic.ichor) }) : t('relic.heroic', { n: heroic.rank + 1, gold: fmtBig(heroic.gold), glass: fmt(heroic.glass) })"
        type="primary"
        size="sm"
        icon="up"
        data-heroic
        :is-disabled="!heroic.affordable"
        @click="emit('heroic')"
      )
      //- Infernal smithing (after B6): the piece remade as its Infernal twin, at a town's smith.
      FButton(
        v-if="infernal && town"
        :label="t('relic.infernalForge', { gold: fmtBig(infernal.gold), glass: fmt(infernal.glass) })"
        type="primary"
        size="sm"
        icon="up"
        data-infernal
        :is-disabled="!infernal.affordable"
        @click="emit('infernal')"
      )
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
import { fmt, fmt2, fmtBig } from '@/utils/format'

defineProps<{
  id: string
  /** The worn piece it is compared with. */
  against: string | null
  /** It is worn (the action takes it off). */
  worn: boolean
  /** The hero owns it, so he can put it on. */
  canWear: boolean
  /** A worn piece's upgrade: its level, the next level's price and gain (in
   *  percent of the piece's own numbers), whether the hero is in a town and
   *  has the gold. There is no top level. */
  forge?: { level: number; cost: number; pct: number; town: boolean; affordable: boolean } | null
  /** Its next heroic rank (afterplay): the rank it has, the next one's price, whether it is paid for. */
  heroic?: { rank: number; gold: number; glass: number; ichor: number; affordable: boolean } | null
  /** Every heroic rank taken. */
  heroicDone?: boolean
  /** Remaking it as its Infernal twin (after B6): the price, whether it is paid for. */
  infernal?: { gold: number; glass: number; affordable: boolean } | null
  /** The hero stands in a town (a smith is at hand). */
  town?: boolean
}>()
const emit = defineEmits<{ (e: 'equip'): void; (e: 'unequip'): void; (e: 'close'): void; (e: 'upgrade'): void; (e: 'heroic'): void; (e: 'infernal'): void }>()
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
  &.is-forge
    color: var(--bc-text-gold)
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
