# Battlecross art prompts — Portraits

Generated from `src/game/art/artSheet.ts` by `pnpm art:prompts` (and by the
bench at `/#/art-sheets` on export). Do not edit by hand: change the manifest.

Each block is one generation. The heading names the reference image to attach
and where the sliced result lands; it stays OUTSIDE the fence, so copy the
fenced text only (a markdown preview gives it a copy button). Save the return
as `art-sheets/painted/<reference name>.png`, then `pnpm art:slice`.

A block with an "Attach, in this order" line goes out with finished paintings
as well: attach those FIRST and the reference LAST (the model takes the grid
from the last image). `pnpm art:desk` does this by itself.

## Portraits: townsfolk  (sheet-portraits-town.png → images/portraits/)

```text
WHAT COMES BACK IS A SHEET OF 9 SEPARATE PORTRAITS, NOT ONE PICTURE.
One square image, 768 x 768 pixels (1:1), holding 9 separate small drawings laid out 3 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 9 panels. Not 1, not 6, not 12. Exactly 3 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

EACH PANEL IS ONE HEAD-AND-SHOULDERS BUST, NOT A FIGURE AND NOT A SCENE.
· Head, neck and the top of the shoulders, cut off flat along a level line exactly where the reference cuts it. No arms, no hands, no weapon, no body below the cut.
· No backdrop behind the head: the game shows each bust inside its own round frame.

WHO EACH PANEL IS:
Panel 1 (row 1, column 1): a bald, broad-faced blacksmith with a thick brown beard, tan skin and a brown work apron.
Panel 2 (row 1, column 2): a travelling merchant with a peaked rust-brown cap, fair skin and a green tunic.
Panel 3 (row 1, column 3): an old village elder with long white hair, a long white beard, pale skin and a dusty-violet robe.
Panel 4 (row 2, column 1): a healer with ginger hair tied in a round bun on top, fair skin and a cream-white robe with a green collar line.
Panel 5 (row 2, column 2): a green-skinned goblin merchant with large pointed ears sticking out sideways, a plum-purple peaked cap and a mustard tunic.
Panel 6 (row 2, column 3): a guard captain in an open-faced steel helmet with a centre ridge, fair skin and a dark red tunic with a grey collar line.
Panel 7 (row 3, column 1): a shady trader with a violet-black hood up, tan skin and a matching dark robe with a violet collar line.
Panel 8 (row 3, column 2): a stocky dwarf in a round steel helmet with a centre ridge, ruddy skin, a big ginger beard and a brown apron.
Panel 9 (row 3, column 3): an inventor with blond hair, round glass goggles on a teal strap pushed up on the forehead, fair skin and a blue-grey apron.

COLOUR — each bust keeps the skin, hair, headgear and clothing colours its panel shows in the reference. Take the HUES from it, not the flatness.

THE VIEW — straight on, facing the viewer, eyes level, the way the reference shows it. No three-quarter turn, no tilt, no profile.

ONE HAND — all 9 busts are the same kind of character drawn by the same artist: the same head size, the same eye shape, the same line weight, the same light from the upper left.

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

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 76% of its panel or taller than about 77%, and every panel keeps a clear magenta margin on all four sides.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.
· The flat cut along the bottom of each bust stays where the reference has it: it is the edge of the frame the game puts the bust in.

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
· 3 panels across, 3 down, 9 in all.
· The canvas is square, 1:1.
· Each panel holds exactly one bust, facing front, cut flat along the bottom.
· There is not one arm, hand or weapon anywhere in it.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 768 pixels (1:1, square), or the same shape larger. If your tool has an aspect-ratio control, set it to 1:1 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Portraits: trainers  (sheet-portraits-trainers.png → images/portraits/)

```text
WHAT COMES BACK IS A SHEET OF 9 SEPARATE PORTRAITS, NOT ONE PICTURE.
One square image, 768 x 768 pixels (1:1), holding 9 separate small drawings laid out 3 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 9 panels. Not 1, not 6, not 12. Exactly 3 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· 1 panel is BLANK in the reference. Leave it flat magenta: do not invent anything for it.

