<template lang="pug">
  FModal(:model-value="true" :title="t('ring.title')" surface="parchment" tone="gold" @update:model-value="leave")
    div.ring(data-ring :class="`is-${phase}`")
      p.ring__lead {{ t('ring.lead') }}
      p.ring__stats(v-if="phase !== 'idle'")
        span {{ t('ring.rings', { n: RING_RINGS - tosses.length }) }}
        span {{ t('ring.score', { n: score }) }}
      //- The wooden hydra: three heads at three distances, swaying across the middle stake.
      div.ring__table(
        data-ring-table
        @pointerdown.prevent="hold"
        @pointerup.prevent="release"
        @pointercancel="release"
        @pointerleave="release"
      )
        span.ring__stake
        span.ring__head(
          v-for="(d, i) in RING_DEPTHS"
          :key="i"
          :data-head="i"
          :class="{ 'is-rung': rung === i }"
          :style="{ bottom: `${headBottom(d)}%`, transform: `translateX(${sway[i]! * 40}%) scale(${1.15 - d * 0.5})` }"
        )
        span.ring__ring(v-if="phase === 'fly' || landed" :style="{ bottom: `${ringBottom}%` }" :class="{ 'is-in': rung >= 0 }")
        //- The power bar fills while held.
        span.ring__power(v-if="phase === 'aim' || phase === 'fly'" role="meter" :aria-label="t('ring.power')" :aria-valuenow="Math.round(power * 100)")
          span.ring__power-fill(:style="{ transform: `scaleY(${power})` }")
          span.ring__power-mark(v-for="d in RING_DEPTHS" :key="d" :style="{ bottom: `${d * 100}%` }")
      p.ring__say(aria-live="polite" :class="{ 'is-good': good, 'is-bad': phase === 'over' && !good }") {{ say }}
      p.ring__prize(v-for="l in lines" :key="l") {{ l }}
      template(v-if="phase === 'idle' || phase === 'over'")
        FButton.ring__start(
          :label="phase === 'over' ? t('fair.again') : t('fair.fee', { n: fmt(fee) })"
          type="success"
          size="md"
          icon="coin"
          :is-disabled="!!block"
          data-ring-start
          @click="sit"
        )
        p.ring__note(v-if="block === 'gold'") {{ t('fair.noGold') }}
        p.ring__note(v-if="capped") {{ capped }}
      p.ring__note(v-else) {{ t('ring.hint') }}
</template>

<script setup lang="ts">
/**
 * ─── Ring Toss at the Hydra (afterplay §9) ──────────────────────────────────
 *
 * Old Bess's wooden hydra: three heads at three distances sway across the
 * middle. Hold anywhere on the table (or Space) and the power bar climbs and
 * falls; let go and the ring flies as far as the power says. A head takes it
 * only when it is near the middle as the ring lands (`fair.ringHit`). Five
 * rings; ringed heads in a row count up; all five is a perfect round (the
 * top prize and the Tidecaller's flag, `state/fair.settleRing`). One rAF loop
 * moves three heads by transform. Leaving mid-round scores what was thrown.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { closeModal } from '@/game/flow'
import { RING_DEPTHS, RING_FLIGHT, RING_RINGS, dealHeads, headSway, ringHit, ringPower, ringScore, type RingHead } from '@/game/fair'
import { fairBlock, fairFeeNow, settleRing, startFair } from '@/game/state/fair'
import { profile } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import { cappedNote, topLines } from './fairText'

const { t } = useI18n()

type Phase = 'idle' | 'aim' | 'fly' | 'over'
const phase = ref<Phase>('idle')
const fee = computed(() => { void profile.level; return fairFeeNow() })
const block = computed(() => { void profile.gold; return fairBlock() })
const capped = computed(() => { void profile.meta.fair.full.ring; return cappedNote(t, 'ring') })

let heads: RingHead[] = dealHeads(1)
const sway = ref<number[]>(heads.map(h => headSway(h, 0)))
const tosses = ref<boolean[]>([])
const score = computed(() => ringScore(tosses.value))
const power = ref(0)
const holding = ref(false)
const rung = ref(-1)
const landed = ref(false)
const ringBottom = ref(0)
const lines = ref<string[]>([])
const good = ref(false)
const result = ref('')

let start = 0
let held = 0
let frame = 0
let timer = 0
let seq = 0
const stop = (): void => { cancelAnimationFrame(frame); window.clearTimeout(timer); frame = 0; timer = 0 }
onBeforeUnmount(stop)

/** Where a head of this depth stands on the table, % from the bottom. */
const headBottom = (d: number): number => 8 + d * 78

