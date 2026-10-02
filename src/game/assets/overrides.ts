import overrides from 'virtual:asset-overrides'

/**
 * ─── Drop-in assets ──────────────────────────────────────────────────────────
 *
 * Everything is procedural by default: canvas-baked textures, vector icons
 * and a synth. A file dropped into `public/` under the name of the thing it
 * replaces takes over from the procedural version (the names are listed in
 * `art-todo.md` and `sound-todo.md`):
 *
 *   public/audio/sfx/<sfx name>.ogg         → that sound effect
 *   public/audio/music/<track id>.ogg       → that music track (or jingle)
 *   public/images/textures/ground.webp      → the ground's detail map
 *   public/images/items/<item id>.webp      → that item's icon
 *   public/images/skills/<skill id>.webp    → that skill's icon
 *   public/images/portraits/<look>.webp     → that speaker's portrait
 *   public/images/ui/<name>.webp            → map parchment, logo and the like
 *   public/audio/voice/<lang>/<line id>.ogg → that dialogue line, spoken
 *
 * The list is taken at BUILD time (`assetOverridesPlugin` in vite.config.ts),
 * so the game only requests files that exist; a missing one is never a 404.
 * Each map is keyed by the file name without its extension.
 */
const byName = (files: string[], dir: string): Map<string, string> => {
  const base = import.meta.env.BASE_URL
  const m = new Map<string, string>()
  for (const f of files) m.set(f.slice(0, f.lastIndexOf('.')), `${base}${dir}/${f}`)
  return m
}

export const SFX_FILES = byName(overrides.sfx, 'audio/sfx')
export const MUSIC_FILES = byName(overrides.music, 'audio/music')
export const TEXTURE_FILES = byName(overrides.textures, 'images/textures')
export const ITEM_ART = byName(overrides.items, 'images/items')
export const SKILL_ART = byName(overrides.skills, 'images/skills')
export const PORTRAIT_ART = byName(overrides.portraits, 'images/portraits')
export const UI_ART = byName(overrides.ui, 'images/ui')
/** Recorded dialogue lines, keyed `<lang>/<line id>` (`audio/speech.ts`). */
export const VOICE_FILES = byName(overrides.voice ?? [], 'audio/voice')
