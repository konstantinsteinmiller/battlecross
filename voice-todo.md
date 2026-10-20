# Voice-over to-do

Generated from data/voice-manifest.json, the voice files and
vo-src/shipped.json by `pnpm voice:script`; every `pnpm voice:gen` run
rewrites it, and a test fails when it is stale. Do not edit by hand.

- **Files:** `public/audio/voice/<lang>/<id>.ogg`. A language with
  recordings plays only its own (a line with no file is text-paced); a
  language with none (id, vi) plays the English ones under its subtitle.
- **Stale** means the line's text changed after it was voiced: the next
  `voice:gen` run voices it again.
- **Make the missing and stale ones:** `pnpm voice:manifest`, `pnpm
  voice:collect`, then `node --experimental-strip-types --no-warnings
  tools/voice/generate.mjs --engine chatterbox` (it voices only what is
  missing or stale), then `--retry 2` for the ones that fail QA.

| Voice | Lines | EN voiced |
| --- | --- | --- |
| hero | 210 | 210 |
| freedPeddler | 9 | 9 |
| lightDisciple | 14 | 14 |
| sfShadow | 17 | 17 |
| sunfordSmith | 25 | 25 |
| sunfordPeddler | 15 | 15 |
| trainerAegis | 19 | 19 |
| trainerPyro | 15 | 15 |
| sfGeo | 12 | 12 |
| elderMara | 47 | 47 |
| sunfordHealer | 14 | 14 |
| goblinTrader | 11 | 11 |
| sunfordGambler | 10 | 10 |
| sunfordCups | 10 | 10 |
| freedFarmers | 12 | 12 |
| windDisciple | 14 | 14 |
| captainHale | 39 | 39 |
| oakArmorer | 32 | 32 |
| oakWeapons | 10 | 10 |
| trainerShadow | 15 | 15 |
| trainerSovereign | 29 | 29 |
| oakHealer | 11 | 11 |
| blackMarket | 11 | 11 |
| trainerBlood | 16 | 16 |
| syndicateBoss | 17 | 17 |
| oakGambler | 10 | 10 |
| frostDisciple | 14 | 14 |
| forgemaster | 25 | 25 |
| ironWeapons | 16 | 16 |
| ironAetherWorks | 8 | 8 |
| ironArmor | 14 | 14 |
| ironOrderArmor | 16 | 16 |
| trainerGeo | 14 | 14 |
| trainerAether | 16 | 16 |
| ironHealer | 12 | 12 |
| trainerChrono | 19 | 19 |
| freedHerbalist | 14 | 14 |
| mayorBrenna | 17 | 17 |
| sbHealer | 10 | 10 |
| sbAlchemist | 11 | 11 |
| sbGambler | 10 | 10 |
| sbCollector | 13 | 13 |
| sbFence | 13 | 13 |
| sbArmorer | 15 | 15 |
| sbWeapons | 9 | 9 |
| sbJeweler | 9 | 9 |
| sbMasterAegis | 13 | 13 |
| sbMasterPyro | 12 | 12 |
| sbMasterShadow | 13 | 13 |
| sbMasterSovereign | 12 | 12 |
| sbMasterGeo | 13 | 13 |
| sbMasterAether | 12 | 12 |
| sbMasterChrono | 12 | 12 |
| sbMasterBlood | 13 | 13 |
| sbMasterWindrunner | 19 | 19 |
| sbMasterFrostwarden | 18 | 18 |
| sbMasterLightbringer | 18 | 18 |
| sbMasterBeastcaller | 20 | 20 |
| sbMasterElementalist | 13 | 13 |
| sbMasterSoulwarden | 13 | 13 |
| sbMasterIronmonk | 13 | 13 |
| sbMasterBard | 14 | 14 |
| goblinKing | 9 | 9 |
| warlord | 5 | 5 |
| oracle | 7 | 7 |
| dragon | 6 | 6 |
| archDemon | 7 | 7 |
| scoutWren | 14 | 14 |
| chronicler | 17 | 17 |
| sunkenPriest | 2 | 2 |
| fairPip | 8 | 8 |
| fairBess | 8 | 8 |
| fairHob | 8 | 8 |
| mysteriousWanderer | 11 | 11 |
| smalltalkSunford | 13 | 13 |
| townsfolk | 32 | 32 |
| smalltalkOakhaven | 13 | 13 |
| smalltalkIronhold | 9 | 9 |
| smalltalkSilverbridge | 10 | 10 |
| smalltalkKids | 6 | 6 |
| kidFriend | 4 | 4 |
| banditChief | 1 | 1 |
| frostJarl | 2 | 2 |
| chimera | 4 | 4 |
| centaurWarchief | 4 | 4 |
| cyclops | 4 | 4 |
| sphinx | 4 | 4 |
| leviathan | 4 | 4 |
| hydra | 4 | 4 |
| elderDragon | 4 | 4 |
| heroine | 210 | 210 |
| **All** | **1577** | **1577** |

## Other languages: the core lines only

