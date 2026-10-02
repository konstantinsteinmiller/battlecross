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
      span.req.has-attr(v-for="r in reqs" :key="r.attr" :class="{ bad: r.have < r.need }" :style="{ '--attr': ATTR_COLOR[r.attr] }") {{ t(`attr.${r.attr}.short`) }} {{ r.have < r.need ? `${r.have} / ${r.need}` : r.need }}
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
@use '@/assets/css/cel'

// A parchment card under a ribbon in the skill's class colour. The card
// brings its own page and its own ink, so it reads the same in any window.
.skill-card
  position: relative
  display: flex
  flex-direction: column
  gap: 0.4rem
  padding: clamp(0.5rem, 2.2vmin, 0.8rem)
  border-radius: var(--bc-r-md)
  border: var(--bc-ol) solid var(--bc-ink)
  background: linear-gradient(180deg, var(--bc-paper-hi) 0, var(--bc-paper-hi) 0.4rem, var(--bc-paper) 0.4rem, var(--bc-paper) 100%)
  box-shadow: var(--bc-drop)
  color: var(--bc-paper-ink)
  text-align: start
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
  align-items: flex-start
  gap: 0.2rem
  min-width: 0
// The name on a two-tone band of the class's colour.
.skill-card__name
  max-width: 100%
  padding: 0.12em 0.6em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: linear-gradient(180deg, color-mix(in srgb, var(--tint) 72%, var(--bc-white)) 0, color-mix(in srgb, var(--tint) 72%, var(--bc-white)) 46%, var(--tint) 46%, var(--tint) 100%)
  +cel.label
  font-size: clamp(0.9rem, 3.7vmin, 1.15rem)
  line-height: 1.15
.skill-card__sub
  color: var(--bc-paper-ink-soft)
  font-size: clamp(0.7rem, 2.9vmin, 0.88rem)
.skill-card__desc
  margin: 0
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
  line-height: 1.3
.skill-card__facts, .skill-card__reqs
  display: flex
  flex-wrap: wrap
  gap: 0.3rem
// Facts and requirements: small two-tone tags.
.fact, .req
  +cel.tone('stone')
  padding: 0.12em 0.6em
  border-radius: var(--bc-r-pill)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  +cel.fill(48%, 100%)
  +cel.label
  font-size: clamp(0.66rem, 2.7vmin, 0.82rem)
  line-height: 1.3
  text-shadow: var(--bc-text-outline-thin)
.fact--mana
  +cel.tone('blue')
.fact--hp
  +cel.tone('red')
.fact--heat
  +cel.tone('orange')
.fact--aim
  +cel.tone('purple')
// A requirement wears its attribute's colour; one not met goes dark red.
.req.has-attr
  background: linear-gradient(180deg, color-mix(in srgb, var(--attr) 76%, var(--bc-white)) 0, color-mix(in srgb, var(--attr) 76%, var(--bc-white)) 48%, var(--attr) 48%, var(--attr) 100%)
.req.bad
  background: var(--bc-red-deep)
  color: var(--bc-text-bad)
</style>
