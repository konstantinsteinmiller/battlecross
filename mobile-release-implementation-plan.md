# Battlecross → Google Play (Tauri v2 Android) — Mobile Release Implementation Plan


## Context
Battlecross ships today as a Vue 3 + Vite web game for 10 portals. The goal is a Google Play release built with Tauri v2 Android, with ads from AdMob, ironSource and Unity Ads, using the same pipeline Chaos Arena (`C:\Users\konst\chaos-arena`) already uses on Play.

**What Chaos Arena actually does**
- It uses **one** native plugin, `tauri-plugin-levelplay`. LevelPlay (ironSource) mediates and bids across ironSource, AdMob and Unity Ads.
  - There is no JS fallback between the three networks. Mediation is how "all 3 providers" is achieved.
- It has a store-build gate (`scripts/native-ads-gate.mjs`) and a versionCode bump script.
- It signs builds locally from `key.properties`, outside git, and the AAB is uploaded **by hand** in the Play Console.
- There is no Android CI workflow.

**What battlecross already has**
- `.env.tauri`, with `NATIVE` and `SHOW_MEDIATOR_ADS` on and empty IDs.
- `isNative` and `showMediatorAds` flags in `src/use/useUser.ts`.
- Comments in `src/platforms/resolveAdProvider.ts` that expect a LevelPlay provider.

**What battlecross is missing**
- A `src-tauri/` folder.
- A LevelPlay provider (a native build gets `NoopProvider` today).
- Build scripts, safe-area handling, back-button handling, and offline handling for the leaderboard.

## Decisions (defaults chosen; flag in review if wrong)
1. **Target audience: 13+ first (owner-confirmed); if Play rejects it as not child-friendly, resubmit as 16+, then 18+. Never Families.**
   - Chaos Arena was rejected 3× under the Families "closeable after 5 s" ad rule and then moved to 18+.
   - Battlecross has combat and demons, so it isn't child-directed: `VITE_APP_ADS_CHILD_DIRECTED=false`.
2. **Application ID `com.hyperg8.battlecross`.** It is permanent once uploaded, so confirm it before step 2.
3. **Uploads stay manual** (Internal testing → Closed → Production), the same as Chaos Arena.
   - Optional later: an Android CI workflow from the `tauri-mobile-ci` skill template.
4. **Orientation (owner-confirmed):** lock the mobile build to landscape (`sensorLandscape` in the manifest).
5. **Leaderboard:** keep the Worker URL online. If the request fails, fall back to the baked seed: `.env.tauri` keeps `VITE_LEADERBOARD_URL`, and the Tauri CSP is `null`.

## Implementation steps

### 1. Bring over the native plugin
- Copy `chaos-arena/src-tauri/plugins/tauri-plugin-levelplay/` (Rust, Kotlin, Swift and permissions) unchanged.
- Keep its pinned SDK versions:

  | Dependency | Version | Why it's pinned |
  |---|---|---|
  | mediation-sdk | 9.6.0 | 9.4.x is Play-blocked |
  | play-services-ads | 24.9.0 | 25.x needs Kotlin 2.3 |
  | UMP | 3.2.0 | |
  | AdMob adapter | 5.5.0 | |
  | Unity Ads adapter | 5.13.0 | |
  | Unity Ads | 4.20.1 | |

- Do **not** copy `tauri-plugin-admob`; it is the dead Families variant.

