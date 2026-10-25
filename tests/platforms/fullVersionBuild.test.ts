// ─── The iOS unlock stays out of every other build ──────────────────────────
//
// `flow.ts` and the map import `@/use/useFullVersion` statically, so on its own
// every web bundle would carry the `plugin:iap|…` command strings and the
// product id. `vite.config.ts` swaps the module for a stub unless
// `VITE_APP_IAP_UNLOCK=true` (the iOS store build). Pinned here: the alias is
// there and gated on that flag, the stub exports exactly what the real module
// exports (a missing export would break only the web builds), the real module
// is the only one that names the plugin, and the Tauri runtime is reached only
// through the build-time `VITE_APP_NATIVE` literal.

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(__dirname, '..', '..')
const read = (rel: string): string => readFileSync(resolve(ROOT, rel), 'utf8')
const exportsOf = (rel: string): string[] =>
  [...read(rel).matchAll(/^export\s+(?:const|function|let|type)\s+(\w+)/gm)].map((m) => m[1]!).sort()

describe('the full-version unlock in a web bundle', () => {
  it('vite.config.ts aliases the module to its stub unless VITE_APP_IAP_UNLOCK is true', () => {
    const cfg = read('vite.config.ts')
    const at = cfg.indexOf("'@/use/useFullVersion'")
    expect(at).toBeGreaterThan(0)
    const before = cfg.slice(Math.max(0, at - 160), at)
    expect(before).toMatch(/env\.VITE_APP_IAP_UNLOCK === 'true' \? \{\} : \{/)
    expect(cfg.slice(at, at + 140)).toContain('src/use/useFullVersion.stub.ts')
  })

  it('the stub exports exactly what the real module exports', () => {
    expect(existsSync(resolve(ROOT, 'src/use/useFullVersion.stub.ts'))).toBe(true)
    expect(exportsOf('src/use/useFullVersion.stub.ts')).toEqual(exportsOf('src/use/useFullVersion.ts'))
  })

  it('the stub never names the plugin, the product or the Tauri runtime, and never turns the gate on', () => {
    const stub = read('src/use/useFullVersion.stub.ts')
    expect(stub).not.toMatch(/plugin:iap|tauri-apps|com\.hyperg8/i)
    expect(stub).toMatch(/gateActive = computed\(\(\) => false\)/)
  })

  it('only the real module talks to the plugin, and Tauri sits behind the VITE_APP_NATIVE literal', () => {
    const real = read('src/use/useFullVersion.ts')
    expect(real).toMatch(/plugin:iap\|/)
    // No static value import of the Tauri runtime: type-only, or a dynamic import.
    expect(real).not.toMatch(/^import\s+(?!type\b)[^\n]*@tauri-apps\/api/m)
    expect(real).toMatch(/import\.meta\.env\.VITE_APP_NATIVE === 'true'\s*\n\s*\? \(\) => \{[\s\S]*?import\('@tauri-apps\/api\/core'\)/)
  })

  it('the iOS CI build and the shared .env.tauri switch the flag on', () => {
    expect(read('.github/workflows/ios-build.yml')).toMatch(/VITE_APP_IAP_UNLOCK: "true"/)
    expect(read('.env.tauri')).toMatch(/^VITE_APP_IAP_UNLOCK=true$/m)
  })

  it('the Tauri app registers the plugin and its permission', () => {
    expect(read('src-tauri/src/lib.rs')).toContain('tauri_plugin_iap::init()')
    expect(read('src-tauri/Cargo.toml')).toContain('tauri-plugin-iap')
    expect(read('src-tauri/capabilities/default.json')).toContain('iap:default')
  })

  it('the plugin has no Android module, so the Gradle build is untouched', () => {
    expect(existsSync(resolve(ROOT, 'src-tauri/plugins/tauri-plugin-iap/android'))).toBe(false)
    expect(read('src-tauri/plugins/tauri-plugin-iap/build.rs')).not.toMatch(/android_path\(/)
  })
})
