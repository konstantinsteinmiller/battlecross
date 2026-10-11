<script setup lang="ts">
import { computed } from 'vue'
import { ITEM_BY_ID, TIER_COLOR, itemIcon, itemName } from '../data'
import { showTip, moveTip, hoverTip, leaveTip } from '../tip'

const props = withDefaults(defineProps<{ id: string; size?: number }>(), { size: 52 })
const it = computed(() => ITEM_BY_ID[props.id])
</script>

<template>
  <span v-if="it" class="item" :class="'t' + it.tier" :style="{ '--c': TIER_COLOR[it.tier], '--s': size + 'px' }"
    @pointerenter="hoverTip('item', id, $event)" @click="showTip('item', id, $event)" @mousemove="moveTip" @pointerleave="leaveTip">
    <img :src="itemIcon(it)" :alt="itemName(it)" loading="lazy" />
  </span>
</template>

<style scoped>
.item {
  width: var(--s); height: var(--s); border-radius: 10px; display: inline-grid; place-items: center; cursor: help; vertical-align: middle;
  background: radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--c) 30%, #1e1830), #100c18 75%);
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--c) 70%, transparent), 0 0 12px color-mix(in srgb, var(--c) 25%, transparent);
  transition: transform .12s;
  flex: none;
}
.item:hover { transform: scale(1.07); }
.item img { width: 86%; height: 86%; object-fit: contain; filter: drop-shadow(0 3px 3px rgba(0,0,0,.6)); }
.t6 { animation: legend 2.4s ease-in-out infinite; }
@keyframes legend { 50% { box-shadow: inset 0 0 0 2px var(--c), 0 0 22px color-mix(in srgb, var(--c) 60%, transparent); } }
</style>
