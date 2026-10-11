<script setup lang="ts">
import { computed } from 'vue'
import { parts } from '../router'
import { CLASSES, CLASS_IDS, ATTR_SHORT, className, classDesc, classIcon, skillsByClass, skillName, skillDesc, skillCost, teachersOf,
  npcName, placeName, factionName, scalingOf, ATTR_NAME, IMG, type ClassId, type Attr } from '../data'
import { BUILDS } from '../builds'
import { partnersOf } from '../synergy'
import SkillIcon from '../components/SkillIcon.vue'
import BuildCard from '../components/BuildCard.vue'

const c = computed(() => (CLASS_IDS.includes(parts.value[1] as ClassId) ? (parts.value[1] as ClassId) : null))
const skills = computed(() => (c.value ? skillsByClass(c.value) : []))
const builds = computed(() => BUILDS.filter(b => c.value && b.classes.includes(c.value)))
const portrait = computed(() => {
  const look = c.value ? `trainer${c.value[0]!.toUpperCase()}${c.value.slice(1)}` : ''
  return ['aegis', 'pyro', 'shadow', 'sovereign', 'chrono', 'blood', 'aether', 'geo'].includes(c.value ?? '') ? `${IMG}portraits/${look}.webp` : null
})
const crossClass = computed(() => {
  const seen = new Set<string>()
  const out = []
  for (const s of skills.value) for (const p of partnersOf(s, 6)) {
    if (p.b.cls === c.value || seen.has(p.b.id)) continue
    seen.add(p.b.id)
    out.push(p)
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 10)
})
</script>

<template>
  <div v-if="c" class="page wrap" :style="{ '--c': CLASSES[c].color }">
    <a href="#/classes" class="small">← All classes</a>
    <section class="panel head">
      <img v-if="portrait" class="portrait" :src="portrait" alt="" />
      <img v-else class="portrait icon" :src="classIcon(c)" alt="" />
      <div>
        <h1 class="display" :style="{ color: CLASSES[c].color }">{{ className(c) }}</h1>
        <p class="lead">{{ classDesc(c) }}</p>
        <div class="row">
          <span class="chip" v-if="CLASSES[c].faction !== 'none'">{{ factionName(CLASSES[c].faction) }} — friendly standing (+2) = 20% off its trainers</span>
          <span class="chip">{{ CLASSES[c].novel ? 'Novel archetype' : 'Classic archetype' }}</span>
        </div>
      </div>
    </section>

    <div class="section-title"><h2>Where to learn it</h2></div>
    <div class="grid g3">
      <div v-for="t in teachersOf(c)" :key="t.npc + t.place" class="panel tight">
        <div class="display gn">{{ npcName(t.npc) }}</div>
        <div class="muted">{{ placeName(t.place) }} <span class="dim">· from ~level {{ t.at }}</span></div>
        <div v-if="t.how" class="small dim">{{ t.how }}</div>
        <span v-if="t.secret" class="chip" style="margin-top:6px">🗝 Secret</span>
      </div>
    </div>

    <div class="section-title"><h2>Skill tree</h2><span class="dim small">by level requirement</span></div>
    <div class="tree panel">
      <div v-for="s in skills" :key="s.id" class="node">
        <div class="lv display">{{ s.level }}</div>
        <SkillIcon :id="s.id" :size="60" />
        <div class="body">
          <div class="row between">
            <h3 class="display">{{ skillName(s) }}</h3>
            <span class="dim small">{{ s.kind }} · {{ skillCost(s) }} gold</span>
          </div>
          <p>{{ skillDesc(s) }}</p>
          <div class="row small dim">
            <span v-for="(v, a) in s.req" :key="a" :class="'attr-' + a">{{ v }} {{ ATTR_SHORT[a as Attr] }}</span>
            <span v-if="s.kind === 'active'">· {{ s.cd }}s cooldown</span>
            <span v-if="s.mana">· {{ s.mana }} mana</span>
            <span v-if="s.hpCost" class="warn">· {{ s.hpCost }}% health</span>
            <span v-if="scalingOf(s)" :class="'attr-' + scalingOf(s)">· scales with {{ ATTR_NAME[scalingOf(s)!] }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section-title"><h2>Best cross-class partners</h2><a href="#/combos">Combo Lab →</a></div>
    <div class="grid g2">
      <div v-for="p in crossClass" :key="p.a.id + p.b.id" class="panel tight pair">
        <SkillIcon :id="p.a.id" :size="42" /><span class="plus">+</span><SkillIcon :id="p.b.id" :size="42" />
        <div class="small"><b>{{ skillName(p.a) }} + {{ skillName(p.b) }}</b> <span class="dim">({{ className(p.b.cls) }})</span><div class="muted">{{ p.why[0] }}</div></div>
      </div>
    </div>

    <template v-if="builds.length">
      <div class="section-title"><h2>Builds using {{ className(c) }}</h2></div>
      <div class="grid g3"><BuildCard v-for="b in builds" :key="b.id" :build="b" /></div>
    </template>
  </div>
</template>

<style scoped>
.head { display: flex; gap: 24px; align-items: center; margin: 12px 0; background: radial-gradient(500px 260px at 0% 50%, color-mix(in srgb, var(--c) 30%, transparent), transparent), var(--panel); }
.portrait { width: 180px; height: 180px; object-fit: contain; flex: none; filter: drop-shadow(0 8px 18px rgba(0,0,0,.7)); }
.portrait.icon { width: 130px; height: 130px; }
.lead { font-size: 18px; }
.gn { font-size: 19px; color: var(--c); }
.tree { position: relative; }
.node { display: flex; gap: 16px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid var(--line2); }
.node:last-child { border-bottom: 0; }
.lv { width: 40px; text-align: center; font-size: 24px; color: var(--c); flex: none; padding-top: 12px; }
.body { flex: 1; }
.body h3 { margin: 0; }
.body p { margin: 4px 0; }
@media (max-width: 680px) { .head { flex-direction: column; text-align: center; } .portrait { width: 110px; height: 110px; } .node { gap: 10px; } .lv { width: 26px; font-size: 18px; } .pair { flex-wrap: wrap; } }
.body, .pair > div { min-width: 0; }
@media (max-width: 680px) { .head > div { width: 100%; min-width: 0; } .head { padding: 14px; } }
.pair { display: flex; align-items: center; gap: 10px; }
.plus { font-family: var(--display); color: var(--gold); font-size: 20px; }
</style>
