<template lang="pug">
  FModal(:model-value="true" :title="quest ? t(`quest.${quest.id}.title`) : ''" :is-closable="false")
    div.decision(v-if="quest")
      div.decision__scene
        span.decision__face
          Portrait(:look="quest.speaker" ring="#ff8a8a")
        div.decision__bubble
          p(v-if="!chosen") {{ t(`quest.${quest.id}.ask`) }}
          p(v-else) {{ t(`quest.${quest.id}.${chosen}.result`) }}
      //- The choice. Each is final; an option the hero cannot take stays on
      //- the list, with what it would have needed.
      ul.choices(v-if="!chosen")
        li(v-for="c in choices" :key="c.def.id")
          button.choice(
            type="button"
            :class="[`choice--${c.def.tone}`, { 'is-locked': !c.open }]"
            :disabled="!c.open"
            @click="choose(c.def.id)"
          )
            span.choice__label {{ t(`quest.${quest.id}.${c.def.id}.label`) }}
            span.choice__needs(v-if="!c.open")
              GameIcon.choice__lock(name="lock")
              | {{ c.needs }}
            span.choice__gain(v-else-if="c.gain") {{ c.gain }}
      div.outcome(v-else)
        span.outcome__rep(v-for="r in repChanges" :key="r.f" :style="{ '--c': FACTION_COLOR[r.f] }" :class="{ down: r.n < 0 }") {{ t(`faction.${r.f}`) }} {{ r.n > 0 ? '+' : '' }}{{ r.n }}
        span.outcome__gold(v-if="picked && picked.gold")
          IconCoin.outcome__coin
          | +{{ fmt(picked.gold) }}
        span.outcome__item(v-if="picked && picked.item")
          span.outcome__icon
            ItemIcon(:id="picked.item")
          | {{ t(`item.${picked.item}.name`) }}
    template(#footer)
      p.decision__warn(v-if="!chosen") {{ t('quest.final') }}
      FButton(v-else :label="t('ui.continue')" type="success" size="md" attention @click="afterVisit")
</template>

<script setup lang="ts">
/**
 * A major quest's decision (GDD §3.2). Made once, at the end of its zone, and
 * permanent: it rewrites who trades and teaches where, who hunts the hero on
 * the road, and how the story ends. The window cannot be closed without
 * choosing.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FACTIONS, FACTION_COLOR, QUEST_BY_ID, choiceOpen, type ChoiceDef, type FactionId } from '@/game/data/quests'
import type { Attr } from '@/game/data/attributes'
import { decideQuest, flagSet, profile, totalAttrs } from '@/game/state/profile'
import { afterVisit, flow } from '@/game/flow'
import { sfx } from '@/game/audio/sfx'
import { flushSaveNow } from '@/use/useSaveStatus'
import { fmt } from '@/utils/format'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import Portrait from '@/components/art/Portrait.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'

const { t } = useI18n()
const quest = computed(() => QUEST_BY_ID[flow.quest])
const chosen = ref('')
const picked = computed<ChoiceDef | undefined>(() => quest.value?.choices.find(c => c.id === chosen.value))

const needsText = (c: ChoiceDef): string => {
  const out: string[] = []
  const n = c.needs
  if (!n) return ''
  if (n.level) out.push(t('hud.level', { n: n.level }))
  for (const k in n.attrs) out.push(`${t(`attr.${k as Attr}.short`)} ${n.attrs[k as Attr]}`)
  for (const k in n.rep) out.push(t('quest.needsRep', { faction: t(`faction.${k as FactionId}`), n: n.rep[k as FactionId] ?? 0 }))
  return out.join(' · ')
}

const choices = computed(() => {
  const q = quest.value
  if (!q) return []
  const hero = { level: profile.level, attrs: totalAttrs(), flags: flagSet(), rep: profile.quests.rep }
  return q.choices.map(def => ({
    def,
    open: choiceOpen(def, hero),
    needs: needsText(def),
    gain: def.gold ? t('quest.gold', { n: fmt(def.gold) }) : ''
  }))
})

const repChanges = computed(() => {
  const r = picked.value?.rep
  return r ? FACTIONS.filter(f => r[f]).map(f => ({ f, n: r[f] ?? 0 })) : []
})

const choose = (id: string): void => {
  if (!quest.value || !decideQuest(quest.value.id, id)) { sfx('denied'); return }
  sfx('uiChoice')
  chosen.value = id
  void flushSaveNow()
}
</script>

<style scoped lang="sass">
.decision
  display: flex
  flex-direction: column
  gap: clamp(0.6rem, 2.6vmin, 1rem)
  color: #fff
.decision__scene
  display: flex
  align-items: flex-start
  gap: clamp(0.5rem, 2.4vmin, 0.9rem)
.decision__face
  width: clamp(3.4rem, 15vmin, 5rem)
.decision__bubble
  flex: 1 1 auto
  min-width: 0
  padding: clamp(0.5rem, 2.4vmin, 0.8rem) clamp(0.6rem, 2.8vmin, 1rem)
  border-radius: 0.9rem
  border: 2px solid #0f1a30
  background: #f4f7ff
  color: #1b1626
  font-size: clamp(0.8rem, 3.3vmin, 1rem)
  line-height: 1.35
  p
    margin: 0
.choices
  margin: 0
  padding: 0
  list-style: none
  display: flex
  flex-direction: column
  gap: clamp(0.35rem, 1.6vmin, 0.55rem)
.choice
  width: 100%
  display: flex
  flex-direction: column
  gap: 0.15rem
  padding: clamp(0.5rem, 2.2vmin, 0.75rem) clamp(0.7rem, 3vmin, 1rem)
  border-radius: 0.8rem
  border: 2px solid #0f1a30
  box-shadow: 0 4px 0 #0f1a30, inset 0 2px 0 rgba(255, 255, 255, 0.3)
  background: linear-gradient(180deg, #5fb0ff, #2f6fe0)
  color: #fff
  text-align: left
  cursor: pointer
  touch-action: manipulation
  min-height: 2.75rem
  &:active:not(:disabled)
    transform: translateY(3px)
    box-shadow: 0 1px 0 #0f1a30
.choice--noble
  background: linear-gradient(180deg, #ffd84a, #e89a1a)
  color: #2a1a05
.choice--ruthless
  background: linear-gradient(180deg, #ff7a7a, #c8283a)
.choice--cunning
  background: linear-gradient(180deg, #b48cff, #6a3ad8)
.choice.is-locked
  filter: grayscale(0.8) brightness(0.75)
  cursor: default
.choice__label
  font-size: clamp(0.84rem, 3.5vmin, 1.05rem)
  line-height: 1.2
.choice__needs, .choice__gain
  display: inline-flex
  align-items: center
  gap: 0.3em
  font-size: clamp(0.68rem, 2.8vmin, 0.86rem)
  opacity: 0.92
.choice__lock
  width: 1em
  height: 1em
.outcome
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: 0.4rem
.outcome__rep, .outcome__gold, .outcome__item
  display: inline-flex
  align-items: center
  gap: 0.3em
  padding: 0.25em 0.7em
  border-radius: 999px
  border: 2px solid #0f1a30
  background: #1c2440
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
.outcome__rep
  color: var(--c)
  &.down
    color: #ff8a8a
.outcome__gold
  color: #ffe066
.outcome__coin
  width: 1.1em
  height: 1.1em
.outcome__icon
  width: 1.8em
.decision__warn
  margin: 0
  color: #ffb0b0
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
  text-align: center
</style>
