/**
 * ─── Marks drawn outside the icon set ───────────────────────────────────────
 *
 * A few shapes are drawn straight into their component rather than through
 * `GameIcon`: the heart and the drop on the potion flasks (the HUD belt and
 * the healer's shelf), the "!" over a quest giver, the pointer that shows a
 * lesson on a desktop. One copy of each, here, so those components and the
 * art bench (`views/ArtSheets.vue`, which draws the painter's reference from
 * them) can never drift apart. A painted file `public/images/icons/mark-<id>`
 * replaces each one (`ICON_ART` in `game/assets/overrides.ts`).
 */
export interface Mark { viewBox: string; d: string }

export const MARKS = {
  /** The health flask's heart. */
  'potion-health': { viewBox: '0 0 48 48', d: 'M24 39C11 30 8 23.500 8 18a8 8 0 0 1 16-2.500A8 8 0 0 1 40 18c0 5.500-3 12-16 21z' },
  /** The mana flask's drop. */
  'potion-mana': { viewBox: '0 0 48 48', d: 'M24 7c6 9.500 12 15 12 22a12 12 0 0 1-24 0c0-7 6-12.500 12-22z' },
  /** Over a townsperson whose quest is undecided. */
  quest: { viewBox: '0 0 24 24', d: 'M9.6 3h4.800l-0.800 11h-3.200zM12 16.400a2.300 2.300 0 1 1 0 4.600a2.300 2.300 0 0 1 0-4.600z' },
  /** The mouse pointer of a desktop lesson. */
  cursor: { viewBox: '0 0 40 52', d: 'M4 3 L4 40 L13.5 31.5 L20 47 L27 44 L20.5 29 L33 28.5 Z' }
} as const satisfies Record<string, Mark>

export type MarkId = keyof typeof MARKS
