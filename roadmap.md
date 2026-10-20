- [x] #1 ✅ The game needs better ULTRA-HIGH-CTR(20%+) cover images painted with
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
  Deferred: the skill-button and bar FRAMES as painted files — they need a transparent window and a three-slice shape the pipeline does not offer yet; the code-drawn frames stay.
- [ ] #52 **Paced introductions.** The player is led, a step at a time, to:
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
- [x] #62 ✅ House interiors in the Sunford city and everywhere need higher quality furniture and the houses need to look like houses people live in or for Inns, like they visit them, with props that tell an environmental story.
- [x] #63 ✅ The dialogs feel a bit mechanical and not how normal people would talk. Please improve that, make the people talk in a more human way, not so weirdly "try-hard comical", they can be funny, but not this cased sentences.
- [x] #64 ✅ Create a Brawlstars like bg-tile for the FLogoProgress background with whitish outline assets (not so densely packed) that scroll to the bottom right very slowly while the Mascot/logo and the loading bar shows.
- [x] #65 ✅ Design a fitting logo (save as painted image to /public/images/logo) and favicon, also update the mascot on FLogoProgress to make it look professional, the logo and mascot need to be in the games art style and very appealing.
- [x] #66 ✅ GameMonetize readiness: make the game ready for a GameMonetize release using the new-web-game-playbook
- [x] #67 ✅ I want the player to move freely on the map like in Battleheart Legacy, moving on the map can lead to occasional random encounters. 
 Also turn the market stands in the town towards where they are accessible.
- [x] #68 ✅ arrange furniture and staircases  well in the houses of the town
- [x] #69 ✅ The targeted playerbase is 10-15 years old, and they get bored running around without directions or goals, lets add attention bounces and other effective, yet not aggressive player guidance mechanisms to keep the player on the adventure track.
- [x] #70 ✅ currently each zone has a single path and a single boss, lets add more branching paths and more bosses per zone to make the game more interesting and replayable.
  Also cave levels could have a second floor leading downwards with a stone staircase for example.
  Overall there should be more variety, so level exploration is fun and the rewards in terms of loot chests are worth it.
  add simple puzzles to the levels, like stepping on pressure plates in the right order to open a hidden passage to a loot chest that could not be seen before, solvable by a ten-year-old.
- [x] #71 ✅ The player should be able to choose between male and female hero at the start of selection.
  The outfit of the player 3d character should change with the equipment equipped. For starters its fine if the default equipment stays the same for the male, especially the cape is nice.
- [x] #72 ✅ The female character has no painted portrait yet, do it, don't show the exp bar around the portrait on the world map. the portrait image is flipping when changing direction, but at least the female portrait is facing its face into the exact opposite direction of where the player moves with WASD.
  The Fog of war on the map is nice, but the player should be able to lift the fog of war and wander into too high areas early, its just their fault if they die there, also show a level at the top right corner of every maps locations names badge, so that the player can see if their players level in in the range of the locations level or if its too high (color code "too low" levels with a light green, perfect level in range match to green color, slightly to strong level range is colored in dark orange, too high level range e.g. 7+ levels difference is colored in red and 10+ level difference is colored in scary dark reddish color and has a painted skull icon right of the level range text within the badge). 
