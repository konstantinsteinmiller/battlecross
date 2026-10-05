/**
 * ─── Voice cards ─────────────────────────────────────────────────────────────
 *
 * How every speaker of data/voice-manifest.json sounds, for the voice-over
 * pipeline (`tools/voice/`, `pnpm voice:*`) only: the game never imports it.
 * Pure data and pure functions with no imports, so Node reads it with its own
 * type stripping.
 *
 * A card describes a voice the way a voice-design model takes it (Qwen3
 * VoiceDesign): a clean, natural HUMAN voice. The model designs it ONCE,
 * reading `referenceText`, and every line is then cloned from that frozen clip
 * (`vo-src/refs/<voice>/en.qwen.wav`), so a speaker sounds the same in every
 * line. The few creatures (goblins, the dragon, the arch-demon) get a light
 * effect afterwards from their FX chain (`tools/voice/fx.mjs`), never from the
 * model. The players are 10–15: every voice is clear and friendly to the ear,
 * the villains theatrical rather than frightening, the accent neutral English.
 *
 * A line's delivery comes from its `emotion` in the manifest: a direction in
 * words (`directionOf`) and one tone word (`toneOf`) for engines that steer by
 * a knob (Chatterbox's exaggeration).
 */

export const TONES_LIST = ['neutral', 'calm', 'warm', 'cheeky', 'excited', 'urgent', 'shout', 'whisper', 'menacing', 'sad', 'deadpan', 'pained', 'laugh'] as const
export type Tone = typeof TONES_LIST[number]

export interface VoiceCard {
  name: string
  gender: 'female' | 'male'
  age: string
  pitch: 'low' | 'mid-low' | 'mid' | 'mid-high' | 'high'
  pace: 'slow' | 'measured' | 'medium' | 'brisk' | 'fast'
  timbre: string
  personality: string
  accent: { en: string }
  /** What the voice-design model is told: a clean human voice, no effects. */
  designPrompt: { en: string }
  /** About 10–14 s, read in character but neutral, for the reference clip. */
  referenceText: { en: string }
  notes: string
}

/** Every card ends with this, so no reference clip brings a room or noise into the clones. */
const STUDIO = 'Clean, close-miked studio recording, no reverb, no background noise.'
const NEUTRAL = 'Neutral, clear English'

const card = (c: Omit<VoiceCard, 'accent' | 'designPrompt' | 'referenceText'> & { accent?: string; design: string; reference: string }): VoiceCard => ({
  name: c.name,
  gender: c.gender,
  age: c.age,
  pitch: c.pitch,
  pace: c.pace,
  timbre: c.timbre,
  personality: c.personality,
  accent: { en: c.accent ?? NEUTRAL },
  designPrompt: { en: `${c.design} ${STUDIO}` },
  referenceText: { en: c.reference },
  notes: c.notes
})

