<template lang="pug">
  div.charge-demo(ref="root" :class="[device, aim, { compact }]" :style="COLORS")
    //- ── The film, looping: press and stay down, the crosshair's two rings
    //- fill round the press point with a swelling glow, the shot grows beside
    //- it, let go — it flies into the target and bursts. One SMIL clock. ──
    svg.cd.cd-loop(v-if="!clip" ref="loopSvg" :viewBox="box" aria-hidden="true")
      defs
        radialGradient(:id="`${uid}-gl`")
          stop(offset="0" stop-color="#ffffff" stop-opacity="0.9")
          stop(v-for="s in GLOW_STOPS" :key="s.offset" v-bind="s" :stop-color="DEMO_RING.l1")
            animate(attributeName="stop-color" v-bind="A.glowColor" repeatCount="indefinite")
        radialGradient(:id="`${uid}-lh`")
          stop(v-for="s in HALO_STOPS" :key="s.offset" v-bind="s" :stop-color="DEMO_SHOT.pellet[1]")
            animate(attributeName="stop-color" v-bind="A.haloColor" repeatCount="indefinite")
      circle.cd-glow(:cx="G.press.x" :cy="G.press.y" r="14" opacity="0" :fill="`url(#${uid}-gl)`")
        animate(attributeName="r" v-bind="A.glowR" repeatCount="indefinite")
        animate(attributeName="opacity" v-bind="A.glowO" repeatCount="indefinite")
      //- touch: a finger on the play area — a dimple where it presses
      template(v-if="device === 'touch'")
        circle.cd-dimple(:cx="G.press.x" :cy="G.press.y" r="0")
          animate(attributeName="r" v-bind="A.dimple" repeatCount="indefinite")
        circle.cd-ripple(:cx="G.tapAt.x" :cy="G.tapAt.y" r="4" opacity="0")
          animate(attributeName="r" v-bind="A.rippleR" repeatCount="indefinite")
          animate(attributeName="opacity" v-bind="A.rippleO" repeatCount="indefinite")
        g
          animateTransform(attributeName="transform" type="translate" v-bind="A.finger" repeatCount="indefinite")
          g(:transform="G.hand")
            g.hand-outline
              rect(v-for="(r, i) in HAND" :key="`o${i}`" v-bind="r")
            g.hand-fill
              rect(v-for="(r, i) in HAND" :key="`f${i}`" v-bind="r")
            rect.nail(x="62" y="10" width="16" height="10" rx="5")
      //- desktop: the mouse, its LEFT button sinking and staying down
      template(v-else)
        g(:transform="G.mouse")
          rect.body(v-bind="MOUSE_BODY")
          path.well(:d="MOUSE_BUTTONS.left.d")
          path.hot(:d="MOUSE_BUTTONS.left.d" fill="#ffd84a")
            animateTransform(attributeName="transform" type="translate" v-bind="A.button" repeatCount="indefinite")
            animate(attributeName="fill" v-bind="A.buttonFill" repeatCount="indefinite")
          path.btn(:d="MOUSE_BUTTONS.right.d")
          line.seam(x1="70" y1="12" x2="70" y2="52")
          line.seam(x1="41" y1="52" x2="99" y2="52")
          rect.wheel(x="67.5" y="22" width="5" height="13" rx="2.5")
        circle.cd-ripple.on-button(:cx="G.tapAt.x" :cy="G.tapAt.y" r="4" opacity="0")
          animate(attributeName="r" v-bind="A.rippleR" repeatCount="indefinite")
          animate(attributeName="opacity" v-bind="A.rippleO" repeatCount="indefinite")
      //- the crosshair's rings: inner to charge level 1, outer to full — on
      //- a faint track that never leaves, so any frame shows a timer ring
      circle.cd-track(:cx="G.press.x" :cy="G.press.y" :r="DEMO_R1")
      g.cd-ring(opacity="0")
        animate(attributeName="opacity" v-bind="A.ringO" repeatCount="indefinite")
        path.cd-e1(:d="G.ring1" pathLength="100" :stroke-dasharray="DEMO_DASH" :stroke-dashoffset="EMPTY")
          animate(attributeName="stroke-dashoffset" v-bind="A.l1" repeatCount="indefinite")
        path.cd-l1(:d="G.ring1" pathLength="100" :stroke-dasharray="DEMO_DASH" :stroke-dashoffset="EMPTY" :stroke="DEMO_RING.l1")
          animate(attributeName="stroke-dashoffset" v-bind="A.l1" repeatCount="indefinite")
          animate(attributeName="stroke" v-bind="A.l1Color" repeatCount="indefinite")
        path.cd-e2(:d="G.ring2" pathLength="100" :stroke-dasharray="DEMO_DASH" :stroke-dashoffset="EMPTY")
          animate(attributeName="stroke-dashoffset" v-bind="A.l2" repeatCount="indefinite")
        path.cd-l2(:d="G.ring2" pathLength="100" :stroke-dasharray="DEMO_DASH" :stroke-dashoffset="EMPTY" :stroke="DEMO_RING.l2")
          animate(attributeName="stroke-dashoffset" v-bind="A.l2" repeatCount="indefinite")
          animate(attributeName="stroke" v-bind="A.l2Color" repeatCount="indefinite")
      template(v-if="!compact")
        //- the shot: small → medium → big beside the ring; let go, it flies
        path.cd-streak(:d="G.flight" pathLength="100" stroke-dasharray="40 200" stroke-dashoffset="40" opacity="0")
          animate(attributeName="stroke-dashoffset" v-bind="A.streak" repeatCount="indefinite")
          animate(attributeName="opacity" v-bind="A.streakO" repeatCount="indefinite")
        g.cd-shot
          animateTransform(attributeName="transform" type="translate" v-bind="A.fly" repeatCount="indefinite")
          circle.cd-halo(:cx="G.orb.x" :cy="G.orb.y" r="0" :fill="`url(#${uid}-lh)`")
            animate(attributeName="r" v-bind="A.halo" repeatCount="indefinite")
          circle.cd-core(:cx="G.orb.x" :cy="G.orb.y" r="0" :fill="DEMO_SHOT.pellet[0]")
            animate(attributeName="r" v-bind="A.core" repeatCount="indefinite")
            animate(attributeName="fill" v-bind="A.coreColor" repeatCount="indefinite")
        //- …and bursts on the target
        g(:transform="`translate(${G.target.x} ${G.target.y})`")
          circle.cd-flash(r="4" opacity="0")
            animate(attributeName="r" v-bind="A.flashR" repeatCount="indefinite")
            animate(attributeName="opacity" v-bind="A.flashO" repeatCount="indefinite")
          circle.cd-burst(r="6" opacity="0")
            animate(attributeName="r" v-bind="A.burstR" repeatCount="indefinite")
            animate(attributeName="opacity" v-bind="A.burstO" repeatCount="indefinite")
          g(opacity="0")
            animate(attributeName="opacity" v-bind="A.sparksO" repeatCount="indefinite")
            g
              animateTransform(attributeName="transform" type="scale" v-bind="A.sparks" repeatCount="indefinite")
              path.cd-sparks(:d="DEMO_SPARKS")

    //- ── After a wrong try, once: a quick tap, and its small pellet skips
    //- off the target (the card shakes as it does), then the film again. ──
    svg.cd.cd-clip(v-else :key="clip" ref="clipSvg" :viewBox="box" aria-hidden="true")
      circle.cd-track(:cx="G.press.x" :cy="G.press.y" :r="DEMO_R1")
      template(v-if="device === 'touch'")
        circle.cd-ripple(:cx="G.tapAt.x" :cy="G.tapAt.y" r="4" opacity="0")
          animate(attributeName="r" v-bind="C.rippleR" fill="freeze")
          animate(attributeName="opacity" v-bind="C.rippleO" fill="freeze")
        g
          animateTransform(attributeName="transform" type="translate" v-bind="C.finger" fill="freeze")
          g(:transform="G.hand")
            g.hand-outline
              rect(v-for="(r, i) in HAND" :key="`o${i}`" v-bind="r")
            g.hand-fill
              rect(v-for="(r, i) in HAND" :key="`f${i}`" v-bind="r")
            rect.nail(x="62" y="10" width="16" height="10" rx="5")
      template(v-else)
        g(:transform="G.mouse")
          rect.body(v-bind="MOUSE_BODY")
          path.well(:d="MOUSE_BUTTONS.left.d")
          path.hot(:d="MOUSE_BUTTONS.left.d" fill="#ffd84a")
            animateTransform(attributeName="transform" type="translate" v-bind="C.button" fill="freeze")
          path.btn(:d="MOUSE_BUTTONS.right.d")
          line.seam(x1="70" y1="12" x2="70" y2="52")
          line.seam(x1="41" y1="52" x2="99" y2="52")
          rect.wheel(x="67.5" y="22" width="5" height="13" rx="2.5")
        circle.cd-ripple.on-button(:cx="G.tapAt.x" :cy="G.tapAt.y" r="4" opacity="0")
          animate(attributeName="r" v-bind="C.rippleR" fill="freeze")
          animate(attributeName="opacity" v-bind="C.rippleO" fill="freeze")
      template(v-if="!compact")
        defs
          radialGradient(:id="`${uid}-ch`")
            stop(v-for="s in HALO_STOPS" :key="s.offset" v-bind="s" :stop-color="DEMO_SHOT.pellet[1]")
        path.cd-rim(:d="G.rim" opacity="0")
          animate(attributeName="opacity" v-bind="C.rimO" fill="freeze")
        g(:transform="`translate(${G.target.x} ${G.target.y}) scale(0.7)`" opacity="0")
          animate(attributeName="opacity" v-bind="C.tinkO" fill="freeze")
          path.cd-tink(:d="DEMO_SPARKS")
        g.cd-pellet(opacity="0")
          animateTransform(attributeName="transform" type="translate" v-bind="C.pellet" fill="freeze")
          animate(attributeName="opacity" v-bind="C.pelletO" fill="freeze")
          circle.cd-halo(:cx="G.orb.x" :cy="G.orb.y" :r="DEMO_ORB.halo[0]" :fill="`url(#${uid}-ch)`")
          circle.cd-core(:cx="G.orb.x" :cy="G.orb.y" :r="DEMO_ORB.core[0]" :fill="DEMO_SHOT.pellet[0]")

    //- ── Still: reduced motion's pose (pressed, the rings well on, a big
    //- shot aimed at the target), and the player's OWN hold, which drives
    //- it frame by frame (the same charge the crosshair shows). ──
    svg.cd.cd-still(ref="stillSvg" :viewBox="box" data-state="rest" aria-hidden="true")
      defs
        radialGradient(:id="`${uid}-gs`")
          stop(offset="0" stop-color="#ffffff" stop-opacity="0.9")
          stop.cd-gs(v-for="s in GLOW_STOPS" :key="s.offset" v-bind="s")
        radialGradient(:id="`${uid}-sh`")
          stop.cd-hs(v-for="s in HALO_STOPS" :key="s.offset" v-bind="s")
      circle.cd-glow(:cx="G.press.x" :cy="G.press.y" r="56" :fill="`url(#${uid}-gs)`")
      template(v-if="device === 'touch'")
        circle.cd-dimple(:cx="G.press.x" :cy="G.press.y" r="11")
        g(:transform="G.hand")
          g.hand-outline
            rect(v-for="(r, i) in HAND" :key="`o${i}`" v-bind="r")
          g.hand-fill
            rect(v-for="(r, i) in HAND" :key="`f${i}`" v-bind="r")
          rect.nail(x="62" y="10" width="16" height="10" rx="5")
      template(v-else)
        g(:transform="G.mouse")
          rect.body(v-bind="MOUSE_BODY")
          path.well(:d="MOUSE_BUTTONS.left.d")
          path.hot.down(:d="MOUSE_BUTTONS.left.d" :transform="`translate(0 ${MOUSE_PRESS})`")
          path.btn(:d="MOUSE_BUTTONS.right.d")
          line.seam(x1="70" y1="12" x2="70" y2="52")
          line.seam(x1="41" y1="52" x2="99" y2="52")
          rect.wheel(x="67.5" y="22" width="5" height="13" rx="2.5")
      g.cd-ring
        circle.cd-track(:cx="G.press.x" :cy="G.press.y" :r="DEMO_R1")
        path.cd-e1(:d="G.ring1" pathLength="100" :stroke-dasharray="DEMO_DASH")
        path.cd-l1(:d="G.ring1" pathLength="100" :stroke-dasharray="DEMO_DASH")
        path.cd-e2(:d="G.ring2" pathLength="100" :stroke-dasharray="DEMO_DASH")
        path.cd-l2(:d="G.ring2" pathLength="100" :stroke-dasharray="DEMO_DASH")
      template(v-if="!compact")
        path.cd-trail(:d="G.flight")
        g.cd-orb
          circle.cd-halo(:cx="G.orb.x" :cy="G.orb.y" :r="DEMO_ORB.halo[2]" :fill="`url(#${uid}-sh)`")
          circle.cd-core(:cx="G.orb.x" :cy="G.orb.y" :r="DEMO_ORB.core[2]")
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import { addHudTicker } from '@/game/state/hud'
import { currentMission } from '@/game/boot'
import { chargeInfo } from '@/game/sim/stats'
import {
  DEMO_DASH, DEMO_ORB, DEMO_R1, DEMO_RING, DEMO_SHOT, DEMO_SPARKS, EMPTY, HAND, MOUSE_BODY, MOUSE_BUTTONS,
  MOUSE_PRESS, chargeDemo, type DemoAim, type DemoDevice
} from './glyphGeometry'

