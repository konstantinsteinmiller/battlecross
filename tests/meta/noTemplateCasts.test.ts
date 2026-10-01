// A TypeScript cast inside a pug template (`:id="(x as BossId)"`) type-checks
// under vue-tsc but is shipped to the browser as plain JS, where `as` is a
// syntax error that blanks the whole app at boot (it happened, #103). Casts
// belong in <script setup>; this test keeps them out of every template.

import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(__dirname, '../../src')
const vueFiles = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f)
  return statSync(p).isDirectory() ? vueFiles(p) : f.endsWith('.vue') ? [p] : []
})

describe('templates', () => {
  it('hold no TypeScript casts', () => {
    const bad: string[] = []
    for (const f of vueFiles(root)) {
      const src = readFileSync(f, 'utf8')
      const m = /<template[^>]*>([\s\S]*?)<\/template>\s*(?=<script|<style|$)/.exec(src)
      if (!m) continue
      // An attribute value: `="…"`; a cast in it: ` as Word`.
      for (const v of m[1]!.matchAll(/="([^"]*)"/g)) {
        if (/\bas\s+[A-Z][A-Za-z]*\b/.test(v[1]!)) bad.push(`${f.replace(root, 'src')}: ${v[1]}`)
      }
    }
    expect(bad).toEqual([])
  })
})
