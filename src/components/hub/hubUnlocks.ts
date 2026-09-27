import type { Profile } from '@/game/state/profile'

/**
 * ─── The lab's menus open one at a time ──────────────────────────────────────
 *
 * Four tabs, a leaderboard and a Workshop full of prices are too much for a
 * player back from their first mission. So the lab starts with Missions and
 * Flux, and every further menu opens after a number of SUCCESSFULLY finished
 * missions (the tutorial counts; deaths and retreats do not):
 *
 *   missions, hero  → always
 *   workshop        → 2
 *   circuits        → 3
 *   leaderboard     → 4   (the top-bar pill)
 *
 * A locked menu stays on screen, dimmed, with a lock and a hint that says how
 * many missions are left (`HubScreen.vue`). The settings cog is never locked,
 * and the level, XP and Bolts are status, not menus.
 *
 * Everything here is pure: it reads a profile and returns an answer. The
 * one-time writes (the legacy floor, the "new" badge's flags) are
 * `HubScreen.vue`'s, through `profile.tips`.
 */

export type HubTab = 'missions' | 'hero' | 'circuits' | 'workshop'
export type HubMenu = HubTab | 'leaderboard'

/** The unlock table, in the order the menus open. */
export const HUB_UNLOCKS: ReadonlyArray<{ id: HubMenu; need: number }> = [
  { id: 'missions', need: 0 },
  { id: 'hero', need: 0 },
  { id: 'workshop', need: 2 },
  { id: 'circuits', need: 3 },
  { id: 'leaderboard', need: 4 }
]

/** Missions a menu needs finished before it opens. */
export const needFor = (id: HubMenu): number => HUB_UNLOCKS.find(m => m.id === id)?.need ?? 0
/** The count at which every menu is open. */
export const ALL_OPEN = Math.max(...HUB_UNLOCKS.map(m => m.need))

export const isUnlocked = (id: HubMenu, finished: number): boolean => finished >= needFor(id)
/** How many more missions a locked menu waits for (0 once it is open). */
export const missionsLeft = (id: HubMenu, finished: number): number => Math.max(0, needFor(id) - finished)

/** What the rules read from a profile (the live `profile` fits it). */
export type UnlockProfile = Pick<Profile, 'questsDone' | 'story' | 'tips'> & {
  world: Pick<Profile['world'], 'bosses' | 'tutorialDone'>
  inv: { items: ReadonlyArray<{ upg: number }> }
  hero: Pick<Profile['hero'], 'skills'>
  stats: Pick<Profile['stats'], 'lastDropAt'>
}

/**
 * Successfully finished missions. `questsDone` (`ma_quests_done`) is the
 * counter: `finishMission` bumps it on a success only, the tutorial included.
 * The story is a floor under it, since every beaten Core Master and the
 * finished tutorial were successes too, so a save whose counter is missing or
 * behind still counts those.
 */
export const finishedMissions = (p: UnlockProfile): number => Math.max(
  p.questsDone || 0,
  p.story || 0,
  p.world.bosses.length,
  p.world.tutorialDone ? 1 : 0
)

// ─── Players from before the unlocks ─────────────────────────────────────────

/** `profile.tips` key: the unlock floor, decided on the first lab visit under
 *  these rules (a number: `ALL_OPEN` for a returning player, else 0). */
export const FLOOR_TIP = 'menu:floor'
/** `profile.tips` keys: a menu's unlock was announced (sfx, "new" badge) /
 *  the player has opened it since (the badge is gone). */
export const unlockedTip = (id: HubMenu): string => `menu:${id}:unlocked`
export const openedTip = (id: HubMenu): string => `menu:${id}:opened`

/**
 * The save has been in the old lab, where every menu was open from the first
 * visit: the upgrade tour ran or was skipped (`hubLesson.ts`'s two tips), an
 * item was upgraded, a circuit ranked, or a Workshop supply drop claimed.
 * Under the new rules none of these can happen before the Workshop opens, so
 * it is read once, on the first lab visit, and kept as the floor
 * (`FLOOR_TIP`).
 */
export const usedOldLab = (p: UnlockProfile): boolean =>
  !!p.tips['lesson:upgrade'] || !!p.tips['lesson:upgradeGrant'] ||
  p.inv.items.some(it => it.upg > 0) ||
  Object.values(p.hero.skills).some(r => r > 0) ||
  (p.stats.lastDropAt || 0) > 0

/** A returning player keeps every menu they had; a new one starts at 0. */
export const unlockFloor = (p: UnlockProfile): number => {
  const f = p.tips[FLOOR_TIP]
  if (typeof f === 'number') return f
  return usedOldLab(p) ? ALL_OPEN : 0
}

/** The count the menus unlock by. */
export const unlockCount = (p: UnlockProfile): number => Math.max(finishedMissions(p), unlockFloor(p))

/** Open now, announced, and not opened since: it wears the "new" badge. */
export const isFresh = (p: UnlockProfile, id: HubMenu): boolean =>
  isUnlocked(id, unlockCount(p)) && !!p.tips[unlockedTip(id)] && !p.tips[openedTip(id)]

/** Menus (of `ids`) that are open and whose unlock has not been announced yet. */
export const toAnnounce = (p: UnlockProfile, ids: readonly HubMenu[]): HubMenu[] => {
  const n = unlockCount(p)
  return ids.filter(id => needFor(id) > 0 && isUnlocked(id, n) && !p.tips[unlockedTip(id)])
}

// ─── The lock hint's spot ────────────────────────────────────────────────────

export interface Box { left: number; top: number; width: number; height: number }
export interface Insets { top: number; right: number; bottom: number; left: number }

/** Space kept between the hint and the screen's (safe) edge, and its control. */
const EDGE = 8
const GAP = 8

/**
 * Where the lock hint goes: centred above its control, or under it when there
 * is no room above (the top-bar pill), and always clamped inside the safe
 * area, so a tab in a phone's corner never pushes it off screen. `arrow` is
 * the control's centre along the hint, for its pointer.
 */
export const placeTip = (
  anchor: Box, tip: { width: number; height: number }, view: { width: number; height: number }, safe: Insets
): { x: number; y: number; below: boolean; arrow: number } => {
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi))
  const cx = anchor.left + anchor.width / 2
  const x = clamp(cx - tip.width / 2, safe.left + EDGE, view.width - safe.right - EDGE - tip.width)
  const above = anchor.top - GAP - tip.height
  const below = above < safe.top + EDGE
  const y = clamp(below ? anchor.top + anchor.height + GAP : above, safe.top + EDGE, view.height - safe.bottom - EDGE - tip.height)
  return { x, y, below, arrow: clamp(cx - x, 12, tip.width - 12) }
}
