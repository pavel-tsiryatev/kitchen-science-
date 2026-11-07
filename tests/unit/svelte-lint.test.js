// Ловушка Svelte 5: если в компоненте импортирован стор под именем «state», то «$state(…)»
// превращается в подписку на него и компонент падает с «e.subscribe is not a function».
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.svelte') && files.push(p); } })('src');

describe('компоненты Svelte', () => {
  it('нет импорта «state» без переименования там, где используется руна $state', () => {
    const bad = files.filter(f => { const s = readFileSync(f, 'utf8'); return /import\s*\{[^}]*\bstate\b(?!\s+as)[^}]*\}\s*from/.test(s) && /\$state\s*\(/.test(s); });
    expect(bad).toEqual([]);
  });
});
