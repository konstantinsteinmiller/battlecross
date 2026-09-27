<template lang="pug">
  div.dmg-layer(ref="rootEl" aria-hidden="true")
    div.dmg-safe(ref="safeEl")
    div.dmg-edges(ref="edgesEl")
    div.dmg-ring(ref="ringEl")
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { addHudTicker, hud } from '@/game/state/hud'
import { currentMission } from '@/game/boot'
import { bearingOf, damageFeed, damageView, markerAlpha, unseen, MARKER_POOL } from '@/game/state/damageFeed'

/**
 * Where the damage comes from (`state/damageFeed.ts`), without a word: a red
 * wedge on a ring round the crosshair at the source's bearing — ahead at the
 * top, behind at the bottom — re-aimed every frame as Flux turns, held a
 * moment and faded out. Size and strength follow the damage; a source off
 * the screen or behind draws a stronger wedge and a red bloom on the screen's
 * edge on its side, where the eye already is when the view is busy.
 *
 * A fixed pool of elements and direct style writes from the HUD ticker, like
 * the floating numbers: nothing reactive on the per-frame path, a style is
 * only written when it visibly changes, and a marker's shape is only rebuilt
 * when a hit lands.
 */
const rootEl = ref<HTMLElement | null>(null)
const safeEl = ref<HTMLElement | null>(null)
const edgesEl = ref<HTMLElement | null>(null)
const ringEl = ref<HTMLElement | null>(null)

const SVG = 'http://www.w3.org/2000/svg'
/** The wedge's middle radius in the ring's viewBox (-100..100). */
const RM = 80
/** Seconds of the pop a fresh hit lands with. */
const POP = 0.12

interface View {
  arc: SVGSVGElement
  glow: SVGPathElement
  body: SVGPathElement
  shine: SVGPathElement
  edge: HTMLDivElement
  gen: number
  shown: boolean
  edgeOn: boolean
  // What was written last: a still marker writes nothing.
  b: number
  s: number
  o: number
  ex: number
  ey: number
  eo: number
}
const views: View[] = []

// Layout (px), refreshed on resize: the layer, its safe box, the ring.
let w = 0
let h = 0
let left = 0
let top = 0
let safeL = 0
let safeT = 0
let safeR = 0
let safeB = 0
let ringR = 0
let bloom = 0
let calm = false
let off: (() => void) | null = null

const layout = (): void => {
  const root = rootEl.value
  const safe = safeEl.value
  const ring = ringEl.value
  if (!root || !safe || !ring) return
  w = root.clientWidth
  h = root.clientHeight
  const r = root.getBoundingClientRect()
  left = r.left
  top = r.top
  safeL = safe.offsetLeft
  safeT = safe.offsetTop
  safeR = w - safeL - safe.offsetWidth
  safeB = h - safeT - safe.offsetHeight
  // Round the crosshair, clear of the notch and the screen's rim in both
  // orientations.
  const room = Math.min(h / 2 - Math.max(safeT, safeB), w / 2 - Math.max(safeL, safeR)) - 36
  ringR = Math.max(60, Math.min(Math.min(w, h) * 0.27, room))
  ring.style.width = ring.style.height = `${Math.round(ringR * 2)}px`
  bloom = Math.round(Math.min(w, h) * 0.6)
  for (const v of views) v.edge.style.width = v.edge.style.height = `${bloom}px`
}

const pt = (r: number, a: number): string => `${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)}`

/** The wedge for a hit of `strength` (0.3..1), pointing up (outward): an arc
 *  of the ring with an arrowhead on its outer edge. Built on a hit only. */
const shape = (v: View, strength: number): void => {
  const thick = 6 + 5 * strength
  const half = (((22 + 20 * strength) / 2) * Math.PI) / 180
  const tip = 6 + 7 * strength
  const ri = RM - thick / 2
  const ro = RM + thick / 2
  const k = Math.min(half * 0.5, 0.12)
  const d = `M${pt(ri, -half)} A${ri} ${ri} 0 0 1 ${pt(ri, half)} L${pt(ro, half)} A${ro} ${ro} 0 0 0 ${pt(ro, k)} ` +
    `L${pt(ro + tip, 0)} L${pt(ro, -k)} A${ro} ${ro} 0 0 0 ${pt(ro, -half)} Z`
  v.glow.setAttribute('d', d)
  v.body.setAttribute('d', d)
  const rs = ri + 2.2
  v.shine.setAttribute('d', `M${pt(rs, -half * 0.75)} A${rs} ${rs} 0 0 1 ${pt(rs, half * 0.75)}`)
}

const hide = (v: View): void => {
  if (v.shown) {
    v.arc.style.opacity = '0'
    v.shown = false
    v.o = 0
  }
  if (v.edgeOn) {
    v.edge.style.opacity = '0'
    v.edgeOn = false
    v.eo = 0
  }
}

/** Visible change thresholds: under them the element is left alone. */
const MOVE = 0.002
const FADE = 0.004
const SHIFT = 0.5

