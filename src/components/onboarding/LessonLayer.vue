<template lang="pug">
  Teleport(to="body")
    div.lessons(:class="[`lessons--${hud.device}`, { 'is-idle': idle }]" aria-live="polite")
      svg.lessons__lines(aria-hidden="true")
        path.lessons__trail(ref="trailEl")
      span.lessons__glow(ref="glowEl" aria-hidden="true")
      span.lessons__ring(v-for="n in RING_POOL" :key="n" :ref="(el) => setRing(el, n - 1)" aria-hidden="true")
      div.lessons__hand(
        ref="handEl"
        :class="{ 'is-flip': flip, 'is-mirror': mirror, 'is-drag': shape.kind === 'drag' }"
        role="img"
        :aria-label="label"
      )
        //- What the hand carries across (a drag): the thing itself, ghosted.
        span.lessons__ghost(v-if="shape.ghost" aria-hidden="true")
          ItemIcon(v-if="shape.ghost.item" :id="shape.ghost.item")
          SkillIcon(v-else-if="shape.ghost.skill" :id="shape.ghost.skill")
        //- A finger, or (with a mouse) the pointer with the mouse beside it.
        span.lessons__finger(v-if="hud.device === 'touch'" aria-hidden="true")
          InputGlyph(kind="finger" mode="tap")
        template(v-else)
          svg.lessons__cursor(viewBox="0 0 40 52" aria-hidden="true" focusable="false")
            path(d="M4 3 L4 40 L13.5 31.5 L20 47 L27 44 L20.5 29 L33 28.5 Z")
          span.lessons__mouse(aria-hidden="true")
            InputGlyph(kind="mouse" button="left" :click="shape.kind !== 'drag'" :hold="shape.kind === 'drag'")
        span.lessons__pip(aria-hidden="true")
          i(:class="{ on: popping }")
      //- Done: a green tick pops where the lesson was.
      span.lessons__done(v-if="popping" ref="doneEl" :key="onboard.doneN" aria-hidden="true")
        GameIcon(name="check")
</template>

<script setup lang="ts">
/**
 * ─── The feature lessons over the screens (roadmap #52) ──────────────────────
 *
 * Draws the one feature lesson the pacing has chosen (`coach/onboarding.ts`)
 * where its action happens, wordlessly:
 *
 *   tap    a ring breathes round the button and a finger taps it (with a
 *          mouse: the pointer on it, the mouse beside it clicking);
 *   drag   a ghost of the item or skill rides a finger (a held mouse) from
 *          where it is to where it goes, drawing a dotted trail, and the
 *          socket it goes in breathes;
 *   glow   the part of the screen to read (the green and red numbers of a
 *          comparison, a price) lights softly.
 *
 * Done: one pip fills green and a tick pops. Nothing here times out, and
 * nothing takes a pointer (`pointer-events: none` everywhere): the player
 * presses the real thing under the drawing.
 *
 * It runs on its own animation frame — the game loop stands still under a
 * window, which is where most of these lessons are — and it is also what
 * ticks the pacing. Positions are direct style writes; the reactive part is
 * only the lesson's shape (which glyph, which ghost).
 */
import { computed, onMounted, onUnmounted, reactive, ref, shallowRef, watch, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud } from '@/game/state/hud'
import { onboard } from '@/game/coach/state'
import { currentStep, installOnboarding, tickOnboarding } from '@/game/coach/onboarding'
import type { Ghost, Step } from '@/game/coach/features'
import InputGlyph from '@/components/glyphs/InputGlyph.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'
import SkillIcon from '@/components/art/SkillIcon.vue'
import GameIcon from '@/components/icons/GameIcon.vue'

const { t } = useI18n()

const RING_POOL = 6
const label = computed(() => (onboard.lesson ? t(`coach.${onboard.lesson}.${hud.device}`) : ''))

