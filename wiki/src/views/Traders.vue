<script setup lang="ts">
import { computed } from 'vue'
import { SHOPS, ITEMS, TOWNS, TIER_COLOR, ELIXIRS, npcName, npcPortrait, zoneName, slotName, tierName, t, plantName, IMG, type TownId } from '../data'
import { shelfTier } from '@/game/rareShelf'
import ItemIcon from '../components/ItemIcon.vue'

const towns = Object.keys(TOWNS) as TownId[]
const stockOf = (s: (typeof SHOPS)[number]) => ITEMS.filter(i => i.tier < 6 && s.slots.includes(i.slot) && s.tiers.includes(i.tier)).sort((a, b) => a.tier - b.tier || a.level - b.level)
const byTown = computed(() => towns.map(town => ({ town, shops: SHOPS.filter(s => s.place === town).sort((a, b) => a.at - b.at) })))
const gamblers = towns.flatMap(town => TOWNS[town].npcs.filter(n => n.role === 'gambler').map(n => ({ n, town })))
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">Traders & Merchants</h1>
    <p class="muted lead">Every merchant, what they stock, and what opens them. Each merchant also keeps a <b>rare shelf</b>: three pieces one tier above their best, re-rolled every day (and a few times with a rewarded video). Charisma cuts every price — up to 40%.</p>

    <section class="panel secret">
      <h2>🗝 The secret traders of Silverbridge</h2>
      <p>Two shops in Silverbridge have no sign. Do their owner's favour and they trade with you for good — <b>Rare and Epic</b> pieces, early.</p>
      <div class="grid g2">
        <div v-for="s in SHOPS.filter(x => x.secret)" :key="s.npc" class="row st">
          <img v-if="npcPortrait(s.look)" :src="npcPortrait(s.look)!" class="pt" alt="" />
          <div><h3 class="display">{{ npcName(s.npc) }}</h3><div class="small">{{ s.how }}</div>
            <div class="small dim">Sells {{ s.slots.map(slotName).join(', ') }} · {{ s.tiers.map(tierName).join(' & ') }} · rare shelf: {{ tierName(shelfTier(s)) }}</div></div>
        </div>
      </div>
      <a href="#/secrets" class="small">Full unlock guide →</a>
    </section>

    <section v-for="g in byTown" :key="g.town">
      <div class="section-title"><h2>{{ zoneName(g.town) }}</h2></div>
      <div class="grid g2">
        <div v-for="s in g.shops" :key="s.npc" class="panel shop">
          <div class="row">
            <img v-if="npcPortrait(s.look)" :src="npcPortrait(s.look)!" class="pt" alt="" />
            <div>
              <h3 class="display">{{ npcName(s.npc) }} <span v-if="s.secret">🗝</span></h3>
              <div class="small muted">{{ s.slots.map(slotName).join(' · ') }}</div>
              <div class="row small">
                <span v-for="n in s.tiers" :key="n" class="chip" :style="{ color: TIER_COLOR[n] }">{{ tierName(n) }}</span>
                <span class="chip" :style="{ color: TIER_COLOR[shelfTier(s)] }">✨ shelf: {{ tierName(shelfTier(s)) }}</span>
              </div>
              <div v-if="s.how" class="small unlock">🔓 {{ s.how }}</div>
              <div v-if="t(`npc.${s.npc}.talk`) !== s.npc" class="small dim quote">“{{ t(`npc.${s.npc}.talk`) }}”</div>
            </div>
          </div>
          <div class="stock"><ItemIcon v-for="i in stockOf(s)" :key="i.id" :id="i.id" :size="38" /></div>
        </div>
      </div>
    </section>

    <div class="section-title"><h2>On the road & elsewhere</h2></div>
    <div class="grid g3">
      <div class="panel">
        <h3 class="display">🧳 {{ npcName('wanderer') }}</h3>
        <p class="small">A random encounter on the world-map roads once you have reached a town. Sells weapons, off-hands, armour and trinkets in the two tiers around your level (level ÷ 6, rounded up) — the easiest early Rare/Epic.</p>
      </div>
      <div class="panel">
        <h3 class="display">🎲 Gamblers</h3>
        <p class="small" v-for="g in gamblers" :key="g.n.id"><b>{{ npcName(g.n.id) }}</b> — {{ zoneName(g.town) }} ({{ g.n.game === 'memory' ? 'memory cards' : 'item battle: lay an item, the pricier wins' }})</p>
      </div>
      <div class="panel">
        <h3 class="display">⚗ Odile's elixirs</h3>
        <p class="small muted">The Silverbridge alchemist brews the herbs you pick.</p>
        <div v-for="e in ELIXIRS" :key="e.id" class="small" :style="{ color: e.colour }">{{ t(`elixir.${e.id}.name`) }} — {{ Object.entries(e.recipe).map(([p, n]) => `${n}× ${plantName(p)}`).join(', ') }}</div>
      </div>
      <div class="panel">
        <h3 class="display">⚒ Smiths & the forge</h3>
        <p class="small">Every town smith upgrades what you wear up to +5 (+3% attributes and armour per level, +5% for legendaries). Ironhold and Silverbridge smiths also buy ore and forge 48 metal pieces — iron, silver, gold, mithril, each with a masterwork twin.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lead { max-width: 900px; }
.secret { margin: 20px 0; background: radial-gradient(600px 240px at 0 0, rgba(156,123,255,.25), transparent), var(--panel); border-color: rgba(156,123,255,.5); }
.pt { width: 84px; height: 84px; object-fit: contain; flex: none; filter: drop-shadow(0 4px 10px rgba(0,0,0,.6)); }
.st h3, .shop h3 { margin: 0 0 4px; }
.shop .row { align-items: flex-start; flex-wrap: nowrap; }
.unlock { color: #ffcf7a; margin-top: 6px; }
.quote { font-style: italic; margin-top: 4px; }
@media (max-width: 680px) { .pt { width: 56px; height: 56px; } .shop > .row > div { min-width: 0; } .st { flex-wrap: nowrap; align-items: flex-start; } .st > div { min-width: 0; } }
.stock { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 12px; }
</style>
