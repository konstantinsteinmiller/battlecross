<template lang="pug">
  FModal(:model-value="true" :title="t('arenaUnlock.title')" :is-closable="false" surface="parchment" tone="gold")
    div.arena(data-arena-unlock)
      span.arena__icon(aria-hidden="true")
        GameIcon(name="map")
      p.arena__text {{ t('arenaUnlock.body') }}
    template(#footer)
      //- Both ways on stack under the text: no scrolling on a short landscape phone.
      div.arena__ways
        FButton(:label="t('arenaUnlock.go')" type="success" size="md" icon="trophy" attention data-arena-go @click="closeArenaUnlock('arena')")
        FButton(:label="t('arenaUnlock.woods')" type="primary" size="md" icon="forward" data-arena-woods @click="closeArenaUnlock('woods')")
</template>

<script setup lang="ts">
/**
 * "Colosseum unlocked" (roadmap #201): shown once, right after the Goblin
 * King's decision (`flow.afterVisit`), with the world map's icon, one short
 * line and two ways on: the colosseum, or straight into the Whispering Woods
 * (which also counts as Mara's word on the road, so her goal is done).
 */
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { closeArenaUnlock } from '@/game/flow'

const { t } = useI18n()
</script>

<style scoped lang="sass">
.arena
  display: flex
  align-items: center
  gap: 1rem
  color: var(--bc-on)
.arena__icon
  flex: none
  display: grid
  place-items: center
  width: clamp(3.4rem, 14vmin, 5rem)
  height: clamp(3.4rem, 14vmin, 5rem)
  border-radius: 0.9rem
  background: rgba(0, 0, 0, 0.12)
  :deep(svg), :deep(img)
    width: 70%
    height: 70%
.arena__text
  margin: 0
  max-width: 22rem
  font-size: clamp(0.95rem, 4vmin, 1.2rem)
  line-height: 1.3
  font-weight: 700
.arena__ways
  display: flex
  flex-direction: column
  align-items: stretch
  gap: clamp(0.3rem, 1.6vmin, 0.6rem)
  width: min(100%, 22rem)
</style>