EACH PANEL IS ONE HEAD-AND-SHOULDERS BUST, NOT A FIGURE AND NOT A SCENE.
· Head, neck and the top of the shoulders, cut off flat along a level line exactly where the reference cuts it. No arms, no hands, no weapon, no body below the cut.
· No backdrop behind the head: the game shows each bust inside its own round frame.

WHO EACH PANEL IS:
Panel 1 (row 1, column 1): a knight in an open-faced polished steel helmet with a centre ridge, fair skin, silver plate with a gold collar line and a blue cape at the shoulders.
Panel 2 (row 1, column 2): a rogue with a near-black hood up, tan skin and dark leather with a violet collar line.
Panel 3 (row 1, column 3): a fire mage with a red-orange hood up, fair skin and a red-orange robe with a gold collar line.
Panel 4 (row 2, column 1): a monarch with a gold crown set with one red jewel, golden-blond hair, fair skin, a purple robe with a gold collar line and a red cape at the shoulders.
Panel 5 (row 2, column 2): a mage with sky-blue hair tied in a round bun on top, pale blue-tinted skin and a blue robe with a pale collar line.
Panel 6 (row 2, column 3): an alchemist with long crimson hair, pale skin, small pointed ears and a cream-white robe with a crimson collar line.
Panel 7 (row 3, column 1): an engineer with blond hair, round glass goggles on a teal strap pushed up on the forehead, fair skin and a steel-blue jacket with a teal collar line.
Panel 8 (row 3, column 2): an earth mage with a sand-brown hood up, brown skin and a sand-brown robe.
Panel 9 (row 3, column 3): BLANK — flat magenta and nothing else.

COLOUR — each bust keeps the skin, hair, headgear and clothing colours its panel shows in the reference. Take the HUES from it, not the flatness.

THE VIEW — straight on, facing the viewer, eyes level, the way the reference shows it. No three-quarter turn, no tilt, no profile.

ONE HAND — all 8 busts are the same kind of character drawn by the same artist: the same head size, the same eye shape, the same line weight, the same light from the upper left.

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

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 63% of its panel or taller than about 79%, and every panel keeps a clear magenta margin on all four sides.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.
· The flat cut along the bottom of each bust stays where the reference has it: it is the edge of the frame the game puts the bust in.

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
· 3 panels across, 3 down, 9 in all.
· The canvas is square, 1:1.
· Each panel holds exactly one bust, facing front, cut flat along the bottom.
· There is not one arm, hand or weapon anywhere in it.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 768 pixels (1:1, square), or the same shape larger. If your tool has an aspect-ratio control, set it to 1:1 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Portraits: quest speakers  (sheet-portraits-speakers.png → images/portraits/)

