<template lang="pug">
  TradeFrame(
    ref="frame"
    art="trade"
    :look="npc ? npc.look : 'healer'"
    :name="npc ? t(`npc.${npc.id}.name`) : ''"
    :line="t('healer.talk')"
    ring="var(--bc-green)"
  )
    div.heal
      //- ── The belt: a flask for every slot, one more for sale ───────────────
      section.heal__stall.heal__belt
        h3.trade__cap {{ t('healer.belt') }}
        div.heal__body
          div.flasks(role="img" :aria-label="t('hud.potion', { n: profile.inv.potions })")
            span.flask(
              v-for="n in POTION_MAX"
              :key="n"
              :data-flask="`hp${n}`"
              :class="{ 'is-on': n <= profile.inv.potions, 'is-next': n === profile.inv.potions + 1 }"
            )
              FSocket(shape="round" tint="var(--bc-red)" cork :empty="n > profile.inv.potions")
                span.flask__fill.flask__fill--hp(v-if="n <= profile.inv.potions")
                  img.flask__mark(v-if="ICON_ART.get('mark-potion-health')" :src="ICON_ART.get('mark-potion-health')" alt="" aria-hidden="true" draggable="false")
                  svg.flask__mark(v-else :viewBox="MARKS['potion-health'].viewBox" aria-hidden="true" focusable="false")
                    path(:d="MARKS['potion-health'].d")
                span.flask__ghost(v-else)
                  GameIcon(:name="n === profile.inv.potions + 1 ? 'plus' : 'lock'")
          p.heal__note {{ t('healer.note', { n: profile.inv.potions }) }}
          div.heal__actions
            template(v-if="profile.inv.potions < POTION_MAX")
              FButton.heal__buy-slot(:label="t('healer.buy', { n: fmt(potionUpgradeCost()) })" type="success" size="md" icon="flask" :is-disabled="profile.gold < potionUpgradeCost()" @click="buySlot")
            p.heal__full(v-else) {{ t('healer.full') }}

      //- ── Mana potions: a stock as big as the belt, kept between visits ─────
      section.heal__stall.heal__mana
        h3.trade__cap {{ t('healer.mana.title') }}
        div.heal__body
          div.flasks(role="img" :aria-label="t('hud.manaPotion', { n: profile.inv.manaPotions })")
            span.flask(
              v-for="n in profile.inv.potions"
              :key="n"
              :data-flask="`mp${n}`"
              :class="{ 'is-on': n <= profile.inv.manaPotions }"
            )
              FSocket(shape="round" metal="steel" tint="var(--bc-blue)" cork :empty="n > profile.inv.manaPotions")
                span.flask__fill.flask__fill--mp(v-if="n <= profile.inv.manaPotions")
                  img.flask__mark(v-if="ICON_ART.get('mark-potion-mana')" :src="ICON_ART.get('mark-potion-mana')" alt="" aria-hidden="true" draggable="false")
                  svg.flask__mark(v-else :viewBox="MARKS['potion-mana'].viewBox" aria-hidden="true" focusable="false")
                    path(:d="MARKS['potion-mana'].d")
          p.heal__note {{ t('healer.mana.note', { n: profile.inv.manaPotions, max: profile.inv.potions }) }}
          div.heal__actions
            template(v-if="manaPotionRoom() > 0")
              FButton.heal__buy-mana(:label="t('healer.mana.buy', { n: fmt(manaPotionCost()) })" type="primary" size="md" :is-disabled="profile.gold < manaPotionCost()" @click="buyMana")
            p.heal__full(v-else) {{ t('healer.mana.full') }}
      DealStamp(:n="stamps" :text="t('shop.deal')" :tone="stampTone")
</template>

<script setup lang="ts">
/**
 * ─── The healer (GDD §6, D47) ────────────────────────────────────────────────
 *
 * Every visit to a zone starts at full health with a full belt, so a healer
 * sells two things: a bigger belt (a fourth and a fifth health flask) and
 * mana potions, a stock that is kept between visits and holds as many as the
 * belt has slots. Both are `profile.ts`'s rules; this is the stall they are
 * sold from, on the same table as the merchants'.
 */
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { POTION_MAX, buyManaPotion, buyPotionSlot, manaPotionCost, manaPotionRoom, potionUpgradeCost, profile } from '@/game/state/profile'
import { flow } from '@/game/flow'
import { sfx } from '@/game/audio/sfx'
import { fmt } from '@/utils/format'
import FButton from '@/components/atoms/FButton.vue'
import FSocket from '@/components/atoms/FSocket.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { ICON_ART } from '@/game/assets/overrides'
import { MARKS } from '@/components/icons/marks'
import DealStamp from '@/components/game/DealStamp.vue'
import { burst, shake, thunk } from '@/components/game/fx'
import TradeFrame from './TradeFrame.vue'

