# Store art

What leaves the game: the store covers, the logo lockup and the app icons.

| folder / file | what | made by |
|---|---|---|
| `brand/logo-final.mjs` | the code-drawn lockup (emblem + BATTLE / CROSS) and `emblem.svg` | `pnpm icons` |
| `brand/splash-tile.mjs` | the boot splash's scrolling tile | by hand, `node store-art/brand/splash-tile.mjs` |
| `covers.mjs` | every cover deliverable, cut from the painted masters | `node store-art/covers.mjs` |
| `covers/masters/` | the slicer's preview copy of each painted master | the Art Desk / `pnpm art:slice` |
| `covers/<scenario>/` | the deliverables per scenario, plus `contact-sheet.jpg` | `covers.mjs` |

The covers are painter targets like the in-game art: `src/game/art/coverScenes.ts`
holds the four scenarios (layout, focal box, logo box, crops), the manifest turns
them into references and prompts (`art-sheets/cover-*.png`, `PROMPTS-COVERS.md`),
and the Art Desk paints them. The painting itself (`art-sheets/painted/cover-*.jpg`)
is the master the deliverables are cut from.

## The brief: what gets a cover clicked (roadmap #1)

A portal shows a cover as a small tile, among forty others, for a fraction of a
second. Every rule below is something a 200–300 px tile keeps.

### What the stores ask for

