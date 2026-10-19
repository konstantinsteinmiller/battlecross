/** Samsung Internet's user agent. The forced dark mode itself is invisible to JS, so the UA only gates the offer. */
export const isSamsungUa = (ua: string = typeof navigator !== 'undefined' ? navigator.userAgent : ''): boolean =>
  /SamsungBrowser\/\d+/.test(ua)
