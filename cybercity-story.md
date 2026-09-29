- [x] Build a story arc with enemy proposition introduction.
Cartoonish expression like Arrrh! and Oof!(choose the best expressions yourself for Mega Droid) when taking damage-
Introduce a "Dr Evil"-like in fancy speech bubbles. 
Make it a story arc with a beginning, middle and end that fits this game and mission design.
the Intro could play in a high tech city with a cyberpunk aesthetic, showing 
Flux navigating through the city streets, encountering various enemies and 
obstacles. The story arc could involve Flux being tasked with stopping a rogue 
AI that has taken control of the city's systems, leading to a series of battles against 
corrupted machines, androids and bosses( just an idea, please make it a cool story understandble with almost no dialogs).
I think I will add english voice overs later, prepare this reflections in the story-voice-over.md(no need to implement anything yet)
The end result should be a story-arc.md file containing explanations for the intro cutscene first, the general
story outline and how it is resolved by Flux, especially how to reach the end boss/bosses.
I want to use this file to create some storyboard game and feel images for the story progress.
after your done, write me a comic.md that includes the story as prompts for each page of a comic, which I will run myself with gemini.
include Flux's KI assistent "Atlas".

- [ ] perfect block tutorial needs text explanations to be understandable and a time freeze, before the text bubble appears with a lighbox dim.
 with a tick off after the tutorial is done. show a small tutorials finished/unfinished list somewhere in the top-right corner(fitting on all viewport sizes and not overlapping anything) 
 on the first starter mission/level, so the player knows about features he has not learnt yet, even if he skipped them unintentionally.
 give the repair kit item that Flux can find a very unique MegaMan 2-3 like style model, that differentiates well from energy pills and screw.
 can be a reward from puzzle secret rooms.
 Release Pointer Lock while ads are playing and set it back in after the ads, add to the ads skill if not yet present in the ads skill in the web-game-playbook.
 The first door is locked, but not showing that you need to finish the tutorial first, that trips up most people, so show a blue arrow pointing at the tutorial in the player view and a "Finish the Tutorial first" and a small reddish shake on the door.
 It seems the mobile tutorials (most desktop players also pass by the testing dummy, improve that too) need improvements as not all people understand them, put more emphasis on them this time (maybe with animated finger placement and animated button presses, or automatedly controlled tutorial run with highlighted button presses/holds, before the player can try it out).
 additionally add text bubble helpers to the tutorials if the player doesnt finish a tutorial within 30 seconds.
 On the first charged shot tutorial people don't understand that a normal shot doesn't kill the test dummy, nothing helps them find the charged shot (demonstrate the charged shot first with an animated auto-controlled charged shot on a second target dummy before letting the player finish the tutorial with a own charged shot killing a testing dummy), the same goes for the other tutorials, but especially for the shield tutorial as its mendatory.
 The mobile player is also never thought how to move in 3d with a charged shot( show the player with an animation that you can move with the left joystick and charging while moving the camera around with the right cannon button).
 There is no Slide/dodge tutorial yet, add one wordless with the new animated + automated dry run showing the Space bar pressing down (no player has found the dash yet, hard to kill a boss that way), add the tutorial in a new room right before the boss room, before the heal tutorial.
 Maybe a small goldish/yellowish glow vinette would help to tell the player he is in a tutorial room with a black label at a free viewport edge saying e.g. "Shield Tutorial" or "Charged Shot Tutorial" etc. that disappears upon leaving the tutorial area.
 Whenever Flux enters a tutorial room, Atlas flies into view with a message in a goldishly bordered and slightly glowing speech bubble(different from normal messages) saying "Let's train the Charge Shot" or "Let's train the perfect block" or "Let's train the Slide/Dodge" or "Let's train the Heal Gel usage" etc. and then Atlas flies out of view again, so the player knows he is in a tutorial room.
 Is there no button to open the boss gate door? I watched a player struggle to open it, additionally add the shoot and guard button as door opening triggers.
 The yellow chevrons that lead to the objective seems to be overlooked by most players, lets add a significantly stronger glow and pulse for a 3 seconds duration (20 seconds loop, only pulse when the chevrons are in the viewport, no need to pulse beyond mission 2).
 if the player is not able to block mortar shots with the shield, add it.
 Add the learnings from the new tutorial lessons design to a user level skill called fpv-tutorial, as it is for FirstPersonView games showing how to implement best-practice
 wordless tutorials that are easily understood by show and train, don't tell.
 Additionally, the best way to peak and show what Flux is able to do is to show it in action in the intro cutscene. 
 Extend the intro cutscene by the showing a charged shot, a perfect block(knocking out a rotor drone, block shield shown of against ranged shooters to protect from projectiles) and the slide/dodge mechanic and the heal gel usage (2seconds is enough or can be shown after the perfect block), so the player is clear there is a charged shot etc. each of this show offs add another 3-4 seconds to the intro and come early after or during the shield droid fight.
 The shoot button needs to be further lefts, so there is space to move the camera around, right now there is no space to the right and the mobile player slides of the phone edge, rearrange mobile buttons due to this shift and make the shoot button a bit bigger and show a better recognizable icon indicating it being the primary weapon.
 None of the players found the settingsMenu with the controls shortcut explanations. Start the game with the modal containing the controls explanations on mobile.
 Fan out subagents.
 For some reason everybody walks past the test dummy in the first starter room for some ready, so lets change it to a rotor drone that is not firing and is blueish, Flux's autoaim activate on that rotor drone, also dont show the door in the first level, but instead open it like the secret door after the successful charge shot at the dummy target.

