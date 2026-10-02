# Battlecross

A cute, low-poly **isometric action RPG** for the web, mobile first. You start
as a militia recruit with a rusty sword and build whatever hero you want: any
hero may learn from any trainer, six active and three passive skills from
eight classes. Twelve zones, three towns, a colosseum, 44 named items, six
permanent decisions and five endings.

The design is [`GDD.md`](./GDD.md). The build order, every decision taken
where the GDD was silent, and the resume notes are in
[`game-implementation-plan.md`](./game-implementation-plan.md).

Built with Vue 3 + TypeScript + three.js + Vite (pug, Tailwind, SASS). One
codebase ships to CrazyGames, Playgama (and YouTube Playables through it),
Poki, GamePix, GameMonetize, GameDistribution, Yandex, Glitch, itch.io and
Wavedash.

---

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:2194 — check the tab title says "Battlecross"
pnpm test           # unit, integration and simulation tests (vitest)
pnpm type-check     # vue-tsc
pnpm build          # type-check + production build
pnpm qa:e2e         # real-browser play-through: desktop, phone, five viewports
pnpm qa:hydrate     # cloud-save hydration against a stubbed portal SDK
pnpm build:crazy-web | build:playgama | build:poki | build:gamepix | …
```

The game starts right in the first fight. There is no menu.

`pnpm dev` never talks to the live leaderboard (`.env.development` blanks the
URL), so test sessions put no rows on the players' board.

## How it is built

- **A pure simulation.** `src/game/sim` knows nothing of three.js or Vue: a
  fixed 60 Hz step over plain data that emits events. It runs the same in the
  browser, in Vitest (the balance tests play every zone with a scripted
  hero) and in Node. `src/game/data` holds the GDD's tables: skills, items,
  enemies, zones, quests.
- **A view that only listens.** `src/game/modes/zoneMode.ts` feeds input to
  the sim, drains its events into effects, sound, camera shake and hit-stop,
  and mirrors a throttled slice of state into a shallow-reactive `hud` object.
  Per-frame things (cooldown clocks, damage numbers, the stick) are written
  to the DOM directly and never go through Vue.
- **No art payload.** Heroes, monsters, townsfolk and props are low-poly rigs
  built in code (`src/game/gfx/rigs`: one skinned mesh and one outline mesh
  per character), with a two-tone cel shader and a screen-constant outline
  (GDD §2). Icons are vector. The only bitmaps are the app icons and the font.
- **Drop-in overrides.** A file named after an item, a skill, a portrait, a
  sound or a music track replaces the placeholder at build time. See
  [`art-todo.md`](./art-todo.md) and [`sound-todo.md`](./sound-todo.md).
- **Synthesised audio.** 45 SFX recipes and a code-composed soundtrack on one
  AudioContext, so the ad, pause and mute gates cover everything.
- **One save object.** Everything the game remembers lives in one in-memory
  object written as ONE entry, `bcross_state` (fields `bc_*`), to
  localStorage and to each portal's cloud through a SaveManager with
  per-portal strategies. A cloud save that arrives late replaces the profile
  in memory without a reload.
- **Wordless lessons.** Controls are taught by glyphs drawn where the action
  happens and retired by use, never by a timer (`src/game/coach.ts`); "?"
  brings them back. Mastery is stored per input family.
- **39 languages** with a parity test; every visible string goes through
  i18n, and tooltips quote the same numbers the simulation reads.
- **Loads fast.** A static splash paints before any script, the first zone is
  built in time slices behind the loader, shaders are compiled one material at
  a time, and the scene adopts what the loader built.

## Where things are

| Path | What |
| --- | --- |
| `src/game/engine` | renderer, the single fixed-step loop, camera, input, key bindings |
| `src/game/sim` | the simulation: grid and paths, units, combat, statuses, hero skills, enemy AI, zone generator, director, the reference bot |
| `src/game/data` | attributes, levels, skills, items, enemies, zones and towns, quests |
| `src/game/gfx` | cel material, rig kit and looks, terrain, effects, markers |
| `src/game/modes/zoneMode.ts` | a zone / town / arena visit: input → sim → view → HUD |
| `src/game/flow.ts` | travel, the end of a visit, rewards, decisions, the ad after results |
| `src/game/state` | the profile (the save), and the HUD's reactive mirror |
| `src/game/audio` | synth SFX and the music sequencer |
| `src/components/hud`, `screens`, `modals`, `game`, `art` | the Vue UI: HUD, world map, menus, item and skill cards, vector art |
| `src/components/atoms`, `molecules` | the shared F-components (buttons, modal, tabs, HUD chips) |
| `src/platforms`, `src/utils/save`, `src/use` | portal SDKs, saves, ads, pause and mute gates |
| `src/i18n/locales` | English source and 38 translations |
| `worker/` | the leaderboard (Cloudflare Worker + D1), see `worker/SETUP.md` |
| `tools/`, `scripts/` | portal release gates and deploys, art desk, video recorder, QA scripts |

## Tests

- `pnpm test`: the GDD's tables held to the letter, every world the six
  decisions can make (each keeps a trainer for every class), combat maths, a
  smoke run of every skill, generated zones walkable for every seed, the
  balance curve (a scripted hero through all twelve zones), saves and their
  cloud strategies, portal contracts, i18n coverage and parity.
- `pnpm qa:e2e` (`scripts/e2e-play.mjs`): plays the game with real mouse,
  keys and touch in its own headless Chrome, follows the loop through every
  screen, reloads to prove the save, and checks at 320×658, 658×320,
  768×1024, 1366×768 and 1920×1080 that nothing overlaps or leaves the
  screen.
- `pnpm qa:hydrate` (`scripts/hydrate-check.mjs`): the CrazyGames build
  against a stubbed SDK: a first-timer, a returning player restored from the
  cloud alone, write-back as one blob, a cloud that answers late and a slow
  cloud, each checked in memory, in the save layer and in the HUD's own text.

## Pipelines

- **Art:** `pnpm art:export` cuts reference sheets and prompts from the
  game's own drawings into `art-sheets/`; `pnpm art:desk` runs the painting
  round trip; `pnpm art:slice` cuts a painted sheet into the drop-in files;
  `pnpm art:status` says what is painted. Then
  `pnpm compress-folder-with-backup` (backups go to `public-backup/`, never
  into `public/`, where they would ship). See `art-sheets/README.md` and
  `art-todo.md`; compare painted and drawn at `/#/models` in dev.
- **Gameplay video:** `pnpm preview:video` (`tools/preview-video`): scripted
  win and fail takes at 10 s, 30 s and the CrazyGames / Poki lengths, in
  landscape and portrait.
- **Poki:** `pnpm build:poki`, `pnpm deploy:poki` (`tools/poki-deploy`; it
  refuses to run until this game's own P4D id is in `poki.config.mjs`).
- **Playgama / YouTube Playables:** `pnpm build:playgama` writes
  `dist-playgama/` behind release gates; `pnpm playgama:audit`.
- **Logo and icons:** `pnpm icons` (generated from
  `store-art/brand/logo-final.mjs`).

## Docs

- [`GDD.md`](./GDD.md): the design.
- [`game-implementation-plan.md`](./game-implementation-plan.md): decisions,
  phases, status log.
- [`roadmap.md`](./roadmap.md): what to build next for retention, playtime
  and conversion.
- [`description.md`](./description.md): store copy.
- [`art-todo.md`](./art-todo.md), [`sound-todo.md`](./sound-todo.md): what a
  dropped-in file replaces.

## Originality

Every character, place, item, name, tune and sound is this game's own. The
genre is a homage to mobile action RPGs of the early 2010s, not a copy of
any of them.
