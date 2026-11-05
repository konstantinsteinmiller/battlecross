<template lang="pug">
  Teleport(to="body")
    div.hoard(
      :class="{ 'is-claimed': claimed }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hoard-title"
      data-king-hoard
      @keydown="onKey"
    )
      div.hoard__veil(aria-hidden="true")
      div.hoard__rays(aria-hidden="true")
      div.hoard__sparks(aria-hidden="true")
        i(v-for="n in 14" :key="n" :style="{ '--n': n }")
      header.hoard__head
        h2#hoard-title.hoard__title
          span.hoard__title-text {{ t('hoard.title') }}
        p.hoard__lead {{ t('hoard.lead') }}
      ul.hoard__cards(role="radiogroup" :aria-label="t('hoard.title')")
        li.hoard__slot(v-for="(p, i) in picks" :key="p.id" :style="slotStyle(i)")
          button.card(
            ref="cardEls"
            type="button"
            role="radio"
            :aria-checked="sel === p.id"
            :class="{ 'is-sel': sel === p.id, 'is-dim': !!sel && sel !== p.id, 'is-won': claimed && sel === p.id, 'is-lost': claimed && sel !== p.id, 'is-best': p.best }"
            :style="{ '--tier': tint(p.id), '--i': i }"
            :data-hoard-card="p.id"
            @click="choose(p.id)"
            @pointerenter="hover(p.id)"
            @focus="hover(p.id)"
          )
            span.card__glow(aria-hidden="true")
            span.card__shine(aria-hidden="true")
            span.card__burst(v-if="sel === p.id" :key="burst" aria-hidden="true")
              i(v-for="n in 10" :key="n" :style="{ '--k': n }")
            span.card__best(v-if="p.best")
              GameIcon(name="star")
              | {{ t('hoard.best') }}
            span.card__art(aria-hidden="true")
              span.card__halo
              span.card__icon
                ItemIcon(:id="p.id")
            span.card__name {{ t(`item.${p.id}.name`) }}
            span.card__meta {{ t(`slot.${slotOf(p.id)}`) }} · {{ t(`tier.${tierOf(p.id)}`) }}
            span.card__weapon(v-if="weaponOf(p.id)") {{ weaponText(p.id) }}
            span.card__damage(v-if="weaponOf(p.id)" :style="{ '--dot': attrColor(weaponScale(p.id)) }")
              span.card__damage-num {{ weaponHit(p.id) }}
              | {{ t('weapon.hit') }}
            ul.card__stats
              li(v-if="armorOf(p.id)")
                span.card__stat-dot
                | {{ t('mod.armor', { n: armorOf(p.id) }) }}
              li(v-for="l in linesOf(p.id)" :key="l.id" :class="{ 'is-unique': !l.attr }" :style="l.attr ? { '--dot': attrColor(l.id) } : undefined")
                span.card__stat-dot
                | {{ t(l.key, { n: l.n }) }}
            span.card__vs(:class="p.over ? 'is-up' : 'is-open'")
              span.card__vs-arrow(aria-hidden="true") {{ p.over ? '▲' : '✦' }}
              | {{ p.over ? t('hoard.over', { item: t(`item.${p.over}.name`) }) : t('hoard.open') }}
      footer.hoard__foot
        FButton(
          :label="sel ? t('hoard.take', { item: t(`item.${sel}.name`) }) : t('hoard.pick')"
          type="success"
          size="lg"
          icon="check"
          :is-disabled="!sel || claimed"
          :attention="!!sel && !claimed"
          data-hoard-take
          @click="take"
        )
</template>

