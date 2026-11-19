import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

// O Google só entrega os ícones listados em nuxt.config.ts (MATERIAL_ICONS).
// Este teste falha se algum componente usar um ícone que não está na lista.
const root = path.resolve(__dirname, '..')
const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap(e => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.vue') ? [path.join(dir, e.name)] : []))

describe('ícones Material Symbols', () => {
  it('todos os ícones usados estão na lista do nuxt.config.ts', () => {
    const config = fs.readFileSync(path.join(root, 'nuxt.config.ts'), 'utf8')
    const listed = new Set([...config.slice(config.indexOf('MATERIAL_ICONS'), config.indexOf('\n]', config.indexOf('MATERIAL_ICONS'))).matchAll(/'([a-z_0-9]+)'/g)].map(m => m[1]))
    const used = new Set<string>()
    for (const file of walk(path.join(root, 'app'))) {
      const src = fs.readFileSync(file, 'utf8')
      for (const m of src.matchAll(/material-symbols-outlined[^>]*>\s*([^<]*?)\s*</gs)) {
        const t = m[1]!
        if (t.includes('{{')) for (const q of t.matchAll(/'([a-z_0-9]+)'/g)) used.add(q[1]!)
        else if (t) used.add(t)
      }
      for (const m of src.matchAll(/icon:\s*'([a-z_0-9]+)'/g)) used.add(m[1]!)
    }
    const missing = [...used].filter(i => !listed.has(i))
    expect(missing).toEqual([])
  })
})
