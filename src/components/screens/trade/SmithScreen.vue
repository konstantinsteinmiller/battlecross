<template lang="pug">
  TradeFrame(
    ref="frame"
    art="forge"
    :look="npc ? npc.look : 'smith'"
    :name="npc ? t(`npc.${npc.id}.name`) : ''"
    :line="t('smith.talk')"
    ring="var(--bc-orange)"
  )
    div.smith
      p.smith__lead {{ t('smith.lead') }}
      div.smith__metals(role="tablist")
        button.smith__metal(
          v-for="m in ORE_IDS"
          :key="m"
          type="button"
          role="tab"
          :data-metal="m"
          :aria-selected="metal === m"
          :class="{ 'is-on': metal === m, 'is-locked': !known(m) }"
          @click="pick(m)"
        )
          span.smith__metal-icon
            OreIcon(:id="m")
          span.smith__metal-name {{ t(`ore.${m}.name`) }}
          span.smith__metal-n {{ oreCount(m) }}
      div.smith__lines(role="tablist")
        button.smith__line(
          v-for="l in SMITH_LINES"
          :key="l"
          type="button"
          role="tab"
          :data-line="l"
          :title="t(`attr.${l}.name`)"
          :aria-label="t(`attr.${l}.name`)"
          :aria-selected="line === l"
          :class="{ 'is-on': line === l }"
          :style="{ '--attr': ATTR_COLOR[l] }"
          @click="pickLine(l)"
        )
          span.smith__line-icon
            ItemIcon(:id="smithItemId(metal, 'sword', false, l)")
          span.smith__line-name {{ t(`attr.${l}.short`) }}
      p.smith__locked(v-if="!known(metal)") {{ t('smith.locked', { ore: t(`ore.${metal}.name`) }) }}
      div.smith__grid(v-else)
        section.piece(v-for="r in recipes" :key="r.id" :data-recipe="r.id")
          div.piece__head
            span.piece__icon
              ItemIcon(:id="r.item")
            div.piece__title
              h3.piece__name {{ t(`item.${r.item}.name`) }}
              p.piece__master {{ t('smith.master', { item: t(`item.${r.master}.name`) }) }}
          div.piece__cost
            span.piece__ore(:class="{ 'is-short': oreCount(r.metal) < r.nuggets }" :aria-label="t('smith.nuggets', { ore: t(`ore.${r.metal}.name`), have: oreCount(r.metal), n: r.nuggets })")
              span.piece__ore-icon
                OreIcon(:id="r.metal")
              | {{ oreCount(r.metal) }}/{{ r.nuggets }}
            span.piece__gold(:class="{ 'is-short': profile.gold < r.gold }") {{ t('smith.gold', { n: fmt(r.gold) }) }}
          FButton.piece__go(
            :label="t('smith.forge')"
            type="success"
            size="sm"
            icon="anvil"
            :is-disabled="!!smithBlock(r.id)"
            @click="begin(r.id)"
          )
          p.piece__why(v-if="smithBlock(r.id)") {{ t(`smith.why.${smithBlock(r.id)}`) }}
      DealStamp(:n="stamps" :text="t('smith.stamp')" tone="gold")

    //- The anvil: three strikes on the glow (D123).
    div.anvil(v-if="game" role="dialog" :aria-label="t('smith.forge')" @pointerdown.self.prevent)
      div.anvil__card
        template(v-if="!game.result")
          p.anvil__step {{ t('smith.strikes', { n: game.hits.length + 1, max: STRIKES }) }}
          div.anvil__bar(ref="bar")
            div.anvil__spot(:style="{ left: `${(game.spot - game.half) * 100}%`, width: `${game.half * 200}%` }")
            div.anvil__glow(:style="{ left: `${pos * 100}%` }")
            span.anvil__mark(v-for="(h, i) in game.marks" :key="i" :style="{ left: `${h * 100}%` }")
          div.anvil__scores
            span.anvil__score(v-for="(s, i) in game.hits" :key="i" :class="scoreClass(s)") {{ '★'.repeat(s >= 0.85 ? 3 : s >= 0.5 ? 2 : s > 0 ? 1 : 0) || '·' }}
          p.anvil__hint {{ t('smith.hint') }}
          FButton.anvil__strike(:label="t('smith.strike')" type="primary" size="lg" icon="anvil" @click="strike")
        template(v-else)
          p.anvil__grade(:data-grade="game.result.grade") {{ t(`smith.grade.${game.result.grade}`) }}
          span.anvil__item
            ItemIcon(:id="game.result.id")
          p.anvil__made {{ t(game.result.fresh ? 'smith.made' : 'smith.worked', { item: t(`item.${game.result.id}.name`), n: game.result.levels }) }}
          FButton.anvil__done(:label="t('smith.take')" type="success" size="md" @click="game = null")
