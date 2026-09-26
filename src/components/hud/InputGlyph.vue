<template lang="pug">
  //- ── WASD cluster ──
  svg.glyph(v-if="kind === 'wasd'" viewBox="0 0 176 116" aria-hidden="true")
    g(v-for="k in WASD" :key="k.c" :transform="`translate(${k.x} ${k.y})`")
      rect(x="2" y="8" width="54" height="50" rx="11" class="lip")
      rect(x="2" y="2" width="54" height="50" rx="11" class="cap")
      text(x="29" y="36" class="label") {{ keyLabel(k.c) }}

  //- ── One key ──
  svg.glyph(v-else-if="kind === 'key'" :viewBox="wide ? '0 0 124 64' : '0 0 60 64'" aria-hidden="true")
    rect(x="2" y="10" :width="wide ? 120 : 56" height="52" rx="11" class="lip")
    rect(x="2" y="2" :width="wide ? 120 : 56" height="52" rx="11" class="cap")
    text(v-if="!wide" x="30" y="37" class="label") {{ code ? keyLabel(code) : label }}
    rect(v-else x="34" y="30" width="56" height="7" rx="3.5" class="spacebar")

  //- ── Mouse (a button lit; optional drag arrows or a hold ring) ──
  svg.glyph(v-else-if="kind === 'mouse'" viewBox="0 0 140 112" aria-hidden="true")
    g(v-if="drag || move")
      path.chev(d="M6 56 L18 44 M6 56 L18 68" class="arrow l")
      path.chev(d="M134 56 L122 44 M134 56 L122 68" class="arrow r")
    //- hold: the timer ring round the mouse, 3/4 full even in a still frame
    g(v-if="hold")
      path(v-for="p in MOUSE_HOLD" :key="p.cls" :class="p.cls" :d="p.d" :pathLength="p.len")
    g(:class="{ sway: drag || move }")
      rect(x="41" y="12" width="58" height="92" rx="29" class="body")
      path(:d="LEFT_BTN" :class="button === 'left' ? 'hot' : 'btn'")
      path(:d="RIGHT_BTN" :class="button === 'right' ? 'hot' : 'btn'")
      line(x1="70" y1="12" x2="70" y2="52" class="seam")
      line(x1="41" y1="52" x2="99" y2="52" class="seam")
      rect(x="66" y="22" width="8" height="16" rx="4" class="wheel")
    g(v-if="click" class="ripple-at-mouse")
      circle.ripple(cx="70" cy="30" r="10")

  //- ── Ghost joystick with a circling thumb ──
  svg.glyph(v-else-if="kind === 'joystick'" viewBox="0 0 120 120" aria-hidden="true")
    circle(cx="60" cy="60" r="50" class="stick-base")
    circle(cx="60" cy="60" r="50" class="stick-rim")
    g.knob
      circle(cx="60" cy="60" r="20" class="stick-knob")
      circle(cx="54" cy="54" r="6" class="stick-shine")

  //- ── A finger tracing an ∞: drag to move (touch) ──
  svg.glyph(v-else-if="kind === 'infinity'" :viewBox="INFINITY.viewBox" aria-hidden="true")
    path.inf-halo(:d="INFINITY.d")
    path.inf-guide(:d="INFINITY.d")
    //- Twice: riding the ∞, and resting on it for reduced motion (CSS shows
    //- one). SMIL moves the finger and its streak on one clock, so the
    //- streak's head never leaves the fingertip.
    g(v-for="pose in POSES" :key="pose" :class="`inf-${pose}`")
      path.inf-streak(:d="INFINITY.d" :stroke-dasharray="INFINITY.dashArray" :stroke-dashoffset="INFINITY.dashRest")
        animate(
          v-if="pose === 'live'"
          attributeName="stroke-dashoffset"
          :values="INFINITY.dashOffsets"
          :keyTimes="INFINITY.keyTimes"
          calcMode="linear"
          :dur="INFINITY.dur"
          repeatCount="indefinite"
        )
      g
        animateMotion(
          v-if="pose === 'live'"
          :path="INFINITY.motion"
          :keyPoints="INFINITY.keyPoints"
          :keyTimes="INFINITY.keyTimes"
          calcMode="linear"
          :dur="INFINITY.dur"
          repeatCount="indefinite"
        )
        g(:transform="INFINITY.hand")
          g.hand-outline
            rect(v-for="(r, i) in HAND" :key="`o${i}`" v-bind="r")
          g.hand-fill
            rect(v-for="(r, i) in HAND" :key="`f${i}`" v-bind="r")
          rect(x="62" y="10" width="16" height="10" rx="5" class="nail")

  //- ── A finger: tap, hold or drag ──
  svg.glyph(v-else viewBox="0 0 140 130" aria-hidden="true")
    g(v-if="mode === 'drag'")
      path(d="M8 36 L20 24 M8 36 L20 48" class="arrow l")
      path(d="M132 36 L120 24 M132 36 L120 48" class="arrow r")
    g(v-if="mode === 'tap'")
      circle.ripple(cx="70" cy="18" r="12")
      circle.ripple.late(cx="70" cy="18" r="12")
    //- hold: the timer ring round the fingertip (behind the hand), 3/4 full
    g(v-if="mode === 'hold'")
      path(v-for="p in FINGER_HOLD" :key="p.cls" :class="p.cls" :d="p.d" :pathLength="p.len")
    g(:class="{ sway: mode === 'drag', press: mode === 'tap', 'hold-press': mode === 'hold' }")
      //- outline pass (thick, dark) then fill pass: overlapping parts read as one hand
      g.hand-outline
        rect(v-for="(r, i) in HAND" :key="`o${i}`" v-bind="r")
      g.hand-fill
        rect(v-for="(r, i) in HAND" :key="`f${i}`" v-bind="r")
      rect(x="62" y="10" width="16" height="10" rx="5" class="nail")
