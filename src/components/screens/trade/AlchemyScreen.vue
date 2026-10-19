<template lang="pug">
  TradeFrame(
    ref="frame"
    art="alchemy"
    :look="npc ? npc.look : 'sbAlchemist'"
    :name="npc ? t(`npc.${npc.id}.name`) : ''"
    :line="t('alchemy.talk')"
    ring="var(--bc-green)"
  )
    div.alch
      p.alch__lead {{ t('alchemy.lead', { n: ELIXIR_CAP }) }}
      div.alch__grid
        section.brew(
          v-for="e in ELIXIRS"
          :key="e.id"
          :data-elixir="e.id"
          :class="{ 'is-pick': profile.inv.elixirPick === e.id }"
          :style="{ '--liq': e.colour }"
        )
          div.brew__head
            span.brew__flask
              ArtIcon(:glyph="`status.${e.status}`" :tint="e.colour" :src="ICON_ART.get(`status-${e.status}`)" frame="round" :dim="elixirCount(e.id) === 0")
            div.brew__title
              h3.brew__name {{ t(`elixir.${e.id}.name`) }}
              p.brew__desc {{ t(`elixir.${e.id}.desc`, { n: pct(e.v) }) }}
            span.brew__count(:class="{ 'is-full': elixirCount(e.id) >= ELIXIR_CAP }") {{ t('alchemy.count', { n: elixirCount(e.id), max: ELIXIR_CAP }) }}
          ul.brew__recipe
            li.brew__herb(
              v-for="[p, n] in recipeOf(e)"
              :key="p"
              :class="{ 'is-short': herbCount(p) < n }"
              :aria-label="t('alchemy.herb', { plant: t(`plant.${p}.name`), have: herbCount(p), n })"
            )
              span.brew__herb-icon
                PlantIcon(:id="p")
              span.brew__herb-n {{ herbCount(p) }}/{{ n }}
          div.brew__actions
            FButton.brew__go(
              :label="t('alchemy.brew', { n: fmt(fee) })"
              type="success"
              size="sm"
              icon="flask"
              :is-disabled="!!brewBlock(e.id)"
              @click="doBrew(e.id)"
            )
            FButton.brew__carry(v-if="elixirCount(e.id) > 0 && profile.inv.elixirPick !== e.id" :label="t('alchemy.carry')" type="secondary" size="sm" @click="doPick(e.id)")
            span.brew__picked(v-else-if="profile.inv.elixirPick === e.id") {{ t('alchemy.carried') }}
          p.brew__why(v-if="brewBlock(e.id)") {{ t(`alchemy.why.${brewBlock(e.id)}`) }}
      DealStamp(:n="stamps" :text="t('alchemy.done')" tone="green")
</template>

<script setup lang="ts">
/**
 * ─── The alchemist (roadmap #87, D104) ──────────────────────────────────────
 *
 * Six elixirs, each brewed from three of the herbs the hero picks in the wild
 * and a small fee. Up to five of each are carried; the one marked "in your
 * flask" is what the third flask pours in a fight (`sim/hero.ts` useElixir),
 * and the arrow on that flask turns it to the next kind.
 */
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { brewBlock, brewElixir, elixirCount, herbCount, pickElixir, profile } from '@/game/state/profile'
import { ELIXIRS, ELIXIR_CAP, brewFee, type ElixirDef, type ElixirId } from '@/game/data/elixirs'
import type { PlantId } from '@/game/data/plants'
import { flow } from '@/game/flow'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import FButton from '@/components/atoms/FButton.vue'
import ArtIcon from '@/components/art/ArtIcon.vue'
import PlantIcon from '@/components/art/PlantIcon.vue'
import { ICON_ART } from '@/game/assets/overrides'
import DealStamp from '@/components/game/DealStamp.vue'
import { burst, shake, thunk } from '@/components/game/fx'
import TradeFrame from './TradeFrame.vue'

const { t } = useI18n()
const npc = computed(() => flow.npc)
const frame = ref<InstanceType<typeof TradeFrame> | null>(null)
const stamps = ref(0)
const fee = computed(() => brewFee(profile.level))

