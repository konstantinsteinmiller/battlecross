<template lang="pug">
  //- Shown only while the WebGL context is lost (see `engine/glContext.ts`).
  div.gl-veil(v-if="glLost" role="dialog" aria-modal="true" :aria-label="t('pause.title')")
    FButton(:label="t('pause.resume')" type="success" size="lg" icon="play" @click="recoverFromContextLoss")
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { glLost, recoverFromContextLoss } from '@/game/engine/glContext'
import FButton from '@/components/atoms/FButton.vue'

const { t } = useI18n()
</script>

<style scoped lang="sass">
.gl-veil
  position: fixed
  inset: 0
  z-index: 9000
  display: grid
  place-items: center
  background: var(--bc-backdrop)
  font-family: var(--font-ui)
  pointer-events: auto
</style>
