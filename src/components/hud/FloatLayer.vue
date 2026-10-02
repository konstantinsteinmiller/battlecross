<template lang="pug">
  div.float-layer(aria-hidden="true")
    div.float-layer__flash(ref="flash")
    div.float-layer__hurt(ref="hurt")
    div.float-layer__low(:class="{ on: low }")
    div.float-layer__texts(ref="host")
    TransitionGroup.toasts(name="toast" tag="div")
      div.toast(v-for="x in toasts" :key="x.id")
        span.toast__icon(v-if="x.item")
          ItemIcon(:id="x.item")
        span.toast__text {{ x.text }}
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
import { useI18n } from 'vue-i18n'
import { addHudTicker, hud, hudEvents, type TextKind } from '@/game/state/hud'
import { currentZone } from '@/game/boot'
import ItemIcon from '@/components/art/ItemIcon.vue'
import { fmt } from '@/utils/format'

const { t, te } = useI18n()
const host = ref<HTMLElement | null>(null)
const flash = ref<HTMLElement | null>(null)
const hurt = ref<HTMLElement | null>(null)
const low = computed(() => hud.phase === 'play' && hud.hp > 0 && hud.hp < hud.maxHp * 0.3)

interface Toast { id: number; text: string; item: string }
const toasts = ref<Toast[]>([])
let toastId = 0
const timers = new Set<ReturnType<typeof setTimeout>>()

const POOL = 40
const pool: HTMLElement[] = []
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
  el.getAnimations().forEach(a => a.cancel())
  if (reduced) {
    el.animate([{ opacity: 1, transform: `${t0} translate(0, -${rise * 0.4}px) scale(${s})` }, { opacity: 0, transform: `${t0} translate(0, -${rise * 0.4}px) scale(${s})` }], { duration: 700, fill: 'both' })
    return
  }
  el.animate([
    { opacity: 0, transform: `${t0} scale(${s * 0.4})`, offset: 0 },
    { opacity: 1, transform: `${t0} translate(${dx * 0.15}px, -${rise * 0.18}px) scale(${s * 1.42})`, offset: 0.13 },
    { opacity: 1, transform: `${t0} translate(${dx * 0.35}px, -${rise * 0.36}px) scale(${s})`, offset: 0.3 },
    { opacity: 1, transform: `${t0} translate(${dx * 0.8}px, -${rise * 0.86}px) scale(${s})`, offset: 0.74 },
    { opacity: 0, transform: `${t0} translate(${dx}px, -${rise}px) scale(${s * 0.86})`, offset: 1 }
  ], { duration: kind === 'crit' ? 1050 : 820, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', fill: 'both' })
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
  el.getAnimations().forEach(a => a.cancel())
  el.animate([{ opacity: Math.min(0.85, strength) }, { opacity: 0 }], { duration: ms, easing: 'ease-out', fill: 'both' })
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
        toasts.value = [...toasts.value.slice(-2), { id, text: t(e.key, resolve(e.params)), item: e.icon ?? '' }]
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
  pool.length = 0
})
</script>

<style scoped lang="sass">
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
  background: radial-gradient(ellipse at 50% 50%, rgba(255, 40, 60, 0) 52%, rgba(255, 40, 60, 0.7) 100%)
.float-layer__low.on
  animation: low-pulse 1s ease-in-out infinite alternate
.float-layer__texts :deep(.ft)
  position: absolute
  left: 0
  top: 0
  color: #fff
  font-size: clamp(1rem, 4.6vmin, 1.7rem)
  line-height: 1
  white-space: nowrap
  text-shadow: 0 0.12em 0 #0f1a30, 0.09em 0 0 #0f1a30, -0.09em 0 0 #0f1a30, 0 -0.09em 0 #0f1a30, 0.07em 0.07em 0 #0f1a30, -0.07em 0.07em 0 #0f1a30
  will-change: transform, opacity
.float-layer__texts :deep(.ft--crit)
  color: #ffd84a
.float-layer__texts :deep(.ft--heal)
  color: #7dff8a
.float-layer__texts :deep(.ft--mana)
  color: #7fc4ff
.float-layer__texts :deep(.ft--status)
  color: #d9b3ff
.float-layer__texts :deep(.ft--hurt)
  color: #ff6a6a
.float-layer__texts :deep(.ft--gold)
  color: #ffe066
.float-layer__texts :deep(.ft--xp)
  color: #c58cff
.toasts
  position: absolute
  left: 50%
  top: clamp(5.4rem, 24vmin, 9rem)
  transform: translateX(-50%)
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.35rem
  width: min(92vw, 30rem)
.toast
  display: inline-flex
  align-items: center
  gap: 0.5em
  max-width: 100%
  padding: 0.4em 0.9em
  border-radius: 999px
  border: 2px solid #0f1a30
  background: linear-gradient(180deg, #3a4a86, #232c5a)
  box-shadow: 0 3px 0 #0f1a30
  color: #fff
  font-size: clamp(0.78rem, 3.3vmin, 1.1rem)
  line-height: 1.15
  text-align: center
.toast__icon
  width: 1.7em
  flex: 0 0 auto
.toast-enter-active, .toast-leave-active
  transition: opacity 220ms ease-out, transform 220ms cubic-bezier(0.2, 1.4, 0.4, 1)
.toast-enter-from
  opacity: 0
  transform: translateY(-0.6rem) scale(0.8)
.toast-leave-to
  opacity: 0
  transform: translateY(-0.4rem)
@keyframes low-pulse
  from
    opacity: 0.25
  to
    opacity: 0.6
</style>