const recipeOf = (e: ElixirDef): Array<[PlantId, number]> => Object.entries(e.recipe) as Array<[PlantId, number]>
/** A share as a whole per cent (a tenth where it is small: 1.2 %). */
const pct = (v: number): string =>
  new Intl.NumberFormat((typeof document !== 'undefined' && document.documentElement.lang) || 'en', { maximumFractionDigits: 1 }).format(Math.round(v * 1000) / 10)

const doBrew = (id: ElixirId): void => {
  const paid = fee.value
  if (!brewElixir(id)) { sfx('denied'); shake(document.querySelector(`.brew[data-elixir="${id}"] .brew__go`)); return }
  sfx('potion')
  sfx('coin')
  void frame.value?.pay(paid)
  stamps.value++
  void nextTick(() => {
    const el = document.querySelector<HTMLElement>(`.brew[data-elixir="${id}"] .brew__flask`)
    thunk(el)
    burst(el, ELIXIRS.find(e => e.id === id)!.colour, true)
  })
}

const doPick = (id: ElixirId): void => {
  pickElixir(id)
  sfx('uiClick')
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'
@use './trade'

.alch
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
.alch__lead
  margin: 0
  color: var(--bc-text-soft)
  font-size: clamp(0.72rem, 3vmin, 0.92rem)
  line-height: 1.3
  text-align: center
.alch__grid
  display: grid
  grid-template-columns: repeat(2, minmax(0, 1fr))
  gap: var(--gap)
.brew
  +screen.plate('leather')
  display: flex
  flex-direction: column
  gap: clamp(0.3rem, 1.4vmin, 0.55rem)
  min-width: 0
  padding: clamp(0.45rem, 2vmin, 0.8rem)
  &.is-pick
    box-shadow: 0 0 0 3px var(--liq), 0 0 0.9em color-mix(in srgb, var(--liq) 60%, transparent)
.brew__head
  display: flex
  align-items: center
  gap: clamp(0.4rem, 1.8vmin, 0.7rem)
.brew__flask
  flex: 0 0 auto
  width: clamp(2.4rem, 9vmin, 3.2rem)
  height: clamp(2.4rem, 9vmin, 3.2rem)
.brew__title
  flex: 1 1 auto
  min-width: 0
.brew__name
  margin: 0
  +cel.label
  color: var(--bc-text)
  font-size: clamp(0.8rem, 3.2vmin, 1rem)
  text-shadow: var(--bc-text-outline-thin)
.brew__desc
  margin: 0.1em 0 0
  color: var(--bc-text-soft)
  font-size: clamp(0.66rem, 2.7vmin, 0.84rem)
  line-height: 1.25
.brew__count
  flex: 0 0 auto
  +cel.label
  color: var(--bc-text)
  font-size: clamp(0.74rem, 3vmin, 0.92rem)
  &.is-full
    color: var(--bc-text-good)
.brew__recipe
  display: flex
  flex-wrap: wrap
  gap: clamp(0.3rem, 1.4vmin, 0.6rem)
  margin: 0
  padding: 0
  list-style: none
.brew__herb
  display: flex
  align-items: center
  gap: 0.25em
  color: var(--bc-text)
  font-size: clamp(0.7rem, 2.8vmin, 0.88rem)
  &.is-short
    color: var(--bc-text-bad, var(--bc-red))
.brew__herb-icon
  display: block
  width: clamp(1.4rem, 5.4vmin, 1.9rem)
  height: clamp(1.4rem, 5.4vmin, 1.9rem)
  :deep(svg)
    display: block
    width: 100%
    height: 100%
.brew__actions
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: 0.4rem
.brew__picked
  +cel.label
  color: var(--bc-text-good)
  font-size: clamp(0.7rem, 2.8vmin, 0.88rem)
.brew__why
  margin: 0
  color: var(--bc-text-soft)
  font-size: clamp(0.64rem, 2.6vmin, 0.8rem)

@media (max-aspect-ratio: 1/1)
  .alch__grid
    grid-template-columns: minmax(0, 1fr)
</style>
