<template lang="pug">
  //- The nudges drawn over the screen (`game/coach/nudge.ts`): wordless, one at a time.
  div.nudges(:class="{ 'is-idle': !onboard.nudge }" aria-hidden="true")
    //- The suggested road on the world map, lit for a few seconds.
    svg.nudges__lines
      path.nudges__road(ref="roadEl")
    //- An arrow at the screen's edge toward a goal out of view.
    div.nudges__edge(ref="edgeEl")
      span.nudges__edge-disc
        GameIcon(:name="edgeIcon")
      span.nudges__edge-arrow
    //- On the map: an arrow at the hero's feet, pointing the way.
    div.nudges__way(ref="wayEl")
      span.nudges__way-arrow
</template>

<script setup lang="ts">
/**
 * ─── The nudges over the screen (roadmap #69) ────────────────────────────────
 *
 * Draws the one nudge the scheduler has up (`onboard.nudge`):
 *
 *   bounce   the element itself hops (`data-nudge="bounce"`, the shared
 *            attention-bounce) or, with reduced motion, glows
 *            (`data-nudge="glow"`). The mark is an attribute, so the element's
 *            own classes, written by Vue, never wipe it;
 *   edge     a gold disc with the goal's icon at the edge of the screen, a
 *            pointer on its rim toward the goal, leaning that way;
 *   mapWay   the next place's landmark hops (as a bounce), an arrow at the
 *            hero's feet points at it, and the road there lights up.
 *
 * Nothing here takes a pointer. Positions are style writes on an animation
 * frame of its own, and nothing is done at all while no nudge is up.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onboard } from '@/game/coach/state'
import { nudgeWorld } from '@/game/coach/world'
import { profile } from '@/game/state/profile'
import { MAP, type NodeId } from '@/game/data/zones'
import { isNodeOpen } from '@/game/state/profile'
import { MAP_H, MAP_W, type Pt } from '@/components/screens/map/geo'
import { routeBetween, routeLine } from '@/components/screens/map/roads'
import GameIcon from '@/components/icons/GameIcon.vue'
import type { GameIconName } from '@/components/icons/iconNames'

const roadEl = ref<SVGPathElement | null>(null)
const edgeEl = ref<HTMLElement | null>(null)
const wayEl = ref<HTMLElement | null>(null)

const edgeIcon = computed<GameIconName>(() => {
  const g = onboard.goal?.id
  return g === 'boss' ? 'skull' : g === 'trainer' ? 'chat' : 'sword'
})

// ── Marks on elements ────────────────────────────────────────────────────────
let marked: HTMLElement | null = null
const unmark = (): void => {
  if (marked) marked.removeAttribute('data-nudge')
  marked = null
}
const markEl = (sel: string, style: string): void => {
  const el = sel ? document.querySelector<HTMLElement>(sel) : null
  if (el !== marked) unmark()
  if (!el) return
  if (el.getAttribute('data-nudge') !== style) el.setAttribute('data-nudge', style)
  marked = el
}

// ── The road on the map ──────────────────────────────────────────────────────
let roadFor = ''
let roadPts: Pt[] = []
/** The road from the place nearest the hero to the goal, in sheet units. */
const roadTo = (place: string): Pt[] => {
  const pos = profile.world.pos
  const hx = (pos?.[0] ?? 0.5) * MAP_W
  const hy = (pos?.[1] ?? 0.5) * MAP_H
  let near: NodeId = MAP[0]!.id
  let nd = Infinity
  for (const n of MAP) {
    if (!isNodeOpen(n.id)) continue
    const d = Math.hypot(n.at[0] * MAP_W - hx, n.at[1] * MAP_H - hy)
    if (d < nd) { nd = d; near = n.id }
  }
  const line = routeLine(routeBetween(near, place as NodeId, isNodeOpen))
  return [[hx, hy], ...line]
}

const hide = (el: HTMLElement | SVGElement | null): void => { if (el) el.style.opacity = '0' }

