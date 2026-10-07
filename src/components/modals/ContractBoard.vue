<template lang="pug">
  FModal(:model-value="true" :title="town ? t('board.title', { town: t(`node.${town}.name`) }) : t('contract.title')" surface="parchment" tone="green" @update:model-value="closeModal")
    div.board(data-contracts)
      //- The town's own tasks (#85): posted every day, handed in at this board.
      template(v-if="town")
        p.board__lead {{ t('board.lead') }}
        ul.board__list(data-tasks)
          li.job.job--task(v-for="(k, i) in tasks" :key="i" :data-task="i" :class="{ 'is-done': k.done, 'is-ready': taskReady(k) }")
            span.job__who {{ t(`board.kind.${k.kind}`) }}
            span.job__what {{ taskWhat(k) }}
            span.job__count {{ taskHave(k) }} / {{ k.n }}
            span.job__pay
              IconCoin.job__coin
              | {{ fmt(taskPay(k).gold) }} · {{ t('board.xp', { n: fmt(taskPay(k).xp) }) }}
            span.job__act
              span.job__done(v-if="k.done") {{ t('contract.handed') }}
              FButton(v-else-if="k.kind === 'escort' && !taskReady(k)" :label="t('board.setOut')" type="primary" size="sm" icon="forward" @click="setOut")
              FButton(v-else :label="t('contract.handIn')" type="success" size="sm" :is-disabled="!taskReady(k)" @click="handInT(i)")
      //- The factions' contracts (#15), from the second zone cleared on.
      template(v-if="contractsOpen")
        h4.board__cap(v-if="town") {{ t('contract.title') }}
        p.board__lead {{ t('contract.lead') }}
      ul.board__list(v-if="contractsOpen")
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
      h4.board__cap(v-if="contractsOpen") {{ t('rep.title') }}
      RepTrack(v-if="contractsOpen")
      ul.board__rewards(v-if="contractsOpen")
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
import { closeModal, flow, setOutEscort } from '@/game/flow'
import type { TownId } from '@/game/data/zones'
import type { TownTask } from '@/game/townTasks'
import { FACTIONS, FACTION_COLOR, type FactionId } from '@/game/data/quests'
import { REP_BLESSING, REP_GIFT, contractGold, type Contract } from '@/game/contracts'
import { blessings, claimGift, contractsToday, giftReady, handInContract, handInTask, profile, taskHave, taskPay, taskReady, tasksOf } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'

const { t } = useI18n()
contractsToday()
const list = computed(() => profile.meta.contracts.list)
const note = ref('')

/** The town whose board this is (none: opened from the map). */
const town = computed<TownId | null>(() => (flow.screen === 'town' && flow.node ? flow.node as TownId : null))
const tasks = computed<TownTask[]>(() => {
  if (!town.value) return []
  // Re-read when the pouch or the day's lists change.
  void profile.inv.herbs
  void profile.meta.tasks.towns
  return tasksOf(town.value)
})
/** Contracts come with the second zone cleared (the first town visit stays about the trainer). */
const contractsOpen = computed(() => profile.world.cleared.filter(n => n !== 'sunford').length >= 2)

const taskWhat = (k: TownTask): string =>
  k.kind === 'slay' ? t('board.slay', { n: k.n, enemy: t(`enemy.${k.enemy}`), place: t(`node.${k.zone}.name`) })
    : k.kind === 'gather' ? t('board.gather', { n: k.n, plant: t(`plant.${k.plant}.name`) })
      : t('board.escort')

const handInT = (i: number): void => {
  if (!town.value || !handInTask(town.value, i)) { sfx('denied'); return }
  sfx('coin')
  sfx('uiBuy')
  note.value = t('board.thanks')
}
const setOut = (): void => {
  sfx('uiOpen')
  void setOutEscort()
}

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
// The town's own tasks wear the board's gold.
.job--task
  --tone: var(--bc-gold)
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
