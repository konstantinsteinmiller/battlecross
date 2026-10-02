# art-sheets — the painter's round trip

Everything the game draws is a vector placeholder until a painted file with
the same name sits under `public/images/` (`art-todo.md` lists the names).
This folder is how those files get made: reference sheets cut from the game's
own drawings go out to an image model, the painted sheets come back, and the
slicer cuts them into the drop-in files. No code changes per painting.

| File | What | Written by |
| --- | --- | --- |
| `sheet-*.png`, `single-*.png`, `bg-*.png` | The references to attach (flat magenta ground; 256 px panels, 256 × 288 on the 3 × 2 sheets) | `pnpm art:export` |
| `*-key.png` | The same sheets with captions. For you, never for the model | `pnpm art:export` |
| `sheet-index.json` | Every panel's rect, target and measured fit | `pnpm art:export` |
| `PROMPTS-*.md` | One fenced prompt per reference | `pnpm art:export`, `pnpm art:prompts` |
| `PAINT-STATUS.md` | Which sheets are painted, sliced, or out of date | `pnpm art:prompts` |
| `painted/` | The returns, named after their reference | you, or the Art Desk |
| `painted/.sliced.json` | The slicer's receipt | `pnpm art:slice` |
| `painted/stale/` | Paintings of a drawing that has since changed | `pnpm art:slice` |

## The loop

1. `pnpm art:desk`, open the page it prints. Pick a sheet, **Copy image, then
   prompt**, paste both at the image model, download the result. The desk
   files it as `painted/<reference name>.<ext>`, slices and compresses it.
2. By hand instead: attach `sheet-items-weapons.png`, paste its block from
   `PROMPTS-ITEMS.md` (the fenced text only), save the return as
   `painted/sheet-items-weapons.png`, then `pnpm art:slice`.
3. Look at it in the game: `pnpm dev`, then `/#/models` → **Painted vs drawn**.
4. `pnpm compress-folder-with-backup`, then `pnpm art:prompts` to refresh
   `PAINT-STATUS.md`.

A bad return is fixed in the prompt (`src/game/art/artSheet.ts`), not in the
file: a hand fix does not survive the next re-roll.

## Commands

```bash
pnpm art:status            # which drop-ins are on disk, per kind
pnpm art:prompts           # rewrite PROMPTS-*.md and PAINT-STATUS.md (no browser)
pnpm art:prompts --check   # exit 1 if a prompt document is out of date
pnpm art:export            # redraw the references (own dev server + headless Chrome)
pnpm art:export --only sheet-items-weapons
pnpm art:slice --dry       # print what would be written, write nothing
pnpm art:slice             # cut everything in painted/
```

Run `art:export` only when a DRAWING changed (`src/components/art/`).
A painting made from the old drawing is then NOT re-cut (`pnpm art:slice`
says so and leaves it alone), and `PAINT-STATUS.md` and the Art Desk mark it
"repaint". What is in the game from it stays in the game until the new
painting replaces it: the desk archives the old one to `painted/replaced/` and
cuts the new one over the same files. `pnpm art:slice --park` is for a drawing
whose SHAPE was re-cut: it moves the old painting to `painted/stale/` and takes
the files cut from it out of the game, so the game draws those again.

## Rules the slicer holds

- A painting is known by its **name**, never by its shape: four item sheets
  are 1024 × 768 and nine more are 768 × 576. A file that is not named after
  a reference is refused.
- Every sheet is 4:3, 1:1 or 16:9, the shapes the image model offers (it
  returns its own shape, not the one asked for). The skill sheets and the
  speakers sheet are 3 × 2, so their panels are 256 × 288: the drawing sits in
  the middle square and the slicer cuts that square, not the whole panel.
- Icons and portraits come back on flat magenta `#FF00FF` and are keyed to
  transparent; the game keeps drawing its own tier or class frame around them.
  The map and the ground are opaque and are never keyed.
- An ICON (items, skills, the coin) is trimmed to its own paint and scaled
  until its longest side is 90 % of the file, centred; a passive skill is
  fitted inside the round frame it is shown in. It is never enlarged by more
  than a quarter over what was painted. The references draw every icon large
  (84 % of its panel) for the same reason: it is painted the size it is shown.
- A PORTRAIT is registered onto the drawing it replaces (its measured fit),
  sitting on the bottom edge of its frame.
- Panel edges the model draws in (a paler or darker magenta line, or any line
  along the cut) are keyed out and never measured.
- The skill sheets go out with three painted weapon icons as finish
  references, attached BEFORE the sheet (the prompt documents say which).
- Output sizes: items and skills 192 px, portraits 256 px, the coin 64 px,
  the map 1376 × 768, the ground 256 px.
