// Примерная пищевая ценность блюда на порцию по средним табличным данным.
// Ингредиенты «по вкусу», «для жарки» и т. п. (без количества) не учитываются.
import TABLE from './data/nutrition.json';

const RULES = TABLE.map(x => ({ ...x, re: new RegExp(x.match, 'i') }));
const ML = { 'мл': 1, 'л': 1000, 'ст. л.': 15, 'ч. л.': 5, 'стакан': 200 };

/** Название без пояснений в скобках, в нижнем регистре */
const clean = name => name.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();

/** Строка таблицы для ингредиента (или null) */
export function findFood(name) {
  const n = clean(name);
  return RULES.find(r => r.re.test(n)) || null;
}

/** Масса ингредиента в граммах (или null, если её не понять) */
export function grams(qty, unit, food) {
  if (qty === null || qty === undefined) return 0;
  const q = Array.isArray(qty) ? (qty[0] + qty[1]) / 2 : qty;
  if (unit === 'г') return q;
  if (unit === 'кг') return q * 1000;
  if (ML[unit]) return q * ML[unit] * (food?.d ?? 1);
  if (unit === 'шт') return food?.piece ? q * food.piece : null;
  if (unit === 'зубчик') return q * 5;
  if (unit === 'пучок') return q * 30;
  if (unit === 'банка') return q * (food?.jar ?? 250);
  return null;
}

/**
 * Пищевая ценность на одну порцию: { kcal, p, f, c } (округлено) или null,
 * если хотя бы один ингредиент с количеством не удалось распознать.
 */
export function perServing(ing) {
  if (!ing?.items?.length) return null;
  const sum = { kcal: 0, p: 0, f: 0, c: 0 };
  for (const [name, qty, unit] of ing.items.map(x => (Array.isArray(x) ? x : [x.name, x.qty, x.unit]))) {
    if (qty === null || qty === undefined) continue;
    const food = findFood(name);
    const g = grams(qty, unit, food);
    if (!food || g === null) return null;
    for (const k of Object.keys(sum)) sum[k] += food[k] * g / 100;
  }
  const n = ing.servings || 1;
  return { kcal: Math.round(sum.kcal / n / 10) * 10, p: Math.round(sum.p / n), f: Math.round(sum.f / n), c: Math.round(sum.c / n) };
}

// Калорийность статьи из справочника не меняется — считаем один раз
const cache = new WeakMap();
/** Пищевая ценность блюда на порцию (с кэшем) или null — для научных статей, заготовок и нераспознанных составов */
export function dishNutrition(a) {
  if (!a || a.sec !== 'I' || !a.ingredients) return null;
  if (!cache.has(a)) cache.set(a, perServing(a.ingredients));
  return cache.get(a);
}

/**
 * Калорийность дня меню на одного человека — по одной порции каждого блюда:
 * [{ id, servings }] → { kcal, unknown } (unknown — сколько блюд без расчёта)
 */
export function dayKcal(items, find) {
  let kcal = 0, unknown = 0;
  for (const x of items || []) {
    const n = dishNutrition(find(x.id));
    if (n) kcal += n.kcal; else unknown++;
  }
  return { kcal: Math.round(kcal / 10) * 10, unknown };
}
