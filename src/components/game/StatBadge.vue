<template lang="pug">
  span.stat-badge(
    v-if="skill"
    :class="{ 'is-long': long }"
    :style="{ '--attr': ATTR_COLOR[skill.scales] }"
    :data-scales="skill.scales"
    :title="t('skill.scales', { attr: t(`attr.${skill.scales}.name`) })"
  ) {{ long ? t('skill.scales', { attr: t(`attr.${skill.scales}.name`) }) : t(`attr.${skill.scales}.short`) }}
</template>

<script setup lang="ts">
/**
 * The attribute a skill's damage or effect grows with (roadmap #96): a chip in
 * that attribute's colour, short ("STR") on an icon, spelled out on the card.
 * A build is planned by it, so it is on every skill the hero looks at.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SKILL_BY_ID } from '@/game/data/skills'
import { ATTR_COLOR } from '@/game/data/attributes'

const props = withDefaults(defineProps<{ id: string; long?: boolean }>(), { long: false })
const { t } = useI18n()
const skill = computed(() => SKILL_BY_ID[props.id])
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.stat-badge
  display: inline-block
  padding: 0.08em 0.4em
  border: 2px solid var(--bc-ink)
  border-radius: 999px
  background: var(--attr)
  color: var(--bc-ink)
  +cel.label
  font-size: clamp(0.56rem, 2.2vmin, 0.7rem)
  line-height: 1.15
  white-space: nowrap
  pointer-events: none
  &.is-long
    font-size: clamp(0.66rem, 2.6vmin, 0.82rem)
    padding: 0.12em 0.6em
</style>
