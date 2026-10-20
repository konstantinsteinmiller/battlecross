# Battlecross GDD addendum: The Breaking (afterplay, roadmap #132 and #141)

Status: draft for the owner's review. Nothing here is built yet.
Design docs at the repo root (`GDD.md`, `game-implementation-plan.md`) stay
the source of truth for the campaign. This addendum only covers what follows
it. Open owner decisions go to `outstanding-decisions.md` once accepted (see
the last section).

Working title: **The Breaking**. After the campaign's last boss falls, the seal
he held breaks, and demons and mythic beasts pour into the battlecross world.

---

## 0. What exists and what this addendum reuses

| Area | Today | Reused by |
|---|---|---|
| Zones | 12 combat zones, `src/game/data/zones.ts` (`plains` 1-3 … `fortress` 26-30, `rift` 30), each with `kinds`, `finale`, optional `midBoss`, per-zone features (liquid, puzzle plates, champion) | Invaded zones are the same `ZoneDef`s plus an invasion overlay (section 4) |
| Towns | `sunford`, `oakhaven` (defended/fallen variants via `fallen` flag), `ironhold`, `silverbridge`; NPC lists with `needs` / `not` flags | Fort hub is a new town node built by `townGen.ts` from the same NPC schema |
| Progression | `progression.ts`: `MAX_LEVEL = 30`, `xpToNext = 45·L^1.55 + 30·L`, 3 attribute points per level, `killXp` with a level gap scale | Cap raised to 60 with the same formula (section 2) |
| Skills | `skills.ts`: 16 classes × 6 skills, `SKILL_LEVEL_SCALE = 0.7` (GDD level × 0.7), `ACTIVE_SLOTS 8`, `PASSIVE_SLOTS 4`, `skillPrice(level)` | Skill ranks II/III and one capstone per class (section 2) |
| Items | `items.ts`: tiers 1 Common … 6 Legendary, 7 Mythic (colosseum only); `GEAR_ATTR_SCALE`; named uniques with `drop: { zone, src }`; `upgrade.ts`, `forge.ts`, `smithing.ts`, `mods.ts` | New "Infernal" item level band and Heroic+ upgrade ranks (section 2) |
| Bosses | Generic ability bosses in `enemies.ts` (cone, charge, slam, barrage, rain, spears, summon, heal, enrage, line, leap, lob, volley) and scripted bosses in `src/game/sim/bosses/` (`kit.ts`: lanes, charge-into-wall daze, scripted `move`, `warn` telegraphs, `exit`; `tusker`, `hellgate`, `shatterlake`, `skyfire`) | All seven new bosses are scripts on top of `kit.ts` |
| Rigs | `humanoid`, `beast`, `dragon`, `wyvern`, `naga`, `golem`, `elemental`, `spider`, `treant`, `turret`, `voidlord` | Every new enemy and boss maps onto one of these (section 6) |
| Mini-games | `gamble.ts`: item battle, cups (`CUPS_ROUNDS`), memory (`MEMORY_ROUNDS`), `GAMBLER_TABLES`, `prizeOf` | New mini-games follow the same table/streak/prize shape (section 9) |
| Arena | `arena.ts`: colosseum ladder, mythic milestones at waves 10/15/20/25/30/40 | Siege reuses the wave director pattern (section 8) |
| Quests | `quests.ts`: six decided-once quests with factions `order`/`syndicate`/`circle`, rep −5..5 | Afterplay quests read existing flags (fallen Oakhaven, core, throne choice) |
| VO | Lines derive from locale text in the speaker's section; `voice:manifest`, `voice:collect`, `voice:gen --engine chatterbox`; voiced in en, de, fr, es, ru, ja, pt, zh | Every new line in section 12 must be voiced in all 8 |
| i18n | 36 locale files in `src/i18n/locales/` | Every new string goes to all 36 (section 14) |
| Save | `state/profile.ts`, `SAVE_VERSION = 2` | Bump to 3 (section 15) |

Naming note: the owner calls the campaign's last foe "the Demon King". In code
the campaign ends with `voidLord` ("The Void Lord") in `rift`, with the
Arch-Demon (`archDemon`, `hellgate.ts`) and the `throne` quest one zone
before. This document uses **the Void Lord's death** as the trigger and treats
"Demon King" as the story name for him (see Open Questions, Q1).

---

## 1. Story beats and quest chain

### 1.1 Premise

The Void Lord was not only the demons' king; he was the lid on the rift. When
he dies, the rift tears open. Demons and old mythic beasts that the void had
held asleep (chimera, cyclops, sphinx, centaur, leviathan, hydra, the
Elder Dragon) pour into every zone. Sunford, Oakhaven and Ironhold are
overrun. Silverbridge's masters flee. The survivors gather at **Bastion
Crossing**, an old border fort on the road between Outskirts and Crags, the
last place with stone walls. The hero has to help everybody.

### 1.2 Beats (quest chain "The Breaking", 10 steps)