const tick = (dt: number): void => {
  damageFeed.step(dt)
  const m = currentMission()
  // Beaming out, the exit cutscene, the results: the fight is over.
  if (!m || (hud.phase !== 'play' && hud.phase !== 'dead')) {
    damageFeed.clear()
    for (const v of views) hide(v)
    return
  }
  if (w === 0) layout()
  const cam = m.camera
  const halfFov = Math.atan(Math.tan((cam.fov * Math.PI) / 360) * cam.aspect)
  damageView.halfFov = halfFov
  const p = m.player
  const cx = w / 2
  const cy = h / 2
  for (let i = 0; i < views.length; i++) {
    const mk = damageFeed.markers[i]!
    const v = views[i]!
    if (!mk.active) {
      hide(v)
      continue
    }
    if (v.gen !== mk.gen) {
      v.gen = mk.gen
      shape(v, mk.strength)
    }
    const b = bearingOf(mk.x, mk.z, p.x, p.z, p.yaw)
    const u = unseen(b, halfFov)
    const a = markerAlpha(mk.age)
    const pop = !calm && mk.age < POP ? 1 + 0.2 * (1 - mk.age / POP) : 1
    const s = (0.9 + 0.12 * mk.strength + 0.12 * u) * pop
    const o = a * (0.62 + 0.38 * u) * (0.75 + 0.25 * mk.strength)
    if (!v.shown || Math.abs(b - v.b) > MOVE || Math.abs(s - v.s) > MOVE) {
      v.arc.style.transform = `rotate(${b.toFixed(3)}rad) scale(${s.toFixed(3)})`
      v.b = b
      v.s = s
    }
    if (!v.shown || Math.abs(o - v.o) > FADE) {
      v.arc.style.opacity = o.toFixed(3)
      v.o = o
    }
    v.shown = true
    const reach = ringR * (RM / 100) * s
    const sx = Math.sin(b)
    const sy = -Math.cos(b)
    mk.sx = left + cx + sx * reach
    mk.sy = top + cy + sy * reach
    // Unseen: a bloom where the ray toward it leaves the (safe) screen.
    const eo = a * u * (0.5 + 0.5 * mk.strength)
    if (eo > 0.01) {
      const kx = Math.abs(sx) > 1e-4 ? (sx > 0 ? w - safeR - cx : cx - safeL) / Math.abs(sx) : Infinity
      const ky = Math.abs(sy) > 1e-4 ? (sy > 0 ? h - safeB - cy : cy - safeT) / Math.abs(sy) : Infinity
      const k = Math.min(kx, ky)
      const ex = cx + sx * k - bloom / 2
      const ey = cy + sy * k - bloom / 2
      if (!v.edgeOn || Math.abs(ex - v.ex) > SHIFT || Math.abs(ey - v.ey) > SHIFT) {
        v.edge.style.transform = `translate3d(${ex.toFixed(1)}px, ${ey.toFixed(1)}px, 0)`
        v.ex = ex
        v.ey = ey
      }
      if (!v.edgeOn || Math.abs(eo - v.eo) > FADE) {
        v.edge.style.opacity = eo.toFixed(3)
        v.eo = eo
      }
      v.edgeOn = true
    } else if (v.edgeOn) {
      v.edge.style.opacity = '0'
      v.edgeOn = false
      v.eo = 0
    }
  }
}

onMounted(() => {
  const ring = ringEl.value
  const edges = edgesEl.value
  if (!ring || !edges) return
  for (let i = 0; i < MARKER_POOL; i++) {
    const arc = document.createElementNS(SVG, 'svg')
    arc.setAttribute('viewBox', '-100 -100 200 200')
    arc.setAttribute('class', 'dmg-arc')
    const glow = document.createElementNS(SVG, 'path')
    glow.setAttribute('class', 'glow')
    const body = document.createElementNS(SVG, 'path')
    body.setAttribute('class', 'body')
    const shine = document.createElementNS(SVG, 'path')
    shine.setAttribute('class', 'shine')
    arc.append(glow, body, shine)
    ring.appendChild(arc)
    const edge = document.createElement('div')
    edge.className = 'dmg-edge'
    edges.appendChild(edge)
    views.push({ arc, glow, body, shine, edge, gen: -1, shown: false, edgeOn: false, b: 0, s: 0, o: 0, ex: 0, ey: 0, eo: 0 })
  }
  calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  damageFeed.clear()
  layout()
  window.addEventListener('resize', layout)
  off = addHudTicker(tick)
})
onUnmounted(() => {
  off?.()
  window.removeEventListener('resize', layout)
  damageFeed.clear()
  views.length = 0
})
</script>

<style lang="sass">
// Not scoped: the pool is built in script. Everything under `.dmg-layer`.
.dmg-layer
  position: absolute
  inset: 0
  pointer-events: none
  overflow: hidden
  .dmg-safe
    position: absolute
    top: env(safe-area-inset-top, 0px)
    right: env(safe-area-inset-right, 0px)
    bottom: env(safe-area-inset-bottom, 0px)
    left: env(safe-area-inset-left, 0px)
    visibility: hidden
  .dmg-edges
    position: absolute
    inset: 0
  .dmg-edge
    position: absolute
    left: 0
    top: 0
    border-radius: 50%
    background: radial-gradient(closest-side, rgba(255, 34, 58, 0.6), rgba(255, 34, 58, 0.24) 55%, rgba(255, 34, 58, 0) 100%)
    opacity: 0
    will-change: transform, opacity
  // Centred on the crosshair (Crosshair.vue sits at the layer's middle too).
  .dmg-ring
    position: absolute
    left: 50%
    top: 50%
    transform: translate(-50%, -50%)
  .dmg-arc
    position: absolute
    inset: 0
    width: 100%
    height: 100%
    overflow: visible
    opacity: 0
    will-change: transform, opacity
    .glow
      fill: none
      stroke: rgba(255, 40, 64, 0.45)
      stroke-width: 9
      stroke-linejoin: round
    .body
      fill: #ff2d46
      stroke: #141a33
      stroke-width: 2.4
      stroke-linejoin: round
    .shine
      fill: none
      stroke: #ffc4cc
      stroke-width: 1.8
      stroke-linecap: round
</style>
