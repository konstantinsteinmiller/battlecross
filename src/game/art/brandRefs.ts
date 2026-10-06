/**
 * ─── The brand's reference drawings ──────────────────────────────────────────
 *
 * What the painter is shown for the logo emblem and the loader's mascot
 * (roadmap #65). Pure strings, so the art manifest stays importable from Node
 * and the bench (`views/ArtSheets.vue`) draws them like any other panel.
 *
 * The EMBLEM is the generated lockup's own badge — two swords crossed behind
 * a shield — cut from `store-art/brand/logo-lockup.svg` (the art pipeline
 * test holds the two together), without the BATTLE / CROSS letters. Those stay
 * code-drawn: an image model cannot be trusted to spell, and a misspelt title
 * on a store page is worse than no painting at all.
 *
 * The MASCOT reference is notation: a chibi hero in the pose the painting
 * should take (sword raised, free hand waving), in his colours. His face comes
 * from the painted hero portraits, attached as identity references.
 */

/** The lockup's badge as drawn today, letters left out. Byte for byte from the lockup. */
export const EMBLEM_BODY = '<g stroke-linejoin="round"><g transform="rotate(-42 150 80)"><path d="M150 -20l9 13v82h-18V-7z" fill="#e6ebf5" stroke="#141a33" stroke-width="6"/><path d="M150 -6v76" stroke="#aeb9cf" stroke-width="3" stroke-linecap="round"/><path d="M128 75h44v10h-44z" fill="#ffd24a" stroke="#141a33" stroke-width="6"/><path d="M144 86h12v36h-12z" fill="#a8733f" stroke="#141a33" stroke-width="6"/><circle cx="150" cy="128" r="7" fill="#ffd24a" stroke="#141a33" stroke-width="6"/></g><g transform="rotate(42 150 80)"><path d="M150 -20l9 13v82h-18V-7z" fill="#e6ebf5" stroke="#141a33" stroke-width="6"/><path d="M150 -6v76" stroke="#aeb9cf" stroke-width="3" stroke-linecap="round"/><path d="M128 75h44v10h-44z" fill="#ffd24a" stroke="#141a33" stroke-width="6"/><path d="M144 86h12v36h-12z" fill="#a8733f" stroke="#141a33" stroke-width="6"/><circle cx="150" cy="128" r="7" fill="#ffd24a" stroke="#141a33" stroke-width="6"/></g><path d="M150 24l40 13v32c0 27-16 45-40 56c-24-11-40-29-40-56V37z" fill="#3f7fd6" stroke="#141a33" stroke-width="8"/><path d="M150 34l31 10v25c0 21-12 36-31 45z" fill="#2f63b8"/><path d="M150 34l31 10v25c0 21-12 36-31 45c-19-9-31-24-31-45V44z" fill="none" stroke="#ffd24a" stroke-width="3.4"/><path d="M150 48l6.5 15 15 6.5-15 6.5-6.5 15-6.5-15-15-6.5 15-6.5z" fill="#fff" stroke="#141a33" stroke-width="4"/>'

