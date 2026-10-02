# Battlecross art prompts — Skill icons

Generated from `src/game/art/artSheet.ts` by `pnpm art:prompts` (and by the
bench at `/#/art-sheets` on export). Do not edit by hand: change the manifest.

Each block is one generation. The heading names the reference image to attach
and where the sliced result lands; it stays OUTSIDE the fence, so copy the
fenced text only (a markdown preview gives it a copy button). Save the return
as `art-sheets/painted/<reference name>.png`, then `pnpm art:slice`.

A block with an "Attach, in this order" line goes out with finished paintings
as well: attach those FIRST and the reference LAST (the model takes the grid
from the last image). `pnpm art:desk` does this by itself.

## Skill icons: Aegis Knight  (sheet-skills-aegis.png → images/skills/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR BURST OF ENERGY — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No character casting it, no hand, no target, no landscape, no extra sparks around it.
· The game draws its own coloured frame around each one. Nothing here sits on a tile, badge, ring or disc.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a shield tilted forward with a six-pointed impact burst at its upper right edge.
Panel 2 (row 1, column 2): a shield with a cross-shaped rib, sitting in the middle of a solid round disc of light. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 3 (row 1, column 3): a pale sword pointing up and to the right, in front of eight short solid light rays arranged in a ring.
Panel 4 (row 2, column 1): a shield with a small red playing-card heart shape on its face. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 5 (row 2, column 2): a horn-shaped megaphone pointing right, with two curved solid sound arcs in front of its mouth.
Panel 6 (row 2, column 3): a small pale castle tower with three battlements and an arched door, standing in front of a solid half-dome, with one four-pointed star above it.

