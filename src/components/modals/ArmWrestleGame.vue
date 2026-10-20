<template lang="pug">
  FModal(:model-value="true" :title="t('arm.title')" surface="parchment" tone="gold" @update:model-value="leave")
    div.arm(data-arm :class="`is-${phase}`")
      p.arm__lead {{ t('arm.lead') }}
      div.arm__pips(role="img" :aria-label="t('fair.row', { n: row, max: ARM_ROW })")
        span.arm__pip(v-for="i in ARM_ROW" :key="i" :class="{ 'is-on': i <= row, 'is-prize': i === ARM_DISCOUNT_ROW || i === ARM_ROW }")
      //- The table: tap anywhere on it. The ring closes on the circle once a beat.
      button.arm__table(
        type="button"
        data-arm-table
        :disabled="phase !== 'play'"
        :aria-label="t('arm.good')"
        @pointerdown.prevent="tap"
      )
        span.arm__arms(:style="{ transform: `rotate(${(0.5 - pos) * 90}deg)` }")
        span.arm__target
        span.arm__pulse(v-if="phase === 'play'" :style="{ transform: `scale(${pulse})` }")
        span.arm__flash(v-if="flash" :class="`is-${flash}`") {{ flash === 'good' ? t('arm.good') : t('arm.off') }}
      //- Who is winning: the hero's side fills to the right.
      div.arm__bar(role="meter" :aria-valuenow="Math.round(pos * 100)" aria-valuemin="0" aria-valuemax="100")
        span.arm__bar-fill(:style="{ transform: `scaleX(${pos})` }")
      p.arm__say(aria-live="polite" :class="{ 'is-good': won === true, 'is-bad': won === false }") {{ say }}
      p.arm__prize(v-for="l in lines" :key="l") {{ l }}
      template(v-if="phase !== 'play'")
        FButton.arm__start(
          :label="phase === 'over' ? t('fair.again') : t('fair.fee', { n: fmt(fee) })"
          type="success"
          size="md"
          icon="coin"
          :is-disabled="!!block"
          data-arm-start
          @click="sit"
        )
        p.arm__note(v-if="block === 'gold'") {{ t('fair.noGold') }}
        p.arm__note(v-if="capped") {{ capped }}
      p.arm__note(v-else) {{ t('arm.hint') }}
</template>

<script setup lang="ts">
/**
 * ─── Arm-Wrestle the Forgemaster's apprentice (afterplay §9) ────────────────
 *
 * A ring closes on a circle once a beat; tap as it meets it and Hob's arm
 * goes down a step, tap off the beat and the hero's slips, let a beat pass
 * and Hob leans in. Strength widens the beat (`fair.armWindow`); each win in
 * the row quickens it. Third win in a row: the smith's discount; fifth: the
 * top prize and Heroic+ material (`state/fair.settleArm`). One rAF loop sets
 * two transforms. Tap the table (pointerdown) or press Space.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { closeModal } from '@/game/flow'
import { ARM_DISCOUNT_ROW, ARM_LEAN, ARM_PUSH, ARM_ROW, ARM_SECONDS, ARM_SLIP, ARM_START, armBeat, armOnBeat, armWindow } from '@/game/fair'
import { fairBlock, fairFeeNow, heroStrength, settleArm, startFair } from '@/game/state/fair'
import { profile } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import { cappedNote, discountLine, topLines } from './fairText'

const { t } = useI18n()

type Phase = 'idle' | 'play' | 'over'
const phase = ref<Phase>('idle')
const row = computed(() => profile.meta.fair.rows.arm)
const fee = computed(() => { void profile.level; return fairFeeNow() })
const block = computed(() => { void profile.gold; return fairBlock() })
const capped = computed(() => { void profile.meta.fair.full.arm; return cappedNote(t, 'arm') })

const pos = ref(ARM_START)
const pulse = ref(2)
const flash = ref<'' | 'good' | 'off'>('')
const won = ref<boolean | null>(null)
const lines = ref<string[]>([])
const paid = ref(0)

let beat = armBeat(0)
let window_ = armWindow(0)
let start = 0
/** The last beat judged (pushed on, or let pass). */
let judged = 0
let frame = 0
let flashTimer = 0
const stop = (): void => { cancelAnimationFrame(frame); window.clearTimeout(flashTimer); frame = 0 }
onBeforeUnmount(stop)

const say = computed(() => {
  if (phase.value !== 'over') return ''
  if (!won.value) return t('fair.lost')
  return lines.value.length && !paid.value ? '' : t('fair.won', { n: fmt(paid.value) })
})

const sit = (): void => {
  if (!startFair()) { sfx('denied'); return }
  sfx('coin')
  stop()
  beat = armBeat(row.value)
  window_ = armWindow(heroStrength())
  pos.value = ARM_START
  pulse.value = 2
  flash.value = ''
  won.value = null
  lines.value = []
  paid.value = 0
  judged = 0
  phase.value = 'play'
  start = performance.now()
  frame = requestAnimationFrame(tick)
}

const show = (f: 'good' | 'off'): void => {
  flash.value = f
  window.clearTimeout(flashTimer)
  flashTimer = window.setTimeout(() => { flash.value = '' }, 260)
}

