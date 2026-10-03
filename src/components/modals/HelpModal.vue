<template lang="pug">
  FModal(:model-value="true" :title="t('pause.controls')" surface="parchment" tone="blue" @update:model-value="closeModal")
    //- Wordless: each taught thing as its gesture → what it does. The
    //- sentence is the tile's label. The place the player is in comes first.
    section.help__group(v-for="g in groups" :key="g.id" :class="{ 'is-here': g.here }")
      span.help__mark(aria-hidden="true")
        GameIcon(:name="g.icon")
      ul.help
        li.help__row(v-for="r in g.rows" :key="r.id" role="img" :aria-label="t(`coach.${r.id}.${family}`)")
          span.help__glyph(aria-hidden="true")
            InputGlyph(v-bind="r.glyph")
          span.help__arrow(aria-hidden="true")
            GameIcon(name="right")
          span.help__does(aria-hidden="true" :class="r.tone ? `is-${r.tone}` : ''")
            GameIcon(:name="r.icon")
    ul.help__keys(v-if="family === 'mouse'")
      li(v-for="k in keys" :key="k.action")
        KeyCap(:code="k.code")
        span {{ t(`options.actions.${k.action}`) }}
</template>

<script setup lang="ts">
/** Every control and every feature the game teaches, on one page, as the
 *  same glyphs the lessons use: gesture → what it does, no words (each tile's
 *  sentence is its label). The fight's controls, the town's talking, trading
 *  and learning, and the map — the ones of the place the player is in first.
 *  Opening it (the "?" button, F1) also brings those lessons back on screen. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { closeModal, flow } from '@/game/flow'
import { DEFAULT_BINDINGS, type Action } from '@/game/engine/keyBindings'
import type { GameIconName } from '@/components/icons/iconNames'
import FModal from '@/components/molecules/FModal.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import InputGlyph from '@/components/glyphs/InputGlyph.vue'
import KeyCap from '@/components/glyphs/KeyCap.vue'

const { t } = useI18n()
const family = computed(() => hud.device)

interface Row { id: string; glyph: Record<string, unknown>; icon: GameIconName; tone?: 'red' | 'blue' | 'gold' }
type GroupId = 'fight' | 'town' | 'map'

const groups = computed(() => {
  const touch = family.value === 'touch'
  const tap = touch ? { kind: 'finger', mode: 'tap' } : { kind: 'mouse', button: 'left', click: true }
  const drag = touch ? { kind: 'finger', mode: 'hold' } : { kind: 'mouse', button: 'left', hold: true }
  const key = (a: Action): Record<string, unknown> => (touch ? tap : { kind: 'key', code: DEFAULT_BINDINGS[a][0] })
  const all: Record<GroupId, Row[]> = {
    fight: [
      { id: 'move', glyph: touch ? { kind: 'infinity' } : { kind: 'wasd' }, icon: 'boots' },
      { id: 'target', glyph: tap, icon: 'sword' },
      { id: 'skill', glyph: key('skill1'), icon: 'bolt', tone: 'gold' },
      { id: 'aim', glyph: drag, icon: 'range', tone: 'gold' },
      { id: 'potion', glyph: key('potion'), icon: 'flask', tone: 'red' },
      { id: 'mana', glyph: key('manaPotion'), icon: 'flask', tone: 'blue' },
      { id: 'chest', glyph: tap, icon: 'chest', tone: 'gold' }
    ],
    town: [
      { id: 'talk', glyph: tap, icon: 'chat' },
      { id: 'teach', glyph: tap, icon: 'book', tone: 'blue' },
      { id: 'learn', glyph: tap, icon: 'star', tone: 'gold' },
      { id: 'slot', glyph: drag, icon: 'book', tone: 'gold' },
      { id: 'buy', glyph: tap, icon: 'coin', tone: 'gold' },
      { id: 'equip', glyph: drag, icon: 'armor' },
      { id: 'attr', glyph: tap, icon: 'plus', tone: 'red' },
      { id: 'exit', glyph: tap, icon: 'map' }
    ],
    map: [{ id: 'travel', glyph: tap, icon: 'map', tone: 'gold' }]
  }
  const here: GroupId = flow.screen === 'town' ? 'town' : flow.screen === 'map' ? 'map' : 'fight'
  const ICON: Record<GroupId, GameIconName> = { fight: 'sword', town: 'home', map: 'map' }
  const order: GroupId[] = [here, ...(['fight', 'town', 'map'] as GroupId[]).filter(g => g !== here)]
  return order.map(id => ({ id, here: id === here, icon: ICON[id], rows: all[id] }))
})

const KEY_ACTIONS: Action[] = ['target', 'interact', 'map', 'character', 'skills', 'inventory']
const keys = KEY_ACTIONS.map(action => ({ action, code: DEFAULT_BINDINGS[action][0]! }))
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.help__group
  position: relative
  display: grid
  grid-template-columns: clamp(2rem, 8vmin, 2.6rem) minmax(0, 1fr)
  gap: 0.5rem
  align-items: start
  & + &
    margin-top: 0.7rem
    padding-top: 0.7rem
    border-top: var(--bc-ol-thin) dashed rgba(var(--bc-ink-rgb), 0.35)
// Which part of the game the tiles are for: a fight, a town, the map.
.help__mark
  display: grid
  place-items: center
  aspect-ratio: 1
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-slate)
  color: var(--bc-text)
  :deep(svg)
    width: 62%
    height: 62%
.is-here .help__mark
  background: var(--bc-gold)
  color: var(--bc-ink)
.help
  margin: 0
  padding: 0
  list-style: none
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 8.6rem), 1fr))
  gap: clamp(0.35rem, 1.6vmin, 0.55rem)
.help__row
  display: grid
  grid-template-columns: minmax(0, 1.25fr) auto minmax(0, 0.8fr)
  align-items: center
  gap: 0.3rem
  padding: 0.3rem 0.45rem
  +cel.cell(var(--bc-r-md))
// The control glyphs are drawn white-on-dark: each gets a dark plate.
.help__glyph
  height: clamp(2.5rem, 10vmin, 3.2rem)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: var(--bc-slate)
  color: var(--bc-text)
.help__arrow
  width: clamp(0.9rem, 3.4vmin, 1.15rem)
  height: clamp(0.9rem, 3.4vmin, 1.15rem)
  color: var(--bc-on-soft)
  :deep(svg)
    width: 100%
    height: 100%
.help__does
  display: grid
  place-items: center
  justify-self: center
  width: clamp(2.1rem, 8.6vmin, 2.7rem)
  height: clamp(2.1rem, 8.6vmin, 2.7rem)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-slate)
  color: var(--bc-text)
  :deep(svg)
    width: 60%
    height: 60%
    filter: drop-shadow(0 2px 0 var(--bc-ink))
  &.is-red
    background: var(--bc-red)
  &.is-blue
    background: var(--bc-blue)
  &.is-gold
    background: var(--bc-gold)
    color: var(--bc-ink)
.help__keys
  margin: 0.8rem 0 0
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
