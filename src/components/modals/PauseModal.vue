<template lang="pug">
  FModal(:model-value="open" :title="t('pause.title')" @update:model-value="(v) => !v && resume()")
    div.pause
      div.quest(v-if="flow.quest")
        div.q-name {{ t(`quest.${flow.quest.template}`) }}
        div.q-sector {{ t(`sector.${flow.quest.sector}`) }} · {{ t('enemy.level', { n: flow.quest.level }) }}
        div.q-obj {{ objText }}
      div.controls
        div.c-title {{ t('pause.controls') }}
        ControlsPanel
    template(#footer)
      div.actions
        FButton(type="primary" icon="play" :label="t('pause.resume')" @click="resume")
        FButton(type="secondary" icon="settings" :label="t('options.title')" @click="$emit('options')")
        FButton(type="danger" icon="home" :label="t('pause.abandon')" @click="abandon")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { flow } from '@/game/flow'
import { hud } from '@/game/state/hud'
import { currentMission } from '@/game/boot'
import ControlsPanel from '@/components/hud/ControlsPanel.vue'
import { resolveParams } from '@/game/state/i18nParams'
import { SECTOR_BY_ID } from '@/game/data/regions'

defineEmits<{ options: [] }>()
const { t } = useI18n()
const open = computed(() => flow.modal === 'pause')
/** The objective line, with the sector's boss named ("Defeat {boss}"). */
const objText = computed(() => {
  const params = resolveParams(t, hud.objectiveParams)
  if (flow.quest) params.boss = t(`boss.${SECTOR_BY_ID[flow.quest.sector].boss}`)
  return t(hud.objectiveKey, params)
})
const resume = () => { flow.modal = '' }
const abandon = () => {
  flow.modal = ''
  currentMission()?.retreat()
}
</script>

<style scoped lang="sass">
.pause
  color: #fff
  font-family: var(--font-ui)
  display: flex
  flex-direction: column
  gap: 12px
.quest
  padding: 10px 12px
  border-radius: 10px
  background: rgba(0, 0, 0, 0.25)
.q-name
  font-size: clamp(16px, 3.4vmin, 21px)
.q-sector
  font-size: clamp(11px, 2.4vmin, 14px)
  color: #9fe6ff
.q-obj
  margin-top: 6px
  font-size: clamp(12px, 2.6vmin, 15px)
.c-title
  font-size: clamp(11px, 2.4vmin, 14px)
  color: #ffd84a
  text-transform: uppercase
  letter-spacing: 0.05em
ul
  margin: 4px 0 0
  padding-left: 18px
  font-size: clamp(11px, 2.4vmin, 14px)
  line-height: 1.5
  color: #dfe7ff
.actions
  display: flex
  flex-wrap: wrap
  gap: 10px
  justify-content: center
</style>