| # | Beat | Where | Speakers | Gate | Reward |
|---|---|---|---|---|---|
| B0 | The rift screams after the Void Lord dies; a cutscene-style beat (camera shake, red flash, three bubble lines) | `rift` | Void Lord death bark (new), Narrator | Void Lord killed | — |
| B1 | Wounded scout finds the hero on the map: "Sunford is burning. Everyone who could run went to Bastion Crossing." | world map | Scout Wren (new NPC) | B0 | Fort node unlocks on map |
| B2 | Arrive at the fort; Captain Hale (or his replacement if Oakhaven fell) runs it; meet who survived | Fort | Captain Hale / Elder Mara / Forgemaster | B1 | Fort services online |
| B3 | "Clear the road": invaded Plains + Hollows, rescue Sunford's trainers | `plains`, `hollows` | Elder Mara, freed trainers | B2 | Sunford trainers move to the fort |
| B4 | Chimera in the Wildwood; the healer's herbs are needed for the fort | `woods` | Freed Herbalist | B3, lvl 34 | Herbalist joins fort |
| B5 | The Centaur Warband rides the Outskirts; first **Siege of Bastion** (story wave set, unfailable on first try) | `outskirts` + Fort | Captain Hale | B4, lvl 38 | Siege unlocks as repeatable event |
| B6 | Cyclops in the Ember Crags / Mines; Forgemaster needs his forge back | `crags`, `mines` | Forgemaster | B5, lvl 42 | Infernal smithing at the fort |
| B7 | The Sphinx's riddle-temple; the Oracle's last prophecy names the Dragon | `temple` (and tundra cleared) | Naga Oracle (if spared) or Sunken Priest (new) | B6, lvl 46 | Oracle's Lens (map shows invasion bosses) |
| B8 | Leviathan rises in the flooded Void Citadel | `citadel` | Herbalist / Captain | B7, lvl 50 | Leviathan Scale (water walk on shallow tiles) |
| B9 | The Hydra in the Dread Fortress, burned head by head | `fortress` | Arch-Demon's ghost if `throne` claimed / Syndicate boss otherwise | B8, lvl 54 | Hydra fire key |
| B10 | The Elder Dragon at Dragonspine Peak (final), then the rift is sealed for good | `peak` → `rift` | Narrator, all fort NPCs (one line each) | B9, lvl 57+ | Ending, credits, "Sealed" title |

Branch reads (no new decisions, only flavour): `oakhavenFallen` → the
Syndicate Boss sells black-market goods at the fort; `coreOrder`/`coreCircle`
→ which smith runs the fort forge; `throne` choice → who speaks in B9; spared
or slain Oracle → B7 speaker. One new decision only, at B10: **seal the rift**
(story end) or **keep it ajar** (the colosseum gets demon waves, harder Siege
tier unlocked). Both lead to the same post-game loop.

### 1.3 New VO count (story)

| Speaker | Lines (approx.) | New voice card? |
|---|---|---|
| Narrator (intro trailer voice, existing card) | 6 | no |
| Scout Wren | 6 | yes |
| Captain Hale | 10 | no |
| Elder Mara | 5 | no |
| Forgemaster | 5 | no |
| Freed Herbalist | 4 | no |
| Oracle / Sunken Priest | 5 | Priest yes |
| Syndicate Boss / Arch-Demon ghost | 4 | no (ghost = Arch-Demon card + FX chain) |
| Seven boss barks (intro, phase, death) | 7 × 3 = 21 | yes, 7 cards |
| Fort ambient barks (survivors, siege calls) | 12 | no (reuse survivor cards) |
| **Total** | **~78 lines × 8 VO languages ≈ 624 takes** | 9 new cards |

---

## 2. Level, XP, skills, items, attributes (30 → 60)

### 2.1 XP curve

Keep `xpToNext` exactly; raise `MAX_LEVEL` to 60. Numbers from the formula:

| Level | xpToNext | Cumulative from 1 |
|---|---|---|
| 30 | ~9,380 | ~118k |
| 40 | ~14,000 | ~235k |
| 50 | ~19,300 | ~400k |
| 59 | ~24,900 | ~600k |

So 30→60 costs ~4× the whole campaign's XP. With `killXp` (8 + 5·L) at L 45
≈ 233 per normal kill (×3.5 elite, ×14 boss), a zone run at its band is about
2.5-4k XP, so ~150 zone clears unscaled. That is far over "double the
gameplay". Two knobs, both in `progression.ts`:

- **Afterplay XP multiplier** `AFTER_XP_MUL = 2.2` on kills in invaded zones
  and siege waves.
- **Soft curve above 30**: `xpToNext(L) = base(L) * 0.75` for L > 30.

Target: ~60-75 invaded zone clears + 8-10 sieges + 7 bosses ≈ campaign length
(the campaign itself is the other half). Tune with the existing bot
(`sim/bot.ts`) by measuring clears per level.

`MAX_LEVEL` stays 30 until the afterplay unlocks (`afterplay` flag), so a
campaign hero cannot overshoot campaign content. Leaderboard lifetime XP is
unchanged in meaning.

### 2.2 Attributes

- 3 points per level continues: +90 points at 60.
- No hard attribute cap today; add a **soft cap at 300 per attribute**
  (beyond it each point counts 0.5) in `attributes.ts` so all-in builds do not
  break `killXp`/damage balance. Open question Q6.

### 2.3 Skills: ranks and capstones

Today all 96 skills unlock by level ~21 (GDD level ×0.7). The afterplay adds:

- **Rank II** for every active skill at hero level `skill.level + 20`
  (capped 50); **Rank III** at `+32` (capped 58). Rank II: +30 % effect,
  −10 % cooldown. Rank III: +60 % effect and a **rank twist** (one line per
  skill, e.g. Pyromancer's fireball leaves a burning patch, Aegis's shield
  bash stuns 0.3 s longer). Bought from the same trainers at
  `skillPrice(level + 20)` / `skillPrice(level + 32)`. Data: add
  `ranks?: [RankDef, RankDef]` to `SkillDef`; the effect code reads
  `rankMul(heroSkill)`. 64 twists to write (actives only), passives get
  numeric rank only.
