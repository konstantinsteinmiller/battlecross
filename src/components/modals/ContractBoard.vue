<template lang="pug">
  FModal(:model-value="true" :title="town ? t('board.title', { town: t(`node.${town}.name`) }) : t('contract.title')" surface="parchment" tone="green" @update:model-value="closeModal")
    div.board(data-contracts)
      //- The town's own tasks (#85): posted every day, handed in at this board.
      template(v-if="town")
        p.board__lead {{ t('board.lead') }}
        ul.board__list(data-tasks)
          li.card.job.job--task(v-for="(k, i) in tasks" :key="i" :data-task="i" :class="{ 'is-done': k.done, 'is-ready': taskReady(k) }")
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
        li.card.job(v-for="(c, i) in list" :key="c.faction" :data-contract="i" :class="{ 'is-done': c.done, 'is-ready': !c.done && c.have >= c.n }" :style="{ '--tone': FACTION_COLOR[c.faction] }")
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
      div.card.board__rep(v-if="contractsOpen" data-rep-card)
        RepTrack
      ul.board__rewards(v-if="contractsOpen")
        li.card.reward(v-for="f in FACTIONS" :key="f" :style="{ '--tone': FACTION_COLOR[f] }")
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
// A pinned parchment note: aged grain, scorched edges, a wax pin in the faction's colour.
$grain: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.1  0 0 0 0.5 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>")
.card
  position: relative
  color: var(--bc-paper-ink)
  border: var(--bc-ol-thin) solid var(--bc-paper-ink)
  border-radius: 0.25rem 0.6rem 0.3rem 0.55rem / 0.5rem 0.25rem 0.55rem 0.3rem
  background: $grain, radial-gradient(ellipse at 30% 20%, var(--bc-paper-hi) 0%, var(--bc-paper-lo) 60%, var(--bc-paper-deep) 120%)
  box-shadow: inset 0 0 1rem 0.15rem rgba(120, 70, 25, 0.5), 0.12rem 0.2rem 0 rgba(var(--bc-paper-ink-rgb), 0.35)
  text-align: start
.job
  display: grid
  grid-template-columns: minmax(0, 1fr) auto
  grid-template-areas: "who count" "what what" "pay act"
  align-items: center
  gap: 0.15rem 0.5rem
  margin-top: 0.35rem
  padding: 0.7rem 0.8rem 0.5rem
  // Border-inset ornaments (roadmap #127), on the pseudo the grain does not use.
  +cel.ornate-corners(clamp(0.9rem, 3.6vmin, 1.2rem), 0.16rem, 'corner', 'after')
  transform: rotate(-0.35deg)
  &:nth-child(even)
    transform: rotate(0.3deg)
  // The pin.
  &::before
    content: ''
    position: absolute
    top: -0.4rem
    inset-inline-start: 50%
    width: 0.8rem
    height: 0.8rem
    margin-inline-start: -0.4rem
    border-radius: 50%
    background: radial-gradient(circle at 35% 30%, #fff8 0 12%, transparent 14%), var(--tone)
    border: var(--bc-ol-thin) solid var(--bc-paper-ink)
    box-shadow: 0.1rem 0.15rem 0 rgba(var(--bc-paper-ink-rgb), 0.4)
  &.is-ready
    box-shadow: inset 0 0 0.9rem 0.1rem rgba(var(--bc-paper-ink-rgb), 0.3), 0 0 0 2px var(--bc-gold), 0.12rem 0.2rem 0 rgba(var(--bc-paper-ink-rgb), 0.35)
  &.is-done
    opacity: 0.7
    filter: sepia(0.5) saturate(0.7)
// The town's own tasks wear the board's gold.
.job--task
  --tone: var(--bc-gold)
.job__who
  grid-area: who
  font-size: clamp(0.64rem, 2.6vmin, 0.82rem)
  font-weight: 900
  letter-spacing: 0.06em
  text-transform: uppercase
  color: var(--bc-paper-ink-soft)
.job__what
  grid-area: what
  font-size: clamp(0.8rem, 3.3vmin, 1.02rem)
  line-height: 1.2
  font-style: italic
  padding-block: 0.1rem 0.25rem
  border-bottom: 1px dashed rgba(var(--bc-paper-ink-rgb), 0.4)
.job__count
  grid-area: count
  font-weight: 900
  font-variant-numeric: tabular-nums
.job__pay
  grid-area: pay
  display: inline-flex
  align-items: center
  gap: 0.2em
  color: var(--bc-paper-ink)
  font-weight: 700
  font-size: clamp(0.66rem, 2.7vmin, 0.84rem)
.job__coin
  width: 1em
  height: 1em
.job__act
  grid-area: act
  justify-self: end
.job__done
  color: #8a1f1a
  font-weight: 900
  padding: 0.05rem 0.4rem
  border: 2px solid currentColor
  border-radius: 0.3rem
  transform: rotate(-5deg)
  text-transform: uppercase
  font-size: clamp(0.66rem, 2.7vmin, 0.84rem)
.reward
  display: grid
  grid-template-columns: minmax(0, 1fr) auto
  grid-template-areas: "who gift" "bless bless"
  align-items: center
  gap: 0.1rem 0.5rem
  padding: 0.35rem 0.6rem
  border-inline-start: 0.35rem solid var(--tone)
  font-size: clamp(0.66rem, 2.7vmin, 0.84rem)
  text-align: start
.reward__who
  grid-area: who
  font-weight: 900
.reward__gift
  grid-area: gift
.reward__bless
  grid-area: bless
  color: var(--bc-paper-ink-soft)
  &.is-on
    color: var(--bc-green-deep)
    font-weight: 900
.reward__dim
  color: var(--bc-paper-ink-soft)
.board__rep
  padding: 0.5rem 0.7rem
// Keep the page's corner brackets clear of the cards.
.board
  padding-block-end: clamp(0.5rem, 2.4vw, 1rem)
  padding-inline: clamp(0.3rem, 1.6vw, 0.8rem)
</style>
