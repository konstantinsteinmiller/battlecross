# Battlecross art prompts — Store covers

Generated from `src/game/art/artSheet.ts` by `pnpm art:prompts` (and by the
bench at `/#/art-sheets` on export). Do not edit by hand: change the manifest.

Each block is one generation. The heading names the reference image to attach
and where the sliced result lands; it stays OUTSIDE the fence, so copy the
fenced text only (a markdown preview gives it a copy button). Save the return
as `art-sheets/painted/<reference name>.png`, then `pnpm art:slice`.

A block with an "Attach, in this order" line goes out with finished paintings
as well: attach those FIRST and the reference LAST (the model takes the grid
from the last image). `pnpm art:desk` does this by itself.

## Cover: the hero smashes the Goblin King  (cover-clash.png → ../store-art/covers/masters/cover-clash.webp)

Attach, in this order: `public/images/portraits/hero-tunic.webp`, `public/images/logo/mascot.webp`, `public/images/portraits/goblinKing.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED COVER IMAGE FOR A GAME STORE PAGE: A SINGLE DRAMATIC MOMENT, PAINTED EDGE TO EDGE, WITH NO TEXT OF ANY KIND.
One landscape image, 1376 x 768 pixels (16:9).

WHAT IT IS NOT: no title, no logo, no lettering, no numbers, no speech bubbles, no buttons, no health bars, no interface, no border, no frame, no watermark. The game's name is added later, by the store and by us; painted text would collide with it.

THE HOOK: One huge hit: the hero's sword lands on the Goblin King, who is blown off his feet.
WHERE: a sunny forest clearing in the late afternoon: big round-canopied trees at both sides, warm light falling in from the top right, a dirt path across the grass.
THE MOMENT: the instant the sword connects: a bright starburst of impact between the two, sparks and grass flung outward, speed lines streaking from the hero toward the king.

WHO IS IN IT — exactly these, nobody else:
· a small goblin: bright green skin, big pointed ears sticking out sideways, a ragged brown tunic, a little steel dagger, tumbling head over heels out of the frame at the bottom left, cropped by the edge.
· a small goblin: bright green skin, big pointed ears sticking out sideways, a ragged brown tunic, a little steel dagger, flung away to the bottom right, cropped by the edge.
· the Goblin King (the attached portrait): bright green skin, huge pointed ears, a gold crown with one red jewel, a purple robe with a gold collar line and a red cape. He is knocked backwards off his feet, his wooden club flying out of his hand and his crown popping off his head. FACE: total shock, played for laughs: eyes enormous, pupils tiny, mouth wide open.
· the hero of the game (the attached portrait and the attached full figure): short tousled brown hair, a blue tunic with a gold collar line, a brown belt, brown boots and a red cape. Big in the frame, three-quarter view turned toward the viewer, both hands on a steel sword with a gold crossguard swung down and across at the king; the blade glows white-hot along its edge. FACE: a fierce, confident grin with teeth showing, eyebrows down, eyes on the king.

READ THE ATTACHED IMAGES:
· The finished paintings attached first show what the characters look like and what "painted" means in this game: goblinKing, hero-tunic, and the full-figure hero (the mascot) for his body, clothes and proportions. Keep their faces, colours and costumes exactly; give them the pose and expression written above, not the one in the portrait.
· The LAST image is the layout: a flat stand-in for this cover. Take from it WHERE each figure, effect and prop is and HOW BIG; the round heads with painted faces are where those faces go. Take nothing else from it — it is stiff, evenly lit and has no atmosphere, and fixing that is the job.

WHAT MAKES IT GET CLICKED — each one is a check, not a mood:
· One subject, enormous: the hero and the action fill at least half the frame. Faces are BIG and the expression reads from across a room.
· The moment is mid-action, full of motion: a body leaning into it, speed lines, things flying outward.
· Maximum contrast where the eye lands: white-gold impact light against the king's purple robe and green skin. Those two colours meet there and nowhere else.
· Everything points at the hero's face and the action: bodies lean toward it, light falls on it, debris flies away from it.
· Three planes of depth: something large and cropped by the frame in front, the subject crisp in the middle, a simpler, softer background behind.
· A quiet edge and a bright centre: the background is simpler, darker and less saturated toward the corners.
· THE TOP-LEFT CORNER IS COVERED by the store's own badges, from the left edge to 50% across and 20% down: nothing important there, only sky, foliage or background.
· THE LOWER LEFT, from 3% to 37% across and from 66% down to the bottom, is where the game's logo is laid on later: keep it simple and fairly dark (ground, shadow, a tumbling extra at most), no faces there.
· Nothing important in the outer twentieth on any side: stores crop.

COLOUR — bright, saturated and warm on the subject; cooler and calmer behind. The characters' own colours exactly as in their paintings.

THE VIEW — a dynamic, slightly low camera close to the action, as on a game box: the figures large, three-quarter views, real depth in the scene. (This picture is not seen from straight above like the game.)

STYLE — the same hand as every other picture in this game.
· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.
· ONE dark outline around every shape, in deep charcoal-violet (about #0F0C19, never pure black), brush-pen weight: at its heaviest about 2.5% of the panel's shorter side. Hold the picture at thumbnail size; if the outline has thinned to a hairline it is several times too thin.
· Cel shading in hard steps, no blending: a base tone, ONE shadow step (the base darkened by about a third and pushed toward blue-violet) and ONE lighter step. No airbrush, no smooth gradients, no photographic texture, no noise.
· Bright, saturated candy colours (saturation 60-85%, brightness 75-100%). Nothing muddy, grey or desaturated.
· One small, hard-edged white glint on anything metal, glass, gem or liquid.
· People are squat chibi: the head is nearly half the figure, large oval eyes with one white glint, tiny nose or none, mitten hands, no fingers.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. A sword, a ring, a flask or a rock gets the same outline, the same two-step shading and the same glint as a character.
· Light and energy are bold painted shapes: a white-hot core, the colour, a darker edge. A soft glow around a light source and a little atmosphere in the distance are allowed in this picture, never over the faces.
· This picture HAS its own ground, light and shadows, out to all four edges: cast shadows under the figures, rim light, atmosphere and depth. It is a finished illustration, not a cut-out on a background.
AVOID: realism, pixel art, thin technical line, muddy or grey colour, a busy background that competes with the subject, small faces, any text.

BEFORE YOU CALL IT FINISHED, check:
· There is not one letter, number or logo anywhere in the picture.
· Shrink it to 250 pixels wide: the hero's face and what is happening still read in a glance.
· The top-left corner and the lower left hold nothing important.
· Everybody in it is one of the characters listed above, in their own colours.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## Cover: fire in one hand, lightning in the other  (cover-skills.png → ../store-art/covers/masters/cover-skills.webp)

Attach, in this order: `public/images/portraits/hero-tunic.webp`, `public/images/logo/mascot.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED COVER IMAGE FOR A GAME STORE PAGE: A SINGLE DRAMATIC MOMENT, PAINTED EDGE TO EDGE, WITH NO TEXT OF ANY KIND.
One landscape image, 1376 x 768 pixels (16:9).