/**
 * The charge lesson's wordless demo (see `glyphGeometry.ts`, "The charge
 * lesson's demo"): a looping film of the charged shot, drawn the way the real
 * control works — a finger held on the play area (touch has no fire button),
 * or the mouse's left button held down.
 *
 * Three drawings, one shown at a time:
 *   • the LOOP (SMIL, stage timings from `sim/stats.ts`);
 *   • the CLIP after a wrong try (`clip` > 0, keyed so each try replays it):
 *     a quick tap whose small pellet skips off the target;
 *   • the STILL, for reduced motion — and, while the player really holds fire,
 *     driven by that charge (the crosshair's own numbers), so the lesson
 *     mirrors their hold. Letting go restarts the loop.
 * The live part writes a few custom properties per frame, never through Vue.
 */
const props = withDefaults(defineProps<{
  device: DemoDevice
  /** Where the target is: the drone above the card, the crate below it. */
  aim?: DemoAim
  /** The edge bubble's cut: the input and its rings only. */
  compact?: boolean
  /** > 0: the quick-tap clip (a new value replays it); 0: the loop. */
  clip?: number
}>(), { aim: 'up', compact: false, clip: 0 })

const G = computed(() => chargeDemo(props.device, props.aim))
const A = computed(() => G.value.loop)
const C = computed(() => G.value.clip)
const box = computed(() => props.compact ? G.value.compactViewBox : G.value.viewBox)
const uid = `cd-${useId()}`

