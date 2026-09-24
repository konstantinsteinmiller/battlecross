# Mega Adventure — implementation plan

This is the resume point. Tick boxes as chunks land, and commit after every
chunk that is playable. Design lives in `GDD.md`.

## Starting point

The repo is a structure-donor copy of **survivalist**. We keep its
platform/infra layer untouched in behaviour:

- `src/platforms/*`, `src/utils/save/*` (SaveManager + strategies), ads
  providers, portal plugins, `useAds`, `useAdGate`, `useGamePause`,
  `useGamePauseAudio`, `useModalState`, `useGameplayLifecycle`, `useSaveStatus`,
  `useUser`, `useMatch`, `useHaptics`, the i18n loader and its 21 locales,
  `FModal`, `FButton`, `GameIcon`, `OptionsModal`, `SaveStatusBanner`,
  `AdsBlockedModal`, `FPerfMeter`, `usePerfProbe`, `perfVariants`, the build
  scripts and `vite.config.ts`.

Everything survivalist-specific goes: `src/game/*`, `useSurvival*`,
`components/game/*`, weapon/boss/shop organisms, the benches, the art-sheet
tooling routes, the survivalist tests (`tests/game`, `tests/sim`, most of
`tests/ui`), and the survivalist images.

## Persisted state

- One localStorage key: **`mega_adventure_state`**
  (`src/use/useGameState.ts`, a rename of `useTowerState` with a new key and a
  new `ma_` field prefix). Save strategies, the merge policy and the CG
  scrubbing all reference `STATE_KEY` / the prefix, never a literal.
- Fields (`src/keys.ts`): `ma_hero`, `ma_inventory`, `ma_quests`, `ma_world`,
  `ma_stats`, `ma_mission` (the resumable mid-mission snapshot), `ma_tutorial`,
  plus the settings and identity keys.
- Merge score: `level × 1000 + storyStage × 5000 + questsDone × 40 + bolts / 100`.
- `src/game/state/profile.ts` holds a typed profile with `load()` / `save()` /
  `migrate()` over those fields. Gameplay mutates plain objects, and the store
  persists them at checkpoints (room cleared, loot taken, mission end, hub edits).

## Architecture

```
src/game/
  engine/     renderer.ts (three setup, DPR cap, resize), loop.ts (RAF + fixed 60 Hz step),
              input.ts (touch/mouse/keyboard → intents), camera.ts (FP camera, bob, shake, lock-on)
  models/     toon.ts (gradient ramp, outline hull, shared materials), kit.ts (rounded parts),
              hero.ts (Cobalt full rig + FP arm), enemies.ts (rigs per archetype), bosses.ts,
              props.ts (door, chest, crate, barrel, teleporter, pickups, data core, npc)
  world/      rng.ts, levelGen.ts (rooms/corridors/doors/roles), levelMesh.ts (merged static
              geometry per room), themes.ts, nav.ts (grid collision, LOS, A*)
  sim/        mission.ts (the whole in-mission world + update), player.ts, enemyAi.ts,
              bossAi.ts, projectiles.ts, pickups.ts, objectives.ts, damage.ts
  fx/         particles.ts (pooled additive sprites), rings.ts, beam.ts (teleport), flash.ts
  data/       enemies.ts, weapons.ts, skills.ts, items.ts, regions.ts, quests.ts, progression.ts
  state/      profile.ts (typed save), hudBus.ts (throttled reactive HUD mirror)
  audio/      synth.ts (chiptune SFX), music.ts (step sequencer, per-sector tracks)
src/views/GameScene.vue      canvas host, mode switch mission ↔ hub, modal orchestration
src/components/hud/*         Bars, Compass, Crosshair+ChargeRing, Joystick, ActionButtons,
                             DamageNumbers, Toasts, ObjectiveTracker, BossBar,
                             ControlHints + CoachRing + InputGlyph (the coach), ControlsPanel
src/components/hub/*         HubScreen, MissionsTab, HeroTab, CircuitsTab, WorkshopTab
src/components/modals/*      Pause, Results, LevelUp, Loot, Defeat
```

The hot path runs outside Vue. The sim mutates plain objects. The HUD reads
from `hudBus`, a shallow reactive mirror written at most 15 times a second,
while bars and damage numbers get direct DOM writes.

## Chunks (commit after each)

- [x] **0. Plan.** GDD.md + this file.
- [x] **1. Strip and scaffold.** Remove the survivalist game, add three.js,
  rename the state layer to `mega_adventure_state`, add a `GameScene` with a
  renderer and a test room, and keep the splash/loader working. Typecheck and
  build green. *Commit.*