- [x] #73 ✅ Run the full chatterbox translations in english and keep them updated by running a single source of truth for each VO text line. Also add a memory in this project to not forget to update VOs with chatterbox in case text of characters changes. Use the players character voice(male/female) to narrate letters and quests texts, so the player has to read less and it appeals to children more, they are also updated on change and VOes with Chatterbox right away but only in english.
- [x] #74 ✅ the cinematic trailer has shown that the 3d models and effects are not good enough for a cinematic trailer. Significantly improve all spell vfx, all attack vfx and enemies 3d models, so they shine (in terms of look great) in the cinematic trailer, you can batch this work up into multiple steps to not rush it, quality is more important than the speed. After your done re-run the cinematic trailer job
- [x] #75 The boss battle read the same currently, a 3d model that spawn a bunch of attacks at the player, either meteor style or a cone outwards from where he stands, this is boring. Please do a web-search on Battleheart Legacy boss fights and other 3d top-down boss fights like in arpgs. In Battleheart legacy for example there is a goblin on a boar fight where the boar is occasionally charging at the player and can ram into the battlefield borders, making him not attack anyone as he knocked himself out for a while if the charge did not hit the player(if hit the player, then the player is brutally dragged along and stunned for 2 seconds hanging on a fence or wall for example, also after the boar has taken 50% of the total health bar the goblin jumps off and fights like the usual goblin but with stronger and more versatile attacks while the board runs towards the edge of the map(where there is a path) and despawns behind the edge, this is a fun and engaging boss design. Or a dragon that takes off mid fight and flies in to  burn down areas of the battlefield with a trail of fire coming from his mouth). Can we design some additional boss fights in that complexity level with the boss being more engaging and interesting to fight. Dont remove the old Bosses yet, we might reuse them later, but I want to use the improved boss fights in the next cinematic trailer and they need to look epic(also it would be cool if the player would occasionally dodge some attacks from the bosses, currently only the gunman fighting a boss moves during the fight due to his skills, but the mage and the knight just stand and hit or cast spells, this reads as boring an monotonous).
- [x] #76 ✅ The games logo needs to be redesigned and then painted, the current one is boring with a boring font and does not really represent the game or has a cool toonish appeal. After we settled on a new logo (you show me 2 new variations of a new logo in a browser page for comparison), we need to redo the cover images with the logo.
- [x] #77 ✅ Boss hp bars have some ornaments that are misplaced, improve that pleas and make the more special, same for elite enemies. Each enemy health bar should also feature an monster level right to the hp bar in a framed circly badge as a continuation of the health bar, so the player can see a color coded level and see if the enemies are stronger or weaker than expected for player level.
- [x] #78 ✅ Some chests drop their loot inside the chest, where it can no longer be picked up. Loot must always land where the hero can reach it.
- [x] #79 ✅ Goblin Hollows: after opening 3 chests, the 4th one (shown right of the "Leave" button) could not be found; a path to it seems cut off or missing. Every chest in every zone must be reachable.
- [x] #80 ✅ Move the "Leave" button to the top left corner and make it 20 % smaller on mobile, so it no longer hangs in the middle while the player explores the area and fights other packs.
- [x] #81 ✅ The world map is too small on mobile landscape: it should cover almost the whole screen, and the UI elements may overlap it.
- [x] #82 ✅ Bug: the select square (the tap pointer frame) shows over the cut-out world map.
- [x] #83 ✅ Level edges: the contour line that splits the art into a light area and a darkened outside looks unnatural. Use a soft darkening transition instead (soft fog, fog of war).
- [x] #84 ✅ The table at Wren's has no collision.
- [x] #85 ✅ Quest boards in towns with tasks like "Kill 10 goblins", "Collect 6 heal plants" or "Defend the caravan on the road to Oakhaven", paying gold and some extra XP. Sunford already has a board; add one in Oakhaven and in the big town (#86).
- [x] #86 ✅ A big town with teachers for all classes, secret traders (unlocked by quests done for them; once unlocked they offer more rare and epic items) and 4 secret classes.
- [x] #87 ✅ Alchemy: 8 different plants with new models, an alchemy teacher, and potions brewed from the plants that boost stats for a while during battles.
- [x] #88 ✅ Plants in every location: rare, about 3-4 per visit, respawning on re-entry to the same area just like the minor minions (goblins etc.) that are farmed for XP.
- [x] #89 ✅ Treasure map: 6 map pieces spread over the low-level areas as items to pick up, and a buried treasure chest in one of the mid-level locations that can only be dug up once the map is complete. The game then explains how to get to it and marks it in the quest log.
- [x] #90 ✅ Equipment upgrades for gold: every worn piece can be upgraded, raising its stats marginally, by more for a higher quality (common, uncommon, rare...). Each upgrade costs more than the last so the hero cannot become overpowered fast; rare, epic and later legendary gear stays the main progression (best stats, fastest growth).
- [x] #91 ✅ A memory-game gambler (inspired by the bow and slingshot stands of Zelda: Ocarina of Time): bet gold on a memory game against a timer; finishing in time doubles the bet. Each win leaves less time; after 5 wins (the hardest time limit) the player also gets a random legendary piece of equipment.
- [x] #92 ✅ An item-battle gambler, always in Sunford and Oakhaven: player and gambler each stake an item, the higher coin value wins a point, 2 points win a game. The gambler stakes ever more expensive items; the player's staked items are gone whether they win or lose, so the entry fee is low. Needs at least 3 unequipped items in the bag. Each won game gives a little XP; after 3 wins the player gets a random epic piece of equipment.
- [x] #93 ✅ English Chatterbox VOs for all new character dialogues (#85-#92).
- [x] #94 ✅ Paint all missing icons of the game with the art pipeline, then continue with the world map art.
- [x] #95 ✅ The game needs 4 more classes (at least 2 more mage classes like an elementalist: intelligence based attacks, uses a mix of elemental magic to conquer the battlefield. another could be a "soul warden": uses soul magic, intelligence based attack and can revive enemies mob and elite level to fight alongside him, can convert a soul living soul to fight for him, but low chance). Each class gets a total of 12 skills, so a player can better mix and match skills. The player has 8 skill slots he can fill and rearrange freely with learnt skills. 4 passive skills, same.
- [x] #96 ✅ Each skill in the skills tab must show clearly as a badge which stat its effect or damage scales with, otherwise it's hard for the player to craft a build and become obsessively invested in the game.
- [x] #97 ✅ add some cats, dogs, squirrels to the towns (each of the animals must have realistic pet walk, run and idle animations, this is crucial, simple robot like movement is not enough, do a web-search on how each of the pets move and take references from cat-video, dog-videos and squirrel videos)
- [x] #98 ✅ remove the level requirements for equipping items completely, only stats and availability should decide what a player can wear and what not, level requirements just create a frustrating tunneled gameplay.
- [x] #99 ✅ mineable iron, silver, gold, mithril ore, as coin generation and as resource for forging weapons and magic staffs. Add mining ore depending on location level similar to the plants positioning, except ore mining nodes are always near stones or stone wall map borders (max 3 per location). Player can get close to a mining node and start mining with a pickaxe that spawns in the hand of the player character, the player character executes 3 pickaxes swings(realistic pickaxe mining animation needs to be added), while mining the player is not interruptable and takes no damage, mining action is not cancelable, also make the chest opening not cancelable, as soone as the player is close enough to the chest to open it. Add dialogs an VO them for the smith that now takes any ore and pays the player a flat amount of gold per ore nugget, the smith also teaches smithing(all smithing happens in a new Smithing menu with new background art and new smithing recipes unlock with the discovery of new ore types, so if the player has mined a gold ore nugget, he then unlocks all recipes requiring gold as ingredients.). the player has to do a small dexterity based mini-game to smith a new weapon or equipment piece(only armor and weapons possible), the quality and rarity level depends on the player level and the quality level of the mini-game result. 
- [x] #100 ✅ Some locations feature a cage with hostages, the player can find the randomly hidden key in the location to unlock the cage free the hostages, this can unlock new quests and trading options or even a new class teacher(a duplicate of another secret class, this cages are in the mid-late locations, while normal cages are in the low-end locations like Goblin Hollow)
- [x] #101 ✅ Sounds update, create fitting sounds in ultra-high quality for each spell and each action, e.g. a fireball spell should have a fireball explosion sound on impact.
- [x] #102 ✅ Dogs Walkcycle not correctly animated, improve it
- [x] #103 ✅ 5 more ´fight location layouts. every town must feel more unique, oakhaven is a copy of sunford and silverbridge is a bigger version of it, make silverbridge look like a town build on a bidge by having one big walkway with houses on the upper and lower side of the bridge
- [x] #104 ✅ Mana not needed, bad scaling. 
- [x] #105 ✅ Don't show scaling badge if the skill does not have any scaling or stat dependence on the skill
- [x] #106 ✅ More base teachers in sunford for variety of builds early.
- [x] #107 ✅ paint spell icons, remaining map painted
- [x] #108 ✅ Skill point highlight seen over the entered town
- [x] #109 ✅ player gets so much hp per level, he never needs to skill endurance,even glass cannon build is though, rebalance this.
- [x] #110 ✅ Equipment gives way much more stats than a level up and therefore makes stats distribution almost irrelevant, better to have lower stats gains from equipment, especially legendary weapons, so that stats skilling actually have a stronger impact.
- [x] #111 ✅ World map walkways are a bit weird, the player gets stuck on some buildings or rivers.
- [x] #112 ✅ one quest by an old man requires me to get 3 moonbells from the whispering woods, but there are only sunpetals and glowcaps growing there.
- [x] #113 ✅ higher level clear rewards (up to 2x reward if cleared with max 15% total hp lost, 1x reward if more than 50% lost in one location before exiting) for players taking very low damage to benefit overleveled and careful players
- [x] #114 ✅ There are sun petals growing in the sunken temple, pretty much unfitting, the plants should be distributed based on growing location and fit to the location, not fully randomly.
- [x] #115 ✅ The item lay down game is a bit hard as it scales with your level and your acquired items, I think that is too harsh and not worth it, better make every gambler play a fixed game that can be overcome with more item acquiring, the first one in sunford for example should not get over the uncommong green items, even at his 3rd round, otherwise its too expensive to beat him with legendary items.
- [x] #116 ✅ website with build guides and wiki like item / quest guides helper pages.
- [x] #117 ✅ Make the colloseum a bigger spectable with more incentive to come back after the campaign and test out your character build to get as far as possible. Some of the most op items (dark reddish mythic tier) are only obtainable through reaching certain levels in the colloseum. After the story, the player should be reminded that the colloseum is the true test of power and that the player should go there.
- [x] #118 ✅ Lets create a sound playground report that allows me to listen to each sound effect used in the game and allows me to approve/disapprove a sound and ask for a new creation. The background is, e.g. the fireball impact sound sounds like a punch, but most probably other sounds are not fitting well too. So list every spell casting and impact sounds and other sounds used in the game with a description where they are used and if feasible a 400x225 screenshot of the situation its played in. After I have submitted all my ratings, you will have to create 2 alternative sounds for each unapproved sound, until I am happy with all of them.  
- [x] #119 ✅ I am still not happy with #111, the world map has rivers and objects, but the player avatar on the world map gets stuck on some edges or crossings, where it seems to have a way in the painted map. Compare the walkable map with the painted map and remove all inconsistencies. the player should be able to move on the whole world map with ground earth or bridges.
- [x] #120 ✅ I am still not happy with how the fighting locations are mapped out in terms of uniqueness of the location layout. It got better with a bit more variety (like wheet on the fields etc.), but most areas are still just a slight variation of goblin hollow or sunford plains. Lets make each area somewhat unique. The ashen craigs for example could be a vulcanic area with the player walking on half cooled down lava along a linear strip and then can switch to another strip of half cooled down lava by walking over stones/boulders. The dragons locations could be a windy path up and around the mountain in the center with the final fight of the dragon being at the top of the mountain roof. The sunken temple could be a real greek temple ruin like layout with chambers having groups of monsters and ruin like brittle walls. the goblin hollows could have goblin culture banners which give off the vibe that the goblins live there and some decorations like beds and fireplaces where goblin warm themselves and clubs lying on the ground near the beds. The oakhaven outskirts could have 1-2 mills as decorative objects(has collision). Beds and bigger decorative objects have collision too, make it realistic.
  The whispering woods could have some fog here and there with some bloody traces of claws on the ground (e.g. as decals). The puzzles are very rare, I think there could be ~2x the current spawn rate. Use more mythic icons/symbols for the puzzle buttons and icons, otherwise it looks like a PSX game.
