// ─── Game-state field catalogue ─────────────────────────────────────────────
//
// Field names INSIDE the single `bcross_state` blob (see `useGameState.ts`).
// These are NOT separate localStorage keys — they are properties of the one
// persisted object — but they are still a contract with the player base:
// renaming any of them strands existing players' progress on the old field.
// Treat them as load-bearing constants.
//
// Everything is `bc_`-prefixed (`STATE_FIELD_PREFIX`) so
// `SaveMergePolicy.isPayloadKey` can allowlist the whole surface with a single
// prefix.

// ─── Headline progress (flat numbers the save-merge score reads) ───────────
//
// Kept as flat numeric fields rather than buried inside `bc_hero` because the
// save layer scores two snapshots against each other WITHOUT knowing anything
// about the game's object shapes (`SaveMergePolicy.computeMeta`), and a portal
// plugin (GamePix) reports two of them as score/level.

/** Hero level, 1-based. */
export const LEVEL_KEY = 'bc_level'
/** Story progress: number of world-map zones cleared at least once. */
export const STORY_KEY = 'bc_story'
/** Lifetime zone runs won plus quests resolved. */
export const QUESTS_DONE_KEY = 'bc_quests_done'
/** Gold — the single currency. */
export const GOLD_KEY = 'bc_gold'

// ─── Structured progress ────────────────────────────────────────────────────

/** `HeroSave` — xp, the six attributes, learned skills, the loadout. */
export const HERO_KEY = 'bc_hero'
/** `InventorySave` — owned items, the five equipment slots, potions. */
export const INVENTORY_KEY = 'bc_inventory'
/** `QuestSave` — quest stages, the choices made, faction reputation. */
export const QUESTS_KEY = 'bc_quests'
/** `WorldSave` — cleared and unlocked nodes, world-state flags, trainers met. */
export const WORLD_KEY = 'bc_world'
/** `StatsSave` — lifetime kills, deaths, play time, lifetime XP. */
export const STATS_KEY = 'bc_stats'
/** `Record<string, true | number>` — one-time flags and the control coach's
 *  per-glyph success counts. */
export const TUTORIAL_KEY = 'bc_tutorial'
/** `MetaSave` — the day-to-day layer on top of progress: merchants' rare
 *  shelves, the rested pool, build presets, faction contracts, the
 *  colosseum's weekly best. */
export const META_KEY = 'bc_meta'
/** Save shape version (number), for migrations of the structured fields. */
export const VERSION_KEY = 'bc_version'

/** Every field that IS the game being played — what `saveProfile` writes,
 *  what a manual save slot copies, what "Start New Game" clears. Settings,
 *  the leaderboard identity and the slots themselves are not in it: they
 *  belong to the player, not to one playthrough. */
export const PROFILE_FIELDS: readonly string[] = [
  VERSION_KEY, LEVEL_KEY, GOLD_KEY, STORY_KEY, QUESTS_DONE_KEY,
  HERO_KEY, INVENTORY_KEY, QUESTS_KEY, WORLD_KEY, STATS_KEY, TUTORIAL_KEY, META_KEY
]

// ─── Manual save slots ──────────────────────────────────────────────────────

/** `(SlotSave | null)[]` — the four manual save slots (pause menu → Save / Load).
 *  Inside the blob, so the slots ride the cloud save like everything else. */
export const SAVE_SLOTS_KEY = 'bc_save_slots'
/** Number (ms) — when the player last loaded a slot or started a new game.
 *  The save merge lets the newer epoch win over a higher progress score, so
 *  a deliberate step back to an earlier save is not undone by the cloud copy
 *  of the game it replaced (`SaveMergePolicy.decideMerge`). */
export const SAVE_EPOCH_KEY = 'bc_save_epoch'
/** The visit a just-loaded slot was saved in (`flow.SavedVisit`): read and
 *  removed by the next boot, which builds straight into it. */
export const SAVE_RESUME_KEY = 'bc_resume'

// ─── Leaderboard identity + posting bookkeeping ─────────────────────────────
//
// All of these live inside the same `bc_` blob as everything else, so they
// ride the cloud save with the rest of the player's progress. An id that does
// not survive a device change hands the same player a second row on a board.

/** The player's stable leaderboard id — the primary key of their row. */
export const PLAYER_ID_KEY = 'bc_player_id'
/** A name the player chose for themselves. Highest precedence. */
export const PLAYER_NAME_KEY = 'bc_player_name'
/** The last display name a platform SDK handed us, remembered. */
export const SDK_NAME_KEY = 'bc_sdk_name'
/** The generated fallback name, minted once and kept. */
export const ANON_NAME_KEY = 'bc_anon_name'
/** The name the board row is currently labelled with, as far as we know. */
export const POSTED_NAME_KEY = 'bc_posted_name'
/** The best score (lifetime XP) the server has ACCEPTED. The whole write rule
 *  is `score > this`, so it may only be set after a confirmed 200. */
export const SUBMITTED_SCORE_KEY = 'bc_submitted_score'
/** The best score the PORTAL's own board accepted. Its own key: the two boards
 *  fail independently. */
export const PORTAL_POSTED_SCORE_KEY = 'bc_portal_posted_score'
/** The colosseum ladder's last ACCEPTED post: `{ week, wave }` (roadmap #10). */
export const LADDER_POSTED_KEY = 'bc_ladder_posted'
/** Whether this player already has a row on the portal's board. */
export const PORTAL_JOINED_KEY = 'bc_portal_joined'

// ─── User settings ──────────────────────────────────────────────────────────

export const SOUND_KEY = 'bc_user_sound_volume'
export const MUSIC_KEY = 'bc_user_music_volume'
export const LANGUAGE_KEY = 'bc_user_language'
/** `true` once the PLAYER picked a language in Options. A stored language
 *  without it is not a choice. */
export const LANGUAGE_CHOSEN_KEY = 'bc_user_language_chosen'
export const DIFFICULTY_KEY = 'bc_user_difficulty'
/** Music mood: the zone themes, or the calm town theme everywhere. */
export const MUSIC_TRACK_KEY = 'bc_user_music_track'
/** Mobile-only hard audio mute (boolean). */
export const MOBILE_MUTE_KEY = 'bc_mobile_mute'
/** Vibration on / off (boolean). Absent means ON — see `useHaptics.ts`. */
export const HAPTICS_KEY = 'bc_user_haptics'
/** Samsung dark-mode colour fix: 'on' | 'off' | 'unneeded' (string). Absent means the player has not been asked yet.
 *  See `useSamsungFix.ts`. */
export const SAMSUNG_FIX_KEY = 'bc_samsung_fix'
/** Rebound main keys, action → `KeyboardEvent.code` (`engine/keyBindings.ts`). */
export const KEY_BINDINGS_KEY = 'bc_user_key_bindings'
/** Keyboard layout: auto-detect on / off, the manual pick, the layout last
 *  detected from typing (`engine/keyLabels.ts`). */
export const KB_LAYOUT_KEY = 'bc_user_keyboard_layout'
