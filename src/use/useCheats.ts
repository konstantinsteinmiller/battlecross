import { onMounted, onUnmounted, ref } from 'vue'
import { toggleDebug } from '@/use/useMatch'
import { safeGetBool } from '@/utils/safeStorage'

/**
 * Dev cheats.
 *
 * Enabled only when `localStorage.cheat` is truthy (or `?cheat=1` was used by
 * `useMatch`). The cheat MAP is filled by the game at runtime through
 * `registerCheat` rather than by importing game modules here — this file is
 * imported by the eager `App.vue`, and a static import of the mission sim
 * would hoist the whole 3D engine into the entry chunk.
 */
const isCheat = ref<boolean>(safeGetBool('cheat'))

type CheatFn = () => void
const cheats = new Map<string, { fn: CheatFn; label: string }>()

/** Register a cheat under a shortcut like `ctrl+shift+alt+k`. Last one wins. */
export const registerCheat = (shortcut: string, label: string, fn: CheatFn): void => {
  cheats.set(shortcut.toLowerCase(), { fn, label })
}

let debugUnlockInstalled = false
/** Typing "cmarc" anywhere flips debug mode (FPS meter, extra logs). */
export const installDebugUnlock = (): void => {
  if (typeof window === 'undefined' || debugUnlockInstalled) return
  debugUnlockInstalled = true
  const target = 'cmarc'
  let buf = ''
  const isTypingTarget = (el: EventTarget | null): boolean => {
    if (!(el instanceof HTMLElement)) return false
    const tag = el.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    return el.isContentEditable
  }
  window.addEventListener('keydown', (e) => {
    if (isTypingTarget(e.target)) { buf = ''; return }
    const k = e.key.toLowerCase()
    if (k.length !== 1) return
    buf = (buf + k).slice(-target.length)
    if (buf === target) {
      buf = ''
      toggleDebug()
    }
  })
}
installDebugUnlock()

const buildShortcut = (e: KeyboardEvent): string => {
  const parts: string[] = []
  if (e.ctrlKey || e.metaKey) parts.push('ctrl')
  if (e.shiftKey) parts.push('shift')
  if (e.altKey) parts.push('alt')
  const k = e.code.startsWith('Key') ? e.code.slice(3).toLowerCase()
    : e.code.startsWith('Digit') ? e.code.slice(5)
      : e.key.toLowerCase()
  parts.push(k)
  return parts.join('+')
}

const useCheats = () => {
  if (!isCheat.value) return { isCheat }

  const handleKeyDown = (e: KeyboardEvent) => {
    const entry = cheats.get(buildShortcut(e))
    if (!entry) return
    e.preventDefault()
    entry.fn()
    console.warn(`[CHEAT] ${entry.label}`)
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown, { passive: false })
    console.warn('[CHEAT] enabled:', [...cheats.keys()].join(', ') || '(game not loaded yet)')
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return { isCheat }
}

export default useCheats
