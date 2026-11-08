// Фильтр «без…»
import { describe, it, expect } from 'vitest';
import { fitsDiets, blockers, DIETS } from '../../src/diet.js';
import { ARTICLES } from '../../src/data/index.js';

const a = id => ARTICLES.find(x => x.id === id);
const fits = (id, ...d) => fitsDiets(a(id), d);
const mk = (...names) => ({ ingredients: { items: names.map(name => ({ name, qty: 1, unit: 'шт' })) } });

describe('фильтр по составу', () => {
  it('без мяса и рыбы', () => {
    for (const id of ['i15', 'i75', 'i16', 'i35', 'i36', 'i85', 'i54']) expect(fits(id, 'nomeat'), id).toBe(false);
    for (const id of ['i1', 'i86', 'i90', 'i107', 'i68']) expect(fits(id, 'nomeat'), id).toBe(true);
  });
  it('без яиц, без молочного, без глютена', () => {
    expect(fits('i10', 'noegg')).toBe(false); expect(fits('i59', 'noegg')).toBe(true); expect(fits('i14', 'noegg')).toBe(false);
    expect(fits('i2', 'nodairy')).toBe(false); expect(fits('i96', 'nodairy')).toBe(true); // кокосовое молоко
    expect(fits('i4', 'nogluten')).toBe(false); expect(fits('i72', 'nogluten')).toBe(true); // томатная паста — не макароны
    expect(fits('i91', 'nogluten')).toBe(false); // соевый соус
    expect(fits('i6', 'nogluten')).toBe(true);
  });
  it('несколько ограничений сразу и пустой выбор', () => {
    expect(fits('i86', 'nomeat', 'noegg', 'nodairy', 'nogluten')).toBe(true);
    expect(fits('i2')).toBe(true);
    expect(fitsDiets(a('a1'), ['nomeat'])).toBe(false); // статьи без рецепта не предлагаются
  });
  it('«или» и «по желанию»', () => {
    expect(fitsDiets(mk('Вода или бульон'), ['nomeat'])).toBe(true);
    expect(fitsDiets(mk('Молоко или кефир'), ['nodairy'])).toBe(false);
    expect(fitsDiets(mk('Сметана или майонез'), ['nodairy'])).toBe(true);
    expect(fitsDiets(mk('Пармезан (по желанию)'), ['nodairy'])).toBe(true);
    expect(fitsDiets(mk('Начинка'), ['nomeat'])).toBe(false);
    expect(fitsDiets(mk('Печенье'), ['nomeat'])).toBe(true);
    expect(blockers(a('i2'), 'nodairy')).toEqual(expect.arrayContaining(['Творог 5–9 %']));
  });
  it('у каждого ограничения есть хотя бы 20 блюд', () => {
    for (const d of DIETS) expect(ARTICLES.filter(x => x.sec === 'I' && fitsDiets(x, [d.id])).length, d.id).toBeGreaterThan(20);
  });
});
