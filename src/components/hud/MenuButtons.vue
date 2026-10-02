<template lang="pug">
  div.menu-buttons
    FHudButton(v-if="map" tone="gold" icon="map" :aria-label="t('menu.map')" @click="open('map')")
    FHudButton(tone="blue" icon="hero" :attention="profile.hero.points > 0" :aria-label="t('menu.character')" @click="open('character')")
      template(v-if="profile.hero.points > 0" #badge)
        FHudBadge(tone="red") {{ profile.hero.points }}
    FHudButton(tone="blue" icon="book" :aria-label="t('menu.skills')" @click="open('skills')")
    FHudButton(tone="blue" icon="bag" :aria-label="t('menu.inventory')" @click="open('inventory')")
      template(v-if="profile.inv.fresh.length > 0" #badge)
        FHudBadge(tone="green") {{ profile.inv.fresh.length }}
</template>

<script setup lang="ts">
/**
 * The hero's menus as one feature: map, character sheet, skills, bag. Used by
 * the town HUD and the world map, so the badges ("points to spend", "new
 * items") are one piece of logic.
 */
import { useI18n } from 'vue-i18n'
import FHudButton from '@/components/atoms/FHudButton.vue'
import FHudBadge from '@/components/atoms/FHudBadge.vue'
import { flow, openMap } from '@/game/flow'
import { profile } from '@/game/state/profile'

withDefaults(defineProps<{ map?: boolean }>(), { map: false })
const { t } = useI18n()

const open = (panel: 'map' | 'character' | 'skills' | 'inventory'): void => {
  if (flow.loading) return
  if (panel === 'map') openMap()
  else flow.modal = panel
}
</script>

<style scoped lang="sass">
.menu-buttons
  display: flex
  align-items: center
  gap: clamp(0.35rem, 1.6vmin, 0.7rem)
  pointer-events: none
  :deep(.f-hud-button)
    width: clamp(2.9rem, 13vmin, 4rem)
    height: clamp(2.9rem, 13vmin, 4rem)
</style>
