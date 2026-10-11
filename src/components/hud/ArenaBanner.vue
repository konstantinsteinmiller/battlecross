<template lang="pug">
  div.arena-banner(aria-live="polite")
    Transition(name="arena-banner")
      div.arena-banner__card(v-if="shown" :key="shown.id" :class="`is-${shown.kind}`")
        template(v-if="shown.kind === 'wave'")
          p.arena-banner__big {{ t('arena.wave', { n: shown.n }) }}
          p.arena-banner__sub(v-if="shown.champion") {{ t('arena.champion') }}
          p.arena-banner__next(v-if="shown.item")
            span.arena-banner__icon
              ItemIcon(:id="shown.item")
            | {{ t('arena.next', { at: shown.at, item: t(`item.${shown.item}.name`) }) }}
        template(v-else)
          p.arena-banner__big {{ t('arena.milestone', { n: shown.n }) }}
          p.arena-banner__prize(v-if="shown.kind === 'prize'")
            span.arena-banner__icon.is-big
              ItemIcon(:id="shown.item")
            | {{ t('arena.prize', { item: t(`item.${shown.item}.name`) }) }}
</template>

<script setup lang="ts">
/**
 * ─── The colosseum's announcement (roadmap #117) ────────────────────────────
 *
 * A wave's number, big over the sand, and the next prize the ladder holds;
 * at a milestone, the mythic piece that has just been won. Shown for a few
 * seconds each time `hud.arenaBanner` changes.
 */
import { onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import ItemIcon from '@/components/art/ItemIcon.vue'

const { t } = useI18n()
const shown = ref<typeof hud.arenaBanner>(null)
let timer: ReturnType<typeof setTimeout> | null = null

watch(() => hud.arenaBanner?.id, () => {
  const b = hud.arenaBanner
  if (!b) return
  shown.value = { ...b }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { shown.value = null }, b.kind === 'wave' ? 2600 : 4200)
})
onUnmounted(() => { if (timer) clearTimeout(timer) })
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.arena-banner
  position: absolute
  inset: 0
  display: flex
  justify-content: center
  align-items: flex-start
  padding-top: 60vh
  pointer-events: none
.arena-banner__card
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.25em
  text-align: center
.arena-banner__big
  margin: 0
  +cel.label
  color: var(--bc-gold-hi)
  font-size: clamp(2rem, 9vmin, 4.2rem)
  line-height: 1
  text-shadow: var(--bc-text-outline)
.is-prize .arena-banner__big, .is-milestone .arena-banner__big
  color: var(--bc-red)
.arena-banner__sub
  margin: 0
  +cel.label
  color: var(--bc-orange)
  font-size: clamp(0.9rem, 3.6vmin, 1.4rem)
  text-shadow: var(--bc-text-outline)
.arena-banner__next, .arena-banner__prize
  display: inline-flex
  align-items: center
  gap: 0.4em
  margin: 0.2em 0 0
  padding: 0.25em 0.8em
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: var(--bc-paper)
  color: var(--bc-ink)
  font-size: clamp(0.72rem, 2.9vmin, 1rem)
.arena-banner__prize
  font-size: clamp(0.9rem, 3.6vmin, 1.25rem)
.arena-banner__icon
  display: block
  width: 1.6em
  height: 1.6em
  &.is-big
    width: 2.4em
    height: 2.4em

.arena-banner-enter-active
  animation: arena-banner-in 420ms var(--bc-ease-pop) both
.arena-banner-leave-active
  transition: opacity 300ms ease
.arena-banner-leave-to
  opacity: 0
@keyframes arena-banner-in
  from
    opacity: 0
    transform: scale(1.6)
@media (prefers-reduced-motion: reduce)
  .arena-banner-enter-active
    animation: none
</style>
