<template lang="pug">
  div.lesson-card(
    v-if="open"
    ref="rootEl"
    role="dialog"
    :aria-label="t(`train.name.${hud.trainId}`)"
    @pointerdown.prevent.stop="dismiss"
  )
    //- The lightbox: time is frozen and everything dims but the subject,
    //- lit through a soft hole that follows it (`place()`).
    div.dim(ref="dimEl" aria-hidden="true")
    div.card
      div.head
        span.badge
          GameIcon(:name="ICON[hud.trainId] ?? 'star'")
        span.title {{ t(`train.name.${hud.trainId}`) }}
      p.text {{ t(`train.card.${hud.trainId}`) }}
      div.how(aria-hidden="true")
        InputGlyph(v-if="glyph" v-bind="glyph")
        span.arrow →
        span.act
          GameIcon(:name="ICON[hud.trainId] ?? 'star'")
      //- Any press continues: the glyph of a tap or a click, pulsing.
      div.go(aria-hidden="true")
        InputGlyph(v-if="hud.device === 'touch'" kind="finger" mode="tap")
        InputGlyph(v-else kind="mouse" button="left" :click="true")
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { hud, addHudTicker } from '@/game/state/hud'
import { currentMission } from '@/game/boot'
import { doorInput } from '@/game/sim/doorPrompt'
import type { WalkNeed } from '@/game/sim/walkthrough'
import InputGlyph from './InputGlyph.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import type { GameIconName } from '@/components/icons/iconNames'

/**
 * A lesson's card (`sim/training.ts`): time frozen, the view dimmed round the
 * lesson's subject, one short explanation of what the move is FOR, the input
 * that does it (the coach's glyph language) and a pulsing tap / click: any
 * press continues, to the demo. Never timed.
 */
const { t } = useI18n()
const open = computed(() => hud.trainPhase === 'card' && hud.freezeKind === 'lesson' && !!hud.trainId)

const ICON: Partial<Record<string, GameIconName>> = {
  charge: 'bolt', block: 'shield', slide: 'dodge', gel: 'flask', gap: 'up', weapon: 'buster'
}
/** The input the lesson teaches, as a glyph (the door prompt's mapping). */
const glyph = computed(() => {
  const id = hud.trainId
  const need: WalkNeed | null = id === 'charge' ? 'charge' : id === 'block' ? 'block' : id === 'slide' ? 'slide' : id === 'gel' ? 'gel' : null
  if (!need) return null
  const i = doorInput(need, hud.device)
  return { kind: i.kind, button: i.button, hold: i.hold, click: i.click, code: i.code, wide: i.wide, mode: i.mode }
})

const rootEl = ref<HTMLElement | null>(null)
const dimEl = ref<HTMLElement | null>(null)
const pt = { x: 0, y: 0, visible: false }
let off: (() => void) | null = null

const dismiss = () => currentMission()?.dismissTrainingCard()

/** The spotlight follows the subject on screen (the frozen world does not
 *  move, but a resize or the camera settling does). */
const place = (): void => {
  const m = currentMission()
  const dim = dimEl.value
  if (!open.value || !m || !dim) return
  const s = m.trainSpot
  let x = 50
  let y = 45
  if (s) {
    m.project(s.x, s.y, s.z, pt)
    if (pt.visible) {
      x = Math.min(90, Math.max(10, (pt.x / window.innerWidth) * 100))
      y = Math.min(85, Math.max(10, (pt.y / window.innerHeight) * 100))
    }
  }
  dim.style.setProperty('--sx', `${x.toFixed(1)}%`)
  dim.style.setProperty('--sy', `${y.toFixed(1)}%`)
}

onMounted(() => { off = addHudTicker(place) })
onUnmounted(() => off?.())
</script>

<style scoped lang="sass">
.lesson-card
  position: absolute
  inset: 0
  z-index: 30
  display: flex
  align-items: flex-end
  justify-content: center
  padding: 0 clamp(12px, 4vw, 40px) calc(env(safe-area-inset-bottom, 0px) + clamp(14px, 6vh, 60px))
  cursor: pointer
  touch-action: none
.dim
  --sx: 50%
  --sy: 45%
  position: absolute
  inset: 0
  background: radial-gradient(circle at var(--sx) var(--sy), transparent 0, transparent clamp(60px, 13vmin, 120px), rgba(4, 7, 18, 0.72) clamp(110px, 24vmin, 220px))
  animation: dim-in 0.35s ease-out both
@keyframes dim-in
  from
    opacity: 0
.card
  position: relative
  width: min(92vw, 520px)
  padding: clamp(12px, 2.6vmin, 20px) clamp(14px, 3vmin, 24px)
  border-radius: 16px
  border: 3px solid #ffd84a
  background: linear-gradient(#1c2446, #10152c)
  box-shadow: 0 0 22px rgba(255, 216, 74, 0.45), 0 6px 0 rgba(0, 0, 0, 0.4)
  color: #fff
  font-family: var(--font-ui)
  display: flex
  flex-direction: column
  gap: clamp(6px, 1.4vmin, 12px)
  animation: card-in 0.4s cubic-bezier(0.2, 1.4, 0.4, 1) both
@keyframes card-in
  from
    transform: translateY(24px) scale(0.92)
    opacity: 0
.head
  display: flex
  align-items: center
  gap: 10px
.badge, .act
  display: grid
  place-items: center
  width: clamp(30px, 6vmin, 40px)
  height: clamp(30px, 6vmin, 40px)
  border-radius: 50%
  background: radial-gradient(circle at 40% 30%, #fff3b0, #ffd84a 50%, #d99a00)
  border: 2px solid #141a33
  color: #141a33
  :deep(.game-icon)
    width: 62%
    height: 62%
.title
  font-size: clamp(15px, 3.4vmin, 21px)
  color: #ffd84a
.text
  margin: 0
  font-size: clamp(13px, 2.8vmin, 17px)
  line-height: 1.35
.how
  display: flex
  align-items: center
  justify-content: center
  gap: 10px
  height: clamp(48px, 10vmin, 72px)
  :deep(.glyph)
    height: 100%
.arrow
  color: #7fe8ff
  font-size: 1.4em
.go
  position: absolute
  right: clamp(8px, 2vmin, 14px)
  top: clamp(8px, 2vmin, 14px)
  width: clamp(30px, 6vmin, 42px)
  opacity: 0.85
  animation: go-bob 1.2s ease-in-out infinite
@keyframes go-bob
  50%
    transform: translateY(-4px)
@media (prefers-reduced-motion: reduce)
  .dim, .card, .go
    animation: none
</style>
