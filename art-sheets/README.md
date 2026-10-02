# art-sheets — the painter's round trip

Everything the game draws is a vector placeholder until a painted file with
the same name sits under `public/images/` (`art-todo.md` lists the names).
This folder is how those files get made: reference sheets cut from the game's
own drawings go out to an image model, the painted sheets come back, and the
slicer cuts them into the drop-in files. No code changes per painting.

| File | What | Written by |
| --- | --- | --- |
| `sheet-*.png`, `single-*.png`, `bg-*.png` | The references to attach (flat magenta ground, 256 px panels) | `pnpm art:export` |
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
A painting made from the old drawing is then refused by the slicer and parked
in `painted/stale/`, with the files that were cut from it.

## Rules the slicer holds

- A painting is known by its **name**, never by its shape: four item sheets
  are 1024 × 768. A file that is not named after a reference is refused.
- Icons and portraits come back on flat magenta `#FF00FF` and are keyed to
  transparent; the game keeps drawing its own tier or class frame around them.
  The map and the ground are opaque and are never keyed.
- Every panel is registered onto the drawing it replaces (its measured fit),
  so an icon painted larger or off-centre still lands where the vector was.
- Output sizes: items and skills 192 px, portraits 256 px, the coin 64 px,
  the map 1376 × 768, the ground 256 px.
