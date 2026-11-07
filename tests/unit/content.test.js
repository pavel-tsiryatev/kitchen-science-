// Разбор Markdown-статей: понятные ошибки для авторов контента
import { describe, it, expect } from 'vitest';
import { parseArticle, BODY_SECTIONS } from '../../scripts/content.mjs';

const body = BODY_SECTIONS.filter(([, , req]) => req).map(([h]) => `## ${h}\n\nТекст раздела «${h}».\n`).join('\n');
const meta = (over = '') => `---
id: z1
section: A
title: Тестовая статья
idea: Идея
related: []
quiz:
  question: Вопрос?
  options: [Да, Нет]
  answer: 0
  explanation: Потому что.
sources:
  - Книга без идентификатора
${over}---
`;
const parse = (text, file = 'z1.md') => parseArticle(text, file);

describe('parseArticle', () => {
  it('разбирает поля, вопрос и разделы', () => {
    const a = parse(meta() + body);
    expect(a).toMatchObject({ id: 'z1', sec: 'A', title: 'Тестовая статья', evidence: 'unverified', related: [] });
    expect(a.quiz).toEqual({ q: 'Вопрос?', opts: ['Да', 'Нет'], a: 0, exp: 'Потому что.' });
    expect(a.what).toBe('Текст раздела «Что происходит».');
    expect(a.limitations).toBeUndefined();
    expect(a.sources).toEqual([{ text: 'Книга без идентификатора' }]);
  });

  it('ингредиенты: порции, числа, диапазоны и «по вкусу»', () => {
    const ing = `ingredients:\n  servings: 2\n  title: Гречка\n  items:\n    - [Гречка, 1, стакан]\n    - [Картофель, [600, 700], г]\n    - [Соль, null, по вкусу]\n`;
    const a = parse(meta().replace('quiz:', ing + 'quiz:') + body);
    expect(a.ingredients).toEqual({ servings: 2, title: 'Гречка', items: [{ name: 'Гречка', qty: 1, unit: 'стакан' }, { name: 'Картофель', qty: [600, 700], unit: 'г' }, { name: 'Соль', qty: null, unit: 'по вкусу' }] });
  });
  it.each([
    ['servings: 0\n  items:\n    - [Соль, 1, г]', /servings/],
    ['servings: 2\n  items: []', /непустой список/],
    ['servings: 2\n  items:\n    - [Соль, 1, щепотка]', /неизвестная единица/],
    ['servings: 2\n  items:\n    - [Соль, [5, 2], г]', /количество/],
    ['servings: 2\n  items:\n    - [Соль, 1]', /название, количество, единица/],
  ])('ошибка в ингредиентах: %s', (block, re) => {
    expect(() => parse(meta().replace('quiz:', `ingredients:\n  ${block}\nquiz:`) + body)).toThrow(re);
  });

  it('схемы: только из списка src/data/figures.json', () => {
    expect(parse(meta().replace('quiz:', 'figures:\n  - boil\nquiz:') + body).figures).toEqual(['boil']);
    expect(() => parse(meta().replace('quiz:', 'figures:\n  - kettle\nquiz:') + body)).toThrow(/figures/);
  });

  it('блюдо с подгруппой', () => {
    expect(parse(meta().replace('section: A', 'section: I\ngroup: soup') + body).group).toBe('soup');
    expect('group' in parse(meta() + body)).toBe(false);
  });

  it('абзацы разделяются пустой строкой, переносы внутри абзаца склеиваются', () => {
    const a = parse(meta() + body.replace('Текст раздела «Что происходит».', 'Первая строка\nпродолжение.\n\nВторой абзац.'));
    expect(a.what).toBe('Первая строка продолжение.\n\nВторой абзац.');
  });

  it('структурированный источник: DOI, ISBN без дефисов', () => {
    const a = parse(meta().replace('  - Книга без идентификатора\n', `  - authors: Автор А.
    year: 2020
    title: Статья
    doi: 10.1000/xyz123
  - authors: Автор Б.
    year: 2015
    title: Книга
    isbn: 978-1-4987-2669-6
`).replace('related: []', 'related: []\nevidence: high\nreviewed: 2026-11-05') + body);
    expect(a.evidence).toBe('high');
    expect(a.reviewed).toBe('2026-11-05');
    expect(a.sources[0]).toEqual({ authors: 'Автор А.', year: 2020, title: 'Статья', doi: '10.1000/xyz123' });
    expect(a.sources[1].isbn).toBe('9781498726696');
  });

  it.each([
    ['нет блока полей', 'просто текст', /начинаться с блока/],
    ['нет раздела', meta() + body.replace(/## Коротко[\s\S]*$/, ''), /нет раздела «## Коротко»/],
    ['неизвестный раздел', meta() + body + '\n## Лирическое отступление\n\nТекст', /неизвестный раздел «## Лирическое отступление»/],
    ['повтор раздела', meta() + body + '\n## Коротко\n\nЕщё раз', /встречается дважды/],
    ['неизвестная секция', meta().replace('section: A', 'section: Q') + body, /неизвестный раздел «Q»/],
    ['блюдо без подгруппы', meta().replace('section: A', 'section: I') + body, /укажите «group»/],
    ['неизвестная подгруппа', meta().replace('section: A', 'section: I\ngroup: desserts') + body, /укажите «group»/],
    ['подгруппа не у блюда', meta().replace('section: A', 'section: A\ngroup: soup') + body, /только у статей раздела I/],
    ['неверный ответ', meta().replace('answer: 0', 'answer: 5') + body, /quiz.answer/],
    ['нет источников', meta().replace(/sources:\n.*\n/, 'sources: []\n') + body, /хотя бы один источник/],
    ['имя файла', meta() + body, /имя файла должно совпадать с id: z1.md/, 'другое.md'],
    ['проверенная без даты', meta('evidence: high\n') + body, /reviewed/],
    ['проверенная с текстовым источником', meta('evidence: high\nreviewed: 2026-01-01\n') + body, /у проверенной статьи источник должен быть с полями/],
    ['кривой DOI', meta().replace('  - Книга без идентификатора\n', '  - { authors: А, year: 2020, title: Т, doi: "doi.org/10.1/x" }\n') + body, /не похож на DOI/],
    ['источник без ссылки', meta().replace('  - Книга без идентификатора\n', '  - { authors: А, year: 2020, title: Т }\n') + body, /укажите doi, isbn, url или published/],
    ['ошибка YAML', meta().replace('title: Тестовая статья', 'title: [незакрытая'), /ошибка в блоке полей/],
  ])('ошибка: %s', (_, text, err, file = 'z1.md') => {
    expect(() => parse(text, file)).toThrow(err);
  });

  it('двоеточие в значении без кавычек — подсказка, как исправить', () => {
    expect(() => parse(meta().replace('idea: Идея', 'idea: Идея: с двоеточием, а дальше: ещё') + body)).toThrow(/возьмите всё значение в кавычки/);
  });

  it('в сообщении об ошибке есть имя файла', () => {
    expect(() => parse(meta().replace('answer: 0', 'answer: 9') + body)).toThrow(/^z1\.md:/);
  });
});
