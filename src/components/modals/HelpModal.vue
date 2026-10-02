<template lang="pug">
  FModal(:model-value="true" :title="t('pause.controls')" surface="parchment" tone="blue" @update:model-value="closeModal")
    ul.help
      li.help__row(v-for="r in rows" :key="r.id")
        span.help__glyph
          InputGlyph(v-bind="r.glyph")
        span.help__text {{ t(`coach.${r.id}.${family}`) }}
    ul.help__keys(v-if="family === 'mouse'")
      li(v-for="k in keys" :key="k.action")
        KeyCap(:code="k.code")
        span {{ t(`options.actions.${k.action}`) }}
</template>

<script setup lang="ts">
/** Every control on one page: the same glyphs the coach teaches with, each
 *  with its sentence. Opening it also brings the lessons back on screen. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { closeModal } from '@/game/flow'
import { DEFAULT_BINDINGS, type Action } from '@/game/engine/keyBindings'
import FModal from '@/components/molecules/FModal.vue'
import InputGlyph from '@/components/glyphs/InputGlyph.vue'
import KeyCap from '@/components/glyphs/KeyCap.vue'

const { t } = useI18n()
const family = computed(() => hud.device)

const rows = computed(() => {
  const touch = family.value === 'touch'
  return [
    { id: 'move', glyph: touch ? { kind: 'infinity' } : { kind: 'wasd' } },
    { id: 'target', glyph: touch ? { kind: 'finger', mode: 'tap' } : { kind: 'mouse', button: 'left', click: true } },
    { id: 'skill', glyph: touch ? { kind: 'finger', mode: 'tap' } : { kind: 'key', code: DEFAULT_BINDINGS.skill1[0] } },
    { id: 'aim', glyph: touch ? { kind: 'finger', mode: 'hold' } : { kind: 'mouse', button: 'left', hold: true } },
    { id: 'potion', glyph: touch ? { kind: 'finger', mode: 'tap' } : { kind: 'key', code: DEFAULT_BINDINGS.potion[0] } }
  ]
})

const KEY_ACTIONS: Action[] = ['target', 'interact', 'map', 'character', 'skills', 'inventory']
const keys = KEY_ACTIONS.map(action => ({ action, code: DEFAULT_BINDINGS[action][0]! }))
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.help
  margin: 0
  padding: 0
  list-style: none
  display: flex
  flex-direction: column
  gap: clamp(0.4rem, 1.8vmin, 0.6rem)
  color: var(--bc-on)
.help__row
  display: grid
  grid-template-columns: clamp(3.4rem, 15vmin, 4.6rem) minmax(0, 1fr)
  align-items: center
  gap: 0.7rem
  padding: 0.35rem 0.6rem
  +cel.cell(var(--bc-r-md))
// The control glyphs are drawn white-on-dark: each gets a dark plate.
.help__glyph
  height: clamp(2.6rem, 11vmin, 3.4rem)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: var(--bc-slate)
  color: var(--bc-text)
.help__text
  font-size: clamp(0.78rem, 3.2vmin, 0.98rem)
  line-height: 1.3
  text-align: start
.help__keys
  margin: 0.6rem 0 0
  padding: 0
  list-style: none
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(min(46%, 9rem), 1fr))
  gap: 0.35rem
  font-size: clamp(0.74rem, 3vmin, 0.92rem)
  li
    display: flex
    align-items: center
    gap: 0.5em
    color: var(--bc-ink)
    span
      color: var(--bc-on-soft)
</style>
