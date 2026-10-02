<template lang="pug">
  ScreenShell(:art="art" :label="name" @close="closeModal")
    template(#lead)
      //- The other side of the table: who the hero is dealing with.
      div.party(:style="{ '--ring': ring }")
        span.party__face(ref="them")
          Portrait(:look="look" :ring="ring")
          //- A merchant's purse has no bottom.
          span.party__purse(v-if="purse" aria-hidden="true")
            IconCoin.party__coin
            | ∞
        span.party__say
          span.party__name {{ name }}
          Transition(name="say" mode="out-in")
            span.party__line(:key="said || line") {{ said || line }}
    template(#tail)
      //- The hero's side: his purse, and his face where there is room for it.
      span.party__gold(ref="mine")
        GoldPill
      span.party__face.party__face--hero
        Portrait(look="hero")
    slot
</template>

<script setup lang="ts">
/**
 * ─── The trade table's frame (D38) ───────────────────────────────────────────
 *
 * What the merchant, the trainer and the healer share: the full screen over
 * its backdrop, the two parties facing each other across the top bar (their
 * portrait, name and a line of banter on one side; the hero's purse and face
 * on the other), and the money that visibly crosses between them.
 *
 * Opened from a conversation and closing back into it: `closeModal` hands the
 * screen back to the dialogue that opened it (`flow.modal` is the state).
 */
import { onUnmounted, ref } from 'vue'
import { closeModal } from '@/game/flow'
import Portrait from '@/components/art/Portrait.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import GoldPill from '@/components/game/GoldPill.vue'
import ScreenShell from '@/components/game/ScreenShell.vue'
import type { BackdropName } from '@/components/game/backdrops'
import { flyCoins, thunk } from '@/components/game/fx'

withDefaults(defineProps<{
  art: BackdropName
  /** The other party: their look, name and what they have to say. */
  look: string
  name: string
  line: string
  /** The ring round their portrait (a class's colour, a healer's green). */
  ring?: string
  /** Show their bottomless purse (a merchant; not a trainer or a healer). */
  purse?: boolean
}>(), { ring: undefined, purse: false })

const them = ref<HTMLElement | null>(null)
const mine = ref<HTMLElement | null>(null)

/** How many coins a sum is worth showing as. */
const coins = (gold: number): number => Math.max(3, Math.min(9, Math.round(Math.log10(Math.max(10, gold)) * 2.4)))

/** The hero pays: coins fly from his purse across the table. */
const pay = async (gold: number): Promise<void> => {
  await flyCoins(mine.value, them.value, coins(gold))
  thunk(them.value)
}
/** The hero is paid: coins fly into his purse. */
const receive = async (gold: number): Promise<void> => {
  await flyCoins(them.value, mine.value, coins(gold))
  thunk(mine.value)
}

// A remark on the deal just struck replaces the standing line for a moment.
const said = ref('')
let timer = 0
const say = (text: string, ms = 2600): void => {
  said.value = text
  window.clearTimeout(timer)
  timer = window.setTimeout(() => { said.value = '' }, ms)
}
onUnmounted(() => window.clearTimeout(timer))

defineExpose({ pay, receive, say })
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'

.party
  display: flex
  align-items: center
  gap: clamp(0.4rem, 1.8vmin, 0.8rem)
  min-width: 0
.party__face
  position: relative
  flex: 0 0 auto
  width: clamp(2.75rem, 12vmin, 4.2rem)
.party__face--hero
  width: clamp(2.75rem, 10vmin, 3.4rem)
// The merchant's purse hangs off the portrait's lower corner.
.party__purse
  +screen.tag('gold')
  position: absolute
  right: -0.5em
  bottom: -0.35em
  font-size: clamp(0.66rem, 2.7vmin, 0.86rem)
.party__coin
  width: 1em
  height: 1em
.party__say
  display: flex
  flex-direction: column
  align-items: flex-start
  gap: 0.15rem
  min-width: 0
.party__name
  max-width: 100%
  +cel.label
  color: var(--bc-text-gold)
  font-size: clamp(0.8rem, 3.3vmin, 1.1rem)
  line-height: 1.1
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
// What they say: a slip of parchment with a tail toward the speaker.
.party__line
  position: relative
  display: -webkit-box
  -webkit-box-orient: vertical
  -webkit-line-clamp: 2
  max-width: 34rem
  padding: 0.2em 0.6em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: var(--bc-paper-hi)
  color: var(--bc-paper-ink)
  font-size: clamp(0.66rem, 2.7vmin, 0.9rem)
  line-height: 1.25
  text-align: start
  overflow: hidden
.party__gold
  display: inline-flex
  flex: 0 0 auto

.say-enter-active
  transition: transform 220ms var(--bc-ease-pop), opacity 120ms ease-out
.say-leave-active
  transition: opacity 90ms ease-in
.say-enter-from
  opacity: 0
  transform: translateY(0.3rem) scale(0.96)
.say-leave-to
  opacity: 0

// A narrow screen has no room for the hero's face beside his purse.
@media (max-width: 30rem)
  .party__face--hero
    display: none
@media (prefers-reduced-motion: reduce)
  .say-enter-active, .say-leave-active
    transition: none
</style>