- [x] #121 ✅ More base teachers in sunford for variety of builds early. At least the stealth class and soul warden. Reuse the VOs from the other teachers.
- [x] #122 ✅ The quest objectives are quite high for the class unlock quests and feel grindy as some objective are rare spawns like moonbells, therefore reduce the requirements by ~1/3, so only 2 moonbells to collect and eg. only 8 bandits to kill in oakhaven outskirst for the windrunner quest. Update  these changes everywhere, also the wiki and the VOs and textlines and quest log etc., everywhere, dont leave a bugged state.
- [x] #123 ✅ Dogs Walkcycle not correctly animated (dog is clipped into the ground), improve it
- [x] #124 ✅ The game needs an adaptive enemy difficulty scaler, if the player is having zero trouble (almost not loosing any hp and never having to use an hp potion), the difficulty is raised(resets on death) by giving the enemies higher damage and more hp(gradually), difficulty is reassessed every 1 minute of playtime and can change by up to 10% more damage/hp to make the game more challenging to the player, if the player starts using hp potions, the game does not increase difficulty further and might even reduce it back step by step. This is especially important if the player goes to a location taht is too high for the player level, there the increase should be more radical(e.g. player has op equipment or op build and is not having trouble clearing an area 5+ levels higher than the players hero level) 
- [x] #125 ✅ Recreate the cinematic trailer with more variations, instead of mostly show boss fights, add one item shop, add one 8 seconds screen with building active skills and passive skills into your loadout, add a 4 seconds scene with stats upgrading, add equipment equipping and finding legendary and heroic items from chests. Add a 3-4 seconds caravan defend scene where the player clears bandits.
- [x] #126 ✅ Keyboard layout detection and automatic button text label switch out for consistent play.
- [x] #127 ✅ design more fancy buttons with ornaments and decorations fitting the games theme. Do the same for all cards, modals, badges(if the badge is not too small), use border inset ornaments.
- [x] #128 ✅ Paint the ornaments and inset decorations, so it looks consistent with the other painted map and icon art.
- [x] #129 ✅ The color of the button text is black on a blue background which is bad contrast, change the text to white. The skills of non-intelligence classes should use less mana as they have almost no mana recovery through intelligence. Also mana potions should fully fill the mana bar always.
- [x] #130 ✅ Create an Intro that shows off a full built character with 5 skills in the belt and shows off some of the coolest skills with the most action coolness an awesomeness, choose wisely, this Intro is supposed to peak the players interest to go beyond just clearing the first sunford-plains area and drop off. The Intro should be at max 25 seconds long with an easy to see skip button and a hold space 1.5seconds keyboard shortcut (show a progressbar while holding Space like Red Dead Redemption 2 does it).
  use a story explanation voice-over like in this reference trailer https://www.reddit.com/r/aigamedev/comments/1x6ql3o/2_weeks_of_work_now_im_fully_committed_on_the/
  an oldish narrator with a deep but charming voice with elevenlabs to emotionally introduce the hero and his quest in the battlecross world.
  I have a new account on koststone@gmail.com for elevenlabs that has enough voice over credits.
