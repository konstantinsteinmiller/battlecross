- [ ] #1 The game needs better ULTRA-HIGH-CTR(20%+) cover images painted with
  Gemini for all the platforms (800x800, 1920x1080, 1080x1920(only jpg), 800x1200(only webp), 1360x850(only with logo, only jpg), 800x450(only with logo, only webp), 400x225(only with logo, only jpg),
  512x512(only with logo, only jpg), 628x628(only with logo, only jpg), 512x384(only with logo, only jpg), 512x340(only with logo, only jpg) in jpg, and webp, once without a logo, once with a logo somewhere that is not in the top left corner as CG banners are placed in top left corner up to the middle of the image horizontally).
  Create 4 different new cover image scenarios (like the current non-painted ones), paint them once in Gemini and compare them with the old cover images(not painted) for the CTR value. Go with the best results that would potentially and based on web-search evidence yield the best CTR results on web game platforms and Steam.

- [ ] #35 Let's start on using the voice-over pipeline to create VOs for each NPC. 
  DON'T START WITHOUT MY WON INITIATED REQUEST TO START IT. 

- [ ] #36 let's do another round of optimizing hot-path loading during start up, postponing non-critical assets to lazy loading after all critical assets were loaded for the current scene based on player progress and level position.  
  That should make the game startup faster and happier players (should not create asset pop-ins)
  DON'T START WITHOUT MY WON INITIATED REQUEST TO START IT.

## Playtest pass (owner's notes, 2026-10-02)

Build order and the decisions taken are in `game-implementation-plan.md`
(phases 12 onward). A tick means committed and verified in a real browser.

### Look and feel of the world

- [x] #37 ✅ **The map never ends in a cut.** No hard edge of ground against a
  flat sky: the land continues past the playable area (scenery ring, distance
  haze, a horizon) in every zone and town.
- [x] #38 ✅ **Attack choreography.** Every character's attacks are staged:
  anticipation, a fast strike, follow-through, recovery; per weapon family
  (sword, axe, dagger, staff, gun, shield) and per enemy kind.
- [x] #39 ✅ **Swing trails and impact effects on every attack.** Each melee
  swing leaves a weapon trail; every hit (melee, projectile, spell) has an
  impact effect sized to the blow, so an attack is always visible.
- [x] #40 ✅ **Better human models.** Heroes, townsfolk and human enemies stop
  reading as dolls: proportions, hands, faces, hair, layered clothing.
- [x] #41 ✅ **Town houses redesigned.** Believable, appealing buildings (timber
  frame, stone base, roofs with overhang, chimneys, windows, doors, signs).
- [x] #42 ✅ **Town life.** Trainers and townsfolk have a place and a small
  routine (wander a small area, eat, drink, smoke, spar, small-talk); some
  trainers are inside houses instead of standing in a row.
- [x] #43 ✅ **Ground attack previews redrawn.** Cleaner shapes, a readable fill
  that shows when the blow lands, clear edges, friend and foe told apart.
- [x] #44 ✅ **Health bars with 25 / 50 / 75 % marks and frames.** Over-head bars
  get frames with ornaments by rank (minion, elite, champion, boss); the
  hero's health, mana and experience bars get the same treatment (no
  ornaments on the experience bar).

### Interface

- [x] #45 ✅ **F-components in the Battlecross style.** Buttons, windows, tabs,
  sliders, selects and HUD chips match the colourful cel-shaded chibi look.
- [x] #46 ✅ **Dialogue system.** Talking to an NPC is a conversation in the
  world: speech bubbles over heads, a choice list, stable dialogue line ids
  (ready for voice-over), no jump into a window. Quest decisions run in it.