</template>

<script setup lang="ts">
/**
 * ─── The forge (roadmap #99, D121–D124) ─────────────────────────────────────
 *
 * The smith's window: one tab a metal (a metal never mined stays shut), its
 * six pieces with what each takes, and the anvil. Three strikes on the glow
 * as it sweeps the bar, as near the hot spot's middle as the hand allows
 * (Dexterity widens the spot; a rarer metal narrows it and sweeps faster),
 * decide the grade, and the grade the piece (`data/smithing.ts`). The nuggets
 * and the gold go only when the third strike lands.
 */
import { computed, nextTick, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { oreCount, profile, smithBlock, smithForge, totalAttrs } from '@/game/state/profile'
import { ORE_IDS, ORE_LOOK, type OreId } from '@/game/data/ores'
import { ATTR_COLOR, ATTRS, type Attr } from '@/game/data/attributes'
import { SMITH_LINES, smithItemId } from '@/game/data/items'
import { RECIPES, RECIPE_BY_ID, STRIKES, SWEEP, gradeOf, spotHalf, strikeScore, type Grade } from '@/game/data/smithing'
import { flow } from '@/game/flow'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import FButton from '@/components/atoms/FButton.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'
import OreIcon from '@/components/art/OreIcon.vue'
import DealStamp from '@/components/game/DealStamp.vue'
import { burst, shake, thunk } from '@/components/game/fx'
import TradeFrame from './TradeFrame.vue'

const { t } = useI18n()
const npc = computed(() => flow.npc)
const frame = ref<InstanceType<typeof TradeFrame> | null>(null)
const stamps = ref(0)

const known = (m: OreId): boolean => profile.inv.oresFound.includes(m)
const metal = ref<OreId>(ORE_IDS.slice().reverse().find(known) ?? 'iron')
const pick = (m: OreId): void => { metal.value = m; sfx('uiClick') }
// The build to forge for: the hero's strongest attribute until another is picked.
const line = ref<Attr>(ATTRS.reduce((best, a) => (totalAttrs()[a] > totalAttrs()[best] ? a : best), 'str' as Attr))
const pickLine = (l: Attr): void => { line.value = l; sfx('uiClick') }
const recipes = computed(() => RECIPES.filter(r => r.metal === metal.value && r.line === line.value))

interface Game {
  recipe: string
  spot: number
  half: number
  speed: number
  hits: number[]
  marks: number[]
  result: { grade: Grade; id: string; levels: number; fresh: boolean } | null
}
const game = ref<Game | null>(null)
const pos = ref(0)
let raf = 0
let t0 = 0

const newSpot = (half: number): number => half + 0.08 + Math.random() * (1 - 2 * (half + 0.08))

const tick = (now: number): void => {
  const g = game.value
  if (!g || g.result) { raf = 0; return }
  // Back and forth along the bar: a triangle wave.
  const u = (((now - t0) / 1000) * g.speed) % 2
  pos.value = u < 1 ? u : 2 - u
  raf = requestAnimationFrame(tick)
}

const begin = (id: string): void => {
  const r = RECIPE_BY_ID[id]
  if (!r || smithBlock(id)) { sfx('denied'); shake(document.querySelector(`.piece[data-recipe="${id}"] .piece__go`)); return }
  const half = spotHalf(r.metal, totalAttrs().dex)
  game.value = { recipe: id, spot: newSpot(half), half, speed: SWEEP[r.metal], hits: [], marks: [], result: null }
  t0 = performance.now()
  sfx('uiOpen')
  if (!raf) raf = requestAnimationFrame(tick)
  window.addEventListener('keydown', onKey)
}

const strike = (): void => {
  const g = game.value
  if (!g || g.result) return
  const s = strikeScore(pos.value - g.spot, g.half)
  g.hits.push(s)
  g.marks.push(pos.value)
  sfx(s >= 0.5 ? 'hitHeavy' : 'hitBlunt')
  if (g.hits.length < STRIKES) {
    g.spot = newSpot(g.half)
    return
  }
  const r = RECIPE_BY_ID[g.recipe]!
  const grade = gradeOf(g.hits.reduce((a, b) => a + b, 0), profile.level, r.level)
  const paid = r.gold
  const made = smithForge(g.recipe, grade)
  window.removeEventListener('keydown', onKey)
  if (!made) { game.value = null; sfx('denied'); return }
  g.result = { grade, ...made }
  sfx('levelUp')
  void frame.value?.pay(paid)
  stamps.value++
  void nextTick(() => {
    const el = document.querySelector<HTMLElement>('.anvil__item')
    thunk(el)
    burst(el, ORE_LOOK[r.metal].glint, grade === 'perfect' || grade === 'great')
  })
}

const onKey = (e: KeyboardEvent): void => {
  if (e.code !== 'Space' && e.code !== 'Enter') return
  e.preventDefault()
  strike()
}

const scoreClass = (s: number): string => (s >= 0.85 ? 'is-hot' : s >= 0.5 ? 'is-warm' : s > 0 ? 'is-cool' : 'is-miss')

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'
@use './trade'

.smith
  --gap: clamp(0.35rem, 1.6vmin, 0.8rem)
  flex: 1 1 auto
  min-height: 0
  display: flex
  flex-direction: column
  gap: var(--gap)
  width: 100%
  max-width: 62rem
  margin-inline: auto
  overflow-y: auto
.smith__lead, .smith__locked
  margin: 0
  color: var(--bc-text-soft)
  font-size: clamp(0.72rem, 3vmin, 0.92rem)
  line-height: 1.3
  text-align: center
.smith__metals
  display: grid
  grid-template-columns: repeat(6, minmax(0, 1fr))
  gap: var(--gap)
.smith__metal
  +screen.plate('leather')
  display: flex
  align-items: center
  justify-content: center
  gap: 0.35em
  min-height: max(2.75rem, 44px)
  padding: 0.3em 0.5em
  border: 0
  color: var(--bc-text)
  font: inherit
  font-size: clamp(0.7rem, 2.8vmin, 0.9rem)
  cursor: pointer
  touch-action: manipulation
  &.is-on
    box-shadow: 0 0 0 3px var(--bc-orange)
  &.is-locked
    opacity: 0.55
.smith__lines
  display: grid
  grid-template-columns: repeat(6, minmax(0, 1fr))
  gap: calc(var(--gap) * 0.6)
.smith__line
  +screen.plate('leather')
  display: flex
  align-items: center
  justify-content: center
  gap: 0.2em
  min-height: max(2.75rem, 44px)
  padding: 0.2em 0.3em
  border: 0
  color: var(--attr)
  font: inherit
  cursor: pointer
  touch-action: manipulation
  &.is-on
    box-shadow: 0 0 0 3px var(--attr)
.smith__line-icon
  flex: 0 0 auto
  width: clamp(1.4rem, 5.4vmin, 2rem)
  height: clamp(1.4rem, 5.4vmin, 2rem)
.smith__line-name
  +cel.label
  font-size: clamp(0.6rem, 2.5vmin, 0.8rem)
  text-shadow: var(--bc-text-outline-thin)
.smith__metal-icon
  flex: 0 0 auto
  width: clamp(1.3rem, 5vmin, 1.8rem)
  height: clamp(1.3rem, 5vmin, 1.8rem)
.smith__metal-name
  +cel.label
  min-width: 0
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
.smith__metal-n
  +cel.label
  color: var(--bc-text-soft)
.smith__grid
  display: grid
  grid-template-columns: repeat(3, minmax(0, 1fr))
  gap: var(--gap)
.piece
  +screen.plate('leather')
  display: flex
  flex-direction: column
  gap: clamp(0.25rem, 1.2vmin, 0.5rem)
  min-width: 0
  padding: clamp(0.45rem, 2vmin, 0.8rem)
.piece__head
  display: flex
  align-items: center
  gap: clamp(0.35rem, 1.6vmin, 0.6rem)
.piece__icon
  flex: 0 0 auto
  width: clamp(2.2rem, 8.5vmin, 3rem)
  height: clamp(2.2rem, 8.5vmin, 3rem)
.piece__title
  flex: 1 1 auto
  min-width: 0
.piece__name
  margin: 0
  +cel.label
  color: var(--bc-text)
  font-size: clamp(0.76rem, 3vmin, 0.96rem)
  text-shadow: var(--bc-text-outline-thin)
.piece__master
  margin: 0.1em 0 0
  color: var(--bc-text-soft)
  font-size: clamp(0.62rem, 2.5vmin, 0.78rem)
  line-height: 1.2
.piece__cost
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: 0.6em
  color: var(--bc-text)
  font-size: clamp(0.7rem, 2.8vmin, 0.88rem)
.piece__ore
  display: inline-flex
  align-items: center
  gap: 0.25em
.piece__ore-icon
  display: block
  width: clamp(1.2rem, 4.6vmin, 1.6rem)
  height: clamp(1.2rem, 4.6vmin, 1.6rem)
.is-short
  color: var(--bc-text-bad, var(--bc-red))
.piece__why
  margin: 0
  color: var(--bc-text-soft)
  font-size: clamp(0.62rem, 2.5vmin, 0.78rem)

.anvil
  position: absolute
  inset: 0
  z-index: 5
  display: flex
  align-items: center
  justify-content: center
  padding: 1rem
  background: color-mix(in srgb, var(--bc-ink) 55%, transparent)
.anvil__card
  +screen.plate('leather')
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.4rem, 2vmin, 0.8rem)
  width: min(34rem, 100%)
  padding: clamp(0.7rem, 3vmin, 1.3rem)
  text-align: center
