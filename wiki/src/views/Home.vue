<script setup lang="ts">
import { BUILDS } from '../builds'
import { CLASS_IDS, CLASSES, SKILLS, ALL_ITEMS, QUESTS, IMG, className, classIcon } from '../data'
import BuildCard from '../components/BuildCard.vue'

const featured = BUILDS.slice(0, 6)
const PILLARS = [
  { to: '/planner', icon: '⚒', title: 'Character Planner', text: 'Spend 117 attribute points, slot 8 actives and 4 passives from ANY class, gear up, and see your real stats — the game\'s own formulas.' },
  { to: '/builds', icon: '📜', title: `${BUILDS.length} Build Guides`, text: 'Glass cannons, legions of minions, immortal tanks, time-lords. Full skill paths: which skill, which level, which trainer.' },
  { to: '/combos', icon: '✦', title: 'Combo Lab', text: `Every pair of the ${SKILLS.length} skills scored for synergy. Find the cross-class combos nobody has tried yet.` },
  { to: '/items', icon: '💎', title: 'Loot Finder', text: `All ${ALL_ITEMS.length} items: which zone, which chest, which boss — and which trader sells it early.` },
  { to: '/secrets', icon: '🗝', title: 'Secrets', text: 'How to unlock the four hidden masters, the two secret traders, the hidden trainers and the caged disciples.' },
  { to: '/quests', icon: '⚖', title: `${QUESTS.length} Fateful Choices`, text: 'Every quest decision, what it changes in the world, and which builds it helps.' }
]
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-art" :style="{ backgroundImage: `url(${IMG}covers/cover-skills.webp)` }"></div>
      <div class="wrap hero-in">
        <img class="wordmark" :src="IMG + 'logo/wordmark.webp'" alt="Battlecross" />
        <h1 class="gold-text">The Codex</h1>
        <p class="lead">Builds, skills and loot for players who cleared the main quest and want <b>more</b>. Mix all {{ CLASS_IDS.length }} classes, chase the perfect bar, break the game in a new way every run.</p>
        <div class="row">
          <a class="btn" href="#/planner">⚒ Open the Planner</a>
          <a class="btn ghost" href="#/builds">Browse builds</a>
        </div>
        <div class="class-strip">
          <a v-for="c in CLASS_IDS" :key="c" :href="'#/classes/' + c" class="cls" :style="{ '--c': CLASSES[c].color }" :title="className(c)">
            <img :src="classIcon(c)" :alt="className(c)" />
          </a>
        </div>
      </div>
    </section>

    <div class="wrap">
      <div class="grid g3 pillars">
        <a v-for="p in PILLARS" :key="p.to" :href="'#' + p.to" class="panel hover-lift pillar">
          <div class="pi">{{ p.icon }}</div>
          <h3 class="gold-text">{{ p.title }}</h3>
          <p class="muted">{{ p.text }}</p>
        </a>
      </div>

      <div class="section-title"><h2>Featured builds</h2><a href="#/builds">All {{ BUILDS.length }} →</a></div>
      <div class="grid g3">
        <BuildCard v-for="b in featured" :key="b.id" :build="b" />
      </div>

      <div class="grid g2 banners">
        <a href="#/items" class="banner hover-lift" :style="{ backgroundImage: `url(${IMG}covers/cover-loot.webp)` }">
          <div><h2 class="gold-text">Hunt the Legendaries</h2><p>Six legendary pieces, one secret chest, and the traders who sell epics before you are supposed to have them.</p></div>
        </a>
        <a href="#/quests" class="banner hover-lift" :style="{ backgroundImage: `url(${IMG}covers/cover-dragon.webp)` }">
          <div><h2 class="gold-text">Slay — or Bargain?</h2><p>The Void Dragon, the Oracle, the Siege of Oakhaven. Every choice reshapes towns, trainers and shops.</p></div>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { padding-top: 0; }
.hero { position: relative; overflow: hidden; border-bottom: 1px solid var(--line); margin-bottom: 34px; }
.hero-art { position: absolute; inset: 0; background-size: cover; background-position: center 30%; filter: saturate(1.15); }
.hero-art::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(13,11,20,.96) 0%, rgba(13,11,20,.82) 38%, rgba(13,11,20,.2) 75%), linear-gradient(0deg, var(--bg) 0%, transparent 35%); }
.hero-in { position: relative; padding: 60px 28px 54px; max-width: 1320px; }
.wordmark { height: 92px; display: block; margin-bottom: 4px; filter: drop-shadow(0 6px 18px rgba(0,0,0,.6)); }
.hero h1 { font-size: 64px; margin-bottom: 10px; }
.lead { font-size: 19px; max-width: 620px; color: #efe6d6; margin-bottom: 22px; }
.class-strip { display: flex; gap: 8px; margin-top: 30px; flex-wrap: wrap; max-width: 640px; }
.cls { width: 46px; height: 46px; border-radius: 12px; display: grid; place-items: center; background: rgba(0,0,0,.45); box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--c) 70%, transparent); transition: transform .15s; }
.cls:hover { transform: translateY(-3px) scale(1.08); box-shadow: inset 0 0 0 2px var(--c), 0 0 18px var(--c); }
.cls img { width: 80%; height: 80%; object-fit: contain; }
.pillar { color: var(--ink); display: block; }
.pillar:hover { color: var(--ink); }
.pi { font-size: 30px; margin-bottom: 6px; }
.banners { margin-top: 34px; }
@media (max-width: 680px) {
  .hero-in { padding: 28px 16px 30px; }
  .wordmark { height: 60px; }
  .hero h1 { font-size: 42px; }
  .lead { font-size: 16px; }
  .hero-art::after { background: linear-gradient(0deg, var(--bg) 0%, rgba(13,11,20,.85) 60%, rgba(13,11,20,.6)); }
  .cls { width: 38px; height: 38px; }
  .banner { min-height: 200px; }
}
.banner { display: flex; align-items: flex-end; min-height: 260px; border-radius: var(--r); background-size: cover; background-position: center; border: 1px solid var(--line); position: relative; overflow: hidden; color: var(--ink); }
.banner::before { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(13,11,20,.95), rgba(13,11,20,.1) 70%); }
.banner > div { position: relative; padding: 22px; }
.banner:hover { color: var(--ink); }
</style>
