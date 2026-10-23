<template lang="pug">
  TradeFrame(
    ref="frame"
    art="ore"
    :look="npc ? npc.look : 'smith'"
    :name="npc ? t(`npc.${npc.id}.name`) : ''"
    :line="t('sellOre.talk')"
    ring="var(--bc-orange)"
  )
    div.sell
      p.sell__lead {{ t('sellOre.lead') }}
      p.sell__sold(v-if="sold" :key="soldAt" role="status") {{ t('dlg.ui.gotGold', { n: fmt(sold) }) }}
      p.sell__empty(v-if="!rows.length") {{ t('sellOre.empty') }}
      ul.sell__rows(v-else)
        li.ore-row(v-for="o in rows" :key="o" :data-ore="o")
          span.ore-row__icon
            OreIcon(:id="o")
          span.ore-row__title
            span.ore-row__name {{ t(`ore.${o}.name`) }}
            span.ore-row__meta {{ t('sellOre.have', { n: oreCount(o) }) }} · {{ t('sellOre.each', { n: fmt(pouchPrice(o)) }) }}
          span.ore-row__step
            button.ore-row__quick(type="button" :disabled="!pick[o]" @click="set(o, 0)") {{ t('sellOre.none') }}
            button.ore-row__btn(type="button" :aria-label="t('sellOre.less', { ore: t(`ore.${o}.name`) })" :disabled="!pick[o]" @click="set(o, (pick[o] ?? 0) - 1)")
              span.ore-row__sign(aria-hidden="true")
            span.ore-row__n(aria-live="polite") {{ pick[o] ?? 0 }}
            button.ore-row__btn(type="button" :aria-label="t('sellOre.more', { ore: t(`ore.${o}.name`) })" :disabled="(pick[o] ?? 0) >= oreCount(o)" @click="set(o, (pick[o] ?? 0) + 1)")
              span.ore-row__sign.ore-row__sign--plus(aria-hidden="true")
            button.ore-row__quick(type="button" :disabled="(pick[o] ?? 0) >= oreCount(o)" @click="set(o, oreCount(o))") {{ t('sellOre.all') }}
          span.ore-row__sum {{ t('smith.gold', { n: fmt((pick[o] ?? 0) * pouchPrice(o)) }) }}
      div.sell__foot(v-if="rows.length")
        span.sell__total {{ t('sellOre.total', { n: fmt(total) }) }}
        FButton.sell__all(:label="t('sellOre.selectAll')" type="secondary" size="md" @click="selectAll")
        FButton.sell__go(:label="t('sellOre.sell')" type="success" size="md" icon="coin" :is-disabled="!total" @click="sell")
</template>

<script setup lang="ts">
/**
 * ─── Selling ore to a smith (#99) ────────────────────────────────────────────
 *
 * Playtesters lost a whole pouch to one click: the smith now lays out every ore
 * the hero carries, its flat price a nugget, and a count to pick for each
 * (nothing picked to start with). The total shows before the sale; the window
 * stays open on the pouch that is left.
 */
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { oreCount, sellOres } from '@/game/state/profile'
import { POUCH_IDS, pouchPrice, type MatId, type OreId } from '@/game/data/ores'
import { flow } from '@/game/flow'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import FButton from '@/components/atoms/FButton.vue'
import OreIcon from '@/components/art/OreIcon.vue'
import TradeFrame from './TradeFrame.vue'

const { t } = useI18n()
const npc = computed(() => flow.npc)
const frame = ref<InstanceType<typeof TradeFrame> | null>(null)

// The metals, then the afterplay's Demonglass and Mythic Ichor (phase 8).
type PouchId = OreId | MatId
const rows = computed(() => POUCH_IDS.filter(o => oreCount(o) > 0))
const pick = reactive<Partial<Record<PouchId, number>>>({})
const total = computed(() => rows.value.reduce((s, o) => s + (pick[o] ?? 0) * pouchPrice(o), 0))

const set = (o: PouchId, n: number): void => {
  pick[o] = Math.max(0, Math.min(oreCount(o), n))
  sfx('uiClick')
}
const selectAll = (): void => {
  for (const o of rows.value) pick[o] = oreCount(o)
  sfx('uiClick')
}

const sold = ref(0)
const soldAt = ref(0)
let soldTimer: ReturnType<typeof setTimeout> | null = null
onBeforeUnmount(() => { if (soldTimer) clearTimeout(soldTimer) })