WHAT IT IS NOT: no title, no logo, no lettering, no numbers, no speech bubbles, no buttons, no health bars, no interface, no border, no frame, no watermark. The game's name is added later, by the store and by us; painted text would collide with it.

THE HOOK: Build any hero: two classes' powers at once, the eight class colours wheeling round him.
WHERE: a ruined stone arena at dusk: broken columns at both sides, a deep violet-blue evening sky.
THE MOMENT: mid-leap, both powers flaring at full strength, a ring of eight glowing class emblems wheeling behind him in the eight class colours (orange-red, silver, violet, teal, gold, sky-blue, crimson, sand-brown).

WHO IS IN IT — exactly these, nobody else:
· a small goblin: bright green skin, big pointed ears sticking out sideways, a ragged brown tunic, a little steel dagger, blasted backwards by the fireball, scorched and dazed.
· the hero of the game (the attached portrait and the attached full figure): short tousled brown hair, a blue tunic with a gold collar line, a brown belt, brown boots and a red cape. Leaping toward the viewer, arms flung wide: a blazing orange fireball in the hand on the left, crackling pale-blue lightning in the hand on the right. FACE: thrilled, shouting with joy, mouth wide open, eyes bright.

READ THE ATTACHED IMAGES:
· The finished paintings attached first show what the characters look like and what "painted" means in this game: hero-tunic, and the full-figure hero (the mascot) for his body, clothes and proportions. Keep their faces, colours and costumes exactly; give them the pose and expression written above, not the one in the portrait.
· The LAST image is the layout: a flat stand-in for this cover. Take from it WHERE each figure, effect and prop is and HOW BIG; the round heads with painted faces are where those faces go. Take nothing else from it — it is stiff, evenly lit and has no atmosphere, and fixing that is the job.

WHAT MAKES IT GET CLICKED — each one is a check, not a mood:
· One subject, enormous: the hero and the action fill at least half the frame. Faces are BIG and the expression reads from across a room.
· The moment is mid-action, full of motion: a body leaning into it, speed lines, things flying outward.
· Maximum contrast where the eye lands: the orange fireball against the pale-blue lightning, with his face between them. Those two colours meet there and nowhere else.
· Everything points at the hero's face and the action: bodies lean toward it, light falls on it, debris flies away from it.
· Three planes of depth: something large and cropped by the frame in front, the subject crisp in the middle, a simpler, softer background behind.
· A quiet edge and a bright centre: the background is simpler, darker and less saturated toward the corners.
· THE TOP-LEFT CORNER IS COVERED by the store's own badges, from the left edge to 50% across and 20% down: nothing important there, only sky, foliage or background.
· THE LOWER LEFT, from 3% to 37% across and from 66% down to the bottom, is where the game's logo is laid on later: keep it simple and fairly dark (ground, shadow, a tumbling extra at most), no faces there.
· Nothing important in the outer twentieth on any side: stores crop.

COLOUR — bright, saturated and warm on the subject; cooler and calmer behind. The characters' own colours exactly as in their paintings.

THE VIEW — a dynamic, slightly low camera close to the action, as on a game box: the figures large, three-quarter views, real depth in the scene. (This picture is not seen from straight above like the game.)

