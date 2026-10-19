/**
 * The loading-screen clicker's pure rules: which monster comes when, how tough
 * it is, which hero swings. No DOM, no canvas, no storage: unit-tested alone.
 */
export const MONSTER_KINDS = ['goblin', 'treant', 'elemental', 'golem', 'wolf', 'dragon', 'demon', 'wraith', 'titan'] as const
export type MonsterKind = (typeof MONSTER_KINDS)[number]
export type HeroKind = 'male' | 'female'

export interface Monster {
  kind: MonsterKind
  /** How many full rounds of the table came before it (0 on the first). */
  round: number
  hp: number
}

/** The nth monster (0-based): the table in order, then again, tougher each time. */
export const monsterAt = (n: number): Monster => {
  const i = Math.max(0, Math.floor(n))
  // 3, 4, 5, 7, 9 … ×1.28 per monster; the exponent is capped so it can never overflow.
  const hp = Math.ceil(3 * 1.28 ** Math.min(i, 60))
  return { kind: MONSTER_KINDS[i % MONSTER_KINDS.length]!, round: Math.floor(i / MONSTER_KINDS.length), hp }
}

/** The first-ever load is always the man; later loads flip a coin. */
export const pickHero = (firstLoad: boolean, rnd: () => number = Math.random): HeroKind =>
  firstLoad || rnd() < 0.5 ? 'male' : 'female'

const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock', 'NumLock', 'ScrollLock', 'Fn', 'OS', 'Dead'])

/**
 * One attack per tap, click or key press anywhere in the window (capture phase, so no
 * layer can swallow it). Held keys, bare modifiers and browser shortcuts do not count; the
 * pointer path listens to `pointerdown` only, so a touch's emulated mouse events never add a second hit.
 * Returns its own removal.
 */
export const bindInput = (win: Window, fire: () => void): (() => void) => {
  const onPointer = (e: PointerEvent): void => { if (e.isPrimary !== false && (e.button ?? 0) === 0) fire() }
  const onKey = (e: KeyboardEvent): void => {
    if (e.repeat || MODIFIER_KEYS.has(e.key) || e.ctrlKey || e.metaKey || e.altKey) return
    fire()
  }
  win.addEventListener('pointerdown', onPointer, true)
  win.addEventListener('keydown', onKey, true)
  return () => {
    win.removeEventListener('pointerdown', onPointer, true)
    win.removeEventListener('keydown', onKey, true)
  }
}
