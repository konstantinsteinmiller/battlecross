// ─── Glitch install lifecycle ──────────────────────────────────────────────
//
// Create/reuse an install, validate it before play, and heartbeat it — the
// contract from Glitch's Technical Integration doc:
//
//   - `user_install_id` is OUR stable key (created once, persisted). The
//     create-install endpoint finds-or-updates by it, so re-posting it with a
//     `session_id` is the heartbeat.
//   - `install_id` is Glitch's UUID (`data.id` of the create response). It is
//     what validate / cloud save use. Never swap the two.
//   - The Desktop App / store may hand both in as URL params; those win over
//     anything we stored.
//
// Kept free of Vue and globals (fetch, storage, URL params are injected) so
// the whole flow is unit-testable.

export const GLITCH_API_BASE = 'https://api.glitch.fun/api'

const STORAGE_INSTALL_ID = 'glitch_install_id'
const STORAGE_USER_INSTALL_ID = 'glitch_user_install_id'

const MAX_ATTEMPTS = 3

export type GlitchDenyReason =
  | 'INSTALL_NOT_FOUND'
  | 'LICENSE_EXPIRED_OR_MISSING'
  | 'TRIAL_EXPIRED'
  | 'ACCOUNT_SUSPENDED'
  | 'SUBSCRIPTION_REQUIRED'
  | 'AGE_GATE_LOCKED'
  | 'UNAUTHENTICATED'
  | 'NETWORK'
  | 'UNKNOWN'

export interface GlitchValidation {
  valid: boolean
  reason?: string | null
  code?: string | null
  disable_playtime_tracking?: boolean | null
}

export type GlitchConnectResult =
  | { ok: true; installId: string; userInstallId: string | null; validation: GlitchValidation }
  | { ok: false; reason: GlitchDenyReason | string }

export interface GlitchConnectDeps {
  titleId: string
  token: string
  search: URLSearchParams
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null
  fetch: typeof fetch
  gameVersion: string
  userAgent: string
  sessionId: string
  /** Delay between network retries; injectable so tests don't wait. */
  sleep?: (ms: number) => Promise<void>
}

const safeGet = (s: GlitchConnectDeps['storage'], k: string): string | null => {
  try { return s?.getItem(k) ?? null } catch { return null }
}
const safeSet = (s: GlitchConnectDeps['storage'], k: string, v: string): void => {
  try { s?.setItem(k, v) } catch { /* private mode — fine, we just re-create next boot */ }
}
const safeRemove = (s: GlitchConnectDeps['storage'], k: string): void => {
  try { s?.removeItem(k) } catch { /* ignore */ }
}

const randomId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `bc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`

export const newSessionId = randomId

const detectDeviceType = (ua: string): string =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? 'mobile' : 'desktop'

const detectOs = (ua: string): string => {
  if (/Windows/i.test(ua)) return 'windows'
  if (/Android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Mac OS X|Macintosh/i.test(ua)) return 'mac'
  if (/CrOS/i.test(ua)) return 'chromeos'
  if (/Linux/i.test(ua)) return 'linux'
  return 'browser'
}

/** Body for POST /installs — both first create and every heartbeat. */
export const installBody = (deps: GlitchConnectDeps, userInstallId: string): Record<string, unknown> => ({
  user_install_id: userInstallId,
  platform: 'web',
  device_type: detectDeviceType(deps.userAgent),
  operating_system: detectOs(deps.userAgent),
  game_version: deps.gameVersion.slice(0, 50),
  build_type: 'production',
  session_id: deps.sessionId
})

