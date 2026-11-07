// Меню на неделю: блюда по дням с числом порций и список покупок на всю неделю.
import { scaleIngredients, addToList } from './ingredients.js';

export const DAYS = [['mon', 'Пн', 'Понедельник'], ['tue', 'Вт', 'Вторник'], ['wed', 'Ср', 'Среда'], ['thu', 'Чт', 'Четверг'], ['fri', 'Пт', 'Пятница'], ['sat', 'Сб', 'Суббота'], ['sun', 'Вс', 'Воскресенье']];
export const DAY_IDS = DAYS.map(d => d[0]);

/** Пустое меню на неделю */
export const emptyMenu = () => Object.fromEntries(DAY_IDS.map(d => [d, []]));

/** Добавляет блюдо в день; если оно там уже есть — прибавляет порции. Возвращает новое меню. */
export function addToMenu(menu, day, id, servings) {
  const m = { ...emptyMenu(), ...menu };
  const list = [...(m[day] || [])];
  const ex = list.find(x => x.id === id);
  if (ex) list[list.indexOf(ex)] = { id, servings: Math.min(50, ex.servings + servings) };
  else list.push({ id, servings });
  return { ...m, [day]: list };
}

/** Сколько всего блюд в меню */
export const menuCount = menu => DAY_IDS.reduce((n, d) => n + (menu?.[d]?.length || 0), 0);

/**
 * Список покупок на неделю: порции одного блюда за разные дни складываются,
 * затем ингредиенты пересчитываются и добавляются в список (одинаковые продукты объединяются).
 */
export function menuToShopping(menu, articles, list = []) {
  const total = new Map();
  for (const d of DAY_IDS) for (const x of menu?.[d] || []) total.set(x.id, (total.get(x.id) || 0) + x.servings);
  let out = list;
  for (const [id, servings] of total) {
    const a = articles.find(y => y.id === id);
    if (a?.ingredients) out = addToList(out, scaleIngredients(a.ingredients, servings), id);
  }
  return out;
}

/** Проверка сохранённого меню: только известные дни, существующие блюда с ингредиентами, 1–50 порций */
export function sanitizeMenu(m, articles) {
  if (!m || typeof m !== 'object' || Array.isArray(m)) return null;
  const ok = new Set(articles.filter(a => a.ingredients).map(a => a.id));
  const out = emptyMenu();
  for (const d of DAY_IDS) {
    if (!Array.isArray(m[d])) continue;
    out[d] = m[d].filter(x => x && ok.has(x.id) && Number.isInteger(x.servings) && x.servings >= 1 && x.servings <= 50).slice(0, 20).map(x => ({ id: x.id, servings: x.servings }));
  }
  return out;
}
