# The Breaking: extension design decisions

Edit any bullet to change the design. The build follows this file and docs/gdd-afterplay.md, and this file wins on conflict.

## Defaults chosen for the open questions (change freely)

- (default) The afterplay starts when the Void Lord dies in the Rift; "Demon King" is his story title.
- (default) The level cap stays 30 until then, then rises to 60.
- (default) Target 8–12 h of afterplay (2.2× XP multiplier, ×0.75 curve above 30).
- (default) Silverbridge stays open (not overrun).
- (default) The fort is "Bastion Crossing" on the Outskirts–Crags road.
- (default) Soft cap of 300 per attribute; points beyond count half.
- (default) Capstones for all 16 classes.
- (default) The siege bell rings after every 2 invaded zone clears (no real-time timer).
- (default) Mini-game full prizes cap per 5 zone clears, not per real day.
- (default) Four hidden two-parent classes with 3 skills each.
- (default) Lifetime XP stays the leaderboard score.
- (default) Keep the seal-or-ajar choice at the end.
- (default) The 5th passive slot is a siege milestone reward.
- (default) Voice all new lines in all 8 VO languages (project rule: every voiced text gets VO).
- (default) Fishing Derby is dropped until fishing (#136) exists.
- (default) Paint boss, unique and class icons; tint or reuse existing icons for the rest.

## Trigger & story

- Working title: The Breaking. When the Void Lord dies, the rift tears open and demons and mythic beasts pour into every zone.
- The new beasts are chimera, cyclops, sphinx, centaur, leviathan, hydra and the Elder Dragon.
- Sunford, Oakhaven and Ironhold are overrun, Silverbridge's masters flee, and survivors gather at the fort Bastion Crossing.
- The quest chain "The Breaking" has beats B0–B10.
- B0: in the Rift, the rift screams (camera shake, red flash, three bubble lines).
- B1: Scout Wren (new NPC) finds the hero on the map; the fort node unlocks.
- B2: arrive at the fort, run by Captain Hale (or his replacement if Oakhaven fell); fort services go online.
- B3: clear invaded Plains and Hollows and rescue Sunford's trainers; they move to the fort.
- B4 (lvl 34): Chimera in the Wildwood; the Herbalist joins the fort.
- B5 (lvl 38): Centaur Warband in the Outskirts, then the first Siege of Bastion, which cannot be failed on the first try; siege unlocks as repeatable.
- B6 (lvl 42): Cyclops in Crags/Mines; the Forgemaster gets his forge back; Infernal smithing unlocks.
- B7 (lvl 46): Sphinx temple; the Oracle (if spared) or a new Sunken Priest speaks; reward Oracle's Lens (map shows invasion bosses).
- B8 (lvl 50): Leviathan in the flooded Citadel; reward Leviathan Scale (water walk on shallow tiles).
- B9 (lvl 54): Hydra in the Dread Fortress; reward Hydra fire key.
- B10 (lvl 57+): Elder Dragon at Dragonspine Peak, then the rift is sealed; ending, credits and "Sealed" title.
- Fallen Oakhaven puts the Syndicate Boss's black market in the fort; the core choice decides which smith runs the forge.
- The throne choice decides the B9 speaker (Arch-Demon's ghost or Syndicate Boss); the spared or slain Oracle decides the B7 speaker.
- One new decision at B10: seal the rift, or keep it ajar (colosseum gets demon waves, harder siege tier).
- Both endings lead to the same post-game loop.
- About 78 new story/boss/fort lines; 9 new voice cards (Scout Wren, Sunken Priest, 7 bosses).

## Levels & XP

- Max level rises from 30 to 60.
- The XP-to-next formula stays the same.
- Above level 30, XP needed per level is ×0.75.
- Kills in invaded zones and siege waves give ×2.2 XP.
- Target: about 60–75 invaded zone clears + 8–10 sieges + 7 bosses, roughly campaign length.
- Tune pacing with the existing bot by measuring clears per level.

## Attributes

- Still 3 attribute points per level (+90 by level 60).
- Soft cap of 300 per attribute; each point beyond counts 0.5.

## Skills

- Every active skill gets Rank II at hero level skill level + 20 (max 50).
- Rank III at skill level + 32 (max 58).
- Rank II: +30 % effect, −10 % cooldown; Rank III: +60 % effect plus one "rank twist" per skill.
- Twist examples: Pyromancer fireball leaves a burning patch; Aegis shield bash stuns 0.3 s longer.
- 64 rank twists for actives; passives get numeric ranks only.
- Ranks are bought from the same trainers at the skill price of level + 20 / + 32.
- One capstone skill per class (16) at level 45.
- Capstones are taught only at the fort, and only by a rescued trainer.
- Capstones: Aegis Bastion Wall, Shadowblade Thousand Cuts, Pyromancer Cinder Sun, Sovereign Royal Legion, Chrono Stopped Hour, Blood Red Covenant, Aether Orbital Lance, Geo Tectonic Heart, Windrunner Eye of the Gale, Frostwarden Absolute Zero, Lightbringer Dawnbreak, Beastcaller Alpha's Call, Elementalist Prism Storm, Soulwarden Ferryman, Ironmonk Unmoving Mountain, Bard Encore.
- Capstones use the existing 8 active slots; no new active slot.
- No new passive slot from levels; the 5th passive slot comes from the siege.

## Items

- Rarities stay 1–7; no new rarity.
- Every existing named unique can drop again as an Infernal variant in invaded zones.
- Infernal: level +30, mods ×1.9, red-black tint, one of 8 new demon affixes (e.g. lifesteal vs demons, fire resist, +damage to mythic beasts).
- Each new boss drops 2 tier-6 uniques (14 items, levels 34–58).
- Seven new Mythic (tier 7) pieces from siege milestones and the Elder Dragon.
- Mythic stays rare: colosseum, siege and final boss only.
- Upgrades gain Heroic+ ranks +6 to +10.
- Heroic+ costs new ore Demonglass (from demons) and Mythic Ichor (from bosses); both sell to existing traders.
- Fort shops stock tiers 4–5 scaled to hero level, plus Infernal stock after B6.
- Boss uniques have 2-piece set bonuses (+20 % to one skill school).

## Invasion

- Invaded zones reuse the same layouts; no new geometry per zone.
- The invasion changes enemy kinds, levels, finale and dressing.
- Corruption tint: 0.35 blend toward dark red (#5a1a2a), baked vertex colours, no shader.
- Ember particles from the ash theme; 3–6 burning ruin props per section, reusing fallen Oakhaven and ash dressing.
- 1–2 void pools per zone that slow and deal shadow damage.
- Each section has a destructible demon pylon giving nearby demons +20 % damage; killing all pylons in a zone gives a chest.
- Each invaded zone keeps its campaign section count.
- One pass of all 12 zones takes about 70 min.
- Invaded zones unlock through the quest chain, not all at once.

## Per zone

- Plains, lvl 31–33: imps, demon-touched goblins, hellhounds, bandit chief champion; finale Demon Warband; burning fields and smoke.
- Hollows, lvl 32–34: hellhounds, imps, gargoyles; finale Tusker Reborn; rift scars in the cave.
- Woods, lvl 34–37: spiders, corrupted treants, harpies, hellhounds; boss Chimera; black-thorn trees.
- Outskirts, lvl 37–40: centaur raiders, demon-pact bandit archers, imps; boss Centaur Warchief; burned farms, ruined windmill.
- Crags, lvl 40–43: fire elementals, cyclops brutes, cultists, gargoyles; finale Ember Lord Infernal; more lava pools.
- Mines, lvl 42–45: iron golems, cyclops brutes, imps, demon miners; boss Cyclops; collapsed shafts, red crystals.
- Tundra, lvl 45–48: frost hellhounds, frost giants, harpies, skeletons; finale Frost Jarl Reborn; blood-red ice edges.
- Temple, lvl 46–49: naga, sphinx acolytes, gargoyles, a necromancer; boss Sphinx; sand-filled halls.
- Citadel, lvl 49–52: void stalkers, sea-demons, high demons; boss Leviathan; flooded halls.
- Peak, lvl 52–55: wyverns, drake hatchlings, high demons; mid-boss Void Dragon Reborn; ash storm.
- Fortress, lvl 54–57: doom knights, imps, hydra spawn, pit lord champion; boss Hydra; lava moat.
- Rift, lvl 57–60: voidlings plus every new mythic as an elite; final boss Elder Dragon; torn sky.

## Bosses (general)

- All seven new bosses are scripted on the existing boss kit.
- Each has 3 phases (100–60 / 60–30 / 30–0), a dazed punish window, and intro/phase/death barks.
- Each boss teaches one skill.

## Chimera (Woods, lvl 37)

- Teaches reading three heads.
- Lion body with lion, goat and serpent heads; each head glows its colour 0.8 s before attacking; arena is a clearing with 2 stone pillars.
- Lion (orange) pounces; goat (blue) frost cone; serpent (green) poison lob leaving a pool.
- At 60 %, two heads glow together and the hero picks the safe side.
- At 30 %, the serpent tail is cut off (shockwave), becomes a weak snake add, and the chimera speeds up 25 %.
- Pouncing into a pillar dazes it 3 s.
- Rewards: Chimera Mane (helm), Tri-Fang (dagger), 1 capstone tome token, 600 Demonglass.

## Centaur Warchief (Outskirts, lvl 40)

- Teaches kiting and range control.
- Widest arena of the afterplay: an open burned field.
- Keeps 8–12 m away and shoots volleys and arrow rain.
- When the hero closes in, it trample-charges (1.0 s lane warning).
- Phase 2: two centaur raiders join; it circles fast and throws spear lines.
- Phase 3: it rears up before each charge; charging into a hay wagon (3 per arena) stuns it 4 s.
- Rewards: Warchief's Longbow-gun, Hoofbreaker greaves.

## Cyclops (Mines, lvl 45)

- Teaches weak points.
- Mine hall arena with 4 support beams.
- Takes 80 % less damage except on the eye, which opens for 2.5 s after a missed boulder throw or slamming into a beam.
- A broken beam drops rocks where the warning shows.
- Eye beam sweeps 90°, warned by a lit lane.
- Phase 2: it covers its eye between attacks; only the daze opens it.
- Phase 3: blind rage, it attacks the last noise; dodge-rolling is silent, running is not.
- Rewards: Eye of the Deep (trinket, +crit vs dazed), Beam-Splitter shield.

## Sphinx (Temple, lvl 49)

- Teaches the puzzle phase.
- Phase 1: claw cone and sand barrage.
- At 60 %, the Riddle: she flies up untouchable and four pressure plates light with symbols.
- She shows a 3–4 symbol sequence (sun, moon, eye, wave); the hero steps it while sand blades sweep.
- Correct: she falls, dazed 6 s, and takes +50 % damage for 10 s; wrong: she heals 8 % and the riddle repeats in a new order.
- At 30 %, a second riddle of 5 symbols plus sand-spinning adds.
- Riddles are symbols only, no text.
- Rewards: Riddle-Crown (head, +int, cooldown reduction), Sandglass Wand.

## Leviathan (Citadel, lvl 52)

- Teaches the water arena.
- Only head and neck show above water; flooded hall with 6 small islands; water slows the hero 50 % but does no damage.
- It surfaces at an island edge (1.2 s bubbles), bites and dives; only hittable while surfaced.
- Tidal wave crosses the whole arena with one gap; hide behind an island.
- Phase 2: islands sink one by one (3 s warning, gone 15 s).
- Phase 3: an undodged grab holds the hero 2 s (mash to break free); sea-demon adds.
- Rewards: Leviathan Scale (body armour + water-walk relic), Tidecaller staff.

## Hydra (Fortress, lvl 57)

- Teaches burning the stumps.
- Each head has its own health bar; a cut stump regrows two heads in 8 s unless hit with fire.
- Fire comes from any fire skill, burn-on-hit items, or 4 braziers at the arena edge.
- A knocked-over brazier makes a burning patch that cauterizes nearby stumps, so every build can win.
- Max 7 heads (5 on low tier).
- The body is hittable only at 0 heads for 5 s, then 3 heads regrow; three rounds.
- Rewards: Hydra-Scale Gauntlets, Many-Headed Flail (new flail weapon), Hydra fire key.

## Elder Dragon (Rift, lvl 60, final)

- Teaches flight phases with ground cover.
- Phase 1 (100–70): ground breath sweep, tail swipe behind, wing gust pushback 6 m.
- Phase 2 (70–40): flight strafing runs and meteor rain; 3 rune stones block breath, each breaks after 2 hits.
- Phase 3 (40–15): ground fight on an arena shrinking to 9 m.
- Phase 4 (15–0): 30 s burst window while dodging void shards; failing heals it to 30 % and repeats phase 3.
- Rewards: Heart of the Elder Dragon (mythic trinket), Dragonbone Greatsword (tier 7), title "Sealer of the Rift", credits.

## Reborn bosses

- Tusker, Ember Lord, Frost Jarl and Void Dragon return as Reborn finales: existing script, +30 levels, corruption tint, one extra add.

## New enemies

- 13 new enemy types, 11 with new looks.
- Hellhound: flaming wolf, leaps, leaves a short burn patch (lvl 31–48).
- Frost hellhound: blue-black wolf, slows instead of burns (lvl 45–48).
- Gargoyle: sleeps as a statue until within 4 m, then stun slam (lvl 32–49).
- Harpy: feather volleys, flees when the hero is adjacent (lvl 34–48).
- Corrupted treant: root smash plus poison (lvl 34–37).
- Centaur raider: hit-and-run charge plus volley (lvl 37–40).
- Cyclops brute: slam, weak while dazed (lvl 40–45).
- Demon miner: throws bombs (lvl 42–45).
- Sphinx acolyte: sand cone plus 5 m teleport (lvl 46–49).
- Sea-demon: water volley, submerges untargetable 2 s (lvl 49–52).
- Drake hatchling: weak fire breath (lvl 52–55).
- Hydra spawn: two-headed snake, two lobs, splits once on death (lvl 54–57).
- Demon pylon: no attack, +20 % demon damage aura (all zones).
- Returning enemies get Infernal variants by level and tint only.

## Fort

- Walled fort reusing Oakhaven's walls; north gate to the map, south siege gate.
- Gate yard: Captain Hale, siege bell, ballista platforms.
- Teachers' ring: up to 16 trainer spots; rescued trainers appear one by one.
- Market row: smith (Order or Circle), armourer, peddler, Syndicate fence (if Oakhaven fell), fish trader.
- Fair corner: existing gamblers plus the new mini-games.
- Infirmary and inn: healer, innkeeper, survivors.
- Sunford, Oakhaven and Ironhold are overrun (ruins, fires, 2–3 wandering demons, no services) until their zones are cleared.
- After clearing, those towns are rebuilt and NPCs return with shop tiers +1.
- Silverbridge's masters move to the fort until B7.
- Scout Wren gives bounties (daily-ish errands).
- A Mysterious Wanderer teaches hidden classes.
- Optional donations (5k–25k per town) restore a town early.

## Siege

- Siege of Bastion is a new mode on a fixed map: the fort's south half, walls, a gate with HP, 3 lanes.
- 10 waves of about 60–90 s each, 12–15 min total.
- Win: survive wave 10 and kill its siege boss.
- Fail: gate HP 0 or hero dies with no revive; fail keeps 50 % of earned Siege Marks.
- 15 s build phase between waves.
- Defences: ballista 3 Marks (piercing shot every 2 s), fire cauldron 2 (burning chokepoint), barricade 1 (blocks a lane 20 s / 400 HP), militia 4 (2 allied guards), gate repair 2 (+25 % gate HP).
- Marks: 1 per elite, 3 per wave, +2 if the gate took no damage.
- Waves: 1–2 imps and hellhounds; 3 gargoyles leap onto walls; 4 a battering ram that must die before the gate; 5 mini-boss (centaur raider captain or a rotating Reborn boss).
- Waves: 6–7 mixed with harpies attacking ballistas; 8 exploding imp sappers; 9 everything plus 2 rams; 10 Siege Lord (reskinned pit lord) plus elites.
- Siege level = hero level (min 38); enemies are hero level + 1.
- Hard unlocks after a win (+3 levels, +30 % HP); Nightmare unlocks after B10 or "keep ajar": +6 levels, 2 waves of mythic elites.
- The siege is optional after the story siege and can be started any time from the fort.
- Gate HP bar always visible; horn bark at 50 % and 25 %; ram lane warnings; summary toast between waves.
- Each win: Marks, gold worth 3 zone clears, 1 tier 5–6 item roll.
- Milestones: Normal win Bastion Banner (off-hand, +5 % aura to allies/minions); Normal ×5 Wallwarden's Plate (tier 6 body).
- Milestone: Hard win unlocks the Fifth Passive Slot "Veteran's Instinct" (account-wide).
- Milestones: Hard ×5 Gatebreaker (tier 7 hammer); Nightmare win Crown of the Last Bastion (tier 7 head).
- Milestone Hard win with no gate damage: hidden class trial key.
- Marks also buy fort banner colours and Demonglass.

## Mini-games

- All at the fort's fair corner, each with its own new gambler NPC, built like the existing tables.
- Whack-a-Imp (barker Pip): 3×3 barrels, imps up 0.6–0.3 s, hit 20 in 30 s; gold armoured imps cost a life; prizes gold, Demonglass, rare trinket at streak 3.
- Ring Toss at the Hydra (barker Old Bess): hold for power, release to toss; consecutive ringed heads multiply; prizes tiered by score.
- Arm-Wrestle the Forgemaster's apprentice: tap in rhythm, strength widens the window; prizes smithing discount and Heroic+ material.
- Fishing Derby: 60 s biggest catch at the moat, prize Infernal lures; only if fishing exists.
- After 5 full-prize plays, a mini-game pays gold only.

## Hidden classes

- No full 17th class; instead 4 hidden hybrid prestige classes, 3 skills each (2 actives, 1 passive).
- A prestige class needs known skills from both parent classes.
- Demonhunter (Shadowblade + Lightbringer): earned by a no-gate-damage Hard siege win; marked demons take +40 %.
- Dragoon (Windrunner + Aegis): earned by killing the Elder Dragon without dying; sky jump attack, spear line.
- Hexsmith (Aether + Blood): earned by forging 5 Infernal items + Arm-Wrestle streak 5; HP-draining turrets.
- Tidecaller (Frostwarden + Elementalist): earned by Leviathan + a Ring Toss perfect round (default, while the Fishing Derby is dropped); knockback soaking waves.
- The class count grows to 20.

## Economy

- Invaded zone clear (lvl 45): about 2,400 gold, about 7k XP, 2–3 tier 4–5 items (10 % Infernal), 20–40 Demonglass.
- Pylon chest: 300 gold, 1 tier 5 item, 10 Demonglass.
- Boss first kill: 5,000 gold, 1 level of XP, 2 named uniques, 3 Mythic Ichor.
- Boss repeat: 1,500 gold, 25 % of a level, 20 % chance of a named unique, 1 Ichor.
- Siege win Normal/Hard/Nightmare: 4k/6k/9k gold, 1/1.3/1.6 levels, 50/80/120 Demonglass.
- Mini-game top streak: 600–1,200 gold, 10 % of a level, 1 rare trinket, 10 Demonglass.
- Rank II/III training costs about 4–11k each.
- Heroic+ upgrades cost 8k at +6 up to 40k plus Ichor at +10.
- Capstones cost 15k.

## Art

- New looks: Chimera, Centaur Warchief and raider, Cyclops and brute, Sphinx and acolyte, Leviathan and sea-demon, Hydra and spawn, gargoyle, harpy, demon miner, drake hatchling.
- Elder Dragon and hellhounds are recolours with extras (horns, flame mane).
- Corrupted treant, Reborn bosses and Infernal items are tint only.
- New props: ballista, siege bell, banners, barrels, wooden hydra, rings, arm-wrestle table.
- Overrun towns reuse fallen Oakhaven ruins; 10 corruption palettes; one new siege map layout.
- About 95 painted icons via the art pipeline.
- One shared Rank II / Rank III frame instead of 64 twist badges.

## Audio/VO

- Music: one "invasion" variation per biome track (minor key + drums), one siege track, one final boss track.
- New SFX for each boss, siege horn, ballista, ram, gate break, and 4 mini-game sets.
- About 78 voiced lines × 8 languages (en, de, fr, es, ru, ja, pt, zh) ≈ 624 takes.
- Enemy barks for the 13 new enemies are optional.
- New lines are voiced in the same task as the text.

## Performance

- No extra draw calls per zone except pylons (instanced, 1 draw).
- Embers reuse the ash particles (low tier halves them); boss parts add max 3 draws per boss.
- Siege caps 28 live enemies (18 on low tier), militia included; ballista projectiles are pooled.
- Unrescued trainers are not built at all.
- Afterplay assets lazy-load only after the afterplay unlocks.
- Measure with the perf probe and log results before shipping.

## i18n

- About 420 new strings, translated into all 36 locales.
- No string concatenation (numbers use interpolation); the wiki/Codex stays English-only.

## Save

- Save version goes from 2 to 3.
- New save data: afterplay flag, story step, rescued trainers, skill ranks, siege stats, mini-game stats, prestige unlocks, town states, fifth passive.
- Old saves load with defaults; a hero who already killed the Void Lord gets the afterplay on load and sees B0 on next map open.
- Lifetime XP stays the cloud save merge tiebreak.
- Leaderboard bounds and XP caps need a review because lifetime XP grows about 5×.

## Build phases

- Everything stays behind the afterplay flag until phase 3.
- P1 level cap, XP multiplier, attribute soft cap, skill ranks; P2 invasion overlay, pylons, rosters, Reborn bosses.
- P3 fort, overrun/rebuilt towns, story B0–B5, rescues; P4 13 new enemies (placeholder looks first).
- P5 Chimera, Centaur Warchief, Cyclops; P6 siege.
- P7: Sphinx, Leviathan, Hydra, Elder Dragon, story B6–B10.
- P8 Infernal items, boss uniques, mythics, Heroic+, new materials, capstones; P9 mini-games; P10 prestige classes.
- P11: VO, translations, painted icons, music, perf sweep, blur probe.
- Shippable first cut: P1–P3 + P5 + P6 (about +50 % playtime).
