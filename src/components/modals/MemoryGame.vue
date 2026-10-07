<template lang="pug">
  FModal(:model-value="true" :title="t('memory.title')" surface="parchment" tone="gold" @update:model-value="leave")
    div.mem(data-memory :class="`is-${phase}`")
      p.mem__lead {{ t('memory.lead') }}
      p.mem__row {{ t('memory.row', { n: row, max: MEMORY_ROW }) }} · {{ t('memory.pairs', { n: round.pairs, s: round.seconds }) }}
      //- The bets, before a round and after one.
      div.mem__bets(v-if="phase !== 'play'")
        p.mem__result(v-if="phase === 'won'" aria-live="polite") {{ t('memory.won', { n: fmt(paid) }) }}
        p.mem__result.is-bad(v-else-if="phase === 'lost'" aria-live="polite") {{ t('memory.lost') }}
        p.mem__prize(v-if="prize") {{ prize.item ? t('gamble.prize', { item: t(`item.${prize.item}.name`) }) : t('gamble.prizeGold', { n: fmt(prize.gold) }) }}
        div.mem__stakes
          FButton(
            v-for="s in stakes"
            :key="s"
            :label="t('memory.bet', { n: fmt(s) })"
            type="success"
            size="sm"
            icon="coin"
            :is-disabled="profile.gold < s"
            :data-stake="s"
            @click="begin(s)"
          )
        p.mem__note(v-if="profile.gold < stakes[0]") {{ t('memory.noGold') }}
      //- The sand glass and the table.
      template(v-else)
        div.mem__sand(role="timer" :aria-label="`${Math.ceil(left)}`")
          span.mem__sand-fill(:style="{ transform: `scaleX(${left / round.seconds})` }")
      div.mem__table(v-if="cards.length" :style="{ '--cols': cols, '--rows': Math.ceil(cards.length / cols) }")
        button.card(
          v-for="(c, i) in cards"
          :key="i"
          type="button"
          :data-card="i"
          :class="{ 'is-up': up.includes(i) || found.has(c), 'is-found': found.has(c) }"
          :disabled="phase !== 'play' || found.has(c) || up.includes(i)"
          :aria-label="t('memory.card', { n: i + 1 })"
          @click="flip(i)"
        )
          span.card__back
          span.card__face(:style="{ '--hue': faceOf(c).colour }")
            PlantIcon(v-if="faceOf(c).plant" :id="faceOf(c).plant")
            ArtIcon(v-else :glyph="faceOf(c).glyph" :tint="faceOf(c).colour" frame="none")
</template>

<script setup lang="ts">
/**
 * ─── The memory stand (roadmap #91, D110) ───────────────────────────────────
 *
 * A bet, a table of face-down cards, a glass of sand: turn two at a time, a
 * pair stays up, a wrong pair turns back after a moment. Every pair found in
 * time pays the bet back doubled; every win in a row plays a harder round,
 * and the fifth adds a Legendary (`gamble.ts`, `profile.settleMemory`).
 * Leaving the table mid-round loses the bet.
 */
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import ArtIcon from '@/components/art/ArtIcon.vue'
import PlantIcon from '@/components/art/PlantIcon.vue'
import { closeModal } from '@/game/flow'
import { placeMemoryBet, profile, settleMemory } from '@/game/state/profile'
import { MEMORY_PEEK, MEMORY_ROW, dealMemory, memoryRound, memoryStakes } from '@/game/gamble'
import { PLANTS } from '@/game/data/plants'
import { ELIXIRS } from '@/game/data/elixirs'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'

const { t } = useI18n()

/** What a pair shows: the eight herbs, then the six elixirs' signs. */
const FACES: ReadonlyArray<{ plant?: string; glyph: string; colour: string }> = [
  ...PLANTS.map(p => ({ plant: p.id, glyph: '', colour: p.bloom })),
  ...ELIXIRS.map(e => ({ glyph: `status.${e.status}`, colour: e.colour }))
]

type Phase = 'bet' | 'play' | 'won' | 'lost'
const phase = ref<Phase>('bet')
const row = computed(() => profile.meta.gamble.memory)
const round = computed(() => memoryRound(row.value))
const stakes = computed(() => memoryStakes(profile.level))
const stake = ref(0)
const paid = ref(0)
const prize = ref<{ item: string; gold: number } | null>(null)

const cards = ref<number[]>([])
/** Which face each pair shows this round (a shuffle of FACES). */
const faces = ref<number[]>([])
const up = ref<number[]>([])
const found = ref(new Set<number>())
const left = ref(0)
const cols = computed(() => (cards.value.length > 16 ? 5 : 4))
const faceOf = (pair: number) => FACES[faces.value[pair] ?? 0]!

