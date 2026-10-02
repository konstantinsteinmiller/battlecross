<template lang="pug">
  div.equip(:class="{ 'has-sel': !!sel, 'is-dragging': drag.state.active }")
    //- ── The paper-doll: the hero, and a socket for every slot round him ─────
    section.equip__doll
      div.doll
        HeroDoll.doll__figure(ref="doll")
        //- A phone in portrait has no column for the card: the piece in hand
        //- stands on the hero's plinth in his place.
        EquipCard.doll__card(
          v-if="portrait && sel"
          :id="sel"
          :against="against"
          :worn="!!wornSlot"
          :can-wear="canEquip(sel)"
          :level="levelOf(sel)"
          @equip="doEquip(sel)"
          @unequip="wornSlot && doUnequip(wornSlot)"
          @close="sel = ''"
        )
        button.doll__socket(
          v-for="s in EQUIP_SLOTS"
          :key="s"
          type="button"
          :class="[`doll__socket--${s}`, { 'is-sel': !!sel && worn[s] === sel, 'is-target': targets.has(s), 'is-refuse': drag.state.over === `slot:${s}` && !drag.state.overOk, 'is-over': drag.state.over === `slot:${s}` && drag.state.overOk }]"
          :data-drop="`slot:${s}`"
          :data-slot="s"
          :aria-label="worn[s] ? t('bag.slotHolds', { slot: t(`slot.${slotOf(s)}`), item: t(`item.${worn[s]}.name`) }) : t('bag.slotEmpty', { slot: t(`slot.${slotOf(s)}`) })"
          v-on="worn[s] ? drag.handle({ id: worn[s], from: s }) : {}"
          @click="tapSocket(s)"
        )
          FSocket(
            :shape="slotOf(s) === 'trinket' ? 'round' : 'square'"
            :tint="worn[s] ? tierOf(worn[s]) : undefined"
            :empty="!worn[s]"
            :gem="!!worn[s]"
          )
            span.doll__face(v-if="worn[s]")
              ItemIcon(:id="worn[s]")
            span.doll__ghost(v-else)
              ArtIcon(:glyph="GHOST[slotOf(s)]" tint="var(--bc-stone-hi)" frame="none")
          span.doll__name {{ t(`slot.${slotOf(s)}`) }}
      //- The numbers the gear adds up to. A selection shows what it would
      //- change before anything is put on.
      StatList.equip__stats(:rows="rows" layout="grid")

    //- ── The bag ─────────────────────────────────────────────────────────────
    section.equip__bag.bag(data-drop="bag" :class="{ 'is-target': drag.state.active && drag.state.payload && drag.state.payload.from !== 'bag' }")
      div.bag__tools
        div.bag__filters(role="tablist" :aria-label="t('menu.inventory')")
          button.bag__filter(
            v-for="f in FILTERS"
            :key="f"
            type="button"
            role="tab"
            :aria-selected="filter === f"
            :class="{ 'is-active': filter === f }"
            @click="setFilter(f)"
          ) {{ t(`bag.filter.${f}`) }}
        button.bag__sort(type="button" :aria-label="t('bag.sortBy', { by: t(`bag.sort.${sort}`) })" @click="nextSort")
          GameIcon(name="down")
          span {{ t(`bag.sort.${sort}`) }}
      div.bag__scroll
        p.bag__empty(v-if="items.length === 0") {{ t('bag.empty') }}
        div.bag__grid
          ItemCell.cell(
            v-for="it in items"
            :key="it.id"
            :id="it.id"
            :selected="sel === it.id"
            :worn="!!equippedIn(it.id)"
            :fresh="profile.inv.fresh.includes(it.id)"
            :locked="profile.level < it.level"
            v-on="drag.handle({ id: it.id, from: 'bag' })"
            @click="tapCell(it.id)"
          )

    //- ── The item in hand: its card, the comparison, what can be done ────────
    section.equip__card(v-if="!portrait")
      EquipCard(
        v-if="sel"
        :id="sel"
        :against="against"
        :worn="!!wornSlot"
        :can-wear="canEquip(sel)"
        :level="levelOf(sel)"
        @equip="doEquip(sel)"
        @unequip="wornSlot && doUnequip(wornSlot)"
        @close="sel = ''"
      )
      p.equip__hint(v-else) {{ t('bag.hint') }}

    //- What is being carried across the screen.
    Teleport(to="body")
      div.drag-ghost(v-if="drag.state.active && drag.state.payload" :ref="drag.ghost")
        ItemIcon(:id="drag.state.payload.id")
