<template lang="pug">
  svg.ore-icon(viewBox="0 0 48 48" aria-hidden="true" focusable="false")
    g(stroke="#1b1626" stroke-width="2.4" stroke-linejoin="round")
      //- A nugget: a lumpy stone of the metal's colour, a facet catching the light.
      path(d="M8 32 L12 18 L22 10 L34 12 L42 22 L40 36 L28 42 L14 40 Z" :fill="look.vein")
      path(d="M22 10 L26 22 L12 18 Z" :fill="look.glint" stroke-width="1.6")
      path(d="M26 22 L42 22 L34 12 Z" :fill="look.glint" stroke-width="1.6" opacity="0.7")
      path(d="M26 22 L28 42" fill="none" stroke-width="1.4" opacity="0.5")
      circle(cx="17" cy="16" r="1.8" fill="#ffffff" stroke="none")
</template>

<script setup lang="ts">
/**
 * A nugget of ore (#99): the toast when one is mined, the bag's Ore tab and
 * the smith's counter. One drawing, in each metal's own colours.
 */
import { computed } from 'vue'
import { ORE_LOOK, isOre } from '@/game/data/ores'

const props = defineProps<{ id: string }>()
const look = computed(() => (isOre(props.id) ? ORE_LOOK[props.id] : ORE_LOOK.iron))
</script>

<style scoped lang="sass">
.ore-icon
  width: 100%
  height: 100%
  display: block
</style>