</template>

<script setup lang="ts">
/**
 * Wordless input glyphs for the control coach (and the pause menu's controls
 * panel): keycaps, the WASD cluster, a mouse with the button to press lit, a
 * finger tracing an ∞ (drag to move), and a finger that taps, holds or drags.
 * Pure SVG + CSS (+ SMIL for the ∞), in the HUD's toon style (white fill,
 * navy outline, yellow = "press this"). Key LETTERS are drawn; words never are.
 *
 * Every glyph must read in a single frozen frame (a screenshot, a player who
 * glances once, reduced motion): motion adds to the meaning, never carries
 * it alone. A hold is a timer ring standing 3/4 full, a tap a ripple, a move
 * an ∞ with the finger on it.
 */
import { keyLabel } from '@/game/engine/keyLabels'
import { FINGER_HOLD, HAND, INFINITY, MOUSE_HOLD } from './glyphGeometry'

withDefaults(defineProps<{
  /** `joystick` is the old touch-move glyph, kept for callers; the coach draws `infinity`. */
  kind: 'wasd' | 'key' | 'mouse' | 'joystick' | 'finger' | 'infinity'
  /** key: the key's letter. */
  label?: string
  /** key: the physical key (`KeyE`); its letter follows the keyboard layout. */
  code?: string
  /** key: the wide space bar. */
  wide?: boolean
  /** mouse: which button is lit (none: just move the mouse). */
  button?: 'left' | 'right' | 'none'
  /** mouse: sway with arrows (drag to look). */
  drag?: boolean
  /** mouse: sway with arrows, no button (a captured mouse looks by moving). */
  move?: boolean
  /** mouse: a timer ring, 3/4 full, that fills while held (charge). */
  hold?: boolean
  /** mouse: a click ripple. */
  click?: boolean
  /** finger: tap / hold / drag. */
  mode?: 'tap' | 'hold' | 'drag'
}>(), { label: '', code: '', wide: false, button: 'left', drag: false, move: false, hold: false, click: false, mode: 'tap' })

/** Physical keys: an AZERTY keyboard prints Z Q S D on them. */
const WASD = [
  { c: 'KeyW', x: 59, y: 0 },
  { c: 'KeyA', x: 0, y: 58 },
  { c: 'KeyS', x: 59, y: 58 },
  { c: 'KeyD', x: 118, y: 58 }
]
const LEFT_BTN = 'M70 12 A29 29 0 0 0 41 41 L41 52 L70 52 Z'
const RIGHT_BTN = 'M70 12 A29 29 0 0 1 99 41 L99 52 L70 52 Z'
/** The ∞ finger, in motion and at rest. */
const POSES = ['live', 'rest'] as const
</script>

<style scoped lang="sass">
.glyph
  display: block
  width: 100%
  height: 100%
  overflow: visible
.lip
  fill: #141a33
.cap
  fill: #f4f7ff
  stroke: #141a33
  stroke-width: 3.5
.label
  font-family: var(--font-ui)
  font-size: 26px
  fill: #141a33
  text-anchor: middle
.spacebar
  fill: #9aa6c8
// Mouse
.body
  fill: #f4f7ff
  stroke: #141a33
  stroke-width: 4
.btn
  fill: transparent
.hot
  fill: #ffd84a
  animation: hot-pulse 1s ease-in-out infinite
.seam
  stroke: #141a33
  stroke-width: 3
.wheel
  fill: #9aa6c8
  stroke: #141a33
  stroke-width: 2.5
