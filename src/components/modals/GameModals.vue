<template lang="pug">
  HeroBook(v-if="flow.modal === 'character' || flow.modal === 'skills' || flow.modal === 'inventory'")
  TradeScreen(v-else-if="flow.modal === 'shop'")
  TeachScreen(v-else-if="flow.modal === 'trainer'")
  HealerScreen(v-else-if="flow.modal === 'healer'")
  ResultsModal(v-else-if="flow.modal === 'results'")
  PauseModal(v-else-if="flow.modal === 'pause'" @options="emit('options')")
  HelpModal(v-else-if="flow.modal === 'help'")
  EndingModal(v-else-if="flow.modal === 'ending'")
</template>

<script setup lang="ts">
/** Whichever menu the flow has open. One at a time; each holds the pause gate
 *  while it is up (an `FModal`, or a full screen's `ScreenShell`). The hero's
 *  book and the trade table are full screens (`components/screens`); talking
 *  to someone and a quest's decision are not windows at all (see
 *  `components/dialog/DialogLayer.vue`). */
import { defineAsyncComponent } from 'vue'
import { flow } from '@/game/flow'
import { SCREEN_CHUNKS } from '@/components/screens/chunks'
// The full screens are chunks of their own, off the boot path (the scene
// fetches them once the first frame is up, see `screens/chunks.ts`).
const HeroBook = defineAsyncComponent(SCREEN_CHUNKS.heroBook)
const TradeScreen = defineAsyncComponent(SCREEN_CHUNKS.trade)
const TeachScreen = defineAsyncComponent(SCREEN_CHUNKS.teach)
const HealerScreen = defineAsyncComponent(SCREEN_CHUNKS.healer)
import ResultsModal from './ResultsModal.vue'
import PauseModal from './PauseModal.vue'
import HelpModal from './HelpModal.vue'
import EndingModal from './EndingModal.vue'

const emit = defineEmits<{ (e: 'options'): void }>()
</script>