const say = computed(() => {
  if (phase.value === 'over') return result.value
  if (landed.value) return rung.value >= 0 ? t('ring.hit', { n: run() }) : t('ring.miss')
  return ''
})
/** The points the last toss was worth (the ringed heads in a row so far). */
const run = (): number => { let r = 0; for (let i = tosses.value.length - 1; i >= 0 && tosses.value[i]; i--) r++; return r }

const sit = (): void => {
  if (!startFair()) { sfx('denied'); return }
  sfx('coin')
  stop()
  heads = dealHeads((Date.now() ^ (++seq * 2654435761)) >>> 0)
  tosses.value = []
  lines.value = []
  rung.value = -1
  landed.value = false
  good.value = false
  result.value = ''
  power.value = 0
  holding.value = false
  phase.value = 'aim'
  start = performance.now()
  frame = requestAnimationFrame(tick)
}

/** One frame: the heads sway; while held, the power bar moves. */
const tick = (now: number): void => {
  if (phase.value !== 'aim' && phase.value !== 'fly') return
  const s = (now - start) / 1000
  sway.value = heads.map(h => headSway(h, s))
  if (holding.value) power.value = ringPower((now - held) / 1000)
  frame = requestAnimationFrame(tick)
}

const hold = (): void => {
  if (phase.value !== 'aim' || holding.value) return
  holding.value = true
  landed.value = false
  rung.value = -1
  held = performance.now()
}

const release = (): void => {
  if (phase.value !== 'aim' || !holding.value) return
  holding.value = false
  const now = performance.now()
  const p = ringPower((now - held) / 1000)
  power.value = p
  const hit = ringHit(p, (now - start) / 1000, heads)
  sfx('swing')
  phase.value = 'fly'
  ringBottom.value = 4
  // The ring flies up the middle to the depth the power reached.
  requestAnimationFrame(() => { ringBottom.value = headBottom(p) })
  timer = window.setTimeout(() => land(hit), RING_FLIGHT * 1000)
}

const land = (hit: number): void => {
  tosses.value = [...tosses.value, hit >= 0]
  rung.value = hit
  landed.value = true
  sfx(hit >= 0 ? 'hitBlunt' : 'denied')
  if (tosses.value.length >= RING_RINGS) { finish(); return }
  phase.value = 'aim'
}

const finish = (): void => {
  stop()
  const r = settleRing(tosses.value)
  phase.value = 'over'
  good.value = r.tier > 0
  lines.value = r.top ? topLines(t, r.top) : []
  result.value = r.tier === 4 ? t('ring.perfect') : r.gold ? t('fair.won', { n: fmt(r.gold) }) : t('ring.nothing', { n: r.score })
  sfx(r.tier === 4 ? 'lootRare' : r.gold ? 'coin' : 'denied')
}

/** Leaving mid-round: the rings not thrown are misses. */
const leave = (): void => {
  if (phase.value === 'aim' || phase.value === 'fly') {
    stop()
    settleRing([...tosses.value, ...new Array<boolean>(RING_RINGS - tosses.value.length).fill(false)])
  }
  closeModal()
}

