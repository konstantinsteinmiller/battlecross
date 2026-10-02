<template lang="pug">
  template(v-if="leaderboardEnabled")
    FHudButton(tone="gold" icon="leaderboard" :aria-label="t('leaderboard.title')" @click="open = true")
    LeaderboardModal(v-model="open" :score="lifetimeXp()")
</template>

<script setup lang="ts">
/**
 * The leaderboard as one feature: the button and the board it opens. Renders
 * nothing on a build that has no board at all (no endpoint and no baked one).
 * The score is the hero's LIFETIME XP — the same number every visit's end
 * reports.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { leaderboardEnabled } from '@/use/useLeaderboard'
import { lifetimeXp } from '@/game/state/profile'
import FHudButton from '@/components/atoms/FHudButton.vue'
import LeaderboardModal from '@/components/organisms/LeaderboardModal.vue'

const { t } = useI18n()
const open = ref(false)
</script>
