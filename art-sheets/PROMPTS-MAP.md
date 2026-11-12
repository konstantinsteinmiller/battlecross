# Battlecross art prompts — World map landmarks

Generated from `src/game/art/artSheet.ts` by `pnpm art:prompts` (and by the
bench at `/#/art-sheets` on export). Do not edit by hand: change the manifest.

Each block is one generation. The heading names the reference image to attach
and where the sliced result lands; it stays OUTSIDE the fence, so copy the
fenced text only (a markdown preview gives it a copy button). Save the return
as `art-sheets/painted/<reference name>.png`, then `pnpm art:slice`.

A block with an "Attach, in this order" line goes out with finished paintings
as well: attach those FIRST and the reference LAST (the model takes the grid
from the last image). `pnpm art:desk` does this by itself.

## Map landmarks: the towns and the colosseum  (sheet-landmarks-towns.png → images/landmarks/)

Attach, in this order: `public/images/icons/ui-home.webp`, `public/images/icons/ui-chest.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE MAP LANDMARKS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.

EACH PANEL IS ONE MAP LANDMARK: THE LITTLE PICTURE A STORYBOOK MAP STANDS ON A PLACE. NOT A SCENE, NOT A PIECE OF MAP.
· The buildings, rocks or trees of that one place, whole, standing free, with clear magenta all round them and under them.
· NO ground under it: no grass patch, no dirt disc, no island, no plinth, no base plate, no oval, no ring and no shadow on the ground. The map under it is painted already, and the game draws the ring, the shadow and the name of each place itself. Only what a panel's line names stands at its foot (water under a bridge, a snowdrift, water at a temple's steps, a rocky mound).
· NO lettering anywhere: no names, no signs with writing, no letters, numbers or symbols on a pennant, a banner, a sign or a wall. A pennant is one plain colour; a sign is a blank plank.
· No people and no figures, and no creatures except where a panel's line names one.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The first 2 are FINISH references: finished paintings from this same game (a little house and a chest). Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit, how wood and roof tiles are painted. They are never subjects: no extra house and no chest may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a small, cosy farming town at the edge of the plains: in the middle a slim white clock tower with a round cream clock face (plain, no numbers) and a pointed red spire topped by a small plain yellow pennant; in front of it at the left a cream cottage with a steep red-tiled roof, a brown plank door and a small blue window; at the right a blacksmith's workshop with a blue slate roof, two warm yellow lit windows, a brown door and a short stone chimney puffing one round white cloud of smoke; one round green bush at the far right.
Panel 2 (row 1, column 2): the big river town, built on a long old stone bridge: a row of round grey stone arches carrying the bridge over a turquoise river that flows under them with small white ripples (the water shows under the arches and a little way in front of them, its near edge a wavy rounded line and its two ends tucked behind the bridge's end piers: never a square-cut block or slab of water), and crowded along the bridge's back a row of tall, narrow, timbered houses with steep gleaming SILVER roofs (polished pale silver-blue slates, each with a bright white glint) — the town's whole look is those shining silver roofs; the tallest is a slim white tower in the middle-left with a silver pointed spire and a plain blue pennant; warm yellow lit windows, little balconies and one chimney with a round white puff of smoke.
Panel 3 (row 1, column 3): a walled trade town: a long pale grey stone wall with square battlements and a round-arched wooden gate in its middle, a round stone tower with a pointed blue roof at each end of the wall, two timber-framed houses rising behind the wall (the left one with a blue roof, the right one with an orange roof) and a tall plain red pennant on a pole over the gate.
Panel 4 (row 2, column 1): a squat old border fort: two square grey stone towers with battlements, one at each side, warm yellow lit windows in them, a lower battlemented wall between the towers with a round-arched wooden gate, a small signal fire burning on the wall above the gate, a plain blue pennant on the left tower and a plain red one on the right.
Panel 5 (row 2, column 2): a forge town under a mountain: a tall tan rocky peak with a white snow cap behind, and in front of it a grey stone town wall with square battlements, a glowing orange arched forge doorway in its middle with white-hot light inside, two warm yellow lit windows, a tall dark iron chimney at the right puffing a round white cloud of smoke and a plain red pennant on the wall at the left.
Panel 6 (row 2, column 3): a round stone colosseum seen from the front and a little above: a ring of warm sand-gold stone walls, a row of dark round-topped arches all along its outside, the oval sandy floor of the arena showing inside the ring, and three plain pennants on poles along its back rim, red at the left, gold in the middle and blue at the right.

COLOUR — each landmark keeps the colours its panel shows in the reference: its roofs, walls, rock, trees and water. Take the HUES from it, not the flatness. Bright, saturated and clean: every place reads as itself by its colours.

THE VIEW — a THREE-QUARTER BIRD'S-EYE VIEW, the way a fantasy strategy game or an illustrated adventure map shows its towns: seen from the front and from about 35 degrees above, so the front walls show AND the tops show too — the slopes of the roofs, the walkways along the walls, the tops of towers, the inside of the colosseum's ring, the streets between houses — with real depth: the nearer parts lower in the drawing, the farther parts higher and behind them. Every landmark on the sheet from the SAME angle. The reference is drawn flat from the front only because it is a layout: do NOT copy that flatness. Not straight down from above either, no isometric diamond tile, no strong vanishing point, no tilted horizon. Its foot — the front bottom edge — sits level along the bottom of the drawing.

ONE HAND — all 6 landmarks are painted by the same artist for the same map: the same outline weight, the same light from the upper left, the same two-step shading, the same size of roof tiles, stones and windows. Side by side they belong on one map.

BUILT, GRAND AND PAINTED, NOT TRACED — this is what the sheet is judged on.
· The reference is a crude layout made of flat shapes: it fixes WHAT stands in each panel, its footprint and its foot line — never how it is built or how plain it is. Build every part properly, as the solid thing it is: a roof has a ridge, overhanging eaves and rows of tiles or slates; a stone wall has courses of rounded blocks and a walkway along its top; a round tower has a curved shadow side; timber shows its planks and grain; rock is chunky and faceted; water has ripples and a white glint; a window glows warm with a frame and a sill.
· Make each place CHARMING and a little grand, the jewel of its corner of the map: richer than the reference, with depth and character. Inside the reference's footprint you may add small parts that belong to that place — another little house roof peeking over a wall, a second chimney, a balcony, a lantern, window boxes, a gatehouse, a row of crenels, a cobbled lane between houses, a few barrels — never anything outside the footprint, and never something that turns it into another place.
· Chunky and rich at once: a FEW big shapes, each with crisp detail inside it that still reads when the landmark is small — tiles, stones and planks drawn as bold marks, never a fine texture.
· Real volume, in hard cel steps: every shape is lit from the upper left, with a LIT side and a clearly darker SHADOW side meeting along a hard edge (a wall that faces left is light, the wall that faces right is in shadow; a roof's two slopes are two different tones), a thin rim light on the shadow side and a few crisp white highlights.
· The wrong answers, both of which came back before: a building painted as flat single-colour shapes with an outline, seen dead from the front like the reference — it looked flat and cheap; and a glossy 3D render (plastic, clay or vinyl-toy look, soft airbrushed gradients). This is a hand-painted 2D fantasy-map landmark in the same hand as the attached finished icons.
· The FOOTPRINT is the reference's: about the same width and height in the panel, the same foot line, the same main parts (every tower, roof, door, tree and rock it shows) in the same places. The richness goes inside that footprint.

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
AVOID: a flat front elevation, a strong vanishing-point perspective, realism, pixel art, thin technical line, soft glow around a shape, drop shadows, text, numbers, frames, badges or cards behind the object.
· Each object floats in its own panel at the size the reference shows. It does NOT fill its panel; do not invent anything for a panel that is blank in the reference — flat magenta and nothing else.

READABLE ON THE MAP — each landmark is shown between about 50 and 150 pixels wide, standing on a busy painted map of meadows, fields, forest, snow and lava.
· It must be recognised as THAT place at a glance: its silhouette and its two or three main colours say which place it is.
· A thick outline holds it apart from the map under it; nothing thinner than the outline survives at 50 pixels.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 77% of its panel or taller than about 66%, and every panel keeps a clear magenta margin on all four sides.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.
· The foot of each landmark — its ground line — stays where the reference has it: the game stands the picture on the spot of its place by that line.

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

BEFORE YOU CALL IT FINISHED, count and check:
· 3 panels across, 2 down, 6 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one landmark, standing on its own foot line, with magenta on every side of it and under it.
· There is no ground patch, plate, ring, oval or cast shadow under any of them, and not one letter, number or symbol anywhere.
· Every landmark is built and shaded, with tiles, stones and planks — not flat shapes with an outline.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Map landmarks: the early wilds  (sheet-landmarks-wilds-1.png → images/landmarks/)

Attach, in this order: `public/images/icons/ui-home.webp`, `public/images/icons/ui-chest.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE MAP LANDMARKS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.

