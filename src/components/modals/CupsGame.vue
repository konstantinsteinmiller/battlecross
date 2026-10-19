<template lang="pug">
  FModal(:model-value="true" :title="t('cups.title')" surface="parchment" tone="gold" @update:model-value="leave")
    div.cups(data-cups :class="[`is-${phase}`, { 'is-hit': won === true, 'is-miss': won === false }]")
      p.cups__lead {{ t('cups.lead') }}
      //- The row of wins: five pips, and what the next win pays.
      div.cups__pips(role="img" :aria-label="t('cups.row', { n: row, max: CUPS_ROW })")
        span.cups__pip(v-for="i in CUPS_ROW" :key="i" :class="{ 'is-on': i <= row, 'is-prize': i === CUPS_BONUS_ROW || i === CUPS_ROW }")
      p.cups__row {{ t('cups.row', { n: row, max: CUPS_ROW }) }} · {{ t('cups.next', { n: fmt(cupsPayout(row)) }) }}
      //- The table: the cups sit in slots and trade places by `left`.
      div.cups__table(:style="{ '--n': n, '--ms': `${cfg.ms}ms` }")
        button.cups__slot(
          v-for="(s, c) in slotOf"
          :key="c"
          type="button"
          :data-cup="c"
          :data-slot="s"
          :class="{ 'is-lift': lifted(c), 'is-pick': picked === s, 'is-shake': suspense && picked === s }"
          :style="{ left: `${(s * 100) / n}%` }"
          :disabled="phase !== 'pick'"
          :aria-label="t('cups.cup', { n: s + 1 })"
          @click="pick(s)"
        )
          span.cups__gem(v-if="showGem(c)")
          span.cups__cup
            img.cups__img(:src="cupSrc" alt="" draggable="false")
            span.cups__num {{ s + 1 }}
      div.cups__sand(v-if="phase === 'pick'" role="timer" :aria-label="`${Math.ceil(left)}`")
        span.cups__sand-fill(:style="{ transform: `scaleX(${left / CUPS_PICK_SECONDS})` }")
      p.cups__say(aria-live="polite" :class="{ 'is-bad': phase === 'over' && !won, 'is-good': phase === 'over' && won }") {{ say }}
      p.cups__prize(v-if="phase === 'over' && prize") {{ prize.item ? t('gamble.prize', { item: t(`item.${prize.item}.name`) }) : t('gamble.prizeGold', { n: fmt(prize.gold) }) }}
      div.cups__sparks(v-if="phase === 'over' && won" aria-hidden="true")
        span(v-for="i in 10" :key="i" :style="{ '--a': `${i * 36}deg`, '--d': `${i % 3}` }")
      //- Sitting down: the day's first round is free; the ante after that.
      template(v-if="phase === 'idle' || phase === 'over'")
        FButton.cups__start(
          :label="phase === 'over' ? t('cups.again') : free ? t('cups.free') : t('cups.fee', { n: fmt(CUPS_ANTE) })"
          :type="free ? 'primary' : 'success'"
          size="md"
          icon="coin"
          :attention="free"
          :is-disabled="!!block || suspense"
          data-cups-start
          @click="sit"
        )
        p.cups__note(v-if="block === 'gold'") {{ t('cups.noGold') }}
      p.cups__note(v-else-if="phase === 'pick'") {{ t('cups.hint') }}
</template>

