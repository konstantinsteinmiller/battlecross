# Sounds that still need a rework

**How this list was made (read this first).** I cannot listen to the game. The list comes from the code: the 49 sounds that
exist as recorded/generated files (`public/audio/sfx/*.ogg`: every `cast*`, most `impact*`, `swing*`, `shoot*`, `hitHeavy`,
`hitBlunt`, `crit`, `quake` …) are the ones you called very good. **Every other sound is still a synthesised recipe**
(`src/game/audio/synth.ts`), and those are the ones that sound like "AI cheap" synth. Within them I ranked by how often and
how loudly the player hears them. Please audition the list top-down; anything you find fine, strike off.

The second cause is **reuse**: every boss attack in the game goes through the same handful of sounds, so Tusker's gore, the
Warden's drill, the Hydra's bite and the Dragon's breath all read as "the same generic boss noise".

```
boss attack fx            → sound it plays today (zoneMode.fxSound)
roar (20 uses)            → roar            (synth)
quake / slam / spike      → quake           (file, good)  ← same file for ~30 different attacks
burst:rock|ember|water|frost|void → explode (synth)        ← same for all five elements
breath                    → fire            (synth)
summon / deploy           → summon          (synth)
beam / beams              → beam            (synth)
dash / cleave             → swingHeavy      (file)
an enemy's unnamed cast   → telegraph       (synth, at 70 % gain)
boss wakes                → bossIntro       (synth)
boss dies                 → deathBig        (synth)
```

## 1. Boss and enemy attacks (highest priority)

| Sound | Plays for | Why it feels cheap | ElevenLabs prompt (≈ duration) |
| --- | --- | --- | --- |
| `telegraph` | the wind-up of every enemy skill that has no sound of its own | one short synth rise for everything; carries no information about the attack | "A monstrous creature drawing breath and tensing before a heavy attack, low guttural inhale, creaking leather and straining muscle, rising tension, no music, no voice words" (1.0 s) |
| `roar` | boss roars (20 call sites) | synth formant noise, no throat or lungs | "A huge beast roaring, deep animal growl with a rough chesty snarl, close microphone, long natural tail, fantasy monster, no music" (1.8 s) — make 3: bear-like, reptilian, ogre |
| `bossIntro` | a boss wakes, siege waves | stinger made of synth pads | "Cinematic boss reveal sting: a deep sub boom, a dissonant brass hit and a distant monstrous roar, trailer style, no melody, no voice" (2.5 s) |
| `explode` | every elemental burst (rock, ember, water, frost, void) | one noise-burst for five different materials | five separate cues: "Rock burst: stones cracking and tumbling with a dry boom" · "Ember burst: a fiery whump with crackling sparks" · "Water burst: a heavy splash with a bubbling thud" · "Frost burst: ice shattering with a glassy ring" · "Void burst: a low implosion with a reversed whoosh" (1.0 s each) |
| `fire` (breath) | dragon / chimera breath | filtered noise with no body | "A dragon breathing a long stream of fire, roaring flame with a deep rumble and crackling embers, builds then fades" (2.5 s) |
| `beam` | beams (sphinx, skyfire, orbital) | a sine sweep | "A sustained energy beam firing: a rising charge, then a thick humming laser with a crackling edge, then a decaying zap" (2.2 s) |
| `summon` | summon / deploy | rising arpeggio synth | "A dark portal opening and creatures arriving: a whooshing swirl, a wet magical tear and a thump, no voice" (1.4 s) |
| `shieldUp` | boss shield / buffs | beep-like | "A magical barrier snapping up: a bright metallic ring over a soft energy swell" (0.8 s) |
| `deathBig` | boss death, escort lost | synth thud and noise | "A giant creature collapsing and dying: a last labouring growl, a huge crash of weight hitting the ground, dust and debris settling" (3.0 s) |
| `teleport` | blink, rewind | filtered sweep | "A short magical blink: a quick airy whoosh with a bright tail" (0.6 s) |
| `overheat` | the aether suit overheating | hiss and beep | "A steam vent overheating: a rising hiss, a pressure whistle, a metal clank" (1.2 s) |
| `alert` | enemies notice the hero | beep | "A goblin shout of alarm, short, croaky, one syllable, no words" (0.5 s) — several variants per species |

### Boss-specific cues worth adding (new `SfxName`s; a file named after the name drops in)

