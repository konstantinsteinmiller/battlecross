<template lang="pug">
  div.float-layer(aria-hidden="true")
    div.float-layer__flash(ref="flash")
    div.float-layer__hurt(ref="hurt")
    div.float-layer__low(:class="{ on: low }")
    div.float-layer__texts(ref="host")
    TransitionGroup.toasts(name="toast" tag="div")
      div.toast(v-for="x in toasts" :key="x.id" :class="{ 'is-up': x.up }")
        span.toast__icon(v-if="x.item")
          ItemIcon(:id="x.item")
        //- A find: its name on a band of its tier's colour.
        I18nT.toast__text(v-if="x.name" :keypath="x.key" tag="span" scope="global")
          template(#item)
            span.toast__name(:style="{ '--tier': x.tier }") {{ x.name }}
        span.toast__text(v-else) {{ x.text }}
        //- Better than what is worn in its slot: the green arrow (`data/upgrade.ts`).
        span.toast__up(v-if="x.up")
          GameIcon(name="up")
    //- A find's icon, popping out where it dropped and flying to the bag.
    div.fly(v-for="f in flies" :key="f.id" :ref="el => launch(el, f)")
      ItemIcon(:id="f.item")
</template>

<script setup lang="ts">
/**
 * Everything that pops and fades over the field: damage numbers, status
 * words, the white / red screen flashes and the toasts.
 *
 * The numbers are a fixed pool of spans driven by the Web Animations API —
 * one compositor animation per number, no per-frame style writes and no
 * reactive state. GDD §2.3 colours them: white for a normal hit, a bigger
 * gold one with a kick for a critical, green for healing, blue for mana,
 * violet for a status, red for what the hero takes, yellow for gold.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Translation as I18nT, useI18n } from 'vue-i18n'
import { addHudTicker, hud, hudEvents, type TextKind } from '@/game/state/hud'
import { currentZone } from '@/game/boot'
import ItemIcon from '@/components/art/ItemIcon.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { ITEM_BY_ID, TIER_COLOR } from '@/game/data/items'
import { isUpgrade } from '@/game/data/upgrade'
import { profile } from '@/game/state/profile'
import { fmt } from '@/utils/format'

const { t, te } = useI18n()
const host = ref<HTMLElement | null>(null)
const flash = ref<HTMLElement | null>(null)
const hurt = ref<HTMLElement | null>(null)
const low = computed(() => hud.phase === 'play' && hud.hp > 0 && hud.hp < hud.maxHp * 0.3)

interface Toast { id: number; text: string; item: string; key: string; name: string; tier: string; up: boolean }
const toasts = ref<Toast[]>([])
let toastId = 0

/** A find on its way to the bag: from (x, y) on the surface. */
interface Fly { id: number; item: string; x: number; y: number; started: boolean }
const flies = ref<Fly[]>([])
/** Where finds fly to: the bag button where there is one (a town, the map),
 *  else the hero's own medallion — in a fight the hero carries them. */
const BAG = '[data-coach="menu-inventory"]'
const HERO = '.hero-frame__face'
const launch = (el: unknown, f: Fly): void => {
  if (!(el instanceof HTMLElement) || f.started) return
  f.started = true
  const done = (): void => { flies.value = flies.value.filter(x => x.id !== f.id) }
  const layer = el.parentElement?.getBoundingClientRect()
  const goal = document.querySelector<HTMLElement>(BAG) ?? document.querySelector<HTMLElement>(HERO)
  if (!layer || !goal || reduced) { done(); return }
  const g = goal.getBoundingClientRect()
  const tx = g.left + g.width / 2 - layer.left
  const ty = g.top + g.height / 2 - layer.top
  el.style.left = `${f.x}px`
  el.style.top = `${f.y}px`
  const dx = tx - f.x
  const dy = ty - f.y
  const t0 = 'translate(-50%, -50%)'
  // Pops out of the beam with an overshoot, hangs a beat, then arcs over to the bag.
  const a = el.animate([
    { transform: `${t0} scale(0.2)`, opacity: 0, offset: 0 },
    { transform: `${t0} translate(0, -46px) scale(1.35)`, opacity: 1, offset: 0.16 },
    { transform: `${t0} translate(0, -40px) scale(1.1)`, opacity: 1, offset: 0.36 },
    { transform: `${t0} translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(0.85)`, opacity: 1, offset: 0.66 },
    { transform: `${t0} translate(${dx}px, ${dy}px) scale(0.35)`, opacity: 0.9, offset: 1 }
  ], { duration: 1250, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'both' })
  a.onfinish = () => {
    done()
    // The bag takes it: a little bump.
    goal.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' })
  }
}
const at = { x: 0, y: 0 }
const timers = new Set<ReturnType<typeof setTimeout>>()

const POOL = 40
const pool: HTMLElement[] = []
/** Each element's running animation: cancelled by hand, since `getAnimations()`
 *  forces a style recalc on every call (one per damage number). */
const running = new WeakMap<HTMLElement, Animation>()
let next = 0
const p = { x: 0, y: 0 }
const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

const SIZE: Record<TextKind, number> = { normal: 1, crit: 1.55, heal: 1.05, mana: 0.9, status: 0.82, hurt: 1.1, gold: 0.95, xp: 0.9 }

const spawn = (x: number, y: number, z: number, text: string, kind: TextKind): void => {
  const zone = currentZone()
  if (!zone || !zone.project(x, y, z, p)) return
  const el = pool[next]
  if (!el) return
  next = (next + 1) % POOL
  el.textContent = text
  el.className = `ft ft--${kind}`
  el.style.left = `${p.x}px`
  el.style.top = `${p.y}px`
  const s = SIZE[kind]
  // The GDD's curve: a pop past full size, a settle, then an arc up and out.
  const dx = (Math.random() - 0.5) * 46
  const rise = kind === 'crit' ? 78 : kind === 'status' ? 46 : 60
  const t0 = `translate(-50%, -50%)`
  running.get(el)?.cancel()
  if (reduced) {
    running.set(el, el.animate([{ opacity: 1, transform: `${t0} translate(0, -${rise * 0.4}px) scale(${s})` }, { opacity: 0, transform: `${t0} translate(0, -${rise * 0.4}px) scale(${s})` }], { duration: 700, fill: 'both' }))
    return
  }
  running.set(el, el.animate([
    { opacity: 0, transform: `${t0} scale(${s * 0.4})`, offset: 0 },
    { opacity: 1, transform: `${t0} translate(${dx * 0.15}px, -${rise * 0.18}px) scale(${s * 1.42})`, offset: 0.13 },
    { opacity: 1, transform: `${t0} translate(${dx * 0.35}px, -${rise * 0.36}px) scale(${s})`, offset: 0.3 },
    { opacity: 1, transform: `${t0} translate(${dx * 0.8}px, -${rise * 0.86}px) scale(${s})`, offset: 0.74 },
    { opacity: 0, transform: `${t0} translate(${dx}px, -${rise}px) scale(${s * 0.86})`, offset: 1 }
  ], { duration: kind === 'crit' ? 1050 : 820, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', fill: 'both' }))
}

/** A toast's parameters may themselves be message keys ("item.x.name"). */
const resolve = (params?: Record<string, string | number>): Record<string, string | number> => {
  const out: Record<string, string | number> = {}
  for (const k in params) {
    const v = params[k]!
    out[k] = typeof v === 'string' && te(v) ? t(v) : v
  }
  return out
}

const pulse = (el: HTMLElement | null, strength: number, ms: number, color?: string): void => {
  if (!el) return
  if (color) el.style.background = color
  running.get(el)?.cancel()
  running.set(el, el.animate([{ opacity: Math.min(0.85, strength) }, { opacity: 0 }], { duration: ms, easing: 'ease-out', fill: 'both' }))
}

let removeTicker: (() => void) | null = null
onMounted(() => {
  const h = host.value
  if (h) {
    for (let i = 0; i < POOL; i++) {
      const el = document.createElement('span')
      el.className = 'ft'
      el.style.opacity = '0'
      h.appendChild(el)
      pool.push(el)
    }
  }
  removeTicker = addHudTicker(() => {
    if (!hudEvents.length) return
    for (const e of hudEvents) {
      if (e.t === 'num') {
        const n = Math.max(1, Math.round(e.amount))
        const sign = e.kind === 'heal' || e.kind === 'mana' || e.kind === 'gold' || e.kind === 'xp' ? '+' : e.kind === 'hurt' ? '-' : ''
        spawn(e.x, e.y, e.z, `${sign}${fmt(n)}${e.kind === 'crit' ? '!' : ''}`, e.kind)
      } else if (e.t === 'word') {
        spawn(e.x, e.y, e.z, te(e.key) ? t(e.key) : '', e.kind)
      } else if (e.t === 'toast') {
        const id = ++toastId
        const it = e.icon ? ITEM_BY_ID[e.icon] : undefined
        const nameKey = typeof e.params?.item === 'string' ? e.params.item : ''
        toasts.value = [...toasts.value.slice(-2), {
          id, text: t(e.key, resolve(e.params)), item: e.icon ?? '', key: e.key,
          name: it && nameKey && te(nameKey) ? t(nameKey) : '',
          tier: it ? TIER_COLOR[it.tier] ?? '' : '',
          up: !!it && isUpgrade(it.id, profile.inv.equipped, profile.hero.attrs)
        }]
        const zone = currentZone()
        if (it && e.at && zone && zone.project(e.at.x, e.at.y, e.at.z, at)) {
          flies.value = [...flies.value.slice(-3), { id, item: it.id, x: at.x, y: at.y, started: false }]
        }
        const timer = setTimeout(() => {
          timers.delete(timer)
          toasts.value = toasts.value.filter(x => x.id !== id)
        }, 2800)
        timers.add(timer)
      } else if (e.t === 'flash') {
        pulse(flash.value, e.strength, 420, e.color)
      } else if (e.t === 'hurt') {
        pulse(hurt.value, 0.25 + e.strength * 0.6, 520)
      }
    }
    hudEvents.length = 0
  })
})
onUnmounted(() => {
  removeTicker?.()
  for (const timer of timers) clearTimeout(timer)
  flies.value = []
  pool.length = 0
})
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.float-layer, .float-layer__texts, .float-layer__flash, .float-layer__hurt, .float-layer__low
  position: absolute
  inset: 0
  pointer-events: none
.float-layer
  overflow: hidden
.float-layer__flash
  opacity: 0
  mix-blend-mode: screen
.float-layer__hurt, .float-layer__low
  opacity: 0
  background: radial-gradient(ellipse at 50% 50%, transparent 52%, var(--bc-red-lo) 100%)
.float-layer__low.on
  animation: low-pulse 1s ease-in-out infinite alternate
.float-layer__texts :deep(.ft)
  position: absolute
  left: 0
  top: 0
  color: var(--bc-text)
  font-size: clamp(1rem, 4.6vmin, 1.7rem)
  line-height: 1
  white-space: nowrap
  text-shadow: var(--bc-text-outline)
  will-change: transform, opacity
.float-layer__texts :deep(.ft--crit)
  color: var(--bc-gold)
.float-layer__texts :deep(.ft--heal)
  color: var(--bc-text-good)
.float-layer__texts :deep(.ft--mana)
  color: var(--bc-text-mana)
.float-layer__texts :deep(.ft--status)
  color: var(--bc-purple-hi)
.float-layer__texts :deep(.ft--hurt)
  color: var(--bc-red)
.float-layer__texts :deep(.ft--gold)
  color: var(--bc-text-gold)
.float-layer__texts :deep(.ft--xp)
  color: var(--bc-text-xp)
.toasts
  position: absolute
  left: 50%
  top: clamp(6.6rem, 30vmin, 10.5rem)
  transform: translateX(-50%)
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.45rem
  width: min(92vw, 30rem)
// A phone upright stacks the zone's name, its goal and the target's bar at
// the top: the toasts (finds, mostly) start under them.
@media (orientation: portrait) and (max-width: 40rem)
  .toasts
    top: clamp(10.5rem, 46vmin, 12rem)
// A toast: a slip of parchment.
.toast
  display: inline-flex
  align-items: center
  gap: 0.5em
  max-width: 100%
  padding: 0.4em 1em
  border-radius: var(--bc-r-pill)
  border: var(--bc-ol) solid var(--bc-ink)
  background: linear-gradient(180deg, var(--bc-paper-hi) 0, var(--bc-paper-hi) 46%, var(--bc-paper) 46%, var(--bc-paper) 86%, var(--bc-paper-lo) 86%, var(--bc-paper-lo) 100%)
  box-shadow: var(--bc-drop)
  color: var(--bc-paper-ink)
  font-size: clamp(0.78rem, 3.3vmin, 1.1rem)
  line-height: 1.15
  text-align: center
.toast__icon
  width: 1.7em
  flex: 0 0 auto
// A find's name: a band of its tier's colour, like the result screen's.
.toast__name
  display: inline-block
  padding: 0.05em 0.5em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: linear-gradient(180deg, color-mix(in srgb, var(--tier) 72%, var(--bc-white)) 0, color-mix(in srgb, var(--tier) 72%, var(--bc-white)) 46%, var(--tier) 46%, var(--tier) 100%)
  +cel.label
// Better than what is worn: a green arrow that hops.
.toast__up
  flex: 0 0 auto
  width: 1.45em
  height: 1.45em
  padding: 0.18em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-green)
  color: var(--bc-text)
  box-shadow: 0 2px 0 var(--bc-ink)
  animation: up-hop 0.7s ease-in-out infinite alternate
  :deep(svg)
    display: block
    width: 100%
    height: 100%
// The find in flight.
.fly
  position: absolute
  left: 0
  top: 0
  width: clamp(2.6rem, 11vmin, 3.6rem)
  opacity: 0
  filter: drop-shadow(0 0 0.5rem rgba(255, 240, 190, 0.9))
  will-change: transform, opacity
.toast-enter-active, .toast-leave-active
  transition: opacity 220ms ease-out, transform 260ms var(--bc-ease-bounce)
.toast-enter-from
  opacity: 0
  transform: translateY(-0.6rem) scale(0.8)
.toast-leave-to
  opacity: 0
  transform: translateY(-0.4rem)
@keyframes up-hop
  from
    transform: translateY(0.08em)
  to
    transform: translateY(-0.14em)
@keyframes low-pulse
  from
    opacity: 0.2
  to
    opacity: 0.5
@media (prefers-reduced-motion: reduce)
  .toast__up
    animation: none
</style>