```text
WHAT COMES BACK IS A SHEET OF 6 SEPARATE PORTRAITS, NOT ONE PICTURE.
One landscape image, 768 x 576 pixels (4:3), holding 6 separate small drawings laid out 3 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 6 panels. Not 1, not 3, not 9. Exactly 2 rows of 3 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· The panels are NOT square: each is a little taller than it is wide (8:9), because the canvas divides into 3 equal columns and 2 equal rows. Each drawing sits in the MIDDLE of its panel, with plain magenta above and below it: do not stretch a drawing to fill the extra height.
· 1 panel is BLANK in the reference. Leave it flat magenta: do not invent anything for it.

EACH PANEL IS ONE HEAD-AND-SHOULDERS BUST, NOT A FIGURE AND NOT A SCENE.
· Head, neck and the top of the shoulders, cut off flat along a level line exactly where the reference cuts it. No arms, no hands, no weapon, no body below the cut.
· No backdrop behind the head: the game shows each bust inside its own round frame.

WHO EACH PANEL IS:
Panel 1 (row 1, column 1): a goblin chief with bright green skin, large pointed ears sticking out sideways, a gold crown set with one red jewel, a purple robe with a gold collar line and a red cape at the shoulders.
Panel 2 (row 1, column 2): a warlord whose whole head is inside a closed steel great helm with a T-shaped slit, no face showing, in dark red armour with a red cape at the shoulders.
Panel 3 (row 1, column 3): a sea-green-skinned seer with small pointed ears, teal hair, a gold crown set with one red jewel, solid pale-gold eyes with no pupils and a teal robe.
Panel 4 (row 2, column 1): a violet-skinned horned figure with two curved ivory horns, small pointed ears, dark violet hair, solid yellow eyes with no pupils and a dark violet collar with a yellow line.
Panel 5 (row 2, column 2): a crimson-skinned horned figure with two curved ivory horns, near-black hair, solid pale-yellow eyes with no pupils, dark armour with an amber collar line and a dark red cape at the shoulders.
Panel 6 (row 2, column 3): BLANK — flat magenta and nothing else.

COLOUR — each bust keeps the skin, hair, headgear and clothing colours its panel shows in the reference. Take the HUES from it, not the flatness.

THE VIEW — straight on, facing the viewer, eyes level, the way the reference shows it. No three-quarter turn, no tilt, no profile.

ONE HAND — all 5 busts are the same kind of character drawn by the same artist: the same head size, the same eye shape, the same line weight, the same light from the upper left.

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

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 76% of its panel or taller than about 70%, and every panel keeps a clear magenta margin on all four sides.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.
· The flat cut along the bottom of each bust stays where the reference has it: it is the edge of the frame the game puts the bust in.

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
· Each panel holds exactly one bust, facing front, cut flat along the bottom.
· There is not one arm, hand or weapon anywhere in it.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 768 x 576 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Portraits: the hero, per outfit  (sheet-portraits-hero.png → images/portraits/)

```text
WHAT COMES BACK IS A SHEET OF 4 SEPARATE PORTRAITS, NOT ONE PICTURE.
One square image, 512 x 512 pixels (1:1), holding 4 separate small drawings laid out 2 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 4 panels. Not 1, not 2, not 6. Exactly 2 rows of 2 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

EACH PANEL IS ONE HEAD-AND-SHOULDERS BUST, NOT A FIGURE AND NOT A SCENE.
· Head, neck and the top of the shoulders, cut off flat along a level line exactly where the reference cuts it. No arms, no hands, no weapon, no body below the cut.
· No backdrop behind the head: the game shows each bust inside its own round frame.

WHO EACH PANEL IS:
Panel 1 (row 1, column 1): the hero in his starting clothes: a plain blue cloth tunic with a gold collar line and a red cape at the shoulders.
Panel 2 (row 1, column 2): the hero in a fitted brown leather jerkin with a pale collar line and a red cape at the shoulders.
Panel 3 (row 2, column 1): the hero in a royal-blue cloth robe with a green collar line and a red cape at the shoulders.
Panel 4 (row 2, column 2): the hero in polished steel plate armour with rounded shoulder plates, a green collar line and a red cape at the shoulders.

COLOUR — each bust keeps the skin, hair, headgear and clothing colours its panel shows in the reference. Take the HUES from it, not the flatness.

THE VIEW — straight on, facing the viewer, eyes level, the way the reference shows it. No three-quarter turn, no tilt, no profile.

ONE HAND — all 4 busts are the same kind of character drawn by the same artist: the same head size, the same eye shape, the same line weight, the same light from the upper left.

