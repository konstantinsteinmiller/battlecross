<template lang="pug">
  FModal(:model-value="true" surface="wood" :title="flow.npc ? t(`npc.${flow.npc.id}.name`) : ''" @update:model-value="closeModal")
    div.healer
      div.healer__who
        span.healer__face
          Portrait(:look="flow.npc ? flow.npc.look : 'healer'" ring="#7dff8a")
        p.healer__line {{ t('healer.talk') }}
        GoldPill
      div.healer__belt(role="img" :aria-label="t('hud.potion', { n: profile.inv.potions })")
        span.healer__flask(v-for="n in POTION_MAX" :key="n" :class="{ on: n <= profile.inv.potions }")
          ArtIcon(glyph="potion" tint="#ff5a6a" frame="round" :dim="n > profile.inv.potions")
      p.healer__note {{ t('healer.note', { n: profile.inv.potions }) }}
    template(#footer)
      FButton(
        v-if="profile.inv.potions < POTION_MAX"
        :label="t('healer.buy', { n: fmt(potionUpgradeCost()) })"
        type="success"
        size="md"
        icon="flask"
        :is-disabled="profile.gold < potionUpgradeCost()"
        @click="buy"
      )
      p.healer__full(v-else) {{ t('healer.full') }}
</template>

<script setup lang="ts">
/** The healer: every visit to a zone starts at full health with a full belt,
 *  so what a healer SELLS is a bigger belt — a fourth and a fifth potion. */
import { useI18n } from 'vue-i18n'
import { POTION_MAX, buyPotionSlot, potionUpgradeCost, profile } from '@/game/state/profile'
import { closeModal, flow } from '@/game/flow'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import Portrait from '@/components/art/Portrait.vue'
import ArtIcon from '@/components/art/ArtIcon.vue'
import GoldPill from '@/components/game/GoldPill.vue'

const { t } = useI18n()
const buy = (): void => { sfx(buyPotionSlot() ? 'potion' : 'denied') }
</script>

<style scoped lang="sass">
.healer
  display: flex
  flex-direction: column
  gap: clamp(0.5rem, 2.2vmin, 0.9rem)
  color: #fff
.healer__who
  display: flex
  align-items: center
  gap: 0.6rem
.healer__face
  width: clamp(2.8rem, 12vmin, 3.8rem)
.healer__line
  flex: 1 1 auto
  margin: 0
  color: #dfe6ff
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
  line-height: 1.3
.healer__belt
  display: flex
  justify-content: center
  gap: clamp(0.3rem, 1.6vmin, 0.6rem)
.healer__flask
  width: clamp(2.3rem, 10.5vmin, 3.2rem)
  opacity: 0.5
  &.on
    opacity: 1
.healer__note, .healer__full
  margin: 0
  color: #b9c4ee
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
  text-align: center
</style>