Today these attacks have no sound of their own. Give each a distinct *sonic signature* so the player can tell attacks apart by
ear with eyes shut:

| New name | For | Prompt |
| --- | --- | --- |
| `bossSlam` | ground slams (Tusker, Cyclops, Warden) | "A massive club or fist slamming the ground: a sub-bass boom, cracking stone, debris flying, short tail" (1.2 s) |
| `bossCharge` | charge / drill rush (Tusker, Warden) | "A heavy beast charging: pounding hooves building speed, grinding metal for a drill variant, rising" (1.6 s) |
| `bossGore` | tusks / horns hitting | "A huge horn goring a wooden barricade: crunching impact, splintering wood, a grunt" (1.0 s) |
| `bossPhase` | a phase change (half health) | "A boss enraged: a deep roar plus a shockwave boom and a short rock tumble" (2.0 s) |
| `bossPillar` | rotten pillars crashing | "A rotten stone pillar toppling and breaking into pieces: groaning, a crack, a heavy crash, rubble" (2.0 s) |
| `bossDaze` | boss stunned | "A big creature groggy and stunned: a dull thud, a wobbling groan, ringing ears tone" (1.2 s) |

## 2. The mimic, the gunslinger cameo (all synthesised; the mimic's were just added)

| Names | Brief |
| --- | --- |
| `mimicBurst` | "A wooden treasure chest bursting open from inside: splintering planks, iron bands snapping, a monstrous snarl" (1.4 s) |
| `mimicHop` | "A heavy wooden chest landing with a thud and a rattle of loose coins and hinges" (0.5 s) |
| `mimicChomp` | "Big wooden jaws snapping shut on a lid with teeth clacking, a wet monster growl" (0.6 s) |
| `mimicLeap` | "A chest-monster leaping: a rattling whoosh and a heavy thump on landing" (0.9 s) |
| `mimicLid` | "A wooden lid clattering off and skidding on stone" (0.8 s) |
| `cameoLand`, `cameoShot`, `cameoTower`, `cameoTowerOut`, `cameoShield`, `cameoRoar`, `cameoLeap`, `cameoClaw`, `cameoStep`, `cameoBreath`, `cameoLash` | one cinematic scene with 11 synthesised cues. Re-make as one pass: "Revolver shot with a long outdoor tail", "A metal turret deploying with servos and clicks", "A magical shield humming and taking a flame stream", "A chimera roar (lion, goat and snake)", "Whip crack of a serpent tail", "Boots running on dry grass" … 0.4–2.5 s each |

## 3. Everyday combat feedback (heard hundreds of times: biggest effect on the "feel")

| Sound | Prompt |
| --- | --- |
| `hit` | "A sword hitting a leather-clad enemy, short fleshy thwack with a tiny metallic ring" (0.3 s) — **5 variants** |
| `hitPierce` | "An arrow or dagger piercing into a body: a quick sharp thunk" (0.3 s) |
| `block` | "A sword striking a wooden shield: a solid knock, a ringing clang, a slight rattle" (0.4 s) |
| `dodge` | "A quick whoosh of cloth and air as someone sidesteps, a soft boot scuff" (0.4 s) |
| `hurt` | "A male adventurer's short grunt of pain, closed mouth, no words" (0.4 s) — also a female variant for the girl hero |
| `death` | "A goblin falling down defeated, a last short groan and a soft collapse of weight" (0.9 s) |
| `swingDagger` | "A fast dagger slash: a thin high whip of air" (0.3 s) |

## 4. Colosseum and crowds (synthesised noise reads fake quickly)

| Sound | Prompt |
| --- | --- |
| `crowdCheer` | "A medieval arena crowd cheering and applauding, hundreds of voices, stomping, a few whistles, rising then fading, no words" (3.0 s) |
| `crowdRoar` | "A hostile arena crowd roaring and booing as a fight begins, deep, stomping" (2.5 s) |
| `arenaCall` | "A herald's brass fanfare calling the next wave: two short trumpet blasts and a drum roll, medieval" (2.0 s) |
| `arenaTriumph` | "A victorious brass fanfare with timpani and a cheering crowd swelling" (3.0 s) |

## 5. Rewards and the smithy