/** One frame: the ring closes on the next beat; a beat let pass is Hob's push. */
const tick = (now: number): void => {
  if (phase.value !== 'play') return
  const s = (now - start) / 1000
  const k = Math.ceil(s / beat)
  pulse.value = 1 + (k * beat - s) / beat
  const missed = Math.floor((s - window_) / beat)
  if (missed > judged) {
    pos.value = Math.max(0, pos.value - ARM_LEAN * (missed - judged))
    judged = missed
  }
  if (pos.value <= 0 || s >= ARM_SECONDS) { end(false); return }
  frame = requestAnimationFrame(tick)
}

const tap = (): void => {
  if (phase.value !== 'play') return
  const s = (performance.now() - start) / 1000
  const k = Math.round(s / beat)
  if (armOnBeat(s, beat, window_) && k > judged) {
    judged = k
    pos.value = Math.min(1, pos.value + ARM_PUSH)
    sfx('hitBlunt')
    show('good')
    if (pos.value >= 1) end(true)
  } else {
    pos.value = Math.max(0, pos.value - ARM_SLIP)
    sfx('block')
    show('off')
    if (pos.value <= 0) end(false)
  }
}

const end = (win: boolean): void => {
  stop()
  phase.value = 'over'
  won.value = win
  const r = settleArm(win)
  paid.value = r.gold
  lines.value = [...(r.top ? topLines(t, r.top) : []), ...(r.discount ? [discountLine(t)] : [])]
  sfx(win ? (r.top ? 'lootRare' : 'coin') : 'denied')
}

/** Leaving mid-bout: the bout is lost. */
const leave = (): void => {
  if (phase.value === 'play') { stop(); settleArm(false) }
  closeModal()
}

const onKey = (e: KeyboardEvent): void => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
  if (e.key !== ' ' && e.key !== 'Enter') return
  if (phase.value === 'play') { e.preventDefault(); tap() }
  else if (!(e.target instanceof HTMLButtonElement) && !block.value) { e.preventDefault(); sit() }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.arm
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.35rem, 1.6vmin, 0.7rem)
  width: min(30rem, 100%)
  padding-bottom: 0.4rem
.arm__lead, .arm__note
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.72rem, 3vmin, 0.92rem)
  line-height: 1.3
  text-align: center
.arm__say
  min-height: 1.4em
  margin: 0
  +cel.label
  color: var(--bc-on)
  font-size: clamp(0.9rem, 3.6vmin, 1.15rem)
  text-align: center
  &.is-good
    color: var(--bc-on-good)
  &.is-bad
    color: var(--bc-on-bad)
.arm__prize
  margin: 0
  +cel.label
  color: var(--bc-on-accent)
  font-size: clamp(0.8rem, 3.2vmin, 1rem)
  text-align: center
.arm__pips
  display: flex
  gap: 0.4rem
.arm__pip
  width: clamp(0.8rem, 3vmin, 1.1rem)
  aspect-ratio: 1
  border-radius: 50%
  border: 2px solid var(--bc-on-soft)
  opacity: 0.55
  &.is-prize
    border-radius: 25%
    transform: rotate(45deg)
  &.is-on
    opacity: 1
    background: radial-gradient(circle at 35% 30%, #fff2a8, #e0a84a)
    border-color: #8a5a1a

// The table: one big touch target; the locked arms tilt, the ring pulses.
.arm__table
  position: relative
  width: min(18rem, 100%)
  aspect-ratio: 1
  padding: 0
  border-radius: 50%
  background: radial-gradient(circle, #9a6a3a, #6a4422 70%)
  border: 4px solid #3a2410
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  &:disabled
    cursor: default
  &:focus-visible
    outline: 3px solid var(--bc-on-accent)
    outline-offset: 3px
.arm__arms
  position: absolute
  left: calc(50% - 0.9rem)
  top: 12%
  width: 1.8rem
  height: 38%
  border-radius: 0.9rem
  background: linear-gradient(180deg, #c89070 50%, #e8b890 50%)
  border: 3px solid #4a2a12
  transform-origin: 50% 100%
  will-change: transform
  &::before
    content: ''
    position: absolute
    left: -0.35rem
    right: -0.35rem
    top: -0.6rem
    height: 1.4rem
    border-radius: 50%
    background: #d8a880
    border: 3px solid #4a2a12
.arm__target, .arm__pulse
  position: absolute
  left: calc(50% - 2.6rem)
  bottom: 10%
  width: 5.2rem
  aspect-ratio: 1
  border-radius: 50%
  pointer-events: none
.arm__target
  border: 4px solid rgba(255, 240, 200, 0.85)
.arm__pulse
  border: 3px solid #ffd24a
  will-change: transform
.arm__flash
  position: absolute
  left: 0
  right: 0
  top: 52%
  +cel.label
  font-size: clamp(1rem, 4vmin, 1.3rem)
  pointer-events: none
  &.is-good
    color: #fff2a8
  &.is-off
    color: #ff8a7a
.arm__bar
  position: relative
  width: min(18rem, 100%)
  height: 0.6rem
  border-radius: 0.3rem
  background: #8a2a2a
  overflow: hidden
.arm__bar-fill
  position: absolute
  inset: 0
  background: linear-gradient(90deg, #4f9a4a, #8fe07a)
  transform-origin: left
@media (max-height: 30rem)
  .arm__lead
    display: none
  .arm__table
    width: 10rem
</style>