/** Soft light, toon-bright: a white-hot middle, the stage's colour, then a
 *  falloff to nothing. */
const GLOW_STOPS = [
  { offset: '0.3', 'stop-opacity': '0.95' },
  { offset: '0.6', 'stop-opacity': '0.7' },
  { offset: '1', 'stop-opacity': '0' }
]
const HALO_STOPS = [
  { offset: '0.35', 'stop-opacity': '1' },
  { offset: '0.6', 'stop-opacity': '0.75' },
  { offset: '1', 'stop-opacity': '0' }
]

/** The palette as custom properties, from the same constants the SMIL uses
 *  (SMIL cannot swap a fill between gradients: stop colours move instead). */
const COLORS = {
  '--s0-glow': DEMO_SHOT.pellet[1],
  '--s1-glow': DEMO_SHOT.l1[1],
  '--s2-glow': DEMO_SHOT.l2[1],
  '--sp-glow': DEMO_SHOT.perfect[1],
  '--c-l1': DEMO_RING.l1,
  '--c-l2': DEMO_RING.l2,
  '--c-full': DEMO_RING.full,
  '--c-full2': DEMO_RING.full2,
  '--c-perfect': DEMO_RING.perfect,
  '--s0-core': DEMO_SHOT.pellet[0],
  '--s1-core': DEMO_SHOT.l1[0],
  '--s2-core': DEMO_SHOT.l2[0],
  '--sp-core': DEMO_SHOT.perfect[0]
}

