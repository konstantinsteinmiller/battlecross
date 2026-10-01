<template lang="pug">
  //- Shown only while the WebGL context is lost (see `engine/glContext.ts`).
  div.gl-veil(v-if="glLost" role="dialog" aria-modal="true" :aria-label="t('pause.title')")
    button.resume(type="button" @click="recoverFromContextLoss") {{ t('pause.resume') }}
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { glLost, recoverFromContextLoss } from '@/game/engine/glContext'

const { t } = useI18n()
</script>

<style scoped lang="sass">
.gl-veil
  position: fixed
  inset: 0
  z-index: 9000
  display: grid
  place-items: center
  background: rgba(8, 10, 22, 0.86)
  pointer-events: auto
.resume
  min-width: 160px
  padding: 14px 28px
  border-radius: 12px
  border: 2px solid #ffd84a
  background: #1a2044
  color: #ffd84a
  font-size: 20px
  cursor: pointer
</style>
