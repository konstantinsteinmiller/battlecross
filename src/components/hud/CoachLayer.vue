<template lang="pug">
  div.coach-layer(aria-live="polite")
    svg.coach-layer__lines(aria-hidden="true")
      line(v-for="h in hud.hints" v-show="isDrag(h.id)" :key="h.id" :ref="(el) => setLine(el, h.id)" :class="['trail', `trail--${h.id}`]")
    div.coach(
      v-for="h in hud.hints"
      :key="h.id"
      :ref="(el) => setEl(el, h.id)"
      :class="[`coach--${h.id}`, `coach--${hud.device}`, { 'is-ring': isButton(h.id), 'is-down': isButton(h.id) && hud.device === 'touch' }]"
      role="img"
      :aria-label="t(`coach.${h.id}.${hud.device}`)"
    )
      span.coach__ring(v-if="isButton(h.id)" aria-hidden="true")
      //- A townsperson to talk to: a beacon over the head, a ring at the feet.
      span.coach__beacon(v-if="h.id === 'talk'" :ref="(el) => setBeacon(el)" aria-hidden="true")
      span.coach__spot(v-if="h.id === 'chest' || h.id === 'talk'" aria-hidden="true")
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
 *   skill   a ring closing on the skill button, a finger pressing it from
 *           above (its key, on a keyboard);
 *   aim     a finger (a held mouse) dragging from the button out to the enemy;
 *   potion  a ring on the health flask; mana: on the mana flask;
 *   chest   a finger tapping the chest (a mouse clicking it), a ring under it;
 *   talk    a dotted way from the hero to a trainer, a beacon over their head
 *           and a finger tapping them.
 *
 * On a phone a button's finger presses DOWN from above: below the bar there is
 * only the screen's edge, and a hand drawn there would be cut off or sit under
 * the thumb. Every point off the screen is pulled back to its edge, so a
 * glyph always says which way to go.
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

const isButton = (id: string): boolean => id === 'skill' || id === 'potion' || id === 'mana'
const isDrag = (id: string): boolean => (hud.device === 'touch' && id === 'target') || id === 'aim' || id === 'talk'

const glyph = (id: string): Record<string, unknown> => {
  if (hud.device === 'touch') return { kind: 'finger', mode: 'tap' }
  if (id === 'skill') return { kind: 'key', code: DEFAULT_BINDINGS[`skill${hintGeo.skill.slot + 1}` as 'skill1'][0] }
  if (id === 'potion') return { kind: 'key', code: DEFAULT_BINDINGS.potion[0] }
  if (id === 'mana') return { kind: 'key', code: DEFAULT_BINDINGS.manaPotion[0] }
  if (id === 'aim') return { kind: 'mouse', button: 'left', hold: true }
  return { kind: 'mouse', button: 'left', click: true }
}

type RefEl = Element | ComponentPublicInstance | null
const els: Partial<Record<LessonId, HTMLElement>> = {}
const lines: Partial<Record<LessonId, SVGLineElement>> = {}
let beacon: HTMLElement | null = null
const setEl = (el: RefEl, id: string): void => {
  if (el) els[id as LessonId] = el as HTMLElement
  else delete els[id as LessonId]
}
const setLine = (el: RefEl, id: string): void => {
  if (el) lines[id as LessonId] = el as unknown as SVGLineElement
  else delete lines[id as LessonId]
}
const setBeacon = (el: RefEl): void => { beacon = el as HTMLElement | null }

const rectOf = (sel: string): DOMRect | null => document.querySelector(sel)?.getBoundingClientRect() ?? null
const BUTTON: Partial<Record<LessonId, string>> = { potion: '[data-potion]', mana: '[data-mana-potion]' }

/** A drag is acted out: out along the line, a short rest on the target, back. */
const DRAG_PERIOD = 1.7
let clock = 0
const dragPhase = (): number => {
  const u = (clock % DRAG_PERIOD) / DRAG_PERIOD
  if (u < 0.12) return 0
  if (u < 0.72) { const k = (u - 0.12) / 0.6; return k * k * (3 - 2 * k) }
  return 1
}