export const CARDS: Readonly<Record<string, VoiceCard>> = {
  // ── The player ──
  hero: card({
    name: 'The hero (boy)', gender: 'male', age: 'about 13', pitch: 'mid-high', pace: 'medium',
    timbre: 'bright, clear young voice that has not broken yet',
    personality: 'A friendly, brave boy on his first big adventure: polite, curious, quick to help, never cocky.',
    design: 'A thirteen-year-old boy whose voice has not broken yet: bright, clear and friendly, with a brave, eager energy. He speaks naturally and politely, curious about everyone he meets.',
    reference: "Hello! I'm new around here, but I cleared the road on my way in. If anyone needs help, I'm happy to lend a hand. Can you tell me where to find the blacksmith?",
    notes: 'Every line of his also has a girl take (heroine). Never cartoonish, never an adult doing a kid.'
  }),
  heroine: card({
    name: 'The hero (girl)', gender: 'female', age: 'about 13', pitch: 'mid-high', pace: 'medium',
    timbre: 'warm, clear young girl\'s voice',
    personality: 'A warm, determined girl on her first big adventure: kind, curious, steady when it counts.',
    design: 'A thirteen-year-old girl with a warm, clear voice and a calm, determined confidence. Friendly and curious, she speaks naturally and kindly, never squeaky.',
    reference: "Hello! I'm new around here, but I cleared the road on my way in. If anyone needs help, I'm happy to lend a hand. Can you tell me where to find the blacksmith?",
    notes: 'Says the same lines as the hero (`__f` takes): the same reference text keeps the two comparable.'
  }),
  narrator: card({
    name: 'The storyteller', gender: 'female', age: 'mid 40s', pitch: 'mid-low', pace: 'measured',
    timbre: 'warm, rounded storyteller\'s alto',
    personality: 'Tells what the hero\'s choices did to the world, like reading a good book aloud.',
    design: 'A woman in her mid forties with a warm, rounded alto, telling a story aloud to children at a measured pace. Gentle, clear and engaging.',
    reference: 'The road wound north past the old mill, and the town of Sunford woke to the sound of hammers. Somewhere beyond the hills, a choice was waiting, and nobody yet knew who would make it.',
    notes: 'Kept while the manifest still has storyteller lines (they are moving to the hero voices).'
  }),

  // ── Sunford ──
  sunfordSmith: card({
    name: 'Bram the Smith', gender: 'male', age: 'early 50s', pitch: 'low', pace: 'measured',
    timbre: 'deep, gravelly baritone',
    personality: 'A gruff village blacksmith of few words with a good heart under the soot.',
    design: 'A man in his early fifties with a deep, slightly gravelly baritone. A gruff, practical village blacksmith: short sentences, dry, kind underneath.',
    reference: 'Bram. I keep the forge here. Blades, axes, a horseshoe if you ask nicely. Mind the sparks, and do not touch the anvil while it is still hot.',
    notes: 'Gruff, never angry.'
  }),
  sunfordPeddler: card({
    name: 'Tilly the Peddler', gender: 'female', age: 'mid 20s', pitch: 'mid-high', pace: 'brisk',
    timbre: 'bright, chatty soprano',
    personality: 'A cheerful travelling trinket seller, chatty and a little anxious about her rival.',
    design: 'A woman in her mid twenties with a bright, lively voice, chatty and cheerful, talking a little fast like a friendly market trader.',
    reference: "Oh, hello! Rings, charms, bits and pieces from all over. That one's lucky, probably. Have a look, take your time, and tell me if anything catches your eye!",
    notes: ''
  }),
  elderMara: card({
    name: 'Elder Mara', gender: 'female', age: 'about 70', pitch: 'mid', pace: 'slow',
    timbre: 'soft, slightly crackly older voice, warm',
    personality: 'The town\'s grandmother: warm, wise, gently teasing, honest when disappointed.',
    design: 'A woman of about seventy with a soft, warm voice and a slight age crackle. Kind and wise like a beloved grandmother, speaking slowly with a gentle smile.',
    reference: "Come here, let me look at you. I've looked after this town for forty years now, and I can tell a good heart when I see one. Sit down, have some tea, and tell me about the road.",
    notes: ''
  }),
  sunfordHealer: card({
    name: 'Sister Lune', gender: 'female', age: 'early 30s', pitch: 'mid', pace: 'medium',
    timbre: 'gentle, soft and clear',
    personality: 'A kind village healer, caring by habit, quietly funny.',
    design: 'A woman in her early thirties with a gentle, soft and clear voice. Caring and calm like a kind nurse, with a quiet sense of humour.',
    reference: "Hold still a moment. There, you're fine. Sit, rest a while, and I'll fill your flasks before you go. Drink before you need to, not after.",
    notes: ''
  }),
  goblinTrader: card({
    name: 'Grik the Trader', gender: 'male', age: 'adult goblin', pitch: 'mid-high', pace: 'measured',
    timbre: 'slightly raspy, nasal tenor',
    personality: 'A polite, earnest goblin trader in simple, careful sentences; proud of his family\'s work.',
    design: 'A small man with a slightly raspy, nasal tenor voice, speaking simply and carefully, polite and earnest, a little shy.',
    reference: 'I am Grik. I sell what goblins make. Good work, fair price. Look, please. My family made these. People still stare, but the baker gives me pie. I like the pie.',
    notes: 'Light goblin FX (fx.mjs): a little pitch up and a nasal edge.'
  }),

  // ── Oakhaven ──
  trainerAegis: card({
    name: 'Ser Aldric', gender: 'male', age: 'mid 40s', pitch: 'mid-low', pace: 'measured',
    timbre: 'firm, resonant baritone',
    personality: 'An upright knight of the Iron Order: strict, honourable, fair even to those he dislikes.',
    design: 'A man in his mid forties with a firm, resonant baritone. An upright, honourable knight: strict and clear, every word deliberate.',
    reference: 'Stand up straight. I teach people to stand between others and harm. Raise your shield, plant your feet, and do not step back until the ones behind you are safe.',
    notes: ''
  }),
  trainerPyro: card({
    name: 'Ember Wren', gender: 'female', age: 'late 20s', pitch: 'mid-high', pace: 'brisk',
    timbre: 'bright, bubbly voice',
    personality: 'An enthusiastic fire mage, cheerful and a little reckless.',
    design: 'A woman in her late twenties with a bright, bubbly voice, enthusiastic and playful, always a laugh close by.',
    reference: "Oh, a student? Lovely! I'm Ember Wren, and I teach fire. Mostly it does what I ask. Watch my hands, keep your sleeves back, and maybe stand a little further away.",
    notes: ''
  }),
  captainHale: card({
    name: 'Captain Hale', gender: 'male', age: 'mid 50s', pitch: 'low', pace: 'measured',
    timbre: 'worn, husky baritone',
    personality: 'The tired commander of a besieged town watch: dutiful, grateful, weary.',
    design: 'A man in his mid fifties with a worn, husky baritone. A tired but steady soldier, plain-spoken, carrying a heavy duty.',
    reference: "Captain Hale. I command what's left of the town watch. The walls are still standing, for today anyway. We need every sword we can get, so I won't turn yours away.",
    notes: ''
  }),
  oakArmorer: card({
    name: 'Odo the Armorer', gender: 'male', age: 'early 40s', pitch: 'mid', pace: 'medium',
    timbre: 'tired, friendly tenor-baritone',
    personality: 'An overworked armourer who hasn\'t slept: apologetic, later proud of his back room.',
    design: 'A man in his early forties with a friendly, slightly tired mid voice, an overworked craftsman who is still kind and a bit apologetic.',
    reference: "Odo. I make armour. Haven't slept much lately. Plate, if you stand your ground. Leather, if you keep moving. Take what's left, if it fits.",
    notes: 'Also speaks as Master Odo after the siege.'
  }),
  oakWeapons: card({
    name: 'Senna Blades', gender: 'female', age: 'mid 30s', pitch: 'mid-low', pace: 'measured',
    timbre: 'cool, smooth alto',
    personality: 'A cool, dry-witted blade seller who has seen three wars and trusts nobody.',
    design: 'A woman in her mid thirties with a cool, smooth alto. Dry, unimpressed and a little sly, a trader who has seen everything.',
    reference: "Looking or buying? Either's fine. Just don't touch the edges. Sharp, balanced, and fairly priced. What you do with them is your business.",
    notes: ''
  }),
  trainerShadow: card({
    name: 'The Whisper', gender: 'female', age: 'mid 30s', pitch: 'mid-low', pace: 'slow',
    timbre: 'soft, breathy, low voice',
    personality: 'A soft-spoken teacher of stealth, mysterious and quietly amused.',
    design: 'A woman in her mid thirties with a soft, low, slightly breathy voice, speaking quietly and slowly, mysterious and calm.',
    reference: "You didn't hear me come up behind you. Most people don't. Quietly, then. Watch my feet, not my hands, and breathe out slowly before you move.",
    notes: 'Many lines are whispers: Chatterbox cannot whisper, so the soft reference carries it.'
  }),
  trainerSovereign: card({
    name: 'Lord Castellan', gender: 'male', age: 'early 60s', pitch: 'mid-low', pace: 'measured',
    timbre: 'refined, polished baritone',
    personality: 'A haughty old aristocrat who teaches command; proud, later humbled in exile.',
    design: 'A man in his early sixties with a refined, polished baritone and an upper-class manner. Proud and precise, a little haughty, but never cruel.',
    reference: 'You may come closer. That is close enough. I teach command. Watch how an order is given, and how it is followed. Leadership is a habit, not a title.',
    notes: 'Also speaks as Lord Castellan in exile (sadder lines).'
  }),
  oakHealer: card({
    name: 'Brother Fenn', gender: 'male', age: 'mid 30s', pitch: 'mid', pace: 'brisk',
    timbre: 'light, friendly tenor',
    personality: 'A busy field healer with a wry, cheerful humour.',
    design: 'A man in his mid thirties with a light, friendly tenor, busy and brisk but cheerful, with a wry humour.',
    reference: "Next! Oh, you're walking. That makes a nice change. Lie down here, the clean cot. There. Flasks filled, off you go. Mind the step on the way out.",
    notes: ''
  }),
  blackMarket: card({
    name: 'The Fence', gender: 'male', age: 'mid 40s', pitch: 'mid', pace: 'measured',
    timbre: 'smooth, low, conspiratorial voice',
    personality: 'A sly black-market dealer, smooth and discreet, a former candle seller.',
    design: 'A man in his mid forties with a smooth, low voice, speaking quietly and slyly like someone sharing a secret, polite and discreet.',
    reference: 'No names here. You can call me the Fence. Everything here came from somewhere. No questions either way. You take the goods, and nobody followed you.',
    notes: ''
  }),
  trainerBlood: card({
    name: 'Doctor Sangrel', gender: 'male', age: 'mid 50s', pitch: 'mid-low', pace: 'slow',
    timbre: 'dry, precise, velvety baritone',
    personality: 'An eerie but polite doctor who teaches blood magic; cool, precise, darkly funny.',
    design: 'A man in his mid fifties with a dry, precise and velvety baritone. Calm, polite and a little eerie, like an old-fashioned doctor, slow and careful.',
    reference: "A visitor. Please don't touch the jars. I teach what others would rather not learn. Sit still, breathe slowly, and listen to your own heartbeat.",
    notes: 'Eerie, never scary (the audience is 10–15).'
  }),
  syndicateBoss: card({
    name: 'Madam Ash', gender: 'female', age: 'late 40s', pitch: 'mid-low', pace: 'measured',
    timbre: 'smooth, commanding alto',
    personality: 'The cool, charming head of the Syndicate; always in control.',
    design: 'A woman in her late forties with a smooth, commanding alto. Charming, calm and in control, a confident crime boss who never raises her voice.',
    reference: "So you're the one. Sit down, you've earned a chair. They call me Madam Ash. I like to know who I'm dealing with, and I always pay my debts.",
    notes: ''
  }),

  // ── Ironhold ──
  forgemaster: card({
    name: 'Forgemaster Dorn', gender: 'male', age: 'about 60, a dwarf', pitch: 'low', pace: 'measured',
    timbre: 'deep, booming, rough bass-baritone',
    personality: 'The gruff dwarven head of the forges, proud and burdened by the mine\'s trouble.',
    design: 'A man of about sixty with a deep, booming, rough bass-baritone, a proud dwarf forgemaster: gruff and loud, warm when he is pleased.',
    reference: "Dorn. Forgemaster of Ironhold. You came up through the mines, I can smell the dust on you. The forge won't wait, so speak up and make it quick.",
    notes: ''
  }),
  ironWeapons: card({
    name: 'Hilda Hammerhand', gender: 'female', age: 'mid 40s, a dwarf', pitch: 'mid-low', pace: 'medium',
    timbre: 'strong, hearty alto',
    personality: 'A proud dwarven weaponsmith, hearty and blunt.',
    design: 'A woman in her mid forties with a strong, hearty alto, a proud dwarf weaponsmith, blunt and loud with a big laugh.',
    reference: 'Hilda Hammerhand. Every piece here was forged by dwarven hands. Careful with the display, those are sharp on both edges. If one of these breaks, I want to know how.',
    notes: ''
  }),
  ironAetherWorks: card({
    name: 'Tinker Voss', gender: 'female', age: 'early 30s', pitch: 'mid', pace: 'fast',
    timbre: 'quick, clever, slightly nasal voice',
    personality: 'An eager scholar-inventor from the Circle, quick-talking and a bit absent-minded.',
    design: 'A woman in her early thirties with a quick, clever, slightly nasal voice, an eager inventor who talks fast and gets excited about her work.',
    reference: "Careful, that one's loaded. Most of them are, actually. Everything here came out of studying the core. Let me know how it handles, I'm keeping notes.",
    notes: ''
  }),
  ironArmor: card({
    name: 'Garrun Ironside', gender: 'male', age: 'about 50, a dwarf', pitch: 'low', pace: 'slow',
    timbre: 'very low, flat, terse bass',
    personality: 'A dwarven armourer who says as little as possible.',
    design: 'A man of about fifty with a very low, flat bass voice, terse and calm, a craftsman who uses as few words as he can.',
    reference: "Garrun. Armour on the racks, rings in the tray. That plate will turn a giant's club. Have a look. Good choice. Not much more worth saying.",
    notes: ''
  }),
  ironOrderArmor: card({
    name: 'Order Quartermaster', gender: 'female', age: 'early 40s', pitch: 'mid', pace: 'brisk',
    timbre: 'crisp, clipped military voice',
    personality: 'An efficient quartermaster of the Iron Order: formal, crisp, follows orders.',
    design: 'A woman in her early forties with a crisp, clear and clipped voice, an efficient military quartermaster, formal and precise.',
    reference: "I'm the Order's quartermaster here. Take what you need, sign for it, and bring it back in one piece. The Order looks after its own. At ease.",
    notes: ''
  }),
  trainerGeo: card({
    name: 'Old Stonefoot', gender: 'male', age: 'about 75', pitch: 'low', pace: 'slow',
    timbre: 'deep, slow, earthy old voice',
    personality: 'An ancient, patient earth mage who listens to the mountain.',
    design: 'A man of about seventy-five with a deep, slow and earthy voice, very patient and calm, like an old hermit who listens to the mountain.',
    reference: "Slow down. The mountain isn't going anywhere. Plant your feet. Feel that? No? That's where we start. Listen to the ground, and sometimes it answers.",
    notes: ''
  }),
  trainerAether: card({
    name: 'Gearwright Pim', gender: 'male', age: 'mid 20s', pitch: 'mid-high', pace: 'fast',
    timbre: 'jittery, eager tenor',
    personality: 'A nervous, excitable young gunsmith; talks fast and worries about fingers.',
    design: 'A young man in his mid twenties with an eager, slightly jittery tenor, talking fast, nervous and excited, a friendly gadget-maker.',
    reference: "Ah, wait, don't touch that! Or that. Stand on the rug, the rug's safe. Gearwright Pim. I build guns, turrets, and a lot of heat gauges.",
    notes: ''
  }),
  ironHealer: card({
    name: 'Mother Brynja', gender: 'female', age: 'early 60s', pitch: 'mid-low', pace: 'medium',
    timbre: 'firm, motherly alto',
    personality: 'A brisk, no-nonsense dwarven healer, gruff on the outside and motherly inside.',
    design: 'A woman in her early sixties with a firm, motherly alto, brisk and no-nonsense, but caring underneath.',
    reference: "Boots off at the door, please, I've only just swept. Sit. Drink this, and don't make that face. I've set most of the broken bones in this mountain.",
    notes: ''
  }),
  trainerChrono: card({
    name: 'The Keeper of Hours', gender: 'male', age: 'mid 50s', pitch: 'mid', pace: 'slow',
    timbre: 'soft, dreamy, gentle tenor',
    personality: 'A gentle, dreamy time mage who has seen too many futures.',
    design: 'A man in his mid fifties with a soft, gentle and dreamy tenor, speaking slowly and thoughtfully, slightly wistful.',
    reference: "There you are. I've been expecting you for a while, or will have been. I teach how to bend time, a little. Not much. Just enough to be late less often.",
    notes: ''
  }),

  // ── The quest bosses ──
  goblinKing: card({
    name: 'The Goblin King', gender: 'male', age: 'older goblin', pitch: 'mid', pace: 'medium',
    timbre: 'raspy, rough voice',
    personality: 'A defeated goblin king, frightened, bargaining for his hungry people.',
    design: 'An older man with a raspy, rough voice, frightened and out of breath, bargaining desperately but with some dignity.',
    reference: 'My people raid because they are hungry. That is the truth. Let us make a deal instead. Your kind and mine. Trade, and no more raids. I swear it, on my crown.',
    notes: 'Light goblin FX (fx.mjs).'
  }),
  warlord: card({
    name: 'Warlord Krag', gender: 'male', age: 'mid 40s', pitch: 'low', pace: 'measured',
    timbre: 'deep, hard, cold bass-baritone',
    personality: 'A cold mercenary warlord who respects strength and offers a bribe.',
    design: 'A man in his mid forties with a deep, hard bass-baritone, cold and calm, a tough warlord who never hurries.',
    reference: "Enough. You fight well, I'll give you that. The Syndicate pays far better than that town ever will. Open the gate, and a share of it is yours.",
    notes: ''
  }),
  oracle: card({
    name: 'The Drowned Oracle', gender: 'female', age: 'timeless, sounds about 40', pitch: 'mid', pace: 'slow',
    timbre: 'airy, soft, otherworldly voice',
    personality: 'A weary seer who has watched every outcome and longs to be surprised.',
    design: 'A woman of about forty with an airy, soft and otherworldly voice, slow and weary, gentle and a little sad.',
    reference: "I've seen this moment more times than I can count. In half of them, you set me free. Choose. I would like, just once, not to know what comes next.",
    notes: 'No FX: the soft voice carries it.'
  }),
  dragon: card({
    name: 'The Void Dragon', gender: 'male', age: 'ancient', pitch: 'low', pace: 'slow',
    timbre: 'very deep, resonant, slow bass',
    personality: 'An ancient, proud dragon who offers an alliance against a common foe.',
    design: 'A man with a very deep, resonant bass voice, ancient, proud and slow, every word heavy and grand, calm rather than angry.',
    reference: 'Enough. You have teeth, little one. Few would dare ask me anything. Very well. We hunt together, and the one who chained my kin will burn.',
    notes: 'Light dragon FX (fx.mjs): a lower pitch, a soft sub layer and a big cave.'
  }),
  archDemon: card({
    name: 'The Arch-Demon', gender: 'male', age: 'ageless', pitch: 'low', pace: 'slow',
    timbre: 'cold, smooth, low baritone',
    personality: 'The defeated master of the Dread Fortress: cold, calm, theatrical.',
    design: 'A man with a cold, smooth, low baritone, calm and theatrical, quietly menacing like a stage villain, never shouting.',
    reference: "So. It ends. I didn't think it would be you. My throne won't stay empty. Whoever takes it commands the fortress and the rift. Choose carefully.",
    notes: 'Light demon FX (fx.mjs): a little lower, a faint octave below, a stone hall.'
  }),
  // Only shouts mid-fight (#74): no conversation of his own.
  frostJarl: card({
    name: 'The Frost Jarl', gender: 'male', age: 'mid 50s', pitch: 'low', pace: 'measured',
    timbre: 'big, booming, gravelly bass',
    personality: 'A giant northern warlord who loves a fight and laughs at the cold.',
    design: 'A man in his mid fifties with a big, booming, gravelly bass voice, a hearty northern chieftain, loud and proud but never cruel.',
    reference: 'Ha! So you came all the way up the mountain for me. Good. The ice remembers every warrior who stood here. Stand still, little one, and let us see if it remembers you.',
    notes: 'No FX: the bass carries it.'
  }),

  // ── Overheard small talk ──
  smalltalkSunford: card({
    name: 'Sunford villager', gender: 'female', age: 'about 60', pitch: 'mid', pace: 'medium',
    timbre: 'homely, chatty older voice',
    personality: 'A chatty village woman: bakes pies, complains about her knee, knows all the gossip.',
    design: 'A woman of about sixty with a homely, chatty voice, a friendly village gossip, warm and a little fussy.',
    reference: "Rain tonight, my knee's been aching all day. The barley's come up well this year, though. Is that apple pie I can smell? I'll bake another and hide it better.",
    notes: 'Starts the Sunford chats; townsfolk answers.'
  }),
  smalltalkOakhaven: card({
    name: 'Oakhaven merchant', gender: 'female', age: 'mid 30s', pitch: 'mid-high', pace: 'brisk',
    timbre: 'quick, expressive town voice',
    personality: 'A busy market woman, quick to complain about prices and quick to share bread.',
    design: 'A woman in her mid thirties with a quick, expressive voice, a busy market trader, a bit dramatic about prices but kind.',
    reference: "Two silver for a cabbage. Two! I'll grow my own, then, on the roof if I must. They've doubled the guard on the gate, and the spice caravan's late again.",
    notes: 'Starts the Oakhaven chats; townsfolk answers.'
  }),
  smalltalkIronhold: card({
    name: 'Ironhold miner', gender: 'male', age: 'about 50, a dwarf', pitch: 'low', pace: 'medium',
    timbre: 'gruff, hearty bass-baritone',
    personality: 'A hearty dwarven miner, talks ore, forge and beards.',
    design: 'A man of about fifty with a gruff, hearty bass-baritone, a cheerful dwarf miner who loves to chat about his work.',
    reference: "Good seam of copper on the fourth level. Copper pays the rent, silver pays for dreams. The great forge hasn't gone cold in a hundred years, you know.",
    notes: 'Starts the Ironhold chats; townsfolk answers.'
  }),
  townsfolk: card({
    name: 'Townsfolk', gender: 'male', age: 'early 40s', pitch: 'mid', pace: 'medium',
    timbre: 'plain, friendly everyman voice',
    personality: 'The other half of every grown-up street chat: plain, friendly, a bit dry.',
    design: 'A man in his early forties with a plain, friendly everyday voice, relaxed and a little dry, like a neighbour chatting in the street.',
    reference: "Your knee said that last week too. Let's hope we get to keep it. Nothing gets through the gate cheap these days. Still, I sleep a bit easier for it.",
    notes: 'Answers in Sunford, Oakhaven and Ironhold; the children\'s chats get kidFriend instead (voiceOf).'
  }),
  smalltalkKids: card({
    name: 'Village boy', gender: 'male', age: 'about 8', pitch: 'high', pace: 'fast',
    timbre: 'excited little boy\'s voice',
    personality: 'A playful village child, full of big plans and frogs.',
    design: 'An eight-year-old boy with a high, excited little voice, playful and full of energy, talking quickly.',
    reference: "Tag, you're it! When I'm big I'm going to ride a dragon. Look, I found a sword! There's a frog down by the well, a really big one. Come and see!",
    notes: 'Starts the children\'s chats.'
  }),
  kidFriend: card({
    name: 'Village girl', gender: 'female', age: 'about 9', pitch: 'high', pace: 'medium',
    timbre: 'clear, cheeky little girl\'s voice',
    personality: 'The other child in the children\'s chats: a little more sensible, a little cheeky.',
    design: 'A nine-year-old girl with a clear, high voice, cheeky and sensible, a little bossy the way older kids are.',
    reference: "No fair, I wasn't ready! Dragons don't let people ride them. Mum said no more frogs, remember? Put that sword down before you poke somebody.",
    notes: 'Not a manifest speaker: voices the `townsfolk` lines of the children\'s chats (voiceOf), so a child never answers in a grown man\'s voice.'
  })
}

