# Battlecross — implementation plan

Resume point for the build. `[x]` = done, verified and committed; `[ ]` = open.
The design is `GDD.md`; this file is the order of work, the decisions that fill
the GDD's gaps, and the status log. Working style: one writer, research agents
only for maps and drafts, one commit per phase on the `battlecross-build`
branch (never pushed).

## 0. Ground truth (what the repo was when this started)

The repo is a copy of a first-person robot shooter on three.js with a new GDD
for an isometric fantasy action RPG. Kept, adapted and replaced:

| Area | Verdict |
| --- | --- |
| Loop (one RAF, fixed 60 Hz step), renderer singleton, DPR caps, time-slicer, sliced shader precompile, GPU warm-up, context-loss veil, perf probe + A/B flags, device tiers | KEEP (the rendering optimisations) |
| Rig kit (one skinned mesh + one outline mesh per character, vertex colours, no textures), material caches, pooled one-draw-call particles, pooled markers, blob shadows | KEEP |
| Toon ramp + inverted-hull outline | ADAPT to GDD §2.2 (2-tone step at 0.45, tinted shadow, screen-constant outline) |
| Input layer | REPLACE (tap / drag-line / joystick / skill-drag; no pointer lock) |
| Mission sim, enemies, bosses, levels, hub, story, voice-over, tutorial rooms, first-person HUD | DELETE |
| Save layer (SaveManager, strategies, merge policy), platform plugins, ads provider, pause/audio gates, i18n infra (39 locales), F-components, icon set | KEEP, re-key, re-theme |
| Synth SFX + sequencer music | KEEP engine, new recipes and track ids |
| Leaderboard plumbing | KEEP dormant (blank endpoint = feature off); score restated as lifetime XP |

## 1. Decisions (GDD gaps and conflicts; each takes the most recommended option)

