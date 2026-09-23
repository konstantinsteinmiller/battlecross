/// <reference types="vite/client" />

/** Drop-in asset files present at build time (see `assetOverridesPlugin` in
 *  vite.config.ts): file names inside public/audio/sfx, public/audio/music
 *  and public/images/textures. */
declare module 'virtual:asset-overrides' {
  const overrides: { sfx: string[]; music: string[]; textures: string[] }
  export default overrides
}
