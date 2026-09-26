<template lang="pug">
  div.controls-panel(:class="family")
    div.row(v-for="r in rows" :key="r.key" :data-row="r.key" role="img" :aria-label="r.aria ? t(r.aria) : undefined")
      div.input(:class="r.glyph.kind")
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
import { hud } from '@/game/state/hud'

/**
 * Every control at a glance, wordless: the input glyph (the same drawings the
 * coach uses in play, moving the same way) → the action's icon. Shown in the
 * pause menu for the input family in use. The sentences survive only as
 * screen-reader labels.
 */
const { t } = useI18n()

type GlyphProps = InstanceType<typeof InputGlyph>['$props']
interface Row { key: string; glyph: GlyphProps; action: GameIconName; aria?: string }

const family = computed(() => input.device)
const rows = computed<Row[]>(() => family.value === 'touch'
  ? [
      // The finger tracing an ∞, as in play: it gets a row of its own.
      { key: 'move', glyph: { kind: 'infinity' }, action: 'boots', aria: 'pause.touch.move' },
      { key: 'look', glyph: { kind: 'finger', mode: 'drag' }, action: 'replay', aria: 'pause.touch.look' },
      { key: 'fire', glyph: { kind: 'finger', mode: 'tap' }, action: 'buster', aria: 'pause.touch.fire' },
      { key: 'charge', glyph: { kind: 'finger', mode: 'hold' }, action: 'bolt', aria: 'pause.touch.fire' },
      // The two thumb buttons: HOLD the shield, TAP the slide.
      { key: 'block', glyph: { kind: 'finger', mode: 'hold' }, action: 'shield', aria: 'pause.touch.block' },
      { key: 'slide', glyph: { kind: 'finger', mode: 'tap' }, action: 'forward', aria: 'tips.red' }
    ]
  : [
      { key: 'move', glyph: { kind: 'wasd' }, action: 'boots', aria: 'pause.keys.move' },
      {
        key: 'look',
        glyph: hud.lookMode === 'lock' ? { kind: 'mouse', button: 'none', move: true } : { kind: 'mouse', button: 'left', drag: true },
        action: 'replay',
        aria: 'pause.keys.look'
      },
      { key: 'fire', glyph: { kind: 'mouse', button: 'left', click: true }, action: 'buster', aria: 'pause.keys.fire' },
      { key: 'charge', glyph: { kind: 'mouse', button: 'left', hold: true }, action: 'bolt', aria: 'pause.keys.fire' },
      { key: 'block', glyph: { kind: 'mouse', button: 'right' }, action: 'shield', aria: 'pause.keys.block' },
      { key: 'slide', glyph: { kind: 'key', wide: true }, action: 'forward', aria: 'pause.keys.slide' },
      { key: 'tank', glyph: { kind: 'key', code: 'KeyH' }, action: 'flask', aria: 'pause.keys.slide' },
      { key: 'use', glyph: { kind: 'key', code: 'KeyE' }, action: 'chest', aria: 'pause.keys.slide' },
      { key: 'beam', glyph: { kind: 'key', code: 'KeyB' }, action: 'up', aria: 'pause.keys.slide' },
      { key: 'weapon', glyph: { kind: 'key', code: 'Digit1' }, action: 'star', aria: 'pause.keys.more' }
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
  // Room above the glyph: a hold's timer tick stands over the fingertip.
  padding: 10px 8px 6px
  border-radius: 12px
  background: rgba(0, 0, 0, 0.25)
// The ∞ is wide: on a phone held upright it takes the whole first row,
// otherwise two cells.
.touch .row[data-row="move"]
  grid-column: 1 / -1
@media (min-aspect-ratio: 1/1)
  .touch .row[data-row="move"]
    grid-column: span 2
.input
  flex: 0 0 auto
  width: clamp(56px, 12vmin, 76px)
  height: clamp(46px, 10vmin, 62px)
  &.infinity
    width: clamp(100px, 26vmin, 132px)
    height: auto
    aspect-ratio: 265 / 184
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
