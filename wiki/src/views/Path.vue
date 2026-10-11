<script setup lang="ts">
import { computed, ref } from 'vue'
import { SKILLS, ZONES, ZONE_IDS, QUESTS, CAGES, TEACHERS, MAX_LEVEL, CLASS_IDS, CLASSES, xpToReach, zoneName, npcName, placeName, className, classIcon, t, type ClassId } from '../data'
import SkillIcon from '../components/SkillIcon.vue'

const cls = ref<ClassId | ''>('')
const levels = computed(() => Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map(L => ({
  L,
  xp: xpToReach(L),
  skills: SKILLS.filter(s => s.level === L && (!cls.value || s.cls === cls.value)),
  zones: ZONE_IDS.filter(z => ZONES[z].min === L),
  quests: QUESTS.filter(q => ZONES[q.node as keyof typeof ZONES]?.max === L),
  cages: CAGES.filter(c => ZONES[c.zone].min === L),
  teachers: TEACHERS.filter(x => x.at === L && x.secret && (!cls.value || x.cls === cls.value))
})).filter(r => r.skills.length || r.zones.length || r.quests.length || r.cages.length || r.teachers.length))
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">Leveling Path</h1>
    <p class="muted lead">Level 1 to 30 at a glance: when each zone opens, when every skill's level requirement is met, where the hidden teachers and caged disciples are, and when the six fateful choices come. Filter by class to see only its skills.</p>
    <div class="row" style="margin:14px 0">
      <button class="chip" :class="{ on: !cls }" @click="cls = ''">All classes</button>
      <button v-for="c in CLASS_IDS" :key="c" class="cb" :class="{ on: cls === c }" :title="className(c)" :style="{ '--c': CLASSES[c].color }" @click="cls = cls === c ? '' : c"><img :src="classIcon(c)" alt="" /></button>
    </div>
    <div class="timeline">
      <div v-for="r in levels" :key="r.L" class="lv">
        <div class="badge"><span class="display">{{ r.L }}</span><span class="dim xp">{{ r.xp.toLocaleString() }} xp</span></div>
        <div class="panel tight content">
          <div v-if="r.zones.length" class="line">🗺 <b>Zone opens:</b> <a v-for="z in r.zones" :key="z" href="#/atlas" class="zl">{{ zoneName(z) }} <span class="dim">({{ ZONES[z].min }}–{{ ZONES[z].max }})</span></a></div>
          <div v-for="q in r.quests" :key="q.id" class="line">⚖ <b>Fateful choice:</b> <a href="#/quests">{{ t(`quest.${q.id}.title`) }}</a> <span class="dim">at the end of {{ zoneName(q.node) }}</span></div>
          <div v-for="c in r.cages" :key="c.zone" class="line">🗝 <b>Cage:</b> someone is locked up in {{ zoneName(c.zone) }} — find the key; they move to {{ zoneName(c.town) }}</div>
          <div v-for="x in r.teachers" :key="x.npc + x.place" class="line">✦ <b>Hidden teacher:</b> {{ npcName(x.npc) }} ({{ className(x.cls) }}) — {{ placeName(x.place) }}</div>
          <div v-if="r.skills.length" class="skills">
            <SkillIcon v-for="s in r.skills" :key="s.id" :id="s.id" :size="42" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lead { max-width: 900px; }
.cb { width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--line2); background: rgba(0,0,0,.3); cursor: pointer; padding: 3px; }
.cb img { width: 100%; height: 100%; object-fit: contain; }
.cb.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 25%, transparent); }
.timeline { position: relative; }
.timeline::before { content: ''; position: absolute; left: 39px; top: 0; bottom: 0; width: 3px; background: linear-gradient(var(--gold), var(--skl), var(--bad)); opacity: .5; border-radius: 3px; }
.lv { display: flex; gap: 18px; margin-bottom: 12px; align-items: flex-start; }
.badge { width: 80px; flex: none; display: flex; flex-direction: column; align-items: center; position: relative; }
.badge .display { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; font-size: 22px; background: radial-gradient(circle at 40% 30%, #ffe680, #e08a1c); color: #3a1d00; box-shadow: 0 4px 14px rgba(255,170,40,.35); }
.xp { font-size: 10.5px; margin-top: 3px; }
.content { flex: 1; }
.line { margin-bottom: 4px; }
.zl { margin-right: 10px; }
.skills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
</style>
