<template lang="pug">
  div.pins(v-show="!flow.talk && !flow.modal")
    div.pin(
      v-for="p in pins"
      :key="p.id"
      :ref="(el) => setEl(el, p.id)"
      :class="[`pin--${p.kind}`, { 'is-near': hud.interactKey === p.id }]"
    )
      //- In reach: the marker becomes the prompt.
      button.pin__talk(v-if="hud.interactKey === p.id" type="button" @click="ask")
        span.pin__name {{ t(`npc.${p.id}.name`) }}
        span.pin__row
          span.pin__glyph
            GameIcon(name="chat")
          span.pin__label {{ t('options.actions.interact') }}
          KeyCap.pin__key(v-if="hud.device === 'mouse'" :code="interactCode")
      span.pin__badge(v-else aria-hidden="true")
        svg.pin__mark(v-if="p.kind === 'quest'" viewBox="0 0 24 24")
          path(d="M9.6 3h4.800l-0.800 11h-3.200zM12 16.400a2.300 2.300 0 1 1 0 4.600a2.300 2.300 0 0 1 0-4.600z" fill="currentColor")
        GameIcon(v-else :name="p.icon")
        i.pin__new(v-if="p.news")
</template>

<script setup lang="ts">
/**
 * The markers over the townspeople: a quest mark while their quest is
 * undecided, else their trade (anvil or gem, book, flask) or a speech bubble —
 * with a dot when they have something new to say. The one in reach turns into
 * the prompt: "Talk", with the key on a desktop.
 *
 * Positions are transforms written from the HUD ticker (the scene's own
 * frame); the reactive part is only who stands in this town and what hangs
 * over them, rebuilt when the place changes or a conversation ends.
 */
import { onMounted, onUnmounted, shallowRef, watch, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { addHudTicker, hud } from '@/game/state/hud'
import { flow, npcById } from '@/game/flow'
import { currentZone, input } from '@/game/boot'
import { dialogWorld, npcPin, type NpcPin } from '@/game/talk'
import { DEFAULT_BINDINGS } from '@/game/engine/keyBindings'
import type { ZoneMode } from '@/game/modes/zoneMode'
import type { GameIconName } from '@/components/icons/iconNames'
import GameIcon from '@/components/icons/GameIcon.vue'
import KeyCap from '@/components/glyphs/KeyCap.vue'

const { t } = useI18n()
const interactCode = DEFAULT_BINDINGS.interact[0]!

interface Pin { id: string; unit: number; kind: NpcPin; icon: GameIconName; news: boolean }
const pins = shallowRef<Pin[]>([])
const els = new Map<string, HTMLElement>()
const setEl = (el: Element | ComponentPublicInstance | null, id: string): void => {
  if (el instanceof HTMLElement) els.set(id, el)
  else els.delete(id)
}

const ICON: Record<NpcPin, GameIconName> = { quest: 'chat', shop: 'anvil', trainer: 'book', healer: 'flask', talk: 'chat' }

let seen: ZoneMode | null = null
const rebuild = (): void => {
  const zone = currentZone()
  seen = zone
  const out: Pin[] = []
  if (zone && zone.setup.kind === 'town') {
    const w = dialogWorld()
    for (const u of zone.sim.units) {
      const def = u.npc ? npcById(u.npc) : null
      if (!def) continue
      const pin = npcPin(def, w)
      // A trinket seller wears a gem, an armourer the anvil.
      const icon: GameIconName = pin.kind === 'shop' && def.stock && def.stock.slots.every(s => s === 'trinket') ? 'gem' : ICON[pin.kind]
      out.push({ id: def.id, unit: u.id, kind: pin.kind, icon, news: pin.news })
    }
  }
  pins.value = out
}

const p = { x: 0, y: 0 }
let remove: (() => void) | null = null
onMounted(() => {
  rebuild()
  remove = addHudTicker(() => {
    const zone = currentZone()
    if (zone !== seen) rebuild()
    if (!zone) return
    for (const pin of pins.value) {
      const el = els.get(pin.id)
      const u = zone.sim.get(pin.unit)
      if (!el || !u) continue
      const on = zone.project(u.x, u.h + 0.62, u.z, p)
      el.style.transform = on ? `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0)` : 'translate3d(-999px, -999px, 0)'
    }
  })
})
onUnmounted(() => remove?.())
// What was said, bought or decided may have changed what hangs over them.
watch(() => [flow.talk, flow.modal], ([talking, modal]) => { if (!talking && !modal) rebuild() })

const ask = (): void => { input.interactQueued = true }
</script>

<style scoped lang="sass">
.pins
  position: absolute
  inset: 0
  overflow: hidden
  pointer-events: none
  font-family: var(--font-ui)
.pin
  --c-hi: var(--bc-blue-hi)
  --c: var(--bc-blue)
  --c-lo: var(--bc-blue-lo)
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 0
  will-change: transform
.pin--quest
  --c-hi: var(--bc-gold-hi)
  --c: var(--bc-gold)
  --c-lo: var(--bc-gold-lo)
.pin--shop
  --c-hi: var(--bc-orange-hi)
  --c: var(--bc-orange)
  --c-lo: var(--bc-orange-lo)
.pin--trainer
  --c-hi: var(--bc-purple-hi)
  --c: var(--bc-purple)
  --c-lo: var(--bc-purple-lo)
.pin--healer
  --c-hi: var(--bc-green-hi)
  --c: var(--bc-green)
  --c-lo: var(--bc-green-lo)
.pin__badge
  position: absolute
  left: 0
  bottom: 0
  width: clamp(1.6rem, 7vmin, 2.2rem)
  height: clamp(1.6rem, 7vmin, 2.2rem)
  box-sizing: border-box
  padding: 16%
  margin-left: calc(clamp(1.6rem, 7vmin, 2.2rem) / -2)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: linear-gradient(180deg, var(--c-hi) 0, var(--c-hi) 46%, var(--c) 46%, var(--c) 86%, var(--c-lo) 86%)
  box-shadow: 0 3px 0 rgba(var(--bc-ink-rgb), 0.5)
  color: var(--bc-white)
  filter: drop-shadow(0 1px 0 var(--bc-ink))
  animation: pin-bob 1.6s ease-in-out infinite alternate
.pin--quest .pin__badge
  color: var(--bc-ink)
  filter: none
  animation: pin-bob 0.8s ease-in-out infinite alternate
.pin__mark
  display: block
  width: 100%
  height: 100%
.pin__new
  position: absolute
  top: -12%
  right: -12%
  width: 38%
  height: 38%
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-red)
  animation: pin-new 0.9s ease-in-out infinite alternate
