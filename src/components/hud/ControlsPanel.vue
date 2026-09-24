<template lang="pug">
  div.controls-panel(:class="family")
    div.row(v-for="r in rows" :key="r.key" role="img" :aria-label="r.aria ? t(r.aria) : undefined")
      div.input
        InputGlyph(v-bind="r.glyph")
      span.to(aria-hidden="true")
      div.action(aria-hidden="true")
        GameIcon(:name="r.action")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import InputGlyph from './InputGlyph.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import type { GameIconName } from '@/components/icons/iconNames'
import { input } from '@/game/boot'

/**
 * Every control at a glance, wordless: the input glyph (the same drawings the
 * coach uses in play) → the action's icon. Shown in the pause menu for the
 * input family in use. The sentences survive only as screen-reader labels.
 */
const { t } = useI18n()

type GlyphProps = InstanceType<typeof InputGlyph>['$props']
interface Row { key: string; glyph: GlyphProps; action: GameIconName; aria?: string }

const family = computed(() => input.device)
const rows = computed<Row[]>(() => family.value === 'touch'
  ? [
      { key: 'move', glyph: { kind: 'joystick' }, action: 'boots', aria: 'pause.touch.move' },
      { key: 'look', glyph: { kind: 'finger', mode: 'drag' }, action: 'replay', aria: 'pause.touch.look' },
      { key: 'fire', glyph: { kind: 'finger', mode: 'tap' }, action: 'buster', aria: 'pause.touch.fire' },
      { key: 'charge', glyph: { kind: 'finger', mode: 'hold' }, action: 'bolt', aria: 'pause.touch.fire' },
      // The two thumb buttons: HOLD the shield, TAP the slide.
      { key: 'block', glyph: { kind: 'finger', mode: 'hold' }, action: 'shield', aria: 'pause.touch.block' },
      { key: 'slide', glyph: { kind: 'finger', mode: 'tap' }, action: 'forward', aria: 'tips.red' }
    ]
  : [
      { key: 'move', glyph: { kind: 'wasd' }, action: 'boots', aria: 'pause.keys.move' },
      { key: 'look', glyph: { kind: 'mouse', button: 'left', drag: true }, action: 'replay', aria: 'pause.keys.look' },
      { key: 'fire', glyph: { kind: 'mouse', button: 'left', click: true }, action: 'buster', aria: 'pause.keys.fire' },
      { key: 'charge', glyph: { kind: 'mouse', button: 'left', hold: true }, action: 'bolt', aria: 'pause.keys.fire' },
      { key: 'block', glyph: { kind: 'mouse', button: 'right' }, action: 'shield', aria: 'pause.keys.block' },
      { key: 'slide', glyph: { kind: 'key', label: 'Q' }, action: 'forward', aria: 'pause.keys.slide' },
      { key: 'tank', glyph: { kind: 'key', label: 'H' }, action: 'flask', aria: 'pause.keys.more' },
      { key: 'use', glyph: { kind: 'key', label: 'E' }, action: 'chest', aria: 'pause.keys.more' },
      { key: 'weapon', glyph: { kind: 'key', label: '1' }, action: 'star', aria: 'pause.keys.more' }
    ])
</script>

<style scoped lang="sass">
.controls-panel
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(clamp(120px, 26vmin, 170px), 1fr))
  gap: clamp(6px, 1.4vmin, 12px)
.row
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  padding: 6px 8px
  border-radius: 12px
  background: rgba(0, 0, 0, 0.25)
.input
  width: clamp(48px, 10vmin, 64px)
  height: clamp(40px, 8vmin, 52px)
.to
  width: 14px
  height: 14px
  border-top: 4px solid #9fe6ff
  border-right: 4px solid #9fe6ff
  transform: rotate(45deg)
  flex: 0 0 auto
.action
  width: clamp(30px, 6.5vmin, 40px)
  height: clamp(30px, 6.5vmin, 40px)
  padding: 6px
  border-radius: 50%
  border: 3px solid #141a33
  background: radial-gradient(circle at 40% 30%, #9fe6ff, #3cc8ff 45%, #1f7fd0)
  color: #fff
  flex: 0 0 auto
</style>
