# Voice-over to-do

Generated from data/voice-manifest.json, the voice files and
vo-src/shipped.json by `pnpm voice:script`; every `pnpm voice:gen` run
rewrites it, and a test fails when it is stale. Do not edit by hand.

- **Files:** `public/audio/voice/en/<id>.ogg`. Every language plays the
  English recording under its own subtitle; a line with no file is
  text-paced.
- **Stale** means the line's text changed after it was voiced: the next
  `voice:gen` run voices it again.
- **Make the missing and stale ones:** `pnpm voice:manifest`, `pnpm
  voice:collect`, then `node --experimental-strip-types --no-warnings
  tools/voice/generate.mjs --engine chatterbox` (it voices only what is
  missing or stale), then `--retry 2` for the ones that fail QA.

| Voice | Lines | EN voiced |
| --- | --- | --- |
| hero | 121 | 121 |
| sunfordSmith | 19 | 19 |
| sunfordPeddler | 15 | 15 |
| trainerAegis | 18 | 18 |
| trainerPyro | 15 | 15 |
| elderMara | 25 | 25 |
| sunfordHealer | 12 | 12 |
| goblinTrader | 11 | 11 |
| captainHale | 18 | 18 |
| oakArmorer | 20 | 20 |
| oakWeapons | 10 | 10 |
| trainerShadow | 15 | 15 |
| trainerSovereign | 29 | 29 |
| oakHealer | 11 | 11 |
| blackMarket | 11 | 11 |
| trainerBlood | 16 | 16 |
| syndicateBoss | 15 | 15 |
| forgemaster | 23 | 23 |
| ironWeapons | 10 | 10 |
| ironAetherWorks | 8 | 8 |
| ironArmor | 8 | 8 |
| ironOrderArmor | 10 | 10 |
| trainerGeo | 14 | 14 |
| trainerAether | 16 | 16 |
| ironHealer | 12 | 12 |
| trainerChrono | 19 | 19 |
| goblinKing | 9 | 9 |
| warlord | 5 | 5 |
| oracle | 5 | 5 |
| dragon | 6 | 6 |
| archDemon | 5 | 5 |
| smalltalkSunford | 13 | 13 |
| townsfolk | 25 | 25 |
| smalltalkOakhaven | 13 | 13 |
| smalltalkIronhold | 9 | 9 |
| smalltalkKids | 6 | 6 |
| kidFriend | 4 | 4 |
| frostJarl | 2 | 2 |
| heroine | 121 | 121 |
| **All** | **724** | **724** |

## To do (0)

Nothing: every line has its recording.

## Every line (724)