/** The lesson's shape: what to draw (positions are per frame). */
const shape = reactive<{ kind: '' | Step['kind']; ghost: Ghost | null }>({ kind: '', ghost: null })
/** The hand reaches down from above (no room below), or in from the left. */
const flip = ref(false)
const mirror = ref(false)
const popping = ref(false)

const handEl = ref<HTMLElement | null>(null)
/** Nothing to show: the layer is hidden and its loops paused, so six
 *  breathing rings and a tapping finger at opacity 0 cost no frame. */
const idle = ref(false)
const setIdle = (on: boolean): void => {
  if (idle.value !== on) idle.value = on
}
const glowEl = ref<HTMLElement | null>(null)
const trailEl = ref<SVGPathElement | null>(null)
const doneEl = shallowRef<HTMLElement | null>(null)
const rings: Array<HTMLElement | null> = new Array(RING_POOL).fill(null)
const setRing = (el: Element | ComponentPublicInstance | null, i: number): void => { rings[i] = el as HTMLElement | null }

const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

// ── Finding the things to point at ───────────────────────────────────────────
const pick = (sel: string, last = false): HTMLElement | null => {
  if (!last) return document.querySelector<HTMLElement>(sel)
  const all = document.querySelectorAll<HTMLElement>(sel)
  return all.length ? all[all.length - 1]! : null
}
/** Seen on the screen (laid out, inside the window)? */
const onScreen = (r: DOMRect): boolean => r.width > 1 && r.height > 1 && r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight

/** A thing scrolled out of its list is brought into view, once. */
const scrolled = new WeakSet<HTMLElement>()
const bringIntoView = (el: HTMLElement): void => {
  if (scrolled.has(el)) return
  scrolled.add(el)
  try { el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduced ? 'auto' : 'smooth' }) } catch { /* old engines */ }
}

/** The rounding of a thing's own corners, so its ring follows its shape. */
const radiusOf = new WeakMap<HTMLElement, string>()
const radius = (el: HTMLElement, r: DOMRect): string => {
  let v = radiusOf.get(el)
  if (v === undefined) {
    const cs = getComputedStyle(el).borderTopLeftRadius
    const px = cs.endsWith('%') ? (parseFloat(cs) / 100) * Math.min(r.width, r.height) : parseFloat(cs) || 0
    v = px >= Math.min(r.width, r.height) * 0.45 ? '50%' : `${Math.round(px + 6)}px`
    radiusOf.set(el, v)
  }
  return v
}

const placeRing = (ring: HTMLElement | null, el: HTMLElement | null, r: DOMRect | null, soft = false): void => {
  if (!ring) return
  if (!el || !r) { ring.style.opacity = '0'; return }
  const pad = 6
  ring.style.opacity = '1'
  ring.style.transform = `translate(${(r.left - pad).toFixed(1)}px, ${(r.top - pad).toFixed(1)}px)`
  ring.style.width = `${(r.width + pad * 2).toFixed(1)}px`
  ring.style.height = `${(r.height + pad * 2).toFixed(1)}px`
  ring.style.borderRadius = radius(el, r)
  ring.classList.toggle('is-soft', soft)
}

// ── Acting out the gesture ───────────────────────────────────────────────────
/** A drag: rest on the thing, carry it over, rest on the socket, come back. */
const DRAG_PERIOD = 2.1
const dragPhase = (clock: number): number => {
  if (reduced) return 1
  const u = (clock % DRAG_PERIOD) / DRAG_PERIOD
  if (u < 0.16) return 0
  if (u < 0.7) { const k = (u - 0.16) / 0.54; return k * k * (3 - 2 * k) }
  return 1
}

/** The glyph's size, as the stylesheet sizes it. */
const glyphSize = (): number => Math.max(48, Math.min(76, Math.min(innerWidth, innerHeight) * 0.13))

