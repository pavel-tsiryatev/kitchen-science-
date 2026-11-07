// Целостность контента: ошибки в JSON ловятся до того, как сломают экран
import { describe, it, expect } from 'vitest';
import { SECTIONS, ARTICLES, TROUBLESHOOTING, COMPARISONS, EVIDENCE_LABEL } from '../../src/data/index.js';
import { EVIDENCE } from '../../scripts/content.mjs';

const articleIds = new Set(ARTICLES.map(a => a.id));
const sectionIds = new Set(SECTIONS.map(s => s.id));
const TEXT_FIELDS = ['title', 'idea', 'what', 'why', 'factors', 'practice', 'mistakes', 'experiment', 'summary'];

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

describe('источники и доказательность', () => {
  it('у каждой статьи есть источники', () => {
    for (const a of ARTICLES) expect(a.sources.length, a.id).toBeGreaterThan(0);
  });
  it('у проверенных статей каждый источник со ссылкой на DOI, ISBN, URL или издателя и датой сверки', () => {
    const verified = ARTICLES.filter(a => a.evidence !== 'unverified');
    expect(verified.length, 'все статьи должны быть проверены').toBe(ARTICLES.length);
    for (const a of verified) {
      expect(a.reviewed, a.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const s of a.sources) {
        expect(s.text, `${a.id}: текстовый источник в проверенной статье`).toBeUndefined();
        expect(s.doi || s.isbn || s.url || s.published, `${a.id}: ${s.title}`).toBeTruthy();
      }
      expect(a.sources.some(s => s.doi), `${a.id}: нужен хотя бы один рецензируемый источник с DOI`).toBe(true);
    }
  });
  it('подписи уровней доказательности в приложении совпадают со сборкой', () => {
    expect(EVIDENCE_LABEL).toEqual(EVIDENCE);
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

describe('справочные таблицы', async () => {
  const { TABLES, ARTICLES } = await import('../../src/data/index.js');
  const ids = new Set(ARTICLES.map(a => a.id));
  it.each(TABLES.map(t => [t.id, t]))('%s: строки по числу колонок, ссылки на существующие статьи', (_, t) => {
    expect(t.rows.length).toBeGreaterThan(0);
    for (const r of t.rows) expect(r).toHaveLength(t.headers.length);
    for (const id of t.articles) expect(ids.has(id), id).toBe(true);
    for (const s of t.sources) { expect(s.title).toBeTruthy(); expect(s.doi || s.publisher).toBeTruthy(); }
  });
  it('температуры совпадают со статьёй о пастеризации', () => {
    const c5 = ARTICLES.find(a => a.id === 'c5');
    const text = [c5.practice, c5.why, c5.factors].join(' ');
    for (const v of ['74 °C', '71 °C', '63 °C']) expect(text).toContain(v);
  });
});

describe('подборки', async () => {
  const { COLLECTIONS, ARTICLES } = await import('../../src/data/index.js');
  const ids = new Set(ARTICLES.map(a => a.id));
  it('id уникальны, ссылки на существующие статьи без повторов', () => {
    expect(new Set(COLLECTIONS.map(c => c.id)).size).toBe(COLLECTIONS.length);
    for (const c of COLLECTIONS) {
      expect(c.title && c.desc, c.id).toBeTruthy();
      expect(new Set(c.ids).size, c.id).toBe(c.ids.length);
      for (const id of c.ids) expect(ids.has(id), `${c.id}: ${id}`).toBe(true);
    }
  });
});