/** A point kept inside the screen, so a glyph aimed at something out of view
 *  stands at the edge it lies beyond — inside the corners' HUD, never on the
 *  hero's frame at the top or the buttons at the bottom. */
const clampIn = (x: number, y: number, m: number): [number, number] => {
  const inside = x >= m && x <= innerWidth - m && y >= m && y <= innerHeight - m
  if (inside) return [x, y]
  return [
    Math.max(m, Math.min(innerWidth - m, x)),
    Math.max(innerHeight * 0.24, Math.min(innerHeight * 0.7, y))
  ]
}

/** The glyph's size in px, as `--g` sizes it. */
const glyphPx = (): number => Math.max(51.2, Math.min(80, Math.min(innerWidth, innerHeight) * 0.15))

const setLineXY = (ln: SVGLineElement | undefined, x0: number, y0: number, x1: number, y1: number): void => {
  if (!ln) return
  ln.setAttribute('x1', x0.toFixed(1))
  ln.setAttribute('y1', y0.toFixed(1))
  ln.setAttribute('x2', x1.toFixed(1))
  ln.setAttribute('y2', y1.toFixed(1))
}

let removeTicker: (() => void) | null = null
onMounted(() => {
  removeTicker = addHudTicker((dt) => {
    clock += dt
    const edge = Math.min(innerWidth, innerHeight) * 0.09
    for (const h of hud.hints) {
      const id = h.id as LessonId
      const el = els[id]
      const g = hintGeo[id]
      if (!el) continue
      let x = g.x1
      let y = g.y1
      let show = g.on
      let size = 0
      if (id === 'skill' || id === 'potion' || id === 'mana' || id === 'aim') {
        const r = rectOf(BUTTON[id] ?? `[data-skill-slot="${g.slot}"]`)
        if (!r) show = false
        else if (id === 'aim') {
          const bx = r.left + r.width / 2
          const by = r.top + r.height / 2
          const [tx, ty] = clampIn(g.x1, g.y1, edge)
          const k = dragPhase()
          setLineXY(lines.aim, bx, by, bx + (tx - bx) * k, by + (ty - by) * k)
          x = bx + (tx - bx) * k
          y = by + (ty - by) * k
        } else {
          x = r.left + r.width / 2
          y = r.top + r.height / 2
          size = r.width
        }
      } else if (id === 'target' && hud.device === 'touch') {
        const k = dragPhase()
        const [tx, ty] = clampIn(g.x1, g.y1, edge)
        setLineXY(lines.target, g.x0, g.y0, g.x0 + (tx - g.x0) * k, g.y0 + (ty - g.y0) * k)
        x = g.x0 + (tx - g.x0) * k
        y = g.y0 + (ty - g.y0) * k
      } else if (id === 'talk') {
        // The way there, drawn whole; the finger waits on the trainer.
        ;[x, y] = clampIn(g.x1, g.y1, edge)
        setLineXY(lines.talk, g.x0, g.y0, x, y)
        if (beacon) {
          // Over their head while they are in view; off screen, the glyph at
          // the edge says the way alone.
          const seen = x === g.x1 && y === g.y1
          beacon.style.opacity = seen ? '1' : '0'
          el.classList.toggle('is-off', !seen)
          beacon.style.transform = `translate(${(g.x2 - x).toFixed(1)}px, ${(g.y2 - y).toFixed(1)}px)`
        }
      } else {
        ;[x, y] = clampIn(x, y, edge)
      }
      // No room under the point (a drag starting on the bar): the hand
      // reaches down onto it from above instead of hanging off the screen.
      // An aim starts on the bar itself, so its finger reaches down the whole
      // way (it never turns over halfway along the drag).
      if (!isButton(id)) el.classList.toggle('is-flip', (id === 'aim' && hud.device === 'touch') || y + glyphPx() * 0.95 > innerHeight - 6)
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
// The way to a trainer: footprints of light that walk toward them.
.trail--talk
  stroke: #ffe066
  stroke-width: 6
  stroke-dasharray: 3 14
  animation: coach-walk 0.9s linear infinite
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
.coach--move .coach__hand, .coach--target .coach__hand, .coach--aim .coach__hand, .coach--chest .coach__hand, .coach--talk .coach__hand
  top: calc(var(--g) * -0.12)
// A button's glyph sits above it, clear of the thumb.
.is-ring .coach__hand
  top: calc(var(--ring, 60px) * -0.5 - var(--g) * 1.05)
// On a phone the finger reaches DOWN onto the button from above: the
// fingertip lands on its top edge, the hand rises away from the bar.
.is-down .coach__hand
  top: calc(var(--ring, 60px) * -0.32 - var(--g) * 1.02)
  transform: rotate(180deg)
  transform-origin: 50% 50%
.is-down .coach__glyph, .is-flip .coach__glyph
  transform: scaleX(-1)
.is-flip .coach__hand
  top: calc(var(--g) * -0.88)
  transform: rotate(180deg)
.is-flip .coach__pips
  top: calc(var(--g) * -1.1)
.coach__hand.ok
  animation: coach-ok 420ms ease-out
.is-down .coach__hand.ok, .is-flip .coach__hand.ok
  animation: coach-ok-down 420ms ease-out
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
.coach--potion .coach__ring, .coach--mana .coach__ring
  border-radius: 50%
.coach--mana .coach__ring
  border-color: #7fd0ff
// A ring on the ground under a chest, or a trainer: "this one".
.coach__spot
  position: absolute
  left: calc(var(--g) * -0.55)
  top: calc(var(--g) * -0.2)
  width: calc(var(--g) * 1.1)
  height: calc(var(--g) * 0.44)
  border-radius: 50%
  border: 4px solid #ffd84a
  box-shadow: 0 0 0 2px #0f1a30, inset 0 0 0 2px #0f1a30
  animation: coach-spot 1.2s ease-in-out infinite
.is-off .coach__spot
  display: none
// Over a trainer's head: a bobbing gold beacon with a pulse round it.
.coach__beacon
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  &::before, &::after
    content: ''
    position: absolute
    left: calc(var(--g) * -0.22)
    top: calc(var(--g) * -0.5)
    width: calc(var(--g) * 0.44)
    height: calc(var(--g) * 0.44)
    border-radius: 50% 50% 50% 0
    transform: rotate(-45deg)
  &::before
    background: radial-gradient(circle at 50% 50%, #ffffff 0 22%, #ffd84a 24% 100%)
    border: 3px solid #0f1a30
    animation: coach-bob 1.2s ease-in-out infinite
  &::after
    border: 3px solid #ffd84a
    animation: coach-pulse 1.2s ease-out infinite
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
.is-down .coach__pips
  top: calc(var(--ring, 60px) * -0.32 - var(--g) * 1.02 - 0.9rem)
@keyframes coach-ring
  0%
    transform: scale(1.7)
    opacity: 0
  35%
    opacity: 1
  100%
    transform: scale(1)
    opacity: 1
@keyframes coach-spot
  0%, 100%
    transform: scale(1)
    opacity: 0.95
  50%
    transform: scale(1.14)
    opacity: 0.7
@keyframes coach-bob
  0%, 100%
    translate: 0 0
  50%
    translate: 0 -0.35rem
@keyframes coach-pulse
  0%
    scale: 1
    opacity: 0.9
  100%
    scale: 2.1
    opacity: 0
@keyframes coach-walk
  to
    stroke-dashoffset: -17
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
@keyframes coach-ok-down
  0%
    filter: drop-shadow(0 0 0 #5dff7a) brightness(1)
    transform: rotate(180deg) scale(1)
  35%
    filter: drop-shadow(0 0 0.9rem #5dff7a) brightness(1.5) hue-rotate(70deg)
    transform: rotate(180deg) scale(1.22)
  100%
    filter: drop-shadow(0 3px 0 rgba(15, 26, 48, 0.55))
    transform: rotate(180deg) scale(1)
@media (prefers-reduced-motion: reduce)
  .coach__ring, .coach__spot, .trail--talk, .coach__beacon::before, .coach__beacon::after
    animation: none
</style>
