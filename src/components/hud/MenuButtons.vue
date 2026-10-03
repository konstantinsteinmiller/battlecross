<template lang="pug">
  div.menu-buttons
    //- Each button arrives when it first matters (`coach/reveal.ts`): it pops
    //- in, and glows softly until it is used. A returning player has them all.
    Transition(name="reveal")
      span.menu-buttons__item(v-if="map && revealed('map')" data-coach="menu-map" :class="{ 'is-glow': glowing('map') }")
        FHudButton(tone="gold" icon="map" :aria-label="t('menu.map')" @click="open('map')")
    Transition(name="reveal")
      span.menu-buttons__item(v-if="revealed('hero')" data-coach="menu-character" :class="{ 'is-glow': glowing('hero') }")
        FHudButton(tone="blue" icon="hero" :attention="profile.hero.points > 0" :aria-label="t('menu.character')" @click="open('character')")
          template(v-if="profile.hero.points > 0" #badge)
            FHudBadge(tone="red") {{ profile.hero.points }}
    Transition(name="reveal")
      span.menu-buttons__item(v-if="revealed('skills')" data-coach="menu-skills" :class="{ 'is-glow': glowing('skills') }")
        FHudButton(tone="blue" icon="book" :aria-label="t('menu.skills')" @click="open('skills')")
    Transition(name="reveal")
      span.menu-buttons__item(v-if="revealed('bag')" data-coach="menu-inventory" :class="{ 'is-glow': glowing('bag') }")
        FHudButton(tone="blue" icon="bag" :aria-label="t('menu.inventory')" @click="open('inventory')")
          template(v-if="profile.inv.fresh.length > 0" #badge)
            FHudBadge(tone="green") {{ profile.inv.fresh.length }}
    LeaderboardButton(v-if="board")
</template>

<script setup lang="ts">
/**
 * The hero's menus as one feature: map, character sheet, skills, bag. Used by
 * the town HUD and the world map, so the badges ("points to spend", "new
 * items") are one piece of logic.
 *
 * A new player's HUD fills up as the game needs it (roadmap #52): the map
 * button on reaching a town, the sheet at the first level, the bag with the
 * first find, the skills with the second skill. The pop and the glow belong
 * to the wrapper, never to the button: the lessons point at the wrapper
 * (`data-coach`), and a lesson's own ring is drawn over it, not on it.
 */
import { useI18n } from 'vue-i18n'
import FHudButton from '@/components/atoms/FHudButton.vue'
import FHudBadge from '@/components/atoms/FHudBadge.vue'
import LeaderboardButton from '@/components/game/LeaderboardButton.vue'
import { flow, openMap } from '@/game/flow'
import { profile } from '@/game/state/profile'
import { glowing, revealed } from '@/game/coach/reveal'

withDefaults(defineProps<{
  /** The world-map button (a town has it; the map itself does not). */
  map?: boolean
  /** The leaderboard button (the map has the room for it). */
  board?: boolean
}>(), { map: false, board: false })
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
.menu-buttons__item
  position: relative
  display: block
  pointer-events: none
  border-radius: 28%
// New and never used: a soft gold glow breathes round it.
.menu-buttons__item.is-glow::before
  content: ''
  position: absolute
  inset: -0.3rem
  border-radius: inherit
  background: radial-gradient(circle, rgba(255, 216, 74, 0.55) 0, rgba(255, 216, 74, 0) 70%)
  animation: reveal-glow 1.8s ease-in-out infinite
  pointer-events: none
// It arrives: a pop from nothing with a little overshoot, and a ring of light.
.reveal-enter-active
  animation: reveal-pop 620ms cubic-bezier(0.34, 1.56, 0.64, 1) both
  &::after
    content: ''
    position: absolute
    inset: -0.2rem
    border-radius: 50%
    border: 4px solid var(--bc-gold-hi)
    animation: reveal-ring 620ms ease-out both
    pointer-events: none
.reveal-leave-active
  transition: opacity 160ms ease-in
.reveal-leave-to
  opacity: 0
@keyframes reveal-pop
  0%
    transform: scale(0)
    opacity: 0
  55%
    transform: scale(1.25)
    opacity: 1
  100%
    transform: scale(1)
@keyframes reveal-ring
  0%
    transform: scale(0.6)
    opacity: 1
  100%
    transform: scale(1.9)
    opacity: 0
@keyframes reveal-glow
  0%, 100%
    opacity: 0.45
    transform: scale(0.95)
  50%
    opacity: 1
    transform: scale(1.12)
@media (prefers-reduced-motion: reduce)
  .reveal-enter-active, .reveal-enter-active::after, .menu-buttons__item.is-glow::before
    animation: none
</style>
