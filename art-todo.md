# Art to-do: what a painted file replaces

Everything the game draws today is made in code: low-poly rigs, vector icons,
canvas textures. That is the placeholder set. A file dropped into `public/`
under the name of the thing it replaces takes over at the next build, with no
code change (`src/game/assets/overrides.ts`; the folders are scanned by
`assetOverridesPlugin` in `vite.config.ts`).

Rules for every file:

- `.webp` preferred (`.png` / `.jpg` are read too). The file NAME is the id
  in the tables below, exactly, case included: `ironBroadsword.webp`.
- Square, transparent background for icons. The pipeline (`art-sheets/README.md`)
  writes them at **192 × 192** (drawn at 40 to 72 px, so 192 covers 2.5×
  screens); a hand-made file may be up to 256. Portraits the same, head and
  shoulders, cut to the bust with no margin under it.
- Run `pnpm compress-folder-with-backup` afterwards (originals go to the gitignored `public-backup/`, never beside the art, or they would ship). The compressor's
  `*-original.*` backups are ignored by the build.
- Style: GDD §2 and `game-and-feel-reference.jpg`. Chunky, cute, low-poly,
  two-tone cel shading, thick dark outline (RGB 15, 12, 25), no gradients
  that fight the cel look, readable at 40 px.

The painter's round trip (reference sheets cut from the game's own drawings,
prompts, slicer) is in [`art-sheets/README.md`](./art-sheets/README.md):
`pnpm art:export`, `pnpm art:desk`, `pnpm art:slice`, `pnpm art:status`.

Check a drop: start `pnpm dev`, open `/#/models` → **Painted vs drawn**, or
the bag / a trainer / the map. A file
that fails to decode keeps the placeholder and logs one warning.

## Item icons — `public/images/items/<id>.webp` (62)

The frame colour around the icon is the tier's and stays code-drawn; paint
the object only. Head, hands and feet (decision D39) are on two sheets of
their own, `sheet-items-headgear` and `sheet-items-boots`: one empty helmet,
ONE glove (fingers up) or ONE boot (from the side) per icon, never worn.

| Slot | Ids |
| --- | --- |
| Main hand (14) | `rustedShortsword` `apprenticeStaff` `scoutsHandgun` `ironBroadsword` `vipinsStiletto` `aetherCarbine` `ashenGreatsword` `archmageWand` `chronoBlade` `bloodForgedAxe` `voidCannon` `dragonSmasher` `bladeOfTheUnbound` `aetheriumDestroyer` |
| Off hand (8) | `woodenBuckler` `tomeOfNovices` `ironShield` `syringeOfTheAdept` `aethericBattery` `aegisTowerShield` `orbOfEternalFlame` `shieldOfTheFallen` |
| Head (6) | `quiltedCap` `stalkersHood` `ironcladHelm` `seersCirclet` `wyrmguardGreathelm` `hatOfTheStarweaver` |
| Body (12) | `paddedTunic` `leatherDoublet` `chainmailVest` `scholarsRobe` `reinforcedPlate` `assassinsGarb` `chronoWeaverCloak` `bloodSoakedPlate` `exoArmorChassis` `dragonscaleHauberk` `vestmentsOfSovereign` `armorOfTheTitan` |
| Hands (6) | `hideGloves` `ironGauntlets` `emberweaveGloves` `duelistsGrips` `voidforgedGauntlets` `gripsOfTheTempest` |
| Feet (6) | `trailBoots` `pathfindersBoots` `forgeplateGreaves` `mistwalkerBoots` `stormstrideGreaves` `treadsOfTheHorizon` |
| Trinket (10) | `copperBand` `ringOfMending` `bandOfSwiftness` `castersEmblem` `infiltratorsCharm` `timekeepersHourglass` `ringOfTheVampyre` `sovereignsSignet` `heartOfTheMountain` `ringOfAbsolutePower` |

## Skill icons — `public/images/skills/<id>.webp` (48)

Square for active skills, the same square for passives (the game masks a
passive to a circle). One accent colour per class.

| Class (accent) | Ids, in unlock order |
| --- | --- |
| Aegis Knight (gold `#ffd84a`) | `shieldSlam` `aegisAura` `radiantStrike` `fortitude` `tauntingCry` `holyBastion` |
| Shadowblade (violet `#9c7bff`) | `shadowstep` `lethality` `venomousBlade` `evasion` `smokeBomb` `danceOfBlades` |
| Pyromancer (orange `#ff7a3a`) | `fireball` `cauterize` `flamePillar` `pyromaniac` `combustion` `cataclysm` |
| Grand Sovereign (amber `#ffb04a`) | `royalGuard` `inspiringPresence` `commandFocus` `sovereignsTribute` `bannerOfVictory` `armyOfTheRealm` |
| Chrono-Weaver (cyan `#5fd8ff`) | `temporalStasis` `hasteField` `timeDistort` `paradoxShift` `entropy` `chronoRewind` |
| Blood Alchemist (crimson `#ff4a6a`) | `sanguineFlask` `bloodTransmutation` `essenceHarvest` `hemophilia` `mutagenicRage` `philosophersCrucible` |
| Aether-Tech (teal `#4ff0c8`) | `aetherPistol` `deployTurret` `ventHeat` `thermalOverload` `orbitalBeam` `exoSuit` |
| Geomancer (sand `#c79a5a`) | `stoneSpike` `earthBarrier` `seismicShock` `earthenSkin` `petrify` `tectonicRupture` |

Content note: the Blood Alchemist reads as alchemy (vials, red "essence"),
never as gore or self-harm. Portals rate this game for 13 and under.

## Portraits — `public/images/portraits/<look>.webp`

