<template lang="pug">
  FModal(:model-value="true" :title="t('contract.title')" surface="parchment" tone="green" @update:model-value="closeModal")
    div.board(data-contracts)
      p.board__lead {{ t('contract.lead') }}
      ul.board__list
        li.job(v-for="(c, i) in list" :key="c.faction" :data-contract="i" :class="{ 'is-done': c.done, 'is-ready': !c.done && c.have >= c.n }" :style="{ '--tone': FACTION_COLOR[c.faction] }")
          span.job__who {{ t(`faction.${c.faction}`) }}
          span.job__what {{ what(c) }}
          span.job__count {{ c.have }} / {{ c.n }}
          span.job__pay
            IconCoin.job__coin
            | {{ fmt(contractGold(profile.level)) }} · {{ t('contract.rep') }}
          span.job__act
            span.job__done(v-if="c.done") {{ t('contract.handed') }}
            FButton(v-else :label="t('contract.handIn')" type="success" size="sm" :is-disabled="c.have < c.n" @click="handIn(i)")
      h4.board__cap {{ t('rep.title') }}
      RepTrack
      ul.board__rewards
        li.reward(v-for="f in FACTIONS" :key="f" :style="{ '--tone': FACTION_COLOR[f] }")
          span.reward__who {{ t(`faction.${f}`) }}
          span.reward__gift
            FButton(v-if="giftReady(f)" :label="t('rep.giftClaim')" type="warning" size="sm" icon="gift" @click="gift(f)")
            span(v-else-if="profile.meta.repGifts.includes(f)") {{ t('rep.giftTaken') }}
            span.reward__dim(v-else) {{ t('rep.giftAt', { n: REP_GIFT }) }}
          span.reward__bless(:class="{ 'is-on': blessings().includes(f) }") {{ blessings().includes(f) ? t(`rep.bless.${f}`) : t('rep.blessAt', { n: REP_BLESSING }) }}
      p.board__note(v-if="note" aria-live="polite") {{ note }}
</template>

<script setup lang="ts">
/**
 * The contract board (roadmap #15): the factions' three contracts of the day,
 * the standing they build, and what standing brings — a gift at +3, a lasting
 * blessing at +5. Contracts count by themselves; they are handed in here, in
 * any town.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import RepTrack from '@/components/game/RepTrack.vue'
import { closeModal } from '@/game/flow'
import { FACTIONS, FACTION_COLOR, type FactionId } from '@/game/data/quests'
import { REP_BLESSING, REP_GIFT, contractGold, type Contract } from '@/game/contracts'
import { blessings, claimGift, contractsToday, giftReady, handInContract, profile } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'

const { t } = useI18n()
contractsToday()
const list = computed(() => profile.meta.contracts.list)
const note = ref('')

const what = (c: Contract): string =>
  c.kind === 'slay' ? t('contract.slay', { enemy: t(`enemy.${c.enemy}`), place: t(`node.${c.zone}.name`) })
    : c.kind === 'clear' ? t('contract.clear', { place: t(`node.${c.zone}.name`) })
      : t('contract.chests')

const handIn = (i: number): void => {
  const c = list.value[i]
  if (!c || !handInContract(i)) { sfx('denied'); return }
  sfx('coin')
  sfx('uiBuy')
  note.value = t('contract.thanks', { name: t(`faction.${c.faction}`) })
}
const gift = (f: FactionId): void => {
  const id = claimGift(f)
  if (id === null) return
  sfx('chest')
  note.value = id ? t('rep.giftGot', { item: t(`item.${id}.name`) }) : t('rep.giftGold')
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.board
  display: flex
  flex-direction: column
  gap: 0.55rem
  color: var(--bc-on)
.board__lead, .board__note
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
  text-align: center
.board__cap
  margin: 0.2rem 0 0
  +cel.label
  font-size: clamp(0.78rem, 3.1vmin, 0.98rem)
  text-align: center
.board__list, .board__rewards
  margin: 0
  padding: 0
  list-style: none
  display: flex
  flex-direction: column
  gap: 0.4rem
.job
  display: grid
  grid-template-columns: minmax(0, 1fr) auto
  grid-template-areas: "who count" "what what" "pay act"
  align-items: center
  gap: 0.15rem 0.5rem
  padding: 0.4rem 0.6rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-inline-start: 0.4rem solid var(--tone)
  border-radius: var(--bc-r-md)
  background: var(--bc-paper-hi)
  text-align: start
  &.is-ready
    box-shadow: 0 0 0 2px var(--bc-gold)
  &.is-done
    opacity: 0.6
.job__who
  grid-area: who
  font-size: clamp(0.64rem, 2.6vmin, 0.82rem)
  font-weight: 900
.job__what
  grid-area: what
  font-size: clamp(0.8rem, 3.3vmin, 1.02rem)
  line-height: 1.2
.job__count
  grid-area: count
  font-weight: 900
  font-variant-numeric: tabular-nums
.job__pay
  grid-area: pay
  display: inline-flex
  align-items: center
  gap: 0.2em
  color: var(--bc-on-accent)
  font-size: clamp(0.66rem, 2.7vmin, 0.84rem)
.job__coin
  width: 1em
  height: 1em
.job__act
  grid-area: act
  justify-self: end
.job__done
  color: var(--bc-on-good)
  font-weight: 900
  font-size: clamp(0.66rem, 2.7vmin, 0.84rem)
.reward
  display: grid
  grid-template-columns: minmax(0, 1fr) auto
  grid-template-areas: "who gift" "bless bless"
  align-items: center
  gap: 0.1rem 0.5rem
  padding: 0.25rem 0.5rem
  border-inline-start: 0.3rem solid var(--tone)
  font-size: clamp(0.66rem, 2.7vmin, 0.84rem)
  text-align: start
.reward__who
  grid-area: who
  font-weight: 900
.reward__gift
  grid-area: gift
.reward__bless
  grid-area: bless
  color: var(--bc-on-soft)
  &.is-on
    color: var(--bc-on-good)
    font-weight: 900
.reward__dim
  color: var(--bc-on-soft)
</style>
