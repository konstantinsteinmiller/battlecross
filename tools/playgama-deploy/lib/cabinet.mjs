// A client for the Playgama Developer Cabinet — the same MCP server Claude Code
// talks to (https://developer.playgama.com/api/mcp), spoken directly from Node
// so `pnpm deploy:playgama` needs no Claude session to upload a build.
//
// ── Auth: OAuth 2.1, public client, PKCE — exactly what the server advertises ──
//
//   /.well-known/oauth-protected-resource  → authorization server
//   /.well-known/oauth-authorization-server → authorize / token / register
//
// The first run registers a client (dynamic registration, no secret), opens
// the consent page in the SYSTEM browser — where the developer is normally
// already signed in to the cabinet — and catches the code on a loopback port.
// The tokens are kept in ~/.playgama-deploy/oauth.json (one Playgama account
// serves every game, so they live outside any repo) and refreshed silently on
// every later run. Delete that file to sign in as someone else.
//
// ── Transport: MCP Streamable HTTP ──
//
// JSON-RPC over POST. The server may answer a request with plain JSON or with
// a one-event SSE stream; both are handled. A tool answers `content[0].text`
// holding JSON, which `call()` parses; an `isError` result throws with the
// server's own words, because those words are the diagnosis.

import { createHash, randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const CABINET = 'https://developer.playgama.com'
export const MCP_URL = `${CABINET}/api/mcp`
export const TOKEN_FILE = join(homedir(), '.playgama-deploy', 'oauth.json')

/** Loopback port for the OAuth redirect. Fixed, so the redirect URI a client
 *  was registered with stays valid across runs. */
const REDIRECT_PORT = Number(process.env.PLAYGAMA_OAUTH_PORT) || 53719
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/callback`
const PROTOCOL = '2025-06-18'

const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null } }
const saveTokens = (t) => {
  mkdirSync(join(homedir(), '.playgama-deploy'), { recursive: true })
  writeFileSync(TOKEN_FILE, JSON.stringify(t, null, 2), { mode: 0o600 })
}

/** Open a URL in the system browser. */
export const openInBrowser = (url) => {
  const [cmd, args] = process.platform === 'win32'
    ? ['cmd', ['/c', 'start', '""', url.replace(/&/g, '^&')]]
    : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]]
  spawn(cmd, args, { stdio: 'ignore', detached: true, windowsVerbatimArguments: true }).unref()
}

const discover = async () => {
  const res = await (await fetch(`${CABINET}/.well-known/oauth-protected-resource`)).json()
  const as = res.authorization_servers?.[0] ?? CABINET
  const meta = await (await fetch(`${as}/.well-known/oauth-authorization-server`)).json()
  return { resource: res.resource ?? MCP_URL, ...meta }
}

const tokenRequest = async (meta, form) => {
  const r = await fetch(meta.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams(form).toString()
  })
  const body = await r.json().catch(() => ({}))
  if (!r.ok || !body.access_token) throw new Error(`token endpoint ${r.status}: ${JSON.stringify(body)}`)
  return body
}

const stamp = (t, prev = {}) => ({
  ...prev,
  access_token: t.access_token,
  refresh_token: t.refresh_token ?? prev.refresh_token,
  expires_at: Date.now() + ((t.expires_in ?? 3600) - 60) * 1000
})

/** Interactive sign-in: register (once), consent in the browser, exchange. */
const signIn = async (meta, log) => {
  let saved = readJson(TOKEN_FILE) ?? {}
  if (!saved.client_id || saved.redirect_uri !== REDIRECT_URI) {
    const r = await fetch(meta.registration_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'playgama-deploy (pnpm deploy:playgama)',
        redirect_uris: [REDIRECT_URI],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
        scope: 'mcp'
      })
    })
    const reg = await r.json().catch(() => ({}))
    if (!r.ok || !reg.client_id) throw new Error(`client registration ${r.status}: ${JSON.stringify(reg)}`)
    saved = { client_id: reg.client_id, redirect_uri: REDIRECT_URI }
    saveTokens(saved)
  }

  const verifier = b64url(randomBytes(32))
  const challenge = b64url(createHash('sha256').update(verifier).digest())
  const state = b64url(randomBytes(16))
  const url = new URL(meta.authorization_endpoint)
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: saved.client_id,
    redirect_uri: REDIRECT_URI,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    scope: 'mcp',
    state,
    resource: meta.resource
  }).toString()

  const code = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { server.close(); reject(new Error('no sign-in within 5 minutes')) }, 5 * 60_000)
    const server = createServer((req, res) => {
      const u = new URL(req.url, REDIRECT_URI)
      if (u.pathname !== '/callback') { res.writeHead(404).end(); return }
      const ok = u.searchParams.get('state') === state && u.searchParams.get('code')
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        .end(ok ? '<h3>Signed in — you can close this tab.</h3>' : `<h3>Sign-in failed: ${u.searchParams.get('error') ?? 'state mismatch'}</h3>`)
      clearTimeout(timer)
      server.close()
      ok ? resolve(u.searchParams.get('code')) : reject(new Error(`sign-in failed: ${u.searchParams.get('error_description') ?? u.searchParams.get('error') ?? 'state mismatch'}`))
    })
    server.on('error', reject)
    server.listen(REDIRECT_PORT, '127.0.0.1', () => {
      log?.('Opening the Playgama sign-in page in your browser…', url.toString())
      openInBrowser(url.toString())
    })
  })

  const t = await tokenRequest(meta, {
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: saved.client_id,
    code_verifier: verifier,
    resource: meta.resource
  })
  const next = stamp(t, saved)
  saveTokens(next)
  return next
}

/** A valid access token: cached, refreshed, or from a fresh sign-in. */
export const accessToken = async ({ log, interactive = true } = {}) => {
  const saved = readJson(TOKEN_FILE)
  if (saved?.access_token && saved.expires_at > Date.now()) return saved.access_token
  const meta = await discover()
  if (saved?.refresh_token && saved.client_id) {
    try {
      const next = stamp(await tokenRequest(meta, {
        grant_type: 'refresh_token',
        refresh_token: saved.refresh_token,
        client_id: saved.client_id,
        resource: meta.resource
      }), saved)
      saveTokens(next)
      return next.access_token
    } catch (e) {
      log?.('Stored Playgama session expired — signing in again.', String(e.message ?? e))
    }
  }
  if (!interactive) throw new Error(`not signed in to Playgama (no usable token in ${TOKEN_FILE})`)
  return (await signIn(meta, log)).access_token
}

/** Read one JSON-RPC answer from a JSON or SSE response. */
const readRpc = async (res) => {
  const type = res.headers.get('content-type') ?? ''
  const text = await res.text()
  if (!type.includes('text/event-stream')) return text ? JSON.parse(text) : null
  let last = null
  for (const block of text.split(/\r?\n\r?\n/)) {
    const data = block.split(/\r?\n/).filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('\n')
    if (!data) continue
    const msg = JSON.parse(data)
    if (msg.id !== undefined) last = msg
  }
  return last
}

/**
 * Connect to the cabinet. Returns `{ call(tool, args) }`.
 * @param {{ log?: (msg: string, detail?: string) => void, interactive?: boolean }} [o]
 */
export const connect = async ({ log, interactive = true } = {}) => {
  let token = await accessToken({ log, interactive })
  let session = null
  let id = 0

  const post = async (body, retry = true) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': PROTOCOL
    }
    if (session) headers['Mcp-Session-Id'] = session
    const res = await fetch(MCP_URL, { method: 'POST', headers, body: JSON.stringify(body) })
    if (res.status === 401 && retry) {
      // Expired between the check and the call: force a refresh once.
      const saved = readJson(TOKEN_FILE)
      if (saved) saveTokens({ ...saved, expires_at: 0 })
      token = await accessToken({ log, interactive })
      return post(body, false)
    }
    const sid = res.headers.get('mcp-session-id')
    if (sid) session = sid
    if (!res.ok && res.status !== 202) throw new Error(`MCP ${res.status}: ${(await res.text()).slice(0, 400)}`)
    return res.status === 202 ? null : readRpc(res)
  }

  const init = await post({
    jsonrpc: '2.0', id: ++id, method: 'initialize',
    params: { protocolVersion: PROTOCOL, capabilities: {}, clientInfo: { name: 'playgama-deploy', version: '1.0.0' } }
  })
  if (init?.error) throw new Error(`MCP initialize: ${init.error.message}`)
  await post({ jsonrpc: '2.0', method: 'notifications/initialized' })

  const call = async (name, args = {}) => {
    const msg = await post({ jsonrpc: '2.0', id: ++id, method: 'tools/call', params: { name, arguments: args } })
    if (msg?.error) throw new Error(`${name}: ${msg.error.message}`)
    const r = msg?.result
    const text = r?.content?.find((c) => c.type === 'text')?.text ?? ''
    if (r?.isError) throw new Error(`${name}: ${text}`)
    try { return JSON.parse(text) } catch { return text }
  }

  return { call, server: init?.result?.serverInfo }
}

export const hasStoredSession = () => existsSync(TOKEN_FILE)
