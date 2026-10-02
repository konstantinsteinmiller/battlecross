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

### Phase 7 — Flow, save, portals `[ ]`
- [ ] Boot target (first fight for a new player, the map for a returning one), `bcross_state` profile, merge score, cloud hydration re-read.
- [ ] Gameplay bracket, loading-finished signals, interstitial ordering, pause/mute gates on the new loop.

### Phase 8 — Audio `[ ]`
- [ ] Fantasy SFX recipes (melee, magic, UI, creatures, bosses), music track ids per zone theme.

### Phase 9 — Localisation `[x]`
- [x] English source complete; 38 locales drafted by agents and merged; parity test green.

### Phase 10 — Tests and QA `[ ]`
- [ ] Unit tests for the sim, data integrity, progression, items, quests, save.
- [ ] Browser end-to-end (boot → first fight → map → town → reload hydration), cloud-save hydration proof with a stubbed SDK, viewport matrix (320×658 … desktop).
- [ ] Perf pass (throttled) and boot timeline.

### Phase 11 — Pipelines and docs `[ ]`
- [ ] Art pipeline (icon sheets + overrides), compressor, preview-video recorder, `deploy:poki` configured for this game.
- [ ] `art-todo.md`, `sound-todo.md`, `roadmap.md` (≥ 15 items), `description.md`, `README.md`.

## 4. Deferred / open

- **Music is the predecessor's code-composed soundtrack**, re-mapped to the zone themes. It is well produced but electronic; a fantasy score (or drop-in files, see `sound-todo.md`) is roadmap work.
- **Single-class Aegis Knight and Chrono-Weaver builds are weak late** in the bot's hands (they are a tank and a support kit). Players mix classes; a tuning pass on their damage is on the roadmap.
- **Leaderboard**: off until the new Worker exists (D30).

## 5. Status log

- Baseline committed (`6693ea4`): the tree as handed over.
- Phase 0 part 1 (`9dd170f`): the predecessor's gameplay removed, save re-keyed.
- Phases 0–6 + 9: the game is playable end to end — opening fight → results → world map → towns (shops, trainers, healer, quest givers) → all 12 zones, the colosseum, six decisions, five endings. English + 38 locales (parity test green). Verified in a real browser (own headless Chrome): desktop 1100×650 and phone 360×740 / 320×658 walkthroughs of fight, results, map, town and every menu, no console errors. Unit suite: 81 files / 828 tests green; type-check clean.
  - Found and fixed on the way: the save field prefix was still the predecessor's (`ma_`); the dev build was still POSTING to the predecessor's live leaderboard Worker (URL blanked in every env file, baked snapshot reset); the Poki / Playgama / Wavedash ids were the predecessor's (blanked; the Poki one is on the refuse-list); a unit that set a goal while a temporary wall stood never looked for a path again (stuck Geomancer).
  - Balance pass 1: bosses eased (Goblin King, Warlord, Colossus, Jarl, Dragon, Arch-Demon, Void Lord); every zone passes D31.
