<template lang="pug">
  ArtIcon(:class="{ 'is-capstone': !!capstone }" :glyph="`skill.${capstone || id}`" :tint="skill ? skill.color : '#7fd8ff'" :src="src" :frame="skill && skill.kind === 'passive' ? 'round' : 'chip'" :dim="dim")
</template>

<script setup lang="ts">
/** A skill's icon in its class colour (round for a passive), or the painted
 *  file `public/images/skills/<id>.webp` when one exists. A capstone (afterplay
 *  §2.3) has no drawing of its own yet: its signature skill's, in a gold ring. */
import { computed } from 'vue'
import ArtIcon from './ArtIcon.vue'
import { SKILL_BY_ID } from '@/game/data/skills'
import { SKILL_ART } from '@/game/assets/overrides'

const props = withDefaults(defineProps<{
  id: string
  dim?: boolean
  /** Dev benches: the vector drawing even when a painted file exists. */
  drawn?: boolean
}>(), { dim: false, drawn: false })
const skill = computed(() => SKILL_BY_ID[props.id])
const capstone = computed(() => skill.value?.capstone ?? '')
const src = computed(() => (props.drawn ? '' : SKILL_ART.get(props.id) ?? SKILL_ART.get(capstone.value) ?? ''))
</script>

<style scoped lang="sass">
.is-capstone
  border-radius: 24%
  box-shadow: 0 0 0 0.12em var(--bc-gold), 0 0 0.5em 0.05em color-mix(in srgb, var(--bc-gold) 70%, transparent)
</style>
