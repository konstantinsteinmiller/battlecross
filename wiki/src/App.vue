<script setup lang="ts">
import { computed } from 'vue'
import { parts } from './router'
import TipCard from './components/TipCard.vue'
import Home from './views/Home.vue'
import Builds from './views/Builds.vue'
import BuildGuide from './views/BuildGuide.vue'
import Planner from './views/Planner.vue'
import Classes from './views/Classes.vue'
import ClassPage from './views/ClassPage.vue'
import Skills from './views/Skills.vue'
import Combos from './views/Combos.vue'
import Path from './views/Path.vue'
import Items from './views/Items.vue'
import Traders from './views/Traders.vue'
import Smithing from './views/Smithing.vue'
import Quests from './views/Quests.vue'
import Secrets from './views/Secrets.vue'
import Atlas from './views/Atlas.vue'
import { IMG } from './data'

const NAV = [
  { to: '/builds', label: 'Builds' },
  { to: '/planner', label: 'Planner' },
  { to: '/classes', label: 'Classes' },
  { to: '/skills', label: 'Skills' },
  { to: '/combos', label: 'Combo Lab' },
  { to: '/path', label: 'Leveling' },
  { to: '/items', label: 'Items' },
  { to: '/smithing', label: 'Smithing' },
  { to: '/traders', label: 'Traders' },
  { to: '/quests', label: 'Quests' },
  { to: '/secrets', label: 'Secrets' },
  { to: '/atlas', label: 'Atlas' }
]

const view = computed(() => {
  const [a, b] = parts.value
  switch (a) {
    case 'builds': return b ? BuildGuide : Builds
    case 'planner': return Planner
    case 'classes': return b ? ClassPage : Classes
    case 'skills': return Skills
    case 'combos': return Combos
    case 'path': return Path
    case 'items': return Items
    case 'smithing': return Smithing
    case 'traders': return Traders
    case 'quests': return Quests
    case 'secrets': return Secrets
    case 'atlas': return Atlas
    default: return Home
  }
})
const key = computed(() => parts.value.slice(0, 2).join('/'))
</script>

<template>
  <header class="top">
    <div class="wrap row between">
      <a href="#/" class="brand">
        <img :src="IMG + 'logo/emblem.webp'" alt="" />
        <span class="display gold-text">Battlecross <em>Codex</em></span>
      </a>
      <nav class="row">
        <a v-for="n in NAV" :key="n.to" :href="'#' + n.to" :class="{ on: '/' + (parts[0] ?? '') === n.to }">{{ n.label }}</a>
      </nav>
    </div>
  </header>
  <main>
    <component :is="view" :key="key" />
  </main>
  <footer class="foot">
    <div class="wrap row between">
      <span class="dim small">Every number on this site is read from the game's own data at build time — it updates with every patch.</span>
      <a class="btn small" href="../" target="_blank" rel="noopener">▶ Play Battlecross</a>
    </div>
  </footer>
  <TipCard />
</template>

<style scoped>
.top {
  position: sticky; top: 0; z-index: 50;
  background: linear-gradient(180deg, rgba(13, 11, 20, .96), rgba(13, 11, 20, .82));
  border-bottom: 1px solid var(--line); backdrop-filter: blur(10px);
}
.top .wrap { height: 68px; flex-wrap: nowrap; }
.brand { display: flex; align-items: center; gap: 10px; flex: none; }
.brand img { width: 44px; height: 44px; object-fit: contain; filter: drop-shadow(0 2px 6px rgba(255, 200, 60, .4)); }
.brand span { font-size: 25px; }
.brand em { font-style: normal; font-size: 16px; opacity: .9; }
nav { gap: 2px; flex-wrap: nowrap; overflow-x: auto; }
nav a { flex: none; color: var(--muted); font-weight: 800; font-size: 14px; padding: 8px 11px; border-radius: 10px; white-space: nowrap; }
nav a:hover { color: #fff; background: rgba(255, 255, 255, .05); }
nav a.on { color: #2a1600; background: linear-gradient(180deg, #ffe680, #ffb84a); }
.foot { border-top: 1px solid var(--line); padding: 22px 0; background: rgba(13, 11, 20, .8); }
@media (max-width: 1100px) { .brand em { display: none; } }
@media (max-width: 760px) {
  .top .wrap { height: auto; flex-wrap: wrap; padding-top: 6px; padding-bottom: 4px; gap: 4px; }
  .brand img { width: 32px; height: 32px; }
  .brand span { font-size: 20px; }
  nav { width: 100%; margin: 0 -16px; padding: 0 16px 4px; width: calc(100% + 32px); scrollbar-width: none; }
  nav::-webkit-scrollbar { display: none; }
  nav a { padding: 7px 10px; font-size: 13.5px; }
  .foot .wrap { flex-direction: column; align-items: flex-start; }
}
</style>
