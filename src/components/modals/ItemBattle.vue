<template lang="pug">
  FModal(:model-value="true" :title="t('battle.title')" surface="parchment" tone="gold" @update:model-value="leave")
    div.bat(data-item-battle :class="`is-${phase}`")
      p.bat__lead {{ t('battle.lead') }}
      p.bat__row {{ t('battle.row', { n: row, max: BATTLE_ROW }) }}
      //- Sitting down: the fee, or why not.
      template(v-if="phase === 'idle' || phase === 'over'")
        p.bat__result(v-if="phase === 'over'" :class="{ 'is-bad': !won }" aria-live="polite") {{ won ? t('battle.won', { n: fmt(xp) }) : t('battle.lost') }}
        p.bat__prize(v-if="prize") {{ prize.item ? t('gamble.prize', { item: t(`item.${prize.item}.name`) }) : t('gamble.prizeGold', { n: fmt(prize.gold) }) }}
        FButton.bat__start(:label="phase === 'over' ? t('battle.again') : t('battle.fee', { n: fmt(fee) })" type="success" size="md" icon="coin" :is-disabled="!!block" @click="sit")
        p.bat__note(v-if="block === 'items'") {{ t('battle.needItems', { n: BATTLE_MIN_ITEMS }) }}
        p.bat__note(v-else-if="block === 'gold'") {{ t('battle.noGold') }}
      //- A round: the gambler's piece, the score, the hero's pick.
      template(v-else)
        p.bat__score {{ t('battle.score', { a: mine, b: theirs }) }}
        div.bat__duel
          div.bat__side
            span.bat__cap {{ t('battle.theirs') }}
            ItemCell.bat__cell(:id="their.id")
            span.bat__tier(:style="{ color: TIER_COLOR[their.tier] }") {{ t(`tier.${their.tier}`) }}
            span.bat__value(v-if="phase === 'reveal'") {{ t('battle.value', { n: fmt(sellValue(their)) }) }}
          div.bat__side(v-if="laid")
            span.bat__cap {{ t(`item.${laid.id}.name`) }}
            ItemCell.bat__cell(:id="laid.id")
            span.bat__tier(:style="{ color: TIER_COLOR[laid.tier] }") {{ t(`tier.${laid.tier}`) }}
            span.bat__value {{ t('battle.value', { n: fmt(sellValue(laid)) }) }}
        p.bat__result(v-if="phase === 'reveal'" :class="{ 'is-bad': lastWon === false }" aria-live="polite") {{ lastWon ? t('battle.roundWon') : t('battle.roundLost') }}
        template(v-if="phase === 'round'")
          p.bat__cap {{ t('battle.pick') }}
          div.bat__bag
            ItemCell.bat__pick(
              v-for="id in bag"
              :key="id"
              :id="id"
              :selected="pick === id"
              :data-lay="id"
              @click="pick = id"
            )
          FButton.bat__lay(:label="t('battle.lay')" type="primary" size="md" :is-disabled="!pick" @click="lay")
</template>

<script setup lang="ts">
/**
 * ─── The item battle (roadmap #92, D111) ────────────────────────────────────
 *
 * A small fee; then three items at most from each side, one at a time. The
 * gambler's piece shows its picture and quality, its price only once the
 * hero has laid his own; the dearer piece takes the point, two points take
 * the game. The hero's laid items are gone either way (`gamble.ts`,
 * `profile.settleBattle`). Leaving mid-game loses it.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import ItemCell from '@/components/game/ItemCell.vue'
import { closeModal } from '@/game/flow'
import { battleBlock, battleRow, layBattleItem, profile, settleBattle, startBattle, unwornItems } from '@/game/state/profile'
import { flow } from '@/game/flow'
import { BATTLE_MIN_ITEMS, BATTLE_POINTS, BATTLE_ROW, battleFee, battleRound, gamblerItem } from '@/game/gamble'
import { ITEM_BY_ID, TIER_COLOR, sellValue, type ItemDef } from '@/game/data/items'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'

const { t } = useI18n()

type Phase = 'idle' | 'round' | 'reveal' | 'over'
const phase = ref<Phase>('idle')
/** Whose table: each gambler plays his own (#115). */
const gambler = computed(() => flow.npc?.id ?? 'sunfordGambler')
const row = computed(() => { void profile.meta.gamble.rows[gambler.value]; return battleRow(gambler.value) })
const fee = computed(() => battleFee(gambler.value))
const block = computed(() => battleBlock(gambler.value))
const bag = computed(() => unwornItems())

