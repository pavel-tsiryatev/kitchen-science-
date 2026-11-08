// Иллюстрации к блюдам и заготовкам
import { describe, it, expect } from 'vitest';
import { dishArt, ART_KINDS } from '../../src/dishArt.js';
import { ARTICLES } from '../../src/data/index.js';
import { readFileSync } from 'node:fs';

const kind = id => dishArt(ARTICLES.find(a => a.id === id));

describe('иллюстрации', () => {
  it('у каждого блюда и заготовки есть картинка, у научных статей — нет', () => {
    for (const a of ARTICLES) {
      if (a.sec === 'I' || a.sec === 'K') expect(ART_KINDS, a.id).toContain(dishArt(a));
      else expect(dishArt(a), a.id).toBeNull();
    }
  });
  it.each([
    ['i26', 'eggs'], // «не трескались» — не треска
    ['i9', 'soup'], ['i47', 'soup'], ['i85', 'fish'], ['i32', 'fish'], ['i21', 'chicken'],
    ['i15', 'meat'], ['i77', 'pasta'], ['i8', 'pancakes'], ['i16', 'dumplings'], ['i87', 'dairy'],
    ['i52', 'cake'], ['i19', 'bake'], ['i14', 'salad'], ['i71', 'sauce'], ['i6', 'grain'],
    ['i86', 'veg'], ['k4', 'jar'],
  ])('%s → %s', (id, k) => expect(kind(id)).toBe(k));
  it('для каждого вида нарисована картинка', () => {
    const svelte = readFileSync('src/components/DishArt.svelte', 'utf8');
    for (const k of ART_KINDS) expect(svelte, k).toContain(`kind === '${k}'`);
  });
});