- **One capstone skill per class** (16 new skills) at level 45, taught only at
  the fort, and only by a trainer who was rescued (B3-B9). Example names:
  Aegis "Bastion Wall", Shadowblade "Thousand Cuts", Pyromancer "Cinder Sun",
  Sovereign "Royal Legion", Chrono "Stopped Hour", Blood "Red Covenant",
  Aether "Orbital Lance", Geo "Tectonic Heart", Windrunner "Eye of the Gale",
  Frostwarden "Absolute Zero", Lightbringer "Dawnbreak", Beastcaller "Alpha's
  Call", Elementalist "Prism Storm", Soulwarden "Ferryman", Ironmonk
  "Unmoving Mountain", Bard "Encore". Capstones fit the existing
  8 active slots; no new slot.
- **No new passive slot.** A 5th passive slot is the siege's top reward
  instead (section 8.6), which makes the siege matter.

### 2.4 Items

The existing tier numbers mean rarity, not level. Proposal: keep rarities
1-7, add an **item level band** instead of new rarities.

- **Infernal** variants: every named unique that already exists can drop
  again in an invaded zone as `<id>` + `infernal: true`, level =
  `original level + 30`, mods × 1.9, a red-black tint, and one demon affix
  from a new 8-entry list in `mods.ts` (lifesteal vs demons, fire resist,
  +damage to mythic beasts, etc.). One data flag, no new art beyond a tint.
- **New legendary set per boss** (7 bosses × 2 uniques = 14 named items),
  tier 6, levels 34-58, `drop: { zone, src: 'boss' }`.
- **Seven Mythic pieces (tier 7)** from siege milestones (section 8.6) and
  from the Elder Dragon. Mythic stays rare: colosseum + siege + final boss only.
- **Heroic+ upgrade ranks**: `upgrade.ts` gains +6..+10 above today's cap,
  costing new ore **Demonglass** (drops from demons) and **Mythic Ichor**
  (bosses). Both added to `ores.ts` / sellable to existing traders.
- Shop tiers in the fort: slots across tiers [4, 5] scaled to the hero's
  level band, plus Infernal stock after B6.

---

## 3. Invasion overlay (general rules)

New data file `src/game/data/invasion.ts`:

```
INVASION: Record<ZoneId, { min, max, kinds, finale, boss?, tint, burn, waves? }>
```

- Same zone layout generator (`zoneGen.ts`) and layouts, so no new geometry
  per zone. The invasion changes kinds, levels, finale, and dressing.
- **Corruption tint**: per-zone ground/foliage colour shift via the existing
  theme palette (a `corrupt` palette per theme, 0.35 blend toward
  `#5a1a2a`), plus ember particles from the `ash` theme. Shader-free: it is a
  vertex-colour palette swap at build time, so the one-draw-call-per-location
  static batch is unchanged.
- **Burning ruins**: reuse `fallen` Oakhaven's ruin dressing and the `ash`
  theme's burnt trees/rocks in `dressing.ts`; 3-6 ruin props per section.
- **Rift scars**: 1-2 void pools per zone using the `void` liquid already in
  `citadel`/`rift`. They slow and deal shadow damage (like tundra ice cracks).
- **Demon pylons**: a destructible prop (turret rig, no attack) in each
  section; while it stands, demons in range get +20 % damage. Killing all
  pylons in a zone gives a chest. Teaches target priority early.

---

## 4. Per-zone invasion plan

Level bands roughly double the campaign's stretch over 30 levels. Two zones
per band, like the campaign.

| Zone (campaign band) | Invaded band | Roster (returning + new) | Boss | Environment |
|---|---|---|---|---|
| `plains` (1-3) | 31-33 | imp ×5, goblin (demon-touched) ×3, hellhound ×3, banditChief champion | finale: Demon Warband (highDemon + imps) | Burning Sunford fields, smoke |
| `hollows` (3-5) | 32-34 | hellhound ×3, imp ×3, gargoyle ×2 | finale: Tusker Reborn (demon-tinted tusker, existing script, +30 lvl) | Rift scars in the cave |
| `woods` (6-8) | 34-37 | spider ×3, corrupted treant ×2, harpy ×3, hellhound ×2 | **Chimera** | Black-thorn trees, burned clearings |
| `outskirts` (8-10) | 37-40 | centaur raider ×4, banditArcher (demon pact) ×2, imp ×2 | **Centaur Warchief** | Burned farms, ruined windmill |
| `crags` (11-13) | 40-43 | fireElemental ×3, cyclops brute ×2, cultist ×2, gargoyle ×2 | finale: Ember Lord Infernal | More lava pools |
| `mines` (13-15) | 42-45 | ironGolem ×2, cyclops brute ×2, imp ×3, demon miner ×2 | **Cyclops** | Collapsed shafts, red crystals |
| `tundra` (16-19) | 45-48 | frost hellhound ×3, frostGiant ×2, harpy ×2, skeleton ×2 | finale: Frost Jarl Reborn (`shatterlake`, +30) | Ice blood-red at edges |
| `temple` (17-20) | 46-49 | naga ×3, sphinx acolyte (mummy-cat) ×2, gargoyle ×2, necromancer ×1 | **Sphinx** | Sand-filled halls, plate puzzles (existing `plates`) |
| `citadel` (21-23) | 49-52 | voidStalker ×3, sea-demon (naga rig) ×3, highDemon ×2 | **Leviathan** | Flooded halls (citadel gets `water` liquid, river 0.7) |
| `peak` (24-25) | 52-55 | wyvern ×3, drake hatchling ×3, highDemon ×2 | Void Dragon Reborn (mid, `skyfire`) | Ash storm |
| `fortress` (26-30) | 54-57 | doomKnight ×2, imp ×4, hydra spawn ×2, pitLord champion | **Hydra** | Lava moat |
| `rift` (30) | 57-60 | voidling ×4, every new mythic as elite ×1 | **Elder Dragon** (final) | Torn sky; sealed at the end |