### 2. Scaffold `src-tauri/`
- Run `pnpm add -D @tauri-apps/cli@2.10.x` and `pnpm add @tauri-apps/api`, then `tauri init` and `tauri android init`.
- Model each file on its Chaos Arena counterpart:
  - **`tauri.conf.json`**:
    - identifier
    - productName `Battlecross`
    - version from `../package.json`
    - `frontendDist: ../dist-tauri`
    - `beforeBuildCommand: pnpm build-only --mode tauri --outDir dist-tauri --base=./`
    - `security.csp: null`
  - **`Cargo.toml`**: tauri 2.10.3, `tauri-plugin-log` (debug only), `tauri-plugin-opener`, and the local levelplay path dependency.
  - **`src/lib.rs`**: register the plugins.
  - **`capabilities/default.json`**: `core:default`, `opener:default`, `levelplay:default`.
  - **`gen/android/app/build.gradle.kts`**: port the hand edits:
    - compileSdk/targetSdk 36, minSdk 24, R8 minify
    - `admobAppId` manifest placeholder from `VITE_APP_ADMOB_ANDROID_APP_ID`
    - versionCode from `ANDROID_VERSION_CODE`, then `tauri.properties`
    - `key.properties` release signing
    - an `afterEvaluate` hook that **copies** (does not rename) the AAB to `com.hyperg8.battlecross.aab`
  - **`MainActivity.kt`**: `enableEdgeToEdge()`.
  - **Manifest**: orientation lock and `usesCleartextTraffic` debug-only. Remove leanback unless Android TV is wanted.
- Generate icons with `tauri icon` from `public/icons/icon-512.png` and the maskable icon. Commit `gen/android`.
- Create a new upload keystore at `C:/Users/konst/battlecross-release.keystore`.
  - `key.properties` is gitignored; add it to `.gitignore`.
  - Back up the keystore. Losing it means a new app listing unless Play App Signing is on, so turn Play App Signing on.

### 3. JS ad provider
- Port `chaos-arena/src/use/ads/LevelPlayProvider.ts` to `src/use/ads/LevelPlayProvider.ts`, implementing battlecross's `AdProvider` from `src/use/ads/types.ts`.
  - The dynamic `import('@tauri-apps/api/core')` stays behind `VITE_APP_NATIVE`, so web builds tree-shake it out.
  - Readiness comes from the `rewarded-state` / `interstitial-state` events and feeds `isRewardedReady` / `isInterstitialReady`.
- Wire it in `src/platforms/resolveAdProvider.ts`: `isNative && showMediatorAds` → LevelPlay. It must come **before** the portal branches.
- Hook it into the existing ad layer:
  - `src/use/useAds.ts`: `showRewardedAd` / `showMidgameAd`
  - `src/use/useAdGate.ts`: rewarded readiness gating
  - `useGamePause` and `useGamePauseAudio`: mute and pause while an ad is open; the plugin's show and close callbacks bracket `isAdShowing`
  - the interstitial in `src/game/flow.ts` (~712-760)
- Check the playbook's ads phase (`new-web-game-playbook`) for these rules, which apply here too:
  - ad audio is muted
  - the interstitial shows before the result screen
  - rewarded buttons are hidden or refused while not ready
  - first-load interstitial: not on Play; no first-launch ad
- Optional: port `LevelPlayDebugOverlay.vue`, enabled only by `VITE_APP_ADS_DEBUG`.

### 4. Privacy and consent UI
- The plugin runs UMP consent before `LevelPlay.init`.
- Add a **Privacy settings** entry, shown only when `privacyOptionsRequired`, and a **Privacy policy** link to the options/settings screen. Open the link through `tauri-plugin-opener`; a port of `chaos-arena/src/utils/openExternal.ts` is needed because `plugin-shell` does nothing on Android.
- Both labels go through i18n: add the keys to `en.ts` and every locale battlecross ships.
- Host a privacy policy page and `app-ads.txt` on the developer website domain listed in Play.
  - `app-ads.txt` needs the LevelPlay, Unity **and** `google.com, pub-…, DIRECT` lines. Chaos Arena's copy lacks the Google line; fix it there too.

