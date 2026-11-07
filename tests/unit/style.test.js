// Типографика и ссылки во всех статьях: ошибки, которые легко пропустить при правке
import { describe, it, expect } from 'vitest';
import { ARTICLES } from '../../src/data/index.js';
import { BODY_SECTIONS } from '../../scripts/content.mjs';

const FIELDS = ['title', 'idea', ...BODY_SECTIONS.map(s => s[1])];
const texts = ARTICLES.flatMap(a => FIELDS.filter(f => a[f]).map(f => [`${a.id}.${f}`, a[f]]));
const bad = (re) => texts.filter(([, t]) => re.test(t)).map(([k, t]) => `${k}: …${t.match(re)[0]}…`);

describe('типографика статей', () => {
  it('нет латиницы внутри русских слов (с, о, р, е, а латинские)', () => expect(bad(/[а-яё][a-z]|[a-z][а-яё]/i)).toEqual([]));
  it('перед °C пробел: «60 °C»', () => expect(bad(/\d°C/)).toEqual([]));
  it('нет прямых кавычек — только «ёлочки»', () => expect(bad(/"/)).toEqual([]));
  it('тире между словами, а не дефис', () => expect(bad(/\S - \S/)).toEqual([]));
  it('диапазоны через тире: 5–7, а не 5-7', () => expect(bad(/\d-\d/)).toEqual([]));
  it('нет двойных пробелов и пробела перед запятой или точкой', () => expect(bad(/ {2}|\S [,.;:!?](?!\d)/)).toEqual([]));
  it('нет звёздочек разметки', () => expect(bad(/\*\*/)).toEqual([]));
  it('кавычки «» закрыты', () => {
    const open = texts.filter(([, t]) => (t.match(/«/g) || []).length !== (t.match(/»/g) || []).length).map(([k]) => k);
    expect(open).toEqual([]);
  });
});

describe('ссылки «Связанные темы»', () => {
  const byId = Object.fromEntries(ARTICLES.map(a => [a.id, a]));
  it('у каждой статьи от 2 до 7 связей', () => {
    for (const a of ARTICLES) { expect(a.related.length, a.id).toBeGreaterThanOrEqual(2); expect(a.related.length, a.id).toBeLessThanOrEqual(7); }
  });
  it('связь односторонняя, только если у статьи уже 7 связей', () => {
    const lost = ARTICLES.flatMap(a => a.related.filter(r => !byId[r].related.includes(a.id) && byId[r].related.length < 7).map(r => `${a.id} → ${r}`));
    expect(lost).toEqual([]);
  });
});
