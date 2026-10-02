- [ ] #1 The game needs better ULTRA-HIGH-CTR(20%+) cover images painted with
  Gemini for all the platforms (800x800, 1920x1080, 1080x1920(only jpg), 800x1200(only webp), 1360x850(only with logo, only jpg), 800x450(only with logo, only webp), 400x225(only with logo, only jpg),
  512x512(only with logo, only jpg), 628x628(only with logo, only jpg), 512x384(only with logo, only jpg), 512x340(only with logo, only jpg) in jpg, and webp, once without a logo, once with a logo somewhere that is not in the top left corner as CG banners are placed in top left corner up to the middle of the image horizontally).
  Create 4 different new cover image scenarios (like the current non-painted ones), paint them once in Gemini and compare them with the old cover images(not painted) for the CTR value. Go with the best results that would potentially and based on web-search evidence yield the best CTR results on web game platforms and Steam.

- [ ] #35 Let's start on using the voice-over pipeline to create VOs for each NPC. 
  DON'T START WITHOUT MY WON INITIATED REQUEST TO START IT. 

- [ ] #36 let's do another round of optimizing hot-path loading during start up, postponing non-critical assets to lazy loading after all critical assets were loaded for the current scene based on player progress and level position.  
  That should make the game startup faster and happier players (should not create asset pop-ins)
  DON'T START WITHOUT MY WON INITIATED REQUEST TO START IT.

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