### 5. Mobile app behaviour
- **Saves:** `resolveSaveStrategy` falls through to `LocalStorageStrategy`; that's enough. Add a flush on `visibilitychange`/`pagehide`, as in chaos-arena `main.ts`, if it isn't already there.
- **Background:** pause and mute on `visibilitychange`. Check `App.vue` and `useGamePause`.
- **Safe area:** with edge-to-edge on, add `env(safe-area-inset-*)` padding to the HUD root, menus and the world map (none exists today). `viewport-fit=cover` goes in `index.html`.
- **Android back button:** add a handler that closes the top modal or card, then opens pause, then confirms exit. Today the WebView back press closes the app.
- **Inherited flags:** `.env.tauri` must set every portal flag false, the same pattern as `.env.poki.local`. `vite.config.ts` refuses a build with two flags on.
- **Platform descriptor:** add `src/platforms/tauri` (or use `isNative` checks) for:
  - hiding "more games" / portal-only UI
  - disabling the vConsole tap-chord in release
  - capabilities such as no cloud save
- **Rendering:** keep `VITE_APP_FPS_CAP=60`.
- **Bundle size:** the AAB is ~50 MB raw (17 MB voice). That's under Play's 200 MB base limit, so no asset packs are needed.

### 6. Build scripts and gate
- Add these `package.json` scripts, mirroring chaos-arena:
  - `tauri:dev-android`
  - `tauri:build-android-apk`
  - `tauri:build-android-aab`: `node scripts/native-ads-gate.mjs && tauri android build --aab`, using `.env.tauri` + `.env.tauri.remote`, then `node scripts/bump-android-version-code.mjs`
- Copy `scripts/native-ads-gate.mjs` and `scripts/bump-android-version-code.mjs`.
  - Seed `.env.tauri.remote` (committed) with `ANDROID_VERSION_CODE=1000001`.
- `.env.tauri` needs:
  - `VITE_APP_LEVELPLAY_ANDROID_APP_KEY` and the rewarded / interstitial unit IDs
  - `VITE_APP_ADMOB_ANDROID_APP_ID`
  - `VITE_APP_PRIVACY_POLICY_URL`
  - `ADS_TEST_SUITE=false`, `ADS_CONSENT_DEBUG_EEA=false`, `ADS_CHILD_DIRECTED=false`

### 7. Dashboards (owner tasks → `outstanding-decisions.md`)
- **LevelPlay:**
  - new app; rewarded and interstitial ad units
  - add AdMob and Unity Ads as networks with their credentials
  - COPPA off
- **AdMob:** new Android app with app ID and ad units for the LevelPlay mapping, plus a GDPR consent message for battlecross.
- **Unity:** a new project and its Android game ID.
- **Play Console:**
  - create the app
  - content rating questionnaire (fantasy violence)
  - target audience 13+ (fallback 16+, then 18+ if rejected as not child-friendly)
  - Ads declaration: yes
  - Data Safety and the AD_ID declaration: copy the table from `chaos-arena/ADS_STATE.md`
  - privacy URL
  - store listing: the `store-art/` and `art:promotion` outputs give the 512 icon, the 1024×500 feature graphic, and phone/tablet screenshots
- Keep a running `ADS_STATE.md` in battlecross, like Chaos Arena's.

### 8. Release flow
1. Build a debug APK and sideload it with `adb install`.
2. Run the LevelPlay test suite with `VITE_APP_ADS_TEST_SUITE=true` in a debug build only.
3. Check that consent appears in the EEA debug build.
4. `pnpm tauri:build-android-aab`, then upload it to **Internal testing**.
5. Promote to Closed testing (new personal accounts need 12 testers for 14 days), then Production.
6. After approval, link the store in AdMob and LevelPlay, and verify `app-ads.txt`.

## Verification
- `vue-tsc --build`, plus a vitest suite that checks:
  - `resolveAdProvider` returns LevelPlay only for `tauri` mode
  - every web build still tree-shakes `@tauri-apps/api` (grep the dist)
- The gate script fails on a test ID or empty key, and passes with real ones.
- Run on-device in an emulator (an AVD with Play services):
  - rewarded and interstitial show; audio mutes; the game pauses and resumes
  - back button, safe area, landscape lock
  - offline launch works
  - the leaderboard falls back to the seed
- Screenshots go through `blur-probe.mjs image`. Run `blur-probe live` (phone 3×) before the AAB is uploaded.
- Real-device perf comes from the Play internal-testing pre-launch report, not hand-held testing.
