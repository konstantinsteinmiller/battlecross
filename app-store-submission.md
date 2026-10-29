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
- **Description:** use the full description from `description.md`/the Play listing (4000 max), plus, on iOS only, the closing paragraph `Free to play up to the Goblin King. One in-app purchase unlocks the full game and removes all ads.`
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

Decided and built: the iOS app is a **free demo** (playable up to and including the Goblin King) and the rest of the game is a one-time **In-App Purchase**. The listing therefore says "Contains in-app purchases", the privacy label gains **Purchases** (not linked to identity, not tracking), and the age-rating questionnaire answers **In-App Controls: Purchasing = yes**. The Paid Apps agreement plus bank and tax info (Business > Agreements) must be active before the product can be sold. Android, the web portals and the desktop build stay fully free; the lock is off there (see "How it is built").

## In-App Purchase

| Field | Value |
|---|---|
| Product id | `com.hyperg8.battlecross.fullversion` (also `FULL_VERSION_PRODUCT_ID` in `src/game/data/fullVersion.ts` and the Swift plugin) |
| Type | **Non-Consumable** |
| Reference name | `Battlecross Full Version` (internal, 2-64 chars) |
| Price | Tier equal to 2.99 USD (Apple derives the other storefronts). The game shows whatever StoreKit returns for the storefront, never a fixed currency string. |
| Family Sharing | off (can be switched on later, not off again) |
| Availability | all countries, as the app |
| en-US display name (30 max) | `Full Version` |
| en-US description (55 max in the sheet) | `All lands, bosses and quests. No more ads.` |
| de-DE display name | `Vollversion` |
| de-DE description | `Alle Länder, Bosse und Quests nach dem Goblinkönig. Ein Kauf.` |
| Review screenshot | Same sizes as an App Store screenshot: use **2868x1320** (iPhone 6.9" landscape, the game's orientation) showing the "Unlock full version for ..." modal. Taken from a StoreKit-configured simulator or a sandbox build. |
| Review notes (IAP) | see below |

The first IAP must be submitted **together with a new app version** (select it in the version page under "In-App Purchases and Subscriptions"). Status must read "Ready to Submit" before that.

### What the reviewer needs

Reviewer note to paste into App Review Information:

> "Battlecross is a free demo that ends after the first boss (the Goblin King, in the Goblin Hollows, the second zone). Beating him and closing the result screen shows an offer to unlock the full version (one-time non-consumable In-App Purchase, com.hyperg8.battlecross.fullversion). Tapping a locked place on the world map shows the same offer. The offer has an Unlock button, a Restore purchases link and a Not now button. There is no demo account."

Open owner decision: a reviewer starting a fresh save has to play to the Goblin King (a few fights) to see the offer. If a faster route for the reviewer is wanted, say so and one can be added; none exists yet.

Nothing else is needed: no login, no extra hardware. The App Review sandbox buyer completes the purchase; after it the locks disappear at once, every ad is gone (no interstitial, no rewarded video; the rewarded perks become free) and stay gone after a restart (cached in the save, re-checked with the App Store on each start).

### How it is built

- **Plugin** `src-tauri/plugins/tauri-plugin-iap`: Swift, StoreKit 2. `Product.products` for the price string, `product.purchase()`, `AppStore.sync()` for restore, `Transaction.currentEntitlements` (verified, not revoked) for the entitlement, a `Transaction.updates` listener that finishes every verified transaction and emits `entitlement-changed` (Ask to Buy approvals, purchases made on another device, refunds). Android and desktop answer `supported: false` from Rust; the plugin has no Android module, so the Gradle build does not change.
- **JS** `src/use/useFullVersion.ts` (a stub, `useFullVersion.stub.ts`, replaces it in every build without `VITE_APP_IAP_UNLOCK=true`). The gate is on only when the build flag, a native shell and an Apple device agree, because `.env.tauri` is shared with Android.
- **What is locked**: `LOCKED_NODES` in `src/game/data/fullVersion.ts` (everything except the town, the plains and the Hollows, the colosseum included). `flow.travel()` refuses a locked node and opens the offer; the map shows a lock and the same offer. The demo content (town, plains, Hollows) stays playable and replayable; saves are never blocked.
- **The offer** (`UnlockModal`) opens once right after the Goblin King's decision is answered (no interstitial plays in front of it), and later from any locked place. "Not now" returns to the town.
- **Entitlement cache**: `bc_full_version` in the save blob. Works offline after one successful check; every start asks the App Store again and a confirmed answer (including a refund) replaces the cache. It is not part of a playthrough, so "Start New Game" and slot loads keep it.
- The CI iOS build sets `VITE_APP_IAP_UNLOCK: "true"` (`.github/workflows/ios-build.yml`).

### TestFlight: testing the purchase again

A bought non-consumable cannot be un-bought on the same Apple ID. The Options > Gameplay tab has "Ignore full-version purchase" (iOS store build only, stored on the device, never in the save). On = demo again; off = the store's answer. Buy or Restore switch it off by themselves.

### How to test

No real money is involved in any of these.

1. **Xcode StoreKit configuration** (no App Store Connect product needed): `src-tauri/storekit/Battlecross.storekit` defines the product. After `pnpm tauri ios init`, open `src-tauri/gen/apple/*.xcodeproj` on a Mac, Product > Scheme > Edit Scheme > Run > Options > StoreKit Configuration = that file, run on a simulator or device. Debug > StoreKit > Manage Transactions lets you refund (the lock must come back on the next start), approve an Ask to Buy and clear purchases.
2. **Sandbox tester** (the real App Store Connect product, TestFlight or a debug build): App Store Connect > Users and Access > Sandbox > create a tester, then on the device Settings > Developer > Sandbox Apple Account. The product must exist in Connect first (Ready to Submit is enough).
3. Checks to run once on a device: the price on the button matches the storefront; buy; kill the app and relaunch in airplane mode (still unlocked); delete the app, reinstall, tap Restore purchases (unlocks); cancel the sheet (nothing changes, no error); fresh save: before the Goblin King nothing is offered, after his decision the offer shows once, the locked map places show the lock.

**Verified on a device:** the owner bought the unlock through TestFlight (build 0.5.0, 2026-10-26) and it worked. Still worth one pass before submitting: restore after a reinstall, and the price on the button against the storefront.
