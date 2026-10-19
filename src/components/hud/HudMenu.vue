<template lang="pug">
  div.hud-menu
    FHudButton(v-if="pause" tone="slate" icon="pause" :aria-label="t('ui.pause')" @click="emit('pause')")
    FHudButton(v-else tone="slate" icon="settings" :aria-label="t('options.title')" @click="emit('options')")
    FMuteButton
    FHudButton(v-if="help" tone="slate" icon="help" :aria-label="t('ui.help')" @click="emit('help')")
</template>

<script setup lang="ts">
/** The top-right corner on every screen: pause (or settings), the speaker,
 *  and "?" — which brings the control lessons back. */
import { useI18n } from 'vue-i18n'
import FHudButton from '@/components/atoms/FHudButton.vue'
import FMuteButton from '@/components/atoms/FMuteButton.vue'

withDefaults(defineProps<{ pause?: boolean; help?: boolean }>(), { pause: false, help: false })
const emit = defineEmits<{ (e: 'pause'): void; (e: 'options'): void; (e: 'help'): void }>()
const { t } = useI18n()
</script>

<style scoped lang="sass">
.hud-menu
  display: flex
  flex-direction: row-reverse
  align-items: flex-start
  // The pictures shrink to 30 px; an invisible 3 px halo keeps the tap at 36,
  // and the gap keeps neighbouring halos apart.
  gap: max(6px, calc(clamp(0.3rem, 1.4vmin, 0.55rem) * var(--hud-s, 1)))
  pointer-events: none
  // A step below the play buttons: these are touched rarely.
  :deep(.f-hud-button)
    min-width: 0
    min-height: 0
    width: max(30px, calc(clamp(2.5rem, 9.5vmin, 3.1rem) * var(--hud-s, 1)))
    height: max(30px, calc(clamp(2.5rem, 9.5vmin, 3.1rem) * var(--hud-s, 1)))
    &::after
      content: ''
      position: absolute
      inset: -3px
</style>
