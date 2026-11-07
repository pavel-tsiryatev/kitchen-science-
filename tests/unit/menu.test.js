// Меню на неделю
import { describe, it, expect } from 'vitest';
import { addToMenu, emptyMenu, menuCount, menuToShopping, sanitizeMenu, DAY_IDS } from '../../src/menu.js';
import { ARTICLES } from '../../src/data/index.js';

describe('меню на неделю', () => {
  it('добавление: одно блюдо в один день складывает порции', () => {
    let m = addToMenu(emptyMenu(), 'mon', 'i1', 2);
    m = addToMenu(m, 'mon', 'i1', 3);
    m = addToMenu(m, 'wed', 'i6', 3);
    expect(m.mon).toEqual([{ id: 'i1', servings: 5 }]);
    expect(menuCount(m)).toBe(2);
    expect(DAY_IDS).toHaveLength(7);
  });
  it('список покупок: одно блюдо в разные дни считается вместе', () => {
    let m = addToMenu(emptyMenu(), 'mon', 'i1', 2);
    m = addToMenu(m, 'thu', 'i1', 2); // жареная картошка: 600–700 г на 2 порции
    const list = menuToShopping(m, ARTICLES);
    expect(list.find(x => x.name === 'Картофель')).toMatchObject({ qty: [1200, 1400], unit: 'г', src: ['i1'] });
  });
  it('продукты из разных блюд объединяются и добавляются к уже имеющемуся списку', () => {
    const m = addToMenu(addToMenu(emptyMenu(), 'mon', 'i8', 4), 'tue', 'i24', 4); // блины и оладьи: мука в обоих
    const list = menuToShopping(m, ARTICLES, [{ key: 'хлеб|', name: 'Хлеб', qty: null, unit: '', done: false, src: [] }]);
    expect(list[0].name).toBe('Хлеб');
    const flour = list.find(x => x.name === 'Мука');
    expect(flour.qty).toEqual([450, 480]); // 200 г + 250–280 г
    expect(flour.src).toEqual(['i8', 'i24']);
  });
  it('проверка сохранённого меню', () => {
    const m = sanitizeMenu({ mon: [{ id: 'i1', servings: 2 }, { id: 'a1', servings: 2 }, { id: 'zzz', servings: 1 }, { id: 'i6', servings: 0 }], xyz: [], tue: 'bad' }, ARTICLES);
    expect(m.mon).toEqual([{ id: 'i1', servings: 2 }]); // у a1 нет ингредиентов
    expect(m.tue).toEqual([]);
    expect(Object.keys(m)).toEqual(DAY_IDS);
    expect(sanitizeMenu([1, 2], ARTICLES)).toBeNull();
  });
});