const { t } = useI18n()
const npc = computed(() => flow.npc)
const frame = ref<InstanceType<typeof TradeFrame> | null>(null)
const stamps = ref(0)
const stampTone = ref<'green' | 'blue'>('green')

/** The new flask pops into its socket. */
const landed = (key: string, tint: string): void => {
  void nextTick(() => {
    const el = document.querySelector<HTMLElement>(`.flask[data-flask="${key}"]`)
    thunk(el?.querySelector('.f-socket'))
    burst(el, tint, true)
  })
}

const buySlot = (): void => {
  const cost = potionUpgradeCost()
  if (!buyPotionSlot()) { sfx('denied'); shake(document.querySelector('.heal__buy-slot')); return }
  sfx('potion')
  sfx('coin')
  void frame.value?.pay(cost)
  stampTone.value = 'green'
  stamps.value++
  landed(`hp${profile.inv.potions}`, 'var(--bc-red)')
}

const buyMana = (): void => {
  const cost = manaPotionCost()
  if (!buyManaPotion()) { sfx('denied'); shake(document.querySelector('.heal__buy-mana')); return }
  sfx('potion')
  sfx('coin')
  void frame.value?.pay(cost)
  stampTone.value = 'blue'
  stamps.value++
  landed(`mp${profile.inv.manaPotions}`, 'var(--bc-blue)')
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'
@use './trade'

.heal
  --gap: clamp(0.35rem, 1.6vmin, 0.8rem)
  position: relative
  flex: 1 1 auto
  min-height: 0
  display: grid
  grid-template-columns: repeat(2, minmax(0, 1fr))
  align-content: center
  gap: var(--gap)
  width: 100%
  max-width: 62rem
  margin-inline: auto
  overflow-y: auto
.heal__stall
  display: flex
  flex-direction: column
  min-width: 0
  overflow: hidden
.heal__belt
  +screen.plate('leather')
.heal__mana
  +screen.plate('slate')
.heal__body
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.5rem, 2.2vmin, 0.9rem)
  padding: clamp(0.6rem, 2.6vmin, 1.1rem)
.flasks
  display: flex
  justify-content: center
  flex-wrap: wrap
  gap: clamp(0.35rem, 1.6vmin, 0.7rem)
  // Room for the corks over the sockets.
  padding-top: 0.5rem
.flask
  display: block
  width: clamp(2.75rem, 11vmin, 4rem)
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
.flask.is-next
  animation: flask-call 0.9s ease-in-out infinite alternate
.flask__fill
  display: block
  background: linear-gradient(180deg, var(--c-hi) 0, var(--c-hi) 30%, var(--c) 30%, var(--c) 82%, var(--c-lo) 82%)
.flask__fill--hp
  +cel.tone('red')
.flask__fill--mp
  +cel.tone('blue')
.flask__mark
  position: absolute
  inset: 24%
  width: 52%
  height: 52%
  fill: rgba(var(--bc-white-rgb), 0.85)
.flask__ghost
  display: block
  padding: 30%
  color: var(--bc-slate-hi)
  :deep(svg)
    display: block
    width: 100%
    height: 100%
.heal__note
  margin: 0
  color: var(--bc-text-soft)
  font-size: clamp(0.72rem, 3vmin, 0.92rem)
  line-height: 1.3
  text-align: center
.heal__full
  margin: 0
  +cel.label
  color: var(--bc-text-good)
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
  text-shadow: var(--bc-text-outline-thin)
.heal__actions
  justify-content: center

@media (max-aspect-ratio: 1/1)
  .heal
    grid-template-columns: minmax(0, 1fr)
    max-width: 34rem
    align-content: start

@keyframes flask-call
  from
    transform: scale(1)
  to
    transform: scale(1.08)
@media (prefers-reduced-motion: reduce)
  .flask.is-next
    animation: none
</style>
