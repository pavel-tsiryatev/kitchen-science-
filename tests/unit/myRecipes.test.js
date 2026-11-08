// Свои рецепты
import { describe, it, expect } from 'vitest';
import { parseIngredientLine as p, ingredientLine, parseStepsText, sanitizeMyRecipes, recipeArticle, isMine, newRecipeId } from '../../src/myRecipes.js';

describe('разбор строки ингредиента', () => {
  it.each([
    ['Мука — 200 г', { name: 'Мука', qty: 200, unit: 'г' }],
    ['мука: 200 гр', { name: 'Мука', qty: 200, unit: 'г' }],
    ['Мука 200г', { name: 'Мука', qty: 200, unit: 'г' }],
    ['Яйца 2–3 шт', { name: 'Яйца', qty: [2, 3], unit: 'шт' }],
    ['Яйца 2-3', { name: 'Яйца', qty: [2, 3], unit: 'шт' }],
    ['Лук 1', { name: 'Лук', qty: 1, unit: 'шт' }],
    ['Молоко 1,5 стакана', { name: 'Молоко', qty: 1.5, unit: 'стакан' }],
    ['Молоко 3,2 % — 1 л', { name: 'Молоко 3,2 %', qty: 1, unit: 'л' }],
    ['Сахар ½ ст. л.', { name: 'Сахар', qty: 0.5, unit: 'ст. л.' }],
    ['Сахар 1/2 ст.л.', { name: 'Сахар', qty: 0.5, unit: 'ст. л.' }],
    ['Соль 1 чайная ложка', { name: 'Соль', qty: 1, unit: 'ч. л.' }],
    ['Чеснок 3 зубчика', { name: 'Чеснок', qty: 3, unit: 'зубчик' }],
    ['• Укроп — 1 пучок', { name: 'Укроп', qty: 1, unit: 'пучок' }],
    ['Соль по вкусу', { name: 'Соль', qty: null, unit: 'по вкусу' }],
    ['Масло — для жарки', { name: 'Масло', qty: null, unit: 'для жарки' }],
    ['Лавровый лист', { name: 'Лавровый лист', qty: null, unit: 'по вкусу' }],
    ['Мука 200 пригоршней', { name: 'Мука 200 пригоршней', qty: null, unit: 'по вкусу' }],
    ['Яйца 3–2 шт', { name: 'Яйца 3–2 шт', qty: null, unit: 'по вкусу' }],
  ])('%s', (line, out) => expect(p(line)).toEqual(out));
  it('пустые строки пропускаются', () => { expect(p('   ')).toBeNull(); expect(p('- ')).toBeNull(); });
  it('обратно в строку и снова разбор — то же самое', () => {
    for (const line of ['Мука — 200 г', 'Яйца — 2–3 шт', 'Молоко — 1,5 стакан', 'Соль — по вкусу']) {
      const a = p(line); expect(p(ingredientLine(a))).toEqual(a);
    }
  });
});

describe('шаги и хранение', () => {
  it('шаги: строки, нумерация убирается', () => {
    expect(parseStepsText('1. Нарезать лук\n\n2) Обжарить 5 минут\nПосолить')).toEqual(['Нарезать лук', 'Обжарить 5 минут', 'Посолить']);
  });
  it('проверка сохранённого: битые записи отбрасываются', () => {
    const r = sanitizeMyRecipes([
      { id: 'u1', title: ' Суп ', servings: 4, items: [{ name: 'Вода', qty: 1, unit: 'л' }, { name: '', qty: 1, unit: 'г' }, { name: 'X', qty: -1, unit: 'г' }, { name: 'Соль', qty: null, unit: 'по вкусу' }], steps: ['Сварить', 5, ' '] },
      { id: 'u1', title: 'Дубль' }, { id: 'i1', title: 'Чужой id' }, { id: 'u2', title: '  ' }, null, 'x',
      { id: 'u3', title: 'Без порций', servings: 'много' },
    ]);
    expect(r).toEqual([
      { id: 'u1', title: 'Суп', servings: 4, items: [{ name: 'Вода', qty: 1, unit: 'л' }, { name: 'Соль', qty: null, unit: 'по вкусу' }], steps: ['Сварить'] },
      { id: 'u3', title: 'Без порций', servings: 2, items: [], steps: [] },
    ]);
    expect(sanitizeMyRecipes('x')).toEqual([]);
  });
  it('рецепт как статья: ингредиенты и шаги для общих экранов', () => {
    const [r] = sanitizeMyRecipes([{ id: 'u5', title: 'Каша', servings: 2, items: [{ name: 'Пшено', qty: 1, unit: 'стакан' }], steps: ['Сварить 20 минут'] }]);
    const a = recipeArticle(r);
    expect(a).toMatchObject({ id: 'u5', sec: 'I', mine: true, ingredients: { servings: 2 }, steps: [{ n: 1, text: 'Сварить 20 минут' }] });
    expect(recipeArticle(r)).toBe(a);
    expect(isMine('u5')).toBe(true); expect(isMine('i5')).toBe(false);
    expect(newRecipeId(123)).toBe('u123');
  });
});

describe('количество перед названием', () => {
  it.each([
    ['200 г муки', { name: 'Мука', qty: 200, unit: 'г' }],
    ['2 яйца', { name: 'Яйца', qty: 2, unit: 'шт' }],
    ['1–2 ст. л. сахара', { name: 'Сахар', qty: [1, 2], unit: 'ст. л.' }],
    ['1,5 стакана молока', { name: 'Молоко', qty: 1.5, unit: 'стакан' }],
    ['3 зубчика чеснока', { name: 'Чеснок', qty: 3, unit: 'зубчик' }],
    ['½ ч. л. соды', { name: 'Сода', qty: 0.5, unit: 'ч. л.' }],
    ['50 г сливочного масла', { name: 'Сливочное масло', qty: 50, unit: 'г' }],
    ['1 банка фасоли', { name: 'Фасоль', qty: 1, unit: 'банка' }],
    ['2 столовые ложки сметаны', { name: 'Сметана', qty: 2, unit: 'ст. л.' }],
    ['300 г брокколи', { name: 'Брокколи', qty: 300, unit: 'г' }],
    ['щепотка соли', { name: 'Соль', qty: null, unit: 'щепотка' }],
    ['2 луковицы', { name: 'Лук', qty: 2, unit: 'шт' }],
  ])('%s', (line, out) => expect(p(line)).toEqual(out));
});

describe('фото рецепта', async () => {
  const { okPhoto, photosSize } = await import('../../src/myRecipes.js');
  const jpg = 'data:image/jpeg;base64,' + 'A'.repeat(100);
  it('сохраняется только корректная и небольшая картинка', () => {
    expect(okPhoto(jpg)).toBe(true);
    expect(okPhoto('data:image/svg+xml;base64,AAAA')).toBe(false);
    expect(okPhoto('javascript:alert(1)')).toBe(false);
    expect(okPhoto('data:image/jpeg;base64,' + 'A'.repeat(400000))).toBe(false);
    const [r] = sanitizeMyRecipes([{ id: 'u1', title: 'С фото', photo: jpg }]);
    expect(r.photo).toBe(jpg);
    expect(sanitizeMyRecipes([{ id: 'u2', title: 'Плохое фото', photo: 'http://x' }])[0].photo).toBeUndefined();
    expect(recipeArticle(r).photo).toBe(jpg);
    expect(photosSize([r, { photo: null }])).toBe(jpg.length);
  });
});
