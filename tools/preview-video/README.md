# Gameplay preview videos — Battlecross

`pnpm preview:video` records scripted gameplay to mp4, frame by frame on a
virtual clock, in the sizes the portals ask for. The recorder (`record.mjs`,
`lib/`) is the generic one from the `gameplay-video-pipeline` skill; what is
this game's is `preview.config.mjs`, `scenarios/` and the seam in
`src/game/previewFeed.ts`. The module contract is [`CONTRACT.md`](./CONTRACT.md).

```bash
pnpm preview:video                                  # everything: 4 formats × success + fail
pnpm preview:video --formats 10s --scenarios success --orientations landscape --quality high
pnpm preview:video --formats crazygames             # the CrazyGames cut (16 s, 1920×1080 + 1080×1620)
pnpm preview:video --formats poki                   # Poki's animated thumbnail (5 s, 1080×1080, 60 fps)
pnpm preview:video --only-setup                     # stop on each take's opening frame
pnpm preview:video --url-param feed=pure            # the world only: no health bars, no rings
pnpm preview:video --no-clean                       # with the whole HUD on (a trailer, a bug report)
```

Output goes to `preview-videos/<quality>/` (gitignored): upload `high/`
(H.264 4:2:0, CRF 14); `lossless/` is the archive. Each clip has a `.png`
poster beside it. A full run is 14 clips and takes a while (each frame is a
real render): record one format while iterating.

It starts its own dev server on port **2069** and its own headless Chrome,
checks that the port really serves "Battlecross", and stops both at the end.
The dev server never talks to the leaderboard, so a recorded win posts nothing.

## The clips

| Scenario | Formats | Story |
| --- | --- | --- |
| `success` | 10 s, CrazyGames 16 s, Poki 5 s | The Goblin King falls: a Pyromancer clears his court with fire, the finishing blow lands on a hit-stop, the chest and the coins |
| `fail` | 10 s, CrazyGames 16 s, Poki 5 s | One hit short: a Shadowblade has the Ember Lord's court on the run and falls with no potion left |
| `success-30s` | 30 s | Three places, one hero growing: plains → lava crags → the Frost Jarl in the snow, cut |
| `fail-30s` | 30 s | Under-levelled and greedy: two wins at home, then the tundra seven levels too early |

Beats in the short sheets are FRACTIONS of the clip, so one sheet plays three
lengths; the fight is staged shorter for the short ones.

## How a take is made

1. **Boot** on a seeded save past every first-time moment (`saveFixture` in
   `scenarios/_drive.mjs`), wait out the splash, and freeze the game.
2. **Stage.** `__preview.hero({ level, cls })` makes the hero a
   level-appropriate build of one class; `__preview.build(node)` builds a
   place and keeps it; `cut(shot)` shows it in one frame; `stage({...})` puts
   the hero a few metres short of a pack and sets the health bars to where the
   story needs them. Nothing is saved (the profile is sandboxed).
3. **Roll.** The hero is handed to the reference player from the balance tests
   (`src/game/sim/bot.ts`), deciding on SIMULATION time, so a take plays the
   same at 30 and 60 fps. `Math.random` is re-seeded at the top of the take.
4. **Anchor beats on state.** Hit-stop stretches engine time, so a sheet
   waits for "the boss is dead" (`t.untilState`), bounded by the clock, and
   logs a state line per beat. Read the log: it is the beat sheet's proof.

The result screen is held back while `?preview=1` is on, so a clip can run
through a boss's fall into the chest and the coins.

## What a clean feed hides, and what it keeps

The recorder hides all DOM except what `clean.keep` names. In this game that
removes the HUD, the menus, the control lessons, the damage numbers and the
toasts. It keeps the scene's canvas and three full-screen moments that are
feel, not interface: the white flash of a win, the red edge of a hit, the
low-health pulse.

What the renderer itself paints is behind `?feed=`:

- `feed=preview` (default): health bars over heads and the rings under the
  hero and the target stay. They are wordless and they are how a viewer reads
  the fight.
- `feed=pure`: those are hidden too.

## Traps (each one cost a take somewhere)

- **Staging decides the clip.** If the log says "the King still stands", the
  boss was staged too high for that clip length: lower `bossHp` (see `kingAt`
  in `success.mjs`). If the kill lands in the first third, raise it.
- **Softness.** The renderer caps its pixel ratio at 1.6 for a touch device
  and 1 for a weak one. Every orientation therefore records WITHOUT touch
  emulation at dpr 2, and the URL pins `device=normal&scenery=full`. `boot()`
  warns if the canvas is not the clip's width.
- **A hidden surface takes no input.** In a clean run the gesture surface is
  hidden, so real pointer input is dead: drive `__preview` / the sim, never
  the mouse.
- **The world map and the towns** are not combat and the map is DOM: they
  are trailer material (`--no-clean`), not portal cuts.
- **Port ownership.** If 2069 is taken by another game the run refuses; it
  never records the wrong title.
- **Do not edit sources during a take** on a slow machine: the recording page
  ignores hot reload, but the dev server restarting under it can stall a frame.

## Portal specs (checked 2026-09)

- **CrazyGames:** 15–20 s, 1920×1080 and 1080×1620 (2:3, not 9:16), ≤ 50 MB,
  no sound, no logos / promotional text / cursor / black bars; the cover is
  the opening frame.
- **Poki:** square 1080×1080, 4–6 s, ≥ 50 fps, muted, ≤ 100 MB, action
  centred.
- **Playgama, GameMonetize:** no published video spec: reuse the CrazyGames
  landscape file.