.pin__talk
  position: absolute
  left: 0
  bottom: 0
  transform: translateX(-50%)
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.2em
  min-height: max(2.75rem, 44px)
  margin: 0
  padding: 0
  border: 0
  background: none
  color: var(--bc-text)
  font: inherit
  font-size: clamp(0.82rem, 3.4vmin, 1.05rem)
  line-height: 1.1
  white-space: nowrap
  pointer-events: auto
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  animation: pin-in 220ms var(--bc-ease-pop) both
  &:focus
    outline: none
.pin__name
  max-width: 70vw
  overflow: hidden
  text-overflow: ellipsis
  text-shadow: var(--bc-text-outline)
  font-size: 0.86em
.pin__row
  display: inline-flex
  align-items: center
  gap: 0.4em
  min-height: max(2.2rem, 36px)
  padding: 0.2em 0.8em 0.26em 0.55em
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--c-hi) 0, var(--c-hi) 46%, var(--c) 46%, var(--c) 86%, var(--c-lo) 86%)
  box-shadow: 0 var(--bc-press-sm) 0 var(--bc-ink)
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
.pin__talk:active .pin__row
  transition-duration: var(--bc-t-press)
  transform: translateY(var(--bc-press-sm)) scale(1.02, 0.95)
  box-shadow: 0 0 0 var(--bc-ink)
.pin__glyph
  width: 1.25em
  height: 1.25em
  filter: drop-shadow(0 1px 0 var(--bc-ink))
.pin__label
  text-shadow: var(--bc-text-outline)
.pin--quest .pin__label, .pin--quest .pin__glyph
  color: var(--bc-ink)
  text-shadow: none
  filter: none
.pin__key
  font-size: 0.95em
  color: var(--bc-ink)

@keyframes pin-bob
  from
    transform: translateY(0)
  to
    transform: translateY(-0.28rem)
@keyframes pin-new
  from
    transform: scale(0.8)
  to
    transform: scale(1.15)
@keyframes pin-in
  from
    opacity: 0
    transform: translateX(-50%) translateY(0.5rem) scale(0.8)
@media (prefers-reduced-motion: reduce)
  .pin__badge, .pin__new, .pin__talk
    animation: none
</style>
