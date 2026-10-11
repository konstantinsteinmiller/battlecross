<script setup lang="ts">
import { ERRANDS, CAGES, CLASSES, ZONE_IDS, ZONE_FEATURES, classIcon, className, npcName, zoneName, enemyName, plantName, PLANTS, type ClassId } from '../data'
import ItemIcon from '../components/ItemIcon.vue'

const test = (id: string) => ERRANDS.find(e => e.id === id)!
const steps = (id: string): string[] => test(id).steps.map(s => s.kind === 'slay' ? `Defeat ${s.n} ${enemyName(s.enemy!)} in ${zoneName(s.place!)}` : s.kind === 'gather' ? `Bring ${s.n} ${plantName(s.plant!)}` : `Talk to ${npcName(s.npc!)}`)
const where = (plant: string): string => {
  const p = PLANTS.find(x => x.id === plant)
  return p ? Object.keys(p.habitat).map(zoneName).join(', ') : ''
}
const SECRET4: { cls: ClassId; master: string; test: string; plant: string }[] = [
  { cls: 'windrunner', master: 'sbMasterWindrunner', test: 'windrunnerTest', plant: 'swiftfern' },
  { cls: 'frostwarden', master: 'sbMasterFrostwarden', test: 'frostwardenTest', plant: 'frostmint' },
  { cls: 'lightbringer', master: 'sbMasterLightbringer', test: 'lightbringerTest', plant: 'sunpetal' },
  { cls: 'beastcaller', master: 'sbMasterBeastcaller', test: 'beastcallerTest', plant: 'moonbell' }
]
const cageFor = (c: ClassId) => CAGES.find(x => x.found === 'found' + c[0]!.toUpperCase() + c.slice(1))
const champions = ZONE_IDS.map(z => ({ z, f: ZONE_FEATURES[z] }))
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">Secrets</h1>
    <p class="muted lead">Spoilers ahead. Everything the game does not tell you: four hidden masters, two hidden teachers, two traders without a sign, six cages, a secret chest with the best ring in the game — and the over-levelled champions that wander the zones.</p>

    <div class="section-title"><h2>The secret four masters</h2><span class="dim small">all in Silverbridge, disguised as townsfolk</span></div>
    <div class="grid g2">
      <div v-for="s in SECRET4" :key="s.cls" class="panel sec" :style="{ '--c': CLASSES[s.cls].color }">
        <div class="row">
          <img :src="classIcon(s.cls)" class="ci" alt="" />
          <div><h3 class="display" :style="{ color: CLASSES[s.cls].color }">{{ className(s.cls) }}</h3><div class="small muted">{{ npcName(s.master) }} — a face in the Silverbridge street until you talk to them</div></div>
        </div>
        <h4>Route A — the master's test</h4>
        <ol class="small"><li v-for="x in steps(s.test)" :key="x">{{ x }}</li></ol>
        <div class="small dim">{{ plantName(s.plant) }} grows in: {{ where(s.plant) }}</div>
        <template v-if="cageFor(s.cls)">
          <h4>Route B — free the disciple</h4>
          <p class="small">Open the iron cage in <b>{{ zoneName(cageFor(s.cls)!.zone) }}</b> (the key glints somewhere in the zone). {{ npcName(cageFor(s.cls)!.npc) }} then teaches the whole class in {{ zoneName(cageFor(s.cls)!.town) }} — and the master in Silverbridge opens too, no test needed.</p>
        </template>
        <a :href="'#/classes/' + s.cls" class="small">Skill tree →</a>
      </div>
    </div>

    <div class="section-title"><h2>The hidden teachers</h2></div>
    <div class="grid g2">
      <div class="panel sec" :style="{ '--c': CLASSES.chrono.color }">
        <div class="row"><img :src="classIcon('chrono')" class="ci" alt="" /><h3 class="display" :style="{ color: CLASSES.chrono.color }">Chrono-Weaver</h3></div>
        <p class="small">The <b>Keeper of Hours</b> waits at the end of the <b>Sunken Temple</b> once you clear it. If you <b>slay the oracle</b>, the Keeper flees to <b>Dragon's Peak</b> instead. Meeting the Keeper also brings Clockwarden Selwyn to his hall in Silverbridge.</p>
      </div>
      <div class="panel sec" :style="{ '--c': CLASSES.blood.color }">
        <div class="row"><img :src="classIcon('blood')" class="ci" alt="" /><h3 class="display" :style="{ color: CLASSES.blood.color }">Blood Alchemist</h3></div>
        <p class="small"><b>Doctor Sangrel</b> hides in the <b>Citadel of the Void</b> (found after clearing it). The shortcut: <b>betray Oakhaven</b> to the Syndicate at the Siege — Sangrel then teaches in the ruined chapel from around level 10. Meeting him brings Vesper Crimsonleaf to Silverbridge.</p>
      </div>
    </div>

    <div class="section-title"><h2>The traders without a sign</h2></div>
    <div class="grid g2">
      <div class="panel sec" style="--c:#c58cff">
        <h3 class="display">Alder Vane, the Collector</h3>
        <p class="small muted">A townhouse on the south street of Silverbridge.</p>
        <ol class="small"><li v-for="x in steps('collectorFavor')" :key="x">{{ x }}</li></ol>
        <p class="small">Reward: 250 gold, and his shop opens for good — <b>Rare & Epic weapons, off-hands and trinkets</b>, Heroic on the rare shelf.</p>
      </div>
      <div class="panel sec" style="--c:#c58cff">
        <h3 class="display">Mirela Thorne, the Fence</h3>
        <p class="small muted">In the street at the far east end of Silverbridge.</p>
        <ol class="small"><li v-for="x in steps('mirelaFavor')" :key="x">{{ x }}</li></ol>
        <p class="small">Reward: 200 gold, and her stall opens — <b>Rare & Epic helmets, armour, gloves and boots</b>, Heroic on the rare shelf.</p>
      </div>
    </div>

    <div class="section-title"><h2>The secret chest</h2></div>
    <div class="panel row sec" style="--c:#ffd84a">
      <ItemIcon id="ringOfAbsolutePower" :size="84" />
      <p>The <b>Dread Fortress</b> has a side clearing with a secret chest. Inside: the <b>Ring of Absolute Power</b> — every attribute, +15% damage dealt and +15% damage reduction. It is in nearly every guide build for a reason.</p>
    </div>

    <div class="section-title"><h2>Champions</h2><span class="dim small">rare over-levelled elites, worth double</span></div>
    <table class="data panel">
      <thead><tr><th>Zone</th><th>Champion</th><th>Levels above the zone</th><th>Chance per visit</th><th>Puzzle plates</th></tr></thead>
      <tbody><tr v-for="c in champions" :key="c.z"><td>{{ zoneName(c.z) }}</td><td>{{ enemyName(c.f.championKind) }}</td><td>+{{ c.f.championLevels[0] }}–{{ c.f.championLevels[1] }}</td><td>{{ Math.round(c.f.champion * 100) }}%</td><td>{{ c.f.plates ? c.f.plates + ' plates, ' + Math.round(c.f.puzzle * 100) + '%' : '—' }}</td></tr></tbody>
    </table>
  </div>
</template>

<style scoped>
.lead { max-width: 900px; }
.sec { border-color: color-mix(in srgb, var(--c) 45%, transparent); background: radial-gradient(500px 200px at 0 0, color-mix(in srgb, var(--c) 18%, transparent), transparent), var(--panel); }
.ci { width: 54px; height: 54px; object-fit: contain; }
.sec h3 { margin: 0; }
h4 { margin: 12px 0 4px; font-size: 15px; color: var(--gold); }
ol { margin: 4px 0; padding-left: 20px; }
table.panel { padding: 0; }
</style>
