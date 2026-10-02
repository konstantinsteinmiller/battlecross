<template lang="pug">
  div.skill-bar(:class="{ 'is-mouse': hud.device === 'mouse' }")
    //- The potion: one tap, never aimed.
    button.slot.slot--potion(
      type="button"
      data-potion
      :class="{ 'is-empty': hud.potions <= 0, 'is-ready': hud.potionReady && hud.potions > 0 }"
      :aria-label="t('hud.potion', { n: hud.potions })"
      @pointerdown.prevent="onPotion"
    )
      span.slot__plate(aria-hidden="true")
      span.slot__face
        ArtIcon(glyph="potion" tint="#ff5a6a" frame="round")
        span.slot__cd(ref="potionCd")
        span.slot__num(ref="potionNum")
      span.slot__count {{ hud.potions }}
      KeyCap.slot__key(v-if="hud.device === 'mouse'" :code="potionCode")
    //- The six actives. Only filled slots are drawn; `data-skill-slot` keeps
    //- the real slot number for the coach and the keys.
    button.slot(
      v-for="s in filled"
      :key="s.slot"
      type="button"
      :data-skill-slot="s.slot"
      :class="{ 'is-ready': s.v.ready, 'is-nomana': s.v.noMana && !s.v.locked, 'is-locked': s.v.locked, 'is-aiming': aiming === s.slot }"
      :style="{ '--tint': s.def.color }"
      :aria-label="t(`skill.${s.v.id}.name`)"
      @pointerdown.prevent="onDown($event, s.slot)"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onCancel"
      @contextmenu.prevent
    )
      span.slot__plate(aria-hidden="true")
      span.slot__face
        SkillIcon(:id="s.v.id")
        span.slot__cd(:ref="(el) => setCd(el, s.slot)")
        span.slot__num(:ref="(el) => setNum(el, s.slot)")
      span.slot__cost(v-if="s.def.mana > 0") {{ s.def.mana }}
      span.slot__cost.slot__cost--hp(v-else-if="s.def.hpCost") {{ s.def.hpCost }}%
      KeyCap.slot__key(v-if="hud.device === 'mouse'" :code="keyCode(s.slot)")
</template>

<script setup lang="ts">
/**
 * The skill buttons (GDD §7). A tap casts at the locked target; a drag from
 * the button onto the field AIMS — the mode draws the preview under the
 * finger and the skill is cast where it is let go. Letting go back on the
 * button cancels.
 *
 * Cooldowns are painted from the HUD ticker straight into the DOM (a conic
 * clock and the seconds left): nothing here re-renders per frame.
 */
