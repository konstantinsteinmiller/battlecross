<template lang="pug">
  div.under(aria-live="polite")
    //- The dark corridor: only a lit radius shows, the braziers widen it.
    div.under__veil(v-if="underHud.dark" :style="{ '--lit': underHud.lit }" aria-hidden="true")
    div.under__goal {{ t(`under.goal.${underHud.phase}`) }}
    button.under__skip(type="button" @click="underActions.skip") {{ t('under.skip') }}
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { underActions, underHud } from '@/game/state/underHud'

/** The Smugglers' Undercroft's overlay (#EXT-1): the dark veil, one line saying what to do, and the Skip button. */
const { t } = useI18n()
</script>

<style scoped lang="scss">
.under {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
/* A hole of light round the hero (the camera keeps him near the middle); the braziers grow it. */
.under__veil {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 56%, transparent calc(8% + var(--lit, 0.25) * 22%), rgba(4, 3, 8, 0.7) calc(18% + var(--lit, 0.25) * 30%), rgba(2, 1, 4, 0.9) 80%);
  transition: background 0.4s;
}
.under__goal {
  position: absolute;
  top: 14%;
  left: 50%;
  transform: translateX(-50%);
  max-width: 80%;
  padding: 8px 18px;
  border-radius: 14px;
  background: rgba(30, 22, 14, 0.82);
  color: #ffe9b8;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.5);
}
.under__skip {
  position: absolute;
  right: 16px;
  bottom: 16px;
  pointer-events: auto;
  padding: 10px 18px;
  border-radius: 12px;
  border: 2px solid #1b1626;
  background: #5ea0ff;
  color: #fff;
  font-weight: 800;
}
</style>
