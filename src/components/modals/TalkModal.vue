<template lang="pug">
  FModal(:model-value="true" :title="npc ? t(`npc.${npc.id}.name`) : ''" @update:model-value="closeModal")
    div.talk
      span.talk__face
        Portrait(:look="npc ? npc.look : 'elder'")
      div.talk__bubble
        p(v-for="(line, i) in lines" :key="i") {{ line }}
        p.talk__goal(v-if="goal") {{ goal }}
    template(#footer)
      FButton(:label="t('ui.ok')" type="primary" size="md" @click="closeModal")
</template>

<script setup lang="ts">
/**
 * A townsperson with something to say. A quest giver lays out what is at
 * stake and where it will be decided; once it has been, they speak of what
 * the hero chose.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { QUEST_BY_ID } from '@/game/data/quests'
import { profile } from '@/game/state/profile'
import { closeModal, flow } from '@/game/flow'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import Portrait from '@/components/art/Portrait.vue'

const { t } = useI18n()
const npc = computed(() => flow.npc)
const quest = computed(() => (npc.value?.quest ? QUEST_BY_ID[npc.value.quest] : undefined))

const lines = computed<string[]>(() => {
  const n = npc.value
  if (!n) return []
  const q = quest.value
  if (!q) return [t(`npc.${n.id}.talk`)]
  const done = profile.quests.done[q.id]
  return done ? [t(`quest.${q.id}.${done}.result`)] : [t(`npc.${n.id}.talk`), t(`quest.${q.id}.intro`)]
})
const goal = computed(() => {
  const q = quest.value
  return q && !profile.quests.done[q.id] ? t('talk.goal', { zone: t(`node.${q.node}.name`) }) : ''
})
</script>

<style scoped lang="sass">
.talk
  display: flex
  align-items: flex-start
  gap: clamp(0.5rem, 2.4vmin, 0.9rem)
  color: #fff
.talk__face
  width: clamp(3.2rem, 14vmin, 4.6rem)
.talk__bubble
  position: relative
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
  p + p
    margin-top: 0.5em
.talk__goal
  color: #b04a10
</style>