const sell = (): void => {
  const gold = sellOres(pick)
  if (!gold) { sfx('denied'); return }
  for (const o of POUCH_IDS) delete pick[o]
  sfx('coin')
  // The HUD's toasts sit under every modal: the receipt shows in the window.
  sold.value = gold
  soldAt.value++
  if (soldTimer) clearTimeout(soldTimer)
  soldTimer = setTimeout(() => { sold.value = 0 }, 2600)
  void frame.value?.receive(gold)
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'
@use './trade'

.sell
  --gap: clamp(0.35rem, 1.6vmin, 0.8rem)
  flex: 1 1 auto
  min-height: 0
  display: flex
  flex-direction: column
  gap: var(--gap)
  width: 100%
  max-width: 46rem
  margin-inline: auto
  overflow-y: auto
.sell__lead, .sell__empty
  margin: 0
  color: var(--bc-text-soft)
  font-size: clamp(0.72rem, 3vmin, 0.92rem)
  line-height: 1.3
  text-align: center
.sell__rows
  display: flex
  flex-direction: column
  gap: var(--gap)
  margin: 0
  padding: 0
  list-style: none
.ore-row
  +screen.plate('leather')
  display: grid
  grid-template-columns: auto minmax(0, 1fr) auto auto
  align-items: center
  gap: clamp(0.35rem, 1.6vmin, 0.7rem)
  padding: clamp(0.4rem, 1.8vmin, 0.7rem)
  color: var(--bc-text)
.ore-row__icon
  width: clamp(1.8rem, 7vmin, 2.6rem)
  height: clamp(1.8rem, 7vmin, 2.6rem)
.ore-row__title
  display: flex
  flex-direction: column
  min-width: 0
.ore-row__name
  +cel.label
  font-size: clamp(0.76rem, 3vmin, 0.96rem)
  text-shadow: var(--bc-text-outline-thin)
.ore-row__meta
  color: var(--bc-text-soft)
  font-size: clamp(0.62rem, 2.5vmin, 0.8rem)
.ore-row__step
  display: flex
  align-items: center
  gap: 0.25em
// The steppers (#162): a dark slate key with a gold rim, so they stand off the
// leather row they sit on instead of melting into it.
.ore-row__btn, .ore-row__quick
  +screen.plate('slate', var(--bc-r-md))
  min-width: max(2.75rem, 44px)
  min-height: max(2.75rem, 44px)
  padding: 0 0.5em
  box-shadow: inset 0 0 0 2px var(--bc-gold-lo), var(--bc-drop-soft)
  color: var(--bc-gold-hi)
  font: inherit
  +cel.label
  font-size: clamp(0.8rem, 3.2vmin, 1.05rem)
  text-shadow: var(--bc-text-outline-thin)
  cursor: pointer
  touch-action: manipulation
  transition: filter var(--bc-t-release, 120ms) ease, transform var(--bc-t-release, 120ms) ease
  &:hover:not(:disabled), &:focus-visible
    filter: brightness(1.2)
  &:active:not(:disabled)
    transform: translateY(1px)
  &:disabled
    box-shadow: var(--bc-drop-soft)
    color: var(--bc-text-soft)
    opacity: 0.5
    cursor: default
// − and + drawn as bars: the display font's "+" is a speck beside its "−".
.ore-row__sign
  position: relative
  display: block
  width: 0.9em
  height: 0.9em
  margin: auto
  &::before, &::after
    content: ''
    position: absolute
    inset: 50% 0 auto
    height: 0.18em
    margin-top: -0.09em
    border-radius: 0.09em
    background: currentColor
    box-shadow: 0 0 0 0.04em rgba(0, 0, 0, 0.35)
  &::after
    display: none
.ore-row__sign--plus::after
  display: block
  transform: rotate(90deg)
.sell__sold
  +cel.label
  margin: 0
  text-align: center
  color: var(--bc-gold-hi)
  font-size: clamp(0.85rem, 3.4vmin, 1.1rem)
  text-shadow: var(--bc-text-outline-thin)
  animation: sell-sold 0.35s ease-out
@keyframes sell-sold
  from
    opacity: 0
    transform: translateY(-0.4em)
.ore-row__quick
  font-size: clamp(0.64rem, 2.6vmin, 0.82rem)
.ore-row__n
  +cel.label
  min-width: 2ch
  text-align: center
  font-size: clamp(0.9rem, 3.6vmin, 1.15rem)
.ore-row__sum
  +cel.label
  min-width: 5em
  text-align: right
  color: var(--bc-gold-hi)
.sell__foot
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: flex-end
  gap: var(--gap)
.sell__total
  +cel.label
  margin-right: auto
  color: var(--bc-gold-hi)
  font-size: clamp(0.9rem, 3.6vmin, 1.2rem)
  text-shadow: var(--bc-text-outline-thin)

// Phone width: the stepper and the subtotal drop under the ore's name.
@media (max-width: 34rem)
  .ore-row
    grid-template-columns: auto minmax(0, 1fr)
  .ore-row__step
    grid-column: 1 / -1
    justify-content: center
  .ore-row__sum
    grid-column: 1 / -1
    text-align: center
  // The total on its own line, both buttons side by side under it.
  .sell__foot
    justify-content: center
  .sell__total
    flex: 1 0 100%
    margin-right: 0
    text-align: center
</style>
