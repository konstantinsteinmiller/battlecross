/**
 * ─── Store covers: four scenarios, one 16:9 master each (roadmap #1) ─────────
 *
 * The portal covers are posters, not drawables: nothing in the game loads them.
 * They go through the same painter round trip as everything else (a reference
 * the bench draws, a prompt the manifest owns, the Art Desk paints it), and
 * `store-art/covers.mjs` cuts every deliverable size out of the painted master.
 *
 * Everything that has to agree between the three is here, pure data with no
 * DOM: where the figures stand (the reference composition), the zones nobody
 * may put anything important in (CrazyGames' corner banners; the logo), and
 * the crop arithmetic. The research behind the choices: `store-art/README.md`.
 *
 * Coordinates are fractions of the master: x of its width, y of its height,
 * sizes (`r`, `w`, `h`) of its HEIGHT, so a figure keeps its shape.
 */

/** The size every master is referenced and painted at: what Gemini returns for 16:9. */
export const COVER_MASTER = { width: 1376, height: 768 } as const

export type CoverSceneId = 'clash' | 'skills' | 'loot' | 'dragon'

/** A rectangle in master fractions (x, w of the width; y, h of the height). */
export interface Box { x: number; y: number; w: number; h: number }

/** A painted bust from `public/images/portraits/`, set on a body the plate draws. */
export interface CoverFigure {
  /** Who: the portrait file's stem, or null for a nameless extra (goblins). */
  portrait: string | null
  /** The head: centre (fractions of W, H) and radius (fraction of H). */
  head: [number, number, number]
  /** The body under it: a rounded block, in the figure's own colours. */
  body: { w: number; h: number; colour: string; cape?: string }
  /** Tilt of the whole figure, degrees (a recoil, a leap). */
  tilt?: number
  /** What the reference cannot show: who it is, their pose and their face. */
  says: string
}

/** A flat shape on the plate that stands for an effect or a prop. */
export type CoverShape =
  | { kind: 'burst'; at: [number, number]; r: number; colour: string; points?: number }
  | { kind: 'beam'; x: number; w: number; from: number; colour: string }
  | { kind: 'orb'; at: [number, number]; r: number; colour: string }
  | { kind: 'blade'; from: [number, number]; to: [number, number]; colour: string }
  | { kind: 'block'; box: Box; colour: string; round?: number }
  | { kind: 'wing'; root: [number, number]; tip: [number, number]; colour: string }

export interface CoverScene {
  id: CoverSceneId
  /** The painter target's stem (`art-sheets/<stem>.png`). */
  stem: string
  /** Which deliverables it is the master of (`COVER_SIZES`): 16:9 for the four scenarios. */
  family: CoverFamily
  /** A square or tall recomposition: the painted 16:9 it repaints, attached first. */
  from?: string
  title: string
  /** The hook in one line: why a player clicks. */
  hook: string
  /** The setting, for the prompt and for the plate's two ground colours. */
  where: string
  sky: [string, string]
  ground: string
  /** Back to front. */
  shapes: readonly CoverShape[]
  figures: readonly CoverFigure[]
  /** The action and the moment, in the prompt's words. */
  moment: string
  /** The two colours that meet at the focal point and nowhere else. */
  contrast: string
  /** What every crop keeps: the hero's face and the action. */
  focal: Box
  /** Where the logo goes on the "with logo" covers: never in the banner zone. */
  logo: Box
  /** Painted finishes attached before the reference (identity of the cast). */
  refs: readonly string[]
}

/**
 * CrazyGames lays its badges ("Hot", "New", "Updated", "Top rated") over the
 * top-left corner, out to the middle of the cover. Nothing that matters there.
 */
export const CG_BANNER: Box = { x: 0, y: 0, w: 0.5, h: 0.2 }

/** The hero, as every painted picture of him has him (heroPortrait.ts / the mascot). */
const HERO = 'the hero of the game (the attached portrait and the attached full figure): short tousled brown hair, a blue tunic with a gold collar line, a brown belt, brown boots and a red cape'
const GOBLIN = 'a small goblin: bright green skin, big pointed ears sticking out sideways, a ragged brown tunic, a little steel dagger'

