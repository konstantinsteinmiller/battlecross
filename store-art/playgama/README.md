# Playgama: covers, texts and the Wrap kit

Everything the Playgama developer console asks for, ready to upload or paste.
Nothing here ships in the game: only `public/` goes into the build.

- Game form texts: [`game-form.md`](./game-form.md)
- Wrap ("Standalone site") texts: [`wrap/content.md`](./wrap/content.md)
- Images are rendered from the game's own models and scenes by
  `node scripts/render-thumbnail.mjs --set playgama` (see "Re-render" below).

## Checklist: the game form

| Console field (MCP `update_application_form`) | Put in |
| --- | --- |
| Title (`title`) | `Mega Droid` (must match the in-game title) |
| Description (`description`) | `game-form.md` → Description |
| How to play (`howToPlayText`) | `game-form.md` → How to play |
| Game Languages (`supportedLanguages`) | `game-form.md` → all 23 of the form's languages |
| Supported Devices (`supportedDevices`) | Desktop, Android, iOS |
| Screen Orientation (`isHorizontal`, `isVertical`) | both on |
| Game Features (`leaderboards`, `multiplayer`, `social`) | all off (see `game-form.md`) |
| Game Engine (`engine`) | Custom HTML5 (Vue 3 + three.js) |
| Link to the game elsewhere (`link`) | empty for now |
| Distribution (`distributeEverywhere`, `excludedPlatforms`) | your decision |
| Cover, square slot | `covers/square-800x800.png` (no logo) |
| Cover, portrait slot | `covers/portrait-1080x1920.png` (no logo) |
| Cover, landscape slot | `covers/landscape-1920x1080.png` (no logo) |
| Genres / tags (if the form asks) | `game-form.md` → Genres and tags |

## Checklist: the Wrap form ("Standalone site")

| Tab / field | Put in |
| --- | --- |
| Content → Game Title | `Mega Droid` |
| Content → About Game (HTML) | `wrap/content.md` → About Game |
| Content → How to Play | `wrap/content.md` → How to Play |
| Content → Game Features (min 3) | `wrap/content.md` → Game Features (7 lines) |
| Content → FAQ (min 3) | `wrap/content.md` → FAQ (6 pairs) |
| Meta & SEO → HTML Title | `wrap/content.md` (48 characters) |
| Meta & SEO → HTML Description | `wrap/content.md` (149 characters) |
| Meta & SEO → Genres | Action, Shooter, Adventure, RPG |
| Meta & SEO → Links to other platforms | empty for now |
| About Developer → name, website | your decision (placeholders in `wrap/content.md`) |
| Game Images → Horizontal cover (hero) | `wrap/hero-1920x1080.png` |
| Game Images → Game icon | `wrap/icon-1024.png` (or `wrap/icon-1024-rounded.png`) |
| Game Images → Open Graph share image | `wrap/share-1280x670.jpg` |
| Game Images → Gameplay screenshots + captions | `wrap/screens/1-…6-*.png` in order, each with its caption from `wrap/screens/captions.md` |
| Marketing & Ads → app-ads.txt | leave empty until Playgama says which lines a Wrap site needs (`wrap/app-ads.reference.txt` is their own file, for reference) |
| Marketing & Ads → Tracking | off until you run paid campaigns |

## What Playgama requires of the images

- **Covers** (game form, and what the MCP upload checks): three slots,
  exactly **800×800**, **1080×1920** and **1920×1080**, PNG or JPEG,
  **at most 10 MB**. A wrong size is refused. The wiki states no rule about
  a title or logo on covers. Covers already in the catalog carry logos
  (Arrow Gami, Bomb Banana, Chessvola) as well as none. Playgama shows the
  square one about 218 px wide in its catalog, uses the covers for the
  preview of a shared sandbox link, and cuts ad banners from them for
  its traffic campaigns.
- **Moderation rules that touch the art**: the name must match between the
  game and the draft (the Title field, and the lockup on the `covers-logo/`
  versions, say "Mega Droid", exactly as the game does), no third-party
  brands or logos, and no games built entirely from generative AI (these are
  rendered from the game's own 3D models).
- **Wrap images**: hero 16:9, at least 1280 wide; icon strictly 1:1, at
  least 512×512 (also the site's favicon and PWA icon); share image at least
  1280 wide; 3 or more screenshots, at least 1280 wide, each with a caption.

**The three cover slots get NO logo and no text.** Playgama forwards games
to YouTube Playables, whose design certification says "Developer MUST NOT
include any branding or logos in the thumbnails, description, or title",
and there is no telling which slot becomes the YouTube thumbnail. So
`covers/` holds only the three logo-free upload files, composed to fill the
frame. Flux and the action sit in the middle band of each, so a banner cut
from the centre keeps them. The versions with the logo lockup
(`store-art/brand/logo-lockup.svg`) are in `covers-logo/`, for portals that
welcome a title on the art. They are never uploaded into these slots.

The texts follow the same rule: no studio name, no portal names, no links
and no logos. The game title itself is allowed.

## Files

| File | Size | Notes |
| --- | --- | --- |
| `covers/square-800x800.png` | 800×800 | UPLOAD. Flux close-up in a Volt Tower room, a Rotor Drone over his shoulder |
| `covers/landscape-1920x1080.png` | 1920×1080 | UPLOAD. Flux fires a charged shot into a Guardroid that fills the right third, a Rotor Drone above |
| `covers/portrait-1080x1920.png` | 1080×1920 | UPLOAD. Flux head to boots fires up at a Rotor Drone in the top third |
| `covers-logo/landscape-1920x1080.png` | 1920×1080 | with the lockup on the left third (other portals) |
| `covers-logo/portrait-1080x1920.png` | 1080×1920 | with the lockup over the top third (other portals) |
| `wrap/hero-1920x1080.png` | 1920×1080 | the lockup landscape's scene, without the logo (left third free for the site's heading) |
| `wrap/share-1280x670.jpg` / `.png` | 1280×670 | the same scene cut to 1.91:1, with the logo |
| `wrap/icon-1024.png` | 1024×1024 | app icon, full bleed, badge in the maskable safe zone |
| `wrap/icon-1024-rounded.png` | 1024×1024 | app icon as the rounded tile, clear corners |
| `wrap/screens/1-charged-shot.png` … `6-hub-flux.png` | 1920×1080 | the six Wrap gameplay screenshots (real gameplay and HUD); captions in `wrap/screens/captions.md` |
| `previews/*.png`, `previews/sheet.png` | small | the three upload covers, the share image and the icon at catalog size; the sheet adds the six screenshots at 448×252, to check they read |

## Re-render

```bash
node scripts/render-thumbnail.mjs --set playgama              # starts its own dev server
node scripts/render-thumbnail.mjs --set playgama --port 2194  # or reuse a running `pnpm dev`
node scripts/render-thumbnail.mjs --set playgama --sheet      # only rebuild previews/sheet.png
```

The gameplay screenshots in `wrap/screens/` are not rendered by the script.
They are frames captured from the running game, so re-capture them when the
HUD or the models change, then rebuild the sheet with `--sheet`.

The compositions are presets of the dev-only view `#/models?m=thumb&v=<id>`
in `src/views/ModelLab.vue`. The upload covers are `sector` (square), `land`
(16:9) and `port` (9:16); the logo layouts are `wide` (16:9) and `tall`
(9:16). Render and read each at its own aspect. The script places the logo
on the `covers-logo/` and share images only, checks every size and the 10 MB
cap, and writes the previews. The output is deterministic: an unchanged scene
gives the same bytes. The machines on the covers come from
`src/game/models/enemies.ts`, so re-run the script after the models change.
