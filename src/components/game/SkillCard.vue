<template lang="pug">
  div.skill-card(v-if="skill" :style="{ '--tint': skill.color }")
    div.skill-card__head
      span.skill-card__icon
        SkillIcon(:id="id" :dim="dim")
      span.skill-card__title
        span.skill-card__name {{ t(`skill.${id}.name`) }}
        span.skill-card__sub {{ t(`class.${skill.cls}.name`) }} · {{ t(`skill.kind.${skill.kind}`) }}
    p.skill-card__desc {{ t(`skill.${id}.desc`, skill.p) }}
    div.skill-card__facts
      span.fact(v-if="skill.cd > 0") {{ t('skill.cooldown', { n: skill.cd }) }}
      span.fact.fact--mana(v-if="skill.mana > 0") {{ t('skill.mana', { n: skill.mana }) }}
      span.fact.fact--hp(v-if="skill.hpCost") {{ t('skill.hpCost', { n: skill.hpCost }) }}
      span.fact.fact--heat(v-if="skill.heat") {{ t('skill.heat', { n: skill.heat }) }}
      span.fact.fact--aim(v-if="skill.target === 'ground' || skill.target === 'dir'") {{ t('skill.aimed') }}
    div.skill-card__reqs
      span.req(:class="{ bad: profile.level < skill.level }") {{ t('hud.level', { n: skill.level }) }}
      span.req(v-for="r in reqs" :key="r.attr" :class="{ bad: r.have < r.need }" :style="{ '--c': ATTR_COLOR[r.attr] }") {{ t(`attr.${r.attr}.short`) }} {{ r.need }}
</template>

<script setup lang="ts">
/** One skill, spelled out: what it does (with the table's own numbers), what
 *  it costs, and what the hero must be to learn and slot it. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SKILL_BY_ID } from '@/game/data/skills'
import { ATTR_COLOR, type Attr } from '@/game/data/attributes'
import { profile, totalAttrs } from '@/game/state/profile'
import SkillIcon from '@/components/art/SkillIcon.vue'

const props = withDefaults(defineProps<{ id: string; dim?: boolean }>(), { dim: false })
const { t } = useI18n()
const skill = computed(() => SKILL_BY_ID[props.id])
const reqs = computed(() => {
  const s = skill.value
  if (!s) return []
  const have = totalAttrs()
  return (Object.keys(s.req) as Attr[]).map(attr => ({ attr, need: s.req[attr] ?? 0, have: have[attr] }))
})
</script>

<style scoped lang="sass">
.skill-card
  display: flex
  flex-direction: column
  gap: 0.4rem
  padding: clamp(0.5rem, 2.2vmin, 0.8rem)
  border-radius: 0.8rem
  border: 2px solid #0f1a30
  background: linear-gradient(180deg, rgba(20, 28, 60, 0.85), rgba(14, 20, 44, 0.85))
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--tint) 55%, transparent)
  color: #fff
  text-align: left
.skill-card__head
  display: flex
  align-items: center
  gap: 0.6rem
.skill-card__icon
  width: clamp(2.6rem, 11vmin, 3.4rem)
  flex: 0 0 auto
.skill-card__title
  display: flex
  flex-direction: column
  min-width: 0
.skill-card__name
  color: var(--tint)
  font-size: clamp(0.92rem, 3.8vmin, 1.2rem)
  line-height: 1.15
.skill-card__sub
  color: #b9c4ee
  font-size: clamp(0.7rem, 2.9vmin, 0.88rem)
.skill-card__desc
  margin: 0
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
  line-height: 1.3
  color: #e8edff
.skill-card__facts, .skill-card__reqs
  display: flex
  flex-wrap: wrap
  gap: 0.3rem
.fact, .req
  padding: 0.12em 0.55em
  border-radius: 999px
  border: 2px solid #0f1a30
  background: #3a4678
  font-size: clamp(0.66rem, 2.7vmin, 0.82rem)
  line-height: 1.3
.fact--mana
  background: #2f6fe0
.fact--hp
  background: #d83040
.fact--heat
  background: #e0762a
.fact--aim
  background: #6a4ac0
.req
  background: color-mix(in srgb, var(--c, #ffe066) 55%, #1c2440)
  &.bad
    background: #5a1c26
    color: #ff9a9a
</style>
