# Sound to-do: what a recorded file replaces

All audio is synthesised: 45 sound-effect recipes (`src/game/audio/synth.ts`)
and a code-composed soundtrack (`src/game/audio/songs.ts`). Nothing is
downloaded, and everything runs on one AudioContext, so the ad, pause and
mute gates cover every sound.

A file dropped into `public/audio/` under the name of the thing it replaces
takes over at the next build (`src/game/assets/overrides.ts`).

- Sound effects: `public/audio/sfx/<name>.ogg` (also `.mp3` `.m4a` `.wav`)
- Music and jingles: `public/audio/music/<id>.ogg` (also `.mp3` `.m4a`)

Rules: mono or stereo, 44.1 kHz, effects trimmed with no leading silence and
normalised to about −14 LUFS (drop-ins are played 45 % quieter than their
peak to sit with the synth set; adjust `FILE_GAIN` in `synth.ts` for a whole
recorded set). Music loops must loop seamlessly. Keep the total small: the
synth set costs zero bytes.

## Sound effects (45)

| Group | Names |
| --- | --- |
| Weapons | `swing` `swingHeavy` `shoot` `cast` |
| Impacts | `hit` `hitHeavy` `crit` `block` `dodge` `hurt` |
| Elements | `fire` `ice` `holy` `shadow` `poison` `blood` `quake` `beam` `explode` `teleport` |
| Abilities | `summon` `heal` `shieldUp` `roar` `telegraph` `overheat` |
| Enemies | `alert` `bossIntro` `death` `deathBig` |
| Rewards | `coin` `loot` `chest` `levelUp` `potion` |
| UI | `denied` `uiClick` `uiOpen` `uiClose` `uiEquip` `uiBuy` `uiLearn` `uiPoint` `uiChoice` `mapMove` |

What each one is for is in the comments of `RECIPES` in `synth.ts`. The
frequent ones (`swing`, `hit`, `shoot`, `cast`, `coin`, `death`…) are played
with ±5 % pitch and ±10 % level variation, files included, so one good take is
enough.

## Music

The sequencer plays one theme per place, and rotates two shared songs in
after a while. The track ids are the predecessor's (an electronic set); they
are mapped to the zones in `THEME_TRACK` in `src/game/flow.ts`. A file named
after the id replaces that theme.

| File id | Plays in |
| --- | --- |
| `hub` | every town |
| `gale` | Sunford Plains |
| `drill` | Goblin Hollows (cave) |
| `cryo` | Whispering Woods, Frostbite Tundra |
| `tide` | Oakhaven Outskirts, Sunken Temple |
| `blaze` | Ashen Crags, the Colosseum |
| `magnet` | Ironhold Mines |
| `neon` | Citadel of the Void |
| `rotor` | Dragon's Peak |
| `fortress` | Dread Fortress |
| `volt` | The Void Rift |
| `scrapyard` | Oakhaven in ruins |
| `boss` | a boss is awake |
| `drift`, `circuit` | the two rotation songs (any zone, after the theme has played) |
| `victory`, `defeat` | the result jingles |

**Wanted:** a fantasy score. Seven themes cover it (town, plains / farmland,
forest, cave / mine, fire, ice / temple, void / fortress) plus a boss theme
and the two jingles. When they exist, give the zones their own ids instead of
sharing (`THEME_TRACK`), or compose them in the sequencer (`songs.ts`) so
they cost no download. This is roadmap item #16.