// Arrows (drag)
.arrow
  fill: none
  stroke: #ffffff
  stroke-width: 6
  stroke-linecap: round
  stroke-linejoin: round
  filter: drop-shadow(0 2px 0 #141a33)
  animation: arrow-nudge 1.2s ease-in-out infinite
  &.r
    animation-delay: 0.6s
// Joystick
.stick-base
  fill: rgba(255, 255, 255, 0.14)
.stick-rim
  fill: none
  stroke: rgba(255, 255, 255, 0.75)
  stroke-width: 4
  stroke-dasharray: 10 8
.stick-knob
  fill: #f4f7ff
  stroke: #141a33
  stroke-width: 4
.stick-shine
  fill: #ffffff
.knob
  animation: knob-circle 2.2s linear infinite
  transform-origin: 60px 60px
// ∞: a soft guide, and a bright streak that ends at the fingertip
.inf-halo, .inf-guide, .inf-streak
  fill: none
  stroke: #ffffff
  stroke-linecap: round
  stroke-linejoin: round
.inf-halo
  stroke-width: 16
  opacity: 0.14
.inf-guide
  stroke-width: 6
  opacity: 0.5
.inf-streak
  stroke-width: 8
.inf-rest
  display: none
// Hand
.hand-outline rect
  fill: #141a33
  stroke: #141a33
  stroke-width: 9
.hand-fill rect
  fill: #f4f7ff
.nail
  fill: #dfe7ff
// Motion
.sway
  animation: sway 1.4s ease-in-out infinite
.press
  animation: press 1.2s ease-in-out infinite
  transform-origin: 70px 60px
// A hold presses down while the ring fills, and lets go as it completes.
.hold-press
  animation: hold-press 1.6s ease-in-out infinite
  transform-origin: 70px 60px
.ripple
  fill: none
  stroke: #ffffff
  stroke-width: 4
  transform-box: fill-box
  transform-origin: center
  animation: ripple 1.2s ease-out infinite
  &.late
    animation-delay: 0.6s
// Hold: a timer ring standing 3/4 full (static: it is what a still frame
// shows), with the fill sweeping round it in motion.
.hold-track, .hold-edge, .hold-arc, .hold-ring, .hold-tick-edge, .hold-tick
  fill: none
  stroke-linecap: round
.hold-track
  stroke: #ffffff
  stroke-width: 5
  opacity: 0.3
.hold-edge
  stroke: #141a33
  stroke-width: 11
.hold-arc
  stroke: #7ff4ff
  stroke-width: 7
.hold-ring
  stroke: #ffffff
  stroke-width: 3
  stroke-dasharray: 100
  stroke-dashoffset: 100
  animation: hold-fill 1.6s linear infinite
.hold-tick-edge
  stroke: #141a33
  stroke-width: 8
.hold-tick
  stroke: #f4f7ff
  stroke-width: 3.5
@keyframes hot-pulse
  50%
    fill: #fff3a8
@keyframes arrow-nudge
  50%
    opacity: 0.35
@keyframes knob-circle
  0%
    transform: translate(16px, 0)
  25%
    transform: translate(0, -16px)
  50%
    transform: translate(-16px, 0)
  75%
    transform: translate(0, 16px)
  100%
    transform: translate(16px, 0)
@keyframes sway
  0%, 100%
    transform: translateX(-16px)
  50%
    transform: translateX(16px)
@keyframes press
  0%, 100%
    transform: translateY(0) scale(1)
  40%
    transform: translateY(5px) scale(0.96)
@keyframes hold-press
  0%, 88%, 100%
    transform: translateY(0) scale(1)
  10%, 78%
    transform: translateY(5px) scale(0.96)
@keyframes ripple
  from
    transform: scale(0.4)
    opacity: 0.9
  to
    transform: scale(2.2)
    opacity: 0
// Pressed at 10 %, full at 78 %, let go and fade: the same clock as hold-press.
@keyframes hold-fill
  0%, 10%
    stroke-dashoffset: 100
    opacity: 1
  78%
    stroke-dashoffset: 0
    opacity: 1
  90%, 100%
    stroke-dashoffset: 0
    opacity: 0
// Reduced motion: still poses that still read. The finger rests on the ∞
// with its streak behind it, the hold ring stands at 3/4, a tap keeps one
// ripple round the fingertip.
@media (prefers-reduced-motion: reduce)
  .sway, .press, .hold-press, .knob, .ripple, .arrow, .hot, .hold-ring
    animation: none
  .ripple
    transform: scale(1.7)
    opacity: 0.7
    &.late
      display: none
  .inf-live
    display: none
  .inf-rest
    display: inline
</style>
