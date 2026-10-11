<template lang="pug">
  FModal(:model-value="true" :title="title" surface="parchment" tone="blue" @update:model-value="closeModal")
    //- The manual save slots, in the pause window itself (Back returns to the menu).
    div.pause-slots(v-if="view !== 'menu'")
      SaveSlotsPanel(:mode="view")
      FButton.pause-slots__back(:label="t('ui.back')" type="secondary" size="md" @click="view = 'menu'")
    //- A landscape phone has room for about four buttons: two columns there —
    //- the save column (save, load, start over) beside the rest.
    div.pause(v-else :class="{ 'is-wide': isMobileLandscape }")
      FButton.pause__resume(:label="t('pause.resume')" type="success" size="lg" icon="play" block @click="closeModal")
      FButton.pause__a(:label="t('options.saves.save')" type="primary" size="md" block data-pause-save @click="view = 'save'")
      FButton.pause__a(:label="t('options.saves.load')" type="primary" size="md" block data-pause-load @click="view = 'load'")
      //- Throws the game being played away (the save slots stay): arms on the
      //- first tap, acts on the second.
      FButton.pause__a(
        :label="newGameArmed ? t('options.saves.confirm') : t('options.saves.newGame')"
        :type="newGameArmed ? 'danger' : 'warning'"
        size="md"
        icon="replay"
        block
        :is-disabled="startingOver"
        data-new-game
        @click="onNewGame"
      )
      p.pause__note(v-if="newGameArmed") {{ t('options.saves.newGameWarn') }}
      FButton.pause__b(:label="t('options.title')" type="secondary" size="md" icon="settings" block @click="options")
      FButton.pause__b(:label="t('pause.controls')" type="secondary" size="md" icon="help" block @click="controls")
      FButton.pause__b(v-if="flow.screen === 'zone'" :label="t('pause.retreat')" type="danger" size="md" icon="map" block @click="retreat")
      p.pause__note(v-if="flow.screen === 'zone'") {{ t('pause.retreatNote') }}
</template>

<script setup lang="ts">
/** The pause menu: resume, the manual save slots (save, load, start over),
 *  options, controls. Retreating from a zone keeps what the run earned so
 *  far — it only gives up the clear. */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { closeModal, flow, retreatVisit } from '@/game/flow'
import { isMobileLandscape } from '@/use/useUser'
import { coach } from '@/game/coach'
import { startNewGame } from '@/game/state/saveSlots'
import { sfx } from '@/game/audio/sfx'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import SaveSlotsPanel from '@/components/organisms/SaveSlotsPanel.vue'

const emit = defineEmits<{ (e: 'options'): void }>()
const { t } = useI18n()

const view = ref<'menu' | 'save' | 'load'>('menu')
const title = computed(() =>
  view.value === 'save' ? t('options.saves.save') : view.value === 'load' ? t('options.saves.load') : t('pause.title'))

const newGameArmed = ref(false)
const startingOver = ref(false)
const onNewGame = async (): Promise<void> => {
  if (startingOver.value) return
  if (!newGameArmed.value) { newGameArmed.value = true; sfx('uiClick'); return }
  startingOver.value = true
  await startNewGame()
}

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
.pause.is-wide
  display: grid
  grid-template-columns: 1fr 1fr
  grid-auto-flow: row dense
  column-gap: 0.75rem
  width: min(100%, 34rem)
  .pause__resume
    grid-column: 1 / -1
  .pause__a
    grid-column: 1
  .pause__b
    grid-column: 2
  .pause__note
    grid-column: 1 / -1
.pause__note
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.7rem, 2.9vmin, 0.86rem)
  text-align: center
.pause-slots
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.5rem
  // The slot list sets its own width (it never follows its content).
  width: 100%
  margin-inline: auto
  padding-bottom: var(--bc-press)
.pause-slots__back
  min-width: 8rem
</style>
