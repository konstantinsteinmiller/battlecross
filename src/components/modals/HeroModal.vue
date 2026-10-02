<template lang="pug">
  FModal(
    :model-value="true"
    :tabs="tabs"
    :active-tab="flow.modal"
    @update:active-tab="setTab"
    @update:model-value="closeModal"
  )
    CharacterPanel(v-if="flow.modal === 'character'")
    SkillsPanel(v-else-if="flow.modal === 'skills'")
    InventoryPanel(v-else)
</template>

<script setup lang="ts">
/** The hero's three menus as one tabbed window: sheet, skills, bag. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { closeModal, flow, type Modal } from '@/game/flow'
import FModal from '@/components/molecules/FModal.vue'
import CharacterPanel from './CharacterPanel.vue'
import SkillsPanel from './SkillsPanel.vue'
import InventoryPanel from './InventoryPanel.vue'

const { t } = useI18n()
const tabs = computed(() => [
  { label: t('menu.character'), value: 'character' },
  { label: t('menu.skills'), value: 'skills' },
  { label: t('menu.inventory'), value: 'inventory' }
])
const setTab = (v: string | number): void => { flow.modal = v as Modal }
</script>
