// Поиск: стемминг, служебные слова, ранжирование, подсветка и фрагмент
import { describe, it, expect } from 'vitest';
import { stem, queryStems, buildIndex, search, highlight, snippet } from '../../src/search.js';
import { ARTICLES } from '../../src/data/index.js';

describe('стеммер Snowball', () => {
  // Эталонные значения — из официальной реализации snowballstemmer (Python)
  it.each([
    ['клейковина', 'клейковин'], ['клейковины', 'клейковин'], ['клейковиной', 'клейковин'],
    ['сочный', 'сочн'], ['сочность', 'сочност'], ['жарить', 'жар'], ['жарка', 'жарк'],
    ['поджаренный', 'поджарен'], ['майонеза', 'майонез'], ['хлебный', 'хлебн'],
    ['черствение', 'черствен'], ['морозилке', 'морозилк'], ['ее', 'е'],
  ])('%s → %s', (w, s) => expect(stem(w)).toBe(s));

  it('ё и регистр не важны, нерусские слова не трогаются', () => {
    expect(stem('Теплоёмкость')).toBe(stem('теплоемкость'));
    expect(stem('NaCl')).toBe('nacl');
    expect(stem('100')).toBe('100');
  });
});

describe('запрос', () => {
  it('служебные слова отбрасываются', () => {
    expect(queryStems('Почему мясо сухое?')).toEqual(['мяс', 'сух']);
  });
  it('если запрос из одних служебных слов — ищем по ним', () => {
    expect(queryStems('как')).toEqual(['как']);
  });
  it('пустой запрос', () => {
    expect(queryStems('  ')).toEqual([]);
  });
});

describe('поиск по статьям', () => {
  const index = buildIndex(ARTICLES);
  const ids = q => (search(index, q) || []).map(r => r.article.id);

  it('пустой запрос — null (показываем всё)', () => expect(search(index, '')).toBeNull());

  it('форма слова не важна', () => {
    expect(ids('клейковины')).toEqual(ids('клейковина'));
    expect(ids('клейковиной')[0]).toBe('a1');
  });

  it('совпадение в заголовке выше, чем в тексте', () => {
    expect(ids('черствеет хлеб')[0]).toBe('a6');
    expect(ids('майонез расслоился')[0]).toBe('d1');
    expect(ids('эмульсии')[0]).toBe('d1');
  });

  it('все значимые слова должны найтись', () => {
    expect(ids('майонез абракадабра')).toEqual([]);
  });

  it('недописанное слово ищется по началу', () => {
    expect(ids('клейк')).toContain('a1');
  });

  it('короткая основа не цепляет случайные слова', () => {
    // «рис» не должен находить «рискует» в статье о шоколаде (b3)
    expect(ids('рис')).toContain('f5');
    expect(ids('рис')).not.toContain('b3');
  });
});

describe('подсветка и фрагмент', () => {
  it('подсвечиваются слова в любой форме, остальной текст не меняется', () => {
    const parts = highlight('Клейковина и клейковины: сеть', ['клейковин']);
    expect(parts.map(p => p.text).join('')).toBe('Клейковина и клейковины: сеть');
    expect(parts.filter(p => p.hit).map(p => p.text)).toEqual(['Клейковина', 'клейковины']);
  });
  it('без совпадений — один кусок текста', () => {
    expect(highlight('просто текст', ['майонез'])).toEqual([{ text: 'просто текст', hit: false }]);
  });
  it('фрагмент вокруг совпадения, по границам слов', () => {
    const a = { what: 'Начало текста. ' + 'слово '.repeat(30) + 'майонеза здесь. ' + 'хвост '.repeat(30) };
    const s = snippet(a, ['майонез']);
    expect(s).toMatch(/^…слово.*майонеза здесь.*хвост…$/);
    expect(s.length).toBeLessThan(180);
  });
  it('нет совпадения — нет фрагмента', () => {
    expect(snippet({ what: 'текст' }, ['майонез'])).toBeNull();
  });
});

describe('поиск по ингредиентам', async () => {
  const { ARTICLES } = await import('../../src/data/index.js');
  const S = await import('../../src/search.js');
  const I = S.buildIndex(ARTICLES);
  it('«кабачки» находит блюда, где они в составе, первыми', () => {
    const ids = S.search(I, 'кабачки').slice(0, 2).map(r => r.article.id).sort();
    expect(ids).toEqual(['i44', 'i61']);
  });
  it('совпавшие ингредиенты для строки «В составе»', () => {
    const a = ARTICLES.find(x => x.id === 'i53');
    expect(S.ingredientHits(a, S.queryStems('молоко'))).toEqual(['Молоко']);
    expect(S.ingredientHits(a, [])).toEqual([]);
  });
});