STYLE — the same hand as every other picture in this game.
· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.
· ONE dark outline around every shape, in deep charcoal-violet (about #0F0C19, never pure black), brush-pen weight: at its heaviest about 2.5% of the panel's shorter side. Hold the picture at thumbnail size; if the outline has thinned to a hairline it is several times too thin.
· Cel shading in hard steps, no blending: a base tone, ONE shadow step (the base darkened by about a third and pushed toward blue-violet) and ONE lighter step. No airbrush, no smooth gradients, no photographic texture, no noise.
· Bright, saturated candy colours (saturation 60-85%, brightness 75-100%). Nothing muddy, grey or desaturated.
· One small, hard-edged white glint on anything metal, glass, gem or liquid.
· People are squat chibi: the head is nearly half the figure, large oval eyes with one white glint, tiny nose or none, mitten hands, no fingers.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. A sword, a ring, a flask or a rock gets the same outline, the same two-step shading and the same glint as a character.
· Light and energy are bold painted shapes: a white-hot core, the colour, a darker edge. A soft glow around a light source and a little atmosphere in the distance are allowed in this picture, never over the faces.
· This picture HAS its own ground, light and shadows, out to all four edges: cast shadows under the figures, rim light, atmosphere and depth. It is a finished illustration, not a cut-out on a background.
AVOID: realism, pixel art, thin technical line, muddy or grey colour, a busy background that competes with the subject, small faces, any text.

BEFORE YOU CALL IT FINISHED, check:
· There is not one letter, number or logo anywhere in the picture.
· Shrink it to 250 pixels wide: the hero's face and what is happening still read in a glance.
· The top-left corner and the lower left hold nothing important.
· Everybody in it is one of the characters listed above, in their own colours.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## Cover: a legendary sword erupts from a chest  (cover-loot.png → ../store-art/covers/masters/cover-loot.webp)

Attach, in this order: `public/images/portraits/hero-tunic.webp`, `public/images/logo/mascot.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED COVER IMAGE FOR A GAME STORE PAGE: A SINGLE DRAMATIC MOMENT, PAINTED EDGE TO EDGE, WITH NO TEXT OF ANY KIND.
One landscape image, 1376 x 768 pixels (16:9).

WHAT IT IS NOT: no title, no logo, no lettering, no numbers, no speech bubbles, no buttons, no health bars, no interface, no border, no frame, no watermark. The game's name is added later, by the store and by us; painted text would collide with it.

THE HOOK: The loot moment: a golden beam bursts out of a chest and the hero cannot believe his luck.
WHERE: a dim treasure vault of cool blue-violet stone, piles of gold coins glinting at the edges.
THE MOMENT: the chest lid has just burst open: a column of golden light shoots up out of it, a glowing legendary sword rises point-up inside the beam, gold coins and gems spray outward.

WHO IS IN IT — exactly these, nobody else:
· a small goblin: bright green skin, big pointed ears sticking out sideways, a ragged brown tunic, a little steel dagger, peeking out from behind a pile of coins on the left, jealous, eyes narrowed, hands clutching the coins.
· the hero of the game (the attached portrait and the attached full figure): short tousled brown hair, a blue tunic with a gold collar line, a brown belt, brown boots and a red cape. Leaning in from the right, big in the frame and lit gold from below by the beam, both hands up. FACE: pure delight, mouth wide open in a gasp of joy, eyes huge with a star-shaped glint in each.

READ THE ATTACHED IMAGES:
· The finished paintings attached first show what the characters look like and what "painted" means in this game: hero-tunic, and the full-figure hero (the mascot) for his body, clothes and proportions. Keep their faces, colours and costumes exactly; give them the pose and expression written above, not the one in the portrait.
· The LAST image is the layout: a flat stand-in for this cover. Take from it WHERE each figure, effect and prop is and HOW BIG; the round heads with painted faces are where those faces go. Take nothing else from it — it is stiff, evenly lit and has no atmosphere, and fixing that is the job.

WHAT MAKES IT GET CLICKED — each one is a check, not a mood:
· One subject, enormous: the hero and the action fill at least half the frame. Faces are BIG and the expression reads from across a room.
· The moment is mid-action, full of motion: a body leaning into it, speed lines, things flying outward.
· Maximum contrast where the eye lands: the warm gold beam against the cool blue-violet vault. Those two colours meet there and nowhere else.
· Everything points at the hero's face and the action: bodies lean toward it, light falls on it, debris flies away from it.
· Three planes of depth: something large and cropped by the frame in front, the subject crisp in the middle, a simpler, softer background behind.
· A quiet edge and a bright centre: the background is simpler, darker and less saturated toward the corners.
· THE TOP-LEFT CORNER IS COVERED by the store's own badges, from the left edge to 50% across and 20% down: nothing important there, only sky, foliage or background.
· THE LOWER LEFT, from 3% to 37% across and from 66% down to the bottom, is where the game's logo is laid on later: keep it simple and fairly dark (ground, shadow, a tumbling extra at most), no faces there.
· Nothing important in the outer twentieth on any side: stores crop.

COLOUR — bright, saturated and warm on the subject; cooler and calmer behind. The characters' own colours exactly as in their paintings.

THE VIEW — a dynamic, slightly low camera close to the action, as on a game box: the figures large, three-quarter views, real depth in the scene. (This picture is not seen from straight above like the game.)

STYLE — the same hand as every other picture in this game.
· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.
· ONE dark outline around every shape, in deep charcoal-violet (about #0F0C19, never pure black), brush-pen weight: at its heaviest about 2.5% of the panel's shorter side. Hold the picture at thumbnail size; if the outline has thinned to a hairline it is several times too thin.
· Cel shading in hard steps, no blending: a base tone, ONE shadow step (the base darkened by about a third and pushed toward blue-violet) and ONE lighter step. No airbrush, no smooth gradients, no photographic texture, no noise.
· Bright, saturated candy colours (saturation 60-85%, brightness 75-100%). Nothing muddy, grey or desaturated.
· One small, hard-edged white glint on anything metal, glass, gem or liquid.
· People are squat chibi: the head is nearly half the figure, large oval eyes with one white glint, tiny nose or none, mitten hands, no fingers.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. A sword, a ring, a flask or a rock gets the same outline, the same two-step shading and the same glint as a character.
· Light and energy are bold painted shapes: a white-hot core, the colour, a darker edge. A soft glow around a light source and a little atmosphere in the distance are allowed in this picture, never over the faces.
· This picture HAS its own ground, light and shadows, out to all four edges: cast shadows under the figures, rim light, atmosphere and depth. It is a finished illustration, not a cut-out on a background.
AVOID: realism, pixel art, thin technical line, muddy or grey colour, a busy background that competes with the subject, small faces, any text.

BEFORE YOU CALL IT FINISHED, check:
· There is not one letter, number or logo anywhere in the picture.
· Shrink it to 250 pixels wide: the hero's face and what is happening still read in a glance.
· The top-left corner and the lower left hold nothing important.
· Everybody in it is one of the characters listed above, in their own colours.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## Cover: the void dragon looms behind the hero  (cover-dragon.png → ../store-art/covers/masters/cover-dragon.webp)

Attach, in this order: `public/images/portraits/hero-tunic.webp`, `public/images/logo/mascot.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED COVER IMAGE FOR A GAME STORE PAGE: A SINGLE DRAMATIC MOMENT, PAINTED EDGE TO EDGE, WITH NO TEXT OF ANY KIND.
One landscape image, 1376 x 768 pixels (16:9).

WHAT IT IS NOT: no title, no logo, no lettering, no numbers, no speech bubbles, no buttons, no health bars, no interface, no border, no frame, no watermark. The game's name is added later, by the store and by us; painted text would collide with it.

THE HOOK: Scale and danger: a giant dragon rears up, and the hero just grins.
WHERE: a cliff edge above a valley at a stormy dusk, orange sunset light from the right, violet storm clouds behind the dragon.
THE MOMENT: the dragon rears up behind him with its jaws open and violet fire gathering in its mouth, wings spread wide; the hero has not even turned round yet.

WHO IS IN IT — exactly these, nobody else:
· the hero of the game (the attached portrait and the attached full figure): short tousled brown hair, a blue tunic with a gold collar line, a brown belt, brown boots and a red cape. In the front, big in the frame, looking back over his shoulder at the viewer, a steel sword with a gold crossguard raised and glowing, a round blue shield on the other arm, cape whipping in the wind. FACE: a cocky, fearless grin, one eyebrow up.
· the void dragon: a huge dragon with violet hide, a pale lilac belly, near-black violet wings, pale ivory horns and glowing lilac eyes. It fills the middle and top of the picture behind him: the purple shapes in the reference are its head, body and wings.

READ THE ATTACHED IMAGES:
· The finished paintings attached first show what the characters look like and what "painted" means in this game: hero-tunic, and the full-figure hero (the mascot) for his body, clothes and proportions. Keep their faces, colours and costumes exactly; give them the pose and expression written above, not the one in the portrait.
· The LAST image is the layout: a flat stand-in for this cover. Take from it WHERE each figure, effect and prop is and HOW BIG; the round heads with painted faces are where those faces go. Take nothing else from it — it is stiff, evenly lit and has no atmosphere, and fixing that is the job.

WHAT MAKES IT GET CLICKED — each one is a check, not a mood:
· One subject, enormous: the hero and the action fill at least half the frame. Faces are BIG and the expression reads from across a room.
· The moment is mid-action, full of motion: a body leaning into it, speed lines, things flying outward.
· Maximum contrast where the eye lands: the orange sunset rim light on the hero against the dragon's violet hide. Those two colours meet there and nowhere else.
· Everything points at the hero's face and the action: bodies lean toward it, light falls on it, debris flies away from it.
· Three planes of depth: something large and cropped by the frame in front, the subject crisp in the middle, a simpler, softer background behind.
· A quiet edge and a bright centre: the background is simpler, darker and less saturated toward the corners.
· THE TOP-LEFT CORNER IS COVERED by the store's own badges, from the left edge to 50% across and 20% down: nothing important there, only sky, foliage or background.
· THE LOWER LEFT, from 3% to 37% across and from 66% down to the bottom, is where the game's logo is laid on later: keep it simple and fairly dark (ground, shadow, a tumbling extra at most), no faces there.
· Nothing important in the outer twentieth on any side: stores crop.

COLOUR — bright, saturated and warm on the subject; cooler and calmer behind. The characters' own colours exactly as in their paintings.

THE VIEW — a dynamic, slightly low camera close to the action, as on a game box: the figures large, three-quarter views, real depth in the scene. (This picture is not seen from straight above like the game.)

STYLE — the same hand as every other picture in this game.
· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.
· ONE dark outline around every shape, in deep charcoal-violet (about #0F0C19, never pure black), brush-pen weight: at its heaviest about 2.5% of the panel's shorter side. Hold the picture at thumbnail size; if the outline has thinned to a hairline it is several times too thin.
· Cel shading in hard steps, no blending: a base tone, ONE shadow step (the base darkened by about a third and pushed toward blue-violet) and ONE lighter step. No airbrush, no smooth gradients, no photographic texture, no noise.
· Bright, saturated candy colours (saturation 60-85%, brightness 75-100%). Nothing muddy, grey or desaturated.
· One small, hard-edged white glint on anything metal, glass, gem or liquid.
· People are squat chibi: the head is nearly half the figure, large oval eyes with one white glint, tiny nose or none, mitten hands, no fingers.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. A sword, a ring, a flask or a rock gets the same outline, the same two-step shading and the same glint as a character.
· Light and energy are bold painted shapes: a white-hot core, the colour, a darker edge. A soft glow around a light source and a little atmosphere in the distance are allowed in this picture, never over the faces.
· This picture HAS its own ground, light and shadows, out to all four edges: cast shadows under the figures, rim light, atmosphere and depth. It is a finished illustration, not a cut-out on a background.
AVOID: realism, pixel art, thin technical line, muddy or grey colour, a busy background that competes with the subject, small faces, any text.

BEFORE YOU CALL IT FINISHED, check:
· There is not one letter, number or logo anywhere in the picture.
· Shrink it to 250 pixels wide: the hero's face and what is happening still read in a glance.
· The top-left corner and the lower left hold nothing important.
· Everybody in it is one of the characters listed above, in their own colours.

OUTPUT: one image, 1376 x 768 pixels (16:9, landscape). If your tool has an aspect-ratio control, set it to 16:9. PNG. No labels, captions, numbers or watermarks.
```

## Cover: a legendary sword erupts from a chest (square)  (cover-sq-loot.png → ../store-art/covers/masters/cover-sq-loot.webp)

Attach, in this order: `art-sheets/painted/cover-loot.jpg`, `public/images/portraits/hero-tunic.webp`, `public/images/logo/mascot.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED COVER IMAGE FOR A GAME STORE PAGE: A SINGLE DRAMATIC MOMENT, PAINTED EDGE TO EDGE, WITH NO TEXT OF ANY KIND.
One square image, 1024 x 1024 pixels (1:1).

WHAT IT IS NOT: no title, no logo, no lettering, no numbers, no speech bubbles, no buttons, no health bars, no interface, no border, no frame, no watermark. The game's name is added later, by the store and by us; painted text would collide with it.

THE HOOK: The loot moment: a golden beam bursts out of a chest and the hero cannot believe his luck.
WHERE: a dim treasure vault of cool blue-violet stone, piles of gold coins glinting at the edges.
THE MOMENT: the chest lid has just burst open: a column of golden light shoots up out of it, a glowing legendary sword rises point-up inside the beam, gold coins and gems spray outward.

WHO IS IN IT — exactly these, nobody else:
· a small goblin: bright green skin, big pointed ears sticking out sideways, a ragged brown tunic, a little steel dagger, peeking out from behind a pile of coins on the left, jealous, eyes narrowed, hands clutching the coins.
· the hero of the game (the attached portrait and the attached full figure): short tousled brown hair, a blue tunic with a gold collar line, a brown belt, brown boots and a red cape. Leaning in from the right, big in the frame and lit gold from below by the beam, both hands up. FACE: pure delight, mouth wide open in a gasp of joy, eyes huge with a star-shaped glint in each.

READ THE ATTACHED IMAGES:
· THE FIRST ATTACHED IMAGE IS THE FINISHED 16:9 COVER OF THIS SAME MOMENT. Paint it again for a square frame: the same characters, the same moment, the same expressions, light and colours, rearranged to fill this shape as the layout shows. Not a crop of it, not stretched, not a wider view with empty space: every figure is as big in the frame as the layout has it.
· The finished paintings attached first show what the characters look like and what "painted" means in this game: hero-tunic, and the full-figure hero (the mascot) for his body, clothes and proportions. Keep their faces, colours and costumes exactly; give them the pose and expression written above, not the one in the portrait.
· The LAST image is the layout: a flat stand-in for this cover. Take from it WHERE each figure, effect and prop is and HOW BIG; the round heads with painted faces are where those faces go. Take nothing else from it — it is stiff, evenly lit and has no atmosphere, and fixing that is the job.

WHAT MAKES IT GET CLICKED — each one is a check, not a mood:
· One subject, enormous: the hero and the action fill at least half the frame. Faces are BIG and the expression reads from across a room.
· The moment is mid-action, full of motion: a body leaning into it, speed lines, things flying outward.
· Maximum contrast where the eye lands: the warm gold beam against the cool blue-violet vault. Those two colours meet there and nowhere else.
· Everything points at the hero's face and the action: bodies lean toward it, light falls on it, debris flies away from it.
· Three planes of depth: something large and cropped by the frame in front, the subject crisp in the middle, a simpler, softer background behind.
· A quiet edge and a bright centre: the background is simpler, darker and less saturated toward the corners.
· THE TOP-LEFT CORNER IS COVERED by the store's own badges, from the left edge to 50% across and 20% down: nothing important there, only sky, foliage or background.
· THE BOTTOM BAND, from 20% to 80% across and from 80% down to the bottom, is where the game's logo is laid on later: keep it simple and fairly dark (ground, shadow, a tumbling extra at most), no faces there.
· Nothing important in the outer twentieth on any side: stores crop.

COLOUR — bright, saturated and warm on the subject; cooler and calmer behind. The characters' own colours exactly as in their paintings.

THE VIEW — a dynamic, slightly low camera close to the action, as on a game box: the figures large, three-quarter views, real depth in the scene. (This picture is not seen from straight above like the game.)

STYLE — the same hand as every other picture in this game.
· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.
· ONE dark outline around every shape, in deep charcoal-violet (about #0F0C19, never pure black), brush-pen weight: at its heaviest about 2.5% of the panel's shorter side. Hold the picture at thumbnail size; if the outline has thinned to a hairline it is several times too thin.
· Cel shading in hard steps, no blending: a base tone, ONE shadow step (the base darkened by about a third and pushed toward blue-violet) and ONE lighter step. No airbrush, no smooth gradients, no photographic texture, no noise.
· Bright, saturated candy colours (saturation 60-85%, brightness 75-100%). Nothing muddy, grey or desaturated.
· One small, hard-edged white glint on anything metal, glass, gem or liquid.
· People are squat chibi: the head is nearly half the figure, large oval eyes with one white glint, tiny nose or none, mitten hands, no fingers.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. A sword, a ring, a flask or a rock gets the same outline, the same two-step shading and the same glint as a character.
· Light and energy are bold painted shapes: a white-hot core, the colour, a darker edge. A soft glow around a light source and a little atmosphere in the distance are allowed in this picture, never over the faces.
· This picture HAS its own ground, light and shadows, out to all four edges: cast shadows under the figures, rim light, atmosphere and depth. It is a finished illustration, not a cut-out on a background.
AVOID: realism, pixel art, thin technical line, muddy or grey colour, a busy background that competes with the subject, small faces, any text.

BEFORE YOU CALL IT FINISHED, check:
· There is not one letter, number or logo anywhere in the picture.
· Shrink it to 250 pixels wide: the hero's face and what is happening still read in a glance.
· The top-left corner and the lower left hold nothing important.
· Everybody in it is one of the characters listed above, in their own colours.

OUTPUT: one image, 1024 x 1024 pixels (1:1, square). If your tool has an aspect-ratio control, set it to 1:1. PNG. No labels, captions, numbers or watermarks.
```

## Cover: a legendary sword erupts from a chest (tall)  (cover-tall-loot.png → ../store-art/covers/masters/cover-tall-loot.webp)

Attach, in this order: `art-sheets/painted/cover-loot.jpg`, `public/images/portraits/hero-tunic.webp`, `public/images/logo/mascot.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED COVER IMAGE FOR A GAME STORE PAGE: A SINGLE DRAMATIC MOMENT, PAINTED EDGE TO EDGE, WITH NO TEXT OF ANY KIND.
One portrait image, 768 x 1376 pixels (9:16).

WHAT IT IS NOT: no title, no logo, no lettering, no numbers, no speech bubbles, no buttons, no health bars, no interface, no border, no frame, no watermark. The game's name is added later, by the store and by us; painted text would collide with it.

THE HOOK: The loot moment: a golden beam bursts out of a chest and the hero cannot believe his luck.
WHERE: a dim treasure vault of cool blue-violet stone, piles of gold coins glinting at the edges.
THE MOMENT: the chest lid has just burst open: a column of golden light shoots up out of it, a glowing legendary sword rises point-up inside the beam, gold coins and gems spray outward.

WHO IS IN IT — exactly these, nobody else:
· a small goblin: bright green skin, big pointed ears sticking out sideways, a ragged brown tunic, a little steel dagger, peeking out from behind a pile of coins on the left, jealous, eyes narrowed, hands clutching the coins.
· the hero of the game (the attached portrait and the attached full figure): short tousled brown hair, a blue tunic with a gold collar line, a brown belt, brown boots and a red cape. Leaning in from the right, big in the frame and lit gold from below by the beam, both hands up. FACE: pure delight, mouth wide open in a gasp of joy, eyes huge with a star-shaped glint in each.

READ THE ATTACHED IMAGES:
· THE FIRST ATTACHED IMAGE IS THE FINISHED 16:9 COVER OF THIS SAME MOMENT. Paint it again for a portrait frame: the same characters, the same moment, the same expressions, light and colours, rearranged to fill this shape as the layout shows. Not a crop of it, not stretched, not a wider view with empty space: every figure is as big in the frame as the layout has it.
· The finished paintings attached first show what the characters look like and what "painted" means in this game: hero-tunic, and the full-figure hero (the mascot) for his body, clothes and proportions. Keep their faces, colours and costumes exactly; give them the pose and expression written above, not the one in the portrait.
· The LAST image is the layout: a flat stand-in for this cover. Take from it WHERE each figure, effect and prop is and HOW BIG; the round heads with painted faces are where those faces go. Take nothing else from it — it is stiff, evenly lit and has no atmosphere, and fixing that is the job.

WHAT MAKES IT GET CLICKED — each one is a check, not a mood:
· One subject, enormous: the hero and the action fill at least half the frame. Faces are BIG and the expression reads from across a room.
· The moment is mid-action, full of motion: a body leaning into it, speed lines, things flying outward.
· Maximum contrast where the eye lands: the warm gold beam against the cool blue-violet vault. Those two colours meet there and nowhere else.
· Everything points at the hero's face and the action: bodies lean toward it, light falls on it, debris flies away from it.
· Three planes of depth: something large and cropped by the frame in front, the subject crisp in the middle, a simpler, softer background behind.
· A quiet edge and a bright centre: the background is simpler, darker and less saturated toward the corners.
· THE TOP-LEFT CORNER IS COVERED by the store's own badges, from the left edge to 50% across and 20% down: nothing important there, only sky, foliage or background.
· THE BOTTOM BAND, from 15% to 85% across and from 76% down to the bottom, is where the game's logo is laid on later: keep it simple and fairly dark (ground, shadow, a tumbling extra at most), no faces there.
· Nothing important in the outer twentieth on any side: stores crop.

COLOUR — bright, saturated and warm on the subject; cooler and calmer behind. The characters' own colours exactly as in their paintings.

THE VIEW — a dynamic, slightly low camera close to the action, as on a game box: the figures large, three-quarter views, real depth in the scene. (This picture is not seen from straight above like the game.)

STYLE — the same hand as every other picture in this game.
· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.
· ONE dark outline around every shape, in deep charcoal-violet (about #0F0C19, never pure black), brush-pen weight: at its heaviest about 2.5% of the panel's shorter side. Hold the picture at thumbnail size; if the outline has thinned to a hairline it is several times too thin.
· Cel shading in hard steps, no blending: a base tone, ONE shadow step (the base darkened by about a third and pushed toward blue-violet) and ONE lighter step. No airbrush, no smooth gradients, no photographic texture, no noise.
· Bright, saturated candy colours (saturation 60-85%, brightness 75-100%). Nothing muddy, grey or desaturated.
· One small, hard-edged white glint on anything metal, glass, gem or liquid.
· People are squat chibi: the head is nearly half the figure, large oval eyes with one white glint, tiny nose or none, mitten hands, no fingers.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. A sword, a ring, a flask or a rock gets the same outline, the same two-step shading and the same glint as a character.
· Light and energy are bold painted shapes: a white-hot core, the colour, a darker edge. A soft glow around a light source and a little atmosphere in the distance are allowed in this picture, never over the faces.
· This picture HAS its own ground, light and shadows, out to all four edges: cast shadows under the figures, rim light, atmosphere and depth. It is a finished illustration, not a cut-out on a background.
AVOID: realism, pixel art, thin technical line, muddy or grey colour, a busy background that competes with the subject, small faces, any text.

BEFORE YOU CALL IT FINISHED, check:
· There is not one letter, number or logo anywhere in the picture.
· Shrink it to 250 pixels wide: the hero's face and what is happening still read in a glance.
· The top-left corner and the lower left hold nothing important.
· Everybody in it is one of the characters listed above, in their own colours.

OUTPUT: one image, 768 x 1376 pixels (9:16, portrait). If your tool has an aspect-ratio control, set it to 9:16. PNG. No labels, captions, numbers or watermarks.
```

## Cover: the hero smashes the Goblin King (square)  (cover-sq-clash.png → ../store-art/covers/masters/cover-sq-clash.webp)

Attach, in this order: `art-sheets/painted/cover-clash.jpg`, `public/images/portraits/hero-tunic.webp`, `public/images/logo/mascot.webp`, `public/images/portraits/goblinKing.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED COVER IMAGE FOR A GAME STORE PAGE: A SINGLE DRAMATIC MOMENT, PAINTED EDGE TO EDGE, WITH NO TEXT OF ANY KIND.
One square image, 1024 x 1024 pixels (1:1).

WHAT IT IS NOT: no title, no logo, no lettering, no numbers, no speech bubbles, no buttons, no health bars, no interface, no border, no frame, no watermark. The game's name is added later, by the store and by us; painted text would collide with it.

THE HOOK: One huge hit: the hero's sword lands on the Goblin King, who is blown off his feet.
WHERE: a sunny forest clearing in the late afternoon: big round-canopied trees at both sides, warm light falling in from the top right, a dirt path across the grass.
THE MOMENT: the instant the sword connects: a bright starburst of impact between the two, sparks and grass flung outward, speed lines streaking from the hero toward the king.

WHO IS IN IT — exactly these, nobody else:
· a small goblin: bright green skin, big pointed ears sticking out sideways, a ragged brown tunic, a little steel dagger, tumbling head over heels out of the frame at the bottom left, cropped by the edge.
· a small goblin: bright green skin, big pointed ears sticking out sideways, a ragged brown tunic, a little steel dagger, flung away to the bottom right, cropped by the edge.
· the Goblin King (the attached portrait): bright green skin, huge pointed ears, a gold crown with one red jewel, a purple robe with a gold collar line and a red cape. He is knocked backwards off his feet, his wooden club flying out of his hand and his crown popping off his head. FACE: total shock, played for laughs: eyes enormous, pupils tiny, mouth wide open.
· the hero of the game (the attached portrait and the attached full figure): short tousled brown hair, a blue tunic with a gold collar line, a brown belt, brown boots and a red cape. Big in the frame, three-quarter view turned toward the viewer, both hands on a steel sword with a gold crossguard swung down and across at the king; the blade glows white-hot along its edge. FACE: a fierce, confident grin with teeth showing, eyebrows down, eyes on the king.

READ THE ATTACHED IMAGES:
· THE FIRST ATTACHED IMAGE IS THE FINISHED 16:9 COVER OF THIS SAME MOMENT. Paint it again for a square frame: the same characters, the same moment, the same expressions, light and colours, rearranged to fill this shape as the layout shows. Not a crop of it, not stretched, not a wider view with empty space: every figure is as big in the frame as the layout has it.
· The finished paintings attached first show what the characters look like and what "painted" means in this game: goblinKing, hero-tunic, and the full-figure hero (the mascot) for his body, clothes and proportions. Keep their faces, colours and costumes exactly; give them the pose and expression written above, not the one in the portrait.
· The LAST image is the layout: a flat stand-in for this cover. Take from it WHERE each figure, effect and prop is and HOW BIG; the round heads with painted faces are where those faces go. Take nothing else from it — it is stiff, evenly lit and has no atmosphere, and fixing that is the job.

WHAT MAKES IT GET CLICKED — each one is a check, not a mood:
· One subject, enormous: the hero and the action fill at least half the frame. Faces are BIG and the expression reads from across a room.
· The moment is mid-action, full of motion: a body leaning into it, speed lines, things flying outward.
· Maximum contrast where the eye lands: white-gold impact light against the king's purple robe and green skin. Those two colours meet there and nowhere else.
· Everything points at the hero's face and the action: bodies lean toward it, light falls on it, debris flies away from it.
· Three planes of depth: something large and cropped by the frame in front, the subject crisp in the middle, a simpler, softer background behind.
· A quiet edge and a bright centre: the background is simpler, darker and less saturated toward the corners.
· THE TOP-LEFT CORNER IS COVERED by the store's own badges, from the left edge to 50% across and 20% down: nothing important there, only sky, foliage or background.
· THE BOTTOM BAND, from 20% to 80% across and from 80% down to the bottom, is where the game's logo is laid on later: keep it simple and fairly dark (ground, shadow, a tumbling extra at most), no faces there.
· Nothing important in the outer twentieth on any side: stores crop.

COLOUR — bright, saturated and warm on the subject; cooler and calmer behind. The characters' own colours exactly as in their paintings.

THE VIEW — a dynamic, slightly low camera close to the action, as on a game box: the figures large, three-quarter views, real depth in the scene. (This picture is not seen from straight above like the game.)

STYLE — the same hand as every other picture in this game.
· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.
· ONE dark outline around every shape, in deep charcoal-violet (about #0F0C19, never pure black), brush-pen weight: at its heaviest about 2.5% of the panel's shorter side. Hold the picture at thumbnail size; if the outline has thinned to a hairline it is several times too thin.
· Cel shading in hard steps, no blending: a base tone, ONE shadow step (the base darkened by about a third and pushed toward blue-violet) and ONE lighter step. No airbrush, no smooth gradients, no photographic texture, no noise.
· Bright, saturated candy colours (saturation 60-85%, brightness 75-100%). Nothing muddy, grey or desaturated.
· One small, hard-edged white glint on anything metal, glass, gem or liquid.
· People are squat chibi: the head is nearly half the figure, large oval eyes with one white glint, tiny nose or none, mitten hands, no fingers.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. A sword, a ring, a flask or a rock gets the same outline, the same two-step shading and the same glint as a character.
· Light and energy are bold painted shapes: a white-hot core, the colour, a darker edge. A soft glow around a light source and a little atmosphere in the distance are allowed in this picture, never over the faces.
· This picture HAS its own ground, light and shadows, out to all four edges: cast shadows under the figures, rim light, atmosphere and depth. It is a finished illustration, not a cut-out on a background.
AVOID: realism, pixel art, thin technical line, muddy or grey colour, a busy background that competes with the subject, small faces, any text.

BEFORE YOU CALL IT FINISHED, check:
· There is not one letter, number or logo anywhere in the picture.
· Shrink it to 250 pixels wide: the hero's face and what is happening still read in a glance.
· The top-left corner and the lower left hold nothing important.
· Everybody in it is one of the characters listed above, in their own colours.

OUTPUT: one image, 1024 x 1024 pixels (1:1, square). If your tool has an aspect-ratio control, set it to 1:1. PNG. No labels, captions, numbers or watermarks.
```

## Cover: the hero smashes the Goblin King (tall)  (cover-tall-clash.png → ../store-art/covers/masters/cover-tall-clash.webp)

Attach, in this order: `art-sheets/painted/cover-clash.jpg`, `public/images/portraits/hero-tunic.webp`, `public/images/logo/mascot.webp`, `public/images/portraits/goblinKing.webp`, then the reference named in the heading.

```text
WHAT COMES BACK IS ONE FULL-BLEED ILLUSTRATED COVER IMAGE FOR A GAME STORE PAGE: A SINGLE DRAMATIC MOMENT, PAINTED EDGE TO EDGE, WITH NO TEXT OF ANY KIND.
One portrait image, 768 x 1376 pixels (9:16).

WHAT IT IS NOT: no title, no logo, no lettering, no numbers, no speech bubbles, no buttons, no health bars, no interface, no border, no frame, no watermark. The game's name is added later, by the store and by us; painted text would collide with it.

THE HOOK: One huge hit: the hero's sword lands on the Goblin King, who is blown off his feet.
WHERE: a sunny forest clearing in the late afternoon: big round-canopied trees at both sides, warm light falling in from the top right, a dirt path across the grass.
THE MOMENT: the instant the sword connects: a bright starburst of impact between the two, sparks and grass flung outward, speed lines streaking from the hero toward the king.

WHO IS IN IT — exactly these, nobody else:
· a small goblin: bright green skin, big pointed ears sticking out sideways, a ragged brown tunic, a little steel dagger, tumbling head over heels out of the frame at the bottom left, cropped by the edge.
· a small goblin: bright green skin, big pointed ears sticking out sideways, a ragged brown tunic, a little steel dagger, flung away to the bottom right, cropped by the edge.
· the Goblin King (the attached portrait): bright green skin, huge pointed ears, a gold crown with one red jewel, a purple robe with a gold collar line and a red cape. He is knocked backwards off his feet, his wooden club flying out of his hand and his crown popping off his head. FACE: total shock, played for laughs: eyes enormous, pupils tiny, mouth wide open.
· the hero of the game (the attached portrait and the attached full figure): short tousled brown hair, a blue tunic with a gold collar line, a brown belt, brown boots and a red cape. Big in the frame, three-quarter view turned toward the viewer, both hands on a steel sword with a gold crossguard swung down and across at the king; the blade glows white-hot along its edge. FACE: a fierce, confident grin with teeth showing, eyebrows down, eyes on the king.

READ THE ATTACHED IMAGES:
· THE FIRST ATTACHED IMAGE IS THE FINISHED 16:9 COVER OF THIS SAME MOMENT. Paint it again for a portrait frame: the same characters, the same moment, the same expressions, light and colours, rearranged to fill this shape as the layout shows. Not a crop of it, not stretched, not a wider view with empty space: every figure is as big in the frame as the layout has it.
· The finished paintings attached first show what the characters look like and what "painted" means in this game: goblinKing, hero-tunic, and the full-figure hero (the mascot) for his body, clothes and proportions. Keep their faces, colours and costumes exactly; give them the pose and expression written above, not the one in the portrait.
· The LAST image is the layout: a flat stand-in for this cover. Take from it WHERE each figure, effect and prop is and HOW BIG; the round heads with painted faces are where those faces go. Take nothing else from it — it is stiff, evenly lit and has no atmosphere, and fixing that is the job.

WHAT MAKES IT GET CLICKED — each one is a check, not a mood:
· One subject, enormous: the hero and the action fill at least half the frame. Faces are BIG and the expression reads from across a room.
· The moment is mid-action, full of motion: a body leaning into it, speed lines, things flying outward.
· Maximum contrast where the eye lands: white-gold impact light against the king's purple robe and green skin. Those two colours meet there and nowhere else.
· Everything points at the hero's face and the action: bodies lean toward it, light falls on it, debris flies away from it.
· Three planes of depth: something large and cropped by the frame in front, the subject crisp in the middle, a simpler, softer background behind.
· A quiet edge and a bright centre: the background is simpler, darker and less saturated toward the corners.
· THE TOP-LEFT CORNER IS COVERED by the store's own badges, from the left edge to 50% across and 20% down: nothing important there, only sky, foliage or background.
· THE BOTTOM BAND, from 15% to 85% across and from 76% down to the bottom, is where the game's logo is laid on later: keep it simple and fairly dark (ground, shadow, a tumbling extra at most), no faces there.
· Nothing important in the outer twentieth on any side: stores crop.

COLOUR — bright, saturated and warm on the subject; cooler and calmer behind. The characters' own colours exactly as in their paintings.

THE VIEW — a dynamic, slightly low camera close to the action, as on a game box: the figures large, three-quarter views, real depth in the scene. (This picture is not seen from straight above like the game.)

STYLE — the same hand as every other picture in this game.
· Chunky, rounded, toy-like forms. Simplify: few large shapes, no fine detail that vanishes at thumbnail size.
· ONE dark outline around every shape, in deep charcoal-violet (about #0F0C19, never pure black), brush-pen weight: at its heaviest about 2.5% of the panel's shorter side. Hold the picture at thumbnail size; if the outline has thinned to a hairline it is several times too thin.
· Cel shading in hard steps, no blending: a base tone, ONE shadow step (the base darkened by about a third and pushed toward blue-violet) and ONE lighter step. No airbrush, no smooth gradients, no photographic texture, no noise.
· Bright, saturated candy colours (saturation 60-85%, brightness 75-100%). Nothing muddy, grey or desaturated.
· One small, hard-edged white glint on anything metal, glass, gem or liquid.
· People are squat chibi: the head is nearly half the figure, large oval eyes with one white glint, tiny nose or none, mitten hands, no fingers.
· AN OBJECT WITH NO FACE IS NOT AN EXCEPTION TO ANY OF THIS. A sword, a ring, a flask or a rock gets the same outline, the same two-step shading and the same glint as a character.
· Light and energy are bold painted shapes: a white-hot core, the colour, a darker edge. A soft glow around a light source and a little atmosphere in the distance are allowed in this picture, never over the faces.
· This picture HAS its own ground, light and shadows, out to all four edges: cast shadows under the figures, rim light, atmosphere and depth. It is a finished illustration, not a cut-out on a background.
AVOID: realism, pixel art, thin technical line, muddy or grey colour, a busy background that competes with the subject, small faces, any text.

BEFORE YOU CALL IT FINISHED, check:
· There is not one letter, number or logo anywhere in the picture.
· Shrink it to 250 pixels wide: the hero's face and what is happening still read in a glance.
· The top-left corner and the lower left hold nothing important.
· Everybody in it is one of the characters listed above, in their own colours.

OUTPUT: one image, 768 x 1376 pixels (9:16, portrait). If your tool has an aspect-ratio control, set it to 9:16. PNG. No labels, captions, numbers or watermarks.
```
