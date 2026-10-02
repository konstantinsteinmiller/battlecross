<template lang="pug">
  ArtIcon(:glyph="item ? item.kind : 'unknown'" :tint="tint" :src="src" :dim="dim")
</template>

<script setup lang="ts">
/** An item's icon: its kind's drawing in its tier's colour, or the painted
 *  file `public/images/items/<id>.webp` when one exists. */
import { computed } from 'vue'
import ArtIcon from './ArtIcon.vue'
import { ITEM_BY_ID, TIER_COLOR } from '@/game/data/items'
import { ITEM_ART } from '@/game/assets/overrides'

const props = withDefaults(defineProps<{ id: string; dim?: boolean }>(), { dim: false })
const item = computed(() => ITEM_BY_ID[props.id])
const tint = computed(() => TIER_COLOR[item.value?.tier ?? 1] ?? '#c9d2e3')
const src = computed(() => ITEM_ART.get(props.id) ?? '')
</script>