<script setup lang="ts">
/**
 * ─── The Goblin King's hoard: a three-card pick ──────────────────────────────
 *
 * About two seconds after the finale falls, before Leave, the hoard is laid
 * out: the three pieces of gear this build wants most (`data/hoard.ts`), one
 * card each, fanned like a hand. The cards are dealt in from below with a
 * spring and a stagger, drift in the light, lift and straighten under the
 * finger, and the one that is picked pops, bursts and rises while the others
 * fall away. A tap selects (with the piece's numbers and what it replaces
 * on show); the big button takes it. The keys: Left / Right to move, Enter to
 * take, 1-3 to pick. Reduced motion keeps the layout and drops the movement.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { claimKingHoard, hoard } from '@/game/flow'
import { ITEM_BY_ID, TIER_COLOR, slotOf as slotOfItem } from '@/game/data/items'
import { forgedArmor, forgedMods } from '@/game/data/forge'
import { ATTR_COLOR, type Attr } from '@/game/data/attributes'
import { acquireAppPause } from '@/use/useGamePause'
import { sfx } from '@/game/audio/sfx'
import { modLines } from '@/components/game/modLines'
import { weaponNumbers } from '@/components/game/heroSheet'
import FButton from '@/components/atoms/FButton.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'

const { t } = useI18n()
const picks = computed(() => hoard.picks)
const sel = ref('')
const claimed = ref(false)
const burst = ref(0)
const cardEls = ref<HTMLButtonElement[]>([])

const tint = (id: string): string => TIER_COLOR[ITEM_BY_ID[id]?.tier ?? 1] ?? '#c9d2e3'
const tierOf = (id: string): number => ITEM_BY_ID[id]?.tier ?? 1
const slotOf = (id: string): string => (ITEM_BY_ID[id] ? slotOfItem(ITEM_BY_ID[id]!.slot as never) : 'main')
const weaponOf = (id: string) => ITEM_BY_ID[id]?.weapon
const weaponText = (id: string): string => {
  const w = weaponOf(id)
  return w ? t(`weapon.${w.style}`, { attr: t(`attr.${w.scale}.short`) }) : ''
}
const weaponScale = (id: string): string => weaponOf(id)?.scale ?? 'str'
const weaponHit = (id: string): number => weaponNumbers(id)?.hit ?? 0
const armorOf = (id: string): number => { const it = ITEM_BY_ID[id]; return it ? Math.round(forgedArmor(it, 0) * 10) / 10 : 0 }
const linesOf = (id: string) => { const it = ITEM_BY_ID[id]; return it ? modLines(forgedMods(it, 0)).slice(0, 4) : [] }
const attrColor = (id: string): string => ATTR_COLOR[id as Attr]

/** The fan: the middle card stands tallest and straight, the sides lean out and sit lower. */
const slotStyle = (i: number): Record<string, string> => {
  const n = picks.value.length
  const mid = (n - 1) / 2
  const d = i - mid
  return { '--rot': `${d * 6}deg`, '--drop': `${Math.abs(d) * 0.9}rem`, '--z': String(10 - Math.abs(d)), '--delay': `${0.55 + i * 0.14}s` }
}

const hover = (id: string): void => { if (!claimed.value && !sel.value) lastHover = id }
let lastHover = ''

const choose = (id: string): void => {
  if (claimed.value) return
  if (sel.value !== id) { sel.value = id; burst.value++; sfx('uiChoice') } else take()
}

const take = (): void => {
  if (!sel.value || claimed.value) return
  claimed.value = true
  sfx('lootRare')
  // The winner rises and flashes, the rest fall away; then the hoard closes.
  window.setTimeout(() => claimKingHoard(sel.value), reduced() ? 120 : 950)
}

const reduced = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

const onKey = (e: KeyboardEvent): void => {
  if (claimed.value) return
  const ids = picks.value.map(p => p.id)
  const at = ids.indexOf(sel.value || lastHover)
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); choose(ids[Math.min(ids.length - 1, at + 1)]!); focusCard(sel.value) }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); choose(ids[Math.max(0, at < 0 ? 0 : at - 1)]!); focusCard(sel.value) }
  else if (e.key === 'Enter' && sel.value) { e.preventDefault(); take() }
  else if (/^[1-3]$/.test(e.key) && ids[Number(e.key) - 1]) choose(ids[Number(e.key) - 1]!)
}
const focusCard = (id: string): void => { void nextTick(() => cardEls.value.find(b => b.dataset.hoardCard === id)?.focus()) }

