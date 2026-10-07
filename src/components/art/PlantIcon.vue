<template lang="pug">
  svg.plant-icon(viewBox="0 0 48 48" aria-hidden="true" focusable="false")
    g(stroke="#1b1626" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round")
      //- Sunpetal: a sun of petals on a stem.
      template(v-if="id === 'sunpetal'")
        path(d="M24 44 V26" fill="none" :stroke="leaf" stroke-width="4")
        path(d="M24 44 V26" fill="none")
        ellipse(cx="15" cy="38" rx="7" ry="3.5" :fill="leaf" transform="rotate(-25 15 38)")
        ellipse(cx="33" cy="38" rx="7" ry="3.5" :fill="leaf" transform="rotate(25 33 38)")
        ellipse(v-for="a in [0, 45, 90, 135, 180, 225, 270, 315]" :key="a" cx="24" cy="10" rx="4.2" ry="7" :fill="bloom" :transform="`rotate(${a} 24 18)`")
        circle(cx="24" cy="18" r="5.5" fill="#c8761a")
      //- Glowcap: three glowing caps.
      template(v-else-if="id === 'glowcap'")
        path(d="M14 44 V30 M30 44 V24 M38 44 V34" fill="none" :stroke="leaf" stroke-width="5")
        path(d="M5 31 Q14 16 23 31 Z" :fill="bloom")
        path(d="M18 25 Q30 6 42 25 Z" :fill="bloom")
        path(d="M31 35 Q38 26 45 35 Z" :fill="bloom")
        circle(cx="27" cy="17" r="2.4" fill="#e8ffff" stroke="none")
        circle(cx="34" cy="20" r="1.8" fill="#e8ffff" stroke="none")
        circle(cx="12" cy="26" r="1.8" fill="#e8ffff" stroke="none")
      //- Swiftfern: a fan of fronds.
      template(v-else-if="id === 'swiftfern'")
        path(v-for="a in [-50, -25, 0, 25, 50]" :key="a" d="M24 44 Q22 24 24 6" fill="none" :stroke="a % 50 ? bloom : leaf" stroke-width="5" :transform="`rotate(${a} 24 44)`")
        path(v-for="a in [-50, -25, 0, 25, 50]" :key="`o${a}`" d="M24 44 Q22 24 24 6" fill="none" stroke-width="1.2" :transform="`rotate(${a} 24 44)`")
      //- Ironmoss: moss on a stone.
      template(v-else-if="id === 'ironmoss'")
        path(d="M6 42 Q4 28 16 24 Q30 18 40 26 Q46 34 42 42 Z" fill="#8a8e94")
        path(d="M10 28 Q16 16 26 20 Q36 14 40 26 Q30 22 22 28 Q16 26 10 28 Z" :fill="leaf")
        circle(cx="18" cy="16" r="3" :fill="bloom")
        circle(cx="30" cy="12" r="3" :fill="bloom")
      //- Emberbloom: a flame of petals.
      template(v-else-if="id === 'emberbloom'")
        path(d="M24 44 V30" fill="none" :stroke="leaf" stroke-width="4")
        path(d="M24 4 Q34 14 32 24 Q30 32 24 32 Q18 32 16 24 Q14 14 24 4 Z" :fill="bloom")
        path(d="M24 12 Q29 19 28 25 Q26 29 24 29 Q22 29 20 25 Q19 19 24 12 Z" fill="#ffd23a")
        circle(cx="24" cy="25" r="2.6" fill="#fff4b0" stroke="none")
      //- Frostmint: frosted leaves.
      template(v-else-if="id === 'frostmint'")
        ellipse(cx="16" cy="32" rx="9" ry="6" :fill="leaf" transform="rotate(-30 16 32)")
        ellipse(cx="32" cy="32" rx="9" ry="6" :fill="leaf" transform="rotate(30 32 32)")
        ellipse(cx="24" cy="20" rx="7" ry="10" :fill="bloom")
        path(d="M24 4 V12 M18 8 L24 12 L30 8" fill="none" stroke="#f0faff" stroke-width="2.4")
      //- Moonbell: bells hanging from a bowed stem.
      template(v-else-if="id === 'moonbell'")
        path(d="M10 44 Q8 10 30 8 Q40 8 40 18" fill="none" :stroke="leaf" stroke-width="4")
        path(d="M10 44 Q8 10 30 8 Q40 8 40 18" fill="none" stroke-width="1.2")
        path(d="M34 18 Q40 14 46 18 L46 26 Q40 30 34 26 Z" :fill="bloom")
        path(d="M18 16 Q23 12 28 16 L28 23 Q23 26 18 23 Z" :fill="bloom")
        circle(cx="40" cy="28" r="1.8" fill="#f4ecff" stroke="none")
      //- Shadowthorn: a dark thorn bush and its bud.
      template(v-else)
        path(d="M8 44 L16 20 L20 36 L24 8 L28 36 L32 20 L40 44 Z" :fill="leaf")
        ellipse(cx="24" cy="24" rx="5" ry="7" :fill="bloom")
        circle(cx="24" cy="21" r="2" fill="#e8a8ff" stroke="none")
</template>

<script setup lang="ts">
/**
 * A herb's icon (roadmap #88), drawn in code until the art pipeline paints it:
 * the same silhouette and colours as the herb in the world, so the toast, the
 * pouch and the plant on the ground are recognisably one thing.
 */
import { computed } from 'vue'
import { PLANT_BY_ID, type PlantId } from '@/game/data/plants'

const props = defineProps<{ id: PlantId | string }>()
const bloom = computed(() => PLANT_BY_ID[props.id as PlantId]?.bloom ?? '#ffffff')
const leaf = computed(() => PLANT_BY_ID[props.id as PlantId]?.leaf ?? '#4fae4a')
</script>

<style scoped lang="sass">
.plant-icon
  display: block
  width: 100%
  height: 100%
  overflow: visible
</style>