export const COVER_SCENES: readonly CoverScene[] = [
  {
    id: 'clash',
    stem: 'cover-clash',
    family: '16x9',
    title: 'Cover: the hero smashes the Goblin King',
    hook: 'One huge hit: the hero\'s sword lands on the Goblin King, who is blown off his feet.',
    where: 'a sunny forest clearing in the late afternoon: big round-canopied trees at both sides, warm light falling in from the top right, a dirt path across the grass',
    sky: ['#ffd27a', '#7fc8ff'],
    ground: '#6cbf4a',
    shapes: [
      { kind: 'block', box: { x: -0.02, y: 0.02, w: 0.2, h: 0.62 }, colour: '#2f8a3a', round: 0.3 },
      { kind: 'block', box: { x: 0.86, y: 0.0, w: 0.2, h: 0.58 }, colour: '#2f8a3a', round: 0.3 },
      { kind: 'burst', at: [0.5, 0.44], r: 0.22, colour: '#fff3a0', points: 12 },
      { kind: 'blade', from: [0.63, 0.56], to: [0.47, 0.36], colour: '#e8f4ff' }
    ],
    figures: [
      { portrait: null, head: [0.1, 0.84, 0.07], body: { w: 0.1, h: 0.14, colour: '#8a5a34' }, tilt: -40, says: `${GOBLIN}, tumbling head over heels out of the frame at the bottom left, cropped by the edge` },
      { portrait: null, head: [0.93, 0.86, 0.07], body: { w: 0.1, h: 0.14, colour: '#8a5a34' }, tilt: 35, says: `${GOBLIN}, flung away to the bottom right, cropped by the edge` },
      { portrait: 'goblinKing', head: [0.33, 0.42, 0.14], body: { w: 0.26, h: 0.34, colour: '#7a2f8a', cape: '#c9483a' }, tilt: -18, says: 'the Goblin King (the attached portrait): bright green skin, huge pointed ears, a gold crown with one red jewel, a purple robe with a gold collar line and a red cape. He is knocked backwards off his feet, his wooden club flying out of his hand and his crown popping off his head. FACE: total shock, played for laughs: eyes enormous, pupils tiny, mouth wide open' },
      { portrait: 'hero-tunic', head: [0.71, 0.33, 0.17], body: { w: 0.26, h: 0.42, colour: '#3f7fd6', cape: '#c9483a' }, says: `${HERO}. Big in the frame, three-quarter view turned toward the viewer, both hands on a steel sword with a gold crossguard swung down and across at the king; the blade glows white-hot along its edge. FACE: a fierce, confident grin with teeth showing, eyebrows down, eyes on the king` }
    ],
    moment: 'the instant the sword connects: a bright starburst of impact between the two, sparks and grass flung outward, speed lines streaking from the hero toward the king',
    contrast: 'white-gold impact light against the king\'s purple robe and green skin',
    focal: { x: 0.24, y: 0.12, w: 0.62, h: 0.8 },
    logo: { x: 0.03, y: 0.66, w: 0.34, h: 0.31 },
    refs: ['public/images/portraits/hero-tunic.webp', 'public/images/logo/mascot.webp', 'public/images/portraits/goblinKing.webp']
  },
  {
    id: 'skills',
    stem: 'cover-skills',
    family: '16x9',
    title: 'Cover: fire in one hand, lightning in the other',
    hook: 'Build any hero: two classes\' powers at once, the eight class colours wheeling round him.',
    where: 'a ruined stone arena at dusk: broken columns at both sides, a deep violet-blue evening sky',
    sky: ['#2a2a7a', '#7a4ab0'],
    ground: '#7a7290',
    shapes: [
      { kind: 'block', box: { x: 0.02, y: 0.1, w: 0.08, h: 0.6 }, colour: '#a8a0b8', round: 0.05 },
      { kind: 'block', box: { x: 0.92, y: 0.04, w: 0.08, h: 0.66 }, colour: '#a8a0b8', round: 0.05 },
      ...(['#ff7a2a', '#c8d4e8', '#8a4ad0', '#3ad0c0', '#ffd24a', '#7ac8ff', '#d02a4a', '#c8a070'] as const).map((colour, i): CoverShape => {
        const a = Math.PI * (0.95 + (1.1 * i) / 7)
        return { kind: 'orb', at: [0.66 + 0.24 * Math.cos(a) * 0.56, 0.42 + 0.36 * Math.sin(a)], r: 0.045, colour }
      }),
      { kind: 'orb', at: [0.47, 0.52], r: 0.12, colour: '#ff7a2a' },
      { kind: 'burst', at: [0.86, 0.5], r: 0.12, colour: '#9ad8ff', points: 7 }
    ],
    figures: [
      { portrait: null, head: [0.2, 0.74, 0.07], body: { w: 0.1, h: 0.14, colour: '#8a5a34' }, tilt: -30, says: `${GOBLIN}, blasted backwards by the fireball, scorched and dazed` },
      { portrait: 'hero-tunic', head: [0.66, 0.34, 0.18], body: { w: 0.24, h: 0.4, colour: '#3f7fd6', cape: '#c9483a' }, says: `${HERO}. Leaping toward the viewer, arms flung wide: a blazing orange fireball in the hand on the left, crackling pale-blue lightning in the hand on the right. FACE: thrilled, shouting with joy, mouth wide open, eyes bright` }
    ],
    moment: 'mid-leap, both powers flaring at full strength, a ring of eight glowing class emblems wheeling behind him in the eight class colours (orange-red, silver, violet, teal, gold, sky-blue, crimson, sand-brown)',
    contrast: 'the orange fireball against the pale-blue lightning, with his face between them',
    focal: { x: 0.38, y: 0.1, w: 0.54, h: 0.78 },
    logo: { x: 0.03, y: 0.66, w: 0.34, h: 0.31 },
    refs: ['public/images/portraits/hero-tunic.webp', 'public/images/logo/mascot.webp']
  },
  {
    id: 'loot',
    stem: 'cover-loot',
    family: '16x9',
    title: 'Cover: a legendary sword erupts from a chest',
    hook: 'The loot moment: a golden beam bursts out of a chest and the hero cannot believe his luck.',
    where: 'a dim treasure vault of cool blue-violet stone, piles of gold coins glinting at the edges',
    sky: ['#1c1f4a', '#3a3a7a'],
    ground: '#2c2c58',
    shapes: [
      { kind: 'beam', x: 0.55, w: 0.13, from: 0.7, colour: '#ffe27a' },
      { kind: 'block', box: { x: 0.5, y: 0.66, w: 0.24, h: 0.26 }, colour: '#a8733f', round: 0.04 },
      { kind: 'blade', from: [0.615, 0.6], to: [0.615, 0.12], colour: '#fff6c0' },
      { kind: 'burst', at: [0.615, 0.66], r: 0.14, colour: '#fff3a0', points: 10 }
    ],
    figures: [
      { portrait: null, head: [0.32, 0.46, 0.08], body: { w: 0.1, h: 0.14, colour: '#8a5a34' }, says: `${GOBLIN}, peeking out from behind a pile of coins on the left, jealous, eyes narrowed, hands clutching the coins` },
      { portrait: 'hero-tunic', head: [0.83, 0.44, 0.2], body: { w: 0.24, h: 0.36, colour: '#3f7fd6', cape: '#c9483a' }, says: `${HERO}. Leaning in from the right, big in the frame and lit gold from below by the beam, both hands up. FACE: pure delight, mouth wide open in a gasp of joy, eyes huge with a star-shaped glint in each` }
    ],
    moment: 'the chest lid has just burst open: a column of golden light shoots up out of it, a glowing legendary sword rises point-up inside the beam, gold coins and gems spray outward',
    contrast: 'the warm gold beam against the cool blue-violet vault',
    focal: { x: 0.46, y: 0.08, w: 0.5, h: 0.86 },
    logo: { x: 0.03, y: 0.66, w: 0.34, h: 0.31 },
    refs: ['public/images/portraits/hero-tunic.webp', 'public/images/logo/mascot.webp']
  },
  {
    id: 'dragon',
    stem: 'cover-dragon',
    family: '16x9',
    title: 'Cover: the void dragon looms behind the hero',
    hook: 'Scale and danger: a giant dragon rears up, and the hero just grins.',
    where: 'a cliff edge above a valley at a stormy dusk, orange sunset light from the right, violet storm clouds behind the dragon',
    sky: ['#3a1c6a', '#ff9a4a'],
    ground: '#5a4a6a',
    shapes: [
      { kind: 'wing', root: [0.5, 0.36], tip: [0.18, 0.08], colour: '#3a1c8a' },
      { kind: 'wing', root: [0.56, 0.36], tip: [0.95, 0.06], colour: '#3a1c8a' },
      { kind: 'block', box: { x: 0.42, y: 0.24, w: 0.2, h: 0.62 }, colour: '#6a3ad0', round: 0.08 },
      { kind: 'orb', at: [0.5, 0.28], r: 0.13, colour: '#6a3ad0' },
      { kind: 'burst', at: [0.44, 0.42], r: 0.1, colour: '#e0a8ff', points: 8 }
    ],
    figures: [
      { portrait: 'hero-tunic', head: [0.77, 0.46, 0.2], body: { w: 0.26, h: 0.4, colour: '#3f7fd6', cape: '#c9483a' }, says: `${HERO}. In the front, big in the frame, looking back over his shoulder at the viewer, a steel sword with a gold crossguard raised and glowing, a round blue shield on the other arm, cape whipping in the wind. FACE: a cocky, fearless grin, one eyebrow up` }
    ],
    moment: 'the dragon rears up behind him with its jaws open and violet fire gathering in its mouth, wings spread wide; the hero has not even turned round yet',
    contrast: 'the orange sunset rim light on the hero against the dragon\'s violet hide',
    focal: { x: 0.36, y: 0.1, w: 0.58, h: 0.84 },
    logo: { x: 0.03, y: 0.66, w: 0.34, h: 0.31 },
    refs: ['public/images/portraits/hero-tunic.webp', 'public/images/logo/mascot.webp']
  }
]