ONE CHARACTER — all 4 panels are the SAME young hero, the player's own character, painted four times. That is the whole point of this sheet.
· The same face in every panel: the same head shape, the same eyes, the same small smile, the same proportions, the same age. A likeable, determined chibi adventurer, young but not a child.
· The same hair in every panel: short, tousled, warm brown (about #7a4a2a), the same cut and the same parting.
· The same skin in every panel: fair and warm (about #f2c8a0).
· ONLY THE CLOTHES CHANGE between the panels, as each panel's line says. No helmet, no hat, no hood: the face and hair always show.
· Four different people side by side is the wrong answer however well each is painted. Hold panel 1 against panel 4: if the face is not obviously the same person, it is not usable.

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

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 63% of its panel or taller than about 66%, and every panel keeps a clear magenta margin on all four sides.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.
· The flat cut along the bottom of each bust stays where the reference has it: it is the edge of the frame the game puts the bust in.

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
· Each panel holds exactly one bust, facing front, cut flat along the bottom.
· There is not one arm, hand or weapon anywhere in it.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 512 x 512 pixels (1:1, square), or the same shape larger. If your tool has an aspect-ratio control, set it to 1:1 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Portraits: the girl hero, per outfit  (sheet-portraits-girl.png → images/portraits/)

Attach, in this order: `public/images/portraits/hero-tunic.webp`, `public/images/portraits/hero-plate.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS A SHEET OF 4 SEPARATE PORTRAITS, NOT ONE PICTURE.
One square image, 512 x 512 pixels (1:1), holding 4 separate small drawings laid out 2 across and 2 down, on the same grid as the attached reference, read left to right along the top row first.
· 4 panels. Not 1, not 2, not 6. Exactly 2 rows of 2 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

EACH PANEL IS ONE HEAD-AND-SHOULDERS BUST, NOT A FIGURE AND NOT A SCENE.
· Head, neck and the top of the shoulders, cut off flat along a level line exactly where the reference cuts it. No arms, no hands, no weapon, no body below the cut.
· No backdrop behind the head: the game shows each bust inside its own round frame.

WHO EACH PANEL IS:
Panel 1 (row 1, column 1): the girl hero in her starting clothes: a plain blue cloth tunic with a gold collar line and a red cape at the shoulders.
Panel 2 (row 1, column 2): the girl hero in a fitted brown leather jerkin with a pale collar line and a red cape at the shoulders.
Panel 3 (row 2, column 1): the girl hero in a royal-blue cloth robe with a green collar line and a red cape at the shoulders.
Panel 4 (row 2, column 2): the girl hero in polished steel plate armour with rounded shoulder plates, a green collar line and a red cape at the shoulders.

COLOUR — each bust keeps the skin, hair, headgear and clothing colours its panel shows in the reference. Take the HUES from it, not the flatness.

THE VIEW — straight on, facing the viewer, eyes level, the way the reference shows it. No three-quarter turn, no tilt, no profile.

ONE HAND — all 4 busts are the same kind of character drawn by the same artist: the same head size, the same eye shape, the same line weight, the same light from the upper left.

ONE CHARACTER — all 4 panels are the SAME young girl hero, the player's own character, painted four times. That is the whole point of this sheet.
· The same face in every panel: the same head shape, the same big eyes with dark lashes flicking out at the outer corners, the same fine arched brows, the same small smile and rosy cheeks, the same proportions, the same age. A likeable, determined chibi adventurer girl, young but not a child.
· The same hair in every panel: warm auburn (about #9a4526), a soft side-swept fringe, one lock framing each cheek, and a high ponytail at the back of the head tied with a red ribbon bow (about #e0505e); the ponytail shows beside the head.
· The same skin in every panel: fair and warm (about #f2c8a0). Green eyes (about #3fa66a).
· ONLY THE CLOTHES CHANGE between the panels, as each panel's line says. No helmet, no hat, no hood: the face and hair always show.
· Four different people side by side is the wrong answer however well each is painted. Hold panel 1 against panel 4: if the face is not obviously the same person, it is not usable.

ATTACHED IMAGES — the first 2 are finished portraits of the BOY hero of this same game. She is his counterpart, a different person: take from them ONLY the finish and the hand — the outline, the hard-edged shading, the head size, the age, the proportions, the way the bust is cut. Never his face, never his short brown hair. The LAST image is the layout reference.

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

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 65% of its panel or taller than about 68%, and every panel keeps a clear magenta margin on all four sides.
· Keep each one at the size and in the spot its own panel shows. If yours reaches a panel edge it is too big, and it will be cut in half by the slice.
· Where a drawing sits in its panel is not a composition choice: do not re-centre, do not even out the spacing, do not let one lean into the next panel.
· The flat cut along the bottom of each bust stays where the reference has it: it is the edge of the frame the game puts the bust in.

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
· Each panel holds exactly one bust, facing front, cut flat along the bottom.
· There is not one arm, hand or weapon anywhere in it.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 512 x 512 pixels (1:1, square), or the same shape larger. If your tool has an aspect-ratio control, set it to 1:1 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```