let lastPoint = { x: 0, y: 0 }
const placeHand = (x: number, y: number): void => {
  const h = handEl.value
  if (!h) return
  const g = glyphSize()
  // A finger reaching up needs room under the point; at the bottom of the
  // screen it reaches down from above instead. A pointer sits left of the
  // mouse; at the right edge the two swap sides.
  flip.value = hud.device === 'touch' && y + g * 1.05 > innerHeight - 6
  mirror.value = hud.device === 'mouse' && x + g * 1.25 > innerWidth - 6
  setIdle(false)
  h.style.opacity = '1'
  h.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
  lastPoint = { x, y }
}
const hide = (): void => {
  setIdle(true)
  if (handEl.value) handEl.value.style.opacity = '0'
  if (glowEl.value) glowEl.value.style.opacity = '0'
  if (trailEl.value) trailEl.value.style.opacity = '0'
  for (const r of rings) if (r) r.style.opacity = '0'
}

const center = (r: DOMRect): { x: number; y: number } => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 })

let clock = 0
const draw = (step: Step | null): void => {
  if (!step || step.kind === 'world') { hide(); return }
  // The part to read.
  const gl = glowEl.value
  const glowTo = step.glow ? pick(step.glow) : null
  const gr = glowTo?.getBoundingClientRect() ?? null
  if (gl) {
    if (gr && onScreen(gr)) {
      gl.style.opacity = '1'
      gl.style.transform = `translate(${(gr.left - 4).toFixed(1)}px, ${(gr.top - 4).toFixed(1)}px)`
      gl.style.width = `${(gr.width + 8).toFixed(1)}px`
      gl.style.height = `${(gr.height + 8).toFixed(1)}px`
    } else gl.style.opacity = '0'
  }
  if (step.kind === 'tap') {
    const el = pick(step.at, step.last)
    const r = el?.getBoundingClientRect() ?? null
    if (!el || !r || !onScreen(r)) { if (el) bringIntoView(el); hide(); return }
    if (r.top < 0 || r.bottom > innerHeight) bringIntoView(el)
    // Every match breathes (the six "+"), the first is tapped.
    if (step.rings) {
      const all = Array.from(document.querySelectorAll<HTMLElement>(step.rings)).slice(0, RING_POOL)
      for (let i = 0; i < RING_POOL; i++) {
        const e = all[i] ?? null
        const er = e?.getBoundingClientRect() ?? null
        placeRing(rings[i]!, e, er && onScreen(er) ? er : null)
      }
    } else {
      placeRing(rings[0]!, el, r)
      for (let i = 1; i < RING_POOL; i++) placeRing(rings[i]!, null, null)
    }
    if (trailEl.value) trailEl.value.style.opacity = '0'
    const c = center(r)
    placeHand(c.x, c.y)
    return
  }
  // A drag.
  const a = pick(step.from)
  const b = pick(step.to)
  const ra = a?.getBoundingClientRect() ?? null
  const rb = b?.getBoundingClientRect() ?? null
  if (!a || !b || !ra || !rb || !onScreen(ra) || !onScreen(rb)) { if (a) bringIntoView(a); hide(); return }
  placeRing(rings[0]!, b, rb)
  placeRing(rings[1]!, a, ra, true)
  for (let i = 2; i < RING_POOL; i++) placeRing(rings[i]!, null, null)
  const p = center(ra)
  const q = center(rb)
  const k = dragPhase(clock)
  const x = p.x + (q.x - p.x) * k
  const y = p.y + (q.y - p.y) * k
  // The trail bows up a little, the way a hand carries things.
  const mx = (p.x + q.x) / 2
  const my = (p.y + q.y) / 2 - Math.hypot(q.x - p.x, q.y - p.y) * 0.12
  // On the curve, not the chord.
  const cx = (1 - k) * (1 - k) * p.x + 2 * (1 - k) * k * mx + k * k * q.x
  const cy = (1 - k) * (1 - k) * p.y + 2 * (1 - k) * k * my + k * k * q.y
  // The trail is the part of the curve travelled so far (its first `k`).
  const tr = trailEl.value
  if (tr) {
    tr.style.opacity = k > 0.02 ? '1' : '0'
    const sx = p.x + (mx - p.x) * k
    const sy = p.y + (my - p.y) * k
    tr.setAttribute('d', `M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${sx.toFixed(1)} ${sy.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`)
  }
  placeHand(Number.isFinite(cx) ? cx : x, Number.isFinite(cy) ? cy : y)
}