- [x] **2. Exploration.** Level generator + meshes + theme, FP controller
  (joystick, look, tap-to-move with A*), doors, collision, head-bob, the
  teleport beam-in, the Cobalt FP arm cannon. *Commit.*
- [x] **3. Combat.** Enemy rigs (hardhat, trooper, heli, hopper, roller, brute,
  turret), AI state machines, lock-on, quick and charged shots with the perfect
  window, block and parry, slide, telegraph rings, damage numbers, hit flash,
  death orb bursts, drops. *Commit.*
- [x] **4. Progression and persistence.** Profile store, XP and levels,
  attribute pick, the three circuit boards UI, Repair Tanks, the mid-mission
  snapshot and resume. *Commit.*
- [x] **5. Missions and hub.** Regions, story chain, job generator, objectives
  (kill, collect, rescue, elite, supply, purge), compass/tracker, beam-out,
  results screen, hub UI with sector map and job board. *Commit.*
- [x] **6. Loot and gear.** Item generation, chests with a loot burst, the
  inventory/Hero tab with a 3D paper doll, gear recolouring the rig, the
  Workshop (upgrade, salvage, tanks). *Commit.*
- [x] **7. Bosses and special weapons.** Scrapper, Blaze, Frost, Volt and Gale
  Masters, boss door, name card, boss bar, weapon unlock, weakness, weapon
  slots, arm tint. *Commit.*
- [x] **8. Audio and juice.** Chiptune SFX synth and music sequencer (routed
  through the existing pause/mute gates), hit-stop, screenshake, level-up
  flash, loot beams, tutorial tips (Pip). *Commit.*
- [x] **9. i18n and responsiveness.** Every string in en plus the 20 other
  locales, the i18n parity test, safe areas, portrait/landscape layouts, the
  320×658 check. *Commit.*
- [x] **10. Ads and lifecycle wiring.** Revive (rewarded), 2× bolts
  (rewarded), the interstitial before results, gameplayStart/Stop from the
  state machine, platform pause gating the loop. *Commit.*
- [x] **11. QA pass.** Typecheck, tests (sim unit tests, save round-trip,
  i18n parity), a production build, a headless-browser play-through
  screenshot run, and a perf check on a throttled CPU. *Commit.*
- [x] **12. Loader first.** The logo loader paints before any level work:
  the mission is built in 12 ms wall-clock slices, shaders compile in slices
  with readiness polling, the GPU warm-up renders a room at a time, and the
  scene adopts the boot mission instead of building a second one. The bar
  animates on the compositor and the stuck hint only shows on a real stall.
  `scripts/boot-timeline.mjs` measures it. *Commit.*
- [x] **13. Wordless controls coach.** Glyphs replace Pip's text tips (see
  GDD § Teaching the controls). This chunk also fixes the camera (look deltas
  were zeroed before the render applied them), makes a press that travels
  become a look drag instead of a charge, lets manual look win over the
  soft lock and hand it to the enemy in the sights, adds ← / → turning, the
  "?" button and the glyph panel in the pause menu. *Commit.*
- [x] **14. Global leaderboard.** Lifetime XP (new `stats.xpEarned`, floored for
  older saves) on the `leaderboard-badge` stack: the Worker deployed as
  `mega-adventure-leaderboard` with its own D1 and secret, a rank chip on the
  results screen, a top-100 modal from the hub, and a modelled histogram-only
  board for the builds that cannot post (Poki, Yandex, Playgama). *Commit.*

## Resume notes

- Dev server: `pnpm dev` (port 2194 — 2050/2077/2193 belong to other games
  on this machine). Check the served `<title>` ("Mega Adventure") before
  trusting a browser test.
- `#/models?m=hero&angle=20&zoom=2` — DEV turntable for every procedural
  model (`src/views/ModelLab.vue`).
- `window.__game.app.mode` is the live mission in dev (`debugCam` overrides
  the camera for inspection).
- Cheats: `localStorage.cheat = 'true'` (DevTools) + reload enables the hotkeys in
  `src/game/cheats.ts`, all on ctrl+shift+alt: B +1000 bolts, L level up,
  O finish objective, K destroy every machine, G god mode, U unlock all.
  Typing "cmarc" toggles debug mode (FPS/draw-call meter).
- Layout checks: 320×658 portrait and 764×385 landscape, touch UA. In
  portrait the top HUD row belongs to the bars and the status pills, so the
  compass, target frame and objective stack below it
  (`@media (max-aspect-ratio: 1/1)`). The results modal splits into two
  columns on short landscape screens.
- `<html lang>` follows the active locale (`main.ts`). Arabic gets
  `unicode-bidi: plaintext` on text blocks (`index.sass`), so sentences read
  RTL, while the HUD geometry stays LTR.
