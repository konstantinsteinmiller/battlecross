<template lang="pug">
  div.missions.sheet
    div.sectors
      button.sector(
        v-for="s in SECTORS"
        :key="s.id"
        type="button"
        :class="{ on: sel === s.id, locked: !unlocked(s.id), cleared: cleared(s.id) }"
        :style="{ '--c1': THEMES[s.id].wall, '--c2': THEMES[s.id].accent }"
        @click="select(s.id)"
      )
        span.s-orb
          GameIcon(v-if="!unlocked(s.id)" name="lock")
          GameIcon(v-else-if="cleared(s.id)" name="check")
        span.s-name {{ t(`sector.${s.id}`) }}
        span.s-lvl {{ t('hub.levels', { a: s.levels[0], b: s.levels[1] }) }}
    div.scroll
      div.section-title {{ t('hub.story') }}
      QuestCard(v-if="story" :quest="story" story @deploy="deploy(story)")
      div.note(v-else-if="!unlocked(sel)") {{ t('hub.lockedHint', { boss: t(`boss.${prevBoss(sel)}`) }) }}
      div.note.ok(v-else) {{ t('hub.sectorSecured') }}
      div.section-title
        span {{ t('hub.jobs') }}
        span.hint {{ t('hub.jobsHint') }}
      QuestCard(v-for="j in profile.quests.jobs" :key="j.id" :quest="j" @deploy="deploy(j)" @reroll="reroll(j.id)")
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import QuestCard from './QuestCard.vue'
import { SECTORS, SECTOR_BY_ID } from '@/game/data/regions'
import { THEMES, type SectorId } from '@/game/world/themes'
import { profile, saveProfile } from '@/game/state/profile'
import { storyFor, startMission, rerollJob } from '@/game/flow'
import type { Quest } from '@/game/data/quests'
import { sfx } from '@/game/audio/sfx'

/** Sector strip (the valley map), the sector's story mission, and the job board. */
const { t } = useI18n()
const unlocked = (id: SectorId) => profile.world.unlocked.includes(id)
const cleared = (id: SectorId) => profile.world.bosses.includes(SECTOR_BY_ID[id].boss)
const firstOpenStory = SECTORS.find(s => unlocked(s.id) && !cleared(s.id))?.id ?? profile.world.selected
const sel = ref<SectorId>(firstOpenStory)
const story = computed(() => storyFor(sel.value))
const prevBoss = (id: SectorId) => {
  const s = SECTOR_BY_ID[id]
  return s.after ? SECTOR_BY_ID[s.after].boss : ''
}
const select = (id: SectorId) => {
  sel.value = id
  profile.world.selected = id
  sfx('uiClick')
}
const deploy = (q: Quest) => {
  sfx('uiOpen')
  saveProfile()
  startMission(q)
}
const reroll = (id: string) => {
  sfx('uiClick')
  rerollJob(id)
}
</script>

<style scoped lang="sass">
@use './sheet'
.sectors
  display: flex
  gap: 8px
  overflow-x: auto
  padding: 4px 2px 10px
  scrollbar-width: none
  &::-webkit-scrollbar
    display: none
.sector
  flex: 0 0 auto
  display: flex
  flex-direction: column
  align-items: center
  gap: 3px
  width: clamp(76px, 17vmin, 100px)
  padding: 8px 4px
  border-radius: 14px
  border: 3px solid #141a33
  background: linear-gradient(var(--c1), color-mix(in srgb, var(--c1) 55%, #0b1433))
  color: #fff
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35)
  &.on
    outline: 3px solid #ffd84a
    transform: translateY(-2px)
  &.locked
    filter: grayscale(0.85) brightness(0.6)
.s-orb
  width: clamp(26px, 6vmin, 34px)
  height: clamp(26px, 6vmin, 34px)
  border-radius: 50%
  border: 2px solid #141a33
  background: radial-gradient(circle at 40% 30%, #fff, var(--c2) 60%)
  color: #141a33
  padding: 5px
.cleared .s-orb
  background: radial-gradient(circle at 40% 30%, #fff, #8dff7a 60%)
.s-name
  font-size: clamp(10px, 2.3vmin, 13px)
  text-align: center
  line-height: 1.1
  text-shadow: 0 2px 0 #141a33
.s-lvl
  font-family: var(--font-pixel)
  font-size: 7px
  color: #dfe7ff
.note
  padding: 12px
  border-radius: 12px
  background: rgba(0, 0, 0, 0.25)
  color: #cfe0ff
  font-size: clamp(12px, 2.6vmin, 15px)
  text-align: center
  &.ok
    color: #8dff7a
.hint
  font-family: var(--font-ui)
  font-size: 0.8em
  color: #9fb8e6
  text-transform: none
  letter-spacing: 0
</style>