<script setup lang="ts">
/**
 * ─── The cup stand (roadmap #136) ───────────────────────────────────────────
 *
 * A gem shows under one cup, the cups cover it and trade places faster and
 * faster, the hero points at the one that hides it. A round is a few seconds;
 * the day's first is free, the very first ever is slow so it is won, each win
 * in a row pays more, the third brings a prize piece and the fifth a great
 * one (`gamble.ts`, `profile.startCups` / `settleCups`). Tap a cup or press
 * its number. Leaving mid-round loses it; a result never blocks the way out.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { closeModal } from '@/game/flow'
import { UI_ART } from '@/game/assets/overrides'
import { CUP_SVG } from '@/game/art/brandRefs'
import { cupsBlock, cupsFree, profile, settleCups, startCups } from '@/game/state/profile'
import { CUPS_ANTE, CUPS_BONUS_ROW, CUPS_PEEK, CUPS_PICK_SECONDS, CUPS_ROW, cupsNearMiss, cupsPayout, cupsRound, dealCups, type CupsRound } from '@/game/gamble'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'

const { t } = useI18n()

type Phase = 'idle' | 'peek' | 'shuffle' | 'pick' | 'over'
const phase = ref<Phase>('idle')
/** The painted wooden cup (`images/ui/cup.webp`), else its drawing. */
const cupSrc = UI_ART.get('cup') ?? `data:image/svg+xml,${encodeURIComponent(CUP_SVG)}`
const row = computed(() => profile.meta.gamble.cups.row)
const free = computed(() => { void profile.meta.gamble.cups.day; return cupsFree() })
const block = computed(() => { void profile.gold; void profile.meta.gamble.cups.day; return cupsBlock() })
const cfg = ref<CupsRound>(cupsRound(profile.meta.gamble.cups.row, !profile.meta.gamble.cups.seen))
const n = computed(() => cfg.value.cups)

/** The slot each cup stands in (cups keep their number, slots are places on the table). */
const slotOf = ref<number[]>(Array.from({ length: cfg.value.cups }, (_, i) => i))
const gemCup = ref(0)
const picked = ref(-1)
const suspense = ref(false)
const revealed = ref(false)
const won = ref<boolean | null>(null)
const near = ref(false)
const timedOut = ref(false)
const paid = ref(0)
const prize = ref<{ item: string; gold: number } | null>(null)
const left = ref(0)
let end = 0
let seq = 0

let timer = 0
let frame = 0
const later = (fn: () => void, ms: number): void => { timer = window.setTimeout(fn, ms) }
const stop = (): void => { window.clearTimeout(timer); cancelAnimationFrame(frame); timer = 0; frame = 0 }
onBeforeUnmount(stop)

const lifted = (c: number): boolean => (phase.value === 'peek' && c === gemCup.value) || revealed.value
const showGem = (c: number): boolean => c === gemCup.value && (phase.value === 'peek' || revealed.value)

const say = computed(() => {
  if (phase.value === 'peek') return t('cups.watch')
  if (phase.value === 'shuffle') return t('cups.follow')
  if (phase.value === 'pick') return t('cups.pick')
  if (phase.value !== 'over' || suspense.value) return ''
  if (won.value) return t('cups.won', { n: fmt(paid.value) })
  return timedOut.value ? t('cups.timeout') : near.value ? t('cups.near') : t('cups.lost')
})

const sit = (): void => {
  if (suspense.value) return
  const s = startCups()
  if (!s) { sfx('denied'); return }
  sfx('coin')
  stop()
  const c = cupsRound(row.value, s.first)
  cfg.value = c
  const deal = dealCups(c, (Date.now() ^ (++seq * 2654435761)) >>> 0)
  slotOf.value = Array.from({ length: c.cups }, (_, i) => i)
  gemCup.value = deal.gem
  end = deal.end
  picked.value = -1
  suspense.value = false
  revealed.value = false
  won.value = null
  near.value = false
  timedOut.value = false
  prize.value = null
  paid.value = 0
  phase.value = 'peek'
  later(() => { phase.value = 'shuffle'; swap(deal.swaps, 0) }, CUPS_PEEK * 1000)
}

/** One swap after another, each as long as the round says. */
const swap = (list: Array<[number, number]>, i: number): void => {
  if (i >= list.length) { openPick(); return }
  const [a, b] = list[i]!
  slotOf.value = slotOf.value.map(s => (s === a ? b : s === b ? a : s))
  sfx('uiClick')
  later(() => swap(list, i + 1), cfg.value.ms + 30)
}

