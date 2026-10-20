<template lang="pug">
  ArtIcon(:class="{ 'is-infernal': !!base }" :glyph="item ? item.kind : 'unknown'" :tint="tint" :src="src" :dim="dim")
</template>

<script setup lang="ts">
/** An item's icon: its kind's drawing in its tier's colour, or the painted
 *  file `public/images/items/<id>.webp` when one exists. An Infernal twin
 *  (afterplay §2.4) is its original's icon in a red-black tint. */
import { computed } from 'vue'
import ArtIcon from './ArtIcon.vue'
import { ITEM_BY_ID, TIER_COLOR } from '@/game/data/items'
import { ITEM_ART } from '@/game/assets/overrides'

const props = withDefaults(defineProps<{
  id: string
  dim?: boolean
  /** Dev benches: the vector drawing even when a painted file exists. */
  drawn?: boolean
}>(), { dim: false, drawn: false })
const item = computed(() => ITEM_BY_ID[props.id])
const base = computed(() => item.value?.infernal ?? '')
const tint = computed(() => TIER_COLOR[item.value?.tier ?? 1] ?? '#c9d2e3')
const src = computed(() => (props.drawn ? '' : ITEM_ART.get(props.id) ?? (base.value ? ITEM_ART.get(base.value) : '') ?? ''))
</script>

<style scoped lang="sass">
// The Infernal tint: the drawing burnt toward red-black, with an ember rim.
.is-infernal
  filter: sepia(0.6) saturate(2.6) hue-rotate(-28deg) brightness(0.72) contrast(1.15)
  box-shadow: 0 0 0 0.1em #3a0a12, 0 0 0.45em 0.05em #c0202a
  border-radius: 24%
</style>
