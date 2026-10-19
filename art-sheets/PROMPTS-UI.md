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

## UI: the border-inset ornaments (windows, cards, buttons)  (sheet-ui-ornaments.png → images/ui/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE ORNAMENTS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.
· 2 panels are BLANK in the reference. Leave them flat magenta: do not invent anything for them.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE PAINTED GILDED ORNAMENT FOR A MEDIEVAL LOW-FANTASY INTERFACE — A PIECE OF METALWORK, NOT A PICTURE.
· Hammered and gilded brass-gold, like the fittings on an old leather-bound book or a knight shield: chunky scrolls, round beads, pointed leaves.
· Paint ONLY what the reference shows in that panel, in the same orientation and at the same size. No frame, border, card, button, plate, ground or shadow behind it, no leather, parchment or wood, no scene.
· The game lays these pieces INSIDE the borders of its own buttons, cards and windows, and mirrors the corner and the scroll for the other corners and the other end. So the piece is drawn exactly one way, as the reference has it, and is never drawn as a pair or a full frame.
· A corner bracket keeps its two arms running to the left and top edges of its drawing, exactly as the reference does: an arm that stops short, or a bracket drawn in another corner, cannot be mirrored into place.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a gilded corner bracket for the TOP LEFT corner of a window: two thick gold arms, one running down the left edge of the panel and one along its top edge, meeting in a rounded corner with a small curled scroll tucked into the angle, and a round gold bead at the tip of each arm. The arms reach the left and top edges of the drawing, so it can be laid in the corner of a frame. Main colour: warm gold (about #ffc526).
Panel 2 (row 1, column 2): a small plain gilded corner bracket for the TOP LEFT corner of a button: two short thick gold arms, one down the left and one along the top, meeting in a rounded corner, and a round gold bead at the tip of each arm. No scroll, nothing else. Main colour: warm gold (about #ffc526).
Panel 3 (row 1, column 3): one round domed brass rivet stud seen from the front: a darker orange-gold rim, a lighter gold dome, and one small bright highlight at the upper left. Main colour: warm gold (about #ffc526).
Panel 4 (row 2, column 1): BLANK — flat magenta and nothing else.
Panel 5 (row 2, column 2): BLANK — flat magenta and nothing else.
Panel 6 (row 2, column 3): a small gold leaf scroll for the LEFT end of a button, its pointed leaf at the LEFT and a short stem running to a round gold bead at the RIGHT; wide and low. Main colour: warm gold (about #ffc526).

COLOUR — warm gold: a bright lit side (about #ffe978), the base (about #ffc526) and a deeper shade (about #f09410) on the shadow side, with a charcoal-violet outline. Take the HUE, not the flatness. The gold must stay readable on blue, green, red and brown fills.

THE VIEW — flat and front-on, the way the reference shows it. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 4 are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. They are one set of fittings and must look like one.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The other wrong answer is a glossy 3D render: a plastic, vinyl, clay or rubber-toy look, soft airbrushed gradients, shiny specular blobs all over. That came back too and could not be used. This is a HAND-PAINTED 2D game icon, painted by the same hand as the attached weapons: hard-stepped cel shading, thick outline, a few crisp highlights.
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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable. So is a plain white block arrow (↓ →) in a reference panel: it marks which way something moves and is NEVER painted as an object (an archer's arrow that the panel's description names is an object, and is painted).

READABLE AT 16 PIXELS — each of these is shown between 16 and 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size. At 24 pixels a shape has room for one idea: keep only the silhouette and its one or two biggest colour areas.
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
· Each panel holds exactly one ornament, in the reference orientation, and nothing sits around or behind it.
· The two corner pieces keep their arms on the left and top.
· Every piece is warm gold with a lit side and a shadow side: not one of them is a single flat colour.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## UI: the border-inset ornaments, the rule and the crest  (sheet-ui-rule-crest.png → images/ui/)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 2 SEPARATE ORNAMENTS, NOT ONE PICTURE.
One landscape image, 512 x 384 pixels (4:3), holding 2 separate small drawings laid out 1 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 2 panels. Not 1, not 1, not 3. Exactly 2 rows of 1 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are WIDE, not square: each is 512 x 192 (8:3), because the canvas divides into 1 equal column and 2 equal rows. Each drawing sits in the MIDDLE of its own panel, with plain magenta on every side of it: it never reaches the panel's edge, never crosses into the next panel, and never needs a second panel's room. Do not stretch a drawing to fill the panel.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

EACH PANEL IS ONE PAINTED GILDED ORNAMENT FOR A MEDIEVAL LOW-FANTASY INTERFACE — A PIECE OF METALWORK, NOT A PICTURE.
· Hammered and gilded brass-gold, like the fittings on an old leather-bound book or a knight shield: chunky scrolls, round beads, pointed leaves.
· Paint ONLY what the reference shows in that panel, in the same orientation and at the same size. No frame, border, card, button, plate, ground or shadow behind it, no leather, parchment or wood, no scene.
· The game lays these two pieces INSIDE the borders of its own cards and windows. Each is ONE small, complete, free-standing shape, drawn once, exactly as the reference has it.
· EACH PIECE LIVES IN ITS OWN PANEL AND NEVER SPANS TWO PANELS. The rule is wholly inside panel 1 (the upper one) and the crest wholly inside panel 2 (the lower one). Panel 2 holds the crest and NOTHING ELSE: no half of the rule, no leaf, bead or scrap of metal from the panel above. Panel 1 holds the rule and nothing else. A piece that is longer than the reference shows it, or that runs off the edge of its panel, is wrong.
· In the reference the rule takes up about 84% of its panel's width and 37% of its height; the crest about 53% of its width and 84% of its height. Keep those sizes and keep each exactly centred.
· Both pieces are exactly left-right symmetric.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a wide, low, left-right SYMMETRIC gold filigree rule: a lozenge-shaped gem in the middle, a thin tapering leaf-blade of gold running out to each side, and a round gold bead at each far end. Main colour: warm gold (about #ffc526).
Panel 2 (row 2, column 1): a small left-right SYMMETRIC gold cartouche: a diamond-shaped gem in the middle with a lighter diamond inside it, and a small pointed gold leaf curling out to each side of it. Main colour: warm gold (about #ffc526).

COLOUR — warm gold: a bright lit side (about #ffe978), the base (about #ffc526) and a deeper shade (about #f09410) on the shadow side, with a charcoal-violet outline. Take the HUE, not the flatness. The gold must stay readable on blue, green, red and brown fills.

THE VIEW — flat and front-on, the way the reference shows it. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 2 are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. They are one set of fittings and must look like one.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The other wrong answer is a glossy 3D render: a plastic, vinyl, clay or rubber-toy look, soft airbrushed gradients, shiny specular blobs all over. That came back too and could not be used. This is a HAND-PAINTED 2D game icon, painted by the same hand as the attached weapons: hard-stepped cel shading, thick outline, a few crisp highlights.
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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable. So is a plain white block arrow (↓ →) in a reference panel: it marks which way something moves and is NEVER painted as an object (an archer's arrow that the panel's description names is an object, and is painted).

READABLE AT 16 PIXELS — each of these is shown between 16 and 40 pixels wide in the game, and it has to be recognised at a glance.
· Bold, chunky shapes and a thick outline. Few parts, each one large.
· No thin lines, no hairline detail, no fine texture, no small engraving: anything thinner than the outline disappears at that size. At 24 pixels a shape has room for one idea: keep only the silhouette and its one or two biggest colour areas.
· Where a description above names a small detail, paint it as one or two large, simple marks, or leave it out.
· The game shows it on a DARK ground (deep violet-navy). Its big areas are light or bright: a thing painted dark grey, navy or black disappears there, so give a dark thing a lighter body colour, bright accents and a clear rim light.
· Hold each panel at thumbnail size: if it is not instantly recognisable as a silhouette with two or three big areas of colour, simplify it.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· Each panel is 512 x 192 (8:3). Its ornament is centred in it, with a clear magenta margin on all four sides.
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
· 1 panels across, 2 down, 2 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one ornament, in the reference orientation, and nothing sits around or behind it.
· The rule is entirely in panel 1 and the crest entirely in panel 2; both are exactly left-right symmetric.
· Every piece is warm gold with a lit side and a shadow side: not one of them is a single flat colour.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 512 x 384 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## UI: the elite bar frame  (sheet-ui-bar-frame-elite.png → images/ui)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE IMAGE WITH ONE VERY WIDE, LOW OBJECT IN IT.
One landscape image, 640 x 360 pixels (16:9), holding exactly ONE painted frame, laid out as the attached reference lays it out: a long horizontal strip across the middle of the canvas, with flat magenta above it and below it.
· ONE object. Not a sheet, not a set, not three frames, no second copy, no preview, no mock-up. A canvas of any other shape is wrong.
· Do NOT draw any border, box, guide or number around the canvas.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

THIS IS THE ELITE HEALTH-BAR FRAME OF A MEDIEVAL LOW-FANTASY INTERFACE — A VERY WIDE, LOW PIECE OF METALWORK, NOT A PICTURE. It is one of a family of three (silver elite, gold champion, gold-and-violet boss) painted by the same artist.
· The frame is a STRIP exactly FOUR TIMES AS WIDE AS IT IS TALL (4:1), as the reference shows it: 95% of the canvas's width and 42% of its height, centred, with a lane of magenta (about 29% of the canvas's height) above and below it and a thin margin of magenta left and right. It is BIG: it runs almost from one side of the canvas to the other. Do not make it smaller, do not make it taller, do not make it square, do not rotate it.
· THE SLOT. In the middle of the strip is a LONG, LOW, ROUNDED SLOT, TWELVE TIMES AS WIDE AS IT IS TALL (12:1): three quarters (75%) of the strip's length and only a quarter (25%) of its height, exactly centred. It is EMPTY: a plain, flat, very dark violet-black fill with a thin dark outline, no liquid, no bar, no gauge, no text, no pattern. The game puts a live bar in it, so it must stay plain and keep exactly this size and place. A slot that is shorter, taller, rounder or smaller than the reference is wrong.
· NOTHING OVERLAPS THE SLOT. Only the strip's own metal rim touches it. Wings, gems, scroll finials, horns, crowns and crests all sit OUTSIDE it: wings, gems and scroll finials only in the two END CAPS (the left and right eighth of the strip, beside the slot's ends), and a crown, crest or stone only over the very middle of the TOP edge (with its upside-down twin under the BOTTOM edge), in the middle 30% of the strip's length. The strip has three bands of height: 37.5% above the slot, 25% the slot, 37.5% under it.
· THE LONG STRETCHES ARE PLAIN. The game stretches the metal between the end caps and the middle ornament to fit bars of different lengths, so on each side of the slot, between the cap and the middle 30%, the rim is only smooth, evenly lit metal band: an engraved line or a row of small rivets that looks the same all the way along is fine, but no gem, figure, scroll or any one-off detail there.
· KEEP THE ORNAMENTS IN SCALE. A wing is small: at most one and a half times as tall as the slot (about 38% of the strip's height) and no wider than the end cap. A crown or crest is at most as tall as the band above the slot (37% of the strip). A wing that towers over the slot, or a crest that hangs down into it, is wrong.
· Hammered metal with gems, wings, horns and crowns, like the fittings on ceremonial plate armour: chunky, pointed, rich, glinting. Paint it richer than the reference drawing, with more feathers, facets, rivets and engraving, as long as the silhouette, the sizes, the slot and the symmetry stay. Spectacular, but sharp: crisp edges and clean hard-edged shading, no blur, no soft glow, no noise.
· Paint ONLY what the reference shows, in the same place and at the same size. No ground, shadow, table, card, scene or background behind it.
· The frame is exactly LEFT-RIGHT symmetric, and what is over the slot is repeated, upside down, under it. It reaches all four edges of its strip (left and right at the end caps, top and bottom at the crown, crest or stones), as the reference does, and not one pixel beyond.

WHAT IT IS:
Panel 1 (row 1, column 1): a silver frame, 4:1, left-right SYMMETRIC: a long rounded metal band with a DARK EMPTY slot (12:1) in its middle, one small spread five-feather silver wing in each end cap sweeping up and out (no taller than one and a half slots), a cut amber stone on the root of each wing (in the cap, never on the slot), and one small amber stone over the middle of the top edge and its twin upside down under the bottom edge. Main colour: silver (about #e3ecfa).

COLOUR — the frame keeps the metal and the gem colour the reference gives it, with a bright lit side, a base and a deeper shade, and a charcoal-violet outline. Horns, where there are any, are pale bone. The metal must stay readable against dark red, green and blue bar fills.

THE VIEW — flat and front-on, exactly as the reference shows it. No three-quarter view, no perspective.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The other wrong answer is a glossy 3D render: a plastic, vinyl, clay or rubber-toy look, soft airbrushed gradients, shiny specular blobs all over. That came back too and could not be used. This is a HAND-PAINTED 2D game icon, painted by the same hand as the attached weapons: hard-stepped cel shading, thick outline, a few crisp highlights.
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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable. So is a plain white block arrow (↓ →) in a reference panel: it marks which way something moves and is NEVER painted as an object (an archer's arrow that the panel's description names is an object, and is painted).

SIZE AND PLACE — measure against the PANEL, not against the paper.
· Each panel is 640 x 360 (16:9). Its frame is centred in it, with a clear magenta margin on all four sides.
· The frame is 95% of the panel's width and 42% of its height, exactly 4:1, centred: a lane of magenta about 29% of the panel's height lies above it and below it.
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
· The canvas is landscape, 16:9, with exactly one frame in it, four times as wide as tall, with an empty dark slot (12:1) in its middle.
· Nothing overlaps the slot; every wing is at most one and a half slot-heights tall; crown and crest are mirrored under the strip; the rim between the caps and the middle is plain.
· The frame is symmetric left to right, and the slot is the size and place the reference gives it.
· The frame does not touch the canvas edge.
· No line of any kind, in any shade, runs round the canvas: the ground is one flat field.
· Every pixel that is not the object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 640 x 360 pixels (16:9, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 16:9 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## UI: the champion bar frame  (sheet-ui-bar-frame-champion.png → images/ui)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE IMAGE WITH ONE VERY WIDE, LOW OBJECT IN IT.
One landscape image, 640 x 360 pixels (16:9), holding exactly ONE painted frame, laid out as the attached reference lays it out: a long horizontal strip across the middle of the canvas, with flat magenta above it and below it.
· ONE object. Not a sheet, not a set, not three frames, no second copy, no preview, no mock-up. A canvas of any other shape is wrong.
· Do NOT draw any border, box, guide or number around the canvas.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

THIS IS THE CHAMPION HEALTH-BAR FRAME OF A MEDIEVAL LOW-FANTASY INTERFACE — A VERY WIDE, LOW PIECE OF METALWORK, NOT A PICTURE. It is one of a family of three (silver elite, gold champion, gold-and-violet boss) painted by the same artist.
· The frame is a STRIP exactly FOUR TIMES AS WIDE AS IT IS TALL (4:1), as the reference shows it: 95% of the canvas's width and 42% of its height, centred, with a lane of magenta (about 29% of the canvas's height) above and below it and a thin margin of magenta left and right. It is BIG: it runs almost from one side of the canvas to the other. Do not make it smaller, do not make it taller, do not make it square, do not rotate it.
· THE SLOT. In the middle of the strip is a LONG, LOW, ROUNDED SLOT, TWELVE TIMES AS WIDE AS IT IS TALL (12:1): three quarters (75%) of the strip's length and only a quarter (25%) of its height, exactly centred. It is EMPTY: a plain, flat, very dark violet-black fill with a thin dark outline, no liquid, no bar, no gauge, no text, no pattern. The game puts a live bar in it, so it must stay plain and keep exactly this size and place. A slot that is shorter, taller, rounder or smaller than the reference is wrong.
· NOTHING OVERLAPS THE SLOT. Only the strip's own metal rim touches it. Wings, gems, scroll finials, horns, crowns and crests all sit OUTSIDE it: wings, gems and scroll finials only in the two END CAPS (the left and right eighth of the strip, beside the slot's ends), and a crown, crest or stone only over the very middle of the TOP edge (with its upside-down twin under the BOTTOM edge), in the middle 30% of the strip's length. The strip has three bands of height: 37.5% above the slot, 25% the slot, 37.5% under it.
· THE LONG STRETCHES ARE PLAIN. The game stretches the metal between the end caps and the middle ornament to fit bars of different lengths, so on each side of the slot, between the cap and the middle 30%, the rim is only smooth, evenly lit metal band: an engraved line or a row of small rivets that looks the same all the way along is fine, but no gem, figure, scroll or any one-off detail there.
· KEEP THE ORNAMENTS IN SCALE. A wing is small: at most one and a half times as tall as the slot (about 38% of the strip's height) and no wider than the end cap. A crown or crest is at most as tall as the band above the slot (37% of the strip). A wing that towers over the slot, or a crest that hangs down into it, is wrong.
· Hammered metal with gems, wings, horns and crowns, like the fittings on ceremonial plate armour: chunky, pointed, rich, glinting. Paint it richer than the reference drawing, with more feathers, facets, rivets and engraving, as long as the silhouette, the sizes, the slot and the symmetry stay. Spectacular, but sharp: crisp edges and clean hard-edged shading, no blur, no soft glow, no noise.
· Paint ONLY what the reference shows, in the same place and at the same size. No ground, shadow, table, card, scene or background behind it.
· The frame is exactly LEFT-RIGHT symmetric, and what is over the slot is repeated, upside down, under it. It reaches all four edges of its strip (left and right at the end caps, top and bottom at the crown, crest or stones), as the reference does, and not one pixel beyond.

WHAT IT IS:
Panel 1 (row 1, column 1): a gold frame, 4:1, left-right SYMMETRIC: a long rounded metal band with a DARK EMPTY slot (12:1) in its middle, a small gold winged crest over the middle of the top edge (a shield with a red gem in it, a swept blade-like wing on each side) and the same crest upside down under the bottom edge, and in each end cap a gilded scroll finial: two small gold curls rolling away from the bar round a round red gem set in a gold bead (round and curled, NEVER a pointed triangle or spearhead). Main colour: gold (about #ffd266).

COLOUR — the frame keeps the metal and the gem colour the reference gives it, with a bright lit side, a base and a deeper shade, and a charcoal-violet outline. Horns, where there are any, are pale bone. The metal must stay readable against dark red, green and blue bar fills.

THE VIEW — flat and front-on, exactly as the reference shows it. No three-quarter view, no perspective.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The other wrong answer is a glossy 3D render: a plastic, vinyl, clay or rubber-toy look, soft airbrushed gradients, shiny specular blobs all over. That came back too and could not be used. This is a HAND-PAINTED 2D game icon, painted by the same hand as the attached weapons: hard-stepped cel shading, thick outline, a few crisp highlights.
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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable. So is a plain white block arrow (↓ →) in a reference panel: it marks which way something moves and is NEVER painted as an object (an archer's arrow that the panel's description names is an object, and is painted).

SIZE AND PLACE — measure against the PANEL, not against the paper.
· Each panel is 640 x 360 (16:9). Its frame is centred in it, with a clear magenta margin on all four sides.
· The frame is 95% of the panel's width and 42% of its height, exactly 4:1, centred: a lane of magenta about 29% of the panel's height lies above it and below it.
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
· The canvas is landscape, 16:9, with exactly one frame in it, four times as wide as tall, with an empty dark slot (12:1) in its middle.
· Nothing overlaps the slot; every wing is at most one and a half slot-heights tall; crown and crest are mirrored under the strip; the rim between the caps and the middle is plain.
· The frame is symmetric left to right, and the slot is the size and place the reference gives it.
· The frame does not touch the canvas edge.
· No line of any kind, in any shade, runs round the canvas: the ground is one flat field.
· Every pixel that is not the object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 640 x 360 pixels (16:9, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 16:9 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## UI: the boss bar frame  (sheet-ui-bar-frame-boss.png → images/ui)

Attach, in this order: `public/images/items/ironBroadsword.webp`, `public/images/items/dragonSmasher.webp`, `public/images/items/voidCannon.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE IMAGE WITH ONE VERY WIDE, LOW OBJECT IN IT.
One landscape image, 640 x 360 pixels (16:9), holding exactly ONE painted frame, laid out as the attached reference lays it out: a long horizontal strip across the middle of the canvas, with flat magenta above it and below it.
· ONE object. Not a sheet, not a set, not three frames, no second copy, no preview, no mock-up. A canvas of any other shape is wrong.
· Do NOT draw any border, box, guide or number around the canvas.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are FINISH references: finished paintings from this same game. Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit. They are never subjects: nothing they show may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

THIS IS THE BOSS HEALTH-BAR FRAME OF A MEDIEVAL LOW-FANTASY INTERFACE — A VERY WIDE, LOW PIECE OF METALWORK, NOT A PICTURE. It is one of a family of three (silver elite, gold champion, gold-and-violet boss) painted by the same artist.
· The frame is a STRIP exactly FOUR TIMES AS WIDE AS IT IS TALL (4:1), as the reference shows it: 95% of the canvas's width and 42% of its height, centred, with a lane of magenta (about 29% of the canvas's height) above and below it and a thin margin of magenta left and right. It is BIG: it runs almost from one side of the canvas to the other. Do not make it smaller, do not make it taller, do not make it square, do not rotate it.
· THE SLOT. In the middle of the strip is a LONG, LOW, ROUNDED SLOT, TWELVE TIMES AS WIDE AS IT IS TALL (12:1): three quarters (75%) of the strip's length and only a quarter (25%) of its height, exactly centred. It is EMPTY: a plain, flat, very dark violet-black fill with a thin dark outline, no liquid, no bar, no gauge, no text, no pattern. The game puts a live bar in it, so it must stay plain and keep exactly this size and place. A slot that is shorter, taller, rounder or smaller than the reference is wrong.
· NOTHING OVERLAPS THE SLOT. Only the strip's own metal rim touches it. Wings, gems, scroll finials, horns, crowns and crests all sit OUTSIDE it: wings, gems and scroll finials only in the two END CAPS (the left and right eighth of the strip, beside the slot's ends), and a crown, crest or stone only over the very middle of the TOP edge (with its upside-down twin under the BOTTOM edge), in the middle 30% of the strip's length. The strip has three bands of height: 37.5% above the slot, 25% the slot, 37.5% under it.
· THE LONG STRETCHES ARE PLAIN. The game stretches the metal between the end caps and the middle ornament to fit bars of different lengths, so on each side of the slot, between the cap and the middle 30%, the rim is only smooth, evenly lit metal band: an engraved line or a row of small rivets that looks the same all the way along is fine, but no gem, figure, scroll or any one-off detail there.
· KEEP THE ORNAMENTS IN SCALE. A wing is small: at most one and a half times as tall as the slot (about 38% of the strip's height) and no wider than the end cap. A crown or crest is at most as tall as the band above the slot (37% of the strip). A wing that towers over the slot, or a crest that hangs down into it, is wrong.
· Hammered metal with gems, wings, horns and crowns, like the fittings on ceremonial plate armour: chunky, pointed, rich, glinting. Paint it richer than the reference drawing, with more feathers, facets, rivets and engraving, as long as the silhouette, the sizes, the slot and the symmetry stay. Spectacular, but sharp: crisp edges and clean hard-edged shading, no blur, no soft glow, no noise.
· Paint ONLY what the reference shows, in the same place and at the same size. No ground, shadow, table, card, scene or background behind it.
· The frame is exactly LEFT-RIGHT symmetric, and what is over the slot is repeated, upside down, under it. It reaches all four edges of its strip (left and right at the end caps, top and bottom at the crown, crest or stones), as the reference does, and not one pixel beyond.

WHAT IT IS:
Panel 1 (row 1, column 1): a gold frame, 4:1, for a boss, the grandest of the three, left-right SYMMETRIC: a long rounded thick metal band with a DARK EMPTY slot (12:1) in its middle, a jewelled gold crown with five points over the middle of the top edge between two sweeping pale-bone horns (the same crown and horns upside down under the bottom edge), a small spread five-feather gold wing in each end cap (no taller than one and a half slots) and a cut violet gem on the root of each wing (in the cap, never on the slot). Main colour: royal violet and gold (about #8a3fd1).

COLOUR — the frame keeps the metal and the gem colour the reference gives it, with a bright lit side, a base and a deeper shade, and a charcoal-violet outline. Horns, where there are any, are pale bone. The metal must stay readable against dark red, green and blue bar fills.

THE VIEW — flat and front-on, exactly as the reference shows it. No three-quarter view, no perspective.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The other wrong answer is a glossy 3D render: a plastic, vinyl, clay or rubber-toy look, soft airbrushed gradients, shiny specular blobs all over. That came back too and could not be used. This is a HAND-PAINTED 2D game icon, painted by the same hand as the attached weapons: hard-stepped cel shading, thick outline, a few crisp highlights.
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
· The reference's flat bands, stripes, dashes, dotted rings and hard single-colour shapes are NOTATION for where things go — never a look to copy. A sheet that comes back as the same flat bands, neatly repainted, is a trace of the placeholder, and it is unusable. So is a plain white block arrow (↓ →) in a reference panel: it marks which way something moves and is NEVER painted as an object (an archer's arrow that the panel's description names is an object, and is painted).

SIZE AND PLACE — measure against the PANEL, not against the paper.
· Each panel is 640 x 360 (16:9). Its frame is centred in it, with a clear magenta margin on all four sides.
· The frame is 95% of the panel's width and 42% of its height, exactly 4:1, centred: a lane of magenta about 29% of the panel's height lies above it and below it.
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
· The canvas is landscape, 16:9, with exactly one frame in it, four times as wide as tall, with an empty dark slot (12:1) in its middle.
· Nothing overlaps the slot; every wing is at most one and a half slot-heights tall; crown and crest are mirrored under the strip; the rim between the caps and the middle is plain.
· The frame is symmetric left to right, and the slot is the size and place the reference gives it.
· The frame does not touch the canvas edge.
· No line of any kind, in any shade, runs round the canvas: the ground is one flat field.
· Every pixel that is not the object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 640 x 360 pixels (16:9, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 16:9 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

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

## UI: the wooden cup  (single-ui-cup.png → images/ui/cup.webp)

```text
WHAT COMES BACK IS ONE OBJECT ON A FLAT MAGENTA GROUND.
One square image holding one object, at the size and in the spot the attached reference shows it.
· ONE object. Not a pile, not a row, not a scene.

WHAT IT IS: a wooden shell-game cup seen from the side, standing upside down on the table: a tapered tumbler, narrow flat closed base on top and the wide open rim at the bottom, built of vertical wooden staves with visible wood grain and plank seams, two dark grey iron hoop bands around it and a lighter turned wooden disc on top; the broad middle between the hoops is plain wood with NO number, NO letters and NO marking. NOTHING else: no hand, no sparkle, no ground, no shadow.

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
· In the reference the object is about 79% of the image's width and 84% of its height, centred, with a clear magenta margin on all four sides. Keep it there.
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

## Logo: the badge (swords behind a shield)  (single-logo-emblem.png → images/logo/emblem.webp)

```text
WHAT COMES BACK IS ONE BADGE ON A FLAT MAGENTA GROUND.
One square image holding one subject, at the size and in the spot the attached layout reference shows it.

WHAT IT IS: a heraldic badge: a blue heater shield with a gold inner rim and a white four-pointed star in its middle, in front of two steel swords crossed behind it, their gold crossguards and pommels showing at the lower corners and their blades rising past the shield's top corners. NOTHING else: no ground, no shadow, no scenery, no frame or card behind it.

NO LETTERS — not one letter, word, number or rune anywhere on it, not even the game's name: the title is set beside it by the game. A badge with lettering on it is the wrong answer.

APPEAL — this is the face of the game on its splash, on store pages and on a phone's home screen. Make it the most polished thing in the set: crisp, confident, bright and immediately likeable.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The other wrong answer is a glossy 3D render: a plastic, vinyl, clay or rubber-toy look, soft airbrushed gradients, shiny specular blobs all over. That came back too and could not be used. This is a HAND-PAINTED 2D game icon, painted by the same hand as the attached weapons: hard-stepped cel shading, thick outline, a few crisp highlights.
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

SIZE AND PLACE — measure against the image, not against a guess.
· In the reference the subject takes about 84% of the image's width and 76% of its height, centred, with a clear magenta margin on all four sides. Keep it there.
· It must still read as a small square at 32 pixels (it becomes the game's app icon and favicon): a bold silhouette and two or three big areas of colour.

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
· There is exactly one badge, and it does not reach the edge of the image.
· There is not one letter, word or number anywhere in the image.
· Every pixel that is not the subject is flat, vivid #FF00FF.

OUTPUT: one square image (1:1), 1024 x 1024 pixels or larger. If your tool has an aspect-ratio control, set it to 1:1. PNG. No labels, captions, numbers or watermarks.
```

## Logo: the mascot (the hero)  (single-logo-mascot.png → images/logo/mascot.webp)

Attach, in this order: `public/images/portraits/hero-tunic.webp`, `public/images/portraits/hero-leather.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE CHARACTER, FULL FIGURE, ON A FLAT MAGENTA GROUND.
One square image holding one subject, at the size and in the spot the attached layout reference shows it.

ATTACHED IMAGES — there are 3.
· The first 2 are painted portraits of THIS SAME HERO from the game. Copy his face from them exactly: the same face shape, the same eyes and brows, the same short tousled brown hair, the same skin, the same age. He must be recognisably the same person.
· The LAST image is the LAYOUT reference: his pose, his size and his place. Wherever this text says "the reference", it means that last image. Its flat shapes are notation; take only the pose from it.

WHAT IT IS: the hero of the game, full figure, as a lovable squat chibi adventurer: short tousled brown hair, a big friendly confident grin, a blue tunic with a brown belt, brown boots and a red cape; one hand raises a steel sword with a gold crossguard high, the other waves at the viewer. NOTHING else: no ground, no shadow, no scenery, no frame or card behind it.

THE POSE — dynamic and friendly, the game's mascot on its loading screen: a little lean, weight on one leg, sword up, a wave, a grin that invites the player in. Facing the viewer (a slight three-quarter turn of the body is fine, the face looks at us).

APPEAL — this is the face of the game on its splash, on store pages and on a phone's home screen. Make it the most polished thing in the set: crisp, confident, bright and immediately likeable.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The other wrong answer is a glossy 3D render: a plastic, vinyl, clay or rubber-toy look, soft airbrushed gradients, shiny specular blobs all over. That came back too and could not be used. This is a HAND-PAINTED 2D game icon, painted by the same hand as the attached weapons: hard-stepped cel shading, thick outline, a few crisp highlights.
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

SIZE AND PLACE — measure against the image, not against a guess.
· In the reference the subject takes about 70% of the image's width and 84% of its height, centred, with a clear magenta margin on all four sides. Keep it there.
· It must still read as a small square at 32 pixels: a bold silhouette and two or three big areas of colour.

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
· There is exactly one character, and it does not reach the edge of the image.
· His face is the face in the attached portraits.
· Every pixel that is not the subject is flat, vivid #FF00FF.

OUTPUT: one square image (1:1), 1024 x 1024 pixels or larger. If your tool has an aspect-ratio control, set it to 1:1. PNG. No labels, captions, numbers or watermarks.
```

## Logo: the wordmark (the pick)  (single-logo-wordmark.png → images/logo/wordmark.webp)

Attach, in this order: `art-sheets/painted/single-logo-title-d.jpg`, `art-sheets/painted/lettering-c.png`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE GAME LOGO ON A FLAT MAGENTA GROUND: the title of a cute fantasy action game for 10 to 15 year olds, painted as a cartoon wordmark.
One square image holding the logo, at the size and in the spot the attached layout reference shows it.

ATTACHED IMAGES — there are 3.
· The FIRST is the chosen DESIGN: keep it — the shield, the sword, the glowing crescent staff, their colours and how they sit. Repaint it, cleaner and crisper; do not redesign it. The shield stays plain blue with its gold rim (no extra trim or pattern). The sword is ONE sword: one blade, ONE gold crossguard just above its handle, its handle and pommel at the lower left — never a second guard on the blade.
· The SECOND is the chosen LETTERING, cut out on its own: replace the word in the first image with THIS word, copied exactly — its round, puffy, soft letter shapes, its smooth gradient from white at the top to light sky blue at the bottom, its glossy shine and its thick navy outline. The word in the first image (flatter letters with a hard blue band) is the WRONG lettering and must not survive. Any weapon bits showing between its letters are not part of it.
· The LAST image is the LAYOUT reference: where the letters and the shapes behind them go, and how big. Wherever this text says "the reference", it means that last image. Its letters are set in a plain placeholder typeface — notation for WHICH letters go WHERE, never a typeface to copy.

THE LETTERS — spell them exactly. This is the part that cannot be wrong.
· The game is called BATTLECROSS: ONE word, eleven letters, B A T T L E C R O S S (two T after the A, two S at the end).
· ONE line. No space anywhere in it, no line break, no gap that splits it into two words: it must never read as "Battle Cross".
· Nothing else is written anywhere: no other word, letter, number, slogan, subtitle, trademark sign or signature.
· Every letter is clearly that letter at a glance: no letter merged into a shape, hidden behind the swords, or turned into a picture.

WHAT IT IS: the game's title across a shield, exactly the design of the first attached logo: a big blue heater shield with a gold rim (the game's badge), a heroic steel sword with a gold crossguard and an ornate glowing mage's staff (a gold crescent cradling a big glowing cyan crystal, sparkles around it) crossed in an X behind it, and the word BATTLECROSS on ONE line across the front of the shield, running out past both of its sides — lettered exactly like the word in the second attached logo.

THE LETTERING — a hand-drawn cartoon title, the kind on the box of a top mobile game: fat, rounded and playful, white with a thick dark navy outline and a sky-blue shade on the lower half of every letter, a glossy highlight on top, with a little bounce (letters lean and sit slightly off the line, never stiff), heavy and readable. NOT a computer font, not thin, not serif, not a medieval blackletter.

THE STAFF — a mage's staff worth looking at: ornate, glowing and magical (a big shining crystal, gold work, sparkles). A plain wooden stick or a monk's staff is the wrong answer.

APPEAL — this is the face of the game on its splash, on store pages and on a thumbnail among forty others. Make it the most polished thing in the set: crisp, bold, bright and fun.

PAINTED VOLUME — this is what the sheet is judged on.
· Every shape is a chunky, solid, three-dimensional thing lit from the upper left: a LIT side and a SHADOW side that meet along a hard edge (two-tone cel shading), a thin rim light on the shadow side, and a few crisp white highlights.
· Fire, light and energy are solid things too: a bright, almost white inner core, the accent colour around it, and a deeper shade of that colour at the rim, in hard steps.
· A thick dark outline around every shape: the charcoal-violet line on a solid object, a DARK SHADE OF THE SHAPE'S OWN COLOUR on fire, light and energy.
· A shape filled with ONE flat colour is the wrong answer. So is the look of an icon font, a sticker, a logo or a road sign. An earlier attempt came back as flat single-colour shapes with an outline, just like the reference, and it could not be used.
· The other wrong answer is a glossy 3D render: a plastic, vinyl, clay or rubber-toy look, soft airbrushed gradients, shiny specular blobs all over. That came back too and could not be used. This is a HAND-PAINTED 2D game icon, painted by the same hand as the attached weapons: hard-stepped cel shading, thick outline, a few crisp highlights.
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

SIZE AND PLACE — measure against the image, not against a guess.
· In the reference the logo takes about 84% of the image's width and 63% of its height, centred, with a clear magenta margin on all four sides. Keep it there.
· It must still read at 300 pixels wide, on a store tile: big letters, a bold outline, two or three big areas of colour.

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
· Read the letters back, one by one: B-A-T-T-L-E-C-R-O-S-S, on one line with no gap. If any letter is missing, doubled, swapped or another letter, or the word is split in two, start again.
· There is exactly one logo, and it does not reach the edge of the image.
· Every pixel that is not the logo is flat, vivid #FF00FF.

OUTPUT: one square image (1:1), 1024 x 1024 pixels or larger. If your tool has an aspect-ratio control, set it to 1:1. PNG. No labels, captions, numbers or watermarks.
```

## UI: the world map terrain  (bg-ui-map.png → images/ui/map.webp)

Attach, in this order: `art-sheets/painted/sheet-items-weapons.jpg`, `art-sheets/painted/sheet-icons-misc.jpg`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED MAP OF A FANTASY REALM: ITS TERRAIN ONLY, WITH NO BUILDINGS AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The FIRST TWO are finished paintings from this same game: its item icons and its interface icons. Take from them ONLY the HAND: the thick charcoal-violet outline round every shape, the hard two-step cel shading, the small white glints, the saturated candy colours and the chunky, rounded, toy-like forms. Every mountain, tree, hill, rock, wave and bridge on the map is painted as if it were one more icon from those sheets. Nothing of their CONTENT (no swords, no icons, no panels, no magenta) goes on the map.
· The LAST is the layout reference: the map's plan. Paint EXACTLY what it shows, at its scale: every coast, region, river, bridge, road and clearing where the reference has it.

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
· Pale dirt roads wind between 17 bare, flat, oval clearings, each with a darker lip along its lower edge. Keep every road and every clearing, at its place and its size, and keep the clearings EMPTY.

WHAT IT IS NOT — read this twice. The game draws every landmark, every place marker and every name OVER this picture, on the 17 clearings, and they change as the player travels: a place is hidden under cloud, then opens, then is marked as cleared. So the clearings stay bare ground, and NOTHING painted anywhere may be a building or a sign: no towns, no houses, no castles, no towers, no temples, no tents, no camps, no windmills, no lighthouses, no ships under sail, no people, no monsters, no flags, no banners, no crosses, no compass rose, no title ribbon, no clouds, no text, no letters, no numbers. A painted town would sit beside the real one and read as a second, wrong place.
· Do not add regions, roads, rivers or clearings the reference does not have, and do not join, move or drop any it has.
EVERY REGION KEEPS ITS OWN OUTLINE — the mistake to avoid above all. The mountains stand ONLY inside the mountain regions the reference marks, and no bigger and no more of them than it shows: a mountain range never spills over the green land, the fields, the forest, the coast, a road or a clearing, and never grows to cover a larger share of the map than its region does in the reference. The same holds for forest, hills, ice, lava and swamp: each fills its own region and stops at its edge. Where the reference shows open grassland, it stays open grassland.
· Keep it bright and even: small landmarks and paper name tags sit on every part of it and must stay readable. No region darker or busier than the reference shows it.

COLOUR — the layout reference's own, region by region (so the four quarters match where they meet), in the saturation of the first two images. Take the HUES from the reference, not its flatness.

WATER — every sea, bay, river, stream and lake is SATURATED BLUE: bright turquoise to sky blue, never grey, violet, green or dark. It sits exactly where the reference has it, at its width: a river stays one unbroken band from its source to the sea (never interrupted by grass, never thinner than the reference), and the lake right of centre stays open water all round its island clearing. Water is crossed ONLY by the plank bridges the reference shows, where its roads cross; no other bridge, ford, stepping stone or causeway.

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
· Laid over the reference, every coast, river, bridge, road and clearing is where it has it.
· Every river, lake and sea is saturated blue and unbroken, where the reference has it; water is crossed only at the reference's bridges.
· Each region's outline matches the reference: no mountains, trees or hills outside their own region, and the mountain regions are no larger than the reference makes them.
· Held next to the first two attached images, the map looks painted by the same hand: the same outline weight, the same two-step shading, the same glints. Flat, outline-thin clip-art stickers are wrong.
· The 17 clearings are empty, and there is not one building, figure, symbol or letter anywhere in it.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## UI: the world map, top left quarter  (bg-ui-terrain-nw.png → ../art-sheets/map-parts/nw.webp)

Attach, in this order: `art-sheets/map-parts/ref-nw.jpg`, `art-sheets/painted/sheet-items-weapons.jpg`, then the reference named in the heading.

```text
WHAT COMES BACK IS THE TOP LEFT QUARTER OF AN ILLUSTRATED MAP OF A FANTASY REALM, ENLARGED: ITS TERRAIN ONLY, WITH NO BUILDINGS AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The FIRST is THIS QUARTER, already painted, but enlarged and blurry: repaint it SHARP, with crisp outlines and fine detail, keeping every shape, colour and position it has. It is not to be redrawn, rearranged or zoomed out: the same picture, only sharp. The SECOND is a sheet of the game's item icons: only its hand (thick charcoal-violet outlines, hard two-step cel shading, small white glints, chunky rounded forms). Nothing of its CONTENT (no swords, no icons, no magenta) goes on the map.
· The LAST is the layout reference: the top left quarter of the map's plan, enlarged to fill the image. Paint EXACTLY what it shows, at its scale: every coast, region, river, bridge, road and clearing where the reference has it.

Four such quarters are painted and joined into one big map, each overlapping its neighbours by a wide strip, so they must meet without a visible join. The top and left edges are the edges of the whole map. The bottom and right edges cut straight through the middle of the land: the terrain simply runs on past them, cut off mid-tree and mid-field. No coast, no frame, no darkening, no fade and no empty margin along them.
Because it is enlarged, give every tree, mountain, wave and field MORE crisp detail than in the first image, at the SAME size against the roads and clearings — not more of them, and not smaller ones.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the sheet the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge (the game draws the paper's edge itself).

WHAT IT IS: part of the terrain of a hand-drawn storybook map, drawn the way such maps are: the land flat from above, and what stands on it (mountains, trees, hills) as small upright pictures. Repaint the LAST attached image. The game lays its own drawings over the picture by position. The whole map, for orientation (this quarter shows only some of it: paint only what the reference shows):
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
· Pale dirt roads wind between bare, flat, oval clearings, each with a darker lip along its lower edge. Keep every road and every clearing the reference shows, at its place and its size (one cut by the edge stays cut), and keep the clearings EMPTY.

WHAT IT IS NOT — read this twice. The game draws every landmark, every place marker and every name OVER this picture, on the clearings, and they change as the player travels: a place is hidden under cloud, then opens, then is marked as cleared. So the clearings stay bare ground, and NOTHING painted anywhere may be a building or a sign: no towns, no houses, no castles, no towers, no temples, no tents, no camps, no windmills, no lighthouses, no ships under sail, no people, no monsters, no flags, no banners, no crosses, no compass rose, no title ribbon, no clouds, no text, no letters, no numbers. A painted town would sit beside the real one and read as a second, wrong place.
· Do not add regions, roads, rivers or clearings the reference does not have, and do not join, move or drop any it has.
EVERY REGION KEEPS ITS OWN OUTLINE — the mistake to avoid above all. The mountains stand ONLY inside the mountain regions the reference marks, and no bigger and no more of them than it shows: a mountain range never spills over the green land, the fields, the forest, the coast, a road or a clearing, and never grows to cover a larger share of the map than its region does in the reference. The same holds for forest, hills, ice, lava and swamp: each fills its own region and stops at its edge. Where the reference shows open grassland, it stays open grassland.
· Keep it bright and even: small landmarks and paper name tags sit on every part of it and must stay readable. No region darker or busier than the reference shows it.

COLOUR — the first image's own, pixel for pixel in hue (so the four quarters match where they meet).

WATER — every sea, bay, river, stream and lake is SATURATED BLUE: bright turquoise to sky blue, never grey, violet, green or dark. It sits exactly where the reference has it, at its width: a river stays one unbroken band from its source to the sea (never interrupted by grass, never thinner than the reference), and the lake right of centre stays open water all round its island clearing. Water is crossed ONLY by the plank bridges the reference shows, where its roads cross; no other bridge, ford, stepping stone or causeway.

ONE MAP, FOUR PIECES — the same painter, palette, light and scale in every quarter: match the FIRST attached image (this very quarter, already painted, only blurry) exactly. Its grass green, its sand, its blue water, its outline weight, its two-step shading and the size of its trees, mountains and waves; no warmer, cooler, brighter or darker. Light from the top left everywhere. Nothing in it moves, grows, shrinks or is added: it is the first image again, only sharp. This is ONE QUARTER of the map, NOT the whole map: re-detail exactly the crop the first image shows, at the SAME scale, edge to edge. Never zoom out, never fit the whole realm into the frame, and add no ring of stones, river, lake, rift or region that the first image does not show. Nor drop one it does: the jagged black rift with its glowing hot-pink rim stays where the first image has it, and land that reaches an edge there stays land, never turned into sea or coast.

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
· Laid over the last attached image, every coast, river, bridge, road and clearing is where it has it.
· Every river, lake and sea is saturated blue and unbroken, where the reference has it; water is crossed only at the reference's bridges.
· Held next to the first attached image, this quarter has its colours, light and scale: cut from it, it would fit back in unseen.
· Each region's outline matches the reference: no mountains, trees or hills outside their own region, and the mountain regions are no larger than the reference makes them.
· Held next to the first two attached images, the map looks painted by the same hand: the same outline weight, the same two-step shading, the same glints. Flat, outline-thin clip-art stickers are wrong.
· The clearings are empty, and there is not one building, figure, symbol or letter anywhere in it.
· Along the bottom and right edges the land runs straight on, as if the picture were cut from a bigger one.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## UI: the world map, top right quarter  (bg-ui-terrain-ne.png → ../art-sheets/map-parts/ne.webp)

Attach, in this order: `art-sheets/map-parts/ref-ne.jpg`, `art-sheets/painted/sheet-items-weapons.jpg`, then the reference named in the heading.

```text
WHAT COMES BACK IS THE TOP RIGHT QUARTER OF AN ILLUSTRATED MAP OF A FANTASY REALM, ENLARGED: ITS TERRAIN ONLY, WITH NO BUILDINGS AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The FIRST is THIS QUARTER, already painted, but enlarged and blurry: repaint it SHARP, with crisp outlines and fine detail, keeping every shape, colour and position it has. It is not to be redrawn, rearranged or zoomed out: the same picture, only sharp. The SECOND is a sheet of the game's item icons: only its hand (thick charcoal-violet outlines, hard two-step cel shading, small white glints, chunky rounded forms). Nothing of its CONTENT (no swords, no icons, no magenta) goes on the map.
· The LAST is the layout reference: the top right quarter of the map's plan, enlarged to fill the image. Paint EXACTLY what it shows, at its scale: every coast, region, river, bridge, road and clearing where the reference has it.

Four such quarters are painted and joined into one big map, each overlapping its neighbours by a wide strip, so they must meet without a visible join. The top and right edges are the edges of the whole map. The bottom and left edges cut straight through the middle of the land: the terrain simply runs on past them, cut off mid-tree and mid-field. No coast, no frame, no darkening, no fade and no empty margin along them.
Because it is enlarged, give every tree, mountain, wave and field MORE crisp detail than in the first image, at the SAME size against the roads and clearings — not more of them, and not smaller ones.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the sheet the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge (the game draws the paper's edge itself).

WHAT IT IS: part of the terrain of a hand-drawn storybook map, drawn the way such maps are: the land flat from above, and what stands on it (mountains, trees, hills) as small upright pictures. Repaint the LAST attached image. The game lays its own drawings over the picture by position. The whole map, for orientation (this quarter shows only some of it: paint only what the reference shows):
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
· Pale dirt roads wind between bare, flat, oval clearings, each with a darker lip along its lower edge. Keep every road and every clearing the reference shows, at its place and its size (one cut by the edge stays cut), and keep the clearings EMPTY.

WHAT IT IS NOT — read this twice. The game draws every landmark, every place marker and every name OVER this picture, on the clearings, and they change as the player travels: a place is hidden under cloud, then opens, then is marked as cleared. So the clearings stay bare ground, and NOTHING painted anywhere may be a building or a sign: no towns, no houses, no castles, no towers, no temples, no tents, no camps, no windmills, no lighthouses, no ships under sail, no people, no monsters, no flags, no banners, no crosses, no compass rose, no title ribbon, no clouds, no text, no letters, no numbers. A painted town would sit beside the real one and read as a second, wrong place.
· Do not add regions, roads, rivers or clearings the reference does not have, and do not join, move or drop any it has.
EVERY REGION KEEPS ITS OWN OUTLINE — the mistake to avoid above all. The mountains stand ONLY inside the mountain regions the reference marks, and no bigger and no more of them than it shows: a mountain range never spills over the green land, the fields, the forest, the coast, a road or a clearing, and never grows to cover a larger share of the map than its region does in the reference. The same holds for forest, hills, ice, lava and swamp: each fills its own region and stops at its edge. Where the reference shows open grassland, it stays open grassland.
· Keep it bright and even: small landmarks and paper name tags sit on every part of it and must stay readable. No region darker or busier than the reference shows it.

COLOUR — the first image's own, pixel for pixel in hue (so the four quarters match where they meet).

WATER — every sea, bay, river, stream and lake is SATURATED BLUE: bright turquoise to sky blue, never grey, violet, green or dark. It sits exactly where the reference has it, at its width: a river stays one unbroken band from its source to the sea (never interrupted by grass, never thinner than the reference), and the lake right of centre stays open water all round its island clearing. Water is crossed ONLY by the plank bridges the reference shows, where its roads cross; no other bridge, ford, stepping stone or causeway.

ONE MAP, FOUR PIECES — the same painter, palette, light and scale in every quarter: match the FIRST attached image (this very quarter, already painted, only blurry) exactly. Its grass green, its sand, its blue water, its outline weight, its two-step shading and the size of its trees, mountains and waves; no warmer, cooler, brighter or darker. Light from the top left everywhere. Nothing in it moves, grows, shrinks or is added: it is the first image again, only sharp. This is ONE QUARTER of the map, NOT the whole map: re-detail exactly the crop the first image shows, at the SAME scale, edge to edge. Never zoom out, never fit the whole realm into the frame, and add no ring of stones, river, lake, rift or region that the first image does not show. Nor drop one it does: the jagged black rift with its glowing hot-pink rim stays where the first image has it, and land that reaches an edge there stays land, never turned into sea or coast.

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
· Laid over the last attached image, every coast, river, bridge, road and clearing is where it has it.
· Every river, lake and sea is saturated blue and unbroken, where the reference has it; water is crossed only at the reference's bridges.
· Held next to the first attached image, this quarter has its colours, light and scale: cut from it, it would fit back in unseen.
· Each region's outline matches the reference: no mountains, trees or hills outside their own region, and the mountain regions are no larger than the reference makes them.
· Held next to the first two attached images, the map looks painted by the same hand: the same outline weight, the same two-step shading, the same glints. Flat, outline-thin clip-art stickers are wrong.
· The clearings are empty, and there is not one building, figure, symbol or letter anywhere in it.
· Along the bottom and left edges the land runs straight on, as if the picture were cut from a bigger one.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## UI: the world map, bottom left quarter  (bg-ui-terrain-sw.png → ../art-sheets/map-parts/sw.webp)

Attach, in this order: `art-sheets/map-parts/ref-sw.jpg`, `art-sheets/painted/sheet-items-weapons.jpg`, then the reference named in the heading.

```text
WHAT COMES BACK IS THE BOTTOM LEFT QUARTER OF AN ILLUSTRATED MAP OF A FANTASY REALM, ENLARGED: ITS TERRAIN ONLY, WITH NO BUILDINGS AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The FIRST is THIS QUARTER, already painted, but enlarged and blurry: repaint it SHARP, with crisp outlines and fine detail, keeping every shape, colour and position it has. It is not to be redrawn, rearranged or zoomed out: the same picture, only sharp. The SECOND is a sheet of the game's item icons: only its hand (thick charcoal-violet outlines, hard two-step cel shading, small white glints, chunky rounded forms). Nothing of its CONTENT (no swords, no icons, no magenta) goes on the map.
· The LAST is the layout reference: the bottom left quarter of the map's plan, enlarged to fill the image. Paint EXACTLY what it shows, at its scale: every coast, region, river, bridge, road and clearing where the reference has it.

Four such quarters are painted and joined into one big map, each overlapping its neighbours by a wide strip, so they must meet without a visible join. The bottom and left edges are the edges of the whole map. The top and right edges cut straight through the middle of the land: the terrain simply runs on past them, cut off mid-tree and mid-field. No coast, no frame, no darkening, no fade and no empty margin along them.
Because it is enlarged, give every tree, mountain, wave and field MORE crisp detail than in the first image, at the SAME size against the roads and clearings — not more of them, and not smaller ones.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the sheet the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge (the game draws the paper's edge itself).

WHAT IT IS: part of the terrain of a hand-drawn storybook map, drawn the way such maps are: the land flat from above, and what stands on it (mountains, trees, hills) as small upright pictures. Repaint the LAST attached image. The game lays its own drawings over the picture by position. The whole map, for orientation (this quarter shows only some of it: paint only what the reference shows):
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
· Pale dirt roads wind between bare, flat, oval clearings, each with a darker lip along its lower edge. Keep every road and every clearing the reference shows, at its place and its size (one cut by the edge stays cut), and keep the clearings EMPTY.

WHAT IT IS NOT — read this twice. The game draws every landmark, every place marker and every name OVER this picture, on the clearings, and they change as the player travels: a place is hidden under cloud, then opens, then is marked as cleared. So the clearings stay bare ground, and NOTHING painted anywhere may be a building or a sign: no towns, no houses, no castles, no towers, no temples, no tents, no camps, no windmills, no lighthouses, no ships under sail, no people, no monsters, no flags, no banners, no crosses, no compass rose, no title ribbon, no clouds, no text, no letters, no numbers. A painted town would sit beside the real one and read as a second, wrong place.
· Do not add regions, roads, rivers or clearings the reference does not have, and do not join, move or drop any it has.
EVERY REGION KEEPS ITS OWN OUTLINE — the mistake to avoid above all. The mountains stand ONLY inside the mountain regions the reference marks, and no bigger and no more of them than it shows: a mountain range never spills over the green land, the fields, the forest, the coast, a road or a clearing, and never grows to cover a larger share of the map than its region does in the reference. The same holds for forest, hills, ice, lava and swamp: each fills its own region and stops at its edge. Where the reference shows open grassland, it stays open grassland.
· Keep it bright and even: small landmarks and paper name tags sit on every part of it and must stay readable. No region darker or busier than the reference shows it.

COLOUR — the first image's own, pixel for pixel in hue (so the four quarters match where they meet).

WATER — every sea, bay, river, stream and lake is SATURATED BLUE: bright turquoise to sky blue, never grey, violet, green or dark. It sits exactly where the reference has it, at its width: a river stays one unbroken band from its source to the sea (never interrupted by grass, never thinner than the reference), and the lake right of centre stays open water all round its island clearing. Water is crossed ONLY by the plank bridges the reference shows, where its roads cross; no other bridge, ford, stepping stone or causeway.

ONE MAP, FOUR PIECES — the same painter, palette, light and scale in every quarter: match the FIRST attached image (this very quarter, already painted, only blurry) exactly. Its grass green, its sand, its blue water, its outline weight, its two-step shading and the size of its trees, mountains and waves; no warmer, cooler, brighter or darker. Light from the top left everywhere. Nothing in it moves, grows, shrinks or is added: it is the first image again, only sharp. This is ONE QUARTER of the map, NOT the whole map: re-detail exactly the crop the first image shows, at the SAME scale, edge to edge. Never zoom out, never fit the whole realm into the frame, and add no ring of stones, river, lake, rift or region that the first image does not show. Nor drop one it does: the jagged black rift with its glowing hot-pink rim stays where the first image has it, and land that reaches an edge there stays land, never turned into sea or coast.

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
· Laid over the last attached image, every coast, river, bridge, road and clearing is where it has it.
· Every river, lake and sea is saturated blue and unbroken, where the reference has it; water is crossed only at the reference's bridges.
· Held next to the first attached image, this quarter has its colours, light and scale: cut from it, it would fit back in unseen.
· Each region's outline matches the reference: no mountains, trees or hills outside their own region, and the mountain regions are no larger than the reference makes them.
· Held next to the first two attached images, the map looks painted by the same hand: the same outline weight, the same two-step shading, the same glints. Flat, outline-thin clip-art stickers are wrong.
· The clearings are empty, and there is not one building, figure, symbol or letter anywhere in it.
· Along the top and right edges the land runs straight on, as if the picture were cut from a bigger one.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## UI: the world map, bottom right quarter  (bg-ui-terrain-se.png → ../art-sheets/map-parts/se.webp)

Attach, in this order: `art-sheets/map-parts/ref-se.jpg`, `art-sheets/painted/sheet-items-weapons.jpg`, then the reference named in the heading.

```text
WHAT COMES BACK IS THE BOTTOM RIGHT QUARTER OF AN ILLUSTRATED MAP OF A FANTASY REALM, ENLARGED: ITS TERRAIN ONLY, WITH NO BUILDINGS AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The FIRST is THIS QUARTER, already painted, but enlarged and blurry: repaint it SHARP, with crisp outlines and fine detail, keeping every shape, colour and position it has. It is not to be redrawn, rearranged or zoomed out: the same picture, only sharp. The SECOND is a sheet of the game's item icons: only its hand (thick charcoal-violet outlines, hard two-step cel shading, small white glints, chunky rounded forms). Nothing of its CONTENT (no swords, no icons, no magenta) goes on the map.
· The LAST is the layout reference: the bottom right quarter of the map's plan, enlarged to fill the image. Paint EXACTLY what it shows, at its scale: every coast, region, river, bridge, road and clearing where the reference has it.

Four such quarters are painted and joined into one big map, each overlapping its neighbours by a wide strip, so they must meet without a visible join. The bottom and right edges are the edges of the whole map. The top and left edges cut straight through the middle of the land: the terrain simply runs on past them, cut off mid-tree and mid-field. No coast, no frame, no darkening, no fade and no empty margin along them.
Because it is enlarged, give every tree, mountain, wave and field MORE crisp detail than in the first image, at the SAME size against the roads and clearings — not more of them, and not smaller ones.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the sheet the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge (the game draws the paper's edge itself).

WHAT IT IS: part of the terrain of a hand-drawn storybook map, drawn the way such maps are: the land flat from above, and what stands on it (mountains, trees, hills) as small upright pictures. Repaint the LAST attached image. The game lays its own drawings over the picture by position. The whole map, for orientation (this quarter shows only some of it: paint only what the reference shows):
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
· Pale dirt roads wind between bare, flat, oval clearings, each with a darker lip along its lower edge. Keep every road and every clearing the reference shows, at its place and its size (one cut by the edge stays cut), and keep the clearings EMPTY.

WHAT IT IS NOT — read this twice. The game draws every landmark, every place marker and every name OVER this picture, on the clearings, and they change as the player travels: a place is hidden under cloud, then opens, then is marked as cleared. So the clearings stay bare ground, and NOTHING painted anywhere may be a building or a sign: no towns, no houses, no castles, no towers, no temples, no tents, no camps, no windmills, no lighthouses, no ships under sail, no people, no monsters, no flags, no banners, no crosses, no compass rose, no title ribbon, no clouds, no text, no letters, no numbers. A painted town would sit beside the real one and read as a second, wrong place.
· Do not add regions, roads, rivers or clearings the reference does not have, and do not join, move or drop any it has.
EVERY REGION KEEPS ITS OWN OUTLINE — the mistake to avoid above all. The mountains stand ONLY inside the mountain regions the reference marks, and no bigger and no more of them than it shows: a mountain range never spills over the green land, the fields, the forest, the coast, a road or a clearing, and never grows to cover a larger share of the map than its region does in the reference. The same holds for forest, hills, ice, lava and swamp: each fills its own region and stops at its edge. Where the reference shows open grassland, it stays open grassland.
· Keep it bright and even: small landmarks and paper name tags sit on every part of it and must stay readable. No region darker or busier than the reference shows it.

COLOUR — the first image's own, pixel for pixel in hue (so the four quarters match where they meet).

WATER — every sea, bay, river, stream and lake is SATURATED BLUE: bright turquoise to sky blue, never grey, violet, green or dark. It sits exactly where the reference has it, at its width: a river stays one unbroken band from its source to the sea (never interrupted by grass, never thinner than the reference), and the lake right of centre stays open water all round its island clearing. Water is crossed ONLY by the plank bridges the reference shows, where its roads cross; no other bridge, ford, stepping stone or causeway.

ONE MAP, FOUR PIECES — the same painter, palette, light and scale in every quarter: match the FIRST attached image (this very quarter, already painted, only blurry) exactly. Its grass green, its sand, its blue water, its outline weight, its two-step shading and the size of its trees, mountains and waves; no warmer, cooler, brighter or darker. Light from the top left everywhere. Nothing in it moves, grows, shrinks or is added: it is the first image again, only sharp. This is ONE QUARTER of the map, NOT the whole map: re-detail exactly the crop the first image shows, at the SAME scale, edge to edge. Never zoom out, never fit the whole realm into the frame, and add no ring of stones, river, lake, rift or region that the first image does not show. Nor drop one it does: the jagged black rift with its glowing hot-pink rim stays where the first image has it, and land that reaches an edge there stays land, never turned into sea or coast.

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
· Laid over the last attached image, every coast, river, bridge, road and clearing is where it has it.
· Every river, lake and sea is saturated blue and unbroken, where the reference has it; water is crossed only at the reference's bridges.
· Held next to the first attached image, this quarter has its colours, light and scale: cut from it, it would fit back in unseen.
· Each region's outline matches the reference: no mountains, trees or hills outside their own region, and the mountain regions are no larger than the reference makes them.
· Held next to the first two attached images, the map looks painted by the same hand: the same outline weight, the same two-step shading, the same glints. Flat, outline-thin clip-art stickers are wrong.
· The clearings are empty, and there is not one building, figure, symbol or letter anywhere in it.
· Along the top and left edges the land runs straight on, as if the picture were cut from a bigger one.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## UI: the world map, top right quarter, its top left piece  (bg-ui-terrain-piece-ne-nw.png → ../art-sheets/map-parts/ne/nw.webp)

Attach, in this order: `art-sheets/map-parts/ref-ne-nw.jpg`, `art-sheets/painted/sheet-items-weapons.jpg`, then the reference named in the heading.

```text
WHAT COMES BACK IS THE TOP LEFT PIECE OF THE TOP RIGHT QUARTER OF AN ILLUSTRATED MAP OF A FANTASY REALM, ENLARGED: ITS TERRAIN ONLY, WITH NO BUILDINGS AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The FIRST is THIS PIECE, already painted, but enlarged and blurry: repaint it SHARP, with crisp outlines and fine detail, keeping every shape, colour and position it has. It is not to be redrawn, rearranged or zoomed out: the same picture, only sharp. The SECOND is a sheet of the game's item icons: only its hand (thick charcoal-violet outlines, hard two-step cel shading, small white glints, chunky rounded forms). Nothing of its CONTENT (no swords, no icons, no magenta) goes on the map.
· The LAST is the layout reference: the top left piece of the top right quarter of the map's plan, enlarged to fill the image. Paint EXACTLY what it shows, at its scale: every coast, region, river, bridge, road and clearing where the reference has it.

Four such pieces are painted and joined into one big map, each overlapping its neighbours by a wide strip, so they must meet without a visible join. The top edges are the edges of the whole map. The bottom and left and right edges cut straight through the middle of the land: the terrain simply runs on past them, cut off mid-tree and mid-field. No coast, no frame, no darkening, no fade and no empty margin along them.
Because it is enlarged, give every tree, mountain, wave and field MORE crisp detail than in the first image, at the SAME size against the roads and clearings — not more of them, and not smaller ones.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the sheet the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge (the game draws the paper's edge itself).

WHAT IT IS: part of the terrain of a hand-drawn storybook map, drawn the way such maps are: the land flat from above, and what stands on it (mountains, trees, hills) as small upright pictures. Repaint the LAST attached image. The game lays its own drawings over the picture by position. The whole map, for orientation (this quarter shows only some of it: paint only what the reference shows):
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
· Pale dirt roads wind between bare, flat, oval clearings, each with a darker lip along its lower edge. Keep every road and every clearing the reference shows, at its place and its size (one cut by the edge stays cut), and keep the clearings EMPTY.

WHAT IT IS NOT — read this twice. The game draws every landmark, every place marker and every name OVER this picture, on the clearings, and they change as the player travels: a place is hidden under cloud, then opens, then is marked as cleared. So the clearings stay bare ground, and NOTHING painted anywhere may be a building or a sign: no towns, no houses, no castles, no towers, no temples, no tents, no camps, no windmills, no lighthouses, no ships under sail, no people, no monsters, no flags, no banners, no crosses, no compass rose, no title ribbon, no clouds, no text, no letters, no numbers. A painted town would sit beside the real one and read as a second, wrong place.
· Do not add regions, roads, rivers or clearings the reference does not have, and do not join, move or drop any it has.
EVERY REGION KEEPS ITS OWN OUTLINE — the mistake to avoid above all. The mountains stand ONLY inside the mountain regions the reference marks, and no bigger and no more of them than it shows: a mountain range never spills over the green land, the fields, the forest, the coast, a road or a clearing, and never grows to cover a larger share of the map than its region does in the reference. The same holds for forest, hills, ice, lava and swamp: each fills its own region and stops at its edge. Where the reference shows open grassland, it stays open grassland.
· Keep it bright and even: small landmarks and paper name tags sit on every part of it and must stay readable. No region darker or busier than the reference shows it.

COLOUR — the first image's own, pixel for pixel in hue (so the four quarters match where they meet).

WATER — every sea, bay, river, stream and lake is SATURATED BLUE: bright turquoise to sky blue, never grey, violet, green or dark. It sits exactly where the reference has it, at its width: a river stays one unbroken band from its source to the sea (never interrupted by grass, never thinner than the reference), and the lake right of centre stays open water all round its island clearing. Water is crossed ONLY by the plank bridges the reference shows, where its roads cross; no other bridge, ford, stepping stone or causeway.

ONE MAP, FOUR PIECES — the same painter, palette, light and scale in every piece: match the FIRST attached image (this very piece, already painted, only blurry) exactly. Its grass green, its sand, its blue water, its outline weight, its two-step shading and the size of its trees, mountains and waves; no warmer, cooler, brighter or darker. Light from the top left everywhere. Nothing in it moves, grows, shrinks or is added: it is the first image again, only sharp. This is ONE PIECE of the map, NOT the whole map: re-detail exactly the crop the first image shows, at the SAME scale, edge to edge. Never zoom out, never fit the whole realm into the frame, and add no ring of stones, river, lake, rift or region that the first image does not show. Nor drop one it does: the jagged black rift with its glowing hot-pink rim stays where the first image has it, and land that reaches an edge there stays land, never turned into sea or coast.

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
· Laid over the last attached image, every coast, river, bridge, road and clearing is where it has it.
· Every river, lake and sea is saturated blue and unbroken, where the reference has it; water is crossed only at the reference's bridges.
· Held next to the first attached image, this piece has its colours, light and scale: cut from it, it would fit back in unseen.
· Each region's outline matches the reference: no mountains, trees or hills outside their own region, and the mountain regions are no larger than the reference makes them.
· Held next to the first two attached images, the map looks painted by the same hand: the same outline weight, the same two-step shading, the same glints. Flat, outline-thin clip-art stickers are wrong.
· The clearings are empty, and there is not one building, figure, symbol or letter anywhere in it.
· Along the bottom and left and right edges the land runs straight on, as if the picture were cut from a bigger one.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## UI: the world map, top right quarter, its top right piece  (bg-ui-terrain-piece-ne-ne.png → ../art-sheets/map-parts/ne/ne.webp)

Attach, in this order: `art-sheets/map-parts/ref-ne-ne.jpg`, `art-sheets/painted/sheet-items-weapons.jpg`, then the reference named in the heading.

```text
WHAT COMES BACK IS THE TOP RIGHT PIECE OF THE TOP RIGHT QUARTER OF AN ILLUSTRATED MAP OF A FANTASY REALM, ENLARGED: ITS TERRAIN ONLY, WITH NO BUILDINGS AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The FIRST is THIS PIECE, already painted, but enlarged and blurry: repaint it SHARP, with crisp outlines and fine detail, keeping every shape, colour and position it has. It is not to be redrawn, rearranged or zoomed out: the same picture, only sharp. The SECOND is a sheet of the game's item icons: only its hand (thick charcoal-violet outlines, hard two-step cel shading, small white glints, chunky rounded forms). Nothing of its CONTENT (no swords, no icons, no magenta) goes on the map.
· The LAST is the layout reference: the top right piece of the top right quarter of the map's plan, enlarged to fill the image. Paint EXACTLY what it shows, at its scale: every coast, region, river, bridge, road and clearing where the reference has it.

Four such pieces are painted and joined into one big map, each overlapping its neighbours by a wide strip, so they must meet without a visible join. The top and right edges are the edges of the whole map. The bottom and left edges cut straight through the middle of the land: the terrain simply runs on past them, cut off mid-tree and mid-field. No coast, no frame, no darkening, no fade and no empty margin along them.
Because it is enlarged, give every tree, mountain, wave and field MORE crisp detail than in the first image, at the SAME size against the roads and clearings — not more of them, and not smaller ones.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the sheet the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge (the game draws the paper's edge itself).

WHAT IT IS: part of the terrain of a hand-drawn storybook map, drawn the way such maps are: the land flat from above, and what stands on it (mountains, trees, hills) as small upright pictures. Repaint the LAST attached image. The game lays its own drawings over the picture by position. The whole map, for orientation (this quarter shows only some of it: paint only what the reference shows):
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
· Pale dirt roads wind between bare, flat, oval clearings, each with a darker lip along its lower edge. Keep every road and every clearing the reference shows, at its place and its size (one cut by the edge stays cut), and keep the clearings EMPTY.

WHAT IT IS NOT — read this twice. The game draws every landmark, every place marker and every name OVER this picture, on the clearings, and they change as the player travels: a place is hidden under cloud, then opens, then is marked as cleared. So the clearings stay bare ground, and NOTHING painted anywhere may be a building or a sign: no towns, no houses, no castles, no towers, no temples, no tents, no camps, no windmills, no lighthouses, no ships under sail, no people, no monsters, no flags, no banners, no crosses, no compass rose, no title ribbon, no clouds, no text, no letters, no numbers. A painted town would sit beside the real one and read as a second, wrong place.
· Do not add regions, roads, rivers or clearings the reference does not have, and do not join, move or drop any it has.
EVERY REGION KEEPS ITS OWN OUTLINE — the mistake to avoid above all. The mountains stand ONLY inside the mountain regions the reference marks, and no bigger and no more of them than it shows: a mountain range never spills over the green land, the fields, the forest, the coast, a road or a clearing, and never grows to cover a larger share of the map than its region does in the reference. The same holds for forest, hills, ice, lava and swamp: each fills its own region and stops at its edge. Where the reference shows open grassland, it stays open grassland.
· Keep it bright and even: small landmarks and paper name tags sit on every part of it and must stay readable. No region darker or busier than the reference shows it.

COLOUR — the first image's own, pixel for pixel in hue (so the four quarters match where they meet).

WATER — every sea, bay, river, stream and lake is SATURATED BLUE: bright turquoise to sky blue, never grey, violet, green or dark. It sits exactly where the reference has it, at its width: a river stays one unbroken band from its source to the sea (never interrupted by grass, never thinner than the reference), and the lake right of centre stays open water all round its island clearing. Water is crossed ONLY by the plank bridges the reference shows, where its roads cross; no other bridge, ford, stepping stone or causeway.

ONE MAP, FOUR PIECES — the same painter, palette, light and scale in every piece: match the FIRST attached image (this very piece, already painted, only blurry) exactly. Its grass green, its sand, its blue water, its outline weight, its two-step shading and the size of its trees, mountains and waves; no warmer, cooler, brighter or darker. Light from the top left everywhere. Nothing in it moves, grows, shrinks or is added: it is the first image again, only sharp. This is ONE PIECE of the map, NOT the whole map: re-detail exactly the crop the first image shows, at the SAME scale, edge to edge. Never zoom out, never fit the whole realm into the frame, and add no ring of stones, river, lake, rift or region that the first image does not show. Nor drop one it does: the jagged black rift with its glowing hot-pink rim stays where the first image has it, and land that reaches an edge there stays land, never turned into sea or coast.

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
· Laid over the last attached image, every coast, river, bridge, road and clearing is where it has it.
· Every river, lake and sea is saturated blue and unbroken, where the reference has it; water is crossed only at the reference's bridges.
· Held next to the first attached image, this piece has its colours, light and scale: cut from it, it would fit back in unseen.
· Each region's outline matches the reference: no mountains, trees or hills outside their own region, and the mountain regions are no larger than the reference makes them.
· Held next to the first two attached images, the map looks painted by the same hand: the same outline weight, the same two-step shading, the same glints. Flat, outline-thin clip-art stickers are wrong.
· The clearings are empty, and there is not one building, figure, symbol or letter anywhere in it.
· Along the bottom and left edges the land runs straight on, as if the picture were cut from a bigger one.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## UI: the world map, top right quarter, its bottom left piece  (bg-ui-terrain-piece-ne-sw.png → ../art-sheets/map-parts/ne/sw.webp)

Attach, in this order: `art-sheets/map-parts/ref-ne-sw.jpg`, `art-sheets/painted/sheet-items-weapons.jpg`, then the reference named in the heading.

```text
WHAT COMES BACK IS THE BOTTOM LEFT PIECE OF THE TOP RIGHT QUARTER OF AN ILLUSTRATED MAP OF A FANTASY REALM, ENLARGED: ITS TERRAIN ONLY, WITH NO BUILDINGS AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The FIRST is THIS PIECE, already painted, but enlarged and blurry: repaint it SHARP, with crisp outlines and fine detail, keeping every shape, colour and position it has. It is not to be redrawn, rearranged or zoomed out: the same picture, only sharp. The SECOND is a sheet of the game's item icons: only its hand (thick charcoal-violet outlines, hard two-step cel shading, small white glints, chunky rounded forms). Nothing of its CONTENT (no swords, no icons, no magenta) goes on the map.
· The LAST is the layout reference: the bottom left piece of the top right quarter of the map's plan, enlarged to fill the image. Paint EXACTLY what it shows, at its scale: every coast, region, river, bridge, road and clearing where the reference has it.

Four such pieces are painted and joined into one big map, each overlapping its neighbours by a wide strip, so they must meet without a visible join. None of its edges is an edge of the whole map. The top and bottom and left and right edges cut straight through the middle of the land: the terrain simply runs on past them, cut off mid-tree and mid-field. No coast, no frame, no darkening, no fade and no empty margin along them.
Because it is enlarged, give every tree, mountain, wave and field MORE crisp detail than in the first image, at the SAME size against the roads and clearings — not more of them, and not smaller ones.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the sheet the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge (the game draws the paper's edge itself).

WHAT IT IS: part of the terrain of a hand-drawn storybook map, drawn the way such maps are: the land flat from above, and what stands on it (mountains, trees, hills) as small upright pictures. Repaint the LAST attached image. The game lays its own drawings over the picture by position. The whole map, for orientation (this quarter shows only some of it: paint only what the reference shows):
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
· Pale dirt roads wind between bare, flat, oval clearings, each with a darker lip along its lower edge. Keep every road and every clearing the reference shows, at its place and its size (one cut by the edge stays cut), and keep the clearings EMPTY.

WHAT IT IS NOT — read this twice. The game draws every landmark, every place marker and every name OVER this picture, on the clearings, and they change as the player travels: a place is hidden under cloud, then opens, then is marked as cleared. So the clearings stay bare ground, and NOTHING painted anywhere may be a building or a sign: no towns, no houses, no castles, no towers, no temples, no tents, no camps, no windmills, no lighthouses, no ships under sail, no people, no monsters, no flags, no banners, no crosses, no compass rose, no title ribbon, no clouds, no text, no letters, no numbers. A painted town would sit beside the real one and read as a second, wrong place.
· Do not add regions, roads, rivers or clearings the reference does not have, and do not join, move or drop any it has.
EVERY REGION KEEPS ITS OWN OUTLINE — the mistake to avoid above all. The mountains stand ONLY inside the mountain regions the reference marks, and no bigger and no more of them than it shows: a mountain range never spills over the green land, the fields, the forest, the coast, a road or a clearing, and never grows to cover a larger share of the map than its region does in the reference. The same holds for forest, hills, ice, lava and swamp: each fills its own region and stops at its edge. Where the reference shows open grassland, it stays open grassland.
· Keep it bright and even: small landmarks and paper name tags sit on every part of it and must stay readable. No region darker or busier than the reference shows it.

COLOUR — the first image's own, pixel for pixel in hue (so the four quarters match where they meet).

WATER — every sea, bay, river, stream and lake is SATURATED BLUE: bright turquoise to sky blue, never grey, violet, green or dark. It sits exactly where the reference has it, at its width: a river stays one unbroken band from its source to the sea (never interrupted by grass, never thinner than the reference), and the lake right of centre stays open water all round its island clearing. Water is crossed ONLY by the plank bridges the reference shows, where its roads cross; no other bridge, ford, stepping stone or causeway.

ONE MAP, FOUR PIECES — the same painter, palette, light and scale in every piece: match the FIRST attached image (this very piece, already painted, only blurry) exactly. Its grass green, its sand, its blue water, its outline weight, its two-step shading and the size of its trees, mountains and waves; no warmer, cooler, brighter or darker. Light from the top left everywhere. Nothing in it moves, grows, shrinks or is added: it is the first image again, only sharp. This is ONE PIECE of the map, NOT the whole map: re-detail exactly the crop the first image shows, at the SAME scale, edge to edge. Never zoom out, never fit the whole realm into the frame, and add no ring of stones, river, lake, rift or region that the first image does not show. Nor drop one it does: the jagged black rift with its glowing hot-pink rim stays where the first image has it, and land that reaches an edge there stays land, never turned into sea or coast.

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
· Laid over the last attached image, every coast, river, bridge, road and clearing is where it has it.
· Every river, lake and sea is saturated blue and unbroken, where the reference has it; water is crossed only at the reference's bridges.
· Held next to the first attached image, this piece has its colours, light and scale: cut from it, it would fit back in unseen.
· Each region's outline matches the reference: no mountains, trees or hills outside their own region, and the mountain regions are no larger than the reference makes them.
· Held next to the first two attached images, the map looks painted by the same hand: the same outline weight, the same two-step shading, the same glints. Flat, outline-thin clip-art stickers are wrong.
· The clearings are empty, and there is not one building, figure, symbol or letter anywhere in it.
· Along the top and bottom and left and right edges the land runs straight on, as if the picture were cut from a bigger one.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## UI: the world map, top right quarter, its bottom right piece  (bg-ui-terrain-piece-ne-se.png → ../art-sheets/map-parts/ne/se.webp)

Attach, in this order: `art-sheets/map-parts/ref-ne-se.jpg`, `art-sheets/painted/sheet-items-weapons.jpg`, then the reference named in the heading.

```text
WHAT COMES BACK IS THE BOTTOM RIGHT PIECE OF THE TOP RIGHT QUARTER OF AN ILLUSTRATED MAP OF A FANTASY REALM, ENLARGED: ITS TERRAIN ONLY, WITH NO BUILDINGS AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The FIRST is THIS PIECE, already painted, but enlarged and blurry: repaint it SHARP, with crisp outlines and fine detail, keeping every shape, colour and position it has. It is not to be redrawn, rearranged or zoomed out: the same picture, only sharp. The SECOND is a sheet of the game's item icons: only its hand (thick charcoal-violet outlines, hard two-step cel shading, small white glints, chunky rounded forms). Nothing of its CONTENT (no swords, no icons, no magenta) goes on the map.
· The LAST is the layout reference: the bottom right piece of the top right quarter of the map's plan, enlarged to fill the image. Paint EXACTLY what it shows, at its scale: every coast, region, river, bridge, road and clearing where the reference has it.

Four such pieces are painted and joined into one big map, each overlapping its neighbours by a wide strip, so they must meet without a visible join. The right edges are the edges of the whole map. The top and bottom and left edges cut straight through the middle of the land: the terrain simply runs on past them, cut off mid-tree and mid-field. No coast, no frame, no darkening, no fade and no empty margin along them.
Because it is enlarged, give every tree, mountain, wave and field MORE crisp detail than in the first image, at the SAME size against the roads and clearings — not more of them, and not smaller ones.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the sheet the map screen is drawn on top of. No frame, no border, no vignette, no card, no matting, no rounded corners, no letterboxing, no curled or torn paper edge (the game draws the paper's edge itself).

WHAT IT IS: part of the terrain of a hand-drawn storybook map, drawn the way such maps are: the land flat from above, and what stands on it (mountains, trees, hills) as small upright pictures. Repaint the LAST attached image. The game lays its own drawings over the picture by position. The whole map, for orientation (this quarter shows only some of it: paint only what the reference shows):
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
· Pale dirt roads wind between bare, flat, oval clearings, each with a darker lip along its lower edge. Keep every road and every clearing the reference shows, at its place and its size (one cut by the edge stays cut), and keep the clearings EMPTY.

WHAT IT IS NOT — read this twice. The game draws every landmark, every place marker and every name OVER this picture, on the clearings, and they change as the player travels: a place is hidden under cloud, then opens, then is marked as cleared. So the clearings stay bare ground, and NOTHING painted anywhere may be a building or a sign: no towns, no houses, no castles, no towers, no temples, no tents, no camps, no windmills, no lighthouses, no ships under sail, no people, no monsters, no flags, no banners, no crosses, no compass rose, no title ribbon, no clouds, no text, no letters, no numbers. A painted town would sit beside the real one and read as a second, wrong place.
· Do not add regions, roads, rivers or clearings the reference does not have, and do not join, move or drop any it has.
EVERY REGION KEEPS ITS OWN OUTLINE — the mistake to avoid above all. The mountains stand ONLY inside the mountain regions the reference marks, and no bigger and no more of them than it shows: a mountain range never spills over the green land, the fields, the forest, the coast, a road or a clearing, and never grows to cover a larger share of the map than its region does in the reference. The same holds for forest, hills, ice, lava and swamp: each fills its own region and stops at its edge. Where the reference shows open grassland, it stays open grassland.
· Keep it bright and even: small landmarks and paper name tags sit on every part of it and must stay readable. No region darker or busier than the reference shows it.

COLOUR — the first image's own, pixel for pixel in hue (so the four quarters match where they meet).

WATER — every sea, bay, river, stream and lake is SATURATED BLUE: bright turquoise to sky blue, never grey, violet, green or dark. It sits exactly where the reference has it, at its width: a river stays one unbroken band from its source to the sea (never interrupted by grass, never thinner than the reference), and the lake right of centre stays open water all round its island clearing. Water is crossed ONLY by the plank bridges the reference shows, where its roads cross; no other bridge, ford, stepping stone or causeway.

ONE MAP, FOUR PIECES — the same painter, palette, light and scale in every piece: match the FIRST attached image (this very piece, already painted, only blurry) exactly. Its grass green, its sand, its blue water, its outline weight, its two-step shading and the size of its trees, mountains and waves; no warmer, cooler, brighter or darker. Light from the top left everywhere. Nothing in it moves, grows, shrinks or is added: it is the first image again, only sharp. This is ONE PIECE of the map, NOT the whole map: re-detail exactly the crop the first image shows, at the SAME scale, edge to edge. Never zoom out, never fit the whole realm into the frame, and add no ring of stones, river, lake, rift or region that the first image does not show. Nor drop one it does: the jagged black rift with its glowing hot-pink rim stays where the first image has it, and land that reaches an edge there stays land, never turned into sea or coast.

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
· Laid over the last attached image, every coast, river, bridge, road and clearing is where it has it.
· Every river, lake and sea is saturated blue and unbroken, where the reference has it; water is crossed only at the reference's bridges.
· Held next to the first attached image, this piece has its colours, light and scale: cut from it, it would fit back in unseen.
· Each region's outline matches the reference: no mountains, trees or hills outside their own region, and the mountain regions are no larger than the reference makes them.
· Held next to the first two attached images, the map looks painted by the same hand: the same outline weight, the same two-step shading, the same glints. Flat, outline-thin clip-art stickers are wrong.
· The clearings are empty, and there is not one building, figure, symbol or letter anywhere in it.
· Along the top and bottom and left edges the land runs straight on, as if the picture were cut from a bigger one.

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

## UI: the smithy backdrop  (bg-ui-forge.png → images/ui/bg-forge.webp)

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED BACKDROP FOR A GAME SCREEN: A STILL LIFE WITH NO PEOPLE AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the backdrop the screen is drawn on top of. No outer frame of your own, no vignette, no card, no matting, no rounded corners, no letterboxing.

WHAT IT IS: the inside wall of a blacksmith’s forge: courses of dark grey dressed stone blocks filling the picture, every other course offset, a warm orange glow from the hearth washing over the left of the wall, and iron tongs hanging from a hook near the top of the wall. Repaint the attached reference: every object stays where the reference has it, at its size.
· LEFT: a tall red-brick arched hearth with a black iron hood above it: inside the arch a roaring fire of orange and yellow flames on a bed of glowing coals, a few sparks rising.
· RIGHT: a steel anvil standing on a thick wooden block, a hammer with a wooden handle lying across it, a glowing orange bar of hot iron on its face, and a few sparks around it.
· MIDDLE: the plain grey stone wall, slightly darker and smoke-stained, nothing on it.

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

## UI: the alchemist’s workroom backdrop  (bg-ui-alchemy.png → images/ui/bg-alchemy.webp)

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED BACKDROP FOR A GAME SCREEN: A STILL LIFE WITH NO PEOPLE AND NO LETTERING.
One landscape image, 1376 x 768 pixels (16:9), painted edge to edge.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background behind it and NO magenta anywhere in this one: it is itself the backdrop the screen is drawn on top of. No outer frame of your own, no vignette, no card, no matting, no rounded corners, no letterboxing.

WHAT IT IS: a herbalist’s workroom wall: upright dark green wooden boards filling the picture, bunches of dried herbs hanging from the top edge on strings, warm lamplight from the right. Repaint the attached reference: every object stays where the reference has it, at its size.
· LEFT: three wooden shelves one above another, each holding a row of corked glass bottles of coloured liquid (red, blue, green, purple, yellow) in different sizes, with small white glints on the glass.
· RIGHT: a round black iron cauldron on a low fire of orange flames, bubbling bright green liquid, pale steam curling up, and a wooden ledge below with a stone mortar and an open book.
· MIDDLE: the plain dark green boards, slightly darker and quiet, nothing on them.

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
