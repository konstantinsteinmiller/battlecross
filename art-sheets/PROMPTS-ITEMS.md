# Battlecross art prompts — Item icons

Generated from `src/game/art/artSheet.ts` by `pnpm art:prompts` (and by the
bench at `/#/art-sheets` on export). Do not edit by hand: change the manifest.

Each block is one generation. The heading names the reference image to attach
and where the sliced result lands; it stays OUTSIDE the fence, so copy the
fenced text only (a markdown preview gives it a copy button). Save the return
as `art-sheets/painted/<reference name>.png`, then `pnpm art:slice`.

A block with an "Attach, in this order" line goes out with finished paintings
as well: attach those FIRST and the reference LAST (the model takes the grid
from the last image). `pnpm art:desk` does this by itself.

## Item icons: weapons  (sheet-items-weapons.png → images/items/)

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

EACH PANEL IS ONE OBJECT, NOT A SCENE.
· Paint ONLY the object the reference shows in that panel. No hand holding it, no wearer, no mannequin, no stand, no ground, no shadow, no sparkle cloud, no scenery.
· The game draws its own coloured frame around each icon. Nothing here sits on a tile, badge or ring.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a short one-handed sword: a stubby straight blade of pitted, rust-flecked iron, a plain bar crossguard, a leather-wrapped grip and a round pommel. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): a plain, slightly knotted wooden staff topped with one smooth round crystal ball held in a simple curved wooden fork. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 3 (row 1, column 3): a small single-barrel pistol: a short steel barrel, a curved wooden grip and one small sight block on top. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): a broad one-handed sword: a wide, clean straight blade of polished iron with a central ridge, a thick gold bar crossguard, a brown leather grip and a round gold pommel. Accent, where the reference shows one: green (about #67e08a).
Panel 5 (row 2, column 1): a slim, needle-pointed dagger: a narrow tapering blade, a short gold crossguard and a small wooden grip. Accent, where the reference shows one: green (about #67e08a).
Panel 6 (row 2, column 2): a short carbine: a longer steel barrel with two brass bands, a wooden grip and one small glass capsule of bright liquid set on top of the barrel. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): a very large two-handed sword: a long, wide blade of dark soot-grey steel with a pale groove down its middle, a wide crossguard and a long wooden grip. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): a short, slim wooden wand with a gold-capped handle, tipped with one large four-pointed star. Accent, where the reference shows one: blue (about #50aaff).
Panel 9 (row 3, column 1): a slender one-handed sword: a straight blade of pale polished steel with a row of small engraved tick marks along it, a thin gold crossguard and a round pommel set with a small flat disc. Accent, where the reference shows one: violet (about #c58cff).
Panel 10 (row 3, column 2): a heavy battle axe: one broad curved blade and one small back blade of dark steel with a crimson band along the cutting edge, on a straight wooden haft. Accent, where the reference shows one: violet (about #c58cff).
Panel 11 (row 3, column 3): a stubby hand cannon: a thick dark-steel barrel with a wide flared muzzle ring, one round rivet on its side and a short wooden grip underneath. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 12 (row 3, column 4): a huge two-handed war hammer: a long blocky steel head with a flat striking cap at each end, on a thick straight wooden shaft. Accent, where the reference shows one: orange (about #ff8a4a).

COLOUR — each object keeps the colours its panel shows in the reference. Where the reference gives an object one strong accent colour, keep that accent: it tells the player how rare the object is. Take the HUE from it, not the flatness. Steel stays steel, wood stays brown, gold stays gold.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 12 objects are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one object is glossy and the next is flat is not one set.

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

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one object and nothing else.
· Every object would still be recognised 40 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Item icons: top weapons and off-hands  (sheet-items-arms.png → images/items/)

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· 2 panels are BLANK in the reference. Leave them flat magenta: do not invent anything for them.

EACH PANEL IS ONE OBJECT, NOT A SCENE.
· Paint ONLY the object the reference shows in that panel. No hand holding it, no wearer, no mannequin, no stand, no ground, no shadow, no sparkle cloud, no scenery.
· The game draws its own coloured frame around each icon. Nothing here sits on a tile, badge or ring.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): an ornate one-handed sword: a long, bright mirror-steel blade with a gold inlay line, a wide curved gold crossguard, a wrapped grip and a jewelled pommel. Accent, where the reference shows one: gold (about #ffd84a).
Panel 2 (row 1, column 2): a heavy long-barrelled pistol plated in gold and steel: a thick barrel with three cooling fins, a large glass capsule of bright liquid on top and a sturdy curved grip. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a small shield of wooden planks with an iron rim, crossed by two iron straps. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): a thick closed book seen from the front: a plain cloth cover, a leather spine down its left side and one four-pointed star stamped on the cover. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 5 (row 2, column 1): a shield of riveted iron plate with a raised cross-shaped rib and a rolled rim. Accent, where the reference shows one: green (about #67e08a).
Panel 6 (row 2, column 2): a brass-and-glass laboratory syringe held diagonally: a clear glass barrel half full of red liquid, a flat brass plunger on top and a short steel nozzle. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): a squat power cell seen from the front: a steel casing with rounded corners, one terminal cap on top and a large lightning-bolt mark on its face. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): a tall, heavy shield of thick polished steel plate with a wide raised rim, a cross-shaped rib and four round rivets. Accent, where the reference shows one: violet (about #c58cff).
Panel 9 (row 3, column 1): a smooth glass sphere resting on a small flat foot, with one solid teardrop-shaped flame painted inside it. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 10 (row 3, column 2): a battle-worn shield of gold-edged steel with a cross-shaped rib, two shallow dents and one notch cut in its rim. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): BLANK — flat magenta and nothing else.
Panel 12 (row 3, column 4): BLANK — flat magenta and nothing else.

COLOUR — each object keeps the colours its panel shows in the reference. Where the reference gives an object one strong accent colour, keep that accent: it tells the player how rare the object is. Take the HUE from it, not the flatness. Steel stays steel, wood stays brown, gold stays gold.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 10 objects are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one object is glossy and the next is flat is not one set.

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

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one object and nothing else.
· Every object would still be recognised 40 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Item icons: body armour  (sheet-items-armor.png → images/items/)

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

EACH PANEL IS ONE OBJECT, NOT A SCENE.
· Paint ONLY the object the reference shows in that panel. No hand holding it, no wearer, no mannequin, no stand, no ground, no shadow, no sparkle cloud, no scenery.
· The game draws its own coloured frame around each icon. Nothing here sits on a tile, badge or ring.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a sleeveless quilted cloth tunic with diamond stitching, short shoulder flaps and a simple cloth belt. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): a fitted brown leather jerkin with short shoulder flaps, a row of small buckles down the front and a wide belt. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 3 (row 1, column 3): a sleeveless vest of small steel rings with a plain steel collar, short shoulder flaps and one round clasp on the chest. Accent, where the reference shows one: green (about #67e08a).
Panel 4 (row 1, column 4): a long, loose cloth robe with wide short sleeves, a V-shaped collar and a pale trim line down the front. Accent, where the reference shows one: green (about #67e08a).
Panel 5 (row 2, column 1): a steel breastplate with riveted bands across the belly, short rounded shoulder plates and one round boss on the chest. Accent, where the reference shows one: blue (about #50aaff).
Panel 6 (row 2, column 2): a close-fitting dark leather vest with a high collar, crossed chest straps and a narrow belt. Accent, where the reference shows one: blue (about #50aaff).
Panel 7 (row 2, column 3): a long cloth robe with wide short sleeves and a deep V collar, edged with a pale band and fastened by one round brass clasp. Accent, where the reference shows one: violet (about #c58cff).
Panel 8 (row 2, column 4): a heavy steel breastplate lacquered deep crimson along its edges, with short rounded shoulder plates and one round boss on the chest. Accent, where the reference shows one: violet (about #c58cff).
Panel 9 (row 3, column 1): a boxy mechanical chest rig of steel plates with bolted seams, short squared shoulder blocks and one round glass lens in the middle of the chest. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 10 (row 3, column 2): a breastplate covered in rows of large overlapping rounded scales, with short scaled shoulder plates and one round boss on the chest. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 11 (row 3, column 3): a long ceremonial cloth robe with wide short sleeves, a deep V collar, a broad gold trim band down the front and a gold hem. Accent, where the reference shows one: gold (about #ffd84a).
Panel 12 (row 3, column 4): a massive, thick-plated breastplate of gold-edged steel with large rounded shoulder plates, a raised centre ridge and one large round boss on the chest. Accent, where the reference shows one: gold (about #ffd84a).

COLOUR — each object keeps the colours its panel shows in the reference. Where the reference gives an object one strong accent colour, keep that accent: it tells the player how rare the object is. Take the HUE from it, not the flatness. Steel stays steel, wood stays brown, gold stays gold.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 12 objects are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one object is glossy and the next is flat is not one set.

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

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 80% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one object and nothing else.
· Every object would still be recognised 40 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Item icons: trinkets  (sheet-items-trinkets.png → images/items/)

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· 2 panels are BLANK in the reference. Leave them flat magenta: do not invent anything for them.

EACH PANEL IS ONE OBJECT, NOT A SCENE.
· Paint ONLY the object the reference shows in that panel. No hand holding it, no wearer, no mannequin, no stand, no ground, no shadow, no sparkle cloud, no scenery.
· The game draws its own coloured frame around each icon. Nothing here sits on a tile, badge or ring.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a plain, slightly dented copper finger ring set with one small rough-cut stone on top. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): a smooth gold finger ring set with one round polished stone on top, held by four tiny claws. Accent, where the reference shows one: green (about #67e08a).
Panel 3 (row 1, column 3): a thin gold finger ring with one pointed diamond-cut stone on top and a small fin-shaped flange on each side of the setting. Accent, where the reference shows one: green (about #67e08a).
Panel 4 (row 1, column 4): a diamond-shaped pendant on a short loop of pale cord: a flat faceted plate with a smaller pale diamond inlaid in its middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 5 (row 2, column 1): a diamond-shaped pendant on a short loop of pale cord: a dark matte plate with a narrow pale slit-shaped inlay in its middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 6 (row 2, column 2): a small hourglass: two glass bulbs holding coloured sand, half in the top and half in the bottom, between two flat gold end plates. Accent, where the reference shows one: violet (about #c58cff).
Panel 7 (row 2, column 3): a heavy gold finger ring with a pointed claw-shaped setting holding one deep, dark teardrop-cut stone. Accent, where the reference shows one: violet (about #c58cff).
Panel 8 (row 2, column 4): a broad gold signet ring with a flat oval face on top, engraved with three small points in a row. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 9 (row 3, column 1): a gemstone cut in a rounded heart outline with flat facets and one pale crack line down it: a carved stone with hard, flat faces. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 10 (row 3, column 2): a thick, ornate gold finger ring with two engraved bands, set with one large brilliant-cut stone flanked by two tiny ones. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): BLANK — flat magenta and nothing else.
Panel 12 (row 3, column 4): BLANK — flat magenta and nothing else.

COLOUR — each object keeps the colours its panel shows in the reference. Where the reference gives an object one strong accent colour, keep that accent: it tells the player how rare the object is. Take the HUE from it, not the flatness. Steel stays steel, wood stays brown, gold stays gold.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 10 objects are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one object is glossy and the next is flat is not one set.

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

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one object and nothing else.
· Every object would still be recognised 40 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Item icons: headgear and gloves  (sheet-items-headgear.png → images/items/)

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.

EACH PANEL IS ONE OBJECT, NOT A SCENE.
· Paint ONLY the object the reference shows in that panel. No hand holding it, no wearer, no mannequin, no stand, no ground, no shadow, no sparkle cloud, no scenery.
· The game draws its own coloured frame around each icon. Nothing here sits on a tile, badge or ring.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): a round, close-fitting skullcap of quilted cloth with diamond stitching, a thick rolled brim band and a small round button on top. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): an empty soft cloth hood seen from the front: a pointed peak, a deep dark oval opening where a face would be, and two short ties hanging at the bottom. Accent, where the reference shows one: green (about #67e08a).
Panel 3 (row 1, column 3): an empty open-faced steel helmet seen from the front: a round dome with a centre ridge, a riveted brow band, a short stubby crest block on top and a narrow gap down the front. Accent, where the reference shows one: blue (about #50aaff).
Panel 4 (row 1, column 4): a thin gold headband seen from the front, rising to a point in the middle that holds one large diamond-cut stone, with one tiny round stone on each side. Accent, where the reference shows one: violet (about #c58cff).
Panel 5 (row 2, column 1): an empty closed bucket-shaped steel helmet seen from the front: a flat-topped barrel with one dark T-shaped slit, a centre ridge and two round rivets on the cheeks. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 6 (row 2, column 2): a tall pointed cloth hat with a wide round brim, its tip bent slightly to one side, a broad gold band around the base of the cone and one small four-pointed star on the cone. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): one empty mitten of rough brown leather seen from the back, fingers up: a rounded hand, a separate thumb, two stitched seam lines and a wide turned-back cuff. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 8 (row 2, column 4): one empty iron plate gauntlet seen from the back, fingers up: a boxy hand of riveted plates with a knuckle band, a separate thumb plate and a wide flared wrist cuff. Accent, where the reference shows one: green (about #67e08a).
Panel 9 (row 3, column 1): one empty fine cloth glove seen from the back, fingers up: a slim rounded hand, a separate thumb, a wide cuff with a pale trim line and one small flame-shaped patch stitched on the back of the hand. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): one empty fitted glove of dark leather seen from the back, fingers up: a rounded hand with a padded knuckle strip, a separate thumb and a narrow buckled wrist strap. Accent, where the reference shows one: violet (about #c58cff).
Panel 11 (row 3, column 3): one empty heavy plate gauntlet of dark steel seen from the back, fingers up: thick layered plates, a studded knuckle band, a separate thumb plate and a long flared cuff with a bright rim. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 12 (row 3, column 4): one empty ornate leather glove seen from the back, fingers up: a rounded hand with gold stitching, a separate thumb, one small lightning-bolt plate on the back of the hand and a wide gold-edged cuff. Accent, where the reference shows one: gold (about #ffd84a).

COLOUR — each object keeps the colours its panel shows in the reference. Where the reference gives an object one strong accent colour, keep that accent: it tells the player how rare the object is. Take the HUE from it, not the flatness. Steel stays steel, wood stays brown, gold stays gold.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 12 objects are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one object is glossy and the next is flat is not one set.

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

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one object and nothing else.
· Every object would still be recognised 40 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```

## Item icons: boots  (sheet-items-boots.png → images/items/)

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· 6 panels are BLANK in the reference. Leave them flat magenta: do not invent anything for them.

EACH PANEL IS ONE OBJECT, NOT A SCENE.
· Paint ONLY the object the reference shows in that panel. No hand holding it, no wearer, no mannequin, no stand, no ground, no shadow, no sparkle cloud, no scenery.
· The game draws its own coloured frame around each icon. Nothing here sits on a tile, badge or ring.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): one worn ankle boot of soft brown leather seen from the side, toe pointing right: a rounded toe, a folded cuff, a thick dark sole and one creased seam at the ankle. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): one calf-high leather boot seen from the side, toe pointing right: a folded cuff, two small buckled straps across the shin and a thick dark sole. Accent, where the reference shows one: green (about #67e08a).
Panel 3 (row 1, column 3): one armoured steel boot seen from the side, toe pointing right: banded shin plates, a flared knee guard on top, a rounded steel toe cap and a thick dark sole. Accent, where the reference shows one: blue (about #50aaff).
Panel 4 (row 1, column 4): one soft cloth boot seen from the side, toe pointing right: a slim toe curling slightly up, a wide cuff with a pale trim band, cloth wrappings around the ankle and a thin sole. Accent, where the reference shows one: violet (about #c58cff).
Panel 5 (row 2, column 1): one heavy armoured steel boot seen from the side, toe pointing right: thick overlapping shin plates, a large pointed knee guard, one small fin-shaped flange at the heel and a thick dark sole. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 6 (row 2, column 2): one ornate tall leather boot seen from the side, toe pointing right: gold edging along the cuff and the sole, one small wing-shaped ornament at the ankle and a gold toe cap. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): BLANK — flat magenta and nothing else.
Panel 8 (row 2, column 4): BLANK — flat magenta and nothing else.
Panel 9 (row 3, column 1): BLANK — flat magenta and nothing else.
Panel 10 (row 3, column 2): BLANK — flat magenta and nothing else.
Panel 11 (row 3, column 3): BLANK — flat magenta and nothing else.
Panel 12 (row 3, column 4): BLANK — flat magenta and nothing else.

COLOUR — each object keeps the colours its panel shows in the reference. Where the reference gives an object one strong accent colour, keep that accent: it tells the player how rare the object is. Take the HUE from it, not the flatness. Steel stays steel, wood stays brown, gold stays gold.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 6 objects are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one object is glossy and the next is flat is not one set.

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

SIZE AND PLACE — measure against the PANEL, not against the paper.
· In the reference no drawing is wider than about 69% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· Each panel holds exactly one object and nothing else.
· Every object would still be recognised 40 pixels wide.
· Nothing in any panel reaches its panel's edge.
· No line of any kind, in any shade, runs between the panels or around the canvas: the ground is one flat field.
· Every pixel that is not an object is flat, vivid #FF00FF — hold it against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape), or the same shape larger. If your tool has an aspect-ratio control, set it to 4:3 — any other shape crushes the grid and cannot be cut. PNG. No labels, captions, numbers or watermarks.
```
