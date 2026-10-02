<template lang="pug">
  div.coach-layer(aria-live="polite")
    svg.coach-layer__lines(aria-hidden="true")
      line(v-for="h in hud.hints" v-show="isDrag(h.id)" :key="h.id" :ref="(el) => setLine(el, h.id)" class="trail")
    div.coach(
      v-for="h in hud.hints"
      :key="h.id"
      :ref="(el) => setEl(el, h.id)"
      :class="[`coach--${h.id}`, { 'is-ring': isButton(h.id) }]"
      role="img"
      :aria-label="t(`coach.${h.id}.${hud.device}`)"
    )
      span.coach__ring(v-if="isButton(h.id)" aria-hidden="true")
      span.coach__hand(:key="`${h.id}:${h.flash}`" :class="{ ok: h.flash > 0 }")
        InputGlyph.coach__glyph(v-bind="glyph(h.id)")
      span.coach__pips(aria-hidden="true")
        i(v-for="n in h.pips" :key="n" :class="{ on: n <= h.done }")
</template>

<script setup lang="ts">
/**
 * The coach's glyphs (see `game/coach.ts` for the rules). Each one is drawn
 * WHERE the action happens and shows the gesture itself:
 *
 *   move    a finger tapping the ground ahead (a mouse clicking it);
 *   target  a finger dragging from the hero onto the enemy, the line it draws
 *           behind it (a mouse clicking the enemy);
 *   skill   a ring closing on the skill button, a finger tapping it (its key);
 *   aim     a finger dragging from the button out to the enemy;
 *   potion  a ring on the potion.
 *
 * Words never appear: the sentence is the `aria-label`. Positions come from
 * the HUD ticker as transforms; the reactive part is only which glyphs are up
 * and their pips.
 */
