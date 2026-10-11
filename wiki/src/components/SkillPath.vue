<script setup lang="ts">
import { computed } from 'vue'
import { skillPath, type Plan } from '../planner'
import { skillName, skillCost, npcName, placeName, ATTRS, ATTR_SHORT, ATTR_COLOR, CLASSES } from '../data'
import SkillIcon from './SkillIcon.vue'

const props = defineProps<{ plan: Plan }>()
const steps = computed(() => skillPath(props.plan))
const gold = computed(() => steps.value.reduce((s, x) => s + skillCost(x.skill), 0))
</script>

<template>
  <div>
    <p class="muted small">Generated from the build: spending your points toward the final split evenly, this is the first level each skill's level AND attribute bars are met — and the first trainer you can reach by then. Total trainer cost before discounts: <b class="gold-text">{{ gold.toLocaleString() }} gold</b>.</p>
    <ol class="path">
      <li v-for="st in steps" :key="st.skill.id" :style="{ '--c': CLASSES[st.skill.cls].color }">
        <div class="lv display">{{ st.level }}</div>
        <SkillIcon :id="st.skill.id" :size="44" />
        <div class="info">
          <div class="nm">{{ skillName(st.skill) }} <span class="dim small">· {{ st.skill.kind }}</span></div>
          <div class="small muted" v-if="st.teacher">
            {{ npcName(st.teacher.npc) }} — {{ placeName(st.teacher.place) }}
            <span v-if="st.teacher.how" class="dim"> · {{ st.teacher.how }}</span>
          </div>
          <div class="small dim">At that level: <span v-for="a in ATTRS" :key="a" class="at" :style="{ color: ATTR_COLOR[a] }">{{ ATTR_SHORT[a] }} {{ st.attrsAt[a] }}</span></div>
        </div>
        <div class="cost small dim">{{ skillCost(st.skill) }}g</div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.path { list-style: none; padding: 0; margin: 0; position: relative; }
.path::before { content: ''; position: absolute; left: 21px; top: 10px; bottom: 10px; width: 2px; background: linear-gradient(var(--gold), transparent); opacity: .4; }
.path li { display: flex; align-items: center; gap: 14px; padding: 8px 0; position: relative; }
.lv { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: #1a1426; box-shadow: inset 0 0 0 2px var(--c); font-size: 18px; flex: none; z-index: 1; }
.info { flex: 1; min-width: 0; }
.nm { font-weight: 800; }
.cost { flex: none; }
.at { margin-right: 8px; }
</style>
