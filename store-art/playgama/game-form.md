# Playgama game form: texts

Copy-paste text for the game form in the Playgama developer console (the MCP
tool `update_application_form` takes the same fields). The covers are in
`covers/`; see `README.md` for which file goes in which slot.

No branding in anything below: Playgama may forward the game to YouTube
Playables, which forbids "any branding or logos in the thumbnails,
description, or title". So there is no studio name, no portal names and no
links; the game title itself is allowed. Keep it that way when you edit.

## Title

```
Mega Droid
```

It must match the title shown in the game, which is "Mega Droid" in every
one of the 39 languages (the `gameName` key). Playgama's moderation checklist
rejects a game whose name differs between the game and the draft.

## Short description (one line, 129 characters)

```
Beam into robot-overrun sectors as Flux, a pearl-white combat android. Charge your cannon, loot gear and win every boss's weapon!
```

## Description

```
Rogue machines have overrun the city's sectors, and only Flux can win them back. Flux is a pearl-white combat android with glowing amber eyes and a cannon for a forearm. Every mission beams him into a freshly built sector: explore it room by room in first person and blast drones, stompers and hulking guardroids on the way to the boss.

Hold to charge your cannon and let go in the flash for a critical hit. Raise your shield to block, time it as the warning ring closes to parry, and slide out of the way of anything you can't block. Crack open supply chests for new gear, level up, plug skill chips into three circuit boards and upgrade your kit in the Workshop. Beat a sector's boss to win its special weapon: fire, ice, lightning, wind or scrap.

Story missions, endless jobs and three difficulty levels. Your progress saves by itself, and it plays in 39 languages, in portrait or landscape, on phone, tablet and desktop.
```

## How to play

```
Explore each sector, blast the machines, finish the mission goal, then beam out.

Desktop
- WASD or arrow keys: move
- Mouse: look around (click the game to take control; Esc gives the mouse back and pauses)
- Left click: shoot. Hold to charge, let go to fire. Let go in the flash for a critical hit
- Right click (or Shift): block. Block right as the orange ring closes to parry
- Space: slide. Red rings can't be blocked, so slide away from them
- 1 / 2: special weapons
- H: full repair
- E: open chests, rescue, interact
- B: beam out when the mission is done
- Tab: switch target

Phone and tablet
- Drag on the left side to move, or tap the floor to walk there
- Drag on the right side to look around
- Tap to shoot, hold to charge, let go to fire
- Hold the shield button to block; press it as the ring closes to parry
- Use the buttons on the right to slide, repair and fire special weapons
```

## Genres and tags

- Genres (main first): Action, Shooter, Adventure, RPG
- Tags: robots, shooter, first-person, 3D, sci-fi, action RPG, loot, boss fights, upgrades, casual

## Game languages (all 23 of the form's list)

The game ships 39 locales (the Playgama + Wavedash portal set) and picks the
player's language by itself. Tick every one the form's list offers — the game
covers all 23 (`supportedLanguages` enum):

| Language | Enum | Language | Enum | Language | Enum |
| --- | --- | --- | --- | --- | --- |
| English | EN | Hindi | HI | Portuguese (Brazil) | PT_BR |
| Arabic | AR | Indonesian | ID | Portuguese (Portugal) | PT_PT |
| Azerbaijani | AZ | Italian | IT | Russian | RU |
| Chinese (Simplified) | ZH | Japanese | JA | Spanish | ES |
| Dutch | NL | Kazakh | KK | Thai | TH |
| French | FR | Korean | KO | Turkish | TR |
| German | DE | Polish | PL | Ukrainian | UA |
| Uzbek | UZ | Vietnamese | VI | | |

The other 16 locales (Swedish, Norwegian, Danish, Finnish, Catalan, Galician,
Czech, Croatian, Romanian, Hungarian, Latvian, Lithuanian, Esperanto, Greek,
Bulgarian, Chinese (Traditional)) are not on Playgama's list; players reach
them through the portal language or the in-game picker.

## Other form settings

| Field | Value |
| --- | --- |
| Screen orientation | landscape AND portrait (`isHorizontal: true`, `isVertical: true`) |
| Supported devices | Desktop, Android, iOS |
| Game features: leaderboards | off. The Playgama build ships a baked rank chip, not a Playgama board (`.env.playgama`). Switch it on only after creating a board in the console |
| Game features: multiplayer / social | off |
| Game engine | Custom HTML5 (Vue 3 + three.js) |
| Link to the game elsewhere | leave empty until another store page is live |
| Distribution | your call: all partner platforms, or exclude some |