/** The card that voices a manifest line: its speaker's, except the children's
 *  small talk, where the answering `townsfolk` is a child (kidFriend). */
export const voiceOf = (l: { speaker: string; scene: string }): string =>
  l.speaker === 'townsfolk' && l.scene === 'smalltalkKids' ? 'kidFriend' : l.speaker

/** The manifest's emotion as one tone word (Chatterbox's exaggeration knob). */
export const TONES: Readonly<Record<string, Tone>> = {
  neutral: 'neutral',
  warm: 'warm',
  gruff: 'neutral',
  sly: 'cheeky',
  grave: 'calm',
  angry: 'urgent',
  afraid: 'urgent',
  proud: 'warm',
  sad: 'sad',
  amused: 'cheeky',
  excited: 'excited',
  whisper: 'whisper',
  shout: 'shout',
  weary: 'calm',
  cold: 'deadpan'
}

/** The manifest's emotion as a stage direction. */
export const DIRECTIONS: Readonly<Record<string, string>> = {
  neutral: 'Natural and conversational, like talking to a friend.',
  warm: 'Warm and kind, a smile in the voice.',
  gruff: 'Gruff and plain, few words, a busy working voice.',
  sly: 'Sly and knowing, a little smile, as if sharing a secret.',
  grave: 'Serious and steady, a little slower, each word weighed.',
  angry: 'Angry but controlled, sharp and clipped.',
  afraid: 'Scared and shaky, a bit breathless.',
  proud: 'Proud and confident, chin up.',
  sad: 'Sad and quiet, a heavy heart.',
  amused: 'Amused, a light chuckle under the words.',
  excited: 'Excited and quick, bright energy.',
  whisper: 'Hushed and close, almost a whisper.',
  shout: 'Loud and urgent, calling out.',
  weary: 'Tired and worn, a sigh behind the words.',
  cold: 'Cool and distant, flat and controlled.'
}

/** How to say a line: its emotion's direction, and its gesture when it has one. */
export const directionOf = (l: { emotion?: string; gesture?: string }): string =>
  `${DIRECTIONS[l.emotion ?? 'neutral'] ?? DIRECTIONS.neutral}${l.gesture ? ` (With a ${l.gesture}.)` : ''}`

/** A line's tone: its own when set, else its emotion's. */
export const toneOf = (l: { tone?: string; emotion?: string }): string => l.tone ?? TONES[l.emotion ?? 'neutral'] ?? 'neutral'
