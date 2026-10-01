# Playgama Wrap: "Standalone site" texts

Copy-paste text for the Wrap form in the Playgama developer console (see
Playgama's guide "Deploy with Playgama Wrap"). The images are in this folder;
`../README.md` maps every field to its file.

## Content

### Game Title

```
Mega Droid
```

### About Game (HTML is allowed)

```html
<p><strong>Rogue machines have overrun the city's sectors. Only Flux can win them back.</strong></p>
<p>Flux is a pearl-white combat android with glowing amber eyes and a cannon for a forearm. Every mission beams him into a freshly built sector: explore it room by room in first person, blast the machines in your way and take down the boss at the end.</p>
<p>Charge your cannon for big hits, block and parry incoming fire, and slide out of danger. Loot new gear, level up, wire fresh skills into your circuits, and win every boss's special weapon for yourself.</p>
<p>Built for quick action sessions and long upgrade runs alike: free in the browser on phone, tablet and desktop, in portrait or landscape, in 39 languages.</p>
```

### How to Play

```
Explore each sector, blast the machines, finish the mission goal, then beam out.

On desktop: move with WASD or the arrow keys and look with the mouse (click the game to take control; Esc gives the mouse back and pauses). Left click shoots; hold it to charge and let go to fire, and let go in the flash for a critical hit. Right click (or Shift) blocks: block right as the orange ring closes to parry. Space slides you out of the way of red rings, which can't be blocked. 1 and 2 fire special weapons, H repairs you fully, E opens chests and interacts, B beams you out, Tab switches target.

On phone and tablet: drag on the left side to move (or tap the floor to walk there) and drag on the right side to look. Tap to shoot, hold to charge and let go to fire. Hold the shield button to block and press it as the ring closes to parry. The buttons on the right slide, repair and fire special weapons.
```

### Game Features (one per line)

```
Robot action in first person: every mission builds a fresh sector to explore
Charge shots with a perfect-timing critical hit, shield blocks, parries and a dodge slide
7 kinds of rogue machines and 6 boss fights, each boss with its own attacks and a weak spot
5 special weapons won from bosses: fire, ice, lightning, wind and scrap
Gear in 4 rarities, Workshop upgrades and 18 skills on 3 circuit boards
Story missions plus endless jobs: hunt, recover, rescue, supply and purge
Autosave with mission resume, 3 difficulty levels, 39 languages, portrait or landscape
```

### FAQ (question / answer pairs)

1. **Is Mega Droid free?**
   Yes. It's free to play in your browser on phone, tablet and desktop. Optional short videos give you bonus bolts to spend in the Workshop.
2. **Does my progress save?**
   Yes, all by itself. Close the game in the middle of a mission and you pick up right where you left off.
3. **How do I beat a boss?**
   Watch the warning rings: block or parry the orange ones, slide away from the red ones, and hit back with fully charged shots. Every boss is weak to one special weapon.
4. **How do I land a critical hit?**
   Hold to charge your cannon. When the charge flashes, let go inside the flash.
5. **Why did my shield break?**
   Blocking uses Power. At zero Power your guard breaks and Flux is stunned for a moment, so let Power refill between blocks.
6. **Can I change the language or the difficulty?**
   Yes, in Options: 21 languages and three difficulty levels.

## Meta & SEO

### HTML Title (under 65 characters: 48)

```
Mega Droid: Robot Shooter Game, Play Free Online
```

### HTML Description (under 160 characters: 149)

```
Play Mega Droid free: beam into robot-overrun sectors as Flux, charge your cannon, loot gear and win every boss's special weapon. No download needed.
```

### Genres (the first is the main one)

```
Action
Shooter
Adventure
RPG
```

### Links to the game on other platforms (optional)

Leave empty for now; add each store or portal page once it is live.

## About Developer (your decision)

| Field | Placeholder |
| --- | --- |
| Developer name (nickname) or studio name | `[your name or studio]` |
| Developer website | `[https://your-site.example]` |

## Game Images

| Field | File | Size |
| --- | --- | --- |
| Horizontal game cover (hero), 16:9, min 1280 wide | `hero-1920x1080.png` | 1920×1080 |
| Game icon, 1:1 strict, min 512 (icon, favicon and PWA icon) | `icon-1024.png` (full-bleed; `icon-1024-rounded.png` if you prefer the rounded tile) | 1024×1024 |
| Open Graph share image, min 1280 wide | `share-1280x670.jpg` (97 KB; `share-1280x670.png` is the lossless twin) | 1280×670 (1.91:1) |
| Gameplay screenshots, 3 or more, min 1280 wide, each with a caption | `screens/1-charged-shot.png` … `screens/6-hub-flux.png`, captions below and in `screens/captions.md` | 1920×1080 each |

The hero has no logo on purpose: the site sets the Game Title as its heading,
and the image's left third is plain wall so the heading has room. The share
image carries the logo, because a link preview in a messenger is often all
anyone sees.

### Screenshots (`screens/`)

Each one is 1920×1080, from the real game with its HUD and English UI. Upload
them in this order, with these captions:

| # | File | What is happening | Caption |
| --- | --- | --- | --- |
| 1 | `screens/1-charged-shot.png` | Volt Tower: a charged cannon shot about to hit a striding Guardroid | Charge your cannon and blast rogue machines |
| 2 | `screens/2-parry.png` | Cryo Plant: the warning ring closes over a Guardroid's combo, the shield is up: the parry moment | Block and parry right as the warning ring closes |
| 3 | `screens/3-scrapper-boss.png` | Scrapyard arena: a charged shot lands on the Scrapper ("PERFECT!"), "Defeat Scrapper" objective | Take down each sector's boss |
| 4 | `screens/4-flame-wave.png` | Vex Fortress: a Flame Wave fireball rolls into a Guardroid | Win boss weapons: fire, ice, lightning, wind and scrap |
| 5 | `screens/5-supply-chest.png` | Sky Docks: a legendary supply chest opens with its gold rarity beam | Crack open supply chests for new gear |
| 6 | `screens/6-hub-flux.png` | Hub: Flux on the teleporter pad beside the Flux tab (gear, cannons, upgrades) | Upgrade your gear and wire new skills |

## Marketing & Ads tab

### app-ads.txt

Playgama's Wrap guide describes this field ("the `app-ads.txt` contents served
at the root of your domain", filled in when you need it rather than before the
first publish) but publishes no lines for it. Playgama does serve its own
`https://playgama.com/app-ads.txt` (87 lines, owner domain playgama.com); a
dated snapshot is in `app-ads.reference.txt` for reference only. Do not paste it
as it stands: its `OWNERDOMAIN=playgama.com` line would be wrong on your
domain. Ask Playgama (developer.success@playgama.com) which lines a Wrap site
should carry, and leave the field empty until then.

### Tracking

Only needed for paid campaigns (Playgama's "Buy traffic for your site"): tick
Enable Meta Pixel and paste the numeric pixel ID (15 or 16 digits), and/or
tick Enable Google Tag and paste a `G-`, `GT-` or `AW-` ID. Leave both off
until you run ads.