let seed = 0
const k = ref(0)
const mine = ref(0)
const theirs = ref(0)
const pick = ref('')
const laid = ref<ItemDef | null>(null)
const lastWon = ref<boolean | null>(null)
const won = ref(false)
const xp = ref(0)
const prize = ref<{ item: string; gold: number } | null>(null)
const their = computed(() => gamblerItem(gambler.value, row.value, k.value, seed))

const sit = (): void => {
  if (!startBattle(gambler.value)) { sfx('denied'); return }
  sfx('coin')
  seed = Date.now() >>> 0
  k.value = 0
  mine.value = 0
  theirs.value = 0
  prize.value = null
  next()
}

const next = (): void => {
  pick.value = ''
  laid.value = null
  lastWon.value = null
  phase.value = 'round'
}

const lay = (): void => {
  const it = ITEM_BY_ID[pick.value]
  if (!it || !layBattleItem(it.id)) { sfx('denied'); return }
  laid.value = it
  const r = battleRound(it, their.value)
  lastWon.value = r === 'win'
  if (r === 'win') mine.value++
  else theirs.value++
  sfx(r === 'win' ? 'coin' : 'denied')
  phase.value = 'reveal'
  window.setTimeout(() => {
    if (phase.value !== 'reveal') return
    if (mine.value >= BATTLE_POINTS || theirs.value >= BATTLE_POINTS) finish(mine.value >= BATTLE_POINTS)
    else { k.value++; next() }
  }, 1600)
}

const finish = (w: boolean): void => {
  const r = settleBattle(w, gambler.value)
  won.value = w
  xp.value = r.xp
  prize.value = r.prize
  phase.value = 'over'
  sfx(w ? 'uiLearn' : 'denied')
}

/** Leaving mid-game: the game is lost. */
const leave = (): void => {
  if (phase.value === 'round' || phase.value === 'reveal') finish(false)
  closeModal()
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.bat
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.4rem, 1.8vmin, 0.8rem)
  width: min(36rem, 100%)
.bat__lead, .bat__note
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.72rem, 3vmin, 0.92rem)
  line-height: 1.3
  text-align: center
.bat__row, .bat__score, .bat__cap
  margin: 0
  +cel.label
  color: var(--bc-on)
  font-size: clamp(0.76rem, 3vmin, 0.95rem)
  text-align: center
.bat__score
  font-size: clamp(0.9rem, 3.6vmin, 1.15rem)
.bat__result, .bat__prize
  margin: 0
  +cel.label
  color: var(--bc-on-good)
  font-size: clamp(0.85rem, 3.4vmin, 1.05rem)
  text-align: center
  &.is-bad
    color: var(--bc-on-bad)
.bat__prize
  color: var(--bc-on-accent)
.bat__duel
  display: flex
  justify-content: center
  gap: clamp(1rem, 6vmin, 3rem)
.bat__side
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.25rem
  max-width: 10rem
.bat__cell
  width: clamp(3.4rem, 14vmin, 5rem)
.bat__tier, .bat__value
  +cel.label
  font-size: clamp(0.7rem, 2.8vmin, 0.88rem)
.bat__value
  color: var(--bc-on-accent)
// A phone on its side: the rules give way to the table, the bag is one row.
@media (max-height: 30rem)
  .bat
    gap: 0.3rem
  .bat__lead
    display: none
  .bat__cell
    width: 3rem
  .bat__bag
    max-height: 4.2rem
.bat__bag
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(clamp(2.8rem, 11vmin, 3.8rem), 1fr))
  gap: 0.4rem
  width: 100%
  max-height: 34vh
  overflow-y: auto
</style>
