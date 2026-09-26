import { reactive, ref } from 'vue'
import { profile, saveProfile, equipped, markTip } from '@/game/state/profile'
import { upgradeCost } from '@/game/data/items'

/**
 * ─── The upgrade tour (first return to the lab) ──────────────────────────────
 *
 * The hub has four tabs and a Workshop full of rows, prices and stats — too
 * much to take in at once for a player back from their first mission. So the
 * first time they come home, a guide walks them through the one loop that
 * matters: bolts in, gear up.
 *
 *   workshop       → tap the Workshop tab
 *   upgradeBuster  → upgrade the buster (weapon: damage)
 *   pickArmor      → select the chest armour (defence)
 *   upgradeArmor   → upgrade it
 *   deploy         → back to Missions
 *
 * Wordless: a hand (a cursor on desktop) is on the target from each step's
 * first frame and taps; everything else is dimmed and inert, but a press
 * there makes the live target pulse, so the tour never reads as a lock-up
 * (`HubLesson.vue`). Each step ends on the game's own state (the tab open,
 * the level up), never on a timer. It runs once per profile
 * (`tips['lesson:upgrade']`); a player who has already upgraded something
 * skips it, and a close button ends it any time.
 */

export type HubTab = 'missions' | 'hero' | 'circuits' | 'workshop'
export type HubStep = 'workshop' | 'upgradeBuster' | 'pickArmor' | 'upgradeArmor' | 'deploy'

export const HUB_STEPS: HubStep[] = ['workshop', 'upgradeBuster', 'pickArmor', 'upgradeArmor', 'deploy']
const DONE_KEY = 'lesson:upgrade'
const GRANT_KEY = 'lesson:upgradeGrant'

/** The hub's open tab (HubScreen binds it; the tour reads it). */
export const hubTab = ref<HubTab>('missions')
/** The Workshop's selected item id (WorkshopTab binds it). */
export const workshopSel = ref<string | null>(null)

export const hubLesson = reactive({
  step: null as HubStep | null,
  /** Upgrade levels of the buster and the chest armour when the tour began. */
  busterBase: 0,
  armorBase: 0,
  /** Bolts added so the tour's two upgrades are affordable (shown as +N). */
  granted: 0
})

/** The first return to the lab, for a player who never upgraded anything. */
export const wantsHubLesson = (): boolean => {
  if (profile.tips[DONE_KEY]) return false
  if (profile.stats.missions < 1) return false
  if (profile.inv.items.some(it => it.upg > 0)) {
    // Already found the Workshop on their own: nothing to teach.
    markTip(DONE_KEY)
    return false
  }
  return !!equipped('buster') && !!equipped('chest')
}

/** Begin the tour. Tops the wallet up once, so a short first mission never
 *  leaves the upgrade button greyed out in the middle of the lesson. */
export const startHubLesson = (): void => {
  const b = equipped('buster')
  const c = equipped('chest')
  if (!b || !c) return
  hubLesson.busterBase = b.upg
  hubLesson.armorBase = c.upg
  if (!profile.tips[GRANT_KEY]) {
    const need = upgradeCost(b) + upgradeCost(c)
    const short = Math.max(0, need - profile.bolts)
    profile.tips[GRANT_KEY] = true
    if (short > 0) {
      profile.bolts += short
      hubLesson.granted = short
    }
    saveProfile()
  }
  hubLesson.step = 'workshop'
  syncHubLesson()
}

/**
 * The step follows from the game's state, never from a timer: which of the
 * two upgrades are done, which tab is open, which item is selected. Called
 * whenever any of those change, so a player who side-steps (opens another
 * tab, re-selects the buster) is simply guided back.
 */
export const syncHubLesson = (): void => {
  if (!hubLesson.step) return
  const b = equipped('buster')
  const c = equipped('chest')
  if (!b || !c) { endHubLesson(); return }
  const inShop = hubTab.value === 'workshop'
  if (b.upg <= hubLesson.busterBase) {
    hubLesson.step = inShop ? 'upgradeBuster' : 'workshop'
    // The upgrade button acts on the selection: keep it on the buster.
    if (inShop && workshopSel.value !== b.id) workshopSel.value = b.id
  } else if (c.upg <= hubLesson.armorBase) {
    hubLesson.step = !inShop ? 'workshop' : workshopSel.value === c.id ? 'upgradeArmor' : 'pickArmor'
  } else if (hubTab.value === 'missions') {
    endHubLesson()
  } else {
    hubLesson.step = 'deploy'
  }
}

/** Finished (or closed): never again for this profile. */
export const endHubLesson = (): void => {
  hubLesson.step = null
  hubLesson.granted = 0
  markTip(DONE_KEY)
}

/** Where each step points: a `data-lesson` anchor in the hub's DOM. */
export const stepTarget = (s: HubStep): string => {
  switch (s) {
    case 'workshop': return '[data-lesson="tab-workshop"]'
    case 'upgradeBuster':
    case 'upgradeArmor': return '[data-lesson="upgrade"]'
    case 'pickArmor': return '[data-lesson="armor"]'
    case 'deploy': return '[data-lesson="tab-missions"]'
  }
}