| Sound | Prompt |
| --- | --- |
| `coin` | "A handful of gold coins dropping into a leather pouch, bright metallic clinks" (0.5 s) — 4 variants |
| `loot`, `lootRare`, `lootEpic`, `lootLegend` | a ladder: "A small treasure pickup chime" → "a brighter sparkle chime" → "an epic ascending magical shimmer with a low choir pad" → "a legendary golden fanfare with a shimmering harp glissando and a deep bell" (0.6 / 0.9 / 1.4 / 2.2 s) |
| `chest` | "A wooden treasure chest creaking open with a gentle magical sparkle" (1.0 s) |
| `levelUp` | "A heroic level-up jingle: a rising harp glissando, a warm brass swell and a sparkling chime" (1.6 s) |
| `potion` | "A glass flask being uncorked and a hero gulping a drink, a bubbling gulp" (0.8 s) |
| `forgeStrike`, `forgePerfect`, `forgeMiss` | "A smith's hammer striking glowing hot iron on an anvil, bright metallic ring with a hiss" · "the same with a golden resonant ringing and a sparkle" · "a dull thud on cold metal" (0.7 s each) |
| `heal` | "A soft restorative magical shimmer, warm chimes" (1.0 s) |

## 6. UI (low priority, quiet, but synthetic bleeps are the most obvious "synth" tell)

`uiClick` "a soft wooden button tap" · `uiOpen` "a leather-bound book opening, paper rustle" · `uiClose` "a book closing" · `uiEquip`
"a buckle and leather strap click, a metallic slide" · `uiBuy` "coins and a shop bell" · `uiLearn` "a bright magical page flip with a chime" ·
`uiPoint` "a sparkling tick" · `uiChoice` "a wooden stamp" · `mapMove` "a map being unrolled, parchment slide" · `denied` "a dull wooden thunk" (all 0.2–0.8 s).

---

## How to get a good result out of ElevenLabs sound generation

1. **Describe the source, the action, the material and the space** – not the feeling. "A wooden club slamming into cobblestones, close
   microphone, short stone tail" works; "an epic scary hit" does not.
2. **Name the three parts of an attack** and generate them as three clips: *wind-up* (rising, 0.6–1.2 s), *impact* (the transient and
   body, 0.4–1.2 s), *aftermath* (debris, ring-out, 0.5–1.5 s). Layering them in the game (or in an audio editor) is what makes boss
   attacks feel physical; one single clip of "boss attack" feels like a stock effect. Telegraph = wind-up, so the wind-up must be
   readable at the length of the in-game warning.
3. **One signature per boss.** Pick a sonic palette per boss (Tusker: wood, bone and leather · Warden: grinding metal and stone ·
   Hydra: wet and hissing · Dragon: fire and leather wing · Sphinx: wind, sand and chimes) and reuse that vocabulary in every attack
   word of the prompt. Different attacks of one boss then sound related, and different bosses sound different.
4. **Add the words that avoid the "AI" sheen:** "dry", "close microphone", "foley", "no reverb" (reverb is added in the engine) or
   "short natural tail"; "no music, no voice, no background noise" always. Say "single isolated sound". Avoid "epic", "cinematic",
   "magical" on their own: they produce stock-trailer wash.
5. **Generate 4–6 takes of each, keep the one with the cleanest transient, and use the others as variations** (the game plays the
   frequent ones with ±5 % pitch and ±10 % level, so two or three takes per frequent sound avoid the machine-gun effect).
6. **Set the duration explicitly and high prompt influence** for impacts (they should do what you wrote), lower for ambience and crowds.
7. **Clean up in an editor:** trim leading silence, normalise to about −14 LUFS, high-pass at 40–60 Hz for everything that is not a
   boom, a 10 ms fade-out so nothing clicks, and export mono 44.1 kHz `.ogg` for effects (stereo only for crowds and breath).
8. **Fit the mix:** boss attack impacts want the loudest transient in the game; hits and UI sit well below. The files are played
   at `FILE_GAIN` 0.55 (`synth.ts`), so judge loudness in-game, not in the editor.
9. **Drop-in:** save as `public/audio/sfx/<name>.ogg`; a file named after a sound replaces the synthesised one at the next build
   (see `sound-todo.md`). New names (the boss-specific ones above) need a line in `SfxName`/`SFX_NAMES` and a call in
   `zoneMode.fxSound`; the quickest wins are to give `burst:*` and `breath` their own sounds first.

**Suggested order of work:** `telegraph`, `roar`, `explode` ×5, `bossIntro`, `deathBig`, `fire`/`beam`/`summon` → then `hit`, `block`,
`hurt`, `death` → crowds and the arena → rewards and the smithy → UI.