let release: (() => void) | null = null
const timers: number[] = []
onMounted(() => {
  release = acquireAppPause()
  // Each card lands with a tick as it is dealt.
  if (!reduced()) picks.value.forEach((_, i) => timers.push(window.setTimeout(() => sfx('uiPoint', 0, 0.5), 550 + i * 140)))
  sfx('chest')
  focusCard(picks.value[0]?.id ?? '')
})
onBeforeUnmount(() => { release?.(); release = null; for (const x of timers) window.clearTimeout(x) })
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

$spring: cubic-bezier(0.34, 1.56, 0.64, 1)
$snap: cubic-bezier(0.22, 1.4, 0.4, 1)

.hoard
  position: fixed
  inset: 0
  z-index: 2000
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: clamp(0.4rem, 2.2vmin, 1.2rem)
  padding: max(0.6rem, env(safe-area-inset-top)) max(0.6rem, env(safe-area-inset-right)) max(0.6rem, env(safe-area-inset-bottom)) max(0.6rem, env(safe-area-inset-left))
  color: var(--bc-white)
  overflow: hidden
  // No scrolling, anywhere: everything below is sized from the viewport.
  overscroll-behavior: none

.hoard__veil
  position: absolute
  inset: 0
  background: radial-gradient(ellipse at 50% 45%, rgba(46, 26, 70, 0.78) 0%, rgba(14, 8, 30, 0.93) 70%)
  animation: veil 0.45s ease-out both

