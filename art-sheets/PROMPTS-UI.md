# Battlecross art prompts — UI and textures

Generated from `src/game/art/artSheet.ts` by `pnpm art:prompts` (and by the
bench at `/#/art-sheets` on export). Do not edit by hand: change the manifest.

Each block is one generation. The heading names the reference image to attach
and where the sliced result lands; it stays OUTSIDE the fence, so copy the
fenced text only (a markdown preview gives it a copy button). Save the return
as `art-sheets/painted/<reference name>.png`, then `pnpm art:slice`.

## UI: the gold coin  (single-ui-coin.png → images/ui/coin.webp)

```text
WHAT COMES BACK IS ONE OBJECT ON A FLAT MAGENTA GROUND.
One square image holding one object, at the size and in the spot the attached reference shows it.
· ONE object. Not a pile, not a row, not a scene.

WHAT IT IS: a thick round gold coin seen flat from the front: an orange-gold rim, a lighter raised centre disc stamped with one five-pointed star, and one short curved highlight at the upper left. NOTHING else: no hand, no sparkle, no ground, no shadow.

COLOUR — the colours the reference shows. Take the HUES from it, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it. No tilt, no perspective, no edge-on thickness.

STYLE — the same hand as every other picture in this game.
· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.
· ONE dark outline around every shape, in deep charcoal-violet (about #0F0C19, never pure black), brush-pen weight: at its heaviest about 2.5% of the panel's shorter side. Hold the picture at thumbnail size; if the outline has thinned to a hairline it is several times too thin.
· Cel shading in hard steps, no blending: a base tone, ONE shadow step (the base darkened by about a third and pushed toward blue-violet) and ONE lighter step. No airbrush, no smooth gradients, no photographic texture, no noise.
· Bright, saturated candy colours (saturation 60-85%, brightness 75-100%). Nothing muddy, grey or desaturated.
· One small, hard-edged white glint on anything metal, glass, gem or liquid.
· Light and energy are painted as SOLID shapes: a white-hot core, the colour, a darker edge. Nothing is ever see-through, hazy or ghostly.
· People are squat chibi: the head is nearly half the figure, large oval eyes with one white glint, tiny nose or none, mitten hands, no fingers.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. A sword, a ring, a flask or a rock gets the same outline, the same two-step shading and the same glint as a character.
· The attached reference is a flat stand-in. Follow its SHAPE, its SIZE in the panel and its POSITION; take nothing else from it — not its line weight, flat fills or lack of shading. Its plain shapes are notation, and a sheet that comes back as the same flat shapes neatly repainted is unusable.
AVOID: three-quarter or perspective views, realism, pixel art, thin technical line, soft glow around a shape, drop shadows, text, numbers, frames, badges or cards behind the object.
· Each object floats in its own panel at the size the reference shows. It does NOT fill its panel; do not invent anything for a panel that is blank in the reference — flat magenta and nothing else.

SIZE AND PLACE — measure against the image, not against a guess.
· In the reference the object is about 70% of the image's width and 71% of its height, centred, with a clear magenta margin on all four sides. Keep it there.
· It is shown at the size of a single letter in the game, so it must read at a glance: the simplest version of itself.

BACKGROUND — this matters more than the style.
Fill every pixel that is not an object with solid, flat, pure magenta #FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not mauve, not a soft or tinted version of it. Only the true colour can be cut away cleanly.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· Nothing sits on a card, panel, tile, badge, frame, ring or rectangle of any kind. The magenta must touch the outline of each object on every side.
· No drop shadow onto the background, and no vignette.
· No object contains magenta or hot pink.
· The candy palette above is for the OBJECTS. The ground is not part of the painting: it stays a vivid, eye-hurting #FF00FF.

KEEP ANY GLOW TIGHT. A halo, aura or bloom spreading out into the background is measured as part of the object when the return is fitted back onto the reference, so a wide aura comes back as a tiny object inside a huge smear. It also cannot be keyed: soft light over magenta turns pink rather than transparent. Any glow belongs inside the shape's own outline.

BEFORE YOU CALL IT FINISHED, check:
· There is exactly one object, and it does not reach the edge of the image.
· Every pixel that is not the object is flat, vivid #FF00FF.

OUTPUT: one square image (1:1), 1024 x 1024 pixels or larger. If your tool has an aspect-ratio control, set it to 1:1. PNG. No labels, captions, numbers or watermarks.
```

## UI: the world map parchment  (bg-ui-map.png → images/ui/map.webp)