EACH PANEL IS ONE MAP LANDMARK: THE LITTLE PICTURE A STORYBOOK MAP STANDS ON A PLACE. NOT A SCENE, NOT A PIECE OF MAP.
· The buildings, rocks or trees of that one place, whole, standing free, with clear magenta all round them and under them.
· NO ground under it: no grass patch, no dirt disc, no island, no plinth, no base plate, no oval, no ring and no shadow on the ground. The map under it is painted already, and the game draws the ring, the shadow and the name of each place itself. Only what a panel's line names stands at its foot (water under a bridge, a snowdrift, water at a temple's steps, a rocky mound).
· NO lettering anywhere: no names, no signs with writing, no letters, numbers or symbols on a pennant, a banner, a sign or a wall. A pennant is one plain colour; a sign is a blank plank.
· No people and no figures, and no creatures except where a panel's line names one.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The first 2 are FINISH references: finished paintings from this same game (a little house and a chest). Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit, how wood and roof tiles are painted. They are never subjects: no extra house and no chest may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a bandit camp beside the open road: a big orange canvas tent in the middle with a dark open flap and a plain red pennant on its centre pole, a short wooden post with a blank plank sign at the left, a crackling campfire on two crossed logs at the right and a small wooden crate at the far right.
Panel 2 (row 1, column 2): a goblin cave in a rounded lilac-grey rocky hill with green moss along its top: a big dark arched cave mouth in the middle, two pale pointed stone teeth hanging from its top edge and two glowing yellow eyes peering out of the dark, a short fence of sharpened wooden stakes across the foot of the hill on either side of the mouth, a lit torch on a pole at the right and a small plain green pennant on the hilltop at the left.
Panel 3 (row 1, column 3): an enchanted forest: one big round-crowned green tree in the middle on a thick brown trunk, its leafy crown wearing a friendly face of two glowing yellow eyes and a small curved mouth, a smaller round green tree on each side, a red toadstool with white spots at the foot on the left and a small round green bush at the foot on the right.
Panel 4 (row 2, column 1): a farm on fire: a red barn with a dark brown roof and a white cross-braced door, bright orange flames licking from its roof and one wall, a grey cloud of smoke above, a short wooden rail fence at the right and a row of golden wheat stalks at the left.
Panel 5 (row 2, column 2): a smoking volcano of dark mauve-brown rock: a jagged crater rim glowing with orange lava, a stream of glowing lava running down its front, a round puff of pale grey smoke above the crater and two dark boulders at its foot.
Panel 6 (row 2, column 3): a mine entrance in a tan rocky hill: a dark square tunnel mouth framed by two thick timber posts and a timber lintel, a lantern glowing over the mouth, a pair of rail tracks running out toward the viewer, and a small steel mine cart heaped with shining gold ore on the tracks.

