import { flow } from '@/game/flow'
import { enableCheats } from '@/use/useCheats'

/**
 * The two secret doors to the cheat menu: typing "cmonc" anywhere (not into a text field), and, on a phone, fifty taps on the
 * health bar inside forty seconds (`registerCheatTap`). Either one switches cheat mode on (`localStorage.cheat = 'true'`) and
 * opens the menu; the word typed again closes it. Read on the window in the capture phase.
 */
const WORD = 'cmonc'

/** Cheat mode on, and the menu up (or away, when it is already up). Not while a place loads, a conversation runs or another window is open. */
export const openCheatMenu = (): void => {
  if (flow.loading || flow.talk || (flow.modal && flow.modal !== 'cheat')) return
  enableCheats()
  flow.modal = flow.modal === 'cheat' ? '' : 'cheat'
}

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
    openCheatMenu()
  }
  window.addEventListener('keydown', onKey, true)
  return () => window.removeEventListener('keydown', onKey, true)
}