let raf = 0
let fade = 0
let last = 0
const frame = (): void => {
  raf = requestAnimationFrame(frame)
  const now = performance.now()
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 0
  last = now
  const n = onboard.nudge
  if (!n) {
    unmark()
    if (fade > 0) { fade = 0; hide(edgeEl.value); hide(wayEl.value); hide(roadEl.value) }
    roadFor = ''
    return
  }
  fade = Math.min(1, fade + dt * 3)
  if (n.kind === 'bounce' || n.kind === 'mapWay') markEl(n.sel, n.style)
  else unmark()

  // ── The edge arrow ──
  const edge = edgeEl.value
  if (edge) {
    if (n.kind === 'edge' && nudgeWorld.has) {
      const w = innerWidth
      const h = innerHeight
      const cx = w / 2
      const cy = h / 2
      const dx = nudgeWorld.sx - nudgeWorld.hx
      const dy = nudgeWorld.sy - nudgeWorld.hy
      const ang = Math.atan2(dy, dx)
      // Out from the middle along the way to the goal, stopped at a margin
      // inside the screen and clear of the HUD's top and bottom rows.
      const top = (document.querySelector('.hud__top')?.getBoundingClientRect().bottom ?? h * 0.2) + 36
      const bottom = Math.min(document.querySelector('.hud__br')?.getBoundingClientRect().top ?? h * 0.78, document.querySelector('.hud__bl')?.getBoundingClientRect().top ?? h * 0.78) - 36
      const m = Math.min(w, h) * 0.1
      const kx = Math.abs(Math.cos(ang)) > 1e-3 ? (w / 2 - m) / Math.abs(Math.cos(ang)) : Infinity
      const ky = Math.abs(Math.sin(ang)) > 1e-3 ? (h / 2 - m) / Math.abs(Math.sin(ang)) : Infinity
      const k = Math.min(kx, ky)
      const x = cx + Math.cos(ang) * k
      let y = Math.max(Math.min(top, bottom), Math.min(Math.max(top, bottom), cy + Math.sin(ang) * k))
      let xx = x
      // On a short screen the band is narrow: never over the hero himself —
      // slide sideways, the way the goal lies, until he is clear.
      const clear = Math.min(w, h) * 0.24
      if (Math.hypot(xx - nudgeWorld.hx, y - nudgeWorld.hy) < clear) {
        const side = Math.cos(ang) >= 0 ? 1 : -1
        xx = Math.max(m, Math.min(w - m, nudgeWorld.hx + side * clear))
        if (Math.hypot(xx - nudgeWorld.hx, y - nudgeWorld.hy) < clear * 0.8) y = Math.max(Math.min(top, bottom), nudgeWorld.hy - clear)
      }
      edge.style.opacity = String(fade)
      edge.style.transform = `translate(${xx.toFixed(1)}px, ${y.toFixed(1)}px)`
      // The pointer on its rim aims from where the disc stands to the goal.
      edge.style.setProperty('--ang', `${Math.atan2(nudgeWorld.sy - y, nudgeWorld.sx - xx).toFixed(3)}rad`)
    } else hide(edge)
  }

  // ── The map: the arrow at the hero and the lit road ──
  const way = wayEl.value
  const road = roadEl.value
  if (n.kind === 'mapWay' && n.place) {
    const map = document.querySelector('.wmap__map')?.getBoundingClientRect()
    const hero = document.querySelector('.wmap__hero')?.getBoundingClientRect()
    const node = document.querySelector(`.node[data-node="${n.place}"]`)?.getBoundingClientRect()
    if (map && hero && node && road && way) {
      if (roadFor !== n.place) { roadFor = n.place; roadPts = roadTo(n.place) }
      const sx = (p: Pt): number => map.left + (p[0] / MAP_W) * map.width
      const sy = (p: Pt): number => map.top + (p[1] / MAP_H) * map.height
      road.setAttribute('d', roadPts.map((p, i) => `${i ? 'L' : 'M'}${sx(p).toFixed(1)} ${sy(p).toFixed(1)}`).join(' '))
      road.style.opacity = String(fade)
      const hx = hero.left + hero.width / 2
      const hy = hero.bottom - hero.height * 0.15
      const ang = Math.atan2(node.top + node.height / 2 - hy, node.left + node.width / 2 - hx)
      way.style.opacity = String(fade)
      way.style.transform = `translate(${hx.toFixed(1)}px, ${hy.toFixed(1)}px)`
      way.style.setProperty('--ang', `${ang.toFixed(3)}rad`)
    }
  } else { hide(way); hide(road); roadFor = '' }
}