</template>

<script setup lang="ts">
/**
 * ─── The equipment page (D39) ────────────────────────────────────────────────
 *
 * A paper-doll: the hero in the middle and a socket for every equipment slot
 * round him, fed from the bag beside it.
 *
 *   tap an item          look at it: its card, the comparison with what is
 *                        worn in its slot, and the stats it would change
 *   tap it again, tap    wear it
 *   the lit socket, or
 *   drag it onto one
 *   tap a filled socket  look at what is worn; tap again to take it off
 *   drag it to the bag   take it off
 *
 * Built on `EQUIP_SLOTS`: a socket is placed by its slot id, so the page
 * follows the rules if a slot is ever added or dropped. Every change goes
 * through `equipItem` / `unequip`; the page only asks and shows.
 */
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { EQUIP_SLOTS, ITEM_BY_ID, TIER_COLOR, slotOf, type EquipSlot, type ItemDef, type ItemSlot } from '@/game/data/items'
import { canEquip, computeStats, equipItem, equippedIn, fitsSlot, markSeen, owns, profile, saveProfile, unequip } from '@/game/state/profile'
import { sfx } from '@/game/audio/sfx'
import FSocket from '@/components/atoms/FSocket.vue'
import ArtIcon from '@/components/art/ArtIcon.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import ItemCell from '@/components/game/ItemCell.vue'
import StatList from '@/components/game/StatList.vue'
import { KEY_STATS, slotFor, statRows, statsWith, wornAgainst } from '@/components/game/heroSheet'
import { burst, shake, thunk } from '@/components/game/fx'
import { useDrag } from '@/components/game/useDrag'
import { useMedia } from '@/components/game/useMedia'
import HeroDoll from './HeroDoll.vue'
import EquipCard from './EquipCard.vue'

const { t } = useI18n()

/** What an empty socket shows: the kind of thing that goes there. */
const GHOST: Record<ItemSlot, string> = { main: 'sword', off: 'shield', head: 'helm', body: 'plate', hands: 'gloves', feet: 'boots', trinket: 'ring' }
const ORDER: readonly ItemSlot[] = ['main', 'off', 'head', 'body', 'hands', 'feet', 'trinket']

// ── The bag: filtered and sorted ─────────────────────────────────────────────
const FILTERS = ['all', 'weapons', 'armor', 'trinkets'] as const
type Filter = (typeof FILTERS)[number]
const IN_FILTER: Record<Filter, readonly ItemSlot[] | null> = { all: null, weapons: ['main', 'off'], armor: ['head', 'body', 'hands', 'feet'], trinkets: ['trinket'] }
const SORTS = ['slot', 'tier', 'level'] as const
type Sort = (typeof SORTS)[number]

const filter = ref<Filter>('all')
const sort = ref<Sort>('slot')
const sel = ref('')

const BY: Record<Sort, (a: ItemDef, b: ItemDef) => number> = {
  slot: (a, b) => ORDER.indexOf(a.slot) - ORDER.indexOf(b.slot) || b.tier - a.tier || b.level - a.level,
  tier: (a, b) => b.tier - a.tier || b.level - a.level || ORDER.indexOf(a.slot) - ORDER.indexOf(b.slot),
  level: (a, b) => b.level - a.level || b.tier - a.tier || ORDER.indexOf(a.slot) - ORDER.indexOf(b.slot)
}
const items = computed<ItemDef[]>(() => {
  const only = IN_FILTER[filter.value]
  return profile.inv.items.map(id => ITEM_BY_ID[id]).filter((i): i is ItemDef => !!i && (!only || only.includes(i.slot))).sort(BY[sort.value])
})
const setFilter = (f: Filter): void => { filter.value = f; sfx('uiClick') }
const nextSort = (): void => { sort.value = SORTS[(SORTS.indexOf(sort.value) + 1) % SORTS.length]!; sfx('uiClick') }