/** The badge on its own, in a box that holds the crossed swords' tips. */
export const EMBLEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="30 -45 240 200">${EMBLEM_BODY}</g></svg>`

const OUT = 'stroke="#141a33" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"'

/** The hero, full figure, in the pose the loader's mascot should strike. */
export const MASCOT_POSE_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">',
  // The cape, behind him.
  `<path d="M44 56c-8 14-10 30-6 46l22-8 22 8c4-16 2-32-6-46z" fill="#c9483a" ${OUT}/>`,
  // Legs and boots.
  `<path d="M50 88h8v14h-10c-3 0-4-3-2-5z" fill="#8a5f3a" ${OUT}/>`,
  `<path d="M62 88h8l4 9c2 2 1 5-2 5H62z" fill="#8a5f3a" ${OUT}/>`,
  // The blue tunic and a brown belt.
  `<path d="M46 60c0-6 6-9 14-9s14 3 14 9v30H46z" fill="#3f7fd6" ${OUT}/>`,
  `<path d="M46 78h28v6H46z" fill="#8a5f3a" ${OUT}/>`,
  // One arm raised with the sword.
  '<path d="M48 62l-12-14" fill="none" stroke="#141a33" stroke-width="10" stroke-linecap="round"/>',
  '<path d="M48 62l-12-14" fill="none" stroke="#3f7fd6" stroke-width="5" stroke-linecap="round"/>',
  `<path d="M30 44l-14-30 4-2 15 28z" fill="#e6ebf5" ${OUT}/>`,
  '<path d="M28 46l12-7" fill="none" stroke="#ffd24a" stroke-width="5" stroke-linecap="round"/>',
  `<circle cx="35" cy="46" r="5" fill="#f2c8a0" ${OUT}/>`,
  // The other arm up in a wave.
  '<path d="M72 62l12-12" fill="none" stroke="#141a33" stroke-width="10" stroke-linecap="round"/>',
  '<path d="M72 62l12-12" fill="none" stroke="#3f7fd6" stroke-width="5" stroke-linecap="round"/>',
  `<circle cx="86" cy="47" r="5.5" fill="#f2c8a0" ${OUT}/>`,
  // The head: nearly half of him.
  `<circle cx="60" cy="34" r="21" fill="#f2c8a0" ${OUT}/>`,
  `<path d="M39 32c0-14 10-22 21-22s21 8 21 22c-4-6-9-8-14-8-3 3-10 5-17 4-5 0-8 2-11 4z" fill="#7a4a2a" ${OUT}/>`,
  '<ellipse cx="52" cy="37" rx="3" ry="4" fill="#241a2e"/><ellipse cx="68" cy="37" rx="3" ry="4" fill="#241a2e"/>',
  '<path d="M55 45q5 4 10 0" fill="none" stroke="#141a33" stroke-width="2" stroke-linecap="round"/>',
  '</svg>'
].join('')

// ─── The painted title (roadmap #76): candidates for the owner to pick ────
//
// Unlike the badge, these carry the LETTERS: the owner asked for a painted
// logo with a cool toon wordmark. The game is called Battlecross — ONE word,
// so every candidate sets it on one line. The reference sets every letter in
// place (a plain heavy face, notation only) and the prompt spells it out; a
// take that misspells is thrown away, never shipped. The owner liked the
// white, navy-outlined, sky-blue-shaded letters of the first round's B; the
// staff crossed with the sword is a glowing mage's staff, not a plain stick.

const WORD = 'font-family="Arial Black, Arial, sans-serif" font-weight="900" text-anchor="middle" paint-order="stroke" stroke="#141a33" stroke-linejoin="round"'
/** The title, one line, white letters (the colour is the prompt's). */
const TITLE = (y: number, size: number, extra = ''): string => `<text x="100" y="${y}" font-size="${size}" fill="#ffffff" stroke-width="5" textLength="186" lengthAdjust="spacingAndGlyphs" ${WORD} ${extra}>BATTLECROSS</text>`
/** A steel sword along (x1, y1) → (x2, y2), the hilt at the start. */
const SWORD = (x1: number, y1: number, x2: number, y2: number): string =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#141a33" stroke-width="11" stroke-linecap="round"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="#e6ebf5" stroke-width="6" stroke-linecap="round"/>`
/** A mage's staff along (x1, y1) → (x2, y2), its glowing crystal head at the end. */
const STAFF = (x1: number, y1: number, x2: number, y2: number): string =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#141a33" stroke-width="10" stroke-linecap="round"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="#6a3a8a" stroke-width="5" stroke-linecap="round"/>` +
  `<circle cx="${x2}" cy="${y2}" r="13" fill="#8ef0ff" stroke="#141a33" stroke-width="3"/><path d="M${x2 - 15} ${y2 + 6}q15 10 30 0" fill="none" stroke="#ffd24a" stroke-width="4" stroke-linecap="round"/>`

/** D: the hero's shield — BATTLECROSS across the front of the game's blue shield, sword and staff crossed behind it. */
export const LOGO_D_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">',
  SWORD(54, 160, 146, 40),
  STAFF(150, 162, 52, 42),
  '<path d="M100 44l44 14v34c0 30-18 50-44 62c-26-12-44-32-44-62V58z" fill="#3f7fd6" stroke="#141a33" stroke-width="4"/>',
  '<path d="M100 54l34 11v27c0 23-13 39-34 49c-21-10-34-26-34-49V65z" fill="none" stroke="#ffd24a" stroke-width="3"/>',
  TITLE(110, 30),
  '</svg>'
].join('')

/** By the id the manifest names in a panel's `glyph`. */
export const BRAND_REFS: Readonly<Record<string, string>> = { emblem: EMBLEM_SVG, mascot: MASCOT_POSE_SVG, 'logo-d': LOGO_D_SVG }