.hoard__rays
  position: absolute
  left: 50%
  top: 46%
  width: 190vmax
  height: 190vmax
  translate: -50% -50%
  background: repeating-conic-gradient(from 0deg, rgba(255, 214, 110, 0.16) 0deg 7deg, transparent 7deg 20deg)
  mask-image: radial-gradient(circle, #000 0%, transparent 38%)
  animation: rays-in 0.9s ease-out both, spin 60s linear 0.9s infinite
  pointer-events: none

.hoard__sparks
  position: absolute
  inset: 0
  pointer-events: none
  i
    position: absolute
    left: calc(var(--n) * 7.1%)
    bottom: -4%
    width: 0.45rem
    height: 0.45rem
    border-radius: 50%
    background: radial-gradient(circle, #fff6c2, #ffc526 60%, transparent 70%)
    opacity: 0
    animation: rise calc(5s + var(--n) * 0.37s) linear calc(var(--n) * -0.8s) infinite

// ── Title ────────────────────────────────────────────────────────────────────
.hoard__head
  position: relative
  z-index: 3
  text-align: center
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.25rem
.hoard__title
  margin: 0
  animation: drop-in 0.75s $spring 0.1s both
.hoard__title-text
  display: inline-block
  padding: 0.12em 0.9em 0.18em
  font-size: clamp(1.15rem, 5.4vmin, 2.1rem)
  font-weight: 900
  letter-spacing: 0.02em
  color: var(--bc-ink)
  background: linear-gradient(180deg, var(--bc-gold-hi) 0 45%, var(--bc-gold) 45% 100%)
  border: var(--bc-ol, 3px) solid var(--bc-ink)
  border-radius: 0.9rem
  box-shadow: 0 0.25rem 0 var(--bc-gold-deep), 0 0.7rem 1.4rem rgba(0, 0, 0, 0.55), 0 0 2.4rem rgba(255, 197, 38, 0.45)
  text-shadow: 0 0.06em 0 rgba(255, 255, 255, 0.55)
  transform-origin: 50% 0
  animation: wobble 4.2s ease-in-out 1s infinite
.hoard__lead
  margin: 0
  font-size: clamp(0.8rem, 3.1vmin, 1.1rem)
  font-weight: 700
  color: var(--bc-paper-hi)
  text-shadow: 0 0.1em 0.3em rgba(0, 0, 0, 0.8)
  animation: fade-up 0.5s ease-out 0.5s both

// ── The fan ──────────────────────────────────────────────────────────────────
.hoard__cards
  position: relative
  z-index: 2
  display: flex
  align-items: flex-end
  justify-content: center
  margin: 0
  padding: 0
  list-style: none
  // Cards overlap a little so the three read as one hand.
  gap: clamp(-0.6rem, -1.6vw, -0.2rem)

.hoard__slot
  --w: clamp(6.6rem, min(29vw, 46vmin), 13.5rem)
  position: relative
  width: var(--w)
  z-index: var(--z)
  translate: 0 var(--drop)
  rotate: var(--rot)
  transform-origin: 50% 120%
  // Dealt from below, with a spring and a stagger.
  animation: deal 0.85s $spring var(--delay) both

.card
  --tier: #c9d2e3
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.15rem, 0.9vmin, 0.4rem)
  width: 100%
  padding: clamp(0.35rem, 1.6vmin, 0.7rem) clamp(0.3rem, 1.2vmin, 0.55rem) clamp(0.4rem, 1.6vmin, 0.7rem)
  border: 0.18rem solid var(--bc-ink)
  border-radius: clamp(0.6rem, 2.4vmin, 1rem)
  background: linear-gradient(180deg, var(--bc-paper-hi) 0 0.55rem, var(--bc-paper) 0.55rem 100%)
  box-shadow: 0 0 0 0.16rem var(--tier), 0 0.35rem 0 rgba(0, 0, 0, 0.35), 0 1rem 1.6rem rgba(0, 0, 0, 0.5)
  color: var(--bc-paper-ink)
  font: inherit
  text-align: center
  cursor: pointer
  -webkit-tap-highlight-color: transparent
  transition: transform 0.38s $snap, filter 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease
  animation: bob 3.6s ease-in-out calc(1.6s + var(--i) * 0.45s) infinite
  &:focus-visible
    outline: 0.22rem solid var(--bc-white)
    outline-offset: 0.18rem
  @media (hover: hover)
    &:hover:not(.is-dim)
      transform: translateY(-0.9rem) scale(1.07)
      box-shadow: 0 0 0 0.16rem var(--tier), 0 0 1.6rem var(--tier), 0 1.3rem 1.8rem rgba(0, 0, 0, 0.55)
  &.is-sel
    transform: translateY(-1.3rem) scale(1.12)
    box-shadow: 0 0 0 0.2rem var(--bc-gold-hi), 0 0 0 0.4rem var(--tier), 0 0 2.2rem var(--bc-gold), 0 1.4rem 2rem rgba(0, 0, 0, 0.55)
    animation: pop 0.5s $spring, bob 3.6s ease-in-out 0.5s infinite
  &.is-dim
    transform: translateY(0.3rem) scale(0.93)
    filter: saturate(0.55) brightness(0.8)
    opacity: 0.85
  &.is-won
    animation: win 0.95s $spring both
  &.is-lost
    animation: lose 0.7s ease-in both
    pointer-events: none

.card__glow
  position: absolute
  inset: -0.4rem
  z-index: -1
  border-radius: inherit
  background: radial-gradient(circle at 50% 40%, var(--tier), transparent 68%)
  opacity: 0.38
  filter: blur(0.5rem)
  .is-sel &
    opacity: 0.85
    animation: glow 1.1s ease-in-out infinite

// A glint that sweeps across now and then.
.card__shine
  position: absolute
  inset: 0
  border-radius: inherit
  overflow: hidden
  pointer-events: none
  &::after
    content: ''
    position: absolute
    top: -20%
    bottom: -20%
    left: -60%
    width: 38%
    background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.65), transparent)
    transform: skewX(-18deg)
    animation: shine 4.5s ease-in-out calc(2s + var(--i) * 0.8s) infinite

