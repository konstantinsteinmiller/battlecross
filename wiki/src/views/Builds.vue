<script setup lang="ts">
import { computed, ref } from 'vue'
import { BUILDS } from '../builds'
import { CLASS_IDS, className, classIcon, type ClassId } from '../data'
import BuildCard from '../components/BuildCard.vue'

const roles = [...new Set(BUILDS.flatMap(b => b.roles))].sort()
const role = ref('')
const cls = ref<ClassId | ''>('')
const multi = ref(false)
const list = computed(() => BUILDS.filter(b =>
  (!role.value || b.roles.includes(role.value)) &&
  (!cls.value || b.classes.includes(cls.value)) &&
  (!multi.value || b.classes.length > 1)))
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">Build Guides</h1>
    <p class="muted lead">Finished level-30 builds in the spirit of the classic ARPG guides: the attribute split, the bar, the gear, the story choices — and a skill path generated from the game data showing which skill you learn at which level, from which trainer. Every build opens in the planner for you to tweak.</p>

    <div class="panel tight filters">
      <div class="row">
        <span class="dim small">Role</span>
        <button class="chip" :class="{ on: !role }" @click="role = ''">All</button>
        <button v-for="r in roles" :key="r" class="chip" :class="{ on: role === r }" @click="role = role === r ? '' : r">{{ r }}</button>
      </div>
      <div class="row">
        <span class="dim small">Class</span>
        <button v-for="c in CLASS_IDS" :key="c" class="cbtn" :class="{ on: cls === c }" :title="className(c)" @click="cls = cls === c ? '' : c">
          <img :src="classIcon(c)" :alt="className(c)" />
        </button>
        <button class="chip" :class="{ on: multi }" @click="multi = !multi">Multi-class only</button>
      </div>
    </div>

    <div class="grid g3">
      <BuildCard v-for="b in list" :key="b.id" :build="b" />
    </div>
    <p v-if="!list.length" class="muted">No build matches — <a href="#/planner">make your own</a>.</p>
  </div>
</template>

<style scoped>
.lead { max-width: 860px; font-size: 16.5px; }
.filters { margin: 18px 0 22px; display: grid; gap: 10px; }
.cbtn { width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--line2); background: rgba(0,0,0,.3); cursor: pointer; padding: 3px; }
.cbtn img { width: 100%; height: 100%; object-fit: contain; }
.cbtn.on { border-color: var(--gold); background: rgba(255,216,74,.18); }
</style>
