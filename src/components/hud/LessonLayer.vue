<template lang="pug">
  div.lessons(
    v-if="show"
    :class="[lesson.id, hud.device, { done: lesson.done }]"
    aria-live="polite"
  )
    //- Weapon lesson: guide lines fan out from the buster to each drone.
    svg.guides(v-show="lesson.id === 'weapon' && !lesson.done" aria-hidden="true")
      g(v-for="i in 3" :key="i" :ref="(el) => setGuide(i - 1, el)")
        line.guide(x1="0" y1="0" x2="0" y2="0" :style="{ stroke: lesson.color }")
        circle.aim(cx="0" cy="0" r="26" :style="{ stroke: lesson.color }")
    //- The glyph, pinned to the lesson's subject (moved every frame).
    div.card(
      ref="cardEl"
      role="img"
      :aria-label="t(aria, { n: lesson.slot })"
      :class="{ nudge: nudging }"
    )
      template(v-if="!lesson.done")
        div.glyph-box
          //- charge / crates: hold the fire button, let go
          InputGlyph(v-if="lesson.id !== 'weapon'" v-bind="holdGlyph")
          //- the weapon: its key, or a tap (the finger sits on the button)
          InputGlyph(v-else-if="hud.device === 'mouse'" kind="key" :code="`Digit${lesson.slot}`")
          InputGlyph(v-else kind="finger" mode="tap")
          span.no(v-if="nudging")
        //- What it does: a charged shot, or the weapon's orb.
        span.act(v-if="lesson.id !== 'weapon'")
          GameIcon(name="bolt")
        span.orb(v-else :style="{ '--wc': lesson.color }")
      GameIcon.check(v-else name="check")
    //- Subject off screen, player in its room: the lesson's own glyph in a
    //- small bubble on that side. Never an arrow — an arrow reads "go this way".
    div.edge(ref="edgeEl" aria-hidden="true")
      InputGlyph(v-if="lesson.id !== 'weapon'" v-bind="holdGlyph")
      InputGlyph(v-else-if="hud.device === 'mouse'" kind="key" :code="`Digit${lesson.slot}`")
      InputGlyph(v-else kind="finger" mode="tap")
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud, addHudTicker } from '@/game/state/hud'
import { currentMission } from '@/game/boot'
import type { LessonView } from '@/game/sim/lessons'
import InputGlyph from './InputGlyph.vue'
import GameIcon from '@/components/icons/GameIcon.vue'

/**
 * The scene lessons' glyphs (see `game/sim/lessons.ts`). No words: the glyph
 * rides on the thing the lesson is about — the training drone, the glowing
 * crate, the row of drones — and follows it every frame with direct style
 * writes (no Vue on the hot path). A wrong try (a quick shot off the shield,
 * a hold let go too soon) shakes it; success pops a check where the subject
 * was. With the subject off screen and the player in its room, a small
 * bubble with the same glyph waits on that edge of the screen. Only then: an
 * edge ARROW kept pointing back at the unpopped drone and pulled two blind
 * testers back to the start pad, as if it were the way on.
 */
const { t } = useI18n()

const lesson = computed(() => hud.lesson as LessonView)
/** Hidden until the mouse is captured: before that a click captures it,
 *  and the capture glyph owns the crosshair. */
const show = computed(() => hud.phase === 'play' && !!hud.lesson && !hud.pointerFree)

type GlyphProps = InstanceType<typeof InputGlyph>['$props']
const holdGlyph = computed<GlyphProps>(() => hud.device === 'touch'
  ? { kind: 'finger', mode: 'hold' }
  : { kind: 'mouse', button: 'left', hold: true })

const aria = computed(() => {
  const l = hud.lesson
  if (!l) return 'lesson.charge'
  if (l.id === 'weapon') return hud.device === 'touch' ? 'lesson.weaponTouch' : 'lesson.weaponKeys'
  return `lesson.${l.id}`
})

// ── "Not like that": a shake and a red cross on each wrong try ──
const nudging = ref(false)
let nudgeTimer: number | null = null
watch(() => hud.lesson?.nudge ?? 0, (n, prev) => {
  if (!prev && prev !== 0) return
  if (n <= (prev ?? 0)) return
  nudging.value = false
  requestAnimationFrame(() => {
    nudging.value = true
    if (nudgeTimer !== null) clearTimeout(nudgeTimer)
    nudgeTimer = window.setTimeout(() => { nudging.value = false }, 520)
  })
})