COLOUR — each landmark keeps the colours its panel shows in the reference: its roofs, walls, rock, trees and water. Take the HUES from it, not the flatness. Bright, saturated and clean: every place reads as itself by its colours.

THE VIEW — a THREE-QUARTER BIRD'S-EYE VIEW, the way a fantasy strategy game or an illustrated adventure map shows its towns: seen from the front and from about 35 degrees above, so the front walls show AND the tops show too — the slopes of the roofs, the walkways along the walls, the tops of towers, the inside of the colosseum's ring, the streets between houses — with real depth: the nearer parts lower in the drawing, the farther parts higher and behind them. Every landmark on the sheet from the SAME angle. The reference is drawn flat from the front only because it is a layout: do NOT copy that flatness. Not straight down from above either, no isometric diamond tile, no strong vanishing point, no tilted horizon. Its foot — the front bottom edge — sits level along the bottom of the drawing.

ONE HAND — all 6 landmarks are painted by the same artist for the same map: the same outline weight, the same light from the upper left, the same two-step shading, the same size of roof tiles, stones and windows. Side by side they belong on one map.

BUILT, GRAND AND PAINTED, NOT TRACED — this is what the sheet is judged on.
· The reference is a crude layout made of flat shapes: it fixes WHAT stands in each panel, its footprint and its foot line — never how it is built or how plain it is. Build every part properly, as the solid thing it is: a roof has a ridge, overhanging eaves and rows of tiles or slates; a stone wall has courses of rounded blocks and a walkway along its top; a round tower has a curved shadow side; timber shows its planks and grain; rock is chunky and faceted; water has ripples and a white glint; a window glows warm with a frame and a sill.
· Make each place CHARMING and a little grand, the jewel of its corner of the map: richer than the reference, with depth and character. Inside the reference's footprint you may add small parts that belong to that place — another little house roof peeking over a wall, a second chimney, a balcony, a lantern, window boxes, a gatehouse, a row of crenels, a cobbled lane between houses, a few barrels — never anything outside the footprint, and never something that turns it into another place.
· Chunky and rich at once: a FEW big shapes, each with crisp detail inside it that still reads when the landmark is small — tiles, stones and planks drawn as bold marks, never a fine texture.
· Real volume, in hard cel steps: every shape is lit from the upper left, with a LIT side and a clearly darker SHADOW side meeting along a hard edge (a wall that faces left is light, the wall that faces right is in shadow; a roof's two slopes are two different tones), a thin rim light on the shadow side and a few crisp white highlights.
· The wrong answers, both of which came back before: a building painted as flat single-colour shapes with an outline, seen dead from the front like the reference — it looked flat and cheap; and a glossy 3D render (plastic, clay or vinyl-toy look, soft airbrushed gradients). This is a hand-painted 2D fantasy-map landmark in the same hand as the attached finished icons.
· The FOOTPRINT is the reference's: about the same width and height in the panel, the same foot line, the same main parts (every tower, roof, door, tree and rock it shows) in the same places. The richness goes inside that footprint.

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
AVOID: a flat front elevation, a strong vanishing-point perspective, realism, pixel art, thin technical line, soft glow around a shape, drop shadows, text, numbers, frames, badges or cards behind the object.
· Each object floats in its own panel at the size the reference shows. It does NOT fill its panel; do not invent anything for a panel that is blank in the reference — flat magenta and nothing else.

READABLE ON THE MAP — each landmark is shown between about 50 and 150 pixels wide, standing on a busy painted map of meadows, fields, forest, snow and lava.
· It must be recognised as THAT place at a glance: its silhouette and its two or three main colours say which place it is.
· A thick outline holds it apart from the map under it; nothing thinner than the outline survives at 50 pixels.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 74% of its panel or taller than about 49%, and every panel keeps a clear magenta margin on all four sides.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.
· The foot of each landmark — its ground line — stays where the reference has it: the game stands the picture on the spot of its place by that line.

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

BEFORE YOU CALL IT FINISHED, count and check:
· 3 panels across, 2 down, 6 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one landmark, standing on its own foot line, with magenta on every side of it and under it.
· There is no ground patch, plate, ring, oval or cast shadow under any of them, and not one letter, number or symbol anywhere.
· Every landmark is built and shaded, with tiles, stones and planks — not flat shapes with an outline.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Map landmarks: the far wilds  (sheet-landmarks-wilds-2.png → images/landmarks/)

Attach, in this order: `public/images/icons/ui-home.webp`, `public/images/icons/ui-chest.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE MAP LANDMARKS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.

EACH PANEL IS ONE MAP LANDMARK: THE LITTLE PICTURE A STORYBOOK MAP STANDS ON A PLACE. NOT A SCENE, NOT A PIECE OF MAP.
· The buildings, rocks or trees of that one place, whole, standing free, with clear magenta all round them and under them.
· NO ground under it: no grass patch, no dirt disc, no island, no plinth, no base plate, no oval, no ring and no shadow on the ground. The map under it is painted already, and the game draws the ring, the shadow and the name of each place itself. Only what a panel's line names stands at its foot (water under a bridge, a snowdrift, water at a temple's steps, a rocky mound).
· NO lettering anywhere: no names, no signs with writing, no letters, numbers or symbols on a pennant, a banner, a sign or a wall. A pennant is one plain colour; a sign is a blank plank.
· No people and no figures, and no creatures except where a panel's line names one.

ATTACHED IMAGES — there are 3, and they do two different jobs.
· The first 2 are FINISH references: finished paintings from this same game (a little house and a chest). Take the FINISH from them and nothing else — how thick the outline is, how the lit side and the shadow side meet along a hard edge, where the highlights sit, how wood and roof tiles are painted. They are never subjects: no extra house and no chest may appear in any panel unless the layout reference shows it there.
· The LAST image is the LAYOUT reference: the grid, and the shape, size and place of each panel. Wherever this text says "the reference", it means that last image.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a cluster of three tall jagged spires of crystal-clear pale blue ice, each cut in big flat faceted faces like a gem (a lit face, a mid face and a deep blue shadow face), the middle one tallest, rising out of a heaped white snowdrift with soft blue shadows in its hollows, and one small solid four-pointed white sparkle above the tallest tip.
Panel 2 (row 1, column 2): a sunken temple seen from three-quarters: a white marble front of four columns with fluted shafts under a teal triangular roof of tiles, one round gold disc in its gable, the third column broken off short, green vines hanging down two columns, the whole front standing in turquoise water with small white ripples and a wavy rounded edge at its foot.
Panel 3 (row 1, column 3): a strange crystal citadel: three tall violet stone towers with sharp faceted slate tops on a jagged dark purple rocky mound, the middle tower tallest with a dark arched door, small glowing pale violet windows (violet, never pink), a pale lilac crystal floating above the middle tower and one small SOLID lilac crystal shard floating at each side of it (solid faceted crystal: no smoke, no wisps, no trails of light).
Panel 4 (row 2, column 1): a craggy blue-grey mountain with a white snow cap, built of big rocky faces and ledges (a lit face and a shadow face, snow lying on the ledges), and curled on its summit a huge purple winged beast asleep: two broad purple bat-like wings folded up behind the peak, a horned purple head resting on the top with one sleepy half-closed yellow eye, its long tail curling down one side, and a small dark cave opening at the mountain's foot.
Panel 5 (row 2, column 2): a dark fortress seen from three-quarters: a maroon-purple stone keep with a battlemented walkway along its top, a tall red pointed spire rising from it, a tall round maroon tower with a red pointed roof at each side, a glowing orange arched gate banded with black iron, two angry glowing orange slit windows over the gate, and a small plain red pennant on each tower top.
Panel 6 (row 2, column 3): a jagged star-shaped chasm torn deep into the land, seen from three-quarters above: spiky dark rock lips around a deep dark pit, a violet inner rim lit from below, and in its centre a glowing teardrop of bright lilac light with a white-hot core (lilac and violet, never hot pink or magenta), three short sharp solid violet rays at its top and its two sides, and three small dark purple rock shards floating round it.

COLOUR — each landmark keeps the colours its panel shows in the reference: its roofs, walls, rock, trees and water. Take the HUES from it, not the flatness. Bright, saturated and clean: every place reads as itself by its colours.

THE VIEW — a THREE-QUARTER BIRD'S-EYE VIEW, the way a fantasy strategy game or an illustrated adventure map shows its towns: seen from the front and from about 35 degrees above, so the front walls show AND the tops show too — the slopes of the roofs, the walkways along the walls, the tops of towers, the inside of the colosseum's ring, the streets between houses — with real depth: the nearer parts lower in the drawing, the farther parts higher and behind them. Every landmark on the sheet from the SAME angle. The reference is drawn flat from the front only because it is a layout: do NOT copy that flatness. Not straight down from above either, no isometric diamond tile, no strong vanishing point, no tilted horizon. Its foot — the front bottom edge — sits level along the bottom of the drawing.

ONE HAND — all 6 landmarks are painted by the same artist for the same map: the same outline weight, the same light from the upper left, the same two-step shading, the same size of roof tiles, stones and windows. Side by side they belong on one map.

BUILT, GRAND AND PAINTED, NOT TRACED — this is what the sheet is judged on.
· The reference is a crude layout made of flat shapes: it fixes WHAT stands in each panel, its footprint and its foot line — never how it is built or how plain it is. Build every part properly, as the solid thing it is: a roof has a ridge, overhanging eaves and rows of tiles or slates; a stone wall has courses of rounded blocks and a walkway along its top; a round tower has a curved shadow side; timber shows its planks and grain; rock is chunky and faceted; water has ripples and a white glint; a window glows warm with a frame and a sill.
· Make each place CHARMING and a little grand, the jewel of its corner of the map: richer than the reference, with depth and character. Inside the reference's footprint you may add small parts that belong to that place — another little house roof peeking over a wall, a second chimney, a balcony, a lantern, window boxes, a gatehouse, a row of crenels, a cobbled lane between houses, a few barrels — never anything outside the footprint, and never something that turns it into another place.
· Chunky and rich at once: a FEW big shapes, each with crisp detail inside it that still reads when the landmark is small — tiles, stones and planks drawn as bold marks, never a fine texture.
· Real volume, in hard cel steps: every shape is lit from the upper left, with a LIT side and a clearly darker SHADOW side meeting along a hard edge (a wall that faces left is light, the wall that faces right is in shadow; a roof's two slopes are two different tones), a thin rim light on the shadow side and a few crisp white highlights.
· The wrong answers, both of which came back before: a building painted as flat single-colour shapes with an outline, seen dead from the front like the reference — it looked flat and cheap; and a glossy 3D render (plastic, clay or vinyl-toy look, soft airbrushed gradients). This is a hand-painted 2D fantasy-map landmark in the same hand as the attached finished icons.
· The FOOTPRINT is the reference's: about the same width and height in the panel, the same foot line, the same main parts (every tower, roof, door, tree and rock it shows) in the same places. The richness goes inside that footprint.

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
AVOID: a flat front elevation, a strong vanishing-point perspective, realism, pixel art, thin technical line, soft glow around a shape, drop shadows, text, numbers, frames, badges or cards behind the object.
· Each object floats in its own panel at the size the reference shows. It does NOT fill its panel; do not invent anything for a panel that is blank in the reference — flat magenta and nothing else.

READABLE ON THE MAP — each landmark is shown between about 50 and 150 pixels wide, standing on a busy painted map of meadows, fields, forest, snow and lava.
· It must be recognised as THAT place at a glance: its silhouette and its two or three main colours say which place it is.
· A thick outline holds it apart from the map under it; nothing thinner than the outline survives at 50 pixels.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 76% of its panel or taller than about 62%, and every panel keeps a clear magenta margin on all four sides.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.
· The foot of each landmark — its ground line — stays where the reference has it: the game stands the picture on the spot of its place by that line.

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

BEFORE YOU CALL IT FINISHED, count and check:
· 3 panels across, 2 down, 6 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one landmark, standing on its own foot line, with magenta on every side of it and under it.
· There is no ground patch, plate, ring, oval or cast shadow under any of them, and not one letter, number or symbol anywhere.
· Every landmark is built and shaded, with tiles, stones and planks — not flat shapes with an outline.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Map landmarks: the burned towns  (sheet-landmarks-ruins.png → images/landmarks/)

Attach, in this order: `public/images/landmarks/sunford.webp`, `public/images/landmarks/oakhaven.webp`, `public/images/landmarks/ironhold.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 4 SEPARATE MAP LANDMARKS, NOT ONE PICTURE.
One square image, 512 x 512 pixels (1:1), holding 4 separate small drawings laid out 2 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 4 panels. Not 1, not 2, not 6. Exactly 2 rows of 2 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· 1 panel is BLANK in the reference. Leave it flat magenta: do not invent anything for it.

EACH PANEL IS ONE MAP LANDMARK: THE LITTLE PICTURE A STORYBOOK MAP STANDS ON A PLACE. NOT A SCENE, NOT A PIECE OF MAP.
· The buildings, rocks or trees of that one place, whole, standing free, with clear magenta all round them and under them.
· NO ground under it: no grass patch, no dirt disc, no island, no plinth, no base plate, no oval, no ring and no shadow on the ground. The map under it is painted already, and the game draws the ring, the shadow and the name of each place itself. Only what a panel's line names stands at its foot (water under a bridge, a snowdrift, water at a temple's steps, a rocky mound).
· NO lettering anywhere: no names, no signs with writing, no letters, numbers or symbols on a pennant, a banner, a sign or a wall. A pennant is one plain colour; a sign is a blank plank.
· No people and no figures, and no creatures except where a panel's line names one.