Shown round, in dialogues, shops, trainers and the hero frame.

- The hero: `hero` (one portrait; the code-drawn one follows the gear worn).
- Quest speakers: `goblinKing` `warlord` `dwarf` `oracle` `dragon` `archDemon`
- Townsfolk: `smith` `peddler` `elder` `healer` `goblinTrader` `fence` `tinker`
  `captain`
- Trainers: `trainerAegis` `trainerShadow` `trainerPyro` `trainerSovereign`
  `trainerChrono` `trainerBlood` `trainerAether` `trainerGeo`

## UI — `public/images/ui/<name>.webp`

| Name | What | Size |
| --- | --- | --- |
| `map` | The world map's terrain: sea and coast, the regions, rivers, bridges, the roads' beds and the sixteen bare sites (drawn by `src/components/screens/map/terrain.ts` until this file exists). The landmarks, the travelled roads, the names, the clouds and everything that moves are drawn over it by the game, so the sites stay EMPTY; they stand at `MAP[].at` in `src/game/data/zones.ts`, as fractions of the sheet | 1376 × 768 from the pipeline (any 16:9 up to 2048 wide), stretched to the sheet |
| `coin` | The gold coin beside every price | 64 × 64 from the pipeline (up to 128) |
| `bg-trade` | The trade table's backdrop (merchant, trainer, healer): honey-brown counter planks with a teal cloth runner down the middle; a lantern, a ledger and coins on the left, brass scales, weights and a purse on the right. Drawn by `src/components/game/backdrops.ts` until this file exists; reference `art-sheets/bg-ui-trade.png` | 1376 × 768 from the pipeline (any 16:9 up to 2048 wide), shown `cover` |
| `bg-inventory` | The equipment page's backdrop (and the character page's): the inside of an open satchel, green quilted lining in a stitched leather rim, two straps over the top; a weapon rack on the left, an armour stand on the right. Reference `art-sheets/bg-ui-inventory.png` | as `bg-trade` |
| `bg-skills` | The skills page's backdrop: a star codex, indigo sky in a brass frame with the eight class gems down its sides; constellations at the sides, faint astrolabe rings in the middle. Reference `art-sheets/bg-ui-skills.png` | as `bg-trade` |
| `skill-frame` | The frame of a battle skill button (`FSocket`, square): an ornate metal-and-gem socket drawn OVER the skill's icon. The centre window is transparent (the icon, the cooldown sweep and the glass highlight show through it); the gem on the crown may stand up to 5 % above the square. Neutral metal: the class colour stays in the icon | 256 × 256, transparent; window = the centre 70 % (a rounded square, corner radius 16 % of the frame) |
| `skill-frame-potion` | The frame of the two belt flasks (`FSocket`, round): a round glass-and-metal socket with a corked neck on top, drawn over the liquid. Used for both the health and the mana flask (the liquid and the emblem carry the colour) | 256 × 256, transparent; window = a centred circle, 70 % of the frame |
| `bar-frame-plain` | A plain bar's frame (a normal enemy's health, the travel bar). Three-sliced: the two 64 px end caps keep their shape, the 384 px middle stretches to the bar's length. The bar itself shows through the window; keep the paint within 16 px above and below it | 512 × 128, transparent; window = 384 × 32, centred |
| `bar-frame-hero` | The hero's health frame: gold, a heart on the left cap, a finial on the right | as `bar-frame-plain` |
| `bar-frame-mana` | The hero's mana frame: silver, a drop on the left cap | as `bar-frame-plain` |
| `bar-frame-elite` | A locked elite's frame: silver, a wing on each cap | as `bar-frame-plain` |
| `bar-frame-champion` | A champion's frame: gold, a crest over the middle (it may use the full 48 px above the window), pointed caps | as `bar-frame-plain` |
| `bar-frame-boss` | The boss plate's frame, the most ornate: a crown between horns over the middle (the full 48 px above the window), a wing and a gem on each cap | as `bar-frame-plain` |

The three screen backdrops are shown `cover`: a phone held upright sees only
the middle quarter of the sheet, a desktop all of it. THE CONTENT-SAFE AREA:
the middle 44 % of the width (x 28 % to 72 %) is always under the interface's
panels and lettering, so it stays one calm, even surface with no objects; the
objects live in the outer 28 % at each side, and nothing important sits in
the top 12 % (the screen's bar of tabs and buttons). The bench's key sheets
(`bg-ui-*-key.png`) mark both bands.

The frames are drawn in code until a file exists (`src/components/atoms/FSocket.vue`,
`FBar.vue`); a file dropped in replaces the drawn frame only, never the fill, the
ticks or the icon. The experience bar has no frame to paint (ticks only).

## Textures — `public/images/textures/<name>.webp`

| Name | What |
| --- | --- |
| `ground` | Tiling GREYSCALE detail multiplied over each zone's ground colours (256 × 256, must tile, average brightness about 90 %) |

## Not replaceable by a file (yet)

- **3D characters and props.** The rigs are built in code
  (`src/game/gfx/rigs`, `terrain.ts`) to GDD §2.1's budgets. Replacing them
  with authored `.glb` models needs a loader seam; it is not a drop-in.
- **Status icons** (33, `src/components/art/glyphs.ts`, `status.*`): vector
  only. Add a `statuses` folder to `OVERRIDE_DIRS` in `vite.config.ts` and a
  `STATUS_ART` map next to `SKILL_ART` when painted ones exist.
- **The logo and app icons**: generated, see `store-art/brand/logo-final.mjs`
  and `pnpm icons`.

## Store art (not in the bundle)

Cover images and thumbnails per portal are tracked in `roadmap.md` (#1, #21).
The gameplay clips come from `pnpm preview:video`.