// ── The shape, kept reactive only when it changes ────────────────────────────
let sig = ''
const syncShape = (step: Step | null): void => {
  const s = step && step.kind !== 'world' ? `${step.kind}|${step.kind === 'drag' ? `${step.ghost.item ?? ''}${step.ghost.skill ?? ''}` : ''}` : ''
  if (s === sig) return
  sig = s
  shape.kind = step && step.kind !== 'world' ? step.kind : ''
  shape.ghost = step && step.kind === 'drag' ? step.ghost : null
}

// The success pop: where the lesson was, when it was done.
let popTimer = 0
watch(() => onboard.doneN, () => {
  popping.value = true
  window.clearTimeout(popTimer)
  popTimer = window.setTimeout(() => { popping.value = false }, 900)
  requestAnimationFrame(() => {
    const d = doneEl.value
    if (d) d.style.transform = `translate(${lastPoint.x.toFixed(1)}px, ${lastPoint.y.toFixed(1)}px)`
  })
})

let raf = 0
let last = 0
let uninstall: (() => void) | null = null
const frame = (): void => {
  raf = requestAnimationFrame(frame)
  // Wall-clock time: a frame's own stamp can run slow where frames are
  // throttled, and the pacing is about the player's seconds.
  const now = performance.now()
  const dt = last ? Math.min(1, (now - last) / 1000) : 0
  last = now
  clock += dt
  tickOnboarding(dt)
  const step = currentStep()
  syncShape(step)
  draw(step)
}

onMounted(() => {
  uninstall = installOnboarding()
  raf = requestAnimationFrame(frame)
})
onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.clearTimeout(popTimer)
  uninstall?.()
})
</script>

<style scoped lang="sass">
.lessons
  --g: clamp(3rem, 13vmin, 4.75rem)
  position: fixed
  inset: 0
  z-index: calc(var(--bc-z-modal) + 5)
  pointer-events: none
  overflow: hidden
  user-select: none
  -webkit-user-select: none
// Idle: hidden once the fades are done, every loop paused (a loop at opacity
// 0 still restyles and repaints its part of the screen each frame). The tick
// of a lesson just done still pops.
.lessons.is-idle
  visibility: hidden
  transition: visibility 0s linear 0.3s
  *:not(.lessons__done, .lessons__done *)
    animation-play-state: paused !important
  .lessons__done
    visibility: visible
