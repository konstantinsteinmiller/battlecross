<script setup lang="ts">
import { computed, ref } from 'vue'
import { MAP, ZONES, TOWNS, ALL_ITEMS, PLANTS, CAGES, TEACHERS, QUESTS, IMG, zoneName, zoneDesc, enemyName, plantName, npcName, className, t, type ZoneId, type TownId } from '../data'
import ItemIcon from '../components/ItemIcon.vue'

const sel = ref<string>('plains')
const node = computed(() => MAP.find(n => n.id === sel.value)!)
const zone = computed(() => (node.value.kind === 'zone' ? ZONES[sel.value as ZoneId] : null))
const town = computed(() => (node.value.kind === 'town' ? TOWNS[sel.value as TownId] : null))
const items = computed(() => ALL_ITEMS.filter(i => i.drop.zone === sel.value && i.drop.src !== 'smith'))
const plants = computed(() => PLANTS.filter(p => sel.value in p.habitat))
const cage = computed(() => CAGES.find(c => c.zone === sel.value))
const teachers = computed(() => TEACHERS.filter(x => x.place === sel.value))
const quest = computed(() => QUESTS.find(q => q.node === sel.value))
const SRC: Record<string, string> = { mob: 'monsters', chest: 'chests', boss: 'boss', secret: 'secret chest' }
const ROLE: Record<string, string> = { shop: '🛒', trainer: '📖', quest: '❗', healer: '✚', alchemist: '⚗', gambler: '🎲', talk: '💬' }
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">Atlas</h1>
    <p class="muted">Click a place on the map.</p>
    <div class="layout">
      <div class="map panel" :style="{ backgroundImage: `url(${IMG}ui/map.webp)` }">
        <svg class="links" viewBox="0 0 100 100" preserveAspectRatio="none">
          <template v-for="n in MAP" :key="n.id">
            <line v-for="l in n.links.filter(l => l > n.id)" :key="l" :x1="n.at[0] * 100" :y1="n.at[1] * 100" :x2="MAP.find(m => m.id === l)!.at[0] * 100" :y2="MAP.find(m => m.id === l)!.at[1] * 100" />
          </template>
        </svg>
        <button v-for="n in MAP" :key="n.id" class="pin" :class="[n.kind, { on: sel === n.id }]" :style="{ left: n.at[0] * 100 + '%', top: n.at[1] * 100 + '%' }" @click="sel = n.id">
          <span class="dot">{{ n.kind === 'town' ? '⌂' : n.kind === 'arena' ? '⚔' : ZONES[n.id as ZoneId]?.min }}</span>
          <span class="nm">{{ zoneName(n.id) }}</span>
        </button>
      </div>
      <aside class="panel detail">
        <h2 class="display gold-text">{{ zoneName(sel) }}</h2>
        <p class="muted">{{ zoneDesc(sel) }}</p>
        <template v-if="zone">
          <div class="row"><span class="chip">Levels {{ zone.min }}–{{ zone.max }}</span><span class="chip">{{ zone.sections }} clearings</span><span v-if="zone.secret" class="chip">🗝 secret chest</span></div>
          <h4>Enemies</h4>
          <div class="small">{{ zone.kinds.map(k => enemyName(k.kind)).join(' · ') }}</div>
          <h4>Bosses</h4>
          <div class="small"><b>{{ enemyName(zone.finale.leader) }}</b> (finale)<span v-if="zone.midBoss"> · {{ enemyName(zone.midBoss) }} (mid-way)</span></div>
          <div v-if="quest" class="small q">⚖ Fateful choice: <a href="#/quests">{{ t(`quest.${quest.id}.title`) }}</a></div>
          <div v-if="cage" class="small q">🗝 Cage: {{ npcName(cage.npc) }}</div>
          <div v-for="x in teachers" :key="x.npc" class="small q">✦ Hidden teacher: {{ npcName(x.npc) }} ({{ className(x.cls) }})</div>
          <h4>Loot found here</h4>
          <div class="loot"><div v-for="i in items" :key="i.id" class="li"><ItemIcon :id="i.id" :size="40" /><span class="dim small">{{ SRC[i.drop.src] }}</span></div></div>
          <h4 v-if="plants.length">Herbs</h4>
          <div class="small">{{ plants.map(p => plantName(p.id)).join(' · ') }}</div>
        </template>
        <template v-if="town">
          <h4>People</h4>
          <div v-for="n in town.npcs" :key="n.id" class="small npc">
            {{ ROLE[n.role] }} <b>{{ npcName(n.id) }}</b>
            <span v-if="n.cls" class="dim"> — {{ className(n.cls) }}</span>
            <span v-if="n.secret || n.needs" class="dim"> (conditional)</span>
          </div>
          <a href="#/traders" class="small">Merchants in detail →</a>
        </template>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.layout { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 18px; align-items: start; }
@media (max-width: 1000px) { .layout { grid-template-columns: 1fr; } .detail { position: static; } .nm { display: none; } .dot { width: 26px; height: 26px; font-size: 12px; } }
.map { position: relative; aspect-ratio: 16 / 10; background-size: cover; background-position: center; padding: 0; overflow: hidden; }
.links { position: absolute; inset: 0; width: 100%; height: 100%; }
.links line { stroke: rgba(80, 40, 10, .7); stroke-width: .5; stroke-dasharray: 1.2 1; }
.pin { position: absolute; transform: translate(-50%, -50%); background: none; border: 0; cursor: pointer; display: flex; flex-direction: column; align-items: center; color: #2a1600; }
.dot { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-family: var(--display); font-size: 15px; background: radial-gradient(circle at 40% 30%, #fff1b0, #e0961c); box-shadow: 0 3px 10px rgba(0,0,0,.5), 0 0 0 2px #5a2d00; transition: transform .15s; }
.town .dot { background: radial-gradient(circle at 40% 30%, #d8f0ff, #4aa0e0); }
.arena .dot { background: radial-gradient(circle at 40% 30%, #ffd0d0, #e04a4a); }
.pin:hover .dot, .pin.on .dot { transform: scale(1.2); box-shadow: 0 0 0 3px #fff, 0 0 20px #ffd84a; }
.nm { font-family: var(--display); font-size: 12px; color: #fff; text-shadow: 0 1px 0 #000, 0 0 6px #000; margin-top: 3px; white-space: nowrap; }
.detail { position: sticky; top: 86px; }
h4 { margin: 14px 0 4px; color: var(--gold); font-family: var(--body); font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; }
.q { margin-top: 6px; }
.loot { display: flex; flex-wrap: wrap; gap: 8px; }
.li { display: flex; flex-direction: column; align-items: center; }
.npc { padding: 3px 0; }
</style>
