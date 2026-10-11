import { ref, computed } from 'vue'

/**
 * A hash router: GitHub Pages serves one file, so every page is
 * `#/<path>?<query>` and a shared link always opens the right page.
 */
const read = (): string => location.hash.replace(/^#/, '') || '/'
export const route = ref(read())
window.addEventListener('hashchange', () => {
  route.value = read()
  window.scrollTo({ top: 0 })
})

export const path = computed(() => route.value.split('?')[0]!)
export const parts = computed(() => path.value.split('/').filter(Boolean))
export const query = computed(() => new URLSearchParams(route.value.split('?')[1] ?? ''))
export const go = (to: string): void => { location.hash = to }
/** Replace the query without a new history entry or a scroll jump. */
export const setQuery = (q: Record<string, string>): void => {
  const s = new URLSearchParams(q).toString()
  const next = `#${path.value}${s ? `?${s}` : ''}`
  history.replaceState(null, '', next)
  route.value = next.slice(1)
}
