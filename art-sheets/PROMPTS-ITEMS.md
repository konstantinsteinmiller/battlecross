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

## Item icons: the Charisma set  (sheet-items-charisma.png → images/items/)

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
Panel 1 (row 1, column 1): a small round brass brooch with a pin behind it and a tiny trumpet engraved on its face. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): a small worn leather book with a cloth strap around it and a pale ribbon bookmark hanging out at the bottom. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 3 (row 1, column 3): a long plain wooden staff with a wide round hook curling over at its top end. Accent, where the reference shows one: green (about #67e08a).
Panel 4 (row 1, column 4): a soft cloth cap with a floppy brim folded up at one side and one long feather standing up from the band. Accent, where the reference shows one: green (about #67e08a).
Panel 5 (row 2, column 1): a pair of simple flat leather sandals with crossed straps that wrap around the ankle. Accent, where the reference shows one: green (about #67e08a).
Panel 6 (row 2, column 2): one thick leather glove with a long cuff reaching up the forearm and a padded patch across its back. Accent, where the reference shows one: blue (about #50aaff).
Panel 7 (row 2, column 3): a round bronze cow bell with a wide mouth, hanging from a short loop of leather strap. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): a tall wooden pole topped with a gold spearhead, with a long rectangular cloth flag hanging down from a crossbar. Accent, where the reference shows one: violet (about #c58cff).
Panel 9 (row 3, column 1): a sleeveless cloth tunic split into four squares of two alternating colours, with a broad belt at the waist. Accent, where the reference shows one: violet (about #c58cff).
Panel 10 (row 3, column 2): a thick heavy book bound in dark leather with brass corner plates and a single round gold clasp on its front. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 11 (row 3, column 3): a gold crown with five tall points, each tipped with a small round gem, and a band of square gems around it. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 12 (row 3, column 4): a short gold rod with a ribbed grip and a large round gem held in four curved claws at its top. Accent, where the reference shows one: gold (about #ffd84a).

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

## Item icons: the Dexterity set, weapons and off-hands  (sheet-items-dexterity-arms.png → images/items/)

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
Panel 1 (row 1, column 1): a short plain dagger with a stubby single-edged blade, a bare iron crossguard and a wrapped cord grip. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): a slim curved dagger whose blade bends like a snake fang, with a thin groove down its middle and a small green stone in the pommel. Accent, where the reference shows one: blue (about #50aaff).
Panel 3 (row 1, column 3): a long thin rapier with a pale blade, a swept basket guard of fine silver wire and a narrow dark grip. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 4 (row 1, column 4): a slim silver dagger with a gently curved blade etched with three swirling wind lines, a small gold wing-shaped crossguard and a pale blue gem in the pommel. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a small round dark-leather buckler with a plain iron rim and a single iron stud in the middle. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 6 (row 2, column 2): a small round-bellied glass bottle with a long thin neck and a cork stopper, half full of bright green liquid. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): a small round steel buckler with a raised centre boss and two curved blade-like fins on its rim. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): a tall slim brass-and-glass syringe held diagonally: a clear barrel filled with dark purple liquid, a flat brass plunger on top and a long thin steel nozzle. Accent, where the reference shows one: violet (about #c58cff).
Panel 9 (row 3, column 1): a light round targe of pale wood edged with silver, painted with three swirling wind curls around a small silver boss. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 10 (row 3, column 2): a small round shield of dark blackened steel with a thin gold rim and a gold crescent moon inlaid across its face. Accent, where the reference shows one: gold (about #ffd84a).
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

## Item icons: the Dexterity set, head, body and hands  (sheet-items-dexterity-armor.png → images/items/)

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
Panel 1 (row 1, column 1): an empty soft cloth hood seen from the front, short and rounded, in dull green, with a deep dark oval opening and two short ties at the bottom. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): an empty dark grey cloth hood seen from the front: a pointed peak, a deep dark oval opening and a narrow band of stitched leather across the brow. Accent, where the reference shows one: blue (about #50aaff).
Panel 3 (row 1, column 3): an empty deep purple cloth hood seen from the front: a pointed peak, a long draped cape collar around the bottom and a small silver clasp at the throat. Accent, where the reference shows one: violet (about #c58cff).
Panel 4 (row 1, column 4): a snug pale leather cap with a short curved brim at the front, two small silver wing shapes on its sides and a thin chin strap. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 5 (row 2, column 1): an empty black hood seen from the front with a pale half-mask sewn onto it: a smooth plain mask with two narrow eye slits, and swirling silver wind lines stitched along the edge. Accent, where the reference shows one: gold (about #ffd84a).
Panel 6 (row 2, column 2): a fitted green leather jerkin with short shoulder flaps, laced ties down the front and a wide brown belt with a small pouch. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): a fitted dark leather tunic with overlapping scale-like plates on the chest, a high collar, dark straps across the front and a wide belt. Accent, where the reference shows one: violet (about #c58cff).
Panel 8 (row 2, column 4): a light pale leather vest with crossed leather harness straps over the chest, small silver buckles and short shoulder flaps. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 9 (row 3, column 1): a fitted black leather jacket with silver stitching and a high collar, two crossed gold-buckled straps over the chest and a short split cape hanging behind. Accent, where the reference shows one: gold (about #ffd84a).
Panel 10 (row 3, column 2): one empty fitted glove of dark brown leather seen from the back, fingers up: a rounded hand, a separate thumb and a short plain cuff. Accent, where the reference shows one: green (about #67e08a).
Panel 11 (row 3, column 3): one empty fitted glove of black leather seen from the back, fingers up: a rounded hand with the fingertips cut open at the ends and a narrow buckled wrist strap. Accent, where the reference shows one: blue (about #50aaff).
Panel 12 (row 3, column 4): one empty fitted glove of pale grey leather seen from the back, fingers up: a rounded hand with a padded knuckle strip, a separate thumb and a flared silver-edged cuff shaped like a wing. Accent, where the reference shows one: orange (about #ff8a4a).

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

## Item icons: the Dexterity set, boots and trinkets  (sheet-items-dexterity-boots.png → images/items/)

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· 3 panels are BLANK in the reference. Leave them flat magenta: do not invent anything for them.

EACH PANEL IS ONE OBJECT, NOT A SCENE.
· Paint ONLY the object the reference shows in that panel. No hand holding it, no wearer, no mannequin, no stand, no ground, no shadow, no sparkle cloud, no scenery.
· The game draws its own coloured frame around each icon. Nothing here sits on a tile, badge or ring.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): one pair of low soft leather shoes seen from the side, toe pointing right: thin flexible soles, a simple lace across the top and no heel. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): one soft calf-high dark boot seen from the side, toe pointing right: a folded cuff, a thin sole and a single small buckle at the ankle. Accent, where the reference shows one: blue (about #50aaff).
Panel 3 (row 1, column 3): one calf-high purple-black leather boot seen from the side, toe pointing right: a close fit, a row of small silver buckles up the outside and a thin sole. Accent, where the reference shows one: violet (about #c58cff).
Panel 4 (row 1, column 4): one tall pale leather boot seen from the side, toe pointing right: a folded cuff, a small silver wing shape on the ankle and a thin grey sole. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 5 (row 2, column 1): a round gold coin on a short loop of cord with a square hole cut through its middle and a small star engraved above the hole. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 6 (row 2, column 2): a thin dark steel finger ring with a flat black stone set on top and a thin silver line running around the band. Accent, where the reference shows one: blue (about #50aaff).
Panel 7 (row 2, column 3): a small hourglass: two glass bulbs holding pale silver sand, half in the top and half in the bottom, between two flat steel end plates each with a small wing shape. Accent, where the reference shows one: violet (about #c58cff).
Panel 8 (row 2, column 4): a single curved dark claw on a short loop of cord, capped at its base with a small gold ring and a red bead. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 9 (row 3, column 1): a gemstone cut in a rounded heart outline with flat facets, pale blue with swirling white streaks inside it: a carved stone with hard, flat faces, set in a thin silver rim. Accent, where the reference shows one: gold (about #ffd84a).
Panel 10 (row 3, column 2): BLANK — flat magenta and nothing else.
Panel 11 (row 3, column 3): BLANK — flat magenta and nothing else.
Panel 12 (row 3, column 4): BLANK — flat magenta and nothing else.

COLOUR — each object keeps the colours its panel shows in the reference. Where the reference gives an object one strong accent colour, keep that accent: it tells the player how rare the object is. Take the HUE from it, not the flatness. Steel stays steel, wood stays brown, gold stays gold.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 9 objects are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one object is glossy and the next is flat is not one set.

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

## Item icons: the gap-fill set, 1 of 9  (sheet-items-fill-1.png → images/items/)

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
Panel 1 (row 1, column 1): a kite-shaped shield of soot-black steel with a pale riveted rim and a raised ash-grey cross rib. Accent, where the reference shows one: blue (about #50aaff).
Panel 2 (row 1, column 2): a tall shield faced with rows of overlapping dull green rounded scales, an iron rim and a short curved horn standing out of its centre boss. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 3 (row 1, column 3): an empty round iron bowl of a helmet seen from the front, with a broad flat brim all the way round and a simple leather chin strap. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): an empty steel helmet seen from the front: a smooth rounded dome that sweeps down at the back, a heavy riveted brow ridge and a narrow eye slit. Accent, where the reference shows one: green (about #67e08a).
Panel 5 (row 2, column 1): an empty steel helmet seen from the front with a deep T-shaped face opening, a high rounded crown, a short red horsehair crest and a pair of bronze cheek rivets. Accent, where the reference shows one: violet (about #c58cff).
Panel 6 (row 2, column 2): an empty heavy gold-edged steel helmet seen from the front: a tall domed crown split by one deep crack, a gold band across the brow, a narrow T-shaped slit and two short curved gold horns. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): a plain dull steel cuirass with short strap shoulders, a single riveted band across the belly and a patched leather belt. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 8 (row 2, column 4): one empty stubby gauntlet of thick brown leather with riveted iron knuckle plates, seen from the back, fingers up: a rounded mitten shape with a short cuff. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 9 (row 3, column 1): one empty heavy gauntlet of soot-dark steel seen from the back, fingers up: a rounded mitten shape of overlapping plates, a pale ember-orange seam along the knuckles and a flared cuff. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): one empty gauntlet of dark steel seen from the back, fingers up: a rounded mitten shape with three short spikes across the knuckles, a crimson cloth wrap at the wrist and a broad flared cuff. Accent, where the reference shows one: violet (about #c58cff).
Panel 11 (row 3, column 3): one empty massive gauntlet of gold-edged steel seen from the back, fingers up: a rounded mitten shape of thick plates, a large round gold boss on the back of the hand and a broad gold cuff. Accent, where the reference shows one: gold (about #ffd84a).
Panel 12 (row 3, column 4): one plain armoured boot seen from the side, toe pointing right: a single dull iron shin plate strapped over brown leather, a rounded toe and a thick sole. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: the gap-fill set, 2 of 9  (sheet-items-fill-2.png → images/items/)

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
Panel 1 (row 1, column 1): one armoured boot seen from the side, toe pointing right: two riveted iron shin bands, a small round knee guard, a heavy iron toe cap and a thick dark sole. Accent, where the reference shows one: green (about #67e08a).
Panel 2 (row 1, column 2): one heavy armoured boot seen from the side, toe pointing right: overlapping dark steel plates over the foot, a pointed toe, a crimson strap at the ankle and a broad rounded knee guard. Accent, where the reference shows one: violet (about #c58cff).
Panel 3 (row 1, column 3): one massive armoured boot seen from the side, toe pointing right: thick gold-edged steel shin plates, a large rounded knee guard shaped like a boulder and a heavy stone-grey sole. Accent, where the reference shows one: gold (about #ffd84a).
Panel 4 (row 1, column 4): a thick plain iron finger ring with a flat square top engraved with two crossed swords. Accent, where the reference shows one: green (about #67e08a).
Panel 5 (row 2, column 1): a heavy steel ring made as a short row of four blunt knuckle studs, with a dull ember-orange line along its inside. Accent, where the reference shows one: blue (about #50aaff).
Panel 6 (row 2, column 2): a round bronze medal hanging from a short red ribbon, a sword pointing down stamped on its face and a dark red stain along one edge. Accent, where the reference shows one: violet (about #c58cff).
Panel 7 (row 2, column 3): a short thick wooden cudgel with a rounded knobbed head bound by two iron bands and a leather wrist loop on its handle. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 8 (row 2, column 4): a heavy flanged mace: a round iron head with six raised ridges on a short thick wooden haft bound with leather and a flared iron pommel. Accent, where the reference shows one: green (about #67e08a).
Panel 9 (row 3, column 1): a broad single-bladed axe: a wide, thick blade of grey stone-dull steel with a notched back, on a short thick haft wrapped in rough hide. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): a heavy one-handed maul: a squat blocky steel head with a wide flat face and a thick back spike, a broad steel plate guard above the grip and a wrapped haft. Accent, where the reference shows one: violet (about #c58cff).
Panel 11 (row 3, column 3): a huge single-bladed battle axe: a wide curved blade of dark steel with a pale frost-blue edge and a heavy hammer-like back, on a long thick haft with a steel cap. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 12 (row 3, column 4): a grand war mace: a large round gold-and-steel head with eight raised flanges and a gold ring around its middle, on a thick haft wrapped in dark leather with a round gold pommel. Accent, where the reference shows one: gold (about #ffd84a).

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

## Item icons: the gap-fill set, 3 of 9  (sheet-items-fill-3.png → images/items/)

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
Panel 1 (row 1, column 1): a tall heavy tower shield of dark steel plate with a thick rolled rim, a broad band across its middle and a raised round boss glowing a faint orange. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 2 (row 1, column 2): an empty heavy grey stone-coloured steel helmet seen from the front: a rounded dome, a thick riveted brow band, a flat nose guard and deep cheek guards. Accent, where the reference shows one: violet (about #c58cff).
Panel 3 (row 1, column 3): an empty enormous gold-trimmed steel helmet seen from the front: a flat-topped barrel shape, a gold band round the middle, one long dark slit and a thick rounded neck guard. Accent, where the reference shows one: gold (about #ffd84a).
Panel 4 (row 1, column 4): one empty plain gauntlet of thick grey leather with a hard rounded cap over the knuckles, seen from the back, fingers up: a stubby mitten shape with a wide cuff. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 5 (row 2, column 1): one empty heavy gauntlet of banded steel seen from the back, fingers up: a rounded mitten shape with three riveted bands across the back of the hand and a deep flared cuff. Accent, where the reference shows one: blue (about #50aaff).
Panel 6 (row 2, column 2): one empty gauntlet of pale blue-white steel seen from the back, fingers up: a rounded mitten shape with a frosty ridge down its back and a thick fur-lined cuff. Accent, where the reference shows one: violet (about #c58cff).
Panel 7 (row 2, column 3): one empty massive gauntlet of gold-edged dark steel seen from the back, fingers up: a rounded mitten shape with a large round open eye engraved in gold on the back of the hand. Accent, where the reference shows one: gold (about #ffd84a).
Panel 8 (row 2, column 4): a small smooth round brown pebble with a warm orange glow in its middle, held in a loop of coarse cord. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 9 (row 3, column 1): a heart-shaped lump of dark riveted iron on a thick chain, with a small round steel plate bolted onto its middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): a slim crooked twig of a wand with a bundle of dried herbs tied at its handle, and a small pale blue gem set in its tip. Accent, where the reference shows one: green (about #67e08a).
Panel 11 (row 3, column 3): a tall slender staff of pale wood topped with a jagged cluster of clear ice-blue crystal held in a silver cage. Accent, where the reference shows one: violet (about #c58cff).
Panel 12 (row 3, column 4): a slim dark wand with thin violet threads wrapped along it and a hovering teardrop of deep violet crystal above the tip. Accent, where the reference shows one: orange (about #ff8a4a).

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

## Item icons: the gap-fill set, 4 of 9  (sheet-items-fill-4.png → images/items/)

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
Panel 1 (row 1, column 1): a tall black staff with a gold crescent at its top holding a dark sphere speckled with tiny pale stars, and a ring of gold runes around the shaft. Accent, where the reference shows one: gold (about #ffd84a).
Panel 2 (row 1, column 2): a thin closed book seen from the front: a worn blue cloth cover, a leather spine down its left side and a single small ink-stained star on the cover. Accent, where the reference shows one: green (about #67e08a).
Panel 3 (row 1, column 3): a smooth glass sphere on a small silver foot, with a swirl of pale blue flame inside it that turns white at its centre. Accent, where the reference shows one: violet (about #c58cff).
Panel 4 (row 1, column 4): a large clear sphere held between two gold crescent arms on a stepped gold foot, with a tiny pale clock face floating in its centre. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a plain pointed blue cloth hat with a floppy tip, a narrow brim and one small pale star stitched on the cone. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 6 (row 2, column 2): a thin silver headband seen from the front, with one small round blue stone set in its middle and a fine engraved line running along it. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): a tall pointed charcoal-grey cloth hat with a wide curled brim, a band of dull orange embroidery at its base and a scorched tip. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): a dark metal headband seen from the front, rising to a point in the middle that holds one tall violet crystal, with two thin curved prongs on each side. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 9 (row 3, column 1): a plain long blue cloth robe with wide short sleeves, a round neck and a simple rope belt. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 10 (row 3, column 2): a long charcoal-grey cloth robe with wide short sleeves, a deep V collar and orange ember-coloured thread stitched along the hem and cuffs. Accent, where the reference shows one: blue (about #50aaff).
Panel 11 (row 3, column 3): a long robe of deep violet cloth shot with fine silver threads, wide short sleeves, a deep V collar and a high stiff dark collar behind. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 12 (row 3, column 4): one empty plain cloth glove seen from the back, fingers up: a rounded hand and a separate thumb, with dark ink stains on the fingertips and a short cuff. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).

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

## Item icons: the gap-fill set, 5 of 9  (sheet-items-fill-5.png → images/items/)

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
Panel 1 (row 1, column 1): one empty soft blue cloth glove seen from the back, fingers up: a rounded hand and a separate thumb, with a silver thread spiral stitched on the back and a short cuff. Accent, where the reference shows one: green (about #67e08a).
Panel 2 (row 1, column 2): one empty pale blue-white woven glove seen from the back, fingers up: a rounded hand and a separate thumb, a fluffy white fur cuff and a tiny snowflake on the back. Accent, where the reference shows one: violet (about #c58cff).
Panel 3 (row 1, column 3): one empty dark indigo cloth glove seen from the back, fingers up: a rounded hand and a separate thumb, with a scatter of tiny silver stars across the back and a flared cuff. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 4 (row 1, column 4): one empty fine black silk glove seen from the back, fingers up: a rounded hand and a separate thumb, with a gold rune ring around each knuckle and a long gold-edged cuff. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): one soft cloth slipper seen from the side, toe pointing right: plain blue cloth, a thin flat sole and a small ribbon bow at the ankle. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 6 (row 2, column 2): one soft ankle-high cloth boot seen from the side, toe pointing right: pale blue cloth, a turned-up pointed toe, a tiny silver crescent on the side and a thin sole. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): one calf-high charcoal cloth boot seen from the side, toe pointing right: a folded cuff edged with orange thread, a single small brass buckle and a thin dark sole. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): one tall dark violet cloth boot seen from the side, toe pointing right: a close fit, a silver-trimmed folded cuff, a small glowing violet gem at the ankle and a thin dark sole. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 9 (row 3, column 1): one tall black cloth boot seen from the side, toe pointing right: gold star shapes of three sizes stitched up the outside, a gold-edged cuff and a thin dark sole. Accent, where the reference shows one: gold (about #ffd84a).
Panel 10 (row 3, column 2): a small rough pale stone with a soft blue glow in its middle, hanging from a thin cord. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 11 (row 3, column 3): a silver finger ring with a flat round top engraved with a tiny open book. Accent, where the reference shows one: green (about #67e08a).
Panel 12 (row 3, column 4): a round violet glass lens like an eye with a dark slit pupil, held in a ring of thin gold rays on a short gold chain. Accent, where the reference shows one: orange (about #ff8a4a).

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

## Item icons: the gap-fill set, 6 of 9  (sheet-items-fill-6.png → images/items/)

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
Panel 1 (row 1, column 1): a long-barrelled repeating pistol: a dark steel barrel with an orange-tinted brass tube underneath, a notched wooden grip and a ring of small brass cooling fins. Accent, where the reference shows one: blue (about #50aaff).
Panel 2 (row 1, column 2): a stubby hand mortar: a thick pale blue-grey barrel with a flared muzzle, a ring of frosty ridges, a short wooden grip and a brass pressure dial on its side. Accent, where the reference shows one: violet (about #c58cff).
Panel 3 (row 1, column 3): a small squat power cell seen from the front: a copper case with rounded corners, one terminal cap on top and a small zigzag mark on its face. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): a tall boxy capacitor seen from the front: a steel case with brass corner plates, two terminal coils on top and a bright violet arc of light behind a glass window. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 5 (row 2, column 1): a large ornate power cell seen from the front: a gold-and-steel casing with rounded corners, a big glowing violet crystal in a glass window and three gold terminal rods on top. Accent, where the reference shows one: gold (about #ffd84a).
Panel 6 (row 2, column 2): a snug dark leather cap with a long stiff brim, seen from the front, with a small round brass lens clipped to one side of the brim. Accent, where the reference shows one: violet (about #c58cff).
Panel 7 (row 2, column 3): a snug grey leather cap with a short folded brim, seen from the front, a small silver target mark on the front and two narrow ear flaps tied up on top. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 8 (row 2, column 4): a fitted brown leather harness vest with two crossed bandolier straps over the chest holding small brass cartridges, and a wide belt. Accent, where the reference shows one: green (about #67e08a).
Panel 9 (row 3, column 1): one empty fitted glove of grey leather seen from the back, fingers up: a rounded hand and a separate thumb, a grippy stitched pad on the palm edge and a narrow buckled wrist strap. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): one empty fitted glove of oiled dark leather seen from the back, fingers up: a rounded hand with brass-capped fingertips, a separate thumb and a tooled cuff with a small brass gear. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 11 (row 3, column 3): one worn ankle-high brown leather boot seen from the side, toe pointing right: a patched toe, a crooked lace and a thick scuffed sole. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 12 (row 3, column 4): one calf-high grey leather boot seen from the side, toe pointing right: a close fit, two buckled straps across the shin and a small brass spur plate at the heel. Accent, where the reference shows one: green (about #67e08a).

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

## Item icons: the gap-fill set, 7 of 9  (sheet-items-fill-7.png → images/items/)

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
Panel 1 (row 1, column 1): one sturdy calf-high leather boot seen from the side, toe pointing right: a thick sole with deep grip lines, a row of brass eyelets up the front and a small pouch at the ankle. Accent, where the reference shows one: blue (about #50aaff).
Panel 2 (row 1, column 2): one calf-high leather boot seen from the side, toe pointing right: a wide thick sole, a reinforced dark steel toe cap, a folded cuff and a violet gem stud at the ankle. Accent, where the reference shows one: violet (about #c58cff).
Panel 3 (row 1, column 3): one tall leather boot seen from the side, toe pointing right: pale grey with thin glowing violet lines running up the outside and a brass cuff. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 4 (row 1, column 4): one tall black leather boot seen from the side, toe pointing right: gold-buckled straps up the shin, a gold heel plate shaped like a bullet casing and a thick dark sole. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a single small brass cartridge case hanging on a short loop of cord, with a bright copper cap at its base. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 6 (row 2, column 2): a round glass lens in a thin brass ring with a short loop of leather cord and a tiny cross-hair line engraved in the glass. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): a short brass telescope tube with a clear glass lens at each end and a violet gem in its middle band, hanging from a loop of gold chain. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 8 (row 2, column 4): a short wooden baton with a leather-wrapped grip and a small brass bell-shaped flare at its top end. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 9 (row 3, column 1): a tall wooden pole topped with a small iron hook and a short green pennant hanging from a crossbar. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): a short silver rod with a ribbed grip and a large rounded orange gem held in a ring of eight small silver rays at its top. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 11 (row 3, column 3): a thin closed book seen from the front: a red cloth cover with a brass musical-note mark in the middle and a leather strap round its middle. Accent, where the reference shows one: green (about #67e08a).
Panel 12 (row 3, column 4): a thick closed book seen from the front: a deep green leather cover with brass corner plates and a gold sword stamped in the middle. Accent, where the reference shows one: blue (about #50aaff).

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
· In the reference no drawing is wider than about 77% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: the gap-fill set, 8 of 9  (sheet-items-fill-8.png → images/items/)

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
Panel 1 (row 1, column 1): a heavy closed book seen from the front: a dark blue leather cover edged in gold, a large round gold sun stamped in the middle and a silver clasp. Accent, where the reference shows one: violet (about #c58cff).
Panel 2 (row 1, column 2): a huge closed book seen from the front: a deep red leather cover with broad gold corner plates, a gold crown stamped in the middle and a large gold clasp set with a round gem. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a soft round red cloth cap with a narrow turned-up brim and a small brass trumpet badge pinned on the front. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): a thin silver headband seen from the front with three small round pale gems along it and a tiny silver note shape at its middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 5 (row 2, column 1): a tall gold diadem seen from the front: a band rising in a wide arch of many thin gold rays, each tipped with a small pearl, and one large round gem in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 6 (row 2, column 2): a sleeveless cloth waistcoat in dull red with a row of small round buttons down the front and a plain cloth belt. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 7 (row 2, column 3): a short cloth tunic made of patches in two bright colours, a ruffled collar, a belt with a small tin bell hanging from it. Accent, where the reference shows one: green (about #67e08a).
Panel 8 (row 2, column 4): a long fitted dark green cloth coat with brass buttons down the front, a stiff turned-up collar and a pale gold trim round the cuffs and hem. Accent, where the reference shows one: blue (about #50aaff).
Panel 9 (row 3, column 1): a long deep red cloth greatcoat with two rows of gold buttons, a wide turned-over collar, gold braid on the shoulders and a gold sash at the waist. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 10 (row 3, column 2): one empty worn brown glove with the fingertips cut open, seen from the back, fingers up: a rounded hand, a separate thumb and a small stitched patch on the back. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 11 (row 3, column 3): one empty padded red leather glove seen from the back, fingers up: a rounded hand and a separate thumb with a thick padded strip across the knuckles and a short cuff. Accent, where the reference shows one: green (about #67e08a).
Panel 12 (row 3, column 4): one empty thick cream leather glove seen from the back, fingers up: a rounded hand and a separate thumb with a wide red stripe across the cuff and a small brass clasp. Accent, where the reference shows one: violet (about #c58cff).

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

## Item icons: the gap-fill set, 9 of 9  (sheet-items-fill-9.png → images/items/)

```text
WHAT COMES BACK IS A SHEET OF 12 SEPARATE OBJECTS, NOT ONE PICTURE.
One landscape image, 1024 x 768 pixels (4:3), holding 12 separate small drawings laid out 4 across and 3 down, on the same grid as the attached reference, read left to right along the top row first.
· 12 panels. Not 1, not 8, not 16. Exactly 3 rows of 4 — do not add a row and do not drop one.
· ONE big illustration filling the canvas is the wrong answer however well it is painted, and so is a canvas of any other shape.
· Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers, in any colour, magenta included. The panels are found by measuring.
· That rule covers every SHADE of the ground too. An earlier attempt came back with a thin, lighter pink line around each panel, and it could not be used. The magenta is ONE unbroken field from one edge of the canvas to the other: where one panel ends and the next begins there is no lighter line, no darker line, no tint and no seam. Looking at the finished image, nobody should be able to tell where the panels are except by where the drawings sit.
· 3 panels are BLANK in the reference. Leave them flat magenta: do not invent anything for them.

EACH PANEL IS ONE OBJECT, NOT A SCENE.
· Paint ONLY the object the reference shows in that panel. No hand holding it, no wearer, no mannequin, no stand, no ground, no shadow, no sparkle cloud, no scenery.
· The game draws its own coloured frame around each icon. Nothing here sits on a tile, badge or ring.

WHAT EACH PANEL IS:
Panel 1 (row 1, column 1): one empty white glove seen from the back, fingers up: a rounded hand and a separate thumb, with gold thread along every finger seam and a tall flared gold-trimmed cuff. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 2 (row 1, column 2): one empty fine white glove seen from the back, fingers up: a rounded hand and a separate thumb, with a small gold crown embroidered on the back and a long gold cuff set with tiny gems. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): one simple low leather shoe seen from the side, toe pointing right: a rounded toe, a plain lace across the top and a thin worn sole. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): one soft calf-high dark green boot seen from the side, toe pointing right: a wide folded cuff trimmed with a thin gold band, a pointed toe and a thin sole. Accent, where the reference shows one: blue (about #50aaff).
Panel 5 (row 2, column 1): one tall polished red-brown riding boot seen from the side, toe pointing right: a smooth shaft, a small brass spur at the heel and a brass buckle strap at the top. Accent, where the reference shows one: violet (about #c58cff).
Panel 6 (row 2, column 2): one tall gleaming black boot seen from the side, toe pointing right: a gold band at the top, a row of small gold buttons down the outside and a thick polished sole. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 7 (row 2, column 3): one tall white boot seen from the side, toe pointing right: gold-edged fold-over cuff, a gold sun emblem on the shin and a thin pale gold sole. Accent, where the reference shows one: gold (about #ffd84a).
Panel 8 (row 2, column 4): a small silver whistle with a short curved mouthpiece and a tiny loop on top, hanging from a thin cord. Accent, where the reference shows one: green (about #67e08a).
Panel 9 (row 3, column 1): a short curved ivory horn banded in gold at the mouth and the tip, hanging from a loop of red cord. Accent, where the reference shows one: violet (about #c58cff).
Panel 10 (row 3, column 2): BLANK — flat magenta and nothing else.
Panel 11 (row 3, column 3): BLANK — flat magenta and nothing else.
Panel 12 (row 3, column 4): BLANK — flat magenta and nothing else.

COLOUR — each object keeps the colours its panel shows in the reference. Where the reference gives an object one strong accent colour, keep that accent: it tells the player how rare the object is. Take the HUE from it, not the flatness. Steel stays steel, wood stays brown, gold stays gold.

THE VIEW — flat and front-on, the way the reference shows it, at the same tilt. No three-quarter view, no perspective, no foreshortening.

ONE HAND — all 9 objects are painted by the same artist in the same sitting: the same line weight, the same two-step shading, the same light from the upper left. A sheet where one object is glossy and the next is flat is not one set.

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

## Item icons: the colosseum prizes  (sheet-items-mythic.png → images/items/)

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
Panel 1 (row 1, column 1): a gold laurel wreath seen from the front: two curving branches of pointed gold leaves meeting at the front, tied there with a small crimson ribbon. Accent, where the reference shows one: deep crimson (about #d0283c).
Panel 2 (row 1, column 2): one empty full-fingered armoured gauntlet in the reference's mitten shape, seen from the back: the fingers are one closed block of dark leather plates reaching to rounded leather tips, nothing pokes out of it (NOT fingerless, no open fingertips, no hand and no skin anywhere): crossed crimson straps over the back, a row of three gold knuckle studs, a separate covered thumb plate and a wide gold-banded cuff. Accent, where the reference shows one: deep crimson (about #d0283c).
Panel 3 (row 1, column 3): one armoured boot seen from the side, toe pointing right: sand-coloured bronze shin plates laced over leather, a rounded knee guard, crimson straps at the ankle and a thick dark sole. Accent, where the reference shows one: deep crimson (about #d0283c).
Panel 4 (row 1, column 4): a large round shield lacquered deep crimson, with a broad gold rim, a raised gold boss in the middle and a ring of round gold rivets. Accent, where the reference shows one: deep crimson (about #d0283c).
Panel 5 (row 2, column 1): a heavy gold-trimmed steel breastplate with large rounded shoulder plates and a short crimson cape hanging behind both shoulders. Accent, where the reference shows one: deep crimson (about #d0283c).
Panel 6 (row 2, column 2): a large faceted crimson gemstone cut in a rounded heart outline, held in a ring of gold set with four small claws. Accent, where the reference shows one: deep crimson (about #d0283c).
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

## Item icons: smithed iron  (sheet-items-smith-iron.png → images/items/)

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
Panel 1 (row 1, column 1): a straight one-handed sword: a plain double-edged blade of dull grey hammered iron with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): a straight one-handed sword: a plain double-edged blade of dull grey hammered iron with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 3 (row 1, column 3): a one-handed war hammer: a blocky dull grey hammered iron head with a flat striking face, on a straight wooden haft bound with leather. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): a one-handed war hammer: a blocky dull grey hammered iron head with a flat striking face, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 5 (row 2, column 1): a kite-shaped shield of riveted dull grey hammered iron plate with a raised centre rib and a rolled rim. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 6 (row 2, column 2): a kite-shaped shield of riveted dull grey hammered iron plate with a raised centre rib and a rolled rim, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): an empty dull grey hammered iron helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 8 (row 2, column 4): an empty dull grey hammered iron helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 9 (row 3, column 1): a dull grey hammered iron breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 10 (row 3, column 2): a dull grey hammered iron breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 11 (row 3, column 3): one armoured dull grey hammered iron boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 12 (row 3, column 4): one armoured dull grey hammered iron boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: smithed silver  (sheet-items-smith-silver.png → images/items/)

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
Panel 1 (row 1, column 1): a straight one-handed sword: a plain double-edged blade of bright pale silver with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel. Accent, where the reference shows one: green (about #67e08a).
Panel 2 (row 1, column 2): a straight one-handed sword: a plain double-edged blade of bright pale silver with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 3 (row 1, column 3): a one-handed war hammer: a blocky bright pale silver head with a flat striking face, on a straight wooden haft bound with leather. Accent, where the reference shows one: green (about #67e08a).
Panel 4 (row 1, column 4): a one-handed war hammer: a blocky bright pale silver head with a flat striking face, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 5 (row 2, column 1): a kite-shaped shield of riveted bright pale silver plate with a raised centre rib and a rolled rim. Accent, where the reference shows one: green (about #67e08a).
Panel 6 (row 2, column 2): a kite-shaped shield of riveted bright pale silver plate with a raised centre rib and a rolled rim, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 7 (row 2, column 3): an empty bright pale silver helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards. Accent, where the reference shows one: green (about #67e08a).
Panel 8 (row 2, column 4): an empty bright pale silver helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 9 (row 3, column 1): a bright pale silver breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest. Accent, where the reference shows one: green (about #67e08a).
Panel 10 (row 3, column 2): a bright pale silver breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 11 (row 3, column 3): one armoured bright pale silver boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole. Accent, where the reference shows one: green (about #67e08a).
Panel 12 (row 3, column 4): one armoured bright pale silver boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: smithed gold  (sheet-items-smith-gold.png → images/items/)

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
Panel 1 (row 1, column 1): a straight one-handed sword: a plain double-edged blade of polished warm gold with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel. Accent, where the reference shows one: blue (about #50aaff).
Panel 2 (row 1, column 2): a straight one-handed sword: a plain double-edged blade of polished warm gold with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 3 (row 1, column 3): a one-handed war hammer: a blocky polished warm gold head with a flat striking face, on a straight wooden haft bound with leather. Accent, where the reference shows one: blue (about #50aaff).
Panel 4 (row 1, column 4): a one-handed war hammer: a blocky polished warm gold head with a flat striking face, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 5 (row 2, column 1): a kite-shaped shield of riveted polished warm gold plate with a raised centre rib and a rolled rim. Accent, where the reference shows one: blue (about #50aaff).
Panel 6 (row 2, column 2): a kite-shaped shield of riveted polished warm gold plate with a raised centre rib and a rolled rim, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 7 (row 2, column 3): an empty polished warm gold helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): an empty polished warm gold helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 9 (row 3, column 1): a polished warm gold breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): a polished warm gold breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 11 (row 3, column 3): one armoured polished warm gold boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole. Accent, where the reference shows one: blue (about #50aaff).
Panel 12 (row 3, column 4): one armoured polished warm gold boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: smithed mithril  (sheet-items-smith-mithril.png → images/items/)

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
Panel 1 (row 1, column 1): a straight one-handed sword: a plain double-edged blade of pale blue-white gleaming mithril with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel. Accent, where the reference shows one: violet (about #c58cff).
Panel 2 (row 1, column 2): a straight one-handed sword: a plain double-edged blade of pale blue-white gleaming mithril with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 3 (row 1, column 3): a one-handed war hammer: a blocky pale blue-white gleaming mithril head with a flat striking face, on a straight wooden haft bound with leather. Accent, where the reference shows one: violet (about #c58cff).
Panel 4 (row 1, column 4): a one-handed war hammer: a blocky pale blue-white gleaming mithril head with a flat striking face, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 5 (row 2, column 1): a kite-shaped shield of riveted pale blue-white gleaming mithril plate with a raised centre rib and a rolled rim. Accent, where the reference shows one: violet (about #c58cff).
Panel 6 (row 2, column 2): a kite-shaped shield of riveted pale blue-white gleaming mithril plate with a raised centre rib and a rolled rim, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 7 (row 2, column 3): an empty pale blue-white gleaming mithril helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards. Accent, where the reference shows one: violet (about #c58cff).
Panel 8 (row 2, column 4): an empty pale blue-white gleaming mithril helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 9 (row 3, column 1): a pale blue-white gleaming mithril breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest. Accent, where the reference shows one: violet (about #c58cff).
Panel 10 (row 3, column 2): a pale blue-white gleaming mithril breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 11 (row 3, column 3): one armoured pale blue-white gleaming mithril boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole. Accent, where the reference shows one: violet (about #c58cff).
Panel 12 (row 3, column 4): one armoured pale blue-white gleaming mithril boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: smithed adamant  (sheet-items-smith-adamant.png → images/items/)

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
Panel 1 (row 1, column 1): a straight one-handed sword: a plain double-edged blade of dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 2 (row 1, column 2): a straight one-handed sword: a plain double-edged blade of dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a one-handed war hammer: a blocky dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems head with a flat striking face, on a straight wooden haft bound with leather. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 4 (row 1, column 4): a one-handed war hammer: a blocky dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems head with a flat striking face, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a kite-shaped shield of riveted dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems plate with a raised centre rib and a rolled rim. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 6 (row 2, column 2): a kite-shaped shield of riveted dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems plate with a raised centre rib and a rolled rim, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): an empty dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 8 (row 2, column 4): an empty dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 10 (row 3, column 2): a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one armoured dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 12 (row 3, column 4): one armoured dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: smithed aetherite  (sheet-items-smith-aetherite.png → images/items/)

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
Panel 1 (row 1, column 1): a straight one-handed sword: a plain double-edged blade of glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel. Accent, where the reference shows one: gold (about #ffd84a).
Panel 2 (row 1, column 2): a straight one-handed sword: a plain double-edged blade of glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges with a central ridge, a bar crossguard, a leather-wrapped grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a one-handed war hammer: a blocky glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges head with a flat striking face, on a straight wooden haft bound with leather. Accent, where the reference shows one: gold (about #ffd84a).
Panel 4 (row 1, column 4): a one-handed war hammer: a blocky glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges head with a flat striking face, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a kite-shaped shield of riveted glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges plate with a raised centre rib and a rolled rim. Accent, where the reference shows one: gold (about #ffd84a).
Panel 6 (row 2, column 2): a kite-shaped shield of riveted glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges plate with a raised centre rib and a rolled rim, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): an empty glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards. Accent, where the reference shows one: gold (about #ffd84a).
Panel 8 (row 2, column 4): an empty glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges helmet seen from the front: a round dome with a centre ridge, a riveted brow band and two cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest. Accent, where the reference shows one: gold (about #ffd84a).
Panel 10 (row 3, column 2): a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges breastplate with short rounded shoulder plates, two riveted bands across the belly and a plain round boss on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one armoured glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole. Accent, where the reference shows one: gold (about #ffd84a).
Panel 12 (row 3, column 4): one armoured glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges boot seen from the side, toe pointing right: banded shin plates, a rounded knee guard, a rounded toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: smithed iron, dex build  (sheet-items-smith-dex-iron.png → images/items/)

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
Panel 1 (row 1, column 1): a slim dull grey hammered iron dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): a slim dull grey hammered iron dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 3 (row 1, column 3): a light dull grey hammered iron rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): a light dull grey hammered iron rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 5 (row 2, column 1): a small round dull grey hammered iron buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 6 (row 2, column 2): a small round dull grey hammered iron buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): an empty leather hood with a pointed dull grey hammered iron-studded brow band, seen from the front, with a narrow face opening. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 8 (row 2, column 4): an empty leather hood with a pointed dull grey hammered iron-studded brow band, seen from the front, with a narrow face opening, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 9 (row 3, column 1): a fitted leather jerkin seen from the front, with overlapping dull grey hammered iron scale plates on the chest and shoulders, laced at the sides. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 10 (row 3, column 2): a fitted leather jerkin seen from the front, with overlapping dull grey hammered iron scale plates on the chest and shoulders, laced at the sides, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 11 (row 3, column 3): one light leather boot seen from the side, toe pointing right: a dull grey hammered iron shin band, a buckled strap at the ankle and a thin dark sole. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 12 (row 3, column 4): one light leather boot seen from the side, toe pointing right: a dull grey hammered iron shin band, a buckled strap at the ankle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).

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

## Item icons: smithed silver, dex build  (sheet-items-smith-dex-silver.png → images/items/)

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
Panel 1 (row 1, column 1): a slim bright pale silver dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel. Accent, where the reference shows one: green (about #67e08a).
Panel 2 (row 1, column 2): a slim bright pale silver dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 3 (row 1, column 3): a light bright pale silver rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel. Accent, where the reference shows one: green (about #67e08a).
Panel 4 (row 1, column 4): a light bright pale silver rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 5 (row 2, column 1): a small round bright pale silver buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing. Accent, where the reference shows one: green (about #67e08a).
Panel 6 (row 2, column 2): a small round bright pale silver buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 7 (row 2, column 3): an empty leather hood with a pointed bright pale silver-studded brow band, seen from the front, with a narrow face opening. Accent, where the reference shows one: green (about #67e08a).
Panel 8 (row 2, column 4): an empty leather hood with a pointed bright pale silver-studded brow band, seen from the front, with a narrow face opening, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 9 (row 3, column 1): a fitted leather jerkin seen from the front, with overlapping bright pale silver scale plates on the chest and shoulders, laced at the sides. Accent, where the reference shows one: green (about #67e08a).
Panel 10 (row 3, column 2): a fitted leather jerkin seen from the front, with overlapping bright pale silver scale plates on the chest and shoulders, laced at the sides, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 11 (row 3, column 3): one light leather boot seen from the side, toe pointing right: a bright pale silver shin band, a buckled strap at the ankle and a thin dark sole. Accent, where the reference shows one: green (about #67e08a).
Panel 12 (row 3, column 4): one light leather boot seen from the side, toe pointing right: a bright pale silver shin band, a buckled strap at the ankle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).

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

## Item icons: smithed gold, dex build  (sheet-items-smith-dex-gold.png → images/items/)

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
Panel 1 (row 1, column 1): a slim polished warm gold dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel. Accent, where the reference shows one: blue (about #50aaff).
Panel 2 (row 1, column 2): a slim polished warm gold dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 3 (row 1, column 3): a light polished warm gold rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel. Accent, where the reference shows one: blue (about #50aaff).
Panel 4 (row 1, column 4): a light polished warm gold rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 5 (row 2, column 1): a small round polished warm gold buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing. Accent, where the reference shows one: blue (about #50aaff).
Panel 6 (row 2, column 2): a small round polished warm gold buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 7 (row 2, column 3): an empty leather hood with a pointed polished warm gold-studded brow band, seen from the front, with a narrow face opening. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): an empty leather hood with a pointed polished warm gold-studded brow band, seen from the front, with a narrow face opening, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 9 (row 3, column 1): a fitted leather jerkin seen from the front, with overlapping polished warm gold scale plates on the chest and shoulders, laced at the sides. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): a fitted leather jerkin seen from the front, with overlapping polished warm gold scale plates on the chest and shoulders, laced at the sides, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 11 (row 3, column 3): one light leather boot seen from the side, toe pointing right: a polished warm gold shin band, a buckled strap at the ankle and a thin dark sole. Accent, where the reference shows one: blue (about #50aaff).
Panel 12 (row 3, column 4): one light leather boot seen from the side, toe pointing right: a polished warm gold shin band, a buckled strap at the ankle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).

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

## Item icons: smithed mithril, dex build  (sheet-items-smith-dex-mithril.png → images/items/)

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
Panel 1 (row 1, column 1): a slim pale blue-white gleaming mithril dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel. Accent, where the reference shows one: violet (about #c58cff).
Panel 2 (row 1, column 2): a slim pale blue-white gleaming mithril dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 3 (row 1, column 3): a light pale blue-white gleaming mithril rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel. Accent, where the reference shows one: violet (about #c58cff).
Panel 4 (row 1, column 4): a light pale blue-white gleaming mithril rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 5 (row 2, column 1): a small round pale blue-white gleaming mithril buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing. Accent, where the reference shows one: violet (about #c58cff).
Panel 6 (row 2, column 2): a small round pale blue-white gleaming mithril buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 7 (row 2, column 3): an empty leather hood with a pointed pale blue-white gleaming mithril-studded brow band, seen from the front, with a narrow face opening. Accent, where the reference shows one: violet (about #c58cff).
Panel 8 (row 2, column 4): an empty leather hood with a pointed pale blue-white gleaming mithril-studded brow band, seen from the front, with a narrow face opening, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 9 (row 3, column 1): a fitted leather jerkin seen from the front, with overlapping pale blue-white gleaming mithril scale plates on the chest and shoulders, laced at the sides. Accent, where the reference shows one: violet (about #c58cff).
Panel 10 (row 3, column 2): a fitted leather jerkin seen from the front, with overlapping pale blue-white gleaming mithril scale plates on the chest and shoulders, laced at the sides, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 11 (row 3, column 3): one light leather boot seen from the side, toe pointing right: a pale blue-white gleaming mithril shin band, a buckled strap at the ankle and a thin dark sole. Accent, where the reference shows one: violet (about #c58cff).
Panel 12 (row 3, column 4): one light leather boot seen from the side, toe pointing right: a pale blue-white gleaming mithril shin band, a buckled strap at the ankle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).

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

## Item icons: smithed adamant, dex build  (sheet-items-smith-dex-adamant.png → images/items/)

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
Panel 1 (row 1, column 1): a slim dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 2 (row 1, column 2): a slim dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a light dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 4 (row 1, column 4): a light dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a small round dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 6 (row 2, column 2): a small round dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): an empty leather hood with a pointed dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems-studded brow band, seen from the front, with a narrow face opening. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 8 (row 2, column 4): an empty leather hood with a pointed dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems-studded brow band, seen from the front, with a narrow face opening, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a fitted leather jerkin seen from the front, with overlapping dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems scale plates on the chest and shoulders, laced at the sides. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 10 (row 3, column 2): a fitted leather jerkin seen from the front, with overlapping dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems scale plates on the chest and shoulders, laced at the sides, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one light leather boot seen from the side, toe pointing right: a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems shin band, a buckled strap at the ankle and a thin dark sole. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 12 (row 3, column 4): one light leather boot seen from the side, toe pointing right: a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems shin band, a buckled strap at the ankle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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

## Item icons: smithed aetherite, dex build  (sheet-items-smith-dex-aetherite.png → images/items/)

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
Panel 1 (row 1, column 1): a slim glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel. Accent, where the reference shows one: gold (about #ffd84a).
Panel 2 (row 1, column 2): a slim glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges dagger: a short narrow double-edged blade, a small curved guard, a thin leather-wrapped grip and a ring pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a light glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel. Accent, where the reference shows one: gold (about #ffd84a).
Panel 4 (row 1, column 4): a light glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges rapier: a long thin blade with a swept hilt of curved bars around the hand, a thin grip and a round pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a small round glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing. Accent, where the reference shows one: gold (about #ffd84a).
Panel 6 (row 2, column 2): a small round glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges buckler with a raised centre boss and a thin rolled rim, light and handy, a leather grip strap showing, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): an empty leather hood with a pointed glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges-studded brow band, seen from the front, with a narrow face opening. Accent, where the reference shows one: gold (about #ffd84a).
Panel 8 (row 2, column 4): an empty leather hood with a pointed glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges-studded brow band, seen from the front, with a narrow face opening, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a fitted leather jerkin seen from the front, with overlapping glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges scale plates on the chest and shoulders, laced at the sides. Accent, where the reference shows one: gold (about #ffd84a).
Panel 10 (row 3, column 2): a fitted leather jerkin seen from the front, with overlapping glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges scale plates on the chest and shoulders, laced at the sides, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one light leather boot seen from the side, toe pointing right: a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges shin band, a buckled strap at the ankle and a thin dark sole. Accent, where the reference shows one: gold (about #ffd84a).
Panel 12 (row 3, column 4): one light leather boot seen from the side, toe pointing right: a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges shin band, a buckled strap at the ankle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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

## Item icons: smithed iron, int build  (sheet-items-smith-int-iron.png → images/items/)

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
Panel 1 (row 1, column 1): a short magic wand: a slim dark rod with a dull grey hammered iron cap at each end and a small round blue gem floating above the tip. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): a short magic wand: a slim dark rod with a dull grey hammered iron cap at each end and a small round blue gem floating above the tip, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 3 (row 1, column 3): a tall mage's staff: a straight dark wooden shaft bound with dull grey hammered iron rings, a dull grey hammered iron crown of three curved prongs holding a round blue gem. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): a tall mage's staff: a straight dark wooden shaft bound with dull grey hammered iron rings, a dull grey hammered iron crown of three curved prongs holding a round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 5 (row 2, column 1): a closed spellbook bound in dark blue leather with dull grey hammered iron corner plates and a dull grey hammered iron clasp, a round blue gem set in the cover. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 6 (row 2, column 2): a closed spellbook bound in dark blue leather with dull grey hammered iron corner plates and a dull grey hammered iron clasp, a round blue gem set in the cover, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): a dull grey hammered iron circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 8 (row 2, column 4): a dull grey hammered iron circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 9 (row 3, column 1): a flowing scholar's robe seen from the front, dark blue cloth with a dull grey hammered iron thread hem, a dull grey hammered iron clasp at the collar and wide sleeves. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 10 (row 3, column 2): a flowing scholar's robe seen from the front, dark blue cloth with a dull grey hammered iron thread hem, a dull grey hammered iron clasp at the collar and wide sleeves, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 11 (row 3, column 3): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a dull grey hammered iron cuff, a dull grey hammered iron buckle and a thin dark sole. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 12 (row 3, column 4): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a dull grey hammered iron cuff, a dull grey hammered iron buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).

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

## Item icons: smithed silver, int build  (sheet-items-smith-int-silver.png → images/items/)

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
Panel 1 (row 1, column 1): a short magic wand: a slim dark rod with a bright pale silver cap at each end and a small round blue gem floating above the tip. Accent, where the reference shows one: green (about #67e08a).
Panel 2 (row 1, column 2): a short magic wand: a slim dark rod with a bright pale silver cap at each end and a small round blue gem floating above the tip, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 3 (row 1, column 3): a tall mage's staff: a straight dark wooden shaft bound with bright pale silver rings, a bright pale silver crown of three curved prongs holding a round blue gem. Accent, where the reference shows one: green (about #67e08a).
Panel 4 (row 1, column 4): a tall mage's staff: a straight dark wooden shaft bound with bright pale silver rings, a bright pale silver crown of three curved prongs holding a round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 5 (row 2, column 1): a closed spellbook bound in dark blue leather with bright pale silver corner plates and a bright pale silver clasp, a round blue gem set in the cover. Accent, where the reference shows one: green (about #67e08a).
Panel 6 (row 2, column 2): a closed spellbook bound in dark blue leather with bright pale silver corner plates and a bright pale silver clasp, a round blue gem set in the cover, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 7 (row 2, column 3): a bright pale silver circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem. Accent, where the reference shows one: green (about #67e08a).
Panel 8 (row 2, column 4): a bright pale silver circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 9 (row 3, column 1): a flowing scholar's robe seen from the front, dark blue cloth with a bright pale silver thread hem, a bright pale silver clasp at the collar and wide sleeves. Accent, where the reference shows one: green (about #67e08a).
Panel 10 (row 3, column 2): a flowing scholar's robe seen from the front, dark blue cloth with a bright pale silver thread hem, a bright pale silver clasp at the collar and wide sleeves, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 11 (row 3, column 3): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a bright pale silver cuff, a bright pale silver buckle and a thin dark sole. Accent, where the reference shows one: green (about #67e08a).
Panel 12 (row 3, column 4): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a bright pale silver cuff, a bright pale silver buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).

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

## Item icons: smithed gold, int build  (sheet-items-smith-int-gold.png → images/items/)

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
Panel 1 (row 1, column 1): a short magic wand: a slim dark rod with a polished warm gold cap at each end and a small round blue gem floating above the tip. Accent, where the reference shows one: blue (about #50aaff).
Panel 2 (row 1, column 2): a short magic wand: a slim dark rod with a polished warm gold cap at each end and a small round blue gem floating above the tip, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 3 (row 1, column 3): a tall mage's staff: a straight dark wooden shaft bound with polished warm gold rings, a polished warm gold crown of three curved prongs holding a round blue gem. Accent, where the reference shows one: blue (about #50aaff).
Panel 4 (row 1, column 4): a tall mage's staff: a straight dark wooden shaft bound with polished warm gold rings, a polished warm gold crown of three curved prongs holding a round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 5 (row 2, column 1): a closed spellbook bound in dark blue leather with polished warm gold corner plates and a polished warm gold clasp, a round blue gem set in the cover. Accent, where the reference shows one: blue (about #50aaff).
Panel 6 (row 2, column 2): a closed spellbook bound in dark blue leather with polished warm gold corner plates and a polished warm gold clasp, a round blue gem set in the cover, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 7 (row 2, column 3): a polished warm gold circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): a polished warm gold circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 9 (row 3, column 1): a flowing scholar's robe seen from the front, dark blue cloth with a polished warm gold thread hem, a polished warm gold clasp at the collar and wide sleeves. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): a flowing scholar's robe seen from the front, dark blue cloth with a polished warm gold thread hem, a polished warm gold clasp at the collar and wide sleeves, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 11 (row 3, column 3): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a polished warm gold cuff, a polished warm gold buckle and a thin dark sole. Accent, where the reference shows one: blue (about #50aaff).
Panel 12 (row 3, column 4): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a polished warm gold cuff, a polished warm gold buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).

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

## Item icons: smithed mithril, int build  (sheet-items-smith-int-mithril.png → images/items/)

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
Panel 1 (row 1, column 1): a short magic wand: a slim dark rod with a pale blue-white gleaming mithril cap at each end and a small round blue gem floating above the tip. Accent, where the reference shows one: violet (about #c58cff).
Panel 2 (row 1, column 2): a short magic wand: a slim dark rod with a pale blue-white gleaming mithril cap at each end and a small round blue gem floating above the tip, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 3 (row 1, column 3): a tall mage's staff: a straight dark wooden shaft bound with pale blue-white gleaming mithril rings, a pale blue-white gleaming mithril crown of three curved prongs holding a round blue gem. Accent, where the reference shows one: violet (about #c58cff).
Panel 4 (row 1, column 4): a tall mage's staff: a straight dark wooden shaft bound with pale blue-white gleaming mithril rings, a pale blue-white gleaming mithril crown of three curved prongs holding a round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 5 (row 2, column 1): a closed spellbook bound in dark blue leather with pale blue-white gleaming mithril corner plates and a pale blue-white gleaming mithril clasp, a round blue gem set in the cover. Accent, where the reference shows one: violet (about #c58cff).
Panel 6 (row 2, column 2): a closed spellbook bound in dark blue leather with pale blue-white gleaming mithril corner plates and a pale blue-white gleaming mithril clasp, a round blue gem set in the cover, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 7 (row 2, column 3): a pale blue-white gleaming mithril circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem. Accent, where the reference shows one: violet (about #c58cff).
Panel 8 (row 2, column 4): a pale blue-white gleaming mithril circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 9 (row 3, column 1): a flowing scholar's robe seen from the front, dark blue cloth with a pale blue-white gleaming mithril thread hem, a pale blue-white gleaming mithril clasp at the collar and wide sleeves. Accent, where the reference shows one: violet (about #c58cff).
Panel 10 (row 3, column 2): a flowing scholar's robe seen from the front, dark blue cloth with a pale blue-white gleaming mithril thread hem, a pale blue-white gleaming mithril clasp at the collar and wide sleeves, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 11 (row 3, column 3): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a pale blue-white gleaming mithril cuff, a pale blue-white gleaming mithril buckle and a thin dark sole. Accent, where the reference shows one: violet (about #c58cff).
Panel 12 (row 3, column 4): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a pale blue-white gleaming mithril cuff, a pale blue-white gleaming mithril buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).

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

## Item icons: smithed adamant, int build  (sheet-items-smith-int-adamant.png → images/items/)

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
Panel 1 (row 1, column 1): a short magic wand: a slim dark rod with a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems cap at each end and a small round blue gem floating above the tip. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 2 (row 1, column 2): a short magic wand: a slim dark rod with a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems cap at each end and a small round blue gem floating above the tip, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a tall mage's staff: a straight dark wooden shaft bound with dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems rings, a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems crown of three curved prongs holding a round blue gem. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 4 (row 1, column 4): a tall mage's staff: a straight dark wooden shaft bound with dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems rings, a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems crown of three curved prongs holding a round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a closed spellbook bound in dark blue leather with dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems corner plates and a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems clasp, a round blue gem set in the cover. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 6 (row 2, column 2): a closed spellbook bound in dark blue leather with dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems corner plates and a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems clasp, a round blue gem set in the cover, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 8 (row 2, column 4): a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a flowing scholar's robe seen from the front, dark blue cloth with a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems thread hem, a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems clasp at the collar and wide sleeves. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 10 (row 3, column 2): a flowing scholar's robe seen from the front, dark blue cloth with a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems thread hem, a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems clasp at the collar and wide sleeves, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems cuff, a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems buckle and a thin dark sole. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 12 (row 3, column 4): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems cuff, a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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

## Item icons: smithed aetherite, int build  (sheet-items-smith-int-aetherite.png → images/items/)

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
Panel 1 (row 1, column 1): a short magic wand: a slim dark rod with a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges cap at each end and a small round blue gem floating above the tip. Accent, where the reference shows one: gold (about #ffd84a).
Panel 2 (row 1, column 2): a short magic wand: a slim dark rod with a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges cap at each end and a small round blue gem floating above the tip, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a tall mage's staff: a straight dark wooden shaft bound with glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges rings, a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges crown of three curved prongs holding a round blue gem. Accent, where the reference shows one: gold (about #ffd84a).
Panel 4 (row 1, column 4): a tall mage's staff: a straight dark wooden shaft bound with glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges rings, a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges crown of three curved prongs holding a round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a closed spellbook bound in dark blue leather with glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges corner plates and a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges clasp, a round blue gem set in the cover. Accent, where the reference shows one: gold (about #ffd84a).
Panel 6 (row 2, column 2): a closed spellbook bound in dark blue leather with glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges corner plates and a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges clasp, a round blue gem set in the cover, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem. Accent, where the reference shows one: gold (about #ffd84a).
Panel 8 (row 2, column 4): a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges circlet seen from the front: a thin band with a pointed centre peak holding one round blue gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a flowing scholar's robe seen from the front, dark blue cloth with a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges thread hem, a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges clasp at the collar and wide sleeves. Accent, where the reference shows one: gold (about #ffd84a).
Panel 10 (row 3, column 2): a flowing scholar's robe seen from the front, dark blue cloth with a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges thread hem, a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges clasp at the collar and wide sleeves, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges cuff, a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges buckle and a thin dark sole. Accent, where the reference shows one: gold (about #ffd84a).
Panel 12 (row 3, column 4): one soft cloth boot seen from the side, toe pointing right: dark blue cloth with a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges cuff, a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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

## Item icons: smithed iron, skl build  (sheet-items-smith-skl-iron.png → images/items/)

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
Panel 1 (row 1, column 1): a compact one-handed pistol seen from the side, muzzle pointing right: a short dull grey hammered iron barrel, a dark wooden grip and a small round sight on top. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): a compact one-handed pistol seen from the side, muzzle pointing right: a short dull grey hammered iron barrel, a dark wooden grip and a small round sight on top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 3 (row 1, column 3): a long-barrelled rifle seen from the side, muzzle pointing right: a dull grey hammered iron barrel with a ribbed jacket, a dark wooden stock and a small round scope. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): a long-barrelled rifle seen from the side, muzzle pointing right: a dull grey hammered iron barrel with a ribbed jacket, a dark wooden stock and a small round scope, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 5 (row 2, column 1): a boxy aether battery: a squat dark case with dull grey hammered iron corner plates, two dull grey hammered iron terminals on top and a glowing violet gem window in the front. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 6 (row 2, column 2): a boxy aether battery: a squat dark case with dull grey hammered iron corner plates, two dull grey hammered iron terminals on top and a glowing violet gem window in the front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): a close-fitting leather cap with a short dull grey hammered iron-trimmed brim, seen from the front, and a small round violet gem at the brow. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 8 (row 2, column 4): a close-fitting leather cap with a short dull grey hammered iron-trimmed brim, seen from the front, and a small round violet gem at the brow, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 9 (row 3, column 1): a fitted leather harness seen from the front, with crossed straps, dull grey hammered iron buckles, a row of small pouches and a violet gem at the chest. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 10 (row 3, column 2): a fitted leather harness seen from the front, with crossed straps, dull grey hammered iron buckles, a row of small pouches and a violet gem at the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 11 (row 3, column 3): one practical leather boot seen from the side, toe pointing right: dull grey hammered iron shin strap buckles, a small pouch at the ankle and a thick dark sole. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 12 (row 3, column 4): one practical leather boot seen from the side, toe pointing right: dull grey hammered iron shin strap buckles, a small pouch at the ankle and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).

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

## Item icons: smithed silver, skl build  (sheet-items-smith-skl-silver.png → images/items/)

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
Panel 1 (row 1, column 1): a compact one-handed pistol seen from the side, muzzle pointing right: a short bright pale silver barrel, a dark wooden grip and a small round sight on top. Accent, where the reference shows one: green (about #67e08a).
Panel 2 (row 1, column 2): a compact one-handed pistol seen from the side, muzzle pointing right: a short bright pale silver barrel, a dark wooden grip and a small round sight on top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 3 (row 1, column 3): a long-barrelled rifle seen from the side, muzzle pointing right: a bright pale silver barrel with a ribbed jacket, a dark wooden stock and a small round scope. Accent, where the reference shows one: green (about #67e08a).
Panel 4 (row 1, column 4): a long-barrelled rifle seen from the side, muzzle pointing right: a bright pale silver barrel with a ribbed jacket, a dark wooden stock and a small round scope, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 5 (row 2, column 1): a boxy aether battery: a squat dark case with bright pale silver corner plates, two bright pale silver terminals on top and a glowing violet gem window in the front. Accent, where the reference shows one: green (about #67e08a).
Panel 6 (row 2, column 2): a boxy aether battery: a squat dark case with bright pale silver corner plates, two bright pale silver terminals on top and a glowing violet gem window in the front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 7 (row 2, column 3): a close-fitting leather cap with a short bright pale silver-trimmed brim, seen from the front, and a small round violet gem at the brow. Accent, where the reference shows one: green (about #67e08a).
Panel 8 (row 2, column 4): a close-fitting leather cap with a short bright pale silver-trimmed brim, seen from the front, and a small round violet gem at the brow, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 9 (row 3, column 1): a fitted leather harness seen from the front, with crossed straps, bright pale silver buckles, a row of small pouches and a violet gem at the chest. Accent, where the reference shows one: green (about #67e08a).
Panel 10 (row 3, column 2): a fitted leather harness seen from the front, with crossed straps, bright pale silver buckles, a row of small pouches and a violet gem at the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 11 (row 3, column 3): one practical leather boot seen from the side, toe pointing right: bright pale silver shin strap buckles, a small pouch at the ankle and a thick dark sole. Accent, where the reference shows one: green (about #67e08a).
Panel 12 (row 3, column 4): one practical leather boot seen from the side, toe pointing right: bright pale silver shin strap buckles, a small pouch at the ankle and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).

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

## Item icons: smithed gold, skl build  (sheet-items-smith-skl-gold.png → images/items/)

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
Panel 1 (row 1, column 1): a compact one-handed pistol seen from the side, muzzle pointing right: a short polished warm gold barrel, a dark wooden grip and a small round sight on top. Accent, where the reference shows one: blue (about #50aaff).
Panel 2 (row 1, column 2): a compact one-handed pistol seen from the side, muzzle pointing right: a short polished warm gold barrel, a dark wooden grip and a small round sight on top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 3 (row 1, column 3): a long-barrelled rifle seen from the side, muzzle pointing right: a polished warm gold barrel with a ribbed jacket, a dark wooden stock and a small round scope. Accent, where the reference shows one: blue (about #50aaff).
Panel 4 (row 1, column 4): a long-barrelled rifle seen from the side, muzzle pointing right: a polished warm gold barrel with a ribbed jacket, a dark wooden stock and a small round scope, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 5 (row 2, column 1): a boxy aether battery: a squat dark case with polished warm gold corner plates, two polished warm gold terminals on top and a glowing violet gem window in the front. Accent, where the reference shows one: blue (about #50aaff).
Panel 6 (row 2, column 2): a boxy aether battery: a squat dark case with polished warm gold corner plates, two polished warm gold terminals on top and a glowing violet gem window in the front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 7 (row 2, column 3): a close-fitting leather cap with a short polished warm gold-trimmed brim, seen from the front, and a small round violet gem at the brow. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): a close-fitting leather cap with a short polished warm gold-trimmed brim, seen from the front, and a small round violet gem at the brow, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 9 (row 3, column 1): a fitted leather harness seen from the front, with crossed straps, polished warm gold buckles, a row of small pouches and a violet gem at the chest. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): a fitted leather harness seen from the front, with crossed straps, polished warm gold buckles, a row of small pouches and a violet gem at the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 11 (row 3, column 3): one practical leather boot seen from the side, toe pointing right: polished warm gold shin strap buckles, a small pouch at the ankle and a thick dark sole. Accent, where the reference shows one: blue (about #50aaff).
Panel 12 (row 3, column 4): one practical leather boot seen from the side, toe pointing right: polished warm gold shin strap buckles, a small pouch at the ankle and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).

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

## Item icons: smithed mithril, skl build  (sheet-items-smith-skl-mithril.png → images/items/)

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
Panel 1 (row 1, column 1): a compact one-handed pistol seen from the side, muzzle pointing right: a short pale blue-white gleaming mithril barrel, a dark wooden grip and a small round sight on top. Accent, where the reference shows one: violet (about #c58cff).
Panel 2 (row 1, column 2): a compact one-handed pistol seen from the side, muzzle pointing right: a short pale blue-white gleaming mithril barrel, a dark wooden grip and a small round sight on top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 3 (row 1, column 3): a long-barrelled rifle seen from the side, muzzle pointing right: a pale blue-white gleaming mithril barrel with a ribbed jacket, a dark wooden stock and a small round scope. Accent, where the reference shows one: violet (about #c58cff).
Panel 4 (row 1, column 4): a long-barrelled rifle seen from the side, muzzle pointing right: a pale blue-white gleaming mithril barrel with a ribbed jacket, a dark wooden stock and a small round scope, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 5 (row 2, column 1): a boxy aether battery: a squat dark case with pale blue-white gleaming mithril corner plates, two pale blue-white gleaming mithril terminals on top and a glowing violet gem window in the front. Accent, where the reference shows one: violet (about #c58cff).
Panel 6 (row 2, column 2): a boxy aether battery: a squat dark case with pale blue-white gleaming mithril corner plates, two pale blue-white gleaming mithril terminals on top and a glowing violet gem window in the front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 7 (row 2, column 3): a close-fitting leather cap with a short pale blue-white gleaming mithril-trimmed brim, seen from the front, and a small round violet gem at the brow. Accent, where the reference shows one: violet (about #c58cff).
Panel 8 (row 2, column 4): a close-fitting leather cap with a short pale blue-white gleaming mithril-trimmed brim, seen from the front, and a small round violet gem at the brow, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 9 (row 3, column 1): a fitted leather harness seen from the front, with crossed straps, pale blue-white gleaming mithril buckles, a row of small pouches and a violet gem at the chest. Accent, where the reference shows one: violet (about #c58cff).
Panel 10 (row 3, column 2): a fitted leather harness seen from the front, with crossed straps, pale blue-white gleaming mithril buckles, a row of small pouches and a violet gem at the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 11 (row 3, column 3): one practical leather boot seen from the side, toe pointing right: pale blue-white gleaming mithril shin strap buckles, a small pouch at the ankle and a thick dark sole. Accent, where the reference shows one: violet (about #c58cff).
Panel 12 (row 3, column 4): one practical leather boot seen from the side, toe pointing right: pale blue-white gleaming mithril shin strap buckles, a small pouch at the ankle and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).

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

## Item icons: smithed adamant, skl build  (sheet-items-smith-skl-adamant.png → images/items/)

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
Panel 1 (row 1, column 1): a compact one-handed pistol seen from the side, muzzle pointing right: a short dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems barrel, a dark wooden grip and a small round sight on top. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 2 (row 1, column 2): a compact one-handed pistol seen from the side, muzzle pointing right: a short dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems barrel, a dark wooden grip and a small round sight on top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a long-barrelled rifle seen from the side, muzzle pointing right: a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems barrel with a ribbed jacket, a dark wooden stock and a small round scope. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 4 (row 1, column 4): a long-barrelled rifle seen from the side, muzzle pointing right: a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems barrel with a ribbed jacket, a dark wooden stock and a small round scope, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a boxy aether battery: a squat dark case with dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems corner plates, two dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems terminals on top and a glowing violet gem window in the front. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 6 (row 2, column 2): a boxy aether battery: a squat dark case with dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems corner plates, two dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems terminals on top and a glowing violet gem window in the front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): a close-fitting leather cap with a short dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems-trimmed brim, seen from the front, and a small round violet gem at the brow. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 8 (row 2, column 4): a close-fitting leather cap with a short dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems-trimmed brim, seen from the front, and a small round violet gem at the brow, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a fitted leather harness seen from the front, with crossed straps, dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems buckles, a row of small pouches and a violet gem at the chest. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 10 (row 3, column 2): a fitted leather harness seen from the front, with crossed straps, dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems buckles, a row of small pouches and a violet gem at the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one practical leather boot seen from the side, toe pointing right: dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems shin strap buckles, a small pouch at the ankle and a thick dark sole. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 12 (row 3, column 4): one practical leather boot seen from the side, toe pointing right: dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems shin strap buckles, a small pouch at the ankle and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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

## Item icons: smithed aetherite, skl build  (sheet-items-smith-skl-aetherite.png → images/items/)

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
Panel 1 (row 1, column 1): a compact one-handed pistol seen from the side, muzzle pointing right: a short glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges barrel, a dark wooden grip and a small round sight on top. Accent, where the reference shows one: gold (about #ffd84a).
Panel 2 (row 1, column 2): a compact one-handed pistol seen from the side, muzzle pointing right: a short glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges barrel, a dark wooden grip and a small round sight on top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a long-barrelled rifle seen from the side, muzzle pointing right: a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges barrel with a ribbed jacket, a dark wooden stock and a small round scope. Accent, where the reference shows one: gold (about #ffd84a).
Panel 4 (row 1, column 4): a long-barrelled rifle seen from the side, muzzle pointing right: a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges barrel with a ribbed jacket, a dark wooden stock and a small round scope, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a boxy aether battery: a squat dark case with glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges corner plates, two glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges terminals on top and a glowing violet gem window in the front. Accent, where the reference shows one: gold (about #ffd84a).
Panel 6 (row 2, column 2): a boxy aether battery: a squat dark case with glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges corner plates, two glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges terminals on top and a glowing violet gem window in the front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): a close-fitting leather cap with a short glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges-trimmed brim, seen from the front, and a small round violet gem at the brow. Accent, where the reference shows one: gold (about #ffd84a).
Panel 8 (row 2, column 4): a close-fitting leather cap with a short glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges-trimmed brim, seen from the front, and a small round violet gem at the brow, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a fitted leather harness seen from the front, with crossed straps, glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges buckles, a row of small pouches and a violet gem at the chest. Accent, where the reference shows one: gold (about #ffd84a).
Panel 10 (row 3, column 2): a fitted leather harness seen from the front, with crossed straps, glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges buckles, a row of small pouches and a violet gem at the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one practical leather boot seen from the side, toe pointing right: glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges shin strap buckles, a small pouch at the ankle and a thick dark sole. Accent, where the reference shows one: gold (about #ffd84a).
Panel 12 (row 3, column 4): one practical leather boot seen from the side, toe pointing right: glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges shin strap buckles, a small pouch at the ankle and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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

## Item icons: smithed iron, cha build  (sheet-items-smith-cha-iron.png → images/items/)

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
Panel 1 (row 1, column 1): a short ceremonial sceptre: a gold-ribbed rod, a dull grey hammered iron grip and a large round gold gem held in four curved dull grey hammered iron claws at the top. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): a short ceremonial sceptre: a gold-ribbed rod, a dull grey hammered iron grip and a large round gold gem held in four curved dull grey hammered iron claws at the top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 3 (row 1, column 3): a tall standard-bearer's staff: a straight dark shaft topped by a dull grey hammered iron crossbar from which hangs a small gold-trimmed banner. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): a tall standard-bearer's staff: a straight dark shaft topped by a dull grey hammered iron crossbar from which hangs a small gold-trimmed banner, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 5 (row 2, column 1): a heavy codex bound in dark red leather with dull grey hammered iron corner plates and a single round gold clasp on its front. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 6 (row 2, column 2): a heavy codex bound in dark red leather with dull grey hammered iron corner plates and a single round gold clasp on its front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): a dull grey hammered iron crown seen from the front: a band with five tall points, each tipped with a small round gold gem. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 8 (row 2, column 4): a dull grey hammered iron crown seen from the front: a band with five tall points, each tipped with a small round gold gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 9 (row 3, column 1): a herald's tabard seen from the front: a long dark red cloth with a dull grey hammered iron embroidered border and a large dull grey hammered iron sun emblem on the chest. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 10 (row 3, column 2): a herald's tabard seen from the front: a long dark red cloth with a dull grey hammered iron embroidered border and a large dull grey hammered iron sun emblem on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 11 (row 3, column 3): one fine boot seen from the side, toe pointing right: soft dark red leather with a dull grey hammered iron cuff, a dull grey hammered iron buckle and a thin dark sole. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 12 (row 3, column 4): one fine boot seen from the side, toe pointing right: soft dark red leather with a dull grey hammered iron cuff, a dull grey hammered iron buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).

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

## Item icons: smithed silver, cha build  (sheet-items-smith-cha-silver.png → images/items/)

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
Panel 1 (row 1, column 1): a short ceremonial sceptre: a gold-ribbed rod, a bright pale silver grip and a large round gold gem held in four curved bright pale silver claws at the top. Accent, where the reference shows one: green (about #67e08a).
Panel 2 (row 1, column 2): a short ceremonial sceptre: a gold-ribbed rod, a bright pale silver grip and a large round gold gem held in four curved bright pale silver claws at the top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 3 (row 1, column 3): a tall standard-bearer's staff: a straight dark shaft topped by a bright pale silver crossbar from which hangs a small gold-trimmed banner. Accent, where the reference shows one: green (about #67e08a).
Panel 4 (row 1, column 4): a tall standard-bearer's staff: a straight dark shaft topped by a bright pale silver crossbar from which hangs a small gold-trimmed banner, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 5 (row 2, column 1): a heavy codex bound in dark red leather with bright pale silver corner plates and a single round gold clasp on its front. Accent, where the reference shows one: green (about #67e08a).
Panel 6 (row 2, column 2): a heavy codex bound in dark red leather with bright pale silver corner plates and a single round gold clasp on its front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 7 (row 2, column 3): a bright pale silver crown seen from the front: a band with five tall points, each tipped with a small round gold gem. Accent, where the reference shows one: green (about #67e08a).
Panel 8 (row 2, column 4): a bright pale silver crown seen from the front: a band with five tall points, each tipped with a small round gold gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 9 (row 3, column 1): a herald's tabard seen from the front: a long dark red cloth with a bright pale silver embroidered border and a large bright pale silver sun emblem on the chest. Accent, where the reference shows one: green (about #67e08a).
Panel 10 (row 3, column 2): a herald's tabard seen from the front: a long dark red cloth with a bright pale silver embroidered border and a large bright pale silver sun emblem on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 11 (row 3, column 3): one fine boot seen from the side, toe pointing right: soft dark red leather with a bright pale silver cuff, a bright pale silver buckle and a thin dark sole. Accent, where the reference shows one: green (about #67e08a).
Panel 12 (row 3, column 4): one fine boot seen from the side, toe pointing right: soft dark red leather with a bright pale silver cuff, a bright pale silver buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).

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

## Item icons: smithed gold, cha build  (sheet-items-smith-cha-gold.png → images/items/)

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
Panel 1 (row 1, column 1): a short ceremonial sceptre: a gold-ribbed rod, a polished warm gold grip and a large round gold gem held in four curved polished warm gold claws at the top. Accent, where the reference shows one: blue (about #50aaff).
Panel 2 (row 1, column 2): a short ceremonial sceptre: a gold-ribbed rod, a polished warm gold grip and a large round gold gem held in four curved polished warm gold claws at the top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 3 (row 1, column 3): a tall standard-bearer's staff: a straight dark shaft topped by a polished warm gold crossbar from which hangs a small gold-trimmed banner. Accent, where the reference shows one: blue (about #50aaff).
Panel 4 (row 1, column 4): a tall standard-bearer's staff: a straight dark shaft topped by a polished warm gold crossbar from which hangs a small gold-trimmed banner, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 5 (row 2, column 1): a heavy codex bound in dark red leather with polished warm gold corner plates and a single round gold clasp on its front. Accent, where the reference shows one: blue (about #50aaff).
Panel 6 (row 2, column 2): a heavy codex bound in dark red leather with polished warm gold corner plates and a single round gold clasp on its front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 7 (row 2, column 3): a polished warm gold crown seen from the front: a band with five tall points, each tipped with a small round gold gem. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): a polished warm gold crown seen from the front: a band with five tall points, each tipped with a small round gold gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 9 (row 3, column 1): a herald's tabard seen from the front: a long dark red cloth with a polished warm gold embroidered border and a large polished warm gold sun emblem on the chest. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): a herald's tabard seen from the front: a long dark red cloth with a polished warm gold embroidered border and a large polished warm gold sun emblem on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 11 (row 3, column 3): one fine boot seen from the side, toe pointing right: soft dark red leather with a polished warm gold cuff, a polished warm gold buckle and a thin dark sole. Accent, where the reference shows one: blue (about #50aaff).
Panel 12 (row 3, column 4): one fine boot seen from the side, toe pointing right: soft dark red leather with a polished warm gold cuff, a polished warm gold buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).

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

## Item icons: smithed mithril, cha build  (sheet-items-smith-cha-mithril.png → images/items/)

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
Panel 1 (row 1, column 1): a short ceremonial sceptre: a gold-ribbed rod, a pale blue-white gleaming mithril grip and a large round gold gem held in four curved pale blue-white gleaming mithril claws at the top. Accent, where the reference shows one: violet (about #c58cff).
Panel 2 (row 1, column 2): a short ceremonial sceptre: a gold-ribbed rod, a pale blue-white gleaming mithril grip and a large round gold gem held in four curved pale blue-white gleaming mithril claws at the top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 3 (row 1, column 3): a tall standard-bearer's staff: a straight dark shaft topped by a pale blue-white gleaming mithril crossbar from which hangs a small gold-trimmed banner. Accent, where the reference shows one: violet (about #c58cff).
Panel 4 (row 1, column 4): a tall standard-bearer's staff: a straight dark shaft topped by a pale blue-white gleaming mithril crossbar from which hangs a small gold-trimmed banner, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 5 (row 2, column 1): a heavy codex bound in dark red leather with pale blue-white gleaming mithril corner plates and a single round gold clasp on its front. Accent, where the reference shows one: violet (about #c58cff).
Panel 6 (row 2, column 2): a heavy codex bound in dark red leather with pale blue-white gleaming mithril corner plates and a single round gold clasp on its front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 7 (row 2, column 3): a pale blue-white gleaming mithril crown seen from the front: a band with five tall points, each tipped with a small round gold gem. Accent, where the reference shows one: violet (about #c58cff).
Panel 8 (row 2, column 4): a pale blue-white gleaming mithril crown seen from the front: a band with five tall points, each tipped with a small round gold gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 9 (row 3, column 1): a herald's tabard seen from the front: a long dark red cloth with a pale blue-white gleaming mithril embroidered border and a large pale blue-white gleaming mithril sun emblem on the chest. Accent, where the reference shows one: violet (about #c58cff).
Panel 10 (row 3, column 2): a herald's tabard seen from the front: a long dark red cloth with a pale blue-white gleaming mithril embroidered border and a large pale blue-white gleaming mithril sun emblem on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 11 (row 3, column 3): one fine boot seen from the side, toe pointing right: soft dark red leather with a pale blue-white gleaming mithril cuff, a pale blue-white gleaming mithril buckle and a thin dark sole. Accent, where the reference shows one: violet (about #c58cff).
Panel 12 (row 3, column 4): one fine boot seen from the side, toe pointing right: soft dark red leather with a pale blue-white gleaming mithril cuff, a pale blue-white gleaming mithril buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).

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

## Item icons: smithed adamant, cha build  (sheet-items-smith-cha-adamant.png → images/items/)

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
Panel 1 (row 1, column 1): a short ceremonial sceptre: a gold-ribbed rod, a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems grip and a large round gold gem held in four curved dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems claws at the top. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 2 (row 1, column 2): a short ceremonial sceptre: a gold-ribbed rod, a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems grip and a large round gold gem held in four curved dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems claws at the top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a tall standard-bearer's staff: a straight dark shaft topped by a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems crossbar from which hangs a small gold-trimmed banner. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 4 (row 1, column 4): a tall standard-bearer's staff: a straight dark shaft topped by a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems crossbar from which hangs a small gold-trimmed banner, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a heavy codex bound in dark red leather with dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems corner plates and a single round gold clasp on its front. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 6 (row 2, column 2): a heavy codex bound in dark red leather with dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems corner plates and a single round gold clasp on its front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems crown seen from the front: a band with five tall points, each tipped with a small round gold gem. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 8 (row 2, column 4): a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems crown seen from the front: a band with five tall points, each tipped with a small round gold gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a herald's tabard seen from the front: a long dark red cloth with a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems embroidered border and a large dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems sun emblem on the chest. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 10 (row 3, column 2): a herald's tabard seen from the front: a long dark red cloth with a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems embroidered border and a large dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems sun emblem on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one fine boot seen from the side, toe pointing right: soft dark red leather with a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems cuff, a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems buckle and a thin dark sole. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 12 (row 3, column 4): one fine boot seen from the side, toe pointing right: soft dark red leather with a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems cuff, a dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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

## Item icons: smithed aetherite, cha build  (sheet-items-smith-cha-aetherite.png → images/items/)

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
Panel 1 (row 1, column 1): a short ceremonial sceptre: a gold-ribbed rod, a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges grip and a large round gold gem held in four curved glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges claws at the top. Accent, where the reference shows one: gold (about #ffd84a).
Panel 2 (row 1, column 2): a short ceremonial sceptre: a gold-ribbed rod, a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges grip and a large round gold gem held in four curved glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges claws at the top, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a tall standard-bearer's staff: a straight dark shaft topped by a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges crossbar from which hangs a small gold-trimmed banner. Accent, where the reference shows one: gold (about #ffd84a).
Panel 4 (row 1, column 4): a tall standard-bearer's staff: a straight dark shaft topped by a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges crossbar from which hangs a small gold-trimmed banner, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a heavy codex bound in dark red leather with glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges corner plates and a single round gold clasp on its front. Accent, where the reference shows one: gold (about #ffd84a).
Panel 6 (row 2, column 2): a heavy codex bound in dark red leather with glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges corner plates and a single round gold clasp on its front, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges crown seen from the front: a band with five tall points, each tipped with a small round gold gem. Accent, where the reference shows one: gold (about #ffd84a).
Panel 8 (row 2, column 4): a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges crown seen from the front: a band with five tall points, each tipped with a small round gold gem, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a herald's tabard seen from the front: a long dark red cloth with a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges embroidered border and a large glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges sun emblem on the chest. Accent, where the reference shows one: gold (about #ffd84a).
Panel 10 (row 3, column 2): a herald's tabard seen from the front: a long dark red cloth with a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges embroidered border and a large glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges sun emblem on the chest, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one fine boot seen from the side, toe pointing right: soft dark red leather with a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges cuff, a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges buckle and a thin dark sole. Accent, where the reference shows one: gold (about #ffd84a).
Panel 12 (row 3, column 4): one fine boot seen from the side, toe pointing right: soft dark red leather with a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges cuff, a glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges buckle and a thin dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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

## Item icons: smithed iron, end build  (sheet-items-smith-end-iron.png → images/items/)

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
Panel 1 (row 1, column 1): a heavy flanged mace: a round dull grey hammered iron head with six raised ridges, on a short thick haft bound with leather and a flared pommel. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 2 (row 1, column 2): a heavy flanged mace: a round dull grey hammered iron head with six raised ridges, on a short thick haft bound with leather and a flared pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 3 (row 1, column 3): a broad single-bladed battle axe: a wide dull grey hammered iron blade with a rounded edge and a thick back, on a straight wooden haft bound with leather. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 4 (row 1, column 4): a broad single-bladed battle axe: a wide dull grey hammered iron blade with a rounded edge and a thick back, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 5 (row 2, column 1): a tall heavy tower shield of riveted dull grey hammered iron plate with a thick rolled rim, a raised centre boss and two bands across it. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 6 (row 2, column 2): a tall heavy tower shield of riveted dull grey hammered iron plate with a thick rolled rim, a raised centre boss and two bands across it, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 7 (row 2, column 3): an empty heavy dull grey hammered iron helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 8 (row 2, column 4): an empty heavy dull grey hammered iron helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 9 (row 3, column 1): a thick dull grey hammered iron cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 10 (row 3, column 2): a thick dull grey hammered iron cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).
Panel 11 (row 3, column 3): one heavy armoured dull grey hammered iron boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole. Accent, where the reference shows one: pale silver-grey (about #c9d2e3).
Panel 12 (row 3, column 4): one heavy armoured dull grey hammered iron boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: green (about #67e08a).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: smithed silver, end build  (sheet-items-smith-end-silver.png → images/items/)

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
Panel 1 (row 1, column 1): a heavy flanged mace: a round bright pale silver head with six raised ridges, on a short thick haft bound with leather and a flared pommel. Accent, where the reference shows one: green (about #67e08a).
Panel 2 (row 1, column 2): a heavy flanged mace: a round bright pale silver head with six raised ridges, on a short thick haft bound with leather and a flared pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 3 (row 1, column 3): a broad single-bladed battle axe: a wide bright pale silver blade with a rounded edge and a thick back, on a straight wooden haft bound with leather. Accent, where the reference shows one: green (about #67e08a).
Panel 4 (row 1, column 4): a broad single-bladed battle axe: a wide bright pale silver blade with a rounded edge and a thick back, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 5 (row 2, column 1): a tall heavy tower shield of riveted bright pale silver plate with a thick rolled rim, a raised centre boss and two bands across it. Accent, where the reference shows one: green (about #67e08a).
Panel 6 (row 2, column 2): a tall heavy tower shield of riveted bright pale silver plate with a thick rolled rim, a raised centre boss and two bands across it, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 7 (row 2, column 3): an empty heavy bright pale silver helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards. Accent, where the reference shows one: green (about #67e08a).
Panel 8 (row 2, column 4): an empty heavy bright pale silver helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 9 (row 3, column 1): a thick bright pale silver cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt. Accent, where the reference shows one: green (about #67e08a).
Panel 10 (row 3, column 2): a thick bright pale silver cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).
Panel 11 (row 3, column 3): one heavy armoured bright pale silver boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole. Accent, where the reference shows one: green (about #67e08a).
Panel 12 (row 3, column 4): one heavy armoured bright pale silver boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: blue (about #50aaff).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: smithed gold, end build  (sheet-items-smith-end-gold.png → images/items/)

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
Panel 1 (row 1, column 1): a heavy flanged mace: a round polished warm gold head with six raised ridges, on a short thick haft bound with leather and a flared pommel. Accent, where the reference shows one: blue (about #50aaff).
Panel 2 (row 1, column 2): a heavy flanged mace: a round polished warm gold head with six raised ridges, on a short thick haft bound with leather and a flared pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 3 (row 1, column 3): a broad single-bladed battle axe: a wide polished warm gold blade with a rounded edge and a thick back, on a straight wooden haft bound with leather. Accent, where the reference shows one: blue (about #50aaff).
Panel 4 (row 1, column 4): a broad single-bladed battle axe: a wide polished warm gold blade with a rounded edge and a thick back, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 5 (row 2, column 1): a tall heavy tower shield of riveted polished warm gold plate with a thick rolled rim, a raised centre boss and two bands across it. Accent, where the reference shows one: blue (about #50aaff).
Panel 6 (row 2, column 2): a tall heavy tower shield of riveted polished warm gold plate with a thick rolled rim, a raised centre boss and two bands across it, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 7 (row 2, column 3): an empty heavy polished warm gold helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards. Accent, where the reference shows one: blue (about #50aaff).
Panel 8 (row 2, column 4): an empty heavy polished warm gold helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 9 (row 3, column 1): a thick polished warm gold cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt. Accent, where the reference shows one: blue (about #50aaff).
Panel 10 (row 3, column 2): a thick polished warm gold cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).
Panel 11 (row 3, column 3): one heavy armoured polished warm gold boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole. Accent, where the reference shows one: blue (about #50aaff).
Panel 12 (row 3, column 4): one heavy armoured polished warm gold boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: violet (about #c58cff).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: smithed mithril, end build  (sheet-items-smith-end-mithril.png → images/items/)

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
Panel 1 (row 1, column 1): a heavy flanged mace: a round pale blue-white gleaming mithril head with six raised ridges, on a short thick haft bound with leather and a flared pommel. Accent, where the reference shows one: violet (about #c58cff).
Panel 2 (row 1, column 2): a heavy flanged mace: a round pale blue-white gleaming mithril head with six raised ridges, on a short thick haft bound with leather and a flared pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 3 (row 1, column 3): a broad single-bladed battle axe: a wide pale blue-white gleaming mithril blade with a rounded edge and a thick back, on a straight wooden haft bound with leather. Accent, where the reference shows one: violet (about #c58cff).
Panel 4 (row 1, column 4): a broad single-bladed battle axe: a wide pale blue-white gleaming mithril blade with a rounded edge and a thick back, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 5 (row 2, column 1): a tall heavy tower shield of riveted pale blue-white gleaming mithril plate with a thick rolled rim, a raised centre boss and two bands across it. Accent, where the reference shows one: violet (about #c58cff).
Panel 6 (row 2, column 2): a tall heavy tower shield of riveted pale blue-white gleaming mithril plate with a thick rolled rim, a raised centre boss and two bands across it, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 7 (row 2, column 3): an empty heavy pale blue-white gleaming mithril helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards. Accent, where the reference shows one: violet (about #c58cff).
Panel 8 (row 2, column 4): an empty heavy pale blue-white gleaming mithril helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 9 (row 3, column 1): a thick pale blue-white gleaming mithril cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt. Accent, where the reference shows one: violet (about #c58cff).
Panel 10 (row 3, column 2): a thick pale blue-white gleaming mithril cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 11 (row 3, column 3): one heavy armoured pale blue-white gleaming mithril boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole. Accent, where the reference shows one: violet (about #c58cff).
Panel 12 (row 3, column 4): one heavy armoured pale blue-white gleaming mithril boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: orange (about #ff8a4a).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: smithed adamant, end build  (sheet-items-smith-end-adamant.png → images/items/)

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
Panel 1 (row 1, column 1): a heavy flanged mace: a round dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems head with six raised ridges, on a short thick haft bound with leather and a flared pommel. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 2 (row 1, column 2): a heavy flanged mace: a round dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems head with six raised ridges, on a short thick haft bound with leather and a flared pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a broad single-bladed battle axe: a wide dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems blade with a rounded edge and a thick back, on a straight wooden haft bound with leather. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 4 (row 1, column 4): a broad single-bladed battle axe: a wide dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems blade with a rounded edge and a thick back, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a tall heavy tower shield of riveted dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems plate with a thick rolled rim, a raised centre boss and two bands across it. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 6 (row 2, column 2): a tall heavy tower shield of riveted dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems plate with a thick rolled rim, a raised centre boss and two bands across it, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): an empty heavy dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 8 (row 2, column 4): an empty heavy dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a thick dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 10 (row 3, column 2): a thick dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one heavy armoured dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole. Accent, where the reference shows one: orange (about #ff8a4a).
Panel 12 (row 3, column 4): one heavy armoured dark gunmetal-charcoal adamant, a dense near-black grey metal (NOT red, NOT crimson), with a thin red glow only along its edges and a few small red rivets or gems boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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

## Item icons: smithed aetherite, end build  (sheet-items-smith-end-aetherite.png → images/items/)

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
Panel 1 (row 1, column 1): a heavy flanged mace: a round glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges head with six raised ridges, on a short thick haft bound with leather and a flared pommel. Accent, where the reference shows one: gold (about #ffd84a).
Panel 2 (row 1, column 2): a heavy flanged mace: a round glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges head with six raised ridges, on a short thick haft bound with leather and a flared pommel, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 3 (row 1, column 3): a broad single-bladed battle axe: a wide glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges blade with a rounded edge and a thick back, on a straight wooden haft bound with leather. Accent, where the reference shows one: gold (about #ffd84a).
Panel 4 (row 1, column 4): a broad single-bladed battle axe: a wide glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges blade with a rounded edge and a thick back, on a straight wooden haft bound with leather, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 5 (row 2, column 1): a tall heavy tower shield of riveted glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges plate with a thick rolled rim, a raised centre boss and two bands across it. Accent, where the reference shows one: gold (about #ffd84a).
Panel 6 (row 2, column 2): a tall heavy tower shield of riveted glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges plate with a thick rolled rim, a raised centre boss and two bands across it, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 7 (row 2, column 3): an empty heavy glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards. Accent, where the reference shows one: gold (about #ffd84a).
Panel 8 (row 2, column 4): an empty heavy glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges helmet seen from the front: a rounded dome, a broad riveted brow band, a nose guard and deep cheek guards, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 9 (row 3, column 1): a thick glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt. Accent, where the reference shows one: gold (about #ffd84a).
Panel 10 (row 3, column 2): a thick glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges cuirass with broad rounded shoulder plates, three riveted bands across the belly and a wide belt, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).
Panel 11 (row 3, column 3): one heavy armoured glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole. Accent, where the reference shows one: gold (about #ffd84a).
Panel 12 (row 3, column 4): one heavy armoured glowing violet aetherite, a luminous crystalline metal with pale lilac light running along its edges boot seen from the side, toe pointing right: broad banded shin plates, a large knee guard, a steel toe cap and a thick dark sole, finished as a masterwork: a fine engraved border line along every edge and one small round gem set in the middle. Accent, where the reference shows one: gold (about #ffd84a).

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
· In the reference no drawing is wider than about 79% of its panel or taller than about 84%, and every panel keeps a clear magenta margin on all four sides.
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
