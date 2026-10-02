<template lang="pug">
  ArtIcon(:glyph="`skill.${id}`" :tint="skill ? skill.color : '#7fd8ff'" :src="src" :frame="skill && skill.kind === 'passive' ? 'round' : 'chip'" :dim="dim")
</template>

<script setup lang="ts">
/** A skill's icon in its class colour (round for a passive), or the painted
 *  file `public/images/skills/<id>.webp` when one exists. */
import { computed } from 'vue'
import ArtIcon from './ArtIcon.vue'
import { SKILL_BY_ID } from '@/game/data/skills'
import { SKILL_ART } from '@/game/assets/overrides'

const props = withDefaults(defineProps<{ id: string; dim?: boolean }>(), { dim: false })
const skill = computed(() => SKILL_BY_ID[props.id])
const src = computed(() => SKILL_ART.get(props.id) ?? '')
</script>
