<template lang="pug">
  div.backdrop(aria-hidden="true")
    img.backdrop__art(v-if="painted" :src="painted" alt="" draggable="false")
    div.backdrop__art.backdrop__art--drawn(v-else v-html="drawn")
    //- Whatever the art is, the interface in the middle must read on it.
    span.backdrop__veil
</template>

<script setup lang="ts">
/**
 * What lies behind a big screen: the drawn backdrop (`backdrops.ts`), or the
 * painted file `public/images/ui/bg-<name>.webp` once it exists. Shown
 * `cover`: the middle of the sheet is always in view, its sides only on a
 * wide screen.
 */
import { computed } from 'vue'
import { UI_ART } from '@/game/assets/overrides'
import { backdropSvg, type BackdropName } from './backdrops'

const props = defineProps<{ name: BackdropName }>()
const painted = computed(() => UI_ART.get(`bg-${props.name}`) ?? '')
const drawn = computed(() => (painted.value ? '' : backdropSvg(props.name)))
</script>

<style scoped lang="sass">
.backdrop
  position: absolute
  inset: 0
  overflow: hidden
  background: var(--bc-page)
  pointer-events: none
  user-select: none
.backdrop__art
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  object-fit: cover
  -webkit-user-drag: none
.backdrop__art--drawn :deep(svg)
  display: block
  width: 100%
  height: 100%
// A hard-stepped shade toward the edges: it frames the page without a blur.
.backdrop__veil
  position: absolute
  inset: 0
  background: radial-gradient(ellipse at 50% 46%, transparent 0, transparent 58%, rgba(var(--bc-ink-rgb), 0.16) 58%, rgba(var(--bc-ink-rgb), 0.16) 80%, rgba(var(--bc-ink-rgb), 0.3) 80%)
</style>
