<template lang="pug">
  //- Two named builds (roadmap #14): the skill loadout and the gear, saved and
  //- put back on in one tap.
  section.presets(data-presets)
    h3.presets__cap {{ t('preset.title') }}
    div.presets__row
      div.preset(v-for="(p, i) in presets" :key="i" :data-preset="i")
        input.preset__name(
          :id="`preset-name-${i}`"
          type="text"
          :value="p ? p.name : ''"
          :placeholder="t('preset.name', { n: i + 1 })"
          :aria-label="t('preset.rename', { n: i + 1 })"
          :maxlength="PRESET_NAME_MAX"
          :disabled="!p"
          @change="rename(i, $event)"
          @keydown.stop
        )
        button.preset__btn.preset__btn--use(type="button" :aria-label="t('preset.load')" :title="t('preset.load')" :disabled="!p" @click="load(i)")
          GameIcon(name="play")
        button.preset__btn.preset__btn--save(type="button" :aria-label="t('preset.save')" :title="t('preset.save')" @click="save(i)")
          GameIcon(name="check")
    p.presets__note(v-if="note" aria-live="polite") {{ note }}
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PRESET_NAME_MAX, loadPreset, profile, renamePreset, savePreset } from '@/game/state/profile'
import { ITEM_BY_ID } from '@/game/data/items'
import { sfx } from '@/game/audio/sfx'
import GameIcon from '@/components/icons/GameIcon.vue'

const { t } = useI18n()
const presets = computed(() => profile.meta.presets)
const note = ref('')
const nameOf = (i: number): string => profile.meta.presets[i]?.name || t('preset.name', { n: i + 1 })

const save = (i: number): void => {
  savePreset(i)
  sfx('uiEquip')
  note.value = t('preset.saved', { name: nameOf(i) })
}
const load = (i: number): void => {
  const skipped = loadPreset(i)
  if (!skipped) return
  sfx('uiEquip')
  note.value = skipped.length
    ? t('preset.skipped', { list: skipped.map(id => t(ITEM_BY_ID[id] ? `item.${id}.name` : `skill.${id}.name`)).join(', ') })
    : t('preset.loaded', { name: nameOf(i) })
}
const rename = (i: number, e: Event): void => {
  renamePreset(i, (e.target as HTMLInputElement).value)
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.presets
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.3rem
  width: 100%
.presets__cap
  margin: 0
  +cel.label
  font-size: clamp(0.72rem, 2.9vmin, 0.92rem)
  color: var(--bc-text)
.presets__row
  display: flex
  flex-direction: column
  gap: 0.3rem
  width: min(100%, 11.5rem)
.preset
  display: flex
  align-items: center
  gap: 0.3rem
.preset__name
  flex: 1 1 auto
  width: 0
  min-width: 0
  padding: 0.25em 0.5em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: var(--bc-paper-hi)
  color: var(--bc-ink)
  font: inherit
  font-size: clamp(0.72rem, 2.9vmin, 0.9rem)
  &:disabled
    opacity: 0.6
  &:focus-visible
    outline: 2px solid var(--bc-gold)
    outline-offset: 1px
.preset__btn
  +cel.tone('green')
  flex: 0 0 auto
  display: grid
  place-items: center
  width: clamp(1.7rem, 7vmin, 2.1rem)
  height: clamp(1.7rem, 7vmin, 2.1rem)
  padding: 0.3rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  +cel.fill(46%, 90%)
  box-shadow: 0 var(--bc-press-sm) 0 var(--bc-ink)
  color: var(--bc-text)
  cursor: pointer
  :deep(svg)
    display: block
    width: 100%
    height: 100%
  &:active:not(:disabled)
    transform: translateY(var(--bc-press-sm))
    box-shadow: none
  &:disabled
    filter: grayscale(1)
    opacity: 0.55
    cursor: default
  &:focus-visible
    outline: 2px solid var(--bc-gold)
    outline-offset: 1px
.preset__btn--use
  +cel.tone('blue')
.presets__note
  margin: 0
  color: var(--bc-text-soft)
  font-size: clamp(0.66rem, 2.6vmin, 0.84rem)
  text-align: center
</style>
