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
                             DamageNumbers, Toasts, ObjectiveTracker, TutorialTip, BossBar
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
- [ ] **9. i18n and responsiveness.** Every string in en plus the 20 other
  locales, the i18n parity test, safe areas, portrait/landscape layouts, the
  320×658 check. *Commit.*
- [ ] **10. Ads and lifecycle wiring.** Revive (rewarded), 2× bolts
  (rewarded), the interstitial before results, gameplayStart/Stop from the
  state machine, platform pause gating the loop. *Commit.*
- [ ] **11. QA pass.** Typecheck, tests (sim unit tests, save round-trip,
  i18n parity), a production build, a headless-browser play-through
  screenshot run, and a perf check on a throttled CPU. *Commit.*

## Resume notes

- Dev server: `pnpm dev` (port 2194 — 2050/2077/2193 belong to other games
  on this machine). Check the served `<title>` ("Mega Adventure") before
  trusting a browser test.
- `#/models?m=hero&angle=20&zoom=2` — DEV turntable for every procedural
  model (`src/views/ModelLab.vue`).
- `window.__game.app.mode` is the live mission in dev (`debugCam` overrides
  the camera for inspection).
- Cheats in dev: `?cheat=1` enables `useCheats` hotkeys (to be rewritten for
  this game in chunk 4).
