// Пересчёт порций, формат количеств и список покупок
import { describe, it, expect } from 'vitest';
import { scaleQty, fmtQty, fmtNum, unitFor, scaleIngredients, addToList, itemKey, listText, toBase } from '../../src/ingredients.js';
import { ARTICLES } from '../../src/data/index.js';
import { UNITS } from '../../scripts/content.mjs';

describe('пересчёт', () => {
  it('число, диапазон и «по вкусу»', () => {
    expect(scaleQty(100, 1.5)).toBe(150);
    expect(scaleQty([600, 700], 2)).toEqual([1200, 1400]);
    expect(scaleQty(null, 3)).toBeNull();
  });
  it('рецепт на другое число порций', () => {
    const ing = { servings: 2, items: [{ name: 'Картофель', qty: [600, 700], unit: 'г' }, { name: 'Соль', qty: null, unit: 'по вкусу' }] };
    expect(scaleIngredients(ing, 4)).toEqual([{ name: 'Картофель', qty: [1200, 1400], unit: 'г' }, { name: 'Соль', qty: null, unit: 'по вкусу' }]);
  });
});

describe('вывод количества', () => {
  it.each([
    [[600, 700], 'г', '600–700 г'],
    [1200, 'г', '1,2 кг'],
    [[1200, 1400], 'г', '1,2–1,4 кг'],
    [1.1, 'кг', '1,1 кг'],
    [0.5, 'л', '500 мл'],
    [937, 'г', '940 г'],
    [33, 'г', '35 г'],
    [1.5, 'ст. л.', '1½ ст. л.'],
    [0.25, 'ч. л.', '¼ ч. л.'],
    [0.1, 'ч. л.', '¼ ч. л.'],
    [2.4, 'шт', '2½ шт'],
    [4.4, 'шт', '4 шт'],
    [2, 'зубчик', '2 зубчика'],
    [5, 'зубчик', '5 зубчиков'],
    [1, 'стакан', '1 стакан'],
    [0.5, 'стакан', '½ стакана'],
    [[3, 4], 'шт', '3–4 шт'],
    [null, 'по вкусу', 'по вкусу'],
  ])('%j %s → %s', (q, u, out) => expect(fmtQty(q, u)).toBe(out));
  it('склонение и дроби', () => {
    expect(unitFor(11, 'зубчик')).toBe('зубчиков');
    expect(unitFor(21, 'пучок')).toBe('пучок');
    expect(fmtNum(2.5, 'г')).toBe('2,5');
  });
});

describe('список покупок', () => {
  it('одинаковые продукты складываются, пояснение в скобках убирается', () => {
    let list = addToList([], [{ name: 'Мука (в тесто)', qty: 450, unit: 'г' }, { name: 'Мука (в крем)', qty: 50, unit: 'г' }], 'i52');
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ name: 'Мука', qty: 500, unit: 'г', src: ['i52'] });
    list = addToList(list, [{ name: 'Мука', qty: 0.2, unit: 'кг' }], 'i8');
    expect(list[0].qty).toBe(700);
    expect(list[0].src).toEqual(['i52', 'i8']);
  });
  it('диапазон + число, купленный продукт снова в списке', () => {
    let list = addToList([], [{ name: 'Картофель', qty: [600, 700], unit: 'г' }]);
    list[0].done = true;
    list = addToList(list, [{ name: 'картофель', qty: 1, unit: 'кг' }]);
    expect(list[0]).toMatchObject({ qty: [1600, 1700], done: false });
  });
  it('разные единицы не смешиваются', () => {
    const list = addToList([], [{ name: 'Лук', qty: 1, unit: 'шт' }, { name: 'Лук', qty: 100, unit: 'г' }]);
    expect(list).toHaveLength(2);
  });
  it('исходный список не меняется', () => {
    const a = addToList([], [{ name: 'Соль', qty: null, unit: 'по вкусу' }]);
    const b = addToList(a, [{ name: 'Соль', qty: null, unit: 'по вкусу' }]);
    expect(a).not.toBe(b); expect(b).toHaveLength(1); expect(b[0].qty).toBeNull();
  });
  it('текст для «Поделиться»', () => {
    const list = addToList([], [{ name: 'Молоко', qty: 500, unit: 'мл' }, { name: 'Соль', qty: null, unit: 'по вкусу' }, { name: 'Хлеб', qty: null, unit: '' }]);
    list[0].done = true;
    expect(listText(list)).toBe('Список покупок\n• Соль\n• Хлеб\n✓ Молоко — 500 мл');
  });
  it('ключ без регистра и «ё»', () => expect(itemKey('Тёплая вода (для теста)', 'мл')).toBe(itemKey('теплая вода', 'мл')));
  it('кг и л приводятся к г и мл', () => expect(toBase([1, 1.5], 'кг')).toEqual([[1000, 1500], 'г']));
});

describe('ингредиенты в статьях', () => {
  const dishes = ARTICLES.filter(a => a.sec === 'I');
  it('у каждого блюда есть ингредиенты', () => {
    for (const a of dishes) expect(a.ingredients, a.id).toBeTruthy();
  });
  it('единицы из списка, количества выводятся без NaN', () => {
    for (const a of ARTICLES.filter(x => x.ingredients)) for (const it of a.ingredients.items) {
      if (it.qty !== null) expect(UNITS, `${a.id}: ${it.name}`).toContain(it.unit);
      for (const n of [1, a.ingredients.servings, 50]) expect(fmtQty(scaleIngredients(a.ingredients, n).find(x => x.name === it.name).qty, it.unit)).not.toMatch(/NaN|undefined/);
    }
  });
});
