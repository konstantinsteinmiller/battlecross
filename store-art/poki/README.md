# Poki thumbnail

Rendered from the game's real rig: Flux in his default look, a charge
building in the arm cannon, on a backdrop built by the game's own scene code.
Nothing here ships. Only `public/` is copied into `dist/`, so this folder never
reaches the Poki zip.

| File | What |
| --- | --- |
| `thumbnail-1256.png` | master, 1256×1256, lossless |
| `thumbnail-628.png` | upload size, 628×628 |
| `thumbnail-628.jpg` | the same at about 40 % of the PNG's size (mozjpeg q80, SSIM 0.996 against the PNG) |
| `preview-200.png`, `preview-128.png` | the pick at Poki tile sizes, to check it still reads |
| `variants/*.png`, `variants/sheet.png` | every composition at 628 px, side by side |

**The pick is `sector`.** Flux is in a Volt Tower room with a Rotor Drone over
his shoulder. The purple and the red drone stand out on Poki's mint page, and
the drone shows what the game is about at a glance. At 128 px the visor eyes
and the charge still read. **`lab`** is the cleaner alternative: one subject
on the hub's navy lab with a bigger face. **`full`** (head to boots on the pad)
is the weakest: the figure is small, and the pad's cyan disc blends into
Poki's mint at tile size.

Poki's rules, as checked: square and at least 628 px, full-bleed, no text,
one clear subject in its default appearance, a sense of motion (the charge),
and nothing close to `#83FFE7`, Poki's playground colour. No pixel of the
pick is within CIE76 ΔE 38 of it. The render script enforces ΔE ≥ 10.

## Re-render

```bash
node scripts/render-thumbnail.mjs                # starts its own dev server, renders all, writes here
node scripts/render-thumbnail.mjs --port 2194    # reuse a running `pnpm dev`
node scripts/render-thumbnail.mjs --pick lab     # make another variant the thumbnail
node scripts/render-thumbnail.mjs --only sector  # render just one variant
```

It drives its own headless Chrome on a throwaway profile and reads the WebGL
canvas directly, so the boot loader or any other overlay never lands in the
picture. It renders at 2512 px (628 CSS px at deviceScaleFactor 4) and scales
down with Lanczos, which gives the outlines 2×2 supersampling in the master
and 4×4 in the 628.

## Source view (dev only)

`pnpm dev`, then open `#/models?m=thumb&v=sector` (or `v=lab`, `v=full`).
`src/views/ModelLab.vue` holds the compositions (the `THUMB` presets: camera,
pose, the charge and the drone). `v=sector` also takes `&theme=blaze` and so
on to try another sector's room. In the browser console,
`__lab.thumb({ fov: 40, yaw: 0.4, pose: { head: [0, -0.3, 0] } })` re-poses
and re-frames without a reload. Copy the values you like into the preset,
then re-run the script.

Still to make: the **animated** thumbnail, which Poki requires before global
release (square, 4–6 s). `tools/preview-video` has the square format for it.
