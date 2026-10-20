<template lang="pug">
  FModal(:model-value="true" :title="t('whack.title')" surface="parchment" tone="gold" @update:model-value="leave")
    div.whack(data-whack :class="`is-${phase}`")
      p.whack__lead {{ t('whack.lead') }}
      div.whack__pips(role="img" :aria-label="t('fair.row', { n: row, max: WHACK_ROW })")
        span.whack__pip(v-for="i in WHACK_ROW" :key="i" :class="{ 'is-on': i <= row, 'is-prize': i === WHACK_ROW }")
      p.whack__stats(v-if="phase !== 'idle'")
        span {{ t('whack.hits', { n: hits, max: WHACK_GOAL }) }}
        span {{ t('whack.lives', { n: lives }) }}
        span {{ t('whack.time', { n: Math.ceil(left) }) }}
      //- The barrels: tap where an imp sticks its head out; the gold ones bite back.
      div.whack__grid
        button.whack__hole(
          v-for="(h, i) in holes"
          :key="i"
          type="button"
          :data-hole="i"
          :class="{ 'is-up': h.up, 'is-gold': h.gold, 'is-bonk': h.bonk }"
          :disabled="phase !== 'play'"
          :aria-label="t('whack.barrel', { n: i + 1 })"
          @pointerdown.prevent="whack(i)"
        )
          span.whack__imp
          span.whack__barrel
      p.whack__say(aria-live="polite" :class="{ 'is-good': won === true, 'is-bad': won === false }") {{ say }}
      p.whack__prize(v-for="l in lines" :key="l") {{ l }}
      template(v-if="phase !== 'play'")
        FButton.whack__start(
          :label="phase === 'over' ? t('fair.again') : t('fair.fee', { n: fmt(fee) })"
          type="success"
          size="md"
          icon="coin"
          :is-disabled="!!block"
          data-whack-start
          @click="sit"
        )
        p.whack__note(v-if="block === 'gold'") {{ t('fair.noGold') }}
        p.whack__note(v-if="capped") {{ capped }}
      p.whack__note(v-else) {{ t('whack.hint') }}
</template>

<script setup lang="ts">
/**
 * ─── Whack-a-Imp (afterplay §9) ─────────────────────────────────────────────
 *
 * Pip's nine barrels: imps pop up for 0.6 s, then for less and less; hit 20 in
 * 30 seconds. A gold armoured imp costs a life when hit, three lives a round.
 * The round is dealt up front (`fair.dealWhack`), one rAF loop runs it and
 * touches only the nine holes' flags, so a weak phone keeps up. Tap a barrel
 * (pointerdown, no click delay) or press 1–9. Leaving mid-round loses it.
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { closeModal } from '@/game/flow'
import { WHACK_GOAL, WHACK_HOLES, WHACK_LIVES, WHACK_ROW, WHACK_SECONDS, dealWhack, type WhackPop } from '@/game/fair'
import { fairBlock, fairFeeNow, settleWhack, startFair } from '@/game/state/fair'
import { profile } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import { cappedNote, topLines } from './fairText'

const { t } = useI18n()

type Phase = 'idle' | 'play' | 'over'
const phase = ref<Phase>('idle')
const row = computed(() => profile.meta.fair.rows.whack)
const fee = computed(() => { void profile.level; return fairFeeNow() })
const block = computed(() => { void profile.gold; return fairBlock() })
const capped = computed(() => { void profile.meta.fair.full.whack; return cappedNote(t, 'whack') })

interface Hole { up: boolean; gold: boolean; bonk: boolean; pop: number }
const holes = reactive<Hole[]>(Array.from({ length: WHACK_HOLES }, () => ({ up: false, gold: false, bonk: false, pop: -1 })))
const hits = ref(0)
const lives = ref(WHACK_LIVES)
const left = ref(WHACK_SECONDS)
const won = ref<boolean | null>(null)
const timedOut = ref(false)
const lines = ref<string[]>([])

let pops: WhackPop[] = []
let next = 0
let start = 0
let frame = 0
let seq = 0
const stop = (): void => { cancelAnimationFrame(frame); frame = 0 }
onBeforeUnmount(stop)

const say = computed(() => {
  if (phase.value !== 'over') return ''
  if (won.value) return lines.value.length ? '' : t('fair.won', { n: fmt(paid.value) })
  return timedOut.value ? t('whack.timeout') : lives.value <= 0 ? t('whack.dead') : t('fair.lost')
})
const paid = ref(0)

const clear = (): void => { for (const h of holes) { h.up = false; h.gold = false; h.bonk = false; h.pop = -1 } }

const sit = (): void => {
  if (!startFair()) { sfx('denied'); return }
  sfx('coin')
  stop()
  pops = dealWhack(row.value, (Date.now() ^ (++seq * 2654435761)) >>> 0)
  next = 0
  clear()
  hits.value = 0
  lives.value = WHACK_LIVES
  left.value = WHACK_SECONDS
  won.value = null
  timedOut.value = false
  lines.value = []
  paid.value = 0
  phase.value = 'play'
  start = performance.now()
  frame = requestAnimationFrame(tick)
}

/** One frame: imps due pop up, imps whose time is over duck back down. */
const tick = (now: number): void => {
  if (phase.value !== 'play') return
  const s = (now - start) / 1000
  left.value = Math.max(0, WHACK_SECONDS - s)
  while (next < pops.length && pops[next]!.at <= s) {
    const p = pops[next]!
    const h = holes[p.hole]!
    h.up = true; h.gold = p.gold; h.bonk = false; h.pop = next
    next++
  }
  for (const h of holes) {
    if (h.pop < 0) continue
    const p = pops[h.pop]!
    if (s >= p.at + p.up + (h.bonk ? 0.15 : 0)) { h.up = false; h.bonk = false; h.pop = -1 }
  }
  if (left.value <= 0) { timedOut.value = true; end(false); return }
  frame = requestAnimationFrame(tick)
}