let timer = 0
let peek = 0
let last = 0
const stop = (): void => { cancelAnimationFrame(timer); timer = 0; window.clearTimeout(peek) }
onUnmounted(stop)

const tick = (now: number): void => {
  left.value = Math.max(0, left.value - (now - last) / 1000)
  last = now
  if (left.value <= 0) { end(false); return }
  timer = requestAnimationFrame(tick)
}

const begin = (s: number): void => {
  if (!placeMemoryBet(s)) { sfx('denied'); return }
  sfx('coin')
  stake.value = s
  prize.value = null
  const seed = (Date.now() ^ (s * 2654435761)) >>> 0
  cards.value = dealMemory(round.value.pairs, seed)
  // A shuffle of the faces: the first time each turns up in another deal.
  faces.value = [...new Set(dealMemory(FACES.length, seed + 1))].slice(0, round.value.pairs)
  up.value = []
  found.value = new Set()
  left.value = round.value.seconds
  phase.value = 'play'
  last = performance.now()
  timer = requestAnimationFrame(tick)
}

const flip = (i: number): void => {
  if (phase.value !== 'play' || up.value.length >= 2) return
  sfx('uiClick')
  up.value = [...up.value, i]
  if (up.value.length < 2) return
  const [a, b] = up.value as [number, number]
  if (cards.value[a] === cards.value[b]) {
    found.value = new Set([...found.value, cards.value[a]!])
    up.value = []
    sfx('coin')
    if (found.value.size === round.value.pairs) end(true)
    return
  }
  peek = window.setTimeout(() => { up.value = [] }, MEMORY_PEEK * 1000)
}

const end = (won: boolean): void => {
  stop()
  const r = settleMemory(won, stake.value)
  paid.value = r.gold
  prize.value = r.prize
  phase.value = won ? 'won' : 'lost'
  sfx(won ? 'uiLearn' : 'denied')
}

/** Closing the stand mid-round forfeits the bet. */
const leave = (): void => {
  if (phase.value === 'play') end(false)
  closeModal()
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.mem
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.4rem, 1.8vmin, 0.8rem)
  width: min(36rem, 100%)
.mem__lead, .mem__row, .mem__note
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.72rem, 3vmin, 0.92rem)
  line-height: 1.3
  text-align: center
.mem__row
  +cel.label
  color: var(--bc-on)
.mem__bets
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.5rem
.mem__stakes
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 0.5rem
.mem__result, .mem__prize
  margin: 0
  +cel.label
  color: var(--bc-on-good)
  font-size: clamp(0.85rem, 3.4vmin, 1.05rem)
  text-align: center
  &.is-bad
    color: var(--bc-on-bad)
.mem__prize
  color: var(--bc-on-accent)
.mem__sand
  position: relative
  width: 100%
  height: 0.8rem
  border: 2px solid var(--bc-ink)
  border-radius: 999px
  background: var(--bc-slate-deep, #2a2436)
  overflow: hidden
.mem__sand-fill
  position: absolute
  inset: 0
  background: linear-gradient(90deg, #ffc526, #ffe978)
  transform-origin: left center
// The whole table fits the window: as wide as its rows of square cards allow.
.mem__table
  display: grid
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr))
  gap: clamp(0.3rem, 1.4vmin, 0.55rem)
  width: min(100%, calc(48vh * var(--cols) / var(--rows)))
.card
  position: relative
  aspect-ratio: 1
  padding: 0
  border: 0
  background: none
  cursor: pointer
  perspective: 30rem
  +cel.focus-ring
  &:disabled
    cursor: default
.card__back, .card__face
  position: absolute
  inset: 0
  display: grid
  place-items: center
  border: 2px solid var(--bc-ink)
  border-radius: 0.6rem
  backface-visibility: hidden
  transition: transform 260ms var(--bc-ease-pop)
.card__back
  background: repeating-linear-gradient(45deg, #7a2a8a 0 6px, #8f3aa0 6px 12px)
  box-shadow: inset 0 0 0 3px #ffd24a
.card__face
  background: #fff8e3
  transform: rotateY(180deg)
  padding: 14%
  :deep(svg), :deep(.art-icon)
    display: block
    width: 100%
    height: 100%
.card.is-up
  .card__back
    transform: rotateY(180deg)
  .card__face
    transform: rotateY(0)
.card.is-found .card__face
  box-shadow: 0 0 0 3px var(--hue), 0 0 0.6em var(--hue)
// A phone on its side: the rules give way to the table.
@media (max-height: 30rem)
  .mem
    gap: 0.3rem
  .mem__lead
    display: none
  .mem__table
    width: min(100%, calc(52vh * var(--cols) / var(--rows)))
@media (prefers-reduced-motion: reduce)
  .card__back, .card__face
    transition: none
</style>
