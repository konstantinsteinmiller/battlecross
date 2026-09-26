`logo-lockup.svg` is the Mega Adventure logo lockup; the game ships the same bytes inline in `index.html` and `src/components/atoms/FLogoProgress.vue` (pinned by `tests/ui/splashLogo.test.ts`).
`node store-art/brand/logo-final.mjs` regenerates it deterministically; after a design change, paste the new SVG into both of those files.
The app icon is not made here: its source is `public/icons/icon.svg`, rasterised by `node scripts/render-icons.mjs`.
