# Art — drop-in list

The whole game draws itself. Characters, enemies, bosses and props are
low-poly rounded models built in code (`src/game/models/*`), and levels are
merged procedural geometry with canvas-baked textures. There is no bitmap to
replace for a model; the procedural version IS the art.

What CAN be dropped in:

## 1. Level detail maps — `public/images/textures/`

Each file replaces the procedural cell. It is picked up at build time (dev
reloads by itself), and a missing file keeps the procedural one.

| File | Replaces | Spec |
| --- | --- | --- |
| `floor.webp` | the floor plate (one 3 m cell) | 256×256 or 512×512, GREYSCALE, mid-to-light grey (#b0–#f0), panel seams, bevels, rivets. Must tile against itself on all four edges. |
| `wall.webp` | the wall panel (one 3 m × 4.2 m cell) | same size and palette. The TOP of the image is the top of the wall. Tiles left↔right; top and bottom do not need to tile. |

The colour comes from each sector's theme (vertex colours), so keep these
neutral grey: a coloured map would tint every sector the same. `.png` and
`.jpg` work too; `.webp` is smallest.

## 2. Store and portal art (for submission pages, not loaded by the game)

The in-game app icon is done: `public/icons/` (192, 512, maskable 512, apple
touch 180) and `public/favicon.ico`, all rendered from `public/icons/icon.svg`.

| Asset | Size | Notes |
| --- | --- | --- |
| Poki thumbnail | ≥ 628×628, 1:1 | full-bleed, NO text (Poki rule) |
| Landscape cover | 1920×1080 (16:9) | Cobalt mid-shot firing a charged shot in a sector corridor, logo top-left |
| Portrait cover | 800×1200 (2:3) | Cobalt full body on the lab teleporter, logo top |
| Square icon | 512×512 | helmet emblem (use `public/icons/icon.svg`) |
| Screenshots | 1280×720 × 4 | combat, a Core Master fight, hub/circuits, loot results |

Check each portal's current spec before uploading (CrazyGames, Playgama,
GamePix and GameMonetize each publish their own sizes). Every image must be
original: the look is "blue-bomber era", but no character, logo or level from
an existing game.

## 3. Not overridable by design

- 3D models and animation (hero, 7 machine archetypes, 6 Core Masters, NPCs,
  props): procedural rigs.
- Particles, telegraph rings, glows: generated textures.
- HUD and hub UI: CSS plus the shared SVG icon set (`src/components/icons`).
