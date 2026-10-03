# Sound to-do: what a recorded file replaces

All audio is synthesised: 45 sound-effect recipes (`src/game/audio/synth.ts`)
and a code-composed soundtrack (the score in `src/game/audio/songs.ts`, its
instruments in `voices.ts`). Nothing is downloaded, and everything runs on one
AudioContext, so the ad, pause and mute gates cover every sound.

A file dropped into `public/audio/` under the name of the thing it replaces
takes over at the next build (`src/game/assets/overrides.ts`).

- Sound effects: `public/audio/sfx/<name>.ogg` (also `.mp3` `.m4a` `.wav`)
- Music and jingles: `public/audio/music/<id>.ogg` (also `.mp3` `.m4a`)

Rules: mono or stereo, 44.1 kHz, effects trimmed with no leading silence and
normalised to about −14 LUFS. Drop-ins are turned down to sit with the synth
set, and there is one trim per kind: `FILE_GAIN` in `synth.ts` for sound
effects (0.55, 45 % quieter than their peak) and `FILE_GAIN` in `music.ts`
for music and jingles (0.35). Adjust the one that matches for a whole recorded
set. Music loops must loop seamlessly. Keep the total small: the synth set
costs zero bytes.

## Sound effects (48)

| Group | Names |
| --- | --- |
| Weapons | `swing` `swingHeavy` `shoot` `cast` |
| Impacts | `hit` `hitHeavy` `crit` `block` `dodge` `hurt` |
| Elements | `fire` `ice` `holy` `shadow` `poison` `blood` `quake` `beam` `explode` `teleport` |
| Abilities | `summon` `heal` `shieldUp` `roar` `telegraph` `overheat` |
| Enemies | `alert` `bossIntro` `death` `deathBig` |
| Rewards | `coin` `loot` `lootRare` `lootEpic` `lootLegend` `chest` `levelUp` `potion` |
| UI | `denied` `uiClick` `uiOpen` `uiClose` `uiEquip` `uiBuy` `uiLearn` `uiPoint` `uiChoice` `mapMove` |

What each one is for is in the comments of `RECIPES` in `synth.ts`. The
frequent ones (`swing`, `hit`, `shoot`, `cast`, `coin`, `death`…) are played
with ±5 % pitch and ±10 % level variation, files included, so one good take is
enough.

## Music

The score is a chamber set composed in code: solo violin, string section,
cello, plucked strings and piano, with hand percussion that comes and goes.
Each place has a theme (about 70 s a pass); between two passes of it the
sequencer plays the travelling piece once, so a visit never loops one tune.
When a boss wakes, the boss theme crossfades in and the zone's theme returns
when the fight is over (`setBossMusic` in `src/use/useSound.ts`). The "Calm"
music style in the options plays the town theme everywhere.

Which zone look plays which track is `src/game/audio/themes.ts`. A file named
after the id replaces that piece; in the rotation it plays whole passes like
the composed one does.

| File id | Piece | Key, metre, tempo | Plays in |
| --- | --- | --- | --- |
| `town` | Hearthlight | F major, 3/4, 84 | every town |
| `meadow` | Sunford Fields | D major, 4/4, 80 | plains, farmland |
| `wildwood` | Whispering Canopy | E dorian, 6/8, 84 | forest, the ruined town |
| `deep` | Hollow Echoes | C minor, 4/4, 60 | cave, mine |
| `ember` | Cinder Road | D phrygian, 4/4, 76 | ash crags, the rift |
| `frost` | Snowbound | B minor, 3/4, 66 | tundra, the peak |
| `sanctum` | The Silent Nave | G dorian, 4/4, 63 | temple, the void citadel |
| `bastion` | Iron Banner | A minor, 4/4, 88 | fortress, arena |
| `journey` | The Long Road | G mixolydian, 4/4, 72 | the travelling piece: any zone, after its theme has played |
| `boss` | Trial of Blades | D minor, 4/4, 112 | a boss is awake (loops without its intro) |
| `victory`, `defeat` | | D major / D minor | the result jingles, played once |

A recorded replacement should keep the piece's length and character: a loop
of about a minute, slow (60 to 92 beats a minute for the areas), strings and
piano in front, percussion only in places. The boss file loops whole, so a
recorded one should have no long intro. `node tools/music-render.mjs --out
<dir>` writes every composed piece as an mp3 for reference.