const root = ref<HTMLElement | null>(null)
const loopSvg = ref<SVGSVGElement | null>(null)
const clipSvg = ref<SVGSVGElement | null>(null)
const stillSvg = ref<SVGSVGElement | null>(null)

/** A (re)mounted drawing starts its film from the top. */
const rewind = (svg: SVGSVGElement | null): void => {
  if (svg && typeof svg.setCurrentTime === 'function') svg.setCurrentTime(0)
}
watch(() => props.clip, () => nextTick(() => rewind(props.clip ? clipSvg.value : loopSvg.value)))

// ── Live: the player's own hold ──
const [core0, core1, core2] = DEMO_ORB.core
/** The still's glow is drawn at r 56; the live one grows to it. */
const GLOW_R = 56
let live = false
let clock = 0
let off: (() => void) | null = null

const LIVE_PROPS = ['--l1', '--l2', '--orb', '--glow', '--glow-s'] as const

const tick = (dt: number): void => {
  clock += dt
  const el = root.value
  const s = stillSvg.value
  if (!el || !s) return
  const m = currentMission()
  const c = m?.combat
  // As the crosshair: its ring shows past 12 % of level 1 while charging.
  const info = m && c?.charging ? chargeInfo(c.charge, m.stats) : null
  const on = info !== null && info.toL1 > 0.12
  if (on !== live) {
    live = on
    el.classList.toggle('live', on)
    if (!on) {
      for (const p of LIVE_PROPS) s.style.removeProperty(p)
      s.dataset.state = 'rest'
      rewind(loopSvg.value)
    }
  }
  if (!info || !on) return
  const lv = info.level
  s.style.setProperty('--l1', String(EMPTY * (1 - info.toL1)))
  s.style.setProperty('--l2', String(EMPTY * (1 - info.toL2)))
  const core = lv === 0 ? core0 + info.toL1 : lv === 1 ? core1 + info.toL2 : core2
  s.style.setProperty('--orb', String(core / core2))
  const glow = lv === 0 ? 0.2 + 0.1 * info.toL1 : lv === 1 ? 0.45 + 0.1 * info.toL2 : info.perfect ? 0.95 : 0.85
  const glowR = lv === 0 ? 14 + 14 * info.toL1 : lv === 1 ? 36 + 4 * info.toL2 : info.perfect ? 56 : 50
  s.style.setProperty('--glow', String(glow))
  s.style.setProperty('--glow-s', String(glowR / GLOW_R))
  // The crosshair's states, its 24 Hz flicker at full included.
  s.dataset.state = lv === 0 ? 's0' : lv === 1 ? 's1' : info.perfect ? 'perfect' : Math.floor(clock * 24) % 2 === 0 ? 'full' : 'full2'
}