- [x] #47 ✅ **Trading that feels like a trade.** A two-sided trade screen
  (the merchant's goods, your bag, what changes hands and for how much),
  reached from the conversation.
- [x] #48 ✅ **Equipment screen.** A paper-doll with equipment slots fed from an
  inventory (drag or tap to equip, compare, unequip).
- [x] #49 ✅ **Skills screen overhaul.** Learned skills, the slots they sit in
  and the classes they come from, made attractive and clear.
- [x] #50 ✅ **Battle skill buttons.** The skill buttons in a fight get real
  art (frames, states: ready, cooling down, no mana, locked).
(m) => m + '  Deferred: the skill-button and bar FRAMES as painted files — they need a transparent window and a three-slice shape the pipeline does not offer yet; the code-drawn frames stay.\n'- [ ] #52 **Paced introductions.** The player is led, a step at a time, to:
  how to fight (before the very first fight), using a skill, equipping an
  item, learning a skill (on entering the town), spending attribute points.

### Sound

- [x] #53 ✅ **New soundtrack.** Slow, adventurous, harmonious action-RPG music:
  violins and piano, occasional bongos and drums.

### Levels

- [x] #54 ✅ **Loot chests.** Openable chests with a fixed loot table per zone
  level (items, equipment, health and mana potions, gold).
- [x] #55 ✅ **Optional corners.** Side areas off the main road: a lone enemy
  guarding something, or an optional enemy well above the zone's level for a
  hero whose build can take it.
- [x] #56 ✅ **Simple puzzles.** Pressure plates stepped on in the right order
  open a hidden passage to a chest that could not be seen before; solvable by
  a ten-year-old.
- [x] #57 ✅ **Elevation.** Hills, ledges and ramps, so a level is not one flat
  floor.
- [x] #58 ✅ **Water.** Rivers with crossings and small ponds to walk around.
- [x] #59 ✅ **Tunnels and caves** that hide loot or optional enemies.
- [x] #60 ✅ **More ideas for levels** written up in `level-ideas.md`.
- [ ] #62 House interiors in the sunford city and everywhere need higher quality furniture and the houses need to look like houses people live in or for Inns, like they visit them, with props that tell an environmental story.
- [x] #63 ✅ The dialogs feel a bit mechanical and not how normal people would talk. Please improve that, make the people talk in a more human way, not so weirdly "try-hard comical", they can be funny, but not this cased sentences.
- [ ] #64

### World map

- [x] #61 ✅ **A world map worth looking at.** An illustrated map instead of
  dots on a gradient: drawn regions (woods, mountains, snow, lava, the void),
  winding roads, a landmark per place (cave mouth, castle, temple, volcano),
  the hero travelling along the road, drifting clouds over what is still
  locked, a compass and a cartouche, life in the details.

---

# Battlecross roadmap: D1 retention, playtime, conversion

Ordered by expected effect per unit of work. Each item names the metric it is
for, what to build on the existing systems, and how to tell it worked. Nothing
here is built yet; the shipped game is in `game-implementation-plan.md`.

**Where the game stands (the baseline these should move):** a first session
is the opening fight (about 30 s), the first town, and the Goblin Hollows
(about 2 min, the first boss and the first permanent decision). A full clear
of the 12 zones is roughly 30 to 40 minutes of fighting for a focused player.
There is no reason yet to come back tomorrow other than "continue".

## A. First session (D1 starts in minute one)

- [ ] #2 **A goal on screen from the first second.** A one-line quest tracker
  under the zone name ("Clear the road to Sunford 0/3", then "Learn a second
  skill", "Beat the Goblin King"). It reuses `hud.groupsDone` and the quest
  data. *Metric: share of new players who reach the first town and the first
  trainer.*
- [ ] #3 **A guided first town visit.** After the first win the map opens on
  Sunford with the node pulsing; in town, a wordless pointer walks the player
  to the trainer, then to the hero sheet (3 points waiting). The lesson
  framework (`game/coach.ts`) already retires by use. *Metric: share of
  players with 2+ skills and 0 unspent points when they enter the Hollows.*
- [ ] #4 **A free second skill.** The first trainer visited teaches their
  first skill for free. Two buttons by minute three is what makes the build
  system visible. *Metric: time to second skill; D1.*
- [ ] #5 **Loot that is felt.** A beam and a short fanfare on an item drop, a
  "better than what you wear" arrow on the toast and in the bag, and an
  "Equip" button on the result screen. *Metric: share of drops equipped within
  the session.*
- [ ] #6 **Level-up in the fight.** A full heal and a 1 s slow-motion burst on
  level-up, with the "+3 points" chip parked on the hero button until spent.
  *Metric: unspent points at session end.*

## B. Reasons to come back (D1, D7)

- [ ] #7 **Daily bounty board in each town.** Three seeded bounties a day
  ("Clear the Woods with no potion", "Beat 30 spiders", "Win the Hollows under
  90 s") for gold and a chest. It runs on the existing zone seeds and run
  tally, with no server. *Metric: D1, D7, sessions per day.*
- [ ] #8 **Elite re-runs: three skulls per zone.** Cleared zones offer +1/+2/+3
  difficulty with better gold and the zone's missing drops guaranteed over
  time. The difficulty multiplier and the level clamp already exist in
  `flow.setupFor`. *Metric: playtime per player after the first clear.*
- [ ] #9 **Rested bonus.** Up to 2 hours of double XP accrued while away,
  shown on the map on return. *Metric: D1, D3.*
- [ ] #10 **The colosseum as an endless ladder.** Waves past 8 with a personal
  best, a weekly modifier (all fire, no potions), and the leaderboard that
  already exists ranking the best wave. *Metric: sessions per day, D7.*
- [ ] #11 **A codex.** Items, monsters and skills seen, with the 44-item
  collection at "31 / 44" and where each missing one drops (the data is
  already on the map card). *Metric: zones replayed for a specific drop.*

## C. Depth and playtime

- [ ] #12 **New Game+ ("The Unbound Realm").** After the throne, the world
  resets at +30 enemy levels with the hero kept, and decisions can be made
  the other way: five endings and two Oakhavens are content most players
  never see. *Metric: playtime of players who finish.*
- [ ] #13 **Balance pass on the single-class tank and the support.** The
  reference bot fails late zones as a pure Aegis Knight or Chrono-Weaver
  (`tests/game/balance.test.ts`); raise their damage floor so the first
  class a player commits to never dead-ends. *Metric: defeat rate by build
  in zones 7 to 12.*
- [ ] #14 **Build presets and a respec.** Save and name two loadouts; respec
  attribute points for gold at the healer. Removes the fear of spending
  points. *Metric: share of players who try a second class.*
- [ ] #15 **Faction quests and a reputation track.** Short repeatable
  contracts per faction with a visible −5…5 track and a reward at +3 and +5
  (a discount exists already). Gives the three factions weight before the
  throne. *Metric: playtime between tiers 2 and 5.*
- [ ] #16 **A fantasy soundtrack.** The music is the predecessor's
  code-composed electronic set, re-mapped to the zone themes. Score seven
  themes (town, plains, forest, cave, fire, ice, void) plus a boss theme in
  the same sequencer, or drop files in (`sound-todo.md`). *Metric: session
  length; mute rate.*
- [ ] #17 **Painted icons and portraits through the art pipeline.** 44 items,
  48 skills, the speakers' portraits and the map parchment replace the vector
  placeholders by file name (`art-todo.md`). *Metric: store CTR with real
  screenshots; D1.*

## D. Conversion (ads without hurting retention)

- [ ] #18 **Rewarded "second wind".** On defeat, one revive per visit at
  half health for a rewarded video, offered before the result screen. Only
  where the portal's rewarded inventory is ready (the gating code is kept in
  `use/ads`). The brief excluded rewarded buttons from the first build;
  this is the single placement worth testing first. *Metric: rewarded
  impressions per DAU; D1 must not drop.*
- [ ] #19 **Rewarded "double the purse"** on the result screen, and a
  rewarded "merchant's rare shelf" refresh in towns. *Metric: ARPDAU.*
- [ ] #20 **Interstitial pacing by content, not only by clock.** Keep the
  121 s floor, and never show one after the opening fight, after a defeat, or
  before a decision. Today the only rule is the clock.
  *Metric: session length after the first ad.*

## E. Reach

- [ ] #21 **Store art and a gameplay clip per portal** from the video
  pipeline (`pnpm preview:video`), and A/B covers (item #1 above).
- [ ] #22 **Share card.** After an ending, a generated image: the hero, their
  six skills and the ending's name. *Metric: referrals where portals allow
  sharing.*