COLOUR — ONE accent for the whole sheet: gold (about #ffd84a). Wherever the reference uses that colour, yours does; white, gold, steel, wood, red, green and blue details keep the colours the reference gives them. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 6 belong to one set, painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left, the same accent colour. A sheet where one panel has volume and the next is flat is not one set.

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

READABLE AT 40 PIXELS — each of these is shown about 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 75%, and every panel keeps a clear magenta margin on all four sides.
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
· 3 panels across, 2 down, 6 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· No panel is a flat copy of the reference's plain shapes.
· Every panel would still be recognised 40 pixels wide.
· Nothing anywhere is half-transparent, hazy or glowing out into the magenta.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Skill icons: Shadowblade  (sheet-skills-shadow.png → images/skills/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR BURST OF ENERGY — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No character casting it, no hand, no target, no landscape, no extra sparks around it.
· The game draws its own coloured frame around each one. Nothing here sits on a tile, badge, ring or disc.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a crescent shape curving to the right, with three short horizontal speed lines trailing on its left.
Panel 2 (row 1, column 2): a steel dagger pointing up and to the right, with a red four-pointed star at its tip. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 3 (row 1, column 3): a steel dagger pointing up and to the right, with one fat green droplet falling from its blade.
Panel 4 (row 2, column 1): a small cloak shape with a zigzag hem and two round eye holes, leaning away from two short speed lines on its left. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 5 (row 2, column 2): a round black bomb with a short fuse and a spark, half covered by one puffy solid cloud.
Panel 6 (row 2, column 3): three short steel blades pointing outward from a small round hub, evenly spaced like a three-armed pinwheel.

COLOUR — ONE accent for the whole sheet: violet (about #9c7bff). Wherever the reference uses that colour, yours does; white, gold, steel, wood, red, green and blue details keep the colours the reference gives them. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 6 belong to one set, painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left, the same accent colour. A sheet where one panel has volume and the next is flat is not one set.

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

READABLE AT 40 PIXELS — each of these is shown about 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 74%, and every panel keeps a clear magenta margin on all four sides.
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
· 3 panels across, 2 down, 6 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· No panel is a flat copy of the reference's plain shapes.
· Every panel would still be recognised 40 pixels wide.
· Nothing anywhere is half-transparent, hazy or glowing out into the magenta.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Skill icons: Pyromancer  (sheet-skills-pyro.png → images/skills/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR BURST OF ENERGY — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No character casting it, no hand, no target, no landscape, no extra sparks around it.
· The game draws its own coloured frame around each one. Nothing here sits on a tile, badge, ring or disc.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a teardrop-shaped ball of flame with a yellow core, flying up and to the right, with three short streaks behind it.
Panel 2 (row 1, column 2): a flame with a thick white plus sign on its lower half. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 3 (row 1, column 3): a tall, narrow column of flame with a yellow core, rising from a flat ground line.
Panel 4 (row 2, column 1): a flame with a yellow core, with two white four-pointed sparks beside it, one large and one small. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 5 (row 2, column 2): a nine-pointed explosion burst with a smaller yellow nine-pointed burst in its middle.
Panel 6 (row 2, column 3): a round cratered boulder falling toward the lower left, with three streaks behind it at the upper right and a flat ground line below.

COLOUR — ONE accent for the whole sheet: orange (about #ff7a3a). Wherever the reference uses that colour, yours does; white, gold, steel, wood, red, green and blue details keep the colours the reference gives them. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 6 belong to one set, painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left, the same accent colour. A sheet where one panel has volume and the next is flat is not one set.

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

READABLE AT 40 PIXELS — each of these is shown about 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 75%, and every panel keeps a clear magenta margin on all four sides.
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
· 3 panels across, 2 down, 6 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· No panel is a flat copy of the reference's plain shapes.
· Every panel would still be recognised 40 pixels wide.
· Nothing anywhere is half-transparent, hazy or glowing out into the magenta.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Skill icons: Grand Sovereign  (sheet-skills-sovereign.png → images/skills/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR BURST OF ENERGY — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No character casting it, no hand, no target, no landscape, no extra sparks around it.
· The game draws its own coloured frame around each one. Nothing here sits on a tile, badge, ring or disc.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a steel knight's helmet with a face opening, topped with a short rounded plume.
Panel 2 (row 1, column 2): a gold crown with five points and one red jewel, with two white four-pointed sparks above it. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 3 (row 1, column 3): a round target of three rings, with four short crosshair ticks at top, bottom, left and right.
Panel 4 (row 2, column 1): a shield with a small gold crown on its face. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 5 (row 2, column 2): a swallow-tailed flag on a wooden pole, with one gold five-pointed star on the cloth.
Panel 6 (row 2, column 3): three knight's helmets in a group: one larger in front, two smaller steel ones behind it at left and right.

COLOUR — ONE accent for the whole sheet: amber (about #ffb04a). Wherever the reference uses that colour, yours does; white, gold, steel, wood, red, green and blue details keep the colours the reference gives them. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 6 belong to one set, painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left, the same accent colour. A sheet where one panel has volume and the next is flat is not one set.

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

READABLE AT 40 PIXELS — each of these is shown about 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 75%, and every panel keeps a clear magenta margin on all four sides.
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
· 3 panels across, 2 down, 6 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· No panel is a flat copy of the reference's plain shapes.
· Every panel would still be recognised 40 pixels wide.
· Nothing anywhere is half-transparent, hazy or glowing out into the magenta.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Skill icons: Chrono-Weaver  (sheet-skills-chrono.png → images/skills/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR BURST OF ENERGY — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No character casting it, no hand, no target, no landscape, no extra sparks around it.
· The game draws its own coloured frame around each one. Nothing here sits on a tile, badge, ring or disc.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): an hourglass with gold end plates, sitting in the middle of a solid round disc.
Panel 2 (row 1, column 2): a white round clock face with two hands, with two small fast-forward triangles at its lower right.
Panel 3 (row 1, column 3): a white clock face with a wobbly, bent outline and two bent hands, with one short wavy line at its upper left and one at its lower right. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 4 (row 2, column 1): two thick arrows stacked one above the other, the upper pointing right and the lower pointing left.
Panel 5 (row 2, column 2): a solid round disc with one thick white spiral line on it. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 6 (row 2, column 3): a white round clock face with two hands, with a curved arrow hooking back around its upper left.

COLOUR — ONE accent for the whole sheet: cyan (about #5fd8ff). Wherever the reference uses that colour, yours does; white, gold, steel, wood, red, green and blue details keep the colours the reference gives them. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 6 belong to one set, painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left, the same accent colour. A sheet where one panel has volume and the next is flat is not one set.

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

READABLE AT 40 PIXELS — each of these is shown about 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 75%, and every panel keeps a clear magenta margin on all four sides.
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
· 3 panels across, 2 down, 6 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· No panel is a flat copy of the reference's plain shapes.
· Every panel would still be recognised 40 pixels wide.
· Nothing anywhere is half-transparent, hazy or glowing out into the magenta.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Skill icons: Blood Alchemist  (sheet-skills-blood.png → images/skills/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR BURST OF ENERGY — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No character casting it, no hand, no target, no landscape, no extra sparks around it.
· The game draws its own coloured frame around each one. Nothing here sits on a tile, badge, ring or disc.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a conical glass laboratory flask with a cork, one third full of red liquid with two small bubbles in it.
Panel 2 (row 1, column 2): two fat droplets of liquid side by side, a red one on the left and a blue one on the right, with a small arrowhead between them pointing right. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 3 (row 1, column 3): one fat red droplet of liquid in the middle, circled by two curved arrows that chase each other.
Panel 4 (row 2, column 1): a flat red playing-card heart shape with one small white droplet mark on it. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 5 (row 2, column 2): a round red cartoon face with angry slanted brows, two dot eyes and a zigzag row of teeth.
Panel 6 (row 2, column 3): a wide steel bowl-shaped cauldron full of red liquid, with three round red bubbles rising above it.

COLOUR — ONE accent for the whole sheet: crimson (about #ff4a6a). Wherever the reference uses that colour, yours does; white, gold, steel, wood, red, green and blue details keep the colours the reference gives them. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 6 belong to one set, painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left, the same accent colour. A sheet where one panel has volume and the next is flat is not one set.

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

READABLE AT 40 PIXELS — each of these is shown about 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 75%, and every panel keeps a clear magenta margin on all four sides.
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
· 3 panels across, 2 down, 6 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· No panel is a flat copy of the reference's plain shapes.
· Every panel would still be recognised 40 pixels wide.
· Nothing anywhere is half-transparent, hazy or glowing out into the magenta.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Skill icons: Aether-Tech  (sheet-skills-aether.png → images/skills/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR BURST OF ENERGY — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No character casting it, no hand, no target, no landscape, no extra sparks around it.
· The game draws its own coloured frame around each one. Nothing here sits on a tile, badge, ring or disc.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a steel pistol pointing right with a small four-pointed spark at its muzzle.
Panel 2 (row 1, column 2): a small boxy steel gun turret with one short barrel pointing right and a round lens, on a wooden tripod base.
Panel 3 (row 1, column 3): a steel nozzle on the left blowing a wide solid cone to the right, with three streak lines inside the cone.
Panel 4 (row 2, column 1): a glass thermometer full to the top with red liquid, with a small gold lightning bolt at its upper right. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 5 (row 2, column 2): a thick vertical beam with a white core coming down from the top edge onto a flat oval of ground, with a white six-pointed burst where it lands.
Panel 6 (row 2, column 3): a six-sided steel armour shell seen from the front, with one wide visor slot across it.

COLOUR — ONE accent for the whole sheet: teal (about #4ff0c8). Wherever the reference uses that colour, yours does; white, gold, steel, wood, red, green and blue details keep the colours the reference gives them. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 6 belong to one set, painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left, the same accent colour. A sheet where one panel has volume and the next is flat is not one set.

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

READABLE AT 40 PIXELS — each of these is shown about 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 75%, and every panel keeps a clear magenta margin on all four sides.
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
· 3 panels across, 2 down, 6 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· No panel is a flat copy of the reference's plain shapes.
· Every panel would still be recognised 40 pixels wide.
· Nothing anywhere is half-transparent, hazy or glowing out into the magenta.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Skill icons: Geomancer  (sheet-skills-geo.png → images/skills/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE CHUNKY PAINTED OBJECT OR BURST OF ENERGY — NOT A FLAT SYMBOL, AND NOT A SCENE.
· Paint ONLY what the reference shows in that panel. No character casting it, no hand, no target, no landscape, no extra sparks around it.
· The game draws its own coloured frame around each one. Nothing here sits on a tile, badge, ring or disc.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): one tall sharp rock spike rising from a flat ground line, with a small spike on each side of it.
Panel 2 (row 1, column 2): a wall of five rounded stone blocks in two staggered rows.
Panel 3 (row 1, column 3): a jagged zigzag shock line above a flat ground line, with two curved ripple arcs between them.
Panel 4 (row 2, column 1): a shield made of stone, with a branching crack line running down it. Keep this one compact, well away from its panel's four corners (the game crops it to a circle). Do NOT draw a circle, ring, disc or badge around or behind it.
Panel 5 (row 2, column 2): a rounded standing stone statue with two dot eyes, a straight mouth line and one crack at its top right.
Panel 6 (row 2, column 3): two slabs of ground split apart by a zigzag crack down the middle, with a small pointed wedge of molten yellow rock rising in the gap.

COLOUR — ONE accent for the whole sheet: sand (about #c79a5a). Wherever the reference uses that colour, yours does; white, gold, steel, wood, red, green and blue details keep the colours the reference gives them. Take the HUE, not the flatness.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 6 belong to one set, painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left, the same accent colour. A sheet where one panel has volume and the next is flat is not one set.

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

READABLE AT 40 PIXELS — each of these is shown about 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 84% of its panel or taller than about 74%, and every panel keeps a clear magenta margin on all four sides.
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
· 3 panels across, 2 down, 6 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one thing and nothing else, and no ring, disc or badge sits around or behind it.
· Every shape has a lit side and a shadow side: not one of them is a single flat colour.
· No panel is a flat copy of the reference's plain shapes.
· Every panel would still be recognised 40 pixels wide.
· Nothing anywhere is half-transparent, hazy or glowing out into the magenta.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```