- [ ] The second mission still shows the special weapon tutorials (showing "1" button key, when there are no enemies nearby to shoot at, this must be a bugged tutorial after the level layouts has changed for the 2nd mission, update the tutorials position).
 The current mission 2 level spawns Flux into a room with 2 enemies around him, with no breathing room and no time to 
 react and prepare for a fight. Better build another beam in room that lead through a door to the current starting room in the 
 Blaze Master level. The guarddroid is not taking damage from the flame traps in the Blaze Master mission level from the fire traps and flame pillars.
 Atlas's speech bubble currently disappears too fast, double the time for non-voice-overed speech bubbles for all characters.
 In the Blaze Master level(but applies to all levels) if Flux falls down into a platform pit, there is a sound effect and he spawns back on top, which is fine, but there should be some kind of visual feedback why that hurt, e.g. put dangerous spikes at the bottom of the pits/valley that currently count as 
 "death/fall", 
 Flux impacts on the spikes and some sparks are emitted from his body (2s animation), while camera 
 turns on Atlas who comes to the rescue and Flux grabs onto Atlas, who pulls him back up on to the closes platform that belongs to a valid level path.
 Improve the Flame pillar cone effect quality emitted from the wall traps and traps in Blaze Masters level and everywhere else. 
 The spikes make no sense in areas where Flux falls of the levels like in the starting room of Gale Masters level, where Atlas just instantly rescues Flux with the camera showing a cutscene on Flux and Atlas until Flux is save on the ground again.

- [ ] On platform levels the Guarddroid can be stunlocked (stunlock forever is not fun on any character, feels like a cheat to the player) by shooting at him from a distance with a charged shot(not fun to play and watch),
 let's make everyone have a fallback ranged attack (not stunlockable forever) in case other attacks would not reach Flux or the robot or android or machine is on the edge of a platform and sees no way to the player android.
 if Flux is close to an edge and moves towards an edge or beyond he should first slide till the edge and then jump forward instead of sliding down, which should make platforming a lot more fun to the player and more actionable.
 The starting spaceship flying up does not look right, its tilted instead of facing up and is missing a flame thrust cone and the after effect trail is too solid and too long, which makes it look bad, fix it to make it look realistic(while keeping it very low performance impact, dont show the trail on low-end devices at all).
 The new Weapon: Flame Wave label on the result screen of a mission is too boring, lets add a colored icon that shows what type of weapon is gained, so the player is actually intrigued to see what kind of weapon he got, instead of just reading the text. The icon should be a small colored icon that shows the type of weapon gained, e.g. a flame icon for Flame Wave, a snowflake for Ice Beam, etc.
 Improve the vfx quality of all special weapons, add a small room for a lesson on the newly gained weapon to the next mission(Flame weapon gained is explained on the next mission in the Frost Master level, right in the first beam down level, where no enemies are and the gate only opens after the tutorial lesson, getting close to the closed door shows "Finish the lesson on XXXXXX" with an blue arrow pointing at the lesson location. Make resources needed for the lesson respawn, enemies spawned for a lesson should only spawn after the player started moving in the beam down level.).
 