- [x] #131 ✅ The towns have trees in front of the town exits, remove those and make the player leave to the map when the player walks into the exit zone. Some traders are standing in their selling table/desk, the desks should have collision and the traders should never clip inside.
  The values in the stats menu should be trimmed to 2 digits after the comma/dot, only 2 fractional digits
- [x] #132 The game is too short, it should have a demon invasion afterplay once the demon king was killed. 
 Some new big and super strong bosses need to be added with new fighting styles and challenges.
 Story-wise that could be explained with: "The demons broke free after the Demon king was defeated and infested the locations of the battlecross world and the player hero now has to help everybody". Some towns might be overrun by demons and mobs and the surviving teachers, traders and gamblers and story npcs now sit in a small fort that is the last line of defense against the hordes of demons and mythical creatures like chimeras, hydras, cyclopses, sphynxes, centaurs, dragons, leviathans.
 This should double the amount of gameplay and the target level for the last endboss would be 55-60.
- [x] #133 ✅ there are also too few dexterity items, add dexterity items for all tier level, so a full dexterity build is possible.
- [x] #134 ✅ Increase the effects of craftable potions to 75 percent and 5 minutes duration, otherwise they are not worth crafting and searching for as plants are quite rate, increase the amount of plants spawned per location to 6-7, so it's easier to find plants your searching for.
- [x] #135 Add german, French, spanish, indonesian, vietnamese, russian, japanese and brazil portuguese and chinese (simplified) chatterbox VOs and link them in the game (not found VOs fallback to no VO like always).
  - Done 2026-10-19: core lines voiced in de, es, pt (191/191), zh 189, ru 190, fr 183, ja 186 (id, vi: Chatterbox cannot speak them). Accepted as silent bubbles (no take passed Whisper QA after respellings and retries):
    - fr: dlg.quest.dragon.ask.1, dlg.quest.throne.circle.say, dlg.bark.goblinKing.charge.1, dlg.elderMara.quest.say__f, dlg.quest.goblinKing.slay.say__f, dlg.quest.goblinKing.slay.2__f, dlg.quest.goblinKing.pact.say__f, dlg.quest.throne.claim.2__f
    - ja: dlg.mayorBrenna.hello.2, dlg.quest.dragon.slay.say(__f), dlg.quest.throne.circle.2(__f)
    - zh: dlg.quest.throne.syndicate.say(__f)
    - ru: dlg.bark.freedFarmers.freed.1
