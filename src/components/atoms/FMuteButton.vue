<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import FHudButton from '@/components/atoms/FHudButton.vue'
import { gameMuted, toggleGameMute } from '@/use/useGameMute'

/**
 * The speaker button. Desktop mutes by volume (Web Audio gain works there);
 * a phone gets the hard silence toggle, because the OS volume rocker owns the
 * device level — `useGameMute` picks the right one.
 */
const { t } = useI18n()
</script>

<template lang="pug">
  FHudButton(
    tone="slate"
    :icon="gameMuted ? 'sound-off' : 'sound'"
    :aria-label="t('options.mute')"
    :aria-pressed="gameMuted"
    @click="toggleGameMute"
  )
</template>