// ─── Square and tall recompositions of the winners ─────────────────────────
//
// A 1:1 or 9:16 deliverable is never cut out of the 16:9: the subject the wide
// picture leads the eye to is off its edges. The scenarios that won the
// comparison (`store-art/README.md`) are painted again for each shape, from
// the finished 16:9 (attached first, so the cast, the light and the colours
// carry over) and a layout of their own. Figures are listed in the SAME
// order as the scenario's, so each keeps its description.

/** The size each family is referenced and painted at: what Gemini returns for that shape. */
export const FAMILY_SIZE: Readonly<Record<CoverFamily, { width: number; height: number }>> = {
  '16x9': { width: 1376, height: 768 },
  '1x1': { width: 1024, height: 1024 },
  '9x16': { width: 768, height: 1376 }
}

interface Layout {
  shapes: readonly CoverShape[]
  /** [head, body, tilt] per figure of the scenario, in its order. */
  figures: ReadonlyArray<{ head: [number, number, number]; body?: { w: number; h: number }; tilt?: number }>
  focal: Box
  logo: Box
}

const recompose = (base: CoverScene, family: '1x1' | '9x16', l: Layout): CoverScene => {
  if (l.figures.length !== base.figures.length) throw new Error(`${base.id} ${family}: one layout per figure`)
  const word = family === '1x1' ? 'sq' : 'tall'
  return {
    ...base,
    stem: `cover-${word}-${base.id}`,
    family,
    title: `${base.title} (${family === '1x1' ? 'square' : 'tall'})`,
    from: `art-sheets/painted/${base.stem}.jpg`,
    shapes: l.shapes,
    figures: base.figures.map((fig, i) => ({ ...fig, head: l.figures[i]!.head, body: { ...fig.body, ...(l.figures[i]!.body ?? {}) }, tilt: l.figures[i]!.tilt ?? fig.tilt })),
    focal: l.focal,
    logo: l.logo,
    refs: [`art-sheets/painted/${base.stem}.jpg`, ...base.refs]
  }
}