import { onMounted, onUnmounted, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { addHudTicker, hud } from '@/game/state/hud'
import { hintGeo, type LessonId } from '@/game/coach'
import { DEFAULT_BINDINGS } from '@/game/engine/keyBindings'
import InputGlyph from '@/components/glyphs/InputGlyph.vue'

const { t } = useI18n()

const isButton = (id: string): boolean => id === 'skill' || id === 'potion'
const isDrag = (id: string): boolean => hud.device === 'touch' && (id === 'target' || id === 'aim')

const glyph = (id: string): Record<string, unknown> => {
  if (hud.device === 'touch') return { kind: 'finger', mode: 'tap' }
  if (id === 'skill') return { kind: 'key', code: DEFAULT_BINDINGS[`skill${hintGeo.skill.slot + 1}` as 'skill1'][0] }
  if (id === 'potion') return { kind: 'key', code: DEFAULT_BINDINGS.potion[0] }
  if (id === 'aim') return { kind: 'mouse', button: 'left', hold: true }
  return { kind: 'mouse', button: 'left', click: true }
}

type RefEl = Element | ComponentPublicInstance | null
const els: Partial<Record<LessonId, HTMLElement>> = {}
const lines: Partial<Record<LessonId, SVGLineElement>> = {}
const setEl = (el: RefEl, id: string): void => {
  if (el) els[id as LessonId] = el as HTMLElement
  else delete els[id as LessonId]
}
const setLine = (el: RefEl, id: string): void => {
  if (el) lines[id as LessonId] = el as unknown as SVGLineElement
  else delete lines[id as LessonId]
}

const rectOf = (sel: string): DOMRect | null => document.querySelector(sel)?.getBoundingClientRect() ?? null

/** A drag is acted out: out along the line, a short rest on the target, back. */
const DRAG_PERIOD = 1.7
let clock = 0
const dragPhase = (): number => {
  const u = (clock % DRAG_PERIOD) / DRAG_PERIOD
  if (u < 0.12) return 0
  if (u < 0.72) { const k = (u - 0.12) / 0.6; return k * k * (3 - 2 * k) }
  return 1
}

let removeTicker: (() => void) | null = null
onMounted(() => {
  removeTicker = addHudTicker((dt) => {
    clock += dt
    for (const h of hud.hints) {
      const id = h.id as LessonId
      const el = els[id]
      const g = hintGeo[id]
      if (!el) continue
      let x = g.x1
      let y = g.y1
      let show = g.on
      let size = 0
      if (id === 'skill' || id === 'potion' || id === 'aim') {
        const r = rectOf(id === 'potion' ? '[data-potion]' : `[data-skill-slot="${g.slot}"]`)
        if (!r) show = false
        else if (id === 'aim') {
          const bx = r.left + r.width / 2
          const by = r.top + r.height / 2
          const k = hud.device === 'touch' ? dragPhase() : 1
          const ln = lines.aim
          if (ln) { ln.setAttribute('x1', String(bx)); ln.setAttribute('y1', String(by)); ln.setAttribute('x2', String(bx + (g.x1 - bx) * k)); ln.setAttribute('y2', String(by + (g.y1 - by) * k)) }
          x = bx + (g.x1 - bx) * k
          y = by + (g.y1 - by) * k
        } else {
          x = r.left + r.width / 2
          y = r.top + r.height / 2
          size = r.width
        }
      } else if (id === 'target' && hud.device === 'touch') {
        const k = dragPhase()
        const ln = lines.target
        if (ln) { ln.setAttribute('x1', String(g.x0)); ln.setAttribute('y1', String(g.y0)); ln.setAttribute('x2', String(g.x0 + (g.x1 - g.x0) * k)); ln.setAttribute('y2', String(g.y0 + (g.y1 - g.y0) * k)) }
        x = g.x0 + (g.x1 - g.x0) * k
        y = g.y0 + (g.y1 - g.y0) * k
      }
      el.style.opacity = show ? '1' : '0'
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      if (size) el.style.setProperty('--ring', `${size.toFixed(0)}px`)
    }
  })
})
onUnmounted(() => removeTicker?.())
</script>

<style scoped lang="sass">
.coach-layer, .coach-layer__lines
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  pointer-events: none
  overflow: hidden
.trail
  stroke: #ffffff
  stroke-width: 5
  stroke-linecap: round
  stroke-dasharray: 2 12
  opacity: 0.9
  filter: drop-shadow(0 2px 0 #0f1a30)
.coach
  --g: clamp(3.2rem, 15vmin, 5rem)
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  opacity: 0
  transition: opacity 180ms ease-out
  will-change: transform
// The glyph hangs BELOW the point it teaches, so the thing itself stays seen
// (a fingertip is at the top of the hand).
.coach__hand
  position: absolute
  left: calc(var(--g) * -0.5)
  top: calc(var(--g) * -0.1)
  width: var(--g)
  height: var(--g)
  filter: drop-shadow(0 3px 0 rgba(15, 26, 48, 0.55))
.coach--move .coach__hand, .coach--target .coach__hand, .coach--aim .coach__hand
  top: calc(var(--g) * -0.12)
// A button's glyph sits above it, clear of the thumb.
.is-ring .coach__hand
  top: calc(var(--ring, 60px) * -0.5 - var(--g) * 1.05)
.coach__hand.ok
  animation: coach-ok 420ms ease-out
.coach__glyph
  width: 100%
  height: 100%
.coach__ring
  position: absolute
  left: calc(var(--ring, 60px) * -0.5)
  top: calc(var(--ring, 60px) * -0.5)
  width: var(--ring, 60px)
  height: var(--ring, 60px)
  border-radius: 28%
  border: 4px solid #ffd84a
  box-shadow: 0 0 0 2px #0f1a30, inset 0 0 0 2px #0f1a30
  animation: coach-ring 1.1s ease-in infinite
.coach--potion .coach__ring
  border-radius: 50%
.coach__pips
  position: absolute
  left: calc(var(--g) * -0.5)
  top: calc(var(--g) * 1.02)
  width: var(--g)
  display: flex
  justify-content: center
  gap: 4px
  i
    width: clamp(0.4rem, 1.8vmin, 0.6rem)
    height: clamp(0.4rem, 1.8vmin, 0.6rem)
    border-radius: 50%
    border: 2px solid #0f1a30
    background: rgba(255, 255, 255, 0.55)
    &.on
      background: #5dff7a
.is-ring .coach__pips
  top: calc(var(--ring, 60px) * -0.5 - var(--g) * 0.02 - 0.9rem)
@keyframes coach-ring
  0%
    transform: scale(1.7)
    opacity: 0
  35%
    opacity: 1
  100%
    transform: scale(1)
    opacity: 1
@keyframes coach-ok
  0%
    filter: drop-shadow(0 0 0 #5dff7a) brightness(1)
    transform: scale(1)
  35%
    filter: drop-shadow(0 0 0.9rem #5dff7a) brightness(1.5) hue-rotate(70deg)
    transform: scale(1.22)
  100%
    filter: drop-shadow(0 3px 0 rgba(15, 26, 48, 0.55))
    transform: scale(1)
@media (prefers-reduced-motion: reduce)
  .coach__ring
    animation: none
</style>
