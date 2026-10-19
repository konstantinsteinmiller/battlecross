<template lang="pug">
  span.status-chip(:data-status="chip.id" :data-stacks="showsCount(chip) ? chip.n : undefined")
    ArtIcon(:glyph="`status.${chip.id}`" :tint="statusTint(chip.id)" :src="ICON_ART.get(`status-${chip.id}`)" frame="round")
    span.status-chip__n(v-if="showsCount(chip)") {{ chip.n }}
</template>

<script setup lang="ts">
/** One status icon, with its stack count when it stacks (#152). */
import ArtIcon from '@/components/art/ArtIcon.vue'
import { ICON_ART } from '@/game/assets/overrides'
import { statusTint } from '@/components/art/tints'
import { showsCount, type StatusChip } from '@/game/state/statusView'

defineProps<{ chip: StatusChip }>()
</script>

<style scoped lang="sass">
.status-chip
  position: relative
  display: block
.status-chip__n
  position: absolute
  right: -0.3em
  bottom: -0.3em
  min-width: 1.15em
  padding: 0 0.2em
  border: 1.5px solid var(--bc-ink)
  border-radius: 999px
  background: var(--bc-white)
  color: var(--bc-ink)
  font-size: 0.62em
  font-weight: 800
  line-height: 1.1
  text-align: center
  font-variant-numeric: tabular-nums
</style>