const onKeyDown = (e: KeyboardEvent): void => {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (e.key !== ' ' && e.key !== 'Enter') return
  if (phase.value === 'aim') { e.preventDefault(); if (!e.repeat) hold() }
  else if ((phase.value === 'idle' || phase.value === 'over') && !(e.target instanceof HTMLButtonElement) && !block.value) { e.preventDefault(); sit() }
}
const onKeyUp = (e: KeyboardEvent): void => { if (e.key === ' ' || e.key === 'Enter') release() }
onMounted(() => { window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp) })
onBeforeUnmount(() => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) })
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.ring
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.35rem, 1.6vmin, 0.7rem)
  width: min(30rem, 100%)
  padding-bottom: 0.4rem
.ring__lead, .ring__note
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.72rem, 3vmin, 0.92rem)
  line-height: 1.3
  text-align: center
.ring__stats, .ring__say
  display: flex
  gap: 1rem
  margin: 0
  +cel.label
  color: var(--bc-on)
  font-size: clamp(0.78rem, 3vmin, 0.95rem)
.ring__say
  min-height: 1.4em
  font-size: clamp(0.9rem, 3.6vmin, 1.15rem)
  &.is-good
    color: var(--bc-on-good)
  &.is-bad
    color: var(--bc-on-bad)
.ring__prize
  margin: 0
  +cel.label
  color: var(--bc-on-accent)
  font-size: clamp(0.8rem, 3.2vmin, 1rem)
  text-align: center

// The table: a wooden board seen from the thrower's end.
.ring__table
  position: relative
  width: 100%
  height: clamp(12rem, 46vmin, 18rem)
  border-radius: 0.8rem
  background: linear-gradient(180deg, #5a7a4a, #7a5a32 60%, #8a6a3a)
  border: 3px solid #4a2a12
  overflow: hidden
  touch-action: none
  user-select: none
  -webkit-user-select: none
  -webkit-tap-highlight-color: transparent
  cursor: pointer
.ring__stake
  position: absolute
  left: 50%
  top: 4%
  bottom: 4%
  width: 0
  border-left: 2px dashed rgba(255, 240, 200, 0.45)
// A head: a green wooden snout on a stalk; the farther, the smaller (scale only).
.ring__head
  position: absolute
  left: calc(50% - 1.6rem)
  width: 3.2rem
  height: 2.4rem
  border-radius: 50% 50% 40% 40%
  background: radial-gradient(circle at 30% 35%, #fff 0 8%, #000 9% 13%, transparent 14%), radial-gradient(circle at 70% 35%, #fff 0 8%, #000 9% 13%, transparent 14%), linear-gradient(180deg, #5fae5a, #2f6a34)
  border: 3px solid #1f3a1f
  will-change: transform
  &::after
    content: ''
    position: absolute
    left: 38%
    top: 92%
    width: 24%
    height: 3rem
    background: linear-gradient(90deg, #2f6a34, #4f8a44, #2f6a34)
  &.is-rung
    border-color: #ffd24a
    box-shadow: 0 0 0.8rem rgba(255, 210, 74, 0.9)
// The ring flies up the middle by `bottom` (one transition per toss).
.ring__ring
  position: absolute
  left: calc(50% - 1.1rem)
  width: 2.2rem
  height: 0.9rem
  border-radius: 50%
  border: 0.35rem solid #e8c060
  box-shadow: 0 0.15rem 0 rgba(0, 0, 0, 0.3)
  transition: bottom 0.5s cubic-bezier(0.2, 0.7, 0.4, 1)
  z-index: 3
  &.is-in
    border-color: #ffe98a
.ring__power
  position: absolute
  right: 0.5rem
  top: 8%
  bottom: 8%
  width: 0.8rem
  border-radius: 0.4rem
  background: rgba(0, 0, 0, 0.35)
  overflow: hidden
.ring__power-fill
  position: absolute
  inset: 0
  background: linear-gradient(0deg, #e0a84a, #ff6a3a)
  transform-origin: bottom
.ring__power-mark
  position: absolute
  left: 0
  right: 0
  height: 2px
  background: rgba(255, 255, 255, 0.8)
@media (prefers-reduced-motion: reduce)
  .ring__ring
    transition-duration: 0.01ms
@media (max-height: 30rem)
  .ring__lead
    display: none
  .ring__table
    height: 10rem
</style>