const sceneOf = (id: CoverSceneId): CoverScene => COVER_SCENES.find(x => x.id === id)!

/** Bottom-centre: where the compositor lays the logo on square and tall sizes. */
const LOGO_SQ: Box = { x: 0.2, y: 0.8, w: 0.6, h: 0.18 }
const LOGO_TALL: Box = { x: 0.15, y: 0.76, w: 0.7, h: 0.14 }

export const COVER_RECOMPOSED: readonly CoverScene[] = [
  recompose(sceneOf('loot'), '1x1', {
    shapes: [
      { kind: 'beam', x: 0.3, w: 0.16, from: 0.72, colour: '#ffe27a' },
      { kind: 'block', box: { x: 0.2, y: 0.62, w: 0.34, h: 0.24 }, colour: '#a8733f', round: 0.04 },
      { kind: 'blade', from: [0.38, 0.6], to: [0.38, 0.1], colour: '#fff6c0' },
      { kind: 'burst', at: [0.38, 0.64], r: 0.14, colour: '#fff3a0', points: 10 }
    ],
    figures: [{ head: [0.12, 0.5, 0.07] }, { head: [0.7, 0.44, 0.22], body: { w: 0.3, h: 0.34 } }],
    focal: { x: 0.18, y: 0.08, w: 0.78, h: 0.72 },
    logo: LOGO_SQ
  }),
  recompose(sceneOf('loot'), '9x16', {
    shapes: [
      { kind: 'beam', x: 0.2, w: 0.3, from: 0.6, colour: '#ffe27a' },
      { kind: 'block', box: { x: 0.12, y: 0.56, w: 0.2, h: 0.13 }, colour: '#a8733f', round: 0.02 },
      { kind: 'blade', from: [0.35, 0.55], to: [0.35, 0.16], colour: '#fff6c0' },
      { kind: 'burst', at: [0.35, 0.58], r: 0.08, colour: '#fff3a0', points: 10 }
    ],
    figures: [{ head: [0.16, 0.3, 0.045] }, { head: [0.62, 0.42, 0.13], body: { w: 0.17, h: 0.24 } }],
    focal: { x: 0.08, y: 0.14, w: 0.88, h: 0.6 },
    logo: LOGO_TALL
  }),
  recompose(sceneOf('clash'), '1x1', {
    shapes: [
      { kind: 'block', box: { x: 0.86, y: 0.02, w: 0.18, h: 0.5 }, colour: '#2f8a3a', round: 0.3 },
      { kind: 'burst', at: [0.48, 0.5], r: 0.2, colour: '#fff3a0', points: 12 },
      { kind: 'blade', from: [0.62, 0.6], to: [0.44, 0.42], colour: '#e8f4ff' }
    ],
    figures: [{ head: [0.08, 0.88, 0.06] }, { head: [0.93, 0.88, 0.06] }, { head: [0.28, 0.42, 0.15], body: { w: 0.26, h: 0.32 } }, { head: [0.7, 0.36, 0.19], body: { w: 0.28, h: 0.42 } }],
    focal: { x: 0.1, y: 0.12, w: 0.84, h: 0.68 },
    logo: LOGO_SQ
  }),
  recompose(sceneOf('clash'), '9x16', {
    shapes: [
      { kind: 'block', box: { x: 0.78, y: 0.04, w: 0.12, h: 0.36 }, colour: '#2f8a3a', round: 0.2 },
      { kind: 'burst', at: [0.45, 0.5], r: 0.1, colour: '#fff3a0', points: 12 },
      { kind: 'blade', from: [0.58, 0.44], to: [0.4, 0.52], colour: '#e8f4ff' }
    ],
    figures: [{ head: [0.12, 0.86, 0.04] }, { head: [0.9, 0.88, 0.04] }, { head: [0.3, 0.6, 0.09], body: { w: 0.15, h: 0.2 }, tilt: -25 }, { head: [0.62, 0.34, 0.12], body: { w: 0.17, h: 0.24 } }],
    focal: { x: 0.08, y: 0.16, w: 0.88, h: 0.56 },
    logo: LOGO_TALL
  })
]

