// Загрузка, проверка и сохранение данных пользователя (веб-режим, localStorage)
import { describe, it, expect, beforeEach, vi } from 'vitest';

const KEY = 'kuhnya_science_v1';
let store;
beforeEach(async () => {
  localStorage.clear();
  delete window.matchMedia;
  document.body.innerHTML = '<div id="toast"></div>';
  vi.resetModules();
  store = await import('../../src/store.svelte.js');
});

describe('sanitizeSaved', () => {
  it('отвергает не-объекты', () => {
    for (const bad of [null, 42, 'x', [1, 2]]) expect(store.sanitizeSaved(bad)).toBeNull();
  });
  it('оставляет только существующие статьи и убирает дубли', () => {
    const o = store.sanitizeSaved({ readIds: ['a1', 'a1', 'zzz'], favIds: ['b1', 'nope'], recentIds: ['a1', 'a2', 'a3', 'a4', 'a5', 'b1', 'b2', 'x'] });
    expect(o.readIds).toEqual(['a1']);
    expect(o.favIds).toEqual(['b1']);
    expect(o.recentIds).toHaveLength(6);
  });
  it('список покупок: только корректные записи', () => {
    const o = store.sanitizeSaved({ shopping: [
      { key: 'мука|г', name: 'Мука', qty: 500, unit: 'г', done: true, src: ['i52', 'zzz'] },
      { name: 'Картофель', qty: [600, 700], unit: 'г' },
      { name: 'Соль', qty: null, unit: 'по вкусу' },
      { name: '', qty: 1, unit: 'шт' }, { name: 'Яд', qty: -1, unit: 'г' }, { name: 'Х', qty: 'много', unit: 'г' }, 42,
    ] });
    expect(o.shopping).toHaveLength(3);
    expect(o.shopping[0]).toEqual({ key: 'мука|г', name: 'Мука', qty: 500, unit: 'г', done: true, src: ['i52'] });
    expect(o.shopping[1]).toMatchObject({ key: 'картофель|г', done: false, src: [] });
  });
  it('заметки и продукты для подбора проверяются', () => {
    const o = store.sanitizeSaved({ notes: { i1: 'меньше соли', zzz: 'x', i2: '   ', i3: 5 }, fridge: ['potato', 'potato', 'Bad Id', 7, 'eggs'] });
    expect(o.notes).toEqual({ i1: 'меньше соли' });
    expect(o.fridge).toEqual(['potato', 'eggs']);
  });
  it('меню на неделю проверяется', () => {
    const o = store.sanitizeSaved({ menu: { mon: [{ id: 'i1', servings: 3 }, { id: 'nope', servings: 1 }] } });
    expect(o.menu.mon).toEqual([{ id: 'i1', servings: 3 }]);
    expect(o.menu.sun).toEqual([]);
  });
  it('ограничивает размер шрифта и принимает только известные темы', () => {
    expect(store.sanitizeSaved({ fontScale: 9 }).fontScale).toBe(1.4);
    expect(store.sanitizeSaved({ fontScale: 0.1 }).fontScale).toBe(0.85);
    expect(store.sanitizeSaved({ theme: 'neon' }).theme).toBeUndefined();
    expect(store.sanitizeSaved({ theme: 'dark' }).theme).toBe('dark');
  });
  it('пропускает только корректные ответы на вопросы', () => {
    const o = store.sanitizeSaved({ quizScores: { a1: 0, a2: 99, a3: 'x', zzz: 0 } });
    expect(o.quizScores).toEqual({ a1: 0 });
  });
  it('журнал: обрезка полей, уникальные id, не больше 500 записей', () => {
    const big = Array.from({ length: 600 }, (_, i) => ({ id: 7, dish: 'Блюдо ' + i, ing: 'x'.repeat(5000) }));
    const j = store.sanitizeSaved({ journal: [...big, 'мусор'] }).journal;
    expect(j).toHaveLength(500);
    expect(new Set(j.map(x => x.id)).size).toBe(500);
    expect(j[0].ing).toHaveLength(2000);
    expect(j[0].result).toBe('');
  });
  it('калькулятор: числа как строки, неизвестная единица → г', () => {
    const o = store.sanitizeSaved({ recipeItems: [{ name: 'Мука', amount: '1,5', unit: 'кг' }], bakerFlour: 'abc', basePortions: 4 });
    expect(o.recipeItems).toEqual([{ name: 'Мука', amount: '1.5', unit: 'г' }]);
    expect(o.bakerFlour).toBe('');
    expect(o.basePortions).toBe('4');
  });
  it('snapshot → sanitizeSaved не теряет данные', () => {
    store.state.favIds.push('a2'); store.state.quizScores.a1 = 1; store.state.theme = 'dark';
    const back = store.sanitizeSaved(JSON.parse(JSON.stringify(store.snapshot())));
    expect(back.favIds).toEqual(['a2']);
    expect(back.quizScores).toEqual({ a1: 1 });
    expect(back.journal).toHaveLength(1);
  });
});

describe('loadState / saveState', () => {
  it('без сохранённых данных: тема по системной настройке', async () => {
    window.matchMedia = () => ({ matches: true });
    await store.loadState();
    expect(store.state.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
  it('загружает сохранённые данные', async () => {
    localStorage.setItem(KEY, JSON.stringify({ schema: 2, favIds: ['c1'], fontScale: 1.25 }));
    await store.loadState();
    expect(store.state.favIds).toEqual(['c1']);
    expect(store.state.fontScale).toBe(1.25);
    expect(store.getPendingMsg()).toBe('');
  });
  it('повреждённые данные откладываются в копию, приложение стартует с чистого листа', async () => {
    localStorage.setItem(KEY, '{не json');
    await store.loadState();
    expect(localStorage.getItem(KEY + '_corrupt')).toBe('{не json');
    expect(store.getPendingMsg()).toMatch(/не удалось прочитать/);
    expect(store.state.favIds).toEqual([]);
  });
  it('данные от более новой версии не затирают текущие', async () => {
    localStorage.setItem(KEY, JSON.stringify({ schema: 99, favIds: ['a1'] }));
    await store.loadState();
    expect(store.state.favIds).toEqual([]);
    expect(localStorage.getItem(KEY + '_corrupt')).toContain('"schema":99');
  });
  it('saveState пишет снимок в localStorage', () => {
    store.state.readIds.push('a3');
    expect(store.saveState()).toBe(true);
    const saved = JSON.parse(localStorage.getItem(KEY));
    expect(saved.schema).toBe(store.SCHEMA);
    expect(saved.readIds).toEqual(['a3']);
  });
  it('ошибка записи: false и одно предупреждение', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(store.saveState()).toBe(false);
    expect(document.getElementById('toast').textContent).toMatch(/Не удалось сохранить/);
    expect(spy).toHaveBeenCalled();
  });
  it('setTheme и setFontScale применяются и сохраняются', () => {
    store.setTheme('dark'); store.setFontScale(1.12);
    expect(document.documentElement.style.getPropertyValue('--font-scale')).toBe('1.12');
    expect(JSON.parse(localStorage.getItem(KEY))).toMatchObject({ theme: 'dark', fontScale: 1.12 });
  });
});