onMounted(() => { raf = requestAnimationFrame(frame) })
onUnmounted(() => { cancelAnimationFrame(raf); unmark() })
</script>

<style scoped lang="sass">
.nudges
  position: fixed
  inset: 0
  z-index: calc(var(--bc-z-hud) + 5)
  pointer-events: none
  overflow: hidden
// Nothing up: hidden, and every loop paused (no cost per frame).
.nudges.is-idle
  visibility: hidden
  *
    animation-play-state: paused !important
.nudges__lines
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  pointer-events: none
  overflow: hidden
// The suggested road: a bright dotted line that walks toward the place.
.nudges__road
  fill: none
  stroke: var(--bc-paper-hi)
  stroke-width: 6
  stroke-linecap: round
  stroke-linejoin: round
  stroke-dasharray: 2 13
  opacity: 0
  filter: drop-shadow(0 0 4px var(--bc-gold)) drop-shadow(0 2px 0 var(--bc-ink))
  animation: nudge-road 0.8s linear infinite
// The edge arrow: a gold disc with the goal's icon, leaning toward it.
.nudges__edge
  --s: clamp(2.6rem, 11vmin, 3.6rem)
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  opacity: 0
  will-change: transform
.nudges__edge-disc
  position: absolute
  left: calc(var(--s) * -0.5)
  top: calc(var(--s) * -0.5)
  width: var(--s)
  height: var(--s)
  display: grid
  place-items: center
  border-radius: 50%
  border: 3px solid var(--bc-ink)
  background: radial-gradient(circle at 50% 35%, var(--bc-paper-hi) 0, var(--bc-gold) 55%, var(--bc-gold-lo) 100%)
  box-shadow: 0 3px 0 rgba(var(--bc-ink-rgb), 0.55), 0 0 0.9rem color-mix(in srgb, var(--bc-gold) 70%, transparent)
  color: var(--bc-ink)
  animation: nudge-lean 1s ease-in-out infinite
  :deep(svg), :deep(img)
    width: 58%
    height: 58%
.nudges__edge-arrow, .nudges__way-arrow
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  transform: rotate(var(--ang, 0rad)) translateX(calc(var(--s, 3rem) * 0.66))
  &::before
    content: ''
    position: absolute
    left: -0.5rem
    top: -0.75rem
    border-left: 1.15rem solid var(--bc-gold)
    border-top: 0.75rem solid transparent
    border-bottom: 0.75rem solid transparent
    filter: drop-shadow(1px 0 0 var(--bc-ink)) drop-shadow(-1px 0 0 var(--bc-ink)) drop-shadow(0 1px 0 var(--bc-ink)) drop-shadow(0 -1px 0 var(--bc-ink))
.nudges__edge-arrow
  animation: nudge-poke 1s ease-in-out infinite
// The map: an arrow at the hero's feet.
.nudges__way
  --s: clamp(2.6rem, 10vmin, 3.4rem)
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  opacity: 0
.nudges__way-arrow
  animation: nudge-poke 0.9s ease-in-out infinite
@keyframes nudge-road
  to
    stroke-dashoffset: -15
@keyframes nudge-lean
  0%, 100%
    scale: 1
  50%
    scale: 1.1
@keyframes nudge-poke
  0%, 100%
    translate: 0 0
  50%
    translate: calc(cos(var(--ang, 0rad)) * 0.4rem) calc(sin(var(--ang, 0rad)) * 0.4rem)
@media (prefers-reduced-motion: reduce)
  .nudges__road, .nudges__edge-disc, .nudges__edge-arrow, .nudges__way-arrow
    animation: none
</style>

<style lang="sass">
// The mark the nudges put on a thing to use (`data-nudge`): it hops with the
// game's shared attention bounce and a warm glow; with reduced motion it only
// glows. Global: the elements belong to other components.
[data-nudge="bounce"]
  animation: attention-bounce 1.1s infinite ease-in-out !important
  filter: drop-shadow(0 0 0.45rem var(--bc-gold)) drop-shadow(0 0 0.15rem var(--bc-paper-hi)) !important
[data-nudge="glow"]
  filter: drop-shadow(0 0 0.55rem var(--bc-gold)) drop-shadow(0 0 0.2rem var(--bc-paper-hi)) !important
@media (prefers-reduced-motion: reduce)
  [data-nudge="bounce"]
    animation: none !important
</style>