ATTACHED IMAGES — there are 4, and they do two different jobs.
· The first 3 are the SAME places, already finished, in panel order: the first attached image is panel 1's town, the second is panel 2's, the third is panel 3's. Paint each of them again, the same building for building, the same shapes, colours and hand, only burned as its panel's line says. Two different towns is the wrong answer.
· The LAST image is the LAYOUT reference: the grid, and the size and place of each panel. Wherever this text says "the reference", it means that last image.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): the same small farming town as the first attached image, burned: the white clock tower, the cottage and the smithy stand where they stood, but their walls are soot-grey, their doors are charred black, bright orange flames burn on the roofs and two dark grey clouds of smoke rise; no pennant.
Panel 2 (row 1, column 2): the same walled trade town as the second attached image, fallen: the wall, the two round towers and the two houses stand where they stood, but everything is soot-dark and bruised violet-grey, a jagged black breach is broken through the wall beside the gate, the gate is a charred black hole, orange flames burn on the house roofs, a dark grey cloud of smoke rises and a tattered black pennant hangs over the gate.
Panel 3 (row 2, column 1): the same forge town under a mountain as the third attached image, overrun: the peak, the wall and the forge doorway stand where they stood, but the wall is soot-dark, bright orange flames burn along the top of the wall instead of the pennant, and a dark grey cloud of smoke rises over it.
Panel 4 (row 2, column 2): BLANK — flat magenta and nothing else.