- [x] #136 the game is missing a small spectacle in the first 20-30 seconds of gameplay, so that the game reads quite boring with always the same enemies to kill and just 1 skill to use on a fairly big cooldown with 5 seconds. That doesnt excite most playtesters and therefore 9/10 drop off the game latest after killing the sunford-plains tutorial boss, but some even after killing the second mob pack in the tutorial level. Lets at the very minimum add a 3 button puzzle in the first 30 seconds and a new gambler with a super addictive fast mini-game with a good early coin or item reward that keeps the player engaged. I am also open to other ideas, how to make the first 1 minute of gameplay so addictive, that players want to explore the rest of the world. Give me 5 ultra-high quality decisions, dont just give me the standard success stories, but very elaborate features that fit this game. Maybe a possibility to fish at lakes with a pre-given angle rod could be one of them? (fully optional, but another npc shows by example how to fish in the game, must be easy and fun and addictive to fishing lovers. Fish caught can be sold for coins or exchanged for stronger equipment, fish is only visisble in the fish traders UI).
 I have seen players play for 50+ minutes in one run, which is great, but they have to overcome the boring start first. Also introduce the first new teacher with only the teaching dialog in the tutorial level (probably shadowblade teacher is best as the first skill teleports and reads cool, appears walking in to the screen from the top side first after the first 2 goblins where defeated and keeps standing at the place the first 2 goblins where defeated.)
 the first boss also is not that exciting to fight, he should have some fancy attacks, like e.g. a arrow rain cast on an area and spawning some spear throws in a line (a bit like the dragons fly attack). the boss should also whistle for some small gnome helpers that die after 5 seconds by loosing 10% of their hp every 0.5 seconds after spawn, but doing also just little damage to the player to not crash the balance.
 
- [x] #137 The boss health bars of bosses should be dark reddish and not rosa/pink. Make the frame ornaments of elites and bosses more spectacular and outstanding. Paint the frames and ornaments for a consistent look with the icons and background images
- [x] #138 ✅ The portraits in a teachers skill teaching UI are not painted and look very low-effort right now. Paint them all on 1-2 sheets.
- [x] #139 ✅ The dodge roll animations is not perfect yet, it feels it ends in a weird position and then snaps to the standing position without an interpolation of the animation steps.
  Done 2026-10-20: the clip stood up from a squat in its last ~22 ms (one frame) with the tumble at full speed. Now the turn eases into a landing crouch inside the sim's 0.32 s roll (timing and i-frames unchanged) and a 160 ms eased blend carries that crouch into idle, the walk or a swing; worst one-frame pose jump across the end 0.50 -> 0.15 (tests/game/rollBlend.test.ts, every weapon style).