- Audio only starts once unlocked (`audioUnlocked` in `useAssets`: the first
  gesture, or a context that came up running because the embed grants
  autoplay). A track requested before that waits in `music.ts` and starts on
  the first gesture. The console stays free of autoplay warnings.
- Ads (playbook Phase 6): `finishMission` pays and saves, then runs
  `adBreakBeforeResults` (the interstitial if pacing allows, then a wait on
  the ad GATE capped at 8 s), and only then reveals the results and plays the
  jingle. `tests/game/resultsAdOrder.test.ts` pins that order. Every ad that
  interrupts live play or the hub restarts the music in `.finally()`
  (`resumeMusicAfterAd`): the revive, the supply drop and the QA trigger.
- Modals freeze the simulation (`isGamePaused`) but not the audio
  (`isAudioPaused` = ad / hidden tab / platform pause). The charge hum is
  silenced whenever the sim freezes.
- Gameplay bracket: `isGameplayLive` = a mission in phase `play` with no flow
  modal, modal, ad, hidden tab or platform pause (GameScene watches it).
- Rewarded placements: revive (once per mission), 2× bolts on results, and
  the Workshop supply drop (40 + 20·level bolts, 4-minute cooldown saved in
  `ma_stats.lastDropAt`). All are hidden unless `canOfferReward`.
- Hidden QA ad trigger: 30 taps on a bolts pill within 30 s
  (`useQaAdTrigger`).
- QA tooling (all run against a BUILT bundle; `npx vite build --outDir <dir>`):
  - `pnpm qa:xbrowser --dist <dir>`: Chrome / Edge / Firefox / WebKit play the
    first mission to the hub, with zero page errors.
  - `pnpm qa:portal --platform gamepix --dist <dir> --headless`: mute at boot,
    unmute, tab-away freeze and silence, resume, menu entry (12 checks).
  - `pnpm perf:mission --dist <dir> [--arms base,<flag> --reps 3]`:
    throttled perf with interleaved A/B. Results go in `PERF-LEDGER.md`.
- Drop-in assets: files in `public/audio/sfx|music` and
  `public/images/textures` replace the procedural sound or texture of the
  same name. They are listed at build time (`virtual:asset-overrides`), so a
  missing file never 404s. See `sound-todo.md` and `art-todo.md`.
- Portal culling (`Mission.updateRoomCulling`): rooms show through open,
  on-screen doors, two deep. Static props hang under their room group.
  Beam-in and beam-out, with the camera above the walls, show everything.
- Control coach: `game/sim/coach.ts` is the bookkeeping. The mission reports
  successes (`use`, `looked`, `moved`, `blockableHit`, `deflected`) and the
  context each step, and the HUD reads `hud.hints`. Progress is saved as
  `profile.tips['hint:<id>:<touch|mouse>']`. Clear `profile.tips` to see the
  first-run glyphs again. `tests/game/coach.test.ts` pins the rules. The
  playtest scripts drive a real mission: the first fight shows look and move,
  then fire and block (desktop cards under the crosshair; on touch, the tap
  glyph plus a ring on the shield button).
- Input ownership: `consumeEdges` (end of each sim step) clears only EDGES.
  The look deltas belong to the render, which applies and zeroes them. Clearing
  them in the step lost every drag whenever a step ran between two frames.
- Boot timing: `node scripts/boot-timeline.mjs [url] [--throttle 4]` (or
  `--dist <dir>`) prints the `boot:*` User Timing marks and the long tasks
  until `boot:adopted`.
- Leaderboard (GDD § Global leaderboard): Worker in `worker/` (runbook
  `worker/SETUP.md`, account pinned in `wrangler.toml`). `.env` holds the live
  URL and the signing secret, so NOTHING automated may end a mission against
  it: vitest blanks both (`test.env`) and rejects non-local fetches
  (`tests/setup.network.ts`, pinned by `tests/game/noLiveLeaderboard.test.ts`),
  and `scripts/xbrowser.mjs` answers the Worker itself. A hand-run browser test
  that ends a mission posts a real row; delete it afterwards with
  `npx wrangler d1 execute mega-adventure-leaderboard --remote --command
  "DELETE FROM scores WHERE id = '<id>'; DELETE FROM board_cache"` (the id is
  `localStorage.mega_adventure_uid`). `data/leaderboard-snapshot.json` (the live
  builds' offline fallback) appears on the first build after the board has
  players; commit it then. The modelled board is `pnpm leaderboard:seed`.
- Known open items for a human: the origin remote still points at the
  survivalist repo, and `.env` still holds survivalist's GameMonetize id and
  Glitch ids. Replace them before a portal upload. (The Playgama leaderboard
  id is cleared; create a mega-adventure board on the Playgama dashboard to
  switch that board on.)
