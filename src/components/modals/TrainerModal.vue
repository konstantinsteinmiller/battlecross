<template lang="pug">
  FModal(:model-value="true" surface="wood" :title="t(`class.${cls}.name`)" @update:model-value="closeModal")
    div.trainer(:style="{ '--tint': CLASSES[cls].color }")
      div.trainer__who
        span.trainer__face
          Portrait(:look="flow.npc ? flow.npc.look : 'elder'" :ring="CLASSES[cls].color")
        span.trainer__say
          span.trainer__name {{ flow.npc ? t(`npc.${flow.npc.id}.name`) : '' }}
          span.trainer__line {{ t(`class.${cls}.desc`) }}
        GoldPill
      p.trainer__friend(v-if="friend") {{ t('trainer.friend', { faction: t(`faction.${CLASSES[cls].faction}`) }) }}
      div.trainer__list
        button.lesson(
          v-for="s in skills"
          :key="s.id"
          type="button"
          :class="{ 'is-sel': picked === s.id, 'is-known': knows(s.id), 'is-open': learnBlock(s.id) === '' }"
          :aria-label="t(`skill.${s.id}.name`)"
          @click="picked = s.id"
        )
          span.lesson__icon
            SkillIcon(:id="s.id" :dim="!knows(s.id) && learnBlock(s.id) !== '' && learnBlock(s.id) !== 'gold'")
          span.lesson__name {{ t(`skill.${s.id}.name`) }}
          span.lesson__price(v-if="knows(s.id)") {{ t('trainer.known') }}
          span.lesson__price(v-else :class="{ bad: profile.gold < skillCost(s.id) }")
            IconCoin.lesson__coin
            | {{ fmt(skillCost(s.id)) }}
      template(v-if="picked")
        SkillCard(:id="picked")
        p.trainer__block(v-if="block && block !== 'known'") {{ t(`trainer.block.${block}`) }}
        div.trainer__actions
          FButton(
            :label="block === 'known' ? t('trainer.known') : t('trainer.learn')"
            type="success"
            size="sm"
            :is-disabled="block !== ''"
            @click="learn"
          )
</template>

<script setup lang="ts">
/**
 * A class trainer (GDD §4.2, §5): six skills, bought with gold once the hero
 * meets a skill's level and attribute bars. Any hero may learn from any
 * trainer — the build is whatever the six active and three passive slots hold.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CLASSES, skillsOf, type ClassId } from '@/game/data/skills'
import { REP_FRIEND } from '@/game/data/quests'
import { knows, learnBlock, learnSkill, profile, skillCost } from '@/game/state/profile'
import { closeModal, flow } from '@/game/flow'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import Portrait from '@/components/art/Portrait.vue'
import SkillIcon from '@/components/art/SkillIcon.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import SkillCard from '@/components/game/SkillCard.vue'
import GoldPill from '@/components/game/GoldPill.vue'

const { t } = useI18n()
const cls = computed<ClassId>(() => (flow.trainerCls || 'aegis') as ClassId)
const skills = computed(() => skillsOf(cls.value))
const picked = ref('')
const block = computed(() => (picked.value ? learnBlock(picked.value) : ''))
const friend = computed(() => {
  const f = CLASSES[cls.value].faction
  return f !== 'none' && profile.quests.rep[f] >= REP_FRIEND
})

const learn = (): void => { sfx(learnSkill(picked.value) ? 'uiLearn' : 'denied') }
</script>

<style scoped lang="sass">
.trainer
  display: flex
  flex-direction: column
  gap: clamp(0.5rem, 2.2vmin, 0.8rem)
  color: #fff
.trainer__who
  display: flex
  align-items: center
  gap: 0.6rem
.trainer__face
  width: clamp(2.8rem, 12vmin, 3.8rem)
.trainer__say
  flex: 1 1 auto
  display: flex
  flex-direction: column
  min-width: 0
.trainer__name
  color: var(--tint)
  font-size: clamp(0.84rem, 3.5vmin, 1.05rem)
.trainer__line
  color: #dfe6ff
  font-size: clamp(0.7rem, 2.9vmin, 0.88rem)
  line-height: 1.25
.trainer__friend
  margin: 0
  color: #7dff8a
  font-size: clamp(0.7rem, 2.9vmin, 0.88rem)
.trainer__list
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 12.5rem), 1fr))
  gap: clamp(0.3rem, 1.4vmin, 0.45rem)
.lesson
  display: grid
  grid-template-columns: auto minmax(0, 1fr) auto
  align-items: center
  gap: 0.5rem
  padding: 0.3rem 0.5rem 0.3rem 0.3rem
  border: 0
  border-radius: 0.7rem
  background: rgba(14, 20, 44, 0.7)
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.14)
  color: #fff
  text-align: left
  cursor: pointer
  touch-action: manipulation
  &.is-sel
    box-shadow: 0 0 0 3px #ffffff, 0 0 0.9rem var(--tint)
  &.is-open:not(.is-sel)
    box-shadow: inset 0 0 0 2px #7dff8a
.lesson__icon
  width: clamp(2.3rem, 10vmin, 2.9rem)
.lesson__name
  font-size: clamp(0.76rem, 3.1vmin, 0.94rem)
  line-height: 1.15
.lesson__price
  display: inline-flex
  align-items: center
  gap: 0.2em
  color: #ffe066
  font-size: clamp(0.68rem, 2.8vmin, 0.86rem)
  white-space: nowrap
  &.bad
    color: #ff8a8a
.is-known .lesson__price
  color: #7dff8a
.lesson__coin
  width: 1em
  height: 1em
.trainer__block
  margin: 0
  color: #ffb0b0
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
  text-align: right
.trainer__actions
  display: flex
  justify-content: flex-end
</style>