/** What the dragon is, from its rig (`gfx/rigs/creatures.ts`, `buildDragon('void')`). */
export const VOID_DRAGON = 'the void dragon: a huge dragon with violet hide, a pale lilac belly, near-black violet wings, pale ivory horns and glowing lilac eyes'

// ─── The deliverables ────────────────────────────────────────────────────────

export type CoverFormat = 'jpg' | 'webp'
/** Which painted master a size is cut from. A missing 1:1 or 9:16 falls back to a 16:9 crop. */
export type CoverFamily = '16x9' | '1x1' | '9x16'

export interface CoverSize {
  w: number
  h: number
  formats: readonly CoverFormat[]
  /** Which variants: the bare cover, the one with the logo, or both. */
  logo: 'both' | 'only'
  family: CoverFamily
}

/** Roadmap #1, exactly: "only jpg" / "only webp" / "only with logo" as listed. */
export const COVER_SIZES: readonly CoverSize[] = [
  { w: 800, h: 800, formats: ['jpg', 'webp'], logo: 'both', family: '1x1' },
  { w: 1920, h: 1080, formats: ['jpg', 'webp'], logo: 'both', family: '16x9' },
  { w: 1080, h: 1920, formats: ['jpg'], logo: 'both', family: '9x16' },
  { w: 800, h: 1200, formats: ['webp'], logo: 'both', family: '9x16' },
  { w: 1360, h: 850, formats: ['jpg'], logo: 'only', family: '16x9' },
  { w: 800, h: 450, formats: ['webp'], logo: 'only', family: '16x9' },
  { w: 400, h: 225, formats: ['jpg'], logo: 'only', family: '16x9' },
  { w: 512, h: 512, formats: ['jpg'], logo: 'only', family: '1x1' },
  { w: 628, h: 628, formats: ['jpg'], logo: 'only', family: '1x1' },
  { w: 512, h: 384, formats: ['jpg'], logo: 'only', family: '16x9' },
  { w: 512, h: 340, formats: ['jpg'], logo: 'only', family: '16x9' }
]