- **CrazyGames** wants three covers (16:9 1920×1080, 2:3 800×1200, 1:1 800×800),
  consistent with each other. They should be "creative" rather than a
  screenshot, and uncluttered: "Over-cluttered covers are hard to scan,
  especially on small screens." The only text allowed is the game's title, and
  no borders, store logos or "New / Play now" copy.
  ([docs: game covers](https://docs.crazygames.com/requirements/game-covers/))
  CrazyGames lays its own badges ("Hot", "New", "Updated") over the
  **top-left corner, out to the middle**, so nothing that matters may sit
  there (`CG_BANNER` in `coverScenes.ts`).
- **Poki** says "Avoid text. Skip titles and other text and let the visuals
  carry it"; text on small tiles "performs worse in testing". It asks for "one
  clear foreground object, a main character or a key gameplay element, not a
  collage", the main character "in their default skin", dynamic movement over
  static poses, strong contrast, and a simple, clean background. Avoid colours
  close to Poki's own background (#83FFE7). Their CTR metric is graded on the
  thumbnail.
  ([Poki: game thumbnail](https://developers.poki.com/guide/game-thumbnail))
- **Steam** capsules: one focal character or object, high contrast, minimal
  clutter, and a logo that "should nearly fill the small capsule" and stays
  legible at 120×45. No text but the title, no quotes or awards.
  ([Steamworks: store assets](https://partner.steamgames.com/doc/store/assets/standard),
  [presskit.gg capsule guide](https://presskit.gg/field-guides/steam-capsule-art-guide),
  [bugnet: capsules that get clicks](https://bugnet.io/blog/how-to-make-a-steam-capsule-that-gets-clicks))

### What tests have measured

- **A face with a strong expression wins.** Icon A/B tests for mobile games
  keep finding the "action mouth": characters with an open mouth beat the same
  character with the mouth closed. MyTona's tests moved conversion +9.1% with
  a smiling witch and +9.3% with a pumpkin head over a serious face.
  ([SplitMetrics: MyTona](https://splitmetrics.com/cases/mytona-app-icons-halloween-update),
  [SplitMetrics: the pumpkin variation](https://splitmetrics.com/blog/investigate-the-mystery-of-why-the-pumpkin-variation-won/))
- **The face alone is not enough; the game's action is.** Towerlands tested
  "angry guy yelling" icons (copying Clash of Clans) against gameplay
  pictures: a character defending the tower, doing the game's own verb, won.
  ([Asodesk: Towerlands icon tests](https://asodesk.com/blog/from-angry-guy-yelling-to-game-graphics-a-b-testing-of-the-towerlands-app-icon/))
- **Show what is inside.** Poki warns that a thumbnail which does not look
  like the game loses players after the click: "players will feel like they've
  been directed to a wrong game". The cover's characters are the game's own
  (the painted hero, the Goblin King, the void dragon), in the game's
  painted style.

### The rules every scenario follows

1. **One hero, big, with a readable face.** Faces at about a third of the
   frame height. The expression is exaggerated: open mouth, big eyes.
2. **The game's verb, mid-action.** A swing, a cast or a chest bursting open,
   at the instant it happens, with speed lines and debris pointing at it.
3. **Contrast where the eye lands.** Two saturated, opposing colours meet at
   the focal point and nowhere else; the corners are calmer and darker.
4. **The right half carries the picture** (the badges cover the top-left),
   and the logo goes in the lower left, never the top left.
5. **No text in the painting.** The logo is composited by code (the painted
   badge plus the code-drawn BATTLE / CROSS), on the "with logo" variants only.
6. **Readable at 200 px and at 400×225.** The contact sheets show every size,
   and the comparison sheet shows each cover at 200–300 px on light and dark
   portal backgrounds, under a mock badge.
7. **Each aspect is its own composition.** A 1:1 or 9:16 is painted for the
   winning scenario rather than cut out of the 16:9; until then those sizes
   fall back to a focal-box crop, flagged as such.

### The four scenarios (`coverScenes.ts`)

| stem | hook | why it should work |
|---|---|---|
| `cover-clash` | the hero's sword smashes the Goblin King off his feet | the core verb (fight a boss), two big faces with opposite emotions, one impact point |
| `cover-skills` | fire in one hand, lightning in the other, the eight class colours wheeling behind | the unique selling point (mix eight classes), a yelling face, two contrasting energies |
| `cover-loot` | a legendary sword erupts in a golden beam from a chest; the hero gasps with joy | the reward moment (proven in loot games), gold against cool blue, an open-mouth face |
| `cover-dragon` | the void dragon rears up behind a grinning hero | scale and danger, a cocky face, sunset orange against violet |

The roadmap suggested a world-map vista as one hook. It was replaced by the
dragon: every source above ranks a single big subject over a panorama, and a
vista's small figures are the first thing lost at 200 px.

## The paintings, scored (2026-10-03)

Scored from `covers/comparison-dark.jpg` / `comparison-light.jpg` (each cover at
280 px, 1:1 at 200 px and 160 px, under a mock badge) against the rules above,
1 to 5. The baseline is a gameplay screenshot: Battlecross never had covers of
its own (the ones in git history are the predecessor game's).

| | focal clarity | face + emotion | the game's verb | contrast | reads at 160 px | badge corner clear | total |
|---|---|---|---|---|---|---|---|
| **loot** | 5 — beam + face, nothing else | 5 — biggest face, star eyes, open mouth | 4 — loot, not combat | 5 — gold on cool violet | 5 | 4 — a goblin near, not under it | **28** |
| **clash** | 4 — two figures, one impact | 4 — grin vs. shock, two faces | 5 — fighting a boss | 3 — green on green | 4 | 4 — the club flies through it | **24** |
| dragon | 4 — dragon + hero | 3 — smaller face | 3 — a threat, no action yet | 4 — violet vs. sunset | 4 | 1 — the dragon's head is UNDER it | 19 |
| skills | 2 — orbs, bolts, goblin, columns | 3 — small face, on the left | 4 — the class pitch | 3 — busy violet | 2 — mush | 3 | 17 |
| baseline | 1 | 1 — no face | 3 | 2 | 1 | 3 | 11 |

Recommendation: **loot** as the cover, with **clash** as the B side of an A/B
test: two genuinely different hooks (the reward vs. the fight), both with a
big, readable face. Dragon would rank third, but its head sits exactly where
CrazyGames lays its badges; skills is too busy to read below 300 px.

Their square and tall versions are painted from the finished 16:9 rather than
cropped from it (`cover-sq-loot`, `cover-tall-loot`, `cover-sq-clash`,
`cover-tall-clash`); until then those sizes are focal crops of the 16:9.

## Measuring it for real

A sheet can rank covers against the brief; only an A/B test on the portal
measures CTR. Two portals offer one:

- **Poki** runs thumbnail tests during the soft release / web-fit stage and
  grades CTR on the thumbnail. Upload the alternative thumbnail in Poki for
  Developers and ask Developer Support to run it against the current one;
  after launch, a thumbnail change needs their approval.
  ([Poki: game thumbnail](https://developers.poki.com/guide/game-thumbnail))
- **CrazyGames** documents no self-serve cover test. Replace the covers in
  the developer portal (they advise refreshing covers after publication),
  and compare the game page's impression-to-play rate over equal windows
  before and after, or ask the CrazyGames account manager for a split test.
- **Yandex Games** has a built-in icon/cover A/B test, if the game ships there.
  ([Yandex Games: A/B testing of icons](https://yandex.com/dev/games/doc/en/concepts/ab-test))

Run one change at a time (the cover, not the cover and the title), for at least
a week or until the portal calls significance, on the same traffic.