- [ ] the supply drop rewarded add button needs to have a better readable MovieIcon and the screw reward should adjusted to the players progress, one reward should be around half of a mission or supply run income, otherwise this rewarded ad will become unattractive over time.
 Add a 10% kill-cam, that shows how the enemies android/machine crumbles into pieces and falls to the ground (max 3 seconds for the kill-cam cutscene), while the camera is over Fluxes shoulder showing the Flux model and the killed target (prevent camera clipping into walls with springsarms) (the game is frozen for this moment, meaning: Vfx play, 
 but no character/android/enemy/Flux moves or takes damage or falls or anything, the player can just watch the kill-cam cutscene). 
 The kill-cam should be triggered by a random chance of 10% on every enemy killed, but not on bosses or mini-bosses. The kill-cam should be skippable
 by pressing any button or key 2 times (show a skip button where the shoot and guard button would be during normal play), and should not be triggered if the player is in a hurry, e.g. sliding or jumping or near a trap or hurtful obstacle or has already seen this enemy type getting killed once in the current active mission. 
 The kill-cam should also have a small icon in the top-right corner that shows how many times the player has seen it in the current mission, so they can decide to skip it if they want to.
 I think there should be better feedback on walking on a volt trap, like a short cutscene showing Flux shaking and lightning bolts flowing around his body(like a kill-cam, the surrounding is not moving/progressing/falling etc until the camera is back to FirstPerson Mode at Flux's vision).
 running into other traps like flame traps, spikes, falling platforms, etc. should 
 also have a short cutscene showing the effect on Flux and the surrounding environment, like sparks flying, flames burning, platforms falling, Flux freezing etc. This will give the player a 
 better sense of the danger and make the game more immersive. 
 There are no barrels, crates or crate golems in the new platforming levels, which is unfortunate, 
 add room for that features too here and there, not too excessively.
 Some machines from the first level are not reused at all in the platforming levels of mission 2-5 like the wheel dude or the guarding bot or the hard hat. 
 
 
- [ ] the upgrades are not well balanced right now, I picked up a purple blaster and upgraded it to level 6 in one go, now I do 357 damage with one charged shot, which is 6x my previous damage, but I also installed some chips I dont remember,
  this is not fun long term. Upgrade should be feelable progress, but not making the player op instantly, maybe I just got lucky, so instead lets add an dynamic adaptive boss difficulty that adjust the bosses hp if the player gets too op early, a good refrence fight is the Flame Master without any upgrades or chips and standard gear on Flux.
  Also enemies hp should scale slowly with mission progress, so the upgrades will be needed to compensate the difficulty increase.
  If a player falls back on relative damage power, Pip should tell him in the lab with a short text and a tutorial lesson how to upgrade his gear and weapon.
  if the player has no screws left to do the upgrades, off a rewarded ad to get screws as a reward( enough to pay for 2 weapon upgrades on the best weapon he has).
  A chest has no collision after it was opened, that's unimmersive. Flux can shoot through the chest, but any shot should collide with the chest geometry consuming the shot visual and damage.
  Flux can shoot through the platform that drives him in the Volt Master level, which is unimmersive and should be fixed.
  The freeze special weapon should not stun-lock(or stun at all as its just elemental) the enemy, but only slow down his attack charge up and movement by 30% (not effecting jump speed and length).
  using the beam up cutscene in a corridor can produce potential wall and camera clipping, close the boss room door after the player entered the room and dont let him out after the boss was killed, so Flux can only exit the level in the boss room.
  
- [] there should be a wordless lesson on jumping over gaps and pitfalls, so the 
 player can learn to jump over gaps and pitfalls without having to read a text or 
 listen to a voice-over. The lesson should be in the first mission/level, 
 where the player has to jump over a gap to reach the next platform ( and again on Gale Masters level). 
 The lesson should be triggered by the player approaching the gap, and should show a visual cue (e.g. a glowing arrow) indicating where to jump. 
 The lesson should also show a visual cue (e.g. a glowing arrow) indicating where to 
 land after the jump. The lesson should be skippable by pressing any button or key 2 times (show a skip button where the shoot and guard button would 
 be during normal play).

- [] The wind is coming out of nowhere in the Gale Masters level, add a wind turbine prop rotating while the wind is coming and stoping when no wind is visible.
  The Rotor drone can clip into level geometry when moving back(seen on Gale Masters level).
  On Gale Masters level, there is a secret room puzzle with non-readable puzzle hint, also the blue button is hovered by a pipe in the wall, check all puzzles if they are correct and solvable and not obstructed, save this as a rule for future puzzle builds and locations.
  Improve the boss door face over the boss door to look more like the vex face we have in the intro cutscene.

- [] The shoot button (is it the tutorial lessons icon or is this intended) is shown to me even on the Gale Masters mission.
  Check why it's still show and at what point it best should stop to show.


- [ ] All boss rooms look the same right now, add 1-3 random barrels or normal crate to each boss room to allow finding energy pills and very rarely a recovery gel( ~5% chance to drop from boss barrels and crates, never more than one recovery gel per boss room dropped), also 
  build in (1 or 2 pillars / a platform with a ladder or staircase to get to a higher position (this should not be glitchable to protect from incoming damage forever, if the bosses attack hit an obstacle 2 times in a row, even though it should have hit the player on the trajectory, the boss enrages with fuming smoke and a slightly red head and start op ranged attacks from the sky until the player is targetable with normal attacks again. Prevent other edge cases resulting of this and handle them after consultation in chat))
  What would be other not-AI-breaking additions to make each boss room unique and interesting to walk through? Make 5 suggestions and write a structured report that I can look at in the browser with example images that you can sketch with gemini or with quick and dirty 3d scenes built and screenshotted.
  The end bosses Vex level layout must be outstandingly fun and exciting and unique as it's the peak of the game. Make 3 unique suggestions for it too (taking all the edge cases into account like preventing AI exploits etc.).
  The Gale Master boss room could have wind tunnels moving only the player from time to time(less often then in the normal level).
  Freeze Master should have some freeze traps/pillar(not affecting the boss) and some ground sliding ice tiles like in the level.
  Flame Master could have some fire pillars and traps in the boss room, but not affecting the boss, but only the player, no hit cutscenes on Flux during the boss fight.

- [ ] I will build an audacity voice-over file modulation and sound leveling skill and package json script that executes it with Audacity remote control. Prepare each voice modulations and Audacity Effects that the skill or I need to execute in succession on each vo, so it fits in the sound design of the story, the other background music and sounds and the voice egos of each characters. Write the modulations and step-by-step instructions into the story-voice-over.md  below each of the character descriptions there.

- [ ] Extend the game with 5 more levels in the same pattern as the current Masters (also reuse the machines and robots while introducing potentially new machines with new mechanics and fight AI for diversity and changing challenges), adjust the story files accordingly with the new 5 Masters and their special weapon arts.
  One level could be about using the Quadrocopter drone from the exit cutscene(maybe like the lore ride or something else or both).
  Build the new levels with new platforming aspect while reusing some of the existing platforming features and designs here and there, but every level should bring something new and fresh to the players experience.
  Take inspiration from MegaMan 2-7 levels, do a web-search on MegaMan level designs and transfer that knowledge for the new mission levels.
  Maybe build one level where the player has to use wall jumps to climb up to a secret room (needs a specific lesson until the player climbed out, could be tricky with the FPV camera, but you could make it fluently), this mechanic might be too hard for most players, so lets reward the curious ones with a temporary specials weapon a full heal capsule and a recovery gel.
  
- [ ] Do a full rebalancing pass of all machines and robots and bosses and Flux compared to average player progression over the story mission(assuming none do supply runs and use the 3x screws button every 3rd mission and Flux only upgrading some weapons here and there but not always spending all his screws for gear and chip upgrades, but always using his after mission upgrades).    

- [ ] 'Vex Fortress' should be a special level (3-4 times as big as climb towers map and game duration) map with ranged robots on the fortress walls, the whole map is looking like Flux is entering a futuristing castle/fortress and there are not only the usual rooms with puzzles and secret rooms and enemies, but also 2 mini-bossos waiting, that need to be beaten, after that there is a passage platforming and another puzzle with secret rooms before the player can enter the final boss vex. Vex fortress also introduces another android or machine type not seen before with a unique weakpoint. Here there are also new platforming obstacles and platforming challenges to master, before reaching the first mini-boss. This level checkpoints for revival in case Flux dies at one of the mini-bosses or at the final boss Vex.

- [ ] let's do another round of optimizing hot-path loading during start up, postponing non-critical assets to lazy loading after all critical assets were loaded for the current scene based on player progress and level position.  
  That should make the game startup faster and happier players (should not create asset pop-ins)