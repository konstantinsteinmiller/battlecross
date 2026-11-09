import { flow } from '@/game/flow'

/**
 * Typing "cmonc" anywhere (not into a text field) opens the cheat menu, and
 * typing it again closes it. Read on the window in the capture phase.
 */
const WORD = 'cmonc'

export const installCheatWord = (): (() => void) => {
  let typed = ''
  let last = 0
  const onKey = (e: KeyboardEvent): void => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return
    const el = e.target as HTMLElement | null
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
    const now = Date.now()
    if (now - last > 2000) typed = ''
    last = now
    typed = (typed + e.key.toLowerCase()).slice(-WORD.length)
    if (typed !== WORD) return
    typed = ''
    if (flow.loading || flow.talk || (flow.modal && flow.modal !== 'cheat')) return
    flow.modal = flow.modal === 'cheat' ? '' : 'cheat'
  }
  window.addEventListener('keydown', onKey, true)
  return () => window.removeEventListener('keydown', onKey, true)
}