.anvil__step, .anvil__hint, .anvil__made
  margin: 0
  color: var(--bc-text)
  font-size: clamp(0.74rem, 3vmin, 0.95rem)
.anvil__hint
  color: var(--bc-text-soft)
.anvil__bar
  position: relative
  width: 100%
  height: clamp(1.6rem, 6vmin, 2.2rem)
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(90deg, var(--bc-slate-lo), var(--bc-slate), var(--bc-slate-lo))
  overflow: hidden
.anvil__spot
  position: absolute
  top: 0
  bottom: 0
  background: linear-gradient(90deg, var(--bc-orange-lo), var(--bc-gold-hi) 50%, var(--bc-orange-lo))
  opacity: 0.85
.anvil__glow
  position: absolute
  top: -10%
  bottom: -10%
  width: 0.5rem
  margin-left: -0.25rem
  border-radius: var(--bc-r-pill)
  background: var(--bc-white)
  box-shadow: 0 0 0.6rem var(--bc-gold-hi)
.anvil__mark
  position: absolute
  top: 15%
  bottom: 15%
  width: 2px
  background: var(--bc-ink)
.anvil__scores
  display: flex
  gap: 0.8em
  min-height: 1.4em
  +cel.label
  font-size: clamp(0.9rem, 3.6vmin, 1.2rem)
.is-hot
  color: var(--bc-gold-hi)
.is-warm
  color: var(--bc-orange)
.is-cool, .is-miss
  color: var(--bc-text-soft)
.anvil__grade
  margin: 0
  +cel.label
  color: var(--bc-gold-hi)
  font-size: clamp(1.1rem, 5vmin, 1.6rem)
  text-shadow: var(--bc-text-outline)
.anvil__item
  display: block
  width: clamp(3.4rem, 13vmin, 4.6rem)
  height: clamp(3.4rem, 13vmin, 4.6rem)

@media (max-aspect-ratio: 1/1)
  .smith__grid
    grid-template-columns: repeat(2, minmax(0, 1fr))
// Six metals: two rows of three unless the screen is wide.
@media (max-aspect-ratio: 1/1), (max-width: 40rem)
  .smith__metals
    grid-template-columns: repeat(3, minmax(0, 1fr))
@media (max-width: 26rem)
  .smith__lines
    grid-template-columns: repeat(3, minmax(0, 1fr))
</style>
