// Глоссарий: проверка словаря, термины в тексте статей, поиск терминов
import { describe, it, expect } from 'vitest';
import { parseGlossary } from '../../scripts/content.mjs';
import { compileGlossary, linkTerms, searchGlossary } from '../../src/glossary.js';
import { queryStems } from '../../src/search.js';
import { GLOSSARY, ARTICLES } from '../../src/data/index.js';

const IDS = new Set(['a1', 'b1']);
const entry = (o = '') => `- id: gluten\n  term: Клейковина\n  aliases: [глютен]\n  definition: Сеть белков.\n  articles: [a1]\n${o}`;

describe('parseGlossary', () => {
  it('разбирает и сортирует по алфавиту', () => {
    const g = parseGlossary(entry() + '- id: acid\n  term: Акриламид\n  definition: Вещество.\n', IDS);
    expect(g.map(t => t.term)).toEqual(['Акриламид', 'Клейковина']);
    expect(g[1]).toEqual({ id: 'gluten', term: 'Клейковина', aliases: ['глютен'], definition: 'Сеть белков.', articles: ['a1'] });
  });
  it.each([
    ['повтор id', entry() + entry().replace('Клейковина', 'Другое').replace('[глютен]', '[]'), /повторяющийся id/],
    ['повтор названия в синониме', entry() + '- id: g2\n  term: Глютен\n  definition: Д.\n', /уже есть у термина «Клейковина»/],
    ['несуществующая статья', entry().replace('[a1]', '[zz9]'), /несуществующая статья «zz9»/],
    ['id не латиницей', entry().replace('id: gluten', 'id: Клей'), /латиницей/],
    ['нет определения', entry().replace('  definition: Сеть белков.\n', ''), /definition/],
    ['двоеточие без кавычек', entry().replace('Сеть белков.', 'Сеть: белков, а дальше: ещё'), /возьмите его в кавычки/],
  ])('ошибка: %s', (_, text, err) => expect(() => parseGlossary(text, IDS)).toThrow(err));
});

describe('термины в тексте', () => {
  const P = compileGlossary([
    { id: 'maillard', term: 'Реакция Майяра', aliases: ['Майяр'] },
    { id: 'gluten', term: 'Клейковина', aliases: ['глютен'] },
  ]);
  it('находит термин в любой форме и не меняет текст', () => {
    const parts = linkTerms('Белки клейковины и реакцией Майяра.', P);
    expect(parts.map(p => p.text).join('')).toBe('Белки клейковины и реакцией Майяра.');
    expect(parts.filter(p => p.term).map(p => [p.text, p.term])).toEqual([['клейковины', 'gluten'], ['реакцией Майяра', 'maillard']]);
  });
  it('ссылкой становится только первое упоминание в статье', () => {
    const used = new Set();
    expect(linkTerms('Клейковина и глютен.', P, used).filter(p => p.term)).toHaveLength(1);
    expect(linkTerms('Снова клейковина.', P, used).filter(p => p.term)).toHaveLength(0);
  });
  it('длинная фраза важнее короткого синонима', () => {
    expect(linkTerms('реакция Майяра', P).find(p => p.term).text).toBe('реакция Майяра');
    expect(linkTerms('просто Майяр', P).find(p => p.term).text).toBe('Майяр');
  });
});

describe('настоящий глоссарий', () => {
  it('каждый термин встречается хотя бы в одной статье', () => {
    const P = compileGlossary(GLOSSARY), seen = new Set();
    for (const a of ARTICLES) {
      const used = new Set();
      for (const k of ['what', 'why', 'factors', 'practice', 'mistakes', 'experiment', 'limitations', 'summary']) linkTerms(a[k], P, used);
      used.forEach(t => seen.add(t));
    }
    expect(GLOSSARY.filter(t => !seen.has(t.id)).map(t => t.term)).toEqual([]);
  });
  it('поиск термина по форме слова', () => {
    expect(searchGlossary(GLOSSARY, queryStems('денатурацией')).map(t => t.id)).toContain('denaturation');
    expect(searchGlossary(GLOSSARY, queryStems('глютен')).map(t => t.id)[0]).toBe('gluten'); // точное совпадение первым
    expect(searchGlossary(GLOSSARY, [])).toEqual([]);
  });
});
