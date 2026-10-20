<template lang="pug">
  FModal(:model-value="true" :title="t('siege.title')" surface="parchment" tone="red" @update:model-value="closeModal")
    div.siege(data-siege-window)
      p.siege__lead(v-if="story") {{ t('siege.story') }}
      p.siege__lead(v-else) {{ t('siege.lead') }}
      p.siege__bell(v-if="bell && !story" data-siege-bell) {{ t('siege.bell') }}
      ul.siege__tiers
        li.card.tier(
          v-for="row in tiers"
          :key="row.tier"
          :data-siege-tier="row.tier"
          :class="{ 'is-locked': !row.open, 'is-picked': pick === row.tier }"
        )
          button.tier__pick(type="button" :disabled="!row.open || (story && row.tier !== 'normal')" @click="choose(row.tier)")
            span.tier__name {{ t(`siege.tier.${row.tier}`) }}
            span.tier__desc {{ row.open ? t(`siege.tierDesc.${row.tier}`) : t(`siege.locked.${row.tier}`) }}
            span.tier__wins(v-if="row.wins") {{ t('siege.wins', { n: row.wins }) }}
      p.siege__marks(v-if="profile.meta.siege.marks") {{ t('siege.marksBank', { n: fmt(profile.meta.siege.marks) }) }}
      //- The quartermaster (§8.6, phase 8): banked Marks buy Demonglass.
      FButton.siege__trade(
        v-if="profile.meta.siege.marks"
        :label="t('relic.marksGlass', { glass: fmt(MARKS_GLASS.glass), marks: fmt(MARKS_GLASS.marks) })"
        type="secondary"
        size="sm"
        data-siege-glass
        :is-disabled="profile.meta.siege.marks < MARKS_GLASS.marks"
        @click="trade"
      )
    template(#footer)
      FButton(:label="t('ui.back')" type="secondary" size="md" icon="back" @click="closeModal")
      FButton(:label="t('siege.start')" type="danger" size="md" icon="sword" attention :is-disabled="!canStart" data-siege-start @click="go")
</template>

<script setup lang="ts">
/**
 * ─── The siege's window (afterplay §8) ──────────────────────────────────────
 *
 * Opened by the fort's commander ("Let's man the walls."): the three tiers,
 * which are open and how often each was won, the Marks banked, and the bell.
 * The story's first siege is fought on Normal and cannot be lost; it says so.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { closeModal, startSiege } from '@/game/flow'
import { buyGlassWithMarks, profile } from '@/game/state/profile'
import { MARKS_GLASS } from '@/game/data/relics'
import { siegeBell, siegeTiers, storySiegeDue } from '@/game/state/siege'
import type { SiegeTier } from '@/game/data/siege'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'

const { t } = useI18n()
const tiers = computed(() => siegeTiers())
const story = computed(() => storySiegeDue())
const bell = computed(() => siegeBell())
/** The tier picked: the hardest open one first. */
const pick = ref<SiegeTier>([...siegeTiers()].reverse().find(r => r.open && !storySiegeDue())?.tier ?? 'normal')
const canStart = computed(() => tiers.value.some(r => r.tier === pick.value && r.open))

const choose = (tier: SiegeTier): void => {
  sfx('uiClick')
  pick.value = tier
}
const trade = (): void => { sfx(buyGlassWithMarks() ? 'coin' : 'denied') }
const go = (): void => {
  if (!canStart.value) { sfx('denied'); return }
  sfx('uiChoice')
  void startSiege(pick.value)
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.siege
  display: flex
  flex-direction: column
  gap: clamp(0.45rem, 1.8vmin, 0.7rem)
  color: var(--bc-on)
  text-align: center
.siege__trade
  align-self: center
.siege__lead, .siege__marks
  margin: 0
  max-width: 26rem
  align-self: center
  font-size: clamp(0.84rem, 3.4vmin, 1.05rem)
  line-height: 1.3
.siege__marks
  color: var(--bc-on-soft)
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
.siege__bell
  margin: 0
  +cel.label
  color: var(--bc-red)
  font-size: clamp(0.9rem, 3.8vmin, 1.2rem)
.siege__tiers
  display: flex
  flex-direction: column
  gap: 0.4rem
  margin: 0
  padding: 0
  list-style: none
.tier__pick
  display: grid
  grid-template-columns: 1fr auto
  gap: 0.15rem 0.6rem
  width: 100%
  min-height: 44px
  padding: 0.5rem 0.7rem
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: 0.6rem
  background: var(--bc-paper)
  color: var(--bc-ink)
  text-align: left
  cursor: pointer
  &:disabled
    cursor: default
    opacity: 0.55
.is-picked .tier__pick
  outline: 3px solid var(--bc-red)
  outline-offset: 1px
.tier__name
  +cel.label
  font-size: clamp(0.9rem, 3.6vmin, 1.15rem)
.tier__wins
  grid-row: 1
  grid-column: 2
  align-self: center
  font-size: clamp(0.7rem, 2.8vmin, 0.85rem)
.tier__desc
  grid-column: 1 / -1
  font-size: clamp(0.72rem, 3vmin, 0.9rem)
  line-height: 1.25
</style>
