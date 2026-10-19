# Generated spell sounds

Owner decision 53 (roadmap #101): the runtime keeps its layered synthesis per
element and skill family as the shipped spell sound. These files are the SAME
synthesis rendered to disk, kept here, outside `public/`, so nothing in the
bundle or the runtime changes until the owner moves them.

- 46 files, mono, 44.1 kHz, Ogg Vorbis (q3), 0.41 MB in total (`manifest.json`
  lists each file with its synthesis event name, kind, family, duration, bytes,
  RMS and peak).
- Kinds: `cast` (generic cast plus one per element/skill family), `skillCast`
  (the nine skills with a cast of their own), `impact` (one per element
  family), `element` (fire, ice, holy, shadow, poison, blood, quake, beam,
  explode, teleport).
- Levels: each file is trimmed of leading and trailing silence, lifted to one
  RMS (about -22 dBFS; soft or noisy sounds such as `teleport` and `ice` end up
  2-4 dB under it because a limiter holds every peak under -3 dBFS) and nothing
  clips (decoded peaks stay below -1.5 dBFS).
- Not covered: weapon swings and hits, crowd, UI, rewards and the other
  non-spell effects. Each file is one take with no pitch/level variety; the
  runtime adds +-5 % pitch itself for the sounds in its `VARY` set.

## Shipping them later (one move)

`sound-todo.md` describes the drop-in: a file named after the sound under
`public/audio/sfx/<name>.ogg` replaces the synthesised version at the next
build (`src/game/assets/overrides.ts`). The file names here are already those
names, so shipping is:

```
cp sound-src/generated-spells/*.ogg public/audio/sfx/
```

(do not copy `manifest.json` or this README). Two things to know first: the
drop-in path plays files at `FILE_GAIN` 0.55 in `synth.ts` (meant for -14 LUFS
masters; these sit about 8 dB lower, so raise `FILE_GAIN` or the files for a
matched level), and a drop-in replaces the synthesis for that name entirely.

## Compare by ear

Open any `.ogg` in a player next to the game (the synth is what plays in the
game; `tools/sfx-review` renders A/B pages of the recipes).

## Regenerate

```
npm run sound:spells
```

Renders the recipes (`recipeFor` in `src/game/audio/synth.ts`) offline in a
private headless Chrome, levels and encodes with ffmpeg (must be on PATH), and
rewrites this folder's `.ogg` files and `manifest.json`. The synthesis uses
random noise, so durations and bytes differ a little per run; the
`spellSoundsManifest` test only checks that manifest and folder agree.
