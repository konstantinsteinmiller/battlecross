<template lang="pug">
  div.skill-bar(:class="{ 'is-mouse': hud.device === 'mouse', 'is-lite': lite }")
    //- The six actives. Only filled slots are drawn; `data-skill-slot` keeps
    //- the real slot number for the coach and the keys.
    button.slot(
      v-for="s in filled"
      :key="s.slot"
      type="button"
      :data-skill-slot="s.slot"
      :class="{ 'is-ready': s.v.ready, 'is-nomana': s.v.noMana && !s.v.locked, 'is-locked': s.v.locked, 'is-aiming': aiming === s.slot }"
      :style="{ '--tint': s.def.color, '--i': s.slot }"
      :aria-label="t(`skill.${s.v.id}.name`)"
      @pointerdown.prevent="onDown($event, s.slot)"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onCancel"
      @contextmenu.prevent
    )
      FSocket.slot__socket(shape="square" :tint="s.def.color" gem art="skill-frame")
        span.slot__face
          SkillIcon(:id="s.v.id")
        template(#over)
          span.slot__wash(aria-hidden="true")
          span.slot__shine(aria-hidden="true")
          span.slot__cd(:ref="(el) => setCd(el, s.slot)")
          GameIcon.slot__lock(v-if="s.v.locked" name="lock")
          span.slot__num(:ref="(el) => setNum(el, s.slot)")
        template(#badge)
          span.slot__cost(v-if="s.def.mana > 0") {{ s.def.mana }}
          span.slot__cost.slot__cost--hp(v-else-if="s.def.hpCost") {{ s.def.hpCost }}%
          KeyCap.slot__key(v-if="hud.device === 'mouse'" :code="keyCode(s.slot)")
      //- Dragged off the button: the arrow says "let go on the field".
      span.slot__aim(aria-hidden="true")
        GameIcon(name="up")
      span.slot__flash(aria-hidden="true")
    //- The belt: one tap each, never aimed. A flask with nothing left dims
    //- but stays, so the bar never jumps.
    button.slot.slot--potion(
      type="button"
      data-potion
      :class="{ 'is-empty': hud.potions <= 0, 'is-ready': hud.potionReady && hud.potions > 0 }"
      :aria-label="t('hud.potion', { n: hud.potions })"
      @pointerdown.prevent="onPotion"
    )
      FSocket.slot__socket(shape="round" tint="var(--bc-red)" cork art="skill-frame-potion")
        span.slot__face.flask
          span.flask__liquid(:style="{ transform: `translateY(${healthLevel}%)` }")
          img.flask__mark(v-if="ICON_ART.get('mark-potion-health')" :src="ICON_ART.get('mark-potion-health')" alt="" aria-hidden="true" draggable="false")
          svg.flask__mark(v-else :viewBox="MARKS['potion-health'].viewBox" aria-hidden="true" focusable="false")
            path(:d="MARKS['potion-health'].d")
        template(#over)
          span.slot__shine(aria-hidden="true")
          span.slot__cd(ref="potionCd")
          span.slot__num(ref="potionNum")
        template(#badge)
          span.slot__count {{ hud.potions }}
          KeyCap.slot__key(v-if="hud.device === 'mouse'" :code="potionCode")
      span.slot__flash(aria-hidden="true")
    //- A new player's mana flask arrives with the first mana potion (`coach/reveal.ts`).
    Transition(name="reveal")
      button.slot.slot--potion.slot--mana(
        v-if="revealed('mana')"
        type="button"
        data-mana-potion
        :class="{ 'is-empty': hud.manaPotions <= 0, 'is-ready': hud.manaPotionReady && hud.manaPotions > 0, 'is-glow': glowing('mana') }"
        :aria-label="t('hud.manaPotion', { n: hud.manaPotions })"
        @pointerdown.prevent="onManaPotion"
      )
        FSocket.slot__socket(shape="round" tint="var(--bc-blue)" metal="steel" cork art="skill-frame-potion")
          span.slot__face.flask
            span.flask__liquid(:style="{ transform: `translateY(${manaLevel}%)` }")
            img.flask__mark(v-if="ICON_ART.get('mark-potion-mana')" :src="ICON_ART.get('mark-potion-mana')" alt="" aria-hidden="true" draggable="false")
            svg.flask__mark(v-else :viewBox="MARKS['potion-mana'].viewBox" aria-hidden="true" focusable="false")
              path(:d="MARKS['potion-mana'].d")
          template(#over)
            span.slot__shine(aria-hidden="true")
            span.slot__cd(ref="manaCd")
            span.slot__num(ref="manaNum")
          template(#badge)
            span.slot__count {{ hud.manaPotions }}
            KeyCap.slot__key(v-if="hud.device === 'mouse'" :code="manaPotionCode")
        span.slot__flash(aria-hidden="true")
</template>

<script setup lang="ts">
/**
 * The skill buttons (GDD §7). A tap casts at the locked target; a drag from
 * the button onto the field AIMS — the mode draws the preview under the
 * finger and the skill is cast where it is let go. Letting go back on the
 * button cancels.
 *
 * Each button is a socket (`FSocket`): a metal frame with the skill's class
 * colour inlaid and a gem on its crown, the icon set in it under glass. The
 * two flasks on the belt are round sockets under a cork, and the liquid in
 * them stands as high as there are flasks left.
 *
 * Cooldowns are painted from the HUD ticker straight into the DOM (a conic
 * clock and the seconds left): nothing here re-renders per frame. The moment
 * a cooldown ends the button pops and flashes — one compositor animation,
 * started from the same ticker.
 */
import { computed, onMounted, onUnmounted, ref, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { addHudTicker, hud, hudLive } from '@/game/state/hud'
import { SKILL_BY_ID, type SkillDef } from '@/game/data/skills'
import { input } from '@/game/boot'
import { touchFirst } from '@/game/engine/input'
import { DEFAULT_BINDINGS } from '@/game/engine/keyBindings'
import { sceneQuality } from '@/game/engine/quality'
import FSocket from '@/components/atoms/FSocket.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { ICON_ART } from '@/game/assets/overrides'
import { MARKS } from '@/components/icons/marks'
import SkillIcon from '@/components/art/SkillIcon.vue'
import KeyCap from '@/components/glyphs/KeyCap.vue'
import { glowing, revealed } from '@/game/coach/reveal'

const { t } = useI18n()

/** A weak phone gets the buttons without their idle shimmer. */
const lite = sceneQuality() === 'low'

const filled = computed(() => {
  const out: Array<{ slot: number; v: (typeof hud.skills)[number]; def: SkillDef }> = []
  hud.skills.forEach((v, slot) => {
    const def = v.id ? SKILL_BY_ID[v.id] : undefined
    if (def) out.push({ slot, v, def })
  })
  return out
})

const keyCode = (slot: number): string => DEFAULT_BINDINGS[`skill${slot + 1}` as 'skill1'][0]!
const potionCode = DEFAULT_BINDINGS.potion[0]!
const manaPotionCode = DEFAULT_BINDINGS.manaPotion[0]!

/** How far the liquid is pushed down its flask, in % of the window: a full
 *  belt fills it to the neck, the last flask still shows a puddle. */
const level = (n: number, max: number): number => {
  if (n <= 0) return 100
  const full = Math.max(1, max)
  return Math.round((1 - Math.min(1, n / full)) * 52 + 18)
}
const healthLevel = computed(() => level(hud.potions, hud.potionsMax))
const manaLevel = computed(() => level(hud.manaPotions, hud.manaPotionMax))

// ── Cooldown clocks (direct DOM) ─────────────────────────────────────────────
const cdEls: Array<HTMLElement | null> = [null, null, null, null, null, null]
const numEls: Array<HTMLElement | null> = [null, null, null, null, null, null]
const shown: number[] = [-1, -1, -1, -1, -1, -1]
const potionCd = ref<HTMLElement | null>(null)
const potionNum = ref<HTMLElement | null>(null)
const manaCd = ref<HTMLElement | null>(null)
const manaNum = ref<HTMLElement | null>(null)
let potionShown = -1
let manaShown = -1
type RefEl = Element | ComponentPublicInstance | null
const setCd = (el: RefEl, slot: number): void => { cdEls[slot] = el as HTMLElement | null; shown[slot] = -1 }
const setNum = (el: RefEl, slot: number): void => { numEls[slot] = el as HTMLElement | null; shown[slot] = -1 }

const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** A cooldown just ended: the button pops and its face flashes white. */
const pop = (cd: HTMLElement): void => {
  const slot = cd.closest('.slot') as HTMLElement | null
  if (!slot || reduced || typeof slot.animate !== 'function') return
  const socket = slot.querySelector('.slot__socket') as HTMLElement | null
  const flash = slot.querySelector('.slot__flash') as HTMLElement | null
  socket?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.17)', offset: 0.3 }, { transform: 'scale(0.97)', offset: 0.62 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' })
  flash?.animate([{ opacity: 0.95, transform: 'scale(0.8)' }, { opacity: 0, transform: 'scale(1.45)' }], { duration: 460, easing: 'ease-out', fill: 'both' })
}

const paint = (cd: HTMLElement | null, num: HTMLElement | null, left: number, max: number, last: number): number => {
  // Quantised to 1/60 of the dial and a tenth of a second: a still clock
  // writes nothing.
  const q = left <= 0 ? 0 : Math.max(1, Math.round((left / Math.max(0.01, max)) * 60)) * 1000 + Math.ceil(left * (left < 3 ? 10 : 1))
  if (q === last) return last
  if (cd) {
    cd.style.opacity = left > 0 ? '1' : '0'
    cd.style.setProperty('--cd', String(Math.min(1, left / Math.max(0.01, max))))
    if (q === 0 && last > 0) pop(cd)
  }
  if (num) num.textContent = left <= 0 ? '' : left < 3 ? left.toFixed(1) : String(Math.ceil(left))
  return q
}

let removeTicker: (() => void) | null = null
onMounted(() => {
  removeTicker = addHudTicker(() => {
    for (let s = 0; s < 6; s++) {
      if (cdEls[s]) shown[s] = paint(cdEls[s]!, numEls[s]!, hudLive.cd[s]!, hudLive.cdMax[s]!, shown[s]!)
    }
    potionShown = paint(potionCd.value, potionNum.value, hudLive.potionCd, hudLive.potionCdMax, potionShown)
    manaShown = paint(manaCd.value, manaNum.value, hudLive.manaPotionCd, hudLive.manaPotionCdMax, manaShown)
  })
})
onUnmounted(() => {
  removeTicker?.()
  release()
})

// ── Tap and drag-to-aim ──────────────────────────────────────────────────────
/** How far a finger must leave its press point before the press is an aim. */
const AIM_TRAVEL = 18
const aiming = ref(-1)
let press: { slot: number; id: number; x0: number; y0: number; el: HTMLElement; live: boolean } | null = null

const device = (e: PointerEvent): void => {
  input.touched = true
  input.anyPressed = true
  input.device = e.pointerType !== 'mouse' || touchFirst() ? 'touch' : 'mouse'
}

const release = (): void => {
  if (press) { try { press.el.releasePointerCapture(press.id) } catch { /* already gone */ } }
  press = null
  aiming.value = -1
  input.aimSlot = -1
  input.aimLive = false
}

const onDown = (e: PointerEvent, slot: number): void => {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  device(e)
  const el = e.currentTarget as HTMLElement
  try { el.setPointerCapture(e.pointerId) } catch { /* not capturable */ }
  press = { slot, id: e.pointerId, x0: e.clientX, y0: e.clientY, el, live: false }
}

const onMove = (e: PointerEvent): void => {
  if (!press || e.pointerId !== press.id) return
  if (!press.live && Math.hypot(e.clientX - press.x0, e.clientY - press.y0) > AIM_TRAVEL) {
    press.live = true
    aiming.value = press.slot
  }
  if (press.live) {
    input.aimSlot = press.slot
    input.aimLive = true
    input.aimX = e.clientX
    input.aimY = e.clientY
  }
}

const onUp = (e: PointerEvent): void => {
  if (!press || e.pointerId !== press.id) return
  const p = press
  if (!p.live) input.skillTap = p.slot
  else {
    // Let go back on the button: the aim is called off.
    const r = p.el.getBoundingClientRect()
    const back = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    if (!back) {
      input.aimDrop = p.slot
      input.aimDropX = e.clientX
      input.aimDropY = e.clientY
    }
  }
  release()
}

const onCancel = (e: PointerEvent): void => {
  if (press && e.pointerId === press.id) release()
}

const onPotion = (e: PointerEvent): void => {
  device(e)
  input.potionQueued = true
}
const onManaPotion = (e: PointerEvent): void => {
  device(e)
  input.manaPotionQueued = true
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.skill-bar
  --btn: clamp(2.9rem, 14.5vmin, 4.9rem)
  --gap: clamp(0.3rem, 1.5vmin, 0.6rem)
  // Thumb reach on a phone: three across, filled from the bottom-right corner
  // — the first skills nearest the thumb, the belt on the row above them.
  display: flex
  flex-flow: row-reverse wrap-reverse
  align-content: flex-start
  width: calc(var(--btn) * 3 + var(--gap) * 2)
  gap: var(--gap)
  pointer-events: none
  // Desktop: one row, read left to right like its keys — the belt first.
  &.is-mouse
    --btn: clamp(3.3rem, 7.6vmin, 4.8rem)
    flex-flow: row nowrap
    align-items: flex-end
    width: auto
    .slot--potion
      order: -1

.slot
  position: relative
  flex: 0 0 auto
  width: var(--btn)
  height: var(--btn)
  padding: 0
  border: 0
  border-radius: 24%
  background: none
  cursor: pointer
  pointer-events: auto
  touch-action: none
  -webkit-tap-highlight-color: transparent
  user-select: none
  -webkit-user-select: none
  // Down is a quick squash; letting go springs back past rest.
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), filter 140ms ease-out
  +cel.focus-ring
  &:active
    transition-duration: var(--bc-t-press)
    transition-timing-function: ease-out
    transform: scale(0.9)
.slot--potion
  border-radius: 50%
  --tint: var(--bc-red)
.slot--mana
  --tint: var(--bc-blue)

.slot__socket
  position: absolute
  inset: 0

// The icon under the glass. Cooling down it loses most of its colour.
.slot__face
  display: block
  filter: saturate(0.5) brightness(0.72)
  transition: filter 140ms ease-out
.is-ready .slot__face
  filter: none

// ── The flasks ───────────────────────────────────────────────────────────────
.flask
  overflow: hidden
.flask__liquid
  position: absolute
  inset: 0
  // Two-tone liquid under a pale meniscus.
  background: linear-gradient(180deg, color-mix(in srgb, var(--tint) 45%, var(--bc-white)) 0, color-mix(in srgb, var(--tint) 45%, var(--bc-white)) 7%, var(--tint) 7%, var(--tint) 62%, color-mix(in srgb, var(--tint) 72%, var(--bc-ink)) 62%)
  transition: transform 420ms var(--bc-ease-pop)
.flask__mark
  position: absolute
  inset: 20% 20% 16% 20%
  width: 60%
  height: 64%
  path
    fill: var(--bc-white)
    stroke: var(--bc-ink)
    stroke-width: 3.4
    stroke-linejoin: round

// ── States ───────────────────────────────────────────────────────────────────
// Out of mana: a cold blue wash, and the price turns red.
.slot__wash
  background: var(--bc-blue-deep)
  opacity: 0
  transition: opacity 140ms ease-out
  pointer-events: none
.is-nomana
  .slot__face
    filter: saturate(0.25) brightness(0.95)
  .slot__wash
    opacity: 0.46
  .slot__cost
    +cel.tone('red')
    animation: slot-short 0.9s ease-in-out infinite alternate
// Locked by a status: no colour, dull metal, a padlock.
.is-locked
  .slot__face
    filter: grayscale(1) brightness(0.45)
  :deep(.f-socket)
    --m-hi: var(--bc-off-hi)
    --m-lo: var(--bc-off-lo)
    --tint: var(--bc-off-deep)
.slot__socket :deep(.f-socket__well) .slot__lock
  inset: 24%
  width: 52%
  height: 52%
  color: var(--bc-text)
  filter: drop-shadow(0 2px 0 var(--bc-ink)) drop-shadow(1px 0 0 var(--bc-ink)) drop-shadow(-1px 0 0 var(--bc-ink)) drop-shadow(0 -1px 0 var(--bc-ink))
// Nothing left on the belt.
.is-empty
  .slot__face
    filter: grayscale(1) brightness(0.55)
  .slot__count
    +cel.tone('off')
  :deep(.f-socket)
    --m-hi: var(--bc-off-hi)
    --m-lo: var(--bc-off-lo)
// Aiming: the button lifts and glows in its class colour, under an arrow.
.is-aiming
  transform: scale(1.08)
  filter: drop-shadow(0 0 0.5em var(--tint)) drop-shadow(0 0 0.12em var(--bc-white))
  .slot__face
    filter: brightness(1.2)
  .slot__aim
    opacity: 1
    animation: slot-aim 0.6s ease-in-out infinite alternate
.slot__aim
  position: absolute
  left: 50%
  bottom: 100%
  width: 46%
  height: 46%
  margin-left: -23%
  color: var(--bc-text)
  opacity: 0
  filter: drop-shadow(0 2px 0 var(--bc-ink)) drop-shadow(1px 0 0 var(--bc-ink)) drop-shadow(-1px 0 0 var(--bc-ink)) drop-shadow(0 -1px 0 var(--bc-ink))
  pointer-events: none

// Ready and idle: a light slides across the glass now and then.
.slot__shine
  opacity: 0
  background: linear-gradient(105deg, transparent 0, transparent 38%, rgba(var(--bc-white-rgb), 0.7) 38%, rgba(var(--bc-white-rgb), 0.7) 50%, transparent 50%, transparent 56%, rgba(var(--bc-white-rgb), 0.45) 56%, rgba(var(--bc-white-rgb), 0.45) 61%, transparent 61%)
  transform: translateX(-110%)
  pointer-events: none
.is-ready .slot__shine
  opacity: 1
  animation: slot-shine 3.6s ease-in-out infinite
  animation-delay: calc(var(--i, 0) * 0.22s)
.is-lite .slot__shine
  display: none

// The cooldown clock: a dark sweep that shrinks as the skill comes back.
.slot__cd
  opacity: 0
  background: conic-gradient(rgba(var(--bc-ink-rgb), 0) calc((1 - var(--cd, 0)) * 360deg), rgba(var(--bc-ink-rgb), 0.8) 0)
  pointer-events: none
.slot__num
  display: flex
  align-items: center
  justify-content: center
  color: var(--bc-text)
  font-size: calc(var(--btn) * 0.34)
  line-height: 1
  text-shadow: var(--bc-text-outline)
  pointer-events: none

// The pop when a cooldown ends (driven from the ticker).
.slot__flash
  position: absolute
  inset: 4%
  border-radius: inherit
  background: var(--bc-white)
  opacity: 0
  pointer-events: none

// ── What hangs off the frame ─────────────────────────────────────────────────
.slot__cost, .slot__count
  +cel.tone('blue')
  position: absolute
  right: -7%
  bottom: -9%
  min-width: 1.7em
  padding: 0.1em 0.3em
  border-radius: var(--bc-r-pill)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  +cel.fill(48%, 100%)
  color: var(--bc-text)
  font-size: calc(var(--btn) * 0.22)
  line-height: 1.1
  text-align: center
  text-shadow: var(--bc-text-outline-thin)
  box-shadow: 0 2px 0 var(--bc-ink)
  pointer-events: none
.slot__cost--hp
  +cel.tone('red')
.slot__count
  +cel.tone('gold')
.slot__key
  position: absolute
  left: -8%
  top: -14%
  font-size: calc(var(--btn) * 0.21)
  color: var(--bc-ink)
  pointer-events: none

@keyframes slot-shine
  0%, 62%
    transform: translateX(-110%)
  82%, 100%
    transform: translateX(110%)
@keyframes slot-aim
  from
    transform: translateY(0)
  to
    transform: translateY(-22%)
@keyframes slot-short
  from
    transform: scale(1)
  to
    transform: scale(1.14)
// ── The mana flask's arrival (a new player's first mana potion) ──────────────
// A pop with an overshoot; then a soft blue glow until it is first drunk.
.reveal-enter-active
  animation: slot-reveal 620ms cubic-bezier(0.34, 1.56, 0.64, 1) both
.slot--mana.is-glow::before
  content: ''
  position: absolute
  inset: -18%
  border-radius: 50%
  background: radial-gradient(circle, rgba(127, 208, 255, 0.6) 0, rgba(127, 208, 255, 0) 70%)
  animation: slot-glow 1.8s ease-in-out infinite
  pointer-events: none
@keyframes slot-reveal
  0%
    transform: scale(0)
    opacity: 0
  55%
    transform: scale(1.3)
    opacity: 1
  100%
    transform: scale(1)
@keyframes slot-glow
  0%, 100%
    opacity: 0.4
    transform: scale(0.94)
  50%
    opacity: 1
    transform: scale(1.1)
@media (prefers-reduced-motion: reduce)
  .is-ready .slot__shine, .is-nomana .slot__cost, .is-aiming .slot__aim, .reveal-enter-active, .slot--mana.is-glow::before
    animation: none
  .slot
    transition: none
</style>