- [x] #140 ✅ The screenshake on crits is a bit too heavy, especially a dexterity heavy champion can trigger quite some of them in a short span making the screen shake all the time. Reduce intensity by 50%, so it is less heavy and add a throttle how many screenshakes can happen in a 5 second frame.
- [x] #141 The game is already great for the action rpg fantasy, but its lacking stuff to do outside of it. you can do some gambling and memory mini-game, but I think there is more that would fit it. I played till the end with my geomancer build and it worked well. I just wish there was more to do aside from the late game colloseum.
  Maybe something like a castle rush or castle siege event or other events or more mini-games that reward unique items or even unlock more unique class builds?
  I mean the overall cuteness look of the game is awesome and the english voice-overs are the cherry on top of the cake, but its lacking a bit of content for a more immersive overall long-term feel.
- [x] #142 ✅ let's do another round of optimizing hot-path loading during start up, postponing non-critical assets to lazy loading after all critical assets were loaded for the current scene based on player progress and level position.  
  That should make the game startup faster and happier players (should not create asset pop-ins)
  DON'T START WITHOUT MY OWN INITIATED REQUEST TO START IT.
  Done 2026-10-19 (D148, D149, PERF-LEDGER.md): phone link, before -> after: fresh 43 -> 39 requests / 1197 -> 1152 kB before playable, returning in a town 65 -> 54 / 1316 -> 1249 kB; the town simulation and the conversations out of the engine chunk; panels hold up to 300 ms for their art; no late image in any panel opened 12 s into a town visit (was up to ~30 per panel). Left: a bag opened the very instant a town becomes playable still shows three small glyphs up to ~0.1 s late.