.card__best
  position: absolute
  top: -0.85rem
  left: 50%
  translate: -50% 0
  display: inline-flex
  align-items: center
  gap: 0.25em
  padding: 0.12em 0.7em
  border: 0.14rem solid var(--bc-ink)
  border-radius: 99px
  background: linear-gradient(180deg, var(--bc-gold-hi), var(--bc-gold))
  box-shadow: 0 0.14rem 0 var(--bc-gold-deep)
  color: var(--bc-ink)
  font-size: clamp(0.58rem, 2.2vmin, 0.82rem)
  font-weight: 900
  white-space: nowrap
  animation: stamp 0.5s $spring 1.5s both
  :deep(svg), :deep(img)
    width: 1em
    height: 1em

.card__art
  position: relative
  display: grid
  place-items: center
  width: 62%
  aspect-ratio: 1
  margin-top: 0.2rem
.card__halo
  position: absolute
  inset: -12%
  border-radius: 50%
  background: radial-gradient(circle, var(--tier) 0%, transparent 66%)
  opacity: 0.55
  animation: halo 2.6s ease-in-out infinite
.card__icon
  position: relative
  width: 100%
  filter: drop-shadow(0 0.25rem 0.2rem rgba(0, 0, 0, 0.4))
  animation: float 3s ease-in-out calc(var(--i) * 0.5s) infinite

.card__name
  font-size: clamp(0.72rem, 2.9vmin, 1.05rem)
  font-weight: 900
  line-height: 1.1
  color: var(--bc-paper-ink)
  overflow-wrap: anywhere
.card__meta
  padding: 0.05em 0.6em
  border-radius: 99px
  background: var(--tier)
  color: var(--bc-ink)
  font-size: clamp(0.55rem, 2vmin, 0.76rem)
  font-weight: 800
  white-space: nowrap
.card__weapon
  font-size: clamp(0.55rem, 2vmin, 0.74rem)
  font-weight: 700
  color: var(--bc-paper-ink-soft)
// The weapon's damage for this hero (#207): the number in a pill of its attribute's colour.
.card__damage
  font-size: clamp(0.55rem, 2vmin, 0.74rem)
  font-weight: 700
  color: var(--bc-paper-ink-soft)
.card__damage-num
  margin-inline-end: 0.4em
  padding: 0 0.5em
  border: 1.5px solid var(--bc-ink)
  border-radius: 99px
  background: var(--dot)
  color: var(--bc-text)
  text-shadow: var(--bc-text-outline-thin)
  font-size: 1.2em

.card__stats
  display: flex
  flex-direction: column
  gap: 0.1rem
  width: 100%
  margin: 0
  padding: 0
  list-style: none
  font-size: clamp(0.58rem, 2.25vmin, 0.84rem)
  font-weight: 800
  li
    display: flex
    align-items: center
    justify-content: center
    gap: 0.35em
    line-height: 1.15
    &.is-unique
      color: var(--bc-paper-ink-soft)
      font-style: italic
.card__stat-dot
  flex: none
  width: 0.5em
  height: 0.5em
  border-radius: 50%
  background: var(--dot, var(--bc-gold-lo))

.card__vs
  margin-top: auto
  display: inline-flex
  align-items: center
  gap: 0.3em
  padding: 0.12em 0.55em
  border-radius: 99px
  font-size: clamp(0.52rem, 1.95vmin, 0.72rem)
  font-weight: 800
  line-height: 1.15
  &.is-up
    background: rgba(39, 166, 72, 0.18)
    color: var(--bc-green-deep)
  &.is-open
    background: rgba(255, 197, 38, 0.28)
    color: var(--bc-gold-deep)
.card__vs-arrow
  font-size: 0.8em