import { computed, onMounted, onUnmounted, ref, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { addHudTicker, hud, hudLive } from '@/game/state/hud'
import { SKILL_BY_ID, type SkillDef } from '@/game/data/skills'
import { input } from '@/game/boot'
import { touchFirst } from '@/game/engine/input'
import { DEFAULT_BINDINGS } from '@/game/engine/keyBindings'
import ArtIcon from '@/components/art/ArtIcon.vue'
import SkillIcon from '@/components/art/SkillIcon.vue'
import KeyCap from '@/components/glyphs/KeyCap.vue'

const { t } = useI18n()

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

// ── Cooldown clocks (direct DOM) ─────────────────────────────────────────────
const cdEls: Array<HTMLElement | null> = [null, null, null, null, null, null]
const numEls: Array<HTMLElement | null> = [null, null, null, null, null, null]
const shown: number[] = [-1, -1, -1, -1, -1, -1]
const potionCd = ref<HTMLElement | null>(null)
const potionNum = ref<HTMLElement | null>(null)
let potionShown = -1
type RefEl = Element | ComponentPublicInstance | null
const setCd = (el: RefEl, slot: number): void => { cdEls[slot] = el as HTMLElement | null; shown[slot] = -1 }
const setNum = (el: RefEl, slot: number): void => { numEls[slot] = el as HTMLElement | null; shown[slot] = -1 }

const paint = (cd: HTMLElement | null, num: HTMLElement | null, left: number, max: number, last: number): number => {
  // Quantised to 1/60 of the dial and a tenth of a second: a still clock
  // writes nothing.
  const q = left <= 0 ? 0 : Math.max(1, Math.round((left / Math.max(0.01, max)) * 60)) * 1000 + Math.ceil(left * (left < 3 ? 10 : 1))
  if (q === last) return last
  if (cd) {
    cd.style.opacity = left > 0 ? '1' : '0'
    cd.style.setProperty('--cd', String(Math.min(1, left / Math.max(0.01, max))))
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
</script>

<style scoped lang="sass">
.skill-bar
  --btn: clamp(2.9rem, 14.5vmin, 4.9rem)
  --gap: clamp(0.3rem, 1.5vmin, 0.6rem)
  display: grid
  // Thumb reach on a phone: three across, filled from the corner.
  grid-template-columns: repeat(3, var(--btn))
  direction: rtl
  gap: var(--gap)
  pointer-events: none
  // Desktop: one row, read left to right like its number keys.
  &.is-mouse
    --btn: clamp(3rem, 6.4vmin, 4.4rem)
    display: flex
    direction: ltr
    align-items: flex-end
.slot
  position: relative
  width: var(--btn)
  height: var(--btn)
  padding: 0
  border: 0
  background: none
  direction: ltr
  cursor: pointer
  pointer-events: auto
  touch-action: none
  -webkit-tap-highlight-color: transparent
  user-select: none
  -webkit-user-select: none
  transition: transform 90ms ease-out
  &:active, &.is-aiming
    transform: scale(0.93)
.slot__plate
  position: absolute
  inset: -6%
  border-radius: 30%
  background: rgba(15, 26, 48, 0.45)
.slot__face
  position: absolute
  inset: 0
  display: block
  border-radius: 24%
  filter: saturate(0.55) brightness(0.72)
  transition: filter 140ms ease-out
.slot--potion .slot__face, .slot--potion .slot__plate
  border-radius: 50%
.is-ready .slot__face
  filter: none
.is-ready::after
  content: ''
  position: absolute
  inset: -7%
  border-radius: 30%
  border: 0.14em solid var(--tint, #ffe9a8)
  opacity: 0
  animation: slot-ready 1.5s ease-out infinite
  pointer-events: none
.slot--potion.is-ready::after
  border-radius: 50%
  --tint: #ff9aa6
.is-nomana .slot__face
  filter: saturate(0.9) brightness(0.62) hue-rotate(170deg)
.is-locked .slot__face
  filter: grayscale(1) brightness(0.5)
.is-empty .slot__face
  filter: grayscale(1) brightness(0.55)
.is-aiming .slot__face
  filter: brightness(1.25)
  box-shadow: 0 0 0 0.2em #ffffff, 0 0 1.2em var(--tint)
.slot__cd
  position: absolute
  inset: 0
  border-radius: inherit
  opacity: 0
  background: conic-gradient(rgba(10, 14, 30, 0) calc((1 - var(--cd, 0)) * 360deg), rgba(10, 14, 30, 0.78) 0)
  pointer-events: none
.slot__num
  position: absolute
  inset: 0
  display: flex
  align-items: center
  justify-content: center
  color: #fff
  font-size: calc(var(--btn) * 0.36)
  line-height: 1
  text-shadow: 0 2px 0 #0f1a30, 2px 0 0 #0f1a30, -2px 0 0 #0f1a30, 0 -2px 0 #0f1a30
  pointer-events: none
.slot__cost, .slot__count
  position: absolute
  right: -6%
  bottom: -8%
  min-width: 1.6em
  padding: 0.1em 0.28em
  border-radius: 999px
  border: 2px solid #0f1a30
  background: linear-gradient(180deg, #6fb6ff, #2f6fe0)
  color: #fff
  font-size: calc(var(--btn) * 0.22)
  line-height: 1.1
  text-align: center
  pointer-events: none
.slot__cost--hp
  background: linear-gradient(180deg, #ff8a8a, #d83040)
.slot__count
  background: linear-gradient(180deg, #ffe066, #f0a020)
  color: #2a1a05
.slot__key
  position: absolute
  left: -8%
  top: -14%
  font-size: calc(var(--btn) * 0.21)
  color: #141a33
  pointer-events: none
@keyframes slot-ready
  0%
    opacity: 0.9
    transform: scale(0.94)
  70%, 100%
    opacity: 0
    transform: scale(1.16)
@media (prefers-reduced-motion: reduce)
  .is-ready::after
    animation: none
    opacity: 0.6
</style>