const openPick = (): void => {
  phase.value = 'pick'
  left.value = CUPS_PICK_SECONDS
  let last = performance.now()
  const tick = (now: number): void => {
    left.value = Math.max(0, left.value - (now - last) / 1000)
    last = now
    if (phase.value !== 'pick') return
    if (left.value <= 0) { timedOut.value = true; settle(-1); return }
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}

const pick = (slot: number): void => {
  if (phase.value !== 'pick') return
  settle(slot)
}

/** The round is decided now (and saved); the cups lift a beat later for the tension. */
const settle = (slot: number): void => {
  stop()
  picked.value = slot
  const hit = slot === end
  near.value = cupsNearMiss(slot, end)
  const r = settleCups(hit)
  won.value = hit
  paid.value = r.gold
  prize.value = r.prize
  suspense.value = true
  revealed.value = false
  phase.value = 'over'
  later(() => {
    suspense.value = false
    revealed.value = true
    sfx(hit ? (r.prize ? 'uiLearn' : 'coin') : 'denied')
  }, slot < 0 ? 100 : 480)
}

/** Leaving mid-round: the round is lost. */
const leave = (): void => {
  if (phase.value === 'peek' || phase.value === 'shuffle' || phase.value === 'pick') { stop(); settleCups(false) }
  closeModal()
}

/** Keys: a cup's number while picking; Space or Enter sits down when nothing else has the focus. */
const onKey = (e: KeyboardEvent): void => {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (phase.value === 'pick') {
    const k = Number(e.key)
    if (k >= 1 && k <= n.value) { e.preventDefault(); pick(k - 1) }
  } else if ((phase.value === 'idle' || phase.value === 'over') && (e.key === ' ' || e.key === 'Enter') && !(e.target instanceof HTMLButtonElement) && !block.value) {
    e.preventDefault()
    sit()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.cups
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.4rem, 1.8vmin, 0.8rem)
  width: min(34rem, 100%)
  padding-bottom: 0.4rem
.cups__lead, .cups__note
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.72rem, 3vmin, 0.92rem)
  line-height: 1.3
  text-align: center
.cups__row, .cups__say
  margin: 0
  +cel.label
  color: var(--bc-on)
  font-size: clamp(0.76rem, 3vmin, 0.95rem)
  text-align: center
.cups__say
  min-height: 1.4em
  font-size: clamp(0.9rem, 3.6vmin, 1.15rem)
  &.is-good
    color: var(--bc-on-good)
  &.is-bad
    color: var(--bc-on-bad)
.cups__prize
  margin: 0
  +cel.label
  color: var(--bc-on-accent)
  font-size: clamp(0.85rem, 3.4vmin, 1.05rem)
  text-align: center
.cups__pips
  display: flex
  gap: 0.4rem
.cups__pip
  width: clamp(0.8rem, 3vmin, 1.1rem)
  aspect-ratio: 1
  border-radius: 50%
  border: 2px solid var(--bc-on-soft)
  opacity: 0.55
  transition: transform 0.2s, background 0.2s, opacity 0.2s
  &.is-prize
    border-radius: 25%
    transform: rotate(45deg)
  &.is-on
    opacity: 1
    background: radial-gradient(circle at 35% 30%, #fff2a8, #e0a84a)
    border-color: #8a5a1a
    box-shadow: 0 0 0.5rem rgba(255, 210, 90, 0.8)

// The table: slots across, cups trade places by `left`.
.cups__table
  position: relative
  width: 100%
  height: clamp(7.5rem, 30vmin, 11.5rem)
  margin-top: clamp(1.8rem, 9vmin, 3.2rem)
.cups__slot
  position: absolute
  bottom: 0
  width: calc(100% / var(--n))
  height: 100%
  padding: 0 calc(8% / var(--n) * 2)
  background: none
  border: 0
  cursor: pointer
  transition: left var(--ms) cubic-bezier(0.45, 0, 0.25, 1)
  -webkit-tap-highlight-color: transparent
  &:disabled
    cursor: default
  &:focus-visible
    outline: 3px solid var(--bc-on-accent)
    outline-offset: 2px
    border-radius: 0.6rem
  &.is-shake .cups__cup
    animation: cups-shake 0.16s linear infinite
.cups__cup
  position: absolute
  left: 14%
  right: 14%
  bottom: 4%
  height: 74%
  display: flex
  align-items: flex-end
  justify-content: center
  align-items: center
  // The wooden cup (painted, or its drawing), the number written over its plain middle.
  filter: drop-shadow(0 0.3rem 0 rgba(0, 0, 0, 0.25))
  transition: transform 0.28s cubic-bezier(0.3, 1.4, 0.5, 1)
  z-index: 2
  .is-lift &
    transform: translateY(-52%) rotate(-8deg)
  .is-pick:not(.is-lift) &
    filter: brightness(1.15)
  .cups__slot:not(:disabled):hover &
    transform: translateY(-6%)
.cups__img
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  object-fit: contain
  object-position: center bottom
  pointer-events: none
.cups__num
  position: relative
  margin-top: 8%
  +cel.label
  color: #ffe9b0
  font-size: clamp(0.8rem, 3vmin, 1rem)
.cups__gem
  position: absolute
  left: 50%
  bottom: 8%
  width: clamp(1.3rem, 6vmin, 2rem)
  aspect-ratio: 1
  transform: translateX(-50%) rotate(45deg)
  border-radius: 20%
  background: linear-gradient(135deg, #ffd0e4, #ff4f8a 60%, #b01a58)
  border: 2px solid #5a0a2a
  box-shadow: 0 0 0.8rem rgba(255, 90, 150, 0.9)
  z-index: 1

.cups__sand
  width: min(18rem, 80%)
  height: 0.5rem
  border-radius: 0.3rem
  background: rgba(0, 0, 0, 0.25)
  overflow: hidden
.cups__sand-fill
  display: block
  height: 100%
  background: linear-gradient(90deg, #e0a84a, #ffd24a)
  transform-origin: left
// A win: coins fly out of the middle.
.cups__sparks
  position: absolute
  left: 50%
  top: 46%
  pointer-events: none
  span
    position: absolute
    width: 0.7rem
    height: 0.7rem
    border-radius: 50%
    background: radial-gradient(circle at 35% 30%, #fff2a8, #e0a84a)
    border: 1px solid #8a5a1a
    animation: cups-spark 0.9s ease-out forwards
    animation-delay: calc(var(--d) * 60ms)
    opacity: 0
.is-miss.is-over .cups__table
  animation: cups-wobble 0.3s 0.5s
@keyframes cups-spark
  0%
    opacity: 1
    transform: rotate(var(--a)) translateY(0)
  100%
    opacity: 0
    transform: rotate(var(--a)) translateY(-5.5rem)
@keyframes cups-shake
  0%, 100%
    transform: translateX(-3%)
  50%
    transform: translateX(3%)
@keyframes cups-wobble
  0%, 100%
    transform: translateX(0)
  30%
    transform: translateX(-0.4rem)
  70%
    transform: translateX(0.4rem)
@media (prefers-reduced-motion: reduce)
  .cups__slot, .cups__cup
    transition-duration: 0.01ms
  .cups__sparks span, .is-miss.is-over .cups__table, .cups__slot.is-shake .cups__cup
    animation: none
// A phone on its side: the rules give way to the table.
@media (max-height: 30rem)
  .cups
    gap: 0.3rem
  .cups__lead
    display: none
  .cups__table
    height: 5.2rem
    margin-top: 1.5rem
</style>
