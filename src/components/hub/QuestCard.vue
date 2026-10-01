<template lang="pug">
  div.qcard(:class="{ story, climb }" :style="{ '--c1': SECTOR_COLOR[quest.sector] }")
    div.q-icon
      GameIcon(:name="ICON[quest.template]")
    div.q-body
      div.q-title {{ story && quest.template === 'boss' ? t('quest.bossTitle', { boss: t(`boss.${SECTOR_BY_ID[quest.sector].boss}`) }) : quest.template === 'stage' ? t(`quest.stageName.${quest.sector}`) : t(`quest.${quest.template}`) }}
      div.q-desc {{ t(`quest.desc.${quest.template}`, params) }}
      div.q-meta
        //- A climb ends in a rematch: the boss named on the card, in the
        //- boss's red, so the tower is not read as one more job.
        span.chip.rematch(v-if="climb") {{ t('quest.rematch', { boss: params.boss }) }}
        span.chip.sector {{ t(`sector.${quest.sector}`) }}
        span.chip.lvl {{ t('enemy.level', { n: quest.level }) }}
        span.chip.xp {{ t('combat.xp', { n: quest.reward.xp }) }}
        //- A reward, signed like the XP beside it: a bare "⚡ 140" was read
        //- as a price.
        span.chip.bolt
          | +{{ quest.reward.bolts }}
          GameIcon.mini(name="nut")
    div.q-actions
      button.deploy(type="button" @click="$emit('deploy')")
        GameIcon.mini(name="play")
        span {{ t('hub.deploy') }}
      button.reroll(v-if="!story" type="button" :aria-label="t('hub.reroll')" @click="$emit('reroll')")
        GameIcon(name="replay")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import type { GameIconName } from '@/components/icons/iconNames'
import type { Quest, QuestTemplate } from '@/game/data/quests'
import { SECTOR_COLOR } from '@/game/data/signature'
import { SECTOR_BY_ID } from '@/game/data/regions'

const props = defineProps<{ quest: Quest; story?: boolean }>()
defineEmits<{ deploy: []; reroll: [] }>()
const { t } = useI18n()
const ICON: Record<QuestTemplate, GameIconName> = {
  tutorial: 'star', boss: 'skull', kill: 'bomb', collect: 'gem', rescue: 'heart', elite: 'trophy', supply: 'chest', purge: 'flame',
  climb: 'up', stage: 'rocket'
}
/** A Tower Run: its own livery (hazard stripes, a climbing arrow). */
const climb = computed(() => props.quest.template === 'climb')
const params = computed(() => ({
  n: props.quest.count,
  target: props.quest.target
    ? (props.quest.template === 'kill' ? t(`enemyPlural.${props.quest.target}`, props.quest.count) : t(`enemy.${props.quest.target}`))
    : '',
  sector: t(`sector.${props.quest.sector}`),
  boss: t(`boss.${SECTOR_BY_ID[props.quest.sector].boss}`)
}))
</script>

<style scoped lang="sass">
.qcard
  container-type: inline-size
  display: grid
  grid-template-columns: auto 1fr auto
  align-items: center
  gap: 10px
  padding: 10px
  border-radius: 14px
  border: 2px solid #141a33
  background: linear-gradient(90deg, color-mix(in srgb, var(--c1) 40%, #16244e), rgba(22, 36, 78, 0.9) 60%)
  &.story
    border-color: #ffd84a
    box-shadow: 0 0 14px rgba(255, 216, 74, 0.25)
.q-icon
  width: clamp(36px, 8vmin, 48px)
  height: clamp(36px, 8vmin, 48px)
  padding: 8px
  border-radius: 12px
  border: 2px solid #141a33
  background: radial-gradient(circle at 40% 30%, #fff, #7ff4ff 45%, #1f7fd0)
  color: #141a33
.story .q-icon
  background: radial-gradient(circle at 40% 30%, #fff, #ff8a8a 45%, #c0101f)
// The climb: a hazard-striped rim (the tower's ledges) and an amber arrow up.
.qcard.climb
  border-color: #ffc21a
  background: linear-gradient(90deg, color-mix(in srgb, var(--c1) 40%, #16244e), rgba(22, 36, 78, 0.9) 60%) padding-box, repeating-linear-gradient(-45deg, #ffc21a 0 8px, #1b1d24 8px 16px) border-box
  border: 3px solid transparent
  box-shadow: 0 0 12px rgba(255, 194, 26, 0.22)
.climb .q-icon
  background: radial-gradient(circle at 40% 30%, #fff, #ffd23a 45%, #e07a00)
.chip.rematch
  background: rgba(192, 16, 31, 0.55)
  color: #ffe0e0
.q-title
  font-size: clamp(14px, 3vmin, 18px)
  text-shadow: 0 2px 0 #141a33
.q-desc
  font-size: clamp(11px, 2.4vmin, 14px)
  color: #cfe0ff
  line-height: 1.25
.q-meta
  display: flex
  flex-wrap: wrap
  gap: 4px
  margin-top: 4px
.chip
  display: inline-flex
  align-items: center
  gap: 3px
  padding: 1px 7px
  border-radius: 999px
  background: rgba(0, 0, 0, 0.3)
  font-size: clamp(9px, 2vmin, 12px)
  &.xp
    color: #9dff5a
  &.bolt
    color: #ffd84a
  &.lvl
    color: #9fe6ff
.mini
  width: 1.1em
  height: 1.1em
.q-actions
  display: flex
  flex-direction: column
  gap: 6px
  align-items: stretch
.deploy
  display: flex
  align-items: center
  gap: 5px
  padding: clamp(7px, 1.6vmin, 10px) clamp(10px, 2.4vmin, 16px)
  border-radius: 12px
  border: 3px solid #141a33
  background: linear-gradient(#ffd23a, #e08a00)
  color: #141a33
  font-family: var(--font-ui)
  font-size: clamp(12px, 2.6vmin, 15px)
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  &:active
    transform: translateY(2px)
.reroll
  align-self: center
  width: 30px
  height: 30px
  padding: 5px
  border-radius: 50%
  border: 2px solid #141a33
  background: #2f4580
  color: #fff
// Narrow card (a phone held upright): the actions drop under the text as a
// full-width row, so the description is not squeezed into a sliver.
@container (max-width: 340px)
  .q-actions
    grid-column: 1 / -1
    flex-direction: row
    align-items: center
  .deploy
    flex: 1
    justify-content: center
</style>
