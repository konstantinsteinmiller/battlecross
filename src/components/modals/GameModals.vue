<template lang="pug">
  HeroModal(v-if="flow.modal === 'character' || flow.modal === 'skills' || flow.modal === 'inventory'")
  ShopModal(v-else-if="flow.modal === 'shop'")
  TrainerModal(v-else-if="flow.modal === 'trainer'")
  HealerModal(v-else-if="flow.modal === 'healer'")
  ResultsModal(v-else-if="flow.modal === 'results'")
  PauseModal(v-else-if="flow.modal === 'pause'" @options="emit('options')")
  HelpModal(v-else-if="flow.modal === 'help'")
  EndingModal(v-else-if="flow.modal === 'ending'")
</template>

<script setup lang="ts">
/** Whichever menu the flow has open. One at a time; each is an `FModal`, so
 *  each holds the pause gate while it is up. (Talking to someone and a quest's
 *  decision are not windows: see `components/dialog/DialogLayer.vue`.) */
import { flow } from '@/game/flow'
import HeroModal from './HeroModal.vue'
import ShopModal from './ShopModal.vue'
import TrainerModal from './TrainerModal.vue'
import HealerModal from './HealerModal.vue'
import ResultsModal from './ResultsModal.vue'
import PauseModal from './PauseModal.vue'
import HelpModal from './HelpModal.vue'
import EndingModal from './EndingModal.vue'

const emit = defineEmits<{ (e: 'options'): void }>()
</script>
