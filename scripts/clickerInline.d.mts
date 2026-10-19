export const CLICKER_MARKER: string
export interface ClickerInline { code: string, tag: string, hash: string }
export const clickerInline: (root: string) => ClickerInline
export const injectClicker: (html: string, inline: ClickerInline) => string