onMounted(() => {
  off = addHudTicker(tick)
  rewind(props.clip ? clipSvg.value : loopSvg.value)
})
onUnmounted(() => off?.())
</script>

<style scoped lang="sass">
.charge-demo
  position: relative
  width: 100%
  height: 100%
.cd
  display: block
  width: 100%
  height: 100%
  overflow: visible
// One drawing at a time: the film (or its clip); the still for the player's
// own hold, and for reduced motion.
.cd-still
  display: none
.live
  .cd-loop, .cd-clip
    display: none
  .cd-still
    display: block
  .cd-trail
    display: none

// ── The hand and the mouse (InputGlyph's toon drawing) ──
.hand-outline rect
  fill: #141a33
  stroke: #141a33
  stroke-width: 9
.hand-fill rect
  fill: #f4f7ff
.nail
  fill: #dfe7ff
.body
  fill: #f4f7ff
  stroke: #141a33
  stroke-width: 4
.btn
  fill: transparent
.hot
  stroke: #141a33
  stroke-width: 3
  stroke-linejoin: round
  &.down
    fill: #f0ae22
.well
  fill: #141a33
.seam
  stroke: #141a33
  stroke-width: 3
.wheel
  fill: #c3cbe2
  stroke: #141a33
  stroke-width: 2

