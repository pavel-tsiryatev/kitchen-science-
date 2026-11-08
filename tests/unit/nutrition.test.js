// Примерная пищевая ценность на порцию
import { describe, it, expect } from 'vitest';
import { findFood, grams, perServing } from '../../src/nutrition.js';
import { ARTICLES } from '../../src/data/index.js';
import TABLE from '../../src/data/nutrition.json' with { type: 'json' };

const dishes = ARTICLES.filter(a => a.sec === 'I' && a.ingredients);

describe('таблица пищевой ценности', () => {
  it('значения правдоподобны: белки, жиры и углеводы сходятся с калорийностью', () => {
    for (const x of TABLE) {
      expect(() => new RegExp(x.match), x.match).not.toThrow();
      const est = x.p * 4 + x.f * 9 + x.c * 4;
      // допускаем расхождение (клетчатка, алкоголь, округление таблиц)
      expect(Math.abs(est - x.kcal), `${x.match}: ${est} vs ${x.kcal}`).toBeLessThanOrEqual(Math.max(25, x.kcal * 0.15));
      expect(x.p + x.f + x.c).toBeLessThanOrEqual(100);
    }
  });
});

describe('распознавание ингредиентов', () => {
  it.each([
    ['Говяжья грудинка', 'говяжья грудинка'],
    ['Бекон или грудинка', 'бекон|грудинк'],
    ['Куриное филе', 'куриное филе|грудк'],
    ['Яйцо или тёртый сыр', 'яйц|яйко'],
    ['Сливочное масло', 'сливочное масло'],
    ['Растительное масло', 'оливковое масло|растительное масло'],
    ['Солёные огурцы', 'солён.*огур'],
    ['Сладкий перец', 'сладкий перец|болгарск'],
    ['Цветная капуста', 'цветная капуста'],
    ['Мука (в крем)', 'мука'],
  ])('%s', (name, match) => expect(findFood(name)?.match).toBe(match));

  it('граммы из разных единиц', () => {
    expect(grams(1.2, 'кг', findFood('Картофель'))).toBe(1200);
    expect(grams(2, 'шт', findFood('Яйца'))).toBe(110);
    expect(grams(1, 'стакан', findFood('Мука'))).toBe(130);
    expect(grams([2, 4], 'ст. л.', findFood('Сметана'))).toBe(45);
    expect(grams(3, 'зубчик', findFood('Чеснок'))).toBe(15);
    expect(grams(null, 'по вкусу', null)).toBe(0);
  });

  it('у каждого блюда все ингредиенты с количеством распознаны (кроме «Начинки»)', () => {
    const miss = [];
    for (const a of dishes) for (const it of a.ingredients.items) {
      if (it.qty === null || /^начинка/i.test(it.name)) continue;
      const f = findFood(it.name);
      if (!f || grams(it.qty, it.unit, f) === null) miss.push(`${a.id}: ${it.name} (${it.unit})`);
    }
    expect(miss).toEqual([]);
  });
});

describe('на порцию', () => {
  it('считается для блюд и лежит в разумных пределах', () => {
    let shown = 0;
    for (const a of dishes) {
      const n = perServing(a.ingredients);
      if (!n) continue;
      shown++;
      expect(n.kcal, a.id).toBeGreaterThan(50);
      expect(n.kcal, a.id).toBeLessThan(1200);
    }
    expect(shown).toBeGreaterThan(dishes.length - 5);
  });
  it('делится на число порций и не зависит от формата пунктов', () => {
    const one = perServing({ servings: 1, items: [['Сахар', 100, 'г']] });
    expect(one).toEqual({ kcal: 400, p: 0, f: 0, c: 100 });
    expect(perServing({ servings: 2, items: [{ name: 'Сахар', qty: 100, unit: 'г' }] }).c).toBe(50);
  });
  it('неизвестный ингредиент с количеством — не показываем ничего', () => {
    expect(perServing({ servings: 2, items: [['Сахар', 100, 'г'], ['Начинка', 300, 'г']] })).toBeNull();
    expect(perServing({ servings: 2, items: [['Сахар', 100, 'г'], ['Соль', null, 'по вкусу']] })).not.toBeNull();
  });
});

describe('калорийность в карточках и меню', async () => {
  const { dishNutrition, dayKcal } = await import('../../src/nutrition.js');
  const find = id => ARTICLES.find(a => a.id === id);
  it('только для блюд', () => {
    expect(dishNutrition(find('i1'))).not.toBeNull();
    expect(dishNutrition(find('a1'))).toBeNull();
    expect(dishNutrition(find('k1'))).toBeNull();
  });
  it('день меню — по одной порции каждого блюда, блюда без расчёта считаются отдельно', () => {
    const one = dishNutrition(find('i1')).kcal + dishNutrition(find('i26')).kcal;
    expect(dayKcal([{ id: 'i1', servings: 4 }, { id: 'i26', servings: 2 }], find)).toEqual({ kcal: one, unknown: 0 });
    expect(dayKcal([{ id: 'i49', servings: 2 }], find)).toEqual({ kcal: 0, unknown: 1 });
    expect(dayKcal(undefined, find)).toEqual({ kcal: 0, unknown: 0 });
  });
});
