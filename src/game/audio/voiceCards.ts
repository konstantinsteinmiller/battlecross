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
  // ── Sunford's newer teachers (#106) ──
  sfShadow: card({
    name: 'Nettle Quickhand', gender: 'female', age: 'mid 30s', pitch: 'mid', pace: 'brisk',
    timbre: 'low, wry, slightly husky voice',
    personality: 'A retired cutpurse turned teacher: sly, dry-humoured, always half amused.',
    design: 'A woman in her mid thirties with a low, wry, slightly husky voice. Sly and dry-humoured, speaking quickly, as if sharing a secret.',
    reference: "Didn't hear you come in. That's usually my trick. Nettle Quickhand. I teach the quiet arts: daggers, shadows, and leaving early. Light feet, quick hands.",
    notes: ''
  }),
  sfGeo: card({
    name: 'Harrow Flint', gender: 'male', age: 'late 60s', pitch: 'low', pace: 'slow',
    timbre: 'deep, gravelly, warm voice',
    personality: 'An old earth-mage who talks to stone: patient, dry, kind.',
    design: 'A man in his late sixties with a deep, gravelly, warm voice. Patient and dry-humoured, speaking slowly, like stone settling.',
    reference: 'Mind the rocks. Some of them are listening. Harrow Flint. I teach the old earth magic: stone, roots, a little quake. Feet flat, breathe slow.',
    notes: ''
  }),
  // ── Freed from the cages (#100) ──
  freedPeddler: card({
    name: 'Odo Marrow', gender: 'male', age: 'late 50s', pitch: 'mid', pace: 'brisk',
    timbre: 'warm, chatty, slightly nasal voice',
    personality: 'A travelling peddler and tinker: chatty, grateful, always talking up his wares.',
    design: 'A man in his late fifties with a warm, chatty, slightly nasal voice. Friendly and quick, the patter of a market seller who loves a bargain.',
    reference: "You! You're the one who opened that cage! Odo Marrow, at your service. Peddler, tinker, very grateful man. Rings, gloves, boots, half price for you. Well, nearly.",
    notes: 'Not Tilly the Peddler (a young woman): Odo is an old, talkative salesman.'
  }),
  freedHerbalist: card({
    name: 'Briar Hollowell', gender: 'female', age: 'mid 40s', pitch: 'mid', pace: 'slow',
    timbre: 'soft, earthy, calm voice',
    personality: 'A hill herbalist the goblins took for a witch: soft-spoken, wry, kind.',
    design: 'A woman in her mid forties with a soft, earthy, calm voice. Gentle and unhurried, with a dry little smile in it.',
    reference: "I knew someone would come. I'm Briar. I gather and dry what grows. The goblins took me for a witch. They weren't entirely wrong. Walk gently out there.",
    notes: ''
  }),
  freedFarmers: card({
    name: 'Jory Toller', gender: 'male', age: 'mid 40s', pitch: 'low', pace: 'measured',
    timbre: 'plain, rough, rural voice',
    personality: 'A farmer freed with his son: plain-spoken, tired, deeply grateful.',
    design: 'A man in his mid forties with a plain, rough country voice. Slow and honest, a working man who says what he means.',
    reference: "We'd be dead without you. Me and my boy both. Jory Toller. We farm outside the walls now. Well, we try. The wolves keep taking our sheep.",
    notes: ''
  }),
  windDisciple: card({
    name: 'Kestrel Vane', gender: 'male', age: 'early 20s', pitch: 'mid', pace: 'fast',
    timbre: 'light, eager, slightly breathless voice',
    personality: "Sefa Galewing's pupil: eager, quick, cheerful, always ready to run.",
    design: 'A young man in his early twenties with a light, eager voice, a little breathless. Quick and cheerful, words tumbling out.',
    reference: "You got me out! I owe you everything. Well, a lot. Kestrel Vane. Sefa taught me the bow. Feet apart, breathe out, and let the wind carry it.",
    notes: 'Not Sefa Galewing (a woman): Kestrel is her young male pupil.'
  }),
  frostDisciple: card({
    name: 'Ivor Hask', gender: 'male', age: 'late 30s', pitch: 'low', pace: 'slow',
    timbre: 'deep, quiet, cold voice with a northern edge',
    personality: "Halvard Rimeheart's pupil: a hunter of the north, a man of very few words.",
    design: 'A man in his late thirties with a deep, quiet voice and a northern edge. Calm and terse, every word weighed.',
    reference: 'Free. Good. The cold did not take me, and neither did they. Ivor Hask. Stand still. Let the cold come to you. Then send it back. Stay warm.',
    notes: 'Not Halvard Rimeheart (older, grander): Ivor is younger and even more terse.'
  }),
  lightDisciple: card({
    name: 'Sister Aurelle', gender: 'female', age: 'late 20s', pitch: 'mid', pace: 'measured',
    timbre: 'gentle, warm, clear voice',
    personality: "A Lightbringer's disciple: gentle, sincere, glad to be back in the sun.",
    design: 'A woman in her late twenties with a gentle, warm, clear voice. Sincere and kind, calm even when moved.',
    reference: "Light be with you. You found me in the dark, and I won't forget it. I'm Aurelle. Open your hands, and let the light come through them, not from them.",
    notes: 'Not Sister Auriel Dawnmere (her teacher): Aurelle is younger and quieter.'
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

  // ── Silverbridge ──
  mayorBrenna: card({
    name: 'Mayor Brenna Quill', gender: 'female', age: 'about 50', pitch: 'mid', pace: 'brisk',
    timbre: 'crisp, confident, slightly dry mezzo',
    personality: 'The busy mayor of a river trade town: proud of it, practical, a little dry, always half on her way somewhere.',
    design: 'A woman of about fifty with a crisp, confident mezzo voice. Brisk and practical, with a dry sense of humour and a quiet pride, like someone who runs a busy market and enjoys it.',
    reference: "Mind the cart! Sorry, everything on this bridge moves. I'm Mayor Brenna Quill. If it's lost, broken or late, it ends up on my desk, so let's keep things moving, shall we?",
    notes: ''
  }),
  // ── The new Silverbridge masters (#86, #95) ──
  sbMasterWindrunner: card({
    name: 'Sefa Galewing', gender: 'female', age: 'late 20s', pitch: 'mid', pace: 'fast',
    timbre: 'bright, sporty, slightly breathless voice, as if she just ran up the stairs',
    personality: 'A cheerful, restless archer who talks in quick bursts and can never sit down; sunny and encouraging.',
    design: 'A woman in her late twenties with a bright, sporty voice, a little breathless, as if she has just finished a run. Cheerful and restless, she talks in quick happy bursts.',
    reference: "Oh, hi! Sorry, can't stop. I'm waiting for the wind to turn. I'm Sefa Galewing. Feel the wind on your cheek? Aim a little left of where you think. Now let go!",
    notes: 'Not Nyx Halloway (cheeky, grinning, teasing) nor Ember Wren (bubbly fire mage): Sefa is outdoorsy and breathless, always mid-run.'
  }),
  sbMasterFrostwarden: card({
    name: 'Halvard Rimeheart', gender: 'male', age: 'early 50s', pitch: 'mid-low', pace: 'slow',
    timbre: 'quiet, calm, smooth baritone with long pauses',
    personality: 'A calm northern knight of very few words, each one meant; kind underneath, with a dry, deadpan humour.',
    design: 'A man in his early fifties with a quiet, calm and smooth baritone. He speaks slowly, in short sentences with pauses, steady and kind, with a dry, deadpan humour.',
    reference: "Hm. You walked past me three times. Lost, or curious? I am Halvard Rimeheart. I came south from the snow. Breathe out slowly. See the mist? Now put it into the blade.",
    notes: 'Not the Frost Jarl (booming theatrical bass) nor Garrun Ironside (gruff dwarf): Halvard is soft-spoken and still.'
  }),
  sbMasterLightbringer: card({
    name: 'Sister Auriel Dawnmere', gender: 'female', age: 'about 50', pitch: 'mid', pace: 'medium',
    timbre: 'warm, musical voice with a smile in it, a singer\'s lilt',
    personality: 'A warm, teasing sister who hums old hymns and believes everyone deserves a second chance.',
    design: 'A woman of about fifty with a warm, musical voice and a singer\'s lilt, always a smile in it. Kind and gently teasing, like a favourite aunt.',
    reference: "Oh! Sorry, dear, I was humming. Did I hum at you? I do that. I'm Sister Auriel Dawnmere. Hands open, chin up. Think of the best morning you ever had. There. Feel that?",
    notes: 'Not Sister Lune (young, gentle healer) nor Mother Brynja (homely, plain): Auriel is musical and teasing.'
  }),
  sbMasterBeastcaller: card({
    name: 'Old Rowan Thistlefoot', gender: 'male', age: 'about 70', pitch: 'mid-low', pace: 'measured',
    timbre: 'rough, grumbly, slightly husky old voice that softens on animals',
    personality: 'A gruff old hermit, kinder to animals than to people, who warms up to the hero; short sentences, hidden soft heart.',
    design: 'A man of about seventy with a rough, grumbly, slightly husky voice. Gruff and blunt in short sentences, but there is a soft, kind heart under it.',
    reference: "Watch your feet. That's Bramble. She was here first. I'm Rowan Thistlefoot. I like animals. People, I'm still deciding. Crouch down. Slower. Let them come to you. Good.",
    notes: 'Not Old Stonefoot (slow, deep, earthy) nor Bram the Smith (gruff, younger): Rowan is grumbly and clipped, never deep and slow.'
  }),
  sbMasterElementalist: card({
    name: 'Magistra Iris Fourwinds', gender: 'female', age: 'mid 30s', pitch: 'mid', pace: 'brisk',
    timbre: 'clear, bubbly, confident teacher\'s voice, quick to laugh',
    personality: 'A bubbly, quick mage who juggles four tiny orbs while she talks and sets her own sleeve alight just to put it out.',
    design: 'A woman in her mid thirties with a clear, bubbly and confident voice. Quick and cheerful, a teacher who has done this a thousand times and still finds it delightful.',
    reference: "Hi! One second, I'm juggling. Fire, frost, spark, stone and... caught them! I'm Magistra Iris Fourwinds. Pick two orbs. Any two. Now let them bump. Gently! See?",
    notes: 'Not Odile Fernwhistle (giddy, breathless alchemist) nor Tinker Voss (fast, distracted): Iris is bubbly but sure of herself.'
  }),
  sbMasterSoulwarden: card({
    name: 'Warden Odalys Lanternlight', gender: 'female', age: 'early 40s', pitch: 'mid-low', pace: 'measured',
    timbre: 'soft, warm, cosy alto, like reading a bedtime story',
    personality: 'A soft-spoken, kind lantern-bearer who chats to the wisps in her lantern like old friends; no spirit is bad, only lost.',
    design: 'A woman in her early forties with a soft, warm and cosy alto, like someone reading a bedtime story. Gentle and kind, quietly amused, never mysterious.',
    reference: "Shh, it's all right, they're friendly. Oh, not you. I was talking to the wisps. I'm Warden Odalys Lanternlight. Hold the lantern low and speak softly.",
    notes: 'Not the Whisper (breathy, mysterious) nor the Drowned Oracle (otherworldly): Odalys is cosy and homely, never eerie.'
  }),
  sbMasterIronmonk: card({
    name: 'Master Oru Stillwater', gender: 'male', age: 'about 65', pitch: 'mid-low', pace: 'measured',
    timbre: 'calm, centred, dry baritone with a hint of a smile',
    personality: 'A calm martial-arts master with dry humour who answers in short proverbs and is secretly very serious about noodles.',
    design: 'A man of about sixty-five with a calm, centred and dry baritone, a hint of a smile behind it. Patient and wise, every sentence short and deliberate.',
    reference: "Sit. Breathe. No, you're breathing like you're late for something. Again. I am Master Oru Stillwater. Feet like roots, hands like rain. Strike. Again.",
    notes: 'Not Friar Ansel (sleepy) nor Doctor Sangrel (cool, darkly funny) nor the Keeper of Hours (dreamy): Oru is awake, centred and dry.'
  }),
  sbMasterBard: card({
    name: 'Lark Merriweather', gender: 'male', age: 'late 20s', pitch: 'mid-high', pace: 'brisk',
    timbre: 'bright, musical tenor with a showman\'s lilt',
    personality: 'The tavern\'s cheerful bard: rhymes by accident, can never finish a story without a song, delighted by every listener.',
    design: 'A man in his late twenties with a bright, musical tenor and a showman\'s lilt. Cheerful and warm, he speaks like he might break into song at any moment.',
    reference: "Welcome, welcome, come in from the cold! Oh dear, that rhymed. It does that. I'm Lark Merriweather. Strum with me. One, two, and three. Don't watch your fingers. Feel it!",
    notes: 'Not Gearwright Pim (nervous, jittery) nor Dob Tumbler (giggly) nor Corvin Ashby (vain): Lark is a warm showman with a singer\'s lilt.'
  }),
  sbCollector: card({
    name: 'Alder Vane', gender: 'male', age: 'about 75', pitch: 'mid-low', pace: 'slow',
    timbre: 'dry, papery, fond old voice',
    personality: 'The Collector: a fussy, kindly old man who loves rare things and the people who bring them.',
    design: 'A man of about seventy-five with a dry, papery voice, fussy and precise but fond, like an old shopkeeper among his treasures.',
    reference: "Shut the door, there's a draught. The moths are after my tapestries. Alder Vane. Some call me the Collector. I buy rare things, and sell them to people I like.",
    notes: 'Not Elder Mara (warm village elder): Alder is drier and more particular.'
  }),
  sbFence: card({
    name: 'Mirela Thorne', gender: 'female', age: 'early 30s', pitch: 'mid-low', pace: 'medium',
    timbre: 'low, cool, amused alto',
    personality: 'A river fence: cool, sharp, sardonic, loyal to her friends.',
    design: 'A woman in her early thirties with a low, cool alto, dry and sardonic, with a hidden warmth.',
    reference: "You're staring. Either buy something or stop blocking my light. Mirela Thorne. I find things people lose. Then I find them new owners.",
    notes: 'Not Nyx Halloway (whispery shadow master): Mirela is plain-spoken and dry.'
  }),
  sbGambler: card({
    name: 'Madame Pell', gender: 'female', age: 'about 50', pitch: 'mid', pace: 'brisk',
    timbre: 'big, theatrical, sparkling showwoman voice',
    personality: 'The memory stand\'s showwoman: a former circus act, loud and glittering, warm under the patter, loves a winner.',
    design: 'A woman of about fifty with a big, theatrical voice, like a fairground showwoman calling a crowd, sparkling and playful.',
    reference: "Step right up! Twelve cards, one hourglass, and a purse that could double! Madame Pell never forgets a face. Let's see if you never forget a card.",
    notes: 'Showy, never shouting: the patter is fast but clear.'
  }),
  sunfordGambler: card({
    name: 'Dob Tumbler', gender: 'male', age: 'about 40', pitch: 'mid', pace: 'fast',
    timbre: 'cheerful, scratchy country voice',
    personality: 'A cheerful village gambler who plays for junk and laughs at his own losses.',
    design: 'A man of about forty with a cheerful, slightly scratchy country voice, chatty and conspiratorial, always grinning.',
    reference: "Psst. Got any junk in that bag? Old boots, bent swords? I'll play you for it. Dob Tumbler. I play for fun, mostly. And for boots.",
    notes: 'Not Bram the smith (gruff, slow): Dob is quick and giggly.'
  }),
  oakGambler: card({
    name: 'Silky Ren', gender: 'male', age: 'mid 30s', pitch: 'mid-low', pace: 'measured',
    timbre: 'smooth, velvety, amused baritone',
    personality: 'An elegant dealer in fine things: polite, smooth and quietly amused, collects shiny things and teacups.',
    design: 'A man in his mid thirties with a smooth, velvety baritone, unhurried and amused, like a card dealer in a fine parlour.',
    reference: "A newcomer. Do sit down, I don't bite. My prices do, a little. They call me Silky Ren. I collect fine things, one game at a time.",
    notes: 'Not the Syndicate boss (cold threat): Ren is playful and charming.'
  }),
  sbAlchemist: card({
    name: 'Odile Fernwhistle', gender: 'female', age: 'early 30s', pitch: 'mid-high', pace: 'fast',
    timbre: 'bright, bubbly, slightly breathless soprano',
    personality: 'The Silverbridge alchemist: delighted by every plant, a little scatterbrained, warm and funny, always mid-experiment.',
    design: 'A woman in her early thirties with a bright, bubbly voice that runs a little breathless with excitement, like someone who just found a rare flower.',
    reference: "Oh! Mind the jars. That one bites. Well, it nibbles. Odile Fernwhistle, alchemist. Bring me herbs and I'll bottle you a little courage. Did you bring me anything green?",
    notes: 'Not Vesper Crimsonleaf (calm, bright teacher): Odile is quicker and giddier.'
  }),
  sbHealer: card({
    name: 'Friar Ansel', gender: 'male', age: 'late 40s', pitch: 'mid-low', pace: 'slow',
    timbre: 'soft, warm, slightly drowsy baritone',
    personality: 'A gentle healer who is always a little sleepy; kind, unhurried, with a quiet, yawning humour.',
    design: 'A man in his late forties with a soft, warm baritone that sounds a little drowsy. Gentle and unhurried, kind, with a sleepy smile in the voice.',
    reference: "Mm? Oh, a patient. Sorry, I was resting my eyes. Healers do that. I'm Friar Ansel. Come in and sit down, the chair's comfier than it looks.",
    notes: 'Sleepy, never slurred: every word stays clear.'
  }),
  sbArmorer: card({
    name: 'Greta Ironvein', gender: 'female', age: 'mid 40s, mountain-born', pitch: 'mid-low', pace: 'medium',
    timbre: 'big, bright, laughing alto',
    personality: 'A blunt, cheerful armourer from the mountains who laughs at dents and says exactly what she thinks.',
    design: 'A sturdy woman in her mid forties with a big, bright alto and a ready laugh. Blunt and cheerful, loud in a friendly way, like a craftswoman who loves her work.',
    reference: "Ha! Look at that dent. I'm Greta Ironvein, and I make armour that comes home with its owner. Go on, knock on it. Hard as you like.",
    notes: 'Not Hilda Hammerhand (Ironhold, proud and hearty): Greta laughs more and brags less.'
  }),
  sbWeapons: card({
    name: 'Corvin Ashby', gender: 'male', age: 'mid 30s', pitch: 'mid', pace: 'measured',
    timbre: 'smooth, polished, honeyed tenor-baritone',
    personality: 'A smooth blade salesman, charming and a little vain; loves his shop, his name and his hair.',
    design: 'A man in his mid thirties with a smooth, polished voice, charming and a touch self-satisfied, like a salesman who knows he is good at it.',
    reference: "Ah, a customer with taste. I can always tell. Corvin Ashby, of Ashby's Fine Blades. Every blade polished by hand. My hand, in fact.",
    notes: 'Vain in a funny way, never sleazy.'
  }),
  sbJeweler: card({
    name: 'Tam Marlow', gender: 'male', age: 'about 15', pitch: 'mid-high', pace: 'fast',
    timbre: 'quick, cheeky teenage voice',
    personality: 'A quick-talking street-stall kid with a cheeky grin; half salesman, half town gossip.',
    design: 'A fifteen-year-old boy with a quick, cheeky, lively voice. Fast-talking and friendly, a street trader who always has one more thing to tell you.',
    reference: "Psst! Over here! Rings, charms, lucky stones. Best stall on the bridge. Name's Tam Marlow. I'm small, but my prices are smaller.",
    notes: 'A teenager, not a child: clearly older than the small-talk kids.'
  }),
  sbMasterAegis: card({
    name: 'Dame Helga Stormshield', gender: 'female', age: 'mid 60s', pitch: 'mid-low', pace: 'medium',
    timbre: 'big, warm, booming alto',
    personality: 'A retired champion who once held the bridge: loud, jolly and big-hearted, a grandmother and a drill sergeant at once.',
    design: 'A woman in her mid sixties with a big, warm, booming alto. Jolly and encouraging, loud in a friendly way, like a cheerful old champion coaching young people.',
    reference: "Ha! Another young one. Chin up, shoulders back. Shields work better with a smile. I'm Dame Helga Stormshield. Feet wide, lean in, and when I push, you don't move.",
    notes: 'Warm and loud, never harsh: not Ser Aldric (strict and formal).'
  }),
  sbMasterPyro: card({
    name: 'Magister Ignatius Vale', gender: 'male', age: 'late 50s', pitch: 'mid', pace: 'measured',
    timbre: 'precise, dry, slightly nasal academic tenor',
    personality: 'A fussy, precise fire scholar who treats flame as a careful craft; calm, exact, quietly funny.',
    design: 'A man in his late fifties with a precise, dry tenor, an old-fashioned scholar who chooses each word carefully. Calm and a little fussy, with a dry wit.',
    reference: "Do come in. Mind the notes, and please don't sneeze near the brazier. I'm Magister Ignatius Vale. Big flames are easy. Small ones, held still, take skill.",
    notes: 'Calm and controlled: the opposite of Ember Wren (bubbly, reckless).'
  }),
  sbMasterShadow: card({
    name: 'Nyx Halloway', gender: 'female', age: 'early 20s', pitch: 'mid-high', pace: 'brisk',
    timbre: 'light, quick, grinning voice',
    personality: 'A former pickpocket gone straight: cheeky, playful and quick, hides in crowds in broad daylight.',
    design: 'A young woman in her early twenties with a light, quick voice and a grin in it. Playful and cheeky, confident, a little teasing.',
    reference: "Looking for me? I've been next to you since the fountain. You walked past me twice. I'm Nyx Halloway. Lesson one: walk like you belong.",
    notes: 'Bright and playful: not the Whisper (soft, breathy, mysterious).'
  }),
  sbMasterSovereign: card({
    name: 'Lord Percival Ashcombe', gender: 'male', age: 'mid 40s', pitch: 'mid', pace: 'medium',
    timbre: 'kindly, well-spoken, gentle baritone',
    personality: 'A gracious, kind nobleman who leads by saying please; polite to a fault, warm, a little fussy.',
    design: 'A man in his mid forties with a kindly, well-spoken baritone. Gracious, warm and polite, a gentle nobleman who is genuinely glad to see you.',
    reference: "Oh! Hello, hello. Do forgive me, I was chatting with my guards. I'm Percival Ashcombe. A good order is clear, kind, and only given once.",
    notes: 'Warm and humble: not Lord Castellan (haughty, cold).'
  }),
  sbMasterGeo: card({
    name: 'Grandmother Tova Deeproot', gender: 'female', age: 'about 75', pitch: 'mid', pace: 'medium',
    timbre: 'warm, chatty, slightly creaky old voice',
    personality: 'A feisty, chatty old earth mage who tends a garden of stone and treats every pupil like a grandchild.',
    design: 'A woman of about seventy-five with a warm, chatty, slightly creaky voice. Lively and feisty, affectionate, always offering tea.',
    reference: "Mind the moss, dear, it's had a long week. I'm Grandmother Tova Deeproot. Hands flat on the ground. Not like that. Like you're patting a sleepy dog.",
    notes: 'Lively and chatty: not Old Stonefoot (slow, deep, male).'
  }),
  sbMasterAether: card({
    name: 'Professor Quint Sprocket', gender: 'male', age: 'late 40s', pitch: 'mid', pace: 'brisk',
    timbre: 'resonant, theatrical lecturer\'s baritone',
    personality: 'A confident showman of an inventor: every lesson a demonstration, every demonstration loud, unbothered by lost eyebrows.',
    design: 'A man in his late forties with a resonant, theatrical lecturer\'s voice. Confident and enthusiastic, a showman at a blackboard who loves an audience.',
    reference: "Welcome, welcome! You're just in time for the demonstration. Cover your ears, please. I'm Professor Quint Sprocket. Observe the blackboard. Now forget it, and watch the machine.",
    notes: 'Confident and grand: not Gearwright Pim (young, nervous, jittery).'
  }),
  sbMasterChrono: card({
    name: 'Clockwarden Selwyn', gender: 'male', age: 'late 60s', pitch: 'mid', pace: 'brisk',
    timbre: 'crisp, clipped, precise tenor',
    personality: 'The punctual keeper of the bridge clock: brisk, exact and dry, the Keeper of Hours\' old teacher.',
    design: 'A man in his late sixties with a crisp, clipped and precise tenor. Brisk and exact, with a dry humour, every word on the beat like a ticking clock.',
    reference: "My old pupil wrote that you'd come, at this very minute. I'm Clockwarden Selwyn. I keep the bridge clock. Count with me. One, two, and hold.",
    notes: 'Brisk and exact: not the Keeper of Hours (soft, dreamy, slow).'
  }),
  sbMasterBlood: card({
    name: 'Vesper Crimsonleaf', gender: 'female', age: 'late 30s', pitch: 'mid', pace: 'measured',
    timbre: 'bright, soft, kindly voice',
    personality: 'A kind, bright-eyed alchemist of essence who brews tonics and loves mint; curious and caring.',
    design: 'A woman in her late thirties with a bright, soft and kindly voice. Curious and caring, a little dreamy about herbs, warm and reassuring.',
    reference: "Doctor Sangrel wrote to me about you. He says you didn't faint. High praise, from him. I'm Vesper Crimsonleaf. Breathe in. Feel your strength? Now spend a little of it.",
    notes: 'Kind and bright, never eerie: not Doctor Sangrel (dry, cool, darkly funny).'
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
  smalltalkSilverbridge: card({
    name: 'Silverbridge trader', gender: 'female', age: 'late 20s', pitch: 'mid', pace: 'brisk',
    timbre: 'bright, wry river-town voice',
    personality: 'A young river trader: unloads barges all morning, teases her friends, a little proud of her big town.',
    design: 'A woman in her late twenties with a bright, wry voice, a young river-market trader, quick and good-humoured.',
    reference: "Three barges in from the coast this morning, silk for once. Every master in the land teaches on one street, and every one of them says theirs is the best class.",
    notes: 'Starts the Silverbridge chats; townsfolk answers.'
  }),
  townsfolk: card({
    name: 'Townsfolk', gender: 'male', age: 'early 40s', pitch: 'mid', pace: 'medium',
    timbre: 'plain, friendly everyman voice',
    personality: 'The other half of every grown-up street chat: plain, friendly, a bit dry.',
    design: 'A man in his early forties with a plain, friendly everyday voice, relaxed and a little dry, like a neighbour chatting in the street.',
    reference: "Your knee said that last week too. Let's hope we get to keep it. Nothing gets through the gate cheap these days. Still, I sleep a bit easier for it.",
    notes: 'Answers in Sunford, Oakhaven, Ironhold and Silverbridge; the children\'s chats get kidFriend instead (voiceOf).'
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
