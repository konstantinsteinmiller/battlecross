import { onUnmounted, ref, type Ref } from 'vue'

/**
 * A media query as a ref, for the few places where a layout differs in what
 * it RENDERS and not only in how it is styled (six key stats on a phone,
 * the whole list on a desktop). Everything else stays in CSS.
 */
export const useMedia = (query: string): Ref<boolean> => {
  const on = ref(false)
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return on
  const mq = window.matchMedia(query)
  on.value = mq.matches
  const update = (): void => { on.value = mq.matches }
  mq.addEventListener?.('change', update)
  onUnmounted(() => mq.removeEventListener?.('change', update))
  return on
}