English is voiced in full. Every other voiced language ships only the **core**: 314 of 1577 lines (65 of them the girl hero's `__f` twins, limit 320), set in data/voice-core.json by id pattern plus an explicit list. Core: the hero's "Will you teach me?" and goodbye lines, the main quest decisions with their boss monologues (Goblin King, Krag, the Colossus core, the oracle, the dragon, the Arch-Demon's throne), the five endings, and the story beats of Elder Mara, Captain Hale, Mayor Brenna, Madam Ash and the exiled Sovereign. Not core: smalltalk, shops, gamblers, barks, trainer and master Q&A, trade and heal chatter. A non-core line is a silent bubble; a test fails when a language folder holds a file outside the core.
Make them with `voice:gen --engine chatterbox --lang <code>` (then `--retry 2`); `voice:collect` builds jobs for the core lines only.
Indonesian (id) and Vietnamese (vi) are not voiced: Chatterbox cannot speak them. pt-PT keeps English too.

| Language | Core voiced | Core lines |
| --- | --- | --- |
| de | 312 | 314 |
| fr | 305 | 314 |
| es | 312 | 314 |
| ru | 312 | 314 |
| ja | 314 | 314 |
| pt | 310 | 314 |
| zh | 314 | 314 |

## Parked takes (decision 2026-10-18)

About 1,400 files per language is too large for CrazyGames (50 MB), so only English ships complete and the others ship the core. The earlier full Chatterbox runs are kept out of the build in `vo-src/parked/<lang>/` (git-ignored): German has 1,366 of 1,410 lines (the girl hero's short lines with invented class names, such as the Aether and Chrono masters, still fail the Whisper check), French about 1,000, and ja, zh, es, pt and ru only pilot files. Only the core takes were moved back to `public/audio/voice/<lang>/`.
To widen a language beyond the core, change data/voice-core.json and settle the size budget or a per-portal language filter first. A half-voiced core is silent on its missing lines, so finish it before shipping.

## To do (0)

Nothing: every line has its recording.

## Every line (1577)

| File | Who | Scene | English | EN |
| --- | --- | --- | --- | --- |
| `dlg.hero.bye` | The hero (hero) | hero | I'll let you get on. | chatterbox |
| `dlg.freedPeddler.hello.1` | Odo Marrow (freedPeddler) | freedPeddler | You! You're the one who opened that cage! I'd have rotted in there. | chatterbox |
| `dlg.freedPeddler.hello.2` | Odo Marrow (freedPeddler) | freedPeddler | Odo Marrow, at your service. Peddler, tinker, very grateful man. | chatterbox |
| `dlg.freedPeddler.again.1` | Odo Marrow (freedPeddler) | freedPeddler | My rescuer! Come, come, I kept the good things for you. | chatterbox |
| `dlg.hero.trade` | The hero (hero) | hero | Can I see what you've got? | chatterbox |
| `dlg.freedPeddler.trade.1` | Odo Marrow (freedPeddler) | freedPeddler | Rings, gloves, boots. Half price for you. Well, nearly. | chatterbox |
| `dlg.hero.who` | The hero (hero) | hero | Who are you, if you don't mind me asking? | chatterbox |
| `dlg.freedPeddler.who.1` | Odo Marrow (freedPeddler) | freedPeddler | Bandits took my cart and put me in a box. Very rude. | chatterbox |
| `dlg.freedPeddler.who.2` | Odo Marrow (freedPeddler) | freedPeddler | Now I sell from Sunford. It's safer here. Mostly. | chatterbox |
| `dlg.freedPeddler.shopBack.1` | Odo Marrow (freedPeddler) | freedPeddler | Pleasure doing business, friend. | chatterbox |
| `dlg.freedPeddler.bye.1` | Odo Marrow (freedPeddler) | freedPeddler | Mind the bandits. They don't like to share. | chatterbox |
| `dlg.lightDisciple.hello.1` | Sister Aurelle (lightDisciple) | lightDisciple | Light be with you. You found me in the dark, and I won't forget it. | chatterbox |
| `dlg.lightDisciple.hello.2` | Sister Aurelle (lightDisciple) | lightDisciple | I'm Aurelle. Sister Auriel taught me the light. Now I teach it here. | chatterbox |
| `dlg.lightDisciple.again.1` | Sister Aurelle (lightDisciple) | lightDisciple | Welcome back. The sun is kind today. | chatterbox |
| `dlg.hero.train` | The hero (hero) | hero | Will you teach me? | chatterbox |
| `dlg.lightDisciple.train.1` | Sister Aurelle (lightDisciple) | lightDisciple | Open your hands. Let the light come through them, not from them. | chatterbox |
| `dlg.lightDisciple.class.say` | The hero (hero) | lightDisciple | What does a Lightbringer do? | chatterbox |
| `dlg.lightDisciple.class.1` | Sister Aurelle (lightDisciple) | lightDisciple | We carry the dawn. Light to fight with, light to heal with. | chatterbox |
| `dlg.lightDisciple.class.2` | Sister Aurelle (lightDisciple) | lightDisciple | Intelligence makes the light strong. Charisma makes it warm. | chatterbox |
| `dlg.hero.ready` | The hero (hero) | hero | Do you think I'm ready for more? | chatterbox |
| `dlg.lightDisciple.ready.strong.1` | Sister Aurelle (lightDisciple) | lightDisciple | You shine brighter than I do now. Take whatever you need. | chatterbox |
| `dlg.lightDisciple.ready.able.1` | Sister Aurelle (lightDisciple) | lightDisciple | You're ready for the next lesson. Come, stand in the light. | chatterbox |
| `dlg.lightDisciple.ready.weak.1` | Sister Aurelle (lightDisciple) | lightDisciple | Not yet. A clearer mind and a warmer heart first. | chatterbox |
| `dlg.lightDisciple.who.1` | Sister Aurelle (lightDisciple) | lightDisciple | I went to the Sunken Temple to pray. The naga had other plans. | chatterbox |
| `dlg.lightDisciple.who.2` | Sister Aurelle (lightDisciple) | lightDisciple | Sunford is bright and quiet. I needed both. | chatterbox |
| `dlg.lightDisciple.trainBack.1` | Sister Aurelle (lightDisciple) | lightDisciple | Go gently. And let them see you coming. | chatterbox |
| `dlg.lightDisciple.bye.1` | Sister Aurelle (lightDisciple) | lightDisciple | Walk in the light. | chatterbox |
| `dlg.sfShadowRoad.hello.1` | Nettle Quickhand (sfShadow) | sfShadowRoad | Teleports. Interested? | chatterbox |
| `dlg.sfShadowRoad.again.1` | Nettle Quickhand (sfShadow) | sfShadowRoad | Back for another trick? | chatterbox |
| `dlg.sfShadowRoad.train.1` | Nettle Quickhand (sfShadow) | sfShadowRoad | Watch closely. One step, and you're somewhere else. | chatterbox |
| `dlg.sfShadowRoad.trainBack.1` | Nettle Quickhand (sfShadow) | sfShadowRoad | Good. Now go be somewhere else. | chatterbox |
| `dlg.sfShadowRoad.bye.1` | Nettle Quickhand (sfShadow) | sfShadowRoad | Don't get caught. | chatterbox |
| `dlg.sunfordSmith.hello.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Haven't seen you before. You're the one who cleared the road? | chatterbox |
| `dlg.sunfordSmith.hello.2` | Bram the Smith (sunfordSmith) | sunfordSmith | Bram. I keep the forge. If you need a blade, come to me. | chatterbox |
| `dlg.sunfordSmith.kingDead.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Heard the Goblin King's dead. Can't say I'll miss him. | chatterbox |
| `dlg.sunfordSmith.kingPact.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Goblins trading in the square now. Never thought I'd see it. | chatterbox |
| `dlg.sunfordSmith.kingRansom.1` | Bram the Smith (sunfordSmith) | sunfordSmith | You let the Goblin King keep his crown. He'll be back, you know. | chatterbox |
| `dlg.sunfordSmith.ending.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Whole realm's talking about you. Still need a whetstone, though? | chatterbox |
| `dlg.sunfordSmith.again.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Back again. What can I do for you? | chatterbox |
| `dlg.sunfordSmith.trade.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Plain steel, fair prices. Have a look. | chatterbox |
| `dlg.hero.ore` | The hero (hero) | hero | I've got some ore to sell. | chatterbox |
| `dlg.sunfordSmith.ore.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Ore, eh? Show me. I pay by the nugget, fair weight. | chatterbox |
| `dlg.hero.learnSmith` | The hero (hero) | hero | Could you teach me to smith? | chatterbox |
| `dlg.sunfordSmith.learnSmith.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Smithing? Hm. Hold the hammer like this, not like a club. | chatterbox |
| `dlg.sunfordSmith.learnSmith.2` | Bram the Smith (sunfordSmith) | sunfordSmith | Strike when the metal glows brightest. Miss, and it's scrap. Go on. | chatterbox |
| `dlg.hero.forge` | The hero (hero) | hero | I'd like to use your forge. | chatterbox |
| `dlg.sunfordSmith.forge.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Forge is hot. Mind your fingers. | chatterbox |
| `dlg.sunfordSmith.who.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Bram. Thirty years at this anvil, give or take. | chatterbox |
| `dlg.sunfordSmith.who.2` | Bram the Smith (sunfordSmith) | sunfordSmith | Horseshoes, ploughs, the odd sword. Lately, mostly swords. | chatterbox |
| `dlg.sunfordSmith.gear.say` | The hero (hero) | sunfordSmith | What should I take with me out there? | chatterbox |
| `dlg.sunfordSmith.gear.1` | Bram the Smith (sunfordSmith) | sunfordSmith | A shield, if you plan on getting hit. Most people do. | chatterbox |
| `dlg.sunfordSmith.gear.2` | Bram the Smith (sunfordSmith) | sunfordSmith | Heavy steel needs a strong arm. Work on your Strength first. | chatterbox |
| `dlg.hero.rumor` | The hero (hero) | hero | Heard anything lately? | chatterbox |
| `dlg.sunfordSmith.rumor.plains.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Bandits on the plains road. I'd start there, if I were you. | chatterbox |
| `dlg.sunfordSmith.rumor.hollows.1` | Bram the Smith (sunfordSmith) | sunfordSmith | The goblins come from the Hollows, past the plains. Their king's down there. | chatterbox |
| `dlg.sunfordSmith.rumor.woods.1` | Bram the Smith (sunfordSmith) | sunfordSmith | East of the plains are the Whispering Woods. Folk say the trees move. | chatterbox |
| `dlg.sunfordSmith.rumor.siege.1` | Bram the Smith (sunfordSmith) | sunfordSmith | There's smoke toward Oakhaven. An army's camped on the outskirts. | chatterbox |
| `dlg.sunfordSmith.rumor.north.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Ironhold steel's coming down the road again. Better than mine, if I'm honest. | chatterbox |
| `dlg.sunfordSmith.shopBack.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Look after it and it'll look after you. | chatterbox |
| `dlg.sunfordSmith.forgeBack.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Not bad. Not good either. Keep at it. | chatterbox |
| `dlg.sunfordSmith.sellBack.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Fair weight, fair coin. Bring more when you find it. | chatterbox |
| `dlg.sunfordSmith.bye.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Mind how you go. | chatterbox |
| `dlg.sunfordPeddler.hello.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | Oh, hello! Are you buying, or just looking? Both are fine. | chatterbox |
| `dlg.sunfordPeddler.hello.2` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | I'm Tilly. Rings, charms, bits and pieces from all over. | chatterbox |
| `dlg.sunfordPeddler.rival.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | Have you seen the goblin's stall? His prices are lower than mine. It's not fair. | chatterbox |
| `dlg.sunfordPeddler.again.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | There you are! I put a few things aside I think you'll like. | chatterbox |
| `dlg.sunfordPeddler.trade.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | Have a look. That one's lucky. Probably. | chatterbox |
| `dlg.sunfordPeddler.who.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | I walk the roads and buy what people want to get rid of. | chatterbox |
| `dlg.sunfordPeddler.who.2` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | And sometimes I find things. Bandits drop a lot when they run. | chatterbox |
| `dlg.sunfordPeddler.trinkets.say` | The hero (hero) | sunfordPeddler | What are trinkets actually good for? | chatterbox |
| `dlg.sunfordPeddler.trinkets.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | You can wear two, one on each hand. It all adds up out there. | chatterbox |
| `dlg.sunfordPeddler.stolen.say` | The hero (hero) | sunfordPeddler | Where did all this come from, really? | chatterbox |
| `dlg.sunfordPeddler.stolen.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | Ah. You've got a way of asking, haven't you? | chatterbox |
| `dlg.sunfordPeddler.stolen.2` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | Take this ring and let's not talk about where I found it. | chatterbox |
| `dlg.sunfordPeddler.rumor.arenaShut.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | There's an old colosseum south of here. Shut tight while the goblins raid. | chatterbox |
| `dlg.sunfordPeddler.rumor.arenaOpen.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | The colosseum's open again. Eight waves, I hear. People bet on it. | chatterbox |
| `dlg.sunfordPeddler.rumor.east.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | Oakhaven pays well for anything shiny. It's east, past the woods. | chatterbox |
| `dlg.sunfordPeddler.shopBack.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | Come back when your purse is heavier! | chatterbox |
| `dlg.sunfordPeddler.bye.1` | Tilly the Peddler (sunfordPeddler) | sunfordPeddler | Safe travels. Hold on to your coin out there. | chatterbox |
| `dlg.trainerAegis.hello.1` | Ser Aldric (trainerAegis) | trainerAegis | Stand up straight. You're speaking to a knight of the Iron Order. | chatterbox |
| `dlg.trainerAegis.hello.2` | Ser Aldric (trainerAegis) | trainerAegis | Ser Aldric. I teach people to stand between others and harm. | chatterbox |
| `dlg.trainerAegis.saved.1` | Ser Aldric (trainerAegis) | trainerAegis | Oakhaven still stands, and I hear you were on its wall. Well done. | chatterbox |
| `dlg.trainerAegis.fallen.1` | Ser Aldric (trainerAegis) | trainerAegis | You opened Oakhaven's gate. I won't pretend I've forgotten. What do you want? | chatterbox |
| `dlg.trainerAegis.dragon.1` | Ser Aldric (trainerAegis) | trainerAegis | You killed the dragon on the peak? I'd have liked to see that. | chatterbox |
| `dlg.trainerAegis.friend.1` | Ser Aldric (trainerAegis) | trainerAegis | The Order thinks well of you. For its friends, my lessons cost less. | chatterbox |
| `dlg.trainerAegis.foe.1` | Ser Aldric (trainerAegis) | trainerAegis | The Order calls you an enemy. I'll still teach you. That's my choice, not theirs. | chatterbox |
| `dlg.trainerAegis.again.1` | Ser Aldric (trainerAegis) | trainerAegis | Back for more drills? | chatterbox |
| `dlg.trainerAegis.train.1` | Ser Aldric (trainerAegis) | trainerAegis | Good. Watch closely, I'll only show you once. | chatterbox |
| `dlg.trainerAegis.class.say` | The hero (hero) | trainerAegis | What does an Aegis Knight actually do? | chatterbox |
| `dlg.trainerAegis.class.1` | Ser Aldric (trainerAegis) | trainerAegis | We take the blows meant for others. It's simple, and it's hard. | chatterbox |
| `dlg.trainerAegis.class.2` | Ser Aldric (trainerAegis) | trainerAegis | You'll need Strength for the shield and Endurance to keep it up. | chatterbox |
| `dlg.trainerAegis.ready.strong.1` | Ser Aldric (trainerAegis) | trainerAegis | You're strong enough for most of what I know. Keep at your Endurance. | chatterbox |
| `dlg.trainerAegis.ready.able.1` | Ser Aldric (trainerAegis) | trainerAegis | You're ready for the next lesson. Don't let it go to your head. | chatterbox |
| `dlg.trainerAegis.ready.weak.1` | Ser Aldric (trainerAegis) | trainerAegis | Not yet. You'd tire before the shield did. More Strength, more Endurance. | chatterbox |
| `dlg.trainerAegis.order.say` | The hero (hero) | trainerAegis | Tell me about the Iron Order. | chatterbox |
| `dlg.trainerAegis.order.1` | Ser Aldric (trainerAegis) | trainerAegis | We keep the roads safe and the law in hand. Some say too firmly. | chatterbox |
| `dlg.trainerAegis.order.2` | Ser Aldric (trainerAegis) | trainerAegis | Stand with us, and our armourers and teachers will remember you. | chatterbox |
| `dlg.trainerAegis.trainBack.1` | Ser Aldric (trainerAegis) | trainerAegis | Practise until it's boring. Then keep going. | chatterbox |
| `dlg.trainerAegis.bye.1` | Ser Aldric (trainerAegis) | trainerAegis | Go carefully. | chatterbox |
| `dlg.trainerPyro.hello.1` | Ember Wren (trainerPyro) | trainerPyro | Oh, a student? Lovely. Maybe stand back a little. | chatterbox |
| `dlg.trainerPyro.hello.2` | Ember Wren (trainerPyro) | trainerPyro | I'm Ember Wren. I teach fire. Mostly it does what I ask. | chatterbox |
| `dlg.trainerPyro.core.1` | Ember Wren (trainerPyro) | trainerPyro | You gave the core to the Circle! I can't wait to see what we learn from it. | chatterbox |
| `dlg.trainerPyro.friend.1` | Ember Wren (trainerPyro) | trainerPyro | The Circle speaks highly of you. That means a discount, by the way. | chatterbox |
| `dlg.trainerPyro.foe.1` | Ember Wren (trainerPyro) | trainerPyro | The Circle isn't happy with you. I'll still teach you, though. Quietly. | chatterbox |
| `dlg.trainerPyro.again.1` | Ember Wren (trainerPyro) | trainerPyro | You're back! Ready to light something? | chatterbox |
| `dlg.trainerPyro.train.1` | Ember Wren (trainerPyro) | trainerPyro | Right. Watch my hands, and keep your sleeves away from me. | chatterbox |
| `dlg.trainerPyro.class.say` | The hero (hero) | trainerPyro | What does a pyromancer do, exactly? | chatterbox |
| `dlg.trainerPyro.class.1` | Ember Wren (trainerPyro) | trainerPyro | Set things alight, mostly. Then make the fire spread where you want it. | chatterbox |
| `dlg.trainerPyro.class.2` | Ember Wren (trainerPyro) | trainerPyro | It all comes from Intelligence. The sharper the mind, the hotter the flame. | chatterbox |
| `dlg.trainerPyro.ready.strong.1` | Ember Wren (trainerPyro) | trainerPyro | Honestly? You could teach some of this. Take whatever you like. | chatterbox |
| `dlg.trainerPyro.ready.able.1` | Ember Wren (trainerPyro) | trainerPyro | You're ready for the next spell. Come on, I'll show you. | chatterbox |
| `dlg.trainerPyro.ready.weak.1` | Ember Wren (trainerPyro) | trainerPyro | Not yet, I'm afraid. You need more Intelligence, or the fire takes over. | chatterbox |
| `dlg.trainerPyro.circle.say` | The hero (hero) | trainerPyro | Who are the Circle of Aether? | chatterbox |
| `dlg.trainerPyro.circle.1` | Ember Wren (trainerPyro) | trainerPyro | Scholars. We study what the world's made of. Some of it explodes. | chatterbox |
| `dlg.trainerPyro.trainBack.1` | Ember Wren (trainerPyro) | trainerPyro | Go and practise. Somewhere that won't catch, please. | chatterbox |
| `dlg.trainerPyro.bye.1` | Ember Wren (trainerPyro) | trainerPyro | Take care of yourself! | chatterbox |
| `dlg.sfShadow.hello.1` | Nettle Quickhand (sfShadow) | sfShadow | Didn't hear you come in. That's usually my trick. | chatterbox |
| `dlg.sfShadow.hello.2` | Nettle Quickhand (sfShadow) | sfShadow | Nettle Quickhand. I teach the quiet arts: daggers, shadows, leaving early. | chatterbox |
| `dlg.sfShadow.again.1` | Nettle Quickhand (sfShadow) | sfShadow | Back again? Good. Nobody saw you, I hope. | chatterbox |
| `dlg.sfShadow.train.1` | Nettle Quickhand (sfShadow) | sfShadow | Light feet, quick hands. Try not to trip over your own blade. | chatterbox |
| `dlg.sfShadow.class.say` | The hero (hero) | sfShadow | What does a shadow do? | chatterbox |
| `dlg.sfShadow.class.1` | Nettle Quickhand (sfShadow) | sfShadow | Strike where they aren't looking, then be somewhere else entirely. | chatterbox |
| `dlg.sfShadow.class.2` | Nettle Quickhand (sfShadow) | sfShadow | It all runs on Dexterity. Quick hands, quick feet, quick exits. | chatterbox |
| `dlg.sfShadow.ready.strong.1` | Nettle Quickhand (sfShadow) | sfShadow | You're quicker than me now. Take what you like, I won't even notice. | chatterbox |
| `dlg.sfShadow.ready.able.1` | Nettle Quickhand (sfShadow) | sfShadow | You're ready for the next trick. Watch closely, I only do it once. | chatterbox |
| `dlg.sfShadow.ready.weak.1` | Nettle Quickhand (sfShadow) | sfShadow | Not yet. Get quicker first, or the shadows trip you up. | chatterbox |
| `dlg.sfShadow.town.say` | The hero (hero) | sfShadow | Why teach here, in Sunford? | chatterbox |
| `dlg.sfShadow.town.1` | Nettle Quickhand (sfShadow) | sfShadow | Quiet town, honest folk. Nobody looks twice at a farmer's cloak. Perfect. | chatterbox |
| `dlg.sfShadow.trainBack.1` | Nettle Quickhand (sfShadow) | sfShadow | Off you go. Practise where the guards can't see. | chatterbox |
| `dlg.sfShadow.bye.1` | Nettle Quickhand (sfShadow) | sfShadow | Mind your purse. | chatterbox |
| `dlg.sfGeo.hello.1` | Harrow Flint (sfGeo) | sfGeo | Mind the rocks. Some of them are listening. | chatterbox |
| `dlg.sfGeo.hello.2` | Harrow Flint (sfGeo) | sfGeo | Harrow Flint. I teach the old earth magic: stone, roots, a little quake. | chatterbox |
| `dlg.sfGeo.again.1` | Harrow Flint (sfGeo) | sfGeo | Ah, you're back. The ground told me you were coming. | chatterbox |
| `dlg.sfGeo.train.1` | Harrow Flint (sfGeo) | sfGeo | Feet flat, breathe slow. Feel the weight under you. Good. | chatterbox |
| `dlg.sfGeo.class.say` | The hero (hero) | sfGeo | What does a geomancer do? | chatterbox |
| `dlg.sfGeo.class.1` | Harrow Flint (sfGeo) | sfGeo | Ask the earth for help. Walls when you need them, spikes when they don't. | chatterbox |
| `dlg.sfGeo.class.2` | Harrow Flint (sfGeo) | sfGeo | Strength to hold the stone, Intelligence to shape it. You need both. | chatterbox |
| `dlg.sfGeo.ready.strong.1` | Harrow Flint (sfGeo) | sfGeo | The stone answers you before I do now. Take whatever you need. | chatterbox |
| `dlg.sfGeo.ready.able.1` | Harrow Flint (sfGeo) | sfGeo | You're ready for the next lesson. Put your hand on the ground. Listen. | chatterbox |
| `dlg.sfGeo.ready.weak.1` | Harrow Flint (sfGeo) | sfGeo | Not yet. More strength and a clearer head, or the stone won't listen. | chatterbox |
| `dlg.sfGeo.farms.say` | The hero (hero) | sfGeo | Does the earth help the farms too? | chatterbox |
| `dlg.sfGeo.farms.1` | Harrow Flint (sfGeo) | sfGeo | Every spring. The barley grows a hand taller and nobody knows why. Don't tell them. | chatterbox |
| `dlg.sfGeo.trainBack.1` | Harrow Flint (sfGeo) | sfGeo | Go on. And put that rock back where you found it. | chatterbox |
| `dlg.sfGeo.bye.1` | Harrow Flint (sfGeo) | sfGeo | Walk softly. The ground remembers. | chatterbox |
| `dlg.elderMara.hello.1` | Elder Mara (elderMara) | elderMara | So you're the one from the road. Come here, let me look at you. | chatterbox |
| `dlg.elderMara.hello.2` | Elder Mara (elderMara) | elderMara | I'm Mara. I've looked after this town for... oh, forty years now. | chatterbox |
| `dlg.elderMara.slain.1` | Elder Mara (elderMara) | elderMara | The Hollows are quiet. It was a hard thing you did, but we sleep because of it. | chatterbox |
| `dlg.elderMara.pact.1` | Elder Mara (elderMara) | elderMara | Goblins selling things in my square. You talked them into that, didn't you? | chatterbox |
| `dlg.elderMara.ransom.1` | Elder Mara (elderMara) | elderMara | You took his gold and left him his crown. I won't pretend I'm not disappointed. | chatterbox |
| `dlg.elderMara.saved.1` | Elder Mara (elderMara) | elderMara | Word came from Oakhaven. The gate held. I'm glad you were there. | chatterbox |
| `dlg.elderMara.fallen.1` | Elder Mara (elderMara) | elderMara | Oakhaven burned, they say. I'd rather not hear how. Not today. | chatterbox |
| `dlg.elderMara.ending.1` | Elder Mara (elderMara) | elderMara | They say you decided the fate of the Dread Fortress. From our little road to that. | chatterbox |
| `dlg.elderMara.again.1` | Elder Mara (elderMara) | elderMara | Sit for a moment. The road will still be there. | chatterbox |
| `dlg.elderMara.map.say` | The hero (hero) | elderMara | I found a piece of an old map. | chatterbox |
| `dlg.elderMara.map.1` | Elder Mara (elderMara) | elderMara | Captain Rook's map! He tore it up and hid the pieces before the goblins caught him. | chatterbox |
| `dlg.elderMara.map.2` | Elder Mara (elderMara) | elderMara | Find six of the pieces, and the X shows the way: somewhere in the Ashen Crags. Dig there for the gold. | chatterbox |
| `dlg.elderMara.reward.say` | The hero (hero) | elderMara | Someone said you wanted to see me? | chatterbox |
| `dlg.elderMara.reward.1` | Elder Mara (elderMara) | elderMara | You held the road when our militia couldn't. The town put a little together. | chatterbox |
| `dlg.elderMara.reward.2` | Elder Mara (elderMara) | elderMara | It isn't much. It's what we could spare. | chatterbox |
| `dlg.elderMara.quest.say` | The hero (hero) | elderMara | What's troubling Sunford? | chatterbox |
| `dlg.elderMara.quest.1` | Elder Mara (elderMara) | elderMara | The raids come from the Goblin Hollows. They've crowned themselves a king. | chatterbox |
| `dlg.elderMara.quest.2` | The hero (hero) | elderMara | And you want him dead? | chatterbox |
| `dlg.elderMara.quest.3` | Elder Mara (elderMara) | elderMara | I want the raids to stop. How... well, that's for you to decide, down there. | chatterbox |
| `dlg.elderMara.quest.4` | Elder Mara (elderMara) | elderMara | The Hollows are just past the plains. Please, be careful. | chatterbox |
| `dlg.elderMara.king.say` | The hero (hero) | elderMara | About the Goblin King... | chatterbox |
| `dlg.elderMara.king.slay.1` | Elder Mara (elderMara) | elderMara | He's gone, and the caravans run again. I won't ask how it felt. | chatterbox |
| `dlg.elderMara.king.pact.1` | Elder Mara (elderMara) | elderMara | A trade pact. My mother would have fainted. Still, trade beats funerals. | chatterbox |
| `dlg.elderMara.king.ransom.1` | Elder Mara (elderMara) | elderMara | Gold runs out quickly. Grudges don't. Remember that when the raids start. | chatterbox |
| `dlg.elderMara.town.say` | The hero (hero) | elderMara | Tell me about Sunford. | chatterbox |
| `dlg.elderMara.town.1` | Elder Mara (elderMara) | elderMara | Farmers, mostly. A smith, a healer, two teachers who put up with us. | chatterbox |
| `dlg.elderMara.town.2` | Elder Mara (elderMara) | elderMara | Rest here between journeys. That's what home is for. | chatterbox |
| `dlg.elderMara.next.say` | The hero (hero) | elderMara | Where should I go next? | chatterbox |
| `dlg.elderMara.next.plains.1` | Elder Mara (elderMara) | elderMara | The plains road, first. Without the caravans, we don't eat. | chatterbox |
| `dlg.elderMara.next.hollows.1` | Elder Mara (elderMara) | elderMara | The Goblin Hollows. Nothing else is safe while the raids go on. | chatterbox |
| `dlg.elderMara.next.woods.1` | Elder Mara (elderMara) | elderMara | East, through the Whispering Woods. That's the road to Oakhaven. | chatterbox |
| `dlg.elderMara.next.oakhaven.1` | Elder Mara (elderMara) | elderMara | Oakhaven is under siege. If the outskirts fall, the town goes with them. | chatterbox |
| `dlg.elderMara.next.north.1` | Elder Mara (elderMara) | elderMara | North, I think. The Ashen Crags, and Ironhold beyond. It only gets harder. | chatterbox |
| `dlg.elderMara.bye.1` | Elder Mara (elderMara) | elderMara | Come back to us in one piece. That's all I ask. | chatterbox |
| `dlg.sunfordHealer.hello.1` | Sister Lune (sunfordHealer) | sunfordHealer | Hold still a moment. No, you're fine. Habit, sorry. | chatterbox |
| `dlg.sunfordHealer.hello.2` | Sister Lune (sunfordHealer) | sunfordHealer | I'm Sister Lune. I patch up whatever the road breaks. | chatterbox |
| `dlg.sunfordHealer.again.1` | Sister Lune (sunfordHealer) | sunfordHealer | Still in one piece? Good. Sit down anyway. | chatterbox |
| `dlg.hero.heal` | The hero (hero) | hero | Could you patch me up? | chatterbox |
| `dlg.sunfordHealer.heal.1` | Sister Lune (sunfordHealer) | sunfordHealer | Sit, rest a while. I'll fill your flasks before you go. | chatterbox |
| `dlg.hero.mana` | The hero (hero) | hero | Do you have anything for mana? | chatterbox |
| `dlg.sunfordHealer.mana.1` | Sister Lune (sunfordHealer) | sunfordHealer | This one's bitter. Drink it when your spells run dry. | chatterbox |
| `dlg.hero.brew` | The hero (hero) | hero | Could you brew me something? | chatterbox |
| `dlg.sunfordHealer.brew.1` | Sister Lune (sunfordHealer) | sunfordHealer | Let me see your herbs. I'll mix something that tastes better than my mana tonic. | chatterbox |
| `dlg.sunfordHealer.potions.say` | The hero (hero) | sunfordHealer | How do the potions work? | chatterbox |
| `dlg.sunfordHealer.potions.1` | Sister Lune (sunfordHealer) | sunfordHealer | You take a few flasks into every fight. Drink before you need to, not after. | chatterbox |
| `dlg.sunfordHealer.potions.2` | Sister Lune (sunfordHealer) | sunfordHealer | If you want to carry more, I can sell you a bigger belt. | chatterbox |
| `dlg.sunfordHealer.rumor.goblins.1` | Sister Lune (sunfordHealer) | sunfordHealer | The goblins coat their sling stones in something. If you feel sick, come back. | chatterbox |
| `dlg.sunfordHealer.rumor.spiders.1` | Sister Lune (sunfordHealer) | sunfordHealer | I've treated three spider bites from the Woods this week. Watch your step there. | chatterbox |
| `dlg.sunfordHealer.rumor.burns.1` | Sister Lune (sunfordHealer) | sunfordHealer | Soldiers keep coming down from the north with burns. The Ashen Crags, they say. | chatterbox |
| `dlg.sunfordHealer.healBack.1` | Sister Lune (sunfordHealer) | sunfordHealer | Keep your belt full and your head down. | chatterbox |
| `dlg.sunfordHealer.brewBack.1` | Sister Lune (sunfordHealer) | sunfordHealer | Careful, they're hot. Don't drink them all at once. | chatterbox |
| `dlg.sunfordHealer.bye.1` | Sister Lune (sunfordHealer) | sunfordHealer | Look after yourself out there. | chatterbox |
| `dlg.goblinTrader.hello.1` | Grik the Trader (goblinTrader) | goblinTrader | You are the one who made the pact. My king says you are welcome here. | chatterbox |
| `dlg.goblinTrader.hello.2` | Grik the Trader (goblinTrader) | goblinTrader | I am Grik. I sell what goblins make. Good work, fair price. | chatterbox |
| `dlg.goblinTrader.again.1` | Grik the Trader (goblinTrader) | goblinTrader | Friend. Good to see you again. | chatterbox |
| `dlg.goblinTrader.trade.1` | Grik the Trader (goblinTrader) | goblinTrader | Look, please. My family made these. | chatterbox |
| `dlg.goblinTrader.king.say` | The hero (hero) | goblinTrader | How is your king? | chatterbox |
| `dlg.goblinTrader.king.1` | Grik the Trader (goblinTrader) | goblinTrader | He eats well now. No more raids. My people are less hungry. | chatterbox |
| `dlg.goblinTrader.king.2` | Grik the Trader (goblinTrader) | goblinTrader | He speaks of you often. With respect. | chatterbox |
| `dlg.goblinTrader.town.say` | The hero (hero) | goblinTrader | How do you like Sunford? | chatterbox |
| `dlg.goblinTrader.town.1` | Grik the Trader (goblinTrader) | goblinTrader | People still stare. But the baker gives me pie. I like the pie. | chatterbox |
| `dlg.goblinTrader.rumor.crags.1` | Grik the Trader (goblinTrader) | goblinTrader | My cousins dig in the black rock to the north. They say fire walks there now. | chatterbox |
| `dlg.goblinTrader.rumor.deep.1` | Grik the Trader (goblinTrader) | goblinTrader | Something is waking in the deep places. Goblins feel it in the ground. | chatterbox |
| `dlg.goblinTrader.shopBack.1` | Grik the Trader (goblinTrader) | goblinTrader | Thank you. Come again. | chatterbox |
| `dlg.goblinTrader.bye.1` | Grik the Trader (goblinTrader) | goblinTrader | Go safely, friend. | chatterbox |
| `dlg.sunfordGambler.hello.1` | Dob Tumbler (sunfordGambler) | sunfordGambler | Psst. Got any junk in that bag? Old boots, bent swords? I'll play you for it. | chatterbox |
| `dlg.sunfordGambler.hello.2` | Dob Tumbler (sunfordGambler) | sunfordGambler | Dob Tumbler. I play for fun, mostly. And for boots. | chatterbox |
| `dlg.sunfordGambler.again.1` | Dob Tumbler (sunfordGambler) | sunfordGambler | You again! Got any more of that lovely junk? | chatterbox |
| `dlg.hero.play` | The hero (hero) | hero | Deal me in. | chatterbox |
| `dlg.sunfordGambler.play.1` | Dob Tumbler (sunfordGambler) | sunfordGambler | Fee on the table. Lay your things down, highest price takes the point. | chatterbox |
| `dlg.sunfordGambler.rules.say` | The hero (hero) | sunfordGambler | What are the rules? | chatterbox |
| `dlg.sunfordGambler.rules.1` | Dob Tumbler (sunfordGambler) | sunfordGambler | We each lay an item. The pricier one wins the point. Two points wins the game. | chatterbox |
| `dlg.sunfordGambler.rules.2` | Dob Tumbler (sunfordGambler) | sunfordGambler | Whatever you lay is mine, win or lose. Win three games in a row, though, and I've got something special. | chatterbox |
| `dlg.sunfordGambler.who.1` | Dob Tumbler (sunfordGambler) | sunfordGambler | Used to be a pedlar. Turns out people would rather bet their stuff than sell it. | chatterbox |
| `dlg.sunfordGambler.luck.say` | The hero (hero) | sunfordGambler | Do you ever lose? | chatterbox |
| `dlg.sunfordGambler.luck.1` | Dob Tumbler (sunfordGambler) | sunfordGambler | All the time! But I always go home with a new pair of boots. | chatterbox |
| `dlg.sunfordGambler.playBack.1` | Dob Tumbler (sunfordGambler) | sunfordGambler | Good game! That stuff of yours will look lovely on my shelf. | chatterbox |
| `dlg.sunfordGambler.bye.1` | Dob Tumbler (sunfordGambler) | sunfordGambler | Bring more junk! Junk is my favourite. | chatterbox |
| `dlg.sunfordCups.hello.1` | Nell Nimblefingers (sunfordCups) | sunfordCups | Step right up! Three cups, one gem, and your first round is on the house! | chatterbox |
| `dlg.sunfordCups.hello.2` | Nell Nimblefingers (sunfordCups) | sunfordCups | They call me Nell Nimblefingers. Nobody has fooled my hands yet. Want to try? | chatterbox |
| `dlg.sunfordCups.again.1` | Nell Nimblefingers (sunfordCups) | sunfordCups | Back for more? Keep your eyes sharp! | chatterbox |
| `dlg.sunfordCups.play.1` | Nell Nimblefingers (sunfordCups) | sunfordCups | Eyes on the gem, friend. Don't blink! | chatterbox |
| `dlg.sunfordCups.rules.say` | The hero (hero) | sunfordCups | How does it work? | chatterbox |
| `dlg.sunfordCups.rules.1` | Nell Nimblefingers (sunfordCups) | sunfordCups | I hide the gem under a cup and shuffle. You point at the cup that hides it. | chatterbox |
| `dlg.sunfordCups.rules.2` | Nell Nimblefingers (sunfordCups) | sunfordCups | Every win in a row pays more. Three wins bring a prize, five bring a treasure. The first round each day is free. | chatterbox |
| `dlg.sunfordCups.who.1` | Nell Nimblefingers (sunfordCups) | sunfordCups | I learned to shuffle before I could walk. Mum says that explains a lot. | chatterbox |
| `dlg.sunfordCups.luck.say` | The hero (hero) | sunfordCups | Do you ever lose? | chatterbox |
| `dlg.sunfordCups.luck.1` | Nell Nimblefingers (sunfordCups) | sunfordCups | Sometimes! Then I groan very loudly and the crowd feels sorry for me. | chatterbox |
| `dlg.sunfordCups.playBack.1` | Nell Nimblefingers (sunfordCups) | sunfordCups | Great round! Come back tomorrow, the first one is always free. | chatterbox |
| `dlg.sunfordCups.bye.1` | Nell Nimblefingers (sunfordCups) | sunfordCups | See you! Keep your eyes sharp out there. | chatterbox |
| `dlg.freedFarmers.hello.1` | Jory Toller (freedFarmers) | freedFarmers | We'd be dead without you. Me and my boy both. Thank you. | chatterbox |
| `dlg.freedFarmers.hello.2` | Jory Toller (freedFarmers) | freedFarmers | Jory Toller. We farm outside the walls now. Well, we try. | chatterbox |
| `dlg.freedFarmers.again.1` | Jory Toller (freedFarmers) | freedFarmers | There's our hero. Come for a bite? | chatterbox |
| `dlg.freedFarmers.favor.say` | The hero (hero) | freedFarmers | Can I help with anything? | chatterbox |
| `dlg.freedFarmers.favor.1` | Jory Toller (freedFarmers) | freedFarmers | Wolves out of the Whispering Woods keep taking our sheep. | chatterbox |
| `dlg.freedFarmers.favor.2` | Jory Toller (freedFarmers) | freedFarmers | Thin them out, would you? Eight should teach them. | chatterbox |
| `dlg.freedFarmers.waiting.say` | The hero (hero) | freedFarmers | About those wolves... | chatterbox |
| `dlg.freedFarmers.waiting.1` | Jory Toller (freedFarmers) | freedFarmers | The wolves are still about. We heard them last night. | chatterbox |
| `dlg.freedFarmers.favorDone.say` | The hero (hero) | freedFarmers | The wolves won't trouble you again. | chatterbox |
| `dlg.freedFarmers.favorDone.1` | Jory Toller (freedFarmers) | freedFarmers | Quiet nights again. We can finally sleep. | chatterbox |
| `dlg.freedFarmers.favorDone.2` | Jory Toller (freedFarmers) | freedFarmers | Take this. It's not much, but it's honest. | chatterbox |
| `dlg.freedFarmers.who.1` | Jory Toller (freedFarmers) | freedFarmers | Bandits took us from our field and left us in the woods to rot. | chatterbox |
| `dlg.freedFarmers.who.2` | Jory Toller (freedFarmers) | freedFarmers | Oakhaven took us in. We pay it back in bread. | chatterbox |
| `dlg.freedFarmers.bye.1` | Jory Toller (freedFarmers) | freedFarmers | Mind how you go. | chatterbox |
| `dlg.windDisciple.hello.1` | Kestrel Vane (windDisciple) | windDisciple | You got me out! I owe you everything. Well, a lot. | chatterbox |
| `dlg.windDisciple.hello.2` | Kestrel Vane (windDisciple) | windDisciple | Kestrel Vane. Sefa Galewing taught me the bow. I can teach you what she taught me. | chatterbox |
| `dlg.windDisciple.again.1` | Kestrel Vane (windDisciple) | windDisciple | Hey! The wind's good today. Shall we practise? | chatterbox |
| `dlg.windDisciple.train.1` | Kestrel Vane (windDisciple) | windDisciple | Feet apart. Breathe out. Let the wind carry it. | chatterbox |
| `dlg.windDisciple.class.say` | The hero (hero) | windDisciple | What does a Windrunner do? | chatterbox |
| `dlg.windDisciple.class.1` | Kestrel Vane (windDisciple) | windDisciple | Run, shoot, run again. Never be where they aim. | chatterbox |
| `dlg.windDisciple.class.2` | Kestrel Vane (windDisciple) | windDisciple | Dexterity for quick feet. Skill, so every arrow lands. | chatterbox |
| `dlg.windDisciple.ready.strong.1` | Kestrel Vane (windDisciple) | windDisciple | You're faster than me now. Take what you like. | chatterbox |
| `dlg.windDisciple.ready.able.1` | Kestrel Vane (windDisciple) | windDisciple | You're ready for the next one. Watch closely. | chatterbox |
| `dlg.windDisciple.ready.weak.1` | Kestrel Vane (windDisciple) | windDisciple | Not yet. Get quicker first, then come back. | chatterbox |
| `dlg.windDisciple.who.1` | Kestrel Vane (windDisciple) | windDisciple | I was on my way to Silverbridge when the crags caught me. | chatterbox |
| `dlg.windDisciple.who.2` | Kestrel Vane (windDisciple) | windDisciple | Tell Sefa I'm alive, would you? She worries. | chatterbox |
| `dlg.windDisciple.trainBack.1` | Kestrel Vane (windDisciple) | windDisciple | Go and practise. Somewhere windy. | chatterbox |
| `dlg.windDisciple.bye.1` | Kestrel Vane (windDisciple) | windDisciple | Keep your eyes on the wind. | chatterbox |
| `dlg.captainHale.hello.1` | Captain Hale (captainHale) | captainHale | Another sword. Good. We need every one we can get. | chatterbox |
| `dlg.captainHale.hello.2` | Captain Hale (captainHale) | captainHale | Captain Hale. I command what's left of Oakhaven's watch. | chatterbox |
| `dlg.captainHale.saved.1` | Captain Hale (captainHale) | captainHale | The gate held. Three hundred years, and one more. I owe you for that. | chatterbox |
| `dlg.captainHale.ending.1` | Captain Hale (captainHale) | captainHale | You decided the Dread Fortress, they say. My walls feel small next to that. | chatterbox |
| `dlg.captainHale.again.1` | Captain Hale (captainHale) | captainHale | Walls are still standing. For today, anyway. | chatterbox |
| `dlg.captainHale.after.1` | Captain Hale (captainHale) | captainHale | Good to see you. Oakhaven hasn't forgotten. | chatterbox |
| `dlg.captainHale.quest.say` | The hero (hero) | captainHale | How bad is it? | chatterbox |
| `dlg.captainHale.quest.1` | Captain Hale (captainHale) | captainHale | Bad. A warlord called Krag has us surrounded, and he doesn't fight for free. | chatterbox |
| `dlg.captainHale.quest.2` | The hero (hero) | captainHale | Who's paying him? | chatterbox |
| `dlg.captainHale.quest.3` | Captain Hale (captainHale) | captainHale | The Ashen Syndicate. They want a town of their own, and ours has walls. | chatterbox |
| `dlg.captainHale.quest.4` | Captain Hale (captainHale) | captainHale | Break his camp on the Oakhaven Outskirts. That's where this ends, one way or another. | chatterbox |
| `dlg.captainHale.siege.say` | The hero (hero) | captainHale | About the siege... | chatterbox |
| `dlg.captainHale.siege.1` | Captain Hale (captainHale) | captainHale | They offered you a third of the town, didn't they? They offered me a quarter. | chatterbox |
| `dlg.captainHale.siege.2` | Captain Hale (captainHale) | captainHale | The Syndicate will be after you now. Watch your back on the roads. | chatterbox |
| `dlg.captainHale.town.say` | The hero (hero) | captainHale | Tell me about Oakhaven. | chatterbox |
| `dlg.captainHale.town.1` | Captain Hale (captainHale) | captainHale | A trade town. Anything going between the plains and the mountains pays a toll here. | chatterbox |
| `dlg.captainHale.town.2` | Captain Hale (captainHale) | captainHale | That's why everyone wants it. And why I won't give it up. | chatterbox |
| `dlg.captainHale.order.say` | The hero (hero) | captainHale | Do you answer to the Iron Order? | chatterbox |
| `dlg.captainHale.order.1` | Captain Hale (captainHale) | captainHale | I answer to Oakhaven. The Order and I agree most days. Not every day. | chatterbox |
| `dlg.captainHale.rumor.crags.1` | Captain Hale (captainHale) | captainHale | North of the woods the ground's black and burning. The Ashen Crags. Cultists, mostly. | chatterbox |
| `dlg.captainHale.rumor.mines.1` | Captain Hale (captainHale) | captainHale | Ironhold's stopped sending steel. Something's wrong in their mines. | chatterbox |
| `dlg.captainHale.rumor.north.1` | Captain Hale (captainHale) | captainHale | The far north's gone quiet. In my experience, that's never good. | chatterbox |
| `dlg.captainHale.bye.1` | Captain Hale (captainHale) | captainHale | Keep your sword close. | chatterbox |
| `dlg.oakArmorer.hello.1` | Odo the Armorer (oakArmorer) | oakArmorer | If you're after a helmet, I'm sorry. They're all up on the wall. | chatterbox |
| `dlg.oakArmorer.hello.2` | Odo the Armorer (oakArmorer) | oakArmorer | Odo. I make armour. Haven't slept much lately. | chatterbox |
| `dlg.oakArmorer.again.1` | Odo the Armorer (oakArmorer) | oakArmorer | Still here. Still short of nearly everything. | chatterbox |
| `dlg.oakArmorer.trade.1` | Odo the Armorer (oakArmorer) | oakArmorer | Half my stock went to the wall. Take what's left, if it fits. | chatterbox |
| `dlg.oakArmorer.ore.1` | Odo the Armorer (oakArmorer) | oakArmorer | Raw ore! The armoury never has enough. Sell me what you can spare. | chatterbox |
| `dlg.oakArmorer.learnSmith.1` | Odo the Armorer (oakArmorer) | oakArmorer | You want to learn the trade? Good. Oakhaven needs every hammer. | chatterbox |
| `dlg.oakArmorer.learnSmith.2` | Odo the Armorer (oakArmorer) | oakArmorer | Watch the glow. Strike at its heart, three times, and the metal remembers. | chatterbox |
| `dlg.oakArmorer.forge.1` | Odo the Armorer (oakArmorer) | oakArmorer | The anvil's yours. Make something that holds. | chatterbox |
| `dlg.oakArmorer.who.1` | Odo the Armorer (oakArmorer) | oakArmorer | I've armoured this town for twenty years. Never seen all of it worn at once. | chatterbox |
| `dlg.oakArmorer.armor.say` | The hero (hero) | oakArmorer | What sort of armour should I wear? | chatterbox |
| `dlg.oakArmorer.armor.1` | Odo the Armorer (oakArmorer) | oakArmorer | Plate, if you stand your ground. Leather, if you keep moving. Robes, if you're quick. | chatterbox |
| `dlg.oakArmorer.rumor.backRoom.1` | Odo the Armorer (oakArmorer) | oakArmorer | If the siege breaks, I'll open the back room. The good plate's in there. | chatterbox |
| `dlg.oakArmorer.shopBack.1` | Odo the Armorer (oakArmorer) | oakArmorer | It'll hold. It's held so far. | chatterbox |
| `dlg.oakArmorer.forgeBack.1` | Odo the Armorer (oakArmorer) | oakArmorer | Good steel. The walls thank you. | chatterbox |
| `dlg.oakArmorer.sellBack.1` | Odo the Armorer (oakArmorer) | oakArmorer | Every nugget goes into the wall. Thank you. | chatterbox |
| `dlg.oakArmorer.bye.1` | Odo the Armorer (oakArmorer) | oakArmorer | Keep your head down out there. | chatterbox |
| `dlg.oakMasterArmorer.hello.1` | Master Odo (oakArmorer) | oakMasterArmorer | There you are! Come in. The back room's open, and it's open for you. | chatterbox |
| `dlg.oakMasterArmorer.hello.2` | Master Odo (oakArmorer) | oakMasterArmorer | Master Odo, they call me now. Funny what a little peace does for business. | chatterbox |
| `dlg.oakMasterArmorer.ending.1` | Master Odo (oakArmorer) | oakMasterArmorer | From our gate to the Dread Fortress. I tell everyone I fitted your armour. | chatterbox |
| `dlg.oakMasterArmorer.again.1` | Master Odo (oakArmorer) | oakMasterArmorer | Good to see you. What'll it be today? | chatterbox |
| `dlg.oakMasterArmorer.trade.1` | Master Odo (oakArmorer) | oakMasterArmorer | The good plate's out. You've more than earned a look at it. | chatterbox |
| `dlg.oakMasterArmorer.ore.1` | Master Odo (oakArmorer) | oakMasterArmorer | More ore for the walls? I pay for every nugget you can spare. | chatterbox |
| `dlg.oakMasterArmorer.learnSmith.1` | Master Odo (oakArmorer) | oakMasterArmorer | Since the siege I teach anyone who asks. Come, stand here. | chatterbox |
| `dlg.oakMasterArmorer.learnSmith.2` | Master Odo (oakArmorer) | oakMasterArmorer | Three strikes, each in the heart of the glow. That's all the secret there is. | chatterbox |
| `dlg.oakMasterArmorer.forge.1` | Master Odo (oakArmorer) | oakMasterArmorer | Fire's banked and waiting. Go ahead. | chatterbox |
| `dlg.oakMasterArmorer.town.say` | The hero (hero) | oakMasterArmorer | How's the town doing? | chatterbox |
| `dlg.oakMasterArmorer.town.1` | Master Odo (oakArmorer) | oakMasterArmorer | Busy. Loud. Full of merchants grumbling about the toll. | chatterbox |
| `dlg.oakMasterArmorer.town.2` | Master Odo (oakArmorer) | oakMasterArmorer | It's wonderful. I haven't had a quiet hour in weeks. | chatterbox |
| `dlg.oakMasterArmorer.rumor.mines.1` | Master Odo (oakArmorer) | oakMasterArmorer | My steel comes from Ironhold, and they've gone quiet. Someone should check their mines. | chatterbox |
| `dlg.oakMasterArmorer.rumor.tundra.1` | Master Odo (oakArmorer) | oakMasterArmorer | Best ore I ever worked came out of the tundra. The men who found it didn't go back. | chatterbox |
| `dlg.oakMasterArmorer.shopBack.1` | Master Odo (oakArmorer) | oakMasterArmorer | If it doesn't sit right, bring it back. I'll fix it. | chatterbox |
| `dlg.oakMasterArmorer.forgeBack.1` | Master Odo (oakArmorer) | oakMasterArmorer | Every strike makes you better. Come back anytime. | chatterbox |
| `dlg.oakMasterArmorer.sellBack.1` | Master Odo (oakArmorer) | oakMasterArmorer | Bless you. That is more plate for the walls. | chatterbox |
| `dlg.oakMasterArmorer.bye.1` | Master Odo (oakArmorer) | oakMasterArmorer | You're always welcome here. | chatterbox |
| `dlg.oakWeapons.hello.1` | Senna Blades (oakWeapons) | oakWeapons | Looking or buying? Either's fine. Just don't touch the edges. | chatterbox |
| `dlg.oakWeapons.hello.2` | Senna Blades (oakWeapons) | oakWeapons | Senna. I sell blades. What you do with them is your business. | chatterbox |
| `dlg.oakWeapons.saved.1` | Senna Blades (oakWeapons) | oakWeapons | So the siege broke. Good for the town. War was better for my trade, mind. | chatterbox |
| `dlg.oakWeapons.again.1` | Senna Blades (oakWeapons) | oakWeapons | Back for something sharper? | chatterbox |
| `dlg.oakWeapons.trade.1` | Senna Blades (oakWeapons) | oakWeapons | Sharp, balanced, and fairly priced. Take your time. | chatterbox |
| `dlg.oakWeapons.who.1` | Senna Blades (oakWeapons) | oakWeapons | I've sold to both sides of three wars. I'm still here. Most of them aren't. | chatterbox |
| `dlg.oakWeapons.rumor.krag.1` | Senna Blades (oakWeapons) | oakWeapons | Krag's men carry good steel. Syndicate money. Worth picking up, if you get the chance. | chatterbox |
| `dlg.oakWeapons.rumor.which.1` | Senna Blades (oakWeapons) | oakWeapons | Quick blades want Dexterity. Bows and guns want Skill. Know which you are. | chatterbox |
| `dlg.oakWeapons.shopBack.1` | Senna Blades (oakWeapons) | oakWeapons | Keep it oiled. Rust ruins a good edge faster than bone. | chatterbox |
| `dlg.oakWeapons.bye.1` | Senna Blades (oakWeapons) | oakWeapons | Try not to die owing me money. | chatterbox |
| `dlg.trainerShadow.hello.1` | The Whisper (trainerShadow) | trainerShadow | You didn't hear me come up behind you. Most people don't. | chatterbox |
| `dlg.trainerShadow.hello.2` | The Whisper (trainerShadow) | trainerShadow | They call me the Whisper. I teach people how not to be seen. | chatterbox |
| `dlg.trainerShadow.fallen.1` | The Whisper (trainerShadow) | trainerShadow | Town's quieter now. Fewer guards. Easier work, for some of us. | chatterbox |
| `dlg.trainerShadow.friend.1` | The Whisper (trainerShadow) | trainerShadow | The Syndicate counts you as a friend. Friends pay less. Remember that. | chatterbox |
| `dlg.trainerShadow.foe.1` | The Whisper (trainerShadow) | trainerShadow | The Syndicate wants you dead. I was paid to teach, not to kill. So, lessons. | chatterbox |
| `dlg.trainerShadow.again.1` | The Whisper (trainerShadow) | trainerShadow | You're still too loud. We'll work on it. | chatterbox |
| `dlg.trainerShadow.train.1` | The Whisper (trainerShadow) | trainerShadow | Quietly, then. Watch my feet, not my hands. | chatterbox |
| `dlg.trainerShadow.class.say` | The hero (hero) | trainerShadow | What is a Shadowblade? | chatterbox |
| `dlg.trainerShadow.class.1` | The Whisper (trainerShadow) | trainerShadow | Someone who's already behind you. In, one cut, and gone. | chatterbox |
| `dlg.trainerShadow.class.2` | The Whisper (trainerShadow) | trainerShadow | Dexterity matters most. Skill, if you want the cut to count. | chatterbox |
| `dlg.trainerShadow.ready.strong.1` | The Whisper (trainerShadow) | trainerShadow | You move well now. Take the rest. Bring some Skill for the smoke. | chatterbox |
| `dlg.trainerShadow.ready.able.1` | The Whisper (trainerShadow) | trainerShadow | Your hands are quick enough. Next step. | chatterbox |
| `dlg.trainerShadow.ready.weak.1` | The Whisper (trainerShadow) | trainerShadow | Not yet. You're heavy on your feet. Work on your Dexterity. | chatterbox |
| `dlg.trainerShadow.syndicate.say` | The hero (hero) | trainerShadow | Who are the Ashen Syndicate? | chatterbox |
| `dlg.trainerShadow.syndicate.1` | The Whisper (trainerShadow) | trainerShadow | People who noticed the law has a price. I don't judge. I just get paid. | chatterbox |
| `dlg.trainerShadow.trainBack.1` | The Whisper (trainerShadow) | trainerShadow | Now practise where nobody can see you. | chatterbox |
| `dlg.trainerShadow.bye.1` | The Whisper (trainerShadow) | trainerShadow | You never saw me. | chatterbox |
| `dlg.trainerSovereign.hello.1` | Lord Castellan (trainerSovereign) | trainerSovereign | You may come closer. That's close enough. | chatterbox |
| `dlg.trainerSovereign.hello.2` | Lord Castellan (trainerSovereign) | trainerSovereign | Lord Castellan, of Oakhaven's oldest family. I teach command. | chatterbox |
| `dlg.trainerSovereign.saved.1` | Lord Castellan (trainerSovereign) | trainerSovereign | My town stands, and my family's name with it. You have my thanks. Truly. | chatterbox |
| `dlg.trainerSovereign.friend.1` | Lord Castellan (trainerSovereign) | trainerSovereign | A friend of the Order. I'll lower my fee. Please don't spread that around. | chatterbox |
| `dlg.trainerSovereign.foe.1` | Lord Castellan (trainerSovereign) | trainerSovereign | The Order has your name on a list. I'll teach you anyway. Coin is coin. | chatterbox |
| `dlg.trainerSovereign.again.1` | Lord Castellan (trainerSovereign) | trainerSovereign | Ah, you again. Shall we continue? | chatterbox |
| `dlg.trainerSovereign.train.1` | Lord Castellan (trainerSovereign) | trainerSovereign | Very well. Watch how an order is given, and how it's followed. | chatterbox |
| `dlg.trainerSovereign.class.say` | The hero (hero) | trainerSovereign | What is a Grand Sovereign? | chatterbox |
| `dlg.trainerSovereign.class.1` | Lord Castellan (trainerSovereign) | trainerSovereign | Someone who doesn't fight alone. You call guards, and they fight for you. | chatterbox |
| `dlg.trainerSovereign.class.2` | Lord Castellan (trainerSovereign) | trainerSovereign | It takes Charisma. Nobody follows a leader they can't hear. | chatterbox |
| `dlg.trainerSovereign.ready.strong.1` | Lord Castellan (trainerSovereign) | trainerSovereign | You have real presence now. Take the rest of my lessons. | chatterbox |
| `dlg.trainerSovereign.ready.able.1` | Lord Castellan (trainerSovereign) | trainerSovereign | Your voice carries. You're ready for the next lesson. | chatterbox |
| `dlg.trainerSovereign.ready.weak.1` | Lord Castellan (trainerSovereign) | trainerSovereign | I'm afraid no one would follow you yet. Work on your Charisma. | chatterbox |
| `dlg.trainerSovereign.family.say` | The hero (hero) | trainerSovereign | Tell me about your family. | chatterbox |
| `dlg.trainerSovereign.family.1` | Lord Castellan (trainerSovereign) | trainerSovereign | We built the walls Captain Hale stands on. He forgets that. I remind him. | chatterbox |
| `dlg.trainerSovereign.trainBack.1` | Lord Castellan (trainerSovereign) | trainerSovereign | Go on, then. Lead someone. | chatterbox |
| `dlg.trainerSovereign.bye.1` | Lord Castellan (trainerSovereign) | trainerSovereign | Good day to you. | chatterbox |
| `dlg.oakHealer.hello.1` | Brother Fenn (oakHealer) | oakHealer | Next! Oh, you're walking. That makes a nice change. | chatterbox |
| `dlg.oakHealer.hello.2` | Brother Fenn (oakHealer) | oakHealer | Brother Fenn. Forty wounded on the wall, and only one of me. | chatterbox |
| `dlg.oakHealer.saved.1` | Brother Fenn (oakHealer) | oakHealer | No new wounded in three days. I barely know what to do with myself. | chatterbox |
| `dlg.oakHealer.again.1` | Brother Fenn (oakHealer) | oakHealer | You again, and on your own two feet. Good. | chatterbox |
| `dlg.oakHealer.heal.1` | Brother Fenn (oakHealer) | oakHealer | Lie down here, the clean cot. There. Flasks filled, off you go. | chatterbox |
| `dlg.oakHealer.mana.1` | Brother Fenn (oakHealer) | oakHealer | Mana draught. Tastes like old coins, but it works. | chatterbox |
| `dlg.oakHealer.potions.say` | The hero (hero) | oakHealer | Can I carry more potions? | chatterbox |
| `dlg.oakHealer.potions.1` | Brother Fenn (oakHealer) | oakHealer | With a longer belt, yes. I sell those. Filling the flasks is free. | chatterbox |
| `dlg.oakHealer.rumor.archers.1` | Brother Fenn (oakHealer) | oakHealer | Krag's archers aim low. Keep moving and they'll mostly miss. | chatterbox |
| `dlg.oakHealer.rumor.north.1` | Brother Fenn (oakHealer) | oakHealer | I'm seeing burns, frostbite, and one man who swears a statue bit him. | chatterbox |
| `dlg.oakHealer.healBack.1` | Brother Fenn (oakHealer) | oakHealer | Off you go. Next time, come for a chat instead of stitches. | chatterbox |
| `dlg.oakHealer.bye.1` | Brother Fenn (oakHealer) | oakHealer | Take care. And eat something. | chatterbox |
| `dlg.blackMarket.hello.1` | The Fence (blackMarket) | blackMarket | No names here. But I know who opened the gate. Everyone does. | chatterbox |
| `dlg.blackMarket.hello.2` | The Fence (blackMarket) | blackMarket | You can call me the Fence. Everything here came from somewhere. | chatterbox |
| `dlg.blackMarket.foe.1` | The Fence (blackMarket) | blackMarket | The Syndicate isn't fond of you right now. Your gold, though, is welcome. | chatterbox |
| `dlg.blackMarket.again.1` | The Fence (blackMarket) | blackMarket | Back again. Nobody followed you, I hope? | chatterbox |
| `dlg.blackMarket.trade.1` | The Fence (blackMarket) | blackMarket | No questions either way. The Syndicate takes its cut, you take the goods. | chatterbox |
| `dlg.blackMarket.who.1` | The Fence (blackMarket) | blackMarket | Before the fire I sold candles. Honest work. It didn't pay. | chatterbox |
| `dlg.blackMarket.armor.say` | The hero (hero) | blackMarket | Any armour for sale? | chatterbox |
| `dlg.blackMarket.armor.1` | The Fence (blackMarket) | blackMarket | The armourers are gone, friend. You'd know why better than me. | chatterbox |
| `dlg.blackMarket.rumor.citadel.1` | The Fence (blackMarket) | blackMarket | A fortress turned up in the far north last year. Nobody built it. | chatterbox |
| `dlg.blackMarket.rumor.crystals.1` | The Fence (blackMarket) | blackMarket | Someone's buying every void crystal they can find. Not us. That worries me. | chatterbox |
| `dlg.blackMarket.shopBack.1` | The Fence (blackMarket) | blackMarket | You were never here. | chatterbox |
| `dlg.blackMarket.bye.1` | The Fence (blackMarket) | blackMarket | Watch your step. The rubble shifts. | chatterbox |
| `dlg.trainerBlood.hello.1` | Doctor Sangrel (trainerBlood) | trainerBlood | A visitor. Please don't touch the jars. | chatterbox |
| `dlg.trainerBlood.hello.2` | Doctor Sangrel (trainerBlood) | trainerBlood | Doctor Sangrel. Oakhaven's new owners don't ask what I teach. It's restful. | chatterbox |
| `dlg.trainerBlood.found.1` | Doctor Sangrel (trainerBlood) | trainerBlood | You found me. Not many come looking for a doctor in a place like this. | chatterbox |
| `dlg.trainerBlood.found.2` | Doctor Sangrel (trainerBlood) | trainerBlood | Doctor Sangrel. Towns burn people like me, so I work where there aren't any. | chatterbox |
| `dlg.trainerBlood.friend.1` | Doctor Sangrel (trainerBlood) | trainerBlood | The Syndicate speaks for you. I charge its friends less. My standards stay the same. | chatterbox |
| `dlg.trainerBlood.foe.1` | Doctor Sangrel (trainerBlood) | trainerBlood | The Syndicate would pay well for your blood. I'd rather you spent it here. | chatterbox |
| `dlg.trainerBlood.again.1` | Doctor Sangrel (trainerBlood) | trainerBlood | You look pale. Good. It suits the work. | chatterbox |
| `dlg.trainerBlood.train.1` | Doctor Sangrel (trainerBlood) | trainerBlood | Roll up your sleeve. It will hurt. That's rather the point. | chatterbox |
| `dlg.trainerBlood.class.say` | The hero (hero) | trainerBlood | What is a Blood Alchemist? | chatterbox |
| `dlg.trainerBlood.class.1` | Doctor Sangrel (trainerBlood) | trainerBlood | You pay for power with your own health, then take it back from your enemies. | chatterbox |
| `dlg.trainerBlood.class.2` | Doctor Sangrel (trainerBlood) | trainerBlood | Endurance is what you have to spend. Intelligence is how well you spend it. | chatterbox |
| `dlg.trainerBlood.ready.strong.1` | Doctor Sangrel (trainerBlood) | trainerBlood | A remarkable constitution. You may learn nearly all of it. | chatterbox |
| `dlg.trainerBlood.ready.able.1` | Doctor Sangrel (trainerBlood) | trainerBlood | You're sturdy enough for the next lesson. | chatterbox |
| `dlg.trainerBlood.ready.weak.1` | Doctor Sangrel (trainerBlood) | trainerBlood | You'd faint at the first cut. Build your Endurance first, please. | chatterbox |
| `dlg.trainerBlood.jars.say` | The hero (hero) | trainerBlood | What's in the jars? | chatterbox |
| `dlg.trainerBlood.jars.1` | Doctor Sangrel (trainerBlood) | trainerBlood | Samples. Freely given, for the most part. | chatterbox |
| `dlg.trainerBlood.trainBack.1` | Doctor Sangrel (trainerBlood) | trainerBlood | Do keep notes. I'd like to hear how it goes. | chatterbox |
| `dlg.trainerBlood.bye.1` | Doctor Sangrel (trainerBlood) | trainerBlood | Stay healthy. I mean that. | chatterbox |
| `dlg.syndicateBoss.hello.1` | Madam Ash (syndicateBoss) | syndicateBoss | So you're the one who opened the gate. Sit down. You've earned a chair. | chatterbox |
| `dlg.syndicateBoss.hello.2` | Madam Ash (syndicateBoss) | syndicateBoss | They call me Madam Ash. Oakhaven is ours now. Partly thanks to you. | chatterbox |
| `dlg.syndicateBoss.throneOurs.1` | Madam Ash (syndicateBoss) | syndicateBoss | The Dread Fortress, in our hands. You were worth every coin. | chatterbox |
| `dlg.syndicateBoss.throneLost.1` | Madam Ash (syndicateBoss) | syndicateBoss | You gave the throne to someone else. We'll talk about that. Not today. | chatterbox |
| `dlg.syndicateBoss.foe.1` | Madam Ash (syndicateBoss) | syndicateBoss | You've been working against us. Sit anyway. I like to know who I'm dealing with. | chatterbox |
| `dlg.syndicateBoss.again.1` | Madam Ash (syndicateBoss) | syndicateBoss | Back again. What can the Syndicate do for you? | chatterbox |
| `dlg.syndicateBoss.cut.say` | The hero (hero) | syndicateBoss | I was promised a share of Oakhaven. | chatterbox |
| `dlg.syndicateBoss.cut.1` | Madam Ash (syndicateBoss) | syndicateBoss | And you'll have it. A share of a ruin, for now. Here's this season's. | chatterbox |
| `dlg.syndicateBoss.cut.2` | Madam Ash (syndicateBoss) | syndicateBoss | It'll grow. A ruin pays very well when you own its only market. | chatterbox |
| `dlg.syndicateBoss.syndicate.say` | The hero (hero) | syndicateBoss | What does the Syndicate actually want? | chatterbox |
| `dlg.syndicateBoss.syndicate.1` | Madam Ash (syndicateBoss) | syndicateBoss | What everyone wants. We just don't pretend otherwise. | chatterbox |
| `dlg.syndicateBoss.syndicate.2` | Madam Ash (syndicateBoss) | syndicateBoss | Stay friendly, and the Whisper and the Doctor will charge you less. | chatterbox |
| `dlg.syndicateBoss.order.say` | The hero (hero) | syndicateBoss | The Iron Order is after me. | chatterbox |
| `dlg.syndicateBoss.order.1` | Madam Ash (syndicateBoss) | syndicateBoss | Of course they are. You burned one of their towns. Carry extra potions. | chatterbox |
| `dlg.syndicateBoss.rumor.core.1` | Madam Ash (syndicateBoss) | syndicateBoss | The dwarves found something in their mines. A core. Bring it to us and name your price. | chatterbox |
| `dlg.syndicateBoss.rumor.sold.1` | Madam Ash (syndicateBoss) | syndicateBoss | The core arrived safely. You'd be amazed what it does to a lock. | chatterbox |
| `dlg.syndicateBoss.rumor.north.1` | Madam Ash (syndicateBoss) | syndicateBoss | Everything worth having has moved north. So have we. | chatterbox |
| `dlg.syndicateBoss.bye.1` | Madam Ash (syndicateBoss) | syndicateBoss | Don't be a stranger. We keep an eye on strangers. | chatterbox |
| `dlg.oakGambler.hello.1` | Silky Ren (oakGambler) | oakGambler | A newcomer. Do sit down, I don't bite. My prices do, a little. | chatterbox |
| `dlg.oakGambler.hello.2` | Silky Ren (oakGambler) | oakGambler | They call me Silky Ren. I collect fine things, one game at a time. | chatterbox |
| `dlg.oakGambler.again.1` | Silky Ren (oakGambler) | oakGambler | Ah, my favourite opponent. Shall we? | chatterbox |
| `dlg.oakGambler.play.1` | Silky Ren (oakGambler) | oakGambler | The fee, please. Then lay something worth my while. | chatterbox |
| `dlg.oakGambler.rules.say` | The hero (hero) | oakGambler | How do we play? | chatterbox |
| `dlg.oakGambler.rules.1` | Silky Ren (oakGambler) | oakGambler | One item each, three times at most. The finer piece takes the point. Two points take the game. | chatterbox |
| `dlg.oakGambler.rules.2` | Silky Ren (oakGambler) | oakGambler | Your pieces stay with me either way. Win three games running and you'll leave with a real treasure. | chatterbox |
| `dlg.oakGambler.who.1` | Silky Ren (oakGambler) | oakGambler | A dealer in rare things. I find them, I keep them, and now and then I lose one. | chatterbox |
| `dlg.oakGambler.collection.say` | The hero (hero) | oakGambler | What do you do with it all? | chatterbox |
| `dlg.oakGambler.collection.1` | Silky Ren (oakGambler) | oakGambler | I sort it by shine. The shiniest go on the top shelf, next to my teacups. | chatterbox |
| `dlg.oakGambler.playBack.1` | Silky Ren (oakGambler) | oakGambler | Delightful. Do come back when your bag is heavier. | chatterbox |
| `dlg.oakGambler.bye.1` | Silky Ren (oakGambler) | oakGambler | Mind your purse out there. Not everyone plays fair. | chatterbox |
| `dlg.frostDisciple.hello.1` | Ivor Hask (frostDisciple) | frostDisciple | Free. Good. The cold did not take me, and neither did they. | chatterbox |
| `dlg.frostDisciple.hello.2` | Ivor Hask (frostDisciple) | frostDisciple | Ivor Hask. Halvard Rimeheart taught me the frost. I teach it now, here. | chatterbox |
| `dlg.frostDisciple.again.1` | Ivor Hask (frostDisciple) | frostDisciple | You return. Good. | chatterbox |
| `dlg.frostDisciple.train.1` | Ivor Hask (frostDisciple) | frostDisciple | Stand still. Let the cold come to you. Then send it back. | chatterbox |
| `dlg.frostDisciple.class.say` | The hero (hero) | frostDisciple | What is a Frostwarden? | chatterbox |
| `dlg.frostDisciple.class.1` | Ivor Hask (frostDisciple) | frostDisciple | Chill them, freeze them, then break the ice. | chatterbox |
| `dlg.frostDisciple.class.2` | Ivor Hask (frostDisciple) | frostDisciple | Strength for the blade. Intelligence for the frost. | chatterbox |
| `dlg.frostDisciple.ready.strong.1` | Ivor Hask (frostDisciple) | frostDisciple | You are stronger than I was. Take what you need. | chatterbox |
| `dlg.frostDisciple.ready.able.1` | Ivor Hask (frostDisciple) | frostDisciple | You are ready. Next lesson. | chatterbox |
| `dlg.frostDisciple.ready.weak.1` | Ivor Hask (frostDisciple) | frostDisciple | Not yet. More strength of arm and of mind. | chatterbox |
| `dlg.frostDisciple.who.1` | Ivor Hask (frostDisciple) | frostDisciple | I hunted in the tundra. They caged me for a winter. | chatterbox |
| `dlg.frostDisciple.who.2` | Ivor Hask (frostDisciple) | frostDisciple | Ironhold's forges are warm. I like it here. | chatterbox |
| `dlg.frostDisciple.trainBack.1` | Ivor Hask (frostDisciple) | frostDisciple | Practise. The cold is patient. Be the same. | chatterbox |
| `dlg.frostDisciple.bye.1` | Ivor Hask (frostDisciple) | frostDisciple | Stay warm. | chatterbox |
| `dlg.forgemaster.hello.1` | Forgemaster Dorn (forgemaster) | forgemaster | You came up through the mines. I can smell the dust on you. | chatterbox |
| `dlg.forgemaster.hello.2` | Forgemaster Dorn (forgemaster) | forgemaster | Dorn. Forgemaster of Ironhold. And I've got a problem the size of a mountain. | chatterbox |
| `dlg.forgemaster.destroyed.1` | Forgemaster Dorn (forgemaster) | forgemaster | The light's out and the golems are scrap. My miners sang last night. First time in a year. | chatterbox |
| `dlg.forgemaster.studied.1` | Forgemaster Dorn (forgemaster) | forgemaster | Blue fire in my forges and robed scholars in my halls. The work is good, at least. | chatterbox |
| `dlg.forgemaster.sold.1` | Forgemaster Dorn (forgemaster) | forgemaster | You sold it. The golems still walk, and my mines are still a grave. Leave me be. | chatterbox |
| `dlg.forgemaster.ending.1` | Forgemaster Dorn (forgemaster) | forgemaster | So the throne's settled. Good. Maybe now we can get back to digging. | chatterbox |
| `dlg.forgemaster.again.1` | Forgemaster Dorn (forgemaster) | forgemaster | What is it? The forge won't wait. | chatterbox |
| `dlg.forgemaster.quest.say` | The hero (hero) | forgemaster | What happened down in the mines? | chatterbox |
| `dlg.forgemaster.quest.1` | Forgemaster Dorn (forgemaster) | forgemaster | We dug for iron and found a heart. An aether core. You can feel it beating. | chatterbox |
| `dlg.forgemaster.quest.2` | The hero (hero) | forgemaster | And the golems? | chatterbox |
| `dlg.forgemaster.quest.3` | Forgemaster Dorn (forgemaster) | forgemaster | They move to its rhythm. Three powers have written asking for it. I trust none of them. | chatterbox |
| `dlg.forgemaster.quest.4` | Forgemaster Dorn (forgemaster) | forgemaster | You'll reach it first, at the bottom of the Ironhold Mines. What happens then is up to you. | chatterbox |
| `dlg.forgemaster.core.say` | The hero (hero) | forgemaster | About the core... | chatterbox |
| `dlg.forgemaster.core.destroy.1` | Forgemaster Dorn (forgemaster) | forgemaster | You broke a wonder to save my people. The Order sent armourers. I sent ale. | chatterbox |
| `dlg.forgemaster.core.study.1` | Forgemaster Dorn (forgemaster) | forgemaster | The Circle's people are odd, but their guns shoot straight. Fair enough. | chatterbox |
| `dlg.forgemaster.core.sell.1` | Forgemaster Dorn (forgemaster) | forgemaster | You did it for gold. I hope it keeps you warm. | chatterbox |
| `dlg.forgemaster.town.say` | The hero (hero) | forgemaster | Tell me about Ironhold. | chatterbox |
| `dlg.forgemaster.town.1` | Forgemaster Dorn (forgemaster) | forgemaster | The best steel in the realm, when the mines are working. | chatterbox |
| `dlg.forgemaster.town.2` | Forgemaster Dorn (forgemaster) | forgemaster | Stonefoot teaches earth, Pim teaches machines. Both will talk your ear off. | chatterbox |
| `dlg.forgemaster.rumor.tundra.1` | Forgemaster Dorn (forgemaster) | forgemaster | East of the Crags the land turns white. Frostbite Tundra. Giants, and worse. | chatterbox |
| `dlg.forgemaster.rumor.citadel.1` | Forgemaster Dorn (forgemaster) | forgemaster | My scouts saw a fortress up north that wasn't there last year. I don't like that. | chatterbox |
| `dlg.forgemaster.rumor.fortress.1` | Forgemaster Dorn (forgemaster) | forgemaster | It all ends at the Dread Fortress. Every road north leads there. | chatterbox |
| `dlg.forgemaster.bye.1` | Forgemaster Dorn (forgemaster) | forgemaster | Go well. | chatterbox |
| `dlg.ironWeapons.hello.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | Careful with the display. Those are sharp on both edges. | chatterbox |
| `dlg.ironWeapons.hello.2` | Hilda Hammerhand (ironWeapons) | ironWeapons | Hilda Hammerhand. Every piece here was forged by dwarven hands. | chatterbox |
| `dlg.ironWeapons.dragon.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | You killed the dragon? I hope it was with one of my blades. | chatterbox |
| `dlg.ironWeapons.again.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | Back for proper steel? | chatterbox |
| `dlg.ironWeapons.trade.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | Dwarf-forged. If one of these breaks, I'll want to know how. | chatterbox |
| `dlg.ironWeapons.ore.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | Good, honest metal. Lay it out, I pay by the nugget. | chatterbox |
| `dlg.ironWeapons.learnSmith.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | A surface-dweller at the anvil? Well, everyone starts somewhere. | chatterbox |
| `dlg.ironWeapons.learnSmith.2` | Hilda Hammerhand (ironWeapons) | ironWeapons | The glow tells you when. Your arm tells you how hard. Three strikes. | chatterbox |
| `dlg.ironWeapons.forge.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | Mind the sparks, and don't touch my good hammer. | chatterbox |
| `dlg.ironWeapons.who.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | My mother forged for kings. I forge for whoever comes through the door. | chatterbox |
| `dlg.ironWeapons.rumor.golems.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | Those golems down there are made of our own iron. It stings, I'll tell you. | chatterbox |
| `dlg.ironWeapons.rumor.arm.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | A good blade does half the work. Your Strength has to do the rest. | chatterbox |
| `dlg.ironWeapons.shopBack.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | Bring it back blunt and I'll know you've used it well. | chatterbox |
| `dlg.ironWeapons.forgeBack.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | A dwarf would've done better. But not by much. | chatterbox |
| `dlg.ironWeapons.sellBack.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | Fair trade. Ironhold always pays for good metal. | chatterbox |
| `dlg.ironWeapons.bye.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | Strike hard. | chatterbox |
| `dlg.ironAetherWorks.hello.1` | Tinker Voss (ironAetherWorks) | ironAetherWorks | Careful, that one's loaded. Most of them are, actually. | chatterbox |
| `dlg.ironAetherWorks.hello.2` | Tinker Voss (ironAetherWorks) | ironAetherWorks | Tinker Voss. The Circle sent me to study the core. It's taught us so much. | chatterbox |
| `dlg.ironAetherWorks.again.1` | Tinker Voss (ironAetherWorks) | ironAetherWorks | Ah, good. I've made a few changes since you were here. | chatterbox |
| `dlg.ironAetherWorks.trade.1` | Tinker Voss (ironAetherWorks) | ironAetherWorks | Everything here came out of studying the core. Just don't point it at me. | chatterbox |
| `dlg.ironAetherWorks.core.say` | The hero (hero) | ironAetherWorks | What did the core teach you? | chatterbox |
| `dlg.ironAetherWorks.core.1` | Tinker Voss (ironAetherWorks) | ironAetherWorks | That metal can think, a little. I try not to dwell on that. | chatterbox |
| `dlg.ironAetherWorks.rumor.heat.1` | Tinker Voss (ironAetherWorks) | ironAetherWorks | Guns run on Skill, and they run hot. Ask Pim about heat before you burn a hand. | chatterbox |
| `dlg.ironAetherWorks.shopBack.1` | Tinker Voss (ironAetherWorks) | ironAetherWorks | Let me know how it handles. I'm keeping notes. | chatterbox |
| `dlg.ironAetherWorks.bye.1` | Tinker Voss (ironAetherWorks) | ironAetherWorks | Mind the recoil. | chatterbox |
| `dlg.ironArmor.hello.1` | Garrun Ironside (ironArmor) | ironArmor | Garrun. Armour on the racks, rings in the tray. | chatterbox |
| `dlg.ironArmor.again.1` | Garrun Ironside (ironArmor) | ironArmor | Back. What do you need? | chatterbox |
| `dlg.ironArmor.trade.1` | Garrun Ironside (ironArmor) | ironArmor | That plate will turn a giant's club. Have a look. | chatterbox |
| `dlg.ironArmor.ore.1` | Garrun Ironside (ironArmor) | ironArmor | Let me weigh it. Pick what you will sell, I count the coin. | chatterbox |
| `dlg.ironArmor.learnSmith.1` | Garrun Ironside (ironArmor) | ironArmor | Plate is patient work. I'll show you the basics. | chatterbox |
| `dlg.ironArmor.learnSmith.2` | Garrun Ironside (ironArmor) | ironArmor | Heat, strike, turn. Three strikes, right in the glow. Then let it cool. | chatterbox |
| `dlg.ironArmor.forge.1` | Garrun Ironside (ironArmor) | ironArmor | The forge is ready when you are. | chatterbox |
| `dlg.ironArmor.quiet.say` | The hero (hero) | ironArmor | You don't say much, do you? | chatterbox |
| `dlg.ironArmor.quiet.1` | Garrun Ironside (ironArmor) | ironArmor | Not much worth saying. | chatterbox |
| `dlg.ironArmor.rumor.giants.1` | Garrun Ironside (ironArmor) | ironArmor | Giants in the tundra. Clubs like tree trunks. I'd take the heavy plate. | chatterbox |
| `dlg.ironArmor.rumor.demons.1` | Garrun Ironside (ironArmor) | ironArmor | Demons up north. Fire and claws. I'd take the heavy plate. | chatterbox |
| `dlg.ironArmor.shopBack.1` | Garrun Ironside (ironArmor) | ironArmor | Good choice. | chatterbox |
| `dlg.ironArmor.forgeBack.1` | Garrun Ironside (ironArmor) | ironArmor | Let it cool before you wear it. | chatterbox |
| `dlg.ironArmor.sellBack.1` | Garrun Ironside (ironArmor) | ironArmor | Weighed and paid. Good. | chatterbox |
| `dlg.ironArmor.bye.1` | Garrun Ironside (ironArmor) | ironArmor | Take care. | chatterbox |
| `dlg.ironOrderArmor.hello.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | You're the one who destroyed the core. The Order remembers that. | chatterbox |
| `dlg.ironOrderArmor.hello.2` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | I'm the Order's quartermaster here. Our armouries are open to you. | chatterbox |
| `dlg.ironOrderArmor.throneOurs.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | The Order holds the Dread Fortress, thanks to you. At ease. You've earned it. | chatterbox |
| `dlg.ironOrderArmor.foe.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | The Order has you on a list. My orders say to sell to you anyway. I'll follow them. | chatterbox |
| `dlg.ironOrderArmor.again.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | What do you need? | chatterbox |
| `dlg.ironOrderArmor.trade.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | Take what you need. The Order looks after its own. | chatterbox |
| `dlg.ironOrderArmor.ore.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | The Order buys ore for the war. Sell what you can spare. | chatterbox |
| `dlg.ironOrderArmor.learnSmith.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | The Order arms its friends. I will teach you. | chatterbox |
| `dlg.ironOrderArmor.learnSmith.2` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | Discipline at the anvil, as on the field. Three strikes, true to the glow. | chatterbox |
| `dlg.ironOrderArmor.forge.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | Use the Order's forge with honour. | chatterbox |
| `dlg.ironOrderArmor.order.say` | The hero (hero) | ironOrderArmor | What does the Order want from me? | chatterbox |
| `dlg.ironOrderArmor.order.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | Nothing, for now. That doesn't happen often. Enjoy it. | chatterbox |
| `dlg.ironOrderArmor.rumor.throne.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | The Order will want the throne in the Dread Fortress. It'll remember who helped. | chatterbox |
| `dlg.ironOrderArmor.shopBack.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | Look after it. It's Order property until you've bled in it. | chatterbox |
| `dlg.ironOrderArmor.forgeBack.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | Well forged. Serve well in it. | chatterbox |
| `dlg.ironOrderArmor.sellBack.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | Your payment is recorded. The Order thanks you. | chatterbox |
| `dlg.ironOrderArmor.bye.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | Carry on. | chatterbox |
| `dlg.trainerGeo.hello.1` | Old Stonefoot (trainerGeo) | trainerGeo | Slow down. The mountain isn't going anywhere. | chatterbox |
| `dlg.trainerGeo.hello.2` | Old Stonefoot (trainerGeo) | trainerGeo | They call me Old Stonefoot. I listen to the ground. Sometimes it answers. | chatterbox |
| `dlg.trainerGeo.core.1` | Old Stonefoot (trainerGeo) | trainerGeo | The mountain feels different since you went down there. Calmer, or emptier. | chatterbox |
| `dlg.trainerGeo.dragon.1` | Old Stonefoot (trainerGeo) | trainerGeo | A dragon flew over the peak yesterday and left us alone. Your doing, I'm told. | chatterbox |
| `dlg.trainerGeo.again.1` | Old Stonefoot (trainerGeo) | trainerGeo | There you are. I thought you'd be back. | chatterbox |
| `dlg.trainerGeo.train.1` | Old Stonefoot (trainerGeo) | trainerGeo | Plant your feet. Feel that? No? That's where we start. | chatterbox |
| `dlg.trainerGeo.class.say` | The hero (hero) | trainerGeo | What does a Geomancer do? | chatterbox |
| `dlg.trainerGeo.class.1` | Old Stonefoot (trainerGeo) | trainerGeo | We raise walls, call up spikes, and break the ground when we have to. | chatterbox |
| `dlg.trainerGeo.class.2` | Old Stonefoot (trainerGeo) | trainerGeo | Strength to move the stone. Intelligence to know where it wants to go. | chatterbox |
| `dlg.trainerGeo.ready.strong.1` | Old Stonefoot (trainerGeo) | trainerGeo | The stone knows you now. Learn the rest when you're ready. | chatterbox |
| `dlg.trainerGeo.ready.able.1` | Old Stonefoot (trainerGeo) | trainerGeo | You're steady enough for the next lesson. | chatterbox |
| `dlg.trainerGeo.ready.weak.1` | Old Stonefoot (trainerGeo) | trainerGeo | Not yet. The stone won't move for you. Build your Strength. | chatterbox |
| `dlg.trainerGeo.factions.say` | The hero (hero) | trainerGeo | Which faction do you serve? | chatterbox |
| `dlg.trainerGeo.factions.1` | Old Stonefoot (trainerGeo) | trainerGeo | None of them. Orders and guilds come and go. The mountain stays. | chatterbox |
| `dlg.trainerGeo.trainBack.1` | Old Stonefoot (trainerGeo) | trainerGeo | Take your time with it. The ground's patient. | chatterbox |
| `dlg.trainerGeo.bye.1` | Old Stonefoot (trainerGeo) | trainerGeo | Walk softly. | chatterbox |
| `dlg.trainerAether.hello.1` | Gearwright Pim (trainerAether) | trainerAether | Ah, wait, don't touch that! Or that. Stand on the rug, the rug's safe. | chatterbox |
| `dlg.trainerAether.hello.2` | Gearwright Pim (trainerAether) | trainerAether | Gearwright Pim. I build guns, turrets, and a lot of heat gauges. | chatterbox |
| `dlg.trainerAether.core.1` | Gearwright Pim (trainerAether) | trainerAether | You gave the core to the Circle! I've hardly slept since. In a good way. | chatterbox |
| `dlg.trainerAether.oracle.1` | Gearwright Pim (trainerAether) | trainerAether | The Circle's angry about the oracle. I just build things. I'd rather not get involved. | chatterbox |
| `dlg.trainerAether.friend.1` | Gearwright Pim (trainerAether) | trainerAether | You're a friend of the Circle, so your lessons are cheaper. I did the paperwork. | chatterbox |
| `dlg.trainerAether.foe.1` | Gearwright Pim (trainerAether) | trainerAether | The Circle says I shouldn't teach you. I'm going to anyway. Don't tell them. | chatterbox |
| `dlg.trainerAether.again.1` | Gearwright Pim (trainerAether) | trainerAether | Oh good, you've still got all your fingers. | chatterbox |
| `dlg.trainerAether.train.1` | Gearwright Pim (trainerAether) | trainerAether | Right. Safety first, then the loud part. | chatterbox |
| `dlg.trainerAether.class.say` | The hero (hero) | trainerAether | What is an Aether-Tech? | chatterbox |
| `dlg.trainerAether.class.1` | Gearwright Pim (trainerAether) | trainerAether | Guns, turrets, and a heat gauge. Shoot, build, and vent before you lock up. | chatterbox |
| `dlg.trainerAether.class.2` | Gearwright Pim (trainerAether) | trainerAether | Mostly it's Skill. A bit of Intelligence for the bigger machines. | chatterbox |
| `dlg.trainerAether.ready.strong.1` | Gearwright Pim (trainerAether) | trainerAether | You know your way around a turret now. Take the big machines. | chatterbox |
| `dlg.trainerAether.ready.able.1` | Gearwright Pim (trainerAether) | trainerAether | Steady hands. You're ready for the next one. | chatterbox |
| `dlg.trainerAether.ready.weak.1` | Gearwright Pim (trainerAether) | trainerAether | Your aim's a bit shaky still. Put some points into Skill. | chatterbox |
| `dlg.trainerAether.heat.say` | The hero (hero) | trainerAether | What happens if I overheat? | chatterbox |
| `dlg.trainerAether.heat.1` | Gearwright Pim (trainerAether) | trainerAether | Everything locks up for a few seconds. Vent early, vent often. Trust me on that. | chatterbox |
| `dlg.trainerAether.trainBack.1` | Gearwright Pim (trainerAether) | trainerAether | And remember to vent the heat before it vents you. | chatterbox |
| `dlg.trainerAether.bye.1` | Gearwright Pim (trainerAether) | trainerAether | Be careful out there! | chatterbox |
| `dlg.ironHealer.hello.1` | Mother Brynja (ironHealer) | ironHealer | Boots off at the door, please. I've only just swept. | chatterbox |
| `dlg.ironHealer.hello.2` | Mother Brynja (ironHealer) | ironHealer | Mother Brynja. I've set most of the broken bones in this mountain. | chatterbox |
| `dlg.ironHealer.ending.1` | Mother Brynja (ironHealer) | ironHealer | You went to the Dread Fortress and came back. Sit down. Let me look at you. | chatterbox |
| `dlg.ironHealer.again.1` | Mother Brynja (ironHealer) | ironHealer | Still alive. Good. Sit. | chatterbox |
| `dlg.ironHealer.heal.1` | Mother Brynja (ironHealer) | ironHealer | Drink this, and don't make that face. Your flasks are full. | chatterbox |
| `dlg.ironHealer.mana.1` | Mother Brynja (ironHealer) | ironHealer | Here. It tastes awful. Drink it when your magic runs out, not before. | chatterbox |
| `dlg.ironHealer.potions.say` | The hero (hero) | ironHealer | Can I carry more potions? | chatterbox |
| `dlg.ironHealer.potions.1` | Mother Brynja (ironHealer) | ironHealer | I can sell you a longer belt. Five flasks is about all anyone can carry and still run. | chatterbox |
| `dlg.ironHealer.rumor.tundra.1` | Mother Brynja (ironHealer) | ironHealer | The tundra takes fingers and toes. Keep moving, and don't fall asleep in the snow. | chatterbox |
| `dlg.ironHealer.rumor.temple.1` | Mother Brynja (ironHealer) | ironHealer | There's a drowned temple past the tundra. The naga there don't take prisoners. | chatterbox |
| `dlg.ironHealer.rumor.rift.1` | Mother Brynja (ironHealer) | ironHealer | Whatever's in that rift, I can't stitch it. Don't let it reach you. | chatterbox |
| `dlg.ironHealer.healBack.1` | Mother Brynja (ironHealer) | ironHealer | Off you go. And eat something, you're too thin. | chatterbox |
| `dlg.ironHealer.bye.1` | Mother Brynja (ironHealer) | ironHealer | Come back in one piece. | chatterbox |
| `dlg.exiledSovereign.hello.1` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | You. You're the one who opened my gate. | chatterbox |
| `dlg.exiledSovereign.hello.2` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | I teach in a cellar now, because I have to eat. Don't take it for forgiveness. | chatterbox |
| `dlg.exiledSovereign.ending.1` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | So the throne's decided, and Oakhaven is still ashes. I hope it was worth it. | chatterbox |
| `dlg.exiledSovereign.again.1` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | You're back. My fee hasn't changed. | chatterbox |
| `dlg.exiledSovereign.train.1` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | I'll teach you to command. Whether you deserve it is another matter. | chatterbox |
| `dlg.exiledSovereign.class.say` | The hero (hero) | exiledSovereign | What is a Grand Sovereign? | chatterbox |
| `dlg.exiledSovereign.class.1` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | Someone others follow. Guards come when you call and fight at your word. | chatterbox |
| `dlg.exiledSovereign.class.2` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | It runs on Charisma. You have some. That's what makes it hard to forgive. | chatterbox |
| `dlg.exiledSovereign.ready.strong.1` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | You have the presence for all of it. I wish you'd used it better. | chatterbox |
| `dlg.exiledSovereign.ready.able.1` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | You're ready for the next lesson. I won't pretend I'm glad. | chatterbox |
| `dlg.exiledSovereign.ready.weak.1` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | No one would follow you yet. Work on your Charisma. | chatterbox |
| `dlg.exiledSovereign.oakhaven.say` | The hero (hero) | exiledSovereign | About Oakhaven... | chatterbox |
| `dlg.exiledSovereign.oakhaven.1` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | Three hundred years. My family built those walls. | chatterbox |
| `dlg.exiledSovereign.oakhaven.2` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | Please don't explain. Nothing you could say would make it right. | chatterbox |
| `dlg.exiledSovereign.trainBack.1` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | Go. Practise on someone else. | chatterbox |
| `dlg.exiledSovereign.bye.1` | Lord Castellan, in exile (trainerSovereign) | exiledSovereign | Leave me, please. | chatterbox |
| `dlg.trainerChrono.fled.1` | The Keeper of Hours (trainerChrono) | trainerChrono | You killed her. I saw it coming for years, and it still hurts. | chatterbox |
| `dlg.trainerChrono.fled.2` | The Keeper of Hours (trainerChrono) | trainerChrono | I'm the Keeper of Hours. I'll teach you. She told me I would. | chatterbox |
| `dlg.trainerChrono.hello.1` | The Keeper of Hours (trainerChrono) | trainerChrono | There you are. I've been expecting you for a while. Or will have been. | chatterbox |
| `dlg.trainerChrono.hello.2` | The Keeper of Hours (trainerChrono) | trainerChrono | I'm the Keeper of Hours. I teach how to bend time, a little. | chatterbox |
| `dlg.trainerChrono.freed.1` | The Keeper of Hours (trainerChrono) | trainerChrono | She's free. For once I can't tell what happens next. It's wonderful. | chatterbox |
| `dlg.trainerChrono.friend.1` | The Keeper of Hours (trainerChrono) | trainerChrono | The Circle thinks well of you, so the lessons cost less. They decided that last week. | chatterbox |
| `dlg.trainerChrono.foe.1` | The Keeper of Hours (trainerChrono) | trainerChrono | The Circle's angry with you now. It passes. Until then, we'll keep this quiet. | chatterbox |
| `dlg.trainerChrono.again.1` | The Keeper of Hours (trainerChrono) | trainerChrono | Welcome back. You're right on time. | chatterbox |
| `dlg.trainerChrono.train.1` | The Keeper of Hours (trainerChrono) | trainerChrono | Watch closely. Then watch again, a moment earlier. | chatterbox |
| `dlg.trainerChrono.class.say` | The hero (hero) | trainerChrono | What is a Chrono-Weaver? | chatterbox |
| `dlg.trainerChrono.class.1` | The Keeper of Hours (trainerChrono) | trainerChrono | We hold a foe still in time, hurry a friend along, and take back a mistake. | chatterbox |
| `dlg.trainerChrono.class.2` | The Keeper of Hours (trainerChrono) | trainerChrono | Intelligence to see the thread. Skill to pull it. | chatterbox |
| `dlg.trainerChrono.ready.strong.1` | The Keeper of Hours (trainerChrono) | trainerChrono | You hold the thread well. Take the rest whenever you like. | chatterbox |
| `dlg.trainerChrono.ready.able.1` | The Keeper of Hours (trainerChrono) | trainerChrono | You're ready. I could tell before you asked. | chatterbox |
| `dlg.trainerChrono.ready.weak.1` | The Keeper of Hours (trainerChrono) | trainerChrono | The thread keeps slipping. More Intelligence, and more Skill. | chatterbox |
| `dlg.trainerChrono.oracle.say` | The hero (hero) | trainerChrono | Tell me about the oracle. | chatterbox |
| `dlg.trainerChrono.oracle.freed.1` | The Keeper of Hours (trainerChrono) | trainerChrono | She saw every ending except her own. Now she gets to find out. | chatterbox |
| `dlg.trainerChrono.oracle.slain.1` | The Keeper of Hours (trainerChrono) | trainerChrono | She didn't fight it. She'd seen it already. Please don't ask me again. | chatterbox |
| `dlg.trainerChrono.oracle.waits.1` | The Keeper of Hours (trainerChrono) | trainerChrono | She sees every ending. It's a heavy thing to carry. Be kind to her. | chatterbox |
| `dlg.trainerChrono.trainBack.1` | The Keeper of Hours (trainerChrono) | trainerChrono | It'll make sense later. It usually does. | chatterbox |
| `dlg.trainerChrono.bye.1` | The Keeper of Hours (trainerChrono) | trainerChrono | Until we meet again. Or before. | chatterbox |
| `dlg.freedHerbalist.hello.1` | Briar Hollowell (freedHerbalist) | freedHerbalist | I knew someone would come. The goblins never understood herbs. Or kindness. | chatterbox |
| `dlg.freedHerbalist.hello.2` | Briar Hollowell (freedHerbalist) | freedHerbalist | I'm Briar. I gather and dry what grows. Silverbridge was kind enough to take me in. | chatterbox |
| `dlg.freedHerbalist.again.1` | Briar Hollowell (freedHerbalist) | freedHerbalist | Ah, hello again. Your boots smell of moss. Good. | chatterbox |
| `dlg.freedHerbalist.favor.say` | The hero (hero) | freedHerbalist | Is there anything I can do for you? | chatterbox |
| `dlg.freedHerbalist.favor.1` | Briar Hollowell (freedHerbalist) | freedHerbalist | My stores were lost in that cage. Could you bring me three sunpetals? | chatterbox |
| `dlg.freedHerbalist.favor.2` | Briar Hollowell (freedHerbalist) | freedHerbalist | They grow out on the plains. I'll pay well for them. | chatterbox |
| `dlg.freedHerbalist.waiting.say` | The hero (hero) | freedHerbalist | About those sunpetals... | chatterbox |
| `dlg.freedHerbalist.waiting.1` | Briar Hollowell (freedHerbalist) | freedHerbalist | Still looking? Sunpetals love the open sun. | chatterbox |
| `dlg.freedHerbalist.favorDone.say` | The hero (hero) | freedHerbalist | Here are your sunpetals. | chatterbox |
| `dlg.freedHerbalist.favorDone.1` | Briar Hollowell (freedHerbalist) | freedHerbalist | Oh, these are perfect. Smell that! | chatterbox |
| `dlg.freedHerbalist.favorDone.2` | Briar Hollowell (freedHerbalist) | freedHerbalist | Here, your payment. And my thanks, again. | chatterbox |
| `dlg.freedHerbalist.who.1` | Briar Hollowell (freedHerbalist) | freedHerbalist | A herbalist from the hills. The goblins took me for a witch. | chatterbox |
| `dlg.freedHerbalist.who.2` | Briar Hollowell (freedHerbalist) | freedHerbalist | They weren't entirely wrong. | chatterbox |
| `dlg.freedHerbalist.bye.1` | Briar Hollowell (freedHerbalist) | freedHerbalist | Walk gently. Things grow there. | chatterbox |
| `dlg.mayorBrenna.hello.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | Mind the cart! Sorry, everything on this bridge moves. Welcome to Silverbridge. | chatterbox |
| `dlg.mayorBrenna.hello.2` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | I'm Mayor Brenna Quill. If it's lost, broken or late, it ends up on my desk. | chatterbox |
| `dlg.mayorBrenna.ending.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | The whole river's talking about you. Trade's never been better. So, thank you. | chatterbox |
| `dlg.mayorBrenna.again.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | Back again? Good. Try not to block the carts. | chatterbox |
| `dlg.mayorBrenna.who.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | Mayor, nine years now. Before that I sold rope. Same job, really. Holding things together. | chatterbox |
| `dlg.mayorBrenna.who.2` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | The town votes every spring. So far, nobody else wants the desk. | chatterbox |
| `dlg.mayorBrenna.town.say` | The hero (hero) | mayorBrenna | Tell me about Silverbridge. | chatterbox |
| `dlg.mayorBrenna.town.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | The bridge came first. Then a market on it, then houses, then houses on top of those. | chatterbox |
| `dlg.mayorBrenna.town.2` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | Mind the fountains. Children fall in. So do grown-ups, on market day. | chatterbox |
| `dlg.mayorBrenna.masters.say` | The hero (hero) | mayorBrenna | Is there really a teacher for every class here? | chatterbox |
| `dlg.mayorBrenna.masters.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | Every single one. Shield, fire, shadow, stone. A master of each, all on one bridge. | chatterbox |
| `dlg.mayorBrenna.masters.2` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | Pupils come from all over. It's good for the inns. Less good for my windows. | chatterbox |
| `dlg.mayorBrenna.river.say` | The hero (hero) | mayorBrenna | What do people trade here? | chatterbox |
| `dlg.mayorBrenna.river.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | Whatever the river brings. Fish, silk, Ironhold steel, the odd crate of angry chickens. | chatterbox |
| `dlg.mayorBrenna.river.2` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | And not every trader in Silverbridge hangs out a sign. Keep your eyes open. | chatterbox |
| `dlg.mayorBrenna.rumor.crags.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | The boats from the north have stopped. Something's burning up in the Ashen Crags. | chatterbox |
| `dlg.mayorBrenna.rumor.mines.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | No Ironhold steel this month. The dwarves say something's gone wrong in their mines. | chatterbox |
| `dlg.mayorBrenna.rumor.tundra.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | The fur traders won't cross the tundra anymore. They say the giants are on the move. | chatterbox |
| `dlg.mayorBrenna.rumor.far.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | Traders only whisper about the far north now. Whatever's up there, it isn't buying. | chatterbox |
| `dlg.mayorBrenna.bye.1` | Mayor Brenna Quill (mayorBrenna) | mayorBrenna | Off you go. And if anyone asks, the bridge toll is very fair. | chatterbox |
| `dlg.sbHealer.hello.1` | Friar Ansel (sbHealer) | sbHealer | Mm? Oh, a patient. Sorry, I was resting my eyes. Healers do that. | chatterbox |
| `dlg.sbHealer.hello.2` | Friar Ansel (sbHealer) | sbHealer | Friar Ansel. Come in, sit down. The chair's comfier than it looks. | chatterbox |
| `dlg.sbHealer.again.1` | Friar Ansel (sbHealer) | sbHealer | Ah, you're back. And I'd only just sat down. | chatterbox |
| `dlg.sbHealer.heal.1` | Friar Ansel (sbHealer) | sbHealer | Lie back, close your eyes. Not for long, or I'll nod off too. There, flasks full. | chatterbox |
| `dlg.sbHealer.mana.1` | Friar Ansel (sbHealer) | sbHealer | Glowcap tonic. Good for the mind, bad for the breath. Sip it slowly. | chatterbox |
| `dlg.sbHealer.potions.say` | The hero (hero) | sbHealer | Any advice on potions? | chatterbox |
| `dlg.sbHealer.potions.1` | Friar Ansel (sbHealer) | sbHealer | Drink one before you're desperate. Heroes always wait too long. | chatterbox |
| `dlg.sbHealer.potions.2` | Friar Ansel (sbHealer) | sbHealer | If you want to carry more, I sell longer belts. Filling the flasks is free. | chatterbox |
| `dlg.sbHealer.sleep.say` | The hero (hero) | sbHealer | Do you ever actually sleep? | chatterbox |
| `dlg.sbHealer.sleep.1` | Friar Ansel (sbHealer) | sbHealer | Not at night. Pupils from every class, all practising. Something always explodes. | chatterbox |
| `dlg.sbHealer.healBack.1` | Friar Ansel (sbHealer) | sbHealer | Off you go. Next time, come for tea instead of bandages. | chatterbox |
| `dlg.sbHealer.bye.1` | Friar Ansel (sbHealer) | sbHealer | Mind the steps. Half my patients only tripped on them. | chatterbox |
| `dlg.sbAlchemist.hello.1` | Odile Fernwhistle (sbAlchemist) | sbAlchemist | Oh! Mind the jars. That one bites. Well, it nibbles. | chatterbox |
| `dlg.sbAlchemist.hello.2` | Odile Fernwhistle (sbAlchemist) | sbAlchemist | Odile Fernwhistle, alchemist. Bring me herbs and I'll bottle you a little courage. | chatterbox |
| `dlg.sbAlchemist.again.1` | Odile Fernwhistle (sbAlchemist) | sbAlchemist | You're back! Did you bring me anything green? | chatterbox |
| `dlg.sbAlchemist.brew.1` | Odile Fernwhistle (sbAlchemist) | sbAlchemist | Let's see your pouch. Ooh, lovely. Pick what you want and I'll get the kettle on. | chatterbox |
| `dlg.sbAlchemist.who.1` | Odile Fernwhistle (sbAlchemist) | sbAlchemist | I set my mum's garden on fire with a daisy. Nobody could explain it, so I had to learn. | chatterbox |
| `dlg.sbAlchemist.herbs.say` | The hero (hero) | sbAlchemist | Where do I find herbs? | chatterbox |
| `dlg.sbAlchemist.herbs.1` | Odile Fernwhistle (sbAlchemist) | sbAlchemist | Out in the wild, everywhere you fight. Just walk over a plant and it's yours. | chatterbox |
| `dlg.sbAlchemist.herbs.2` | Odile Fernwhistle (sbAlchemist) | sbAlchemist | The rare ones are choosy. Moonbells open in the Whispering Woods; shadowthorn wants the dark places. | chatterbox |
| `dlg.sbAlchemist.elixirs.say` | The hero (hero) | sbAlchemist | What do the elixirs do? | chatterbox |
| `dlg.sbAlchemist.elixirs.1` | Odile Fernwhistle (sbAlchemist) | sbAlchemist | Each one makes you stronger in a fight for a full 5 minutes. Harder hits, tougher skin, quicker feet. | chatterbox |
| `dlg.sbAlchemist.elixirs.2` | Odile Fernwhistle (sbAlchemist) | sbAlchemist | They sit in your third flask. Tap the little arrow to swap which one you drink. | chatterbox |
| `dlg.sbAlchemist.brewBack.1` | Odile Fernwhistle (sbAlchemist) | sbAlchemist | Careful with those, they're still warm. Come back when your pouch is full! | chatterbox |
| `dlg.sbAlchemist.bye.1` | Odile Fernwhistle (sbAlchemist) | sbAlchemist | Bye now! If you see a purple flower, pick two. One for me. | chatterbox |
| `dlg.sbGambler.hello.1` | Madame Pell (sbGambler) | sbGambler | Step right up! Twelve cards, one hourglass, and a purse that could double! | chatterbox |
| `dlg.sbGambler.hello.2` | Madame Pell (sbGambler) | sbGambler | Madame Pell. I never forget a face. Let's see if you never forget a card. | chatterbox |
| `dlg.sbGambler.again.1` | Madame Pell (sbGambler) | sbGambler | Back for another round? The sand's been waiting for you. | chatterbox |
| `dlg.sbGambler.play.1` | Madame Pell (sbGambler) | sbGambler | Coins on the cloth, eyes on the cards. Ready? Turn the glass! | chatterbox |
| `dlg.sbGambler.rules.say` | The hero (hero) | sbGambler | How does it work? | chatterbox |
| `dlg.sbGambler.rules.1` | Madame Pell (sbGambler) | sbGambler | Turn two cards. A pair stays up. Find every pair before the sand runs out and I pay double. | chatterbox |
| `dlg.sbGambler.rules.2` | Madame Pell (sbGambler) | sbGambler | Win again and the glass gets quicker. Win five in a row and I'll hand you a legendary prize. | chatterbox |
| `dlg.sbGambler.who.1` | Madame Pell (sbGambler) | sbGambler | I ran away with the travelling circus at nine. It turned out to be very good at maths. | chatterbox |
| `dlg.sbGambler.prize.say` | The hero (hero) | sbGambler | Has anyone ever won the prize? | chatterbox |
| `dlg.sbGambler.prize.1` | Madame Pell (sbGambler) | sbGambler | A dwarf, once. Nobody has seen him blink since. | chatterbox |
| `dlg.sbGambler.playBack.1` | Madame Pell (sbGambler) | sbGambler | Win or lose, that was a good game. Come back when your eyes are rested. | chatterbox |
| `dlg.sbGambler.bye.1` | Madame Pell (sbGambler) | sbGambler | Off you go! Remember where you put your feet. | chatterbox |
| `dlg.sbCollector.hello.1` | Alder Vane (sbCollector) | sbCollector | Shut the door, there's a draught. The moths are after my tapestries. | chatterbox |
| `dlg.sbCollector.hello.2` | Alder Vane (sbCollector) | sbCollector | Alder Vane. Some call me the Collector. I buy rare things, and sell them to people I like. | chatterbox |
| `dlg.sbCollector.open.1` | Alder Vane (sbCollector) | sbCollector | My friend! Come in, come in. I've dusted something special for you. | chatterbox |
| `dlg.sbCollector.again.1` | Alder Vane (sbCollector) | sbCollector | You again. Still haven't done me that favour, I see. | chatterbox |
| `dlg.sbCollector.trade.1` | Alder Vane (sbCollector) | sbCollector | The cabinets are open. Only the best, and I remember every price. | chatterbox |
| `dlg.sbCollector.favor.say` | The hero (hero) | sbCollector | Do you sell anything? | chatterbox |
| `dlg.sbCollector.favor.1` | Alder Vane (sbCollector) | sbCollector | Not to strangers. But do me a favour and we'll be friends. | chatterbox |
| `dlg.sbCollector.favor.2` | Alder Vane (sbCollector) | sbCollector | Treants in the Whispering Woods guard the moonbells I need. Beat four of them and bring me two moonbells. | chatterbox |
| `dlg.sbCollector.waiting.say` | The hero (hero) | sbCollector | About that favour... | chatterbox |
| `dlg.sbCollector.waiting.1` | Alder Vane (sbCollector) | sbCollector | Four treants, two moonbells. The moonbells won't pick themselves, sadly. | chatterbox |
| `dlg.sbCollector.favorDone.say` | The hero (hero) | sbCollector | I brought your moonbells. | chatterbox |
| `dlg.sbCollector.favorDone.1` | Alder Vane (sbCollector) | sbCollector | Oh, they still smell of the woods! Wonderful. | chatterbox |
| `dlg.sbCollector.favorDone.2` | Alder Vane (sbCollector) | sbCollector | A deal's a deal. My cabinets are yours to look through, any time. | chatterbox |
| `dlg.sbCollector.who.1` | Alder Vane (sbCollector) | sbCollector | I've collected since I was six. First it was buttons. Now it's swords that hum. | chatterbox |
| `dlg.sbCollector.shopBack.1` | Alder Vane (sbCollector) | sbCollector | Treat that one kindly. It's older than both of us. | chatterbox |
| `dlg.sbCollector.bye.1` | Alder Vane (sbCollector) | sbCollector | Close the door behind you. Gently, the vases rattle. | chatterbox |
| `dlg.sbFence.hello.1` | Mirela Thorne (sbFence) | sbFence | You're staring. Either buy something or stop blocking my light. | chatterbox |
| `dlg.sbFence.hello.2` | Mirela Thorne (sbFence) | sbFence | Mirela Thorne. I find things people lose. Then I find them new owners. | chatterbox |
| `dlg.sbFence.open.1` | Mirela Thorne (sbFence) | sbFence | Ah, my favourite hero. I kept the good stuff under the cloth for you. | chatterbox |
| `dlg.sbFence.again.1` | Mirela Thorne (sbFence) | sbFence | Back? Remember what I asked. Then we can talk business. | chatterbox |
| `dlg.sbFence.trade.1` | Mirela Thorne (sbFence) | sbFence | Armour from all over. Don't ask where. It's all clean now, I promise. | chatterbox |
| `dlg.sbFence.favor.say` | The hero (hero) | sbFence | What's under the cloth? | chatterbox |
| `dlg.sbFence.favor.1` | Mirela Thorne (sbFence) | sbFence | Good armour. For friends. And friends do each other favours. | chatterbox |
| `dlg.sbFence.favor.2` | Mirela Thorne (sbFence) | sbFence | Bandits in the Oakhaven outskirts keep robbing my deliveries. Beat fifteen, then ask the trinket kid who sent them. | chatterbox |
| `dlg.sbFence.waiting.say` | The hero (hero) | sbFence | About those bandits... | chatterbox |
| `dlg.sbFence.waiting.1` | Mirela Thorne (sbFence) | sbFence | Fifteen bandits, then a word with the trinket kid. Off you go. | chatterbox |
| `dlg.sbFence.favorDone.say` | The hero (hero) | sbFence | The bandits are beaten, and I know who sent them. | chatterbox |
| `dlg.sbFence.favorDone.1` | Mirela Thorne (sbFence) | sbFence | So it was the gossip all along. Ha! I owe you one. | chatterbox |
| `dlg.sbFence.favorDone.2` | Mirela Thorne (sbFence) | sbFence | Lift the cloth whenever you like. Friends get first pick. | chatterbox |
| `dlg.sbFence.who.1` | Mirela Thorne (sbFence) | sbFence | I grew up on these river steps. Everything that floats past ends up with me sooner or later. | chatterbox |
| `dlg.sbFence.shopBack.1` | Mirela Thorne (sbFence) | sbFence | Wear it well. And if anyone asks, you bought it in Ironhold. | chatterbox |
| `dlg.sbFence.bye.1` | Mirela Thorne (sbFence) | sbFence | Mind your purse. Not everyone here is as honest as me. | chatterbox |
| `dlg.sbArmorer.hello.1` | Greta Ironvein (sbArmorer) | sbArmorer | Ha! Look at that dent. I hope you got your money back for that armour. | chatterbox |
| `dlg.sbArmorer.hello.2` | Greta Ironvein (sbArmorer) | sbArmorer | Greta Ironvein. I make armour that comes home with its owner. Every time, so far. | chatterbox |
| `dlg.sbArmorer.again.1` | Greta Ironvein (sbArmorer) | sbArmorer | You again! Still in one piece. My favourite kind of customer. | chatterbox |
| `dlg.sbArmorer.trade.1` | Greta Ironvein (sbArmorer) | sbArmorer | Go on, knock on it. Hard as you like. | chatterbox |
| `dlg.sbArmorer.ore.1` | Greta Ironvein (sbArmorer) | sbArmorer | Lovely ore. Show me what you will sell, I pay per nugget. | chatterbox |
| `dlg.sbArmorer.learnSmith.1` | Greta Ironvein (sbArmorer) | sbArmorer | Want to try the hammer yourself? I don't mind sharing the forge. | chatterbox |
| `dlg.sbArmorer.learnSmith.2` | Greta Ironvein (sbArmorer) | sbArmorer | Strike when it glows hottest. Three good strikes make a good piece. | chatterbox |
| `dlg.sbArmorer.forge.1` | Greta Ironvein (sbArmorer) | sbArmorer | Help yourself to the forge. Shout if anything catches fire. | chatterbox |
| `dlg.sbArmorer.who.1` | Greta Ironvein (sbArmorer) | sbArmorer | Mountain family. I came downriver for the trade and stayed for the fish. | chatterbox |
| `dlg.sbArmorer.steel.say` | The hero (hero) | sbArmorer | What makes good armour? | chatterbox |
| `dlg.sbArmorer.steel.1` | Greta Ironvein (sbArmorer) | sbArmorer | It's not how thick it is. It's where it bends. Good armour bends where you do. | chatterbox |
| `dlg.sbArmorer.steel.2` | Greta Ironvein (sbArmorer) | sbArmorer | Heavy plate wants Strength, mind. Wear it without and you'll waddle like a duck. | chatterbox |
| `dlg.sbArmorer.shopBack.1` | Greta Ironvein (sbArmorer) | sbArmorer | Wear it well. Bring me the dents, I like a good story. | chatterbox |
| `dlg.sbArmorer.forgeBack.1` | Greta Ironvein (sbArmorer) | sbArmorer | Look at that! You're a natural. | chatterbox |
| `dlg.sbArmorer.sellBack.1` | Greta Ironvein (sbArmorer) | sbArmorer | A pleasure. Silverbridge always pays a fair price. | chatterbox |
| `dlg.sbArmorer.bye.1` | Greta Ironvein (sbArmorer) | sbArmorer | Off you go. Don't get hit anywhere I haven't covered. | chatterbox |
| `dlg.sbWeapons.hello.1` | Corvin Ashby (sbWeapons) | sbWeapons | Ah, a customer with taste. I can always tell. It's in the way you walk in. | chatterbox |
| `dlg.sbWeapons.hello.2` | Corvin Ashby (sbWeapons) | sbWeapons | Corvin Ashby, of Ashby's Fine Blades. Yes, that Ashby. You've heard of me, surely. | chatterbox |
| `dlg.sbWeapons.again.1` | Corvin Ashby (sbWeapons) | sbWeapons | Back already? They always come back to Corvin. | chatterbox |
| `dlg.sbWeapons.trade.1` | Corvin Ashby (sbWeapons) | sbWeapons | Every blade polished by hand. My hand, in fact. Mind the reflection. | chatterbox |
| `dlg.sbWeapons.who.1` | Corvin Ashby (sbWeapons) | sbWeapons | The finest blade seller on the river. Ask anyone. Or just read my sign. | chatterbox |
| `dlg.sbWeapons.blades.say` | The hero (hero) | sbWeapons | How do I pick a good weapon? | chatterbox |
| `dlg.sbWeapons.blades.1` | Corvin Ashby (sbWeapons) | sbWeapons | Pick one that suits you. Quick hands want a light blade, strong arms a heavy one. | chatterbox |
| `dlg.sbWeapons.blades.2` | Corvin Ashby (sbWeapons) | sbWeapons | And it should look good. Nobody runs from a hero with an ugly sword. | chatterbox |
| `dlg.sbWeapons.shopBack.1` | Corvin Ashby (sbWeapons) | sbWeapons | A fine choice. Not quite as fine as my hair, but close. | chatterbox |
| `dlg.sbWeapons.bye.1` | Corvin Ashby (sbWeapons) | sbWeapons | Do tell people where you bought it. | chatterbox |
| `dlg.sbJeweler.hello.1` | Tam Marlow (sbJeweler) | sbJeweler | Psst! Over here! Rings, charms, lucky stones. Best stall on the bridge. | chatterbox |
| `dlg.sbJeweler.hello.2` | Tam Marlow (sbJeweler) | sbJeweler | Name's Tam Marlow. I'm small, but my prices are smaller. | chatterbox |
| `dlg.sbJeweler.again.1` | Tam Marlow (sbJeweler) | sbJeweler | My favourite customer! Don't tell the others I said that. | chatterbox |
| `dlg.sbJeweler.trade.1` | Tam Marlow (sbJeweler) | sbJeweler | All real. Mostly. Fine, that one's glass, but it's very nice glass. | chatterbox |
| `dlg.sbJeweler.who.1` | Tam Marlow (sbJeweler) | sbJeweler | Grew up on this bridge. I know every crack, every cat and every shortcut. | chatterbox |
| `dlg.sbJeweler.gossip.say` | The hero (hero) | sbJeweler | Heard any good gossip? | chatterbox |
| `dlg.sbJeweler.gossip.1` | Tam Marlow (sbJeweler) | sbJeweler | Professor Sprocket blew his eyebrows off again. Third time this month. | chatterbox |
| `dlg.sbJeweler.gossip.2` | Tam Marlow (sbJeweler) | sbJeweler | And the mayor knows about traders who don't hang out a sign. I'm working on it. | chatterbox |
| `dlg.sbJeweler.shopBack.1` | Tam Marlow (sbJeweler) | sbJeweler | Pleasure doing business! Tell your friends. Not the guards. | chatterbox |
| `dlg.sbJeweler.bye.1` | Tam Marlow (sbJeweler) | sbJeweler | See you around! I'll be right here. Probably. | chatterbox |
| `dlg.sbMasterAegis.hello.1` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | Ha! Another young one. Chin up, shoulders back. Shields work better with a smile. | chatterbox |
| `dlg.sbMasterAegis.hello.2` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | Dame Helga Stormshield. I held this bridge once. Now I teach others to hold their ground. | chatterbox |
| `dlg.sbMasterAegis.again.1` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | There you are! Shield up? Good. Smiling? Even better. | chatterbox |
| `dlg.sbMasterAegis.train.1` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | Feet wide. Lean in. When I push, you don't move. Ready? Hup! | chatterbox |
| `dlg.sbMasterAegis.class.say` | The hero (hero) | sbMasterAegis | What does an Aegis Knight really do? | chatterbox |
| `dlg.sbMasterAegis.class.1` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | You stand in front, so the others don't have to. Best job there is. | chatterbox |
| `dlg.sbMasterAegis.class.2` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | Strength to lift the shield. Endurance to keep it up until supper. | chatterbox |
| `dlg.sbMasterAegis.ready.strong.1` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | You're a proper wall now, dear. Take any lesson you like. | chatterbox |
| `dlg.sbMasterAegis.ready.able.1` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | Steady legs! You're ready for the next one. | chatterbox |
| `dlg.sbMasterAegis.ready.weak.1` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | Not yet. One good push and you'd topple. More Strength and Endurance, please. | chatterbox |
| `dlg.sbMasterAegis.bridge.say` | The hero (hero) | sbMasterAegis | You held this bridge? | chatterbox |
| `dlg.sbMasterAegis.bridge.1` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | Forty years ago, against river pirates. Six of us, one gate, a very long night. | chatterbox |
| `dlg.sbMasterAegis.bridge.2` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | We didn't win by hitting hardest. We won by not moving. Remember that. | chatterbox |
| `dlg.sbMasterAegis.trainBack.1` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | Good work! Now eat something. Shields are heavy. | chatterbox |
| `dlg.sbMasterAegis.bye.1` | Dame Helga Stormshield (sbMasterAegis) | sbMasterAegis | Chin up out there! | chatterbox |
| `dlg.sbMasterPyro.hello.1` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | Do come in. Mind the notes, and please don't sneeze near the brazier. | chatterbox |
| `dlg.sbMasterPyro.hello.2` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | Magister Ignatius Vale. I teach fire on a bridge. Plenty of water about, you see. | chatterbox |
| `dlg.sbMasterPyro.again.1` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | Punctual. Excellent. We'll begin where we stopped. | chatterbox |
| `dlg.sbMasterPyro.train.1` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | Observe. A small flame, held still. Big flames are easy. Small ones take skill. | chatterbox |
| `dlg.sbMasterPyro.class.say` | The hero (hero) | sbMasterPyro | What does a pyromancer really do? | chatterbox |
| `dlg.sbMasterPyro.class.1` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | Anyone can start a fire. A pyromancer decides where it goes, and where it stops. | chatterbox |
| `dlg.sbMasterPyro.class.2` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | It all comes from Intelligence. Later, Skill helps, when the fire needs a steady hand. | chatterbox |
| `dlg.sbMasterPyro.ready.strong.1` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | Your control is excellent. I've very little left to correct. Choose freely. | chatterbox |
| `dlg.sbMasterPyro.ready.able.1` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | Adequate. More than adequate, actually. You may have the next lesson. | chatterbox |
| `dlg.sbMasterPyro.ready.weak.1` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | Not yet. Your flame wobbles. A sharper mind, please. More Intelligence. | chatterbox |
| `dlg.sbMasterPyro.sprocket.say` | The hero (hero) | sbMasterPyro | What do you think of Professor Sprocket? | chatterbox |
| `dlg.sbMasterPyro.sprocket.1` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | Brilliant man. Loud, careless and brilliant. I keep a bucket by his door. | chatterbox |
| `dlg.sbMasterPyro.trainBack.1` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | Practise near water. I insist. | chatterbox |
| `dlg.sbMasterPyro.bye.1` | Magister Ignatius Vale (sbMasterPyro) | sbMasterPyro | Good day. Do keep your sleeves rolled up. | chatterbox |
| `dlg.sbMasterShadow.hello.1` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | Looking for me? I've been next to you since the fountain. You walked past me twice. | chatterbox |
| `dlg.sbMasterShadow.hello.2` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | Nyx Halloway. The best place to hide is a crowd, and this is the busiest bridge there is. | chatterbox |
| `dlg.sbMasterShadow.again.1` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | Hi again. I've been here a while. You noticed? No? Good. | chatterbox |
| `dlg.sbMasterShadow.train.1` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | Lesson one: walk like you belong. Nobody looks twice at someone who belongs. | chatterbox |
| `dlg.sbMasterShadow.class.say` | The hero (hero) | sbMasterShadow | What makes a good Shadowblade? | chatterbox |
| `dlg.sbMasterShadow.class.1` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | Never being where they're looking. Slip in, one quick strike, and blend back in. | chatterbox |
| `dlg.sbMasterShadow.class.2` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | Dexterity for quick feet and hands. Skill, so the strike counts. | chatterbox |
| `dlg.sbMasterShadow.ready.strong.1` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | You're properly sneaky now. Take what's left, you've earned it. | chatterbox |
| `dlg.sbMasterShadow.ready.able.1` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | Light on your feet! You're ready for the next trick. | chatterbox |
| `dlg.sbMasterShadow.ready.weak.1` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | Not yet. I can hear you coming from the fountain. More Dexterity. | chatterbox |
| `dlg.sbMasterShadow.past.say` | The hero (hero) | sbMasterShadow | How did you learn all this? | chatterbox |
| `dlg.sbMasterShadow.past.1` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | I used to pick pockets on this very bridge. I was good at it, too. | chatterbox |
| `dlg.sbMasterShadow.past.2` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | Then the mayor caught me and gave me a job, not a cell. Don't tell her I'm grateful. | chatterbox |
| `dlg.sbMasterShadow.trainBack.1` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | Now go and practise. Try not to let me catch you. | chatterbox |
| `dlg.sbMasterShadow.bye.1` | Nyx Halloway (sbMasterShadow) | sbMasterShadow | See you. Well, you won't see me. | chatterbox |
| `dlg.sbMasterSovereign.hello.1` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | Oh! Hello, hello. Do forgive me, I was chatting with my guards. Lovely listeners. | chatterbox |
| `dlg.sbMasterSovereign.hello.2` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | Percival Ashcombe. I could teach in a castle, but you only learn to lead where people are. | chatterbox |
| `dlg.sbMasterSovereign.again.1` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | My dear friend! Shall we carry on? Only if you'd like to, of course. | chatterbox |
| `dlg.sbMasterSovereign.train.1` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | Right then. A good order is clear, kind, and only given once. Like so. | chatterbox |
| `dlg.sbMasterSovereign.class.say` | The hero (hero) | sbMasterSovereign | What is a Grand Sovereign? | chatterbox |
| `dlg.sbMasterSovereign.class.1` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | A leader. Your guards come to your side and fight with you, not just for you. | chatterbox |
| `dlg.sbMasterSovereign.class.2` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | Charisma is everything. People follow those they like. And who remember their names. | chatterbox |
| `dlg.sbMasterSovereign.ready.strong.1` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | Splendid! People would follow you anywhere now. Take all the lessons. | chatterbox |
| `dlg.sbMasterSovereign.ready.able.1` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | Your guards would listen to you. You're ready for the next lesson. | chatterbox |
| `dlg.sbMasterSovereign.ready.weak.1` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | Not quite yet, I'm afraid. A little more Charisma, and they'll come. | chatterbox |
| `dlg.sbMasterSovereign.please.say` | The hero (hero) | sbMasterSovereign | Do you really say please to your guards? | chatterbox |
| `dlg.sbMasterSovereign.please.1` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | Always. Shouting gets you obeyed. Please gets you loyalty, and loyalty lasts longer. | chatterbox |
| `dlg.sbMasterSovereign.trainBack.1` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | Lovely work. Remember to thank them afterwards. | chatterbox |
| `dlg.sbMasterSovereign.bye.1` | Lord Percival Ashcombe (sbMasterSovereign) | sbMasterSovereign | Do take care, and give my regards to everyone. | chatterbox |
| `dlg.sbMasterGeo.hello.1` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | Mind the moss, dear, it's had a long week. Now, let's have a look at you. | chatterbox |
| `dlg.sbMasterGeo.hello.2` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | Grandmother Tova Deeproot. The river bed here is lovely stone, all the way down. | chatterbox |
| `dlg.sbMasterGeo.again.1` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | Back already? Sit, I've just made tea. Stone tea. It's mostly tea. | chatterbox |
| `dlg.sbMasterGeo.train.1` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | Hands flat on the ground. Not like that. Like you're patting a sleepy dog. | chatterbox |
| `dlg.sbMasterGeo.class.say` | The hero (hero) | sbMasterGeo | What does a Geomancer do? | chatterbox |
| `dlg.sbMasterGeo.class.1` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | We ask the ground for help. A wall when you need one, a spike when someone's rude. | chatterbox |
| `dlg.sbMasterGeo.class.2` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | Stone's like a garden. Strength to dig, Intelligence to know where to plant. | chatterbox |
| `dlg.sbMasterGeo.ready.strong.1` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | The ground likes you now. Learn whatever you please, dear. | chatterbox |
| `dlg.sbMasterGeo.ready.able.1` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | Good roots! You're ready for the next lesson. | chatterbox |
| `dlg.sbMasterGeo.ready.weak.1` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | Not yet, love. The stone won't budge for you. More Strength first. | chatterbox |
| `dlg.sbMasterGeo.garden.say` | The hero (hero) | sbMasterGeo | Is that a garden made of stone? | chatterbox |
| `dlg.sbMasterGeo.garden.1` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | Forty years of work. Every rock grown by hand. Well, by magic. Mostly by hand. | chatterbox |
| `dlg.sbMasterGeo.garden.2` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | Take a pebble on your way out. They make lovely doorstops. | chatterbox |
| `dlg.sbMasterGeo.trainBack.1` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | Lovely. Now go and dig something. Gently. | chatterbox |
| `dlg.sbMasterGeo.bye.1` | Grandmother Tova Deeproot (sbMasterGeo) | sbMasterGeo | Off you go. Wrap up warm, it's damp by the river. | chatterbox |
| `dlg.sbMasterAether.hello.1` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | Welcome, welcome! You're just in time for the demonstration. Cover your ears, please. | chatterbox |
| `dlg.sbMasterAether.hello.2` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | Professor Quint Sprocket. The river turns my wheels for free. Where else would I teach? | chatterbox |
| `dlg.sbMasterAether.again.1` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | Ah, my favourite pupil! Today's demonstration is extra loud. | chatterbox |
| `dlg.sbMasterAether.train.1` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | Observe the blackboard. Now forget the blackboard, and watch the machine. | chatterbox |
| `dlg.sbMasterAether.class.say` | The hero (hero) | sbMasterAether | What does an Aether-Tech actually do? | chatterbox |
| `dlg.sbMasterAether.class.1` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | We build our way out of trouble. A pistol, a turret, and a heat gauge to keep you honest. | chatterbox |
| `dlg.sbMasterAether.class.2` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | Skill for the aim, Intelligence for the clever bits. Ideally both. | chatterbox |
| `dlg.sbMasterAether.ready.strong.1` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | Marvellous! You could give my lectures. Please don't, though. Take the rest. | chatterbox |
| `dlg.sbMasterAether.ready.able.1` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | A steady hand! You're ready for the next machine. | chatterbox |
| `dlg.sbMasterAether.ready.weak.1` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | Not yet. Your aim drifts. More Skill, then we'll talk. | chatterbox |
| `dlg.sbMasterAether.eyebrows.say` | The hero (hero) | sbMasterAether | What happened to your eyebrows? | chatterbox |
| `dlg.sbMasterAether.eyebrows.1` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | A demonstration went slightly too well. They'll grow back. They always do. | chatterbox |
| `dlg.sbMasterAether.trainBack.1` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | Splendid. Now go and vent that heat. Outside, ideally. | chatterbox |
| `dlg.sbMasterAether.bye.1` | Professor Quint Sprocket (sbMasterAether) | sbMasterAether | Class dismissed! Do mind the steps. | chatterbox |
| `dlg.sbMasterChrono.hello.1` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | My old pupil, the Keeper of Hours, wrote that you'd come. At this very minute, in fact. | chatterbox |
| `dlg.sbMasterChrono.hello.2` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | Clockwarden Selwyn. I keep the bridge clock. A town this busy can't afford to be late. | chatterbox |
| `dlg.sbMasterChrono.again.1` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | Seven minutes after the hour. A good time to begin. | chatterbox |
| `dlg.sbMasterChrono.train.1` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | Count with me. One, two, and hold. Time stretches, if you hold it right. | chatterbox |
| `dlg.sbMasterChrono.class.say` | The hero (hero) | sbMasterChrono | What is a Chrono-Weaver? | chatterbox |
| `dlg.sbMasterChrono.class.1` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | We tidy up time. Slow a foe down, hurry a friend along, undo the odd mistake. | chatterbox |
| `dlg.sbMasterChrono.class.2` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | Intelligence to understand it. Skill to touch it without breaking anything. | chatterbox |
| `dlg.sbMasterChrono.ready.strong.1` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | Excellent timing. Take the rest of my lessons whenever it suits you. | chatterbox |
| `dlg.sbMasterChrono.ready.able.1` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | You're ready. The next lesson starts, oh, now. | chatterbox |
| `dlg.sbMasterChrono.ready.weak.1` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | Not yet. You're always a beat behind. More Intelligence, and more Skill. | chatterbox |
| `dlg.sbMasterChrono.keeper.say` | The hero (hero) | sbMasterChrono | How do you know the Keeper of Hours? | chatterbox |
| `dlg.sbMasterChrono.keeper.1` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | I taught him, years ago. A brilliant pupil. Always early or late, never on time. | chatterbox |
| `dlg.sbMasterChrono.trainBack.1` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | Practise every day. Same time each day, if you please. | chatterbox |
| `dlg.sbMasterChrono.bye.1` | Clockwarden Selwyn (sbMasterChrono) | sbMasterChrono | Off you go. Don't be late. | chatterbox |
| `dlg.sbMasterBlood.hello.1` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | Doctor Sangrel wrote to me about you. He says you didn't faint. High praise, from him. | chatterbox |
| `dlg.sbMasterBlood.hello.2` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | Vesper Crimsonleaf. Every herb in the world floats past this bridge. I'm spoiled here. | chatterbox |
| `dlg.sbMasterBlood.again.1` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | Welcome back. You look lively today. I can always tell. | chatterbox |
| `dlg.sbMasterBlood.train.1` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | Breathe in. Feel your strength? Now spend a little of it. Wisely. | chatterbox |
| `dlg.sbMasterBlood.class.say` | The hero (hero) | sbMasterBlood | What is a Blood Alchemist, really? | chatterbox |
| `dlg.sbMasterBlood.class.1` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | We spend our own life force for power, then take it back from our foes. | chatterbox |
| `dlg.sbMasterBlood.class.2` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | Endurance is your purse. Intelligence decides how well you spend it. | chatterbox |
| `dlg.sbMasterBlood.ready.strong.1` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | Such vitality! You're ready for nearly everything I know. | chatterbox |
| `dlg.sbMasterBlood.ready.able.1` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | Your essence runs strong. On to the next lesson. | chatterbox |
| `dlg.sbMasterBlood.ready.weak.1` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | Not yet. You'd tire after one spell. Build up your Endurance first. | chatterbox |
| `dlg.sbMasterBlood.herbs.say` | The hero (hero) | sbMasterBlood | What are all these herbs for? | chatterbox |
| `dlg.sbMasterBlood.herbs.1` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | Tonics, mostly. A little essence, a lot of mint. Mint makes everything better. | chatterbox |
| `dlg.sbMasterBlood.herbs.2` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | If you find rare plants out there, do bring them by. I'd love a look. | chatterbox |
| `dlg.sbMasterBlood.trainBack.1` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | Rest after practice. Essence comes back, but it likes a nap. | chatterbox |
| `dlg.sbMasterBlood.bye.1` | Vesper Crimsonleaf (sbMasterBlood) | sbMasterBlood | Look after yourself. Drink water. Eat something green. | chatterbox |
| `dlg.sbMasterWindrunner.hello.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Oh, hi! Sorry, can't stop. I'm waiting for the wind to turn. Any minute now. | chatterbox |
| `dlg.sbMasterWindrunner.hello.2` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Sefa Galewing. I shoot arrows and chase the wind. The wind usually wins. | chatterbox |
| `dlg.sbMasterWindrunner.open.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | There's my runner! Ready? Course you are. Let's go, let's go! | chatterbox |
| `dlg.sbMasterWindrunner.again.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Hi again! I'm still here. Well, mostly. My feet keep wandering off. | chatterbox |
| `dlg.sbMasterWindrunner.train.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Feel the wind on your cheek? Aim a little left of where you think. Now let go! | chatterbox |
| `dlg.sbMasterWindrunner.favor.say` | The hero (hero) | sbMasterWindrunner | Do you teach archery? | chatterbox |
| `dlg.sbMasterWindrunner.favor.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Only to people who can keep up. Can you keep up? Let's find out. | chatterbox |
| `dlg.sbMasterWindrunner.favor.2` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Beat eight bandit archers in the Oakhaven Outskirts, then bring me two swiftferns. | chatterbox |
| `dlg.sbMasterWindrunner.waiting.say` | The hero (hero) | sbMasterWindrunner | About your test... | chatterbox |
| `dlg.sbMasterWindrunner.waiting.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Eight bandit archers, two swiftferns. Go on! I'll be right here. Bouncing. | chatterbox |
| `dlg.sbMasterWindrunner.favorDone.say` | The hero (hero) | sbMasterWindrunner | The archers are beaten, and here are your swiftferns. | chatterbox |
| `dlg.sbMasterWindrunner.favorDone.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Ha! You actually kept up! Nobody keeps up! | chatterbox |
| `dlg.sbMasterWindrunner.favorDone.2` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Right, you're my pupil now. One rule: no sitting down in my lessons. | chatterbox |
| `dlg.sbMasterWindrunner.class.say` | The hero (hero) | sbMasterWindrunner | What does a Windrunner do? | chatterbox |
| `dlg.sbMasterWindrunner.class.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Shoot, run, shoot again. If they catch you, you stood still too long. | chatterbox |
| `dlg.sbMasterWindrunner.class.2` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Dexterity for quick feet and a quick bow. Skill, so every arrow lands. | chatterbox |
| `dlg.sbMasterWindrunner.ready.strong.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | You're as quick as the wind now. Well, nearly. Take any lesson you like! | chatterbox |
| `dlg.sbMasterWindrunner.ready.able.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Light feet! You're ready for the next one. Go, go! | chatterbox |
| `dlg.sbMasterWindrunner.ready.weak.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Not yet. You run like you're carrying a sofa. More Dexterity, please. | chatterbox |
| `dlg.sbMasterWindrunner.who.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | I live up in the old windmill by the river. Best view of the wind in town. | chatterbox |
| `dlg.sbMasterWindrunner.who.2` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Two hundred stairs to the top. Great practice. I've counted every one. | chatterbox |
| `dlg.sbMasterWindrunner.trainBack.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | Good! Now run home. Don't walk. Running counts as practice. | chatterbox |
| `dlg.sbMasterWindrunner.bye.1` | Sefa Galewing (sbMasterWindrunner) | sbMasterWindrunner | See you! Watch out for low branches. I never do. | chatterbox |
| `dlg.sbMasterFrostwarden.hello.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Hm. You walked past me three times. Lost, or curious? | chatterbox |
| `dlg.sbMasterFrostwarden.hello.2` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Halvard Rimeheart. I came south from the snow. It is warm here. Too warm. | chatterbox |
| `dlg.sbMasterFrostwarden.open.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Pupil. Good. The ice is ready, and so am I. | chatterbox |
| `dlg.sbMasterFrostwarden.again.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | You again. Good. I do not talk much. Stay anyway. | chatterbox |
| `dlg.sbMasterFrostwarden.train.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Breathe out slowly. See the mist? Now put it into the blade. | chatterbox |
| `dlg.sbMasterFrostwarden.favor.say` | The hero (hero) | sbMasterFrostwarden | Is that sword made of ice? | chatterbox |
| `dlg.sbMasterFrostwarden.favor.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | It is. I teach it only to those who keep a cool head in a hot place. | chatterbox |
| `dlg.sbMasterFrostwarden.favor.2` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Put out seven fire elementals in the Ashen Crags. Then bring me two sprigs of frostmint. | chatterbox |
| `dlg.sbMasterFrostwarden.waiting.say` | The hero (hero) | sbMasterFrostwarden | About your test... | chatterbox |
| `dlg.sbMasterFrostwarden.waiting.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Seven fire elementals. Two sprigs of frostmint. Take your time. Not too much time. | chatterbox |
| `dlg.sbMasterFrostwarden.favorDone.say` | The hero (hero) | sbMasterFrostwarden | The fire elementals are out. Here is your frostmint. | chatterbox |
| `dlg.sbMasterFrostwarden.favorDone.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Hm. Not even singed. Good. | chatterbox |
| `dlg.sbMasterFrostwarden.favorDone.2` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | You kept a cool head. That was the first lesson. I will teach you the rest. | chatterbox |
| `dlg.sbMasterFrostwarden.class.say` | The hero (hero) | sbMasterFrostwarden | What is a Frostwarden? | chatterbox |
| `dlg.sbMasterFrostwarden.class.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | A knight of the cold. Chill them, freeze them, then break the ice. | chatterbox |
| `dlg.sbMasterFrostwarden.class.2` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Strength for the blade. Intelligence for the frost. You need both. | chatterbox |
| `dlg.sbMasterFrostwarden.ready.strong.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | You are as cold as the north now. Take any lesson. | chatterbox |
| `dlg.sbMasterFrostwarden.ready.able.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Good. Steady. The next lesson is yours. | chatterbox |
| `dlg.sbMasterFrostwarden.ready.weak.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Not yet. Your frost melts too fast. More Intelligence, and more Strength. | chatterbox |
| `dlg.sbMasterFrostwarden.who.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | I guarded a mountain pass in the north. Then I wanted to see a river that does not freeze. | chatterbox |
| `dlg.sbMasterFrostwarden.trainBack.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Good. Now rest. Ice does not hurry. Neither should you. | chatterbox |
| `dlg.sbMasterFrostwarden.bye.1` | Halvard Rimeheart (sbMasterFrostwarden) | sbMasterFrostwarden | Go well. Stay cool. | chatterbox |
| `dlg.sbMasterLightbringer.hello.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Mm-hm-hmm... Oh! Sorry, dear, I was humming. Did I hum at you? I do that. | chatterbox |
| `dlg.sbMasterLightbringer.hello.2` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Sister Auriel Dawnmere. I keep the little lamp at the end of the bridge burning. | chatterbox |
| `dlg.sbMasterLightbringer.open.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | There's my bright one! Come and stand in the light a moment. You've earned it. | chatterbox |
| `dlg.sbMasterLightbringer.again.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Hello again! Still here, still humming. The lamp likes the company. | chatterbox |
| `dlg.sbMasterLightbringer.train.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Hands open, chin up. Think of the best morning you ever had. There. Feel that? | chatterbox |
| `dlg.sbMasterLightbringer.favor.say` | The hero (hero) | sbMasterLightbringer | Is that lamp magic? | chatterbox |
| `dlg.sbMasterLightbringer.favor.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Everyone has a little light inside. I teach people to let it out, when they're ready. | chatterbox |
| `dlg.sbMasterLightbringer.favor.2` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Beat seven cultists in the Ashen Crags, then bring me three sunpetals for my lamp. | chatterbox |
| `dlg.sbMasterLightbringer.waiting.say` | The hero (hero) | sbMasterLightbringer | About your test... | chatterbox |
| `dlg.sbMasterLightbringer.waiting.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Seven cultists, three sunpetals. Beat them gently. Everyone deserves a second chance. | chatterbox |
| `dlg.sbMasterLightbringer.favorDone.say` | The hero (hero) | sbMasterLightbringer | The cultists are beaten. Here are your sunpetals. | chatterbox |
| `dlg.sbMasterLightbringer.favorDone.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Oh, look at them! The lamp will glow golden for a month. | chatterbox |
| `dlg.sbMasterLightbringer.favorDone.2` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | And so will you, dear. I'd be glad to teach you. | chatterbox |
| `dlg.sbMasterLightbringer.class.say` | The hero (hero) | sbMasterLightbringer | What does a Lightbringer do? | chatterbox |
| `dlg.sbMasterLightbringer.class.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | We carry the dawn. Light to fight with, light to heal with, light to hide behind. | chatterbox |
| `dlg.sbMasterLightbringer.class.2` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Intelligence makes the light strong. Charisma makes it warm. You'll want both. | chatterbox |
| `dlg.sbMasterLightbringer.ready.strong.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | You shine like a sunrise, dear. Take any lesson you like. | chatterbox |
| `dlg.sbMasterLightbringer.ready.able.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Glowing nicely! You're ready for the next one. | chatterbox |
| `dlg.sbMasterLightbringer.ready.weak.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Not yet, dear. Your light's a bit dim. More Charisma, and you'll glow. | chatterbox |
| `dlg.sbMasterLightbringer.who.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | I sang in a big temple once. But my lamp out here guides the boats home. That's better. | chatterbox |
| `dlg.sbMasterLightbringer.trainBack.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Lovely. Now go and brighten someone's day. Sister's orders. | chatterbox |
| `dlg.sbMasterLightbringer.bye.1` | Sister Auriel Dawnmere (sbMasterLightbringer) | sbMasterLightbringer | Off you go, dear. And smile at the dark corners. They hate that. | chatterbox |
| `dlg.sbMasterBeastcaller.hello.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Watch your feet. That's Bramble. She was here first. | chatterbox |
| `dlg.sbMasterBeastcaller.hello.2` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Rowan Thistlefoot. I like animals. People, I'm still deciding. | chatterbox |
| `dlg.sbMasterBeastcaller.open.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Oh, it's you. Bramble's been waiting. So have I. A bit. | chatterbox |
| `dlg.sbMasterBeastcaller.again.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | You again. Bramble likes you. I'm still thinking about it. | chatterbox |
| `dlg.sbMasterBeastcaller.train.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Crouch down. Slower. Hold out your hand and let them come to you. Good. | chatterbox |
| `dlg.sbMasterBeastcaller.favor.say` | The hero (hero) | sbMasterBeastcaller | Can you talk to animals? | chatterbox |
| `dlg.sbMasterBeastcaller.favor.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Talk? I listen. That's the trick most people never learn. | chatterbox |
| `dlg.sbMasterBeastcaller.favor.2` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Giant spiders are webbing up the animal trails in the Whispering Woods. Clear eight. | chatterbox |
| `dlg.sbMasterBeastcaller.favor.3` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Then bring me two moonbells for my den. Bramble sleeps better near them. | chatterbox |
| `dlg.sbMasterBeastcaller.waiting.say` | The hero (hero) | sbMasterBeastcaller | About your test... | chatterbox |
| `dlg.sbMasterBeastcaller.waiting.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Eight spiders, two moonbells. The animals are waiting. So is Bramble. | chatterbox |
| `dlg.sbMasterBeastcaller.favorDone.say` | The hero (hero) | sbMasterBeastcaller | The trails are clear, and here are your moonbells. | chatterbox |
| `dlg.sbMasterBeastcaller.favorDone.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Hm. The deer came down to the river this morning. Thought it might be you. | chatterbox |
| `dlg.sbMasterBeastcaller.favorDone.2` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Fine. I'll teach you. Don't make a fuss. Bramble, stop wagging. | chatterbox |
| `dlg.sbMasterBeastcaller.class.say` | The hero (hero) | sbMasterBeastcaller | What do you teach, exactly? | chatterbox |
| `dlg.sbMasterBeastcaller.class.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | You call the wild, and the wild comes. Wolves, a hawk, a bear. Friends, not pets. | chatterbox |
| `dlg.sbMasterBeastcaller.class.2` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Charisma, so they want to come. Endurance, so you can keep up with them. | chatterbox |
| `dlg.sbMasterBeastcaller.ready.strong.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | The whole pack trusts you now. Take what you like. | chatterbox |
| `dlg.sbMasterBeastcaller.ready.able.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | The wolves like you. You're ready for the next one. | chatterbox |
| `dlg.sbMasterBeastcaller.ready.weak.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Not yet. They don't trust you. More Charisma, and a lot more patience. | chatterbox |
| `dlg.sbMasterBeastcaller.who.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Found Bramble in a trap years ago. Three legs, all attitude. We've been a pair since. | chatterbox |
| `dlg.sbMasterBeastcaller.who.2` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | I sleep in the stable hayloft. Horses snore less than people. | chatterbox |
| `dlg.sbMasterBeastcaller.trainBack.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Good. Go on, then. And say hello to the crows. They remember. | chatterbox |
| `dlg.sbMasterBeastcaller.bye.1` | Old Rowan Thistlefoot (sbMasterBeastcaller) | sbMasterBeastcaller | Off you go. Bramble says bye. | chatterbox |
| `dlg.sbMasterElementalist.hello.1` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | Hi! One sec, I'm juggling. Fire, frost, spark, stone and... caught them! Hello! | chatterbox |
| `dlg.sbMasterElementalist.hello.2` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | Magistra Iris Fourwinds. I teach all four elements. Mixing them is the fun part. | chatterbox |
| `dlg.sbMasterElementalist.again.1` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | Back again! Good, I needed someone to watch. Watch this. Ta-da! | chatterbox |
| `dlg.sbMasterElementalist.train.1` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | Pick two orbs. Any two. Now let them bump. Gently! See? A reaction! | chatterbox |
| `dlg.sbMasterElementalist.class.say` | The hero (hero) | sbMasterElementalist | What does an Elementalist do? | chatterbox |
| `dlg.sbMasterElementalist.class.1` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | We mix! Frost then fire, it melts. Fire then lightning, boom. Every pair does something. | chatterbox |
| `dlg.sbMasterElementalist.class.2` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | Intelligence for every spell. Skill, because the good ones need quick hands. | chatterbox |
| `dlg.sbMasterElementalist.ready.strong.1` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | You mix like a master now! Take any lesson. Take two! | chatterbox |
| `dlg.sbMasterElementalist.ready.able.1` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | Ooh, nice spark! You're ready for the next one. | chatterbox |
| `dlg.sbMasterElementalist.ready.weak.1` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | Not yet! Your elements keep fizzling out. More Intelligence, please. | chatterbox |
| `dlg.sbMasterElementalist.sleeve.say` | The hero (hero) | sbMasterElementalist | Um, your sleeve is on fire. | chatterbox |
| `dlg.sbMasterElementalist.sleeve.1` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | Oh! So it is. Hold on... There. | chatterbox |
| `dlg.sbMasterElementalist.sleeve.2` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | Fire, then frost. That was a lesson, actually. You're welcome! | chatterbox |
| `dlg.sbMasterElementalist.trainBack.1` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | Brilliant! Now practise outside, please. The curtains are new. | chatterbox |
| `dlg.sbMasterElementalist.bye.1` | Magistra Iris Fourwinds (sbMasterElementalist) | sbMasterElementalist | Bye! If you smell smoke, it's probably me. Don't worry! | chatterbox |
| `dlg.sbMasterSoulwarden.hello.1` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | Shh, it's all right, they're friendly. Oh, not you. I was talking to the wisps. | chatterbox |
| `dlg.sbMasterSoulwarden.hello.2` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | Warden Odalys Lanternlight. I help lost spirits find their way home. | chatterbox |
| `dlg.sbMasterSoulwarden.again.1` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | Hello again. The wisps remember you. That one's waving. | chatterbox |
| `dlg.sbMasterSoulwarden.train.1` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | Hold the lantern low and speak softly. Lost things come to a kind voice. | chatterbox |
| `dlg.sbMasterSoulwarden.class.say` | The hero (hero) | sbMasterSoulwarden | What does a Soul Warden do? | chatterbox |
| `dlg.sbMasterSoulwarden.class.1` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | When a foe is beaten, its spirit gets a bit lost. We help it, and it helps us back. | chatterbox |
| `dlg.sbMasterSoulwarden.class.2` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | Intelligence to guide the light. Charisma, so the spirits want to stay a while. | chatterbox |
| `dlg.sbMasterSoulwarden.ready.strong.1` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | Even the shyest spirits come to you now. Take any lesson. | chatterbox |
| `dlg.sbMasterSoulwarden.ready.able.1` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | The wisps trust you. You're ready for the next lesson. | chatterbox |
| `dlg.sbMasterSoulwarden.ready.weak.1` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | Not yet. They're still shy of you. More Intelligence, and a little Charisma. | chatterbox |
| `dlg.sbMasterSoulwarden.wisps.say` | The hero (hero) | sbMasterSoulwarden | Are the little lights in your lantern alive? | chatterbox |
| `dlg.sbMasterSoulwarden.wisps.1` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | Sort of! They're spirits who wandered off. This one's Fidget. He likes the warm side. | chatterbox |
| `dlg.sbMasterSoulwarden.wisps.2` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | No spirit is ever bad, you know. Only lost. They go home when they're ready. | chatterbox |
| `dlg.sbMasterSoulwarden.trainBack.1` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | Well done. Now let them go gently. They've had a long day. | chatterbox |
| `dlg.sbMasterSoulwarden.bye.1` | Warden Odalys Lanternlight (sbMasterSoulwarden) | sbMasterSoulwarden | Take care. And if you see a lost little light, say hello. | chatterbox |
| `dlg.sbMasterIronmonk.hello.1` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | Sit. Breathe. No, you're breathing like you're late for something. Again. | chatterbox |
| `dlg.sbMasterIronmonk.hello.2` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | Master Oru Stillwater. I teach the open hand. Iron fists, calm heart. | chatterbox |
| `dlg.sbMasterIronmonk.again.1` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | Ah. The pupil returns. So does the river. Every day. | chatterbox |
| `dlg.sbMasterIronmonk.train.1` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | Feet like roots, hands like rain. Strike. Again. The hundredth one counts. | chatterbox |
| `dlg.sbMasterIronmonk.class.say` | The hero (hero) | sbMasterIronmonk | What is an Iron Monk? | chatterbox |
| `dlg.sbMasterIronmonk.class.1` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | No blade. Hands, feet, breath. Each blow builds the next, until the big one. | chatterbox |
| `dlg.sbMasterIronmonk.class.2` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | Dexterity for quick hands. Endurance to stay calm while others run out of breath. | chatterbox |
| `dlg.sbMasterIronmonk.ready.strong.1` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | The pupil becomes the teacher. Don't tell anyone. Take any lesson. | chatterbox |
| `dlg.sbMasterIronmonk.ready.able.1` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | Good. The cup is filling. Take the next lesson. | chatterbox |
| `dlg.sbMasterIronmonk.ready.weak.1` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | Not yet. A tree with short roots falls in the wind. More Endurance. | chatterbox |
| `dlg.sbMasterIronmonk.noodles.say` | The hero (hero) | sbMasterIronmonk | Is that a bowl of noodles? | chatterbox |
| `dlg.sbMasterIronmonk.noodles.1` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | It is. The broth simmered for two days. Please do not breathe on it. | chatterbox |
| `dlg.sbMasterIronmonk.noodles.2` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | A good bowl teaches patience. A great bowl teaches everything else. | chatterbox |
| `dlg.sbMasterIronmonk.trainBack.1` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | Good. Now eat something warm. Strength comes from the bowl. | chatterbox |
| `dlg.sbMasterIronmonk.bye.1` | Master Oru Stillwater (sbMasterIronmonk) | sbMasterIronmonk | Go well. Walk softly. Kick hard. | chatterbox |
| `dlg.sbMasterBard.hello.1` | Lark Merriweather (sbMasterBard) | sbMasterBard | Welcome, welcome, come in from the cold! Oh dear, that rhymed. It does that. | chatterbox |
| `dlg.sbMasterBard.hello.2` | Lark Merriweather (sbMasterBard) | sbMasterBard | Lark Merriweather. I play by the fire and teach the lute to anyone who'll listen. | chatterbox |
| `dlg.sbMasterBard.again.1` | Lark Merriweather (sbMasterBard) | sbMasterBard | My favourite listener! Pull up a stool. Mind the cat, she's the critic. | chatterbox |
| `dlg.sbMasterBard.train.1` | Lark Merriweather (sbMasterBard) | sbMasterBard | Strum with me. One, two, and three... Don't watch your fingers. Feel it! | chatterbox |
| `dlg.sbMasterBard.class.say` | The hero (hero) | sbMasterBard | What does a Bard do? | chatterbox |
| `dlg.sbMasterBard.class.1` | Lark Merriweather (sbMasterBard) | sbMasterBard | Songs that make your side braver, tunes that put the other side to sleep. | chatterbox |
| `dlg.sbMasterBard.class.2` | Lark Merriweather (sbMasterBard) | sbMasterBard | Charisma to win the crowd. Skill, so your fingers keep up with your heart. | chatterbox |
| `dlg.sbMasterBard.ready.strong.1` | Lark Merriweather (sbMasterBard) | sbMasterBard | You'd fill any tavern now! Take every song I've got. | chatterbox |
| `dlg.sbMasterBard.ready.able.1` | Lark Merriweather (sbMasterBard) | sbMasterBard | Lovely tune! You're ready for the next verse. | chatterbox |
| `dlg.sbMasterBard.ready.weak.1` | Lark Merriweather (sbMasterBard) | sbMasterBard | Not yet. The crowd's still yawning. More Charisma, my friend. | chatterbox |
| `dlg.sbMasterBard.story.say` | The hero (hero) | sbMasterBard | Will you tell me a story? | chatterbox |
| `dlg.sbMasterBard.story.1` | Lark Merriweather (sbMasterBard) | sbMasterBard | Once, a knight crossed this very bridge with nothing but a sword and a song... | chatterbox |
| `dlg.sbMasterBard.story.2` | Lark Merriweather (sbMasterBard) | sbMasterBard | Hold on, it's better with music. La-la-la, the knight went... Where was I? | chatterbox |
| `dlg.sbMasterBard.story.3` | Lark Merriweather (sbMasterBard) | sbMasterBard | Oh, never mind. Nice song, though, wasn't it? | chatterbox |
| `dlg.sbMasterBard.trainBack.1` | Lark Merriweather (sbMasterBard) | sbMasterBard | Bravo! Practise every day. Even when it sounds terrible. Especially then. | chatterbox |
| `dlg.sbMasterBard.bye.1` | Lark Merriweather (sbMasterBard) | sbMasterBard | Farewell, and fare thee well! Oops. Rhymed again. Bye! | chatterbox |
| `dlg.quest.goblinKing.ask.1` | The Goblin King (goblinKing) | quest.goblinKing | Stop. Please. I yield. | chatterbox |
| `dlg.quest.goblinKing.ask.2` | The Goblin King (goblinKing) | quest.goblinKing | My people raid because they are hungry. That is the truth. | chatterbox |
| `dlg.quest.goblinKing.ask.3` | The Goblin King (goblinKing) | quest.goblinKing | Let us make a deal instead. Your kind and mine. | chatterbox |
| `dlg.quest.goblinKing.slay.say` | The hero (hero) | quest.goblinKing | No deals. Your raids end here. | chatterbox |
| `dlg.quest.goblinKing.slay.1` | The hero, telling the story (hero) | quest.goblinKing | The Goblin King falls, and the Hollows empty. | chatterbox |
| `dlg.quest.goblinKing.slay.2` | The hero, telling the story (hero) | quest.goblinKing | Sunford sleeps easier, and the Iron Order hears your name. | chatterbox |
| `dlg.quest.goblinKing.pact.say` | The hero (hero) | quest.goblinKing | Stop the raids and trade with Sunford instead. Swear to it. | chatterbox |
| `dlg.quest.goblinKing.pact.1` | The Goblin King (goblinKing) | quest.goblinKing | Trade. Yes. I swear it, on my crown. | chatterbox |
| `dlg.quest.goblinKing.pact.2` | The hero, telling the story (hero) | quest.goblinKing | Goblin traders set up in Sunford's square, selling things no smith there could make. | chatterbox |
| `dlg.quest.goblinKing.ransom.say` | The hero (hero) | quest.goblinKing | Give me your treasure and you can keep your crown. | chatterbox |
| `dlg.quest.goblinKing.ransom.1` | The Goblin King (goblinKing) | quest.goblinKing | All of it? ...Fine. Take it, and go. | chatterbox |
| `dlg.quest.goblinKing.ransom.2` | The hero, telling the story (hero) | quest.goblinKing | You leave with goblin gold. The raids will start again, but the Syndicate approves. | chatterbox |
| `dlg.quest.siege.ask.1` | Warlord Krag (warlord) | quest.siege | Enough. You fight well, I'll give you that. | chatterbox |
| `dlg.quest.siege.ask.2` | Warlord Krag (warlord) | quest.siege | The Syndicate pays far better than that town ever will. | chatterbox |
| `dlg.quest.siege.ask.3` | Warlord Krag (warlord) | quest.siege | Open the gate for us tonight, and a third of Oakhaven is yours. | chatterbox |
| `dlg.quest.siege.defend.say` | The hero (hero) | quest.siege | The gate stays shut. Take your army and go. | chatterbox |
| `dlg.quest.siege.defend.1` | Warlord Krag (warlord) | quest.siege | Then the Syndicate will hunt you on every road. Remember I offered. | chatterbox |
| `dlg.quest.siege.defend.2` | The hero, telling the story (hero) | quest.siege | The gate holds. Oakhaven grows rich behind it, and its armourers remember your name. | chatterbox |
| `dlg.quest.siege.betray.say` | The hero (hero) | quest.siege | A third of the town. All right. The gate opens tonight. | chatterbox |
| `dlg.quest.siege.betray.1` | Warlord Krag (warlord) | quest.siege | Sensible. Madam Ash will be pleased to hear it. | chatterbox |
| `dlg.quest.siege.betray.2` | The hero, telling the story (hero) | quest.siege | Oakhaven burns. In the ruins, a black market opens, and an alchemist teaches in secret. | chatterbox |
| `dlg.quest.siege.betray.3` | The hero, telling the story (hero) | quest.siege | The armourers are gone, and the Iron Order calls you a traitor. | chatterbox |
| `dlg.quest.core.ask.1` | Forgemaster Dorn (forgemaster) | quest.core | The Colossus is scrap. I never thought I'd live to see it. | chatterbox |
| `dlg.quest.core.ask.2` | Forgemaster Dorn (forgemaster) | quest.core | And there's the core. Still humming. It's warm, if you touch it. | chatterbox |
| `dlg.quest.core.ask.3` | Forgemaster Dorn (forgemaster) | quest.core | You got here first. So... what happens to it? | chatterbox |
| `dlg.quest.core.destroy.say` | The hero (hero) | quest.core | Stand back. I'm going to break it. | chatterbox |
| `dlg.quest.core.destroy.1` | The hero, telling the story (hero) | quest.core | The light goes out, and the golems drop where they stand. | chatterbox |
| `dlg.quest.core.destroy.2` | The hero, telling the story (hero) | quest.core | In thanks, the Iron Order sends its own armourers to Ironhold. | chatterbox |
| `dlg.quest.core.study.say` | The hero (hero) | quest.core | The Circle should study it. I think I can carry it out safely. | chatterbox |
| `dlg.quest.core.study.1` | The hero, telling the story (hero) | quest.core | You know enough to move the core without waking it. | chatterbox |
| `dlg.quest.core.study.2` | The hero, telling the story (hero) | quest.core | Within a season, Ironhold's forges are making aether-works no one has seen before. | chatterbox |
| `dlg.quest.core.sell.say` | The hero (hero) | quest.core | The Syndicate made the best offer. | chatterbox |
| `dlg.quest.core.sell.1` | Forgemaster Dorn (forgemaster) | quest.core | Gold. For the thing that killed my miners. Take it and go. | chatterbox |
| `dlg.quest.core.sell.2` | The hero, telling the story (hero) | quest.core | A fortune changes hands. The core stays lit, and the mines will never be quiet again. | chatterbox |
| `dlg.quest.oracle.ask.1` | The Drowned Oracle (oracle) | quest.oracle | I've seen this moment more times than I can count. | chatterbox |
| `dlg.quest.oracle.ask.2` | The Drowned Oracle (oracle) | quest.oracle | In half of them, you set me free. In the other half, you take what I guard. | chatterbox |
| `dlg.quest.oracle.ask.3` | The Drowned Oracle (oracle) | quest.oracle | Choose. I'd like, just once, not to know what comes next. | chatterbox |
| `dlg.quest.oracle.free.say` | The hero (hero) | quest.oracle | Hold still. I'm breaking your chains. | chatterbox |
| `dlg.quest.oracle.free.1` | The Drowned Oracle (oracle) | quest.oracle | Oh. I didn't see that. I really didn't see that. | chatterbox |
| `dlg.quest.oracle.free.2` | The hero, telling the story (hero) | quest.oracle | The oracle rises through the water and is gone. Her pupil stays behind to teach. | chatterbox |
| `dlg.quest.oracle.slay.say` | The hero (hero) | quest.oracle | I came for the hourglass. | chatterbox |
| `dlg.quest.oracle.slay.1` | The Drowned Oracle (oracle) | quest.oracle | Yes. This is the other half. | chatterbox |
| `dlg.quest.oracle.slay.2` | The hero, telling the story (hero) | quest.oracle | She doesn't resist. The Timekeeper's Hourglass is yours. | chatterbox |
| `dlg.quest.oracle.slay.3` | The hero, telling the story (hero) | quest.oracle | Her last pupil flees the temple, and the Circle won't forgive you. | chatterbox |
| `dlg.quest.dragon.ask.1` | The Void Dragon (dragon) | quest.dragon | Enough. You have teeth, little one. | chatterbox |
| `dlg.quest.dragon.ask.2` | The Void Dragon (dragon) | quest.dragon | The demon in the fortress chained my kin. I want to see him burn. | chatterbox |
| `dlg.quest.dragon.ask.3` | The Void Dragon (dragon) | quest.dragon | Kill me, or let me help you do it. | chatterbox |
| `dlg.quest.dragon.slay.say` | The hero (hero) | quest.dragon | I don't bargain with dragons. | chatterbox |
| `dlg.quest.dragon.slay.1` | The hero, telling the story (hero) | quest.dragon | The mountain shakes as the dragon falls. Its hoard is yours. | chatterbox |
| `dlg.quest.dragon.slay.2` | The hero, telling the story (hero) | quest.dragon | The Iron Order sings of the dragonslayer. | chatterbox |
| `dlg.quest.dragon.pact.say` | The hero (hero) | quest.dragon | Then fight with me against the Arch-Demon. | chatterbox |
| `dlg.quest.dragon.pact.1` | The Void Dragon (dragon) | quest.dragon | Few would dare ask. Very well. We hunt together. | chatterbox |
| `dlg.quest.dragon.pact.2` | The hero, telling the story (hero) | quest.dragon | When you march on the Dread Fortress, a dragon will fly above you. | chatterbox |
| `dlg.quest.throne.ask.1` | The Arch-Demon (archDemon) | quest.throne | So. It ends. I didn't think it would be you. | chatterbox |
| `dlg.quest.throne.ask.2` | The Arch-Demon (archDemon) | quest.throne | My throne won't stay empty. Whoever takes it commands the fortress and the rift. | chatterbox |
| `dlg.quest.throne.ask.3` | The Arch-Demon (archDemon) | quest.throne | Three envoys are already waiting at my door. Choose who comes next. | chatterbox |
| `dlg.quest.throne.order.say` | The hero (hero) | quest.throne | The Iron Order will hold it. | chatterbox |
| `dlg.quest.throne.order.1` | The hero, telling the story (hero) | quest.throne | The Order garrisons the fortress and seals what it can. | chatterbox |
| `dlg.quest.throne.order.2` | The hero, telling the story (hero) | quest.throne | The realm will be safe, and it will be told what to do. | chatterbox |
| `dlg.quest.throne.syndicate.say` | The hero (hero) | quest.throne | The Ashen Syndicate has earned it. | chatterbox |
| `dlg.quest.throne.syndicate.1` | The hero, telling the story (hero) | quest.throne | The Syndicate moves in before dawn. | chatterbox |
| `dlg.quest.throne.syndicate.2` | The hero, telling the story (hero) | quest.throne | From now on everything has a price, even the peace. | chatterbox |
| `dlg.quest.throne.circle.say` | The hero (hero) | quest.throne | Let the Circle of Aether have it. | chatterbox |
| `dlg.quest.throne.circle.1` | The hero, telling the story (hero) | quest.throne | The Circle turns the fortress into a school above the rift. | chatterbox |
| `dlg.quest.throne.circle.2` | The hero, telling the story (hero) | quest.throne | They call it research. Everyone else holds their breath. | chatterbox |
| `dlg.quest.throne.shatter.say` | The hero (hero) | quest.throne | No one gets it. I'm breaking it. | chatterbox |
| `dlg.quest.throne.shatter.1` | The hero, telling the story (hero) | quest.throne | You break the throne with your own hands. No one will rule from here again. | chatterbox |
| `dlg.quest.throne.shatter.2` | The hero, telling the story (hero) | quest.throne | The envoys leave without a word. | chatterbox |
| `dlg.quest.throne.claim.say` | The hero (hero) | quest.throne | I'll take it myself. | chatterbox |
| `dlg.quest.throne.claim.1` | The hero, telling the story (hero) | quest.throne | The throne is cold, and it fits. | chatterbox |
| `dlg.quest.throne.claim.2` | The hero, telling the story (hero) | quest.throne | Three factions discover they have a common enemy. | chatterbox |
| `dlg.scoutWren.hello.1` | Scout Wren (scoutWren) | scoutWren | You came! I knew you would. Welcome to Bastion Crossing. | chatterbox |
| `dlg.scoutWren.hello.2` | Scout Wren (scoutWren) | scoutWren | I scout the roads for the captain. Ask me where the trouble is. | chatterbox |
| `dlg.scoutWren.sealed.1` | Scout Wren (scoutWren) | scoutWren | The dragon's gone! The roads feel lighter already. | chatterbox |
| `dlg.scoutWren.again.1` | Scout Wren (scoutWren) | scoutWren | Back already? The roads won't scout themselves. | chatterbox |
| `dlg.scoutWren.who.1` | Scout Wren (scoutWren) | scoutWren | Wren. I ran messages for Sunford's watch, before Sunford burned. | chatterbox |
| `dlg.scoutWren.rumor.plains.1` | Scout Wren (scoutWren) | scoutWren | Demons hold the road through Sunford Plains. Sunford's teachers are trapped behind it. | chatterbox |
| `dlg.scoutWren.rumor.hollows.1` | Scout Wren (scoutWren) | scoutWren | The Hollows are crawling with hellhounds. Clear them, and Sunford's people can come home. | chatterbox |
| `dlg.scoutWren.rumor.woods.1` | Scout Wren (scoutWren) | scoutWren | Something with three heads hunts the Whispering Woods. The herbalist is hiding there. | chatterbox |
| `dlg.scoutWren.rumor.outskirts.1` | Scout Wren (scoutWren) | scoutWren | Centaurs ride the Outskirts. If they reach our walls, we'll need every sword. | chatterbox |
| `dlg.scoutWren.rumor.siege.1` | Scout Wren (scoutWren) | scoutWren | Their warband is broken, but more are gathering. The captain is readying the walls. | chatterbox |
| `dlg.scoutWren.bye.1` | Scout Wren (scoutWren) | scoutWren | Watch the roads. I'll be watching them too. | chatterbox |
| `dlg.fortHale.hello.1` | Captain Hale (captainHale) | fortHale | You made it. Good. We need every sword we can get, now more than ever. | chatterbox |
| `dlg.fortHale.hello.2` | Captain Hale (captainHale) | fortHale | Welcome to Bastion Crossing. Old walls, but the only ones still standing. | chatterbox |
| `dlg.fortHale.road.1` | Captain Hale (captainHale) | fortHale | The road to Sunford is open again. Its people are safe behind our walls. | chatterbox |
| `dlg.fortHale.herbs.1` | Captain Hale (captainHale) | fortHale | The herbalist is back, and her herbs with her. The infirmary can breathe again. | chatterbox |
| `dlg.fortHale.siege.1` | Captain Hale (captainHale) | fortHale | You broke the centaurs. But a bigger host is coming, and it will come for these walls. | chatterbox |
| `dlg.fortHale.sealed.1` | Captain Hale (captainHale) | fortHale | The dragon is dead. I never thought I'd live to see it. Thank you. | chatterbox |
| `dlg.fortHale.again.1` | Captain Hale (captainHale) | fortHale | Still standing. The walls, the men, and me. | chatterbox |
| `dlg.hero.siege` | The hero (hero) | hero | Let's man the walls. | chatterbox |
| `dlg.fortHale.bell.1` | Captain Hale (captainHale) | fortHale | To the gate, then. Tell me how hard we hold it. | chatterbox |
| `dlg.fortHale.fort.say` | The hero (hero) | fortHale | What is this place? | chatterbox |
| `dlg.fortHale.fort.1` | Captain Hale (captainHale) | fortHale | An old border fort. Nobody manned it for fifty years, until the sky tore open. | chatterbox |
| `dlg.fortHale.fort.2` | Captain Hale (captainHale) | fortHale | Now it's the last safe place between the plains and the mountains. | chatterbox |
| `dlg.fortHale.rumor.road.1` | Captain Hale (captainHale) | fortHale | Clear the Plains and the Hollows. Sunford's people are trapped out there. | chatterbox |
| `dlg.fortHale.rumor.woods.1` | Captain Hale (captainHale) | fortHale | The herbalist is in the Whispering Woods, and so is a beast with three heads. Be ready. | chatterbox |
| `dlg.fortHale.rumor.centaurs.1` | Captain Hale (captainHale) | fortHale | Centaurs on the Outskirts. Break their warband before it reaches us. | chatterbox |
| `dlg.fortHale.rumor.siege.1` | Captain Hale (captainHale) | fortHale | Get some rest. When the siege bell rings, I'll need you on the wall. | chatterbox |
| `dlg.fortHale.siegeBack.1` | Captain Hale (captainHale) | fortHale | Not yet? Rest, then. The walls will wait for you. | chatterbox |
| `dlg.fortHale.bye.1` | Captain Hale (captainHale) | fortHale | Keep your sword close. | chatterbox |
| `dlg.fortMara.hello.1` | Elder Mara (elderMara) | fortMara | Child! You're alive. When Sunford burned, I feared the worst. | chatterbox |
| `dlg.fortMara.hello.2` | Elder Mara (elderMara) | fortMara | We are guests in a soldier's fort now, old women and all. | chatterbox |
| `dlg.fortMara.command.1` | Elder Mara (elderMara) | fortMara | Captain Hale fell with Oakhaven. So the fort listens to an old elder now. | chatterbox |
| `dlg.fortMara.home.1` | Elder Mara (elderMara) | fortMara | Sunford is rebuilding! The first roofs are up. I could weep. | chatterbox |
| `dlg.fortMara.sealed.1` | Elder Mara (elderMara) | fortMara | You did it, child. Every one of us owes you a home. | chatterbox |
| `dlg.fortMara.again.1` | Elder Mara (elderMara) | fortMara | Still here, child. Still counting heads. | chatterbox |
| `dlg.fortMara.bell.1` | Elder Mara (elderMara) | fortMara | The captain's walls are mine to keep now. Choose how we hold them. | chatterbox |
| `dlg.fortMara.town.say` | The hero (hero) | fortMara | What happened to Sunford? | chatterbox |
| `dlg.fortMara.town.1` | Elder Mara (elderMara) | fortMara | Demons came out of the night sky. We ran with what we could carry. | chatterbox |
| `dlg.fortMara.town.2` | Elder Mara (elderMara) | fortMara | Some of us never made it out. Bring the rest home, if you can. | chatterbox |
| `dlg.fortMara.rumor.road.1` | Elder Mara (elderMara) | fortMara | Our teachers are still out on the Sunford road. Bring them here, child. | chatterbox |
| `dlg.fortMara.rumor.woods.1` | Elder Mara (elderMara) | fortMara | The herbalist went into the Whispering Woods for herbs and never came back. | chatterbox |
| `dlg.fortMara.rumor.centaurs.1` | Elder Mara (elderMara) | fortMara | Riders on the Outskirts. Hooves like thunder, every night. | chatterbox |
| `dlg.fortMara.rumor.siege.1` | Elder Mara (elderMara) | fortMara | The walls will be tested soon. I can feel it in my old bones. | chatterbox |
| `dlg.fortMara.siegeBack.1` | Elder Mara (elderMara) | fortMara | Rest a while, child. The bell will ring again. | chatterbox |
| `dlg.fortMara.bye.1` | Elder Mara (elderMara) | fortMara | Go carefully, child. | chatterbox |
| `dlg.story.rift.scream.1` | The Chronicler (chronicler) | story.rift | The Void Lord falls, and the rift behind him screams. | chatterbox |
| `dlg.story.rift.scream.2` | The Chronicler (chronicler) | story.rift | It was never his throne. It was his cage, and he was its lid. | chatterbox |
| `dlg.story.rift.scream.3` | The Chronicler (chronicler) | story.rift | Now the rift is open, and everything the void held asleep is waking. | chatterbox |
| `dlg.story.wren.found.1` | Scout Wren (scoutWren) | story.wren | There you are! I'm Wren, a scout. I've looked everywhere for you. | chatterbox |
| `dlg.story.wren.found.2` | Scout Wren (scoutWren) | story.wren | Sunford is burning. Everyone who could run went to Bastion Crossing. | chatterbox |
| `dlg.story.wren.found.3` | Scout Wren (scoutWren) | story.wren | It's the old fort on the road to the Ashen Crags. Please hurry, they need you. | chatterbox |
| `dlg.story.forge.back.1` | Forgemaster Dorn (forgemaster) | story.forge | My forge is burning again, hotter than ever. Demon iron melts well. | chatterbox |
| `dlg.story.forge.back.2` | Forgemaster Dorn (forgemaster) | story.forge | Bring me what you find out there. I can forge it Infernal now. | chatterbox |
| `dlg.story.oracle.lens.1` | The Drowned Oracle (oracle) | story.oracle | You freed me once. Now I will see for you. Take my Lens. | chatterbox |
| `dlg.story.oracle.lens.2` | The Drowned Oracle (oracle) | story.oracle | Look through it, and the map will show you where the great beasts wait. | chatterbox |
| `dlg.story.priest.lens.1` | The Sunken Priest (sunkenPriest) | story.priest | The Oracle is gone, so I keep her temple now. The Sphinx guarded this. | chatterbox |
| `dlg.story.priest.lens.2` | The Sunken Priest (sunkenPriest) | story.priest | Her Lens. Look through it, and the map will show you where the great beasts wait. | chatterbox |
| `dlg.story.herbs.scale.1` | Briar Hollowell (freedHerbalist) | story.herbs | A scale off the Leviathan! It's light as a leaf, and it floats. | chatterbox |
| `dlg.story.herbs.scale.2` | Briar Hollowell (freedHerbalist) | story.herbs | Wear it, and the shallows will hold you like solid ground. | chatterbox |
| `dlg.story.ghost.key.1` | The Arch-Demon (archDemon) | story.ghost | So, the one who took my throne. You killed my Hydra. Good. | chatterbox |
| `dlg.story.ghost.key.2` | The Arch-Demon (archDemon) | story.ghost | Take its fire key. The rift's heart burns, and only fire opens it. | chatterbox |
| `dlg.story.syndicate.key.1` | Madam Ash (syndicateBoss) | story.syndicate | The Hydra is dead? Then its fire key goes to whoever pays. Or to you, I suppose. | chatterbox |
| `dlg.story.syndicate.key.2` | Madam Ash (syndicateBoss) | story.syndicate | It opens the rift's heart. Go and close it, before it eats my business. | chatterbox |
| `dlg.quest.seal.ask.1` | The Chronicler (chronicler) | quest.seal | The Elder Dragon is dead, and the rift lies open before you. | chatterbox |
| `dlg.quest.seal.ask.2` | The Chronicler (chronicler) | quest.seal | You could seal it now, forever. The beasts would sleep again. | chatterbox |
| `dlg.quest.seal.ask.3` | The Chronicler (chronicler) | quest.seal | Or you could leave it ajar, and let the bravest test themselves against what comes through. | chatterbox |
| `dlg.quest.seal.seal.say` | The hero (hero) | quest.seal | Seal it. Forever. | chatterbox |
| `dlg.quest.seal.seal.1` | The Chronicler (chronicler) | quest.seal | The rift closes like a healing wound, and the sky goes quiet. | chatterbox |
| `dlg.quest.seal.ajar.say` | The hero (hero) | quest.seal | Leave it ajar. We'll be ready. | chatterbox |
| `dlg.quest.seal.ajar.1` | The Chronicler (chronicler) | quest.seal | The rift stays open a crack, and something behind it laughs. | chatterbox |
| `dlg.story.sealed.sealed.1` | The Chronicler (chronicler) | story.sealed | And so the rift was sealed, and the world began to mend. | chatterbox |
| `dlg.story.sealed.sealed.2` | The Chronicler (chronicler) | story.sealed | Towns were rebuilt, songs were written, and one name was in all of them. | chatterbox |
| `dlg.story.sealed.ajar.1` | The Chronicler (chronicler) | story.sealed | And so the rift was left ajar, and the world learned to live beside it. | chatterbox |
| `dlg.story.sealed.ajar.2` | The Chronicler (chronicler) | story.sealed | The walls stayed manned, the colosseum stayed loud, and the hero stayed ready. | chatterbox |
| `dlg.fairPip.hello.1` | Pip (fairPip) | fairPip | Roll up! Nine barrels, a pack of imps and one mallet. Bonk them back down! | chatterbox |
| `dlg.fairPip.hello.2` | Pip (fairPip) | fairPip | Imps pop out of the barrels. Hit twenty before the sand runs out. | chatterbox |
| `dlg.fairPip.hello.3` | Pip (fairPip) | fairPip | Leave the gold armoured ones alone, they cost you a life. Three wins in a row and the big prize is yours. | chatterbox |
| `dlg.fairPip.again.1` | Pip (fairPip) | fairPip | Back for more bonking? Grab the mallet! | chatterbox |
| `dlg.fairPip.play.1` | Pip (fairPip) | fairPip | Mallet up! Here they come! | chatterbox |
| `dlg.fairPip.who.1` | Pip (fairPip) | fairPip | Pip, imp-catcher by trade. I caught these ones myself. They bite. | chatterbox |
| `dlg.fairPip.playBack.1` | Pip (fairPip) | fairPip | Ha! What a racket! Again? | chatterbox |
| `dlg.fairPip.bye.1` | Pip (fairPip) | fairPip | Keep your mallet arm loose! | chatterbox |
| `dlg.fairBess.hello.1` | Old Bess (fairBess) | fairBess | Five rings, three heads, and not one of them bites. I carved her myself, so mind the paint. | chatterbox |
| `dlg.fairBess.hello.2` | Old Bess (fairBess) | fairBess | Hold to build your throw, let go to toss. A head only takes a ring when it sways to the middle. | chatterbox |
| `dlg.fairBess.hello.3` | Old Bess (fairBess) | fairBess | Every head you ring in a row counts one more. Ring all five and I pay you properly. | chatterbox |
| `dlg.fairBess.again.1` | Old Bess (fairBess) | fairBess | Back to try your arm on my old girl? | chatterbox |
| `dlg.fairBess.play.1` | Old Bess (fairBess) | fairBess | Here are your rings. Throw soft, dearie. | chatterbox |
| `dlg.fairBess.who.1` | Old Bess (fairBess) | fairBess | Forty years on the fair roads. The hydra came with the war. Seemed fitting. | chatterbox |
| `dlg.fairBess.playBack.1` | Old Bess (fairBess) | fairBess | Not bad. My late husband threw worse. | chatterbox |
| `dlg.fairBess.bye.1` | Old Bess (fairBess) | fairBess | Mind the paint on your way out. | chatterbox |
| `dlg.fairHob.hello.1` | Hob (fairHob) | fairHob | Oh. Hello. Do you want to arm-wrestle? I will go easy. I will try. | chatterbox |
| `dlg.fairHob.hello.2` | Hob (fairHob) | fairHob | Push when the ring meets the circle. Push off the beat and you slip. | chatterbox |
| `dlg.fairHob.hello.3` | Hob (fairHob) | fairHob | Strong arms make it easier. Beat me three times in a row and the Forgemaster gives you a discount. | chatterbox |
| `dlg.fairHob.again.1` | Hob (fairHob) | fairHob | Another round? Nobody ever comes back for another round. | chatterbox |
| `dlg.fairHob.play.1` | Hob (fairHob) | fairHob | Elbow on the table. Ready when you are. | chatterbox |
| `dlg.fairHob.who.1` | Hob (fairHob) | fairHob | I am the Forgemaster's apprentice. He says I do not know my own strength. | chatterbox |
| `dlg.fairHob.playBack.1` | Hob (fairHob) | fairHob | Good match. My arm will be sore tomorrow. Probably. | chatterbox |
| `dlg.fairHob.bye.1` | Hob (fairHob) | fairHob | Come back soon. The forge is very quiet. | chatterbox |
| `dlg.mysteriousWanderer.hello.1` | Mysterious Wanderer (mysteriousWanderer) | mysteriousWanderer | So. You did what few ever could. I felt it from the far side of the rift. | chatterbox |
| `dlg.mysteriousWanderer.hello.2` | Mysterious Wanderer (mysteriousWanderer) | mysteriousWanderer | I teach the old ways that join two schools in one. Only to those who earn them. | chatterbox |
| `dlg.mysteriousWanderer.sealed.1` | Mysterious Wanderer (mysteriousWanderer) | mysteriousWanderer | You sealed it. A pity, in a way. I liked the view. | chatterbox |
| `dlg.mysteriousWanderer.ajar.1` | Mysterious Wanderer (mysteriousWanderer) | mysteriousWanderer | You left it ajar. Bold. The demons will keep you sharp. | chatterbox |
| `dlg.mysteriousWanderer.again.1` | Mysterious Wanderer (mysteriousWanderer) | mysteriousWanderer | Back again. The road is long, but you walk it well. | chatterbox |
| `dlg.mysteriousWanderer.train.1` | Mysterious Wanderer (mysteriousWanderer) | mysteriousWanderer | Show me both halves of what you are, and I will make them one. | chatterbox |
| `dlg.mysteriousWanderer.trial.say` | The hero (hero) | mysteriousWanderer | What trials do you mean? | chatterbox |
| `dlg.mysteriousWanderer.trial.1` | Mysterious Wanderer (mysteriousWanderer) | mysteriousWanderer | A gate held without a scratch. A dragon slain without a fall. Five Infernal forgings and five wins in a row. | chatterbox |
| `dlg.mysteriousWanderer.trial.2` | Mysterious Wanderer (mysteriousWanderer) | mysteriousWanderer | The Leviathan's death, and a perfect round at the hydra. Each opens a door I can show you. | chatterbox |
| `dlg.mysteriousWanderer.who.1` | Mysterious Wanderer (mysteriousWanderer) | mysteriousWanderer | A wanderer. I walked the rift's edge before your grandfather was born. Names wear out. | chatterbox |
| `dlg.mysteriousWanderer.trainBack.1` | Mysterious Wanderer (mysteriousWanderer) | mysteriousWanderer | Practise. Two schools fight each other before they agree. | chatterbox |
| `dlg.mysteriousWanderer.bye.1` | Mysterious Wanderer (mysteriousWanderer) | mysteriousWanderer | Walk carefully. I will be here, until I am not. | chatterbox |
| `dlg.smalltalkSunford.weather.1` | Townsfolk (smalltalkSunford) | smalltalkSunford | Rain tonight. My knee's been aching all day. | chatterbox |
| `dlg.smalltalkSunford.weather.2` | Townsfolk (townsfolk) | smalltalkSunford | Your knee said that last week too. | chatterbox |
| `dlg.smalltalkSunford.weather.3` | Townsfolk (smalltalkSunford) | smalltalkSunford | And it rained, didn't it? Just not here. | chatterbox |
| `dlg.smalltalkSunford.harvest.1` | Townsfolk (smalltalkSunford) | smalltalkSunford | The barley's come up well this year. | chatterbox |
| `dlg.smalltalkSunford.harvest.2` | Townsfolk (townsfolk) | smalltalkSunford | Let's hope we get to keep it. | chatterbox |
| `dlg.smalltalkSunford.goblins.1` | Townsfolk (smalltalkSunford) | smalltalkSunford | Goblins took three hens off the Miller farm. | chatterbox |
| `dlg.smalltalkSunford.goblins.2` | Townsfolk (townsfolk) | smalltalkSunford | Again? That's the second time this month. | chatterbox |
| `dlg.smalltalkSunford.goblins.3` | Townsfolk (smalltalkSunford) | smalltalkSunford | Somebody ought to do something about those caves. | chatterbox |
| `dlg.smalltalkSunford.kingGone.1` | Townsfolk (smalltalkSunford) | smalltalkSunford | They say the Goblin King's dead. | chatterbox |
| `dlg.smalltalkSunford.kingGone.2` | Townsfolk (townsfolk) | smalltalkSunford | Good. Maybe I'll sleep through a whole night now. | chatterbox |
| `dlg.smalltalkSunford.pact.1` | Townsfolk (smalltalkSunford) | smalltalkSunford | I bought a ladle off a goblin this morning. | chatterbox |
| `dlg.smalltalkSunford.pact.2` | Townsfolk (townsfolk) | smalltalkSunford | Any good? | chatterbox |
| `dlg.smalltalkSunford.pact.3` | Townsfolk (smalltalkSunford) | smalltalkSunford | Better than mine, honestly. Don't tell anyone. | chatterbox |
| `dlg.smalltalkSunford.bram.1` | Townsfolk (smalltalkSunford) | smalltalkSunford | Bram's been at the anvil since before sunrise. | chatterbox |
| `dlg.smalltalkSunford.bram.2` | Townsfolk (townsfolk) | smalltalkSunford | He gets like that when he's worried. | chatterbox |
| `dlg.smalltalkSunford.pie.1` | Townsfolk (smalltalkSunford) | smalltalkSunford | Is that apple pie I can smell? | chatterbox |
| `dlg.smalltalkSunford.pie.2` | Townsfolk (townsfolk) | smalltalkSunford | It was. The children found it first. | chatterbox |
| `dlg.smalltalkSunford.pie.3` | Townsfolk (smalltalkSunford) | smalltalkSunford | I'll bake another. Hide it better this time. | chatterbox |
| `dlg.smalltalkSunford.road.1` | Townsfolk (smalltalkSunford) | smalltalkSunford | Nobody's taken the plains road in a week. | chatterbox |
| `dlg.smalltalkSunford.road.2` | Townsfolk (townsfolk) | smalltalkSunford | Not with bandits on it. Can't blame them. | chatterbox |
| `dlg.smalltalkSunford.hero.1` | Townsfolk (smalltalkSunford) | smalltalkSunford | Somebody cleared the bandits off the plains road. | chatterbox |
| `dlg.smalltalkSunford.hero.2` | Townsfolk (townsfolk) | smalltalkSunford | Thank goodness. My sister can visit again. | chatterbox |
| `dlg.smalltalkOakhaven.prices.1` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | Two silver for a cabbage. Two! | chatterbox |
| `dlg.smalltalkOakhaven.prices.2` | Townsfolk (townsfolk) | smalltalkOakhaven | Nothing gets through the gate cheap these days. | chatterbox |
| `dlg.smalltalkOakhaven.prices.3` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | I'll grow my own, then. On the roof, if I must. | chatterbox |
| `dlg.smalltalkOakhaven.watch.1` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | They've doubled the guard on the gate. | chatterbox |
| `dlg.smalltalkOakhaven.watch.2` | Townsfolk (townsfolk) | smalltalkOakhaven | Good. I sleep a bit easier for it. | chatterbox |
| `dlg.smalltalkOakhaven.caravan.1` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | The spice caravan's late again. | chatterbox |
| `dlg.smalltalkOakhaven.caravan.2` | Townsfolk (townsfolk) | smalltalkOakhaven | Bandits? | chatterbox |
| `dlg.smalltalkOakhaven.caravan.3` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | Or mud. Let's hope it's mud. | chatterbox |
| `dlg.smalltalkOakhaven.siege.1` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | There's an army camped out past the farms. | chatterbox |
| `dlg.smalltalkOakhaven.siege.2` | Townsfolk (townsfolk) | smalltalkOakhaven | Then we'd better fill the cellar while we can. | chatterbox |
| `dlg.smalltalkOakhaven.saved.1` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | Were you on the wall when the siege broke? | chatterbox |
| `dlg.smalltalkOakhaven.saved.2` | Townsfolk (townsfolk) | smalltalkOakhaven | I was hiding under my bed, if I'm honest. | chatterbox |
| `dlg.smalltalkOakhaven.saved.3` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | So was half the town. We're still here, though. | chatterbox |
| `dlg.smalltalkOakhaven.fountain.1` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | I threw a coin in the fountain for luck. | chatterbox |
| `dlg.smalltalkOakhaven.fountain.2` | Townsfolk (townsfolk) | smalltalkOakhaven | Hope you wished for cheaper cabbages. | chatterbox |
| `dlg.smalltalkOakhaven.ash.1` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | Everything still smells of smoke. | chatterbox |
| `dlg.smalltalkOakhaven.ash.2` | Townsfolk (townsfolk) | smalltalkOakhaven | It'll fade. Everything does, in the end. | chatterbox |
| `dlg.smalltalkOakhaven.hide.1` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | Did you hear boots in the street last night? | chatterbox |
| `dlg.smalltalkOakhaven.hide.2` | Townsfolk (townsfolk) | smalltalkOakhaven | Not so loud. You don't know who's listening. | chatterbox |
| `dlg.smalltalkOakhaven.hide.3` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | Sorry. I just... sorry. | chatterbox |
| `dlg.smalltalkOakhaven.bread.1` | Townsfolk (smalltalkOakhaven) | smalltalkOakhaven | I found half a loaf. Here, take some. | chatterbox |
| `dlg.smalltalkOakhaven.bread.2` | Townsfolk (townsfolk) | smalltalkOakhaven | You're a good soul. Thank you. | chatterbox |
| `dlg.smalltalkIronhold.ore.1` | Townsfolk (smalltalkIronhold) | smalltalkIronhold | Good seam of copper on the fourth level. | chatterbox |
| `dlg.smalltalkIronhold.ore.2` | Townsfolk (townsfolk) | smalltalkIronhold | Copper. I was hoping for silver. | chatterbox |
| `dlg.smalltalkIronhold.ore.3` | Townsfolk (smalltalkIronhold) | smalltalkIronhold | Copper pays the rent. Silver pays for dreams. | chatterbox |
| `dlg.smalltalkIronhold.forge.1` | Townsfolk (smalltalkIronhold) | smalltalkIronhold | The great forge hasn't gone cold in a hundred years. | chatterbox |
| `dlg.smalltalkIronhold.forge.2` | Townsfolk (townsfolk) | smalltalkIronhold | My grandfather helped light it, you know. | chatterbox |
| `dlg.smalltalkIronhold.beard.1` | Townsfolk (smalltalkIronhold) | smalltalkIronhold | You've trimmed your beard. | chatterbox |
| `dlg.smalltalkIronhold.beard.2` | Townsfolk (townsfolk) | smalltalkIronhold | Got too close to the anvil. | chatterbox |
| `dlg.smalltalkIronhold.beard.3` | Townsfolk (smalltalkIronhold) | smalltalkIronhold | It'll grow back. Suits you shorter, anyway. | chatterbox |
| `dlg.smalltalkIronhold.core.1` | Townsfolk (smalltalkIronhold) | smalltalkIronhold | Something's glowing down in the deep shafts. | chatterbox |
| `dlg.smalltalkIronhold.core.2` | Townsfolk (townsfolk) | smalltalkIronhold | Nothing good glows down there. Stay up top. | chatterbox |
| `dlg.smalltalkIronhold.order.1` | Townsfolk (smalltalkIronhold) | smalltalkIronhold | The Order's armourers work fast, I'll give them that. | chatterbox |
| `dlg.smalltalkIronhold.order.2` | Townsfolk (townsfolk) | smalltalkIronhold | Fast, aye. We'll see how it holds up. | chatterbox |
| `dlg.smalltalkIronhold.circle.1` | Townsfolk (smalltalkIronhold) | smalltalkIronhold | The Circle folk hum while they work. | chatterbox |
| `dlg.smalltalkIronhold.circle.2` | Townsfolk (townsfolk) | smalltalkIronhold | Better than your singing, at least. | chatterbox |
| `dlg.smalltalkIronhold.cold.1` | Townsfolk (smalltalkIronhold) | smalltalkIronhold | Bitter cold this morning. | chatterbox |
| `dlg.smalltalkIronhold.cold.2` | Townsfolk (townsfolk) | smalltalkIronhold | Come and stand by the forge, then. | chatterbox |
| `dlg.smalltalkSilverbridge.barges.1` | Townsfolk (smalltalkSilverbridge) | smalltalkSilverbridge | Three barges in from the coast this morning. | chatterbox |
| `dlg.smalltalkSilverbridge.barges.2` | Townsfolk (townsfolk) | smalltalkSilverbridge | Salt fish again? | chatterbox |
| `dlg.smalltalkSilverbridge.barges.3` | Townsfolk (smalltalkSilverbridge) | smalltalkSilverbridge | Silk, for once. Smell your fingers after, though. | chatterbox |
| `dlg.smalltalkSilverbridge.lesson.1` | Townsfolk (smalltalkSilverbridge) | smalltalkSilverbridge | How was your lesson? | chatterbox |
| `dlg.smalltalkSilverbridge.lesson.2` | Townsfolk (townsfolk) | smalltalkSilverbridge | I set my sleeve on fire. The master says that's progress. | chatterbox |
| `dlg.smalltalkSilverbridge.masters.1` | Townsfolk (smalltalkSilverbridge) | smalltalkSilverbridge | Every master in the land teaches on one street. | chatterbox |
| `dlg.smalltalkSilverbridge.masters.2` | Townsfolk (townsfolk) | smalltalkSilverbridge | And every one of them says theirs is the best class. | chatterbox |
| `dlg.smalltalkSilverbridge.masters.3` | Townsfolk (smalltalkSilverbridge) | smalltalkSilverbridge | They're all right, which is the annoying part. | chatterbox |
| `dlg.smalltalkSilverbridge.bridge.1` | Townsfolk (smalltalkSilverbridge) | smalltalkSilverbridge | They say the bridge is older than the town. | chatterbox |
| `dlg.smalltalkSilverbridge.bridge.2` | Townsfolk (townsfolk) | smalltalkSilverbridge | It certainly creaks like it. | chatterbox |
| `dlg.smalltalkSilverbridge.fish.1` | Townsfolk (smalltalkSilverbridge) | smalltalkSilverbridge | Caught anything? | chatterbox |
| `dlg.smalltalkSilverbridge.fish.2` | Townsfolk (townsfolk) | smalltalkSilverbridge | A boot. | chatterbox |
| `dlg.smalltalkSilverbridge.fish.3` | Townsfolk (smalltalkSilverbridge) | smalltalkSilverbridge | Well, that's half a pair. | chatterbox |
| `dlg.smalltalkSilverbridge.newMaster.1` | Townsfolk (smalltalkSilverbridge) | smalltalkSilverbridge | A new master moved in up the street. Talks about time a lot. | chatterbox |
| `dlg.smalltalkSilverbridge.newMaster.2` | Townsfolk (townsfolk) | smalltalkSilverbridge | Late for every lesson, I bet. | chatterbox |
| `dlg.smalltalkSilverbridge.siege.1` | Townsfolk (smalltalkSilverbridge) | smalltalkSilverbridge | Word from Oakhaven is bad. Bandits at the walls. | chatterbox |
| `dlg.smalltalkSilverbridge.siege.2` | Townsfolk (townsfolk) | smalltalkSilverbridge | Then the barges will come here instead. Poor souls. | chatterbox |
| `dlg.smalltalkKids.tag.1` | Townsfolk (smalltalkKids) | smalltalkKids | Tag, you're it! | chatterbox |
| `dlg.smalltalkKids.tag.2` | Townsfolk (kidFriend) | smalltalkKids | That's not fair, I wasn't ready! | chatterbox |
| `dlg.smalltalkKids.dragon.1` | Townsfolk (smalltalkKids) | smalltalkKids | When I'm big I'm going to ride a dragon. | chatterbox |
| `dlg.smalltalkKids.dragon.2` | Townsfolk (kidFriend) | smalltalkKids | Dragons don't let people ride them. | chatterbox |
| `dlg.smalltalkKids.dragon.3` | Townsfolk (smalltalkKids) | smalltalkKids | A nice one might. | chatterbox |
| `dlg.smalltalkKids.sword.1` | Townsfolk (smalltalkKids) | smalltalkKids | Look, I found a sword! | chatterbox |
| `dlg.smalltalkKids.sword.2` | Townsfolk (kidFriend) | smalltalkKids | That's a stick. | chatterbox |
| `dlg.smalltalkKids.frog.1` | Townsfolk (smalltalkKids) | smalltalkKids | There's a frog down by the well. | chatterbox |
| `dlg.smalltalkKids.frog.2` | Townsfolk (kidFriend) | smalltalkKids | Can we keep it? | chatterbox |
| `dlg.smalltalkKids.frog.3` | Townsfolk (smalltalkKids) | smalltalkKids | Mum said no more frogs. | chatterbox |
| `dlg.bark.banditChief.whistle.1` | Bandit Chief (banditChief) | bark.banditChief | Up, lads! Bite them! | chatterbox |
| `dlg.bark.goblinKing.charge.1` | The Goblin King (goblinKing) | bark.goblinKing | Run them down, Tusker! | chatterbox |
| `dlg.bark.goblinKing.horn.1` | The Goblin King (goblinKing) | bark.goblinKing | To me, lads! Goblins, to me! | chatterbox |
| `dlg.bark.goblinKing.dismount.1` | The Goblin King (goblinKing) | bark.goblinKing | Go on, Tusker, run! I'll finish this myself! | chatterbox |
| `dlg.bark.goblinKing.return.1` | The Goblin King (goblinKing) | bark.goblinKing | Tusker! One more time! | chatterbox |
| `dlg.bark.dragon.takeoff.1` | The Void Dragon (dragon) | bark.dragon | Enough. Let the sky burn you. | chatterbox |
| `dlg.bark.dragon.flight2.1` | The Void Dragon (dragon) | bark.dragon | I am not finished with you! | chatterbox |
| `dlg.bark.archDemon.gate.1` | The Arch-Demon (archDemon) | bark.archDemon | The gate is open. No one leaves. | chatterbox |
| `dlg.bark.archDemon.dive.1` | The Arch-Demon (archDemon) | bark.archDemon | Kneel. | chatterbox |
| `dlg.bark.frostJarl.hammer.1` | The Frost Jarl (frostJarl) | bark.frostJarl | Stand still, little one. | chatterbox |
| `dlg.bark.frostJarl.iceBreak.1` | The Frost Jarl (frostJarl) | bark.frostJarl | The lake will swallow you! | chatterbox |
| `dlg.bark.chimera.intro.1` | The Chimera (chimera) | bark.chimera | Three heads, one hunger. Which of us bites first? | chatterbox |
| `dlg.bark.chimera.twin.1` | The Chimera (chimera) | bark.chimera | Two of us now. Choose your side well. | chatterbox |
| `dlg.bark.chimera.tail.1` | The Chimera (chimera) | bark.chimera | My tail! You will pay for that! | chatterbox |
| `dlg.bark.chimera.death.1` | The Chimera (chimera) | bark.chimera | Three heads, and none saw this coming. | chatterbox |
| `dlg.bark.centaurWarchief.intro.1` | The Centaur Warchief (centaurWarchief) | bark.centaurWarchief | Run if you like. My arrows run faster. | chatterbox |
| `dlg.bark.centaurWarchief.raiders.1` | The Centaur Warchief (centaurWarchief) | bark.centaurWarchief | Riders! Ride them down! | chatterbox |
| `dlg.bark.centaurWarchief.rear.1` | The Centaur Warchief (centaurWarchief) | bark.centaurWarchief | Enough arrows. I will trample you flat! | chatterbox |
| `dlg.bark.centaurWarchief.death.1` | The Centaur Warchief (centaurWarchief) | bark.centaurWarchief | The plains will remember my hooves. | chatterbox |
| `dlg.bark.cyclops.intro.1` | The Cyclops (cyclops) | bark.cyclops | Something small is here. Come closer. Let me see. | chatterbox |
| `dlg.bark.cyclops.cover.1` | The Cyclops (cyclops) | bark.cyclops | No more looking. You will not have my eye! | chatterbox |
| `dlg.bark.cyclops.blind.1` | The Cyclops (cyclops) | bark.cyclops | I can't see you, but I can hear you! | chatterbox |
| `dlg.bark.cyclops.death.1` | The Cyclops (cyclops) | bark.cyclops | Dark. It's all gone dark. | chatterbox |
| `dlg.bark.sphinx.intro.1` | The Sphinx (sphinx) | bark.sphinx | Answer me, little one, or be buried in my sand. | chatterbox |
| `dlg.bark.sphinx.riddle.1` | The Sphinx (sphinx) | bark.sphinx | A riddle, then. Step where I show you, in that order. | chatterbox |
| `dlg.bark.sphinx.sand.1` | The Sphinx (sphinx) | bark.sphinx | Five this time. And my sand will not wait. | chatterbox |
| `dlg.bark.sphinx.death.1` | The Sphinx (sphinx) | bark.sphinx | You answered well. The sand is yours now. | chatterbox |
| `dlg.bark.leviathan.intro.1` | The Leviathan (leviathan) | bark.leviathan | You walk in my water now. | chatterbox |
| `dlg.bark.leviathan.sink.1` | The Leviathan (leviathan) | bark.leviathan | Your little islands are sinking. | chatterbox |
| `dlg.bark.leviathan.grab.1` | The Leviathan (leviathan) | bark.leviathan | Come down to the deep with me! | chatterbox |
| `dlg.bark.leviathan.death.1` | The Leviathan (leviathan) | bark.leviathan | The tide goes out, and does not come back. | chatterbox |
| `dlg.bark.hydra.intro.1` | The Hydra (hydra) | bark.hydra | Cut one head, and two will grow! | chatterbox |
| `dlg.bark.hydra.heads.1` | The Hydra (hydra) | bark.hydra | More heads, more teeth! | chatterbox |
| `dlg.bark.hydra.rage.1` | The Hydra (hydra) | bark.hydra | Burn us? Then burn with us! | chatterbox |
| `dlg.bark.hydra.death.1` | The Hydra (hydra) | bark.hydra | No more heads. No more. | chatterbox |
| `dlg.bark.elderDragon.intro.1` | The Elder Dragon (elderDragon) | bark.elderDragon | I slept beneath the world before your kind had fire. | chatterbox |
| `dlg.bark.elderDragon.flight.1` | The Elder Dragon (elderDragon) | bark.elderDragon | Hide behind your little stones, then. | chatterbox |
| `dlg.bark.elderDragon.rift.1` | The Elder Dragon (elderDragon) | bark.elderDragon | The rift is pulling me back. Not yet! | chatterbox |
| `dlg.bark.elderDragon.death.1` | The Elder Dragon (elderDragon) | bark.elderDragon | Seal it, then. I am tired of the dark. | chatterbox |
| `dlg.bark.siegeHale.start.1` | Captain Hale (captainHale) | bark.siegeHale | Here they come! Hold the gate! | chatterbox |
| `dlg.bark.siegeHale.ram.1` | Captain Hale (captainHale) | bark.siegeHale | A ram! Kill it before it reaches the gate! | chatterbox |
| `dlg.bark.siegeHale.horn50.1` | Captain Hale (captainHale) | bark.siegeHale | The gate is half gone! Hold! | chatterbox |
| `dlg.bark.siegeHale.horn25.1` | Captain Hale (captainHale) | bark.siegeHale | The gate won't last much longer! | chatterbox |
| `dlg.bark.siegeHale.won.1` | Captain Hale (captainHale) | bark.siegeHale | They're broken! Bastion stands! | chatterbox |
| `dlg.bark.siegeMara.start.1` | Elder Mara (elderMara) | bark.siegeMara | They're coming! Stand fast, all of you! | chatterbox |
| `dlg.bark.siegeMara.ram.1` | Elder Mara (elderMara) | bark.siegeMara | A ram! Stop it before it breaks the gate! | chatterbox |
| `dlg.bark.siegeMara.horn50.1` | Elder Mara (elderMara) | bark.siegeMara | Half the gate is gone. Hold on! | chatterbox |
| `dlg.bark.siegeMara.horn25.1` | Elder Mara (elderMara) | bark.siegeMara | The gate is failing! Hold them back! | chatterbox |
| `dlg.bark.siegeMara.won.1` | Elder Mara (elderMara) | bark.siegeMara | They're running! The fort still stands! | chatterbox |
| `dlg.bark.freedPeddler.freed.1` | Odo Marrow (freedPeddler) | bark.freedPeddler | Bless your boots! Odo Marrow, peddler. Come find me in Sunford, I'll have wares for you. | chatterbox |
| `dlg.bark.freedHerbalist.freed.1` | Briar Hollowell (freedHerbalist) | bark.freedHerbalist | Oh, thank you! I'm Briar, a herbalist. Come and see me in Silverbridge. I could use your help. | chatterbox |
| `dlg.bark.freedFarmers.freed.1` | Jory Toller (freedFarmers) | bark.freedFarmers | You saved us! We're the Tollers, farmers. Find us in Oakhaven, there's trouble at home. | chatterbox |
| `dlg.bark.windDisciple.freed.1` | Kestrel Vane (windDisciple) | bark.windDisciple | Free at last! Kestrel Vane, of the Windrunner's way. Find me in Oakhaven and I'll teach you. | chatterbox |
| `dlg.bark.frostDisciple.freed.1` | Ivor Hask (frostDisciple) | bark.frostDisciple | You came for me? Ivor Hask, a Frostwarden's disciple. Come to Ironhold and I'll teach you. | chatterbox |
| `dlg.bark.lightDisciple.freed.1` | Sister Aurelle (lightDisciple) | bark.lightDisciple | The light sent you. I am Sister Aurelle. Seek me in Sunford, I'll teach you the Lightbringer's way. | chatterbox |
| `dlg.bark.trainerAegis.freed.1` | Ser Aldric (trainerAegis) | bark.trainerAegis | Thank you for freeing us from the bandits! Come to the fire: we'll all teach you, first lesson free. | chatterbox |
| `dlg.intro.crossing.1` | The Chronicler (chronicler) | intro | Every road in this world meets at a crossing… and every crossing is a battle. | elevenlabs |
| `dlg.intro.hero.1` | The Chronicler (chronicler) | intro | From the quiet fields of Sunford, a young hero set out. | elevenlabs |
| `dlg.intro.fire.1` | The Chronicler (chronicler) | intro | Fire answered the call. Steel learned a new name. | elevenlabs |
| `dlg.intro.foes.1` | The Chronicler (chronicler) | intro | Goblin kings, frost jarls, a void dragon… and the Arch-Demon. | elevenlabs |
| `dlg.intro.begin.1` | The Chronicler (chronicler) | intro | Your legend begins now. | elevenlabs |
| `ending.order.text` | The hero, telling the story (hero) | ending | Banners of the Iron Order fly over the Dread Fortress. The roads are safe, the laws are many, and your name is carved above the gate. | chatterbox |
| `ending.syndicate.text` | The hero, telling the story (hero) | ending | The Syndicate rules from the shadows of the fortress. Nothing in the realm is forbidden any more. It is only expensive. | chatterbox |
| `ending.circle.text` | The hero, telling the story (hero) | ending | The Circle lights the fortress with captured void-fire. Wonders pour out of its gates, and no one asks what they cost. | chatterbox |
| `ending.free.text` | The hero, telling the story (hero) | ending | The throne lies in pieces and the fortress stands empty. For the first time in an age, the realm belongs to the people who live in it. | chatterbox |
| `ending.unbound.text` | The hero, telling the story (hero) | ending | You took the throne. Order, Syndicate and Circle march against you together. Let them come. | chatterbox |
| `ending.note.goblinPact` | The hero, telling the story (hero) | ending | Goblin traders still haggle in Sunford's square. | chatterbox |
| `ending.note.goblinSlain` | The hero, telling the story (hero) | ending | The Hollows stand empty, and the caravans run on time. | chatterbox |
| `ending.note.goblinRansom` | The hero, telling the story (hero) | ending | The Goblin King is rich again, and raiding again. | chatterbox |
| `ending.note.oakhavenSaved` | The hero, telling the story (hero) | ending | Oakhaven's walls are taller now, and its markets fuller. | chatterbox |
| `ending.note.oakhavenFallen` | The hero, telling the story (hero) | ending | Weeds grow through Oakhaven's streets. The black market thrives. | chatterbox |
| `ending.note.coreOrder` | The hero, telling the story (hero) | ending | The mines of Ironhold are quiet, and the dwarves dig again. | chatterbox |
| `ending.note.coreCircle` | The hero, telling the story (hero) | ending | Ironhold's forges glow blue, and its guns are the best in the realm. | chatterbox |
| `ending.note.coreSold` | The hero, telling the story (hero) | ending | Somewhere, the core still hums. The golems still walk. | chatterbox |
| `ending.note.oracleFreed` | The hero, telling the story (hero) | ending | On calm days, fishermen see the oracle far out on the water. | chatterbox |
| `ending.note.oracleSlain` | The hero, telling the story (hero) | ending | The Sunken Temple is silent. No one knows what comes next any more. | chatterbox |
| `ending.note.dragonPact` | The hero, telling the story (hero) | ending | A dragon nests on the fortress roof, and answers to one name only. | chatterbox |
| `ending.note.dragonSlain` | The hero, telling the story (hero) | ending | A dragon's skull hangs in the Order's great hall. | chatterbox |
| `ending.more` | The hero, telling the story (hero) | ending | The Void Rift has opened beneath the fortress. But the true test of your power waits in the Colosseum: climb its waves, and win the mythic prizes only its champions hold. | chatterbox |
| `dlg.hero.bye__f` | The girl hero (heroine) | hero | I'll let you get on. | chatterbox |
| `dlg.hero.trade__f` | The girl hero (heroine) | hero | Can I see what you've got? | chatterbox |
| `dlg.hero.who__f` | The girl hero (heroine) | hero | Who are you, if you don't mind me asking? | chatterbox |
| `dlg.hero.train__f` | The girl hero (heroine) | hero | Will you teach me? | chatterbox |
| `dlg.lightDisciple.class.say__f` | The girl hero (heroine) | lightDisciple | What does a Lightbringer do? | chatterbox |
| `dlg.hero.ready__f` | The girl hero (heroine) | hero | Do you think I'm ready for more? | chatterbox |
| `dlg.hero.ore__f` | The girl hero (heroine) | hero | I've got some ore to sell. | chatterbox |
| `dlg.hero.learnSmith__f` | The girl hero (heroine) | hero | Could you teach me to smith? | chatterbox |
| `dlg.hero.forge__f` | The girl hero (heroine) | hero | I'd like to use your forge. | chatterbox |
| `dlg.sunfordSmith.gear.say__f` | The girl hero (heroine) | sunfordSmith | What should I take with me out there? | chatterbox |
| `dlg.hero.rumor__f` | The girl hero (heroine) | hero | Heard anything lately? | chatterbox |
| `dlg.sunfordPeddler.trinkets.say__f` | The girl hero (heroine) | sunfordPeddler | What are trinkets actually good for? | chatterbox |
| `dlg.sunfordPeddler.stolen.say__f` | The girl hero (heroine) | sunfordPeddler | Where did all this come from, really? | chatterbox |
| `dlg.trainerAegis.class.say__f` | The girl hero (heroine) | trainerAegis | What does an Aegis Knight actually do? | chatterbox |
| `dlg.trainerAegis.order.say__f` | The girl hero (heroine) | trainerAegis | Tell me about the Iron Order. | chatterbox |
| `dlg.trainerPyro.class.say__f` | The girl hero (heroine) | trainerPyro | What does a pyromancer do, exactly? | chatterbox |
| `dlg.trainerPyro.circle.say__f` | The girl hero (heroine) | trainerPyro | Who are the Circle of Aether? | chatterbox |
| `dlg.sfShadow.class.say__f` | The girl hero (heroine) | sfShadow | What does a shadow do? | chatterbox |
| `dlg.sfShadow.town.say__f` | The girl hero (heroine) | sfShadow | Why teach here, in Sunford? | chatterbox |
| `dlg.sfGeo.class.say__f` | The girl hero (heroine) | sfGeo | What does a geomancer do? | chatterbox |
| `dlg.sfGeo.farms.say__f` | The girl hero (heroine) | sfGeo | Does the earth help the farms too? | chatterbox |
| `dlg.elderMara.map.say__f` | The girl hero (heroine) | elderMara | I found a piece of an old map. | chatterbox |
| `dlg.elderMara.reward.say__f` | The girl hero (heroine) | elderMara | Someone said you wanted to see me? | chatterbox |
| `dlg.elderMara.quest.say__f` | The girl hero (heroine) | elderMara | What's troubling Sunford? | chatterbox |
| `dlg.elderMara.quest.2__f` | The girl hero (heroine) | elderMara | And you want him dead? | chatterbox |
| `dlg.elderMara.king.say__f` | The girl hero (heroine) | elderMara | About the Goblin King... | chatterbox |
| `dlg.elderMara.town.say__f` | The girl hero (heroine) | elderMara | Tell me about Sunford. | chatterbox |
| `dlg.elderMara.next.say__f` | The girl hero (heroine) | elderMara | Where should I go next? | chatterbox |
| `dlg.hero.heal__f` | The girl hero (heroine) | hero | Could you patch me up? | chatterbox |
| `dlg.hero.mana__f` | The girl hero (heroine) | hero | Do you have anything for mana? | chatterbox |
| `dlg.hero.brew__f` | The girl hero (heroine) | hero | Could you brew me something? | chatterbox |
| `dlg.sunfordHealer.potions.say__f` | The girl hero (heroine) | sunfordHealer | How do the potions work? | chatterbox |
| `dlg.goblinTrader.king.say__f` | The girl hero (heroine) | goblinTrader | How is your king? | chatterbox |
| `dlg.goblinTrader.town.say__f` | The girl hero (heroine) | goblinTrader | How do you like Sunford? | chatterbox |
| `dlg.hero.play__f` | The girl hero (heroine) | hero | Deal me in. | chatterbox |
| `dlg.sunfordGambler.rules.say__f` | The girl hero (heroine) | sunfordGambler | What are the rules? | chatterbox |
| `dlg.sunfordGambler.luck.say__f` | The girl hero (heroine) | sunfordGambler | Do you ever lose? | chatterbox |
| `dlg.sunfordCups.rules.say__f` | The girl hero (heroine) | sunfordCups | How does it work? | chatterbox |
| `dlg.sunfordCups.luck.say__f` | The girl hero (heroine) | sunfordCups | Do you ever lose? | chatterbox |
| `dlg.freedFarmers.favor.say__f` | The girl hero (heroine) | freedFarmers | Can I help with anything? | chatterbox |
| `dlg.freedFarmers.waiting.say__f` | The girl hero (heroine) | freedFarmers | About those wolves... | chatterbox |
| `dlg.freedFarmers.favorDone.say__f` | The girl hero (heroine) | freedFarmers | The wolves won't trouble you again. | chatterbox |
| `dlg.windDisciple.class.say__f` | The girl hero (heroine) | windDisciple | What does a Windrunner do? | chatterbox |
| `dlg.captainHale.quest.say__f` | The girl hero (heroine) | captainHale | How bad is it? | chatterbox |
| `dlg.captainHale.quest.2__f` | The girl hero (heroine) | captainHale | Who's paying him? | chatterbox |
| `dlg.captainHale.siege.say__f` | The girl hero (heroine) | captainHale | About the siege... | chatterbox |
| `dlg.captainHale.town.say__f` | The girl hero (heroine) | captainHale | Tell me about Oakhaven. | chatterbox |
| `dlg.captainHale.order.say__f` | The girl hero (heroine) | captainHale | Do you answer to the Iron Order? | chatterbox |
| `dlg.oakArmorer.armor.say__f` | The girl hero (heroine) | oakArmorer | What sort of armour should I wear? | chatterbox |
| `dlg.oakMasterArmorer.town.say__f` | The girl hero (heroine) | oakMasterArmorer | How's the town doing? | chatterbox |
| `dlg.trainerShadow.class.say__f` | The girl hero (heroine) | trainerShadow | What is a Shadowblade? | chatterbox |
| `dlg.trainerShadow.syndicate.say__f` | The girl hero (heroine) | trainerShadow | Who are the Ashen Syndicate? | chatterbox |
| `dlg.trainerSovereign.class.say__f` | The girl hero (heroine) | trainerSovereign | What is a Grand Sovereign? | chatterbox |
| `dlg.trainerSovereign.family.say__f` | The girl hero (heroine) | trainerSovereign | Tell me about your family. | chatterbox |
| `dlg.oakHealer.potions.say__f` | The girl hero (heroine) | oakHealer | Can I carry more potions? | chatterbox |
| `dlg.blackMarket.armor.say__f` | The girl hero (heroine) | blackMarket | Any armour for sale? | chatterbox |
| `dlg.trainerBlood.class.say__f` | The girl hero (heroine) | trainerBlood | What is a Blood Alchemist? | chatterbox |
| `dlg.trainerBlood.jars.say__f` | The girl hero (heroine) | trainerBlood | What's in the jars? | chatterbox |
| `dlg.syndicateBoss.cut.say__f` | The girl hero (heroine) | syndicateBoss | I was promised a share of Oakhaven. | chatterbox |
| `dlg.syndicateBoss.syndicate.say__f` | The girl hero (heroine) | syndicateBoss | What does the Syndicate actually want? | chatterbox |
| `dlg.syndicateBoss.order.say__f` | The girl hero (heroine) | syndicateBoss | The Iron Order is after me. | chatterbox |
| `dlg.oakGambler.rules.say__f` | The girl hero (heroine) | oakGambler | How do we play? | chatterbox |
| `dlg.oakGambler.collection.say__f` | The girl hero (heroine) | oakGambler | What do you do with it all? | chatterbox |
| `dlg.frostDisciple.class.say__f` | The girl hero (heroine) | frostDisciple | What is a Frostwarden? | chatterbox |
| `dlg.forgemaster.quest.say__f` | The girl hero (heroine) | forgemaster | What happened down in the mines? | chatterbox |
| `dlg.forgemaster.quest.2__f` | The girl hero (heroine) | forgemaster | And the golems? | chatterbox |
| `dlg.forgemaster.core.say__f` | The girl hero (heroine) | forgemaster | About the core... | chatterbox |
| `dlg.forgemaster.town.say__f` | The girl hero (heroine) | forgemaster | Tell me about Ironhold. | chatterbox |
| `dlg.ironAetherWorks.core.say__f` | The girl hero (heroine) | ironAetherWorks | What did the core teach you? | chatterbox |
| `dlg.ironArmor.quiet.say__f` | The girl hero (heroine) | ironArmor | You don't say much, do you? | chatterbox |
| `dlg.ironOrderArmor.order.say__f` | The girl hero (heroine) | ironOrderArmor | What does the Order want from me? | chatterbox |
| `dlg.trainerGeo.class.say__f` | The girl hero (heroine) | trainerGeo | What does a Geomancer do? | chatterbox |
| `dlg.trainerGeo.factions.say__f` | The girl hero (heroine) | trainerGeo | Which faction do you serve? | chatterbox |
| `dlg.trainerAether.class.say__f` | The girl hero (heroine) | trainerAether | What is an Aether-Tech? | chatterbox |
| `dlg.trainerAether.heat.say__f` | The girl hero (heroine) | trainerAether | What happens if I overheat? | chatterbox |
| `dlg.ironHealer.potions.say__f` | The girl hero (heroine) | ironHealer | Can I carry more potions? | chatterbox |
| `dlg.exiledSovereign.class.say__f` | The girl hero (heroine) | exiledSovereign | What is a Grand Sovereign? | chatterbox |
| `dlg.exiledSovereign.oakhaven.say__f` | The girl hero (heroine) | exiledSovereign | About Oakhaven... | chatterbox |
| `dlg.trainerChrono.class.say__f` | The girl hero (heroine) | trainerChrono | What is a Chrono-Weaver? | chatterbox |
| `dlg.trainerChrono.oracle.say__f` | The girl hero (heroine) | trainerChrono | Tell me about the oracle. | chatterbox |
| `dlg.freedHerbalist.favor.say__f` | The girl hero (heroine) | freedHerbalist | Is there anything I can do for you? | chatterbox |
| `dlg.freedHerbalist.waiting.say__f` | The girl hero (heroine) | freedHerbalist | About those sunpetals... | chatterbox |
| `dlg.freedHerbalist.favorDone.say__f` | The girl hero (heroine) | freedHerbalist | Here are your sunpetals. | chatterbox |
| `dlg.mayorBrenna.town.say__f` | The girl hero (heroine) | mayorBrenna | Tell me about Silverbridge. | chatterbox |
| `dlg.mayorBrenna.masters.say__f` | The girl hero (heroine) | mayorBrenna | Is there really a teacher for every class here? | chatterbox |
| `dlg.mayorBrenna.river.say__f` | The girl hero (heroine) | mayorBrenna | What do people trade here? | chatterbox |
| `dlg.sbHealer.potions.say__f` | The girl hero (heroine) | sbHealer | Any advice on potions? | chatterbox |
| `dlg.sbHealer.sleep.say__f` | The girl hero (heroine) | sbHealer | Do you ever actually sleep? | chatterbox |
| `dlg.sbAlchemist.herbs.say__f` | The girl hero (heroine) | sbAlchemist | Where do I find herbs? | chatterbox |
| `dlg.sbAlchemist.elixirs.say__f` | The girl hero (heroine) | sbAlchemist | What do the elixirs do? | chatterbox |
| `dlg.sbGambler.rules.say__f` | The girl hero (heroine) | sbGambler | How does it work? | chatterbox |
| `dlg.sbGambler.prize.say__f` | The girl hero (heroine) | sbGambler | Has anyone ever won the prize? | chatterbox |
| `dlg.sbCollector.favor.say__f` | The girl hero (heroine) | sbCollector | Do you sell anything? | chatterbox |
| `dlg.sbCollector.waiting.say__f` | The girl hero (heroine) | sbCollector | About that favour... | chatterbox |
| `dlg.sbCollector.favorDone.say__f` | The girl hero (heroine) | sbCollector | I brought your moonbells. | chatterbox |
| `dlg.sbFence.favor.say__f` | The girl hero (heroine) | sbFence | What's under the cloth? | chatterbox |
| `dlg.sbFence.waiting.say__f` | The girl hero (heroine) | sbFence | About those bandits... | chatterbox |
| `dlg.sbFence.favorDone.say__f` | The girl hero (heroine) | sbFence | The bandits are beaten, and I know who sent them. | chatterbox |
| `dlg.sbArmorer.steel.say__f` | The girl hero (heroine) | sbArmorer | What makes good armour? | chatterbox |
| `dlg.sbWeapons.blades.say__f` | The girl hero (heroine) | sbWeapons | How do I pick a good weapon? | chatterbox |
| `dlg.sbJeweler.gossip.say__f` | The girl hero (heroine) | sbJeweler | Heard any good gossip? | chatterbox |
| `dlg.sbMasterAegis.class.say__f` | The girl hero (heroine) | sbMasterAegis | What does an Aegis Knight really do? | chatterbox |
| `dlg.sbMasterAegis.bridge.say__f` | The girl hero (heroine) | sbMasterAegis | You held this bridge? | chatterbox |
| `dlg.sbMasterPyro.class.say__f` | The girl hero (heroine) | sbMasterPyro | What does a pyromancer really do? | chatterbox |
| `dlg.sbMasterPyro.sprocket.say__f` | The girl hero (heroine) | sbMasterPyro | What do you think of Professor Sprocket? | chatterbox |
| `dlg.sbMasterShadow.class.say__f` | The girl hero (heroine) | sbMasterShadow | What makes a good Shadowblade? | chatterbox |
| `dlg.sbMasterShadow.past.say__f` | The girl hero (heroine) | sbMasterShadow | How did you learn all this? | chatterbox |
| `dlg.sbMasterSovereign.class.say__f` | The girl hero (heroine) | sbMasterSovereign | What is a Grand Sovereign? | chatterbox |
| `dlg.sbMasterSovereign.please.say__f` | The girl hero (heroine) | sbMasterSovereign | Do you really say please to your guards? | chatterbox |
| `dlg.sbMasterGeo.class.say__f` | The girl hero (heroine) | sbMasterGeo | What does a Geomancer do? | chatterbox |
| `dlg.sbMasterGeo.garden.say__f` | The girl hero (heroine) | sbMasterGeo | Is that a garden made of stone? | chatterbox |
| `dlg.sbMasterAether.class.say__f` | The girl hero (heroine) | sbMasterAether | What does an Aether-Tech actually do? | chatterbox |
| `dlg.sbMasterAether.eyebrows.say__f` | The girl hero (heroine) | sbMasterAether | What happened to your eyebrows? | chatterbox |
| `dlg.sbMasterChrono.class.say__f` | The girl hero (heroine) | sbMasterChrono | What is a Chrono-Weaver? | chatterbox |
| `dlg.sbMasterChrono.keeper.say__f` | The girl hero (heroine) | sbMasterChrono | How do you know the Keeper of Hours? | chatterbox |
| `dlg.sbMasterBlood.class.say__f` | The girl hero (heroine) | sbMasterBlood | What is a Blood Alchemist, really? | chatterbox |
| `dlg.sbMasterBlood.herbs.say__f` | The girl hero (heroine) | sbMasterBlood | What are all these herbs for? | chatterbox |
| `dlg.sbMasterWindrunner.favor.say__f` | The girl hero (heroine) | sbMasterWindrunner | Do you teach archery? | chatterbox |
| `dlg.sbMasterWindrunner.waiting.say__f` | The girl hero (heroine) | sbMasterWindrunner | About your test... | chatterbox |
| `dlg.sbMasterWindrunner.favorDone.say__f` | The girl hero (heroine) | sbMasterWindrunner | The archers are beaten, and here are your swiftferns. | chatterbox |
| `dlg.sbMasterWindrunner.class.say__f` | The girl hero (heroine) | sbMasterWindrunner | What does a Windrunner do? | chatterbox |
| `dlg.sbMasterFrostwarden.favor.say__f` | The girl hero (heroine) | sbMasterFrostwarden | Is that sword made of ice? | chatterbox |
| `dlg.sbMasterFrostwarden.waiting.say__f` | The girl hero (heroine) | sbMasterFrostwarden | About your test... | chatterbox |
| `dlg.sbMasterFrostwarden.favorDone.say__f` | The girl hero (heroine) | sbMasterFrostwarden | The fire elementals are out. Here is your frostmint. | chatterbox |
| `dlg.sbMasterFrostwarden.class.say__f` | The girl hero (heroine) | sbMasterFrostwarden | What is a Frostwarden? | chatterbox |
| `dlg.sbMasterLightbringer.favor.say__f` | The girl hero (heroine) | sbMasterLightbringer | Is that lamp magic? | chatterbox |
| `dlg.sbMasterLightbringer.waiting.say__f` | The girl hero (heroine) | sbMasterLightbringer | About your test... | chatterbox |
| `dlg.sbMasterLightbringer.favorDone.say__f` | The girl hero (heroine) | sbMasterLightbringer | The cultists are beaten. Here are your sunpetals. | chatterbox |
| `dlg.sbMasterLightbringer.class.say__f` | The girl hero (heroine) | sbMasterLightbringer | What does a Lightbringer do? | chatterbox |
| `dlg.sbMasterBeastcaller.favor.say__f` | The girl hero (heroine) | sbMasterBeastcaller | Can you talk to animals? | chatterbox |
| `dlg.sbMasterBeastcaller.waiting.say__f` | The girl hero (heroine) | sbMasterBeastcaller | About your test... | chatterbox |
| `dlg.sbMasterBeastcaller.favorDone.say__f` | The girl hero (heroine) | sbMasterBeastcaller | The trails are clear, and here are your moonbells. | chatterbox |
| `dlg.sbMasterBeastcaller.class.say__f` | The girl hero (heroine) | sbMasterBeastcaller | What do you teach, exactly? | chatterbox |
| `dlg.sbMasterElementalist.class.say__f` | The girl hero (heroine) | sbMasterElementalist | What does an Elementalist do? | chatterbox |
| `dlg.sbMasterElementalist.sleeve.say__f` | The girl hero (heroine) | sbMasterElementalist | Um, your sleeve is on fire. | chatterbox |
| `dlg.sbMasterSoulwarden.class.say__f` | The girl hero (heroine) | sbMasterSoulwarden | What does a Soul Warden do? | chatterbox |
| `dlg.sbMasterSoulwarden.wisps.say__f` | The girl hero (heroine) | sbMasterSoulwarden | Are the little lights in your lantern alive? | chatterbox |
| `dlg.sbMasterIronmonk.class.say__f` | The girl hero (heroine) | sbMasterIronmonk | What is an Iron Monk? | chatterbox |
| `dlg.sbMasterIronmonk.noodles.say__f` | The girl hero (heroine) | sbMasterIronmonk | Is that a bowl of noodles? | chatterbox |
| `dlg.sbMasterBard.class.say__f` | The girl hero (heroine) | sbMasterBard | What does a Bard do? | chatterbox |
| `dlg.sbMasterBard.story.say__f` | The girl hero (heroine) | sbMasterBard | Will you tell me a story? | chatterbox |
| `dlg.quest.goblinKing.slay.say__f` | The girl hero (heroine) | quest.goblinKing | No deals. Your raids end here. | chatterbox |
| `dlg.quest.goblinKing.slay.1__f` | The girl hero, telling the story (heroine) | quest.goblinKing | The Goblin King falls, and the Hollows empty. | chatterbox |
| `dlg.quest.goblinKing.slay.2__f` | The girl hero, telling the story (heroine) | quest.goblinKing | Sunford sleeps easier, and the Iron Order hears your name. | chatterbox |
| `dlg.quest.goblinKing.pact.say__f` | The girl hero (heroine) | quest.goblinKing | Stop the raids and trade with Sunford instead. Swear to it. | chatterbox |
| `dlg.quest.goblinKing.pact.2__f` | The girl hero, telling the story (heroine) | quest.goblinKing | Goblin traders set up in Sunford's square, selling things no smith there could make. | chatterbox |
| `dlg.quest.goblinKing.ransom.say__f` | The girl hero (heroine) | quest.goblinKing | Give me your treasure and you can keep your crown. | chatterbox |
| `dlg.quest.goblinKing.ransom.2__f` | The girl hero, telling the story (heroine) | quest.goblinKing | You leave with goblin gold. The raids will start again, but the Syndicate approves. | chatterbox |
| `dlg.quest.siege.defend.say__f` | The girl hero (heroine) | quest.siege | The gate stays shut. Take your army and go. | chatterbox |
| `dlg.quest.siege.defend.2__f` | The girl hero, telling the story (heroine) | quest.siege | The gate holds. Oakhaven grows rich behind it, and its armourers remember your name. | chatterbox |
| `dlg.quest.siege.betray.say__f` | The girl hero (heroine) | quest.siege | A third of the town. All right. The gate opens tonight. | chatterbox |
| `dlg.quest.siege.betray.2__f` | The girl hero, telling the story (heroine) | quest.siege | Oakhaven burns. In the ruins, a black market opens, and an alchemist teaches in secret. | chatterbox |
| `dlg.quest.siege.betray.3__f` | The girl hero, telling the story (heroine) | quest.siege | The armourers are gone, and the Iron Order calls you a traitor. | chatterbox |
| `dlg.quest.core.destroy.say__f` | The girl hero (heroine) | quest.core | Stand back. I'm going to break it. | chatterbox |
| `dlg.quest.core.destroy.1__f` | The girl hero, telling the story (heroine) | quest.core | The light goes out, and the golems drop where they stand. | chatterbox |
| `dlg.quest.core.destroy.2__f` | The girl hero, telling the story (heroine) | quest.core | In thanks, the Iron Order sends its own armourers to Ironhold. | chatterbox |
| `dlg.quest.core.study.say__f` | The girl hero (heroine) | quest.core | The Circle should study it. I think I can carry it out safely. | chatterbox |
| `dlg.quest.core.study.1__f` | The girl hero, telling the story (heroine) | quest.core | You know enough to move the core without waking it. | chatterbox |
| `dlg.quest.core.study.2__f` | The girl hero, telling the story (heroine) | quest.core | Within a season, Ironhold's forges are making aether-works no one has seen before. | chatterbox |
| `dlg.quest.core.sell.say__f` | The girl hero (heroine) | quest.core | The Syndicate made the best offer. | chatterbox |
| `dlg.quest.core.sell.2__f` | The girl hero, telling the story (heroine) | quest.core | A fortune changes hands. The core stays lit, and the mines will never be quiet again. | chatterbox |
| `dlg.quest.oracle.free.say__f` | The girl hero (heroine) | quest.oracle | Hold still. I'm breaking your chains. | chatterbox |
| `dlg.quest.oracle.free.2__f` | The girl hero, telling the story (heroine) | quest.oracle | The oracle rises through the water and is gone. Her pupil stays behind to teach. | chatterbox |
| `dlg.quest.oracle.slay.say__f` | The girl hero (heroine) | quest.oracle | I came for the hourglass. | chatterbox |
| `dlg.quest.oracle.slay.2__f` | The girl hero, telling the story (heroine) | quest.oracle | She doesn't resist. The Timekeeper's Hourglass is yours. | chatterbox |
| `dlg.quest.oracle.slay.3__f` | The girl hero, telling the story (heroine) | quest.oracle | Her last pupil flees the temple, and the Circle won't forgive you. | chatterbox |
| `dlg.quest.dragon.slay.say__f` | The girl hero (heroine) | quest.dragon | I don't bargain with dragons. | chatterbox |
| `dlg.quest.dragon.slay.1__f` | The girl hero, telling the story (heroine) | quest.dragon | The mountain shakes as the dragon falls. Its hoard is yours. | chatterbox |
| `dlg.quest.dragon.slay.2__f` | The girl hero, telling the story (heroine) | quest.dragon | The Iron Order sings of the dragonslayer. | chatterbox |
| `dlg.quest.dragon.pact.say__f` | The girl hero (heroine) | quest.dragon | Then fight with me against the Arch-Demon. | chatterbox |
| `dlg.quest.dragon.pact.2__f` | The girl hero, telling the story (heroine) | quest.dragon | When you march on the Dread Fortress, a dragon will fly above you. | chatterbox |
| `dlg.quest.throne.order.say__f` | The girl hero (heroine) | quest.throne | The Iron Order will hold it. | chatterbox |
| `dlg.quest.throne.order.1__f` | The girl hero, telling the story (heroine) | quest.throne | The Order garrisons the fortress and seals what it can. | chatterbox |
| `dlg.quest.throne.order.2__f` | The girl hero, telling the story (heroine) | quest.throne | The realm will be safe, and it will be told what to do. | chatterbox |
| `dlg.quest.throne.syndicate.say__f` | The girl hero (heroine) | quest.throne | The Ashen Syndicate has earned it. | chatterbox |
| `dlg.quest.throne.syndicate.1__f` | The girl hero, telling the story (heroine) | quest.throne | The Syndicate moves in before dawn. | chatterbox |
| `dlg.quest.throne.syndicate.2__f` | The girl hero, telling the story (heroine) | quest.throne | From now on everything has a price, even the peace. | chatterbox |
| `dlg.quest.throne.circle.say__f` | The girl hero (heroine) | quest.throne | Let the Circle of Aether have it. | chatterbox |
| `dlg.quest.throne.circle.1__f` | The girl hero, telling the story (heroine) | quest.throne | The Circle turns the fortress into a school above the rift. | chatterbox |
| `dlg.quest.throne.circle.2__f` | The girl hero, telling the story (heroine) | quest.throne | They call it research. Everyone else holds their breath. | chatterbox |
| `dlg.quest.throne.shatter.say__f` | The girl hero (heroine) | quest.throne | No one gets it. I'm breaking it. | chatterbox |
| `dlg.quest.throne.shatter.1__f` | The girl hero, telling the story (heroine) | quest.throne | You break the throne with your own hands. No one will rule from here again. | chatterbox |
| `dlg.quest.throne.shatter.2__f` | The girl hero, telling the story (heroine) | quest.throne | The envoys leave without a word. | chatterbox |
| `dlg.quest.throne.claim.say__f` | The girl hero (heroine) | quest.throne | I'll take it myself. | chatterbox |
| `dlg.quest.throne.claim.1__f` | The girl hero, telling the story (heroine) | quest.throne | The throne is cold, and it fits. | chatterbox |
| `dlg.quest.throne.claim.2__f` | The girl hero, telling the story (heroine) | quest.throne | Three factions discover they have a common enemy. | chatterbox |
| `dlg.hero.siege__f` | The girl hero (heroine) | hero | Let's man the walls. | chatterbox |
| `dlg.fortHale.fort.say__f` | The girl hero (heroine) | fortHale | What is this place? | chatterbox |
| `dlg.fortMara.town.say__f` | The girl hero (heroine) | fortMara | What happened to Sunford? | chatterbox |
| `dlg.quest.seal.seal.say__f` | The girl hero (heroine) | quest.seal | Seal it. Forever. | chatterbox |
| `dlg.quest.seal.ajar.say__f` | The girl hero (heroine) | quest.seal | Leave it ajar. We'll be ready. | chatterbox |
| `dlg.mysteriousWanderer.trial.say__f` | The girl hero (heroine) | mysteriousWanderer | What trials do you mean? | chatterbox |
| `ending.order.text__f` | The girl hero, telling the story (heroine) | ending | Banners of the Iron Order fly over the Dread Fortress. The roads are safe, the laws are many, and your name is carved above the gate. | chatterbox |
| `ending.syndicate.text__f` | The girl hero, telling the story (heroine) | ending | The Syndicate rules from the shadows of the fortress. Nothing in the realm is forbidden any more. It is only expensive. | chatterbox |
| `ending.circle.text__f` | The girl hero, telling the story (heroine) | ending | The Circle lights the fortress with captured void-fire. Wonders pour out of its gates, and no one asks what they cost. | chatterbox |
| `ending.free.text__f` | The girl hero, telling the story (heroine) | ending | The throne lies in pieces and the fortress stands empty. For the first time in an age, the realm belongs to the people who live in it. | chatterbox |
| `ending.unbound.text__f` | The girl hero, telling the story (heroine) | ending | You took the throne. Order, Syndicate and Circle march against you together. Let them come. | chatterbox |
| `ending.note.goblinPact__f` | The girl hero, telling the story (heroine) | ending | Goblin traders still haggle in Sunford's square. | chatterbox |
| `ending.note.goblinSlain__f` | The girl hero, telling the story (heroine) | ending | The Hollows stand empty, and the caravans run on time. | chatterbox |
| `ending.note.goblinRansom__f` | The girl hero, telling the story (heroine) | ending | The Goblin King is rich again, and raiding again. | chatterbox |
| `ending.note.oakhavenSaved__f` | The girl hero, telling the story (heroine) | ending | Oakhaven's walls are taller now, and its markets fuller. | chatterbox |
| `ending.note.oakhavenFallen__f` | The girl hero, telling the story (heroine) | ending | Weeds grow through Oakhaven's streets. The black market thrives. | chatterbox |
| `ending.note.coreOrder__f` | The girl hero, telling the story (heroine) | ending | The mines of Ironhold are quiet, and the dwarves dig again. | chatterbox |
| `ending.note.coreCircle__f` | The girl hero, telling the story (heroine) | ending | Ironhold's forges glow blue, and its guns are the best in the realm. | chatterbox |
| `ending.note.coreSold__f` | The girl hero, telling the story (heroine) | ending | Somewhere, the core still hums. The golems still walk. | chatterbox |
| `ending.note.oracleFreed__f` | The girl hero, telling the story (heroine) | ending | On calm days, fishermen see the oracle far out on the water. | chatterbox |
| `ending.note.oracleSlain__f` | The girl hero, telling the story (heroine) | ending | The Sunken Temple is silent. No one knows what comes next any more. | chatterbox |
| `ending.note.dragonPact__f` | The girl hero, telling the story (heroine) | ending | A dragon nests on the fortress roof, and answers to one name only. | chatterbox |
| `ending.note.dragonSlain__f` | The girl hero, telling the story (heroine) | ending | A dragon's skull hangs in the Order's great hall. | chatterbox |
| `ending.more__f` | The girl hero, telling the story (heroine) | ending | The Void Rift has opened beneath the fortress. But the true test of your power waits in the Colosseum: climb its waves, and win the mythic prizes only its champions hold. | chatterbox |