// ── What is worn, and what the selection would do ────────────────────────────
const worn = computed(() => profile.inv.equipped)
const tierOf = (id: string): string => TIER_COLOR[ITEM_BY_ID[id]?.tier ?? 1] ?? ''
const levelOf = (id: string): number => ITEM_BY_ID[id]?.level ?? 1
const wornSlot = computed<EquipSlot | null>(() => (sel.value ? equippedIn(sel.value) : null))
const against = computed(() => (sel.value && !wornSlot.value ? wornAgainst(sel.value) : null))

/** The sockets that would take the thing in hand (selected, or being dragged). */
const targets = computed<Set<EquipSlot>>(() => {
  const held = drag.state.active ? drag.state.payload?.id : sel.value && !wornSlot.value ? sel.value : ''
  const out = new Set<EquipSlot>()
  if (!held || !canEquip(held)) return out
  for (const s of EQUIP_SLOTS) if (fitsSlot(held, s) && profile.inv.equipped[s] !== held) out.add(s)
  return out
})

/** A phone shows the six key stats under the doll; a roomy screen all of them. */
const roomy = useMedia('(min-aspect-ratio: 1/1) and (min-height: 34rem)')
const rows = computed(() => {
  const now = computeStats()
  const id = sel.value
  // Worn: what taking it off would cost. In the bag: what wearing it would give.
  const slot = id ? wornSlot.value ?? (canEquip(id) ? slotFor(id) : null) : null
  const next = slot ? statsWith(slot, wornSlot.value ? null : id) : now
  return statRows(now, next, roomy.value ? undefined : KEY_STATS)
})

// ── Doing it ─────────────────────────────────────────────────────────────────
const doll = ref<InstanceType<typeof HeroDoll> | null>(null)
const socketEl = (s: EquipSlot): HTMLElement | null => document.querySelector<HTMLElement>(`.doll__socket[data-slot="${s}"]`)

const select = (id: string): void => {
  sel.value = id
  if (profile.inv.fresh.includes(id)) { markSeen(id); saveProfile() }
}

const doEquip = (id: string, into?: EquipSlot): boolean => {
  const slot = equipItem(id, into)
  if (!slot) {
    sfx('denied')
    if (into) shake(socketEl(into))
    return false
  }
  sfx('uiEquip')
  // On a phone the card steps off the plinth so he can be seen wearing it.
  sel.value = portrait.value ? '' : id
  // The piece lands in its socket with a thunk and a spark, and he nods.
  void nextTick(() => {
    const el = socketEl(slot)
    thunk(el?.querySelector('.f-socket'))
    burst(el, tierOf(id))
    doll.value?.react()
  })
  return true
}

const doUnequip = (s: EquipSlot): void => {
  unequip(s)
  sfx('uiClose')
}

/** A tap in the bag: look at it; tapped again, wear it. */
const tapCell = (id: string): void => {
  if (sel.value === id && !equippedIn(id)) doEquip(id)
  else { select(id); sfx('uiClick') }
}

/** A tap on a socket: wear the thing in hand there, else look at what is in
 *  it, else (looking at it already) take it off. */
const tapSocket = (s: EquipSlot): void => {
  const id = profile.inv.equipped[s]
  if (sel.value && sel.value !== id && owns(sel.value) && fitsSlot(sel.value, s)) {
    doEquip(sel.value, s)
    return
  }
  if (!id) {
    if (sel.value) { sfx('denied'); shake(socketEl(s)) }
    return
  }
  if (sel.value === id) doUnequip(s)
  else { select(id); sfx('uiClick') }
}

