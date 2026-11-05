// Целостность контента: ошибки в JSON ловятся до того, как сломают экран
import { describe, it, expect } from 'vitest';
import { SECTIONS, ARTICLES, TROUBLESHOOTING, COMPARISONS } from '../../src/data/index.js';

const articleIds = new Set(ARTICLES.map(a => a.id));
const sectionIds = new Set(SECTIONS.map(s => s.id));
const TEXT_FIELDS = ['title', 'idea', 'what', 'why', 'factors', 'practice', 'mistakes', 'experiment', 'summary', 'sources'];

describe('разделы', () => {
  it('id и буквы уникальны, есть название и описание', () => {
    expect(sectionIds.size).toBe(SECTIONS.length);
    expect(new Set(SECTIONS.map(s => s.letter)).size).toBe(SECTIONS.length);
    for (const s of SECTIONS) { expect(s.title).toBeTruthy(); expect(s.desc).toBeTruthy(); }
  });
  it('в каждом разделе есть хотя бы одна статья', () => {
    for (const s of SECTIONS) expect(ARTICLES.some(a => a.sec === s.id), s.id).toBe(true);
  });
});

describe('статьи', () => {
  it('id уникальны', () => expect(articleIds.size).toBe(ARTICLES.length));
  it('есть статья a1 для обложки на главной', () => expect(articleIds.has('a1')).toBe(true));

  it.each(ARTICLES.map(a => [a.id, a]))('%s: все поля заполнены и раздел существует', (id, a) => {
    expect(sectionIds.has(a.sec)).toBe(true);
    for (const f of TEXT_FIELDS) expect(typeof a[f] === 'string' && a[f].trim().length > 0, `${id}.${f}`).toBe(true);
  });

  it.each(ARTICLES.map(a => [a.id, a]))('%s: связанные статьи существуют', (id, a) => {
    expect(Array.isArray(a.related)).toBe(true);
    for (const r of a.related) { expect(articleIds.has(r), `${id} → ${r}`).toBe(true); expect(r).not.toBe(id); }
  });

  it.each(ARTICLES.map(a => [a.id, a]))('%s: вопрос корректен', (id, a) => {
    const q = a.quiz;
    expect(q.q).toBeTruthy(); expect(q.exp).toBeTruthy();
    expect(q.opts.length).toBeGreaterThanOrEqual(2);
    expect(Number.isInteger(q.a) && q.a >= 0 && q.a < q.opts.length).toBe(true);
    expect(new Set(q.opts).size, 'варианты ответа не повторяются').toBe(q.opts.length);
  });
});

describe('справочник ошибок', () => {
  it('id уникальны, ссылки ведут на существующие статьи', () => {
    expect(new Set(TROUBLESHOOTING.map(t => t.id)).size).toBe(TROUBLESHOOTING.length);
    for (const t of TROUBLESHOOTING) {
      expect(t.title && t.diag && t.fix, t.id).toBeTruthy();
      expect(t.causes.length).toBeGreaterThan(0);
      expect(articleIds.has(t.rel), `${t.id} → ${t.rel}`).toBe(true);
    }
  });
});

describe('сравнения', () => {
  it('в каждой строке столько же ячеек, сколько заголовков', () => {
    for (const c of COMPARISONS) {
      expect(c.headers.length).toBeGreaterThanOrEqual(2);
      for (const r of c.rows) expect(r.length, `${c.id}: ${r[0]}`).toBe(c.headers.length);
    }
  });
});
