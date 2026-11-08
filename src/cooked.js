// «Приготовил»: история приготовленных блюд с датой и оценкой.
// Запись: { id, date: 'ГГГГ-ММ-ДД', rating: 1–5 | null }. Новые — в начале списка.

const MAX = 500;
export const today = (now = new Date()) => {
  const z = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(now.getDate())}`;
};

/** Добавляет запись; повторная отметка того же блюда в тот же день обновляет оценку */
export function addCooked(list, id, rating = null, date = today()) {
  const r = Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
  const rest = (list || []).filter(x => !(x.id === id && x.date === date));
  return [{ id, date, rating: r }, ...rest].slice(0, MAX);
}

/** Сводка по блюду: сколько раз, когда последний раз, последняя оценка */
export function cookedStats(list, id) {
  const mine = (list || []).filter(x => x.id === id);
  if (!mine.length) return null;
  const last = mine.reduce((a, b) => (b.date > a.date ? b : a));
  const rated = mine.find(x => x.rating !== null);
  return { times: mine.length, last: last.date, rating: rated ? rated.rating : null };
}

/** Сколько дней прошло с даты */
export function daysSince(date, now = new Date()) {
  const [y, m, d] = date.split('-').map(Number);
  return Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(y, m - 1, d)) / 864e5);
}

/**
 * «Давно не готовили»: блюда, которые понравились (оценка 4–5 или готовили не меньше двух раз),
 * но последний раз были не меньше чем `days` дней назад. Сначала самые давние.
 */
export function staleFavorites(list, { days = 14, limit = 5, now = new Date(), exists = () => true } = {}) {
  const ids = [...new Set((list || []).map(x => x.id))].filter(exists);
  return ids
    .map(id => ({ id, ...cookedStats(list, id) }))
    .filter(s => (s.rating >= 4 || s.times >= 2) && daysSince(s.last, now) >= days)
    .sort((a, b) => (a.last < b.last ? -1 : 1))
    .slice(0, limit);
}

/** Проверка сохранённой истории */
export function sanitizeCooked(list, isKnown) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter(x => x && typeof x === 'object' && isKnown(x.id) && typeof x.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.date))
    .map(x => ({ id: x.id, date: x.date, rating: Number.isInteger(x.rating) && x.rating >= 1 && x.rating <= 5 ? x.rating : null }))
    .filter(x => { const k = x.id + x.date; if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, MAX);
}

const MONTHS = ['янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня', 'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
/** «сегодня», «вчера», «3 нояб.», «3 нояб. 2025» (если год другой) */
export function fmtDate(date, now = new Date()) {
  const n = daysSince(date, now);
  if (n === 0) return 'сегодня';
  if (n === 1) return 'вчера';
  const [y, m, d] = date.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}${y !== now.getFullYear() ? ' ' + y : ''}`;
}
