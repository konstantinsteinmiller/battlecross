# Battlecross art prompts — UI and textures

Generated from `src/game/art/artSheet.ts` by `pnpm art:prompts` (and by the
bench at `/#/art-sheets` on export). Do not edit by hand: change the manifest.

Each block is one generation. The heading names the reference image to attach
and where the sliced result lands; it stays OUTSIDE the fence, so copy the
fenced text only (a markdown preview gives it a copy button). Save the return
as `art-sheets/painted/<reference name>.png`, then `pnpm art:slice`.

A block with an "Attach, in this order" line goes out with finished paintings
as well: attach those FIRST and the reference LAST (the model takes the grid
from the last image). `pnpm art:desk` does this by itself.

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

READABLE AT 40 PIXELS — each of these is shown about 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the image, not against a guess.
· In the reference the object is about 82% of the image's width and 84% of its height, centred, with a clear magenta margin on all four sides. Keep it there.
· In the game it is shown smaller still, at the size of a single letter: the simplest version of itself.

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

## UI: the world map terrain  (bg-ui-map.png → images/ui/map.webp)

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED MAP OF A FANTASY REALM: ITS TERRAIN ONLY, WITH NO BUILDINGS AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the sheet the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge (the game draws the paper's edge itself).

WHAT IT IS: the terrain of a hand-drawn storybook map, drawn the way such maps are: the land flat from above, and what stands on it (mountains, trees, hills) as small upright pictures. Repaint the attached reference. Every coast, region, river, bridge, road and clearing stays exactly where the reference has it: the game lays its own drawings over the picture by position. In the reference:
· Sea along the left and the bottom edge and in the lower right corner: bright turquoise, a paler band of shallows hugging the coast, small white wave squiggles, a few rocks, a small wreck on the rocks of the left shore, a little sand island in the lower left corner and one at the right edge.
· Lower left: bright green meadow with soft hills, tufts, flowers, lone round trees and a few sheep.
· Left: olive-yellow hills dotted with grey rocks; a short river above them runs to the left shore.
· Upper left: tan highlands crowded with brown, snow-capped mountains and dark pines.
· Middle: a wood of round lollipop trees, a few in pink blossom or autumn orange; a blue river runs down its left side into the bay, with a plank bridge where a road crosses it; a ring of standing stones to the left of the wood.
· Above the middle: an ashen grey-violet waste with cracks of glowing lava, cinder rocks, dead trees, and a stream of lava running into a small pool.
· Top middle: snowfields with pale blue peaks, snow-tipped pines, drifts and frozen ponds; a river leaves them toward the lake, under a second plank bridge.
· Lower middle to right: golden farmland, a patchwork of striped fields in wheat, green and brown, with hay stooks and hedge trees.
· Right of centre: a pale green marsh of reeds around a turquoise lake with lily pads; a river runs from the lake to the sea.
· Upper right: a violet land of pale crystal spikes and dark pools; beyond it, in the top right corner, a dark crimson land of black peaks with burning tips, thorn spikes and dead trees.
· Right edge, under those: a jagged black tear in the land with a glowing hot-pink rim, running off the edge of the image.
· Pale dirt roads wind between sixteen bare, flat, oval clearings, each with a darker lip along its lower edge. Keep every road and every clearing, at its place and its size, and keep the clearings EMPTY.

WHAT IT IS NOT — read this twice. The game draws every landmark, every place marker and every name OVER this picture, on the sixteen clearings, and they change as the player travels: a place is hidden under cloud, then opens, then is marked as cleared. So the clearings stay bare ground, and NOTHING painted anywhere may be a building or a sign: no towns, no houses, no castles, no towers, no temples, no tents, no camps, no windmills, no lighthouses, no ships under sail, no people, no monsters, no flags, no banners, no crosses, no compass rose, no title ribbon, no clouds, no text, no letters, no numbers. A painted town would sit beside the real one and read as a second, wrong place.
· Do not add regions, roads, rivers or clearings the reference does not have, and do not join, move or drop any it has.
· Keep it bright and even: small landmarks and paper name tags sit on every part of it and must stay readable. No region darker or busier than the reference shows it.

COLOUR — the reference's own, region by region. Take the HUES from it, not the flatness.

THE VIEW — the map convention the reference uses: the ground from straight above, each mountain, tree and hill as a small upright picture on it. No horizon, no perspective, no tilt of the sheet.

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
· The picture reaches all four edges of the image; there is no magenta and no border.
· Laid over the reference, every coast, river, bridge, road and clearing is where the reference has it.
· The sixteen clearings are empty, and there is not one building, figure, symbol or letter anywhere in it.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## UI: the trade table backdrop  (bg-ui-trade.png → images/ui/bg-trade.webp)

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED BACKDROP FOR A GAME SCREEN: A STILL LIFE WITH NO PEOPLE AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the backdrop the screen is drawn on top of. No outer frame of your own, no vignette, no card, no matting, no rounded corners, no letterboxing.

WHAT IT IS: a merchant's wooden counter seen from straight above: warm honey-brown planks running across the whole picture, with a long runner of deep teal cloth laid down the middle from the top edge to the bottom edge, a gold band along each of its long sides. Repaint the attached reference: every object stays where the reference has it, at its size.
· LEFT: on the planks left of the cloth: a brass lantern with a glowing glass body standing near the top, a hard-edged pool of warm light on the wood around it, a small stack of gold coins, and an open ledger with a quill lying across it near the bottom.
· RIGHT: on the planks right of the cloth: brass merchant's scales near the top (one pan lower, holding a few coins), three small steel weights in a row above them, and an untied leather coin purse near the bottom with coins spilling from it.
· MIDDLE: the teal cloth with a quiet woven diamond pattern, tone on tone.

THE CALM MIDDLE — read this twice. The game lays its interface over the middle of this picture: panels, buttons and white lettering with a dark outline. The middle 44% of the width (from 28% to 72% across) is ALWAYS covered, and on a phone held upright it is all that is seen. Keep that band one quiet, even surface: no objects, no strong pattern, no bright spot, no dark hole, nothing that draws the eye. Every object lives in the outer 28% at each side, and nothing important sits in the top 12% (a bar of buttons covers it).

WHAT IT IS NOT: no people, no hands, no animals, no faces, no text, no letters, no numbers, no runes, no signs, no labels, no buttons, no frames or panels of an interface, no icons. Nothing that could be mistaken for something the player can tap.

COLOUR — the reference's own, object by object. Take the HUES from it, not the flatness.

THE VIEW — as the reference: straight on, flat, the objects as simple upright shapes. No perspective that tilts the surface away, no depth blur.

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
· The picture reaches all four edges of the image; there is no magenta and no added border.
· Laid over the reference, every object is where the reference has it.
· The middle band is calm and even, with not one object in it, and there is not one letter anywhere.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## UI: the equipment backdrop  (bg-ui-inventory.png → images/ui/bg-inventory.webp)

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED BACKDROP FOR A GAME SCREEN: A STILL LIFE WITH NO PEOPLE AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the backdrop the screen is drawn on top of. No outer frame of your own, no vignette, no card, no matting, no rounded corners, no letterboxing.

WHAT IT IS: the inside of an open adventurer's satchel seen from the front: a deep green quilted lining filling the picture, framed by the bag's stitched tan leather rim along all four edges, with two leather straps and brass buckles hanging over the top rim. Repaint the attached reference: every object stays where the reference has it, at its size.
· LEFT: a wooden weapon rack standing in the bag: two posts and two rails, a sword hanging point down, an axe beside it, and a round blue shield leaning at its foot.
· RIGHT: a wooden armour stand: a post on a foot, a steel breastplate hung on its shoulder bar and a steel helmet with a red plume on top.
· MIDDLE: the quilted green lining, lit a little lighter toward the middle.

THE CALM MIDDLE — read this twice. The game lays its interface over the middle of this picture: panels, buttons and white lettering with a dark outline. The middle 44% of the width (from 28% to 72% across) is ALWAYS covered, and on a phone held upright it is all that is seen. Keep that band one quiet, even surface: no objects, no strong pattern, no bright spot, no dark hole, nothing that draws the eye. Every object lives in the outer 28% at each side, and nothing important sits in the top 12% (a bar of buttons covers it).

WHAT IT IS NOT: no people, no hands, no animals, no faces, no text, no letters, no numbers, no runes, no signs, no labels, no buttons, no frames or panels of an interface, no icons. Nothing that could be mistaken for something the player can tap.

COLOUR — the reference's own, object by object. Take the HUES from it, not the flatness.

THE VIEW — as the reference: straight on, flat, the objects as simple upright shapes. No perspective that tilts the surface away, no depth blur.

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
· The picture reaches all four edges of the image; there is no magenta and no added border.
· Laid over the reference, every object is where the reference has it.
· The middle band is calm and even, with not one object in it, and there is not one letter anywhere.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## UI: the skills backdrop  (bg-ui-skills.png → images/ui/bg-skills.webp)

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED BACKDROP FOR A GAME SCREEN: A STILL LIFE WITH NO PEOPLE AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the backdrop the screen is drawn on top of. No outer frame of your own, no vignette, no card, no matting, no rounded corners, no letterboxing.

WHAT IT IS: a page of a star codex: a deep indigo night sky filling the picture inside a brass frame along all four edges, with turned brass ornaments in the corners and four coloured gems set into the frame down each side. Repaint the attached reference: every object stays where the reference has it, at its size.
· LEFT: two constellations of four-pointed stars joined by dotted lines (one shaped like a sword in pale blue, one like a flame in orange), a shooting star, and many small stars.
· RIGHT: two more constellations (a shield in pale gold, an hourglass in lilac), a shooting star near the bottom, and many small stars.
· MIDDLE: the dark sky with the faint rings and tick marks of an astrolabe, and only a few faint stars.

THE CALM MIDDLE — read this twice. The game lays its interface over the middle of this picture: panels, buttons and white lettering with a dark outline. The middle 44% of the width (from 28% to 72% across) is ALWAYS covered, and on a phone held upright it is all that is seen. Keep that band one quiet, even surface: no objects, no strong pattern, no bright spot, no dark hole, nothing that draws the eye. Every object lives in the outer 28% at each side, and nothing important sits in the top 12% (a bar of buttons covers it).

WHAT IT IS NOT: no people, no hands, no animals, no faces, no text, no letters, no numbers, no runes, no signs, no labels, no buttons, no frames or panels of an interface, no icons. Nothing that could be mistaken for something the player can tap.

COLOUR — the reference's own, object by object. Take the HUES from it, not the flatness.

THE VIEW — as the reference: straight on, flat, the objects as simple upright shapes. No perspective that tilts the surface away, no depth blur.

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
· The picture reaches all four edges of the image; there is no magenta and no added border.
· Laid over the reference, every object is where the reference has it.
· The middle band is calm and even, with not one object in it, and there is not one letter anywhere.

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