| File | Who | Scene | English | EN |
| --- | --- | --- | --- | --- |
| `dlg.hero.bye` | The hero (hero) | hero | I'll let you get on. | chatterbox |
| `dlg.sunfordSmith.hello.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Haven't seen you before. You're the one who cleared the road? | chatterbox |
| `dlg.sunfordSmith.hello.2` | Bram the Smith (sunfordSmith) | sunfordSmith | Bram. I keep the forge. If you need a blade, come to me. | chatterbox |
| `dlg.sunfordSmith.kingDead.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Heard the Goblin King's dead. Can't say I'll miss him. | chatterbox |
| `dlg.sunfordSmith.kingPact.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Goblins trading in the square now. Never thought I'd see it. | chatterbox |
| `dlg.sunfordSmith.kingRansom.1` | Bram the Smith (sunfordSmith) | sunfordSmith | You let the Goblin King keep his crown. He'll be back, you know. | chatterbox |
| `dlg.sunfordSmith.ending.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Whole realm's talking about you. Still need a whetstone, though? | chatterbox |
| `dlg.sunfordSmith.again.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Back again. What can I do for you? | chatterbox |
| `dlg.hero.trade` | The hero (hero) | hero | Can I see what you've got? | chatterbox |
| `dlg.sunfordSmith.trade.1` | Bram the Smith (sunfordSmith) | sunfordSmith | Plain steel, fair prices. Have a look. | chatterbox |
| `dlg.hero.who` | The hero (hero) | hero | Who are you, if you don't mind me asking? | chatterbox |
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
| `dlg.hero.train` | The hero (hero) | hero | Will you teach me? | chatterbox |
| `dlg.trainerAegis.train.1` | Ser Aldric (trainerAegis) | trainerAegis | Good. Watch closely, I'll only show you once. | chatterbox |
| `dlg.trainerAegis.class.say` | The hero (hero) | trainerAegis | What does an Aegis Knight actually do? | chatterbox |
| `dlg.trainerAegis.class.1` | Ser Aldric (trainerAegis) | trainerAegis | We take the blows meant for others. It's simple, and it's hard. | chatterbox |
| `dlg.trainerAegis.class.2` | Ser Aldric (trainerAegis) | trainerAegis | You'll need Strength for the shield and Endurance to keep it up. | chatterbox |
| `dlg.hero.ready` | The hero (hero) | hero | Do you think I'm ready for more? | chatterbox |
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
| `dlg.elderMara.hello.1` | Elder Mara (elderMara) | elderMara | So you're the one from the road. Come here, let me look at you. | chatterbox |
| `dlg.elderMara.hello.2` | Elder Mara (elderMara) | elderMara | I'm Mara. I've looked after this town for... oh, forty years now. | chatterbox |
| `dlg.elderMara.slain.1` | Elder Mara (elderMara) | elderMara | The Hollows are quiet. It was a hard thing you did, but we sleep because of it. | chatterbox |
| `dlg.elderMara.pact.1` | Elder Mara (elderMara) | elderMara | Goblins selling things in my square. You talked them into that, didn't you? | chatterbox |
| `dlg.elderMara.ransom.1` | Elder Mara (elderMara) | elderMara | You took his gold and left him his crown. I won't pretend I'm not disappointed. | chatterbox |
| `dlg.elderMara.saved.1` | Elder Mara (elderMara) | elderMara | Word came from Oakhaven. The gate held. I'm glad you were there. | chatterbox |
| `dlg.elderMara.fallen.1` | Elder Mara (elderMara) | elderMara | Oakhaven burned, they say. I'd rather not hear how. Not today. | chatterbox |
| `dlg.elderMara.ending.1` | Elder Mara (elderMara) | elderMara | They say you decided the fate of the Dread Fortress. From our little road to that. | chatterbox |
| `dlg.elderMara.again.1` | Elder Mara (elderMara) | elderMara | Sit for a moment. The road will still be there. | chatterbox |
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
| `dlg.sunfordHealer.potions.say` | The hero (hero) | sunfordHealer | How do the potions work? | chatterbox |
| `dlg.sunfordHealer.potions.1` | Sister Lune (sunfordHealer) | sunfordHealer | You take a few flasks into every fight. Drink before you need to, not after. | chatterbox |
| `dlg.sunfordHealer.potions.2` | Sister Lune (sunfordHealer) | sunfordHealer | If you want to carry more, I can sell you a bigger belt. | chatterbox |
| `dlg.sunfordHealer.rumor.goblins.1` | Sister Lune (sunfordHealer) | sunfordHealer | The goblins coat their sling stones in something. If you feel sick, come back. | chatterbox |
| `dlg.sunfordHealer.rumor.spiders.1` | Sister Lune (sunfordHealer) | sunfordHealer | I've treated three spider bites from the Woods this week. Watch your step there. | chatterbox |
| `dlg.sunfordHealer.rumor.burns.1` | Sister Lune (sunfordHealer) | sunfordHealer | Soldiers keep coming down from the north with burns. The Ashen Crags, they say. | chatterbox |
| `dlg.sunfordHealer.healBack.1` | Sister Lune (sunfordHealer) | sunfordHealer | Keep your belt full and your head down. | chatterbox |
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
| `dlg.oakArmorer.who.1` | Odo the Armorer (oakArmorer) | oakArmorer | I've armoured this town for twenty years. Never seen all of it worn at once. | chatterbox |
| `dlg.oakArmorer.armor.say` | The hero (hero) | oakArmorer | What sort of armour should I wear? | chatterbox |
| `dlg.oakArmorer.armor.1` | Odo the Armorer (oakArmorer) | oakArmorer | Plate, if you stand your ground. Leather, if you keep moving. Robes, if you're quick. | chatterbox |
| `dlg.oakArmorer.rumor.backRoom.1` | Odo the Armorer (oakArmorer) | oakArmorer | If the siege breaks, I'll open the back room. The good plate's in there. | chatterbox |
| `dlg.oakArmorer.shopBack.1` | Odo the Armorer (oakArmorer) | oakArmorer | It'll hold. It's held so far. | chatterbox |
| `dlg.oakArmorer.bye.1` | Odo the Armorer (oakArmorer) | oakArmorer | Keep your head down out there. | chatterbox |
| `dlg.oakMasterArmorer.hello.1` | Master Odo (oakArmorer) | oakMasterArmorer | There you are! Come in. The back room's open, and it's open for you. | chatterbox |
| `dlg.oakMasterArmorer.hello.2` | Master Odo (oakArmorer) | oakMasterArmorer | Master Odo, they call me now. Funny what a little peace does for business. | chatterbox |
| `dlg.oakMasterArmorer.ending.1` | Master Odo (oakArmorer) | oakMasterArmorer | From our gate to the Dread Fortress. I tell everyone I fitted your armour. | chatterbox |
| `dlg.oakMasterArmorer.again.1` | Master Odo (oakArmorer) | oakMasterArmorer | Good to see you. What'll it be today? | chatterbox |
| `dlg.oakMasterArmorer.trade.1` | Master Odo (oakArmorer) | oakMasterArmorer | The good plate's out. You've more than earned a look at it. | chatterbox |
| `dlg.oakMasterArmorer.town.say` | The hero (hero) | oakMasterArmorer | How's the town doing? | chatterbox |
| `dlg.oakMasterArmorer.town.1` | Master Odo (oakArmorer) | oakMasterArmorer | Busy. Loud. Full of merchants grumbling about the toll. | chatterbox |
| `dlg.oakMasterArmorer.town.2` | Master Odo (oakArmorer) | oakMasterArmorer | It's wonderful. I haven't had a quiet hour in weeks. | chatterbox |
| `dlg.oakMasterArmorer.rumor.mines.1` | Master Odo (oakArmorer) | oakMasterArmorer | My steel comes from Ironhold, and they've gone quiet. Someone should check their mines. | chatterbox |
| `dlg.oakMasterArmorer.rumor.tundra.1` | Master Odo (oakArmorer) | oakMasterArmorer | Best ore I ever worked came out of the tundra. The men who found it didn't go back. | chatterbox |
| `dlg.oakMasterArmorer.shopBack.1` | Master Odo (oakArmorer) | oakMasterArmorer | If it doesn't sit right, bring it back. I'll fix it. | chatterbox |
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
| `dlg.ironWeapons.who.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | My mother forged for kings. I forge for whoever comes through the door. | chatterbox |
| `dlg.ironWeapons.rumor.golems.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | Those golems down there are made of our own iron. It stings, I'll tell you. | chatterbox |
| `dlg.ironWeapons.rumor.arm.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | A good blade does half the work. Your Strength has to do the rest. | chatterbox |
| `dlg.ironWeapons.shopBack.1` | Hilda Hammerhand (ironWeapons) | ironWeapons | Bring it back blunt and I'll know you've used it well. | chatterbox |
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
| `dlg.ironArmor.quiet.say` | The hero (hero) | ironArmor | You don't say much, do you? | chatterbox |
| `dlg.ironArmor.quiet.1` | Garrun Ironside (ironArmor) | ironArmor | Not much worth saying. | chatterbox |
| `dlg.ironArmor.rumor.giants.1` | Garrun Ironside (ironArmor) | ironArmor | Giants in the tundra. Clubs like tree trunks. I'd take the heavy plate. | chatterbox |
| `dlg.ironArmor.rumor.demons.1` | Garrun Ironside (ironArmor) | ironArmor | Demons up north. Fire and claws. I'd take the heavy plate. | chatterbox |
| `dlg.ironArmor.shopBack.1` | Garrun Ironside (ironArmor) | ironArmor | Good choice. | chatterbox |
| `dlg.ironArmor.bye.1` | Garrun Ironside (ironArmor) | ironArmor | Take care. | chatterbox |
| `dlg.ironOrderArmor.hello.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | You're the one who destroyed the core. The Order remembers that. | chatterbox |
| `dlg.ironOrderArmor.hello.2` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | I'm the Order's quartermaster here. Our armouries are open to you. | chatterbox |
| `dlg.ironOrderArmor.throneOurs.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | The Order holds the Dread Fortress, thanks to you. At ease. You've earned it. | chatterbox |
| `dlg.ironOrderArmor.foe.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | The Order has you on a list. My orders say to sell to you anyway. I'll follow them. | chatterbox |
| `dlg.ironOrderArmor.again.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | What do you need? | chatterbox |
| `dlg.ironOrderArmor.trade.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | Take what you need. The Order looks after its own. | chatterbox |
| `dlg.ironOrderArmor.order.say` | The hero (hero) | ironOrderArmor | What does the Order want from me? | chatterbox |
| `dlg.ironOrderArmor.order.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | Nothing, for now. That doesn't happen often. Enjoy it. | chatterbox |
| `dlg.ironOrderArmor.rumor.throne.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | The Order will want the throne in the Dread Fortress. It'll remember who helped. | chatterbox |
| `dlg.ironOrderArmor.shopBack.1` | Order Quartermaster (ironOrderArmor) | ironOrderArmor | Look after it. It's Order property until you've bled in it. | chatterbox |
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
| `ending.more` | The hero, telling the story (hero) | ending | The Void Rift has opened beneath the fortress. The Colosseum still takes all comers. | chatterbox |
| `dlg.hero.bye__f` | The girl hero (heroine) | hero | I'll let you get on. | chatterbox |
| `dlg.hero.trade__f` | The girl hero (heroine) | hero | Can I see what you've got? | chatterbox |
| `dlg.hero.who__f` | The girl hero (heroine) | hero | Who are you, if you don't mind me asking? | chatterbox |
| `dlg.sunfordSmith.gear.say__f` | The girl hero (heroine) | sunfordSmith | What should I take with me out there? | chatterbox |
| `dlg.hero.rumor__f` | The girl hero (heroine) | hero | Heard anything lately? | chatterbox |
| `dlg.sunfordPeddler.trinkets.say__f` | The girl hero (heroine) | sunfordPeddler | What are trinkets actually good for? | chatterbox |
| `dlg.sunfordPeddler.stolen.say__f` | The girl hero (heroine) | sunfordPeddler | Where did all this come from, really? | chatterbox |
| `dlg.hero.train__f` | The girl hero (heroine) | hero | Will you teach me? | chatterbox |
| `dlg.trainerAegis.class.say__f` | The girl hero (heroine) | trainerAegis | What does an Aegis Knight actually do? | chatterbox |
| `dlg.hero.ready__f` | The girl hero (heroine) | hero | Do you think I'm ready for more? | chatterbox |
| `dlg.trainerAegis.order.say__f` | The girl hero (heroine) | trainerAegis | Tell me about the Iron Order. | chatterbox |
| `dlg.trainerPyro.class.say__f` | The girl hero (heroine) | trainerPyro | What does a pyromancer do, exactly? | chatterbox |
| `dlg.trainerPyro.circle.say__f` | The girl hero (heroine) | trainerPyro | Who are the Circle of Aether? | chatterbox |
| `dlg.elderMara.reward.say__f` | The girl hero (heroine) | elderMara | Someone said you wanted to see me? | chatterbox |
| `dlg.elderMara.quest.say__f` | The girl hero (heroine) | elderMara | What's troubling Sunford? | chatterbox |
| `dlg.elderMara.quest.2__f` | The girl hero (heroine) | elderMara | And you want him dead? | chatterbox |
| `dlg.elderMara.king.say__f` | The girl hero (heroine) | elderMara | About the Goblin King... | chatterbox |
| `dlg.elderMara.town.say__f` | The girl hero (heroine) | elderMara | Tell me about Sunford. | chatterbox |
| `dlg.elderMara.next.say__f` | The girl hero (heroine) | elderMara | Where should I go next? | chatterbox |
| `dlg.hero.heal__f` | The girl hero (heroine) | hero | Could you patch me up? | chatterbox |
| `dlg.hero.mana__f` | The girl hero (heroine) | hero | Do you have anything for mana? | chatterbox |
| `dlg.sunfordHealer.potions.say__f` | The girl hero (heroine) | sunfordHealer | How do the potions work? | chatterbox |
| `dlg.goblinTrader.king.say__f` | The girl hero (heroine) | goblinTrader | How is your king? | chatterbox |
| `dlg.goblinTrader.town.say__f` | The girl hero (heroine) | goblinTrader | How do you like Sunford? | chatterbox |
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
| `ending.more__f` | The girl hero, telling the story (heroine) | ending | The Void Rift has opened beneath the fortress. The Colosseum still takes all comers. | chatterbox |
