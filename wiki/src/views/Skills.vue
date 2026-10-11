<script setup lang="ts">
import { computed, ref } from 'vue'
import { SKILLS, CLASS_IDS, CLASSES, ATTRS, ATTR_SHORT, ATTR_COLOR, className, classIcon, skillName, skillDesc, skillCost, scalingOf, type ClassId, type Attr } from '../data'
import { tagsOf, TAG_LABEL, TAG_COLOR, type Tag } from '../synergy'
import SkillIcon from '../components/SkillIcon.vue'

const q = ref('')
const cls = ref<ClassId | ''>('')
const kind = ref<'' | 'active' | 'passive'>('')
const attr = ref<Attr | ''>('')
const tag = ref<Tag | ''>('')
const sort = ref<'level' | 'name' | 'cd' | 'class'>('level')
const allTags = [...new Set(SKILLS.flatMap(tagsOf))].sort()
const list = computed(() => SKILLS.filter(s =>
  (!cls.value || s.cls === cls.value) && (!kind.value || s.kind === kind.value) &&
  (!attr.value || attr.value in s.req) && (!tag.value || tagsOf(s).includes(tag.value)) &&
  (!q.value || (skillName(s) + ' ' + skillDesc(s)).toLowerCase().includes(q.value.toLowerCase())))
  .sort((a, b) => sort.value === 'name' ? skillName(a).localeCompare(skillName(b)) : sort.value === 'cd' ? a.cd - b.cd
    : sort.value === 'class' ? CLASS_IDS.indexOf(a.cls) - CLASS_IDS.indexOf(b.cls) || a.level - b.level : a.level - b.level))
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">Skill Database</h1>
    <p class="muted">All {{ SKILLS.length }} skills of the sixteen classes. Hover an icon for the full card.</p>
    <div class="panel tight filters">
      <div class="row">
        <input type="search" v-model="q" placeholder="Search name or effect… (e.g. “freeze”, “minion”)" style="flex:1;min-width:260px" />
        <select v-model="sort"><option value="level">Sort: level</option><option value="name">Sort: name</option><option value="cd">Sort: cooldown</option><option value="class">Sort: class</option></select>
      </div>
      <div class="row">
        <button v-for="c in CLASS_IDS" :key="c" class="cb" :class="{ on: cls === c }" :title="className(c)" :style="{ '--c': CLASSES[c].color }" @click="cls = cls === c ? '' : c"><img :src="classIcon(c)" alt="" /></button>
        <button class="chip" :class="{ on: kind === 'active' }" @click="kind = kind === 'active' ? '' : 'active'">Actives</button>
        <button class="chip" :class="{ on: kind === 'passive' }" @click="kind = kind === 'passive' ? '' : 'passive'">Passives</button>
        <button v-for="a in ATTRS" :key="a" class="chip" :class="{ on: attr === a }" :style="{ color: ATTR_COLOR[a] }" @click="attr = attr === a ? '' : a">{{ ATTR_SHORT[a] }}</button>
      </div>
      <div class="row">
        <button v-for="t in allTags" :key="t" class="chip" :class="{ on: tag === t }" :style="{ color: TAG_COLOR[t] }" @click="tag = tag === t ? '' : t">{{ TAG_LABEL[t] }}</button>
      </div>
    </div>
    <p class="dim small">{{ list.length }} skills</p>
    <table class="data panel">
      <thead><tr><th></th><th>Skill</th><th>Class</th><th>Lv</th><th>Needs</th><th>Effect</th><th>CD</th><th>Cost</th></tr></thead>
      <tbody>
        <tr v-for="s in list" :key="s.id">
          <td><SkillIcon :id="s.id" :size="40" /></td>
          <td><b>{{ skillName(s) }}</b><div class="dim small">{{ s.kind }}<span v-if="scalingOf(s)" :class="'attr-' + scalingOf(s)"> · {{ ATTR_SHORT[scalingOf(s)!] }}</span></div></td>
          <td><a :href="'#/classes/' + s.cls" :style="{ color: CLASSES[s.cls].color }">{{ className(s.cls) }}</a></td>
          <td class="display">{{ s.level }}</td>
          <td class="small nowrap"><span v-for="(v, a) in s.req" :key="a" :class="'attr-' + a">{{ v }} {{ ATTR_SHORT[a as Attr] }} </span></td>
          <td class="small">{{ skillDesc(s) }}</td>
          <td class="small nowrap">{{ s.kind === 'active' ? s.cd + 's' : '—' }}</td>
          <td class="small nowrap">{{ s.hpCost ? s.hpCost + '% HP' : s.mana ? s.mana + ' MP' : '—' }}<div class="dim">{{ skillCost(s) }}g</div></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.filters { display: grid; gap: 10px; margin: 16px 0 10px; }
.cb { width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--line2); background: rgba(0,0,0,.3); cursor: pointer; padding: 3px; }
.cb img { width: 100%; height: 100%; object-fit: contain; }
.cb.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 25%, transparent); }
table.panel { padding: 0; }
.nowrap { white-space: nowrap; }
</style>