.lessons__lines
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  overflow: visible
.lessons__trail
  fill: none
  stroke: #ffe066
  stroke-width: 5
  stroke-linecap: round
  stroke-dasharray: 2 12
  opacity: 0
  filter: drop-shadow(0 2px 0 #0f1a30)
  transition: opacity 160ms ease-out
// "Press this": a gold ring breathing round the real thing.
.lessons__ring
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  box-sizing: border-box
  border: 4px solid #ffd84a
  box-shadow: 0 0 0 2px #0f1a30, inset 0 0 0 2px #0f1a30, 0 0 1.1rem rgba(255, 216, 74, 0.55)
  opacity: 0
  transition: opacity 180ms ease-out
  will-change: transform
  &::after
    content: ''
    position: absolute
    inset: -4px
    border-radius: inherit
    border: 3px solid #ffd84a
    animation: lessons-breathe 1.2s ease-out infinite
  // Where a drag starts: a quieter ring.
  &.is-soft
    border-color: rgba(255, 255, 255, 0.75)
    box-shadow: 0 0 0 2px #0f1a30
    &::after
      display: none
// "Read this": a soft light round the numbers.
.lessons__glow
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  border-radius: 0.8rem
  box-shadow: 0 0 0 3px rgba(255, 233, 168, 0.95), 0 0 1.4rem 0.3rem rgba(255, 216, 74, 0.55)
  opacity: 0
  transition: opacity 220ms ease-out
  animation: lessons-glow 1.6s ease-in-out infinite
.lessons__hand
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  opacity: 0
  transition: opacity 180ms ease-out
  will-change: transform
// The carried thing, centred on the point, under the finger.
.lessons__ghost
  position: absolute
  left: calc(var(--g) * -0.42)
  top: calc(var(--g) * -0.42)
  width: calc(var(--g) * 0.84)
  height: calc(var(--g) * 0.84)
  opacity: 0.85
  filter: drop-shadow(0 0.4rem 0 rgba(15, 26, 48, 0.35))
  rotate: -6deg
  :deep(img), :deep(svg)
    width: 100%
    height: 100%
// The fingertip (at the top of the drawn hand) on the point; the hand hangs below.
.lessons__finger
  position: absolute
  left: calc(var(--g) * -0.5)
  top: calc(var(--g) * -0.12)
  width: var(--g)
  height: var(--g)
  :deep(.glyph)
    width: 100%
    height: 100%
// No room under it: the hand reaches down onto it from above.
.is-flip .lessons__finger
  top: calc(var(--g) * -0.88)
  transform: rotate(180deg) scaleX(-1)
// The pointer's tip on the point, the mouse at its heel.
.lessons__cursor
  position: absolute
  left: -0.18rem
  top: -0.12rem
  width: calc(var(--g) * 0.5)
  height: calc(var(--g) * 0.65)
  overflow: visible
  path
    fill: #f4f7ff
    stroke: #141a33
    stroke-width: 3.5
    stroke-linejoin: round
.lessons__mouse
  position: absolute
  left: calc(var(--g) * 0.36)
  top: calc(var(--g) * 0.42)
  width: calc(var(--g) * 0.95)
  height: calc(var(--g) * 0.76)
  :deep(.glyph)
    width: 100%
    height: 100%
.is-mirror
  .lessons__cursor
    transform: scaleX(-1)
    transform-origin: 0.18rem 0
  .lessons__mouse
    left: calc(var(--g) * -1.31)
// One pip: the lesson is one use long.
.lessons__pip
  position: absolute
  left: -0.4rem
  top: calc(var(--g) * 0.98)
  i
    display: block
    width: clamp(0.5rem, 2vmin, 0.7rem)
    height: clamp(0.5rem, 2vmin, 0.7rem)
    border-radius: 50%
    border: 2px solid #0f1a30
    background: rgba(255, 255, 255, 0.6)
    &.on
      background: #5dff7a
.lessons--mouse .lessons__pip
  left: calc(var(--g) * 0.7)
  top: calc(var(--g) * 1.25)
.is-flip .lessons__pip
  top: calc(var(--g) * -1.1)
.lessons__done
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  :deep(svg)
    position: absolute
    left: calc(var(--g) * -0.36)
    top: calc(var(--g) * -0.36)
    width: calc(var(--g) * 0.72)
    height: calc(var(--g) * 0.72)
    padding: 0.35rem
    box-sizing: border-box
    border-radius: 50%
    color: #ffffff
    background: #2fbf5a
    border: 3px solid #0f1a30
    box-shadow: 0 0 1.2rem #5dff7a
    animation: lessons-done 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both
@keyframes lessons-breathe
  0%
    transform: scale(1)
    opacity: 0.95
  100%
    transform: scale(1.28)
    opacity: 0
@keyframes lessons-glow
  0%, 100%
    filter: brightness(0.9)
  50%
    filter: brightness(1.25)
@keyframes lessons-done
  0%
    transform: scale(0)
    opacity: 0
  30%
    transform: scale(1.25)
    opacity: 1
  70%
    transform: scale(1)
    opacity: 1
  100%
    transform: scale(1.05) translateY(-0.6rem)
    opacity: 0
@media (prefers-reduced-motion: reduce)
  .lessons__ring::after, .lessons__glow
    animation: none
</style>