const whack = (i: number): void => {
  if (phase.value !== 'play') return
  const h = holes[i]!
  if (!h.up || h.bonk) { sfx('swing'); return }
  h.bonk = true
  if (h.gold) {
    sfx('block')
    lives.value--
    if (lives.value <= 0) end(false)
    return
  }
  sfx('hitBlunt')
  hits.value++
  if (hits.value >= WHACK_GOAL) end(true)
}

const end = (win: boolean): void => {
  stop()
  phase.value = 'over'
  won.value = win
  const r = settleWhack(win)
  paid.value = r.gold
  lines.value = r.top ? topLines(t, r.top) : []
  sfx(win ? (r.top ? 'lootRare' : 'coin') : 'denied')
}

/** Leaving mid-round: the round is lost. */
const leave = (): void => {
  if (phase.value === 'play') { stop(); settleWhack(false) }
  closeModal()
}

const onKey = (e: KeyboardEvent): void => {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (phase.value === 'play') {
    const k = Number(e.key)
    if (k >= 1 && k <= WHACK_HOLES) { e.preventDefault(); whack(k - 1) }
  } else if ((e.key === ' ' || e.key === 'Enter') && !(e.target instanceof HTMLButtonElement) && !block.value) {
    e.preventDefault()
    sit()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.whack
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.35rem, 1.6vmin, 0.7rem)
  width: min(30rem, 100%)
  padding-bottom: 0.4rem
.whack__lead, .whack__note
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.72rem, 3vmin, 0.92rem)
  line-height: 1.3
  text-align: center
.whack__stats, .whack__say
  display: flex
  gap: 1rem
  margin: 0
  +cel.label
  color: var(--bc-on)
  font-size: clamp(0.78rem, 3vmin, 0.95rem)
.whack__say
  min-height: 1.4em
  font-size: clamp(0.9rem, 3.6vmin, 1.15rem)
  &.is-good
    color: var(--bc-on-good)
  &.is-bad
    color: var(--bc-on-bad)
.whack__prize
  margin: 0
  +cel.label
  color: var(--bc-on-accent)
  font-size: clamp(0.8rem, 3.2vmin, 1rem)
  text-align: center
.whack__pips
  display: flex
  gap: 0.4rem
.whack__pip
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

// The barrels: a 3×3 grid, each a big touch target.
.whack__grid
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: clamp(0.4rem, 2vmin, 0.8rem)
  width: min(22rem, 100%)
.whack__hole
  position: relative
  aspect-ratio: 1
  padding: 0
  background: none
  border: 0
  overflow: hidden
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  &:disabled
    cursor: default
  &:focus-visible
    outline: 3px solid var(--bc-on-accent)
    outline-offset: 2px
    border-radius: 0.6rem
.whack__barrel
  position: absolute
  left: 8%
  right: 8%
  bottom: 0
  height: 46%
  border-radius: 0.5rem 0.5rem 0.7rem 0.7rem
  background: repeating-linear-gradient(90deg, #8a5a2a 0 18%, #7a4a22 18% 20%), #8a5a2a
  border: 3px solid #4a2a12
  box-shadow: inset 0 0.35rem 0 #b9c4d6, inset 0 -0.35rem 0 #b9c4d6
  z-index: 2
// An imp: a red head with two horns, up out of the barrel by a transform only.
.whack__imp
  position: absolute
  left: 22%
  right: 22%
  bottom: 30%
  height: 52%
  border-radius: 50% 50% 42% 42%
  background: radial-gradient(circle at 32% 40%, #fff 0 7%, #000 8% 11%, transparent 12%), radial-gradient(circle at 68% 40%, #fff 0 7%, #000 8% 11%, transparent 12%), #d8443a
  border: 3px solid #5a1410
  transform: translateY(110%)
  transition: transform 0.08s ease-out
  z-index: 1
  &::before, &::after
    content: ''
    position: absolute
    top: -18%
    width: 22%
    height: 30%
    background: #3a1a12
    clip-path: polygon(50% 0, 100% 100%, 0 100%)
  &::before
    left: 8%
  &::after
    right: 8%
  .is-up &
    transform: translateY(0)
  .is-gold &
    background: radial-gradient(circle at 32% 40%, #fff 0 7%, #000 8% 11%, transparent 12%), radial-gradient(circle at 68% 40%, #fff 0 7%, #000 8% 11%, transparent 12%), linear-gradient(135deg, #fff2a8, #e0a84a 55%, #9a6a1a)
    border-color: #6a4a10
  .is-bonk &
    transform: translateY(25%) scaleY(0.75)
@media (prefers-reduced-motion: reduce)
  .whack__imp
    transition-duration: 0.01ms
@media (max-height: 30rem)
  .whack__lead
    display: none
  .whack__grid
    width: min(14rem, 100%)
</style>
