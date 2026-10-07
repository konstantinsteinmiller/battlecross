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
- [ ] **22.2 Alchemy** (#87).
- [ ] **22.3 The gamblers** (#91, #92).
- [ ] **22.4 Secret traders** (#86).
- [ ] **22.5–22.8 Secret classes** (#86).
- [ ] **22.9 Treasure map** (#89).
- [ ] **23 Voice, balance, end-to-end, performance** (#93).
- [ ] **24 Icons, then the world map** (#94).
