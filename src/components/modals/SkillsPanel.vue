<template lang="pug">
  div.loadout
    section.loadout__row
      h3.loadout__label {{ t('skills.active') }}
      div.slots
        button.slot(
          v-for="(id, i) in profile.hero.active"
          :key="`a${i}`"
          type="button"
          :class="{ 'is-sel': sel.kind === 'active' && sel.slot === i, 'is-empty': !id }"
          :aria-label="id ? t(`skill.${id}.name`) : t('skills.emptySlot', { n: i + 1 })"
          @click="pickSlot('active', i)"
        )
          SkillIcon(v-if="id" :id="id")
          span.slot__n(v-else) {{ i + 1 }}
    section.loadout__row
      h3.loadout__label {{ t('skills.passive') }}
      div.slots
        button.slot.slot--round(
          v-for="(id, i) in profile.hero.passive"
          :key="`p${i}`"
          type="button"
          :class="{ 'is-sel': sel.kind === 'passive' && sel.slot === i, 'is-empty': !id }"
          :aria-label="id ? t(`skill.${id}.name`) : t('skills.emptySlot', { n: i + 1 })"
          @click="pickSlot('passive', i)"
        )
          SkillIcon(v-if="id" :id="id")
          span.slot__n(v-else) {{ i + 1 }}
    section.loadout__row
      h3.loadout__label {{ t('skills.known') }}
      p.loadout__hint(v-if="known.length === 0") {{ t('skills.none') }}
      div.known
        button.slot(
          v-for="s in known"
          :key="s.id"
          type="button"
          :class="{ 'slot--round': s.kind === 'passive', 'is-sel': picked === s.id, 'is-used': slotted(s.id) }"
          :aria-label="t(`skill.${s.id}.name`)"
          @click="picked = s.id"
        )
          SkillIcon(:id="s.id" :dim="!usable(s.id)")
    template(v-if="picked")
      SkillCard(:id="picked")
      p.loadout__hint(v-if="!usable(picked)") {{ t('skills.unmet') }}
      div.loadout__actions
        FButton(v-if="slotted(picked)" :label="t('skills.remove')" type="danger" size="sm" @click="remove")
        FButton(:label="t('skills.equip')" type="success" size="sm" :is-disabled="!usable(picked)" @click="equip")
</template>

<script setup lang="ts">
/**
 * The loadout (GDD §4.2): six active and three passive slots, filled from
 * everything the hero has learned — from any class, which is the whole point
 * of the classless build. Pick a slot, pick a skill, slot it.
 */
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { SKILL_BY_ID, meetsSkill, type SkillDef } from '@/game/data/skills'
import { profile, setSlot, totalAttrs } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import FButton from '@/components/atoms/FButton.vue'
import SkillIcon from '@/components/art/SkillIcon.vue'
import SkillCard from '@/components/game/SkillCard.vue'

const { t } = useI18n()
const sel = reactive<{ kind: 'active' | 'passive' | ''; slot: number }>({ kind: '', slot: -1 })
const picked = ref('')

const known = computed<SkillDef[]>(() => profile.hero.learned.map(id => SKILL_BY_ID[id]).filter((s): s is SkillDef => !!s))
const slotted = (id: string): boolean => profile.hero.active.includes(id) || profile.hero.passive.includes(id)
const usable = (id: string): boolean => {
  const s = SKILL_BY_ID[id]
  return !!s && meetsSkill(s, profile.level, totalAttrs())
}

const pickSlot = (kind: 'active' | 'passive', slot: number): void => {
  sel.kind = kind
  sel.slot = slot
  const id = (kind === 'active' ? profile.hero.active : profile.hero.passive)[slot]
  if (id) picked.value = id
}

const equip = (): void => {
  const s = SKILL_BY_ID[picked.value]
  if (!s) return
  const slots = s.kind === 'active' ? profile.hero.active : profile.hero.passive
  // The chosen slot when it is of the right kind, else the first free one,
  // else the first.
  let slot = sel.kind === s.kind ? sel.slot : -1
  if (slot < 0) slot = slots.indexOf('')
  if (slot < 0) slot = 0
  if (setSlot(s.kind, slot, s.id)) {
    sfx('uiEquip')
    sel.kind = s.kind
    sel.slot = slot
  } else sfx('denied')
}

const remove = (): void => {
  const s = SKILL_BY_ID[picked.value]
  if (!s) return
  const slots = s.kind === 'active' ? profile.hero.active : profile.hero.passive
  const at = slots.indexOf(s.id)
  if (at >= 0 && setSlot(s.kind, at, '')) sfx('uiClose')
}
</script>

<style scoped lang="sass">
.loadout
  display: flex
  flex-direction: column
  gap: clamp(0.5rem, 2.2vmin, 0.8rem)
  color: #fff
.loadout__row
  display: flex
  flex-direction: column
  gap: 0.3rem
.loadout__label
  margin: 0
  color: #b9c4ee
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
  font-weight: inherit
.loadout__hint
  margin: 0
  color: #ffb0b0
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
.slots, .known
  display: flex
  flex-wrap: wrap
  gap: clamp(0.3rem, 1.5vmin, 0.5rem)
.slot
  position: relative
  width: clamp(2.6rem, 11.5vmin, 3.5rem)
  aspect-ratio: 1
  padding: 0
  border: 0
  border-radius: 24%
  background: rgba(14, 20, 44, 0.7)
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.18)
  cursor: pointer
  touch-action: manipulation
  transition: transform 90ms ease-out
  &:active
    transform: scale(0.93)
.slot--round
  border-radius: 50%
.slot__n
  color: rgba(255, 255, 255, 0.4)
  font-size: clamp(0.9rem, 3.8vmin, 1.2rem)
.is-sel
  box-shadow: 0 0 0 3px #ffffff, 0 0 0.9rem #ffe9a8
.is-used::after
  content: ''
  position: absolute
  right: -6%
  top: -6%
  width: 32%
  height: 32%
  border-radius: 50%
  border: 2px solid #0f1a30
  background: #3fd060
.loadout__actions
  display: flex
  justify-content: flex-end
  flex-wrap: wrap
  gap: 0.5rem
</style>
