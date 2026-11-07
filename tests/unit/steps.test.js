// Шаги для режима «Готовлю» и время для таймеров
import { describe, it, expect } from 'vitest';
import { parseSteps, findTimers } from '../../src/steps.js';
import { ARTICLES } from '../../src/data/index.js';

describe('шаги рецепта', () => {
  it('нумерованные пункты, заголовок части и пояснение', () => {
    const s = parseSteps('Коржи (8 штук):\n\n1. Натрите 250 г масла. 2. Разделите на 8 частей. 3. Выпекайте 7–10 минут.\n\nКрем:\n\n1. Смешайте 4 желтка. 2. Остудите.\n\nСборка: промажьте коржи кремом.');
    expect(s.map(x => [x.section, x.n])).toEqual([['Коржи (8 штук)', 1], ['Коржи (8 штук)', 2], ['Коржи (8 штук)', 3], ['Крем', 1], ['Крем', 2], ['Крем', null]]);
    expect(s[1].text).toBe('Разделите на 8 частей.');
    expect(s[5].text).toBe('Сборка: промажьте коржи кремом.');
  });
  it('числа внутри шага не принимаются за номер следующего шага', () => {
    const s = parseSteps('1. Налейте 2. стакана воды. 2. Варите.');
    expect(s.map(x => x.text)).toEqual(['Налейте 2. стакана воды.', 'Варите.']);
  });
  it('у каждого блюда есть хотя бы два шага', () => {
    for (const a of ARTICLES.filter(x => x.sec === 'I')) expect(parseSteps(a.practice).filter(x => x.n).length, a.id).toBeGreaterThanOrEqual(2);
  });
});

describe('таймеры из текста', () => {
  it.each([
    ['не трогайте 5–7 минут', ['5 мин']],
    ['тушите 1,5–2,5 часа', ['1 ч 30 мин']],
    ['уберите на 1 час', ['1 ч']],
    ['варите 10 мин и ещё 10 минут', ['10 мин']],
    ['Разделите на 8 частей', []],
    ['1,5–2 ч. л. соли', []],
    ['несколько минут', []],
  ])('%s', (t, labels) => expect(findTimers(t).map(x => x.label)).toEqual(labels));
  it('секунды', () => expect(findTimers('варите 8 минут')[0].seconds).toBe(480));
});