// ── Per-frame placement ──
const cardEl = ref<HTMLElement | null>(null)
const edgeEl = ref<HTMLElement | null>(null)
const guides: Array<SVGGElement | null> = [null, null, null]
// (Typed here, not in the template: a pug template is compiled apart from
// the script and is never stripped of TypeScript — a cast there is a syntax
// error in the browser that vue-tsc happily accepts.)
const setGuide = (i: number, el: unknown) => { guides[i] = el as SVGGElement | null }
const anchors = new Float32Array(9)
const pt = { x: 0, y: 0, visible: false }
let off: (() => void) | null = null

const place = (): void => {
  const m = currentMission()
  const card = cardEl.value
  const edge = edgeEl.value
  if (!m || !card || !edge || !hud.lesson) return
  const n = m.lessonAnchors(anchors)
  if (n === 0) {
    card.style.opacity = '0'
    edge.style.opacity = '0'
    return
  }
  const el = m.camera
  const w = window.innerWidth
  const h = window.innerHeight
  const p = m.player
  // The middle subject leads (the centre drone of three).
  const k = n === 3 ? 1 : 0
  const ax = anchors[k * 3]!
  const ay = anchors[k * 3 + 1]!
  const az = anchors[k * 3 + 2]!
  // Relative bearing decides "behind me" before projecting. Yaw grows to
  // the LEFT (the mouse turns right by lowering it), so + = left.
  let bearing = Math.atan2(-(ax - p.x), -(az - p.z)) - p.yaw
  while (bearing > Math.PI) bearing -= Math.PI * 2
  while (bearing < -Math.PI) bearing += Math.PI * 2
  m.project(ax, ay, az, pt)
  const halfFov = (el.fov * el.aspect * Math.PI) / 360
  const onScreen = pt.visible && Math.abs(bearing) < halfFov * 1.02 && pt.x > 0 && pt.x < w && pt.y > 0 && pt.y < h
  const touchWeapon = hud.lesson.id === 'weapon' && hud.device === 'touch' && !hud.lesson.done
  if (touchWeapon) {
    // The finger taps the weapon button itself, wherever the layout put it.
    const btn = document.querySelector<HTMLElement>(`[data-lesson="weapon-${hud.lesson.slot}"]`)
    if (btn) {
      const r = btn.getBoundingClientRect()
      card.style.transform = `translate3d(${r.left + r.width / 2}px, ${r.top - 8}px, 0) translate(-50%, -100%)`
      card.style.opacity = '1'
    }
  } else if (onScreen) {
    // Above a crate or a drone row, below the training drone (it hovers at
    // eye level: a card on top of it would hide the target).
    const below = hud.lesson.id === 'charge' && !hud.lesson.done
    const lift = below ? 'translate(-50%, 42%)' : 'translate(-50%, -115%)'
    card.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) ${lift}`
    card.style.opacity = '1'
  } else {
    card.style.opacity = '0'
  }
  // The glyph's bubble on the side the subject is on — only in its room, and
  // never rotated into a pointer.
  if (!onScreen && !hud.lesson.done && m.lessonInRoom()) {
    const right = bearing < 0
    const behind = Math.abs(bearing) > Math.PI / 2
    const ex = right ? w - 64 : 64
    const ey = behind ? h * 0.5 : Math.max(90, Math.min(h - 90, pt.visible ? pt.y : h * 0.5))
    edge.style.transform = `translate3d(${ex}px, ${ey}px, 0) translate(-50%, -50%)`
    edge.style.opacity = '1'
  } else {
    edge.style.opacity = '0'
  }
  // Guide lines: from the buster (right-low of the view) to each drone.
  if (hud.lesson.id === 'weapon' && !hud.lesson.done) {
    const mx = w * 0.64
    const my = h * 0.86
    for (let i = 0; i < 3; i++) {
      const g = guides[i]
      if (!g) continue
      if (i >= n) { g.style.opacity = '0'; continue }
      m.project(anchors[i * 3]!, anchors[i * 3 + 1]!, anchors[i * 3 + 2]!, pt)
      if (!pt.visible) { g.style.opacity = '0'; continue }
      const line = g.firstElementChild as SVGLineElement
      const ring = g.lastElementChild as SVGCircleElement
      line.setAttribute('x1', String(mx))
      line.setAttribute('y1', String(my))
      line.setAttribute('x2', String(pt.x))
      line.setAttribute('y2', String(pt.y))
      ring.setAttribute('cx', String(pt.x))
      ring.setAttribute('cy', String(pt.y))
      g.style.opacity = '1'
    }
  }
}

onMounted(() => { off = addHudTicker(place) })
onUnmounted(() => {
  off?.()
  if (nudgeTimer !== null) clearTimeout(nudgeTimer)
})
</script>

<style scoped lang="sass">
.lessons
  position: absolute
  inset: 0
  pointer-events: none
.guides
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  overflow: visible
.guides g
  opacity: 0
  transition: opacity 0.2s
.guide
  stroke-width: 5
  stroke-linecap: round
  stroke-dasharray: 2 16
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))
  animation: guide-flow 0.7s linear infinite
.aim
  fill: none
  stroke-width: 4
  transform-box: fill-box
  transform-origin: center
  animation: aim-pulse 1.1s ease-in-out infinite
.card
  position: absolute
  left: 0
  top: 0
  display: flex
  align-items: center
  gap: clamp(4px, 1vmin, 8px)
  opacity: 0
  transition: opacity 0.2s
  filter: drop-shadow(0 3px 0 rgba(20, 26, 51, 0.55))
  will-change: transform
.glyph-box
  position: relative
  width: clamp(92px, 16vmin, 132px)
  aspect-ratio: 140 / 112
  animation: lesson-bob 1.6s ease-in-out infinite
.weapon.mouse .glyph-box
  width: clamp(46px, 8vmin, 64px)
  aspect-ratio: 60 / 64
.weapon.touch .glyph-box
  width: clamp(62px, 12vmin, 88px)
  aspect-ratio: 140 / 130
.act
  width: clamp(28px, 5vmin, 38px)
  height: clamp(28px, 5vmin, 38px)
  padding: 6px
  border-radius: 50%
  border: 3px solid #141a33
  background: radial-gradient(circle at 40% 30%, #eaffb0, #9dff5a 45%, #3cc86a)
  color: #141a33
.orb
  width: clamp(26px, 4.6vmin, 34px)
  height: clamp(26px, 4.6vmin, 34px)
  border-radius: 50%
  border: 3px solid #141a33
  background: radial-gradient(circle at 40% 30%, #ffffff, var(--wc) 60%)
  box-shadow: 0 0 14px var(--wc)
.weapon.touch .orb
  display: none
.check
  width: clamp(40px, 8vmin, 56px)
  height: clamp(40px, 8vmin, 56px)
  padding: 7px
  border-radius: 50%
  border: 3px solid #141a33
  background: #8dff7a
  color: #141a33
  animation: check-pop 0.45s cubic-bezier(0.2, 1.9, 0.4, 1)
// A wrong try: shake, and a red slash across the glyph.
.nudge .glyph-box
  animation: nudge-shake 0.45s ease-in-out
.no
  position: absolute
  left: 50%
  top: 50%
  width: 110%
  height: 7px
  border-radius: 4px
  background: #ff4a5a
  box-shadow: 0 0 0 2px #141a33
  transform: translate(-50%, -50%) rotate(-28deg)
  animation: no-flash 0.5s ease-out forwards
// Off screen, in the subject's room: the same glyph, small, in a dark bubble
// (not a pointer, not the cyan of the UI's "go" buttons).
.edge
  position: absolute
  left: 0
  top: 0
  width: clamp(62px, 12vmin, 84px)
  aspect-ratio: 1
  padding: clamp(7px, 1.5vmin, 11px)
  border-radius: 50%
  border: 3px solid #f4f7ff
  background: rgba(20, 26, 51, 0.72)
  opacity: 0
  transition: opacity 0.2s
  filter: drop-shadow(0 3px 0 rgba(20, 26, 51, 0.55))
  :deep(.glyph)
    animation: edge-breathe 1.6s ease-in-out infinite
@keyframes lesson-bob
  50%
    transform: translateY(-5px)
@keyframes nudge-shake
  0%, 100%
    transform: translateX(0)
  20%
    transform: translateX(-9px)
  40%
    transform: translateX(8px)
  60%
    transform: translateX(-6px)
  80%
    transform: translateX(4px)
@keyframes no-flash
  0%
    opacity: 1
  70%
    opacity: 1
  100%
    opacity: 0
@keyframes check-pop
  from
    transform: scale(0)
@keyframes guide-flow
  to
    stroke-dashoffset: -18
@keyframes aim-pulse
  50%
    transform: scale(1.25)
    opacity: 0.6
@keyframes edge-breathe
  50%
    transform: scale(1.08)
@media (prefers-reduced-motion: reduce)
  .glyph-box, .guide, .aim, .check, .edge :deep(.glyph)
    animation: none
</style>
