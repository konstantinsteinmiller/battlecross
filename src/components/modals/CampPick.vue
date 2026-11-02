<template lang="pug">
  FModal(:model-value="true" :title="t('camp.pick.title')" :is-closable="true" surface="parchment" tone="gold" @update:model-value="close")
    div.pick
      p.pick__lead {{ t('camp.pick.lead') }}
      div.pick__stage
        //- The hero casts the skill in hand (a pose, no effect): tap a card to see how it moves.
        div.pick__hero(aria-hidden="true")
          HeroTurntable(ref="turn" @fail="live = false" v-if="live")
        ul.pick__cards
          li(v-for="o in options" :key="o.skill.id")
            button.pick__card(
              type="button"
              :class="{ 'is-sel': sel === o.skill.id, 'is-yours': !o.can }"
              :style="{ '--tint': o.color }"
              :data-pick="o.cls"
              :aria-pressed="sel === o.skill.id"
              @click="choose(o.skill.id, o.can)"
            )
              span.pick__icon
                SkillIcon(:id="o.skill.id")
              span.pick__text
                span.pick__class {{ t(`class.${o.cls}.name`) }}
                span.pick__name {{ t(`skill.${o.skill.id}.name`) }}
                span.pick__style {{ t(`camp.pick.style.${o.cls}`) }}
              span.pick__mark(v-if="!o.can" aria-hidden="true")
                GameIcon(name="check")
      //- The skill in hand, as the teachers' own card shows it.
      div.pick__card-in-hand(v-if="seen")
        SkillCard(:id="seen")
      div.pick__actions
        FButton(:label="t('camp.pick.learn')" type="success" :is-disabled="!sel" @click="learn")
</template>

<script setup lang="ts">
/**
 * ─── The first build choice (#181, D1) ───────────────────────────────────────
 *
 * The camp's free lesson is the player's first look at how different the
 * classes are: the three rescued teachers each offer the first skill of their
 * school, one card each (icon, class, a one-line style), and the player takes
 * one for nothing. Tapping a card shows its description and has the hero cast
 * it in a small view (D2: a pose, not an effect). Three choices and no more;
 * the rest of the schools are for later.
 *
 * Opened by talking to any of the camp's teachers while their free lesson is
 * still to be taken; the usual trainer window follows once it is.
 */
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { flow } from '@/game/flow'
import { CLASSES, skillsOf, type ClassId, type SkillDef } from '@/game/data/skills'
import { CAMP_TEACHERS } from '@/game/sim/camp'
import { learnBlock, learnSkill, lesson } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import SkillIcon from '@/components/art/SkillIcon.vue'
import SkillCard from '@/components/game/SkillCard.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import HeroTurntable from '@/components/screens/hero/HeroTurntable.vue'

const { t } = useI18n()
const live = ref(true)
const turn = ref<InstanceType<typeof HeroTurntable> | null>(null)
const sel = ref('')

/** One card per rescued teacher, always three schools: the first skill of theirs this hero can take now; a school he cannot
 *  take anything from (he already knows its first skill) still shows it, marked, so the three styles are all seen. */
const options = computed<Array<{ cls: ClassId; skill: SkillDef; color: string; can: boolean }>>(() => {
  const out: Array<{ cls: ClassId; skill: SkillDef; color: string; can: boolean }> = []
  for (const tch of CAMP_TEACHERS) {
    const list = skillsOf(tch.cls)
    const open = list.find(q => { const b = learnBlock(q.id); return b === '' || b === 'gold' })
    const s = open ?? list[0]
    if (s) out.push({ cls: tch.cls, skill: s, color: CLASSES[tch.cls].color, can: !!open })
  }
  return out
})

const choose = (id: string, can: boolean): void => {
  sfx('uiClick')
  turn.value?.cast(id)
  // A skill he already has is only looked at (and cast); the pick is among the ones he can take.
  sel.value = can ? id : ''
  seen.value = id
}
const seen = ref('')
const close = (): void => { flow.modal = '' }
const learn = (): void => {
  if (!sel.value) return
  // The first lesson of the camp is on the teachers (`profile.ts`'s camp gift).
  lesson.camp = true
  const ok = learnSkill(sel.value)
  lesson.camp = false
  if (ok) { sfx('uiBuy'); flow.modal = '' } else sfx('denied')
}
onUnmounted(() => { lesson.camp = false })
</script>

<style scoped lang="sass">
.pick
  display: flex
  flex-direction: column
  gap: 0.6rem
  max-width: 34rem
.pick__lead
  margin: 0
  text-align: center
  color: var(--bc-on-accent)
  font-size: clamp(0.85rem, 3.4vmin, 1.05rem)
.pick__stage
  display: grid
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr)
  gap: 0.6rem
  align-items: stretch
.pick__hero
  min-height: 9rem
  border-radius: var(--bc-r-md)
  background: radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.5), rgba(0, 0, 0, 0.08))
  overflow: hidden
  :deep(.turntable)
    width: 100%
    height: 100%
.pick__cards
  list-style: none
  margin: 0
  padding: 0
  display: flex
  flex-direction: column
  gap: 0.4rem
.pick__card
  display: flex
  align-items: center
  gap: 0.6rem
  width: 100%
  padding: 0.4rem 0.6rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  background: rgba(255, 255, 255, 0.55)
  text-align: left
  cursor: pointer
  &.is-sel
    background: color-mix(in srgb, var(--tint) 30%, white)
    box-shadow: 0 0 0 0.18rem var(--tint)
.pick__icon
  flex: 0 0 auto
  width: 2.6rem
  height: 2.6rem
.pick__text
  display: flex
  flex-direction: column
  min-width: 0
.pick__class
  font-size: 0.72rem
  text-transform: uppercase
  letter-spacing: 0.04em
  color: color-mix(in srgb, var(--tint) 62%, black)
.pick__name
  font-weight: 700
.pick__mark
  margin-left: auto
  width: 1.3rem
  height: 1.3rem
  color: var(--bc-green)
.pick__card.is-yours
  opacity: 0.8
.pick__style
  font-size: 0.82rem
  color: var(--bc-text-dim, #5a4a38)
.pick__card-in-hand
  max-height: 11rem
  overflow: auto
.pick__actions
  display: flex
  justify-content: center
</style>