// ── The press ──
.cd-dimple
  fill: rgba(244, 247, 255, 0.45)
  stroke: #ffffff
  stroke-width: 2
.cd-ripple
  fill: none
  stroke: #ffffff
  stroke-width: 3.5
  &.on-button
    stroke: #141a33
    stroke-width: 2.5

// ── The crosshair's rings (navy edges under the colours, for any backdrop) ──
.cd-track
  fill: none
  stroke: rgba(255, 255, 255, 0.3)
  stroke-width: 4
.cd-e1, .cd-l1, .cd-e2, .cd-l2
  fill: none
  stroke-linecap: round
.cd-e1
  stroke: #141a33
  stroke-width: 10
.cd-l1
  stroke-width: 6
.cd-e2
  stroke: #141a33
  stroke-width: 9
.cd-l2
  stroke-width: 5

// ── The shot and its burst ──
.cd-core
  stroke: #141a33
  stroke-width: 2.5
.cd-streak
  fill: none
  stroke: var(--c-perfect)
  stroke-width: 10
  stroke-linecap: round
.cd-flash
  fill: #ffffff
.cd-burst
  fill: none
  stroke: var(--c-perfect)
  stroke-width: 5
.cd-sparks
  fill: none
  stroke: #ffffff
  stroke-width: 4
  stroke-linecap: round
// The quick tap's pellet skipping off: the target's skin flares, it tinks.
.cd-rim
  fill: none
  stroke: #7ff4ff
  stroke-width: 5
  stroke-linecap: round
.cd-tink
  fill: none
  stroke: #ffffff
  stroke-width: 3.5
  stroke-linecap: round

// ── The still: rest pose by default, the live charge when it is set ──
.cd-still
  --l1: 0
  --l2: 25
  --orb: 0.85
  --glow: 0.5
  --glow-s: 0.9
  .cd-e1, .cd-l1
    stroke-dashoffset: var(--l1)
  .cd-e2, .cd-l2
    stroke-dashoffset: var(--l2)
  .cd-l1
    stroke: var(--c-l1)
  .cd-l2
    stroke: var(--c-l2)
  .cd-glow
    opacity: var(--glow)
    transform: scale(var(--glow-s))
    transform-box: fill-box
    transform-origin: center
  .cd-gs
    stop-color: var(--c-l2)
  .cd-orb
    transform: scale(var(--orb))
    transform-box: fill-box
    transform-origin: center
  .cd-core
    fill: var(--s2-core)
  .cd-hs
    stop-color: var(--s2-glow)
  &[data-state='s0']
    .cd-gs
      stop-color: var(--c-l1)
    .cd-core
      fill: var(--s0-core)
    .cd-hs
      stop-color: var(--s0-glow)
  &[data-state='s1']
    .cd-core
      fill: var(--s1-core)
    .cd-hs
      stop-color: var(--s1-glow)
  &[data-state='full'], &[data-state='full2']
    .cd-gs
      stop-color: var(--c-full)
  &[data-state='full'] .cd-l2
    stroke: var(--c-full)
  &[data-state='full2'] .cd-l2
    stroke: var(--c-full2)
  &[data-state='perfect']
    .cd-l1, .cd-l2, .cd-gs
      stroke: var(--c-perfect)
      stop-color: var(--c-perfect)
    .cd-core
      fill: var(--sp-core)
    .cd-hs
      stop-color: var(--sp-glow)
// The rest pose's aim: a dotted line from the shot to the target.
.cd-trail
  fill: none
  stroke: #ffffff
  stroke-width: 4
  stroke-linecap: round
  stroke-dasharray: 1 9
  opacity: 0.8

// Reduced motion: the still pose, its glow and shot breathing slowly — no
// motion, only light.
@media (prefers-reduced-motion: reduce)
  .cd-loop, .cd-clip
    display: none
  .cd-still
    display: block
  .charge-demo:not(.live)
    .cd-still .cd-glow, .cd-still .cd-halo
      animation: cd-breathe 3.2s ease-in-out infinite
@keyframes cd-breathe
  50%
    opacity: 0.25
</style>
