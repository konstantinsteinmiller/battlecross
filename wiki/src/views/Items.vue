<script setup lang="ts">
import { computed, ref } from 'vue'
import { ALL_ITEMS, ITEM_BY_ID, TIER_COLOR, ZONE_IDS, ATTR_NAME, itemName, tierName, slotName, modLine, sourcesOf, itemPrice, zoneName, type ItemSlot } from '../data'
import { query, setQuery } from '../router'
import ItemIcon from '../components/ItemIcon.vue'

const SLOTS: ItemSlot[] = ['main', 'off', 'head', 'body', 'hands', 'feet', 'trinket']
const q = ref('')
const slot = ref<ItemSlot | ''>('')
const tier = ref(0)
const zone = ref('')
const smith = ref(false)
const sel = computed(() => ITEM_BY_ID[query.value.get('i') ?? ''])
const list = computed(() => ALL_ITEMS.filter(i =>
  (smith.value || i.drop.src !== 'smith') && (!slot.value || i.slot === slot.value) && (!tier.value || i.tier === tier.value) &&
  (!zone.value || i.drop.zone === zone.value && i.drop.src !== 'smith') &&
  (!q.value || (itemName(i) + ' ' + Object.keys(i.mods).join(' ')).toLowerCase().includes(q.value.toLowerCase())))
  .sort((a, b) => a.level - b.level || a.tier - b.tier))
const KIND_ICON: Record<string, string> = { drop: '⚔', shop: '🛒', shelf: '✨', wanderer: '🧳', smith: '⚒', quest: '⚖' }
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">Loot Finder</h1>
    <p class="muted lead">Every item in the game — where it drops, which chests hold it, and every merchant who sells it (with what unlocks them). The ✨ rare shelf is three random pieces one tier above a merchant's own stock, re-stocked daily: the way to an epic before its zone.</p>
    <div class="layout">
      <div>
        <div class="panel tight filters">
          <input type="search" v-model="q" placeholder="Search name or stat (crit, lifesteal, cdr…)" />
          <div class="row">
            <button class="chip" :class="{ on: !slot }" @click="slot = ''">All slots</button>
            <button v-for="s in SLOTS" :key="s" class="chip" :class="{ on: slot === s }" @click="slot = slot === s ? '' : s">{{ slotName(s) }}</button>
          </div>
          <div class="row">
            <button v-for="n in 6" :key="n" class="chip" :class="{ on: tier === n }" :style="{ color: TIER_COLOR[n] }" @click="tier = tier === n ? 0 : n">{{ tierName(n) }}</button>
            <select v-model="zone"><option value="">Any zone</option><option v-for="z in ZONE_IDS" :key="z" :value="z">{{ zoneName(z) }}</option></select>
            <button class="chip" :class="{ on: smith }" @click="smith = !smith">Include forged gear</button>
          </div>
        </div>
        <div class="list">
          <button v-for="i in list" :key="i.id" class="irow" :class="{ on: sel?.id === i.id }" @click="setQuery({ i: i.id })">
            <ItemIcon :id="i.id" :size="44" />
            <span class="in"><b :style="{ color: TIER_COLOR[i.tier] }">{{ itemName(i) }}</b><span class="dim small">{{ tierName(i.tier) }} {{ slotName(i.slot) }} · Lv {{ i.level }}</span></span>
            <span class="small muted src">{{ sourcesOf(i)[0]?.text }}</span>
          </button>
        </div>
      </div>
      <aside class="panel detail" v-if="sel">
        <div class="row"><ItemIcon :id="sel.id" :size="84" />
          <div><h2 class="display" :style="{ color: TIER_COLOR[sel.tier] }">{{ itemName(sel) }}</h2>
            <div class="dim">{{ tierName(sel.tier) }} {{ slotName(sel.slot) }} · requires level {{ sel.level }}</div></div></div>
        <div class="mods">
          <div v-if="sel.armor">🛡 {{ sel.armor }} Armor</div>
          <div v-if="sel.weapon">⚔ {{ sel.weapon.style }} weapon · scales with {{ ATTR_NAME[sel.weapon.scale] }} · {{ sel.weapon.interval }}s</div>
          <div v-for="(v, k) in sel.mods" :key="k">{{ modLine(k as string, v as number) }}</div>
        </div>
        <div class="dim small" v-if="sel.tier < 6">Shop price {{ itemPrice(sel) }} gold before the Charisma discount</div>
        <h3 style="margin-top:16px">Where to get it</h3>
        <div v-for="(s, n) in sourcesOf(sel)" :key="n" class="src-row">
          <span class="ki">{{ KIND_ICON[s.kind] }}</span>
          <div><div>{{ s.text }}</div><div v-if="s.how" class="dim small">Unlock: {{ s.how }}</div></div>
          <span class="chip">~lv {{ s.at }}</span>
        </div>
      </aside>
      <aside class="panel detail" v-else>
        <h3>Pick an item</h3>
        <p class="muted">Select any item to see every way to get it, earliest first.</p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.lead { max-width: 900px; }
.layout { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 18px; margin-top: 16px; align-items: start; }
@media (max-width: 1000px) { .layout { grid-template-columns: 1fr; } }
.filters { display: grid; gap: 10px; margin-bottom: 12px; }
.list { display: grid; gap: 6px; }
.irow { display: flex; gap: 12px; align-items: center; text-align: left; background: var(--panel); border: 1px solid var(--line2); border-radius: 12px; padding: 7px 10px; color: var(--ink); cursor: pointer; font: inherit; }
.irow:hover { border-color: var(--line); }
.irow.on { border-color: var(--gold); background: rgba(255,216,74,.1); }
.in { display: flex; flex-direction: column; min-width: 190px; }
.src { margin-left: auto; text-align: right; }
.detail { position: sticky; top: 86px; }
.detail h2 { margin: 0 0 4px; font-size: 26px; }
.mods { color: #8ab4ff; font-weight: 700; margin: 14px 0 8px; }
.src-row { display: flex; gap: 12px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--line2); }
.src-row > div { flex: 1; }
.ki { font-size: 20px; width: 26px; text-align: center; }
</style>