- [x] #143 ✅ On mobile landscape(check all viewport orientations) the greenish "item is and upgrade badge" and the "item equipped badge" are stretched and not round. these 2 badges also look too similar, make the equipped item badge more distinct, maybe a small shield crest item, indicating its equipped or a better icon, if you have a more solid idea.
- [x] #144 ✅ Redesign the quest-board UI, add parchment background for the cards that list each mission/task instead of the current clean business UI design. the game UI needs more character and game genre fit (medieval low-fantasy)
- [x] #145 ✅ The yellow chevron leading is rendered over objects and not on the ground, I saw it rendering above(z-index higher) the wayfinder post in sunford.
- [x] #146 ✅ On mobile (seen on landscape, maybe even on portrait) the level requirement in the skill UI is cut off by the skill icons badges, so its hard to read.
- [x] #147 ✅ Each boss needs a very strong charged attack that is clearly distinguishable from their other attacks with e.g. some darkreddish to violetish damage area previewer and significantly bigger area, more like the dragons breath attack. Since these attacks are charged and the player has more time to prepare for the big hit and gets more time to get out of the damage zone, the attacks must hit hard, e.g. for min 50% of the players life, these attacks are 3 times as rare as the normal special attacks of each boss. Elites get a weaker version of such charged attacks with ~40% smaller damage area and min 35% of the players hp damage instead of the bosses 50%. 
- [x] #148 ✅ Currently the forge only allows to smith weapons for a mainly strenght based build with the e.g. gold sword giving +12 strenght and only 5.8 dex on a +5 upgrade. But what about the other builds like an intelligence, an skill based, a charisma based or a endurance based character build? they have no chance to get a well smithed weapon. Therefore extend the weapons and armors to be smithed based on the primary stat you want on the weapon (taking the base model from the normal items).
- [x] #149 ✅ Currently the player can only upgrade any item up to +10, but why limit it, instead please add unlimited upgrades which are getting increasingly more expensive to upgrade but also give a little more stats per upgrade beyond level 10 as it costs ways more to upgrade beyond there. Overall I feel the +1...+10 progression in stats is marginal, its ~15% more stats value, which is very low I feel, raise it a bit, so upgrading feels valuable and impactful to have the player chase upgrades for more ingame time spent. 
- [x] #150 ✅ Smithing is becoming very useless in the endgame with mithril beeing very rare to farm (no iron and silver nodes in the last 3 locations with level > 24 please), the highest smithable items are epic tier, but the player can find heroic and legendary items in the last 3 locations, which is a disconnect, even though smithing is a cool way to get your gear pre-upgraded and you can smith your target gear.
- [x] #151 Do another draw call pass and put all static assets in one draw call per location, so it is super efficient in terms of performance for all players, even on low-end mobile devices.
- [x] #152 ✅ Chi stacks are never shown, but are important for the icon mark gameplay, check for other stacks/charges based gameplay and fix it too.  
  Done 2026-10-19: the HUD got only status ids, never the stack count. Now every stacking status (chi, Entropy's Accelerate) shows a count badge and leads the hero's row; chi shows even at one bead; the chi finishers (Rising Dragon, Mountain Palm) carry five beads lit for what they will spend; the locked target shows what is stacked on it (Venomous Blade poison) with its count. Heat already had its bar.
- [x] #153 player must become invincible and untargetable while in a dialog (its important that this state is reset whenever the player leaves dialog menues, so that the player cannot glitch out and stay invicible and untargetable while not in a dialog, therefore add a every ~3 seconds check if the player is invincible and no menu is open and reset if needed.)
- [x] #154 In the tutorial level, if the player gets below 35% hp, show a yellow arrow with an attention bounce on the heal potion button and freeze the time until the player clicks/taps/presses Q on the heal potion button. 
- [x] #155 In the tutorial level show the objective chevrons pointing at the tutorial boss. if the player is struggling at the boss and not uses the shield bash skill often or at all, reduce the damage output of all enemies by 65%.
- [x] #156 The first town is quite intimidating with its many NPCs and traders and teachers. I think a better first 3 teacher hub (no traders or gambler yet) would be a small encampment at the end of the tutorial boss area (make the area ~40% bigger) after defeating the tutorial boss, the end area shows 1 big cage containing the 3 teachers with the golden key in front of the cage and the area has a broken down caravan as collidable prop and a campfire, so that after the release of the caged teachers, they start teaching you, they have no ambient dialogs in the tutorial level, only the teaching dialogs. 
  This encampment has the soul warden teacher, the aegis knight teacher, the pyromancer teacher from sunford and the shadowblade teacher also walks over to the campfire as soon as the boss is defeated, so the teachers move to sunford as soon as the player leaves the tutorial level, no need to create new dialogs for the teachers as they are the same instances as in the town sunford. After the cage release the aegis knight thanks you shortly for rescueing them from the bandits and offers all teachers skills teaching to the player (ok, 1-2 new VOs and dialog lines, the first skill bought in this rescued teachers camp costs 0 coins). If the player does not open the cage, the teachers still move to sunford, but the aegis teacher skips the thank you dialog. The boss chest stays as is in the tutorial levels boss area. 
- [ ] #157
- [ ] #158
- [ ] #159

- [ ] #Perf1 One user had 1-3 fps for the first 30 seconds, then ~9-10: WebGL Renderer
  ANGLE (Imagination Technologies, PowerVR Rogue GE8320, OpenGL ES 3.2)
  navigator.hardwareConcurrency
  8
  window.devicePixelRatio
  1.875
  User Agent
  Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36
- [ ] #Perf2 Playtesters have weird device pixel ratios of e.g. 2.8125 or 1.825 or 0.666667 and therefore not sharp graphics.
WebGL Renderer
  ANGLE (ARM, Mali-G57 MC2, OpenGL ES 3.2)
  navigator.hardwareConcurrency
  8
  window.devicePixelRatio
  2.8125
  User Agent
  Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36

  WebGL Renderer
  ANGLE (Intel, Intel(R) HD Graphics 4600 (0x00000416) Direct3D11 vs_5_0 ps_5_0, D3D11)
  navigator.hardwareConcurrency
  8
  window.devicePixelRatio
  0.6666667
  User Agent
  Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36

- [ ] #Perf3 Playtester had 15-20 fps in the tutorial level: 
  WebGL Renderer
  ANGLE (Imagination Technologies, PowerVR Rogue GE8322, OpenGL ES 3.2)
  navigator.hardwareConcurrency
  8
  window.devicePixelRatio
  2
  User Agent
  Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36

- [x] #Mini1 Please add a minimalistic charged and normal shot mini-game to kill red rotor drones where each click makes one sword slash at the monster and     
  when the machine is dead with a tiny spectacle (like bolts sprinkling up), the next stronger machine appears. Its important that this mini-game is super small in code size and doesnt need any image, so that the player can play this mini-game during loading times and during the first-load
  to waste some time with a funny and dumb, yet time-bridging mini-game, e.g. like the chrome 404 dino game, but during the loading times as a quick distraction and fun entertainment. The hero is Flux shooting at rotor drone, then hard hat, guarddroid, crate golem, then rotate from the beginning.
  This mini-game must be already integrated in the first html page, so it instantly loads to entertain the player. Keep the detail quality high on the Flux and machines models.
  There are no labels or counters or health bars and the mini-game shows as a small mini-game blow the loading bar, so the player does not stare at the loading bar waiting for it to finish.


- [x] #X1 ✅ Create a cinematic trailer using the gameplay-preview-pipeline (but use a separate package.json script called "cinematic-trailer" with the file name called trailer to battlecross-cinematic-trailer.mp4) which shows off the correct in game behaviour to the watching audience and make it epic with epic fights and win scenarios and epic loot findings, the most actionable scenes with edgy video cuts to make it appeal to a 10-15 year old. Let the player speak a few of his cool lines in english(no text bubbles in the video). Show of the coolest features of the game and the coolest enemies and locations, all enemies and the player must behave like in the game.
- [ ] #X2 Recreate the cinematic trailer, shorten the menu passages by ~30% in time and add the intro narrator to give the cinematic trailers an epic and atmospheric story and gameplay overview.
  you can reuse some or most of the older boss fight scenes as they have not changed and looked good already in the trailer.





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

- [x] #2 ✅ **A goal on screen from the first second.** A one-line quest tracker
  under the zone name ("Clear the road to Sunford 0/3", then "Learn a second
  skill", "Beat the Goblin King"). It reuses `hud.groupsDone` and the quest
  data. *Metric: share of new players who reach the first town and the first
  trainer.*
- [x] #3 ✅ **A guided first town visit.** After the first win the map opens on
  Sunford with the node pulsing; in town, a wordless pointer walks the player
  to the trainer, then to the hero sheet (3 points waiting). The lesson
  framework (`game/coach.ts`) already retires by use. *Metric: share of
  players with 2+ skills and 0 unspent points when they enter the Hollows.*
- [ ] #4 **A free second skill.** The first trainer visited teaches their
  first skill for free. Two buttons by minute three is what makes the build
  system visible. *Metric: time to second skill; D1.*
- [x] #5 ✅ **Loot that is felt.** A beam and a short fanfare on an item drop, a
  "better than what you wear" arrow on the toast and in the bag, and an
  "Equip" button on the result screen. *Metric: share of drops equipped within
  the session.*
- [x] #6 ✅ **Level-up in the fight.** A full heal and a 1 s slow-motion burst on
  level-up, with the "+3 points" chip parked on the hero button until spent.
  *Metric: unspent points at session end.*

## B. Reasons to come back (D1, D7)

- [ ] #8 **Elite re-runs: three skulls per zone.** Cleared zones offer +1/+2/+3
  difficulty with better gold and the zone's missing drops guaranteed over
  time. The difficulty multiplier and the level clamp already exist in
  `flow.setupFor`. *Metric: playtime per player after the first clear.*
- [x] #9 ✅ **Rested bonus.** Up to 2 hours of double XP accrued while away,
  shown on the map on return. *Metric: D1, D3.*
- [x] #10 ✅ **The colosseum as an endless ladder.** Waves past 8 with a personal
  best, a weekly modifier (all fire, no potions), and the leaderboard that
  already exists ranking the best wave. *Metric: sessions per day, D7.*

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
- [x] #14 ✅ **Build presets and a respec.** Save and name two loadouts; respec
  attribute points for gold at the healer. Removes the fear of spending
  points. *Metric: share of players who try a second class.*
- [x] #15 ✅ **Faction quests and a reputation track.** Short repeatable
  contracts per faction with a visible −5…5 track and a reward at +3 and +5
  (a discount exists already). Gives the three factions weight before the
  throne. *Metric: playtime between tiers 2 and 5.*
  Deferred: the contract board is a window opened from a town HUD button, not yet a prop in the town square.
- [x] #16 ✅ **A fantasy soundtrack.** The music is the predecessor's
  code-composed electronic set, re-mapped to the zone themes. Score seven
  themes (town, plains, forest, cave, fire, ice, void) plus a boss theme in
  the same sequencer, or drop files in (`sound-todo.md`). *Metric: session
  length; mute rate.*

## D. Conversion (ads without hurting retention)

- [x] #18 ✅ **Rewarded "second wind".** On defeat, one revive per visit at
  half health for a rewarded video, offered before the result screen. Only
  where the portal's rewarded inventory is ready (the gating code is kept in
  `use/ads`). The brief excluded rewarded buttons from the first build;
  this is the single placement worth testing first. *Metric: rewarded
  impressions per DAU; D1 must not drop.*
- [x] #19 ✅ **Rewarded "tripple the purse"** on the result screen, and a
  rewarded "merchant's rare shelf" refresh in towns. *Metric: ARPDAU.*
- [x] #20 ✅ **Interstitial pacing by content, not only by clock.** Keep the
  121 s floor (earliest after 240 seconds), and never show one after the opening fight, after a defeat, or
  before a decision. Today the only rule is the clock.
  *Metric: session length after the first ad.*

## E. Reach

- [ ] #21 **Store art and a gameplay clip per portal** from the video
  pipeline (`pnpm preview:video`), and A/B covers (item #1 above).
- [ ] #22 **Share card.** After an ending, a generated image: the hero, their
  eight skills and 4 passive skills and the ending's name. *Metric: referrals where portals allow
  sharing.*
