<template lang="pug">
  //- The rested pool on the map (roadmap #9): a chip while it lasts, and once
  //- per return a note saying what the time away brought.
  span.rested-chip(v-if="pool >= 60" data-rested)
    span.rested-chip__x {{ t('rested.hud') }}
    span.rested-chip__time {{ clock(pool) }}
  Transition(name="rested-note")
    button.rested-note(v-if="note" type="button" data-rested-note @click="dismiss")
      | {{ t('rested.banner', { time: clock(gained) }) }}
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { profile, restedGain } from '@/game/state/profile'
import { restedClock } from '@/game/rested'

const { t } = useI18n()
const pool = computed(() => profile.meta.rested)
const gained = computed(() => restedGain.value)
const note = computed(() => restedGain.value >= 60)
const clock = (s: number): string => {
  const c = restedClock(s)
  return c.h > 0 ? (c.m > 0 ? t('rested.hm', { h: c.h, m: c.m }) : t('rested.h', { h: c.h })) : t('rested.m', { m: c.m })
}
let timer = 0
const dismiss = (): void => {
  clearTimeout(timer)
  restedGain.value = 0
}
// Said once: it fades by itself, and leaving the map counts as read.
watch(note, (on) => { clearTimeout(timer); if (on) timer = window.setTimeout(dismiss, 8000) }, { immediate: true })
onUnmounted(() => { if (note.value) dismiss() })
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.rested-chip
  display: inline-flex
  align-items: center
  gap: 0.3em
  font-size: 0.85em
.rested-chip__x
  padding: 0 0.35em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: var(--bc-purple)
  color: var(--bc-text)
  +cel.label
.rested-chip__time
  color: var(--bc-text)
.rested-note
  position: absolute
  inset-inline: 0
  top: calc(100% + 0.4rem)
  z-index: 3
  margin-inline: auto
  width: max-content
  max-width: min(26rem, calc(100vw - 2rem))
  padding: 0.45rem 0.9rem
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-lg)
  background: var(--bc-paper-hi)
  color: var(--bc-ink)
  box-shadow: var(--bc-drop)
  font: inherit
  font-size: clamp(0.78rem, 3.2vmin, 1rem)
  line-height: 1.25
  text-align: center
  cursor: pointer
.rested-note-enter-active, .rested-note-leave-active
  transition: opacity 260ms, transform 260ms var(--bc-ease-pop)
.rested-note-enter-from, .rested-note-leave-to
  opacity: 0
  transform: translateY(-0.6rem)
@media (prefers-reduced-motion: reduce)
  .rested-note-enter-active, .rested-note-leave-active
    transition: none
</style>
