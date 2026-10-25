# Battlecross native ads — state

Updated 2026-10-25. Mirrors `C:\Users\konst\chaos-arena\ADS_STATE.md` (read it for the measured history).

- **Stack:** Unity LevelPlay (ironSource) is the only native ad SDK. It mediates ironSource, Google AdMob and Unity Ads
  (bidding). Plugin: `src-tauri/plugins/tauri-plugin-levelplay` (pinned SDKs; do not bump without reading the plugin's
  Gradle comments). JS side: `src/use/ads/LevelPlayProvider.ts`, chosen in `src/platforms/resolveAdProvider.ts` when
  `VITE_APP_NATIVE` and `VITE_APP_SHOW_MEDIATOR_ADS` are true.
- **Audience:** not child-directed (`VITE_APP_ADS_CHILD_DIRECTED=false`). Play target audience 13-15 (earliest group
  outside Families); fallback 16-17, then 18+. Never Families (mediated video is not closeable after 5 s).
- **Placements:** the same as the web build — Second wind, triple the purse, rare-shelf refresh (rewarded), interstitial on
  Continue after the result screen (121 s gap, 240 s grace). Rewarded buttons show only while `isRewardedReady`.
- **Consent:** Google UMP before `LevelPlay.init` (EEA/UK/CH). Options shows "Privacy settings" while UMP says a re-entry is
  required, and "Privacy policy" (`VITE_APP_PRIVACY_POLICY_URL`).
- **Gate:** `scripts/native-ads-gate.mjs` runs before every AAB: no debug switches, no test ids, no empty keys.
- **Open:** AdMob consent message, store linking, iOS secrets and listings (roadmap #Store-4, #Store-6, #Store-13+). Android and iOS ad ids are filled in `.env.tauri`.
