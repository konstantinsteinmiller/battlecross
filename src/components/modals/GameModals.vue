<template lang="pug">
  HeroBook(v-if="flow.modal === 'character' || flow.modal === 'skills' || flow.modal === 'inventory' || flow.modal === 'journal'")
  TradeScreen(v-else-if="flow.modal === 'shop'")
  TeachScreen(v-else-if="flow.modal === 'trainer'")
  HealerScreen(v-else-if="flow.modal === 'healer'")
  AlchemyScreen(v-else-if="flow.modal === 'alchemy'")
  SmithScreen(v-else-if="flow.modal === 'smithing'")
  SellOreScreen(v-else-if="flow.modal === 'sellOre'")
  MemoryGame(v-else-if="flow.modal === 'memory'")
  ItemBattle(v-else-if="flow.modal === 'itemBattle'")
  CupsGame(v-else-if="flow.modal === 'cups'")
  WhackGame(v-else-if="flow.modal === 'whack'")
  RingTossGame(v-else-if="flow.modal === 'ring'")
  ArmWrestleGame(v-else-if="flow.modal === 'arm'")
  ResultsModal(v-else-if="flow.modal === 'results'")
  SecondWindModal(v-else-if="flow.modal === 'secondWind'")
  ContractBoard(v-else-if="flow.modal === 'contracts'")
  SiegeModal(v-else-if="flow.modal === 'siege'")
  PauseModal(v-else-if="flow.modal === 'pause'" @options="emit('options')")
  HelpModal(v-else-if="flow.modal === 'help'")
  EndingModal(v-else-if="flow.modal === 'ending'")
  UnlockModal(v-else-if="flow.modal === 'unlock'")
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
const AlchemyScreen = defineAsyncComponent(SCREEN_CHUNKS.alchemy)
const SmithScreen = defineAsyncComponent(SCREEN_CHUNKS.smithing)
const SellOreScreen = defineAsyncComponent(SCREEN_CHUNKS.sellOre)
const MemoryGame = defineAsyncComponent(SCREEN_CHUNKS.memory)
const ItemBattle = defineAsyncComponent(SCREEN_CHUNKS.itemBattle)
const CupsGame = defineAsyncComponent(SCREEN_CHUNKS.cups)
const WhackGame = defineAsyncComponent(SCREEN_CHUNKS.whack)
const RingTossGame = defineAsyncComponent(SCREEN_CHUNKS.ring)
const ArmWrestleGame = defineAsyncComponent(SCREEN_CHUNKS.arm)
import ResultsModal from './ResultsModal.vue'
import SecondWindModal from './SecondWindModal.vue'
import ContractBoard from './ContractBoard.vue'
import SiegeModal from './SiegeModal.vue'
import PauseModal from './PauseModal.vue'
import HelpModal from './HelpModal.vue'
import EndingModal from './EndingModal.vue'
import UnlockModal from './UnlockModal.vue'

const emit = defineEmits<{ (e: 'options'): void }>()
</script>
