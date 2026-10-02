<template lang="pug">
  TradeFrame(
    ref="frame"
    art="trade"
    :look="npc ? npc.look : 'peddler'"
    :name="npc ? t(`npc.${npc.id}.name`) : ''"
    :line="npc ? t(`npc.${npc.id}.talk`) : ''"
    purse
  )
    div.trade(:class="{ 'has-sel': !!sel, 'is-dragging': drag.state.active, 'from-bag': !!sel && sel.from === 'bag' }")
      //- ── The merchant's shelf ──────────────────────────────────────────────
      section.trade__side.trade__shelf(data-drop="goods" :class="dropClass('goods')")
        h3.trade__cap {{ t('shop.goods') }}
        div.trade__scroll
          p.trade__empty(v-if="stock.length === 0") {{ t('shop.empty') }}
          div.trade__grid
            ItemCell.ware(
              v-for="it in stock"
              :key="it.id"
              :id="it.id"
              :class="{ 'is-owned': owns(it.id) }"
              :selected="isSel('goods', it.id)"
              :dim="owns(it.id)"
              :locked="!owns(it.id) && profile.level < it.level"
              v-on="owns(it.id) ? {} : drag.handle({ id: it.id, from: 'goods' })"
              @click="pick('goods', it.id)"
            )
              template(#tag)
                span.trade__owned(v-if="owns(it.id)") {{ t('shop.owned') }}
                PriceTag(v-else :n="buyCost(it.id)" :bad="profile.gold < buyCost(it.id)")

      //- ── The table: the item under discussion ──────────────────────────────
      section.trade__table(data-drop="table" :class="{ 'is-open': !!sel }")
        template(v-if="sel")
          button.trade__sheet-close(type="button" :aria-label="t('close')" @click="sel = null")
            GameIcon(name="close")
          //- The piece itself scrolls; the price and the deal stay in reach.
          div.trade__paper
            ItemCard(:id="sel.id" :against="against" show-source)
            StatList.trade__changes(v-if="changes.some(r => r.delta !== 0)" :rows="changes" layout="chips" only-changed)
          div.trade__deal
            span.trade__deal-label {{ sel.from === 'bag' ? t('shop.value') : t('shop.price') }}
            PriceTag.trade__deal-price(:n="price" :base="sel.from === 'goods' ? basePrice : 0" :bad="sel.from !== 'bag' && profile.gold < price && !owns(sel.id)")
          p.trade__why(v-if="why") {{ why }}
          div.shop__actions
            FButton(v-if="sel.from === 'bag' && wornSlot" :label="t('bag.unequip')" type="danger" size="sm" @click="takeOff")
            FButton.trade__act(
              :label="actLabel"
              :type="sel.from === 'bag' ? 'warning' : 'success'"
              :size="short ? 'sm' : 'md'"
              :is-disabled="!can"
              @click="act"
            )
        p.trade__hint(v-else) {{ t('shop.hint') }}

      //- ── What was sold this visit, to be had back at the price paid ────────
      section.trade__back(v-if="buyBack.length" data-drop="back")
        h3.trade__cap {{ t('shop.buyBack') }}
        div.trade__back-row
          ItemCell.back(
            v-for="b in buyBack"
            :key="b.id"
            :id="b.id"
            :selected="isSel('back', b.id)"
            v-on="drag.handle({ id: b.id, from: 'back' })"
            @click="pick('back', b.id)"
          )
            template(#tag)
              PriceTag(:n="b.gold" :bad="profile.gold < b.gold")

      //- ── The hero's bag ─────────────────────────────────────────────────────
      section.trade__side.trade__bag(data-drop="bag" :class="dropClass('bag')")
        h3.trade__cap {{ t('menu.inventory') }}
        div.trade__scroll
          p.trade__empty(v-if="bag.length === 0") {{ t('bag.empty') }}
          div.trade__grid
            ItemCell.cell(
              v-for="it in bag"
              :key="it.id"
              :id="it.id"
              :selected="isSel('bag', it.id)"
              :worn="!!equippedIn(it.id)"
              :fresh="profile.inv.fresh.includes(it.id)"
              :locked="profile.level < it.level"
              v-on="drag.handle({ id: it.id, from: 'bag' })"
              @click="pick('bag', it.id)"
            )
              template(#tag)
                PriceTag(:n="sellValue(it)")

      //- The deal, stamped over the whole table.
      DealStamp(:n="stamps" :text="t('shop.deal')" :tone="stampTone")

    Teleport(to="body")
      div.drag-ghost(v-if="drag.state.active && drag.state.payload" :ref="drag.ghost")
        ItemIcon(:id="drag.state.payload.id")
</template>

<script setup lang="ts">
/**
 * ─── A merchant's table (D38) ────────────────────────────────────────────────
 *
 * A barter, not a list: the merchant's shelf on one side, the hero's bag on
 * the other, and between them the piece under discussion — its card, how it
 * compares with what he wears, the stats it would change, the price — and one
 * big action that is the deal: Buy, Sell, or Buy back.
 *
 *   tap a piece             put it on the table
 *   tap the action          strike the deal (coins cross the table)
 *   drag it across          the same in one move: a ware into the bag buys
 *                           it, a piece from the bag onto the shelf sells it
 *
 * The rules are `profile.ts`'s, unchanged: every named item is owned once,
 * a merchant pays a quarter of the price, worn gear is not sold (the table
 * offers to take it off first), Charisma haggles. What was sold in this visit
 * waits on the buy-back row at the price it fetched (`buyBackItem`) until the
 * conversation ends (`visit.ts`).
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ITEMS, ITEM_BY_ID, priceOf, sellValue, type ItemDef } from '@/game/data/items'
import {
  buyBack, buyBackItem, buyCost, buyItem, computeStats, equippedIn, markSeen, owns, profile, saveProfile, sellItem, unequip
} from '@/game/state/profile'
import { flow } from '@/game/flow'
import { sfx } from '@/game/audio/sfx'
import FButton from '@/components/atoms/FButton.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import ItemCard from '@/components/game/ItemCard.vue'
import ItemCell from '@/components/game/ItemCell.vue'
import PriceTag from '@/components/game/PriceTag.vue'
import DealStamp from '@/components/game/DealStamp.vue'
import StatList from '@/components/game/StatList.vue'
import { KEY_STATS, bySlot, slotFor, statRows, statsWith, wornAgainst } from '@/components/game/heroSheet'
import { shake } from '@/components/game/fx'
import { useDrag } from '@/components/game/useDrag'
import { useMedia } from '@/components/game/useMedia'
import TradeFrame from './TradeFrame.vue'
import { trackVisit } from './visit'

trackVisit()
const { t } = useI18n()
const npc = computed(() => flow.npc)
/** A phone in portrait: the table is a sheet over one of the sides. */
const portrait = useMedia('(max-aspect-ratio: 1/1)')
/** A phone on its side: the big action a size down, so the card has room. */
const short = useMedia('(max-height: 30rem)')
const frame = ref<InstanceType<typeof TradeFrame> | null>(null)

type Side = 'goods' | 'bag' | 'back'
interface Pick { from: Side; id: string }

/** What this merchant stocks (GDD §6): by slot and tier, as the town's fate
 *  left it. Legendaries are found, never sold. */
const stock = computed<ItemDef[]>(() => {
  const s = npc.value?.stock
  if (!s) return []
  const slots = s.slots as readonly string[]
  return ITEMS.filter(i => i.tier < 6 && slots.includes(i.slot) && s.tiers.includes(i.tier)).sort((a, b) => a.tier - b.tier || a.level - b.level)
})
const bag = computed<ItemDef[]>(() => profile.inv.items.map(id => ITEM_BY_ID[id]).filter((i): i is ItemDef => !!i).sort(bySlot))

// ── The piece on the table ───────────────────────────────────────────────────
const sel = ref<Pick | null>(null)
const isSel = (from: Side, id: string): boolean => sel.value?.from === from && sel.value.id === id
const wornSlot = computed(() => (sel.value ? equippedIn(sel.value.id) : null))
const against = computed(() => (sel.value && !wornSlot.value ? wornAgainst(sel.value.id) : null))
const basePrice = computed(() => (sel.value && ITEM_BY_ID[sel.value.id] ? priceOf(ITEM_BY_ID[sel.value.id]!) : 0))
const price = computed(() => {
  const p = sel.value
  if (!p || !ITEM_BY_ID[p.id]) return 0
  return p.from === 'goods' ? buyCost(p.id) : p.from === 'bag' ? sellValue(ITEM_BY_ID[p.id]!) : buyBack.find(b => b.id === p.id)?.gold ?? 0
})

/** What wearing it would change (nothing for a piece already worn). */
const changes = computed(() => {
  const p = sel.value
  const now = computeStats()
  if (!p || wornSlot.value || !canEquipLater(p.id)) return statRows(now, now, KEY_STATS)
  const slot = slotFor(p.id)
  return statRows(now, slot ? statsWith(slot, p.id) : now, KEY_STATS)
})
/** Owned or not, could the hero wear it at his level? */
const canEquipLater = (id: string): boolean => profile.level >= (ITEM_BY_ID[id]?.level ?? 99)

/** Can the deal on the table be struck? */
const can = computed(() => {
  const p = sel.value
  if (!p) return false
  if (p.from === 'goods') return !owns(p.id) && profile.gold >= price.value
  if (p.from === 'bag') return owns(p.id) && !wornSlot.value
  return !owns(p.id) && profile.gold >= price.value
})
const actLabel = computed(() => {
  const p = sel.value
  if (!p) return ''
  if (p.from === 'goods') return owns(p.id) ? t('shop.owned') : t('shop.buy')
  return p.from === 'bag' ? t('shop.sell') : t('shop.buyBackOne')
})
/** Why not, or what to know first. */
const why = computed(() => {
  const p = sel.value
  if (!p) return ''
  const it = ITEM_BY_ID[p.id]
  if (p.from === 'bag') return wornSlot.value ? t('bag.worn') : ''
  if (owns(p.id)) return ''
  if (profile.gold < price.value) return t('trainer.block.gold')
  if (it && profile.level < it.level) return t('bag.tooLow', { n: it.level })
  return ''
})

const pick = (from: Side, id: string): void => {
  sel.value = { from, id }
  sfx('uiClick')
  if (from === 'bag' && profile.inv.fresh.includes(id)) { markSeen(id); saveProfile() }
}

// ── Striking the deal ────────────────────────────────────────────────────────
const stamps = ref(0)
const stampTone = ref<'green' | 'gold'>('green')
const stamp = (tone: 'green' | 'gold'): void => { stampTone.value = tone; stamps.value++ }

const deal = (p: Pick): boolean => {
  const gold = p.from === 'goods' ? buyCost(p.id) : p.from === 'bag' ? sellValue(ITEM_BY_ID[p.id]!) : buyBack.find(b => b.id === p.id)?.gold ?? 0
  const ok = p.from === 'goods' ? buyItem(p.id) : p.from === 'bag' ? sellItem(p.id) : buyBackItem(p.id)
  if (!ok) {
    sfx('denied')
    shake(document.querySelector('.trade__act'))
    if (p.from !== 'bag' && profile.gold < gold) frame.value?.say(t('shop.say.poor'))
    return false
  }
  sfx('uiBuy')
  sfx('coin')
  if (p.from === 'bag') {
    void frame.value?.receive(gold)
    frame.value?.say(t('shop.say.sell'))
    stamp('gold')
    sel.value = null
  } else {
    void frame.value?.pay(gold)
    frame.value?.say(t(p.from === 'goods' ? 'shop.say.buy' : 'shop.say.back'))
    stamp('green')
    // On a desktop the piece stays on the table, now owned. On a phone the
    // sheet steps aside: the stamp, and the piece arriving in the bag.
    sel.value = p.from === 'back' || portrait.value ? null : p
  }
  return true
}
const act = (): void => { if (sel.value) deal(sel.value) }
const takeOff = (): void => {
  const s = wornSlot.value
  if (!s) return
  unequip(s)
  sfx('uiClose')
}

// ── Across the table by hand ─────────────────────────────────────────────────
interface Held { id: string; from: Side }
const drag = useDrag<Held>({
  accepts: (p, zone) => {
    if (zone === 'table') return true
    if (zone === 'bag') return p.from !== 'bag' && !owns(p.id)
    if (zone === 'goods') return p.from === 'bag' && !equippedIn(p.id)
    return false
  },
  onDrop: (p, zone) => {
    if (zone === 'table') { pick(p.from, p.id); return true }
    const ok = deal(p)
    if (!ok) sel.value = { from: p.from, id: p.id }
    return ok
  },
  onStart: (p) => { sel.value = { from: p.from, id: p.id } }
})
const dropClass = (zone: 'goods' | 'bag'): Record<string, boolean> => {
  const p = drag.state.active ? drag.state.payload : null
  const would = !!p && (zone === 'bag' ? p.from !== 'bag' : p.from === 'bag')
  return { 'is-target': would, 'is-over': would && drag.state.over === zone }
}
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'
@use '@/components/game/screen'
@use './trade'
</style>