.card__burst
  position: absolute
  left: 50%
  top: 35%
  pointer-events: none
  i
    position: absolute
    width: 0.5rem
    height: 0.5rem
    margin: -0.25rem
    border-radius: 50%
    background: radial-gradient(circle, #fff, var(--bc-gold) 60%, transparent 70%)
    animation: burst 0.7s ease-out both
    rotate: calc(var(--k) * 36deg)

// ── Footer ───────────────────────────────────────────────────────────────────
.hoard__foot
  position: relative
  z-index: 3
  padding-bottom: var(--bc-press, 0.3rem)
  animation: fade-up 0.5s ease-out 1.1s both

// ── Keyframes ────────────────────────────────────────────────────────────────
@keyframes veil
  from
    opacity: 0
@keyframes rays-in
  from
    opacity: 0
    scale: 0.4
@keyframes spin
  to
    rotate: 360deg
@keyframes rise
  0%
    opacity: 0
    transform: translateY(0) scale(0.6)
  15%
    opacity: 0.9
  100%
    opacity: 0
    transform: translateY(-105vh) translateX(2rem) scale(1.1)
@keyframes drop-in
  0%
    opacity: 0
    transform: translateY(-5rem) rotate(-5deg) scale(0.7)
  100%
    opacity: 1
    transform: none
@keyframes wobble
  0%, 100%
    transform: rotate(-0.8deg)
  50%
    transform: rotate(0.8deg) scale(1.02)
@keyframes fade-up
  from
    opacity: 0
    transform: translateY(0.8rem)
@keyframes deal
  0%
    opacity: 0
    transform: translateY(110vh) rotate(-24deg) scale(0.4)
  60%
    opacity: 1
  100%
    opacity: 1
    transform: none
@keyframes bob
  0%, 100%
    translate: 0 0
  50%
    translate: 0 -0.35rem
@keyframes float
  0%, 100%
    transform: translateY(0) rotate(-2deg)
  50%
    transform: translateY(-0.18rem) rotate(2deg)
@keyframes halo
  0%, 100%
    transform: scale(0.92)
    opacity: 0.4
  50%
    transform: scale(1.08)
    opacity: 0.7
@keyframes glow
  0%, 100%
    opacity: 0.65
  50%
    opacity: 1
@keyframes shine
  0%, 70%, 100%
    left: -60%
  85%
    left: 130%
@keyframes stamp
  0%
    opacity: 0
    transform: scale(2.4) rotate(-14deg)
  100%
    opacity: 1
    transform: scale(1) rotate(0)
@keyframes pop
  0%
    transform: translateY(0) scale(0.9, 1.1)
  45%
    transform: translateY(-1.6rem) scale(1.2, 0.94)
  100%
    transform: translateY(-1.3rem) scale(1.12)
@keyframes burst
  0%
    opacity: 1
    transform: translate(0, 0) scale(0.4)
  100%
    opacity: 0
    transform: translate(calc(cos(var(--k) * 36deg) * 4.2rem), calc(sin(var(--k) * 36deg) * 4.2rem)) scale(1)
@keyframes win
  0%
    transform: translateY(-1.3rem) scale(1.12)
  40%
    transform: translateY(-2.4rem) scale(1.3) rotate(-3deg)
    filter: brightness(1.5)
  100%
    transform: translateY(-9rem) scale(1.5)
    opacity: 0
    filter: brightness(2)
@keyframes lose
  to
    transform: translateY(14rem) rotate(18deg) scale(0.7)
    opacity: 0

// ── Short landscape phones: shrink the art, drop the extras, never scroll ───
@media (max-height: 480px)
  .hoard
    gap: 0.25rem
  .hoard__lead
    display: none
  .hoard__slot
    --w: clamp(6rem, min(24vw, 44vh), 11rem)
  .card__weapon, .card__meta
    display: none
  .card__art
    width: 44%
  .card__stats li:nth-child(n+3)
    display: none
@media (max-height: 360px)
  .card__stats
    display: none

@media (prefers-reduced-motion: reduce)
  .hoard__rays, .hoard__sparks, .card__shine, .card__burst
    display: none
  .hoard__veil, .hoard__title, .hoard__title-text, .hoard__lead, .hoard__slot, .hoard__foot, .card, .card__icon, .card__halo, .card__best
    animation: none !important
  .card
    transition: none
</style>