const headers = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${token}`
})

/** POST with retry on network errors / 5xx / 429. Other statuses return as-is. */
const postWithRetry = async (
  deps: GlitchConnectDeps,
  url: string,
  body: unknown
): Promise<Response | null> => {
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await deps.fetch(url, { method: 'POST', headers: headers(deps.token), body: JSON.stringify(body) })
      if (res.status < 500 && res.status !== 429) return res
    } catch {
      /* network loss — retry */
    }
    if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1))
  }
  return null
}

const readJson = async (res: Response): Promise<Record<string, unknown>> => {
  try { return (await res.json()) as Record<string, unknown> } catch { return {} }
}

const installsUrl = (titleId: string): string => `${GLITCH_API_BASE}/titles/${titleId}/installs`

/** Create (or find-and-update) the install for `userInstallId`; returns Glitch's install_id. */
const createInstall = async (
  deps: GlitchConnectDeps,
  userInstallId: string
): Promise<{ installId: string } | { error: GlitchDenyReason }> => {
  const res = await postWithRetry(deps, installsUrl(deps.titleId), installBody(deps, userInstallId))
  if (!res) return { error: 'NETWORK' }
  if (res.status === 401) return { error: 'UNAUTHENTICATED' }
  if (!res.ok) return { error: 'UNKNOWN' }
  const json = await readJson(res)
  const id = (json.data as { id?: unknown } | undefined)?.id
  return typeof id === 'string' && id ? { installId: id } : { error: 'UNKNOWN' }
}

const validate = async (
  deps: GlitchConnectDeps,
  installId: string
): Promise<GlitchValidation | { error: GlitchDenyReason }> => {
  const res = await postWithRetry(deps, `${installsUrl(deps.titleId)}/${installId}/validate`, {})
  if (!res) return { error: 'NETWORK' }
  if (res.status === 401) return { error: 'UNAUTHENTICATED' }
  const json = await readJson(res)
  if (res.ok && json.valid === true) return json as unknown as GlitchValidation
  if (res.status === 404) return { valid: false, reason: 'INSTALL_NOT_FOUND' }
  return {
    valid: false,
    reason: (json.reason as string) ?? (json.code as string) ?? 'UNKNOWN',
    code: (json.code as string) ?? null
  }
}

/**
 * Boot handshake: resolve ids → (create if needed) → validate. On
 * INSTALL_NOT_FOUND for an id we own, re-create once and validate again.
 */
export const connectGlitch = async (deps: GlitchConnectDeps): Promise<GlitchConnectResult> => {
  const { search, storage } = deps
  const urlInstallId = search.get('install_id')
  const urlUserInstallId = search.get('user_install_id')

  // Our stable key: the launcher's when given, else the persisted one, else new.
  let userInstallId = urlUserInstallId || safeGet(storage, STORAGE_USER_INSTALL_ID)
  // A launcher install_id without its user_install_id: we don't know the key
  // that install was registered under, so we must not invent one (that would
  // register a second, phantom install). Validate only, no create/heartbeat.
  const ownsKey = !urlInstallId || !!urlUserInstallId
  if (!userInstallId && ownsKey) {
    userInstallId = randomId()
  }
  if (userInstallId && !urlUserInstallId) safeSet(storage, STORAGE_USER_INSTALL_ID, userInstallId)

  let installId = urlInstallId || safeGet(storage, STORAGE_INSTALL_ID)
  let created = false
  if (!installId) {
    const c = await createInstall(deps, userInstallId!)
    if ('error' in c) return { ok: false, reason: c.error }
    installId = c.installId
    created = true
  }

  let v = await validate(deps, installId)
  if ('error' in v) return { ok: false, reason: v.error }

  if (!v.valid && v.reason === 'INSTALL_NOT_FOUND' && !created && ownsKey && userInstallId) {
    safeRemove(storage, STORAGE_INSTALL_ID)
    const c = await createInstall(deps, userInstallId)
    if ('error' in c) return { ok: false, reason: c.error }
    installId = c.installId
    v = await validate(deps, installId)
    if ('error' in v) return { ok: false, reason: v.error }
  }

  if (!v.valid) return { ok: false, reason: v.reason || 'UNKNOWN' }

  if (!urlInstallId) safeSet(storage, STORAGE_INSTALL_ID, installId)
  return { ok: true, installId, userInstallId: ownsKey ? userInstallId : null, validation: v }
}

/** Best-effort heartbeat: re-post the install with the same user_install_id + session_id. */
export const sendHeartbeat = (deps: GlitchConnectDeps, userInstallId: string): void => {
  deps
    .fetch(installsUrl(deps.titleId), {
      method: 'POST',
      headers: headers(deps.token),
      body: JSON.stringify(installBody(deps, userInstallId)),
      keepalive: true
    })
    .catch(() => {
      /* swallow — heartbeat is best-effort */
    })
}
