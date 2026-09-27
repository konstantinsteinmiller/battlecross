<template lang="pug">
  Transition(name="tf")
    div.target(v-if="hud.targetName" :class="{ elite: hud.targetElite, lost: hud.targetHidden }")
      div.row
        span.lv {{ t('enemy.level', { n: hud.targetLevel }) }}
        span.name
          template(v-if="hud.targetElite") {{ t('enemy.elite') }}&nbsp;
          | {{ t(hud.targetName) }}
      div.cells(aria-hidden="true")
        span.cell(v-for="i in CELLS" :key="i" :class="{ on: i <= lit, last: nearlyDown && i === lit }")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'

/**
 * The locked target's name, level and energy, top-centre (Blades-style). The
 * energy is a chunky Mega Man cell bar: 20 discrete cells, rounded UP so a
 * machine with any HP left keeps a lit cell (the GDD's bar rule). When it is
 * nearly down the last lit cell blinks: one more hit. Elites wear gold trim.
 * A target out of sight (the lock's grace, `hud.targetHidden`) fades to a
 * grey ghost with a dashed rim until it is seen again or the lock lets go.
 *
 * Per-cell DOM rather than one fill under a mask (as the 28-segment bars
 * are): 20 boxes lay out on whole pixels, where a gradient mask across a
 * fractional width smears the gaps between cells.
 */
const { t } = useI18n()
const CELLS = 20
/** At or below this share of HP the last lit cell blinks. */
const NEARLY_DOWN = 0.2
const hp01 = computed(() => Math.min(1, Math.max(0, hud.targetHp01)))
const lit = computed(() => Math.ceil(hp01.value * CELLS))
const nearlyDown = computed(() => hp01.value > 0 && hp01.value <= NEARLY_DOWN)
</script>

<style scoped lang="sass">
.target
  position: absolute
  left: 50%
  top: calc(env(safe-area-inset-top, 0px) + clamp(32px, 7vmin, 46px))
  transform: translateX(-50%)
  width: clamp(170px, 42vmin, 300px)
  pointer-events: none
.row
  display: flex
  justify-content: center
  align-items: baseline
  gap: 8px
  font-family: var(--font-ui)
  color: #fff
  text-shadow: 0 2px 0 #141a33, 0 0 4px #141a33
  font-size: clamp(13px, 2.8vmin, 18px)
  white-space: nowrap
.lv
  font-family: var(--font-pixel)
  font-size: 0.62em
  color: #9fe6ff
.elite .name
  color: #ffd84a
// The navy plate: its padding and the gaps between the cells are the outline.
.cells
  display: flex
  gap: 2px
  margin-top: 4px
  height: clamp(14px, 3.2vmin, 20px)
  padding: 2px
  border-radius: 4px
  background: #141a33
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
// Each cell carries the light stripe across its top. Empty cells stay dark
// but keep the stripe faintly, so the drained length still reads as cells.
.cell
  flex: 1
  border-radius: 1px
  background: linear-gradient(#3b2633 0%, #3b2633 28%, #221520 28%, #221520 100%)
  &.on
    background: linear-gradient(#ffe6b8 0%, #ffe6b8 28%, #ff8a3a 28%, #ff8a3a 70%, #dd5220 70%, #dd5220 100%)
  &.last
    animation: blink 0.5s steps(1) infinite
// Gold trim: a gold ring round the navy plate, a navy hairline outside it so
// it holds against a bright sky, and a faint gold glow.
.elite .cells
  box-shadow: 0 0 0 2px #ffd84a, 0 0 0 3px #141a33, 0 4px 0 2px rgba(0, 0, 0, 0.35), 0 0 12px 3px rgba(255, 216, 74, 0.35)
// Out of sight: faint, grey, the plate's rim broken into dashes, no blink —
// a lock on nothing that can be hit. It fades out; seen again, it is back at
// once (no transition on the way back). On the children, so the frame's own
// opacity and transition stay free for its enter/leave.
.target.lost
  .row, .cells
    opacity: 0.38
    filter: grayscale(1)
    transition: opacity 0.15s, filter 0.15s
  .cells
    outline: 2px dashed #ffffff
    outline-offset: 2px
  .cell.last
    animation: none
.tf-enter-active, .tf-leave-active
  transition: opacity 0.2s, transform 0.2s
.tf-enter-from, .tf-leave-to
  opacity: 0
  transform: translate(-50%, -8px)
@keyframes blink
  50%
    opacity: 0.15
@media (max-aspect-ratio: 1/1)
  .target
    top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 2.2vmin, 18px) + clamp(36px, 8vmin, 48px) + 40px)
// No blink: the last cell burns white-hot instead.
@media (prefers-reduced-motion: reduce)
  .cell.last
    animation: none
    background: linear-gradient(#ffffff 0%, #ffffff 28%, #ffd2a6 28%, #ffd2a6 100%)
</style>
