// Общие утилиты: числа и оценка времени чтения
export const MAXV = 1e6;
export function normQ(s) { return String(s || '').trim().toLowerCase().replace(/ё/g, 'е'); }
export function num(v) { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : NaN; }
export function fmt(n, d = 1) { return Number.isFinite(n) ? n.toLocaleString('ru-RU', { maximumFractionDigits: d }) : '—'; }
// Время чтения считается один раз на статью: в списке Библиотеки это вызывается для каждой карточки
const minCache = new WeakMap();
export function readMin(a) {
  if (minCache.has(a)) return minCache.get(a);
  const w = [a.what, a.why, a.factors, a.practice, a.mistakes, a.experiment, a.limitations, a.summary].join(' ').split(/\s+/).length;
  const m = Math.max(1, Math.round(w / 170));
  minCache.set(a, m);
  return m;
}
export function tileOf(sec) { return sec === 'E' ? 't-chem' : sec === 'G' ? 't-phys' : sec === 'H' ? 't-exp' : sec === 'I' ? 't-dish' : sec === 'J' ? 't-skill' : sec === 'K' ? 't-jar' : 't-tech'; }
export function glyphOf(sec) { return sec === 'E' ? 'atom' : sec === 'G' ? 'therm' : sec === 'H' ? 'flask' : sec === 'I' ? 'pan' : sec === 'J' ? 'therm' : sec === 'K' ? 'jar' : 'hat'; }
export const paragraphs = text => String(text || '').split(/\n\n+/).filter(Boolean);
