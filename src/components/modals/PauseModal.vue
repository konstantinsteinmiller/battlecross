<template lang="pug">
  FModal(:model-value="true" :title="t('pause.title')" surface="parchment" tone="blue" @update:model-value="closeModal")
    div.pause
      FButton(:label="t('pause.resume')" type="success" size="lg" icon="play" block @click="closeModal")
      FButton(:label="t('options.title')" type="secondary" size="md" icon="settings" block @click="options")
      FButton(:label="t('pause.controls')" type="secondary" size="md" icon="help" block @click="controls")
      FButton(v-if="flow.screen === 'zone'" :label="t('pause.retreat')" type="danger" size="md" icon="map" block @click="retreat")
      p.pause__note(v-if="flow.screen === 'zone'") {{ t('pause.retreatNote') }}
</template>

<script setup lang="ts">
/** The pause menu. Retreating from a zone keeps what the run earned so far —
 *  it only gives up the clear. */
import { useI18n } from 'vue-i18n'
import { closeModal, flow, retreatVisit } from '@/game/flow'
import { coach } from '@/game/coach'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'

const emit = defineEmits<{ (e: 'options'): void }>()
const { t } = useI18n()

const options = (): void => {
  closeModal()
  emit('options')
}
const controls = (): void => {
  coach.recallAll()
  flow.modal = 'help'
}
const retreat = (): void => { void retreatVisit() }
</script>

<style scoped lang="sass">
.pause
  display: flex
  flex-direction: column
  align-items: stretch
  // The gap clears each button's depth plate.
  gap: calc(clamp(0.45rem, 2vmin, 0.7rem) + var(--bc-press))
  width: min(100%, 20rem)
  margin-inline: auto
  padding-bottom: var(--bc-press)
.pause__note
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.7rem, 2.9vmin, 0.86rem)
  text-align: center
</style>