COLOUR — each landmark keeps the colours its panel shows in the reference: its roofs, walls, rock, trees and water. Take the HUES from it, not the flatness. Bright, saturated and clean: every place reads as itself by its colours.

THE VIEW — a THREE-QUARTER BIRD'S-EYE VIEW, the way a fantasy strategy game or an illustrated adventure map shows its towns: seen from the front and from about 35 degrees above, so the front walls show AND the tops show too — the slopes of the roofs, the walkways along the walls, the tops of towers, the inside of the colosseum's ring, the streets between houses — with real depth: the nearer parts lower in the drawing, the farther parts higher and behind them. Every landmark on the sheet from the SAME angle. The reference is drawn flat from the front only because it is a layout: do NOT copy that flatness. Not straight down from above either, no isometric diamond tile, no strong vanishing point, no tilted horizon. Its foot — the front bottom edge — sits level along the bottom of the drawing.

ONE HAND — all 3 landmarks are painted by the same artist for the same map: the same outline weight, the same light from the upper left, the same two-step shading, the same size of roof tiles, stones and windows. Side by side they belong on one map.

BUILT, GRAND AND PAINTED, NOT TRACED — this is what the sheet is judged on.
· The reference is a crude layout made of flat shapes: it fixes WHAT stands in each panel, its footprint and its foot line — never how it is built or how plain it is. Build every part properly, as the solid thing it is: a roof has a ridge, overhanging eaves and rows of tiles or slates; a stone wall has courses of rounded blocks and a walkway along its top; a round tower has a curved shadow side; timber shows its planks and grain; rock is chunky and faceted; water has ripples and a white glint; a window glows warm with a frame and a sill.
· Make each place CHARMING and a little grand, the jewel of its corner of the map: richer than the reference, with depth and character. Inside the reference's footprint you may add small parts that belong to that place — another little house roof peeking over a wall, a second chimney, a balcony, a lantern, window boxes, a gatehouse, a row of crenels, a cobbled lane between houses, a few barrels — never anything outside the footprint, and never something that turns it into another place.
· Chunky and rich at once: a FEW big shapes, each with crisp detail inside it that still reads when the landmark is small — tiles, stones and planks drawn as bold marks, never a fine texture.
· Real volume, in hard cel steps: every shape is lit from the upper left, with a LIT side and a clearly darker SHADOW side meeting along a hard edge (a wall that faces left is light, the wall that faces right is in shadow; a roof's two slopes are two different tones), a thin rim light on the shadow side and a few crisp white highlights.
· The wrong answers, both of which came back before: a building painted as flat single-colour shapes with an outline, seen dead from the front like the reference — it looked flat and cheap; and a glossy 3D render (plastic, clay or vinyl-toy look, soft airbrushed gradients). This is a hand-painted 2D fantasy-map landmark in the same hand as the attached finished icons.
· The FOOTPRINT is the reference's: about the same width and height in the panel, the same foot line, the same main parts (every tower, roof, door, tree and rock it shows) in the same places. The richness goes inside that footprint.

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
AVOID: a flat front elevation, a strong vanishing-point perspective, realism, pixel art, thin technical line, soft glow around a shape, drop shadows, text, numbers, frames, badges or cards behind the object.
· Each object floats in its own panel at the size the reference shows. It does NOT fill its panel; do not invent anything for a panel that is blank in the reference — flat magenta and nothing else.

READABLE ON THE MAP — each landmark is shown between about 50 and 150 pixels wide, standing on a busy painted map of meadows, fields, forest, snow and lava.
· It must be recognised as THAT place at a glance: its silhouette and its two or three main colours say which place it is.
· A thick outline holds it apart from the map under it; nothing thinner than the outline survives at 50 pixels.

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 77% of its panel or taller than about 59%, and every panel keeps a clear magenta margin on all four sides.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.
· The foot of each landmark — its ground line — stays where the reference has it: the game stands the picture on the spot of its place by that line.

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

BEFORE YOU CALL IT FINISHED, count and check:
· 2 panels across, 2 down, 4 in all.
· The canvas is square, 1:1.
· Each panel holds exactly one landmark, standing on its own foot line, with magenta on every side of it and under it.
· There is no ground patch, plate, ring, oval or cast shadow under any of them, and not one letter, number or symbol anywhere.
· Every landmark is built and shaded, with tiles, stones and planks — not flat shapes with an outline.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 512 x 512 pixels (1:1, square), or the same shape larger. If your tool has an aspect-ratio control, set it to 1:1 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```
