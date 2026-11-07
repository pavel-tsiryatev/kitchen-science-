// «Что приготовить из того, что есть»
import { describe, it, expect } from 'vitest';
import { compileProducts, productOf, required, suggest } from '../../src/fridge.js';
import { ARTICLES, PRODUCTS } from '../../src/data/index.js';

const P = compileProducts(PRODUCTS);
const byId = id => ARTICLES.find(a => a.id === id);

describe('продукты', () => {
  it('id уникальны и в формате для сохранения', () => {
    const ids = PRODUCTS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z_-]{1,30}$/);
  });
  it.each([
    ['Куриные бёдра или окорочка', 'chicken'], ['Томатная паста', 'tomato_paste'], ['Солёные огурцы', 'pickles'],
    ['Огурцы', 'cucumber'], ['Зелёный горошек', 'greenpeas'], ['Горох колотый', 'peas'], ['Квашеная капуста', 'sauerkraut'],
    ['Мука (в крем)', 'flour'], ['Рис', 'rice'], ['Стейк толщиной 2,5–3 см', 'beef'], ['Желтки (в крем)', 'eggs'],
  ])('%s → %s', (name, id) => expect(productOf(name, P)?.id).toBe(id));
  it('каждый обязательный ингредиент блюда сопоставлен с продуктом', () => {
    const lost = ARTICLES.flatMap(a => required(a).filter(it => !productOf(it.name, P)).map(it => `${a.id}: ${it.name}`));
    expect(lost).toEqual([]);
  });
  it('соль, вода, масло и «по желанию» не обязательны', () => {
    const names = required(byId('i1')).map(x => x.name);
    expect(names).toEqual(['Картофель']);
  });
});

describe('подбор блюд', () => {
  it('из картофеля, лука, яиц и муки — драники целиком', () => {
    const r = suggest(ARTICLES, ['potato', 'onion', 'eggs', 'flour'], P);
    const d = r.find(x => x.article.id === 'i23');
    expect(d.missing).toEqual([]);
    expect(r[0].missing).toEqual([]);
  });
  it('чего не хватает — перечислено', () => {
    const d = suggest(ARTICLES, ['milk', 'flour'], P).find(x => x.article.id === 'i8');
    expect(d.missing).toEqual(['Яйцо']);
  });
  it('без выбранных продуктов — пусто', () => expect(suggest(ARTICLES, [], P)).toEqual([]));
});