// ── Drag and drop ────────────────────────────────────────────────────────────
interface Held { id: string; from: EquipSlot | 'bag' }
const slotOfZone = (zone: string): EquipSlot | null => (zone.startsWith('slot:') ? zone.slice(5) as EquipSlot : null)
const drag = useDrag<Held>({
  accepts: (p, zone) => {
    if (zone === 'bag') return p.from !== 'bag'
    const s = slotOfZone(zone)
    return !!s && s !== p.from && fitsSlot(p.id, s) && canEquip(p.id)
  },
  onDrop: (p, zone) => {
    if (zone === 'bag') { doUnequip(p.from as EquipSlot); return true }
    const s = slotOfZone(zone)
    return !!s && doEquip(p.id, s)
  },
  onStart: (p) => { select(p.id) }
})

/** A phone in portrait: the card takes the hero's place instead of a column. */
const portrait = useMedia('(max-aspect-ratio: 1/1)')
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'

.equip
  --sock: clamp(2.9rem, 13.5vmin, 4.7rem)
  --gap: clamp(0.35rem, 1.6vmin, 0.8rem)
  position: relative
  flex: 1 1 auto
  min-height: 0
  display: grid
  gap: var(--gap)
  // Desktop and landscape: doll, bag, card side by side.
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr) minmax(0, 1fr)
  grid-template-rows: minmax(0, 1fr)
  width: 100%
  max-width: 82rem
  margin-inline: auto

// ── The doll ─────────────────────────────────────────────────────────────────
.equip__doll
  display: flex
  flex-direction: column
  gap: var(--gap)
  min-width: 0
  min-height: 0
  +screen.scroller
.doll
  flex: 0 0 auto
  display: grid
  grid-template-columns: var(--sock) minmax(0, 1fr) var(--sock)
  grid-template-rows: repeat(4, minmax(calc(var(--sock) + 1.05em), auto))
  grid-template-areas: "head fig trinket1" "main fig off" "hands fig body" "feet fig trinket2"
  align-content: center
  gap: clamp(0.15rem, 0.8vmin, 0.5rem) var(--gap)
  min-height: 0
  max-height: 34rem
  padding-inline: clamp(0rem, 1vmin, 0.5rem)
  font-size: clamp(0.56rem, 2.2vmin, 0.74rem)
.doll__figure
  grid-area: fig
.doll__card
  grid-area: fig
  z-index: 2
  align-self: stretch
  min-height: 0
  max-height: 100%
.doll__socket
  +screen.bare-button
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.1em
  width: var(--sock)
  align-self: center
  border-radius: var(--bc-r-md)
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
  &:active
    transition-duration: var(--bc-t-press)
    transform: scale(0.94)
@each $s in main, off, head, body, hands, feet, trinket1, trinket2
  .doll__socket--#{$s}
    grid-area: #{$s}
.doll__face, .doll__ghost
  display: block
.doll__ghost
  padding: 20%
  opacity: 0.55
// The slot's name under its socket, readable on any backdrop.
.doll__name
  max-width: calc(var(--sock) + var(--gap))
  +cel.label
  font-size: 1em
  line-height: 1.05
  text-shadow: var(--bc-text-outline-thin)
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

// The socket of the piece being looked at.
.doll__socket.is-sel :deep(.f-socket)
  filter: drop-shadow(0 0 0.5rem var(--bc-gold-hi))
// "It goes here": the socket breathes while the thing is in hand.
.doll__socket.is-target :deep(.f-socket)
  animation: socket-call 0.9s ease-in-out infinite alternate
.doll__socket.is-over :deep(.f-socket)
  animation: none
  transform: scale(1.14)
  filter: drop-shadow(0 0 0.7rem var(--bc-green-hi))
.doll__socket.is-refuse :deep(.f-socket)
  filter: drop-shadow(0 0 0.5rem var(--bc-red)) grayscale(0.4)
// While something is carried, a socket that will not take it steps back.
.is-dragging .doll__socket:not(.is-target)
  opacity: 0.5

.equip__stats
  flex: 0 0 auto
  padding: clamp(0.3rem, 1.4vmin, 0.6rem)
  +screen.plate('slate', var(--bc-r-md))

// ── The bag ──────────────────────────────────────────────────────────────────
.bag
  display: flex
  flex-direction: column
  min-width: 0
  min-height: 0
  +screen.plate('leather')
  overflow: hidden
  transition: box-shadow 140ms ease-out
  // A worn piece is being carried: the bag will take it.
  &.is-target
    box-shadow: inset 0 0 0 4px var(--bc-green-hi), var(--bc-drop-soft)