Each invaded zone keeps its campaign `sections` count, so a run takes as long
as the original. 12 zones × ~5-7 min ≈ 70 min for one pass; with leveling
reruns and sieges the afterplay lands at ~8-12 h, about the campaign's
length.

Zone access order: the map shows invaded zones unlocked by the quest chain,
not all at once, so the hero cannot wander into a lvl 57 zone at 31.

---

## 5. Bosses

All seven are scripts in `src/game/sim/bosses/<name>.ts`, registered in
`bosses/index.ts`, built from `kit.ts` (`move`, `warn`, `laneLength`,
charge-to-wall daze, `exit`). Each has 3 phases (100-60 / 60-30 / 30-0) like
`skyfire`, a dazed punish window, bark lines at intro/phase/death, and teaches
one skill. Boss health multipliers stay `boss: 14` × a script HP scale.

### 5.1 Chimera (Wildwood, lvl 37) — teaches **reading three heads**

- Rig `beast` (lion body), lion/goat/serpent heads as attached parts (same
  trick as `tusker`'s rider). Arena: forest clearing, 2 stone pillars.
- Each attack comes from one head and the head **glows its colour** 0.8 s
  first: lion (orange) = pounce leap (`leap`); goat (blue) = frost cone;
  serpent (green) = poison lob that leaves a pool.
- P2 (60 %): two heads glow together; the hero must pick the safe side.
- P3 (30 %): the serpent tail is cut off (a ground shockwave), the chimera
  speeds up 25 %; tail becomes a separate weak snake add.
- Punish: the pounce into a pillar → dazed 3 s (kit charge-wall rule).
- Rewards: Chimera Mane (helm, tier 6, lvl 37), Tri-Fang (dagger, tier 6),
  1 capstone tome token, 600 Demonglass.

### 5.2 Centaur Warchief (Outskirts, lvl 40) — teaches **kiting / range control**

- Rig `humanoid` on `beast` (reuse rider attach from `tusker`). Arena: open
  burned field, the widest arena in the afterplay.
- Always keeps 8-12 m away and shoots (`volley`, `rain` with arrows). When the
  hero closes in, it **trample-charges** through (lane warn 1.0 s).
- P2: two centaur raiders join; the Warchief circles the arena at speed and
  throws spears in lines (`spears` ability from the #136 plains boss).
- P3: dismount is not possible (centaur); instead it **rears up** before each
  charge, and charging into a hay wagon (destructible, 3 per arena) stuns it
  4 s. Teaches luring a fast enemy into obstacles.
- Rewards: Warchief's Longbow-gun (tier 6 gun), Hoofbreaker greaves (feet).

### 5.3 Cyclops (Mines, lvl 45) — teaches **weak points**

- Rig `golem` (big humanoid stand-in) with one large eye. Arena: mine hall
  with 4 support beams.
- Takes 80 % less damage except on the **eye**: the eye is only open and
  targetable for 2.5 s after it **misses a boulder throw** or **slams into a
  beam** (the beam breaks; rocks fall where the warning shows).
- Eye beam: a `line` beam swept across 90° (warned by a lit lane).
- P2: it covers its eye with a hand between attacks; the dazed window is the
  only opening.
- P3: blinded rage: attacks the last noise; dodge-rolling leaves no noise,
  running does. Teaches a calm dodge.
- Rewards: Eye of the Deep (trinket, tier 6: +crit vs dazed), Beam-Splitter
  shield.

### 5.4 Sphinx (Temple, lvl 49) — teaches **the puzzle phase**

- Rig `beast` (winged lioness) with `wyvern`-style wing parts.
- P1: fights normally (claw `cone`, sand `barrage`).
- At 60 %: **the Riddle**. She flies up and becomes untouchable; four
  pressure plates (existing `plates` puzzle in `zoneFeatures.ts`) light up
  with symbols. She shows a 3-4 symbol sequence (sun, moon, eye, wave), the
  hero steps them in order while sand blades sweep the floor. Correct: she
  falls, dazed 6 s, and takes +50 % damage for 10 s. Wrong: she heals 8 % and
  the riddle repeats with a new order.
- At 30 %: second riddle, sequence of 5, plus sand-spinning adds.
- No text riddle, only symbols, so no translation problem and works for
  every language.
- Rewards: Riddle-Crown (head, +int, cdr), Sandglass Wand.

### 5.5 Leviathan (Citadel, lvl 52) — teaches **the water arena**

- Rig `naga` scaled ×3 (head and neck only above water; body is hidden).
- Arena: flooded hall with 6 small stone islands; water slows the hero
  50 % and deals nothing; deep water ring at the edge is solid.
- It surfaces at one island edge (bubbles telegraph 1.2 s), bites, and dives.
  Only hittable while surfaced.
- **Tidal wave**: a `line` across the whole arena with one gap (same pattern
  as the Frost Jarl's rolling glacier), the hero must stand behind an island.
- P2: islands start sinking one by one (warned 3 s, they sink for 15 s).
- P3: it grabs the hero (hold 2 s, break free by mashing attack/dodge) unless
  dodged; adds: sea-demons.
- Rewards: Leviathan Scale (body armour + the water-walk relic), Tidecaller
  staff.

### 5.6 Hydra (Dread Fortress, lvl 57) — teaches **burning the stumps**

- Rig `dragon` with no wings and 3 neck parts (`naga` neck geometry ×3).
- Each head has its own health bar (small plates). Cutting one off leaves a
  stump that **regrows two heads in 8 s** unless it is hit with fire.
- Fire sources: any fire skill (Pyromancer, Elementalist, burn-on-hit
  items), or 4 **braziers** at the arena edge. Knocking a brazier over (hit
  it) makes a burning patch; luring a stump next to it cauterizes it. So
  every build can win.
- Max heads 7. Body is damageable only when 0 heads are left (5 s window),
  then 3 heads regrow and the next round starts. Three rounds.
- Rewards: Hydra-Scale Gauntlets, Many-Headed Flail (new weapon `kind:
  'flail'` uses the `hammer` swing), Hydra fire key.

### 5.7 Elder Dragon (Rift, lvl 60, final) — teaches **flight phases with ground cover**

- Rig `dragon`, scale 2.6, reusing `skyfire` patterns but with new beats.
- P1 (100-70): ground: sweeping breath, tail swipe (cone behind), wing gust
  (pushback 6 m).
- P2 (70-40): flight: strafing runs (`skyfire`) and **meteor rain** (`rain`
  with rock fx). 3 **rune stones** rise; standing behind one blocks the
  breath. Breath destroys a stone after 2 hits.
- P3 (40-15): ground again on a shrinking arena (void ring closes like the
  Arch-Demon's gate, to 9 m).
- P4 (15-0): the rift pulls the dragon back in; the hero has 30 s of burst
  damage while dodging falling void shards. Fail = it heals to 30 % and P3
  resumes.
- Rewards: **Heart of the Elder Dragon** (mythic trinket), Dragonbone
  Greatsword (tier 7), title "Sealer of the Rift", credits.

### 5.8 Returning "Reborn" bosses (cheap content)

Tusker, Ember Lord, Frost Jarl and Void Dragon return as Reborn finales with
their existing scripts, +30 levels, corruption tint, one extra add. Data only.

---

## 6. New enemies

| Id | Rig | Look | Behaviour (existing AI pattern) | Band |
|---|---|---|---|---|
| `hellhound` | beast | wolf recolour, flame mane | `leap` like `wolf`, leaves short burn patch | 31-48 |
| `frostHellhound` | beast | wolf blue-black | same, slow instead of burn | 45-48 |
| `gargoyle` | humanoid | stone demon | sleeps as a statue (no aggro until 4 m), then `slam` stun | 32-49 |
| `harpy` | wyvern | small, feathered | `volley` feathers, flees when hero adjacent (kite AI from banditArcher) | 34-48 |
| `corruptedTreant` | treant | treant tinted | `smash` roots like treant, + poison | 34-37 |
| `centaurRaider` | humanoid on beast | — | hit-and-run `charge` + `volley` | 37-40 |
| `cyclopsBrute` | golem | small cyclops | `slam`, weak while dazed | 40-45 |
| `demonMiner` | humanoid | dwarf recolour | `lob` bombs like goblinKing barrage | 42-45 |
| `sphinxAcolyte` | beast | cat-like | `cone` sand + teleport 5 m (voidStalker blink) | 46-49 |
| `seaDemon` | naga | naga dark | `volley` water + submerges (untargetable 2 s) | 49-52 |
| `drakeHatchling` | wyvern | small dragon | `cone` fire breath, weak | 52-55 |
| `hydraSpawn` | naga | 2-headed snake | two `lob` attacks, splits once on death | 54-57 |
| `demonPylon` | turret | spike | no attack, aura +20 % demon damage | all |

Returning enemies get an `infernal` variant via the invasion level table and
tint (no new art). 13 new enemy defs, 11 need new looks (2 are pylons/turrets).

---

## 7. The fort hub: Bastion Crossing

### 7.1 Layout

- New town node `bastion`, style `fort`, `site: 'walled'` (reuses Oakhaven's
  wall pieces), width 60. One gate north (to the map), one siege gate south.
- Quarters (same 20 m merged-quarter build as other towns):
  1. **Gate yard**: Captain Hale, siege bell, ballista platforms.
  2. **Teachers' ring**: up to 16 trainer spots (rescued trainers appear
     one by one, `needs: ['rescued<Class>']`).
  3. **Market row**: smith (Order or Circle based on `core`), armourer,
     peddler, Syndicate fence (if Oakhaven fell), fish trader.
  4. **Fair corner**: gamblers (existing item battle, cups, memory) + the new
     mini-games (section 9).
  5. **Infirmary + inn**: healer, innkeeper, survivors from the fallen towns.
- Towns during the afterplay: Sunford, Oakhaven, Ironhold get a
  `fallen`-style **overrun** variant (ruins, fires, 2-3 demons wander, no
  services) until their zone pair is cleared, then a **rebuilt** variant where
  the NPCs return (shop tiers +1). Silverbridge stays open but its masters
  move to the fort until B7 (open question Q4).

### 7.2 Services

| Service | NPC | Reuses |
|---|---|---|
| Rank II/III training, capstones | rescued trainers | trainer UI, `skillPrice` |
| Infernal smithing, Heroic+ upgrades | Forgemaster | `smithing.ts`, `upgrade.ts` |
| Shops lvl 31-60 | smith, armourer, peddler | `stock` |
| Siege | Captain Hale + siege bell | new mode (section 8) |
| Mini-games | gamblers | `gamble.ts` |
| Bounties (daily-ish errands) | Scout Wren | `errands.ts`, `contracts.ts` |
| Class trials (hidden classes) | Mysterious Wanderer | section 10 |

---

## 8. Castle siege event: Siege of Bastion

### 8.1 Format

- A new mode in `src/game/modes/` (like `zoneMode.ts`), on a fixed fort map:
  the fort's south half with walls, a gate (HP bar), and 3 lanes leading in.
- **10 waves**, ~60-90 s each, ~12-15 min total. Waves come down the lanes;
  the hero fights on the yard and the walls.
- **Win**: survive wave 10 and kill its siege boss. **Fail**: gate HP 0 or the
  hero dies with no revive. Fail keeps 50 % of earned Siege Marks.

### 8.2 Defences (build between waves, 15 s build phase)

| Defence | Cost (Siege Marks) | Effect | Reuses |
|---|---|---|---|
| Ballista | 3 | turret, pierce line every 2 s | `turret` rig, `line` ability |
| Fire cauldron | 2 | burning patch on a lane chokepoint | Pyro burn patch |
| Barricade | 1 | blocks a lane for 20 s / 400 HP | collision prop |
| Militia (2 guards) | 4 | ally `townGuard` units | ally AI (Sovereign minions) |
| Gate repair | 2 | +25 % gate HP | — |

Marks: 1 per elite killed, 3 per wave cleared, +2 if the gate took no damage.

### 8.3 Waves

| Wave | Content |
|---|---|
| 1-2 | imps, hellhounds |
| 3 | gargoyles leap onto walls |
| 4 | battering ram (slow, high HP; must be killed before the gate) |
| 5 | **mini-boss**: Centaur Raider captain or one Reborn boss (rotating) |
| 6-7 | mixed + harpies attacking ballistas |
| 8 | sappers: imps run at defences and explode |
| 9 | everything + 2 rams |
| 10 | **Siege Lord** (`pitLord` re-skinned, existing abilities) + elites |

### 8.4 Scaling and cadence

- Siege level = hero level (min 38). Enemy level = hero level + 1.
- Difficulty tiers: Normal, Hard (unlocks after a win, +3 lvl, +30 % HP),
  Nightmare (after B10 or "keep ajar", +6 lvl, 2 waves of mythic elites).
- Cadence: the siege bell rings after every **2 zone clears** in the
  afterplay (a banner on the map) and can be started at once from the fort.
  Optional, never forced after the story siege (B5). Open question Q8.

### 8.5 Fail/win feedback

Gate HP bar always visible; a horn bark at 50 % and 25 %; ram warning lane
like charge telegraphs; between waves a short summary toast.

### 8.6 Rewards (unique items)

- Per win: Siege Marks, gold (= 3 zone clears), 1 tier 5-6 item roll.
- **Siege milestones** (first clear only, like `ARENA_MILESTONES`):
  - Normal win 1: **Bastion Banner** (off-hand, aura +5 % to allies/minions)
  - Normal ×5: **Wallwarden's Plate** (body, tier 6)
  - Hard win: **Fifth Passive Slot** ("Veteran's Instinct", account unlock)
  - Hard ×5: **Gatebreaker** (tier 7 hammer)
  - Nightmare win: **Crown of the Last Bastion** (tier 7 head)
  - No-gate-damage Hard win: **hidden class trial** key (section 10)
- Marks also buy cosmetics (fort banner colours) and Demonglass.

---

## 9. Mini-games (fair vibe)

All live at the fort's fair corner, built like `gamble.ts` tables
(stakes from hero level, streak rounds, `prizeOf` item prizes), each with one
new gambler NPC.

1. **Whack-a-Imp** (Fair barker "Pip"). 3×3 grid of barrels; imps pop up for
   0.6-0.3 s; hit 20 in 30 s. Gold armored imps cost a life. Prize: gold,
   Demonglass, a rare trinket at streak 3. Pure tapping, mobile-perfect.
2. **Ring Toss at the Hydra** (barker "Old Bess"). A wooden hydra prop with
   heads moving; tap-and-hold for power, release to toss; ringing heads in a
   row multiplies. Prize: item-battle style, tiered by score.
3. **Fishing Derby** (fish trader). If the #136 fishing exists, a timed
   variant: biggest catch in 60 s at the fort moat; demon-fish only during
   the afterplay. Prize: trade fish for **Infernal lures** (a trinket line).
   If fishing is not built, skip.
4. **Arm-Wrestle the Forgemaster's apprentice** (rhythm mini-game). Tap in
   time with a pulsing ring; strength attribute gives +window. Prize: smithing
   discount for the day, Heroic+ material.

Daily cap: each mini-game pays full prizes 5 times per real day (or per 5
zone clears, Q9), then pays gold only, so it is no farm.

---

## 10. Hidden class unlocks and unique builds

Today: 8 base classes, 4 secret (windrunner, frostwarden, lightbringer,
beastcaller found through master tests), 4 open (elementalist, soulwarden,
ironmonk, bard). Proposal: **no 17th-20th full class** at first (16 × skill
tables is already wide), but **4 hidden hybrid "prestige" classes**, each with
3 skills (2 actives + 1 passive), learnable only when the hero already knows
skills of both parent classes:

| Prestige | Parents | Earned by | Signature |
|---|---|---|---|
| **Demonhunter** | Shadowblade + Lightbringer | Siege Hard win with no gate damage | marks demons, marked demons take +40 % |
| **Dragoon** | Windrunner + Aegis | kill the Elder Dragon without dying | jump attack from the sky, spear line |
| **Hexsmith** | Aether + Blood | Forge 5 Infernal items + Arm-wrestle streak 5 | turrets that drain HP |
| **Tidecaller** | Frostwarden + Elementalist | Leviathan + Fishing Derby record | waves that knock back and soak |

Taught by the **Mysterious Wanderer** in the fort, who appears only after the
unlock (like `secret:` trainers in Silverbridge). Each adds 3 skills to
`skills.ts` with `cls` = new ClassId, so `CLASS_IDS` grows to 20. Unique
builds also come from **set bonuses** on the boss uniques (2-piece: +20 % to
one skill school).

---

## 11. Economy and reward table

| Source | Gold (lvl 45 ref) | XP | Items | Materials |
|---|---|---|---|---|
| Invaded zone clear | `killGold` sum ≈ 2,400 | ≈ 7k with `AFTER_XP_MUL` | 2-3 tier 4-5, 10 % Infernal | 20-40 Demonglass |
| Pylon chest | 300 | — | 1 tier 5 | 10 Demonglass |
| Boss first kill | 5,000 | 1 level | 2 named uniques | 3 Mythic Ichor |
| Boss repeat | 1,500 | 25 % level | 1 named 20 % | 1 Ichor |
| Siege win Normal/Hard/Night | 4k/6k/9k | 1/1.3/1.6 level | milestone + 1 tier 6 roll | 50/80/120 Demonglass |
| Mini-game top streak | 600-1,200 | 10 % level (`battleXp`) | 1 rare trinket | 10 Demonglass |

Sinks: Rank II/III training (`skillPrice(level+20/32)` ≈ 4-11k each),
Heroic+ upgrades (+6: 8k … +10: 40k + Ichor), capstones (15k), siege
defences (Marks), fort rebuild donations (optional cosmetic: 5k-25k per town
to restore it early).

---

## 12. Art and asset manifest

| Asset | New / reused / recolour | Notes |
|---|---|---|
| Chimera | new look on `beast` rig + 3 head parts | painted icon + portrait |
| Centaur Warchief + raider | new humanoid upper body on `beast` | rider attach as Tusker |
| Cyclops + brute | new look on `golem` | eye part |
| Sphinx + acolyte | new look on `beast` + wyvern wings | |
| Leviathan + sea-demon | `naga` scaled, new head | water arena |
| Hydra + spawn | `dragon` no wings, 3-7 necks | heads as separate parts |
| Elder Dragon | `dragon` recolour + horns | |
| hellhound, frost hellhound | wolf recolour + flame mane | |
| gargoyle, harpy, demonMiner, drakeHatchling | new looks on existing rigs | |
| corruptedTreant, Reborn bosses, Infernal items | tint only | |
| Fort `bastion` | walls from Oakhaven `walled`, new: ballista, siege bell, banner props | merged quarter build |
| Overrun town variants | reuse `oakhavenFallen` ruins | |
| Corruption palettes | 10 theme palettes | data |
| Siege map | fort south half + 3 lanes | one new layout |
| Mini-game props | barrels, wooden hydra, ring, arm table | |
| **Painted icons** | 7 boss portraits, 13 enemy portraits, ~28 new named items, 16 capstone + 12 prestige skill icons, 64 rank twist badges (one shared Rank II / III frame instead → 2), 2 materials, 5 siege defences, 4 mini-game icons, 9 NPC portraits | ~95 icons, via `art-generation-pipeline` sheets |

---

## 13. Audio and VO list

- Music: one new "invasion" variation per existing biome track (code-composed
  soundtrack: transpose to minor + drums), one siege track, one final boss
  track.
- SFX: chimera roar ×3 heads, hooves, cyclops eye beam, sphinx riddle chime
  (4 symbols), leviathan surf/dive, hydra regrow hiss + cauterize sizzle,
  dragon roar, siege horn, ballista, ram hit, gate break, 4 mini-game SFX sets.
  Add to `sound-todo.md`.
- VO: ~78 lines (section 1.3) × 8 voiced languages (en, de, fr, es, ru, ja,
  pt, zh) ≈ 624 takes, plus barks for 13 enemies optional. Pipeline:
  `voice:manifest`, `voice:collect`, `voice:gen --engine chatterbox` per
  language, same task as the text. 9 new voice cards in `voice-cards.md`.

---

## 14. Performance notes (low-end mobile)

- Invaded zones reuse layouts and the one-draw-call static batch; tint is
  baked vertex colour, not a shader pass. No extra draw calls per zone except
  pylons (instanced, 1 draw).
- Corruption embers reuse the `ash` particle system with the `low` tier
  halving count, as today.
- Boss parts (chimera heads, hydra necks) are skinned children of one rig:
  budget max 3 extra draws per boss. Hydra caps at 7 heads (low tier: 5).
- Siege: cap 28 live enemies (low tier 18), ballista projectiles pooled;
  militia counts toward the cap. Measure with the existing perf probe and log
  results in `PERF-LEDGER.md` before shipping.
- Fort town: merged quarters like other towns; trainers that are not yet
  rescued are not built at all.
- Lazy-load afterplay assets (new rigs, boss looks, siege map) only after the
  `afterplay` flag is set (the #142 lazy loader).

---

## 15. i18n impact

- Rough string count: 78 dialogue lines, ~40 quest/map labels, 13 enemy + 7
  boss names, ~28 item names + descriptions, 16 capstones + 12 prestige skills
  (name + description each), 64 rank twist lines, siege UI (~30), mini-games
  (~30), fort (~20). **≈ 420 strings × 36 locales.**
- Sphinx riddle is symbols only. Siege and mini-game numbers use existing
  interpolation, no concatenation.
- The wiki/Codex entries stay English-only.

## 16. Save data and migration

- Bump `SAVE_VERSION` to 3 in `state/profile.ts`. New keys: `afterplay`
  (bool), `breakingStep` (0-10), `rescued` (set of class ids), `skillRanks`
  (map skill → 1-3), `siege` ({ wins per tier, best wave, marks,
  milestones }), `minigame` ({ id → best, daily count, day }),
  `prestigeUnlocked` (set), `townState` per town (`normal`/`overrun`/
  `rebuilt`), `fifthPassive` (bool).
- A v2 save loads with all defaults. A hero who already killed the Void Lord
  before the update gets `afterplay: true`, `breakingStep: 0` on load, and
  sees B0 on next map open.
- Level > 30 must not break the cloud save merge tiebreak (lifetime XP keeps
  being the tiebreak). Run the `verify-cloud-save-hydration` check.
- Leaderboard: lifetime XP grows ~5×; the snapshot bounds and any XP caps in
  the leaderboard Worker need a review (Q11).

---

## 17. Phased build plan

Each phase ships on its own (behind the `afterplay` flag until phase 3), with
tests via `budget.mjs run -- pnpm test` and `vue-tsc --build`.

| Phase | Scope | Tests | Size |
|---|---|---|---|
| P1 Level cap and ranks | `MAX_LEVEL` gated 30/60, `AFTER_XP_MUL`, soft attr cap, skill ranks data + effect scaling, rank UI in trainer | progression curve unit tests, rank price/effect tests, save v3 migration test | 1 worker, 2 days |
| P2 Invasion overlay | `invasion.ts`, tints, ruins dressing, pylons, level/enemy roster swap, Reborn bosses | zone gen snapshot per invaded zone, coplanar check on new dressing, bot clear-time sim | 1-2 workers |
| P3 Story + fort | Bastion Crossing town, overrun/rebuilt variants, quest chain B0-B5, Scout Wren, rescues | town build test, quest flag tests, VO manifest test (voice-todo) | 2 workers |
| P4 New enemies | 13 defs + looks (placeholder looks first, painted later) | enemy def validation, AI smoke in sim | 1-2 workers |
| P5 Bosses I | Chimera, Centaur, Cyclops scripts | per-script sim tests (telegraph emitted before damage, daze window, phase thresholds) like existing boss tests | 1 worker per boss |
| P6 Siege | siege mode, defences, waves, milestones, cadence | wave director tests, gate fail/win, reward once-only test | 2 workers |
| P7 Bosses II + chain B6-B10 | Sphinx, Leviathan, Hydra, Elder Dragon, ending | sphinx sequence test, hydra regrow/cauterize test, final phase heal-on-fail test | 1 worker per boss |
| P8 Items and capstones | Infernal flag, 14 boss uniques, mythics, Heroic+ ranks, Demonglass/Ichor, 16 capstones | item tables, upgrade cost tests, drop tables | 2 workers |
| P9 Mini-games | Whack-a-Imp, Ring Toss, Arm-Wrestle (+ Fishing Derby if fishing exists) | stakes/prize/daily-cap tests | 1 worker each |
| P10 Prestige classes | 4 hybrids, Wanderer, unlock conditions | unlock condition tests, class id list tests | 1-2 workers |
| P11 Content pass | VO all 8 languages, 36 locale translations, painted icons, music variants, perf sweep (`PERF-LEDGER.md`), blur probe | voice-todo complete test, locale parity test, perf A/B | parallel |

Shippable cut: P1-P3 + P5 + P6 already give "invaded world with 3 new bosses
and the siege", about +50 % playtime.

---

## 18. OPEN QUESTIONS for the owner

1. **Trigger boss**: the afterplay starts on the Void Lord's death (`rift`),
   and "Demon King" is his story name. Or should the Arch-Demon (`throne`) be
   the Demon King and the Void Lord stay a separate end?
2. **Level cap gate**: keep 30 until the Void Lord dies (recommended), or
   lift to 60 at once?
3. **XP pacing**: target afterplay length 8-12 h with `AFTER_XP_MUL = 2.2`
   and a 0.75 curve above 30. OK, or a shorter 5-6 h?
4. **Towns**: Sunford, Oakhaven, Ironhold overrun until their zones are
   cleared; Silverbridge stays open. Should Silverbridge also fall?
5. **Fort location and name**: "Bastion Crossing" on the Outskirts-Crags road.
   OK?
6. **Attribute soft cap** at 300 per attribute (0.5 per point beyond). OK, or
   no cap?
7. **Skills**: Rank II/III for actives + 1 capstone per class (16). Or fewer
   capstones (only for the 8 base classes)?
8. **Siege cadence**: bell after every 2 invaded zone clears, never forced.
   Or a real-time timer (e.g. every 20 minutes of play)?
9. **Mini-game cap**: 5 full-prize plays per real day, or per 5 zone clears
   (no real-time dependency, better for portals)?
10. **Prestige classes**: 4 hybrids with 3 skills each, or one full 17th class?
11. **Leaderboard**: lifetime XP grows ~5×. Keep XP as the score, or add a
    separate afterplay board (siege best wave)?
12. **Final choice** at B10 (seal vs keep ajar): keep this one new decision?
13. **Fifth passive slot** as a siege reward: OK for balance?
14. **VO volume**: ~78 new lines × 8 languages. OK, or voice only story +
    boss lines and leave fort ambient barks silent?
15. **Fishing Derby** depends on #136 fishing. Build fishing first or drop
    this mini-game?
16. **Painted icon budget**: ~95 new icons. Paint all, or tint/reuse for
    rank badges and Infernal items (already assumed)?
