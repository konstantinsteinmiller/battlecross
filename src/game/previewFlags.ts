/**
 * The recorder's two switches, read once from the URL (DEV only). They live in
 * their own import-free module so the renderer and the flow can read them
 * without pulling the scripting handle (`previewFeed.ts`) into their graph.
 * In a build both are constants and every branch on them folds away.
 */

export type Feed = 'off' | 'preview' | 'pure'

const param = (name: string): string | null => {
  try { return new URLSearchParams(window.location.search).get(name) } catch { return null }
}

/**
 * What the renderer leaves out of the picture. `preview` keeps the wordless
 * interface it paints itself (health bars over heads, the rings under the
 * hero and the target); `pure` hides those too.
 */
export const PREVIEW_FEED: Feed = import.meta.env.DEV
  ? (param('feed') === 'pure' ? 'pure' : param('feed') === 'preview' ? 'preview' : 'off')
  : 'off'

/** A recording is being scripted (`?preview=1`): the result screen stays down. */
export const PREVIEW_ON: boolean = import.meta.env.DEV && param('preview') === '1'
