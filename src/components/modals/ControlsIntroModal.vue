<template lang="pug">
  FModal.controls-intro(:model-value="open" :title="t('pause.controls')" @update:model-value="(v) => !v && close()")
    div.body
      ControlsPanel
    template(#footer)
      div.actions
        FButton(type="primary" icon="play" :label="t('continue')" @click="close")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import ControlsPanel from '@/components/hud/ControlsPanel.vue'
import { flow } from '@/game/flow'
import { markTip } from '@/game/state/profile'

/**
 * The controls legend, once, on a touch player's first mission: no phone
 * playtester ever found it in the pause menu. It opens after the beam-in (never
 * over the loader), freezes the game like any modal, and is marked seen when it
 * closes. The pause menu keeps the same panel for later.
 */
const CONTROLS_INTRO_TIP = 'controlsIntro:touch'

const { t } = useI18n()
const open = computed(() => flow.modal === 'controls')
const close = () => {
  markTip(CONTROLS_INTRO_TIP)
  if (flow.modal === 'controls') flow.modal = ''
}
</script>

<style scoped lang="sass">
.body
  color: #fff
  font-family: var(--font-ui)
.actions
  display: flex
  justify-content: center
</style>