/** Every file name the compositor writes for one scenario. */
export const coverFiles = (): string[] =>
  COVER_SIZES.flatMap(s => (s.logo === 'both' ? ['', '-logo'] : ['-logo']).flatMap(v => s.formats.map(f => `cover${v}_${s.w}x${s.h}.${f}`)))

// ─── Crops ───────────────────────────────────────────────────────────────────

/**
 * The window of aspect `aspect` (w / h) cut from a master `mw` x `mh`, in
 * pixels: as large as fits, centred on the focal box, slid back inside the
 * master. Keeps the full height of a wide master (or the full width of a tall
 * one), so a crop only ever loses the sides that matter least.
 */
export const cropBox = (mw: number, mh: number, aspect: number, focal: Box): { left: number; top: number; width: number; height: number } => {
  const cx = (focal.x + focal.w / 2) * mw
  const cy = (focal.y + focal.h / 2) * mh
  const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))
  if (mw / mh > aspect) {
    const width = Math.round(mh * aspect)
    return { left: Math.round(clamp(cx - width / 2, 0, mw - width)), top: 0, width, height: mh }
  }
  const height = Math.round(mw / aspect)
  return { left: 0, top: Math.round(clamp(cy - height / 2, 0, mh - height)), width: mw, height }
}

// ─── The reference plate ─────────────────────────────────────────────────────

const f = (n: number): string => String(Math.round(n * 10) / 10)

/**
 * The scene as flat notation: sky and ground, the props and effects as plain
 * shapes, each figure's body as a rounded block with an empty circle for its
 * head. The bench draws the painted bust of each named figure into its circle
 * (an SVG drawn as an image cannot load one) — `CoverFigure.head`.
 */