.bag__tools
  display: flex
  align-items: center
  gap: 0.3rem
  flex: 0 0 auto
  padding: clamp(0.3rem, 1.3vmin, 0.5rem)
  border-bottom: var(--bc-ol-thin) solid var(--bc-ink)
  background: var(--bc-leather-lo)
.bag__filters
  display: flex
  flex: 1 1 auto
  gap: 0.25rem
  min-width: 0
  overflow-x: auto
  scrollbar-width: none
  &::-webkit-scrollbar
    display: none
.bag__filter, .bag__sort
  +screen.bare-button
  +cel.tone('leather')
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 0.25em
  flex: 0 0 auto
  min-height: 2.75rem
  padding: 0 0.7em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  +cel.fill(46%, 100%)
  +cel.label
  font-size: clamp(0.66rem, 2.7vmin, 0.86rem)
  line-height: 1
  white-space: nowrap
  text-shadow: var(--bc-text-outline-thin)
  &:active
    transform: translateY(2px)
.bag__filter.is-active
  +cel.tone('gold')
.bag__sort
  +cel.tone('stone')
  :deep(svg)
    width: 0.9em
    height: 0.9em
.bag__scroll
  flex: 1 1 auto
  padding: clamp(0.4rem, 1.8vmin, 0.8rem)
  +screen.scroller
  // A finger on the bag scrolls it; a long press picks the thing up.
  touch-action: pan-y
.bag__grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(clamp(2.9rem, 12.5vmin, 4rem), 1fr))
  gap: clamp(0.4rem, 1.8vmin, 0.7rem)
.bag__empty
  margin: 0.6rem 0
  color: var(--bc-stitch)
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
  text-align: center

// ── The card ─────────────────────────────────────────────────────────────────
.equip__card
  position: relative
  display: flex
  flex-direction: column
  gap: var(--gap)
  min-width: 0
  min-height: 0
  align-self: start
  max-height: 100%
  // Room for the buttons' depth plates.
  padding-bottom: 0.4rem
  overflow: visible
.equip__hint
  margin: 0
  padding: clamp(0.6rem, 2.6vmin, 1rem)
  +screen.page(var(--bc-r-md))
  color: var(--bc-paper-ink-soft)
  font-size: clamp(0.76rem, 3.1vmin, 0.95rem)
  line-height: 1.35
  text-align: start

// ── What is carried ──────────────────────────────────────────────────────────
.drag-ghost
  position: fixed
  left: 0
  top: 0
  z-index: var(--bc-z-veil)
  width: clamp(3.2rem, 15vmin, 4.6rem)
  margin: calc(clamp(3.2rem, 15vmin, 4.6rem) * -0.62) 0 0 calc(clamp(3.2rem, 15vmin, 4.6rem) * -0.5)
  pointer-events: none
  filter: drop-shadow(0 0.5rem 0 rgba(var(--bc-ink-rgb), 0.35))
  rotate: -6deg
  will-change: transform

// ── Portrait: the doll above, the bag below; the card on the plinth ──────────
@media (max-aspect-ratio: 1/1)
  .equip
    grid-template-columns: minmax(0, 1fr)
    grid-template-rows: auto minmax(0, 1fr)
    max-width: 44rem
  .equip__doll
    overflow: visible
  .doll
    max-height: none

// ── A short landscape (a phone on its side): everything a size down ──────────
@media (min-aspect-ratio: 1/1) and (max-height: 30rem)
  .equip
    --sock: 2.75rem
  .doll
    gap: 0.1rem var(--gap)

@keyframes socket-call
  from
    transform: scale(1)
    filter: drop-shadow(0 0 0 var(--bc-gold-hi))
  to
    transform: scale(1.08)
    filter: drop-shadow(0 0 0.55rem var(--bc-gold-hi))
@media (prefers-reduced-motion: reduce)
  .doll__socket.is-target :deep(.f-socket)
    animation: none
    filter: drop-shadow(0 0 0.45rem var(--bc-gold-hi))
</style>
