<script setup lang="ts">
import { ref, computed } from 'vue'
import { ITEM_BY_ID, TIER_COLOR, itemName, modLine, tierName, zoneName, npcName, ZONE_IDS, ZONES } from '../data'
import {
  SMITH_LINES, SMITH_METAL, SMITH_PIECES, ORE_IDS, ORE_LEVEL, ORE_PRICE, ORE_CAP, ORE_NODES_MAX, LATE_ORE_LEVEL, LATE_ORE_NODES_MIN, STRIKES, SWEEP, GRADES,
  FORGE_FIRST, FORGE_STEP, FORGE_STEP_LATE, FORGE_KNEE, FORGE_GAIN, LEGEND_WORTH, forgeCost, forgeTotal, spotHalf, gradeMakes, RECIPES,
  metalName, PIECE_NAME, LINE_NAME, oresInZone, zonesOfOre, SMITHS, recipesOf, forgeSummary, type SmithMetal
} from '../smithing'
import ItemIcon from '../components/ItemIcon.vue'

const metal = ref<SmithMetal>('iron')
const masterwork = ref(false)
const smithTowns = [...new Set(SMITHS.map(s => s.town))]
const cell = (line: (typeof SMITH_LINES)[number], piece: (typeof SMITH_PIECES)[number]) => {
  const r = recipesOf(line, metal.value).find(x => x.piece === piece)!
  return ITEM_BY_ID[masterwork.value ? r.master : r.item]!
}
const lines = computed(() => SMITH_LINES.map(l => ({ l, items: SMITH_PIECES.map(p => cell(l, p)) })))
const recipeRows = computed(() => SMITH_PIECES.map(p => ({ p, rs: ORE_IDS.map(m => recipesOf('str', m).find(r => r.piece === p)!) })))
const sample = ['rangersJerkin', 'dragonSmasher'].map(id => ITEM_BY_ID[id]).filter(Boolean)
const LEVELS = [0, 4, 9, 10, 19, 29, 49]
const lateZones = ZONE_IDS.filter(z => ZONES[z].min >= LATE_ORE_LEVEL)
const sweepPct = (m: SmithMetal) => Math.round(spotHalf(m, 0) * 2000) / 10
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">Smithing & the Forge</h1>
    <p class="muted lead">{{ forgeSummary(zoneName) }} Everything on this page is read from the game's data.</p>

    <div class="panel">
      <h3 class="display">How it works</h3>
      <ul class="small">
        <li><b>Learn it once.</b> Any town smith ({{ smithTowns.map(zoneName).join(', ') }}) teaches smithing; the first nugget of a metal makes that metal's pieces known, for every build at once.</li>
        <li><b>Mine ore.</b> Outcrops against the stone of a zone, up to {{ ORE_NODES_MAX }} a visit; the pouch holds {{ ORE_CAP }} of each. A smith buys nuggets at a flat price.</li>
        <li><b>Pay and strike.</b> A piece takes nuggets and gold, then {{ STRIKES }} hammer strikes on the glowing bar decide the grade.</li>
        <li><b>Fixed stats.</b> No rolling: each piece is a named item with fixed attributes and no passive. Forging a piece you already own works it up instead.</li>
      </ul>
    </div>

    <div class="section-title"><h2>The six metals</h2></div>
    <div class="panel tight scroll">
      <table class="t">
        <thead><tr><th>Metal</th><th>Plain</th><th>Masterwork</th><th>Piece level</th><th>Ore from lv</th><th>Nugget sells</th><th>Mined in</th></tr></thead>
        <tbody>
          <tr v-for="m in ORE_IDS" :key="m">
            <td><b>{{ metalName(m) }}</b></td>
            <td :style="{ color: TIER_COLOR[SMITH_METAL[m].tier] }">{{ tierName(SMITH_METAL[m].tier) }}</td>
            <td :style="{ color: TIER_COLOR[SMITH_METAL[m].master] }">{{ tierName(SMITH_METAL[m].master) }}</td>
            <td>{{ SMITH_METAL[m].level }}</td>
            <td>{{ ORE_LEVEL[m] }}</td>
            <td>{{ ORE_PRICE[m] }} g</td>
            <td class="small">{{ zonesOfOre(m).map(zoneName).join(', ') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="dim small">From level {{ LATE_ORE_LEVEL }} ({{ lateZones.map(zoneName).join(', ') }}) the zones hold no iron and no silver: {{ LATE_ORE_NODES_MIN }}–{{ ORE_NODES_MAX }} outcrops of only the top three metals the level reaches, mithril the commonest.</p>

    <div class="section-title"><h2>Ore by zone</h2></div>
    <div class="panel tight scroll">
      <table class="t">
        <thead><tr><th>Zone</th><th>Level</th><th>Ores (relative weight)</th></tr></thead>
        <tbody>
          <tr v-for="z in ZONE_IDS" :key="z">
            <td>{{ zoneName(z) }}</td><td>{{ ZONES[z].min }}–{{ ZONES[z].max }}</td>
            <td class="small">{{ oresInZone(z).map(o => `${metalName(o.id)} ${o.weight}`).join(' · ') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section-title"><h2>Every build, every piece</h2></div>
    <div class="panel tight filters">
      <div class="row">
        <button v-for="m in ORE_IDS" :key="m" class="chip" :class="{ on: metal === m }" @click="metal = m">{{ metalName(m) }}</button>
        <button class="chip" :class="{ on: masterwork }" @click="masterwork = !masterwork">Masterwork twin</button>
      </div>
    </div>
    <div class="builds">
      <div v-for="row in lines" :key="row.l" class="panel tight">
        <h3 class="display">{{ LINE_NAME[row.l] }} build</h3>
        <a v-for="(it, n) in row.items" :key="it.id" class="piece" :href="'#/items?i=' + it.id">
          <ItemIcon :id="it.id" :size="40" />
          <span class="pn"><b :style="{ color: TIER_COLOR[it.tier] }">{{ itemName(it) }}</b>
            <span class="dim small">{{ PIECE_NAME[SMITH_PIECES[n]!] }} · {{ tierName(it.tier) }} · Lv {{ it.level }}<template v-if="it.armor"> · {{ it.armor }} armor</template></span>
            <span class="stat small">{{ Object.entries(it.mods).map(([k, v]) => modLine(k, v as number)).join(' · ') }}</span></span>
        </a>
      </div>
    </div>

    <div class="section-title"><h2>What a recipe costs</h2></div>
    <div class="panel tight scroll">
      <table class="t">
        <thead><tr><th>Piece</th><th v-for="m in ORE_IDS" :key="m">{{ metalName(m) }}</th></tr></thead>
        <tbody>
          <tr v-for="row in recipeRows" :key="row.p"><td>{{ PIECE_NAME[row.p] }}</td><td v-for="r in row.rs" :key="r.id" class="small">{{ r.nuggets }} nuggets + {{ r.gold }} g</td></tr>
        </tbody>
      </table>
    </div>
    <p class="dim small">The same price for all six builds ({{ RECIPES.length }} recipes). Gold is never less than the masterwork sells for: no forging for profit.</p>

    <div class="section-title"><h2>The forge mini-game</h2></div>
    <div class="panel">
      <p class="small">A glow sweeps the bar; hit it {{ STRIKES }} times on the hot spot. The three strikes' total sets the grade:</p>
      <ul class="small">
        <li v-for="g in GRADES" :key="g"><b>{{ g }}</b>: {{ (() => { const r = RECIPES[0]!; const m = gradeMakes(r, g); return (m.id === r.item ? 'the plain piece' : 'the masterwork twin') + (m.levels ? `, +${m.levels} forge level${m.levels > 1 ? 's' : ''}` : '') })() }}</li>
      </ul>
      <p class="small">A hero eight levels above a piece strikes one grade better. A rarer metal sweeps faster and has a narrower spot:</p>
      <p class="small"><span v-for="m in ORE_IDS" :key="m" class="chip">{{ metalName(m) }} {{ SWEEP[m] }}×, spot {{ sweepPct(m) }}%</span></p>
      <p class="dim small">A steady hand (Dexterity) widens the spot, up to half again at 60 DEX.</p>
    </div>

    <div class="section-title"><h2>Upgrades: no top</h2></div>
    <div class="panel">
      <p class="small">Any town smith upgrades what you wear, for gold, with <b>no level cap</b>. Each level grows attributes and armour (never a passive): {{ FORGE_GAIN[1] * 100 }}% of the piece per level up to +{{ FORGE_KNEE }} ({{ FORGE_GAIN[6] * 100 }}% for legendaries), then a little more each level before it tapers off. The first level costs {{ FORGE_FIRST * 100 }}% of the item's price (a legendary is reckoned at {{ LEGEND_WORTH }} g); each next level costs ×{{ FORGE_STEP }} up to +{{ FORGE_KNEE }}, then ×{{ FORGE_STEP_LATE }} a level.</p>
      <table class="t">
        <thead><tr><th>Item</th><th v-for="l in LEVELS" :key="l">→ +{{ l + 1 }}</th><th>Total to +{{ FORGE_KNEE }}</th></tr></thead>
        <tbody>
          <tr v-for="it in sample" :key="it!.id"><td>{{ itemName(it!) }} ({{ tierName(it!.tier) }})</td><td v-for="l in LEVELS" :key="l" class="small">{{ forgeCost(it!, l) }} g</td><td class="small">{{ forgeTotal(it!) }} g</td></tr>
        </tbody>
      </table>
    </div>
    <p class="dim small" style="margin-top:10px">Smiths: <template v-for="(s, n) in SMITHS" :key="s.npc"><template v-if="n">, </template>{{ npcName(s.npc) }} ({{ zoneName(s.town) }})</template>.</p>
  </div>
</template>

<style scoped>
.lead { max-width: 900px; }
.section-title { margin-top: 26px; }
.t { width: 100%; border-collapse: collapse; }
.t th, .t td { text-align: left; padding: 6px 10px; border-bottom: 1px solid var(--line2); }
.scroll { overflow-x: auto; }
.builds { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px; margin-top: 12px; }
.piece { display: flex; gap: 10px; align-items: center; padding: 5px 0; color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--line2); }
.pn { display: flex; flex-direction: column; min-width: 0; }
.stat { color: #8ab4ff; }
.filters { margin-top: 12px; }
</style>