export const coverPlateSvg = (s: CoverScene, W: number = COVER_MASTER.width, H: number = COVER_MASTER.height): string => {
  const X = (x: number): number => x * W
  const Y = (y: number): number => y * H
  const R = (r: number): number => r * H
  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient></defs>`,
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>`,
    `<rect y="${f(H * 0.68)}" width="${W}" height="${f(H * 0.32)}" fill="${s.ground}"/>`
  ]
  const ink = 'stroke="#0f0c19" stroke-width="5" stroke-linejoin="round"'
  for (const sh of s.shapes) {
    if (sh.kind === 'block') out.push(`<rect x="${f(X(sh.box.x))}" y="${f(Y(sh.box.y))}" width="${f(R(sh.box.w))}" height="${f(R(sh.box.h))}" rx="${f(R(sh.round ?? 0))}" fill="${sh.colour}" ${ink}/>`)
    else if (sh.kind === 'orb') out.push(`<circle cx="${f(X(sh.at[0]))}" cy="${f(Y(sh.at[1]))}" r="${f(R(sh.r))}" fill="${sh.colour}" ${ink}/>`)
    else if (sh.kind === 'beam') out.push(`<rect x="${f(X(sh.x))}" y="0" width="${f(X(sh.w))}" height="${f(Y(sh.from))}" fill="${sh.colour}" opacity=".85"/>`)
    else if (sh.kind === 'blade') out.push(`<line x1="${f(X(sh.from[0]))}" y1="${f(Y(sh.from[1]))}" x2="${f(X(sh.to[0]))}" y2="${f(Y(sh.to[1]))}" stroke="#0f0c19" stroke-width="${f(R(0.05))}" stroke-linecap="round"/><line x1="${f(X(sh.from[0]))}" y1="${f(Y(sh.from[1]))}" x2="${f(X(sh.to[0]))}" y2="${f(Y(sh.to[1]))}" stroke="${sh.colour}" stroke-width="${f(R(0.035))}" stroke-linecap="round"/>`)
    else if (sh.kind === 'wing') {
      const [rx, ry] = [X(sh.root[0]), Y(sh.root[1])]
      const [tx, ty] = [X(sh.tip[0]), Y(sh.tip[1])]
      out.push(`<path d="M${f(rx)} ${f(ry)}L${f(tx)} ${f(ty)}L${f(rx + (tx - rx) * 0.75)} ${f(ry + R(0.3))}Z" fill="${sh.colour}" ${ink}/>`)
    } else {
      const n = (sh.points ?? 10) * 2
      const pts = Array.from({ length: n }, (_, i) => {
        const a = (Math.PI * 2 * i) / n
        const r = R(sh.r) * (i % 2 ? 0.45 : 1)
        return `${f(X(sh.at[0]) + r * Math.cos(a))},${f(Y(sh.at[1]) + r * Math.sin(a))}`
      })
      out.push(`<polygon points="${pts.join(' ')}" fill="${sh.colour}" ${ink}/>`)
    }
  }
  for (const fig of s.figures) {
    const [hx, hy, hr] = [X(fig.head[0]), Y(fig.head[1]), R(fig.head[2])]
    const bw = R(fig.body.w)
    const bh = R(fig.body.h)
    out.push(`<g transform="rotate(${fig.tilt ?? 0} ${f(hx)} ${f(hy + hr)})">`)
    if (fig.body.cape) out.push(`<rect x="${f(hx - bw * 0.62)}" y="${f(hy + hr * 0.6)}" width="${f(bw * 1.24)}" height="${f(bh * 0.9)}" rx="${f(bw * 0.2)}" fill="${fig.body.cape}" ${ink}/>`)
    out.push(`<rect x="${f(hx - bw / 2)}" y="${f(hy + hr * 0.75)}" width="${f(bw)}" height="${f(bh)}" rx="${f(bw * 0.3)}" fill="${fig.body.colour}" ${ink}/>`)
    out.push(`<circle cx="${f(hx)}" cy="${f(hy)}" r="${f(hr)}" fill="${fig.portrait ? '#f2c8a0' : '#7bc74d'}" ${ink}/>`)
    out.push('</g>')
  }
  out.push('</svg>')
  return out.join('')
}
