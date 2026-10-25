# Battlecross — App Store Connect answers

Prepared 2026-10-26 so the app record, listing and questionnaires can be filled in one sitting.
Source of truth for ads: `ADS_STATE.md`. Source of truth for screenshots: `src/assets/promotion/stores/README.md`.

## App record (created by the Fastfile on the first `iOS Build & Sign`, or by hand)

| Field | Value |
|---|---|
| Name | Battlecross |
| Bundle ID | `com.hyperg8.battlecross` (permanent) |
| SKU | `hyperg8-battlecross` |
| Primary language | English (U.S.) |
| Platforms | iPhone (iPad optional: the 2752x2064 shots exist for 01, 03, 04) |
| Orientation | Landscape |
| Primary category | Games, sub-category Role Playing |
| Secondary category | Games, sub-category Action |
| Price | Free (see "Decision: the full-version unlock" below) |
| Availability | All countries, as on Play |

## Blockers on the Apple side (owner only)

1. **Updated Apple Developer Program License Agreement** must be accepted by the Account Holder (banner on every App Store Connect page). New apps cannot be created until then.
2. **EU Digital Services Act trader status** (Business → Compliance): required to sell in the EU.
3. Business → Agreements: a Paid Apps agreement + bank and tax info are needed if the full-version unlock is sold (IAP). Free-only needs none of this.

## Listing text (same copy as the Play listing)

- **Subtitle (30):** `Action RPG, any skill, any hero`
- **Promotional text (170):** `Mix skills from 8 classes into your own hero. Fight goblins, demons and dragons, and make choices that reshape the realm.`
- **Description:** use the full description from `description.md`/the Play listing (4000 max).
- **Keywords (100):** `rpg,action,hero,dragon,skills,fantasy,loot,boss,quest,offline`
- **Support URL:** `https://konstantinsteinmiller.github.io/hyperg8/`
- **Marketing URL:** same
- **Privacy Policy URL:** `https://konstantinsteinmiller.github.io/hyperg8/?battlecross-privacy-policy-en=true`
- **Copyright:** `2026 Konstantin Steinmiller`
- **What's new (first version):** `First release.`

## Screenshots (landscape)

| Device slot | Size | Files |
|---|---|---|
| iPhone 6.9" | 2868x1320 | `0X-*-2868x1320.png` (order 03, 01, 04, 07, 02, 06, 08, 05) |
| iPad 13" (only if iPad is supported) | 2752x2064 | 01, 03, 04 (add more before submitting for iPad) |

Apple scales the 6.9" set down for the smaller iPhone slots. Up to 10 per slot.

## Age rating questionnaire (answer truthfully; the result is what Apple assigns)

| Question | Answer |
|---|---|
| Cartoon or fantasy violence | **Frequent/Intense** (combat is the core loop; unrealistic, no gore) |
| Realistic violence | None |
| Prolonged graphic or sadistic realistic violence | None |
| Profanity or crude humor | None |
| Mature/suggestive themes, sexual content or nudity | None |
| Horror/fear themes | Infrequent/Mild (dark zones, demons, bosses) |
| Medical/treatment information | None |
| Alcohol, tobacco or drug use or references | **Infrequent/Mild** (tavern NPCs drink and smoke in town idle animations) |
| Simulated gambling | **Infrequent/Mild** (town mini-games Whack-a-Imp, Ring Toss, cups game stake in-game gold only) |
| Real-money gambling / contests / loot boxes paid with real money | None |
| Unrestricted web access | No |
| User-generated content | No |
| Messaging / chat between users | No |
| Parental controls / age assurance | No |
| Health or wellness topics | No |

Expected result: 13+ or 12+ (frequent fantasy violence). The target is "the earliest group below 18 that is accepted"; not Made for Kids and not the Kids category.

## App Privacy ("nutrition label")

Collected data (all **not linked to the user's identity**, **not used for tracking**; the app never shows the ATT prompt and never reads IDFA):

| Data type | Purposes |
|---|---|
| Coarse location (IP-derived) | Third-party advertising, analytics |
| Identifiers: Device ID (IDFV) | Third-party advertising, analytics, app functionality |
| Identifiers: User ID (random leaderboard id) | App functionality |
| Usage data: Product interaction | Third-party advertising, analytics |
| Usage data: Advertising data | Third-party advertising |
| Diagnostics: Crash/performance data | App functionality, analytics |
| Other: leaderboard nickname (not a name) | App functionality |

Tracking: **No** (no ATT, no IDFA). Mirror this exactly in the Info.plist: no `NSUserTrackingUsageDescription`, no `AppTrackingTransparency` use. (Roadmap #Store-15 originally assumed ATT; this file supersedes it, following Chaos Arena.)

## Export compliance

- Uses encryption: **Yes, only standard HTTPS/TLS** → exempt. In Info.plist `ITSAppUsesNonExemptEncryption = false`. No export documents needed.

## App Review information

- Sign-in required: **No**. No demo account.
- Contact: Konstantin Steinmiller, `konstantin.steinmiller@gmail.com`, phone (owner to enter).
- **Notes for the reviewer:**
  "Battlecross is a single-player action RPG. No account or login. Ads (Unity LevelPlay: AdMob, Unity Ads, ironSource) are shown on a result screen between fights and as optional rewarded videos (revive, triple gold, shop refresh). The game never asks for tracking permission. In EEA/UK/CH a Google consent form appears on first launch; it can be reopened in Options > Privacy settings. A leaderboard sends an anonymous random id and a nickname to our server."

## Decision: the full-version unlock (roadmap #Store-IAP)

The roadmap line asks for a free demo (playable to the Goblin King) and a 2.99 USD "Unlock full version" purchase on iOS. That needs an **In-App Purchase product** (non-consumable), a StoreKit plugin in the Tauri iOS build, a restore-purchases button, and the Paid Apps agreement. None of that exists yet. Until it does, submit iOS as **free, fully playable**, or hold the iOS submission until the unlock is built. If the unlock is added: privacy label gains "Purchases", age rating "In-App Controls: Purchasing", and the listing must say "Contains in-app purchases".