| ID | Question | Decision | Source |
| --- | --- | --- | --- |
| D1 | Ids and keys | title `Battlecross`, id / package `battlecross`, save blob `bcross_state`, fields `bc_*`, device keys `bcross_*`. No migration from the predecessor's keys: a new game must never adopt another game's save | brief; playbook "rename the persistence prefix" |
| D2 | Camera | Fixed high-angle follow camera (pitch ~52°, no yaw, FOV 30°), distance derived from the aspect so portrait and landscape both see ~11 m across | BHL (fixed high angle); portrait requirement |
| D3 | Controls | Tap ground = move; tap enemy = lock + auto-attack; drag from the hero to an enemy = lock (GDD §7), released on ground = move; resting joystick bottom-left (reference image 16) + WASD; skill tap = smart cast, skill drag = aimed cast; keys 1–6, Q potion | GDD §7 + BHL + reference image |
| D4 | Resources | Skills have a cooldown AND a mana cost (the GDD names mana in six places); HP-cost skills as written; heat gauge for Aether-Tech | GDD §4.1, §5 |
| D5 | Time Distort | Table value 30 % delayed over 6 s (the diagram's 70 % contradicts it; the table is the spec) | GDD §5.5 conflict |
| D6 | Thermal Overload | Heat 100 % always locks heat skills for 5 s; the passive adds +100 % crit damage during it | GDD §5.7 diagram + table |
| D7 | Start | All six attributes start at 5 (every class's first skill needs 5); +3 points per level; level cap 30, XP still counts after it | GDD §4, BHL |
| D8 | Skill slots | 6 active + 3 passive, loadout editable outside combat; learning a skill costs gold at its trainer | GDD §4.2, BHL |
| D9 | Damage scale | `power(stat) = 6 + 1.6 × stat`; a skill's "N % STAT" = N % of that; basic attack 100 % of the weapon's stat (sword STR, dagger DEX, staff INT, firearm SKL) | best effort; pinned by a balance-sim test |
| D10 | Zones | A zone is 3–5 connected clearings with hand-placed-style groups (seeded), boss in the last one where the GDD names one; an arena node runs endless waves | GDD §3.1 "wave-based or arena-style", BHL |
| D11 | Potions | 3 healing potions per zone visit (shop upgrade to 5), refilled on leaving | BHL (five per area), shorter zones |
| D12 | Death | Back to the map, 10 % gold lost, XP and loot kept; no ad revive (the brief forbids ad-reward buttons) | BHL; brief |
| D13 | Map unlocks | A node opens when any neighbour is cleared; recommended level shown with danger skulls, never enforced | GDD pillar 3 |
| D14 | Towns | Walkable 3D towns on the same engine (peaceful map); tapping an NPC walks there and opens shop / trainer / dialogue | reference image 14 |
| D15 | Trainers | Aegis Knight + Pyromancer in Sunford; Shadowblade + Grand Sovereign in Oakhaven (the Sovereign goes into exile in Ironhold if Oakhaven falls); Geomancer + Aether-Tech in Ironhold; Chrono-Weaver hidden in the Sunken Temple; Blood Alchemist in ruined Oakhaven's black market, otherwise hidden in the Citadel of the Void (late) | GDD §3.1, §3.2 |
| D16 | Quests | Six major branching quests (Goblin King, Siege of Oakhaven, Ironhold core, Drowned Oracle, Dragon's Bargain, Unbound Throne) writing world-state flags that change nodes, shops, trainers, ambushes and the ending; three factions with reputation; CHA-gated options | GDD §3.2 |
| D17 | Items | The 44 named items exactly as tabled, every unique passive implemented; drops follow the "Drop Location" column; shops sell the tier of their town | GDD §6 |
| D18 | Copper Band "+3 STR or DEX" | +3 to whichever of the two is higher on the hero | best effort |
| D19 | Ads | Interstitial after the result screen is closed (shared pacing clock), first-load interstitial only on the portals that require it; no rewarded placements | playbook Phase 6; brief |
| D20 | Meta features | No battle pass, achievements, daily login, daily missions, ad-reward buttons or treasure chest | brief |
| D21 | Font | Angry Birds face for every text (bundled); system faces behind it for scripts it lacks | brief |
| D22 | Art | Procedural low-poly chibi rigs (1 : 2.2 head ratio) and vector icons; a file in `public/images/**` named after an icon or texture replaces it at build time | brief; GDD §2 |
| D23 | Originality | No Battleheart names, places, characters or items; class and skill names are the GDD's own | reference brief §7 |
| D24 | Content rating | Blood Alchemist's self-harm reads as alchemy (vials, HP cost), red is "essence", no gore | portal 13+ rule |
| D25 | The first minute | The hero starts as a militia recruit: Rusted Shortsword, Wooden Buckler, Padded Tunic and ONE learned skill (Shield Slam), so the very first fight already has a button to press. A new save boots straight into the Sunford Plains; a returning one into the town they were last near | playbook ("starts right into the first scene"); wordless lessons need a skill to teach |
| D26 | Leaving a zone | Pause → "Retreat to the map" banks everything earned so far and gives up the clear; no penalty (a defeat costs 10 % gold) | best effort: a phone player must be able to stop |
| D27 | Healers | Every visit starts at full health with a full belt, so a healer SELLS belt size (a 4th and 5th potion: 150 and 600 gold) | D11 |
| D28 | Item text | Every modifier line is generated from the item's data (`mod.<id>` with its number), not written per item: a balance change cannot leave a stale number in 39 languages | i18n rule |
| D29 | Hidden trainers | Chrono-Weaver: the Sunken Temple once cleared (the Dragon's Peak instead if the oracle was slain). Blood Alchemist: the black market of fallen Oakhaven, else the Citadel of the Void once cleared | GDD §3.1.4, §3.2 |
| D30 | Leaderboard | The plumbing is kept but OFF: the copied Worker / D1 / Playgama / Poki / Wavedash ids all belonged to the predecessor and are blanked. A new `battlecross-leaderboard` Worker is created before it is switched on | playbook "Starting from a predecessor repo" |
| D31 | Balance bar | The reference bot (one class, level = zone minimum + 1, best gear of that level) must clear every zone with at least 5 of the 8 single-class builds, in 45–330 s (the opening plains: 20 s+). Chrono-Weaver alone is a support kit and is allowed to fail | tests/game/balance.test.ts |
| D32 | Ad-free start | No interstitial in the first 3 minutes of a session (Yandex: its own 61 s; GameMonetize: the mandated first-load ad starts the 2-minute gap instead). A first-timer's first Continue comes ~30 s in and must not be an ad | playbook Phase 6; `useAdGate.EARLY_ADS_GRACE_MS` |
| D33 | Poki gameplayStart | Only a trusted DOWN-edge input opens the bracket; the browser's sticky activation is never consulted (an iframe reload keeps it: a documented QA rejection); the listeners are armed at module load | integrate-poki skill |
| D34 | Recorder cuts | `feed=preview` (default) keeps the world's own wordless interface (health bars, rings); `feed=pure` hides it. The face of the clips is a Pyromancer; the fail clip is a squishy Shadowblade one potion short | gameplay-video-pipeline skill |
| D35 | Painted art scope | Items (44), skills (48), speaker portraits (22), the coin, the map parchment, the ground detail. The hero portrait stays code-drawn (it follows the gear worn); status icons stay vector | art-generation-pipeline skill; `art-todo.md` |

## 2. Architecture

```
src/game/
  engine/   app (loop) · renderer · slicer · glContext · quality · camera (follow rig, shake, zoom) · input
  gfx/      cel (materials) · kit (rig builder) · rigs/* · terrain · props · particles · vfx · markers · bars · textures
  sim/      PURE, no three/vue: rng · grid (collision, LOS, A*) · types · stats · combat · statuses
            skills/* (hero + enemy abilities) · ai · world (units, projectiles, fields) · zoneGen · director
  data/     attributes · progression · classes · skills · items · enemies · zones · worldmap · quests · factions · shops
  state/    profile (the save) · worldState (flags) · hud (reactivity firewall)
  modes/    zoneMode (combat) · townMode
  audio/    engine · sfx · synth (recipes) · music · songs
  flow.ts · boot.ts · cheats.ts · coach.ts (wordless lessons)
src/components/  atoms (F*) · hud/* · screens/* (map, town, character, skills, inventory, shop, trainer, dialogue) · modals/*
```

The sim emits events (hit, crit, heal, cast, death, status, telegraph…); the
view turns them into VFX, SFX, shake, hit-stop and damage text. The HUD reads a
shallow mirror at ≤ 15 Hz and paints per-frame things with direct DOM writes.

## 3. Phases

### Phase 0 — Clean-up, rename, ids `[x]`
- [x] Delete the predecessor's gameplay: sim, levels, models of robots, story, voice-over, tutorial rooms, HUD, hub, lab views, their tests, tools and assets (comic, promotion, voice recordings, portraits).
- [x] Ids: package `battlecross`, `bcross_state` / `bc_*` / `bcross_*`; remove the legacy-key migration; Yandex cloud key; deploy configs, worker config and env ids cleared to placeholders.
- [x] Font: Angry Birds only. Splash lockup, manifest, icons, meta description.
- [x] Remove rewarded-ad UI. Keep the provider API.
- [x] A placeholder scene so the app boots; type-check + remaining tests green.

### Phase 1 — Engine `[x]`
- [x] Cel material (GDD §2.2) + screen-constant outline; shared light uniforms.
- [x] Follow camera: aspect-fit distance, trauma shake (GDD formula), hit-stop zoom.
- [x] Input: tap, drag-line, joystick, keys, skill-drag; picking by ground-plane ray.
- [x] Particles on the new camera; VFX kit (slash arcs, bursts, beams, rings, ground fields).

### Phase 2 — Simulation core (pure) `[x]`
- [x] Grid nav (zero-alloc A*), zone generator, units, movement and separation.
- [x] Stats from attributes + gear; damage formula; crit, block, dodge, armour, resistances.
- [x] Status engine (stun, slow, burn, poison stacks, bleed, shield, stealth, taunt, stasis, petrify, confuse, knock-up, invulnerable, unkillable, buffs).
- [x] Skill framework (targeting modes, mana, cooldown, cast time, queue-and-walk), projectiles, ground fields, walls, summons.
- [x] AI: enemy state machine with telegraphs, ally/minion/turret AI, boss patterns and phases.
- [x] Director: encounter groups, waves, drops, XP, victory / defeat.

### Phase 3 — Data `[x]`
- [x] Six attributes, XP curve, 8 classes × 6 skills (48) as tabled, Novice basics.
- [x] 44 items with passives, tiers and drop tables; shops.
- [x] Enemy roster (18 kinds) + 12 bosses; 12 zones, 4 towns, the arena; map graph.
- [x] Quests, factions, world-state flags, endings.

### Phase 4 — Graphics `[x]`
- [x] Chibi humanoid rig builder (hero, NPCs, goblin, bandit, cultist, skeleton, necromancer, knights, archers, mages) with gear-driven look.
- [x] Creatures: wolf, spider, treant, golem, elemental, frost giant, naga, void stalker, wyvern, demon; bosses incl. the Void Dragon.
- [x] Animation: idle breathing (GDD numbers), walk, attack styles, cast, hit, death, squash-and-stretch.
- [x] Terrain per zone theme (12 palettes + props, instanced), town buildings, minions, turrets, banners, walls.
- [x] Health bars (one instanced draw), telegraphs, target ring, drag line, floating text (GDD curve and colours).

### Phase 5 — Combat mode + HUD `[x]`
- [x] `ZoneMode`: sim + view + input + camera juice + audio; build time-sliced behind the loader.
- [x] HUD: portrait / HP / mana / heat, skill bar (cooldown clock, ready glow, drag-to-aim), potion, target frame, boss bar, pause.
- [x] Wordless lessons (tap-move, lock target, skill, aimed skill, potion) with recall and a "?" panel.

### Phase 6 — Meta game `[x]`
- [x] World map screen; town mode with NPCs; dialogue with choices.
- [x] Character (attributes), skills (loadout), inventory + equipment, shop, trainer, quest log.
- [x] Results, defeat, level-up, pause, options (controls tab kept).

### Phase 7 — Flow, save, portals `[x]`
- [x] Boot target (first fight for a new player, the map for a returning one), `bcross_state` profile, merge score, cloud hydration re-read.
- [x] Gameplay bracket, loading-finished signals, interstitial ordering, pause/mute gates on the new loop.

### Phase 8 — Audio `[x]`
- [x] Fantasy SFX recipes (melee, magic, UI, creatures, bosses), music track ids per zone theme.

### Phase 9 — Localisation `[x]`
- [x] English source complete; 38 locales drafted by agents and merged; parity test green.

### Phase 10 — Tests and QA `[x]`
- [x] Unit tests for the sim, data integrity, progression, items, quests, save.
- [x] Browser end-to-end (boot → first fight → map → town → reload hydration), cloud-save hydration proof with a stubbed SDK, viewport matrix (320×658 … desktop).
- [x] Perf pass (throttled) and boot timeline.

### Phase 11 — Pipelines and docs `[x]`
- [x] Art pipeline (icon sheets + overrides), compressor, preview-video recorder, `deploy:poki` configured for this game.
- [x] `art-todo.md`, `sound-todo.md`, `roadmap.md` (≥ 15 items), `description.md`, `README.md`.

## 4. Deferred / open

- **Music is the predecessor's code-composed soundtrack**, re-mapped to the zone themes. It is well produced but electronic; a fantasy score (or drop-in files, see `sound-todo.md`) is roadmap work.
- **Single-class Aegis Knight and Chrono-Weaver builds are weak late** in the bot's hands (they are a tank and a support kit). Players mix classes; a tuning pass on their damage is on the roadmap.
- **Leaderboard**: live on its own Worker and database (`worker/SETUP.md`); the dev server never posts.
- **Portal ids are blank on purpose** (Poki P4D id, Playgama application id, Wavedash, GameMonetize, GameDistribution, Glitch): each needs this game's own entry in that portal first. `pnpm deploy:poki` refuses to run without one.
- **Hydration proof is the CrazyGames arm on the dev server.** Not done: the same script against the BUILT bundle (`--dist`), and a Playgama (`bridge.storage`) arm — the `persistToRaw` builds are covered by unit tests only.
- **Built-bundle portal QA** (`scripts/portal-qa.mjs`): the GameMonetize arm is Battlecross's own (47 checks, section 7); the GamePix arm is still the predecessor's; CrazyGames, Playgama and Poki arms are roadmap work before those submissions.
- **Rewarded-ad code is dormant, not deleted** (`useAdGate` reward half, `useRewardedThrottle`, `AdsBlockedModal`): the brief excluded rewarded buttons; the roadmap (#18, #19) may want them back.
- **Late cloud save during the opening fight**: the profile in memory becomes the cloud's at once (proved), but the scene stays the opening fight until it ends; the result then lands on the real save.
- **Predecessor wording in comments** of the kept platform layer (ads, save merge, Poki plugin, vite config excludes): harmless, cleaned where touched.

## 5. Status log

- Baseline committed (`6693ea4`): the tree as handed over.
- Phase 0 part 1 (`9dd170f`): the predecessor's gameplay removed, save re-keyed.
- Phases 0–6 + 9: the game is playable end to end — opening fight → results → world map → towns (shops, trainers, healer, quest givers) → all 12 zones, the colosseum, six decisions, five endings. English + 38 locales (parity test green). Verified in a real browser (own headless Chrome): desktop 1100×650 and phone 360×740 / 320×658 walkthroughs of fight, results, map, town and every menu, no console errors. Unit suite: 81 files / 828 tests green; type-check clean.
  - Found and fixed on the way: the save field prefix was still the predecessor's (`ma_`); the dev build was still POSTING to the predecessor's live leaderboard Worker (URL blanked in every env file, baked snapshot reset); the Poki / Playgama / Wavedash ids were the predecessor's (blanked; the Poki one is on the refuse-list); a unit that set a goal while a temporary wall stood never looked for a path again (stuck Geomancer).
  - Balance pass 1: bosses eased (Goblin King, Warlord, Colossus, Jarl, Dragon, Arch-Demon, Void Lord); every zone passes D31.
- Phase 7 (`33099f1`): cloud hydration proved end to end (`pnpm qa:hydrate`: first-timer, returning player from the cloud alone, write-back as one blob, a cloud that answers late, a slow cloud; the HUD's own text asserted). Found and fixed: boot-time quick retries were spending the background retry ladder. Battlecross's own leaderboard Worker + D1 created and deployed (signed posts only).
- Phase 10 (`51ebb25`, `d40b525`): 160+ unit tests on the rules (GDD tables to the letter, 360 worlds, combat, every skill, generated zones and towns, sheet, shops, flow) and `pnpm qa:e2e` — 86 real-browser checks (desktop play-through with reload, phone touch, five-viewport layout matrix). Found and fixed: a trainer inside a neighbour's house (Sunford, Ironhold), Escape reopening the pause menu, the fading splash swallowing first taps, the phone stick not grabbable right after boot, a weak reference build.
- Phase 11: store description (length-tested), roadmap (21 items), README, art / sound drop-in lists; the three pipelines adopted — art (manifest, reference bench, slicer, prompts), compressor, gameplay video (`pnpm preview:video`, DEV seam `src/game/previewFeed.ts`, four scenarios; all ten cuts recorded and their beat logs and frames reviewed), Poki deploy config for this game with the reload-idle QA check.
- Release-readiness pass against the playbook: Poki gesture gate (D33), ad-free start (D32), result-screen wait matched to the longest ad, music back after an ad on every following screen, the per-zone Poki funnel, predecessor ids blanked in the env files.

## 6. Playtest pass (owner's notes of 2026-10-02; roadmap #37 to #60)

How it is run: the main session orchestrates, verifies in a real browser and
commits; workers own disjoint files per workstream. English strings first
(`en.ts`), one translation fan-out for all 38 locales at the end of each wave
(the parity test is red in between, on purpose). Shared hot files
(`zoneMode.ts`, `flow.ts`, `state/hud.ts`) get minimal, re-read-before-edit
changes only.

### Decisions (defaults taken; the owner can overrule any)

| ID | Topic | Decision | Source |
| --- | --- | --- | --- |
| D36 | Map edge | The camera never sees a horizon (52° down), so "no edge" = ground under every reachable pixel: a coarse land sheet 18 cells past the grid, scenery through the whole unwalkable mass and 13 cells past it (thinner, no outlines, in 15 m tiles so the frustum culls them), distance haze starting just past the playfield | measured camera footprint |
| D37 | Dialogue | Gothic-style: the world keeps running (hero input locked, camera frames both speakers), the spoken line is a speech bubble over the speaker's head, the player's choices are a list at the bottom. Every line has a stable id (`dlg.<npc>.<topic>.<n>`) that is also its i18n key and its future voice file name. Shops, trainers and the healer are reached as dialogue choices. Quest decisions run in the same UI; a speaker who is not in the scene gets a portrait-anchored bubble | owner's note; Gothic 2 |
| D38 | Trade | A two-sided trade table: the merchant's goods on one side, the hero's bag on the other, the item in question in the middle with a comparison against what is worn, the price, and the two purses. Items sold in this visit can be bought back at the price paid. Item rules unchanged (unique items, 25 % sell-back, Charisma discount) | Gothic / Skyrim barter |
| D39 | Equipment | A paper-doll of the hero with EIGHT slots around it — main hand, off hand, head, body, hands, feet, two trinkets — fed from a bag grid: drag onto a slot or tap twice; the worn item is compared with the selected one. Helmets, gloves and boots are new items across the tiers, visible on the hero model | **Answered by the owner 2026-10-02** ("do also helmet, boots, gloves equipment slots"); Battleheart Legacy |
| D40 | Skills screen | The six active and three passive slots as the loadout, the learned skills grouped by class, drag or tap to slot | Battleheart Legacy |
| D41 | UI style | One token layer (CSS variables). Chunky ink outlines, flat two-tone cel fills with a hard highlight band instead of soft gradients, saturated candy colours, warm parchment panels with coloured ribbons, bouncy presses | **Answered by the owner 2026-10-02** ("parchment panels yes, do it"); `game-and-feel-reference.jpg`, GDD §2 |
| D42 | Bars | One shared bar: 25 / 50 / 75 % ticks, frames by rank. World bars: minion plain, elite winged, champion crested, boss crowned. Hero: health and mana framed, experience ticked without ornaments | owner's note |
| D43 | Attacks | The sim's timings do not change (balance). Choreography is view-side: anticipation inside the existing wind-up, a fast strike on the sim's hit time, follow-through and recovery; an elbow and a weapon bone are added; every melee swing leaves a ribbon trail from the weapon tip, every hit an impact sized by the blow; damage-over-time ticks get a small tick effect and no hit-stop | owner's note |
| D44 | Levels | New per-cell kinds (water, plate, door) beside `solid`; chests are interactables with a per-zone loot table; optional packs do not count for the win and are skipped by the reference bot; water blocks walking but not sight or shots; elevation comes last (it touches every y = 0 in the view) | world map (ground truth) |
| D45 | Painted art | The new screens ship with code-drawn art in the new style and are painter targets in the art manifest. The owner has signed in to the image model, so the orchestrator runs the painting round through the Art Desk queue (40 a day): one pilot per kind of drawable, reviewed against the drawn version, then the rest | **Answered by the owner 2026-10-02** ("I already signed in to Gemini"); art pipeline |
| D47 | Mana potions | A belt item used on demand (a second flask button): 45 % mana, own cooldown; a carried stock that is found in chests and sold by healers, kept between visits, capped at the belt size. Health potions stay as they are (the belt refills each visit) | **Answered by the owner 2026-10-02** |
| D48 | After the boss | The player keeps control after the finale falls (remaining enemies passive, the hero safe), opens the finale chest like any other, and ends the visit with a Leave button; leaving with the finale chest unopened opens it on the way out | **Answered by the owner 2026-10-03** ("keep control with a Leave button") |
| D49 | Dialogue | The hero's bubble is labelled "You". Voice-over: the player's language, else the English recording, else silence — a missing or broken recording never shows an error | **Answered by the owner 2026-10-03** |
| D50 | Buy-back | Everything sold in a visit can be bought back at the price paid while the visit lasts, legendaries included | **Answered by the owner 2026-10-03** ("keep it for sure") |
| D46 | Music | New code-composed score: violin, strings, piano, pizzicato, occasional bongos and hand drum; one theme per zone family, a boss theme that really plays when a boss wakes; no chiptune or synthwave left | owner's note |

### Phases

- [x] **12. Map edge** (#37).
- [x] **13. Wave 1** (parallel, disjoint files):
  - 13a UI foundation: tokens, F-components, shared bar, hero bars, battle skill buttons (#45, #44 HUD half, #50).
  - 13b Combat look: skeleton, human models, attack choreography, trails, impacts, telegraphs, world health bars (#38, #39, #40, #43, #44 world half).
  - 13c Levels I: chests and loot tables (health and mana potions for the belt), optional corners, puzzles, water, caves (#54, #55, #56, #58, #59).
  - 13d Dialogue system (#46).
  - 13e Soundtrack (#53).
- [x] **14. Wave 2**: town houses and town life (#41, #42); the three new equipment slots with their items (helmets, gloves, boots: data, save migration, rules, drop sources, shop stock); trade, equipment and skills screens, painter targets (#47, #48, #49, #51); elevation (#57).
- [x] **Painting round** (runs beside the waves): the 18 existing reference sheets first, the new UI targets when wave 2 has added them.
- [x] **15. Wave 3**: paced introductions (#52).
- [ ] **16. Gate**: translations for all locales, balance re-check (D31), e2e and hydration scripts updated and green, perf check on the throttled phone profile, production build boot.
  - [x] Translations: 687 new strings × 38 languages, gated (keys, placeholders, characters) and merged; parity 83/83.
  - [x] Unit suite 1,465 passed; type-check clean; e2e 94/94 (play, touch, five layouts); hydration 23/23.
  - [x] Balance (D31) holds on every zone (bot, seed 77), with helmets / gloves / boots in the reference build.
  - [x] Frame time back below the morning baseline (court 58 → 42 ms, Sunford 36 → 20 ms p50 at 4× on the phone profile; PERF-LEDGER.md).
  - [x] Boot: no task over ~0.4 s any more (was 1.7 s), shaders all precompiled, screens, town view and map lazy (boot chunk 1,252 → 1,173 kB, GameScene 356 → 189 kB). Still ~0.4 s behind the morning in total build time at 4× (more to build: rigs, relief, level props); next steps in PERF-LEDGER.md.

### Status log (playtest pass)

- Phase 12 (`779df68`): the map edge.
- Wave 1: interface tokens and F components (`f213166`), levels I (`6ee554e`), soundtrack (`99ca115`), dialogue (`d7d1c0f`), world map (`0a48654`), combat look (`f8e971e`).
- Wave 2: equipment slots and 18 items (`4d39e15`), elevation (`66f8b9d`, `f5a1fa3`), screens (`9396c1f`), towns (`c441c7b`, `4d7c975`: z-fighting audit to zero, taprooms, small talk), Leave button (`9e004e0`, `b010344`).
- Wave 3: introductions (`e1804ed`).
- Painting: day 1 (`ea6f812`), day 2 (`a308154`), hero portrait (`8330e7e`); 135 targets painted except the button and bar frames (deferred, #51).
- Gate: translations (`5e8f194`), performance (`541813a`), trail and repaint fixes (`75e95c3`).

## 7. GameMonetize release (roadmap #66)

The playbook's GameMonetize audit (Phase 5, 6, 2's forced-dark bullet, 7),
run on the built bundle. Re-run it before every upload: `pnpm build:gamemonetize`
(gates + zip), `pnpm gamemonetize:audit` (unobfuscated twin),
`pnpm qa:gamemonetize` (47 browser checks). README, "GameMonetize release".

- [x] **Step 0, the build exists and is this platform's:** flag in `useUser`,
  in the exactly-one-platform assertion and the reward gate; both resolvers;
  descriptor only (no re-exports); `buildCsp` names GameMonetize and nobody
  else on this build and GameMonetize on no other build; plugin and provider
  stub-aliased on every other build; `.env.gamemonetize.local` sets every other
  flag false. Proven on the built bundle: the SDK request, `SDK_OPTIONS` with a
  game id, `GameMonetizeStrategy` chunk.
- [x] **Ads:** first-load interstitial by the two-signal watcher (loader gone
  AND interstitial ready), seeded clock, music restart on `.finally()`, one
  armed path, grace 0; midgame ad on Continue / Retry behind a closed result
  screen (D19; owner question 30); both ad waits capped (6 s never opened, 60 s
  never finished, the plugin's own 3 s no-fill and 45 s cap); music hard-stop,
  one-shot kill and the suspend gate around every ad; the plugin only publishes
  `isPortalAdOpen`, App.vue's one watcher pauses. No rewarded placement is
  reachable; the old ad-block network probe is gone.
- [x] **Platform signals:** GameMonetize has pause / resume (its ad layer, also
  its consent wall) and no mute or language API; pause stops the loop and the
  sound, resume brings both back. Nothing is written to player settings.
- [x] **Forced dark mode** (shared by every build): `darkreader-lock` beside
  the `dark only` scheme, the detector, `ForcedDarkModeModal` (an app-side hold;
  the first-load ad stays armed under it), the old extension guard deleted.
  `forcedDark.*` keys English-only for now.
- [x] **Package:** `index.html` at the zip root, relative paths, no source maps,
  obfuscated (public re-distribution), no developer comments in `index.html` or
  the storage shim, 7.2 MB / 3.7 MB zipped; no other portal's SDK or service, no
  child-directed flag, no Worker URL (baked leaderboard, owner question 29).
- [ ] **Owner:** create the game on GameMonetize, paste its id, upload
  (`outstanding-decisions.md` A2, A3).

## 8. Retention and ads backlog (roadmap #9, #10, #14, #15, #16, #18, #19, #20)

Sequential worker: one writer, phases in dependency order, one commit per
phase (full suite, type-check, real-browser probe, translations for all 38
locales). Decision report: https://claude.ai/artifact/KwGdajXrbhE93gZ1MacZTx

### Decisions

| ID | Topic | Decision | Source |
| --- | --- | --- | --- |
| D51 | Ad grace | 240 s ad-free start for the midgame ad on every build; 121 s gap kept; GameMonetize's first-load ad untouched | owner (#20) |
| D52 | Ad content rules | No break after the opening fight, after a defeat, or before a decision (`game/adPacing.ts`); a skipped break is not owed | owner (#20) |
| D53 | Ad order | Interstitial stays after the result screen, on Continue / Retry | owner question 30 |
| D54 | Rewarded = ad break | A completed rewarded video restarts the interstitial clock (not on Poki) | playbook B6 |
| D55 | Rewarded on | Rewarded placements live where `canOfferReward` allows; no button at all elsewhere | **Answered by the owner 2026-10-04** (asked for #18 / #19; question 7) |
| D56 | Second wind | On defeat, before the result screen: one revive per visit, half health, 2 s invulnerable, a knock-back pulse | roadmap #18 |
| D57 | Second wind scope | Not in the opening fight, not in the colosseum | **Answered by the owner 2026-10-04** |
| D58 | Ad brackets | gameplayStop under the offer, the mute guarantee, music restart on `.finally()` | playbook |
| D59 | Triple the purse | Victory with gold: 3× in total, granted and saved before the coins fly; not after the opening fight, a defeat or a retreat | roadmap #19; playbook B5 |
| D60 | Rare shelf | Three items one tier above a merchant's stock (no legendaries, nothing owned), seeded by town and day; a rewarded refresh up to 3 a day; no refresh button without ads | roadmap #19; playbook C1 |
| D61 | Rested pool | 10 min of double XP per hour away (absences under 30 min count nothing), capped at 120 min; fight time drains it; kill XP doubled | **Answered by the owner 2026-10-04** |
| D62 | Last seen | Written with every save; merged on the later time; negative absences count zero | playbook save rules |
| D63 | Rested display | One-time map banner on return, a chip while it lasts, "2× XP" on the fight's XP bar | roadmap #9 |
| D64 | Presets | Two named presets of skills and gear; load skips what is no longer owned or allowed and says so | roadmap #14 |
| D65 | Respec | At the healer: every spent attribute point back; first free, then 50 + 25 × level gold; skills whose requirement fails go to the bench | **Answered by the owner 2026-10-04** |
| D66 | Contracts | A contract board in every town, opened from a town HUD button (unlocked with the second zone cleared): one contract per faction a day (kills of a kind in a zone, a win in a zone, chests anywhere), counted at the end of every visit, handed in for gold and +1 standing. Built as a window instead of a prop in the square: no new town geometry | roadmap #15; built |
| D67 | Reputation track | Three −5…5 bars with marks at +3 and +5, on the hero sheet and the board | roadmap #15 |
| D68 | Reputation rewards | +3: 300 gold and a tier-matched item once; +5 while held: Order +5 % health, Syndicate +10 % gold, Circle +10 % mana regeneration | **Answered by the owner 2026-10-04** |
| D69 | Colosseum ladder | Endless waves; wave 8 keeps its prize chest; gold every 5 waves after; +1 enemy level per 2 waves past 8, an elite every 3rd; Leave between waves; no gold lost on defeat | roadmap #10 |
| D70 | Best wave | Waves cleared, recorded on defeat and leave too; all-time and this week; "New best" chip | ground truth |
| D71 | Weekly modifier | By UTC week: All fire, No potions, Glass, Swarm, Elite parade, Haste | roadmap #10 |
| D72 | Wave board | Weekly best-wave board on the Worker's new `board` key; Colosseum tab; baked builds show the personal best | **Answered by the owner 2026-10-04** ("you do the deployment") |
| D73 | Music | A new void theme (void and rift); a test for drop-in files | ground truth; D46 |
| D75 | Opening fight | Tuned to the most naive play (click, let the hero swing, never a skill or potion, never pull): it wins with 1–5 health (3/212 now). Packs after the first hold 5 enemies, enemy damage ×2.22, and the first level-up waits for the result screen (no refill mid-fight). Skill 1 leaves 83/212, potions alone 99/212. Only the first visit; replays are the zone as tabled (`OPENING`, `tests/game/openingBalance.test.ts`) | **Owner 2026-10-04** |
| D76 | Experience | A ring round the hero's portrait instead of the strip under the mana bar; the level in a gold sunburst crest on the rim; the ring glints while rested | **Owner 2026-10-04** |
| D77 | Voice-over | Every English line voiced with Chatterbox (714 files: 38 voices, the girl hero her own takes of the hero's lines); the storyteller's lines and the ending are read by the player's own voice (boy or girl). One list of lines (data/voice-manifest.json) with a text fingerprint per line: a changed text is voiced again; tests/voice/voiceStale.test.ts. Answers outstanding questions 31 and 32 | **Owner 2026-10-04** (roadmap #73) |
| D74 | Old music styles | The `trance` / `cozy` file mapping stays (a saved setting); noted in `sound-todo.md` | saves |

### Phases

- [x] **17.1 Interstitial pacing** (#20).
- [x] **17.2 Second wind** (#18).
- [x] **17.3 Triple the purse, rare shelf** (#19).
- [x] **17.4 Rested bonus** (#9).
- [x] **17.5 Presets and respec** (#14).
- [x] **17.6 Faction contracts and reputation** (#15).
- [x] **17.7 Colosseum ladder** (#10). Worker deployed (version 2a09c5d1), `ladder` table created on the live database.
- [x] **17.8 Void theme** (#16).

### Deferred

- **A physical contract board in each town square** (#15): the board is a window reached from a town HUD button; a prop the hero walks up to needs a new town geometry piece (with its coplanar check) and a placement in every town layout.

## 9. Effects and enemy models for the cinematic trailer (roadmap #74)

The trailer (#X1) showed the effects and the enemy models were not good enough
for it. Quality over speed, in steps, each judged on the effects bench
(`/#/models?fx`, `window.__fxbench`) or the rig bench and in a draft of the
trailer, then committed; the trailer is re-run at the end.

Ground truth (map agents, 2026-10-05): every projectile was a glowing sphere
with one puff trail; bursts, fields, beams and pillars were flat discs, rings
and planes; deaths a flash and sparks. Enemies are procedural rigs: humanoids
already got the hero's upgrade (#40), creatures (`rigs/creatures.ts`) did not
(flat colours, no gradients, single-bone limbs); seven branch bosses are a
regular enemy scaled up; no boss looks different from its kin but for size.

### Phases

- [x] **18.1 Projectiles, area effects, impacts.** Projectiles in layers (halo,
  inked body with a white-hot head, core, a turning shape; needles for points;
  tumbling matter) with a smooth ribbon and an element wake; bursts in beats
  (flash, body, shock, debris, delayed smoke, element, soft scar); slams with
  dust, stones and cracks; beams as camera-facing shafts; pillars that fade
  upward; rim-lit standing fields with per-kind life; breath in waves; heals,
  buffs, roars, summons and deaths rebuilt; every blow opens on an impact
  frame, slashes and stars carry an ink under the light so they read on snow.
  The effects bench. A test: every projectile the game fires has a look.
- [x] **18.2 Swings, casts, states on bodies.** Sparks off a swinging edge, the cast's
  gathering, burning / frozen / poisoned / stunned shown on the body.
- [x] **18.3 Creatures.** Wolf family, spider, treant, golem, elemental, naga,
  wyvern, dragon rebuilt to the hero's standard (gradients, jointed limbs,
  detail tiers), on the rig bench by enemy id; triangle budgets in the test.
- [x] **18.4 Faces of the enemy.** Monsters lose the doll face (no blush, a
  menacing brow and eyes); every branch boss a look of its own.
- [x] **18.5 Boss presence.** A boss reads as one: rim light, emissive accents,
  an aura on the ground, size of silhouette.
- [x] **18.6 The trailer again** (`pnpm cinematic-trailer`).

## 10. Scripted boss fights (#74 follow-up)

The bosses read alike: a model that throws meteors or a cone at the hero. The
owner asked for fights in the spirit of Battleheart Legacy and top-down ARPGs
(the goblin on a war boar that charges, rams the wall and pins the hero, the
King leaping off at half; a dragon that takes off and burns lanes of the
field), the old bosses kept, the new fights in the next trailer, and the hero
dodging now and then. Design report:
https://claude.ai/artifact/F4PGs8yrX78wpkt7yywkXA

| # | Decision | Default / answer | Source |
| --- | --- | --- | --- |
| D78 | Where the new fights go | The finales of the Hollows (Tusker and the Goblin King), Dragonspine Peak (Skyfire), the Dread Fortress (Hellgate) and Frostpeak Tundra (Shatterlake), under the old ids, so quests and portraits keep working | Report default |
| D79 | Dodge roll | Every class: about 4 m in 0.32 s, untouchable 0.3 s, every 3.5 s; Space (the potion keeps Q) or a round button beside the skill bar; a tucked forward roll | Report default |
| D80 | Reference player | Rolls out of about 7 in 10 foe warnings shortly before they land, the way that keeps it near its foe; balance re-checked | Report default |
| D81 | The boar | A war-boar rig with the King riding it (parented to its saddle) | Report default |
| D82 | Fight length | About a minute (60–90 s target): measured 51 / 70 / 86 / 69 s average over the eight classes (Hollows / Tundra / Peak / Fortress); `tests/game/bossFightLength.test.ts` | Report default |
| D83 | Move names | None on screen | Report default |
| D84 | Branch bosses, colosseum | Unchanged | Report default |
| D85 | The old bosses | Mini-bosses half-way through other zones, elites far weaker, recoloured and reshaped: the Goblin Tyrant (Whispering Woods), the Frost Thane (Sunken Temple), the Void Drake (Citadel of the Void), the Pit Lord (Void Rift) | **Owner 2026-10-05**; the zones confirmed 2026-10-06 |
| D86 | Boss lines | One short shouted line at each big beat of a fight, in a bubble over the boss and voiced (Chatterbox, English); a voice card for the Frost Jarl | **Owner 2026-10-06**: keep them |
| D87 | Hollows for a Blood-only hero at level 4 | Loses the Tusker fight (7 of 8 classes win); accepted | **Owner 2026-10-06** |
| D89 | Tall scenery in front of the hero | The instanced scenery (rocks, trees, props) and its outlines open a dithered see-through hole round the hero where they stand nearer the camera than the hero and above knee height (`SEE_THROUGH` in `gfx/cel.ts`); low stones and grass at the hero's feet stay | **Owner 2026-10-06** (question 42) |
| D90 | Resolution | The canvas draws at the screen's own pixel ratio (the old 1.5–2× caps are gone, the hero preview's too); a device that cannot keep up gives up effects on a ladder instead: half the particles, then the scenery's outlines, then the motes (`engine/effectsLadder.ts`, `PERF-LEDGER.md` 2026-10-06) | **Owner 2026-10-06** (question 43) |
| D88 | Necromancers | At most four raised skeletons alive each (was six of anything a summoner raises): an Aegis-only hero no longer stalls on them in the Dread Fortress | **Owner 2026-10-06** |

### Phases

- [x] **19.1 The boss kit.** Scripted phases, lanes to the wall, the charge
  (carry and pin, or ram the wall and stand dazed), leaving the field, out of
  reach in the air; Tusker and the King, Skyfire.
- [x] **19.2 Hellgate and Shatterlake.** The sword wave, hellfire pillars, the
  dive whose shadow hunts and locks, the gate of fire, three dives; hammerfall
  and its ice spikes, the shoulder charge that shatters on them, the ice
  breaking, the rolling glacier. Warnings that track a unit; an ice wall shape.
- [x] **19.3 Mini-bosses mid-way** (D85).
- [x] **19.4 The dodge roll and the reference player's dodge** (D79, D80),
  strings in all 39 locales.
- [x] **19.5 Boss lines** (D86), voiced.
- [x] **19.6 Balance and stalls** (D82): a hero carried into rock, a fight
  wandering into a side pack, the Jarl not charging a hero behind his ice.
- [x] **19.7 The trailer**, staged on each fight's big moment.

- [x] **19.8 The owner's answers** (D86–D88): the skeleton cap.
- [x] **19.9 See-through scenery** (D89).
- [x] **19.10 The trailer on YouTube**: https://youtu.be/xZCQeQjo6ZM (`pnpm publish-trailer`).
- [x] **19.11 The screen's own resolution, an effects ladder** (D90).

## 11. Playtest batch #78–#94 (2026-10-07)

Owner's notes from a phone playtest on Wavedash: chest and level-edge bugs,
HUD and map layout, then quest boards, a big town with secret traders and four
secret classes, alchemy and plants, a treasure map, equipment upgrades, two
gamblers, voice-over for every new line, and the icon and world-map art.
Sequential worker. Decision report:
https://claude.ai/artifact/QkADooVg1f8ndUYurrpaYi (open questions 44–50 in
`outstanding-decisions.md`; their defaults are in effect).

Ground truth (map agents): no chest is unreachable (3,000 Hollows layouts, 349
chests opened by the real hero); the "loot inside" was the beam, coins and
toast rising out of the solid chest plus a glow that never went out. Furniture
indoors is view-only (only tavern tables block). The level-edge darkening
stops at 4 cells and jumps. The world map is a padded strip on a phone (about
248 px tall). There is no quest log, no ground pickup, no mini-game and no
attribute buff; items are fixed named ids owned once.

| ID | Topic | Decision | Source |
| --- | --- | --- | --- |
| D91 | Chest loot (#78) | Loot spills in front of the chest at the hero's side; the glow fades after opening; an owned item is never announced (gold instead) | ground truth |
| D92 | Hidden chests (#79) | Scenery on the camera side of every chest stays low (test, every zone); after the win the chest counter at Leave points to the nearest unopened chest; the camera keeps peeking at unopened chests | ground truth; #69 |
| D93 | Leave (#80) | Top-left under the hero frame with the counter beside it; 20 % smaller on touch; desktop moves there too | owner |
| D94 | Map (#81) | Full screen on phones; the bars float over it; the table frame on desktop only | owner |
| D95 | Lesson ring (#82) | Drawn only where its target is visible; the map scrolls the target into view first | ground truth |
| D96 | Level edge (#83) | One smooth distance field darkens ground, scenery and outlines into a soft haze; no step over 4 % a cell (test) | owner |
| D97 | Furniture (#84) | Every standing piece indoors blocks the hero, placed by the town plan (same on every quality); test | ground truth |
| D98 | Quality names | Common, Uncommon, Rare, Epic, Heroic, Legendary for tiers 1–6 | owner's wording; question 44 |
| D99 | Upgrades (#90) | +5 max per worn piece, in towns, from the equipment page; 3 % of attributes and armour a level (a legendary 5 %), so a better piece grows by more in numbers; the item's own effects untouched; cost 12 % of the price ×1.6 a level (a legendary reckoned at 12,000); a +5 piece never beats a next-quality piece of its slot made for the same build (test: the item tables' top steps are as small as +16 %, so a rising share per quality was not possible); counted by the "better" arrow; a sold piece loses its levels | owner; question 50 |
| D100 | Journal | A Journal page in the hero book: tasks, secret quests, the treasure map | owner ("quest log") |
| D101 | Errands | One quest model (defeat, gather, bring, escort, dig), counted at the end of each visit | contracts pattern |
| D102 | Pickups | Walk-over plants and map pieces on their own random stream | fight fingerprint test |
| D103 | Plants (#88) | Eight kinds with models; 3–4 a visit by theme; back every visit | owner |
| D104 | Alchemy (#87) | Alchemist in Silverbridge; recipes; six 60 s elixirs; a third flask button; 5 of each carried | owner |
| D105 | Boards (#85) | The square's board is usable: contracts plus 3 town tasks a day; gold and 20 % of a level's XP | owner |
| D106 | Caravan (#85) | A road visit Sunford → Oakhaven outskirts escorting a mule cart with a health bar | owner |
| D107 | Big town (#86) | Silverbridge, off the Whispering Woods; teachers for every class (hidden and secret ones once found), alchemist, memory gambler, board, two secret traders | owner; D29 |
| D108 | Secret traders (#86) | The Collector and Mirela the Fence, unlocked by their quests; Rare and Epic stock | owner |
| D109 | Secret classes (#86) | Windrunner, Frostwarden, Lightbringer, Beastcaller; 6 skills each; D31 over 12 classes | owner; question 46 |
| D110 | Memory gambler (#91) | Stakes by level; pairs against the clock (70→34 s); 5 wins in a row add a Legendary not owned | owner; question 47 |
| D111 | Item battle (#92) | Sunford and Oakhaven; fee 10 + 2 × level; best of three by sale value; items gone either way; 3 wins in a row give an Epic not owned | owner; question 48 |
| D112 | Treasure map (#89) | Six pieces (Plains 1, Hollows 1, Woods 2, Outskirts 2); a dig spot in the Ashen Crags once whole | owner |
| D113 | Prize levels | Prizes are unowned items of that quality, worn at their own level | question 45 |
| D114 | Voice (#93) | Every new line voiced (Chatterbox, English) at the end of each content phase | D77 |
| D115 | Art (#94) | New icon sheets for every unpainted and new icon; then the world map repainted to match the layout, with Silverbridge | art status |
| D116 | Map resolution | Four stitched quarters, about 2600 px, blur-probed | question 49 |

### Phases

- [x] **20.1 Chests** (#78, #79). Loot, coins, potions and the find toast come
  out in front of the chest; its inner glow sinks away; an owned item is its
  sale price in gold, never announced. Scenery on the camera side of every
  chest stays low (`lowRingOf`, tested over every zone and seed); the nook
  chest's fallback never stands by a clearing's near wall. The chest counter
  by Leave is a button: crumbs run to the nearest closed chest, the camera
  leans to it, a light rises over it, and while it is out of view the edge
  disc points to it with a chest on it.
- [x] **20.2 Leave, the map on phones, the lesson ring** (#80, #81, #82).
  Leave hangs under the hero's frame (a fifth smaller on touch). On a touch
  screen the map is the whole screen and its rows float over it. A lesson's
  ring is drawn only where its target is not scrolled out of its box.
- [x] **20.3 Furniture blocks** (#84). Each room's arrangement is the same on
  every device (its own random stream; the clutter is laid and dropped on a
  weak one); its standing pieces are rectangles in the walk grid that stop the
  hero's body (AGENT's half width) and that his walked paths bend round.
  Townsfolk walk as before. Tested: low = high layout; the hero reaches every
  indoor person in every town without crossing a piece.
- [x] **20.4 Soft level edge** (#83). One distance field (chamfer on half
  cells, blurred) in a small texture, read by the ground, the land beyond, the
  instanced scenery and its outlines: they sink together into the theme's dusk
  from 0.5 m to 10 m past the walkable. The distance rings no longer stop at 4
  and jump. Overlapping scenery never holds flat faces within 15 mm of each
  other (a temple seed's two plinths at 0.55 m, exposed by the new low props).
- [x] **21.1 Quality names and upgrades** (#90). Tiers are called Common,
  Uncommon, Rare, Epic, Heroic, Legendary. A worn piece is upgraded on the
  equipment page in a town (+1..+5, a gold stamp on its socket and beside its
  name); the item card, the stats and the "better" arrow count the levels.
  Translations of the new and renamed strings come with the wave's fan-out.
- [x] **21.2 Pickups and plants** (#88). Eight herbs with models of their
  own (`gfx/plants.ts`), 3–4 a visit by the zone's theme and level, laid on a
  stream of their own after everything else (the packs' fingerprint holds) on
  reachable ground off the road; picked by walking over them (a hop, a puff of
  their colour, a toast with their icon), into the pouch at the end of every
  visit; a Herbs tab in the bag. Not on the opening visit. Translations for
  21.1 and 21.2 merged into all 38 locales (`i18nmerge.mjs`, parity green).
- [x] **21.3 Errands and the Journal**. One errand model (`data/errands.ts`
  defs, `errands.ts` rules, profile wrappers): counted steps (slay, clear,
  visit) move at the end of a visit, live ones (gather, bring, pieces, dig)
  read the world, `talk` moves when the person is spoken to; gather / bring
  give their goods over at hand-in and may only be the last step (tested).
  Conversations can ask where an errand stands and start or hand one in. The
  hero's book has a fourth page, the Journal (a scroll glyph), listing every
  open errand with its steps, counts and who to go back to.
- [x] **21.4 Boards and town tasks** (#85). The notice board in every town
  square is walked up to ("Read" prompt, E, or a tap on it) and opens the board
  window: three tasks a day of that town (a hunt in its own region, herbs from
  the pouch, and in Sunford and Oakhaven the caravan), handed in there for gold
  and a fifth of a level's XP; the factions' contracts follow from the second
  zone cleared on. Saved per town and day (`meta.tasks`).
- [x] **21.5 The caravan** (#85). "Set out" starts a road visit in the
  outskirts' land: a mule and a covered cart roll through three ambushes,
  waiting for the hero and holding while a foe is near; its arrival wins (the
  escort tasks are then ready to hand in, at double pay), its loss loses
  without the defeat's gold. The goal chip reads "Guard the caravan" and the
  edge disc points to the cart when it is out of view.
- [x] **22.1 Silverbridge** (#86). The big river town west of the Whispering
  Woods (a road and a bridge to them; its landmark is the old bridge with
  houses on its back). The town plan takes a width: Silverbridge is 70 cells
  to a village's 38, the same three rows round the same square, so eight
  masters' halls stand along its north street. A master of every class
  teaches there; the Chrono and Blood masters come once the hero has met
  their class's own teacher out in the world (`foundChrono`, `foundBlood`).
  A healer, an armourer, a weaponsmith, a trinket stall (tiers 2–4), the
  mayor in the square, a taproom, the board (its tasks from the woods, crags
  and mines), and its own street chatter. 13 new people with looks, voice
  cards and conversations, voiced in English; all strings in 39 languages.
  Its spot on the painted map sheet waits for the repaint (24).
- [x] **22.2 Alchemy** (#87). Odile Fernwhistle, the alchemist in
  Silverbridge (a new `alchemist` role: her pin, her table, her talk), brews
  six elixirs from three herbs each and a fee of 15 + 3 × level: Might
  (+15 % damage), Ironskin (+25 % armour), Swiftness (+15 % speed and attack
  speed), Clear Mind (+20 % cooldown recovery), Vigour (1.2 % health a
  second), Thirsting (8 % life steal). Every herb is in some recipe (test).
  Five of each are carried; the third flask on the battle bar (key G) pours
  the one marked "in your flask" for a minute, its arrow (key T) turns it to
  the next kind; each is its own status, so it adds to a skill's buff of the
  same kind. None in towns or a "No potions" week, where the stocks now stay
  as they were (the mana stock was emptied there before). The health flask's
  cooldown dial now has its length. The status icons have a fourth sheet for
  the art pass.
- [x] **22.3 The gamblers** (#91, #92). Rules in `gamble.ts`, the purse and
  the winning rows in the save (`meta.gamble`). Madame Pell's memory stand in
  Silverbridge: three bets by level, 6–10 pairs against 70 → 34 s of sand
  (a wrong pair turns back after 0.8 s); in time the bet comes back doubled,
  the fifth win in a row adds a Legendary not owned (its sale price when all
  are), leaving mid-round loses the bet. The item battle with Dob Tumbler
  (Sunford) and Silky Ren (Oakhaven, whatever becomes of it): a fee of
  10 + 2 × level and three unworn items; the gambler's piece shows its
  picture and quality, its price once the hero's is laid; the dearer takes
  the point (a tie goes to the house), two points the game; laid items are
  gone either way; a won game pays a tenth of a level, the third in a row an
  Epic not owned. The gambler lays a quality step dearer every two rounds
  into the game and every win in the row. Both windows fit a phone on its
  side. A new `gambler` role with a coin pin; three new voiced people.
- [x] **22.4 Secret traders** (#86). Two people in Silverbridge with no sign
  and no shop pin (`NpcDef.secret`): Alder Vane, the Collector, in a house on
  the south street (weapons, off-hands, trinkets) and Mirela Thorne, a fence
  by the river steps (armour), both Rare and Epic. Each asks a favour, the
  game's first errands: six treants in the woods and three moonbells; fifteen
  outskirts bandits and a word with the trinket seller. Handed in, they pay
  gold and experience and open the shop for good. The mayor's and the
  trinket seller's hints point at them. The dev server no longer watches the
  voice pipeline's work folder (it stalled while `voice:gen` ran).
- [ ] **22.5–22.8 Secret classes** (#86).
- [x] **22.9 Treasure map** (#89), done before 22.5–22.8 (independent and
  small; the classes wait on question 51). Six pieces (Plains 1, Hollows 1,
  Woods 2, Outskirts 2) lie in their zone, on a stream of their own after the
  herbs (packs, chests and herbs unchanged: tested), until picked up by
  walking over them: a rolled scrap with a ribbon and a glowing seal, a
  golden swirl and a toast. The first piece starts the Journal errand
  "Captain Rook's treasure map" (Elder Mara tells its story); with all six,
  the Ashen Crags hold a chest half sunk in dug earth beside a red X, out
  along the way but never in the boss's clearing. Opening it is the dig: a
  purse three times a secret chest's and an Epic not owned yet; the errand
  ends by itself.
- [x] **25.1 Scaling badges** (#96). Every skill shows the attribute it grows
  with: a chip in that attribute's colour on its icon in the skill tree and
  at the trainer ("STR"), and spelled out on the skill's card ("Scales with
  Strength"). Done ahead of the classes (independent; the classes wait on
  question 51).
- [x] **25.2 Eight and four slots** (#95). The bar holds eight actives (keys
  1–8) and four passives; old saves load with the new slots empty. On a
  touch screen the bar goes four across once it has more than nine buttons,
  so it stays three rows high; the skills page lays the loadout in rows of
  four (one row of eight where there is room).
- [x] **25.3 Twelve skills for the eight classes** (#95). Each class gets
  four actives and two passives more (Aether-Tech and Geomancer three and
  three), levels kept in order, numbers matched to the old curve by the kit
  agents and smoke-cast in the combat suite: Shield Throw, Shield Shove, Holy
  Chains, Retribution, Bulwark, Unbreakable; Star Fan, Grappling Hook, Shadow
  Mark, Nightshade Mist, Silent Strike, Blade Rhythm; Firecracker, Fan the
  Flames, Ring of Fire, Phoenix Flight, Everflame, Wildfire; Call Archers,
  Royal Rally, Royal Decree, Summon Champion, War Marshal, Loyal Hearts; Echo
  Bolt, Time Bubble, Time Loop, Time Stop, Foresight, Frozen Moment; Essence
  Ward, Enfeebling Tonic, Homunculus, Grand Transmutation, Vital Reserve,
  Adrenal Catalyst; Rocket Jump, Shock Grenade, Arc Coil, Coolant Loop,
  Precision Optics, Thermal Plating; Boulder Roll, Sinkhole, Geode Shell,
  Bedrock, Mountain Breaker, Crumble. New: six modifiers (each tested), the
  Sovereign's champion and the alchemist's homunculus (an elemental of life
  essence). Glyphs and painter's blurbs for all, a second skill sheet per
  class, cast clips. The eight new classes are in the type and the art
  tables but join `CLASS_IDS` with their skills.
- [x] **25.4–25.11 The eight new classes** (#86, #95; question 51 answered:
  eight new classes), twelve skills each, kits drafted per class, every
  active cast and resolved in the combat suite.
  The secret four, each a face in Silverbridge's street until their test is
  handed in (`NpcDef.secret` now hides a trainer's pin, sign and lessons as
  it does a trader's; the test's errand sets `found<Class>`):
  Windrunner (Sefa Galewing; a bow ranger: pushing and piercing arrows,
  a cyclone, a leap, wind spirits; 12 bandit archers and 3 swiftfern),
  Frostwarden (Halvard Rimeheart; an ice blade that slows, freezes and
  shatters; two new modifiers; 10 fire elementals and 3 frostmint),
  Lightbringer (Sister Auriel Dawnmere; light that mends, shields and
  blinds; healing taken stronger; 10 cultists and 5 sunpetals), Beastcaller
  (Old Rowan Thistlefoot; lasting wolves and bear, a hawk, commands; new
  companion looks on the beast and wyvern rigs; 12 spiders and 2 moonbells).
  #95's four, in halls on the south street: Elementalist (Magistra Iris
  Fourwinds; fire and frost marks set off five reactions), Soul Warden
  (Warden Odalys Lanternlight; beaten foes rise as friendly ghost-tinted
  spirits of their own kind, a living one turns at a low chance; no team
  flips: a befriended foe is beaten the normal way, its rewards and counts
  kept), Iron Monk (Master Oru Stillwater; chi beads built by strikes and
  spent by finishers, two stances), Bard (Lark Merriweather; songs that walk
  with him, a lullaby and a charm). New: the chi status, eight modifiers,
  the spirit minion path, three companion minions. Masters' conversations,
  voice cards and looks drafted by a writer agent and voiced.
- [ ] **23 Voice, balance, end-to-end, performance** (#93). Balance input
  from the reference player over every zone with all 16 classes (25.4): each
  class clears 10–12 of 12 zones; average clear times spread 45 s
  (Shadowblade) to 164 s (Chrono-Weaver), Aegis 158 s, Blood 143 s, Bard
  134 s at the slow end; Aether, Elementalist, Windrunner, Sovereign, Pyro
  and Beastcaller 62–75 s at the fast end.
  Balance, the new classes: a damage meter in the sim (`sim.meter`, off
  unless a measurement sets it) showed the spread is mostly the basic
  attack (Shadowblade 57 %, Windrunner 39 % of their damage) against the
  tanks' and supports' slower pace, which is roadmap #13 (the owner's, left
  for it: the eight older classes' numbers are untouched). The new kits
  were brought into the band: Elementalist skill damage ×0.75 (67 → 75 s,
  it kept 90 % health), Windrunner ×0.8, Frostwarden ×1.3 (111 → 99 s),
  Bard ×1.4 (127 → 114 s; his songs buff rather than hit).
- [ ] **24 Icons, then the world map** (#94). Painting through the Art
  Desk: the status sheets 3 and 4, the class crests and the second skill
  sheets of the eight first classes, then the Windrunner's first sheet, are
  painted and checked; Gemini's daily image limit stopped the queue there.
  Waiting: the new classes' 14 skill sheets, the four map quarters, then
  repaints of the eight first skill sheets. The map as four quarters
  (D116) is built: `bg-ui-terrain-nw|ne|sw|se`, references cut from the
  plate at 55 % of its width and height each, the painted whole map as the
  finish; `pnpm art:stitch-map` joins them (2502 × 1396) with a colour gain
  per quarter, a least-difference cut through each shared strip and a
  feather across it. Tried on quarters cut from the current map with
  colour casts and 2–3 px offsets: the join is invisible.
- [x] **25 No level requirement for gear** (#98, asked mid-round). Any owned
  piece is worn at once; the padlocks, "Needs level" notes, the item card's
  level line and the level filters on the upgrade arrow and the coach's buy
  tip are gone, and so is `bag.tooLow` in every locale. The item's level
  still sets its price and where it is found (GDD 6: "Item Level").
- [x] **26 Animals in the towns** (#97, asked mid-round). `gfx/townAnimals.ts`
  holds the chickens (moved from the town view), doorstep cats in five
  coats that watch the hero, a strolling cat that keeps out of his reach,
  a dog or two that roam and trot up to sit and wag at his feet (then wait
  half a minute before greeting again), and squirrels that dart about
  their tree and run up into the crown when he comes near. Pets are drawn
  larger than life (cat 1.3, dog 1.15, squirrel 1.7) so the fixed camera
  reads them. A weak device gets about half; a burnt town none. Covered by
  the z-fighting test (every coat and pose, and every town as built,
  Silverbridge now included) and behaviour tests.

## 12. Playtest batch #99–#115 (2026-10-11)

Mining and smithing, cages with captives, sounds, animal gaits, place-shaped
layouts and towns of their own, a balance pass (HP, gear, mana), the careful
clear, fixed gambler tables, more Sunford teachers, plant habitats, map
walking, art. Sequential worker. Decision report:
https://claude.ai/artifact/FoU5cUbJPLUspNd4YpoytW (open questions 51–58 in
`outstanding-decisions.md`; 55 and 56 answered, the rest on their defaults).

Ground truth (map agents): a level-up gives +32 HP and three END points +24;
at level 25 a full gear set is worth 3–6× the points spent (a legendary
weapon 140 = 47 levels of points); casters out-regenerate their casting from
level 10 while non-INT classes keep 55–70 mana all game. Every zone and
encounter is one chain of clearings; the four towns are one street template.
Plants are drawn for the zone's lowest level by theme (moonbells need 8, the
Woods are 6; sun petals list the temple theme). The town dog, cat and
squirrel have baked legs (a bob, no gait). The world map slides only along
the axes. Items are fixed named pieces owned once; no instances, no rolls.
All sound is synthesised (53 recipes); recorded files can override a recipe.

| ID | Topic | Decision | Source |
| --- | --- | --- | --- |
| D117 | Ores (#99) | Iron 1, silver 6, gold 13, mithril 21; ≤3 nodes a visit on their own stream, against stone, each with its own outcrop | owner; map |
| D118 | Mining (#99) | Three pickaxe swings (~2.4 s), 1–2 nuggets, node spent; no damage, knockback, stun or cancel during it; only with no awake enemy within 8 m | owner; abuse guard |
| D119 | Chests (#99) | Opening, once begun, cannot be cancelled; damage still lands | owner |
| D120 | Selling ore (#99) | Every town smith: iron 6, silver 15, gold 35, mithril 80 a nugget | economy |
| D121 | Smithed gear (#99, #148, #150) | Fixed catalogue, never rolled: every piece a named item with fixed stats, owned once; per attribute build (strength, dexterity, intelligence, skill, charisma, endurance) 6 recipes × the metals (iron, silver, gold, mithril, adamant, aetherite), each with a masterwork twin; grade picks the twin and +0..+3 forge levels; an owned piece gains forge levels | owner (decision 52, 2026-10-18) |
| D122 | Recipes (#99) | Smithing taught once by a smith; the first nugget of an ore unlocks its recipes; nuggets + gold, the piece's level | owner |
| D123 | Forge mini-game (#99) | Three strikes on a sweeping hot spot that narrows with rarer ore; Poor / Good / Great / Perfect; touch and keyboard | owner |
| D124 | Smithing window (#99) | Its own window from any town smith, a drawn forge backdrop until painted; Ore tab in the bag | trade-screen pattern |
| D125 | Cages (#100) | Wooden in Plains, Hollows, Woods; iron in Crags, Tundra, Temple; on some visits until opened; hidden key that glints near | owner |
| D126 | Captives (#100) | Low: a peddler (Sunford trader), a herbalist (Silverbridge herbs + quest), farmers (Oakhaven quest). Later: Windrunner, Frostwarden, Lightbringer disciples teaching in Oakhaven, Ironhold, Sunford | owner; question 57 |
| D127 | Sound (#101) | Layered synthesis per element and skill family; impact events sound ; generated spell files are rendered too but kept out of public/ (sound-src) until wanted | owner (decision 53, 2026-10-18) |
| D128 | Animals (#102) | Separate legs, walk and trot cycles for dog, cat, squirrel; slip under 10 % of ground covered | measured |
| D129 | Layouts (#103) | Peak: a path spiralling up and around the mountain. Temple: rooms and hallways through open doors. Outskirts: wheat field with paths, packs in the wheat. Tundra: ring round a frozen lake. Crags: lava gorge with ledges. Other zones keep the chain; encounters draw chain, ring or gorge | owner (question 56) |
| D130 | Silverbridge (#103) | One long deck across the river, a row of houses on each side; the near row low | owner; camera |
| D131 | Oakhaven (#103) | Walled market: crossing lanes round a market square, the road in from the east | uniqueness |
| D132 | Mana (#104) | Mana per level for every class; INT less mana and regen; costs follow the skill's level (a rotation ≈ half a pool); mana use in the sims | measured |
| D133 | Scaling badge (#105) | Only when the effect reads an attribute; summons show Charisma | map |
| D134 | Sunford (#106) | Shadow and Geo masters join Aegis and Pyro | variety |
| D135 | Paint (#107) | Art Desk queue at the end; stop and ask on a login | owner (decision 54, 2026-10-18: paint with the Gemini Art Desk) |
| D136 | Highlight (#108) | The character button's yellow attention frame on the world map, shown over the town just entered: reproduce and fix | owner (question 55) |
| D137 | HP (#109) | Level HP +32 → +14, END +8 → +16; enemy damage re-tuned; a glass-cannon balance run | owner; measured |
| D138 | Gear (#110) | Gear attributes to ~40 % (legendary ~35 %); weapons get base damage by quality; a full set at 25 ≈ the points spent | owner; measured |
| D139 | Map walking (#111) | Slide along the bank; one clearance for steps and paths; 3-cell bridges; no walking on painted water near towns | map |
| D140 | Plants (#112, #114) | A habitat (zone list) per plant; moonbells in the Woods; no sun petals in the Temple; gather errands checked against habitats | owner |
| D141 | Careful clear (#113) | On a win: lost ≤ 15 % → ×2 purse, ≥ 50 % → ×1, linear between; lost = damage up to the HP left, heals do not refund; its own result line; the video triples only the base | owner (decision 58, 2026-10-18) |
| D142 | Gamblers (#115) | Fixed tables: Sunford ≤ Uncommon, Oakhaven ≤ Rare; streak per gambler; Sunford's prize a Rare | owner; farm guard |
| D143 | Points pulse (#108) | The character button pulses only for points not yet seen: opening the character page quiets it; the next level wakes it for the new points | owner; question 59 |
| D144 | Adaptive pressure (#124) | Zones only (no town, colosseum or opening fight): each 60 s of fight time is judged — fought, no health potion, < 10 % health lost → +10 % enemy health and damage (cap +60 %); a zone 5+ levels above the hero: +20 % steps, cap +120 %; a potion holds it; potions two minutes running, > 50 % lost or below 25 % health → one step down; bosses take half; living enemies rescale keeping their health share; kept for the session (not saved), a death clears it; a toast with skull pips; the careful clear and rewards unchanged | owner (#124) |
| D145 | Endgame smithing (#150) | Peak, fortress and rift (zone level 24+) lay no iron or silver; 2-3 nodes a visit: peak gold 2 : mithril 4 : adamant 3, fortress and rift mithril 4 : adamant 3 : aetherite 2 (mithril 4 in 9 everywhere); adamant (heroic, masterwork legendary at 124 points, plain 100) and aetherite (legendary, 132 plain / 140 masterwork, equal to the best drop main hand), no passives, all six attribute builds with masterwork twins; about 2.4-3.1k gold plus nuggets per masterwork | owner (2026-10-18) |
| D146 | Samsung dark-mode colour fix | Opt-in, Samsung Internet only (UA `SamsungBrowser`): a one-time "do both squares look the same?" card (canvas square vs CSS square on a cream bar) at a calm moment (map or town, nothing open, after the first run); "different" turns the counter on, "same" stores *not needed*; an Options select + "run the check again"; the answer is a field of `bcross_state` (`bc_samsung_fix`), no new storage key; `?samsungfix=1/0` forces it on/off for testing. The counter (`utils/forcedDarkCounter`) draws backgrounds, gradients and `border-image` frames with a CSS Paint worklet (`public/fdc-paint.js`, authored colours, no model), dark text as a worklet fill clipped to the glyphs, box-/text-shadow as `drop-shadow()`, `<img>` via one global `brightness(1.41)` rule and background images via `brightness(2)` (on the leaf, or a `::before` layer); the fitted model is only the fallback when the worklet is missing | owner (phone calibration, 4 rounds) |
| D147 | Opening fight pays for Shadowstep | The free road-teacher skill (Shadowstep) made the opening fight a walk (a bot using both skills on cooldown, no dodge/potion, ended with ~50% health). `OPENING.skillHp` = 2.1 (`data/zones.ts`): the moment the skill is learned in the opening (or at generation when already known) every living bestiary foe gets x2.1 health in proportion, and later births (`sim.enemyHpMul` in `spawnEnemy`) too; applied once (`boostOpeningFoes`), nothing without the skill. Fitted on `tests/game/openingSkillBalance.test.ts`: 12/12 wins, median 13.5% health left (0.2 to 20%); 2.2 already loses a quarter of the runs | owner (2026-10-18) |
| D148 | Boot: critical first, the rest on an idle queue (#142) | Before the first playable frame: the entry, the engine and scene chunks (now `modulepreload`ed with the entry at `fetchpriority=low`: the hint had emitted nothing since the obfuscated build gives those chunks a null facade), the ACTIVE locale only (the English fallback is a safety net, every locale carries every key per `i18nParity.test.ts`; loaded on the queue, or at boot only if the active locale failed), the place's town code when booting in a town, and the critical painted set of `assets/preload.ts`. After the first frame, `utils/idleQueue.ts`: one queue, nothing before `startIdleQueue()` (the scene, after its first paint), two loads at a time in idle periods with a 60 ms gap, ranked by place (field: book, map, conversation, options, town code, tables, gamblers; town: conversation, tables, map, book, options, gamblers; English last) and re-ranked on a new place; `idleNow` jumps it. The options window mounts on first open (its language watch moved to the scene). In a town the image drip fetches the book's own art (backdrop, slot glyphs, bag, slotted skills) before the other glyphs | roadmap #142 (owner, 2026-10-19) |
| D149 | Boot, second round: a panel waits for its art; the town's simulation and the conversations are lazy chunks; the early art on the idle queue (#142, Q63) | A panel (the book's pages, the trade and trainer tables, every `FModal` such as the contract board, the map, a conversation) is laid out invisible until every `<img>` and CSS background in it has decoded, at most 300 ms (`use/useArtGate.ts`), then opens regardless with a short fade. The town's layout and life (`sim/townCode.ts`: `town.ts`, `townGen.ts`, `townLife.ts`) and the conversations (`talkCode.ts`: the dialogue engine, every conversation, the host) left the engine chunk: loaded on the idle queue from the first place, and awaited before a town is built (`ZoneMode.create`) or by a conversation that finds them missing (`flow.talkTo`, a decision, a map trainer); the engine reads them through `sim/townHooks.ts` and `talk.ts`; the small talk layer is a chunk too. The early art (`assets/preload.ts` `earlyImages`: plus, close, shield and the book's glyphs, the sheet's and bag's backdrops and slots, both portraits, the bag, the whole skill tree of the class the book opens on, the class emblems) goes on the idle queue as QUIET tasks: one at a time, only while no other load is in flight and nothing landed for 250 ms; after the first frame at the queue's tail, at its head when a first-time player's first boss wakes. Booting into a town starts both chunks at once (`boot.ts`); a town's image drip leads with the book's two backdrops, the class emblems and the skill book's tree | owner, 2026-10-19 (answer to Q63) |
| D150 | Ways to hidden places stay unmarked | Every place one goes to keeps a way at least 3 m wide from the start (`sim/widen.ts`, guarded by `walkTruth.test.ts`), visible as open ground between the scenery; the worn trail texture marks only the main road and its branches. The secret chest's pocket, caves, nooks and lagoons are reached over plain grass: a secret is not signposted | owner, 2026-10-19 (answer to Q63, ways to hidden places) |
| D151 | Intro on for CrazyGames only (#130) | `VITE_INTRO_ENABLED=true` in `.env.crazy-web` only; every other build keeps it off, so CrazyGames' first-day retention can be compared with a portal without the intro. `.env.example` stays un-ignored in `.gitignore` so it can be committed | owner, 2026-10-19 (answer to Q63, the intro) |

### Phases

- [x] **27 Commit the session's work** (question 51): save slots with the exact
  zone state (c31dd9f), then the Wavedash cloud save (7aaaf82).
- [x] **28 Quick fixes** (#105, #112, #114; #108 waits for the owner). The
  scaling badge shows only where the effect reads an attribute
  (`scalingOf`, `FIXED_EFFECT`: 27 utilities and every passive show none;
  Call Bear now shows Charisma). `skillScaling.test.ts` casts every active
  skill with the hero's power table watched and reads the handlers'
  source for effects that fire later, so the list cannot drift. Plants grow
  by habitat (a zone list with weights) instead of theme and lowest level:
  moonbells in the Whispering Woods (weight 3), no sun petals in the Temple,
  every zone two kinds or more; the alchemist's hint re-written and
  re-voiced; a test that the moonbell errands' plant grows where they send
  the hero. #108: the frame was reproduced on the map and in town (same
  pulse); what is wrong with it is asked.
- [x] **29 World map walking** (#111). A blocked step is tried turned up to
  90° either way, smallest turn first, at no less than 40 % speed, so the
  hero slides along a slanting bank instead of stopping; clearance is a
  body's width AHEAD along the move (an axis probe hit the grid's stair
  steps on a slanted bank), one rule for the step and the path
  straightener, so a tapped way is walked to its end (tested from Sunford
  to every place: no stall). Over water a road is 3.4 cells wide (the
  bridges), and a place's bare site no longer makes its river walkable.
  Measured on every river bank, pushing 45° into the water: 204 of 268
  spots keep moving (71 before).
- [x] **30 Animal gaits** (#102). The standing dog, cat and squirrel have
  four legs of their own (`fourLegs`), each turned about its hip and
  stretched so its paw lands where the gait puts it: on the ground the paw
  moves back in a straight line exactly as fast as the body moves on, so it
  stays planted (slip under 2 % of the ground covered, tested over every
  gait and pace); in the swing it comes forward lifted. Lateral walk,
  diagonal trot above 1.4 model units a second, the squirrel's bound;
  stride from speed, never past 1.1 legs. At rest the legs settle under the
  body; the z-fighting test covers every leg.
- [x] **31 Balance core** (#109, #110, #104). Health: base 150, Endurance +20
  a point (was +8), a level +10 (was +32), so three points beat a level-up.
  Gear: the item tables keep the GDD's numbers, a piece adds its attributes
  times its quality's share (Common ×0.5 … Legendary ×0.22,
  `GEAR_ATTR_SCALE`): a full set at level 25 is 1.26× the points spent (was
  3–6×). The hero's level MIGHT (`heroMight`, ×1.27 at 5 to ×2.6 at 30) gives
  back the damage the old gear gave, his summons' too; Dexterity's and
  Skill's per-point effects doubled. Mana: 30 + 5 a level + 3 an INT point,
  regeneration 1.5 + 0.06 a level + 0.06 an INT point: every class can cast
  its loadout, and most cannot cast everything on cooldown for ever.
  Enemies hit ×1.15 from level 6 to 22 (back to ×1 by 28, where the
  scripted bosses are tuned). The reference player keeps a quarter of its
  points in Endurance; `glass: true` is the all-out build. The opening
  fight's damage re-fitted (2.22 → 3.16: a naive clicker still ends on 1–5).
  Balance run (16 classes × 12 zones): 182 wins of 192 (188 before), the
  same pace, less health to spare; Chrono 8/12 and Bard 9/12 are the
  thinnest. Pinned by `balanceCurve.test.ts` (Endurance vs levels, gear vs
  points, mana for every class, a glass cannon wins no more and with less).
  Deferred: a base damage on weapons (D138) — the level might does that
  work.
- [x] **32 Careful clear and gambler tables** (#113, #115). The sim counts
  the health a visit LOSES (`hero.lost`: each blow up to the health it
  found, healing does not pay it back); a won zone or road fight pays its
  gold and experience ×2 at 15 % lost or less, ×1 from 50 %, straight
  between (`careful.ts`), on its own result line beside the purse; the
  video's ×3 stays on the earned purse. Each item-battle gambler plays a
  fixed table (`GAMBLER_TABLES`): Sunford opens Common and never lays above
  Uncommon (fee 14, three wins bring a Rare), Oakhaven opens Uncommon and
  tops at Rare (fee 40, an Epic); neither follows the hero's level. A row
  per gambler (a save's old shared row becomes Sunford's).
- [x] **33 Sunford teachers** (#106). Nettle Quickhand (Shadow: a retired
  cutpurse, in a townhouse by the square) and Harrow Flint (Geo: an old
  earth-mage, in a cottage with a yard at the south edge) join Ser Aldric
  and Ember Wren, so the first town teaches four classes, a different main
  attribute each. Their looks, conversations (greeting, class, readiness,
  a topic of their own, goodbyes), voice cards and 32 voiced lines
  (Chatterbox, English; the heroine's variants too). Placed where every
  house and the tavern still fit (`town.test`, `interiors.test`).
  Portraits are drawn until painted (phase 40).
- [x] **34 Place-shaped layouts** (#103; the towns follow in 35). `ZONE_SHAPE`
  gives five zones a plan of their own instead of the chain of clearings:
  the Ashen Crags a gorge (a wide floor, the finale's dais centred), the
  Sunken Temple halls (rectangular rooms through doorways, L-shaped
  corridors, pillars), the Oakhaven Outskirts wheat fields (wide fields left
  and right, lanes between them, standing wheat over both: `plan.crop`, drawn
  instanced, the packs stand in it), the Peak a mountain path (narrow, in
  Z-turns from shelf to shelf up the face) and the Frostbite Tundra a ring
  round a frozen lake (water cells, listed with the ponds). Every seed keeps
  the layout tests (loops, bosses, reach, relief, herbs, fog, treasure); the
  pack fingerprint is re-pinned. The glass-cannon balance check now sums four
  seeds (one close fight on one seed could flip it). Phase-33 teacher lines
  translated into all 38 locales (with feminine variants where a language
  needs them). Verified: full suite, vue-tsc, the five zones in a real
  browser (SHARP), z-fight tests.
- [x] **35 Towns of their own** (#103). A town's `site`: Silverbridge stands
  on a bridge (the river runs past the north gardens and below a quay before
  the south row, a stone parapet at the deck's edge, the banks are the town's
  two ends; the road ends at the quay, where the hero comes in; the water is
  the zones' own, drawn by the level props, and lies level). Oakhaven is a
  walled market (a stone wall with merlons on the ground's edge, low on the
  camera's side; the east gate with the road running out of it, where the
  hero comes in, and the south gate on the road). The quay is a lane kept
  clear; folk whose anchor falls in the river look further for a free spot.
  Verified: full suite (town reach, lanes, relief, z-fight), vue-tsc, both
  towns in a real browser (SHARP).
- [x] **36 Ore and mining** (#99, smithing follows in 37). Iron, silver,
  gold and mithril (from zone levels 1, 6, 13, 21; the one below the richest
  the commonest): one to three outcrops a visit, on their own stream after
  everything else, against the stone (two to five rock neighbours), off the
  road and herbs and beyond a chest's prompt. "Mine" prompt (key or tap): the
  hero walks up and swings a pickaxe three times (2.4 s, the weapon and the
  off-hand piece put away, the pick in both hands); meanwhile no damage, no
  control, no shove, no cancel, and it only starts with no awake enemy within
  8 m. One or two nuggets, the vein breaks out, a toast; the pouch keeps them
  (and every metal ever mined) after any visit's end; snapshots carry the
  outcrops. A chest's lid, once lifting, now finishes too (the stick, a roll
  or a stun no longer stop it; damage still lands). Verified: ore and level
  tests, full suite, vue-tsc --build, a real browser (prompt, swing, toast;
  SHARP); strings in all 38 locales.
- [x] **37 The smith and smithing** (#99). Every town smith (seven of them)
  buys the whole ore pouch at the flat price (iron 6, silver 15, gold 35,
  mithril 80), teaches smithing once (two lines, then the forge), and after
  that lends the forge: a window of its own on a drawn forge backdrop. Its
  catalogue is fixed: sword, hammer, shield, helm, plate and greaves in each
  metal, each with a masterwork twin a quality higher (48 pieces, plain
  strength-and-endurance gear in step with the found pieces of their
  quality; kept out of the shops, the drops and the gamblers). A metal's
  pieces are known from its first nugget. A piece takes nuggets and gold
  (more for the bigger pieces, and always more than its masterwork sells
  for). The anvil: three strikes on a glow sweeping a bar, scored by how near
  the hot spot's middle they land; Dexterity widens the spot (up to half
  again), a rarer metal narrows it and sweeps faster; Poor gives the plain
  piece, Good it +1, Great the masterwork +1, Perfect the masterwork +3, a
  hand eight levels past the metal one grade better; forging a piece already
  owned works it up instead. The bag has an Ore tab. Voiced: the hero's
  three lines and each smith's five. Verified: smithing tests (catalogue,
  no profit, grades, the shop's flow, the save), dialog tests, full suite,
  vue-tsc --build, a real browser (forge window, the anvil game to a perfect
  masterwork, phone landscape; SHARP); strings in all 38 locales.
- [x] **38 Cages and captives** (#100). Six places hold somebody in a cage
  until it is opened: wooden in the Plains, the Hollows and the Woods, iron in
  the Crags, the Tundra and the Temple. Laid last on a stream of their own
  (the place's packs, chests and herbs unchanged): the cage on open ground well
  along the way, its key at least 14 m off, turning and glinting brighter as
  the hero nears. The cage is a chest locked by its key ("the key must be
  somewhere in this place"); the coach and the chest pointer leave it alone
  until the key is found. Opened, the people in it jump and are gone, and the
  place's cage is kept as opened for good. In town: Odo Marrow, a peddler of
  trinkets, gloves and boots in Sunford; Briar Hollowell, a herbalist in
  Silverbridge who asks for sunpetals; Jory Toller in Oakhaven, whose sheep the
  wolves take; and three disciples teaching their masters' classes (Kestrel
  Vane, Windrunner, Oakhaven; Ivor Hask, Frostwarden, Ironhold; Sister
  Aurelle, Lightbringer, Sunford). A freed disciple opens the class at the
  master too, and the master no longer sets the test (owner decision 57). Six new
  voices designed and every line voiced. Verified: cage tests (placement on
  every seed, the lock, the key, the freeing, the towns, the masters), full
  suite, vue-tsc --build, a real browser (the woods' cage, key, freeing, Jory
  in Oakhaven; SHARP); strings in all 38 locales.
- [x] **39 Sound pass** (#101). Every active skill (128) belongs to an
  element: plain steel, fire, frost, spark, light, shadow, poison, blood,
  earth, wind, the wild, the arcane, time, spirits, song, machines, command.
  Each element has its own layered cast (fire drawn in with its first
  crackles, frost crystallising in four climbing chimes, a spark's tightening
  buzz, a horn call...) and its own impact (a fireball's blast and the flames
  after it, ice shattering out of tune, a spark's crack and falling zap, a
  gust, a woody thud, a glassy pop...). A skill's hit carries its skill to the
  view, which sounds the impact of its element; anything else keeps its
  damage type's layer. Every new sound is a synth recipe a recorded file can
  replace. Verified: skill-sound tests (every skill an element, every
  element its own sounds), full suite, vue-tsc --build, a real browser
  (every new sound measured through the effects bus: all heard, none
  clipping, levels in line with the existing ones; a fireball in a fight
  sounds its fire cast and its fire impact).
- [ ] **40 Voice, translations, paint, final balance** (#107).
- [x] **41 The colosseum: a spectacle, and a reason to climb** (#117, asked
  after the batch). A new quality, Mythic (deep crimson), above the
  legendaries: six class-free pieces (head, hands, feet, off-hand, body,
  trinket), each with a passive of existing effects, given ONLY by the
  ladder's milestones (waves 10, 15, 20, 25, 30, 40), once each, the moment
  the wave falls (in the sand, with a crimson beam); never dropped, sold,
  shopped or gambled. The arena gains stone stands beyond the wall full of a
  bobbing crowd (instanced, seated evenly; on its feet at every wave cleared
  and roaring at a milestone), eight crimson-and-gold banners inside the
  wall, confetti over the sand, two crowd sounds, and an announcement banner
  (the wave, a champion wave, the next prize; at a milestone, the prize).
  The map's arena card names the next prize. Measured reach of the reference
  builds at level 30 under the existing ramp: most classes 8-13 waves, four
  20+, the summoners furthest (Blood 45, Sovereign 31) — milestones spread
  from "most builds" to "the very best"; the summoners' lead is a class
  balance question for later. Verified: arena tests (catalogue, milestones
  given once, coplanar check of the stands, crowd and banners), full suite,
  vue-tsc --build, a real browser (wave banner, banners and crowd, the
  wave-10 milestone and its mythic in the haul; SHARP); strings in all 38
  locales. Deferred: painted icons for the mythics (the Art Desk).
- [x] **42 Adaptive pressure** (#124, D144). `sim/pressure.ts`: a minute of
  zone fight time with no trouble raises enemy health and damage +10 %
  (cap +60 %; +20 % steps to +120 % in a zone 5+ levels above the hero); a
  potion stops the climb, repeated potions or a hard minute step it down,
  a death clears it. New spawns and the living (health share kept) take it;
  bosses half. Session-wide, not saved. Never in towns, the colosseum (its
  board stays fair) or the opening fight. A toast with skull pips on each
  step. Verified: rule tests, the reference bot at level (16 classes, one
  zone) climbs a step at most, vue-tsc --build; strings in all 38 locales.

### Deferred

(none yet)
