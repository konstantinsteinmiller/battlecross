import { ITEM_BY_ID, type EquipSlot } from '../data/items'

/**
 * ─── The hero's painted portrait ─────────────────────────────────────────────
 *
 * The vector bust (`Portrait.vue`, `look="hero"`) is rebuilt from the gear he
 * wears, piece by piece. A painting cannot follow every piece, so it follows
 * the one thing that changes his silhouette most: the OUTFIT FAMILY of the
 * body armour, exactly as `heroLook` dresses the rig. Four paintings of the
 * same face, one per family; a missing file keeps the vector bust.
 *
 * Pure, so the art manifest and the tools can read it under plain Node.
 */

export type HeroOutfit = 'tunic' | 'leather' | 'robe' | 'plate'
export const HERO_OUTFITS: readonly HeroOutfit[] = ['tunic', 'leather', 'robe', 'plate']

/**
 * Who the player is (roadmap #71): the boy hero or the girl hero, chosen on
 * the first boot and kept in the save (`profile.hero.gender`). Everything that
 * draws the hero takes it: the rig (`heroLook`), the painted portraits (a set
 * of four per hero), the vector bust. A save from before the choice is 'm'.
 */
export type HeroGender = 'm' | 'f'
export const HERO_GENDERS: readonly HeroGender[] = ['m', 'f']
/** Anything that is not the girl hero is the boy hero (an old save, a bad value). */
export const heroGenderOf = (v: unknown): HeroGender => (v === 'f' ? 'f' : 'm')

/** The outfit family a worn body item puts him in. Nothing worn, or a kind
 *  with no family of its own, is the starter tunic. */
export const heroOutfitOf = (bodyKind: string | undefined): HeroOutfit =>
  bodyKind === 'plate' ? 'plate' : bodyKind === 'robe' ? 'robe' : bodyKind === 'leather' ? 'leather' : 'tunic'

/** His outfit family, from what he wears. */
export const heroOutfit = (equipped: Partial<Record<EquipSlot, string | null>>): HeroOutfit =>
  heroOutfitOf(equipped.body ? ITEM_BY_ID[equipped.body]?.kind : undefined)

/** The painted file's name for one family: `public/images/portraits/<id>.webp`.
 *  The boy hero's are `hero-<outfit>` (the names they always had), the girl
 *  hero's `hero-f-<outfit>`. */
export const heroPortraitId = (outfit: HeroOutfit, gender: HeroGender = 'm'): string =>
  gender === 'f' ? `hero-f-${outfit}` : `hero-${outfit}`

const HERO_ID = /^hero-(f-)?(tunic|leather|robe|plate)$/

/** `hero-plate` / `hero-f-plate` → `plate`; anything else → null. */
export const heroOutfitOfId = (id: string): HeroOutfit | null => {
  const m = HERO_ID.exec(id)
  return m ? (m[2] as HeroOutfit) : null
}

/** Which hero a portrait id shows: `hero-f-…` the girl, `hero-…` the boy, else null. */
export const heroGenderOfId = (id: string): HeroGender | null => {
  const m = HERO_ID.exec(id)
  return m ? (m[1] ? 'f' : 'm') : null
}

/**
 * What he wears in each family's REFERENCE bust: the body piece alone, no
 * helmet (the face is the point of a portrait), no weapon. The early, plain
 * piece of each family, since one painting stands for every tier of it.
 */
export const HERO_SAMPLE_BODY: Readonly<Record<HeroOutfit, string | null>> = {
  tunic: null,
  leather: 'leatherDoublet',
  robe: 'scholarsRobe',
  plate: 'chainmailVest'
}

/** A full equipment record wearing only the family's sample body piece. */
export const heroSampleEquipped = (outfit: HeroOutfit): Record<EquipSlot, string | null> => ({
  main: null, off: null, head: null, body: HERO_SAMPLE_BODY[outfit], hands: null, feet: null, trinket1: null, trinket2: null
})
