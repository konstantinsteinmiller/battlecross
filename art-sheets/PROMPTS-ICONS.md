# Battlecross art prompts — UI icons, statuses, class emblems and marks

Generated from `src/game/art/artSheet.ts` by `pnpm art:prompts` (and by the
bench at `/#/art-sheets` on export). Do not edit by hand: change the manifest.

Each block is one generation. The heading names the reference image to attach
and where the sliced result lands; it stays OUTSIDE the fence, so copy the
fenced text only (a markdown preview gives it a copy button). Save the return
as `art-sheets/painted/<reference name>.png`, then `pnpm art:slice`.

A block with an "Attach, in this order" line goes out with finished paintings
as well: attach those FIRST and the reference LAST (the model takes the grid
from the last image). `pnpm art:desk` does this by itself.

## Icons: class emblems  (sheet-icons-classes.png → images/icons/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 9 SEPARATE OBJECTS, NOT ONE PICTURE.
One square image, 768 x 768 pixels (1:1), holding 9 separate small drawings laid out 3 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 9 panels. Not 1, not 6, not 12. Exactly 3 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· 1 panel is BLANK in the reference. Leave it flat magenta: do not invent anything for it.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR SIGN — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No hand, no character, no ground, no shadow, no sparkle cloud, no scenery.
· The game puts each one on its own button, badge or frame. Nothing here sits on a tile, badge, ring, disc or button of its own.
· Where a panel is a SIGN rather than a thing (an arrow, a tick, a cross, a plus, a question mark, a triangle), paint it as a thick, solid, enamelled token shape with the same volume, outline and glint as everything else — never as a flat letter from a font.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a crest: a gold-rimmed shield tilted forward with a six-pointed impact burst at its upper right edge. Main colour: gold (about #ffd84a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 2 (row 1, column 2): a crest: a violet crescent curving to the right, with three short speed lines trailing on its left. Main colour: violet (about #9c7bff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 3 (row 1, column 3): a crest: a teardrop-shaped ball of flame with a yellow core, flying up and to the right, with three short streaks behind it. Main colour: orange (about #ff7a3a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 4 (row 2, column 1): a crest: a steel knight's helmet with a face opening, topped with a short rounded plume. Main colour: amber (about #ffb04a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 5 (row 2, column 2): a crest: an hourglass with gold end plates, set in the middle of a solid disc. Main colour: cyan (about #5fd8ff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 6 (row 2, column 3): a crest: a conical glass laboratory flask with a cork, one third full of red liquid with two small bubbles in it. Main colour: crimson (about #ff4a6a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 7 (row 3, column 1): a crest: a steel pistol pointing right with a small four-pointed spark at its muzzle. Main colour: teal (about #4ff0c8). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 8 (row 3, column 2): a crest: one tall sharp rock spike rising from a flat ground line, with a small spike on each side of it. Main colour: sand (about #c79a5a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 9 (row 3, column 3): BLANK — flat magenta and nothing else.

COLOUR — each panel's line names its main colour, and the reference shows it. Keep it: the game shows these on coloured buttons and dark frames, and the colour is how a player finds the right one. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 8 are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one panel has volume and the next is flat is not one set.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The silhouette is the reference's, unchanged. Put the volume INSIDE the outline; do not add parts around it.
· The accent colour stays the dominant colour of every panel.

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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable.

READABLE AT 24 PIXELS — each of these is shown between 24 and 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size. At 24 pixels a shape has room for one idea: keep only the silhouette and its one or two biggest colour areas.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
· Paint each one as LARGE as the reference shows it: it takes up most of its panel, with a narrow, even margin of magenta around it. A small drawing in the middle of a big empty panel is the wrong answer.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.

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

NOTHING IS EVER SEE-THROUGH. Every piece that is present is painted at full, solid colour; light is painted as solid shapes (hard-edged rays, solid rim bands), never as a soft bloom around a shape and never half-transparent or ghostly.

BEFORE YOU CALL IT FINISHED, count and check:
· 3 panels across, 3 down, 9 in all.
· The canvas is square, 1:1.
· Each panel holds exactly one thing and nothing else, and no ring, disc, button or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· Every panel would still be recognised 24 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 768 pixels (1:1, square), or the same shape larger. If your tool has an aspect-ratio control, set it to 1:1 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Icons: status effects (1 of 3)  (sheet-icons-status-1.png → images/icons/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR SIGN — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No hand, no character, no ground, no shadow, no sparkle cloud, no scenery.
· The game puts each one on its own button, badge or frame. Nothing here sits on a tile, badge, ring, disc or button of its own.
· Where a panel is a SIGN rather than a thing (an arrow, a tick, a cross, a plus, a question mark, a triangle), paint it as a thick, solid, enamelled token shape with the same volume, outline and glint as everything else — never as a flat letter from a font.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a five-pointed star burst with a white middle, the dizzy star of a knock on the head. Main colour: gold (about #ffd24a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 2 (row 1, column 2): a thick white arrow pointing up, above a short ground line. Main colour: gold (about #ffd24a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 3 (row 1, column 3): a thick white arrow pointing down, below a short line. Main colour: gold (about #ffd24a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 4 (row 1, column 4): an hourglass with gold end plates, set in the middle of a solid pale disc. Main colour: sky blue (about #7fd8ff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 5 (row 2, column 1): a chunky grey rock with one crack across it. Main colour: orange (about #b9a58a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 6 (row 2, column 2): a six-pointed ice crystal with a white middle. Main colour: sky blue (about #9fdcff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 7 (row 2, column 3): a white cartoon skull seen from the front. Main colour: violet (about #c08aff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 8 (row 2, column 4): a small snail on a ground line: a domed shell and a green head with two short stalks. Main colour: sky blue (about #9fdcff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 9 (row 3, column 1): one thick white spiral. Main colour: violet (about #c08aff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 10 (row 3, column 2): a horn-shaped megaphone pointing right, with one curved sound arc in front of it. Main colour: red (about #ff6b5a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 11 (row 3, column 3): a steel shield with a jagged crack running down it. Main colour: red (about #ff6b5a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 12 (row 3, column 4): a thick arrow pointing down. Main colour: red (about #ff6b5a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.

COLOUR — each panel's line names its main colour, and the reference shows it. Keep it: the game shows these on coloured buttons and dark frames, and the colour is how a player finds the right one. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 12 are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one panel has volume and the next is flat is not one set.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The silhouette is the reference's, unchanged. Put the volume INSIDE the outline; do not add parts around it.
· The accent colour stays the dominant colour of every panel.

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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable.

READABLE AT 24 PIXELS — each of these is shown between 24 and 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size. At 24 pixels a shape has room for one idea: keep only the silhouette and its one or two biggest colour areas.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
· Paint each one as LARGE as the reference shows it: it takes up most of its panel, with a narrow, even margin of magenta around it. A small drawing in the middle of a big empty panel is the wrong answer.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.

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

NOTHING IS EVER SEE-THROUGH. Every piece that is present is painted at full, solid colour; light is painted as solid shapes (hard-edged rays, solid rim bands), never as a soft bloom around a shape and never half-transparent or ghostly.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc, button or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· Every panel would still be recognised 24 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Icons: status effects (2 of 3)  (sheet-icons-status-2.png → images/icons/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR SIGN — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No hand, no character, no ground, no shadow, no sparkle cloud, no scenery.
· The game puts each one on its own button, badge or frame. Nothing here sits on a tile, badge, ring, disc or button of its own.
· Where a panel is a SIGN rather than a thing (an arrow, a tick, a cross, a plus, a question mark, a triangle), paint it as a thick, solid, enamelled token shape with the same volume, outline and glint as everything else — never as a flat letter from a font.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a round target of three rings. Main colour: red (about #ff6b5a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 2 (row 1, column 2): a flame with a yellow core. Main colour: orange (about #ff8a2a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 3 (row 1, column 3): a fat green droplet with one small white bubble in it. Main colour: green (about #8dff5a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 4 (row 1, column 4): a fat red droplet with one white glint. Main colour: red (about #ff4a6a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 5 (row 2, column 1): a white round clock face with two hands. Main colour: sky blue (about #7fd8ff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 6 (row 2, column 2): two thick arrowheads pointing right, one just behind the other. Main colour: green (about #67e08a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 7 (row 2, column 3): a steel dagger pointing up and to the right, with two short speed lines behind it. Main colour: green (about #67e08a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 8 (row 2, column 4): a steel sword pointing up and to the right, with a small gold arrow pointing up beside it. Main colour: orange (about #ffb04a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 9 (row 3, column 1): a shield with a white arrow pointing up on its face. Main colour: sky blue (about #50aaff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 10 (row 3, column 2): a green playing-card heart with a white plus sign on it. Main colour: green (about #67e08a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 11 (row 3, column 3): a red playing-card heart with a white arrow pointing up on it. Main colour: red (about #ff4a6a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 12 (row 3, column 4): a white shield set in the middle of a solid gold disc. Main colour: gold (about #ffe9a8). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.

COLOUR — each panel's line names its main colour, and the reference shows it. Keep it: the game shows these on coloured buttons and dark frames, and the colour is how a player finds the right one. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 12 are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one panel has volume and the next is flat is not one set.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The silhouette is the reference's, unchanged. Put the volume INSIDE the outline; do not add parts around it.
· The accent colour stays the dominant colour of every panel.

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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable.

READABLE AT 24 PIXELS — each of these is shown between 24 and 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size. At 24 pixels a shape has room for one idea: keep only the silhouette and its one or two biggest colour areas.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
· Paint each one as LARGE as the reference shows it: it takes up most of its panel, with a narrow, even margin of magenta around it. A small drawing in the middle of a big empty panel is the wrong answer.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.

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

NOTHING IS EVER SEE-THROUGH. Every piece that is present is painted at full, solid colour; light is painted as solid shapes (hard-edged rays, solid rim bands), never as a soft bloom around a shape and never half-transparent or ghostly.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc, button or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· Every panel would still be recognised 24 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Icons: status effects (3 of 3)  (sheet-icons-status-3.png → images/icons/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· 2 panels are BLANK in the reference. Leave them flat magenta: do not invent anything for them.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR SIGN — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No hand, no character, no ground, no shadow, no sparkle cloud, no scenery.
· The game puts each one on its own button, badge or frame. Nothing here sits on a tile, badge, ring, disc or button of its own.
· Where a panel is a SIGN rather than a thing (an arrow, a tick, a cross, a plus, a question mark, a triangle), paint it as a thick, solid, enamelled token shape with the same volume, outline and glint as everything else — never as a flat letter from a font.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a white cartoon skull with one thick bar struck diagonally across it. Main colour: gold (about #ffe9a8). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 2 (row 1, column 2): a wide almond-shaped eye with a dark pupil, struck through by one thick diagonal bar. Main colour: violet (about #9c7bff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 3 (row 1, column 3): a shield with a short arrow bouncing off its upper right corner. Main colour: sky blue (about #50aaff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 4 (row 1, column 4): a steel dagger pointing up and to the right, with one fat green droplet falling from its blade. Main colour: green (about #8dff5a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 5 (row 2, column 1): a six-sided steel armour shell seen from the front, with one wide visor slot across it. Main colour: teal (about #4ff0c8). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 6 (row 2, column 2): a round target of three rings. Main colour: gold (about #ffd24a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 7 (row 2, column 3): a white round clock face with two small fast-forward triangles at its lower right. Main colour: sky blue (about #7fd8ff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 8 (row 2, column 4): a glass thermometer full of red liquid. Main colour: orange (about #ff7a2a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 9 (row 3, column 1): a round red cartoon face with angry slanted brows and two dot eyes. Main colour: red (about #ff6b5a). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 10 (row 3, column 2): a white cartoon skull seen from the front. Main colour: violet (about #c08aff). Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 11 (row 3, column 3): BLANK — flat magenta and nothing else.
Panel 12 (row 3, column 4): BLANK — flat magenta and nothing else.

COLOUR — each panel's line names its main colour, and the reference shows it. Keep it: the game shows these on coloured buttons and dark frames, and the colour is how a player finds the right one. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 10 are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one panel has volume and the next is flat is not one set.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The silhouette is the reference's, unchanged. Put the volume INSIDE the outline; do not add parts around it.
· The accent colour stays the dominant colour of every panel.

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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable.

READABLE AT 24 PIXELS — each of these is shown between 24 and 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size. At 24 pixels a shape has room for one idea: keep only the silhouette and its one or two biggest colour areas.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
· Paint each one as LARGE as the reference shows it: it takes up most of its panel, with a narrow, even margin of magenta around it. A small drawing in the middle of a big empty panel is the wrong answer.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.

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

NOTHING IS EVER SEE-THROUGH. Every piece that is present is painted at full, solid colour; light is painted as solid shapes (hard-edged rays, solid rim bands), never as a soft bloom around a shape and never half-transparent or ghostly.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc, button or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· Every panel would still be recognised 24 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Icons: HUD and menu buttons  (sheet-icons-ui-1.png → images/icons/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR SIGN — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No hand, no character, no ground, no shadow, no sparkle cloud, no scenery.
· The game puts each one on its own button, badge or frame. Nothing here sits on a tile, badge, ring, disc or button of its own.
· Where a panel is a SIGN rather than a thing (an arrow, a tick, a cross, a plus, a question mark, a triangle), paint it as a thick, solid, enamelled token shape with the same volume, outline and glint as everything else — never as a flat letter from a font.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): two thick, rounded upright bars side by side, cream-white enamel with a thin gold rim. Main colour: cream white (about #f4ecd8).
Panel 2 (row 1, column 2): a chunky steel cog wheel with eight square teeth and a round hole in its middle. Main colour: steel grey (about #c9d3e4).
Panel 3 (row 1, column 3): a round cream-white token with a bold dark-blue question mark on its face. Main colour: cream white (about #f4ecd8).
Panel 4 (row 1, column 4): a folded parchment map seen from the front, three panels folded like a fan, with a green patch of land and a red dotted route on it. Main colour: parchment tan (about #e8d29a).
Panel 5 (row 2, column 1): a small head-and-shoulders bust of a young adventurer: round head with short brown hair and a blue tunic. Main colour: blue (about #4a7fd6).
Panel 6 (row 2, column 2): an open book seen from the front: two cream pages spread wide over a red leather cover. Main colour: red (about #c9483a).
Panel 7 (row 2, column 3): a sturdy brown leather satchel with a rounded flap, a gold buckle and a short carrying handle on top. Main colour: brown (about #8a5f3a).
Panel 8 (row 2, column 4): a thick cross made of two rounded cream-white bars. Main colour: cream white (about #f4ecd8).
Panel 9 (row 3, column 1): a thick, bright green tick mark with rounded ends. Main colour: bright green (about #5fd068).
Panel 10 (row 3, column 2): a gold padlock with a rounded steel shackle and a dark keyhole. Main colour: gold (about #ffd24a).
Panel 11 (row 3, column 3): a thick plus sign with rounded ends, bright green. Main colour: bright green (about #5fd068).
Panel 12 (row 3, column 4): a small closed wooden treasure chest seen from the front, with gold bands and a gold lock plate. Main colour: wood brown (about #a8733f).

COLOUR — each panel's line names its main colour, and the reference shows it. Keep it: the game shows these on coloured buttons and dark frames, and the colour is how a player finds the right one. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 12 are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one panel has volume and the next is flat is not one set.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The silhouette is the reference's, unchanged. Put the volume INSIDE the outline; do not add parts around it.
· The accent colour stays the dominant colour of every panel.

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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable.

READABLE AT 24 PIXELS — each of these is shown between 24 and 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size. At 24 pixels a shape has room for one idea: keep only the silhouette and its one or two biggest colour areas.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
· Paint each one as LARGE as the reference shows it: it takes up most of its panel, with a narrow, even margin of magenta around it. A small drawing in the middle of a big empty panel is the wrong answer.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.

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

NOTHING IS EVER SEE-THROUGH. Every piece that is present is painted at full, solid colour; light is painted as solid shapes (hard-edged rays, solid rim bands), never as a soft bloom around a shape and never half-transparent or ghostly.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc, button or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· Every panel would still be recognised 24 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Icons: screen buttons  (sheet-icons-ui-2.png → images/icons/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR SIGN — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No hand, no character, no ground, no shadow, no sparkle cloud, no scenery.
· The game puts each one on its own button, badge or frame. Nothing here sits on a tile, badge, ring, disc or button of its own.
· Where a panel is a SIGN rather than a thing (an arrow, a tick, a cross, a plus, a question mark, a triangle), paint it as a thick, solid, enamelled token shape with the same volume, outline and glint as everything else — never as a flat letter from a font.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a cream-white loudspeaker cone pointing right, with two curved sound arcs in front of it. Main colour: cream white (about #f4ecd8).
Panel 2 (row 1, column 2): the same cream-white loudspeaker cone pointing right, with a small red cross in front of it instead of sound arcs. Main colour: cream white (about #f4ecd8).
Panel 3 (row 1, column 3): a thick, rounded triangle pointing right, cream-white enamel with a thin gold rim. Main colour: cream white (about #f4ecd8).
Panel 4 (row 1, column 4): a thick circular arrow of cream-white enamel curling almost all the way round, its arrowhead at the top. Main colour: cream white (about #f4ecd8).
Panel 5 (row 2, column 1): a thick triangle pointing right followed by an upright bar, both cream-white enamel. Main colour: cream white (about #f4ecd8).
Panel 6 (row 2, column 2): a thick arrow pointing right, cream-white enamel. Main colour: cream white (about #f4ecd8).
Panel 7 (row 2, column 3): a thick arrow pointing left, cream-white enamel. Main colour: cream white (about #f4ecd8).
Panel 8 (row 2, column 4): a small cottage seen from the front: a red pitched roof over cream walls and a dark wooden door. Main colour: red (about #c9483a).
Panel 9 (row 3, column 1): a short steel sword pointing up and to the right, with a gold crossguard and a brown grip. Main colour: steel (about #d8dde8).
Panel 10 (row 3, column 2): a conical glass laboratory flask with a cork, half full of bright red liquid. Main colour: red (about #ff5a6a).
Panel 11 (row 3, column 3): a cream-white speech bubble with a short pointed tail at its lower left. Main colour: cream white (about #f4ecd8).
Panel 12 (row 3, column 4): a bone-white cartoon skull seen from the front, with round dark eye holes and a small dark nose. Main colour: bone white (about #f4ecd8).

COLOUR — each panel's line names its main colour, and the reference shows it. Keep it: the game shows these on coloured buttons and dark frames, and the colour is how a player finds the right one. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 12 are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one panel has volume and the next is flat is not one set.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The silhouette is the reference's, unchanged. Put the volume INSIDE the outline; do not add parts around it.
· The accent colour stays the dominant colour of every panel.

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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable.

READABLE AT 24 PIXELS — each of these is shown between 24 and 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size. At 24 pixels a shape has room for one idea: keep only the silhouette and its one or two biggest colour areas.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
· Paint each one as LARGE as the reference shows it: it takes up most of its panel, with a narrow, even margin of magenta around it. A small drawing in the middle of a big empty panel is the wrong answer.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.

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

NOTHING IS EVER SEE-THROUGH. Every piece that is present is painted at full, solid colour; light is painted as solid shapes (hard-edged rays, solid rim bands), never as a soft bloom around a shape and never half-transparent or ghostly.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc, button or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· Every panel would still be recognised 24 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Icons: badges, pins and help  (sheet-icons-ui-3.png → images/icons/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR SIGN — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No hand, no character, no ground, no shadow, no sparkle cloud, no scenery.
· The game puts each one on its own button, badge or frame. Nothing here sits on a tile, badge, ring, disc or button of its own.
· Where a panel is a SIGN rather than a thing (an arrow, a tick, a cross, a plus, a question mark, a triangle), paint it as a thick, solid, enamelled token shape with the same volume, outline and glint as everything else — never as a flat letter from a font.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a dark steel blacksmith's anvil seen from the side, with a small gold chevron pointing up above it. Main colour: dark steel (about #8a8fa0).
Panel 2 (row 1, column 2): a faceted cut gemstone, bright blue, with flat facets and one white glint. Main colour: blue (about #50aaff).
Panel 3 (row 1, column 3): a red gift box seen from the front, tied with a gold ribbon and a gold bow on top. Main colour: red (about #c9483a).
Panel 4 (row 1, column 4): a round cream-white token with a bold dark-blue lowercase letter i on its face. Main colour: cream white (about #f4ecd8).
Panel 5 (row 2, column 1): a heater shield seen from the front: a blue face and a gold rim. Main colour: blue (about #4a7fd6).
Panel 6 (row 2, column 2): a plump five-pointed gold star. Main colour: gold (about #ffd24a).
Panel 7 (row 2, column 3): a thick round gold coin seen flat from the front, with a raised rim. Main colour: gold (about #ffd24a).
Panel 8 (row 2, column 4): a gold cup trophy with two curled handles on a short dark base. Main colour: gold (about #ffd24a).
Panel 9 (row 3, column 1): three upright blocks of different heights side by side like a winners' podium: the tallest gold in the middle, silver on the left, bronze on the right. Main colour: gold (about #ffd24a).
Panel 10 (row 3, column 2): a single brown leather boot seen from the side, its toe pointing right. Main colour: brown (about #8a5f3a).
Panel 11 (row 3, column 3): a bright yellow lightning bolt. Main colour: yellow (about #ffd24a).
Panel 12 (row 3, column 4): two short upright posts with a double-headed arrow standing upright between them, cream-white. Main colour: cream white (about #f4ecd8).

COLOUR — each panel's line names its main colour, and the reference shows it. Keep it: the game shows these on coloured buttons and dark frames, and the colour is how a player finds the right one. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 12 are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one panel has volume and the next is flat is not one set.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The silhouette is the reference's, unchanged. Put the volume INSIDE the outline; do not add parts around it.
· The accent colour stays the dominant colour of every panel.

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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable.

READABLE AT 24 PIXELS — each of these is shown between 24 and 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size. At 24 pixels a shape has room for one idea: keep only the silhouette and its one or two biggest colour areas.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
· Paint each one as LARGE as the reference shows it: it takes up most of its panel, with a narrow, even margin of magenta around it. A small drawing in the middle of a big empty panel is the wrong answer.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.

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

NOTHING IS EVER SEE-THROUGH. Every piece that is present is painted at full, solid colour; light is painted as solid shapes (hard-edged rays, solid rim bands), never as a soft bloom around a shape and never half-transparent or ghostly.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc, button or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· Every panel would still be recognised 24 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Icons: equipment slots and marks  (sheet-icons-misc.png → images/icons/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR SIGN — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No hand, no character, no ground, no shadow, no sparkle cloud, no scenery.
· The game puts each one on its own button, badge or frame. Nothing here sits on a tile, badge, ring, disc or button of its own.
· Where a panel is a SIGN rather than a thing (an arrow, a tick, a cross, a plus, a question mark, a triangle), paint it as a thick, solid, enamelled token shape with the same volume, outline and glint as everything else — never as a flat letter from a font.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a steel breastplate seen from the front, with rounded shoulders. Main colour: steel (about #c9d3e4).
Panel 2 (row 1, column 2): an empty-slot marker: a sword shape carved in pale grey stone. Main colour: pale stone grey (about #b8b2c8).
Panel 3 (row 1, column 3): an empty-slot marker: a shield shape carved in pale grey stone. Main colour: pale stone grey (about #b8b2c8).
Panel 4 (row 1, column 4): an empty-slot marker: a helmet shape carved in pale grey stone. Main colour: pale stone grey (about #b8b2c8).
Panel 5 (row 2, column 1): an empty-slot marker: a breastplate shape carved in pale grey stone. Main colour: pale stone grey (about #b8b2c8).
Panel 6 (row 2, column 2): an empty-slot marker: a glove shape carved in pale grey stone. Main colour: pale stone grey (about #b8b2c8).
Panel 7 (row 2, column 3): an empty-slot marker: a boot shape carved in pale grey stone. Main colour: pale stone grey (about #b8b2c8).
Panel 8 (row 2, column 4): an empty-slot marker: a finger ring shape carved in pale grey stone. Main colour: pale stone grey (about #b8b2c8).
Panel 9 (row 3, column 1): a glossy red playing-card heart. Main colour: red (about #ff5a6a).
Panel 10 (row 3, column 2): a glossy blue droplet. Main colour: blue (about #5fb8ff).
Panel 11 (row 3, column 3): a bold gold exclamation mark: a thick tapering bar above a round dot. Main colour: gold (about #ffd24a).
Panel 12 (row 3, column 4): a white mouse pointer arrow, tip at the upper left, with a dark outline. Main colour: white (about #f4ecd8).

COLOUR — each panel's line names its main colour, and the reference shows it. Keep it: the game shows these on coloured buttons and dark frames, and the colour is how a player finds the right one. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 12 are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one panel has volume and the next is flat is not one set.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The silhouette is the reference's, unchanged. Put the volume INSIDE the outline; do not add parts around it.
· The accent colour stays the dominant colour of every panel.

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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable.

READABLE AT 24 PIXELS — each of these is shown between 24 and 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size. At 24 pixels a shape has room for one idea: keep only the silhouette and its one or two biggest colour areas.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
· Paint each one as LARGE as the reference shows it: it takes up most of its panel, with a narrow, even margin of magenta around it. A small drawing in the middle of a big empty panel is the wrong answer.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.

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

NOTHING IS EVER SEE-THROUGH. Every piece that is present is painted at full, solid colour; light is painted as solid shapes (hard-edged rays, solid rim bands), never as a soft bloom around a shape and never half-transparent or ghostly.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc, button or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· Every panel would still be recognised 24 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```