```text
WHAT COMES BACK IS ONE FULL-BLEED PARCHMENT MAP SHEET, WITH NOTHING MARKED ON IT.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the background the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge.

WHAT IT IS: a hand-painted sheet of warm tan parchment showing a stretch of country from above, as soft regions of terrain colour that melt into the parchment between them. Following the reference: gentle green grassland at the lower left; darker green woodland in the middle; warm ash-red badlands above the middle; pale icy blue snowfields at the upper right of centre; violet haze in the far upper right corner; sea-green lowlands at the right of centre.

WHAT IT IS NOT — read this twice. The game draws every place marker, every road and every name OVER this picture, at positions it computes itself. So NOTHING painted here may look like a place: no towns, no castles, no towers, no houses, no camps, no roads, no paths, no dotted lines, no bridges, no flags, no crosses, no compass rose, no ships, no creatures, no banners, no text, no letters, no numbers. A painted town would sit beside the real marker and read as a second, wrong one.
· Terrain texture is welcome, kept small and even: tiny hill bumps, tree dots, short grass ticks, ripple marks, drifts. Nothing larger than a fingernail, nothing that reads as a landmark, nothing that draws the eye to one spot.
· Keep it calm and fairly light: dark ink labels and bright round markers sit on every part of it, and both must stay readable.

COLOUR — the reference's own: warm tan paper, with each region's colour laid softly over it where the reference shows it. Keep the regions where they are; their exact outlines are free.

THE VIEW — straight down, flat, like a printed map. No horizon, no perspective, no tilt.

STYLE — the same hand as every other picture in this game.
· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.
· ONE dark outline around every shape, in deep charcoal-violet (about #0F0C19, never pure black), brush-pen weight: at its heaviest about 2.5% of the panel's shorter side. Hold the picture at thumbnail size; if the outline has thinned to a hairline it is several times too thin.
· Cel shading in hard steps, no blending: a base tone, ONE shadow step (the base darkened by about a third and pushed toward blue-violet) and ONE lighter step. No airbrush, no smooth gradients, no photographic texture, no noise.
· Bright, saturated candy colours (saturation 60-85%, brightness 75-100%). Nothing muddy, grey or desaturated.
· One small, hard-edged white glint on anything metal, glass, gem or liquid.
· Light and energy are painted as SOLID shapes: a white-hot core, the colour, a darker edge. Nothing is ever see-through, hazy or ghostly.
· People are squat chibi: the head is nearly half the figure, large oval eyes with one white glint, tiny nose or none, mitten hands, no fingers.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. A sword, a ring, a flask or a rock gets the same outline, the same two-step shading and the same glint as a character.
· The attached reference is a flat stand-in. Follow its SHAPE, its SIZE in the panel and its POSITION; take nothing else from it — not its line weight, flat fills or lack of shading. Its plain shapes are notation, and a sheet that comes back as the same flat shapes neatly repainted is unusable.
AVOID: three-quarter or perspective views, realism, pixel art, thin technical line, soft glow around a shape, drop shadows, text, numbers, frames, badges or cards behind the object.

BEFORE YOU CALL IT FINISHED, check:
· The paper reaches all four edges of the image; there is no magenta and no border.
· There is not one building, road, marker, symbol or letter anywhere in it.
· The six regions sit where the reference has them.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## Texture: the ground detail  (bg-ground.png → images/textures/ground.webp)

```text
WHAT COMES BACK IS ONE SEAMLESS, TILEABLE, GREYSCALE TEXTURE.
One square image, 512 x 512 pixels (1:1), painted edge to edge.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one. No frame, no border, no vignette, no darker corners.

WHAT IT IS: a hand-painted detail pattern for open ground, seen straight down: large rounded blotches a little lighter and a little darker than the base, small scattered speckles, and a few short tufts of two or three strokes. The game multiplies it over each land's own colour, so it carries light and dark only.
· Flat steps only: each blotch is ONE flat grey with a clean, hand-cut edge, like cut paper. No airbrush, no smooth gradients, no photographic texture, no noise.

COLOUR — NONE. Pure greyscale: no hue at all, no tint, no warm or cool cast.
· Very light overall: the base is near white (about 90% brightness) and the darkest mark is a pale grey (no darker than about 65%). No black, no dark outline, no ink line.
· Even all over: no part of the image is noticeably darker or busier than another, or the repeat will show as a grid of patches.

IT MUST TILE. The left edge continues into the right edge and the top into the bottom with no seam: a blotch that leaves on one side comes back in on the other. The reference shows the pattern repeated twice across and twice down; paint ONE pattern that repeats the same way.

THE VIEW — straight down, flat. No horizon, no perspective, no cast shadows with a direction.

STYLE — the same hand as every other picture in this game.
· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.
· The attached reference is a flat stand-in. Follow its SHAPE, its SIZE in the panel and its POSITION; take nothing else from it — not its line weight, flat fills or lack of shading. Its plain shapes are notation, and a sheet that comes back as the same flat shapes neatly repainted is unusable.
AVOID: three-quarter or perspective views, realism, pixel art, thin technical line, soft glow around a shape, drop shadows, text, numbers, frames, badges or cards behind the object.

BEFORE YOU CALL IT FINISHED, check:
· There is no colour anywhere: it is greys only, and almost white on average.
· Put two copies side by side and one above the other: no line shows where they meet.
· Nothing in it is an object: no stones with outlines, no flowers, no footprints, no paths.

OUTPUT: one square image (1:1), 1024 x 1024 pixels or larger. If your tool has an aspect-ratio control, set it to 1:1. PNG. No labels, captions, numbers or watermarks.
```
