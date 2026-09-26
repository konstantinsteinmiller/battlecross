import { reactive } from 'vue'

/**
 * ─── What the key is called on THIS keyboard ─────────────────────────────────
 *
 * The game binds PHYSICAL keys (`KeyboardEvent.code`): the key under the left
 * ring finger is `KeyW` on every layout. Its printed letter is not — an AZERTY
 * player walks with Z Q S D. Keycaps drawn by the HUD therefore ask this
 * module for the letter, which the Keyboard API reports where it exists
 * (Chromium; refused in some embeds by the `keyboard-map` permissions policy).
 * Everywhere else the US letter stands, which is what the code names anyway.
 *
 * Letters and digits only: they need no translation. Named keys (Space, Esc)
 * are drawn as shapes by the glyphs, never as words.
 */

const labels = reactive<Record<string, string>>({})

const fallback = (code: string): string => {
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  if (code.startsWith('Numpad')) return code.slice(6)
  if (code === 'Escape') return 'Esc'
  if (code === 'Tab') return '⇥'
  return code
}

/** The printed label of a physical key, e.g. `KeyW` → "W" (or "Z" on AZERTY). */
export const keyLabel = (code: string): string => labels[code] ?? fallback(code)

/** The keys the HUD ever draws. */
const DRAWN = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyB', 'KeyH', 'KeyQ', 'Digit1', 'Digit2']

let asked = false
/** Ask the browser for the layout once (safe to call repeatedly). */
export const loadKeyboardLayout = async (): Promise<void> => {
  if (asked) return
  asked = true
  const kb = (typeof navigator !== 'undefined' ? (navigator as Navigator & {
    keyboard?: { getLayoutMap?: () => Promise<Map<string, string>> }
  }).keyboard : undefined)
  if (!kb?.getLayoutMap) return
  try {
    const map = await kb.getLayoutMap()
    for (const code of DRAWN) {
      const k = map.get(code)
      // Only single printable characters; a dead key or a word keeps the default.
      if (k && [...k].length === 1 && k.trim()) labels[code] = k.toUpperCase()
    }
  } catch {
    // Permissions policy in an embed, or no layout: the US letters stand.
  }
}
